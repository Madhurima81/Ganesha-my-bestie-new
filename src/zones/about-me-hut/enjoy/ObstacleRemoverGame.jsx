import React, { useState } from 'react';
import './Dreamswishesgame.css';
import AboutMeCompletion from "../components/Aboutmecompletion";
import DrawingPad from '../components/Drawingpad';
import StoryProgressHeader from '../components/StoryProgressHeader';
import '../../shared/components/OpeningModal.css'; // <--- SHARED MODAL IMPORT

// Navigation Components
import BackToMapButton from '../../../lib/components/navigation/BackToMapButton';
import MenuButton from '../../../lib/components/navigation/MenuButton';
import TocaBocaNav from '../../../lib/components/navigation/TocaBocaNav';
import HelpMenu from '../../../lib/components/help/HelpMenu';
import { obstacleRemoverHelpConfig } from './helpConfig'; // You'll need to create this

// Import images
import babyGaneshaImg from './assets/images/baby-ganesha.png';
import babyGaneshaSit from './assets/images/baby-ganesha-sit.png';
import dreamsBg from './assets/images/dream-bg.png'; // Using food-bg as placeholder

// Wish Icons (for story header & intro)
import wishIconEarth from './assets/images/wish-icon-earth.png';
import wishIconFlower from './assets/images/wish-icon-flower.png';
import wishIconShare from './assets/images/wish-icon-share.png';

// Wish 1: Earth/Environment - Sad & Happy States
import wishEarthSad from './assets/images/wish-images/wish-earth-sad.png';
import wishEarthHappy from './assets/images/wish-images/wish-earth-happy.png';

// Wish 2: Nature - Dry & Green States
import wishGrassDry from './assets/images/wish-images/wish-grass-dry.png';
import wishGrassGreen from './assets/images/wish-images/wish-grass-green.png';

// Wish 3: Sharing - Empty & Full States
import wishBowlEmpty from './assets/images/wish-images/wish-bowl-empty.png';
import wishBowlFull from './assets/images/wish-images/wish-bowl-full.png';

// Cloud overlay
import cloudImg from './assets/images/cloud.png';

