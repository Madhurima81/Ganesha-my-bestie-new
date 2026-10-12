// lib/components/feedback/GestureDemo.jsx
//
// Reusable gesture tutorial overlay — DISPLAY ONLY.
// Shows an animated hand performing the required gesture. By default it stays
// visible until its animation finishes, the caller deactivates it (`active`
// false), or the beat/hint changes. It does NOT guess whether a touch was
// meaningful: random taps on sky/grass/empty space must not dismiss it. The
// scene detects a valid attempt and turns `active` off itself.
// Optional `dismissOnAnyPointer` restores the old "any pointerdown dismisses"
// behaviour for legacy teaching flows.
//
// Usage:
//   <GestureDemo
//     type="drag"
//     from={{ x: 20, y: 80 }}
//     to={{ x: 50, y: 40 }}
//     idleDelay={3000}
//     active={true}
//     onDismiss={() => setShowDemo(false)}
//   />
//
// Types: drag, tap, hold, scratch, swipe-left, swipe-right, swipe-down, pull-down, point
//   hold  -> finger presses and stays down with an expanding ring (press-and-hold
//            interactions: progress-ring holds, long-press). Uses `from` only.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './GestureDemo.css';

import touchFinger from './assets/images/gesture-touch-finger.png';
import pointFinger from './assets/images/gesture-point-finger.png';

const GESTURE_CONFIGS = {
  drag: {
    asset: 'touch',
    loopDuration: 2400,
    keyframes: (from, to) => `
      0%   { left: ${from.x}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.85); }
      12%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(1); }
      18%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.92); }
      70%  { left: ${to.x}%; top: ${to.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.92); }
      78%  { left: ${to.x}%; top: ${to.y}%; opacity: 1; transform: translate(-50%,-50%) scale(1); }
      88%  { left: ${to.x}%; top: ${to.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.85); }
      100% { left: ${from.x}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.85); }
    `,
  },
  tap: {
    asset: 'touch',
    loopDuration: 1600,
    keyframes: (from) => `
      0%   { left: ${from.x}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.8); }
      20%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(1); }
      35%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.88); }
      50%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(1); }
      65%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.88); }
      80%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(1); }
      100% { left: ${from.x}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.8); }
    `,
  },
  hold: {
    asset: 'touch',
    loopDuration: 2800,
    keyframes: (from) => `
      0%   { left: ${from.x}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.92); }
      10%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(1); }
      20%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.82); }
      35%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.85); }
      50%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.82); }
      65%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.85); }
      80%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.82); }
      90%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(1); }
      100% { left: ${from.x}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.92); }
    `,
  },
  // L2/L3 rescue variants of `hold` — same press-and-stay hand, but paired
  // with a visible progress ring that actually fills as the hold plays out,
  // so the two escalation levels look different from the teaching demo and
  // from each other (L2 = partial fill, "you're partway there"; L3 = fills
  // all the way, showing the complete action).
  'hold-progress-l2': {
    asset: 'touch',
    loopDuration: 2800,
    keyframes: (from) => GESTURE_CONFIGS.hold.keyframes(from),
    ringFill: 0.55,
  },
  'hold-progress-l3': {
    asset: 'touch',
    loopDuration: 2800,
    keyframes: (from) => GESTURE_CONFIGS.hold.keyframes(from),
    ringFill: 1,
  },
  scratch: {
    asset: 'touch',
    loopDuration: 2800,
    keyframes: (from, to) => {
      const midX1 = from.x + (to.x - from.x) * 0.3;
      const midY1 = from.y + (to.y - from.y) * 0.15;
      const midX2 = from.x + (to.x - from.x) * 0.6;
      const midY2 = to.y - (to.y - from.y) * 0.15;
      return `
        0%   { left: ${from.x}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.85); }
        10%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.9); }
        30%  { left: ${midX1}%; top: ${midY1}%; opacity: 1; transform: translate(-50%,-50%) scale(0.9); }
        50%  { left: ${midX2}%; top: ${midY2}%; opacity: 1; transform: translate(-50%,-50%) scale(0.9); }
        70%  { left: ${to.x}%; top: ${to.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.9); }
        85%  { left: ${to.x}%; top: ${to.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.85); }
        100% { left: ${from.x}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.85); }
      `;
    },
  },
  'swipe-left': {
    asset: 'touch',
    loopDuration: 1800,
    keyframes: (from) => `
      0%   { left: ${from.x + 15}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.9); }
      15%  { left: ${from.x + 15}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.92); }
      65%  { left: ${from.x - 15}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.92); }
      80%  { left: ${from.x - 15}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.9); }
      100% { left: ${from.x + 15}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.9); }
    `,
  },
  'swipe-right': {
    asset: 'touch',
    loopDuration: 1800,
    keyframes: (from) => `
      0%   { left: ${from.x - 15}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.9); }
      15%  { left: ${from.x - 15}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.92); }
      65%  { left: ${from.x + 15}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.92); }
      80%  { left: ${from.x + 15}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.9); }
      100% { left: ${from.x - 15}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.9); }
    `,
  },
  'swipe-down': {
    asset: 'touch',
    loopDuration: 1800,
    keyframes: (from) => `
      0%   { left: ${from.x}%; top: ${from.y - 10}%; opacity: 0; transform: translate(-50%,-50%) scale(0.9); }
      15%  { left: ${from.x}%; top: ${from.y - 10}%; opacity: 1; transform: translate(-50%,-50%) scale(0.92); }
      65%  { left: ${from.x}%; top: ${from.y + 20}%; opacity: 1; transform: translate(-50%,-50%) scale(0.92); }
      80%  { left: ${from.x}%; top: ${from.y + 20}%; opacity: 0; transform: translate(-50%,-50%) scale(0.9); }
      100% { left: ${from.x}%; top: ${from.y - 10}%; opacity: 0; transform: translate(-50%,-50%) scale(0.9); }
    `,
  },
  'pull-down': {
    asset: 'touch',
    loopDuration: 2200,
    keyframes: (from, to) => `
      0%   { left: ${from.x}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.85); }
      12%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.92); }
      55%  { left: ${to.x || from.x}%; top: ${to.y || from.y + 30}%; opacity: 1; transform: translate(-50%,-50%) scale(0.92); }
      70%  { left: ${to.x || from.x}%; top: ${to.y || from.y + 30}%; opacity: 1; transform: translate(-50%,-50%) scale(1); }
      85%  { left: ${to.x || from.x}%; top: ${to.y || from.y + 30}%; opacity: 0; transform: translate(-50%,-50%) scale(0.85); }
      100% { left: ${from.x}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.85); }
    `,
  },
  // Compound gesture: press, pull to `to`, and KEEP HOLDING there before
  // releasing — for a mechanic like Flower Branch (pull down, then hold)
  // that plain `pull-down` + `hold` can't express without two overlapping
  // hand graphics.
  'pull-down-hold': {
    asset: 'touch',
    loopDuration: 3000,
    keyframes: (from, to) => {
      const targetX = to?.x ?? from.x;
      const targetY = to?.y ?? (from.y + 20);
      return `
        0%   { left: ${from.x}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.9); }
        10%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(1); }
        18%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(0.84); }
        48%  { left: ${targetX}%; top: ${targetY}%; opacity: 1; transform: translate(-50%,-50%) scale(0.84); }
        78%  { left: ${targetX}%; top: ${targetY}%; opacity: 1; transform: translate(-50%,-50%) scale(0.84); }
        88%  { left: ${targetX}%; top: ${targetY}%; opacity: 1; transform: translate(-50%,-50%) scale(1); }
        100% { left: ${targetX}%; top: ${targetY}%; opacity: 0; transform: translate(-50%,-50%) scale(0.92); }
      `;
    },
  },
  point: {
    asset: 'point',
    loopDuration: 2000,
    keyframes: (from) => `
      0%   { left: ${from.x}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.8); }
      20%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(1); }
      80%  { left: ${from.x}%; top: ${from.y}%; opacity: 1; transform: translate(-50%,-50%) scale(1); }
      100% { left: ${from.x}%; top: ${from.y}%; opacity: 0; transform: translate(-50%,-50%) scale(0.8); }
    `,
  },
};

