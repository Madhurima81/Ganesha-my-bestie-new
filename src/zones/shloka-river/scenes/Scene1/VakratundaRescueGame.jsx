import React, { useCallback, useEffect, useRef, useState } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './VakratundaRescueGame.css';

import frogSwim from './assets/images/vakratunda/frog-swim.webp';
import frogHappy from './assets/images/vakratunda/frog-happy.webp';
import frogFamily from './assets/images/vakratunda/frog-family-from-download.png';
import lilypad from './assets/images/vakratunda/lilypad.webp';
import stoneNew from './assets/images/vakratunda/stone-new.png';
import logHeavy from './assets/images/mahakaya/log-heavy.webp';

const SYLLABLES = ['va', 'kra', 'tun', 'da'];
const AUDIO = {
  syllables: ['va', 'kra', 'tun', 'da'],
};

const MATERIALS = {
  leaves: { asset: lilypad, pile: { l: 16, t: 75.5, w: 9 }, pieceW: 9 },
  stones: { asset: stoneNew, pile: { l: 30.1, t: 75.8, w: 8.5 }, pieceW: 8.5 },
  logs: { asset: logHeavy, pile: { l: 43.9, t: 81.1, w: 11 }, pieceW: 11 },
};

const POS = {
  frogStart: { l: 11.1, t: 57.9, w: 7 },
  frogEnd: { l: 70.2, t: 51, w: 7 },
  family: { l: 70.4, t: 64.2, w: 14 },
  slots: [
    { l: 28.6, t: 55.5, w: 7.8 },
    { l: 41.8, t: 43.8, w: 7.8 },
    { l: 56.4, t: 43.3, w: 7.8 },
    { l: 70.2, t: 51, w: 7.8 },
  ],
};

const HOP_DELAY_MS = 750;
const REUNION_DELAY_MS = 2200;

