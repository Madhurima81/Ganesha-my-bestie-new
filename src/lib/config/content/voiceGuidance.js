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
        file: '/audio/voicenew/vakratundachant/vakratunda-opening.wav'
      },

      // Vakratunda rounds (after each round completes)
      vakratundaRound1: {
        text: "Round 1 done!",
        file: '/audio/voicenew/vakratundachant/vakratunda-round1.wav'
      },
      vakratundaRound2: {
        text: "Round 2 done!",
        file: '/audio/voicenew/vakratundachant/vakratunda-round2.wav'
      },
      vakratundaRound3: {
        text: "Lotus blooming!",
        file: '/audio/voicenew/vakratundachant/vakratunda-lotus blooming.wav'
      },

      // Vakratunda power reveal
      vakratundaPower: {
        text: "I adapt!",
        file: '/audio/voicenew/vakratundachant/vakratunda- I adapt.wav'
      },

      // Mahakaya game start
      mahakayaGameStart: {
        text: "Mahakaya - start!",
        file: '/audio/voicenew/vakratundachant/vakratunda-mahakaya - start.wav'
      },

      // Mahakaya rounds (after each round completes)
      mahakayaRound1: {
        text: "Mahakaya round 1 done!",
        file: '/audio/voicenew/vakratundachant/vakratunda-mahakaya round1.wav'
      },
      mahakayaRound2: {
        text: "Mahakaya round 2 done!",
        file: '/audio/voicenew/vakratundachant/vakratunda-mahakaya round2.wav'
      },
      mahakayaRound3: {
        text: "Amazing!",
        file: '/audio/voicenew/vakratundachant/vakratunda-mahakaya amazing.wav'
      },

      // Mahakaya power reveal
      mahakayaPower: {
        text: "I am strong!",
        file: '/audio/voicenew/vakratundachant/vakratunda-mahakaya-I am strong.wav'
      },

      // Word celebration (plays when a word is fully learned)
      chantWordReveal: {
        text: "Wonderful!",
        file: '/audio/voicenew/vakratundachant/vakratunda-wonderful.wav'
      },

      // Mahakaya word reveal
      'mahakaya-word-reveal': {
        text: "Mahakaya — strong!",
        file: '/audio/voicenew/vakratundachant/ganesha_mahakaya_strong.wav'
      },

      // Scene complete
      sceneComplete: {
        text: "Scene complete!",
        file: '/audio/voicenew/vakratundachant/vakratunda-scene completion.wav'
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
        file: '/audio/voicenew/modak/ganesha_share_modaks.wav'
      },

      // ========================================
      // PHASE 1: FIND MOOSHIKA
      // ========================================
      findMooshika: {
        text: "Tap the little mound to find Mooshika!",
        file: '/audio/voicenew/modak/ganesha_find_mooshika.wav'
      },
      mooshikaFound: {
        text: "You found Mooshika! He's my little mouse friend. He teaches us about FOCUS!",
        file: '/audio/voicenew/modak/ganesha_found_mooshika.wav'
      },
      focusPower: {
        text: "Your mind is like a little mouse - sometimes it runs around! But YOU can call it back. Say with me: I can focus!",
        file: '/audio/voicenew/modak/ganesha_focus.wav'
      },

      // ========================================
      // PHASE 2: COLLECT MODAKS
      // ========================================
      collectStart: {
        text: "Now help Mooshika collect 3 modaks for me! Tap each golden modak you find!",
        file: '/audio/voicenew/modak/ganesha_collect_three.wav'
      },

      // ========================================
      // PHASE 3: SHARE WITH GANESHA
      // ========================================
      sharingPower: {
        text: "When you share something special, it feels even MORE special! Say with me: I love to share!",
        file: '/audio/voicenew/modak/ganesha_share_joy.wav'
      },
      // Instruction to feed (drag version)
      feedGanesha: {
        text: "Drag the modaks to feed Ganesha!",
        file: '/audio/voicenew/modak/ganesha_bring_modaks.wav'
      },

      // ========================================
      // PHASE 4: SCENE COMPLETE
      // ========================================
      gratitudePower: {
        text: "You helped Mooshika, collected with care, and shared with love. That's GRATITUDE! Say with me: I am grateful!",
        file: '/audio/voicenew/modak/ganesha_safe_inside.wav'
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
        text: "Amazing work, little explorer! You did it! Focus, sweet reward, and sharing — all done! I'm so proud of you!",
        file: '/audio/voicenew/modak/ganesha_proud.wav'
      },
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
        text: "This is my family. They make me who I am.",
        file: '/audio/voicenew/familytree/ganesha_family_intro.wav'
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
        file: '/audio/voicenew/familytree/ganesha_kartikeya_name.wav'
      },
      ganesha: {
        text: "Ganesha",
        file: '/audio/voicenew/familytree/ganesha_name.wav'
      },

      // ========================================
      // GANESHA PHASE - CORRECT PLACEMENT (relationship reveal)
      // ========================================
      correctFather: {
        text: "That's my father!",
        file: '/audio/voicenew/familytree/ganesha_shiva_father.wav'
      },
      correctMother: {
        text: "That's my mother!",
        file: '/audio/voicenew/familytree/ganesha_parvati_mother.wav'
      },
      correctBrother: {
        text: "That's my brother!",
        file: '/audio/voicenew/familytree/ganesha_kartikeya_brother.wav'
      },
      correctMyself: {
        text: "That's me!",
        file: '/audio/voicenew/familytree/ganesha_me.wav'
      },

      // ========================================
      // GANESHA PHASE - FUN FACTS
      // ========================================
      factFather: {
        text: "My father is calm and strong. He protects us and teaches me peace.",
        file: '/audio/voicenew/familytree/ganesha_shiva_fact.wav'
      },
      factMother: {
        text: "My mother is kind and loving. She gives the best hugs and keeps me safe.",
        file: '/audio/voicenew/familytree/ganesha_parvati_fact.wav'
      },
      factBrother: {
        text: "My brother is very brave. He travels the world on his peacock.",
        file: '/audio/voicenew/familytree/ganesha_kartikeya_fact.wav'
      },

      // ========================================
      // GANESHA PHASE - PROGRESS
      // ========================================
      allPlaced: {
        text: "You met my whole family! Families make us feel safe.",
        file: '/audio/voicenew/familytree/ganesha_family_safe.wav'
      },

      // ========================================
      // TRANSITION MODAL
      // ========================================
      transition: {
        text: "Now… let's build your family tree.",
        file: '/audio/voicenew/familytree/ganesha_build_tree.wav'
      },

      // ========================================
      // CHILD PHASE
      // ========================================
      childHint: {
        text: "So many people care about you!",
        file: '/audio/voicenew/familytree/ganesha_people_care.wav'
      },
      childProgressStart: {
        text: "Your tree is growing…",
        file: '/audio/voicenew/familytree/ganesha_tree_growing.wav'
      },
      childProgressMid: {
        text: "Your family fills this space with love.",
        file: '/audio/voicenew/familytree/ganesha_family_love.wav'
      },
      childProgressComplete: {
        text: "Look at your beautiful family tree… So many people care about you.",
        file: '/audio/voicenew/familytree/ganesha_beautiful_tree.wav'
      },

      // ========================================
      // FINAL SCENE
      // ========================================
      sceneComplete: {
        text: "Look at our family trees. Connected by love.",
        file: '/audio/voicenew/familytree/ganesha_connected_love.wav'
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

  // Shloka River zone
  if (zoneId === 'shloka-river') {
    if (script.file.startsWith('/')) return script.file;
    return `/audio/voiceover/INSTRUCTIONS/${script.file}`;
  }

  // Symbol Mountain zone - legacy path
  // If file is already an absolute path (starts with /), use it directly
  if (zoneId === 'symbol-mountain') {
    if (script.file.startsWith('/')) return script.file;
    return `/audio/voice/modak/${script.file}`;
  }

  // About Me Hut zone - family tree
  if (zoneId === 'about-me-hut' && sceneId === 'family-tree') {
    if (script.file.startsWith('/')) return script.file;
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
