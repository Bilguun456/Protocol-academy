import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const JUDGE0_HOST = 'https://judge0-ce.p.rapidapi.com';

const STATUS_LABEL = {
  3:  'Accepted',
  4:  'Wrong Answer',
  5:  'Time Limit Exceeded',
  6:  'Compilation Error',
  7:  'Runtime Error',
  8:  'Runtime Error',
  9:  'Runtime Error',
  10: 'Runtime Error',
  11: 'Runtime Error',
  12: 'Runtime Error',
  13: 'Internal Error',
  14: 'Exec Format Error',
};

const COIN_MAP  = { easy: 10, medium: 25, hard: 50 };
const SOLVE_EASY_TASK = { id: 'solve_easy', reward: 15 };

function todayKey() { return new Date().toDateString(); }
function b64(s)     { return Buffer.from(s ?? '').toString('base64'); }
function unb64(s)   { return s ? Buffer.from(s, 'base64').toString('utf8') : ''; }

// GET /api/submissions/test — smoke-test the Judge0 connection
router.get('/test', async (req, res) => {
  const apiKey = process.env.JUDGE0_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'JUDGE0_API_KEY not set' });

  try {
    const testRes = await fetch(`${JUDGE0_HOST}/submissions?base64_encoded=true&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'X-RapidAPI-Key':  apiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        source_code:  b64('print("hello")'),
        language_id:  71, // Python 3
        stdin:        b64(''),
      }),
    });

    const raw = await testRes.text();
    console.log('Judge0 test response status:', testRes.status);
    console.log('Judge0 test response body:', raw);

    let parsed;
    try { parsed = JSON.parse(raw); } catch { parsed = null; }

    res.json({
      judge0_status: testRes.status,
      judge0_ok: testRes.ok,
      judge0_headers: Object.fromEntries(testRes.headers.entries()),
      judge0_body: parsed ?? raw,
    });
  } catch (err) {
    console.error('Judge0 test fetch error:', err);
    res.status(502).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { code, language_id, problem_id } = req.body;
    if (!code || !language_id || !problem_id) {
      return res.status(400).json({ error: 'code, language_id, and problem_id are required' });
    }

    const problem = (await pool.query('SELECT * FROM problems WHERE id = $1', [problem_id])).rows[0];
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const apiKey = process.env.JUDGE0_API_KEY;
    if (!apiKey) return res.status(503).json({ error: 'Code execution not configured (JUDGE0_API_KEY missing)' });

    // ── 1. Create submission ────────────────────────────────────────────────
    const submitUrl = `${JUDGE0_HOST}/submissions?base64_encoded=true&wait=false`;
    const submitBody = {
      source_code:     b64(code),
      language_id:     Number(language_id),
      stdin:           b64(problem.sample_input || ''),
      expected_output: b64((problem.sample_output || '').trim()),
    };
    console.log('Judge0 POST', submitUrl, 'language_id:', submitBody.language_id);

    const createRes = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'X-RapidAPI-Key':  apiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify(submitBody),
    });

    const createText = await createRes.text();
    if (!createRes.ok) {
      console.error('Judge0 create failed — HTTP', createRes.status);
      console.error('Judge0 response headers:', Object.fromEntries(createRes.headers.entries()));
      console.error('Judge0 response body:', createText);
      return res.status(502).json({
        error: 'Submission to judge failed',
        judge0_status: createRes.status,
        judge0_body: createText,
      });
    }

    let createJson;
    try { createJson = JSON.parse(createText); } catch (e) {
      console.error('Judge0 create — non-JSON response:', createText);
      return res.status(502).json({ error: 'Judge returned non-JSON response', body: createText });
    }

    const { token } = createJson;
    if (!token) {
      console.error('Judge0 create — no token in response:', createJson);
      return res.status(502).json({ error: 'No token returned from judge', body: createJson });
    }

    // ── 2. Poll until done ──────────────────────────────────────────────────
    let result = null;
    for (let attempt = 0; attempt < 20; attempt++) {
      await new Promise(r => setTimeout(r, 1500));
      const pollRes = await fetch(
        `${JUDGE0_HOST}/submissions/${token}?base64_encoded=true&fields=status,stdout,stderr,compile_output,time,memory`,
        {
          headers: {
            'X-RapidAPI-Key':  apiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
        }
      );
      result = await pollRes.json();
      if (result.status?.id >= 3) break;
    }

    if (!result?.status || result.status.id < 3) {
      return res.status(504).json({ error: 'Judging timed out — try again' });
    }

    // ── 3. Parse result ─────────────────────────────────────────────────────
    const statusId = result.status.id;
    const verdict  = STATUS_LABEL[statusId] || result.status.description || 'Unknown';
    const stdout   = unb64(result.stdout);
    const stderr   = unb64(result.stderr) || unb64(result.compile_output);
    const timeSec  = result.time ? parseFloat(result.time) : null;
    const memKb    = result.memory ?? null;
    const accepted = statusId === 3;

    // ── 4. Save submission ──────────────────────────────────────────────────
    await pool.query(
      `INSERT INTO submissions (user_id, problem_id, language_id, code, verdict, stdout, stderr, time_ms, memory_kb)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [req.user.id, problem_id, Number(language_id), code, verdict, stdout, stderr,
       timeSec != null ? Math.round(timeSec * 1000) : null, memKb]
    );

    // ── 5. Award coins on first solve ───────────────────────────────────────
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

    res.json({ verdict, stdout, stderr, time: timeSec, memory: memKb, accepted, coins, dailyState });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Server error during judging' });
  }
});

export default router;
