// ParentDashboard.jsx — Parent Dashboard v2 for Ganesha My Bestie
// Design register: premium, calm, adult — NOT child-facing UI
// Fonts: Baloo 2 (headings) · Nunito (body) — NO EXCEPTIONS
//
// v2 upgrades:
//   - PIN gate via PinScreen
//   - 7 tabs: Guidance (existing) + Overview / Emotions /
//             Kindness / Sessions / Stories / Settings
//   - All localStorage analytics from dashboardData.js
//   - DESSA strength-spotting language throughout
//   - WeeklyCard canvas share sheet

import React, { useState, useEffect } from 'react'
import './ParentDashboard.css'
import CalmOverlay   from './CalmOverlay'
import PinScreen     from '../dashboard/PinScreen'
import WeeklyCard    from '../dashboard/WeeklyCard'
import CulturalProgressExtractor from '../../services/CulturalProgressExtractor'
import GameStateManager          from '../../services/GameStateManager'
import {
  getThisWeekSessions,
  getTWGSessions,
  getZoneCounts,
  getCASELCounts,
  getTechniqueCounts,
  getTopItem,
  toStrengthLanguage,
  getKindnessActs,
  getGratitudeJar,
  getDareLog,
  getDareStreak,
  getWeeklyStories,
  unlockExtraTime,
  isExtraTimeUnlocked,
  clearPin,
} from '../../utils/dashboardData'

// ─── Symbol content (unchanged from v1) ────────────────────────

const SYMBOL_DATA = {
  mooshika: {
    id: 'mooshika', name: 'Mooshika', emoji: '🐭',
    power: 'One step at a time', growthWord: 'Focus',
    technique: 'Focus Reset',
    image: '/images/symbols-symbolmountain/symbol-mooshika-new.png',
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
    image: '/images/symbols-symbolmountain/symbol-modak-new.png',
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
    image: '/images/symbols-symbolmountain/symbol-belly-new.png',
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
    image: '/images/symbols-symbolmountain/symbol-lotus-new.png',
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
    image: '/images/symbols-symbolmountain/symbol-trunk-new.png',
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
    image: '/images/symbols-symbolmountain/symbol-eyes-new.png',
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
    image: '/images/symbols-symbolmountain/symbol-ears-new.png',
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
    image: '/images/symbols-symbolmountain/symbol-tusk-new.png',
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
}

const SYMBOL_ORDER = ['modak', 'mooshika', 'belly', 'lotus', 'trunk', 'eyes', 'ear', 'tusk']

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
}

// ─── v2 color tokens ────────────────────────────────────────────
const CV = {
  saffron:    '#FF9933',
  deepOrange: '#FF5722',
  gold:       '#FFD700',
  brown:      '#5D2E0F',
  softBrown:  '#8B4513',
  cream:      '#FFF8E7',
  lightCream: '#FFF3E0',
  green:      '#2E7D32',
  purple:     '#6A1B9A',
  blue:       '#0288D1',
  red:        '#C62828',
}

