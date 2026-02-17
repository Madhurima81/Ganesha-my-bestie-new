// Voice Guidance - Multi-Zone Support
// Audio scripts for Ganesha's voice prompts
// Replaces header, help menu, and text instructions

export const VOICE_SCRIPTS = {
  // ========================================
  // SHLOKA RIVER ZONE
  // ========================================
  'shloka-river': {
    'vakratunda-grove': {
      // ========================================
      // SCENE ENTRY
      // ========================================
      welcome: {
        text: "Welcome to Shloka River! Let's learn a magical Sanskrit word together!",
        file: 'shloka-river-welcome.mp3'
      },

      // ========================================
      // VAKRATUNDA GAME (Round 1)
      // ========================================
      vakratundaGameStart: {
        text: "Let's learn VAKRATUNDA! It means 'curved trunk'. Listen and tap the syllables!",
        file: 'vakratunda-game-start.mp3'
      },
      vakratundaRound1: {
        text: "Round 1! Listen carefully and tap what you hear...",
        file: 'vakratunda-round1-learn.mp3'
      },
      vakratundaRound2: {
        text: "Round 2! Now let's practice what we learned!",
        file: 'vakratunda-round2-learn.mp3'
      },

      // ========================================
      // VAKRATUNDA POWER UNLOCK
      // ========================================
      vakratundaPower: {
        text: "You learned VAKRATUNDA! This gives you Flexibility Power! Say with me: I am flexible!",
        file: 'vakratunda-power-flexibility.mp3'
      },
      vakratundaLotusBloom: {
        text: "Beautiful! The lotus is blooming!",
        file: 'vakratunda-lotus-bloom.mp3'
      },

      // ========================================
      // MAHAKAYA GAME (Round 2)
      // ========================================
      mahakayaGameStart: {
        text: "Now let's learn MAHAKAYA! It means 'great body'. Listen and tap!",
        file: 'mahakaya-game-start.mp3'
      },

      // ========================================
      // MAHAKAYA POWER UNLOCK
      // ========================================
      mahakayaPower: {
        text: "You learned MAHAKAYA! This gives you Inner Strength! Say with me: I am strong!",
        file: 'mahakaya-power-strength.mp3'
      },

      // ========================================
      // WORD CELEBRATION
      // ========================================
      chantWordReveal: {
        text: "You did it! Say the word with me!",
        file: 'chant-word-reveal.mp3'
      },
      'vakratunda-word-reveal': {
        text: "Vakratunda!",
        file: 'vakratunda-word-reveal.mp3'
      },
      'mahakaya-word-reveal': {
        text: "Mahakaya!",
        file: 'mahakaya-word-reveal.mp3'
      },

      // ========================================
      // SCENE COMPLETE
      // ========================================
      sceneComplete: {
        text: "Amazing work! You learned two Sanskrit words and unlocked special powers!",
        file: 'shloka-river-fireworks-celebration.mp3'
      },

      // ========================================
      // INSTRUCTIONS (Generic)
      // ========================================
      instructionListen: {
        text: "Listen carefully...",
        file: 'instruction_listen.mp3'
      },
      instructionTap: {
        text: "Now tap what you heard!",
        file: 'instruction_tap.mp3'
      },
      instructionTapInOrder: {
        text: "Tap the syllables in order!",
        file: 'instruction_tap_in_order.mp3'
      },
      instructionYourTurn: {
        text: "Your turn!",
        file: 'instruction_your_turn.mp3'
      },
      instructionWatchAndListen: {
        text: "Watch and listen!",
        file: 'instruction_watch_and_listen.mp3'
      },
      instructionRepeatAfterMe: {
        text: "Repeat after me!",
        file: 'instruction_repeat_after_me.mp3'
      },
      instructionNowYouTry: {
        text: "Now you try!",
        file: 'instruction_now_you_try.mp3'
      },
      instructionTapAndRepeat: {
        text: "Tap and repeat!",
        file: 'instruction_tap_and_repeat.mp3'
      },
      instructionTapAndSay: {
        text: "Tap and say!",
        file: 'instruction_tap_and_say.mp3'
      },
      instructionTapTheElephant: {
        text: "Tap the elephant!",
        file: 'instruction_tap_the_elephant.mp3'
      },
      instructionTapLotus: {
        text: "Tap the lotus!",
        file: 'instruction_tap_lotus.mp3'
      },
      instructionTapLotusWord: {
        text: "Tap the lotus to hear the word!",
        file: 'instruction_tap_lotus_word.mp3'
      },
      instructionTapLotusUnlock: {
        text: "Tap the lotus to unlock the full word!",
        file: 'instruction_tap_lotus_unlock.mp3'
      },
      instructionTapLily: {
        text: "Tap the lily!",
        file: 'instruction_tap_lily.mp3'
      },
      instructionTapLilyWord: {
        text: "Tap the lily to hear the word!",
        file: 'instruction_tap_lily_word.mp3'
      },
      instructionTapLilyUnlock: {
        text: "Tap the lily to unlock the full word!",
        file: 'instruction_tap_lily_unlock.mp3'
      },

      // ========================================
      // ENCOURAGEMENT
      // ========================================
      encourageAmazing: {
        text: "Amazing!",
        file: 'encourage_amazing.mp3'
      },
      encourageFantastic: {
        text: "Fantastic!",
        file: 'encourage_fantastic.mp3'
      },
      encourageGreatJob: {
        text: "Great job!",
        file: 'encourage_great_job.mp3'
      },
      encouragePerfect: {
        text: "Perfect!",
        file: 'encourage_perfect.mp3'
      },
      encourageWellDone: {
        text: "Well done!",
        file: 'encourage_well_done.mp3'
      },
      encourageWonderful: {
        text: "Wonderful!",
        file: 'encourage_wonderful.mp3'
      },

      // ========================================
      // ERRORS
      // ========================================
      errorOops: {
        text: "Oops!",
        file: 'error_oops.mp3'
      },
      errorNotQuite: {
        text: "Not quite! Try again!",
        file: 'error_not_quite.mp3'
      },
      errorLetsTryAgain: {
        text: "Let's try again!",
        file: 'error_lets_try_again.mp3'
      },

      // ========================================
      // HINTS
      // ========================================
      hintLookForGlow: {
        text: "Look for the glowing one!",
        file: 'hint_look_for_glow.mp3'
      },
      hintTapTheShiny: {
        text: "Tap the shiny syllable!",
        file: 'hint_tap_the_shiny.mp3'
      },
      hintThisOne: {
        text: "This one!",
        file: 'hint_this_one.mp3'
      },
      hintTryAgain: {
        text: "Try again!",
        file: 'hint_try_again.mp3'
      }
    }
  },

  // ========================================
  // SYMBOL MOUNTAIN ZONE
  // ========================================
  'symbol-mountain': {
    'modak': {
      // ========================================
      // SCENE ENTRY
      // ========================================
      welcome: {
        text: "Welcome to Symbol Mountain! Can you find my friend Mooshika? He's hiding somewhere...",
        file: 'modak-opening-modal.mp3'
      },

      // ========================================
      // PHASE 1: FIND MOOSHIKA
      // ========================================
      findMooshika: {
        text: "Tap the little mound to find Mooshika!",
        file: 'modak-find-mooshika.mp3'
      },
      mooshikaFound: {
        text: "You found Mooshika! He's my little mouse friend. He teaches us about FOCUS!",
        file: 'modak-mooshika-found.mp3'
      },
      focusPower: {
        text: "Your mind is like a little mouse - sometimes it runs around! But YOU can call it back. Say with me: I can focus!",
        file: 'modak-focus-power.mp3'
      },

      // ========================================
      // PHASE 2: COLLECT MODAKS
      // ========================================
      collectStart: {
        text: "Now help Mooshika collect 3 modaks for me! Tap each golden modak you find!",
        file: 'modak-collect-start.mp3'
      },
      tapModak: {
        text: "Tap the golden modak!",
        file: 'modak-tap-modak.mp3'
      },
      lookAround: {
        text: "Look around! There are more modaks hiding!",
        file: 'modak-look-around.mp3'
      },
      collectProgress1: {
        text: "One modak! Keep looking!",
        file: 'modak-progress-1.mp3'
      },
      collectProgress2: {
        text: "Two modaks! One more to go!",
        file: 'modak-progress-2.mp3'
      },
      collectComplete: {
        text: "All three modaks! Amazing! Now... will you share them with me?",
        file: 'modak-collect-complete.mp3'
      },

      // ========================================
      // PHASE 3: SHARE WITH GANESHA
      // ========================================
      sharingPower: {
        text: "When you share something special, it feels even MORE special! Say with me: I love to share!",
        file: 'modak-sharing-power.mp3'
      },
      // Instruction to feed (tap version)
      shareTap: {
        text: "Tap the modaks to share them with Ganesha!",
        file: 'modak-share-tap.mp3'
      },
      // Instruction to feed (drag version)
      feedGanesha: {
        text: "Drag the modaks to feed Ganesha!",
        file: 'modak-feed-ganesha.mp3'
      },
      // Hint for feeding phase (idle hint)
      feedHint: {
        text: "Drag them here!",
        file: 'feed-hint.mp3'
      },
      // Feeding progress VOs
      feedProgress1: {
        text: "Yummy! One modak!",
        file: 'modak-feed-1.mp3'
      },
      feedProgress2: {
        text: "Mmm! Two modaks!",
        file: 'modak-feed-2.mp3'
      },
      feedComplete: {
        text: "All three! My tummy is so happy!",
        file: 'modak-feed-complete.mp3'
      },
      bellyHappy: {
        text: "Mmmm! Yummy! Modaks are my favorite! Thank you!",
        file: 'modak-belly-happy.mp3'
      },

      // ========================================
      // PHASE 4: SCENE COMPLETE
      // ========================================
      gratitudePower: {
        text: "You helped Mooshika, collected with care, and shared with love. That's GRATITUDE! Say with me: I am grateful!",
        file: 'modak-gratitude-power.mp3'
      },
      kindHeartPower: {
        text: "You have a kind heart!",
        file: 'modak-kind-heart-power.mp3'
      },

      sceneComplete: {
        text: "Amazing work, little explorer! You did it! Focus, sweet reward, and sharing — all done! I’m so proud of you!",
      file: "modak-scene-complete.mp3"},

      // ========================================
      // IDLE HINTS (after 10s of no interaction)
      // ========================================
      hintExplore: {
        text: "Tap around to explore!",
        file: 'modak-hint-explore.mp3'
      },
      hintMooshika: {
        text: "Look for something small and grey hiding in the grass...",
        file: 'modak-hint-mooshika.mp3'
      },
      hintMound: {
        text: "See that little mound? Tap it!",
        file: 'modak-hint-mound.mp3'
      },
      hintModak: {
        text: "The modaks are golden and round! Tap them!",
        file: 'modak-hint-modak.mp3'
      },

      // ========================================
      // ENCOURAGEMENT (random positive feedback)
      // ========================================
      encourage1: {
        text: "Great job!",
        file: 'modak-encourage-1.mp3'
      },
      encourage2: {
        text: "You're doing amazing!",
        file: 'modak-encourage-2.mp3'
      },
      encourage3: {
        text: "Keep going!",
        file: 'modak-encourage-3.mp3'
      },

      // ========================================
      // ERROR/WRONG TAP
      // ========================================
      wrongTap: {
        text: "Not there! Try somewhere else!",
        file: 'modak-wrong-tap.mp3'
      },
      tryAgain: {
        text: "Almost! Try again!",
        file: 'modak-try-again.mp3'
      }
    }
  },

  // ========================================
  // ABOUT ME HUT ZONE
  // ========================================
  'about-me-hut': {
    'family-tree': {
      // ========================================
      // OPENING MODAL
      // ========================================
      welcome: {
        text: "This is my family. They make me who I am. Let me show you the people I love!",
        file: 'family-tree-opening-modal.wav'
      },

      // ========================================
      // GANESHA PHASE - INSTRUCTIONS
      // ========================================
      tapCircle: {
        text: "Tap a circle to meet my family!",
        file: 'family-tree-tap-circle.wav'
      },

      // ========================================
      // GANESHA PHASE - QUESTIONS
      // ========================================
      whoFather: {
        text: "Who is Ganesha's Father?",
        file: 'family-tree-who-father.wav'
      },
      whoMother: {
        text: "Who is Ganesha's Mother?",
        file: 'family-tree-who-mother.wav'
      },
      whoBrother: {
        text: "Who is Ganesha's Brother?",
        file: 'family-tree-who-brother.wav'
      },
      whoMyself: {
        text: "Who is Ganesha?",
        file: 'family-tree-who-myself.wav'
      },

      // ========================================
      // GANESHA PHASE - DEITY NAMES
      // ========================================
      shiva: {
        text: "Shiva Ji",
        file: 'shiva.wav'
      },
      parvati: {
        text: "Parvati Mata",
        file: 'parvati mata.wav'
      },
      kartikeya: {
        text: "Kartikeya",
        file: 'kartikeya.wav'
      },
      ganesha: {
        text: "Ganesha",
        file: 'ganesha.wav'
      },
      // Wrong choices
      vishnu: {
        text: "Vishnu Ji",
        file: 'vishnu.wav'
      },
      brahma: {
        text: "Brahma Ji",
        file: 'brahma.wav'
      },
      lakshmi: {
        text: "Lakshmi Mata",
        file: 'lakshmi mata.wav'
      },
      saraswati: {
        text: "Saraswati Mata",
        file: 'saraswati mata.wav'
      },
      hanuman: {
        text: "Hanuman Ji",
        file: 'hanuman.wav'
      },
      krishna: {
        text: "Krishna Ji",
        file: 'krishna.wav'
      },
      mushak: {
        text: "Mushak",
        file: 'mushak.wav'
      },
      nandi: {
        text: "Nandi",
        file: 'nandi.wav'
      },

      // ========================================
      // GANESHA PHASE - FEEDBACK
      // ========================================
      correctChoice: {
        text: "You got it!",
        file: 'family-tree-correct-choice.wav'
      },
      wrongChoice: {
        text: "Almost — try again",
        file: 'family-tree-wrong-choice.wav'
      },

      // ========================================
      // GANESHA PHASE - FUN FACTS (Auto-show after correct choice)
      // ========================================
      factFather: {
        text: "My father is calm and strong. He protects us and teaches me peace.",
        file: 'family-tree-fact-father.wav'
      },
      factMother: {
        text: "My mother is kind and loving. She gives the best hugs and keeps me safe.",
        file: 'family-tree-fact-mother.wav'
      },
      factBrother: {
        text: "My brother is very brave. He travels the world on his peacock.",
        file: 'family-tree-fact-brother.wav'
      },
      factMyself: {
        text: "That's me! I love modaks and helping my friends.",
        file: 'family-tree-fact-myself.wav'
      },

      // ========================================
      // GANESHA PHASE - INFO (Tap placed avatar to view again)
      // ========================================
      infoFather: {
        text: "This is my father.",
        file: 'family-tree-info-father.wav'
      },
      infoMother: {
        text: "This is my mother.",
        file: 'family-tree-info-mother.wav'
      },
      infoBrother: {
        text: "This is my brother.",
        file: 'family-tree-info-brother.wav'
      },
      infoMyself: {
        text: "This is me!",
        file: 'family-tree-info-myself.wav'
      },

      // ========================================
      // GANESHA PHASE - PROGRESS
      // ========================================
      progressFirst: {
        text: "Great start!",
        file: 'family-tree-progress-first-ganesha.wav'
      },
      progressMid: {
        text: "You're doing so well!",
        file: 'family-tree-progress-mid-ganesha.wav'
      },
      progressNearFull: {
        text: "Almost done with my family!",
        file: 'family-tree-progress-near-full-ganesha.wav'
      },
      allPlaced: {
        text: "You met my whole family!",
        file: 'family-tree-all-placed-ganesha.wav'
      },
      hintTap: {
        text: "Tap a circle to meet my family!",
        file: 'family-tree-hint-tap.wav'
      },

      // ========================================
      // TRANSITION MODAL
      // ========================================
      transition: {
        text: "That's my family! Now, I want to see your world. Who are the special people in your house?",
        file: 'family-tree-transition.wav'
      },

      // ========================================
      // CHILD PHASE
      // ========================================
      childStart: {
        text: "Now let's build YOUR family tree!",
        file: 'family-tree-child-start.wav'
      },
      childHint: {
        text: "Tap someone below to add to your tree!",
        file: 'family-tree-child-hint.wav'
      },
      namePrompt: {
        text: "What do you call them?",
        file: 'family-tree-name-prompt.wav'
      },
      namePromptShort: {
        text: "What do you call them?",
        file: 'family-tree-name-prompt-short.wav'
      },
      // Progress milestones (at 1, 5, 10, 16, 21 members)
      childProgressStart: {
        text: "Nice! Your tree has started growing.",
        file: 'family-tree-child-progress1.wav'
      },
      childProgressSmall: {
        text: "Beautiful! You added someone to your family tree.",
        file: 'family-tree-child-progress2.wav'
      },
      childProgressMid: {
        text: "Look at that! Your family tree is getting bigger.",
        file: 'family-tree-child-progress3.wav'
      },
      childProgressNearFull: {
        text: "Mmm. Your tree is filling with love.",
        file: 'family-tree-child-progress-1full.wav'
      },
      childProgressComplete: {
        text: "Aha! Your family tree is full of love!",
        file: 'family-tree-child-progress-full.wav'
      },

      // Row completion VOs (when 7 members fill a row)
      rowLimitGrandparents: {
        text: "Wow! Your grandparents row is full!",
        file: 'ganesha_limit_grandparents.wav'
      },
      rowLimitElders: {
        text: "Amazing! Your parents row is complete!",
        file: 'ganesha_limit_elders.wav'
      },
      rowLimitSiblingsPets: {
        text: "Perfect! Your siblings and pets row is full!",
        file: 'ganesha_limit_siblings_pets.wav'
      },

      // ========================================
      // FINAL SCENE
      // ========================================
      finalReveal: {
        text: "Look at our family trees! Connected by love.",
        file: 'family-tree-final-reveal.wav'
      },
      sceneComplete: {
        text: "You did it! We both have families who love us!",
        file: 'family-tree-scene-complete.wav'
      }
    }
  },

  // ========================================
  // SHARED SFX (in public/audio/sfx/)
  // ========================================
  shared: {
    success: { file: 'sfx-success.wav' },
    tap: { file: 'sfx-tap.mp3' },
    powerUnlock: { file: 'sfx-power-unlock.wav' },
    celebration: { file: 'sfx-celebration.wav' },
    error: { file: 'sfx-oops.wav' },
    whoosh: { file: 'sfx-whoosh.wav' },
    pop: { file: 'sfx-pop.wav' },
    chime: { file: 'sfx-chime.wav' }
  },

  // ========================================
  // BACKGROUND MUSIC (in public/audio/music/)
  // ========================================
  music: {
    ambient: { file: 'bg-ambient.mp3' }
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

// Get voice script
export const getVoiceScript = (zoneId, sceneId, key) => {
  return VOICE_SCRIPTS[zoneId]?.[sceneId]?.[key] || null;
};

// Get audio path for voice files
// Structure for shloka-river:
//   - All VO files (instructions, encouragements, hints, errors, scene VO) → /audio/voiceover/INSTRUCTIONS/
//   - Syllable audio files → /audio/voiceover/{word}/ (e.g., vakratunda/va.mp3)
//   - Full word audio → /audio/voiceover/words/
// Structure for symbol-mountain: /audio/voice/modak/
// Structure for about-me-hut: /audio/family-tree/
export const getAudioPath = (zoneId, sceneId, key) => {
  const script = getVoiceScript(zoneId, sceneId, key);
  if (!script) return null;

  // Shloka River zone - ALL VO files are in INSTRUCTIONS folder
  if (zoneId === 'shloka-river') {
    return `/audio/voiceover/INSTRUCTIONS/${script.file}`;
  }

  // Symbol Mountain zone - legacy path
  if (zoneId === 'symbol-mountain') {
    return `/audio/voice/modak/${script.file}`;
  }

  // About Me Hut zone - family tree
  if (zoneId === 'about-me-hut' && sceneId === 'family-tree') {
    return `/audio/family-tree/${script.file}`;
  }

  // Fallback
  return `/audio/voiceover/INSTRUCTIONS/${script.file}`;
};

// Get syllable audio path (for memory games)
// Syllables are in word-specific folders: /audio/voiceover/{word}/{syllable}.mp3
export const getSyllablePath = (word, syllable) => {
  return `/audio/voiceover/${word}/${syllable}.mp3`;
};

// Get full word audio path
// Full words are in: /audio/voiceover/words/{word}.mp3
export const getWordPath = (word) => {
  return `/audio/voiceover/words/${word}.mp3`;
};

// Get SFX path (in sfx/ folder)
export const getSfxPath = (key) => {
  const sfx = VOICE_SCRIPTS.shared?.[key];
  return sfx ? `/audio/sfx/${sfx.file}` : null;
};

// Get music path (in music/ folder)
export const getMusicPath = (key) => {
  const music = VOICE_SCRIPTS.music?.[key];
  return music ? `/audio/music/${music.file}` : null;
};

// Get hint for current phase
export const getPhaseHint = (phase) => {
  const hintMap = {
    // Symbol Mountain hints
    'findMooshika': 'hintMound',
    'collectModaks': 'tapModak',        // Use tapModak hint for collect phase
    'shareWithGanesha': 'feedHint',     // Use feedHint for feed phase
    // Shloka River hints
    'vakratundaGame': 'hintTapTheShiny',
    'mahakayaGame': 'hintTapTheShiny',
    'listenPhase': 'instructionListen',
    'tapPhase': 'hintLookForGlow'
  };
  return hintMap[phase] || 'hintExplore';
};

// Get random encouragement
export const getRandomEncouragement = () => {
  const encouragements = ['encourage1', 'encourage2', 'encourage3'];
  return encouragements[Math.floor(Math.random() * encouragements.length)];
};
