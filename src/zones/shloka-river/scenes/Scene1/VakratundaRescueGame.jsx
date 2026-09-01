import React, { useCallback, useEffect, useRef, useState } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './VakratundaRescueGame.css';

import frogSwim from './assets/images/vakratunda/frog-swim.webp';
import frogHappy from './assets/images/vakratunda/frog-happy.webp';
import frogFamily from './assets/images/vakratunda/frog-family-from-download.webp';
import lilypad from './assets/images/vakratunda/lilypad.webp';
import stoneImg from './assets/images/vakratunda/18.png';
import logPileImg from './assets/images/vakratunda/19.png';

const SYLLABLES = ['va', 'kra', 'tun', 'da'];
const AUDIO = { syllables: ['va', 'kra', 'tun', 'da'] };

const POS = {
  start: { l: 9.213056885480531, t: 52.61479616165161, w: 8.4 },
  reunionFrog: { w: 7.6 },
  family: { l: 78, t: 40, w: 14 },
};

const DEFAULT_ROUTE_NODES = [
  { x: 9.213056885480531, y: 52.61479616165161 },
  { x: 9.213056885480531, y: 52.349066734313965 },
  { x: 16.483901150928233, y: 36.67092025279999 },
  { x: 31.1251862331854, y: 33.747875690460205 },
  { x: 41.38405214815154, y: 34.677934646606445 },
  { x: 53.834124854159036, y: 65.90136289596558 },
  { x: 53.73452495167231, y: 65.76849818229675 },
  { x: 79.13267881245424, y: 60.98533272743225 },
];

const ROUTES = {
  trace: {
    nodes: DEFAULT_ROUTE_NODES,
    tolerance: 7.2,
    checkpointIndices: [2, 4, 6, 7],
    hintTargetIndex: 4,
  },
};

const DEFAULT_OBSTACLES = [
  {
    id: 'logpile',
    img: logPileImg,
    l: 60.40776756811631,
    t: 48.23023080825806,
    w: 25.2,
    z: 7,
    cls: 'vak-obstacle--logpile',
    hit: { x: 60.40776756811631, y: 48.23023080825806, rx: 12.6, ry: 12.2 },
  },
  {
    id: 'stone',
    img: stoneImg,
    l: 29.43197895457769,
    t: 48.628827929496765,
    w: 28.1,
    z: 7,
    cls: 'vak-obstacle--stone',
    hit: { x: 29.93197895457769, y: 49.628827929496765, rx: 11.7, ry: 10.5 },
  },
];

const TRACE_STROKE_LIMIT = 120;
const NODE_SNAP_DISTANCE = 5.8;
const OFF_PATH_GRACE = 2.5;
const RESUME_TOLERANCE_BONUS = 2.5;

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) {
    return { distance: Math.hypot(point.x - start.x, point.y - start.y), t: 0 };
  }

  const rawT = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);
  const t = Math.max(0, Math.min(1, rawT));
  const projX = start.x + dx * t;
  const projY = start.y + dy * t;
  return {
    distance: Math.hypot(point.x - projX, point.y - projY),
    t,
  };
}

function cloneObstacles() {
  return DEFAULT_OBSTACLES.map((obstacle) => ({
    ...obstacle,
    hit: { ...obstacle.hit },
  }));
}

function cloneRouteNodes() {
  return DEFAULT_ROUTE_NODES.map((node) => ({ ...node }));
}

function isPointInsideObstacle(point, obstacles) {
  return obstacles.some((obstacle) => {
    const { x, y, rx, ry } = obstacle.hit;
    const dx = (point.x - x) / rx;
    const dy = (point.y - y) / ry;
    return dx * dx + dy * dy <= 1;
  });
}

function buildPadsForRoute(route, phaseKey, uptoNodeIndex) {
  if (!route) return [];
  return route.checkpointIndices
    .filter((index) => index <= uptoNodeIndex)
    .map((index) => ({
      id: `${phaseKey}-${index}`,
      phase: phaseKey,
      nodeIndex: index,
      point: route.nodes[index],
    }));
}

