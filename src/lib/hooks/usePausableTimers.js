import { useCallback, useEffect, useRef } from 'react';

/**
 * setTimeout that freezes while `isPaused` and resumes with its REMAINING time
 * (a reveal or auto-advance never runs behind the sidebar, and never jumps
 * ahead when it closes).
 *
 *   const { after, cancel, clear } = usePausableTimers(isPaused);
 *   const handle = after(800, fn);   // returns a handle
 *   cancel(handle);                  // cancel one
 *   clear();                         // cancel all (call on reset/unmount)
 *
 * Timers created while paused are queued and start on resume.
 */
export default function usePausableTimers(isPaused) {
  const timersRef = useRef([]);
  const pausedRef = useRef(isPaused);
  pausedRef.current = isPaused;

  const run = useCallback((t) => {
    t.startedAt = Date.now();
    t.id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((x) => x !== t);
      t.fn();
    }, t.remaining);
  }, []);

  const after = useCallback((ms, fn) => {
    const t = { fn, remaining: ms, startedAt: 0, id: null };
    timersRef.current.push(t);
    if (!pausedRef.current) run(t);
    return t;
  }, [run]);

  const cancel = useCallback((t) => {
    if (!t) return;
    window.clearTimeout(t.id);
    timersRef.current = timersRef.current.filter((x) => x !== t);
  }, []);

  const clear = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t.id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    timersRef.current.forEach((t) => {
      if (isPaused) {
        if (t.id === null) return;
        window.clearTimeout(t.id);
        t.id = null;
        t.remaining = Math.max(0, t.remaining - (Date.now() - t.startedAt));
      } else if (t.id === null) {
        run(t);
      }
    });
  }, [isPaused, run]);

  useEffect(() => clear, [clear]);

  return { after, cancel, clear };
}
