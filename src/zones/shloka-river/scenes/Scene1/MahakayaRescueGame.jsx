import { usePreloadPoses } from '../../../../lib/components/animation/PoseImage';
// src/zones/shloka-river/scenes/Scene1/MahakayaRescueGame.jsx
//
// MAHAKAYA - drag each log to its spot on the raft, make room for everyone.
// Each completed drop adds one log, welcomes one animal, and locks one syllable.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import usePausableTimers from '../../../../lib/hooks/usePausableTimers';
import { getLineCue } from '../../../../lib/config/content/voiceCues';
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
const DROP_RX = 9.5;
const DROP_RY = 7;
const SHOW_HIT_ZONES = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('hitzones');
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
const CROSS_TARGET_RAFT = { l: 69.13, t: 46.9 };

const PHASE0_LAYOUT = {
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
  waitingAnimal3: { l: 29.48, t: 73.61, w: 11.1 },
};

const CROSS_DELTA = {
  l: CROSS_TARGET_RAFT.l - PHASE0_LAYOUT.raft.l,
  t: CROSS_TARGET_RAFT.t - PHASE0_LAYOUT.raft.t,
};

const DEFAULT_PHASE_LAYOUTS = [
  PHASE0_LAYOUT,
  {
    ...PHASE0_LAYOUT,
    waitingAnimal3: { l: 36.6, t: 72.9, w: 11.1 },
    logTarget0: { l: 19.83, t: 43.61, w: 31.8, r: -40 },
    animal0: { l: 22.15, t: 33.68, w: 15.8 },
  },
  {
    ...PHASE0_LAYOUT,
    waitingAnimal3: { l: 36.6, t: 72.9, w: 11.1 },
    logTarget0: { l: 31.4, t: 40.4, w: 31.8 },
    logTarget1: { l: 23.94, t: 45.44, w: 31.8, r: -41 },
    animal0: { l: 22.15, t: 33.68, w: 15.8 },
    animal2: { l: 19.38, t: 42.84, w: 16.9 },
  },
  {
    ...PHASE0_LAYOUT,
    waitingAnimal3: { l: 36.6, t: 72.9, w: 11.1 },
    logTarget0: { l: 31.4, t: 40.4, w: 31.8 },
    logTarget1: { l: 33.9, t: 43.5, w: 31.8 },
    logTarget2: { l: 28.54, t: 47.43, w: 31.8, r: -41 },
    animal0: { l: 22.15, t: 33.68, w: 15.8 },
    animal1: { l: 26.69, t: 33.18, w: 15.5 },
    animal2: { l: 19.38, t: 42.84, w: 16.9 },
  },
  {
    ...PHASE0_LAYOUT,
    waitingAnimal3: { l: 36.6, t: 72.9, w: 11.1 },
    logTarget0: { l: 31.4, t: 40.4, w: 31.8 },
    logTarget1: { l: 33.9, t: 43.5, w: 31.8 },
    logTarget2: { l: 39.6, t: 46.6, w: 31.8 },
    logTarget3: { l: 33.25, t: 49.64, w: 31.8, r: -41 },
    animal0: { l: 22.15, t: 33.68, w: 15.8 },
    animal1: { l: 26.69, t: 33.18, w: 15.5 },
    animal2: { l: 19.38, t: 42.84, w: 16.9 },
    animal3: { l: 28.65, t: 48.26, w: 12.7 },
  },
];

// Phone landscape only (same query the rest of the app uses): bridge logs ~15%
// smaller and nudged up/left, animals trimmed unevenly (elephant/cow most), so the
// scene is less crowded. Hit areas (DROP_RX/RY) are untouched. iPad/desktop keep
// the base layouts above.
const PHONE_MQ = '(orientation: landscape) and (max-height: 500px) and (max-width: 1023px)';
const isPhone = () => typeof window !== 'undefined' && !!window.matchMedia?.(PHONE_MQ).matches;
const PHONE_BRIDGE_SCALE = 0.85;
const PHONE_WAITING_LOG_SCALE = 0.9;   // extra log trim; applied to waiting AND placed logs so they match
const PHONE_BRIDGE_SHIFT = { l: -1.5, t: -1.5 };
const PHONE_ANIMAL_SCALE = [0.88, 0.97, 0.9, 0.95];   // elephant, peacock, cow, monkey (ANIMALS order)
const r2 = (n) => Math.round(n * 100) / 100;

