import React, { useState, useEffect } from 'react';
import './Cavescene5memoryfinale.css';
import GameStateManager from "../../../../lib/services/GameStateManager";
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import RotatingOrbsEffect from '../../../../lib/components/feedback/RotatingOrbsEffect';

// Import assets
import bgFinal from './assets/images/bg-final.png';
import ganeshaCharacter from './assets/images/ganesha-character.png';

// Import symbol images
import vakratundaSymbol from '../../assets/images/symbols/vakratunda-symbol.png';
import mahakayaSymbol from '../../assets/images/symbols/mahakaya-symbol.png';
import suryakotiSymbol from '../../assets/images/symbols/suryakoti-symbol.png';
import samaprabhaSymbol from '../../assets/images/symbols/samaprabha-symbol.png';
import nirvighnamSymbol from '../../assets/images/symbols/nirvighnam-symbol.png';
import kurumedevaSymbol from '../../assets/images/symbols/kurumedeva-symbol.png';
import sarvakaryeshuSymbol from '../../assets/images/symbols/sarvakaryeshu-symbol.png';
import sarvadaSymbol from '../../assets/images/symbols/sarvada-symbol.png';

// Mapping for all symbols with their names and meanings (moved outside component)
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

// Round 1: Symbol + Sanskrit word ↔ English meaning
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

