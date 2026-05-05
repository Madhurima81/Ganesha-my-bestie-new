import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGaneshaVoice } from '../../hooks/useGaneshaVoice';
import './DailyDarePopup.css';

export default function DailyDarePopup({ onClose }) {
  const { speak, stop } = useGaneshaVoice();

  const [phase, setPhase] = useState('gratitude');
  const [spokenText, setSpokenText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [celebration, setCelebration] = useState(false);

  const recognitionRef = useRef(null);
  const transitionTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const gratitudeText = useMemo(() => (spokenText || typedText).trim(), [spokenText, typedText]);

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setShowTypeInput(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(' ');
      setSpokenText(transcript);
    };

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') {
        setShowTypeInput(true);
      }
    };

    try {
      recognition.start();
    } catch (_) {}
  };

  const onUserInput = () => {
    if (phase !== 'gratitude' || !gratitudeText || transitionTimerRef.current) return;

    localStorage.setItem('gmb_gratitude_today', gratitudeText);
    speak("That's lovely...");

    transitionTimerRef.current = setTimeout(() => {
      transitionTimerRef.current = null;
      setPhase('kindness');
    }, 1500);
  };

  const handleTry = () => {
    setCelebration(true);

    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('gmb_last_dare_date', today);
    localStorage.setItem('gmb_today_dare_category', 'kindness');
    localStorage.setItem('gmb_today_dare_id', 'fixed-kindness-001');

    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 1500);
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const voKey = `gmb_daily_prompt_vo_${today}`;
    if (!localStorage.getItem(voKey)) {
      speak('What made you smile today?');
      localStorage.setItem(voKey, '1');
    }

    return () => {
      recognitionRef.current?.stop?.();
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      stop();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speak, stop]);

  useEffect(() => {
    onUserInput();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spokenText, typedText]);

  return (
    <div className="dare-root dare-root--map" role="dialog" aria-modal="true">
      <div className="dare-panel">
        <button className="dare-close" onClick={onClose} aria-label="Close">✕</button>

        {phase === 'gratitude' && (
          <>
            <h2 className="dare-title">What made you smile today?</h2>

            <div className="dare-voice-area">
              <button className="dare-mic-btn" onClick={startRecognition} aria-label="Tap to speak">🎤</button>

              <span className="dare-helper-text">Tap to speak</span>
              <button className="dare-type-link" onClick={() => setShowTypeInput(true)}>
                or type
              </button>

              {showTypeInput && (
                <input
                  className="dare-inline-input"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder="Type here..."
                  maxLength={140}
                />
              )}

              {spokenText && <p className="dare-inline-preview">{spokenText}</p>}
            </div>
          </>
        )}

        {phase === 'kindness' && (
          <>
            <h3 className="dare-subtitle">Try this today</h3>
            <p className="dare-task">Help a grown-up with something they are doing.</p>

            <button
              className={`dare-primary-btn ${celebration ? 'success' : ''}`}
              onClick={handleTry}
              disabled={celebration}
            >
              {celebration ? '\uD83D\uDC9B Yay!' : "I'll try"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
