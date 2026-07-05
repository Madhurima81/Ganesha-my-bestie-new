// src/lib/components/coReg/MindfulnessExperience.jsx
// ────────────────────────────────────────────────────
// Diya gaze OR hum together.
// Controlled by variant prop ('diya' | 'hum').
// Diya: dark background, animated flame, silent focus.
// Hum: sound wave bars, child hums along.
import { useState, useEffect, useRef } from 'react'
import useGaneshaVoice from '../../hooks/useGaneshaVoice'

const C = {
  saffron: '#FF9933', deepOrange: '#FF5722',
  gold: '#FFD700', brown: '#5D2E0F',
  softBrown: '#8B4513',
}

export default function MindfulnessExperience({
  childName   = '',
  childAge    = 7,
  variant     = 'diya',
  onComplete  = null,
  onPrintable = null,
}) {
  const { speak, stop } = useGaneshaVoice()
  const [phase, setPhase]       = useState('intro')
  const [timeLeft, setTimeLeft] = useState(60)
  const timerRef = useRef(null)

  const isDiya = variant !== 'hum'

  const start = () => {
    setPhase('active')
    const introText = isDiya
      ? `${childName}, watch the flame. Don't blink. Let your mind go quiet. Just... the flame.`
      : `${childName}, hum with me. Feel the sound in your chest. Ready? Hmmmm...`
    speak(introText, { age: childAge, moment: 'coregulation' })

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setPhase('done')
          speak(
            isDiya
              ? `${childName}. Still. Quiet. That is your power.`
              : `${childName}, feel that? That hum is still in your chest. That is calm.`,
            { age: childAge, moment: 'coregulation' }
          )
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  useEffect(() => () => {
    clearInterval(timerRef.current)
    stop()
  }, [])

  return (
    <div style={{
      minHeight: 'var(--app-height, 100vh)',
      background: isDiya
        ? 'radial-gradient(ellipse at 50% 40%, #1a0a00, #2c1a0e)'
        : 'radial-gradient(ellipse at 50% 30%, #e3f2fd, #bbdefb)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
    }}>
      <style>{`
        @keyframes flameFlicker {
          0%,100%{transform:scaleY(1) scaleX(1);opacity:1}
          25%{transform:scaleY(1.08) scaleX(0.95);opacity:0.95}
          50%{transform:scaleY(0.95) scaleX(1.05);opacity:0.9}
          75%{transform:scaleY(1.05) scaleX(0.98);opacity:0.95}
        }
        @keyframes soundWave {
          0%,100%{transform:scaleY(0.3);opacity:0.4}
          50%{transform:scaleY(1);opacity:1}
        }
        @keyframes coreg-fadeUp {
          from{opacity:0;transform:translateY(8px)}
          to{opacity:1;transform:translateY(0)}
        }
      `}</style>

      {/* INTRO */}
      {phase === 'intro' && (
        <div style={{ animation: 'coreg-fadeUp 0.4s ease', maxWidth: 'clamp(340px, 52vw, 600px)' }}>
          <div style={{ fontSize: 'clamp(3.5rem, 7vw, 6.5rem)', marginBottom: '0.5rem' }}>
            {isDiya ? '🪔' : '🌊'}
          </div>
          <h2 style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: 'clamp(1.5rem, 3vw, 2.6rem)',
            color: isDiya ? C.gold : C.brown,
            margin: '0 0 0.8rem' }}>
            {isDiya ? 'Diya Gaze' : 'Hum Together'}
          </h2>
          <p style={{ fontFamily: 'Nunito, sans-serif',
            color: isDiya ? 'rgba(255,215,0,0.8)' : C.softBrown,
            lineHeight: 1.7, marginBottom: '1.5rem', fontSize: 'clamp(0.95rem, 1.8vw, 1.35rem)' }}>
            {isDiya
              ? `Watch the flame without blinking for as long as you can. Let your mind go completely quiet.`
              : `Hum a long "hmmmm" with Ganesha. Feel the sound vibrate in your chest. That feeling is calm.`
            }
          </p>
          <button onClick={start} style={{
            background: isDiya
              ? `linear-gradient(135deg, #FF8F00, ${C.gold})`
              : `linear-gradient(135deg, ${C.saffron}, ${C.deepOrange})`,
            border: 'none', borderRadius: 999,
            color: isDiya ? C.brown : 'white',
            padding: '0.9rem 2rem',
            fontFamily: 'Baloo 2, cursive', fontWeight: 700,
            fontSize: 'clamp(1.05rem, 2vw, 1.6rem)', cursor: 'pointer',
            minHeight: 'clamp(60px, 8vh, 90px)',
            padding: 'clamp(0.9rem, 2vw, 1.4rem) clamp(2rem, 4vw, 3.5rem)',
          }}>
            {isDiya ? 'Watch the flame 🪔' : "Let's hum 🌊"}
          </button>
        </div>
      )}

      {/* ACTIVE */}
      {phase === 'active' && (
        <div style={{ animation: 'coreg-fadeUp 0.3s ease' }}>
          {isDiya ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 'clamp(6rem, 12vw, 11rem)',
                animation: 'flameFlicker 2s ease-in-out infinite',
                filter: 'drop-shadow(0 0 20px rgba(255,153,51,0.8))',
              }}>🪔</div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center',
              justifyContent: 'center', marginBottom: '1.5rem', height: 80 }}>
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{
                  width: 8, height: 60, borderRadius: 999,
                  background: C.saffron,
                  animation: `soundWave ${0.8 + i * 0.1}s ease-in-out infinite`,
                  animationDelay: `${i * 0.12}s`,
                }} />
              ))}
            </div>
          )}
          <p style={{ fontFamily: 'Nunito, sans-serif',
            color: isDiya ? 'rgba(255,215,0,0.6)' : C.softBrown,
            fontSize: '0.85rem', opacity: 0.7 }}>
            {timeLeft}s
          </p>
          <p style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: '1rem',
            color: isDiya ? C.gold : C.brown,
            marginTop: '0.5rem' }}>
            {isDiya ? 'Just the flame...' : 'Hmmmmm...'}
          </p>
        </div>
      )}

      {/* DONE */}
      {phase === 'done' && (
        <div style={{ animation: 'coreg-fadeUp 0.5s ease', maxWidth: 'clamp(340px, 52vw, 600px)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌸</div>
          <h2 style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: '1.4rem',
            color: isDiya ? C.gold : C.brown,
            margin: '0 0 0.8rem' }}>
            {isDiya ? 'Still. Quiet. Powerful.' : 'Feel that calm.'}
          </h2>
          <div style={{ display: 'flex', gap: '0.6rem',
            justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {['Better 😊', 'A little better 🌸', 'Try another?'].map(opt => (
              <button key={opt} onClick={() => {
                if (opt === 'Try another?') {
                  setPhase('intro')
                  setTimeLeft(60)
                } else {
                  onComplete?.(opt)
                }
              }} style={{
                border: `2px solid ${isDiya ? C.gold : C.saffron}`,
                borderRadius: 999, background: 'white',
                color: C.brown, padding: '0.6rem 1rem',
                fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                fontSize: '0.88rem', cursor: 'pointer',
                minHeight: 60,
              }}>{opt}</button>
            ))}
          </div>
          {onPrintable && (
            <button onClick={() => onPrintable('mindfulness')} style={{
              background: 'none',
              border: `1.5px solid ${isDiya ? C.gold : C.saffron}`,
              borderRadius: 999, color: C.softBrown,
              padding: '0.5rem 1.2rem',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '0.82rem', cursor: 'pointer',
              minHeight: 44,
            }}>
              🖨️ Get Ganesha's Still Moment card
            </button>
          )}
        </div>
      )}
    </div>
  )
}
