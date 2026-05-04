require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const BASE_URL = 'https://platform.mediastre.am';

// ─── Estado en memoria ────────────────────────────────────────────────────────

const state = {
  token: process.env.MS_TOKEN || '',
  slackWebhook: process.env.SLACK_WEBHOOK || '',
  pollApiInterval: parseInt(process.env.POLL_INTERVAL || '60000'),
  slots: {},        // streamId → datos monitoreados
  accessTokens: {}, // streamId → access token para streams con Closed Access
  alerts: [],
};

const timers = {}; // streamId → { apiTimer, m3u8Timer, m3u8Interval }

// ─── WebSocket broadcast ──────────────────────────────────────────────────────

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(c => c.readyState === WebSocket.OPEN && c.send(msg));
}

// ─── Alertas ──────────────────────────────────────────────────────────────────

function addAlert(streamId, streamName, type, message, severity = 'warning') {
  const alert = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    streamId, streamName, type, message, severity,
    ts: new Date().toISOString(),
  };
  state.alerts.unshift(alert);
  if (state.alerts.length > 300) state.alerts.pop();
  broadcast({ kind: 'alert', alert });
  if (state.slackWebhook) sendSlackAlert(alert).catch(e => console.error('[Slack]', e.message));
}

async function sendSlackAlert(alert) {
  const emoji = alert.severity === 'critical' ? '🚨' : '⚠️';
  await axios.post(state.slackWebhook, {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${emoji} *Alerta Monitor Live*\n*Stream:* ${alert.streamName}\n*Tipo:* \`${alert.type}\`\n*Mensaje:* ${alert.message}`,
        },
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `*${alert.severity.toUpperCase()}* | ${new Date(alert.ts).toLocaleString('es-CL')}` }],
      },
    ],
  });
}

// ─── Helpers de API ───────────────────────────────────────────────────────────

function apiHeaders() {
  return { 'X-API-Token': state.token };
}

// La API devuelve { status: 'OK', data: ... } — extraemos .data
async function apiGet(endpoint) {
  const { data } = await axios.get(`${BASE_URL}${endpoint}`, {
    headers: apiHeaders(),
    timeout: 15000,
  });
  return data.data !== undefined ? data.data : data;
}

async function fetchStreamById(id) {
  return apiGet(`/api/live-stream/${id}`);
}

async function fetchAdBreaks(id) {
  try {
    const res = await apiGet(`/api/live-stream/${id}/ad-break`);
    return Array.isArray(res) ? res : [];
  } catch { return []; }
}

async function fetchRestreams(id) {
  try {
    const res = await apiGet(`/api/live-stream/${id}/restream`);
    return Array.isArray(res) ? res : [];
  } catch { return []; }
}

// ─── Análisis M3U8 ────────────────────────────────────────────────────────────

function parseMasterPlaylist(content, baseUrl) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const renditions = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXT-X-STREAM-INF:')) {
      const attrs = lines[i].slice('#EXT-X-STREAM-INF:'.length);
      const bwM  = attrs.match(/BANDWIDTH=(\d+)/i);
      const resM = attrs.match(/RESOLUTION=(\d+x\d+)/i);
      const urlLine = lines[i + 1];
      if (urlLine && !urlLine.startsWith('#')) {
        let url = urlLine;
        if (!url.startsWith('http')) {
          try { url = new URL(url, baseUrl).href; } catch { url = null; }
        }
        if (url) {
          renditions.push({
            bandwidth: bwM ? parseInt(bwM[1]) : 0,
            resolution: resM ? resM[1] : null,
            url,
          });
        }
        i++;
      }
    }
  }

  return renditions.sort((a, b) => b.bandwidth - a.bandwidth);
}

