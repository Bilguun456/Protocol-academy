import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { TOPICS } from '../../data/problems';
import styles from './SavedProblems.module.css';

export default function SavedProblems() {
  const { drafts, loadDrafts, updateDraft, deleteDraft } = useApp();
  const navigate = useNavigate();
  const [editId, setEditId]           = useState(null);
  const [editForm, setEditForm]       = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    loadDrafts().catch(() => {}).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(draft) {
    setEditId(draft.id);
    setEditForm({ name: draft.name, statement: draft.statement, topic: draft.topic, difficulty: draft.difficulty });
  }

  async function saveEdit() {
    await updateDraft(editId, editForm);
    setEditId(null);
  }

  async function handleDelete(id) {
    await deleteDraft(id);
    setDeleteConfirm(null);
  }

  function update(field, val) { setEditForm(f => ({ ...f, [field]: val })); }

  if (loading) {
    return <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>Loading drafts…</div>;
  }

  if (drafts.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>☆</div>
        <div className={styles.emptyTitle}>No saved drafts</div>
        <p className={styles.emptyDesc}>Go to Create Problem and save a draft to see it here.</p>
        <button className="btn btn-accent" onClick={() => navigate('/community/create')}>Create Problem</button>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Saved Drafts</h2>
        <span className={styles.count}>{drafts.length} draft{drafts.length !== 1 ? 's' : ''}</span>
      </div>

      <div className={styles.list}>
        {drafts.map(draft => (
          <div key={draft.id} className={styles.draftCard}>
            {editId === draft.id ? (
              <div className={styles.editForm}>
                <input type="text" value={editForm.name} onChange={e => update('name', e.target.value)}
                  placeholder="Problem name" className={styles.editTitle} />
                <textarea rows={5} value={editForm.statement} onChange={e => update('statement', e.target.value)}
                  placeholder="Problem statement..." className={styles.editTextarea} />
                <div className={styles.editRow}>
                  <select value={editForm.topic} onChange={e => update('topic', e.target.value)}>
                    <option value="">Select topic...</option>
                    {TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <select value={editForm.difficulty} onChange={e => update('difficulty', e.target.value)}>
                    {['easy', 'medium', 'hard'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className={styles.editActions}>
                  <button className="btn btn-accent" onClick={saveEdit}>Save</button>
                  <button className="btn btn-ghost" onClick={() => setEditId(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.draftMain}>
                  <div className={styles.draftName}>{draft.name || '(untitled)'}</div>
                  <div className={styles.draftMeta}>
                    {draft.topic && <span className={styles.metaTag}>{draft.topic}</span>}
                    {draft.difficulty && <span className={`tag tag-${draft.difficulty}`}>{draft.difficulty}</span>}
                    <span className={styles.savedAt}>{new Date(draft.savedAt).toLocaleDateString()}</span>
                  </div>
                  {draft.statement && (
                    <p className={styles.draftPreview}>
                      {draft.statement.slice(0, 120)}{draft.statement.length > 120 ? '…' : ''}
                    </p>
                  )}
                </div>
                <div className={styles.draftActions}>
                  <button className="btn" style={{ fontSize: 12 }} onClick={() => startEdit(draft)}>Edit</button>
                  {deleteConfirm === draft.id ? (
                    <div className={styles.confirmRow}>
                      <span className={styles.confirmText}>Delete?</span>
                      <button className="btn btn-danger" style={{ fontSize: 12 }} onClick={() => handleDelete(draft.id)}>Yes</button>
                      <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setDeleteConfirm(null)}>No</button>
                    </div>
                  ) : (
                    <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setDeleteConfirm(draft.id)}>Delete</button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
