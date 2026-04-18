import { useEffect, useRef } from 'react';

/**
 * useAppVisibility - Fires callbacks when the app is hidden (tab switch, phone call, etc.)
 * or becomes visible again. State is preserved in-memory automatically.
 *
 * @param {function} onHide        - Called immediately when the app loses visibility
 * @param {function} onShow        - Called when the app regains visibility
 *                                   (after resumeDelay ms if set — countdown window)
 * @param {Object}   options
 * @param {number}   options.resumeDelay  - ms to wait before firing onShow (default 0).
 *                                         Use 3000 for a 3-2-1 countdown buffer.
 *                                         If the tab re-hides before the delay completes,
 *                                         the pending onShow is cancelled automatically.
 */
const useAppVisibility = (onHide, onShow, { resumeDelay = 0 } = {}) => {
  const resumeTimerRef = useRef(null);

  // Keep latest callbacks in refs so event listeners never need to re-register.
  // Without this, inline onHide/onShow functions (new refs every render) cause
  // the effect to re-run, which calls cancelPendingResume() during the 3s countdown
  // window — killing the pending onShow before it fires.
  const onHideRef = useRef(onHide);
  const onShowRef = useRef(onShow);
  useEffect(() => { onHideRef.current = onHide; }, [onHide]);
  useEffect(() => { onShowRef.current = onShow; }, [onShow]);

  useEffect(() => {
    let hiddenState = typeof document !== 'undefined' ? document.hidden : false;

    const cancelPendingResume = () => {
      if (resumeTimerRef.current !== null) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
    };

    const runHide = () => {
      if (hiddenState) return;
      hiddenState = true;
      cancelPendingResume(); // tab re-hid before countdown finished → cancel resume
      onHideRef.current?.();
    };

    const runShow = () => {
      if (!hiddenState) return;
      hiddenState = false;
      if (resumeDelay > 0) {
        // Hold off calling onShow until countdown expires
        resumeTimerRef.current = setTimeout(() => {
          resumeTimerRef.current = null;
          onShowRef.current?.();
        }, resumeDelay);
      } else {
        onShowRef.current?.();
      }
    };

    const visibilityHandler = () => {
      if (document.hidden) runHide();
      else runShow();
    };

    // visibilitychange covers tab switch + phone call + home button on mobile.
    // pagehide/pageshow covers iOS Safari PWA and bfcache navigation.
    // blur/focus intentionally excluded — they fire for DevTools, URL bar,
    // permission popups, etc., causing false pauses mid-game.
    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('pagehide', runHide);
    window.addEventListener('pageshow', runShow);

    return () => {
      document.removeEventListener('visibilitychange', visibilityHandler);
      window.removeEventListener('pagehide', runHide);
      window.removeEventListener('pageshow', runShow);
      cancelPendingResume();
    };
  }, [resumeDelay]); // callbacks read via refs — no re-register on every render
};

export default useAppVisibility;
