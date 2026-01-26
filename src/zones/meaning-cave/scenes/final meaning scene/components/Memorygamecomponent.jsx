import React, { useState, useEffect } from 'react';
import './MemoryGameComponent.css';

// Import symbol images
import vakratundaSymbol from '../../../assets/images/symbols/vakratunda-symbol.png';
import mahakayaSymbol from '../../../assets/images/symbols/mahakaya-symbol.png';
import suryakotiSymbol from '../../../assets/images/symbols/suryakoti-symbol.png';
import samaprabhaSymbol from '../../../assets/images/symbols/samaprabha-symbol.png';
import nirvighnamSymbol from '../../../assets/images/symbols/nirvighnam-symbol.png';
import kurumedevaSymbol from '../../../assets/images/symbols/kurumedeva-symbol.png';
import sarvakaryeshuSymbol from '../../../assets/images/symbols/sarvakaryeshu-symbol.png';
import sarvadaSymbol from '../../../assets/images/symbols/sarvada-symbol.png';

// Symbol data for display after rounds
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

// Round 1: First 4 pairs (vakratunda, mahakaya, suryakoti, samaprabha)
const createRound1Data = () => [
  { id: 1, type: 'symbol', pair: 'vakratunda', symbol: vakratundaSymbol, word: 'Vakratunda' },
  { id: 2, type: 'text', pair: 'vakratunda', meaning: 'Curved Trunk' },
  { id: 3, type: 'symbol', pair: 'mahakaya', symbol: mahakayaSymbol, word: 'Mahakaya' },
  { id: 4, type: 'text', pair: 'mahakaya', meaning: 'Big Body' },
  { id: 5, type: 'symbol', pair: 'suryakoti', symbol: suryakotiSymbol, word: 'Suryakoti' },
  { id: 6, type: 'text', pair: 'suryakoti', meaning: 'Million Suns' },
  { id: 7, type: 'symbol', pair: 'samaprabha', symbol: samaprabhaSymbol, word: 'Samaprabha' },
  { id: 8, type: 'text', pair: 'samaprabha', meaning: 'Equal Brilliance' },
];

// Round 2: Next 4 pairs (nirvighnam, kurumedeva, sarvakaryeshu, sarvada)
const createRound2Data = () => [
  { id: 9, type: 'symbol', pair: 'nirvighnam', symbol: nirvighnamSymbol, word: 'Nirvighnam' },
  { id: 10, type: 'text', pair: 'nirvighnam', meaning: 'Without Obstacles' },
  { id: 11, type: 'symbol', pair: 'kurumedeva', symbol: kurumedevaSymbol, word: 'Kurumedeva' },
  { id: 12, type: 'text', pair: 'kurumedeva', meaning: 'Divine Help' },
  { id: 13, type: 'symbol', pair: 'sarvakaryeshu', symbol: sarvakaryeshuSymbol, word: 'Sarvakaryeshu' },
  { id: 14, type: 'text', pair: 'sarvakaryeshu', meaning: 'In All Tasks' },
  { id: 15, type: 'symbol', pair: 'sarvada', symbol: sarvadaSymbol, word: 'Sarvada' },
  { id: 16, type: 'text', pair: 'sarvada', meaning: 'Always' },
];

const MemoryGameComponent = ({ currentRound = 1, onRoundComplete, onGameComplete }) => {
  // Game state
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [lockBoard, setLockBoard] = useState(false);
  const [matches, setMatches] = useState(0);

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
    const cardData = currentRound === 1 ? createRound1Data() : createRound2Data();
    const shuffled = shuffleArray(cardData);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMatches(0);
    setLockBoard(false);
  }, [currentRound]);

  // Handle card click
  const handleCardClick = (cardId) => {
    // Ignore if board is locked
    if (lockBoard) return;
    
    // Ignore if card is already flipped
    if (flippedCards.includes(cardId)) return;
    
    // Ignore if card is already matched
    if (matchedPairs.includes(cardId)) return;

    // Flip the card
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      checkMatch(newFlipped);
    }
  };

  // Check if two cards match
  const checkMatch = (flipped) => {
    setLockBoard(true);
    
    const [firstId, secondId] = flipped;
    const firstCard = cards.find(c => c.id === firstId);
    const secondCard = cards.find(c => c.id === secondId);

    if (firstCard.pair === secondCard.pair) {
      // MATCH FOUND!
      setTimeout(() => {
        const newMatched = [...matchedPairs, firstId, secondId];
        setMatchedPairs(newMatched);
        setFlippedCards([]);
        setLockBoard(false);
        setMatches(matches + 1);

        // Check if round is complete (4 pairs = 8 cards)
        if (newMatched.length === 8) {
          setTimeout(() => {
            handleRoundComplete();
          }, 600);
        }
      }, 500);
    } else {
      // NO MATCH - flip back
      setTimeout(() => {
        setFlippedCards([]);
        setLockBoard(false);
      }, 1200);
    }
  };

  // Handle round completion
  const handleRoundComplete = () => {
    if (currentRound === 1) {
      // Notify parent that round 1 is complete
      if (onRoundComplete) {
        onRoundComplete(1, getMatchedPairsData());
      }
    } else {
      // Game complete - both rounds done
      if (onGameComplete) {
        onGameComplete(getMatchedPairsData());
      }
    }
  };

  // Get matched pairs data for display
  const getMatchedPairsData = () => {
    return cards
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
  };

  // Render a single card
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
          {/* Card Back - CSS styled */}
          <div className="card-back">
            <div className="card-back-content">?</div>
          </div>

          {/* Card Front */}
          <div className="card-front">
            {card.type === 'symbol' ? (
              // Card A: Symbol + Sanskrit word
              <div className="card-content-symbol">
                <img src={card.symbol} alt={card.word} className="symbol-image" />
                <div className="sanskrit-word">{card.word}</div>
              </div>
            ) : (
              // Card B: English meaning
              <div className="card-content-text">
                <div className="meaning-text">{card.meaning}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="memory-game-component">
      {/* Round indicator */}
      <div className="game-header">
        <div className="round-indicator">Round {currentRound} of 2</div>
        <div className="matches-indicator">{matches} / 4 pairs found</div>
      </div>

      {/* Memory grid */}
      <div className="memory-grid">
        {cards.map(card => renderCard(card))}
      </div>
    </div>
  );
};

export default MemoryGameComponent;