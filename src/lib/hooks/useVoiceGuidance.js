import { useState, useRef, useCallback, useEffect } from 'react';
import useAppVisibility from './useAppVisibility';
import {
  getVoiceScript,
  getAudioPath,
  getSfxPath,
  getMusicPath,
  getPhaseHint,
  getRandomEncouragement,
  getSyllablePath,
  getWordPath
} from '../config/content/voiceGuidance';

// ========================================
// MIX PROFILE (child-safe defaults)
// ========================================
// These are base levels; final level = base * sfxVolume * duckFactor(when VO active)
const SFX_BASE_VOLUME = {
  tap: 0.32,            // 28–36%
  softWrong: 0.28,      // 24–32%
  discovery: 0.37,      // 32–42%
  revealBloom: 0.41,    // 36–46%
  place: 0.33,          // 28–38%
  transition: 0.29,     // 24–34%
  emotionalGlow: 0.47,  // 42–52%
  celebration: 0.43,    // 38–48%
  idleHint: 0.22,       // 18–26%

  // Legacy compatibility
  error: 0.28,
  success: 0.37,
  powerUnlock: 0.47,
  whoosh: 0.29,
  pop: 0.33,
  chime: 0.41
};

const VO_DUCK_FACTOR = 0.7; // ~30% reduction while VO is active

/**
 * useVoiceGuidance - Hook for playing voice guidance, SFX, and background music
 *
 * @param {string} zoneId - Current zone (e.g., 'symbol-mountain')
 * @param {string} sceneId - Current scene (e.g., 'modak')
 * @param {Object} options - Configuration options
 * @param {boolean} options.enableMusic - Whether to play background music
 * @param {number} options.musicVolume - Background music volume (0-1)
 * @param {number} options.voiceVolume - Voice guidance volume (0-1)
 * @param {number} options.sfxVolume - Sound effects volume (0-1)
 * @param {number} options.idleTimeout - Seconds before idle hint plays (default: 10)
 */
