import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const allNews = db.prepare('SELECT * FROM news ORDER BY date DESC').all();
  const readRows = db.prepare('SELECT news_id FROM user_read_news WHERE user_id = ?').all(req.user.id);
  const readIds = readRows.map(r => r.news_id);
  const unreadCount = allNews.filter(n => !readIds.includes(n.id)).length;
  res.json({ news: allNews, readIds, unreadCount });
});

router.post('/read-all', requireAuth, (req, res) => {
  const allNews = db.prepare('SELECT id FROM news').all();
  const insert = db.prepare('INSERT OR IGNORE INTO user_read_news (user_id, news_id) VALUES (?, ?)');
  db.exec('BEGIN');
  allNews.forEach(n => insert.run(req.user.id, n.id));
  db.exec('COMMIT');
  res.json({ readIds: allNews.map(n => n.id), unreadCount: 0 });
});

export default router;
