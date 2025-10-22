// zones/shloka-river/core/AutoPlayMode.jsx
// Config-driven auto-play mode - Converted from SimplifiedMemoryGame.jsx
// Pattern: Elephants sing → Player clicks same elephants → Visual rewards transform

import React, { useState, useEffect, useRef } from 'react';
import { useSafeClick } from './hooks/useSafeClick';

const AutoPlayMode = ({
  // Config and assets
  gameConfig,           // ⭐ The game configuration object
  assetGetters,         // ⭐ Dynamic asset getters
  
  // Core props
  isActive = false,
  hideElements = false,
  powerGained = false,
  onPhaseComplete,
  onGameComplete,
  profileName = 'little explorer',
  
  // Components
  WaterSprayComponent,
  
  // Reload support
  isReload = false,
  savedGameState = null,
  onSaveGameState
}) => {

  console.log('AutoPlayMode render:', { 
    isActive, 
    hideElements,
    isReload,
    gameConfig: gameConfig?.id,
    powerGained
  });

  // 🛡️ Safety hook
  const { safeClick } = useSafeClick(300);

  // Core game state
  const [gamePhase, setGamePhase] = useState('waiting');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [canPlayerClick, setCanPlayerClick] = useState(false);
  const [singingSyllable, setSingingSyllable] = useState(null);
  
  // Visual state - handles both bud→lotus and seed→flower
  const [visualRewards, setVisualRewards] = useState({});
  const [activatedElephants, setActivatedElephants] = useState({});
  const [roundClicks, setRoundClicks] = useState({});
  
  // Animation state
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // ✅ FIX 2: Water spray state
  const [waterSprayPosition, setWaterSprayPosition] = useState(null);

  // Wait banner
  const [waitBannerMessage, setWaitBannerMessage] = useState('');
  const [showWaitBanner, setShowWaitBanner] = useState(false);
  
  // Refs for cleanup
  const timeoutsRef = useRef([]);
  const intervalsRef = useRef([]);
  const isComponentMountedRef = useRef(true);

  // Comprehensive timer cleanup
  const clearAllTimers = () => {
    console.log('🧹 Clearing all timers');
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

  // Cleanup on unmount
  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      console.log('🧹 AutoPlayMode: Component unmounting');
      isComponentMountedRef.current = false;
      clearAllTimers();
    };
  }, []);

  // Audio functions (config-driven)
  const playSyllableAudio = (syllable) => {
    try {
      const fileName = gameConfig.audio.syllableFileMap[syllable];
      if (!fileName) return;
      
      const audioPath = `${gameConfig.audio.syllableFolder}${fileName}.mp3`;
      const audio = new Audio(audioPath);
      audio.volume = 0.8;
      audio.play().catch(e => {
        console.log('Audio fallback:', e);
      });
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  // Get sequence for current round
  const getSequenceForRound = (round) => {
    return gameConfig.syllables[round] || [];
  };

  // Start new round
  const startNewRound = (roundNumber) => {
    const sequence = getSequenceForRound(roundNumber);
    setCurrentRound(roundNumber);
    setCurrentSequence(sequence);
    setPlayerInput([]);
    setRoundClicks({}); // Reset round clicks but keep permanent state
    setGamePhase('waiting');
    setCanPlayerClick(false);
    
    console.log(`Starting ${gameConfig.displayName} round ${roundNumber}:`, sequence);
    
    if (onSaveGameState) {
      onSaveGameState({
        gamePhase: 'waiting',
        currentRound: roundNumber,
        currentSequence: sequence,
        playerInput: [],
        visualRewards,
        activatedElephants,
        gameId: gameConfig.id
      });
    }
  };

  // Countdown system
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

  // Play sequence
  const playSequence = () => {
    if (currentSequence.length === 0) return;
    
    setIsSequencePlaying(true);
    setGamePhase('playing');
    setCanPlayerClick(false);
    setPlayerInput([]);
    setSingingSyllable(null);
    
    currentSequence.forEach((syllable, index) => {
      safeSetTimeout(() => {
        setSingingSyllable(syllable);
        playSyllableAudio(syllable);
        
        safeSetTimeout(() => {
          setSingingSyllable(null);
        }, 600);
        
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

  // Wait banner trigger
  const triggerWaitBanner = (message) => {
    setWaitBannerMessage(message);
    setShowWaitBanner(true);
    safeSetTimeout(() => setShowWaitBanner(false), 1500);
  };

  // 🛡️ Enhanced elephant click with safety
  const handleElephantClick = (syllableIndex) => {
    safeClick(() => {
      // Block during countdown
      if (isCountingDown) {
        triggerWaitBanner('Wait! Get ready... ⏰');
        return;
      }
      
      if (!canPlayerClick || isSequencePlaying) {
        triggerWaitBanner('Listen first! 👂');
        return;
      }
      
      const clickedSyllable = currentSequence[syllableIndex];
      if (!clickedSyllable) return;
      
      // Check if already clicked this round
      if (roundClicks[`elephant-${clickedSyllable}`]) {
        triggerWaitBanner('Already clicked! 🐘');
        return;
      }
      
      // Sequential clicking - must click in order
      const expectedIndex = playerInput.length;
      if (syllableIndex !== expectedIndex) {
        triggerWaitBanner('Click in order! 🎯');
        return;
      }
      
      console.log(`Clicked elephant: ${clickedSyllable}`);
      playSyllableAudio(clickedSyllable);

      // ✅ Water spray animation - ONLY for Scene 1 (vakratunda, mahakaya)
      if (gameConfig.id === 'vakratunda' || gameConfig.id === 'mahakaya') {
        const position = gameConfig.elements.clicker.positions[syllableIndex];
        setWaterSprayPosition({ left: position.left, top: position.top });
        safeSetTimeout(() => setWaterSprayPosition(null), 1000);
      }

      const newPlayerInput = [...playerInput, clickedSyllable];
      setPlayerInput(newPlayerInput);
      setRoundClicks(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
      setActivatedElephants(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));

      // Transform visual reward
      setVisualRewards(prev => ({ ...prev, [`visual-${clickedSyllable}`]: true }));
      
      if (newPlayerInput.length === currentSequence.length) {
        handleRoundSuccess();
      }
    });
  };

  // Round success
  const handleRoundSuccess = () => {
    setCanPlayerClick(false);
    setGamePhase('celebration');

    console.log(`Round ${currentRound} complete!`);

    safeSetTimeout(() => {
      // ⭐ DYNAMIC: Support 2-round and 3-round games
      const maxRound = Object.keys(gameConfig.syllables).length;
      if (currentRound < maxRound) {
        startNewRound(currentRound + 1);
      } else {
        handlePhaseComplete();
      }
    }, 2000);
  };

  // Phase complete
  const handlePhaseComplete = () => {
    setGamePhase('phase_complete');
    console.log(`${gameConfig.displayName} completed!`);
    
    if (onPhaseComplete) {
      onPhaseComplete(gameConfig.id);
    }
    
    if (onGameComplete) {
      onGameComplete();
    }
  };

  // ✅ BUG 7 FIX: Auto Mode ALWAYS starts from Round 1
  useEffect(() => {
    if (!isActive || !gameConfig) return;

    console.log('🎮 [Mode] Auto Mode initializing - ALWAYS starting from Round 1');

    // ✅ BUG 7: ALWAYS start fresh from Round 1 in Auto Mode
    // Don't restore saved round - auto mode plays full sequence every time
    startNewRound(1);
  }, [isActive, gameConfig]);

  // Auto-start countdown
  useEffect(() => {
    if (gamePhase === 'waiting' && currentSequence.length > 0 && !isCountingDown) {
      safeSetTimeout(() => {
        startCountdown();
      }, 1000);
    }
  }, [gamePhase, currentSequence, isCountingDown]);

  // Helper functions
  const isElephantSinging = (syllable) => singingSyllable === syllable;
  
  const isElephantClickable = (syllableIndex) => {
    if (!canPlayerClick) return false;
    return syllableIndex === playerInput.length;
  };
  
  const hasElephantBeenClicked = (syllableIndex) => {
    return syllableIndex < playerInput.length;
  };
  
  const isElephantActivated = (syllable) => {
    return activatedElephants[`elephant-${syllable}`];
  };
  
  const isVisualRewardActive = (syllable) => {
    return visualRewards[`visual-${syllable}`];
  };
  
  const isNextExpected = (syllableIndex) => {
    if (!canPlayerClick) return false;
    return syllableIndex === playerInput.length;
  };

  // Get positions from config
  const getPosition = (type, index) => {
    if (type === 'elephant') {
      return gameConfig.elements.clicker.positions[index];
    } else {
      return gameConfig.elements.singer.positions[index];
    }
  };

  // Render elephant
  const renderElephant = (syllable, index) => {
    const position = getPosition('elephant', index);
    const isSinging = isElephantSinging(syllable);
    const isClickable = isElephantClickable(index);
    const hasBeenClicked = hasElephantBeenClicked(index);
    const isActivated = isElephantActivated(syllable);
    const isNext = isNextExpected(index);
    
    let elephantStyle = {
      opacity: 1,
      transform: 'translate(-50%, -50%) scale(1)',
      transition: 'all 0.3s ease'
    };
    
    if (isSinging) {
      elephantStyle.transform = 'translate(-50%, -50%) scale(1.15)';
      elephantStyle.filter = 'brightness(1.4) drop-shadow(0 0 15px #FFD700)';
      elephantStyle.animation = 'sing 0.6s ease-in-out';
    } else if (isNext && !hasBeenClicked) {
      elephantStyle.filter = 'brightness(1.2) drop-shadow(0 0 8px #FF9800)';
      elephantStyle.animation = 'nextToClick 1.5s ease-in-out infinite';
    } else if (hasBeenClicked) {
      elephantStyle.opacity = 1;
      elephantStyle.filter = 'brightness(1.1) saturate(1.2)';
    } else if (isActivated && !hasBeenClicked) {
      elephantStyle.filter = 'brightness(1.1) saturate(1.1) drop-shadow(0 0 6px rgba(255, 183, 77, 0.4))';
      elephantStyle.animation = 'gentleGlow 3s ease-in-out infinite';
    } else if (!canPlayerClick) {
      elephantStyle.opacity = 0.6;
    }

    // ⭐ Handle both single assetGetter and assetGetters object patterns
    let getImage;
    if (gameConfig.elements.clicker.assetGetter) {
      // Pattern 1: Single getter function (vakratunda, mahakaya, etc.)
      const getterName = gameConfig.elements.clicker.assetGetter;
      getImage = assetGetters[getterName];
    } else if (gameConfig.elements.clicker.assetGetters) {
      // Pattern 2: Object with syllable mappings (nirvighnam, kurumedeva)
      const getterName = gameConfig.elements.clicker.assetGetters[syllable];
      getImage = assetGetters[getterName];
    }

    if (!getImage) {
      console.error('[Clicker] Asset getter not found for syllable:', syllable);
      return null;
    }

    return (
      <button
        key={`elephant-${syllable}`}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '120px',
          height: '120px',
          border: 'none',
          background: 'transparent',
          cursor: isClickable ? 'pointer' : 'default',
          zIndex: 20,
          borderRadius: '50%',
          ...elephantStyle
        }}
        onClick={() => handleElephantClick(index)}
        disabled={!isClickable}
      >
        <img
          src={getImage(index)}
          alt={`${gameConfig.elements.clicker.type} ${syllable}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        
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
        
        {isNext && !hasBeenClicked && (
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

        {/* ✅ "Tap Here!" hint - Simple version */}
        {isNext && !hasBeenClicked && (
          <div style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#FFD700',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            zIndex: 30,
            pointerEvents: 'none'
          }}>
            👆 Tap Here
          </div>
        )}

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
            👑
          </div>
        )}
        
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
            ? 'rgba(255, 183, 77, 0.9)'
            : `rgba(${gameConfig.theme.primaryColor.replace('#', '')}, 0.9)`,
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
            ✓
          </div>
        )}
      </button>
    );
  };

  // ✅ BUG 6 & 8 FIX: Render initial visual (bud/seed) - uses assetGetterInitial
  const renderInitialVisual = (syllable, index) => {
    const position = getPosition('visual', index);
    const isTransformed = isVisualRewardActive(syllable);

    if (isTransformed) return null;

    // ✅ BUG 6 & 8: Use assetGetterInitial for unrewarded state
    // ⭐ Handle both single assetGetterInitial and assetGetters object patterns
    let getImage;
    if (gameConfig.elements.singer.assetGetterInitial) {
      // Pattern 1: Single getter function (vakratunda, mahakaya, etc.)
      const getterName = gameConfig.elements.singer.assetGetterInitial;
      getImage = assetGetters[getterName];
    } else if (gameConfig.elements.singer.assetGetters) {
      // Pattern 2: Object with syllable mappings (nirvighnam, kurumedeva)
      const getterName = gameConfig.elements.singer.assetGetters[syllable];
      getImage = assetGetters[getterName];
    }

    if (!getImage) {
      console.warn(`[Visual] Initial asset getter not found for syllable: ${syllable}`);
      return null;
    }

    console.log(`[Visual] Rendering initial visual for ${syllable} (index ${index})`);

    return (
      <div
        key={`initial-${syllable}`}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '60px',
          height: '60px',
          zIndex: 10,
          transform: 'translate(-50%, -50%)',
          opacity: 0.7
        }}
      >
        <img
          src={getImage(index)}
          alt={`Initial ${syllable}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  };

  // ⭐ NEW: Render initial animals + plain stones for nirvighnam dual-reward system
  const renderDualInitials = (syllable, index) => {
    const isTransformed = isVisualRewardActive(syllable);
    if (isTransformed) return null;

    const rewards = gameConfig.elements.rewards;
    if (!rewards || !rewards.animals || !rewards.stones) {
      console.warn('[Dual Initials] Invalid dual reward config');
      return null;
    }

    // Render animal on plain stone (initial state)
    const clicker = gameConfig.elements.clicker;
    const animalPosition = clicker.positions[index];
    const animalGetterName = clicker.assetGetters[syllable];
    const getAnimalImage = assetGetters[animalGetterName];

    // Render plain stone underneath
    const stonePosition = rewards.stones.positionsInitial[index];
    const stoneGetterName = rewards.stones.assetGettersInitial[syllable];
    const getStoneImage = assetGetters[stoneGetterName];

    return (
      <React.Fragment key={`dual-initial-${syllable}`}>
        {/* Plain stone */}
        {getStoneImage && (
          <div
            style={{
              position: 'absolute',
              left: stonePosition.left,
              top: stonePosition.top,
              width: '60px',
              height: '60px',
              zIndex: 10,
              transform: 'translate(-50%, -50%)',
              opacity: 0.8
            }}
          >
            <img
              src={getStoneImage(index)}
              alt={`Stone ${syllable}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Animal on stone */}
        {getAnimalImage && (
          <div
            style={{
              position: 'absolute',
              left: animalPosition.left,
              top: animalPosition.top,
              width: '70px',
              height: '70px',
              zIndex: 11,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <img
              src={getAnimalImage(index)}
              alt={`Animal ${syllable}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        )}
      </React.Fragment>
    );
  };

  // ✅ BUG 6 & 8 FIX: Render visual reward (lotus/flower) - uses assetGetterReward
  const renderVisualReward = (syllable, index) => {
    const position = getPosition('visual', index);
    const isVisible = isVisualRewardActive(syllable);

    if (!isVisible) return null;

    // ✅ BUG 6 & 8: Use assetGetterReward for rewarded state
    // ⭐ Handle both single assetGetterReward and assetGetters object patterns
    let getImage;
    if (gameConfig.elements.singer.assetGetterReward) {
      // Pattern 1: Single getter function (vakratunda, mahakaya, etc.)
      const getterName = gameConfig.elements.singer.assetGetterReward;
      getImage = assetGetters[getterName];
    } else if (gameConfig.elements.singer.assetGetters) {
      // Pattern 2: Object with syllable mappings - for nirvighnam, this is the singer (rescue items)
      const getterName = gameConfig.elements.singer.assetGetters[syllable];
      getImage = assetGetters[getterName];
    }

    if (!getImage) {
      console.warn(`[Visual] Reward asset getter not found for syllable: ${syllable}`);
      return null;
    }

    console.log(`[Visual] Lotus bloomed for ${syllable}! (index ${index})`);

    return (
      <div
        key={`reward-${syllable}`}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '80px',
          height: '80px',
          zIndex: 15,
          animation: 'rewardAppear 1s ease-out, rewardGlow 2s ease-in-out infinite 1s',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <img
          src={getImage(index)}
          alt={`Reward ${syllable}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />

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
  };

  // ⭐ NEW: Render dual rewards for nirvighnam (animals move + stones transform)
  const renderDualRewards = (syllable, index) => {
    const isVisible = isVisualRewardActive(syllable);
    if (!isVisible) return null;

    const rewards = gameConfig.elements.rewards;
    if (!rewards || !rewards.animals || !rewards.stones) {
      console.warn('[Dual Rewards] Invalid dual reward config');
      return null;
    }

    // Render animal reward (frog/snail/turtle moves to water)
    const animalPosition = rewards.animals.positions[index];
    const animalGetterName = rewards.animals.assetGetters[syllable];
    const getAnimalImage = assetGetters[animalGetterName];

    // Render stone reward (stone transforms to colored version)
    const stonePosition = rewards.stones.positionsReward[index];
    const stoneGetterName = rewards.stones.assetGettersReward[syllable];
    const getStoneImage = assetGetters[stoneGetterName];

    return (
      <React.Fragment key={`dual-reward-${syllable}`}>
        {/* Animal in water */}
        {getAnimalImage && (
          <div
            style={{
              position: 'absolute',
              left: animalPosition.left,
              top: animalPosition.top,
              width: '80px',
              height: '80px',
              zIndex: 15,
              animation: 'rewardAppear 1s ease-out',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <img
              src={getAnimalImage(index)}
              alt={`Animal ${syllable}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              fontSize: '16px',
              animation: 'sparkle 2s ease-in-out infinite'
            }}>
              ✨
            </div>
          </div>
        )}

        {/* Colored stone */}
        {getStoneImage && (
          <div
            style={{
              position: 'absolute',
              left: stonePosition.left,
              top: stonePosition.top,
              width: '60px',
              height: '60px',
              zIndex: 12,
              animation: 'rewardAppear 1s ease-out, rewardGlow 2s ease-in-out infinite 1s',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <img
              src={getStoneImage(index)}
              alt={`Stone ${syllable}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        )}
      </React.Fragment>
    );
  };

  const getStatusMessage = () => {
    if (isCountingDown) return `Get Ready... ${countdown}`;
    if (gamePhase === 'playing') return 'Listen carefully...';
    if (gamePhase === 'listening') return `Click the elephants! (${playerInput.length}/${currentSequence.length})`;
    if (gamePhase === 'celebration') return 'Beautiful! Well done!';
    if (gamePhase === 'phase_complete') return 'Phase Complete!';
    return `Round ${currentRound} - ${gameConfig.displayName.toUpperCase()}`;
  };

  if (!isActive || !gameConfig) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 20
    }}>
      
      {/* Progress indicator */}
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
          transition: 'all 0.3s ease'
        }}>
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: '14px',
            color: gameConfig.theme.primaryColor,
            letterSpacing: '0.3px'
          }}>
            {gameConfig.displayName.toUpperCase()}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3].map(round => (
              <div
                key={round}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: round <= currentRound 
                    ? (round < currentRound ? '#4CAF50' : gameConfig.theme.primaryColor)
                    : '#E0E0E0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: round <= currentRound ? 'white' : '#666',
                  boxShadow: round === currentRound ? `0 0 8px ${gameConfig.theme.primaryColor}40` : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {round}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Status message */}
      {!hideElements && gamePhase !== 'phase_complete' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20%',
          transform: 'translateX(-50%)',
          background: `${gameConfig.theme.primaryColor}E6`,
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
          color: gameConfig.theme.primaryColor,
          textShadow: `0 0 30px ${gameConfig.theme.primaryColor}80`,
          zIndex: 100,
          animation: 'countdownPulse 0.8s ease-in-out'
        }}>
          {countdown}
        </div>
      )}

      {/* Wait Banner */}
      {!hideElements && showWaitBanner && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 152, 0, 0.95)',
          color: 'white',
          padding: '20px 40px',
          borderRadius: '20px',
          fontSize: '18px',
          fontWeight: 'bold',
          zIndex: 100,
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          animation: 'fadeInOut 1.5s ease-in-out'
        }}>
          {waitBannerMessage}
        </div>
      )}

      {/* ✅ FIX 2: Water Spray Animation */}
      {!hideElements && waterSprayPosition && (
        <div style={{
          position: 'absolute',
          left: waterSprayPosition.left,
          top: waterSprayPosition.top,
          transform: 'translate(-50%, -100%)',
          fontSize: '48px',
          animation: 'waterSplash 1s ease-out',
          zIndex: 100,
          pointerEvents: 'none'
        }}>
          💦
        </div>
      )}

      {/* Game elements */}
      {!hideElements && (
        <>
          {/* ⭐ Check if dual-reward system (nirvighnam) or regular system */}
          {gameConfig.elements.rewards?.animals && gameConfig.elements.rewards?.stones ? (
            <>
              {/* Dual-reward system: animals on stones initially, then animals move + stones transform */}
              {currentSequence.map((syllable, index) =>
                renderDualInitials(syllable, index)
              )}
              {currentSequence.map((syllable, index) =>
                renderElephant(syllable, index)
              )}
              {currentSequence.map((syllable, index) =>
                renderDualRewards(syllable, index)
              )}
            </>
          ) : (
            <>
              {/* Regular system: buds → lotus or seeds → flowers */}
              {currentSequence.map((syllable, index) =>
                renderInitialVisual(syllable, index)
              )}
              {currentSequence.map((syllable, index) =>
                renderElephant(syllable, index)
              )}
              {currentSequence.map((syllable, index) =>
                renderVisualReward(syllable, index)
              )}
            </>
          )}
        </>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
        
        @keyframes sing {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1.15); }
        }
        
        @keyframes nextToClick {
          0%, 100% { filter: brightness(1.2) drop-shadow(0 0 8px #FF9800); }
          50% { filter: brightness(1.4) drop-shadow(0 0 15px #FFB74D); }
        }
        
        @keyframes gentleGlow {
          0%, 100% { filter: brightness(1.1) saturate(1.1) drop-shadow(0 0 6px rgba(255, 183, 77, 0.4)); }
          50% { filter: brightness(1.2) saturate(1.2) drop-shadow(0 0 12px rgba(255, 183, 77, 0.6)); }
        }
        
        @keyframes goldenPulse {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
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
          0%, 100% { filter: brightness(1.3) saturate(1.4) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6)); }
          50% { filter: brightness(1.5) saturate(1.6) drop-shadow(0 0 25px rgba(255, 215, 0, 0.8)); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.5; transform: translateX(-50%) scale(1.2); }
        }

        /* ✅ Water splash animation */
        @keyframes waterSplash {
          0% { transform: translate(-50%, -100%) scale(0.5); opacity: 1; }
          50% { transform: translate(-50%, -150%) scale(1.2); opacity: 0.8; }
          100% { transform: translate(-50%, -200%) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AutoPlayMode;