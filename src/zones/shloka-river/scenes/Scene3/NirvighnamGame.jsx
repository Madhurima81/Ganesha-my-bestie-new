import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
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
const BRANCH_DROP_RADIUS = 13;
const REED_SWIPE_REQUIRED = 58;
const NIRV_DEBUG_STORAGE_KEY = 'shloka_nirvighnam_layout_debug_v2';

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
    console.warn('Unable to load Nirvighnam layout debug values:', error);
    return fallback;
  }
};

const obstacleImageById = {
  stone: stoneImg,
  branch: branchImg,
  reed: reedsClosedImg,
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

export default function NirvighnamGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  voiceGuidance = {},
  isPaused = false,
}) {
  const { playVoice: playSceneLine, playSyllable, playWord, stopVoice: stopSceneVoice } = voiceGuidance;
  const debugEnabled = getDebugEnabled();
  const defaultLayout = useMemo(createDebugLayout, []);
  const [debugLayout, setDebugLayout] = useState(loadDebugLayout);
  const [showDebugPanel, setShowDebugPanel] = useState(debugEnabled);
  const [selectedDebugKey, setSelectedDebugKey] = useState(debugOptions[0].key);
  const [debugPhase, setDebugPhase] = useState(0);
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 16, y: 16 });
  const [phase, setPhase] = useState('play');
  const [cleared, setCleared] = useState([]);
  const [litCount, setLitCount] = useState(0);
  const [turtlePos, setTurtlePos] = useState(() => loadDebugLayout().turtleStart);
  const [isSwimming, setIsSwimming] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [holdingRock, setHoldingRock] = useState(false);
  const [rockProgress, setRockProgress] = useState(0);
  const [reedSwipeStart, setReedSwipeStart] = useState(null);
  const [reedSwipeAmount, setReedSwipeAmount] = useState(0);

  const stageRef = useRef(null);
  const dragStartRef = useRef(null);
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
  const { hintLevel, markInteraction } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'play',
    stageKey: phase === 'play' ? `clear-${cleared.length}` : phase,
    initialDelay: 8000,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: 15000,
    level3Delay: 22000,
  });

  const clearTimers = useCallback(() => {
    if (rockProgressRef.current) {
      window.clearInterval(rockProgressRef.current);
      rockProgressRef.current = null;
    }
    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (voFallbackRef.current) {
      window.clearTimeout(voFallbackRef.current);
      voFallbackRef.current = null;
    }
    if (sylEndFallbackRef.current) {
      window.clearTimeout(sylEndFallbackRef.current);
      sylEndFallbackRef.current = null;
    }
  }, []);

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
      setDragOffset({ x: 0, y: 0 });
      setHoldingRock(false);
      setRockProgress(0);
      setReedSwipeStart(null);
      setReedSwipeAmount(0);
      dragOffsetRef.current = { x: 0, y: 0 };
      dragStartRef.current = null;
      phaseRef.current = 'play';
      doneAnnouncedRef.current = false;
      successVoDoneRef.current = false;
      swimDoneRef.current = false;
      completionScheduledRef.current = false;
      lastSyllableDoneRef.current = false;
      completionVoStartedRef.current = false;
    }
  }, [activeLayout.turtleStart, clearTimers, isActive]);

  useEffect(() => {
    if (isPaused) {
      if (rockProgressRef.current) {
        window.clearInterval(rockProgressRef.current);
        rockProgressRef.current = null;
      }
      setHoldingRock(false);
      if (!isCleared('stone')) setRockProgress(0);
      setDragging(null);
      setDragOffset({ x: 0, y: 0 });
      dragOffsetRef.current = { x: 0, y: 0 };
      dragStartRef.current = null;
      setReedSwipeStart(null);
      if (!isCleared('reed')) setReedSwipeAmount(0);
    }
  }, [isCleared, isPaused]);

  useEffect(() => {
    if (!isActive || phase !== 'play') return;
    // The debug Phase selector owns turtlePos while the panel is open.
    if (debugEnabled && showDebugPanel) return;

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
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
      transitionTimerRef.current = window.setTimeout(() => {
        setPhase('swim');
      }, 420);
    }
  }, [activeLayout.turtleStart, cleared.length, isActive, phase, turtleNodes, debugEnabled, showDebugPanel]);

  const startRockHold = useCallback((event) => {
    if (phaseRef.current !== 'play' || isPaused) return;
    if (nextObstacleId !== 'stone' || isCleared('stone')) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    stopSceneVoice?.();
    markInteraction();

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

      if (progress >= 1) {
        window.clearInterval(rockProgressRef.current);
        rockProgressRef.current = null;
        setHoldingRock(false);
        setRockProgress(1);
        clearObstacle('stone');
      }
    }, 30);
  }, [clearObstacle, isCleared, isPaused, markInteraction, nextObstacleId, stopSceneVoice]);

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
    if (nextObstacleId !== 'branch' || isCleared('branch')) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    stopSceneVoice?.();
    markInteraction();

    dragStartRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
    };
    setDragging('branch');
    setDragOffset({ x: 0, y: 0 });
    dragOffsetRef.current = { x: 0, y: 0 };
  }, [isCleared, isPaused, markInteraction, nextObstacleId, stopSceneVoice]);

  useEffect(() => {
    if (dragging !== 'branch' || !isActive) return;

    const handleMove = (event) => {
      if (!dragStartRef.current || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const dx = ((event.clientX - dragStartRef.current.clientX) / rect.width) * 100;
      const dy = ((event.clientY - dragStartRef.current.clientY) / rect.height) * 100;
      dragOffsetRef.current = { x: dx, y: dy };
      setDragOffset({ x: dx, y: dy });
    };

    const handleUp = () => {
      const branch = obstacles.find((obstacle) => obstacle.id === 'branch');
      if (!branch) return;

      const currentL = branch.l + dragOffsetRef.current.x;
      const currentT = branch.t + dragOffsetRef.current.y;
      const distanceToBank = Math.hypot(
        currentL - bankSpots.branch.l,
        currentT - bankSpots.branch.t
      );

      if (distanceToBank < BRANCH_DROP_RADIUS) {
        clearObstacle('branch');
      } else {
        setDragOffset({ x: 0, y: 0 });
        dragOffsetRef.current = { x: 0, y: 0 };
      }

      setDragging(null);
      dragStartRef.current = null;
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [bankSpots.branch.l, bankSpots.branch.t, clearObstacle, dragging, isActive, obstacles]);

  const handleReedPointerDown = useCallback((event) => {
    if (phaseRef.current !== 'play' || isPaused) return;
    if (nextObstacleId !== 'reed' || isCleared('reed')) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    stopSceneVoice?.();
    markInteraction();

    setReedSwipeStart({ x: event.clientX, y: event.clientY });
    setReedSwipeAmount(0);
  }, [isCleared, isPaused, markInteraction, nextObstacleId, stopSceneVoice]);

  useEffect(() => {
    if (!reedSwipeStart || !isActive) return;

    const handleMove = (event) => {
      const dx = event.clientX - reedSwipeStart.x;
      const dy = event.clientY - reedSwipeStart.y;
      if (Math.abs(dx) < Math.abs(dy)) return;
      setReedSwipeAmount(Math.min(Math.abs(dx), REED_SWIPE_REQUIRED));
    };

    const handleUp = () => {
      if (reedSwipeAmount >= REED_SWIPE_REQUIRED) {
        clearObstacle('reed');
      }
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
  }, [clearObstacle, isActive, isCleared, reedSwipeAmount, reedSwipeStart]);

  const completeAfterSuccess = useCallback(() => {
    if (!successVoDoneRef.current || !swimDoneRef.current || completionScheduledRef.current) return;
    completionScheduledRef.current = true;
    window.setTimeout(() => {
      onGameCompleteRef.current?.();
      onPhaseCompleteRef.current?.();
    }, 500);
  }, []);

  // Completion audio plays strictly in sequence, no overlap:
  //   final syllable "nam"  ->  full word "nirvighnam"  ->  ending line
  // Fires only once both the last syllable has finished AND the swim has begun.
  const startCompletionVo = useCallback(() => {
    if (completionVoStartedRef.current) return;
    if (!lastSyllableDoneRef.current || !doneAnnouncedRef.current) return;
    completionVoStartedRef.current = true;

    if (sylEndFallbackRef.current) {
      window.clearTimeout(sylEndFallbackRef.current);
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

    voFallbackRef.current = window.setTimeout(() => {
      if (!successVoDoneRef.current) {
        successVoDoneRef.current = true;
        completeAfterSuccess();
      }
    }, 10000);
  }, [completeAfterSuccess, playSceneLine, playWord]);

  useEffect(() => {
    if (phase !== 'swim' || doneAnnouncedRef.current) return;
    doneAnnouncedRef.current = true;
    const timers = [];

    setIsSwimming(true);

    // Don't start the word/ending line yet — wait for the final "nam" syllable
    // to finish (its playSyllable onEnded sets lastSyllableDoneRef). Guard with
    // a fallback in case that callback never fires (audio error / iOS).
    sylEndFallbackRef.current = window.setTimeout(() => {
      lastSyllableDoneRef.current = true;
      startCompletionVo();
    }, 1600);
    startCompletionVo();

    swimPath.forEach((waypoint, index) => {
      const hopTimer = window.setTimeout(() => {
        setTurtlePos(waypoint);
        if (index === swimPath.length - 1) {
          const settleTimer = window.setTimeout(() => {
            setIsSwimming(false);
            swimDoneRef.current = true;
            setPhase('done');
            completeAfterSuccess();
          }, 550);
          timers.push(settleTimer);
        }
      }, index * 580);
      timers.push(hopTimer);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [completeAfterSuccess, phase, startCompletionVo, swimPath]);

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
  const hintCopyByObstacle = {
    stone: ['Press and hold the rock.', 'Hold the rock to move it aside.', 'Keep holding until it rolls away.'],
    branch: ['Drag the branch to the bank.', 'Move the branch out of the water.', 'Pull the branch fully aside.'],
    reed: ['Swipe the reeds apart.', 'Open the reeds with a side swipe.', 'Swipe wide to clear the reeds.'],
  };
  const activeHintSet = hintCopyByObstacle[nextObstacleId] || ['Clear the path.', 'Keep clearing the path.', 'Almost there.'];
  const hintText = hintLevel <= 1 ? activeHintSet[0] : hintLevel === 2 ? activeHintSet[1] : activeHintSet[2];

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

    console.log('Nirvighnam layout JSON:', payload);
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

  const gestureConfig = {
    stone: stone ? { type: 'hold', from: { x: stone.l, y: stone.t } } : null,
    branch: branch ? { type: 'drag', from: { x: branch.l, y: branch.t }, to: { x: bankSpots.branch.l, y: bankSpots.branch.t } } : null,
    reed: reeds ? { type: 'swipe-right', from: { x: reeds.l, y: reeds.t } } : null,
  }[nextObstacleId];

  return (
    <div
      className={`nirv-game ${hideElements ? 'is-hidden' : ''}`}
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
            playSyllable?.(syllable, isLast ? () => {
              lastSyllableDoneRef.current = true;
              startCompletionVo();
            } : undefined);
          }}
        />

        {phase === 'play' && <p className="nirv-hint">{hintText}</p>}

        {isDone && (
          <p className="nirv-doneline">
            You cleared the path! The turtle reached her nest!
          </p>
        )}

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
          <img src={effPhase === 'play' ? turtleSadImg : turtleHappyImg} alt="turtle" draggable={false} />
        </div>

        <div
          className={`nirv-layer nirv-rock ${holdingRock ? 'is-holding' : ''} ${showCleared('stone') ? 'is-cleared' : ''} ${phase === 'play' && nextObstacleId === 'stone' && hintLevel >= 1 ? 'pulse' : ''} ${phase === 'play' && nextObstacleId === 'stone' && hintLevel >= 2 ? 'hint-glow' : ''}`}
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

        <div
          className={`nirv-layer nirv-branch ${dragging === 'branch' ? 'is-dragging' : ''} ${showCleared('branch') ? 'is-cleared' : ''} ${phase === 'play' && nextObstacleId === 'branch' && hintLevel >= 1 ? 'pulse' : ''} ${phase === 'play' && nextObstacleId === 'branch' && hintLevel >= 2 ? 'hint-glow' : ''}`}
          style={{
            left: `${showCleared('branch') ? bankSpots.branch.l : branch.l + (dragging === 'branch' ? dragOffset.x : 0)}%`,
            top: `${showCleared('branch') ? bankSpots.branch.t : branch.t + (dragging === 'branch' ? dragOffset.y : 0)}%`,
            width: `${branch.w}%`,
            zIndex: dragging === 'branch' ? 30 : 12,
            scale: branch.flip ? '-1 1' : '1 1',
          }}
          onPointerDown={handleBranchPointerDown}
        >
          <img src={branchImg} alt="branch blocking the river" draggable={false} />
        </div>

        <div
          className={`nirv-layer nirv-reeds ${reedSwipeStart ? 'is-swiping' : ''} ${showCleared('reed') ? 'is-open' : ''} ${phase === 'play' && nextObstacleId === 'reed' && hintLevel >= 1 ? 'pulse' : ''} ${phase === 'play' && nextObstacleId === 'reed' && hintLevel >= 2 ? 'hint-glow' : ''}`}
          style={{
            left: `${reeds.l}%`,
            top: `${reeds.t}%`,
            width: `${reeds.w}%`,
            zIndex: 11,
            scale: reeds.flip ? '-1 1' : '1 1',
          }}
          onPointerDown={handleReedPointerDown}
        >
          <img
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

        {gestureConfig && (
          <GestureDemo
            key={nextObstacleId}
            type={gestureConfig.type}
            from={gestureConfig.from}
            to={gestureConfig.to}
            active={phase === 'play' && !showDebugPanel}
            idleDelay={3000}
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
