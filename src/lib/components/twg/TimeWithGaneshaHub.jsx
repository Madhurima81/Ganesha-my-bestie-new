import React, { useState, useEffect, useRef } from 'react';
import GaneshaPresence from '../character/GaneshaPresence';
import HomeButton from '../ui/HomeButton/HomeButton';
import TalkToGanesha from './TalkToGanesha';
import ShlokaCoach from './ShlokaCoach';
import DareView from './DareView';
import CoRegToolkit from '../coReg/CoRegToolkit';
import './TimeWithGaneshaHub.css';

const TOMORROW_HOOKS = [
  "Tomorrow, try telling someone one thing you love about them.",
  "Tomorrow, notice one beautiful thing you usually walk past.",
  "Tomorrow, help someone before they even have to ask.",
  "Tomorrow, take three slow breaths before you get out of bed.",
  "Tomorrow, write down one thing you're grateful for first thing.",
  "Tomorrow, smile at someone who looks like they need it.",
  "Tomorrow, try doing one thing you've been putting off.",
  "Tomorrow, notice how many times you laugh.",
  "Tomorrow, do one kind thing — and tell nobody.",
  "Tomorrow, tell Ganesha what made today hard. He's always listening.",
];

const getTomorrowHook = () => {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((a, n) => a + parseInt(n, 10), 0);
  return TOMORROW_HOOKS[seed % TOMORROW_HOOKS.length];
};

const MODES = [
  { id: 'talk',   emoji: '🗣️',  label: 'Talk to Me' },
  { id: 'story',  emoji: '📖',  label: 'Story Time' },
  { id: 'shloka', emoji: '🕉️',  label: 'Practice Shloka' },
  { id: 'dare',   emoji: '🎯',  label: 'Daily Dare' },
  { id: 'just',   emoji: '🌟',  label: 'Just Do Something' },
];

// windDownLevel thresholds in seconds
const WIND_DOWN_SECONDS = { 1: 240, 2: 270, 3: 300 }; // 4 min, 4.5 min, 5 min

