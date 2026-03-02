import React, { useState, useEffect, useRef } from 'react';
import './DreamsWishesGame.css';
import AboutMeCompletion from "../components/Aboutmecompletion";
import DrawingPad from '../components/Drawingpad';
import StoryProgressHeader from '../components/StoryProgressHeader';
import '../../shared/components/OpeningModal.css';

// Navigation Components
import BackToMapButton from '../../../lib/components/navigation/BackToMapButton';
import MenuButton from '../../../lib/components/navigation/MenuButton';
import TocaBocaNav from '../../../lib/components/navigation/TocaBocaNav';
import HelpMenu from '../../../lib/components/help/HelpMenu';
import { obstacleRemoverHelpConfig } from './helpConfig';
import SceneManager from "../../../lib/components/scenes/SceneManager";

// Content Configs
import { getOpeningModal } from '../../../lib/config/content';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';

// Shared Components
import OpeningModal from '../../shared/components/OpeningModal';

// Import Unified Design System
import Button from '../../../lib/components/ui/Button/Button';
import '../../../lib/styles/zone-themes.css';
import '../../../lib/styles/animations.css';

// Import images
import babyGaneshaImg from './assets/images/baby-ganesha.png';
import babyGaneshaSit from './assets/images/baby-ganesha-sit.png';
import dreamsBg from './assets/images/dream-bg.png';

// Wish Icons
import wishIconEarth from './assets/images/wish-icon-earth.png';
import wishIconFlower from './assets/images/wish-icon-flower.png';
import wishIconShare from './assets/images/wish-icon-share.png';

// Wish Images
import wishEarthSad from './assets/images/wish-images/wish-earth-sad.png';
import wishEarthHappy from './assets/images/wish-images/wish-earth-happy.png';
import wishGrassDry from './assets/images/wish-images/wish-grass-dry.png';
import wishGrassGreen from './assets/images/wish-images/wish-grass-green.png';
import wishBowlEmpty from './assets/images/wish-images/wish-bowl-empty.png';
import wishBowlFull from './assets/images/wish-images/wish-bowl-full.png';
import cloudImg from './assets/images/cloud.png';

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) return <button onClick={() => window.location.reload()}>Reload Scene</button>;
    return this.props.children;
  }
}

// =========================================================
// 1. MAIN WRAPPER
// =========================================================
const DreamsWishesGame = ({ onComplete, onBack, onNavigate, zoneId = 'about-me-hut', sceneId = 'dreams-wishes' }) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          gamePhase: 'intro',

          // --- COUNTERS & INTERACTIVE STATES ---
          wish1Taps: 0,

          wish2Taps: 0,
          bowlStates: [false, false, false], // Track individual bowls

          wish3Taps: 0,
          parkStates: [false, false, false], // Track individual park items (Grass, Butterfly, Slide)

          trunkTaps: 0,

          // --- CHILD DATA ---
          childDreamDrawing: null, // The saved image string

          // --- MODAL SAVING (For Reloads) ---
          currentModal: null, // 'drawing'
          draftData: null,    // Temporary drawing data

          // --- COMPLETION ---
          stars: 3,
          completed: false,
          showingCompletionScreen: false
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <DreamsWishesGameContent
            sceneState={sceneState}
            sceneActions={sceneActions}
            isReload={isReload}
            onComplete={onComplete}
            onNavigate={onNavigate}
            onBack={onBack}
          />
        )}
      </SceneManager>
    </ErrorBoundary>
  );
};

