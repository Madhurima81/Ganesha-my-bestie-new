/**
 * Layout Editor — dev-only visual tool for placing game assets on a scene
 * background and exporting percent-based coordinates.
 *
 * Served by /layout-editor.html. NOT part of the production app.
 *
 *   npm run dev  →  http://localhost:5173/layout-editor.html?set=bridge
 *
 * Why this exists: the in-game "Layout Debug" panels (e.g. KurumedevaGame.jsx)
 * only let you nudge markers that are already wired into the code — they
 * don't let you choose which asset appears in which stage before any code
 * is written. This tool works the other way round: pick a scene/stage, drag
 * any asset from the pack onto the background, resize/rotate it, and export
 * a JSON blob of {src, l, t, w, r} per scene to hand back for wiring in.
 *
 * To add a new asset pack: add an entry to ASSET_SETS below with a
 * import.meta.glob() pointing at its folder, then open with ?set=<key>.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Asset sets — add one entry per asset pack / zone you want to lay out.
// import.meta.glob with eager:true resolves each match to its dev-server URL.
// ---------------------------------------------------------------------------
const bridgeAssets = import.meta.glob(
  '../zones/shloka-river/scenes/Scene3/assets/images/bridge/**/*.png',
  { eager: true, query: '?url', import: 'default' }
);

const ASSET_SETS = {
  bridge: {
    label: 'Kurume Deva — Bridge pack',
    assets: bridgeAssets,
    defaultBackground: Object.entries(bridgeAssets).find(([p]) => p.includes('/Background/'))?.[1] || null,
    defaultScenes: [
      'Opening (broken bridge)',
      'Try & fail (logs)',
      'Ask Elephant',
      'Support placed',
      'Ask Monkey (ropes)',
      'Ropes tied',
      'Ask Monkey (planks)',
      'Bridge complete',
      'Crossing',
      'Reunion',
    ],
  },
};

function assetLabel(path) {
  const file = path.split('/').pop().replace(/\.png$/, '');
  return file;
}

const STORAGE_KEY = (setKey) => `ganeshaLayoutEditor:${setKey}`;

function loadSaved(setKey, fallbackScenes, fallbackBg) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY(setKey));
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const scenes = {};
  fallbackScenes.forEach((name) => {
    scenes[name] = { background: fallbackBg, items: [] };
  });
  return { activeScene: fallbackScenes[0], scenes };
}

let nextId = 1;
const newId = () => `item-${nextId++}`;

