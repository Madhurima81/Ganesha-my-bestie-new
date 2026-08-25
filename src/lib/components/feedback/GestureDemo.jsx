// lib/components/feedback/GestureDemo.jsx
//
// Reusable gesture tutorial overlay.
// Shows animated hand performing the required gesture after idle timeout.
// Disappears on first user interaction.
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
// Types: drag, tap, scratch, swipe-left, swipe-right, swipe-down, pull-down

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
  onDismiss,
  zIndex = 100,
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
  }, []);

  // Start idle timer
  useEffect(() => {
    if (!active) {
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
  }, [active, idleDelay]);

  // Inject dynamic keyframes
  useEffect(() => {
    if (!visible) return;

    const keyframeCSS = config.keyframes(from, to);
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
  }, [visible, styleId, config, from, to]);

  // Dismiss on any interaction
  useEffect(() => {
    if (!visible) return;

    const handler = () => dismiss();
    window.addEventListener('pointerdown', handler, { once: true });
    return () => window.removeEventListener('pointerdown', handler);
  }, [visible, dismiss]);

  if (!visible) return null;

  const loopAnimation = {
    animation: `${styleId} ${config.loopDuration}ms ease-in-out 2`,
  };

  return (
    <div
      className="gesture-demo-overlay"
      style={{ zIndex }}
      onPointerDown={dismiss}
    >
      {/* Touch ripple for touch-type gestures */}
      {config.asset === 'touch' && (
        <div
          className="gesture-demo-ripple"
          style={loopAnimation}
        />
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