function analyzeM3U8(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  let targetDuration = 6;
  let mediaSequence = null;
  let segmentCount = 0;
  let discontinuities = 0;
  let adBreakActive = false;
  let inCueOut = false;
  let edgeDomain = null;
  let expectSegment = false;

  // PDT tracking — acumular duraciones para calcular timestamp del último segmento
  let currentPdt = null;
  let pdtAccumMs = 0;
  let nextExtinf = null;
  let lastSegmentPdt = null;
  let lastSegmentUrl = null;

  for (const line of lines) {
    if (line.startsWith('#EXT-X-TARGETDURATION:'))
      targetDuration = parseInt(line.split(':')[1]);
    else if (line.startsWith('#EXT-X-MEDIA-SEQUENCE:'))
      mediaSequence = parseInt(line.split(':')[1]);
    else if (line.startsWith('#EXT-X-PROGRAM-DATE-TIME:')) {
      currentPdt = new Date(line.slice('#EXT-X-PROGRAM-DATE-TIME:'.length));
      pdtAccumMs = 0;
    }
    else if (line.startsWith('#EXTINF:')) {
      const dur = parseFloat(line.slice('#EXTINF:'.length));
      nextExtinf = isNaN(dur) ? targetDuration : dur;
      expectSegment = true;
    }
    else if (line.startsWith('#EXT-X-DISCONTINUITY'))
      discontinuities++;
    else if (line.startsWith('#EXT-X-CUE-OUT') || line.startsWith('#EXT-X-CUE-OUT-CONT'))
      inCueOut = true;
    else if (line.startsWith('#EXT-X-CUE-IN'))
      inCueOut = false;
    else if (!line.startsWith('#')) {
      if (expectSegment) {
        segmentCount++;
        const segPdt = currentPdt ? new Date(currentPdt.getTime() + pdtAccumMs) : null;
        if (segPdt) lastSegmentPdt = segPdt;
        pdtAccumMs += (nextExtinf ?? targetDuration) * 1000;
        nextExtinf = null;
        expectSegment = false;
        lastSegmentUrl = line;
      }
      if (!edgeDomain && line.startsWith('http')) {
        try { edgeDomain = new URL(line).hostname; } catch {}
      }
    }
  }

  adBreakActive = inCueOut;
  const latencyMs = lastSegmentPdt ? Date.now() - lastSegmentPdt.getTime() : null;
  // lastSeq = número del último segmento en el playlist actual
  const lastSeq = mediaSequence != null && segmentCount > 0
    ? mediaSequence + segmentCount - 1
    : null;

  return {
    targetDuration,
    mediaSequence,
    segmentCount,
    lastSeq,
    issues: [],
    latencyMs,
    adBreakActive,
    discontinuities,
    edgeDomain,
    lastSegmentUrl,
  };
}

// ─── Análisis MPD (DASH) ──────────────────────────────────────────────────────

function analyzeMPD(content, baseUrl) {
  // Extract BaseURL (CloudFront origin for MediaPackage streams)
  const baseUrlMatch = content.match(/<BaseURL[^>]*>([^<]+)<\/BaseURL>/);
  const mpdBase = baseUrlMatch ? baseUrlMatch[1].trim() : baseUrl;

  // Find the video AdaptationSet body (skip audio ones)
  const adaptSets = [...content.matchAll(/<AdaptationSet\s([^>]*)>([\s\S]*?)<\/AdaptationSet>/g)];
  let videoBody = null;
  for (const as of adaptSets) {
    const asAttrs = as[1];
    if (/mimeType="audio/.test(asAttrs) || /contentType="audio"/.test(asAttrs)) continue;
    videoBody = as[2];
    break;
  }
  if (!videoBody) return null;

  // Get media template and startNumber from the video AdaptationSet only
  const mediaMatch = videoBody.match(/media="([^"]+)"/);
  const startMatch = videoBody.match(/startNumber="(\d+)"/);
  if (!mediaMatch || !startMatch) return null;

  const mediaTemplate = mediaMatch[1];
  const startNumber   = parseInt(startMatch[1]);

  // Count <S> elements ONLY within the video SegmentTimeline
  let totalSegments = 0;
  const tlMatch = videoBody.match(/<SegmentTimeline>([\s\S]*?)<\/SegmentTimeline>/);
  if (tlMatch) {
    for (const m of tlMatch[1].matchAll(/<S(?:\s[^>]*)?\s*\/?>/g)) {
      const r = m[0].match(/\sr="(\d+)"/);
      totalSegments += r ? parseInt(r[1]) + 1 : 1;
    }
  }
  if (totalSegments === 0) totalSegments = 1;

  // Find highest-bandwidth video Representation (within video AdaptationSet)
  let bestBandwidth = -1;
  let bestRepId = null;
  for (const m of videoBody.matchAll(/<Representation\s([^>]*?)\s*\/?>/g)) {
    const attrs = m[1];
    if (/audioSamplingRate/.test(attrs)) continue;
    const bwMatch = attrs.match(/bandwidth="(\d+)"/);
    const idMatch = attrs.match(/\bid="([^"]+)"/);
    if (!bwMatch || !idMatch) continue;
    const bw = parseInt(bwMatch[1]);
    if (bw > bestBandwidth) { bestBandwidth = bw; bestRepId = idMatch[1]; }
  }

  const lastNumber = startNumber + totalSegments - 1;

  // Decode HTML entities and substitute template variables
  let template = mediaTemplate
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

  if (bestRepId !== null) template = template.replace(/\$RepresentationID\$/g, bestRepId);
  template = template
    .replace(/\$Number%0\d+d\$/g, String(lastNumber))
    .replace(/\$Number\$/g, String(lastNumber));

  // Resolve against BaseURL
  let segUrl = template;
  if (!segUrl.startsWith('http')) {
    try { segUrl = new URL(template, mpdBase).href; } catch { segUrl = null; }
  }

  return { lastNumber, totalSegments, segUrl, repId: bestRepId };
}

