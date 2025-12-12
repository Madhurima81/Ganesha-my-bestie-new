import React, { useState, useEffect, useRef } from 'react';
import './ModakCookingGame.css';

// Import completion component
import FestivalSquareCompletion from '../components/FestivalSquareCompletion';

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
//import brassSteamer from './assets/images/brass-steamer.png';
import steamerLid from './assets/images/steamer-lid.png';
import cookedModak from './assets/images/cooked-modak.png';
//import goldenOfferingPlate from './assets/images/golden-offering-plate.png';
//import litDiya from './assets/images/lit-diya.png';
//import flowerPetals from './assets/images/flower-petals.png';
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
  const [statusMessage, setStatusMessage] = useState('');
  const [ganeshaMessage, setGaneshaMessage] = useState('');
  const [showGaneshaMessage, setShowGaneshaMessage] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showMouseCelebration, setShowMouseCelebration] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isStateLoaded, setIsStateLoaded] = useState(false);

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

  // Add these functions inside the component after your state declarations
/*const saveGameState = () => {
  try {
    const saveData = {
      gameState,
      mixingState,
      doughState,
      shapingState,
      fillingState,
      steamingState,
      showSceneCompletion,
      timestamp: Date.now()
    };
    localStorage.setItem('modakGame', JSON.stringify(saveData));
  } catch (error) {
    console.warn('Failed to save modak game state:', error);
  }
};

const loadGameState = () => {
  try {
    const saved = localStorage.getItem('modakGame');
    if (!saved) return null;
    
    const saveData = JSON.parse(saved);
    return saveData;
  } catch (error) {
    console.warn('Failed to load modak game state:', error);
    return null;
  }
};*/

  const timeoutsRef = useRef([]);
  const statusTimeoutRef = useRef(null);

  // Safe timeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Clear status message with timeout management
  const setStatusMessageWithTimeout = (message, delay = 1500) => {
    // Clear any existing status timeout
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
    }
    
    setStatusMessage(message);
    
    if (delay > 0) {
      statusTimeoutRef.current = safeSetTimeout(() => {
        setStatusMessage('');
        statusTimeoutRef.current = null;
      }, delay);
    }
  };

  // Add this function after setStatusMessageWithTimeout
