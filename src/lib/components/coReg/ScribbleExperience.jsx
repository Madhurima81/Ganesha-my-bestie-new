// src/lib/components/coReg/ScribbleExperience.jsx
// ─────────────────────────────────────────────────
// Art therapy scribble canvas.
// Colours shift with drawing speed.
// For Red zone only — anger, overwhelm.
// Timer: 60 seconds.
import { useState, useRef, useEffect } from 'react'
import useGaneshaVoice from '../../hooks/useGaneshaVoice'

const C = {
  saffron: '#FF9933', deepOrange: '#FF5722',
  gold: '#FFD700', brown: '#5D2E0F',
  softBrown: '#8B4513', cream: '#FFF8E7',
}

const getColourFromSpeed = (speed) => {
  if (speed > 15) return '#FF5722'
  if (speed > 8)  return '#FF9933'
  if (speed > 3)  return '#FFD700'
  return '#A5D6A7'
}

export default function ScribbleExperience({
  childName   = '',
  childAge    = 7,
  onComplete  = null,
  onPrintable = null,
}) {
  const { speak, stop } = useGaneshaVoice()
  const canvasRef  = useRef(null)
  const isDrawing  = useRef(false)
  const lastPos    = useRef({ x: 0, y: 0 })
  const lastTime   = useRef(Date.now())
  const timerRef   = useRef(null)

  const [phase, setPhase]       = useState('intro')
  const [timeLeft, setTimeLeft] = useState(60)
  const [hasDrawn, setHasDrawn] = useState(false)

  const endScribble = () => {
    setPhase('done')
    speak(
      `Look at all those feelings. You got them OUT. How brave, ${childName}.`,
      { age: childAge, moment: 'coregulation' }
    )
  }

  const startScribble = () => {
    setPhase('scribbling')
    speak(
      `${childName}, scribble ALL the big feelings out! No rules — just move and let it ALL go!`,
      { age: childAge, moment: 'coregulation' }
    )
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          endScribble()
          return 0
        }
        if (t === 30) {
          speak('Yes! More! Let it all out!', { age: childAge, moment: 'encouragement' })
        }
        return t - 1
      })
    }, 1000)
  }

  const getPos = (e, canvas) => {
    const rect  = canvas.getBoundingClientRect()
    const touch = e.touches?.[0] || e
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top)  * (canvas.height / rect.height),
    }
  }

  const startDraw = (e) => {
    if (phase !== 'scribbling') return
    isDrawing.current = true
    lastPos.current   = getPos(e, canvasRef.current)
    lastTime.current  = Date.now()
    setHasDrawn(true)
  }

  const draw = (e) => {
    if (!isDrawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const pos    = getPos(e, canvas)
    const now    = Date.now()
    const dt     = now - lastTime.current
    const dx     = pos.x - lastPos.current.x
    const dy     = pos.y - lastPos.current.y
    const speed  = Math.sqrt(dx * dx + dy * dy) / (dt || 1) * 100

    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = getColourFromSpeed(speed)
    ctx.lineWidth   = Math.max(3, Math.min(12, speed * 0.8))
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.stroke()

    lastPos.current  = pos
    lastTime.current = now
  }

  const endDraw = () => { isDrawing.current = false }

  useEffect(() => () => {
    clearInterval(timerRef.current)
    stop()
  }, [])

  const saveScribble = () => {
    const dataUrl = canvasRef.current?.toDataURL('image/png')
    onPrintable?.('scribble', dataUrl)
  }

  const resetCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d')
    ctx?.clearRect(0, 0, 460, 380)
  }

  return (
    <div style={{
      minHeight: 'var(--app-height, 100vh)',
      background: 'radial-gradient(ellipse at 50% 30%, #fff3e0, #ffe0b2)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', textAlign: 'center',
    }}>
      <style>{`
        @keyframes coreg-fadeUp {
          from{opacity:0;transform:translateY(8px)}
          to{opacity:1;transform:translateY(0)}
        }
      `}</style>

      {/* INTRO */}
      {phase === 'intro' && (
        <div style={{ animation: 'coreg-fadeUp 0.4s ease', maxWidth: 'clamp(360px, 54vw, 620px)' }}>
          <div style={{ fontSize: 'clamp(3.5rem, 7vw, 6.5rem)', marginBottom: '0.5rem', lineHeight: 1 }}>🎨</div>
          <h2 style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: 'clamp(1.5rem, 3vw, 2.6rem)', color: C.brown, margin: '0 0 0.8rem' }}>
            Scribble It Out
          </h2>
          <p style={{ fontFamily: 'Nunito, sans-serif',
            color: C.softBrown, lineHeight: 1.7,
            marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {childAge <= 7
              ? 'No rules! Just scribble ALL the big feelings out. Move fast, move slow — anything goes!'
              : 'Art therapy in action. The faster you draw, the hotter the colours. Let every feeling out on the canvas.'
            }
          </p>
          <p style={{ fontSize: '0.82rem', color: C.softBrown,
            opacity: 0.5, marginBottom: '1rem' }}>
            60 seconds. No rules. No wrong way.
          </p>
          <button onClick={startScribble} style={{
            background: `linear-gradient(135deg, ${C.saffron}, ${C.deepOrange})`,
            border: 'none', borderRadius: 999,
            color: 'white', padding: '0.9rem 2rem',
            fontFamily: 'Baloo 2, cursive', fontWeight: 700,
            fontSize: 'clamp(1.05rem, 2vw, 1.6rem)', cursor: 'pointer',
            minHeight: 'clamp(60px, 8vh, 90px)',
            padding: 'clamp(0.9rem, 2vw, 1.4rem) clamp(2rem, 4vw, 3.5rem)',
          }}>
            Let's scribble! 🎨
          </button>
        </div>
      )}

      {/* SCRIBBLING */}
      {phase === 'scribbling' && (
        <div style={{ width: '100%', maxWidth: 500, animation: 'coreg-fadeUp 0.3s ease' }}>
          <div style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: '1.1rem', color: C.brown,
            marginBottom: '0.5rem', opacity: 0.6 }}>
            {timeLeft}s — go!
          </div>
          <canvas
            ref={canvasRef}
            width={460} height={380}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
            style={{
              borderRadius: 20, background: 'white',
              boxShadow: '0 8px 32px rgba(139,69,19,0.15)',
              cursor: 'crosshair', touchAction: 'none',
              width: '100%',
              border: `2.5px solid rgba(255,215,0,0.5)`,
            }}
          />
          {!hasDrawn && (
            <p style={{ fontFamily: 'Nunito, sans-serif',
              color: C.softBrown, opacity: 0.4,
              fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Draw anywhere ↑
            </p>
          )}
        </div>
      )}

      {/* DONE */}
      {phase === 'done' && (
        <div style={{ animation: 'coreg-fadeUp 0.5s ease', maxWidth: 'clamp(400px, 58vw, 680px)', width: '100%' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌸</div>
          <h2 style={{ fontFamily: 'Baloo 2, cursive',
            fontSize: '1.4rem', color: C.brown, margin: '0 0 0.8rem' }}>
            Look at all those feelings!
          </h2>
          <canvas ref={canvasRef} width={460} height={240}
            style={{ borderRadius: 16, width: '100%',
              opacity: 0.8, marginBottom: '1rem',
              border: `2px solid rgba(255,215,0,0.4)` }}
          />
          <div style={{ display: 'flex', gap: '0.6rem',
            justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {['Better 😊', 'A little better 🌸', 'Try another?'].map(opt => (
              <button key={opt} onClick={() => {
                if (opt === 'Try another?') {
                  setPhase('intro')
                  setTimeLeft(60)
                  setHasDrawn(false)
                  resetCanvas()
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
            <button onClick={saveScribble} style={{
              background: 'none', border: `1.5px solid ${C.gold}`,
              borderRadius: 999, color: C.softBrown,
              padding: '0.5rem 1.2rem',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '0.82rem', cursor: 'pointer',
              minHeight: 44,
            }}>
              🖨️ Save my feelings art
            </button>
          )}
        </div>
      )}
    </div>
  )
}
