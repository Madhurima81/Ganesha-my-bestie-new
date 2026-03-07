import { useState, useCallback } from 'react';

const AUDIO_PREF_KEY = 'ganesha_audio_enabled';

/**
 * useAudioPreference
 * Manages the global audio on/off preference with localStorage persistence.
 * Use this in every scene to replace local `[isAudioOn, setIsAudioOn]` state.
 *
 * Usage:
 *   const { isAudioOn, toggleAudio, setAudioEnabled } = useAudioPreference();
 *
 * Pass `isAudioOn` to all VO/SFX guards, and `toggleAudio` to <AudioToggle>.
 * Use `setAudioEnabled(false)` in onReplay to mute audio on scene reset.
 */
const useAudioPreference = () => {
  const [isAudioOn, setIsAudioOn] = useState(() => {
    try {
      const saved = localStorage.getItem(AUDIO_PREF_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true; // fallback if localStorage is unavailable
    }
  });

  const toggleAudio = useCallback(() => {
    setIsAudioOn(prev => {
      const next = !prev;
      try {
        localStorage.setItem(AUDIO_PREF_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  // Directly set audio enabled/disabled (used by onReplay to mute on scene reset)
  const setAudioEnabled = useCallback((enabled) => {
    try {
      localStorage.setItem(AUDIO_PREF_KEY, String(enabled));
    } catch {
      // ignore storage errors
    }
    setIsAudioOn(enabled);
  }, []);

  return { isAudioOn, toggleAudio, setAudioEnabled };
};

export default useAudioPreference;