const useVoiceGuidance = (zoneId, sceneId, {
  enableMusic = true,
  musicVolume = 0.3,
  voiceVolume = 1,
  sfxVolume = 0.7,
  idleTimeout = 10,
  resumeDelay = 0,  // ms to wait before resuming audio after tab return (e.g. 3000 for 3-2-1)
  onReturnHint = null  // called when tab resumes with no VO queued — scene provides a hint
} = {}) => {
  const [isPlaying, setIsPlayingState] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(null);

  const voiceRef = useRef(null);
  const sfxRef = useRef(null);
  const musicRef = useRef(null);
  const idleTimerRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());
  const voiceVolumeRef = useRef(voiceVolume); // mutable — setVoiceVolume updates this live
  const isHiddenRef = useRef(typeof document !== 'undefined' ? document.hidden : false);
  const pendingVoiceRef = useRef(null);
  // Track the currently-playing voice key+callback+flags so handleHide can store them
  const activeVoiceKeyRef = useRef(null);
  const activeVoiceCallbackRef = useRef(null);
  const activeVoiceReplayRef = useRef(true);  // whether to replay on tab return
  // Belt-and-suspenders: cleanup fn for the per-audio visibilitychange listener
  const audioVisibilityCleanupRef = useRef(null);
  // Called from handleShow when no VO is replayed — scene provides context-aware hint
  const onReturnHintRef = useRef(null);

  // Refs for idle timer to access current values
  const isPlayingRef = useRef(isPlaying);
  const currentPhaseRef = useRef(currentPhase);
  const voDuckActiveRef = useRef(false);

  // Deferred setIsPlaying to avoid "Cannot update component while rendering another" warning
  const setIsPlaying = (value) => {
    isPlayingRef.current = value; // Update ref immediately for synchronous checks
    queueMicrotask(() => setIsPlayingState(value)); // Defer state update
  };

  const applyVoDuck = useCallback(() => {
    voDuckActiveRef.current = true;
    if (musicRef.current) {
      musicRef.current.volume = Math.min(1, Math.max(0, musicVolume * VO_DUCK_FACTOR));
    }
  }, [musicVolume]);

  const clearVoDuck = useCallback(() => {
    voDuckActiveRef.current = false;
    if (musicRef.current) {
      musicRef.current.volume = Math.min(1, Math.max(0, musicVolume));
    }
  }, [musicVolume]);

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  // Keep voiceVolumeRef in sync when the prop changes (e.g. parent passes new volume)
  useEffect(() => {
    voiceVolumeRef.current = voiceVolume;
  }, [voiceVolume]);

  // Keep onReturnHint ref in sync so handleShow never has a stale callback
  useEffect(() => {
    onReturnHintRef.current = onReturnHint;
  }, [onReturnHint]);

  // ========================================
  // VOICE PLAYBACK
  // ========================================

  // replayOnReturn: whether to replay this VO when the child returns from a tab switch.
  // Default true. Pass false for celebratory one-shot VOs where the scene has moved on
  // (e.g. mooshikaFound) so we don't replay "You found Mooshika!" after the child returns.
  const playVoice = useCallback((key, onEnded, { replayOnReturn = true } = {}) => {
    if (isHiddenRef.current) {
      pendingVoiceRef.current = { key, onEnded };
      return;
    }

    const script = getVoiceScript(zoneId, sceneId, key);
    const path = getAudioPath(zoneId, sceneId, key);
    if (!path) {
      if (script?.text && typeof window !== 'undefined' && window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined') {
        audioVisibilityCleanupRef.current?.();
        audioVisibilityCleanupRef.current = null;

        if (voiceRef.current) {
          voiceRef.current.onended = null;
          voiceRef.current.onerror = null;
          voiceRef.current.pause();
          voiceRef.current = null;
        }

        const utterance = new SpeechSynthesisUtterance(script.text);
        utterance.lang = 'en-IN';
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = voiceVolumeRef.current;

        let callbackFired = false;
        const fireCallback = () => {
          if (callbackFired) return;
          callbackFired = true;
          if (onEnded) onEnded();
        };

        const cleanupAndClear = () => {
          voiceRef.current = null;
          activeVoiceKeyRef.current = null;
          activeVoiceCallbackRef.current = null;
          activeVoiceReplayRef.current = true;
          setIsPlaying(false);
          clearVoDuck();
        };

        utterance.onend = () => { cleanupAndClear(); fireCallback(); };
        utterance.onerror = () => { cleanupAndClear(); fireCallback(); };

        voiceRef.current = null;
        activeVoiceKeyRef.current = key;
        activeVoiceCallbackRef.current = onEnded ?? null;
        activeVoiceReplayRef.current = replayOnReturn;
        setIsPlaying(true);

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        lastInteractionRef.current = Date.now();
        return;
      }

      if (onEnded) onEnded();
      return;
    }

    // Tear down previous audio's belt-and-suspenders listener before replacing it
    audioVisibilityCleanupRef.current?.();
    audioVisibilityCleanupRef.current = null;

    // Stop any currently playing voice - clear handlers BEFORE pausing
    // to prevent the old audio's queued 'ended' event from nulling out voiceRef
    if (voiceRef.current) {
      voiceRef.current.onended = null;
      voiceRef.current.onerror = null;
      voiceRef.current.pause();
      voiceRef.current = null;
    }

    const audio = new Audio(path);
    audio.volume = voiceVolumeRef.current;
    applyVoDuck();

    // Belt-and-suspenders: directly pause this audio element on tab hide,
    // independent of voiceRef tracking — handles any ref-timing edge cases.
    const onTabHide = () => { if (document.hidden) audio.pause(); };
    document.addEventListener('visibilitychange', onTabHide);
    audioVisibilityCleanupRef.current = () => document.removeEventListener('visibilitychange', onTabHide);

    // Guard: ensure onEnded is called exactly once
    let callbackFired = false;
    const fireCallback = () => {
      if (callbackFired) return;
      callbackFired = true;
      if (onEnded) onEnded();
    };

    const cleanupAndClear = () => {
      audioVisibilityCleanupRef.current?.();
      audioVisibilityCleanupRef.current = null;
      voiceRef.current = null;
      activeVoiceKeyRef.current = null;
      activeVoiceCallbackRef.current = null;
      activeVoiceReplayRef.current = true;
      setIsPlaying(false);
      clearVoDuck();
    };

    audio.onended = () => { cleanupAndClear(); fireCallback(); };
    audio.onerror = (e) => {
      console.error(`Error playing voice ${key}:`, e);
      cleanupAndClear();
      fireCallback();
    };

    voiceRef.current = audio;
    activeVoiceKeyRef.current = key;
    activeVoiceCallbackRef.current = onEnded ?? null;
    activeVoiceReplayRef.current = replayOnReturn;
    setIsPlaying(true);

    audio.play().catch(err => {
      // AbortError = play() interrupted by pause() during tab hide.
      // Keep refs alive so handleShow can replay it on return.
      if (err.name === 'AbortError') return;
      console.error('Voice play failed:', err);
      cleanupAndClear();
      fireCallback();
    });

    lastInteractionRef.current = Date.now();
  }, [zoneId, sceneId]); // voiceVolume removed — read from ref instead

  // Stop voice
  const stopVoice = useCallback(() => {
    if (voiceRef.current) {
      // Clear handlers BEFORE pausing — prevents a queued 'ended' event on the
      // old audio from firing after the new audio is already assigned to voiceRef,
      // which would null-out voiceRef and break tab-switch pausing for the new VO.
      audioVisibilityCleanupRef.current?.();
      audioVisibilityCleanupRef.current = null;
      voiceRef.current.onended = null;
      voiceRef.current.onerror = null;
      voiceRef.current.pause();
      voiceRef.current = null;
      activeVoiceKeyRef.current = null;
      activeVoiceCallbackRef.current = null;
      activeVoiceReplayRef.current = true;
      setIsPlaying(false);
      clearVoDuck();
    }
  }, [clearVoDuck]);

  // Set voice volume live — updates currently playing audio AND all future audio
  const setVoiceVolume = useCallback((vol) => {
    const clamped = Math.min(1, Math.max(0, vol));
    voiceVolumeRef.current = clamped;
    if (voiceRef.current) {
      voiceRef.current.volume = clamped;
    }
  }, []);

  // ========================================
  // SFX PLAYBACK
  // ========================================

  const playSfx = useCallback((key) => {
    const path = getSfxPath(key);
    if (!path) {
      console.warn(`SFX not found: ${key}`);
      return;
    }

    // Allow multiple SFX to overlap
    const audio = new Audio(path);
    const base = SFX_BASE_VOLUME[key] ?? 0.35;
    const duck = voDuckActiveRef.current ? VO_DUCK_FACTOR : 1;
    audio.volume = Math.min(1, Math.max(0, base * sfxVolume * duck));

    audio.onerror = (e) => {
      // Fallback to legacy /audio/sfx folder if mapped pack file is missing.
      const fallbackPath = path.replace('/audio/sfx-role-mapping-2/', '/audio/sfx/');
      if (fallbackPath !== path) {
        const fallbackAudio = new Audio(fallbackPath);
        const baseFallback = SFX_BASE_VOLUME[key] ?? 0.35;
        const duckFallback = voDuckActiveRef.current ? VO_DUCK_FACTOR : 1;
        fallbackAudio.volume = Math.min(1, Math.max(0, baseFallback * sfxVolume * duckFallback));
        fallbackAudio.onerror = (err) => {
          console.error(`Error playing SFX ${key} (mapped + fallback failed):`, err);
        };
        fallbackAudio.play().catch(err => {
          console.error('SFX fallback play failed:', err);
        });
        return;
      }
      console.error(`Error playing SFX ${key}:`, e);
    };

    audio.play().catch(err => {
      if (!path.includes('/audio/sfx-role-mapping-2/')) {
        console.error('SFX play failed:', err);
      }
    });

    // Reset idle timer on interaction
    lastInteractionRef.current = Date.now();
  }, [sfxVolume]);

  // ========================================
  // BACKGROUND MUSIC
  // ========================================

  const startMusic = useCallback(() => {
    if (!enableMusic) return;

    const path = getMusicPath('ambient');
    if (!path) return;

    if (musicRef.current) {
      musicRef.current.volume = Math.min(
        1,
        Math.max(0, musicVolume * (voDuckActiveRef.current ? VO_DUCK_FACTOR : 1))
      );
      musicRef.current.play();
      return;
    }

    const audio = new Audio(path);
    audio.volume = Math.min(
      1,
      Math.max(0, musicVolume * (voDuckActiveRef.current ? VO_DUCK_FACTOR : 1))
    );
    audio.loop = true;

    musicRef.current = audio;
    audio.play().catch(err => {
      console.error('Music play failed:', err);
    });
  }, [enableMusic, musicVolume]);

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
    }
  }, []);

  const setMusicVolume = useCallback((volume) => {
    if (musicRef.current) {
      const duck = voDuckActiveRef.current ? VO_DUCK_FACTOR : 1;
      musicRef.current.volume = Math.min(1, Math.max(0, volume * duck));
    }
  }, []);

  // ========================================
  // IDLE HINTS
  // ========================================

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearInterval(idleTimerRef.current);
    }

    idleTimerRef.current = setInterval(() => {
      const timeSinceInteraction = (Date.now() - lastInteractionRef.current) / 1000;

      // Use refs to get current values (not stale closure values)
      if (timeSinceInteraction >= idleTimeout && !isPlayingRef.current && currentPhaseRef.current) {
        const hintKey = getPhaseHint(currentPhaseRef.current);
        playVoice(hintKey);
        // Reset interaction time after playing hint so it doesn't repeat immediately
        lastInteractionRef.current = Date.now();
      }
    }, 1000);
  }, [idleTimeout, playVoice]);

  const stopIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearInterval(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  // Record user interaction (resets idle timer)
  const recordInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
  }, []);

  // ========================================
  // CONVENIENCE METHODS
  // ========================================

  // Play encouragement
  const playEncouragement = useCallback(() => {
    const key = getRandomEncouragement();
    playVoice(key);
  }, [playVoice]);

  // Play correct feedback (SFX + optional voice)
  const playCorrect = useCallback((voiceKey) => {
    playSfx('success');
    if (voiceKey) {
      // Small delay so SFX plays first
      setTimeout(() => playVoice(voiceKey), 300);
    }
  }, [playSfx, playVoice]);

  // Play wrong feedback
  const playWrong = useCallback(() => {
    playSfx('error');
  }, [playSfx]);

  // Play tap feedback
  const playTap = useCallback(() => {
    playSfx('tap');
    recordInteraction();
  }, [playSfx, recordInteraction]);

  // Play power unlock sequence
  const playPowerUnlock = useCallback((voiceKey, onComplete) => {
    playSfx('powerUnlock');
    setTimeout(() => {
      playVoice(voiceKey, onComplete);
    }, 500);
  }, [playSfx, playVoice]);

  // Play celebration
  const playCelebration = useCallback((voiceKey, onComplete) => {
    playSfx('celebration');
    if (voiceKey) {
      setTimeout(() => {
        playVoice(voiceKey, onComplete);
      }, 500);
    }
  }, [playSfx, playVoice]);

  // ========================================
  // SYLLABLE & WORD PLAYBACK (for memory games)
  // ========================================

  // Play a syllable audio (e.g., "va" from vakratunda)
  const playSyllable = useCallback((word, syllable, onEnded) => {
    const path = getSyllablePath(word, syllable);
    if (!path) {
      console.warn(`Syllable not found: ${word}/${syllable}`);
      if (onEnded) onEnded();
      return;
    }

    // Stop any currently playing voice - clear handlers BEFORE pausing
    if (voiceRef.current) {
      voiceRef.current.onended = null;
      voiceRef.current.onerror = null;
      voiceRef.current.pause();
      voiceRef.current = null;
    }

    const audio = new Audio(path);
    audio.volume = voiceVolumeRef.current; // always full volume — game audio, never muted by toggle

    // Guard: ensure onEnded is called exactly once
    let callbackFired = false;
    const fireCallback = () => {
      if (callbackFired) return;
      callbackFired = true;
      if (onEnded) onEnded();
    };

    audio.onended = () => {
      setIsPlaying(false);
      voiceRef.current = null;
      fireCallback();
    };

    audio.onerror = (e) => {
      console.error(`Error playing syllable ${word}/${syllable}:`, e);
      setIsPlaying(false);
      voiceRef.current = null;
      fireCallback();
    };

    voiceRef.current = audio;
    setIsPlaying(true);
    audio.play().catch(err => {
      if (err.name === 'AbortError') return;
      console.error('Syllable play failed:', err);
      setIsPlaying(false);
      voiceRef.current = null;
      fireCallback();
    });

    lastInteractionRef.current = Date.now();
  }, []);

  // Play a full word audio (e.g., "vakratunda")
  const playWord = useCallback((word, onEnded) => {
    const path = getWordPath(word);
    if (!path) {
      console.warn(`Word not found: ${word}`);
      if (onEnded) onEnded();
      return;
    }

    // Stop any currently playing voice - clear handlers BEFORE pausing
    if (voiceRef.current) {
      voiceRef.current.onended = null;
      voiceRef.current.onerror = null;
      voiceRef.current.pause();
      voiceRef.current = null;
    }

    const audio = new Audio(path);
    audio.volume = voiceVolumeRef.current; // always full volume — game audio, never muted by toggle

    // Guard: ensure onEnded is called exactly once
    let callbackFired = false;
    const fireCallback = () => {
      if (callbackFired) return;
      callbackFired = true;
      if (onEnded) onEnded();
    };

    audio.onended = () => {
      setIsPlaying(false);
      voiceRef.current = null;
      fireCallback();
    };

    audio.onerror = (e) => {
      console.error(`Error playing word ${word}:`, e);
      setIsPlaying(false);
      voiceRef.current = null;
      fireCallback();
    };

    voiceRef.current = audio;
    setIsPlaying(true);
    audio.play().catch(err => {
      if (err.name === 'AbortError') return;
      console.error('Word play failed:', err);
      setIsPlaying(false);
      voiceRef.current = null;
      fireCallback();
    });

    lastInteractionRef.current = Date.now();
  }, []);

  // ========================================
  // APP VISIBILITY (tab switch / phone call)
  // ========================================

  const musicWasPlayingRef = useRef(false);
  // Stores the voice key+callback that was mid-play when app was hidden,
  // so we can replay from start on return (mid-sentence resume is jarring for kids).
  const interruptedVoiceRef = useRef(null);

  const handleHide = useCallback(() => {
    isHiddenRef.current = true;

    musicWasPlayingRef.current = !!(musicRef.current && !musicRef.current.paused);

    // Store interrupted voice — include replayOnReturn so handleShow knows whether to replay
    if (voiceRef.current && activeVoiceKeyRef.current) {
      interruptedVoiceRef.current = {
        key: activeVoiceKeyRef.current,
        onEnded: activeVoiceCallbackRef.current,
        replayOnReturn: activeVoiceReplayRef.current,
      };
    }

    if (musicRef.current) musicRef.current.pause();
    if (voiceRef.current) {
      // Belt-and-suspenders listener already paused the audio element directly;
      // still clean up refs and handlers for correctness.
      audioVisibilityCleanupRef.current?.();
      audioVisibilityCleanupRef.current = null;
      const dying = voiceRef.current;
      dying.onended = null;
      dying.onerror = null;
      dying.pause();
      // Release the media resource so the browser cannot auto-resume this
      // orphaned element on pageshow/visibilitychange (iOS Safari, Chrome Android).
      // Handlers are already cleared above so the emptied event is harmless.
      dying.src = '';
      voiceRef.current = null;
    }
    activeVoiceKeyRef.current = null;
    activeVoiceCallbackRef.current = null;
    activeVoiceReplayRef.current = true;
    setIsPlaying(false);
    clearVoDuck();
    stopIdleTimer();
  }, [stopIdleTimer, clearVoDuck]);

  const handleShow = useCallback(() => {
    isHiddenRef.current = false;

    if (musicWasPlayingRef.current && musicRef.current) {
      musicRef.current.play().catch(() => {});
    }

    let voiceWillPlay = false;

    if (interruptedVoiceRef.current?.key) {
      const { key, onEnded, replayOnReturn } = interruptedVoiceRef.current;
      interruptedVoiceRef.current = null;
      if (replayOnReturn) {
        // 2-second pause before replay to avoid collision with hint reset
        setTimeout(() => {
          playVoice(key, onEnded);
        }, 2000);
        voiceWillPlay = true;
      }
    } else if (pendingVoiceRef.current) {
      const { key, onEnded } = pendingVoiceRef.current;
      pendingVoiceRef.current = null;
      // 2-second pause before replay to avoid collision with hint reset
      setTimeout(() => {
        playVoice(key, onEnded);
      }, 2000);
      voiceWillPlay = true;
    }

    // No VO queued — give the scene a chance to play a contextual reminder
    if (!voiceWillPlay) {
      onReturnHintRef.current?.();
    }

    startIdleTimer();
  }, [playVoice, startIdleTimer]);

  useAppVisibility(handleHide, handleShow, { resumeDelay });

  // ========================================
  // LIFECYCLE
  // ========================================

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoice();
      stopMusic();
      stopIdleTimer();
    };
  }, [stopVoice, stopMusic, stopIdleTimer]);

  return {
    // State
    isPlaying,
    currentPhase,
    setCurrentPhase,

    // Voice
    playVoice,
    stopVoice,
    setVoiceVolume,

    // Syllable & Word (for memory games)
    playSyllable,
    playWord,

    // SFX
    playSfx,
    playTap,
    playCorrect,
    playWrong,

    // Music
    startMusic,
    stopMusic,
    setMusicVolume,

    // Convenience
    playEncouragement,
    playPowerUnlock,
    playCelebration,

    // Idle
    startIdleTimer,
    stopIdleTimer,
    recordInteraction
  };
};

export default useVoiceGuidance;
