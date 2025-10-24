// zones/shloka-river/scenes/Scene1/components/SanskritMemoryGame.jsx
// Document 2 game logic with Document 1's minimal UI approach

import React, { useState, useEffect, useRef } from 'react';

// Sanskrit syllable sequences for each phase and round
const SYLLABLE_SEQUENCES = {
  vakratunda: {
    1: ['va', 'kra'],
    2: ['va', 'kra', 'tun'],
    3: ['va', 'kra', 'tun', 'da']
  },
  mahakaya: {
    1: ['ma', 'ha'],
    2: ['ma', 'ha', 'ka'], 
    3: ['ma', 'ha', 'ka', 'ya']
  }
};

const ELEMENT_DATA = {
  vakratunda: {
    singers: ['lotus-va', 'lotus-kra', 'lotus-tun', 'lotus-da'],
    clickers: ['baby-elephant-va', 'baby-elephant-kra', 'baby-elephant-tun', 'baby-elephant-da'],
    positions: {
      singers: [
        { left: '25%', top: '45%' },
        { left: '35%', top: '55%' },
        { left: '45%', top: '60%' },
        { left: '55%', top: '70%' }
      ],
      clickers: [
        { left: '18%', top: '65%' },
        { left: '38%', top: '35%' },
        { left: '58%', top: '30%' },
        { left: '68%', top: '68%' }
      ]
    }
  },
  mahakaya: {
    singers: ['stone-ma', 'stone-ha', 'stone-ka', 'stone-ya'],
    clickers: ['adult-elephant-ma', 'adult-elephant-ha', 'adult-elephant-ka', 'adult-elephant-ya'],
    positions: {
      singers: [
        { left: '20%', top: '60%' },
        { left: '40%', top: '65%' },
        { left: '60%', top: '58%' },
        { left: '80%', top: '62%' }
      ],
      clickers: [
        { left: '12%', top: '70%' },
        { left: '32%', top: '75%' },
        { left: '52%', top: '72%' },
        { left: '72%', top: '78%' }
      ]
    }
  }
};

