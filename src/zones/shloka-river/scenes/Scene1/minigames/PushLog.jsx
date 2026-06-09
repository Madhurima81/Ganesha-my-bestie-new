import { useState, useRef, useCallback, useEffect } from 'react';

/*
  PushLog — Mahakaya (strength). A heavy log PNG lies ACROSS the river, pinning
  an elephant calf. Child drags the log sideways (or it slides as they pull the
  handle) until it clears -> calf floats free + bobs -> onSolved().

  Drag-based (not rapid-tap) so it matches BendReeds' gesture language and the
  passive-event fix applies the same way.

  Contract: props { assets, onProgress, onSolved }
    assets.log   -> log PNG (optional; fallback rect)
    assets.calf  -> calf PNG (optional; fallback circle)
*/

const W = 560, H = 380;
const LOG_START = 180;   // log left-edge x at rest (lying across river)
const LOG_W = 240, LOG_H = 54;
const CLEAR = 300;       // push log this far right to clear the calf

export default function PushLog({ assets = {}, onProgress, onSolved }) {
  const [push, setPush] = useState(0);     // how far log moved
  const [solved, setSolved] = useState(false);
  const [calfXY, setCalfXY] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const drag = useRef(false);
  const lastX = useRef(0);
  const pr = useRef(0);

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
      setCalfXY({ x: -e * 70, y: e * 14 }); // calf drifts to open water + settles
      if (p < 1) requestAnimationFrame(step);
      else setTimeout(() => onSolved?.(), 400);
    };
    requestAnimationFrame(step);
  }, [onSolved]);

  const move = useCallback((clientX) => {
    if (solved || !drag.current) return;
    const x = toX(clientX);
    const dx = x - lastX.current;
    lastX.current = x;
    pr.current = Math.max(0, Math.min(CLEAR + 20, pr.current + dx));
    setPush(pr.current);
    onProgress?.(Math.min(1, pr.current / CLEAR));
    if (pr.current >= CLEAR) finish();
  }, [solved, onProgress, finish]);

  useEffect(() => {
    const el = svgRef.current; if (!el) return;
    const tm = (e) => { move(e.touches[0].clientX); e.preventDefault(); };
    el.addEventListener('touchmove', tm, { passive: false });
    return () => el.removeEventListener('touchmove', tm);
  }, [move]);

  const startDrag = (clientX) => { if (!solved) { drag.current = true; lastX.current = toX(clientX); } };
  const end = () => { drag.current = false; };

  const logX = LOG_START + push;
  const bob = solved ? { animation: 'calfBob 2s ease-in-out infinite', transformOrigin: '250px 270px' } : {};

  return (
    <div style={{ textAlign: 'center', userSelect: 'none' }}>
      <style>{`@keyframes calfBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
      <p style={{ fontFamily: 'Nunito, sans-serif', color: '#2E7D32', fontWeight: 700 }}>
        Push the heavy log to free the elephant calf!
      </p>

      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', maxWidth: 560, touchAction: 'none' }}
        onPointerMove={(e) => move(e.clientX)} onPointerUp={end}>

        <path d="M0 250 Q280 235 560 250 L560 380 L0 380 Z" fill="#9CCB6A" />
        <rect x="0" y="255" width={W} height="125" fill="#3FA9E0" />

        {/* calf pinned behind the log, floats free on solve */}
        <g transform={`translate(${calfXY.x}, ${calfXY.y})`} style={bob}>
          {assets.calf
            ? <image href={assets.calf} x="218" y="238" width="64" height="64" />
            : <circle cx="250" cy="270" r="26" fill="#B0BEC5" />}
          {solved && <ellipse cx="250" cy="306" rx="46" ry="9" fill="#5DBCEE" opacity="0.4" />}
        </g>

        {/* the log — slides right as pushed */}
        {assets.log
          ? <image href={assets.log} x={logX} y="248" width={LOG_W} height={LOG_H} />
          : <rect x={logX} y="252" width={LOG_W} height={LOG_H} rx="22" fill="#795548" stroke="#5D4037" strokeWidth="3" />}

        {/* strength meter */}
        <rect x="40" y="350" width="280" height="14" rx="7" fill="#fff" opacity="0.5" />
        <rect x="40" y="350" width={280 * Math.min(1, push / CLEAR)} height="14" rx="7" fill="#FF5722" />

        {/* push handle on the log's right end */}
        <circle cx={logX + LOG_W - 10} cy="275" r="26" fill="#FF8C2B" opacity="0.22"
          onPointerDown={(e) => startDrag(e.clientX)} />
        <circle cx={logX + LOG_W - 10} cy="275" r="13" fill="#FF8C2B" stroke="#fff" strokeWidth="3"
          style={{ cursor: 'grab' }} onPointerDown={(e) => startDrag(e.clientX)} />
      </svg>
    </div>
  );
}