// ─── Poll MPD por stream (MediaPackage/DASH) ──────────────────────────────────

async function pollStreamMPD(id) {
  if (!state.token || !state.slots[id]) return;
  const slot = state.slots[id];
  if (!slot.mediapackageEnabled || !slot.mpdUrl) return;

  try {
    const { data: content } = await axios.get(slot.mpdUrl, { responseType: 'text', timeout: 10000 });
    const mpd = analyzeMPD(content, slot.mpdUrl);
    if (!mpd?.segUrl) return;

    const t0 = Date.now();
    let segmentProbe = null;
    try {
      const res = await axios.head(mpd.segUrl, { timeout: 10000 });
      segmentProbe = {
        name: mpd.segUrl.split('/').pop().split('?')[0],
        status: res.status,
        domain: new URL(mpd.segUrl).hostname,
        timeMs: Date.now() - t0,
      };
    } catch (e) {
      let domain = '';
      try { domain = new URL(mpd.segUrl).hostname; } catch {}
      segmentProbe = {
        name: mpd.segUrl.split('/').pop().split('?')[0],
        status: e.response?.status ?? 0,
        domain,
        timeMs: Date.now() - t0,
      };
    }

    if (state.slots[id]) {
      const prev = state.slots[id];
      const prevProbe = prev.segmentProbe;
      const newSlowCount = segmentProbe.timeMs > 1000 ? (prev.segmentProbeSlowCount ?? 0) + 1 : 0;
      if (prev?.name) {
        if (newSlowCount === 5)
          addAlert(id, prev.name, 'CDN_SLOW', `CDN lento — 5 segmentos DASH consecutivos > 1s (${segmentProbe.timeMs}ms)`, 'warning');
        const ps = prevProbe?.status;
        if (ps >= 200 && ps < 300 && segmentProbe.status >= 400)
          addAlert(id, prev.name, 'CDN_ERROR', `Segmento DASH HTTP ${segmentProbe.status} — ${segmentProbe.name}`, 'critical');
      }
      state.slots[id].segmentProbe = segmentProbe;
      state.slots[id].segmentProbeSlowCount = newSlowCount;
      console.log(`[MPD] ${id}: seg=${segmentProbe.name} status=${segmentProbe.status} ${segmentProbe.timeMs}ms`);
      broadcast({ kind: 'stream_update', stream: state.slots[id] });
    }
  } catch (e) {
    console.warn(`[MPD] ${id}: ERROR — ${e.response?.status ?? ''} ${e.message}`);
  }
}

// ─── Poll API por stream ──────────────────────────────────────────────────────