const setStatusForCurrentState = () => {
  switch (gameState.currentStep) {
    case STEPS.MIX_FILLING:
      if (mixingState.stirred) {
        setStatusMessageWithTimeout("🐭 Filling ready! Amazing work!", 0);
      } else if (mixingState.coconutAdded && mixingState.jaggeryAdded) {
        setStatusMessageWithTimeout(`🐭 Stir it all together! ${mixingState.stirCount > 0 ? `(${mixingState.stirCount}/3)` : '(Click 3 times)'}`, 0);
      } else if (mixingState.coconutAdded) {
        setStatusMessageWithTimeout("🐭 Now add the sweet jaggery!", 0);
      } else {
        setStatusMessageWithTimeout("🐭 Let's add coconut first!", 0);
      }
      break;
      
    case STEPS.MAKE_DOUGH:
      if (doughState.mixed) {
        setStatusMessageWithTimeout("🐭 Perfect dough! Well done!", 0);
      } else if (doughState.flourAdded && doughState.waterAdded) {
        setStatusMessageWithTimeout(`🐭 Mix it into dough! ${doughState.mixCount > 0 ? `(${doughState.mixCount}/3)` : '(Click 3 times)'}`, 0);
      } else if (doughState.flourAdded) {
        setStatusMessageWithTimeout("🐭 Now add some water!", 0);
      } else {
        setStatusMessageWithTimeout("🐭 Time for rice flour!", 0);
      }
      break;
      
    case STEPS.SHAPE_DOUGH:
      if (shapingState.shaped) {
        setStatusMessageWithTimeout("🐭 Perfect cup shape! Excellent!", 0);
      } else if (shapingState.flattened) {
        setStatusMessageWithTimeout("🐭 Now shape it into a cup!", 0);
      } else if (shapingState.doughPlaced) {
        setStatusMessageWithTimeout("🐭 Now flatten it gently!", 0);
      } else {
        setStatusMessageWithTimeout("🐭 Place the dough on the mat!", 0);
      }
      break;
      
    case STEPS.FILL_CLOSE:
      if (fillingState.sealed) {
        setStatusMessageWithTimeout("🐭 Perfectly sealed! Beautiful!", 0);
      } else if (fillingState.filled) {
        setStatusMessageWithTimeout("🐭 Now seal the edges carefully!", 0);
      } else {
        setStatusMessageWithTimeout("🐭 Add our sweet filling!", 0);
      }
      break;
      
    case STEPS.STEAM_MODAKS:
      if (steamingState.steamed) {
        setStatusMessageWithTimeout("🐭 Perfectly cooked! You're a master!", 0);
      } else if (steamingState.lidClosed) {
        setStatusMessageWithTimeout("🐭 Steaming in progress...", 0);
      } else if (steamingState.inSteamer) {
        setStatusMessageWithTimeout("🐭 Close the lid and let the magic happen!", 0);
      } else {
        setStatusMessageWithTimeout("🐭 Into the steamer it goes!", 0);
      }
      break;
      
    default:
      setStatusMessageWithTimeout("🐭 Continue your cooking adventure!", 0);
  }
};

  // Cleanup
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  // Get current step config
  const getCurrentStepConfig = () => {
    return STEP_CONFIG.find(step => step.id === gameState.currentStep);
  };

  // Check if step is active
  const isStepActive = (stepId) => {
    return stepId === gameState.currentStep;
  };

  // Check if step is completed
  const isStepCompleted = (stepId) => {
    return gameState.completedSteps.includes(stepId);
  };

  // Start cooking game from introduction
  const startCookingGame = () => {
    setGameState(prev => ({
      ...prev,
      currentStep: STEPS.MIX_FILLING
    }));
    setGaneshaMessage('');
    setShowGaneshaMessage(false);
    setStatusMessageWithTimeout("🐭 Let's make delicious sweet filling for our modaks!", 0);
    
    // Short delay, then specific guidance
    safeSetTimeout(() => {
      setStatusMessageWithTimeout("🐭 Let's add coconut first!", 0);
    }, 2000);
  };

  // Advance to next step
  const advanceToNextStep = () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
  timeoutsRef.current = [];
  
    const currentIndex = STEP_CONFIG.findIndex(step => step.id === gameState.currentStep);
    const nextStep = STEP_CONFIG[currentIndex + 1];
    
    if (nextStep) {
      setGameState(prev => ({
        ...prev,
        currentStep: nextStep.id,
        currentAction: 0,
        completedSteps: [...prev.completedSteps, prev.currentStep],
        stars: prev.stars + 2
      }));
      
      // Set clear step introduction messages
      let stepIntroMessage = '';
      let specificActionMessage = '';
      
      switch(nextStep.id) {
        case STEPS.MAKE_DOUGH:
          stepIntroMessage = '🐭 Now let\'s make the soft dough for our modaks!';
          specificActionMessage = '🐭 Time for rice flour!';
          break;
        case STEPS.SHAPE_DOUGH:
          stepIntroMessage = '🐭 Time to shape our dough into perfect cups!';
          specificActionMessage = '🐭 Place the dough on the mat!';
          break;
        case STEPS.FILL_CLOSE:
          stepIntroMessage = '🐭 Let\'s fill our cups with sweet filling!';
          specificActionMessage = '🐭 Add our sweet filling!';
          break;
        case STEPS.STEAM_MODAKS:
          stepIntroMessage = '🐭 Final step - let\'s steam cook our modaks!';
          specificActionMessage = '🐭 Into the steamer it goes!';
          break;
        default:
          stepIntroMessage = `🐭 Starting ${nextStep.title}...`;
          specificActionMessage = '';
      }
      
      setStatusMessageWithTimeout(stepIntroMessage, 0);
      setShowMouseCelebration(true);
      
      safeSetTimeout(() => {
        setShowMouseCelebration(false);
        if (specificActionMessage) {
          setStatusMessageWithTimeout(specificActionMessage, 0);
        }
      }, 3000);
    } else {
      // All steps completed - end game
      completeGame();
    }
  };

  // Handle step 1: Mix Filling (Updated with 3-click stirring)
  const handleMixingAction = (action) => {
    setActiveElement(action);
    setShowSparkles(true);
    
    if (action === 'coconut' && !mixingState.coconutAdded) {
      setMixingState(prev => ({ ...prev, coconutAdded: true }));
      setStatusMessageWithTimeout('🐭 Adding coconut... perfect!', 1500);
      
      safeSetTimeout(() => {
        setActiveElement(null);
        setShowSparkles(false);
        setStatusMessageWithTimeout('🐭 Now add the sweet jaggery!', 0);
      }, 1500);
      
    } else if (action === 'jaggery' && mixingState.coconutAdded && !mixingState.jaggeryAdded) {
      setMixingState(prev => ({ ...prev, jaggeryAdded: true }));
      setStatusMessageWithTimeout('🐭 Adding jaggery... yummy!', 1500);
      
      safeSetTimeout(() => {
        setActiveElement(null);
        setShowSparkles(false);
        setStatusMessageWithTimeout('🐭 Now stir it all together! (Click 3 times)', 0);
      }, 1500);
      
    } else if (action === 'stir' && mixingState.coconutAdded && mixingState.jaggeryAdded && !mixingState.stirred) {
      const newStirCount = mixingState.stirCount + 1;
      setMixingState(prev => ({ ...prev, stirCount: newStirCount }));
      
      // Add shaking animation
      setIsShaking(true);
      safeSetTimeout(() => setIsShaking(false), 300);
      
      if (newStirCount < 3) {
        setStatusMessageWithTimeout(`🐭 Keep stirring! (${newStirCount}/3)`, 1500);
        
        safeSetTimeout(() => {
          setActiveElement(null);
          setShowSparkles(false);
        }, 500);
      } else {
        // Third click - complete the step
        setMixingState(prev => ({ ...prev, stirred: true }));
        setStatusMessageWithTimeout('🐭 Perfect mixing!', 1500);
        
        // Add bowl shaking animation
        setIsShaking(true);
        safeSetTimeout(() => setIsShaking(false), 300);
        
        safeSetTimeout(() => {
          setActiveElement(null);
          setShowSparkles(false);
          setStatusMessage('');
          
          safeSetTimeout(() => {
            setShowSparkles(true);
            
            safeSetTimeout(() => {
              setShowSparkles(false);
              setGaneshaMessage("You've made delicious filling! The sweet aroma fills the whole booth!");
              setShowGaneshaMessage(true);
              
              safeSetTimeout(() => {
                setShowGaneshaMessage(false);
                advanceToNextStep();
              }, 5000);
            }, 1000);
          }, 500);
        }, 2000);
      }
    } else {
      return;
    }
  };

  // Handle step 2: Make Dough
  const handleDoughAction = (action) => {
    setActiveElement(action);
    setShowSparkles(true);
    
    if (action === 'flour' && !doughState.flourAdded) {
      setDoughState(prev => ({ ...prev, flourAdded: true }));
      setStatusMessageWithTimeout('🐭 Adding rice flour... great!', 1500);
      
      // Clear sparkles and active element, but keep status message
      safeSetTimeout(() => {
        setActiveElement(null);
        setShowSparkles(false);
        // Now guide to next action
        setStatusMessageWithTimeout('🐭 Now add some water!', 0);
      }, 1500);
      
    } else if (action === 'water' && doughState.flourAdded && !doughState.waterAdded) {
      setDoughState(prev => ({ ...prev, waterAdded: true }));
      setStatusMessageWithTimeout('🐭 Adding water... just right!', 1500);
      
      // Clear sparkles and active element, but keep status message
      safeSetTimeout(() => {
        setActiveElement(null);
        setShowSparkles(false);
        // Now guide to final action
        setStatusMessageWithTimeout('🐭 Mix it into dough! (Click 3 times)', 0);
      }, 1500);
      
    } else if (action === 'mix' && doughState.flourAdded && doughState.waterAdded && !doughState.mixed) {
      const newMixCount = doughState.mixCount + 1;
      setDoughState(prev => ({ ...prev, mixCount: newMixCount }));
      
      // Add bowl shaking animation
      setIsShaking(true);
      safeSetTimeout(() => setIsShaking(false), 300);
      
      if (newMixCount < 3) {
        setStatusMessageWithTimeout(`🐭 Keep mixing! (${newMixCount}/3)`, 1500);
        
        safeSetTimeout(() => {
          setActiveElement(null);
          setShowSparkles(false);
        }, 500);
      } else {
        // Third click - complete the step
        setDoughState(prev => ({ ...prev, mixed: true }));
        setStatusMessageWithTimeout('🐭 Making perfect dough...', 1500);

        // Step completion sequence
        safeSetTimeout(() => {
          setActiveElement(null);
          setShowSparkles(false);
          setStatusMessage(''); // Clear status first
          
          // Brief pause, then show celebration sparkles
          safeSetTimeout(() => {
            setShowSparkles(true);
            
            // Then show Ganesha celebration
            safeSetTimeout(() => {
              setShowSparkles(false);
              setGaneshaMessage("Beautiful dough! Soft and ready for shaping. You're becoming a real modak expert!");
              setShowGaneshaMessage(true);
              
              safeSetTimeout(() => {
                setShowGaneshaMessage(false);
                advanceToNextStep();
              }, 5000);
            }, 1000);
          }, 500);
        }, 2000);
      }
    } else {
      return; // Invalid action
    }
  };

  // Handle step 3: Shape Dough
  const handleShapingAction = (action) => {
    setActiveElement(action);
    setShowSparkles(true);
    
    if (action === 'place' && !shapingState.doughPlaced) {
      setShapingState(prev => ({ ...prev, doughPlaced: true }));
      setStatusMessageWithTimeout('🐭 Placing dough... perfect spot!', 1500);
      
      // Clear sparkles and active element, but keep status message
      safeSetTimeout(() => {
        setActiveElement(null);
        setShowSparkles(false);
        // Now guide to next action
        setStatusMessageWithTimeout('🐭 Now flatten it gently!', 0);
      }, 1500);
      
    } else if (action === 'flatten' && shapingState.doughPlaced && !shapingState.flattened) {
      setShapingState(prev => ({ ...prev, flattened: true }));
      setStatusMessageWithTimeout('🐭 Flattening dough... looks great!', 1500);
      
      // Clear sparkles and active element, but keep status message
      safeSetTimeout(() => {
        setActiveElement(null);
        setShowSparkles(false);
        // Now guide to final action
        setStatusMessageWithTimeout('🐭 Now shape it into a cup!', 0);
      }, 1500);
      
    } else if (action === 'shape' && shapingState.flattened && !shapingState.shaped) {
      setShapingState(prev => ({ ...prev, shaped: true }));
      setStatusMessageWithTimeout('🐭 Shaping into a cup...', 1500);
      
      // Step completion sequence
      safeSetTimeout(() => {
        setActiveElement(null);
        setShowSparkles(false);
        setStatusMessage(''); // Clear status first
        
        // Brief pause, then show celebration sparkles
        safeSetTimeout(() => {
          setShowSparkles(true);
          
          // Then show Ganesha celebration
          safeSetTimeout(() => {
            setShowSparkles(false);
            setGaneshaMessage("What a perfect little cup! Your hands work magic just like mine!");
            setShowGaneshaMessage(true);
            
            safeSetTimeout(() => {
              setShowGaneshaMessage(false);
              advanceToNextStep();
            }, 5000);
          }, 1000);
        }, 500);
      }, 2000);
    } else {
      return; // Invalid action
    }
  };

  // Handle step 4: Fill & Close
  const handleFillingAction = (action) => {
    setActiveElement(action);
    setShowSparkles(true);
    
    if (action === 'fill' && !fillingState.filled) {
      setFillingState(prev => ({ ...prev, filled: true }));
      setStatusMessageWithTimeout('🐭 Adding filling... not too much!', 1500);
      
      // Clear sparkles and active element, but keep status message
      safeSetTimeout(() => {
        setActiveElement(null);
        setShowSparkles(false);
        // Now guide to next action
        setStatusMessageWithTimeout('🐭 Now seal the edges carefully!', 0);
      }, 1500);
      
    } else if (action === 'seal' && fillingState.filled && !fillingState.sealed) {
      setFillingState(prev => ({ ...prev, sealed: true }));
      setStatusMessageWithTimeout('🐭 Sealing the modak...', 1500);
      
      // Step completion sequence
      safeSetTimeout(() => {
        setActiveElement(null);
        setShowSparkles(false);
        setStatusMessage(''); // Clear status first
        
        // Brief pause, then show celebration sparkles
        safeSetTimeout(() => {
          setShowSparkles(true);
          
          // Then show Ganesha celebration
          safeSetTimeout(() => {
            setShowSparkles(false);
            setGaneshaMessage("Magnificent modak! It looks just like the ones my mother used to make!");
            setShowGaneshaMessage(true);
            
            safeSetTimeout(() => {
              setShowGaneshaMessage(false);
              advanceToNextStep();
            }, 3000);
          }, 1000);
        }, 500);
      }, 2000);
    } else {
      return; // Invalid action
    }
  };

  // Handle step 5: Steam Modaks (Updated with working stopwatch)
  const handleSteamingAction = (action) => {
    setActiveElement(action);
    setShowSparkles(true);
    
    if (action === 'add_steamer' && !steamingState.inSteamer) {
      setSteamingState(prev => ({ ...prev, inSteamer: true }));
      setStatusMessageWithTimeout('🐭 Adding to steamer... gentle now!', 1500);
      
      safeSetTimeout(() => {
        setActiveElement(null);
        setShowSparkles(false);
        setStatusMessageWithTimeout('🐭 Close the lid and let the magic happen!', 0);
      }, 1500);
      
    } else if (action === 'close_lid' && steamingState.inSteamer && !steamingState.lidClosed) {
      setSteamingState(prev => ({ ...prev, lidClosed: true, timeLeft: 8 }));
      setStatusMessageWithTimeout('🐭 Steaming in progress...', 0);
      
      // Start the countdown timer
      let timeRemaining = 8;
      const timerInterval = setInterval(() => {
        timeRemaining--;
        setSteamingState(prev => ({ ...prev, timeLeft: timeRemaining }));
        
        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          
          // Steaming complete
          setSteamingState(prev => ({ ...prev, steamed: true }));
          setActiveElement(null);
          setShowSparkles(false);
          setStatusMessage('');
          
          safeSetTimeout(() => {
            setShowSparkles(true);
            
            safeSetTimeout(() => {
              setShowSparkles(false);
              setGaneshaMessage("They're perfectly cooked! You are now a master modak chef!");
              setShowGaneshaMessage(true);
              
              safeSetTimeout(() => {
                setShowGaneshaMessage(false);
                completeGame();
              }, 5000);
            }, 1000);
          }, 500);
        }
      }, 1000);
      
      // Show cultural moment during steaming
      safeSetTimeout(() => {
        if (timeRemaining > 4) {
          setStatusMessageWithTimeout('🐭 While we wait, modaks are getting fluffy and golden inside!', 0);
        }
      }, 3000);
      
    } else {
      return;
    }
  };

  // Complete game (Updated to end after steaming)
  const completeGame = () => {
    setGameState(prev => ({
      ...prev,
      completed: true,
      stars: Math.max(10, prev.stars)
    }));
    
    setGaneshaMessage("Wonderful! You've mastered the art of modak making! You're a true festival chef!");
    setShowGaneshaMessage(true);
    
    safeSetTimeout(() => {
      setShowGaneshaMessage(false);
      setShowSceneCompletion(true);
    }, 5000);
  };

