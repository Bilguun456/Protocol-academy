import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const COIN_MAP = { easy: 10, medium: 25, hard: 50 };
const DAILY_TASKS = [
  { id: 'solve_easy', label: 'Solve 1 easy problem', reward: 15, icon: '✓' },
  { id: 'visit_arena', label: 'Visit the Arena', reward: 10, icon: '⚔' },
  { id: 'search_problem', label: 'Search for a problem', reward: 5, icon: '⊕' },
];

function todayKey() { return new Date().toDateString(); }

router.get('/status', requireAuth, async (req, res) => {
  try {
    const rows = (await pool.query(
      'SELECT problem_id, status FROM user_problem_status WHERE user_id = $1',
      [req.user.id]
    )).rows;
    const statuses = {};
    rows.forEach(r => { statuses[r.problem_id] = { status: r.status }; });
    res.json({ statuses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/bookmarks', requireAuth, async (req, res) => {
  try {
    const rows = (await pool.query('SELECT problem_id FROM bookmarks WHERE user_id = $1', [req.user.id])).rows;
    res.json({ bookmarks: rows.map(r => r.problem_id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/bookmark', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const exists = (await pool.query(
      'SELECT 1 FROM bookmarks WHERE user_id = $1 AND problem_id = $2',
      [req.user.id, id]
    )).rows[0];

    if (exists) {
      await pool.query('DELETE FROM bookmarks WHERE user_id = $1 AND problem_id = $2', [req.user.id, id]);
      res.json({ bookmarked: false });
    } else {
      await pool.query(
        'INSERT INTO bookmarks (user_id, problem_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.user.id, id]
      );
      res.json({ bookmarked: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/upvotes', requireAuth, async (req, res) => {
  try {
    const [totalsRes, myVotesRes] = await Promise.all([
      pool.query('SELECT problem_id, COUNT(*)::int AS cnt FROM problem_upvotes GROUP BY problem_id'),
      pool.query('SELECT problem_id FROM problem_upvotes WHERE user_id = $1', [req.user.id]),
    ]);
    const mySet = new Set(myVotesRes.rows.map(r => r.problem_id));
    const votes = {};
    totalsRes.rows.forEach(r => {
      votes[r.problem_id]            = r.cnt;
      votes[r.problem_id + '_voted'] = mySet.has(r.problem_id);
    });
    mySet.forEach(pid => { if (!votes[pid + '_voted']) votes[pid + '_voted'] = true; });
    res.json({ votes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/upvote', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const exists = (await pool.query(
      'SELECT 1 FROM problem_upvotes WHERE user_id = $1 AND problem_id = $2',
      [req.user.id, id]
    )).rows[0];

    if (exists) {
      await pool.query('DELETE FROM problem_upvotes WHERE user_id = $1 AND problem_id = $2', [req.user.id, id]);
    } else {
      await pool.query(
        'INSERT INTO problem_upvotes (user_id, problem_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.user.id, id]
      );
    }
    const total = parseInt((await pool.query(
      'SELECT COUNT(*)::int AS cnt FROM problem_upvotes WHERE problem_id = $1', [id]
    )).rows[0].cnt);
    res.json({ total, voted: !exists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!['untouched', 'attempted', 'solved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const problem = (await pool.query('SELECT * FROM problems WHERE id = $1', [id])).rows[0];
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const prev = (await pool.query(
      'SELECT status FROM user_problem_status WHERE user_id = $1 AND problem_id = $2',
      [req.user.id, id]
    )).rows[0];

    await pool.query(
      `INSERT INTO user_problem_status (user_id, problem_id, status, solved_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, problem_id) DO UPDATE SET status = EXCLUDED.status, solved_at = EXCLUDED.solved_at`,
      [req.user.id, id, status, status === 'solved' ? new Date().toISOString() : null]
    );

    let coinsEarned = 0;
    let dailyState  = null;

    if (status === 'solved' && prev?.status !== 'solved') {
      coinsEarned = COIN_MAP[problem.difficulty] || 10;
      await pool.query('UPDATE users SET coins = coins + $1 WHERE id = $2', [coinsEarned, req.user.id]);

      if (problem.difficulty === 'easy') {
        const today      = todayKey();
        const alreadyDone = (await pool.query(
          'SELECT 1 FROM daily_completions WHERE user_id = $1 AND task_id = $2 AND date = $3',
          [req.user.id, 'solve_easy', today]
        )).rows[0];

        if (!alreadyDone) {
          const task = DAILY_TASKS.find(t => t.id === 'solve_easy');
          await pool.query(
            'INSERT INTO daily_completions (user_id, task_id, date) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [req.user.id, 'solve_easy', today]
          );
          await pool.query('UPDATE users SET coins = coins + $1 WHERE id = $2', [task.reward, req.user.id]);
          coinsEarned += task.reward;

          const completedRows = (await pool.query(
            'SELECT task_id FROM daily_completions WHERE user_id = $1 AND date = $2',
            [req.user.id, today]
          )).rows;
          const completed = completedRows.reduce((acc, r) => ({ ...acc, [r.task_id]: true }), {});
          dailyState = { date: today, completed };
        }
      }
    }

    const user = (await pool.query('SELECT coins FROM users WHERE id = $1', [req.user.id])).rows[0];
    res.json({ coins: user.coins, dailyState });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
