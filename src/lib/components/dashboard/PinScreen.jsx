// src/lib/components/dashboard/PinScreen.jsx
// ─────────────────────────────────────────────────────────────
// 4-digit PIN entry + first-time setup.
// First visit: creates PIN. Returning: verifies PIN.

import { useState } from 'react'
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

  const currentInput = step === 'confirm' ? confirm : pin
  const digits       = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫']

  return (
    <div style={{
      minHeight: 'var(--app-height, 100vh)',
      background: C.cream,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
    }}>
      <style>{`
        @keyframes shake {
          0%,100%{ transform:translateX(0) }
          20%    { transform:translateX(-8px) }
          40%    { transform:translateX(8px) }
          60%    { transform:translateX(-6px) }
          80%    { transform:translateX(6px) }
        }
      `}</style>

      {/* Lock icon */}
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>

      <h2 style={{
        fontFamily: 'Baloo 2, cursive',
        fontSize: '1.4rem', color: C.brown,
        margin: '0 0 0.4rem',
      }}>
        {step === 'create'  ? 'Create Parent PIN' :
         step === 'confirm' ? 'Confirm PIN'        :
                              'Parent Dashboard'}
      </h2>

      <p style={{
        fontFamily: 'Nunito, sans-serif',
        color: C.softBrown, fontSize: '0.88rem',
        marginBottom: '1.5rem', opacity: 0.7,
      }}>
        {step === 'create'  ? 'Choose a 4-digit PIN'           :
         step === 'confirm' ? 'Enter it again to confirm'      :
                              'Enter your PIN to continue'}
      </p>

      {/* PIN dots */}
      <div style={{
        display: 'flex', gap: '0.8rem',
        marginBottom: '1.5rem',
        animation: shake ? 'shake 0.5s ease' : 'none',
      }}>
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
      {error && (
        <p style={{
          fontFamily: 'Nunito, sans-serif',
          color: C.red, fontSize: '0.85rem',
          marginBottom: '1rem',
        }}>
          {error}
        </p>
      )}

      {/* Numpad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.7rem', maxWidth: 240,
      }}>
        {digits.map((d, i) => (
          <button
            key={i}
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

      <p style={{
        fontFamily: 'Nunito, sans-serif',
        fontSize: '0.72rem', color: C.softBrown,
        opacity: 0.4, marginTop: '1.5rem',
      }}>
        🔒 For parents only
      </p>
    </div>
  )
}
