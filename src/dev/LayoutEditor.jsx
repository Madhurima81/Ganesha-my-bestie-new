/**
 * Layout Editor — dev-only visual tool for placing game assets on a scene
 * background, documenting the SHOW → ACTION → AFTER flow for that scene, and
 * exporting both as JSON to hand back for wiring in.
 *
 * Served by /layout-editor.html. NOT part of the production app.
 *
 *   npm run dev  →  http://localhost:5173/layout-editor.html?set=bridge
 *
 * Why this exists: the in-game "Layout Debug" panels (e.g. KurumedevaGame.jsx)
 * only let you nudge markers that are already wired into the code — they
 * don't let you choose which asset appears in which stage, or say what the
 * child does and what happens next, before any code is written. This tool
 * works the other way round: pick a scene/stage, drag any asset from the
 * pack onto the background, resize/rotate/flip it, write down what it shows
 * and what happens on interaction, and export a JSON blob of both per scene.
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

// Default scene list + the intended SHOW → ACTION → AFTER flow for each —
// ported from the approved 8-scene design doc so the tool starts pre-filled
// with the real story, not blank placeholders. Editable per scene in the UI.
const BRIDGE_SCENES = [
  {
    name: '1. Opening — See the problem',
    goal: 'Beaver wants to reach Baby, but the bridge is broken.',
    show: [
      'Broken bridge anchored across the river',
      'Mother Beaver on LEFT bank',
      'Baby Beaver on RIGHT bank',
      '2-log support piece lying on LEFT bank near Beaver',
      'Elephant visible farther back; Monkey absent',
    ],
    action: 'Baby waves. Beaver looks across, then tries to move the heavy support logs.',
    after: 'The logs barely move. Beaver looks toward Elephant. Prompt: "Ask Elephant for help."',
  },
  {
    name: '2. Ask Elephant',
    goal: 'The child causes Beaver to ask for appropriate help.',
    show: [
      'Broken bridge + support logs still on bank',
      'Beaver asking-for-help pose',
      'Elephant available/highlighted',
      'Baby still waiting across river',
    ],
    action: 'Tap Elephant.',
    after: 'Elephant approaches the logs. Transition to the pulling action.',
  },
  {
    name: '3. Place the support logs',
    goal: 'Elephant helps with something Beaver cannot move alone.',
    show: [
      'Broken bridge',
      '2-log support piece moving toward central gap',
      'Elephant pulling pose',
      'Beaver pushing/guiding pose',
    ],
    action: 'Simple drag / press-and-hold to help pull the support piece into the gap.',
    after: 'Two support logs now bridge the central structural gap. Walking planks are still missing and rope joins are loose.',
  },
  {
    name: '4. Ask Monkey',
    goal: 'The new support is in place but needs securing.',
    show: [
      'Support logs installed',
      '2–3 middle walking planks still missing',
      'Loose rope ends at the support joins',
      'Monkey appears nearby',
      'Beaver near the unstable bridge',
    ],
    action: 'A tiny bridge wobble. Beaver looks toward Monkey. Tap Monkey.',
    after: 'Monkey moves onto the bridge ready to tie the loose rope.',
  },
  {
    name: '5. Monkey secures the bridge',
    goal: 'Secure the new support so it is stable.',
    show: [
      'Loose-rope bridge state',
      'Monkey tying pose at ONE join',
      'Beaver watching nearby',
    ],
    action: 'Tap/hold once while Monkey wraps and pulls the rope tight.',
    after: 'First lashing completes; second lashing appears in a short completion animation. Wobble stops. Middle walking planks are still missing.',
  },
  {
    name: '6. Finish the walking path',
    goal: 'Complete the surface so Beaver can actually cross.',
    show: [
      'Secured support logs',
      '2–3 missing middle planks',
      'Beaver placing/guiding plank pose',
      'Elephant and Monkey nearby as helpers',
    ],
    action: 'Place one meaningful plank. Helpers steady/pass pieces; remaining planks complete automatically.',
    after: 'Swap to the final completed bridge state. No gaps remain.',
  },
  {
    name: '7. Cross the bridge',
    goal: 'Let the child see the practical result of asking for help.',
    show: [
      'Completed bridge',
      'Baby waiting on RIGHT bank',
      'Beaver at LEFT entrance',
      'Elephant + Monkey happy nearby',
    ],
    action: 'Automatic short crossing animation using Beaver crossing pose.',
    after: 'Beaver reaches the right bank.',
  },
  {
    name: '8. Reunion / meaning',
    goal: 'Emotional payoff first, then connect the experience to Kurume Deva.',
    show: [
      'Beaver + baby reunion on RIGHT bank',
      'Completed bridge still visible',
      'Happy Elephant + Monkey as restrained end reactions',
    ],
    action: 'No puzzle. Let the reunion breathe briefly.',
    after: 'Then reveal/play Ku → Ru → Me → Deva, full "Kurume Deva", and "I can ask for help when I need it."',
  },
];

const ASSET_SETS = {
  bridge: {
    label: 'Kurume Deva — Bridge pack',
    assets: bridgeAssets,
    defaultBackground: Object.entries(bridgeAssets).find(([p]) => p.includes('/Background/'))?.[1] || null,
    defaultSceneMeta: BRIDGE_SCENES,
  },
};

const EMPTY_META = { goal: '', show: [], action: '', after: '' };

function assetLabel(path) {
  const file = path.split('/').pop().replace(/\.png$/, '');
  return file;
}

const STORAGE_KEY = (setKey) => `ganeshaLayoutEditor:${setKey}`;

// Non-destructive: always includes the pack's default scenes (with their
// SHOW/ACTION/AFTER flow), then layers in whatever's actually saved —
// preserving placed items/background, filling in meta only if missing, and
// keeping any extra scenes you added yourself.
function loadSaved(setKey, defaultSceneMeta, fallbackBg) {
  const scenes = {};
  defaultSceneMeta.forEach(({ name, ...meta }) => {
    scenes[name] = { background: fallbackBg, items: [], meta };
  });

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY(setKey));
    if (raw) {
      const saved = JSON.parse(raw);
      Object.entries(saved.scenes || {}).forEach(([name, sceneData]) => {
        scenes[name] = {
          background: sceneData.background ?? fallbackBg,
          items: sceneData.items || [],
          meta: sceneData.meta || scenes[name]?.meta || { ...EMPTY_META },
        };
      });
      const activeScene = saved.activeScene && scenes[saved.activeScene]
        ? saved.activeScene
        : Object.keys(scenes)[0];
      return { activeScene, scenes };
    }
  } catch { /* ignore */ }

  return { activeScene: defaultSceneMeta[0]?.name, scenes };
}

