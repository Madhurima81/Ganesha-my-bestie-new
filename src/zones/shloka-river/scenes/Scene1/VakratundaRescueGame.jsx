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
import reedImg from '../Scene3/assets/images/nirvighnam/reed.png';

const SYLLABLES = ['va', 'kra', 'tun', 'da'];
const AUDIO = { syllables: ['va', 'kra', 'tun', 'da'] };

const POS = {
  start: { l: 14, t: 52, w: 11 },
  vaDrift: { l: 45, t: 66, w: 11 },
  family: { l: 78, t: 40, w: 14 },
};

const ROUTES = {
  vaTry: {
    nodes: [
      { x: 14, y: 52 },
      { x: 22, y: 49 },
      { x: 31, y: 49 },
      { x: 40, y: 53 },
    ],
    tolerance: 5.6,
    checkpointIndices: [1, 2, 3],
    hintTargetIndex: 2,
  },
  kra: {
    nodes: [
      { x: 14, y: 52 },
      { x: 19, y: 44 },
      { x: 31, y: 44 },
      { x: 40, y: 48 },
      { x: 50, y: 47 },
    ],
    tolerance: 5.2,
    checkpointIndices: [1, 2, 4],
    hintTargetIndex: 2,
  },
  tun: {
    nodes: [
      { x: 50, y: 47 },
      { x: 56, y: 60 },
      { x: 68, y: 61 },
      { x: 78, y: 56 },
    ],
    tolerance: 5.1,
    checkpointIndices: [1, 2, 3],
    hintTargetIndex: 2,
  },
};

const OBSTACLES = [
  {
    id: 'logpile',
    img: logPileImg,
    l: 27.2,
    t: 62.8,
    w: 16.8,
    z: 7,
    cls: 'vak-obstacle--logpile',
    hit: { x: 27.2, y: 62.4, rx: 8.8, ry: 8.2 },
  },
  {
    id: 'stone',
    img: stoneImg,
    l: 54.8,
    t: 57.6,
    w: 17,
    z: 7,
    cls: 'vak-obstacle--stone',
    hit: { x: 54.8, y: 57.8, rx: 8.4, ry: 10.2 },
  },
  {
    id: 'reed',
    img: reedImg,
    l: 77,
    t: 34.8,
    w: 12,
    z: 6,
    cls: 'vak-obstacle--reed',
    hit: { x: 77, y: 35.2, rx: 5.8, ry: 10.6 },
  },
];

const TRACE_STROKE_LIMIT = 120;
const NODE_SNAP_DISTANCE = 4.6;
const VA_DRIFT_MS = 950;
const REUNION_DELAY_MS = 2200;

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

function isPointInsideObstacle(point) {
  return OBSTACLES.some((obstacle) => {
    const { x, y, rx, ry } = obstacle.hit;
    const dx = (point.x - x) / rx;
    const dy = (point.y - y) / ry;
    return dx * dx + dy * dy <= 1;
  });
}

