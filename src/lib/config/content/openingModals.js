// Opening Modal Content for All 22 Scenes
// Organized by zone â†’ scene

export const OPENING_MODALS = {

  // ========================================
  // SYMBOL MOUNTAIN
  // ========================================
  'symbol-mountain': {
    'modak': {
      title: "Share the Modaks",
      description: "Find Mooshika nearby and share the modaks.",
      icons: ['mooshika', 'modak', 'belly'],
      buttonText: "Let's Begin",
      character: 'ganesha-happy'
    },

    'pond': {
      title: "The Golden Lotus",
      description: "A golden lotus is waiting to bloom.",
      icons: ['lotus', 'trunk'],
      iconLabels: ['Lotus', 'Trunk'],
      buttonText: "Let's Explore",
      character: null
    },

    'symbol': {
      title: "Ganesha's Symbols",
      description: "Look, listen, and find what awakens the tusk.",
      icons: ['eyes', 'ears', 'tusk'],
      iconLabels: ['Eyes', 'Ears', 'Tusk'],
      buttonText: "Let's Explore",
      character: null
    },

    'final-scene': {
      title: "All Symbols Together",
      description: "Every symbol is ready. Let's bring them together.",
      icons: ['eyes', 'trunk', 'lotus'],
      buttonText: "Let's Begin",
      character: 'ganesha-cave'
    }
  },

  // ========================================
  // CAVE OF SECRETS
  // ========================================
  'cave-of-secrets': {
    'vakratunda-mahakaya': {
      title: "Build the Strength",
      description: "Trace the curve slowly and feel the strength grow.",
      icons: ['vakratunda', 'mahakaya'],
      iconLabels: ['Curved Trunk', 'Great Body'],
      buttonText: "Let's Explore",
      character: null
    },

    'suryakoti-samaprabha': {
      title: "Spread the Light",
      description: "Tiny suns glow in the dark. Find them and let the cave shine.",
      icons: ['suryakoti', 'samaprabha'],
      iconLabels: ['Million Suns', 'Equal Radiance'],
      buttonText: "Let's Explore",
      character: null
    },

    'nirvighnam-kurumedeva': {
      title: "Clear the Way",
      description: "A gentle fog lies ahead. Guide the path and move forward with ease.",
      icons: ['nirvighnam', 'kurumedeva'],
      iconLabels: ['No Obstacles', 'Do For Me'],
      buttonText: "Let's Explore",
      character: null
    },

    'sarvakaryeshu-sarvada': {
      title: "Choose with Ganesha",
      description: "Take a quiet moment and choose with Ganesha beside you.",
      icons: ['sarvakaryeshu', 'sarvada'],
      iconLabels: ['All Actions', 'Always'],
      buttonText: "Let's Explore",
      character: null
    },

    'final-meaning-scene': {
      title: "All Meanings Together",
      description: "The shloka is complete. See how every part connects.",
      icons: ['vakratunda', 'meaning'],
      iconLabels: ['Symbols', 'Meanings'],
      buttonText: "Let's Explore",
      character: 'ganesha-cave'
    }
  },

  // ========================================
  // SHLOKA RIVER
  // ========================================
  'shloka-river': {
    'vakratunda-grove': {
      title: "Your Journey Begins!",
      description: "The river has two surprises waiting for you.",
      icons: ['vakratunda', 'mahakaya'],
      buttonText: "Let's Explore",
      character: 'ganesha-headphones'
    },

    'suryakoti-bank': {
      title: "Bring Back the Light!",
      description: "The river feels a little dark today.",
      icons: ['suryakoti', 'samaprabha'],
      buttonText: "Let's Explore",
      character: 'ganesha-headphones'
    },

    'nirvighnam-chant': {
      title: "The River Needs You!",
      description: "Some things are standing in the way.",
      icons: ['nirvighnam', 'kurumedeva'],
      buttonText: "Let's Explore",
      character: 'ganesha-headphones'
    },

    'sarvakaryeshu-chant': {
      title: "Your Powers in Action!",
      description: "See where your powers belong - and remember them always.",
      icons: ['sarvakaryeshu', 'sarvada'],
      iconLabels: ['Sarvakaryeshu', 'Sarvada'],
      buttonText: "Let's Explore",
      character: 'ganesha-headphones'
    },

    'shloka-river-finale': {
      title: "Complete the Shloka!",
      description: "Can you put all eight shloka words in the correct order?",
      icons: ['vakratunda', 'nirvighnam', 'sarvada'],
      buttonText: "Let's Explore",
      character: 'ganesha-headphones'
    }
  },

  // ========================================
  // FESTIVAL SQUARE
  // ========================================
  'festival-square': {
    'game1': {
      title: "Festival Beats",
      description: "The music is waiting. Play and feel the rhythm come alive.",
      icons: [
        '/images/festival-square/icons/listen-icon.png',
        '/images/festival-square/icons/play-icon.png',
        '/images/festival-square/icons/create-icon.png'
      ],
      iconLabels: ['Listen', 'Play', 'Create'],
      buttonText: "Let's Explore",
      character: 'ganesha-musician'
    },

    'game2': {
      title: "Sparkly Rangoli",
      description: "Colors rest on the floor. Create something bright and beautiful.",
      icons: [
        '/images/festival-square/icons/learn-icon.png',
        '/images/festival-square/icons/draw-icon.png',
        '/images/festival-square/icons/design-icon.png'
      ],
      iconLabels: ['Learn', 'Draw', 'Design'],
      buttonText: "Let's Explore",
      character: 'ganesha-artist'
    },

    'game3': {
      title: "Modak Party",
      description: "Sweet ingredients are ready. Mix and see what you can make.",
      icons: [
        '/images/festival-square/icons/recipe-icon.png',
        '/images/festival-square/icons/cook-icon.png',
        '/images/festival-square/icons/serve-icon.png'
      ],
      iconLabels: ['Recipe', 'Cook', 'Serve'],
      buttonText: "Let's Explore",
      character: 'ganesha-chef'
    },

    'game4': {
      title: "Mandap Magic",
      description: "The space is yours. Decorate it in your own way.",
      icons: [
        '/images/festival-square/icons/mandap-coconut-icon.png',
        '/images/festival-square/icons/mandap-diya-icon.png',
        '/images/festival-square/icons/mandap-flower-icon.png'
      ],
      iconLabels: ['Learn', 'Build', 'Decorate'],
      buttonText: "Let's Explore",
      character: 'ganesha-happy-sitting'
    }
  },

  // ========================================
  // ABOUT ME HUT
  // ========================================
  'about-me-hut': {
'my-indian-story': {
  title: "My Indian Story",
  description: "Let's explore my Indian story and yours!",
  icons: [
    '/images/about-me-hut/house-icon.webp',
    '/images/about-me-hut/language-icon.webp',
    '/images/about-me-hut/festival-icon.webp'
  ],
  iconLabels: ['Home', 'Language', 'Festival'],
  buttonText: "Let's Explore",
  character: 'baby-ganesha-sit'
},
    'family-tree': {
      title: "Our families",
      description: "Let's meet my family and yours!",
      icons: [
        '/images/about-me-hut/house-icon.webp',
        '/images/about-me-hut/heart-icon.webp',
        '/images/about-me-hut/family-icon.webp'
      ],
      iconLabels: ['Home', 'Heart', 'Family'],
      buttonText: "Let's Explore",
      character: 'baby-ganesha-sit'
    },

    'favorite-food': {
      title: "Our Favorite Things",
      description: "Let's find my favorite things and yours!",
      icons: [
        '/images/about-me-hut/food-icon.webp',
        '/images/about-me-hut/color-icon.webp',
        '/images/about-me-hut/sports-icon.webp'
      ],
      iconLabels: ['Food', 'Color', 'Activity'],
      buttonText: "Let's Explore",
      character: 'baby-ganesha-sit'
    },

    'dreams-wishes': {
      title: "Dream Together",
      description: "Let's help and dream together!",
      icons: [
        '/images/about-me-hut/heart-icon.webp',
        '/images/about-me-hut/shootingstar-icon.webp',
        '/images/about-me-hut/world-icon.webp'
      ],
      iconLabels: ['Heart', 'Star', 'World'],
      buttonText: "Let's Start",
      character: 'baby-ganesha-sit'
    }
  }
};

// Helper function to get opening modal content by zone and scene
export const getOpeningModal = (zoneId, sceneId) => {
  return OPENING_MODALS[zoneId]?.[sceneId] || null;
};

// Helper to check if opening modal exists
export const hasOpeningModal = (zoneId, sceneId) => {
  return !!OPENING_MODALS[zoneId]?.[sceneId];
};

