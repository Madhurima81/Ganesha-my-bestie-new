import React, { useState } from 'react';
import './NameBirthdayGame.css';
import AboutMeCompletion from "../components/Aboutmecompletion";
import DrawingPad from "../components/Drawingpad";

// Import images
import nameBg from './assets/images/name-bg.png';
import babyGaneshaImg from './assets/images/baby-ganesha-sit.png';
import ganeshChaturthiIcon from './assets/images/chaturthi.png';
import holiIcon from './assets/images/holi.png';
import diwaliIcon from './assets/images/diwali.png';

const NameBirthdayGame = ({ onComplete, onBack, onNavigate }) => {
  // Game phases: intro → spellPuzzle → nameInput → birthdayQuiz → childBirthday → sideBySide → identityPower → completion
  const [gamePhase, setGamePhase] = useState('intro');
  
  // Spelling puzzle state
  const [letterSlots, setLetterSlots] = useState(['G', '', '', '', '', '', '']); // G already placed
  const [availableLetters, setAvailableLetters] = useState(['A', 'H', 'E', 'S', 'N', 'A']); // G removed
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [wrongSlot, setWrongSlot] = useState(null);
  
  // Name & birthday state
  const [childName, setChildName] = useState('');
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [wrongFestivals, setWrongFestivals] = useState(new Set());
  const [showShake, setShowShake] = useState(null);
  const [childMonth, setChildMonth] = useState('');
  const [childDay, setChildDay] = useState('');
  
  // Game completion
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [gameState, setGameState] = useState({ stars: 2, completed: false });

  const correctWord = ['G', 'A', 'N', 'E', 'S', 'H', 'A'];
  
  const festivals = [
    { id: 'diwali', name: 'Diwali', subtitle: 'Festival of Lights', image: diwaliIcon, correct: false },
    { id: 'holi', name: 'Holi', subtitle: 'Festival of Colors', image: holiIcon, correct: false },
    { id: 'ganesh-chaturthi', name: 'Ganesh Chaturthi', subtitle: 'My Special Day!', image: ganeshChaturthiIcon, correct: true }
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleStartGame = () => {
    // Shuffle available letters (without G)
    const shuffled = [...availableLetters].sort(() => Math.random() - 0.5);
    setAvailableLetters(shuffled);
    setGamePhase('spellPuzzle');
  };

  // Spelling puzzle - click letter then slot
  const handleLetterClick = (letter, index) => {
    if (!availableLetters[index]) return; // Already used
    setSelectedLetter({ letter, index });
  };

  const handleSlotClick = (slotIndex) => {
    if (!selectedLetter) return;
    if (letterSlots[slotIndex]) return; // Slot occupied
    if (slotIndex === 0) return; // First slot is locked with G

    // Check if letter is correct for this position
    const isCorrect = selectedLetter.letter === correctWord[slotIndex];

    if (isCorrect) {
      // Correct letter - place it
      const newSlots = [...letterSlots];
      newSlots[slotIndex] = selectedLetter.letter;
      setLetterSlots(newSlots);

      // Remove from available
      const newAvailable = [...availableLetters];
      newAvailable[selectedLetter.index] = null;
      setAvailableLetters(newAvailable);

      setSelectedLetter(null);

      // Check if complete
      if (newSlots.every(s => s !== '')) {
        const isCorrect = newSlots.join('') === correctWord.join('');
        if (isCorrect) {
          setTimeout(() => {
            setGamePhase('nameReveal');
            setTimeout(() => setGamePhase('nameInput'), 3000);
          }, 1000);
        }
      }
    } else {
      // Wrong letter - bounce back
      setWrongSlot(slotIndex);
      setTimeout(() => {
        setWrongSlot(null);
        setSelectedLetter(null);
      }, 600);
    }
  };

  const handleNameSubmit = () => {
    if (childName.trim()) {
      setGamePhase('drawPoster');
    }
  };

  const handleSkipDrawing = () => {
    setGamePhase('nameConfirm');
    setTimeout(() => setGamePhase('birthdayQuiz'), 3000);
  };

  const handleFinishDrawing = () => {
    setGamePhase('nameConfirm');
    setTimeout(() => setGamePhase('birthdayQuiz'), 3000);
  };

  const handleFestivalClick = (festivalId) => {
    if (wrongFestivals.has(festivalId)) return;
    
    const festival = festivals.find(f => f.id === festivalId);
    
    if (festival.correct) {
      setSelectedFestival(festivalId);
      setGamePhase('birthdayCorrect');
      setTimeout(() => setGamePhase('childBirthday'), 3000);
    } else {
      setShowShake(festivalId);
      setTimeout(() => {
        setWrongFestivals(prev => new Set([...prev, festivalId]));
        setShowShake(null);
      }, 600);
    }
  };

  const handleBirthdaySubmit = () => {
    if (childMonth && childDay) {
      setGamePhase('sideBySide');
    }
  };

  const handleContinueToIdentity = () => {
    setGamePhase('identityPower');
    setTimeout(() => {
      setGameState(prev => ({ ...prev, completed: true }));
      setShowSceneCompletion(true);
    }, 3000);
  };

  return (
    <div className="name-birthday-game">
      {/* Background - SAME throughout */}
      <div 
        className="game-background"
        style={{
          backgroundImage: `url(${nameBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Back Button */}
      {gamePhase !== 'intro' && !showSceneCompletion && (
        <button className="back-btn" onClick={onBack}>← Back</button>
      )}

      {/* ========================================
          PHASE 1: INTRO
          ======================================== */}
      {gamePhase === 'intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="intro-speech">
            <h2 className="intro-title">Name & Birthday Quest!</h2>
            <p className="intro-text">
              I have a big name and a big birthday! Can you solve my puzzles to find out what they are?
            </p>
            <button className="start-btn" onClick={handleStartGame}>
              Start the Puzzle! 🎯
            </button>
          </div>
        </div>
      )}

      {/* ========================================
          PHASE 2: SPELLING PUZZLE
          ======================================== */}
      {gamePhase === 'spellPuzzle' && (
        <div className="spell-puzzle-screen">
          <div className="puzzle-ganesha">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-watching bounce-gentle" />
          </div>

          <div className="instruction-bubble">
            Tap a letter, then tap a box to spell my name! ✨
          </div>

          {/* Hint button */}
          <button className="hint-btn" onClick={() => setShowHint(true)}>
            💡 Need a Hint?
          </button>

          {/* Letter slots */}
          <div className="letter-slots">
            {letterSlots.map((letter, idx) => (
              <button
                key={idx}
                className={`letter-slot ${letter ? 'filled' : 'empty'} ${idx === 0 ? 'locked' : ''} ${wrongSlot === idx ? 'wrong-bounce' : ''}`}
                onClick={() => handleSlotClick(idx)}
                disabled={idx === 0}
              >
                {letter || '?'}
              </button>
            ))}
          </div>

          {/* Available letters */}
          <div className="available-letters">
            {availableLetters.map((letter, idx) => letter && (
              <button
                key={idx}
                className={`letter-tile ${selectedLetter?.index === idx ? 'selected' : ''}`}
                onClick={() => handleLetterClick(letter, idx)}
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Hint Modal */}
          {showHint && (
            <div className="modal-overlay" onClick={() => setShowHint(false)}>
              <div className="hint-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setShowHint(false)}>×</button>
                <img src={babyGaneshaImg} alt="Ganesha" className="hint-ganesha" />
                <h2 className="hint-title">Here's a Hint! 💡</h2>
                <div className="hint-word">
                  {correctWord.map((letter, idx) => (
                    <span key={idx} className="hint-letter">{letter}</span>
                  ))}
                </div>
                <p className="hint-text">My name is GANESHA!</p>
                <button className="hint-close-btn" onClick={() => setShowHint(false)}>
                  Got It! ✓
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================
          PHASE 3: NAME REVEAL
          ======================================== */}
      {gamePhase === 'nameReveal' && (
        <div className="name-reveal-screen">
          <div className="reveal-ganesha">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-glowing celebrate-scale" />
          </div>
          
          <div className="name-big glow-text">GANESHA</div>
          
          <div className="name-meaning">
            <p>"Leader of the People"</p>
            <p className="meaning-subtext">I help everyone find their way! ✨</p>
          </div>

          {/* Confetti */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              {['🎉', '✨', '⭐', '💫'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}

      {/* ========================================
          PHASE 4: CHILD'S NAME INPUT
          ======================================== */}
      {gamePhase === 'nameInput' && (
        <div className="name-input-screen">
          <div className="input-ganesha">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-asking bounce-gentle" />
          </div>

          <div className="question-bubble">
            You spelled it! Now, your turn!<br />
            What is your beautiful name?
          </div>

          <div className="name-input-container">
            <input
              type="text"
              className="sparkly-input"
              placeholder="Type your name here..."
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              autoFocus
            />
            <button 
              className="submit-name-btn"
              onClick={handleNameSubmit}
              disabled={!childName.trim()}
            >
              That's Me! ✨
            </button>
          </div>
        </div>
      )}

      {/* ========================================
          PHASE 4.5: DRAW YOUR NAME POSTER
          ======================================== */}
      {gamePhase === 'drawPoster' && (
        <div className="draw-poster-screen">
          <div className="poster-header">
            <img src={babyGaneshaImg} alt="Ganesha" className="poster-ganesha bounce-gentle" />
            <div className="poster-instruction">
              <h2 className="poster-title">Decorate Your Name! 🎨</h2>
              <p className="poster-text">
                Add hearts, smileys, and colors to make it special!
              </p>
            </div>
          </div>

          <div className="poster-canvas-container">
            <div className="name-poster-template">
              <h1 className="poster-child-name">{childName}</h1>
              <p className="poster-tagline">I am special!</p>
            </div>
            
            <DrawingPad />
          </div>

          <div className="poster-actions">
            <button className="skip-drawing-btn" onClick={handleSkipDrawing}>
              Skip Drawing →
            </button>
            <button className="finish-drawing-btn" onClick={handleFinishDrawing}>
              I'm Done! ✓
            </button>
          </div>
        </div>
      )}

      {/* ========================================
          PHASE 5: NAME CONFIRMATION
          ======================================== */}
      {gamePhase === 'nameConfirm' && (
        <div className="name-confirm-screen">
          <div className="confirm-ganesha">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-happy celebrate-scale" />
          </div>

          <div className="confirm-message">
            <h2 className="child-name-big">{childName}!</h2>
            <p className="confirm-text">That's a BEAUTIFUL name!</p>
            <p className="confirm-subtext">
              I'm Ganesha, you're {childName}...<br />
              We're going to be GREAT friends! 🤝
            </p>
          </div>
        </div>
      )}

      {/* ========================================
          PHASE 6: BIRTHDAY QUIZ
          ======================================== */}
      {gamePhase === 'birthdayQuiz' && (
        <div className="birthday-quiz-screen">
          <div className="quiz-ganesha">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-questioning bounce-gentle" />
          </div>

          <div className="quiz-bubble">
            One of these is my big birthday celebration.<br />
            Can you guess which one? 🎊
          </div>

          <div className="festival-cards-row">
            {festivals.map((festival, idx) => (
              <button
                key={festival.id}
                className={`festival-card ${showShake === festival.id ? 'shake-card' : ''} ${wrongFestivals.has(festival.id) ? 'wrong-card' : ''}`}
                onClick={() => handleFestivalClick(festival.id)}
                disabled={wrongFestivals.has(festival.id)}
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div className="festival-icon-container">
                  <img src={festival.image} alt={festival.name} className="festival-icon" />
                </div>
                <div className="festival-name">{festival.name}</div>
                <div className="festival-subtitle">{festival.subtitle}</div>
              </button>
            ))}
          </div>

          {wrongFestivals.size > 0 && (
            <div className="hint-message">
              Close! But that's not MY birthday. Try again! 💭
            </div>
          )}
        </div>
      )}

      {/* ========================================
          PHASE 7: BIRTHDAY CORRECT
          ======================================== */}
      {gamePhase === 'birthdayCorrect' && (
        <div className="birthday-correct-screen">
          <div className="correct-ganesha">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-celebrating celebrate-scale" />
          </div>

          <div className="correct-festival-display">
            <img src={ganeshChaturthiIcon} alt="Ganesh Chaturthi" className="festival-big pop-in" />
          </div>

          <div className="correct-message">
            <h2 className="correct-title">Yes! 🎉</h2>
            <p className="correct-text">
              Ganesh Chaturthi is my birthday!<br />
              We celebrate with music and yummy Modaks! 🧁
            </p>
          </div>

          {/* Modak rain */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="modak-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${1.5 + Math.random() * 1}rem`
              }}
            >
              🧁
            </div>
          ))}
        </div>
      )}

      {/* ========================================
          PHASE 8: CHILD'S BIRTHDAY
          ======================================== */}
      {gamePhase === 'childBirthday' && (
        <div className="child-birthday-screen">
          <div className="birthday-input-ganesha">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-excited bounce-gentle" />
          </div>

          <div className="birthday-question">
            I'd love to celebrate you, too!<br />
            When is YOUR special day? 🎂
          </div>

          <div className="birthday-selectors">
            <div className="selector-group">
              <label className="selector-label">Month:</label>
              <select 
                className="month-select"
                value={childMonth}
                onChange={(e) => setChildMonth(e.target.value)}
              >
                <option value="">Pick a month</option>
                {months.map((month, idx) => (
                  <option key={month} value={idx + 1}>{month}</option>
                ))}
              </select>
            </div>

            <div className="selector-group">
              <label className="selector-label">Day:</label>
              <select 
                className="day-select"
                value={childDay}
                onChange={(e) => setChildDay(e.target.value)}
              >
                <option value="">Pick a day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            className="submit-birthday-btn"
            onClick={handleBirthdaySubmit}
            disabled={!childMonth || !childDay}
          >
            That's My Birthday! 🎉
          </button>
        </div>
      )}

      {/* ========================================
          PHASE 9: SIDE-BY-SIDE REVEAL
          ======================================== */}
      {gamePhase === 'sideBySide' && (
        <div className="side-by-side-screen">
          <h1 className="reveal-title">A Match Made in Heaven!</h1>
          <p className="reveal-subtitle">✨ Best Friends Forever ✨</p>

          <div className="two-cards">
            {/* Ganesha's card */}
            <div className="info-card ganesha-card">
              <div className="card-avatar">
                <img src={babyGaneshaImg} alt="Ganesha" className="avatar-image" />
              </div>
              <h3 className="card-name">Ganesha</h3>
              <div className="card-detail">
                <span className="detail-label">Meaning:</span>
                <span className="detail-value">Leader of the People</span>
              </div>
              <div className="card-detail">
                <span className="detail-label">Birthday:</span>
                <span className="detail-value">Ganesh Chaturthi</span>
              </div>
            </div>

            {/* Child's card */}
            <div className="info-card child-card">
              <div className="card-avatar child-avatar">
                <span className="avatar-emoji">😊</span>
              </div>
              <h3 className="card-name">{childName}</h3>
              <div className="card-detail">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{childName}</span>
              </div>
              <div className="card-detail">
                <span className="detail-label">Birthday:</span>
                <span className="detail-value">{months[childMonth - 1]} {childDay}</span>
              </div>
            </div>
          </div>

          <div className="bonding-message">
            <p className="bonding-text">
              Now that I know your name and your special day,<br />
              I have a secret... ✨
            </p>
            <p className="secret-text">
              I'm going to send you a little extra luck<br />
              on your birthday every year! 🍀
            </p>
          </div>

          <button className="continue-btn" onClick={handleContinueToIdentity}>
            We Are Special! 🌟
          </button>
        </div>
      )}

      {/* ========================================
          PHASE 10: IDENTITY POWER UNLOCKED
          ======================================== */}
      {gamePhase === 'identityPower' && !showSceneCompletion && (
        <div className="identity-power-screen">
          <div className="power-icon rotate-scale">🌟</div>
          
          <h1 className="power-title">Identity Power Unlocked!</h1>

          <div className="badges-earned">
            <div className="badge-item pop-in" style={{ animationDelay: '0.2s' }}>
              📛 Name Master
            </div>
            <div className="badge-item pop-in" style={{ animationDelay: '0.4s' }}>
              🎂 Birthday Detective
            </div>
          </div>

          <div className="power-message">
            <p className="power-text">
              Knowing who we are makes us strong.
            </p>
            <p className="power-subtext">
              You know your name. You know your day.<br />
              You are POWERFUL! ⚡
            </p>
          </div>

          {/* Sparkles */}
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="power-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      {/* ========================================
          COMPLETION SCREEN
          ======================================== */}
      {showSceneCompletion && (
        <AboutMeCompletion
          show={showSceneCompletion}
          sceneName="Name & Birthday"
          sceneNumber={2}
          totalScenes={4}
          starsEarned={gameState.stars}
          totalStars={2}
          discoveredBadges={['name-master', 'birthday-detective', 'identity-power']}
          badgeImages={{}}
          characterImages={{ babyGanesha: babyGaneshaImg }}
          nextSceneName="Favorite Things"
          childName={childName || 'Friend'}
          isFinalScene={false}
          
          onContinue={() => {
            setTimeout(() => {
              if (onNavigate) onNavigate('favorites-game');
              else if (onComplete) onComplete();
            }, 100);
          }}
          
          onReplay={() => {
            setGamePhase('intro');
            setLetterSlots(['', '', '', '', '', '', '']);
            setAvailableLetters(['A', 'H', 'G', 'E', 'S', 'N', 'A']);
            setSelectedLetter(null);
            setChildName('');
            setSelectedFestival(null);
            setWrongFestivals(new Set());
            setChildMonth('');
            setChildDay('');
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