const SanskritMemoryGame = ({
  isActive = false,
  hideElements = false,
  powerGained = false,
  onPhaseComplete,
  onGameComplete,
  profileName = 'little explorer',
  
  // Water spray component prop
  WaterSprayComponent,
  
  // Reload support props
  isReload = false,
  initialGamePhase = 'waiting',
  initialCurrentPhase = 'vakratunda',
  initialCurrentRound = 1,
  initialPlayerInput = [],
  initialCurrentSequence = [],
  initialSequenceItemsShown = 0,
  initialPermanentlyBloomed = {},
  initialPermanentlyActivatedElephants = {}, // Added from Doc 1
  initialComboStreak = 0,
  initialMistakeCount = 0,
  phaseJustCompleted = false,
  lastCompletedPhase = null,
  gameJustCompleted = false,
  initialIsCountingDown = false,
  initialCountdown = 0,
  forcePhase = null,
  
  // Assets - passed from parent component
  getLotusImage,
  getStoneImage, 
  getBabyElephantImage,
  getAdultElephantImage,
  
  // Audio functions
  isAudioOn,
  playAudio,
  
  // Callback to save state for reload support
  onSaveGameState,
  
  // Callback for cleanup on component hide/unmount
  onCleanup

}) => {
  console.log('🎮 Minimal Sanskrit Game render:', { 
    isActive, 
    hideElements,
    isReload,
    initialCurrentPhase,
    initialCurrentRound,
    powerGained,
    phaseJustCompleted,
    gameJustCompleted
  });

  // Core game state
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentPhase, setCurrentPhase] = useState('vakratunda');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [canPlayerClick, setCanPlayerClick] = useState(false);
  const [singingSyllable, setSingingSyllable] = useState(null);
  const [sequenceItemsShown, setSequenceItemsShown] = useState(0);

  // Enhanced state for automatic flow and animations
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [roundTransition, setRoundTransition] = useState(false);
  const [elephantMoods, setElephantMoods] = useState({});
  const [lotusGlow, setLotusGlow] = useState({});
  const [mistakeCount, setMistakeCount] = useState(0);
  const [comboStreak, setComboStreak] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const [hasGameStarted, setHasGameStarted] = useState(false);

  // Water spray state
  const [activeWaterSpray, setActiveWaterSpray] = useState(null);
  const [permanentlyBloomed, setPermanentlyBloomed] = useState({});

  // ADDED FROM DOC 1: Permanent activation system
  const [permanentlyActivatedElephants, setPermanentlyActivatedElephants] = useState({});
  const [currentRoundClicks, setCurrentRoundClicks] = useState({});
  const [activeSparkles, setActiveSparkles] = useState({});
  const elementsRef = useRef({});

  // Refs for better cleanup and state management
  const timeoutsRef = useRef([]);
  const intervalsRef = useRef([]);
  const isComponentMountedRef = useRef(true);
  const currentStateRef = useRef(null);

  // Safe timeout function with component mount check
  const safeSetTimeout = (callback, delay) => {
    const timeout = setTimeout(() => {
      if (isComponentMountedRef.current) {
        callback();
      }
    }, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  // Safe interval function with component mount check
  const safeSetInterval = (callback, delay) => {
    const interval = setInterval(() => {
      if (isComponentMountedRef.current) {
        callback();
      }
    }, delay);
    intervalsRef.current.push(interval);
    return interval;
  };

  // Clear all timeouts and intervals
  const clearAllTimers = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    intervalsRef.current.forEach(interval => clearInterval(interval));
    timeoutsRef.current = [];
    intervalsRef.current = [];
  };

  // Cleanup on unmount/hide with callback
  useEffect(() => {
    isComponentMountedRef.current = true;
    
    return () => {
      console.log('🧹 SanskritMemoryGame: Component unmounting - cleaning up');
      isComponentMountedRef.current = false;
      clearAllTimers();
      
      // Cleanup global references
      if (window.sanskritMemoryGame) {
        window.sanskritMemoryGame.isReady = false;
        delete window.sanskritMemoryGame.startMahakayaPhase;
        delete window.sanskritMemoryGame.clearCompletionState;
      }
      
      // Call cleanup callback if provided
      if (onCleanup) {
        onCleanup();
      }
    };
  }, []);

  // Cleanup when component becomes inactive
  useEffect(() => {
    if (!isActive) {
      console.log('🛑 SanskritMemoryGame: Component deactivated - clearing timers');
      clearAllTimers();
      setIsCountingDown(false);
      setIsSequencePlaying(false);
      
      if (window.sanskritMemoryGame) {
        window.sanskritMemoryGame.isReady = false;
      }
    } else {
      if (window.sanskritMemoryGame) {
        window.sanskritMemoryGame.isReady = true;
      }
    }
  }, [isActive]);

  // Save state for reload support
  const saveGameState = (additionalState = {}) => {
    const currentState = {
      gamePhase,
      currentPhase,
      currentRound,
      playerInput,
      currentSequence,
      sequenceItemsShown,
      permanentlyBloomed,
      permanentlyActivatedElephants, // Added from Doc 1
      comboStreak,
      mistakeCount,
      hasGameStarted,
      isCountingDown,
      countdown,
      timestamp: Date.now(),
      ...additionalState
    };
    
    // Update ref for quick access
    currentStateRef.current = currentState;
    
    if (onSaveGameState) {
      onSaveGameState(currentState);
    }
  };

  // Register element positions for water spray targeting
  const registerElementPosition = (id, element) => {
    if (element && isComponentMountedRef.current) {
      const rect = element.getBoundingClientRect();
      const container = element.closest('.vakratunda-grove-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        
        elementsRef.current[id] = {
          left: ((rect.left - containerRect.left + rect.width / 2) / containerRect.width * 100) + '%',
          top: ((rect.top - containerRect.top + rect.height / 2) / containerRect.height * 100) + '%'
        };
      }
    }
  };

  // Audio playback functions - UPDATED FOR REUSABILITY
  const playSyllableAudio = (syllable) => {
    if (!isAudioOn) return;
    
    try {
      console.log(`🔊 Playing syllable: ${syllable}`);
      
      const syllableFileMap = {
        'va': 'vakratunda-va',
        'kra': 'vakratunda-kra', 
        'tun': 'vakratunda-tun',
        'da': 'vakratunda-da',
        'ma': 'mahakaya-ma',
        'ha': 'mahakaya-ha',
        'ka': 'mahakaya-ka',
        'ya': 'mahakaya-ya'
      };
      
      const fileName = syllableFileMap[syllable];
      if (!fileName) {
        console.log(`No file mapping found for syllable: ${syllable}`);
        return;
      }
      
      const playbackRate = Math.max(0.7, 1 - (mistakeCount * 0.1));
      playAudio(`/audio/syllables/${fileName}.mp3`, playbackRate);
      
    } catch (error) {
      console.log('Audio not available:', error);
    }
  };

  const playCompleteWord = (word) => {
    if (!isAudioOn) return;
    
    try {
      const wordFileMap = {
        'vakratunda': 'Vakratunda',
        'mahakaya': 'Mahakaya'
      };
      
      const fileName = wordFileMap[word];
      if (!fileName) {
        console.log(`No file mapping found for word: ${word}`);
        return;
      }
      
      playAudio(`/audio/words/${fileName}.mp3`, 0.9);
    } catch (error) {
      console.log('Word audio not available:', error);
    }
  };

  // Get sequence for current phase and round
  const getSequenceForRound = (phase, round) => {
    return SYLLABLE_SEQUENCES[phase][round] || [];
  };

  // Reset clicking state at start of each round - UPDATED FROM DOC 1
  const startNewRound = (roundNumber) => {
    const sequence = getSequenceForRound(currentPhase, roundNumber);
    setCurrentRound(roundNumber);
    setCurrentSequence(sequence);
    setPlayerInput([]);
    setCurrentRoundClicks({}); // Reset current round clicks but keep permanent
    setGamePhase('waiting');
    setCanPlayerClick(false);
    setSequenceItemsShown(0);
    
    console.log(`🌟 Starting ${currentPhase} Round ${roundNumber} with sequence:`, sequence);
    console.log('🔄 Click state reset - all elephants clickable again');
    
    saveGameState({
      currentRound: roundNumber,
      currentSequence: sequence,
      gamePhase: 'waiting',
      playerInput: []
    });
  };

  const startCountdownToSequence = () => {
    if (!isComponentMountedRef.current) return;
    
    console.log('⏱️ Starting automatic countdown to sequence');
    setIsCountingDown(true);
    setCountdown(3);
    
    saveGameState({ isCountingDown: true, countdown: 3 });
    
    const countdownInterval = safeSetInterval(() => {
      setCountdown(prev => {
        const newCount = prev - 1;
        saveGameState({ isCountingDown: newCount > 0, countdown: newCount });
        
        if (newCount <= 0) {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          if (isComponentMountedRef.current) {
            handlePlaySequence();
          }
          return 0;
        }
        return newCount;
      });
    }, 800);
  };

  // UPDATED FROM DOC 1: Dynamic elephant moods with permanent activation priority
  const updateElephantMoods = () => {
    if (!isComponentMountedRef.current) return;
    
    const moods = {};
    currentSequence.forEach((syllable, index) => {
      const elephantId = `elephant-${syllable}`;
      
      // PRIORITY SYSTEM FROM DOC 1: Permanent state overrides everything
      if (permanentlyActivatedElephants[elephantId]) {
        moods[syllable] = 'permanently_activated';
      } else if (currentRoundClicks[elephantId]) {
        moods[syllable] = 'activated';
      } else if (gamePhase === 'listening' && playerInput.length === index) {
        moods[syllable] = 'ready';
      } else if (gamePhase === 'celebration') {
        moods[syllable] = 'celebrating';
      } else if (isCountingDown) {
        moods[syllable] = 'ready';
      } else {
        moods[syllable] = 'dim';
      }
    });
    setElephantMoods(moods);
  };

  // Progressive lotus/stone glow effects
  const updateLotusGlow = () => {
    if (!isComponentMountedRef.current) return;
    
    const glowStates = {};
    currentSequence.forEach((syllable, index) => {
      const targetId = `${currentPhase === 'vakratunda' ? 'lotus' : 'stone'}-${syllable}`;
      
      if (permanentlyBloomed[targetId]) {
        glowStates[syllable] = 'bloomed';
      } else if (gamePhase === 'celebration') {
        glowStates[syllable] = 'victory';
      } else if (index < playerInput.length) {
        glowStates[syllable] = playerInput[index] === syllable ? 'success' : 'error';
      } else if (gamePhase === 'playing' && singingSyllable === syllable) {
        glowStates[syllable] = 'singing';
      } else {
        glowStates[syllable] = 'dormant';
      }
    });
    setLotusGlow(glowStates);
  };

  // Update animations based on game state
  useEffect(() => {
    updateElephantMoods();
    updateLotusGlow();
  }, [gamePhase, playerInput, sequenceItemsShown, singingSyllable, isCountingDown, permanentlyBloomed, currentRoundClicks, permanentlyActivatedElephants]);

  // Initialize game when activated or on reload
  useEffect(() => {
    if (!isActive) return;

    if (isReload && (initialCurrentSequence.length > 0 || forcePhase)) {      
      console.log('🔄 RELOAD: Restoring Sanskrit game state');
            
      // Restore all state
      setCurrentPhase(initialCurrentPhase);
      setCurrentRound(initialCurrentRound);
      setCurrentSequence(initialCurrentSequence);
      setPlayerInput(initialPlayerInput);
      setGamePhase(initialGamePhase);
      setPermanentlyBloomed(initialPermanentlyBloomed || {});
      setPermanentlyActivatedElephants(initialPermanentlyActivatedElephants || {}); // Added from Doc 1
      setComboStreak(initialComboStreak || 0);
      setMistakeCount(initialMistakeCount || 0);
      setHasGameStarted(true);
      setIsCountingDown(initialIsCountingDown);
      setCountdown(initialCountdown);

      // Restore current round click state
      const clickState = {};
      initialPlayerInput.forEach(syllable => {
        clickState[`elephant-${syllable}`] = true;
      });
      setCurrentRoundClicks(clickState);

      // Handle celebration phase reload
      if (initialGamePhase === 'celebration') {
        console.log('🎉 RELOAD: Was celebrating - resuming auto-continuation');
        setGamePhase('celebration');
        setCanPlayerClick(false);
        
        safeSetTimeout(() => {
          if (!isComponentMountedRef.current) return;
          
          if (initialCurrentRound < 3) {
            console.log(`➡️ AUTO-RESUME: Continuing to round ${initialCurrentRound + 1} of ${initialCurrentPhase}`);
            
            setRoundTransition(true);
            
            safeSetTimeout(() => {
              if (!isComponentMountedRef.current) return;
              
              startNewRound(initialCurrentRound + 1);
              setRoundTransition(false);
            }, 1500);
            
          } else {
            console.log('🏆 AUTO-RESUME: Completing phase after reload');
            handlePhaseComplete(initialCurrentPhase);
          }
        }, 2000);
        
      } else {
        setGamePhase(initialGamePhase);
        setCanPlayerClick(initialGamePhase === 'listening');
      }

      if (initialIsCountingDown && initialCountdown > 0) {
        console.log('🔄 RELOAD: Restarting countdown from', initialCountdown);
        
        const countdownInterval = safeSetInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              setIsCountingDown(false);
              if (isComponentMountedRef.current) {
                handlePlaySequence();
              }
              return 0;
            }
            return prev - 1;
          });
        }, 800);
      }
      
      if (gameJustCompleted) {
        console.log('🎉 Game just completed during reload - calling onGameComplete');
        safeSetTimeout(() => {
          if (onGameComplete) {
            onGameComplete();
          }
        }, 1000);
      } else if (phaseJustCompleted && lastCompletedPhase) {
        console.log('✅ Phase just completed during reload - auto-continuing');
        safeSetTimeout(() => {
          handlePhaseComplete(lastCompletedPhase);
        }, 1000);
      }
      
    } else {
      console.log('🆕 NEW GAME: Starting Vakratunda phase immediately');
      const sequence = getSequenceForRound('vakratunda', 1);
      setCurrentPhase('vakratunda');
      setCurrentRound(1);
      setCurrentSequence(sequence);
      setHasGameStarted(true);
      setPermanentlyBloomed({});
      setPermanentlyActivatedElephants({}); // Added from Doc 1
      setComboStreak(0);
      setMistakeCount(0);
      
      saveGameState({
        gamePhase: 'waiting',
        currentPhase: 'vakratunda',
        currentRound: 1,
        currentSequence: sequence,
        playerInput: [],
        sequenceItemsShown: 0,
        permanentlyBloomed: {},
        permanentlyActivatedElephants: {}, // Added from Doc 1
        comboStreak: 0,
        mistakeCount: 0,
        hasGameStarted: true
      });
    }
  }, [isActive, isReload, forcePhase]);

  // Auto-start logic
  useEffect(() => {
    if (!isActive || !isComponentMountedRef.current) return;
    
    if (gamePhase === 'waiting' && currentSequence.length > 0 && !isCountingDown) {
      if (!hasGameStarted && !isReload) {
        console.log('🎮 FIRST TIME: Auto-starting for new game');
        safeSetTimeout(() => {
          if (isComponentMountedRef.current) {
            startCountdownToSequence();
          }
        }, 1200);
      } else if (hasGameStarted) {
        console.log('🔄 AUTO-FLOW: Starting countdown automatically for subsequent round');
        safeSetTimeout(() => {
          if (isComponentMountedRef.current) {
            startCountdownToSequence();
          }
        }, 1200);
      }
    }
  }, [gamePhase, isActive, currentSequence, isCountingDown, hasGameStarted, isReload]);

  // Mahakaya phase starter
  const startMahakayaPhase = () => {
    if (!isComponentMountedRef.current) return;
    
    console.log('🐘 Starting Mahakaya phase - direct game start');
    
    const nextSequence = getSequenceForRound('mahakaya', 1);
    
    clearAllTimers();
    
    setCurrentPhase('mahakaya');
    setCurrentRound(1);
    setCurrentSequence(nextSequence);
    setPlayerInput([]);
    setGamePhase('waiting');
    setCanPlayerClick(false);
    setSequenceItemsShown(0);
    setComboStreak(0);
    setPermanentlyBloomed({});
    setPermanentlyActivatedElephants({}); // Reset for new phase
    
    saveGameState({
      currentPhase: 'mahakaya',
      currentRound: 1,
      currentSequence: nextSequence,
      gamePhase: 'waiting',
      playerInput: [],
      permanentlyActivatedElephants: {}, // Reset for new phase
      phaseJustCompleted: false
    });
  };

  // Global function exposure
  useEffect(() => {
    if (!isActive) return;
    
    if (!window.sanskritMemoryGame) {
      window.sanskritMemoryGame = {};
    }
    
    window.sanskritMemoryGame.startMahakayaPhase = startMahakayaPhase;
    window.sanskritMemoryGame.isReady = true;
    window.sanskritMemoryGame.clearCompletionState = () => {
      if (isComponentMountedRef.current) {
        setGamePhase('waiting');
        setSequenceItemsShown(0);
        console.log('🧹 Memory game completion state cleared');
      }
    };
    
    console.log('🌐 SanskritMemoryGame: Global functions exposed and ready flag set');
    
    return () => {
      if (window.sanskritMemoryGame) {
        window.sanskritMemoryGame.isReady = false;
        delete window.sanskritMemoryGame.startMahakayaPhase;
        delete window.sanskritMemoryGame.clearCompletionState;
        console.log('🧹 SanskritMemoryGame: Global functions cleaned up');
      }
    };
  }, [isActive]);

  // Play the syllable sequence
  const handlePlaySequence = async () => {
    if (isSequencePlaying || currentSequence.length === 0 || !isComponentMountedRef.current) return;

    console.log('🎵 Playing syllable sequence:', currentSequence);
    setIsSequencePlaying(true);
    setGamePhase('playing');
    setCanPlayerClick(false);
    setPlayerInput([]);
    setSequenceItemsShown(0);
    setSingingSyllable(null);
    
    saveGameState({ gamePhase: 'playing' });
    
    currentSequence.forEach((syllable, index) => {
      safeSetTimeout(() => {
        if (!isComponentMountedRef.current) return;
        
        console.log(`🔊 Playing syllable ${index + 1}/${currentSequence.length}: ${syllable}`);
        
        setSequenceItemsShown(index + 1);
        setSingingSyllable(syllable);
        playSyllableAudio(syllable);
        
        safeSetTimeout(() => {
          if (isComponentMountedRef.current) {
            setSingingSyllable(null);
          }
        }, 600);
        
        if (index === currentSequence.length - 1) {
          safeSetTimeout(() => {
            if (isComponentMountedRef.current) {
              setIsSequencePlaying(false);
              setGamePhase('listening');
              setCanPlayerClick(true);
              saveGameState({ gamePhase: 'listening' });
              console.log('👂 Sequence complete, player can now click elephants');
            }
          }, 800);
        }
      }, index * 1200);
    });
  };

  // Trigger water spray effect on correct click
  const triggerWaterSpray = (syllableIndex) => {
    if (!WaterSprayComponent || !isComponentMountedRef.current) return;
    
    const syllable = currentSequence[syllableIndex];
    const sourceId = `${currentPhase === 'vakratunda' ? 'baby' : 'adult'}-elephant-${syllable}`;
    const targetId = `${currentPhase === 'vakratunda' ? 'lotus' : 'stone'}-${syllable}`;
    
    const sourcePos = elementsRef.current[sourceId];
    const targetPos = elementsRef.current[targetId];
    
    if (sourcePos && targetPos) {
      setActiveWaterSpray({
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        phase: currentPhase,
        syllableIndex: syllableIndex,
        timestamp: Date.now()
      });
      
      safeSetTimeout(() => {
        if (isComponentMountedRef.current) {
          setActiveWaterSpray(null);
        }
      }, 1500);
      
      safeSetTimeout(() => {
        if (isComponentMountedRef.current) {
          setPermanentlyBloomed(prev => ({ ...prev, [targetId]: true }));
        }
      }, 800);
    }
  };

  // Trigger sparkles from elephant to lotus/stone - ADDED FROM DOC 1
  const triggerElephantToLotusSparkles = (syllableIndex) => {
    if (!isComponentMountedRef.current) return;
    
    const syllable = currentSequence[syllableIndex];
    const elephantId = `elephant-${syllable}`;
    const targetId = `${currentPhase === 'vakratunda' ? 'lotus' : 'stone'}-${syllable}`;
    
    setActiveSparkles(prev => ({ ...prev, [elephantId]: true }));
    
    safeSetTimeout(() => {
      if (isComponentMountedRef.current) {
        setActiveSparkles(prev => ({ 
          ...prev, 
          [elephantId]: false,
          [targetId]: 'permanent'
        }));
      }
    }, 800);
  };

  // Success celebration with multiple effects
  const triggerSuccessCelebration = () => {
    if (!isComponentMountedRef.current) return;
    
    console.log('🎉 Triggering success celebration');
    
    // Water spray celebration for all syllables
    currentSequence.forEach((syllable, index) => {
      safeSetTimeout(() => {
        if (isComponentMountedRef.current) {
          triggerWaterSpray(index);
        }
      }, index * 200);
    });
    
    setGamePhase('celebration');
    setMistakeCount(0);
    setComboStreak(prev => prev + 1);
  };

  // UPDATED FROM DOC 1: Handle elephant click with permanent activation
  const handleElephantClick = (syllableIndex) => {
    const currentTime = Date.now();
    
    if (currentTime - lastClickTime < 300 || !isComponentMountedRef.current) {
      console.log('Click ignored - too fast or component unmounted!');
      return;
    }
    
    if (!canPlayerClick || isSequencePlaying) {
      console.log('Elephant click ignored - not ready');
      return;
    }

    const clickedSyllable = currentSequence[syllableIndex];
    if (!clickedSyllable) return;

    // Sequential clicking validation
    const expectedIndex = playerInput.length;
    
    if (syllableIndex !== expectedIndex) {
      const expectedSyllable = currentSequence[expectedIndex];
      console.log(`❌ Wrong order! Expected syllable ${expectedIndex + 1} (${expectedSyllable}), but clicked syllable ${syllableIndex + 1} (${clickedSyllable})`);
      
      setGamePhase('order_error');
      safeSetTimeout(() => {
        if (isComponentMountedRef.current) {
          setGamePhase('listening');
        }
      }, 1500);
      
      return;
    }

    setLastClickTime(currentTime);

    console.log(`✅ Player clicked elephant for syllable: ${clickedSyllable} (position ${syllableIndex + 1})`);
    
    playSyllableAudio(clickedSyllable);
    
    // ADDED FROM DOC 1: Track both current round and permanent activation
    const elephantId = `elephant-${clickedSyllable}`;
    const targetId = `${currentPhase === 'vakratunda' ? 'lotus' : 'stone'}-${clickedSyllable}`;
    
    setCurrentRoundClicks(prev => ({ ...prev, [elephantId]: true }));
    setPermanentlyActivatedElephants(prev => ({ ...prev, [elephantId]: true }));
    
    const newPlayerInput = [...playerInput, clickedSyllable];
    setPlayerInput(newPlayerInput);
    
    triggerWaterSpray(syllableIndex);
    triggerElephantToLotusSparkles(syllableIndex); // Added from Doc 1
    
    saveGameState({
      gamePhase: 'listening',
      playerInput: newPlayerInput,
      currentSequence: currentSequence,
      sequenceItemsShown: sequenceItemsShown,
      permanentlyActivatedElephants: {
        ...permanentlyActivatedElephants,
        [elephantId]: true
      }
    });
    
    if (newPlayerInput.length === currentSequence.length) {
      handleSequenceSuccess();
    }
  };

  // Automatic sequence success
  const handleSequenceSuccess = () => {
    if (!isComponentMountedRef.current) return;
    
    console.log(`🎊 Round ${currentRound} of ${currentPhase} completed successfully!`);
    
    setCanPlayerClick(false);
    triggerSuccessCelebration();
    
    saveGameState({
      gamePhase: 'celebration',
      playerInput: playerInput,
      currentSequence: currentSequence,
      sequenceItemsShown: sequenceItemsShown
    });
    
    // Automatic progression with smooth transitions
    safeSetTimeout(() => {
      if (!isComponentMountedRef.current) return;
      
      if (currentRound < 3) {
        console.log(`➡️ AUTO-ADVANCE: Starting round ${currentRound + 1} of ${currentPhase}`);
        
        setRoundTransition(true);
        
        safeSetTimeout(() => {
          if (!isComponentMountedRef.current) return;
          
          startNewRound(currentRound + 1);
          setRoundTransition(false);
        }, 1500);
        
      } else {
        handlePhaseComplete(currentPhase);
      }
    }, 2000);
  };

  // Handle phase completion
  const handlePhaseComplete = (completedPhase) => {
    if (!isComponentMountedRef.current) return;
    
    console.log(`🏆 Phase ${completedPhase} completed!`);
    setGamePhase('phase_complete');
    
    playCompleteWord(completedPhase);
    
    saveGameState({
      gamePhase: 'phase_complete',
      phaseJustCompleted: true,
      lastCompletedPhase: completedPhase
    });
    
    if (onPhaseComplete) {
      onPhaseComplete(completedPhase);
    }
    
    // Only auto-advance for Mahakaya completion
    if (completedPhase === 'mahakaya') {
      safeSetTimeout(() => {
        if (!isComponentMountedRef.current) return;
        
        console.log('🎯 Game complete!');
        saveGameState({
          gameJustCompleted: true
        });
        
        if (onGameComplete) {
          onGameComplete();
        }
      }, 3000);
    }
  };

  // Helper functions
  const getSyllableIndex = (syllable) => {
    return currentSequence.indexOf(syllable);
  };

  const isSinging = (syllable) => {
    return singingSyllable === syllable;
  };

  const isClickable = (syllableIndex) => {
    if (!canPlayerClick || syllableIndex >= currentSequence.length) return false;
    const expectedIndex = playerInput.length;
    return syllableIndex === expectedIndex;
  };

  const isCorrect = (syllableIndex) => {
    return playerInput[syllableIndex] === currentSequence[syllableIndex];
  };

  const isWrong = (syllableIndex) => {
    return playerInput.length > syllableIndex && playerInput[syllableIndex] !== currentSequence[syllableIndex];
  };

  const isBloomed = (syllable) => {
    const targetId = `${currentPhase === 'vakratunda' ? 'lotus' : 'stone'}-${syllable}`;
    return permanentlyBloomed[targetId];
  };

  // ADDED FROM DOC 1: Check if elephant is permanently activated
  const isElephantPermanentlyActivated = (syllable) => {
    const elephantId = `elephant-${syllable}`;
    return permanentlyActivatedElephants[elephantId];
  };

  const shouldHighlightElephant = (syllableIndex) => {
    if (!canPlayerClick) return false;
    const expectedIndex = playerInput.length;
    return syllableIndex === expectedIndex;
  };

  const isElephantDisabled = (syllableIndex) => {
    if (!canPlayerClick) return true;
    const expectedIndex = playerInput.length;
    return syllableIndex !== expectedIndex;
  };

  const hasBeenClicked = (syllableIndex) => {
    return syllableIndex < playerInput.length;
  };

  // MINIMAL STATUS MESSAGES - From Doc 1 approach
  const getStatusMessage = () => {
    if (roundTransition) return `Preparing Round ${currentRound + 1}...`;
    if (isCountingDown) return `Get Ready... ${countdown}`;
    if (gamePhase === 'playing') return 'Listen to the sounds...';
    if (gamePhase === 'listening') return `Repeat! (${playerInput.length}/${currentSequence.length})`;
    if (gamePhase === 'celebration') return comboStreak >= 3 ? 'Perfect streak!' : 'Well done!';
    if (gamePhase === 'phase_complete') return '';
    if (gamePhase === 'error') return mistakeCount >= 3 ? 'Listen carefully...' : 'Try again!';
    if (gamePhase === 'order_error') return 'Click in order!';
    return `Round ${currentRound} - ${currentPhase.toUpperCase()}`;
  };

  // Quick jump to round
  const jumpToRound = (phase, round) => {
    if (!isComponentMountedRef.current) return;
    
    const newSequence = getSequenceForRound(phase, round);
    setCurrentRound(round);
    setCurrentSequence(newSequence);
    setPlayerInput([]);
    setGamePhase('waiting');
    setCanPlayerClick(false);
    setSequenceItemsShown(0);
    
    saveGameState({
      currentRound: round,
      currentSequence: newSequence,
      gamePhase: 'waiting',
      playerInput: []
    });
  };

  // MINIMAL PROGRESS BAR - From Doc 1 with mobile improvements
  const renderProgressBar = () => (
    <div style={{
      position: 'absolute',
      top: '15px',
      right: '15px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 40,
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,215,0,0.2)',
      transition: 'all 0.3s ease'
    }}>
      
      {/* Compact Phase Title */}
      <div style={{ 
        fontSize: '14px', // Bigger for mobile
        fontWeight: 'bold', 
        color: '#FF9800',
        letterSpacing: '0.3px'
      }}>
        {currentPhase.toUpperCase()}
      </div>
      
      {/* BIGGER Round Progress Dots - Now touchable */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {[1, 2, 3].map(round => (
          <button
            key={round}
            onClick={() => jumpToRound(currentPhase, round)}
            style={{
              width: '28px', // Much bigger for mobile touch
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              background: round <= currentRound 
                ? (round < currentRound ? '#4CAF50' : '#FF9800')
                : '#E0E0E0',
              transition: 'all 0.3s ease',
              boxShadow: round === currentRound ? '0 0 8px rgba(255, 152, 0, 0.4)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: round <= currentRound ? 'white' : '#666'
            }}
          >
            {round}
          </button>
        ))}
      </div>

      {/* Simple Syllable Progress - Only show during interaction */}
      {canPlayerClick && currentSequence.length > 0 && (
        <div style={{
          fontSize: '12px',
          color: '#666',
          fontWeight: '500',
          background: 'rgba(76, 175, 80, 0.1)',
          padding: '3px 8px',
          borderRadius: '10px'
        }}>
          {playerInput.length}/{currentSequence.length}
        </div>
      )}

      {/* Combo Streak - Only show when impressive */}
      {comboStreak >= 3 && (
        <div style={{
          fontSize: '10px',
          color: '#FFB74D',
          fontWeight: 'bold',
          background: 'rgba(255, 183, 77, 0.15)',
          padding: '2px 6px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          🔥 {comboStreak}x
        </div>
      )}

      {/* Reload indicator - minimal */}
      {isReload && (
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#FF9800',
          animation: 'fadeOut 3s ease-out forwards'
        }} />
      )}
    </div>
  );

  // Render elephant with Doc 1's minimal approach + permanent activation
  const renderElephant = (syllable, index) => {
    const mood = elephantMoods[syllable] || 'dim';
    const position = phaseData.positions.clickers[index];
    const getImage = currentPhase === 'vakratunda' ? getBabyElephantImage : getAdultElephantImage;
    const hasSparkles = activeSparkles[`elephant-${syllable}`];
    
    const clickable = isClickable(index);
    const isNextExpected = shouldHighlightElephant(index);
    const isDisabled = isElephantDisabled(index);
    const alreadyClicked = hasBeenClicked(index);
    const isPermanentlyLearned = isElephantPermanentlyActivated(syllable);
    
    // MOOD STYLES FROM DOC 1 with permanent activation
    const moodStyles = {
      dim: { 
        filter: 'brightness(0.6) grayscale(0.5)', 
        animation: 'breathe 4s ease-in-out infinite',
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 0.7
      },
      ready: { 
        filter: 'brightness(1)', 
        animation: 'breathe 3s ease-in-out infinite',
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 1
      },
      activated: { 
        filter: 'brightness(1.2) saturate(1.3)', 
        animation: 'bounce 0.6s ease-in-out infinite',
        transform: 'translate(-50%, -50%) scale(1.02)',
        opacity: 1
      },
      celebrating: { 
        filter: 'brightness(1.4) saturate(1.5) hue-rotate(45deg)', 
        animation: 'celebrate 1s ease-in-out infinite',
        transform: 'translate(-50%, -50%) scale(1.08)',
        opacity: 1
      },
      // ADDED FROM DOC 1: Golden glow for permanently learned
      permanently_activated: {
       filter: 'brightness(1) saturate() drop-shadow(0 0 12px #ffd900b8)',
        animation: 'gentleGlow 3s ease-in-out infinite',
        transform: 'translate(-50%, -50%) scale(1.03)',
        opacity: 1
      }
    };

    let finalStyle = { ...moodStyles[mood] };
    
    // PRIORITY SYSTEM FROM DOC 1
    if (isPermanentlyLearned && !alreadyClicked) {
      finalStyle = { ...moodStyles.permanently_activated };
    } else if (alreadyClicked) {
      //finalStyle.filter = 'brightness(0.8) saturate(0.7)';
      finalStyle.opacity = 1;
    } else if (isNextExpected) {
      //finalStyle.filter = 'brightness(1) drop-shadow(0 0 8px #FF9800)';
      finalStyle.animation = 'nextToClick 1.5s ease-in-out infinite';
    } else if (isDisabled) {
      finalStyle.filter = 'brightness(0.7) saturate(0.5) grayscale(0.3)';
      finalStyle.opacity = 0.6;
    }

    return (
      <button
        key={`elephant-${syllable}-${index}`}
        ref={(el) => registerElementPosition(`${currentPhase === 'vakratunda' ? 'baby' : 'adult'}-elephant-${syllable}`, el)}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '170px',
          height: '170px',
          border: 'none',
          background: 'transparent',
          cursor: (clickable && !isDisabled) ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          zIndex: 20,
          borderRadius: '50%',
          ...finalStyle
        }}
        onClick={() => handleElephantClick(index)}
        disabled={!clickable || isDisabled}
      >
        {getImage && (
          <img
            src={getImage(index)}
            alt={`${currentPhase === 'vakratunda' ? 'Baby' : 'Adult'} Elephant ${syllable}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
        
        {/* MINIMAL syllable label - From Doc 1 approach */}
        {(canPlayerClick || alreadyClicked) && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: alreadyClicked 
              ? 'rgba(76, 175, 80, 0.9)' 
              : isNextExpected 
              ? 'rgba(255, 193, 7, 0.9)' 
              : isPermanentlyLearned
              ? 'rgba(255, 215, 0, 0.9)'
              : 'rgba(158, 158, 158, 0.8)',
            color: 'white',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '11px', // Bigger for mobile
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}>
            {syllable.toUpperCase()}
          </div>
        )}

        {/* Clean completion indicator - From Doc 1 */}
        {alreadyClicked && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '24px',
            height: '24px',
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: 'white',
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
            animation: 'checkmarkAppear 0.5s ease-out'
          }}>
            ✓
          </div>
        )}

        {/* Golden crown for permanently learned - From Doc 1 concept */}
        {isPermanentlyLearned && !alreadyClicked && (
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '20px',
            animation: 'crownFloat 2s ease-in-out infinite',
            filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))'
          }}>
            👑
          </div>
        )}

        {/* SPARKLES FROM DOC 1 */}
        {hasSparkles && (
          <div className="elephant-sparkles">
            {Array.from({length: 6}).map((_, i) => (
              <div 
                key={i} 
                className="elephant-sparkle"
                style={{ 
                  '--delay': `${i * 0.1}s`,
                  '--color': ['#FF9800', '#FFB74D', '#FFCC02', '#FFC107', '#FF8F00', '#E65100'][i]
                }}
              >
                ✨
              </div>
            ))}
          </div>
        )}

        {/* Golden glow for next expected click - From Doc 1 */}
        {isNextExpected && !alreadyClicked && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '85%',
            height: '85%',
            border: '2px solid #FFD700',
            borderRadius: '50%',
            animation: 'goldenPulse 2s ease-in-out infinite',
            pointerEvents: 'none'
          }} />
        )}
      </button>
    );
  };

  // Render lotus/stone with minimal approach
  const renderLotusOrStone = (syllable, index) => {
    const glowState = lotusGlow[syllable] || 'dormant';
    const position = phaseData.positions.singers[index];
    const getImage = currentPhase === 'vakratunda' ? getLotusImage : getStoneImage;
    const hasSparkles = activeSparkles[`${currentPhase === 'vakratunda' ? 'lotus' : 'stone'}-${syllable}`];
    const hasPermanentSparkles = hasSparkles === 'permanent';
    
    const glowStyles = {
      dormant: { 
        filter: 'brightness(0.8)', 
        opacity: 0.7,
        transform: 'translate(-50%, -50%) scale(1)'
      },
      singing: { 
        filter: 'brightness(1.6) drop-shadow(0 0 25px #ffd700)', 
        animation: 'sing 0.6s ease-in-out',
        transform: 'translate(-50%, -50%) scale(1.15)',
        opacity: 1
      },
      success: { 
        filter: 'brightness(1.3) saturate(1.4) drop-shadow(0 0 15px #4caf50)',
        animation: 'successGlow 0.5s ease-in-out',
        transform: 'translate(-50%, -50%) scale(1.05)',
        opacity: 1
      },
      victory: { 
        filter: 'brightness(1.5) saturate(1.6) drop-shadow(0 0 25px #ffd700)',
        animation: 'victory 1s ease-in-out infinite',
        transform: 'translate(-50%, -50%) scale(1.1)',
        opacity: 1
      },
      error: { 
        filter: 'brightness(1.2) drop-shadow(0 0 15px #f44336)',
        animation: 'errorShake 0.5s ease-in-out',
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 1
      },
      bloomed: {
        filter: 'brightness(1.4) saturate(1.6) drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
        transform: 'translate(-50%, -50%) scale(1.08)',
        opacity: 1
      }
    };

    return (
      <div
        key={`singer-${syllable}-${index}`}
        ref={(el) => registerElementPosition(`${currentPhase === 'vakratunda' ? 'lotus' : 'stone'}-${syllable}`, el)}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '80px',
          height: '80px',
          transition: 'all 0.3s ease',
          zIndex: 10,
          ...glowStyles[glowState]
        }}
      >
        {getImage && (
          <img
            src={getImage(index)}
            alt={`${currentPhase === 'vakratunda' ? 'Lotus' : 'Stone'} ${syllable}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
        
        {/* MINIMAL singing indicator - From Doc 1 */}
        {isSinging(syllable) && (
          <div style={{
            position: 'absolute',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '16px',
            animation: 'musicalNote 0.6s ease-in-out'
          }}>
            🎵
          </div>
        )}
        
        {/* SPARKLES FROM DOC 1 */}
        {(hasSparkles || hasPermanentSparkles) && (
          <div className="lotus-sparkles">
            {Array.from({length: 4}).map((_, i) => (
              <div 
                key={i} 
                className="lotus-sparkle"
                style={{ 
                  '--delay': `${i * 0.15}s`,
                  '--color': '#FFB74D',
                  animation: hasPermanentSparkles 
                    ? 'sparkleFloat 2s ease-in-out infinite' 
                    : 'sparkleFloat 1s ease-out forwards'
                }}
              >
                ✨
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isActive) {
    return null;
  }

  const phaseData = ELEMENT_DATA[currentPhase];

  return (
    <div className="minimal-sanskrit-game" style={containerStyle}>
      
      {/* MINIMAL Progress Bar - From Doc 1 */}
      {!hideElements && renderProgressBar()}
      
      {/* MINIMAL Status Display - From Doc 1 approach */}
      {!hideElements && gamePhase !== 'phase_complete' && (
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '20%', // Doc 1 positioning
          transform: 'translateX(-50%)',
          background: isCountingDown 
            ? 'rgba(255, 152, 0, 0.9)' 
            : gamePhase === 'celebration'
            ? 'rgba(76, 175, 80, 0.9)'
            : gamePhase === 'error' || gamePhase === 'order_error'
            ? 'rgba(244, 67, 54, 0.9)'
            : 'rgba(255, 152, 0, 0.9)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '12px',
          fontSize: '13px', // Bigger for mobile
          fontWeight: '500',
          textAlign: 'center',
          zIndex: 50,
          maxWidth: '220px', // Slightly bigger
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease'
        }}>
          {getStatusMessage()}
        </div>
      )}

      {/* Round Selector Buttons - Mobile Friendly */}
      {!hideElements && (gamePhase === 'waiting' || gamePhase === 'listening') && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '20%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          zIndex: 45
        }}>
          {[1, 2, 3].map(round => (
            <button 
              key={round} 
              onClick={() => jumpToRound(currentPhase, round)} 
              style={{
                fontSize: '14px', 
                padding: '8px 12px', 
                borderRadius: '12px',
                background: round === currentRound ? '#FF9800' : 'rgba(255, 183, 77, 0.8)', 
                color: 'white', 
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                minWidth: '44px', // Mobile touch target
                minHeight: '44px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              {round}
            </button>
          ))}
        </div>
      )}

      {/* Countdown Display */}
      {!hideElements && isCountingDown && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '120px',
          fontWeight: 'bold',
          color: '#FF9800',
          textShadow: '0 0 30px rgba(255, 152, 0, 0.8)',
          zIndex: 100,
          animation: 'countdownPulse 0.8s ease-in-out'
        }}>
          {countdown}
        </div>
      )}

      {/* Game Elements */}
      {!hideElements && ((currentPhase === 'vakratunda') || (currentPhase === 'mahakaya' && powerGained)) && (
        <>
          {/* Singing Elements (Lotus/Stones) */}
          {currentSequence.map((syllable, index) => {
            if (currentPhase === 'mahakaya' && !powerGained) {
              return null;
            }
            return renderLotusOrStone(syllable, index);
          })}
          
          {/* Clickable Elephants */}
          {currentSequence.map((syllable, index) => {
            if (currentPhase === 'mahakaya' && !powerGained) {
              return null;
            }
            return renderElephant(syllable, index);
          })}
        </>
      )}
      
      {/* Water Spray Animation */}
      {activeWaterSpray && WaterSprayComponent && (
        <WaterSprayComponent
          sourcePosition={activeWaterSpray.sourcePosition}
          targetPosition={activeWaterSpray.targetPosition}
          isActive={true}
          dropCount={activeWaterSpray.phase === 'mahakaya' ? 20 : 15}
          duration={1500}
          phase={activeWaterSpray.phase}
        />
      )}
      
      {/* CSS Animations - From Doc 1 with additions */}
      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes countdownPulse {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
        }
        
        @keyframes breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.02); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -50%) translateY(0) scale(1.02); }
          50% { transform: translate(-50%, -50%) translateY(-8px) scale(1.02); }
        }
        
        @keyframes celebrate {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg) scale(1.08); }
          25% { transform: translate(-50%, -50%) rotate(-3deg) scale(1.1); }
          75% { transform: translate(-50%, -50%) rotate(3deg) scale(1.1); }
        }
        
        @keyframes gentleGlow {
          0%, 100% { 
            filter: brightness(1.1) saturate(0.8) drop-shadow(0 0 12px #ffd900d2);
          }
          50% { 
            filter: brightness(1.2) saturate(1.2) drop-shadow(0 0 18px #FFB74D);
          }
        }
        
        @keyframes nextToClick {
          0%, 100% { 
            filter: brightness(1.2) drop-shadow(0 0 8px #FF9800);
          }
          50% { 
            filter: brightness(1.4) drop-shadow(0 0 15px #FFB74D);
          }
        }
        
        @keyframes crownFloat {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-3px); }
        }
        
        @keyframes sing {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1.15); }
        }
        
        @keyframes victory {
          0%, 100% { transform: translate(-50%, -50%) scale(1.1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
        
        @keyframes successGlow {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.08); }
          100% { transform: translate(-50%, -50%) scale(1.05); }
        }
        
        @keyframes errorShake {
          0%, 100% { transform: translate(-50%, -50%) translateX(0); }
          25% { transform: translate(-50%, -50%) translateX(-5px); }
          75% { transform: translate(-50%, -50%) translateX(5px); }
        }
        
        @keyframes musicalNote {
          0% { transform: translateX(-50%) translateY(0) scale(0.8); opacity: 0; }
          50% { transform: translateX(-50%) translateY(-10px) scale(1.2); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-20px) scale(0.8); opacity: 0; }
        }
        
        @keyframes checkmarkAppear {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(0deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes goldenPulse {
          0%, 100% { 
            opacity: 0.7; 
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.05);
          }
        }
        
        .elephant-sparkles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .elephant-sparkle {
          position: absolute;
          animation: sparkleFloat 1s ease-out forwards;
          animation-delay: var(--delay);
          color: var(--color);
          font-size: 16px;
          opacity: 0;
          left: 50%;
          top: 50%;
        }

        .lotus-sparkles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .lotus-sparkle {
          position: absolute;
          animation-delay: var(--delay);
          color: var(--color);
          font-size: 12px;
          opacity: 0;
          left: 50%;
          top: 50%;
        }
        
        @keyframes sparkleFloat {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.5) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(
              calc(-50% + 30px), 
              calc(-50% - 30px)
            ) scale(1.2) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
};

// Container styles
const containerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 20,
  pointerEvents: 'auto'
};

export default SanskritMemoryGame;