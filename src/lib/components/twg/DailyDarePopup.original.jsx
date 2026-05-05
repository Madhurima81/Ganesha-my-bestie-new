import React, { useState, useEffect, useRef } from 'react';
import GaneshaPresence from '../character/GaneshaPresence';
import PrimaryBtn from '../shared/PrimaryBtn';
import { getTodaysDare } from '../../config/dareBank';
import { addModakToJar } from '../coReg/GratitudeJar';
import { useGaneshaVoice } from '../../hooks/useGaneshaVoice';
import './DailyDarePopup.css';

// ── Warm responses (no emojis) ──────────────────────────────────────────────
const WARM_RESPONSES = [
  "That warms my heart. Happiness shared is happiness doubled.",
  "You noticed something beautiful - that is a superpower.",
  "A grateful heart is a brave heart. You already have both.",
  "The world is full of little smiles waiting to be noticed. You found one.",
  "That makes me happy too. You are very good at this.",
  "You already made today better just by remembering that.",
  "A smile remembered keeps going. You are spreading it forward.",
  "That is a beautiful thing to carry with you today. I will carry it too.",
  "Even Mooshika heard that and smiled. Good things deserve to be remembered.",
  "I knew you had good things to remember. You always do. Now let us go do more.",
];

// ── Keyword-based response - free, no API needed ────────────────────────────
const getGratitudeResponse = (text) => {
  const t = (text || '').toLowerCase();
  if (t.match(/mama|mom|mother|papa|dad|father|family|brother|sister|nana|dadi|nani|grandma|grandpa/))
    return "Family time - the best kind.";
  if (t.match(/play|game|cricket|football|roblox|minecraft|lego|outside/))
    return "Playing makes the heart happy.";
  if (t.match(/food|eat|dinner|lunch|breakfast|pizza|modak|dosa|chocolate|snack|sweet/))
    return "Good food and good feelings - a perfect combination.";
  if (t.match(/friend|school|class|teacher|classmate/))
    return "Friends make everything brighter.";
  if (t.match(/sleep|rest|dream|nap/))
    return "A good rest is a gift. You woke up ready.";
  if (t.match(/read|book|story|comic/))
    return "A child who loves stories is never alone.";
  if (t.match(/draw|paint|art|colour|color|craft/))
    return "Creating something beautiful - that is a special gift.";
  if (t.match(/music|sing|dance|song/))
    return "Music and joy go together. Always.";
  // fallback - rotate from bank so it never feels stale
  const today = new Date().toISOString().split('T')[0];
  const seed  = today.split('-').reduce((acc, n) => acc + parseInt(n, 10), 0);
  return WARM_RESPONSES[seed % WARM_RESPONSES.length];
};

// ── Category labels (warmer, no "Dare") ─────────────────────────────────────
const CATEGORY_CONFIG = {
  kindness:   { label: "Today's Kindness" },
  compassion: { label: "Today's Heart" },
  gratitude:  { label: "Today's Thank You" },
  cultural:   { label: "Today's Tradition" },
  courage:    { label: "Today's Brave Step" },
};

