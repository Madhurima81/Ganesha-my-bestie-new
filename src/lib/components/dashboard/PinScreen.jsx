// src/lib/components/dashboard/PinScreen.jsx
// ─────────────────────────────────────────────────────────────
// 4-digit PIN entry + first-time setup.
// First visit: creates PIN. Returning: verifies PIN.

import { useEffect, useRef, useState } from 'react'
import { isPinSet, setPin, verifyPin } from '../../utils/dashboardData'

const C = {
  saffron:    '#FF9933',
  deepOrange: '#FF5722',
  gold:       '#FFD700',
  brown:      '#5D2E0F',
  softBrown:  '#8B4513',
  cream:      '#FFF8E7',
  lightCream: '#FFF3E0',
  red:        '#D32F2F',
}

export default function PinScreen({ onSuccess }) {
  const isSetup = !isPinSet()

  const [pin,     setPin_]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [step,    setStep]    = useState(isSetup ? 'create' : 'enter')
  const [error,   setError]   = useState('')
  const [shake,   setShake]   = useState(false)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleDigit = (d) => {
    setError('')

    if (step === 'create') {
      if (pin.length < 4) {
        const next = pin + d
        setPin_(next)
        if (next.length === 4) setStep('confirm')
      }

    } else if (step === 'confirm') {
      if (confirm.length < 4) {
        const next = confirm + d
        setConfirm(next)
        if (next.length === 4) {
          if (next === pin) {
            setPin(pin)   // persists to localStorage
            onSuccess()
          } else {
            setError("PINs don't match. Try again.")
            triggerShake()
            setPin_('')
            setConfirm('')
            setStep('create')
          }
        }
      }

    } else {
      // enter mode
      if (pin.length < 4) {
        const next = pin + d
        setPin_(next)
        if (next.length === 4) {
          if (verifyPin(next)) {
            onSuccess()
          } else {
            setError('Wrong PIN. Try again.')
            triggerShake()
            setPin_('')
          }
        }
      }
    }
  }

  const handleDelete = () => {
    setError('')
    if (step === 'confirm') setConfirm(c => c.slice(0, -1))
    else                     setPin_(p => p.slice(0, -1))
  }

  // Hardware keyboard: 0-9 (top row or number pad) = a digit, Backspace/Delete = remove one. Goes through
  // the same handlers as the on-screen keypad (read via a ref so the listener is added once). Ignored
  // with Ctrl/Cmd/Alt held and while typing in a text field.
  const keyHandlersRef = useRef({})
  keyHandlersRef.current = { handleDigit, handleDelete }
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault()
        keyHandlersRef.current.handleDigit(event.key)
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()
        keyHandlersRef.current.handleDelete()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const currentInput = step === 'confirm' ? confirm : pin
  const digits       = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫']

  return (
    <div
      className="pin-screen"
      style={{
        minHeight: 'var(--app-height, 100vh)',
        background: C.cream,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem', textAlign: 'center',
      }}
    >
      <style>{`
        @keyframes shake {
          0%,100%{ transform:translateX(0) }
          20%    { transform:translateX(-8px) }
          40%    { transform:translateX(8px) }
          60%    { transform:translateX(-6px) }
          80%    { transform:translateX(6px) }
        }
        /* Parent PIN — short landscape phone only */
        @media (orientation: landscape) and (max-height: 500px) and (max-width: 1023px) {
          .pin-screen {
            box-sizing: border-box;
            min-height: 100dvh !important;
            height: 100dvh;
            display: grid !important;
            grid-template-columns: minmax(220px, 260px) 210px;
            align-items: center !important;
            justify-content: center !important;
            column-gap: 44px;
            padding:
              max(10px, env(safe-area-inset-top))
              max(18px, env(safe-area-inset-right))
              max(10px, env(safe-area-inset-bottom))
              max(18px, env(safe-area-inset-left)) !important;
            overflow: hidden;
          }
          .pin-screen__info {
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .pin-screen__lock { font-size: 2.1rem !important; margin-bottom: 6px !important; }
          .pin-screen__title { font-size: 1.25rem !important; line-height: 1.05; margin-bottom: 4px !important; }
          .pin-screen__subtitle { font-size: 0.82rem !important; line-height: 1.2; margin-bottom: 14px !important; }
          .pin-screen__dots { gap: 9px !important; margin-bottom: 8px !important; }
          .pin-screen__error-space {
            min-height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .pin-screen__error { margin: 0 !important; font-size: 0.76rem !important; line-height: 1.15; }
          .pin-screen__parents-only { margin-top: 8px !important; font-size: 0.68rem !important; }
          .pin-screen__keypad {
            width: 210px !important;
            max-width: none !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 6px !important;
          }
          .pin-screen__key {
            height: 50px !important;
            min-height: 50px;
            border-radius: 11px !important;
            font-size: 1.08rem !important;
          }
        }
      `}</style>

      <div className="pin-screen__info">
        {/* Lock icon */}
        <div
          className="pin-screen__lock"
          style={{ fontSize: '3rem', marginBottom: '1rem' }}
        >🔒</div>

        <h2
          className="pin-screen__title"
          style={{
            fontFamily: 'Baloo 2, cursive',
            fontSize: '1.4rem', color: C.brown,
            margin: '0 0 0.4rem',
          }}
        >
          {step === 'create'  ? 'Create Parent PIN' :
           step === 'confirm' ? 'Confirm PIN'        :
                                'Parent Dashboard'}
        </h2>

        <p
          className="pin-screen__subtitle"
          style={{
            fontFamily: 'Nunito, sans-serif',
            color: C.softBrown, fontSize: '0.88rem',
            marginBottom: '1.5rem', opacity: 0.7,
          }}
        >
          {step === 'create'  ? 'Choose a 4-digit PIN'           :
           step === 'confirm' ? 'Enter it again to confirm'      :
                                'Enter your PIN to continue'}
        </p>

        {/* PIN dots */}
        <div
          className="pin-screen__dots"
          style={{
            display: 'flex', gap: '0.8rem',
            marginBottom: '1.5rem',
            animation: shake ? 'shake 0.5s ease' : 'none',
          }}
        >
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 16, height: 16,
              borderRadius: '50%',
              background: i < currentInput.length
                ? C.deepOrange : 'transparent',
              border: `2.5px solid ${
                i < currentInput.length ? C.deepOrange : C.softBrown}`,
              transition: 'all 0.15s',
            }} />
          ))}
        </div>

        {/* Error */}
        <div className="pin-screen__error-space">
          {error && (
            <p
              className="pin-screen__error"
              style={{
                fontFamily: 'Nunito, sans-serif',
                color: C.red, fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              {error}
            </p>
          )}
        </div>

        <p
          className="pin-screen__parents-only"
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '0.72rem', color: C.softBrown,
            opacity: 0.4, marginTop: '1.5rem',
          }}
        >
          🔒 For parents only
        </p>
      </div>

      {/* Numpad */}
      <div
        className="pin-screen__keypad"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.7rem', maxWidth: 240,
        }}
      >
        {digits.map((d, i) => (
          <button
            key={i}
            className="pin-screen__key"
            onClick={() => {
              if (d === '⌫')    handleDelete()
              else if (d !== '') handleDigit(String(d))
            }}
            disabled={d === ''}
            style={{
              height: 60, borderRadius: 14,
              border: `2px solid ${
                d === '' ? 'transparent' : C.gold}`,
              background: d === '' ? 'transparent'
                : d === '⌫' ? C.lightCream : 'white',
              fontFamily: 'Baloo 2, cursive',
              fontSize: '1.3rem', fontWeight: 700,
              color: C.brown,
              cursor: d === '' ? 'default' : 'pointer',
              boxShadow: d === '' ? 'none'
                : '0 2px 8px rgba(139,69,19,0.1)',
            }}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}
