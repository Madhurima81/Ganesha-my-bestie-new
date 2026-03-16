import { useRef, useCallback } from 'react';
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
    onHide?.();
  }, [onHide]);

  // Resume: reschedule all paused entries with remaining time
  const resumeAll = useCallback(() => {
    pendingRef.current.forEach(entry => {
      if (entry.id === null) scheduleEntry(entry);
    });
    onShow?.();
  }, [onShow, scheduleEntry]);

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
