// src/lib/components/coReg/BreathingExperience.jsx
// ─────────────────────────────────────────────────
// Belly breathing with Ganesha's belly animating.
// 3 rounds. Counted visually + voice guided.
// Ends with feeling check + printable offer.
import { useState, useEffect, useRef } from 'react'
import useGaneshaVoice from '../../hooks/useGaneshaVoice'

const C = {
  saffron: '#FF9933', deepOrange: '#FF5722',
  gold: '#FFD700', brown: '#5D2E0F',
  softBrown: '#8B4513', cream: '#FFF8E7',
  lightCream: '#FFF3E0', green: '#2E7D32',
}

const BREATH_PHASE_DURATION = {
  in:   4000,
  hold: 2000,
  out:  4000,
  rest: 1000,
}

const TOTAL_ROUNDS = 3

const getIntro = (name, age) => {
  if (age <= 7)
    return `${name}, let's breathe together — just like my big belly goes up and down!`
  if (age <= 10)
    return `${name}, belly breathing calms your whole body. Follow my belly — in... and out.`
  return `${name}, diaphragmatic breathing activates your calm system. Follow my lead — 4 counts in, 4 out.`
}

export default function BreathingExperience({
  childName  = '',
  childAge   = 7,
  onComplete = null,
  onPrintable = null,
}) {
  const { speak, stop } = useGaneshaVoice()
  const [phase, setPhase]           = useState('intro')
  const [breathPhase, setBreathPhase] = useState('in')
  const [round, setRound]           = useState(1)
  const [bellSize, setBellSize]     = useState(120)
  const timeoutsRef = useRef([])

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(id => clearTimeout(id))
    timeoutsRef.current = []
  }

  const addTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay)
    timeoutsRef.current.push(id)
    return id
  }

  const runRound = (currentRound) => {
    if (currentRound > TOTAL_ROUNDS) {
      setPhase('done')
      speak(
        `Well done ${childName}. Feel how calm your body is now. You did that.`,
        { age: childAge, moment: 'coregulation' }
      )
      return
    }

    setRound(currentRound)

    setBreathPhase('in')
    setBellSize(160)
    speak('Breathe in...', { age: childAge, moment: 'coregulation' })

    addTimeout(() => {
      setBreathPhase('hold')
      speak('Hold...', { age: childAge, moment: 'coregulation' })

      addTimeout(() => {
        setBreathPhase('out')
        setBellSize(120)
        speak('Breathe out...', { age: childAge, moment: 'coregulation' })

        addTimeout(() => {
          setBreathPhase('rest')
          addTimeout(() => runRound(currentRound + 1), BREATH_PHASE_DURATION.rest)
        }, BREATH_PHASE_DURATION.out)
      }, BREATH_PHASE_DURATION.hold)
    }, BREATH_PHASE_DURATION.in)
  }

  const startBreathing = () => {
    setPhase('breathing')
    speak('Breathe in...', { age: childAge, moment: 'coregulation' })
    runRound(1)
  }

  useEffect(() => () => {
    clearAllTimeouts()
    stop()
  }, [])

  const phaseLabels = {
    in:   'Breathe in... 🌬️',
    hold: 'Hold... ✨',
    out:  'Breathe out... 💨',
    rest: '...',
  }

  return (
    <div style={{
      minHeight: 'var(--app-height, 100vh)',
      background: 'radial-gradient(ellipse at 50% 30%, #e8f5e9, #c8e6c9)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
    }}>
      <style>{`
        @keyframes bellyBreathe {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.12); }
        }
        @keyframes coreg-fadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes breathCircle {
          0%   { transform: scale(0.85); opacity: 0.6; }
          50%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.85); opacity: 0.6; }
        }
      `}</style>

      {/* INTRO */}
      {phase === 'intro' && (
        <div style={{ animation: 'coreg-fadeUp 0.4s ease', maxWidth: 360 }}>
          <div style={{ fontSize: 'clamp(4rem, 8vw, 7rem)', marginBottom: '0.5rem',
            animation: 'bellyBreathe 3s ease-in-out infinite', lineHeight: 1 }}>
            🐘
          </div>
          <h2 style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: 'clamp(1.5rem, 3vw, 2.6rem)', color: C.brown, margin: '0 0 0.8rem' }}>
            Belly Breathing
          </h2>
          <p style={{ fontFamily: 'Nunito, sans-serif',
            color: C.softBrown, lineHeight: 1.7,
            marginBottom: '1.5rem', fontSize: 'clamp(0.98rem, 1.8vw, 1.35rem)',
            maxWidth: 'clamp(300px, 45vw, 520px)', margin: '0 auto 1.5rem' }}>
            {getIntro(childName, childAge)}
          </p>
          <div style={{
            width: 'clamp(80px, 12vw, 130px)', height: 'clamp(80px, 12vw, 130px)',
            borderRadius: '50%',
            border: `3px solid ${C.saffron}`,
            margin: '0 auto 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'breathCircle 4s ease-in-out infinite',
            background: 'rgba(255,153,51,0.1)',
          }}>
            <span style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>🫁</span>
          </div>
          <button onClick={startBreathing} style={{
            background: `linear-gradient(135deg, ${C.saffron}, ${C.deepOrange})`,
            border: 'none', borderRadius: 999,
            color: 'white', padding: 'clamp(0.9rem, 2vw, 1.4rem) clamp(2rem, 4vw, 3.5rem)',
            fontFamily: 'Baloo 2, cursive', fontWeight: 700,
            fontSize: 'clamp(1.05rem, 2vw, 1.6rem)', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(255,87,34,0.3)',
            minHeight: 'clamp(60px, 8vh, 90px)',
          }}>
            Let's breathe together 🐘
          </button>
        </div>
      )}

      {/* BREATHING */}
      {phase === 'breathing' && (
        <div style={{ animation: 'coreg-fadeUp 0.3s ease' }}>
          <div style={{
            width: bellSize, height: bellSize, borderRadius: '50%',
            background: `radial-gradient(circle, ${C.saffron}, ${C.deepOrange})`,
            margin: '0 auto 1.5rem',
            transition: 'width 4s ease-in-out, height 4s ease-in-out',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 30px rgba(255,153,51,0.4)`,
          }}>
            <span style={{ fontSize: '3rem' }}>🐘</span>
          </div>
          <h2 style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', color: C.brown, margin: '0 0 0.5rem' }}>
            {phaseLabels[breathPhase]}
          </h2>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: '1rem' }}>
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: '50%',
                background: i < round ? C.saffron : '#ddd',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          <p style={{ fontFamily: 'Nunito, sans-serif',
            color: C.softBrown, opacity: 0.6,
            fontSize: '0.85rem', marginTop: '0.8rem' }}>
            Round {round} of {TOTAL_ROUNDS}
          </p>
        </div>
      )}

      {/* DONE */}
      {phase === 'done' && (
        <div style={{ animation: 'coreg-fadeUp 0.5s ease', maxWidth: 360 }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌸</div>
          <h2 style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', color: C.brown, margin: '0 0 0.6rem' }}>
            How do you feel now?
          </h2>
          <div style={{ display: 'flex', gap: 'clamp(0.5rem, 1.5vw, 1rem)',
            justifyContent: 'center', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            {['Better 😊', 'A little better 🌸', 'Try another?'].map(opt => (
              <button key={opt} onClick={() => {
                if (opt === 'Try another?') {
                  clearAllTimeouts()
                  setPhase('intro')
                  setRound(1)
                  setBellSize(120)
                } else {
                  onComplete?.(opt)
                }
              }} style={{
                border: `2px solid ${C.saffron}`,
                borderRadius: 999, background: 'white',
                color: C.brown, padding: 'clamp(0.6rem, 1.5vw, 1rem) clamp(1rem, 2.5vw, 1.8rem)',
                fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                fontSize: 'clamp(0.9rem, 1.8vw, 1.3rem)', cursor: 'pointer',
                minHeight: 'clamp(60px, 8vh, 80px)',
              }}>{opt}</button>
            ))}
          </div>
          {onPrintable && (
            <button onClick={() => onPrintable('breathing')} style={{
              background: 'none', border: `1.5px solid ${C.gold}`,
              borderRadius: 999, color: C.softBrown,
              padding: '0.5rem 1.2rem',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '0.82rem', cursor: 'pointer',
              minHeight: 44,
            }}>
              🖨️ Get Ganesha's Breathing Card
            </button>
          )}
        </div>
      )}
    </div>
  )
}
