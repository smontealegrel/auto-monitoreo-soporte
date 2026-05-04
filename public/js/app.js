// ─── localStorage ─────────────────────────────────────────────────────────────

const LS_TOKEN         = 'ms_monitor_token';
const LS_SLOTS         = 'ms_monitor_slots';
const LS_ACCESS_TOKENS = 'ms_access_tokens'; // { streamId: accessToken } por slot
const LS_SLACK         = 'ms_monitor_slack_set';
const SLOT_COUNT = 4;

function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// Estructura: ['streamId1', null, 'streamId2', null]
let slotIds = lsGet(LS_SLOTS, Array(SLOT_COUNT).fill(null));

function saveSlots() { lsSet(LS_SLOTS, slotIds); }

// ─── WebSocket ────────────────────────────────────────────────────────────────

let ws = null;
let reconnectTimer = null;

function connect() {
  ws = new WebSocket(`ws://${location.host}`);

  ws.onopen = () => {
    clearTimeout(reconnectTimer);
    setWsDot('connected');

    // 1. Re-enviar token de API
    const token = lsGet(LS_TOKEN, '');
    if (token) postConfig({ token });

    // 2. Re-enviar access tokens guardados
    const savedIssuerTokens = lsGet(LS_ACCESS_TOKENS, {});
    for (const [id, tok] of Object.entries(savedIssuerTokens)) {
      fetch('/api/monitor/access-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, token: tok }),
      });
    }

    // 3. Sincronizar slots activos
    const activeIds = slotIds.filter(Boolean);
    if (activeIds.length > 0) {
      fetch('/api/monitor/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: activeIds }),
      });
    }
  };

  ws.onmessage = (e) => { try { handleMsg(JSON.parse(e.data)); } catch (_) {} };

  ws.onclose = () => {
    setWsDot('disconnected');
    reconnectTimer = setTimeout(connect, 3000);
  };

  ws.onerror = () => ws.close();
}

function handleMsg(msg) {
  switch (msg.kind) {
    case 'init':
      applyServerConfig(msg.config);
      for (const s of (msg.streams || [])) updateSlotData(s);
      renderAlerts(msg.alerts || []);
      break;
    case 'stream_update':
      updateSlotData(msg.stream);
      updateStats();
      break;
    case 'stream_removed':
      clearSlotData(msg.id);
      updateStats();
      break;
    case 'alert':
      prependAlert(msg.alert);
      showToast(msg.alert);
      break;
    case 'auth_error':
      markTokenError();
      showToastMsg('Token inválido o expirado — actualízalo en la tarjeta de token', 'critical');
      break;
    case 'stream_not_found':
      showToastMsg(`Stream no encontrado: ${msg.id}`, 'warning');
      break;
    case 'poll_error':
      showToastMsg(msg.message, 'critical');
      break;
  }
}

// ─── Estado local de datos ────────────────────────────────────────────────────

const streamData = {}; // streamId → datos
let alertsList = [];
function updateSlotData(stream) {
  streamData[stream.id] = stream;
  const slotIdx = slotIds.indexOf(stream.id);
  if (slotIdx !== -1) renderSlotCard(slotIdx, stream.id);
  updateStats();
  updateLastPoll();
}

function clearSlotData(id) {
  delete streamData[id];
}

// ─── Render: slots grid ───────────────────────────────────────────────────────

function renderSlotsGrid() {
  const grid = document.getElementById('slotsGrid');
  grid.innerHTML = '';

  for (let i = 0; i < slotIds.length; i++) {
    const card = document.createElement('div');
    card.className = 'slot-card';
    card.id = `slot-${i}`;
    grid.appendChild(card);
    renderSlotCard(i, slotIds[i]);
  }

  // Botón añadir slot
  const addBtn = document.createElement('div');
  addBtn.className = 'add-slot-card';
  addBtn.innerHTML = `<span class="add-slot-icon">＋</span><span>Agregar stream</span>`;
  addBtn.addEventListener('click', addSlot);
  grid.appendChild(addBtn);
}

