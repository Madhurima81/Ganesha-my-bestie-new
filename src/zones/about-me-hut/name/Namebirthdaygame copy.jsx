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
  // Phases: intro, name-balloons, name-complete, birthday-intro, birthday-choice, birthday-correct, ending
  
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

  // Name letters with balloon colors
  const nameLetters = [
    { id: 'G', letter: 'G', color: '#FF6B6B', left: '10%' },
    { id: 'A1', letter: 'A', color: '#4ECDC4', left: '22%' },
    { id: 'N', letter: 'N', color: '#FFE66D', left: '34%' },
    { id: 'E', letter: 'E', color: '#95E1D3', left: '46%' },
    { id: 'S', letter: 'S', color: '#F38181', left: '58%' },
    { id: 'H', letter: 'H', color: '#AA96DA', left: '70%' },
    { id: 'A2', letter: 'A', color: '#FCBAD3', left: '82%' }
  ];

  // Festivals - SAME STRUCTURE AS FOOD GAME
  const festivals = [
    { id: 'holi', name: 'Holi', image: holiIcon, correct: false },
    { id: 'diwali', name: 'Diwali', image: diwaliIcon, correct: false },
    { id: 'janmashtami', name: 'Janmashtami', image: janmashtamiIcon, correct: false },
    { id: 'ganesh-chaturthi', name: 'Ganesh Chaturthi', image: ganeshChaturthiIcon, correct: true }
  ];

  // Start game
  const handleStartGame = () => {
    setGamePhase('name-balloons');
  };

  // Pop balloon
  const handlePopBalloon = (letterId) => {
    if (poppedLetters.has(letterId)) return;

    setPoppedLetters(prev => new Set([...prev, letterId]));
    setShowConfetti(true);

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

          <div className="instruction-bubble">Tap the balloons! 🎈</div>

          <div className="balloons-container">
            {nameLetters.map((item, index) => !poppedLetters.has(item.id) && (
              <button
                key={item.id}
                className="balloon-btn float-balloon"
                onClick={() => handlePopBalloon(item.id)}
                style={{
                  left: item.left,
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

      {/* Birthday Intro */}
      {gamePhase === 'birthday-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="intro-speech">
            <p className="intro-text">Which festival is my birthday?</p>
            <button className="start-btn" onClick={handleStartBirthdayChoice}>Find It! 🪔</button>
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
            {festivals.map((festival, index) => (
              <button
                key={festival.id}
                className={`birthday-choice-card ${showShake === festival.id ? 'birthday-shake' : ''} ${wrongFestivals.has(festival.id) ? 'birthday-wrong' : ''} bounce-gentle`}
                onClick={() => handleFestivalClick(festival.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                disabled={wrongFestivals.has(festival.id)}
              >
                <div className="birthday-choice-image-container">
                  <img src={festival.image} alt={festival.name} className="birthday-choice-image" />
                </div>
                <div className="birthday-choice-name">{festival.name}</div>
              </button>
            ))}
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