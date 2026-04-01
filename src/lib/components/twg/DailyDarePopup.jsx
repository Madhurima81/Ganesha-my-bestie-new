import React, { useState, useEffect, useRef } from 'react';
import GaneshaPresence from '../character/GaneshaPresence';
import PrimaryBtn from '../shared/PrimaryBtn';
import { getTodaysDare } from '../../config/dareBank';
import { addModakToJar } from '../coReg/GratitudeJar';
import { useGaneshaVoice, speakDareSequence } from '../../hooks/useGaneshaVoice';
import './DailyDarePopup.css';

// ── Warm responses (no emojis) ──────────────────────────────────────────────
const WARM_RESPONSES = [
  "That warms my heart. Happiness shared is happiness doubled.",
  "You noticed something beautiful — that is a superpower.",
  "A grateful heart is a brave heart. You already have both.",
  "The world is full of little smiles waiting to be noticed. You found one.",
  "That makes me happy too. You are very good at this.",
  "You already made today better just by remembering that.",
  "A smile remembered keeps going. You are spreading it forward.",
  "That is a beautiful thing to carry with you today. I will carry it too.",
  "Even Mooshika heard that and smiled. Good things deserve to be remembered.",
  "I knew you had good things to remember. You always do. Now let us go do more.",
];

// ── Keyword-based response — free, no API needed ────────────────────────────
const getGratitudeResponse = (text) => {
  const t = (text || '').toLowerCase();
  if (t.match(/mama|mom|mother|papa|dad|father|family|brother|sister|nana|dadi|nani|grandma|grandpa/))
    return "Family time — the best kind.";
  if (t.match(/play|game|cricket|football|roblox|minecraft|lego|outside/))
    return "Playing makes the heart happy.";
  if (t.match(/food|eat|dinner|lunch|breakfast|pizza|modak|dosa|chocolate|snack|sweet/))
    return "Good food and good feelings — a perfect combination.";
  if (t.match(/friend|school|class|teacher|classmate/))
    return "Friends make everything brighter.";
  if (t.match(/sleep|rest|dream|nap/))
    return "A good rest is a gift. You woke up ready.";
  if (t.match(/read|book|story|comic/))
    return "A child who loves stories is never alone.";
  if (t.match(/draw|paint|art|colour|color|craft/))
    return "Creating something beautiful — that is a special gift.";
  if (t.match(/music|sing|dance|song/))
    return "Music and joy go together. Always.";
  // fallback — rotate from bank so it never feels stale
  const today = new Date().toISOString().split('T')[0];
  const seed  = today.split('-').reduce((acc, n) => acc + parseInt(n, 10), 0);
  return WARM_RESPONSES[seed % WARM_RESPONSES.length];
};

const CATEGORY_CONFIG = {
  kindness:   { label: 'Kindness Dare' },
  compassion: { label: 'Compassion Dare' },
  gratitude:  { label: 'Gratitude Dare' },
  cultural:   { label: 'Cultural Dare' },
  courage:    { label: 'Courage Dare' },
};

const getGreeting = (name) => {
  const hour = new Date().getHours();
  if (hour >= 5  && hour < 12) return `Good morning, ${name}`;
  if (hour >= 12 && hour < 17) return `Hey there, ${name}`;
  if (hour >= 17 && hour < 21) return `Good evening, ${name}`;
  return `Up late, ${name}?`;
};

