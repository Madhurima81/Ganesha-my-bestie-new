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

// ---------------------------------------------------------------------------
// FREE-PATH RESCUE
// The child drags the frog anywhere through the water and *creates* their own
// path — a wake trail plus stepping-stone lily pads drop wherever they go.
// Rocks and logs are solid: bumping one gives a soft "try another way" and the
// frog just stays put (keeps all progress, never resets to the bank).
// The 4 syllables light by how far across the river the frog has travelled.
// ---------------------------------------------------------------------------

const SYLLABLES = ['va', 'kra', 'tun', 'da'];
const AUDIO = { syllables: ['va', 'kra', 'tun', 'da'] };

const START_POS = { x: 9.21, y: 52.61 };
const FROG_W = 6.2;
const REUNION_FROG_W = 5.6;
const FAMILY = { x: 78, y: 40, w: 14 };

// X thresholds (in %) that light va / kra / tun as the frog passes them.
// 'da' lights on actually reaching the family, not just an X line.
const DEFAULT_BANDS_X = [24, 44, 62];

const FAMILY_WIN_RADIUS = 12;   // how close counts as "reached the family"
const GRAB_RADIUS = 15;         // must press near the frog to pick it up
const TRAIL_MIN_STEP = 1.0;     // ignore micro jitter when drawing the wake
const TRAIL_LIMIT = 200;        // cap wake points so the polyline stays cheap
const BLOCK_VO_COOLDOWN_MS = 4200;
const EDGE = { minX: 3, maxX: 96, minY: 6, maxY: 93 };

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));

const DEFAULT_OBSTACLES = [
  {
    id: 'logpile',
    img: logPileImg,
    l: 60.507367470603036,
    t: 49.79314687300702,
    w: 27.5,
    z: 7,
    cls: 'vak-obstacle--logpile',
    hit: { x: 60.507367470603036, y: 49.79314687300702, rx: 12.6, ry: 12.2 },
  },
  {
    id: 'stone',
    img: stoneImg,
    l: 33.8,
    t: 41.74094375298948,
    w: 30,
    z: 7,
    cls: 'vak-obstacle--stone',
    hit: { x: 34.414005843647054, y: 42.74094375298948, rx: 11.7, ry: 10.5 },
  },
];

function cloneObstacles() {
  return DEFAULT_OBSTACLES.map((obstacle) => ({
    ...obstacle,
    hit: { ...obstacle.hit },
  }));
}

