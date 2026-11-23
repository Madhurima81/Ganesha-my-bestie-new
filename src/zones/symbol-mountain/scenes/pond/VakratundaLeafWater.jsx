import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import leafPng from './assets/gmb_curved_leaf_transparent.png';
import fingerPng from '../../../../lib/components/feedback/assets/images/gesture-touch-finger-opt.webp';
import streamSvg from './assets/gmb_vakratunda_stream.svg';
import './VakratundaLeafWater.css';

// Coordinates are in the SAME 1024 x 670 stage as PondScene.
// Everything is computed from the LIVE water path; there are no leaf slots.
const VW = 1024;
const VH = 670;
const SOURCE = { x: 192, y: 441 };
// Hugs the visible rock in pond-big-rock.webp (measured: ~194 x 123 px on the 1024 x 670 stage).
const ROCK = { x: 472, y: 447, rx: 100, ry: 63 };
const POND = { x: 750, y: 435, rx: 124, ry: 66 };
const STEP = 7;
const MAX_STEPS = 125; // longest successful route is ~111 steps (measured), so 125 never blocks a real solution
const DEFAULT_GEOMETRY = { source: SOURCE, rock: ROCK, pond: POND };
const DEFAULT_LEAVES = [
  { id: 1, x: 380, y: 263, angle: 30 },
  { id: 2, x: 639, y: 283, angle: -35 },
];
const THIRD_LEAF = { id: 3, x: 735, y: 310, angle: -28 };

// Layout-debug helpers: pondLayout stores stage-% points; the game works in 1024x670 stage px.
const pxX = (pct) => (pct / 100) * VW;
const pxY = (pct) => (pct / 100) * VH;
export function layoutToLeafGeometry(layout) {
  const oval = (entry, base) => {
    const rx = pxX(entry.size);
    return { x: pxX(entry.x), y: pxY(entry.y), rx, ry: rx * (base.ry / base.rx) };
  };
  return {
    source: { x: pxX(layout.leafSource.x), y: pxY(layout.leafSource.y) },
    rock: oval(layout.leafRock, ROCK),
    pond: oval(layout.leafPond, POND),
  };
}
export function layoutToLeafStarts(layout) {
  return [1, 2, 3].map((id) => ({ id, x: pxX(layout[`leaf${id}`].x), y: pxY(layout[`leaf${id}`].y) }));
}
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const hitsOval = (x, y, oval) =>
  ((x - oval.x) / oval.rx) ** 2 + ((y - oval.y) / oval.ry) ** 2 < 1;

/**
 * Low-cost flow approximation, NOT an answer-slot puzzle.
 * - The stream moves until it meets the rock or the scene edge.
 * - A leaf affects water ONLY when the moving tip actually touches it.
 * - Leaf angle sets the direction for a short distance; then flow slowly levels out.
 * - Each leaf affects the stream once per recalculation, so a leaf cannot
 *   repeatedly spin water in circles.
 * - Reaching the pond is determined by water geometry, not leaf count/placement.
 */
export function simulateVakratundaFlow(leaves, geometry = DEFAULT_GEOMETRY) {
  const { source, rock, pond } = geometry;
  let x = source.x;
  let y = source.y;
  let angle = 0;
  let remainingSteer = 0;
  const points = [[x, y]];
  const contacts = [];
  const used = new Set();
  let reason = 'spent'; // ran out of length without reaching anything: it fades away

  for (let i = 0; i < MAX_STEPS; i += 1) {
    if (remainingSteer <= 0) {
      let closest = null;
      let closestDistance = Infinity;
      leaves.forEach((leaf) => {
        if (used.has(leaf.id)) return;
        const distance = Math.hypot(x - leaf.x, y - leaf.y);
        if (distance < 70 && distance < closestDistance) {
          closest = leaf;
          closestDistance = distance;
        }
      });
      if (closest) {
        used.add(closest.id);
        contacts.push({ id: closest.id, x, y });
        angle = closest.angle * Math.PI / 180;
        remainingSteer = 155;
      }
    }
    if (remainingSteer > 0) remainingSteer -= STEP;
    else angle += (0 - angle) * 0.055;
    angle = clamp(angle, -1.18, 1.18);

    const nextX = x + Math.cos(angle) * STEP;
    const nextY = y + Math.sin(angle) * STEP;
    if (nextX >= VW - 8 || nextY < 66 || nextY > VH - 15) {
      reason = 'edge';
      break;
    }
    if (hitsOval(nextX, nextY, rock)) {
      reason = 'rock';
      break;
    }
    x = nextX;
    y = nextY;
    points.push([x, y]);
    if (hitsOval(x, y, pond)) {
      reason = 'pond';
      break;
    }
  }
  return { points, contacts, used, reason };
}

