import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function formatUser(u) {
  return {
    id: u.id, name: u.username, avatar: u.avatar, avatarBg: u.avatar_bg,
    coins: u.coins, rank: u.rank, diagnostic: u.diagnostic,
    joinDate: u.join_date, country: u.country, stars: u.stars,
  };
}

router.get('/:username', async (req, res) => {
  try {
    const user = (await pool.query('SELECT * FROM users WHERE username = $1', [req.params.username])).rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const statuses = (await pool.query(
      `SELECT ups.problem_id, p.difficulty
       FROM user_problem_status ups
       JOIN problems p ON p.id = ups.problem_id
       WHERE ups.user_id = $1 AND ups.status = 'solved'`,
      [user.id]
    )).rows;

    const solved = { easy: 0, medium: 0, hard: 0, total: statuses.length };
    statuses.forEach(s => { if (s.difficulty in solved) solved[s.difficulty]++; });

    res.json({
      user: {
        name: user.username, avatar: user.avatar, avatarBg: user.avatar_bg,
        rank: user.rank, diagnostic: user.diagnostic, joinDate: user.join_date,
        country: user.country, coins: user.coins, stars: user.stars, online: false,
      },
      solved,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/me', requireAuth, async (req, res) => {
  try {
    const FIELD_MAP = { avatar: 'avatar', avatarBg: 'avatar_bg', country: 'country', rank: 'rank', diagnostic: 'diagnostic' };
    const setClauses = [];
    const params = [];
    let i = 1;

    for (const [jsKey, col] of Object.entries(FIELD_MAP)) {
      if (req.body[jsKey] !== undefined) {
        setClauses.push(`${col} = $${i++}`);
        params.push(req.body[jsKey]);
      }
    }

    if (setClauses.length > 0) {
      params.push(req.user.id);
      await pool.query(`UPDATE users SET ${setClauses.join(', ')} WHERE id = $${i}`, params);
    }

    const user = (await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id])).rows[0];
    res.json({ user: formatUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