const adaptLayoutForPhone = (layout) => {
  const out = {};
  Object.entries(layout).forEach(([key, v]) => {
    const animal = key.match(/^(animal|waitingAnimal)(\d)$/);
    if (key === 'raft' || key.startsWith('logTarget')) {
      out[key] = { ...v, l: r2(v.l + PHONE_BRIDGE_SHIFT.l), t: r2(v.t + PHONE_BRIDGE_SHIFT.t), w: r2(v.w * PHONE_BRIDGE_SCALE * PHONE_WAITING_LOG_SCALE) };
    } else if (key.startsWith('waitingLog')) {
      out[key] = { ...v, w: r2(v.w * PHONE_BRIDGE_SCALE * PHONE_WAITING_LOG_SCALE) };
    } else if (animal) {
      const sc = PHONE_ANIMAL_SCALE[Number(animal[2])];
      out[key] = animal[1] === 'animal'
        // riding the bridge: follow its shift and drop by half the shrink so feet stay on the logs
        ? { ...v, l: r2(v.l + PHONE_BRIDGE_SHIFT.l), t: r2(v.t + PHONE_BRIDGE_SHIFT.t + v.w * (1 - sc) * 0.5), w: r2(v.w * sc) }
        : { ...v, w: r2(v.w * sc) };
    } else {
      out[key] = v;
    }
  });
  return out;
};
const PHONE_PHASE_LAYOUTS = DEFAULT_PHASE_LAYOUTS.map(adaptLayoutForPhone);
const PHONE_CROSS_TARGET_RAFT = {
  l: r2(CROSS_TARGET_RAFT.l + PHONE_BRIDGE_SHIFT.l),
  t: r2(CROSS_TARGET_RAFT.t + PHONE_BRIDGE_SHIFT.t),
};
const getDefaultLayouts = () => (isPhone() ? PHONE_PHASE_LAYOUTS : DEFAULT_PHASE_LAYOUTS);
const getDefaultCrossTarget = () => (isPhone() ? PHONE_CROSS_TARGET_RAFT : CROSS_TARGET_RAFT);