const CaveScene5MemoryFinale = ({ onBack, onNavigate, hideCoach, clearManualCloseTracking }) => {
  // Get profile name
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);
  const [showRotatingOrbs, setShowRotatingOrbs] = useState(false);

  // Shuffle function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize cards for current round
  useEffect(() => {
    if (gameStarted) {
      const cardData = currentRound === 1 ? createRound1Data() : createRound2Data();
      const shuffled = shuffleArray(cardData);
      console.log('Initializing cards for round', currentRound, 'Card count:', shuffled.length);
      setCards(shuffled);
      setFlippedCards([]);
      setMatchedPairs([]);
      setRoundComplete(false);
    }
  }, [currentRound, gameStarted]);

  // Handle card click
  const handleCardClick = (cardId) => {
    // SPAM PROTECTION: Ignore if checking, card already flipped, card already matched, or already have 2 flipped
    if (isChecking || flippedCards.includes(cardId) || matchedPairs.includes(cardId) || flippedCards.length >= 2) {
      return;
    }

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      setIsChecking(true);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard.pair === secondCard.pair) {
        // Match found!
        setTimeout(() => {
          setMatchedPairs([...matchedPairs, firstId, secondId]);
          setFlippedCards([]);
          setIsChecking(false);

          // Check if round is complete
          if (matchedPairs.length + 2 === cards.length) {
            setRoundComplete(true);
          }
        }, 800);
      } else {
        // No match - flip back
        setTimeout(() => {
          setFlippedCards([]);
          setIsChecking(false);
        }, 1200);
      }
    }
  };

  // Handle round transition
  const handleContinueToRound2 = () => {
    setCurrentRound(2);
  };

  // Handle play again for current round
  const handlePlayAgain = () => {
    // Restart current round
    const cardData = currentRound === 1 ? createRound1Data() : createRound2Data();
    const shuffled = shuffleArray(cardData);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs([]);
    setRoundComplete(false);
  };

  // Handle end game - go back
  const handleEndGame = () => {
    onBack?.();
  };

  // Handle showing rotating orbs (after Round 2 complete)
  const handleShowRotatingOrbs = () => {
    setShowRotatingOrbs(true);
  };

  // Handle rotating orbs complete - automatically go to scene completion
  const handleOrbsComplete = () => {
    setShowRotatingOrbs(false);
    setShowCelebration(true);
  };

  // Render card
  const renderCard = (card) => {
    const isFlipped = flippedCards.includes(card.id) || matchedPairs.includes(card.id);
    const isMatched = matchedPairs.includes(card.id);

    return (
      <div
        key={card.id}
        className={`memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
        onClick={() => handleCardClick(card.id)}
      >
        {isMatched && <div className="sparkle-effect">✨</div>}
        <div className="card-inner">
          {/* Card Back - NO IMG TAG */}
          <div className="card-back">
            {/* Using CSS background and ::before for '?' - no img needed */}
          </div>

          {/* Card Front */}
          <div className="card-front styled-card">
            {/* 4 Corner Gems */}
            <div className="gem gem-top-left"></div>
            <div className="gem gem-top-right"></div>
            <div className="gem gem-bottom-left"></div>
            <div className="gem gem-bottom-right"></div>
            
            <div className="card-content">
              {card.type === 'symbol' ? (
                <>
                  <img src={card.symbol} alt="Symbol" className="card-symbol" />
                  <div className="sanskrit-word">{card.content}</div>
                </>
              ) : (
                <div className="meaning-word">{card.content}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Opening screen - before game starts
  if (!gameStarted) {
    return (
      <div className="cave-scene5-memory cave-opening-screen" style={{ backgroundImage: `url(${bgFinal})` }}>
        <div className="opening-message">
          <div className="opening-content">
            <img src={ganeshaCharacter} alt="Ganesha" className="opening-ganesha" />
            <h2>🕉️ Cave of Secrets - Final Challenge! 🕉️</h2>
            <p>Welcome, {profileName}!</p>
            <p>It's time to test your mastery of all the symbols!</p>
            <p>Match each symbol with its Sanskrit name and meaning.</p>
            <p className="opening-hint">💡 Two rounds await you - let's begin!</p>
            <button 
              className="play-game-button"
              onClick={() => setGameStarted(true)}
            >
              Let's Play! 🎮
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rotating Orbs Effect - shows ALL 8 symbols after Round 2
  if (showRotatingOrbs) {
    return (
      <RotatingOrbsEffect
        show={true}
        duration={9000}
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
        ganeshaImage={ganeshaCharacter}
        playerName={profileName}
        onComplete={handleOrbsComplete}
      />
    );
  }

  // Final celebration screen using SceneCompletionCelebration (like Shloka River)
  if (showCelebration) {
    return (
      <SceneCompletionCelebration
        show={true}
        sceneName="Cave of Secrets"
        sceneNumber={5}
        totalScenes={5}
        starsEarned={8}
        totalStars={8}
        discoveredSymbols={['vakratunda', 'mahakaya', 'samaprabha', 'suryakoti', 'nirvighnam', 'kurumedeva', 'sarvakaryeshu', 'sarvada']}
        
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
        
        sceneId="cave-scene5-memory-finale"
        completionData={{
          stars: 8,
          apps: { all: true },
          completed: true,
          totalStars: 8
        }}
        onComplete={() => {
          if (hideCoach) hideCoach();
          if (clearManualCloseTracking) clearManualCloseTracking();
          onBack?.();
        }}
        childName={profileName}
        isFinalScene={true}
        
        onExploreZones={() => {
          setShowCelebration(false);
          if (hideCoach) hideCoach();
          if (clearManualCloseTracking) clearManualCloseTracking();
          onNavigate?.('zones');
        }}
        onHome={() => {
          setShowCelebration(false);
          if (hideCoach) hideCoach();
          if (clearManualCloseTracking) clearManualCloseTracking();
          onNavigate?.('home');
        }}
        onReplay={() => {
          console.log('🔀 INSTANT REPLAY: Cave Memory restart');
          // Reset to opening screen
          setGameStarted(false);
          setCurrentRound(1);
          setCards([]);
          setFlippedCards([]);
          setMatchedPairs([]);
          setRoundComplete(false);
          setShowRotatingOrbs(false);
          setShowCelebration(false);
        }}
      />
    );
  }

  // Round completion screen
  if (roundComplete) {
    const matchedSymbolPairs = cards
      .filter(card => matchedPairs.includes(card.id))
      .reduce((acc, card) => {
        const existingPair = acc.find(p => p.pair === card.pair);
        if (!existingPair) {
          acc.push({
            pair: card.pair,
            symbol: symbolData[card.pair].symbol,
            name: symbolData[card.pair].name,
            meaning: symbolData[card.pair].meaning
          });
        }
        return acc;
      }, []);

    return (
      <div className="round-complete-screen" style={{ backgroundImage: `url(${bgFinal})` }}>
        <div className="round-complete-content">
          <h2 className="round-complete-title">
            {currentRound === 1 ? '✨ Great Job! ✨' : '🎊 Amazing! 🎊'}
          </h2>
          <p className="round-complete-message">
            {currentRound === 1 
              ? "You've matched all 4 symbols! Ready for the next challenge?"
              : "You've mastered all 8 symbols! Time to celebrate!"}
          </p>
          
          <div className="matched-pairs-display">
            {matchedSymbolPairs.map((item) => (
              <div key={item.pair} className="matched-pair-item">
                <img src={item.symbol} alt={item.name} />
                <div className="matched-text">
                  <div className="matched-word">{item.name}</div>
                  <div className="matched-meaning">{item.meaning}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="round-action-buttons">
            <button 
              className="play-again-button"
              onClick={handlePlayAgain}
            >
              Play Again 🔄
            </button>
            
            <button 
              className="final-continue-button"
              onClick={currentRound === 1 ? handleContinueToRound2 : handleShowRotatingOrbs}
            >
              {currentRound === 1 ? 'Next Round ' : 'See Rewards! 🎉'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="cave-scene5-memory" style={{ backgroundImage: `url(${bgFinal})` }}>
      <div className="scene-header">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="round-indicator">
          Round {currentRound} of 2
        </div>
      </div>

      <div className="progress-indicator-top">
        {matchedPairs.length / 2} / 4 pairs found
      </div>

      <div className="memory-grid">
        {cards.map(card => renderCard(card))}
      </div>

      {/* Add BackToMapButton like in Shloka River */}
      <BackToMapButton 
        onNavigate={onNavigate} 
        hideCoach={hideCoach} 
        clearManualCloseTracking={clearManualCloseTracking}
        position="bottom-left"
      />
    </div>
  );
};

export default CaveScene5MemoryFinale;