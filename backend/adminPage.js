export const ADMIN_HTML = /* html */`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Protocol Academy — Admin</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Courier New',monospace;font-size:14px;background:#f5f6f8;color:#1e2329;line-height:1.5}
a{color:#1a7fd4}
input,textarea,select{font-family:inherit;font-size:13px;padding:7px 10px;border:1px solid #dde1e7;border-radius:3px;background:#fff;color:#1e2329;outline:none;width:100%;box-sizing:border-box}
input:focus,textarea:focus,select:focus{border-color:#1a7fd4;box-shadow:0 0 0 2px rgba(26,127,212,.12)}
textarea{resize:vertical}
button{font-family:inherit;font-size:13px;cursor:pointer;border-radius:3px;border:1px solid #dde1e7;padding:6px 14px;background:#fff;color:#1e2329;transition:all .15s}
button:hover{border-color:#1a7fd4;color:#1a7fd4}
button:disabled{opacity:.5;cursor:not-allowed}
.btn-accent{background:#1a7fd4;color:#fff;border-color:#1a7fd4;font-weight:600}
.btn-accent:hover{background:#1464ad;border-color:#1464ad;color:#fff}
.btn-danger{color:#dc2626;border-color:#dc2626;background:transparent}
.btn-danger:hover{background:#dc2626;color:#fff}
.btn-ghost{border-color:transparent;color:#6b7a8d;background:transparent}
.btn-ghost:hover{color:#1e2329;border-color:#dde1e7;background:#f8f9fa}

/* Login */
#login{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
.login-card{background:#fff;border:1px solid #dde1e7;border-radius:6px;padding:32px;width:100%;max-width:360px;box-shadow:0 2px 12px rgba(0,0,0,.08)}
.login-logo{font-size:16px;font-weight:700;color:#1e3a5f;margin-bottom:4px;letter-spacing:.05em}
.login-logo span{color:#1a7fd4}
.login-title{font-size:20px;font-weight:700;margin-bottom:20px;color:#1e2329}
.login-field{display:flex;flex-direction:column;gap:4px;margin-bottom:12px}
.login-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b7a8d}
.login-err{font-size:12px;color:#dc2626;padding:7px 10px;background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.2);border-radius:3px;margin-bottom:10px;display:none}

/* Panel */
#panel{display:none;padding:24px;max-width:1400px;margin:0 auto}
.topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px}
.page-title{font-size:20px;font-weight:700}
.subtitle{font-size:13px;color:#6b7a8d;margin-top:2px}
.err-banner{font-size:12px;color:#dc2626;padding:8px 12px;background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.2);border-radius:3px;margin-bottom:12px;display:none}

/* Table */
.table-wrap{background:#fff;border:1px solid #dde1e7;border-radius:4px;overflow:hidden}
.t-head{display:grid;grid-template-columns:110px 1fr 90px 150px 80px 150px;gap:8px;padding:8px 12px;background:#f8f9fa;border-bottom:1px solid #dde1e7;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b7a8d;align-items:center}
.t-row{display:grid;grid-template-columns:110px 1fr 90px 150px 80px 150px;gap:8px;padding:10px 12px;border-bottom:1px solid #dde1e7;align-items:center;font-size:13px;transition:background .1s}
.t-row:last-child{border-bottom:none}
.t-row:hover{background:#f8f9fa}
.t-id{font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:'Courier New',monospace;color:#6b7a8d}
.t-name{font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tag{display:inline-block;padding:2px 8px;border-radius:2px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
.tag-easy{background:rgba(22,163,74,.1);color:#16a34a}
.tag-medium{background:rgba(215,119,11,.1);color:#d97706}
.tag-hard{background:rgba(220,38,38,.1);color:#dc2626}
.t-cat{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.t-content{font-size:12px}
.has-content{color:#16a34a}
.no-content{color:#6b7a8d}
.t-actions{display:flex;gap:4px}
.t-actions button{padding:4px 10px;font-size:12px}
.empty-state{padding:40px;text-align:center;color:#6b7a8d}

/* Modal */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:100;display:none;align-items:flex-start;justify-content:center;padding:24px;overflow-y:auto}
.overlay.open{display:flex}
.modal{background:#fff;border:1px solid #dde1e7;border-radius:6px;padding:24px;width:100%;max-width:760px;margin:auto;box-shadow:0 8px 32px rgba(0,0,0,.18)}
.modal-title{font-size:18px;font-weight:700;margin-bottom:20px}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.form-full{grid-column:1/-1}
.field{display:flex;flex-direction:column;gap:4px}
.label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b7a8d}
.sample-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.modal-actions{display:flex;justify-content:flex-end;gap:8px;padding-top:16px;border-top:1px solid #dde1e7;margin-top:4px}
.form-err{font-size:12px;color:#dc2626;margin-bottom:8px;display:none}

/* Confirm modal */
.confirm-modal{background:#fff;border:1px solid #dde1e7;border-radius:6px;padding:28px;width:100%;max-width:380px;margin:auto;box-shadow:0 8px 32px rgba(0,0,0,.18)}
.confirm-title{font-size:16px;font-weight:700;color:#dc2626;margin-bottom:8px}
.confirm-text{font-size:13px;color:#6b7a8d;margin-bottom:20px;line-height:1.6}
.confirm-actions{display:flex;gap:8px}

@media(max-width:900px){
  .t-head,.t-row{grid-template-columns:90px 1fr 80px 120px 70px 120px}
}
@media(max-width:680px){
  .t-head{display:none}
  .t-row{grid-template-columns:1fr;gap:6px;padding:12px}
  .form-grid,.sample-grid{grid-template-columns:1fr}
}
</style>
</head>
<body>

<!-- LOGIN -->
<div id="login">
  <div class="login-card">
    <div class="login-logo">PROTOCOL<span>_</span>ACADEMY</div>
    <div class="login-title">Admin Panel</div>
    <div class="login-err" id="login-err"></div>
    <form id="login-form">
      <div class="login-field">
        <label class="login-label">Admin Password</label>
        <input type="password" id="pw-input" placeholder="Enter admin password" autocomplete="current-password" autofocus>
      </div>
      <button type="submit" class="btn-accent" style="width:100%;margin-top:4px" id="login-btn">Enter Admin Panel</button>
    </form>
  </div>
</div>

<!-- PANEL -->
<div id="panel">
  <div class="topbar">
    <div>
      <div class="page-title">Admin — Problems</div>
      <div class="subtitle" id="prob-count"></div>
    </div>
    <button class="btn-accent" onclick="openCreate()">+ New Problem</button>
  </div>
  <div class="err-banner" id="err-banner"></div>
  <div class="table-wrap" id="table-wrap">
    <div class="empty-state">Loading…</div>
  </div>
</div>

<!-- FORM MODAL -->
<div class="overlay" id="form-overlay">
  <div class="modal">
    <div class="modal-title" id="form-title">Create Problem</div>
    <div class="form-err" id="form-err"></div>
    <div class="form-grid">
      <div class="field form-full">
        <label class="label">Title</label>
        <input type="text" id="f-title" placeholder="Problem title">
      </div>
      <div class="field">
        <label class="label">Difficulty</label>
        <select id="f-difficulty">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div class="field">
        <label class="label">Category</label>
        <select id="f-category">
          <option>Introductory</option>
          <option>Sorting &amp; Searching</option>
          <option>DP</option>
          <option>Graph Algorithms</option>
          <option>Range Queries</option>
          <option>Tree Algorithms</option>
          <option>Mathematics</option>
        </select>
      </div>
      <div class="field form-full">
        <label class="label">Problem Statement</label>
        <textarea id="f-statement" rows="7" placeholder="Describe the problem…"></textarea>
      </div>
      <div class="field">
        <label class="label">Input Format</label>
        <textarea id="f-input_format" rows="4" placeholder="Describe the input…"></textarea>
      </div>
      <div class="field">
        <label class="label">Output Format</label>
        <textarea id="f-output_format" rows="4" placeholder="Describe the output…"></textarea>
      </div>
      <div class="field form-full">
        <label class="label">Constraints</label>
        <textarea id="f-constraints_text" rows="3" placeholder="e.g. 1 ≤ n ≤ 2×10^5"></textarea>
      </div>
    </div>
    <div class="sample-grid">
      <div class="field">
        <label class="label">Sample Input</label>
        <textarea id="f-sample_input" rows="5" placeholder="Paste sample input…" style="font-family:'Courier New',monospace;font-size:12px"></textarea>
      </div>
      <div class="field">
        <label class="label">Sample Output</label>
        <textarea id="f-sample_output" rows="5" placeholder="Expected output…" style="font-family:'Courier New',monospace;font-size:12px"></textarea>
      </div>
    </div>
    <div class="field" style="margin-bottom:14px">
      <label class="label">Explanation</label>
      <textarea id="f-explanation" rows="4" placeholder="Explain the sample case…"></textarea>
    </div>
    <div class="modal-actions">
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn-accent" id="save-btn" onclick="saveProblem()">Save</button>
    </div>
  </div>
</div>

<!-- CONFIRM DELETE MODAL -->
<div class="overlay" id="del-overlay">
  <div class="confirm-modal">
    <div class="confirm-title">Delete Problem?</div>
    <div class="confirm-text">This will permanently delete the problem and all associated user progress. This cannot be undone.</div>
    <div class="confirm-actions">
      <button style="flex:1" onclick="closeDelModal()">Cancel</button>
      <button class="btn-danger" style="flex:1" id="del-btn" onclick="confirmDelete()">Delete</button>
    </div>
  </div>
</div>

<script>
let adminPw = '';
let problems = [];
let editingId = null;
let deletingId = null;

// ── Auth ─────────────────────────────────────────────────────────────────────
document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const pw = document.getElementById('pw-input').value.trim();
  if (!pw) return;
  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.textContent = 'Verifying…';
  hideEl('login-err');
  try {
    const res = await apiFetch('/api/admin/problems', pw);
    adminPw = pw;
    problems = res.problems;
    showPanel();
  } catch (err) {
    showEl('login-err', err.message || 'Invalid password');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enter Admin Panel';
  }
});

function showPanel() {
  document.getElementById('login').style.display = 'none';
  document.getElementById('panel').style.display = 'block';
  renderTable();
}

// ── Table ─────────────────────────────────────────────────────────────────────
function renderTable() {
  document.getElementById('prob-count').textContent = problems.length + ' problems in database';
  const wrap = document.getElementById('table-wrap');
  if (!problems.length) {
    wrap.innerHTML = '<div class="empty-state">No problems yet. Create one above.</div>';
    return;
  }
  let html = \`<div class="t-head">
    <span>ID</span><span>Title</span><span>Difficulty</span>
    <span>Category</span><span>Content</span><span>Actions</span>
  </div>\`;
  for (const p of problems) {
    const hasContent = !!(p.statement || p.input_format || p.sample_input);
    html += \`<div class="t-row">
      <span class="t-id">\${esc(p.id)}</span>
      <span class="t-name">\${esc(p.name)}</span>
      <span><span class="tag tag-\${p.difficulty}">\${p.difficulty}</span></span>
      <span class="t-cat">\${esc(p.category || p.topic || '')}</span>
      <span class="t-content \${hasContent ? 'has-content' : 'no-content'}">\${hasContent ? '✓ Full' : '— Empty'}</span>
      <span class="t-actions">
        <button onclick="openEdit('\${esc(p.id)}')">Edit</button>
        <button class="btn-danger" onclick="openDelete('\${esc(p.id)}')">Delete</button>
      </span>
    </div>\`;
  }
  wrap.innerHTML = html;
}

// ── Create / Edit ─────────────────────────────────────────────────────────────
const FIELDS = ['title','difficulty','category','statement','input_format','output_format','constraints_text','sample_input','sample_output','explanation'];

function openCreate() {
  editingId = null;
  document.getElementById('form-title').textContent = 'Create Problem';
  document.getElementById('save-btn').textContent = 'Create Problem';
  FIELDS.forEach(f => {
    const el = document.getElementById('f-' + f);
    if (el) el.value = f === 'difficulty' ? 'easy' : f === 'category' ? 'Introductory' : '';
  });
  hideEl('form-err');
  openModal('form-overlay');
}

function openEdit(id) {
  const p = problems.find(x => x.id === id);
  if (!p) return;
  editingId = id;
  document.getElementById('form-title').textContent = 'Edit Problem';
  document.getElementById('save-btn').textContent = 'Save Changes';
  document.getElementById('f-title').value            = p.name || '';
  document.getElementById('f-difficulty').value       = p.difficulty || 'easy';
  document.getElementById('f-category').value         = p.category || p.topic || 'Introductory';
  document.getElementById('f-statement').value        = p.statement || '';
  document.getElementById('f-input_format').value     = p.input_format || '';
  document.getElementById('f-output_format').value    = p.output_format || '';
  document.getElementById('f-constraints_text').value = p.constraints_text || '';
  document.getElementById('f-sample_input').value     = p.sample_input || '';
  document.getElementById('f-sample_output').value    = p.sample_output || '';
  document.getElementById('f-explanation').value      = p.explanation || '';
  hideEl('form-err');
  openModal('form-overlay');
}

async function saveProblem() {
  const title = document.getElementById('f-title').value.trim();
  if (!title) { showEl('form-err', 'Title is required'); return; }
  const btn = document.getElementById('save-btn');
  btn.disabled = true;
  btn.textContent = 'Saving…';
  hideEl('form-err');
  const body = {};
  FIELDS.forEach(f => {
    const el = document.getElementById('f-' + f);
    body[f] = el ? el.value.trim() : '';
  });
  try {
    if (editingId) {
      const d = await apiFetch('/api/admin/problems/' + editingId, adminPw, 'PUT', body);
      problems = problems.map(p => p.id === editingId ? d.problem : p);
    } else {
      const d = await apiFetch('/api/admin/problems', adminPw, 'POST', body);
      problems = [...problems, d.problem];
    }
    closeModal();
    renderTable();
  } catch (err) {
    showEl('form-err', err.message || 'Save failed');
  } finally {
    btn.disabled = false;
    btn.textContent = editingId ? 'Save Changes' : 'Create Problem';
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
function openDelete(id) {
  deletingId = id;
  openModal('del-overlay');
}

async function confirmDelete() {
  if (!deletingId) return;
  const btn = document.getElementById('del-btn');
  btn.disabled = true;
  btn.textContent = 'Deleting…';
  try {
    await apiFetch('/api/admin/problems/' + deletingId, adminPw, 'DELETE');
    problems = problems.filter(p => p.id !== deletingId);
    closeDelModal();
    renderTable();
  } catch (err) {
    showBanner(err.message || 'Delete failed');
    closeDelModal();
  } finally {
    btn.disabled = false;
    btn.textContent = 'Delete';
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function apiFetch(path, pw, method = 'GET', body) {
  const opts = {
    method,
    headers: { 'X-Admin-Password': pw, 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const data = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal()   { document.getElementById('form-overlay').classList.remove('open'); }
function closeDelModal(){ document.getElementById('del-overlay').classList.remove('open'); deletingId = null; }

document.getElementById('form-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
document.getElementById('del-overlay').addEventListener('click',  e => { if (e.target === e.currentTarget) closeDelModal(); });

function showEl(id, msg) { const el = document.getElementById(id); el.textContent = msg; el.style.display = 'block'; }
function hideEl(id)      { document.getElementById(id).style.display = 'none'; }
function showBanner(msg) { showEl('err-banner', msg); setTimeout(() => hideEl('err-banner'), 5000); }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
</script>
</body>
</html>`;
