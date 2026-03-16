import { useState, useRef, useCallback } from 'react';
import useAppVisibility from './useAppVisibility';

/**
 * useResumeCountdown
 *
 * Drives the 3-2-1 visual countdown shown when the child switches back to the app.
 * This hook fires onShow IMMEDIATELY (no resumeDelay) so the display starts right away.
 * The actual audio/timer resume happens after resumeDelay ms (set on useVoiceGuidance
 * and usePauseAwareTimeout), so display and resume are naturally in sync.
 *
 * @param {number} countdownSeconds - How many seconds to count down (default 3)
 * @returns {{ countdownValue: number|null }}
 *   countdownValue is 3/2/1 while counting, null when idle or complete.
 *   Render <ResumeCountdown value={countdownValue} /> with this.
 */
const useResumeCountdown = (countdownSeconds = 3) => {
  const [countdownValue, setCountdownValue] = useState(null);
  const intervalRef = useRef(null);

  const cancelCountdown = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCountdownValue(null);
  }, []);

  const onHide = useCallback(() => {
    // If tab re-hides mid-countdown, wipe the display immediately
    cancelCountdown();
  }, [cancelCountdown]);

  const onShow = useCallback(() => {
    if (countdownSeconds <= 0) return;

    let count = countdownSeconds;
    setCountdownValue(count); // Show first number immediately

    intervalRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownValue(count);
      } else {
        // Countdown complete — clear display (audio/timers resume at the same moment
        // via useVoiceGuidance / usePauseAwareTimeout resumeDelay)
        cancelCountdown();
      }
    }, 1000);
  }, [countdownSeconds, cancelCountdown]);

  // No resumeDelay here — this hook fires onShow immediately so display starts at T=0.
  // Audio/timer hooks use resumeDelay: countdownSeconds * 1000 to resume at T=end.
  useAppVisibility(onHide, onShow);

  return { countdownValue };
};

export default useResumeCountdown;