export default function VakratundaRescueGame({
  isActive = false,
  hideElements = false,
  onMicroWin = () => {},
  onStageChange = () => {},
  onPhaseComplete = () => {},
  onGameComplete = () => {},
  voiceGuidance = {},
  isPaused = false,
}) {
  const { playVoice: playSceneLine, playSfx, playSyllable, playWord, stopVoice } = voiceGuidance;

  const [phase, setPhase] = useState('intro');
  const [litCount, setLitCount] = useState(0);
  const [committedPads, setCommittedPads] = useState([]);
  const [phasePads, setPhasePads] = useState([]);
  const [tracePoints, setTracePoints] = useState([]);
  const [isTracing, setIsTracing] = useState(false);
  const [activeSegment, setActiveSegment] = useState(0);
  const activeSegmentRef = useRef(0);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [frogHopPoint, setFrogHopPoint] = useState({ x: POS.start.l, y: POS.start.t });
  const [frogSnapping, setFrogSnapping] = useState(false);
  const [wrongPathPulse, setWrongPathPulse] = useState(false);
  const [familyBounce, setFamilyBounce] = useState(false);
  const [obstacles, setObstacles] = useState(() => cloneObstacles());
  const [routeNodes, setRouteNodes] = useState(() => cloneRouteNodes());
  const [familyPoint, setFamilyPoint] = useState({ x: POS.family.l, y: POS.family.t });
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showHitboxes, setShowHitboxes] = useState(false);
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 12, y: 96 });
  const [selectedObstacleId, setSelectedObstacleId] = useState(DEFAULT_OBSTACLES[0].id);
  const [selectedRouteNodeIndex, setSelectedRouteNodeIndex] = useState(0);
  const [layoutCopyStatus, setLayoutCopyStatus] = useState('');

  const stageRef = useRef(null);
  const debugDragRef = useRef(null);
  const debugPanelDragRef = useRef(null);
  const timers = useRef([]);
  const isPausedRef = useRef(isPaused);
  const vakHintVoiceRef = useRef({ phase: null, level: 0 });
  const wrongPulseTimeoutRef = useRef(null);
  const traceCompletedRef = useRef(false);

  // Progressive route help. The child meets each section with NOTHING drawn
  // ahead — not at game start, not when they start dragging. Discovery first,
  // then escalate only on genuine idle:
  //   ~2.5s idle -> soft glow ring at the next opening        (hintLevel 1)
  //   ~6s idle   -> short dotted curve for THIS section only  (hintLevel 2)
  //   ~11s idle  -> GestureDemo traces that section from the  (hintLevel 3)
  //                 frog's CURRENT position
  // The cycle restarts on real progress (checkpoint cleared), not on every
  // random touch, so repeated failed starts don't keep deferring the help.
  const { hintLevel, markInteraction } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'trace',
    stageKey: phase,
    initialDelay: 2500,
    pulseCountBeforeEscalation: 2,
    pulseInterval: 1600,
    level2Delay: 6000,
    level3Delay: 11000,
  });

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (wrongPulseTimeoutRef.current) {
      clearTimeout(wrongPulseTimeoutRef.current);
      wrongPulseTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
    if (isPaused) {
      setIsTracing(false);
      setCurrentPoint(null);
    }
  }, [isPaused]);

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

  const getPoint = useCallback((clientX, clientY) => {
    const stage = stageRef.current;
    if (!stage) return null;
    const rect = stage.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const showTraceWarning = useCallback(() => {
    setWrongPathPulse(true);

    if (wrongPulseTimeoutRef.current) {
      clearTimeout(wrongPulseTimeoutRef.current);
    }

    wrongPulseTimeoutRef.current = setTimeout(() => {
      setWrongPathPulse(false);
      wrongPulseTimeoutRef.current = null;
    }, 500);
  }, []);

  const resetState = useCallback(() => {
    clearTimers();
    traceCompletedRef.current = false;
    setPhase('intro');
    onStageChange('intro');
    setLitCount(0);
    setCommittedPads([]);
    setPhasePads([]);
    setTracePoints([]);
    setIsTracing(false);
    activeSegmentRef.current = 0;
    setActiveSegment(0);
    setCurrentPoint(null);
    setFrogHopPoint({ x: POS.start.l, y: POS.start.t });
    setFrogSnapping(false);
    setWrongPathPulse(false);
    setFamilyBounce(false);
    setObstacles((prev) => (prev.length ? prev : cloneObstacles()));
    setRouteNodes((prev) => (prev.length ? prev : cloneRouteNodes()));
    setFamilyPoint({ x: POS.family.l, y: POS.family.t });
  }, [clearTimers, onStageChange]);

  const startTraceCourse = useCallback(() => {
    setPhase('trace');
    onStageChange('trace');
    setCommittedPads([]);
    setPhasePads([]);
    setFrogHopPoint(routeNodes[0]);
    setFrogSnapping(false);
    playSceneLine?.('scene10_vak_intro');
  }, [onStageChange, playSceneLine, routeNodes]);

  useEffect(() => {
    if (!isActive) return;

    resetState();
    after(700, startTraceCourse);

    return clearTimers;
  }, [after, clearTimers, isActive, resetState, startTraceCourse]);

  const goToReunion = useCallback(() => {
    setPhase('reunion');
    onStageChange('reunion');
    setFrogHopPoint(routeNodes[routeNodes.length - 1]);
    setFrogSnapping(false);
    setFamilyBounce(true);
    playSfx?.('frogReunion');

    // Play the full word "vakratunda", then the completion VO — mirrors
    // Mahakaya/Suryakoti/Nirvighnam. Previously only the VO line played.
    let done = false;
    let voFallback;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(voFallback);
      onGameComplete?.();
      onPhaseComplete?.();
    };
    // Browser audio onended can silently drop (esp. iOS Safari) — don't hang.
    voFallback = setTimeout(finish, 8000);
    timers.current.push(voFallback);

    playWord?.('vakratunda', () => {
      playSceneLine?.('scene10_vak_crossed', finish, { stripLeadingText: 'Vakratunda' });
    });

    after(4200, () => setFamilyBounce(false));
  }, [after, onGameComplete, onPhaseComplete, onStageChange, playSceneLine, playSfx, playWord, routeNodes]);

  const completePhase = useCallback((phaseKey) => {
    traceCompletedRef.current = true;
    setIsTracing(false);
    setTracePoints([]);
    setCurrentPoint(null);
    setFrogSnapping(false);
    activeSegmentRef.current = 0;
    setActiveSegment(0);
    onMicroWin?.();
    stopVoice?.();

    if (phaseKey === 'trace') {
      const route = { ...ROUTES.trace, nodes: routeNodes };
      const finalPads = buildPadsForRoute(route, 'trace', route.nodes.length - 1);
      setCommittedPads(finalPads);
      setPhasePads([]);
      setFrogHopPoint(route.nodes[route.nodes.length - 1]);
      // va/kra/tun already lit + played live as their checkpoints (2/4/6) were
      // crossed while tracing. Jump straight to the last syllable instead of
      // resetting litCount to 1 and re-running the reveal ladder — that used
      // to replay kra/tun a second time before da.
      // goToReunion now fires from the last syllable's real onEnded (see
      // onSyllableLit below) instead of a guessed delay, so it no longer
      // races the 'da' syllable clip off the shared voice channel.
      setLitCount(4);
    }
  }, [onMicroWin, routeNodes, stopVoice]);

  const handleTraceMove = useCallback((point) => {
    const route = phase === 'trace' ? { ...ROUTES.trace, nodes: routeNodes } : ROUTES[phase];
    if (!route || !isTracing) return;

    const segmentIndex = activeSegmentRef.current;

    const segmentStart = route.nodes[segmentIndex];
    const segmentEnd = route.nodes[segmentIndex + 1];
    if (!segmentStart || !segmentEnd) return;

    if (isPointInsideObstacle(point, obstacles)) {
      showTraceWarning();
      return;
    }

    const segmentState = distanceToSegment(point, segmentStart, segmentEnd);
    if (segmentState.distance > route.tolerance) {
      if (segmentState.distance > route.tolerance + OFF_PATH_GRACE) {
        showTraceWarning();
      }

      return;
    }

    const projectedPoint = {
      x: segmentStart.x + (segmentEnd.x - segmentStart.x) * segmentState.t,
      y: segmentStart.y + (segmentEnd.y - segmentStart.y) * segmentState.t,
    };

    setCurrentPoint(projectedPoint);
    setTracePoints((prev) => {
      if (prev.length === 0) return [route.nodes[0], projectedPoint];
      const last = prev[prev.length - 1];
      if (distance(last, projectedPoint) < 0.7) return prev;
      const next = [...prev, projectedPoint];
      return next.length > TRACE_STROKE_LIMIT ? next.slice(next.length - TRACE_STROKE_LIMIT) : next;
    });

    const reachedNode =
      segmentState.t >= 0.86 || distance(projectedPoint, segmentEnd) <= NODE_SNAP_DISTANCE;

    if (!reachedNode) return;

    const reachedIndex = segmentIndex + 1;
    activeSegmentRef.current = reachedIndex;
    setActiveSegment(reachedIndex);
    // Cleared a checkpoint (went around an obstacle) — restart the hint cycle
    // so the next leg starts with no route drawn ahead and its own fresh beat.
    if (route.checkpointIndices.includes(reachedIndex)) {
      markInteraction();
    }
    const revealedPads = buildPadsForRoute(route, phase, reachedIndex);
    setPhasePads(revealedPads);
    setLitCount(revealedPads.length);
    setFrogHopPoint(route.nodes[reachedIndex]);
    setFrogSnapping(true);
    after(300, () => setFrogSnapping(false));

    if (reachedIndex >= route.nodes.length - 1) {
      completePhase(phase);
      return;
    }
  }, [after, completePhase, isTracing, markInteraction, obstacles, phase, routeNodes, showTraceWarning]);

  const beginTrace = useCallback((event) => {
    if (isPaused) return;
    const route = phase === 'trace' ? { ...ROUTES.trace, nodes: routeNodes } : ROUTES[phase];
    if (!route) return;

    const point = getPoint(event.clientX, event.clientY);
    if (!point) return;

    const segmentIndex = activeSegmentRef.current;
    const resumePoint = route.nodes[segmentIndex];
    const startTolerance = route.tolerance + RESUME_TOLERANCE_BONUS;
    if (distance(point, resumePoint) > startTolerance) {
      showTraceWarning();
      return;
    }

    // Note: no markInteraction() here. A random touch or a failed start must
    // not keep pushing back the idle-help timer — only real progress
    // (clearing a checkpoint, see handleTraceMove) restarts the hint cycle.
    traceCompletedRef.current = false;
    setWrongPathPulse(false);
    setIsTracing(true);
    setCurrentPoint(resumePoint);
    setFrogSnapping(false);
    setTracePoints([resumePoint]);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [getPoint, isPaused, phase, routeNodes, showTraceWarning]);

  const continueTrace = useCallback((event) => {
    if (!isTracing || isPaused) return;
    const point = getPoint(event.clientX, event.clientY);
    if (!point) return;
    handleTraceMove(point);
  }, [getPoint, handleTraceMove, isPaused, isTracing]);

  const endTrace = useCallback((event) => {
    if (isPaused) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    if (traceCompletedRef.current) {
      traceCompletedRef.current = false;
      return;
    }
    setIsTracing(false);
    setCurrentPoint(null);
    setTracePoints([]);
    setFrogSnapping(false);
  }, [isPaused]);

  useEffect(() => {
    vakHintVoiceRef.current = { phase, level: 0 };
  }, [phase]);

  useEffect(() => {
    if (!isActive) return;
    if (phase !== 'trace') return;
    if (hintLevel <= 0) return;

    const last = vakHintVoiceRef.current;
    if (last.phase === phase && last.level === hintLevel) return;

    vakHintVoiceRef.current = { phase, level: hintLevel };
    // Level 1 now carries the glow ring, so the "look for the glow" nudge
    // belongs here; level 2 surfaces the curve; level 3 is the gesture.
    if (hintLevel === 1) playSceneLine?.('hintLookForGlow');
    if (hintLevel >= 3) playSceneLine?.('hintKeepBuildingPath');
  }, [hintLevel, isActive, phase, playSceneLine]);

  if (!isActive) return null;

  const isTraceStep = phase === 'trace';
  const currentRoute = phase === 'trace' ? { ...ROUTES.trace, nodes: routeNodes } : ROUTES[phase];
  const targetIndex = currentRoute
    ? Math.min(activeSegment + 1, currentRoute.nodes.length - 1)
    : 0;
  const targetPoint = currentRoute?.nodes[targetIndex] ?? routeNodes[0];
  const startPoint = currentRoute?.nodes[0] ?? routeNodes[0];

  // The frog's CURRENT position on the route — every hint (ring, curve,
  // gesture) is anchored here, not at the original start, so help after the
  // rock demonstrates from where the frog actually is.
  const currentSegmentStart = currentRoute?.nodes[activeSegment] ?? startPoint;

  // Next opening/turn ahead — where "there may be a way here" is suggested.
  const guideCheckpointIndex = currentRoute
    ? (currentRoute.checkpointIndices.find((index) => index > activeSegment)
        ?? currentRoute.nodes.length - 1)
    : 0;

  const hintRingPoint = currentRoute?.nodes[guideCheckpointIndex] ?? targetPoint;
  const showGesture = isTraceStep && !isTracing && hintLevel >= 3;
  const showHintRing = isTraceStep && !isTracing && (hintLevel >= 1 || wrongPathPulse);

  // The dotted guide is drawn ONLY on real idle (hintLevel >= 2) and ONLY for
  // the current little section (frog's position -> next opening). Nothing is
  // drawn at game start or just because the child started dragging, and
  // already-completed sections are never redrawn.
  const revealLegAhead = hintLevel >= 2;
  const guideNodes = revealLegAhead && currentRoute
    ? currentRoute.nodes.slice(activeSegment, guideCheckpointIndex + 1)
    : [];
  const guidePath = guideNodes.map((point) => `${point.x},${point.y}`).join(' ');
  const gestureTargetPoint = hintRingPoint;
  const visiblePads = [...committedPads, ...phasePads];
  const debugPads = showDebugPanel && currentRoute
    ? currentRoute.checkpointIndices.map((index) => ({
        id: `debug-pad-${index}`,
        phase: phase || 'trace',
        nodeIndex: index,
        point: routeNodes[index],
      }))
    : [];
  const padsToRender = debugPads.length ? debugPads : visiblePads;
  const frogPoint =
    phase === 'reunion'
      ? familyPoint
      : isTraceStep
      ? (isTracing && currentPoint && !frogSnapping ? currentPoint : frogHopPoint)
      : routeNodes[0];
  const frogWidth = phase === 'reunion' ? POS.reunionFrog.w : POS.start.w;
  const selectedObstacle = obstacles.find((obstacle) => obstacle.id === selectedObstacleId) ?? obstacles[0];
  const selectedRouteNode = routeNodes[selectedRouteNodeIndex] ?? routeNodes[0];

  const copyLayoutJson = async () => {
    const payload = JSON.stringify({ routeNodes, obstacles, familyPoint }, null, 2);
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
        console.log('Vakratunda layout JSON:', payload);
        setLayoutCopyStatus('Logged');
      }
    }

    if (typeof window !== 'undefined') {
      window.setTimeout(() => setLayoutCopyStatus(''), 1600);
    }
  };

  const updateObstacle = (obstacleId, section, key, value) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return;

    setObstacles((prev) => prev.map((obstacle) => {
      if (obstacle.id !== obstacleId) return obstacle;
      if (section === 'root') {
        return { ...obstacle, [key]: numericValue };
      }
      return {
        ...obstacle,
        [section]: {
          ...obstacle[section],
          [key]: numericValue,
        },
      };
    }));
  };

  const updateRouteNode = (nodeIndex, key, value) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return;

    setRouteNodes((prev) => prev.map((node, index) => (
      index === nodeIndex ? { ...node, [key]: numericValue } : node
    )));

    if (nodeIndex === 0 && activeSegmentRef.current === 0) {
      setFrogHopPoint((prev) => ({ ...prev, [key]: numericValue }));
    }
  };

  const setRouteNodePoint = (nodeIndex, point) => {
    setRouteNodes((prev) => prev.map((node, index) => (
      index === nodeIndex ? { ...node, x: point.x, y: point.y } : node
    )));

    if (nodeIndex === 0 && activeSegmentRef.current === 0) {
      setFrogHopPoint(point);
    }
  };

  const moveObstacle = (obstacleId, point, hitOffset = { x: 0, y: 0 }) => {
    setObstacles((prev) => prev.map((obstacle) => (
      obstacle.id === obstacleId
        ? {
            ...obstacle,
            l: point.x,
            t: point.y,
            hit: {
              ...obstacle.hit,
              x: point.x + hitOffset.x,
              y: point.y + hitOffset.y,
            },
          }
        : obstacle
    )));
  };

  const moveObstacleHitbox = (obstacleId, point) => {
    setObstacles((prev) => prev.map((obstacle) => (
      obstacle.id === obstacleId
        ? {
            ...obstacle,
            hit: {
              ...obstacle.hit,
              x: point.x,
              y: point.y,
            },
          }
        : obstacle
    )));
  };

  const applyDebugDrag = (event) => {
    const drag = debugDragRef.current;
    if (!drag) return;

    const point = getPoint(event.clientX, event.clientY);
    if (!point) return;

    if (drag.type === 'routeNode') {
      setRouteNodePoint(drag.nodeIndex, point);
      setSelectedRouteNodeIndex(drag.nodeIndex);
      return;
    }

    if (drag.type === 'obstacle') {
      moveObstacle(drag.obstacleId, point, drag.hitOffset);
      setSelectedObstacleId(drag.obstacleId);
      return;
    }

    if (drag.type === 'obstacleHitbox') {
      moveObstacleHitbox(drag.obstacleId, point);
      setSelectedObstacleId(drag.obstacleId);
      return;
    }

    if (drag.type === 'family') {
      setFamilyPoint(point);
    }
  };

  const startDebugDrag = (event, drag) => {
    if (!showDebugPanel) return;
    event.preventDefault();
    event.stopPropagation();
    debugDragRef.current = drag;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    applyDebugDrag(event);
  };

  const continueDebugDrag = (event) => {
    if (!debugDragRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    applyDebugDrag(event);
  };

  const endDebugDrag = (event) => {
    if (!debugDragRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    debugDragRef.current = null;
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
    const panelHeight = showDebugPanel ? Math.min(window.innerHeight * 0.7, 512) : 48;
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

  const lyr = (p, w = p.w) => ({
    left: `${p.l}%`,
    top: `${p.t}%`,
    width: `${w}%`,
  });

  const padStyle = (point, width = 10.2) => ({
    left: `${point.x}%`,
    top: `${point.y}%`,
    width: `${width}%`,
  });

  const tracePath = tracePoints.length
    ? tracePoints.map((point) => `${point.x},${point.y}`).join(' ')
    : '';
  const routePath = routeNodes.map((point) => `${point.x},${point.y}`).join(' ');
  // Debug panel authors the whole route, so show all of it there; gameplay
  // only ever sees the progressively-revealed portion.
  const guideRenderPath = showDebugPanel ? routePath : guidePath;

  return (
    <div
      ref={stageRef}
      className={`vak-game ${hideElements ? 'is-hidden' : ''}`}
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={beginTrace}
      onPointerMove={continueTrace}
      onPointerUp={endTrace}
      onPointerCancel={endTrace}
    >
      {phase !== 'intro' && (
        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          dimIndices={[]}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={(syllable, index) => {
            stopVoice?.();
            if (index === SYLLABLES.length - 1) {
              playSyllable?.(syllable, () => goToReunion());
            } else {
              playSyllable?.(syllable);
            }
          }}
        />
      )}

      <svg className="vak-trace-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {isTraceStep && guideRenderPath && (
          <>
            <polyline className="vak-route-corridor" points={guideRenderPath} />
            <polyline className="vak-route-guide" points={guideRenderPath} />
          </>
        )}
        {tracePath && <polyline className="vak-trace-line vak-trace-line--glow" points={tracePath} />}
        {tracePath && <polyline className="vak-trace-line" points={tracePath} />}
      </svg>


        <div
          className={`vak-layer vak-start-frog ${phase === 'reunion' ? 'is-reunion' : ''} ${phase === 'reunion' && familyBounce ? 'is-bouncing' : ''} ${phase !== 'reunion' && isTraceStep && !isTracing ? 'is-waiting' : ''} ${wrongPathPulse ? 'is-shaking' : ''} ${frogSnapping ? 'is-snapping' : ''} ${showDebugPanel ? 'is-debug-draggable' : ''}`}
          style={{ left: `${frogPoint.x}%`, top: `${frogPoint.y}%`, width: `${frogWidth}%`, zIndex: 12 }}
          onPointerDown={(event) => startDebugDrag(event, { type: 'routeNode', nodeIndex: 0 })}
          onPointerMove={continueDebugDrag}
          onPointerUp={endDebugDrag}
          onPointerCancel={endDebugDrag}
        >
          <img src={litCount >= 4 ? frogHappy : frogSwim} alt="" />
        </div>

      {padsToRender.map((pad) => (
        <div
          key={pad.id}
          className={`vak-layer vak-pad is-revealed ${showDebugPanel ? 'is-debug-draggable is-debug-pad' : ''}`}
          style={{ ...padStyle(pad.point), zIndex: showDebugPanel ? 29 : 11 }}
          onPointerDown={(event) => startDebugDrag(event, { type: 'routeNode', nodeIndex: pad.nodeIndex })}
          onPointerMove={continueDebugDrag}
          onPointerUp={endDebugDrag}
          onPointerCancel={endDebugDrag}
        >
          <img src={lilypad} alt="" />
        </div>
      ))}

      <div
        className={`vak-layer vak-family-pad ${showDebugPanel ? 'is-debug-draggable' : ''}`}
        style={{ ...padStyle({ x: familyPoint.x, y: familyPoint.y + 3.6 }, 18), zIndex: 7 }}
        onPointerDown={(event) => startDebugDrag(event, { type: 'family' })}
        onPointerMove={continueDebugDrag}
        onPointerUp={endDebugDrag}
        onPointerCancel={endDebugDrag}
      >
        <img src={lilypad} alt="" />
      </div>

      <div
        className={`vak-layer vak-family ${familyBounce ? 'is-bouncing' : 'is-breathing'} ${showDebugPanel ? 'is-debug-draggable' : ''}`}
        style={{ left: `${familyPoint.x}%`, top: `${familyPoint.y}%`, width: `${POS.family.w}%`, zIndex: 8 }}
        onPointerDown={(event) => startDebugDrag(event, { type: 'family' })}
        onPointerMove={continueDebugDrag}
        onPointerUp={endDebugDrag}
        onPointerCancel={endDebugDrag}
      >
        <img src={frogFamily} alt="" />
      </div>

      {obstacles.map((obstacle) => (
        <React.Fragment key={obstacle.id}>
          <div
            className={`vak-layer vak-obstacle ${obstacle.cls} ${showDebugPanel ? 'is-debug-draggable' : ''}`}
            style={{ ...lyr(obstacle), zIndex: obstacle.z }}
            onPointerDown={(event) => startDebugDrag(event, {
              type: 'obstacle',
              obstacleId: obstacle.id,
              hitOffset: {
                x: obstacle.hit.x - obstacle.l,
                y: obstacle.hit.y - obstacle.t,
              },
            })}
            onPointerMove={continueDebugDrag}
            onPointerUp={endDebugDrag}
            onPointerCancel={endDebugDrag}
          >
            <img src={obstacle.img} alt="" />
          </div>
          {showDebugPanel && showHitboxes && (
            <div
              className="vak-layer vak-debug-hitbox"
              style={{
                left: `${obstacle.hit.x}%`,
                top: `${obstacle.hit.y}%`,
                width: `${obstacle.hit.rx * 2}%`,
                height: `${obstacle.hit.ry * 2}%`,
                zIndex: obstacle.z + 1,
              }}
              onPointerDown={(event) => startDebugDrag(event, { type: 'obstacleHitbox', obstacleId: obstacle.id })}
              onPointerMove={continueDebugDrag}
              onPointerUp={endDebugDrag}
              onPointerCancel={endDebugDrag}
            />
          )}
        </React.Fragment>
      ))}

      {showDebugPanel && routeNodes.map((node, index) => (
        <div
          key={`route-node-${index}`}
          className={`vak-layer vak-debug-route-node ${index === selectedRouteNodeIndex ? 'is-selected' : ''}`}
          style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: 30 }}
          onPointerDown={(event) => startDebugDrag(event, { type: 'routeNode', nodeIndex: index })}
          onPointerMove={continueDebugDrag}
          onPointerUp={endDebugDrag}
          onPointerCancel={endDebugDrag}
        >
          {index}
        </div>
      ))}


      {showHintRing && (
        <div
          className={`vak-layer vak-trace-target-ring ${wrongPathPulse ? 'is-warning' : ''}`}
          style={{ left: `${hintRingPoint.x}%`, top: `${hintRingPoint.y}%`, zIndex: 5 }}
        />
      )}




      <GestureDemo
        key={`vak-gesture-${phase}-${activeSegment}-${hintLevel}`}
        type="drag"
        from={{ x: currentSegmentStart.x, y: currentSegmentStart.y }}
        to={{ x: gestureTargetPoint.x, y: gestureTargetPoint.y }}
        active={showGesture}
        idleDelay={500}
      />
      <div
        className={`vak-debug-panel ${showDebugPanel ? 'is-open' : ''}`}
        style={{ left: `${debugPanelPosition.x}px`, top: `${debugPanelPosition.y}px` }}
        onPointerDown={(event) => event.stopPropagation()}
        onPointerMove={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="vak-debug-toggle"
          onClick={() => setShowDebugPanel((prev) => !prev)}
        >
          {showDebugPanel ? 'Hide Trace Debug' : 'Trace Debug'}
        </button>

        {showDebugPanel && selectedObstacle && (
          <div className="vak-debug-body">
            <div
              className="vak-debug-drag-handle"
              onPointerDown={startDebugPanelDrag}
              onPointerMove={continueDebugPanelDrag}
              onPointerUp={endDebugPanelDrag}
              onPointerCancel={endDebugPanelDrag}
            >
              Drag Panel
            </div>
            <div className="vak-debug-copy-row">
              <button
                type="button"
                className="vak-debug-copy"
                onClick={copyLayoutJson}
              >
                Copy Layout JSON
              </button>
              {layoutCopyStatus && (
                <span>{layoutCopyStatus}</span>
              )}
            </div>
            <div className="vak-debug-section-title">Obstacles</div>
            <p className="vak-debug-note">
              Hitbox is the invisible collision area. Keep it close to the object, but tune it for fair touch feedback.
            </p>
            <label className="vak-debug-row">
              <span>Obstacle</span>
              <select
                value={selectedObstacle.id}
                onChange={(event) => setSelectedObstacleId(event.target.value)}
              >
                {obstacles.map((obstacle) => (
                  <option key={obstacle.id} value={obstacle.id}>
                    {obstacle.id}
                  </option>
                ))}
              </select>
            </label>

            <label className="vak-debug-check">
              <input
                type="checkbox"
                checked={showHitboxes}
                onChange={(event) => setShowHitboxes(event.target.checked)}
              />
              <span>Show hitboxes</span>
            </label>

            {[
              ['Visual X', 'root', 'l', 0, 100, 0.1],
              ['Visual Y', 'root', 't', 0, 100, 0.1],
              ['Visual W', 'root', 'w', 4, 30, 0.1],
              ['Hit X', 'hit', 'x', 0, 100, 0.1],
              ['Hit Y', 'hit', 'y', 0, 100, 0.1],
              ['Hit RX', 'hit', 'rx', 1, 20, 0.1],
              ['Hit RY', 'hit', 'ry', 1, 20, 0.1],
            ].map(([label, section, key, min, max, step]) => {
              const source = section === 'root' ? selectedObstacle : selectedObstacle[section];
              return (
                <label key={`${section}-${key}`} className="vak-debug-row">
                  <span>{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={source[key]}
                    onChange={(event) => updateObstacle(selectedObstacle.id, section, key, event.target.value)}
                  />
                  <input
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={source[key]}
                    onChange={(event) => updateObstacle(selectedObstacle.id, section, key, event.target.value)}
                  />
                </label>
              );
            })}

            <div className="vak-debug-actions">
              <button
                type="button"
                className="vak-debug-reset"
                onClick={() => setObstacles(cloneObstacles())}
              >
                Reset Obstacles
              </button>
            </div>

            <div className="vak-debug-section-title">Path Line</div>
            <label className="vak-debug-row">
              <span>Node</span>
              <select
                value={selectedRouteNodeIndex}
                onChange={(event) => setSelectedRouteNodeIndex(Number(event.target.value))}
              >
                {routeNodes.map((node, index) => (
                  <option key={`node-option-${index}`} value={index}>
                    {index}: {node.x.toFixed(1)}, {node.y.toFixed(1)}
                  </option>
                ))}
              </select>
            </label>

            {selectedRouteNode && ([
              ['Node X', 'x', 0, 100, 0.1],
              ['Node Y', 'y', 0, 100, 0.1],
            ].map(([label, key, min, max, step]) => (
              <label key={`route-${key}`} className="vak-debug-row">
                <span>{label}</span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={selectedRouteNode[key]}
                  onChange={(event) => updateRouteNode(selectedRouteNodeIndex, key, event.target.value)}
                />
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={selectedRouteNode[key]}
                  onChange={(event) => updateRouteNode(selectedRouteNodeIndex, key, event.target.value)}
                />
              </label>
            )))}

            <div className="vak-debug-actions">
              <button
                type="button"
                className="vak-debug-reset"
                onClick={() => setRouteNodes(cloneRouteNodes())}
              >
                Reset Path
              </button>
            </div>

            <pre className="vak-debug-readout">
              {JSON.stringify({ routeNodes, obstacles, familyPoint }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
