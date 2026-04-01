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

// ─────────────────────────────────────────────────────────
// ZONE THEME CONFIG
// Each zone has its own bg gradient, particle colour, text colour
// ─────────────────────────────────────────────────────────
const ZONE_THEMES = {
  mountain: {
    bg: 'radial-gradient(ellipse at 60% 40%, #1a2a4a 0%, #0c1624 100%)',
    particleColor: '#ffd87a',
    textGlow: 'rgba(255, 200, 80, 0.3)',
    accentColor: '#ffc845',
    label: 'Symbol Mountain',
  },
  river: {
    bg: 'radial-gradient(ellipse at 40% 60%, #0a2a3a 0%, #051520 100%)',
    particleColor: '#7ae8ff',
    textGlow: 'rgba(100, 220, 255, 0.3)',
    accentColor: '#4dd9f5',
    label: 'Shloka River',
  },
  cave: {
    bg: 'radial-gradient(ellipse at 50% 50%, #1a0a2e 0%, #080410 100%)',
    particleColor: '#c4a8ff',
    textGlow: 'rgba(180, 140, 255, 0.3)',
    accentColor: '#a87fff',
    label: 'Cave of Secrets',
  },
  hut: {
    bg: 'radial-gradient(ellipse at 50% 70%, #2a1a0a 0%, #150c04 100%)',
    particleColor: '#ffb87a',
    textGlow: 'rgba(255, 180, 100, 0.3)',
    accentColor: '#ff9933',
    label: 'About Me Hut',
  },
  forest: {
    bg: 'radial-gradient(ellipse at 40% 40%, #0a2a0a 0%, #041004 100%)',
    particleColor: '#a0f0a0',
    textGlow: 'rgba(100, 220, 100, 0.3)',
    accentColor: '#4caf50',
    label: 'Forest',
  },
  festival: {
    bg: 'radial-gradient(ellipse at 50% 50%, #2a0a1a 0%, #150408 100%)',
    particleColor: '#ffb8e8',
    textGlow: 'rgba(255, 150, 200, 0.3)',
    accentColor: '#e91e63',
    label: 'Festival Square',
  },
}

// ─────────────────────────────────────────────────────────
// FOCUS OBJECT CONFIG
// Maps focus_object_type → visual style + animation
// ─────────────────────────────────────────────────────────
const FOCUS_OBJECTS = {
  breathing_orb: {
    emoji: null,
    shape: 'circle',
    baseColor: '#ffeaa7',
    glowColor: 'rgba(255, 220, 120, 0.8)',
    size: 140,
  },
  star_light: {
    emoji: '✦',
    shape: 'circle',
    baseColor: '#ffffff',
    glowColor: 'rgba(255, 255, 200, 0.7)',
    size: 100,
  },
  stone_block: {
    emoji: '🪨',
    shape: 'circle',
    baseColor: '#a0856a',
    glowColor: 'rgba(180, 140, 100, 0.6)',
    size: 130,
  },
  glowing_footsteps: {
    emoji: '👣',
    shape: 'circle',
    baseColor: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.6)',
    size: 110,
  },
  aura_circle: {
    emoji: '☀',
    shape: 'circle',
    baseColor: '#ffcc00',
    glowColor: 'rgba(255, 200, 0, 0.8)',
    size: 150,
  },
  sound_ripple: {
    emoji: '◎',
    shape: 'circle',
    baseColor: '#7ae8ff',
    glowColor: 'rgba(100, 220, 255, 0.7)',
    size: 120,
  },
  colour_cloud: {
    emoji: '☁',
    shape: 'circle',
    baseColor: '#d4a8ff',
    glowColor: 'rgba(200, 150, 255, 0.7)',
    size: 140,
  },
  mouse_light: {
    emoji: '🐭',
    shape: 'circle',
    baseColor: '#ffb87a',
    glowColor: 'rgba(255, 180, 100, 0.7)',
    size: 110,
  },
  heart_glow_ember: {
    emoji: '❤',
    shape: 'circle',
    baseColor: '#ff6b6b',
    glowColor: 'rgba(255, 100, 100, 0.7)',
    size: 120,
  },
}

