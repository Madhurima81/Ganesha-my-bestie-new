import { useEffect, useMemo, useRef } from 'react';
import useSceneWatchdog from './useSceneWatchdog';
import { logSceneEvent } from '../utils/sceneEventLog';

const DEFAULT_REVEAL_TIMEOUT_MS = 12000;
const WATCH_NAME = 'reveal-card';

const resolveConfig = (configOrFactory, id) => (
  typeof configOrFactory === 'function' ? configOrFactory(id) : configOrFactory
);

export function createGuardedRevealController({
  sceneKey = 'scene',
  getRevealConfig,
  setRevealConfig,
  armWatchdog,
  disarmWatchdog,
  log = logSceneEvent,
  isStopped = () => false,
} = {}) {
  const started = new Set();
  const shown = new Set();

  const hasActiveReveal = () => Boolean(getRevealConfig?.());

  const showRevealOnce = (id, configOrFactory, source = 'unknown') => {
    if (!id || isStopped()) return false;
    if (started.has(id) || shown.has(id)) {
      log(sceneKey, 'reveal:already-started', { id, source });
      return false;
    }
    if (hasActiveReveal()) {
      log(sceneKey, 'reveal:already-active', {
        id,
        active: getRevealConfig?.()?.symbolId || getRevealConfig?.()?.id || null,
        source,
      });
      return false;
    }
    const config = resolveConfig(configOrFactory, id);
    if (!config) return false;
    started.add(id);
    log(sceneKey, 'reveal:start', { id, source });
    setRevealConfig?.(config);
    return true;
  };

  const markShown = (id) => {
    if (!id) return;
    shown.add(id);
    log(sceneKey, 'reveal:shown', { id });
    disarmWatchdog?.(WATCH_NAME);
  };

  const resetReveals = () => {
    started.clear();
    shown.clear();
    disarmWatchdog?.(WATCH_NAME);
  };

  const expectReveal = (id, configOrFactory, source = 'expected', timeoutMs = DEFAULT_REVEAL_TIMEOUT_MS) => {
    if (!id || isStopped()) return false;
    if (shown.has(id) || hasActiveReveal()) {
      disarmWatchdog?.(WATCH_NAME);
      return false;
    }
    log(sceneKey, 'reveal:waiting', { id, source });
    armWatchdog?.(WATCH_NAME, timeoutMs, () => {
      if (isStopped() || shown.has(id) || hasActiveReveal()) return;
      showRevealOnce(id, configOrFactory, 'watchdog');
    });
    return true;
  };

  return {
    showRevealOnce,
    markShown,
    resetReveals,
    expectReveal,
    getStarted: () => new Set(started),
    getShown: () => new Set(shown),
  };
}

export default function useGuardedReveal({
  sceneKey = 'scene',
  getRevealConfig,
  setRevealConfig,
  paused = false,
  getSnapshot,
} = {}) {
  const revealConfigRef = useRef(null);
  revealConfigRef.current = getRevealConfig?.() ?? null;

  const stoppedRef = useRef(false);
  useEffect(() => {
    stoppedRef.current = false;
    return () => { stoppedRef.current = true; };
  }, []);

  const {
    arm: armWatchdog,
    disarm: disarmWatchdog,
    disarmAll,
    stall,
    resolveStall,
  } = useSceneWatchdog({
    sceneKey,
    paused,
    getSnapshot,
  });

  const setRevealConfigRef = useRef(setRevealConfig);
  setRevealConfigRef.current = setRevealConfig;
  const armWatchdogRef = useRef(armWatchdog);
  armWatchdogRef.current = armWatchdog;
  const disarmWatchdogRef = useRef(disarmWatchdog);
  disarmWatchdogRef.current = disarmWatchdog;

  const controller = useRef(null);
  if (!controller.current) {
    controller.current = createGuardedRevealController({
      sceneKey,
      getRevealConfig: () => revealConfigRef.current,
      setRevealConfig: (config) => setRevealConfigRef.current?.(config),
      armWatchdog: (...args) => armWatchdogRef.current?.(...args),
      disarmWatchdog: (...args) => disarmWatchdogRef.current?.(...args),
      isStopped: () => stoppedRef.current,
    });
  }
  const revealController = controller.current;

  useEffect(() => () => {
    revealController.resetReveals();
    disarmAll();
  }, [disarmAll, revealController]);

  return useMemo(() => ({
    showRevealOnce: revealController.showRevealOnce,
    markShown: revealController.markShown,
    resetReveals: revealController.resetReveals,
    expectReveal: revealController.expectReveal,
    stall,
    resolveStall,
  }), [revealController, resolveStall, stall]);
}
