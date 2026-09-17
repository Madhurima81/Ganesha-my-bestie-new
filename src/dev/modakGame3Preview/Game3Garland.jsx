// DEV-ONLY preview of Game 3 (Garland Build -> Offer to Ganesha), per
// Madhurima's locked spec (2026-09-16). Self-contained (no SceneManager),
// testable at /dev/game-test?game=modak-game3-new without touching the live
// NewModakSceneV7.jsx. Flowers visually emerge from Mooshika's basket on
// entry for continuity with Game 2, instead of just appearing.
//
// Locked rules: GARLAND_SLOTS are invisible (no placement-circle hints);
// flower colour/order is never a puzzle (next slot always takes whichever
// flower was tapped); flowers automatically thread onto the next spot.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './Game3Garland.css';

import flowerPink from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-flower-coral.webp';
import flowerCream from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-flower-cream.webp';
import garlandString from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-garland-empty.webp';
import completedGarland from '../../zones/symbol-mountain/scenes/modak/assets/images/fj-garland-complete.webp';
import mooshikaBasket from '../../zones/symbol-mountain/scenes/modak/assets/images/mooshika-turned-game2.webp';
import ganesha from '../../zones/symbol-mountain/scenes/modak/assets/images/ganesha-game3-new.webp';
import forestBackground from '../../zones/symbol-mountain/scenes/modak/assets/images/modak-fj-bg.webp';

const PHASES = { BUILD: 'GARLAND_BUILD', READY: 'GARLAND_READY', OFFERED: 'GARLAND_OFFERED', MODAK_REVEAL: 'MODAK_REVEAL' };

const FLOWERS = [
  { id: 'flower-1', src: flowerPink, x: 18, y: 23 },
  { id: 'flower-2', src: flowerCream, x: 11, y: 52 },
  { id: 'flower-3', src: flowerPink, x: 22, y: 79 },
  { id: 'flower-4', src: flowerCream, x: 82, y: 23 },
  { id: 'flower-5', src: flowerPink, x: 89, y: 52 },
  { id: 'flower-6', src: flowerCream, x: 78, y: 79 },
];

// Hidden placement positions — child never sees these; any successful drop
// on the string fills the next one, regardless of which flower it was.
const GARLAND_SLOTS = [
  { x: 29, y: 43 }, { x: 36, y: 60 }, { x: 45, y: 68 },
  { x: 55, y: 68 }, { x: 64, y: 60 }, { x: 71, y: 43 },
];

const VO = {
  open: 'You found six flowers. Let’s make Ganesha a garland. Tap a flower to thread it.',
  ready: 'You made it! Take the garland to Ganesha.',
};

let VO_MUTED = false;
function speak(text) {
  try {
    if (VO_MUTED) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  } catch { /* no-op */ }
}

const LAYOUT_STORAGE_KEY = 'modakGame3PreviewLayout';
const LAYOUT_DEFAULTS = {
  ganesha: { l: 50, t: 29 },
  mooshika: { l: 30, t: 50 },
  workspace: { l: 50, t: 72 },
  ...Object.fromEntries(GARLAND_SLOTS.map((point, i) => [`slot${i + 1}`, { l: point.x, t: point.y }])),
};
const LAYOUT_LABELS = { ganesha: 'Ganesha', mooshika: 'Mooshika', workspace: 'Workspace', ...Object.fromEntries(GARLAND_SLOTS.map((_, i) => [`slot${i + 1}`, `Flower landing ${i + 1}`])) };
function loadLayout() {
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return { ...LAYOUT_DEFAULTS };
    const saved = JSON.parse(raw);
    const merged = {};
    Object.keys(LAYOUT_DEFAULTS).forEach((k) => { merged[k] = { ...LAYOUT_DEFAULTS[k], ...(saved[k] || {}) }; });
    // Recenter the old saved workspace once; retain all other tuned positions.
    if (!saved.workspaceCentered) merged.workspace = { ...LAYOUT_DEFAULTS.workspace };
    return merged;
  } catch { return { ...LAYOUT_DEFAULTS }; }
}

