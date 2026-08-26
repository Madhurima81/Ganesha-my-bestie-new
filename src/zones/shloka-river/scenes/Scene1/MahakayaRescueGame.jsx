// src/zones/shloka-river/scenes/Scene1/MahakayaRescueGame.jsx
//
// MAHAKAYA - attach rope, pull logs into the raft, make room for everyone.
// Each completed pull adds one log, welcomes one animal, and locks one syllable.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './MahakayaRescueGame.css';

import raftLogSingle from './assets/images/mahakaya/mahakaya-log-single.png';
import elephantCalf from './assets/images/mahakaya/elephant-calf.png';
import peacockSymbolMountain from '../../../symbol-mountain/scenes/tusk/assets/images/peacock-new.png';
import cowSymbolMountain from '../../../symbol-mountain/scenes/tusk/assets/images/cow-new.png';
import monkeySymbolMountain from '../../../symbol-mountain/scenes/tusk/assets/images/monkey-new.png';

const SYLLABLES = ['Ma', 'ha', 'ka', 'ya'];
const AUDIO = { syllables: ['ma', 'ha', 'ka', 'ya'] };
const TOTAL_LOGS = 3;
const TOTAL_SYLLABLES = 4;
const ATTACH_DIST = 10;
const DEBUG_PHASE_OPTIONS = [
  { value: 0, label: 'Start' },
  { value: 1, label: 'After Log 1' },
  { value: 2, label: 'After Log 2' },
  { value: 3, label: 'After Log 3' },
];
const JOIN_SEQUENCE = [0, 2, 1, 3];
const LAYOUT_PRESET_VERSION = '2026-08-24-mahakaya-start-scale-3';
// Final raft position after crossing. Derived from the last log (logTarget2)
// landing at ~{ l: 76, t: 52 } in the "After Log 3" layout:
//   logTarget2 phase-3 layout {39.6, 46.6} + CROSS_DELTA {36.4, 5.5}
//   → raft target {24.8 + 36.4, 39.3 + 5.5}
const CROSS_TARGET_RAFT = { l: 61, t: 45 };

const PHASE0_LAYOUT = {
  pulley: { l: 56.2, t: 12.4, w: 4.5 },
  handleStart: { l: 45.3, t: 35.8, w: 6.6 },
  pullTop: { l: 56.2, t: 24.2, w: 6.6 },
  pullBottom: { l: 56.2, t: 78, w: 6.6 },
  raft: { l: 24.8, t: 39.3, w: 31.8 },
  logTarget0: { l: 31.2, t: 40.6, w: 31.8 },
  logTarget1: { l: 39.6, t: 41.2, w: 31.8 },
  logTarget2: { l: 48, t: 41.8, w: 31.8 },
  waitingLog0: { l: 77.2, t: 23.8, w: 31.8 },
  waitingLog1: { l: 81.7, t: 21.4, w: 31.8 },
  waitingLog2: { l: 85.5, t: 24.9, w: 31.8 },
  animal0: { l: 21.6, t: 31.8, w: 19.4 },
  animal1: { l: 39.6, t: 33.7, w: 16.9 },
  animal2: { l: 31.3, t: 32.2, w: 17.6 },
  animal3: { l: 47.2, t: 32.5, w: 15.8 },
  waitingAnimal1: { l: 12.7, t: 81.1, w: 16.7 },
  waitingAnimal2: { l: 30.1, t: 78.2, w: 18.2 },
  waitingAnimal3: { l: 15.9, t: 65.4, w: 11.1 },
};

const CROSS_DELTA = {
  l: CROSS_TARGET_RAFT.l - PHASE0_LAYOUT.raft.l,
  t: CROSS_TARGET_RAFT.t - PHASE0_LAYOUT.raft.t,
};

