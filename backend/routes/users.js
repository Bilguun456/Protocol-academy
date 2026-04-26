import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function formatUser(u) {
  return {
    id: u.id, name: u.username, avatar: u.avatar, avatarBg: u.avatar_bg,
    coins: u.coins, rank: u.rank, diagnostic: u.diagnostic,
    joinDate: u.join_date, country: u.country, stars: u.stars,
  };
}

router.get('/:username', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const statuses = db.prepare(
    `SELECT ups.problem_id, p.difficulty
     FROM user_problem_status ups
     JOIN problems p ON p.id = ups.problem_id
     WHERE ups.user_id = ? AND ups.status = 'solved'`
  ).all(user.id);

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
});

router.put('/me', requireAuth, (req, res) => {
  const FIELD_MAP = { avatar: 'avatar', avatarBg: 'avatar_bg', country: 'country', rank: 'rank', diagnostic: 'diagnostic' };
  const setClauses = [];
  const params = [];

  for (const [jsKey, col] of Object.entries(FIELD_MAP)) {
    if (req.body[jsKey] !== undefined) {
      setClauses.push(`${col} = ?`);
      params.push(req.body[jsKey]);
    }
  }

  if (setClauses.length > 0) {
    params.push(req.user.id);
    db.prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: formatUser(user) });
});

export default router;