export default function Game3GarlandPreview({ isActive = true, isPaused = false, hideElements = false, onPhaseComplete, onMicroWin }) {
  const [phase, setPhase] = useState(PHASES.BUILD);
  const sceneRef = useRef(null);
  const workspaceRef = useRef(null);
  const ganeshaDropRef = useRef(null);
  const mooshikaRef = useRef(null);

  const [placedFlowers, setPlacedFlowers] = useState([]);
  const [threadingFlower, setThreadingFlower] = useState(null);
  const threadingLock = useRef(false);
  const [garlandPosition, setGarlandPosition] = useState({ x: 50, y: 55, active: false });

  // Entrance: flowers start "at the basket" and animate out to their loose
  // positions once we can measure the basket's real on-screen spot.
  const [flowersArrived, setFlowersArrived] = useState(false);
  const [basketPct, setBasketPct] = useState(null);

  const [muted, setMuted] = useState(false);
  useEffect(() => { VO_MUTED = muted; }, [muted]);

  // ---- layout debug (BeatPlayerGame-style: click/drag the real sprite) ----
  const [debugMode, setDebugMode] = useState(false);
  const [layout, setLayout] = useState(loadLayout);
  const [selectedLayoutKey, setSelectedLayoutKey] = useState(null);
  const [debugCopyStatus, setDebugCopyStatus] = useState('');
  const layoutDragRef = useRef(null);

  useEffect(() => {
    try { window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ ...layout, workspaceCentered: true })); } catch { /* ignore */ }
  }, [layout]);

  const updateLayoutKey = useCallback((key, patch) => {
    setLayout((cur) => ({ ...cur, [key]: { ...cur[key], ...patch } }));
  }, []);
  const startLayoutDrag = useCallback((e, key) => {
    if (!debugMode || layoutDragRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const container = key.startsWith('slot') ? workspaceRef.current : sceneRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    setSelectedLayoutKey(key);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    // Preserve the grab point, regardless of the sprite's CSS anchor or scale.
    layoutDragRef.current = {
      key, pointerId: e.pointerId, clientX: e.clientX, clientY: e.clientY,
      l: layout[key].l, t: layout[key].t, width: rect.width, height: rect.height,
    };
  }, [debugMode, layout]);

  const onStagePointerMove = useCallback((e) => {
    const drag = layoutDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const l = Math.max(0, Math.min(100, drag.l + (e.clientX - drag.clientX) / drag.width * 100));
    const t = Math.max(0, Math.min(100, drag.t + (e.clientY - drag.clientY) / drag.height * 100));
    updateLayoutKey(drag.key, { l: Math.round(l * 10) / 10, t: Math.round(t * 10) / 10 });
  }, [updateLayoutKey]);

  const endLayoutDrag = useCallback((e) => {
    if (!e || layoutDragRef.current?.pointerId === e.pointerId) layoutDragRef.current = null;
  }, []);

  useEffect(() => { if (!debugMode) layoutDragRef.current = null; }, [debugMode]);

  const copyLayoutJson = useCallback(async () => {
    const text = JSON.stringify(layout, null, 2);
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); setDebugCopyStatus('Copied'); }
      else { window.prompt('Copy layout JSON', text); setDebugCopyStatus('Shown'); }
    } catch { window.prompt('Copy layout JSON', text); setDebugCopyStatus('Shown'); }
    setTimeout(() => setDebugCopyStatus(''), 2000);
  }, [layout]);
  const resetLayout = useCallback(() => { setLayout({ ...LAYOUT_DEFAULTS }); setSelectedLayoutKey(null); }, []);
  const jumpToPhase = useCallback((target) => {
    threadingLock.current = false;
    setThreadingFlower(null);
    if (target === PHASES.BUILD) { setPhase(PHASES.BUILD); setPlacedFlowers([]); setFlowersArrived(false); setGarlandPosition({ x: 50, y: 55, active: false }); }
    else if (target === PHASES.READY) { setPhase(PHASES.READY); setPlacedFlowers(FLOWERS.map((f, i) => ({ id: f.id, src: f.src, slot: GARLAND_SLOTS[i] }))); setFlowersArrived(true); }
    else if (target === PHASES.OFFERED) { setPhase(PHASES.OFFERED); setPlacedFlowers(FLOWERS.map((f, i) => ({ id: f.id, src: f.src, slot: GARLAND_SLOTS[i] }))); setFlowersArrived(true); }
  }, []);

  const isBuild = phase === PHASES.BUILD;
  const isReady = phase === PHASES.READY;
  const isOffered = phase === PHASES.OFFERED;

  const liveSlots = GARLAND_SLOTS.map((_, i) => ({ x: layout[`slot${i + 1}`].l, y: layout[`slot${i + 1}`].t }));

  const placedIds = useMemo(() => new Set(placedFlowers.map((item) => item.id)), [placedFlowers]);

  useEffect(() => { if (isBuild) speak(VO.open); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Measure the basket's position relative to the workspace once both are
  // mounted, then trigger the fly-out-to-loose-positions transition.
  useEffect(() => {
    if (!isBuild || flowersArrived) return;
    const t = setTimeout(() => {
      const basket = mooshikaRef.current;
      const workspace = workspaceRef.current;
      if (basket && workspace) {
        const basketRect = basket.getBoundingClientRect();
        const workspaceRect = workspace.getBoundingClientRect();
        const bx = ((basketRect.left + basketRect.width / 2 - workspaceRect.left) / workspaceRect.width) * 100;
        const by = ((basketRect.top + basketRect.height / 2 - workspaceRect.top) / workspaceRect.height) * 100;
        setBasketPct({ x: Math.max(0, Math.min(100, bx)), y: Math.max(0, Math.min(100, by)) });
      }
      requestAnimationFrame(() => setFlowersArrived(true));
    }, 250);
    return () => clearTimeout(t);
  }, [isBuild, flowersArrived]);

  const threadFlower = (flower) => {
    if (!isBuild || !isActive || isPaused || debugMode || !flowersArrived
      || threadingLock.current || placedIds.has(flower.id) || placedFlowers.length >= FLOWERS.length) return;
    threadingLock.current = true;
    setThreadingFlower({ ...flower, slot: liveSlots[placedFlowers.length], slotIndex: placedFlowers.length });
  };

  useEffect(() => {
    if (!threadingFlower || !isBuild || !isActive || isPaused || debugMode) return;
    const timer = window.setTimeout(() => {
      setPlacedFlowers((current) => [...current, threadingFlower]);
      setThreadingFlower(null);
      threadingLock.current = false;
      onMicroWin?.(`garland-${placedFlowers.length + 1}`);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [threadingFlower, isBuild, isActive, isPaused, debugMode, placedFlowers.length, onMicroWin]);

  useEffect(() => {
    if (!isBuild || placedFlowers.length !== FLOWERS.length || !isActive || isPaused || debugMode) return;
    const timer = window.setTimeout(() => {
      setPhase(PHASES.READY);
      onPhaseComplete?.(PHASES.BUILD);
      speak(VO.ready);
    }, 550);
    return () => window.clearTimeout(timer);
  }, [isBuild, placedFlowers.length, isActive, isPaused, debugMode, onPhaseComplete]);

  const getScenePoint = (event) => {
    const scene = sceneRef.current;
    if (!scene) return null;
    const rect = scene.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 };
  };
  const startGarlandDrag = (event) => {
    if (!isReady || debugMode) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setGarlandPosition((prev) => ({ ...prev, active: true }));
  };
  const moveGarland = (event) => {
    if (!garlandPosition.active) return;
    const point = getScenePoint(event);
    if (!point) return;
    setGarlandPosition({ active: true, x: Math.max(5, Math.min(95, point.x)), y: Math.max(8, Math.min(92, point.y)) });
  };
  const endGarlandDrag = (event) => {
    if (!garlandPosition.active) return;
    const target = ganeshaDropRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const droppedOnGanesha = event.clientX >= rect.left - 35 && event.clientX <= rect.right + 35 && event.clientY >= rect.top - 35 && event.clientY <= rect.bottom + 45;

    if (!droppedOnGanesha) { setGarlandPosition({ x: 50, y: 55, active: false }); return; }

    setGarlandPosition((prev) => ({ ...prev, active: false }));
    setPhase(PHASES.OFFERED);
    onPhaseComplete?.(PHASES.READY);
    window.setTimeout(() => { setPhase(PHASES.MODAK_REVEAL); onPhaseComplete?.(PHASES.OFFERED); }, 1400);
  };

  if (!isActive) return null;

  return (
    <div
      ref={sceneRef}
      className={`g3 ${isPaused ? 'g3--paused' : ''} ${debugMode ? 'g3--debugging' : ''}`}
      style={{ backgroundImage: `url(${forestBackground})` }}
      onPointerMove={debugMode ? onStagePointerMove : undefined}
      onPointerUp={debugMode ? endLayoutDrag : undefined}
      onPointerCancel={debugMode ? endLayoutDrag : undefined}
    >
      {!hideElements && (
        <div className="g3-hud">
          <span>Placed: {placedFlowers.length} / 6</span>
          <span className="g3-hud-phase">{phase.replace('GARLAND_', '')}</span>
          <button type="button" className="g3-mute-btn" onClick={() => setMuted((v) => !v)} title={muted ? 'Unmute' : 'Mute'}>{muted ? '🔇' : '🔊'}</button>
        </div>
      )}

      {/* GANESHA */}
      <div
        ref={ganeshaDropRef}
        className={`g3-ganesha ${isOffered || phase === PHASES.MODAK_REVEAL ? 'g3-ganesha--happy' : ''}`}
        style={{
          left: `${layout.ganesha.l}%`, top: `${layout.ganesha.t}%`,
          outline: debugMode && selectedLayoutKey === 'ganesha' ? '2px dashed #03A9F4' : undefined,
          outlineOffset: 3, cursor: debugMode ? 'grab' : undefined, pointerEvents: debugMode ? 'auto' : 'none',
        }}
        onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'ganesha') : undefined}
      >
        <img src={ganesha} alt="Ganesha" />
      </div>

      {/* MOOSHIKA — basket empties visually once the 6 flowers have moved
          into the workspace (build phase onward it's just decorative). */}
      {!isOffered && phase !== PHASES.MODAK_REVEAL && (
        <div
          ref={mooshikaRef}
          className="g3-mooshika"
          style={{
            left: `${layout.mooshika.l}%`, top: `${layout.mooshika.t}%`,
            outline: debugMode && selectedLayoutKey === 'mooshika' ? '2px dashed #03A9F4' : undefined,
            outlineOffset: 3, cursor: debugMode ? 'grab' : undefined, pointerEvents: debugMode ? 'auto' : 'none',
          }}
          onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'mooshika') : undefined}
        >
          <img src={mooshikaBasket} alt="Mooshika" />
        </div>
      )}

      {/* GARLAND WORKSPACE */}
      {(isBuild || isReady) && (
        <div
          ref={workspaceRef}
          className="garland-workspace"
          style={{
            left: `${layout.workspace.l}%`, top: `${layout.workspace.t}%`,
            outline: debugMode && selectedLayoutKey === 'workspace' ? '2px dashed #03A9F4' : undefined,
            cursor: debugMode ? 'grab' : undefined,
          }}
          onPointerDown={debugMode ? (e) => startLayoutDrag(e, 'workspace') : undefined}
        >
          {isBuild && (
            <>
              <p className="garland-instruction">Tap a flower to thread it</p>
              <img src={garlandString} alt="" className="garland-string" />

              {placedFlowers.map((flower, index) => (
                <img
                  key={flower.id} src={flower.src} alt="" className="garland-placed-flower"
                  style={{ left: `${liveSlots[index].x}%`, top: `${liveSlots[index].y}%` }}
                />
              ))}

              {debugMode && liveSlots.map((slot, index) => (
                <button key={`slot${index + 1}`} type="button"
                  className="garland-slot-handle"
                  aria-label={`Position flower landing ${index + 1}`}
                  style={{ left: `${slot.x}%`, top: `${slot.y}%`, outline: selectedLayoutKey === `slot${index + 1}` ? '2px solid #fff' : undefined }}
                  onPointerDown={(event) => startLayoutDrag(event, `slot${index + 1}`)}>
                  <img src={FLOWERS[index].src} alt="" /><span>{index + 1}</span>
                </button>
              ))}

              {FLOWERS.map((flower, index) => {
                if (placedIds.has(flower.id)) return null;
                const isThreading = threadingFlower?.id === flower.id;
                const origin = basketPct || { x: flower.x, y: flower.y };
                const x = isThreading ? liveSlots[threadingFlower.slotIndex].x : (flowersArrived ? flower.x : origin.x);
                const y = isThreading ? liveSlots[threadingFlower.slotIndex].y : (flowersArrived ? flower.y : origin.y);
                return (
                  <button
                    key={flower.id}
                    type="button"
                    className={`garland-loose-flower ${isThreading ? 'is-threading' : ''} ${flowersArrived ? 'has-arrived' : ''}`}
                    style={{ left: `${x}%`, top: `${y}%`, '--flower-delay': isThreading ? '0ms' : `${index * 70}ms` }}
                    onClick={() => threadFlower(flower)}
                    disabled={!flowersArrived || !!threadingFlower || isPaused || debugMode}
                    aria-label={`Thread ${flower.src === flowerCream ? 'cream' : 'pink'} flower ${index + 1}`}
                  >
                    <img src={flower.src} alt="" />
                  </button>
                );
              })}
            </>
          )}

          {isReady && (
            <div className="completed-garland-stage">
              <button
                type="button"
                className="completed-garland"
                onPointerDown={startGarlandDrag}
                onPointerMove={moveGarland}
                onPointerUp={endGarlandDrag}
                onPointerCancel={() => setGarlandPosition({ x: 50, y: 55, active: false })}
              >
                <img src={completedGarland} alt="Garland" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* GARLAND BEING DRAGGED THROUGH THE WORLD */}
      {isReady && garlandPosition.active && (
        <button
          type="button"
          className="garland-world-drag"
          style={{ left: `${garlandPosition.x}%`, top: `${garlandPosition.y}%` }}
          onPointerMove={moveGarland}
          onPointerUp={endGarlandDrag}
        >
          <img src={completedGarland} alt="" />
        </button>
      )}

      {/* GARLAND OFFERED */}
      {(isOffered || phase === PHASES.MODAK_REVEAL) && (
        <img src={completedGarland} alt="" className="garland-on-ganesha" />
      )}

      {phase === PHASES.MODAK_REVEAL && (
        <div className="g3-done">
          <h2>Garland offered — hand-off to Modak Reveal ↓</h2>
          <p>Game 3 preview ends here.</p>
        </div>
      )}

      {/* LAYOUT DEBUG */}
      <button type="button" className={`g3-debug-pill ${debugMode ? 'is-on' : ''}`} onClick={() => { setDebugMode((v) => !v); setSelectedLayoutKey(null); }}>
        {debugMode ? 'layout on' : 'layout off'}
      </button>

      {debugMode && (
        <div className="g3-debug-panel">
          <div className="g3-debug-panel-row"><strong>Layout Debug</strong> — {phase.replace('GARLAND_', '')}</div>

          <label className="g3-debug-row">
            <span>Jump to</span>
            <select onChange={(e) => { if (e.target.value) jumpToPhase(e.target.value); e.target.value = ''; }} defaultValue="">
              <option value="" disabled>pick a phase…</option>
              <option value={PHASES.BUILD}>1. Build</option>
              <option value={PHASES.READY}>2. Ready (drag to Ganesha)</option>
              <option value={PHASES.OFFERED}>3. Offered</option>
            </select>
          </label>

          {selectedLayoutKey ? (
            <>
              <div className="g3-debug-panel-row">{LAYOUT_LABELS[selectedLayoutKey]}</div>
              <label>X <input type="number" step="0.5" value={layout[selectedLayoutKey].l} onChange={(e) => updateLayoutKey(selectedLayoutKey, { l: Number(e.target.value) })} /></label>
              <label>Y <input type="number" step="0.5" value={layout[selectedLayoutKey].t} onChange={(e) => updateLayoutKey(selectedLayoutKey, { t: Number(e.target.value) })} /></label>
            </>
          ) : (
            <div className="g3-debug-panel-row">Drag a numbered flower to place it on the thread, or drag the mat to move it.</div>
          )}

          <div className="g3-debug-panel-row g3-debug-panel-actions">
            <button type="button" onClick={copyLayoutJson}>{debugCopyStatus || 'Copy layout JSON'}</button>
            <button type="button" onClick={resetLayout}>Reset layout</button>
          </div>
        </div>
      )}
    </div>
  );
}
