import { usePreloadPoses, preparePose } from '../../../../lib/components/animation/PoseImage';
// GarlandGame3 — thread 6 flowers into a garland, then carry/drop it onto
// Ganesha. Ends by calling the onComplete callback, which hands off to the
// live scene's existing SymbolAutoReveal for the real "modak" symbol card
// (this component owns NO reveal UI of its own).
//
// Ported from the approved dev preview at
// src/dev/modakGame3Preview/Game3Garland.jsx. Debug/layout-tuning UI has
// been stripped for production; the tuned LAYOUT_DEFAULTS from that preview
// are baked in as constants below. Locked rules preserved: flower slots are
// invisible (no placement-circle hints), flower colour/order is never a
// puzzle, flowers auto-thread onto the next spot.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './GarlandGame3.css';

import flowerPink from './assets/images/fj-flower-coral.webp';
import flowerCream from './assets/images/fj-flower-cream.webp';
import garlandString from './assets/images/fj-garland-empty.webp';
import completedGarland from './assets/images/fj-garland-complete.webp';
import mooshikaBasket from './assets/images/mooshika-turned-game2.webp';
import ganesha from './assets/images/ganesha-game3-new.webp';
import forestBackground from './assets/images/modak-fj-bg.webp';
import symbolModakColored from '../../shared/images/icons/symbol-modak-new.webp';

const PHASES = { BUILD: 'GARLAND_BUILD', READY: 'GARLAND_READY', OFFERED: 'GARLAND_OFFERED' };

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

const LAYOUT = {
  ganesha: { l: 50, t: 29 },
  mooshika: { l: 30, t: 50 },
  workspace: { l: 50, t: 72 },
};

const VO = {
  open: 'You found six flowers. Let’s make Ganesha a garland. Tap a flower to thread it.',
  ready: 'You made it! Take the garland to Ganesha.',
  carry: 'Carry the garland to Ganesha!',
};

const SCENE_IMAGES = [
  flowerPink,
  flowerCream,
  garlandString,
  completedGarland,
  mooshikaBasket,
  ganesha,
  forestBackground,
  symbolModakColored,
];

