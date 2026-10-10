import PoseImage, { usePreloadPoses } from '../../../../lib/components/animation/PoseImage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import SyllableHighlight from '../../shared/SyllableHighlight';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import useRepeatedHintCycle from '../../../../lib/hooks/useRepeatedHintCycle';
import useWarmSanskritAudio from '../../../../lib/hooks/useWarmSanskritAudio';
import usePausableTimers from '../../../../lib/hooks/usePausableTimers';
import { getLineCue } from '../../../../lib/config/content/voiceCues';
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

const START_POS = { x: 24.1, y: 64 };
const FROG_W = 6;
// Phone landscape only (same query the rest of the app uses): small frog a touch
// bigger, reeds/logs smaller so the frog reads first. iPad/desktop keep the base values.
const PHONE_MQ = '(orientation: landscape) and (max-height: 500px) and (max-width: 1023px)';
const isPhone = () => typeof window !== 'undefined' && !!window.matchMedia?.(PHONE_MQ).matches;
const PHONE_FROG_W = 6.4;
const startFrogW = () => (isPhone() ? PHONE_FROG_W : FROG_W);
const REUNION_FROG_W = 5.4;
const FAMILY = { x: 91.08, y: 52.71, w: 14 };

const FAMILY_WIN_RADIUS = 12;   // how close counts as "reached the family"
const PAD_PLACE_BEAT_MS = 450;  // lily-pad 'place' sound (~200ms) + a gap, then the syllable speaks alone
const SYLLABLE_WATCHDOG_MS = 3500; // a syllable clip is ~1.7s; if its onEnded is lost (iOS), move on so the sequence can't hang
const GRAB_RADIUS = 15;         // must press near the frog to pick it up
const TRAIL_MIN_STEP = 1.0;     // ignore micro jitter when drawing the wake
const TRAIL_LIMIT = 600;        // above this, thin the oldest points (never truncate the start)
const BLOCK_SFX_COOLDOWN_MS = 500;   // throttle that decides when a held shove counts as another bump (stuck-hint count)
const SOFT_TAP_ATTEMPT = 3;     // the gentle two-note sound plays ONCE, on this many distinct failed attempts (wobble-only before that)
const REUNION_CUE_MS = 1160;    // frogReunion cue = maxMs 1100 in sfx.js (fade included) + 60ms margin; the full word starts only after it
const EDGE = { minX: 3, maxX: 96, minY: 6, maxY: 93 };

// Reactive "stuck" hint: only fires after repeated bumps with no forward
// progress — a child who is exploring calmly triggers nothing.
const STUCK_BUMPS = 3;           // bumps (no progress) before the shimmer shows
const STUCK_PROGRESS_EPS = 3;    // % of new forward progress that counts as unstuck
const STUCK_L2_MS = 6000;        // shimmer -> shimmer + VO
const STUCK_L3_MS = 12000;       // -> shimmer + short arc toward the opening

// The swimmable CHANNEL — a single closed polygon shaped like a fat ribbon
// along the intended route (start bay -> below the rock -> the lane between
// reeds and logs -> family bay). The frog can only be dragged INSIDE it;
// outside is a no-go and the drag holds at the last valid point. The
// obstacles need no separate exclusion: the channel simply routes around
// them, so a rock/log/reed footprint is never inside the channel. Authored
// live in the Trace Debug panel ("Water area") — drag handles, double-click
// to delete one, "Subdivide" to add resolution, "Reset Water" for this seed.
const DEFAULT_WATER_POLY = [
  { x: 16.68, y: 64.51 }, { x: 21.76, y: 65.48 }, { x: 27.14, y: 64.79 }, { x: 32.42, y: 66.87 },
  { x: 37.5, y: 69.37 }, { x: 42.28, y: 69.51 }, { x: 42.98, y: 60.21 }, { x: 45.07, y: 55.62 },
  { x: 49.05, y: 52.29 }, { x: 55.33, y: 53.26 }, { x: 60.21, y: 57.85 }, { x: 66.38, y: 63.54 },
  { x: 68.28, y: 70.62 }, { x: 66.48, y: 83.95 }, { x: 87.31, y: 85.74 }, { x: 94.82, y: 71.15 },
  { x: 98.18, y: 51.46 }, { x: 88.1, y: 47.43 }, { x: 80.23, y: 51.04 }, { x: 74.25, y: 52.36 },
  { x: 68.72, y: 52.83 }, { x: 63.68, y: 51.04 }, { x: 59.62, y: 48.43 }, { x: 55.57, y: 46.91 },
  { x: 53.93, y: 39.24 }, { x: 51.44, y: 39.45 }, { x: 49.95, y: 45.49 }, { x: 45.77, y: 46.88 },
  { x: 39.09, y: 48.27 }, { x: 33.66, y: 49.38 }, { x: 23.85, y: 43.82 }, { x: 22.76, y: 33.69 },
  { x: 15.59, y: 34.11 }, { x: 6.82, y: 33.69 }, { x: 3.34, y: 58.54 }, { x: 9.71, y: 61.32 },
];

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));

