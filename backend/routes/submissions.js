import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const GLOT_BASE = 'https://glot.io/api/run';

// Judge0 language_id -> [glot language, filename]
const LANG_MAP = {
  54: ['cpp',    'main.cpp'],
  71: ['python', 'main.py'],
  62: ['java',   'Main.java'],
};

const COIN_MAP        = { easy: 10, medium: 25, hard: 50 };
const SOLVE_EASY_TASK = { id: 'solve_easy', reward: 15 };

function todayKey() { return new Date().toDateString(); }

async function runGlot(language, filename, code, stdin) {
  const res = await fetch(`${GLOT_BASE}/${language}/latest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: [{ name: filename, content: code }],
      stdin: stdin ?? '',
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    console.error('Glot error — HTTP', res.status, raw);
    throw Object.assign(new Error('Glot request failed'), { status: res.status, body: raw });
  }

  return JSON.parse(raw);
}

// GET /api/submissions/test — smoke-test Glot with a Python hello-world
router.get('/test', async (req, res) => {
  try {
    const result = await runGlot('python', 'main.py', 'print("hello")', '');
    console.log('Glot test result:', result);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message, body: err.body });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { code, language_id, problem_id } = req.body;
    if (!code || !language_id || !problem_id) {
      return res.status(400).json({ error: 'code, language_id, and problem_id are required' });
    }

    const langEntry = LANG_MAP[Number(language_id)];
    if (!langEntry) {
      return res.status(400).json({ error: `Unsupported language_id: ${language_id}` });
    }
    const [glotLang, filename] = langEntry;

    const problem = (await pool.query('SELECT * FROM problems WHERE id = $1', [problem_id])).rows[0];
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // ── 1. Execute via Glot ─────────────────────────────────────────────────
    let glotResult;
    try {
      glotResult = await runGlot(glotLang, filename, code, problem.sample_input || '');
    } catch (err) {
      return res.status(502).json({ error: 'Code execution failed', detail: err.message });
    }

    const stdout = (glotResult.stdout ?? '').trimEnd();
    const stderr = (glotResult.stderr ?? '').trimEnd();

    console.log('Glot run — lang:', glotLang, 'stdout:', stdout.slice(0, 200), 'stderr:', stderr.slice(0, 200));

    // ── 2. Determine verdict ────────────────────────────────────────────────
    const expected = (problem.sample_output ?? '').trimEnd();
    let verdict;
    if (stderr && !stdout) {
      verdict = 'Compilation Error';
    } else {
      verdict = stdout === expected ? 'Accepted' : 'Wrong Answer';
    }
    const accepted = verdict === 'Accepted';

    // ── 3. Save submission ──────────────────────────────────────────────────
    await pool.query(
      `INSERT INTO submissions (user_id, problem_id, language_id, code, verdict, stdout, stderr, time_ms, memory_kb)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [req.user.id, problem_id, Number(language_id), code, verdict, stdout, stderr, null, null]
    );

    // ── 4. Award coins on first solve ───────────────────────────────────────
    let coins      = null;
    let dailyState = null;

    if (accepted) {
      const prev = (await pool.query(
        'SELECT status FROM user_problem_status WHERE user_id = $1 AND problem_id = $2',
        [req.user.id, problem_id]
      )).rows[0];

      await pool.query(
        `INSERT INTO user_problem_status (user_id, problem_id, status, solved_at)
         VALUES ($1,$2,'solved',$3)
         ON CONFLICT (user_id, problem_id) DO UPDATE SET status='solved', solved_at=EXCLUDED.solved_at`,
        [req.user.id, problem_id, new Date().toISOString()]
      );

      if (prev?.status !== 'solved') {
        const earned = COIN_MAP[problem.difficulty] || 10;
        await pool.query('UPDATE users SET coins = coins + $1 WHERE id = $2', [earned, req.user.id]);

        if (problem.difficulty === 'easy') {
          const today = todayKey();
          const done  = (await pool.query(
            'SELECT 1 FROM daily_completions WHERE user_id=$1 AND task_id=$2 AND date=$3',
            [req.user.id, SOLVE_EASY_TASK.id, today]
          )).rows[0];
          if (!done) {
            await pool.query(
              'INSERT INTO daily_completions (user_id, task_id, date) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
              [req.user.id, SOLVE_EASY_TASK.id, today]
            );
            await pool.query('UPDATE users SET coins = coins + $1 WHERE id = $2', [SOLVE_EASY_TASK.reward, req.user.id]);
          }
        }

        const userRow = (await pool.query('SELECT coins FROM users WHERE id = $1', [req.user.id])).rows[0];
        coins = userRow.coins;

        const doneRows = (await pool.query(
          'SELECT task_id FROM daily_completions WHERE user_id=$1 AND date=$2',
          [req.user.id, todayKey()]
        )).rows;
        dailyState = { date: todayKey(), completed: Object.fromEntries(doneRows.map(r => [r.task_id, true])) };
      }
    }

    res.json({ verdict, stdout, stderr, time: null, memory: null, accepted, coins, dailyState });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Server error during judging' });
  }
});

export default router;
