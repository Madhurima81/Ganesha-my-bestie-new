import React, { useState, useEffect, useRef } from 'react';
import './ModakCookingGame.css';
import '../../shared/components/OpeningModal.css'; // <--- SHARED MODAL IMPORT

// Import completion component
import FestivalSquareCompletion from '../components/FestivalSquareCompletion';
import GamePauseMenu from '../components/GamePauseMenu';
import TocaBocaNav from '../../../lib/components/navigation/TocaBocaNav';

// Import assets
import cookingBg from './assets/images/cooking-bg.png';
import brassMixingBowlEmpty from './assets/images/brass-mixing-bowl-empty.png';
import brassMixingBowlCoconut from './assets/images/brass-mixing-bowl-coconut.png';
import brassMixingBowlCoconutJaggery from './assets/images/brass-mixing-bowl-coconut-jaggery.png';
import brassMixingBowlAllIngredients from './assets/images/brass-mixing-bowl-all-ingredients.png';
import coconutBowl from './assets/images/coconut-bowl.png';
import jaggeryBowl from './assets/images/jaggery-bowl.png';
import riceBowl from './assets/images/rice-bowl.png';
import perfectModakDough from './assets/images/perfect-modak-dough.png';
import woodenMold from './assets/images/wooden-mold.png';
import doughPortion from './assets/images/dough-portion.png';
import shapedModak from './assets/images/shaped-modak.png';
import perfectModak from './assets/images/perfect-modak.png';
import steamerLid from './assets/images/steamer-lid.png';
import cookedModak from './assets/images/cooked-modak.png';

import ganeshaChef from './assets/images/ganesha-chef.png';
import spoon from './assets/images/spoon.png';
import cookingBadge from './assets/images/cooking-badge.png';

// Import additional new assets for enhanced progressions
import brassBowlWithFlour from './assets/images/brass-bowl-with-flour.png';
import brassBowlFlourWater from './assets/images/brass-bowl-flour-water.png';
import doughBall from './assets/images/dough-ball.png';
import flatDough from './assets/images/flat-dough.png';
import doughCup from './assets/images/dough-cup.png';
import coconutJaggeryFilling from './assets/images/coconut-jaggery-filling.png';
import cupWithFilling from './assets/images/cup-with-filling.png';
import sealedModak from './assets/images/sealed-modak.png';
import emptyBrassSteamer from './assets/images/empty-brass-steamer.png';
import steamerWithModak from './assets/images/steamer-with-modak.png';
import steamEffect from './assets/images/steam-effect.png';
import mouseWithModak from './assets/images/mouse-with-modak.png';
import modaksOnPlate from './assets/images/modaks-on-plate.png';
import stepIconMix from './assets/images/step-icon-mix.png';
import stepIconDough from './assets/images/step-icon-dough.png';
import stepIconShape from './assets/images/step-icon-shape.png';
import stepIconFill from './assets/images/step-icon-fill.png';
import stepIconSteam from './assets/images/step-icon-steam.png';
import waterPot from './assets/images/water-pot.png';
import rollingMat from './assets/images/rolling-mat.png';
import helperMouse from './assets/images/helper-mouse.png';

// Game steps
const STEPS = {
  INTRODUCTION: 'introduction',
  MIX_FILLING: 'mix_filling',
  MAKE_DOUGH: 'make_dough', 
  SHAPE_DOUGH: 'shape_dough',
  FILL_CLOSE: 'fill_close',
  STEAM_MODAKS: 'steam_modaks',
  COMPLETE: 'complete'
};

// Step configuration
const STEP_CONFIG = [
  { 
    id: STEPS.MIX_FILLING, 
    icon: stepIconMix, 
    title: 'Mix Filling',
    actions: ['Add Coconut', 'Add Jaggery', 'Stir Mixture']
  },
  { 
    id: STEPS.MAKE_DOUGH, 
    icon: stepIconDough, 
    title: 'Make Dough',
    actions: ['Add Rice Flour', 'Add Water', 'Mix Dough']
  },
  { 
    id: STEPS.SHAPE_DOUGH, 
    icon: stepIconShape, 
    title: 'Shape Dough',
    actions: ['Place Dough', 'Flatten Dough', 'Shape Cup']
  },
  { 
    id: STEPS.FILL_CLOSE, 
    icon: stepIconFill, 
    title: 'Fill & Close',
    actions: ['Add Filling', 'Seal Edges']
  },
  { 
    id: STEPS.STEAM_MODAKS, 
    icon: stepIconSteam, 
    title: 'Steam Cook',
    actions: ['Add to Steamer', 'Close Lid', 'Wait for Steam']
  }
];


