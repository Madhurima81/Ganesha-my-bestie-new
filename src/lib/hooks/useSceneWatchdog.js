// lib/hooks/useSceneWatchdog.js
//
// "This should have happened by now" - a safety net for waits the GAME controls (a reveal card after a
// finished word, the first line/action after Continue, the hand-over from a success line to the next
// step). NOT for waits where the child is meant to act: idle is not stuck.
//
//   const { arm, disarm, log, stall, resolveStall } = useSceneWatchdog({
//     sceneKey: 'nirvighnam',
//     paused: scenePaused,                 // sidebar open etc. (tab-hidden is handled here)
//     getSnapshot: () => ({ phase, revealConfig: !!revealConfig }),
//   });
//
//   // when the word finishes:
//   arm('reveal-card', 12000, () => showRevealOnce(word));   // recovery: MUST be safe to run twice
//   // when the card actually shows:
//   disarm('reveal-card');
//
// What happens when an armed wait runs out:
//   1st time  -> the stall is logged + dumped (see sceneEventLog), `recover()` runs once, and the wait is
//                armed again for the same time to see whether the recovery worked.
//   2nd time  -> `stall` becomes { name } so the scene can render <SceneStallPrompt/> ("Tap to keep going").
//                Tapping it runs `recover()` again and clears the stall. Nothing loops silently.
//
// Rules that keep it safe (see docs/KNOWN_PITFALLS.md 42):
//   - recover() must be idempotent: route it through the same guarded function the normal path uses
//     (e.g. the `revealStartedRef` Set), so a slow-but-fine original path can never show a card twice.
//   - the countdown freezes while the tab is hidden or `paused` is true and resumes with the time left.
//   - nothing runs after the scene unmounts; arm() is safe in StrictMode (it is imperative, call it from an
//     effect and disarm in that effect's cleanup if the wait is tied to the effect).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import usePausableTimers from './usePausableTimers';
import { logSceneEvent, dumpSceneLog } from '../utils/sceneEventLog';

const DEFAULT_MAX_RECOVERIES = 1;

export default function useSceneWatchdog({ sceneKey = 'scene', paused = false, getSnapshot } = {}) {
  const [hidden, setHidden] = useState(
    typeof document !== 'undefined' ? document.visibilityState === 'hidden' : false
  );
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const onVis = () => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const { after, cancel, clear } = usePausableTimers(Boolean(paused) || hidden);

  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  const getSnapshotRef = useRef(getSnapshot);
  getSnapshotRef.current = getSnapshot;

  // name -> { handle, ms, recover, attempts, maxRecoveries }
  const watchesRef = useRef(new Map());
  const [stall, setStall] = useState(null);
  const stallRecoverRef = useRef(null);

  const log = useCallback((name, data) => logSceneEvent(sceneKey, name, data), [sceneKey]);

  const disarm = useCallback((name) => {
    const w = watchesRef.current.get(name);
    if (!w) return;
    cancel(w.handle);
    watchesRef.current.delete(name);
    logSceneEvent(sceneKey, `watchdog:disarm:${name}`);
  }, [cancel, sceneKey]);

  const disarmAll = useCallback(() => {
    watchesRef.current.forEach((w) => cancel(w.handle));
    watchesRef.current.clear();
    clear();
  }, [cancel, clear]);

  const schedule = useCallback((name, w) => {
    w.handle = after(w.ms, () => {
      if (!aliveRef.current) return;
      if (watchesRef.current.get(name) !== w) return; // replaced or disarmed meanwhile
      let snapshot;
      try { snapshot = getSnapshotRef.current?.(); } catch { snapshot = undefined; }
      if (w.attempts < w.maxRecoveries) {
        w.attempts += 1;
        logSceneEvent(sceneKey, `watchdog:stall:${name}`, { attempt: w.attempts });
        dumpSceneLog(sceneKey, `"${name}" did not happen within ${w.ms}ms - recovering (attempt ${w.attempts})`, snapshot);
        try { w.recover?.(); } catch (e) { logSceneEvent(sceneKey, `watchdog:recover-error:${name}`, String(e)); }
        // Watch again: if this fires a second time the recovery did not work.
        if (watchesRef.current.get(name) === w) schedule(name, w);
        return;
      }
      logSceneEvent(sceneKey, `watchdog:gave-up:${name}`);
      dumpSceneLog(sceneKey, `"${name}" still stuck after recovery - showing the tap-to-continue prompt`, snapshot);
      watchesRef.current.delete(name);
      stallRecoverRef.current = w.recover;
      setStall({ name });
    });
  }, [after, sceneKey]);

  // Start (or restart) waiting for `name`. `recover` must be safe to run more than once.
  const arm = useCallback((name, ms, recover, opts = {}) => {
    if (!aliveRef.current) return;
    const prev = watchesRef.current.get(name);
    if (prev) cancel(prev.handle);
    const w = {
      handle: null,
      ms,
      recover,
      attempts: 0,
      maxRecoveries: opts.maxRecoveries ?? DEFAULT_MAX_RECOVERIES,
    };
    watchesRef.current.set(name, w);
    logSceneEvent(sceneKey, `watchdog:arm:${name}`, { ms });
    schedule(name, w);
  }, [cancel, schedule, sceneKey]);

  // The child tapped the prompt: try the recovery once more and clear the stall.
  const resolveStall = useCallback(() => {
    const recover = stallRecoverRef.current;
    stallRecoverRef.current = null;
    setStall(null);
    logSceneEvent(sceneKey, 'watchdog:prompt-tapped');
    try { recover?.(); } catch (e) { logSceneEvent(sceneKey, 'watchdog:prompt-recover-error', String(e)); }
  }, [sceneKey]);

  // Scene is leaving: nothing may fire afterwards.
  useEffect(() => () => {
    watchesRef.current.clear();
  }, []);

  return useMemo(
    () => ({ arm, disarm, disarmAll, log, stall, resolveStall }),
    [arm, disarm, disarmAll, log, stall, resolveStall]
  );
}