async function pollStreamApi(id) {
  if (!state.token) return;

  try {
    const raw = await fetchStreamById(id);
    const prev = state.slots[id] || {};

    // monitor.error es un Array en la API
    const monitorErrors = Array.isArray(raw.monitor?.error)
      ? raw.monitor.error.filter(Boolean)
      : (raw.monitor?.error ? [raw.monitor.error] : []);

    const current = {
      ...prev,
      id: raw._id || raw.id || id,
      name: raw.name || raw.title || id,
      online: raw.online ?? false,
      monitorStatus: raw.monitor?.status ?? null,
      monitorErrors,
      medialiveEnabled: raw.medialive?.enabled ?? false,
      medialiveState: raw.medialive?.channel?.state ?? null,
      medialiveInputs: raw.medialive?.channel?.inputs ?? [],
      recording: raw.recording ?? false,
      recordingStartDate: raw.recording_start_date ?? null,
      adStandard: !!(raw.ad),
      adSsai: !!(raw.ad_insertion),
      adAdswizz: raw.is_adswizz === true,
      adSgai: raw.ad_insertion_sgai?.enabled === true,
      adGoogleDai: (() => {
        const dai = raw.ad_insertion_google;
        // Keys sin enabled:true = configurado pero inactivo — no mostrar
        if (!dai?.enabled) return null;
        const hlsKey  = dai.googleDaiHlsAssetKey ?? dai.asset_key      ?? null;
        const dashKey = dai.googleDaiDashAssetKey ?? dai.asset_key_dash ?? null;
        return { hlsKey, dashKey, configError: !hlsKey && !dashKey };
      })(),
      hasAd: !!(raw.ad || raw.ad_insertion || raw.is_adswizz ||
                raw.ad_insertion_google?.enabled || raw.ad_insertion_sgai?.enabled),
      adInsertionInterval: raw.ad_insertion_interval ?? null,
      dvr: raw.dvr ?? false,
      cdnZones: raw.cdn_zones ?? [],
      externalCdnUrl: raw.external_cdn?.enabled ? (raw.external_cdn.edge_url ?? null) : null,
      m3u8Url: raw.external_cdn?.enabled
        ? (raw.external_cdn.edge_url ?? null)
        : `https://mdstrm.com/live-stream-playlist/${raw._id || raw.id || id}.m3u8`,
      // MediaPackage activo si enabled:true O si la infraestructura CMAF/HLS ya está desplegada
      mediapackageEnabled: !!(raw.mediapackage?.enabled || raw.mediapackage?.cmaf?.id || raw.mediapackage?.hls?.id),
      mediapackageDrm: raw.mediapackage?.drm ?? false,
      mediapackageUuid: raw.mediapackage?.uuid || raw.external_cdn?.uuid || null,
      mpdUrl: raw.mediapackage?.enabled
        ? `https://mdstrm.com/live-stream-playlist/${raw._id || raw.id || id}.mpd`
        : null,
      streamKey: raw.stream_id ?? null,
      closedAccess: raw.closed_access ?? false,
      views: raw.views ?? 0,
      loading: false,
      apiError: null,
      lastApiCheck: new Date().toISOString(),
      healthy: true,
    };

    // — Alertas por transición —

    if (!current.online) {
      current.healthy = false;
      if (prev.online !== false) addAlert(id, current.name, 'OFFLINE', 'El stream se ha desconectado', 'critical');
    }

    const mlOk = !current.medialiveEnabled
      || !current.medialiveState
      || ['RUNNING', 'START'].includes(current.medialiveState);
    if (!mlOk) {
      current.healthy = false;
      if (prev.medialiveState !== current.medialiveState)
        addAlert(id, current.name, 'MEDIALIVE', `Canal MediaLive en estado: ${current.medialiveState}`, 'critical');
    }

    if (monitorErrors.length > 0) {
      current.healthy = false;
      const prevErrors = new Set(prev.monitorErrors || []);
      for (const err of monitorErrors)
        if (!prevErrors.has(err)) addAlert(id, current.name, 'MONITOR_ERROR', err, 'warning');
    }

    if (prev.recording === true && current.recording === false)
      addAlert(id, current.name, 'RECORDING', 'La grabación se ha detenido inesperadamente', 'warning');

    if (current.mediapackageDrm && !current.mediapackageUuid)
      if (!prev.mediapackageDrm || prev.mediapackageUuid)
        addAlert(id, current.name, 'DRM', 'DRM activo sin UUID — las licencias no funcionarán', 'critical');

    // Ad breaks y restreams — solo cada 3 minutos, no en cada poll
    const now = Date.now();
    const prevCheck = prev._slowPollAt ?? 0;
    if (now - prevCheck > 180000) {
      current.adBreaks  = await fetchAdBreaks(id);
      current.restreams = await fetchRestreams(id);
      current._slowPollAt = now;
    } else {
      current.adBreaks  = prev.adBreaks  ?? [];
      current.restreams = prev.restreams ?? [];
      current._slowPollAt = prevCheck;
    }

    // Alerta restreams en error nuevos
    const prevRestreamErrors = new Set((prev.restreams || []).filter(r => r.status === 'ERROR').map(r => r._id));
    for (const r of current.restreams)
      if (r.status === 'ERROR' && !prevRestreamErrors.has(r._id))
        addAlert(id, current.name, 'RESTREAM', `Restream "${r.name}" en estado ERROR`, 'warning');

    state.slots[id] = current;
    broadcast({ kind: 'stream_update', stream: current });

  } catch (e) {
    console.error(`[API] ${id}:`, e.message);
    const prev = state.slots[id] || {};
    state.slots[id] = { ...prev, id, loading: false, apiError: e.message, lastApiCheck: new Date().toISOString() };
    broadcast({ kind: 'stream_update', stream: state.slots[id] });

    if (e.response?.status === 401)
      broadcast({ kind: 'auth_error', message: 'Token inválido o expirado' });
    if (e.response?.status === 404)
      broadcast({ kind: 'stream_not_found', id, message: `Stream "${id}" no encontrado` });
  }
}

