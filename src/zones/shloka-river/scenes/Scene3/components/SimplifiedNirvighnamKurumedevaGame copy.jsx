// SimplifiedNirvighnamKurumedevaGame.jsx - Combined Nirvighnam + Kurumedeva
// Pattern: Same elements sing â†' Player clicks same elements â†' Visual rewards transform

import React, { useState, useEffect, useRef } from 'react';

// Game configuration - syllable sequences for each phase and round
const SYLLABLE_SEQUENCES = {
  nirvighnam: {
    1: ['nir', 'vigh'],
    2: ['nir', 'vigh', 'nam']
  },
  kurumedeva: {
    1: ['kuru', 'me'],
    2: ['kuru', 'me', 'de'], 
    3: ['kuru', 'me', 'de', 'va']
  }
};

// Element positioning for both phases
const ELEMENT_POSITIONS = {
  nirvighnam: {
    singers: [  // Rescue items that sing AND get clicked
      { left: '25%', top: '50%' },  // leafRir (nir)
      { left: '40%', top: '45%' },  // drumVigh (vigh)  
      { left: '60%', top: '50%' }   // featherNam (nam)
    ],
    initials: [  // Animals on stones (initial state - same position as singers)
      { left: '25%', top: '25%' },  // frogNir on stone
      { left: '40%', top: '20%' },  // snailVigh on stone
      { left: '60%', top: '25%' }   // turtleNam on stone
    ],
    rewards: [  // Animals in water + colored stones (reward state)
      { left: '18%', top: '75%' },  // frogNir in water + stone1NirCol
      { left: '38%', top: '70%' },  // snailVigh in water + stone2VighCol
      { left: '58%', top: '75%' }   // turtleNam in water + stone3NamCol
    ]
  },
  kurumedeva: {
    singers: [  // Animals that sing AND get clicked (map to assets 1,3,4,2)
      { left: '70%', top: '35%' },  // animal1Ku (kuru)
      { left: '80%', top: '75%' },  // animal3Me (me)
      { left: '35%', top: '80%' },  // animal4De (de)
      { left: '15%', top: '80%' }   // animal2Ru (va)
    ],
    initials: [  // Items in bubbles (initial state)
      { left: '60%', top: '25%' },  // item1Ku in bubble (kuru)
      { left: '50%', top: '25%' },  // item3Me in bubble (me)
      { left: '80%', top: '25%' },  // item4De in bubble (de)
      { left: '25%', top: '60%' }   // item2Ru in bubble (va)
    ],
    rewards: [  // Decorations on temple wall (reward state)
      { left: '50%', top: '45%' },  // decor1Ku on wall (kuru)
      { left: '50%', top: '60%' },  // decor3Me on wall (me)
      { left: '80%', top: '60%' },  // decor4De on wall (de)
      { left: '50%', top: '40%' }   // decor2Ru on wall (va)
    ]
  }
};

