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
const TOTAL_LOGS = 4;
const TOTAL_SYLLABLES = 4;
const ATTACH_DIST = 10;
const DEBUG_PHASE_OPTIONS = [
  { value: 0, label: 'Start' },
  { value: 1, label: 'After Log 1' },
  { value: 2, label: 'After Log 2' },
  { value: 3, label: 'After Log 3' },
  { value: 4, label: 'After Log 4' },
];
const JOIN_SEQUENCE = [0, 2, 1, 3];
const LAYOUT_PRESET_VERSION = '2026-08-27-mahakaya-pasted-layout-15';
// Final raft position after crossing. Derived from the last log (logTarget2)
// landing at ~{ l: 76, t: 52 } in the "After Log 3" layout:
//   logTarget2 phase-3 layout {39.6, 46.6} + CROSS_DELTA {36.4, 5.5}
//   → raft target {24.8 + 36.4, 39.3 + 5.5}
const CROSS_TARGET_RAFT = { l: 63.79, t: 41.67 };

const PHASE0_LAYOUT = {
  pulley: { l: 39.7, t: 11.15, w: 3 },
  handleStart: { l: 45.3, t: 35.8, w: 6.6 },
  pullTop: { l: 39.67, t: 31, w: 6.6 },
  pullBottom: { l: 56.2, t: 78, w: 6.6 },
  raft: { l: 21.81, t: 46.38, w: 31.8, r: -18 },
  logTarget0: { l: 31.2, t: 40.6, w: 31.8 },
  logTarget1: { l: 39.6, t: 41.2, w: 31.8 },
  logTarget2: { l: 48, t: 41.8, w: 31.8 },
  logTarget3: { l: 55.5, t: 43.2, w: 31.8 },
  waitingLog0: { l: 77.2, t: 23.8, w: 31.8 },
  waitingLog1: { l: 81.7, t: 21.4, w: 31.8 },
  waitingLog2: { l: 85.5, t: 24.9, w: 31.8 },
  waitingLog3: { l: 81, t: 28.6, w: 31.8 },
  animal0: { l: 21.6, t: 31.8, w: 19.4 },
  animal1: { l: 39.6, t: 33.7, w: 16.9 },
  animal2: { l: 31.3, t: 32.2, w: 17.6 },
  animal3: { l: 47.2, t: 32.5, w: 15.8 },
  waitingAnimal0: { l: 19.6, t: 66, w: 19.4 },
  waitingAnimal1: { l: 55.9, t: 81.1, w: 16.7 },
  waitingAnimal2: { l: 38.96, t: 84.86, w: 18.2 },
  waitingAnimal3: { l: 36.6, t: 72.9, w: 11.1 },
};

const CROSS_DELTA = {
  l: CROSS_TARGET_RAFT.l - PHASE0_LAYOUT.raft.l,
  t: CROSS_TARGET_RAFT.t - PHASE0_LAYOUT.raft.t,
};

const DEFAULT_PHASE_LAYOUTS = [
  PHASE0_LAYOUT,
  {
    ...PHASE0_LAYOUT,
    logTarget0: { l: 19.83, t: 43.61, w: 31.8, r: -40 },
    animal0: { l: 22.15, t: 33.68, w: 15.8 },
  },
  {
    ...PHASE0_LAYOUT,
    logTarget0: { l: 31.4, t: 40.4, w: 31.8 },
    logTarget1: { l: 23.94, t: 45.44, w: 31.8, r: -41 },
    animal0: { l: 22.15, t: 33.68, w: 15.8 },
    animal2: { l: 21.16, t: 43.12, w: 16.9 },
  },
  {
    ...PHASE0_LAYOUT,
    logTarget0: { l: 31.4, t: 40.4, w: 31.8 },
    logTarget1: { l: 33.9, t: 43.5, w: 31.8 },
    logTarget2: { l: 28.54, t: 47.43, w: 31.8, r: -41 },
    animal0: { l: 22.15, t: 33.68, w: 15.8 },
    animal1: { l: 34.4, t: 38, w: 15.5 },
    animal2: { l: 21.16, t: 43.12, w: 16.9 },
  },
  {
    ...PHASE0_LAYOUT,
    logTarget0: { l: 31.4, t: 40.4, w: 31.8 },
    logTarget1: { l: 33.9, t: 43.5, w: 31.8 },
    logTarget2: { l: 39.6, t: 46.6, w: 31.8 },
    logTarget3: { l: 33.25, t: 49.64, w: 31.8, r: -41 },
    animal0: { l: 22.15, t: 33.68, w: 15.8 },
    animal1: { l: 34.4, t: 38, w: 15.5 },
    animal2: { l: 21.16, t: 43.12, w: 16.9 },
    animal3: { l: 29.24, t: 46.61, w: 12.7 },
  },
];