useEffect(() => {
  if (!isStateLoaded) return;
  
  // Only show welcome if truly starting fresh AND not loading from saved state
  if (gameState.currentStep === STEPS.INTRODUCTION && 
      !gameState.completed && 
      !localStorage.getItem('modakGame')) {
    
    const welcomeTimeout = setTimeout(() => {
      setGaneshaMessage("Welcome to my cooking station! Let's make modaks together!");
      setShowGaneshaMessage(true);
    }, 1000);

    return () => clearTimeout(welcomeTimeout);
  }
}, [isStateLoaded, gameState.currentStep]);

useEffect(() => {
  const loadInitialState = async () => {
    try {
      const saved = localStorage.getItem('modakGame');
      if (saved) {
        const saveData = JSON.parse(saved);
        
        // Restore all game states
        setGameState(saveData.gameState);
        setMixingState(saveData.mixingState);
        setDoughState(saveData.doughState);
        setShapingState(saveData.shapingState);
        setFillingState(saveData.fillingState);
        setSteamingState(saveData.steamingState);
        if (saveData.showSceneCompletion) {
          setShowSceneCompletion(true);
        }
        
        // CLEAR UI TRANSITION STATES THAT SHOULDN'T PERSIST ON RELOAD
        setShowGaneshaMessage(false);
        setGaneshaMessage('');
        setShowSparkles(false);
        setActiveElement(null);
        setShowMouseCelebration(false);
        setStatusMessage('');
        setIsShaking(false);
        
        // REMOVED THE AUTOMATIC STEP ADVANCEMENT - this was causing the freeze
      }
    } catch (error) {
      console.warn('Failed to load modak game state:', error);
    } finally {
      setIsStateLoaded(true);
    }
  };
  
  loadInitialState();
}, []);