const DreamsWishesGame = ({ onComplete, onBack, onNavigate }) => {
  const [gamePhase, setGamePhase] = useState('intro');
  // Phases: intro, wish1-intro, wish1-active, wish1-complete,
  // wish2-intro, wish2-active, wish2-complete,
  // wish3-intro, wish3-active, wish3-complete,
  // all-wishes-complete, dream-intro, dream-drawing, dream-clouded,
  // dream-clearing, dream-revealed, comparison-card, ending

  const [showSlideMenu, setShowSlideMenu] = useState(false);
const [showHelpMenu, setShowHelpMenu] = useState(false);
const [isAudioOn, setIsAudioOn] = useState(true);

  const [wish1Taps, setWish1Taps] = useState(0);
  const [wish2Taps, setWish2Taps] = useState(0);
  const [wish3Taps, setWish3Taps] = useState(0);
  const [trunkTaps, setTrunkTaps] = useState(0);
  const [childDreamDrawing, setChildDreamDrawing] = useState(null);
  const [showDrawingPad, setShowDrawingPad] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [gameState, setGameState] = useState({
    stars: 3,
    completed: false
  });

  // Arrays for multiple objects (Bowls, Park items) - Tracks individual clicks
  const [bowlStates, setBowlStates] = useState([false, false, false]); // [bowl1, bowl2, bowl3]
  const [parkStates, setParkStates] = useState([false, false, false]); // [flowers, butterflies, playground]

  // ... existing state ...

  // --- ADD THIS LOGIC BLOCK ---
  const getDiscoveries = () => {
    const items = [];
    
    // 1. Happiness (Earth) - Unlocks after Wish 1
    const phasesAfterWish1 = ['wish1-complete', 'wish2-intro', 'wish2-active', 'wish2-complete', 'wish3-intro', 'wish3-active', 'wish3-complete', 'all-wishes-complete', 'dream-intro', 'dream-drawing', 'dream-clouded', 'dream-clearing', 'dream-revealed', 'comparison-card', 'ending'];
    if (phasesAfterWish1.includes(gamePhase)) {
      items.push({ name: 'Happiness', emoji: '🌍' });
    }

    // 2. Sharing (Bowl) - Unlocks after Wish 2
    const phasesAfterWish2 = ['wish2-complete', 'wish3-intro', 'wish3-active', 'wish3-complete', 'all-wishes-complete', 'dream-intro', 'dream-drawing', 'dream-clouded', 'dream-clearing', 'dream-revealed', 'comparison-card', 'ending'];
    if (phasesAfterWish2.includes(gamePhase)) {
      items.push({ name: 'Sharing', emoji: '🥣' });
    }

    // 3. Nature (Flower) - Unlocks after Wish 3
    const phasesAfterWish3 = ['wish3-complete', 'all-wishes-complete', 'dream-intro', 'dream-drawing', 'dream-clouded', 'dream-clearing', 'dream-revealed', 'comparison-card', 'ending'];
    if (phasesAfterWish3.includes(gamePhase)) {
      items.push({ name: 'Nature', emoji: '🌸' });
    }

    // 4. Child's Dream - Unlocks after drawing is saved
    if (childDreamDrawing) {
      items.push({ name: 'My Dream', image: childDreamDrawing });
    }

    return items;
  };

  // Check if we are in the Child's part of the story (Yellow Theme)
  const isChildMode = ['dream-intro', 'dream-drawing', 'dream-clouded', 'dream-clearing', 'dream-revealed', 'comparison-card', 'ending'].includes(gamePhase);
  // ----------------------------

  // --- ADD THIS FUNCTION HERE ---
  const handleStartGame = () => {
    setGamePhase('wish1-intro');
  };
  // ------------------------------

  // ==================== RELOAD DETECTION ====================
useEffect(() => {
  const sessionKey = `dreamswishes_session_${Date.now()}`;
  const existingSession = localStorage.getItem('dreamswishes_current_session');
  
  const isReload = existingSession !== null;
  
  if (isReload && !reloadHandledRef.current) {
    reloadHandledRef.current = true;
    
    console.log("🔄 Reload detected, gamePhase:", gamePhase);
    
    // INTRO - No popup
    if (gamePhase === 'intro') {
      return;
    }
    
    // WISH 1 ACTIVE - Show progress
    if (gamePhase === 'wish1-active' && wish1Taps > 0 && wish1Taps < 3) {
      setResumeMessage(`Keep tapping! You've tapped ${wish1Taps}/3 times to spread happiness!`);
      setShowResumePopup(true);
      setTimeout(() => setShowResumePopup(false), 5000);
      return;
    }
    
    // WISH 2 ACTIVE - Show progress
    if (gamePhase === 'wish2-active') {
      const filledCount = bowlStates.filter(Boolean).length;
      if (filledCount > 0 && filledCount < 3) {
        setResumeMessage(`Great job! You've filled ${filledCount}/3 bowls. Keep sharing!`);
        setShowResumePopup(true);
        setTimeout(() => setShowResumePopup(false), 5000);
      }
      return;
    }
    
    // WISH 3 ACTIVE - Show progress
    if (gamePhase === 'wish3-active' && wish3Taps > 0 && wish3Taps < 3) {
      setResumeMessage(`Keep going! You've tapped ${wish3Taps}/3 times to make the park green!`);
      setShowResumePopup(true);
      setTimeout(() => setShowResumePopup(false), 5000);
      return;
    }
    
    // DREAM DRAWING - Close drawing pad if open
    if (gamePhase === 'dream-drawing') {
      setShowDrawingPad(false);
      setGamePhase('dream-intro');
      return;
    }
    
    // DREAM CLOUDED/CLEARING - Show progress
    if ((gamePhase === 'dream-clouded' || gamePhase === 'dream-clearing') && trunkTaps > 0 && trunkTaps < 3) {
      setResumeMessage(`Keep tapping Ganesha's trunk! ${trunkTaps}/3 clouds cleared!`);
      setShowResumePopup(true);
      setTimeout(() => setShowResumePopup(false), 5000);
      return;
    }
    
    // COMPLETION PHASES - Show as-is
    if (gamePhase.includes('complete') || gamePhase === 'comparison-card' || gamePhase === 'ending') {
      return;
    }
    
    // INTRO PHASES - Show intro modals as-is
    if (gamePhase.includes('intro')) {
      return;
    }
  }
  
  localStorage.setItem('dreamswishes_current_session', sessionKey);
  
  return () => {
    localStorage.removeItem('dreamswishes_current_session');
  };
}, []);

useEffect(() => {
  return () => {
    reloadHandledRef.current = false;
  };
}, []);


  // Handle wish 1 tap (Happiness - Earth)
  const handleWish1Tap = () => {
        if (wish1Taps >= 3) return; // <--- STOP if already done

    const newTaps = wish1Taps + 1;
    setWish1Taps(newTaps);
    
    if (newTaps >= 3) {
      setTimeout(() => {
        setGamePhase('wish1-complete');
        setTimeout(() => setGamePhase('wish2-intro'), 4500);
      }, 3000);
    }
  };

  // Handle wish 2 tap (Sharing - Bowls)
// Handle wish 2 tap (Sharing - Specific Bowls)
  const handleWish2Tap = (index) => {
    // 1. Block if already filled (Fixes the "click multiple times" bug)
    if (bowlStates[index] === true) return;

    // 2. Update the array
    const newStates = [...bowlStates];
    newStates[index] = true;
    setBowlStates(newStates);

    // 3. Update the counter for the text (1/3, 2/3)
    const count = newStates.filter(Boolean).length;
    setWish2Taps(count);

    // 4. Check for win
    if (count === 3) {
      setTimeout(() => {
        setGamePhase('wish2-complete');
        setTimeout(() => setGamePhase('wish3-intro'), 4500);
      }, 2000);
    }
  };



  // --- REPLACE handleWish3Tap with this (Fixes the "4/3" bug) ---
  const handleWish3Tap = () => {
    // GUARD: If already 3, stop immediately.
    if (wish3Taps >= 3) return;
    const newTaps = wish3Taps + 1;
    setWish3Taps(newTaps);
    
    if (newTaps >= 3) {
      setTimeout(() => {
        setGamePhase('wish3-complete');
        setTimeout(() => setGamePhase('all-wishes-complete'), 4500);
      }, 3000);
    }
  };

  // Handle wish 2 tap (Sharing - Specific Bowls)
  const handleBowlTap = (index) => {
    // 1. If this specific bowl is already full, do nothing
    if (bowlStates[index] === true) return;

    // 2. Mark this bowl as true
    const newStates = [...bowlStates];
    newStates[index] = true;
    setBowlStates(newStates);

    // 3. Check if ALL are full
    const count = newStates.filter(Boolean).length; // Count true values
    
    // Also update the old counter just for safety/display if needed
    setWish2Taps(count);

    if (count === 3) {
      setTimeout(() => {
        setGamePhase('wish2-complete');
        setTimeout(() => setGamePhase('wish3-intro'), 4500);
      }, 3000); // 3 seconds wait
    }
  };

  // Handle wish 3 tap (Nature - Specific Spots)
  const handleParkTap = (index) => {
    if (parkStates[index] === true) return;

    const newStates = [...parkStates];
    newStates[index] = true;
    setParkStates(newStates);

    const count = newStates.filter(Boolean).length;
    
    if (count === 3) {
      setTimeout(() => {
        setGamePhase('wish3-complete');
        setTimeout(() => setGamePhase('all-wishes-complete'), 4500);
      }, 1000);
    }
  };

  // Handle dream drawing save
const handleDreamDrawingSave = (data) => {
  setChildDreamDrawing(data.image); // Extract image from object
  setShowDrawingPad(false);
  setGamePhase('dream-clouded');
};

  // Handle trunk tap to clear clouds
  const handleTrunkTap = () => {
    const newTaps = trunkTaps + 1;
    setTrunkTaps(newTaps);
    
    if (newTaps >= 3) {
      setTimeout(() => {
        setGamePhase('dream-revealed');
        setTimeout(() => setGamePhase('comparison-card'), 2500);
      }, 1500);
    }
  };

  return (
    <div className="dreams-wishes-game">
      {/* Background */}
      <img src={dreamsBg} alt="Background" className="dreams-background" />

      {/* Back Button */}
      {gamePhase !== 'intro' && !showSceneCompletion && (
        <button className="back-btn" onClick={onBack}>← Back</button>
      )}

{/* Story Progress Header - Only during Ganesha phase (Wishes) */}
      {/* Hides when 'dream-intro' starts */}
      {!gamePhase.startsWith('dream') && 
       gamePhase !== 'comparison-card' && 
       gamePhase !== 'ending' && (
        <StoryProgressHeader 
          discoveries={getDiscoveries()} 
          isChildMode={false} 
        />
      )}

{/* Intro Phase - Wish & Dream */}
      {gamePhase === 'intro' && (
        <div className="game-modal-overlay"> {/* Reusing your shared overlay wrapper */}
          <div className="game-modal-content">
            
            {/* Ganesha Character */}
            <div className="game-modal-character">
              <img src={babyGaneshaImg} alt="Ganesha" />
            </div>

            {/* The Dream Card */}
            <div className="dream-card">
              
              <h1 className="dream-title">Our Big Wishes! 🌟</h1>
              
              <p className="dream-text">
               I have three happy wishes for the world.
<br />
                Let’s make them come true together.<br />
             
              </p>

<div className="dream-icon-row">
  <div className="dream-icon-item" title="Happiness">
    <img src={wishIconEarth} alt="Earth" className="intro-wish-icon" />
  </div>
  <div className="dream-icon-item" title="Sharing">
    <img src={wishIconShare} alt="Sharing" className="intro-wish-icon" />
  </div>
  <div className="dream-icon-item" title="Nature">
    <img src={wishIconFlower} alt="Nature" className="intro-wish-icon" />
  </div>
</div>

              <button className="dream-btn" onClick={handleStartGame}>
                Yes! Let’s do it together 🌱
              </button>

            </div>
          </div>
        </div>
      )}

{/* WISH 1 INTRO - HAPPINESS */}
      {gamePhase === 'wish1-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          
          {/* UPDATED CLASSES HERE 👇 */}
          <div className="wish-intro-card">
            <p className="wish-intro-text">My first wish is for a happy world.
</p>
            <p className="wish-intro-text">The world looks a little sad right now 😔</p>
            <button className="wish-action-btn" onClick={() => setGamePhase('wish1-active')}>
             Let’s Make Them Smile! 😊

            </button>
          </div>
          
        </div>
      )}

      {/* WISH 1 ACTIVE - TAP EARTH */}
      {gamePhase === 'wish1-active' && (
        <div className="wish-screen">
          <div className="ganesha-watching">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-small bounce-gentle" />
          </div>

          <div className="wish-instruction-bubble">
            Tap the earth 3 times to send smiles! ({wish1Taps}/3)
          </div>

<div className="wish-interactive-container">
  {/* Earth - Centered and Bigger */}
  <div 
    className="earth-container"
    onClick={handleWish1Tap}
  >
    {/* Sad Earth - fades out */}
    <img 
      src={wishEarthSad} 
      alt="Sad Earth" 
      className="earth-image sad"
      style={{
        opacity: wish1Taps === 0 ? 1 : 
                 wish1Taps === 1 ? 0.6 : 
                 wish1Taps === 2 ? 0.3 : 0
      }}
    />
    
    {/* Happy Earth - fades in */}
    <img 
      src={wishEarthHappy} 
      alt="Happy Earth" 
      className={`earth-image happy ${wish1Taps >= 3 ? 'complete-glow-pulse' : ''}`}
      style={{
        opacity: wish1Taps === 0 ? 0 : 
                 wish1Taps === 1 ? 0.4 : 
                 wish1Taps === 2 ? 0.7 : 1
      }}
    />
  </div>
  
  {/* Sad Faces Around Earth - Gradually Turn to Happy */}
  <div className="faces-container">
    {Array.from({length: 6}).map((_, i) => (
      <div 
        key={i} 
        className="face-emoji"
        style={{
          transform: `rotate(${i * 60}deg) translate(160px) rotate(-${i * 60}deg)`,
          opacity: wish1Taps === 0 ? 1 : 
                   wish1Taps === 1 ? 0.8 : 
                   wish1Taps === 2 ? 0.6 : 1,
          transition: 'all 0.6s ease'
        }}
      >
        {wish1Taps >= 3 ? '😊' : wish1Taps >= 2 ? '😐' : '😢'}
      </div>
    ))}
  </div>
</div>
        </div>
      )}
{/* WISH 1 COMPLETE */}
      {gamePhase === 'wish1-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          
          <div className="success-message-large">
            You made the world smile! 😊✨
          </div>
          
          {/* NEW Subline */}
          <div className="soft-thank-you">Thank you for helping me 💛</div>

          {/* Updated Progress Text */}
          <div className="wish-checkmark">🌱 1 of 3 wishes complete</div>
          
          {/* Floating happy faces */}
          <div className="celebration-elements">
            {Array.from({length: 15}).map((_, i) => (
              <div 
                key={i} 
                className="floating-element"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                😊
              </div>
            ))}
          </div>
        </div>
      )}

