import { useState, useRef, useCallback, useEffect } from 'react';

/*
  BendReeds — "pod" version (the one Madhurima picked).
  TWO reeds form a closed cage around the duck. Left handle pulls the left reed
  left, right handle pulls the right reed right -> the pod opens -> duck floats
  out onto open water and bobs -> onSolved().

  Each reed is a quadratic curve from a shared BASE to a shared TIP; the control
  point bows outward as you drag, so the two curves bow apart like opening hands.

  Contract: props { assets, onProgress, onSolved }
    assets.duckling -> PNG url (optional; fallback drawn)
*/

const W = 560, H = 380;
const BASE = { x: 280, y: 300 };   // reeds root together in water
const TIP  = { x: 280, y: 150 };   // reeds meet at top
const REST = 70;                   // resting bow (closed pod width)
const OPEN = 150;                  // bow needed to count as "open"

function reed(side, bow) {
  // side -1 = left reed, +1 = right reed. bow = how far the belly pushes out.
  const cx = BASE.x + side * bow;
  const cy = (BASE.y + TIP.y) / 2;
  return `M ${BASE.x} ${BASE.y} Q ${cx} ${cy} ${TIP.x} ${TIP.y}`;
}

export default function BendReeds({ assets = {}, onProgress, onSolved }) {
  const [lBow, setLBow] = useState(REST);
  const [rBow, setRBow] = useState(REST);
  const [solved, setSolved] = useState(false);
  const [duckXY, setDuckXY] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const drag = useRef(null);
  const lr = useRef(REST), rr = useRef(REST);

  const toX = (clientX) => {
    const r = svgRef.current.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * W;
  };

  const finish = useCallback(() => {
    setSolved(true);
    const startT = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - startT) / 1100);
      const e = 1 - Math.pow(1 - p, 2);
      setDuckXY({ x: e * 90, y: e * 16 }); // drift to open water + settle
      if (p < 1) requestAnimationFrame(step);
      else setTimeout(() => onSolved?.(), 400);
    };
    requestAnimationFrame(step);
  }, [onSolved]);

  const move = useCallback((clientX) => {
    if (solved || !drag.current) return;
    const x = toX(clientX);
    if (drag.current === 'L') { lr.current = Math.max(REST, Math.min(OPEN + 30, BASE.x - x)); setLBow(lr.current); }
    else { rr.current = Math.max(REST, Math.min(OPEN + 30, x - BASE.x)); setRBow(rr.current); }
    onProgress?.(Math.min(1, ((lr.current - REST) + (rr.current - REST)) / ((OPEN - REST) * 2)));
    if (lr.current >= OPEN && rr.current >= OPEN) finish();
  }, [solved, onProgress, finish]);

  useEffect(() => {
    const el = svgRef.current; if (!el) return;
    const tm = (e) => { move(e.touches[0].clientX); e.preventDefault(); };
    el.addEventListener('touchmove', tm, { passive: false });
    return () => el.removeEventListener('touchmove', tm);
  }, [move]);

  const start = (which) => { if (!solved) drag.current = which; };
  const end = () => { drag.current = null; };

  const bellyL = BASE.x - lBow;   // left handle x (rides the left belly)
  const bellyR = BASE.x + rBow;   // right handle x
  const bellyY = (BASE.y + TIP.y) / 2;
  const bob = solved ? { animation: 'duckBob 2s ease-in-out infinite', transformOrigin: '280px 280px' } : {};

  return (
    <div style={{ textAlign: 'center', userSelect: 'none' }}>
      <style>{`@keyframes duckBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
      <p style={{ fontFamily: 'Nunito, sans-serif', color: '#2E7D32', fontWeight: 700 }}>
        Sweep the reeds apart to free the duckling!
      </p>

      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', maxWidth: 560, touchAction: 'none' }}
        onPointerMove={(e) => move(e.clientX)} onPointerUp={end}>

        {/* duck behind the pod, floats out + bobs */}
        <g transform={`translate(${duckXY.x}, ${duckXY.y})`} style={bob}>
          {assets.duckling
            ? <image href={assets.duckling} x="248" y="248" width="64" height="64" />
            : <circle cx="280" cy="280" r="26" fill="#FFD23F" />}
          {solved && <ellipse cx="280" cy="316" rx="46" ry="9" fill="#5DBCEE" opacity="0.4" />}
        </g>

        {/* the two reeds forming the pod */}
        <path d={reed(-1, lBow)} fill="none" stroke="#3E8E3E" strokeWidth="11" strokeLinecap="round" />
        <path d={reed( 1, rBow)} fill="none" stroke="#3E8E3E" strokeWidth="11" strokeLinecap="round" />
        {/* cattail head where they meet */}
        <ellipse cx={TIP.x} cy={TIP.y - 10} rx="9" ry="20" fill="#A9742E" />

        {/* handles ride each belly */}
        <circle cx={bellyL} cy={bellyY} r="26" fill="#FF8C2B" opacity="0.22" onPointerDown={() => start('L')} />
        <circle cx={bellyL} cy={bellyY} r="13" fill="#FF8C2B" stroke="#fff" strokeWidth="3"
          style={{ cursor: 'grab' }} onPointerDown={() => start('L')} />
        <circle cx={bellyR} cy={bellyY} r="26" fill="#FF8C2B" opacity="0.22" onPointerDown={() => start('R')} />
        <circle cx={bellyR} cy={bellyY} r="13" fill="#FF8C2B" stroke="#fff" strokeWidth="3"
          style={{ cursor: 'grab' }} onPointerDown={() => start('R')} />
      </svg>
    </div>
  );
}
