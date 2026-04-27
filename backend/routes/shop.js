import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/items', async (req, res) => {
  try {
    const items = (await pool.query('SELECT * FROM shop_items ORDER BY section, price')).rows;
    res.json({
      items: items.map(i => ({
        id: i.id, name: i.name, description: i.description,
        category: i.category, section: i.section,
        price: i.price, salePrice: i.sale_price ?? undefined,
        preview: i.preview,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/purchases', requireAuth, async (req, res) => {
  try {
    const rows = (await pool.query('SELECT item_id FROM user_purchases WHERE user_id = $1', [req.user.id])).rows;
    res.json({ itemIds: rows.map(r => r.item_id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/purchase/:itemId', requireAuth, async (req, res) => {
  try {
    const item = (await pool.query('SELECT * FROM shop_items WHERE id = $1', [req.params.itemId])).rows[0];
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const already = (await pool.query(
      'SELECT 1 FROM user_purchases WHERE user_id = $1 AND item_id = $2',
      [req.user.id, item.id]
    )).rows[0];
    if (already) return res.status(409).json({ error: 'Already owned' });

    const cost = item.sale_price ?? item.price;
    const user = (await pool.query('SELECT coins FROM users WHERE id = $1', [req.user.id])).rows[0];
    if (user.coins < cost) return res.status(402).json({ error: 'Not enough coins' });

    await pool.query('UPDATE users SET coins = coins - $1 WHERE id = $2', [cost, req.user.id]);
    await pool.query('INSERT INTO user_purchases (user_id, item_id) VALUES ($1, $2)', [req.user.id, item.id]);

    const updated = (await pool.query('SELECT coins FROM users WHERE id = $1', [req.user.id])).rows[0];
    res.json({ coins: updated.coins, itemId: item.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
