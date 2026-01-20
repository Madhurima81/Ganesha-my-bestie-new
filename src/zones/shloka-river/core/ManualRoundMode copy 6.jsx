// zones/shloka-river/core/ManualRoundMode.jsx
// FIXED: Reload only auto-starts if game was explicitly in an active state.

import React, { useState, useEffect, useRef } from 'react';
import { useSafeClick } from './hooks/useSafeClick';

import UniversalPauseButton from './UniversalPauseButton';
import PauseModal from './PauseModal';

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
  onSwitchToAuto,
  isReload,
  savedGameState,
  onExit // Added onExit prop to pass up to Engine
}) => {

  const { safeClick } = useSafeClick(300);

// ⭐ INITIALIZATION
const [gameState, setGameState] = useState('roundSelection');
const [selectedRound, setSelectedRound] = useState(null);
const [currentSequence, setCurrentSequence] = useState([]);
  
  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [singingSyllable, setSingingSyllable] = useState(null);
  
  // Progress State
  const [visualRewards, setVisualRewards] = useState({});
  const [activatedElephants, setActivatedElephants] = useState({});
  const [roundClicks, setRoundClicks] = useState({});
  const [completedRounds, setCompletedRounds] = useState([]);
  const [learnedSyllables, setLearnedSyllables] = useState([]);

  const [countdown, setCountdown] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [waterSprayPosition, setWaterSprayPosition] = useState(null);
  const [showPauseModal, setShowPauseModal] = useState(false);

  const timeoutsRef = useRef([]);
  const intervalsRef = useRef([]);
  const isComponentMountedRef = useRef(true);

 // ⭐ RESTORE PROGRESS & TRIGGER RELOAD
  useEffect(() => {
    if (savedGameState) {
      console.log('📦 [Manual] Restoring progress:', savedGameState);
      
      // Always restore checkmarks/crowns
      if (savedGameState.completedRounds) setCompletedRounds(savedGameState.completedRounds);
      if (savedGameState.learnedSyllables) setLearnedSyllables(savedGameState.learnedSyllables);
      if (savedGameState.visualRewards) setVisualRewards(savedGameState.visualRewards);
      if (savedGameState.activatedElephants) setActivatedElephants(savedGameState.activatedElephants);

      // ⭐ Only trigger gameplay restart if we were ACTUALLY playing
      const wasPlayingRound = 
        isReload &&
        savedGameState.currentRound &&
        savedGameState.gameMode === 'manual' &&
        (savedGameState.gameState === 'playing' || 
         savedGameState.gameState === 'listening' ||
         savedGameState.gameState === 'countdown') &&
        !savedGameState.completedRounds?.includes(savedGameState.currentRound);

      if (wasPlayingRound) {
        console.log('🔄 [Manual] Reloading directly into round:', savedGameState.currentRound);
        setSelectedRound(savedGameState.currentRound);
        setPlayerInput([]);
        setRoundClicks({});

        safeSetTimeout(() => {
          startCountdown(gameConfig.syllables[savedGameState.currentRound]);
        }, 500);
      } else {
        // Not mid-round - show menu
        console.log('📋 [Manual] Showing round selection menu');
        setGameState('roundSelection');
        setSelectedRound(null);
      }
    }
  }, [savedGameState, isReload]);

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

  useEffect(() => {
    if (showPauseModal) {
      clearAllTimers();
    }
  }, [showPauseModal]);

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

  const clearAllTimers = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    intervalsRef.current.forEach(i => clearInterval(i));
    timeoutsRef.current = [];
    intervalsRef.current = [];
  };

  const handleRoundSelect = (round) => {
    safeClick(() => {
      if (gameState !== 'roundSelection') return;
      setSelectedRound(round);
    });
  };

  const handleStartRound = () => {
    safeClick(() => {
      if (!selectedRound) return;
      const sequence = gameConfig.syllables[selectedRound] || [];
      setCurrentSequence(sequence);
      setPlayerInput([]);
      setRoundClicks({});
      
      safeSetTimeout(() => {
        startCountdown(sequence);
      }, 500);

      if (onSaveGameState) {
        onSaveGameState({
          currentRound: selectedRound,
          gameMode: 'manual',
          gameId: gameConfig.id,
          gameState: 'playing', // Explicitly set active state
          completedRounds,
          learnedSyllables,
          visualRewards,
          activatedElephants
        });
      }
    });
  };

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
        safeSetTimeout(() => { setSingingSyllable(null); }, 600);
        if (index === sequence.length - 1) {
          safeSetTimeout(() => {
            setIsSequencePlaying(false);
            setGameState('listening');
          }, 800);
        }
      }, index * 1200);
    });
  };

  const handleElephantClick = (syllableIndex) => {
    safeClick(() => {
      if (gameState !== 'listening' || isSequencePlaying) return;
      const clickedSyllable = currentSequence[syllableIndex];
      if (!clickedSyllable) return;
      if (roundClicks[`elephant-${clickedSyllable}`]) return;
      const expectedIndex = playerInput.length;
      if (syllableIndex !== expectedIndex) return;

      playSyllableAudio(clickedSyllable);

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

      if (!learnedSyllables.includes(clickedSyllable)) {
        setLearnedSyllables(prev => [...prev, clickedSyllable]);
      }

      if (newPlayerInput.length === currentSequence.length) {
        handleRoundSuccess();
      }
    });
  };

  const handleRoundSuccess = () => {
    setGameState('success');

    let newCompletedRounds = completedRounds;
    if (!completedRounds.includes(selectedRound)) {
      newCompletedRounds = [...completedRounds, selectedRound];
      setCompletedRounds(newCompletedRounds);
    }

    if (onSaveGameState) {
      onSaveGameState({
        gameMode: 'manual',
        gameId: gameConfig.id,
        gameState: 'success', 
        completedRounds: newCompletedRounds,
        learnedSyllables,
        visualRewards,
        activatedElephants
      });
    }

    safeSetTimeout(() => {
      setWaterSprayPosition(null);
      setGameState('roundSelection');
      setSelectedRound(null);
      setPlayerInput([]);
      setRoundClicks({});
      
      // Save return to menu
      if (onSaveGameState) {
        console.log('💾 [Manual] Returning to menu (Success) - Updating save');
        onSaveGameState({
          gameMode: 'manual',
          gameId: gameConfig.id,
          gameState: 'roundSelection',
          currentRound: null,
          completedRounds: newCompletedRounds,
          learnedSyllables,
          visualRewards,
          activatedElephants
        });
      }
    }, 2500);
  };

  const handleFinishGame = () => {
    if (onPhaseComplete) {
      onPhaseComplete(gameConfig.id);
    } else if (onGameComplete) {
      onGameComplete();
    }
  };

  const handleSwitchToAutoMode = () => {
    if (onSwitchToAuto) {
      onSwitchToAuto({
        learnedSyllables,
        visualRewards,
        activatedElephants,
        completedRounds
      });
    }
  };

  const handlePause = () => {
    setShowPauseModal(true);
  };

  const handleContinue = () => {
    setShowPauseModal(false);
    if (gameState === 'countdown') {
      startCountdown(currentSequence);
    } else if (gameState === 'playing') {
      playSequence(currentSequence);
    } else if (gameState === 'success') {
      safeSetTimeout(() => {
        setGameState('roundSelection');
        setSelectedRound(null);
        setPlayerInput([]);
        setRoundClicks({});
      }, 500);
    }
  };

  const handleExitToMenu = () => {
    setShowPauseModal(false);
    clearAllTimers();
    setIsCountingDown(false);
    setCountdown(0);
    setWaterSprayPosition(null);

    // Reset local state
    setGameState('roundSelection');
    setSelectedRound(null);
    setPlayerInput([]);
    setRoundClicks({});
    setSingingSyllable(null);
    setIsSequencePlaying(false);

    // ⭐ KEY CHANGE: Only use onExit callback to trigger Engine's exit handler.
    // This prevents race conditions between Manual saving 'roundSelection' 
    // and Engine saving 'roundSelection'.
    if (onExit) {
      onExit();
    } else if (onPhaseComplete) {
      // Fallback if onExit not provided
      onPhaseComplete({ isEarlyExit: true });
    }
  };

  const renderElephant = (syllable, index) => {
    const position = gameConfig.elements.clicker.positions[index];
    let getImage;
    if (gameConfig.elements.clicker.assetGetter) {
      getImage = assetGetters[gameConfig.elements.clicker.assetGetter];
    } else if (gameConfig.elements.clicker.assetGetters) {
      getImage = assetGetters[gameConfig.elements.clicker.assetGetters[syllable]];
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
          width: '120px', height: '120px',
          border: 'none', background: 'transparent',
          cursor: clickable ? 'pointer' : 'default',
          zIndex: 20, borderRadius: '50%',
          opacity: clickable ? 1 : 0.7,
          transition: 'all 0.3s ease',
          filter: isSinging ? 'brightness(1.4)' : 'brightness(1)',
          transform: isSinging ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%) scale(1)'
        }}
        onClick={() => handleElephantClick(index)}
        disabled={!clickable}
      >
        {getImage && <img src={getImage(index)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
        {activatedElephants[`elephant-${syllable}`] && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '24px', animation: 'crownFloat 2s infinite', zIndex: 10 }}>👑</div>}
        {isNext && !clicked && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '85%', height: '85%', border: '3px solid #FFD700', borderRadius: '50%', animation: 'goldenPulse 2s infinite', zIndex: -1 }} />}
        {isNext && !clicked && <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', background: '#FFD700', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', zIndex: 30 }}>👆 Tap Here</div>}
        <div style={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', background: clicked ? '#4CAF50' : clickable ? '#FF9800' : '#999', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{syllable.toUpperCase()}</div>
      </button>
    );
  };

  const renderSinger = (syllable, index) => {
    if (!gameConfig.elements.singer?.positions) return null;
    let position;
    const isReward = visualRewards[`visual-${syllable}`];
    position = (isReward && gameConfig.elements.singer.positionsReward) ? gameConfig.elements.singer.positionsReward[index] : gameConfig.elements.singer.positions[index];
    const isSinging = singingSyllable === syllable;
    let getImage;
    if (isReward) {
        if (gameConfig.elements.singer.assetGetterReward) getImage = assetGetters[gameConfig.elements.singer.assetGetterReward];
        else if (gameConfig.elements.singer.assetGettersReward) getImage = assetGetters[gameConfig.elements.singer.assetGettersReward[syllable]];
    } else {
        if (gameConfig.elements.singer.assetGetterInitial) getImage = assetGetters[gameConfig.elements.singer.assetGetterInitial];
        else if (gameConfig.elements.singer.assetGettersInitial) getImage = assetGetters[gameConfig.elements.singer.assetGettersInitial[syllable]];
    }
    if (!getImage) return null;

    return (
      <div key={`singer-${syllable}-${index}`} style={{ position: 'absolute', left: position.left, top: position.top, width: isReward ? '80px' : '60px', height: isReward ? '80px' : '60px', transition: 'all 0.3s ease', zIndex: 10, transform: 'translate(-50%, -50%)', filter: isSinging ? 'brightness(1.6)' : isReward ? 'brightness(1.3)' : 'brightness(0.8)', opacity: isReward ? 1 : 0.7 }}>
        <img src={getImage(index)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        {isReward && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '18px' }}>✨</div>}
      </div>
    );
  };

  const renderDualInitials = (syllable, index) => {
    if (visualRewards[`visual-${syllable}`]) return null;
    if (!gameConfig.elements.rewards?.animals) return null;
    const stonePos = gameConfig.elements.rewards.stones.positionsInitial[index];
    const getStone = assetGetters[gameConfig.elements.rewards.stones.assetGettersInitial[syllable]];
    const getAnimal = assetGetters[gameConfig.elements.rewards.animals.assetGetters[syllable]];
    return (
      <React.Fragment key={`dual-init-${syllable}`}>
        {getStone && <div style={{ position: 'absolute', left: stonePos.left, top: stonePos.top, width: '60px', height: '60px', zIndex: 10, transform: 'translate(-50%, -50%)', opacity: 0.8 }}><img src={getStone(index)} style={{ width: '100%' }} /></div>}
        {getAnimal && <div style={{ position: 'absolute', left: stonePos.left, top: stonePos.top, width: '70px', height: '70px', zIndex: 11, transform: 'translate(-50%, -50%)' }}><img src={getAnimal(index)} style={{ width: '100%' }} /></div>}
      </React.Fragment>
    );
  };

  const renderDualRewards = (syllable, index) => {
    if (!visualRewards[`visual-${syllable}`]) return null;
    if (!gameConfig.elements.rewards?.animals) return null;
    const animalPos = gameConfig.elements.rewards.animals.positions[index];
    const getAnimal = assetGetters[gameConfig.elements.rewards.animals.assetGetters[syllable]];
    const stonePos = gameConfig.elements.rewards.stones.positionsReward[index];
    const getStone = assetGetters[gameConfig.elements.rewards.stones.assetGettersReward[syllable]];
    return (
      <React.Fragment key={`dual-rew-${syllable}`}>
        {getAnimal && <div style={{ position: 'absolute', left: animalPos.left, top: animalPos.top, width: '80px', height: '80px', zIndex: 15, animation: 'rewardAppear 1s', transform: 'translate(-50%, -50%)' }}><img src={getAnimal(index)} style={{ width: '100%' }} /><div style={{position:'absolute',top:'-10px',right:'-10px'}}>✨</div></div>}
        {getStone && <div style={{ position: 'absolute', left: stonePos.left, top: stonePos.top, width: '60px', height: '60px', zIndex: 12, animation: 'rewardAppear 1s', transform: 'translate(-50%, -50%)' }}><img src={getStone(index)} style={{ width: '100%' }} /></div>}
      </React.Fragment>
    );
  };

  if (!isActive || !gameConfig) return null;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20 }}>
      {!hideElements && gameState !== 'roundSelection' && gameState !== 'initializing' && (
        <UniversalPauseButton onPause={handlePause} />
      )}
      <PauseModal isOpen={showPauseModal} onContinue={handleContinue} onExit={handleExitToMenu} />

      {!hideElements && gameState === 'roundSelection' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 150 }}>
          <div style={{ background: 'white', borderRadius: '30px', padding: '40px', maxWidth: '500px', textAlign: 'center', boxShadow: '0 25px 70px rgba(0,0,0,0.4)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: gameConfig.theme.primaryColor, marginBottom: '20px' }}>Choose Round:</h2>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px' }}>
              {Array.from({ length: Object.keys(gameConfig.syllables).length }, (_, i) => i + 1).map(round => {
                const isCompleted = completedRounds.includes(round);
                return (
                  <button key={round} onClick={() => handleRoundSelect(round)}
                    style={{ width: '80px', height: '80px', borderRadius: '15px', border: isCompleted ? '3px solid #4CAF50' : selectedRound === round ? `4px solid ${gameConfig.theme.primaryColor}` : `2px solid ${gameConfig.theme.primaryColor}`, background: isCompleted ? '#4CAF50' : selectedRound === round ? `${gameConfig.theme.primaryColor}15` : 'white', color: isCompleted ? 'white' : gameConfig.theme.primaryColor, fontSize: '32px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {round}
                    {isCompleted && <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '24px', height: '24px', borderRadius: '50%', background: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#4CAF50', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>✓</div>}
                  </button>
                );
              })}
            </div>
            {selectedRound && <button onClick={handleStartRound} style={{ width: '100%', padding: '20px', marginTop: '20px', background: `linear-gradient(135deg, ${gameConfig.theme.primaryColor} 0%, ${gameConfig.theme.primaryColor}CC 100%)`, border: 'none', borderRadius: '15px', color: 'white', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: `0 6px 20px ${gameConfig.theme.primaryColor}40`, animation: 'pulseButton 1.5s ease-in-out infinite' }}>▶️ START ROUND {selectedRound}</button>}
            <div style={{ borderTop: '2px solid #E0E0E0', paddingTop: '25px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn-finish primary" onClick={handleFinishGame} style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', border: 'none', borderRadius: '15px', color: 'white', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)', minHeight: '60px' }}>🏁 Finish & Return<div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>Save progress and return to scene</div></button>
              <button className="btn-auto-mode secondary" onClick={handleSwitchToAutoMode} style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', border: 'none', borderRadius: '15px', color: 'white', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)', minHeight: '60px' }}>🎵 Hear Full Mantra<div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>Switch to Auto Play from Round 1</div></button>
            </div>
          </div>
        </div>
      )}

      {!hideElements && isCountingDown && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '100px', fontWeight: 'bold', color: gameConfig.theme.primaryColor, textShadow: `0 0 30px ${gameConfig.theme.primaryColor}80`, zIndex: 100, animation: 'countdownPulse 0.8s ease-in-out' }}>{countdown}</div>
      )}
      {!hideElements && waterSprayPosition && <div style={{ position: 'absolute', left: waterSprayPosition.left, top: waterSprayPosition.top, transform: 'translate(-50%, -100%)', fontSize: '48px', animation: 'waterSplash 1s ease-out', zIndex: 100, pointerEvents: 'none' }}>💦</div>}

      {!hideElements && gameState !== 'roundSelection' && gameState !== 'countdown' && gameState !== 'initializing' && (
        <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: gameState === 'playing' ? 'rgba(33, 150, 243, 0.95)' : gameState === 'success' ? 'rgba(76, 175, 80, 0.95)' : 'rgba(255, 152, 0, 0.95)', color: 'white', padding: '12px 24px', borderRadius: '25px', fontSize: '15px', fontWeight: 'bold', zIndex: 50 }}>
          {gameState === 'playing' && `Round ${selectedRound}: Listen carefully...`}
          {gameState === 'listening' && `Click to repeat! (${playerInput.length}/${currentSequence.length})`}
          {gameState === 'success' && '✨ Perfect! Choose another round!'}
        </div>
      )}

      {!hideElements && gameState !== 'roundSelection' && gameState !== 'initializing' && (
        <>
          {gameConfig.elements.rewards?.animals ? (
            <>
              {currentSequence.map((s, i) => renderDualInitials(s, i))}
              {currentSequence.map((s, i) => renderElephant(s, i))}
              {currentSequence.map((s, i) => renderDualRewards(s, i))}
            </>
          ) : (
            <>
              {currentSequence.map((s, i) => renderSinger(s, i))}
              {currentSequence.map((s, i) => renderElephant(s, i))}
            </>
          )}
        </>
      )}
      <style>{`@keyframes goldenPulse { 0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); } } @keyframes countdownPulse { 0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; } 50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; } } @keyframes waterSplash { 0% { transform: translate(-50%, -100%) scale(0.5); opacity: 1; } 50% { transform: translate(-50%, -150%) scale(1.2); opacity: 0.8; } 100% { transform: translate(-50%, -200%) scale(1.5); opacity: 0; } } @keyframes rewardAppear { 0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); opacity: 0; } 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; } } @keyframes sparkle { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } } @keyframes pulseButton { 0%, 100% { transform: scale(1); box-shadow: 0 6px 20px ${gameConfig.theme.primaryColor}40; } 50% { transform: scale(1.05); box-shadow: 0 8px 25px ${gameConfig.theme.primaryColor}60; } }`}</style>
    </div>
  );
};

export default ManualRoundMode;