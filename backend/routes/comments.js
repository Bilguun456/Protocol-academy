import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/:problemId', requireAuth, async (req, res) => {
  try {
    const rows = (await pool.query(
      `SELECT c.id, c.text, c.created_at, u.username, u.avatar
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.problem_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.problemId]
    )).rows;

    res.json({
      comments: rows.map(r => ({
        id:     r.id,
        user:   r.username,
        avatar: r.avatar,
        text:   r.text,
        ts:     new Date(r.created_at).getTime(),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:problemId', requireAuth, async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text?.trim()) return res.status(400).json({ error: 'Comment text is required' });

    const [commentRes, userRes] = await Promise.all([
      pool.query(
        'INSERT INTO comments (problem_id, user_id, text) VALUES ($1, $2, $3) RETURNING *',
        [req.params.problemId, req.user.id, text.trim()]
      ),
      pool.query('SELECT avatar FROM users WHERE id = $1', [req.user.id]),
    ]);

    const row = commentRes.rows[0];
    res.status(201).json({
      comment: {
        id:     row.id,
        user:   req.user.username,
        avatar: userRes.rows[0].avatar,
        text:   row.text,
        ts:     new Date(row.created_at).getTime(),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
