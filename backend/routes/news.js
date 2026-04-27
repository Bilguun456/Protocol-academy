import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [newsRes, readRes] = await Promise.all([
      pool.query('SELECT * FROM news ORDER BY date DESC'),
      pool.query('SELECT news_id FROM user_read_news WHERE user_id = $1', [req.user.id]),
    ]);
    const readIds    = readRes.rows.map(r => r.news_id);
    const unreadCount = newsRes.rows.filter(n => !readIds.includes(n.id)).length;
    res.json({ news: newsRes.rows, readIds, unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/read-all', requireAuth, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO user_read_news (user_id, news_id)
       SELECT $1, id FROM news
       ON CONFLICT DO NOTHING`,
      [req.user.id]
    );
    const readIds = (await pool.query(
      'SELECT news_id FROM user_read_news WHERE user_id = $1', [req.user.id]
    )).rows.map(r => r.news_id);
    res.json({ readIds, unreadCount: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
