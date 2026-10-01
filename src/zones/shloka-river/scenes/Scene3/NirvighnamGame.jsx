import PoseImage, { usePreloadPoses } from '../../../../lib/components/animation/PoseImage';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import usePausableTimers from '../../../../lib/hooks/usePausableTimers';
import { getLineCue } from '../../../../lib/config/content/voiceCues';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './NirvighnamGame.css';

import sharedSceneBg from './assets/images/saurakoti-bg.png';
import turtleSadImg from './assets/images/nirvighnam/nir-turtle-sad.png';
import turtleHappyImg from './assets/images/nirvighnam/nir-turtle-happy.png';
import nestImg from './assets/images/nirvighnam/nest.png';
import stoneImg from './assets/images/nirvighnam/stone.png';
import branchImg from './assets/images/nirvighnam/branch.png';
import reedsClosedImg from './assets/images/nirvighnam/reeds-closed.png';
import reedsOpenImg from './assets/images/nirvighnam/reeds-open.png';
import { NIRVIGHNAM_LAYOUT } from './scene3LayoutConfig';

const SYLLABLES = ['Nir', 'vigh', 'nam'];
const AUDIO = { syllables: ['nir', 'vigh', 'nam'] };
const OBSTACLE_ORDER = ['stone', 'branch', 'reed'];
const ROCK_HOLD_MS = 1200;
const BRANCH_DROP_RX = 8;
const BRANCH_DROP_RY = 5;
const BRANCH_DRAG_START_THRESHOLD = 1.5;
const REED_SWIPE_REQUIRED = 58;
const NIRV_DEBUG_STORAGE_KEY = 'shloka_nirvighnam_layout_debug_v2';
const SHOW_HIT_ZONES = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('hitzones');

const DEBUG_PHASE_OPTIONS = [
  { value: 0, label: 'Start' },
  { value: 1, label: 'After Rock' },
  { value: 2, label: 'After Branch' },
  { value: 3, label: 'After Reeds' },
  { value: 4, label: 'Swimming' },
  { value: 5, label: 'At Nest' },
];

const getDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has('debug')
    || window.location.pathname.includes('/dev/game-test')
    || window.location.pathname.includes('game-test');
};

const cloneLayout = (layout) => JSON.parse(JSON.stringify(layout));
const createDebugLayout = () => cloneLayout(NIRVIGHNAM_LAYOUT);

const loadDebugLayout = () => {
  const fallback = createDebugLayout();
  if (!getDebugEnabled()) return fallback;

  try {
    const saved = window.localStorage.getItem(NIRV_DEBUG_STORAGE_KEY);
    if (!saved) return fallback;

    const parsed = JSON.parse(saved);
    return {
      ...fallback,
      ...parsed,
      turtleStart: { ...fallback.turtleStart, ...parsed.turtleStart },
      nest: { ...fallback.nest, ...parsed.nest },
      obstacles: fallback.obstacles.map((obstacle, index) => ({
        ...obstacle,
        ...(parsed.obstacles?.[index] || {}),
      })),
      bankSpots: {
        stone: { ...fallback.bankSpots.stone, ...(parsed.bankSpots?.stone || {}) },
        branch: { ...fallback.bankSpots.branch, ...(parsed.bankSpots?.branch || {}) },
      },
      turtleNodes: fallback.turtleNodes.map((node, index) => ({
        ...node,
        ...(parsed.turtleNodes?.[index] || {}),
      })),
      swimPath: fallback.swimPath.map((waypoint, index) => ({
        ...waypoint,
        ...(parsed.swimPath?.[index] || {}),
      })),
      pathLine: { ...fallback.pathLine, ...parsed.pathLine },
    };
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Unable to load Nirvighnam layout debug values:', error);
    return fallback;
  }
};

const obstacleImageById = {
  stone: stoneImg,
  branch: branchImg,
  reed: reedsClosedImg,
};

const OBSTACLE_INTRO_KEYS = {
  branch: 'nirv_branch_intro',
  reed: 'nirv_reed_intro',
};

// GMB Hint Standard v1 — flat 10s/18s/26s from VO end or last interaction,
// same across every obstacle.
const HINT_TIMINGS = {
  stone: { l1: 10000, l2: 18000, l3: 26000 },
  branch: { l1: 10000, l2: 18000, l3: 26000 },
  reed: { l1: 10000, l2: 18000, l3: 26000 },
};

const debugOptions = [
  { type: 'object', key: 'turtleStart', label: 'Turtle Start', fields: ['l', 't'] },
  { type: 'root', key: 'turtleWidth', label: 'Turtle Width', fields: ['turtleWidth'] },
  { type: 'object', key: 'nest', label: 'Nest', fields: ['l', 't', 'w'] },
  { type: 'obstacle', index: 0, key: 'obstacle-0', label: 'Rock', fields: ['l', 't', 'w'] },
  { type: 'obstacle', index: 1, key: 'obstacle-1', label: 'Branch', fields: ['l', 't', 'w'] },
  { type: 'obstacle', index: 2, key: 'obstacle-2', label: 'Reeds', fields: ['l', 't', 'w'] },
  { type: 'bankSpot', id: 'stone', key: 'bank-stone', label: 'Rock Bank Spot', fields: ['l', 't'] },
  { type: 'bankSpot', id: 'branch', key: 'bank-branch', label: 'Branch Bank Spot', fields: ['l', 't'] },
  { type: 'turtleNode', index: 0, key: 'turtle-node-0', label: 'Turtle Node 1', fields: ['l', 't'] },
  { type: 'turtleNode', index: 1, key: 'turtle-node-1', label: 'Turtle Node 2', fields: ['l', 't'] },
  { type: 'turtleNode', index: 2, key: 'turtle-node-2', label: 'Turtle Node 3', fields: ['l', 't'] },
  { type: 'swimPath', index: 0, key: 'swim-0', label: 'Nest Landing (swim end)', fields: ['l', 't'] },
];

const POSE_ASSETS = [
  sharedSceneBg,
  turtleSadImg,
  turtleHappyImg,
  nestImg,
  stoneImg,
  branchImg,
  reedsClosedImg,
  reedsOpenImg,
];

