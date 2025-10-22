// zones/shloka-river/core/ManualRoundMode.jsx
// Manual round selection mode - FIXED VERSION
// ✅ BUG 1: Added exit options (Finish & Return, Hear Full Mantra)
// ✅ BUG 2: Removed redundant "Play Round X" button
// ✅ BUG 3: Lock rounds during ALL gameplay phases
// ✅ BUG 4: Added circle highlight from Auto mode
// ✅ BUG 5: Direct start after round selection

import React, { useState, useEffect, useRef } from 'react';
import { useSafeClick } from './hooks/useSafeClick';

const ManualRoundMode = ({
  gameConfig,
  assetGetters,
  isActive,
  hideElements,
  powerGained,
  profileName,
  WaterSprayComponent,
  onSaveGameState,
  onPhaseComplete,
  onGameComplete,
  onSwitchToAuto, // NEW: callback to switch to auto mode
  isReload,
  savedGameState
}) => {

  const { safeClick } = useSafeClick(300);

  // State
  const [gameState, setGameState] = useState('roundSelection');
  const [selectedRound, setSelectedRound] = useState(null);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [singingSyllable, setSingingSyllable] = useState(null);
  const [visualRewards, setVisualRewards] = useState({});
  const [activatedElephants, setActivatedElephants] = useState({});
  const [roundClicks, setRoundClicks] = useState({});
  const [completedRounds, setCompletedRounds] = useState([]);
  const [learnedSyllables, setLearnedSyllables] = useState([]);

  // ✅ FIX 1: Countdown state (like Auto mode)
  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // ✅ FIX 2: Water spray state
  const [waterSprayPosition, setWaterSprayPosition] = useState(null);

  const timeoutsRef = useRef([]);
  const intervalsRef = useRef([]);
  const isComponentMountedRef = useRef(true);

  const safeSetTimeout = (callback, delay) => {
    const timeout = setTimeout(() => {
      if (isComponentMountedRef.current) callback();
    }, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  const safeSetInterval = (callback, delay) => {
    const interval = setInterval(() => {
      if (isComponentMountedRef.current) callback();
    }, delay);
    intervalsRef.current.push(interval);
    return interval;
  };

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
      timeoutsRef.current.forEach(t => clearTimeout(t));
      intervalsRef.current.forEach(i => clearInterval(i));
    };
  }, []);

  // Console logging
  console.log('[Mode] Manual Round Mode active');
  console.log('[Round] Selected round:', selectedRound);
  console.log('[Phase] Current phase:', gameState);
  console.log('[Visual] Learned syllables:', learnedSyllables);

  // Audio
  const playSyllableAudio = (syllable) => {
    try {
      const fileName = gameConfig.audio.syllableFileMap[syllable];
      if (!fileName) return;

      const audioPath = `${gameConfig.audio.syllableFolder}${fileName}.mp3`;
      const audio = new Audio(audioPath);
      audio.volume = 0.8;
      audio.play().catch(() => {});
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  // ✅ FIX 1: Countdown system (like Auto mode)
  const startCountdown = (sequence) => {
    setIsCountingDown(true);
    setCountdown(3);
    setGameState('countdown');

    const countdownInterval = safeSetInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          playSequence(sequence);
          return 0;
        }
        return prev - 1;
      });
    }, 800);
  };

  // ✅ FIX 1: Start with countdown after round selection
  const handleRoundSelect = (round) => {
    safeClick(() => {
      // ✅ BUG 3 FIX: Don't allow switching during ANY active gameplay
      if (gameState !== 'roundSelection') {
        console.log('⏸️ Finish current round first!');
        return;
      }

      console.log(`[Round] Starting round: ${round}`);
      setSelectedRound(round);

      const sequence = gameConfig.syllables[round] || [];
      setCurrentSequence(sequence);
      setPlayerInput([]);
      setRoundClicks({});

      // ✅ FIX 1: Start with countdown (3-2-1)
      safeSetTimeout(() => {
        startCountdown(sequence);
      }, 500);

      if (onSaveGameState) {
        onSaveGameState({
          currentRound: round,
          gameMode: 'manual',
          gameId: gameConfig.id
        });
      }
    });
  };

  // Play sequence
  const playSequence = (sequence) => {
    setIsSequencePlaying(true);
    setGameState('playing');
    setPlayerInput([]);
    setRoundClicks({});
    setSingingSyllable(null);

    sequence.forEach((syllable, index) => {
      safeSetTimeout(() => {
        setSingingSyllable(syllable);
        playSyllableAudio(syllable);

        safeSetTimeout(() => {
          setSingingSyllable(null);
        }, 600);

        if (index === sequence.length - 1) {
          safeSetTimeout(() => {
            setIsSequencePlaying(false);
            setGameState('listening');
          }, 800);
        }
      }, index * 1200);
    });
  };

  // Elephant click
  const handleElephantClick = (syllableIndex) => {
    safeClick(() => {
      if (gameState !== 'listening' || isSequencePlaying) return;

      const clickedSyllable = currentSequence[syllableIndex];
      if (!clickedSyllable) return;

      if (roundClicks[`elephant-${clickedSyllable}`]) return;

      const expectedIndex = playerInput.length;
      if (syllableIndex !== expectedIndex) return;

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
      setVisualRewards(prev => ({ ...prev, [`visual-${clickedSyllable}`]: true }));

      // Track learned syllables
      if (!learnedSyllables.includes(clickedSyllable)) {
        setLearnedSyllables(prev => [...prev, clickedSyllable]);
      }

      if (newPlayerInput.length === currentSequence.length) {
        handleRoundSuccess();
      }
    });
  };

  // Round success
  const handleRoundSuccess = () => {
    setGameState('success');

    // Track completed round
    if (!completedRounds.includes(selectedRound)) {
      setCompletedRounds(prev => [...prev, selectedRound]);
    }

    console.log(`[Round] Round ${selectedRound} complete!`);

    safeSetTimeout(() => {
      setGameState('roundSelection');
      setSelectedRound(null);
      setPlayerInput([]);
      setRoundClicks({});
    }, 2500);
  };

  // ✅ BUG 3 FIX: Finish & Return button handler - works even with 0 rounds completed
  const handleFinishGame = () => {
    console.log('[Mode] Finishing game with learned syllables:', learnedSyllables);

    // Always trigger phase complete to return to scene, regardless of rounds completed
    if (onPhaseComplete) {
      onPhaseComplete(gameConfig.id);
    } else if (onGameComplete) {
      onGameComplete();
    }
  };

  // ✅ BUG 1 FIX: Hear Full Mantra button handler
  const handleSwitchToAutoMode = () => {
    console.log('[Mode] Switching to Auto Mode from Manual');

    if (onSwitchToAuto) {
      onSwitchToAuto({
        learnedSyllables,
        visualRewards,
        activatedElephants
      });
    }
  };

  // Render elephant with ✅ BUG 4 FIX: Added circle highlight
  const renderElephant = (syllable, index) => {
    const position = gameConfig.elements.clicker.positions[index];

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

    const clickable = gameState === 'listening' && !isSequencePlaying && index === playerInput.length;
    const clicked = index < playerInput.length;
    const isSinging = singingSyllable === syllable;
    const isNext = clickable;

    return (
      <button
        key={`clicker-${syllable}-${index}`}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: '120px',
          height: '120px',
          border: 'none',
          background: 'transparent',
          cursor: clickable ? 'pointer' : 'default',
          opacity: clickable ? 1 : 0.7,
          transition: 'all 0.3s ease',
          zIndex: 20,
          filter: isSinging ? 'brightness(1.4)' : 'brightness(1)',
          transform: isSinging ? 'scale(1.1)' : 'scale(1)'
        }}
        onClick={() => handleElephantClick(index)}
        disabled={!clickable}
      >
        {getImage && (
          <img
            src={getImage(index)}
            alt={`${gameConfig.elements.clicker.type} ${syllable}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}

        {/* ✅ BUG 4 FIX: Golden pulse circle highlight (from Auto mode) */}
        {isNext && !clicked && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '85%',
            height: '85%',
            border: '3px solid #FFD700',
            borderRadius: '50%',
            animation: 'goldenPulse 2s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: -1
          }} />
        )}

        {/* ✅ "Tap Here!" hint - Simple version */}
        {isNext && !clicked && (
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

        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: clicked ? '#4CAF50' : clickable ? '#FF9800' : '#999',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {syllable.toUpperCase()}
        </div>
      </button>
    );
  };

  // ✅ BUG 6 & 8 FIX: Render singer with proper initial vs reward state
  const renderSinger = (syllable, index) => {
    // ⭐ Check if singer element exists (nirvighnam doesn't have singer, only clicker + dual rewards)
    if (!gameConfig.elements.singer || !gameConfig.elements.singer.positions) {
      return null;
    }

    // ⭐ Check for different positions (kurumedeva has positionsReward for rewards)
    let position;
    const isReward = visualRewards[`visual-${syllable}`];
    if (isReward && gameConfig.elements.singer.positionsReward) {
      position = gameConfig.elements.singer.positionsReward[index];
    } else {
      position = gameConfig.elements.singer.positions[index];
    }

    const isSinging = singingSyllable === syllable;

    // ✅ BUG 6 & 8: Use different getter based on reward state
    // ⭐ Handle multiple patterns for asset getters
    let getImage;
    if (isReward) {
      if (gameConfig.elements.singer.assetGetterReward) {
        // Pattern 1: Single getter function
        const getterName = gameConfig.elements.singer.assetGetterReward;
        getImage = assetGetters[getterName];
      } else if (gameConfig.elements.singer.assetGettersReward) {
        // Pattern 2: assetGettersReward object (kurumedeva)
        const getterName = gameConfig.elements.singer.assetGettersReward[syllable];
        getImage = assetGetters[getterName];
      } else if (gameConfig.elements.singer.assetGetters) {
        // Pattern 3: assetGetters object (compatibility)
        const getterName = gameConfig.elements.singer.assetGetters[syllable];
        getImage = assetGetters[getterName];
      }
    } else {
      if (gameConfig.elements.singer.assetGetterInitial) {
        // Pattern 1: Single getter function
        const getterName = gameConfig.elements.singer.assetGetterInitial;
        getImage = assetGetters[getterName];
      } else if (gameConfig.elements.singer.assetGettersInitial) {
        // Pattern 2: assetGettersInitial object (kurumedeva)
        const getterName = gameConfig.elements.singer.assetGettersInitial[syllable];
        getImage = assetGetters[getterName];
      } else if (gameConfig.elements.singer.assetGetters) {
        // Pattern 3: assetGetters object (compatibility)
        const getterName = gameConfig.elements.singer.assetGetters[syllable];
        getImage = assetGetters[getterName];
      }
    }

    if (!getImage) {
      console.warn(`[Visual] Asset getter not found for syllable: ${syllable}`);
      return null;
    }

    return (
      <div
        key={`singer-${syllable}-${index}`}
        style={{
          position: 'absolute',
          left: position.left,
          top: position.top,
          width: isReward ? '80px' : '60px',
          height: isReward ? '80px' : '60px',
          transition: 'all 0.3s ease',
          zIndex: 10,
          transform: 'translate(-50%, -50%)',
          filter: isSinging ? 'brightness(1.6)' : isReward ? 'brightness(1.3)' : 'brightness(0.8)',
          opacity: isReward ? 1 : 0.7
        }}
      >
        <img
          src={getImage(index)}
          alt={`${gameConfig.elements.singer.type} ${syllable}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
        {isReward && (
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '18px'
          }}>
            ✨
          </div>
        )}
      </div>
    );
  };

  // ⭐ NEW: Render initial animals + plain stones for nirvighnam dual-reward system
  const renderDualInitials = (syllable, index) => {
    const isTransformed = visualRewards[`visual-${syllable}`];
    if (isTransformed) return null;

    const rewards = gameConfig.elements.rewards;
    if (!rewards || !rewards.animals || !rewards.stones) {
      console.warn('[Dual Initials] Invalid dual reward config');
      return null;
    }

    // Animals at stone positions initially (sitting on stones)
    const stonePosition = rewards.stones.positionsInitial[index];
    const animalGetterName = rewards.animals.assetGetters[syllable];
    const getAnimalImage = assetGetters[animalGetterName];

    // Plain stone underneath
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
              left: stonePosition.left,
              top: stonePosition.top,
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

  // ⭐ NEW: Render dual rewards for nirvighnam (animals move + stones transform)
  const renderDualRewards = (syllable, index) => {
    const isVisible = visualRewards[`visual-${syllable}`];
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
              animation: 'rewardAppear 1s ease-out',
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

  if (!isActive || !gameConfig) return null;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20 }}>

      {/* ✅ BUG 1 FIX: Round Selection with EXIT OPTIONS */}
      {!hideElements && gameState === 'roundSelection' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'white',
            borderRadius: '30px',
            padding: '40px',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 25px 70px rgba(0,0,0,0.4)'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: gameConfig.theme.primaryColor,
              marginBottom: '20px'
            }}>
              Choose Round:
            </h2>

            {/* Round Buttons */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px' }}>
              {/* ⭐ DYNAMIC: Support 2-round and 3-round games */}
              {Array.from({ length: Object.keys(gameConfig.syllables).length }, (_, i) => i + 1).map(round => (
                <button
                  key={round}
                  onClick={() => handleRoundSelect(round)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '15px',
                    border: completedRounds.includes(round)
                      ? '3px solid #4CAF50'
                      : `2px solid ${gameConfig.theme.primaryColor}`,
                    background: completedRounds.includes(round)
                      ? '#4CAF50'
                      : 'white',
                    color: completedRounds.includes(round) ? 'white' : gameConfig.theme.primaryColor,
                    fontSize: '32px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {completedRounds.includes(round) ? '✓' : round}
                </button>
              ))}
            </div>

            {/* ✅ BUG 1 FIX: EXIT OPTIONS - ALWAYS VISIBLE */}
            <div style={{
              borderTop: '2px solid #E0E0E0',
              paddingTop: '25px',
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <button
                className="btn-finish primary"
                onClick={handleFinishGame}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  color: 'white',
                  fontSize: '17px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                  minHeight: '60px'
                }}
              >
                🏁 Finish & Return
                <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                  Save progress and return to scene
                </div>
              </button>

              <button
                className="btn-auto-mode secondary"
                onClick={handleSwitchToAutoMode}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  border: 'none',
                  borderRadius: '15px',
                  color: 'white',
                  fontSize: '17px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
                  minHeight: '60px'
                }}
              >
                🎵 Hear Full Mantra
                <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                  Switch to Auto Play from Round 1
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ BUG 2 & 5 FIX: Removed "Play Round X" intermediate button */}

      {/* ✅ FIX 1: Countdown Display (like Auto mode) */}
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

      {/* Status Message */}
      {!hideElements && gameState !== 'roundSelection' && gameState !== 'countdown' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: gameState === 'playing'
            ? 'rgba(33, 150, 243, 0.95)'
            : gameState === 'success'
            ? 'rgba(76, 175, 80, 0.95)'
            : 'rgba(255, 152, 0, 0.95)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '25px',
          fontSize: '15px',
          fontWeight: 'bold',
          zIndex: 50
        }}>
          {gameState === 'playing' && `Round ${selectedRound}: Listen carefully...`}
          {gameState === 'listening' && `Click to repeat! (${playerInput.length}/${currentSequence.length})`}
          {gameState === 'success' && '✨ Perfect! Choose another round!'}
        </div>
      )}

      {/* Game Elements */}
      {!hideElements && gameState !== 'roundSelection' && (
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
              {/* Regular system: buds → lotus or seeds → flowers or items → decorations */}
              {currentSequence.map((syllable, index) => renderSinger(syllable, index))}
              {currentSequence.map((syllable, index) => renderElephant(syllable, index))}
            </>
          )}
        </>
      )}

      <style>{`
        /* ✅ BUG 4 FIX: Golden pulse animation from Auto mode */
        @keyframes goldenPulse {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }

        /* ✅ FIX 1: Countdown pulse animation */
        @keyframes countdownPulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
        }

        /* ✅ FIX 2: Water splash animation */
        @keyframes waterSplash {
          0% { transform: translate(-50%, -100%) scale(0.5); opacity: 1; }
          50% { transform: translate(-50%, -150%) scale(1.2); opacity: 0.8; }
          100% { transform: translate(-50%, -200%) scale(1.5); opacity: 0; }
        }

        /* ⭐ Dual-reward animations */
        @keyframes rewardAppear {
          0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default ManualRoundMode;