function renderSlotCard(idx, streamId) {
  const card = document.getElementById(`slot-${idx}`);
  if (!card) return;

  const data   = streamId ? streamData[streamId] : null;
  const health = data ? slotHealth(data) : 'empty';

  card.className = `slot-card ${health === 'empty' ? '' : health}`;

  const idVal = streamId || '';

  card.innerHTML = `
    <div class="slot-topbar">
      <input
        type="text"
        class="slot-id-input ${idVal ? 'has-value' : ''}"
        placeholder="ID del stream…"
        value="${esc(idVal)}"
        data-slot="${idx}"
        spellcheck="false"
      >
      <button class="slot-remove-btn" data-slot="${idx}" title="Limpiar slot">✕</button>
    </div>
    <div class="slot-body">
      ${buildSlotBody(data, streamId, idx)}
    </div>
  `;

  // Eventos del input de ID
  const input = card.querySelector('.slot-id-input');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commitSlotId(idx, input.value.trim());
  });
  input.addEventListener('blur', () => {
    const val = input.value.trim();
    if (val !== (slotIds[idx] || '')) commitSlotId(idx, val);
  });

  // Botón quitar: si tiene live → limpiar; si está vacío → eliminar la card
  card.querySelector('.slot-remove-btn').addEventListener('click', () => {
    if (slotIds[idx]) clearSlot(idx);
    else removeSlot(idx);
  });

  // Botón refresh (si existe)
  const refreshBtn = card.querySelector('.refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      fetch(`/api/monitor/refresh/${streamId}`, { method: 'POST' });
    });
  }

  // Token emisor (streams Closed Access)
  const atSaveBtn = card.querySelector('.access-token-save-btn');
  if (atSaveBtn) {
    const atInput = card.querySelector('.access-token-input');
    const doSave = () => {
      const val = atInput.value.trim();
      if (val) saveIssuerToken(atSaveBtn.dataset.stream, val);
    };
    atSaveBtn.addEventListener('click', doSave);
    atInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSave(); });
  }
}

function buildSlotBody(data, streamId, idx) {
  if (!streamId) {
    return `
      <div class="slot-empty">
        <span class="slot-empty-icon">📡</span>
        <span class="slot-empty-text">Ingresa el ID del stream<br>y presiona Enter</span>
      </div>`;
  }

  if (!data || data.loading) {
    return `
      <div class="slot-loading">
        <div class="spinner"></div>
        <span>Cargando…</span>
      </div>`;
  }

  if (data.apiError && !data.name) {
    return `
      <div class="slot-error-msg">
        <span class="err-icon">⚠️</span>
        <span>${esc(data.apiError)}</span>
      </div>`;
  }

  return buildStreamData(data);
}

