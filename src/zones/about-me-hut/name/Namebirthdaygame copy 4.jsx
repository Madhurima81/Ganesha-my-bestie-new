import React, { useState, useEffect } from 'react';
import './NameBirthdayGame.css';
import AboutMeCompletion from "../components/Aboutmecompletion";

// Import images
import nameBg from './assets/images/name-bg.png';
import babyGaneshaImg from './assets/images/baby-ganesha-sit.png';
import babyGaneshaSit from './assets/images/baby-ganesha-sit.png';

// Festival icons
import holiIcon from './assets/images/holi.png';
import diwaliIcon from './assets/images/diwali.png';
import janmashtamiIcon from './assets/images/janmashtami.png';
import ganeshChaturthiIcon from './assets/images/chaturthi.png';

const NameBirthdayGame = ({ onComplete, onBack, onNavigate }) => {
const [gamePhase, setGamePhase] = useState('intro'); 
// Phases: intro, name-balloons, name-complete, birthday-intro, birthday-choice, birthday-correct, 
// child-name-intro, child-name-input, child-name-complete, child-birthday-intro, child-birthday-month, 
// child-birthday-date, child-birthday-complete, besties-card, ending
  
  const [poppedLetters, setPoppedLetters] = useState(new Set());
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [wrongFestivals, setWrongFestivals] = useState(new Set());
  const [showShake, setShowShake] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [gameState, setGameState] = useState({
    stars: 2,
    completed: false
  });

  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
const [shakeWrongBalloon, setShakeWrongBalloon] = useState(null);
const [instructionMessage, setInstructionMessage] = useState('Pop the balloons in order! 🎈');
const [showHintModal, setShowHintModal] = useState(false);
const [flippedCards, setFlippedCards] = useState(new Set());

const [childName, setChildName] = useState('');
const [childNameLetters, setChildNameLetters] = useState([]);
const [availableLetters] = useState('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));

  // Name letters with balloon colors
// Name letters with RANDOM balloon positions
// Name letters with SPREAD OUT positions (no overlap!)
const nameLetters = [
  { id: 'G', letter: 'G', color: '#FF6B6B', left: '15%', top: '45%' },
  { id: 'A1', letter: 'A', color: '#4ECDC4', left: '75%', top: '30%' },
  { id: 'N', letter: 'N', color: '#FFE66D', left: '45%', top: '60%' },
  { id: 'E', letter: 'E', color: '#95E1D3', left: '70%', top: '65%' },
  { id: 'S', letter: 'S', color: '#F38181', left: '30%', top: '25%' },
  { id: 'H', letter: 'H', color: '#AA96DA', left: '55%', top: '35%' },
  { id: 'A2', letter: 'A', color: '#FCBAD3', left: '20%', top: '70%' }
];

  // Festivals - SAME STRUCTURE AS FOOD GAME
// Festivals with EDUCATIONAL INFO
const festivals = [
  { 
    id: 'holi', 
    name: 'Holi', 
    image: holiIcon, 
    correct: false,
    month: 'March',
    subtitle: 'Festival of Colors',
    fact: 'We throw colorful powders and celebrate spring! 🎨'
  },
  { 
    id: 'diwali', 
    name: 'Diwali', 
    image: diwaliIcon, 
    correct: false,
    month: 'October-November',
    subtitle: 'Festival of Lights',
    fact: 'We light diyas and celebrate good over evil! 🪔'
  },
  { 
    id: 'janmashtami', 
    name: 'Janmashtami', 
    image: janmashtamiIcon, 
    correct: false,
    month: 'August',
    subtitle: "Krishna's Birthday",
    fact: 'We celebrate baby Krishna with songs and dahi handi! 🦚'
  },
  { 
    id: 'ganesh-chaturthi', 
    name: 'Ganesh Chaturthi', 
    image: ganeshChaturthiIcon, 
    correct: true,
    month: 'August-September',
    subtitle: "Ganesha's Birthday!",
    fact: 'We make clay Ganeshas and celebrate for 10 days! 🐘'
  }
];

  // Start game
  const handleStartGame = () => {
    setGamePhase('name-balloons');
  };

  // Pop balloon
// Pop balloon - MUST be in order!
// Pop balloon - MUST be in order! (but any matching letter works)
const handlePopBalloon = (letterId, letterIndex) => {
  if (poppedLetters.has(letterId)) return;

  // Get the current letter we're looking for
  const currentNeededLetter = nameLetters[currentLetterIndex].letter;
  const clickedLetter = nameLetters[letterIndex].letter;

  // Check if clicked letter MATCHES the needed letter (not just index!)
  if (clickedLetter !== currentNeededLetter) {
    // WRONG! Shake it
    setShakeWrongBalloon(letterId);
    setTimeout(() => setShakeWrongBalloon(null), 500);
    return;
  }

  // CORRECT! Pop it
  setPoppedLetters(prev => new Set([...prev, letterId]));
  setCurrentLetterIndex(prev => prev + 1);
  setShowConfetti(true);

  // Update instruction message
  if (poppedLetters.size + 1 < nameLetters.length) {
    setInstructionMessage('Great! Keep going! 🎈');
  } else {
    setInstructionMessage('Amazing! All balloons popped! 🎉');
  }

  setTimeout(() => setShowConfetti(false), 500);

  if (poppedLetters.size + 1 === nameLetters.length) {
    setTimeout(() => {
      setGamePhase('name-complete');
      setTimeout(() => setGamePhase('birthday-intro'), 3000);
    }, 800);
  }
};

  // Start birthday choice
  const handleStartBirthdayChoice = () => {
    setWrongFestivals(new Set());
    setShowShake(null);
    setGamePhase('birthday-choice');
  };

  // Handle festival click - EXACTLY LIKE FOOD GAME
  const handleFestivalClick = (festivalId) => {
    if (wrongFestivals.has(festivalId)) return;
    
    const festival = festivals.find(f => f.id === festivalId);
    
    if (festival.correct) {
      // Correct!
      setSelectedFestival(festivalId);
      setGamePhase('birthday-correct');
      
      setTimeout(() => {
        setGamePhase('ending');
        setGameState(prev => ({ ...prev, completed: true }));
        
        setTimeout(() => setShowSceneCompletion(true), 3000);
      }, 2500);
    } else {
      // Wrong - shake and mark
      setShowShake(festivalId);
      setTimeout(() => {
        setWrongFestivals(prev => new Set([...prev, festivalId]));
      }, 100);
      setTimeout(() => setShowShake(null), 500);
    }
  };

  // Handle card flip to show info
const handleCardFlip = (festivalId) => {
  setFlippedCards(prev => {
    const newSet = new Set(prev);
    if (newSet.has(festivalId)) {
      newSet.delete(festivalId);
    } else {
      newSet.add(festivalId);
    }
    return newSet;
  });
};



  return (
    <div className="name-birthday-game">
      {/* Background */}
      <div 
        className="game-background"
        style={{
          backgroundImage: `url(${nameBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>

      {/* Intro Screen */}
      {gamePhase === 'intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="intro-speech">
            <p className="intro-text">Let's find my name!</p>
            <button className="start-btn" onClick={handleStartGame}>Let's Play! 🎈</button>
          </div>
        </div>
      )}

      {/* Back Button */}
      {gamePhase !== 'intro' && !showSceneCompletion && (
        <button className="back-btn" onClick={onBack}>← Back</button>
      )}

      {/* Name Balloons Phase */}
      {gamePhase === 'name-balloons' && (
        <div className="name-phase">
          <div className="ganesha-center">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-waiting bounce-gentle" />
          </div>


          <div className="instruction-bubble">{instructionMessage}</div>

          {/* Letter Tracker */}
  <div className="letter-tracker">
  {nameLetters.map((item, index) => {
    const isFilled = index < currentLetterIndex;
    return (
      <div 
        key={item.id}
        className={`letter-box ${isFilled ? 'filled' : 'empty'}`}
      >
        {isFilled ? nameLetters[index].letter : ''}
      </div>
    );
  })}
  <div className="tracker-progress">
    {currentLetterIndex} of {nameLetters.length}
  </div>
</div>

          {/* ADD HINT BUTTON */}
          <button 
            className="hint-button bounce-gentle"
            onClick={() => setShowHintModal(true)}
          >
            💡 Hint
          </button>

          <div className="balloons-container">
           {nameLetters.map((item, index) => !poppedLetters.has(item.id) && (
              <button
                key={item.id}
                className={`balloon-btn float-balloon ${shakeWrongBalloon === item.id ? 'shake-wrong' : ''}`}
                onClick={() => handlePopBalloon(item.id, index)}
                style={{
                  left: item.left,
                  top: item.top,
                  '--balloon-color': item.color,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div className="balloon-body">
                  <div className="balloon-letter">{item.letter}</div>
                </div>
                <div className="balloon-string"></div>
              </button>
            ))}
          </div>

          {showConfetti && (
            <div className="mini-confetti">
              {Array.from({length: 10}).map((_, i) => (
                <div key={i} className="confetti-piece" style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 50 + 25}%`,
                  animationDelay: `${Math.random() * 0.2}s`
                }}>✨</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hint Modal */}
          {showHintModal && (
            <div className="hint-modal-overlay" onClick={() => setShowHintModal(false)}>
              <div className="hint-modal-content" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="hint-close-btn"
                  onClick={() => setShowHintModal(false)}
                >
                  ✕
                </button>
                
                <img 
                  src={babyGaneshaImg} 
                  alt="Ganesha" 
                  className="hint-ganesha bounce"
                />
                
                <div className="hint-message">
                  <p className="hint-title">My name is:</p>
                  <div className="hint-name-display">
                    {nameLetters.map((item, index) => (
                      <span key={item.id} className="hint-letter" style={{
                        animationDelay: `${index * 0.1}s`
                      }}>
                        {item.letter}
                      </span>
                    ))}
                  </div>
                  <p className="hint-subtitle">Pop the balloons in this order!</p>
                </div>
              </div>
            </div>
          )}

      {/* Name Complete */}
      {gamePhase === 'name-complete' && (
        <div className="name-complete-screen">
          <div className="ganesha-happy">
            <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-clapping celebrate-scale" />
          </div>
          <div className="name-reveal">
            <div className="name-text glow-text">GANESHA</div>
          </div>
          <div className="celebration-confetti">
            {Array.from({length: 20}).map((_, i) => (
              <div key={i} className="confetti-piece" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`
              }}>
                {['✨', '🎉', '⭐', '💫'][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </div>
        </div>
      )}

{/* Birthday Intro - WITH CLUE */}
      {gamePhase === 'birthday-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="intro-speech clue-speech">
            <p className="intro-text">Now let's find my birthday! 🎂</p>
            <div className="clue-box">
              <div className="clue-icon">💡</div>
              <p className="clue-text">My birthday is a special celebration just for ME!</p>
              <p className="clue-text">It happens in <strong>August or September</strong>.</p>
              <p className="clue-text">Can you guess which festival? 🐘</p>
            </div>
            <button className="start-btn" onClick={handleStartBirthdayChoice}>Show Me The Festivals! 🪔</button>
          </div>
        </div>
      )}

      {/* Birthday Choice - WITH PREFIXES */}
      {gamePhase === 'birthday-choice' && (
        <div className="birthday-choice-screen">
          <div className="birthday-ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="birthday-ganesha-small bounce-gentle" />
          </div>
          
          <div className="birthday-speech-bubble">
            Which festival is my birthday? 🎊
          </div>

<div className="birthday-choices-container">
            {festivals.map((festival, index) => {
              const isLeftColumn = index % 2 === 0; // 0,2 = LEFT | 1,3 = RIGHT
              
              return (
                <div key={festival.id} className="birthday-card-container">
                  {/* MAIN CARD */}
                  <button
                    className={`birthday-choice-card ${showShake === festival.id ? 'birthday-shake' : ''} ${wrongFestivals.has(festival.id) ? 'birthday-wrong' : ''} ${flippedCards.has(festival.id) ? 'card-info-open' : ''}`}
                    onClick={() => handleFestivalClick(festival.id)}
                    disabled={wrongFestivals.has(festival.id)}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="birthday-choice-image-container">
                      <img src={festival.image} alt={festival.name} className="birthday-choice-image" />
                    </div>
                    <div className="birthday-choice-name">{festival.name}</div>
                    <div className="birthday-choice-subtitle">{festival.subtitle}</div>
                  </button>

                  {/* INFO ICON */}
                  <button 
                    className="birthday-info-icon"
                    onClick={() => handleCardFlip(festival.id)}
                    disabled={wrongFestivals.has(festival.id)}
                  >
                    ⓘ
                  </button>

                  {/* SLIDE-OUT INFO PANEL */}
                  {flippedCards.has(festival.id) && (
                    <div className={`birthday-info-panel ${isLeftColumn ? 'slide-left' : 'slide-right'}`}>
                      <button 
                        className="birthday-info-close"
                        onClick={() => handleCardFlip(festival.id)}
                      >
                        ✕
                      </button>
                      
                      <div className="birthday-info-content">
                        <div className="birthday-info-month">{festival.month}</div>
                        <div className="birthday-info-fact">{festival.fact}</div>
                        
                        <button 
                          className="birthday-info-choose-btn"
                          onClick={() => handleFestivalClick(festival.id)}
                        >
                          {festival.correct ? "Yes! Choose This! 🎉" : "Choose This Festival"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
    </div>
  )}

      {/* Birthday Correct - Celebration */}
      {gamePhase === 'birthday-correct' && (
        <div className="birthday-correct-screen">
          <div className="birthday-ganesha-happy">
            <img src={babyGaneshaSit} alt="Happy Ganesha" className="birthday-ganesha-celebrate" />
          </div>
          
          <div className="birthday-correct-festival">
            <img 
              src={festivals.find(f => f.id === selectedFestival).image} 
              alt="Ganesh Chaturthi" 
              className="birthday-festival-in-hand pop-in"
            />
          </div>

          <div className="birthday-celebration-sparkles">
            {Array.from({length: 15}).map((_, i) => (
              <div key={i} className="birthday-sparkle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`
              }}>✨</div>
            ))}
          </div>

          <div className="birthday-success-message">
            Yes! Ganesh Chaturthi is my birthday! 🎉
          </div>
        </div>
      )}

      {/* Ending Screen */}
      {gamePhase === 'ending' && !showSceneCompletion && (
        <div className="birthday-ending-screen">
          <div className="birthday-final-display">
            <img src={babyGaneshaSit} alt="Ganesha" className="birthday-ganesha-final" />
            <img 
              src={festivals.find(f => f.id === selectedFestival).image} 
              alt="Festival" 
              className="birthday-final-festival"
            />
          </div>

          <div className="birthday-final-message">
            <h2 className="birthday-final-title">Perfect! 🌟</h2>
            <p className="birthday-final-text">
              You found my name and birthday!
            </p>
          </div>

          <div className="birthday-badge-container">
            <div className="birthday-badge-earned pop-in">
              🎖️ Festival Finder!
            </div>
          </div>
        </div>
      )}

      {/* About Me Completion Screen */}
      {showSceneCompletion && (
        <AboutMeCompletion
          show={showSceneCompletion}
          sceneName="Name & Birthday"
          sceneNumber={4}
          totalScenes={4}
          starsEarned={gameState.stars}
          totalStars={2}
          discoveredBadges={['festival-finder', 'name-master', 'birthday-buddy', 'celebration-star']}
          badgeImages={{}}
          characterImages={{ babyGanesha: babyGaneshaImg }}
          nextSceneName="Explore More!"
          childName="festival finder"
          isFinalScene={true}
          
          onContinue={() => {
            setTimeout(() => {
              if (onNavigate) onNavigate('zone-complete');
              else if (onComplete) onComplete();
            }, 100);
          }}
          
          onReplay={() => {
            setGamePhase('intro');
            setPoppedLetters(new Set());
            setSelectedFestival(null);
            setShowShake(null);
            setWrongFestivals(new Set());
            setShowSceneCompletion(false);
            setGameState({ stars: 2, completed: false });
          }}
          
          onBackToMap={() => {
            if (onNavigate) onNavigate('zone-welcome');
            else if (onBack) onBack();
          }}
          
          onHome={() => { if (onNavigate) onNavigate('home'); }}
        />
      )}
    </div>
  );
};

export default NameBirthdayGame;