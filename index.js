const B2_API_URL = "https://api.backblazeb2.com";

async function b2Authorize(env) {
  const credentials = btoa(`${env.B2_APPLICATION_KEY_ID}:${env.B2_APPLICATION_KEY}`);
  const resp = await fetch(`${B2_API_URL}/b2api/v3/b2_authorize_account`, {
    headers: { "Authorization": `Basic ${credentials}` }
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`B2 auth failed: ${resp.status} ${err}`);
  }
  return resp.json();
}

async function getAuth(env) {
  const cached = await env.AUTH_CACHE.get("b2_auth");
  if (cached) return JSON.parse(cached);
  const auth = await b2Authorize(env);
  await env.AUTH_CACHE.put("b2_auth", JSON.stringify(auth), { expirationTtl: 3600 });
  return auth;
}

async function b2ListFileNames(env, prefix = "", maxFiles = 1000, startFileName = "") {
  const auth = await getAuth(env);
  const body = { bucketId: env.B2_BUCKET_ID, maxFileCount: maxFiles };
  if (prefix) body.prefix = prefix;
  if (startFileName) body.startFileName = startFileName;

  const resp = await fetch(`${auth.apiInfo.apiUrl}/b2api/v3/b2_list_file_names`, {
    method: "POST",
    headers: {
      "Authorization": auth.authorizationToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`B2 list failed: ${resp.status} ${err}`);
  }
  return resp.json();
}

async function listAllFiles(env, prefix) {
  const all = [];
  let start = "";
  while (true) {
    const page = await b2ListFileNames(env, prefix, 1000, start);
    all.push(...(page.files || []));
    if (!page.nextFileName) break;
    start = page.nextFileName;
  }
  return all;
}

async function findFileByName(env, fileName) {
  const page = await b2ListFileNames(env, fileName, 1000);
  return (page.files || []).find(f => f.fileName === fileName) || null;
}

async function b2CopyFile(env, sourceFileId, newFileName) {
  const auth = await getAuth(env);
  const resp = await fetch(`${auth.apiInfo.apiUrl}/b2api/v3/b2_copy_file`, {
    method: "POST",
    headers: {
      "Authorization": auth.authorizationToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sourceFileId, fileName: newFileName, bucketId: env.B2_BUCKET_ID })
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`B2 copy failed: ${resp.status} ${err}`);
  }
  return resp.json();
}

async function b2DeleteFile(env, fileName, fileId) {
  const auth = await getAuth(env);
  const resp = await fetch(`${auth.apiInfo.apiUrl}/b2api/v3/b2_delete_file_version`, {
    method: "POST",
    headers: {
      "Authorization": auth.authorizationToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fileName, fileId })
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`B2 delete failed: ${resp.status} ${err}`);
  }
  return resp.json();
}

async function b2DownloadFile(env, fileName, range) {
  const auth = await getAuth(env);
  const url = `${auth.downloadUrl}/file/${env.B2_BUCKET_NAME}/${fileName}`;
  const headers = { "Authorization": auth.authorizationToken };
  if (range) headers["Range"] = range;
  const resp = await fetch(url, { headers });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`B2 download failed: ${resp.status} ${err}`);
  }
  return resp;
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { ...cors(), "Content-Type": "application/json; charset=UTF-8" },
    status
  });
}

function errResponse(msg, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    headers: { ...cors(), "Content-Type": "application/json; charset=UTF-8" },
    status
  });
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=UTF-8", ...cors() },
    status
  });
}

function formatSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(i ? 1 : 0)} ${units[i]}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const CSS = `
:root {
  --bg: #0f172a;
  --card: #1e293b;
  --card-bg: rgba(30,41,59,0.85);
  --text: #e2e8f0;
  --text-muted: #94a3b8;
  --accent: #38bdf8;
  --accent-hover: #0ea5e9;
  --border: #334155;
  --success: #22c55e;
  --danger: #ef4444;
  --warning: #f59e0b;
  --radius: 10px;
  --shadow: 0 4px 24px rgba(0,0,0,0.3);
}
body.light {
  --bg: #f1f5f9;
  --card: #ffffff;
  --card-bg: rgba(255,255,255,0.9);
  --text: #1e293b;
  --text-muted: #64748b;
  --accent: #0284c7;
  --accent-hover: #0369a1;
  --border: #cbd5e1;
  --shadow: 0 4px 24px rgba(0,0,0,0.08);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  transition: background 0.3s, color 0.3s;
}
.toolbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 10px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.toolbar-group { display: flex; gap: 6px; align-items: center; }
.toolbar input, .toolbar select {
  padding: 7px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}
.toolbar input:focus { border-color: var(--accent); }
.toolbar button {
  padding: 7px 14px;
  border: none;
  border-radius: 6px;
  background: var(--accent);
  color: #000;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.toolbar button:hover { background: var(--accent-hover); transform: translateY(-1px); }
.toolbar button:active { transform: translateY(0); }
.toolbar .spacer { flex: 1; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
h1 { color: var(--accent); margin-bottom: 20px; font-size: 1.6em; }
h2 { margin: 30px 0 15px; color: var(--accent); font-size: 1.2em; }
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}
.card {
  background: var(--card-bg);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  box-shadow: var(--shadow);
}
.card .label { font-size: 13px; color: var(--text-muted); margin-bottom: 5px; }
.card .value { font-size: 1.8em; font-weight: 700; color: var(--accent); }
.card .sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.breadcrumbs { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 15px; font-size: 14px; }
.breadcrumbs a { color: var(--accent); text-decoration: none; padding: 3px 8px; border-radius: 4px; }
.breadcrumbs a:hover { background: rgba(56,189,248,0.15); }
.breadcrumbs .sep { color: var(--text-muted); }
table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
th, td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; }
th { background: var(--card); color: var(--text-muted); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
tr:nth-child(even) { background: rgba(128,128,128,0.05); }
tr:hover { background: rgba(56,189,248,0.08); }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
.name-cell { max-width: 420px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
.name-cell:hover { color: var(--accent-hover); }
.actions { display: flex; gap: 5px; }
.actions button, .actions a {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.actions button:hover, .actions a:hover { opacity: 0.8; }
.btn-view { background: var(--accent); color: #000; }
.btn-download { background: var(--success); color: #fff; }
.btn-rename { background: var(--warning); color: #000; }
.btn-move { background: #8b5cf6; color: #fff; }
.btn-delete { background: var(--danger); color: #fff; }
.modal-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  align-items: center;
  justify-content: center;
}
.modal-overlay.open { display: flex; }
.modal {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  width: 90%;
  max-width: 480px;
  box-shadow: var(--shadow);
}
.modal h3 { margin-bottom: 15px; color: var(--accent); }
.modal label { display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 5px; }
.modal input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  outline: none;
  margin-bottom: 15px;
}
.modal input:focus { border-color: var(--accent); }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary { background: var(--accent); color: #000; }
.btn-cancel { background: var(--bg); color: var(--text); border: 1px solid var(--border) !important; }
.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  font-size: 14px;
}
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: var(--accent);
  color: #000;
}
.hint { font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }
@media (max-width: 768px) {
  .toolbar { flex-direction: column; align-items: stretch; }
  .toolbar-group { flex-wrap: wrap; }
  .cards { grid-template-columns: repeat(2, 1fr); }
  table { font-size: 12px; }
  th, td { padding: 6px 8px; }
}
@media (max-width: 480px) {
  .cards { grid-template-columns: 1fr; }
  .container { padding: 10px; }
}
`;

function toolbarHTML() {
  return `
    <div class="toolbar">
      <div class="toolbar-group">
        <input type="text" id="searchInput" placeholder="Search files..." oninput="debounceSearch()" />
      </div>
      <div class="toolbar-group">
        <button onclick="location.reload()">🔄 Refresh</button>
        <button onclick="toggleTheme()" id="themeBtn">☀️</button>
      </div>
    </div>
  `;
}

