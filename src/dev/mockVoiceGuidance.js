/**
 * Mock providers for the standalone /dev/game-test route.
 *
 * The 8 Shloka River game components consume NO app-level providers directly
 * (no useVoiceGuidance / GameStateManager / ProgressManager / SceneManager /
 * useAppVisibility / context / localStorage). Everything arrives as props from
 * the parent scene wrapper. So mounting a game standalone only needs:
 *   1. a fake `voiceGuidance` object
 *   2. no-op / logging callback props
 *
 * Canonical games + the voiceGuidance keys each one destructures:
 *   VakratundaRescueGame  playVoice, playSfx, playSyllable, stopVoice   (+ onStageChange)
 *   MahakayaRescueGame    playVoice, playSfx, playSyllable, playWord, stopVoice
 *   SuryakotiGame         playVoice, playWord, playSyllable, stopVoice  (+ onFirstInteraction)
 *   SamaprabhaGame        playVoice, playSyllable, playWord, stopVoice  (+ onFirstInteraction)
 *   NirvighnamGame        playVoice, playSyllable, playWord, stopVoice
 *   KurumedevaGame        playVoice, playSyllable, stopVoice
 *   SarvakaryeshuGame     playVoice, playSyllable, stopVoice
 *   SarvadaGame           playVoice, stopVoice, playWord, playSyllable
 */

// Games gate phase transitions on the `onEnded` callback firing. Fire it async
// so the flow advances without real audio.
const fireEnded = (onEnded, ms = 350) => {
  if (typeof onEnded === 'function') setTimeout(onEnded, ms);
};

export function makeMockVoiceGuidance({ log = true, endDelayMs = 350 } = {}) {
  const tag = (...a) => log && console.log('[mockVO]', ...a);

  return {
    // --- the 5 keys the games actually destructure ---
    playVoice: (key, onEnded) => {
      tag('playVoice', key);
      fireEnded(onEnded, endDelayMs);
    },
    playSfx: (key) => {
      tag('playSfx', key);
    },
    playSyllable: (word, syllable, onEnded) => {
      tag('playSyllable', word, syllable);
      fireEnded(onEnded, endDelayMs);
    },
    playWord: (word, onEnded) => {
      tag('playWord', word);
      fireEnded(onEnded, endDelayMs);
    },
    stopVoice: () => {
      tag('stopVoice');
    },

    // --- extras some wrappers spread in; harmless no-ops if a game reads them ---
    playMusic: () => tag('playMusic'),
    stopMusic: () => tag('stopMusic'),
    recordInteraction: () => {},
    startIdleTimer: () => {},
    stopIdleTimer: () => {},
    isPlaying: false,
    currentPhase: null,
  };
}

export function makeMockCallbacks(setBanner, { log = true } = {}) {
  const tag = (...a) => log && console.log('[mockCB]', ...a);
  return {
    onMicroWin: (id) => tag('onMicroWin', id),
    onStageChange: (stage) => tag('onStageChange', stage),
    onFirstInteraction: () => tag('onFirstInteraction'),
    onPhaseComplete: (phase) => {
      tag('onPhaseComplete', phase);
      setBanner?.(`phase complete: ${phase ?? ''}`);
    },
    onGameComplete: (data) => {
      tag('onGameComplete', data);
      setBanner?.('✅ GAME COMPLETE');
    },
  };
}
