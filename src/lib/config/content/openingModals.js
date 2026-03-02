// Opening Modal Content for All 22 Scenes
// Organized by zone → scene

export const OPENING_MODALS = {

  // ========================================
  // SYMBOL MOUNTAIN
  // ========================================
  'symbol-mountain': {
    'modak': {
      title: "Share the Modaks",
      description: "Mooshika is nearby. Can you find him before he scurries away?",
      icons: ['mooshika', 'modak', 'belly'],
      buttonText: "Let's Explore",
      character: 'ganesha-happy'
    },

    'pond': {
      title: "Wake the Lotus",
      description: "The pond rests quietly. A golden lotus is waiting to bloom.",
      icons: ['lotus', 'trunk'],
      iconLabels: ['Lotus', 'Trunk'],
      buttonText: "Let's Explore",
      character: null
    },

    'symbol': {
      title: "Play the Notes",
      description: "The mountain is listening. Follow the rhythm and see what awakens.",
      icons: ['eyes', 'ears', 'tusk'],
      iconLabels: ['Eyes', 'Ears', 'Tusk'],
      buttonText: "Let's Explore",
      character: null
    },

    'final-scene': {
      title: "Shine Together",
      description: "All the symbols are ready. Place them gently and watch them glow.",
      icons: ['vakratunda', 'meaning'],
      buttonText: "Let's Explore",
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
      title: "Bloom and Grow",
      description: "Say the word clearly and watch the flowers bloom.",
      icons: ['vakratunda-app', 'mahakaya-app'],
      buttonText: "Let's Explore",
      character: 'ganesha-headphones'
    },

    'suryakoti-bank': {
      title: "Sun and Smiles",
      description: "Call the light forward and see the world brighten around you.",
      icons: ['suryakoti-app', 'samaprabha-app'],
      buttonText: "Let's Explore",
      character: 'ganesha-headphones'
    },

    'nirvighnam-chant': {
      title: "Clear the Path",
      description: "Chant with steady rhythm and feel the way appear.",
      icons: ['nirvighnam-app', 'kurumedeva-app'],
      buttonText: "Let's Explore",
      character: 'ganesha-headphones'
    },

    'sarvakaryeshu-chant': {
      title: "Care and Share",
      description: "Say the words with heart and watch kindness spread.",
      icons: ['sarvakaryeshu-app', 'sarvada-app'],
      iconLabels: ['Day', 'Night'],
      buttonText: "Let's Explore",
      character: 'ganesha-headphones'
    },

    'shloka-river-finale': {
      title: "Chant and Celebrate",
      description: "All the words flow together. Let your voice lead the river.",
      icons: ['vakratunda-app','mahakaya-app','suryakoti-app','samaprabha-app','nirvighnam-app','kurumedeva-app','sarvakaryeshu-app','sarvada-app'],
      iconLabels: ['VA','MA','SU','SA','NI','KU','SAR','SAR'],
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
      icons: ['listen-icon', 'play-icon', 'create-icon'],
      iconLabels: ['Listen', 'Play', 'Create'],
      buttonText: "Let's Explore",
      character: 'ganesha-musician'
    },

    'game2': {
      title: "Sparkly Rangoli",
      description: "Colors rest on the floor. Create something bright and beautiful.",
      icons: ['learn-icon', 'draw-icon', 'design-icon'],
      iconLabels: ['Learn', 'Draw', 'Design'],
      buttonText: "Let's Explore",
      character: 'ganesha-artist'
    },

    'game3': {
      title: "Modak Party",
      description: "Sweet ingredients are ready. Mix and see what you can make.",
      icons: ['recipe-icon', 'cook-icon', 'serve-icon'],
      iconLabels: ['Recipe', 'Cook', 'Serve'],
      buttonText: "Let's Explore",
      character: 'ganesha-chef'
    },

    'game4': {
      title: "Mandap Magic",
      description: "The space is yours. Decorate it in your own way.",
      icons: ['mandap-learn-icon','mandap-build-icon','mandap-decorate-icon'],
      iconLabels: ['Learn', 'Build', 'Decorate'],
      buttonText: "Let's Explore",
      character: 'ganesha-happy-sitting'
    }
  },

  // ========================================
  // ABOUT ME HUT
  // ========================================
  'about-me-hut': {
    'name-birthday': {
      title: "Let's Be Friends",
      description: "Ganesha would love to know you. Share a little about yourself.",
      icons: ['balloons', 'birthday'],
      iconLabels: ['Name', 'Birthday'],
      buttonText: "Let's Explore",
      character: 'baby-ganesha-sit'
    },

    'family-tree': {
      title: "Our Special World",
      description: "Every family is unique. Show what makes yours special.",
      icons: ['shiva', 'parvati', 'kartikeya'],
      iconLabels: ['Father', 'Mother', 'Brother'],
      buttonText: "Let's Explore",
      character: 'baby-ganesha-sit'
    },

    'favorite-food': {
      title: "What We Love",
      description: "Favorites tell a story. Share what you enjoy most.",
      icons: ['food', 'color', 'activity'],
      iconLabels: ['Food', 'Color', 'Activity'],
      buttonText: "Let's Explore",
      character: 'baby-ganesha-sit'
    },

    'dreams-wishes': {
      title: "Dream Big Together",
      description: "Every dream begins with a thought. See where yours can lead.",
      icons: ['wish-earth', 'wish-share', 'wish-flower'],
      iconLabels: ['Earth', 'Share', 'Flower'],
      buttonText: "Let's Explore",
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