// =========================================================
// 2. CONTENT COMPONENT
// =========================================================
const DreamsWishesGameContent = ({ sceneState, sceneActions, isReload, onComplete, onNavigate, onBack }) => {

  if (!sceneState) return <div>Loading...</div>;

  // Get content from configs
  const openingModalContent = getOpeningModal('about-me-hut', 'dreams-wishes');

  // --- LOCAL UI STATE (Not saved in DB) ---
  const [showSlideMenu, setShowSlideMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showDrawingPad, setShowDrawingPad] = useState(false); // Controls visibility

  const reloadHandledRef = useRef(false);
  const resumePopupTimeoutRef = useRef(null);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');

  // --- HELPERS ---
  const getDiscoveries = () => {
    const items = [];
    const phase = sceneState.gamePhase;

    // Logic to show progress badges in header
    const phasesAfterWish1 = ['wish1-complete', 'wish2-intro', 'wish2-active', 'wish2-complete', 'wish3-intro', 'wish3-active', 'wish3-complete', 'all-wishes-complete', 'dream-intro', 'dream-drawing', 'dream-clouded', 'dream-clearing', 'dream-revealed', 'comparison-card', 'ending'];
    if (phasesAfterWish1.includes(phase)) items.push({ name: 'Happiness', emoji: '🌍' });

    const phasesAfterWish2 = ['wish2-complete', 'wish3-intro', 'wish3-active', 'wish3-complete', 'all-wishes-complete', 'dream-intro', 'dream-drawing', 'dream-clouded', 'dream-clearing', 'dream-revealed', 'comparison-card', 'ending'];
    if (phasesAfterWish2.includes(phase)) items.push({ name: 'Sharing', emoji: '🥣' });

    const phasesAfterWish3 = ['wish3-complete', 'all-wishes-complete', 'dream-intro', 'dream-drawing', 'dream-clouded', 'dream-clearing', 'dream-revealed', 'comparison-card', 'ending'];
    if (phasesAfterWish3.includes(phase)) items.push({ name: 'Nature', emoji: '🌸' });

    if (sceneState.childDreamDrawing) items.push({ name: 'My Dream', image: sceneState.childDreamDrawing });

    return items;
  };

  // --- RELOAD DETECTION & RESTORATION ---
  useEffect(() => {
    if (isReload && !reloadHandledRef.current) {
      reloadHandledRef.current = true;
      const { gamePhase, wish1Taps, wish3Taps, trunkTaps, bowlStates, currentModal, draftData } = sceneState;

      console.log("🔄 Reload detected. Phase:", gamePhase, "Modal:", currentModal);
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);

      // 1. RESTORE DRAWING IF OPEN
      if (currentModal === 'drawing') {
        setResumeMessage("Welcome back! We saved your drawing! 🎨");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        setShowDrawingPad(true); // Re-open the pad
        return;
      }

      // Add this BEFORE checking gamePhase values:

      // CHECK TAP COMPLETION - force phase if taps complete but phase not updated
      if (wish1Taps === 3 && gamePhase === 'wish1-active') {
        console.log("🔧 Reload fix: Forcing wish1-complete");
        sceneActions.updateState({ gamePhase: 'wish1-complete' });
        return;
      }

      if (bowlStates.filter(Boolean).length === 3 && gamePhase === 'wish2-active') {
        console.log("🔧 Reload fix: Forcing wish2-complete");
        sceneActions.updateState({ gamePhase: 'wish2-complete' });
        return;
      }

      if (wish3Taps === 3 && gamePhase === 'wish3-active') {
        console.log("🔧 Reload fix: Forcing wish3-complete");
        sceneActions.updateState({ gamePhase: 'wish3-complete' });
        return;
      }

      if (trunkTaps === 3 && (gamePhase === 'dream-clouded' || gamePhase === 'dream-clearing')) {
        console.log("🔧 Reload fix: Forcing dream-revealed");
        sceneActions.updateState({ gamePhase: 'dream-revealed' });
        return;
      }

      // Add this right after the drawing modal check:

      // 2. CHECK FOR WISH COMPLETION PHASES
      if (gamePhase === 'wish1-complete') {
        setResumeMessage("Welcome back! Your first wish is complete! ✨");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        // Let the auto-transition useEffect handle moving to wish2-intro
        return;
      }

      if (gamePhase === 'wish2-complete') {
        setResumeMessage("Welcome back! Two wishes complete! ✨");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        return;
      }

      if (gamePhase === 'wish3-complete') {
        setResumeMessage("Welcome back! All three wishes complete! ✨");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        return;
      }

      if (gamePhase === 'all-wishes-complete') {
        setResumeMessage("All wishes complete! Time to dream! ✨");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        // Auto-transition useEffect will handle moving to dream-clouded
        return;
      }


      // 2. PHASE MESSAGES
      if (gamePhase === 'intro') return;

      if (gamePhase === 'wish1-active' && wish1Taps > 0) {
        setResumeMessage(`Keep tapping! You've tapped ${wish1Taps}/3 times!`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }

      if (gamePhase === 'wish2-active') {
        const filled = bowlStates.filter(Boolean).length;
        if (filled > 0) {
          setResumeMessage(`Great! You've filled ${filled}/3 bowls!`);
          setShowResumePopup(true);
          resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        }
        return;
      }

      if (gamePhase === 'wish3-active' && wish3Taps > 0) {
        setResumeMessage(`Keep going! ${wish3Taps}/3 parts of the park are green!`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }

      if ((gamePhase === 'dream-clouded' || gamePhase === 'dream-clearing') && trunkTaps > 0) {
        setResumeMessage(`Keep clearing the clouds! ${trunkTaps}/3 done!`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }
    }
  }, [isReload, sceneState.gamePhase, sceneState.currentModal]);

  // --- AUTO-TRANSITION HANDLER ---
  useEffect(() => {
    let timer;
    const { gamePhase } = sceneState;

    if (gamePhase === 'wish1-complete') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'wish2-intro' }); }, 4500);
    }
    else if (gamePhase === 'wish2-complete') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'wish3-intro' }); }, 4500);
    }
    else if (gamePhase === 'wish3-complete') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'all-wishes-complete' }); }, 4500);
    }
    else if (gamePhase === 'dream-revealed') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'comparison-card' }); }, 2500);
    }
    else if (gamePhase === 'ending') {
      timer = setTimeout(() => { sceneActions.updateState({ showingCompletionScreen: true }); }, 1500);
    }

    return () => clearTimeout(timer);
  }, [sceneState.gamePhase]);


  // --- GAMEPLAY HANDLERS ---

  const handleStartGame = () => {
    sceneActions.updateState({ gamePhase: 'wish1-intro' });
  };

  const handleWish1Tap = () => {
    if (sceneState.wish1Taps >= 3) return;
    const newTaps = sceneState.wish1Taps + 1;
    sceneActions.updateState({ wish1Taps: newTaps });

    if (newTaps >= 3) {
      setTimeout(() => { sceneActions.updateState({ gamePhase: 'wish1-complete' }); }, 3000);
    }
  };

  const handleWish2Tap = (index) => {
    if (sceneState.bowlStates[index] === true) return;

    const newStates = [...sceneState.bowlStates];
    newStates[index] = true;
    const count = newStates.filter(Boolean).length;

    sceneActions.updateState({ bowlStates: newStates, wish2Taps: count });

    if (count === 3) {
      setTimeout(() => { sceneActions.updateState({ gamePhase: 'wish2-complete' }); }, 3000);
    }
  };

  const handleWish3Tap = () => {
    if (sceneState.wish3Taps >= 3) return;
    const newTaps = sceneState.wish3Taps + 1;
    sceneActions.updateState({ wish3Taps: newTaps });

    if (newTaps >= 3) {
      setTimeout(() => { sceneActions.updateState({ gamePhase: 'wish3-complete' }); }, 3000);
    }
  };

  // Specific handler for individual park items (optional enhancement from your code logic)
  const handleParkTap = (index) => {
    if (sceneState.parkStates[index] === true) return;
    const newStates = [...sceneState.parkStates];
    newStates[index] = true;
    const count = newStates.filter(Boolean).length;

    sceneActions.updateState({ parkStates: newStates, wish3Taps: count });

    if (count === 3) {
      setTimeout(() => { sceneActions.updateState({ gamePhase: 'wish3-complete' }); }, 1000);
    }
  };

  const handleTrunkTap = () => {
    const newTaps = sceneState.trunkTaps + 1;
    sceneActions.updateState({ trunkTaps: newTaps, gamePhase: 'dream-clearing' });

    if (newTaps >= 3) {
      setTimeout(() => { sceneActions.updateState({ gamePhase: 'dream-revealed' }); }, 1500);
    }
  };

  // --- DRAWING HANDLERS ---

  const handleDreamDrawingSave = (data) => {
    setShowDrawingPad(false);
    sceneActions.updateState({
      childDreamDrawing: data.image,
      gamePhase: 'dream-clouded',
      currentModal: null, // Clear modal state
      draftData: null
    });
  };

  const handleDrawingCancel = () => {
    setShowDrawingPad(false);
    sceneActions.updateState({ currentModal: null, draftData: null });
  };

  return (
    <div className="dreams-wishes-game" data-zone="about-me-hut">
      <img src={dreamsBg} alt="Background" className="dreams-background" />

      {/* Back Button */}
      {sceneState.gamePhase !== 'intro' && !sceneState.showingCompletionScreen && (
        <BackToMapButton onNavigate={onNavigate} />
      )}

      {/* Story Progress Header */}
      {!sceneState.gamePhase.startsWith('dream') &&
        sceneState.gamePhase !== 'comparison-card' &&
        sceneState.gamePhase !== 'ending' && (
          <StoryProgressHeader discoveries={getDiscoveries()} isChildMode={false} />
        )}

      {sceneState.gamePhase === 'intro' && (
        <OpeningModal
          zoneId="about-me-hut"
          sceneId="dreams-wishes"
          onStart={handleStartGame}
          characterImg={babyGaneshaImg}
          showButton={true}
        />
      )}

      {/* Wish 1 Intro */}
      {sceneState.gamePhase === 'wish1-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">My first wish is for a happy world.</p>
            <p className="wish-intro-text">The world looks a little sad right now 😔</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => sceneActions.updateState({ gamePhase: 'wish1-active' })}
              className="heartbeat-delayed"
            >
              Let's Make Them Smile! 😊
            </Button>
          </div>
        </div>
      )}

      {/* Wish 1 Active */}
      {sceneState.gamePhase === 'wish1-active' && (
        <div className="wish-screen">
          <div className="ganesha-watching"><img src={babyGaneshaImg} alt="Ganesha" className="ganesha-small bounce-gentle" /></div>
          <div className="wish-instruction-bubble">Tap the earth 3 times to send smiles! ({sceneState.wish1Taps}/3)</div>
          <div className="wish-interactive-container">
            <div className="earth-container" onClick={handleWish1Tap}>
              <img src={wishEarthSad} alt="Sad" className="earth-image sad" style={{ opacity: sceneState.wish1Taps === 0 ? 1 : sceneState.wish1Taps === 1 ? 0.6 : sceneState.wish1Taps === 2 ? 0.3 : 0 }} />
              <img src={wishEarthHappy} alt="Happy" className={`earth-image happy ${sceneState.wish1Taps >= 3 ? 'complete-glow-pulse' : ''}`} style={{ opacity: sceneState.wish1Taps === 0 ? 0 : sceneState.wish1Taps === 1 ? 0.4 : sceneState.wish1Taps === 2 ? 0.7 : 1 }} />
            </div>
            <div className="faces-container">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="face-emoji" style={{ transform: `rotate(${i * 60}deg) translate(160px) rotate(-${i * 60}deg)`, opacity: sceneState.wish1Taps >= 2 ? 0.6 : 1, transition: 'all 0.6s ease' }}>{sceneState.wish1Taps >= 3 ? '😊' : sceneState.wish1Taps >= 2 ? '😐' : '😢'}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wish 1 Complete */}
      {sceneState.gamePhase === 'wish1-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          <div className="success-message-large">You made the world smile! 😊✨</div>
          <div className="soft-thank-you">Thank you for helping me 💛</div>
          <div className="wish-checkmark">🌱 1 of 3 wishes complete</div>
          <div className="celebration-elements">{Array.from({ length: 15 }).map((_, i) => <div key={i} className="floating-element" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}>😊</div>)}</div>
        </div>
      )}

      {/* Wish 2 Intro */}
      {sceneState.gamePhase === 'wish2-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">My second wish is that no one feels hungry or alone.</p>
            <p className="wish-intro-text">Let's share with everyone! 🤝</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => sceneActions.updateState({ gamePhase: 'wish2-active' })}
              className="heartbeat-delayed"
            >
              Let's Share! 🍎
            </Button>
          </div>
        </div>
      )}

      {/* Wish 2 Active */}
      {sceneState.gamePhase === 'wish2-active' && (
        <div className="wish-screen">
          <div className="ganesha-watching"><img src={babyGaneshaImg} alt="Ganesha" className="ganesha-small bounce-gentle" /></div>
          <div className="wish-instruction-bubble">Tap the bowls 3 times to fill them! ({sceneState.wish2Taps}/3)</div>
          <div className="wish-interactive-container">
            <div className="bowls-container">
              {sceneState.bowlStates.map((isFilled, index) => (
                <div key={index} className={`bowl ${isFilled ? 'bowl-filled' : 'bowl-empty'}`} onClick={() => handleWish2Tap(index)}>
                  <img src={isFilled ? wishBowlFull : wishBowlEmpty} alt={`Bowl ${index + 1}`} className={`bowl-image ${isFilled ? 'bowl-glow-bounce' : ''}`} />
                  {isFilled && <div className="bowl-food pop-in">🍚</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wish 2 Complete */}
      {sceneState.gamePhase === 'wish2-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          <div className="success-message-large">You filled hearts with sharing! ✨</div>
          <div className="soft-thank-you">Thank you for caring so much 💛</div>
          <div className="wish-checkmark">🌱 2 of 3 wishes complete</div>
          <div className="celebration-elements">{Array.from({ length: 15 }).map((_, i) => <div key={i} className="floating-element" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}>❤️</div>)}</div>
        </div>
      )}

      {/* Wish 3 Intro */}
      {sceneState.gamePhase === 'wish3-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">My last wish is for a green, happy world.</p>
            <p className="wish-intro-text">Where kids can run, play, and smile outside! 🌿</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => sceneActions.updateState({ gamePhase: 'wish3-active' })}
              className="heartbeat-delayed"
            >
              Let's Make It Green! 🌸
            </Button>
          </div>
        </div>
      )}

      {/* Wish 3 Active */}
      {sceneState.gamePhase === 'wish3-active' && (
        <div className="wish-screen">
          <div className="ganesha-watching"><img src={babyGaneshaImg} alt="Ganesha" className="ganesha-small bounce-gentle" /></div>
          <div className="wish-instruction-bubble">Tap the park 3 times to make it bloom! ({sceneState.wish3Taps}/3)</div>
          <div className="wish-interactive-container">
            <div className={`park-scene ${sceneState.wish3Taps >= 1 ? 'park-tap1' : ''}`} onClick={handleWish3Tap}>
              <img src={wishGrassDry} alt="Dry" className="park-ground-image dry" style={{ opacity: sceneState.wish3Taps === 0 ? 1 : 0.3 }} />
              <img src={wishGrassGreen} alt="Green" className={`park-ground-image green ${sceneState.wish3Taps >= 3 ? 'complete-glow-pulse' : ''}`} style={{ opacity: sceneState.wish3Taps === 0 ? 0 : 1 }} />

              {sceneState.wish3Taps >= 1 && <div className="flowers-container">{['🌸', '🌺', '🌻'].map((fl, i) => <div key={i} className="flower pop-in" style={{ left: `${20 + i * 20}%` }}>{fl}</div>)}</div>}
              {sceneState.wish3Taps >= 2 && <div className="butterflies-container">{['🦋', '🦋'].map((bf, i) => <div key={i} className="butterfly flutter" style={{ left: `${30 + i * 30}%` }}>{bf}</div>)}</div>}
              {sceneState.wish3Taps >= 3 && <div className="playground pop-in"><div className="playground-item">🛝</div></div>}
            </div>
          </div>
        </div>
      )}

      {/* Wish 3 Complete */}
      {sceneState.gamePhase === 'wish3-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          <div className="success-message-large">You made the world green and playful! ✨</div>
          <div className="soft-thank-you">Thank you for helping the Earth 💛</div>
          <div className="wish-checkmark">🌱 3 of 3 wishes complete</div>
          <div className="celebration-elements">{Array.from({ length: 15 }).map((_, i) => <div key={i} className="floating-element" style={{ left: `${Math.random() * 100}%` }}>🌸</div>)}</div>
        </div>
      )}

      {/* All Wishes Complete */}
      {sceneState.gamePhase === 'all-wishes-complete' && (
        <div className="intro-overlay">
          <img src={babyGaneshaSit} alt="Baby Ganesha" className="intro-ganesha celebrate-scale" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">WOW! You made the world brighter! ✨</p>
            <p className="wish-intro-text">Now it's your turn 💛<br />What would you love to wish for?</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => sceneActions.updateState({ gamePhase: 'dream-intro' })}
              className="heartbeat-delayed"
            >
              Tell Me Your Dream! 💭
            </Button>
          </div>
        </div>
      )}

      {/* Dream Intro */}
      {sceneState.gamePhase === 'dream-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">Draw a happy wish on this magic canvas! ✨</p>
            <p className="wish-intro-text">What would you love to draw today? 🎨</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => {
                setShowDrawingPad(true);
                sceneActions.updateState({ gamePhase: 'dream-drawing', currentModal: 'drawing' }); // Set modal state
              }}
              className="heartbeat-delayed"
            >
              Start Drawing! ✏️
            </Button>
          </div>
        </div>
      )}

      {/* Drawing Pad */}
      {showDrawingPad && (
        <div className="drawing-overlay">
          <DrawingPad
            prompt="Draw your biggest dream! What do you want to be? 🌟"

            initialData={sceneState.draftData} // Restore draft if reloaded
            onAutoSave={(data) => sceneActions.updateState({ draftData: data })} // Save as they draw

            onSave={handleDreamDrawingSave}
            onCancel={() => {
              setShowDrawingPad(false);
              handleDrawingCancel();
            }}
          />
        </div>
      )}

      {/* Dream Clouded / Clearing */}
      {(sceneState.gamePhase === 'dream-clouded' || sceneState.gamePhase === 'dream-clearing') && (
        <div className="dream-screen">
          <div className="dream-container">
            <div className="dream-drawing-display">
              {sceneState.childDreamDrawing && <img src={sceneState.childDreamDrawing} alt="Dream" className="dream-image" style={{ filter: sceneState.trunkTaps === 3 ? 'none' : 'blur(6px)', opacity: 0.5 + (sceneState.trunkTaps * 0.15) }} />}
            </div>
            <div className="clouds-container">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`dream-cloud cloud-${i + 1} ${sceneState.trunkTaps > i ? 'cloud-fade' : ''}`}><img src={cloudImg} alt="Cloud" className="cloud-icon" /></div>
              ))}
            </div>
            <div className={`ganesha-helper ${sceneState.trunkTaps > 0 ? 'ganesha-blowing' : ''}`} onClick={handleTrunkTap}>
              <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-trunk bounce-gentle" />
              {sceneState.trunkTaps > 0 && <div className="wind-puff">💨</div>}
            </div>
          </div>
          <div className="dream-instruction-box">
            {sceneState.trunkTaps === 0 ? "Tap my trunk 3 times to move the clouds! ☁️" : sceneState.trunkTaps < 3 ? `Tap again! (${sceneState.trunkTaps}/3)` : "Yay! Your dream is clear now! 🌟"}
          </div>
        </div>
      )}

      {/* Dream Revealed */}
      {sceneState.gamePhase === 'dream-revealed' && (
        <div className="dream-revealed-screen">
          <div className="dream-glow-container">
            {sceneState.childDreamDrawing && <img src={sceneState.childDreamDrawing} alt="Dream" className="dream-image-glowing" />}
            <div className="sparkles-container">{Array.from({ length: 20 }).map((_, i) => <div key={i} className="sparkle-float" style={{ left: `${Math.random() * 100}%` }}>✨</div>)}</div>
          </div>
          <img src={babyGaneshaSit} alt="Ganesha" className="ganesha-proud celebrate-scale" />
          <div className="success-message-large">Your dream will come true!<br />I believe in you! 🌟</div>
        </div>
      )}

      {/* Comparison Card */}
      {sceneState.gamePhase === 'comparison-card' && (
        <div className="friendship-overlay">
          <h1 className="friendship-title">Dreams Come Together! ✨</h1>
          <p className="friendship-subtitle">Friends Help Each Other</p>
          <div className="friendship-grid">
            <div className="friend-column">
              <img src={babyGaneshaSit} alt="Ganesha" className="column-header-image" />
              <div className="column-label">GANESHA'S WISHES</div>
              <div className="wishes-list">
                <div className="wish-item"><span className="wish-icon">😊</span> Happiness ✓</div>
                <div className="wish-item"><span className="wish-icon">🤝</span> Sharing ✓</div>
                <div className="wish-item"><span className="wish-icon">🌳</span> Earth ✓</div>
              </div>
            </div>
            <div className="friend-connector"><div className="connector-heart">❤️</div>FRIENDS<div className="connector-heart">❤️</div></div>
            <div className="friend-column">
              <div className="column-label">YOUR DREAM</div>
              <div className="dream-display-box">
                {sceneState.childDreamDrawing ? <img src={sceneState.childDreamDrawing} alt="Dream" className="dream-thumbnail" /> : "Loading..."}
              </div>
            </div>
          </div>
          <Button
            variant="info"
            size="large"
            onClick={() => sceneActions.updateState({ gamePhase: 'ending', completed: true })}
            className="heartbeat-gentle"
          >
            🎉 Finish Game
          </Button>
        </div>
      )}

      {/* Ending */}
      {sceneState.gamePhase === 'ending' && !sceneState.showingCompletionScreen && (
        <div className="ending-screen">
          <img src={babyGaneshaSit} alt="Ganesha" className="ganesha-final celebrate-scale" />
          <div className="final-title">Dreams Connected! 🌟</div>
        </div>
      )}

      {/* Resume Popup */}
      {showResumePopup && (
        <div style={{
          position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%)', color: 'white',
          padding: '20px 40px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          zIndex: 9999, fontSize: '18px', fontWeight: 'bold'
        }}>
          {resumeMessage}
        </div>
      )}

      {/* Menu & Help */}
      {sceneState.gamePhase !== 'intro' && <MenuButton onClick={() => setShowSlideMenu(true)} zoneId="about-me-hut" />}

      <TocaBocaNav show={showSlideMenu} onClose={() => setShowSlideMenu(false)} zoneId="about-me-hut" onHome={() => onNavigate('home')} onHelp={() => { setShowSlideMenu(false); setShowHelpMenu(true); }} onStartFresh={() => { setShowSlideMenu(false); sceneActions.updateState({ gamePhase: 'intro', wish1Taps: 0, wish2Taps: 0, wish3Taps: 0, bowlStates: [false, false, false], trunkTaps: 0, childDreamDrawing: null }); }} />
      <HelpMenu show={showHelpMenu} onClose={() => setShowHelpMenu(false)} onNavigate={onNavigate} />

      {/* Completion Modal */}
      {sceneState.showingCompletionScreen && (
        <AboutMeCompletion
          show={sceneState.showingCompletionScreen}
          sceneName="Dreams & Wishes"
          sceneNumber={4}
          totalScenes={4}
          starsEarned={sceneState.stars}
          totalStars={3}
          discoveredBadges={['wish-maker', 'dream-helper', 'friendship-power']}
          badgeImages={{}}
          characterImages={{ babyGanesha: babyGaneshaImg }}
          nextSceneName="Symbol Mountain"
          childName="dream maker"
          onContinue={() => { if (onNavigate) onNavigate('scene-complete-continue'); else if (onComplete) onComplete(); }}
          onReplay={() => sceneActions.updateState({ gamePhase: 'intro', wish1Taps: 0, wish2Taps: 0, wish3Taps: 0, bowlStates: [false, false, false], trunkTaps: 0, childDreamDrawing: null, showingCompletionScreen: false, completed: false })}
          onBackToMap={() => { if (onNavigate) onNavigate('zone-welcome'); else if (onBack) onBack(); }}
          onHome={() => { if (onNavigate) onNavigate('home'); }}
        />
      )}
    </div>
  );
};

export default DreamsWishesGame;
