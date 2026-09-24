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
  const hasScheduledRef = useRef(false);
  // The L3 timer scheduled by schedule() below is a FALLBACK for when the
  // caller never tells us the L2 line finished speaking (muted, or no VO at
  // all) — it fires at the original fixed level3Delay mark. When the caller
  // does call markLevel2VoiceEnded() (once their L2 line's onEnd fires),
  // that fallback is replaced with a timer counting the same gap from the
  // real moment the child heard L2 finish, so a slow L2 line can't eat into
  // the real time the child gets before L3 fires.
  const level3TimerRef = useRef(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    level3TimerRef.current = null;
  }, []);

  const schedule = useCallback(() => {
    clearTimers();
    hasScheduledRef.current = false;
    setHintLevel(0);
    setPulseTick(0);

    if (!enabled || !stageKey) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    hasScheduledRef.current = true;

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
    level3TimerRef.current = explicit;
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

  // Call once the caller's L2 hint line finishes speaking. Replaces the
  // fixed-mark L3 fallback with an 8s-after-this-moment timer, so L3 never
  // fires while (or right on top of) the L2 line still speaking.
  const markLevel2VoiceEnded = useCallback(() => {
    if (hintLevel !== 2) return;
    if (level3TimerRef.current) {
      window.clearTimeout(level3TimerRef.current);
      timersRef.current = timersRef.current.filter((id) => id !== level3TimerRef.current);
    }
    const gapMs = Math.max(level3Delay - level2Delay, 1200);
    const t = window.setTimeout(() => {
      setHintLevel(3);
      setPulseTick(0);
    }, gapMs);
    timersRef.current.push(t);
    level3TimerRef.current = t;
  }, [hintLevel, level2Delay, level3Delay]);

  useEffect(() => {
    schedule();
    return clearTimers;
  }, [clearTimers, schedule, stageKey]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimers();
        hasScheduledRef.current = false;
        return;
      }

      if (enabled && stageKey && !hasScheduledRef.current) {
        schedule();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [clearTimers, enabled, schedule, stageKey]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    hintLevel,
    pulseTick,
    markInteraction,
    markLevel2VoiceEnded,
    clearHints: clearTimers,
  };
}
