// ParentDashboard.jsx — Parent Calm Guide for Ganesha My Bestie
// Design register: premium, calm, adult — NOT child-facing UI
// Fonts: Baloo 2 (headings) · Nunito (body) — NO EXCEPTIONS

import React, { useState, useEffect } from 'react';
import './ParentDashboard.css';
import CalmOverlay from './CalmOverlay';
import CulturalProgressExtractor from '../../services/CulturalProgressExtractor';
import GameStateManager from '../../services/GameStateManager';

// ─── Symbol content ────────────────────────────────────────────────────────────

const SYMBOL_DATA = {
  mooshika: {
    id: 'mooshika', name: 'Mooshika', emoji: '🐭',
    power: 'One step at a time', growthWord: 'Focus',
    technique: 'Focus Reset',
    image: '/images/symbols-symbolmountain/symbol-mooshika-colored.svg',
    color: '#FF5722', accentBg: '#FFE0D6',
    gentlePhrase: 'You can finish anything you start.',
    momentIcons: ['👁️', '🎯', '✅'],
    moment: [
      'Gently touch their shoulder and make eye contact — no words yet',
      'Say: "Let\'s find just one thing to do right now. Just one."',
      'Count down from 5 together — then start that one thing side by side',
    ],
    resetStory: 'Even Mooshika gets distracted by sparkly things! But when Ganesha needs to go somewhere important, Mooshika focuses — one tiny step at a time. Let\'s find your one step right now.',
    dinnerQuestions: ['What helped you concentrate today?', 'What distracted you — and what did you do about it?'],
    ritual: ['Put hands on tummy, take 3 belly breaths', 'Touch forehead gently — say "I can focus"', 'Whisper together: "Vakratunda Mahakaya"'],
    chant: 'Vakratunda Mahakaya',
    activity: 'Touch your forehead gently and take 3 slow breaths together before homework tonight.',
  },
  modak: {
    id: 'modak', name: 'Modak', emoji: '🍬',
    power: 'Sweetness comes back bigger', growthWord: 'Sharing',
    technique: 'Sweetness Reset',
    image: '/images/symbols-symbolmountain/symbol-modak-colored.svg',
    color: '#FF9933', accentBg: '#FFE9C2',
    gentlePhrase: 'You can make hearts sweeter by sharing.',
    momentIcons: ['👂', '💬', '🍬'],
    moment: [
      'Ask: "What feels unfair right now?" — then just listen, don\'t fix it yet',
      'Say: "I hear you. That does feel hard." — name their feeling out loud',
      'Together, think of one tiny sweet thing you can offer — even a smile counts',
    ],
    resetStory: 'Modak is the sweetest thing because it was made to be shared. When we give a small piece of sweetness — a smile, a turn, a hug — it always comes back bigger. What\'s one sweet thing we can offer right now?',
    dinnerQuestions: ['Did you share something today — a toy, snack, or smile?', 'How did the other person feel when you shared?'],
    ritual: ['Sit together and think of one person you helped today', 'Say together 3 times: "Vakratunda Mahakaya"', 'Ask: "What was the sweetest moment of your day?"'],
    chant: 'Vakratunda Mahakaya',
    activity: 'Share something small with someone at home tonight — a hug counts.',
  },
  belly: {
    id: 'belly', name: 'Big Belly', emoji: '🫅',
    power: 'I can hold my feelings', growthWord: 'Big Feelings',
    technique: 'Belly Breath',
    image: '/images/symbols-symbolmountain/symbol-belly-colored.svg',
    color: '#795548', accentBg: '#EDDED4',
    gentlePhrase: 'You can hold big feelings safely.',
    momentIcons: ['🐵', '🤲', '🌬️'],
    moment: [
      'Sit or crouch to their level — place your hand on your own belly',
      'Say: "I see you\'re feeling something really big right now. That\'s okay."',
      'Breathe together: in for 3, out for 3 — belly rises, belly falls — repeat 3 times',
    ],
    resetStory: 'A storm is moving inside your chest. Ganesha\'s big belly rises and falls like calm waves. Let\'s breathe slowly together… until the storm becomes quiet.',
    dinnerQuestions: ['What big feeling came today?', 'What helped it settle?'],
    ritual: ['Put hands on tummy, take 3 belly breaths', 'Say softly: "I am safe. I can handle this."', 'Whisper gently: "Vakratunda Mahakaya"'],
    chant: 'Vakratunda Mahakaya',
    activity: 'Place hands on your tummy and take 3 deep belly breaths together before bed.',
  },
  lotus: {
    id: 'lotus', name: 'Lotus', emoji: '🪷',
    power: 'Still inside, even when muddy outside', growthWord: 'Calm',
    technique: 'Lotus Breath',
    image: '/images/symbols-symbolmountain/symbol-lotus-colored.png',
    color: '#E91E63', accentBg: '#FDDAEB',
    gentlePhrase: 'You can stay peaceful even when things feel messy.',
    momentIcons: ['🪷', '🌊', '☁️'],
    moment: [
      'Sit cross-legged together — even on the floor, wherever you are',
      'Take 3 slow breaths with no talking — just breathe and let the storm pass',
      'Say quietly: "The lotus never gets muddy, even in muddy water. Neither do you."',
    ],
    resetStory: 'The lotus grows in muddy water, but it never gets muddy itself. Even when everything around you feels messy right now, you can stay clean inside. Take three breaths with me — let the mud settle on its own.',
    dinnerQuestions: ['When was it hard to stay calm today?', 'What could you try next time?'],
    ritual: ['Sit cross-legged like a lotus — back straight', 'Breathe slowly together 5 times, no talking', 'Ask: "What kind thing did you do today?"'],
    chant: 'Vakratunda Mahakaya',
    activity: 'Sit like a lotus together for 2 quiet minutes before homework — just breathe.',
  },
  trunk: {
    id: 'trunk', name: 'Trunk', emoji: '🐘',
    power: 'I choose carefully', growthWord: 'Wise Choices',
    technique: 'Pause & Choose',
    image: '/images/symbols-symbolmountain/symbol-trunk-colored.png',
    color: '#2E7D32', accentBg: '#C8EDD0',
    gentlePhrase: 'You can choose your actions carefully.',
    momentIcons: ['✋', '🔢', '💡'],
    moment: [
      'Pause everything — hold up your hand like a stop sign, breathe once',
      'Count slowly together: 1... 2... 3... no rushing',
      'Ask: "What is the kind thing to do right now?" — wait for their answer',
    ],
    resetStory: 'Ganesha uses his trunk to pick things up so gently — even very heavy things. Heavy feelings can be handled gently too. No rushing, no pushing. Let\'s count to 3 together, then take one gentle step forward.',
    dinnerQuestions: ['What good choice did you make today?', 'Was there a moment you chose kindness over anger?'],
    ritual: ['Sit together. Think of one good choice today.', 'Count 1-2-3 slowly — breathe with each count', 'Say: "Nirvighnam Kurumedeva"'],
    chant: 'Nirvighnam Kurumedeva',
    activity: 'Before any decision tonight, count 1-2-3 together: is this helpful or hurtful?',
  },
  eyes: {
    id: 'eyes', name: 'Eyes', emoji: '✨',
    power: 'I see the good', growthWord: 'Gratitude',
    technique: 'Gratitude Scan',
    image: '/images/symbols-symbolmountain/symbol-eyes-colored.png',
    color: '#0277BD', accentBg: '#C2E8FA',
    gentlePhrase: 'You notice beautiful things others miss.',
    momentIcons: ['👀', '🗣️', '✨'],
    moment: [
      'Gently redirect: "Use your Ganesha eyes — find one beautiful thing you can see right now"',
      'Name it together out loud — take turns',
      'Say: "Good eyes. Beauty was always there — you just found it."',
    ],
    resetStory: 'Ganesha sees everything — even the tiny, beautiful things most people miss. Right now, let\'s use Ganesha\'s eyes together: find one beautiful thing around you. Found it? Good. Beauty is always there, waiting quietly to be noticed.',
    dinnerQuestions: ['What made you smile today?', 'What beautiful thing did you see or feel?'],
    ritual: ['Close your eyes together for a moment', 'Each person names one good thing from today', 'Say together: "Suryakoti Samaprabha"'],
    chant: 'Suryakoti Samaprabha',
    activity: 'Before bed, each name one beautiful thing you noticed today — takes 2 minutes.',
  },
  ear: {
    id: 'ear', name: 'Ears', emoji: '👂',
    power: 'I listen with my whole heart', growthWord: 'Deep Listening',
    technique: 'Full Listen',
    image: '/images/symbols-symbolmountain/symbol-ear-colored.png',
    color: '#6A1B9A', accentBg: '#E4C8F5',
    gentlePhrase: 'You listen with your whole heart.',
    momentIcons: ['📵', '👂', '🙏'],
    moment: [
      'Put your phone face-down — give full eye contact, nothing else',
      'Say: "I\'m listening. Only you. Take your time." — then wait',
      'Don\'t respond immediately — nod, let them finish completely, then say "Thank you for telling me"',
    ],
    resetStory: 'Ganesha has big ears because he listens to everything — even the quietest worries. I\'m going to use my Ganesha ears right now. Tell me everything — I\'m not going anywhere, and I\'m not going to rush you.',
    dinnerQuestions: ['Who listened to you today — how did it feel?', 'How does good listening help your friendships?'],
    ritual: ['Sit in quiet. Listen to all sounds around you for 30 seconds.', 'Take turns sharing one thing — no interrupting', 'Say: "Sarvakaryeshu Sarvada"'],
    chant: 'Sarvakaryeshu Sarvada',
    activity: 'Take turns sharing one thing from today — no phones, just full listening.',
  },
  tusk: {
    id: 'tusk', name: 'Tusk', emoji: '💪',
    power: 'I finish what I start', growthWord: 'Determination',
    technique: 'One Step Forward',
    image: '/images/symbols-symbolmountain/symbol-tusk-colored.png',
    color: '#6D28D9', accentBg: '#D8C8F7',
    gentlePhrase: 'You finish what you start, even when it is hard.',
    momentIcons: ['💬', '🔢', '🤝'],
    moment: [
      'Say: "This is hard. That\'s okay — hard things make us stronger."',
      'Break it into the tiniest possible piece: "Just this one small step. That\'s all."',
      'Do that one step together — then celebrate it, however small',
    ],
    resetStory: 'Ganesha broke his own tusk to keep writing — because finishing what you start really matters. This is hard right now, but you are not done yet. Let\'s take one tiny step forward together — just one — and see how far it takes us.',
    dinnerQuestions: ['What did you finish today that felt hard?', 'How did it feel when you were done?'],
    ritual: ['Think of one thing you each finished today', 'Celebrate together — clap 3 times', 'Say: "Sarvakaryeshu Sarvada"'],
    chant: 'Sarvakaryeshu Sarvada',
    activity: 'Finish one small task together tonight — folding, drawing — all the way to the end.',
  },
};