const START_DEBUG_KEYS = [
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

const POSE_ASSETS = [
  raftLogSingle,
  elephantCalf,
  peacockSymbolMountain,
  cowSymbolMountain,
  monkeySymbolMountain,
];

export default function MahakayaRescueGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  // Resume: logs already on the raft (0-3), read when the game activates.
  initialLogs = 0,
  // Fired with the completed-log count after each log except the last (checkpoint).
  onBeatComplete = () => {},
  voiceGuidance = {},
  isPaused = false,
  // Sidebar actually open (isPaused also covers the short replay hold after it closes): drives the
  // hand demo, the animation freeze and the hint pin, so the hand can play WITH the replayed line.
  isSidebarOpen,
}) {
  const handPaused = isSidebarOpen ?? isPaused;
  usePreloadPoses(POSE_ASSETS);
  const { playVoice: playSceneLine, playSfx, playSyllable, playWord, stopVoice } = voiceGuidance;

  const [phase, setPhase] = useState('intro');
  const [activeLog, setActiveLog] = useState(0);
  const [completedLogs, setCompletedLogs] = useState(0);
  const [litCount, setLitCount] = useState(0);
  const [logPos, setLogPos] = useState(null);
  const [wrongDropPulse, setWrongDropPulse] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [phaseLayouts, setPhaseLayouts] = useState(getDefaultLayouts);
  const [debugMode, setDebugMode] = useState(false);
  const [selectedDebugKey, setSelectedDebugKey] = useState('waitingLog0');
  const [debugPhase, setDebugPhase] = useState(0);
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 12, y: 96 });
  const [crossing, setCrossing] = useState(false);
  const [layoutPresetVersion, setLayoutPresetVersion] = useState(LAYOUT_PRESET_VERSION);
  const [layoutCopyStatus, setLayoutCopyStatus] = useState('');
  const [crossTargetRaft, setCrossTargetRaft] = useState(getDefaultCrossTarget);
  const [teachingCompleteKey, setTeachingCompleteKey] = useState(null);
  const [introVoStarted, setIntroVoStarted] = useState(false);

  const stageRef = useRef(null);
  const timers = useRef([]);
  const isPausedRef = useRef(isPaused);
  // Freezes with the sidebar and resumes with the remaining time (see hook).
  const { after, clear: clearPausable } = usePausableTimers(isPaused);
  const phaseRef = useRef('intro');
  const draggingRef = useRef(null);
  const logPosRef = useRef(null);
  const completedLogsRef = useRef(0);
  const initialLogsRef = useRef(0);
  initialLogsRef.current = Math.max(0, Math.min(TOTAL_LOGS - 1, Number(initialLogs) || 0));
  const completionStartedRef = useRef(false);
  const debugDragRef = useRef(null);
  const debugPanelDragRef = useRef(null);

  const hintStageKey = `drag-${activeLog}`;
  // Only log 1 gets the immediate teaching gesture (one short drag demo, no
  // VO) — rounds 2-4 reuse the mechanic the child already learned. The hint
  // ladder itself restarts fresh for every log because it's keyed on
  // hintStageKey (useRepeatedHintCycle re-schedules whenever stageKey changes).
  const needsInitialTeaching = activeLog === 0;
  const teachingComplete = !needsInitialTeaching || teachingCompleteKey === hintStageKey;
  // GMB Hint Standard v1 — 10s/18s/26s from mount or last interaction, flat
  // across every log. Suppressed while the child is actively dragging, so
  // hints don't fire over their hand mid-gesture.
  // Log 1 is the learning round: full 10/18/26 ladder (nudge, partial hand + line, full hand).
  // Logs 2-4: the child has shown they can drag, so no hand and no L3 - a ~12s nudge + "Drag the
  // next log.", then at ~25s the exact spot glows quietly and stays (level3Delay is out of reach).
  const isLearningLog = activeLog === 0;
  const { hintLevel, markAttempt, markLevel2VoiceStarted, markLevel2VoiceEnded } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play' && !debugMode && !dragging,
    stageKey: hintStageKey,
    initialDelay: isLearningLog ? 10000 : 12000,
    pulseCountBeforeEscalation: isLearningLog ? 3 : 2,
    pulseInterval: 1800,
    level2Delay: isLearningLog ? 18000 : 25000,
    level3Delay: isLearningLog ? 26000 : 3600000,
    paused: handPaused,
  });
  // Set once the child has really dragged the log (pointer moved, not just a tap). From then on
  // the hand never appears again in this scene, even after the sidebar closes.
  const [childHasDragged, setChildHasDragged] = useState(false);
  const grabPointRef = useRef(null);

  // Repeated wrong drops bring the L2-style destination clarity in earlier —
  // the first one or two misses stay visual-only (bounce + soft pulse), but
  // from the 2nd consecutive miss the dropzone/gesture jump straight to their
  // "clear" look regardless of the timer. Never affects the spoken hint lines
  // (still tied to the real 18s/26s marks) or plays any punitive sound.
  const [wrongDropCount, setWrongDropCount] = useState(0);
  const effectiveHintLevel = wrongDropCount >= 2 ? Math.max(hintLevel, 2) : hintLevel;

  // L1: visual only (log nudge + dropzone breathes) — no VO.
  // L2: clearer partial gesture + "Drag the log into the water."
  // L3: full gesture + "Put the log here."
  const lastHintVoRef = useRef(null);
  // Hint level showing when the child grabbed the log: a release that misses replays the L2 line.
  const grabbedAtLevelRef = useRef(0);
  useEffect(() => {
    if (phase !== 'play' || debugMode || isPaused) return;
    if (!isLearningLog) {
      // Logs 2-4: one spoken nudge at the first pulse; the later glow is visual only.
      if (hintLevel !== 1 || lastHintVoRef.current === hintStageKey) return;
      lastHintVoRef.current = hintStageKey;
      playSceneLine?.('scene10_maha_next_log');
      return;
    }
    if (hintLevel < 2) return;
    const voKey = `${hintStageKey}:${hintLevel}`;
    if (lastHintVoRef.current === voKey) return;
    lastHintVoRef.current = voKey;
    if (hintLevel === 2) {
      if (playSceneLine) markLevel2VoiceStarted();
      playSceneLine?.('scene10_maha_drag_water', markLevel2VoiceEnded);
    } else {
      playSceneLine?.('scene10_maha_place_here');
    }
  }, [hintLevel, hintStageKey, isLearningLog, phase, debugMode, isPaused, playSceneLine, markLevel2VoiceStarted, markLevel2VoiceEnded]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    clearPausable();
  }, [clearPausable]);

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
    const seedLogs = initialLogsRef.current;
    setActiveLog(seedLogs);
    setCompletedLogs(seedLogs);
    completedLogsRef.current = seedLogs;
    setLitCount(seedLogs);
    setLogPos(null);
    logPosRef.current = null;
    setWrongDropPulse(false);
    setWrongDropCount(0);
    setDragging(null);
    draggingRef.current = null;
    completionStartedRef.current = false;
    setDebugPhase(0);
    setCrossing(false);
    setTeachingCompleteKey(null);
    setIntroVoStarted(false);
    setChildHasDragged(false);
    grabPointRef.current = null;
    lastHintVoRef.current = null;
  }, [clearTimers]);

  // Back from the sidebar with log 1 still unfinished: the teaching hand plays again with
  // the replayed intro line (it would otherwise be gone once its first showing ended).
  // The replayed intro's cue (below) re-times it: reset the started flag so the hand waits for "Drag".
  const wasPausedForTeachRef = useRef(false);
  useEffect(() => {
    if (wasPausedForTeachRef.current && !handPaused && completedLogsRef.current === 0 && !childHasDragged) {
      setTeachingCompleteKey(null);
      setIntroVoStarted(false);
    }
    wasPausedForTeachRef.current = handPaused;
  }, [handPaused, childHasDragged]);

  useEffect(() => {
    isPausedRef.current = isPaused;
    if (isPaused) {
      draggingRef.current = null;
      logPosRef.current = null;
      setDragging(null);
      debugDragRef.current = null;
    }
  }, [isPaused]);

  useEffect(() => {
    if (!isActive) return undefined;
    resetState();
    // The log is draggable immediately — kids don't wait for the intro VO or
    // gesture demo to finish before touching things. The line still plays,
    // just as narration alongside play instead of a gate in front of it.
    setPhase('play');
    phaseRef.current = 'play';
    // The log-1 teaching demo waits for this VO to actually start speaking
    // (browser TTS has variable startup lag after cancel()+speak(), so a
    // blind fixed delay from mount can fire the demo before/under the VO).
    // Fallback timer covers muted audio or no speechSynthesis support, where
    // onStart never fires.
    // The hand is cued to the action word ("Drag") of the line, not to a guessed delay.
    playSceneLine?.('scene10_maha_intro', undefined, { cue: getLineCue('scene10_maha_intro', () => setIntroVoStarted(true)) });
    // Safety net only (e.g. no speech engine at all).
    after(6000, () => setIntroVoStarted(true));
    return clearTimers;
    // Voice and timer helpers are stable enough for this scene lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  useEffect(() => {
    if (layoutPresetVersion === LAYOUT_PRESET_VERSION) return;
    setPhaseLayouts(getDefaultLayouts());
    setLayoutPresetVersion(LAYOUT_PRESET_VERSION);
    setCrossTargetRaft(getDefaultCrossTarget());
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
      setCrossTargetRaft(getDefaultCrossTarget());
      return;
    }
    setPhaseLayouts((current) => current.map((phaseLayout, phaseIndex) => (
      phaseIndex === debugPhase ? getDefaultLayouts()[debugPhase] : phaseLayout
    )));
  };

  const resetAllPhaseLayouts = () => {
    setPhaseLayouts(getDefaultLayouts());
    setCrossTargetRaft(getDefaultCrossTarget());
    setDebugPhase(0);
    setSelectedDebugKey(START_DEBUG_KEYS[0]);
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
        if (import.meta.env.DEV) console.log('Mahakaya layout JSON:', payload);
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

  const waitingLogKey = `waitingLog${activeLog}`;
  const targetLogKey = `logTarget${activeLog}`;
  const currentWaitingLog = activeLayout[waitingLogKey];
  const currentTargetLog = nextLayout[targetLogKey];
  const allDone = litCount >= TOTAL_SYLLABLES;
  const raftImage = raftLogSingle;
  const crossTargetDebugLayout = { ...crossTargetRaft, w: baseLayout.raft.w, r: baseLayout.raft.r };
  const crossTargetPreviewDelta = {
    l: crossTargetRaft.l - baseLayout.raft.l,
    t: crossTargetRaft.t - baseLayout.raft.t,
  };

  const completeRound = () => {
    const nextCompleted = Math.min(TOTAL_LOGS, completedLogsRef.current + 1);
    completedLogsRef.current = nextCompleted;
    setCompletedLogs(nextCompleted);
    onMicroWin?.();
    playSfx?.('chime');
    draggingRef.current = null;
    setDragging(null);

    // Hold beat between the log visually attaching and its syllable lighting/sounding —
    // was firing in the same tick, so it read as too instant/rushed.
    const SYLLABLE_HOLD_MS = 600;

    if (nextCompleted >= TOTAL_LOGS) {
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
        // Pausable, so the sidebar can't let it complete the scene behind the panel.
        after(8000, finishGame);

        playWord?.('mahakaya', () => {
          playSceneLine?.('scene10_maha_success', finishGame, { stripLeadingText: 'Mahakaay' });
        });
      });
      return;
    }

    after(SYLLABLE_HOLD_MS, () => {
      setLitCount(nextCompleted);
    });

    // One-time continuation cue after the very first log only — later logs
    // rely on the raft visibly growing + gesture hints, not a repeated line.
    if (nextCompleted === 1) {
      after(SYLLABLE_HOLD_MS + 500, () => {
        playSceneLine?.('scene10_maha_keep_adding');
      });
    }

    onBeatComplete?.(nextCompleted);
    const nextLog = nextCompleted;
    setActiveLog(nextLog);
    setLogPos(null);
    setWrongDropCount(0);
    // Each log is its own beat — the hint ladder above already restarts on
    // its own since it's keyed on hintStageKey (which includes activeLog).
  };

  const onLogPointerDown = (e) => {
    if (debugMode || isPaused || phaseRef.current !== 'play') return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    // Cut off any playing hint VO immediately — otherwise a lingering
    // speechSynthesis utterance can jank touch responsiveness until it ends
    // (matches the stopVoice-on-grab pattern other drag scenes already use).
    stopVoice?.();
    grabbedAtLevelRef.current = hintLevel;
    // Grabbing the log is an attempt, not progress: a visible hint stays up; the idle clock only
    // restarts when no hint is showing. Finishing the stage changes hintStageKey, which resets it.
    markAttempt();
    // The child has demonstrated they understand — stop the teaching demo
    // from continuing to animate over their finger.
    if (needsInitialTeaching && !teachingComplete) setTeachingCompleteKey(hintStageKey);
    draggingRef.current = 'log';
    setDragging('log');
    const point = pointFromEvent(e) || currentWaitingLog;
    grabPointRef.current = point;
    logPosRef.current = point;
    setLogPos(point);
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

    if (draggingRef.current === 'log') {
      logPosRef.current = point;
      setLogPos(point);
      const g = grabPointRef.current;
      if (!childHasDragged && g && Math.hypot(point.l - g.l, point.t - g.t) > 3) setChildHasDragged(true);
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
    if (draggingRef.current === 'log') {
      // onPointerUp is bound on the stage, not the log itself, so
      // e.currentTarget here is the stage — release capture on e.target
      // instead (the actual captured log element) before any state change
      // that might unmount it. A pointer-captured element removed from the
      // DOM without releasing capture first can leave the pointer stuck,
      // silently breaking the next log's pointerdown.
      const captureTarget = e.target;
      if (captureTarget?.hasPointerCapture?.(e.pointerId)) {
        captureTarget.releasePointerCapture?.(e.pointerId);
      }
      const point = pointFromEvent(e) || logPosRef.current || logPos;
      const dx = point ? (point.l - currentTargetLog.l) / DROP_RX : Infinity;
      const dy = point ? (point.t - currentTargetLog.t) / DROP_RY : Infinity;
      if (dx * dx + dy * dy <= 1) {
        logPosRef.current = null;
        completeRound();
        return;
      }
      // Land/bounce briefly where it was dropped, then slide back — no red X,
      // no buzzer, no punitive VO. First 1-2 misses stay visual-only; from
      // the 2nd consecutive miss, effectiveHintLevel escalates the dropzone/
      // gesture clarity earlier (see hint-ladder block above).
      setWrongDropPulse(true);
      setWrongDropCount((c) => c + 1);
      // 2nd miss in a row: the child can drag but not where it goes - say where, once.
      // Otherwise the grab cut the learning-round L2 line off; the hint is still up, so repeat it.
      if (wrongDropCount === 1) playSceneLine?.('scene10_maha_place_here');
      else if (grabbedAtLevelRef.current === 2 && isLearningLog) playSceneLine?.('scene10_maha_drag_water');
      after(220, () => {
        setLogPos(null);
        logPosRef.current = null;
        draggingRef.current = null;
        setDragging(null);
      });
      after(360, () => setWrongDropPulse(false));
      return;
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
        // Every not-yet-placed log renders at once (the "pile" look) and they
        // tightly overlap (31.8%-wide pieces only ~4-8% apart), all at the
        // same z-index. Only one is ever interactive — the rest must let
        // clicks pass through, or a later, inert pile log silently sits on
        // top and swallows taps meant for the actual current log underneath.
        pointerEvents: options.hidden ? 'none' : (options.interactive ? 'auto' : 'none'),
      })}
      onPointerDown={(e) => {
        if (debugMode) { startDebugDrag(e, key); return; }
        if (options.interactive) onLogPointerDown(e);
      }}
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
        key={animal.id}
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
      className={`maha-game ${hideElements ? 'is-hidden' : ''} ${debugMode ? 'is-debugging' : ''} ${handPaused ? 'is-paused' : ''}`}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
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
        if (index === activeLog && dragging === 'log') {
          const movingClass = ['is-moving', 'is-dragging', wrongDropPulse ? 'is-wrong-drop' : ''].filter(Boolean).join(' ');
          return renderLog(`waitingLog${index}`, movingClass, { ...(logPos || currentWaitingLog), w: currentWaitingLog.w }, 20);
        }
        if (index >= completedLogs) {
          const isHintTarget = index === activeLog && hintLevel >= 3;
          const logClass = [
            index === activeLog ? 'is-current' : '',
            isHintTarget ? 'is-hint-target' : '',
            index === activeLog && hintLevel === 1 && dragging !== 'log' ? 'is-hint-nudge' : '',
          ].filter(Boolean).join(' ');
          return renderLog(`waitingLog${index}`, logClass, baseLayout[`waitingLog${index}`], 8, { interactive: index === activeLog });
        }
        return null;
      })}

      {ANIMALS.map((_, index) => renderAnimal(index))}

      {SHOW_HIT_ZONES && activeLog < TOTAL_LOGS && (
        <div
          style={{
            position: 'absolute',
            left: `${currentTargetLog.l - DROP_RX}%`,
            top: `${currentTargetLog.t - DROP_RY}%`,
            width: `${DROP_RX * 2}%`,
            height: `${DROP_RY * 2}%`,
            borderRadius: '50%',
            border: '2px solid rgba(255, 0, 90, 0.85)',
            background: 'rgba(255, 0, 90, 0.1)',
            pointerEvents: 'none',
            zIndex: 60,
          }}
          aria-hidden="true"
        />
      )}

      {/* Soft water placement zone for the current log. Hidden by default —
          no permanent strong dropzone from the start. L1 shows a broad, vague
          breathing area (not the exact spot); L2+/dragging/repeated-miss
          shows the clear, exact zone. */}
      {phase === 'play' && !debugMode && activeLog < TOTAL_LOGS && (() => {
        const visibility = dragging === 'log' || effectiveHintLevel >= 2
          ? 'clear'
          : effectiveHintLevel === 1
            ? 'broad'
            : 'hidden';
        return (
          <div
            className={[
              'maha-water-dropzone',
              `is-${visibility}`,
              dragging === 'log' ? 'is-dragging' : '',
              wrongDropPulse ? 'is-wrong' : '',
            ].filter(Boolean).join(' ')}
            style={{
              left: `${currentTargetLog.l}%`,
              top: `${currentTargetLog.t}%`,
              width: `${currentTargetLog.w * (visibility === 'broad' ? 0.95 : 0.72)}%`,
            }}
            aria-hidden="true"
          >
            <span className="maha-water-dropzone__inner" />
          </div>
        );
      })()}

      {/* Log 1 only: L2 shows a short partial gesture (does not reach the target) + VO
          "Drag the log into the water."; L3 shows the full path + "Put the
          log here." Never after the child has really dragged once, and never on
          logs 2-4. The initial teaching pass (log 1 only) is always full,
          one iteration, no VO, and waits for the intro VO to actually start
          speaking (introVoStarted) before its own short buffer delay — a
          fixed ms-from-mount guess doesn't track real TTS startup lag.
          Two consecutive wrong drops reveal the exact spot early (effectiveHintLevel drives the
          drop zone only) - never the hand. */}
      <GestureDemo
        type="drag"
        from={{ x: currentWaitingLog.l, y: currentWaitingLog.t }}
        to={
          needsInitialTeaching && !teachingComplete
            ? { x: currentTargetLog.l, y: currentTargetLog.t }
            : hintLevel >= 3
              ? { x: currentTargetLog.l, y: currentTargetLog.t }
              : {
                  x: lerp(currentWaitingLog.l, currentTargetLog.l, 0.38),
                  y: lerp(currentWaitingLog.t, currentTargetLog.t, 0.38),
                }
        }
        active={
          !debugMode && phase === 'play' && dragging !== 'log'
          && !childHasDragged
          && ((needsInitialTeaching && !teachingComplete && introVoStarted) || (isLearningLog && hintLevel >= 2))
        }
        replayKey={needsInitialTeaching && !teachingComplete ? 'teaching' : hintLevel}
        idleDelay={needsInitialTeaching && !teachingComplete ? 150 : 0}
        // One pass for the automatic first-time teaching demo — a repeat
        // reads as nagging and delays the child's own turn. The L2/L3 hint
        // ladder (only shown if the child gets stuck) keeps its 2 passes.
        iterations={needsInitialTeaching && !teachingComplete ? 1 : 2}
        paused={handPaused}
        onComplete={() => {
          if (needsInitialTeaching && !teachingComplete) setTeachingCompleteKey(hintStageKey);
        }}
        onDismiss={() => {
          if (needsInitialTeaching && !teachingComplete) setTeachingCompleteKey(hintStageKey);
        }}
      />

      {/* Logs 2-4, after 2 misses in a row: the child can drag but not where it goes, so a pointing
          hand (not a drag lesson) shows the exact spot while "Put the log here." plays. */}
      <GestureDemo
        type="point"
        from={{ x: currentTargetLog.l, y: currentTargetLog.t }}
        active={!debugMode && phase === 'play' && !isLearningLog && dragging !== 'log' && wrongDropCount >= 2}
        replayKey={wrongDropCount}
        idleDelay={400}
        iterations={2}
        paused={handPaused}
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
