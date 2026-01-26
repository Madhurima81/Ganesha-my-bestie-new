// zones/cave-of-secrets/scenes/Scene5/CaveScene5MemoryFinale.jsx
import React, { useState, useEffect, useRef } from 'react';
import './CaveScene5MemoryFinale.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import ProgressManager from "../../../../lib/services/ProgressManager";

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import RotatingOrbsEffect from '../../../../lib/components/feedback/RotatingOrbsEffect';
import SymbolSidebar from '../../components/SymbolSidebar'; // ✅ Added Sidebar

// Import assets
import bgFinal from './assets/images/bg-final.png';
import ganeshaCharacter from './assets/images/ganesha-character.png';
import ganeshaCharacterCave from './assets/images/ganesha-character-cave.png'; // ✅ Added for Intro

// Import symbol images
import vakratundaSymbol from '../../assets/images/symbols/vakratunda-symbol.png';
import mahakayaSymbol from '../../assets/images/symbols/mahakaya-symbol.png';
import suryakotiSymbol from '../../assets/images/symbols/suryakoti-symbol.png';
import samaprabhaSymbol from '../../assets/images/symbols/samaprabha-symbol.png';
import nirvighnamSymbol from '../../assets/images/symbols/nirvighnam-symbol.png';
import kurumedevaSymbol from '../../assets/images/symbols/kurumedeva-symbol.png';
import sarvakaryeshuSymbol from '../../assets/images/symbols/sarvakaryeshu-symbol.png';
import sarvadaSymbol from '../../assets/images/symbols/sarvada-symbol.png';

// Mapping for all symbols with their names and meanings
const symbolData = {
  vakratunda: { name: 'Vakratunda', meaning: 'Curved Trunk', symbol: vakratundaSymbol },
  mahakaya: { name: 'Mahakaya', meaning: 'Big Body', symbol: mahakayaSymbol },
  suryakoti: { name: 'Suryakoti', meaning: 'Million Suns', symbol: suryakotiSymbol },
  samaprabha: { name: 'Samaprabha', meaning: 'Equal Brilliance', symbol: samaprabhaSymbol },
  nirvighnam: { name: 'Nirvighnam', meaning: 'Without Obstacles', symbol: nirvighnamSymbol },
  kurumedeva: { name: 'Kurumedeva', meaning: 'Divine Help', symbol: kurumedevaSymbol },
  sarvakaryeshu: { name: 'Sarvakaryeshu', meaning: 'In All Tasks', symbol: sarvakaryeshuSymbol },
  sarvada: { name: 'Sarvada', meaning: 'Always', symbol: sarvadaSymbol }
};

// Round 1 Data
const createRound1Data = () => [
  { id: 1, type: 'symbol', pair: 'vakratunda', symbol: vakratundaSymbol, content: 'Vakratunda' },
  { id: 2, type: 'text', pair: 'vakratunda', content: 'Curved Trunk' },
  { id: 3, type: 'symbol', pair: 'mahakaya', symbol: mahakayaSymbol, content: 'Mahakaya' },
  { id: 4, type: 'text', pair: 'mahakaya', content: 'Big Body' },
  { id: 5, type: 'symbol', pair: 'suryakoti', symbol: suryakotiSymbol, content: 'Suryakoti' },
  { id: 6, type: 'text', pair: 'suryakoti', content: 'Million Suns' },
  { id: 7, type: 'symbol', pair: 'samaprabha', symbol: samaprabhaSymbol, content: 'Samaprabha' },
  { id: 8, type: 'text', pair: 'samaprabha', content: 'Equal Brilliance' },
];

