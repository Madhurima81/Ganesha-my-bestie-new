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
    'modak': {
      search: "🔍 WHERE IS MOOSHIKA? Click the mounds!",
      collection: "🍬 HELP MOOSHIKA! Collect {count}/3 modaks!",
      feeding: "🪨 FEED GANESHA! Share {count}/3 modaks!",
      celebration: "🎉 MISSION COMPLETE! You unlocked all 3 symbols!",
      complete: "✨ Gratitude Power Unlocked!"
    },

    'pond': {
      initial: "🌸 BLOOM THE LOTUSES! Click to open them!",
      goldenVisible: "✨ FIND THE GOLDEN LOTUS! It's hiding somewhere!",
      elephantVisible: "🐘 FILL THE POND! Use the elephant's trunk!",
      complete: "🎊 POND COMPLETE! Both symbols unlocked!"
    },

    'tusk': {
      eyes: "🔭 FIND THE HIDDEN OBJECTS! Use your laser focus!",
      ears: "🎵 LISTEN TO THE RHYTHM! Match the musical notes!",
      tusk: "🎹 COMPLETE THE SONG! Place the notes in the tusk!",
      complete: "🎊 MUSICAL MOUNTAIN MASTERED! All powers unlocked!"
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
    // Scene 1: Name & Birthday
    'name-birthday': {
      'name-balloons': "Pop the balloons in order! 🎈",
      'name-complete': "Amazing! All balloons popped! 🎉",
      'child-name-intro': "Hi! I am Ganesha.",
      'child-name-input': "Tap the letters to spell your name! 🎈",
      'child-name-complete': "What a beautiful name! 🌟",
      'birthday-intro': "Let's Find My Birthday 🎂",
      'birthday-choice': "Which festival is my birthday? 🎊",
      'birthday-correct': "Yes! Ganesh Chaturthi is my birthday! 🎉",
      'child-birthday-intro': "But when is YOUR birthday? 🎂",
      'child-birthday-month': "Tap the month you were born! 🗓️",
      'child-birthday-date': "Which day in {month}? 📅",
      'besties-card': "BEST FRIENDS FOREVER! 💖"
    },

    // Scene 2: Family Tree
    'family-tree': {
      'ganeshaTree': "👉 Tap a circle to meet my family!",
      'ganeshaTree-complete': "Amazing! You completed Ganesha's family tree!",
      'transition': "That's my family! Now, I want to see your world.",
      'childInput': "👇 Tap someone to add to your tree! 🌱",
      'sideBySide': "Look at Our Family Trees! Connected by Love 💛"
    },

    // Scene 3: Favorite Things
    'favorite-food': {
      'food-choice': "Which one is my favorite? 🍬",
      'food-correct': "Yes! Modak is my favorite! 🎉",
      'color-choice': "What's my favorite color? 🎨",
      'color-correct': "Yes! Orange is my favorite color! 🧡",
      'activity-choice': "What do I love to do? 🤔",
      'activity-correct': "Yes! I love Dancing! 💃✨",
      'friend-intro': "Great! Now find my best friend!",
      'friend-choice': "Who is my best friend? 🤔",
      'friend-correct': "Yes! Mushika is my best friend! 🐭✨",
      'child-intro': "Now it's your turn! 😊 Tell me about you.",
      'child-food-choice': "What's YOUR favorite food? 🍕",
      'child-color-choice': "What's YOUR favorite color? 🎨",
      'child-activity-choice': "What do YOU love to do? 🎮",
      'child-friend-intro': "My best friend is... 👫",
      'friend-celebration': "Yay! {friendName} is your best friend! 🎉",
      'comparison-card': "You and Ganesha are friends forever! ✨"
    },

    // Scene 4: Dreams & Wishes
    'dreams-wishes': {
      'wish1-intro': "My first wish is for a happy world.",
      'wish1-active': "Tap the earth {count} times to send smiles! ({count}/3)",
      'wish1-complete': "You made the world smile! 😊✨",
      'wish2-intro': "My second wish is that no one feels hungry or alone.",
      'wish2-active': "Tap the bowls {count} times to fill them! ({count}/3)",
      'wish2-complete': "You filled hearts with sharing! ✨",
      'wish3-intro': "My last wish is for a green, happy world.",
      'wish3-active': "Tap the park {count} times to make it bloom! ({count}/3)",
      'wish3-complete': "You made the world green and playful! ✨",
      'all-wishes-complete': "WOW! You made the world brighter! ✨",
      'dream-intro': "Draw a happy wish on this magic canvas! ✨",
      'dream-clouded': "Tap my trunk {count} times to move the clouds! ☁️",
      'dream-revealed': "Your dream will come true! I believe in you! 🌟",
      'comparison-card': "Dreams Come Together! ✨ Friends Help Each Other"
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