// ─────────────────────────────────────────────────────────
// PHASE ANIMATION STATES
// Maps phase name → CSS animation class behaviour
// ─────────────────────────────────────────────────────────
const PHASE_ANIMATIONS = {
  arrival:       { scale: [0.9, 1.0],  glowIntensity: 'low',    speed: 'slow'   },
  settle:        { scale: [0.95, 1.05], glowIntensity: 'medium', speed: 'slow'   },
  release:       { scale: [0.85, 1.2],  glowIntensity: 'high',   speed: 'medium' },
  affirmation:   { scale: [1.03, 1.08], glowIntensity: 'high',   speed: 'gentle' },
  symbol_moment: { scale: [1.0, 1.15],  glowIntensity: 'pulse',  speed: 'slow'   },
  completion:    { scale: [1.0, 1.05],  glowIntensity: 'low',    speed: 'slow'   },
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

function FocusObject({ focusType, animPhase, accentColor }) {
  const config = FOCUS_OBJECTS[focusType] || FOCUS_OBJECTS.breathing_orb
  const anim   = PHASE_ANIMATIONS[animPhase] || PHASE_ANIMATIONS.settle

  const animName =
    anim.glowIntensity === 'pulse'  ? 'gmb-symbol-pulse' :
    anim.glowIntensity === 'high'   ? 'gmb-breathe-big'  :
    anim.glowIntensity === 'medium' ? 'gmb-breathe-med'  :
    'gmb-breathe-soft'

  const animDuration =
    anim.speed === 'medium' ? '3s' :
    anim.speed === 'gentle' ? '5s' :
    '4s'

  return (
    <div style={{
      width:        config.size,
      height:       config.size,
      borderRadius: '50%',
      background:   `radial-gradient(circle at 40% 35%, ${config.baseColor}, ${accentColor || config.baseColor})`,
      boxShadow:    `0 0 40px ${config.glowColor}, 0 0 80px ${config.glowColor}`,
      display:      'flex',
      alignItems:   'center',
      justifyContent: 'center',
      fontSize:     config.size * 0.35,
      animation:    `${animName} ${animDuration} ease-in-out infinite`,
      cursor:       'default',
      userSelect:   'none',
    }}>
      {config.emoji && <span style={{ filter: 'drop-shadow(0 0 8px white)' }}>{config.emoji}</span>}
    </div>
  )
}

function PhaseProgress({ total, current, accentColor }) {
  return (
    <div style={{
      position:       'absolute',
      top:            '6%',
      left:           '50%',
      transform:      'translateX(-50%)',
      display:        'flex',
      gap:            10,
      alignItems:     'center',
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width:        i <= current ? 12 : 8,
          height:       i <= current ? 12 : 8,
          borderRadius: '50%',
          background:   i <= current ? accentColor : 'rgba(255,255,255,0.25)',
          boxShadow:    i <= current ? `0 0 10px ${accentColor}` : 'none',
          transition:   'all 0.4s ease',
        }} />
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
    <div style={{
      position:        'absolute',
      bottom:          '10%',
      left:            '50%',
      transform:       'translateX(-50%)',
      width:           'min(85%, 420px)',
      padding:         '16px 28px',
      borderRadius:    30,
      background:      'rgba(255,255,255,0.12)',
      backdropFilter:  'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border:          '1px solid rgba(255,255,255,0.18)',
      color:           '#ffffff',
      fontFamily:      'Nunito, sans-serif',
      fontSize:        'clamp(16px, 4vw, 22px)',
      fontWeight:      600,
      textAlign:       'center',
      lineHeight:      1.5,
      boxShadow:       `0 4px 30px ${textGlow}`,
      opacity:         visible ? 1 : 0,
      transform:       visible
        ? 'translateX(-50%) translateY(0)'
        : 'translateX(-50%) translateY(10px)',
      transition:      'opacity 0.8s ease, transform 0.8s ease',
    }}>
      {text}
    </div>
  )
}

function ParticleLayer({ particleColor }) {
  return (
    <div style={{
      position:   'absolute',
      inset:      0,
      pointerEvents: 'none',
      overflow:   'hidden',
    }}>
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{
          position:     'absolute',
          width:        i % 3 === 0 ? 3 : 2,
          height:       i % 3 === 0 ? 3 : 2,
          borderRadius: '50%',
          background:   particleColor,
          opacity:      0.3 + (i % 4) * 0.1,
          left:         `${(i * 8.3) % 100}%`,
          top:          `${(i * 13.7) % 100}%`,
          animation:    `gmb-particle-float ${20 + i * 3}s linear infinite`,
          animationDelay: `${i * 1.5}s`,
        }} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// KEYFRAMES — injected once into document head
// ─────────────────────────────────────────────────────────
function injectKeyframes() {
  if (document.getElementById('gmb-experience-keyframes')) return
  const style = document.createElement('style')
  style.id = 'gmb-experience-keyframes'
  style.textContent = `
    @keyframes gmb-breathe-soft {
      0%,100% { transform: scale(0.95); filter: brightness(0.9); }
      50%      { transform: scale(1.05); filter: brightness(1.1); }
    }
    @keyframes gmb-breathe-med {
      0%,100% { transform: scale(0.92); filter: brightness(0.85); }
      50%      { transform: scale(1.12); filter: brightness(1.2); }
    }
    @keyframes gmb-breathe-big {
      0%,100% { transform: scale(0.85); filter: brightness(0.8); }
      50%      { transform: scale(1.2);  filter: brightness(1.3); }
    }
    @keyframes gmb-symbol-pulse {
      0%,100% { transform: scale(1.0);  filter: hue-rotate(0deg)   brightness(1.0); }
      33%      { transform: scale(1.08); filter: hue-rotate(20deg)  brightness(1.2); }
      66%      { transform: scale(1.12); filter: hue-rotate(-20deg) brightness(1.1); }
    }
    @keyframes gmb-bg-drift {
      0%,100% { transform: scale(1)    translateY(0px);  }
      50%      { transform: scale(1.03) translateY(-8px); }
    }
    @keyframes gmb-particle-float {
      from { transform: translateY(0)    opacity(0.4); }
      to   { transform: translateY(-120px) opacity(0); }
    }
    @keyframes gmb-fade-in {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1);    }
    }
    @keyframes gmb-fade-out {
      from { opacity: 1; }
      to   { opacity: 0; }
    }
  `
  document.head.appendChild(style)
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

  const [phaseIndex,  setPhaseIndex]  = useState(0)
  const [isPaused,    setIsPaused]    = useState(false)
  const [isExiting,   setIsExiting]   = useState(false)
  const [isMuted,     setIsMuted]     = useState(!soundEnabled)
  const timerRef = useRef(null)

  // Inject CSS keyframes once
  useEffect(() => { injectKeyframes() }, [])

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

  // Last phase reached → call onComplete after brief pause
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

  const handlePause = useCallback(() => {
    setIsPaused(p => !p)
  }, [])

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
    <div style={{
      position:   'relative',
      width:      '100%',
      height:     '100dvh',
      overflow:   'hidden',
      background: theme.bg,
      display:    'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Nunito, sans-serif',
      animation:  isExiting ? 'gmb-fade-out 0.4s ease forwards' : 'gmb-fade-in 0.6s ease',
    }}>

      {/* Background slow drift */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: theme.bg,
        animation:  'gmb-bg-drift 40s ease-in-out infinite',
        opacity:    0.6,
        zIndex:     0,
      }} />

      {/* Particles */}
      <ParticleLayer particleColor={theme.particleColor} />

      {/* Phase progress dots */}
      <PhaseProgress
        total={totalPhases}
        current={phaseIndex}
        accentColor={theme.accentColor}
      />

      {/* Back button */}
      <button
        onClick={handleExit}
        style={{
          position:   'absolute',
          top:        '5%',
          left:       '5%',
          background: 'rgba(255,255,255,0.15)',
          border:     '1px solid rgba(255,255,255,0.25)',
          borderRadius: 20,
          color:      'white',
          fontFamily: 'Nunito, sans-serif',
          fontSize:   14,
          padding:    '6px 14px',
          cursor:     'pointer',
          zIndex:     10,
          minWidth:   44,
          minHeight:  44,
          display:    'flex',
          alignItems: 'center',
          gap:        6,
        }}
      >
        ← Back
      </button>

      {/* Sound + Pause + Replay controls */}
      <div style={{
        position:   'absolute',
        top:        '5%',
        right:      '5%',
        display:    'flex',
        gap:        8,
        zIndex:     10,
      }}>
        {[
          { label: isMuted ? '🔇' : '🔊', onClick: () => setIsMuted(m => !m), title: 'Sound' },
          { label: isPaused ? '▶' : '⏸',  onClick: handlePause,               title: isPaused ? 'Resume' : 'Pause' },
          { label: '↺',                    onClick: handleReplay,              title: 'Replay' },
        ].map(btn => (
          <button key={btn.label} onClick={btn.onClick} title={btn.title} style={{
            background:   'rgba(255,255,255,0.15)',
            border:       '1px solid rgba(255,255,255,0.25)',
            borderRadius: '50%',
            width:        40,
            height:       40,
            color:        'white',
            fontSize:     16,
            cursor:       'pointer',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
          }}>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Focus object — centre of screen */}
      <div style={{ position: 'relative', zIndex: 5 }}>
        <FocusObject
          focusType={focusType}
          animPhase={phaseName}
          accentColor={theme.accentColor}
        />
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <div style={{
          position:   'absolute',
          top:        '50%',
          left:       '50%',
          transform:  'translate(-50%, -180px)',
          color:      'rgba(255,255,255,0.6)',
          fontFamily: 'Nunito, sans-serif',
          fontSize:   13,
          letterSpacing: 1,
        }}>
          PAUSED
        </div>
      )}

      {/* Phase instruction text */}
      <PhaseInstruction text={phaseText} textGlow={theme.textGlow} />

    </div>
  )
}
