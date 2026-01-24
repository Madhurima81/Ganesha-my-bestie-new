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
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Begin Final Scene",
      character: null
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
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Complete Journey",
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
      icons: [],
      buttonText: "Let's Play!",
      character: 'baby-ganesha-sit'
    },

    'game2': {
      title: "Rangoli Time! 🎨",
      subtitle: "Let's create beautiful festival art together!",
      icons: [],
      buttonText: "Let's Create!",
      character: 'baby-ganesha-sit'
    },

    'game3': {
      title: "Modak Time! 🍬",
      subtitle: "Let's cook Ganesha's favorite sweet together!",
      icons: [],
      buttonText: "Let's Cook!",
      character: 'baby-ganesha-sit'
    },

    'game4': {
      title: "Mandap Time! 🏛️",
      subtitle: "Let's create a beautiful wedding canopy together!",
      icons: ['mandap-decorate'],
      iconLabels: ['Decorate'],
      buttonText: "Let's Build!",
      character: 'baby-ganesha-sit'
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
