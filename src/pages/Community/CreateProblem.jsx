import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TOPICS } from '../../data/problems';
import styles from './CreateProblem.module.css';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function CreateProblem() {
  const { drafts, saveDraft, deleteDraft } = useApp();
  const [form, setForm] = useState({ name: '', statement: '', topic: '', difficulty: 'medium' });
  const [status, setStatus] = useState(null); // null | 'submitted' | 'saved' | 'saving'

  function update(field, val) { setForm(f => ({ ...f, [field]: val })); }

  async function save() {
    if (!form.name.trim()) return;
    setStatus('saving');
    try {
      await saveDraft({ ...form, status: 'draft' });
      setStatus('saved');
      setTimeout(() => setStatus(null), 2000);
    } catch {
      setStatus(null);
    }
  }

  async function submit() {
    if (!form.name.trim() || !form.statement.trim()) return;
    setStatus('saving');
    try {
      await saveDraft({ ...form, status: 'submitted' });
      setStatus('submitted');
      setForm({ name: '', statement: '', topic: '', difficulty: 'medium' });
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus(null);
    }
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Create Problem</h2>
      <p className={styles.sub}>Submit a problem to be reviewed for the platform.</p>

      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Problem Name</label>
          <input
            type="text"
            placeholder="e.g. Maximum Subarray Sum"
            value={form.name}
            onChange={e => update('name', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Problem Statement</label>
          <textarea
            rows={10}
            placeholder="Describe the problem clearly. Include input/output format, constraints, and example cases..."
            value={form.statement}
            onChange={e => update('statement', e.target.value)}
            className={styles.textarea}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Topic</label>
            <select value={form.topic} onChange={e => update('topic', e.target.value)}>
              <option value="">Select topic...</option>
              {TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Difficulty</label>
            <div className={styles.diffPicker}>
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  className={`${styles.diffBtn} ${form.difficulty === d ? styles[`diff_${d}`] : ''}`}
                  onClick={() => update('difficulty', d)}
                  type="button"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {status === 'submitted' && <div className={styles.statusMsg} style={{ color: 'var(--accent)' }}>✓ Problem submitted for review!</div>}
        {status === 'saved'     && <div className={styles.statusMsg} style={{ color: 'var(--text-dim)' }}>Draft saved.</div>}

        <div className={styles.buttons}>
          <button className="btn btn-accent" onClick={submit} disabled={status === 'saving'}>Submit</button>
          <button className="btn" onClick={save} disabled={status === 'saving'}>Save Draft</button>
          <button className="btn btn-ghost" onClick={() => setForm({ name: '', statement: '', topic: '', difficulty: 'medium' })}>
            Clear
          </button>
        </div>

        {drafts.length > 0 && (
          <div className={styles.draftsSection}>
            <div className="section-title">Saved Drafts ({drafts.length})</div>
            {drafts.map(d => (
              <div key={d.id} className={styles.draftRow}>
                <span className={styles.draftName}>{d.name || '(untitled)'}</span>
                <button className="btn btn-ghost" style={{ fontSize: 12 }}
                  onClick={() => setForm({ name: d.name, statement: d.statement, topic: d.topic, difficulty: d.difficulty })}>
                  Load
                </button>
                <button className="btn btn-danger" style={{ fontSize: 12 }} onClick={() => deleteDraft(d.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
