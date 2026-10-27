// assetRecorder.js — watches the browser and shows a small panel. Loaded only when ?recordassets=1 (see main.jsx), so
// families never download or run it. Logic lives in assetRecorderCore.js.
import {
  normalizeEntry, keyFor, keyAt, addFiles, buildExport, loadRecord, saveRecord,
} from './assetRecorderCore';

let started = false;

export function startAssetRecorder() {
  if (started || typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;
  started = true;

  const record = loadRecord();
  const timeline = [];
  let currentKey = null;
  let totalFiles = Object.values(record).reduce((n, f) => n + Object.keys(f).length, 0);
  try { performance.setResourceTimingBufferSize(5000); } catch { /* older browsers */ }

  const sceneState = () => keyFor({ view: window.__gmbView, zone: window.__gmbZone, scene: window.__gmbScene });
  const trackKey = () => {
    const key = sceneState();
    if (key !== currentKey) { currentKey = key; timeline.push({ t: performance.now(), key }); paint(); }
  };

  let saveTimer = null;
  const scheduleSave = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => saveRecord(record), 800); };

  const onEntries = (entries) => {
    const byKey = {};
    for (const e of entries) {
      const file = normalizeEntry(e, window.location.origin);
      if (!file) continue;
      const key = keyAt(timeline, e.startTime);
      (byKey[key] = byKey[key] || []).push(file);
    }
    let added = 0;
    for (const [key, files] of Object.entries(byKey)) added += addFiles(record, key, files);
    if (added) { totalFiles += added; scheduleSave(); paint(); }
  };

  // ---- the small panel (plain DOM, bottom-left, out of the way) ----
  const box = document.createElement('div');
  box.setAttribute('data-asset-recorder', '');
  Object.assign(box.style, {
    position: 'fixed', left: '8px', bottom: '8px', zIndex: '2147483000', background: 'rgba(40,20,80,0.9)', color: '#fff',
    font: '700 12px/1.3 Nunito, system-ui, sans-serif', padding: '8px 10px', borderRadius: '12px', maxWidth: '260px',
    display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
  });
  const label = document.createElement('div');
  const row = document.createElement('div');
  Object.assign(row.style, { display: 'flex', gap: '6px' });
  const button = (text, onClick) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = text; b.onclick = onClick;
    Object.assign(b.style, { minHeight: '44px', minWidth: '60px', border: 'none', borderRadius: '10px', padding: '0 12px', background: '#ffd76b', color: '#3a2a4a', font: '800 13px Nunito, system-ui, sans-serif', cursor: 'pointer' });
    return b;
  };
  const exportBtn = button('Export', () => {
    const data = buildExport(record, { page: window.location.origin, userAgent: navigator.userAgent });
    const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `gmb-recorded-assets-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
  const clearBtn = button('Clear', () => {
    if (!window.confirm('Delete everything recorded so far?')) return;
    for (const k of Object.keys(record)) delete record[k];
    totalFiles = 0; saveRecord(record); paint();
  });
  row.append(exportBtn, clearBtn);
  box.append(label, row);

  function paint() {
    const here = record[currentKey] ? Object.keys(record[currentKey]).length : 0;
    label.textContent = `Recording · ${currentKey || '…'} · ${here} files here · ${totalFiles} in all`;
  }

  const mount = () => { if (!document.body.contains(box)) document.body.appendChild(box); trackKey(); };
  if (document.body) mount(); else window.addEventListener('DOMContentLoaded', mount);

  // everything already loaded before the recorder started, then everything from now on
  onEntries(performance.getEntriesByType('resource'));
  new PerformanceObserver((list) => onEntries(list.getEntries())).observe({ type: 'resource', buffered: false });
  window.addEventListener('gmb:viewchange', trackKey);
  setInterval(trackKey, 300); // the scene id changes without a view event
  window.addEventListener('pagehide', () => saveRecord(record));
}
