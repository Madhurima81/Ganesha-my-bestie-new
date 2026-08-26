// src/zones/zone1-symbol-mountain/data/symbolCardContent.js
//
// Voluntary symbol cards - opened from sidebar after auto-reveal.
// Pattern: hook -> teaching -> invitation -> gift line.
// Used by: SymbolCardModal.jsx

const eyesCard = {
  label: 'Eyes',
  icon: '/images/icons/symbol-eyes-new.png',
  affirmation: 'I notice the good around me.',
  ganeshaLines: [
    'My eyes help me look carefully.',
    'They remind me to notice what is good, beautiful, and worth seeing.',
  ],
  invitation:
    'Look around slowly. Find one small thing that looks good or beautiful to you. Stay with it for 3 seconds.',
  gift: 'You can choose to notice something good.',
};

const earCard = {
  label: 'Ear',
  icon: '/images/icons/symbol-ears-new.png',
  affirmation: 'I listen with care.',
  ganeshaLines: [
    'My big ears are shaped like little filters.',
    'They remind me to listen carefully and notice the sounds and words worth keeping.',
  ],
  invitation:
    'Close your eyes. Listen for the quietest sound around you. Stay with it for 3 seconds.',
  gift: 'Careful listening helps you notice more.',
};

export const symbolCardContent = {
  modak: {
    label: 'Modak',
    icon: '/images/icons/symbol-modak-new.png',
    affirmation: 'I have joy inside me.',
    ganeshaLines: [
      'There is a reason I love modak.',
      'Its sweetness reminds us of the happy, peaceful feeling that can grow inside.',
    ],
    invitation:
      'Think of one small thing you did today that made you feel good inside. Stay with that feeling for a moment.',
    gift: 'That quiet sweetness can come from inside you.',
  },

  mooshika: {
    label: 'Mooshika',
    icon: '/images/icons/symbol-mooshika-new.png',
    affirmation: 'I can guide my busy thoughts.',
    ganeshaLines: [
      'Did you ever wonder why I ride a mouse?',
      'Mooshika can be quick and restless, just like our thoughts and little wants. We can learn to guide them.',
    ],
    invitation:
      'Pause for a moment. Pick one thing near you and give it all your attention for 3 seconds.',
    gift: 'When your thoughts run around, you can gently guide them back.',
  },

  belly: {
    label: 'Belly',
    icon: '/images/icons/symbol-belly-new.png',
    affirmation: 'I have room for all my feelings.',
    ganeshaLines: [
      'My belly can hold a lot.',
      'Happy feelings, hard feelings, and everything in between can all have some room.',
    ],
    invitation:
      'Put your hand on your belly. Think of two different feelings you had today. Can you make room for both?',
    gift: "You don't have to push a feeling away. There is room for it.",
  },

  lotus: {
    label: 'Lotus',
    icon: '/images/icons/symbol-lotus-new.png',
    affirmation: 'I can stay calm when things get messy.',
    ganeshaLines: [
      'The lotus has a secret.',
      'It grows in muddy water and still rises peaceful and beautiful.',
    ],
    invitation:
      'Take one slow breath in and out. Notice one calm feeling inside, even if things around you are busy.',
    gift: "A messy moment doesn't have to take away your calm.",
  },

  trunk: {
    label: 'Trunk',
    icon: '/images/icons/symbol-trunk-new.png',
    affirmation: 'I find my way.',
    ganeshaLines: [
      'My trunk can bend and curve.',
      "When one way doesn't work, it can twist and find another.",
    ],
    invitation:
      "Think of something that didn't go your way today. What is one different way you could try?",
    gift: 'When one way is blocked, another way may be waiting.',
  },

  eye: eyesCard,
  eyes: eyesCard,

  ear: earCard,
  ears: earCard,

  tusk: {
    label: 'Tusk',
    icon: '/images/icons/broken-tusk-symbol.png',
    affirmation: 'I stay focused on what is true.',
    ganeshaLines: [
      'You see I have one strong tusk?',
      'It reminds me to stay strong and focused on what is true, even when things are difficult.',
    ],
    invitation:
      'Think of something you know is important to do. What is one small step that keeps you focused on it?',
    gift: 'You can stay strong and focused on what matters.',
  },
};
