// src/lib/components/coReg/CoRegToolkit.jsx
// ────────────────────────────────────────────
// Orchestrator — receives zone + age, picks 3 techniques,
// shows choice tiles, renders selected experience full screen.
//
// Integration points:
//   1. TalkToGanesha — after child shares a feeling
//   2. TimeWithGaneshaHub — "Just Do Something" mode
//   3. Any post-activity moment Ganesha offers it
import { useState } from 'react'
import { selectTechniques } from '../../config/coRegConfig'
import BreathingExperience   from './BreathingExperience'
import ScribbleExperience    from './ScribbleExperience'
import JumpExperience        from './JumpExperience'
import AffirmationExperience from './AffirmationExperience'
import MindfulnessExperience from './MindfulnessExperience'
import GratitudeHighFive     from './GratitudeHighFive'
import PrintableGenerator    from './PrintableGenerator'

const C = {
  saffron: '#FF9933', deepOrange: '#FF5722',
  gold: '#FFD700', brown: '#5D2E0F',
  softBrown: '#8B4513', cream: '#FFF8E7',
}

const COMPONENT_MAP = {
  BreathingExperience,
  ScribbleExperience,
  JumpExperience,
  AffirmationExperience,
  MindfulnessExperience,
  GratitudeHighFive,
}

const RECENT_KEY = 'gmb_recent_techniques'

const getRecentIds = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') }
  catch { return [] }
}

const addToRecent = (id) => {
  const recent = [id, ...getRecentIds()].slice(0, 10)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent))
}