export default function GarlandGame3({ isActive = true, isPaused = false, isAudioOn = true, onComplete }) {
  usePreloadPoses(SCENE_IMAGES);
  const [phase, setPhase] = useState(PHASES.BUILD);
  const sceneRef = useRef(null);
  const workspaceRef = useRef(null);
  const ganeshaDropRef = useRef(null);
  const mooshikaRef = useRef(null);

  const [placedFlowers, setPlacedFlowers] = useState([]);
  const [threadingFlower, setThreadingFlower] = useState(null);
  const threadingLock = useRef(false);
  const [garlandPosition, setGarlandPosition] = useState({ x: 50, y: 55, active: false });

  const [flowersArrived, setFlowersArrived] = useState(false);
  const [basketPct, setBasketPct] = useState(null);
  const [showModakGlow, setShowModakGlow] = useState(false);

  // Defensive: if the scene pauses (tab-hide) mid-carry, drop the stuck
  // world-drag garland back to its rest position instead of leaving it
  // floating under a pointer that will never fire up/cancel again.
  useEffect(() => {
    if (isPaused) setGarlandPosition((prev) => (prev.active ? { x: 50, y: 55, active: false } : prev));
  }, [isPaused]);

  const mutedRef = useRef(!isAudioOn);
  useEffect(() => { mutedRef.current = !isAudioOn; }, [isAudioOn]);
  const speak = useCallback((text) => {
    try {
      if (mutedRef.current || typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch { /* no-op */ }
  }, []);

  const isBuild = phase === PHASES.BUILD;
  const isReady = phase === PHASES.READY;
  const isOffered = phase === PHASES.OFFERED;

  // Carrying the finished garland to Ganesha is a drag, not the tap used to
  // thread flowers — same 9s/16s/24s idle-hint ladder used across the app
  // (useRepeatedHintCycle): L1 pulse, L2 stronger pulse + one-time VO, L3
  // re-shows the gesture demo. Restarts on each attempt (drag start, or a
  // failed drop) so it doesn't nag right after the child just tried.
  const [garlandHintLevel, setGarlandHintLevel] = useState(0);
  const garlandHintVoPlayedRef = useRef(false);
  const garlandReadyAtRef = useRef(Date.now());

  const restartGarlandHintClock = useCallback(() => {
    garlandReadyAtRef.current = Date.now();
    setGarlandHintLevel(0);
    garlandHintVoPlayedRef.current = false;
  }, []);

  useEffect(() => {
    if (!isReady) { setGarlandHintLevel(0); garlandHintVoPlayedRef.current = false; return undefined; }
    restartGarlandHintClock();
  }, [isReady, restartGarlandHintClock]);

  useEffect(() => {
    if (!isReady || garlandPosition.active) return undefined;
    const tick = window.setInterval(() => {
      const idleMs = Date.now() - garlandReadyAtRef.current;
      if (idleMs >= 24000) {
        setGarlandHintLevel(3);
      } else if (idleMs >= 16000) {
        setGarlandHintLevel(2);
        if (!garlandHintVoPlayedRef.current) {
          garlandHintVoPlayedRef.current = true;
          speak(VO.carry);
        }
      } else if (idleMs >= 9000) {
        setGarlandHintLevel(1);
      }
    }, 1000);
    return () => window.clearInterval(tick);
  }, [isReady, garlandPosition.active, speak]);

  const liveSlots = GARLAND_SLOTS;
  const placedIds = useMemo(() => new Set(placedFlowers.map((item) => item.id)), [placedFlowers]);

  useEffect(() => { if (isBuild && isActive) speak(VO.open); }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Measure the basket's position relative to the workspace once both are
  // mounted, then trigger the fly-out-to-loose-positions transition.
  useEffect(() => {
    if (!isBuild || flowersArrived || !isActive) return undefined;
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
  }, [isBuild, flowersArrived, isActive]);

  const threadFlower = (flower) => {
    if (!isBuild || !isActive || isPaused || !flowersArrived
      || threadingLock.current || placedIds.has(flower.id) || placedFlowers.length >= FLOWERS.length) return;
    threadingLock.current = true;
    setThreadingFlower({ ...flower, slot: liveSlots[placedFlowers.length], slotIndex: placedFlowers.length });
  };

  useEffect(() => {
    if (!threadingFlower || !isBuild || !isActive || isPaused) return;
    const timer = window.setTimeout(() => {
      setPlacedFlowers((current) => [...current, threadingFlower]);
      setThreadingFlower(null);
      threadingLock.current = false;
    }, 650);
    return () => window.clearTimeout(timer);
  }, [threadingFlower, isBuild, isActive, isPaused]);

  useEffect(() => {
    if (!isBuild || placedFlowers.length !== FLOWERS.length || !isActive || isPaused) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      // Keep the assembled flowers visible while the replacement art decodes.
      preparePose(completedGarland).then(() => {
        if (cancelled) return;
        setPhase(PHASES.READY);
        speak(VO.ready);
      }).catch(() => {});
    }, 550);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [isBuild, placedFlowers.length, isActive, isPaused, speak]);

  const getScenePoint = (event) => {
    const scene = sceneRef.current;
    if (!scene) return null;
    const rect = scene.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 };
  };
  const startGarlandDrag = (event) => {
    if (!isReady || isPaused) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    restartGarlandHintClock();
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

    if (!droppedOnGanesha) {
      setGarlandPosition({ x: 50, y: 55, active: false });
      restartGarlandHintClock();
      return;
    }

    setGarlandPosition((prev) => ({ ...prev, active: false }));
    setPhase(PHASES.OFFERED);
    // Matches the original pre-rework "modak above Mooshika" beat: a short
    // pause after the offering lands, then the golden Modak glows above
    // Mooshika for a moment before the real symbol reveal card takes over.
    window.setTimeout(() => setShowModakGlow(true), 1100);
    window.setTimeout(() => { onComplete?.(); }, 3200);
  };

  if (!isActive) return null;

  return (
    <div
      ref={sceneRef}
      className={`g3g ${isPaused ? 'g3g--paused' : ''}`}
      style={{ backgroundImage: `url(${forestBackground})` }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <GestureDemo
        type="drag"
        from={{ x: LAYOUT.workspace.l, y: LAYOUT.workspace.t }}
        to={{ x: LAYOUT.ganesha.l, y: LAYOUT.ganesha.t }}
        active={garlandHintLevel >= 3 && !garlandPosition.active}
        idleDelay={150}
        zIndex={30}
      />

      {/* GANESHA */}
      <div
        ref={ganeshaDropRef}
        className={`g3g-ganesha ${isOffered ? 'g3g-ganesha--happy' : ''}`}
        style={{ left: `${LAYOUT.ganesha.l}%`, top: `${LAYOUT.ganesha.t}%` }}
      >
        <img src={ganesha} alt="Ganesha" />
      </div>

      {/* MOOSHIKA — basket empties visually once the 6 flowers have moved
          into the workspace. Stays on screen through the offering so the
          golden Modak has somewhere to glow above. */}
      {(!isOffered || showModakGlow) && (
        <div ref={mooshikaRef} className="g3g-mooshika" style={{ left: `${LAYOUT.mooshika.l}%`, top: `${LAYOUT.mooshika.t}%` }}>
          <img src={mooshikaBasket} alt="Mooshika" />
          {showModakGlow && (
            <div className="g3g-modak-satisfaction">
              <div className="g3g-modak-satisfaction-glow" aria-hidden="true" />
              <img src={symbolModakColored} alt="Golden Modak" className="g3g-modak-satisfaction-icon" />
            </div>
          )}
        </div>
      )}

      {/* GARLAND WORKSPACE */}
      {(isBuild || isReady) && (
        <div ref={workspaceRef} className="g3g-workspace" style={{ left: `${LAYOUT.workspace.l}%`, top: `${LAYOUT.workspace.t}%` }}>
          {isBuild && (
            <>
              <p className="g3g-instruction">Tap a flower to thread it</p>
              <img src={garlandString} alt="" className="g3g-string" />

              {placedFlowers.map((flower, index) => (
                <img
                  key={flower.id} src={flower.src} alt="" className="g3g-placed-flower"
                  style={{ left: `${liveSlots[index].x}%`, top: `${liveSlots[index].y}%` }}
                />
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
                    className={`g3g-loose-flower ${isThreading ? 'is-threading' : ''} ${flowersArrived ? 'has-arrived' : ''}`}
                    style={{ left: `${x}%`, top: `${y}%`, '--flower-delay': isThreading ? '0ms' : `${index * 70}ms` }}
                    onClick={() => threadFlower(flower)}
                    disabled={!flowersArrived || !!threadingFlower || isPaused}
                    aria-label={`Thread ${flower.src === flowerCream ? 'cream' : 'pink'} flower ${index + 1}`}
                  >
                    <img src={flower.src} alt="" />
                  </button>
                );
              })}
            </>
          )}

          {isReady && (
            <div className="g3g-completed-garland-stage">
              <button
                type="button"
                className={`g3g-completed-garland ${garlandHintLevel === 1 ? 'g3g-hint-pulse' : ''} ${garlandHintLevel >= 2 ? 'g3g-hint-strong' : ''}`}
                onPointerDown={startGarlandDrag}
                onPointerMove={moveGarland}
                onPointerUp={endGarlandDrag}
                onPointerCancel={() => { setGarlandPosition({ x: 50, y: 55, active: false }); restartGarlandHintClock(); }}
                aria-label="Carry the garland to Ganesha"
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
          className="g3g-world-drag"
          style={{ left: `${garlandPosition.x}%`, top: `${garlandPosition.y}%` }}
          onPointerMove={moveGarland}
          onPointerUp={endGarlandDrag}
          onPointerCancel={() => setGarlandPosition({ x: 50, y: 55, active: false })}
        >
          <img src={completedGarland} alt="" />
        </button>
      )}

      {/* GARLAND OFFERED */}
      {isOffered && <img src={completedGarland} alt="" className="g3g-on-ganesha" />}
    </div>
  );
}
