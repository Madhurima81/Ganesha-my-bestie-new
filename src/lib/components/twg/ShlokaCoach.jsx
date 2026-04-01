// src/lib/components/twg/ShlokaCoach.jsx
// ───────────────────────────────────────
// 3-layer pronunciation coach.
// Layer 1: Web Speech transcription + match score
// Layer 2: Hardcoded tier responses (free, instant)
// Layer 3: Claude API after 3 fails (specific syllable tip)
//
// Props:
//   shlokaId    → 'vakratunda-mahakaya' | 'sarvakaryeshu-sarvada'
//   childName   → from localStorage
//   childAge    → from localStorage
//   onComplete  → callback when child succeeds
//   onClose     → close/back navigation

import { useState, useRef, useEffect } from 'react'
import useGaneshaVoice from '../../hooks/useGaneshaVoice'
import {
  calculateMatchScore,
  scoreToTier,
  findWeakWord,
} from '../../utils/shlokaMatchScore'
import {
  getTierResponse,
  getCompleteMessage,
} from '../../config/pronunciationResponses'

// ─── Shloka data ─────────────────────────────────────────────────
const SHLOKAS = {
  'vakratunda-mahakaya': {
    display:    'Vakratunda Mahakaya',
    devanagari: 'वक्रतुण्ड महाकाय',
    correct:    'vakratunda mahakaya',
    meaning:    'The one with the curved trunk and mighty body',
    audioFile:  '/audio/voicenew/vakratunda-mahakaya.mp3',
    syllables:  ['Vak', 'ra', 'tun', 'da', 'Ma', 'haa', 'kaa', 'ya'],
  },
  'sarvakaryeshu-sarvada': {
    display:    'Sarvakaryeshu Sarvada',
    devanagari: 'सर्वकार्येषु सर्वदा',
    correct:    'sarvakaryeshu sarvada',
    meaning:    'Always successful in everything',
    audioFile:  '/audio/voicenew/sarvakaryeshu-sarvada.mp3',
    syllables:  ['Sar', 'va', 'kar', 'ye', 'shu', 'Sar', 'va', 'da'],
  },
}

// ─── Shloka River theme colors ───────────────────────────────────
const C = {
  teal:       '#4A9B87',
  darkTeal:   '#1B4D3E',
  lightTeal:  '#5FBEA8',
  cream:      '#FFF8E7',
  lightCream: '#FFF3E0',
  gold:       '#FFD700',
  saffron:    '#FF9933',
  deepOrange: '#FF5722',
  green:      '#2E7D32',
  brown:      '#5D3A1A',
  softBrown:  '#8B5E3C',
}

// ─── Attempt tracker ─────────────────────────────────────────────
const useAttemptTracker = () => {
  const failsRef = useRef(0)
  const reset    = () => { failsRef.current = 0 }
  const addFail  = () => { failsRef.current += 1 }
  const getFails = () => failsRef.current
  return { reset, addFail, getFails }
}

// ─── Streak helpers ──────────────────────────────────────────────
const STREAK_KEY = 'gmb_shloka_streak'
const STREAK_DATE_KEY = 'gmb_shloka_streak_date'

const getStreak = () => parseInt(localStorage.getItem(STREAK_KEY) || '0', 10)

const recordStreakToday = () => {
  const today = new Date().toISOString().split('T')[0]
  const last  = localStorage.getItem(STREAK_DATE_KEY)
  if (last === today) return getStreak() // already recorded today

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const streak = last === yesterday ? getStreak() + 1 : 1
  localStorage.setItem(STREAK_KEY, String(streak))
  localStorage.setItem(STREAK_DATE_KEY, today)
  return streak
}

