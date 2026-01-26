// Opening Modal Content for All 22 Scenes
// Organized by zone → scene

export const OPENING_MODALS = {
  // ========================================
  // CAVE OF SECRETS (Meaning Cave)
  // ========================================
  'meaning-cave': {
    'vakratunda-mahakaya': {
      title: "Unlock the Curved Trunk Chamber!",
      subtitle: "2 ancient Sanskrit chants are hidden here!",
      icons: ['vakratunda', 'mahakaya'],
      iconLabels: ['Curved Trunk', 'Great Body'],
      buttonText: "Enter the Cave",
      character: null
    },

    'suryakoti-samaprabha': {
      title: "Unlock the Million Suns Chamber!",
      subtitle: "2 radiant Sanskrit chants are hidden here!",
      icons: ['suryakoti', 'samaprabha'],
      iconLabels: ['Million Suns', 'Equal Radiance'],
      buttonText: "Enter the Cave",
      character: null
    },

    'nirvighnam-kurumedeva': {
      title: "Unlock the Obstacle Remover Chamber!",
      subtitle: "2 powerful Sanskrit chants are hidden here!",
      icons: ['nirvighnam', 'kurumedeva'],
      iconLabels: ['No Obstacles', 'Do For Me'],
      buttonText: "Enter the Cave",
      character: null
    },

    'sarvakaryeshu-sarvada': {
      title: "Unlock the Divine Tasks Chamber!",
      subtitle: "2 powerful Sanskrit chants are hidden here!",
      icons: ['sarvakaryeshu', 'sarvada'],
      iconLabels: ['All Actions', 'Always'],
      buttonText: "Enter the Cave",
      character: null
    },

    'final-meaning-scene': {
      title: "The Final Challenge!",
      subtitle: "You have gathered all the ancient wisdom!",
      description: "Now, match the symbols to their meanings to master the Cave of Secrets!",
      icons: ['vakratunda', 'meaning'],
      iconLabels: ['Symbols', 'Meanings'],
      buttonText: "Start Memory Game",
      character: 'ganesha-cave'
    }
  },

  // ========================================
  // SYMBOL MOUNTAIN
  // ========================================
  'symbol-mountain': {
    'modak': {
      title: "Help Ganesha Save the Forest!",
      subtitle: "3 magical friends are hiding — let's find them!",
      description: "Search for Mooshika, collect modaks, and discover the power of gratitude!",
      icons: ['mooshika', 'modak', 'belly'],
      buttonText: "Begin Adventure!",
      character: 'ganesha-happy'
    },

    'pond': {
      title: "Explore the Sacred Pond!",
      subtitle: "2 magical symbols are hidden here!",
      icons: ['lotus', 'trunk'],
      iconLabels: ['Lotus', 'Trunk'],
      buttonText: "Begin Adventure!",
      character: null
    },

    'tusk': {
      title: "Master the Musical Mountain!",
      subtitle: "3 sacred sounds are hidden here!",
      icons: ['eyes', 'ears', 'tusk'],
      iconLabels: ['Eyes', 'Ears', 'Tusk'],
      buttonText: "Begin Adventure!",
      character: null
    }
  },

  // ========================================
  // SHLOKA RIVER
  // ========================================
  'shloka-river': {
    'vakratunda-grove': {
      title: "Welcome to Vakratunda Grove!",
      subtitle: "Where Ancient Chants Echo",
      icons: ['vakratunda-app', 'mahakaya-app'],
      buttonText: "Let's Chant!",
      character: 'ganesha-headphones'
    },

    'suryakoti-bank': {
      title: "Welcome to Suryakoti Bank!",
      subtitle: "River of Light",
      icons: ['suryakoti-app', 'samaprabha-app'],
      buttonText: "Let's Chant!",
      character: 'ganesha-headphones'
    },

    'nirvighnam-chant': {
      title: "Welcome to Nirvighnam Waters!",
      subtitle: "River of Obstacle Removal",
      icons: ['nirvighnam-app', 'kurumedeva-app'],
      buttonText: "Let's Chant!",
      character: 'ganesha-headphones'
    },

    'sarvakaryeshu-chant': {
      title: "🌙 Every Day, Always",
      subtitle: "River of Constant Blessings",
      icons: ['sarvakaryeshu-app', 'sarvada-app'],
      iconLabels: ['Day', 'Night'],
      buttonText: "Let's Chant!",
      character: 'ganesha-headphones'
    },

    'shloka-river-finale': {
      title: "🎊 The Grand Shloka Celebration!",
      subtitle: "You have mastered all 8 sacred chants!",
      description: "Chant the complete Vakratunda Mahakaya Shloka with Ganesha!",
      icons: ['vakratunda-app', 'mahakaya-app', 'suryakoti-app', 'samaprabha-app', 'nirvighnam-app', 'kurumedeva-app', 'sarvakaryeshu-app', 'sarvada-app'],
      iconLabels: ['VA', 'MA', 'SU', 'SA', 'NI', 'KU', 'SAR', 'SAR'],
      buttonText: "Begin Celebration!",
      character: 'ganesha-headphones'
    }
  },

  // ========================================
  // FESTIVAL SQUARE (Play Zone)
  // ========================================
  'festival-square': {
    'game1': {
      title: "Piano Time! 🎹",
      subtitle: "Let's create beautiful festival melodies together!",
      icons: ['listen-icon', 'play-icon', 'create-icon'],
      iconLabels: ['Listen', 'Play', 'Create'],
      buttonText: "Let's Play!",
      character: 'ganesha-musician'
    },

    'game2': {
      title: "Rangoli Time! 🎨",
      subtitle: "Let's create beautiful festival art together!",
      icons: ['learn-icon', 'draw-icon', 'design-icon'],
      iconLabels: ['Learn', 'Draw', 'Design'],
      buttonText: "Let's Create!",
      character: 'ganesha-artist'
    },

    'game3': {
      title: "Modak Time! 🍬",
      subtitle: "Let's cook Ganesha's favorite sweet together!",
      icons: ['recipe-icon', 'cook-icon', 'serve-icon'],
      iconLabels: ['Recipe', 'Cook', 'Serve'],
      buttonText: "Let's Cook!",
      character: 'ganesha-chef'
    },

    'game4': {
      title: "Mandap Time! 🏛️",
      subtitle: "Let's create a beautiful wedding canopy together!",
      icons: ['mandap-learn-icon', 'mandap-build-icon', 'mandap-decorate-icon'],
      iconLabels: ['Learn', 'Build', 'Decorate'],
      buttonText: "Let's Build!",
      character: 'ganesha-happy-sitting'
    }
  },

  // ========================================
  // ABOUT ME HUT (Play Zone)
  // ========================================
  'about-me-hut': {
    'name-birthday': {
      title: "Name & Birthday Quest!",
      subtitle: "I have a special name and a special birthday.",
      description: "Let's discover them together!",
      icons: [],
      buttonText: "Let's Begin 🌱",
      character: 'baby-ganesha-sit'
    },

    'family-tree': {
      title: "Meet My Family",
      subtitle: "This is my family. They make me who I am.",
      description: "Let me show you the people I love!",
      icons: [],
      buttonText: "Meet My Family 💛",
      character: 'baby-ganesha-sit'
    },

    'favorite-food': {
      title: "The Favorites Match!",
      subtitle: "I have some things I love more than anything!",
      description: "Can you guess my favorites?",
      icons: [],
      buttonText: "Let's Play! 🎯",
      character: 'baby-ganesha-sit'
    },

    'dreams-wishes': {
      title: "Dreams & Wishes",
      subtitle: "I have three happy wishes for the world.",
      description: "Let's make them come true together.",
      icons: ['wish-earth', 'wish-share', 'wish-flower'],
      buttonText: "Let's Begin! ✨",
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