function buildStreamData(s) {
  // MediaLive
  const mlState = s.medialiveEnabled ? (s.medialiveState || '—') : 'N/A';
  const mlOk    = !s.medialiveEnabled || !s.medialiveState || ['RUNNING', 'START'].includes(s.medialiveState);

  // Grabación — neutral cuando está off (la alerta se dispara si se detiene en vivo)
  const recClass = s.recording ? 'ok' : 'neutral';
  const recText  = s.recording
    ? `● Activa <span id="rec-${esc(s.id)}" class="rec-timer"></span>`
    : '● Inactiva';

  // M3U8 — muestra estado + frozen + ad break
  let m3u8Val = '—';
  let m3u8Class = 'neutral';
  if (s.m3u8Error) {
    const short = s.m3u8Error.length > 40 ? s.m3u8Error.slice(0, 40) + '…' : s.m3u8Error;
    m3u8Val = `⚠ ${short}`;
    m3u8Class = 'warn';
  } else if (s.m3u8) {
    const issues = s.m3u8.issues?.length || 0;
    m3u8Class = s.m3u8.frozen ? 'err' : (issues ? 'warn' : 'ok');
    let status = `${s.m3u8.segmentCount} segs`;
    if (s.m3u8.frozen)    status += ' ❄ congelado';
    else if (issues)      status += ` ⚠ ${issues}`;
    else                  status += ' ✓';
    if (s.m3u8.adBreakActive) status += ' · AD';
    if (s.m3u8.mediaSequence != null) status += ` <span class="seq-label">seq ${s.m3u8.mediaSequence}</span>`;
    m3u8Val = status;
  }

  // Latencia desde PDT del último segmento
  let latencyVal = '—';
  let latencyClass = 'neutral';
  if (s.m3u8?.latencyMs != null && s.m3u8.latencyMs > 0) {
    const secs = (s.m3u8.latencyMs / 1000).toFixed(1);
    latencyVal   = `${secs}s`;
    latencyClass = s.m3u8.latencyMs < 10000 ? 'ok' : s.m3u8.latencyMs < 30000 ? 'warn' : 'err';
  }

  // Calidades desde master playlist — deduplicar por resolución
  let renditionsVal = null;
  if (s.m3u8?.renditions?.length > 0) {
    const seen = new Set();
    renditionsVal = s.m3u8.renditions
      .map(r => r.resolution ? r.resolution.split('x')[1] + 'p' : `${Math.round(r.bandwidth / 1000)}k`)
      .filter(label => { if (seen.has(label)) return false; seen.add(label); return true; })
      .join(' · ');
  }

  // Publicidad — tipo específico
  const adTypes = [];
  if (s.adGoogleDai)  adTypes.push(s.adGoogleDai.configError ? 'Google DAI ⚠' : 'Google DAI');
  if (s.adSsai)       adTypes.push('SSAI');
  if (s.adSgai)       adTypes.push('SGAI');
  if (s.adStandard)   adTypes.push('CSAI');
  if (s.adAdswizz)    adTypes.push('Adswizz');
  const adText  = adTypes.length ? adTypes.join(' · ') : 'Sin ads';
  const adClass = adTypes.length ? (s.adGoogleDai?.configError ? 'err' : 'warn') : 'neutral';
  const nextBreak = nextAdBreakLabel(s.adBreaks);

  // Restreams
  const restreamText = buildRestreamText(s.restreams);

  // CDN — preferir edge domain del M3U8 sobre cdn_zones de la API
  const edgeDomain = s.m3u8?.edgeDomain ?? null;
  const cdnText = edgeDomain || (s.cdnZones?.length ? s.cdnZones.join(', ') : '—');

  // Views
  const viewsText = s.views != null ? s.views.toLocaleString('es-CL') : '—';

  // DVR
  const dvrText  = s.dvr ? 'Activo' : 'Inactivo';
  const dvrClass = s.dvr ? 'ok' : 'neutral';

  // MediaPackage / DRM
  let drmText = null, drmClass = 'neutral';
  if (s.mediapackageEnabled) {
    if (s.mediapackageDrm) {
      drmText  = s.mediapackageUuid ? 'DRM ✓' : 'DRM ⚠ sin UUID';
      drmClass = s.mediapackageUuid ? 'ok' : 'err';
    } else {
      drmText  = 'MediaPackage';
      drmClass = 'neutral';
    }
  }

  // Monitor errors
  const monitorErrorsBlock = (s.monitorErrors?.length > 0)
    ? `<div class="issue-block err"><strong>⛔ Monitor errors</strong><ul>${s.monitorErrors.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>`
    : '';

  // M3U8 issues
  const m3u8IssuesBlock = (s.m3u8?.issues?.length > 0)
    ? `<div class="issue-block warn"><strong>⚠ Secuencia M3U8</strong><ul>${s.m3u8.issues.map(i => `<li>${esc(i.message)}</li>`).join('')}</ul></div>`
    : '';

  // Check times
  const apiTime  = s.lastApiCheck  ? `API: ${fmtAgo(s.lastApiCheck)}`  : '';
  const m3u8Time = s.lastM3U8Check ? `M3U8: ${fmtAgo(s.lastM3U8Check)}` : '';

  return `
    <div class="stream-name-row">
      <span class="stream-name" title="${esc(s.name)}">${esc(s.name)}</span>
      <span class="badge ${s.online ? 'badge-online' : 'badge-offline'}">${s.online ? '● Online' : '● Offline'}</span>
    </div>

    <div class="metrics-grid">
      <div class="metric">
        <span class="metric-label">MediaLive</span>
        <span class="metric-value ${mlOk ? (s.medialiveEnabled ? 'ok' : 'neutral') : 'err'}">${esc(mlState)}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Grabación</span>
        <span class="metric-value ${recClass}">${recText}</span>
      </div>
      <div class="metric">
        <span class="metric-label">M3U8</span>
        <span class="metric-value ${m3u8Class}" title="${esc(s.m3u8Error || '')}">${m3u8Val}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Latencia</span>
        <span class="metric-value ${latencyClass}">${latencyVal}</span>
      </div>
      ${renditionsVal != null ? `
      <div class="metric">
        <span class="metric-label">Calidades</span>
        <span class="metric-value neutral">${esc(renditionsVal)}</span>
      </div>` : ''}
      <div class="metric">
        <span class="metric-label">Publicidad</span>
        <span class="metric-value ${adClass}">${adText}${nextBreak ? ` <span style="font-size:10px;color:var(--text-muted)">${nextBreak}</span>` : ''}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Reproducciones</span>
        <span class="metric-value neutral">${viewsText}</span>
      </div>
      <div class="metric">
        <span class="metric-label">DVR</span>
        <span class="metric-value ${dvrClass}">${dvrText}</span>
      </div>
      ${s.restreams?.length > 0 ? `
      <div class="metric">
        <span class="metric-label">Restreams</span>
        <span class="metric-value ${restreamText.cls}">${restreamText.txt}</span>
      </div>` : ''}
      <div class="metric">
        <span class="metric-label">Protocolo</span>
        <span class="metric-value neutral">${s.mediapackageEnabled ? 'HLS · DASH' : 'HLS'}</span>
      </div>
      ${drmText != null ? `
      <div class="metric">
        <span class="metric-label">DRM</span>
        <span class="metric-value ${drmClass}">${drmText}</span>
      </div>` : ''}
      <div class="metric">
        <span class="metric-label">CDN</span>
        <span class="metric-value neutral">${esc(cdnText)}</span>
      </div>
    </div>

    ${buildNetworkProbeRow(s.segmentProbe)}
    ${monitorErrorsBlock}
    ${m3u8IssuesBlock}

    ${(s.closedAccess || s.m3u8Error?.includes('401') || s.m3u8Error?.includes('403')) ? buildIssuerTokenRow(s.id) : ''}

    <div class="slot-footer">
      <span class="check-times">${apiTime}${apiTime && m3u8Time ? ' · ' : ''}${m3u8Time}</span>
      <button class="refresh-btn">↻</button>
    </div>
  `;
}

