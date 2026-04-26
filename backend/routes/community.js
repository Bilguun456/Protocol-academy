import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function formatDraft(row) {
  return {
    id: row.id, name: row.name, statement: row.statement,
    topic: row.topic_id, difficulty: row.difficulty,
    status: row.status, savedAt: row.saved_at,
  };
}

router.get('/drafts', requireAuth, (req, res) => {
  const rows = db.prepare(
    "SELECT * FROM community_problems WHERE author_id = ? AND status = 'draft' ORDER BY saved_at DESC"
  ).all(req.user.id);
  res.json({ drafts: rows.map(formatDraft) });
});

router.post('/', requireAuth, (req, res) => {
  const { name, statement, topic, difficulty, status } = req.body || {};
  if (!name?.trim()) return res.status(400).json({ error: 'Problem name is required' });

  const result = db.prepare(
    `INSERT INTO community_problems (author_id, name, statement, topic_id, difficulty, status)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    req.user.id,
    name.trim(),
    statement?.trim() || '',
    topic || '',
    ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
    status === 'submitted' ? 'submitted' : 'draft'
  );

  const row = db.prepare('SELECT * FROM community_problems WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ draft: formatDraft(row) });
});

router.put('/:id', requireAuth, (req, res) => {
  const draft = db.prepare('SELECT * FROM community_problems WHERE id = ? AND author_id = ?').get(req.params.id, req.user.id);
  if (!draft) return res.status(404).json({ error: 'Draft not found' });

  const FIELD_MAP = { name: 'name', statement: 'statement', topic: 'topic_id', difficulty: 'difficulty' };
  const setClauses = ['updated_at = datetime(\'now\')'];
  const params = [];

  for (const [jsKey, col] of Object.entries(FIELD_MAP)) {
    if (req.body[jsKey] !== undefined) {
      setClauses.push(`${col} = ?`);
      params.push(req.body[jsKey]);
    }
  }

  params.push(draft.id);
  db.prepare(`UPDATE community_problems SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare('SELECT * FROM community_problems WHERE id = ?').get(draft.id);
  res.json({ draft: formatDraft(updated) });
});

router.delete('/:id', requireAuth, (req, res) => {
  const result = db.prepare('DELETE FROM community_problems WHERE id = ? AND author_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Draft not found' });
  res.json({ deleted: true });
});

export default router;
