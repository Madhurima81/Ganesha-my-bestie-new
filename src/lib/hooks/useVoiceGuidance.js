import { useState, useRef, useCallback, useEffect } from 'react';
import useAppVisibility from './useAppVisibility';
import { attachSpeechCue, startCueTimer } from '../utils/speechCue';
import {
  getVoiceScript,
  getAudioPath,
  getMusicPath,
  getPhaseHint,
  getRandomEncouragement,
  getSyllablePath,
  getWordPath
} from '../config/content/voiceGuidance';

import { isAmbientOn, subscribeSoundPrefs } from '../utils/soundPrefs';
import { sfx } from '../audio/sfx';

// The audio toggle is a VOICE mute (see DECISIONS.md 2026-09-29, T55): when the
// shared preference is off, ALL voice — guidance VO, hints, Sanskrit words and
// syllables — is silent. SFX are NOT affected. Read live from storage so no scene has to thread it in.
// Muted playback still resolves its callback — on a silent timer matching the
// line's length, not instantly — so gameplay never hangs and mute never skips.
const isGlobalAudioOff = () => {
  try {
    return localStorage.getItem('ganesha_audio_enabled') === 'false';
  } catch {
    return false;
  }
};

// Rough spoken duration, used to time a line's completion while muted.
export const estimateSpeechMs = (text) => {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  return words ? Math.max(900, words * 380 + 300) : 1500;
};

// SFX levels, files and legacy-name aliases now live in lib/audio/sfx.js (the shared engine).

const VO_DUCK_FACTOR = 0.7; // ~30% reduction while VO is active

