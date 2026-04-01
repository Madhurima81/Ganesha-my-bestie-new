// src/lib/components/dashboard/WeeklyCard.jsx
// ─────────────────────────────────────────────────────────────
// WhatsApp-ready shareable weekly story card.
// Generated as canvas image (800×900). Native share sheet.

import { useRef, useEffect } from 'react'
import { getWeekLabel, toStrengthLanguage }
  from '../../utils/dashboardData'

const C = {
  saffron:    '#FF9933',
  deepOrange: '#FF5722',
  gold:       '#FFD700',
  brown:      '#5D2E0F',
  softBrown:  '#8B4513',
  cream:      '#FFF8E7',
}

export default function WeeklyCard({
  childName      = '',
  storyData      = null,
  gratitudeItems = [],
  topStrength    = null,
  dareStreak     = 0,
  onClose        = null,
}) {
  const canvasRef  = useRef(null)
  const previewRef = useRef(null)

  const weekLabel = storyData?.weekOf || getWeekLabel()

  const gratitudeText = gratitudeItems
    .slice(-5)
    .map(i => i.text || i)
    .join(', ')

  const strengthText = topStrength
    ? `${childName} ${toStrengthLanguage(
        topStrength[0], topStrength[1])}.`
    : `${childName} had a beautiful week.`

  const storyText = storyData?.summary ||
    `This week ${childName} was grateful for ${gratitudeText}. ${strengthText} With love from Ganesha. 🐘`

  // ── Draw canvas card ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    canvas.width  = 800
    canvas.height = 900

    // Background
    const grad = ctx.createLinearGradient(0, 0, 800, 900)
    grad.addColorStop(0, '#FFF8E7')
    grad.addColorStop(1, '#FFF3E0')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 800, 900)

    // Outer border
    ctx.strokeStyle = C.gold
    ctx.lineWidth   = 8
    roundRect(ctx, 20, 20, 760, 860, 32)
    ctx.stroke()

    // Inner accent line
    ctx.strokeStyle = 'rgba(255,215,0,0.3)'
    ctx.lineWidth   = 3
    roundRect(ctx, 32, 32, 736, 836, 24)
    ctx.stroke()

    // Header gradient bar
    const headerGrad = ctx.createLinearGradient(40, 0, 760, 0)
    headerGrad.addColorStop(0, C.saffron)
    headerGrad.addColorStop(1, C.deepOrange)
    ctx.fillStyle = headerGrad
    roundRectFill(ctx, 40, 40, 720, 100, 20)

    // App name
    ctx.fillStyle  = 'white'
    ctx.font       = 'bold 28px sans-serif'
    ctx.textAlign  = 'center'
    ctx.fillText('🐘 Ganesha My Bestie', 400, 85)

    // Large Ganesha emoji
    ctx.font = '80px sans-serif'
    ctx.fillText('🐘', 400, 215)

    // Child name heading
    ctx.fillStyle = C.brown
    ctx.font      = 'bold 44px sans-serif'
    ctx.fillText(`${childName}'s Week`, 400, 290)

    // Week label
    ctx.fillStyle = C.softBrown
    ctx.font      = '24px sans-serif'
    ctx.fillText(weekLabel, 400, 325)

    // Divider
    ctx.strokeStyle = 'rgba(255,215,0,0.5)'
    ctx.lineWidth   = 2
    ctx.beginPath()
    ctx.moveTo(80, 350)
    ctx.lineTo(720, 350)
    ctx.stroke()

    // Story text (wrapped)
    ctx.fillStyle = C.brown
    ctx.font      = '22px sans-serif'
    ctx.textAlign = 'center'
    wrapText(ctx, storyText, 400, 395, 620, 34)

    // Second divider
    ctx.strokeStyle = 'rgba(255,215,0,0.5)'
    ctx.lineWidth   = 2
    ctx.beginPath()
    ctx.moveTo(80, 680)
    ctx.lineTo(720, 680)
    ctx.stroke()

    // Stats row
    ctx.font      = 'bold 20px sans-serif'
    ctx.fillStyle = C.saffron
    ctx.textAlign = 'center'
    ctx.fillText(`🎯 ${dareStreak} day dare streak`, 200, 720)
    ctx.fillText(`🍬 ${gratitudeItems.length} gratitudes`, 600, 720)

    // Strength line
    if (topStrength) {
      ctx.fillStyle = '#6A1B9A'
      ctx.font      = '20px sans-serif'
      ctx.fillText(`🌟 Strength: ${topStrength[0]}`, 400, 760)
    }

    // Footer
    ctx.fillStyle = 'rgba(92,46,15,0.3)'
    ctx.font      = '18px sans-serif'
    ctx.fillText(
      'Shared with love from Ganesha My Bestie 🐘💛',
      400, 840)

    // Set preview image
    if (previewRef.current) {
      previewRef.current.src = canvas.toDataURL('image/png')
    }
  }, [childName, storyText, dareStreak, topStrength, weekLabel])

  // ── Share / download ────────────────────────────────────────
  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(async (blob) => {
      const file = new File(
        [blob],
        `${childName}-ganesha-week.png`,
        { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `${childName}'s week with Ganesha`,
            text:  storyText,
            files: [file],
          })
        } catch (_) {
          // user cancelled — no error needed
        }
      } else {
        // fallback — download
        const url = URL.createObjectURL(blob)
        const a   = document.createElement('a')
        a.href     = url
        a.download = `${childName}-ganesha-week.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    }, 'image/png')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      {/* Hidden canvas — only for generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{
        background: 'white', borderRadius: 24,
        padding: '1.5rem',
        maxWidth: 420, width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <h3 style={{
          fontFamily: 'Baloo 2, cursive',
          fontSize: '1.1rem', color: C.brown,
          margin: '0 0 0.8rem', textAlign: 'center',
        }}>
          {childName}'s Week — {weekLabel}
        </h3>

        {/* Preview image */}
        <img
          ref={previewRef}
          alt="Weekly card preview"
          style={{
            width: '100%', borderRadius: 16,
            border: `2px solid rgba(255,215,0,0.4)`,
            marginBottom: '1rem',
          }}
        />

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center' }}>
          {onClose && (
            <button onClick={onClose} style={{
              border: `2px solid ${C.gold}`,
              borderRadius: 999, background: 'white',
              color: C.brown, padding: '0.7rem 1.3rem',
              fontFamily: 'Baloo 2, cursive',
              fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer',
            }}>
              Close
            </button>
          )}
          <button onClick={handleShare} style={{
            background: `linear-gradient(135deg, ${C.saffron}, ${C.deepOrange})`,
            border: 'none', borderRadius: 999,
            color: 'white', padding: '0.7rem 1.5rem',
            fontFamily: 'Baloo 2, cursive',
            fontWeight: 700, fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255,87,34,0.3)',
          }}>
            📤 Share on WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Canvas helpers ────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function roundRectFill(ctx, x, y, w, h, r) {
  roundRect(ctx, x, y, w, h, r)
  ctx.fill()
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line    = ''
  let currentY = y

  words.forEach((word, i) => {
    const testLine = line + word + ' '
    const metrics  = ctx.measureText(testLine)
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY)
      line     = word + ' '
      currentY += lineHeight
    } else {
      line = testLine
    }
  })
  ctx.fillText(line, x, currentY)
}
