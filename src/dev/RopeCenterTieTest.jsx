import React, { useCallback, useRef, useState } from 'react';

import logsBare from '../zones/shloka-river/scenes/Scene3/assets/images/bridge/Bridge/logs-bare.webp';
import beaverTie from './beatPlayerPreview/kurumedeva/uploads/beaver-tie.webp';
import beaverWorried from '../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-idle-worried.webp';
import helpBubble from '../zones/shloka-river/scenes/Scene3/assets/images/bridge/Characters/help-bubble-monkey-knot.webp';

// Refined standalone test of the LOCKED center-tie mechanic (per
// Madhurima's exact spec): two loose rope ends dragged independently
// toward one shared center point. The "Try alone" mode uses the identical
// mechanic but always slips apart once both arrive; "With Monkey" uses the
// same mechanic and succeeds. No separate rope image ever — pure SVG.

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const SIDES = {
  left: {
    anchor: { x: 396, y: 258 },
    start: { x: 340, y: 340 },
    lock: { x: 478, y: 300 },
  },
  right: {
    anchor: { x: 604, y: 258 },
    start: { x: 660, y: 340 },
    lock: { x: 522, y: 300 },
  },
};
const TARGET = { x: 500, y: 300 };
const TARGET_RADIUS = 64;

function pathFor(anchor, pt) {
  const dir = pt.x > anchor.x ? 1 : -1;
  const c1x = anchor.x + dir * 46;
  const c1y = anchor.y + 46;
  const c2x = pt.x - dir * 40;
  const c2y = pt.y + 22;
  return `M ${anchor.x} ${anchor.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${pt.x} ${pt.y}`;
}

function RopeEnd({ side, pos, anchor, locked, onPointerDown, glow }) {
  const d = pathFor(anchor, pos);
  return (
    <>
      <path d={d} fill="none" stroke="#976239" strokeWidth="15" strokeLinecap="round" style={{ transition: locked ? 'd 380ms cubic-bezier(.2,.8,.3,1)' : 'none' }} />
      <path d={d} fill="none" stroke="#e9b86e" strokeWidth="9.5" strokeLinecap="round" style={{ transition: locked ? 'd 380ms cubic-bezier(.2,.8,.3,1)' : 'none' }} />
      <path d={d} fill="none" stroke="#f4cf93" strokeWidth="2.6" strokeLinecap="round" opacity="0.8" style={{ transition: locked ? 'd 380ms cubic-bezier(.2,.8,.3,1)' : 'none' }} />
      {glow > 0 && (
        <circle cx={TARGET.x} cy={TARGET.y} r={40 + glow * 14} fill="rgba(233,184,110,0.35)" style={{ transition: 'r 120ms ease' }} />
      )}
      {!locked && (
        <circle
          cx={pos.x} cy={pos.y} r="19" fill="#f4c477" stroke="#8f5b33" strokeWidth="3"
          style={{ cursor: 'grab', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.25))', transition: locked === false ? 'cx 380ms cubic-bezier(.2,.8,.3,1), cy 380ms cubic-bezier(.2,.8,.3,1)' : 'none' }}
          onPointerDown={(e) => onPointerDown(side, e)}
        />
      )}
    </>
  );
}