// ── Celebration lines (rotated randomly) ────────────────────────────────────
// Spoken aloud after "I'll do it!" - kept name-free so TTS never mispronounces
// Indian names. The visible "Yay, Arjun!" headline still personalises the moment.
const CELEBRATION_LINES = [
  "Yay! I knew you'd say yes!",
  "You have such a kind heart!",
  "That makes me so happy!",
  "I'm so proud of you!",
  "High five! Let's make today amazing!",
  "You're my favourite human!",
];

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

  const [beat, setBeat]                 = useState(1);
  const [micState, setMicState]         = useState('idle');   // idle | listening | done
  const [spokenText, setSpokenText]     = useState('');
  const [showTypeBox, setShowTypeBox]   = useState(false);
  const [typedText, setTypedText]       = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const recognitionRef = useRef(null);
  const delayedRecognitionRef = useRef(null);
  const dareSequenceRef = useRef(null);
  const closeTimerRef = useRef(null);

  const gratitudeText = spokenText || typedText;
  const warmResponse  = getGratitudeResponse(gratitudeText);
  const categoryInfo  = CATEGORY_CONFIG[dare?.category] || { label: "Today's Mission" };
  const dareText      = dare?.text || "Do one kind thing for someone today.";

  // Has the child given any gratitude input yet?
  const hasGratitudeInput = !!gratitudeText.trim() || micState === 'done';

  // Age-adaptive prompt
  const subtitleText = childAge <= 7
    ? "What made you smile yesterday?"
    : "Before today's adventure - what made you smile yesterday?";

  const stopAllDareVoice = () => {
    recognitionRef.current?.stop?.();
    if (delayedRecognitionRef.current) {
      clearTimeout(delayedRecognitionRef.current);
      delayedRecognitionRef.current = null;
    }
    if (dareSequenceRef.current) {
      clearTimeout(dareSequenceRef.current);
      dareSequenceRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    stop();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Cleanup only - no auto-speak on mount (blocked by browser autoplay policy)
  useEffect(() => {
    return () => stopAllDareVoice();
  }, []);

  // ── Mic ─────────────────────────────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setShowTypeBox(true);
      return;
    }

    // Tap = user gesture - browser allows audio now
    // Ganesha speaks the prompt, then mic starts after he finishes
    // NOTE: We deliberately do NOT include the child's name in the spoken prompt.
    // Web Speech API mispronounces Indian names ("Arjun" -> "are-jun"), which
    // breaks the bestie bond. Visual UI keeps the name; voice stays universal.
    const promptText = childAge <= 7
      ? "Hey there! What made you smile yesterday?"
      : "Hey there! Before today's adventure - what made you smile yesterday?";

    speak(promptText, {
      age: childAge,
      moment: 'greeting',
      onEnd: () => startRecognition(),
    });
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
    // Don't auto-stop on silence - child taps Done when ready
    recognition.onend = () => {
      // Only fires if browser force-stops (e.g. timeout) - treat as done
      if (micState === 'listening') setMicState('done');
    };
    recognition.onerror = (e) => {
      if (e.error === 'no-speech') return; // ignore silence gaps, keep mic open
      setMicState('idle');
      setShowTypeBox(true);
    };
    recognition.start();
  };

  // Child taps Done - stops recording, moves to done state
  const handleMicDone = () => {
    recognitionRef.current?.stop();
    setMicState('done');
  };

  // Child taps "Try again" - speech recognition often misses words, especially
  // for Indian-accented English. Clear transcript and restart cleanly.
  const handleTryAgain = () => {
    recognitionRef.current?.stop?.();
    setSpokenText('');
    setMicState('idle');
    // Restart recognition immediately - skip the prompt voice-over
    delayedRecognitionRef.current = setTimeout(() => {
      delayedRecognitionRef.current = null;
      startRecognition();
    }, 200);
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
    stopAllDareVoice();
    speak(warmResponse, {
      age: childAge,
      moment: 'gratitude',
      onEnd: () => {
        dareSequenceRef.current = setTimeout(() => {
          dareSequenceRef.current = null;
          speak(`Today's dare. ${dareText}`, { age: childAge, moment: 'dare' });
        }, 600);
      },
    });
  };

  // ── "Tell me again" - re-reads the mission aloud ─────────────────────────────
  const handleTellMeAgain = () => {
    stopAllDareVoice();
    speak(dareText, { age: childAge, moment: 'reread' });
  };

  // ── Accept dare → CELEBRATE → close ─────────────────────────────────────────
  const handleAcceptDare = () => {
    stopAllDareVoice();

    // Save commitment
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('gmb_last_dare_date', today);
    if (dare) {
      localStorage.setItem('gmb_today_dare_id', dare.id);
      localStorage.setItem('gmb_today_dare_category', dare.category);
    }

    // Show celebration screen
    setShowCelebration(true);

    // Ganesha celebrates with a random warm line (name-free for TTS safety)
    const celebrationLine = CELEBRATION_LINES[Math.floor(Math.random() * CELEBRATION_LINES.length)];
    speak(celebrationLine, { age: childAge, moment: 'celebration' });

    // Auto-close after 3.5 seconds (enough for voice + sparkle to land)
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      stopAllDareVoice();
      onClose();
    }, 3500);
  };

  return (
    <div className="dare-root" role="dialog" aria-modal="true">

      <div className="dare-body">

        {/* Left: Ganesha - wrapper controls size, not GaneshaPresence */}
        <div className="dare-ganesha-col">
          <div style={{
            width: 'min(460px, 38vw)',
            filter: 'drop-shadow(0 12px 32px rgba(40,20,80,0.35))',
            transform: 'scaleX(-1)',
          }}>
            <GaneshaPresence
              pose={showCelebration ? 'blessing' : (beat === 1 ? 'blessing' : 'pointing')}
              expression={showCelebration ? 'excited' : (beat === 1 ? 'encouraging' : 'excited')}
              size={460}
              breathing="gentle"
              blink
            />
          </div>
        </div>

        {/* Right: content panel */}
        <div className="dare-panel">

          {/* ── CELEBRATION (shown after "I'll do it!") ── */}
          {showCelebration && (
            <div className="dare-celebration">
              <div className="dare-celebration-sparkles">✨ ✨ ✨</div>
              <h2 className="dare-celebration-text">Yay, {childName}!</h2>
              <p className="dare-celebration-sub">Ganesha is so proud of you</p>
            </div>
          )}

          {/* ── Beat 1: Gratitude check-in ── */}
          {!showCelebration && beat === 1 && (
            <>
              <div className="dare-daily-badge">
                ✨ Today's Special Moment
              </div>

              <h1 className="dare-title">{getGreeting(childName)}</h1>

              <p className="dare-subtitle">{subtitleText}</p>

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

                  {/* Done button - only visible while listening */}
                  {micState === 'listening' && (
                    <button className="dare-mic-done-btn" onClick={handleMicDone}>
                      Done
                    </button>
                  )}

                  {/* When mic is done with text - kid can re-record if it heard wrong.
                      Indian-accented English often gets transcribed incorrectly,
                      so we always offer a graceful retry. */}
                  {micState === 'done' && spokenText && (
                    <div className="dare-transcript-actions">
                      <button className="dare-transcript-retry" onClick={handleTryAgain}>
                        Try again
                      </button>
                      <span className="dare-transcript-hint">or tap Next if it looks right</span>
                    </div>
                  )}

                  {/* Type option - secondary */}
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

              {/* "Next" only appears once child has given input */}
              {hasGratitudeInput && (
                <div className="dare-btn-next">
                  <PrimaryBtn
                    label="Next"
                    onClick={handleNextBeat}
                    size="md"
                    fullWidth
                  />
                </div>
              )}
            </>
          )}

          {/* ── Beat 2: Dare reveal ── */}
          {!showCelebration && beat === 2 && (
            <>
              <div className="dare-badge">
                <span className="dare-badge-label">{categoryInfo.label}</span>
              </div>

              <p className="dare-text">{dareText}</p>

              <div className="dare-btn-actions">
                <PrimaryBtn
                  label="I'll do it!"
                  onClick={handleAcceptDare}
                  size="md"
                  fullWidth
                />
                <button className="dare-btn-secondary" onClick={handleTellMeAgain}>
                  Tell me again
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
