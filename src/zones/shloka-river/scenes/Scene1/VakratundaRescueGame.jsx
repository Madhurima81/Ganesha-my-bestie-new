import React, { useCallback, useEffect, useRef, useState } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import './VakratundaRescueGame.css';

import frogSwim from './assets/images/vakratunda/frog-baby.webp';
import frogHappy from './assets/images/vakratunda/frog-happy.webp';
import frogFamily from './assets/images/vakratunda/frog-family-from-download.webp';
import lilypad from './assets/images/vakratunda/lilypad.webp';
import stoneImg from './assets/images/vakratunda/18.png';
import logPileImg from './assets/images/vakratunda/19.png';
import reedsImg from './assets/images/vakratunda/reeds.webp';

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

const START_POS = { x: 15.5, y: 72 };
const FROG_W = 6;
const REUNION_FROG_W = 5.4;
const FAMILY = { x: 88, y: 42, w: 14 };

// X thresholds (in %) that light va / kra / tun as the frog passes them.
// 'da' lights on actually reaching the family, not just an X line.
const DEFAULT_BANDS_X = [24, 44, 62];

const FAMILY_WIN_RADIUS = 12;   // how close counts as "reached the family"
const GRAB_RADIUS = 15;         // must press near the frog to pick it up
const TRAIL_MIN_STEP = 1.0;     // ignore micro jitter when drawing the wake
const TRAIL_LIMIT = 200;        // cap wake points so the polyline stays cheap
const BLOCK_SFX_COOLDOWN_MS = 500;   // throttle the soft "nope" bump SFX
const EDGE = { minX: 3, maxX: 96, minY: 6, maxY: 93 };

// Reactive "stuck" hint: only fires after repeated bumps with no forward
// progress — a child who is exploring calmly triggers nothing.
const STUCK_BUMPS = 3;           // bumps (no progress) before the shimmer shows
const STUCK_PROGRESS_EPS = 3;    // % of new forward progress that counts as unstuck
const STUCK_L2_MS = 6000;        // shimmer -> shimmer + VO
const STUCK_L3_MS = 12000;       // -> shimmer + short arc toward the opening

// The frog can only be dragged INSIDE this shape — the river channel, with a
// bay cut into the near bank at the frog's start and another at the family's
// pad. Outside it is land: the drag holds at the last water point. Authored
// live in the Trace Debug panel ("Water area"); these are just the seed points
// (clockwise, % of the stage).
const DEFAULT_WATER_POLY = [
  { x: 3, y: 42 },
  { x: 70.77, y: 39.1 },
  { x: 80.63, y: 38.41 },
  { x: 98.65, y: 43.27 },
  { x: 96.66, y: 98.8 },
  { x: 77.74, y: 90.19 },
  { x: 52.94, y: 70.62 },
  { x: 37, y: 71.87 },
  { x: 25.25, y: 66.18 },
  { x: 15.29, y: 64.51 },
  { x: 9.01, y: 61.59 },
  { x: 3, y: 58 },
];

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));