export default function TimeWithGaneshaHub({ onNavigate }) {
  const childName = localStorage.getItem('gmb_child_name') || 'friend';
  const childAge  = parseInt(localStorage.getItem('gmb_child_age') || '7', 10);

  const [activeMode, setActiveMode]       = useState(null);
  const [windDownLevel, setWindDownLevel] = useState(0);
  const [sessionLog, setSessionLog]       = useState('');

  const startRef   = useRef(Date.now());
  const timerRef   = useRef(null);
  const spokenRef  = useRef({ 1: false, 2: false });

  const greeting = childAge <= 8
    ? `Hi ${childName}! 🐘 Ready to spend time with me?`
    : `Hey ${childName}. Good to see you. What's on your mind today?`;

  // Invisible 5-minute wind-down timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);

      if (elapsed >= WIND_DOWN_SECONDS[3]) {
        setWindDownLevel(3);
        setActiveMode(null);
        clearInterval(timerRef.current);
        return;
      }
      if (elapsed >= WIND_DOWN_SECONDS[2] && !spokenRef.current[2]) {
        spokenRef.current[2] = true;
        setWindDownLevel(2);
        // "one more minute" spoken by TalkToGanesha via windDownLevel prop
      } else if (elapsed >= WIND_DOWN_SECONDS[1] && !spokenRef.current[1]) {
        spokenRef.current[1] = true;
        setWindDownLevel(1);
      }
    }, 5000);

    return () => clearInterval(timerRef.current);
  }, []);

  const handleModeSelect = (modeId) => {
    setActiveMode(modeId);
  };

  // ── WarmClosingScreen ─────────────────────────────────────────────
  if (windDownLevel >= 3) {
    return (
      <div className="twg-closing">
        <GaneshaPresence
          pose="blessing"
          expression="happy"
          size={200}
          breathing="gentle"
          blink
          style={{ marginBottom: 24 }}
        />
        <h2 className="twg-closing__title">See you tomorrow, {childName} 🐘</h2>
        {sessionLog && (
          <p className="twg-closing__log">We talked about: {sessionLog}</p>
        )}
        <p className="twg-closing__hook">{getTomorrowHook()}</p>
        <button className="twg-closing__parent-btn" onClick={() => {}}>
          Ask a parent for more time 🔒
        </button>
        <button
          className="twg-closing__map-btn"
          onClick={() => onNavigate?.('map')}
        >
          Back to Map
        </button>
      </div>
    );
  }

  // ── Main Hub ──────────────────────────────────────────────────────
  return (
    <div className="twg-screen">
      <HomeButton onNavigate={onNavigate} />

      {/* Header */}
      <div className="twg-header">
        {greeting}
        <span className="twg-sub">How do you want to spend time with me today?</span>
      </div>

      {/* Ganesha glow + character — bottom left */}
      <div className="twg-ganesha-glow" />
      <div className="twg-ganesha">
        <GaneshaPresence pose="blessing" expression="happy" size={320} breathing="gentle" blink />
      </div>

      {/* Activity arc — 5 badges */}
      <div className="twg-arc">
        <button className="twg-badge badge-talk"   onClick={() => handleModeSelect('talk')}>
          <span className="twg-badge-emoji">🗣️</span>
          <span className="twg-badge-label">Talk to Me</span>
        </button>
        <button className="twg-badge badge-story"  onClick={() => handleModeSelect('story')}>
          <span className="twg-badge-emoji">📖</span>
          <span className="twg-badge-label">Story Time</span>
        </button>
        <button className="twg-badge badge-shloka" onClick={() => handleModeSelect('shloka')}>
          <span className="twg-badge-emoji">🕉️</span>
          <span className="twg-badge-label">Shloka</span>
        </button>
        <button className="twg-badge badge-dare"   onClick={() => handleModeSelect('dare')}>
          <span className="twg-badge-emoji">🎯</span>
          <span className="twg-badge-label">Daily Dare</span>
        </button>
        <button className="twg-badge badge-fun"    onClick={() => handleModeSelect('just')}>
          <span className="twg-badge-emoji">🌟</span>
          <span className="twg-badge-label">Just Do Something</span>
        </button>
      </div>

      {/* Prompt bubble */}
      <div className="twg-prompt">
        What would you like to do today, {childName}?
      </div>

      {/* Platform + mic — tap to Talk to Ganesha */}
      <div className="twg-platform" />
      <button className="twg-mic" onClick={() => handleModeSelect('talk')} aria-label="Talk to Ganesha">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor"/>
          <path d="M5 10a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="9"  y1="22" x2="15" y2="22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      {/* TalkToGanesha modal overlay */}
      {activeMode === 'talk' && (
        <TalkToGanesha
          childName={childName}
          childAge={childAge}
          windDownLevel={windDownLevel}
          onClose={() => setActiveMode(null)}
          onSessionNote={(note) => setSessionLog(note)}
        />
      )}

      {/* ShlokaCoach modal overlay */}
      {activeMode === 'shloka' && (
        <ShlokaCoach
          shlokaId="vakratunda-mahakaya"
          childName={childName}
          childAge={childAge}
          onComplete={() => setActiveMode(null)}
          onClose={() => setActiveMode(null)}
        />
      )}

      {/* Just Do Something — CoReg Toolkit full screen */}
      {activeMode === 'just' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
        }}>
          <CoRegToolkit
            zone="Yellow"
            childName={childName}
            childAge={childAge}
            feeling="universal"
            onComplete={() => setActiveMode(null)}
            onClose={() => setActiveMode(null)}
          />
        </div>
      )}

      {/* Daily Dare modal overlay */}
      {activeMode === 'dare' && (
        <DareView
          childName={childName}
          childAge={childAge}
          onClose={() => setActiveMode(null)}
        />
      )}

      {/* Coming-soon overlay for other unbuilt modes */}
      {activeMode && activeMode !== 'talk' && activeMode !== 'shloka' && activeMode !== 'just' && activeMode !== 'dare' && (
        <div className="twg-coming-soon" onClick={() => setActiveMode(null)}>
          <div className="twg-coming-soon__card" onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: 52 }}>
              {MODES.find(m => m.id === activeMode)?.emoji}
            </span>
            <h3 className="twg-coming-soon__title">
              {MODES.find(m => m.id === activeMode)?.label}
            </h3>
            <p className="twg-coming-soon__body">
              This is being built — check back soon!
            </p>
            <button
              className="twg-coming-soon__close"
              onClick={() => setActiveMode(null)}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