{/* WISH 2 INTRO - SHARING */}
      {gamePhase === 'wish2-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          
          {/* New Cream Card Classes */}
          <div className="wish-intro-card">
            <p className="wish-intro-text">My second wish is that no one feels hungry or alone.</p>
            <p className="wish-intro-text">Let's share with everyone! 🤝</p>
            <button className="wish-action-btn" onClick={() => setGamePhase('wish2-active')}>
              Let's Share! 🍎
            </button>
          </div>
        </div>
      )}

      {/* WISH 2 ACTIVE - TAP BOWLS */}
      {gamePhase === 'wish2-active' && (
        <div className="wish-screen">
          <div className="ganesha-watching">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-small bounce-gentle" />
          </div>

          <div className="wish-instruction-bubble">
            Tap the bowls 3 times to fill them! ({wish2Taps}/3)
          </div>

          <div className="wish-interactive-container">
     
          </div>

          {/* Hearts raining */}
          {wish2Taps >= 3 && (
            <div className="hearts-rain">
              {Array.from({length: 20}).map((_, i) => (
                <div 
                  key={i}
                  className="heart-fall"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                  ❤️
                </div>
              ))}
            </div>
          )}
{/* 2. BOWLS CONTAINER (Updated to use bowlStates array) */}
            <div className="bowls-container">
              {bowlStates.map((isFilled, index) => (
                <div 
                  key={index}
                  className={`bowl ${isFilled ? 'bowl-filled' : 'bowl-empty'}`}
                  onClick={() => handleWish2Tap(index)}
                >
                  <img 
                    src={isFilled ? wishBowlFull : wishBowlEmpty} 
                    alt={`Bowl ${index + 1}`}
                    className={`bowl-image ${isFilled ? 'bowl-glow-bounce' : ''}`}
                  />
                  
                  {/* Food particles appear only when this bowl is filled */}
                  {isFilled && (
                    <div className="bowl-food pop-in">
                      🍚
                    </div>
      )}
    </div>
  ))}
</div>
        </div>
      )}
{/* WISH 2 COMPLETE */}
      {gamePhase === 'wish2-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          
          <div className="success-message-large">
            You filled hearts with sharing! ✨
          </div>

          <div className="soft-thank-you">Thank you for caring so much 💛</div>

          <div className="wish-checkmark">🌱 2 of 3 wishes complete</div>
          
          <div className="celebration-elements">
            {/* ... keeping your existing hearts animation ... */}
            {Array.from({length: 15}).map((_, i) => (
              <div 
                key={i} 
                className="floating-element"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                ❤️
              </div>
            ))}
          </div>
        </div>
      )}

