import { Router } from 'express';
import db from '../db.js';

const router = Router();

const VALID_SORTS = ['solved', 'coins', 'diagnostic', 'stars'];

router.get('/', (req, res) => {
  const sort = VALID_SORTS.includes(req.query.sort) ? req.query.sort : 'solved';

  let orderExpr;
  if (sort === 'solved') {
    orderExpr = 'solved DESC';
  } else {
    orderExpr = `u.${sort} DESC`;
  }

  const rows = db.prepare(`
    SELECT
      u.id, u.username, u.avatar, u.avatar_bg, u.country,
      u.rank, u.diagnostic, u.coins, u.stars, u.join_date,
      COUNT(CASE WHEN ups.status = 'solved' THEN 1 END) AS solved
    FROM users u
    LEFT JOIN user_problem_status ups ON ups.user_id = u.id
    GROUP BY u.id
    ORDER BY ${orderExpr}, u.diagnostic DESC
    LIMIT 50
  `).all();

  const users = rows.map((u, i) => ({
    id: u.id,
    name: u.username,
    avatar: u.avatar,
    avatarBg: u.avatar_bg,
    country: u.country,
    rank: u.rank,
    diagnostic: u.diagnostic,
    coins: u.coins,
    stars: u.stars,
    solved: u.solved,
    online: false,
    weeklyChange: 0,
    position: i + 1,
  }));

  res.json({ users, sort });
});

export default router;
