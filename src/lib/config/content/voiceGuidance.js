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
        text: "I can make room!",
        file: '/audio/voicenew/vakratundachant/vakratunda-mahakaya-I am strong.mp3'
      },

      // Mahakaya Rescue Game — scene 10 VO lines
      scene10_vak_intro: {
        text: "The frog can see his family, but rocks and logs block the way. Help him find a way around."
      },
      scene10_vak_choose: {
        text: "Help guide the lily pad another way."
      },
      scene10_vak_crossed: {
        text: "Vakratunda! You found another way and helped the frog reach his family."
      },
      scene10_vak_current_too_strong: {
        text: "The river current is too strong there. Let's try another way."
      },
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
        text: "Mahakaya! You made the raft bigger, and everyone crossed."
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
        text: "The light showed the way!"
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
        text: "The light showed the way."
      },
      suryakotiClaim: {
        text: "Suryakoti lights the way."
      },
      sceneComplete: {
        text: "The light showed the way. Both shine equally now."
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
        text: "Now another friend needs help. The beaver needs a bridge. Drag the help bubble to a friend. Look. They are helping. Ask the next friend."
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
        text: "The painting didn't go as planned. What could help him try a different way?"
      },
      scene13_puzzle_after: {
        text: "The Trunk helped him try another way — and the splat became a whale!"
      },
      scene13_sports: {
        text: "He feels upset inside. What could help him make room for his feelings?"
      },
      scene13_sports_after: {
        text: "The Belly reminded him to make room for his feelings and take a slow breath."
      },
      scene13_bike: {
        text: "Everyone is looking, but they're missing an important clue. What could help her notice it?"
      },
      scene13_bike_after: {
        text: "The Eyes helped her look carefully and notice what everyone else missed."
      },
      scene13_grandma: {
        text: "He wants to finish his special card, but everything keeps pulling his attention away. What could help him stay focused?"
      },
      scene13_grandma_after: {
        text: "The Tusk helped him stay focused on what was important."
      },
      scene13_hint_trunk_1: {
        text: "Which symbol helps when one way doesn't work?"
      },
      scene13_hint_trunk_2: {
        text: "Which symbol reminds you to bend, change, and try another way?"
      },
      scene13_hint_trunk_3: {
        text: "Which long, bendy part of Ganesha can twist and turn?"
      },
      scene13_hint_belly_1: {
        text: "Which symbol reminds you there is room for all your feelings?"
      },
      scene13_hint_belly_2: {
        text: "Which symbol can hold happy, sad, worried, and angry feelings too?"
      },
      scene13_hint_belly_3: {
        text: "Which big part of Ganesha can hold so much inside?"
      },
      scene13_hint_eyes_1: {
        text: "Which symbol helps you notice what matters?"
      },
      scene13_hint_eyes_2: {
        text: "Which symbol reminds you to look carefully and spot what others may miss?"
      },
      scene13_hint_eyes_3: {
        text: "Which part of Ganesha helps him see?"
      },
      scene13_hint_tusk_1: {
        text: "Which symbol reminds you to stay with what is important?"
      },
      scene13_hint_tusk_2: {
        text: "Which symbol reminds you to stay strong and focused, even when something is difficult?"
      },
      scene13_hint_tusk_3: {
        text: "Which strong white part does Ganesha have only one of?"
      },
      scene13SarvaHint: {
        text: "Which power would help here? Tap a power. Nice choice. The problem is solved. Let's help another friend."
      },
      scene13SarvaDone: {
        text: "Choose a power again. You got it. That helped too. One more challenge. Great thinking."
      },
      scene14_hint_morning_1: {
        text: "Look for a small friend who can be quick and busy."
      },
      scene14_hint_morning_2: {
        text: "He may be hiding near something you take with you in the morning."
      },
      scene14_hint_morning_3: {
        text: "Look near the school bag for a tiny mouse."
      },
      scene14_hint_afternoon_1: {
        text: "Look for a symbol that can bend and curve."
      },
      scene14_hint_afternoon_2: {
        text: "Something flying in the sky has a long curving shape."
      },
      scene14_hint_afternoon_3: {
        text: "Look closely at the kite's tail."
      },
      scene14_hint_night_1: {
        text: "Look for a symbol that stays peaceful even when things around it are messy."
      },
      scene14_hint_night_2: {
        text: "A flower shape is hiding somewhere near the bed."
      },
      scene14_hint_night_3: {
        text: "Look at the bedside lamp for the lotus."
      },
      scene13SarvadaHint: {
        text: "Our journey is not over yet. Let's keep floating down the river. Tap the bubble."
      },
      scene13SarvadaDone: {
        text: "Morning. Ganesha is there too. Tap the next bubble. Afternoon. Ganesha is there too. Tap the last bubble. Night. Ganesha is there too."
      },
      scene13SarvaMeaning: {
        text: "Sarvakaryeshu. Every task can be done with care."
      },
      scene13SarvadaMeaning: {
        text: "Sarvada. What I learn stays with me."
      },
      sceneComplete: {
        text: "Every task can be done with care. Sarvada. Always."
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

      // ========================================
      // PHASE 1: FIND MOOSHIKA
      // ========================================
      findMooshika: {
        text: "Mooshika is darting around. Press and hold him gently to help him settle."
      },
      mooshikaFound: {
        text: "There he is... calm and ready to walk with us."
      },
      focusPower: {
        text: "You helped Mooshika slow down. Say it with me... I can guide my busy thoughts."
      },

      // ========================================
      // PHASE 2: COLLECT MODAKS
      // ========================================
      collectStart: {
        text: "Mushika is ready to gather three offerings for Ganesha. Drag her to each one."
      },

      // ========================================
      // PHASE 3: SHARE WITH GANESHA
      // ========================================
      sharingPower: {
        text: "The sweetness of modak reminds us of a happy, peaceful feeling inside. Say it with me... I have joy inside me."
      },
      // Instruction to feed (drag version)
      feedGanesha: {
        text: "Drag each feeling into Ganesha's belly. There is room for every feeling."
      },

      // ========================================
      // PHASE 4: SCENE COMPLETE
      // ========================================
      gratitudePower: {
        text: "There is room for all my feelings."
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
        text: "You helped Mooshika settle, found the sweetness inside, and made room for every feeling."
      },
    }
    ,
    'final-scene': {
      openingModalPrompt: {
        text: "You found all eight symbols. Now let's put them in the right place."
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
        text: "I notice what's around me."
      },
      hintEars: {
        text: "I listen with care."
      },
      hintTrunk: {
        text: "I can find another way."
      },
      hintTusk: {
        text: "I stay focused on what is true."
      },
      hintModak: {
        text: "I can feel peaceful inside."
      },
      hintLotus: {
        text: "I can stay calm when things get messy."
      },
      hintBelly: {
        text: "I have room for all my feelings."
      },
      hintMooshika: {
        text: "I can guide my busy thoughts."
      },

      onboardingTapRightPart: {
        text: "Look at the symbol, then tap where it belongs."
      },

      firstSymbolPlaced: {
        text: "Yes — that's the right place."
      },
      midProgressWonder: {
        text: "Look — the symbols are coming together."
      },

      wrongTryAgain: {
        text: "Not there. Try again."
      },

      // Final fireworks: 2-line recap (what you did -> what it means), 700ms gap
      finalYouFoundAll: {
        text: "You found them all and put them together."
      },
      finalNowComplete: {
        text: "Now you know what each symbol can remind you of."
      },
      finalAlwaysWithYou: {
        text: "Now you know what each symbol can remind you of."
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
        text: "Let's meet my family, then make a tree for yours.",
        useWebSpeech: true
      },

      // ========================================
      // GANESHA PHASE - INSTRUCTIONS
      // ========================================
      tapCircle: {
        text: "Tap a circle, then drag each family member to where they belong."
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
        text: "Yes — that's my father."
      },
      correctMother: {
        text: "Yes — that's my mother."
      },
      correctBrother: {
        text: "Yes — that's my brother."
      },
      correctMyself: {
        text: "And that's me!"
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
        text: "Let's find out what I like, then you can choose your favorites."
      }
    },
    'dreams-wishes': {
      opening: {
        text: "I have a few wishes for the world. Will you help me?"
      }
    },
    'my-indian-story': {
      opening: {
        text: "Let's explore some parts of my India story, then you can share yours."
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
