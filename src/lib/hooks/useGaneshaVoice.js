/**
 * useGaneshaVoice.js
 * ------------------
 * Ganesha My Bestie — shared voice hook
 * Used by every component that needs Ganesha to speak.
 *
 * Ganesha is male. Warm. Deep. Unhurried. He rides a mouse.
 * Voice profile: slow rate + low pitch = wise, safe, ancient energy.
 *
 * Usage:
 *   const { speak, stop, isSpeaking } = useGaneshaVoice()
 *   speak("Good morning, Arjun!", { age: 7, moment: 'greeting' })
 */
import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Male Voice Priority List ─────────────────────────────────────────────────
// First match wins. Rishi first — Indian English, handles names naturally.
const MALE_VOICE_WISHLIST = [
  'Rishi',                    // iOS — Indian English male ✅ BEST for GMB
  'Daniel',                   // iOS UK — warm, distinguished ✅
  'Arthur',                   // iOS UK — gentle, warm ✅
  'Gordon',                   // iOS UK — deep, friendly ✅
  'Reed',                     // iOS US — warm American male ✅
  'Aaron',                    // iOS US — friendly male ✅
  'Fred',                     // iOS/Mac — classic warm male ✅
  'Google UK English Male',
  'Google US English Male',
  'Microsoft David',          // Windows — warm male ✅
  'Microsoft Mark',           // Windows — decent fallback
]

// ─── Age-Adaptive Base Settings ──────────────────────────────────────────────
// Lower pitch + slower rate = warm, wise, unhurried Ganesha energy
const AGE_SETTINGS = {
  young: { rate: 0.92, pitch: 1.02 }, // 5–7  → warm storytelling
  mid:   { rate: 0.95, pitch: 0.98 }, // 8–10 → natural friendly guide
  older: { rate: 0.98, pitch: 0.95 }, // 11–12 → calm but confident
}

// ─── Moment Adjustments ───────────────────────────────────────────────────────
const MOMENT_ADJUSTMENTS = {
  greeting:      { rate: +0.03, pitch: +0.05 },
  gratitude:     { rate: +0.00, pitch: +0.05 },
  dare:          { rate: -0.02, pitch: +0.02 },
  celebration:   { rate: +0.07, pitch: +0.07 },
  story:         { rate: -0.01, pitch: +0.03 },
  coregulation:  { rate: -0.05, pitch: +0.00 },
  shloka:        { rate: -0.04, pitch: -0.01 },
  encouragement: { rate: +0.02, pitch: +0.05 },
  closing:       { rate: -0.03, pitch: +0.02 },
  thinking:      { rate: -0.01, pitch: +0.00 },
  default:       { rate:  0.00, pitch:  0.00 },
}

// Optional style layer on top of age + moment tuning.
// 'ganesha' keeps the current warm/deep profile.
// 'child' makes delivery lighter and more playful for testing.
const STYLE_ADJUSTMENTS = {
  ganesha: { rate: 0.00, pitch: 0.00, volume: 0.65 },
  child:   { rate: 0.08, pitch: 0.16, volume: 0.75 },
}

// ─── Phonetic Map ─────────────────────────────────────────────────────────────
// Rewrites Indian names + Sanskrit words into sounds an American/UK voice
// can pronounce correctly. Used when Rishi is not available.
// Rule: spell the word the way it sounds in English — no hyphens (TTS reads
// them as "dash"), no caps for stress (TTS ignores them).
const PHONETIC_MAP = {
  // App character names
  'Ganesha':        'Guh naysha',
  'Ganesh':         'Guh naish',
  'Mooshika':       'Moo shika',

  // Sanskrit shloka words
  'Vakratunda':     'Vukra toonda',
  'Mahakaya':       'Maha kaaya',
  'Suryakoti':      'Soorya kotee',
  'Samaprabha':     'Saama prabha',
  'Nirvighnam':     'Neer vignum',
  'Kurumedeva':     'Kuru may dayva',
  'Sarvakaryeshu':  'Sarva karyayshu',
  'Sarvada':        'Sarvaada',

  // Festival / cultural words
  'Modak':          'Moduk',
  'Chaturthi':      'Chuh toorthee',
  'Shloka':         'Shloka',        // most voices handle this fine
  'Rangoli':        'Ran golee',
  'Mandap':         'Mundup',

  // Common NRI child names (add more as needed)
  'Arjun':          'Arjoon',
  'Ishaan':         'Eeshaan',
  'Aditya':         'Uditya',
  'Kavya':          'Kuvya',
  'Shreya':         'Shraya',
  'Ananya':         'Ununyaa',
  'Rohan':          'Rohan',         // fine as-is
  'Priya':          'Preeya',
  'Diya':           'Deeya',
  'Riya':           'Reeya',
}