function buildPadsForRoute(phaseKey, uptoNodeIndex) {
  const route = ROUTES[phaseKey];
  if (!route) return [];
  return route.checkpointIndices
    .filter((index) => index <= uptoNodeIndex)
    .map((index) => ({
      id: `${phaseKey}-${index}`,
      phase: phaseKey,
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
  const { playVoice: playSceneLine, playSfx, playWord, playSyllable, stopVoice } = voiceGuidance;

  const [phase, setPhase] = useState('intro');
  const [litCount, setLitCount] = useState(0);
  const [committedPads, setCommittedPads] = useState([]);
  const [phasePads, setPhasePads] = useState([]);
  const [tracePoints, setTracePoints] = useState([]);
  const [isTracing, setIsTracing] = useState(false);
  const [activeSegment, setActiveSegment] = useState(0);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [wrongPathPulse, setWrongPathPulse] = useState(false);
  const [familyBounce, setFamilyBounce] = useState(false);
  const [showFailedPad, setShowFailedPad] = useState(false);

  const stageRef = useRef(null);
  const timers = useRef([]);
  const isPausedRef = useRef(isPaused);
  const vakHintVoiceRef = useRef({ phase: null, level: 0 });
  const wrongPulseTimeoutRef = useRef(null);
  const traceCompletedRef = useRef(false);

  const { hintLevel, markInteraction } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && ['vaTry', 'kra', 'tun'].includes(phase),
    stageKey: phase,
    initialDelay: 9000,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 2400,
    level2Delay: 18000,
    level3Delay: 28000,
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

  const failTrace = useCallback(() => {
    traceCompletedRef.current = false;
    setIsTracing(false);
    setTracePoints([]);
    setCurrentPoint(null);
    setActiveSegment(0);
    setPhasePads([]);
    setWrongPathPulse(true);
    playSfx?.('tap');
    if (wrongPulseTimeoutRef.current) clearTimeout(wrongPulseTimeoutRef.current);
    wrongPulseTimeoutRef.current = setTimeout(() => {
      setWrongPathPulse(false);
      wrongPulseTimeoutRef.current = null;
    }, 700);
  }, [playSfx]);

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
    setActiveSegment(0);
    setCurrentPoint(null);
    setWrongPathPulse(false);
    setFamilyBounce(false);
    setShowFailedPad(false);
  }, [clearTimers, onStageChange]);

  const startStraightTry = useCallback(() => {
    setPhase('vaTry');
    onStageChange('vaTry');
    setCommittedPads([]);
    setPhasePads([]);
    playSceneLine?.('scene10_vak_intro');
  }, [onStageChange, playSceneLine]);

  useEffect(() => {
    if (!isActive) return;

    resetState();
    after(700, startStraightTry);

    return clearTimers;
  }, [after, clearTimers, isActive, resetState, startStraightTry]);

  const goToReunion = useCallback(() => {
    setPhase('reunion');
    onStageChange('reunion');
    setFamilyBounce(true);
    playSfx?.('frogReunion');
    playWord?.('vakratunda');
    playSceneLine?.('scene10_vak_crossed');
    after(600, () => setFamilyBounce(false));
    after(REUNION_DELAY_MS, () => {
      onGameComplete?.();
      onPhaseComplete?.();
    });
  }, [after, onGameComplete, onPhaseComplete, onStageChange, playSceneLine, playSfx, playWord]);

  const completePhase = useCallback((phaseKey) => {
    traceCompletedRef.current = true;
    setIsTracing(false);
    setTracePoints([]);
    setCurrentPoint(null);
    setActiveSegment(0);
    onMicroWin?.();
    stopVoice?.();

    if (phaseKey === 'vaTry') {
      setPhasePads(buildPadsForRoute('vaTry', ROUTES.vaTry.nodes.length - 1));
      after(250, () => {
        setPhase('vaFail');
        onStageChange('vaFail');
        setShowFailedPad(true);
        playSfx?.('currentPush');
      });
      after(250 + VA_DRIFT_MS, () => {
        playSceneLine?.('scene10_vak_current_too_strong');
        setLitCount(1);
        playSyllable?.(AUDIO.syllables[0]);
      });
      after(250 + VA_DRIFT_MS + 1100, () => {
        setPhase('kra');
        onStageChange('kra');
        setShowFailedPad(false);
        setCommittedPads([]);
        setPhasePads([]);
        playSceneLine?.('scene10_vak_choose');
      });
      return;
    }

    if (phaseKey === 'kra') {
      const finalKraPads = buildPadsForRoute('kra', ROUTES.kra.nodes.length - 1);
      setCommittedPads(finalKraPads);
      setPhasePads([]);
      setLitCount(2);
      playSyllable?.(AUDIO.syllables[1]);
      after(500, () => {
        setPhase('tun');
        onStageChange('tun');
      });
      return;
    }

    if (phaseKey === 'tun') {
      const finalTunPads = buildPadsForRoute('tun', ROUTES.tun.nodes.length - 1);
      setCommittedPads((prev) => [...prev, ...finalTunPads]);
      setPhasePads([]);
      setLitCount(3);
      playSyllable?.(AUDIO.syllables[2]);
      after(280, () => {
        setLitCount(4);
        playSyllable?.(AUDIO.syllables[3]);
      });
      after(560, goToReunion);
    }
  }, [after, goToReunion, onMicroWin, onStageChange, playSceneLine, playSfx, playSyllable, stopVoice]);

  const handleTraceMove = useCallback((point) => {
    const route = ROUTES[phase];
    if (!route || !isTracing) return;

    const segmentStart = route.nodes[activeSegment];
    const segmentEnd = route.nodes[activeSegment + 1];
    if (!segmentStart || !segmentEnd) return;

    if (isPointInsideObstacle(point)) {
      failTrace();
      return;
    }

    const segmentState = distanceToSegment(point, segmentStart, segmentEnd);
    if (segmentState.distance > route.tolerance) {
      failTrace();
      return;
    }

    setCurrentPoint(point);
    setTracePoints((prev) => {
      if (prev.length === 0) return [route.nodes[0], point];
      const last = prev[prev.length - 1];
      if (distance(last, point) < 1) return prev;
      const next = [...prev, point];
      return next.length > TRACE_STROKE_LIMIT ? next.slice(next.length - TRACE_STROKE_LIMIT) : next;
    });

    const reachedNode =
      segmentState.t >= 0.9 || distance(point, segmentEnd) <= NODE_SNAP_DISTANCE;

    if (!reachedNode) return;

    const reachedIndex = activeSegment + 1;
    setPhasePads(buildPadsForRoute(phase, reachedIndex));

    if (reachedIndex >= route.nodes.length - 1) {
      completePhase(phase);
      return;
    }

    setActiveSegment(reachedIndex);
  }, [activeSegment, completePhase, failTrace, isTracing, phase]);

  const beginTrace = useCallback((event) => {
    if (isPaused) return;
    const route = ROUTES[phase];
    if (!route) return;

    const point = getPoint(event.clientX, event.clientY);
    if (!point) return;

    const startNode = route.nodes[0];
    if (distance(point, startNode) > route.tolerance + 1.8) return;

    markInteraction();
    traceCompletedRef.current = false;
    setWrongPathPulse(false);
    setIsTracing(true);
    setActiveSegment(0);
    setCurrentPoint(point);
    setTracePoints([startNode, point]);
    setPhasePads([]);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [getPoint, isPaused, markInteraction, phase]);

  const continueTrace = useCallback((event) => {
    if (!isTracing || isPaused) return;
    const point = getPoint(event.clientX, event.clientY);
    if (!point) return;
    handleTraceMove(point);
  }, [getPoint, handleTraceMove, isPaused, isTracing]);

  const endTrace = useCallback((event) => {
    if (isPaused) return;
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {}
    if (traceCompletedRef.current) {
      traceCompletedRef.current = false;
      return;
    }
    if (isTracing) failTrace();
  }, [failTrace, isPaused, isTracing]);

  useEffect(() => {
    vakHintVoiceRef.current = { phase, level: 0 };
  }, [phase]);

  useEffect(() => {
    if (!isActive) return;
    if (!['vaTry', 'kra', 'tun'].includes(phase)) return;
    if (hintLevel <= 0) return;

    const last = vakHintVoiceRef.current;
    if (last.phase === phase && last.level === hintLevel) return;

    vakHintVoiceRef.current = { phase, level: hintLevel };
    if (hintLevel === 2) playSceneLine?.('hintLookForGlow');
    if (hintLevel >= 3) playSceneLine?.('hintKeepBuildingPath');
  }, [hintLevel, isActive, phase, playSceneLine]);

  if (!isActive) return null;

  const isTraceStep = ['vaTry', 'kra', 'tun'].includes(phase);
  const currentRoute = ROUTES[phase];
  const targetIndex = currentRoute
    ? Math.min(activeSegment + 1, currentRoute.nodes.length - 1)
    : 0;
  const targetPoint = currentRoute?.nodes[targetIndex] ?? ROUTES.vaTry.nodes[0];
  const startPoint = currentRoute?.nodes[0] ?? ROUTES.vaTry.nodes[0];
  const showGesture = isTraceStep && !isTracing && hintLevel >= 3;
  const showHintRing = isTraceStep && (hintLevel >= 2 || wrongPathPulse);
  const visiblePads = [...committedPads, ...phasePads];
  const frogPoint =
    phase === 'tun'
      ? ROUTES.tun.nodes[0]
      : phase === 'vaFail'
        ? ROUTES.vaTry.nodes[ROUTES.vaTry.nodes.length - 1]
        : ROUTES.vaTry.nodes[0];

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

  return (
    <div
      ref={stageRef}
      className={`vak-game ${hideElements ? 'is-hidden' : ''}`}
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={beginTrace}
      onPointerMove={continueTrace}
      onPointerUp={endTrace}
      onPointerCancel={endTrace}
      onPointerLeave={endTrace}
    >
      {phase !== 'intro' && (
        <SyllableHighlight
          syllables={SYLLABLES}
          litCount={litCount}
          dimIndices={phase === 'vaFail' || litCount === 1 ? [0] : []}
          audioSyllables={AUDIO.syllables}
          onSyllableLit={() => {}}
        />
      )}

      <svg className="vak-trace-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {tracePath && <polyline className="vak-trace-line vak-trace-line--glow" points={tracePath} />}
        {tracePath && <polyline className="vak-trace-line" points={tracePath} />}
      </svg>

      {phase !== 'reunion' && (
        <div
          className={`vak-layer vak-start-frog ${isTraceStep ? 'is-waiting' : ''} ${wrongPathPulse ? 'is-shaking' : ''}`}
          style={{ left: `${frogPoint.x}%`, top: `${frogPoint.y}%`, width: `${POS.start.w}%`, zIndex: 12 }}
        >
          <img src={litCount >= 3 ? frogHappy : frogSwim} alt="" />
        </div>
      )}

      {visiblePads.map((pad) => (
        <div
          key={pad.id}
          className={`vak-layer vak-pad ${pad.phase === 'vaTry' && phase === 'vaFail' ? 'is-drifting' : 'is-revealed'}`}
          style={{ ...padStyle(pad.point), zIndex: 11 }}
        >
          <img src={lilypad} alt="" />
        </div>
      ))}

      {showFailedPad && (
        <div
          className="vak-layer vak-pad vak-pad--failed is-drifting"
          style={{ ...lyr(POS.vaDrift, 10.2), zIndex: 10 }}
        >
          <img src={lilypad} alt="" />
        </div>
      )}

      <div
        className={`vak-layer vak-family ${familyBounce ? 'is-bouncing' : 'is-breathing'}`}
        style={{ ...lyr(POS.family), zIndex: 8 }}
      >
        <img src={frogFamily} alt="" />
      </div>

      {OBSTACLES.map((obstacle) => (
        <div
          key={obstacle.id}
          className={`vak-layer vak-obstacle ${obstacle.cls}`}
          style={{ ...lyr(obstacle), zIndex: obstacle.z }}
        >
          <img src={obstacle.img} alt="" />
        </div>
      ))}

      {(phase === 'vaTry' || phase === 'vaFail' || phase === 'kra' || phase === 'tun') && (
        <>
          <div className="vak-current-trail vak-current-trail--diagonal" aria-hidden="true" />
          <div className="vak-current-trail vak-current-trail--right" aria-hidden="true" />
          <div className="vak-current-arrow vak-current-arrow--down" aria-hidden="true">↘</div>
          <div className="vak-current-arrow vak-current-arrow--right" aria-hidden="true">→</div>
        </>
      )}

      {isTraceStep && (
        <div
          className={`vak-layer vak-trace-start-ring ${wrongPathPulse ? 'is-warning' : ''}`}
          style={{ left: `${startPoint.x}%`, top: `${startPoint.y}%`, zIndex: 9 }}
        />
      )}

      {showHintRing && (
        <div
          className={`vak-layer vak-trace-target-ring ${wrongPathPulse ? 'is-warning' : ''}`}
          style={{ left: `${targetPoint.x}%`, top: `${targetPoint.y}%`, zIndex: 5 }}
        />
      )}

      {currentPoint && isTracing && (
        <div
          className="vak-layer vak-trace-tip"
          style={{ left: `${currentPoint.x}%`, top: `${currentPoint.y}%`, zIndex: 15 }}
        />
      )}

      <GestureDemo
        key={`vak-gesture-${phase}-${hintLevel}`}
        type="drag"
        from={{ x: startPoint.x, y: startPoint.y }}
        to={{ x: targetPoint.x, y: targetPoint.y }}
        active={showGesture}
        idleDelay={500}
      />
    </div>
  );
}
