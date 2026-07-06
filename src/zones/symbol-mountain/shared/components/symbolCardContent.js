// src/zones/zone1-symbol-mountain/data/symbolCardContent.js
//
// Voluntary symbol cards - opened from sidebar after auto-reveal.
// Pattern: hook -> teaching -> invitation -> gift line.
// Used by: SymbolCardModal.jsx

const eyesCard = {
  label: 'Eyes',
  icon: '/images/icons/symbol-eyes-new.png',
  affirmation: 'I see clearly.',
  ganeshaLines: [
    'My eyes are small for a reason.',
    "I don't look at everything - I look at what matters.",
  ],
  invitation:
    'Look around slowly. Find one thing that feels good or beautiful. Stay with it for 3 seconds.',
  gift: "That's clear seeing. You can choose what to notice.",
};

const earCard = {
  label: 'Ear',
  icon: '/images/icons/symbol-ears-new.png',
  affirmation: 'I listen with care.',
  ganeshaLines: [
    'My ears are big like fans.',
    'They keep the good... and let the rest go.',
  ],
  invitation:
    'Close your eyes. Listen for the quietest sound around you. Stay with it for 3 seconds.',
  gift: "That's listening with care. You can listen to people this way too.",
};

export const symbolCardContent = {
  modak: {
    label: 'Modak',
    icon: '/images/icons/symbol-modak-new.png',
    affirmation: 'I am full of joy.',
    ganeshaLines: [
      'I love modak for a reason.',
      'The sweetness is inside... just like your joy.',
    ],
    invitation:
      'Close your eyes for a second. Think of one small moment that made you smile today - a tiny modak moment. Hold it... feel it again.',
    gift: 'That feeling is yours. You can come back to it anytime.',
  },

  mooshika: {
    label: 'Mooshika',
    icon: '/images/icons/symbol-mooshika-new.png',
    affirmation: 'I can focus.',
    ganeshaLines: [
      'Did you ever wonder why I ride a mouse?',
      'Mooshika is fast and curious, like our thoughts. I taught him to pause - and now we go anywhere together.',
    ],
    invitation:
      "Look around you. Pick one tiny thing you've never noticed before. Look at it for 3 seconds.",
    gift: "That's focus. You can use it anytime your thoughts run fast.",
  },

  belly: {
    label: 'Belly',
    icon: '/images/icons/symbol-belly-new.png',
    affirmation: 'I feel safe inside.',
    ganeshaLines: [
      'My belly is bigger than you think.',
      'It holds everything - happy days, hard days, all of it.',
    ],
    invitation:
      'Put your hand on your belly. Take one slow breath in. One slow breath out. Feel it rise and fall.',
    gift: 'This is your safe place inside. All your feelings can rest here.',
  },

  lotus: {
    label: 'Lotus',
    icon: '/images/icons/symbol-lotus-new.png',
    affirmation: 'I stay calm.',
    ganeshaLines: [
      'The lotus has a secret.',
      'It grows in muddy water - and still stays calm.',
    ],
    invitation:
      'Close your eyes. Take one slow breath in... and out. Notice the quiet inside.',
    gift: 'That calm is yours. You can find it anytime.',
  },

  trunk: {
    label: 'Trunk',
    icon: '/images/icons/symbol-trunk-new.png',
    affirmation: 'I find my way.',
    ganeshaLines: [
      'My trunk can do many things.',
      'It bends, twists, and finds a way every time.',
    ],
    invitation:
      "Think of one thing that didn't go your way today. Now imagine going around it instead of through it. What else could you try?",
    gift: 'There is always another way. You can find it.',
  },

  eye: eyesCard,
  eyes: eyesCard,

  ear: earCard,
  ears: earCard,

  tusk: {
    label: 'Tusk',
    icon: '/images/icons/broken-tusk-symbol.png',
    affirmation: 'I finish what I start.',
    ganeshaLines: [
      'You see I have only one tusk?',
      "I didn't stop when things got hard. I finished what I started.",
    ],
    invitation:
      'Think of one small thing you started today. Maybe you left it halfway. Now imagine going back and finishing it - what is one tiny step you could do? Start there.',
    gift: 'You can finish what you begin.',
  },
};