function getFileIcon(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const icons = {
    pdf: '📄', doc: '📝', docx: '📝', txt: '📄', md: '📄', rtf: '📝',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️', webp: '🖼️', bmp: '🖼️', ico: '🖼️',
    mp4: '🎬', mov: '🎬', avi: '🎬', webm: '🎬', mkv: '🎬', m4v: '🎬',
    mp3: '🎵', wav: '🎵', flac: '🎵', ogg: '🎵', m4a: '🎵', aac: '🎵',
    zip: '📦', rar: '📦', '7z': '📦', tar: '📦', gz: '📦', bz2: '📦', xz: '📦',
    js: '⚙️', ts: '⚙️', json: '⚙️', html: '🌐', htm: '🌐', css: '🎨', xml: '⚙️',
    xlsx: '📊', xls: '📊', csv: '📊', pptx: '📊', ppt: '📊',
    exe: '⚙️', deb: '⚙️', apk: '📱', iso: '💿', img: '💿',
    png: '🖼️'
  };
  return icons[ext] || '📄';
}

function dashboardHTML(bucketInfo, items, path, search) {
  const segs = path ? path.split('/').filter(Boolean) : [];
  let acc = '';
  const crumbs = ['<a href="/">📦 Home</a>'];
  segs.forEach((s, i) => {
    acc += (acc ? '/' : '') + s;
    const label = i === segs.length - 1 ? `<span style="color:var(--text)">${escapeHtml(s)}</span>` : `<a href="/?path=${encodeURIComponent(acc)}">${escapeHtml(s)}</a>`;
    crumbs.push(`<span class="sep">/</span>${label}`);
  });

  const rows = (items || []).map(f => {
    const icon = f.isFolder ? '📁' : getFileIcon(f.fileName);
    const displayName = f.isFolder ? f.fileName.replace(/\/$/, '') : f.fileName.split('/').pop();
    const fullPath = f.fileName;
    const viewable = !f.isFolder && /^(image\/|text\/|application\/pdf|application\/json)/.test(f.contentType || '');
    const actions = f.isFolder
      ? `
        <button class="btn-rename" onclick="openRename('${escapeHtml(fullPath)}', true)" title="Rename folder">✏️</button>
        <button class="btn-move" onclick="openMove('${escapeHtml(fullPath)}', true)" title="Move folder">📂</button>
        <button class="btn-delete" onclick="deletePath('${escapeHtml(fullPath)}', true)" title="Delete folder">🗑️</button>`
      : `
        ${viewable ? `<a class="btn-view" href="/file/${encodeURIComponent(fullPath)}" target="_blank" title="View">👁️</a>` : ''}
        <a class="btn-download" href="/file/${encodeURIComponent(fullPath)}?dl=1" title="Download">⬇️</a>
        <button class="btn-rename" onclick="openRename('${escapeHtml(fullPath)}', false)" title="Rename">✏️</button>
        <button class="btn-move" onclick="openMove('${escapeHtml(fullPath)}', false)" title="Move">📂</button>
        <button class="btn-delete" onclick="deletePath('${escapeHtml(fullPath)}', false)" title="Delete">🗑️</button>`;
    return `
      <tr>
        <td style="white-space:nowrap">${icon}</td>
        <td class="name-cell" ${f.isFolder ? `onclick="openFolder('${escapeHtml(fullPath)}')"` : `onclick="openView('${escapeHtml(fullPath)}')"`} title="${escapeHtml(fullPath)}">${escapeHtml(displayName)}</td>
        <td>${f.isFolder ? '—' : (f.contentType || '—')}</td>
        <td style="text-align:right">${f.isFolder ? '—' : formatSize(f.contentLength)}</td>
        <td style="white-space:nowrap">${f.uploadTimestamp ? formatDate(f.uploadTimestamp) : '—'}</td>
        <td class="actions">${actions}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DriveBucket — B2 File Manager</title>
<style>${CSS}</style>
</head>
<body>
${toolbarHTML()}
<div class="container">
<h1>📦 DriveBucket — B2 File Manager</h1>

<div class="cards">
  <div class="card"><div class="label">Bucket</div><div class="value" style="font-size:1em">${escapeHtml(bucketInfo.bucketName)}</div></div>
  <div class="card"><div class="label">Files in this folder</div><div class="value">${(items || []).length}</div></div>
  <div class="card"><div class="label">Total Size</div><div class="value" style="font-size:1.2em">${formatSize(bucketInfo.totalSize)}</div></div>
</div>

<div class="breadcrumbs">${crumbs.join('')}</div>

<h2>📂 Files ${search ? `— matching "${escapeHtml(search)}"` : ''}</h2>
${search ? `<div class="hint">Showing all files matching "${escapeHtml(search)}" across the bucket. <a href="/">Clear search</a></div>` : ''}
<div style="overflow-x:auto">
<table>
<thead><tr><th>Type</th><th>Name</th><th>Content Type</th><th style="text-align:right">Size</th><th>Modified</th><th>Actions</th></tr></thead>
<tbody>${rows || '<tr><td colspan="6" class="empty-state">No files here</td></tr>'}</tbody>
</table>
</div>
</div>

<div class="modal-overlay" id="renameModal">
  <div class="modal">
    <h3>✏️ Rename</h3>
    <label id="renameLabel"></label>
    <input type="text" id="renameInput" placeholder="New name" />
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal('renameModal')">Cancel</button>
      <button class="btn-primary" onclick="doRename()">Rename</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="moveModal">
  <div class="modal">
    <h3>📂 Move to</h3>
    <label id="moveLabel"></label>
    <input type="text" id="moveInput" placeholder="Destination folder (e.g. docs/images, blank = root)" />
    <div class="hint">Leaving blank moves to the bucket root.</div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal('moveModal')">Cancel</button>
      <button class="btn-primary" onclick="doMove()">Move</button>
    </div>
  </div>
</div>

<script>
let opPath = '';
let opIsFolder = false;

function openFolder(folder) {
  window.location.href = '/?path=' + encodeURIComponent(folder);
}

function openView(fileName) {
  window.open('/file/' + encodeURIComponent(fileName), '_blank');
}

function baseName(p) { return p.replace(/\/$/, '').split('/').pop(); }
function parentPath(p) { const s = p.replace(/\/$/, ''); const i = s.lastIndexOf('/'); return i === -1 ? '' : s.slice(0, i); }

function openRename(path, isFolder) {
  opPath = path;
  opIsFolder = isFolder;
  document.getElementById('renameLabel').textContent = 'Rename "' + baseName(path) + '" to:';
  document.getElementById('renameInput').value = baseName(path);
  document.getElementById('renameModal').classList.add('open');
  setTimeout(() => document.getElementById('renameInput').focus(), 50);
}

function openMove(path, isFolder) {
  opPath = path;
  opIsFolder = isFolder;
  document.getElementById('moveLabel').textContent = 'Move "' + baseName(path) + '" to folder:';
  document.getElementById('moveInput').value = parentPath(path);
  document.getElementById('moveModal').classList.add('open');
  setTimeout(() => document.getElementById('moveInput').focus(), 50);
}

function closeModal(id) { document.getElementById(id).classList.remove('open'); }

async function doRename() {
  const newName = document.getElementById('renameInput').value.trim();
  if (!newName || newName === baseName(opPath)) { closeModal('renameModal'); return; }
  const btn = event.target;
  btn.disabled = true; btn.textContent = '...';
  try {
    const resp = await fetch('/api/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPath: opPath, newName, isFolder: opIsFolder })
    });
    const data = await resp.json();
    if (data.success) { location.reload(); }
    else alert('Error: ' + data.error);
  } catch { alert('Network error'); }
  btn.disabled = false;
}

async function doMove() {
  const dest = document.getElementById('moveInput').value.trim();
  if (dest === parentPath(opPath)) { closeModal('moveModal'); return; }
  const btn = event.target;
  btn.disabled = true; btn.textContent = '...';
  try {
    const resp = await fetch('/api/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPath: opPath, destFolder: dest, isFolder: opIsFolder })
    });
    const data = await resp.json();
    if (data.success) { location.reload(); }
    else alert('Error: ' + data.error);
  } catch { alert('Network error'); }
  btn.disabled = false;
}

function deletePath(path, isFolder) {
  const what = isFolder ? 'folder' : 'file';
  if (!confirm('Delete this ' + what + '?\n\n' + path + (isFolder ? '\n\nAll files inside will be deleted!' : ''))) return;
  fetch('/api/delete?path=' + encodeURIComponent(path), { method: 'DELETE' }).then(r => r.json()).then(data => {
    if (data.success) { alert('Deleted ' + data.deleted + ' item(s)'); location.reload(); }
    else alert('Error: ' + data.error);
  }).catch(() => alert('Network error'));
}

function toggleTheme() {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  document.getElementById('themeBtn').textContent = isLight ? '🌙' : '☀️';
}

let debounceTimer;
function debounceSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const q = document.getElementById('searchInput').value.trim();
    const url = new URL(window.location.href);
    if (q) { url.searchParams.set('search', q); url.searchParams.delete('path'); }
    else url.searchParams.delete('search');
    url.searchParams.set('page', '1');
    window.location.href = url.toString();
  }, 300);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open')); }
});

(function() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') { document.body.classList.add('light'); document.getElementById('themeBtn').textContent = '🌙'; }
})();
</script>
</body>
</html>`;
}

function parseFoldersAndFiles(listResult, prefix) {
  const items = [];
  const folders = new Set();
  for (const f of (listResult.files || [])) {
    const rest = f.fileName.slice(prefix.length);
    if (rest.includes('/')) {
      folders.add(rest.split('/')[0]);
    } else if (rest) {
      items.push({ ...f, isFolder: false });
    }
  }
  const folderItems = [...folders].map(name => ({
    fileName: prefix + name + '/',
    isFolder: true,
    contentLength: 0,
    contentType: 'folder',
    uploadTimestamp: null
  }));
  return [...folderItems, ...items];
}

async function handleDashboard(request, env) {
  const url = new URL(request.url);
  const path = (url.searchParams.get('path') || '').replace(/^\/+|\/+$/g, '');
  const search = url.searchParams.get('search') || '';

  const auth = await getAuth(env);

  let bucketInfo = { bucketName: env.B2_BUCKET_NAME || 'N/A', totalSize: 0 };
  try {
    const resp = await fetch(`${auth.apiInfo.apiUrl}/b2api/v3/b2_list_buckets`, {
      method: 'POST',
      headers: { 'Authorization': auth.authorizationToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: env.B2_APPLICATION_KEY_ID })
    });
    if (resp.ok) {
      const data = await resp.json();
      const bucket = (data.buckets || []).find(b => b.bucketId === env.B2_BUCKET_ID || b.bucketName === env.B2_BUCKET_NAME);
      if (bucket) {
        bucketInfo = { bucketName: bucket.bucketName, totalSize: bucket.totalSize || 0 };
      }
    }
  } catch { /* optional */ }

  let items = [];
  if (search) {
    const all = await listAllFiles(env, '');
    const q = search.toLowerCase();
    items = all
      .filter(f => f.fileName.toLowerCase().includes(q))
      .map(f => ({ ...f, isFolder: false }));
  } else {
    const listResult = await b2ListFileNames(env, path ? path + '/' : '', 1000);
    const prefix = path ? path + '/' : '';
    items = parseFoldersAndFiles(listResult, prefix);
  }

  const html = dashboardHTML(bucketInfo, items, path, search);
  return htmlResponse(html);
}

async function renameOrMovePath(env, oldPath, newPath) {
  if (oldPath === newPath) return { moved: 0 };
  const isFolder = oldPath.endsWith('/');

  if (isFolder) {
    const files = await listAllFiles(env, oldPath);
    if (!files.length) throw new Error('Folder not found or empty');
    let count = 0;
    for (const f of files) {
      const rel = f.fileName.slice(oldPath.length);
      await b2CopyFile(env, f.fileId, newPath + rel);
      await b2DeleteFile(env, f.fileName, f.fileId);
      count++;
    }
    return { moved: count };
  }

  const file = await findFileByName(env, oldPath);
  if (!file) throw new Error('File not found: ' + oldPath);
  await b2CopyFile(env, file.fileId, newPath);
  await b2DeleteFile(env, oldPath, file.fileId);
  return { moved: 1 };
}

async function handleRename(request, env) {
  try {
    const { oldPath, newName, isFolder } = await request.json();
    if (!oldPath || !newName) return errResponse('Missing oldPath or newName', 400);

    const newNameClean = newName.replace(/^\/+|\/+$/g, '');
    if (!newNameClean || newNameClean.includes('..')) return errResponse('Invalid new name', 400);

    let newPath;
    if (isFolder) {
      if (newNameClean.includes('/')) return errResponse('Folder name cannot contain "/"', 400);
      newPath = newNameClean + '/';
    } else {
      if (newNameClean.includes('/')) return errResponse('File name cannot contain "/", use Move instead', 400);
      const parent = parentPathOf(oldPath);
      newPath = parent ? parent + '/' + newNameClean : newNameClean;
    }

    const result = await renameOrMovePath(env, oldPath, newPath);
    return json({ success: true, ...result, oldPath, newPath });
  } catch (e) {
    return errResponse(e.message, 400);
  }
}

async function handleMove(request, env) {
  try {
    const { oldPath, destFolder, isFolder } = await request.json();
    if (!oldPath) return errResponse('Missing oldPath', 400);

    const dest = (destFolder || '').replace(/^\/+|\/+$/g, '');
    if (dest.includes('..')) return errResponse('Invalid destination', 400);

    const base = oldPath.replace(/\/$/, '').split('/').pop();
    if (!base) return errResponse('Invalid path', 400);

    let newPath = dest ? dest + '/' + base : base;
    if (isFolder) newPath += '/';

    const result = await renameOrMovePath(env, oldPath, newPath);
    return json({ success: true, ...result, oldPath, newPath });
  } catch (e) {
    return errResponse(e.message, 400);
  }
}

function parentPathOf(p) {
  const s = p.replace(/\/$/, '');
  const i = s.lastIndexOf('/');
  return i === -1 ? '' : s.slice(0, i);
}

async function handleDelete(request, env) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    if (!path) return errResponse('Missing path', 400);

    let deleted = 0;
    if (path.endsWith('/')) {
      const files = await listAllFiles(env, path);
      for (const f of files) {
        await b2DeleteFile(env, f.fileName, f.fileId);
        deleted++;
      }
    } else {
      const file = await findFileByName(env, path);
      if (!file) return errResponse('File not found', 404);
      await b2DeleteFile(env, path, file.fileId);
      deleted = 1;
    }

    return json({ success: true, deleted, path });
  } catch (e) {
    return errResponse(e.message, 400);
  }
}

