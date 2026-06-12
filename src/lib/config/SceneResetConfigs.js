// lib/config/SceneResetConfigs.js
// Scene-specific reset configurations for all 20+ scenes

export const SCENE_RESET_CONFIGS = {
  // ========== SYMBOL MOUNTAIN ZONE (COMPLETE 4/4) ==========
  
  'modak': {
    initialPhase: 'mooshika_search',
    initialFocus: 'mooshika',
    keepSymbols: {},  // First scene, no symbols to keep
    specificResets: {
      // Mound search states
      moundStates: [0, 0, 0, 0, 0],
      correctMound: Math.floor(Math.random() * 5) + 1,
      mooshikaVisible: false,
      mooshikaFound: false,
      mooshikaDragHintShown: false,
      mooshikaLastPosition: { top: '45%', left: '25%' },
      moundsVanished: false,
      moundsVanishing: false,
      
      // Modak collection states  
      modakStates: [0, 0, 0],
      modaksUnlocked: false,
      basketVisible: false,
      basketFull: false,
      collectedModaks: [],
      fedModaks: [],
      
      // Rock/Belly states
      rockVisible: false,
      rockFeedCount: 0,
      rockTransformed: false,
      rockFeedingComplete: false,
      
      // Message flags
      welcomeShown: false,
      mooshikaWisdomShown: false,
      modakWisdomShown: false,
      bellyWisdomShown: false,
      masteryShown: false,
      readyForWisdom: false,
      
      // Animated text states
      showMooshikaText: false,
      showModakText: false,
      showBellyText: false,
      
      // Reload system states
      currentPopup: null,
      showingCompletionScreen: false,
      playAgainRequested: false,
      fireworksCompleted: false,
      fireworksStartTime: 0,
      completionScreenShown: false,
      
      // Symbol discovery states
      symbolDiscoveryState: null,
      sidebarHighlightState: null,
      
      // GameCoach states
      gameCoachState: null,
      isReloadingGameCoach: false,
      lastGameCoachTime: 0
    }
  },

  // Add this to SCENE_RESET_CONFIGS in SceneResetConfigs.js

'pond': {
  initialPhase: 'initial',
  initialFocus: 'lotus',
  keepSymbols: {
    // Scene 2 - keep symbols from modak scene (scene 1)
    mooshika: true,
    modak: true,
    belly: true
  },
  specificResets: {
    // Lotus interaction states
    lotusStates: [0, 0, 0],
    
    // Golden lotus states
    goldenLotusVisible: false,
    goldenLotusBloom: false,
    
    // Elephant states
    elephantVisible: false,
    elephantTransformed: false,
    trunkActive: false,
    
    // Water and visual effects
    waterDrops: [],
    celebrationStars: 0,
    
    // Phase progression
    phase: 'initial',
    currentFocus: 'lotus',
    
    // Symbol discovery - reset pond-specific symbols only
    discoveredSymbols: {
      mooshika: true,    // Keep from previous scene
      modak: true,       // Keep from previous scene  
      belly: true,       // Keep from previous scene
      lotus: false,      // Reset pond scene symbol
      trunk: false,      // Reset pond scene symbol
      golden: false      // Reset pond scene symbol
    },
    
    // Message flags
    welcomeShown: false,
    lotusWisdomShown: false,
    elephantWisdomShown: false,
    masteryShown: false,
    readyForWisdom: false,
    
    // Animated text states (only pond-specific)
    showLotusText: false,
    showTrunkText: false,
    
    // Reload system states
    currentPopup: null,
    showingCompletionScreen: false,
    playAgainRequested: false,
    fireworksCompleted: false,
    fireworksStartTime: 0,
    completionScreenShown: false,
    
    // Symbol discovery states
    symbolDiscoveryState: null,
    sidebarHighlightState: null,
    
    // GameCoach states
    gameCoachState: null,
    isReloadingGameCoach: false,
    lastGameCoachTime: 0,
    
    // Progress tracking
    stars: 0,
    completed: false,
    progress: {
      percentage: 0,
      starsEarned: 0,
      completed: false
    }
  }
},

'symbol': {
  initialPhase: 'eyes_game',
  initialFocus: 'eyes',
  keepSymbols: {
    // Scene 3 - keep symbols from previous scenes (modak + pond)
    mooshika: true,
    modak: true,
    belly: true,
    lotus: true,
    trunk: true
  },
  specificResets: {
    // Game progression
    phase: 'eyes_game',
    activeGame: 'eyes',
    completedGames: [],
    currentFocus: 'eyes',
    
    // Eyes game state
    showEyesTelescopeGame: false,
    eyesGameActive: false,
    eyesGameComplete: false,
    foundInstruments: [],
    discoveredInstruments: {},
    instrumentsFound: 0,
    
    // Ears game state
    earsVisible: false,
    showEarsRhythmGame: false,
    earsGameActive: false,
    earsGameComplete: false,
    musicalNotesVisible: false,
    currentNote: 'note1',
    musicalNoteStates: {
      note1: 'gray',
      note2: 'gray',
      note3: 'gray'
    },
    earsGamePhase: 'waiting',
    earsPlayerInput: [],
    earsCurrentSequence: [],
    earsSequenceItemsShown: 0,
    earsSequenceJustCompleted: false,
    earsReadyForNextNote: false,
    earsLastCompletedNote: null,
    
    // Tusk assembly state
    showTuskAssemblyGame: false,
    tuskGameActive: false,
    tuskPower: 0,
    tuskFullyPowered: false,
    tuskFloating: false,
    ganeshaComplete: false,
    ganeshaAssembling: false,
    showGaneshaOutline: false,
    
    // Symbol discovery - keep previous symbols, reset current scene symbols
    discoveredSymbols: {
      mooshika: true,    // Keep from scene 1
      modak: true,       // Keep from scene 1
      belly: true,       // Keep from scene 1
      lotus: true,       // Keep from scene 2
      trunk: true,       // Keep from scene 2
      eyes: false,       // Reset current scene symbol
      ears: false,       // Reset current scene symbol (alias: ear)
      ear: false,        // Reset current scene symbol
      tusk: false        // Reset current scene symbol
    },
    
    // Message flags
    welcomeShown: false,
    eyesWisdomShown: false,
    earsWisdomShown: false,
    tuskWisdomShown: false,
    readyForWisdom: false,
    
    // Animated text states (only current scene)
    showEyesText: false,
    showEarsText: false,
    showTuskText: false,
    
    // Reload system states
    currentPopup: null,
    showingCompletionScreen: false,
    playAgainRequested: false,
    fireworksCompleted: false,
    fireworksStartTime: 0,
    completionScreenShown: false,
    
    // Symbol discovery states
    symbolDiscoveryState: null,
    sidebarHighlightState: null,
    
    // GameCoach states
    gameCoachState: null,
    isReloadingGameCoach: false,
    lastGameCoachTime: 0,
    
    // Progress tracking
    stars: 0,
    completed: false,
    progress: {
      percentage: 0,
      starsEarned: 0,
      completed: false
    }
  }
},

'final-scene': {
  initialPhase: 'initial',
  initialFocus: 'assembly',
  keepSymbols: {
    // Final scene - keep ALL symbols from all previous scenes
    mooshika: true,
    modak: true,
    belly: true,
    lotus: true,
    trunk: true,
    eyes: true,
    ear: true,    // Sidebar alias
    ears: true,   // Game logic alias
    tusk: true
  },
  specificResets: {
    // Assembly game state - core mechanics
    placedSymbols: {},           // Reset all symbol placements
    ganeshaState: 'stone',       // Reset Ganesha to stone state
    
    // V8: Click-based interaction system
    selectedSymbol: null,        // Clear selected symbol
    highlightedZone: null,       // Clear highlighted drop zone
    placementAnimation: null,    // Clear teleport animation
    
    // Audio/blessing system
    currentBlessing: null,
    blessingsHeard: [],
    finalBlessingShown: false,
    
    // Core game progression
    phase: 'initial',
    currentFocus: 'assembly',
    
    // Symbol discovery - keep all 8 symbols discovered
    discoveredSymbols: {
      mooshika: true,    // Keep from scene 1
      modak: true,       // Keep from scene 1
      belly: true,       // Keep from scene 1
      lotus: true,       // Keep from scene 2
      trunk: true,       // Keep from scene 2
      eyes: true,        // Keep from scene 3
      ear: true,         // Keep from scene 3 (sidebar alias)
      ears: true,        // Keep from scene 3 (game logic alias)
      tusk: true         // Keep from scene 3
    },
    
    // GameCoach message flags
    welcomeShown: false,
    assemblyWisdomShown: false,
    masteryShown: false,
    readyForWisdom: false,
    gameCoachState: null,
    lastGameCoachTime: 0,
    isReloadingGameCoach: false,
    
    // Simplified reload system
    currentPopup: null,
    showingCompletionScreen: false,
    showingZoneCompletion: false,
    celebrationActive: false,    // Track celebration state
    
    // Progress tracking
    stars: 0,
    completed: false,
    progress: {
      percentage: 0,
      starsEarned: 0,
      completed: false
    }
  }
},

    // ========== CAVE OF SECRETS (PLACEHOLDER 0/1+) ==========


  'vakratunda-mahakaya': {
  initialPhase: 'door1_active',
  initialFocus: 'door1', 
  keepSymbols: {}, // Scene 1 - no previous symbols
  specificResets: {
    // Door 1 state (Va-kra-tun-da)
    door1State: 'waiting',
    door1SyllablesPlaced: [],
    door1Completed: false,
    door1CurrentStep: 0,
    door1Syllables: ['Va', 'kra', 'tun', 'da'],

    // Door 2 state (Ma-ha-ka-ya)  
    door2State: 'waiting',
    door2SyllablesPlaced: [],
    door2Completed: false,
    door2CurrentStep: 0,
    door2Syllables: ['Ma', 'ha', 'ka', 'ya'],

    // Game 1: Tracing state
    tracingStarted: false,
    tracedPoints: [],
    traceProgress: 0,
    traceQuality: 'good',
    tracingCompleted: false,
    trunkPosition: { x: 50, y: 100 },
    canResumeTracing: false,

    // Sequential path validation
    currentPathSegment: 0,
    segmentsCompleted: [],
    mustFollowSequence: true,

    // Mini Ganesha states
    ganeshaVisible: false,
    ganeshaAnimation: 'breathing',
    ganeshaSize: 0.8,
    ganeshaGlow: 0.2,

    // Game 2: Growing Ganesha state
    growingStarted: false,
    stonesClicked: 0,
    floatingStones: [
      { id: 1, clicked: false, x: 20, y: 30 },
      { id: 2, clicked: false, x: 70, y: 20 },
      { id: 3, clicked: false, x: 30, y: 60 },
      { id: 4, clicked: false, x: 80, y: 50 }
    ],
    growingCompleted: false,
    
    // Sanskrit learning
    learnedWords: {
      vakratunda: { learned: false, scene: 1 },
      mahakaya: { learned: false, scene: 1 }
    },
    
    // Scene progression  
    //phase: 'door1_active',
    currentFocus: 'door1',
    
    // Discovery and popup states
    discoveredSymbols: {},
    currentPopup: null,
    symbolDiscoveryState: null,
    sidebarHighlightState: null,
    showCurvedText: false,
    showMightyText: false,
    
    // GameCoach states
    gameCoachState: null,
    isReloadingGameCoach: false,
    welcomeShown: false,
    vakratundaWisdomShown: false,
    mahakayaWisdomShown: false,
    readyForWisdom: false,
    lastGameCoachTime: 0,
    tracingIntroShown: false,
    
    // Progress tracking
    stars: 0,
    completed: false,
    progress: {
      percentage: 0,
      starsEarned: 0,
      completed: false
    },
    
    // UI states
    showingCompletionScreen: false,
    fireworksCompleted: false
  }
},

'suryakoti-samaprabha': {
  initialPhase: 'door1_active',
  initialFocus: 'door1',
  keepSymbols: {
    // Scene 2 - keep Scene 1 words but reset Scene 2 words
    vakratunda: { learned: true, scene: 1 },
    mahakaya: { learned: true, scene: 1 }
  },
  specificResets: {
    // ✅ CRITICAL: Add the exact phase constant
    phase: 'door1_active',
    
    // Door 1 state (Su-rya-ko-ti)
    door1State: 'waiting',
    door1SyllablesPlaced: [],
    door1Completed: false,
    door1CurrentStep: 0,
    door1Syllables: ['Su', 'rya', 'ko', 'ti'],

    // Door 2 state (Sa-ma-pra-bha)  
    door2State: 'waiting',
    door2SyllablesPlaced: [],
    door2Completed: false,
    door2CurrentStep: 0,
    door2Syllables: ['Sa', 'ma', 'pra', 'bha'],

    // Game 1: Sun Collection state - COMPLETE RESET
    sunCollectionStarted: false,
    collectedSuns: 0,
    sunCollectionCompleted: false,
    caveIllumination: 0,
    orbSuns: [],

    // Game 2: Healing Touch state - COMPLETE RESET
    healingStarted: false,
    healedChildren: [],
    availableSuns: [],
    healingCompleted: false,
    childStates: [
      { id: 1, healed: false },
      { id: 2, healed: false },
      { id: 3, healed: false }
    ],
    
    // Sanskrit learning - SCENE 2 SPECIFIC
    // Keep Scene 1 words learned, reset Scene 2 words
    learnedWords: {
      vakratunda: { learned: true, scene: 1 },
      mahakaya: { learned: true, scene: 1 },
      suryakoti: { learned: false, scene: 2 },
      samaprabha: { learned: false, scene: 2 } 
    },
    
    // Animated text states - RESET
    showSuryakotiText: false,
    showSamaprabhaText: false,
    
    // Scene progression - RESET TO START
    currentFocus: 'door1',
    
    // Discovery and popup states - COMPLETE RESET
    discoveredSymbols: {},
    currentPopup: null,
    symbolDiscoveryState: null,
    sidebarHighlightState: null,
    
    // GameCoach states - COMPLETE RESET
    gameCoachState: null,
    isReloadingGameCoach: false,
    welcomeShown: false,
    suryakotiWisdomShown: false,
    samaprabhaWisdomShown: false,
    readyForWisdom: false,
    lastGameCoachTime: 0,
    sunCollectionIntroShown: false,
    healingIntroShown: false,
    
    // Progress tracking - COMPLETE RESET
    stars: 0,
    completed: false,
    progress: {
      percentage: 0,
      starsEarned: 0,
      completed: false
    },
    
    // UI states - COMPLETE RESET
    showingCompletionScreen: false,
    fireworksCompleted: false,
    fireworksStartTime: 0,
    completionScreenShown: false,
    playAgainRequested: false
  }
},

'nirvighnam-kurumedeva': {
  initialPhase: 'door1_active',
  initialFocus: 'door1',
  keepSymbols: {
    // Scene 3 - keep learned words from previous Cave scenes (1 & 2)
    vakratunda: { learned: true, scene: 1 },
    mahakaya: { learned: true, scene: 1 },
    suryakoti: { learned: true, scene: 2 },
    samaprabha: { learned: true, scene: 2 }
  },
  specificResets: {
    // Phase constant (critical for Cave scenes)
    phase: 'door1_active',
    
    // Door 1 state (Nir-vigh-nam)
    door1State: 'waiting',
    door1SyllablesPlaced: [],
    door1Completed: false,
    door1CurrentStep: 0,
    door1Syllables: ['Nir', 'vigh', 'nam'],

    // Door 2 state (Ku-ru-me-de-va)
    door2State: 'waiting',
    door2SyllablesPlaced: [],
    door2Completed: false,
    door2CurrentStep: 0,
    door2Syllables: ['Ku', 'ru', 'me', 'de', 'va'],

    // Game 1: Crystal Fog Clearing state - COMPLETE RESET
    crystalFogStarted: false,
    selectedCrystal: null,
    clearedFogs: [],
    collectedRocks: [],
    crystalFogCompleted: false,
    emotionalProgress: 0,

    // Game 2: Bridge Building state - COMPLETE RESET
    bridgeBuildingStarted: false,
    bridgeRocks: [],
    bridgeStability: 0,
    bridgeCompleted: false,
    ganeshaCanCross: false,
    
    // Sanskrit learning - SCENE 3 SPECIFIC
    // Keep previous scenes learned, reset Scene 3 words
    learnedWords: {
      vakratunda: { learned: true, scene: 1 },
      mahakaya: { learned: true, scene: 1 },
      suryakoti: { learned: true, scene: 2 },
      samaprabha: { learned: true, scene: 2 },
      nirvighnam: { learned: false, scene: 3 },
      kurumedeva: { learned: false, scene: 3 }
    },
    
    // Animated text states - RESET (scene 3 specific)
    showObstacleText: false,     // "Without Obstacles" after crystal fog
    showDivineHelpText: false,   // "Divine Help" after bridge building
    
    // Scene progression - RESET TO START
    currentFocus: 'door1',
    
    // Discovery and popup states - COMPLETE RESET
    discoveredSymbols: {},
    currentPopup: null,
    symbolDiscoveryState: null,
    sidebarHighlightState: null,
    
    // GameCoach states - COMPLETE RESET
    gameCoachState: null,
    isReloadingGameCoach: false,
    welcomeShown: false,
    nirvighnamWisdomShown: false,
    kurumedevaWisdomShown: false,
    readyForWisdom: false,
    lastGameCoachTime: 0,
    crystalFogIntroShown: false,
    bridgeBuildingIntroShown: false,
    
    // Progress tracking - COMPLETE RESET
    stars: 0,
    completed: false,
    progress: {
      percentage: 0,
      starsEarned: 0,
      completed: false
    },
    
    // UI states - COMPLETE RESET
    showingCompletionScreen: false,
    fireworksCompleted: false
  }
},

'sarvakaryeshu-sarvada': {
  initialPhase: 'door1_active', 
  initialFocus: 'door1',
  keepSymbols: {
    // Scene 4 (Final Cave scene) - keep learned words from all previous Cave scenes (1, 2, 3)
    vakratunda: { learned: true, scene: 1 },
    mahakaya: { learned: true, scene: 1 },
    suryakoti: { learned: true, scene: 2 },
    samaprabha: { learned: true, scene: 2 },
    nirvighnam: { learned: true, scene: 3 },
    kurumedeva: { learned: true, scene: 3 }
  },
  specificResets: {
    // Phase constant (critical for Cave scenes)
    phase: 'door1_active',
    
    // Door 1 state (Sar-va-kar-ye-shu)
    door1State: 'waiting',
    door1SyllablesPlaced: [],
    door1Completed: false,
    door1CurrentStep: 0,
    door1Syllables: ['Sar', 'va', 'kar', 'ye', 'shu'],

    // Door 2 state (Sar-va-da)
    door2State: 'waiting',
    door2SyllablesPlaced: [],
    door2Completed: false,
    door2CurrentStep: 0,
    door2Syllables: ['Sar', 'va', 'da'],
    
    // Character selection - RESET
    selectedCharacter: null,
    characterSelected: false,
    helperBadgeVisible: false,
    
    // Game progression - COMPLETE RESET
    currentGame: 1,
    currentScenario: 0,
    selectedScenarios: [],
    scenarioPhase: 'uncertainty',
    symbolsVisible: 'faint',
    symbolsRevealed: 'initial',
    wiseChoicesMade: [],
    unwiseChoicesTried: [],
    symbolsClickable: false,
    sceneClarity: 'uncertain',
    ganeshaClicked: false,
    game1Completed: false,
    currentBackground: 'worried',
    scenariosCompleted: 0,

    // Game 2 state - COMPLETE RESET
    game2Scenarios: [],
    currentGame2Scenario: 0,
    game2ScenariosCompleted: 0,
    selectedHelperSymbol: null,
    helperPopupVisible: false,
    helperAnimationActive: false,
    game2Background: 'before',
    helperSymbolsGenerated: [],
    game2Completed: false,
    showHelperOnScreen: false,
    helperScreenPosition: { x: 25, y: 30 },
    helperImageData: null,
    helperReadyToSend: false,
    isCompletingScenario: false,

    // Character interaction states - RESET
    characterMessage: null,
    characterMessageType: null,
    showProblemDeclaration: false,
    problemDeclarationShown: false,
    sceneInstructionText: null,

    // Ganesha blessing states - RESET  
    ganeshaEmerged: false,
    ganeshaBlessing: false,
    ganeshaBlessingMessage: null,

    // Symbol selection states - RESET
    selectedSymbol: null,        
    selectedSymbolData: null,    
    sceneClickable: false,
    
    // Sanskrit learning - SCENE 4 SPECIFIC
    // Keep previous scenes learned, reset Scene 4 words
    learnedWords: {
      vakratunda: { learned: true, scene: 1 },
      mahakaya: { learned: true, scene: 1 },
      suryakoti: { learned: true, scene: 2 },
      samaprabha: { learned: true, scene: 2 },
      nirvighnam: { learned: true, scene: 3 },
      kurumedeva: { learned: true, scene: 3 },
      sarvakaryeshu: { learned: false, scene: 4 },
      sarvada: { learned: false, scene: 4 }
    },
    
    // Animated text states - RESET (scene 4 specific)
    showInAllTasksText: false,  
    showAlwaysText: false,      
    showGoldenHelperText: false,
    
    // Scene progression - RESET TO START
    currentFocus: 'door1',
    
    // Discovery and popup states - COMPLETE RESET
    discoveredSymbols: {},
    currentPopup: null,
    symbolDiscoveryState: null,
    sidebarHighlightState: null,
    
    // GameCoach states - COMPLETE RESET
    gameCoachState: null,
    isReloadingGameCoach: false,
    welcomeShown: false,
    sarvakaryeshuWisdomShown: false,
    sarvadaWisdomShown: false,
    readyForWisdom: false,
    lastGameCoachTime: 0,
    
    // Progress tracking - COMPLETE RESET
    stars: 0,
    completed: false,
    progress: {
      percentage: 0,
      starsEarned: 0,
      completed: false
    },
    
    // UI states - COMPLETE RESET
    showingCompletionScreen: false,
    fireworksCompleted: false,
    fireworksStartTime: 0,
    completionScreenShown: false
  }
},
  
  // ========== SHLOKA RIVER ZONE (PLACEHOLDER 0/1+) ==========
  
'vakratunda-grove': {
  initialPhase: 'initial',
  initialFocus: 'welcome',
  memoryGameType: 'simplified', // Triggers memory game reset in useSceneReset
  keepSymbols: {},
  specificResets: {
    // Core learning progress - COMPLETE RESET
    learnedSyllables: {
      va: false, kra: false, tun: false, da: false,
      ma: false, ha: false, ka: false, ya: false
    },
    learnedWords: {
      vakratunda: false,
      mahakaya: false
    },
    
    // Memory game state - CRITICAL for reload support
    memoryGameState: null,
    
    // Phase system
    phase: 'initial',
    
    // UI States - ALL reset to initial
    showGaneshaBlessing: false,
    blessingPhase: 'welcome',
    currentPracticeWord: '',
    showChoiceButtons: false,
    showAudioPractice: false,
    showParticles: false,
    showPulseRings: false,
    showCenteredApp: null,
    unlockedApps: [],
    vakratundaPowerGained: false,
    blessingWord: '',
    showRescueMission: false,
    rescuePhase: 'problem',
    currentRescueWord: '',
    
    // Recording states
    showRecording: false,
    currentRecordingWord: '',
    showAudioTracker: true,
    
    // Message flags
    welcomeShown: false,
    vakratundaWisdomShown: false,
    mahakayaWisdomShown: false,
    
    // System state
    currentPopup: null,
    showingCompletionScreen: false,
    gameCoachState: null,
    isReloadingGameCoach: false,
    
    // Progress
    stars: 0,
    completed: false,
    progress: { percentage: 0, starsEarned: 0, completed: false }
  }
},

'nirvighnam-chant': {
  initialPhase: 'initial',
  initialFocus: 'welcome',
  keepSymbols: {},
  specificResets: {
    phase: 'initial',
    learnedWords: {
      nirvighnam: false,
      kurumedeva: false
    },
    chantedVerses: {},
    learnedSyllables: {
      nir: false,
      vigh: false,
      nam: false,
      kuru: false,
      me: false,
      de: false,
      va: false
    },
    unlockedApps: {},
    welcomeShown: false,
    currentPopup: null,
    showingCompletionScreen: false,
    stars: 0,
    completed: false,
    progress: {
      percentage: 0,
      starsEarned: 0,
      completed: false
    },
    nirvighnamGameState: null,
    kurumedevaGameState: null
  }
},

'suryakoti-bank': {
  initialPhase: 'initial',
  initialFocus: 'welcome',
  memoryGameType: 'simplifiedCombined', // CHANGE FROM 'simplified' TO 'simplifiedCombined'
  keepSymbols: {},
  specificResets: {
    // Core learning progress - COMPLETE RESET
    learnedSyllables: {
      sur: false, ya: false, ko: false, ti: false,
      sa: false, ma: false, pra: false, bha: false
    },
    learnedWords: {
      suryakoti: false,
      samaprabha: false
    },
    
    // Memory game state - CRITICAL for reload support
    memoryGameState: null,
    
    // Phase system
    phase: 'initial',
    
    // UI States - ALL reset to initial
    showGaneshaBlessing: false,
    blessingPhase: 'welcome',
    currentPracticeWord: '',
    showChoiceButtons: false,
    showAudioPractice: false,
    showParticles: false,
    showPulseRings: false,
    showCenteredApp: null,
    unlockedApps: [],
    suryakotiPowerGained: false,
    blessingWord: '',
    showRescueMission: false,
    rescuePhase: 'problem',
    currentRescueWord: '',
    
    // Recording states
    showRecording: false,
    currentRecordingWord: '',
    showAudioTracker: true,
    
    // Mission state (if you're using this structure)
    missionState: {
      rescuePhase: 'problem',
      showParticles: false,
      word: null,
      missionJustCompleted: false
    },
    
    // Message flags
    welcomeShown: false,
    suryakotiWisdomShown: false,
    samaprabhaWisdomShown: false,
    
    // System state
    currentPopup: null,
    showingCompletionScreen: false,
    gameCoachState: null,
    isReloadingGameCoach: false,
    
    // Progress
    stars: 0,
    completed: false,
    progress: { percentage: 0, starsEarned: 0, completed: false }
  }
},
  
  // Add more scenes here with commas between them
  
}; // <- This closes the SCENE_RESET_CONFIGS object

// Helper function to get reset config for a scene
export const getSceneResetConfig = (sceneId) => {
  return SCENE_RESET_CONFIGS[sceneId] || {
    initialPhase: 'initial',
    initialFocus: 'start',
    specificResets: {}
  };
};

// Progress tracking: 2 scenes complete out of 20+ total scenes