function CenterTieStage({ mode }) {
  // mode: 'fail' | 'success'
  const [pos, setPos] = useState({ left: SIDES.left.start, right: SIDES.right.start });
  const [locked, setLocked] = useState({ left: false, right: false });
  const [dragging, setDragging] = useState(null);
  const [glowSide, setGlowSide] = useState(null);
  const [beaverPose, setBeaverPose] = useState('tie'); // tie | worried
  const [status, setStatus] = useState('idle'); // idle | slipping | tied
  const [helpVisible, setHelpVisible] = useState(false);
  const [vo, setVo] = useState('');
  const svgRef = useRef(null);

  const toLocal = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 1000, y: ((e.clientY - r.top) / r.height) * 560 };
  };

  const reset = () => {
    setPos({ left: SIDES.left.start, right: SIDES.right.start });
    setLocked({ left: false, right: false });
    setDragging(null);
    setGlowSide(null);
    setBeaverPose('tie');
    setStatus('idle');
    setHelpVisible(false);
    setVo('');
  };

  const onDown = (side, e) => {
    if (locked[side] || status !== 'idle') return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(side);
  };
  const onMove = (e) => {
    if (!dragging) return;
    const p = toLocal(e);
    setPos((cur) => ({ ...cur, [dragging]: p }));
    setGlowSide(dist(p, TARGET) < TARGET_RADIUS * 1.6 ? dragging : null);
  };
  const onUp = (e) => {
    if (!dragging) return;
    const side = dragging;
    const p = toLocal(e);
    setDragging(null);
    setGlowSide(null);

    if (dist(p, TARGET) >= TARGET_RADIUS) {
      setPos((cur) => ({ ...cur, [side]: SIDES[side].start }));
      return;
    }

    setPos((cur) => ({ ...cur, [side]: SIDES[side].lock }));
    setLocked((cur) => {
      const next = { ...cur, [side]: true };
      if (next.left && next.right) {
        // both arrived — hold briefly (~250ms), then resolve per mode
        setTimeout(() => {
          if (mode === 'fail') {
            setStatus('slipping');
            setBeaverPose('worried');
            setVo('Oops! It keeps slipping.');
            setPos({ left: SIDES.left.start, right: SIDES.right.start });
            setLocked({ left: false, right: false });
            setTimeout(() => setHelpVisible(true), 500);
          } else {
            setStatus('tied');
            setVo('Together, they pulled it tight!');
          }
        }, 250);
      }
      return next;
    });
  };

  const bothLocked = locked.left && locked.right;

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '1000 / 560', background: 'linear-gradient(#cfeaff 0 58%, #9bd276 58% 100%)', borderRadius: 14, overflow: 'hidden', touchAction: 'none' }}>
      <img
        src={logsBare} alt="" draggable={false}
        style={{ position: 'absolute', left: '50%', top: '54%', transform: 'translate(-50%,-50%)', width: '54%', pointerEvents: 'none', zIndex: 5 }}
      />
      <img
        src={beaverPose === 'worried' ? beaverWorried : beaverTie} alt=""
        draggable={false}
        style={{ position: 'absolute', left: '17%', top: '38%', width: '20%', pointerEvents: 'none', zIndex: 20, transition: 'opacity 200ms ease' }}
      />
      {helpVisible && (
        <img src={helpBubble} alt="" style={{ position: 'absolute', left: '20%', top: '14%', width: '15%', zIndex: 21, animation: 'fadeIn 300ms ease' }} />
      )}
      <svg ref={svgRef} viewBox="0 0 1000 560" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10 }}
        onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      >
        <RopeEnd side="left" pos={pos.left} anchor={SIDES.left.anchor} locked={locked.left} onPointerDown={onDown} glow={glowSide === 'left' ? 1 : 0} />
        <RopeEnd side="right" pos={pos.right} anchor={SIDES.right.anchor} locked={locked.right} onPointerDown={onDown} glow={glowSide === 'right' ? 1 : 0} />
        {status === 'tied' && (
          // Exact knot artwork from Madhurima's center-tie prototype — a
          // bow-shaped loop plus two short hanging tails, not a plain dot.
          <g>
            <path d="M472 292 C492 267 522 269 538 292 C551 312 532 332 505 326 C477 320 462 305 472 292" fill="none" stroke="#976239" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M472 292 C492 267 522 269 538 292 C551 312 532 332 505 326 C477 320 462 305 472 292" fill="none" stroke="#e9b86e" strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M479 290 C494 276 516 277 530 292" fill="none" stroke="#f4cf93" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
            <path d="M490 321 L476 348 M516 321 L530 348" fill="none" stroke="#976239" strokeWidth="15" strokeLinecap="round" />
            <path d="M490 321 L476 348 M516 321 L530 348" fill="none" stroke="#e9b86e" strokeWidth="9.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
      {vo && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', zIndex: 30,
          background: 'rgba(255,255,255,0.95)', padding: '7px 16px', borderRadius: 20,
          fontFamily: 'Baloo 2, sans-serif', fontWeight: 700, fontSize: 14, color: status === 'tied' ? '#38764a' : '#8a4a3a',
          boxShadow: '0 3px 10px rgba(0,0,0,0.15)', whiteSpace: 'nowrap',
        }}>
          {vo}
        </div>
      )}
      <button
        onClick={reset}
        style={{ position: 'absolute', top: 10, right: 10, zIndex: 30, background: '#eee6f7', color: '#60487a', border: 'none', borderRadius: 10, padding: '6px 12px', fontFamily: 'Baloo 2, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
      >
        Reset
      </button>
      <style>{`@keyframes fadeIn { from { opacity:0; transform: translateY(6px);} to {opacity:1; transform:none;} }`}</style>
    </div>
  );
}

export default function RopeCenterTieTest() {
  return (
    <div style={{ minHeight: '100vh', background: '#fdf6ec', padding: '24px 20px', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Baloo 2, sans-serif', color: '#5D2E0A', fontSize: 26, marginBottom: 4 }}>
          Center-Tie Rope — locked mechanic
        </h1>
        <p style={{ color: '#7a6a5a', marginTop: 0, marginBottom: 20 }}>
          Same mechanic both times: drag each rope end independently toward the glowing center. The two panels below
          are the two story beats — <b>Try alone</b> always slips apart once both arrive; <b>With Monkey</b> succeeds.
          No permanent green target — the glow only appears while a hand is near center.
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 460px', maxWidth: 560 }}>
            <h2 style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: 18, color: '#5D2E0A' }}>Try alone (beat 4)</h2>
            <CenterTieStage mode="fail" />
          </div>
          <div style={{ flex: '1 1 460px', maxWidth: 560 }}>
            <h2 style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: 18, color: '#5D2E0A' }}>With Monkey (beat 6)</h2>
            <CenterTieStage mode="success" />
          </div>
        </div>
      </div>
    </div>
  );
}
