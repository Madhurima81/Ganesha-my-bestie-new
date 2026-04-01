// src/lib/config/coRegConfig.js
// ─────────────────────────────
// All co-regulation content.
// Technique library — zone mapped, age ranged, cooldown tracked.

export const TECHNIQUES = {
  breathing: {
    id: 'breathing',
    label: 'Belly Breathing',
    emoji: '🫁',
    component: 'BreathingExperience',
    zones: ['Red', 'Yellow', 'Blue', 'Green'],
    ageMin: 5, ageMax: 12,
    cooldown: 1,
    duration: 60,
    description: 'Breathe with Ganesha',
  },
  scribble: {
    id: 'scribble',
    label: 'Scribble It Out',
    emoji: '🎨',
    component: 'ScribbleExperience',
    zones: ['Red'],
    // NOTE: never use for Blue zone — can amplify sadness
    ageMin: 5, ageMax: 12,
    cooldown: 3,
    duration: 60,
    description: 'Draw all the big feelings',
  },
  jump: {
    id: 'jump',
    label: "Let's Jump!",
    emoji: '🦘',
    component: 'JumpExperience',
    zones: ['Red'],
    ageMin: 5, ageMax: 10,
    // never for 11-12 — feels babyish
    cooldown: 2,
    duration: 30,
    description: 'Jump 10 times with Mooshika',
  },
  affirmation: {
    id: 'affirmation',
    label: 'Say It Together',
    emoji: '🌟',
    component: 'AffirmationExperience',
    zones: ['Blue', 'Yellow'],
    ageMin: 5, ageMax: 12,
    cooldown: 2,
    duration: 45,
    description: "Ganesha's power words",
  },
  mindfulness: {
    id: 'mindfulness',
    label: 'Diya Gaze',
    emoji: '🪔',
    component: 'MindfulnessExperience',
    zones: ['Blue', 'Yellow'],
    ageMin: 7, ageMax: 12,
    // too abstract for under 7
    cooldown: 4,
    duration: 60,
    description: 'Watch the flame, still your mind',
  },
  gratitude: {
    id: 'gratitude',
    label: 'Gratitude High-Five',
    emoji: '🙏',
    component: 'GratitudeHighFive',
    zones: ['Blue'],
    ageMin: 5, ageMax: 10,
    cooldown: 3,
    duration: 45,
    description: 'Name 5 good things',
  },
  shake: {
    id: 'shake',
    label: 'Shake It Out',
    emoji: '🤸',
    component: 'JumpExperience', // reuses jump component
    zones: ['Red'],
    ageMin: 5, ageMax: 10,
    cooldown: 2,
    duration: 30,
    description: 'Shake like Mooshika',
    variant: 'shake',
  },
  hum: {
    id: 'hum',
    label: 'Hum Together',
    emoji: '🌊',
    component: 'MindfulnessExperience', // reuses
    zones: ['Blue', 'Yellow'],
    ageMin: 6, ageMax: 12,
    cooldown: 3,
    duration: 45,
    description: 'Feel the sound in your chest',
    variant: 'hum',
  },
}