// Only apply phonetic map when Rishi is NOT the active voice.
// Rishi handles Indian words natively — don't corrupt them.
const phoneticize = (text, skipPhonetics) => {
  if (skipPhonetics) return text
  let result = text
  for (const [word, phonetic] of Object.entries(PHONETIC_MAP)) {
    // Case-insensitive whole-word replace
    result = result.replace(new RegExp(`\\b${word}\\b`, 'gi'), phonetic)
  }
  return result
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const addNaturalPauses = (text) =>
  text
    .replace(/\n\n/g, '  ')
    .replace(/\.\.\./g, '... ')
    .replace(/ — /g, ', ')
    .replace(/\? /g, '?  ')

const getAgeTier = (age) => {
  if (age <= 7)  return 'young'
  if (age <= 10) return 'mid'
  return 'older'
}

// ─── Main Hook ────────────────────────────────────────────────────────────────
export const useGaneshaVoice = () => {
  const [isSpeaking, setIsSpeaking]   = useState(false)
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const utteranceRef = useRef(null)
  const voiceRef     = useRef(null)
  const speakTimerRef = useRef(null)

  // ── Load voices ──────────────────────────────────────────────────────────────
  // Voices load asynchronously on most browsers — must wait for voiceschanged
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || []
      if (voices.length === 0) return
      let picked = null
      for (const name of MALE_VOICE_WISHLIST) {
        picked = voices.find(v => v.name.includes(name))
        if (picked) break
      }
      voiceRef.current = picked || null
      setVoicesLoaded(true)
    }
    loadVoices() // try sync first (Firefox loads immediately)
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  // ── Core speak ───────────────────────────────────────────────────────────────
  const speak = useCallback((text, options = {}) => {
    if (!window.speechSynthesis) {
      options?.onEnd?.()
      return
    }
    if (!text?.trim()) {
      options?.onEnd?.()
      return
    }

    const {
      age     = 7,
      moment  = 'default',
      style   = 'ganesha',
      onStart = null,
      onEnd   = null,
      onError = null,
    } = options

    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current)
      speakTimerRef.current = null
    }
    window.speechSynthesis.cancel()
    setIsSpeaking(false)

    // 50ms delay after cancel avoids Chrome TTS bug
    speakTimerRef.current = setTimeout(() => {
      speakTimerRef.current = null
      // Don't speak when tab is hidden — prevents VO playing in background on tab switch
      if (document.hidden) {
        options?.onEnd?.()
        return
      }
      const tier = getAgeTier(age)
      const base = AGE_SETTINGS[tier]
      const adj  = MOMENT_ADJUSTMENTS[moment] || MOMENT_ADJUSTMENTS.default
      const styleAdj = STYLE_ADJUSTMENTS[style] || STYLE_ADJUSTMENTS.ganesha

      const isRishi    = voiceRef.current?.name?.includes('Rishi')
      const processed  = phoneticize(addNaturalPauses(text), isRishi)
      const u = new SpeechSynthesisUtterance(processed)
      u.rate   = Math.max(0.5, Math.min(1.5, base.rate  + adj.rate + styleAdj.rate))
      u.pitch  = Math.max(0.5, Math.min(1.5, base.pitch + adj.pitch + styleAdj.pitch))
      u.volume = Math.max(0.5, Math.min(1.0, styleAdj.volume))

      // FIX: only set lang when no explicit voice is found.
      // Setting lang + an explicit voice can cause Chrome to ignore the voice.
      if (voiceRef.current) {
        u.voice = voiceRef.current
        // inherit voice's own lang — don't override
      } else {
        u.lang = 'en-IN' // Indian English fallback — warm for NRI families
      }

      u.onstart = () => { setIsSpeaking(true); onStart?.() }
      u.onend   = () => { setIsSpeaking(false); onEnd?.() }
      u.onerror = (e) => {
        setIsSpeaking(false)
        onError?.(e)
        onEnd?.()
      }

      utteranceRef.current = u
      // Some browsers leave speech synthesis paused after tab/background changes.
      try { window.speechSynthesis.resume() } catch {}
      window.speechSynthesis.speak(u)
    }, 50)
  }, [])

  // ── Stop ─────────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current)
      speakTimerRef.current = null
    }
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
  }, [])

  // ── Speak sequence ───────────────────────────────────────────────────────────
  // speakSequence([
  //   { text: "That warms my heart.", moment: 'gratitude', pause: 600 },
  //   { text: "Today's dare:", moment: 'dare' }
  // ], { age: 7 })
  const speakSequence = useCallback((items, options = {}) => {
    if (!items?.length) return
    const { age = 7 } = options
    let index = 0
    const speakNext = () => {
      if (index >= items.length) return
      const item  = items[index]
      const pause = item.pause || 400
      index++
      speak(item.text, {
        age,
        moment: item.moment || 'default',
        onEnd: () => setTimeout(speakNext, pause),
      })
    }
    speakNext()
  }, [speak])

  // ── Cleanup ──────────────────────────────────────────────────────────────────
  useEffect(() => () => {
    if (speakTimerRef.current) {
      clearTimeout(speakTimerRef.current)
      speakTimerRef.current = null
    }
    window.speechSynthesis?.cancel()
  }, [])

  return {
    speak,
    stop,
    speakSequence,
    isSpeaking,
    voicesLoaded,
    voiceName: voiceRef.current?.name || 'default',
  }
}

