// zones/cave-of-secrets/scenes/vakratunda-mahakaya/CaveSceneFixed.jsx
import React, { useState, useEffect, useRef } from 'react';
import './CaveSceneFixed.css';

// Import scene management components (PROVEN FROM POND)
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';

// UI Components (PROVEN FROM POND)
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SymbolSceneIntegration from '../../../../lib/components/animation/SymbolSceneIntegration';
import MagicalCardFlip from '../../../../lib/components/animation/MagicalCardFlip';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

// Cave-specific components
import SanskritSidebar from '../../../../lib/components/feedback/SanskritSidebar';

// Cave images
import caveBackground from './assets/images/cave-background.png';
import vakratundaCard from './assets/images/vakratunda-card.png';
import mahakayaCard from './assets/images/mahakaya-card.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";

const CAVE_PHASES = {
  // Door 1: Vakratunda
  DOOR1_ACTIVE: 'door1_active',
  DOOR1_COMPLETE: 'door1_complete', 
  VAKRATUNDA_LEARNING: 'vakratunda_learning',
  
  // Door 2: Mahakaya
  DOOR2_ACTIVE: 'door2_active',
  DOOR2_COMPLETE: 'door2_complete',
  MAHAKAYA_LEARNING: 'mahakaya_learning',
  
  COMPLETE: 'complete'
};

// Error Boundary (PROVEN FROM POND)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in Cave Scene ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong in the Cave.</h2>
          <details>
            <summary>Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>Reload Cave Scene</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const CaveSceneFixed = ({
  onComplete,
  onNavigate,
  zoneId = 'cave-of-secrets',
  sceneId = 'vakratunda-mahakaya'
}) => {
  console.log('CaveSceneFixed props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // Door states
          door1Completed: false,
          door2Completed: false,
          
          // Sanskrit learning
          learnedWords: {
            vakratunda: { learned: false, scene: 1 },
            mahakaya: { learned: false, scene: 1 }
          },
          
          // Scene progression  
          phase: CAVE_PHASES.DOOR1_ACTIVE,
          currentFocus: 'door1',
          
          // Discovery and popup states (PROVEN SYSTEM)
          discoveredSymbols: {},
          currentPopup: null,
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          
          // GameCoach states (PROVEN SYSTEM)
          gameCoachState: null,
          isReloadingGameCoach: false,
          welcomeShown: false,
          vakratundaWisdomShown: false,
          mahakayaWisdomShown: false,
          readyForWisdom: false,
          lastGameCoachTime: 0,
          
          // Progress tracking (PROVEN SYSTEM)
          stars: 0,
          completed: false,
          progress: {
            percentage: 0,
            starsEarned: 0,
            completed: false
          },
          
          // UI states (PROVEN SYSTEM)
          showingCompletionScreen: false,
          fireworksCompleted: false
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <CaveSceneContent
            sceneState={sceneState}
            sceneActions={sceneActions}
            isReload={isReload}
            onComplete={onComplete}
            onNavigate={onNavigate}
            zoneId={zoneId}
            sceneId={sceneId}
          />
        )}
      </SceneManager>
    </ErrorBoundary>
  );
};

const CaveSceneContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('CaveSceneContent render', { sceneState, isReload, zoneId, sceneId });

  if (!sceneState?.phase) sceneActions.updateState({ phase: CAVE_PHASES.DOOR1_ACTIVE });

  // Access GameCoach functionality (PROVEN FROM POND)
  const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();

  // State management (PROVEN FROM POND)
  const [showSparkle, setShowSparkle] = useState(null);
  const [currentSourceElement, setCurrentSourceElement] = useState(null);
  const [showPopupBook, setShowPopupBook] = useState(false);
  const [popupBookContent, setPopupBookContent] = useState({});
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Refs (PROVEN FROM POND)
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const [hintUsed, setHintUsed] = useState(false);
  const previousVisibilityRef = useRef(false);

  // Get profile name
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Safe setTimeout function (PROVEN FROM POND)
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Cleanup timeouts on unmount (PROVEN FROM POND)
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Clean GameCoach on scene entry (PROVEN FROM POND)
  useEffect(() => {
    console.log('🧹 CAVE: Cleaning GameCoach on scene entry');
    
    if (hideCoach) {
      hideCoach();
    }
    if (clearManualCloseTracking) {
      clearManualCloseTracking();
    }
  }, []);

  // GameCoach messages (ADAPTED FOR CAVE)
  const caveGameCoachMessages = [
    {
      id: 'cave_welcome',
      message: `Welcome to the Cave of Secrets, ${profileName}! Ancient Sanskrit wisdom awaits your discovery!`,
      timing: 500,
      condition: () => sceneState?.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState?.welcomeShown && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'vakratunda_wisdom',
      message: `Magnificent, ${profileName}! You've unlocked Vakratunda - the curved trunk of wisdom!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.vakratunda?.learned && !sceneState?.vakratundaWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'mahakaya_wisdom',
      message: `Wonderful, ${profileName}! You've mastered Mahakaya - the mighty form of divine strength!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.mahakaya?.learned && !sceneState?.mahakayaWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    }
  ];

  // Hint configurations (ADAPTED FOR SIMPLE GAMES)
  const getHintConfigs = () => [
    {
      id: 'crystal-hint',
      message: 'Try clicking the glowing crystal!',
      explicitMessage: 'Click the magical crystal to discover Sanskrit wisdom!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.DOOR1_ACTIVE && 
               !sceneState?.door1Completed &&
               !showMagicalCard && !isVisible && !showPopupBook;
      }
    },
    {
      id: 'stone-hint',
      message: 'Click the golden stone for more wisdom!',
      explicitMessage: 'Click the golden stone to learn another Sanskrit word!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.DOOR2_ACTIVE &&
               !sceneState?.door2Completed &&
               !showMagicalCard && !isVisible && !showPopupBook;
      }
    }
  ];

  // Watch for GameCoach visibility changes (PROVEN FROM POND)
  useEffect(() => {
    if (previousVisibilityRef.current && !isVisible && pendingAction) {
      console.log(`🎬 GameCoach closed, executing pending action: ${pendingAction}`);
     
      const actionTimer = setTimeout(() => {
        switch (pendingAction) {
          case 'start-door2':
            console.log('🚪 Starting Door 2 after GameCoach wisdom');
            sceneActions.updateState({
              phase: CAVE_PHASES.DOOR2_ACTIVE,
              gameCoachState: null,
              isReloadingGameCoach: false
            });
            break;
           
          case 'start-fireworks':
            console.log('🎆 Starting fireworks after final GameCoach wisdom');
            showFinalCelebration();
            break;
        }
       
        setPendingAction(null);
      }, 1000);
     
      timeoutsRef.current.push(actionTimer);
    }
   
    previousVisibilityRef.current = isVisible;
  }, [isVisible, pendingAction]);

  // GameCoach triggering system (PROVEN FROM POND)
  useEffect(() => {
    if (!sceneState || !showMessage) return;
   
    if (sceneState.isReloadingGameCoach) {
      console.log('🚫 GameCoach blocked: Reload in progress');
      return;
    }
   
    if (sceneState.symbolDiscoveryState) {
      console.log('🚫 GameCoach blocked: Symbol discovery in progress');
      return;
    }

    if (sceneState.sidebarHighlightState) {
      console.log('🚫 GameCoach blocked: Sidebar highlighting in progress');
      return;
    }

    const matchingMessage = caveGameCoachMessages.find(
      item => typeof item.condition === 'function' && item.condition()
    );
   
    if (matchingMessage) {
      const messageAlreadyShown =
        (matchingMessage.id === 'vakratunda_wisdom' && sceneState.vakratundaWisdomShown) ||
        (matchingMessage.id === 'mahakaya_wisdom' && sceneState.mahakayaWisdomShown) ||
        (matchingMessage.id === 'cave_welcome' && sceneState.welcomeShown);
     
      if (messageAlreadyShown) {
        console.log(`🚫 GameCoach: ${matchingMessage.id} already shown this session`);
        return;
      }
     
      const timer = setTimeout(() => {
        console.log(`🎭 GameCoach: Showing divine light first, then ${matchingMessage.id} message`);
        
        setShowSparkle('divine-light');
        
        setTimeout(() => {
          setShowSparkle(null);
          
          showMessage(matchingMessage.message, {
            duration: 6000,
            animation: 'bounce',
            position: 'top-right',
            source: 'scene',
            messageType: 'wisdom'
          });
        }, 2000);
       
        switch (matchingMessage.id) {
          case 'cave_welcome':
            sceneActions.updateState({ welcomeShown: true });
            break;
          case 'vakratunda_wisdom':
            sceneActions.updateState({
              vakratundaWisdomShown: true,
              readyForWisdom: false,
              gameCoachState: 'vakratunda_wisdom'
            });
            setPendingAction('start-door2');
            break;
          case 'mahakaya_wisdom':
            sceneActions.updateState({
              mahakayaWisdomShown: true,
              readyForWisdom: false,
              gameCoachState: 'mahakaya_wisdom'
            });
            setPendingAction('start-fireworks');
            break;
        }
      }, matchingMessage.timing);
     
      return () => clearTimeout(timer);
    }
  }, [
    sceneState?.phase,
    sceneState?.learnedWords,
    sceneState?.welcomeShown,
    sceneState?.vakratundaWisdomShown,
    sceneState?.mahakayaWisdomShown,
    sceneState?.readyForWisdom,
    sceneState?.symbolDiscoveryState,
    sceneState?.sidebarHighlightState,
    showMessage
  ]);

  // SIMPLE CAVE GAMES

  // Simple Game 1: Click the crystal to learn Vakratunda
  const handleCrystalClick = () => {
    console.log('💎 Crystal clicked - starting Vakratunda learning!');
    hideActiveHints();
    
    // Show sparkle effect
    setShowSparkle('crystal-clicked');
    setTimeout(() => setShowSparkle(null), 1500);
    
    sceneActions.updateState({
      door1Completed: true,
      phase: CAVE_PHASES.DOOR1_COMPLETE,
      symbolDiscoveryState: 'vakratunda_discovering',
      currentPopup: 'vakratunda_info'
    });

    setPopupBookContent({
      title: "Vakratunda - The Curved Trunk",
      symbolImage: vakratundaCard,
      description: `Vakratunda means "curved trunk", ${profileName}! You clicked the magical crystal and discovered Ganesha's wise curved trunk that can reach anywhere to help!`
    });

    setCurrentSourceElement('crystal-area');
    
    // Delay showing popup to let sparkle play
    setTimeout(() => {
      setShowPopupBook(true);
    }, 1000);
  };

  // Simple Game 2: Click the golden stone to learn Mahakaya
  const handleStoneClick = () => {
    console.log('🪨 Golden stone clicked - starting Mahakaya learning!');
    hideActiveHints();
    
    // Show sparkle effect
    setShowSparkle('stone-clicked');
    setTimeout(() => setShowSparkle(null), 1500);
    
    sceneActions.updateState({
      door2Completed: true,
      phase: CAVE_PHASES.DOOR2_COMPLETE,
      symbolDiscoveryState: 'mahakaya_discovering',
      currentPopup: 'mahakaya_info'
    });

    setPopupBookContent({
      title: "Mahakaya - The Mighty Form",
      symbolImage: mahakayaCard,
      description: `Mahakaya means "mighty form", ${profileName}! You clicked the golden stone and discovered Ganesha's mighty powerful presence that gives strength!`
    });

    setCurrentSourceElement('stone-area');
    
    // Delay showing popup to let sparkle play
    setTimeout(() => {
      setShowPopupBook(true);
    }, 1000);
  };

  // Symbol info close handler (PROVEN FROM POND)
  const handleSymbolInfoClose = () => {
    console.log('🔍 Closing Sanskrit learning popup');
    setShowPopupBook(false);
    setPopupBookContent({});
    setCurrentSourceElement(null);
    sceneActions.updateState({ currentPopup: null });

    if (popupBookContent.title?.includes("Sacred Lotus") || popupBookContent.title?.includes("Vakratunda")) {
      console.log('📜 Lotus info closed - highlighting sidebar first');
      
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.learnedWords,
          vakratunda: { learned: true, scene: 1 }
        },
        learnedWords: {
          ...sceneState.learnedWords,
          vakratunda: { learned: true, scene: 1 }
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'vakratunda_highlighting',
        // ✅ IMPORTANT: Trigger Door 2 phase to show the stone
        phase: CAVE_PHASES.DOOR2_ACTIVE
      });

      safeSetTimeout(() => {
        console.log('🎉 Showing vakratunda celebration after sidebar highlight');
        showSanskritCelebration('vakratunda');
      }, 1000);

    } else if (popupBookContent.title?.includes("Sacred Elephant") || popupBookContent.title?.includes("Mahakaya")) {
      console.log('📜 Elephant info closed - highlighting sidebar first');
      
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.learnedWords,
          mahakaya: { learned: true, scene: 1 }
        },
        learnedWords: {
          ...sceneState.learnedWords,
          mahakaya: { learned: true, scene: 1 }
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'mahakaya_highlighting'
      });

      safeSetTimeout(() => {
        console.log('🎉 Showing mahakaya celebration after sidebar highlight');
        showSanskritCelebration('mahakaya');
      }, 1000);
    }
  };

  // Sanskrit celebration system (ADAPTED FROM POND)
  const showSanskritCelebration = (word) => {
    let title = "";
    let image = null;
    let stars = 0;

    console.log(`🎉 Showing Sanskrit celebration for: ${word}`);

    if (sceneState?.isReloadingGameCoach) {
      console.log('🚫 Skipping celebration during reload');
      return;
    }

    switch(word) {
      case 'vakratunda':
        title = `You've learned Vakratunda, ${profileName}!`;
        image = vakratundaCard;
        stars = 3;
        
        sceneActions.updateState({
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          currentPopup: 'vakratunda_card'
        });
        
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;

      case 'mahakaya':
        title = `You've learned Mahakaya, ${profileName}!`;
        image = mahakayaCard;
        stars = 3;
        
        sceneActions.updateState({
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          currentPopup: 'mahakaya_card'
        });
        
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;
    }
  };

  // Close card handler (PROVEN FROM POND)
  const handleCloseCard = () => {
    setShowMagicalCard(false);
    sceneActions.updateState({ currentPopup: null });

    if (cardContent.title?.includes("Lotus Symbol") || cardContent.title?.includes("Vakratunda")) {
      console.log('📜 Lotus card closed - triggering GameCoach wisdom');
      
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'vakratunda_wisdom'
        });
      }, 500);

    } else if (cardContent.title?.includes("Trunk Symbol") || cardContent.title?.includes("Mahakaya")) {
      console.log('📜 Trunk card closed - triggering final GameCoach wisdom');
      
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'mahakaya_wisdom'
        });
      }, 500);
    }
  };

  // Final celebration (PROVEN FROM POND)
  const showFinalCelebration = () => {
    console.log('🎊 Starting final cave celebration');
    
    setShowMagicalCard(false);
    setShowPopupBook(false);
    setShowSparkle(null);
    setCardContent({});
    setPopupBookContent({});

    sceneActions.updateState({
      showingCompletionScreen: true,
      currentPopup: 'final_fireworks',
      phase: CAVE_PHASES.COMPLETE,
      stars: 8,
      completed: true,
      progress: {
        percentage: 100,
        starsEarned: 8,
        completed: true
      }
    });

    setShowSparkle('final-fireworks');
  };

  // Hide active hints
  const hideActiveHints = () => {
    if (progressiveHintRef.current && typeof progressiveHintRef.current.hideHint === 'function') {
      progressiveHintRef.current.hideHint();
    }
  };

  const handleHintShown = (level) => {
    console.log(`Cave hint level ${level} shown`);
    setHintUsed(true);
  };

  const handleHintButtonClick = () => {
    console.log("Cave hint button clicked");
  };

  if (!sceneState) {
    return <div className="loading">Loading cave scene...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager
        messages={[]}
        sceneState={sceneState}
        sceneActions={sceneActions}
      >
        <div className="pond-scene-container" data-phase={sceneState.phase}>  {/* USING PROVEN POND CSS CLASSES */}
          <div className="pond-background" style={{ backgroundImage: `url(${caveBackground})` }}>
            
            {/* Divine light for GameCoach */}
            {showSparkle === 'divine-light' && (
              <div style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '400px',
                height: '200px',
                zIndex: 199,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="glitter"
                  count={80}
                  color="#FFD700" 
                  size={3}
                  duration={2000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Test Complete Button */}
            <div style={{
              position: 'fixed',
              top: '170px',
              left: '20px',
              zIndex: 9999,
              background: 'purple',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }} onClick={() => {
              console.log('🧪 CAVE TEST: Completing both doors');
              
              sceneActions.updateState({
                door1Completed: true,
                door2Completed: true,
                learnedWords: {
                  vakratunda: { learned: true, scene: 1 },
                  mahakaya: { learned: true, scene: 1 }
                },
                welcomeShown: true,
                vakratundaWisdomShown: true,
                mahakayaWisdomShown: false,
                readyForWisdom: true,
                phase: CAVE_PHASES.COMPLETE,
                completed: true,
                stars: 8
              });
              
              setShowMagicalCard(false);
              setShowPopupBook(false);
              
              console.log('🎭 Final GameCoach should trigger automatically...');
            }}>
              🎆 TEST COMPLETE
            </div>

            {/* Show Stone Button */}
            <div style={{
              position: 'fixed',
              top: '220px',
              left: '20px',
              zIndex: 9999,
              background: 'orange',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }} onClick={() => {
              console.log('🪨 SHOW STONE: Forcing Door 2 phase');
              
              sceneActions.updateState({
                phase: CAVE_PHASES.DOOR2_ACTIVE
              });
              
              console.log('🪨 Stone should now be visible');
            }}>
              🪨 SHOW STONE
            </div>

            {/* Simple Game 1: Magical Crystal (Vakratunda) */}
            {(sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR1_COMPLETE) && (
              <div className="crystal-area" id="crystal-area">
                <ClickableElement
                  id="magical-crystal"
                  onClick={handleCrystalClick}
                  completed={sceneState.door1Completed}
                  zone="crystal-zone"
                >
                  <div className="magical-crystal">
                    💎
                    <div className="crystal-glow"></div>
                  </div>
                </ClickableElement>
                {showSparkle === 'crystal-clicked' && (
                  <SparkleAnimation
                    type="magic"
                    count={15}
                    color="#ff9ebd"
                    size={10}
                    duration={1500}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            )}

            {/* Simple Game 2: Golden Stone (Mahakaya) */}
            {(sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR2_COMPLETE) && (
              <div className="stone-area" id="stone-area">
                <ClickableElement
                  id="golden-stone"
                  onClick={handleStoneClick}
                  completed={sceneState.door2Completed}
                  zone="stone-zone"
                >
                  <div className="golden-stone">
                    🪨
                    <div className="stone-glow"></div>
                  </div>
                </ClickableElement>
                {showSparkle === 'stone-clicked' && (
                  <SparkleAnimation
                    type="star"
                    count={20}
                    color="#ffd700"
                    size={12}
                    duration={1500}
                    fadeOut={true}
                    area="full"
                  />
                )}
              </div>
            )}

            {/* Sanskrit Sidebar */}
            <SanskritSidebar
              learnedWords={sceneState.learnedWords || {}}
              currentScene={1}
              unlockedScenes={[1]}
              mode="meanings"
              onWordClick={(wordId, wordData) => {
                console.log(`Sanskrit word clicked: ${wordId}`, wordData);
              }}
              highlightState={sceneState.sidebarHighlightState}
            />

            {/* Symbol Information Popup (PROVEN CSS) */}
            <SymbolSceneIntegration
              show={showPopupBook}
              symbolImage={popupBookContent.symbolImage}
              title={popupBookContent.title}
              description={popupBookContent.description}
              sourceElement={currentSourceElement}
              onClose={handleSymbolInfoClose}
            />

            {/* Sanskrit Learning Cards (PROVEN CSS) */}
            <MagicalCardFlip
              show={showMagicalCard}
              backImage={cardContent.image}
              title={cardContent.title}
              stars={cardContent.stars}
              onClose={handleCloseCard}
              autoFlip={false}
              autoFlipDelay={5000}
              animationDuration={6000}
            />

            {/* Confetti during card celebrations */}
            {showMagicalCard && (cardContent.title?.includes("Vakratunda") || cardContent.title?.includes("Mahakaya")) && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9998,
                pointerEvents: 'none',
                overflow: 'hidden'
              }}>
                {Array.from({ length: 50 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: `${Math.random() * 100}%`,
                      width: '10px',
                      height: '10px',
                      backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8'][Math.floor(Math.random() * 6)],
                      animation: `confettiFall ${2 + Math.random() * 3}s linear infinite`,
                      animationDelay: `${Math.random() * 2}s`,
                      transform: `rotate(${Math.random() * 360}deg)`
                    }}
                  />
                ))}
              </div>
            )}

            <style>{`
              @keyframes confettiFall {
                to {
                  transform: translateY(100vh) rotate(720deg);
                }
              }
            `}</style>

            {/* Final Fireworks */}
            {showSparkle === 'final-fireworks' && (
              <Fireworks
                show={true}
                duration={8000}
                count={25}
                colors={['#FFD700', '#FF8C00', '#FFA500', '#DAA520', '#B8860B']}
                onComplete={() => {
                  console.log('🎯 Cave fireworks complete');
                  setShowSparkle(null);
                  
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    GameStateManager.saveGameState('cave-of-secrets', 'vakratunda-mahakaya', {
                      completed: true,
                      stars: 8,
                      sanskritWords: { vakratunda: true, mahakaya: true },
                      phase: 'complete',
                      timestamp: Date.now()
                    });
                    
                    localStorage.removeItem(`temp_session_${profileId}_cave-of-secrets_vakratunda-mahakaya`);
                    SimpleSceneManager.clearCurrentScene();
                    console.log('✅ CAVE: Completion saved and temp session cleared');
                  }
                  
                  setShowSceneCompletion(true);
                }}
              />
            )}

            {/* Scene Completion */}
            <SceneCompletionCelebration
              show={showSceneCompletion}
              sceneName="Cave of Secrets - Scene 1"
              sceneNumber={1}
              totalScenes={4}
              starsEarned={sceneState.progress?.starsEarned || 8}
              totalStars={8}
              discoveredSymbols={['vakratunda', 'mahakaya'].filter(word =>
                sceneState.learnedWords?.[word]?.learned
              )}
              symbolImages={{
                vakratunda: vakratundaCard,
                mahakaya: mahakayaCard
              }}
              nextSceneName="Million Suns Chamber"
              sceneId="vakratunda-mahakaya"
              completionData={{
                stars: 8,
                sanskritWords: { vakratunda: true, mahakaya: true },
                completed: true,
                totalStars: 8
              }}
              onComplete={onComplete}
              onReplay={() => {
                console.log('🔄 Cave Scene replay requested');
                window.location.reload();
              }}
              onContinue={() => {
                console.log('🔧 Cave Scene continue to next scene');
                onNavigate?.('scene-complete-continue');
              }}
            />

            {/* Progressive Hints System */}
            <ProgressiveHintSystem
              ref={progressiveHintRef}
              sceneId={sceneId}
              sceneState={sceneState}
              hintConfigs={getHintConfigs()}
              characterImage={mooshikaCoach}
              initialDelay={20000}        
              hintDisplayTime={10000}    
              position="bottom-right"
              iconSize={60}
              zIndex={2000}
              onHintShown={handleHintShown}
              onHintButtonClick={handleHintButtonClick}
              enabled={true}
            />

            {/* Navigation */}
            <TocaBocaNav
              onHome={() => {
                console.log('🧹 HOME: Cleaning GameCoach before navigation');
                if (hideCoach) hideCoach();
                if (clearManualCloseTracking) clearManualCloseTracking();
                setTimeout(() => onNavigate?.('home'), 100);
              }}
              onProgress={() => {
                const name = activeProfile?.name || 'little explorer';
                console.log(`Great Sanskrit progress, ${name}!`);
                if (hideCoach) hideCoach();
                setShowCulturalCelebration(true);
              }}
              onHelp={() => console.log('Show help')}
              onParentMenu={() => console.log('Parent menu')}
              isAudioOn={true}
              onAudioToggle={() => console.log('Toggle audio')}
              onZonesClick={() => {
                console.log('🧹 ZONES: Cleaning GameCoach before navigation');
                if (hideCoach) hideCoach();
                if (clearManualCloseTracking) clearManualCloseTracking();
                setTimeout(() => onNavigate?.('zones'), 100);
              }}
              currentProgress={{
                stars: sceneState.stars || 0,
                completed: sceneState.completed ? 1 : 0,
                total: 1
              }}
            />

            {/* Cultural Celebration Modal */}
            <CulturalCelebrationModal
              show={showCulturalCelebration}
              onClose={() => setShowCulturalCelebration(false)}
            />

          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default CaveSceneFixed;