// ─── Affirmations bank ────────────────────────────────────────────────────────
// Mapped by age + feeling
export const AFFIRMATIONS = {
  universal: [
    { text: "I am brave like Ganesha's tusk", emoji: '✨' },
    { text: 'I belong everywhere I go', emoji: '🌍' },
    { text: 'My feelings are real and will pass', emoji: '🌊' },
    { text: 'I am loved by so many people', emoji: '💛' },
    { text: 'Even Ganesha had hard days', emoji: '🐘' },
    { text: 'I am strong enough for this', emoji: '🌟' },
    { text: 'I can do hard things', emoji: '💪' },
    { text: 'I am enough, just as I am', emoji: '🌸' },
  ],
  angry: [
    { text: 'I feel angry and that is okay', emoji: '🔴' },
    { text: 'I choose how I respond', emoji: '🧠' },
    { text: 'This feeling will pass', emoji: '🌊' },
    { text: 'I am in charge of me', emoji: '⭐' },
  ],
  sad: [
    { text: 'It is okay to feel sad', emoji: '💙' },
    { text: 'I am not alone', emoji: '🤝' },
    { text: 'Ganesha is with me', emoji: '🐘' },
    { text: 'Tomorrow will feel different', emoji: '🌅' },
  ],
  worried: [
    { text: 'I have everything I need', emoji: '✨' },
    { text: 'I am safe right now', emoji: '🏡' },
    { text: 'I can handle this', emoji: '💪' },
    { text: 'One step at a time', emoji: '👣' },
  ],
  identity: [
    // NRI-specific — for belonging/identity feelings
    { text: 'I belong everywhere I go', emoji: '🌍' },
    { text: 'My roots make me special', emoji: '🌳' },
    { text: 'I carry India in my heart', emoji: '🇮🇳' },
    { text: 'Two worlds live in me', emoji: '🌏' },
  ],
}

// ─── Technique selection logic ────────────────────────────────────────────────
// Called by CoRegToolkit to pick 3 options.
// Never repeats within cooldown.
export const selectTechniques = (zone, childAge, recentIds = []) => {
  const available = Object.values(TECHNIQUES).filter(t => {
    if (!t.zones.includes(zone)) return false
    if (childAge < t.ageMin) return false
    if (childAge > t.ageMax) return false
    const recentIndex = recentIds.indexOf(t.id)
    if (recentIndex !== -1 && recentIndex < t.cooldown) return false
    return true
  })

  // Try to include one of each category: body-based, breathing, mindful/creative
  const bodyBased    = available.filter(t => ['jump', 'shake', 'scribble'].includes(t.id))
  const breathingCat = available.filter(t => ['breathing', 'hum'].includes(t.id))
  const mindfulCat   = available.filter(t => ['affirmation', 'mindfulness', 'gratitude'].includes(t.id))

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

  const selected = []
  if (bodyBased.length)    selected.push(pick(bodyBased))
  if (breathingCat.length) selected.push(pick(breathingCat))
  if (mindfulCat.length)   selected.push(pick(mindfulCat))

  // Fill to 3 if needed
  if (selected.length < 3) {
    available
      .filter(t => !selected.find(s => s.id === t.id))
      .slice(0, 3 - selected.length)
      .forEach(t => selected.push(t))
  }

  // Ensure at least something even if zone is very restrictive
  if (selected.length === 0) {
    const fallback = Object.values(TECHNIQUES).find(
      t => childAge >= t.ageMin && childAge <= t.ageMax
    )
    if (fallback) selected.push(fallback)
  }

  return selected.slice(0, 3)
}

// ─── Printable content ────────────────────────────────────────────────────────
export const PRINTABLES = {
  breathing: {
    title: "Ganesha's Breathing Buddy",
    subtitle: 'When I feel big feelings, I breathe with Ganesha',
    emoji: '🐘🫁',
    instruction: 'Breathe in for 4... hold for 4... out for 4',
  },
  affirmation: {
    title: "Ganesha's Power Words",
    subtitle: 'Stick this on your mirror',
    emoji: '🌟',
    instruction: 'Say it every morning',
  },
  scribble: {
    title: 'My Feelings Art',
    subtitle: 'I got my big feelings OUT',
    emoji: '🎨',
    instruction: 'Scribble saves the day',
  },
  gratitude: {
    title: "Ganesha's Gratitude Hand",
    subtitle: '5 good things in my life',
    emoji: '🙏',
    instruction: 'Trace your hand. Name one thing per finger',
  },
  mindfulness: {
    title: "Ganesha's Still Moment",
    subtitle: 'When I watch the flame, my mind goes quiet',
    emoji: '🪔',
    instruction: 'Light a diya. Watch it. Breathe.',
  },
  jump: {
    title: "Mooshika's Wiggle Card",
    subtitle: 'When angry — wiggle it out!',
    emoji: '🦘',
    instruction: 'Jump 10 times. Shake like Mooshika!',
  },
}