function buildNetworkProbeRow(probe) {
  if (!probe) return '';
  const statusClass = probe.status >= 200 && probe.status < 300 ? 'ok'
    : probe.status >= 400 ? 'err' : probe.status === 0 ? 'err' : 'warn';
  const timeClass = probe.timeMs < 500 ? 'ok' : probe.timeMs < 1000 ? 'warn' : 'err';
  const statusText = probe.status || 'timeout';
  // Mostrar la parte final del nombre: …_608452.ts
  const seqMatch = probe.name.match(/[_-]?(\d+\.ts\w*)$/i);
  const shortName = seqMatch ? '…' + seqMatch[0] : probe.name;
  return `
    <div class="network-probe">
      <div class="network-probe-name-row">
        <span class="probe-name" title="${esc(probe.name)}">${esc(shortName)}</span>
      </div>
      <div class="network-probe-row">
        <span class="probe-status ${statusClass}">${statusText}</span>
        <span class="probe-domain" title="${esc(probe.domain)}">${esc(probe.domain)}</span>
        <span class="probe-time ${timeClass}">${probe.timeMs}ms</span>
      </div>
    </div>`;
}

function buildIssuerTokenRow(streamId) {
  const saved = !!(lsGet(LS_ACCESS_TOKENS, {}))[streamId];
  return `
    <div class="access-token-row">
      <span class="access-token-label">🔑 Access token</span>
      <input type="password" class="access-token-input" placeholder="${saved ? '••••••• (guardado)' : 'Pegar access token…'}" data-stream="${esc(streamId)}">
      <button class="access-token-save-btn" data-stream="${esc(streamId)}">✓</button>
    </div>`;
}

function saveIssuerToken(streamId, token) {
  const all = lsGet(LS_ACCESS_TOKENS, {});
  if (token) all[streamId] = token;
  else delete all[streamId];
  lsSet(LS_ACCESS_TOKENS, all);
  fetch('/api/monitor/access-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: streamId, token }),
  }).then(() => {
    fetch(`/api/monitor/refresh/${streamId}`, { method: 'POST' });
  });
  showToastMsg('Access token guardado', 'ok');
}

// ─── Helpers de render ────────────────────────────────────────────────────────

function slotHealth(s) {
  if (!s || s.loading) return 'loading';
  if (!s.online) return 'critical';
  const mlBad = s.medialiveEnabled && s.medialiveState && !['RUNNING', 'START'].includes(s.medialiveState);
  if (mlBad) return 'critical';
  if (!s.healthy) return 'warning';
  if (s.m3u8?.issues?.length > 0 || s.m3u8?.frozen) return 'warning';
  return 'healthy';
}