const stripLeadingSpeechText = (text, leadingText) => {
  if (!text || !leadingText) return text;
  const pattern = new RegExp(`^\\s*${leadingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:.!,-]*\\s*`, 'i');
  return text.replace(pattern, '').trim();
};

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
  const activeVoiceTextOverrideRef = useRef(null);
  const activeVoiceStripLeadingTextRef = useRef(null);
  // Belt-and-suspenders: cleanup fn for the per-audio visibilitychange listener
  const audioVisibilityCleanupRef = useRef(null);
  // Called from handleShow when no VO is replayed — scene provides context-aware hint
  const onReturnHintRef = useRef(null);
  // The in-flight SpeechSynthesisUtterance on the TTS fallback path. voiceRef stays
  // null for TTS, so hide/stop paths need this to cancel speech and detach its
  // onend/onerror before cancel() fires them (which would advance the phase).
  const ttsUtteranceRef = useRef(null);
  // The 2s tab-return replay timer. Must be cleared on stop/unmount so an old
  // scene's VO can't start over Zone Welcome after a quick Home tap.
  const replayTimeoutRef = useRef(null);
  // Muted playback: a line that "plays" while the global mute is on runs on a silent
  // timer instead of audio, so its onEnded still fires once, on schedule.
  const silentTimersRef = useRef(new Set());
  const ttsTimingRef = useRef(null); // { at, ms } for the in-flight TTS utterance

  const clearSilentTimers = useCallback(() => {
    silentTimersRef.current.forEach((id) => clearTimeout(id));
    silentTimersRef.current.clear();
  }, []);

  const runSilent = useCallback((onEnded, ms) => {
    const id = setTimeout(() => {
      silentTimersRef.current.delete(id);
      onEnded?.();
    }, Math.max(0, ms));
    silentTimersRef.current.add(id);
  }, []);

  // Public: complete a muted line after the time it would have taken to speak.
  // `textOrMs` is the spoken text (duration estimated) or a number of ms.
  const playSilent = useCallback((textOrMs, onEnded) => {
    runSilent(onEnded, typeof textOrMs === 'number' ? textOrMs : estimateSpeechMs(textOrMs));
  }, [runSilent]);

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
    sfx.setVoiceActive(true);
    if (musicRef.current) {
      musicRef.current.volume = Math.min(1, Math.max(0, musicVolume * VO_DUCK_FACTOR));
    }
  }, [musicVolume]);

  const clearVoDuck = useCallback(() => {
    voDuckActiveRef.current = false;
    sfx.setVoiceActive(false);
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
  const playVoice = useCallback((key, onEnded, {
    replayOnReturn = true,
    textOverride = null,
    stripLeadingText = null,
    // { word, onCue, cueMs? } — fire onCue when `word` of this line is spoken (see utils/speechCue)
    cue = null
  } = {}) => {
    if (isGlobalAudioOff()) {
      const mutedScript = getVoiceScript(zoneId, sceneId, key);
      clearSilentTimers();
      startCueTimer(textOverride || mutedScript?.text, cue);
      playSilent(textOverride || mutedScript?.text, onEnded);
      return;
    }
    if (isHiddenRef.current) {
      pendingVoiceRef.current = { key, onEnded, options: { replayOnReturn, textOverride, stripLeadingText } };
      return;
    }

    const script = getVoiceScript(zoneId, sceneId, key);
    const path = getAudioPath(zoneId, sceneId, key);
    const ttsText = stripLeadingSpeechText(textOverride || script?.text, stripLeadingText);
    if (!path) {
      if (ttsText && typeof window !== 'undefined' && window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined') {
        audioVisibilityCleanupRef.current?.();
        audioVisibilityCleanupRef.current = null;

        if (voiceRef.current) {
          voiceRef.current.onended = null;
          voiceRef.current.onerror = null;
          voiceRef.current.pause();
          voiceRef.current = null;
        }

        const utterance = new SpeechSynthesisUtterance(ttsText);
        utterance.lang = 'en-IN';
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = voiceVolumeRef.current;
        attachSpeechCue(utterance, ttsText, cue);

        let callbackFired = false;
        const fireCallback = () => {
          if (callbackFired) return;
          callbackFired = true;
          if (onEnded) onEnded();
        };

        const cleanupAndClear = () => {
          if (ttsUtteranceRef.current === utterance) ttsUtteranceRef.current = null;
          voiceRef.current = null;
          activeVoiceKeyRef.current = null;
          activeVoiceCallbackRef.current = null;
          activeVoiceReplayRef.current = true;
          activeVoiceTextOverrideRef.current = null;
          activeVoiceStripLeadingTextRef.current = null;
          setIsPlaying(false);
          clearVoDuck();
        };

        utterance.onend = () => { cleanupAndClear(); fireCallback(); };
        utterance.onerror = () => { cleanupAndClear(); fireCallback(); };

        // Detach the previous utterance's handlers before cancel() so its
        // onend/onerror can't fire the old callback on top of this one.
        if (ttsUtteranceRef.current) {
          ttsUtteranceRef.current.onend = null;
          ttsUtteranceRef.current.onerror = null;
        }
        ttsUtteranceRef.current = utterance;
        voiceRef.current = null;
        activeVoiceKeyRef.current = key;
        activeVoiceCallbackRef.current = onEnded ?? null;
        activeVoiceReplayRef.current = replayOnReturn;
        activeVoiceTextOverrideRef.current = textOverride;
        activeVoiceStripLeadingTextRef.current = stripLeadingText;
        setIsPlaying(true);

        ttsTimingRef.current = { at: Date.now(), ms: estimateSpeechMs(utterance.text) };
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

    // Cancel any in-flight TTS fallback so it can't queue behind this audio
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

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
      activeVoiceTextOverrideRef.current = null;
      activeVoiceStripLeadingTextRef.current = null;
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
    activeVoiceTextOverrideRef.current = textOverride;
    activeVoiceStripLeadingTextRef.current = stripLeadingText;
    setIsPlaying(true);

    // Recorded line: fire the cue at cue.cueMs (measured from the recording), or the estimate.
    startCueTimer(ttsText, cue);

    audio.play().catch(err => {
      // AbortError = play() interrupted by pause() during tab hide.
      // Keep refs alive so handleShow can replay it on return.
      if (err.name === 'AbortError') return;
      console.error('Voice play failed:', err);
      cleanupAndClear();
      fireCallback();
    });

    lastInteractionRef.current = Date.now();
  }, [zoneId, sceneId, playSilent, clearSilentTimers]); // voiceVolume removed — read from ref instead

  // Stop voice
  const stopVoice = useCallback(() => {
    clearSilentTimers();
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = null;
    }
    // TTS path: detach handlers first so cancel() doesn't fire onEnded.
    if (ttsUtteranceRef.current) {
      ttsUtteranceRef.current.onend = null;
      ttsUtteranceRef.current.onerror = null;
      ttsUtteranceRef.current = null;
      activeVoiceKeyRef.current = null;
      activeVoiceCallbackRef.current = null;
      activeVoiceReplayRef.current = true;
      activeVoiceTextOverrideRef.current = null;
      activeVoiceStripLeadingTextRef.current = null;
      setIsPlaying(false);
      clearVoDuck();
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
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
      activeVoiceTextOverrideRef.current = null;
      activeVoiceStripLeadingTextRef.current = null;
      setIsPlaying(false);
      clearVoDuck();
    }
  }, [clearVoDuck, clearSilentTimers]);

  // Mute pressed mid-line: silence the audio now, but let the line's callback fire
  // later, once, when it would have finished — so mute never skips or stalls a
  // step. The old line is never resumed on unmute.
  const muteVoicePlayback = useCallback(() => {
    const cb = activeVoiceCallbackRef.current;
    let remainingMs;
    const audio = voiceRef.current;
    if (audio) {
      remainingMs = Number.isFinite(audio.duration) && audio.duration > 0
        ? (audio.duration - audio.currentTime) * 1000
        : 1500;
    } else if (ttsUtteranceRef.current) {
      const t = ttsTimingRef.current;
      remainingMs = t ? t.ms - (Date.now() - t.at) : 1500;
    } else {
      return;
    }
    stopVoice();
    runSilent(cb, remainingMs);
  }, [stopVoice, runSilent]);

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

  // Thin wrapper: the shared engine (lib/audio/sfx.js) owns files, levels, duck and Settings gating.
  // `key` may be a role ('correct') or a legacy name ('success', 'chime').
  const playSfx = useCallback((key) => {
    sfx.play(key);
    // Reset idle timer on interaction
    lastInteractionRef.current = Date.now();
  }, []);

  // ========================================
  // BACKGROUND MUSIC
  // ========================================

  const startMusic = useCallback(() => {
    if (!enableMusic || !isAmbientOn()) return; // Parent Settings > Ambience

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

  // Ambience switched in Settings while a scene is mounted: pause now; on again, resume
  // only music that was already started (a scene that never started it stays silent).
  useEffect(() => subscribeSoundPrefs((kind, on) => {
    if (kind !== 'ambience' || !musicRef.current) return;
    if (!on) musicRef.current.pause();
    else musicRef.current.play().catch(() => {});
  }), []);

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
    if (isGlobalAudioOff()) {
      clearSilentTimers();
      playSilent(700, onEnded);
      return;
    }
    const path = getSyllablePath(word, syllable);
    if (!path) {
      console.warn(`Syllable not found: ${word}/${syllable}`);
      if (onEnded) onEnded();
      return;
    }

    // Route through stopVoice so activeVoiceKeyRef/activeVoiceReplayRef/vo-duck
    // stay consistent — this is the shared "kill whatever's on the channel" path.
    stopVoice();

    const audio = new Audio(path);
    audio.volume = voiceVolumeRef.current; // follows the voice volume; the voice toggle mutes this too (voice mute)

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
      activeVoiceTextOverrideRef.current = null;
      activeVoiceStripLeadingTextRef.current = null;
      fireCallback();
    };

    audio.onerror = (e) => {
      console.error(`Error playing syllable ${word}/${syllable}:`, e);
      setIsPlaying(false);
      voiceRef.current = null;
      activeVoiceKeyRef.current = null;
      activeVoiceCallbackRef.current = null;
      activeVoiceTextOverrideRef.current = null;
      activeVoiceStripLeadingTextRef.current = null;
      fireCallback();
    };

    voiceRef.current = audio;
    activeVoiceKeyRef.current = `syllable:${word}-${syllable}`;
    activeVoiceCallbackRef.current = onEnded ?? null;
    activeVoiceReplayRef.current = false; // don't replay a syllable tap after tab return
    activeVoiceTextOverrideRef.current = null;
    activeVoiceStripLeadingTextRef.current = null;
    setIsPlaying(true);
    audio.play().catch(err => {
      if (err.name === 'AbortError') return;
      console.error('Syllable play failed:', err);
      setIsPlaying(false);
      voiceRef.current = null;
      activeVoiceKeyRef.current = null;
      activeVoiceCallbackRef.current = null;
      activeVoiceTextOverrideRef.current = null;
      activeVoiceStripLeadingTextRef.current = null;
      fireCallback();
    });

    lastInteractionRef.current = Date.now();
  }, [stopVoice, playSilent, clearSilentTimers]);

  // Play a full word audio (e.g., "vakratunda")
  const playWord = useCallback((word, onEnded) => {
    if (isGlobalAudioOff()) {
      clearSilentTimers();
      playSilent(1000, onEnded);
      return;
    }
    const path = getWordPath(word);
    if (!path) {
      console.warn(`Word not found: ${word}`);
      if (onEnded) onEnded();
      return;
    }

    // Route through stopVoice so activeVoiceKeyRef/activeVoiceReplayRef/vo-duck
    // stay consistent — this is the shared "kill whatever's on the channel" path.
    stopVoice();

    const audio = new Audio(path);
    audio.volume = voiceVolumeRef.current; // follows the voice volume; the voice toggle mutes this too (voice mute)

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
      activeVoiceTextOverrideRef.current = null;
      activeVoiceStripLeadingTextRef.current = null;
      fireCallback();
    };

    audio.onerror = (e) => {
      console.error(`Error playing word ${word}:`, e);
      setIsPlaying(false);
      voiceRef.current = null;
      activeVoiceKeyRef.current = null;
      activeVoiceCallbackRef.current = null;
      activeVoiceTextOverrideRef.current = null;
      activeVoiceStripLeadingTextRef.current = null;
      fireCallback();
    };

    voiceRef.current = audio;
    activeVoiceKeyRef.current = `word:${word}`;
    activeVoiceCallbackRef.current = onEnded ?? null;
    activeVoiceReplayRef.current = false; // don't replay a word playback after tab return
    activeVoiceTextOverrideRef.current = null;
    activeVoiceStripLeadingTextRef.current = null;
    setIsPlaying(true);
    audio.play().catch(err => {
      if (err.name === 'AbortError') return;
      console.error('Word play failed:', err);
      setIsPlaying(false);
      voiceRef.current = null;
      activeVoiceKeyRef.current = null;
      activeVoiceCallbackRef.current = null;
      activeVoiceTextOverrideRef.current = null;
      activeVoiceStripLeadingTextRef.current = null;
      fireCallback();
    });

    lastInteractionRef.current = Date.now();
  }, [stopVoice, playSilent, clearSilentTimers]);

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

    // Store interrupted voice — include replayOnReturn so handleShow knows whether to replay.
    // Covers both the MP3 path (voiceRef set) and the TTS path (ttsUtteranceRef set).
    if ((voiceRef.current || ttsUtteranceRef.current) && activeVoiceKeyRef.current) {
      interruptedVoiceRef.current = {
        key: activeVoiceKeyRef.current,
        onEnded: activeVoiceCallbackRef.current,
        replayOnReturn: activeVoiceReplayRef.current,
        textOverride: activeVoiceTextOverrideRef.current,
        stripLeadingText: activeVoiceStripLeadingTextRef.current,
      };
    }

    // TTS path: stop speaking in the background. Detach handlers first so the
    // cancel-triggered onend/onerror can't advance the scene while hidden.
    if (ttsUtteranceRef.current) {
      ttsUtteranceRef.current.onend = null;
      ttsUtteranceRef.current.onerror = null;
      ttsUtteranceRef.current = null;
      try { window.speechSynthesis?.cancel(); } catch { /* no-op */ }
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
    activeVoiceTextOverrideRef.current = null;
    activeVoiceStripLeadingTextRef.current = null;
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
      const { key, onEnded, replayOnReturn, textOverride, stripLeadingText } = interruptedVoiceRef.current;
      interruptedVoiceRef.current = null;
      if (replayOnReturn) {
        // 2-second pause before replay to avoid collision with hint reset
        if (replayTimeoutRef.current) clearTimeout(replayTimeoutRef.current);
        replayTimeoutRef.current = setTimeout(() => {
          replayTimeoutRef.current = null;
          playVoice(key, onEnded, { replayOnReturn, textOverride, stripLeadingText });
        }, 2000);
        voiceWillPlay = true;
      }
    } else if (pendingVoiceRef.current) {
      const { key, onEnded, options } = pendingVoiceRef.current;
      pendingVoiceRef.current = null;
      // 2-second pause before replay to avoid collision with hint reset
      if (replayTimeoutRef.current) clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = setTimeout(() => {
        replayTimeoutRef.current = null;
        playVoice(key, onEnded, options);
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
      if (replayTimeoutRef.current) {
        clearTimeout(replayTimeoutRef.current);
        replayTimeoutRef.current = null;
      }
      pendingVoiceRef.current = null;
      interruptedVoiceRef.current = null;
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
    muteVoicePlayback,
    playSilent,
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
