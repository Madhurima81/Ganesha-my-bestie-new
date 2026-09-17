import React, { useCallback, useRef, useState } from 'react';

import logsBare from '../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/logs-bare.webp';
import supportLogsTied from '../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/bridge-support-logs.webp';

// Standalone sandbox for comparing rope-tie mechanics in isolation — no
// beat player, no story beats 0-3 to play through first. Reload to reset
// all three. Each panel uses the real log art; the rope/clamp itself is
// pure SVG (matches the "no PNG for the rope" decision already made for
// BeatPlayerGame).

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function Panel({ title, blurb, children }) {
  return (
    <div style={{
      flex: '1 1 300px', maxWidth: 360, background: '#fff', borderRadius: 16,
      boxShadow: '0 4px 14px rgba(0,0,0,0.12)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '14px 16px 10px', fontFamily: 'Baloo 2, sans-serif' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#5D2E0A' }}>{title}</div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#7a6a5a', marginTop: 2 }}>{blurb}</div>
      </div>
      {children}
    </div>
  );
}

function Stage({ children }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', background: 'linear-gradient(#cfe8fb, #eaf6d8)', overflow: 'hidden' }}>
      {children}
    </div>
  );
}

function LogArt({ style }) {
  return <img src={logsBare} alt="" draggable={false} style={{ position: 'absolute', left: '50%', top: '55%', transform: 'translate(-50%, -50%)', width: '62%', pointerEvents: 'none', ...style }} />;
}