export default function NirvighnamGame({
  isActive = false,
  introComplete = true,
  introVoStarted = true,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  voiceGuidance = {},
  isPaused = false,
  // Sidebar actually open (isPaused also covers the short replay hold after it closes): drives the
  // hand demo, the animation freeze and the hint pin, so the hand can play WITH the replayed line.
  isSidebarOpen,
}) {
  const handPaused = isSidebarOpen ?? isPaused;
  usePreloadPoses(POSE_ASSETS);
  const { playVoice: playSceneLine, playSyllable, playWord, stopVoice: stopSceneVoice } = voiceGuidance;
  const debugEnabled = getDebugEnabled();
  const defaultLayout = useMemo(createDebugLayout, []);
  const [debugLayout, setDebugLayout] = useState(loadDebugLayout);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [selectedDebugKey, setSelectedDebugKey] = useState(debugOptions[0].key);
  const [debugPhase, setDebugPhase] = useState(0);
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 16, y: 16 });
  const [phase, setPhase] = useState('play');
  const [cleared, setCleared] = useState([]);
  const [litCount, setLitCount] = useState(0);
  const [turtlePos, setTurtlePos] = useState(() => loadDebugLayout().turtleStart);
  const [isSwimming, setIsSwimming] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [branchDragActive, setBranchDragActive] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [branchReturning, setBranchReturning] = useState(false);
  const [branchWrongPulse, setBranchWrongPulse] = useState(false);
  const [holdingRock, setHoldingRock] = useState(false);
  const [rockProgress, setRockProgress] = useState(0);
  const [reedSwipeStart, setReedSwipeStart] = useState(null);
  const [reedSwipeAmount, setReedSwipeAmount] = useState(0);
  const [reedWrongPulse, setReedWrongPulse] = useState(false);
  const [teachingDoneFor, setTeachingDoneFor] = useState(null);
  const [obstacleIntroComplete, setObstacleIntroComplete] = useState({});
  // Tracks when branch/reed's own intro VO has actually started speaking —
  // the teaching gesture for that obstacle waits for this (mirrors how the
  // stone gesture waits on introVoStarted), so it doesn't pop up before the
  // line that names the obstacle has even begun.
  const [obstacleIntroVoStarted, setObstacleIntroVoStarted] = useState({});
  // Each intro line has a story clause then an action clause ("Turtle's way
  // home is blocked. Press and hold the rock...") — showing the gesture the
  // instant the VO starts lands it during "story", not "action". A flat delay
  // after VO-start approximates "action" without needing to split the audio.
  const GESTURE_VO_DELAY_MS = 500;
  const [stoneGestureReady, setStoneGestureReady] = useState(false);
  useEffect(() => {
    if (!introVoStarted) { setStoneGestureReady(false); return undefined; }
    const t = window.setTimeout(() => setStoneGestureReady(true), GESTURE_VO_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [introVoStarted]);
  // Persists across a pointer-up, unlike checking live drag/hold state — a
  // child who started, stalled, and let go should still get "keep going",
  // not the from-scratch instruction.
  const [obstacleHasProgress, setObstacleHasProgress] = useState(false);

  const stageRef = useRef(null);
  const dragStartRef = useRef(null);
  const branchDragActiveRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const rockProgressRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const voFallbackRef = useRef(null);
  const debugPanelDragRef = useRef(null);
  const phaseRef = useRef('play');
  const doneAnnouncedRef = useRef(false);
  const successVoDoneRef = useRef(false);
  const swimDoneRef = useRef(false);
  const completionScheduledRef = useRef(false);
  const lastSyllableDoneRef = useRef(false);
  const completionVoStartedRef = useRef(false);
  const sylEndFallbackRef = useRef(null);
  const lastProgressHintResetRef = useRef(0);
  const lastHintVoRef = useRef('');
  const branchWrongCountRef = useRef(0);
  const reedWrongCountRef = useRef(0);
  const reedWrongThisGestureRef = useRef(false);
  const onPhaseCompleteRef = useRef(onPhaseComplete);
  const onGameCompleteRef = useRef(onGameComplete);
  const activeLayout = debugEnabled ? debugLayout : defaultLayout;
  const obstacles = useMemo(() => activeLayout.obstacles.map((obstacle) => ({
    ...obstacle,
    img: obstacleImageById[obstacle.id],
  })), [activeLayout.obstacles]);
  const bankSpots = activeLayout.bankSpots;
  const turtleNodes = activeLayout.turtleNodes;
  const swimPath = activeLayout.swimPath;
  const selectedDebugOption = debugOptions.find((option) => option.key === selectedDebugKey) || debugOptions[0];
  const nextObstacleId = OBSTACLE_ORDER[cleared.length];
  const teachingComplete = teachingDoneFor === nextObstacleId;
  const currentHintTiming = HINT_TIMINGS[nextObstacleId] || HINT_TIMINGS.stone;
  const currentObstacleIntroComplete = nextObstacleId === 'stone'
    ? introComplete
    : !!obstacleIntroComplete[nextObstacleId];
  // Gated on the instruction VO (introComplete), not on the teaching
  // gesture finishing — the clock shouldn't wait on an animation.
  const { hintLevel, markInteraction, markAttempt, markLevel2VoiceStarted, markLevel2VoiceEnded } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play' && currentObstacleIntroComplete,
    stageKey: phase === 'play' ? `clear-${cleared.length}` : phase,
    initialDelay: currentHintTiming.l1,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: currentHintTiming.l2,
    level3Delay: currentHintTiming.l3,
    paused: handPaused,
  });

  // Freezes with the sidebar and resumes with the remaining time (see hook).
  const { after: pausableAfter, cancel: cancelPausable, clear: clearPausable } = usePausableTimers(isPaused);

  const markMeaningfulProgress = useCallback(() => {
    const now = performance.now();
    if (now - lastProgressHintResetRef.current < 700) return;
    lastProgressHintResetRef.current = now;
    markInteraction();
  }, [markInteraction]);

  const clearTimers = useCallback(() => {
    if (rockProgressRef.current) {
      window.clearInterval(rockProgressRef.current);
      rockProgressRef.current = null;
    }
    if (transitionTimerRef.current) {
      cancelPausable(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (voFallbackRef.current) {
      cancelPausable(voFallbackRef.current);
      voFallbackRef.current = null;
    }
    if (sylEndFallbackRef.current) {
      cancelPausable(sylEndFallbackRef.current);
      sylEndFallbackRef.current = null;
    }
    clearPausable();
  }, [cancelPausable, clearPausable]);

  const isCleared = useCallback((id) => cleared.includes(id), [cleared]);

  const clearObstacle = useCallback((id) => {
    if (phaseRef.current !== 'play') return;
    if (cleared.includes(id)) return;
    if (id !== OBSTACLE_ORDER[cleared.length]) return;

    setCleared((prev) => [...prev, id]);
    setLitCount((prev) => Math.min(SYLLABLES.length, prev + 1));
    markInteraction();
    onMicroWin?.();
  }, [cleared, markInteraction, onMicroWin]);

  const finishCurrentObstacleIntro = useCallback(() => {
    if (!nextObstacleId || nextObstacleId === 'stone') return;
    setObstacleIntroComplete((current) => (
      current[nextObstacleId] ? current : { ...current, [nextObstacleId]: true }
    ));
  }, [nextObstacleId]);

  useEffect(() => {
    if (!debugEnabled) return;
    window.localStorage.setItem(NIRV_DEBUG_STORAGE_KEY, JSON.stringify(debugLayout));
  }, [debugEnabled, debugLayout]);

  useEffect(() => {
    if (!debugEnabled || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const panelWidth = Math.min(360, Math.max(260, rect.width - 24));
    const nextX = Math.max(12, rect.width - panelWidth - 16);
    setDebugPanelPosition((current) => (
      current.x === 16 && current.y === 16
        ? { x: nextX, y: 14 }
        : current
    ));
  }, [debugEnabled, isActive]);

  // Debug-only: preview the turtle at the selected phase without running gameplay.
  useEffect(() => {
    if (!debugEnabled || !showDebugPanel) return;
    const nodes = activeLayout.turtleNodes;
    const swim = activeLayout.swimPath;
    const previewPos =
      debugPhase === 0 ? activeLayout.turtleStart
        : debugPhase <= 3 ? (nodes[debugPhase - 1] || activeLayout.turtleStart)
          : debugPhase === 4 ? (nodes[nodes.length - 1] || activeLayout.turtleStart)
            : (swim[swim.length - 1] || activeLayout.turtleStart);
    setTurtlePos(previewPos);
  }, [debugEnabled, showDebugPanel, debugPhase, activeLayout]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // New obstacle: re-teach its gesture, and don't let old progress suppress
  // the fresh hint clock for it.
  useEffect(() => {
    setTeachingDoneFor(null);
    setObstacleHasProgress(false);
    lastProgressHintResetRef.current = 0;
    lastHintVoRef.current = '';
  }, [nextObstacleId]);

  // Branch/reed intro VO is NOT triggered off nextObstacleId directly — that
  // races the just-cleared obstacle's own syllable (both fire off the same
  // cleared.length change, sharing one audio channel, so whichever fired
  // second cut the first one off). Instead it's chained onto that syllable's
  // onEnded below (SyllableHighlight's onSyllableLit), so it always plays
  // after the syllable finishes, never over it.
  // Fallback: if a resume/edge-case leaves obstacleIntroComplete unset with
  // no syllable event to trigger it (e.g. reload mid-obstacle), don't let the
  // hint clock and teaching gesture stay gated forever.
  useEffect(() => {
    if (!isActive || phase !== 'play' || isPaused) return;
    if (!nextObstacleId || nextObstacleId === 'stone') return;
    if (obstacleIntroComplete[nextObstacleId]) return;
    if (OBSTACLE_INTRO_KEYS[nextObstacleId] && playSceneLine) return;
    finishCurrentObstacleIntro();
  }, [finishCurrentObstacleIntro, isActive, isPaused, nextObstacleId, obstacleIntroComplete, phase, playSceneLine]);

  // L2 hint VO — "Press and hold..." if untouched, "Keep holding" (etc.) if
  // the child made real progress and then stalled. obstacleHasProgress
  // persists across a pointer-up, so a stall genuinely gets the "keep going"
  // wording instead of waiting for a separate L3 escalation to say it.
  useEffect(() => {
    if (phase !== 'play' || hintLevel !== 2 || !nextObstacleId || isPaused) return;

    const voiceKey = obstacleHasProgress ? `nirv_hint_keep_${nextObstacleId}` : `nirv_hint_${nextObstacleId}`;
    const onceKey = `${nextObstacleId}-${voiceKey}`;
    if (lastHintVoRef.current === onceKey) return;
    lastHintVoRef.current = onceKey;

    stopSceneVoice?.();
    if (playSceneLine) markLevel2VoiceStarted();
    playSceneLine?.(voiceKey, markLevel2VoiceEnded);
  }, [hintLevel, isPaused, nextObstacleId, obstacleHasProgress, phase, playSceneLine, stopSceneVoice, markLevel2VoiceStarted, markLevel2VoiceEnded]);

  useEffect(() => {
    onPhaseCompleteRef.current = onPhaseComplete;
    onGameCompleteRef.current = onGameComplete;
  }, [onGameComplete, onPhaseComplete]);

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      setPhase('play');
      setCleared([]);
      setLitCount(0);
      setTurtlePos(activeLayout.turtleStart);
      setIsSwimming(false);
      setDragging(null);
      setBranchDragActive(false);
      branchDragActiveRef.current = false;
      setDragOffset({ x: 0, y: 0 });
      setBranchReturning(false);
      setBranchWrongPulse(false);
      setHoldingRock(false);
      setRockProgress(0);
      setReedSwipeStart(null);
      setReedSwipeAmount(0);
      setReedWrongPulse(false);
      setObstacleIntroComplete({});
      setObstacleIntroVoStarted({});
      dragOffsetRef.current = { x: 0, y: 0 };
      dragStartRef.current = null;
      branchWrongCountRef.current = 0;
      reedWrongCountRef.current = 0;
      reedWrongThisGestureRef.current = false;
      phaseRef.current = 'play';
      doneAnnouncedRef.current = false;
      successVoDoneRef.current = false;
      swimDoneRef.current = false;
      completionScheduledRef.current = false;
      lastSyllableDoneRef.current = false;
      completionVoStartedRef.current = false;
    }
  }, [activeLayout.turtleStart, clearTimers, isActive]);

  // Back from the sidebar: the current obstacle's teaching hand plays again with the
  // replayed intro line.
  // The replayed intro's cue re-times it: reset this obstacle's started flag so the hand waits for the action word.
  // Not when the child left during an L2/L3 hint: the hint hands only show once teaching is
  // marked done, so re-arming teaching would switch the hint hand off.
  const wasPausedForTeachRef = useRef(false);
  const hintWasActiveRef = useRef(false);
  useEffect(() => {
    if (handPaused && !wasPausedForTeachRef.current) hintWasActiveRef.current = hintLevel >= 2;
    if (wasPausedForTeachRef.current && !handPaused && !hintWasActiveRef.current) {
      setTeachingDoneFor(null);
      const next = OBSTACLE_ORDER[cleared.length];
      if (next && next !== 'stone') setObstacleIntroVoStarted((current) => ({ ...current, [next]: false }));
    }
    wasPausedForTeachRef.current = handPaused;
  }, [handPaused]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isPaused) {
      if (rockProgressRef.current) {
        window.clearInterval(rockProgressRef.current);
        rockProgressRef.current = null;
      }
      setHoldingRock(false);
      if (!isCleared('stone')) setRockProgress(0);
      setDragging(null);
      setBranchDragActive(false);
      branchDragActiveRef.current = false;
      setDragOffset({ x: 0, y: 0 });
      setBranchReturning(false);
      setBranchWrongPulse(false);
      dragOffsetRef.current = { x: 0, y: 0 };
      dragStartRef.current = null;
      setReedSwipeStart(null);
      setReedWrongPulse(false);
      reedWrongThisGestureRef.current = false;
      if (!isCleared('reed')) setReedSwipeAmount(0);
    }
  }, [isCleared, isPaused]);

  useEffect(() => {
    if (!isActive || phase !== 'play') return;
    // The debug Phase selector owns turtlePos while the panel is open.
    if (debugEnabled && showDebugPanel) return;

    if (transitionTimerRef.current) {
      cancelPausable(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (cleared.length === 0) {
      setTurtlePos(activeLayout.turtleStart);
      return;
    }

    const nextNode = turtleNodes[Math.min(cleared.length - 1, turtleNodes.length - 1)];
    if (nextNode) {
      setTurtlePos(nextNode);
    }

    if (cleared.length >= OBSTACLE_ORDER.length) {
      transitionTimerRef.current = pausableAfter(420, () => {
        setPhase('swim');
      });
    }
  }, [activeLayout.turtleStart, cancelPausable, cleared.length, isActive, pausableAfter, phase, turtleNodes, debugEnabled, showDebugPanel]);

  const startRockHold = useCallback((event) => {
    if (phaseRef.current !== 'play' || isPaused) return;
    if (nextObstacleId !== 'stone' || isCleared('stone')) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    stopSceneVoice?.();
    finishCurrentObstacleIntro();

    // Touching the correct active obstacle is meaningful even before the
    // progress threshold — dismiss the teaching demo right away instead of
    // waiting for its own animation to finish.
    if (teachingDoneFor !== nextObstacleId) setTeachingDoneFor(nextObstacleId);
    // Grabbing the obstacle is an attempt, not progress: a visible hint stays; clearing it
    // (clearObstacle / markMeaningfulProgress) is what counts as progress.
    markAttempt();

    if (rockProgressRef.current) {
      window.clearInterval(rockProgressRef.current);
    }

    const startedAt = performance.now();
    setHoldingRock(true);
    setRockProgress(0);

    rockProgressRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const progress = Math.min(elapsed / ROCK_HOLD_MS, 1);
      setRockProgress(progress);

      if (progress >= 0.2) {
        setObstacleHasProgress(true);
        markMeaningfulProgress();
      }

      if (progress >= 1) {
        window.clearInterval(rockProgressRef.current);
        rockProgressRef.current = null;
        setHoldingRock(false);
        setRockProgress(1);
        clearObstacle('stone');
      }
    }, 30);
  }, [clearObstacle, finishCurrentObstacleIntro, isCleared, isPaused, markAttempt, markMeaningfulProgress, nextObstacleId, stopSceneVoice, teachingDoneFor]);

  const cancelRockHold = useCallback(() => {
    if (rockProgressRef.current) {
      window.clearInterval(rockProgressRef.current);
      rockProgressRef.current = null;
    }
    setHoldingRock(false);
    if (!isCleared('stone')) setRockProgress(0);
  }, [isCleared]);

  const handleBranchPointerDown = useCallback((event) => {
    if (phaseRef.current !== 'play' || isPaused) return;
    if (branchReturning) return;
    if (nextObstacleId !== 'branch' || isCleared('branch')) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    stopSceneVoice?.();
    finishCurrentObstacleIntro();

    if (teachingDoneFor !== nextObstacleId) setTeachingDoneFor(nextObstacleId);
    // Grabbing the obstacle is an attempt, not progress: a visible hint stays; clearing it
    // (clearObstacle / markMeaningfulProgress) is what counts as progress.
    markAttempt();

    dragStartRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
    };
    setDragging('branch');
    setBranchDragActive(false);
    branchDragActiveRef.current = false;
    setDragOffset({ x: 0, y: 0 });
    dragOffsetRef.current = { x: 0, y: 0 };
  }, [branchReturning, finishCurrentObstacleIntro, isCleared, isPaused, markAttempt, nextObstacleId, stopSceneVoice, teachingDoneFor]);

  useEffect(() => {
    if (dragging !== 'branch' || !isActive) return;

    const handleMove = (event) => {
      if (!dragStartRef.current || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const dx = ((event.clientX - dragStartRef.current.clientX) / rect.width) * 100;
      const dy = ((event.clientY - dragStartRef.current.clientY) / rect.height) * 100;
      dragOffsetRef.current = { x: dx, y: dy };
      setDragOffset({ x: dx, y: dy });

      const dragDistance = Math.hypot(dx, dy);
      if (dragDistance >= BRANCH_DRAG_START_THRESHOLD) {
        branchDragActiveRef.current = true;
        setBranchDragActive(true);
      }

      if (dragDistance >= 4) {
        setObstacleHasProgress(true);
        markMeaningfulProgress();
      }
    };

    const handleUp = () => {
      const branch = obstacles.find((obstacle) => obstacle.id === 'branch');
      if (!branch) return;

      if (!branchDragActiveRef.current) {
        setDragging(null);
        setBranchDragActive(false);
        dragStartRef.current = null;
        setDragOffset({ x: 0, y: 0 });
        dragOffsetRef.current = { x: 0, y: 0 };
        return;
      }

      const currentL = branch.l + dragOffsetRef.current.x;
      const currentT = branch.t + dragOffsetRef.current.y;
      const dx = (currentL - bankSpots.branch.l) / BRANCH_DROP_RX;
      const dy = (currentT - bankSpots.branch.t) / BRANCH_DROP_RY;

      if (dx * dx + dy * dy <= 1) {
        branchWrongCountRef.current = 0;
        clearObstacle('branch');
        setDragging(null);
        setBranchDragActive(false);
        branchDragActiveRef.current = false;
        setBranchReturning(false);
        dragStartRef.current = null;
        return;
      }

      branchWrongCountRef.current += 1;
      setDragging(null);
      setBranchDragActive(false);
      branchDragActiveRef.current = false;
      setBranchReturning(true);
      setBranchWrongPulse(true);

      window.setTimeout(() => {
        setDragOffset({ x: 0, y: 0 });
        dragOffsetRef.current = { x: 0, y: 0 };
      }, 120);

      window.setTimeout(() => {
        setBranchReturning(false);
        setBranchWrongPulse(false);
      }, 560);

      dragStartRef.current = null;

      if (branchWrongCountRef.current >= 3) {
        branchWrongCountRef.current = 0;
        stopSceneVoice?.();
        playSceneLine?.('nirv_hint_branch');
      }
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [bankSpots.branch.l, bankSpots.branch.t, clearObstacle, dragging, isActive, markMeaningfulProgress, obstacles, playSceneLine, stopSceneVoice]);

  const handleReedPointerDown = useCallback((event) => {
    if (phaseRef.current !== 'play' || isPaused) return;
    if (nextObstacleId !== 'reed' || isCleared('reed')) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    stopSceneVoice?.();
    finishCurrentObstacleIntro();

    if (teachingDoneFor !== nextObstacleId) setTeachingDoneFor(nextObstacleId);
    // Grabbing the obstacle is an attempt, not progress: a visible hint stays; clearing it
    // (clearObstacle / markMeaningfulProgress) is what counts as progress.
    markAttempt();

    reedWrongThisGestureRef.current = false;
    setReedSwipeStart({ x: event.clientX, y: event.clientY });
    setReedSwipeAmount(0);
  }, [finishCurrentObstacleIntro, isCleared, isPaused, markAttempt, nextObstacleId, stopSceneVoice, teachingDoneFor]);

  useEffect(() => {
    if (!reedSwipeStart || !isActive) return;

    const handleMove = (event) => {
      const dx = event.clientX - reedSwipeStart.x;
      const dy = event.clientY - reedSwipeStart.y;
      if (Math.abs(dx) < Math.abs(dy)) {
        if (Math.abs(dy) >= 12 && !reedWrongThisGestureRef.current) {
          reedWrongThisGestureRef.current = true;
          reedWrongCountRef.current += 1;
          setReedWrongPulse(true);
          window.setTimeout(() => setReedWrongPulse(false), 360);
        }
        return;
      }

      const amount = Math.min(Math.abs(dx), REED_SWIPE_REQUIRED);
      setReedSwipeAmount(amount);

      if (amount >= 12) {
        setObstacleHasProgress(true);
        markMeaningfulProgress();
      }
    };

    const handleUp = () => {
      if (reedSwipeAmount >= REED_SWIPE_REQUIRED) {
        reedWrongCountRef.current = 0;
        clearObstacle('reed');
      } else if (reedWrongThisGestureRef.current && reedWrongCountRef.current >= 3) {
        reedWrongCountRef.current = 0;
        stopSceneVoice?.();
        playSceneLine?.('nirv_hint_reed');
      }

      reedWrongThisGestureRef.current = false;
      setReedSwipeStart(null);
      if (!isCleared('reed')) setReedSwipeAmount(0);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [clearObstacle, isActive, isCleared, markMeaningfulProgress, playSceneLine, reedSwipeAmount, reedSwipeStart, stopSceneVoice]);

  const completeAfterSuccess = useCallback(() => {
    if (!successVoDoneRef.current || !swimDoneRef.current || completionScheduledRef.current) return;
    completionScheduledRef.current = true;
    pausableAfter(500, () => {
      onGameCompleteRef.current?.();
      onPhaseCompleteRef.current?.();
    });
  }, [pausableAfter]);

  // Completion audio plays strictly in sequence, no overlap:
  //   final syllable "nam"  ->  full word "nirvighnam"  ->  ending line
  // Fires only once both the last syllable has finished AND the swim has begun.
  const startCompletionVo = useCallback(() => {
    if (completionVoStartedRef.current) return;
    if (!lastSyllableDoneRef.current || !doneAnnouncedRef.current) return;
    completionVoStartedRef.current = true;

    if (sylEndFallbackRef.current) {
      cancelPausable(sylEndFallbackRef.current);
      sylEndFallbackRef.current = null;
    }

    if (!playSceneLine) {
      successVoDoneRef.current = true;
      return;
    }

    const afterWord = () => {
      playSceneLine('nirv_done', () => {
        successVoDoneRef.current = true;
        completeAfterSuccess();
      }, { stripLeadingText: 'Nirvighnam' });
    };

    if (playWord) playWord('nirvighnam', afterWord);
    else afterWord();

    // Pausable, so the sidebar can't let it complete the game behind the panel.
    voFallbackRef.current = pausableAfter(10000, () => {
      if (!successVoDoneRef.current) {
        successVoDoneRef.current = true;
        completeAfterSuccess();
      }
    });
  }, [cancelPausable, completeAfterSuccess, pausableAfter, playSceneLine, playWord]);

  useEffect(() => {
    if (phase !== 'swim' || doneAnnouncedRef.current) return;
    doneAnnouncedRef.current = true;
    const timers = [];

    setIsSwimming(true);

    // Don't start the word/ending line yet — wait for the final "nam" syllable
    // to finish (its playSyllable onEnded sets lastSyllableDoneRef). Guard with
    // a fallback in case that callback never fires (audio error / iOS).
    sylEndFallbackRef.current = pausableAfter(1600, () => {
      lastSyllableDoneRef.current = true;
      startCompletionVo();
    });
    startCompletionVo();

    swimPath.forEach((waypoint, index) => {
      const hopTimer = pausableAfter(index * 580, () => {
        setTurtlePos(waypoint);
        if (index === swimPath.length - 1) {
          const settleTimer = pausableAfter(550, () => {
            setIsSwimming(false);
            swimDoneRef.current = true;
            setPhase('done');
            completeAfterSuccess();
          });
          timers.push(settleTimer);
        }
      });
      timers.push(hopTimer);
    });

    return () => {
      timers.forEach(cancelPausable);
    };
  }, [cancelPausable, completeAfterSuccess, pausableAfter, phase, startCompletionVo, swimPath]);

  useEffect(() => () => {
    clearTimers();
  }, [clearTimers]);

  if (!isActive) return null;

  const stone = obstacles.find((obstacle) => obstacle.id === 'stone');
  const branch = obstacles.find((obstacle) => obstacle.id === 'branch');
  const reeds = obstacles.find((obstacle) => obstacle.id === 'reed');

  // Debug Phase selector previews the whole scene at a given phase without
  // running gameplay: obstacles moved to their bank, syllables lit, turtle
  // advanced. Phases 0-3 = play (0,1,2,3 obstacles cleared), 4 = swim, 5 = done.
  const debugPreview = debugEnabled && showDebugPanel;
  const previewClearedCount = Math.min(debugPhase, OBSTACLE_ORDER.length);
  const effPhase = !debugPreview
    ? phase
    : debugPhase <= 3 ? 'play' : debugPhase === 4 ? 'swim' : 'done';
  const showCleared = (id) => (
    debugPreview
      ? OBSTACLE_ORDER.indexOf(id) < previewClearedCount
      : isCleared(id)
  );
  const effLitCount = debugPreview ? previewClearedCount : litCount;
  const effSwimming = debugPreview ? debugPhase === 4 : isSwimming;
  const isDone = effPhase === 'done';

  const getObstacleFocusClass = (id) => {
    if (showCleared(id)) return 'is-cleared-focus';
    if (nextObstacleId === id) return 'is-current-focus';
    return 'is-future-focus';
  };

  const updateDebugValue = (field, rawValue) => {
    const value = Number(rawValue);
    if (Number.isNaN(value)) return;

    setDebugLayout((current) => {
      const next = cloneLayout(current);
      const option = selectedDebugOption;

      if (option.type === 'root') next[field] = value;
      if (option.type === 'object') next[option.key][field] = value;
      if (option.type === 'obstacle') next.obstacles[option.index][field] = value;
      if (option.type === 'bankSpot') next.bankSpots[option.id][field] = value;
      if (option.type === 'turtleNode') next.turtleNodes[option.index][field] = value;
      if (option.type === 'swimPath') next.swimPath[option.index][field] = value;
      if (option.type === 'pathLine') next.pathLine[field] = value;

      return next;
    });
  };

  const getDebugValue = (field) => {
    const option = selectedDebugOption;
    if (option.type === 'root') return activeLayout[field];
    if (option.type === 'object') return activeLayout[option.key][field];
    if (option.type === 'obstacle') return activeLayout.obstacles[option.index][field];
    if (option.type === 'bankSpot') return activeLayout.bankSpots[option.id][field];
    if (option.type === 'turtleNode') return activeLayout.turtleNodes[option.index][field];
    if (option.type === 'swimPath') return activeLayout.swimPath[option.index][field];
    if (option.type === 'pathLine') return activeLayout.pathLine[field];
    return '';
  };

  const nudgeDebugField = (field, delta) => {
    const current = Number(getDebugValue(field)) || 0;
    updateDebugValue(field, current + delta);
  };

  const copyDebugLayout = () => {
    const payload = 'export const NIRVIGHNAM_LAYOUT = ' + JSON.stringify({
      turtleStart: activeLayout.turtleStart,
      turtleWidth: activeLayout.turtleWidth,
      turtleFlip: activeLayout.turtleFlip,
      nest: activeLayout.nest,
      obstacles: activeLayout.obstacles,
      bankSpots: activeLayout.bankSpots,
      turtleNodes: activeLayout.turtleNodes,
      swimPath: activeLayout.swimPath,
      pathLine: activeLayout.pathLine,
    }, null, 2) + ';';

    if (import.meta.env.DEV) console.log('Nirvighnam layout JSON:', payload);
    window.prompt('Copy Nirvighnam layout', payload);
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
    const rect = stageRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;

    event.preventDefault();
    event.stopPropagation();

    const panelWidth = Math.min(360, Math.max(260, rect.width - 24));
    const panelHeight = showDebugPanel ? Math.min(rect.height - 96, 560) : 44;
    const rawX = event.clientX - rect.left - drag.offsetX;
    const rawY = event.clientY - rect.top - drag.offsetY;
    const nextX = Math.max(8, Math.min(rect.width - panelWidth - 8, rawX));
    const nextY = Math.max(8, Math.min(rect.height - panelHeight - 8, rawY));

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

  const fullGestureConfig = {
    stone: stone ? { type: 'hold', from: { x: stone.l, y: stone.t } } : null,
    branch: branch ? { type: 'drag', from: { x: branch.l, y: branch.t }, to: { x: bankSpots.branch.l, y: bankSpots.branch.t } } : null,
    reed: reeds ? { type: 'swipe-right', from: { x: reeds.l, y: reeds.t } } : null,
  }[nextObstacleId];

  // L2 shows a shorter version — for branch, a partial path partway to the
  // bank; hold/swipe distinguish partial from full mainly via one pass vs.
  // the more explicit L3 pass (see iterations below).
  const partialBranchTarget = branch
    ? {
      x: branch.l + (bankSpots.branch.l - branch.l) * 0.38,
      y: branch.t + (bankSpots.branch.t - branch.t) * 0.38,
    }
    : null;
  const partialGestureConfig = {
    stone: stone ? { type: 'hold', from: { x: stone.l, y: stone.t } } : null,
    branch: branch && partialBranchTarget ? { type: 'drag', from: { x: branch.l, y: branch.t }, to: partialBranchTarget } : null,
    reed: reeds ? { type: 'swipe-right', from: { x: reeds.l, y: reeds.t } } : null,
  }[nextObstacleId];
  const branchHasOffset = branchDragActive || branchReturning;

  return (
    <div
      className={`nirv-game ${hideElements ? 'is-hidden' : ''} ${handPaused ? 'is-paused' : ''}`}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div ref={stageRef} className="nirv-stage" style={{ backgroundImage: `url(${sharedSceneBg})` }}>
        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={effLitCount}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={(syllable, index) => {
            stopSceneVoice?.();
            const isLast = index === SYLLABLES.length - 1;
            // Chain the NEXT obstacle's intro VO after THIS syllable finishes,
            // rather than triggering it off cleared.length in parallel — see
            // note above the obstacleIntroComplete fallback effect.
            const introObstacle = !isLast ? OBSTACLE_ORDER[index + 1] : null;
            const introKey = introObstacle ? OBSTACLE_INTRO_KEYS[introObstacle] : null;
            playSyllable?.(syllable, () => {
              if (isLast) {
                lastSyllableDoneRef.current = true;
                startCompletionVo();
                return;
              }
              if (introKey && playSceneLine) {
                // The hand is cued to the action word of the line ("Drag" / "Swipe"), not a guessed delay.
                playSceneLine(introKey, finishCurrentObstacleIntro, {
                  cue: getLineCue(introKey, () => setObstacleIntroVoStarted((current) => (
                    current[introObstacle] ? current : { ...current, [introObstacle]: true }
                  ))),
                });
              } else {
                if (introObstacle) {
                  setObstacleIntroVoStarted((current) => (
                    current[introObstacle] ? current : { ...current, [introObstacle]: true }
                  ));
                }
                finishCurrentObstacleIntro();
              }
            });
          }}
        />

        <div
          className="nirv-layer nirv-nest"
          style={{
            left: `${activeLayout.nest.l}%`,
            top: `${activeLayout.nest.t}%`,
            width: `${activeLayout.nest.w}%`,
            zIndex: 5,
            scale: activeLayout.nest.flip ? '-1 1' : '1 1',
          }}
        >
          <img src={nestImg} alt="nest" draggable={false} />
        </div>

        <div
          className={`nirv-layer nirv-turtle ${effSwimming ? 'is-swimming' : effPhase === 'play' ? 'nirv-breathe' : ''} ${isDone ? 'at-nest' : ''}`}
          style={{
            left: `${turtlePos.l}%`,
            top: `${turtlePos.t}%`,
            width: `${activeLayout.turtleWidth}%`,
            zIndex: 15,
            scale: activeLayout.turtleFlip ? '-1 1' : '1 1',
          }}
        >
          <PoseImage src={effPhase === 'play' ? turtleSadImg : turtleHappyImg} alt="turtle" draggable={false} />
        </div>

        <div
          className={`nirv-layer nirv-rock ${holdingRock ? 'is-holding' : ''} ${showCleared('stone') ? 'is-cleared' : ''} ${getObstacleFocusClass('stone')} ${phase === 'play' && nextObstacleId === 'stone' && hintLevel === 1 && !holdingRock ? 'is-hint-hold' : ''}`}
          style={{
            left: `${showCleared('stone') ? bankSpots.stone.l : stone.l}%`,
            top: `${showCleared('stone') ? bankSpots.stone.t : stone.t}%`,
            width: `${stone.w}%`,
            zIndex: showCleared('stone') ? 9 : 12,
            scale: stone.flip ? '-1 1' : '1 1',
            '--hold-progress': rockProgress,
          }}
          onPointerDown={startRockHold}
          onPointerUp={cancelRockHold}
          onPointerCancel={cancelRockHold}
          onPointerLeave={cancelRockHold}
        >
          <img src={stoneImg} alt="rock blocking the river" draggable={false} />
          {holdingRock && <div className="nirv-hold-ring" />}
        </div>

        {phase === 'play' && nextObstacleId === 'branch' && (
          <div
            className="nirv-bank-spot"
            style={{ left: `${bankSpots.branch.l}%`, top: `${bankSpots.branch.t}%`, width: `${branch.w}%` }}
          />
        )}

        {SHOW_HIT_ZONES && (
          <div
            style={{
              position: 'absolute',
              left: `${bankSpots.branch.l - BRANCH_DROP_RX}%`,
              top: `${bankSpots.branch.t - BRANCH_DROP_RY}%`,
              width: `${BRANCH_DROP_RX * 2}%`,
              height: `${BRANCH_DROP_RY * 2}%`,
              borderRadius: '50%',
              border: '2px solid rgba(255, 0, 90, 0.85)',
              background: 'rgba(255, 0, 90, 0.1)',
              pointerEvents: 'none',
              zIndex: 60,
            }}
            aria-hidden="true"
          />
        )}

        <div
          className={`nirv-layer nirv-branch ${branchDragActive ? 'is-dragging' : ''} ${branchReturning ? 'is-returning' : ''} ${branchWrongPulse ? 'is-wrong-drop' : ''} ${showCleared('branch') ? 'is-cleared' : ''} ${getObstacleFocusClass('branch')} ${phase === 'play' && nextObstacleId === 'branch' && hintLevel === 1 && !branchDragActive ? 'is-hint-drag' : ''}`}
          style={{
            left: `${showCleared('branch') ? bankSpots.branch.l : branch.l + (branchHasOffset ? dragOffset.x : 0)}%`,
            top: `${showCleared('branch') ? bankSpots.branch.t : branch.t + (branchHasOffset ? dragOffset.y : 0)}%`,
            width: `${branch.w}%`,
            zIndex: branchDragActive ? 30 : 12,
            scale: branch.flip ? '-1 1' : '1 1',
          }}
          onPointerDown={handleBranchPointerDown}
        >
          <img src={branchImg} alt="branch blocking the river" draggable={false} />
        </div>

        <div
          className={`nirv-layer nirv-reeds ${reedSwipeStart ? 'is-swiping' : ''} ${reedWrongPulse ? 'is-wrong-direction' : ''} ${showCleared('reed') ? 'is-open' : ''} ${getObstacleFocusClass('reed')} ${phase === 'play' && nextObstacleId === 'reed' && hintLevel === 1 && !reedSwipeStart ? 'is-hint-swipe' : ''}`}
          style={{
            left: `${reeds.l}%`,
            top: `${reeds.t}%`,
            width: `${reeds.w}%`,
            zIndex: 11,
            scale: reeds.flip ? '-1 1' : '1 1',
          }}
          onPointerDown={handleReedPointerDown}
        >
          <PoseImage
            src={showCleared('reed') || reedSwipeAmount >= REED_SWIPE_REQUIRED ? reedsOpenImg : reedsClosedImg}
            alt="reeds blocking the river"
            draggable={false}
          />
          {reedSwipeStart && !isCleared('reed') && (
            <div className="nirv-reed-progress">
              <div
                className="nirv-reed-progress-fill"
                style={{ transform: `scaleX(${Math.min(reedSwipeAmount / REED_SWIPE_REQUIRED, 1)})` }}
              />
            </div>
          )}
        </div>

        {/* Stone waits for the scene intro VO to actually start speaking
            before showing the first teaching gesture; branch/reed wait on
            their own obstacle intro VO starting the same way (chained after
            the preceding syllable), so the gesture never appears before the
            line naming that obstacle has begun. */}
        {fullGestureConfig && phase === 'play' && !showDebugPanel && !teachingComplete
          && (nextObstacleId === 'stone' ? stoneGestureReady : !!obstacleIntroVoStarted[nextObstacleId]) && (
          <GestureDemo
            key={`nirv-teach-${nextObstacleId}`}
            type={fullGestureConfig.type === 'hold' ? 'hold-progress-l3' : fullGestureConfig.type}
            from={fullGestureConfig.from}
            to={fullGestureConfig.to}
            active
            idleDelay={150}
            iterations={1}
            onComplete={() => setTeachingDoneFor(nextObstacleId)}
            onDismiss={() => setTeachingDoneFor(nextObstacleId)}
            paused={handPaused}
            zIndex={46}
          />
        )}

        {/* L2 — a partial gesture, not the full demo. */}
        {partialGestureConfig && phase === 'play' && !showDebugPanel && teachingComplete && hintLevel === 2 && (
          <GestureDemo
            key={`nirv-partial-${nextObstacleId}`}
            // Hold obstacles get a filling progress ring at L2 instead of
            // the plain teaching-demo ring, so L2 reads as "partway there".
            type={partialGestureConfig.type === 'hold' ? 'hold-progress-l2' : partialGestureConfig.type}
            from={partialGestureConfig.from}
            to={partialGestureConfig.to}
            active
            idleDelay={0}
            iterations={1}
            paused={handPaused}
            zIndex={46}
          />
        )}

        {/* L3 — the full rescue demo. */}
        {fullGestureConfig && phase === 'play' && !showDebugPanel && teachingComplete && hintLevel >= 3 && (
          <GestureDemo
            key={`nirv-rescue-${nextObstacleId}`}
            // Hold obstacles get a fully-filling progress ring at L3.
            type={fullGestureConfig.type === 'hold' ? 'hold-progress-l3' : fullGestureConfig.type}
            from={fullGestureConfig.from}
            to={fullGestureConfig.to}
            active
            idleDelay={0}
            iterations={1}
            paused={handPaused}
            zIndex={46}
          />
        )}

        {debugEnabled && (
          <div
            className="nirv-debug-panel"
            style={{
              position: 'absolute',
              left: `${debugPanelPosition.x}px`,
              top: `${debugPanelPosition.y}px`,
              right: 'auto',
              bottom: 'auto',
              maxHeight: showDebugPanel ? 'min(78vh, 620px)' : 'none',
              overflow: showDebugPanel ? 'auto' : 'visible',
            }}
          >
            <button
              type="button"
              className="nirv-debug-toggle"
              style={{ position: 'static', right: 'auto', bottom: 'auto', width: '100%' }}
              onClick={() => setShowDebugPanel((prev) => !prev)}
            >
              {showDebugPanel ? 'Hide Layout Debug' : 'Layout Debug'}
            </button>

            {showDebugPanel && (
              <div className="nirv-debug-body">
                <div
                  className="nirv-debug-drag-handle"
                  onPointerDown={startDebugPanelDrag}
                  onPointerMove={continueDebugPanelDrag}
                  onPointerUp={endDebugPanelDrag}
                  onPointerCancel={endDebugPanelDrag}
                >
                  Drag layout panel
                </div>

                <div className="nirv-debug-title">Nirvighnam Placement</div>

                <label className="nirv-debug-row">
                  <span>Phase</span>
                  <select value={debugPhase} onChange={(event) => setDebugPhase(Number(event.target.value))}>
                    {DEBUG_PHASE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <span />
                </label>

                <label className="nirv-debug-row">
                  <span>Element</span>
                  <select value={selectedDebugKey} onChange={(event) => setSelectedDebugKey(event.target.value)}>
                    {debugOptions.map((option) => (
                      <option key={option.key} value={option.key}>{option.label}</option>
                    ))}
                  </select>
                  <span />
                </label>

                {selectedDebugOption.fields.map((field) => (
                  <label className="nirv-debug-row" key={field}>
                    <span>{field}</span>
                    <input
                      type="range"
                      min={field === 'turtleWidth' || field === 'w' ? 1 : 0}
                      max={field === 'turtleWidth' || field === 'w' ? 30 : 100}
                      step="0.1"
                      value={getDebugValue(field)}
                      onChange={(event) => updateDebugValue(field, event.target.value)}
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={getDebugValue(field)}
                      onChange={(event) => updateDebugValue(field, event.target.value)}
                    />
                  </label>
                ))}

                {selectedDebugOption.fields.includes('l') && selectedDebugOption.fields.includes('t') && (
                  <div className="nirv-debug-grid">
                    <button type="button" onClick={() => nudgeDebugField('t', -0.5)}>up</button>
                    <button type="button" onClick={() => nudgeDebugField('l', -0.5)}>left</button>
                    <button type="button" onClick={() => nudgeDebugField('l', 0.5)}>right</button>
                    <button type="button" onClick={() => nudgeDebugField('t', 0.5)}>down</button>
                  </div>
                )}

                <div className="nirv-debug-actions">
                  <button type="button" onClick={copyDebugLayout}>Copy Layout</button>
                  <button
                    type="button"
                    onClick={() => {
                      window.localStorage.removeItem(NIRV_DEBUG_STORAGE_KEY);
                      const nextLayout = createDebugLayout();
                      setDebugLayout(nextLayout);
                      setTurtlePos(nextLayout.turtleStart);
                    }}
                  >
                    Reset
                  </button>
                </div>
                <pre>{JSON.stringify(activeLayout, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
