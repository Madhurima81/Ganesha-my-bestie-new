import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getTodaysDare } from '../../config/dareBank';
import { getTodaysGratitude } from '../../config/gratitudeBank';
import { DAILY_DARE_CONTENT } from '../../config/content/dailyDareContent';
import { useGaneshaVoice } from '../../hooks/useGaneshaVoice';
import micIcon from '../../../zones/shloka-river/core/assets/images/mic-icon.png';
import './DailyDarePopup.css';

export default function DailyDarePopup({ onClose }) {
  const { speak, stop } = useGaneshaVoice();
  const childAge = parseInt(localStorage.getItem('gmb_child_age') || '7', 10);
  const dare = getTodaysDare(childAge);
  const gratitude = useMemo(() => getTodaysGratitude(childAge), [childAge]);

  const [phase, setPhase] = useState('gratitude');
  const [transcript, setTranscript] = useState('');
  const [micState, setMicState] = useState('idle'); // idle | listening
  const [hasRecording, setHasRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [celebration, setCelebration] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const recognitionRef = useRef(null);
  const shouldKeepListeningRef = useRef(false);
  const liveTranscriptRef = useRef('');
  const fadeTimerRef = useRef(null);
  const closeTimerRef = useRef(null);

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    shouldKeepListeningRef.current = true;
    liveTranscriptRef.current = '';
    setTranscript('');
    setHasRecording(false);
    setMicState('listening');

    recognition.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(' ');
      liveTranscriptRef.current = text;
      setTranscript(text);
    };

    recognition.onend = () => {
      if (shouldKeepListeningRef.current) {
        try {
          recognition.start();
          return;
        } catch (_) {}
      }
      setMicState('idle');
      if (liveTranscriptRef.current.trim()) setHasRecording(true);
    };

    recognition.onerror = () => {
      shouldKeepListeningRef.current = false;
      setMicState('idle');
      if (liveTranscriptRef.current.trim()) setHasRecording(true);
    };

    try {
      recognition.start();
    } catch (_) {
      setMicState('idle');
    }
  };

  const stopRecognition = () => {
    shouldKeepListeningRef.current = false;
    try {
      recognitionRef.current?.stop?.();
    } catch (_) {}
  };

  const reRecord = () => {
    stopRecognition();
    setTranscript('');
    setHasRecording(false);
    liveTranscriptRef.current = '';
    setTimeout(startRecognition, 150);
  };

  const handleGratitudeDone = () => {
    if (!transcript.trim()) return;
    stopRecognition();
    localStorage.setItem('gmb_gratitude_today', transcript.trim());
    setPhase('kindness');
  };

  const handleTry = () => {
    setCelebration(true);

    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('gmb_last_dare_date', today);
    if (dare) {
      localStorage.setItem('gmb_today_dare_category', dare.category);
      localStorage.setItem('gmb_today_dare_id', dare.id);
    }

    // Let child see the "Yay!" state before fade/close begins.
    fadeTimerRef.current = setTimeout(() => {
      fadeTimerRef.current = null;
      setIsClosing(true);
    }, 700);

    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 1800);
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const voKey = `gmb_daily_prompt_vo_${today}`;
    if (!localStorage.getItem(voKey)) {
      speak(gratitude.text);
      localStorage.setItem(voKey, '1');
    }

    return () => {
      shouldKeepListeningRef.current = false;
      try {
        recognitionRef.current?.stop?.();
      } catch (_) {}
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      stop();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [gratitude.text, speak, stop]);

  return (
    <div className="dare-root dare-root--map" role="dialog" aria-modal="true">
      <div className={`dare-panel ${isClosing ? 'dare-panel--closing' : ''}`}>
        <button
          className="dare-close"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close"
          type="button"
        >
          ✕
        </button>

        {phase === 'gratitude' && (
          <>
            <h2 className="dare-title">{gratitude.text}</h2>

            <div className="dare-voice-area">
              {!hasRecording && (
                <button
                  className={`dare-mic-btn ${micState === 'listening' ? 'recording-mic' : ''}`}
                  onClick={micState === 'listening' ? stopRecognition : startRecognition}
                  aria-label={micState === 'listening' ? 'Stop recording' : 'Start recording'}
                  type="button"
                >
                  {micState === 'listening' ? (
                    <span className="dare-pause-icon" aria-hidden="true">
                      <span />
                      <span />
                    </span>
                  ) : (
                    <img src={micIcon} alt="" className="dare-mic-icon-img" />
                  )}
                </button>
              )}

              <span className="dare-helper-text">
                {micState === 'listening'
                  ? "I'm listening..."
                  : hasRecording
                  ? 'You can edit, re-record, or tap Done'
                  : speechSupported
                  ? 'Tap mic to speak'
                  : 'Type your answer below'}
              </span>
              {micState === 'listening' && <span className="dare-pause-hint">Tap to pause</span>}

              {(transcript || hasRecording || !speechSupported || micState === 'listening') && (
                <textarea
                  className={`dare-transcript ${micState === 'listening' ? 'recording' : ''}`}
                  value={transcript}
                  onChange={(e) => {
                    setTranscript(e.target.value);
                    if (e.target.value.trim()) setHasRecording(true);
                  }}
                  placeholder={DAILY_DARE_CONTENT.gratitude.typePlaceholder}
                  maxLength={140}
                  rows={2}
                />
              )}

              {hasRecording && (
                <div className="dare-action-row">
                  <button className="dare-secondary-btn" onClick={reRecord} type="button">
                    Re-record
                  </button>
                  <button
                    className="dare-primary-btn"
                    onClick={handleGratitudeDone}
                    disabled={!transcript.trim()}
                    type="button"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {phase === 'kindness' && (
          <>
            <p className="dare-subtitle">Try this today</p>
            <p className="dare-task">{dare.text}</p>

            <button
              className={`dare-primary-btn ${celebration ? 'success' : ''}`}
              onClick={handleTry}
              disabled={celebration}
              type="button"
            >
              {celebration ? DAILY_DARE_CONTENT.kindness.successCta : DAILY_DARE_CONTENT.kindness.cta}
            </button>
            {celebration && (
              <span className="dare-sparkles" aria-hidden="true">
                <span className="dare-sparkle s1">✦</span>
                <span className="dare-sparkle s2">✧</span>
                <span className="dare-sparkle s3">✦</span>
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
