import { useRef, useCallback, useEffect } from 'react';
import useAppVisibility from './useAppVisibility';

/**
 * usePauseAwareTimeout — drop-in for safeSetTimeout used by game scenes.
 *
 * Automatically pauses ALL pending timeouts when the tab is hidden (phone call,
 * tab switch, home button) and resumes them with their remaining time when the
 * tab becomes visible again — exactly how Sago Mini / Toca Boca pause their game loops.
 *
 * @param {Object}   options
 * @param {function} options.onHide - Extra callback on hide  (e.g. pause celebration timer)
 * @param {function} options.onShow - Extra callback on show  (e.g. resume celebration timer)
 *
 * @returns {{ safeSetTimeout, clearAll }}
 *   safeSetTimeout(callback, delay) — schedules callback, returns a cancel fn
 *   clearAll()                      — cancels all pending timeouts (call on unmount)
 */
const usePauseAwareTimeout = ({ onHide, onShow, resumeDelay = 0 } = {}) => {
  const pendingRef = useRef([]);

  // Keep latest callbacks in refs so pauseAll/resumeAll never need to change identity.
  // If onHide/onShow were in useCallback deps, they'd create new refs every render
  // (since they're inline functions), which would propagate into useAppVisibility
  // and cause its effect to re-register — cancelling the pending onShow timer
  // during the 3s countdown window on tab return.
  const onHideRef = useRef(onHide);
  const onShowRef = useRef(onShow);
  useEffect(() => { onHideRef.current = onHide; }, [onHide]);
  useEffect(() => { onShowRef.current = onShow; }, [onShow]);

  // Schedule (or re-schedule) a single entry
  const scheduleEntry = useCallback((entry) => {
    entry.startedAt = Date.now();
    entry.id = setTimeout(() => {
      pendingRef.current = pendingRef.current.filter(e => e !== entry);
      entry.callback();
    }, Math.max(0, entry.remaining));
  }, []);

  // Pause: clear all timers, snapshot remaining time
  const pauseAll = useCallback(() => {
    const now = Date.now();
    pendingRef.current.forEach(entry => {
      if (entry.id !== null) {
        clearTimeout(entry.id);
        entry.id = null;
        entry.remaining = Math.max(0, entry.remaining - (now - entry.startedAt));
      }
    });
    onHideRef.current?.();
  }, []); // stable ref — no deps needed

  // Resume: reschedule all paused entries with remaining time
  const resumeAll = useCallback(() => {
    pendingRef.current.forEach(entry => {
      if (entry.id === null) scheduleEntry(entry);
    });
    onShowRef.current?.();
  }, [scheduleEntry]); // stable ref — onShow read via ref

  useAppVisibility(pauseAll, resumeAll, { resumeDelay });

  // The drop-in for safeSetTimeout — returns a cancel function
  const safeSetTimeout = useCallback((callback, delay) => {
    const entry = { id: null, callback, remaining: delay, startedAt: 0 };
    pendingRef.current.push(entry);
    scheduleEntry(entry);
    return () => {
      if (entry.id !== null) clearTimeout(entry.id);
      pendingRef.current = pendingRef.current.filter(e => e !== entry);
    };
  }, [scheduleEntry]);

  // Cancel everything — call on component unmount
  const clearAll = useCallback(() => {
    pendingRef.current.forEach(entry => {
      if (entry.id !== null) clearTimeout(entry.id);
    });
    pendingRef.current = [];
  }, []);

  return { safeSetTimeout, clearAll };
};

export default usePauseAwareTimeout;