// ─── Poll M3U8 por stream ─────────────────────────────────────────────────────

async function pollStreamM3U8(id) {
  if (!state.token || !state.slots[id] || state.slots[id].loading) return;

  try {
    const slot = state.slots[id];
    const masterUrl = slot.m3u8Url || `https://mdstrm.com/live-stream-playlist/${id}.m3u8`;
    const accessToken = state.accessTokens[id] ?? '';
    const params = accessToken ? { access_token: accessToken } : {};

    const fetchSegment = (url) => axios.get(url, { params, responseType: 'text', timeout: 10000, maxRedirects: 5 });

    const { data: masterContent } = await fetchSegment(masterUrl);

    let mediaContent = masterContent;
    let renditions = [];

    if (masterContent.includes('#EXT-X-STREAM-INF')) {
      renditions = parseMasterPlaylist(masterContent, masterUrl);
      if (renditions.length > 0) {
        try {
          const { data } = await fetchSegment(renditions[0].url);
          mediaContent = data;
        } catch (e) {
          console.warn(`[M3U8] ${id}: no se pudo obtener rendición alta calidad — ${e.message}`);
        }
      }
    }

    const analysis = analyzeM3U8(mediaContent);
    analysis.renditions = renditions;

    // Detección de Google DAI desde el path CDN del master/rendiciones

    // ── Probe del último segmento .ts
    let segmentProbe = null;
    if (analysis.lastSegmentUrl) {
      const mediaPlaylistUrl = renditions.length > 0 ? renditions[0].url : masterUrl;
      let segUrl = analysis.lastSegmentUrl;
      if (!segUrl.startsWith('http')) {
        try { segUrl = new URL(segUrl, mediaPlaylistUrl).href; } catch { segUrl = null; }
      }
      if (segUrl) {
        const t0 = Date.now();
        try {
          const res = await axios.head(segUrl, { params, timeout: 10000 });
          segmentProbe = {
            name: segUrl.split('/').pop().split('?')[0],
            status: res.status,
            domain: new URL(segUrl).hostname,
            timeMs: Date.now() - t0,
          };
        } catch (e) {
          let domain = '';
          try { domain = new URL(segUrl).hostname; } catch {}
          segmentProbe = {
            name: segUrl.split('/').pop().split('?')[0],
            status: e.response?.status ?? 0,
            domain,
            timeMs: Date.now() - t0,
          };
        }
      }
    }

    const prev = state.slots[id];
    const prevM3u8 = prev.m3u8;

    // Detección entre polls usando #EXT-X-MEDIA-SEQUENCE
    analysis.frozen = false;
    if (prevM3u8?.mediaSequence != null && analysis.mediaSequence != null) {
      const diff = analysis.mediaSequence - prevM3u8.mediaSequence;
      if (diff === 0) {
        analysis.frozen = true;
      } else if (diff < 0) {
        analysis.issues.push({ type: 'reset', message: `Reinicio de secuencia M3U8 (${prevM3u8.mediaSequence}→${analysis.mediaSequence})` });
      } else if (diff > (prevM3u8.segmentCount ?? 3) + 2) {
        // Salto mayor que la ventana del playlist — segmentos realmente perdidos
        analysis.issues.push({ type: 'gap', message: `Salto de ${diff} segmentos perdidos entre lecturas (seq ${prevM3u8.mediaSequence}→${analysis.mediaSequence})` });
      }
    }

    if (analysis.issues.length > 0 && prev?.name) {
      const prevKeys = new Set((prevM3u8?.issues || []).map(i => `${i.type}-${i.message}`));
      for (const issue of analysis.issues) {
        const key = `${issue.type}-${issue.message}`;
        if (!prevKeys.has(key)) addAlert(id, prev.name, 'M3U8', issue.message, 'warning');
      }
    }

    if (analysis.frozen && !prevM3u8?.frozen && prev?.name)
      addAlert(id, prev.name, 'M3U8', 'Stream congelado — secuencia de segmentos sin avanzar', 'warning');

    // Alertas de probe
    const prevProbe = prev.segmentProbe;
    const newSlowCount = segmentProbe?.timeMs > 1000
      ? (prev.segmentProbeSlowCount ?? 0) + 1 : 0;
    if (segmentProbe && prev?.name) {
      if (newSlowCount === 5)
        addAlert(id, prev.name, 'CDN_SLOW', `CDN lento — 5 segmentos consecutivos > 1s (${segmentProbe.timeMs}ms)`, 'warning');
      const ps = prevProbe?.status;
      if (ps >= 200 && ps < 300 && segmentProbe.status >= 400)
        addAlert(id, prev.name, 'CDN_ERROR', `Segmento HTTP ${segmentProbe.status} — ${segmentProbe.name}`, 'critical');
    }

    if (state.slots[id]) {
      state.slots[id].m3u8 = analysis;
      state.slots[id].m3u8Error = null;
      state.slots[id].segmentProbe = segmentProbe;
      state.slots[id].segmentProbeSlowCount = newSlowCount;
      state.slots[id].lastM3U8Check = new Date().toISOString();
      console.log(`[M3U8] ${id}: seq=${analysis.mediaSequence} segs=${analysis.segmentCount} frozen=${analysis.frozen}`);
      broadcast({ kind: 'stream_update', stream: state.slots[id] });

      // Ajustar intervalo al TARGETDURATION real del stream
      if (timers[id] && analysis.targetDuration) {
        const newMs = analysis.targetDuration * 1000;
        if (timers[id].m3u8Interval !== newMs) {
          clearInterval(timers[id].m3u8Timer);
          timers[id].m3u8Interval = newMs;
          timers[id].m3u8Timer = setInterval(() => pollStreamM3U8(id), newMs);
          console.log(`[M3U8] ${id}: intervalo ajustado a ${analysis.targetDuration}s`);
        }
      }
    }
  } catch (e) {
    console.warn(`[M3U8] ${id}: ERROR — ${e.response?.status ?? ''} ${e.message}`);
    if (state.slots[id]) {
      state.slots[id].m3u8 = null;
      state.slots[id].m3u8Error = e.response?.status
        ? `HTTP ${e.response.status}`
        : e.message;
      state.slots[id].lastM3U8Check = new Date().toISOString();
      broadcast({ kind: 'stream_update', stream: state.slots[id] });
    }
  }
}

