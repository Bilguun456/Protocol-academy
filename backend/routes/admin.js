import { Router } from 'express';
import pool from '../db.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();
router.use(requireAdmin);

const CATEGORY_TO_TOPIC_ID = {
  'Introductory':      'intro',
  'Sorting & Searching': 'sorting',
  'DP':                'dp',
  'Graph Algorithms':  'graphs',
  'Range Queries':     'range',
  'Tree Algorithms':   'trees',
  'Mathematics':       'math',
};

router.get('/problems', async (req, res) => {
  try {
    const rows = (await pool.query('SELECT * FROM problems ORDER BY topic_id, difficulty, id')).rows;
    res.json({ problems: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/problems', async (req, res) => {
  try {
    const { title, difficulty, category, statement, input_format, output_format, constraints_text, sample_input, sample_output, explanation } = req.body;
    if (!title || !difficulty || !category) return res.status(400).json({ error: 'title, difficulty, and category are required' });

    const id       = `adm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const topic_id = CATEGORY_TO_TOPIC_ID[category] || 'intro';
    const points   = difficulty === 'easy' ? 100 : difficulty === 'medium' ? 200 : 300;

    const row = (await pool.query(
      `INSERT INTO problems
         (id, name, difficulty, topic_id, topic, statement, points, category, input_format, output_format, constraints_text, sample_input, sample_output, explanation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [id, title, difficulty, topic_id, category, statement || '', points, category, input_format || '', output_format || '', constraints_text || '', sample_input || '', sample_output || '', explanation || '']
    )).rows[0];

    res.status(201).json({ problem: row });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/problems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, difficulty, category, statement, input_format, output_format, constraints_text, sample_input, sample_output, explanation } = req.body;
    const topic_id = CATEGORY_TO_TOPIC_ID[category] || 'intro';
    const points   = difficulty === 'easy' ? 100 : difficulty === 'medium' ? 200 : 300;

    const row = (await pool.query(
      `UPDATE problems
       SET name=$1, difficulty=$2, topic_id=$3, topic=$4, statement=$5, points=$6,
           category=$7, input_format=$8, output_format=$9, constraints_text=$10,
           sample_input=$11, sample_output=$12, explanation=$13
       WHERE id=$14 RETURNING *`,
      [title, difficulty, topic_id, category, statement || '', points, category, input_format || '', output_format || '', constraints_text || '', sample_input || '', sample_output || '', explanation || '', id]
    )).rows[0];

    if (!row) return res.status(404).json({ error: 'Problem not found' });
    res.json({ problem: row });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/problems/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM problems WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