const SimplifiedNirvighnamKurumedevaGame = ({
  isActive = false,
  hideElements = false,
  onPhaseComplete,
  onGameComplete,
  profileName = 'little explorer',
  
  // Asset functions for Nirvighnam
  getDrumVighImage,          // () -> drumVigh images (singer/clicker for vigh)
  getLeafRirImage,           // () -> leafRir images (singer/clicker for nir)  
  getFeatherNamImage,        // () -> featherNam images (singer/clicker for nam)
  getFrogNirImage,           // () -> frogNir images (same for initial on stone & reward in water)
  getSnailVighImage,         // () -> snailVigh images (same for initial on stone & reward in water)
  getTurtleNamImage,         // () -> turtleNam images (same for initial on stone & reward in water)
  getStone1NirColImage,      // () -> stone1NirCol images (reward: colored stone)
  getStone2VighColImage,     // () -> stone2VighCol images (reward: colored stone)
  getStone3NamColImage,      // () -> stone3NamCol images (reward: colored stone)
getStone1NirImage,
  getStone2VighImage, 
  getStone3NamImage,
  
  // Asset functions for Kurumedeva  
  getAnimal1KuImage,         // () -> animal1Ku images (singer/clicker for kuru)
  getAnimal2RuImage,         // () -> animal2Ru images (singer/clicker for va)
  getAnimal3MeImage,         // () -> animal3Me images (singer/clicker for me)
  getAnimal4DeImage,         // () -> animal4De images (singer/clicker for de)
  getItem1KuImage,           // () -> item1Ku images (initial: item in bubble)
  getItem2RuImage,           // () -> item2Ru images (initial: item in bubble)
  getItem3MeImage,           // () -> item3Me images (initial: item in bubble)
  getItem4DeImage,           // () -> item4De images (initial: item in bubble)
  getDecor1KuImage,          // () -> decor1Ku images (reward: decoration on wall)
  getDecor2RuImage,          // () -> decor2Ru images (reward: decoration on wall)
  getDecor3MeImage,          // () -> decor3Me images (reward: decoration on wall)
  getDecor4DeImage,          // () -> decor4De images (reward: decoration on wall)
  
  // Audio functions
  isAudioOn = true,
  playAudio,
  
  // State saving
  onSaveGameState,
  
  // Reload support
  isReload = false,
  initialGamePhase = 'waiting',
  initialCurrentPhase = 'nirvighnam',
  initialCurrentRound = 1,
  initialPlayerInput = [],
  initialCurrentSequence = [],
  initialVisualRewards = {},
  initialActivatedSingers = {},
  
  // Phase control
  powerGained = false // For kurumedeva phase activation
}) => {

      // Add this function near your other asset mapping functions (around line 600-700)
const getPlainStoneImage = (syllable) => {
  // You need to pass these as props or import them directly
  if (syllable === 'nir') return stone1Nir;
  if (syllable === 'vigh') return stone2Vigh;
  if (syllable === 'nam') return stone3Nam;
  return null;
};


  // Core game state
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentPhase, setCurrentPhase] = useState('nirvighnam');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [canPlayerClick, setCanPlayerClick] = useState(false);
  const [singingSyllable, setSingingSyllable] = useState(null);
  
  // Visual state - handles both animal movements and decorations
  const [visualRewards, setVisualRewards] = useState({});           // Which rewards have appeared
  const [activatedSingers, setActivatedSingers] = useState({});     // Which singers are permanently learned
  const [roundClicks, setRoundClicks] = useState({});              // Current round click tracking
  
  // Animation state
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  
  // Refs for cleanup
  const timeoutsRef = useRef([]);
  const intervalsRef = useRef([]);
  const isComponentMountedRef = useRef(true);

  // ENHANCED: Comprehensive timer cleanup - CRITICAL for phase transitions
  const clearAllTimers = () => {
    console.log('🧹 Clearing all timers for clean state transition');
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    intervalsRef.current.forEach(interval => clearInterval(interval));
    timeoutsRef.current = [];
    intervalsRef.current = [];
  };

  // Safe timeout with cleanup
  const safeSetTimeout = (callback, delay) => {
    const timeout = setTimeout(() => {
      if (isComponentMountedRef.current) {
        callback();
      }
    }, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  // Safe interval with cleanup
  const safeSetInterval = (callback, delay) => {
    const interval = setInterval(() => {
      if (isComponentMountedRef.current) {
        callback();
      }
    }, delay);
    intervalsRef.current.push(interval);
    return interval;
  };

  // ENHANCED: Cleanup on unmount with thorough timer clearing
  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      console.log('🧹 SimplifiedNirvighnamKurumedevaGame: Component unmounting - cleaning up thoroughly');
      isComponentMountedRef.current = false;
      clearAllTimers();
      
      // Cleanup global references
      if (window.simplifiedNirvighnamKurumedevaGame) {
        window.simplifiedNirvighnamKurumedevaGame.isReady = false;
        delete window.simplifiedNirvighnamKurumedevaGame.startKurumedevaPhase;
      }
    };
  }, []);

  // Audio functions for both phases
  const playSyllableAudio = (syllable) => {
    if (!isAudioOn || !playAudio) return;
    
    const syllableFiles = {
      // Nirvighnam syllables
      'nir': 'nirvighnam-nir',
      'vigh': 'nirvighnam-vigh', 
      'nam': 'nirvighnam-nam',
      // Kurumedeva syllables
      'kuru': 'kurumedeva-kuru',
      'me': 'kurumedeva-me',
      'de': 'kurumedeva-de',
      'va': 'kurumedeva-va'
    };
    
    const fileName = syllableFiles[syllable];
    if (fileName) {
      playAudio(`/audio/syllables/${fileName}.mp3`);
    }
  };

  // Game logic functions
  const getSequenceForRound = (phase, round) => {
    return SYLLABLE_SEQUENCES[phase][round] || [];
  };

  const startNewRound = (roundNumber) => {
    const sequence = getSequenceForRound(currentPhase, roundNumber);
    setCurrentRound(roundNumber);
    setCurrentSequence(sequence);
    setPlayerInput([]);
    setRoundClicks({}); // Reset round clicks but keep permanent state
    setGamePhase('waiting');
    setCanPlayerClick(false);
    
    console.log(`Starting ${currentPhase} round ${roundNumber}:`, sequence);
    
    // Save state
    if (onSaveGameState) {
      onSaveGameState({
        gamePhase: 'waiting',
        currentPhase,
        currentRound: roundNumber,
        currentSequence: sequence,
        playerInput: [],
        visualRewards,
        activatedSingers
      });
    }
  };

  const startCountdown = () => {
    setIsCountingDown(true);
    setCountdown(3);
    
    const countdownInterval = safeSetInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          playSequence();
          return 0;
        }
        return prev - 1;
      });
    }, 800);
  };

  const playSequence = () => {
    if (currentSequence.length === 0) return;
    
    setIsSequencePlaying(true);
    setGamePhase('playing');
    setCanPlayerClick(false);
    setPlayerInput([]);
    setSingingSyllable(null);
    
    // Play each syllable with timing
    currentSequence.forEach((syllable, index) => {
      safeSetTimeout(() => {
        setSingingSyllable(syllable);
        playSyllableAudio(syllable);
        
        // Clear singing state after syllable
        safeSetTimeout(() => {
          setSingingSyllable(null);
        }, 600);
        
        // After last syllable, enable clicking
        if (index === currentSequence.length - 1) {
          safeSetTimeout(() => {
            setIsSequencePlaying(false);
            setGamePhase('listening');
            setCanPlayerClick(true);
            console.log('Sequence complete - ready for clicks');
          }, 800);
        }
      }, index * 1200);
    });
  };

  const handleSingerClick = (syllableIndex) => {
    if (!canPlayerClick || isSequencePlaying) return;
    
    const clickedSyllable = currentSequence[syllableIndex];
    if (!clickedSyllable) return;
    
    // Check if already clicked this round
    if (roundClicks[`singer-${clickedSyllable}`]) {
      console.log('Already clicked this round');
      return;
    }
    
    // Sequential clicking - must click in order
    const expectedIndex = playerInput.length;
    if (syllableIndex !== expectedIndex) {
      console.log(`Wrong order! Expected index ${expectedIndex}, clicked ${syllableIndex}`);
      return;
    }
    
    console.log(`Clicked ${currentPhase} singer: ${clickedSyllable}`);
    
    // Play audio
    playSyllableAudio(clickedSyllable);
    
    // Update state
    const newPlayerInput = [...playerInput, clickedSyllable];
    setPlayerInput(newPlayerInput);
    setRoundClicks(prev => ({ ...prev, [`singer-${clickedSyllable}`]: true }));
    setActivatedSingers(prev => ({ ...prev, [`singer-${clickedSyllable}`]: true }));
    
    // Transform visual reward
    if (currentPhase === 'nirvighnam') {
      // For nirvighnam: animal moves to water + stone becomes golden
      setVisualRewards(prev => ({ 
        ...prev, 
        [`animal-${clickedSyllable}`]: true,
        [`stone-${clickedSyllable}`]: true 
      }));
    } else {
      // For kurumedeva: decoration moves from bubble to wall  
      setVisualRewards(prev => ({ ...prev, [`decor-${clickedSyllable}`]: true }));
    }
    
    // Check if round complete
    if (newPlayerInput.length === currentSequence.length) {
      handleRoundSuccess();
    }
  };

  const handleRoundSuccess = () => {
    setCanPlayerClick(false);
    setGamePhase('celebration');
    
    console.log(`${currentPhase} round ${currentRound} complete!`);
    
    // Auto-advance to next round or complete phase
    safeSetTimeout(() => {
      const maxRounds = currentPhase === 'nirvighnam' ? 2 : 3;
      if (currentRound < maxRounds) {
        startNewRound(currentRound + 1);
      } else {
        handlePhaseComplete();
      }
    }, 2000);
  };

  const handlePhaseComplete = () => {
    setGamePhase('phase_complete');
    console.log(`${currentPhase} phase completed!`);
    
    if (onPhaseComplete) {
      onPhaseComplete(currentPhase);
    }
    
    // Auto-start Kurumedeva if Nirvighnam is complete and power gained
    if (currentPhase === 'nirvighnam' && onGameComplete) {
      // Let parent handle phase transition
    } else if (currentPhase === 'kurumedeva' && onGameComplete) {
      onGameComplete();
    }
  };

  // ENHANCED: Start Kurumedeva phase with comprehensive state cleanup
  const startKurumedevaPhase = () => {
    console.log('ðŸ"¥ STARTING KURUMEDEVA PHASE - COMPREHENSIVE RESET ðŸ"¥');
    
    // CRITICAL: Clear all timers first to prevent interference
    clearAllTimers();
    
    // Complete state reset
    setCurrentPhase('kurumedeva');
    setCurrentRound(1);
    setPlayerInput([]);
    setRoundClicks({});
    setVisualRewards({});
    setActivatedSingers({});
    setIsSequencePlaying(false);
    setCanPlayerClick(false);
    setSingingSyllable(null);
    setCountdown(0);
    setIsCountingDown(false);
    setGamePhase('waiting');
    
    // Get sequence and set it
    const sequence = getSequenceForRound('kurumedeva', 1);
    console.log('Kurumedeva sequence:', sequence);
    setCurrentSequence(sequence);
    
    // Immediate state save with complete clean state
    if (onSaveGameState) {
      onSaveGameState({
        gamePhase: 'waiting',
        currentPhase: 'kurumedeva',
        currentRound: 1,
        currentSequence: sequence,
        playerInput: [],
        visualRewards: {},
        activatedSingers: {}
      });
    }
    
    console.log('✅ Kurumedeva phase initialized with clean state');
  };

  // Expose global function for parent to call
  useEffect(() => {
    if (!isActive) return;
    
    console.log('🎮 Setting up global functions for SimplifiedNirvighnamKurumedevaGame');
    
    if (!window.simplifiedNirvighnamKurumedevaGame) {
      window.simplifiedNirvighnamKurumedevaGame = {};
    }
    
    window.simplifiedNirvighnamKurumedevaGame.startKurumedevaPhase = startKurumedevaPhase;
    window.simplifiedNirvighnamKurumedevaGame.isReady = true;
    
    console.log('✅ Global function registered:', typeof window.simplifiedNirvighnamKurumedevaGame.startKurumedevaPhase);
    
    return () => {
      console.log('🧹 Cleaning up global functions');
      if (window.simplifiedNirvighnamKurumedevaGame) {
        window.simplifiedNirvighnamKurumedevaGame.isReady = false;
        delete window.simplifiedNirvighnamKurumedevaGame.startKurumedevaPhase;
      }
    };
  }, [isActive, startKurumedevaPhase]);

  // Initialize game
  useEffect(() => {
    if (!isActive) return;
    
    console.log('🎯 INITIALIZING SimplifiedNirvighnamKurumedevaGame:', { 
      isReload, 
      initialCurrentPhase, 
      initialCurrentRound,
      hasValidReloadData: !!(isReload && initialCurrentPhase && initialCurrentSequence?.length > 0)
    });
    
    if (isReload && initialCurrentPhase && initialCurrentSequence?.length > 0) {
      // Only restore state if we have valid reload data
      console.log('ðŸ"‚ Restoring game state:', { initialCurrentPhase, initialCurrentRound });
      setCurrentPhase(initialCurrentPhase);
      setCurrentRound(initialCurrentRound);
      setCurrentSequence(initialCurrentSequence);
      setPlayerInput(initialPlayerInput);
      setGamePhase(initialGamePhase);
      setVisualRewards(initialVisualRewards || {});
      setActivatedSingers(initialActivatedSingers || {});
      
      // Rebuild round clicks from player input
      const clicks = {};
      initialPlayerInput.forEach(syllable => {
        clicks[`singer-${syllable}`] = true;
      });
      setRoundClicks(clicks);
      
    } else {
      // Start new game - always start with Nirvighnam
      console.log('🆕 Starting fresh game - Nirvighnam phase');
      setCurrentPhase('nirvighnam');
      startNewRound(1);
    }
  }, [isActive, isReload]);

  // Auto-start countdown when waiting
  useEffect(() => {
    if (gamePhase === 'waiting' && currentSequence.length > 0 && !isCountingDown) {
      safeSetTimeout(() => {
        startCountdown();
      }, 1000);
    }
  }, [gamePhase, currentSequence, isCountingDown]);

  // Auto-transition to Kurumedeva when power is gained and Nirvighnam is complete