const ZONE_COLORS = {
  Red:    { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A', emoji: '🔴' },
  Yellow: { bg: '#FFFDE7', text: '#F57F17', border: '#FFF176', emoji: '🟡' },
  Blue:   { bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9', emoji: '🔵' },
  Green:  { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7', emoji: '🟢' },
}

const CASEL_COLORS = {
  'Self-Awareness':              '#6A1B9A',
  'Self-Management':             '#0288D1',
  'Social Awareness':            '#2E7D32',
  'Relationship Skills':         '#FF6F00',
  'Responsible Decision-Making': '#C62828',
}

const SEL_TIPS = {
  Red:    `Your child is frequently in the Red Zone — high emotions like anger or fear. Try "5 fingers breathing" together: trace each finger slowly while breathing in and out. Consistent routines help Red Zone children feel safe. Always validate first: "I can see you're really angry. That makes sense."`,
  Yellow: `Your child is often in the Yellow Zone — worried or excited. Help them name the feeling: "Is your body feeling fast and buzzy?" Try "heavy work" like carrying books or pushing against a wall to help regulate. A worry jar works well for this age.`,
  Blue:   `Your child is frequently in the Blue Zone — sad, tired, or withdrawn. Movement helps — even 5 minutes of dancing shifts the zone. Ask open questions: "What would make your body feel a tiny bit better?" Check for adequate sleep and recurring stressors.`,
  Green:  `Your child is mostly in the Green Zone — calm, happy, ready to learn. This is the ideal time to build emotional vocabulary. Read books about feelings together. Celebrate this balance!`,
}

// ─── Main component ─────────────────────────────────────────────

export default function ParentDashboard({ onBack }) {
  // ── PIN gate ──────────────────────────────────────────────────
  const [unlocked, setUnlocked] = useState(false)

  // ── Tab ───────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('guidance')

  // ── Guidance tab state (v1 preserved) ────────────────────────
  const [childName,      setChildName]      = useState('')
  const [currentSymbol,  setCurrentSymbol]  = useState(null)
  const [selectedSymbol, setSelectedSymbol] = useState(null)
  const [discoveredList, setDiscoveredList] = useState([])
  const [ritualDone,     setRitualDone]     = useState(false)
  const [toast,          setToast]          = useState('')
  const [showStory,      setShowStory]      = useState(false)
  const [showCalmOverlay, setShowCalmOverlay] = useState(false)

  // ── Analytics tab state ───────────────────────────────────────
  const [showWeeklyCard, setShowWeeklyCard] = useState(false)
  const [extraUnlocked,  setExtraUnlocked]  = useState(isExtraTimeUnlocked())

  // ── Load profile + symbol data on mount ──────────────────────
  useEffect(() => {
    const activeId = localStorage.getItem('activeProfileId')
    const stored   = localStorage.getItem('childName') || ''
    if (stored) {
      setChildName(stored)
    } else if (activeId) {
      try {
        const p = GameStateManager.getProfiles()?.profiles?.[activeId]
        if (p?.name) setChildName(p.name)
      } catch (_) {}
    }

    try {
      const data       = CulturalProgressExtractor.getCulturalProgressData()
      const discovered = (data.discoveredSymbols || []).map(s =>
        (s.name || s.id || '').toLowerCase())
      const orderedKeys = SYMBOL_ORDER.filter(key =>
        discovered.some(d => d.includes(key) || key.includes(d)))
      setDiscoveredList(orderedKeys)
      const latestKey = orderedKeys[orderedKeys.length - 1]
      setCurrentSymbol(latestKey ? SYMBOL_DATA[latestKey] : null)
    } catch (_) {
      setCurrentSymbol(null)
      setDiscoveredList([])
    }

    const rKey = `parent_ritual_done_${new Date().toDateString()}`
    setRitualDone(localStorage.getItem(rKey) === 'true')
  }, [])

  // ── Analytics data (derived, no state needed) ─────────────────
  const weekSessions  = getThisWeekSessions()
  const allSessions   = getTWGSessions()
  const zoneCounts    = getZoneCounts(weekSessions)
  const caselCounts   = getCASELCounts(weekSessions)
  const techCounts    = getTechniqueCounts(weekSessions)
  const kindnessActs  = getKindnessActs()
  const gratitudeJar  = getGratitudeJar()
  const dareStreak    = getDareStreak()
  const weeklyStories = getWeeklyStories()

  const topCasel = getTopItem(caselCounts)
  const topZone  = getTopItem(zoneCounts)

  const thisWeekActs = kindnessActs.filter(a => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return new Date(a.date).getTime() > weekAgo
  })

  // ── Helpers ───────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3200)
  }

  const handleRitualDone = () => {
    localStorage.setItem(
      `parent_ritual_done_${new Date().toDateString()}`, 'true')
    setRitualDone(true)
  }

  const handleBeginTogether    = () => setShowCalmOverlay(true)
  const handleCalmOverlayClose = () => setShowCalmOverlay(false)
  const handleCalmOverlayDone  = () => {
    setShowCalmOverlay(false)
    showToast('You helped your child reset. 🌟')
  }

  const handleChipTap = (key) => {
    const s = SYMBOL_DATA[key]
    setSelectedSymbol(sym => sym?.id === s?.id ? null : s)
    setShowStory(false)
  }

  const handleUnlockTime = () => {
    unlockExtraTime()
    setExtraUnlocked(true)
  }

  const sym  = selectedSymbol || currentSymbol || GETTING_STARTED
  const name = childName || 'Your child'

  // ── PIN gate ──────────────────────────────────────────────────
  if (!unlocked) {
    return <PinScreen onSuccess={() => setUnlocked(true)} />
  }

  // ── Tabs config ───────────────────────────────────────────────
  const tabs = [
    { id: 'guidance',  label: 'Guidance',  emoji: '🐘' },
    { id: 'overview',  label: 'Overview',  emoji: '📊' },
    { id: 'emotions',  label: 'Emotions',  emoji: '💛' },
    { id: 'kindness',  label: 'Kindness',  emoji: '🌸' },
    { id: 'sessions',  label: 'Sessions',  emoji: '🗣️' },
    { id: 'stories',   label: 'Stories',   emoji: '📖' },
    { id: 'settings',  label: 'Settings',  emoji: '⚙️' },
  ]

  return (
    <div className="pd-root">
      <div className="pd-bg-overlay" />

      {/* ── v2 Header (replaces scroll-only card header) ───────── */}
      <div style={{
        background: `linear-gradient(135deg, ${CV.saffron}, ${CV.deepOrange})`,
        padding: '1rem 1.2rem',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Baloo 2, cursive',
            fontSize: '1.2rem', color: 'white',
            margin: 0, fontWeight: 800,
          }}>
            🔒 Parent Dashboard
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.82)',
            fontSize: '0.78rem', margin: 0,
            fontFamily: 'Nunito, sans-serif',
          }}>
            {name}'s journey
          </p>
        </div>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none', borderRadius: '50%',
            width: 36, height: 36, cursor: 'pointer',
            color: 'white', fontSize: '1.1rem',
          }}
        >
          ✕
        </button>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', overflowX: 'auto',
        background: 'white',
        borderBottom: '2px solid rgba(255,215,0,0.3)',
        padding: '0 0.4rem',
        gap: '0.1rem',
        position: 'sticky', top: 62, zIndex: 40,
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: 'none', border: 'none',
              padding: '0.65rem 0.75rem',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700, fontSize: '0.78rem',
              cursor: 'pointer', whiteSpace: 'nowrap',
              color: activeTab === t.id ? CV.deepOrange : CV.softBrown,
              borderBottom: activeTab === t.id
                ? `2.5px solid ${CV.deepOrange}` : '2.5px solid transparent',
            }}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB CONTENT
      ══════════════════════════════════════════════════════════ */}
      <div className="pd-scroll" style={{ paddingTop: 0 }}>

        {/* ── GUIDANCE TAB (v1 content — fully preserved) ───────── */}
        {activeTab === 'guidance' && (
          <div className="pd-guidance-card">

            <header className="pd-header">
              <p className="pd-header-label">Parent Guidance</p>
              <h1 className="pd-header-title">
                Using the "{sym.growthWord}" Symbol
              </h1>
              <p className="pd-header-sub">
                Simple ways to support {name} during the day
              </p>
            </header>

            {/* Symbol strip */}
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
                      const s        = SYMBOL_DATA[key]
                      const isActive = sym.id === s?.id
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
                      )
                    })
                )}
              </div>
              <p className="pd-strip-foot">
                Tap any symbol to see how you can use it in daily life
              </p>
            </section>

            {/* Main grid */}
            <div className="pd-grid">
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

                {/* Heart-to-Heart */}
                <section className="pd-guidance-section pd-section-connect">
                  <h2 className="pd-section-title">Heart-to-Heart</h2>
                  <p className="pd-section-context">
                    Ask at dinner or on the way home
                  </p>
                  <div className="pd-questions-list">
                    {sym.dinnerQuestions.map((q, i) => (
                      <p key={i} className="pd-connect-question">{q}</p>
                    ))}
                  </div>
                  <p className="pd-section-footnote">
                    No right answers — listen more, fix less
                  </p>
                </section>
              </div>

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
                      <button
                        className="pd-cta-calm pd-cta-calm-full"
                        onClick={handleRitualDone}
                      >
                        We Did Our Ritual Tonight
                      </button>
                    )}
                  </div>
                </section>
              </div>
            </div>

            {/* Practice strip */}
            <section className="pd-practice-strip">
              <div className="pd-practice-info">
                <p className="pd-practice-title">{sym.name} Practice Sheet</p>
                <p className="pd-practice-sub">{sym.activity}</p>
              </div>
              <button
                className="pd-cta-download"
                onClick={() => showToast('Practice sheets coming very soon.')}
              >
                Download
              </button>
            </section>
          </div>
        )}

        {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <AnalyticsWrap>
            {/* Summary cards */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '0.7rem', marginBottom: '1rem',
            }}>
              <SummaryCard emoji="🐘" label="TWG sessions"
                value={weekSessions.length} sublabel="this week"
                color={CV.saffron} />
              <SummaryCard emoji="🎯" label="Dare streak"
                value={`${dareStreak} day${dareStreak !== 1 ? 's' : ''}`}
                sublabel={dareStreak >= 7 ? '🌟 Amazing!' : 'keep going!'}
                color={CV.deepOrange} />
              <SummaryCard emoji="💛" label="Kind acts"
                value={thisWeekActs.length} sublabel="this week"
                color={CV.green} />
              <SummaryCard emoji="🍬" label="Gratitude jar"
                value={`${gratitudeJar.count}/7`}
                sublabel={gratitudeJar.count >= 7
                  ? 'Story ready! 📖' : 'modaks'}
                color={CV.purple} />
            </div>

            {/* DESSA strength highlight */}
            {topCasel && (
              <div style={{
                background: '#F3E5F5', border: '2px solid #CE93D8',
                borderRadius: 16, padding: '1rem', marginBottom: '1rem',
              }}>
                <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>🌟</div>
                <p style={{
                  fontFamily: 'Baloo 2, cursive',
                  fontSize: '0.9rem', color: CV.purple,
                  margin: '0 0 0.2rem', fontWeight: 700,
                }}>
                  This week's strength
                </p>
                <p style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '1rem', color: CV.purple,
                  margin: 0, fontWeight: 800,
                }}>
                  {name} {toStrengthLanguage(topCasel[0], topCasel[1])}
                </p>
              </div>
            )}

            {/* Top zone + tip */}
            {topZone && (() => {
              const z = ZONE_COLORS[topZone[0]]
              return (
                <div style={{
                  background: z.bg, border: `2px solid ${z.border}`,
                  borderRadius: 16, padding: '1rem', marginBottom: '1rem',
                }}>
                  <p style={{
                    fontFamily: 'Baloo 2, cursive',
                    fontSize: '0.88rem', color: z.text,
                    margin: '0 0 0.3rem', fontWeight: 700,
                  }}>
                    {z.emoji} Most common zone this week
                  </p>
                  <p style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '0.95rem', color: z.text,
                    margin: '0 0 0.5rem', fontWeight: 800,
                  }}>
                    {topZone[0]} Zone ({topZone[1]} session{topZone[1] !== 1 ? 's' : ''})
                  </p>
                  <p style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '0.82rem', color: z.text,
                    margin: 0, opacity: 0.8, lineHeight: 1.6,
                  }}>
                    {SEL_TIPS[topZone[0]]}
                  </p>
                  <p style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '0.7rem', color: z.text,
                    margin: '0.4rem 0 0', opacity: 0.5,
                  }}>
                    Source: CASEL / Zones of Regulation
                  </p>
                </div>
              )
            })()}

            {/* Weekly story CTA */}
            {gratitudeJar.count >= 7 && (
              <button
                onClick={() => setShowWeeklyCard(true)}
                style={{
                  width: '100%',
                  background: `linear-gradient(135deg, ${CV.saffron}, ${CV.deepOrange})`,
                  border: 'none', borderRadius: 16,
                  color: 'white', padding: '1rem',
                  fontFamily: 'Baloo 2, cursive',
                  fontWeight: 700, fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(255,87,34,0.3)',
                  marginBottom: '1rem',
                }}
              >
                📖 This week's story is ready — share it!
              </button>
            )}

            {/* Extra time unlock */}
            <div style={{
              background: 'white',
              border: '2px solid rgba(255,215,0,0.4)',
              borderRadius: 16, padding: '1rem',
            }}>
              <p style={{
                fontFamily: 'Baloo 2, cursive',
                fontSize: '0.9rem', color: CV.brown,
                margin: '0 0 0.4rem', fontWeight: 700,
              }}>
                ⏱️ Extra Time with Ganesha
              </p>
              <p style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '0.82rem', color: CV.softBrown,
                margin: '0 0 0.7rem', lineHeight: 1.6,
              }}>
                {extraUnlocked
                  ? '✅ Extra time unlocked for today'
                  : `${name} has used today's 5 minutes. Give them extra time?`}
              </p>
              {!extraUnlocked && (
                <button onClick={handleUnlockTime} style={{
                  background: `linear-gradient(135deg, ${CV.saffron}, ${CV.deepOrange})`,
                  border: 'none', borderRadius: 999,
                  color: 'white', padding: '0.6rem 1.4rem',
                  fontFamily: 'Baloo 2, cursive',
                  fontWeight: 700, fontSize: '0.88rem',
                  cursor: 'pointer',
                }}>
                  Give 5 more minutes 🐘
                </button>
              )}
            </div>
          </AnalyticsWrap>
        )}

        {/* ── EMOTIONS TAB ─────────────────────────────────────────── */}
        {activeTab === 'emotions' && (
          <AnalyticsWrap>
            <SectionHead>Zones of Regulation — this week</SectionHead>

            {/* Zone bar chart */}
            {Object.entries(zoneCounts).map(([zone, count]) => {
              const z   = ZONE_COLORS[zone]
              const max = Math.max(...Object.values(zoneCounts), 1)
              return (
                <div key={zone} style={{
                  display: 'flex', alignItems: 'center',
                  gap: '0.6rem', marginBottom: '0.7rem',
                }}>
                  <span style={{ fontSize: '0.9rem', width: 16 }}>{z.emoji}</span>
                  <span style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '0.82rem', color: z.text,
                    width: 58, fontWeight: 700,
                  }}>{zone}</span>
                  <div style={{
                    flex: 1, background: '#eee',
                    borderRadius: 999, height: 12, overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${(count / max) * 100}%`,
                      height: '100%', background: z.text,
                      borderRadius: 999, transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <span style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '0.8rem', color: CV.softBrown,
                    width: 20, textAlign: 'right',
                  }}>{count}</span>
                </div>
              )
            })}

            <SectionHead style={{ marginTop: '1.2rem' }}>SEL Skills practised</SectionHead>
            {Object.entries(caselCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([skill, count]) => (
                <div key={skill} style={{
                  background: 'white',
                  border: '1.5px solid rgba(255,215,0,0.4)',
                  borderRadius: 12, padding: '0.7rem 0.9rem',
                  marginBottom: '0.5rem',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <span style={{
                      display: 'inline-block', width: 8, height: 8,
                      borderRadius: '50%',
                      background: CASEL_COLORS[skill] || CV.purple,
                      marginRight: 8,
                    }} />
                    <span style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontSize: '0.88rem', color: CV.brown, fontWeight: 700,
                    }}>{skill}</span>
                  </div>
                  <span style={{
                    fontFamily: 'Baloo 2, cursive',
                    fontSize: '0.9rem', color: CV.softBrown, fontWeight: 700,
                  }}>{count}×</span>
                </div>
              ))}

            {Object.keys(techCounts).length > 0 && (
              <>
                <SectionHead style={{ marginTop: '1.2rem' }}>
                  Co-regulation tools used
                </SectionHead>
                {Object.entries(techCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([tech, count]) => (
                    <div key={tech} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid rgba(255,215,0,0.2)',
                      fontFamily: 'Nunito, sans-serif',
                      fontSize: '0.88rem', color: CV.brown,
                    }}>
                      <span style={{ textTransform: 'capitalize' }}>
                        {tech.replace(/_/g, ' ')}
                      </span>
                      <span style={{ color: CV.softBrown, opacity: 0.7 }}>
                        {count}×
                      </span>
                    </div>
                  ))}
              </>
            )}

            {weekSessions.length === 0 && (
              <EmptyState emoji="💛" message="No TWG sessions this week yet." />
            )}
          </AnalyticsWrap>
        )}

        {/* ── KINDNESS TAB ─────────────────────────────────────────── */}
        {activeTab === 'kindness' && (
          <AnalyticsWrap>
            {/* Dare streak banner */}
            <div style={{
              background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
              border: `2px solid ${CV.gold}`,
              borderRadius: 16, padding: '1rem',
              marginBottom: '1rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>🎯</div>
              <p style={{
                fontFamily: 'Baloo 2, cursive',
                fontSize: '1.3rem', color: CV.brown,
                margin: 0, fontWeight: 800,
              }}>
                {dareStreak} day streak
              </p>
              <p style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '0.82rem', color: CV.softBrown,
                margin: '0.2rem 0 0',
              }}>
                {dareStreak >= 7
                  ? '🌟 A full week of dares! Story unlocked!'
                  : `${7 - dareStreak} more days for weekly story`}
              </p>
            </div>

            <SectionHead>{name}'s kind acts this week</SectionHead>
            {thisWeekActs.length === 0 ? (
              <EmptyState emoji="🌸"
                message="No kindness acts logged yet this week." />
            ) : (
              thisWeekActs.map(act => (
                <div key={act.id} style={{
                  background: 'white',
                  border: '1.5px solid rgba(255,215,0,0.4)',
                  borderRadius: 12, padding: '0.8rem',
                  marginBottom: '0.5rem',
                }}>
                  <p style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '0.9rem', color: CV.brown,
                    margin: '0 0 0.3rem', fontWeight: 700,
                  }}>
                    "{act.text}"
                  </p>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      background: CV.lightCream, borderRadius: 999,
                      padding: '0.15rem 0.6rem',
                      fontSize: '0.72rem', color: CV.softBrown,
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700, textTransform: 'capitalize',
                    }}>
                      {act.category}
                    </span>
                    <span style={{
                      fontSize: '0.72rem', color: CV.softBrown,
                      opacity: 0.5, fontFamily: 'Nunito, sans-serif',
                    }}>
                      {new Date(act.date).toLocaleDateString(
                        'en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))
            )}

            <SectionHead style={{ marginTop: '1.2rem' }}>
              Gratitude jar — {gratitudeJar.count}/7 modaks
            </SectionHead>
            <div style={{
              display: 'flex', gap: 6, flexWrap: 'wrap',
              marginBottom: '0.8rem',
            }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <span key={i} style={{
                  fontSize: '1.5rem',
                  opacity: i < gratitudeJar.count ? 1 : 0.2,
                }}>🍬</span>
              ))}
            </div>
            {(gratitudeJar.items || []).slice(-7).map((item, i) => (
              <div key={i} style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '0.85rem', color: CV.brown,
                padding: '0.3rem 0',
                borderBottom: '1px solid rgba(255,215,0,0.2)',
              }}>
                🌸 {item.text || item}
              </div>
            ))}
          </AnalyticsWrap>
        )}

        {/* ── SESSIONS TAB ─────────────────────────────────────────── */}
        {activeTab === 'sessions' && (
          <AnalyticsWrap>
            <SectionHead>Recent TWG sessions</SectionHead>
            {allSessions.length === 0 ? (
              <EmptyState emoji="🗣️"
                message="No sessions yet. Let your child talk to Ganesha!" />
            ) : (
              [...allSessions].reverse().slice(0, 15).map(s => {
                const z = ZONE_COLORS[s.zone] || ZONE_COLORS.Green
                return (
                  <div key={s.id} style={{
                    border: `1.5px solid ${z.border}`,
                    background: z.bg,
                    borderRadius: 14, padding: '0.8rem',
                    marginBottom: '0.5rem',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start', gap: '0.5rem',
                    }}>
                      <div style={{ flex: 1 }}>
                        {s.input && (
                          <p style={{
                            fontFamily: 'Nunito, sans-serif',
                            fontSize: '0.88rem', color: CV.brown,
                            fontWeight: 700, margin: '0 0 0.3rem',
                          }}>
                            "{s.input}"
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {s.zone && (
                            <Tag text={`${z.emoji} ${s.zone} Zone`} color={z.text} />
                          )}
                          {s.caselSkill && (
                            <Tag
                              text={`🧠 ${s.caselSkill}`}
                              color={CASEL_COLORS[s.caselSkill] || CV.purple}
                            />
                          )}
                        </div>
                      </div>
                      <span style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontSize: '0.72rem', color: CV.softBrown,
                        opacity: 0.6, whiteSpace: 'nowrap',
                      }}>
                        {new Date(s.date).toLocaleDateString(
                          'en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </AnalyticsWrap>
        )}

        {/* ── STORIES TAB ──────────────────────────────────────────── */}
        {activeTab === 'stories' && (
          <AnalyticsWrap>
            <SectionHead>Weekly story cards</SectionHead>
            <p style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '0.85rem', color: CV.softBrown,
              marginBottom: '1rem', lineHeight: 1.6, opacity: 0.7,
            }}>
              Generated when gratitude jar reaches 7 modaks.
              Share with family on WhatsApp. 💛
            </p>
            {weeklyStories.length === 0 ? (
              <EmptyState emoji="📖"
                message={`Fill the gratitude jar to unlock ${name}'s first weekly story.`} />
            ) : (
              weeklyStories.map(story => (
                <div key={story.id} style={{
                  background: 'white',
                  border: '2px solid rgba(255,215,0,0.5)',
                  borderRadius: 16, padding: '1rem',
                  marginBottom: '0.8rem',
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '0.5rem',
                  }}>
                    <span style={{
                      fontFamily: 'Baloo 2, cursive',
                      fontSize: '0.9rem', color: CV.brown, fontWeight: 700,
                    }}>
                      {story.weekOf}
                    </span>
                    <span style={{
                      fontSize: '0.72rem', color: CV.softBrown,
                      opacity: 0.5, fontFamily: 'Nunito, sans-serif',
                    }}>
                      {new Date(story.date).toLocaleDateString(
                        'en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '0.88rem', color: CV.brown,
                    lineHeight: 1.6, margin: '0 0 0.8rem',
                  }}>
                    {story.summary}
                  </p>
                  <button
                    onClick={() => setShowWeeklyCard(story)}
                    style={{
                      background: `linear-gradient(135deg, ${CV.saffron}, ${CV.deepOrange})`,
                      border: 'none', borderRadius: 999,
                      color: 'white', padding: '0.5rem 1.2rem',
                      fontFamily: 'Baloo 2, cursive',
                      fontWeight: 700, fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    📤 Share this story
                  </button>
                </div>
              ))
            )}
          </AnalyticsWrap>
        )}

        {/* ── SETTINGS TAB ─────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <AnalyticsWrap>
            <SectionHead>Dashboard settings</SectionHead>

            <SettingRow
              label="Daily TWG sessions"
              sublabel="How many 5-min sessions per day"
              value="1"
            />
            <SettingRow
              label="Change PIN"
              sublabel="Update your 4-digit parent PIN"
              action={() => {
                clearPin()
                setUnlocked(false)
              }}
              actionLabel="Change"
            />
            <SettingRow
              label="Clear session history"
              sublabel="Remove all logged TWG sessions"
              action={() => {
                if (window.confirm('Clear all session history?')) {
                  localStorage.removeItem('gmb_twg_sessions')
                  window.location.reload()
                }
              }}
              actionLabel="Clear"
              danger
            />
          </AnalyticsWrap>
        )}

      </div>{/* /scroll */}

      {/* Floating calm FAB — only on Guidance tab */}
      {activeTab === 'guidance' && (
        <button
          className="pd-quick-calm-fab"
          onClick={handleBeginTogether}
          aria-label="Quick calm"
        >
          🌸
        </button>
      )}

      {/* Toast */}
      {toast && <div className="pd-toast">{toast}</div>}

      {/* Calm Overlay */}
      {showCalmOverlay && (
        <CalmOverlay
          sym={sym}
          childName={name}
          onClose={handleCalmOverlayClose}
          onDone={handleCalmOverlayDone}
        />
      )}

      {/* Weekly Card modal */}
      {showWeeklyCard && (
        <WeeklyCard
          childName={name}
          storyData={showWeeklyCard === true ? null : showWeeklyCard}
          gratitudeItems={gratitudeJar.items || []}
          topStrength={topCasel}
          dareStreak={dareStreak}
          onClose={() => setShowWeeklyCard(false)}
        />
      )}
    </div>
  )
}

// ─── Small reusable components ─────────────────────────────────

function AnalyticsWrap({ children }) {
  return (
    <div style={{
      padding: '1.2rem',
      maxWidth: 560, margin: '0 auto',
      animation: 'pd-fadeUp 0.35s ease',
    }}>
      <style>{`
        @keyframes pd-fadeUp {
          from { opacity:0; transform:translateY(8px) }
          to   { opacity:1; transform:translateY(0) }
        }
      `}</style>
      {children}
    </div>
  )
}

function SectionHead({ children, style }) {
  return (
    <h3 style={{
      fontFamily: 'Baloo 2, cursive',
      fontSize: '1rem', color: '#5D2E0F',
      margin: '0 0 0.8rem',
      ...style,
    }}>
      {children}
    </h3>
  )
}

function SummaryCard({ emoji, label, value, sublabel, color }) {
  return (
    <div style={{
      background: 'white',
      border: '2px solid rgba(255,215,0,0.4)',
      borderRadius: 16, padding: '0.9rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{emoji}</div>
      <div style={{
        fontFamily: 'Baloo 2, cursive',
        fontSize: '1.3rem', fontWeight: 800,
        color: color || '#5D2E0F',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'Nunito, sans-serif',
        fontSize: '0.75rem', color: '#8B4513', fontWeight: 700,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'Nunito, sans-serif',
        fontSize: '0.7rem', color: '#8B4513', opacity: 0.5,
      }}>
        {sublabel}
      </div>
    </div>
  )
}

function Tag({ text, color }) {
  return (
    <span style={{
      background: color, color: 'white', borderRadius: 999,
      padding: '0.15rem 0.6rem', fontSize: '0.72rem',
      fontFamily: 'Nunito, sans-serif', fontWeight: 700,
    }}>
      {text}
    </span>
  )
}

function EmptyState({ emoji, message }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem', opacity: 0.5 }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{emoji}</div>
      <p style={{
        fontFamily: 'Nunito, sans-serif',
        fontSize: '0.88rem', color: '#8B4513',
      }}>
        {message}
      </p>
    </div>
  )
}

function SettingRow({ label, sublabel, value, action, actionLabel, danger }) {
  return (
    <div style={{
      background: 'white',
      border: '1.5px solid rgba(255,215,0,0.4)',
      borderRadius: 14, padding: '0.9rem',
      marginBottom: '0.6rem',
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div>
        <p style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '0.9rem', color: '#5D2E0F',
          margin: 0, fontWeight: 700,
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '0.78rem', color: '#8B4513',
          margin: 0, opacity: 0.6,
        }}>
          {sublabel}
        </p>
      </div>
      {action ? (
        <button onClick={action} style={{
          background: danger ? '#FFEBEE' : '#FFF3E0',
          border: `1.5px solid ${danger ? '#EF9A9A' : '#FFD700'}`,
          borderRadius: 999, padding: '0.4rem 0.9rem',
          fontFamily: 'Nunito, sans-serif', fontWeight: 700,
          fontSize: '0.82rem',
          color: danger ? '#C62828' : '#5D2E0F',
          cursor: 'pointer',
        }}>
          {actionLabel}
        </button>
      ) : (
        <span style={{
          fontFamily: 'Baloo 2, cursive',
          fontWeight: 700, color: '#FF9933',
        }}>
          {value}
        </span>
      )}
    </div>
  )
}
