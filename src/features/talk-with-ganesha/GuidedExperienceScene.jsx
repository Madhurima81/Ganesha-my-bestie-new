// src/features/talk-with-ganesha/GuidedExperienceScene.jsx
// ─────────────────────────────────────────────────────────
// Full guided experience engine screen.
// Driven entirely by template JSON from useGaneshaEngine.
// Phases auto-advance on timer. Child can pause or replay.
// Connects directly to useGaneshaEngine selectTool() output.
//
// Props:
//   template     — enriched template object from selectTool()
//   zone         — 'mountain' | 'river' | 'cave' | 'hut' | 'forest' | 'festival'
//   onComplete   — called when all phases finish
//   onExit       — called when child taps back
//   soundEnabled — bool (default true)
// ─────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useRef } from 'react'
import './GuidedExperienceScene.css'

// ─────────────────────────────────────────────────────────
// ZONE THEME CONFIG
// Each zone has its own particle colour, text glow, accent
// (background is now handled by .gmb-theme-[zone] CSS class)
// ─────────────────────────────────────────────────────────
const ZONE_THEMES = {
  mountain: {
    particleColor: '#ffd87a',
    textGlow:      'rgba(255, 200, 80, 0.3)',
    accentColor:   '#ffc845',
    label:         'Symbol Mountain',
  },
  river: {
    particleColor: '#7ae8ff',
    textGlow:      'rgba(100, 220, 255, 0.3)',
    accentColor:   '#4dd9f5',
    label:         'Shloka River',
  },
  cave: {
    particleColor: '#c4a8ff',
    textGlow:      'rgba(180, 140, 255, 0.3)',
    accentColor:   '#a87fff',
    label:         'Cave of Secrets',
  },
  hut: {
    particleColor: '#ffb87a',
    textGlow:      'rgba(255, 180, 100, 0.3)',
    accentColor:   '#ff9933',
    label:         'About Me Hut',
  },
  forest: {
    particleColor: '#a0f0a0',
    textGlow:      'rgba(100, 220, 100, 0.3)',
    accentColor:   '#4caf50',
    label:         'Forest',
  },
  festival: {
    particleColor: '#ffb8e8',
    textGlow:      'rgba(255, 150, 200, 0.3)',
    accentColor:   '#e91e63',
    label:         'Festival Square',
  },
}

// ─────────────────────────────────────────────────────────
// FOCUS OBJECT CONFIG
// Maps focus_object_type → visual style
// ─────────────────────────────────────────────────────────
const FOCUS_OBJECTS = {
  breathing_orb:    { emoji: null, baseColor: '#ffeaa7', glowColor: 'rgba(255, 220, 120, 0.8)', size: 140 },
  star_light:       { emoji: '✦',  baseColor: '#ffffff', glowColor: 'rgba(255, 255, 200, 0.7)', size: 100 },
  stone_block:      { emoji: '🪨', baseColor: '#a0856a', glowColor: 'rgba(180, 140, 100, 0.6)', size: 130 },
  glowing_footsteps:{ emoji: '👣', baseColor: '#ffd700', glowColor: 'rgba(255, 215, 0, 0.6)',   size: 110 },
  aura_circle:      { emoji: '☀',  baseColor: '#ffcc00', glowColor: 'rgba(255, 200, 0, 0.8)',   size: 150 },
  sound_ripple:     { emoji: '◎',  baseColor: '#7ae8ff', glowColor: 'rgba(100, 220, 255, 0.7)', size: 120 },
  colour_cloud:     { emoji: '☁',  baseColor: '#d4a8ff', glowColor: 'rgba(200, 150, 255, 0.7)', size: 140 },
  mouse_light:      { emoji: '🐭', baseColor: '#ffb87a', glowColor: 'rgba(255, 180, 100, 0.7)', size: 110 },
  heart_glow_ember: { emoji: '❤',  baseColor: '#ff6b6b', glowColor: 'rgba(255, 100, 100, 0.7)', size: 120 },
}

// Default phase durations in ms
const PHASE_DURATIONS = {
  arrival:       8000,
  settle:        15000,
  release:       10000,
  affirmation:   8000,
  symbol_moment: 6000,
  completion:    5000,
}

// ─────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────

function FocusObject({ focusType, phaseName, accentColor }) {
  const config = FOCUS_OBJECTS[focusType] || FOCUS_OBJECTS.breathing_orb

  return (
    // CHANGE 3a — className handles animation via phaseName; keep only dynamic inline styles
    <div
      className={`gmb-focus-object ${phaseName}`}
      style={{
        width:      config.size,
        height:     config.size,
        background: `radial-gradient(circle at 40% 35%, ${config.baseColor}, ${accentColor || config.baseColor})`,
        boxShadow:  `0 0 40px ${config.glowColor}, 0 0 80px ${config.glowColor}`,
        fontSize:   config.size * 0.35,
      }}
    >
      {config.emoji && (
        <span style={{ filter: 'drop-shadow(0 0 8px white)' }}>{config.emoji}</span>
      )}
    </div>
  )
}

function PhaseProgress({ total, current }) {
  return (
    // CHANGE 3b — gmb-phase-progress wrapper; gmb-progress-dot with active class
    <div className="gmb-phase-progress">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`gmb-progress-dot ${i <= current ? 'active' : ''}`}
        />
      ))}
    </div>
  )
}

