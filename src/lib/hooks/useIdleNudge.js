import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useIdleNudge — fires isIdle after timeout ms with no resetIdle() call.
 *
 * Pair with IdleHint component for glow + gesture visual.
 * Pair with useVoiceGuidance.recordInteraction() so both reset together.
 *
 * @param {number} timeout  ms before isIdle becomes true (default 20000)
 */
const useIdleNudge = (timeout = 20000) => {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef(null);

  const schedule = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), timeout);
  }, [timeout]);

  const resetIdle = useCallback(() => {
    setIsIdle(false);
    schedule();
  }, [schedule]);

  // Start timer on mount
  useEffect(() => {
    schedule();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [schedule]);

  return { isIdle, resetIdle };
};

export default useIdleNudge;
