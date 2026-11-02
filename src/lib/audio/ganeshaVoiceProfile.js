/**
 * ganeshaVoiceProfile.js
 * ----------------------
 * The ONE Web Speech voice for Ganesha: which voice is chosen, how fast/high it speaks, and how text is
 * prepared (pauses + Sanskrit/name respellings). useGaneshaVoice, useVoiceGuidance's speech fallback and the
 * opening modal all use this so a child hears the same voice in every scene. (Before this, the Modak calm
 * game and the opening modals used the browser default voice while the later games used this profile.)
 *
 * Ganesha is male. Warm. Deep. Unhurried. He rides a mouse.
 */

// ─── Male Voice Priority List ─────────────────────────────────────────────────
// First match wins. Rishi first — Indian English, handles names naturally.
export const MALE_VOICE_WISHLIST = [
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
export const AGE_SETTINGS = {
  young: { rate: 0.92, pitch: 1.02 }, // 5–7  → warm storytelling
  mid:   { rate: 0.95, pitch: 0.98 }, // 8–10 → natural friendly guide
  older: { rate: 0.98, pitch: 0.95 }, // 11–12 → calm but confident
}

// ─── Moment Adjustments ───────────────────────────────────────────────────────
export const MOMENT_ADJUSTMENTS = {
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
export const STYLE_ADJUSTMENTS = {
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
export const phoneticize = (text, skipPhonetics) => {
  if (skipPhonetics) return text
  let result = text
  for (const [word, phonetic] of Object.entries(PHONETIC_MAP)) {
    // Case-insensitive whole-word replace
    result = result.replace(new RegExp(`\\b${word}\\b`, 'gi'), phonetic)
  }
  return result
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const addNaturalPauses = (text) =>
  text
    .replace(/\n\n/g, '  ')
    .replace(/\.\.\./g, '... ')
    .replace(/ — /g, ', ')
    .replace(/\? /g, '?  ')

export const getAgeTier = (age) => {
  if (age <= 7)  return 'young'
  if (age <= 10) return 'mid'
  return 'older'
}

// First wishlist voice the browser has, or null (then the utterance falls back to Indian English).
export const pickGaneshaVoice = (voices) => {
  for (const name of MALE_VOICE_WISHLIST) {
    const found = (voices || []).find((v) => v.name.includes(name))
    if (found) return found
  }
  return null
}

// The voice right now, read live from the browser (voices load asynchronously; null until they have).
export const getGaneshaVoice = () => {
  try {
    return pickGaneshaVoice(window.speechSynthesis?.getVoices() || [])
  } catch {
    return null
  }
}

// rate / pitch / volume for a line. Defaults are what the later Modak games and scene 3 use:
// age 7, 'child' style, no moment tweak.
export const ganeshaSpeechSettings = ({ age = 7, style = 'child', moment = 'default' } = {}) => {
  const base = AGE_SETTINGS[getAgeTier(age)]
  const adj = MOMENT_ADJUSTMENTS[moment] || MOMENT_ADJUSTMENTS.default
  const styleAdj = STYLE_ADJUSTMENTS[style] || STYLE_ADJUSTMENTS.ganesha
  return {
    rate: Math.max(0.5, Math.min(1.5, base.rate + adj.rate + styleAdj.rate)),
    pitch: Math.max(0.5, Math.min(1.5, base.pitch + adj.pitch + styleAdj.pitch)),
    volume: Math.max(0.5, Math.min(1.0, styleAdj.volume)),
  }
}

// The text the engine is given: natural pauses, plus name/Sanskrit respellings unless the voice is Rishi.
export const prepareGaneshaText = (text, voice) => phoneticize(addNaturalPauses(text), Boolean(voice?.name?.includes('Rishi')))

// Sets the voice (or Indian English when none is available) and the speaking rate/pitch on an utterance.
// Volume is left to the caller: the parent's volume setting wins in the scenes.
export const applyGaneshaVoice = (utterance, voice, options) => {
  const { rate, pitch } = ganeshaSpeechSettings(options)
  utterance.rate = rate
  utterance.pitch = pitch
  // Setting lang + an explicit voice can make Chrome ignore the voice, so set only one of them.
  if (voice) utterance.voice = voice
  else utterance.lang = 'en-IN'
  return utterance
}