const SYMBOL_ORDER = ['modak', 'mooshika', 'belly', 'lotus', 'trunk', 'eyes', 'ear', 'tusk'];

const GETTING_STARTED = {
  id: null,
  name: 'Starting Out', emoji: '🐘',
  power: 'Every journey starts here', growthWord: 'Wonder',
  technique: 'First Breath',
  color: '#8E7BD8', accentBg: '#DDD5F7',
  gentlePhrase: 'Every big journey starts with one small step.',
  momentIcons: ['🌬️', '💬', '🤗'],
  moment: [
    'Sit together and take one slow breath — no agenda, just this moment',
    'Ask: "What\'s one thing on your mind right now?" — and really listen',
    'Say: "I\'m so glad I get to figure this out with you."',
  ],
  resetStory: 'Ganesha always begins. Every story, every journey, every big thing — he is the one who starts it. You are starting something wonderful right now. Let\'s take one breath and begin together.',
  dinnerQuestions: ['What is one thing you are really good at?', 'What is one thing you want to get better at?'],
  ritual: ['Sit together quietly before sleep', 'Say together 3 times: "Vakratunda Mahakaya"', 'Ask: "What was the best part of your day?"'],
  chant: 'Vakratunda Mahakaya',
  activity: 'Play Ganesha My Bestie together for 10 minutes and discover your first symbol.',
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ParentDashboard({ onBack }) {
  const [childName,      setChildName]      = useState('');
  const [profileAvatar,  setProfileAvatar]  = useState('monkey');
  const [currentSymbol,  setCurrentSymbol]  = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [discoveredList, setDiscoveredList] = useState([]);
  const [ritualDone,       setRitualDone]       = useState(false);
  const [toast,            setToast]            = useState('');
  const [showStory,        setShowStory]        = useState(false);
  const [showCalmOverlay,  setShowCalmOverlay]  = useState(false);

  useEffect(() => {
    const activeId = localStorage.getItem('activeProfileId');

    const stored = localStorage.getItem('childName') || '';
    if (stored) {
      setChildName(stored);
    } else if (activeId) {
      try {
        const p = GameStateManager.getProfiles()?.profiles?.[activeId];
        if (p?.name) setChildName(p.name);
      } catch (_) {}
    }

    if (activeId) {
      try {
        const p    = GameStateManager.getProfiles()?.profiles?.[activeId];
        const map  = { '🐵':'monkey','🦚':'peacock','🐿️':'squirrel','🐯':'tiger' };
        const list = ['monkey','peacock','squirrel','tiger'];
        if (p?.avatar) setProfileAvatar(list.includes(p.avatar) ? p.avatar : (map[p.avatar] || 'monkey'));
      } catch (_) {}
    }

    try {
      const data       = CulturalProgressExtractor.getCulturalProgressData();
      const discovered = (data.discoveredSymbols || []).map(s => (s.name || s.id || '').toLowerCase());
      const orderedKeys = SYMBOL_ORDER.filter(key =>
        discovered.some(d => d.includes(key) || key.includes(d))
      );
      setDiscoveredList(orderedKeys);
      const latestKey = orderedKeys[orderedKeys.length - 1];
      setCurrentSymbol(latestKey ? SYMBOL_DATA[latestKey] : null);
    } catch (_) {
      setCurrentSymbol(null);
      setDiscoveredList([]);
    }

    const rKey = `parent_ritual_done_${new Date().toDateString()}`;
    setRitualDone(localStorage.getItem(rKey) === 'true');
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3200); };

  const handleRitualDone = () => {
    localStorage.setItem(`parent_ritual_done_${new Date().toDateString()}`, 'true');
    setRitualDone(true);
  };
  const handlePdf  = () => showToast('Practice sheets coming very soon.');

  // Calm overlay handlers
  const handleBeginTogether    = () => setShowCalmOverlay(true);
  const handleCalmOverlayClose = () => setShowCalmOverlay(false);
  const handleCalmOverlayDone  = () => {
    setShowCalmOverlay(false);
    showToast('You helped your child reset. 🌟');
  };

  const handleChipTap = (key) => {
    const s = SYMBOL_DATA[key];
    setSelectedSymbol(sym.id === s?.id ? null : s);
    setShowStory(false);
  };

  const sym  = selectedSymbol || currentSymbol || GETTING_STARTED;
  const name = childName || 'Your child';

  return (
    <div className="pd-root">
      <div className="pd-bg-overlay" />

      {/* ── Scrollable content area ─────────────────────────────────── */}
      <div className="pd-scroll">

        {/* ══ GLASS CARD — single unified container ════════════════════ */}
        <div className="pd-guidance-card">

          {/* ── Back button ──────────────────────────────────────────── */}
          <button className="pd-back-btn" onClick={onBack} aria-label="Back">←</button>

          {/* ══ HEADER ═══════════════════════════════════════════════════ */}
          <header className="pd-header">
            <p className="pd-header-label">Parent Guidance</p>
            <h1 className="pd-header-title">Using the "{sym.growthWord}" Symbol</h1>
            <p className="pd-header-sub">Simple ways to support {name} during the day</p>
          </header>

          {/* ══ SYMBOL STRIP ═════════════════════════════════════════════ */}
          <section className="pd-symbol-strip">
            <div className="pd-strip-top">
              <p className="pd-strip-heading">Symbols {name} Has Learned</p>
              <p className="pd-strip-count">{discoveredList.length} of 8</p>
            </div>

            <div className="pd-symbols-row">
              {discoveredList.length === 0 ? (
                <p className="pd-strip-empty">
                  Start exploring to unlock symbol guides.
                </p>
              ) : (
                SYMBOL_ORDER
                  .filter(key => discoveredList.includes(key))
                  .map(key => {
                    const s = SYMBOL_DATA[key];
                    const isActive = sym.id === s?.id;
                    return (
                      <button
                        key={key}
                        className={`pd-symbol-chip${isActive ? ' pd-symbol-chip-active' : ''}`}
                        onClick={() => handleChipTap(key)}
                        title={s?.name}
                      >
                        <span className="pd-chip-emoji">{s?.emoji}</span>
                        <span className="pd-chip-label">{s?.name}</span>
                      </button>
                    );
                  })
              )}
            </div>

            <p className="pd-strip-foot">
              Tap any symbol to see how you can use it in daily life
            </p>
          </section>

          {/* ══ MAIN GRID ════════════════════════════════════════════════ */}
          <div className="pd-grid">

            {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
            <div className="pd-col-left">

              {/* During Difficult Moments */}
              <section className="pd-guidance-section pd-section-calm">
                <h2 className="pd-section-title">During Difficult Moments</h2>
                <p className="pd-section-context">
                  When {name} feels upset, overwhelmed, or frustrated…
                </p>

                <div className="pd-moment-steps">
                  {sym.moment.map((step, i) => (
                    <div key={i} className="pd-moment-step-row">
                      <span className="pd-moment-step-icon">
                        {(sym.momentIcons || [])[i] || '·'}
                      </span>
                      <p className="pd-section-body">{step}</p>
                    </div>
                  ))}
                </div>

                {showStory && (
                  <div className="pd-story-box">
                    <p className="pd-story-text">{sym.resetStory}</p>
                  </div>
                )}

                <div className="pd-moment-btns">
                  <button className="pd-cta-calm" onClick={handleBeginTogether}>
                    Begin Together
                  </button>
                  <button
                    className="pd-cta-ghost"
                    onClick={() => setShowStory(s => !s)}
                  >
                    {showStory ? 'Close story' : 'A story to share'}
                  </button>
                </div>
              </section>

              {/* Heart-to-Heart Connection */}
              <section className="pd-guidance-section pd-section-connect">
                <h2 className="pd-section-title">Heart-to-Heart</h2>
                <p className="pd-section-context">Ask at dinner or on the way home</p>

                <div className="pd-questions-list">
                  {sym.dinnerQuestions.map((q, i) => (
                    <p key={i} className="pd-connect-question">{q}</p>
                  ))}
                </div>

                <p className="pd-section-footnote">
                  No right answers — listen more, fix less
                </p>
              </section>

            </div>{/* /col-left */}

            {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
            <div className="pd-col-right">
              <section className="pd-guidance-section pd-section-ritual">
                <h2 className="pd-section-title pd-section-title-center">
                  End the Day with Ganesha
                </h2>

                <ol className="pd-ritual-steps">
                  {sym.ritual.map((step, i) => (
                    <li key={i} className="pd-step-row">
                      <div className="pd-num-circle">{i + 1}</div>
                      <p className="pd-section-body">{step}</p>
                    </li>
                  ))}
                </ol>

                <button className="pd-cta-audio">
                  Listen to the chant together ›
                </button>

                <div className="pd-ritual-cta">
                  {ritualDone ? (
                    <div className="pd-ritual-done-box">
                      <p className="pd-ritual-done-text">Done for tonight</p>
                    </div>
                  ) : (
                    <button className="pd-cta-calm pd-cta-calm-full" onClick={handleRitualDone}>
                      We Did Our Ritual Tonight
                    </button>
                  )}
                </div>
              </section>
            </div>{/* /col-right */}

          </div>{/* /grid */}

          {/* ══ PRACTICE STRIP ═══════════════════════════════════════════ */}
          <section className="pd-practice-strip">
            <div className="pd-practice-info">
              <p className="pd-practice-title">{sym.name} Practice Sheet</p>
              <p className="pd-practice-sub">{sym.activity}</p>
            </div>
            <button className="pd-cta-download" onClick={handlePdf}>
              Download
            </button>
          </section>

        </div>{/* /pd-guidance-card */}
      </div>{/* /pd-scroll */}

      {/* ── Floating calm FAB ─────────────────────────────────────── */}
      <button className="pd-quick-calm-fab" onClick={handleBeginTogether} aria-label="Quick calm">
        🌸
      </button>

      {/* ── Toast ──────────────────────────────────────────────────── */}
      {toast && <div className="pd-toast">{toast}</div>}

      {/* ── Calm Overlay ───────────────────────────────────────────── */}
      {showCalmOverlay && (
        <CalmOverlay
          sym={sym}
          childName={name}
          onClose={handleCalmOverlayClose}
          onDone={handleCalmOverlayDone}
        />
      )}
    </div>
  );
}
