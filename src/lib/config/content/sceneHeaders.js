// Scene Header Content - Phase-specific game instructions
// Organized by zone → scene → phase

export const SCENE_HEADERS = {
  // ========================================
  // CAVE OF SECRETS (Meaning Cave)
  // ========================================
  'meaning-cave': {
    'vakratunda-mahakaya': {
      door1: "🔱 SPELL VAKRATUNDA! Drag the syllables in order!",
      tracing: "🐭 TRACE THE CURVED TRUNK! Follow the path!",
      door2: "🔱 SPELL MAHAKAYA! Arrange the syllables!",
      growing: "💎 CLICK THE SACRED STONES! Make Ganesha mighty!",
      complete: "✨ Both Powers Unlocked!"
    },

    'suryakoti-samaprabha': {
      initial: "TODO: Add header",
      door1: "TODO: Add header",
      door2: "TODO: Add header",
      complete: "TODO: Add header"
    },

    'nirvighnam-kurumedeva': {
      initial: "TODO: Add header",
      door1: "TODO: Add header",
      door2: "TODO: Add header",
      complete: "TODO: Add header"
    },

    'sarvakaryeshu-sarvada': {
      initial: "TODO: Add header",
      door1: "TODO: Add header",
      door2: "TODO: Add header",
      complete: "TODO: Add header"
    },

    'final-meaning-scene': {
      initial: "TODO: Add header",
      complete: "TODO: Add header"
    }
  },

  // ========================================
  // SYMBOL MOUNTAIN
  // ========================================
  'symbol-mountain': {
    'modak-scene': {
      search: "🔍 WHERE IS MOOSHIKA? Click the mounds!",
      collection: "🍬 HELP MOOSHIKA! Collect {count}/3 modaks!",
      feeding: "🪨 FEED GANESHA! Share {count}/3 modaks!",
      celebration: "🎉 MISSION COMPLETE! You unlocked all 3 symbols!",
      complete: "✨ Gratitude Power Unlocked!"
    },

    'pond-scene': {
      initial: "TODO: Add header",
      search: "TODO: Add header",
      interaction: "TODO: Add header",
      complete: "TODO: Add header"
    },

    'tusk-scene': {
      initial: "TODO: Add header",
      search: "TODO: Add header",
      interaction: "TODO: Add header",
      complete: "TODO: Add header"
    }
  },

  // ========================================
  // SHLOKA RIVER
  // ========================================
  'shloka-river': {
    'vakratunda-grove': {
      initial: "🎵 Welcome to the Grove!",
      vakratundaGame: "🎵 LEARN VAKRATUNDA! Match the syllables!",
      vakratundaComplete: "✨ Vakratunda Mastered!",
      mahakayaStory: "📖 Time to Learn Mahakaya!",
      mahakayaGame: "🌺 LEARN MAHAKAYA! Grow the flowers!",
      mahakayaComplete: "✨ Mahakaya Mastered!",
      complete: "🎊 Both Chants Complete!"
    },

    'suryakoti-bank': {
      initial: "TODO: Add header",
      game1: "TODO: Add header",
      game2: "TODO: Add header",
      complete: "TODO: Add header"
    },

    'nirvighnam-chant': {
      initial: "TODO: Add header",
      game1: "TODO: Add header",
      game2: "TODO: Add header",
      complete: "TODO: Add header"
    },

    'sarvakaryeshu-chant': {
      initial: "TODO: Add header",
      game1: "TODO: Add header",
      game2: "TODO: Add header",
      complete: "TODO: Add header"
    },

    'shloka-river-finale': {
      initial: "TODO: Add header",
      complete: "TODO: Add header"
    }
  },

  // ========================================
  // FESTIVAL SQUARE (Play Zone)
  // ========================================
  'festival-square': {
    'piano-game': {
      initial: "TODO: Add header",
      playing: "TODO: Add header",
      complete: "TODO: Add header"
    },

    'rangoli-game': {
      initial: "TODO: Add header",
      creating: "TODO: Add header",
      complete: "TODO: Add header"
    },

    'cooking-game': {
      initial: "TODO: Add header",
      cooking: "TODO: Add header",
      complete: "TODO: Add header"
    },

    'mandap-decor': {
      initial: "TODO: Add header",
      decorating: "TODO: Add header",
      complete: "TODO: Add header"
    }
  },

  // ========================================
  // ABOUT ME HUT (Play Zone)
  // ========================================
  'about-me-hut': {
    'name-scene': {
      initial: "TODO: Add header",
      complete: "TODO: Add header"
    },

    'family-tree': {
      initial: "TODO: Add header",
      building: "TODO: Add header",
      complete: "TODO: Add header"
    },

    'food-scene': {
      initial: "TODO: Add header",
      choosing: "TODO: Add header",
      complete: "TODO: Add header"
    },

    'enjoy-scene': {
      initial: "TODO: Add header",
      sharing: "TODO: Add header",
      complete: "TODO: Add header"
    }
  }
};

// Helper function to get header content by zone, scene, and phase
export const getSceneHeader = (zoneId, sceneId, phase) => {
  return SCENE_HEADERS[zoneId]?.[sceneId]?.[phase] || null;
};

// Helper to get all headers for a scene
export const getSceneHeaders = (zoneId, sceneId) => {
  return SCENE_HEADERS[zoneId]?.[sceneId] || {};
};

// Helper for dynamic headers with variables (e.g., count)
export const formatHeader = (headerText, variables = {}) => {
  if (!headerText) return '';

  let formatted = headerText;
  Object.keys(variables).forEach(key => {
    formatted = formatted.replace(`{${key}}`, variables[key]);
  });

  return formatted;
};