// ─── Pre-built Moment Helpers ─────────────────────────────────────────────────

/**
 * Ganesha responds to gratitude then reveals dare
 * speakDareSequence(speak, gratitudeResponse, dareText, childAge)
 */
export const speakDareSequence = (speakFn, gratitudeText, dareText, age = 7) => {
  speakFn(gratitudeText, {
    age,
    moment: 'gratitude',
    onEnd: () => {
      setTimeout(() => {
        speakFn(`Today's dare.  ${dareText}`, { age, moment: 'dare' })
      }, 600)
    },
  })
}

/**
 * Ganesha zone welcome
 * speakZoneWelcome(speak, "Festival Square", "Arjun", 7)
 */
export const speakZoneWelcome = (speakFn, zoneName, childName, age = 7) => {
  const lines = {
    'Symbol Mountain':
      `${childName}! You made it to Symbol Mountain — where my eight secret powers are hiding. Each one has been waiting for exactly the right person to find them. Ready to climb?`,
    'Cave of Secrets':
      `Ssshh, ${childName}. The Cave of Secrets only opens for children who are truly ready. Inside are words so powerful, they have been whispered for thousands of years. Are you brave enough?`,
    'Shloka River':
      `${childName}, the Shloka River is alive. Every word you learn here makes the water rise higher. By the end — you will have done that. Just you.`,
    'Festival Square':
      `${childName}! Can you hear the drums? Ganesh Chaturthi has started and everyone is waiting — the piano, the rangoli, the modaks — all of it needs YOU!`,
    'About Me Hut':
      `This is my favourite place, ${childName}. The About Me Hut is just for you — where we find out what makes you, YOU. I have been curious about that for a while.`,
  }
  const text = lines[zoneName] || `Welcome ${childName}! Something wonderful is waiting inside.`
  speakFn(text, { age, moment: 'greeting' })
}

/**
 * Ganesha pronunciation feedback
 * speakPronunciationFeedback(speak, 'perfect', 'Vakratunda Mahakaya', childAge)
 */
export const speakPronunciationFeedback = (speakFn, tier, shloka, age = 7) => {
  const feedback = {
    perfect: {
      'Vakratunda Mahakaya':    'That was it! Vakratunda Mahakaya — perfect! My trunk is doing a happy dance!',
      'Sarvakaryeshu Sarvada':  'Sarvakaryeshu Sarvada — you said it perfectly! Even the river heard you!',
      default:                  'Perfect! Say it again — feel how it sounds in your whole body!',
    },
    close: {
      'Vakratunda Mahakaya':    'So close! The Vakratunda part was brilliant. Try Mahakaya slower — Ma... haa... kaa... ya.',
      'Sarvakaryeshu Sarvada':  'Almost! Sarvakaryeshu was great. Try Sarvada with a soft da at the end.',
      default:                  'So close! You are nearly there. Try it one more time, nice and slow.',
    },
    getting_there: {
      default: 'I love how brave you are trying! Let us do it together — follow me slowly.',
    },
    try_again: {
      default: 'Hmm, I do not think I heard it! Was your microphone sleepy? Try once more — nice and loud!',
    },
  }
  const tierFeedback = feedback[tier] || feedback.try_again
  const text = tierFeedback[shloka] || tierFeedback.default
  speakFn(text, {
    age,
    moment: tier === 'perfect' ? 'celebration' : 'encouragement',
  })
}

/**
 * Ganesha closing message (5-min timer end)
 * speakClosing(speak, "Arjun", tomorrowHook, childAge)
 */
export const speakClosing = (speakFn, childName, tomorrowHook, age = 7) => {
  // FIX: no emojis in spoken text — TTS reads them as "elephant" etc.
  const text =
    `${childName}... our time together is done for today.  ` +
    `But I will be thinking about what you shared.  ` +
    `${tomorrowHook}  ` +
    `See you tomorrow.`
  speakFn(text, { age, moment: 'closing' })
}

export default useGaneshaVoice