export default function ShlokaCoach({
  shlokaId  = 'vakratunda-mahakaya',
  childName = '',
  childAge  = 7,
  onComplete = null,
  onClose    = null,
}) {
  const shloka = SHLOKAS[shlokaId]
  const { speak, stop, isSpeaking } = useGaneshaVoice()
  const { reset, addFail, getFails } = useAttemptTracker()

  const [phase, setPhase]             = useState('intro')
  // phases: intro → listen → recording → feedback →
  //         api_loading → api_feedback → complete

  const [transcript, setTranscript]   = useState('')
  const [score, setScore]             = useState(null)
  const [tier, setTier]               = useState(null)
  const [feedback, setFeedback]       = useState('')
  const [isListening, setIsListening] = useState(false)
  const [attempts, setAttempts]       = useState(0)
  const [streakCount, setStreakCount] = useState(0)
  const [isMuted, setIsMuted]         = useState(false)

  const recognitionRef = useRef(null)

  // Cleanup speech on unmount
  useEffect(() => () => stop(), [stop])

  // ─── Speak with mute guard ──────────────────────────────────────
  const safeSpeak = (text, opts = {}) => {
    if (isMuted) {
      opts.onEnd?.()
      return
    }
    speak(text, opts)
  }

  // ─── Play pre-recorded shloka ───────────────────────────────────
  const playCorrectAudio = () => {
    const audio = new Audio(shloka.audioFile)
    audio.play().catch(() => {
      // Fallback: Web Speech reads it slowly
      safeSpeak(shloka.display, { age: childAge, moment: 'shloka' })
    })
  }

  // ─── Start listening ────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert('Voice input not supported — please try on iOS Safari or Chrome')
      return
    }

    const rec = new SR()
    rec.lang = 'en-IN'
    rec.interimResults = false
    rec.maxAlternatives = 3

    rec.onstart = () => setIsListening(true)

    rec.onresult = (e) => {
      // Try all alternatives — pick the one with the best match score
      let bestTranscript = ''
      let bestScore = 0

      for (let i = 0; i < e.results[0].length; i++) {
        const t = e.results[0][i].transcript
        const s = calculateMatchScore(t, shloka.correct)
        if (s > bestScore) {
          bestScore = s
          bestTranscript = t
        }
      }

      setTranscript(bestTranscript)
      setIsListening(false)
      processAttempt(bestTranscript)
    }

    rec.onerror = () => setIsListening(false)
    rec.onend   = () => setIsListening(false)

    recognitionRef.current = rec
    rec.start()
    setPhase('recording')
  }

  // ─── Process attempt ────────────────────────────────────────────
  const processAttempt = (spokenText) => {
    setAttempts(a => a + 1)
    const matchScore = calculateMatchScore(spokenText, shloka.correct)
    const matchTier  = scoreToTier(matchScore)

    setScore(matchScore)
    setTier(matchTier)
    setPhase('feedback')

    if (matchTier === 'perfect') {
      // Success path
      reset()
      const newStreak = recordStreakToday()
      setStreakCount(newStreak)
      const msg = getCompleteMessage(shlokaId, childName)
      setFeedback(msg)
      safeSpeak(msg, {
        age: childAge,
        moment: 'celebration',
        onEnd: () => setPhase('complete'),
      })

    } else if (matchTier === 'try_again' || matchTier === 'getting_there') {
      addFail()

      if (getFails() >= 3) {
        // Layer 3 — Claude API
        const loadMsg = getTierResponse(shlokaId, 'api_loading', childName)
        setFeedback(loadMsg)
        safeSpeak(loadMsg, {
          age: childAge,
          moment: 'thinking',
          onEnd: () => callClaudeForHelp(spokenText),
        })
      } else {
        // Layer 2
        const msg = getTierResponse(shlokaId, matchTier, childName)
        setFeedback(msg)
        safeSpeak(msg, {
          age: childAge,
          moment: 'encouragement',
          onEnd: () => setPhase('listen'),
        })
      }

    } else {
      // close tier — Layer 2
      const msg = getTierResponse(shlokaId, matchTier, childName)
      setFeedback(msg)
      safeSpeak(msg, {
        age: childAge,
        moment: 'encouragement',
        onEnd: () => setPhase('listen'),
      })
    }
  }

  // ─── Layer 3 — Claude API ───────────────────────────────────────
  const callClaudeForHelp = async (spokenText) => {
    setPhase('api_loading')
    const weakWord = findWeakWord(spokenText, shloka.correct)

    const system = `You are Ganesha — warm, wise, gently funny. You are helping ${childName} (age ${childAge}) pronounce "${shloka.display}" correctly. The child said: "${spokenText}" The correct pronunciation is: "${shloka.display}" The syllables are: ${shloka.syllables.join(' — ')} ${weakWord ? `The hardest part for them seems to be: "${weakWord.correct}" (they said "${weakWord.spoken}")` : ''} Give ONE specific tip to fix the hardest part. Use a physical or sensory memory hook (like "make your mouth round like a modak"). Keep it under 40 words. Warm, encouraging, specific. Do NOT start with "I". Plain text only. No emojis.`

    const apiKey   = import.meta.env.VITE_ANTHROPIC_API_KEY
    const keyIsReal = apiKey && apiKey.startsWith('sk-ant-')

    if (!keyIsReal) {
      // Dev/demo fallback — no API key
      const fallback =
        `Try saying each part separately — ${shloka.syllables.slice(0, 4).join('... ')} — then put them together, ${childName}.`
      setFeedback(fallback)
      safeSpeak(fallback, {
        age: childAge,
        moment: 'encouragement',
        onEnd: () => setPhase('listen'),
      })
      setPhase('api_feedback')
      reset()
      return
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 100,
          system,
          messages: [{
            role: 'user',
            content: `Help me say ${shloka.display} correctly.`,
          }],
        }),
      })

      if (!res.ok) throw new Error(`API ${res.status}`)

      const data = await res.json()
      const tip = data.content?.[0]?.text ||
        `Try saying each part separately — ${shloka.syllables.slice(0, 4).join('... ')}`

      setFeedback(tip)
      setPhase('api_feedback')
      reset()

      safeSpeak(tip, {
        age: childAge,
        moment: 'encouragement',
        onEnd: () => setPhase('listen'),
      })

    } catch {
      const fallback =
        `Let us try together, ${childName}. ` +
        `Follow me: ${shloka.syllables.join('... ')}`
      setFeedback(fallback)
      safeSpeak(fallback, {
        age: childAge,
        moment: 'encouragement',
        onEnd: () => setPhase('listen'),
      })
      setPhase('api_feedback')
    }
  }

  // ─── Streak message ─────────────────────────────────────────────
  const getStreakMessage = () => {
    if (streakCount >= 3)
      return `Three days in a row, ${childName}. You are a shloka keeper now.`
    return null
  }

  // ─── Render ─────────────────────────────────────────────────────
  return (
    // Modal overlay — same pattern as TalkToGanesha
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.55)',
      padding: '1.5rem',
      animation: 'scFadeIn 0.22s ease-out',
    }}>
      <style>{`
        @keyframes scFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scPopIn {
          from { transform: scale(0.88); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        @keyframes scBob {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes scPulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes scFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* Card */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 440,
        background: 'linear-gradient(160deg, #E8F5E9 0%, #C8E6C9 100%)',
        borderRadius: 32,
        padding: '1.8rem 1.8rem 2rem',
        boxShadow: '0 16px 48px rgba(27,77,62,0.22), 0 4px 16px rgba(0,0,0,0.12)',
        animation: 'scPopIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        fontFamily: 'Nunito, sans-serif',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>

        {/* Header row — close + mute */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: 'none',
                borderRadius: 999,
                padding: '0.4rem 0.9rem',
                fontFamily: 'Baloo 2, cursive',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: C.darkTeal,
                cursor: 'pointer',
                minHeight: 36,
                minWidth: 60,
              }}
            >
              Back
            </button>
          )}
          <button
            onClick={() => { setIsMuted(m => !m); stop() }}
            style={{
              background: 'rgba(255,255,255,0.7)',
              border: 'none',
              borderRadius: 999,
              padding: '0.4rem 0.7rem',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '1rem',
              cursor: 'pointer',
              minHeight: 36,
              minWidth: 36,
              marginLeft: 'auto',
            }}
            aria-label={isMuted ? 'Unmute Ganesha' : 'Mute Ganesha'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Shloka display */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1.2rem',
          animation: 'scFadeUp 0.4s ease',
        }}>
          <div style={{
            fontFamily: 'Baloo 2, cursive',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: C.darkTeal,
            marginBottom: '0.25rem',
          }}>
            {shloka.display}
          </div>
          <div style={{
            fontSize: '1rem',
            color: C.teal,
            opacity: 0.8,
            marginBottom: '0.25rem',
            fontFamily: 'Nunito, sans-serif',
          }}>
            {shloka.devanagari}
          </div>
          <div style={{
            fontSize: '0.8rem',
            color: C.softBrown,
            fontStyle: 'italic',
            opacity: 0.6,
          }}>
            "{shloka.meaning}"
          </div>
        </div>

        {/* Inner card */}
        <div style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(12px)',
          borderRadius: 24,
          padding: '1.5rem',
          boxShadow: '0 8px 24px rgba(74,155,135,0.12)',
          border: `2px solid rgba(95,190,168,0.35)`,
        }}>

          {/* ── INTRO ── */}
          {phase === 'intro' && (
            <div style={{ textAlign: 'center', animation: 'scFadeUp 0.4s ease' }}>
              <div style={{ fontSize: '2.8rem', marginBottom: '0.6rem', animation: 'scBob 3s ease-in-out infinite' }}>
                🐘
              </div>
              <p style={{ color: C.darkTeal, fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1rem' }}>
                {childAge <= 7
                  ? `Let's learn how to say this magical word together!`
                  : `You're about to say something priests have chanted for 2,000 years.`
                }
              </p>

              {/* Syllable chips */}
              <div style={{
                display: 'flex', gap: '0.35rem', justifyContent: 'center',
                flexWrap: 'wrap', marginBottom: '1.2rem',
              }}>
                {shloka.syllables.map((s, i) => (
                  <span key={i} style={{
                    background: '#E8F5E9',
                    border: `1.5px solid ${C.teal}`,
                    borderRadius: 999,
                    padding: '0.25rem 0.65rem',
                    fontFamily: 'Baloo 2, cursive',
                    fontSize: '0.85rem',
                    color: C.darkTeal,
                    fontWeight: 700,
                  }}>
                    {s}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                  onClick={playCorrectAudio}
                  style={{
                    border: `2px solid ${C.teal}`,
                    borderRadius: 999,
                    background: 'white',
                    color: C.darkTeal,
                    padding: '0.65rem 1.1rem',
                    fontFamily: 'Baloo 2, cursive',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    minHeight: 44,
                  }}
                >
                  Hear it
                </button>
                <button
                  onClick={() => setPhase('listen')}
                  style={{
                    background: `linear-gradient(135deg, ${C.teal}, ${C.darkTeal})`,
                    border: 'none',
                    borderRadius: 999,
                    color: 'white',
                    padding: '0.65rem 1.3rem',
                    fontFamily: 'Baloo 2, cursive',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: `0 4px 12px rgba(74,155,135,0.35)`,
                    minHeight: 44,
                  }}
                >
                  Try it!
                </button>
              </div>
            </div>
          )}

          {/* ── LISTEN ── */}
          {phase === 'listen' && (
            <div style={{ textAlign: 'center', animation: 'scFadeUp 0.4s ease' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: '0.5rem', animation: 'scBob 3s ease-in-out infinite' }}>
                🐘
              </div>
              <p style={{ color: C.darkTeal, fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                {childAge <= 7
                  ? `Your turn! Say it out loud — I'm listening!`
                  : `Say it when you're ready. Take your time.`
                }
              </p>
              <button
                onClick={startListening}
                style={{
                  background: `linear-gradient(135deg, ${C.teal}, ${C.darkTeal})`,
                  border: 'none',
                  borderRadius: 999,
                  color: 'white',
                  padding: '0.9rem 2rem',
                  fontFamily: 'Baloo 2, cursive',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: `0 4px 14px rgba(74,155,135,0.35)`,
                  animation: 'scPulse 2s ease-in-out infinite',
                  minHeight: 52,
                  minWidth: 120,
                }}
              >
                I'm ready!
              </button>
              <button
                onClick={playCorrectAudio}
                style={{
                  display: 'block',
                  margin: '0.7rem auto 0',
                  background: 'none',
                  border: 'none',
                  color: C.softBrown,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontFamily: 'Nunito, sans-serif',
                  opacity: 0.6,
                  minHeight: 36,
                }}
              >
                Hear it again
              </button>
            </div>
          )}

          {/* ── RECORDING ── */}
          {phase === 'recording' && (
            <div style={{ textAlign: 'center', animation: 'scFadeUp 0.4s ease' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: '0.7rem', animation: 'scPulse 0.8s ease-in-out infinite' }}>
                👂
              </div>
              <p style={{
                color: C.darkTeal,
                fontSize: '1rem',
                fontFamily: 'Baloo 2, cursive',
                fontWeight: 700,
              }}>
                Listening...
              </p>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: '0.7rem' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: C.teal,
                    animation: 'scPulse 0.6s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* ── FEEDBACK / API_LOADING / API_FEEDBACK ── */}
          {(phase === 'feedback' || phase === 'api_loading' || phase === 'api_feedback') && (
            <div style={{ animation: 'scFadeUp 0.4s ease' }}>

              {/* Score visual */}
              {score !== null && (
                <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: score >= 90 ? C.green
                              : score >= 70 ? C.teal
                              : C.softBrown,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.4rem',
                    fontSize: '1.4rem',
                  }}>
                    {score >= 90 ? '🌟' : score >= 70 ? '🌸' : '🐘'}
                  </div>
                  {transcript && (
                    <p style={{
                      fontSize: '0.78rem', color: C.softBrown,
                      opacity: 0.6, fontStyle: 'italic', margin: 0,
                    }}>
                      You said: "{transcript}"
                    </p>
                  )}
                </div>
              )}

              {/* API loading spinner */}
              {phase === 'api_loading' && (
                <div style={{ textAlign: 'center', marginBottom: '0.7rem' }}>
                  <div style={{
                    width: 28, height: 28, margin: '0 auto',
                    border: `3px solid ${C.teal}`,
                    borderTopColor: C.darkTeal,
                    borderRadius: '50%',
                    animation: 'scSpin 0.8s linear infinite',
                  }} />
                </div>
              )}

              {/* Ganesha's feedback */}
              {feedback && (
                <div style={{
                  background: '#E8F5E9',
                  border: `2px solid rgba(74,155,135,0.35)`,
                  borderRadius: 16,
                  padding: '0.9rem',
                  marginBottom: '0.8rem',
                }}>
                  <p style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '0.95rem',
                    color: C.darkTeal,
                    lineHeight: 1.7,
                    margin: 0,
                  }}>
                    {feedback}
                  </p>
                </div>
              )}

              {/* Try again — shown after API feedback completes */}
              {phase === 'api_feedback' && (
                <button
                  onClick={() => {
                    setPhase('listen')
                    setFeedback('')
                    setScore(null)
                    setTranscript('')
                  }}
                  style={{
                    width: '100%',
                    background: `linear-gradient(135deg, ${C.teal}, ${C.darkTeal})`,
                    border: 'none',
                    borderRadius: 999,
                    color: 'white',
                    padding: '0.8rem',
                    fontFamily: 'Baloo 2, cursive',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    minHeight: 48,
                  }}
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {/* ── COMPLETE ── */}
          {phase === 'complete' && (
            <div style={{ textAlign: 'center', animation: 'scFadeUp 0.5s ease' }}>
              <div style={{ fontSize: '2.8rem', marginBottom: '0.4rem', animation: 'scBob 2s ease-in-out infinite' }}>
                🌟
              </div>
              <h2 style={{
                fontFamily: 'Baloo 2, cursive',
                fontSize: '1.4rem',
                color: C.darkTeal,
                margin: '0 0 0.5rem',
              }}>
                You did it, {childName}!
              </h2>
              <div style={{
                background: '#E8F5E9',
                border: `2px solid rgba(74,155,135,0.35)`,
                borderRadius: 16,
                padding: '0.9rem',
                marginBottom: '1rem',
              }}>
                <p style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '0.92rem',
                  color: C.darkTeal,
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  {feedback}
                </p>
              </div>

              {getStreakMessage() && (
                <p style={{
                  fontSize: '0.82rem',
                  color: C.green,
                  fontWeight: 700,
                  marginBottom: '0.8rem',
                  fontFamily: 'Nunito, sans-serif',
                }}>
                  {getStreakMessage()}
                </p>
              )}

              <p style={{
                fontSize: '0.73rem',
                color: C.softBrown,
                opacity: 0.5,
                marginBottom: '1rem',
                fontFamily: 'Nunito, sans-serif',
              }}>
                {attempts} attempt{attempts !== 1 ? 's' : ''}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setPhase('intro')
                    setScore(null)
                    setTranscript('')
                    setFeedback('')
                    setAttempts(0)
                    reset()
                  }}
                  style={{
                    border: `2px solid ${C.teal}`,
                    borderRadius: 999,
                    background: 'white',
                    color: C.darkTeal,
                    padding: '0.65rem 1.1rem',
                    fontFamily: 'Baloo 2, cursive',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    minHeight: 44,
                  }}
                >
                  Practice again
                </button>

                {onComplete && (
                  <button
                    onClick={onComplete}
                    style={{
                      background: `linear-gradient(135deg, ${C.teal}, ${C.darkTeal})`,
                      border: 'none',
                      borderRadius: 999,
                      color: 'white',
                      padding: '0.65rem 1.3rem',
                      fontFamily: 'Baloo 2, cursive',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: `0 4px 12px rgba(74,155,135,0.3)`,
                      minHeight: 44,
                    }}
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Attempt counter (below inner card) */}
        {attempts > 0 && phase !== 'complete' && (
          <p style={{
            marginTop: '0.7rem',
            textAlign: 'center',
            color: 'rgba(27,77,62,0.4)',
            fontSize: '0.72rem',
            fontFamily: 'Nunito, sans-serif',
          }}>
            Attempt {attempts}
          </p>
        )}

      </div>
    </div>
  )
}
