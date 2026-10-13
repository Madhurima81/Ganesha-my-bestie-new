// lib/utils/sceneEventLog.js
//
// A tiny per-scene "flight recorder". Scenes (or the watchdog) log the steps that matter - a line
// started / ended / was cancelled, a timer was armed, a checkpoint was saved, a card was set - and when
// something stalls the last events are dumped, so a freeze can be diagnosed instead of guessed at.
//
//   logSceneEvent('nirvighnam', 'reveal:set', { word: 'nir' });
//   dumpSceneLog('nirvighnam', 'card never showed', { phase });   // console group + saved copy
//   getSceneLog('nirvighnam');                                    // last events, oldest first
//
// Cheap (a small ring buffer in memory, no console output until a dump). In the browser console:
//   __sceneLog()                     all scenes' recent events
//   JSON.parse(localStorage.gmb_scene_stall_dumps)   the last few dumps (survive a reload)

const MAX_EVENTS = 40;
const MAX_DUMPS = 5;
const DUMPS_KEY = 'gmb_scene_stall_dumps';

const buffers = new Map();

const safeData = (data) => {
  if (data === undefined) return undefined;
  try { return JSON.parse(JSON.stringify(data)); } catch { return String(data); }
};

export function logSceneEvent(scene, name, data) {
  const key = scene || 'scene';
  let buf = buffers.get(key);
  if (!buf) { buf = []; buffers.set(key, buf); }
  buf.push({ t: Date.now(), name, data: safeData(data) });
  if (buf.length > MAX_EVENTS) buf.shift();
}

export function getSceneLog(scene) {
  return (buffers.get(scene || 'scene') || []).slice();
}

export function clearSceneLog(scene) {
  if (scene) buffers.delete(scene); else buffers.clear();
}

// Print the recent events (relative to the dump moment) and keep a copy in localStorage.
export function dumpSceneLog(scene, reason, snapshot) {
  const events = getSceneLog(scene);
  const now = Date.now();
  const dump = {
    scene,
    reason,
    at: new Date(now).toISOString(),
    snapshot: safeData(snapshot),
    events: events.map((e) => ({ agoMs: now - e.t, name: e.name, data: e.data })),
  };
  try {
    // eslint-disable-next-line no-console
    console.groupCollapsed(`[scene stall] ${scene}: ${reason}`);
    // eslint-disable-next-line no-console
    console.log('snapshot', dump.snapshot);
    // eslint-disable-next-line no-console
    console.table(dump.events.map((e) => ({ agoMs: e.agoMs, event: e.name, data: JSON.stringify(e.data ?? '') })));
    // eslint-disable-next-line no-console
    console.groupEnd();
  } catch { /* console is best-effort */ }
  try {
    const prev = JSON.parse(localStorage.getItem(DUMPS_KEY) || '[]');
    const next = [...(Array.isArray(prev) ? prev : []), dump].slice(-MAX_DUMPS);
    localStorage.setItem(DUMPS_KEY, JSON.stringify(next));
  } catch { /* storage can be unavailable (private window) */ }
  return dump;
}

if (typeof window !== 'undefined') {
  window.__sceneLog = () => Object.fromEntries([...buffers.entries()].map(([k, v]) => [k, v.slice()]));
}