// Ray-casting point-in-polygon. ring is a list of {x,y} in the same units.
function isPointInPolygon(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = ring[i].x;
    const yi = ring[i].y;
    const xj = ring[j].x;
    const yj = ring[j].y;
    const straddles = (yi > point.y) !== (yj > point.y);
    if (straddles && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Inside the swimmable channel. (Thin wrapper so call sites stay stable if the
// shape model changes again.)
function isInWaterArea(point, channel) {
  return isPointInPolygon(point, channel);
}

// Nearest patch of clear, open water around `from` — in the water area, not
// inside any obstacle — biased toward the family (higher x). Used to place the
// stuck-hint shimmer right where the child is stuck, not at a fixed point.
function findNearbyOpening(from, obstacles, area, familyX) {
  let best = null;
  let bestScore = -Infinity;
  for (let r = 8; r <= 26; r += 3) {
    for (let deg = 0; deg < 360; deg += 15) {
      const a = (deg * Math.PI) / 180;
      const p = { x: from.x + Math.cos(a) * r, y: from.y + Math.sin(a) * r };
      if (!isInWaterArea(p, area)) continue;
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

// Route-aware hint: BFS over a coarse grid of cells the frog may actually enter
// (inside the channel, outside every obstacle — the same rules the drag uses),
// from the frog to the family. Returns the path as points, or [] if none.
// This is what the stuck hint follows, so it points along the real way through
// the reeds/rocks instead of at whatever clear water happens to be nearest.
const ROUTE_CELL = 2;
function findRoute(from, to, obstacles, area) {
  const n = Math.ceil(100 / ROUTE_CELL);
  const toCell = (p) => ({
    cx: clamp(Math.round(p.x / ROUTE_CELL), 0, n - 1),
    cy: clamp(Math.round(p.y / ROUTE_CELL), 0, n - 1),
  });
  const center = (cx, cy) => ({ x: cx * ROUTE_CELL, y: cy * ROUTE_CELL });
  const walkable = (cx, cy) => {
    const p = center(cx, cy);
    return isInWaterArea(p, area) && !isPointInsideObstacle(p, obstacles);
  };
  const idx = (cx, cy) => cy * n + cx;
  const start = toCell(from);
  // The frog may sit a hair off a walkable cell centre — start from the
  // nearest walkable cell within 2 cells.
  let s = null;
  for (let r = 0; r <= 2 && !s; r += 1) {
    for (let dy = -r; dy <= r && !s; dy += 1) {
      for (let dx = -r; dx <= r && !s; dx += 1) {
        const cx = start.cx + dx;
        const cy = start.cy + dy;
        if (cx >= 0 && cy >= 0 && cx < n && cy < n && walkable(cx, cy)) s = { cx, cy };
      }
    }
  }
  if (!s) return [];
  const goal = toCell(to);
  const prev = new Map([[idx(s.cx, s.cy), -1]]);
  const queue = [s];
  let end = null;
  for (let qi = 0; qi < queue.length; qi += 1) {
    const cur = queue[qi];
    if (Math.abs(cur.cx - goal.cx) <= 1 && Math.abs(cur.cy - goal.cy) <= 1) { end = cur; break; }
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const cx = cur.cx + dx;
        const cy = cur.cy + dy;
        if (cx < 0 || cy < 0 || cx >= n || cy >= n) continue;
        const k = idx(cx, cy);
        if (prev.has(k) || !walkable(cx, cy)) continue;
        prev.set(k, idx(cur.cx, cur.cy));
        queue.push({ cx, cy });
      }
    }
  }
  if (!end) return [];
  const route = [];
  for (let k = idx(end.cx, end.cy); k !== -1; k = prev.get(k)) {
    route.push(center(k % n, Math.floor(k / n)));
  }
  return route.reverse();
}

// Point `dist` units along a route (clamped to its end).
function pointAlongRoute(route, dist) {
  let left = dist;
  for (let i = 1; i < route.length; i += 1) {
    const seg = distance(route[i - 1], route[i]);
    if (seg >= left) {
      const t = seg ? left / seg : 0;
      return {
        x: route[i - 1].x + (route[i].x - route[i - 1].x) * t,
        y: route[i - 1].y + (route[i].y - route[i - 1].y) * t,
      };
    }
    left -= seg;
  }
  return route[route.length - 1];
}

const DEFAULT_OBSTACLES = [
  {
    id: 'stone',
    img: stoneImg,
    l: 36.01,
    t: 34.11,
    w: 30,
    z: 7,
    cls: 'vak-obstacle--stone',
    hit: { x: 36.61, y: 35.11, rx: 14, ry: 12.5 },
  },
  {
    id: 'logpile',
    img: logPileImg,
    l: 69.07,
    t: 39.24,
    w: 30,
    z: 7,
    cls: 'vak-obstacle--logpile',
    hit: { x: 69.07, y: 39.24, rx: 14, ry: 12.5 },
  },
  {
    id: 'reeds',
    img: reedsImg,
    l: 52.24,
    t: 67.29,
    w: 20,
    z: 12,   // above the dropped lily pads (z 11) so pads sit BEHIND the reeds
    cls: 'vak-obstacle--reeds',
    hit: { x: 52.24, y: 67.29, rx: 7.5, ry: 12 },
  },
  {
    id: 'reeds2',
    img: reedsImg,
    l: 59.81,
    t: 71.73,
    w: 17,
    z: 12,
    cls: 'vak-obstacle--reeds',
    hit: { x: 59.81, y: 70.73, rx: 6.5, ry: 11 },
  },
];

const PHONE_OBSTACLES = {
  stone: { l: 36.45, t: 26.97, w: 26.6, hit: { x: 37.05, y: 27.97, rx: 12.4, ry: 11.1 } },
  logpile: { w: 26.6, hit: { rx: 12.35, ry: 11.1 } },
  reeds: { l: 53.59, t: 77.26, w: 15.3, hit: { x: 53.59, y: 77.26, rx: 5.8, ry: 9.2 } },
  reeds2: { l: 47.04, t: 77.65, w: 13.05, hit: { x: 47.04, y: 76.65, rx: 5, ry: 8.5 } },
};

function cloneObstacles() {
  const phone = isPhone();
  return DEFAULT_OBSTACLES.map((obstacle) => {
    const o = phone ? PHONE_OBSTACLES[obstacle.id] : null;
    return {
      ...obstacle,
      ...(o || {}),
      hit: { ...obstacle.hit, ...(o?.hit || {}) },
    };
  });
}

// X thresholds (in %) that light va / kra / tun as the frog passes 25% / 50% /
// 75% of the way from the start bay to the family. 'da' (100%) lights on
// actually reaching the family, not just an X line.
const BAND_FRACTIONS = [0.25, 0.5, 0.75];

function computeBandsX(startX, familyX) {
  return BAND_FRACTIONS.map((f) => Number((startX + (familyX - startX) * f).toFixed(2)));
}

function isPointInsideObstacle(point, obstacles) {
  return obstacles.some((obstacle) => {
    const { x, y, rx, ry } = obstacle.hit;
    const dx = (point.x - x) / rx;
    const dy = (point.y - y) / ry;
    return dx * dx + dy * dy <= 1;
  });
}

const POSE_ASSETS = [
  frogSwim,
  frogHappy,
  frogFamily,
  lilypad,
  stoneImg,
  logPileImg,
  reedsImg,
];

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
  usePreloadPoses(POSE_ASSETS);
  // Warm the syllable + word MP3s so the first 'va' plays the instant it lights.
  useWarmSanskritAudio('vakratunda', AUDIO.syllables);
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
  const [bandsX, setBandsX] = useState(() => computeBandsX(START_POS.x, FAMILY.x));
  const [startPos, setStartPos] = useState(START_POS);   // frog start / reset spot
  const [frogW, setFrogW] = useState(startFrogW);            // frog width %
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

  const [stuckLevel, setStuckLevel] = useState(0);  // 0 none · 1 shimmer · 2 +bubble/VO · 3 +arc
  const [showIntroGesture, setShowIntroGesture] = useState(false);  // one-time "you drag me" cue
  const [introVoDone, setIntroVoDone] = useState(false);
  const [introVoStarted, setIntroVoStarted] = useState(false);
  const [hasStartedDrag, setHasStartedDrag] = useState(false);
  const introGestureShownRef = useRef(false);

  const stageRef = useRef(null);
  const debugDragRef = useRef(null);
  const debugPanelDragRef = useRef(null);
  const timers = useRef([]);
  const isPausedRef = useRef(isPaused);
  // Freezes with the sidebar and resumes with the remaining time (see hook).
  const { after: pausableAfter, cancel: cancelPausable, clear: clearPausable } = usePausableTimers(isPaused);
  const blockPulseTimeoutRef = useRef(null);
  const hasPlayedStuckVoRef = useRef(false);
  const bumpCountRef = useRef(0);          // bumps since the last forward progress
  const stuckAnchorXRef = useRef(START_POS.x);   // furthest x when the streak began
  const stuckLevelRef = useRef(0);         // mirror of stuckLevel for the drag loop
  const stuckTimersRef = useRef([]);
  // True while the frog is held against the SAME blocked spot (pointermove
  // fires many times a second while pushing). Only the first contact of a
  // push counts as one "bump" — otherwise 3 real attempts could be manufactured
  // out of one continuous shove in under a second.
  const blockedContactRef = useRef(false);
  // Soft "not quite" sound: counts DISTINCT failed attempts (a new contact after the frog was back in open
  // water), not the many collision events while pressed on one obstacle. Plays once, never repeats in the
  // same obstacle sequence, and resets once the frog makes real progress past where it was stuck.
  const failedAttemptsRef = useRef(0);
  const softTapPlayedRef = useRef(false);
  const attemptAnchorXRef = useRef(null);

  const frogPosRef = useRef(START_POS);
  const startPosRef = useRef(START_POS);   // authored frog start; kept in a ref so
  const waterPolyRef = useRef(DEFAULT_WATER_POLY);  // read in the drag loop
  const litCountRef = useRef(0);           // resetState identity stays stable
  const maxProgressXRef = useRef(START_POS.x);
  const lastBlockSfxRef = useRef(0);
  const reunionStartedRef = useRef(false);
  // Bounded syllable sequence: at most one entry per syllable (4), played strictly in order, each to the end.
  // `startAfter` holds the next start for the 'place' beat; `token` identity guards stale callbacks after a reset.
  const syllableSeqRef = useRef({ queue: [], seen: new Set(), playing: false, waiting: false, startAfter: 0 });
  // Stuck-help VO must never interrupt Sanskrit: it is held here until the syllable sequence is idle, then
  // spoken only if the child is STILL stuck (otherwise discarded). speakStuckHintRef lets pumpSyllables call it.
  const stuckHintPendingRef = useRef(false);
  const speakStuckHintRef = useRef(null);

  const {
    hintLevel: startDragHintLevel,
    pulseTick: startDragPulseTick,
    markLevel2VoiceStarted: markStartDragLevel2VoiceStarted,
    markLevel2VoiceEnded: markStartDragLevel2VoiceEnded,
  } = useRepeatedHintCycle({
    enabled: isActive && !isPaused && phase === 'trace' && introVoDone && !isDragging && !hasStartedDrag && stuckLevel === 0,
    stageKey: 'vakratunda-start-drag',
    initialDelay: 10000,
    pulseCountBeforeEscalation: 3,
    pulseInterval: 1800,
    level2Delay: 18000,
    level3Delay: 26000,
  });

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

  // Debug authoring: drag one channel vertex.
  const moveWaterVertex = useCallback((index, point) => {
    const pt = { x: +point.x.toFixed(2), y: +point.y.toFixed(2) };
    const next = waterPolyRef.current.map((v, i) => (i === index ? pt : v));
    waterPolyRef.current = next;
    setWaterPoly(next);
  }, []);

  // Debug authoring: double-click a handle to delete that vertex (min 3).
  const deleteWaterVertex = useCallback((index) => {
    const current = waterPolyRef.current;
    if (current.length <= 3) return;
    const next = current.filter((_, i) => i !== index);
    waterPolyRef.current = next;
    setWaterPoly(next);
  }, []);

  // Debug authoring: insert a midpoint on every edge (12 -> 24 -> 48 ...).
  const subdivideWater = useCallback(() => {
    const cur = waterPolyRef.current;
    const next = [];
    for (let i = 0; i < cur.length; i += 1) {
      const a = cur[i];
      const b = cur[(i + 1) % cur.length];
      next.push(a, { x: +((a.x + b.x) / 2).toFixed(2), y: +((a.y + b.y) / 2).toFixed(2) });
    }
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
    stuckTimersRef.current.forEach(cancelPausable);
    stuckTimersRef.current = [];
  }, [cancelPausable]);

  // Pause-safe delay for the stuck escalation (+6s / +12s): frozen while paused
  // and resumed with the remaining time, so paused time never counts toward the
  // escalation. Handles are tracked in stuckTimersRef so clearStuckTimers (e.g.
  // real progress) cancels them.
  const pauseSafeAfter = useCallback((ms, fn) => {
    stuckTimersRef.current.push(pausableAfter(ms, fn));
  }, [pausableAfter]);

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
    clearPausable();
    if (blockPulseTimeoutRef.current) {
      clearTimeout(blockPulseTimeoutRef.current);
      blockPulseTimeoutRef.current = null;
    }
  }, [clearPausable, clearStuckTimers]);

  useEffect(() => {
    isPausedRef.current = isPaused;
    if (isPaused) setIsDragging(false);
  }, [isPaused]);

  const after = pausableAfter;

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

    // The wobble above is the feedback for every bump. Sound is rarer: the gentle two-note plays once, on the
    // 3rd distinct failed attempt (a child exploring obstacles must not hear failure). Silent during Sanskrit
    // (the engine drops it) and never repeated in the same obstacle sequence.
    const now = Date.now();
    const playedBlockSfx = now - lastBlockSfxRef.current > BLOCK_SFX_COOLDOWN_MS;
    if (playedBlockSfx) lastBlockSfxRef.current = now;   // still paces the stuck-hint bump count below

    if (!blockedContactRef.current) {                    // first collision of a NEW contact = one failed attempt
      if (failedAttemptsRef.current === 0) attemptAnchorXRef.current = maxProgressXRef.current;
      failedAttemptsRef.current += 1;
      if (failedAttemptsRef.current >= SOFT_TAP_ATTEMPT && !softTapPlayedRef.current) {
        softTapPlayedRef.current = true;
        playSfx?.('softWrong'); // the approved single wooden tap
      }
    }

    // Stuck detection: N bumps with no forward progress since the streak began.
    // Count the first blocked contact, then only count again when the
    // throttled bump SFX plays. That keeps raw pointermove spam from creating
    // fake attempts, but makes the visual hint follow the same repeated "nope"
    // signal the child actually hears.
    const shouldCountBump = !blockedContactRef.current || playedBlockSfx;
    blockedContactRef.current = true;
    if (!shouldCountBump) return;

    bumpCountRef.current += 1;
    const stalled = maxProgressXRef.current <= stuckAnchorXRef.current + STUCK_PROGRESS_EPS;
    if (bumpCountRef.current >= STUCK_BUMPS && stalled && stuckLevelRef.current === 0) {
      stuckLevelRef.current = 1;
      setStuckLevel(1);
      clearStuckTimers();
      // Pause-safe: a child who pauses at L1 must not come back already at
      // L3 — paused time must not count toward the +6s / +12s escalation.
      pauseSafeAfter(STUCK_L2_MS, () => {
        stuckLevelRef.current = 2;
        setStuckLevel(2);
      });
      pauseSafeAfter(STUCK_L3_MS, () => {
        stuckLevelRef.current = 3;
        setStuckLevel(3);
      });
    }
  }, [clearStuckTimers, pauseSafeAfter, playSfx]);

  const resetState = useCallback(() => {
    clearTimers();
    reunionStartedRef.current = false;
    syllableSeqRef.current = { queue: [], seen: new Set(), playing: false, waiting: false, startAfter: 0 };
    setPhase('trace');
    onStageChange('trace');
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
    stuckHintPendingRef.current = false;
    maxProgressXRef.current = startPosRef.current.x;
    lastBlockSfxRef.current = 0;
    failedAttemptsRef.current = 0;
    softTapPlayedRef.current = false;
    attemptAnchorXRef.current = null;
    bumpCountRef.current = 0;
    blockedContactRef.current = false;
    stuckAnchorXRef.current = startPosRef.current.x;
    stuckLevelRef.current = 0;
    setStuckLevel(0);
    introGestureShownRef.current = false;
    setShowIntroGesture(false);
    setIntroVoDone(false);
    setIntroVoStarted(false);
    setHasStartedDrag(false);
  }, [clearTimers, onStageChange, setFrog, setLit]);

  const startTraceCourse = useCallback(() => {
    setPhase('trace');
    onStageChange('trace');
    setPads([]);
    setTrailPoints([]);
    setFrog(startPosRef.current);

    setIntroVoDone(false);
    setIntroVoStarted(false);
    const markIntroVoDone = () => { setIntroVoDone(true); setIntroVoStarted(true); };
    if (playSceneLine) {
      // The hand is cued to the action word ("Drag") of the line, not a guessed delay.
      playSceneLine('scene10_vak_intro', markIntroVoDone, { cue: getLineCue('scene10_vak_intro', () => setIntroVoStarted(true)) });
    } else {
      markIntroVoDone();
    }
  }, [onStageChange, playSceneLine, setFrog]);

  // Start-drag hint ladder: L1 is visual-only, L2 replays the core "drag Frog"
  // instruction once, and L3 becomes the most explicit hand demo. Once the
  // child grabs Frog, this ladder stays dismissed and the obstacle stuck-hints
  // take over.
  useEffect(() => {
    if (!isActive || phase !== 'trace' || isPaused || hasStartedDrag || startDragHintLevel !== 2) return;
    if (playSceneLine) markStartDragLevel2VoiceStarted();
    playSceneLine?.('scene10_vak_intro', markStartDragLevel2VoiceEnded);
  }, [
    hasStartedDrag,
    isActive,
    isPaused,
    markStartDragLevel2VoiceStarted,
    markStartDragLevel2VoiceEnded,
    phase,
    playSceneLine,
    startDragHintLevel,
  ]);

  // One-time onboarding: a hand drags the frog from the bank into the water so
  // kids know to DRAG (not tap). Fires once when play starts, GestureDemo
  // auto-hides after 2 loops, and beginDrag kills it on first grab. Waits for
  // the intro VO to actually start speaking (introVoStarted) — a fixed delay
  // from the `phase` transition doesn't track real TTS startup lag, and could
  // show the demo before the VO even started.
  useEffect(() => {
    if (phase !== 'trace' || !introVoStarted || introGestureShownRef.current) return undefined;
    // Teaches the control (drag), not a rescue for inactivity. scene10_vak_intro
    // is "Frog's way to his family is blocked. Drag Frog to find another way." —
    // a short setup clause before the action word, so this uses GMB gesture-
    // timing preset B (short setup before action): ~700-900ms after VO start,
    // aimed at when "Drag" is spoken.
    const t = pausableAfter(100, () => {
      introGestureShownRef.current = true;
      setShowIntroGesture(true);
    });
    return () => cancelPausable(t);
  }, [phase, introVoStarted, pausableAfter, cancelPausable]);

  useEffect(() => {
    if (!isActive) return undefined;
    resetState();
    startTraceCourse();
    return clearTimers;
  }, [clearTimers, isActive, resetState, startTraceCourse]);

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
      cancelPausable(voFallback);
      onGameComplete?.();
      onPhaseComplete?.();
    };
    // Browser audio onended can silently drop (esp. iOS Safari) — don't hang.
    // Pausable, so the sidebar can't let it complete the scene behind the panel.
    voFallback = after(8000 + REUNION_CUE_MS, finish);

    // Frog reunites -> short reunion cue (capped + faded in sfx.js) -> the full word, so the chime never
    // plays under "Vakratunda". The word starts as the cue finishes: no extra pause beyond the cue itself.
    after(REUNION_CUE_MS, () => {
      playWord?.('vakratunda', () => {
        playSceneLine?.('scene10_vak_crossed', finish, { stripLeadingText: 'Vakratunda' });
      });
    });

    after(4200, () => setFamilyBounce(false));
  }, [after, cancelPausable, familyPoint, onGameComplete, onPhaseComplete, onStageChange, playSceneLine, playSfx, playWord, setFrog]);

  // Play the lit syllables one at a time, in order, each to the end. The frog never waits on this: dragging
  // only lights syllables (they queue here); only the final scene transition waits for 'da' to finish.
  const pumpSyllables = useCallback(() => {
    const seq = syllableSeqRef.current;
    if (seq.playing || seq.waiting || !seq.queue.length) return;
    const wait = seq.startAfter - Date.now();
    if (wait > 0) {
      // A 'place' sound just fired: let it finish before the syllable starts.
      seq.waiting = true;
      after(wait, () => {
        if (syllableSeqRef.current !== seq) return;
        seq.waiting = false;
        pumpSyllables();
      });
      return;
    }
    const { syllable, index } = seq.queue.shift();
    seq.playing = true;
    let finished = false;
    let watchdog;
    const finish = () => {
      if (finished || syllableSeqRef.current !== seq) return;
      finished = true;
      cancelPausable(watchdog);
      seq.playing = false;
      if (index === SYLLABLES.length - 1) goToReunion(); // 'da' has fully played; the word sequence starts clean
      else {
        pumpSyllables();
        speakStuckHintRef.current?.(); // a held stuck-help line may speak now, if the sequence is idle and it still applies
      }
    };
    watchdog = after(SYLLABLE_WATCHDOG_MS, finish);
    playSyllable?.(syllable, finish);
  }, [after, cancelPausable, goToReunion, playSyllable]);

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
    if (!isInWaterArea(point, waterPolyRef.current)) {
      triggerBlock();
      return;
    }

    // Reached valid water — this contact is over, the next bump (if any) is new.
    blockedContactRef.current = false;

    const prev = frogPosRef.current;
    setFrog(point);

    setTrailPoints((tp) => {
      if (tp.length === 0) return [prev, point];
      if (distance(tp[tp.length - 1], point) < TRAIL_MIN_STEP) return tp;
      const next = [...tp, point];
      if (next.length <= TRAIL_LIMIT) return next;
      // Thin the OLDER half (every other point) instead of chopping the start
      // off — the whole path stays visible, just with fewer vertices behind it.
      const half = Math.floor(next.length / 2);
      return [...next.slice(0, half).filter((_, i) => i % 2 === 0), ...next.slice(half)];
    });

    // Got properly past where it was stuck: a fresh obstacle sequence starts (counter + once-only sound reset).
    if (failedAttemptsRef.current > 0 && attemptAnchorXRef.current !== null
        && point.x > attemptAnchorXRef.current + STUCK_PROGRESS_EPS) {
      failedAttemptsRef.current = 0;
      softTapPlayedRef.current = false;
      attemptAnchorXRef.current = null;
    }

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
        // Pad lands: play 'place' only if no Sanskrit is playing or waiting. Otherwise DROP it (never deferred
        // or replayed). When it does play, the next syllable waits PAD_PLACE_BEAT_MS so they never overlap.
        const seq = syllableSeqRef.current;
        if (!seq.playing && !seq.queue.length) {
          playSfx?.('place');
          seq.startAfter = Date.now() + PAD_PLACE_BEAT_MS;
        }
        setFrogSnapping(true);
        after(260, () => setFrogSnapping(false));
      } else {
        onMicroWin?.();
        // Reunion fires when the last syllable has fully played (pumpSyllables). This is only the safety
        // net if the sequence never ran: longer than 4 syllables' watchdogs, so it can't cut one short.
        after(4 * SYLLABLE_WATCHDOG_MS + 1000, goToReunion);
      }
    }
  }, [
    after, bandsX, familyPoint, goToReunion, isDragging, resetStuck,
    obstacles, onMicroWin, playSfx, setFrog, setLit, triggerBlock,
  ]);

  const beginDrag = useCallback((event) => {
    if (isPaused || showDebugPanel) return;
    if (phase !== 'trace') return;
    const point = getPoint(event.clientX, event.clientY);
    if (!point) return;
    if (distance(point, frogPosRef.current) > GRAB_RADIUS) return; // must grab the frog
    stopVoice?.();
    setIsDragging(true);
    setHasStartedDrag(true);
    introGestureShownRef.current = true;   // they've got it — kill the intro cue
    setShowIntroGesture(false);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [getPoint, isPaused, phase, showDebugPanel, stopVoice]);

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
    blockedContactRef.current = false;
    // Trail, pads and frog position deliberately PERSIST — the path the child
    // has drawn stays on screen so they can pick up and continue.
  }, []);

  // Stuck level 2 = "Look for another way through" — spoken ONCE for the
  // whole game. The shimmer cue (rendered below) already carries the visual
  // escalation; no on-screen bubble is needed alongside it.
  //
  // It must never interrupt Sanskrit: if a syllable is playing, waiting or queued, the line is HELD and tried
  // again when the sequence ends (pumpSyllables). At that moment it is only spoken if the child is still stuck
  // and the scene is still in the trace; otherwise it is discarded (and may fire later, if stuck again).
  const speakStuckHintIfRelevant = useCallback(() => {
    if (!stuckHintPendingRef.current) return;
    const seq = syllableSeqRef.current;
    if (seq.playing || seq.waiting || seq.queue.length) return;   // Sanskrit first
    stuckHintPendingRef.current = false;
    if (hasPlayedStuckVoRef.current || reunionStartedRef.current || stuckLevelRef.current < 2) return; // no longer relevant
    hasPlayedStuckVoRef.current = true;
    playSceneLine?.('scene10_vak_hint_another_way');
  }, [playSceneLine]);

  useEffect(() => { speakStuckHintRef.current = speakStuckHintIfRelevant; }, [speakStuckHintIfRelevant]);

  useEffect(() => {
    if (!isActive || phase !== 'trace') return;
    if (stuckLevel < 2 || hasPlayedStuckVoRef.current) return;
    stuckHintPendingRef.current = true;
    speakStuckHintIfRelevant();
  }, [stuckLevel, isActive, phase, speakStuckHintIfRelevant]);

  if (!isActive) return null;

  const isPlaying = phase === 'trace';

  // Where the stuck shimmer sits — the nearest clear water beside the frog,
  // computed live so it always points at the gap next to where the child is
  // stuck. null if the frog is fully boxed in (bad layout — fix in debug).
  // Shown even while still dragging/pushing against the blocker, so the
  // response feels immediate instead of waiting for the child to let go.
  const hintRoute = (isPlaying && stuckLevel >= 1)
    ? findRoute(frogPos, familyPoint, obstacles, waterPoly)
    : [];
  const openingPoint = (isPlaying && stuckLevel >= 1)
    ? (hintRoute.length > 1
      ? pointAlongRoute(hintRoute, 12)
      : findNearbyOpening(frogPos, obstacles, waterPoly, familyPoint.x))
    : null;
  const showShimmer = !!openingPoint;
  // Straight-line interpolation between the frog and the opening could, in
  // principle, cut across an obstacle sitting between them — a hint that
  // visually goes THROUGH the blocker would undermine the "find another way"
  // lesson. Only show the arc if every dot on it is genuinely valid water.
  const arcDots = (() => {
    if (!showShimmer || stuckLevel < 3) return [];
    // Follow the route (not a straight line) so the ripples bend around blockers.
    const candidates = hintRoute.length > 1
      ? [4, 8, 12].map((d) => pointAlongRoute(hintRoute, d))
      : [0.34, 0.6, 0.85].map((t) => ({
        x: frogPos.x + (openingPoint.x - frogPos.x) * t,
        y: frogPos.y + (openingPoint.y - frogPos.y) * t,
      }));
    const allClear = candidates.every((p) => (
      isInWaterArea(p, waterPoly) && !isPointInsideObstacle(p, obstacles)
    ));
    return allClear ? candidates.map((p, i) => ({ id: `arc-${i}`, x: p.x, y: p.y })) : [];
  })();

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
        if (import.meta.env.DEV) console.log('Vakratunda layout JSON:', payload);
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
      className={`vak-game ${hideElements ? 'is-hidden' : ''} ${isPaused ? 'is-paused' : ''}`}
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
            // Queue, don't interrupt: each syllable plays to the end before the next starts (pumpSyllables).
            const seq = syllableSeqRef.current;
            if (seq.seen.has(index)) return;
            seq.seen.add(index);
            seq.queue.push({ syllable, index });
            pumpSyllables();
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
          onDoubleClick={(event) => { event.stopPropagation(); deleteWaterVertex(index); }}
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
        className={`vak-layer vak-start-frog ${phase === 'reunion' ? 'is-reunion' : ''} ${phase === 'reunion' && familyBounce ? 'is-bouncing' : ''} ${isPlaying && !isDragging ? 'is-waiting' : ''} ${blockPulse ? 'is-shaking' : ''} ${frogSnapping ? 'is-snapping' : ''} ${startDragHintLevel === 1 ? 'is-start-hint' : ''} ${startDragHintLevel === 2 ? 'is-start-hint-strong' : ''} ${startDragHintLevel >= 3 ? 'is-start-hint-final' : ''} ${showDebugPanel ? 'is-debug-draggable' : ''}`}
        style={{ left: `${frogRenderPos.x}%`, top: `${frogRenderPos.y}%`, width: `${frogWidth}%`, zIndex: 14 }}
        onPointerDown={(event) => startDebugDrag(event, { type: 'frogStart' })}
        onPointerMove={continueDebugDrag}
        onPointerUp={endDebugDrag}
        onPointerCancel={endDebugDrag}
      >
        <PoseImage src={litCount >= 4 ? frogHappy : frogSwim} alt="" />
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
          style={{ left: `${openingPoint.x}%`, top: `${openingPoint.y}%`, zIndex: 13 }}
        />
      )}
      {arcDots.map((dot, i) => (
        <div
          key={dot.id}
          className="vak-layer vak-shimmer-dot"
          style={{ left: `${dot.x}%`, top: `${dot.y}%`, zIndex: 13, animationDelay: `${i * 0.18}s` }}
        />
      ))}

      <GestureDemo
        type="drag"
        from={{ x: startPos.x, y: startPos.y }}
        to={{ x: introGestureTo.x, y: introGestureTo.y }}
        active={isPlaying && showIntroGesture}
        paused={isPaused}
        idleDelay={0}
        iterations={2}
      />

      {startDragHintLevel >= 2 && isPlaying && !showDebugPanel && !hasStartedDrag && (
        <GestureDemo
          key={`vak-start-drag-hint-${startDragHintLevel}-${startDragPulseTick}`}
          type="drag"
          from={{ x: startPos.x, y: startPos.y }}
          to={
            startDragHintLevel >= 3
              ? { x: introGestureTo.x, y: introGestureTo.y }
              : {
                  x: startPos.x + ((introGestureTo.x - startPos.x) * 0.45),
                  y: startPos.y + ((introGestureTo.y - startPos.y) * 0.45),
                }
          }
          active
          paused={isPaused}
          idleDelay={0}
          replayKey={`${startDragHintLevel}-${startDragPulseTick}`}
          iterations={2}
        />
      )}

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
                onClick={() => { moveStartPos({ ...START_POS }); setFrogW(startFrogW()); }}
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
                onClick={() => setBandsX(computeBandsX(startPos.x, familyPoint.x))}
              >
                Reset Bands
              </button>
            </div>

            <div className="vak-debug-section-title">Water area</div>
            <p className="vak-debug-note">
              This is the swimmable CHANNEL — the frog can only be dragged inside it, and it routes around the obstacles so they block automatically. Drag a handle to reshape; double-click a handle to delete it (min 3); "Subdivide" doubles the handle count for finer shaping; "Reset Water" restores the seed.
            </p>
            <label className="vak-debug-check">
              <input
                type="checkbox"
                checked={showWaterArea}
                onChange={(event) => setShowWaterArea(event.target.checked)}
              />
              <span>Show channel &amp; handles</span>
            </label>
            <div className="vak-debug-actions">
              <button type="button" className="vak-debug-reset" onClick={subdivideWater}>
                Subdivide ({waterPoly.length})
              </button>
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
