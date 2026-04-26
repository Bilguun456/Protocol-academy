import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const COIN_MAP = { easy: 10, medium: 25, hard: 50 };
const DAILY_TASKS = [
  { id: 'solve_easy', label: 'Solve 1 easy problem', reward: 15, icon: '✓' },
  { id: 'visit_arena', label: 'Visit the Arena', reward: 10, icon: '⚔' },
  { id: 'search_problem', label: 'Search for a problem', reward: 5, icon: '⊕' },
];

function todayKey() { return new Date().toDateString(); }

// GET /api/problems/status — all of user's problem statuses
router.get('/status', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT problem_id, status FROM user_problem_status WHERE user_id = ?').all(req.user.id);
  const statuses = {};
  rows.forEach(r => { statuses[r.problem_id] = { status: r.status }; });
  res.json({ statuses });
});

// GET /api/problems/bookmarks
router.get('/bookmarks', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT problem_id FROM bookmarks WHERE user_id = ?').all(req.user.id);
  res.json({ bookmarks: rows.map(r => r.problem_id) });
});

// POST /api/problems/:id/bookmark — toggle
router.post('/:id/bookmark', requireAuth, (req, res) => {
  const { id } = req.params;
  const exists = db.prepare('SELECT 1 FROM bookmarks WHERE user_id = ? AND problem_id = ?').get(req.user.id, id);
  if (exists) {
    db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND problem_id = ?').run(req.user.id, id);
    res.json({ bookmarked: false });
  } else {
    db.prepare('INSERT OR IGNORE INTO bookmarks (user_id, problem_id) VALUES (?, ?)').run(req.user.id, id);
    res.json({ bookmarked: true });
  }
});

// GET /api/problems/upvotes
router.get('/upvotes', requireAuth, (req, res) => {
  const totals = db.prepare('SELECT problem_id, COUNT(*) as cnt FROM problem_upvotes GROUP BY problem_id').all();
  const myVotes = db.prepare('SELECT problem_id FROM problem_upvotes WHERE user_id = ?').all(req.user.id);
  const mySet = new Set(myVotes.map(r => r.problem_id));

  const votes = {};
  totals.forEach(r => {
    votes[r.problem_id] = r.cnt;
    votes[r.problem_id + '_voted'] = mySet.has(r.problem_id);
  });
  // Also include user-voted problems not in totals (shouldn't happen, but safe)
  mySet.forEach(pid => { if (!votes[pid + '_voted']) votes[pid + '_voted'] = true; });

  res.json({ votes });
});

// POST /api/problems/:id/upvote — toggle
router.post('/:id/upvote', requireAuth, (req, res) => {
  const { id } = req.params;
  const exists = db.prepare('SELECT 1 FROM problem_upvotes WHERE user_id = ? AND problem_id = ?').get(req.user.id, id);
  if (exists) {
    db.prepare('DELETE FROM problem_upvotes WHERE user_id = ? AND problem_id = ?').run(req.user.id, id);
  } else {
    db.prepare('INSERT OR IGNORE INTO problem_upvotes (user_id, problem_id) VALUES (?, ?)').run(req.user.id, id);
  }
  const total = db.prepare('SELECT COUNT(*) as cnt FROM problem_upvotes WHERE problem_id = ?').get(id).cnt;
  res.json({ total, voted: !exists });
});

// PUT /api/problems/:id/status
router.put('/:id/status', requireAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!['untouched', 'attempted', 'solved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const prev = db.prepare('SELECT status FROM user_problem_status WHERE user_id = ? AND problem_id = ?').get(req.user.id, id);

  db.prepare(
    `INSERT INTO user_problem_status (user_id, problem_id, status, solved_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, problem_id) DO UPDATE SET status = excluded.status, solved_at = excluded.solved_at`
  ).run(req.user.id, id, status, status === 'solved' ? new Date().toISOString() : null);

  let coinsEarned = 0;
  let dailyState = null;

  if (status === 'solved' && prev?.status !== 'solved') {
    coinsEarned = COIN_MAP[problem.difficulty] || 10;
    db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(coinsEarned, req.user.id);

    // Auto-complete solve_easy daily task for easy problems
    if (problem.difficulty === 'easy') {
      const today = todayKey();
      const alreadyDone = db.prepare(
        'SELECT 1 FROM daily_completions WHERE user_id = ? AND task_id = ? AND date = ?'
      ).get(req.user.id, 'solve_easy', today);

      if (!alreadyDone) {
        const task = DAILY_TASKS.find(t => t.id === 'solve_easy');
        db.prepare('INSERT OR IGNORE INTO daily_completions (user_id, task_id, date) VALUES (?, ?, ?)').run(req.user.id, 'solve_easy', today);
        db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(task.reward, req.user.id);
        coinsEarned += task.reward;

        const completed = db.prepare(
          'SELECT task_id FROM daily_completions WHERE user_id = ? AND date = ?'
        ).all(req.user.id, today).reduce((acc, r) => ({ ...acc, [r.task_id]: true }), {});
        dailyState = { date: today, completed };
      }
    }
  }

  const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.user.id);
  res.json({ coins: user.coins, dailyState });
});

export default router;