// ─── Gestión de slots ─────────────────────────────────────────────────────────

function startMonitoring(id) {
  if (!id || timers[id]) return;
  console.log(`[Monitor] +  ${id}`);

  state.slots[id] = { id, loading: true, lastApiCheck: null };
  broadcast({ kind: 'stream_update', stream: state.slots[id] });

  pollStreamApi(id);
  timers[id] = {
    apiTimer: setInterval(() => pollStreamApi(id), state.pollApiInterval),
    m3u8Timer: null,
    m3u8Interval: 6000,
  };

  // M3U8 arranca 2s después del primer API poll
  setTimeout(() => {
    if (!timers[id]) return;
    pollStreamM3U8(id);
    timers[id].m3u8Timer = setInterval(() => pollStreamM3U8(id), timers[id].m3u8Interval);
  }, 2000);
}

function stopMonitoring(id) {
  if (!timers[id]) return;
  console.log(`[Monitor] -  ${id}`);
  clearInterval(timers[id].apiTimer);
  clearInterval(timers[id].m3u8Timer);
  delete timers[id];
  delete state.slots[id];
  broadcast({ kind: 'stream_removed', id });
}

// Sincroniza la lista completa de IDs activos (llamado al reconectar browser)
function syncMonitoring(ids) {
  const newSet = new Set(ids.filter(Boolean));

  // Detener los que ya no están en la lista
  for (const id of Object.keys(timers))
    if (!newSet.has(id)) stopMonitoring(id);

  // Arrancar los nuevos
  for (const id of newSet)
    if (!timers[id]) startMonitoring(id);
}

