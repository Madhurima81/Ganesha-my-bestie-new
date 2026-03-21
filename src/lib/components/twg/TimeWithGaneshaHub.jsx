import React, { useState, useEffect, useRef } from 'react';
import GaneshaPresence from '../character/GaneshaPresence';
import HomeButton from '../ui/HomeButton/HomeButton';
import TalkToGanesha from './TalkToGanesha';
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
    <div className="twg-hub">
      <HomeButton onNavigate={onNavigate} />

      <h1 className="twg-hub__greeting">{greeting}</h1>
      <p className="twg-hub__sub">How do you want to spend time with me today?</p>

      {/* Central Ganesha */}
      <div className="twg-hub__ganesha">
        <GaneshaPresence
          pose="blessing"
          expression="happy"
          size={280}
          breathing="gentle"
          blink
        />
      </div>

      {/* 5 Mode Tiles */}
      <div className="twg-hub__tiles">
        {MODES.map(mode => (
          <button
            key={mode.id}
            className="twg-hub__tile"
            onClick={() => handleModeSelect(mode.id)}
          >
            <span className="twg-hub__tile-emoji">{mode.emoji}</span>
            <span className="twg-hub__tile-label">{mode.label}</span>
          </button>
        ))}
      </div>

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

      {/* Coming-soon overlay for Session 4–6 modes */}
      {activeMode && activeMode !== 'talk' && (
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