function isPointInsideObstacle(point, obstacles) {
  return obstacles.some((obstacle) => {
    const { x, y, rx, ry } = obstacle.hit;
    const dx = (point.x - x) / rx;
    const dy = (point.y - y) / ry;
    return dx * dx + dy * dy <= 1;
  });
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
  const [pads, setPads] = useState([]);
  const [trailPoints, setTrailPoints] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [frogPos, setFrogPos] = useState(START_POS);
  const [frogSnapping, setFrogSnapping] = useState(false);
  const [blockPulse, setBlockPulse] = useState(false);
  const [familyBounce, setFamilyBounce] = useState(false);
  const [obstacles, setObstacles] = useState(() => cloneObstacles());
  const [bandsX, setBandsX] = useState(DEFAULT_BANDS_X);
  const [startPos, setStartPos] = useState(START_POS);   // frog start / reset spot
  const [frogW, setFrogW] = useState(FROG_W);            // frog width %
  const [familyPoint, setFamilyPoint] = useState({ x: FAMILY.x, y: FAMILY.y });
  const [familyW, setFamilyW] = useState(FAMILY.w);      // family width %
  const [introVoDone, setIntroVoDone] = useState(false);

  // Debug / layout authoring
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showHitboxes, setShowHitboxes] = useState(false);
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 12, y: 96 });
  const [selectedObstacleId, setSelectedObstacleId] = useState(DEFAULT_OBSTACLES[0].id);
  const [layoutCopyStatus, setLayoutCopyStatus] = useState('');

  const stageRef = useRef(null);
  const debugDragRef = useRef(null);
  const debugPanelDragRef = useRef(null);
  const timers = useRef([]);
  const isPausedRef = useRef(isPaused);
  const blockPulseTimeoutRef = useRef(null);
  const hasPlayedGlowVoRef = useRef(false);

  const frogPosRef = useRef(START_POS);
  const startPosRef = useRef(START_POS);   // authored frog start; kept in a ref so
  const litCountRef = useRef(0);           // resetState identity stays stable
  const maxProgressXRef = useRef(START_POS.x);
  const lastBlockVoRef = useRef(0);
  const reunionStartedRef = useRef(false);

  const setFrog = useCallback((point) => {
    frogPosRef.current = point;
    setFrogPos(point);
  }, []);

  const setLit = useCallback((count) => {
    litCountRef.current = count;
    setLitCount(count);
  }, []);

  // Debug authoring: move the frog's start spot and see it live.
  const moveStartPos = useCallback((patch) => {
    const next = { ...startPosRef.current, ...patch };
    startPosRef.current = next;
    setStartPos(next);
    setFrog(next);
  }, [setFrog]);

  // Idle-hint escalation (timed from the intro VO ending so the first hint's
  // line doesn't cancel the intro on the shared speech channel):
  //   L1 ~3s  -> drag GestureDemo only. Silent. "you can drag me".
  //   L2 ~8s  -> soft glow over the open water between the rocks + the
  //             "drag to the glow" line, ONCE for the whole game.
  //   L3 ~14s -> GestureDemo arcs all the way through that gap.
  const { hintLevel, markInteraction } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'trace' && introVoDone,
    stageKey: phase,
    initialDelay: 3000,
    pulseCountBeforeEscalation: 2,
    pulseInterval: 1800,
    level2Delay: 8000,
    level3Delay: 14000,
  });

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (blockPulseTimeoutRef.current) {
      clearTimeout(blockPulseTimeoutRef.current);
      blockPulseTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
    if (isPaused) setIsDragging(false);
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

  // Frog bumped a rock / log — gentle redirect, never a reset.
  const triggerBlock = useCallback(() => {
    setBlockPulse(true);
    if (blockPulseTimeoutRef.current) clearTimeout(blockPulseTimeoutRef.current);
    blockPulseTimeoutRef.current = setTimeout(() => {
      setBlockPulse(false);
      blockPulseTimeoutRef.current = null;
    }, 450);

    playSfx?.('softWrong');

    const now = Date.now();
    if (now - lastBlockVoRef.current > BLOCK_VO_COOLDOWN_MS) {
      lastBlockVoRef.current = now;
      playSceneLine?.('scene10_vak_current_too_strong');
    }
  }, [playSceneLine, playSfx]);

  const resetState = useCallback(() => {
    clearTimers();
    reunionStartedRef.current = false;
    setPhase('intro');
    onStageChange('intro');
    setLit(0);
    setPads([]);
    setTrailPoints([]);
    setIsDragging(false);
    setFrog(startPosRef.current);
    setFrogSnapping(false);
    setBlockPulse(false);
    setFamilyBounce(false);
    setObstacles((prev) => (prev.length ? prev : cloneObstacles()));
    // startPos / frogW / familyPoint / familyW are authoring values — keep
    // them across resets, like obstacles.
    setIntroVoDone(false);
    hasPlayedGlowVoRef.current = false;
    maxProgressXRef.current = startPosRef.current.x;
    lastBlockVoRef.current = 0;
  }, [clearTimers, onStageChange, setFrog, setLit]);

  const startTraceCourse = useCallback(() => {
    setPhase('trace');
    onStageChange('trace');
    setPads([]);
    setTrailPoints([]);
    setFrog(startPosRef.current);
    // Start the idle-hint clock only once this line finishes. Safety timer in
    // case the browser drops speechSynthesis 'end' (seen on iOS Safari).
    playSceneLine?.('scene10_vak_intro', () => setIntroVoDone(true));
    after(9000, () => setIntroVoDone(true));
  }, [after, onStageChange, playSceneLine, setFrog]);

  useEffect(() => {
    if (!isActive) return undefined;
    resetState();
    after(700, startTraceCourse);
    return clearTimers;
  }, [after, clearTimers, isActive, resetState, startTraceCourse]);

  const goToReunion = useCallback(() => {
    if (reunionStartedRef.current) return;
    reunionStartedRef.current = true;

    setPhase('reunion');
    onStageChange('reunion');
    setIsDragging(false);
    setFrog({ x: familyPoint.x, y: familyPoint.y });
    setFrogSnapping(false);
    setFamilyBounce(true);
    playSfx?.('frogReunion');

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
  }, [after, familyPoint, onGameComplete, onPhaseComplete, onStageChange, playSceneLine, playSfx, playWord, setFrog]);

  // One drag step: try to move the frog to `raw`. Blocked by obstacles; drops
  // wake + stepping stones on valid water; lights syllables by forward reach.
  const handleDragMove = useCallback((raw) => {
    if (!isDragging || isPausedRef.current) return;

    const point = {
      x: clamp(raw.x, EDGE.minX, EDGE.maxX),
      y: clamp(raw.y, EDGE.minY, EDGE.maxY),
    };

    if (isPointInsideObstacle(point, obstacles)) {
      triggerBlock();
      return; // frog holds at the last safe spot — no reset
    }

    const prev = frogPosRef.current;
    setFrog(point);

    setTrailPoints((tp) => {
      if (tp.length === 0) return [prev, point];
      if (distance(tp[tp.length - 1], point) < TRAIL_MIN_STEP) return tp;
      const next = [...tp, point];
      return next.length > TRAIL_LIMIT ? next.slice(next.length - TRAIL_LIMIT) : next;
    });

    // Forward progress is monotonic — backing up never un-lights a syllable.
    if (point.x > maxProgressXRef.current) maxProgressXRef.current = point.x;
    const maxX = maxProgressXRef.current;
    const reachedFamily = distance(point, familyPoint) <= FAMILY_WIN_RADIUS;

    let target = 0;
    if (maxX >= bandsX[0]) target = 1;
    if (maxX >= bandsX[1]) target = 2;
    if (maxX >= bandsX[2]) target = 3;
    if (reachedFamily) target = 4;

    if (target > litCountRef.current) {
      const nextLit = litCountRef.current + 1; // +1 per tick — reveal stays smooth
      setLit(nextLit);
      markInteraction(); // real progress resets the idle-hint clock
      // One lily pad per syllable earned — a stepping stone that MEANS
      // something, not a breadcrumb trail. Drops where the frog crossed;
      // the 4th lands at the family as 'da' completes the whole word.
      setPads((pd) => [...pd, { id: `pad-${nextLit}`, x: point.x, y: point.y }]);
      if (nextLit < 4) {
        setFrogSnapping(true);
        after(260, () => setFrogSnapping(false));
      } else {
        onMicroWin?.();
        // Reunion normally fires from the last syllable's audio onEnded
        // (SyllableHighlight below); this is the safety net if that drops.
        after(4000, goToReunion);
      }
    }
  }, [
    after, bandsX, familyPoint, goToReunion, isDragging, markInteraction,
    obstacles, onMicroWin, setFrog, setLit, triggerBlock,
  ]);

  const beginDrag = useCallback((event) => {
    if (isPaused || showDebugPanel) return;
    if (phase !== 'trace') return;
    const point = getPoint(event.clientX, event.clientY);
    if (!point) return;
    if (distance(point, frogPosRef.current) > GRAB_RADIUS) return; // must grab the frog
    setIsDragging(true);
    markInteraction();
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [getPoint, isPaused, markInteraction, phase, showDebugPanel]);

  const continueDrag = useCallback((event) => {
    if (!isDragging || isPaused) return;
    const point = getPoint(event.clientX, event.clientY);
    if (point) handleDragMove(point);
  }, [getPoint, handleDragMove, isDragging, isPaused]);

  const endDrag = useCallback((event) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    setIsDragging(false);
    // Trail, pads and frog position deliberately PERSIST — the path the child
    // has drawn stays on screen so they can pick up and continue.
  }, []);

  // Level 2 nudge: play the "drag to the glow" line once for the whole game.
  useEffect(() => {
    if (!isActive) return;
    if (phase !== 'trace') return;
    if (hintLevel < 2) return;
    if (hasPlayedGlowVoRef.current) return;
    hasPlayedGlowVoRef.current = true;
    playSceneLine?.('hintLookForGlow');
  }, [hintLevel, isActive, phase, playSceneLine]);

  if (!isActive) return null;

  const isPlaying = phase === 'trace';

  // A suggested opening: the open water just above the gap between the two
  // obstacles. Only ever a hint — there is no single "correct" route.
  const gapPoint = (() => {
    if (obstacles.length < 2) return { x: 45, y: 30 };
    const [a, b] = obstacles;
    const midX = (a.hit.x + b.hit.x) / 2;
    const topY = Math.min(a.hit.y - a.hit.ry, b.hit.y - b.hit.ry) - 7;
    return { x: midX, y: Math.max(EDGE.minY + 2, topY) };
  })();

  const showGesture = isPlaying && !isDragging && hintLevel >= 1;
  const showHintRing = isPlaying && !isDragging && (hintLevel >= 2 || blockPulse);

  // L1 gesture is a short nudge from the frog (teach the drag). L2+ points at
  // the glow over the open water.
  const gestureNudge = {
    x: frogPos.x + (gapPoint.x - frogPos.x) * 0.28,
    y: frogPos.y + (gapPoint.y - frogPos.y) * 0.28,
  };
  const gestureTo = hintLevel >= 2 ? gapPoint : gestureNudge;

  const frogRenderPos = phase === 'reunion' ? familyPoint : frogPos;
  const frogWidth = phase === 'reunion' ? frogW * (REUNION_FROG_W / FROG_W) : frogW;
  const selectedObstacle =
    obstacles.find((obstacle) => obstacle.id === selectedObstacleId) ?? obstacles[0];

  const copyLayoutJson = async () => {
    const payload = JSON.stringify({ obstacles, startPos, frogW, familyPoint, familyW, bandsX }, null, 2);
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
      if (section === 'root') return { ...obstacle, [key]: numericValue };
      return { ...obstacle, [section]: { ...obstacle[section], [key]: numericValue } };
    }));
  };

  const updateBand = (index, value) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return;
    setBandsX((prev) => prev.map((band, i) => (i === index ? numericValue : band)));
  };

  const moveObstacle = (obstacleId, point, hitOffset = { x: 0, y: 0 }) => {
    setObstacles((prev) => prev.map((obstacle) => (
      obstacle.id === obstacleId
        ? {
            ...obstacle,
            l: point.x,
            t: point.y,
            hit: { ...obstacle.hit, x: point.x + hitOffset.x, y: point.y + hitOffset.y },
          }
        : obstacle
    )));
  };

  const moveObstacleHitbox = (obstacleId, point) => {
    setObstacles((prev) => prev.map((obstacle) => (
      obstacle.id === obstacleId
        ? { ...obstacle, hit: { ...obstacle.hit, x: point.x, y: point.y } }
        : obstacle
    )));
  };

  const applyDebugDrag = (event) => {
    const drag = debugDragRef.current;
    if (!drag) return;

    const point = getPoint(event.clientX, event.clientY);
    if (!point) return;

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
      return;
    }
    if (drag.type === 'frogStart') {
      moveStartPos(point);
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

  const trailPath = trailPoints.length
    ? trailPoints.map((point) => `${point.x},${point.y}`).join(' ')
    : '';

  return (
    <div
      ref={stageRef}
      className={`vak-game ${hideElements ? 'is-hidden' : ''}`}
      onContextMenu={(event) => event.preventDefault()}
      onPointerDown={beginDrag}
      onPointerMove={continueDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
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
        {showDebugPanel && bandsX.map((band, index) => (
          <line
            key={`band-${index}`}
            className="vak-debug-band"
            x1={band}
            y1="0"
            x2={band}
            y2="100"
          />
        ))}
        {trailPath && <polyline className="vak-trace-line vak-trace-line--glow" points={trailPath} />}
        {trailPath && <polyline className="vak-trace-line" points={trailPath} />}
      </svg>

      {pads.map((pad) => (
        <div
          key={pad.id}
          className="vak-layer vak-pad is-revealed"
          style={{ ...padStyle(pad), zIndex: 11 }}
        >
          <img src={lilypad} alt="" />
        </div>
      ))}

      <div
        className={`vak-layer vak-start-frog ${phase === 'reunion' ? 'is-reunion' : ''} ${phase === 'reunion' && familyBounce ? 'is-bouncing' : ''} ${isPlaying && !isDragging ? 'is-waiting' : ''} ${blockPulse ? 'is-shaking' : ''} ${frogSnapping ? 'is-snapping' : ''} ${showDebugPanel ? 'is-debug-draggable' : ''}`}
        style={{ left: `${frogRenderPos.x}%`, top: `${frogRenderPos.y}%`, width: `${frogWidth}%`, zIndex: 12 }}
        onPointerDown={(event) => startDebugDrag(event, { type: 'frogStart' })}
        onPointerMove={continueDebugDrag}
        onPointerUp={endDebugDrag}
        onPointerCancel={endDebugDrag}
      >
        <img src={litCount >= 4 ? frogHappy : frogSwim} alt="" />
      </div>

      <div
        className={`vak-layer vak-family-pad ${showDebugPanel ? 'is-debug-draggable' : ''}`}
        style={{ ...padStyle({ x: familyPoint.x, y: familyPoint.y + 3.6 }, familyW * 1.28), zIndex: 7 }}
        onPointerDown={(event) => startDebugDrag(event, { type: 'family' })}
        onPointerMove={continueDebugDrag}
        onPointerUp={endDebugDrag}
        onPointerCancel={endDebugDrag}
      >
        <img src={lilypad} alt="" />
      </div>

      <div
        className={`vak-layer vak-family ${familyBounce ? 'is-bouncing' : 'is-breathing'} ${showDebugPanel ? 'is-debug-draggable' : ''}`}
        style={{ left: `${familyPoint.x}%`, top: `${familyPoint.y}%`, width: `${familyW}%`, zIndex: 8 }}
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

      {showHintRing && (
        <div
          className={`vak-layer vak-trace-target-ring ${blockPulse ? 'is-warning' : ''}`}
          style={{ left: `${gapPoint.x}%`, top: `${gapPoint.y}%`, zIndex: 5 }}
        />
      )}

      <GestureDemo
        key={`vak-gesture-${phase}-${litCount}-${hintLevel}`}
        type="drag"
        from={{ x: frogPos.x, y: frogPos.y }}
        to={{ x: gestureTo.x, y: gestureTo.y }}
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
              <button type="button" className="vak-debug-copy" onClick={copyLayoutJson}>
                Copy Layout JSON
              </button>
              {layoutCopyStatus && <span>{layoutCopyStatus}</span>}
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
                  <option key={obstacle.id} value={obstacle.id}>{obstacle.id}</option>
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

            <div className="vak-debug-section-title">Frog</div>
            <p className="vak-debug-note">
              Drag the frog on the canvas, or use these. X / Y = start &amp; reset spot, W = size.
            </p>
            {[
              ['Frog X', startPos.x, 2, 96, 0.1, (v) => moveStartPos({ x: v })],
              ['Frog Y', startPos.y, 4, 94, 0.1, (v) => moveStartPos({ y: v })],
              ['Frog W', frogW, 3, 16, 0.1, (v) => setFrogW(v)],
            ].map(([label, value, min, max, step, onValue]) => (
              <label key={label} className="vak-debug-row">
                <span>{label}</span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(event) => onValue(Number(event.target.value))}
                />
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(event) => onValue(Number(event.target.value))}
                />
              </label>
            ))}

            <div className="vak-debug-actions">
              <button
                type="button"
                className="vak-debug-reset"
                onClick={() => { moveStartPos({ ...START_POS }); setFrogW(FROG_W); }}
              >
                Reset Frog
              </button>
            </div>

            <div className="vak-debug-section-title">Frog family</div>
            <p className="vak-debug-note">
              Drag the family (or its pad) on the canvas, or use these. W scales the pad too.
            </p>
            {[
              ['Family X', familyPoint.x, 2, 98, 0.1, (v) => setFamilyPoint((p) => ({ ...p, x: v }))],
              ['Family Y', familyPoint.y, 4, 94, 0.1, (v) => setFamilyPoint((p) => ({ ...p, y: v }))],
              ['Family W', familyW, 6, 30, 0.1, (v) => setFamilyW(v)],
            ].map(([label, value, min, max, step, onValue]) => (
              <label key={label} className="vak-debug-row">
                <span>{label}</span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(event) => onValue(Number(event.target.value))}
                />
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(event) => onValue(Number(event.target.value))}
                />
              </label>
            ))}

            <div className="vak-debug-actions">
              <button
                type="button"
                className="vak-debug-reset"
                onClick={() => { setFamilyPoint({ x: FAMILY.x, y: FAMILY.y }); setFamilyW(FAMILY.w); }}
              >
                Reset Family
              </button>
            </div>

            <div className="vak-debug-section-title">Syllable bands (X %)</div>
            <p className="vak-debug-note">
              va / kra / tun light as the frog first passes these X lines. da lights on reaching the family.
            </p>
            {bandsX.map((band, index) => (
              <label key={`band-row-${index}`} className="vak-debug-row">
                <span>{SYLLABLES[index]}</span>
                <input
                  type="range"
                  min={5}
                  max={90}
                  step={0.5}
                  value={band}
                  onChange={(event) => updateBand(index, event.target.value)}
                />
                <input
                  type="number"
                  min={5}
                  max={90}
                  step={0.5}
                  value={band}
                  onChange={(event) => updateBand(index, event.target.value)}
                />
              </label>
            ))}

            <div className="vak-debug-actions">
              <button
                type="button"
                className="vak-debug-reset"
                onClick={() => setBandsX(DEFAULT_BANDS_X)}
              >
                Reset Bands
              </button>
            </div>

            <pre className="vak-debug-readout">
              {JSON.stringify({ obstacles, startPos, frogW, familyPoint, familyW, bandsX }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