function nextAdBreakLabel(adBreaks) {
  if (!adBreaks?.length) return '';
  const now = Date.now();
  const upcoming = adBreaks
    .filter(b => b.date && new Date(b.date).getTime() > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (!upcoming.length) return '';
  const ms = new Date(upcoming[0].date).getTime() - now;
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `(próximo: ${mins}m ${secs}s)`;
}

function buildRestreamText(restreams) {
  if (!restreams?.length) return { txt: '—', cls: 'neutral' };
  const running = restreams.filter(r => r.status === 'RUNNING').length;
  const errors  = restreams.filter(r => r.status === 'ERROR').length;
  if (errors > 0) return { txt: `${errors} error${errors > 1 ? 'es' : ''}`, cls: 'err' };
  return { txt: `${running}/${restreams.length} activos`, cls: running > 0 ? 'ok' : 'neutral' };
}

function fmtAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 5)   return 'ahora';
  if (diff < 60)  return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
}

function fmtDuration(startIso) {
  if (!startIso) return '';
  const s = Math.floor((Date.now() - new Date(startIso).getTime()) / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}h ${String(m).padStart(2, '0')}m`
    : `${m}m ${String(sec).padStart(2, '0')}s`;
}

function fmtDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })
    + ' ' + d.toLocaleTimeString('es-CL');
}

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Timer de grabación (actualiza cada segundo en el DOM) ───────────────────

setInterval(() => {
  for (const [id, s] of Object.entries(streamData)) {
    if (s.recording && s.recordingStartDate) {
      const el = document.getElementById(`rec-${id}`);
      if (el) el.textContent = fmtDuration(s.recordingStartDate);
    }
  }
}, 1000);

// ─── Stats ────────────────────────────────────────────────────────────────────

function updateStats() {
  const streams = Object.values(streamData);
  const active = slotIds.filter(Boolean).map(id => streamData[id]).filter(Boolean);
  document.getElementById('totalCount').textContent   = active.length;
  document.getElementById('healthyCount').textContent  = active.filter(s => slotHealth(s) === 'healthy').length;
  document.getElementById('warningCount').textContent  = active.filter(s => slotHealth(s) === 'warning').length;
  document.getElementById('criticalCount').textContent = active.filter(s => slotHealth(s) === 'critical').length;
}

function updateLastPoll() {
  document.getElementById('lastPollLabel').textContent = `Actualizado ${new Date().toLocaleTimeString('es-CL')}`;
}

// ─── Alertas ──────────────────────────────────────────────────────────────────

function renderAlerts(alerts) {
  alertsList = alerts;
  paintAlerts();
}

function prependAlert(alert) {
  alertsList.unshift(alert);
  if (alertsList.length > 300) alertsList.pop();
  paintAlerts();
}

function paintAlerts() {
  const feed    = document.getElementById('alertsFeed');
  const section = document.getElementById('alertsSection');
  const badge   = document.getElementById('alertBadge');

  badge.textContent = alertsList.length;
  section.style.display = 'block';

  if (!alertsList.length) {
    feed.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px">Sin alertas</div>';
    return;
  }

  feed.innerHTML = alertsList.map(a => `
    <div class="alert-item ${a.severity}" title="${esc(a.message)}">
      <span class="alert-ts">${fmtDateTime(a.ts)}</span>
      <span class="alert-stream">${esc(a.streamName)}</span>
      <span class="alert-type">${esc(a.type)}</span>
      <span class="alert-message">${esc(a.message)}</span>
    </div>
  `).join('');
}

// ─── Toasts ───────────────────────────────────────────────────────────────────

function showToast(alert) {
  showToastMsg(`${alert.streamName} — ${alert.type}: ${alert.message}`, alert.severity, alert.streamName, `${alert.type}: ${alert.message}`);
}

function showToastMsg(message, severity = 'info', title = null, body = null) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast toast-${severity}`;
  el.innerHTML = title
    ? `<strong>${esc(title)}</strong><span>${esc(body || message)}</span>`
    : `<strong>${esc(message)}</strong>`;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 280);
  }, 6000);
}

// ─── Slot management ──────────────────────────────────────────────────────────

function commitSlotId(idx, newId) {
  const oldId = slotIds[idx];
  if (newId === (oldId || '')) return;

  // Quitar el anterior si existía
  if (oldId) {
    fetch('/api/monitor/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: oldId }),
    });
    delete streamData[oldId];
  }

  slotIds[idx] = newId || null;
  saveSlots();
  renderSlotCard(idx, slotIds[idx]);

  // Arrancar el nuevo
  if (newId) {
    fetch('/api/monitor/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newId }),
    });
  }
}

function clearSlot(idx) {
  commitSlotId(idx, null);
  updateStats();
}