useEffect(() => {
  if (!isStateLoaded) return;
  
  // Debounce saves to avoid rapid saves during transitions
  const saveTimeout = setTimeout(() => {
    try {
      const saveData = {
        gameState,
        mixingState,
        doughState,
        shapingState,
        fillingState,
        steamingState,
        showSceneCompletion,
        timestamp: Date.now()
      };
      localStorage.setItem('modakGame', JSON.stringify(saveData));
    } catch (error) {
      console.warn('Failed to save modak game state:', error);
    }
  }, 500);
  
  return () => clearTimeout(saveTimeout);
}, [isStateLoaded, gameState, mixingState, doughState, shapingState, fillingState, steamingState, showSceneCompletion]);

// Replace your status message restoration useEffect with this:

useEffect(() => {
  if (!isStateLoaded) return;
  
  // Don't show status during introduction or completion
  if (gameState.currentStep === STEPS.INTRODUCTION || 
      gameState.currentStep === STEPS.COMPLETE || 
      showSceneCompletion) {
    return;
  }
  
  // Set status message with increased delay to avoid conflicts
  const statusTimeout = setTimeout(() => {
    setStatusForCurrentState();
  }, 800);
  
  return () => clearTimeout(statusTimeout);
}, [isStateLoaded]);

  // Add this useEffect after your welcome message useEffect
