// Voice Guidance - Multi-Zone Support
// Audio scripts for Ganesha's voice prompts
// Replaces header, help menu, and text instructions

export const VOICE_SCRIPTS = {
  // ========================================
  // SHLOKA RIVER ZONE
  // ========================================
  'shloka-river': {
    'vakratunda-grove': {
      // Scene entry
      welcome: {
        text: "Welcome!",
        file: '/audio/voicenew/vakratundachant/vakratunda-opening.mp3'
      },

      // Vakratunda rounds (after each round completes)
      vakratundaRound1: {
        text: "Round 1 done!",
        file: '/audio/voicenew/vakratundachant/vakratunda-round1.mp3'
      },
      vakratundaRound2: {
        text: "Round 2 done!",
        file: '/audio/voicenew/vakratundachant/vakratunda-round2.mp3'
      },
      vakratundaRound3: {
        text: "Lotus blooming!",
        file: '/audio/voicenew/vakratundachant/vakratunda-lotus blooming.mp3'
      },

      // Vakratunda power reveal
      vakratundaPower: {
        text: "I adapt!",
        file: '/audio/voicenew/vakratundachant/vakratunda- I adapt.mp3'
      },

      // Mahakaya game start
      mahakayaGameStart: {
        text: "Mahakaya - start!",
        file: '/audio/voicenew/vakratundachant/vakratunda-mahakaya - start.mp3'
      },

      // Mahakaya rounds (after each round completes)
      mahakayaRound1: {
        text: "Mahakaya round 1 done!",
        file: '/audio/voicenew/vakratundachant/vakratunda-mahakaya round1.mp3'
      },
      mahakayaRound2: {
        text: "Mahakaya round 2 done!",
        file: '/audio/voicenew/vakratundachant/vakratunda-mahakaya round2.mp3'
      },
      mahakayaRound3: {
        text: "Amazing!",
        file: '/audio/voicenew/vakratundachant/vakratunda-mahakaya amazing.mp3'
      },

      // Mahakaya power reveal
      mahakayaPower: {
        text: "I am strong!",
        file: '/audio/voicenew/vakratundachant/vakratunda-mahakaya-I am strong.mp3'
      },

      // Mahakaya Rescue Game — scene 10 VO lines
      scene10_maha_intro: {
        text: "Now let's help the little calf."
      },
      scene10_maha_blocking: {
        text: "A heavy log is trapping him!"
      },
      scene10_maha_drag_rope: {
        text: "Drag the rope to the log."
      },
      scene10_maha_pull_down: {
        text: "Now pull down!"
      },
      scene10_maha_success: {
        text: "You did it! The calf is free!"
      },
      scene10_maha_meaning: {
        text: "It means great strength."
      },

      // ── Shared instructions — uncomment to activate when VO is ready ───────
      // instructionListen:         { text: "Listen carefully!",                      file: 'instruction_watch_and_listen.mp3' },
      // instructionTapAndRepeat:   { text: "Tap and repeat!",                        file: 'instruction_tap_and_repeat.mp3' },
      // instructionTapTheElephant: { text: "Tap the elephant!",                      file: 'instruction_tap_the_elephant.mp3' },
      // instructionTapLotus:       { text: "Tap the lotus!",                         file: 'instruction_tap_lotus.mp3' },
      // instructionTapLotusWord:   { text: "Tap the lotus to hear the word!",        file: 'instruction_tap_lotus_word.mp3' },
      // instructionTapLotusUnlock: { text: "Tap the lotus to unlock the full word!", file: 'instruction_tap_lotus_unlock.mp3' },
      // hintLookForGlow:           { text: "Look for the glowing one!",              file: 'hint_look_for_glow.mp3' },
      // hintTapTheShiny:           { text: "Tap the shiny syllable!",                file: 'hint_tap_the_shiny.mp3' },
      // errorOops:                 { text: "Oops!",                                  file: 'error_oops.mp3' },
      // errorNotQuite:             { text: "Not quite! Try again!",                  file: 'error_not_quite.mp3' },
      // errorLetsTryAgain:         { text: "Let's try again!",                       file: 'error_lets_try_again.mp3' },

      // Word celebration (plays when a word is fully learned)
      chantWordReveal: {
        text: "Wonderful!",
        file: '/audio/voicenew/vakratundachant/vakratunda-wonderful.wav'
      },

      // Mahakaya word reveal
      'mahakaya-word-reveal': {
        text: "Mahakaya — strong!",
        file: '/audio/voicenew/vakratundachant/ganesha_mahakaya_strong.mp3'
      },

      // Scene complete
      sceneComplete: {
        text: "Scene complete!",
        file: '/audio/voicenew/vakratundachant/vakratunda-scene completion.mp3'
      }
    },
    'suryakoti-bank': {
      welcome: {
        text: "The river is dark today. Let's bring back the light!"
      },
      scene11SuryaHint: {
        text: "Swipe the dark patch."
      },
      scene11SamaHint: {
        text: "Drag the light across. Share the light evenly. Keep balancing."
      },
      scene11SuryaDone: {
        text: "You did it! The bunny found its way home!"
      },
      scene11SamaDone: {
        text: "Both sides are glowing now. You did it."
      },
      scene11SuryaMeaning: {
        text: "It means bright as ten million suns."
      },
      scene11SamaMeaning: {
        text: "It helps us share fairly."
      },
      suryakotiSetup: {
        text: "The bunny found its way because of your light."
      },
      suryakotiClaim: {
        text: "Suryakoti lights the way."
      },
      sceneComplete: {
        text: "You found the bunny. You shared the light. Both powers are yours now."
      }
    },
    'nirvighnam-chant': {
      welcome: {
        text: "Let's help our river friend. The turtle wants to go home."
      },
      scene12NirvHint: {
        text: "Something is blocking the way. Drag the obstacle away. Great job. Clear the next one."
      },
      scene12KuruHint: {
        text: "Now another friend needs help. The beaver needs a bridge. Tap the glowing friend. Look. They are helping. Tap the next friend."
      },
      scene12NirvDone: {
        text: "The path is opening up. You did it. The turtle made it home."
      },
      scene12KuruDone: {
        text: "The bridge is getting bigger. One more helper. The bridge is ready. The beaver made it across."
      },
      scene12NirvMeaning: {
        text: "It helps clear obstacles."
      },
      scene12KuruMeaning: {
        text: "It means helping together."
      },
      sceneComplete: {
        text: "The turtle made it home. The beaver made it across. Both powers are yours now."
      }
    },
    'sarvakaryeshu-chant': {
      welcome: {
        text: "Let's see who needs help. Look carefully."
      },
      scene13_puzzle: {
        text: "The piece wouldn't fit."
      },
      scene13_puzzle_after: {
        text: "So she twisted it a new way!"
      },
      scene13_sports: {
        text: "He wanted to give up."
      },
      scene13_sports_after: {
        text: "But he stayed strong and kept trying!"
      },
      scene13_bike: {
        text: "Both wanted the bike."
      },
      scene13_bike_after: {
        text: "So they took fair turns!"
      },
      scene13_grandma: {
        text: "Grandma's bags were heavy."
      },
      scene13_grandma_after: {
        text: "So he ran to help!"
      },
      scene13SarvaHint: {
        text: "Which power would help here? Tap a power. Nice choice. The problem is solved. Let's help another friend."
      },
      scene13SarvaDone: {
        text: "Choose a power again. You got it. That helped too. One more challenge. Great thinking."
      },
      scene13SarvadaHint: {
        text: "Our journey is not over yet. Let's keep floating down the river. Tap the bubble."
      },
      scene13SarvadaDone: {
        text: "Morning. Ganesha is there too. Tap the next bubble. Afternoon. Ganesha is there too. Tap the last bubble. Night. Ganesha is there too."
      },
      scene13SarvaMeaning: {
        text: "All the problems are solved. Sarvakaryeshu. Ganesha helps in all things."
      },
      scene13SarvadaMeaning: {
        text: "Sarvada. Ganesha guides us always."
      },
      sceneComplete: {
        text: "All the problems are solved. Ganesha helps in all things. Ganesha guides us always."
      }
    },
    'shloka-river-finale': {
      openingModalPrompt: {
        text: "You've learned all eight Ganesha powers. Now let's put the shloka together!"
      },
      arrangeStart: {
        text: "Tap the first word boat."
      },
      sceneComplete: {
        text: "Wonderful! You completed the Ganesha Shloka!"
      },
      recapStart: {
        text: "Look! Your shloka is sailing across the river!"
      },
      finalCelebration: {
        text: "You remembered the whole Ganesha Shloka! All eight Ganesha powers are now with you."
      },
      hintBoatL1: {
        text: "Tap the next word boat."
      },
      hintBoatL2: {
        text: "Find the next word."
      },
      hintBoatL3: {
        text: "Tap the glowing word boat."
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
        text: "Mooshika is nearby. Let's find the sweet modaks."
      },

      // ========================================
      // PHASE 1: FIND MOOSHIKA
      // ========================================
      findMooshika: {
        text: "Mooshika is hiding. Tap the mounds to find him."
      },
      mooshikaFound: {
        text: "There he is... my little friend."
      },
      focusPower: {
        text: "You looked closely... and found him. Say it with me... I can focus."
      },

      // ========================================
      // PHASE 2: COLLECT MODAKS
      // ========================================
      collectStart: {
        text: "Look... sweet modaks. Tap them to collect."
      },

      // ========================================
      // PHASE 3: SHARE WITH GANESHA
      // ========================================
      sharingPower: {
        text: "You found them... one by one. That feels good. Say it with me... I am full of joy."
      },
      // Instruction to feed (drag version)
      feedGanesha: {
        text: "Let's enjoy the sweet modaks... drag them here."
      },

      // ========================================
      // PHASE 4: SCENE COMPLETE
      // ========================================
      gratitudePower: {
        text: "You gave... and it felt good. Say it with me... I feel good inside."
      },
      kindHeartPower: {
        text: "You have a kind heart!",
        file: 'modak-kind-heart-power.mp3'
      },

      symbolDiscovery: {
        text: "You found 3 special symbols! Tap each one to learn their secret!",
        file: 'modak-symbol-discovery.mp3'
      },

      sceneComplete: {
        text: "You found Mooshika. You felt joy. You feel good inside. All yours."
      },
    }
    ,
    'final-scene': {
      openingModalPrompt: {
        text: "You found every symbol... let's place them together.",
        file: '/audio/voicenew/sacredassembly/opening-modal-ready-together.wav'
      },

      cardEyes: {
        text: "Eyes.",
        file: '/audio/voicenew/sacredassembly/card-eyes.wav'
      },
      cardEars: {
        text: "Ears.",
        file: '/audio/voicenew/sacredassembly/card-ears.wav'
      },
      cardTrunk: {
        text: "Trunk.",
        file: '/audio/voicenew/sacredassembly/card-trunk.wav'
      },
      cardTusk: {
        text: "Tusk.",
        file: '/audio/voicenew/sacredassembly/card-tusk.wav'
      },
      cardModak: {
        text: "Modak.",
        file: '/audio/voicenew/sacredassembly/card-modak.wav'
      },
      cardLotus: {
        text: "Lotus.",
        file: '/audio/voicenew/sacredassembly/card-lotus.wav'
      },
      cardBelly: {
        text: "Belly.",
        file: '/audio/voicenew/sacredassembly/card-belly.wav'
      },
      cardMooshika: {
        text: "Mooshika.",
        file: '/audio/voicenew/sacredassembly/card-mooshika.wav'
      },

      hintEyes: {
        text: "I see clearly."
      },
      hintEars: {
        text: "I listen with care."
      },
      hintTrunk: {
        text: "I find my way."
      },
      hintTusk: {
        text: "I finish what I start."
      },
      hintModak: {
        text: "I am full of joy."
      },
      hintLotus: {
        text: "I stay calm."
      },
      hintBelly: {
        text: "I feel safe inside."
      },
      hintMooshika: {
        text: "I can focus."
      },

      onboardingTapRightPart: {
        text: "Tap the right part of me.",
        file: '/audio/voicenew/sacredassembly/onboarding-tap-right-part.wav'
      },

      firstSymbolPlaced: {
        text: "Yes... that's exactly right."
      },
      midProgressWonder: {
        text: "Look... you're bringing me alive."
      },

      wrongTryAgain: {
        text: "Hmm... try again.",
        file: '/audio/voicenew/sacredassembly/wrong-try-again.wav'
      },

      finalYouFoundAll: {
        text: "You found all my symbols...",
        file: '/audio/voicenew/sacredassembly/final-you-found-all.wav'
      },
      finalNowComplete: {
        text: "Now I am complete.",
        file: '/audio/voicenew/sacredassembly/final-now-complete.wav'
      },
      finalAlwaysWithYou: {
        text: "And all my powers... are with you now.",
        file: '/audio/voicenew/sacredassembly/final-always-with-you.wav'
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
        text: "Let's meet my family and yours!",
        useWebSpeech: true
      },

      // ========================================
      // GANESHA PHASE - INSTRUCTIONS
      // ========================================
      tapCircle: {
        text: "Tap a circle to meet my family!",
        file: 'family-tree-tap-circle.wav'
      },

      // ========================================
      // GANESHA PHASE - DEITY NAMES (plays after deity is placed)
      // ========================================
      shiva: {
        text: "Shiva Ji",
        file: '/audio/voicenew/familytree/ganesha_shiva_name.wav'
      },
      parvati: {
        text: "Parvati Mata",
        file: '/audio/voicenew/familytree/ganesha_parvati_name.wav'
      },
      kartikeya: {
        text: "Kartikeya",
        file: '/audio/voicenew/familytree/kartikeya.wav'
      },
      ganesha: {
        text: "Ganesha",
        file: '/audio/voicenew/familytree/ganesha_name.mp3'
      },
      vishnu: {
        text: "Vishnu",
        file: '/audio/voicenew/familytree/vishnu.wav'
      },
      lakshmi: {
        text: "Lakshmi",
        file: '/audio/voicenew/familytree/lakshmi.mp3'
      },
      hanuman: {
        text: "Hanuman",
        file: '/audio/voicenew/familytree/hanuman.mp3'
      },
      krishna: {
        text: "Krishna",
        file: '/audio/voicenew/familytree/krishna.mp3'
      },
      mushak: {
        text: "Mooshak",
        file: '/audio/voicenew/familytree/mushak.wav'
      },
      brahma: {
        text: "Brahma",
        file: '/audio/voicenew/familytree/brahma.wav'
      },
      saraswati: {
        text: "Saraswati",
        file: '/audio/voicenew/familytree/saraswati.wav'
      },

      // ========================================
      // GANESHA PHASE - CORRECT PLACEMENT (relationship reveal)
      // ========================================
      correctFather: {
        text: "That's my father!",
        file: '/audio/voicenew/familytree/ganesha_shiva_father.mp3'
      },
      correctMother: {
        text: "That's my mother!",
        file: '/audio/voicenew/familytree/ganesha_parvati_mother.mp3'
      },
      correctBrother: {
        text: "That's my brother!",
        file: '/audio/voicenew/familytree/ganesha_kartikeya_brother.mp3'
      },
      correctMyself: {
        text: "That's me!",
        file: '/audio/voicenew/familytree/ganesha_me.mp3'
      },

      // ========================================
      // GANESHA PHASE - FUN FACTS
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
      // GANESHA PHASE - INFO (tap placed avatar)
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
      progressNearFull: {
        text: "Almost done with my family!",
        file: 'family-tree-progress-near-full-ganesha.wav'
      },
      hintTap: {
        text: "Tap a circle to meet my family!",
        file: '/audio/family-tree/family-tree-hint-tap.mp3'
      },
      allPlaced: {
        text: "Great! You met my loving family!",
        file: '/audio/voicenew/familytree/ganesha_family_safe.mp3'
      },

      // ========================================
      // TRANSITION MODAL
      // ========================================
      transition: {
        text: "Show me your family!",
        file: '/audio/voicenew/familytree/ganesha_build_tree.mp3'
      },

      // ========================================
      // CHILD PHASE
      // ========================================
      childStart: {
        text: "Now it's your turn! Add your family to the tree.",
        file: 'family-tree-child-start.wav'
      },
      childHint: {
        text: "Tap someone below to add to your tree!",
        file: 'family-tree-child-hint.wav'
      },
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
        text: "Look at your beautiful family tree… So many people care about you.",
        file: '/audio/voicenew/familytree/ganesha_beautiful_tree.mp3'
      },

      // ========================================
      // FINAL SCENE
      // ========================================
      sceneComplete: {
        text: "Look at our family trees. Connected by love.",
        file: '/audio/voicenew/familytree/ganesha_connected_love.mp3'
      }
    },
    'favorite-food': {
      opening: {
        text: "Let's explore my favorite things and yours!",
        file: '/audio/about-me-hut/favorite-food/opening.mp3'
      }
    },
    'dreams-wishes': {
      opening: {
        text: "Let’s help and dream together!",
        file: '/audio/about-me-hut/dreams-wishes/opening.mp3'
      }
    },
    'my-indian-story': {
      opening: {
        text: "Tap to explore my India story and yours!",
        file: '/audio/about-me-hut/my-indian-story/opening.mp3'
      }
    },
    
  },

  // ========================================
  // SHARED SFX (in public/audio/sfx/)
  // ========================================
  shared: {
    // New unified role taxonomy (preferred)
    tap: { file: 'sfx-tap.mp3' },
    softWrong: { file: 'sfx-soft-wrong.wav' },
    discovery: { file: 'sfx-discovery.wav' },
    revealBloom: { file: 'sfx-reveal-bloom.wav' },
    place: { file: 'sfx-place.wav' },
    transition: { file: 'sfx-transition.wav' },
    emotionalGlow: { file: 'sfx-emotional-glow.wav' },
    celebration: { file: 'sfx-celebration.wav' },
    idleHint: { file: 'sfx-idle-hint.wav' },
    frogHop: { file: 'sfx-frog-hop.mp3' },
    frogReunion: { file: 'sfx-frog-reunion.mp3' },

    // Legacy keys (kept for backward compatibility during migration)
    success: { file: 'sfx-success.wav' },
    powerUnlock: { file: 'sfx-power-unlock.wav' },
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
  if (!script.file) return null;

  // Absolute paths should work across all zones/scenes.
  if (script.file?.startsWith('/')) return script.file;

  // Shloka River zone
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
// Full words are in: /audio/words/{word}.mp3
export const getWordPath = (word) => {
  return `/audio/words/${word}.mp3`;
};

// Get SFX path (in sfx/ folder)
export const getSfxPath = (key) => {
  const sfx = VOICE_SCRIPTS.shared?.[key];
  // Use curated mapped pack first; keep legacy folder as fallback in caller if needed.
  return sfx ? `/audio/sfx-role-mapping-2/${sfx.file}` : null;
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
    'collectModaks': 'tapModak',
    'shareWithGanesha': 'feedHint',
    // Shloka River hints
    'suryakotiGame': 'scene11SuryaHint',
    'samaprabhaGame': 'scene11SamaHint',
    'nirvighnamGame': 'scene12NirvHint',
    'kurumedevaGame': 'scene12KuruHint',
    'sarvakaryeshuGame': 'scene13SarvaHint',
    'sarvadaGame': 'scene13SarvadaHint',
    'shlokaRiverFinale': 'hintBoat',
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