// A smooth path from simulated samples. Avoid hundreds of visibly straight links.
function smoothPath(points) {
  if (points.length < 2) return '';
  const start = points[0];
  let path = `M${start[0].toFixed(1)} ${start[1].toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const [x, y] = points[i];
    const [nextX, nextY] = points[i + 1];
    path += `Q${x.toFixed(1)} ${y.toFixed(1)} ${((x + nextX) / 2).toFixed(1)} ${((y + nextY) / 2).toFixed(1)}`;
  }
  const last = points[points.length - 1];
  path += `L${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
  return path;
}


// ---- Hint ladder (GMB Hint Standard v1: L1 visual 10s, L2 visual+VO 18s, L3 = 8s after the L2 line ends) ----
const L1_MS = 10000;
const L2_MS = 18000;
const L3_GAP_MS = 8000;
const L2_END_LIMIT_MS = 12000; // the speech "ended" event is not always sent: never wait on it forever
const TICK_MS = 250;
const FINGER_SIZE = 96;
const HINT_LINES = {
  place: ['leafHintPlaceL2', 'leafHintPlaceL3'],
  rotate: ['leafHintRotateL2', 'leafHintRotateL3'],
  guide: ['leafHintGuideL2', 'leafHintGuideL3'],
};
// The blue touch circle of the hand image sits ~38% across / 18% down the picture.
const fingerAt = (x, y) => ({ x: x - FINGER_SIZE * 0.38, y: y - FINGER_SIZE * 0.18 });

function nearestPoint(points, x, y) {
  let best = points[0];
  let bestDist = Infinity;
  points.forEach((p) => {
    const d = Math.hypot(p[0] - x, p[1] - y);
    if (d < bestDist) { bestDist = d; best = p; }
  });
  return { point: best, dist: bestDist };
}

// A fingertip that slides a short way and fades: shows HOW to drag, never where to put the leaf.
function FingerDrag({ x, y, dx, dy, dur = 2.4 }) {
  const p = fingerAt(x, y);
  return (
    <g pointerEvents="none" className="vak-leaf-game__finger">
      <animateTransform attributeName="transform" type="translate"
        values={`0 0;0 0;${dx} ${dy};${dx} ${dy};0 0`} keyTimes="0;.15;.7;.85;1" dur={`${dur}s`} repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.12;.8;.92;1" dur={`${dur}s`} repeatCount="indefinite" />
      <image href={fingerPng} x={p.x} y={p.y} width={FINGER_SIZE} height={FINGER_SIZE} pointerEvents="none" />
    </g>
  );
}

// A fingertip that sweeps along the circle the round button travels on. It is drawn INSIDE the
// leaf's own group, so the leaf is never turned for the child: only the hand moves.
function FingerSwing({ sweep = 20, dur = 2.6 }) {
  const p = fingerAt(77, 0);
  return (
    <g pointerEvents="none" className="vak-leaf-game__finger">
      <animateTransform attributeName="transform" type="rotate"
        values={`${-sweep} 0 0;${sweep} 0 0;${-sweep} 0 0`} keyTimes="0;.5;1" dur={`${dur}s`} repeatCount="indefinite"
        calcMode="spline" keySplines=".4 0 .6 1;.4 0 .6 1" />
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.9;1" dur={`${dur}s`} repeatCount="indefinite" />
      <image href={fingerPng} x={p.x} y={p.y} width={FINGER_SIZE} height={FINGER_SIZE} pointerEvents="none" />
    </g>
  );
}

export default function VakratundaLeafWater({
  active = true,
  paused = false,
  onWaterReached = () => {},
  onFirstAttempt = () => {},
  allowThirdLeaf = true,
  showDebug = false,
  geometry = DEFAULT_GEOMETRY,
  leafStarts = null,
  // Voice + hint wiring from the scene (all optional, so the game also runs on its own).
  speakLine = null,       // (key, onEnd) => plays a scene VO line (sidebar-safe)
  isLineSpeaking = null,  // () => true while any scene line is speaking
  introDone = true,       // the opening line has finished: the hint clock may start
  introDemo = false,      // the opening line reached "Drag": show the short drag hand
}) {
  const [leaves, setLeaves] = useState(() => DEFAULT_LEAVES.map((leaf) => {
    const start = leafStarts?.find((s) => s.id === leaf.id);
    return start ? { ...leaf, x: start.x, y: start.y } : { ...leaf };
  }));
  const dragRef = useRef(null);
  // Layout debug: moving a leaf's start point in the panel repositions that leaf (until the
  // child has touched any leaf, so real play is never overridden).
  useEffect(() => {
    if (!leafStarts || dragRef.current) return;
    setLeaves((previous) => previous.map((leaf) => {
      const start = leafStarts.find((s) => s.id === leaf.id);
      return start && (start.x !== leaf.x || start.y !== leaf.y) && !leaf.moved ? { ...leaf, x: start.x, y: start.y } : leaf;
    }));
  }, [leafStarts]);
  const [selected, setSelected] = useState(null);
  const [extraAdded, setExtraAdded] = useState(false);
  const [hasAdjusted, setHasAdjusted] = useState(false);
  const [hasRotated, setHasRotated] = useState(false);
  const [finished, setFinished] = useState(false);
  const [level, setLevel] = useState(0);
  const [handleCue, setHandleCue] = useState(false);
  const svgRef = useRef(null);
  const notifiedRef = useRef(false);
  const flow = useMemo(() => simulateVakratundaFlow(leaves, geometry), [leaves, geometry]);
  const { source, rock, pond } = geometry;
  const artEnd = 378; // painted banks stop just inside the rock
  const path = useMemo(() => smoothPath(flow.points), [flow.points]);
  // The painted SVG supplies the banks and the resting water up to the rock; live water sits on top.
  const atPond = hasAdjusted && flow.reason === 'pond' && flow.contacts.length >= 2;
  const tip = flow.points[flow.points.length - 1];
  // Water that reaches nothing (ran off the stage or out of length) thins out over its last ~150px
  // instead of running hard to the edge. The gradient lies along the end of the path.
  const fading = flow.reason === 'edge' || flow.reason === 'spent';
  const fadeFrom = flow.points[Math.max(0, flow.points.length - 22)];

  // Latest values for handlers that must not go stale mid-drag.
  const leavesRef = useRef(leaves);
  leavesRef.current = leaves;
  const flowRef = useRef(flow);
  flowRef.current = flow;

  // What the child is doing decides which ladder runs (never keep saying "drag" once the leaf is in the water).
  const stage = flow.contacts.length === 0 ? 'place' : (hasRotated ? 'guide' : 'rotate');
  const lastContactId = flow.contacts.length ? flow.contacts[flow.contacts.length - 1].id : null;
  const unusedLeaves = leaves.filter((leaf) => !flow.used.has(leaf.id));
  const targetLeafId = stage === 'place'
    ? (unusedLeaves[0]?.id ?? leaves[0]?.id)
    : (lastContactId ?? leaves[0]?.id);
  const placeLeaf = unusedLeaves[0] || null;
  const otherLeaf = stage === 'guide'
    ? (unusedLeaves[0] || leaves.find((leaf) => leaf.id !== lastContactId) || null)
    : null;

  // ---- voice helpers ----
  const speakingNow = useCallback(() => !!(isLineSpeaking && isLineSpeaking()), [isLineSpeaking]);
  const waitTimersRef = useRef(new Set());
  // Coaching lines never cut a line that is speaking: wait for it to end (up to ~8s), then speak.
  const speakWhenFree = useCallback((key) => {
    if (!speakLine) return;
    const startedAt = Date.now();
    const attempt = () => {
      if (speakingNow() && Date.now() - startedAt < 8000) {
        const id = window.setTimeout(attempt, 300);
        waitTimersRef.current.add(id);
        return;
      }
      speakLine(key);
    };
    attempt();
  }, [speakLine, speakingNow]);
  useEffect(() => () => { waitTimersRef.current.forEach((id) => window.clearTimeout(id)); }, []);

  // ---- hint ladder ----
  const ladderRef = useRef({ idle: 0, l2Start: null, l2End: null, token: 0, stage: 'place' });
  const levelRef = useRef(0);
  const applyLevel = useCallback((next) => { levelRef.current = next; setLevel(next); }, []);
  const resetLadder = useCallback(() => {
    const ladder = ladderRef.current;
    ladder.idle = 0;
    ladder.l2Start = null;
    ladder.l2End = null;
    ladder.token += 1;
    applyLevel(0);
  }, [applyLevel]);
  // Real progress (a new stage) restarts the ladder; so does the sidebar/pause (fresh clock from L0).
  useEffect(() => { ladderRef.current.stage = stage; resetLadder(); }, [stage, resetLadder]);
  useEffect(() => { if (paused) resetLadder(); }, [paused, resetLadder]);

  useEffect(() => {
    if (!active || paused || finished || !introDone || atPond) return undefined;
    const id = window.setInterval(() => {
      const ladder = ladderRef.current;
      if (dragRef.current) return; // a finger on a leaf is not idle time
      ladder.idle += TICK_MS;
      const now = Date.now();
      const current = levelRef.current;
      const keys = HINT_LINES[ladder.stage];
      if (current === 0 && ladder.idle >= L1_MS) {
        applyLevel(1);
      } else if (current === 1 && ladder.idle >= L2_MS && !speakingNow()) {
        const token = ladder.token;
        ladder.l2Start = now;
        ladder.l2End = null;
        applyLevel(2);
        if (speakLine) {
          speakLine(keys[0], () => { if (ladderRef.current.token === token) ladderRef.current.l2End = Date.now(); });
        } else {
          ladder.l2End = now;
        }
      } else if (current === 2) {
        const ended = ladder.l2End ?? (now - ladder.l2Start >= L2_END_LIMIT_MS ? ladder.l2Start + L2_END_LIMIT_MS : null);
        if (ended && now - ended >= L3_GAP_MS && !speakingNow()) {
          applyLevel(3);
          speakLine?.(keys[1]);
        }
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [active, paused, finished, introDone, atPond, speakLine, speakingNow, applyLevel]);

  // ---- immediate "turn the leaf" teaching: the moment a leaf is released in the water ----
  const placedRef = useRef(false);
  const turningRef = useRef(false);
  const cueTimerRef = useRef(null);
  useEffect(() => () => { window.clearTimeout(cueTimerRef.current); }, []);
  useEffect(() => {
    if (placedRef.current || flow.contacts.length < 1 || selected !== null || !active || paused || finished) return;
    placedRef.current = true;
    speakWhenFree('leafPlaced');
    setHandleCue(true); // the round button pulses with the line, not 10s later
    cueTimerRef.current = window.setTimeout(() => setHandleCue(false), 4500);
  }, [flow.contacts.length, selected, active, paused, finished, speakWhenFree]);

  // Do not complete the scene from a transient drag-preview. Let the child release
  // the leaf and SEE the water arrive. Repositioning stays possible until then.
  useEffect(() => {
    if (!active || paused || finished || !atPond || selected !== null || dragRef.current) return undefined;
    const timeout = window.setTimeout(() => {
      if (notifiedRef.current) return;
      notifiedRef.current = true;
      setFinished(true);
      onWaterReached();
    }, 1050);
    return () => window.clearTimeout(timeout);
  }, [active, paused, finished, atPond, selected, onWaterReached]);

  const screenPoint = useCallback((event) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svg.getScreenCTM();
    return matrix ? point.matrixTransform(matrix.inverse()) : null;
  }, []);

  const beginDrag = useCallback((event, leaf, mode) => {
    if (!active || paused || finished) return;
    const point = screenPoint(event);
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const f = flowRef.current;
    dragRef.current = {
      id: leaf.id,
      mode,
      pointerId: event.pointerId,
      offsetX: point.x - leaf.x,
      offsetY: point.y - leaf.y,
      startAngle: leaf.angle,
      startTip: f.points[f.points.length - 1],
      changed: false,
    };
    setSelected(leaf.id);
  }, [active, paused, finished, screenPoint]);

  const moveDrag = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || paused || finished) return;
    const point = screenPoint(event);
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    setLeaves((previous) => previous.map((leaf) => {
      if (leaf.id !== drag.id) return leaf;
      const updated = drag.mode === 'rotate'
        ? { ...leaf, moved: true, angle: clamp(Math.atan2(point.y - leaf.y, point.x - leaf.x) * 180 / Math.PI, -68, 68) }
        : { ...leaf, moved: true, x: clamp(point.x - drag.offsetX, 58, VW - 60), y: clamp(point.y - drag.offsetY, 150, VH - 42) };
      if (Math.abs(updated.x - leaf.x) + Math.abs(updated.y - leaf.y) + Math.abs(updated.angle - leaf.angle) >= 0.5) {
        drag.changed = true;
      }
      return updated;
    }));
  }, [paused, finished, screenPoint]);

  const endDrag = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = null;
    if (drag.changed) {
      if (!hasAdjusted) onFirstAttempt();
      setHasAdjusted(true);
      // A genuine attempt that is not progress: a hint already showing stays; with none showing the idle clock restarts.
      if (levelRef.current === 0) ladderRef.current.idle = 0;
      if (drag.mode === 'rotate') {
        const leaf = leavesRef.current.find((l) => l.id === drag.id);
        const f = flowRef.current;
        const endTip = f.points[f.points.length - 1];
        const turned = leaf ? Math.abs(leaf.angle - drag.startAngle) : 0;
        const moved = Math.hypot(endTip[0] - drag.startTip[0], endTip[1] - drag.startTip[1]);
        // "The water is turning" only when a rotation by the child really changed the water's direction.
        if (leaf && f.used.has(leaf.id) && turned >= 12 && moved >= 50) {
          setHasRotated(true);
          if (!turningRef.current) {
            turningRef.current = true;
            speakWhenFree('leafTurning');
          }
        }
      }
    }
    setSelected(null);
  }, [hasAdjusted, onFirstAttempt, speakWhenFree]);

  // After success the finished water and leaves stay on screen, frozen.
  if (!active && !finished) return null;

  const dragVector = (leaf, far) => {
    const { point, dist } = nearestPoint(flow.points, leaf.x, leaf.y);
    const len = Math.max(1, dist);
    const reach = far ? Math.min(dist, 190) : Math.min(dist, 80);
    return { dx: ((point[0] - leaf.x) / len) * reach, dy: ((point[1] - leaf.y) / len) * reach };
  };
  const showPlaceDemo = placeLeaf && (introDemo || (stage === 'place' && level >= 2));
  const placeVec = showPlaceDemo ? dragVector(placeLeaf, level >= 3) : null;
  const guideVec = stage === 'guide' && level >= 3 && otherLeaf ? dragVector(otherLeaf, false) : null;
  const rotateDemoLevel = stage !== 'place' ? level : 0;

  return (
    <div className={`vak-leaf-game${paused || finished || !active ? ' vak-leaf-game--paused' : ''}`}>
      <svg
        ref={svgRef}
        className="vak-leaf-game__svg"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="none"
        aria-label="Move and rotate leaves to guide the water around the rock and into the pond"
      >
        <defs>
          <linearGradient id="vak-water-blue" x1="0" y1="0" x2="0.12" y2="1">
            <stop offset="0" stopColor="#8bdef5" />
            <stop offset=".35" stopColor="#59c3ed" />
            <stop offset=".7" stopColor="#36a9df" />
            <stop offset="1" stopColor="#2497cf" />
          </linearGradient>
          {/* Feather rather than cutting the painted source at a vertical edge. */}
          <linearGradient id="vak-source-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="white" />
            <stop offset=".95" stopColor="white" />
            <stop offset="1" stopColor="black" />
          </linearGradient>
          <mask id="vak-source-mask" maskUnits="userSpaceOnUse" x="0" y="296" width={artEnd} height="245">
            <rect x="0" y="296" width={artEnd} height="245" fill="url(#vak-source-fade)" />
          </mask>
          {/* The live water melts into the painted stream at its start instead of starting with a hard cap. */}
          <linearGradient id="vak-head-fade" gradientUnits="userSpaceOnUse" x1={source.x - 14} y1="0" x2={source.x + 34} y2="0">
            <stop offset="0" stopColor="black" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <mask id="vak-head-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={VW} height={VH}>
            <rect x="0" y="0" width={VW} height={VH} fill="url(#vak-head-fade)" />
          </mask>
          <linearGradient id="vak-tail-fade" gradientUnits="userSpaceOnUse"
            x1={fadeFrom[0]} y1={fadeFrom[1]} x2={tip[0]} y2={tip[1]}>
            <stop offset="0" stopColor="white" />
            <stop offset="1" stopColor="black" />
          </linearGradient>
          <mask id="vak-tail-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={VW} height={VH}>
            <rect x="0" y="0" width={VW} height={VH} fill="url(#vak-tail-fade)" />
          </mask>
          <clipPath id="vak-source-clip"><rect x="0" y="296" width={artEnd} height="245" /></clipPath>
        </defs>

        {/* Solid, visible water at rest: no 'Let water flow' button and no 25px teaser line. */}
        {/* Approved artwork supplies the organic grassy banks ONLY at the source. */}
        <g transform={`translate(${source.x - SOURCE.x} ${source.y - SOURCE.y})`}>
          <image
            href={streamSvg} x="-9" y="296" width="705" height="236"
            preserveAspectRatio="none" clipPath="url(#vak-source-clip)" mask="url(#vak-source-mask)"
            pointerEvents="none"
          />
        </g>
        <g mask="url(#vak-head-mask)">
          <path d={path} className="vak-leaf-game__water-body" mask={fading ? 'url(#vak-tail-mask)' : undefined} />
        </g>
        {flow.contacts.map((contact) => (
          <g key={contact.id} pointerEvents="none">
            <circle cx={contact.x} cy={contact.y} r="15" className="vak-leaf-game__contact" />
          </g>
        ))}
        {!fading && <circle cx={tip[0]} cy={tip[1]} r="9" className="vak-leaf-game__tip" />}
        {leaves.map((leaf) => {
          const isTarget = leaf.id === targetLeafId;
          const pulseLeaf = stage === 'place' && level >= 1 && isTarget;
          const pulseHandle = isTarget && ((stage !== 'place' && level >= 1) || handleCue);
          return (
            <g key={leaf.id} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}>
              {selected === leaf.id && <rect x="-72" y="-37" width="144" height="74" rx="22" className="vak-leaf-game__selection" />}
              <image
                href={leafPng} x="-65" y="-30" width="130" height="60"
                preserveAspectRatio="xMidYMid meet"
                className={`${flow.used.has(leaf.id) ? 'vak-leaf-game__leaf--used' : ''}${pulseLeaf ? ' vak-leaf-game__leaf--hint' : ''}`}
                onPointerDown={(event) => beginDrag(event, leaf, 'move')}
                onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
              />
              <circle cx="0" cy="0" r="31" fill="transparent"
                onPointerDown={(event) => beginDrag(event, leaf, 'move')}
                onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
              />
              {pulseHandle && (
                <g pointerEvents="none" className="vak-leaf-game__arc">
                  <path d="M66.7 -38.5 A77 77 0 0 1 66.7 38.5" />
                  <path d="M66.7 38.5 l10.4 -6 M66.7 38.5 l0 -12" />
                </g>
              )}
              <circle cx="77" cy="0" r="19" className={`vak-leaf-game__rotate${pulseHandle ? ' vak-leaf-game__rotate--hint' : ''}`}
                onPointerDown={(event) => beginDrag(event, leaf, 'rotate')}
                onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
              />
              <path d="M-44 -16 L39 -16 M27 -27 L39 -16 L27 -5" className="vak-leaf-game__dir" />
              <text x="77" y="7" textAnchor="middle" fontSize="22" fill="#70491c" pointerEvents="none">↻</text>
              {isTarget && rotateDemoLevel >= 2 && (
                <FingerSwing sweep={rotateDemoLevel >= 3 && stage === 'rotate' ? 34 : 20} dur={rotateDemoLevel >= 3 ? 3.2 : 2.4} />
              )}
            </g>
          );
        })}
        {placeVec && <FingerDrag x={placeLeaf.x} y={placeLeaf.y} dx={placeVec.dx} dy={placeVec.dy} dur={level >= 3 ? 3 : 2.4} />}
        {guideVec && <FingerDrag x={otherLeaf.x} y={otherLeaf.y} dx={guideVec.dx} dy={guideVec.dy} />}
        {showDebug && (
          <>
            <ellipse cx={rock.x} cy={rock.y} rx={rock.rx} ry={rock.ry} className="vak-leaf-game__debug" />
            <ellipse cx={pond.x} cy={pond.y} rx={pond.rx} ry={pond.ry} className="vak-leaf-game__debug" />
            <circle cx={source.x} cy={source.y} r="10" className="vak-leaf-game__debug" />
          </>
        )}
      </svg>
      {!finished && allowThirdLeaf && !extraAdded && (
        <button type="button"
          className={`vak-leaf-game__extra${stage === 'guide' && level >= 3 ? ' vak-leaf-game__extra--hint' : ''}`}
          onClick={() => {
            setExtraAdded(true);
            const start = leafStarts?.find((s) => s.id === 3);
            setLeaves((previous) => [...previous, start ? { ...THIRD_LEAF, x: start.x, y: start.y } : { ...THIRD_LEAF }]);
          }}>+ Third leaf</button>
      )}
      {showDebug && <div className="vak-leaf-game__status">
        {flow.reason} · leaf contacts: {flow.contacts.length} · stage {stage} · hint L{level} · {atPond ? 'water at pond' : 'keep experimenting'}
      </div>}
    </div>
  );
}
