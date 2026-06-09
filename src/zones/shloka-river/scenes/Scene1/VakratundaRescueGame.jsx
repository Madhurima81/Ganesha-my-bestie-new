// src/zones/shloka-river/scenes/Scene1/VakratundaRescueGame.jsx
//
// Vakratunda build-path flow:
// Tap the dam, drag leaves from the bank into the river gaps, and the frog
// crosses once the path is built. This keeps the existing scene contract while
// swapping the old memory game for the new "find another way" mechanic.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import './VakratundaRescueGame.css';

import frogSwim from './assets/images/vakratunda/frog-swim.webp';
import frogHappy from './assets/images/vakratunda/frog-happy.webp';
import frogFamily from './assets/images/vakratunda/frog-family-from-download.png';
import lilypad from './assets/images/vakratunda/lilypad.webp';
import damImg from './assets/images/vakratunda/dam.webp';

const SYLLABLES = ['Vak', 'ra', 'tun', 'da'];
const AUDIO = {
  syllables: ['va', 'kra', 'tun', 'da'],
};

const POS = {
  frogStuck: { l: 26, t: 57, w: 6.5 },
  frogPath: { l: 86.5, t: 78, w: 7 },
  dam: { l: 28.1, t: 62.4, w: 34 },
  family: { l: 76.1, t: 80.2, w: 16 },
  bundle: { l: 16, t: 84, w: 14 },
  slots: [
    { l: 50.8, t: 51.7, w: 10 },
    { l: 64.7, t: 52.6, w: 10 },
    { l: 77.3, t: 55.5, w: 10 },
    { l: 87.2, t: 67.6, w: 10 },
  ],
};

const HOOP_DELAY_MS = 700;
const REUNION_DELAY_MS = 2200;

