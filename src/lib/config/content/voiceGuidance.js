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
        text: "Our river friends need a way across. Let’s help."
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
        text: "I can change my plan and try another way."
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
        text: "I can make space in my heart for others."
      },

      // Mahakaya Rescue Game — scene 10 VO lines
      scene10_vak_intro: {
        text: "Frog’s way to his family is blocked. Drag Frog to find another way."
      },
      scene10_vak_choose: {
        text: "That way is blocked. Can you find another way around?"
      },
      scene10_vak_crossed: {
        text: "Vakratunda! You found another way and helped Frog reach his family."
      },
      scene10_vak_current_too_strong: {
        text: "That way is blocked. Can you find another way around?"
      },
      scene10_vak_hint_another_way: {
        text: "Try going around it."
      },
      scene10_maha_intro: {
        text: "Everyone wants to cross the river. Drag the logs to build a raft."
      },
      scene10_maha_drag_water: {
        text: "Drag the log into the water."
      },
      scene10_maha_place_here: {
        text: "Put the log here."
      },
      scene10_maha_success: {
        text: "Mahakaay! You made space so everyone could come along."
      },
      scene10_maha_keep_adding: {
        text: "Keep adding logs to the raft."
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
        text: "Mahakaay - great form!"
      },

      // Scene complete
      sceneComplete: {
        text: "You found another way, and made sure everyone could come along."
      }
    },
    'suryakoti-bank': {
      welcome: {
        text: "The river is dark. Let’s bring back some light."
      },
      scene11SuryaHint: {
        text: "Rub the glowing spot."
      },
      surya_hint_rub: {
        text: "Rub the glowing spot."
      },
      surya_hint_keep: {
        text: "Keep rubbing."
      },
      scene11_surya_keep_rubbing: {
        text: "Keep rubbing to bring back more light."
      },
      scene11SamaHint: {
        text: "Press and hold on the shadow."
      },
      scene11_sama_find_another: {
        text: "Press and hold another part of the shadow."
      },
      scene11SuryaDone: {
        text: "Suryakoti! You brought back the light and helped Bunny home."
      },
      scene11SamaDone: {
        text: "Samaprabha! You looked closely and helped Deer feel safe."
      },

      suryakotiSetup: {
        text: "Bunny can’t find home. Rub the glow to bring back the light."
      },
      suryakotiClaim: {
        text: "Deer sees a strange shadow. Press and hold to look closely."
      },
      sceneComplete: {
        text: "You brought back the light and saw what was really there."
      }
    },
    'nirvighnam-chant': {
      welcome: {
        text: "The way ahead is tricky. Let’s help our friends through."
      },
      scene12NirvHint: {
        text: "Turtle’s way home is blocked. Press and hold the rock to move it."
      },
      nirv_branch_intro: {
        text: "The branch is still blocking the way. Drag it onto the bank."
      },
      nirv_reed_intro: {
        text: "The reeds are blocking the way. Swipe them apart."
      },
      nirv_hint_branch: {
        text: "Drag the branch onto the bank."
      },
      nirv_hint_reed: {
        text: "Swipe the reeds apart."
      },
      nirv_hint_keep_branch: {
        text: "Drag the branch onto the bank."
      },
      nirv_hint_keep_reed: {
        text: "Swipe the reeds apart."
      },
      scene12KuruHint: {
        text: "Baby Beaver is across the river."
      },
      scene12NirvDone: {
        text: "You cleared the way and helped Turtle through."
      },
      scene12KuruDone: {
        text: "Kuru Me Deva! You asked for help and built the bridge."
      },

      // Kurumedeva bridge game (v2 — no more solo try/fail beats)
      kuru_ask_elephant: {
        text: "The logs are too heavy. Drag the help bubble to someone who can help."
      },
      kuru_ask_monkey: {
        text: "The rope needs tying. Drag the help bubble to someone who can help."
      },
      kuru_logs_after: {
        text: "Elephant helped put the logs in place."
      },
      kuru_rope_after: {
        text: "Monkey helped tie the rope."
      },
      kuru_plank_instruction: {
        text: "Now drag the planks into place."
      },
      kuru_plank_continue: {
        text: "Good. Continue dragging the planks."
      },
      kuru_hint_ask: {
        text: "Drag the help bubble to someone who can help."
      },
      kuru_hint_elephant: {
        text: "Drag the help bubble to Elephant."
      },
      kuru_hint_monkey: {
        text: "Drag the help bubble to Monkey."
      },
      kuru_hint_plank_soft: {
        text: "Drag a plank toward the bridge."
      },
      kuru_hint_plank_direct: {
        text: "Drag the plank onto the glowing place."
      },

      sceneComplete: {
        text: "You cleared the path and asked for help when things got hard."
      }
    },
    'sarvakaryeshu-chant': {
      welcome: {
        text: "Let’s see where Ganesha is with you today."
      },
      scene13_puzzle: {
        text: "So much to do. Which symbol can help him start small?"
      },
      scene13_puzzle_after: {
        text: "Mooshika helped him begin with one small thing."
      },
      scene13_sports: {
        text: "So many distractions. Which symbol can help him focus?"
      },
      scene13_sports_after: {
        text: "The Eyes helped him focus on what mattered."
      },
      scene13_bike: {
        text: "Heavy here, gentle there. Which symbol can help?"
      },
      scene13_bike_after: {
        text: "The Trunk helped him use strength, then gentleness."
      },
      scene13_grandma: {
        text: "The crayon is broken. Which symbol can help?"
      },
      scene13_grandma_after: {
        text: "The Tusk reminded her that something broken can still help."
      },
      scene13_hint_mooshika_1: {
        text: "Which symbol can help him start small?"
      },
      scene13_hint_mooshika_2: {
        text: "Think of a symbol that reminds us to begin with one small step."
      },
      scene13_hint_mooshika_3: {
        text: "Remember? Mooshika helps us start small."
      },
      scene13_hint_trunk_1: {
        text: "Which symbol helps us be strong and gentle?"
      },
      scene13_hint_trunk_2: {
        text: "Think of a symbol that can be strong and gentle."
      },
      scene13_hint_trunk_3: {
        text: "Remember? The Trunk can be strong and gentle."
      },
      scene13_hint_eyes_1: {
        text: "Which symbol can help him focus?"
      },
      scene13_hint_eyes_2: {
        text: "Think of the symbol that helps us notice what matters."
      },
      scene13_hint_eyes_3: {
        text: "Remember? The Eyes help us focus on what matters."
      },
      scene13_hint_tusk_1: {
        text: "Which symbol reminds us broken things can still help?"
      },
      scene13_hint_tusk_2: {
        text: "Think of a symbol that shows something broken can still be useful."
      },
      scene13_hint_tusk_3: {
        text: "Remember? The Tusk can still help, even when it's broken."
      },
      scene13SarvaHint: {
        text: "Which power would help here? Tap a power. Nice choice. The problem is solved. Let's help another friend."
      },
      scene13SarvaDone: {
        text: "Choose a power again. You got it. That helped too. One more challenge. Great thinking."
      },
      scene14_hint_morning_1: {
        text: "Look for something that helps us listen."
      },
      scene14_hint_morning_2: {
        text: "Look for something that helps us listen."
      },
      scene14_hint_morning_3: {
        text: "Look closely at the backpack."
      },
      scene14_hint_afternoon_1: {
        text: "Look for something that can hold lots of feelings."
      },
      scene14_hint_afternoon_2: {
        text: "Look for something that can hold lots of feelings."
      },
      scene14_hint_afternoon_3: {
        text: "Look at the playground."
      },
      scene14_hint_night_1: {
        text: "Look for something sweet that reminds us of joy."
      },
      scene14_hint_night_2: {
        text: "Look for something sweet that reminds us of joy."
      },
      scene14_hint_night_3: {
        text: "Look near the lamp."
      },
      scene13SarvadaHint: {
        text: "Look through the picture and find Ganesha's hidden symbol."
      },
      scene13SarvadaDone: {
        text: "Morning, afternoon, and night. Ganesha is with you through the whole day."
      },
      scene14_intro: {
        text: "Morning, afternoon and night — let’s find Ganesha through your day."
      },
      scene14_morning: {
        text: "Morning can be busy. What can help him listen?"
      },
      scene14_afternoon: {
        text: "Things didn’t go his way. What can help him keep going?"
      },
      scene14_night: {
        text: "He kept trying and finished the puzzle. What can remind him of that happy feeling?"
      },
      scene14_find_symbol: {
        text: "Can you find the hidden symbol?"
      },
      scene14_success: {
        text: "You found Ganesha through the whole day."
      },

      sceneComplete: {
        text: "From morning to night, Ganesha was with you."
      }
    },
    'shloka-river-finale': {
      openingModalPrompt: {
        text: "You found all eight words. Now let’s put them together."
      },
      arrangeStart: {
        text: "Watch the Shloka come alive."
      },
      finaleChooseFirst: {
        text: "Now, choose the first symbol boat in the Shloka."
      },
      finaleChooseNext: {
        text: "Now, choose the next one."
      },
      finaleKeepChoosing: {
        text: "Great! Keep choosing."
      },
      sceneComplete: {
        text: "You did it! The whole Shloka is in place."
      },
      recapStart: {
        text: "Now listen to the whole shloka."
      },
      finaleWholeShlokaIntro: {
        text: "Now, let's say it together."
      },
      finalCelebration: {
        text: "You remembered the whole Ganesha Shloka. Now you can carry it with you."
      },
      hintBoatL3: {
        text: "Tap the glowing boat."
      },
      hintMeaningVakratunda: {
        text: "Remember Ganesha's curved trunk."
      },
      hintMeaningMahakaya: {
        text: "Think of Ganesha's great form."
      },
      hintMeaningSuryakoti: {
        text: "Think of a light as bright as millions of suns."
      },
      hintMeaningSamaprabha: {
        text: "Think of steady, equal brightness."
      },
      hintMeaningNirvighnam: {
        text: "Remember the word about clearing obstacles."
      },
      hintMeaningKurumedeva: {
        text: "Remember the words that ask for help."
      },
      hintMeaningSarvakaryeshu: {
        text: "Think of the word for everything we do."
      },
      hintMeaningSarvada: {
        text: "Remember the word that means always."
      },
      finaleVakratundaHintL2: {
        text: "Which symbol can help you try another way?"
      },
      finaleVakratundaHintL3: {
        text: "Remember Vakratunda."
      },
      finaleMahakayaHintL2: {
        text: "Which symbol reminds you to make space for others?"
      },
      finaleMahakayaHintL3: {
        text: "Remember Mahakaay."
      },
      finaleSuryakotiHintL2: {
        text: "Which symbol can help you find hope inside?"
      },
      finaleSuryakotiHintL3: {
        text: "Remember Suryakoti."
      },
      finaleSamaprabhaHintL2: {
        text: "Which symbol can help you see what is really there?"
      },
      finaleSamaprabhaHintL3: {
        text: "Remember Samaprabha."
      },
      finaleNirvighnamHintL2: {
        text: "Which symbol can help you solve one thing at a time?"
      },
      finaleNirvighnamHintL3: {
        text: "Remember Nirvighnam."
      },
      finaleKurumedevaHintL2: {
        text: "Which symbol reminds you to ask for help?"
      },
      finaleKurumedevaHintL3: {
        text: "Remember Kuru Me Deva."
      },
      finaleSarvakaryeshuHintL2: {
        text: "Which symbol reminds you of Ganesha in all you do?"
      },
      finaleSarvakaryeshuHintL3: {
        text: "Remember Sarva Karyeshu."
      },
      finaleSarvadaHintL2: {
        text: "Which symbol reminds you Ganesha is always with you?"
      },
      finaleSarvadaHintL3: {
        text: "Remember Sarvada."
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
      openingModalPrompt: {
        text: "Mooshika has a journey ahead. Let’s help him."
      },

      // ========================================
      // PHASE 1: FIND MOOSHIKA
      // ========================================
      findMooshika: {
        text: "Mooshika’s thoughts keep jumping around. Press and hold to help him focus."
      },
      mooshikaFound: {
        text: "Mooshika stayed with it and made a little progress."
      },
      focusPower: {
        text: "I can keep going, one small step at a time."
      },

      // ========================================
      // PHASE 2: COLLECT MODAKS
      // ========================================
      collectStart: {
        text: "You found all six flowers. Tap them to make a garland for Ganesha."
      },

      // ========================================
      // PHASE 3: SHARE WITH GANESHA
      // ========================================
      sharingPower: {
        text: "I can learn, keep trying, and find joy."
      },
      bellyStart: {
        text: "Mooshika has more challenges ahead. Let’s help him keep going."
      },
      bellyIdle: {
        text: "Guide Mooshika to the next safe spot."
      },

      // ========================================
      // PHASE 4: SCENE COMPLETE
      // ========================================
      bellyPower: {
        text: "I can have lots of feelings and keep going."
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
        text: "Small steps, big feelings, and lots of trying brought Mooshika to Ganesha."
      },
    }
    ,
    'final-scene': {
      openingModalPrompt: {
        text: "You found all eight symbols. Let’s see what you remember."
      },

      cardEyes: {
        text: "Eyes. I can focus on what matters."
      },
      cardEars: {
        text: "Ears. I can listen for what helps me."
      },
      cardTrunk: {
        text: "Trunk. I can be strong and gentle."
      },
      cardTusk: {
        text: "Tusk. I can use what I have for something important."
      },
      cardModak: {
        text: "Modak. I can learn, keep trying, and find joy."
      },
      cardLotus: {
        text: "Lotus. I can keep growing when things are hard."
      },
      cardBelly: {
        text: "Big Belly. I can have lots of feelings and keep going."
      },
      cardMooshika: {
        text: "Mooshika. I can keep going, one small step at a time."
      },

      hintEyes: {
        text: "I can focus on what matters."
      },
      hintEars: {
        text: "I can listen for what helps me."
      },
      hintTrunk: {
        text: "I can be strong and gentle."
      },
      hintTusk: {
        text: "I can use what I have for something important."
      },
      hintModak: {
        text: "I can learn, keep trying, and find joy."
      },
      hintLotus: {
        text: "I can keep growing when things are hard."
      },
      hintBelly: {
        text: "I can have lots of feelings and keep going."
      },
      hintMooshika: {
        text: "I can keep going, one small step at a time."
      },

      onboardingTapRightPart: {
        text: "Look at the symbol, then tap where it belongs."
      },

      threeSymbolsPlaced: {
        text: "You’re remembering what Ganesha’s symbols mean."
      },
      sixSymbolsPlaced: {
        text: "Almost there — six symbols are back with Ganesha."
      },

      wrongTryAgain: {
        text: "Try another place."
      },

      // Final fireworks: 2-line recap (what you did -> what it means), 700ms gap
      finalYouFoundAll: {
        text: "You remembered all eight symbols and what they mean."
      },
      finalAlwaysWithYou: {
        text: "Now when you see Ganesha, you can remember their wisdom."
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
        text: "Let’s meet my family, then make your family tree.",
        useWebSpeech: true
      },

      // ========================================
      // GANESHA PHASE - INSTRUCTIONS
      // ========================================
      tapCircle: {
        text: "Tap a circle to meet someone in my family."
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
        text: "This is my father, Shiva."
      },
      correctMother: {
        text: "This is my mother, Parvati."
      },
      correctBrother: {
        text: "This is my brother, Kartikeya."
      },
      correctMyself: {
        text: "And that's me, Ganesha!"
      },

      // ========================================
      // GANESHA PHASE - FUN FACTS
      // ========================================
      factFather: {
        text: "My father is calm and strong."
      },
      factMother: {
        text: "My mother is kind and caring."
      },
      factBrother: {
        text: "My brother is brave and rides a peacock."
      },
      factMyself: {
        text: "I love modaks and helping my friends."
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
        text: "Who belongs in this spot?"
      },
      allPlaced: {
        text: "You met everyone in my family."
      },

      // ========================================
      // TRANSITION MODAL
      // ========================================
      transition: {
        text: "Now let's make your family tree."
      },

      // ========================================
      // CHILD PHASE
      // ========================================
      childStart: {
        text: "Tap the people or pets you want to add."
      },
      childHint: {
        text: "Who else belongs on your tree?"
      },
      childProgressStart: {
        text: "Your family tree is growing."
      },
      childProgressSmall: {
        text: "Your family tree is growing."
      },
      childProgressMid: {
        text: "Your family tree is growing."
      },
      childProgressNearFull: {
        text: "Your family tree is growing."
      },
      childProgressComplete: {
        text: "These are the people and pets you chose for your family."
      },

      // ========================================
      // FINAL SCENE
      // ========================================
      sceneComplete: {
        text: "Our family trees are different, and each one tells a story."
      }
    },
    'favorite-food': {
      opening: {
        text: "Let’s find my favorites, then yours."
      }
    },
    'my-indian-story': {
      opening: {
        text: "Let’s explore my India story, then yours."
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
    currentPush: { file: 'sfx-soft-wrong.wav' },

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
// Some Shloka River syllables have curated prerecorded files in /audio/syllables.
const PRERECORDED_SYLLABLE_PATHS = {
  vakratunda: {
    va: '/audio/syllables/vakratunda-va.mp3',
    kra: '/audio/syllables/vakratunda-kra.mp3',
    tun: '/audio/syllables/vakratunda-tun.mp3',
    da: '/audio/syllables/vakratunda-da.mp3'
  },
  mahakaya: {
    ma: '/audio/syllables/mahakaya-ma.mp3',
    ha: '/audio/syllables/mahakaya-ha.mp3',
    ka: '/audio/syllables/mahakaya-ka.mp3',
    ya: '/audio/syllables/mahakaya-ya.mp3'
  },
  suryakoti: {
    sur: '/audio/syllables/suryakoti-sur.mp3',
    ya: '/audio/syllables/suryakoti-ya.mp3',
    ko: '/audio/syllables/suryakoti-ko.mp3',
    ti: '/audio/syllables/suryakoti-ti.mp3'
  },
  samaprabha: {
    sa: '/audio/syllables/samaprabha-sa.mp3',
    ma: '/audio/syllables/samaprabha-ma.mp3',
    pra: '/audio/syllables/samaprabha-pra.mp3',
    bha: '/audio/syllables/samaprabha-bha.mp3'
  },
  nirvighnam: {
    nir: '/audio/syllables/nirvighnam-nir.mp3',
    vigh: '/audio/syllables/nirvighnam-vigh.mp3',
    nam: '/audio/syllables/nirvighnam-nam.mp3'
  },
  kurumedeva: {
    kuru: '/audio/syllables/kurume -kuru.mp3',
    me: '/audio/syllables/kurume-me.mp3',
    de: '/audio/syllables/deva-de.mp3',
    va: '/audio/syllables/deva-va.mp3'
  },
  sarvakaryeshu: {
    sar: '/audio/syllables/sarvakaryeshu-sar.mp3',
    va: '/audio/syllables/sarvakaryeshu-va.mp3',
    kar: '/audio/voiceover/sarvakaryeshu/kar.mp3', // was sarvakaryeshu-kar.mp3 (missing); this is the real "kar" clip
    rye: '/audio/syllables/sarvakaryeshu-rye.mp3',
    yeshu: '/audio/syllables/sarvakaryeshu-shu.mp3',
    shu: '/audio/syllables/sarvakaryeshu-shu.mp3'
  },
  sarvada: {
    sar: '/audio/syllables/sarvada-sar.mp3',
    va: '/audio/syllables/sarvada-va.mp3',
    da: '/audio/syllables/sarvada-da.mp3'
  }
};

export const getSyllablePath = (word, syllable) => {
  const prerecordedPath = PRERECORDED_SYLLABLE_PATHS[word]?.[syllable];
  if (prerecordedPath) return prerecordedPath;
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
