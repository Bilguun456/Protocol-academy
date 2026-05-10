import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

// Judge0 language_id -> Piston language name
const LANG_MAP = {
  54: 'cpp',
  71: 'python',
  62: 'java',
};

const COIN_MAP       = { easy: 10, medium: 25, hard: 50 };
const SOLVE_EASY_TASK = { id: 'solve_easy', reward: 15 };

function todayKey() { return new Date().toDateString(); }

async function runPiston(language, code, stdin) {
  const res = await fetch(PISTON_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language,
      version: '*',
      files: [{ content: code }],
      stdin: stdin ?? '',
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    console.error('Piston error — HTTP', res.status, raw);
    throw Object.assign(new Error('Piston request failed'), { status: res.status, body: raw });
  }

  return JSON.parse(raw);
}

// GET /api/submissions/test — smoke-test Piston with a Python hello-world
router.get('/test', async (req, res) => {
  try {
    const result = await runPiston('python', 'print("hello")', '');
    console.log('Piston test result:', result);
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

    const pistonLang = LANG_MAP[Number(language_id)];
    if (!pistonLang) {
      return res.status(400).json({ error: `Unsupported language_id: ${language_id}` });
    }

    const problem = (await pool.query('SELECT * FROM problems WHERE id = $1', [problem_id])).rows[0];
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // ── 1. Execute via Piston ───────────────────────────────────────────────
    let pistonResult;
    try {
      pistonResult = await runPiston(pistonLang, code, problem.sample_input || '');
    } catch (err) {
      return res.status(502).json({ error: 'Code execution failed', detail: err.message });
    }

    const run    = pistonResult.run ?? {};
    const stdout = (run.stdout ?? '').trimEnd();
    const stderr = (run.stderr ?? '') + (pistonResult.compile?.stderr ?? '');
    const exitCode = run.code ?? run.exit_code ?? 1;

    console.log('Piston run — lang:', pistonLang, 'exit:', exitCode, 'stdout:', stdout.slice(0, 200));

    // ── 2. Determine verdict ────────────────────────────────────────────────
    const expected = (problem.sample_output ?? '').trimEnd();
    let verdict;
    if (exitCode !== 0) {
      verdict = stderr.includes('error:') || pistonResult.compile?.code !== 0
        ? 'Compilation Error'
        : 'Runtime Error';
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
