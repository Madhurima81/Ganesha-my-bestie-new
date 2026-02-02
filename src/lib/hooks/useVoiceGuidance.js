import { useState, useRef, useCallback, useEffect } from 'react';
import {
  getAudioPath,
  getSfxPath,
  getMusicPath,
  getPhaseHint,
  getRandomEncouragement
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
  idleTimeout = 10
} = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(null);

  const voiceRef = useRef(null);
  const sfxRef = useRef(null);
  const musicRef = useRef(null);
  const idleTimerRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());

  // ========================================
  // VOICE PLAYBACK
  // ========================================

  const playVoice = useCallback((key, onEnded) => {
    const path = getAudioPath(zoneId, sceneId, key);
    if (!path) {
      console.warn(`Voice not found: ${key}`);
      return;
    }

    // Stop any currently playing voice
    if (voiceRef.current) {
      voiceRef.current.pause();
      voiceRef.current = null;
    }

    const audio = new Audio(path);
    audio.volume = voiceVolume;

    audio.onended = () => {
      setIsPlaying(false);
      voiceRef.current = null;
      if (onEnded) onEnded();
    };

    audio.onerror = (e) => {
      console.error(`Error playing voice ${key}:`, e);
      setIsPlaying(false);
      voiceRef.current = null;
      // Still call onEnded so the flow continues even if audio fails
      if (onEnded) onEnded();
    };

    voiceRef.current = audio;
    setIsPlaying(true);
    audio.play().catch(err => {
      console.error('Voice play failed:', err);
      setIsPlaying(false);
      voiceRef.current = null;
      // Still call onEnded so the flow continues even if audio fails
      if (onEnded) onEnded();
    });

    // Reset idle timer on voice play
    lastInteractionRef.current = Date.now();
  }, [zoneId, sceneId, voiceVolume]);

  // Stop voice
  const stopVoice = useCallback(() => {
    if (voiceRef.current) {
      voiceRef.current.pause();
      voiceRef.current = null;
      setIsPlaying(false);
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

      if (timeSinceInteraction >= idleTimeout && !isPlaying && currentPhase) {
        const hintKey = getPhaseHint(currentPhase);
        playVoice(hintKey);
      }
    }, 1000);
  }, [idleTimeout, isPlaying, currentPhase, playVoice]);

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
