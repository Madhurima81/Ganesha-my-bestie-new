// src/zones/zone1-symbol-mountain/data/symbolCardContent.js
//
// Voluntary symbol cards - opened from sidebar after auto-reveal.
// Pattern: hook -> teaching -> invitation -> gift line.
// Used by: SymbolCardModal.jsx

const eyesCard = {
  label: 'Eyes',
  icon: '/images/icons/symbol-eyes-new-opt.webp',
  affirmation: 'I can focus on what matters.',
  ganeshaLines: [
    'My eyes help me look carefully.',
    'They remind me to notice what is good, beautiful, and worth seeing.',
  ],
  invitation:
    'Think of a time lots of things were happening. What did you need to focus on?',
  gift: 'You can choose to notice something good.',
};

const earCard = {
  label: 'Ear',
  icon: '/images/icons/symbol-ears-new-opt.webp',
  affirmation: 'I can listen for what helps me.',
  ganeshaLines: [
    'My big ears are shaped like little filters.',
    'They remind me to listen carefully and notice the sounds and words worth keeping.',
  ],
  invitation:
    'Think of a time you heard lots of things at once. Which voice or sound helped you?',
  gift: 'Careful listening helps you notice more.',
};

export const symbolCardContent = {
  modak: {
    label: 'Modak',
    icon: '/images/icons/symbol-modak-new-opt.webp',
    affirmation: 'I can learn, keep trying, and find joy.',
    ganeshaLines: [
      'Do you know why I love Modak?',
      'Its sweetness reminds us of the joy that can come after learning and trying.',
    ],
    invitation:
      'Think of something that was hard at first, but you kept trying. How did you feel when you finally did it?',
    gift: 'Trying and learning can lead to something sweet.',
  },

  mooshika: {
    label: 'Mooshika',
    icon: '/images/icons/symbol-mooshika-new-opt.webp',
    affirmation: 'I can keep going, one small step at a time.',
    ganeshaLines: [
      'Do you know why I ride Mooshika?',
      'He may be small and restless, but steady little steps can carry big dreams.',
    ],
    invitation:
      'Think of something big you want to do. What is one tiny step you could take today?',
    gift: 'Small steps still move you forward.',
  },

  belly: {
    label: 'Belly',
    icon: '/images/icons/symbol-belly-new-opt.webp',
    affirmation: 'I can have lots of feelings and keep going.',
    ganeshaLines: [
      'My belly can hold a lot.',
      'Happy feelings and hard feelings can all be there.',
    ],
    invitation:
      'Think of one hard feeling and one happy feeling you had today. Can you remember both?',
    gift: 'You can have lots of feelings and still keep going.',
  },

  lotus: {
    label: 'Lotus',
    icon: '/images/icons/symbol-lotus-new-opt.webp',
    affirmation: 'I can keep growing when things are hard.',
    ganeshaLines: [
      'The lotus grows up through muddy water.',
      "The mud doesn't stop it from rising and blooming.",
    ],
    invitation:
      'Think of something hard you kept trying until you could do it. How did that feel?',
    gift: 'Hard things can help you grow.',
  },

  trunk: {
    label: 'Trunk',
    icon: '/images/icons/symbol-trunk-new-opt.webp',
    affirmation: 'I can be strong and gentle.',
    ganeshaLines: [
      'My trunk can lift something heavy…',
      '…and gently hold something tiny.',
    ],
    invitation:
      'What would you hold with strong hands? What would you hold very gently?',
    gift: 'You can choose when to be strong and when to be gentle.',
  },

  eye: eyesCard,
  eyes: eyesCard,

  ear: earCard,
  ears: earCard,

  tusk: {
    label: 'Tusk',
    icon: '/images/icons/broken-tusk-symbol.webp',
    affirmation: 'I can use what I have for something important.',
    ganeshaLines: [
      'Ganesha’s tusk reminds us: even broken things can still help.',
      'Something broken, bent, torn, or short can still be useful for an important purpose.',
    ],
    invitation:
      'Think of something old or broken. What could it still help with?',
    gift: 'You can use what you have for something important.',
  },
};