useEffect(() => {
  if (powerGained && currentPhase === 'nirvighnam' && gamePhase === 'phase_complete') {
    console.log('ðŸ"¥ AUTO-TRANSITION: Nirvighnam complete + power gained - switching to Kurumedeva');
    startKurumedevaPhase();
  }
}, [powerGained, currentPhase, gamePhase]);

  // Helper functions
  const isSingerSinging = (syllable) => {
    return singingSyllable === syllable;
  };

  const isSingerClickable = (syllableIndex) => {
    if (!canPlayerClick) return false;
    const expectedIndex = playerInput.length;
    return syllableIndex === expectedIndex;
  };

  const hasSingerBeenClicked = (syllableIndex) => {
    return syllableIndex < playerInput.length;
  };

  const isSingerActivated = (syllable) => {
    return activatedSingers[`singer-${syllable}`];
  };

  const isAnimalInWater = (syllable) => {
    return visualRewards[`animal-${syllable}`];
  };

  const isStoneColored = (syllable) => {
    return visualRewards[`stone-${syllable}`];
  };

  const isDecorOnWall = (syllable) => {
    return visualRewards[`decor-${syllable}`];
  };

  const isNextExpected = (syllableIndex) => {
    if (!canPlayerClick) return false;
    const expectedIndex = playerInput.length;
    return syllableIndex === expectedIndex;
  };

  // Round jumping function
  const jumpToRound = (round) => {
    console.log(`Jumping to ${currentPhase} round ${round}`);
    startNewRound(round);
  };

  // Get current positions based on phase
  const getCurrentPositions = () => {
    return ELEMENT_POSITIONS[currentPhase];
  };

  // Asset mapping functions
  const getSingerImage = (syllable, index) => {
    if (currentPhase === 'nirvighnam') {
      if (syllable === 'nir') return getLeafRirImage ? getLeafRirImage() : null;
      if (syllable === 'vigh') return getDrumVighImage ? getDrumVighImage() : null;
      if (syllable === 'nam') return getFeatherNamImage ? getFeatherNamImage() : null;
    } else {
      // Map syllables to correct assets: kuru->1, me->3, de->4, va->2
      if (syllable === 'kuru') return getAnimal1KuImage ? getAnimal1KuImage() : null;
      if (syllable === 'me') return getAnimal3MeImage ? getAnimal3MeImage() : null;
      if (syllable === 'de') return getAnimal4DeImage ? getAnimal4DeImage() : null;
      if (syllable === 'va') return getAnimal2RuImage ? getAnimal2RuImage() : null;
    }
    return null;
  };

  const getInitialImage = (syllable, index) => {
    if (currentPhase === 'nirvighnam') {
      if (syllable === 'nir') return getFrogNirImage ? getFrogNirImage() : null;
      if (syllable === 'vigh') return getSnailVighImage ? getSnailVighImage() : null;
      if (syllable === 'nam') return getTurtleNamImage ? getTurtleNamImage() : null;
    } else {
      // Items in bubbles - map syllables to correct assets
      if (syllable === 'kuru') return getItem1KuImage ? getItem1KuImage() : null;
      if (syllable === 'me') return getItem3MeImage ? getItem3MeImage() : null;
      if (syllable === 'de') return getItem4DeImage ? getItem4DeImage() : null;
      if (syllable === 'va') return getItem2RuImage ? getItem2RuImage() : null;
    }
    return null;
  };

  const getRewardImage = (syllable, isAnimalReward = false) => {
    if (currentPhase === 'nirvighnam') {
      if (isAnimalReward) {
        // Same animal images, just different position
        if (syllable === 'nir') return getFrogNirImage ? getFrogNirImage() : null;
        if (syllable === 'vigh') return getSnailVighImage ? getSnailVighImage() : null;
        if (syllable === 'nam') return getTurtleNamImage ? getTurtleNamImage() : null;
      } else {
        // Colored stones
        if (syllable === 'nir') return getStone1NirColImage ? getStone1NirColImage() : null;
        if (syllable === 'vigh') return getStone2VighColImage ? getStone2VighColImage() : null;
        if (syllable === 'nam') return getStone3NamColImage ? getStone3NamColImage() : null;
      }
    } else {
      // Decorations on wall
      if (syllable === 'kuru') return getDecor1KuImage ? getDecor1KuImage() : null;
      if (syllable === 'me') return getDecor3MeImage ? getDecor3MeImage() : null;
      if (syllable === 'de') return getDecor4DeImage ? getDecor4DeImage() : null;
      if (syllable === 'va') return getDecor2RuImage ? getDecor2RuImage() : null;
    }
    return null;
  };


  // Render functions
  const renderSinger = (syllable, index) => {
    const positions = getCurrentPositions();
    const position = positions.singers[index];
    const isSinging = isSingerSinging(syllable);
    const isClickable = isSingerClickable(index);
    const hasBeenClicked = hasSingerBeenClicked(index);
    const isActivated = isSingerActivated(syllable);
    const isNext = isNextExpected(index);
    
    // Enhanced visual states with glow effects
    let singerStyle = {
      opacity: 1,
      transform: 'translate(-50%, -50%) scale(1)',
      transition: 'all 0.3s ease'
    };
    
    if (isSinging) {
      singerStyle.transform = 'translate(-50%, -50%) scale(1.15)';
      singerStyle.filter = 'brightness(1.4) drop-shadow(0 0 15px #FFD700)';
      singerStyle.animation = 'sing 0.6s ease-in-out';
    } else if (isNext && !hasBeenClicked) {
      singerStyle.filter = currentPhase === 'nirvighnam' 
        ? 'brightness(1.2) drop-shadow(0 0 8px #4CAF50)'
        : 'brightness(1.2) drop-shadow(0 0 8px #FF9800)';
      singerStyle.animation = 'nextToClick 1.5s ease-in-out infinite';
    } else if (hasBeenClicked) {
      singerStyle.opacity = 1;
      singerStyle.filter = 'brightness(1.1) saturate(1.2)';
    } else if (isActivated && !hasBeenClicked) {
      singerStyle.filter = currentPhase === 'nirvighnam'
        ? 'brightness(1.1) saturate(1.1) drop-shadow(0 0 6px rgba(76, 175, 80, 0.4))'
        : 'brightness(1.1) saturate(1.1) drop-shadow(0 0 6px rgba(255, 152, 0, 0.4))';
      singerStyle.animation = 'gentleGlow 3s ease-in-out infinite';
    } else if (!canPlayerClick) {
      singerStyle.opacity = 0.6;
    }

    return (
      <button
        key={`singer-${syllable}`}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: currentPhase === 'nirvighnam' ? '80px' : '110px',
          height: currentPhase === 'nirvighnam' ? '80px' : '110px',
          border: 'none',
          background: 'transparent',
          cursor: isClickable ? 'pointer' : 'default',
          zIndex: 20,
          borderRadius: '50%',
          ...singerStyle
        }}
        onClick={() => handleSingerClick(index)}
        disabled={!isClickable}
      >
        <img
          src={getSingerImage(syllable, index)}
          alt={`${currentPhase} ${currentPhase === 'nirvighnam' ? 'rescue item' : 'animal'} ${syllable}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        
        {/* Singing indicator */}
        {isSinging && (
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '20px',
            animation: 'musicNote 0.6s ease-in-out'
          }}>
            🎵
          </div>
        )}
        
        {/* ENHANCED: Golden circle for next click */}
        {isNext && !hasBeenClicked && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '85%',
            height: '85%',
            border: `2px solid ${currentPhase === 'nirvighnam' ? '#4CAF50' : '#FF9800'}`,
            borderRadius: '50%',
            animation: 'goldenPulse 2s ease-in-out infinite',
            pointerEvents: 'none'
          }} />
        )}
        
        {/* Golden crown for permanently learned */}
        {isActivated && !hasBeenClicked && (
          <div style={{
            position: 'absolute',
            top: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '20px',
            animation: 'crownFloat 2s ease-in-out infinite',
            filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))'
          }}>
            ðŸ''
          </div>
        )}
        
        {/* Syllable label */}
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: hasBeenClicked 
            ? 'rgba(76, 175, 80, 0.9)' 
            : isNext
            ? 'rgba(255, 193, 7, 0.9)'
            : isActivated
            ? (currentPhase === 'nirvighnam' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 152, 0, 0.8)')
            : (currentPhase === 'nirvighnam' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 152, 0, 0.9)'),
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        }}>
          {syllable.toUpperCase()}
        </div>
        
        {/* Success checkmark */}
        {hasBeenClicked && (
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
            color: 'white',
            fontSize: '16px',
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
            animation: 'checkmarkAppear 0.5s ease-out'
          }}>
            âœ"
          </div>
        )}
      </button>
    );
  };

const renderInitialVisual = (syllable, index) => {
  const positions = getCurrentPositions();
  const position = positions.initials[index];
  
  if (currentPhase === 'nirvighnam') {
    // For nirvighnam: show both animal AND stone if not moved to water yet
    const animalMoved = visualRewards[`animal-${syllable}`];
    const stoneColored = visualRewards[`stone-${syllable}`];
    
    // Don't show initial if already transformed
    if (animalMoved || stoneColored) return null;

    return (
      <React.Fragment key={`initial-${syllable}`}>
        {/* Plain stone - behind animal */}
        <div
          key={`initial-stone-${syllable}`}
          style={{
            position: 'absolute',
            left: position.left,
            top: position.top,
            width: '120px',
            height: '120px',
            zIndex: 5,  // Behind animal
            transform: 'translate(-50%, -50%)',
            opacity: 0.9
          }}
        >
          <img
            src={getPlainStoneImage(syllable)} // Use plain stone function
            alt={`Stone ${syllable}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        
        {/* Animal on stone - in front */}
        <div
          key={`initial-animal-${syllable}`}
          style={{
            position: 'absolute',
            left: position.left,
            top: position.top,
            width: '80px',
            height: '80px',
            zIndex: 10, // In front of stone
            transform: 'translate(-50%, -50%)',
            opacity: 0.7
          }}
        >
          <img
            src={getInitialImage(syllable, index)}
            alt={`Animal on stone ${syllable}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </React.Fragment>
    );
  } else {
    // For kurumedeva: show item in bubble if not moved to wall yet
    const isTransformed = visualRewards[`decor-${syllable}`];
    
    if (isTransformed) return null;

    return (
      <div
        key={`initial-${syllable}`}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '80px',
          height: '80px',
          zIndex: 10,
          transform: 'translate(-50%, -50%)',
          opacity: 0.7
        }}
      >
        <img
          src={getInitialImage(syllable, index)}
          alt={`Item in bubble ${syllable}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  }
};

  const renderVisualReward = (syllable, index) => {
    const positions = getCurrentPositions();
    const position = positions.rewards[index];
    
    if (currentPhase === 'nirvighnam') {
      // For nirvighnam: render both animal in water AND colored stone
      const showAnimal = isAnimalInWater(syllable);
      const showStone = isStoneColored(syllable);
      
      return (
        <React.Fragment key={`rewards-${syllable}`}>
          {/* Animal in water */}
          {showAnimal && (
            <div
              key={`animal-reward-${syllable}`}
              style={{
                position: 'absolute',
                left: position.left,
                top: position.top,
                width: '90px',
                height: '90px',
                zIndex: 15,
                animation: 'rewardAppear 1s ease-out, rewardGlow 2s ease-in-out infinite 1s',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <img
                src={getRewardImage(syllable, true)}
                alt={`Animal in water ${syllable}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          )}
          
          {/* Colored stone */}
          {showStone && (
            <div
              key={`stone-reward-${syllable}`}
              style={{
                position: 'absolute',
                left: position.left,
                top: `${parseFloat(position.top) + 10}%`, // Slightly lower than animal
                width: '120px',
                height: '120px',
                zIndex: 5, // Behind animal
                animation: 'rewardAppear 1s ease-out 0.3s, rewardGlow 2s ease-in-out infinite 1.3s',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <img
                src={getRewardImage(syllable, false)}
                alt={`Colored stone ${syllable}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              
              {/* Sparkle effect */}
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '18px',
                animation: 'sparkle 2s ease-in-out infinite'
              }}>
                ✨
              </div>
            </div>
          )}
        </React.Fragment>
      );
    } else {
      // For kurumedeva: decoration on wall
      const isVisible = isDecorOnWall(syllable);
      
      if (!isVisible) return null;
      
      return (
        <div
          key={`decor-reward-${syllable}`}
          style={{
            position: 'absolute',
            left: position.left,
            top: position.top,
            width: '100px',
            height: '100px',
            zIndex: 15,
            animation: 'rewardAppear 1s ease-out, rewardGlow 2s ease-in-out infinite 1s',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <img
            src={getRewardImage(syllable)}
            alt={`Decoration on wall ${syllable}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          
          {/* Sparkle effect */}
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '18px',
            animation: 'sparkle 2s ease-in-out infinite'
          }}>
            ✨
          </div>
        </div>
      );
    }
  };

  const getStatusMessage = () => {
    if (isCountingDown) return `Get Ready... ${countdown}`;
    if (gamePhase === 'playing') return 'Listen carefully...';
    if (gamePhase === 'listening') {
      const elementName = currentPhase === 'nirvighnam' ? 'rescue items' : 'animals';
      return `Click the ${elementName}! (${playerInput.length}/${currentSequence.length})`;
    }
    if (gamePhase === 'celebration') return 'Beautiful! Well done!';
    if (gamePhase === 'phase_complete') return 'Phase Complete!';
    return `Round ${currentRound} - ${currentPhase.toUpperCase()}`;
  };

  if (!isActive) return null;

  // Don't show Kurumedeva elements if power not gained
  const shouldShowElements = currentPhase === 'nirvighnam' || (currentPhase === 'kurumedeva' && powerGained);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 20
    }}>
      
      {/* ENHANCED: Progress indicator with better styling */}
      {!hideElements && (
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
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: '14px',
            color: currentPhase === 'nirvighnam' ? '#4CAF50' : '#FF9800',
            letterSpacing: '0.3px'
          }}>
            {currentPhase.toUpperCase()}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(currentPhase === 'nirvighnam' ? [1, 2] : [1, 2, 3]).map(round => (
              <div
                key={round}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: round <= currentRound 
                    ? (round < currentRound ? '#4CAF50' : (currentPhase === 'nirvighnam' ? '#4CAF50' : '#FF9800'))
                    : '#E0E0E0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: round <= currentRound ? 'white' : '#666',
                  boxShadow: round === currentRound ? `0 0 8px ${currentPhase === 'nirvighnam' ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255, 152, 0, 0.4)'}` : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {round}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ENHANCED: Round Selector - Horizontal below status bar */}
      {!hideElements && (gamePhase === 'waiting' || gamePhase === 'listening') && (
        <div style={{
          position: 'absolute',
          top: '70px',
          left: '20%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px',
          zIndex: 45
        }}>
          {(currentPhase === 'nirvighnam' ? [1, 2] : [1, 2, 3]).map(round => (
            <button 
              key={round} 
              onClick={() => jumpToRound(round)} 
              style={{
                fontSize: '14px', 
                padding: '8px 12px', 
                borderRadius: '10px',
                background: round === currentRound 
                  ? (currentPhase === 'nirvighnam' ? '#4CAF50' : '#FF9800')
                  : (currentPhase === 'nirvighnam' ? 'rgba(76, 175, 80, 0.7)' : 'rgba(255, 152, 0, 0.7)'), 
                color: 'white', 
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                minWidth: '44px',
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
      
      {/* Status message */}
      {!hideElements && gamePhase !== 'phase_complete' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20%',
          transform: 'translateX(-50%)',
          background: currentPhase === 'nirvighnam' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 152, 0, 0.9)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          zIndex: 50
        }}>
          {getStatusMessage()}
        </div>
      )}

      {/* Countdown */}
      {!hideElements && isCountingDown && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '100px',
          fontWeight: 'bold',
          color: currentPhase === 'nirvighnam' ? '#4CAF50' : '#FF9800',
          textShadow: `0 0 30px ${currentPhase === 'nirvighnam' ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255, 152, 0, 0.8)'}`,
          zIndex: 100,
          animation: 'countdownPulse 0.8s ease-in-out'
        }}>
          {countdown}
        </div>
      )}

      {/* Game elements */}
      {!hideElements && shouldShowElements && (
        <>
          {/* Initial visual elements - show before transformation */}
          {currentSequence.map((syllable, index) => 
            renderInitialVisual(syllable, index)
          )}
          
          {/* Singers - rescue items or animals with enhanced styling */}
          {currentSequence.map((syllable, index) => 
            renderSinger(syllable, index)
          )}
          
          {/* Visual rewards - animals in water + stones OR decorations on wall */}
          {currentSequence.map((syllable, index) => 
            renderVisualReward(syllable, index)
          )}
        </>
      )}

      {/* ENHANCED: CSS Animations with golden effects */}
      <style>{`
        @keyframes sing {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1.15); }
        }
        
        @keyframes nextToClick {
          0%, 100% { 
            filter: brightness(1.2) drop-shadow(0 0 8px #4CAF50);
          }
          50% { 
            filter: brightness(1.4) drop-shadow(0 0 15px #81C784);
          }
        }
        
        @keyframes gentleGlow {
          0%, 100% { 
            filter: brightness(1.1) saturate(1.1) drop-shadow(0 0 6px rgba(76, 175, 80, 0.4));
          }
          50% { 
            filter: brightness(1.2) saturate(1.2) drop-shadow(0 0 12px rgba(76, 175, 80, 0.6));
          }
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
        
        @keyframes crownFloat {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-3px); }
        }
        
        @keyframes countdownPulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
        }
        
        @keyframes musicNote {
          0% { transform: translateX(-50%) translateY(0); opacity: 0; }
          50% { transform: translateX(-50%) translateY(-10px); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        }
        
        @keyframes checkmarkAppear {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(0deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes rewardAppear {
          0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes rewardGlow {
          0%, 100% { 
            filter: brightness(1.3) saturate(1.4) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6));
          }
          50% { 
            filter: brightness(1.5) saturate(1.6) drop-shadow(0 0 25px rgba(255, 215, 0, 0.8));
          }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.5; transform: translateX(-50%) scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default SimplifiedNirvighnamKurumedevaGame;