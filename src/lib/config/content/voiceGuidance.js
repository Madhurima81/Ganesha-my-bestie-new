// Voice Guidance - Modak Scene Only (MVP)
// Audio scripts for Ganesha's voice prompts
// Replaces header, help menu, and text instructions

export const VOICE_SCRIPTS = {
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

// Get audio path for voice files (in voice/modak/ folder)
export const getAudioPath = (zoneId, sceneId, key) => {
  const script = getVoiceScript(zoneId, sceneId, key);
  return script ? `/audio/voice/modak/${script.file}` : null;
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
    'findMooshika': 'hintMound',
    'collectModaks': 'hintModak',
    'shareWithGanesha': 'shareTap'
  };
  return hintMap[phase] || 'hintExplore';
};

// Get random encouragement
export const getRandomEncouragement = () => {
  const encouragements = ['encourage1', 'encourage2', 'encourage3'];
  return encouragements[Math.floor(Math.random() * encouragements.length)];
};
