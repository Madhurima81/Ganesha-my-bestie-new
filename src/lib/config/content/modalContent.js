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
    // Scene 1: Name & Birthday
    'name-birthday': {
      hint: {
        title: "Hint",
        description: "My name is: G-A-N-E-S-H-A. Pop the balloons in this order!",
        buttonText: "Got It!"
      },

      childNameIntro: {
        title: "Hi! I am Ganesha.",
        description: "",
        buttonText: "What is your name? 👋"
      },

      birthdayIntro: {
        title: "Let's Find My Birthday 🎂",
        description: "My birthday is a joyful day when people celebrate together. It comes during the festival season.",
        buttonText: "Let's Explore 🌼"
      },

      childBirthdayIntro: {
        title: "Now I know YOUR name, {childName}! 🎈",
        description: "But when is YOUR birthday? 🎂",
        buttonText: "Tell You My Birthday! 🎉"
      },

      bestiesCard: {
        title: "BEST FRIENDS FOREVER! 💖",
        subtitle: "We both love celebrations!",
        ganeshaInfo: {
          birthday: "Ganesh Chaturthi",
          month: "Aug-Sept 🐘"
        },
        buttonText: "Finish Game ✨"
      }
    },

    // Scene 2: Family Tree
    'family-tree': {
      // Ganesha's family fun facts
      fatherFact: {
        title: "🔱 My Father!",
        description: "He is calm and strong 🕉️",
        fullFact: "My father is calm and strong. He protects us and teaches me peace 🕉️",
        buttonText: "Cool! ✨"
      },

      motherFact: {
        title: "🌸 My Mother!",
        description: "She is kind and loving 💗",
        fullFact: "My mother is kind and loving. She gives the best hugs and keeps me safe 💗",
        buttonText: "Cool! ✨"
      },

      brotherFact: {
        title: "🦚 My Brother!",
        description: "He is brave and fast 🦚",
        fullFact: "My brother is very brave. He travels the world on his peacock 🦚",
        buttonText: "Cool! ✨"
      },

      myselfFact: {
        title: "😊 That's Me!",
        description: "I love modaks 🍬",
        fullFact: "That's me! I love modaks and helping my friends 😊",
        buttonText: "Cool! ✨"
      },

      transition: {
        title: "Your Turn!",
        description: "That's my family! Now, I want to see your world. Who are the special people in your house?",
        buttonText: "Add My Family! 🏠"
      },

      nameInput: {
        title: "What do you call your {memberType}?",
        placeholder: "e.g., Papa, Mama...",
        hint: "💡 Press Enter to add to tree",
        buttonText: "Add to Tree! ✓"
      },

      sideBySide: {
        title: "Look at Our Family Trees!",
        subtitle: "Connected by Love 💛",
        ganeshaLocation: "🏔️ Mount Kailash",
        childLocation: "🏡 Your Home",
        replayButton: "🌳 Make Another Tree",
        finishButton: "End Game ✨"
      }
    },

    // Scene 3: Favorite Things
    'favorite-food': {
      wrongFeedback: {
        food: "Oops! Try again! 🥟",
        color: "Oops! Not that one, try again! 🙈",
        activity: "Oops! Try again! 💃",
        friend: "Not my best friend! Try again! 🐭"
      },

      childIntro: {
        title: "Now it's your turn! 😊",
        description: "Tell me about you.",
        buttonText: "Tell Me about You! ✨"
      },

      childFriendIntro: {
        title: "My best friend is... 👫",
        buttonText: "Tap to tell! ✨"
      },

      friendCelebration: {
        title: "Yay! {friendName} is your best friend! 🎉",
        description: "Let me show you something special 💛"
      },

      comparisonCard: {
        title: "You and Ganesha are friends forever! ✨",
        subtitle: "Ganesha loves knowing about you 💛",
        ganeshaFavorites: {
          food: "Modak",
          color: "Orange",
          activity: "Dancing",
          friend: "Mushika"
        },
        badgeText: "🏆 Friendship Badge Unlocked! 🏆",
        buttonText: "🎉 Finish Game"
      }
    },

    // Scene 4: Dreams & Wishes
    'dreams-wishes': {
      wish1Intro: {
        title: "My first wish is for a happy world.",
        description: "The world looks a little sad right now 😔",
        buttonText: "Let's Make Them Smile! 😊"
      },

      wish1Complete: {
        title: "You made the world smile! 😊✨",
        subtitle: "Thank you for helping me 💛",
        progress: "🌱 1 of 3 wishes complete"
      },

      wish2Intro: {
        title: "My second wish is that no one feels hungry or alone.",
        description: "Let's share with everyone! 🤝",
        buttonText: "Let's Share! 🍎"
      },

      wish2Complete: {
        title: "You filled hearts with sharing! ✨",
        subtitle: "Thank you for caring so much 💛",
        progress: "🌱 2 of 3 wishes complete"
      },

      wish3Intro: {
        title: "My last wish is for a green, happy world.",
        description: "Where kids can run, play, and smile outside! 🌿",
        buttonText: "Let's Make It Green! 🌸"
      },

      wish3Complete: {
        title: "You made the world green and playful! ✨",
        subtitle: "Thank you for helping the Earth 💛",
        progress: "🌱 3 of 3 wishes complete"
      },

      allWishesComplete: {
        title: "WOW! You made the world brighter! ✨",
        description: "Now it's your turn 💛 What would you love to wish for?",
        buttonText: "Tell Me Your Dream! 💭"
      },

      dreamIntro: {
        title: "Draw a happy wish on this magic canvas! ✨",
        description: "What would you love to draw today? 🎨",
        buttonText: "Start Drawing! ✏️"
      },

      dreamRevealed: {
        title: "Your dream will come true!",
        description: "I believe in you! 🌟"
      },

      comparisonCard: {
        title: "Dreams Come Together! ✨",
        subtitle: "Friends Help Each Other",
        ganeshaWishes: ["😊 Happiness ✓", "🤝 Sharing ✓", "🌳 Earth ✓"],
        buttonText: "🎉 Finish Game"
      }
    },

    // Common button texts used across About Me scenes
    'common-buttons': {
      back: "← Back",
      delete: "⌫ Delete",
      confirm: "✓",
      done: "Done! ✓",
      finish: "Finish Game ✨",
      replay: "Play Again 🔄",
      backToMap: "Back to Map 🗺️",
      home: "Home 🏠",
      hint: "💡 Hint",
      close: "✕",
      cool: "Cool! ✨",
      continue: "Continue →",

      // Name scene specific
      thatsMyName: "That's My Name! ✓",
      whatIsYourName: "What is your name? 👋",
      tellMyBirthday: "Tell You My Birthday! 🎉",
      changeMonth: "← Change Month",

      // Family tree specific
      meetMyFamily: "Meet My Family! 🌟",
      addToTree: "Add to Tree! ✓",
      addMyFamily: "Add My Family! 🏠",
      makeAnotherTree: "🌳 Make Another Tree",
      endGame: "End Game ✨",

      // Favorite things specific
      letsPlay: "Let's Play Guessing! 🌟",
      findFriend: "Find Friend! 🌟",
      tellMeAboutYou: "Tell Me about You! ✨",
      tapToTell: "Tap to tell! ✨",
      draw: "🎨 Draw",
      type: "✏️ Type",

      // Dreams specific
      letsMakeSmile: "Let's Make Them Smile! 😊",
      letsShare: "Let's Share! 🍎",
      letsMakeGreen: "Let's Make It Green! 🌸",
      tellMeDream: "Tell Me Your Dream! 💭",
      startDrawing: "Start Drawing! ✏️"
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
    'name-birthday': {
      nameBalloons: "Great! You've popped {count}/7 balloons!",
      childNameInput: "Continue typing your name! ({count} letters typed)",
      birthdayChoice: "Keep trying! You've eliminated {count} options!",
      childBirthdayMonth: "You picked {month}! Now pick the date. 📅",
      bestiesCard: "Welcome back! Here's your bestie card! 💖"
    },

    'family-tree': {
      ganeshaTreePartial: "Great progress! You've placed {count}/4 family members. Keep going!",
      ganeshaTreeComplete: "Amazing! You completed Ganesha's family tree! Tap 'All Done!' to continue.",
      childInput: "You've added {count} family member{plural} to your tree!"
    },

    'favorite-food': {
      foodChoice: "Keep trying! You've eliminated {count} option{plural}!",
      childFoodChoice: "Welcome back! Ready to pick (or draw) your favorite food? 🍕",
      childColorChoice: "Let's pick your favorite color! 🎨",
      childActivityChoice: "Welcome back! Ready to pick (or draw) your favorite activity? ⚽",
      childFriendInput: "Continue typing your friend's name! ({count} letters)",
      drawingModal: "Welcome back! We saved your progress! 🎨"
    },

    'dreams-wishes': {
      wish1Active: "Keep tapping! You've tapped {count}/3 times!",
      wish2Active: "Great! You've filled {count}/3 bowls!",
      wish3Active: "Keep going! {count}/3 parts of the park are green!",
      dreamClearing: "Keep clearing the clouds! {count}/3 done!",
      drawingModal: "Welcome back! We saved your drawing! 🎨"
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

// Get common button text for About Me zone
export const getButtonText = (zoneId, buttonKey) => {
  return MODAL_CONTENT[zoneId]?.['common-buttons']?.[buttonKey] || buttonKey;
};
