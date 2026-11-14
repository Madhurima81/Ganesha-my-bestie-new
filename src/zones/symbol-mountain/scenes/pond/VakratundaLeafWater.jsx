import React, { useCallback, useMemo, useRef, useState } from 'react';
import leafPng from './assets/gmb_curved_leaf_transparent.png';
import streamSvg from './assets/gmb_vakratunda_stream.svg';
import './VakratundaLeafWater.css';

// All coordinates use the SAME 1024 × 670 design stage as PondScene.
// Unlike a tracing puzzle, each leaf can be moved/rotated anywhere; flow is simulated
// from leaf positions, not matched against hidden answer slots.
const VW = 1024;
const VH = 670;
const SOURCE = { x: 148, y: 462 };
const ROCK = { x: 417, y: 455, rx: 87, ry: 65 };
const POND = { x: 750, y: 457, rx: 125, ry: 81 };
const STEP = 6;
const START_LEAVES = [
  { id: 1, x: 285, y: 578, angle: 30 },
  { id: 2, x: 542, y: 583, angle: -35 },
];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const insideOval = (x, y, s) => ((x-s.x)/s.rx)**2 + ((y-s.y)/s.ry)**2 < 1;

function simulateFlow(leaves) {
  let x = SOURCE.x, y = SOURCE.y, angle = 0;
  let steering = null, remaining = 0;
  const used = new Set();
  const contacts = [];
  const points = [[x, y]];
  let reason = 'edge';
  for (let i = 0; i < 165; i++) {
    if (steering === null) {
      let nearest = -1, distance = Infinity;
      leaves.forEach((leaf, index) => {
        if (used.has(leaf.id)) return;
        // Leaves affect the water only on actual contact with its current tip.
        const d = Math.hypot(x - leaf.x, y - leaf.y);
        if (d < 54 && d < distance) { nearest = index; distance = d; }
      });
      if (nearest !== -1) {
        const leaf = leaves[nearest];
        steering = leaf.id;
        used.add(leaf.id);
        remaining = 145;
        angle = leaf.angle * Math.PI / 180;
        contacts.push({ id: leaf.id, x, y });
      }
    }
    if (steering !== null) {
      remaining -= STEP;
      if (remaining <= 0) steering = null;
    } else {
      // Unguided trickle gradually settles toward the natural downhill direction.
      // It does NOT aim at the pond, so no invisible target snapping.
      angle += (0 - angle) * 0.055;
    }
    angle = clamp(angle, -1.12, 1.12);
    const nx = x + Math.cos(angle) * STEP;
    const ny = y + Math.sin(angle) * STEP;
    if (nx >= VW - 8 || ny < 85 || ny >= VH - 18) { reason = 'edge'; break; }
    if (insideOval(nx, ny, ROCK)) { reason = 'rock'; break; }
    x = nx; y = ny;
    points.push([x, y]);
    if (insideOval(x, y, POND)) { reason = 'pond'; break; }
  }
  return { points, reason, contacts, used };
}
const toPath = points => points.map(([x,y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');

export default function VakratundaLeafWater({
  active = true,
  onWaterReached = () => {},
  onWaterLost = () => {},
  onFirstAttempt = () => {},
  allowThirdLeaf = true,
  showDebug = false,
}) {
  const [leaves, setLeaves] = useState(START_LEAVES);
  const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState(null);
  const [placedExtra, setPlacedExtra] = useState(false);
  const dragRef = useRef(null);
  const svgRef = useRef(null);
  const arrivedRef = useRef(false);
  const flow = useMemo(() => simulateFlow(leaves), [leaves]);
  const arrived = started && flow.reason === 'pond';

  // Notify parent only on reach/loss transitions, not every animation frame.
  React.useEffect(() => {
    if (!active || !started) return;
    if (arrived && !arrivedRef.current) { arrivedRef.current = true; onWaterReached(); }
    else if (!arrived && arrivedRef.current) { arrivedRef.current = false; onWaterLost(); }
  }, [active, started, arrived, onWaterReached, onWaterLost]);

  const screenPoint = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    const matrix = svg.getScreenCTM();
    return matrix ? p.matrixTransform(matrix.inverse()) : null;
  }, []);

  const begin = useCallback((e, leaf, mode) => {
    if (!active || arrivedRef.current) return;
    const p = screenPoint(e); if (!p) return;
    e.preventDefault(); e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelected(leaf.id);
    dragRef.current = {
      id: leaf.id, mode,
      offsetX: p.x - leaf.x, offsetY: p.y - leaf.y,
    };
  }, [active, screenPoint]);
  const move = useCallback((e) => {
    const drag = dragRef.current;
    if (!drag) return;
    const p = screenPoint(e); if (!p) return;
    e.preventDefault();
    setLeaves(prev => prev.map(leaf => {
      if (leaf.id !== drag.id) return leaf;
      if (drag.mode === 'rotate') {
        return { ...leaf, angle: clamp(Math.atan2(p.y - leaf.y, p.x - leaf.x) * 180/Math.PI, -68, 68) };
      }
      return { ...leaf, x: clamp(p.x - drag.offsetX, 52, VW - 52), y: clamp(p.y - drag.offsetY, 300, VH - 45) };
    }));
  }, [screenPoint]);
  const end = useCallback(() => { dragRef.current = null; }, []);

  if (!active) return null;
  const waterPath = started ? toPath(flow.points) : `M${SOURCE.x} ${SOURCE.y}l25 0`;
  const tip = started ? flow.points[flow.points.length-1] : [SOURCE.x+25,SOURCE.y];

  return <div className="vak-leaf-game">
    <svg ref={svgRef} className="vak-leaf-game__svg" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" aria-label="Guide the water to the lotus with movable leaves">
      <defs>
        <linearGradient id="vak-water-blue" x1="0" y1="0" x2=".1" y2="1">
          <stop offset="0" stopColor="#86dfff"/><stop offset=".35" stopColor="#5dcaf7"/>
          <stop offset=".75" stopColor="#3aaff0"/><stop offset="1" stopColor="#258dda"/>
        </linearGradient>
        <clipPath id="vak-source-crop"><rect x="0" y="350" width="153" height="215"/></clipPath>
      </defs>
      {/* The approved SVG is a fixed, cropped stream SOURCE. The remainder is dynamic. */}
      <image href={streamSvg} x="-9" y="350" width="705" height="236" preserveAspectRatio="none" clipPath="url(#vak-source-crop)" pointerEvents="none"/>
      <path d={waterPath} className="vak-leaf-game__flow"/>
      <path d={waterPath} className="vak-leaf-game__flow-shine"/>
      {started && <circle cx={tip[0]} cy={tip[1]} r="7" className="vak-leaf-game__tip" />}
      {flow.contacts.filter(() => started).map(c => <g key={c.id} pointerEvents="none">
        <circle cx={c.x} cy={c.y} r="18" className="vak-leaf-game__contact" />
        <circle cx={c.x} cy={c.y} r="4" fill="#ddfaff"/>
      </g>)}
      {leaves.map(leaf => {
        const used = started && flow.used.has(leaf.id);
        return <g key={leaf.id} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}>
          {selected === leaf.id && <rect x="-70" y="-34" width="140" height="70" rx="18" className="vak-leaf-game__selection" />}
          <image href={leafPng} x="-65" y="-30" width="130" height="60" preserveAspectRatio="xMidYMid meet" className={used?'vak-leaf-game__leaf--used':''} onPointerDown={e=>begin(e,leaf,'move')} onPointerMove={move} onPointerUp={end} onPointerCancel={end}/>
          <circle cx="0" cy="0" r="31" fill="transparent" onPointerDown={e=>begin(e,leaf,'move')} onPointerMove={move} onPointerUp={end} onPointerCancel={end}/>
          <circle cx="77" cy="0" r="19" className="vak-leaf-game__rotate" onPointerDown={e=>begin(e,leaf,'rotate')} onPointerMove={move} onPointerUp={end} onPointerCancel={end} />
          <text x="77" y="7" textAnchor="middle" fontSize="22" fill="#70491c" pointerEvents="none">↻</text>
        </g>;
      })}
      {showDebug && <>
        <ellipse cx={ROCK.x} cy={ROCK.y} rx={ROCK.rx} ry={ROCK.ry} className="vak-leaf-game__debug" />
        <ellipse cx={POND.x} cy={POND.y} rx={POND.rx} ry={POND.ry} className="vak-leaf-game__debug" />
      </>}
    </svg>
    {!started && <button type="button" className="vak-leaf-game__start" onClick={() => {setStarted(true);onFirstAttempt();}}>Let water flow</button>}
    {started && allowThirdLeaf && !placedExtra && <button type="button" className="vak-leaf-game__extra" onClick={() => {
      setPlacedExtra(true);
      setLeaves(prev => [...prev, {id:3,x:575,y:603,angle:-28}]);
    }}>+ Third leaf</button>}
    {showDebug && <span className="vak-leaf-game__status">{started?flow.reason:'not started'} · contacts {flow.contacts.length}</span>}
  </div>;
}
