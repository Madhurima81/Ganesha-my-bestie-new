// CompletionScreen.jsx
// ─────────────────────────────────────────────────────────
// Emotional closure screen shown after every guided experience.
// Driven by useGaneshaEngine.getCompletionMessage().
//
// Design rules (from completion_messages.md):
//   - No stars. No scores. No "great job".
//   - One rotating message. Subtle glow animation.
//   - 3 action buttons: Continue / Try Another / Talk
//   - Safety add-on line shown in smaller text if flagged.
//
// Props:
//   engine          — useGaneshaEngine() instance
//   zone            — zone name for theme (from engine.session)
//   onContinue      — child continues adventure
//   onTryAnother    — child wants a different experience
//   onTalkMore      — child wants to talk to Ganesha
// ─────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react'
import './CompletionScreen.css'

// ─────────────────────────────────────────────────────────
// ZONE THEMES — matches GuidedExperienceScene + DoorwayScene
// ─────────────────────────────────────────────────────────
const ZONE_THEMES = {
  mountain: {
    bg:          'radial-gradient(ellipse at 60% 40%, #1a2a4a 0%, #0c1624 100%)',
    accent:      '#ffc845',
    glowColor:   'rgba(255, 200, 80, 0.4)',
    orbColor:    '#ffeaa7',
    orbGlow:     'rgba(255, 220, 120, 0.6)',
  },
  river: {
    bg:          'radial-gradient(ellipse at 40% 60%, #0a2a3a 0%, #051520 100%)',
    accent:      '#4dd9f5',
    glowColor:   'rgba(100, 220, 255, 0.4)',
    orbColor:    '#7ae8ff',
    orbGlow:     'rgba(100, 220, 255, 0.6)',
  },
  cave: {
    bg:          'radial-gradient(ellipse at 50% 50%, #1a0a2e 0%, #080410 100%)',
    accent:      '#a87fff',
    glowColor:   'rgba(180, 140, 255, 0.4)',
    orbColor:    '#c4a8ff',
    orbGlow:     'rgba(180, 140, 255, 0.6)',
  },
  hut: {
    bg:          'radial-gradient(ellipse at 50% 70%, #2a1a0a 0%, #150c04 100%)',
    accent:      '#ff9933',
    glowColor:   'rgba(255, 180, 100, 0.4)',
    orbColor:    '#ffb87a',
    orbGlow:     'rgba(255, 180, 100, 0.6)',
  },
  forest: {
    bg:          'radial-gradient(ellipse at 40% 40%, #0a2a0a 0%, #041004 100%)',
    accent:      '#4caf50',
    glowColor:   'rgba(100, 220, 100, 0.4)',
    orbColor:    '#a0f0a0',
    orbGlow:     'rgba(100, 220, 100, 0.6)',
  },
  festival: {
    bg:          'radial-gradient(ellipse at 50% 50%, #2a0a1a 0%, #150408 100%)',
    accent:      '#e91e63',
    glowColor:   'rgba(255, 150, 200, 0.4)',
    orbColor:    '#ffb8e8',
    orbGlow:     'rgba(255, 150, 200, 0.6)',
  },
}

// ─────────────────────────────────────────────────────────
// SYMBOL GLOW ORB
// Gentle pulsing orb — the only animation on this screen.
// Deliberately minimal. Felt shift, not celebration.
// ─────────────────────────────────────────────────────────
function SymbolOrb({ orbColor, orbGlow, symbol }) {
  const SYMBOL_EMOJI = {
    trunk:    '🐘',
    belly:    '🌕',
    lotus:    '🪷',
    mooshika: '🐭',
    tusk:     '✦',
    ears:     '👂',
    eyes:     '👁',
    modak:    '🟡',
  }

  return (
    <div className="cs-orb-wrap">
      <div
        className="cs-orb"
        style={{
          background: `radial-gradient(circle at 40% 35%, ${orbColor}, ${orbColor}88)`,
          boxShadow:  `0 0 40px ${orbGlow}, 0 0 80px ${orbGlow}44`,
        }}
      >
        <span className="cs-orb-emoji">
          {SYMBOL_EMOJI[symbol] || '✦'}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// ACTION BUTTON
// ─────────────────────────────────────────────────────────
function ActionButton({ label, emoji, onClick, variant = 'secondary', accentColor }) {
  const isPrimary = variant === 'primary'

  return (
    <button
      className={`cs-btn cs-btn-${variant}`}
      onClick={onClick}
      style={isPrimary ? {
        background:  accentColor,
        boxShadow:   `0 8px 24px ${accentColor}66`,
      } : {}}
    >
      {emoji && <span className="cs-btn-emoji">{emoji}</span>}
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function CompletionScreen({
  engine,
  zone,
  onContinue,
  onTryAnother,
  onTalkMore,
}) {
  const { session } = engine

  const resolvedZone = zone || session.nature_zone || 'mountain'
  const theme        = ZONE_THEMES[resolvedZone] || ZONE_THEMES.mountain
  const symbol       = session.symbol_anchor || 'trunk'

  const [message,    setMessage]    = useState('')
  const [addonLine,  setAddonLine]  = useState(null)
  const [visible,    setVisible]    = useState(false)

  // Get completion message from engine on mount
  useEffect(() => {
    const result = engine.getCompletionMessage()
    setMessage(result.message || 'Something shifted just now.')
    setAddonLine(result.addon || null)

    // Stagger fade-in slightly for polish
    const t = setTimeout(() => setVisible(true), 200)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`cs-scene cs-theme-${resolvedZone} ${visible ? 'cs-visible' : ''}`}
      style={{ background: theme.bg }}
    >

      {/* Subtle particle bg */}
      <div className="cs-particles">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="cs-particle"
            style={{
              background:       theme.accent,
              left:             `${(i * 12.5) % 100}%`,
              top:              `${(i * 17.3) % 100}%`,
              animationDelay:   `${i * 1.2}s`,
              animationDuration:`${18 + i * 2}s`,
              width:            i % 2 === 0 ? 3 : 2,
              height:           i % 2 === 0 ? 3 : 2,
            }}
          />
        ))}
      </div>

      {/* Main content wrapper */}
      <div className="cs-content">

        {/* Symbol orb — top */}
        <SymbolOrb
          orbColor={theme.orbColor}
          orbGlow={theme.orbGlow}
          symbol={symbol}
        />

        {/* Completion message */}
        <div
          className="cs-message"
          style={{ textShadow: `0 0 30px ${theme.glowColor}` }}
        >
          {message}
        </div>

        {/* Safety add-on line — only if flagged */}
        {addonLine && (
          <div className="cs-addon">
            {addonLine}
          </div>
        )}

        {/* Ganesha sign-off */}
        <div className="cs-ganesha-line">
          — Ganesha
        </div>

        {/* 3 action buttons */}
        <div className="cs-actions">
          <ActionButton
            label="Continue Adventure"
            emoji="🗺"
            onClick={onContinue}
            variant="primary"
            accentColor={theme.accent}
          />
          <ActionButton
            label="Try Another Way"
            emoji="↺"
            onClick={onTryAnother}
            variant="secondary"
          />
          <ActionButton
            label="Talk with Ganesha"
            emoji="💬"
            onClick={onTalkMore}
            variant="ghost"
          />
        </div>

      </div>
    </div>
  )
}