async function handleFile(request, env) {
  const url = new URL(request.url);
  const fileName = decodeURIComponent(url.pathname.slice('/file/'.length));
  if (!fileName) return errResponse('Missing filename', 400);
  const forceDownload = url.searchParams.get('dl') === '1';

  try {
    const resp = await b2DownloadFile(env, fileName);
    const contentType = resp.headers.get('Content-Type') || 'application/octet-stream';
    const inline = !forceDownload && /^(image\/|text\/|audio\/|video\/|application\/pdf|application\/json)/.test(contentType);

    return new Response(resp.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${fileName.split('/').pop()}"`,
        'Content-Length': resp.headers.get('Content-Length') || '',
        ...cors()
      }
    });
  } catch (e) {
    return errResponse(e.message, 404);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { headers: cors() });
    }

    if (path === '/api/rename' && method === 'POST') {
      return handleRename(request, env);
    }

    if (path === '/api/move' && method === 'POST') {
      return handleMove(request, env);
    }

    if (path === '/api/delete' && method === 'DELETE') {
      return handleDelete(request, env);
    }

    if (path.startsWith('/file/') && method === 'GET') {
      return handleFile(request, env);
    }

    if (path === '/' && method === 'GET') {
      return handleDashboard(request, env);
    }

    return errResponse('Not Found', 404);
  }
};