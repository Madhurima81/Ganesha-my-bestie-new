// src/lib/config/pronunciationResponses.js
// ─────────────────────────────────────────
// Layer 2 — all hardcoded Ganesha responses
// by shloka and tier. No API cost. Plays instantly.

const NAME = '{{name}}'

export const PRONUNCIATION_RESPONSES = {

  'vakratunda-mahakaya': {

    perfect: [
      `${NAME}! That was it! Vakratunda Mahakaya — perfect! My trunk is doing a happy dance!`,
      `Yes ${NAME}! You said it exactly right! Even the river heard you!`,
      `${NAME} — Vakratunda Mahakaya! You have got it! Say it again — feel how it sounds!`,
    ],

    close: [
      `So close ${NAME}! Vakratunda was brilliant. Try Mahakaya slower — Ma... haa... kaa... ya.`,
      `${NAME}, you are nearly there! The first word is perfect. Now Mahakaya — two parts — Maha and Kaya. Slow down on the second part.`,
      `Almost ${NAME}! Try breaking it — Vakra... tunda... Maha... kaya. Go slowly.`,
    ],

    getting_there: [
      `I love how brave you are trying, ${NAME}! Let us do it together — follow me slowly. Vak... ra... tun... da...`,
      `${NAME}, let me say it first — really slowly. Then you try. Vakratunda... Mahakaya. Your turn!`,
      `Together, ${NAME}! Va-kra-tun-da. Ma-haa-kaa-ya. One part at a time.`,
    ],

    try_again: [
      `Hmm, I did not quite hear it ${NAME}! Was your microphone sleepy? Try once more — nice and loud!`,
      `${NAME}, speak up — even I have a big trunk and sometimes I miss things! Try again, louder!`,
      `I think the cave swallowed your words, ${NAME}! Say it loud enough for Mooshika to hear!`,
    ],

    // After 3 fails — shown before Claude API fires
    api_loading: [
      `${NAME}, let me think about exactly how to help you with this part...`,
      `Hmm. Even I had to practice sometimes. Let me find the right words for you ${NAME}...`,
    ],

    // After completing — celebration
    complete: [
      `${NAME}. You just said something that priests in India have been saying for two thousand years. How does that feel in your chest?`,
      `Vakratunda Mahakaya, ${NAME}! You said it. Perfectly. I am so proud of you.`,
    ],
  },

  'sarvakaryeshu-sarvada': {

    perfect: [
      `${NAME}! Sarvakaryeshu Sarvada — you said it perfectly! The whole river heard you!`,
      `That is it ${NAME}! Always successful in everything — and right now, that is exactly you!`,
      `${NAME} — perfect! Sarvakaryeshu Sarvada! Say it again and feel what it means!`,
    ],

    close: [
      `So close ${NAME}! Sarvakaryeshu was great. Try Sarvada with a soft da at the end — Sar... va... da.`,
      `${NAME}, almost! The first word is brilliant. Sarvada — think of it like always — soft and certain.`,
      `Nearly ${NAME}! Break it down — Sarva... karyeshu... Sarva... da. Go slowly on the last word.`,
    ],

    getting_there: [
      `Together ${NAME}! Sar-va-kar-ye-shu. Sar-va-da. Follow me one part at a time.`,
      `${NAME}, let me go first — very slowly. Sarvakaryeshu... Sarvada. Now you try!`,
      `I love your bravery ${NAME}! Let us build it piece by piece. Sarva... now you say it back to me.`,
    ],

    try_again: [
      `${NAME}! I could not hear you — speak up! Even Mooshika can hear this shloka from far away!`,
      `Hmm, the river did not hear that one ${NAME}! Try again — louder and slower.`,
      `${NAME}, take a breath first. Then try again — nice and clear!`,
    ],

    api_loading: [
      `${NAME}, let me think of exactly the right way to help you with this...`,
      `Hmm. Let me find the perfect tip for you ${NAME}...`,
    ],

    complete: [
      `${NAME}. Sarvakaryeshu Sarvada. Always successful in everything. You just said that about yourself. And I believe it.`,
      `You did it ${NAME}! That shloka has been chanted for thousands of years — and now your voice has joined it.`,
    ],
  },
}

// ─── Get random response from tier ──────────────────────────────
export const getTierResponse = (shlokaId, tier, childName) => {
  const shloka = PRONUNCIATION_RESPONSES[shlokaId]
  if (!shloka) return `Great try ${childName}! Keep going!`

  const responses = shloka[tier] || shloka.try_again
  const random = responses[Math.floor(Math.random() * responses.length)]
  return random.replace(/\{\{name\}\}/g, childName)
}

// ─── Get completion message ──────────────────────────────────────
export const getCompleteMessage = (shlokaId, childName) => {
  const shloka = PRONUNCIATION_RESPONSES[shlokaId]
  if (!shloka?.complete) return `You did it ${childName}!`

  const msgs = shloka.complete
  const random = msgs[Math.floor(Math.random() * msgs.length)]
  return random.replace(/\{\{name\}\}/g, childName)
}