function restartAll() {
  const ids = Object.keys(state.slots);
  for (const id of Object.keys(timers)) stopMonitoring(id);
  for (const id of ids) startMonitoring(id);
}

// ─── Rutas REST ───────────────────────────────────────────────────────────────

app.get('/api/config', (_req, res) => {
  res.json({
    hasToken: !!state.token,
    hasSlack: !!state.slackWebhook,
    pollApiInterval: state.pollApiInterval,
  });
});

app.post('/api/config', (req, res) => {
  const { token, slackWebhook, pollApiInterval } = req.body;
  let tokenChanged = false;

  if (token !== undefined && token !== state.token) {
    state.token = token;
    tokenChanged = true;
  }
  if (slackWebhook !== undefined) state.slackWebhook = slackWebhook;
  if (pollApiInterval !== undefined) state.pollApiInterval = parseInt(pollApiInterval);

  if (tokenChanged) restartAll();

  res.json({ ok: true });
});

// Guardar access token para un stream específico (Closed Access)
// Guardar access token para un stream específico (Closed Access)
app.post('/api/monitor/access-token', (req, res) => {
  const id = String(req.body.id || '').trim();
  const token = String(req.body.token || '').trim();
  if (!id) return res.status(400).json({ error: 'id requerido' });
  if (token) state.accessTokens[id] = token;
  else delete state.accessTokens[id];
  res.json({ ok: true });
});

// Recibe probe de segmento .ts desde el browser (client-side, mide desde la red del usuario)
app.post('/api/monitor/segment-probe', (req, res) => {
  const { id, status, timeMs, domain, name } = req.body;
  if (!id || !state.slots[id]) return res.json({ ok: true });

  const prev = state.slots[id];
  const prevProbe = prev.segmentProbe;
  const newSlowCount = timeMs > 1000 ? (prev.segmentProbeSlowCount ?? 0) + 1 : 0;

  if (prev?.name) {
    if (newSlowCount === 5)
      addAlert(id, prev.name, 'CDN_SLOW', `CDN lento — 5 segmentos consecutivos > 1s (${timeMs}ms)`, 'warning');
    const ps = prevProbe?.status;
    if (ps >= 200 && ps < 300 && status >= 400)
      addAlert(id, prev.name, 'CDN_ERROR', `Segmento HTTP ${status} — ${name}`, 'critical');
  }

  state.slots[id].segmentProbe = { name, status, domain, timeMs };
  state.slots[id].segmentProbeSlowCount = newSlowCount;
  broadcast({ kind: 'stream_update', stream: state.slots[id] });
  res.json({ ok: true });
});

// Sincroniza lista completa de slots desde el frontend
app.post('/api/monitor/sync', (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  syncMonitoring(ids);
  res.json({ ok: true, monitoring: Object.keys(state.slots) });
});

// Agregar un stream
app.post('/api/monitor/add', (req, res) => {
  const id = String(req.body.id || '').trim();
  if (!id) return res.status(400).json({ error: 'id requerido' });
  startMonitoring(id);
  res.json({ ok: true });
});

// Quitar un stream
app.post('/api/monitor/remove', (req, res) => {
  const id = String(req.body.id || '').trim();
  stopMonitoring(id);
  res.json({ ok: true });
});

// Forzar actualización de un stream
app.post('/api/monitor/refresh/:id', (req, res) => {
  const id = req.params.id;
  if (state.slots[id]) {
    pollStreamApi(id);
    pollStreamM3U8(id);
  }
  res.json({ ok: true });
});

