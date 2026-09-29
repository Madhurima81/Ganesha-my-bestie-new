import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Sidebar = true pause for a playable scene.
 *
 * Sidebar opens  → capture the in-flight clip, kill it WITHOUT firing its
 *                  onEnded, and hold the scene (`isSidebarPaused`).
 * Sidebar closes → after a short settle, replay the interrupted clip once from
 *                  the start (only if the beat is unchanged), run its normal
 *                  callback once, then release the hold — which makes the
 *                  game's hint hook re-schedule from L0 (fresh clock).
 *
 * Every guidance line / word / syllable must run through `playTracked` so this
 * hook owns its completion callback. A clip stopped by the sidebar is marked
 * `dead`: late callbacks (e.g. Web Speech's cancel-triggered onerror) are
 * ignored, so the game can never advance invisibly behind the sidebar.
 *
 * Wrapper usage:
 *   const sp = useSidebarPause();
 *   playGuidanceVoice = (key, onEnded, opts) => sp.playTracked('line',
 *     (done, o) => rawPlay(key, done, { ...opts, ...o }), onEnded);
 *   stopAllVoice: call sp.clearActive() (a deliberate stop is not an interruption)
 *   onPopupOpen:  sp.beginPause();  onPopupClose: sp.endPause();
 *   games get isPaused={isRecorderOpen || sp.isSidebarPaused}
 */
export default function useSidebarPause({ settleMs = 400, failsafeMs = 8000 } = {}) {
  const beatRef = useRef('');
  const activeRef = useRef(null);
  const interruptedRef = useRef(null);
  const openRef = useRef(false);
  const settleTimerRef = useRef(null);
  const failsafeTimerRef = useRef(null);
  const [isSidebarPaused, setIsSidebarPaused] = useState(false);

  const setBeat = useCallback((beatId) => { beatRef.current = beatId; }, []);

  const playTracked = useCallback((kind, start, onEnded, overrides) => {
    const entry = { kind, beatId: beatRef.current, start, onEnded, dead: false };
    // A line requested while the sidebar is open (e.g. by a timer that isn't
    // pause-aware) must not speak behind it — queue it as the interrupted line
    // so it plays, from the start, when the sidebar closes.
    if (openRef.current) {
      interruptedRef.current = entry;
      return;
    }
    const done = () => {
      if (entry.dead) return;
      entry.dead = true;
      if (activeRef.current === entry) activeRef.current = null;
      onEnded?.();
    };
    activeRef.current = entry;
    start(done, overrides);
  }, []);

  // A deliberate stop (a new clip taking over) is not a sidebar interruption.
  const clearActive = useCallback(() => { activeRef.current = null; }, []);

  const beginPause = useCallback(() => {
    openRef.current = true;
    window.clearTimeout(settleTimerRef.current);
    window.clearTimeout(failsafeTimerRef.current);
    const active = activeRef.current;
    if (active && !active.dead) {
      active.dead = true;
      interruptedRef.current = active;
    }
    activeRef.current = null;
    setIsSidebarPaused(true);
  }, []);

  const endPause = useCallback(() => {
    if (!openRef.current) return;
    openRef.current = false;
    window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(() => {
      const interrupted = interruptedRef.current;
      interruptedRef.current = null;
      const release = () => {
        if (openRef.current) return;
        window.clearTimeout(failsafeTimerRef.current);
        setIsSidebarPaused(false);
      };
      failsafeTimerRef.current = window.setTimeout(release, failsafeMs);
      if (interrupted && interrupted.beatId === beatRef.current) {
        playTracked(
          interrupted.kind,
          interrupted.start,
          () => { interrupted.onEnded?.(); release(); },
          { minDelayAfterVoiceMs: 0 },
        );
      } else {
        release();
      }
    }, settleMs);
  }, [failsafeMs, playTracked, settleMs]);

  useEffect(() => () => {
    window.clearTimeout(settleTimerRef.current);
    window.clearTimeout(failsafeTimerRef.current);
  }, []);

  return { isSidebarPaused, setBeat, playTracked, clearActive, beginPause, endPause };
}
