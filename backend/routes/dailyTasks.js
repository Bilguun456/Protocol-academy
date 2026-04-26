import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const TASKS = [
  { id: 'solve_easy',     label: 'Solve 1 easy problem',  reward: 15, icon: '✓' },
  { id: 'visit_arena',    label: 'Visit the Arena',        reward: 10, icon: '⚔' },
  { id: 'search_problem', label: 'Search for a problem',   reward: 5,  icon: '⊕' },
];

function todayKey() { return new Date().toDateString(); }

function getUserDailyState(userId) {
  const today = todayKey();
  const rows = db.prepare(
    'SELECT task_id FROM daily_completions WHERE user_id = ? AND date = ?'
  ).all(userId, today);
  const completed = {};
  rows.forEach(r => { completed[r.task_id] = true; });
  return { date: today, completed };
}

// GET /api/daily-tasks
router.get('/', requireAuth, (req, res) => {
  res.json({ tasks: TASKS, state: getUserDailyState(req.user.id) });
});

// POST /api/daily-tasks/:taskId/complete
router.post('/:taskId/complete', requireAuth, (req, res) => {
  const task = TASKS.find(t => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ error: 'Unknown task' });

  const today = todayKey();
  const already = db.prepare(
    'SELECT 1 FROM daily_completions WHERE user_id = ? AND task_id = ? AND date = ?'
  ).get(req.user.id, task.id, today);

  if (!already) {
    db.prepare('INSERT OR IGNORE INTO daily_completions (user_id, task_id, date) VALUES (?, ?, ?)').run(req.user.id, task.id, today);
    db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(task.reward, req.user.id);
  }

  const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.user.id);
  res.json({ coins: user.coins, state: getUserDailyState(req.user.id) });
});

export default router;
