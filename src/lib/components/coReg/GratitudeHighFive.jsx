// src/lib/components/coReg/GratitudeHighFive.jsx
// ─────────────────────────────────────────────────
// 5 fingers. Name one good thing per finger.
// Ganesha celebrates each one.
// For Blue zone — sad, lonely.
import { useState } from 'react'
import useGaneshaVoice from '../../hooks/useGaneshaVoice'

const C = {
  saffron: '#FF9933', deepOrange: '#FF5722',
  gold: '#FFD700', brown: '#5D2E0F',
  softBrown: '#8B4513', lightCream: '#FFF3E0',
}

const GANESHA_REACTIONS = [
  'That one warms my heart!',
  'Yes! That is a good one!',
  'I love that, {name}!',
  'Beautiful. Really.',
  'Five! Your heart is so full, {name}.',
]

const FINGER_PROMPTS = [
  'Name one person you love 💛',
  'Name one thing that makes you smile 😊',
  'Name one place that feels safe 🏡',
  "Name one thing you're good at ⭐",
  'Name one thing that happened today that was okay 🌸',
]

export default function GratitudeHighFive({
  childName   = '',
  childAge    = 7,
  onComplete  = null,
  onPrintable = null,
}) {
  const { speak } = useGaneshaVoice()
  const [phase, setPhase]   = useState('intro')
  const [finger, setFinger] = useState(0)
  const [items, setItems]   = useState([])
  const [input, setInput]   = useState('')

  const start = () => {
    setPhase('active')
    speak(
      `${childName}, let's find five good things. One for each finger. Ready?`,
      { age: childAge, moment: 'encouragement' }
    )
  }

  const submitItem = () => {
    if (!input.trim()) return
    const newItems = [...items, input.trim()]
    setItems(newItems)
    setInput('')

    const reaction = GANESHA_REACTIONS[finger].replace('{name}', childName)
    speak(reaction, { age: childAge, moment: 'celebration' })

    if (finger >= 4) {
      setTimeout(() => {
        setPhase('done')
        speak(
          `Five things, ${childName}. Five real, true, beautiful things. Your heart knew them all along.`,
          { age: childAge, moment: 'closing' }
        )
      }, 1500)
    } else {
      setFinger(f => f + 1)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 30%, #fce4ec, #f8bbd9)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
    }}>
      <style>{`
        @keyframes coreg-fadeUp {
          from{opacity:0;transform:translateY(8px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes gratBob {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-8px)}
        }
      `}</style>

      {/* INTRO */}
      {phase === 'intro' && (
        <div style={{ animation: 'coreg-fadeUp 0.4s ease', maxWidth: 'clamp(340px, 52vw, 600px)' }}>
          <div style={{ fontSize: 'clamp(3.5rem, 7vw, 6.5rem)', marginBottom: '0.5rem',
            animation: 'gratBob 3s ease-in-out infinite' }}>🙏</div>
          <h2 style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: 'clamp(1.5rem, 3vw, 2.6rem)', color: C.brown, margin: '0 0 0.8rem' }}>
            Gratitude High-Five
          </h2>
          <p style={{ fontFamily: 'Nunito, sans-serif',
            color: C.softBrown, lineHeight: 1.7,
            marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {childAge <= 7
              ? `Let's find 5 good things — one for each finger on your hand!`
              : `Research shows naming what you're grateful for shifts your brain from sad to hopeful. Let's try it.`
            }
          </p>
          <button onClick={start} style={{
            background: `linear-gradient(135deg, ${C.saffron}, ${C.deepOrange})`,
            border: 'none', borderRadius: 999,
            color: 'white', padding: '0.9rem 2rem',
            fontFamily: 'Baloo 2, cursive', fontWeight: 700,
            fontSize: 'clamp(1.05rem, 2vw, 1.6rem)', cursor: 'pointer',
            minHeight: 'clamp(60px, 8vh, 90px)',
            padding: 'clamp(0.9rem, 2vw, 1.4rem) clamp(2rem, 4vw, 3.5rem)',
          }}>
            Let's find 5 things 🙏
          </button>
        </div>
      )}

      {/* ACTIVE */}
      {phase === 'active' && (
        <div style={{ animation: 'coreg-fadeUp 0.3s ease', maxWidth: 'clamp(380px, 56vw, 640px)', width: '100%' }}>
          {/* Stars filled per finger */}
          <div style={{ fontSize: '2.5rem', letterSpacing: 4, marginBottom: '1rem' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{
                opacity: i <= finger ? 1 : 0.25,
                transition: 'opacity 0.3s',
              }}>
                {i < finger ? '🌟' : i === finger ? '✋' : '☆'}
              </span>
            ))}
          </div>

          {/* Current prompt */}
          <div style={{
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 20, padding: '1rem', marginBottom: '1rem',
            border: `2px solid rgba(255,215,0,0.5)`,
          }}>
            <p style={{ fontFamily: 'Baloo 2, cursive',
              fontSize: '1.05rem', color: C.brown,
              margin: 0, fontWeight: 700 }}>
              {FINGER_PROMPTS[finger]}
            </p>
          </div>

          {/* Items already named */}
          {items.length > 0 && (
            <div style={{ marginBottom: '0.8rem' }}>
              {items.map((item, i) => (
                <div key={i} style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '0.85rem', color: C.softBrown,
                  opacity: 0.6, marginBottom: '0.2rem',
                }}>
                  {i + 1}. {item}
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitItem()}
            placeholder="Type something..."
            autoFocus
            style={{
              width: '100%', boxSizing: 'border-box',
              border: `2px solid ${C.gold}`,
              borderRadius: 12, padding: '0.8rem',
              fontSize: '1rem', fontFamily: 'Nunito, sans-serif',
              background: C.lightCream, color: C.brown,
              marginBottom: '0.8rem', outline: 'none',
            }}
          />
          <button onClick={submitItem}
            disabled={!input.trim()} style={{
              background: input.trim()
                ? `linear-gradient(135deg, ${C.saffron}, ${C.deepOrange})`
                : '#ddd',
              border: 'none', borderRadius: 999,
              color: 'white', padding: '0.8rem 1.8rem',
              fontFamily: 'Baloo 2, cursive', fontWeight: 700,
              fontSize: '1rem', cursor: input.trim() ? 'pointer' : 'default',
              minHeight: 60,
            }}>
            {finger < 4 ? 'Next finger →' : 'High five! 🙌'}
          </button>
        </div>
      )}

      {/* DONE */}
      {phase === 'done' && (
        <div style={{ animation: 'coreg-fadeUp 0.5s ease', maxWidth: 'clamp(360px, 54vw, 620px)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌟</div>
          <h2 style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: '1.4rem', color: C.brown, margin: '0 0 0.6rem' }}>
            Five good things, {childName}!
          </h2>
          <div style={{
            background: 'rgba(255,255,255,0.85)',
            borderRadius: 20, padding: '1rem', marginBottom: '1.2rem',
            border: `2px solid rgba(255,215,0,0.4)`, textAlign: 'left',
          }}>
            {items.map((item, i) => (
              <div key={i} style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '0.95rem', color: C.brown,
                padding: '0.3rem 0',
                borderBottom: i < 4 ? '1px solid rgba(255,215,0,0.2)' : 'none',
              }}>
                {'🌸⭐💛🌺✨'[i]} {item}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.6rem',
            justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {['Better 😊', 'A little better 🌸'].map(opt => (
              <button key={opt} onClick={() => onComplete?.(opt)} style={{
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
            <button onClick={() => onPrintable('gratitude')} style={{
              background: 'none', border: `1.5px solid ${C.gold}`,
              borderRadius: 999, color: C.softBrown,
              padding: '0.5rem 1.2rem',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '0.82rem', cursor: 'pointer',
              minHeight: 44,
            }}>
              🖨️ Get my Gratitude Hand
            </button>
          )}
        </div>
      )}
    </div>
  )
}