export default function VakratundaRescueGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  voiceGuidance = {},
  isPaused = false,
}) {
  const { playVoice: playSceneLine, playSfx, playWord, playSyllable, stopVoice } = voiceGuidance;

  const [phase, setPhase] = useState('intro');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [filled, setFilled] = useState([false, false, false, false]);
  const [hopIndex, setHopIndex] = useState(-1);
  const [familyBounce, setFamilyBounce] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragPoint, setDragPoint] = useState(null);

  const stageRef = useRef(null);
  const timers = useRef([]);
  const isPausedRef = useRef(isPaused);
  const vakHintVoiceRef = useRef({ stage: null, level: 0 });
  const {
    hintLevel,
    markInteraction,
  } = useRepeatedHintCycle({
    enabled: isActive,
    stageKey: !selectedMaterial ? 'choose' : 'build',
    initialDelay: selectedMaterial ? 7000 : 8500,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: selectedMaterial ? 15000 : 16000,
    level3Delay: selectedMaterial ? 22000 : 23000,
  });

  const placedCount = filled.filter(Boolean).length;
  const nextEmptyIndex = filled.findIndex((slotFilled) => !slotFilled);
  const activeMaterial = selectedMaterial ? MATERIALS[selectedMaterial] : null;
  const hintStage = !selectedMaterial ? 'choose' : 'build';
  const showBuildGesture = phase === 'build' && !!selectedMaterial && placedCount === 0 && !dragging;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const after = useCallback((ms, fn) => {
    const id = setTimeout(() => {
      if (!isPausedRef.current) fn();
    }, ms);
    timers.current.push(id);
  }, []);

  const getPoint = useCallback((clientX, clientY) => {
    const stage = stageRef.current;
    if (!stage) return null;
    const rect = stage.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const resetState = useCallback(() => {
    clearTimers();
    setPhase('intro');
    setSelectedMaterial(null);
    setFilled([false, false, false, false]);
    setHopIndex(-1);
    setFamilyBounce(false);
    setDragging(false);
    setDragPoint(null);
  }, [clearTimers]);

  const startHopping = useCallback(() => {
    setPhase('hopping');

    POS.slots.forEach((_, i) => {
      after(HOP_DELAY_MS * (i + 1), () => {
        setHopIndex(i);
        playSfx?.('frogHop');
      });
    });

    after(HOP_DELAY_MS * (POS.slots.length + 1), () => {
      setPhase('reunion');
      setHopIndex(POS.slots.length);
      setFamilyBounce(true);
      playSfx?.('frogReunion');
      playSceneLine?.('scene10_vak_crossed');
      after(600, () => setFamilyBounce(false));
    });

    after(HOP_DELAY_MS * (POS.slots.length + 1) + REUNION_DELAY_MS + 1400, () => {
      onGameComplete?.();
      onPhaseComplete?.();
    });
  }, [after, onGameComplete, onPhaseComplete, playSceneLine, playSfx, playWord]);

  useEffect(() => {
    if (!isActive) return;

    resetState();
    after(700, () => playSceneLine?.('scene10_vak_intro'));
    after(4200, () => playSceneLine?.('scene10_vak_choose'));
    after(4200, () => setPhase('choose'));

    return clearTimers;
    // `after` is intentionally stable and pause-aware via ref; re-running this
    // effect on recorder open would wipe in-progress play.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (event) => {
      if (isPaused) return;
      const point = getPoint(event.clientX, event.clientY);
      if (point) setDragPoint(point);
    };

    const handleUp = (event) => {
      if (isPaused) return;
      const point = getPoint(event.clientX, event.clientY);
      if (!point || !selectedMaterial) {
        setDragging(false);
        setDragPoint(null);
        return;
      }

      let bestIndex = -1;
      const slot = POS.slots[nextEmptyIndex];
      if (slot) {
        const distance = Math.hypot(point.x - slot.l, point.y - slot.t);
        bestIndex = distance < 13 ? nextEmptyIndex : -1;
      }

      if (bestIndex >= 0) {
        const nextFilled = filled.slice();
        nextFilled[bestIndex] = true;
        setFilled(nextFilled);
        onMicroWin?.();

        stopVoice?.();
        playSyllable?.(AUDIO.syllables[nextFilled.filter(Boolean).length - 1]);

        if (nextFilled.every(Boolean)) {
          startHopping();
        }
      }

      setDragging(false);
      setDragPoint(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [dragging, filled, getPoint, isPaused, nextEmptyIndex, onMicroWin, playSyllable, selectedMaterial, startHopping, stopVoice]);

  useEffect(() => {
    vakHintVoiceRef.current = { stage: hintStage, level: 0 };
  }, [hintStage, phase]);

  useEffect(() => {
    if (!isActive) return;
    if (phase !== 'choose' && phase !== 'build') return;
    if (hintLevel <= 0) return;

    const last = vakHintVoiceRef.current;
    if (last.stage === hintStage && last.level === hintLevel) return;

    let voiceKey = null;
    if (hintStage === 'build') {
      if (hintLevel === 2) voiceKey = 'hintLookForGlow';
      if (hintLevel >= 3) voiceKey = 'hintKeepBuildingPath';
    }

    vakHintVoiceRef.current = { stage: hintStage, level: hintLevel };
    if (voiceKey) {
      playSceneLine?.(voiceKey);
    }
  }, [hintLevel, hintStage, isActive, phase, playSceneLine]);

  if (!isActive) return null;

  const frogPos = hopIndex < 0
    ? POS.frogStart
    : (hopIndex >= POS.slots.length ? POS.frogEnd : POS.slots[hopIndex]);
  const frogHappyNow = hopIndex >= 0 || phase === 'reunion';
  const remaining = POS.slots.length - placedCount;

  const lyr = (p, w) => ({
    left: `${p.l}%`,
    top: `${p.t}%`,
    width: `${w ?? p.w}%`,
  });

  const pieceWidth = activeMaterial?.pieceW ?? 10;
  const ghostStyle = dragPoint
    ? { left: `${dragPoint.x}%`, top: `${dragPoint.y}%`, width: `${pieceWidth}%` }
    : null;

  const renderPileStack = (materialKey, clickable) => {
    const material = MATERIALS[materialKey];
    const { l, t, w } = material.pile;
    const offsets = [{ dx: -1, dy: 2 }, { dx: 1, dy: 1 }, { dx: 0, dy: 0 }];

    return offsets.map((offset, index) => {
      const isTop = index === offsets.length - 1;
      return (
        <div
          key={`${materialKey}-${index}`}
          className={`vak-layer vak-pile ${clickable && isTop ? 'is-clickable' : ''} ${phase === 'choose' && clickable && isTop && hintLevel >= 1 ? 'vak-hint-pulse' : ''} ${phase === 'choose' && clickable && isTop && hintLevel >= 2 ? 'vak-hint-glow' : ''}`}
          style={{
            left: `${l + offset.dx}%`,
            top: `${t + offset.dy}%`,
            width: `${w}%`,
            zIndex: 6 + index,
            pointerEvents: clickable && isTop ? 'auto' : 'none',
            cursor: clickable && isTop ? 'pointer' : 'default'
          }}
          onClick={clickable && isTop ? () => {
            if (isPaused) return;
            markInteraction();
            setSelectedMaterial(materialKey);
            setPhase('build');
            playSfx?.('tap');
            playSceneLine?.('scene10_vak_drag');
          } : undefined}
        >
          <img src={material.asset} alt="" />
        </div>
      );
    });
  };

  const renderBuildStack = () => {
    if (!selectedMaterial || remaining <= 0) return null;
    const material = MATERIALS[selectedMaterial];
    const stack = [];

    for (let i = 0; i < remaining; i += 1) {
      const reverseIndex = remaining - 1 - i;
      const isTop = i === remaining - 1;
      stack.push(
        <div
          key={`piece-${i}`}
          className={`vak-layer vak-piece ${isTop ? 'is-active' : 'is-waiting'} ${phase === 'build' && isTop && hintLevel >= 1 ? 'vak-hint-pulse' : ''} ${phase === 'build' && isTop && hintLevel >= 2 ? 'vak-hint-glow' : ''}`}
          style={{
            left: `${material.pile.l + reverseIndex * 1.5}%`,
            top: `${material.pile.t - reverseIndex * 2}%`,
            width: `${material.pieceW}%`,
            zIndex: isTop ? 16 : 7 + i,
            opacity: isTop && dragging ? 0.15 : (isTop ? 1 : 0.84),
            pointerEvents: isTop && phase === 'build' ? 'auto' : 'none'
          }}
          onPointerDown={isTop && phase === 'build' ? (event) => {
            event.preventDefault();
            event.stopPropagation();
            const point = getPoint(event.clientX, event.clientY);
            if (!point) return;
            markInteraction();
            setDragging(true);
            setDragPoint(point);
          } : undefined}
        >
          <img src={material.asset} alt="" />
        </div>
      );
    }

    return stack;
  };

  return (
    <div
      ref={stageRef}
      className={`vak-game ${hideElements ? 'is-hidden' : ''}`}
      onContextMenu={(event) => event.preventDefault()}
    >
      {phase !== 'intro' && (
        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={placedCount}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={() => {}}
        />
      )}

      <div
        className={`vak-layer vak-family ${familyBounce ? 'is-bouncing' : 'is-breathing'}`}
        style={{ ...lyr(POS.family), zIndex: 8 }}
      >
        <img src={frogFamily} alt="" />
      </div>

      {phase === 'choose' && Object.keys(MATERIALS).map((materialKey) => (
        <React.Fragment key={materialKey}>
          {renderPileStack(materialKey, true)}
        </React.Fragment>
      ))}

      {phase === 'build' && POS.slots.map((slot, idx) => (
        filled[idx] ? null : (
          <div
            key={`slot-${idx}`}
            className={`vak-layer vak-slot ${idx === nextEmptyIndex ? 'is-next' : ''}`}
            style={{ ...lyr(slot), zIndex: 5 }}
          >
            <span className="vak-slot-ring" />
          </div>
        )
      ))}

      {selectedMaterial && POS.slots.map((slot, idx) => (
        filled[idx] ? (
          <div
            key={`placed-${idx}`}
            className="vak-layer vak-placed-piece"
            style={{ ...lyr(slot, pieceWidth), zIndex: 7 }}
          >
            <img src={activeMaterial.asset} alt="" />
          </div>
        ) : null
      ))}

      {/* Inline drag demo replaced by GestureDemo
      {phase === 'build' && placedCount === 0 && !dragging && selectedMaterial && cueStart && (
        <>
          <svg
            className={`vak-demo-path ${hintLevel >= 2 ? 'vak-hint-glow' : ''}`}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d={`M ${cueStart.l} ${cueStart.t} Q ${cueStart.l + 9} ${cueStart.t - 7} ${POS.slots[0].l - 2} ${POS.slots[0].t - 1}`}
            />
          </svg>
          <div
            className={`vak-demo-piece ${hintLevel >= 1 ? 'vak-hint-pulse' : ''} ${hintLevel >= 2 ? 'vak-hint-glow' : ''}`}
            key={`vak-demo-piece-${pulseTick}`}
            style={{
              left: `${cueStart.l}%`,
              top: `${cueStart.t}%`,
              width: `${pieceWidth}%`,
              '--vak-cue-dx': `${POS.slots[0].l - cueStart.l}%`,
              '--vak-cue-dy': `${POS.slots[0].t - cueStart.t}%`,
            }}
          >
            <img src={activeMaterial.asset} alt="" />
          </div>
          <div
            className={`vak-demo-arrow ${hintLevel >= 1 ? 'vak-hint-pulse' : ''} ${hintLevel >= 3 ? 'vak-hint-glow' : ''}`}
            style={{ left: `${POS.slots[0].l}%`, top: `${POS.slots[0].t - 8}%` }}
            aria-hidden="true"
          >
            ↓
          </div>
        </>
      )}
      */}

      {phase === 'build' && renderBuildStack()}

      <GestureDemo
        key={`vak-gesture-${selectedMaterial ?? 'none'}-${hintLevel}-${placedCount}`}
        type="drag"
        from={{ x: activeMaterial?.pile.l ?? 30, y: activeMaterial?.pile.t ?? 76 }}
        to={{ x: POS.slots[0].l, y: POS.slots[0].t }}
        active={showBuildGesture}
        idleDelay={500}
      />

      {dragging && ghostStyle && activeMaterial && (
        <div
          className="vak-layer vak-drag-ghost"
          style={{ ...ghostStyle, zIndex: 40, pointerEvents: 'none' }}
        >
          <img src={activeMaterial.asset} alt="" />
        </div>
      )}

      <div
        className={`vak-layer vak-frog ${phase === 'hopping' || phase === 'reunion' ? 'is-hopping' : ''} ${hopIndex < 0 ? 'is-breathing' : ''}`}
        style={{
          left: `${frogPos.l}%`,
          top: `${frogPos.t}%`,
          width: `${hopIndex < 0 ? POS.frogStart.w : 7}%`,
          zIndex: hopIndex < 0 ? 12 : 15
        }}
      >
        <img src={frogHappyNow ? frogHappy : frogSwim} alt="" />
      </div>
    </div>
  );
}
