import { useState, useEffect } from 'react';
import { api } from '../api/client';
import styles from './Admin.module.css';

const CATEGORIES = [
  'Introductory',
  'Sorting & Searching',
  'DP',
  'Graph Algorithms',
  'Range Queries',
  'Tree Algorithms',
  'Mathematics',
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const EMPTY_FORM = {
  title: '',
  difficulty: 'easy',
  category: 'Introductory',
  statement: '',
  input_format: '',
  output_format: '',
  constraints_text: '',
  sample_input: '',
  sample_output: '',
  explanation: '',
};

export default function Admin() {
  const [pw, setPw]           = useState('');
  const [authed, setAuthed]   = useState(false);
  const [authErr, setAuthErr] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [problems, setProblems] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const [view, setView]     = useState('list'); // 'list' | 'create' | 'edit'
  const [form, setForm]     = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const [deleteId, setDeleteId]   = useState(null);
  const [deleting, setDeleting]   = useState(false);

  async function handleAuth(e) {
    e.preventDefault();
    if (!pw.trim()) return;
    setAuthLoading(true);
    setAuthErr('');
    try {
      const data = await api.adminGetProblems(pw);
      setProblems(data.problems);
      setAuthed(true);
    } catch {
      setAuthErr('Invalid admin password');
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadProblems() {
    setLoading(true);
    try {
      const data = await api.adminGetProblems(pw);
      setProblems(data.problems);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setSaveErr('');
    setView('create');
  }

  function openEdit(p) {
    setForm({
      title:            p.name,
      difficulty:       p.difficulty,
      category:         p.category || p.topic || 'Introductory',
      statement:        p.statement || '',
      input_format:     p.input_format || '',
      output_format:    p.output_format || '',
      constraints_text: p.constraints_text || '',
      sample_input:     p.sample_input || '',
      sample_output:    p.sample_output || '',
      explanation:      p.explanation || '',
    });
    setEditId(p.id);
    setSaveErr('');
    setView('edit');
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) { setSaveErr('Title is required'); return; }
    setSaving(true);
    setSaveErr('');
    try {
      if (view === 'create') {
        const d = await api.adminCreateProblem(pw, form);
        setProblems(prev => [...prev, d.problem]);
      } else {
        const d = await api.adminUpdateProblem(pw, editId, form);
        setProblems(prev => prev.map(p => p.id === editId ? d.problem : p));
      }
      setView('list');
    } catch (err) {
      setSaveErr(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.adminDeleteProblem(pw, deleteId);
      setProblems(prev => prev.filter(p => p.id !== deleteId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  if (!authed) {
    return (
      <div className={styles.loginWrap}>
        <div className={styles.loginCard}>
          <div className={styles.loginTitle}>Admin Panel</div>
          <form onSubmit={handleAuth} className={styles.loginForm}>
            <label className={styles.label}>Admin Password</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
            />
            {authErr && <div className={styles.errMsg}>{authErr}</div>}
            <button className="btn btn-accent" style={{ width: '100%' }} disabled={authLoading}>
              {authLoading ? 'Verifying…' : 'Enter Admin Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view !== 'list') {
    return (
      <div className="page-container">
        <div className={styles.topBar}>
          <button className="btn btn-ghost" onClick={() => setView('list')}>← Back</button>
          <h1 className={styles.pageTitle}>{view === 'create' ? 'Create Problem' : 'Edit Problem'}</h1>
        </div>

        <form onSubmit={handleSave} className={styles.formCard}>
          <div className={styles.formRow}>
            <div className={styles.fieldFull}>
              <label className={styles.label}>Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Problem title"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label}>Problem Statement</label>
            <textarea
              className={styles.bigTextarea}
              value={form.statement}
              onChange={e => setForm(f => ({ ...f, statement: e.target.value }))}
              placeholder="Describe the problem. Markdown is supported."
              rows={8}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Input Format</label>
              <textarea
                value={form.input_format}
                onChange={e => setForm(f => ({ ...f, input_format: e.target.value }))}
                placeholder="Describe the input"
                rows={4}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Output Format</label>
              <textarea
                value={form.output_format}
                onChange={e => setForm(f => ({ ...f, output_format: e.target.value }))}
                placeholder="Describe the output"
                rows={4}
              />
            </div>
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label}>Constraints</label>
            <textarea
              value={form.constraints_text}
              onChange={e => setForm(f => ({ ...f, constraints_text: e.target.value }))}
              placeholder="e.g. 1 ≤ n ≤ 2×10^5"
              rows={3}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Sample Input</label>
              <textarea
                className={styles.monoTextarea}
                value={form.sample_input}
                onChange={e => setForm(f => ({ ...f, sample_input: e.target.value }))}
                placeholder="Paste sample input"
                rows={5}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Sample Output</label>
              <textarea
                className={styles.monoTextarea}
                value={form.sample_output}
                onChange={e => setForm(f => ({ ...f, sample_output: e.target.value }))}
                placeholder="Expected output"
                rows={5}
              />
            </div>
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label}>Explanation</label>
            <textarea
              value={form.explanation}
              onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
              placeholder="Explain the sample case"
              rows={4}
            />
          </div>

          {saveErr && <div className={styles.errMsg}>{saveErr}</div>}

          <div className={styles.formActions}>
            <button type="button" className="btn" onClick={() => setView('list')}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={saving}>
              {saving ? 'Saving…' : view === 'create' ? 'Create Problem' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Admin — Problems</h1>
          <p className={styles.subtitle}>{problems.length} problems in database</p>
        </div>
        <button className="btn btn-accent" onClick={openCreate}>+ New Problem</button>
      </div>

      {error && <div className={styles.errMsg} style={{ marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading…</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span className={styles.colId}>ID</span>
            <span className={styles.colTitle}>Title</span>
            <span className={styles.colDiff}>Difficulty</span>
            <span className={styles.colCat}>Category</span>
            <span className={styles.colContent}>Content</span>
            <span className={styles.colActions}>Actions</span>
          </div>
          {problems.map(p => {
            const hasContent = !!(p.statement || p.input_format || p.sample_input);
            return (
              <div key={p.id} className={styles.tableRow}>
                <span className={styles.colId}><code style={{ fontSize: 11 }}>{p.id}</code></span>
                <span className={styles.colTitle}>{p.name}</span>
                <span className={styles.colDiff}>
                  <span className={`tag tag-${p.difficulty}`}>{p.difficulty}</span>
                </span>
                <span className={styles.colCat}>{p.category || p.topic}</span>
                <span className={styles.colContent}>
                  <span style={{ color: hasContent ? 'var(--green)' : 'var(--text-muted)', fontSize: 12 }}>
                    {hasContent ? '✓ Full' : '— Empty'}
                  </span>
                </span>
                <span className={styles.colActions}>
                  <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => openEdit(p)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setDeleteId(p.id)}>
                    Delete
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {deleteId && (
        <div className={styles.overlay} onClick={() => setDeleteId(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmTitle}>Delete Problem?</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              This will permanently delete the problem and all associated user progress. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
