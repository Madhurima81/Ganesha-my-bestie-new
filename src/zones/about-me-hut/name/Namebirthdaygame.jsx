import React, { useState, useEffect, useRef } from 'react';
import './NameBirthdayGame.css';
import AboutMeCompletion from "../components/Aboutmecompletion";
import '../../shared/components/OpeningModal.css'; // <--- SHARED MODAL IMPORT
import BackToMapButton from '../../../lib/components/navigation/BackToMapButton';


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

const reloadHandledRef = useRef(false);
const [showResumePopup, setShowResumePopup] = useState(false);
const [resumeMessage, setResumeMessage] = useState('');


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
    fact: 'Colors fly in the air!'
  },
  { 
    id: 'diwali', 
    name: 'Diwali', 
    image: diwaliIcon, 
    correct: false,
    month: 'October-November',
    subtitle: 'Festival of Lights',
    fact: '🪔 We light lamps and smile bright.'
  },
  { 
    id: 'janmashtami', 
    name: 'Janmashtami', 
    image: janmashtamiIcon, 
    correct: false,
    month: 'August',
    subtitle: "Krishna's Birthday",
    fact: '🪶 Baby Krishna is born.🦚'
  },
  { 
    id: 'ganesh-chaturthi', 
    name: 'Ganesh Chaturthi', 
    image: ganeshChaturthiIcon, 
    correct: true,
    month: 'August-September',
    subtitle: "Ganesha's Birthday!",
    fact: '🐘 We make Ganesha with clay.'
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

  // ==================== RELOAD DETECTION ====================
useEffect(() => {
  const sessionKey = `namebirthday_session_${Date.now()}`;
  const existingSession = localStorage.getItem('namebirthday_current_session');
  
  const isReload = existingSession !== null;
  
  if (isReload && !reloadHandledRef.current) {
    reloadHandledRef.current = true;
    
    console.log("🔄 Reload detected, gamePhase:", gamePhase);
    
    // INTRO - No popup
    if (gamePhase === 'intro') {
      return;
    }
    
    // NAME BALLOONS - Show progress
    if (gamePhase === 'name-balloons' && poppedLetters.size > 0) {
      setResumeMessage(`Great! You've popped ${poppedLetters.size}/7 balloons! Keep going!`);
      setShowResumePopup(true);
      setTimeout(() => setShowResumePopup(false), 5000);
      return;
    }
    
    // CHILD NAME INPUT - Show progress
    if (gamePhase === 'child-name-input' && childNameLetters.length > 0) {
      setResumeMessage(`Continue typing your name! (${childNameLetters.length} letters typed)`);
      setShowResumePopup(true);
      setTimeout(() => setShowResumePopup(false), 5000);
      return;
    }
    
    // BIRTHDAY CHOICE - Show progress
    if (gamePhase === 'birthday-choice' && wrongFestivals.size > 0) {
      setResumeMessage(`Keep trying! You've eliminated ${wrongFestivals.size} option${wrongFestivals.size > 1 ? 's' : ''}!`);
      setShowResumePopup(true);
      setTimeout(() => setShowResumePopup(false), 5000);
      return;
    }
    
    // CHILD BIRTHDAY MONTH - Already selected
    if (gamePhase === 'child-birthday-month' && childBirthdayMonth) {
      setResumeMessage(`You picked ${childBirthdayMonthName}! Continue to select date.`);
      setShowResumePopup(true);
      setTimeout(() => {
        setShowResumePopup(false);
        setGamePhase('child-birthday-date');
      }, 3000);
      return;
    }
    
    // CHILD BIRTHDAY DATE - Already selected
    if (gamePhase === 'child-birthday-date' && childBirthdayDate) {
      setResumeMessage(`You picked ${childBirthdayMonthName} ${childBirthdayDate}!`);
      setShowResumePopup(true);
      setTimeout(() => {
        setShowResumePopup(false);
        setGamePhase('child-birthday-complete');
      }, 3000);
      return;
    }
    
    // CELEBRATION/INTRO PHASES - Show as-is
    if (gamePhase.includes('complete') || gamePhase.includes('intro') || gamePhase === 'birthday-correct') {
      return;
    }
    
    // BESTIES CARD/ENDING - Show as-is
    if (gamePhase === 'besties-card' || gamePhase === 'ending') {
      return;
    }
  }
  
  localStorage.setItem('namebirthday_current_session', sessionKey);
  
  return () => {
    localStorage.removeItem('namebirthday_current_session');
  };
}, []);

useEffect(() => {
  return () => {
    reloadHandledRef.current = false;
  };
}, []);


  // Pop balloon
// Pop balloon - MUST be in order!
// Pop balloon - MUST be in order! (but any matching letter works)
/*const handlePopBalloon = (letterId, letterIndex) => {
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
};*/

// Add this array inside your component (or outside it)
  const encouragingPhrases = [
    "Let’s try the next one 🌼",
    "Look closely 👀",
    "You’ve got this 💛"
  ];

  // UPDATED handlePopBalloon function
  const handlePopBalloon = (letterId, letterIndex) => {
    if (poppedLetters.has(letterId)) return;

    const currentNeededLetter = nameLetters[currentLetterIndex].letter;
    const clickedLetter = nameLetters[letterIndex].letter;

    // --- WRONG TAP LOGIC ---
    if (clickedLetter !== currentNeededLetter) {
      setShakeWrongBalloon(letterId);
      setTimeout(() => setShakeWrongBalloon(null), 500);

      // Capture the current message so we can revert to it
      const previousMsg = instructionMessage;
      
      // Only update if we aren't already showing the error message
      if (previousMsg !== "Almost there… look for the next letter 👀") {
        setInstructionMessage("Almost there… look for the next letter 👀");
        
        // Revert back after 800ms
        setTimeout(() => {
          setInstructionMessage(previousMsg);
        }, 800);
      }
      return;
    }

    // --- CORRECT TAP LOGIC ---
    setPoppedLetters(prev => new Set([...prev, letterId]));
    setCurrentLetterIndex(prev => prev + 1);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 500);

    // Check if Game Complete
    if (poppedLetters.size + 1 === nameLetters.length) {
      setInstructionMessage('Amazing! All balloons popped! 🎉');
      setTimeout(() => {
        setGamePhase('name-complete');
        setTimeout(() => setGamePhase('child-name-intro'), 3000);
      }, 800);
    } else {
      // Pick a random encouraging phrase for the next step
      const randomPhrase = encouragingPhrases[Math.floor(Math.random() * encouragingPhrases.length)];
      setInstructionMessage(randomPhrase);
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
                I have a special name and a special birthday.
<br />
               Let’s discover them together!
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
                Let’s Begin 🌱
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
{/* Child Name Intro - NEW DESIGN */}
      {gamePhase === 'child-name-intro' && (
        <div className="child-intro-overlay">
          <img 
            src={babyGaneshaImg} 
            alt="Baby Ganesha" 
            className="child-intro-ganesha bounce" 
          />
          
          <div className="child-intro-card">
            <h2 className="child-intro-title">
              Now you know my name and birthday
            </h2>
            {/*<p className="child-intro-text">
              But what's YOUR name? 🎈
            </p>*/}
            
            <button 
              className="child-intro-btn" 
              onClick={() => setGamePhase('child-name-input')}
            >
              Tell Me Your Name! ✨
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

{/* Child Birthday Intro - NEW DESIGN */}
      {gamePhase === 'child-birthday-intro' && (
        <div className="child-bday-intro-overlay">
          <img 
            src={babyGaneshaImg} 
            alt="Baby Ganesha" 
            className="child-bday-intro-ganesha bounce" 
          />
          
          <div className="child-bday-intro-card">
            <h2 className="child-bday-intro-title">
              Now I know YOUR name, {childName}! 🎈
            </h2>
            <p className="child-bday-intro-text">
              But when is YOUR birthday? 🎂
            </p>
            
            <button 
              className="child-bday-intro-btn" 
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
   {/* BESTIES CARD - FINAL CELEBRATION (NEW DESIGN) */}
      {gamePhase === 'besties-card' && (
        <div className="besties-overlay">
          
          <h1 className="besties-title">BEST FRIENDS FOREVER! 💖</h1>
          <div className="besties-subtitle">We both love celebrations!</div>

          <div className="besties-cards">
            
            {/* GANESHA CARD */}
            <div className="besties-card">
              <img src={babyGaneshaSit} alt="Ganesha" className="besties-avatar" />
              <div className="besties-card-name">GANESHA</div>
              
              <div className="besties-info-row">
                <span className="besties-label">Birthday:</span>
                <span className="besties-value">Ganesh Chaturthi</span>
              </div>
              <div className="besties-info-row">
                <span className="besties-label">Month:</span>
                <span className="besties-value">Aug-Sept 🐘</span>
              </div>
              {/*<div className="besties-info-row">
                <span className="besties-label">Favorite:</span>
                <span className="besties-value">Modaks 🍬</span>
              </div>*/}
            </div>

            {/* CONNECTOR */}
            <div className="besties-connector">
              <div className="besties-heart">❤️</div>
              <span>F</span>
              <span>R</span>
              <span>I</span>
              <span>E</span>
              <span>N</span>
              <span>D</span>
              <span>S</span>
              <div className="besties-heart">❤️</div>
            </div>

            {/* CHILD CARD */}
            <div className="besties-card">
              {/* Use avatar image or initials circle */}
              <div className="child-avatar-circle" style={{width: '80px', height: '80px', margin: '0 auto'}}>
                 <div className="child-initial" style={{fontSize: '40px'}}>{childName.charAt(0)}</div>
              </div>
              <div className="besties-card-name">{childName.toUpperCase()}</div>

              <div className="besties-info-row">
                <span className="besties-label">Birthday:</span>
                <span className="besties-value">{childBirthdayMonthName} {childBirthdayDate}</span>
              </div>
              <div className="besties-info-row">
                <span className="besties-label">Festival:</span>
                <span className="besties-value">
                  {monthFestivals.find(m => m.month === childBirthdayMonth)?.emoji} {monthFestivals.find(m => m.month === childBirthdayMonth)?.name}
                </span>
              </div>
              {/*<div className="besties-info-row">
                <span className="besties-label">Best Friend:</span>
                <span className="besties-value">Ganesha! 🐘</span>
              </div>*/}
            </div>

          </div>

          <div className="besties-badge-container">
            <div className="besties-badge">
              🎖️ OFFICIAL BESTIES BADGE 🎖️
            </div>
            
            <button 
              className="besties-end-btn"
              onClick={() => {
                setGameState(prev => ({ ...prev, completed: true }));
                setShowSceneCompletion(true);
              }}
            >
              Finish Game ✨
            </button>
          </div>

        </div>
      )}

{/* Birthday Intro - WITH CLUE */}
{/* Birthday Intro - NEW DESIGN */}
      {gamePhase === 'birthday-intro' && (
        <div className="bday-quest-overlay">
          {/* Ganesha sits outside/above the card */}
          <img 
            src={babyGaneshaImg} 
            alt="Baby Ganesha" 
            className="bday-quest-ganesha bounce" 
          />
          
          <div className="bday-quest-card">
            {/* Title */}
            <h2 className="bday-quest-title">
              Let’s Find My Birthday 🎂
            </h2>

            {/* Body Copy */}
            <p className="bday-quest-text">
              My birthday is a joyful day when people celebrate together.<br />
              It comes during the festival season.
            </p>

            {/* Button */}
            <button 
              className="bday-quest-btn" 
              onClick={handleStartBirthdayChoice}
            >
              Let’s Explore 🌼
            </button>
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
    {/* ADD THIS OVERLAY */}
  {flippedCards.size > 0 && (
    <div 
      className="birthday-info-overlay"
      onClick={() => setFlippedCards(new Set())}
    />
  )}
  
            {festivals.map((festival, index) => {
              const isLeftColumn = index % 2 === 0; // 0,2 = LEFT | 1,3 = RIGHT
              
              return (
            <div 
  key={festival.id} 
  className={`birthday-card-container ${flippedCards.has(festival.id) ? 'container-active' : ''}`}
>
                  {/* MAIN CARD */}
             <button
  className={`birthday-choice-card ${showShake === festival.id ? 'birthday-shake' : ''} ${wrongFestivals.has(festival.id) ? 'birthday-wrong' : ''} ${flippedCards.has(festival.id) ? 'card-info-open' : ''}`}
  onClick={() => handleFestivalClick(festival.id)}
  disabled={wrongFestivals.has(festival.id) || flippedCards.size > 0} // ← UPDATED LINE
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
  onClick={(e) => {
    e.stopPropagation(); // Prevent triggering overlay click
    setFlippedCards(new Set());
  }}
>
  ✕
</button>
                      
                      <div className="birthday-info-content">
                        <div className="birthday-info-month">{festival.month}</div>
                        <div className="birthday-info-fact">{festival.fact}</div>
                        
                        {/*<button 
                          className="birthday-info-choose-btn"
                          onClick={() => handleFestivalClick(festival.id)}
                        >
                          {festival.correct ? "✅ This is my birthday!" : "Try this one"}
                        </button>*/}
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

      {/* Back to Map Button */}
{!showSceneCompletion && (
  <BackToMapButton onNavigate={onNavigate} />
)}


      {/* Resume Popup */}
{showResumePopup && (
  <div style={{
    position: 'fixed',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
    color: 'white',
    padding: '20px 40px',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    zIndex: 9999,
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: '80%',
    animation: 'slideDown 0.5s ease-out'
  }}>
    {resumeMessage}
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