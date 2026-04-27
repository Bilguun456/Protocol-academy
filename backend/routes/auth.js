import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function formatUser(u) {
  return {
    id: u.id,
    name: u.username,
    avatar: u.avatar,
    avatarBg: u.avatar_bg,
    coins: u.coins,
    rank: u.rank,
    diagnostic: u.diagnostic,
    joinDate: u.join_date,
    country: u.country,
    stars: u.stars,
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'username, email and password are required' });
    }
    if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
    if (password.length < 6)  return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const exists = (await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email.trim().toLowerCase()]
    )).rows[0];
    if (exists) return res.status(409).json({ error: 'Username or email already taken' });

    const hash     = await bcrypt.hash(password, 10);
    const joinDate = new Date().toISOString().slice(0, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (username, email, password_hash, avatar, join_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username.trim(), email.trim().toLowerCase(), hash, username[0].toUpperCase(), joinDate]
    );
    const user = rows[0];
    res.status(201).json({ token: signToken(user), user: formatUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password are required' });

    const user = (await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $1',
      [username]
    )).rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ token: signToken(user), user: formatUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = (await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id])).rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: formatUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