export default function VakratundaRescueGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  profileName = '',
  voiceGuidance = {},
  isPaused = false,
}) {
  const { playVoice: playSceneLine, playSfx, playWord, playSyllable } = voiceGuidance;
  const [phase, setPhase] = useState('intro');
  const [tried, setTried] = useState(false);
  const [bonk, setBonk] = useState(false);
  const [filled, setFilled] = useState([false, false, false, false]);
  const [hopIndex, setHopIndex] = useState(-1);
  const [hint, setHint] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragPoint, setDragPoint] = useState(null);

  const stageRef = useRef(null);
  const timers = useRef([]);

  const placedCount = filled.filter(Boolean).length;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const after = useCallback((ms, fn) => {
    if (isPaused) return;
    const id = setTimeout(() => {
      if (!isPaused) fn();
    }, ms);
    timers.current.push(id);
  }, [isPaused]);

  const getPoint = useCallback((clientX, clientY) => {
    const stage = stageRef.current;
    if (!stage) return null;
    const rect = stage.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const startHopping = useCallback(() => {
    setPhase('hopping');
    POS.slots.forEach((_, i) => {
      after(HOOP_DELAY_MS * (i + 1), () => setHopIndex(i));
    });

    after(HOOP_DELAY_MS * (POS.slots.length + 1), () => {
      setPhase('reunion');
      setHopIndex(POS.slots.length);
      playSceneLine?.('scene10_vak_crossed');
      after(900, () => playWord?.('vakratunda'));
      after(2100, () => playSceneLine?.('scene10_vak_meaning'));
    });

    after(HOOP_DELAY_MS * (POS.slots.length + 1) + REUNION_DELAY_MS + 1400, () => {
      onGameComplete?.();
      onPhaseComplete?.();
    });
  }, [after, onGameComplete, onPhaseComplete, playSceneLine, playWord]);

  useEffect(() => {
    if (!isActive) return;

    clearTimers();
    setPhase('intro');
    setTried(false);
    setBonk(false);
    setFilled([false, false, false, false]);
    setHopIndex(-1);
    setHint(false);
    setDraggingIndex(null);
    setDragPoint(null);

    playSceneLine?.('scene10_intro_friends');
    after(1500, () => playSceneLine?.('scene10_vak_frog_cross'));
    after(2900, () => playSceneLine?.('scene10_vak_tap_logs'));
    after(2600, () => setPhase('play'));

    return clearTimers;
  }, [isActive, after, clearTimers, playSceneLine]);

  useEffect(() => {
    if (phase !== 'play' || !tried || placedCount > 0) return;
    const id = setTimeout(() => {
      if (!isPaused) setHint(true);
    }, 6000);
    return () => clearTimeout(id);
  }, [phase, tried, placedCount, isPaused]);

  const tryStraight = () => {
    if (isPaused || tried) return;
    setBonk(true);
    setTried(true);
    playSfx?.('bonk');
    playSceneLine?.('scene10_vak_blocked');
    after(1200, () => playSceneLine?.('scene10_vak_make_path'));
    after(2500, () => playSceneLine?.('scene10_vak_drag_leaves'));
    after(450, () => setBonk(false));
  };

  const beginDrag = (index) => (event) => {
    if (isPaused || phase !== 'play' || !tried || index !== placedCount) return;
    event.preventDefault();
    event.stopPropagation();
    const point = getPoint(event.clientX, event.clientY);
    if (!point) return;
    setDraggingIndex(index);
    setDragPoint(point);
  };

  const finishDrag = useCallback((clientX, clientY) => {
    if (draggingIndex === null) return;

    const point = getPoint(clientX, clientY);
    if (!point) {
      setDraggingIndex(null);
      setDragPoint(null);
      return;
    }

    let bestIndex = -1;
    let bestDistance = 12;

    POS.slots.forEach((slot, idx) => {
      if (filled[idx]) return;
      const distance = Math.hypot(point.x - slot.l, point.y - slot.t);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = idx;
      }
    });

    if (bestIndex >= 0) {
      const nextFilled = filled.slice();
      nextFilled[bestIndex] = true;
      setFilled(nextFilled);
      setHint(false);
      playSfx?.('chime');
      onMicroWin?.();

      if (nextFilled.filter(Boolean).length === POS.slots.length) {
        startHopping();
      }
    }

    setDraggingIndex(null);
    setDragPoint(null);
  }, [draggingIndex, filled, getPoint, onMicroWin, playSfx, playSyllable, placedCount, startHopping]);

  useEffect(() => {
    if (draggingIndex === null) return;

    const handleMove = (event) => {
      if (isPaused) return;
      const point = getPoint(event.clientX, event.clientY);
      if (point) setDragPoint(point);
    };

    const handleUp = (event) => {
      if (isPaused) return;
      finishDrag(event.clientX, event.clientY);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [draggingIndex, finishDrag, getPoint, isPaused]);

  if (!isActive) return null;

  const frogPos = hopIndex < 0
    ? POS.frogStuck
    : (hopIndex >= POS.slots.length ? POS.frogPath : POS.slots[hopIndex]);
  const frogStuck = hopIndex < 0;
  const happy = phase === 'reunion' || hopIndex >= 0;
  const remaining = POS.slots.length - placedCount;
  const nextEmptyIndex = filled.findIndex((slotFilled) => !slotFilled);

  const lyr = (p, w) => ({
    left: `${p.l}%`,
    top: `${p.t}%`,
    width: `${w ?? p.w}%`
  });

  const bundlePosition = (k) => ({
    left: `${POS.bundle.l + k * 1.4}%`,
    top: `${POS.bundle.t - k * 1.4}%`,
    width: `${POS.bundle.w}%`
  });

  const ghostStyle = dragPoint
    ? { left: `${dragPoint.x}%`, top: `${dragPoint.y}%`, width: `${POS.bundle.w}%` }
    : null;

  return (
    <div
      ref={stageRef}
      className={`vak-game ${hideElements ? 'is-hidden' : ''}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {phase !== 'intro' && (
        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={placedCount}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={playSyllable}
        />
      )}

      {tried && phase === 'play' && POS.slots.map((slot, idx) => {
        if (filled[idx]) return null;
        return (
          <div
            key={`slot-${idx}`}
            className={`vak-layer vak-slot ${idx === nextEmptyIndex ? 'is-next' : ''}`}
            style={{ ...lyr(slot), zIndex: 5 }}
          >
            <span className="vak-slot-ring" />
          </div>
        );
      })}

      {tried && POS.slots.map((slot, idx) => (
        filled[idx] ? (
          <div
            key={`placed-${idx}`}
            className="vak-layer"
            style={{ ...lyr(slot), zIndex: 7 }}
          >
            <img src={lilypad} alt="" />
          </div>
        ) : null
      ))}

      {tried && phase === 'play' && remaining > 0 && (
        <>
          {Array.from({ length: remaining }, (_, k) => {
            const isTop = k === remaining - 1;
            const stackZ = 6 + k;
            const position = bundlePosition(k);
            return (
              <div
                key={`bundle-${k}`}
                className={`vak-layer vak-leaf ${isTop ? 'is-active' : 'is-waiting'}`}
                style={{
                  ...position,
                  zIndex: isTop ? 16 : stackZ,
                  pointerEvents: isTop ? 'auto' : 'none',
                  opacity: draggingIndex === placedCount && isTop ? 0.15 : (isTop ? 1 : 0.85)
                }}
                onPointerDown={isTop ? beginDrag(placedCount) : undefined}
              >
                <img src={lilypad} alt="" />
              </div>
            );
          })}
        </>
      )}

      {draggingIndex !== null && ghostStyle && (
        <div
          className="vak-layer vak-drag-ghost"
          style={{ ...ghostStyle, zIndex: 40, pointerEvents: 'none' }}
        >
          <img src={lilypad} alt="" />
        </div>
      )}

      <div
        className="vak-layer"
        style={{
          ...lyr(POS.dam),
          zIndex: 9,
          pointerEvents: tried ? 'none' : 'auto',
          cursor: !tried ? 'pointer' : 'default'
        }}
        onClick={tryStraight}
      >
        <img src={damImg} alt="" style={{ transform: bonk ? 'translateX(3px)' : 'none' }} />
      </div>

      <div className="vak-layer" style={{ ...lyr(POS.family), zIndex: 8 }}>
        <img src={frogFamily} alt="" />
      </div>

      {tried && placedCount === 0 && phase === 'play' && (
        <div className="vak-bubble vak-bubble-fail" style={{ left: '50%', top: '40%' }}>
          Oh no! I can't get through!
        </div>
      )}

      {hint && placedCount === 0 && (
        <div className="vak-bubble vak-bubble-hint" style={{ left: '30%', top: '34%' }}>
          Hmm... let's build a path!
        </div>
      )}

      <div
        className={`vak-layer vak-frog ${phase === 'hopping' || phase === 'reunion' ? 'is-hopping' : ''}`}
        style={{
          left: `${frogPos.l + (bonk ? 1.5 : 0)}%`,
          top: `${frogPos.t}%`,
          width: `${frogStuck ? POS.frogStuck.w : 7}%`,
          zIndex: frogStuck ? 8 : 15
        }}
      >
        <img src={happy ? frogHappy : frogSwim} alt="" />
      </div>

      {phase === 'reunion' && (
        <p className="vak-doneline">You built a new way across!</p>
      )}
    </div>
  );
}
