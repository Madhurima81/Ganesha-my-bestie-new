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
      // Opening modal content (from scene)
      door1Intro: {
        title: "Discover Ganesha's Divine Light!",
        subtitle: "2 divine words to master!",
        description: "First, learn to chant SURYAKOTI to unlock the power of million suns and save animals!",
        buttonText: "Start Learning!"
      },

      door2Intro: {
        title: "Wonderful Progress!",
        subtitle: "Master the balanced light!",
        description: "Learn to chant SAMAPRABHA to unlock equal radiance power and save animals!",
        buttonText: "Continue Learning!"
      },

      door1Complete: {
        title: "SURYAKOTI Unlocked!",
        description: "You've mastered the Million Suns chant! The radiant power is yours!",
        icon: 'door-open',
        buttonText: "Continue"
      },

      door2Complete: {
        title: "SAMAPRABHA Unlocked!",
        description: "You've mastered Equal Radiance! Both light powers are now yours!",
        icon: 'door-open',
        buttonText: "Complete Scene"
      }
    },

    'nirvighnam-kurumedeva': {
      door1Intro: {
        title: "Learn the Obstacle Remover Chant!",
        subtitle: "2 divine words to master!",
        description: "First, learn to chant NIRVIGHNAM to unlock obstacle-removing power and save animals!",
        buttonText: "Start Learning!"
      },

      door2Intro: {
        title: "Amazing Work!",
        subtitle: "Complete the blessing!",
        description: "Learn to chant KURUMEDEVA to unlock divine blessing power and save animals!",
        buttonText: "Complete Learning!"
      },

      door1Complete: {
        title: "NIRVIGHNAM Unlocked!",
        description: "You've mastered the Obstacle Removal chant! Clear paths lie ahead!",
        icon: 'door-open',
        buttonText: "Continue"
      },

      door2Complete: {
        title: "KURUMEDEVA Unlocked!",
        description: "You've mastered Divine Blessing! Both obstacle powers are yours!",
        icon: 'door-open',
        buttonText: "Complete Scene"
      }
    },

    'sarvakaryeshu-sarvada': {
      door1Intro: {
        title: "Help Ganesha Bless All Actions!",
        subtitle: "2 divine words to master!",
        description: "First, learn to chant SARVAKARYESHU to unlock divine action power and save animals!",
        buttonText: "Start Learning!"
      },

      door2Intro: {
        title: "Great Work!",
        subtitle: "Now unlock eternal blessing!",
        description: "Learn to chant SARVADA to unlock eternal blessing power and save animals!",
        buttonText: "Start Learning!"
      },

      door1Complete: {
        title: "SARVAKARYESHU Unlocked!",
        description: "You've mastered the All Actions chant! Divine blessings flow!",
        icon: 'door-open',
        buttonText: "Continue"
      },

      door2Complete: {
        title: "SARVADA Unlocked!",
        description: "You've mastered Eternal Blessing! All powers are complete!",
        icon: 'door-open',
        buttonText: "Complete Scene"
      }
    },

    'final-meaning-scene': {
      round1Complete: {
        title: "🎉 Great Job! 🎉",
        description: "You've matched all 4 symbols! Ready for the next challenge?",
        playAgainButton: "Play Again 🔄",
        continueButton: "Next Round →"
      },

      round2Complete: {
        title: "🎊 Amazing! 🎊",
        description: "You've mastered all 8 symbols! Time to celebrate!",
        playAgainButton: "Play Again 🔄"
      },

      symbolData: {
        vakratunda: { name: 'Vakratunda', meaning: 'Curved Trunk' },
        mahakaya: { name: 'Mahakaya', meaning: 'Big Body' },
        suryakoti: { name: 'Suryakoti', meaning: 'Million Suns' },
        samaprabha: { name: 'Samaprabha', meaning: 'Equal Brilliance' },
        nirvighnam: { name: 'Nirvighnam', meaning: 'Without Obstacles' },
        kurumedeva: { name: 'Kurumedeva', meaning: 'Divine Help' },
        sarvakaryeshu: { name: 'Sarvakaryeshu', meaning: 'In All Tasks' },
        sarvada: { name: 'Sarvada', meaning: 'Always' }
      }
    }
  },

  // ========================================
  // SHLOKA RIVER - Chanting Zone Modals
  // ========================================
  'shloka-river': {
    // Scene 2: Suryakoti Bank
    'suryakoti-bank': {
      // Word completion celebrations
      suryakotiComplete: {
        title: "☀️ SURYAKOTI Mastered!",
        description: "You have the power of a million suns! Your light shines bright!",
        powerName: "Solar Clarity",
        powerIcon: "☀️",
        buttonText: "Continue"
      },

      samaprabhaComplete: {
        title: "🌈 SAMAPRABHA Mastered!",
        description: "You radiate equal light in all directions! Perfect balance achieved!",
        powerName: "Radiant Light",
        powerIcon: "🌟",
        buttonText: "Continue"
      },

      // Blessing modals
      blessingSuryakoti: {
        title: "☀️ Solar Blessing!",
        description: "Ganesha says: \"Your light shines like a million suns! Use this power to help the flowers bloom!\"",
        buttonText: "Help the Flowers!"
      },

      blessingSamaprabha: {
        title: "🌈 Rainbow Blessing!",
        description: "Ganesha says: \"Your colors are perfectly balanced! Use this power to bring joy to the animals!\"",
        buttonText: "Help the Animals!"
      },

      sceneComplete: {
        sceneName: "Suryakoti Bank",
        title: "🌟 Both Radiant Powers Unlocked!",
        blessing: "You are a master of divine light!"
      }
    },

    // Scene 3: Nirvighnam Chant
    'nirvighnam-chant': {
      nirvighnamComplete: {
        title: "🕉️ NIRVIGHNAM Mastered!",
        description: "Obstacles fall away before you! Your path is always clear!",
        powerName: "Sacred Wisdom",
        powerIcon: "🕉️",
        buttonText: "Continue"
      },

      kurumedevaComplete: {
        title: "🪷 KURUMEDEVA Mastered!",
        description: "Divine grace flows through you! Ganesha hears your prayers!",
        powerName: "Divine Grace",
        powerIcon: "🪷",
        buttonText: "Continue"
      },

      blessingNirvighnam: {
        title: "🕉️ Obstacle Removal Blessing!",
        description: "Ganesha says: \"No obstacle can stop you now! Clear the paths for the animals!\"",
        buttonText: "Clear the Paths!"
      },

      blessingKurumedeva: {
        title: "🪷 Divine Grace Blessing!",
        description: "Ganesha says: \"Your devotion is pure! Decorate the sacred space for the creatures!\"",
        buttonText: "Bless the Creatures!"
      },

      sceneComplete: {
        sceneName: "Nirvighnam Waters",
        title: "🕉️ Both Obstacle Powers Unlocked!",
        blessing: "You are a master of obstacle removal!"
      }
    },

    // Scene 4: Sarvakaryeshu Chant
    'sarvakaryeshu-chant': {
      sarvakaryeshuComplete: {
        title: "✨ SARVAKARYESHU Mastered!",
        description: "All your actions are blessed! Everything you do succeeds!",
        powerName: "Divine Action",
        powerIcon: "✨",
        buttonText: "Continue"
      },

      sarvadaComplete: {
        title: "🌙 SARVADA Mastered!",
        description: "Eternal blessings flow forever! Day and night, you are protected!",
        powerName: "Eternal Blessing",
        powerIcon: "🌟",
        buttonText: "Continue"
      },

      blessingSarvakaryeshu: {
        title: "✨ Action Blessing!",
        description: "Ganesha says: \"Every action you take is blessed! Help the animals with their tasks!\"",
        buttonText: "Help with Tasks!"
      },

      blessingSarvada: {
        title: "🌙 Eternal Blessing!",
        description: "Ganesha says: \"My blessings are with you always! Bring eternal peace to the forest!\"",
        buttonText: "Bring Peace!"
      },

      sceneComplete: {
        sceneName: "Sarvakaryeshu River",
        title: "🌙 Both Eternal Powers Unlocked!",
        blessing: "You are a master of eternal blessings!"
      }
    },

    // Scene 5: Shloka River Finale
    'shloka-river-finale': {
      welcome: {
        title: "🎊 The Grand Shloka Celebration!",
        subtitle: "You have mastered all 8 sacred chants!",
        description: "Now chant the complete shloka with Ganesha!",
        buttonText: "Begin the Celebration!"
      },

      shlokaComplete: {
        title: "🏆 SHLOKA MASTER!",
        description: "You have chanted the complete Vakratunda Mahakaya Shloka! Ganesha is overjoyed!",
        fullShloka: "Vakratunda Mahakaya, Suryakoti Samaprabha, Nirvighnam Kurumedeva, Sarvakaryeshu Sarvada",
        buttonText: "Celebrate!"
      },

      sceneComplete: {
        sceneName: "Shloka River Finale",
        title: "🎊 SHLOKA RIVER COMPLETE!",
        blessing: "You are a true Sanskrit Master!"
      }
    },

    // Common Shloka River buttons
    'common-buttons': {
      practiceChant: "🎤 Practice Chant",
      hearPronunciation: "🔊 Hear Pronunciation",
      startMission: "🦋 Start Mission",
      helpAnimals: "🐾 Help Animals",
      nextWord: "Next Word →",
      continueJourney: "Continue Journey →",
      backToRiver: "← Back to River"
    }
  },

  // ========================================
  // FESTIVAL SQUARE - Play Zone Modals
  // ========================================
  'festival-square': {
    // Game 1: Piano
    'game1': {
      // Mode selection
      modeSelection: {
        title: "🎹 Festival Piano 🎹",
        subtitle: "Choose Your Musical Adventure!",
        freePlayCard: {
          icon: "🎵",
          title: "Free Play",
          description: "Explore and create your own melodies",
          buttonText: "Let's Play!"
        },
        challengeCard: {
          icon: "🎯",
          title: "Festival Challenge",
          description: "Learn traditional Ganesha songs",
          buttonText: "Start Challenge!"
        }
      },

      // Song completion overlay
      songComplete: {
        title: "🎵 Song Complete! 🎵",
        blessing: "Beautiful music, little musician! Ganesha is smiling!",
        playingBlessing: "🔊 Listen to your beautiful music!",
        buttons: {
          playAgain: "Play Again!",
          hearMySong: "Hear My Song!",
          tryAnother: "Try Another!"
        }
      },

      // Cultural notes for instruments
      culturalNotes: {
        bells: "Base note - like the foundation of a house!",
        cymbals: "Second note - adds rhythm to the melody!",
        shehnai: "Third note - brings joy to celebrations!",
        dhol: "Fourth note - powerful like a drum!",
        drum: "Fifth note - perfect harmony!"
      },

      // Song data
      songs: {
        'jai-ganesh-aarti': {
          name: "Jai Ganesh Deva",
          festival: "Ganesh Aarti",
          description: "The most famous prayer to Lord Ganesha",
          culturalNote: "This aarti is sung daily in millions of homes across India"
        },
        'gajanana-ganaraya': {
          name: "Gajanana Shri Ganaraya",
          festival: "Ganesh Bhajan",
          description: "Beautiful prayer praising Ganesh as the elephant-faced god",
          culturalNote: "Sung during Ganesh Chaturthi processions - \"Gajanana\" means elephant-faced"
        },
        'shendur-lal': {
          name: "Shendur Lal Chadhayo",
          festival: "Ganesh Visarjan",
          description: "Sung during Ganesh immersion ceremonies",
          culturalNote: "About offering red sindoor to Ganesha - played during visarjan processions"
        },
        'sukh-karta': {
          name: "Sukh Karta Dukh Harta",
          festival: "Ganesh Aarti",
          description: "Prayer praising Ganesha as the giver of happiness",
          culturalNote: "Means \"Giver of joy, remover of sorrow, destroyer of obstacles\""
        }
      },

      sceneComplete: {
        sceneName: "Piano Mastery",
        title: "🎹 Piano Mastery Complete!",
        blessing: "You're a wonderful musician!"
      }
    },

    // Game 2: Rangoli
    'game2': {
      // Design selection
      designSelection: {
        title: "Choose Your Rangoli Design",
        designs: {
          lotus: {
            name: "Sacred Lotus",
            culturalNote: "The lotus brings prosperity and peace to your home!",
            difficulty: "Easy",
            description: "Beautiful blooming lotus pattern"
          },
          peacock: {
            name: "Dancing Peacock",
            culturalNote: "The peacock dances to welcome good fortune!",
            difficulty: "Medium",
            description: "Graceful peacock with flowing feathers"
          },
          mandala: {
            name: "Festival Mandala",
            culturalNote: "Sacred circles connect us to the universe!",
            difficulty: "Advanced",
            description: "Intricate geometric mandala design"
          }
        }
      },

      // Design completion overlay
      designComplete: {
        title: "🎨 Rangoli Complete! 🎨",
        blessing: "Beautiful artwork, little artist! Your rangoli shines bright!",
        buttons: {
          playAgain: "Play Again!",
          createAnother: "Create Another!"
        }
      },

      // Resume confirmation
      resumeConfirmation: {
        title: "Continue or Start Fresh?",
        subtitle: "You were working on {designName}",
        buttons: {
          continue: "Continue",
          startFresh: "Start Fresh"
        }
      },

      sceneComplete: {
        sceneName: "Rangoli Artistry",
        title: "🎨 Rangoli Artistry Complete!",
        blessing: "You're a wonderful artist!"
      }
    },

    // Game 3: Cooking (Modak)
    'game3': {
      // Step configurations
      steps: {
        mixFilling: {
          title: "Mix Filling",
          actions: ["Add Coconut", "Add Jaggery", "Stir Mixture"],
          hints: {
            coconut: "🥥 Tap coconut to start!",
            jaggery: "🍯 Add jaggery next!",
            stir: "🥄 Stir {count}/3!"
          }
        },
        makeDough: {
          title: "Make Dough",
          actions: ["Add Rice Flour", "Add Water", "Mix Dough"],
          hints: {
            flour: "🌾 Add rice flour!",
            water: "💧 Add water next!",
            mix: "🥄 Mix {count}/3!"
          }
        },
        shapeDough: {
          title: "Shape Dough",
          actions: ["Place Dough", "Flatten Dough", "Shape Cup"],
          hints: {
            place: "👆 Place dough on mat!",
            flatten: "🙌 Flatten the dough!",
            shape: "✋ Shape into a cup!"
          }
        },
        fillClose: {
          title: "Fill & Close",
          actions: ["Add Filling", "Seal Edges"],
          hints: {
            fill: "🥥 Add the filling!",
            seal: "🤏 Seal the edges!"
          }
        },
        steamCook: {
          title: "Steam Cook",
          actions: ["Add to Steamer", "Close Lid", "Wait for Steam"],
          hints: {
            place: "👆 Place in steamer!",
            lid: "🎩 Close the lid!",
            steam: "♨️ Steaming! {timeLeft}s left"
          }
        }
      },

      // Step completion celebration
      stepComplete: {
        title: "Step {number} - Completed",
        message: "Great Job!"
      },

      // Final completion
      gameComplete: {
        title: "🎉 All Done!",
        sceneName: "Modak Mastery",
        blessing: "You're a wonderful chef!"
      }
    },

    // Game 4: Mandap Decoration
    'game4': {
      // Mission selection
      missionSelection: {
        title: "Choose Your Mission!",
        missions: {
          'puja-prep': {
            name: "Puja Prep",
            icon: "🙏",
            description: "Get ready for Ganesha's blessing ceremony!",
            difficulty: 1
          },
          'fix-mandap': {
            name: "Mandap Mix-Up",
            icon: "🔧",
            description: "Wind blew decorations everywhere!",
            difficulty: 2
          },
          'eco-mandap': {
            name: "Eco Mandap",
            icon: "🌿",
            description: "Let's make a nature-friendly mandap!",
            difficulty: 2
          },
          'light-challenge': {
            name: "Light Challenge",
            icon: "💡",
            description: "Illuminate the sacred space",
            difficulty: 3
          }
        }
      },

      // Puja Prep steps
      pujaSteps: {
        step1: {
          instruction: "Place flowers on the left altar",
          successMessage: "So pretty! Ganesha loves these flowers!",
          culturalNote: "Marigolds are sacred flowers in Hindu pujas",
          emoji: "🌸"
        },
        step2: {
          instruction: "Add coconut to the left altar",
          successMessage: "Yay! The coconut is ready for puja!",
          culturalNote: "Breaking coconut removes obstacles",
          emoji: "🥥"
        },
        step3: {
          instruction: "Light the diya next to Ganesha",
          successMessage: "Lovely! The diya is shining bright!",
          culturalNote: "Diyas guide the gods to our prayers",
          emoji: "🪔"
        },
        step4: {
          instruction: "Place modaks in the center",
          successMessage: "Yummy! Ganesha loves modaks!",
          culturalNote: "Modak is Ganesha's favorite food",
          emoji: "🍬"
        },
        step5: {
          instruction: "Create rangoli on the floor",
          successMessage: "Amazing! Everything is ready for Ganesha!",
          culturalNote: "Rangoli welcomes guests with colors",
          emoji: "🌈"
        }
      },

      // Mission instructions
      missionInstructions: {
        fix: "Tap RED decorations, then GREEN spots!",
        eco: "Choose only eco-friendly decorations!",
        light: "Quick! Place lights before time runs out!"
      },

      // Mission completion overlay
      missionComplete: {
        title: "Mission Complete!",
        blessing: "Well done, little decorator! Your devotion shines bright!",
        buttons: {
          tryAnother: "Try Another!",
          playAgain: "Play Again!"
        }
      },

      sceneComplete: {
        sceneName: "Mandap Mastery",
        title: "🏛️ Mandap Mastery Complete!",
        blessing: "You're a wonderful decorator!"
      }
    },

    // Common Festival Square buttons
    'common-buttons': {
      letsPlay: "Let's Play!",
      letsCreate: "Let's Create!",
      letsCook: "Let's Cook!",
      letsBuild: "Let's Build!",
      back: "← Back",
      songs: "← Songs",
      menu: "← Menu",
      startChallenge: "Start Challenge!",
      hearSong: "▶️ Hear Song",
      yourTurn: "⏺️ Your Turn!",
      playing: "⏹️ Playing...",
      record: "⏺️ Record",
      stop: "⏹️ Stop",
      hear: "▶️ Hear",
      save: "⬇️ Save",
      tryAgain: "❌ Try again!",
      allDone: "🎉 All Done!",
      keepPlaying: "Keep Playing",
      startFresh: "Start Fresh",
      changeMode: "Change Mode",
      imDonePlaying: "I'm Done Playing"
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
      door1InProgress: "Continue spelling SURYAKOTI! {count}/4 syllables placed!",
      door1Game: "Keep collecting suns! {count} animals saved!",
      door2InProgress: "Continue spelling SAMAPRABHA! {count}/4 syllables placed!",
      door2Game: "Keep balancing the light! {count} animals helped!"
    },

    'nirvighnam-kurumedeva': {
      door1InProgress: "Continue spelling NIRVIGHNAM! {count}/4 syllables placed!",
      door1Game: "Keep removing obstacles! {count} paths cleared!",
      door2InProgress: "Continue spelling KURUMEDEVA! {count}/4 syllables placed!",
      door2Game: "Keep receiving blessings! {count} animals blessed!"
    },

    'sarvakaryeshu-sarvada': {
      door1InProgress: "Continue spelling SARVAKARYESHU! {count}/5 syllables placed!",
      door1Game: "Keep blessing tasks! {count} animals helped!",
      door2InProgress: "Continue spelling SARVADA! {count}/3 syllables placed!",
      door2Game: "Keep spinning for blessings! {count} spins done!"
    },

    'final-meaning-scene': {
      round1InProgress: "Keep matching! {matched}/4 pairs found in Round 1!",
      round2InProgress: "Keep matching! {matched}/4 pairs found in Round 2!"
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
      suryakotiInProgress: "Continue matching syllables for Suryakoti! {count}/4 matched!",
      samaprabhaInProgress: "Continue matching colors for Samaprabha! {count}/4 balanced!",
      rescueSuryakotiInProgress: "Keep helping! {count} flowers blooming!",
      rescueSamaprabhaInProgress: "Keep sharing! {count} animals helped!"
    },

    'nirvighnam-chant': {
      nirvighnamInProgress: "Continue clearing stones for Nirvighnam! {count}/3 matched!",
      kurumedevaInProgress: "Continue decorating for Kurumedeva! {count}/5 placed!",
      rescueNirvighnamInProgress: "Keep clearing! {count} paths opened!",
      rescueKurumedevaInProgress: "Keep blessing! {count} creatures helped!"
    },

    'sarvakaryeshu-chant': {
      sarvakaryeshuInProgress: "Continue helping for Sarvakaryeshu! {count}/4 matched!",
      sarvadaInProgress: "Continue blessing for Sarvada! {count}/3 matched!",
      rescueSarvakaryeshuInProgress: "Keep assisting! {count} tasks blessed!",
      rescueSarvadaInProgress: "Keep shining! {count} animals at peace!"
    },

    'shloka-river-finale': {
      chantInProgress: "Continue chanting! {count}/8 words complete!"
    }
  },

  'festival-square': {
    'game1': {
      freePlayInProgress: "Keep exploring! You've discovered {count}/5 instruments!",
      challengeInProgress: "Keep playing! {current}/{total} notes matched!",
      songInProgress: "Continue playing {songName}! {progress} complete!"
    },

    'game2': {
      coloringInProgress: "Keep coloring! {colored}/{total} sections done!",
      savedProgress: "You have saved progress on {designName}! Resume or start fresh?"
    },

    'game3': {
      mixFillingInProgress: "{message}",
      makeDoughInProgress: "{message}",
      shapeDoughInProgress: "{message}",
      fillCloseInProgress: "{message}",
      steamCookInProgress: "♨️ Steaming! {timeLeft}s left"
    },

    'game4': {
      pujaInProgress: "Continue the Puja Prep! Step {step}/5",
      fixInProgress: "Keep fixing! {fixed}/{total} decorations corrected!",
      ecoInProgress: "Keep decorating! {count}/{target} eco items placed!",
      lightInProgress: "Quick! {placed}/{total} lights placed! ⏱️ {timeLeft}s"
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
