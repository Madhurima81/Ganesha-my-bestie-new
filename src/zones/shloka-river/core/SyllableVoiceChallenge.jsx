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

const SYLLABLE_AUDIO_DELAY_MS = 300;   // brief pause after card opens before audio plays
const POST_AUDIO_RECORD_DELAY_MS = 120; // brief pause after audio ends before mic opens

const SyllableVoiceChallenge = ({
  syllable,                       // e.g. 'va'
  displayLabel,                   // e.g. 'VA' (shown big to the kid)
  onComplete,                     // () => void — resumes the game
  mooshikaImage,                  // path to mooshika-coach.png
  replayAudio,                    // () => void — replays the syllable/word audio
  stopAudio,                      // () => void — stops all game audio before mic opens
  inline = false,
  simpleMode = false,
  autoContinueOnSuccessMs = 0,
  playCount = 2,
}) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('listening-audio'); // listening-audio | recording | done-recording | playing-back
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [micDenied, setMicDenied] = useState(false);
  const [showDoneSparkles, setShowDoneSparkles] = useState(false);
  const [donePressed, setDonePressed] = useState(false);
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
      // Soft beep — universal "your turn" cue
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch {}
      // No auto-stop — kid taps "Tap to stop" when ready
    } catch (err) {
      // Mic denied or unavailable — show fallback (just a Done button, no recording)
      console.warn('[SVC] Mic access denied or unavailable:', err?.name);
      if (mountedRef.current) {
        setMicDenied(true);
        setPhase('done-recording');
      }
    }
  }, [cleanupStream]);

  // ── Initial flow: play syllable audio based on playCount → start recording ──────────────
  useEffect(() => {
    mountedRef.current = true;

    const GAP_BETWEEN_PLAYS_MS = 400;

    const openMic = () => {
      if (!mountedRef.current) return;
      stopAudio?.();
      setTimeout(() => {
        if (mountedRef.current) startRecording();
      }, POST_AUDIO_RECORD_DELAY_MS);
    };

    const playOnce = (onDone) => {
      if (replayAudio) {
        replayAudio((onEnded) => {
          if (!mountedRef.current) return;
          onDone?.();
        });
      } else {
        // No audio to play (e.g. lotus phase — audio already played) — go straight to mic
        onDone?.();
      }
    };

    const startPlayback = () => {
      if (!mountedRef.current) return;
      playOnce(() => {
        if (!mountedRef.current) return;
        setMooshikaBounceKey(k => k + 1);

        if (playCount >= 2) {
          // Play 2 then mic
          audioStartTimerRef.current = setTimeout(() => {
            if (!mountedRef.current) return;
            playOnce(openMic);
            setMooshikaBounceKey(k => k + 1);
          }, GAP_BETWEEN_PLAYS_MS);
        } else {
          // Play 1 only then mic
          openMic();
        }
      });
    };

    // Play 1
    audioStartTimerRef.current = setTimeout(startPlayback, SYLLABLE_AUDIO_DELAY_MS);

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
  }, [playCount, cleanupTimers, cleanupStream, cleanupPlayback, startRecording, stopAudio]);

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
    setDonePressed(true);
    setShowDoneSparkles(true);
    setTimeout(() => {
      onComplete?.();
    }, 700);
  }, [onComplete]);

  // ── Close (X) ──────────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    cleanupTimers();
    stopAudio?.();
    cleanupPlayback();
    onComplete?.();
  }, [onComplete, cleanupTimers, cleanupPlayback, stopAudio]);

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
          <>
            <div className="svc-recording-indicator">
              <img src={micIcon} alt="" className="svc-mic-icon" />
              <span className="svc-rec-label">Now say it!</span>
            </div>
            <div className="svc-listening-waves">
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <span key={i} className="svc-listening-bar" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </>
        )}

        {/* Record button while recording */}
        {showRecordingIndicator && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              className="record-btn recording"
              onClick={handleStopRecording}
              type="button"
              title="Stop recording"
              aria-label="Stop recording"
            >
              <span className="record-icon"></span>
            </button>
            <div className="record-label">Tap to stop</div>
          </div>
        )}

        {/* Action buttons (only after recording is done) */}
        {showActions && (
          <div className="svc-actions svc-actions--primary">
            {!micDenied && recordedUrl && (
              phase === 'playing-back' ? (
                <button
                  className="svc-stop-circle"
                  onClick={handlePlayback}
                  type="button"
                  title="Stop playback"
                  aria-label="Stop playback"
                >
                  <span className="svc-stop-square" />
                </button>
              ) : (
                <button
                  className="svc-btn svc-btn--mic"
                  onClick={handlePlayback}
                >
                  Hear myself
                </button>
              )
            )}
            <button
              className={`svc-btn svc-btn--continue${donePressed ? ' svc-btn--pressed' : ''}`}
              onClick={handleDone}
            >
              Done
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