const START_DEBUG_KEYS = [
  'pulley',
  'handleStart',
  'pullTop',
  'pullBottom',
  'raft',
  'waitingLog0',
  'waitingLog1',
  'waitingLog2',
  'waitingLog3',
  'waitingAnimal0',
  'waitingAnimal1',
  'waitingAnimal2',
  'waitingAnimal3',
];
const CROSS_TARGET_DEBUG_KEY = 'crossTargetRaft';

const getDebugKeysForPhase = (phaseIndex) => {
  if (phaseIndex === 0) return START_DEBUG_KEYS;
  if (phaseIndex === TOTAL_LOGS) return [`logTarget${phaseIndex - 1}`, `animal${JOIN_SEQUENCE[phaseIndex - 1]}`, CROSS_TARGET_DEBUG_KEY];
  const newAnimalIndex = JOIN_SEQUENCE[phaseIndex - 1];
  return [`logTarget${phaseIndex - 1}`, `animal${newAnimalIndex}`];
};

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
  const [layoutCopyStatus, setLayoutCopyStatus] = useState('');
  const [crossTargetRaft, setCrossTargetRaft] = useState(CROSS_TARGET_RAFT);

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
    setCrossTargetRaft(CROSS_TARGET_RAFT);
    setKnobPos({ l: DEFAULT_PHASE_LAYOUTS[0].handleStart.l, t: DEFAULT_PHASE_LAYOUTS[0].handleStart.t });
    if (completedLogsRef.current === 0) {
      setDebugPhase(0);
    }
  }, [layoutPresetVersion]);

  useEffect(() => {
    const availableKeys = getDebugKeysForPhase(debugPhase);
    if (!availableKeys.includes(selectedDebugKey)) {
      setSelectedDebugKey(availableKeys[0]);
    }
  }, [debugPhase, selectedDebugKey]);

  if (!isActive) return null;

  const visiblePhase = debugMode ? debugPhase : completedLogs;
  const baseLayout = phaseLayouts[0];
  const visibleLayout = phaseLayouts[visiblePhase];
  const activeLayout = phaseLayouts[completedLogs];
  const nextLayout = phaseLayouts[Math.min(completedLogs + 1, TOTAL_LOGS)];
  const availableDebugKeys = getDebugKeysForPhase(debugPhase);
  const getDebugObject = (key) => {
    if (key === CROSS_TARGET_DEBUG_KEY) {
      return { ...crossTargetRaft, w: baseLayout.raft.w, r: baseLayout.raft.r };
    }
    return visibleLayout[key];
  };

  const getLogLayoutForPhase = (logIndex) => phaseLayouts[Math.min(logIndex + 1, phaseLayouts.length - 1)];
  const getJoinedAnimalPhase = (animalIndex) => {
    const joinOrderIndex = JOIN_SEQUENCE.indexOf(animalIndex);
    return joinOrderIndex === -1 ? 1 : joinOrderIndex + 1;
  };

  const updateLayout = (key, patch) => {
    if (key === CROSS_TARGET_DEBUG_KEY) {
      setCrossTargetRaft((current) => ({ ...current, ...patch }));
      return;
    }
    setPhaseLayouts((current) => current.map((phaseLayout, phaseIndex) => {
      if (phaseIndex !== debugPhase) return phaseLayout;
      return {
        ...phaseLayout,
        [key]: { ...phaseLayout[key], ...patch },
      };
    }));
  };

  const resetCurrentPhaseLayout = () => {
    if (selectedDebugKey === CROSS_TARGET_DEBUG_KEY) {
      setCrossTargetRaft(CROSS_TARGET_RAFT);
      return;
    }
    setPhaseLayouts((current) => current.map((phaseLayout, phaseIndex) => (
      phaseIndex === debugPhase ? DEFAULT_PHASE_LAYOUTS[debugPhase] : phaseLayout
    )));
  };

  const resetAllPhaseLayouts = () => {
    setPhaseLayouts(DEFAULT_PHASE_LAYOUTS);
    setCrossTargetRaft(CROSS_TARGET_RAFT);
    setDebugPhase(0);
    setSelectedDebugKey(START_DEBUG_KEYS[0]);
    setKnobPos({ l: DEFAULT_PHASE_LAYOUTS[0].handleStart.l, t: DEFAULT_PHASE_LAYOUTS[0].handleStart.t });
  };

  const nudgeSize = (delta) => {
    updateLayout(selectedDebugKey, {
      w: Math.max(2, Number(((getDebugObject(selectedDebugKey).w || 4) + delta).toFixed(1))),
    });
  };

  const nudgeHeight = (delta) => {
    updateLayout(selectedDebugKey, {
      h: Math.max(2, Number((((getDebugObject(selectedDebugKey).h || getDebugObject(selectedDebugKey).w || 4) + delta)).toFixed(1))),
    });
  };

  const nudgePosition = (axis, delta) => {
    updateLayout(selectedDebugKey, {
      [axis]: Number(((getDebugObject(selectedDebugKey)[axis] || 0) + delta).toFixed(1)),
    });
  };

  const updateLayoutField = (key, field, value) => {
    const nextValue = Number(value);
    if (Number.isNaN(nextValue)) return;
    updateLayout(key, {
      [field]: nextValue,
    });
  };

  // Dump the tuned layout so it can be pasted straight into the source
  // (DEFAULT_PHASE_LAYOUTS / CROSS_TARGET_RAFT) — no need to screenshot positions.
  const copyLayoutJson = async () => {
    const payload = JSON.stringify(
      { CROSS_TARGET_RAFT: crossTargetRaft, phaseLayouts },
      (k, v) => (typeof v === 'number' ? Number(v.toFixed(2)) : v),
      2,
    );
    const canPrompt = typeof window !== 'undefined' && typeof window.prompt === 'function';
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
        setLayoutCopyStatus('Copied');
      } else if (canPrompt) {
        window.prompt('Copy layout JSON', payload);
        setLayoutCopyStatus('Shown');
      }
    } catch {
      if (canPrompt) {
        window.prompt('Copy layout JSON', payload);
        setLayoutCopyStatus('Shown');
      } else {
        console.log('Mahakaya layout JSON:', payload);
        setLayoutCopyStatus('Logged');
      }
    }
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
    if (selectedDebugKey !== key) {
      setSelectedDebugKey(key);
      return true;
    }
    const point = pointFromEvent(e);
    if (!point) return true;
    const debugObject = getDebugObject(key);
    debugDragRef.current = {
      key,
      offsetL: point.l - debugObject.l,
      offsetT: point.t - debugObject.t,
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
    // .maha-layer centers with translate(-50%,-50%); keep that when rotating
    ...(pos.r ? { transform: `translate(-50%, -50%) rotate(${pos.r}deg)` } : {}),
    ...extra,
  });

  const sharedRigLayout = {
    pulley: baseLayout.pulley,
    handleStart: baseLayout.handleStart,
    pullTop: baseLayout.pullTop,
    pullBottom: baseLayout.pullBottom,
  };

  const waitingLogKey = `waitingLog${activeLog}`;
  const targetLogKey = `logTarget${activeLog}`;
  const currentWaitingLog = activeLayout[waitingLogKey];
  const currentTargetLog = nextLayout[targetLogKey];
  const currentMovingLog = mixPos(currentWaitingLog, currentTargetLog, pullProgress);
  const pullHandleTop = lerp(sharedRigLayout.pullTop.t, sharedRigLayout.pullBottom.t, pullProgress);
  const activePullHandle = { ...sharedRigLayout.pullTop, t: pullHandleTop };
  const allDone = litCount >= TOTAL_SYLLABLES;
  const raftImage = raftLogSingle;
  const crossTargetDebugLayout = { ...crossTargetRaft, w: baseLayout.raft.w, r: baseLayout.raft.r };
  const crossTargetPreviewDelta = {
    l: crossTargetRaft.l - baseLayout.raft.l,
    t: crossTargetRaft.t - baseLayout.raft.t,
  };

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
    setKnobPos({ l: sharedRigLayout.handleStart.l, t: sharedRigLayout.handleStart.t });
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
        // "How" (pull the handle down) is taught by the pull-handle glow +
        // GestureDemo — no spoken gesture line here.
      } else {
        setKnobPos({ l: sharedRigLayout.handleStart.l, t: sharedRigLayout.handleStart.t });
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

  const renderAnimal = (animalIndex) => {
    const animal = ANIMALS[animalIndex];
    const joinedKey = `animal${animalIndex}`;
    const waitingKey = `waitingAnimal${animalIndex}`;
    const shouldBeJoined = getJoinedAnimalPhase(animalIndex) <= visiblePhase;
    const sourceLayout = shouldBeJoined ? visibleLayout : baseLayout;
    const pos = shouldBeJoined ? withCross(sourceLayout[joinedKey]) : sourceLayout[waitingKey];
    return (
      <div
        key={`${animal.id}-${shouldBeJoined ? 'raft' : 'wait'}`}
        className={`maha-layer maha-animal ${shouldBeJoined ? 'is-joined' : 'is-waiting'} ${FLIPPED_ANIMAL_IDS.has(animal.id) ? 'is-flipped' : ''} ${crossing ? 'is-crossing' : ''} ${debugMode && selectedDebugKey === (shouldBeJoined ? joinedKey : waitingKey) ? 'is-debug-selected' : ''}`}
        style={placeStyle(pos, { zIndex: shouldBeJoined ? 22 : 9 })}
        onPointerDown={(e) => startDebugDrag(e, shouldBeJoined ? joinedKey : waitingKey)}
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

      {/* Hidden base anchor for tuning/crossing math. No starter log is shown. */}
      <div
        className={`maha-layer maha-raft-art ${allDone ? 'is-complete' : ''} ${crossing ? 'is-crossing' : ''} ${debugMode && selectedDebugKey === 'raft' ? 'is-debug-selected' : ''}`}
        style={placeStyle(withCross(baseLayout.raft), { zIndex: 10, opacity: debugMode ? 0.2 : 0, pointerEvents: debugMode ? 'auto' : 'none' })}
        onPointerDown={(e) => startDebugDrag(e, 'raft')}
      >
        <img src={raftImage} alt="" />
      </div>

      {debugMode && (
        <>
          {[0, 1, 2, 3].map((index) => {
            const finalLogLayout = phaseLayouts[TOTAL_LOGS][`logTarget${index}`];
            if (!finalLogLayout) return null;
            return (
              <div
                key={`crossTargetPreviewLog${index}`}
                className={`maha-layer maha-log-piece maha-raft-log maha-cross-target-preview ${selectedDebugKey === CROSS_TARGET_DEBUG_KEY ? 'is-debug-selected' : ''}`}
                style={placeStyle(
                  {
                    ...finalLogLayout,
                    l: finalLogLayout.l + crossTargetPreviewDelta.l,
                    t: finalLogLayout.t + crossTargetPreviewDelta.t,
                  },
                  { zIndex: 11 + index },
                )}
                onPointerDown={(e) => startDebugDrag(e, CROSS_TARGET_DEBUG_KEY)}
              >
                <img src={raftLogSingle} alt="" />
              </div>
            );
          })}
          <div
            className={`maha-layer maha-raft-art maha-cross-target-hitbox ${selectedDebugKey === CROSS_TARGET_DEBUG_KEY ? 'is-debug-selected' : ''}`}
            style={placeStyle(crossTargetDebugLayout, { zIndex: 16, opacity: 0.001 })}
            onPointerDown={(e) => startDebugDrag(e, CROSS_TARGET_DEBUG_KEY)}
          >
            <img src={raftImage} alt="" />
          </div>
        </>
      )}

      {[0, 1, 2, 3].map((index) => {
        if (index < visiblePhase) {
          const logLayout = getLogLayoutForPhase(index);
          return renderLog(`logTarget${index}`, 'maha-raft-log is-attached', withCross(logLayout[`logTarget${index}`]), 18 + index);
        }
        if (index === activeLog && ropeStage === 'attached') {
          return renderLog(`movingLog${index}`, 'is-moving', currentMovingLog, 20);
        }
        if (index >= completedLogs) {
          return renderLog(`waitingLog${index}`, index === activeLog ? 'is-current' : '', baseLayout[`waitingLog${index}`], 8);
        }
        return null;
      })}

      {ANIMALS.map((_, index) => renderAnimal(index))}

      <div
        className={`maha-layer maha-pulley ${debugMode && selectedDebugKey === 'pulley' ? 'is-debug-selected' : ''}`}
        style={placeStyle(sharedRigLayout.pulley, { zIndex: 16 })}
        onPointerDown={(e) => startDebugDrag(e, 'pulley')}
        aria-hidden="true"
      />

      {ropeStage === 'detached' && phase === 'play' && (
        <>
          <RopeLine x1={sharedRigLayout.pulley.l} y1={sharedRigLayout.pulley.t} x2={knobPos.l} y2={knobPos.t} />
          <div
            className={`maha-layer maha-knob ${dragging === 'knob' ? 'grabbing' : ''} ${hintLevel >= 1 ? 'maha-hint-pulse' : ''} ${hintLevel >= 2 ? 'maha-hint-glow' : ''} ${debugMode && selectedDebugKey === 'handleStart' ? 'is-debug-selected' : ''}`}
            style={placeStyle({ ...sharedRigLayout.handleStart, l: knobPos.l, t: knobPos.t }, { zIndex: 24 })}
            onPointerDown={(e) => (debugMode ? startDebugDrag(e, 'handleStart') : onKnobDown(e))}
          >
            <RopeGripSvg />
          </div>
        </>
      )}

      {ropeStage === 'attached' && phase === 'play' && (
        <>
          <RopeLine x1={sharedRigLayout.pulley.l} y1={sharedRigLayout.pulley.t} x2={currentMovingLog.l} y2={currentMovingLog.t} />
          <RopeLine x1={sharedRigLayout.pulley.l} y1={sharedRigLayout.pulley.t} x2={sharedRigLayout.pullTop.l} y2={activePullHandle.t} />
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
        from={{ x: sharedRigLayout.handleStart.l, y: sharedRigLayout.handleStart.t }}
        to={{ x: currentWaitingLog.l, y: currentWaitingLog.t }}
        active={!debugMode && ropeStage === 'detached' && phase === 'play'}
        idleDelay={3000}
      />
      <GestureDemo
        type="pull-down"
        from={{ x: sharedRigLayout.pullTop.l, y: sharedRigLayout.pullTop.t }}
        to={{ x: sharedRigLayout.pullBottom.l, y: sharedRigLayout.pullBottom.t }}
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

            <div className="maha-debug-actions" style={{ alignItems: 'center' }}>
              <button type="button" onClick={copyLayoutJson}>Copy Layout JSON</button>
              {layoutCopyStatus && <span style={{ fontSize: 12, opacity: 0.8 }}>{layoutCopyStatus}</span>}
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
                {availableDebugKeys.map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
              <span />
            </label>

            {['l', 't', 'w', 'h', 'r'].map((field) => {
              const isSize = field === 'w' || field === 'h';
              const isRot = field === 'r';
              const min = isRot ? -180 : isSize ? 2 : 0;
              const max = isRot ? 180 : isSize ? 80 : 100;
              const label = field === 'l' ? 'left' : field === 't' ? 'top' : field === 'w' ? 'width' : field === 'h' ? 'height' : 'rotate';
              return (
                <label key={field} className="maha-debug-row">
                  <span>{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={isRot ? 1 : 0.1}
                    value={getDebugObject(selectedDebugKey)[field] ?? (field === 'h' ? getDebugObject(selectedDebugKey).w : 0)}
                    onChange={(e) => updateLayoutField(selectedDebugKey, field, e.target.value)}
                  />
                  <input
                    type="number"
                    min={min}
                    max={max}
                    step={isRot ? 1 : 0.1}
                    value={getDebugObject(selectedDebugKey)[field] ?? ''}
                    onChange={(e) => updateLayoutField(selectedDebugKey, field, e.target.value)}
                  />
                </label>
              );
            })}

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

            <pre className="maha-debug-readout">{JSON.stringify(getDebugObject(selectedDebugKey), null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
