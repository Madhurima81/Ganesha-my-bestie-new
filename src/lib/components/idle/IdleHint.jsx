import React, { useState, useEffect } from 'react';
import './IdleHint.css';

// Swap to SVG once ready:
// import ganeshaPoint from './assets/ganesha-point.svg';

const GESTURE = {
  above: '👇',
  below: '👆',
  left:  '👉',
  right: '👈',
};

const PADDING = 10; // px around the target for the glow ring

/**
 * IdleHint — glow ring + pointing gesture when the child stops interacting.
 *
 * Usage:
 *   const primaryRef = useRef(null);
 *   const { isIdle, resetIdle } = useIdleNudge(20000);
 *
 *   // reset on every tap/interaction:
 *   const handleTap = () => { resetIdle(); recordInteraction(); doGameThing(); };
 *
 *   <MyButton ref={primaryRef} onClick={handleTap} />
 *   <IdleHint isIdle={isIdle} targetRef={primaryRef} gesturePosition="above" />
 *
 * Props:
 *   isIdle          boolean   — from useIdleNudge
 *   targetRef       ref       — ref attached to the primary tap target
 *   gesturePosition string    — 'above' | 'below' | 'left' | 'right'  (default 'above')
 */
const IdleHint = ({ isIdle, targetRef, gesturePosition = 'above' }) => {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!isIdle || !targetRef?.current) {
      setRect(null);
      return;
    }

    const measure = () => {
      if (targetRef.current) setRect(targetRef.current.getBoundingClientRect());
    };

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);

    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [isIdle, targetRef]);

  if (!isIdle || !rect) return null;

  // Glow ring — sits just outside the target bounds
  const glowStyle = {
    top:    rect.top    - PADDING,
    left:   rect.left   - PADDING,
    width:  rect.width  + PADDING * 2,
    height: rect.height + PADDING * 2,
  };

  // Gesture — anchored to one edge of the target
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  const gestureStyle = (() => {
    switch (gesturePosition) {
      case 'above': return { top: rect.top - 56, left: cx - 20 };
      case 'below': return { top: rect.bottom + 10, left: cx - 20 };
      case 'left':  return { top: cy - 20, left: rect.left - 56 };
      case 'right': return { top: cy - 20, left: rect.right + 10 };
      default:      return { top: rect.top - 56, left: cx - 20 };
    }
  })();

  const emoji = GESTURE[gesturePosition] ?? '👇';

  return (
    <div className="idle-hint-layer" aria-hidden="true">
      <div className="idle-hint-glow" style={glowStyle} />
      <div className="idle-hint-gesture" style={gestureStyle}>
        {/* ── Swap this span for the SVG once ganesha-point.svg is ready ──
            <img src={ganeshaPoint} className="idle-hint-svg" alt="" />
        ── */}
        <span className="idle-hint-emoji">{emoji}</span>
      </div>
    </div>
  );
};

export default IdleHint;
