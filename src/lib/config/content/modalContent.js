// Modal Content - Regular modals and completion messages
// Used in Cave (after door puzzles), Play Zones, and general UI

export const MODAL_CONTENT = {
  // ========================================
  // CAVE OF SECRETS - Door Completion Modals
  // ========================================
  'meaning-cave': {
    'vakratunda-mahakaya': {
      door1Complete: {
        title: "Door Unlocked!",
        description: "You chanted VAKRATUNDA! Now trace the curved trunk to discover its power.",
        icon: 'door-open',
        buttonText: "Start Tracing"
      },

      door2Complete: {
        title: "Door Unlocked!",
        description: "You chanted MAHAKAYA! Click the sacred stones to make Ganesha grow mighty.",
        icon: 'door-open',
        buttonText: "Grow Ganesha"
      }
    },

    'suryakoti-samaprabha': {
      door1Complete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        icon: 'door-open',
        buttonText: "Continue"
      },

      door2Complete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        icon: 'door-open',
        buttonText: "Continue"
      }
    },

    'nirvighnam-kurumedeva': {
      door1Complete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        icon: 'door-open',
        buttonText: "Continue"
      },

      door2Complete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        icon: 'door-open',
        buttonText: "Continue"
      }
    },

    'sarvakaryeshu-sarvada': {
      door1Complete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        icon: 'door-open',
        buttonText: "Continue"
      },

      door2Complete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        icon: 'door-open',
        buttonText: "Continue"
      }
    }
  },

  // ========================================
  // FESTIVAL SQUARE - Play Zone Modals
  // ========================================
  'festival-square': {
    'piano-game': {
      welcome: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Start Playing"
      },

      levelComplete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Next Level"
      },

      gameComplete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Celebrate!"
      }
    },

    'rangoli-game': {
      welcome: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Create Rangoli"
      },

      patternComplete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Continue"
      },

      gameComplete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Celebrate!"
      }
    },

    'cooking-game': {
      welcome: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Start Cooking"
      },

      dishComplete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Next Dish"
      },

      gameComplete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Celebrate!"
      }
    },

    'mandap-decor': {
      welcome: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Start Decorating"
      },

      sectionComplete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Continue"
      },

      gameComplete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Celebrate!"
      }
    }
  },

  // ========================================
  // ABOUT ME HUT - Play Zone Modals
  // ========================================
  'about-me-hut': {
    'name-scene': {
      welcome: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Tell My Name"
      },

      complete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Continue"
      }
    },

    'family-tree': {
      welcome: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Build Tree"
      },

      memberAdded: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Add Another"
      },

      complete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "View Tree"
      }
    },

    'food-scene': {
      welcome: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Choose Food"
      },

      foodSelected: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Continue"
      },

      complete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Done"
      }
    },

    'enjoy-scene': {
      welcome: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Share Interests"
      },

      activityAdded: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Add More"
      },

      complete: {
        title: "TODO: Add title",
        description: "TODO: Add description",
        buttonText: "Done"
      }
    }
  }
};

// ========================================
// RESUME POPUPS - Used across all zones
// ========================================
export const RESUME_MESSAGES = {
  'meaning-cave': {
    'vakratunda-mahakaya': {
      door1InProgress: "Continue placing syllables! {count}/4 placed!",
      tracingInProgress: "Continue tracing Mooshika's curved path!",
      door2InProgress: "Continue arranging syllables for Mahakaya! {count}/4 placed!",
      growingInProgress: "Continue learning Mahakaya! Click the body parts ({count}/4)!"
    },

    'suryakoti-samaprabha': {
      door1InProgress: "TODO: Add message",
      door2InProgress: "TODO: Add message"
    }
  },

  'symbol-mountain': {
    'modak': {
      searchInProgress: "Keep searching! You've checked {count}/5 mounds. Mooshika is hiding in one!",
      collectionInProgress: "Continue collecting modaks! You have {count}/3 in the basket!",
      feedingInProgress: "Keep feeding the rock with modaks! You have fed {count}/3!"
    },

    'pond-scene': {
      inProgress: "TODO: Add message"
    }
  },

  'shloka-river': {
    'vakratunda-grove': {
      vakratundaInProgress: "Continue matching syllables for Vakratunda! {count}/4 matched!",
      mahakayaInProgress: "Continue growing flowers for Mahakaya! {count}/4 bloomed!"
    },

    'suryakoti-bank': {
      game1InProgress: "TODO: Add message",
      game2InProgress: "TODO: Add message"
    }
  },

  'festival-square': {
    'piano-game': {
      inProgress: "TODO: Add message"
    },

    'rangoli-game': {
      inProgress: "TODO: Add message"
    }
  },

  'about-me-hut': {
    'name-scene': {
      inProgress: "TODO: Add message"
    }
  }
};

// ========================================
// SUCCESS MESSAGES - Celebration text
// ========================================
export const SUCCESS_MESSAGES = {
  syllableMatched: "Great match!",
  symbolUnlocked: "Symbol unlocked!",
  powerGained: "New power gained!",
  missionComplete: "Mission complete!",
  sceneComplete: "Scene complete!",
  perfectScore: "Perfect score!",
  firstTry: "Amazing! First try!",

  // Zone-specific
  caveUnlocked: "Ancient door unlocked!",
  symbolFound: "Sacred symbol found!",
  chantLearned: "Chant mastered!",
  gameWon: "You won!"
};

// ========================================
// Helper Functions
// ========================================

// Get modal content by zone, scene, and modal key
export const getModalContent = (zoneId, sceneId, modalKey) => {
  return MODAL_CONTENT[zoneId]?.[sceneId]?.[modalKey] || null;
};

// Get resume message by zone, scene, and phase
export const getResumeMessage = (zoneId, sceneId, phaseKey, variables = {}) => {
  let message = RESUME_MESSAGES[zoneId]?.[sceneId]?.[phaseKey] || null;

  if (!message) return null;

  // Replace variables like {count}
  Object.keys(variables).forEach(key => {
    message = message.replace(`{${key}}`, variables[key]);
  });

  return message;
};

// Get success message
export const getSuccessMessage = (messageKey) => {
  return SUCCESS_MESSAGES[messageKey] || "Well done!";
};

// Format modal content with variables
export const formatModalContent = (content, variables = {}) => {
  if (!content) return null;

  const formatted = { ...content };

  Object.keys(variables).forEach(key => {
    if (formatted.description) {
      formatted.description = formatted.description.replace(`{${key}}`, variables[key]);
    }
    if (formatted.title) {
      formatted.title = formatted.title.replace(`{${key}}`, variables[key]);
    }
  });

  return formatted;
};
