// zones/shloka-river/core/ManualRoundMode.jsx
// Manual round selection mode - Based on SimplifiedMemoryGame pattern

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
  isReload,
  savedGameState
}) => {
  
  const { safeClick } = useSafeClick(300);
  
  // State
  const [selectedRound, setSelectedRound] = useState(savedGameState?.currentRound || 1);
  const [gameState, setGameState] = useState('idle');
  const [currentSequence, setCurrentSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [singingSyllable, setSingingSyllable] = useState(null);
  const [visualRewards, setVisualRewards] = useState({});
  const [activatedElephants, setActivatedElephants] = useState({});
  const [roundClicks, setRoundClicks] = useState({});
  
  const timeoutsRef = useRef([]);
  const isComponentMountedRef = useRef(true);

  const safeSetTimeout = (callback, delay) => {
    const timeout = setTimeout(() => {
      if (isComponentMountedRef.current) callback();
    }, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  // Initialize sequence when round changes
  useEffect(() => {
    if (isActive && gameConfig) {
      const sequence = gameConfig.syllables[selectedRound] || [];
      setCurrentSequence(sequence);
      setPlayerInput([]);
      setGameState('idle');
      setRoundClicks({});
    }
  }, [selectedRound, isActive, gameConfig]);

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

  // Round selection
  const handleRoundSelect = (round) => {
    safeClick(() => {
      if (gameState === 'playing' || isSequencePlaying) {
        console.log('⏸️ Finish current attempt first!');
        return;
      }
      
      setSelectedRound(round);
      
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
  const handlePlaySequence = () => {
    safeClick(() => {
      if (currentSequence.length === 0) return;
      playSequence();
    }, 2000);
  };

  const playSequence = () => {
    setIsSequencePlaying(true);
    setGameState('playing');
    setPlayerInput([]);
    setRoundClicks({});
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
      
      const newPlayerInput = [...playerInput, clickedSyllable];
      setPlayerInput(newPlayerInput);
      setRoundClicks(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
      setActivatedElephants(prev => ({ ...prev, [`elephant-${clickedSyllable}`]: true }));
      setVisualRewards(prev => ({ ...prev, [`visual-${clickedSyllable}`]: true }));
      
      if (newPlayerInput.length === currentSequence.length) {
        setGameState('success');
        safeSetTimeout(() => {
          setGameState('idle');
          setPlayerInput([]);
          setRoundClicks({});
        }, 2500);
      }
    });
  };

  // Render elephant (simplified)
  const renderElephant = (syllable, index) => {
    const position = gameConfig.elements.clicker.positions[index];
    const getterName = gameConfig.elements.clicker.assetGetter;
    const getImage = assetGetters[getterName];
    const clickable = gameState === 'listening' && !isSequencePlaying && index === playerInput.length;
    const clicked = index < playerInput.length;
    
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
          filter: singingSyllable === syllable ? 'brightness(1.4)' : 'brightness(1)'
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

  // Render singer (simplified)
  const renderSinger = (syllable, index) => {
    const position = gameConfig.elements.singer.positions[index];
    const getterName = gameConfig.elements.singer.assetGetter;
    const getImage = assetGetters[getterName];
    const isSinging = singingSyllable === syllable;
    const isReward = visualRewards[`visual-${syllable}`];
    
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
        {getImage && (
          <img
            src={getImage(index)}
            alt={`${gameConfig.elements.singer.type} ${syllable}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
      </div>
    );
  };

  if (!isActive || !gameConfig) return null;

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 20 }}>
      
      {/* Round Selection Buttons */}
      {!hideElements && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '15px',
          padding: '15px',
          zIndex: 50,
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
            Choose Round:
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(round => (
              <button
                key={round}
                onClick={() => handleRoundSelect(round)}
                disabled={gameState === 'playing' || isSequencePlaying}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '10px',
                  border: selectedRound === round ? `3px solid ${gameConfig.theme.primaryColor}` : '2px solid #ddd',
                  background: selectedRound === round ? gameConfig.theme.primaryColor : 'white',
                  color: selectedRound === round ? 'white' : '#333',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: (gameState === 'playing' || isSequencePlaying) ? 'not-allowed' : 'pointer',
                  opacity: (gameState === 'playing' || isSequencePlaying) ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {round}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Play Button */}
      {!hideElements && gameState === 'idle' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 60
        }}>
          <button
            onClick={handlePlaySequence}
            style={{
              background: `linear-gradient(135deg, ${gameConfig.theme.primaryColor} 0%, ${gameConfig.theme.accentColor} 100%)`,
              border: 'none',
              borderRadius: '20px',
              padding: '20px 40px',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              animation: 'pulse 2s infinite'
            }}
          >
            ▶️ Play Round {selectedRound}
          </button>
        </div>
      )}

      {/* Status Message */}
      {!hideElements && gameState !== 'idle' && (
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
          {gameState === 'playing' && 'Listen carefully...'}
          {gameState === 'listening' && `Click to repeat! (${playerInput.length}/${currentSequence.length})`}
          {gameState === 'success' && '✨ Perfect! Try another round!'}
        </div>
      )}

      {/* Game Elements */}
      {!hideElements && (
        <>
          {currentSequence.map((syllable, index) => renderSinger(syllable, index))}
          {currentSequence.map((syllable, index) => renderElephant(syllable, index))}
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default ManualRoundMode;