let nextId = 1;
const newId = () => `item-${nextId++}`;

export default function LayoutEditor() {
  const params = new URLSearchParams(window.location.search);
  const setKey = params.get('set') && ASSET_SETS[params.get('set')] ? params.get('set') : 'bridge';
  const set = ASSET_SETS[setKey];

  const [state, setState] = useState(() => loadSaved(setKey, set.defaultSceneMeta, set.defaultBackground));
  const [selectedId, setSelectedId] = useState(null);
  const [newSceneName, setNewSceneName] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [flowCollapsed, setFlowCollapsed] = useState(false);

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
      scenes: { ...s.scenes, [name]: { background: set.defaultBackground, items: [], meta: { ...EMPTY_META } } },
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
        next['Scene 1'] = { background: set.defaultBackground, items: [], meta: { ...EMPTY_META } };
        names = ['Scene 1'];
      }
      return { ...s, scenes: next, activeScene: s.activeScene === name ? names[0] : s.activeScene };
    });
    setSelectedId(null);
  };

  const updateActiveSceneMeta = useCallback((patch) => {
    setState((s) => {
      const scene = s.scenes[s.activeScene];
      return {
        ...s,
        scenes: { ...s.scenes, [s.activeScene]: { ...scene, meta: { ...(scene.meta || EMPTY_META), ...patch } } },
      };
    });
  }, []);

  const addAsset = (src) => {
    const id = newId();
    updateActiveSceneItems((items) => [
      ...items,
      { id, src, l: 50 + (items.length % 5) * 3, t: 50 + (items.length % 5) * 3, w: 14, r: 0, flip: 1, opacity: 100 },
    ]);
    setSelectedId(id);
  };

  const duplicateSelected = () => {
    if (!selectedId) return;
    const id = newId();
    updateActiveSceneItems((items) => {
      const src = items.find((it) => it.id === selectedId);
      if (!src) return items;
      return [...items, { ...src, id, l: Math.min(96, src.l + 4), t: Math.min(96, src.t + 4) }];
    });
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
          <div style={styles.flowPanel}>
            <div style={styles.flowHeader} onClick={() => setFlowCollapsed((v) => !v)}>
              <span style={styles.panelTitle}>Scene flow — SHOW → ACTION → AFTER</span>
              <button style={styles.btn}>{flowCollapsed ? 'Expand' : 'Collapse'}</button>
            </div>
            {!flowCollapsed && (
              <div style={styles.flowBody}>
                <label style={styles.flowField}>
                  <span>Goal</span>
                  <input
                    value={activeScene.meta?.goal || ''}
                    onChange={(e) => updateActiveSceneMeta({ goal: e.target.value })}
                    placeholder="What is this scene trying to teach or set up?"
                    style={styles.input}
                  />
                </label>
                <label style={styles.flowField}>
                  <span>Show (one per line)</span>
                  <textarea
                    value={(activeScene.meta?.show || []).join('\n')}
                    onChange={(e) => updateActiveSceneMeta({ show: e.target.value.split('\n') })}
                    placeholder={'Broken bridge across the river\nMother Beaver on left bank\n...'}
                    style={styles.flowTextarea}
                  />
                </label>
                <label style={styles.flowField}>
                  <span>Action (what the child does)</span>
                  <textarea
                    value={activeScene.meta?.action || ''}
                    onChange={(e) => updateActiveSceneMeta({ action: e.target.value })}
                    style={styles.flowTextareaSmall}
                  />
                </label>
                <label style={styles.flowField}>
                  <span>After (what happens next)</span>
                  <textarea
                    value={activeScene.meta?.after || ''}
                    onChange={(e) => updateActiveSceneMeta({ after: e.target.value })}
                    style={styles.flowTextareaSmall}
                  />
                </label>
              </div>
            )}
          </div>
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
                  opacity: (item.opacity ?? 100) / 100,
                  transform: `translate(-50%, -50%) rotate(${item.r || 0}deg) scaleX(${item.flip ?? 1})`,
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
              <label style={styles.sliderRow}>
                <span>opacity</span>
                <input type="range" min={20} max={100} step={1} value={selectedItem.opacity ?? 100}
                  onChange={(e) => updateSelected({ opacity: Number(e.target.value) })} />
                <input type="number" value={selectedItem.opacity ?? 100}
                  onChange={(e) => updateSelected({ opacity: Number(e.target.value) })} style={styles.numInput} />
              </label>
              <div style={styles.inspectorActions}>
                <button style={styles.btn} onClick={() => updateSelected({ flip: (selectedItem.flip ?? 1) * -1 })}>Flip</button>
                <button style={styles.btn} onClick={duplicateSelected}>Duplicate</button>
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
  flowPanel: { background: '#fff', border: '1px solid #e3d9fb', borderRadius: 10, padding: '10px 12px', flexShrink: 0 },
  flowHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' },
  flowBody: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 },
  flowField: { display: 'flex', flexDirection: 'column', gap: 3, fontSize: 12, fontWeight: 700, color: '#5b3fa0' },
  flowTextarea: { fontFamily: "'Nunito', sans-serif", fontWeight: 400, fontSize: 12.5, color: '#2c2350', padding: 8, borderRadius: 6, border: '1px solid #ccc', minHeight: 70, resize: 'vertical' },
  flowTextareaSmall: { fontFamily: "'Nunito', sans-serif", fontWeight: 400, fontSize: 12.5, color: '#2c2350', padding: 8, borderRadius: 6, border: '1px solid #ccc', minHeight: 40, resize: 'vertical' },
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