// Round 2 Data
const createRound2Data = () => [
  { id: 9, type: 'symbol', pair: 'nirvighnam', symbol: nirvighnamSymbol, content: 'Nirvighnam' },
  { id: 10, type: 'text', pair: 'nirvighnam', content: 'Without Obstacles' },
  { id: 11, type: 'symbol', pair: 'kurumedeva', symbol: kurumedevaSymbol, content: 'Kurumedeva' },
  { id: 12, type: 'text', pair: 'kurumedeva', content: 'Divine Help' },
  { id: 13, type: 'symbol', pair: 'sarvakaryeshu', symbol: sarvakaryeshuSymbol, content: 'Sarvakaryeshu' },
  { id: 14, type: 'text', pair: 'sarvakaryeshu', content: 'In All Tasks' },
  { id: 15, type: 'symbol', pair: 'sarvada', symbol: sarvadaSymbol, content: 'Sarvada' },
  { id: 16, type: 'text', pair: 'sarvada', content: 'Always' },
];

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in CaveScene5MemoryFinale:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong in the memory game.</h2>
          <button onClick={() => window.location.reload()}>Restart Scene</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const CaveScene5MemoryFinale = ({
  onComplete,
  onNavigate,
  onBack,
  zoneId = 'cave-of-secrets',
  sceneId = 'cave-scene5-memory-finale'
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          gameStarted: false,
          currentRound: 1,
          cards: [],
          flippedCards: [],
          matchedPairs: [],
          isChecking: false,
          showCelebration: false,
          roundComplete: false,
          completed: false,
          round1Complete: false,
          round2Complete: false
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <CaveScene5MemoryFinaleContent
            sceneState={sceneState}
            sceneActions={sceneActions}
            isReload={isReload}
            onComplete={onComplete}
            onNavigate={onNavigate}
            onBack={onBack}
            zoneId={zoneId}
            sceneId={sceneId}
          />
        )}
      </SceneManager>
    </ErrorBoundary>
  );
};

