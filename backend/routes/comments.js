import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/comments/:problemId
router.get('/:problemId', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT c.id, c.text, c.created_at, u.username, u.avatar
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.problem_id = ?
    ORDER BY c.created_at ASC
  `).all(req.params.problemId);

  const comments = rows.map(r => ({
    id: r.id,
    user: r.username,
    avatar: r.avatar,
    text: r.text,
    ts: new Date(r.created_at).getTime(),
  }));

  res.json({ comments });
});

// POST /api/comments/:problemId
router.post('/:problemId', requireAuth, (req, res) => {
  const { text } = req.body || {};
  if (!text?.trim()) return res.status(400).json({ error: 'Comment text is required' });

  const result = db.prepare(
    'INSERT INTO comments (problem_id, user_id, text) VALUES (?, ?, ?)'
  ).run(req.params.problemId, req.user.id, text.trim());

  const user = db.prepare('SELECT avatar FROM users WHERE id = ?').get(req.user.id);
  const row = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({
    comment: {
      id: row.id,
      user: req.user.username,
      avatar: user.avatar,
      text: row.text,
      ts: new Date(row.created_at).getTime(),
    },
  });
});

export default router;