const DEFAULT_PHASE_LAYOUTS = [
  PHASE0_LAYOUT,
  {
    ...PHASE0_LAYOUT,
    logTarget0: { l: 28.4, t: 44.3, w: 31.8 },
    animal2: { l: 32.9, t: 31.6, w: 15.8 },
    waitingAnimal1: { l: 13.8, t: 81.6, w: 17.6 },
    waitingAnimal3: { l: 14.2, t: 65.8, w: 15.1 },
  },
  {
    ...PHASE0_LAYOUT,
    logTarget0: { l: 31.4, t: 40.4, w: 31.8 },
    logTarget1: { l: 33.9, t: 43.5, w: 31.8 },
    animal2: { l: 31.2, t: 31.9, w: 15.8 },
    animal1: { l: 37.1, t: 29.1, w: 16.9 },
    waitingAnimal3: { l: 14.2, t: 65.8, w: 15.1 },
  },
  {
    ...PHASE0_LAYOUT,
    logTarget0: { l: 31.4, t: 40.4, w: 31.8 },
    logTarget1: { l: 33.9, t: 43.5, w: 31.8 },
    logTarget2: { l: 39.6, t: 46.6, w: 31.8 },
    animal2: { l: 31.2, t: 31.9, w: 15.8 },
    animal1: { l: 37.1, t: 29.1, w: 16.9 },
    animal3: { l: 34.4, t: 38, w: 15.5 },
  },
];

const DEBUG_KEYS = [
  'pulley',
  'handleStart',
  'pullTop',
  'pullBottom',
  'raft',
  'logTarget0',
  'logTarget1',
  'logTarget2',
  'waitingLog0',
  'waitingLog1',
  'waitingLog2',
  'animal0',
  'animal1',
  'animal2',
  'animal3',
  'waitingAnimal1',
  'waitingAnimal2',
  'waitingAnimal3',
];

const ANIMALS = [
  { id: 'elephant', img: elephantCalf, name: 'Elephant' },
  { id: 'peacock', img: peacockSymbolMountain, name: 'Peacock' },
  { id: 'cow', img: cowSymbolMountain, name: 'Cow' },
  { id: 'monkey', img: monkeySymbolMountain, name: 'Monkey' },
];

const FLIPPED_ANIMAL_IDS = new Set(['peacock', 'cow']);

const lerp = (a, b, t) => a + (b - a) * t;
const mixPos = (from, to, t) => ({
  l: lerp(from.l, to.l, t),
  t: lerp(from.t, to.t, t),
  w: lerp(from.w, to.w, t),
});

