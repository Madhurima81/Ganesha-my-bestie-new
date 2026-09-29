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
 * @param {boolean}  options.resumePending - Whether timers that were pending on hide should resume.
 *                                           Set false for scene-owned resume where the current
 *                                           phase should replay/restart cleanly after return.
 *
 * @returns {{ safeSetTimeout, clearAll, freeze, thaw }}
 *   safeSetTimeout(callback, delay) — schedules callback, returns a cancel fn
 *   clearAll()                      — cancels all pending timeouts (call on unmount)
 *   freeze() / thaw()               — pause / resume pending timeouts for a sidebar open,
 *                                     without the tab-hide onHide/onShow side effects
 */
const usePauseAwareTimeout = ({ onHide, onShow, resumeDelay = 0, resumePending = true } = {}) => {
  const pendingRef = useRef([]);
  const resumePendingRef = useRef(resumePending);
  // True while a sidebar pause has the timers frozen: timers created in that
  // window wait for thaw() instead of starting immediately.
  const frozenRef = useRef(false);

  // Keep latest callbacks in refs so pauseAll/resumeAll never need to change identity.
  // If onHide/onShow were in useCallback deps, they'd create new refs every render
  // (since they're inline functions), which would propagate into useAppVisibility
  // and cause its effect to re-register — cancelling the pending onShow timer
  // during the 3s countdown window on tab return.
  const onHideRef = useRef(onHide);
  const onShowRef = useRef(onShow);
  useEffect(() => { onHideRef.current = onHide; }, [onHide]);
  useEffect(() => { onShowRef.current = onShow; }, [onShow]);
  useEffect(() => { resumePendingRef.current = resumePending; }, [resumePending]);

  // Schedule (or re-schedule) a single entry
  const scheduleEntry = useCallback((entry) => {
    entry.startedAt = Date.now();
    entry.id = setTimeout(() => {
      pendingRef.current = pendingRef.current.filter(e => e !== entry);
      // A bug in one scene's scheduled callback must not take down every other
      // pending timer silently — surface it clearly instead of an opaque
      // "Cannot read properties of undefined" with no indication of which
      // safeSetTimeout call site it came from.
      try {
        entry.callback();
      } catch (error) {
        console.error('[usePauseAwareTimeout] scheduled callback threw:', error);
      }
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
    if (!resumePendingRef.current) {
      pendingRef.current = [];
      onShowRef.current?.();
      return;
    }
    pendingRef.current.forEach(entry => {
      if (entry.id === null && !frozenRef.current) scheduleEntry(entry);
    });
    onShowRef.current?.();
  }, [scheduleEntry]); // stable ref — onShow read via ref

  useAppVisibility(pauseAll, resumeAll, { resumeDelay });

  // Sidebar (or any other in-app overlay) pause: freeze / thaw the pending
  // timers with their remaining time, WITHOUT running onHide/onShow — the
  // caller owns the voice/replay side of that pause.
  const freeze = useCallback(() => {
    frozenRef.current = true;
    const now = Date.now();
    pendingRef.current.forEach(entry => {
      if (entry.id !== null) {
        clearTimeout(entry.id);
        entry.id = null;
        entry.remaining = Math.max(0, entry.remaining - (now - entry.startedAt));
      }
    });
  }, []);

  const thaw = useCallback(() => {
    frozenRef.current = false;
    pendingRef.current.forEach(entry => {
      if (entry.id === null) scheduleEntry(entry);
    });
  }, [scheduleEntry]);

  // The drop-in for safeSetTimeout — returns a cancel function
  const safeSetTimeout = useCallback((callback, delay) => {
    const entry = { id: null, callback, remaining: delay, startedAt: 0 };
    pendingRef.current.push(entry);
    if (!frozenRef.current) scheduleEntry(entry);
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

  return { safeSetTimeout, clearAll, freeze, thaw };
};

export default usePauseAwareTimeout;