export default function DailyDarePopup({ onClose, childNameOverride }) {
  const childName = childNameOverride || localStorage.getItem('gmb_child_name') || 'friend';
  const childAge  = parseInt(localStorage.getItem('gmb_child_age') || '7', 10);
  const dare      = getTodaysDare(childAge);

  const { speak, stop } = useGaneshaVoice();

  const [beat, setBeat]               = useState(1);
  const [micState, setMicState]       = useState('idle');   // idle | listening | done
  const [spokenText, setSpokenText]   = useState('');
  const [showTypeBox, setShowTypeBox] = useState(false);
  const [typedText, setTypedText]     = useState('');

  const recognitionRef = useRef(null);

  const gratitudeText = spokenText || typedText;
  const warmResponse  = getGratitudeResponse(gratitudeText);
  const categoryInfo  = CATEGORY_CONFIG[dare?.category] || { label: "Today's Dare" };
  const dareText      = dare?.text || "Do one kind thing for someone today — and don't tell them it was you.";

  // Cleanup only — no auto-speak on mount (blocked by browser autoplay policy)
  useEffect(() => {
    return () => stop();
  }, []);

  // ── Mic ─────────────────────────────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setShowTypeBox(true);
      return;
    }

    // Tap = user gesture → browser allows audio now
    // Ganesha speaks the prompt, then mic starts after he finishes
    speak(
      `${getGreeting(childName)}. Before today's adventure — what made you smile yesterday?`,
      {
        age: childAge,
        moment: 'greeting',
        onEnd: () => startRecognition(),
      }
    );
  };

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang            = 'en-US';
    recognition.interimResults  = true;
    recognition.maxAlternatives = 1;
    recognition.continuous      = true; // keep listening through pauses
    recognitionRef.current = recognition;

    recognition.onstart  = () => setMicState('listening');
    recognition.onresult = (e) => {
      // Accumulate all results so far
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join(' ');
      setSpokenText(transcript);
    };
    // Don't auto-stop on silence — child taps Done when ready
    recognition.onend = () => {
      // Only fires if browser force-stops (e.g. timeout) — treat as done
      if (micState === 'listening') setMicState('done');
    };
    recognition.onerror = (e) => {
      if (e.error === 'no-speech') return; // ignore silence gaps, keep mic open
      setMicState('idle');
      setShowTypeBox(true);
    };
    recognition.start();
  };

  // Child taps Done — stops recording, moves to done state
  const handleMicDone = () => {
    recognitionRef.current?.stop();
    setMicState('done');
  };

  // ── Beat handlers ────────────────────────────────────────────────────────────
  const handleNextBeat = () => {
    const trimmed = gratitudeText.trim();
    if (trimmed) {
      localStorage.setItem('gmb_gratitude_today', trimmed);
      addModakToJar(trimmed); // adds to jar + fires gmb_jar_updated event
    }
    setBeat(2);
    // Ganesha responds to gratitude then reads the dare
    speakDareSequence(speak, warmResponse, dareText, childAge);
  };

  const handleAcceptDare = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('gmb_last_dare_date', today);
    if (dare) {
      localStorage.setItem('gmb_today_dare_id', dare.id);
      localStorage.setItem('gmb_today_dare_category', dare.category);
    }
    onClose();
  };

  const handleRemindLater = () => {
    localStorage.setItem('gmb_last_dare_date', new Date().toISOString().split('T')[0]);
    onClose();
  };

  return (
    <div className="dare-root" role="dialog" aria-modal="true">

      {/* Top peek */}
      <div className="dare-topbar">
        Welcome back, {childName}
      </div>

      <div className="dare-body">

        {/* Left: Ganesha — wrapper controls size, not GaneshaPresence */}
        <div className="dare-ganesha-col">
          <div style={{
            width: 'min(460px, 38vw)',
            filter: 'drop-shadow(0 12px 32px rgba(40,20,80,0.35))',
            transform: 'scaleX(-1)',
          }}>
            <GaneshaPresence
              pose={beat === 1 ? 'blessing' : 'pointing'}
              expression={beat === 1 ? 'encouraging' : 'excited'}
              size={460}
              breathing="gentle"
              blink
            />
          </div>
        </div>

        {/* Right: content panel */}
        <div className="dare-panel">

          {/* ── Beat 1: Gratitude check-in ── */}
          {beat === 1 && (
            <>
              <h1 className="dare-title">{getGreeting(childName)}</h1>

              <p className="dare-subtitle">
                Before today's adventure —<br />
                what made you smile yesterday?
              </p>

              {/* Voice-first input */}
              {!showTypeBox && (
                <div className="dare-voice-area">

                  {/* Mic button */}
                  <button
                    className={`dare-mic-btn ${micState === 'listening' ? 'dare-mic-btn--listening' : ''} ${micState === 'done' ? 'dare-mic-btn--done' : ''}`}
                    onClick={micState === 'idle' || micState === 'done' ? startListening : undefined}
                    aria-label="Tap to speak"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="dare-mic-icon">
                      <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor"/>
                      <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <line x1="9" y1="22" x2="15" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    {micState === 'listening' && <span className="dare-mic-ring" />}
                  </button>

                  {/* State label */}
                  <p className="dare-mic-label">
                    {micState === 'idle'      && 'Tap to tell Ganesha'}
                    {micState === 'listening' && 'Take your time...'}
                    {micState === 'done'      && 'Got it!'}
                  </p>

                  {/* Live transcript */}
                  {spokenText && (
                    <p className="dare-transcript">{spokenText}</p>
                  )}

                  {/* Done button — only visible while listening */}
                  {micState === 'listening' && (
                    <button className="dare-mic-done-btn" onClick={handleMicDone}>
                      Done
                    </button>
                  )}

                  {/* Type option — secondary */}
                  {micState !== 'listening' && (
                    <button
                      className="dare-type-toggle"
                      onClick={() => setShowTypeBox(true)}
                    >
                      or type instead
                    </button>
                  )}
                </div>
              )}

              {/* Type fallback */}
              {showTypeBox && (
                <div className="dare-voice-area">
                  <textarea
                    className="dare-textarea"
                    value={typedText}
                    onChange={e => setTypedText(e.target.value)}
                    placeholder="Tell me..."
                    maxLength={300}
                    autoFocus
                  />
                  <button
                    className="dare-type-toggle"
                    onClick={() => { setShowTypeBox(false); setTypedText(''); }}
                  >
                    use voice instead
                  </button>
                </div>
              )}

              <div className="dare-btn-next">
                <PrimaryBtn
                  label="Next"
                  onClick={handleNextBeat}
                  size="md"
                  fullWidth
                />
              </div>
            </>
          )}

          {/* ── Beat 2: Dare reveal ── */}
          {beat === 2 && (
            <>
              <div className="dare-badge">
                <span className="dare-badge-label">{categoryInfo.label}</span>
              </div>

              <p className="dare-text">{dareText}</p>

              <div className="dare-btn-actions">
                <PrimaryBtn
                  label="I'll do it"
                  onClick={handleAcceptDare}
                  size="md"
                  fullWidth
                />
                <button className="dare-btn-secondary" onClick={handleRemindLater}>
                  Remind me later
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
