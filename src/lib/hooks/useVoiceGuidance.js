import { useState, useRef, useCallback, useEffect } from 'react';
import useAppVisibility from './useAppVisibility';
import {
  getAudioPath,
  getSfxPath,
  getMusicPath,
  getPhaseHint,
  getRandomEncouragement,
  getSyllablePath,
  getWordPath
} from '../config/content/voiceGuidance';

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
  resumeDelay = 0   // ms to wait before resuming audio after tab return (e.g. 3000 for 3-2-1)
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
  // Track the currently-playing voice key+callback so handleHide can store them
  const activeVoiceKeyRef = useRef(null);
  const activeVoiceCallbackRef = useRef(null);

  // Refs for idle timer to access current values
  const isPlayingRef = useRef(isPlaying);
  const currentPhaseRef = useRef(currentPhase);

  // Deferred setIsPlaying to avoid "Cannot update component while rendering another" warning
  const setIsPlaying = (value) => {
    isPlayingRef.current = value; // Update ref immediately for synchronous checks
    queueMicrotask(() => setIsPlayingState(value)); // Defer state update
  };

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  // Keep voiceVolumeRef in sync when the prop changes (e.g. parent passes new volume)
  useEffect(() => {
    voiceVolumeRef.current = voiceVolume;
  }, [voiceVolume]);

  // ========================================
  // VOICE PLAYBACK
  // ========================================

  const playVoice = useCallback((key, onEnded) => {
    if (isHiddenRef.current) {
      pendingVoiceRef.current = { key, onEnded };
      return;
    }

    const path = getAudioPath(zoneId, sceneId, key);
    if (!path) {
      console.warn(`Voice not found: ${key} for ${zoneId}/${sceneId}`);
      // ⭐ FIX: Still call onEnded so flow continues even if audio path not found
      if (onEnded) onEnded();
      return;
    }

    // Stop any currently playing voice - clear handlers BEFORE pausing
    // to prevent the old audio's abort/error from firing the old callback
    if (voiceRef.current) {
      voiceRef.current.onended = null;
      voiceRef.current.onerror = null;
      voiceRef.current.pause();
      voiceRef.current = null;
    }

    const audio = new Audio(path);
    audio.volume = voiceVolumeRef.current; // use ref — updated live by setVoiceVolume

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
      activeVoiceKeyRef.current = null;
      activeVoiceCallbackRef.current = null;
      fireCallback();
    };

    audio.onerror = (e) => {
      console.error(`Error playing voice ${key}:`, e);
      setIsPlaying(false);
      voiceRef.current = null;
      activeVoiceKeyRef.current = null;
      activeVoiceCallbackRef.current = null;
      // Still call onEnded so the flow continues even if audio fails
      fireCallback();
    };

    voiceRef.current = audio;
    activeVoiceKeyRef.current = key;
    activeVoiceCallbackRef.current = onEnded ?? null;
    setIsPlaying(true);
    audio.play().catch(err => {
      console.error('Voice play failed:', err);
      setIsPlaying(false);
      voiceRef.current = null;
      activeVoiceKeyRef.current = null;
      activeVoiceCallbackRef.current = null;
      // Still call onEnded so the flow continues even if audio fails
      fireCallback();
    });

    // Reset idle timer on voice play
    lastInteractionRef.current = Date.now();
  }, [zoneId, sceneId]); // voiceVolume removed — read from ref instead

  // Stop voice
  const stopVoice = useCallback(() => {
    if (voiceRef.current) {
      // Clear handlers BEFORE pausing — prevents a queued 'ended' event on the
      // old audio from firing after the new audio is already assigned to voiceRef,
      // which would null-out voiceRef and break tab-switch pausing for the new VO.
      voiceRef.current.onended = null;
      voiceRef.current.onerror = null;
      voiceRef.current.pause();
      voiceRef.current = null;
      activeVoiceKeyRef.current = null;
      activeVoiceCallbackRef.current = null;
      setIsPlaying(false);
    }
  }, []);

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
    audio.volume = sfxVolume;

    audio.onerror = (e) => {
      console.error(`Error playing SFX ${key}:`, e);
    };

    audio.play().catch(err => {
      console.error('SFX play failed:', err);
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
      musicRef.current.play();
      return;
    }

    const audio = new Audio(path);
    audio.volume = musicVolume;
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
      musicRef.current.volume = Math.min(1, Math.max(0, volume));
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
    audio.volume = voiceVolume; // always full volume — game audio, never muted by toggle

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
      console.error('Syllable play failed:', err);
      setIsPlaying(false);
      voiceRef.current = null;
      fireCallback();
    });

    lastInteractionRef.current = Date.now();
  }, [voiceVolume]);

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
    audio.volume = voiceVolume; // always full volume — game audio, never muted by toggle

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
      console.error('Word play failed:', err);
      setIsPlaying(false);
      voiceRef.current = null;
      fireCallback();
    });

    lastInteractionRef.current = Date.now();
  }, [voiceVolume]);

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

    // Store key+callback of interrupted voice so we can do a full replay on return
    if (voiceRef.current && !voiceRef.current.paused && activeVoiceKeyRef.current) {
      interruptedVoiceRef.current = {
        key: activeVoiceKeyRef.current,
        onEnded: activeVoiceCallbackRef.current,
      };
    }

    if (musicRef.current) musicRef.current.pause();
    if (voiceRef.current) {
      voiceRef.current.onended = null;
      voiceRef.current.onerror = null;
      voiceRef.current.pause();
      voiceRef.current = null;
    }
    activeVoiceKeyRef.current = null;
    activeVoiceCallbackRef.current = null;
    setIsPlaying(false);
    stopIdleTimer();
  }, [stopIdleTimer]);

  const handleShow = useCallback(() => {
    isHiddenRef.current = false;

    if (musicWasPlayingRef.current && musicRef.current) {
      musicRef.current.play().catch(() => {});
    }

    // Replay interrupted voice only if it had an onEnded callback —
    // meaning the game is blocked waiting for it (e.g. instruction VOs).
    // Pure celebratory VOs (no onEnded) are skipped: scene has moved on visually.
    if (interruptedVoiceRef.current?.key) {
      const { key, onEnded } = interruptedVoiceRef.current;
      interruptedVoiceRef.current = null;
      if (onEnded) playVoice(key, onEnded);
    } else if (pendingVoiceRef.current) {
      const { key, onEnded } = pendingVoiceRef.current;
      pendingVoiceRef.current = null;
      playVoice(key, onEnded);
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
