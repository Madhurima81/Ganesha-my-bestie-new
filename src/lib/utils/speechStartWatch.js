const DEFAULT_WATCH_MS = 1400;
const DEFAULT_RETRY_DELAY_MS = 150;

const detachHandlers = (utterance) => {
  if (!utterance) return;
  utterance.onstart = null;
  utterance.onend = null;
  utterance.onerror = null;
};

export function createSpeechStartWatcher({
  speechSynthesis,
  watchMs = DEFAULT_WATCH_MS,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
  onDropBeforeStart,
} = {}) {
  let generation = 0;
  let watchTimer = null;
  let retryTimer = null;
  let currentUtterance = null;

  const clearTimers = () => {
    if (watchTimer) clearTimer(watchTimer);
    if (retryTimer) clearTimer(retryTimer);
    watchTimer = null;
    retryTimer = null;
  };

  const cancelPending = ({ cancelSpeech = true } = {}) => {
    generation += 1;
    clearTimers();
    detachHandlers(currentUtterance);
    currentUtterance = null;
    if (cancelSpeech) {
      try { speechSynthesis?.cancel?.(); } catch { /* best effort */ }
    }
  };

  const speak = ({ buildUtterance, isStillCurrent = () => true } = {}) => {
    if (typeof buildUtterance !== 'function' || !speechSynthesis?.speak) return null;

    generation += 1;
    const requestGeneration = generation;
    clearTimers();

    const speakAttempt = (attempt) => {
      if (generation !== requestGeneration || !isStillCurrent()) return null;
      const utterance = buildUtterance(attempt);
      if (!utterance) return null;

      let started = false;
      const originalStart = utterance.onstart;
      utterance.onstart = (event) => {
        started = true;
        originalStart?.(event);
      };

      currentUtterance = utterance;
      try { speechSynthesis.resume?.(); } catch { /* best effort */ }
      speechSynthesis.speak(utterance);

      watchTimer = setTimer(() => {
        watchTimer = null;
        if (started || generation !== requestGeneration || currentUtterance !== utterance || !isStillCurrent()) return;
        if (attempt >= 1) return;

        detachHandlers(utterance);
        onDropBeforeStart?.({ attempt, utterance });
        try { speechSynthesis.cancel?.(); } catch { /* best effort */ }

        retryTimer = setTimer(() => {
          retryTimer = null;
          if (generation !== requestGeneration || !isStillCurrent()) return;
          speakAttempt(attempt + 1);
        }, retryDelayMs);
      }, watchMs);

      return utterance;
    };

    return speakAttempt(0);
  };

  return {
    speak,
    cancelPending,
    current: () => currentUtterance,
    invalidate: () => {
      generation += 1;
      clearTimers();
      currentUtterance = null;
    },
  };
}

export default createSpeechStartWatcher;