// ---- Variant A: Press & Hold — clamp closes while held, ported from ----
// ---- the live BeatPlayerGame implementation.                       ----
function PressHoldVariant() {
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState('idle'); // idle | holding | tied
  const rafRef = useRef(null);
  const startRef = useRef(0);

  const HOLD_MS = 1100;
  const cx = 50, cy = 55;

  const stopRaf = () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; };

  const startHold = (e) => {
    e.preventDefault();
    if (state === 'tied') return;
    setState('holding');
    startRef.current = performance.now();
    const tick = (now) => {
      const p = clamp((now - startRef.current) / HOLD_MS, 0, 1);
      setProgress(p);
      if (p >= 1) { setState('tied'); stopRaf(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const release = () => {
    stopRaf();
    if (state !== 'tied') {
      setState('idle');
      // ease back down instead of snapping
      const start = performance.now();
      const startP = progress;
      const decay = (now) => {
        const t = clamp((now - start) / 300, 0, 1);
        setProgress(startP * (1 - t));
        if (t < 1) rafRef.current = requestAnimationFrame(decay);
      };
      rafRef.current = requestAnimationFrame(decay);
    }
  };

  const reset = () => { stopRaf(); setProgress(0); setState('idle'); };

  const maxGap = 9, minGap = 1.2;
  const gap = state === 'tied' ? minGap : maxGap - (maxGap - minGap) * progress;
  const armReach = 13, armLen = 9;
  const color = '#d19159', highlight = '#efc392';
  const topD = `M ${cx - armReach} ${cy - gap - armLen} Q ${cx - armReach} ${cy - gap} ${cx - 0.6} ${cy - gap}`;
  const botD = `M ${cx - armReach} ${cy + gap + armLen} Q ${cx - armReach} ${cy + gap} ${cx - 0.6} ${cy + gap}`;

  return (
    <>
      <Stage>
        <LogArt />
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d={topD} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
          <path d={botD} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
          <path d={topD} fill="none" stroke={highlight} strokeWidth="2.1" strokeLinecap="round" />
          <path d={botD} fill="none" stroke={highlight} strokeWidth="2.1" strokeLinecap="round" />
          <circle cx={cx - 0.6} cy={cy} r={2.6 + (1 - gap / maxGap) * 1.8} fill={color} stroke={highlight} strokeWidth="0.9" />
          <circle
            cx={cx} cy={cy} r="11" fill={state === 'holding' ? 'rgba(209,145,89,0.18)' : 'transparent'}
            style={{ cursor: 'pointer' }}
            onPointerDown={startHold} onPointerUp={release} onPointerLeave={release}
          />
          {state === 'holding' && (
            <circle cx={cx} cy={cy} r="14" fill="none" stroke="#FFD86B" strokeWidth="2.4"
              strokeDasharray={2 * Math.PI * 14} strokeDashoffset={2 * Math.PI * 14 * (1 - progress)}
              transform={`rotate(-90 ${cx} ${cy})`} />
          )}
        </svg>
        {state === 'tied' && <div style={badgeStyle}>Tied! ✓</div>}
      </Stage>
      <PanelFooter state={state} onReset={reset} hint="Press and hold the knot until the clamp closes." />
    </>
  );
}

// ---- Variant B: Tap 3 times — each tap visibly cinches it one notch. ----
function TapVariant() {
  const [taps, setTaps] = useState(0);
  const TOTAL = 3;
  const tied = taps >= TOTAL;
  const cx = 50, cy = 55;
  const maxGap = 9, minGap = 1.2;
  const gap = maxGap - (maxGap - minGap) * (taps / TOTAL);
  const armReach = 13, armLen = 9;
  const color = '#d19159', highlight = '#efc392';
  const topD = `M ${cx - armReach} ${cy - gap - armLen} Q ${cx - armReach} ${cy - gap} ${cx - 0.6} ${cy - gap}`;
  const botD = `M ${cx - armReach} ${cy + gap + armLen} Q ${cx - armReach} ${cy + gap} ${cx - 0.6} ${cy + gap}`;

  const onTap = () => { if (!tied) setTaps((t) => t + 1); };

  return (
    <>
      <Stage>
        <LogArt />
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d={topD} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" style={{ transition: 'd 180ms ease' }} />
          <path d={botD} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" style={{ transition: 'd 180ms ease' }} />
          <path d={topD} fill="none" stroke={highlight} strokeWidth="2.1" strokeLinecap="round" />
          <path d={botD} fill="none" stroke={highlight} strokeWidth="2.1" strokeLinecap="round" />
          <circle cx={cx - 0.6} cy={cy} r={2.6 + (taps / TOTAL) * 1.8} fill={color} stroke={highlight} strokeWidth="0.9" />
          <circle cx={cx} cy={cy} r="11" fill="transparent" style={{ cursor: tied ? 'default' : 'pointer' }} onPointerDown={onTap} />
        </svg>
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: '50%',
              background: i < taps ? '#d19159' : 'rgba(255,255,255,0.6)',
              border: '2px solid #8b5a31',
            }} />
          ))}
        </div>
        {tied && <div style={badgeStyle}>Tied! ✓</div>}
      </Stage>
      <PanelFooter state={tied ? 'tied' : 'idle'} onReset={() => setTaps(0)} hint="Tap the knot 3 times to pull it tight." />
    </>
  );
}

