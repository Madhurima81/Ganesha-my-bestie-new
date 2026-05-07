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
      initial: "☀️ DISCOVER DIVINE LIGHT! Learn the radiant chants!",
      door1: "☀️ SPELL SURYAKOTI! Drag the syllables in order!",
      door1Collect: "🌟 COLLECT THE SUNS! Tap to save the animals!",
      door2: "✨ SPELL SAMAPRABHA! Arrange the syllables!",
      door2Collect: "💫 BALANCE THE LIGHT! Help the animals!",
      complete: "✨ Both Light Powers Unlocked!"
    },

    'nirvighnam-kurumedeva': {
      initial: "🪨 LEARN OBSTACLE REMOVAL! Master the divine chants!",
      door1: "🔱 SPELL NIRVIGHNAM! Drag the syllables in order!",
      door1Game: "🪨 REMOVE OBSTACLES! Clear the path for animals!",
      door2: "🙏 SPELL KURUMEDEVA! Arrange the syllables!",
      door2Game: "🙏 RECEIVE BLESSINGS! Help the animals!",
      complete: "✨ Both Obstacle Powers Unlocked!"
    },

    'sarvakaryeshu-sarvada': {
      initial: "🌟 BLESS ALL ACTIONS! Learn the eternal chants!",
      door1: "📿 SPELL SARVAKARYESHU! Drag the syllables in order!",
      door1Game: "📿 BLESS ALL TASKS! Help the animals succeed!",
      door2: "🌙 SPELL SARVADA! Arrange the syllables!",
      door2Game: "🌙 ETERNAL BLESSINGS! Spin the wheel of help!",
      complete: "✨ Both Eternal Powers Unlocked!"
    },

    'final-meaning-scene': {
      initial: "🧠 THE FINAL CHALLENGE! Match symbols to meanings!",
      round1: "🎯 Round 1 of 2 - Match the symbols with their meanings!",
      round2: "🎯 Round 2 of 2 - Match the remaining symbols!",
      helperText: "Match the symbols with their meanings! 🎯",
      complete: "🎊 CAVE MASTERED! All 8 symbols matched!"
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
      'initial': "☀️ Welcome to Suryakoti Bank! Master the radiant chants!",
      'memoryGameActive': "☀️ SURYAKOTI - Match the syllables! Tap the matching pairs!",
      'suryakotiComplete': "✨ SURYAKOTI Mastered! You have the power of million suns!",
      'blessingSuryakoti': "☀️ Ganesha blesses you with Solar Clarity!",
      'rescueSuryakoti': "🌻 Use your sun power to help the flowers bloom!",
      'samaprabhaStory': "🌈 Now learn SAMAPRABHA - Equal Radiance!",
      'samaprabhaGame': "🌈 SAMAPRABHA - Balance the colors! Match the rainbow!",
      'samaprabhaComplete': "✨ SAMAPRABHA Mastered! You radiate equal light!",
      'blessingSamaprabha': "🌟 Ganesha blesses you with Radiant Light!",
      'rescueSamaprabha': "🐰 Use your rainbow power to help the animals!",
      'complete': "🌟 Both Radiant Powers Unlocked! Scene Complete!"
    },

    'nirvighnam-chant': {
      'initial': "🕉️ Welcome to Nirvighnam Waters! Master obstacle removal!",
      'memoryGameActive': "🪨 NIRVIGHNAM - Clear the obstacles! Match the stones!",
      'nirvighnamComplete': "✨ NIRVIGHNAM Mastered! Obstacles fall away!",
      'blessingNirvighnam': "🕉️ Ganesha blesses you with Sacred Wisdom!",
      'rescueNirvighnam': "🐢 Use your power to clear paths for the animals!",
      'kurumedevaStory': "🪷 Now learn KURUMEDEVA - Do For Me, O Divine!",
      'kurumedevaGame': "🪷 KURUMEDEVA - Decorate with devotion! Match the items!",
      'kurumedevaComplete': "✨ KURUMEDEVA Mastered! Divine grace flows!",
      'blessingKurumedeva': "🪷 Ganesha blesses you with Divine Grace!",
      'rescueKurumedeva': "🦎 Use your blessing to help the forest creatures!",
      'complete': "🕉️ Both Obstacle Powers Unlocked! Scene Complete!"
    },

    'sarvakaryeshu-chant': {
      'initial': "✨ Welcome to Sarvakaryeshu River! Master eternal blessings!",
      'memoryGameActive': "📿 SARVAKARYESHU - Bless all actions! Match the helpers!",
      'sarvakaryeshuComplete': "✨ SARVAKARYESHU Mastered! All actions are blessed!",
      'blessingSarvakaryeshu': "✨ Ganesha blesses you with Divine Action!",
      'rescueSarvakaryeshu': "🐿️ Use your blessing to help the animals with their tasks!",
      'sarvadaStory': "🌙 Now learn SARVADA - Always, Forever!",
      'sarvadaGame': "🌙 SARVADA - Eternal blessings! Match day and night!",
      'sarvadaComplete': "✨ SARVADA Mastered! Eternal blessings are yours!",
      'blessingSarvada': "🌟 Ganesha blesses you with Eternal Blessing!",
      'rescueSarvada': "🦋 Use your eternal power to bring peace to the forest!",
      'complete': "🌙 Both Eternal Powers Unlocked! Scene Complete!"
    },

    'shloka-river-finale': {
      'initial': "🎊 The Grand Shloka Celebration! All 8 chants mastered!",
      'celebration': "🎵 Chant the full shloka with Ganesha!",
      'complete': "🏆 SHLOKA RIVER COMPLETE! You are a Sanskrit Master!"
    }
  },

  // ========================================
  // FESTIVAL SQUARE (Play Zone)
  // ========================================
  'festival-square': {
    // Game 1: Piano
    'game1': {
      'intro': "🎹 Piano Time! Let's create beautiful festival melodies!",
      'selection': "🎵 Choose Your Musical Adventure!",
      'freePlay': "🎵 Free Play - Explore and create your own melodies!",
      'challenge': "🎯 Festival Challenge - Learn traditional Ganesha songs!",
      'songSelection': "🎵 Ganesha Songs - Choose a song to learn!",
      'playing': "🎹 Play the notes! Follow the melody!",
      'recording': "⏺️ Your Turn! Play the song!",
      'complete': "🎵 Song Complete! Beautiful music!"
    },

    // Game 2: Rangoli
    'game2': {
      'intro': "🎨 Rangoli Time! Let's create beautiful festival art!",
      'selection': "🪷 Choose Your Rangoli Design!",
      'coloring': "🎨 Creating: {designName} - Color the sections!",
      'celebration': "✨ Beautiful artwork! Keep coloring!",
      'complete': "🎨 Rangoli Complete! Your artwork shines bright!"
    },

    // Game 3: Cooking (Modak)
    'game3': {
      'intro': "🍬 Modak Time! Let's cook Ganesha's favorite sweet!",
      'mixFilling': "🥥 Mix Filling - Add coconut and jaggery!",
      'makeDough': "🌾 Make Dough - Add rice flour and water!",
      'shapeDough': "✋ Shape Dough - Flatten and shape into a cup!",
      'fillClose': "🥥 Fill & Close - Add filling and seal!",
      'steamCook': "♨️ Steam Cook - Place in steamer and wait!",
      'complete': "🍬 Modak Complete! Ganesha's favorite is ready!"
    },

    // Game 4: Mandap Decoration
    'game4': {
      'intro': "🏛️ Mandap Time! Let's decorate the sacred canopy!",
      'selection': "🎯 Choose Your Mission!",
      'pujaPrep': "🙏 Puja Prep - Get ready for Ganesha's blessing!",
      'fixMandap': "🔧 Mandap Mix-Up - Fix the decorations!",
      'ecoMandap': "🌿 Eco Mandap - Use nature-friendly items!",
      'lightChallenge': "💡 Light Challenge - Illuminate the space!",
      'freePlay': "🎨 Free Decorating - Create your own design!",
      'complete': "🏛️ Mission Complete! The mandap is beautiful!"
    }
  },

  // ========================================
  // ABOUT ME HUT (Play Zone)
  // ========================================
  'about-me-hut': {
    // Scene 1: My Indian Story
    'my-indian-story': {
      'ganesha-home': "Where do I come from, Ganesha? 🗺️",
      'ganesha-region': "Ganesha's India: A Sacred Map 🏡",
      'ganesha-fact': "Here's where Ganesha is most loved! 🌟",
      'child-home': "Now, where is YOUR India? 🏠",
      'region-choice': "Which region is your home? 📍",
      'region-selected': "How wonderful! Let's find more... 🌏",
      'language-intro': "What languages do we speak? 🗣️",
      'language-choice': "Tap a language we both know! 💬",
      'language-selected': "Beautiful! You speak {language}! 🎉",
      'festivals-intro': "Which festivals do we celebrate? 🪔",
      'festival-choice': "Tap a festival we both love! 🎊",
      'festival-selected': "Yes! {festival} is wonderful! 🌟",
      'origin-card': "Our Shared Indian Story 💖"
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
      'friend-correct': "Yes! Mooshika is my best friend! 🐭✨",
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
