import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function formatDraft(row) {
  return {
    id:         row.id,
    name:       row.name,
    statement:  row.statement,
    topic:      row.topic_id,
    difficulty: row.difficulty,
    status:     row.status,
    savedAt:    row.saved_at,
  };
}

router.get('/drafts', requireAuth, async (req, res) => {
  try {
    const rows = (await pool.query(
      "SELECT * FROM community_problems WHERE author_id = $1 AND status = 'draft' ORDER BY saved_at DESC",
      [req.user.id]
    )).rows;
    res.json({ drafts: rows.map(formatDraft) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, statement, topic, difficulty, status } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ error: 'Problem name is required' });

    const { rows } = await pool.query(
      `INSERT INTO community_problems (author_id, name, statement, topic_id, difficulty, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        req.user.id,
        name.trim(),
        statement?.trim() || '',
        topic || '',
        ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
        status === 'submitted' ? 'submitted' : 'draft',
      ]
    );
    res.status(201).json({ draft: formatDraft(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const draft = (await pool.query(
      'SELECT * FROM community_problems WHERE id = $1 AND author_id = $2',
      [req.params.id, req.user.id]
    )).rows[0];
    if (!draft) return res.status(404).json({ error: 'Draft not found' });

    const FIELD_MAP = { name: 'name', statement: 'statement', topic: 'topic_id', difficulty: 'difficulty' };
    const setClauses = ['updated_at = NOW()'];
    const params = [];
    let i = 1;

    for (const [jsKey, col] of Object.entries(FIELD_MAP)) {
      if (req.body[jsKey] !== undefined) {
        setClauses.push(`${col} = $${i++}`);
        params.push(req.body[jsKey]);
      }
    }

    params.push(draft.id);
    const updated = (await pool.query(
      `UPDATE community_problems SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    )).rows[0];
    res.json({ draft: formatDraft(updated) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM community_problems WHERE id = $1 AND author_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Draft not found' });
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
