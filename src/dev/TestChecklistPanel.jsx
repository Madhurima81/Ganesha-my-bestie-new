/**
 * Floating test runner — dev harness only.
 *
 * Shows ONE step at a time (what to do / what should happen) with Pass & Next,
 * Fail, a note, and screenshots. A numbered strip shows every step's status and
 * jumps to it. "Pop out" moves the runner into its own small window (Chrome/Edge)
 * so it never covers the game. Progress is saved in localStorage per checklist.
 *
 * Share: Download report (one .html, screenshots embedded) or Copy markdown.
 * New plan: "New checklist" -> paste any bullet / `- [ ]` list.
 *
 * Mounted from GameTestHarness.jsx. Not part of the live app.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TEST_CHECKLISTS, TEST_CHECKLIST_GROUPS, CHECKLIST_ALIASES, GENERIC_CHECKLIST } from './testChecklists';

const HEADING = "'Baloo 2', system-ui, sans-serif";
const BODY = "'Nunito', system-ui, sans-serif";
const STORE = 'gmb_test_checklists_v1';

const C = {
  ink: '#0f172a', mute: '#64748b', line: '#e2e8f0', soft: '#f8fafc', white: '#fff',
  pass: '#059669', passBg: '#ecfdf5', fail: '#e11d48', failBg: '#fff1f2',
  skip: '#94a3b8', accent: '#4f46e5',
};

const STATUS_LABEL = { pass: 'Pass', fail: 'Fail', skip: 'Skipped' };
const STATUS_COLOR = { pass: C.pass, fail: C.fail, skip: C.skip };

function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; }
}
function saveStore(store) {
  try { localStorage.setItem(STORE, JSON.stringify(store)); return true; } catch { return false; }
}

// Pasted text -> checklist. First heading = title; bullets / numbers / `- [ ]` = steps;
// an "Expect:" line or an indented line under a step becomes its pass condition.
function parseChecklist(text) {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.replace(/\s+$/, ''));
  let title = '';
  const items = [];
  lines.forEach((raw) => {
    if (!raw.trim()) return;
    const heading = raw.match(/^\s*#{1,6}\s+(.*)$/);
    if (heading) { if (!title) title = heading[1].trim(); return; }
    const expectLine = raw.match(/^\s*(?:expect(?:ed)?|pass(?: when)?|->|=>)\s*[:-]?\s*(.+)$/i);
    if (expectLine && items.length) { items[items.length - 1].expect = expectLine[1].trim(); return; }
    const isBullet = /^\s*(?:[-*]|\d+[.)])\s+/.test(raw);
    const step = raw.match(/^\s*(?:[-*]|\d+[.)])\s*(?:\[[ xX]?\]\s*)?(.+)$/);
    const indented = /^\s{2,}\S/.test(raw);
    if (isBullet && step) {
      items.push({ text: step[1].trim() });
    } else if (indented && items.length) {
      const last = items[items.length - 1];
      last.expect = (last.expect ? `${last.expect} ` : '') + raw.trim();
    } else if (!title) {
      title = raw.trim();
    } else {
      items.push({ text: raw.trim() });
    }
  });
  return { title: title || 'Pasted checklist', items };
}

function downscale(dataUrl, maxW = 900, quality = 0.72) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = reject;
  r.readAsDataURL(file);
});

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function tally(list, results) {
  return list.items.reduce((c, _, i) => { c[results[i]?.status || 'open'] += 1; return c; }, { pass: 0, fail: 0, skip: 0, open: 0 });
}

function buildMarkdown(list, results, meta) {
  const out = [`# ${list.title}`, '', `Game: ${meta.gameKey || '-'} | Run: ${meta.when}`, ''];
  list.items.forEach((it, i) => {
    const r = results[i] || {};
    const tag = r.status ? STATUS_LABEL[r.status].toUpperCase() : 'NOT RUN';
    out.push(`${i + 1}. [${tag}] ${it.text}`);
    if (it.expect) out.push(`   - Expected: ${it.expect}`);
    if (r.note) out.push(`   - Note: ${r.note.replace(/\n/g, ' ')}`);
    if (r.shots?.length) out.push(`   - ${r.shots.length} screenshot(s) in the HTML report`);
  });
  const c = tally(list, results);
  out.push('', `Summary: ${c.pass} pass, ${c.fail} fail, ${c.skip} skipped, ${c.open} not run`);
  return out.join('\n');
}

function buildHtml(list, results, meta) {
  const c = tally(list, results);
  const rows = list.items.map((it, i) => {
    const r = results[i] || {};
    return `<section class="s ${r.status || 'open'}">
      <div class="h"><span class="n">${i + 1}</span><span class="tag">${r.status ? STATUS_LABEL[r.status] : 'Not run'}</span></div>
      <p class="t">${esc(it.text)}</p>
      ${it.expect ? `<p class="e">Expected: ${esc(it.expect)}</p>` : ''}
      ${r.note ? `<p class="note">${esc(r.note).replace(/\n/g, '<br>')}</p>` : ''}
      ${(r.shots || []).map((s) => `<img src="${s}" alt="screenshot">`).join('')}
    </section>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(list.title)}</title>
<style>body{font-family:Nunito,system-ui,sans-serif;max-width:760px;margin:24px auto;padding:0 16px;color:#0f172a}
h1{font-family:'Baloo 2',system-ui,sans-serif;margin-bottom:4px}.sum{color:#64748b;margin:0 0 16px}
.s{border:1px solid #e2e8f0;border-left:5px solid #cbd5e1;border-radius:8px;padding:10px 14px;margin:10px 0}
.s.pass{border-left-color:#059669}.s.fail{border-left-color:#e11d48;background:#fff1f2}.s.skip{border-left-color:#94a3b8}
.h{display:flex;gap:10px;align-items:center;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;font-weight:700}
.n{background:#0f172a;color:#fff;border-radius:4px;padding:1px 7px}.t{font-weight:700;margin:6px 0}.e{color:#475569;margin:4px 0}
.note{background:#fffbeb;border:1px solid #fde68a;padding:6px 10px;border-radius:6px}
img{max-width:100%;border:1px solid #cbd5e1;border-radius:6px;margin:6px 0;display:block}</style></head>
<body><h1>${esc(list.title)}</h1>
<p class="sum">Game: ${esc(meta.gameKey || '-')} | ${esc(meta.when)} | ${c.pass} pass, ${c.fail} fail, ${c.skip} skipped, ${c.open} not run</p>
${rows}</body></html>`;
}

function download(filename, text, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---- small style helpers ----------------------------------------------------
const base = { fontFamily: BODY, boxSizing: 'border-box' };
const btn = (variant = 'plain', extra = {}) => ({
  ...base, cursor: 'pointer', border: '1px solid', borderRadius: 8, fontSize: 13, fontWeight: 700, padding: '8px 12px', lineHeight: 1.2,
  ...(variant === 'pass' && { background: C.pass, borderColor: C.pass, color: '#fff' }),
  ...(variant === 'fail' && { background: C.white, borderColor: C.fail, color: C.fail }),
  ...(variant === 'plain' && { background: C.white, borderColor: C.line, color: C.ink }),
  ...(variant === 'quiet' && { background: 'transparent', borderColor: 'transparent', color: C.mute, padding: '4px 6px', fontWeight: 600 }),
  ...extra,
});
const label = { ...base, fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.mute, marginBottom: 3 };

// Small status marks: a green dot + passed count, a red dot + failed (bug) count, and a green
// "Done" tag once every step has a result.
function Dot({ color }) {
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, marginRight: 4, verticalAlign: 'middle' }} />;
}
function StatusBadge({ counts, total }) {
  // "Done" = every step has a result AND nothing failed. All resolved but with failures = "Bugs".
  const resolved = total > 0 && counts.open === 0;
  const finished = resolved && counts.fail === 0;
  const buggy = resolved && counts.fail > 0;
  const any = counts.pass + counts.fail + counts.skip > 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, color: C.mute, whiteSpace: 'nowrap', fontFamily: BODY }}>
      {finished && <span style={{ background: C.passBg, color: C.pass, border: '1px solid #a7f3d0', borderRadius: 999, padding: '0 7px', fontWeight: 800 }}>Done</span>}
      {buggy && <span style={{ background: C.failBg, color: C.fail, border: '1px solid #fecdd3', borderRadius: 999, padding: '0 7px', fontWeight: 800 }}>Bugs</span>}
      <span title="Passed"><Dot color={C.pass} />{counts.pass}</span>
      <span title="Failed (bugs)"><Dot color={C.fail} />{counts.fail}</span>
      {!resolved && any && <span>{counts.open} left</span>}
      {!any && <span>not started</span>}
    </span>
  );
}

export default function TestChecklistPanel({ gameKey }) {
  const resolvedKey = CHECKLIST_ALIASES[gameKey] || gameKey;
  const builtIn = useMemo(() => TEST_CHECKLISTS[resolvedKey] || GENERIC_CHECKLIST, [resolvedKey]);
  const builtInId = `builtin:${TEST_CHECKLISTS[resolvedKey] ? resolvedKey : 'generic'}`;
  // Every built-in checklist is selectable from "Share / more", whichever game is open.
  const builtInEntries = useMemo(() => [
    ...Object.entries(TEST_CHECKLISTS).map(([k, v]) => ({ id: `builtin:${k}`, list: v })),
    { id: 'builtin:generic', list: GENERIC_CHECKLIST },
  ], []);
  // Dropdown groups: zone -> games, then "Other" for anything not listed.
  const builtInGroups = useMemo(() => {
    const byId = new Map(builtInEntries.map((e) => [e.id, e]));
    const used = new Set();
    const groups = Object.entries(TEST_CHECKLIST_GROUPS).map(([label, keys]) => ({
      label,
      entries: keys.map((k) => byId.get(`builtin:${k}`)).filter(Boolean).map((e) => { used.add(e.id); return e; }),
    }));
    const rest = builtInEntries.filter((e) => !used.has(e.id));
    if (rest.length) groups.push({ label: 'Other', entries: rest });
    return groups.filter((g) => g.entries.length);
  }, [builtInEntries]);

  const [store, setStore] = useState(loadStore);
  const [activeId, setActiveId] = useState(builtInId);
  const [index, setIndex] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState({ x: 16, y: 56 });
  const [view, setView] = useState('run'); // 'run' | 'new' | 'more'
  const [pasteText, setPasteText] = useState('');
  const [toast, setToast] = useState('');
  const [saveWarn, setSaveWarn] = useState(false);
  const [copyBox, setCopyBox] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pip, setPip] = useState(null); // { win, root }
  const dragRef = useRef(null);
  const pipRef = useRef(null);

  useEffect(() => { setActiveId(builtInId); setIndex(0); }, [builtInId]);
  useEffect(() => () => { pipRef.current?.close?.(); }, []);

  const custom = store.custom || {};
  const list = activeId.startsWith('custom:')
    ? (custom[activeId] || builtIn)
    : (builtInEntries.find((e) => e.id === activeId)?.list || builtIn);
  const results = store.results?.[activeId] || {};
  const total = list.items.length;
  const at = Math.min(index, total - 1);
  const item = list.items[at];
  const cur = results[at] || {};
  const counts = tally(list, results);
  const done = counts.pass + counts.fail + counts.skip;

  const persist = useCallback((next) => {
    setStore(next);
    setSaveWarn(!saveStore(next));
  }, []);

  const setResult = (i, patch) => {
    const all = store.results?.[activeId] || {};
    persist({ ...store, results: { ...store.results, [activeId]: { ...all, [i]: { ...all[i], ...patch } } } });
  };

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 2200); };
  const go = (i) => setIndex(Math.max(0, Math.min(total - 1, i)));

  const passAndNext = () => { setResult(at, { status: 'pass' }); if (at < total - 1) go(at + 1); };
  const markFail = () => setResult(at, { status: 'fail' });
  const markSkip = () => { setResult(at, { status: 'skip' }); if (at < total - 1) go(at + 1); };
  const clearStatus = () => setResult(at, { status: undefined });

  const addShot = async (i, dataUrl) => {
    const small = await downscale(dataUrl);
    setResult(i, { shots: [...(results[i]?.shots || []), small] });
  };
  const onPaste = async (e) => {
    const file = [...(e.clipboardData?.items || [])].find((it) => it.type.startsWith('image/'))?.getAsFile();
    if (!file) return;
    e.preventDefault();
    addShot(at, await fileToDataUrl(file));
  };
  const onPickFile = async (e) => {
    const files = [...(e.target.files || [])];
    for (const f of files) await addShot(at, await fileToDataUrl(f));
    e.target.value = '';
  };
  const captureScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, preferCurrentTab: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      await new Promise((r) => setTimeout(r, 250));
      const c = document.createElement('canvas');
      c.width = video.videoWidth; c.height = video.videoHeight;
      c.getContext('2d').drawImage(video, 0, 0);
      stream.getTracks().forEach((t) => t.stop());
      addShot(at, c.toDataURL('image/png'));
    } catch { flash('Capture cancelled. Paste into the note box or add an image file instead.'); }
  };
  const removeShot = (k) => setResult(at, { shots: (cur.shots || []).filter((_, idx) => idx !== k) });

  const importPasted = () => {
    const parsed = parseChecklist(pasteText);
    if (!parsed.items.length) { flash('No steps found. Put one step per line.'); return; }
    const id = `custom:${Date.now()}`;
    persist({ ...store, custom: { ...custom, [id]: parsed } });
    setActiveId(id); setIndex(0); setView('run'); setPasteText('');
  };
  const resetRun = () => {
    if (!window.confirm('Clear all results, notes and screenshots for this checklist?')) return;
    const { [activeId]: _drop, ...rest } = store.results || {};
    persist({ ...store, results: rest });
    setIndex(0); setView('run');
  };

  const meta = { gameKey, when: new Date().toLocaleString() };
  // Copy must run against the window the button was clicked in (the popped-out window has
  // its own clipboard/focus). Falls back to execCommand, then to a select-and-copy box.
  const copyMarkdown = async () => {
    const text = buildMarkdown(list, results, meta);
    const win = pip?.win || window;
    try {
      await win.navigator.clipboard.writeText(text);
      flash('Copied as text'); setCopyBox('');
      return;
    } catch { /* fall through */ }
    try {
      const ta = win.document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      win.document.body.appendChild(ta);
      ta.select();
      const ok = win.document.execCommand('copy');
      ta.remove();
      if (ok) { flash('Copied as text'); setCopyBox(''); return; }
    } catch { /* fall through */ }
    setCopyBox(text);
    flash('Copy was blocked. Select the text below and copy it.');
  };
  const downloadReport = () => {
    const slug = (gameKey || 'test').replace(/[^a-z0-9-]/gi, '_');
    download(`checklist-${slug}-${new Date().toISOString().slice(0, 10)}.html`, buildHtml(list, results, meta), 'text/html');
  };

  // ---- pop out into its own window (Document Picture-in-Picture, Chrome/Edge) ----
  const canPip = typeof window !== 'undefined' && 'documentPictureInPicture' in window;
  const popOut = async () => {
    try {
      const win = await window.documentPictureInPicture.requestWindow({ width: 400, height: 620 });
      document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => win.document.head.appendChild(l.cloneNode(true)));
      win.document.body.style.cssText = `margin:0;background:${C.white};font-family:${BODY}`;
      const root = win.document.createElement('div');
      win.document.body.appendChild(root);
      pipRef.current = win;
      setPip({ win, root });
      win.addEventListener('pagehide', () => { pipRef.current = null; setPip(null); });
    } catch { flash('Pop out was cancelled or is not supported here'); }
  };
  const popIn = () => { pipRef.current?.close?.(); pipRef.current = null; setPip(null); };

  // ---- drag by header (in-page only) ----
  const onHeaderDown = (e) => {
    if (e.target.closest('button, select')) return;
    dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onHeaderMove = (e) => {
    if (!dragRef.current) return;
    setPos({ x: Math.max(0, e.clientX - dragRef.current.dx), y: Math.max(0, e.clientY - dragRef.current.dy) });
  };
  const onHeaderUp = () => { dragRef.current = null; };

  const customIds = Object.keys(custom);
  const pct = total ? Math.round((done / total) * 100) : 0;

  const runner = (
    <div style={{ ...base, display: 'flex', flexDirection: 'column', height: pip ? '100vh' : 'auto', maxHeight: pip ? 'none' : 'calc(100vh - 80px)', color: C.ink, background: C.white }}>
      {/* title + controls */}
      <div
        onPointerDown={pip ? undefined : onHeaderDown} onPointerMove={pip ? undefined : onHeaderMove} onPointerUp={pip ? undefined : onHeaderUp}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: `1px solid ${C.line}`, background: C.soft, cursor: pip ? 'default' : 'move', touchAction: 'none' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: HEADING, fontSize: 15, fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={list.title}>{list.title}</div>
          <div style={{ marginTop: 2 }}><StatusBadge counts={counts} total={total} /></div>
        </div>
        {pip ? (
          <button type="button" onClick={popIn} style={btn('plain', { padding: '5px 9px', fontSize: 12 })}>Bring back</button>
        ) : (
          <>
            {canPip && <button type="button" onClick={popOut} style={btn('plain', { padding: '5px 9px', fontSize: 12 })} title="Open in its own small window so it does not cover the game">Pop out</button>}
            <button type="button" onClick={() => setMinimized(true)} style={btn('plain', { padding: '5px 9px', fontSize: 12 })}>Hide</button>
          </>
        )}
      </div>

      {/* checklist picker — always visible; shows each checklist's status */}
      {(() => {
        const statsOf = (id, l) => tally(l, store.results?.[id] || {});
        const row = (id, l) => {
          const c = statsOf(id, l);
          const finished = l.items.length > 0 && c.open === 0 && c.fail === 0;
          const active = id === activeId;
          return (
            <button
              key={id} type="button"
              onClick={() => { setActiveId(id); setIndex(0); setView('run'); setPickerOpen(false); }}
              style={{ ...base, display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none', borderLeft: `3px solid ${active ? C.accent : 'transparent'}`, background: active ? '#eef2ff' : C.white, padding: '7px 10px', fontSize: 13, fontWeight: finished ? 800 : 600, color: finished ? C.pass : C.ink }}
            >
              <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={l.title}>{l.title}</span>
              <StatusBadge counts={c} total={l.items.length} />
            </button>
          );
        };
        return (
          <div style={{ borderBottom: `1px solid ${C.line}` }}>
            <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ ...label, marginBottom: 0 }}>Checklist</span>
              <button
                type="button" onClick={() => setPickerOpen((o) => !o)}
                style={{ ...base, flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: 700, padding: '6px 8px', borderRadius: 8, border: `1px solid ${C.line}`, background: C.white, color: C.ink }}
              >
                <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{list.title}</span>
                <span style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `6px solid ${C.mute}`, transform: pickerOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
            </div>
            {pickerOpen && (
              <div style={{ maxHeight: '50vh', overflowY: 'auto', borderTop: `1px solid ${C.line}`, background: C.white }}>
                {builtInGroups.map((g) => (
                  <div key={g.label}>
                    <div style={{ ...label, padding: '8px 10px 2px', marginBottom: 0 }}>{g.label}</div>
                    {g.entries.map((en) => row(en.id, en.list))}
                  </div>
                ))}
                {customIds.length > 0 && (
                  <div>
                    <div style={{ ...label, padding: '8px 10px 2px', marginBottom: 0 }}>Pasted by you</div>
                    {customIds.map((id) => row(id, custom[id]))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* progress */}
      <div style={{ height: 4, background: C.line }}>
        <div style={{ width: `${pct}%`, height: '100%', background: counts.fail ? C.fail : C.pass, transition: 'width .25s' }} />
      </div>

      <div style={{ overflowY: 'auto', padding: 12, flex: 1 }}>
        {view === 'new' && (
          <div>
            <div style={label}>Paste your checklist</div>
            <textarea
              value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={9}
              placeholder={'# Title (optional)\n- First step\n  Expected: what should happen\n- [ ] Second step'}
              style={{ ...base, width: '100%', fontSize: 13, padding: 8, border: `1px solid ${C.line}`, borderRadius: 8 }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" onClick={importPasted} style={btn('pass', { flex: 1 })}>Create checklist</button>
              <button type="button" onClick={() => setView('run')} style={btn('plain')}>Cancel</button>
            </div>
          </div>
        )}

        {view === 'more' && (
          <div style={{ display: 'grid', gap: 8 }}>
            <button type="button" onClick={() => setView('new')} style={btn('plain')}>New checklist from pasted text</button>
            <div style={{ ...label, marginTop: 6 }}>Share</div>
            <button type="button" onClick={downloadReport} style={btn('pass')}>Download report (.html with screenshots)</button>
            <button type="button" onClick={copyMarkdown} style={btn('plain')}>Copy as text</button>
            {copyBox && (
              <textarea
                readOnly value={copyBox} rows={8} onFocus={(e) => e.target.select()}
                style={{ ...base, width: '100%', fontSize: 12, padding: 8, border: `1px solid ${C.line}`, borderRadius: 8 }}
              />
            )}
            <div style={{ ...label, marginTop: 6 }}>Danger</div>
            <button type="button" onClick={resetRun} style={btn('fail')}>Clear all results for this checklist</button>
            <button type="button" onClick={() => setView('run')} style={btn('quiet', { justifySelf: 'start' })}>Back to steps</button>
          </div>
        )}

        {view === 'run' && item && (
          <>
            {/* step strip */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
              {list.items.map((_, i) => {
                const s = results[i]?.status;
                const isCur = i === at;
                return (
                  <button
                    key={i} type="button" onClick={() => go(i)} title={`Step ${i + 1}${s ? `: ${STATUS_LABEL[s]}` : ''}`}
                    style={{
                      ...base, width: 28, height: 28, borderRadius: 6, fontSize: 12, fontWeight: 800, cursor: 'pointer', padding: 0,
                      border: `2px solid ${isCur ? C.accent : s ? STATUS_COLOR[s] : C.line}`,
                      background: s ? STATUS_COLOR[s] : C.white, color: s ? '#fff' : C.ink,
                    }}
                  >{i + 1}</button>
                );
              })}
            </div>

            <div style={{ fontSize: 12, fontWeight: 800, color: C.accent, marginBottom: 6 }}>
              STEP {at + 1} OF {total}
              {cur.status && <span style={{ marginLeft: 8, color: STATUS_COLOR[cur.status] }}>{STATUS_LABEL[cur.status].toUpperCase()}</span>}
            </div>

            <div style={label}>Do this</div>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, marginBottom: 10 }}>{item.text}</div>

            {item.expect && (
              <div style={{ background: C.passBg, border: '1px solid #a7f3d0', borderRadius: 8, padding: '8px 10px', marginBottom: 12 }}>
                <div style={{ ...label, color: C.pass }}>Should happen</div>
                <div style={{ fontSize: 13, lineHeight: 1.4 }}>{item.expect}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <button type="button" onClick={passAndNext} style={btn('pass', { flex: 1 })}>{cur.status === 'pass' ? 'Passed - next' : 'Pass and next'}</button>
              <button type="button" onClick={markFail} style={btn('fail', { flex: 1, ...(cur.status === 'fail' && { background: C.failBg }) })}>{cur.status === 'fail' ? 'Marked failed' : 'Fail'}</button>
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              <button type="button" onClick={markSkip} style={btn('quiet')}>Skip this step</button>
              {cur.status && <button type="button" onClick={clearStatus} style={btn('quiet')}>Clear result</button>}
            </div>

            <div style={label}>Notes {cur.status === 'fail' ? '(what went wrong?)' : '(optional)'}</div>
            <textarea
              value={cur.note || ''} rows={3}
              onChange={(e) => setResult(at, { note: e.target.value })}
              onPaste={onPaste}
              placeholder="Type what you saw. You can paste a screenshot here with Ctrl+V."
              style={{ ...base, width: '100%', fontSize: 13, padding: 8, border: `1px solid ${cur.status === 'fail' ? C.fail : C.line}`, borderRadius: 8 }}
            />
            <div style={{ display: 'flex', gap: 6, margin: '6px 0' }}>
              <label style={btn('plain', { display: 'inline-block', fontSize: 12, padding: '6px 10px' })}>
                Add image
                <input type="file" accept="image/*" multiple hidden onChange={onPickFile} />
              </label>
              <button type="button" onClick={captureScreen} style={btn('plain', { fontSize: 12, padding: '6px 10px' })}>Capture this tab</button>
            </div>
            {(cur.shots || []).map((s, k) => (
              <div key={k} style={{ position: 'relative', marginTop: 6 }}>
                <img src={s} alt="" style={{ width: '100%', borderRadius: 6, border: `1px solid ${C.line}`, display: 'block' }} />
                <button type="button" onClick={() => removeShot(k)} style={btn('plain', { position: 'absolute', top: 4, right: 4, padding: '2px 8px', fontSize: 12 })}>Remove</button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* footer */}
      {view === 'run' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderTop: `1px solid ${C.line}`, background: C.soft }}>
          <button type="button" onClick={() => go(at - 1)} disabled={at === 0} style={btn('plain', { opacity: at === 0 ? 0.4 : 1 })}>Back</button>
          <button type="button" onClick={() => go(at + 1)} disabled={at >= total - 1} style={btn('plain', { opacity: at >= total - 1 ? 0.4 : 1 })}>Next</button>
          <span style={{ flex: 1 }} />
          <button type="button" onClick={() => setView('more')} style={btn('plain')}>Share / more</button>
        </div>
      )}
      {(toast || saveWarn) && (
        <div style={{ padding: '6px 12px', fontSize: 12, color: saveWarn ? C.fail : C.pass, background: C.soft }}>
          {saveWarn ? 'Browser storage is full, so screenshots may not be saved. Download the report now.' : toast}
        </div>
      )}
    </div>
  );

  // Popped out: render into the external window; leave a small marker in the page.
  if (pip) {
    return (
      <>
        {createPortal(runner, pip.root)}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          style={{ ...base, position: 'fixed', right: 12, bottom: 12, zIndex: 2147483000, background: C.white, border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 14px rgba(0,0,0,.2)' }}
        >
          Checklist is in its own window ({done}/{total}).{' '}
          <button type="button" onClick={popIn} style={btn('quiet', { padding: 0, color: C.accent })}>Bring back</button>
        </div>
      </>
    );
  }

  if (minimized) {
    return (
      <button
        type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => setMinimized(false)}
        style={btn('plain', { position: 'fixed', left: pos.x, top: pos.y, zIndex: 2147483000, boxShadow: '0 4px 14px rgba(0,0,0,.25)', background: C.ink, color: '#fff', borderColor: C.ink })}
      >
        Checklist {done}/{total}{counts.fail ? ` (${counts.fail} failed)` : ''}
      </button>
    );
  }

  return (
    <div
      // The panel must never reach the game: clicking it is not a "scene touch".
      onPointerDown={(e) => e.stopPropagation()}
      style={{ position: 'fixed', left: pos.x, top: pos.y, width: 360, zIndex: 2147483000, border: `1px solid ${C.line}`, borderRadius: 12, boxShadow: '0 10px 32px rgba(15,23,42,.3)', overflow: 'hidden', background: C.white }}
    >
      {runner}
    </div>
  );
}