function removeSlot(idx) {
  const id = slotIds[idx];
  if (id) {
    fetch('/api/monitor/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    delete streamData[id];
  }
  slotIds.splice(idx, 1);
  saveSlots();
  renderSlotsGrid();
  updateStats();
}

function addSlot() {
  slotIds.push(null);
  saveSlots();
  renderSlotsGrid();
}

// ─── Token ────────────────────────────────────────────────────────────────────

function saveToken() {
  const val = document.getElementById('tokenInput').value.trim();
  if (!val) return;

  lsSet(LS_TOKEN, val);
  postConfig({ token: val });

  document.getElementById('tokenInput').value = '';
  document.getElementById('tokenInput').type = 'password';
  setTokenBadge(true);
  showToastMsg('Token guardado y aplicado', 'ok');
}

function setTokenBadge(active, error = false) {
  const badge = document.getElementById('tokenBadge');
  badge.textContent = error ? 'Error / expirado' : (active ? '✓ Activo' : 'Sin configurar');
  badge.className = `token-status-badge ${error ? 'error' : active ? 'active' : ''}`;
}

function markTokenError() {
  setTokenBadge(false, true);
}

function applyServerConfig(cfg) {
  const savedToken = lsGet(LS_TOKEN, '');
  setTokenBadge(cfg.hasToken || !!savedToken);

  const interval = cfg.pollApiInterval || 30000;
  document.getElementById('pollIntervalRange').value = interval;
  document.getElementById('intervalDisplay').textContent = `${interval / 1000}s`;
  document.getElementById('intervalBadge').textContent = `Polling cada ${interval / 1000}s`;
}

// ─── Config modal ─────────────────────────────────────────────────────────────

function postConfig(body) {
  return fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function saveSettings() {
  const slack    = document.getElementById('slackInput').value.trim();
  const interval = parseInt(document.getElementById('pollIntervalRange').value);

  const body = { pollApiInterval: interval };
  if (slack) body.slackWebhook = slack;

  postConfig(body).then(() => {
    document.getElementById('settingsModal').classList.remove('open');
    document.getElementById('slackInput').value = '';
    document.getElementById('intervalBadge').textContent = `Polling cada ${interval / 1000}s`;
    showToastMsg('Configuración guardada', 'ok');
  });
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function setWsDot(state) {
  document.getElementById('wsDot').className = `ws-dot ${state}`;
}

// ─── Event listeners ──────────────────────────────────────────────────────────

document.getElementById('saveTokenBtn').addEventListener('click', saveToken);
document.getElementById('tokenInput').addEventListener('keydown', e => { if (e.key === 'Enter') saveToken(); });
document.getElementById('toggleToken').addEventListener('click', () => {
  const inp = document.getElementById('tokenInput');
  inp.type = inp.type === 'password' ? 'text' : 'password';
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  fetch('/api/config').then(r => r.json()).then(cfg => {
    document.getElementById('pollIntervalRange').value = cfg.pollApiInterval || 30000;
    document.getElementById('intervalDisplay').textContent = `${(cfg.pollApiInterval || 30000) / 1000}s`;
  });
  document.getElementById('settingsModal').classList.add('open');
});
document.getElementById('closeSettings').addEventListener('click', () => {
  document.getElementById('settingsModal').classList.remove('open');
});
document.getElementById('cancelSettings').addEventListener('click', () => {
  document.getElementById('settingsModal').classList.remove('open');
});
document.getElementById('settingsModal').addEventListener('click', e => {
  if (e.target === document.getElementById('settingsModal'))
    document.getElementById('settingsModal').classList.remove('open');
});
document.getElementById('saveSettings').addEventListener('click', saveSettings);

document.getElementById('toggleSlack').addEventListener('click', () => {
  const inp = document.getElementById('slackInput');
  inp.type = inp.type === 'password' ? 'text' : 'password';
});

document.getElementById('pollIntervalRange').addEventListener('input', e => {
  document.getElementById('intervalDisplay').textContent = `${parseInt(e.target.value) / 1000}s`;
});

document.getElementById('clearAlertsBtn').addEventListener('click', () => {
  alertsList = [];
  paintAlerts();
});

// ─── Arranque ─────────────────────────────────────────────────────────────────

// Mostrar token guardado como placeholder
const savedToken = lsGet(LS_TOKEN, '');
if (savedToken) {
  setTokenBadge(true);
  document.getElementById('tokenInput').placeholder = 'Token guardado — pega uno nuevo para reemplazarlo';
}

renderSlotsGrid();
connect();
