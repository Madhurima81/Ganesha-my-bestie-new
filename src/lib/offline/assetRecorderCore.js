// assetRecorderCore.js — the pure logic of the "what does each scene really load?" recorder.
//
// Reading code cannot tell a picture a scene SHOWS from one it only imports (the Pond still imported old lotus and
// elephant art for a Help menu that does not exist). So for the offline download we record what the browser actually
// fetches while a scene is played, tagged with the scene it was fetched in. The recorder itself (assetRecorder.js) only
// watches the browser; everything that can be tested without one lives here.
export const RECORD_STORAGE_KEY = 'gmb_asset_record_v1';

const KEEP_EXT = /\.(png|jpe?g|webp|svg|gif|mp3|wav|webm|ogg|m4a|mp4|js|css)$/i;

// A resource-timing entry -> { u, bytes } for a same-origin file the app serves, else null.
export function normalizeEntry(entry, origin) {
  let url;
  try { url = new URL(entry.name); } catch { return null; }
  if (url.origin !== origin) return null;
  if (!KEEP_EXT.test(url.pathname)) return null;
  if (/^\/(sw|workbox-[^/]*|registerSW)\.js$/i.test(url.pathname)) return null; // service-worker plumbing, not content
  if (/^\/(src|@vite|node_modules|@react-refresh)\//.test(url.pathname)) return null; // dev server only
  const bytes = Math.max(entry.decodedBodySize || 0, entry.encodedBodySize || 0, entry.transferSize || 0);
  return { u: url.pathname, bytes };
}

// What the recorder files a fetch under: the scene being played, or the screen the family is on.
export function keyFor({ view, zone, scene }) {
  if (view === 'scene' && zone && scene) return `scene:${zone}/${scene}`;
  if (view === 'zone-welcome' && zone) return `zone-welcome:${zone}`;
  return `screen:${view || 'boot'}`;
}

// The key that was active when a fetch started. timeline = [{ t, key }] in time order (t = performance.now()).
export function keyAt(timeline, t) {
  let found = timeline.length ? timeline[0].key : 'screen:boot';
  for (const step of timeline) { if (step.t <= t) found = step.key; else break; }
  return found;
}

// Merge new fetches into the record: { [key]: { [path]: bytes } }. Returns how many files were new to that key.
export function addFiles(record, key, files) {
  const bucket = record[key] || (record[key] = {});
  let added = 0;
  for (const f of files) {
    if (!(f.u in bucket)) added++;
    bucket[f.u] = Math.max(bucket[f.u] || 0, f.bytes || 0);
  }
  return added;
}

// The export file: per key, files sorted by size, with totals.
export function buildExport(record, extra = {}) {
  const keys = {};
  for (const [key, files] of Object.entries(record)) {
    const list = Object.entries(files).map(([u, bytes]) => ({ u, bytes })).sort((a, b) => b.bytes - a.bytes);
    keys[key] = { count: list.length, bytes: list.reduce((n, f) => n + f.bytes, 0), files: list };
  }
  return { version: 1, recordedAt: new Date().toISOString(), ...extra, keys };
}

export function loadRecord(storage = globalThis.localStorage) {
  try { return JSON.parse(storage.getItem(RECORD_STORAGE_KEY)) || {}; } catch { return {}; }
}

export function saveRecord(record, storage = globalThis.localStorage) {
  try { storage.setItem(RECORD_STORAGE_KEY, JSON.stringify(record)); return true; } catch { return false; }
}

// Turn the recorder on with ?recordassets=1 (it stays on for this browser) and off with ?recordassets=0.
export function recorderWanted(search, storage = globalThis.localStorage) {
  const flag = new URLSearchParams(search).get('recordassets');
  try {
    if (flag === '1') storage.setItem('gmb_record_assets', '1');
    if (flag === '0') storage.removeItem('gmb_record_assets');
    return storage.getItem('gmb_record_assets') === '1';
  } catch { return flag === '1'; }
}