// Ray-casting point-in-polygon. poly is a list of {x,y} in the same units.
function isPointInPolygon(point, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const straddles = (yi > point.y) !== (yj > point.y);
    if (straddles && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Nearest patch of clear, open water around `from` — in the water polygon, not
// inside any obstacle — biased toward the family (higher x). Used to place the
// stuck-hint shimmer right where the child is stuck, not at a fixed point.
function findNearbyOpening(from, obstacles, poly, familyX) {
  let best = null;
  let bestScore = -Infinity;
  for (let r = 8; r <= 26; r += 3) {
    for (let deg = 0; deg < 360; deg += 15) {
      const a = (deg * Math.PI) / 180;
      const p = { x: from.x + Math.cos(a) * r, y: from.y + Math.sin(a) * r };
      if (!isPointInPolygon(p, poly)) continue;
      if (isPointInsideObstacle(p, obstacles)) continue;
      // Prefer forward (toward family) and a gentle, not-too-vertical hop.
      const forward = Math.sign(familyX - from.x) * (p.x - from.x);
      const score = forward * 2 - Math.abs(p.y - from.y) * 0.4 - r * 0.15;
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }
    if (best) return best;
  }
  return best;
}

const DEFAULT_OBSTACLES = [
  {
    id: 'stone',
    img: stoneImg,
    l: 30.03,
    t: 38.55,
    w: 30,
    z: 7,
    cls: 'vak-obstacle--stone',
    hit: { x: 30.63, y: 39.55, rx: 14, ry: 12.5 },
  },
  {
    id: 'logpile',
    img: logPileImg,
    l: 67.68,
    t: 43.82,
    w: 30,
    z: 7,
    cls: 'vak-obstacle--logpile',
    hit: { x: 67.68, y: 43.82, rx: 14, ry: 12.5 },
  },
  {
    id: 'reeds',
    img: reedsImg,
    l: 49.55,
    t: 63.4,
    w: 20,
    z: 12,   // above the dropped lily pads (z 11) so pads sit BEHIND the reeds
    cls: 'vak-obstacle--reeds',
    hit: { x: 49.55, y: 63.4, rx: 7.5, ry: 12 },
  },
  {
    id: 'reeds2',
    img: reedsImg,
    l: 57.32,
    t: 69.92,
    w: 17,
    z: 12,
    cls: 'vak-obstacle--reeds',
    hit: { x: 57.32, y: 68.92, rx: 6.5, ry: 11 },
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
  const [waterPoly, setWaterPoly] = useState(DEFAULT_WATER_POLY);  // drag-allowed region

  // Debug / layout authoring
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showHitboxes, setShowHitboxes] = useState(false);
  const [showWaterArea, setShowWaterArea] = useState(false);
  const [debugPanelPosition, setDebugPanelPosition] = useState({ x: 12, y: 96 });
  const [selectedObstacleId, setSelectedObstacleId] = useState(DEFAULT_OBSTACLES[0].id);
  const [layoutCopyStatus, setLayoutCopyStatus] = useState('');

  const [stuckLevel, setStuckLevel] = useState(0);  // 0 none · 1 shimmer · 2 +VO · 3 +arc
  const [showIntroGesture, setShowIntroGesture] = useState(false);  // one-time "you drag me" cue
  const introGestureShownRef = useRef(false);

  const stageRef = useRef(null);
  const debugDragRef = useRef(null);
  const debugPanelDragRef = useRef(null);
  const timers = useRef([]);
  const isPausedRef = useRef(isPaused);
  const blockPulseTimeoutRef = useRef(null);
  const hasPlayedStuckVoRef = useRef(false);
  const bumpCountRef = useRef(0);          // bumps since the last forward progress
  const stuckAnchorXRef = useRef(START_POS.x);   // furthest x when the streak began
  const stuckLevelRef = useRef(0);         // mirror of stuckLevel for the drag loop
  const stuckTimersRef = useRef([]);

  const frogPosRef = useRef(START_POS);
  const startPosRef = useRef(START_POS);   // authored frog start; kept in a ref so
  const waterPolyRef = useRef(DEFAULT_WATER_POLY);  // read in the drag loop
  const litCountRef = useRef(0);           // resetState identity stays stable
  const maxProgressXRef = useRef(START_POS.x);
  const lastBlockSfxRef = useRef(0);
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

  // Debug authoring: drag one water-area vertex.
  const moveWaterVertex = useCallback((index, point) => {
    const next = waterPolyRef.current.map((v, i) => (
      i === index ? { x: +point.x.toFixed(2), y: +point.y.toFixed(2) } : v
    ));
    waterPolyRef.current = next;
    setWaterPoly(next);
  }, []);

  // REACTIVE stuck hint — no idle timer. It only escalates after repeated bumps
  // with no forward progress, and only near where the child is stuck:
  //   L1 -> a soft water shimmer in the nearest clear gap. Silent.
  //   L2 (+6s stuck) -> shimmer + "Try going around — see the open water?" (once)
  //   L3 (+12s stuck) -> shimmer + a short 3-ripple arc toward that gap
  // Any new furthest-right position clears the streak and hides it again, so
  // every rock / reed / log is its own fresh little puzzle.
  const clearStuckTimers = useCallback(() => {
    stuckTimersRef.current.forEach(clearTimeout);
    stuckTimersRef.current = [];
  }, []);

  const resetStuck = useCallback(() => {
    clearStuckTimers();
    bumpCountRef.current = 0;
    stuckAnchorXRef.current = maxProgressXRef.current;
    stuckLevelRef.current = 0;
    setStuckLevel(0);
  }, [clearStuckTimers]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    clearStuckTimers();
    if (blockPulseTimeoutRef.current) {
      clearTimeout(blockPulseTimeoutRef.current);
      blockPulseTimeoutRef.current = null;
    }
  }, [clearStuckTimers]);

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

  // Frog bumped a rock / log / bank — gentle redirect, never a reset.
  const triggerBlock = useCallback(() => {
    setBlockPulse(true);
    if (blockPulseTimeoutRef.current) clearTimeout(blockPulseTimeoutRef.current);
    blockPulseTimeoutRef.current = setTimeout(() => {
      setBlockPulse(false);
      blockPulseTimeoutRef.current = null;
    }, 450);

    // Soft "nope" SFX only — no VO. Throttled so scrubbing along the bank or a
    // rock doesn't machine-gun it.
    const now = Date.now();
    if (now - lastBlockSfxRef.current > BLOCK_SFX_COOLDOWN_MS) {
      lastBlockSfxRef.current = now;
      playSfx?.('softWrong');
    }

    // Stuck detection: N bumps with no forward progress since the streak began.
    bumpCountRef.current += 1;
    const stalled = maxProgressXRef.current <= stuckAnchorXRef.current + STUCK_PROGRESS_EPS;
    if (bumpCountRef.current >= STUCK_BUMPS && stalled && stuckLevelRef.current === 0) {
      stuckLevelRef.current = 1;
      setStuckLevel(1);
      clearStuckTimers();
      stuckTimersRef.current.push(setTimeout(() => {
        stuckLevelRef.current = 2;
        setStuckLevel(2);
      }, STUCK_L2_MS));
      stuckTimersRef.current.push(setTimeout(() => {
        stuckLevelRef.current = 3;
        setStuckLevel(3);
      }, STUCK_L3_MS));
    }
  }, [clearStuckTimers, playSfx]);

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
    hasPlayedStuckVoRef.current = false;
    maxProgressXRef.current = startPosRef.current.x;
    lastBlockSfxRef.current = 0;
    bumpCountRef.current = 0;
    stuckAnchorXRef.current = startPosRef.current.x;
    stuckLevelRef.current = 0;
    setStuckLevel(0);
    introGestureShownRef.current = false;
    setShowIntroGesture(false);
  }, [clearTimers, onStageChange, setFrog, setLit]);

  const startTraceCourse = useCallback(() => {
    setPhase('trace');
    onStageChange('trace');
    setPads([]);
    setTrailPoints([]);
    setFrog(startPosRef.current);
    playSceneLine?.('scene10_vak_intro');
  }, [onStageChange, playSceneLine, setFrog]);

  // One-time onboarding: a hand drags the frog from the bank into the water so
  // kids know to DRAG (not tap). Fires once when play starts, GestureDemo
  // auto-hides after 2 loops, and beginDrag kills it on first grab. Keyed only
  // on `phase` so a re-rendering parent can't cancel the timer.
  useEffect(() => {
    if (phase !== 'trace' || introGestureShownRef.current) return undefined;
    const t = setTimeout(() => {
      introGestureShownRef.current = true;
      setShowIntroGesture(true);
    }, 1200);
    return () => clearTimeout(t);
  }, [phase]);

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

    // Off the water (grass / far bank) — same as a rock: hold, don't follow.
    if (!isPointInPolygon(point, waterPolyRef.current)) {
      triggerBlock();
      return;
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
    // A new furthest point also clears any bump streak / stuck shimmer.
    if (point.x > maxProgressXRef.current) {
      maxProgressXRef.current = point.x;
      bumpCountRef.current = 0;
      if (stuckLevelRef.current > 0 && point.x > stuckAnchorXRef.current + STUCK_PROGRESS_EPS) {
        resetStuck();
      } else {
        stuckAnchorXRef.current = point.x;
      }
    }
    const maxX = maxProgressXRef.current;
    const reachedFamily = distance(point, familyPoint) <= FAMILY_WIN_RADIUS;

    let target = 0;
    if (maxX >= bandsX[0]) target = 1;
    if (maxX >= bandsX[1]) target = 2;
    if (maxX >= bandsX[2]) target = 3;
    if (reachedFamily) target = 4;

    if (target > litCountRef.current) {
      const prevLit = litCountRef.current;
      // Apply the FULL computed target in one step. A fast flick that clears
      // several bands (or reaches the family) in a single pointer-move must not
      // strand the child at +1 with the rest of the syllables unlit — that was
      // the fast-flick soft-stuck: reunion never fired because litCount never
      // reached 4. Progress stays gated on how far the frog actually travelled
      // (maxProgressXRef / reachedFamily) — no destination shortcut.
      setLit(target);
      resetStuck(); // a syllable earned is real progress — clear any stuck hint
      // One lily pad per syllable newly earned this tick — stepping stones that
      // MEAN something, not a breadcrumb trail. Drop where the frog crossed;
      // the 4th lands at the family as 'da' completes the whole word.
      setPads((pd) => [
        ...pd,
        ...Array.from({ length: target - prevLit }, (_, i) => ({
          id: `pad-${prevLit + i + 1}`,
          x: point.x,
          y: point.y,
        })),
      ]);
      if (target < 4) {
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
    after, bandsX, familyPoint, goToReunion, isDragging, resetStuck,
    obstacles, onMicroWin, setFrog, setLit, triggerBlock,
  ]);

  const beginDrag = useCallback((event) => {
    if (isPaused || showDebugPanel) return;
    if (phase !== 'trace') return;
    const point = getPoint(event.clientX, event.clientY);
    if (!point) return;
    if (distance(point, frogPosRef.current) > GRAB_RADIUS) return; // must grab the frog
    setIsDragging(true);
    introGestureShownRef.current = true;   // they've got it — kill the intro cue
    setShowIntroGesture(false);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [getPoint, isPaused, phase, showDebugPanel]);

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

  // Stuck level 2: play the "try going around" line once for the whole game.
  useEffect(() => {
    if (!isActive || phase !== 'trace') return;
    if (stuckLevel < 2 || hasPlayedStuckVoRef.current) return;
    hasPlayedStuckVoRef.current = true;
    playSceneLine?.('hintLookForGlow');
  }, [stuckLevel, isActive, phase, playSceneLine]);

  if (!isActive) return null;

  const isPlaying = phase === 'trace';

  // Where the stuck shimmer sits — the nearest clear water beside the frog,
  // computed live so it always points at the gap next to where the child is
  // stuck. null if the frog is fully boxed in (bad layout — fix in debug).
  const openingPoint = (isPlaying && !isDragging && stuckLevel >= 1)
    ? findNearbyOpening(frogPos, obstacles, waterPoly, familyPoint.x)
    : null;
  const showShimmer = !!openingPoint;
  const arcDots = (showShimmer && stuckLevel >= 3)
    ? [0.34, 0.6, 0.85].map((t, i) => ({
        id: `arc-${i}`,
        x: frogPos.x + (openingPoint.x - frogPos.x) * t,
        y: frogPos.y + (openingPoint.y - frogPos.y) * t,
      }))
    : [];

  // One-time onboarding drag: bank -> nearest open water.
  const introGestureTo = findNearbyOpening(startPos, obstacles, waterPoly, familyPoint.x)
    ?? { x: clamp(startPos.x + 12, EDGE.minX, EDGE.maxX), y: clamp(startPos.y - 8, EDGE.minY, EDGE.maxY) };

  const frogRenderPos = phase === 'reunion' ? familyPoint : frogPos;
  const frogWidth = phase === 'reunion' ? frogW * (REUNION_FROG_W / FROG_W) : frogW;
  const selectedObstacle =
    obstacles.find((obstacle) => obstacle.id === selectedObstacleId) ?? obstacles[0];

  const copyLayoutJson = async () => {
    const payload = JSON.stringify({ obstacles, startPos, frogW, familyPoint, familyW, bandsX, waterPoly }, null, 2);
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
      return;
    }
    if (drag.type === 'waterVertex') {
      moveWaterVertex(drag.index, point);
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
        {showDebugPanel && showWaterArea && (
          <polygon
            className="vak-debug-water"
            points={waterPoly.map((v) => `${v.x},${v.y}`).join(' ')}
          />
        )}
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

      {showDebugPanel && showWaterArea && waterPoly.map((v, index) => (
        <div
          key={`water-vtx-${index}`}
          className="vak-layer vak-debug-water-vtx is-debug-draggable"
          style={{ left: `${v.x}%`, top: `${v.y}%`, zIndex: 40 }}
          onPointerDown={(event) => startDebugDrag(event, { type: 'waterVertex', index })}
          onPointerMove={continueDebugDrag}
          onPointerUp={endDebugDrag}
          onPointerCancel={endDebugDrag}
        >
          {index}
        </div>
      ))}

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
        style={{ left: `${frogRenderPos.x}%`, top: `${frogRenderPos.y}%`, width: `${frogWidth}%`, zIndex: 14 }}
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

      {showShimmer && (
        <div
          className={`vak-layer vak-water-shimmer ${stuckLevel >= 2 ? 'is-strong' : ''}`}
          style={{ left: `${openingPoint.x}%`, top: `${openingPoint.y}%`, zIndex: 5 }}
        />
      )}
      {arcDots.map((dot, i) => (
        <div
          key={dot.id}
          className="vak-layer vak-shimmer-dot"
          style={{ left: `${dot.x}%`, top: `${dot.y}%`, zIndex: 5, animationDelay: `${i * 0.18}s` }}
        />
      ))}

      <GestureDemo
        type="drag"
        from={{ x: startPos.x, y: startPos.y }}
        to={{ x: introGestureTo.x, y: introGestureTo.y }}
        active={isPlaying && showIntroGesture}
        idleDelay={0}
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

            <div className="vak-debug-section-title">Water area</div>
            <p className="vak-debug-note">
              The frog can only be dragged inside this shape. Turn it on, then drag the numbered handles on the canvas to fit the river + the start/family bays.
            </p>
            <label className="vak-debug-check">
              <input
                type="checkbox"
                checked={showWaterArea}
                onChange={(event) => setShowWaterArea(event.target.checked)}
              />
              <span>Show water area &amp; handles</span>
            </label>
            <div className="vak-debug-actions">
              <button
                type="button"
                className="vak-debug-reset"
                onClick={() => { waterPolyRef.current = DEFAULT_WATER_POLY; setWaterPoly(DEFAULT_WATER_POLY); }}
              >
                Reset Water
              </button>
            </div>

            <pre className="vak-debug-readout">
              {JSON.stringify({ obstacles, startPos, frogW, familyPoint, familyW, bandsX, waterPoly }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
