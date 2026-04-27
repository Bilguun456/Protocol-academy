import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const TASKS = [
  { id: 'solve_easy',     label: 'Solve 1 easy problem',  reward: 15, icon: '✓' },
  { id: 'visit_arena',    label: 'Visit the Arena',        reward: 10, icon: '⚔' },
  { id: 'search_problem', label: 'Search for a problem',   reward: 5,  icon: '⊕' },
];

function todayKey() { return new Date().toDateString(); }

async function getUserDailyState(userId) {
  const today = todayKey();
  const rows  = (await pool.query(
    'SELECT task_id FROM daily_completions WHERE user_id = $1 AND date = $2',
    [userId, today]
  )).rows;
  const completed = {};
  rows.forEach(r => { completed[r.task_id] = true; });
  return { date: today, completed };
}

router.get('/', requireAuth, async (req, res) => {
  try {
    res.json({ tasks: TASKS, state: await getUserDailyState(req.user.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:taskId/complete', requireAuth, async (req, res) => {
  try {
    const task = TASKS.find(t => t.id === req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Unknown task' });

    const today   = todayKey();
    const already = (await pool.query(
      'SELECT 1 FROM daily_completions WHERE user_id = $1 AND task_id = $2 AND date = $3',
      [req.user.id, task.id, today]
    )).rows[0];

    if (!already) {
      await pool.query(
        'INSERT INTO daily_completions (user_id, task_id, date) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [req.user.id, task.id, today]
      );
      await pool.query('UPDATE users SET coins = coins + $1 WHERE id = $2', [task.reward, req.user.id]);
    }

    const user  = (await pool.query('SELECT coins FROM users WHERE id = $1', [req.user.id])).rows[0];
    res.json({ coins: user.coins, state: await getUserDailyState(req.user.id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