// ---- Variant C: Pull the loose tail into the loop (a short, local drag —
// not a drag across the bridge, just closing a small gap). ----
function DragTailVariant() {
  const [tailPos, setTailPos] = useState({ x: 30, y: 40 });
  const [dragging, setDragging] = useState(false);
  const [tied, setTied] = useState(false);
  const stageRef = useRef(null);
  const targetPos = { x: 50, y: 55 };
  const SNAP_RADIUS = 8;

  const toPct = (e) => {
    const rect = stageRef.current.getBoundingClientRect();
    return {
      x: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100),
    };
  };

  const onDown = (e) => {
    if (tied) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
  };
  const onMove = (e) => {
    if (!dragging) return;
    setTailPos(toPct(e));
  };
  const onUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    const p = toPct(e);
    const dist = Math.hypot(p.x - targetPos.x, p.y - targetPos.y);
    if (dist < SNAP_RADIUS) {
      setTailPos(targetPos);
      setTied(true);
    } else {
      setTailPos({ x: 30, y: 40 });
    }
  };

  const reset = () => { setTied(false); setTailPos({ x: 30, y: 40 }); };

  return (
    <>
      <Stage>
        <div ref={stageRef} style={{ position: 'absolute', inset: 0 }} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <LogArt />
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* the loop it needs to go into */}
            <circle cx={targetPos.x} cy={targetPos.y} r="9" fill="none" stroke="#8b5a31" strokeWidth="2.4" strokeDasharray="3 2" opacity={tied ? 0 : 0.7} />
            {/* the rope trailing from the log to the loose tail */}
            <path d={`M 38 50 Q ${(38 + tailPos.x) / 2} ${(50 + tailPos.y) / 2 + 6} ${tailPos.x} ${tailPos.y}`} fill="none" stroke="#d19159" strokeWidth="3.2" strokeLinecap="round" />
            {tied && <circle cx={targetPos.x} cy={targetPos.y} r="5.5" fill="#d19159" stroke="#efc392" strokeWidth="1.4" />}
          </svg>
          {!tied && (
            <div
              onPointerDown={onDown}
              style={{
                position: 'absolute', left: `${tailPos.x}%`, top: `${tailPos.y}%`, transform: 'translate(-50%,-50%)',
                width: 34, height: 34, borderRadius: '50%', background: '#d19159', border: '3px solid #efc392',
                cursor: 'grab', touchAction: 'none',
              }}
            />
          )}
        </div>
        {tied && <div style={badgeStyle}>Tied! ✓</div>}
      </Stage>
      <PanelFooter state={tied ? 'tied' : 'idle'} onReset={reset} hint="Drag the loose end into the loop to tie it." />
    </>
  );
}

const badgeStyle = {
  position: 'absolute', top: 10, right: 10, background: '#4CAF50', color: '#fff',
  padding: '4px 10px', borderRadius: 20, fontFamily: 'Baloo 2, sans-serif', fontWeight: 700, fontSize: 14,
};

function PanelFooter({ state, onReset, hint }) {
  return (
    <div style={{ padding: '10px 16px 16px', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>{hint}</div>
      <button
        onClick={onReset}
        style={{
          background: state === 'tied' ? '#4CAF50' : '#eee', color: state === 'tied' ? '#fff' : '#555',
          border: 'none', borderRadius: 8, padding: '6px 14px', fontFamily: 'Baloo 2, sans-serif', fontWeight: 600,
          cursor: 'pointer', fontSize: 13,
        }}
      >
        Reset
      </button>
    </div>
  );
}

export default function RopeTieTest() {
  return (
    <div style={{ minHeight: '100vh', background: '#fdf6ec', padding: '24px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Baloo 2, sans-serif', color: '#5D2E0A', fontSize: 26, marginBottom: 4 }}>
          Rope Tie Mechanic — 3 candidates
        </h1>
        <p style={{ fontFamily: 'Nunito, sans-serif', color: '#7a6a5a', marginTop: 0, marginBottom: 16 }}>
          Standalone sandbox — no beats to play through first. Reload the page to reset everything.
          Real log art, procedural SVG rope (matches the "no PNG for the rope" rule).
        </p>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, color: '#7a6a5a' }}>Reference — fully tied logs:</span>
          <img src={supportLogsTied} alt="tied reference" style={{ height: 40 }} />
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <Panel title="A. Press & Hold" blurb="Squeeze and hold — clamp closes as you hold, springs open if you let go too soon.">
            <PressHoldVariant />
          </Panel>
          <Panel title="B. Tap 3 Times" blurb="Discrete taps — each one visibly cinches it tighter, no timing pressure.">
            <TapVariant />
          </Panel>
          <Panel title="C. Drag Tail Into Loop" blurb="Pull the loose end a short distance into the loop to knot it.">
            <DragTailVariant />
          </Panel>
        </div>
      </div>
    </div>
  );
}
