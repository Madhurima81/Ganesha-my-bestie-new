import React, { useState, useEffect } from 'react';
import './Namebirthdaygame.css';
import AboutMeCompletion from "../components/Aboutmecompletion";
import '../../shared/components/OpeningModal.css'; // <--- SHARED MODAL IMPORT


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

const [childBirthdayMonth, setChildBirthdayMonth] = useState('');
const [childBirthdayMonthName, setChildBirthdayMonthName] = useState('');
const [childBirthdayDate, setChildBirthdayDate] = useState('');

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

// 12 Month-Festival Cards
const monthFestivals = [
  { month: 1, name: 'January', festival: 'Makar Sankranti', emoji: '🪁', color: '#87CEEB' },
  { month: 2, name: 'February', festival: 'Maha Shivaratri', emoji: '🔱', color: '#9370DB' },
  { month: 3, name: 'March', festival: 'Holi', emoji: '🎨', color: '#FF69B4' },
  { month: 4, name: 'April', festival: 'Ugadi', emoji: '🌸', color: '#FFB6C1' },
  { month: 5, name: 'May', festival: 'Akshaya Tritiya', emoji: '💰', color: '#FFD700' },
  { month: 6, name: 'June', festival: 'Rath Yatra', emoji: '🛕', color: '#FFA07A' },
  { month: 7, name: 'July', festival: 'Guru Purnima', emoji: '📿', color: '#DDA0DD' },
  { month: 8, name: 'August', festival: 'Raksha Bandhan', emoji: '🧵', color: '#F0E68C' },
  { month: 9, name: 'September', festival: 'Ganesh Chaturthi', emoji: '🐘', color: '#FFA500' },
  { month: 10, name: 'October', festival: 'Navratri', emoji: '🗡️', color: '#FF6347' },
  { month: 11, name: 'November', festival: 'Diwali', emoji: '🪔', color: '#FFD700' },
  { month: 12, name: 'December', festival: 'Karthigai Deepam', emoji: '🕯️', color: '#F4A460' }
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
setTimeout(() => setGamePhase('child-name-intro'), 3000);
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
        setGamePhase('child-birthday-intro'); // ✅ Keep this
        setGameState(prev => ({ ...prev, completed: true }));
        
        // Comment out scene completion for now
        // setTimeout(() => setShowSceneCompletion(true), 3000);
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

// Handle child name letter click
const handleChildNameLetterClick = (letter) => {
  setChildNameLetters(prev => [...prev, letter]);
};

// Remove last letter (backspace)
const handleChildNameBackspace = () => {
  setChildNameLetters(prev => prev.slice(0, -1));
};

// Confirm child's name
const handleChildNameConfirm = () => {
  const name = childNameLetters.join('');
  if (name.length < 2) {
    return; // Name too short
  }
  setChildName(name);
  
  // Save to localStorage
  localStorage.setItem('childName', name);
  
  setGamePhase('child-name-complete');
  
  // After celebration, move to Ganesha birthday
  setTimeout(() => {
    setGamePhase('birthday-intro');
  }, 3000);
};

// Handle month selection
const handleMonthSelect = (monthData) => {
  setChildBirthdayMonth(monthData.month);
  setChildBirthdayMonthName(monthData.name);
  setGamePhase('child-birthday-date');
};

// Handle date selection
const handleDateSelect = (date) => {
  setChildBirthdayDate(date);
  
  // Save to localStorage
  localStorage.setItem('childBirthdayMonth', childBirthdayMonthName);
  localStorage.setItem('childBirthdayDate', date);
  localStorage.setItem('childBirthday', `${childBirthdayMonth}-${date}`);
  
  setGamePhase('child-birthday-complete');
  
  // After celebration, show bestie card
  setTimeout(() => {
    setGamePhase('besties-card');
  }, 3000);
};

// Get number of days in selected month
const getDaysInMonth = (month) => {
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysInMonth[month - 1];
};

// Generate Ganesha's response based on child's birthday
const getGaneshaResponse = () => {
  if (childBirthdayMonth === 9) {
    return "September! That's MY birthday month too! We're birthday twins! 🐘❤️";
  } else if (childBirthdayMonth === 8) {
    return "August! That's so close to my birthday in September! Almost birthday twins! 🎈";
  } else {
    const monthData = monthFestivals.find(m => m.month === childBirthdayMonth);
    return `${monthData.name}! That's during ${monthData.festival}! What a special birthday! ${monthData.emoji}`;
  }
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

     {/* SHARED INTRO MODAL */}
      {gamePhase === 'intro' && (
        <div className="game-modal-overlay" id="name-birthday-intro">
          <div className="game-modal-content">
            
            {/* Character */}
            <div className="game-modal-character">
              <img src={babyGaneshaImg} alt="Baby Ganesha" />
            </div>

            {/* The Cream Card */}
            <div className="game-modal-card">
              <h1 className="game-modal-title">Name & Birthday Quest!</h1>
              
              <p className="game-modal-subtitle">
                I have a big name and a big birthday!<br />
                Can you solve my puzzles to find out what they are?
              </p>

              {/* Icons Row */}
              <div className="game-modal-icons">
                
                {/* 1. Name Icon */}
                <div className="game-modal-icon-item">
                  <div className="game-modal-icon-circle" style={{background: '#EDE7F6', borderColor: '#D1C4E9'}}>
                    <span style={{fontSize: '2.5rem'}}>🔤</span>
                  </div>
                  <span className="game-modal-icon-label">Name</span>
                </div>

                {/* 2. Birthday Icon */}
                <div className="game-modal-icon-item">
                  <div className="game-modal-icon-circle" style={{background: '#E3F2FD', borderColor: '#90CAF9'}}>
                    <span style={{fontSize: '2.5rem'}}>🎂</span>
                  </div>
                  <span className="game-modal-icon-label">Birthday</span>
                </div>

              </div>

              <button className="game-modal-button" onClick={handleStartGame}>
                Start the Puzzle! 🧩
              </button>
            </div>
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

      {/* Child Name Intro */}
      {gamePhase === 'child-name-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="intro-speech">
            <p className="intro-text">Now I know MY name and birthday!</p>
            <p className="intro-text">But what's YOUR name? 🎈</p>
            <button 
              className="start-btn" 
              onClick={() => setGamePhase('child-name-input')}
            >
              Tell You My Name! ✨
            </button>
          </div>
        </div>
      )}

      {/* Child Name Input - Letter Tiles */}
      {gamePhase === 'child-name-input' && (
        <div className="child-name-input-screen">
          <div className="child-input-ganesha">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-watching bounce-gentle" />
          </div>

          <div className="child-instruction-bubble">
            Tap the letters to spell your name! 🎈
          </div>

          {/* Name Display Box */}
          <div className="child-name-display">
            {childNameLetters.length === 0 ? (
              <div className="name-placeholder">Your Name Here</div>
            ) : (
              childNameLetters.map((letter, index) => (
                <div key={index} className="child-name-letter pop-in">
                  {letter}
                </div>
              ))
            )}
          </div>

          {/* Control Buttons */}
          <div className="child-name-controls">
            <button 
              className="child-backspace-btn"
              onClick={handleChildNameBackspace}
              disabled={childNameLetters.length === 0}
            >
              ⌫ Delete
            </button>
            <button 
              className="child-confirm-btn"
              onClick={handleChildNameConfirm}
              disabled={childNameLetters.length < 2}
            >
              That's My Name! ✓
            </button>
          </div>

          {/* Letter Tiles Keyboard */}
          <div className="child-letter-keyboard">
            {availableLetters.map((letter, index) => (
              <button
                key={index}
                className="child-letter-tile bounce-gentle"
                onClick={() => handleChildNameLetterClick(letter)}
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Child Name Complete - Celebration */}
      {gamePhase === 'child-name-complete' && (
        <div className="child-name-celebration-screen">
          <div className="celebration-ganesha">
            <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          </div>

          <div className="child-name-reveal">
            <div className="child-name-text glow-text">{childName}!</div>
            <p className="ganesha-compliment">What a beautiful name! 🌟</p>
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

      {/* Child Birthday Intro */}
      {gamePhase === 'child-birthday-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="intro-speech">
            <p className="intro-text">Now I know YOUR name, {childName}! 🎈</p>
            <p className="intro-text">But when is YOUR birthday? 🎂</p>
            <button 
              className="start-btn" 
              onClick={() => setGamePhase('child-birthday-month')}
            >
              Tell You My Birthday! 🎉
            </button>
          </div>
        </div>
      )}

      {/* Child Birthday - Month Selection */}
      {gamePhase === 'child-birthday-month' && (
        <div className="child-birthday-month-screen">
          <div className="child-input-ganesha">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-watching bounce-gentle" />
          </div>

          <div className="child-instruction-bubble">
            Tap the month you were born! 🗓️
          </div>

          <div className="month-festivals-grid">
            {monthFestivals.map((monthData, index) => (
              <button
                key={monthData.month}
                className="month-festival-card bounce-gentle"
                onClick={() => handleMonthSelect(monthData)}
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  borderColor: monthData.color
                }}
              >
                <div className="month-festival-emoji">{monthData.emoji}</div>
                <div className="month-festival-name">{monthData.name}</div>
                <div className="month-festival-subtitle">{monthData.festival}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Child Birthday - Date Selection */}
      {gamePhase === 'child-birthday-date' && (
        <div className="child-birthday-date-screen">
          <div className="child-input-ganesha">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-watching bounce-gentle" />
          </div>

          <div className="child-instruction-bubble">
            Which day in {childBirthdayMonthName}? 📅
          </div>

          <div className="date-picker-grid">
            {Array.from({ length: getDaysInMonth(childBirthdayMonth) }, (_, i) => i + 1).map((date) => (
              <button
                key={date}
                className="date-picker-button bounce-gentle"
                onClick={() => handleDateSelect(date)}
                style={{ animationDelay: `${date * 0.02}s` }}
              >
                {date}
              </button>
            ))}
          </div>

          <button 
            className="back-to-months-btn"
            onClick={() => setGamePhase('child-birthday-month')}
          >
            ← Change Month
          </button>
        </div>
      )}

      {/* Child Birthday Complete - Celebration */}
      {gamePhase === 'child-birthday-complete' && (
        <div className="child-birthday-celebration-screen">
          <div className="celebration-ganesha">
            <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          </div>

          <div className="child-birthday-reveal">
            <div className="child-birthday-text glow-text">
              {childBirthdayMonthName} {childBirthdayDate}!
            </div>
            <p className="ganesha-birthday-response">{getGaneshaResponse()}</p>
          </div>

          <div className="celebration-confetti">
            {Array.from({length: 20}).map((_, i) => (
              <div key={i} className="confetti-piece" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`
              }}>
                {['🎂', '🎉', '⭐', '🎈'][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BESTIES CARD - Final Celebration */}
      {gamePhase === 'besties-card' && (
        <div className="besties-card-screen">
          <div className="besties-header">
            <h1 className="besties-title glow-text">BEST FRIENDS FOREVER! 🎊</h1>
            <div className="besties-subtitle">We both love celebrations!</div>
          </div>

          <div className="besties-comparison-container">
            {/* GANESHA SIDE */}
            <div className="bestie-card ganesha-side pop-in">
              <div className="bestie-card-header" style={{ background: 'linear-gradient(135deg, #FF8C00, #FFA500)' }}>
                <img src={babyGaneshaSit} alt="Ganesha" className="bestie-avatar bounce-gentle" />
                <h2 className="bestie-name">GANESHA</h2>
              </div>
              
              <div className="bestie-card-body">
                <div className="bestie-info-row">
                  <div className="info-label">Birthday:</div>
                  <div className="info-value">Ganesh Chaturthi</div>
                </div>
                
                <div className="bestie-info-row">
                  <div className="info-label">Month:</div>
                  <div className="info-value">August-September 🐘</div>
                </div>
                
                <div className="bestie-info-row">
                  <div className="info-label">Favorite:</div>
                  <div className="info-value">Modak sweets! 🍬</div>
                </div>
                
                <div className="bestie-info-row">
                  <div className="info-label">Special Power:</div>
                  <div className="info-value">Removing obstacles! ✨</div>
                </div>
              </div>
            </div>

            {/* HEART CONNECTOR */}
            <div className="besties-connector">
              <div className="heart-icon pulse">❤️</div>
              <div className="connector-text">BESTIES</div>
              <div className="heart-icon pulse">❤️</div>
            </div>

            {/* CHILD SIDE */}
            <div className="bestie-card child-side pop-in" style={{ animationDelay: '0.3s' }}>
<div className="bestie-card-header" style={{ background: 'linear-gradient(135deg, #4ECDC4, #44A08D)' }}>
                  <div className="child-avatar-circle">
                  <div className="child-initial">{childName.charAt(0)}</div>
                </div>
                <h2 className="bestie-name">{childName.toUpperCase()}</h2>
              </div>
              
              <div className="bestie-card-body">
                <div className="bestie-info-row">
                  <div className="info-label">Birthday:</div>
                  <div className="info-value">{childBirthdayMonthName} {childBirthdayDate}</div>
                </div>
                
                <div className="bestie-info-row">
                  <div className="info-label">Month:</div>
                  <div className="info-value">
                    {monthFestivals.find(m => m.month === childBirthdayMonth)?.festival} {monthFestivals.find(m => m.month === childBirthdayMonth)?.emoji}
                  </div>
                </div>
                
                <div className="bestie-info-row">
                  <div className="info-label">Best Friend:</div>
                  <div className="info-value">Ganesha! 🐘</div>
                </div>
                
                <div className="bestie-info-row">
                  <div className="info-label">Special Quality:</div>
                  <div className="info-value">Super smart! 🌟</div>
                </div>
              </div>
            </div>
          </div>

          {/* BESTIE BADGE */}
          <div className="bestie-badge-container">
            <div className="bestie-badge celebrate-scale">
              🎖️ OFFICIAL BESTIES BADGE 🎖️
            </div>
            {childBirthdayMonth === 9 && (
              <div className="special-message">
                🎉 WOW! You both have birthdays in September! BIRTHDAY TWINS! 🎉
              </div>
            )}
            {(childBirthdayMonth === 8 || childBirthdayMonth === 9) && childBirthdayMonth !== 9 && (
              <div className="special-message">
                🎈 Your birthdays are SO close! Almost twins! 🎈
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          {/* ACTION BUTTONS */}
<div className="besties-action-buttons">
  <button 
    className="bestie-btn end-game-btn"
    onClick={() => {
      setGameState(prev => ({ ...prev, completed: true }));
      setShowSceneCompletion(true);
    }}
  >
    🎖️ End Game
  </button>
</div>

          {/* FLOATING CONFETTI */}
          <div className="besties-confetti">
            {Array.from({length: 30}).map((_, i) => (
              <div key={i} className="confetti-piece" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}>
                {['🎊', '🎉', '⭐', '💫', '🎈', '❤️'][Math.floor(Math.random() * 6)]}
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
  style={{
    [isLeftColumn ? 'left' : 'right']: '10px'
  }}
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