export default function LayoutEditor() {
  const params = new URLSearchParams(window.location.search);
  const setKey = params.get('set') && ASSET_SETS[params.get('set')] ? params.get('set') : 'bridge';
  const set = ASSET_SETS[setKey];

  const [state, setState] = useState(() => loadSaved(setKey, set.defaultScenes, set.defaultBackground));
  const [selectedId, setSelectedId] = useState(null);
  const [newSceneName, setNewSceneName] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  const canvasRef = useRef(null);
  const dragRef = useRef(null); // { id, mode: 'move'|'resize', startL, startT, startW, offsetL, offsetT, startX }

  // Autosave
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY(setKey), JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, setKey]);

  const activeScene = state.scenes[state.activeScene] || { background: set.defaultBackground, items: [] };

  const setActiveScene = (name) => {
    setState((s) => ({ ...s, activeScene: name }));
    setSelectedId(null);
  };

  const updateActiveSceneItems = useCallback((fn) => {
    setState((s) => {
      const scene = s.scenes[s.activeScene];
      return {
        ...s,
        scenes: { ...s.scenes, [s.activeScene]: { ...scene, items: fn(scene.items) } },
      };
    });
  }, []);

  const addScene = () => {
    const name = newSceneName.trim();
    if (!name || state.scenes[name]) return;
    setState((s) => ({
      ...s,
      scenes: { ...s.scenes, [name]: { background: set.defaultBackground, items: [] } },
      activeScene: name,
    }));
    setNewSceneName('');
    setSelectedId(null);
  };

  const deleteScene = (name) => {
    setState((s) => {
      const next = { ...s.scenes };
      delete next[name];
      let names = Object.keys(next);
      if (names.length === 0) {
        next['Scene 1'] = { background: set.defaultBackground, items: [] };
        names = ['Scene 1'];
      }
      return { ...s, scenes: next, activeScene: s.activeScene === name ? names[0] : s.activeScene };
    });
    setSelectedId(null);
  };

  const addAsset = (src) => {
    const id = newId();
    updateActiveSceneItems((items) => [
      ...items,
      { id, src, l: 50 + (items.length % 5) * 3, t: 50 + (items.length % 5) * 3, w: 14, r: 0 },
    ]);
    setSelectedId(id);
  };

  const setBackground = (src) => {
    setState((s) => ({
      ...s,
      scenes: { ...s.scenes, [s.activeScene]: { ...s.scenes[s.activeScene], background: src } },
    }));
  };

  const removeSelected = () => {
    if (!selectedId) return;
    updateActiveSceneItems((items) => items.filter((it) => it.id !== selectedId));
    setSelectedId(null);
  };

  const reorderSelected = (dir) => {
    if (!selectedId) return;
    updateActiveSceneItems((items) => {
      const idx = items.findIndex((it) => it.id === selectedId);
      if (idx === -1) return items;
      const next = [...items];
      const swapWith = dir === 'front' ? items.length - 1 : 0;
      if (idx === swapWith) return items;
      const [item] = next.splice(idx, 1);
      if (dir === 'front') next.push(item); else next.unshift(item);
      return next;
    });
  };

  const updateSelected = (patch) => {
    updateActiveSceneItems((items) => items.map((it) => (it.id === selectedId ? { ...it, ...patch } : it)));
  };

  const getStagePoint = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      l: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      t: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    };
  };

  const startDrag = (e, item, mode) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(item.id);
    const point = getStagePoint(e.clientX, e.clientY);
    dragRef.current = {
      id: item.id,
      mode,
      startL: item.l,
      startT: item.t,
      startW: item.w,
      offsetL: point.l - item.l,
      offsetT: point.t - item.t,
      startX: e.clientX,
    };
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onDragEnd);
  };

  const onDragMove = (e) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.mode === 'move') {
      const point = getStagePoint(e.clientX, e.clientY);
      updateActiveSceneItems((items) => items.map((it) => (
        it.id === drag.id
          ? { ...it, l: Number((point.l - drag.offsetL).toFixed(1)), t: Number((point.t - drag.offsetT).toFixed(1)) }
          : it
      )));
    } else if (drag.mode === 'resize') {
      const dx = e.clientX - drag.startX;
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaPct = (dx / rect.width) * 100;
      const nextW = Math.max(2, Math.min(90, drag.startW + deltaPct));
      updateActiveSceneItems((items) => items.map((it) => (
        it.id === drag.id ? { ...it, w: Number(nextW.toFixed(1)) } : it
      )));
    }
  };

  const onDragEnd = () => {
    dragRef.current = null;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragEnd);
  };

  useEffect(() => () => {
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedItem = activeScene.items.find((it) => it.id === selectedId) || null;

  const exportJson = useMemo(() => JSON.stringify(state.scenes, null, 2), [state.scenes]);

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopyStatus('Copied!');
    } catch {
      setCopyStatus('Copy failed — select the text manually');
    }
    setTimeout(() => setCopyStatus(''), 2000);
  };

  const downloadExport = () => {
    const blob = new Blob([exportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${setKey}-layout.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyImport = () => {
    try {
      const parsed = JSON.parse(importText);
      const names = Object.keys(parsed);
      if (!names.length) return;
      setState((s) => ({ ...s, scenes: parsed, activeScene: names[0] }));
      setShowImport(false);
      setImportText('');
      setSelectedId(null);
    } catch {
      setCopyStatus('Invalid JSON');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  const resetScene = () => {
    if (!window.confirm(`Clear all placed items in "${state.activeScene}"?`)) return;
    updateActiveSceneItems(() => []);
    setSelectedId(null);
  };

  const assetEntries = Object.entries(set.assets);

  return (
    <div style={styles.app}>
      <div style={styles.topbar}>
        <span style={styles.brand}>Layout Editor</span>
        <span style={styles.setLabel}>{set.label}</span>
        <div style={{ flex: 1 }} />
        <button style={styles.btn} onClick={() => setShowImport((v) => !v)}>Import JSON</button>
        <button style={styles.btn} onClick={copyExport}>Copy JSON</button>
        <button style={styles.btn} onClick={downloadExport}>Download JSON</button>
        {copyStatus && <span style={styles.copyStatus}>{copyStatus}</span>}
      </div>

      {showImport && (
        <div style={styles.importPanel}>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste a previously exported scenes JSON here to restore it..."
            style={styles.importTextarea}
          />
          <button style={styles.btn} onClick={applyImport}>Load</button>
        </div>
      )}

      <div style={styles.body}>
        {/* Scenes sidebar */}
        <div style={styles.scenesPanel}>
          <div style={styles.panelTitle}>Scenes</div>
          {Object.keys(state.scenes).map((name) => (
            <div
              key={name}
              style={{ ...styles.sceneRow, ...(name === state.activeScene ? styles.sceneRowActive : {}) }}
              onClick={() => setActiveScene(name)}
            >
              <span style={styles.sceneName}>{name}</span>
              <span style={styles.sceneCount}>{state.scenes[name].items.length}</span>
              <button
                style={styles.sceneDelete}
                onClick={(e) => { e.stopPropagation(); deleteScene(name); }}
                title="Delete scene"
              >×</button>
            </div>
          ))}
          <div style={styles.addSceneRow}>
            <input
              value={newSceneName}
              onChange={(e) => setNewSceneName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addScene()}
              placeholder="New scene name"
              style={styles.input}
            />
            <button style={styles.btn} onClick={addScene}>+ Add</button>
          </div>
        </div>

        {/* Canvas */}
        <div style={styles.canvasWrap}>
          <div
            ref={canvasRef}
            style={{
              ...styles.canvas,
              backgroundImage: activeScene.background ? `url(${activeScene.background})` : 'none',
            }}
            onPointerDown={() => setSelectedId(null)}
          >
            {activeScene.items.map((item) => (
              <div
                key={item.id}
                onPointerDown={(e) => startDrag(e, item, 'move')}
                style={{
                  position: 'absolute',
                  left: `${item.l}%`,
                  top: `${item.t}%`,
                  width: `${item.w}%`,
                  transform: `translate(-50%, -50%) rotate(${item.r || 0}deg)`,
                  cursor: 'grab',
                  outline: item.id === selectedId ? '2px solid #4fc3f7' : 'none',
                  outlineOffset: 2,
                }}
              >
                <img src={item.src} alt="" draggable={false} style={{ width: '100%', display: 'block', pointerEvents: 'none' }} />
                {item.id === selectedId && (
                  <div
                    onPointerDown={(e) => startDrag(e, item, 'resize')}
                    title="Drag to resize"
                    style={styles.resizeHandle}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={styles.canvasHint}>
            Click a thumbnail to add it to <b>{state.activeScene}</b>. Drag to move,
            drag the blue corner to resize. Coordinates are % of this canvas —
            matches how the real game positions things.
          </div>
        </div>

        {/* Right: palette + inspector */}
        <div style={styles.rightPanel}>
          {selectedItem && (
            <div style={styles.inspector}>
              <div style={styles.panelTitle}>{assetLabel(selectedItem.src)}</div>
              <label style={styles.sliderRow}>
                <span>left</span>
                <input type="range" min={0} max={100} step={0.1} value={selectedItem.l}
                  onChange={(e) => updateSelected({ l: Number(e.target.value) })} />
                <input type="number" value={selectedItem.l}
                  onChange={(e) => updateSelected({ l: Number(e.target.value) })} style={styles.numInput} />
              </label>
              <label style={styles.sliderRow}>
                <span>top</span>
                <input type="range" min={0} max={100} step={0.1} value={selectedItem.t}
                  onChange={(e) => updateSelected({ t: Number(e.target.value) })} />
                <input type="number" value={selectedItem.t}
                  onChange={(e) => updateSelected({ t: Number(e.target.value) })} style={styles.numInput} />
              </label>
              <label style={styles.sliderRow}>
                <span>width</span>
                <input type="range" min={2} max={90} step={0.1} value={selectedItem.w}
                  onChange={(e) => updateSelected({ w: Number(e.target.value) })} />
                <input type="number" value={selectedItem.w}
                  onChange={(e) => updateSelected({ w: Number(e.target.value) })} style={styles.numInput} />
              </label>
              <label style={styles.sliderRow}>
                <span>rotate</span>
                <input type="range" min={-180} max={180} step={1} value={selectedItem.r || 0}
                  onChange={(e) => updateSelected({ r: Number(e.target.value) })} />
                <input type="number" value={selectedItem.r || 0}
                  onChange={(e) => updateSelected({ r: Number(e.target.value) })} style={styles.numInput} />
              </label>
              <div style={styles.inspectorActions}>
                <button style={styles.btn} onClick={() => reorderSelected('back')}>Send back</button>
                <button style={styles.btn} onClick={() => reorderSelected('front')}>Bring front</button>
                <button style={styles.btnDanger} onClick={removeSelected}>Delete</button>
              </div>
              <pre style={styles.readout}>{JSON.stringify(selectedItem, null, 2)}</pre>
            </div>
          )}

          <div style={styles.paletteHeader}>
            <div style={styles.panelTitle}>Assets ({assetEntries.length})</div>
            <button style={styles.btn} onClick={resetScene}>Clear scene</button>
          </div>
          <div style={styles.palette}>
            {assetEntries.map(([path, url]) => (
              <div key={path} style={styles.paletteItem}>
                <button style={styles.paletteThumbBtn} onClick={() => addAsset(url)} title={`Add ${assetLabel(path)}`}>
                  <img src={url} alt="" style={styles.paletteThumb} />
                </button>
                <div style={styles.paletteLabel}>{assetLabel(path)}</div>
                <button style={styles.paletteBgBtn} onClick={() => setBackground(url)}>set as bg</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  app: {
    fontFamily: "'Nunito', sans-serif",
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#f4f1fa',
    color: '#2c2350',
  },
  topbar: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
    background: '#2c2350', color: '#fff', flexShrink: 0,
  },
  brand: { fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 18 },
  setLabel: { opacity: 0.8, fontSize: 13 },
  copyStatus: { fontSize: 13, color: '#a5e8b0' },
  importPanel: { display: 'flex', gap: 8, padding: 10, background: '#ece7fb', flexShrink: 0 },
  importTextarea: { flex: 1, height: 80, fontFamily: 'monospace', fontSize: 12 },
  body: { flex: 1, display: 'flex', minHeight: 0 },
  scenesPanel: { width: 230, borderRight: '1px solid #ddd', padding: 12, overflowY: 'auto', background: '#fff', flexShrink: 0 },
  panelTitle: { fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#5b3fa0' },
  sceneRow: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 8px', borderRadius: 8,
    cursor: 'pointer', fontSize: 13.5, marginBottom: 4,
  },
  sceneRowActive: { background: '#e3d9fb', fontWeight: 700 },
  sceneName: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  sceneCount: { fontSize: 11, color: '#888', background: '#eee', borderRadius: 8, padding: '1px 6px' },
  sceneDelete: { border: 'none', background: 'none', cursor: 'pointer', color: '#c0392b', fontWeight: 700 },
  addSceneRow: { display: 'flex', gap: 6, marginTop: 10 },
  input: { flex: 1, minWidth: 0, padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc', fontSize: 12.5 },
  canvasWrap: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, padding: 12, gap: 8 },
  canvas: {
    flex: 1, position: 'relative', backgroundColor: '#cfd8dc', backgroundSize: 'cover',
    backgroundPosition: 'center', borderRadius: 12, overflow: 'hidden', border: '1px solid #ccc',
    touchAction: 'none',
  },
  canvasHint: { fontSize: 12, color: '#555', flexShrink: 0 },
  resizeHandle: {
    position: 'absolute', right: -6, bottom: -6, width: 14, height: 14, borderRadius: 4,
    background: '#4fc3f7', border: '2px solid #fff', cursor: 'nwse-resize',
  },
  rightPanel: { width: 300, borderLeft: '1px solid #ddd', background: '#fff', overflowY: 'auto', padding: 12, flexShrink: 0 },
  inspector: { borderBottom: '2px solid #eee', paddingBottom: 12, marginBottom: 12 },
  sliderRow: { display: 'grid', gridTemplateColumns: '46px 1fr 56px', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 12 },
  numInput: { width: '100%', fontSize: 12, padding: '2px 4px' },
  inspectorActions: { display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  readout: { fontSize: 10.5, background: '#f6f6f6', padding: 8, borderRadius: 6, marginTop: 8, maxHeight: 110, overflow: 'auto' },
  paletteHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  palette: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 },
  paletteItem: { border: '1px solid #eee', borderRadius: 8, padding: 6, textAlign: 'center' },
  paletteThumbBtn: { border: 'none', background: '#f7f7f7', borderRadius: 6, padding: 4, cursor: 'pointer', width: '100%' },
  paletteThumb: { width: '100%', height: 60, objectFit: 'contain', display: 'block' },
  paletteLabel: { fontSize: 10, marginTop: 4, wordBreak: 'break-word', lineHeight: 1.2 },
  paletteBgBtn: { fontSize: 9.5, marginTop: 4, padding: '2px 4px', cursor: 'pointer' },
  btn: {
    fontFamily: "'Nunito', sans-serif", fontSize: 12.5, padding: '6px 10px', borderRadius: 6,
    border: '1px solid #ccc', background: '#fff', cursor: 'pointer',
  },
  btnDanger: {
    fontFamily: "'Nunito', sans-serif", fontSize: 12.5, padding: '6px 10px', borderRadius: 6,
    border: '1px solid #e0a0a0', background: '#fdecec', color: '#c0392b', cursor: 'pointer',
  },
};