const CaveScene5MemoryFinaleContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  onBack,
  zoneId,
  sceneId
}) => {
  // Get profile name
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Local UI state
  const [showRotatingOrbs, setShowRotatingOrbs] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  
  // Hint System State
  const [isPeeking, setIsPeeking] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  
  const timeoutsRef = useRef([]);

  // Safe timeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  const playAudio = (audioPath, volume = 1.0) => {
    try {
      const audio = new Audio(audioPath);
      audio.volume = volume;
      audio.play().catch(() => {});
    } catch (error) {
      console.warn('Audio failed:', error);
    }
  };

  // Shuffle function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Reset scene function
  const resetScene = (showConfirm = true) => {
    if (showConfirm && !confirm('Start this scene from the beginning? You will lose current progress.')) {
      return;
    }

    console.log('🔥 Cave Memory Finale reset: User chose to start fresh');
    
    // Clear all timeouts
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
    
    // Clear local UI state
    setShowRotatingOrbs(false);
    setHintsRemaining(3);
    setIsPeeking(false);
    
    // Reset scene state
    setTimeout(() => {
      sceneActions.updateState({
        gameStarted: false,
        currentRound: 1,
        cards: [],
        flippedCards: [],
        matchedPairs: [],
        isChecking: false,
        showCelebration: false,
        roundComplete: false,
        completed: false,
        round1Complete: false,
        round2Complete: false
      });
    }, 100);
  };

  // Initialize cards for current round
  useEffect(() => {
    if (sceneState.gameStarted && sceneState.cards.length === 0) {
      const cardData = sceneState.currentRound === 1 ? createRound1Data() : createRound2Data();
      const shuffled = shuffleArray(cardData);
      console.log('Initializing cards for round', sceneState.currentRound);
      sceneActions.updateState({
        cards: shuffled,
        flippedCards: [],
        matchedPairs: [],
        roundComplete: false
      });
    }
  }, [sceneState.currentRound, sceneState.gameStarted, sceneState.cards.length]);

  // Handle card click
  const handleCardClick = (cardId) => {
    if (sceneState.isChecking || 
        sceneState.flippedCards.includes(cardId) || 
        sceneState.matchedPairs.includes(cardId) || 
        sceneState.flippedCards.length >= 2 ||
        isPeeking) { // Don't allow clicks during peek
      return;
    }

    console.log('Card clicked:', cardId);
    const newFlipped = [...sceneState.flippedCards, cardId];
    sceneActions.updateState({ flippedCards: newFlipped });

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      sceneActions.updateState({ isChecking: true });
      
      const card1 = sceneState.cards.find(c => c.id === newFlipped[0]);
      const card2 = sceneState.cards.find(c => c.id === newFlipped[1]);

      safeSetTimeout(() => {
        if (card1.pair === card2.pair) {
          console.log('✅ Match found!', card1.pair);
          const newMatched = [...sceneState.matchedPairs, newFlipped[0], newFlipped[1]];
          
          // Check if round is complete
          const roundComplete = newMatched.length === 8;

          sceneActions.updateState({
            matchedPairs: newMatched,
            flippedCards: [],
            isChecking: false,
            roundComplete: roundComplete
          });

          if (roundComplete) {
            handleRoundComplete();
          }
        } else {
          console.log('❌ No match');
          sceneActions.updateState({
            flippedCards: [],
            isChecking: false
          });
        }
      }, 1000);
    }
  };

  // Handle round completion
  const handleRoundComplete = () => {
    console.log('🎉 Round complete!', sceneState.currentRound);
    
    setShowRotatingOrbs(true);
    safeSetTimeout(() => setShowRotatingOrbs(false), 3000);

    if (sceneState.currentRound === 1) {
      sceneActions.updateState({ round1Complete: true });
    } else if (sceneState.currentRound === 2) {
      sceneActions.updateState({ round2Complete: true });
      handleGameComplete();
    }
  };

  const handleContinueToNextRound = () => {
    console.log('Continuing to round 2');
    sceneActions.updateState({
      currentRound: 2,
      cards: [],
      flippedCards: [],
      matchedPairs: [],
      roundComplete: false,
      isChecking: false
    });
  };

  const handlePlayAgain = () => {
    console.log('Playing round again:', sceneState.currentRound);
    const cardData = sceneState.currentRound === 1 ? createRound1Data() : createRound2Data();
    const shuffled = shuffleArray(cardData);
    
    sceneActions.updateState({
      cards: shuffled,
      flippedCards: [],
      matchedPairs: [],
      roundComplete: false,
      isChecking: false
    });
  };

  const handleGameComplete = () => {
    console.log('🎊 Game Complete! All rounds finished.');
    
    try {
      const profileId = activeProfile?.id;
      if (profileId) {
        GameStateManager.saveGameState(zoneId, sceneId, {
          completed: true,
          stars: 8,
          timestamp: Date.now(),
          round1Complete: true,
          round2Complete: true
        });
        
        ProgressManager.updateSceneCompletion(profileId, zoneId, sceneId, {
          completed: true,
          stars: 8
        });
      }
    } catch (error) {
      console.error('Error saving game state:', error);
    }
    
    sceneActions.updateState({
      completed: true,
      showCelebration: true
    });
  };

  // Start game
  const handleStartGame = () => {
    console.log('🎮 Starting Memory Game');
    sceneActions.updateState({ gameStarted: true });
  };

  // 👁️ Ganesha's Help (Peek feature)
  const handleUseHint = () => {
    if (hintsRemaining <= 0 || isPeeking || sceneState.roundComplete) return;
    
    console.log('✨ Using Ganesha Hint');
    setHintsRemaining(prev => prev - 1);
    setIsPeeking(true);
    
    // Temporarily show all cards via CSS class in render
    safeSetTimeout(() => {
      setIsPeeking(false);
    }, 1500); // Show for 1.5 seconds
  };

  if (!sceneState) {
    return <div className="loading">Loading memory game...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div 
          className="cave-scene5-memory"
          style={{ backgroundImage: `url(${bgFinal})` }}
        >
          {/* ✅ NEW OPENING SCREEN: Final Challenge */}
          {!sceneState.gameStarted && (
            <div className="finale-instructions-overlay">
              <div className="finale-instructions-content">
                {/* Character */}
                <div className="finale-instructions-ganesha">
                  <img 
                    src={ganeshaCharacterCave} 
                    alt="Ganesha Character"
                  />
                </div>
                
                {/* Card */}
                <div className="finale-instructions-card">
                  <h1 className="finale-instructions-title">
                    The Final Challenge!
                  </h1>
                  
                  <p className="finale-instructions-subtitle">
                    You have gathered all the ancient wisdom! <br/>
                    Now, match the symbols to their meanings to master the Cave of Secrets!
                  </p>
                  
                  <div className="finale-instructions-icons">
                    <div className="finale-icon-item">
                      <img src={vakratundaSymbol} alt="Vakratunda" />
                      <span>Symbols</span>
                    </div>
                    <div style={{fontSize: '40px', alignSelf: 'center'}}>↔️</div>
                    <div className="finale-icon-item">
                      <div style={{
                        width: '80px', height: '80px', background: 'white', 
                        borderRadius: '15px', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', fontWeight: 'bold', border: '2px solid #FFD700',
                        fontSize: '32px'
                      }}>
                        ?
                      </div>
                      <span>Meanings</span>
                    </div>
                  </div>
                  
                  <button
                    className="finale-instructions-button"
                    onClick={handleStartGame}
                  >
                    Start Memory Game
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Game Screen */}
          {sceneState.gameStarted && !sceneState.roundComplete && (
            <>
              {/* Header */}
              <div className="scene-header">
                <button className="back-button" onClick={() => onBack?.()}>
                  ← Back
                </button>
                <div className="round-indicator">
                  Round {sceneState.currentRound} of 2
                </div>
              </div>

              {/* Memory Card Grid */}
              <div className="memory-grid">
                {sceneState.cards.map((card) => {
                  // ✅ Card shows if flipped, matched, or peeking
                  const isFlipped = sceneState.flippedCards.includes(card.id) || isPeeking;
                  const isMatched = sceneState.matchedPairs.includes(card.id);

                  return (
                    <div
                      key={card.id}
                      className={`memory-card ${isFlipped || isMatched ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                      onClick={() => handleCardClick(card.id)}
                    >
                      <div className="card-inner">
                        <div className="card-back"></div>
                        <div className="card-front">
                          <div className="gem gem-top-left"></div>
                          <div className="gem gem-top-right"></div>
                          <div className="gem gem-bottom-left"></div>
                          <div className="gem gem-bottom-right"></div>

                          <div className="card-content">
                            {card.type === 'symbol' ? (
                              <>
                                <img src={card.symbol} alt={card.content} className="card-symbol" />
                                <div className="sanskrit-word">{card.content}</div>
                              </>
                            ) : (
                              <div className="meaning-word">{card.content}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      {isMatched && <div className="sparkle-effect">✨</div>}
                    </div>
                  );
                })}
              </div>

              <div className="helper-text">
                Match the symbols with their meanings! 🎯
              </div>
            </>
          )}

          {/* Round Complete Screen */}
          {sceneState.roundComplete && !sceneState.showCelebration && (
            <div className="round-complete-screen" style={{ backgroundImage: `url(${bgFinal})` }}>
              <div className="round-complete-content">
                <h2 className="round-complete-title">
                  {sceneState.currentRound === 1 ? '🎉 Great Job! 🎉' : '🎊 Amazing! 🎊'}
                </h2>
                <p className="round-complete-message">
                  {sceneState.currentRound === 1 
                    ? "You've matched all 4 symbols! Ready for the next challenge?"
                    : "You've mastered all 8 symbols! Time to celebrate!"}
                </p>

                <div className="matched-pairs-display">
                  {sceneState.matchedPairs.map((cardId) => {
                    const card = sceneState.cards.find(c => c.id === cardId);
                    if (!card || card.type !== 'symbol') return null;
                    
                    const data = symbolData[card.pair];
                    return (
                      <div key={cardId} className="matched-pair-item">
                        <img src={data.symbol} alt={data.name} />
                        <div className="matched-text">
                          <div className="matched-word">{data.name}</div>
                          <div className="matched-meaning">{data.meaning}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="round-action-buttons">
                  <button className="play-again-button" onClick={handlePlayAgain}>
                    Play Again 🔄
                  </button>
                  {sceneState.currentRound === 1 && (
                    <button className="final-continue-button" onClick={handleContinueToNextRound}>
                      Next Round →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ✅ SIDEBAR & HINT SYSTEM */}
          {/* ======================================================== */}
          
          {/* 1. Symbol Sidebar (Reference Guide) */}
          {sceneState.gameStarted && !sceneState.completed && (
            <div style={{ filter: 'none' }}>
              <SymbolSidebar
                unlockedSymbols={{
                  vakratunda: true,
                  mahakaya: true,
                  suryakoti: true,
                  samaprabha: true,
                  nirvighnam: true,
                  kurumedeva: true,
                  sarvakaryeshu: true,
                  sarvada: true
                }}
                onSymbolClick={(symbolId) => {
                  console.log(`Reference: ${symbolId}`);
                  // Optional: Play audio of the name
                  // playAudio(`/audio/words/${symbolId}.mp3`); 
                }}
              />
            </div>
          )}

          {/* 2. Ganesha's Magic Eye (Active Hint) */}
          {sceneState.gameStarted && !sceneState.roundComplete && (
            <div className="hint-container" style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <button 
                onClick={handleUseHint}
                disabled={hintsRemaining <= 0 || isPeeking}
                style={{
                  background: hintsRemaining > 0 ? 'linear-gradient(45deg, #FFD700, #FFA500)' : '#ccc',
                  border: '3px solid #FFF',
                  borderRadius: '50%',
                  width: '70px',
                  height: '70px',
                  cursor: hintsRemaining > 0 ? 'pointer' : 'default',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s',
                  transform: isPeeking ? 'scale(0.9)' : 'scale(1)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '30px'
                }}
              >
                👁️
              </button>
              <div style={{
                background: 'rgba(0,0,0,0.7)',
                color: '#FFD700',
                padding: '4px 10px',
                borderRadius: '10px',
                marginTop: '5px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {hintsRemaining} hints left
              </div>
            </div>
          )}

          {/* Rotating Orbs Effect */}
          {showRotatingOrbs && (
            <RotatingOrbsEffect 
              colors={['#FFD700', '#FFA500', '#FF6347']}
              duration={3000}
            />
          )}

          {/* Scene Completion Celebration */}
          <SceneCompletionCelebration
            show={sceneState.showCelebration}
            sceneName="Cave of Secrets"
            sceneNumber={5}
            totalScenes={5}
            starsEarned={8}
            totalStars={8}
            discoveredSymbols={['vakratunda', 'mahakaya', 'samaprabha', 'suryakoti', 
                               'nirvighnam', 'kurumedeva', 'sarvakaryeshu', 'sarvada']}
            symbolImages={{
              vakratunda: vakratundaSymbol,
              mahakaya: mahakayaSymbol,
              samaprabha: samaprabhaSymbol,
              suryakoti: suryakotiSymbol,
              nirvighnam: nirvighnamSymbol,
              kurumedeva: kurumedevaSymbol,
              sarvakaryeshu: sarvakaryeshuSymbol,
              sarvada: sarvadaSymbol
            }}
            sceneId={sceneId}
            completionData={{
              stars: 8,
              symbols: { all: true },
              completed: true,
              totalStars: 8
            }}
            onComplete={onComplete}
            childName={profileName}
            isFinalScene={true}
            onExploreZones={() => {
              sceneActions.updateState({ showCelebration: false });
              onNavigate?.('zones');
            }}
            onHome={() => {
              sceneActions.updateState({ showCelebration: false });
              onNavigate?.('home');
            }}
            onReplay={() => {
              console.log('🔀 INSTANT REPLAY: Memory Game restart');
              resetScene(false);
            }}
          />

          <BackToMapButton onNavigate={onNavigate} />

          <TocaBocaNav
            onHome={() => setTimeout(() => onNavigate?.('home'), 100)}
            onZonesClick={() => setTimeout(() => onNavigate?.('zones'), 100)}
            onStartFresh={() => resetScene(true)}
            currentProgress={{
              stars: sceneState.matchedPairs.length / 2,
              completed: sceneState.completed ? 1 : 0,
              total: 1
            }}
            isAudioOn={isAudioOn}
            onAudioToggle={() => setIsAudioOn(!isAudioOn)}
          />
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default CaveScene5MemoryFinale;