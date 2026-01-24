// Opening Modal Content for All 22 Scenes
// Organized by zone → scene

export const OPENING_MODALS = {
  // ========================================
  // CAVE OF SECRETS (Meaning Cave)
  // ========================================
  'meaning-cave': {
    'vakratunda-mahakaya': {
      title: "Unlock the Cave of Secrets!",
      subtitle: "2 sacred Sanskrit chants are hidden here!",
      description: "Help unlock the ancient doors to discover Vakratunda and Mahakaya!",
      icons: ['vakratunda', 'mahakaya'],
      buttonText: "Enter the Cave",
      character: 'ganesha-headphones' // or null
    },

    'suryakoti-samaprabha': {
      title: "Door of Light Awaits!",
      subtitle: "TODO: Add content from actual scene",
      description: "",
      icons: ['suryakoti', 'samaprabha'],
      buttonText: "Enter",
      character: null
    },

    'nirvighnam-kurumedeva': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: ['nirvighnam', 'kurumedeva'],
      buttonText: "Begin",
      character: null
    },

    'sarvakaryeshu-sarvada': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: ['sarvakaryeshu', 'sarvada'],
      buttonText: "Enter",
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
    'modak-scene': {
      title: "Help Ganesha Save the Forest!",
      subtitle: "3 magical friends are hiding — let's find them!",
      description: "Search for Mooshika, collect modaks, and discover the power of gratitude!",
      icons: ['mooshika', 'modak', 'belly'],
      buttonText: "Begin Adventure!",
      character: 'ganesha-happy'
    },

    'pond-scene': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Start",
      character: null
    },

    'tusk-scene': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Begin",
      character: null
    }
  },

  // ========================================
  // SHLOKA RIVER
  // ========================================
  'shloka-river': {
    'vakratunda-grove': {
      title: "Welcome to Vakratunda Grove!",
      subtitle: "Learn 2 Sanskrit chants with Ganesha!",
      description: "Match syllables and grow flowers while mastering sacred words!",
      icons: ['vakratunda-app', 'mahakaya-app'],
      buttonText: "Begin Learning!",
      character: 'ganesha-headphones'
    },

    'suryakoti-bank': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Start Chanting",
      character: 'ganesha-headphones'
    },

    'nirvighnam-chant': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Begin",
      character: 'ganesha-headphones'
    },

    'sarvakaryeshu-chant': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Start",
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
    'piano-game': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Play Music",
      character: null
    },

    'rangoli-game': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Create Rangoli",
      character: null
    },

    'cooking-game': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Start Cooking",
      character: null
    },

    'mandap-decor': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Decorate",
      character: null
    }
  },

  // ========================================
  // ABOUT ME HUT (Play Zone)
  // ========================================
  'about-me-hut': {
    'name-scene': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Tell My Name",
      character: null
    },

    'family-tree': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Build Family Tree",
      character: null
    },

    'food-scene': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Choose Food",
      character: null
    },

    'enjoy-scene': {
      title: "TODO: Add title",
      subtitle: "TODO: Add subtitle",
      description: "",
      icons: [],
      buttonText: "Share What I Enjoy",
      character: null
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
