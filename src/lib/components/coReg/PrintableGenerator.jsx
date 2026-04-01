// src/lib/components/coReg/PrintableGenerator.jsx
// ─────────────────────────────────────────────────
// Generates a printable card for any co-reg activity.
// Opens browser print dialog.
// Child's name on every card.
import { useRef } from 'react'
import { PRINTABLES } from '../../config/coRegConfig'

const C = {
  saffron: '#FF9933', deepOrange: '#FF5722',
  gold: '#FFD700', brown: '#5D2E0F',
  softBrown: '#8B4513', cream: '#FFF8E7',
  lightCream: '#FFF3E0',
}

export default function PrintableGenerator({
  techniqueId  = 'breathing',
  childName    = '',
  affirmation  = '',
  scribbleData = null,
  onClose      = null,
}) {
  const printRef = useRef(null)
  const data = PRINTABLES[techniqueId] || PRINTABLES.breathing

  const handlePrint = () => {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
      <head>
        <title>${data.title} — ${childName}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@600;700&display=swap" rel="stylesheet">
        <style>
          body {
            margin: 0; padding: 40px;
            display: flex; align-items: center; justify-content: center;
            min-height: 100vh; background: #FFF8E7;
            font-family: Nunito, sans-serif;
          }
          .card {
            border: 3px solid #FFD700; border-radius: 24px;
            padding: 40px; max-width: 480px; width: 100%;
            text-align: center; background: white;
            box-shadow: 0 8px 32px rgba(139,69,19,0.1);
          }
          .emoji { font-size: 4rem; margin-bottom: 12px; display: block; }
          .title {
            font-family: 'Baloo 2', cursive; font-size: 1.8rem;
            font-weight: 800; color: #5D2E0F; margin: 0 0 8px;
          }
          .child-name { font-size: 1.1rem; color: #FF9933; font-weight: 700; margin-bottom: 12px; }
          .subtitle { font-size: 0.95rem; color: #8B4513; margin-bottom: 16px; line-height: 1.6; }
          .instruction {
            background: #FFF3E0; border-radius: 12px; padding: 12px;
            font-size: 0.9rem; color: #5D2E0F; font-weight: 600;
          }
          .affirmation-text {
            font-family: 'Baloo 2', cursive; font-size: 1.4rem;
            font-weight: 800; color: #5D2E0F; margin: 16px 0; line-height: 1.4;
          }
          .scribble-img {
            width: 100%; border-radius: 12px; margin: 16px 0;
            border: 2px solid #FFD700;
          }
          .footer { margin-top: 20px; font-size: 0.75rem; color: #8B4513; opacity: 0.5; }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 300, padding: '1.5rem',
    }}>
      <div style={{
        background: 'white', borderRadius: 24,
        padding: '1.8rem', maxWidth: 420, width: '100%',
        boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <h3 style={{ fontFamily: 'Baloo 2, cursive',
          fontSize: '1.2rem', color: C.brown,
          margin: '0 0 1rem', textAlign: 'center' }}>
          Your printable card 🖨️
        </h3>

        {/* Preview — also used as print content */}
        <div ref={printRef}>
          <div className="card" style={{
            border: `3px solid ${C.gold}`, borderRadius: 20,
            padding: '1.5rem', textAlign: 'center',
            background: C.cream, marginBottom: '1rem',
          }}>
            <span className="emoji">{data.emoji}</span>
            <h2 className="title" style={{ fontFamily: 'Baloo 2, cursive',
              fontSize: '1.3rem', color: C.brown, margin: '0 0 0.3rem' }}>
              {data.title}
            </h2>
            <p className="child-name" style={{ color: C.saffron,
              fontWeight: 700, fontSize: '0.95rem', margin: '0 0 0.5rem' }}>
              {childName}'s card
            </p>
            <p className="subtitle" style={{ color: C.softBrown,
              fontSize: '0.88rem', marginBottom: '0.8rem', lineHeight: 1.6 }}>
              {data.subtitle}
            </p>
            {affirmation && (
              <p className="affirmation-text" style={{ fontFamily: 'Baloo 2, cursive',
                fontSize: '1.1rem', fontWeight: 800, color: C.brown,
                margin: '0.8rem 0', lineHeight: 1.4 }}>
                "{affirmation}"
              </p>
            )}
            {scribbleData && (
              <img src={scribbleData} alt="My feelings art"
                style={{ width: '100%', borderRadius: 12,
                  margin: '0.8rem 0', border: `2px solid ${C.gold}` }}
              />
            )}
            <div className="instruction" style={{
              background: C.lightCream, borderRadius: 12,
              padding: '0.7rem', fontSize: '0.85rem',
              color: C.brown, fontWeight: 600,
            }}>
              {data.instruction}
            </div>
            <p className="footer" style={{ fontSize: '0.7rem',
              color: C.softBrown, opacity: 0.4,
              marginTop: '1rem', marginBottom: 0 }}>
              🐘 Ganesha My Bestie
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center' }}>
          {onClose && (
            <button onClick={onClose} style={{
              border: `2px solid ${C.saffron}`, borderRadius: 999,
              background: 'white', color: C.brown, padding: '0.7rem 1.3rem',
              fontFamily: 'Baloo 2, cursive', fontWeight: 700,
              fontSize: '0.9rem', cursor: 'pointer', minHeight: 60,
            }}>
              Cancel
            </button>
          )}
          <button onClick={handlePrint} style={{
            background: `linear-gradient(135deg, ${C.saffron}, ${C.deepOrange})`,
            border: 'none', borderRadius: 999,
            color: 'white', padding: '0.7rem 1.5rem',
            fontFamily: 'Baloo 2, cursive', fontWeight: 700,
            fontSize: '0.9rem', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255,87,34,0.3)',
            minHeight: 60,
          }}>
            🖨️ Print it!
          </button>
        </div>
      </div>
    </div>
  )
}
