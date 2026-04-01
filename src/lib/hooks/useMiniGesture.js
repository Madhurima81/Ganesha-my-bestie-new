import { useState, useCallback, useRef } from 'react';

/**
 * useMiniGesture — shared hook for Ganesha micro-reward gesture cues
 *
 * Tier map:
 *   Micro win  (single tap correct)  → triggerMiniGesture('thumbsup', 'item',   1200)
 *   Phase win  (step/round done)     → triggerMiniGesture('ok',       'center', 2000)
 *   Scene win  (win condition met)   → triggerMiniGesture('fist',     'center', 2000)
 *   Sanskrit moment (word/shloka)    → triggerMiniGesture('blessing', 'center', 2500)
 *   Zone win   (all scenes done)     → triggerMiniGesture('victory',  'center', 2500)
 *
 * gestureType: 'thumbsup' | 'ok' | 'fist' | 'victory' | 'blessing'
 * position:   'item' (near the tapped element) | 'center' (fixed, screen center)
 * durationMs: how long the cue stays visible
 *
 * Returns:
 *   miniGesture       — { show, type, position, durationMs, key }
 *   triggerMiniGesture — (type, position, durationMs) => void
 */
export function useMiniGesture() {
  const [miniGesture, setMiniGesture] = useState({
    show: false,
    type: 'thumbsup',
    position: 'item',
    durationMs: 1500,
    key: 0,
  });

  const timerRef = useRef(null);

  const triggerMiniGesture = useCallback(
    (type = 'thumbsup', position = 'item', durationMs = 1500) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      setMiniGesture(prev => ({
        show: true,
        type,
        position,
        durationMs,
        key: prev.key + 1,
      }));

      timerRef.current = setTimeout(() => {
        setMiniGesture(prev => ({ ...prev, show: false }));
        timerRef.current = null;
      }, durationMs);
    },
    []
  );

  return { miniGesture, triggerMiniGesture };
}