function PhaseInstruction({ text, textGlow }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [text])

  return (
    // CHANGE 3c — className handles position/opacity/transition; keep dynamic boxShadow inline
    <div
      className={`gmb-phase-text ${visible ? 'visible' : ''}`}
      style={{ boxShadow: `0 4px 30px ${textGlow}` }}
    >
      {text}
    </div>
  )
}

function ParticleLayer({ particleColor }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="gmb-particle"
          style={{
            width:           i % 3 === 0 ? 3 : 2,
            height:          i % 3 === 0 ? 3 : 2,
            background:      particleColor,
            opacity:         0.3 + (i % 4) * 0.1,
            left:            `${(i * 8.3) % 100}%`,
            top:             `${(i * 13.7) % 100}%`,
            animationDuration:  `${20 + i * 3}s`,
            animationDelay:     `${i * 1.5}s`,
          }}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function GuidedExperienceScene({
  template,
  zone         = 'mountain',
  onComplete,
  onExit,
  soundEnabled = true,
}) {
  const theme       = ZONE_THEMES[zone] || ZONE_THEMES.mountain
  const focusType   = template?.focus_object_type || 'breathing_orb'
  const phases      = template?.phases || []
  const totalPhases = phases.length

  const [phaseIndex, setPhaseIndex] = useState(0)
  const [isPaused,   setIsPaused]   = useState(false)
  const [isExiting,  setIsExiting]  = useState(false)
  const [isMuted,    setIsMuted]    = useState(!soundEnabled)
  const timerRef = useRef(null)

  // CHANGE 2 — injectKeyframes() call removed; CSS file handles all keyframes

  const currentPhase = phases[phaseIndex] || {}
  const phaseName    = currentPhase.phase || 'settle'
  const phaseText    = currentPhase.text  || ''
  const phaseDur     = PHASE_DURATIONS[phaseName] || 10000

  // Auto-advance phases
  useEffect(() => {
    if (isPaused) return
    if (phaseIndex >= totalPhases - 1) return

    timerRef.current = setTimeout(() => {
      setPhaseIndex(prev => prev + 1)
    }, phaseDur)

    return () => clearTimeout(timerRef.current)
  }, [phaseIndex, isPaused, phaseDur, totalPhases])

  // Last phase → call onComplete after brief pause
  useEffect(() => {
    if (phaseIndex === totalPhases - 1 && totalPhases > 0) {
      const t = setTimeout(() => {
        if (onComplete) onComplete()
      }, phaseDur + 1000)
      return () => clearTimeout(t)
    }
  }, [phaseIndex, totalPhases, phaseDur, onComplete])

  const handleExit = useCallback(() => {
    setIsExiting(true)
    clearTimeout(timerRef.current)
    setTimeout(() => { if (onExit) onExit() }, 400)
  }, [onExit])

  const handlePause  = useCallback(() => setIsPaused(p => !p), [])
  const handleReplay = useCallback(() => {
    clearTimeout(timerRef.current)
    setPhaseIndex(0)
    setIsPaused(false)
  }, [])

  if (!template || phases.length === 0) {
    return (
      <div style={{ color: 'white', padding: 40, fontFamily: 'Nunito', textAlign: 'center' }}>
        Loading experience...
      </div>
    )
  }

  return (
    // CHANGE 3d — scene root: className replaces all inline styles
    <div className={`gmb-experience-scene gmb-theme-${zone} ${isExiting ? 'exiting' : ''}`}>

      {/* Background slow drift — keeps dynamic bg gradient inline */}
      <div
        className="gmb-bg-layer"
        style={{ background: ZONE_THEMES[zone]?.bg }}
      />

      {/* Particles */}
      <ParticleLayer particleColor={theme.particleColor} />

      {/* Phase progress dots */}
      <PhaseProgress total={totalPhases} current={phaseIndex} />

      {/* CHANGE 3e — back button: className replaces inline styles */}
      <button className="gmb-back-btn" onClick={handleExit}>
        ← Back
      </button>

      {/* CHANGE 3f — controls: className replaces inline styles */}
      <div className="gmb-controls">
        {[
          { label: isMuted ? '🔇' : '🔊', onClick: () => setIsMuted(m => !m), title: 'Sound'                    },
          { label: isPaused ? '▶' : '⏸',  onClick: handlePause,               title: isPaused ? 'Resume' : 'Pause' },
          { label: '↺',                    onClick: handleReplay,              title: 'Replay'                   },
        ].map(btn => (
          // CHANGE 3g — control buttons: className replaces inline styles
          <button
            key={btn.label}
            className="gmb-control-btn"
            onClick={btn.onClick}
            title={btn.title}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Focus object */}
      <FocusObject
        focusType={focusType}
        phaseName={phaseName}
        accentColor={theme.accentColor}
      />

      {/* Pause indicator */}
      {isPaused && (
        <div className="gmb-paused-label">PAUSED</div>
      )}

      {/* Phase instruction text */}
      <PhaseInstruction text={phaseText} textGlow={theme.textGlow} />

    </div>
  )
}
