import { useEffect, useMemo, useRef } from 'react';
import useSceneWatchdog from './useSceneWatchdog';
import { logSceneEvent } from '../utils/sceneEventLog';

const DEFAULT_FIRST_LINE_TIMEOUT_MS = 10000;
const WATCH_NAME = 'first-line';

export function createFirstLineWatchController({
  sceneKey = 'scene',
  armWatchdog,
  disarmWatchdog,
  log = logSceneEvent,
  isStopped = () => false,
} = {}) {
  const active = new Set();
  const started = new Set();

  const arm = ({ id = WATCH_NAME, recover, timeoutMs = DEFAULT_FIRST_LINE_TIMEOUT_MS, source = 'expected' } = {}) => {
    if (!id || isStopped() || started.has(id)) return false;
    active.add(id);
    log(sceneKey, 'first-line:waiting', { id, source });
    armWatchdog?.(WATCH_NAME, timeoutMs, () => {
      if (isStopped() || started.has(id) || !active.has(id)) return;
      recover?.();
    });
    return true;
  };

  const disarm = (id = WATCH_NAME) => {
    active.delete(id);
    disarmWatchdog?.(WATCH_NAME);
    log(sceneKey, 'first-line:disarm', { id });
  };

  const markStarted = (id = WATCH_NAME) => {
    started.add(id);
    active.delete(id);
    disarmWatchdog?.(WATCH_NAME);
    log(sceneKey, 'first-line:started', { id });
  };

  const reset = () => {
    active.clear();
    started.clear();
    disarmWatchdog?.(WATCH_NAME);
  };

  return {
    arm,
    disarm,
    markStarted,
    reset,
    getActive: () => new Set(active),
    getStarted: () => new Set(started),
  };
}

export default function useFirstLineWatch({
  sceneKey = 'scene',
  paused = false,
  getSnapshot,
} = {}) {
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

  const armWatchdogRef = useRef(armWatchdog);
  armWatchdogRef.current = armWatchdog;
  const disarmWatchdogRef = useRef(disarmWatchdog);
  disarmWatchdogRef.current = disarmWatchdog;

  const controller = useRef(null);
  if (!controller.current) {
    controller.current = createFirstLineWatchController({
      sceneKey,
      armWatchdog: (...args) => armWatchdogRef.current?.(...args),
      disarmWatchdog: (...args) => disarmWatchdogRef.current?.(...args),
      isStopped: () => stoppedRef.current,
    });
  }
  const firstLineController = controller.current;

  useEffect(() => () => {
    firstLineController.reset();
    disarmAll();
  }, [disarmAll, firstLineController]);

  return useMemo(() => ({
    arm: firstLineController.arm,
    disarm: firstLineController.disarm,
    markStarted: firstLineController.markStarted,
    stall,
    resolveStall,
  }), [firstLineController, resolveStall, stall]);
}
