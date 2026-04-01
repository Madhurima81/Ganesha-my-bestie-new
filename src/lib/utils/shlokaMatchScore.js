// src/lib/utils/shlokaMatchScore.js
// ─────────────────────────────────
// Compares child's spoken attempt to correct shloka text.
// Returns score 0–100 + tier.

// ─── Normalise text ──────────────────────────────────────────────
const normalise = (text) => {
  return text
    .toLowerCase()
    .trim()
    // remove punctuation
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    // collapse spaces
    .replace(/\s+/g, ' ')
    // common Web Speech mishearings for Sanskrit words
    .replace(/maha kaya/g, 'mahakaya')
    .replace(/maha-kaya/g, 'mahakaya')
    .replace(/sarva karyeshu/g, 'sarvakaryeshu')
    .replace(/sarva-karyeshu/g, 'sarvakaryeshu')
    .replace(/vakra tunda/g, 'vakratunda')
    .replace(/vakra-tunda/g, 'vakratunda')
    .replace(/sarva da/g, 'sarvada')
    .replace(/sarva-da/g, 'sarvada')
}

// ─── Syllable split ──────────────────────────────────────────────
const toSyllables = (text) => {
  return normalise(text).split(' ')
}

// ─── Score calculator ────────────────────────────────────────────
export const calculateMatchScore = (spoken, correct) => {
  if (!spoken || !correct) return 0

  const spokenWords  = toSyllables(spoken)
  const correctWords = toSyllables(correct)

  if (correctWords.length === 0) return 0

  let matches = 0

  correctWords.forEach((word, i) => {
    const spokenWord = spokenWords[i] || ''

    // Exact match
    if (spokenWord === word) {
      matches += 1
      return
    }

    // Partial match — at least 60% of chars match
    // Handles slight mispronunciation
    const minLen = Math.min(word.length, spokenWord.length)
    let charMatches = 0
    for (let c = 0; c < minLen; c++) {
      if (word[c] === spokenWord[c]) charMatches++
    }
    const charScore = charMatches / word.length
    if (charScore >= 0.6) matches += 0.7 // partial credit
  })

  const score = Math.round((matches / correctWords.length) * 100)
  return Math.min(100, score)
}

// ─── Score to tier ───────────────────────────────────────────────
export const scoreToTier = (score) => {
  if (score >= 90) return 'perfect'
  if (score >= 70) return 'close'
  if (score >= 45) return 'getting_there'
  return 'try_again'
}

// ─── Find which word failed ──────────────────────────────────────
// Used by Layer 3 Claude API call
export const findWeakWord = (spoken, correct) => {
  const spokenWords  = toSyllables(spoken)
  const correctWords = toSyllables(correct)

  let weakestWord = null
  let lowestScore = 1

  correctWords.forEach((word, i) => {
    const spokenWord = spokenWords[i] || ''
    const minLen = Math.min(word.length, spokenWord.length)
    let charMatches = 0
    for (let c = 0; c < minLen; c++) {
      if (word[c] === spokenWord[c]) charMatches++
    }
    const score = charMatches / word.length
    if (score < lowestScore) {
      lowestScore = score
      weakestWord = { correct: word, spoken: spokenWord, index: i }
    }
  })

  return weakestWord
}