/*useEffect(() => {
  const savedState = loadGameState();
  if (savedState) {
    // Restore all game states
    setGameState(savedState.gameState);
    setMixingState(savedState.mixingState);
    setDoughState(savedState.doughState);
    setShapingState(savedState.shapingState);
    setFillingState(savedState.fillingState);
    setSteamingState(savedState.steamingState);
    if (savedState.showSceneCompletion) {
      setShowSceneCompletion(true);
    }
  }
}, []);*/ // Run only once on mount

// Auto-save whenever important state changes
/*useEffect(() => {
  saveGameState();
}, [gameState, mixingState, doughState, shapingState, fillingState, steamingState, showSceneCompletion]);*/

  return (
    <div className="modak-cooking-container">
      {/* Background */}
      <div 
        className="cooking-background" 
        style={{ backgroundImage: `url(${cookingBg})` }}
      />
      
      {/* Progress Board */}
      <div className="progress-board">
        <div className="board-title">Modak Fun Station</div>
        <div className="steps-container">
          {STEP_CONFIG.map((step, index) => (
            <div 
              key={step.id}
              className={`step-icon ${isStepActive(step.id) ? 'active' : ''} ${isStepCompleted(step.id) ? 'completed' : ''}`}
            >
              <img src={step.icon} alt={step.title} />
              <div className="step-number">{index + 1}</div>
              <div className="step-title">{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Message Bar */}
      {statusMessage && (
        <div className="status-message-bar">
          <img src={helperMouse} alt="Helper Mouse" className="status-mouse-icon" />
          {statusMessage}
        </div>
      )}
      
      {/* Ganesha Character - Only show during cooking steps, not during introduction */}
      {gameState.currentStep !== STEPS.INTRODUCTION && (
        <div className="ganesha-character">
          <img src={ganeshaChef} alt="Ganesha Chef" className="ganesha-image" />
          {showGaneshaMessage && (
            <div className="ganesha-speech-bubble">
              {ganeshaMessage}
            </div>
          )}
        </div>
      )}

      {/* Helper Mouse */}
      {showMouseCelebration && (
        <div className="helper-mouse celebrating">
          <img src={helperMouse} alt="Helper Mouse" />
          <div className="celebration-text">Great job!</div>
        </div>
      )}

      {/* Introduction Scene */}
      {gameState.currentStep === STEPS.INTRODUCTION && (
        <div className="introduction-scene">
          <div className="introduction-content">
            <div className="ganesha-welcome">
              <img src={ganeshaChef} alt="Ganesha Chef" className="ganesha-welcome-image" />
              {showGaneshaMessage && (
                <div className="ganesha-welcome-bubble">
                  {ganeshaMessage}
                </div>
              )}
            </div>
            <div 
              className="lets-begin-button"
              onClick={startCookingGame}
            >
              <span>👨‍🍳</span>
              <span>Let's Begin!</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Mix Filling */}
      {gameState.currentStep === STEPS.MIX_FILLING && (
        <div className="step-area mixing-area">
          <div className="work-surface">
            {/* Coconut Bowl */}
            <div 
              className={`clickable-item ${!mixingState.coconutAdded ? 'available' : 'used'}`}
              onClick={() => handleMixingAction('coconut')}
            >
              <div className="golden-circle" />
              <img src={coconutBowl} alt="Coconut" />
              <div className="item-label">Coconut</div>
            </div>

            {/* Jaggery Bowl */}
            <div 
              className={`clickable-item ${mixingState.coconutAdded && !mixingState.jaggeryAdded ? 'available' : 'inactive'}`}
              onClick={() => handleMixingAction('jaggery')}
            >
              <div className="golden-circle" />
              <img src={jaggeryBowl} alt="Jaggery" />
              <div className="item-label">Jaggery</div>
            </div>

            {/* Mixing Bowl */}
            <div className={`main-mixing-bowl ${isShaking ? 'shaking' : ''}`}>
              <img 
                src={mixingState.stirred ? perfectModakDough : 
                     mixingState.jaggeryAdded ? brassMixingBowlCoconutJaggery :
                     mixingState.coconutAdded ? brassMixingBowlCoconut : 
                     brassMixingBowlEmpty} 
                alt="Mixing Bowl" 
              />
            </div>

            {/* Spoon for stirring - Updated with shaking animation */}
            {mixingState.jaggeryAdded && !mixingState.stirred && (
              <div 
                className={`clickable-item spoon-item available ${isShaking ? 'shaking' : ''}`}
                onClick={() => handleMixingAction('stir')}
              >
                <div className="golden-circle" />
                <img src={spoon} alt="Spoon" />
                <div className="item-label">
                  Stir {mixingState.stirCount > 0 ? `(${mixingState.stirCount}/3)` : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Make Dough */}
      {gameState.currentStep === STEPS.MAKE_DOUGH && (
        <div className="step-area dough-area">
          <div className="work-surface">
            {/* Rice Flour */}
            <div 
              className={`clickable-item ${!doughState.flourAdded ? 'available' : 'used'}`}
              onClick={() => handleDoughAction('flour')}
            >
              <div className="golden-circle" />
              <img src={riceBowl} alt="Rice Flour" />
              <div className="item-label">Rice Flour</div>
            </div>

            {/* Water Pot */}
            <div 
              className={`clickable-item ${doughState.flourAdded && !doughState.waterAdded ? 'available' : 'inactive'}`}
              onClick={() => handleDoughAction('water')}
            >
              <div className="golden-circle" />
              <img src={waterPot} alt="Water" />
              <div className="item-label">Water</div>
            </div>

            {/* Dough Bowl - Enhanced progression */}
            <div className={`dough-bowl-area ${isShaking ? 'shaking' : ''}`}>
              <img 
                src={
                  doughState.mixed ? perfectModakDough :           // Final smooth dough
                  doughState.waterAdded ? brassBowlFlourWater :    // Wet flour mixture  
                  doughState.flourAdded ? brassBowlWithFlour :     // Just flour
                  brassMixingBowlEmpty                             // Empty bowl
                } 
                alt="Dough Bowl" 
              />
            </div>

            {/* Mix Action */}
            {doughState.waterAdded && !doughState.mixed && (
              <div 
                className="clickable-item mix-action available"
                onClick={() => handleDoughAction('mix')}
              >
                <div className="golden-circle" />
                <div className="mix-icon">🥄</div>
                <div className="item-label">
                  Mix Dough {doughState.mixCount > 0 ? `(${doughState.mixCount}/3)` : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Shape Dough */}
      {gameState.currentStep === STEPS.SHAPE_DOUGH && (
        <div className="step-area shaping-area">
          <div className="work-surface">
            {/* Rolling Mat */}
            <div className="rolling-mat">
              <img src={rollingMat} alt="Rolling Mat" />
              {/* Enhanced dough progression */}
              {(shapingState.doughPlaced || shapingState.flattened || shapingState.shaped) && (
                <div className="shaped-cup">
                  <img 
                    src={
                      shapingState.shaped ? doughCup :        // Image 3 - final cup
                      shapingState.flattened ? flatDough :    // Image 2 - flattened disc  
                      doughBall                               // Image 1 - round ball
                    } 
                    alt="Dough Shape" 
                  />
                </div>
              )}
            </div>

            {/* Dough Ball - Place Action */}
            {!shapingState.doughPlaced && (
              <div 
                className="clickable-item dough-ball available"
                onClick={() => handleShapingAction('place')}
              >
                <div className="golden-circle" />
                <img src={doughPortion} alt="Dough Ball" />
                <div className="item-label">Place Dough</div>
              </div>
            )}

            {/* Flatten Action */}
            {shapingState.doughPlaced && !shapingState.flattened && (
              <div 
                className="clickable-item flatten-action available"
                onClick={() => handleShapingAction('flatten')}
              >
                <div className="golden-circle" />
                <div className="flatten-icon">👋</div>
                <div className="item-label">Flatten</div>
              </div>
            )}

            {/* Shape Cup Action */}
            {shapingState.flattened && !shapingState.shaped && (
              <div 
                className="clickable-item shape-action available"
                onClick={() => handleShapingAction('shape')}
              >
                <div className="golden-circle" />
                <div className="shape-icon">🤲</div>
                <div className="item-label">Shape Cup</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Fill & Close */}
      {gameState.currentStep === STEPS.FILL_CLOSE && (
        <div className="step-area filling-area">
          <div className="work-surface">
            {/* Dough Cup - Enhanced progression */}
            <div className="dough-cup-container">
              <img 
                src={
                  fillingState.sealed ? sealedModak :     // Final sealed modak
                  fillingState.filled ? cupWithFilling : // Cup with filling
                  doughCup                                // Empty cup from Step 3
                } 
                alt="Modak" 
              />
            </div>

            {/* Filling Bowl - Show as clickable pile */}
            {!fillingState.filled && (
              <div 
                className="clickable-item filling-bowl available"
                onClick={() => handleFillingAction('fill')}
              >
                <div className="golden-circle" />
                <img src={coconutJaggeryFilling} alt="Sweet Filling" />
                <div className="item-label">Add Filling</div>
              </div>
            )}

            {/* Seal Action */}
            {fillingState.filled && !fillingState.sealed && (
              <div 
                className="clickable-item seal-action available"
                onClick={() => handleFillingAction('seal')}
              >
                <div className="golden-circle" />
                <div className="seal-icon">🤝</div>
                <div className="item-label">Seal Edges</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 5: Steam Modaks */}
      {gameState.currentStep === STEPS.STEAM_MODAKS && (
        <div className="step-area steaming-area">
          <div className="work-surface">
            {/* Steamer - Enhanced progression */}
            <div className="steamer-container">
              <img 
                src={steamingState.inSteamer ? steamerWithModak : emptyBrassSteamer} 
                alt="Steamer" 
              />
              {steamingState.lidClosed && (
                <img src={steamerLid} alt="Steamer Lid" className="steamer-lid" />
              )}
              {steamingState.lidClosed && (
                <div className="steam-effects active">
                  <img src={steamEffect} alt="Steam" className="steam-animation" />
                </div>
              )}
            </div>

            {/* Modak to Steam */}
            {!steamingState.inSteamer && (
              <div 
                className="clickable-item modak-to-steam available"
                onClick={() => handleSteamingAction('add_steamer')}
              >
                <div className="golden-circle" />
                <img src={sealedModak} alt="Sealed Modak" />
                <div className="item-label">Add to Steamer</div>
              </div>
            )}

            {/* Close Lid Action */}
            {steamingState.inSteamer && !steamingState.lidClosed && (
              <div 
                className="clickable-item close-lid available"
                onClick={() => handleSteamingAction('close_lid')}
              >
                <div className="golden-circle" />
                <div className="lid-icon">🫖</div>
                <div className="item-label">Close Lid</div>
              </div>
            )}

            {/* Timer Display - Updated with working stopwatch */}
            {steamingState.lidClosed && !steamingState.steamed && (
              <div className="cooking-timer">
                <div className="timer-circle">
                  <div className="timer-text">{steamingState.timeLeft}s</div>
                </div>
              </div>
            )}

            {/* Mouse with Completed Modak */}
            {steamingState.steamed && (
              <div className="completion-mouse">
                <img src={mouseWithModak} alt="Mouse with Modak" />
                <div className="completion-text">Perfect!</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stars Counter */}
      <div className="stars-counter">
        ⭐ {gameState.stars}
      </div>

      {/* I'm Done Cooking Button */}
      {gameState.showDoneButton && !gameState.completed && (
        <div className="done-cooking-button" onClick={handleManualCompletion}>
          <span>🬧</span>
          <span>I'm Done Cooking!</span>
        </div>
      )}

      {/* Sparkle Effects */}
      {showSparkles && (
        <div className="scene-sparkles">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

<div className="start-over-button" onClick={() => {
  // Clear any existing timeouts first
  timeoutsRef.current.forEach(id => clearTimeout(id));
  timeoutsRef.current = [];
  if (statusTimeoutRef.current) {
    clearTimeout(statusTimeoutRef.current);
    statusTimeoutRef.current = null;
  }
  
  // Clear saved game
  localStorage.removeItem('modakGame');
  
  // Reset everything in a single batch
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
    
    // Reset UI states
    setActiveElement(null);
    setShowSparkles(false);
    setStatusMessage('');
    setGaneshaMessage('');
    setShowGaneshaMessage(false);
    setShowMouseCelebration(false);
    setIsShaking(false);
  }, 100);
}}>
  <span>🔄</span>
  <span>Start Over</span>
</div>

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
            if (onComplete) {
              onComplete({
                stars: gameState.stars,
                completed: true,
                badges: ['cooking']
              });
            }
          }}
 onReplay={() => {
  // Clear saved game
  localStorage.removeItem('modakGame');
  
  // Reset all game state
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
  
  // Reset UI states
  setActiveElement(null);
  setShowSparkles(false);
  setStatusMessage('');
  setGaneshaMessage('');
  setShowGaneshaMessage(false);
  setShowMouseCelebration(false);
  setIsShaking(false);
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

export default ModakCookingGame;