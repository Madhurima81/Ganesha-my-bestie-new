import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Repeats a staged hint pattern for a single gameplay sub-stage.
 *
 * Pattern:
 * - Level 1: gentle pulse, repeated 2-3 times
 * - Level 2: stronger hint
 * - Level 3: most explicit hint
 *
 * Pointer movement is not interaction; a valid attempt is; meaningful progress resets hints.
 * - markProgress()           correct, meaningful action (tap/drag start/hold start)
 * - markContinuousProgress() same, throttled ~700ms, for rub/drag/hold move events
 * - markAttempt()            genuine but incomplete attempt (grabbed the right item): keeps a
 *                            visible hint, restarts the idle clock only if none is showing
 * - markWrongAttempt()       real attempt on a valid target, wrong result
 * - random touches           call nothing
 * `markInteraction()` is a temporary alias for markProgress().
 */
const CONTINUOUS_PROGRESS_THROTTLE_MS = 700;
const LEVEL2_VOICE_SAFETY_MS = 12000;

export default function useRepeatedHintCycle({
  enabled = true,
  stageKey = null,
  initialDelay = 9000,
  pulseCountBeforeEscalation = 3,
  pulseInterval = 1800,
  level2Delay = 16000,
  level3Delay = 24000,
  // Optional: pass the game's pause flag (sidebar open / tab hidden). The ladder itself still
  // restarts fresh from L0 (that's what `enabled` going false/true does); this only keeps the
  // level the child had reached (L2/L3) showing for `resumePinMs` after the pause ends, so the
  // hint gesture/pulse that goes with a replayed hint line comes back with it.
  paused = false,
  resumePinMs = 3500,
} = {}) {
  const [realHintLevel, setHintLevel] = useState(0);
  const [pinnedLevel, setPinnedLevel] = useState(0);
  const hintLevel = Math.max(realHintLevel, pinnedLevel);
  const realLevelRef = useRef(0);
  realLevelRef.current = realHintLevel;
  const levelAtPauseRef = useRef(0);
  const wasPausedRef = useRef(false);
  const pinTimerRef = useRef(null);
  // Declared before the schedule effect so it reads the level BEFORE the reset to 0.
  useEffect(() => {
    if (paused && !wasPausedRef.current) {
      levelAtPauseRef.current = realLevelRef.current >= 2 ? realLevelRef.current : 0;
      window.clearTimeout(pinTimerRef.current);
      setPinnedLevel(0);
    } else if (!paused && wasPausedRef.current) {
      const level = levelAtPauseRef.current;
      levelAtPauseRef.current = 0;
      if (level) {
        setPinnedLevel(level);
        window.clearTimeout(pinTimerRef.current);
        pinTimerRef.current = window.setTimeout(() => setPinnedLevel(0), resumePinMs);
      }
    }
    wasPausedRef.current = paused;
  }, [paused, resumePinMs]);
  useEffect(() => () => window.clearTimeout(pinTimerRef.current), []);
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
  const level2VoiceStartedRef = useRef(false);
  const wrongAttemptCountRef = useRef(0);
  const pendingL3AfterVoiceRef = useRef(false);
  const lastContinuousProgressRef = useRef(0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    level3TimerRef.current = null;
  }, []);

  const schedule = useCallback(() => {
    clearTimers();
    hasScheduledRef.current = false;
    level2VoiceStartedRef.current = false;
    pendingL3AfterVoiceRef.current = false;
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
      if (level2VoiceStartedRef.current) return;
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

  // Correct, meaningful progress: clears the hint and restarts the ladder from L0.
  // Random touches (sky, grass, empty space) must call NOTHING.
  const markProgress = useCallback(() => {
    wrongAttemptCountRef.current = 0;
    schedule();
  }, [schedule]);

  // For rub / drag / hold: call on every valid move, but only refreshes the hint
  // clock about every 700ms so a held gesture can't block hints forever.
  const markContinuousProgress = useCallback(() => {
    const now = Date.now();
    if (now - lastContinuousProgressRef.current < CONTINUOUS_PROGRESS_THROTTLE_MS) return;
    lastContinuousProgressRef.current = now;
    markProgress();
  }, [markProgress]);

  // A genuine attempt on a real target that was wrong. Not progress: never clears a visible hint.
  // 1st: local feedback only (the caller's own wrong-feedback); just keeps the child from counting as idle.
  // 2nd+: error-responsive help — L2-quality clue first; L3/direct only if already at L2.
  const markWrongAttempt = useCallback(() => {
    wrongAttemptCountRef.current += 1;
    const level = realLevelRef.current;

    if (wrongAttemptCountRef.current < 2) {
      if (level === 0) schedule();
      return;
    }

    if (level === 2 && level2VoiceStartedRef.current) {
      // L2 line is still speaking: never cut it off. L3 fires as soon as it ends.
      pendingL3AfterVoiceRef.current = true;
      return;
    }

    if (level >= 2) {
      clearTimers();
      setHintLevel(3);
      setPulseTick(0);
      return;
    }

    clearTimers();
    hasScheduledRef.current = true;
    level2VoiceStartedRef.current = false;
    setHintLevel(2);
    setPulseTick(0);
    const gapMs = Math.max(level3Delay - level2Delay, 1200);
    const t = window.setTimeout(() => {
      if (level2VoiceStartedRef.current) return;
      setHintLevel(3);
      setPulseTick(0);
    }, gapMs);
    timersRef.current.push(t);
    level3TimerRef.current = t;
  }, [schedule, clearTimers, level2Delay, level3Delay]);

  // TEMPORARY alias while scenes migrate to markProgress / markWrongAttempt /
  // markContinuousProgress. Remove once no caller uses it.
  const markInteraction = markProgress;

  // Call once the caller's L2 hint line finishes speaking. Replaces the
  // fixed-mark L3 fallback with an 8s-after-this-moment timer, so L3 never
  // fires while (or right on top of) the L2 line still speaking.
  const markLevel2VoiceEnded = useCallback(() => {
    if (realLevelRef.current !== 2) return;
    level2VoiceStartedRef.current = false;
    if (level3TimerRef.current) {
      window.clearTimeout(level3TimerRef.current);
      timersRef.current = timersRef.current.filter((id) => id !== level3TimerRef.current);
    }
    const queued = pendingL3AfterVoiceRef.current;
    pendingL3AfterVoiceRef.current = false;
    const gapMs = queued ? 0 : Math.max(level3Delay - level2Delay, 1200);
    const t = window.setTimeout(() => {
      setHintLevel(3);
      setPulseTick(0);
    }, gapMs);
    timersRef.current.push(t);
    level3TimerRef.current = t;
  }, [level2Delay, level3Delay]);

  // While the L2 line is "speaking", L3 is held back until the caller reports it ended. If that
  // report never comes (line cut by a tap, or the browser never fires its "ended" event), L3 would
  // be gated forever — so after a generous limit treat the line as ended.
  const markLevel2VoiceStarted = useCallback(() => {
    if (realLevelRef.current !== 2) return;
    level2VoiceStartedRef.current = true;
    const safety = window.setTimeout(() => {
      if (level2VoiceStartedRef.current) markLevel2VoiceEnded();
    }, LEVEL2_VOICE_SAFETY_MS);
    timersRef.current.push(safety);
  }, [markLevel2VoiceEnded]);

  // A genuine attempt that is NOT progress (grabbed the right item, partial hold/drag): it must not
  // clear a hint that is already showing, but with no hint showing it restarts the idle clock.
  const markAttempt = useCallback(() => {
    if (realLevelRef.current >= 1) return;
    schedule();
  }, [schedule]);

  useEffect(() => {
    wrongAttemptCountRef.current = 0;
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
    markProgress,
    markAttempt,
    markWrongAttempt,
    markContinuousProgress,
    markInteraction, // temporary alias -> markProgress
    markLevel2VoiceStarted,
    markLevel2VoiceEnded,
    clearHints: clearTimers,
  };
}
