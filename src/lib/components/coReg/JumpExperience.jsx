// src/lib/components/coReg/JumpExperience.jsx
// ─────────────────────────────────────────────
// Jump 10 times OR shake it out.
// Controlled by variant prop ('jump' | 'shake').
// Child taps the big button once per jump/shake.
import { useState, useEffect } from 'react'
import useGaneshaVoice from '../../hooks/useGaneshaVoice'

const C = {
  saffron: '#FF9933', deepOrange: '#FF5722',
  gold: '#FFD700', brown: '#5D2E0F',
  softBrown: '#8B4513',
}

const TOTAL = 10

export default function JumpExperience({
  childName   = '',
  childAge    = 7,
  variant     = 'jump',
  onComplete  = null,
  onPrintable = null,
}) {
  const { speak, stop } = useGaneshaVoice()
  const [phase, setPhase]       = useState('intro')
  const [count, setCount]       = useState(0)
  const [bouncing, setBouncing] = useState(false)

  const isShake    = variant === 'shake'
  const label      = isShake ? 'Shake It Out' : "Let's Jump!"
  const emoji      = isShake ? '🤸' : '🦘'
  const instruction = isShake
    ? `Shake your whole body like Mooshika after a bath! Arms, legs, head — everything!`
    : `Jump 10 times with Mooshika! Jump as high as you can!`
  const ganeshLine = isShake
    ? `${childName}, shake shake shake! Like Mooshika after a swim — shake it ALL out!`
    : `${childName}, jump with me! One... two... three... jump!`

  const start = () => {
    setPhase('active')
    setCount(0)
    speak(ganeshLine, { age: childAge, moment: 'encouragement' })
  }

  const handleTap = () => {
    if (phase !== 'active') return
    setBouncing(true)
    setTimeout(() => setBouncing(false), 300)

    const newCount = count + 1
    setCount(newCount)

    if (newCount === 5) {
      speak(`Halfway there ${childName}! Keep going!`,
        { age: childAge, moment: 'encouragement' })
    }

    if (newCount >= TOTAL) {
      setPhase('done')
      speak(
        `${TOTAL} ${isShake ? 'shakes' : 'jumps'}! ${childName}, you shook all those feelings right out! How do you feel now?`,
        { age: childAge, moment: 'celebration' }
      )
    }
  }

  useEffect(() => () => stop(), [])

  return (
    <div style={{
      minHeight: 'var(--app-height, 100vh)',
      background: 'radial-gradient(ellipse, #fff8e1, #ffecb3)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
    }}>
      <style>{`
        @keyframes jumpBounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-24px); }
        }
        @keyframes coreg-fadeUp {
          from{opacity:0;transform:translateY(8px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes mooshikaWiggle {
          0%,100% { transform: rotate(0deg); }
          25%      { transform: rotate(-8deg); }
          75%      { transform: rotate(8deg); }
        }
      `}</style>

      {/* INTRO */}
      {phase === 'intro' && (
        <div style={{ animation: 'coreg-fadeUp 0.4s ease', maxWidth: 'clamp(340px, 52vw, 600px)' }}>
          <div style={{ fontSize: 'clamp(4rem, 8vw, 7rem)', marginBottom: '0.5rem',
            lineHeight: 1,
            animation: isShake
              ? 'mooshikaWiggle 1s ease-in-out infinite'
              : 'jumpBounce 1s ease-in-out infinite' }}>
            {emoji}
          </div>
          <h2 style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: 'clamp(1.5rem, 3vw, 2.6rem)', color: C.brown, margin: '0 0 0.8rem' }}>
            {label}
          </h2>
          <p style={{ fontFamily: 'Nunito, sans-serif',
            color: C.softBrown, lineHeight: 1.7,
            marginBottom: '1.5rem', fontSize: 'clamp(0.95rem, 1.8vw, 1.35rem)',
            maxWidth: 'clamp(300px, 45vw, 500px)', margin: '0 auto 1.5rem' }}>
            {instruction}
          </p>
          <p style={{ fontSize: 'clamp(0.82rem, 1.5vw, 1.1rem)', color: C.softBrown,
            opacity: 0.5, marginBottom: '1rem' }}>
            Tap the button {TOTAL} times as you {isShake ? 'shake' : 'jump'}!
          </p>
          <button onClick={start} style={{
            background: `linear-gradient(135deg, ${C.saffron}, ${C.deepOrange})`,
            border: 'none', borderRadius: 999,
            color: 'white', padding: 'clamp(0.9rem, 2vw, 1.4rem) clamp(2rem, 4vw, 3.5rem)',
            fontFamily: 'Baloo 2, cursive', fontWeight: 700,
            fontSize: 'clamp(1.05rem, 2vw, 1.6rem)', cursor: 'pointer',
            minHeight: 'clamp(60px, 8vh, 90px)',
          }}>
            {isShake ? 'Shake! 🤸' : 'Jump! 🦘'}
          </button>
        </div>
      )}

      {/* ACTIVE */}
      {phase === 'active' && (
        <div style={{ animation: 'coreg-fadeUp 0.3s ease' }}>
          <div style={{
            fontSize: 'clamp(5rem, 10vw, 9rem)', marginBottom: '1rem', lineHeight: 1,
            animation: isShake
              ? 'mooshikaWiggle 0.5s ease-in-out infinite'
              : bouncing ? 'jumpBounce 0.3s ease' : 'jumpBounce 1s ease-in-out infinite',
          }}>🐘</div>

          <button onClick={handleTap} style={{
            width: 'clamp(140px, 22vw, 240px)',
            height: 'clamp(140px, 22vw, 240px)',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.saffron}, ${C.deepOrange})`,
            border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(255,87,34,0.4)',
            transform: bouncing ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.15s',
          }}>
            <span style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>{emoji}</span>
            <span style={{ fontFamily: 'Baloo 2, cursive',
              color: 'white', fontWeight: 700,
              fontSize: 'clamp(0.9rem, 2vw, 1.6rem)' }}>
              TAP!
            </span>
          </button>

          <div style={{ marginTop: '1.2rem' }}>
            <div style={{ fontFamily: 'Baloo 2, cursive',
              fontSize: 'clamp(3rem, 6vw, 5.5rem)', color: C.brown, fontWeight: 800 }}>
              {count}
            </div>
            <div style={{ display: 'flex', gap: 6,
              justifyContent: 'center', marginTop: '0.3rem' }}>
              {Array.from({ length: TOTAL }).map((_, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: i < count ? C.deepOrange : '#ddd',
                  transition: 'background 0.2s',
                }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DONE */}
      {phase === 'done' && (
        <div style={{ animation: 'coreg-fadeUp 0.5s ease', maxWidth: 'clamp(340px, 52vw, 600px)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌟</div>
          <h2 style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: '1.5rem', color: C.brown, margin: '0 0 0.8rem' }}>
            {TOTAL} {isShake ? 'shakes' : 'jumps'}!
          </h2>
          <div style={{ display: 'flex', gap: '0.6rem',
            justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {['Better 😊', 'A little better 🌸', 'Try another?'].map(opt => (
              <button key={opt} onClick={() => {
                if (opt === 'Try another?') {
                  setPhase('intro')
                  setCount(0)
                } else {
                  onComplete?.(opt)
                }
              }} style={{
                border: `2px solid ${C.saffron}`,
                borderRadius: 999, background: 'white',
                color: C.brown, padding: '0.6rem 1rem',
                fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                fontSize: '0.88rem', cursor: 'pointer',
                minHeight: 60,
              }}>{opt}</button>
            ))}
          </div>
          {onPrintable && (
            <button onClick={() => onPrintable('jump')} style={{
              background: 'none', border: `1.5px solid ${C.gold}`,
              borderRadius: 999, color: C.softBrown,
              padding: '0.5rem 1.2rem',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '0.82rem', cursor: 'pointer',
              minHeight: 44,
            }}>
              🖨️ Get Mooshika's Wiggle Card
            </button>
          )}
        </div>
      )}
    </div>
  )
}