export default function CoRegToolkit({
  zone       = 'Yellow',
  childName  = '',
  childAge   = 7,
  feeling    = 'universal',
  onComplete = null,
  onClose    = null,
}) {
  const [selected, setSelected]         = useState(null)
  const [showPrintable, setShowPrintable] = useState(null)
  const [printableExtra, setPrintableExtra] = useState({})
  const [refreshKey, setRefreshKey]     = useState(0)

  // Pick 3 on every render (refreshKey forces re-pick)
  const options = selectTechniques(zone, childAge, getRecentIds())  // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (technique) => {
    addToRecent(technique.id)
    setSelected(technique)
  }

  const handlePrintable = (techniqueId, extraData = null) => {
    setPrintableExtra(extraData ? { scribbleData: extraData } : {})
    setShowPrintable(techniqueId)
  }

  const handleComplete = (response) => {
    onComplete?.(response)
  }

  const handleShowMore = () => {
    localStorage.removeItem(RECENT_KEY)
    setRefreshKey(k => k + 1)
  }

  // ── Render selected experience full screen ────────────────────────
  if (selected) {
    const ExperienceComponent = COMPONENT_MAP[selected.component]
    if (!ExperienceComponent) return null

    return (
      <>
        <ExperienceComponent
          childName={childName}
          childAge={childAge}
          variant={selected.variant}
          feeling={feeling}
          onComplete={handleComplete}
          onPrintable={handlePrintable}
        />

        {/* Back to picker */}
        <button
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', top: 20, left: 20, zIndex: 100,
            background: 'rgba(255,255,255,0.9)',
            border: 'none', borderRadius: 999,
            padding: 'clamp(0.5rem, 1.2vw, 1rem) clamp(1rem, 2.5vw, 1.8rem)',
            fontFamily: 'Baloo 2, cursive', fontWeight: 700,
            fontSize: 'clamp(0.88rem, 1.6vw, 1.2rem)',
            color: C.brown, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            minHeight: 'clamp(44px, 6vh, 64px)',
          }}>
          ← Other options
        </button>

        {/* Printable modal */}
        {showPrintable && (
          <PrintableGenerator
            techniqueId={showPrintable}
            childName={childName}
            {...printableExtra}
            onClose={() => setShowPrintable(null)}
          />
        )}
      </>
    )
  }

  // ── Technique picker ──────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, #fff9e6, #ffe8b0)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(1.5rem, 4vw, 3rem)',
      textAlign: 'center',
    }}>
      <style>{`
        @keyframes coreg-fadeUp {
          from{opacity:0;transform:translateY(16px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes coregBob {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-10px)}
        }
        .coreg-tile {
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .coreg-tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(139,69,19,0.14) !important;
        }
        .coreg-tile:active {
          transform: scale(0.98);
        }
      `}</style>

      <div style={{
        animation: 'coreg-fadeUp 0.4s ease',
        maxWidth: 'clamp(400px, 56vw, 660px)',
        width: '100%',
      }}>

        {/* Ganesha */}
        <div style={{
          fontSize: 'clamp(4rem, 8vw, 7rem)',
          marginBottom: 'clamp(0.5rem, 1.5vw, 1.2rem)',
          animation: 'coregBob 3s ease-in-out infinite',
          lineHeight: 1,
        }}>🐘</div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'Baloo 2, cursive',
          fontSize: 'clamp(1.6rem, 3.2vw, 2.6rem)',
          color: C.brown,
          margin: '0 0 clamp(0.3rem, 1vw, 0.6rem)',
          lineHeight: 1.2,
        }}>
          Want to do something together?
        </h2>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'Nunito, sans-serif',
          color: C.softBrown,
          fontSize: 'clamp(0.95rem, 1.8vw, 1.35rem)',
          marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
          opacity: 0.8,
        }}>
          Pick one — or ask for more 🌸
        </p>

        {/* 3 technique tiles */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          gap: 'clamp(0.7rem, 1.5vw, 1.2rem)',
          marginBottom: 'clamp(1rem, 2vw, 1.8rem)',
        }}>
          {options.length === 0 ? (
            <p style={{ fontFamily: 'Nunito, sans-serif',
              color: C.softBrown,
              fontSize: 'clamp(0.95rem, 1.8vw, 1.3rem)' }}>
              Let me find something for you...
            </p>
          ) : (
            options.map(t => (
              <button
                key={t.id}
                className="coreg-tile"
                onClick={() => handleSelect(t)}
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  border: `3px solid rgba(255,215,0,0.65)`,
                  borderRadius: 'clamp(20px, 2.5vw, 28px)',
                  padding: 'clamp(1rem, 2.5vw, 1.8rem) clamp(1.2rem, 3vw, 2rem)',
                  cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center',
                  gap: 'clamp(1rem, 2.5vw, 1.8rem)',
                  boxShadow: '0 4px 20px rgba(139,69,19,0.09)',
                  minHeight: 'clamp(80px, 10vh, 120px)',
                  width: '100%',
                }}>
                {/* Emoji */}
                <span style={{
                  fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
                  flexShrink: 0,
                  lineHeight: 1,
                }}>{t.emoji}</span>

                {/* Text */}
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontFamily: 'Baloo 2, cursive',
                    fontSize: 'clamp(1.05rem, 2.2vw, 1.65rem)',
                    fontWeight: 700, color: C.brown,
                    marginBottom: '0.2rem',
                  }}>
                    {t.label}
                  </div>
                  <div style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: 'clamp(0.82rem, 1.6vw, 1.2rem)',
                    color: C.softBrown, opacity: 0.7,
                  }}>
                    {t.description} · {t.duration}s
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Show more */}
        <button
          onClick={handleShowMore}
          style={{
            background: 'none', border: 'none',
            color: C.softBrown, opacity: 0.6,
            fontFamily: 'Nunito, sans-serif',
            fontSize: 'clamp(0.88rem, 1.6vw, 1.15rem)',
            cursor: 'pointer',
            marginBottom: 'clamp(0.4rem, 1vw, 0.8rem)',
            minHeight: 44, padding: '0.5rem 1rem',
          }}>
          Show me different options
        </button>

        {/* Not right now */}
        {onClose && (
          <div>
            <button onClick={onClose} style={{
              background: 'none', border: 'none',
              color: C.softBrown, opacity: 0.4,
              fontFamily: 'Nunito, sans-serif',
              fontSize: 'clamp(0.82rem, 1.4vw, 1.05rem)',
              cursor: 'pointer',
              minHeight: 44, padding: '0.5rem 1rem',
            }}>
              Not right now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