function RopeGripSvg() {
  return (
    <svg className="maha-grip-svg" viewBox="0 0 120 44" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="mahaGripWood" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d49a66" />
          <stop offset="22%" stopColor="#ebbc8b" />
          <stop offset="48%" stopColor="#d49a66" />
          <stop offset="74%" stopColor="#ebbc8b" />
          <stop offset="100%" stopColor="#bc7f4f" />
        </linearGradient>
        <linearGradient id="mahaGripCap" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cf9560" />
          <stop offset="100%" stopColor="#a96f45" />
        </linearGradient>
      </defs>
      <rect x="18" y="12" width="84" height="20" rx="10" fill="url(#mahaGripWood)" />
      <rect x="8" y="6" width="16" height="32" rx="8" fill="url(#mahaGripCap)" />
      <rect x="96" y="6" width="16" height="32" rx="8" fill="url(#mahaGripCap)" />
      <path d="M26 16 H94" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 28 H94" stroke="rgba(120,72,34,0.18)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function RopeLine({ x1, y1, x2, y2, zIndex = 14 }) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const controlX = midX + (x2 - x1) * 0.04;
  const controlY = midY + Math.min(14, Math.max(4, distance * 0.12));
  const d = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;

  return (
    <svg
      className="maha-rope-svg"
      style={{ zIndex }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={d} fill="none" stroke="#d19159" strokeWidth="0.95" strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke="#efc392"
        strokeWidth="0.48"
        strokeLinecap="round"
        strokeDasharray="0.01 2.2"
        opacity="0.82"
      />
    </svg>
  );
}

export default function MahakayaRescueGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  voiceGuidance = {},
  isPaused = false,
}) {
  const { playVoice: playSceneLine, playSfx, playSyllable, playWord, stopVoice } = voiceGuidance;

  const [phase, setPhase] = useState('intro');
  const [ropeStage, setRopeStage] = useState('detached');
  const [activeLog, setActiveLog] = useState(0);
  const [completedLogs, setCompletedLogs] = useState(0);
  const [litCount, setLitCount] = useState(0);
  const [pullProgress, setPullProgress] = useState(0);
  const [knobPos, setKnobPos] = useState({ l: DEFAULT_PHASE_LAYOUTS[0].handleStart.l, t: DEFAULT_PHASE_LAYOUTS[0].handleStart.t });
  const [dragging, setDragging] = useState(null);
  const [phaseLayouts, setPhaseLayouts] = useState(DEFAULT_PHASE_LAYOUTS);
  const [debugMode, setDebugMode] = useState(false);
  const [selectedDebugKey, setSelectedDebugKey] = useState('waitingLog0');
  const [debugPhase, setDebugPhase] = useState(0);
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 12, y: 96 });
  const [crossing, setCrossing] = useState(false);
  const [layoutPresetVersion, setLayoutPresetVersion] = useState(LAYOUT_PRESET_VERSION);

  const stageRef = useRef(null);
  const timers = useRef([]);
  const isPausedRef = useRef(isPaused);
  const phaseRef = useRef('intro');
  const ropeStageRef = useRef('detached');
  const draggingRef = useRef(null);
  const completedLogsRef = useRef(0);
  const completionStartedRef = useRef(false);
  const debugDragRef = useRef(null);
  const debugPanelDragRef = useRef(null);

  const { hintLevel, markInteraction } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play' && !debugMode,
    stageKey: `${ropeStage}-${activeLog}`,
    initialDelay: ropeStage === 'detached' ? 8000 : 6500,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: ropeStage === 'detached' ? 15000 : 13000,
    level3Delay: ropeStage === 'detached' ? 22000 : 20000,
  });

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const after = useCallback((ms, fn) => {
    const runWhenReady = () => {
      if (isPausedRef.current) {
        const retryId = setTimeout(runWhenReady, 150);
        timers.current.push(retryId);
        return;
      }
      fn();
    };
    const id = setTimeout(runWhenReady, ms);
    timers.current.push(id);
  }, []);

  const pointFromEvent = useCallback((e) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      l: ((e.clientX - rect.left) / rect.width) * 100,
      t: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const resetState = useCallback(() => {
    clearTimers();
    setPhase('intro');
    phaseRef.current = 'intro';
    setRopeStage('detached');
    ropeStageRef.current = 'detached';
    setActiveLog(0);
    setCompletedLogs(0);
    completedLogsRef.current = 0;
    setLitCount(0);
    setPullProgress(0);
    setKnobPos({ l: phaseLayouts[0].handleStart.l, t: phaseLayouts[0].handleStart.t });
    setDragging(null);
    draggingRef.current = null;
    completionStartedRef.current = false;
    setDebugPhase(0);
    setCrossing(false);
  }, [clearTimers, phaseLayouts]);

  useEffect(() => {
    isPausedRef.current = isPaused;
    if (isPaused) {
      draggingRef.current = null;
      setDragging(null);
      debugDragRef.current = null;
    }
  }, [isPaused]);

  useEffect(() => {
    if (!isActive) return undefined;
    resetState();
    playSceneLine?.('scene10_maha_intro', () => {
      setPhase('play');
      phaseRef.current = 'play';
      playSceneLine?.('scene10_maha_drag_rope');
    });
    return clearTimers;
    // Voice and timer helpers are stable enough for this scene lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  useEffect(() => {
    if (!debugMode) return;
    const previewLayout = phaseLayouts[debugPhase];
    setKnobPos({ l: previewLayout.handleStart.l, t: previewLayout.handleStart.t });
  }, [debugMode, debugPhase, phaseLayouts]);

  useEffect(() => {
    if (layoutPresetVersion === LAYOUT_PRESET_VERSION) return;
    setPhaseLayouts(DEFAULT_PHASE_LAYOUTS);
    setLayoutPresetVersion(LAYOUT_PRESET_VERSION);
    setKnobPos({ l: DEFAULT_PHASE_LAYOUTS[0].handleStart.l, t: DEFAULT_PHASE_LAYOUTS[0].handleStart.t });
    if (completedLogsRef.current === 0) {
      setDebugPhase(0);
    }
  }, [layoutPresetVersion]);

  if (!isActive) return null;

  const visiblePhase = debugMode ? debugPhase : completedLogs;
  const visibleLayout = phaseLayouts[visiblePhase];
  const activeLayout = phaseLayouts[completedLogs];
  const nextLayout = phaseLayouts[Math.min(completedLogs + 1, TOTAL_LOGS)];

  const updateLayout = (key, patch) => {
    setPhaseLayouts((current) => current.map((phaseLayout, phaseIndex) => {
      if (phaseIndex !== debugPhase) return phaseLayout;
      return {
        ...phaseLayout,
        [key]: { ...phaseLayout[key], ...patch },
      };
    }));
  };

  const resetCurrentPhaseLayout = () => {
    setPhaseLayouts((current) => current.map((phaseLayout, phaseIndex) => (
      phaseIndex === debugPhase ? DEFAULT_PHASE_LAYOUTS[debugPhase] : phaseLayout
    )));
  };

  const resetAllPhaseLayouts = () => {
    setPhaseLayouts(DEFAULT_PHASE_LAYOUTS);
    setDebugPhase(0);
    setSelectedDebugKey('waitingLog0');
    setKnobPos({ l: DEFAULT_PHASE_LAYOUTS[0].handleStart.l, t: DEFAULT_PHASE_LAYOUTS[0].handleStart.t });
  };

  const nudgeSize = (delta) => {
    updateLayout(selectedDebugKey, {
      w: Math.max(2, Number(((visibleLayout[selectedDebugKey].w || 4) + delta).toFixed(1))),
    });
  };

  const nudgeHeight = (delta) => {
    updateLayout(selectedDebugKey, {
      h: Math.max(2, Number((((visibleLayout[selectedDebugKey].h || visibleLayout[selectedDebugKey].w || 4) + delta)).toFixed(1))),
    });
  };

  const nudgePosition = (axis, delta) => {
    updateLayout(selectedDebugKey, {
      [axis]: Number(((visibleLayout[selectedDebugKey][axis] || 0) + delta).toFixed(1)),
    });
  };

  const updateLayoutField = (key, field, value) => {
    const nextValue = Number(value);
    if (Number.isNaN(nextValue)) return;
    updateLayout(key, {
      [field]: nextValue,
    });
  };

  const applyDebugDrag = (event) => {
    const drag = debugDragRef.current;
    if (!drag) return;
    const point = pointFromEvent(event);
    if (!point) return;

    updateLayout(drag.key, {
      l: point.l - drag.offsetL,
      t: point.t - drag.offsetT,
    });
    setSelectedDebugKey(drag.key);
  };

  const startDebugDrag = (e, key) => {
    if (!debugMode) return false;
    e.preventDefault();
    e.stopPropagation();
    const point = pointFromEvent(e);
    if (!point) return true;
    setSelectedDebugKey(key);
    debugDragRef.current = {
      key,
      offsetL: point.l - visibleLayout[key].l,
      offsetT: point.t - visibleLayout[key].t,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    applyDebugDrag(e);
    return true;
  };

  const withCross = (pos) => (
    crossing ? { ...pos, l: pos.l + CROSS_DELTA.l, t: pos.t + CROSS_DELTA.t } : pos
  );

  const placeStyle = (pos, extra = {}) => ({
    left: `${pos.l}%`,
    top: `${pos.t}%`,
    width: `${pos.w}%`,
    ...(pos.h ? { height: `${pos.h}%` } : {}),
    ...extra,
  });

  const waitingLogKey = `waitingLog${activeLog}`;
  const targetLogKey = `logTarget${activeLog}`;
  const currentWaitingLog = activeLayout[waitingLogKey];
  const currentTargetLog = nextLayout[targetLogKey];
  const currentMovingLog = mixPos(currentWaitingLog, currentTargetLog, pullProgress);
  const pullHandleTop = lerp(activeLayout.pullTop.t, activeLayout.pullBottom.t, pullProgress);
  const activePullHandle = { ...activeLayout.pullTop, t: pullHandleTop };
  const allDone = litCount >= TOTAL_SYLLABLES;
  const raftImage = raftLogSingle;

  const completeRound = () => {
    if (ropeStageRef.current !== 'attached') return;
    const nextCompleted = Math.min(TOTAL_LOGS, completedLogsRef.current + 1);
    completedLogsRef.current = nextCompleted;
    setCompletedLogs(nextCompleted);
    onMicroWin?.();
    playSfx?.('chime');
    setPullProgress(0);
    draggingRef.current = null;
    setDragging(null);

    // Hold beat between the log visually attaching and its syllable lighting/sounding —
    // was firing in the same tick, so it read as too instant/rushed.
    const SYLLABLE_HOLD_MS = 600;

    if (nextCompleted >= TOTAL_LOGS) {
      ropeStageRef.current = 'done';
      setRopeStage('done');

      // ka
      after(SYLLABLE_HOLD_MS, () => {
        setLitCount(nextCompleted);
      });

      // ya
      after(SYLLABLE_HOLD_MS + 700, () => {
        setLitCount(TOTAL_SYLLABLES);
        setPhase('complete');
        phaseRef.current = 'complete';
      });

      // Raft starts crossing only once "kaya" has fully sounded, then the
      // "mahakaya" word plays during the glide, followed by the completion VO.
      after(SYLLABLE_HOLD_MS + 700 + 700, () => {
        setCrossing(true);

        const finishGame = () => {
          if (completionStartedRef.current) return;
          completionStartedRef.current = true;
          onGameComplete?.();
          onPhaseComplete();
        };

        // Browser TTS/audio onended can silently fail to fire (esp. iOS Safari) —
        // don't let scene completion hang forever on a dropped VO callback.
        const voFallback = setTimeout(finishGame, 8000);
        timers.current.push(voFallback);

        playWord?.('mahakaya', () => {
          playSceneLine?.('scene10_maha_success', finishGame, { stripLeadingText: 'Mahakaya' });
        });
      });
      return;
    }

    after(SYLLABLE_HOLD_MS, () => {
      setLitCount(nextCompleted);
    });

    const nextLog = nextCompleted;
    setActiveLog(nextLog);
    ropeStageRef.current = 'detached';
    setRopeStage('detached');
    setKnobPos({ l: phaseLayouts[nextLog].handleStart.l, t: phaseLayouts[nextLog].handleStart.t });
    // Full "drag the rope" VO only plays once, before round 1 (via the intro
    // sequence). Rounds 2+ rely on the hint-cycle text + GestureDemo instead —
    // avoids repeating the line and colliding with the syllable clip's audio.
  };

  const onKnobDown = (e) => {
    if (debugMode || isPaused || phaseRef.current !== 'play' || ropeStageRef.current !== 'detached') return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    markInteraction();
    draggingRef.current = 'knob';
    setDragging('knob');
  };

  const onPullDown = (e) => {
    if (debugMode || isPaused || phaseRef.current !== 'play' || ropeStageRef.current !== 'attached') return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    markInteraction();
    draggingRef.current = 'pull';
    setDragging('pull');
  };

  const onPointerMove = (e) => {
    if (debugDragRef.current && !isPaused) {
      e.preventDefault();
      e.stopPropagation();
      applyDebugDrag(e);
      return;
    }

    if (!draggingRef.current || isPaused) return;
    const point = pointFromEvent(e);
    if (!point) return;

    if (draggingRef.current === 'knob') {
      setKnobPos(point);
      return;
    }

    if (draggingRef.current === 'pull') {
      const np = Math.max(0, Math.min(1, (point.t - activeLayout.pullTop.t) / (activeLayout.pullBottom.t - activeLayout.pullTop.t)));
      setPullProgress(np);
      if (np >= 1) completeRound();
    }
  };

  const onPointerUp = (e) => {
    if (debugDragRef.current) {
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      }
      debugDragRef.current = null;
      return;
    }

    if (!draggingRef.current) return;
    if (draggingRef.current === 'knob') {
      const point = pointFromEvent(e) || knobPos;
      const dist = Math.hypot(point.l - currentWaitingLog.l, point.t - currentWaitingLog.t);
      if (dist < ATTACH_DIST) {
        ropeStageRef.current = 'attached';
        setRopeStage('attached');
        setKnobPos({ l: currentWaitingLog.l, t: currentWaitingLog.t });
        playSfx?.('chime');
        if (completedLogsRef.current === 0) {
          playSceneLine?.('scene10_maha_pull_down');
        }
      } else {
        setKnobPos({ l: activeLayout.handleStart.l, t: activeLayout.handleStart.t });
      }
    } else if (draggingRef.current === 'pull') {
      setPullProgress(0);
    }
    draggingRef.current = null;
    setDragging(null);
  };

  const startDebugPanelDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    debugPanelDragRef.current = {
      offsetX: event.clientX - debugPanelPosition.x,
      offsetY: event.clientY - debugPanelPosition.y,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const continueDebugPanelDrag = (event) => {
    const drag = debugPanelDragRef.current;
    if (!drag) return;
    event.preventDefault();
    event.stopPropagation();

    const panelWidth = Math.min(352, window.innerWidth - 24);
    const panelHeight = debugMode ? Math.min(window.innerHeight * 0.78, 560) : 48;
    const nextX = Math.max(8, Math.min(window.innerWidth - panelWidth - 8, event.clientX - drag.offsetX));
    const nextY = Math.max(8, Math.min(window.innerHeight - panelHeight - 8, event.clientY - drag.offsetY));

    setDebugPanelPosition({ x: nextX, y: nextY });
  };

  const endDebugPanelDrag = (event) => {
    if (!debugPanelDragRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    debugPanelDragRef.current = null;
  };

  const renderLog = (key, className, pos, zIndex, options = {}) => (
    <div
      key={key}
      className={`maha-layer maha-log-piece ${className || ''} ${crossing ? 'is-crossing' : ''} ${debugMode && selectedDebugKey === key ? 'is-debug-selected' : ''}`}
      style={placeStyle(pos, {
        zIndex,
        opacity: options.hidden ? 0 : 1,
        pointerEvents: options.hidden ? 'none' : undefined,
      })}
      onPointerDown={(e) => startDebugDrag(e, key)}
    >
      <img src={raftLogSingle} alt="" />
    </div>
  );

  const renderAnimal = (animalIndex, joined) => {
    const animal = ANIMALS[animalIndex];
    const key = joined ? `animal${animalIndex}` : `waitingAnimal${animalIndex}`;
    const joinOrderIndex = JOIN_SEQUENCE.indexOf(animalIndex);
    const shouldBeJoined = joinOrderIndex !== -1 && joinOrderIndex <= visiblePhase;
    const pos = shouldBeJoined ? withCross(visibleLayout[key]) : visibleLayout[key];
    return (
      <div
        key={`${animal.id}-${shouldBeJoined ? 'raft' : 'wait'}`}
        className={`maha-layer maha-animal ${shouldBeJoined ? 'is-joined' : 'is-waiting'} ${FLIPPED_ANIMAL_IDS.has(animal.id) ? 'is-flipped' : ''} ${crossing ? 'is-crossing' : ''} ${debugMode && selectedDebugKey === key ? 'is-debug-selected' : ''}`}
        style={placeStyle(pos, { zIndex: shouldBeJoined ? 22 : 9 })}
        onPointerDown={(e) => startDebugDrag(e, key)}
        title={animal.name}
      >
        <img src={animal.img} alt="" />
      </div>
    );
  };

  return (
    <div
      ref={stageRef}
      className={`maha-game ${hideElements ? 'is-hidden' : ''} ${debugMode ? 'is-debugging' : ''}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {phase !== 'intro' && (
        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={(syllable) => {
            stopVoice?.();
            playSyllable?.(syllable);
          }}
        />
      )}

      {phase === 'play' && (
        <p className={`maha-hint ${hintLevel >= 1 ? 'is-visible' : ''}`}>
          {ropeStage === 'detached' && hintLevel === 1 && 'Try the glowing rope.'}
          {ropeStage === 'detached' && hintLevel === 2 && 'Attach the rope to a log.'}
          {ropeStage === 'detached' && hintLevel >= 3 && 'Drag the handle to the next log.'}
          {ropeStage === 'attached' && hintLevel === 1 && 'Pull the handle down.'}
          {ropeStage === 'attached' && hintLevel === 2 && 'Pull to add the log.'}
          {ropeStage === 'attached' && hintLevel >= 3 && 'Pull all the way down.'}
        </p>
      )}

      {phase === 'complete' && <p className="maha-doneline">There is room for everyone.</p>}

      <div
        className={`maha-layer maha-raft-art ${allDone ? 'is-complete' : ''} ${crossing ? 'is-crossing' : ''} ${debugMode && selectedDebugKey === 'raft' ? 'is-debug-selected' : ''}`}
        style={placeStyle(withCross(visibleLayout.raft), { zIndex: 10 })}
        onPointerDown={(e) => startDebugDrag(e, 'raft')}
      >
        <img src={raftImage} alt="" />
      </div>

      {[0, 1, 2].map((index) => {
        if (index < visiblePhase) {
          return renderLog(`logTarget${index}`, 'maha-raft-log is-attached', withCross(visibleLayout[`logTarget${index}`]), 18 + index);
        }
        if (index === activeLog && ropeStage === 'attached') {
          return renderLog(`movingLog${index}`, 'is-moving', currentMovingLog, 20);
        }
        if (index >= completedLogs) {
          return renderLog(`waitingLog${index}`, index === activeLog ? 'is-current' : '', visibleLayout[`waitingLog${index}`], 8);
        }
        return null;
      })}

      {ANIMALS.map((_, index) => {
        const joinOrderIndex = JOIN_SEQUENCE.indexOf(index);
        const isJoined = joinOrderIndex !== -1 && joinOrderIndex <= visiblePhase;
        return renderAnimal(index, isJoined);
      })}

      <div
        className={`maha-layer maha-pulley ${debugMode && selectedDebugKey === 'pulley' ? 'is-debug-selected' : ''}`}
        style={placeStyle(visibleLayout.pulley, { zIndex: 16 })}
        onPointerDown={(e) => startDebugDrag(e, 'pulley')}
        aria-hidden="true"
      />

      {ropeStage === 'detached' && phase === 'play' && (
        <>
          <RopeLine x1={activeLayout.pulley.l} y1={activeLayout.pulley.t} x2={knobPos.l} y2={knobPos.t} />
          <div
            className={`maha-layer maha-knob ${dragging === 'knob' ? 'grabbing' : ''} ${hintLevel >= 1 ? 'maha-hint-pulse' : ''} ${hintLevel >= 2 ? 'maha-hint-glow' : ''} ${debugMode && selectedDebugKey === 'handleStart' ? 'is-debug-selected' : ''}`}
            style={placeStyle({ ...activeLayout.handleStart, l: knobPos.l, t: knobPos.t }, { zIndex: 24 })}
            onPointerDown={(e) => (debugMode ? startDebugDrag(e, 'handleStart') : onKnobDown(e))}
          >
            <RopeGripSvg />
          </div>
        </>
      )}

      {ropeStage === 'attached' && phase === 'play' && (
        <>
          <RopeLine x1={activeLayout.pulley.l} y1={activeLayout.pulley.t} x2={currentMovingLog.l} y2={currentMovingLog.t} />
          <RopeLine x1={activeLayout.pulley.l} y1={activeLayout.pulley.t} x2={activeLayout.pullTop.l} y2={activePullHandle.t} />
          <div
            className={`maha-layer maha-pull ${dragging === 'pull' ? 'grabbing' : ''} ${hintLevel >= 1 ? 'maha-hint-pulse' : ''} ${hintLevel >= 2 ? 'maha-hint-glow' : ''} ${debugMode && selectedDebugKey === 'pullTop' ? 'is-debug-selected' : ''}`}
            style={placeStyle(activePullHandle, { zIndex: 24 })}
            onPointerDown={(e) => (debugMode ? startDebugDrag(e, 'pullTop') : onPullDown(e))}
          >
            <RopeGripSvg />
          </div>
        </>
      )}

      <GestureDemo
        type="drag"
        from={{ x: activeLayout.handleStart.l, y: activeLayout.handleStart.t }}
        to={{ x: currentWaitingLog.l, y: currentWaitingLog.t }}
        active={!debugMode && ropeStage === 'detached' && phase === 'play'}
        idleDelay={3000}
      />
      <GestureDemo
        type="pull-down"
        from={{ x: activeLayout.pullTop.l, y: activeLayout.pullTop.t }}
        to={{ x: activeLayout.pullBottom.l, y: activeLayout.pullBottom.t }}
        active={!debugMode && ropeStage === 'attached' && phase === 'play'}
        idleDelay={3000}
      />

      <div
        className={`maha-debug-panel ${debugMode ? 'is-open' : ''}`}
        style={{ left: `${debugPanelPosition.x}px`, top: `${debugPanelPosition.y}px` }}
      >
        <button
          type="button"
          className="maha-debug-toggle"
          onClick={() => setDebugMode((show) => !show)}
        >
          {debugMode ? 'Hide Layout Debug' : 'Layout Debug'}
        </button>

        {debugMode && (
          <div className="maha-debug-body">
            <div
              className="maha-debug-drag-handle"
              onPointerDown={startDebugPanelDrag}
              onPointerMove={continueDebugPanelDrag}
              onPointerUp={endDebugPanelDrag}
              onPointerCancel={endDebugPanelDrag}
            >
              Drag layout panel
            </div>

            <div className="maha-debug-section-title">Scene Objects</div>
            <p className="maha-debug-note">
              Switch phases, then drag any highlighted element on the scene or tune its numbers here.
            </p>

            <label className="maha-debug-row">
              <span>Phase</span>
              <select value={debugPhase} onChange={(e) => setDebugPhase(Number(e.target.value))}>
                {DEBUG_PHASE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <span />
            </label>

            <label className="maha-debug-row">
              <span>Object</span>
              <select value={selectedDebugKey} onChange={(e) => setSelectedDebugKey(e.target.value)}>
                {DEBUG_KEYS.map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
              <span />
            </label>

            {['l', 't', 'w', 'h'].map((field) => (
              <label key={field} className="maha-debug-row">
                <span>{field === 'l' ? 'left' : field === 't' ? 'top' : field === 'w' ? 'width' : 'height'}</span>
                <input
                  type="range"
                  min={field === 'w' || field === 'h' ? 2 : 0}
                  max={field === 'w' || field === 'h' ? 80 : 100}
                  step="0.1"
                  value={visibleLayout[selectedDebugKey][field] ?? (field === 'h' ? visibleLayout[selectedDebugKey].w : 0)}
                  onChange={(e) => updateLayoutField(selectedDebugKey, field, e.target.value)}
                />
                <input
                  type="number"
                  min={field === 'w' || field === 'h' ? 2 : 0}
                  max={field === 'w' || field === 'h' ? 80 : 100}
                  step="0.1"
                  value={visibleLayout[selectedDebugKey][field] ?? ''}
                  onChange={(e) => updateLayoutField(selectedDebugKey, field, e.target.value)}
                />
              </label>
            ))}

            <div className="maha-debug-grid">
              <button type="button" onClick={() => nudgePosition('t', -0.5)}>up</button>
              <button type="button" onClick={() => nudgePosition('l', -0.5)}>left</button>
              <button type="button" onClick={() => nudgePosition('l', 0.5)}>right</button>
              <button type="button" onClick={() => nudgePosition('t', 0.5)}>down</button>
            </div>

            <div className="maha-debug-actions">
              <button type="button" onClick={() => nudgeSize(-0.5)}>- width</button>
              <button type="button" onClick={() => nudgeSize(0.5)}>+ width</button>
            </div>
            <div className="maha-debug-actions">
              <button type="button" onClick={() => nudgeHeight(-0.5)}>- height</button>
              <button type="button" onClick={() => nudgeHeight(0.5)}>+ height</button>
            </div>
            <div className="maha-debug-grid">
              <button type="button" onClick={resetCurrentPhaseLayout}>reset phase</button>
              <button type="button" onClick={resetAllPhaseLayouts}>reset all</button>
            </div>

            <pre className="maha-debug-readout">{JSON.stringify(visibleLayout[selectedDebugKey], null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
