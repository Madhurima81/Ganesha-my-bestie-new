import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Repeats a staged hint pattern for a single gameplay sub-stage.
 *
 * Pattern:
 * - Level 1: gentle pulse, repeated 2-3 times
 * - Level 2: stronger hint
 * - Level 3: most explicit hint
 *
 * Call `markInteraction()` whenever the player meaningfully interacts so the
 * cycle restarts for the current stage.
 */
export default function useRepeatedHintCycle({
  enabled = true,
  stageKey = null,
  initialDelay = 9000,
  pulseCountBeforeEscalation = 3,
  pulseInterval = 1800,
  level2Delay = 16000,
  level3Delay = 24000,
} = {}) {
  const [hintLevel, setHintLevel] = useState(0);
  const [pulseTick, setPulseTick] = useState(0);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback(() => {
    clearTimers();
    setHintLevel(0);
    setPulseTick(0);

    if (!enabled || !stageKey) return;

    const start = window.setTimeout(() => {
      setHintLevel(1);
      setPulseTick(1);
    }, initialDelay);
    timersRef.current.push(start);

    for (let i = 2; i <= pulseCountBeforeEscalation; i += 1) {
      const pulseTimer = window.setTimeout(() => {
        setHintLevel(1);
        setPulseTick(i);
      }, initialDelay + ((i - 1) * pulseInterval));
      timersRef.current.push(pulseTimer);
    }

    const strongHintAt = initialDelay + (pulseCountBeforeEscalation * pulseInterval);
    const stronger = window.setTimeout(() => {
      setHintLevel(2);
      setPulseTick(0);
    }, Math.max(level2Delay, strongHintAt));
    timersRef.current.push(stronger);

    const explicit = window.setTimeout(() => {
      setHintLevel(3);
      setPulseTick(0);
    }, Math.max(level3Delay, Math.max(level2Delay, strongHintAt) + 1200));
    timersRef.current.push(explicit);
  }, [
    clearTimers,
    enabled,
    initialDelay,
    level2Delay,
    level3Delay,
    pulseCountBeforeEscalation,
    pulseInterval,
    stageKey,
  ]);

  const markInteraction = useCallback(() => {
    schedule();
  }, [schedule]);

  useEffect(() => {
    schedule();
    return clearTimers;
  }, [clearTimers, schedule, stageKey]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    hintLevel,
    pulseTick,
    markInteraction,
    clearHints: clearTimers,
  };
}
