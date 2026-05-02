// SyllableVoiceChallenge.jsx
// Simplified "say it with me" overlay — record yourself, hear yourself, decide.
// No speech recognition. No AI judgment. Self-assessment only.
//
// Flow:
//   1. Card appears, syllable audio plays automatically
//   2. After audio ends, mic auto-records for 3s (child says it out loud)
//   3. Recording stops → child taps "▶ Hear myself" to play back their voice
//   4. Two buttons: "▶ Hear myself" and "✓ Done"
//
// Works identically on iOS, Android, and future native — no SpeechRecognition API needed.
// MediaRecorder is supported on all modern browsers including iOS Safari 14.5+.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import SparkleAnimation from '../../../lib/components/animation/SparkleAnimation';
import './SyllableVoiceChallenge.css';
import micIcon from './assets/images/mic-icon.png';

const MAX_RECORDING_FAILSAFE_MS = 20000; // safety only; primary stop is manual button tap
const SYLLABLE_AUDIO_DELAY_MS = 300;   // brief pause after card opens before audio plays
const POST_AUDIO_RECORD_DELAY_MS = 120; // brief pause after audio ends before mic opens

const SyllableVoiceChallenge = ({
  syllable,                       // e.g. 'va'
  displayLabel,                   // e.g. 'VA' (shown big to the kid)
  onComplete,                     // () => void — resumes the game
  mooshikaImage,                  // path to mooshika-coach.png
  replayAudio,                    // () => void — replays the syllable/word audio
  stopAudio,                      // () => void — stops all game audio before mic opens
  inline = false,                 // true → no backdrop overlay
  simpleMode = false,             // kept for API compatibility (no longer used internally)
  autoContinueOnSuccessMs = 0,    // kept for API compatibility
}) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('listening-audio'); // listening-audio | recording | done-recording | playing-back
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [micDenied, setMicDenied] = useState(false);
  const [showDoneSparkles, setShowDoneSparkles] = useState(false);
  const [mooshikaBounceKey, setMooshikaBounceKey] = useState(0);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const playbackAudioRef = useRef(null);
  const recordTimerRef = useRef(null);
  const audioStartTimerRef = useRef(null);
  const mountedRef = useRef(true);

  // ── Cleanup helpers ────────────────────────────────────────────────────────
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const cleanupTimers = useCallback(() => {
    if (recordTimerRef.current) { clearTimeout(recordTimerRef.current); recordTimerRef.current = null; }
    if (audioStartTimerRef.current) { clearTimeout(audioStartTimerRef.current); audioStartTimerRef.current = null; }
  }, []);

  const cleanupPlayback = useCallback(() => {
    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
      playbackAudioRef.current = null;
    }
  }, []);

  // ── Mic recording ──────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        cleanupStream();
        if (!mountedRef.current) return;
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setPhase('done-recording');
      };

      recorder.start();
      setPhase('recording');

      // Safety auto-stop only (primary stop is manual)
      recordTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, MAX_RECORDING_FAILSAFE_MS);
    } catch (err) {
      // Mic denied or unavailable — show fallback (just a Done button, no recording)
      console.warn('[SVC] Mic access denied or unavailable:', err?.name);
      if (mountedRef.current) {
        setMicDenied(true);
        setPhase('done-recording');
      }
    }
  }, [cleanupStream]);

  // ── Initial flow: play syllable audio TWICE → start recording ──────────────
  useEffect(() => {
    mountedRef.current = true;

    const ESTIMATED_AUDIO_MS = 1500;
    const GAP_BETWEEN_PLAYS_MS = 400;

    // Play 1
    audioStartTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      replayAudio?.();
      setMooshikaBounceKey(k => k + 1);

      // Play 2 (after first play ends + short gap)
      audioStartTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        replayAudio?.();
        setMooshikaBounceKey(k => k + 1);

        // Open mic after second play ends
        audioStartTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          stopAudio?.();
          setTimeout(() => {
            if (mountedRef.current) startRecording();
          }, POST_AUDIO_RECORD_DELAY_MS);
        }, ESTIMATED_AUDIO_MS);
      }, ESTIMATED_AUDIO_MS + GAP_BETWEEN_PLAYS_MS);
    }, SYLLABLE_AUDIO_DELAY_MS);

    return () => {
      mountedRef.current = false;
      cleanupTimers();
      cleanupStream();
      cleanupPlayback();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Playback ───────────────────────────────────────────────────────────────
  const handlePlayback = useCallback(() => {
    if (!recordedUrl) return;
    if (phase === 'playing-back') {
      cleanupPlayback();
      setPhase('done-recording');
      return;
    }
    cleanupPlayback();
    const audio = new Audio(recordedUrl);
    playbackAudioRef.current = audio;
    audio.onended = () => {
      if (mountedRef.current) setPhase('done-recording');
      playbackAudioRef.current = null;
    };
    audio.onerror = () => {
      if (mountedRef.current) setPhase('done-recording');
      playbackAudioRef.current = null;
    };
    audio.play().catch(() => {
      if (mountedRef.current) setPhase('done-recording');
    });
    setPhase('playing-back');
  }, [recordedUrl, phase, cleanupPlayback]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // ── Done — celebrate and continue ──────────────────────────────────────────
  const handleDone = useCallback(() => {
    setShowDoneSparkles(true);
    setTimeout(() => {
      onComplete?.();
    }, 700);
  }, [onComplete]);

  // ── Close (X) ──────────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  // ── Render helpers ─────────────────────────────────────────────────────────
  const showRecordingIndicator = phase === 'recording';
  const showActions = phase === 'done-recording' || phase === 'playing-back';

  // ── Render ─────────────────────────────────────────────────────────────────
  const cardClass = `svc-card${inline ? ' svc-card--inline' : ''}`;

  const cardContent = (
    <div className={cardClass}>
      <button
        onClick={handleClose}
        className="svc-close"
        title="Close"
        aria-label="Close"
      >
        ×
      </button>

      {mooshikaImage && !inline && (
        <div
          key={`mooshika-${mooshikaBounceKey}`}
          className={`svc-mooshika ${mooshikaBounceKey > 0 || showRecordingIndicator ? 'svc-mooshika--bounce' : ''}`}
        >
          <img src={mooshikaImage} alt="" />
        </div>
      )}

      <div className="svc-body">
        {/* Big syllable label */}
        <div className="svc-syllable">
          {displayLabel || (syllable || '').toUpperCase()}
        </div>

        {/* Recording indicator (red dot pulse) */}
        {showRecordingIndicator && (
          <div className="svc-recording-indicator">
            <img src={micIcon} alt="" className="svc-mic-icon" />
            <span className="svc-rec-label">Now say it!</span>
          </div>
        )}

        {/* Stop button while recording */}
        {showRecordingIndicator && (
          <div className="svc-actions">
            <button
              className="svc-btn svc-btn--retry"
              onClick={handleStopRecording}
              type="button"
            >
              ⏹ Stop
            </button>
          </div>
        )}

        {/* Action buttons (only after recording is done) */}
        {showActions && (
          <div className="svc-actions svc-actions--primary">
            {!micDenied && recordedUrl && (
              <button
                className="svc-btn svc-btn--mic"
                onClick={handlePlayback}
              >
                {phase === 'playing-back' ? '⏸ Stop' : '▶ Hear myself'}
              </button>
            )}
            <button
              className="svc-btn svc-btn--continue"
              onClick={handleDone}
            >
              ✓ Done
            </button>
          </div>
        )}

      </div>

      {showDoneSparkles && (
        <div className="svc-done-sparkles">
          <SparkleAnimation
            type="magic"
            count={16}
            color="#FFD54F"
            size={10}
            duration={900}
            area="full"
            fadeOut={true}
            onComplete={() => setShowDoneSparkles(false)}
          />
        </div>
      )}
    </div>
  );

  if (inline) return cardContent;

  return (
    <div className="svc-overlay">
      {cardContent}
    </div>
  );
};

export default SyllableVoiceChallenge;
