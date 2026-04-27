import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const VALID_SORTS = ['solved', 'coins', 'diagnostic', 'stars'];

router.get('/', async (req, res) => {
  try {
    const sort = VALID_SORTS.includes(req.query.sort) ? req.query.sort : 'solved';
    const orderExpr = sort === 'solved' ? 'solved DESC' : `u.${sort} DESC`;

    const rows = (await pool.query(`
      SELECT
        u.id, u.username, u.avatar, u.avatar_bg, u.country,
        u.rank, u.diagnostic, u.coins, u.stars, u.join_date,
        COUNT(CASE WHEN ups.status = 'solved' THEN 1 END)::int AS solved
      FROM users u
      LEFT JOIN user_problem_status ups ON ups.user_id = u.id
      GROUP BY u.id
      ORDER BY ${orderExpr}, u.diagnostic DESC
      LIMIT 50
    `)).rows;

    const users = rows.map((u, i) => ({
      id:          u.id,
      name:        u.username,
      avatar:      u.avatar,
      avatarBg:    u.avatar_bg,
      country:     u.country,
      rank:        u.rank,
      diagnostic:  u.diagnostic,
      coins:       u.coins,
      stars:       u.stars,
      solved:      u.solved,
      online:      false,
      weeklyChange: 0,
      position:    i + 1,
    }));

    res.json({ users, sort });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