{/* WISH 3 INTRO - NATURE */}
      {gamePhase === 'wish3-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          
          {/* UPDATED: Uses specific 'Wish' classes */}
          <div className="wish-intro-card">
            <p className="wish-intro-text">My last wish is for a green, happy world.</p>
            <p className="wish-intro-text">Where kids can run, play, and smile outside! 🌿</p>
            
            <button 
              className="wish-action-btn" 
              onClick={() => setGamePhase('wish3-active')}
            >
              Let's Make It Green! 🌸
            </button>
          </div>
        </div>
      )}

      {/* WISH 3 ACTIVE - TAP PARK */}
      {gamePhase === 'wish3-active' && (
        <div className="wish-screen">
          <div className="ganesha-watching">
            <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-small bounce-gentle" />
          </div>

          <div className="wish-instruction-bubble">
            Tap the park 3 times to make it bloom! ({wish3Taps}/3)
          </div>

          <div className="wish-interactive-container">
      <div 
  className={`park-scene ${wish3Taps >= 1 ? 'park-tap1' : ''} ${wish3Taps >= 2 ? 'park-tap2' : ''} ${wish3Taps >= 3 ? 'park-tap3' : ''}`}
  onClick={handleWish3Tap}
>
  {/* Dry grass - fades out */}
  <img 
    src={wishGrassDry} 
    alt="Dry park" 
    className="park-ground-image dry"
    style={{
      opacity: wish3Taps === 0 ? 1 : 
               wish3Taps === 1 ? 0.6 : 
               wish3Taps === 2 ? 0.3 : 0
    }}
  />
  
  {/* Green grass - fades in */}
  <img 
    src={wishGrassGreen} 
    alt="Green park" 
    className={`park-ground-image green ${wish3Taps >= 3 ? 'complete-glow-pulse' : ''}`}
    style={{
      opacity: wish3Taps === 0 ? 0 : 
               wish3Taps === 1 ? 0.4 : 
               wish3Taps === 2 ? 0.7 : 1
    }}
  />
  
  {/* Flowers appear progressively */}
  {wish3Taps >= 1 && (
    <div className="flowers-container">
      {[['🌸', '🌺', '🌻', '🌷', '🌹']].map((flower, i) => (
        wish3Taps > i && (
          <div
            key={i}
            className="flower pop-in"
            style={{
              left: `${20 + i * 15}%`,
              bottom: '10%',
              animationDelay: `${i * 0.1}s`
            }}
          >
            {flower}
          </div>
        )
      ))}
    </div>
  )}

                
              

              {/* Butterflies appear */}
              {wish3Taps >= 2 && (
                <div className="butterflies-container">
                  {['🦋', '🦋', '🦋'].map((butterfly, i) => (
                    <div 
                      key={i}
                      className="butterfly flutter"
                      style={{
                        left: `${30 + i * 25}%`,
                        top: `${20 + i * 15}%`,
                        animationDelay: `${i * 0.3}s`
                      }}
                    >
                      {butterfly}
                    </div>
                  ))}
                </div>
              )}

              {/* Playground appears */}
              {wish3Taps >= 3 && (
                <div className="playground pop-in">
                  <div className="playground-item">🛝</div>
                  <div className="playground-item">🌳</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

{/* WISH 3 COMPLETE */}
      {gamePhase === 'wish3-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          
          <div className="success-message-large">
            You made the world green and playful! ✨
          </div>

          <div className="soft-thank-you">Thank you for helping the Earth 💛</div>

          <div className="wish-checkmark">🌱 3 of 3 wishes complete</div>
          
          <div className="celebration-elements">
            {/* ... keeping your existing nature animation ... */}
            {Array.from({length: 15}).map((_, i) => (
              <div 
                key={i} 
                className="floating-element"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                {['🌸', '🦋', '🌳'][i % 3]}
              </div>
            ))}
          </div>
        </div>
      )}

{/* ALL WISHES COMPLETE */}
      {gamePhase === 'all-wishes-complete' && (
        <div className="intro-overlay">
          <img src={babyGaneshaSit} alt="Baby Ganesha" className="intro-ganesha celebrate-scale" />
          
          <div className="wish-intro-card">
            <p className="wish-intro-text">WOW! You made the world brighter! ✨</p>
            <p className="wish-intro-text">
              Now it’s your turn 💛<br />
              What would you love to wish for?
            </p>
            
            <button 
              className="wish-action-btn" 
              onClick={() => setGamePhase('dream-intro')}
            >
              Tell Me Your Dream! 💭
            </button>
          </div>
        </div>
      )}

{/* DREAM INTRO */}
      {gamePhase === 'dream-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          
          <div className="wish-intro-card">
            <p className="wish-intro-text">Draw a happy wish on this magic canvas! ✨</p>
            <p className="wish-intro-text">What would you love to draw today? 🎨</p>
            
            <button 
              className="wish-action-btn" 
              onClick={() => {
                setShowDrawingPad(true);
                setGamePhase('dream-drawing');
              }}
            >
              Start Drawing! ✏️
            </button>
          </div>
        </div>
      )}

      {/* DRAWING PAD OVERLAY */}
      {showDrawingPad && gamePhase === 'dream-drawing' && (
        <div className="drawing-overlay">
          <DrawingPad
            prompt="Draw your biggest dream! What do you want to be? 🌟"
            onSave={handleDreamDrawingSave}
            onCancel={() => {
              setShowDrawingPad(false);
              setGamePhase('dream-intro');
            }}
          />
        </div>
      )}

      {/* DREAM CLOUDED - Single Interactive Screen */}
{(gamePhase === 'dream-clouded' || gamePhase === 'dream-clearing') && (
  <div className="dream-screen">
    {/* Main Dream Canvas with Clouds */}
    <div className="dream-container">
      {/* Child's Drawing (visible behind clouds) */}
      <div className="dream-drawing-display">
        {childDreamDrawing && (
          <img 
            src={childDreamDrawing} 
            alt="Your dream" 
            className="dream-image" 
            style={{
              opacity: trunkTaps === 0 ? 0.3 : 
                       trunkTaps === 1 ? 0.5 : 
                       trunkTaps === 2 ? 0.7 : 1,
              filter: trunkTaps === 3 ? 'none' : 'blur(6px)',
              transition: 'all 0.8s ease'
            }}
          />
        )}
      </div>

      {/* Clouds Covering Dream - Fade as You Tap */}
      <div className="clouds-container">
        {Array.from({length: 3}).map((_, i) => (
          <div 
            key={i}
            className={`dream-cloud cloud-${i + 1} ${trunkTaps > i ? 'cloud-fade' : ''}`}
            style={{ animationDelay: `${i * 0.3}s` }}
          >
            <img src={cloudImg} alt="Cloud" className="cloud-icon" />
          </div>
        ))}
      </div>

      {/* Tappable Ganesha - Click to Remove Clouds */}
      <div 
        className={`ganesha-helper ${trunkTaps > 0 ? 'ganesha-blowing' : ''} ${trunkTaps >= 3 ? 'ganesha-blow-done' : ''}`}
        onClick={handleTrunkTap}
      >
        <img 
          src={babyGaneshaImg} 
          alt="Ganesha" 
          className="ganesha-trunk bounce-gentle" 
        />
        
        {/* Wind Puff Effect */}
        {trunkTaps > 0 && trunkTaps < 3 && (
          <div className="wind-puff">💨</div>
        )}
        
        {/* Golden Success Puff */}
        {trunkTaps >= 3 && (
          <div className="golden-puff">💨✨🌟</div>
        )}
      </div>
    </div>

    {/* Speech Bubble - Changes Based on Taps */}
    <div className="dream-instruction-box">
      {trunkTaps === 0 ? (
        <>Sometimes worries float in the way ☁️

          <br/> Let’s gently move them together <br/> 
          <strong>Tap my trunk 3 times to help me move them! 💛</strong>
        </>
      ) : trunkTaps < 3 ? (
        <>
          You’re doing great! 🌟
<br/>Tap again!
          <div className="tap-counter-big">({trunkTaps}/3)</div>
        </>
      ) : (
        <>
          Yay! Your dream is clear now! 🌟✨
        </>
      )}
    </div>
  </div>
)}

      {/* DREAM REVEALED */}
      {gamePhase === 'dream-revealed' && (
        <div className="dream-revealed-screen">
          <div className="dream-glow-container">
            {childDreamDrawing && (
              <img src={childDreamDrawing} alt="Your dream" className="dream-image-glowing" />
            )}
            
            {/* Sparkles around dream */}
            <div className="sparkles-container">
              {Array.from({length: 20}).map((_, i) => (
                <div 
                  key={i}
                  className="sparkle-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                  {['✨', '⭐', '💫'][i % 3]}
                </div>
              ))}
            </div>
          </div>

          <img src={babyGaneshaSit} alt="Ganesha" className="ganesha-proud celebrate-scale" />

          <div className="success-message-large">
            Your dream will come true!<br/>
            I believe in you! Never give up! 🌟
          </div>
        </div>
      )}

{/* COMPARISON CARD - FINAL POLISHED VERSION */}
      {gamePhase === 'comparison-card' && (
        <div className="friendship-overlay">
          
          {/* 1. BACKGROUND SPARKLES */}
          <div className="overlay-sparkles">
            {[...Array(30)].map((_, i) => (
              <div 
                key={i} 
                className="bg-sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  fontSize: `${10 + Math.random() * 20}px`
                }}
              >
                {['✨', '⭐', '💫', '🔸'][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </div>

          <h1 className="friendship-title" style={{zIndex: 2}}>Dreams Come Together! ✨</h1>
          <p className="friendship-subtitle" style={{zIndex: 2}}>Friends Help Each Other</p>

          <div className="friendship-grid" style={{zIndex: 2}}>
            
            {/* --- LEFT: GANESHA'S WISHES (NEW CARDS) --- */}
            <div className="friend-column">
              <img src={babyGaneshaSit} alt="Ganesha" className="column-header-image" />
              <div className="column-label">GANESHA'S WISHES</div>
              
              <div className="wishes-list">
                {/* Wish 1 Card */}
                <div className="wish-item" style={{animationDelay: '0.1s'}}>
                  <span className="wish-icon">😊</span>
                  <span className="wish-text">Spreading Happiness</span>
                  <span className="wish-check">✓</span>
                </div>
                
                {/* Wish 2 Card */}
                <div className="wish-item" style={{animationDelay: '0.2s'}}>
                  <span className="wish-icon">🤝</span>
                  <span className="wish-text">Sharing With Others</span>
                  <span className="wish-check">✓</span>
                </div>
                
                {/* Wish 3 Card */}
                <div className="wish-item" style={{animationDelay: '0.3s'}}>
                  <span className="wish-icon">🌳</span>
                  <span className="wish-text">Caring for the Earth</span>
                  <span className="wish-check">✓</span>
                </div>
              </div>
              
              <p className="wishes-quote">“You helped the world smile.” 🌍</p>
            </div>

            {/* --- CENTER: CONNECTOR --- */}
            <div className="friend-connector">
              <div className="connector-heart">❤️</div>
              <div className="connector-text">FRIENDS</div>
              <div className="connector-heart">❤️</div>
            </div>

            {/* --- RIGHT: YOUR DREAM --- */}
            <div className="friend-column">
              <div className="child-dream-circle">
                 <span className="dream-sparkle">✨</span>
              </div>
              <div className="column-label">YOUR DREAM</div>

              <div className="dream-display-box" style={{animation: 'popIn 0.5s ease 0.4s backwards'}}>
                {childDreamDrawing ? (
                  <img src={childDreamDrawing} alt="Your Dream" className="dream-thumbnail" />
                ) : (
                  <div style={{fontSize:'20px', color:'#ccc'}}>Dream Loading...</div>
                )}
              </div>
              
              <p className="wishes-quote">“I’ll help your dream shine.” ✨</p>
            </div>

          </div>

          {/* BADGE & BUTTON */}
          <div style={{zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div className="badge-strip">
              <span style={{fontSize:'28px'}}>🏅</span>
              <span className="badge-text">You and Ganesha — Friends Forever! 💛</span>
              <span style={{fontSize:'28px'}}>🏅</span>
            </div>

            <button 
              className="primary-cta"
              onClick={() => {
                setGamePhase('ending');
                setGameState(prev => ({ ...prev, completed: true }));
                setTimeout(() => setShowSceneCompletion(true), 1500);
              }}
            >
              🎉 Finish Game
            </button>
          </div>

        </div>
      )}

      {/* ENDING PLACEHOLDER */}
      {gamePhase === 'ending' && !showSceneCompletion && (
        <div className="ending-screen">
          <img src={babyGaneshaSit} alt="Ganesha" className="ganesha-final celebrate-scale" />
          <div className="final-title">Dreams Connected! 🌟</div>
        </div>
      )}

      {/* Back to Map Button - Shows after game starts */}
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
    background: 'linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%)',
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


{/* ==================== MENU BUTTON (Top-Right) ==================== */}
{gamePhase !== 'intro' && (
  <MenuButton
    onClick={() => setShowSlideMenu(true)}
    zoneId="about-me-hut"
  />
)}

{/* ==================== SLIDE MENU ==================== */}
<TocaBocaNav
  show={showSlideMenu}
  onClose={() => setShowSlideMenu(false)}
  zoneId="about-me-hut"
  onHome={() => {
    setShowSlideMenu(false);
    setTimeout(() => onNavigate?.('home'), 100);
  }}
  onHelp={() => {
    setShowSlideMenu(false);
    setShowHelpMenu(true);
  }}
  onStartFresh={() => {
    setShowSlideMenu(false);
    // Reset game logic here
    setGamePhase('intro');
    setWish1Taps(0);
    setWish2Taps(0);
    setWish3Taps(0);
    setTrunkTaps(0);
    setWish1Completed(false);
    setWish2Completed(false);
    setWish3Completed(false);
    setChildDreamDrawing(null);
  }}
  isAudioOn={isAudioOn}
  onAudioToggle={() => setIsAudioOn(!isAudioOn)}
  onParentMenu={() => console.log('Parent menu')}
/>

{/* ==================== HELP MENU ==================== */}
<HelpMenu
  show={showHelpMenu}
  onClose={() => setShowHelpMenu(false)}
  onNavigate={onNavigate}
  resetScene={() => {
    setGamePhase('intro');
    setWish1Taps(0);
    setWish2Taps(0);
    setWish3Taps(0);
    setTrunkTaps(0);
    setWish1Completed(false);
    setWish2Completed(false);
    setWish3Completed(false);
    setChildDreamDrawing(null);
  }}
  helpConfig={obstacleRemoverHelpConfig}
  onSoundToggle={() => setIsAudioOn(!isAudioOn)}
  isAudioOn={isAudioOn}
  zoneId="about-me-hut"
/>

      {/* COMPLETION SCREEN */}
      {showSceneCompletion && (
        <AboutMeCompletion
          show={showSceneCompletion}
          sceneName="Dreams & Wishes"
          sceneNumber={4}
          totalScenes={4}
          starsEarned={gameState.stars}
          totalStars={3}
          discoveredBadges={['wish-maker', 'dream-helper', 'friendship-power']}
          badgeImages={{}}
          characterImages={{
            babyGanesha: babyGaneshaImg
          }}
          nextSceneName="Symbol Mountain"
          childName="dream maker"
          
          onContinue={() => {
            if (onNavigate) {
              onNavigate('zone-complete');
            } else if (onComplete) {
              onComplete();
            }
          }}
          
          onReplay={() => {
            setGamePhase('intro');
            setWish1Taps(0);
            setWish2Taps(0);
            setWish3Taps(0);
            setTrunkTaps(0);
            setChildDreamDrawing(null);
            setShowDrawingPad(false);
            setShowSceneCompletion(false);
            setGameState({ stars: 3, completed: false });
          }}
          
          onBackToMap={() => {
            if (onNavigate) {
              onNavigate('zone-welcome');
            } else if (onBack) {
              onBack();
            }
          }}
          
          onHome={() => {
            if (onNavigate) {
              onNavigate('home');
            }
          }}
        />
      )}
    </div>
  );
};

export default DreamsWishesGame;