let gestureStyleCounter = 0;

export default function GestureDemo({
  type = 'drag',
  from = { x: 30, y: 70 },
  to = { x: 60, y: 40 },
  idleDelay = 3000,
  active = true,
  // Scene is frozen (sidebar open): hide the demo and, on resume, play it again
  // from the start — same "replay from the beginning" rule as the VO.
  paused = false,
  replayKey,
  onDismiss,
  onComplete,
  iterations = 2,
  zIndex = 100,
  dismissOnAnyPointer = false,
  // 'center' (default): the hand image's centre sits on the point. 'fingertip': the blue touch
  // circle at the fingertip sits on the point, so a hold ring drawn at the point is centred on
  // the touch (the image centre is ~20px below and right of the fingertip).
  anchor = 'center',
}) {
  const [visible, setVisible] = useState(false);
  const [styleId] = useState(() => `gd-anim-${++gestureStyleCounter}`);
  const timerRef = useRef(null);
  const styleRef = useRef(null);

  const config = GESTURE_CONFIGS[type] || GESTURE_CONFIGS.drag;
  const handImage = config.asset === 'point' ? pointFinger : touchFinger;

  const dismiss = useCallback(() => {
    setVisible(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onDismiss?.();
  }, [onDismiss]);

  // Stop showing the demo after 2 full loops — instant, no fade, no
  // partial 3rd loop. The animation itself is set to run exactly 2
  // iterations (not infinite), so the browser guarantees a 3rd loop
  // never starts; we just hide on the browser's own animationend event.
  // Doesn't fire onDismiss — this isn't a user interaction, just the demo
  // stepping aside so the scene's own hint escalation can take over.
  const handleAnimationEnd = useCallback(() => {
    setVisible(false);
    onComplete?.();
  }, [onComplete]);

  // Start idle timer. `active` alone only catches a false->true transition —
  // if a caller's condition is e.g. `effectiveHintLevel >= 2`, it stays true
  // continuously across L2->L3, so without `replayKey` the demo would play
  // once at L2 and never replay when L3 arrives. Callers that want a replay
  // on hint escalation pass replayKey={effectiveHintLevel} (or similar) so
  // this effect re-arms even though `active` itself didn't change.
  useEffect(() => {
    if (!active || paused) {
      setVisible(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, idleDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, paused, idleDelay, replayKey]);

  // Inject dynamic keyframes. Keyed on the coordinate VALUES (not the from/to object identity):
  // callers often pass fresh {x,y} literals every render, which used to remove and re-add the
  // @keyframes on every parent render and restart the hand, leaving it stuck at its start spot.
  const fx = from?.x; const fy = from?.y; const tx = to?.x; const ty = to?.y;
  useEffect(() => {
    if (!visible) return;

    let keyframeCSS = config.keyframes({ x: fx, y: fy }, { x: tx, y: ty });
    if (anchor === 'fingertip') keyframeCSS = keyframeCSS.split('translate(-50%,-50%)').join('translate(-38%,-18%)');
    const styleEl = document.createElement('style');
    styleEl.textContent = `@keyframes ${styleId} { ${keyframeCSS} }`;
    document.head.appendChild(styleEl);
    styleRef.current = styleEl;

    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, [visible, styleId, config, fx, fy, tx, ty, anchor]);

  // Legacy opt-in: dismiss on any pointerdown (off by default).
  useEffect(() => {
    if (!visible || !dismissOnAnyPointer) return;

    // A tap on the sidebar isn't the child trying the gesture — it must not
    // dismiss the demo (or count as "learned"); the pause hook replays it.
    const handler = (e) => {
      if (e.target?.closest?.('.ganesha-sidebar, [data-keep-gesture], [data-collection-ui="true"]')) return;
      dismiss();
    };
    window.addEventListener('pointerdown', handler);
    return () => window.removeEventListener('pointerdown', handler);
  }, [visible, dismiss, dismissOnAnyPointer]);

  if (!visible) return null;

  const loopCount = Math.max(1, Number(iterations) || 1);
  const loopAnimation = {
    animation: `${styleId} ${config.loopDuration}ms ease-in-out ${loopCount}`,
  };

  return (
    <div
      className="gesture-demo-overlay"
      style={{ zIndex }}
    >
      {/* Touch ripple for touch-type gestures. Hold-progress demos use the
          progress ring below instead, so don't stack a second pulsing ring on
          top of the fill indicator. */}
      {config.asset === 'touch' && config.ringFill == null && (
        <div
          className="gesture-demo-ripple"
          style={loopAnimation}
        />
      )}

      {/* Expanding "keep holding" ring for the plain teaching hold demo. */}
      {type === 'hold' && (
        <div
          className="gesture-demo-hold-ring"
          style={{
            left: `${from.x}%`,
            top: `${from.y}%`,
            animation: `gd-hold-ring ${config.loopDuration}ms ease-in-out ${loopCount}`,
          }}
        />
      )}

      {/* L2/L3 hold rescue — an actual filling progress ring (partial for
          L2, complete for L3), matching what the real hold-progress ring
          looks like during real play, instead of reusing the plain
          teaching demo's expand-and-fade ring at every level. */}
      {config.ringFill != null && (
        <svg
          className="gesture-demo-progress-ring"
          style={{ left: `${from.x}%`, top: `${from.y}%` }}
          viewBox="0 0 100 100"
        >
          <circle className="gesture-demo-progress-ring-track" cx="50" cy="50" r="42" />
          <circle
            className="gesture-demo-progress-ring-fill"
            cx="50" cy="50" r="42"
            style={{
              animation: `${config.ringFill >= 1 ? 'gd-progress-ring-full' : 'gd-progress-ring-partial'} ${config.loopDuration}ms ease-in-out ${loopCount}`,
            }}
          />
        </svg>
      )}

      {/* Hand image */}
      <img
        src={handImage}
        alt=""
        className="gesture-demo-hand"
        style={loopAnimation}
        onAnimationEnd={handleAnimationEnd}
        draggable={false}
      />

      {/* Trail dots for drag/scratch */}
      {(type === 'drag' || type === 'scratch') && (
        <svg
          className="gesture-demo-trail"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