// Debug — ver respuesta raw de la API para un stream
app.get('/api/debug/:id', async (req, res) => {
  try {
    const raw = await fetchStreamById(req.params.id);
    res.json(raw);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Debug — ver contenido raw del MPD
app.get('/api/debug/mpd/:id', async (req, res) => {
  try {
    const id  = req.params.id;
    const url = `https://mdstrm.com/live-stream-playlist/${id}.mpd`;
    const { data } = await axios.get(url, { responseType: 'text', timeout: 10000 });
    const parsed = analyzeMPD(data, url);
    const header = [
      `=== MPD PARSED ===`,
      `repId      : ${parsed?.repId ?? 'null'}`,
      `lastNumber : ${parsed?.lastNumber ?? 'null'}`,
      `totalSegs  : ${parsed?.totalSegments ?? 'null'}`,
      `segUrl     : ${parsed?.segUrl ?? 'null'}`,
      `=== RAW MPD ===\n`,
    ].join('\n');
    res.type('text').send(header + data);
  } catch (e) {
    res.status(500).send(`Error: ${e.message}`);
  }
});

// Debug — comparar live-stream-playlist vs live-stream (user-facing)
app.get('/api/debug/m3u8-compare/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const fetch = (url) => axios.get(url, { responseType: 'text', timeout: 10000 });
    const probe = async (masterUrl) => {
      const { data: master } = await fetch(masterUrl);
      if (!master.includes('#EXT-X-STREAM-INF')) return { masterUrl, firstSegDomain: 'N/A (no renditions)', segName: '' };
      const renditions = parseMasterPlaylist(master, masterUrl);
      if (!renditions.length) return { masterUrl, firstSegDomain: 'N/A', segName: '' };
      const { data: media } = await fetch(renditions[0].url);
      const segLine = media.split('\n').find(l => l.trim() && !l.startsWith('#'));
      const segUrl  = segLine?.trim() || '';
      let domain = '', segName = segUrl.split('/').pop().split('?')[0];
      try { domain = new URL(segUrl).hostname; } catch { domain = segUrl.substring(0, 60); }
      return { masterUrl, renditionUrl: renditions[0].url, firstSegDomain: domain, segName };
    };
    const [playlist, livestream] = await Promise.allSettled([
      probe(`https://mdstrm.com/live-stream-playlist/${id}.m3u8`),
      probe(`https://mdstrm.com/live-stream/${id}.m3u8`),
    ]);
    const fmt = (r) => r.status === 'fulfilled'
      ? `Master : ${r.value.masterUrl}\nSegmento: ${r.value.segName}\nDominio : ${r.value.firstSegDomain}`
      : `ERROR: ${r.reason?.message}`;
    res.type('text').send(
      `=== live-stream-playlist ===\n${fmt(playlist)}\n\n=== live-stream ===\n${fmt(livestream)}`
    );
  } catch (e) {
    res.status(500).send(`Error: ${e.message}`);
  }
});

// Debug — ver contenido raw del M3U8 (master + media playlist)
app.get('/api/debug/m3u8/:id', async (req, res) => {
  try {
    const slot = state.slots[req.params.id];
    const masterUrl = slot?.m3u8Url || `https://mdstrm.com/live-stream-playlist/${req.params.id}.m3u8`;
    const accessToken = state.accessTokens[req.params.id] ?? '';
    const params = accessToken ? { access_token: accessToken } : {};
    const fetch = (url) => axios.get(url, { params, responseType: 'text', timeout: 10000 });

    const { data: master } = await fetch(masterUrl);
    let media = null;
    if (master.includes('#EXT-X-STREAM-INF')) {
      const renditions = parseMasterPlaylist(master, masterUrl);
      if (renditions.length > 0) {
        const { data } = await fetch(renditions[0].url);
        media = { url: renditions[0].url, content: data };
      }
    }
    res.type('text').send(
      `=== MASTER: ${masterUrl} ===\n\n${master}` +
      (media ? `\n\n=== MEDIA (alta calidad): ${media.url} ===\n\n${media.content}` : '')
    );
  } catch (e) {
    res.status(500).send(`Error: ${e.message}`);
  }
});

app.get('/api/state', (_req, res) => {
  res.json({
    streams: Object.values(state.slots),
    alerts: state.alerts.slice(0, 100),
    hasToken: !!state.token,
  });
});

// ─── WebSocket ────────────────────────────────────────────────────────────────

wss.on('connection', ws => {
  ws.send(JSON.stringify({
    kind: 'init',
    streams: Object.values(state.slots),
    alerts: state.alerts.slice(0, 100),
    config: {
      hasToken: !!state.token,
      hasSlack: !!state.slackWebhook,
      pollApiInterval: state.pollApiInterval,
    },
  }));
});

// ─── Arranque ─────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀  Mediastream Monitor → http://localhost:${PORT}\n`);
  if (!state.token) console.log('⚠  Sin token. Configúralo en el dashboard.\n');
});
