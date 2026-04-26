import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/shop/items
router.get('/items', (req, res) => {
  const items = db.prepare('SELECT * FROM shop_items ORDER BY section, price').all();
  res.json({
    items: items.map(i => ({
      id: i.id, name: i.name, description: i.description,
      category: i.category, section: i.section,
      price: i.price, salePrice: i.sale_price ?? undefined,
      preview: i.preview,
    })),
  });
});

// GET /api/shop/purchases — current user's owned item IDs
router.get('/purchases', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT item_id FROM user_purchases WHERE user_id = ?').all(req.user.id);
  res.json({ itemIds: rows.map(r => r.item_id) });
});

// POST /api/shop/purchase/:itemId
router.post('/purchase/:itemId', requireAuth, (req, res) => {
  const item = db.prepare('SELECT * FROM shop_items WHERE id = ?').get(req.params.itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const already = db.prepare('SELECT 1 FROM user_purchases WHERE user_id = ? AND item_id = ?').get(req.user.id, item.id);
  if (already) return res.status(409).json({ error: 'Already owned' });

  const cost = item.sale_price ?? item.price;
  const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.user.id);
  if (user.coins < cost) return res.status(402).json({ error: 'Not enough coins' });

  db.prepare('UPDATE users SET coins = coins - ? WHERE id = ?').run(cost, req.user.id);
  db.prepare('INSERT INTO user_purchases (user_id, item_id) VALUES (?, ?)').run(req.user.id, item.id);

  const updated = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.user.id);
  res.json({ coins: updated.coins, itemId: item.id });
});

export default router;