// Opening Modal Component for Modak
const OpeningModal = ({ show, onStart }) => {
  if (!show) return null;

  return (
    <div className="game-modal-overlay">
      <div className="game-modal-content">
        {/* Character - Left Side */}
        <div className="game-modal-character">
          <img 
            src={ganeshaChef}
            alt="Ganesha"
          />
        </div>

        {/* Card - Right Side */}
        <div className="game-modal-card">
          <h1 className="game-modal-title">Modak Time! 🍬</h1>
          <p className="game-modal-subtitle">
            Let's cook Ganesha's favorite sweet together!
          </p>

          {/* Icons Grid */}
          <div className="game-modal-icons">
            <div className="game-modal-icon-item">
              <img src="/assets/festival-square/icons/recipe-icon.png" alt="Recipe" />
              <span className="game-modal-icon-label">Recipe</span>
            </div>
            <div className="game-modal-icon-item">
              <img src="/assets/festival-square/icons/cook-icon.png" alt="Cook" />
              <span className="game-modal-icon-label">Cook</span>
            </div>
            <div className="game-modal-icon-item">
              <img src="/assets/festival-square/icons/serve-icon.png" alt="Serve" />
              <span className="game-modal-icon-label">Serve</span>
            </div>
          </div>

          {/* Let's Play Button */}
          <button className="game-modal-button" onClick={onStart}>
            Let's Cook!
          </button>
        </div>
      </div>
    </div>
  );
};
const ModakCookingGame = ({ onComplete, onNavigate }) => {
  // Game state
  const [gameState, setGameState] = useState({
    currentStep: STEPS.INTRODUCTION,
    currentAction: 0,
    completedSteps: [],
    stars: 0,
    gameStartTime: Date.now(),
    completed: false,
    showDoneButton: false
  });

  // UI state  
  const [activeElement, setActiveElement] = useState(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showMouseCelebration, setShowMouseCelebration] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isStateLoaded, setIsStateLoaded] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showStepComplete, setShowStepComplete] = useState(false);
  const [completedStepInfo, setCompletedStepInfo] = useState(null);
  
  // NEW: Helper mouse state
  const [helperState, setHelperState] = useState({
    visible: false,
    position: { x: 0, y: 0 },
    message: '',
    celebrating: false
  });

  // Step-specific states
  const [mixingState, setMixingState] = useState({
    coconutAdded: false,
    jaggeryAdded: false,
    stirred: false,
    stirCount: 0
  });
  
  const [doughState, setDoughState] = useState({
    flourAdded: false,
    waterAdded: false,
    mixed: false,
    mixCount: 0
  });

  const [shapingState, setShapingState] = useState({
    doughPlaced: false,
    flattened: false,
    shaped: false
  });

  const [fillingState, setFillingState] = useState({
    filled: false,
    sealed: false
  });

  const [steamingState, setSteamingState] = useState({
    inSteamer: false,
    lidClosed: false,
    steamed: false,
    timeLeft: 8
  });

  const timeoutsRef = useRef([]);

  // Safe timeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // NEW: Update helper mouse position and message
  const updateHelper = (elementId, message, celebrate = false) => {
    const element = document.getElementById(elementId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHelperState({
        visible: true,
        position: { 
          x: rect.left + rect.width / 2, 
          y: rect.top - 60 
        },
        message: message,
        celebrating: celebrate
      });
    }
  };

  const hideHelper = () => {
    setHelperState({
      visible: false,
      position: { x: 0, y: 0 },
      message: '',
      celebrating: false
    });
  };

  const showStepCompletion = (stepId) => {
    const stepIndex = STEP_CONFIG.findIndex(s => s.id === stepId);
    if (stepIndex !== -1) {
      const stepInfo = STEP_CONFIG[stepIndex];
      setCompletedStepInfo({
        number: stepIndex + 1,
        title: stepInfo.title,
        icon: stepInfo.icon
      });
      setShowStepComplete(true);
      hideHelper();
      
      safeSetTimeout(() => {
        setShowStepComplete(false);
        setCompletedStepInfo(null);
      }, 3000);
    }
  };

  // Update helper based on game state
  useEffect(() => {
    if (gameState.currentStep === STEPS.INTRODUCTION) {
      hideHelper();
      return;
    }

    switch (gameState.currentStep) {
      case STEPS.MIX_FILLING:
        if (!mixingState.coconutAdded) {
          updateHelper('coconut-bowl', '🥥 Tap coconut!');
        } else if (!mixingState.jaggeryAdded) {
          updateHelper('jaggery-bowl', '🍯 Add jaggery!');
        } else if (!mixingState.stirred) {
          updateHelper('spoon-tool', `🥄 Stir ${mixingState.stirCount}/3!`);
        } else {
          hideHelper();
        }
        break;
        
      case STEPS.MAKE_DOUGH:
        if (!doughState.flourAdded) {
          updateHelper('rice-bowl', '🌾 Add flour!');
        } else if (!doughState.waterAdded) {
          updateHelper('water-pot', '💧 Add water!');
        } else if (!doughState.mixed) {
          updateHelper('spoon-tool', `🥄 Mix ${doughState.mixCount}/3!`);
        } else {
          hideHelper();
        }
        break;
        
      case STEPS.SHAPE_DOUGH:
        if (!shapingState.doughPlaced) {
          updateHelper('dough-ball', '👆 Place dough!');
        } else if (!shapingState.flattened) {
          updateHelper('rolling-mat', '🙌 Flatten it!');
        } else if (!shapingState.shaped) {
          updateHelper('wooden-mold', '✋ Shape cup!');
        } else {
          hideHelper();
        }
        break;
        
      case STEPS.FILL_CLOSE:
        if (!fillingState.filled) {
          updateHelper('coconut-jaggery-filling', '🥥 Add filling!');
        } else if (!fillingState.sealed) {
          updateHelper('cup-with-filling', '🤏 Seal edges!');
        } else {
          hideHelper();
        }
        break;
        
      case STEPS.STEAM_MODAKS:
        if (!steamingState.inSteamer) {
          updateHelper('sealed-modak', '👆 Into steamer!');
        } else if (!steamingState.lidClosed) {
          updateHelper('steamer-lid', '🎩 Close lid!');
        } else {
          hideHelper();
        }
        break;
        
      default:
        hideHelper();
    }
  }, [gameState.currentStep, mixingState, doughState, shapingState, fillingState, steamingState]);

  // Handle interactions with celebration
  const handleCoconutClick = () => {
    if (!mixingState.coconutAdded) {
      setMixingState(prev => ({ ...prev, coconutAdded: true }));
      setHelperState(prev => ({ ...prev, celebrating: true }));
      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
        setGameState(prev => ({ ...prev, stars: prev.stars + 1 }));
      }, 500);
    }
  };

  const handleJaggeryClick = () => {
    if (mixingState.coconutAdded && !mixingState.jaggeryAdded) {
      setMixingState(prev => ({ ...prev, jaggeryAdded: true }));
      setHelperState(prev => ({ ...prev, celebrating: true }));
      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
        setGameState(prev => ({ ...prev, stars: prev.stars + 1 }));
      }, 500);
    }
  };

  const handleStirClick = () => {
    if (mixingState.coconutAdded && mixingState.jaggeryAdded && !mixingState.stirred) {
      const newStirCount = mixingState.stirCount + 1;
      setMixingState(prev => ({ ...prev, stirCount: newStirCount }));
      
      if (newStirCount >= 3) {
        setMixingState(prev => ({ ...prev, stirred: true }));
        setHelperState(prev => ({ ...prev, celebrating: true }));
        
        safeSetTimeout(() => {
          setHelperState(prev => ({ ...prev, celebrating: false }));
          setGameState(prev => ({ 
            ...prev, 
            stars: prev.stars + 1,
            completedSteps: [...prev.completedSteps, STEPS.MIX_FILLING]
          }));
          
          // Show step completion
          showStepCompletion(STEPS.MIX_FILLING);
          
          // Move to next step after celebration
          safeSetTimeout(() => {
            setGameState(prev => ({ ...prev, currentStep: STEPS.MAKE_DOUGH }));
          }, 3000);
        }, 500);
      } else {
        setHelperState(prev => ({ ...prev, celebrating: true }));
        safeSetTimeout(() => {
          setHelperState(prev => ({ ...prev, celebrating: false }));
        }, 300);
      }
    }
  };

  const handleFlourClick = () => {
    if (!doughState.flourAdded) {
      setDoughState(prev => ({ ...prev, flourAdded: true }));
      setHelperState(prev => ({ ...prev, celebrating: true }));
      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
        setGameState(prev => ({ ...prev, stars: prev.stars + 1 }));
      }, 500);
    }
  };

  const handleWaterClick = () => {
    if (doughState.flourAdded && !doughState.waterAdded) {
      setDoughState(prev => ({ ...prev, waterAdded: true }));
      setHelperState(prev => ({ ...prev, celebrating: true }));
      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
        setGameState(prev => ({ ...prev, stars: prev.stars + 1 }));
      }, 500);
    }
  };

  const handleDoughMixClick = () => {
    if (doughState.flourAdded && doughState.waterAdded && !doughState.mixed) {
      const newMixCount = doughState.mixCount + 1;
      setDoughState(prev => ({ ...prev, mixCount: newMixCount }));
      
      if (newMixCount >= 3) {
        setDoughState(prev => ({ ...prev, mixed: true }));
        setHelperState(prev => ({ ...prev, celebrating: true }));
        
        safeSetTimeout(() => {
          setHelperState(prev => ({ ...prev, celebrating: false }));
          setGameState(prev => ({ 
            ...prev, 
            stars: prev.stars + 1,
            completedSteps: [...prev.completedSteps, STEPS.MAKE_DOUGH]
          }));
          
          // Show step completion
          showStepCompletion(STEPS.MAKE_DOUGH);
          
          // Move to next step after celebration
          safeSetTimeout(() => {
            setGameState(prev => ({ ...prev, currentStep: STEPS.SHAPE_DOUGH }));
          }, 3000);
        }, 500);
      } else {
        setHelperState(prev => ({ ...prev, celebrating: true }));
        safeSetTimeout(() => {
          setHelperState(prev => ({ ...prev, celebrating: false }));
        }, 300);
      }
    }
  };

  const handleDoughPlaceClick = () => {
    if (!shapingState.doughPlaced) {
      setShapingState(prev => ({ ...prev, doughPlaced: true }));
      setHelperState(prev => ({ ...prev, celebrating: true }));
      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
        setGameState(prev => ({ ...prev, stars: prev.stars + 1 }));
      }, 500);
    }
  };

  const handleFlattenClick = () => {
    if (shapingState.doughPlaced && !shapingState.flattened) {
      setShapingState(prev => ({ ...prev, flattened: true }));
      setHelperState(prev => ({ ...prev, celebrating: true }));
      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
        setGameState(prev => ({ ...prev, stars: prev.stars + 1 }));
      }, 500);
    }
  };

  const handleShapeClick = () => {
    if (shapingState.flattened && !shapingState.shaped) {
      setShapingState(prev => ({ ...prev, shaped: true }));
      setHelperState(prev => ({ ...prev, celebrating: true }));
      
      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
        setGameState(prev => ({ 
          ...prev, 
          stars: prev.stars + 1,
          completedSteps: [...prev.completedSteps, STEPS.SHAPE_DOUGH]
        }));
        
        // Show step completion
        showStepCompletion(STEPS.SHAPE_DOUGH);
        
        // Move to next step after celebration
        safeSetTimeout(() => {
          setGameState(prev => ({ ...prev, currentStep: STEPS.FILL_CLOSE }));
        }, 3000);
      }, 500);
    }
  };

  const handleFillingClick = () => {
    if (!fillingState.filled) {
      setFillingState(prev => ({ ...prev, filled: true }));
      setHelperState(prev => ({ ...prev, celebrating: true }));
      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
        setGameState(prev => ({ ...prev, stars: prev.stars + 1 }));
      }, 500);
    }
  };

  const handleSealClick = () => {
    if (fillingState.filled && !fillingState.sealed) {
      setFillingState(prev => ({ ...prev, sealed: true }));
      setHelperState(prev => ({ ...prev, celebrating: true }));
      
      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
        setGameState(prev => ({ 
          ...prev, 
          stars: prev.stars + 1,
          completedSteps: [...prev.completedSteps, STEPS.FILL_CLOSE]
        }));
        
        // Show step completion
        showStepCompletion(STEPS.FILL_CLOSE);
        
        // Move to next step after celebration
        safeSetTimeout(() => {
          setGameState(prev => ({ ...prev, currentStep: STEPS.STEAM_MODAKS }));
        }, 3000);
      }, 500);
    }
  };

  const handleSteamerPlaceClick = () => {
    if (!steamingState.inSteamer) {
      setSteamingState(prev => ({ ...prev, inSteamer: true }));
      setHelperState(prev => ({ ...prev, celebrating: true }));
      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
        setGameState(prev => ({ ...prev, stars: prev.stars + 1 }));
      }, 500);
    }
  };

  const handleLidClick = () => {
    if (steamingState.inSteamer && !steamingState.lidClosed) {
      setSteamingState(prev => ({ ...prev, lidClosed: true }));
      setHelperState(prev => ({ ...prev, celebrating: true }));
      safeSetTimeout(() => {
        setHelperState(prev => ({ ...prev, celebrating: false }));
      }, 500);
      
      // Start timer
      const interval = setInterval(() => {
        setSteamingState(prev => {
          const newTime = prev.timeLeft - 1;
          if (newTime <= 0) {
            clearInterval(interval);
            return { ...prev, timeLeft: 0, steamed: true };
          }
          return { ...prev, timeLeft: newTime };
        });
      }, 1000);
      
      safeSetTimeout(() => {
        setGameState(prev => ({ 
          ...prev, 
          stars: prev.stars + 1,
          completedSteps: [...prev.completedSteps, STEPS.STEAM_MODAKS],
          currentStep: STEPS.COMPLETE,
          showDoneButton: true
        }));
      }, 8000);
    }
  };

  const completeGame = () => {
    setShowSceneCompletion(true);
  };

  const beginCooking = () => {
    setGameState(prev => ({ ...prev, currentStep: STEPS.MIX_FILLING }));
  };

  // Cleanup
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  return (
    <div className="modak-cooking-container">
      {/* Background */}
      <div className="cooking-background" style={{ backgroundImage: `url(${cookingBg})` }} />

      {/* Pause Button */}
      <div className="game-pause-button" onClick={() => setShowPauseMenu(true)}>
        ⏸️
      </div>

      {/* Progress Board - ICONS ONLY */}
      <div className="progress-board">
        <div className="steps-container">
          {STEP_CONFIG.map((step, index) => (
            <div 
              key={step.id}
              className={`step-icon ${
                gameState.currentStep === step.id ? 'active' : ''
              } ${
                gameState.completedSteps.includes(step.id) ? 'completed' : ''
              }`}
            >
              <img src={step.icon} alt={step.title} />
              <div className="step-number">{index + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HELPER MOUSE - Single guide */}
      {helperState.visible && (
        <div 
          className={`floating-helper ${helperState.celebrating ? 'celebrating' : ''}`}
          style={{
            position: 'fixed',
            left: `${helperState.position.x}px`,
            top: `${helperState.position.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 150
          }}
        >
          <div className="helper-bubble">
            {helperState.message}
          </div>
          <img src={helperMouse} alt="Helper" className="helper-mouse-img" />
        </div>
      )}

      {/* STEP COMPLETION CELEBRATION */}
      {showStepComplete && completedStepInfo && (
        <div className="step-completion-overlay">
          <div className="step-completion-card">
            <div className="step-complete-icon">
              <img src={completedStepInfo.icon} alt={completedStepInfo.title} />
            </div>
            <div className="step-complete-text">
              Step {completedStepInfo.number} - Completed
            </div>
            <div className="step-complete-message">Great Job!</div>
          </div>
        </div>
      )}


      {/* Opening Modal - Replaces Introduction Scene */}
      {gameState.currentStep === STEPS.INTRODUCTION && (
        <OpeningModal 
          show={true}
          onStart={beginCooking}
        />
      )}

      {/* STEP 1: MIX FILLING */}
      {gameState.currentStep === STEPS.MIX_FILLING && (
        <div className="step-area mixing-area">
          <div className="work-surface">
            {/* Coconut Bowl */}
            <div 
              id="coconut-bowl"
              className={`clickable-item ${!mixingState.coconutAdded ? 'available' : 'used'}`}
              onClick={handleCoconutClick}
            >
              <div className="golden-circle" />
              <img src={coconutBowl} alt="Coconut" />
            </div>

            {/* Mixing Bowl */}
            <div className="main-mixing-bowl">
              <img 
                src={
                  mixingState.stirred ? brassMixingBowlAllIngredients :
                  mixingState.jaggeryAdded ? brassMixingBowlCoconutJaggery :
                  mixingState.coconutAdded ? brassMixingBowlCoconut :
                  brassMixingBowlEmpty
                } 
                alt="Mixing Bowl" 
              />
            </div>

            {/* Jaggery Bowl */}
            <div 
              id="jaggery-bowl"
              className={`clickable-item ${mixingState.coconutAdded && !mixingState.jaggeryAdded ? 'available' : mixingState.jaggeryAdded ? 'used' : 'inactive'}`}
              onClick={handleJaggeryClick}
            >
              <div className="golden-circle" />
              <img src={jaggeryBowl} alt="Jaggery" />
            </div>

            {/* Spoon */}
            <div 
              id="spoon-tool"
              className={`clickable-item spoon-item ${mixingState.coconutAdded && mixingState.jaggeryAdded && !mixingState.stirred ? 'available' : 'inactive'}`}
              onClick={handleStirClick}
            >
              <div className="golden-circle" />
              <img src={spoon} alt="Spoon" />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: MAKE DOUGH */}
      {gameState.currentStep === STEPS.MAKE_DOUGH && (
        <div className="step-area dough-area">
          <div className="work-surface">
            {/* Rice Bowl */}
            <div 
              id="rice-bowl"
              className={`clickable-item ${!doughState.flourAdded ? 'available' : 'used'}`}
              onClick={handleFlourClick}
            >
              <div className="golden-circle" />
              <img src={riceBowl} alt="Rice Flour" />
            </div>

            {/* Dough Bowl */}
            <div className="dough-bowl-area">
              <img 
                src={
                  doughState.mixed ? perfectModakDough :
                  doughState.waterAdded ? brassBowlFlourWater :
                  doughState.flourAdded ? brassBowlWithFlour :
                  brassMixingBowlEmpty
                } 
                alt="Dough Bowl" 
              />
            </div>

            {/* Water Pot */}
            <div 
              id="water-pot"
              className={`clickable-item ${doughState.flourAdded && !doughState.waterAdded ? 'available' : doughState.waterAdded ? 'used' : 'inactive'}`}
              onClick={handleWaterClick}
            >
              <div className="golden-circle" />
              <img src={waterPot} alt="Water" />
            </div>

            {/* Spoon */}
            <div 
              id="spoon-tool"
              className={`clickable-item spoon-item ${doughState.flourAdded && doughState.waterAdded && !doughState.mixed ? 'available' : 'inactive'}`}
              onClick={handleDoughMixClick}
            >
              <div className="golden-circle" />
              <img src={spoon} alt="Spoon" />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SHAPE DOUGH */}
      {gameState.currentStep === STEPS.SHAPE_DOUGH && (
        <div className="step-area shaping-area">
          <div className="work-surface">
            {/* Dough Ball */}
            <div 
              id="dough-ball"
              className={`clickable-item ${!shapingState.doughPlaced ? 'available' : 'used'}`}
              onClick={handleDoughPlaceClick}
            >
              <div className="golden-circle" />
              <img src={doughBall} alt="Dough Ball" />
            </div>

            {/* Rolling Mat */}
            <div 
              id="rolling-mat"
              className="shaping-surface"
            >
              <img 
                src={
                  shapingState.shaped ? doughCup :
                  shapingState.flattened ? flatDough :
                  shapingState.doughPlaced ? doughPortion :
                  rollingMat
                } 
                alt="Shaping Surface"
                className={`${shapingState.doughPlaced && !shapingState.flattened ? 'available clickable-item' : ''}`}
                onClick={handleFlattenClick}
              />
              {shapingState.doughPlaced && !shapingState.flattened && <div className="golden-circle large" />}
            </div>

            {/* Wooden Mold */}
            <div 
              id="wooden-mold"
              className={`clickable-item ${shapingState.flattened && !shapingState.shaped ? 'available' : 'inactive'}`}
              onClick={handleShapeClick}
            >
              <div className="golden-circle" />
              <img src={woodenMold} alt="Mold" />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: FILL & CLOSE */}
      {gameState.currentStep === STEPS.FILL_CLOSE && (
        <div className="step-area filling-area">
          <div className="work-surface">
            {/* Coconut-Jaggery Filling */}
            <div 
              id="coconut-jaggery-filling"
              className={`clickable-item ${!fillingState.filled ? 'available' : 'used'}`}
              onClick={handleFillingClick}
            >
              <div className="golden-circle" />
              <img src={coconutJaggeryFilling} alt="Filling" />
            </div>

            {/* Dough Cup */}
            <div className="dough-cup-area">
              <img 
                src={
                  fillingState.sealed ? sealedModak :
                  fillingState.filled ? cupWithFilling :
                  doughCup
                } 
                alt="Modak"
                id="cup-with-filling"
                className={`${fillingState.filled && !fillingState.sealed ? 'available clickable-item' : ''}`}
                onClick={handleSealClick}
              />
              {fillingState.filled && !fillingState.sealed && <div className="golden-circle large" />}
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: STEAM */}
      {gameState.currentStep === STEPS.STEAM_MODAKS && (
        <div className="step-area steaming-area">
          <div className="work-surface">
            {/* Sealed Modak */}
            {!steamingState.inSteamer && (
              <div 
                id="sealed-modak"
                className="clickable-item available"
                onClick={handleSteamerPlaceClick}
              >
                <div className="golden-circle" />
                <img src={sealedModak} alt="Modak" />
              </div>
            )}

            {/* Steamer */}
            <div className="steamer-setup">
              <img 
                src={steamingState.inSteamer ? steamerWithModak : emptyBrassSteamer} 
                alt="Steamer" 
              />
              
              {steamingState.lidClosed && (
                <>
                  <img src={steamerLid} alt="Lid" className="steamer-lid-placed" />
                  {!steamingState.steamed && (
                    <div className="steam-timer">
                      ⏱️ {steamingState.timeLeft}s
                    </div>
                  )}
                  {steamingState.steamed && (
                    <img src={steamEffect} alt="Steam" className="steam-animation" />
                  )}
                </>
              )}
            </div>

            {/* Lid */}
            {steamingState.inSteamer && !steamingState.lidClosed && (
              <div 
                id="steamer-lid"
                className="clickable-item available"
                onClick={handleLidClick}
              >
                <div className="golden-circle" />
                <img src={steamerLid} alt="Lid" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPLETE */}
      {gameState.currentStep === STEPS.COMPLETE && (
        <div className="completion-area">
          <div className="final-modak-display">
            <img src={cookedModak} alt="Cooked Modak" className="final-modak" />
            <div className="modak-plate">
              <img src={modaksOnPlate} alt="Modaks" />
            </div>
          </div>
          
          {gameState.showDoneButton && (
            <button className="done-cooking-button" onClick={completeGame}>
              🎉 All Done!
            </button>
          )}
        </div>
      )}

      {/* Start Over Button */}
      <div className="start-over-button" onClick={() => {
        timeoutsRef.current.forEach(id => clearTimeout(id));
        timeoutsRef.current = [];
        
        setTimeout(() => {
          setGameState({
            currentStep: STEPS.INTRODUCTION,
            currentAction: 0,
            completedSteps: [],
            stars: 0,
            gameStartTime: Date.now(),
            completed: false,
            showDoneButton: false
          });
          setMixingState({ coconutAdded: false, jaggeryAdded: false, stirred: false, stirCount: 0 });
          setDoughState({ flourAdded: false, waterAdded: false, mixed: false, mixCount: 0 });
          setShapingState({ doughPlaced: false, flattened: false, shaped: false });
          setFillingState({ filled: false, sealed: false });
          setSteamingState({ inSteamer: false, lidClosed: false, steamed: false, timeLeft: 8 });
          setShowSceneCompletion(false);
          setActiveElement(null);
          setShowSparkles(false);
          setShowMouseCelebration(false);
          setIsShaking(false);
          hideHelper();
        }, 100);
      }}>
        <span>🔄</span>
        <span>Start Over</span>
      </div>

      {/* Game Pause Menu */}
      <GamePauseMenu
        show={showPauseMenu}
        gameName="Modak Mastery"
        currentStars={gameState.stars}
        hasDesignOption={false}
        
        onResume={() => setShowPauseMenu(false)}
        
        onRestart={() => {
          setShowPauseMenu(false);
          timeoutsRef.current.forEach(id => clearTimeout(id));
          timeoutsRef.current = [];
          
          setTimeout(() => {
            setGameState({
              currentStep: STEPS.INTRODUCTION,
              currentAction: 0,
              completedSteps: [],
              stars: 0,
              gameStartTime: Date.now(),
              completed: false,
              showDoneButton: false
            });
            setMixingState({ coconutAdded: false, jaggeryAdded: false, stirred: false, stirCount: 0 });
            setDoughState({ flourAdded: false, waterAdded: false, mixed: false, mixCount: 0 });
            setShapingState({ doughPlaced: false, flattened: false, shaped: false });
            setFillingState({ filled: false, sealed: false });
            setSteamingState({ inSteamer: false, lidClosed: false, steamed: false, timeLeft: 8 });
            setShowSceneCompletion(false);
            setActiveElement(null);
            setShowSparkles(false);
            setShowMouseCelebration(false);
            setIsShaking(false);
            hideHelper();
          }, 100);
        }}
        
        onComplete={() => {
          setShowPauseMenu(false);
          completeGame();
        }}
      />

      {/* Festival Square Completion */}
      {showSceneCompletion && (
        <FestivalSquareCompletion
          show={showSceneCompletion}
          sceneName="Modak Mastery"
          sceneNumber={2}
          totalScenes={4}
          starsEarned={gameState.stars}
          totalStars={8}
          discoveredBadges={['cooking']}
          badgeImages={{
            cooking: cookingBadge
          }}
          nextSceneName="Rangoli Artistry"
          childName="little chef"
          onContinue={() => {
            console.log('🍪 MODAK CONTINUE: Going to next game');
            const profileId = localStorage.getItem('activeProfileId');
            if (profileId) {
              // Save completion logic here
            }
            setTimeout(() => {
              onNavigate?.('scene-complete-continue');
            }, 100);
          }}
          onReplay={() => {
            console.log('🎮 MODAK REPLAY: Play Again');
            const profileId = localStorage.getItem('activeProfileId');
            if (profileId) {
              localStorage.removeItem('modakGame');
            }
            
            setGameState({
              currentStep: STEPS.INTRODUCTION,
              currentAction: 0,
              completedSteps: [],
              stars: 0,
              gameStartTime: Date.now(),
              completed: false,
              showDoneButton: false
            });
            setMixingState({ coconutAdded: false, jaggeryAdded: false, stirred: false, stirCount: 0 });
            setDoughState({ flourAdded: false, waterAdded: false, mixed: false, mixCount: 0 });
            setShapingState({ doughPlaced: false, flattened: false, shaped: false });
            setFillingState({ filled: false, sealed: false });
            setSteamingState({ inSteamer: false, lidClosed: false, steamed: false, timeLeft: 8 });
            setShowSceneCompletion(false);
            setActiveElement(null);
            setShowSparkles(false);
            setShowMouseCelebration(false);
            setIsShaking(false);
            hideHelper();
          }}
          onBackToMap={() => {
            console.log('🗺️ MODAK MAP: Back to Festival Square');
            if (onNavigate) {
              onNavigate('zone-welcome');
            }
          }}
          onHome={() => {
            if (onNavigate) {
              onNavigate('home');
            }
          }}
        />
      )}

      <TocaBocaNav
        onHome={() => {
          if (onNavigate) onNavigate('home');
        }}
        onProgress={() => {
          console.log('Show festival progress');
        }}
        onHelp={() => console.log('Show help')}
        onParentMenu={() => console.log('Parent menu')}
        isAudioOn={true}
        onAudioToggle={() => console.log('Toggle audio')}
        onZonesClick={() => {
          if (onNavigate) onNavigate('zones');
        }}
        onStartFresh={() => {
          localStorage.removeItem('modakGame');
          timeoutsRef.current.forEach(id => clearTimeout(id));
          timeoutsRef.current = [];
          
          setGameState({
            currentStep: STEPS.INTRODUCTION,
            currentAction: 0,
            completedSteps: [],
            stars: 0,
            gameStartTime: Date.now(),
            completed: false,
            showDoneButton: false
          });
          setMixingState({ coconutAdded: false, jaggeryAdded: false, stirred: false, stirCount: 0 });
          setDoughState({ flourAdded: false, waterAdded: false, mixed: false, mixCount: 0 });
          setShapingState({ doughPlaced: false, flattened: false, shaped: false });
          setFillingState({ filled: false, sealed: false });
          setSteamingState({ inSteamer: false, lidClosed: false, steamed: false, timeLeft: 8 });
          setShowSceneCompletion(false);
          setActiveElement(null);
          setShowSparkles(false);
          setShowMouseCelebration(false);
          setIsShaking(false);
          hideHelper();
        }}
        currentProgress={{
          stars: gameState.stars || 0,
          completed: gameState.completed ? 1 : 0,
          total: 1
        }}
      />
    </div>
  );
};

export default ModakCookingGame;