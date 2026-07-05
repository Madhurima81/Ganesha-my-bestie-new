// src/lib/components/coReg/AffirmationExperience.jsx
// ────────────────────────────────────────────────────
// Words appear one at a time, large + golden.
// Ganesha says each line. Child repeats (age 5-9) or reads silently (10-12).
import { useState } from 'react'
import useGaneshaVoice from '../../hooks/useGaneshaVoice'
import { AFFIRMATIONS } from '../../config/coRegConfig'

const C = {
  saffron: '#FF9933', deepOrange: '#FF5722',
  gold: '#FFD700', brown: '#5D2E0F',
  softBrown: '#8B4513', lightCream: '#FFF3E0',
}

export default function AffirmationExperience({
  childName   = '',
  childAge    = 7,
  feeling     = 'universal',
  onComplete  = null,
  onPrintable = null,
}) {
  const { speak, isSpeaking } = useGaneshaVoice()

  // Pick 3: two universal + one feeling-specific
  const feelingBank = AFFIRMATIONS[feeling] || AFFIRMATIONS.universal
  const pool = [
    ...AFFIRMATIONS.universal.slice(0, 2),
    ...feelingBank.slice(0, 1),
  ]

  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(false)

  const current = pool[index]

  const intro = childAge <= 7
    ? `${childName}, say these words with me. Each one is true about you.`
    : childAge <= 10
    ? `${childName}, these are Ganesha's power words — for you. Say them with me.`
    : `${childName}. These are not just words. Each one is a fact. Read them. Feel them.`

  const speakAffirmation = (i) => {
    if (i >= pool.length) {
      setPhase('done')
      speak(
        `${childName}. Every single one of those is true. Remember that.`,
        { age: childAge, moment: 'closing' }
      )
      return
    }
    setIndex(i)
    setShown(false)
    setTimeout(() => setShown(true), 200)
    if (childAge <= 9) {
      speak(pool[i].text, { age: childAge, moment: 'affirmation' })
    }
  }

  const start = () => {
    setPhase('affirmation')
    setIndex(0)
    speak(intro, {
      age: childAge, moment: 'greeting',
      onEnd: () => speakAffirmation(0),
    })
  }

  const handleNext = () => {
    speakAffirmation(index + 1)
  }

  return (
    <div style={{
      minHeight: 'var(--app-height, 100vh)',
      background: 'radial-gradient(ellipse at 50% 30%, #fffde7, #fff9c4)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
    }}>
      <style>{`
        @keyframes coreg-fadeUp {
          from{opacity:0;transform:translateY(12px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes goldGlow {
          0%,100%{text-shadow:0 0 10px rgba(255,215,0,0.3)}
          50%{text-shadow:0 0 30px rgba(255,215,0,0.8)}
        }
        @keyframes affirmBob {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-8px)}
        }
      `}</style>

      {/* INTRO */}
      {phase === 'intro' && (
        <div style={{ animation: 'coreg-fadeUp 0.4s ease', maxWidth: 'clamp(360px, 54vw, 620px)' }}>
          <div style={{ fontSize: 'clamp(3.5rem, 7vw, 6.5rem)', marginBottom: '0.5rem',
            animation: 'affirmBob 3s ease-in-out infinite' }}>🌟</div>
          <h2 style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: 'clamp(1.5rem, 3vw, 2.6rem)', color: C.brown, margin: '0 0 0.8rem' }}>
            Ganesha's Power Words
          </h2>
          <p style={{ fontFamily: 'Nunito, sans-serif',
            color: C.softBrown, lineHeight: 1.7,
            marginBottom: '1.5rem', fontSize: 'clamp(0.95rem, 1.8vw, 1.35rem)' }}>
            {childAge <= 9
              ? `Say each word with Ganesha — out loud! Your voice makes them real.`
              : `Read each one. Feel it. These are facts, not wishes.`
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
            I'm ready 🌟
          </button>
        </div>
      )}

      {/* AFFIRMATION */}
      {phase === 'affirmation' && current && (
        <div style={{ maxWidth: 'clamp(380px, 56vw, 640px)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem',
            animation: 'affirmBob 2.5s ease-in-out infinite' }}>🐘</div>

          {shown && (
            <div style={{ animation: 'coreg-fadeUp 0.4s ease', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{current.emoji}</div>
              <p style={{
                fontFamily: 'Baloo 2, cursive',
                fontSize: childAge <= 7 ? '1.6rem' : '1.4rem',
                fontWeight: 800, color: C.brown, lineHeight: 1.4,
                animation: 'goldGlow 2s ease-in-out infinite',
              }}>
                {current.text}
              </p>
              {childAge <= 9 && (
                <p style={{ fontFamily: 'Nunito, sans-serif',
                  fontSize: '0.82rem', color: C.softBrown,
                  opacity: 0.5, marginTop: '0.5rem' }}>
                  Say it out loud! 🗣️
                </p>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8,
            justifyContent: 'center', marginBottom: '1.5rem' }}>
            {pool.map((_, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i <= index ? C.gold : '#ddd',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={isSpeaking && childAge <= 9}
            style={{
              background: `linear-gradient(135deg, ${C.saffron}, ${C.deepOrange})`,
              border: 'none', borderRadius: 999,
              color: 'white', padding: '0.8rem 1.8rem',
              fontFamily: 'Baloo 2, cursive', fontWeight: 700,
              fontSize: '1rem', cursor: 'pointer',
              opacity: (isSpeaking && childAge <= 9) ? 0.5 : 1,
              minHeight: 60,
            }}>
            {index < pool.length - 1 ? 'Next →' : 'Done 🌟'}
          </button>
        </div>
      )}

      {/* DONE */}
      {phase === 'done' && (
        <div style={{ animation: 'coreg-fadeUp 0.5s ease', maxWidth: 'clamp(340px, 52vw, 600px)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💛</div>
          <h2 style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: '1.4rem', color: C.brown, margin: '0 0 0.8rem' }}>
            Every word is true, {childName}.
          </h2>
          <div style={{ display: 'flex', gap: '0.6rem',
            justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {['Better 😊', 'A little better 🌸', 'Try another?'].map(opt => (
              <button key={opt} onClick={() => {
                if (opt === 'Try another?') setPhase('intro')
                else onComplete?.(opt)
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
            <button onClick={() => onPrintable('affirmation', current?.text)} style={{
              background: 'none', border: `1.5px solid ${C.gold}`,
              borderRadius: 999, color: C.softBrown,
              padding: '0.5rem 1.2rem',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '0.82rem', cursor: 'pointer',
              minHeight: 44,
            }}>
              🖨️ Get my mirror card
            </button>
          )}
        </div>
      )}
    </div>
  )
}
