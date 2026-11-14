import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import leafPng from './assets/gmb_curved_leaf_transparent.png';
import streamSvg from './assets/gmb_vakratunda_stream.svg';
import './VakratundaLeafWater.css';

// Coordinates are in the SAME 1024 x 670 stage as PondScene.
// Everything is computed from the LIVE water path; there are no leaf slots.
const VW = 1024;
const VH = 670;
const SOURCE = { x: 172, y: 462 };
const ROCK = { x: 417, y: 455, rx: 87, ry: 65 };
const POND = { x: 750, y: 489, rx: 124, ry: 66 };
const STEP = 5;
const DEFAULT_LEAVES = [
  { id: 1, x: 285, y: 578, angle: 30 },
  { id: 2, x: 542, y: 583, angle: -35 },
];
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
export function simulateVakratundaFlow(leaves) {
  let x = SOURCE.x;
  let y = SOURCE.y;
  let angle = 0;
  let remainingSteer = 0;
  const points = [[x, y]];
  const contacts = [];
  const used = new Set();
  let reason = 'edge';

  for (let i = 0; i < 195; i += 1) {
    if (remainingSteer <= 0) {
      let closest = null;
      let closestDistance = Infinity;
      leaves.forEach((leaf) => {
        if (used.has(leaf.id)) return;
        const distance = Math.hypot(x - leaf.x, y - leaf.y);
        if (distance < 43 && distance < closestDistance) {
          closest = leaf;
          closestDistance = distance;
        }
      });
      if (closest) {
        used.add(closest.id);
        contacts.push({ id: closest.id, x, y });
        angle = clamp(closest.angle * Math.PI / 180, -1.14, 1.14);
        remainingSteer = 130;
      }
    }
    if (remainingSteer > 0) remainingSteer -= STEP;
    else angle += (0 - angle) * 0.026;

    const nextX = x + Math.cos(angle) * STEP;
    const nextY = y + Math.sin(angle) * STEP;
    if (nextX >= VW - 8 || nextY < 160 || nextY > VH - 15) {
      reason = 'edge';
      break;
    }
    if (hitsOval(nextX, nextY, ROCK)) {
      reason = 'rock';
      break;
    }
    x = nextX;
    y = nextY;
    points.push([x, y]);
    if (hitsOval(x, y, POND)) {
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

export default function VakratundaLeafWater({
  active = true,
  paused = false,
  onWaterReached = () => {},
  onFirstAttempt = () => {},
  allowThirdLeaf = true,
  showDebug = false,
}) {
  const [leaves, setLeaves] = useState(() => DEFAULT_LEAVES.map((leaf) => ({ ...leaf })));
  const [selected, setSelected] = useState(null);
  const [extraAdded, setExtraAdded] = useState(false);
  const [hasAdjusted, setHasAdjusted] = useState(false);
  const [finished, setFinished] = useState(false);
  const dragRef = useRef(null);
  const svgRef = useRef(null);
  const notifiedRef = useRef(false);
  const flow = useMemo(() => simulateVakratundaFlow(leaves), [leaves]);
  const path = useMemo(() => smoothPath(flow.points), [flow.points]);
  const atPond = hasAdjusted && flow.reason === 'pond' && flow.contacts.length >= 2;
  const tip = flow.points[flow.points.length - 1];

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
    dragRef.current = {
      id: leaf.id,
      mode,
      pointerId: event.pointerId,
      offsetX: point.x - leaf.x,
      offsetY: point.y - leaf.y,
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
        ? { ...leaf, angle: clamp(Math.atan2(point.y - leaf.y, point.x - leaf.x) * 180 / Math.PI, -68, 68) }
        : { ...leaf, x: clamp(point.x - drag.offsetX, 58, VW - 60), y: clamp(point.y - drag.offsetY, 255, VH - 42) };
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
    }
    setSelected(null);
  }, [hasAdjusted, onFirstAttempt]);

  if (!active) return null;

  return (
    <div className={`vak-leaf-game${paused ? ' vak-leaf-game--paused' : ''}`}>
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
            <stop offset=".68" stopColor="white" />
            <stop offset="1" stopColor="black" />
          </linearGradient>
          <mask id="vak-source-mask" maskUnits="userSpaceOnUse" x="0" y="350" width="225" height="245">
            <rect x="0" y="350" width="225" height="245" fill="url(#vak-source-fade)" />
          </mask>
          <clipPath id="vak-source-clip"><rect x="0" y="350" width="225" height="245" /></clipPath>
        </defs>

        {/* Solid, visible water at rest: no 'Let water flow' button and no 25px teaser line. */}
        <path d={path} className="vak-leaf-game__water-bank-shadow" />
        <path d={path} className="vak-leaf-game__water-body" />
        <path d={path} className="vak-leaf-game__water-inner" />
        <path d={path} className="vak-leaf-game__water-highlight" />
        {/* Approved artwork supplies the organic grassy banks ONLY at the source. */}
        <image
          href={streamSvg} x="-9" y="350" width="705" height="236"
          preserveAspectRatio="none" clipPath="url(#vak-source-clip)" mask="url(#vak-source-mask)"
          pointerEvents="none"
        />
        {flow.contacts.map((contact) => (
          <g key={contact.id} pointerEvents="none">
            <circle cx={contact.x} cy={contact.y} r="15" className="vak-leaf-game__contact" />
          </g>
        ))}
        <circle cx={tip[0]} cy={tip[1]} r="5" className="vak-leaf-game__tip" />
        {leaves.map((leaf) => (
          <g key={leaf.id} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}>
            {selected === leaf.id && <rect x="-72" y="-37" width="144" height="74" rx="22" className="vak-leaf-game__selection" />}
            <image
              href={leafPng} x="-65" y="-30" width="130" height="60"
              preserveAspectRatio="xMidYMid meet"
              className={flow.used.has(leaf.id) ? 'vak-leaf-game__leaf--used' : ''}
              onPointerDown={(event) => beginDrag(event, leaf, 'move')}
              onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
            />
            <circle cx="0" cy="0" r="31" fill="transparent"
              onPointerDown={(event) => beginDrag(event, leaf, 'move')}
              onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
            />
            <circle cx="77" cy="0" r="19" className="vak-leaf-game__rotate"
              onPointerDown={(event) => beginDrag(event, leaf, 'rotate')}
              onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}
            />
            <text x="77" y="7" textAnchor="middle" fontSize="22" fill="#70491c" pointerEvents="none">↻</text>
          </g>
        ))}
        {showDebug && (
          <>
            <ellipse cx={ROCK.x} cy={ROCK.y} rx={ROCK.rx} ry={ROCK.ry} className="vak-leaf-game__debug" />
            <ellipse cx={POND.x} cy={POND.y} rx={POND.rx} ry={POND.ry} className="vak-leaf-game__debug" />
          </>
        )}
      </svg>
      {!finished && allowThirdLeaf && !extraAdded && (
        <button type="button" className="vak-leaf-game__extra" onClick={() => {
          setExtraAdded(true);
          setLeaves((previous) => [...previous, { id: 3, x: 600, y: 604, angle: -28 }]);
        }}>+ Third leaf</button>
      )}
      {showDebug && <div className="vak-leaf-game__status">
        {flow.reason} · leaf contacts: {flow.contacts.length} · {atPond ? 'water at pond' : 'keep experimenting'}
      </div>}
    </div>
  );
}
