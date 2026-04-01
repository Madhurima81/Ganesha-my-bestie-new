// src/lib/components/coReg/GratitudeJar.jsx
// ───────────────────────────────────────────
// Visual modak jar that fills over 7 days.
// Each gratitude check-in adds one modak.
// Full jar → onFull callback (story unlock).
// compact prop for sidebar/hub use.
import { useState, useEffect } from 'react'

const C = {
  saffron: '#FF9933', deepOrange: '#FF5722',
  gold: '#FFD700', brown: '#5D2E0F',
  softBrown: '#8B4513', cream: '#FFF8E7',
  lightCream: '#FFF3E0',
}

const JAR_KEY    = 'gmb_gratitude_jar'
const MAX_MODAKS = 7

// ─── localStorage helpers ─────────────────────────────────────────────────────
const getJarData = () => {
  try {
    return JSON.parse(
      localStorage.getItem(JAR_KEY) ||
      '{"count":0,"items":[],"lastDate":null}'
    )
  } catch {
    return { count: 0, items: [], lastDate: null }
  }
}

const saveJarData = (data) => {
  localStorage.setItem(JAR_KEY, JSON.stringify(data))
}

export const addModakToJar = (gratitudeText) => {
  const jar   = getJarData()
  const today = new Date().toDateString()
  if (jar.lastDate === today) return jar  // one per day
  const newJar = {
    count:    Math.min(jar.count + 1, MAX_MODAKS),
    items:    [...jar.items, { text: gratitudeText, date: today }].slice(-MAX_MODAKS),
    lastDate: today,
  }
  saveJarData(newJar)
  // Notify any mounted GratitudeJar components
  window.dispatchEvent(new Event('gmb_jar_updated'))
  return newJar
}

export const resetJar = () => {
  saveJarData({ count: 0, items: [], lastDate: null })
  window.dispatchEvent(new Event('gmb_jar_updated'))
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GratitudeJar({
  childName = '',
  onFull    = null,
  compact   = false,
}) {
  const [jarData, setJarData] = useState(getJarData)

  const count    = jarData.count
  const isFull   = count >= MAX_MODAKS
  const progress = count / MAX_MODAKS

  // Refresh when another component adds a modak
  useEffect(() => {
    const refresh = () => setJarData(getJarData())
    window.addEventListener('gmb_jar_updated', refresh)
    return () => window.removeEventListener('gmb_jar_updated', refresh)
  }, [])

  // Fire onFull when jar reaches 7
  useEffect(() => {
    if (isFull && onFull) onFull(jarData.items)
  }, [isFull])  // eslint-disable-line react-hooks/exhaustive-deps

  const jarH = compact ? 80  : 140
  const jarW = compact ? 60  : 100
  const modakSize = compact ? '0.9rem' : '1.3rem'

  return (
    <div style={{ textAlign: 'center', padding: compact ? '0.5rem' : '1rem' }}>
      <style>{`
        @keyframes modakPop {
          0%  { transform: scale(0) translateY(10px); opacity: 0; }
          60% { transform: scale(1.2) translateY(-4px); opacity: 1; }
          100%{ transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes jarGlow {
          0%,100%{filter:drop-shadow(0 0 4px rgba(255,215,0,0.3))}
          50%    {filter:drop-shadow(0 0 12px rgba(255,215,0,0.8))}
        }
      `}</style>

      {!compact && (
        <h3 style={{ fontFamily: 'Baloo 2, cursive',
          fontSize: '1rem', color: C.brown, margin: '0 0 0.8rem' }}>
          Gratitude Jar 🍬
        </h3>
      )}

      {/* Jar SVG */}
      <div style={{
        position: 'relative', display: 'inline-block',
        animation: isFull ? 'jarGlow 2s ease-in-out infinite' : 'none',
      }}>
        <svg width={jarW} height={jarH} viewBox="0 0 100 140">
          {/* Body */}
          <rect x="15" y="30" width="70" height="95" rx="12"
            fill="rgba(255,255,255,0.6)" stroke={C.gold} strokeWidth="3" />
          {/* Fill level */}
          <rect
            x="17"
            y={30 + (95 * (1 - progress))}
            width="66"
            height={95 * progress}
            rx="8"
            fill={`rgba(255,153,51,${0.2 + progress * 0.3})`}
            style={{ transition: 'all 0.6s ease' }}
          />
          {/* Lid */}
          <rect x="10" y="20" width="80" height="16" rx="6" fill={C.gold} />
          {/* Shine */}
          <rect x="22" y="35" width="8" height="60" rx="4"
            fill="rgba(255,255,255,0.35)" />
        </svg>

        {/* Modaks inside jar */}
        <div style={{
          position: 'absolute', bottom: 12, left: 0, right: 0,
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'center', gap: 2, padding: '0 12px',
        }}>
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} style={{
              fontSize: modakSize,
              animation: 'modakPop 0.4s ease',
              animationDelay: `${i * 0.05}s`,
            }}>
              🍬
            </span>
          ))}
        </div>
      </div>

      {/* Count + message */}
      <div style={{ marginTop: compact ? '0.3rem' : '0.6rem' }}>
        <p style={{ fontFamily: 'Nunito, sans-serif',
          fontSize: compact ? '0.72rem' : '0.85rem',
          color: C.softBrown, margin: 0 }}>
          {count}/{MAX_MODAKS} modaks
        </p>
        {!compact && (
          <p style={{ fontFamily: 'Nunito, sans-serif',
            fontSize: '0.78rem', color: C.softBrown,
            opacity: 0.6, margin: '0.2rem 0 0' }}>
            {isFull
              ? `🌟 Your story is ready, ${childName}!`
              : `${MAX_MODAKS - count} more to unlock your story`
            }
          </p>
        )}
      </div>

      {/* Unlock button when full */}
      {isFull && !compact && onFull && (
        <button
          onClick={() => onFull(jarData.items)}
          style={{
            marginTop: '0.8rem',
            background: `linear-gradient(135deg, ${C.saffron}, ${C.deepOrange})`,
            border: 'none', borderRadius: 999,
            color: 'white', padding: '0.6rem 1.4rem',
            fontFamily: 'Baloo 2, cursive', fontWeight: 700,
            fontSize: '0.9rem', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255,87,34,0.3)',
            animation: 'jarGlow 2s ease-in-out infinite',
            minHeight: 60,
          }}>
          Read my story 📖
        </button>
      )}
    </div>
  )
}
