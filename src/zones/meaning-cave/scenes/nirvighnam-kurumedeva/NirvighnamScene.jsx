// zones/cave-of-secrets/scenes/nirvighnam-kurumedeva/NirvighnamScene.jsx
import React, { useState, useEffect, useRef } from 'react';
import './NirvighnamScene.css';

// Import scene management components (PROVEN FROM SURYAKOTI)
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';

// UI Components (PROVEN FROM SURYAKOTI)
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
import DoorComponent from '../../components/DoorComponent';

// NEW: Game components for Nirvighnam scene
import DraggableItem from '../../../../lib/components/interactive/DraggableItem';
import DropZone from '../../../../lib/components/interactive/DropZone';

// NEW: Canvas-based fog erasing component
const FogErasingCanvas = ({ emotionId, fogImage, rockImage, onComplete, isActive }) => {
  const canvasRef = useRef(null);
  const [erasedPercentage, setErasedPercentage] = useState(0);
  const [isErasing, setIsErasing] = useState(false);
  const coverDataRef = useRef([]);
  const rockCanvasRef = useRef(null);
  const fogCanvasRef = useRef(null);

  useEffect(() => {
    if (isActive && canvasRef.current) {
      initializeCanvas();
    }
  }, [isActive, fogImage, rockImage]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Create rock background canvas
    const rockCanvas = document.createElement('canvas');
    rockCanvas.width = canvas.width;
    rockCanvas.height = canvas.height;
    const rockCtx = rockCanvas.getContext('2d');
    
    // Create fog overlay canvas
    const fogCanvas = document.createElement('canvas');
    fogCanvas.width = canvas.width;
    fogCanvas.height = canvas.height;
    const fogCtx = fogCanvas.getContext('2d');
    
    let imagesLoaded = 0;
    const totalImages = 2;
    
    const checkImagesLoaded = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        rockCanvasRef.current = rockCanvas;
        fogCanvasRef.current = fogCanvas;
        initializeCoverData();
        drawScene();
      }
    };
    
    // Load and draw rock image (background)
    const rockImg = new Image();
    rockImg.onload = () => {
      // Draw rock centered and scaled to fit
      const scale = Math.min(canvas.width / rockImg.width, canvas.height / rockImg.height);
      const x = (canvas.width - rockImg.width * scale) / 2;
      const y = (canvas.height - rockImg.height * scale) / 2;
      rockCtx.drawImage(rockImg, x, y, rockImg.width * scale, rockImg.height * scale);
      checkImagesLoaded();
    };
    rockImg.src = rockImage;
    
    // Load and draw fog image (erasable overlay)
    const fogImg = new Image();
    fogImg.onload = () => {
      // Draw fog covering the entire canvas
      fogCtx.drawImage(fogImg, 0, 0, canvas.width, canvas.height);
      checkImagesLoaded();
    };
    fogImg.src = fogImage;
  };

  const initializeCoverData = () => {
    const canvas = canvasRef.current;
    coverDataRef.current = [];
    for (let y = 0; y < canvas.height; y++) {
      coverDataRef.current[y] = [];
      for (let x = 0; x < canvas.width; x++) {
        coverDataRef.current[y][x] = true; // true = covered by fog
      }
    }
  };

  const drawScene = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw rock background (always visible where fog is erased)
    if (rockCanvasRef.current) {
      ctx.drawImage(rockCanvasRef.current, 0, 0);
    }
    
    // Draw fog overlay using cover data
    if (fogCanvasRef.current) {
      // Create a temporary canvas for the masked fog
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // Draw the full fog image to temp canvas
      tempCtx.drawImage(fogCanvasRef.current, 0, 0);
      
      // Use compositing to erase parts based on coverData
      tempCtx.globalCompositeOperation = 'destination-out';
      tempCtx.fillStyle = 'rgba(0,0,0,1)';
      
      // Erase pixels where coverData is false
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          if (coverDataRef.current[y] && !coverDataRef.current[y][x]) {
            tempCtx.fillRect(x, y, 1, 1);
          }
        }
      }
      
      // Draw the masked fog to main canvas
      ctx.drawImage(tempCanvas, 0, 0);
    }
  };

  const erase = (x, y) => {
    const canvas = canvasRef.current;
    const eraseRadius = 25;
    let newlyErased = 0;
    let totalCoveredPixels = 0;
    
    // Erase in circular pattern
    for (let dy = -eraseRadius; dy <= eraseRadius; dy++) {
      for (let dx = -eraseRadius; dx <= eraseRadius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= eraseRadius) {
          const eraseX = Math.floor(x + dx);
          const eraseY = Math.floor(y + dy);
          
          if (eraseX >= 0 && eraseX < canvas.width && 
              eraseY >= 0 && eraseY < canvas.height) {
            if (coverDataRef.current[eraseY] && coverDataRef.current[eraseY][eraseX]) {
              coverDataRef.current[eraseY][eraseX] = false;
              newlyErased++;
            }
          }
        }
      }
    }
    
    // Calculate percentage of fog erased
    totalCoveredPixels = 0;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        if (coverDataRef.current[y] && coverDataRef.current[y][x]) {
          totalCoveredPixels++;
        }
      }
    }
    
    const totalCanvasPixels = canvas.width * canvas.height;
    const newPercentage = Math.min(((totalCanvasPixels - totalCoveredPixels) / totalCanvasPixels) * 100, 100);
    
    setErasedPercentage(newPercentage);
    drawScene();
    
    // Complete when 75% of fog is erased
    if (newPercentage >= 75 && onComplete) {
      setTimeout(() => onComplete(emotionId), 500);
    }
  };

  const getEventPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width),
        y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height)
      };
    } else {
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
      };
    }
  };

  const handleStart = (e) => {
    e.preventDefault();
    setIsErasing(true);
    const pos = getEventPos(e);
    erase(pos.x, pos.y);
  };

  const handleMove = (e) => {
    e.preventDefault();
    if (isErasing) {
      const pos = getEventPos(e);
      erase(pos.x, pos.y);
    }
  };

  const handleEnd = (e) => {
    e.preventDefault();
    setIsErasing(false);
  };

  if (!isActive) return null;

  return (
    <div className={`fog-erasing-canvas fog-${emotionId}`}>
      <div className="canvas-instruction">
        {erasedPercentage < 20 && `Erase the ${emotionId} fog to find the sacred rock! ✨`}
        {erasedPercentage >= 20 && erasedPercentage < 50 && "Keep going! The rock is appearing! 🌟"}
        {erasedPercentage >= 50 && erasedPercentage < 75 && "Almost there! Your inner strength is revealed! 🔍"}
        {erasedPercentage >= 75 && "🎉 Sacred rock of strength revealed! 🎉"}
      </div>
      <canvas
        ref={canvasRef}
        width={200}
        height={150}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={{
          border: '3px solid #FFD700',
          borderRadius: '12px',
          cursor: 'crosshair',
          touchAction: 'none',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}
      />
      <div className="erase-progress-container">
        <div className="erase-progress-bg">
          <div 
            className="erase-progress-fill"
            style={{
              width: `${erasedPercentage}%`,
              height: '8px',
              background: erasedPercentage >= 75 
                ? 'linear-gradient(90deg, #90EE90, #32CD32)' 
                : 'linear-gradient(90deg, #ff6b6b, #feca57)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
        <div className="erase-percentage">
          {Math.round(erasedPercentage)}% cleared
        </div>
      </div>
    </div>
  );
};

const getBridgeRockPosition = (displayIndex) => {
  // Position rocks INSIDE the bigger, lower golden container
  const bridgeCenterX = 50;  // 50% = center of screen
  const bridgeCenterY = 65;  // ✅ MATCH NEW CONTAINER POSITION (65%)
  
  // Wider spread for bigger container
  const positions = [
    { top: bridgeCenterY + 6, left: bridgeCenterX - 9 },  // Left
    { top: bridgeCenterY + 5, left: bridgeCenterX  - 2},   // Left-center  
    { top: bridgeCenterY - 1, left: bridgeCenterX + 8},       // Center
    { top: bridgeCenterY + 3, left: bridgeCenterX + 16 },   // Right-center
    { top: bridgeCenterY + 2, left: bridgeCenterX + 23 }   // Right
  ];
  const pos = positions[displayIndex] || positions[0];
  
  // Return viewport percentages (rocks positioned relative to screen center)
  return {
    top: `${pos.top}%`,
    left: `${pos.left}%`
  };
};

// Cave images
import caveBackgroundDark from './assets/images/caveriver-background.png';
import doorImage from './assets/images/door-image.png';
import nirvighnamCard from './assets/images/nirvighnam-card.png';
import kurumedevaCard from './assets/images/kurumedeva-card.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";

// Crystal tool images
import crystalAnger from './assets/images/crystal-anger.png';
import crystalConfusion from './assets/images/crystal-confusion.png';
import crystalFear from './assets/images/crystal-fear.png';
import crystalLonely from './assets/images/crystal-lonely.png';
import crystalSad from './assets/images/crystal-sad.png';

// Fog area images
import fogAnger from './assets/images/fog-anger.png';
import fogConfusion from './assets/images/fog-confusion.png';
import fogFear from './assets/images/fog-fear.png';
import fogLonely from './assets/images/fog-lonely.png';
import fogSad from './assets/images/fog-sad.png';

// Rock collection images
import rockAnger from './assets/images/rock-anger.png';
import rockConfusion from './assets/images/rock-confusion.png';
import rockFear from './assets/images/rock-fear.png';
import rockLonely from './assets/images/rock-lonely.png';
import rockSad from './assets/images/rock-sad.png';

const CAVE_PHASES = {
  // Part 1: Nirvighnam Learning
  DOOR1_ACTIVE: 'door1_active',
  DOOR1_COMPLETE: 'door1_complete',
  CRYSTAL_FOG_INTRO: 'crystal_fog_intro',
  CRYSTAL_FOG_ACTIVE: 'crystal_fog_active',
  CRYSTAL_FOG_COMPLETE: 'crystal_fog_complete',
  NIRVIGHNAM_LEARNING: 'nirvighnam_learning',
  
  // Part 2: Kurume Deva Learning  
  DOOR2_ACTIVE: 'door2_active',
  DOOR2_COMPLETE: 'door2_complete',
  BRIDGE_BUILDING_INTRO: 'bridge_building_intro',
  BRIDGE_BUILDING_ACTIVE: 'bridge_building_active',
  BRIDGE_BUILDING_COMPLETE: 'bridge_building_complete',
  KURUME_DEVA_LEARNING: 'kurume_deva_learning',
  
  SCENE_CELEBRATION: 'scene_celebration',
  COMPLETE: 'complete'
};

// Emotion crystal mapping system
const EMOTION_PAIRS = [
  {
    crystal: crystalAnger,
    fog: fogAnger,
    rock: rockAnger,
    emotion: 'anger',
    id: 'anger'
  },
  {
    crystal: crystalConfusion,
    fog: fogConfusion,
    rock: rockConfusion,
    emotion: 'confusion',
    id: 'confusion'
  },
  {
    crystal: crystalFear,
    fog: fogFear,
    rock: rockFear,
    emotion: 'fear',
    id: 'fear'
  },
  {
    crystal: crystalLonely,
    fog: fogLonely,
    rock: rockLonely,
    emotion: 'lonely',
    id: 'lonely'
  },
  {
    crystal: crystalSad,
    fog: fogSad,
    rock: rockSad,
    emotion: 'sad',
    id: 'sad'
  }
];

// Error Boundary (PROVEN FROM SURYAKOTI)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in Nirvighnam Scene ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong in the Obstacle Remover Chamber.</h2>
          <details>
            <summary>Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>Reload Chamber Scene</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const NirvighnamScene = ({
  onComplete,
  onNavigate,
  zoneId = 'cave-of-secrets',
  sceneId = 'nirvighnam-kurumedeva'
}) => {
  console.log('NirvighnamScene props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // Door 1 state (Nir-vigh-nam)
          door1State: 'waiting',
          door1SyllablesPlaced: [],
          door1Completed: false,
          door1CurrentStep: 0,
          door1Syllables: ['Nir', 'vigh', 'nam'],

          // Door 2 state (Ku-ru-me-de-va)  
          door2State: 'waiting',
          door2SyllablesPlaced: [],
          door2Completed: false,
          door2CurrentStep: 0,
          door2Syllables: ['Ku', 'ru', 'me', 'de', 'va'],

          // Game 1: Crystal Fog Clearing state
          crystalFogStarted: false,
          selectedCrystal: null,
          clearedFogs: [],
          collectedRocks: [],
          crystalFogCompleted: false,
          emotionalProgress: 0,

          // Game 2: Bridge Building state
          bridgeBuildingStarted: false,
          bridgeRocks: [],
          bridgeStability: 0,
          bridgeCompleted: false,
          ganeshaCanCross: false,
          
          // Sanskrit learning - Previous scenes learned
          learnedWords: {
            vakratunda: { learned: true, scene: 1 },
            mahakaya: { learned: true, scene: 1 },
            suryakoti: { learned: true, scene: 2 },
            samaprabha: { learned: true, scene: 2 },
            nirvighnam: { learned: false, scene: 3 },
            kurumedeva: { learned: false, scene: 3 }
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
          nirvighnamWisdomShown: false,
          kurumedevaWisdomShown: false,
          readyForWisdom: false,
          lastGameCoachTime: 0,
          crystalFogIntroShown: false,
          bridgeBuildingIntroShown: false,
          
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
          <NirvighnamSceneContent
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

const NirvighnamSceneContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('NirvighnamSceneContent render', { sceneState, isReload, zoneId, sceneId });

  if (!sceneState?.phase) sceneActions.updateState({ phase: CAVE_PHASES.DOOR1_ACTIVE });

  // Access GameCoach functionality (PROVEN FROM SURYAKOTI)
  const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();

  // State management (PROVEN FROM SURYAKOTI)
  const [showSparkle, setShowSparkle] = useState(null);
  const [currentSourceElement, setCurrentSourceElement] = useState(null);
  const [showPopupBook, setShowPopupBook] = useState(false);
  const [popupBookContent, setPopupBookContent] = useState({});
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Refs (PROVEN FROM SURYAKOTI)
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const [hintUsed, setHintUsed] = useState(false);
  const previousVisibilityRef = useRef(false);

  // Get profile name
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Safe setTimeout function (PROVEN FROM SURYAKOTI)
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Clear local storage function
  const clearLocalStorage = () => {
    if (window.confirm('Are you sure you want to clear all saved progress? This cannot be undone.')) {
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('gameState_') ||
            key.includes('activeProfileId') ||
            key.includes('profiles_') ||
            key.includes('temp_session_') ||
            key.includes('scene_progress_') ||
            key.includes('user_progress_')
          )) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        console.log('🗑️ Local storage cleared:', keysToRemove.length, 'keys removed');
        alert('Local storage cleared! The page will reload.');
        window.location.reload();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
        alert('Error clearing local storage. Check console for details.');
      }
    }
  };

  // Cleanup timeouts on unmount (PROVEN FROM SURYAKOTI)
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Clean GameCoach on scene entry (PROVEN FROM SURYAKOTI)
  useEffect(() => {
    console.log('🧹 NIRVIGHNAM: Cleaning GameCoach on scene entry');
    
    if (hideCoach) {
      hideCoach();
    }
    if (clearManualCloseTracking) {
      clearManualCloseTracking();  
    }
  }, []);

  // GameCoach messages (ADAPTED FOR NIRVIGHNAM)
  const caveGameCoachMessages = [
    {
      id: 'cave_welcome',
      message: `Welcome to the Obstacle Remover Chamber, ${profileName}! Sacred crystals await your touch!`,
      timing: 500,
      condition: () => sceneState?.phase === CAVE_PHASES.DOOR1_ACTIVE && !sceneState?.welcomeShown && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'nirvighnam_wisdom',
      message: `Wonderful, ${profileName}! You've mastered Nirvighnam - removing all obstacles with sacred power!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.nirvighnam?.learned && !sceneState?.nirvighnamWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    },
    {
      id: 'crystal_fog_intro',
      message: `🔮 Choose your crystal tool, ${profileName}! Clear the emotional fog to reveal hidden treasures!`,
      timing: 500,
      condition: () => sceneState?.phase === CAVE_PHASES.CRYSTAL_FOG_INTRO && !sceneState?.crystalFogIntroShown
    },
    {
      id: 'bridge_building_intro',
      message: `🌉 Build your bridge, ${profileName}! Use your collected rocks to create a safe pathway across!`,
      timing: 500,
      condition: () => sceneState?.phase === CAVE_PHASES.BRIDGE_BUILDING_INTRO && !sceneState?.bridgeBuildingIntroShown
    },
    {
      id: 'kurumedeva_wisdom',
      message: `Amazing, ${profileName}! You've learned Kurume Deva - divine help in building pathways to success!`,
      timing: 1000,
      condition: () => sceneState?.learnedWords?.kurumedeva?.learned && !sceneState?.kurumedevaWisdomShown && sceneState?.readyForWisdom && !sceneState?.isReloadingGameCoach
    }
  ];

  // Hint configurations
  const getHintConfigs = () => [
    {
      id: 'door1-hint',
      message: 'Try arranging the Sanskrit syllables in order!',
      explicitMessage: 'Drag Nir-vigh-nam syllables to spell Nirvighnam!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.DOOR1_ACTIVE && 
               !sceneState?.door1Completed &&
               !showMagicalCard && !isVisible && !showPopupBook;
      }
    },
    {
      id: 'crystal-selection-hint',
      message: 'Choose a crystal tool to clear the matching fog!',
      explicitMessage: 'Click a crystal, then drag it over the same-colored fog area!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.CRYSTAL_FOG_ACTIVE &&
               !sceneState?.selectedCrystal &&
               !showMagicalCard && !isVisible && !showPopupBook;
      }
    },
    {
      id: 'door2-hint',
      message: 'Arrange the Sanskrit syllables for Kurume Deva!',
      explicitMessage: 'Drag Ku-ru-me-de-va syllables to spell Kurume Deva!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.DOOR2_ACTIVE && 
               !sceneState?.door2Completed &&
               !showMagicalCard && !isVisible && !showPopupBook;
      }
    },
    {
      id: 'bridge-building-hint',
      message: 'Drag your collected rocks to build the bridge!',
      explicitMessage: 'Use rocks from your collection to fill the bridge gaps!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === CAVE_PHASES.BRIDGE_BUILDING_ACTIVE &&
               sceneState?.bridgeRocks?.length < 5 &&
               !showMagicalCard && !isVisible && !showPopupBook;
      }
    }
  ];

  // Watch for GameCoach visibility changes (PROVEN FROM SURYAKOTI)
  useEffect(() => {
    if (previousVisibilityRef.current && !isVisible && pendingAction) {
      console.log(`🎬 GameCoach closed, executing pending action: ${pendingAction}`);
     
      const actionTimer = setTimeout(() => {
        switch (pendingAction) {
          case 'start-door2':
            console.log('🚪 Starting Door 2 after Nirvighnam wisdom');
            sceneActions.updateState({
              phase: CAVE_PHASES.DOOR2_ACTIVE,
              gameCoachState: null,
              isReloadingGameCoach: false
            });
            break;
           
          case 'start-fireworks':
            console.log('🎆 Starting fireworks after final wisdom');
            showFinalCelebration();
            break;
        }
       
        setPendingAction(null);
      }, 1000);
     
      timeoutsRef.current.push(actionTimer);
    }
   
    previousVisibilityRef.current = isVisible;
  }, [isVisible, pendingAction]);

  // GameCoach triggering system (PROVEN FROM SURYAKOTI)
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
        (matchingMessage.id === 'nirvighnam_wisdom' && sceneState.nirvighnamWisdomShown) ||
        (matchingMessage.id === 'kurumedeva_wisdom' && sceneState.kurumedevaWisdomShown) ||
        (matchingMessage.id === 'cave_welcome' && sceneState.welcomeShown) ||
        (matchingMessage.id === 'crystal_fog_intro' && sceneState.crystalFogIntroShown) ||
        (matchingMessage.id === 'bridge_building_intro' && sceneState.bridgeBuildingIntroShown);
     
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
          case 'crystal_fog_intro':
            sceneActions.updateState({ crystalFogIntroShown: true });
            break;
          case 'bridge_building_intro':
            sceneActions.updateState({ bridgeBuildingIntroShown: true });
            break;
          case 'nirvighnam_wisdom':
            sceneActions.updateState({
              nirvighnamWisdomShown: true,
              readyForWisdom: false,
              gameCoachState: 'nirvighnam_wisdom'
            });
            setPendingAction('start-door2');
            break;
          case 'kurumedeva_wisdom':
            sceneActions.updateState({
              kurumedevaWisdomShown: true,
              readyForWisdom: false,
              gameCoachState: 'kurumedeva_wisdom'
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
    sceneState?.nirvighnamWisdomShown,
    sceneState?.kurumedevaWisdomShown,
    sceneState?.crystalFogIntroShown,
    sceneState?.bridgeBuildingIntroShown,
    sceneState?.readyForWisdom,
    sceneState?.symbolDiscoveryState,
    sceneState?.sidebarHighlightState,
    showMessage
  ]);

  // RELOAD LOGIC (PROVEN FROM SURYAKOTI)
  useEffect(() => {
    if (!isReload || !sceneState) return;
    
    console.log('🔄 NIRVIGHNAM RELOAD: Starting comprehensive reload sequence', {
      currentPopup: sceneState.currentPopup,
      showingCompletionScreen: sceneState.showingCompletionScreen,
      completed: sceneState.completed,
      phase: sceneState.phase
    });

    // Check for Play Again flag first
    const profileId = localStorage.getItem('activeProfileId');
    const playAgainKey = `play_again_${profileId}_${zoneId}_${sceneId}`;
    const playAgainRequested = localStorage.getItem(playAgainKey);
    
    const isFreshRestartAfterPlayAgain = (
      playAgainRequested === 'true' ||
      (sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE && 
       sceneState.completed === false && 
       sceneState.stars === 0 && 
       (sceneState.currentPopup === 'final_fireworks' || sceneState.showingCompletionScreen))
    );
    
    if (isFreshRestartAfterPlayAgain) {
      console.log('🔄 NIRVIGHNAM RELOAD: Detected fresh restart after Play Again - clearing completion state');
      
      if (playAgainRequested === 'true') {
        localStorage.removeItem(playAgainKey);
        console.log('✅ CLEARED: Nirvighnam Play Again storage flag');
      }
      
      sceneActions.updateState({ 
        isReloadingGameCoach: false,
        showingCompletionScreen: false,
        currentPopup: null,
        completed: false,
        phase: CAVE_PHASES.DOOR1_ACTIVE
      });
      return;
    }

    // IMMEDIATELY block GameCoach normal flow
    sceneActions.updateState({ isReloadingGameCoach: true });
    
    setTimeout(() => {
      // Handle popup states (same pattern as Suryakoti)
      if (sceneState.currentPopup) {
        console.log('🔄 NIRVIGHNAM: Resuming popup:', sceneState.currentPopup);
        
        switch(sceneState.currentPopup) {
          case 'nirvighnam_info':
            setPopupBookContent({
              title: "Nirvighnam - Without Obstacles",
              symbolImage: nirvighnamCard,
              description: `Nirvighnam means "without obstacles", ${profileName}! You cleared emotional fog like removing all barriers from your path!`
            });
            setCurrentSourceElement('crystal-fog-area');
            setShowPopupBook(true);
            break;
            
          case 'nirvighnam_card':
            setCardContent({
              title: `You've learned Nirvighnam, ${profileName}!`,
              image: nirvighnamCard,
              stars: 3
            });
            setShowMagicalCard(true);
            setTimeout(() => {
              sceneActions.updateState({ 
                isReloadingGameCoach: false,
                symbolDiscoveryState: null,
                sidebarHighlightState: null
              });
            }, 500);
            break;

          case 'kurumedeva_info':
            setPopupBookContent({
              title: "Kurume Deva - Divine Help",
              symbolImage: kurumedevaCard,
              description: `Kurume Deva means "divine help in action", ${profileName}! You built bridges like receiving divine guidance to overcome challenges!`
            });
            setCurrentSourceElement('bridge-building-area');
            setShowPopupBook(true);
            break;
            
          case 'kurumedeva_card':
            setCardContent({
              title: `You've learned Kurume Deva, ${profileName}!`,
              image: kurumedevaCard,
              stars: 3
            });
            setShowMagicalCard(true);
            setTimeout(() => {
              sceneActions.updateState({ 
                isReloadingGameCoach: false,
                symbolDiscoveryState: null,
                sidebarHighlightState: null
              });
            }, 500);
            break;

          case 'final_fireworks':
            const profileId = localStorage.getItem('activeProfileId');
            const playAgainKey = `play_again_${profileId}_cave-of-secrets_nirvighnam-kurumedeva`;
            const playAgainRequested = localStorage.getItem(playAgainKey);
            
            if (playAgainRequested === 'true') {
              console.log('🚫 NIRVIGHNAM FIREWORKS BLOCKED: Play Again was clicked');
              localStorage.removeItem(playAgainKey);
              sceneActions.updateState({
                currentPopup: null,
                showingCompletionScreen: false,
                completed: false,
                phase: CAVE_PHASES.DOOR1_ACTIVE,
                stars: 0
              });
              return;
            }
            
            console.log('🎆 NIRVIGHNAM: Resuming final fireworks');
            setShowSparkle('final-fireworks');
            sceneActions.updateState({
              gameCoachState: null,
              isReloadingGameCoach: false,
              phase: CAVE_PHASES.COMPLETE,
              stars: 8,
              completed: true,
              progress: {
                percentage: 100,
                starsEarned: 8,
                completed: true
              }
            });
            
            setTimeout(() => {
              setShowSparkle('final-fireworks');
            }, 500);
            return;
        }
        return;
      }

      // Handle completion screen reload
      if (sceneState.showingCompletionScreen) {
        const profileId = localStorage.getItem('activeProfileId');
        const playAgainKey = `play_again_${profileId}_cave-of-secrets_nirvighnam-kurumedeva`;
        const playAgainRequested = localStorage.getItem(playAgainKey);
        
        if (playAgainRequested === 'true') {
          console.log('🚫 NIRVIGHNAM COMPLETION BLOCKED: Play Again was clicked');
          localStorage.removeItem(playAgainKey);
          sceneActions.updateState({
            currentPopup: null,
            showingCompletionScreen: false,
            completed: false,
            phase: CAVE_PHASES.DOOR1_ACTIVE,
            stars: 0,
            isReloadingGameCoach: false
          });
          return;
        }
        
        console.log('🔄 NIRVIGHNAM: Resuming completion screen');
        setShowSceneCompletion(true);
        sceneActions.updateState({ isReloadingGameCoach: false });
        return;
      }

      // Default: clear flags
      console.log('🔄 NIRVIGHNAM: No special reload needed, clearing flags');
      setTimeout(() => {
        sceneActions.updateState({ isReloadingGameCoach: false });
      }, 1500);
      
    }, 500);
    
  }, [isReload]);

  // Door 1 handlers (ADAPTED FOR NIRVIGHNAM)
  const handleDoor1SyllablePlaced = (syllable) => {
    hideActiveHints();
    console.log(`Door 1 syllable placed: ${syllable}`);
    
    const expectedSyllable = sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0] || 'Nir';
    const isCorrect = syllable === expectedSyllable;
    
    if (isCorrect) {
      const newStep = (sceneState.door1CurrentStep || 0) + 1;
      const newSyllablesPlaced = [...(sceneState.door1SyllablesPlaced || []), syllable];
      
      console.log(`✅ Correct! Step ${newStep-1} -> ${newStep}`);
      
      sceneActions.updateState({
        door1SyllablesPlaced: newSyllablesPlaced,
        door1CurrentStep: newStep
      });
      
      if (newStep >= 3) {
        setTimeout(() => {
          handleDoor1Complete();
        }, 1000);
      }
    } else {
      console.log(`❌ Wrong! Expected "${expectedSyllable}", got "${syllable}"`);
      if (showMessage) {
        showMessage(`Try "${expectedSyllable}" next, ${profileName}!`, {
          duration: 2000,
          animation: 'shake',
          position: 'top-center'
        });
      }
    }
  };

  const handleDoor1Complete = () => {
    console.log('🚪 Door 1 completed - starting sparkle fade!');
    
    setShowSparkle('door1-completing');
    
    const doorElement = document.querySelector('.nirvighnam-door .door-container');
    if (doorElement) {
      doorElement.classList.add('completing');
    }
    
    sceneActions.updateState({
      door1Completed: true
    });
    
    setTimeout(() => {
      setShowSparkle(null);
      sceneActions.updateState({
        phase: CAVE_PHASES.CRYSTAL_FOG_INTRO
      });
    }, 3000);
  };

  // Door 2 handlers (ADAPTED FOR KURUME DEVA)
  const handleDoor2SyllablePlaced = (syllable) => {
    hideActiveHints();
    console.log(`Door 2 syllable placed: ${syllable}`);
    
    const expectedSyllable = sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0] || 'Ku';
    const isCorrect = syllable === expectedSyllable;
    
    if (isCorrect) {
      const newStep = (sceneState.door2CurrentStep || 0) + 1;
      const newSyllablesPlaced = [...(sceneState.door2SyllablesPlaced || []), syllable];
      
      sceneActions.updateState({
        door2SyllablesPlaced: newSyllablesPlaced,
        door2CurrentStep: newStep
      });
      
      if (newStep >= 5) {
        setTimeout(() => {
          handleDoor2Complete();
        }, 1000);
      }
    } else {
      if (showMessage) {
        showMessage(`Try "${expectedSyllable}" next, ${profileName}!`, {
          duration: 2000,
          animation: 'shake',
          position: 'top-center'
        });
      }
    }
  };

  const handleDoor2Complete = () => {
    console.log('🚪 Door 2 completed - starting sparkle fade!');
    
    setShowSparkle('door2-completing');
    
    const doorElement = document.querySelector('.kurumedeva-door .door-container');
    if (doorElement) {
      doorElement.classList.add('completing');
    }
    
    sceneActions.updateState({
      door2Completed: true
    });
    
    setTimeout(() => {
      setShowSparkle(null);
      sceneActions.updateState({
        phase: CAVE_PHASES.BRIDGE_BUILDING_INTRO,
        bridgeBuildingStarted: true
      });
    }, 3000);
  };

  // Crystal Fog Game handlers
  const handleCrystalFogStart = () => {
    console.log('🔮 Starting crystal fog clearing game!');
    
    sceneActions.updateState({
      crystalFogStarted: true,
      phase: CAVE_PHASES.CRYSTAL_FOG_ACTIVE
    });
  };

  const handleCrystalSelect = (emotionId) => {
    console.log(`🔮 Crystal selected: ${emotionId}`);
    
    sceneActions.updateState({
      selectedCrystal: emotionId
    });
  };

  const handleFogClear = (emotionId) => {
    console.log(`🌫️ Fog cleared: ${emotionId}`);
    
    const newClearedFogs = [...(sceneState.clearedFogs || []), emotionId];
    const newCollectedRocks = [...(sceneState.collectedRocks || []), emotionId];
    const newProgress = (newClearedFogs.length / 5) * 100;
    
    setShowSparkle(`fog-${emotionId}-cleared`);
    setTimeout(() => setShowSparkle(null), 1500);
    
    sceneActions.updateState({
      clearedFogs: newClearedFogs,
      collectedRocks: newCollectedRocks,
      emotionalProgress: newProgress,
      selectedCrystal: null
    });
    
    if (newClearedFogs.length >= 5) {
      console.log('All fog cleared!');
      safeSetTimeout(() => {
        handleCrystalFogComplete();
      }, 2000);
    }
  };

  const handleCrystalFogComplete = () => {
    console.log('🔮 Crystal fog clearing completed!');
    
    sceneActions.updateState({
      crystalFogCompleted: true,
      phase: CAVE_PHASES.CRYSTAL_FOG_COMPLETE,
      progress: {
        ...sceneState.progress,
        percentage: 50,
        starsEarned: 3
      }
    });

    safeSetTimeout(() => {
      completeNirvighnamLearning();
    }, 2000);
  };

  const completeNirvighnamLearning = () => {
    console.log('📜 Starting Nirvighnam learning');
    
    sceneActions.updateState({
      symbolDiscoveryState: 'nirvighnam_discovering',
      currentPopup: 'nirvighnam_info',
      phase: CAVE_PHASES.NIRVIGHNAM_LEARNING
    });

    setPopupBookContent({
      title: "Nirvighnam - Without Obstacles",
      symbolImage: nirvighnamCard,
      description: `Nirvighnam means "without obstacles", ${profileName}! You cleared emotional fog like removing all barriers from your path!`
    });

    setCurrentSourceElement('crystal-fog-area');
    setShowPopupBook(true);
  };

const handleBridgeRockPlace = (dragData) => {
  const { id, data } = dragData;
  const rockId = data.id;
  
  console.log(`🌉 Bridge rock placed naturally:`, {
    rockId: rockId,
    currentBridgeRocks: sceneState.bridgeRocks
  });
  
  hideActiveHints();
  hideCoach();

  // ✅ CHANGE: Store as simple array, not positional array
  const newBridgeRocks = [...(sceneState.bridgeRocks || []), rockId];
  const newStability = (newBridgeRocks.length / 5) * 100;
  
  setShowSparkle(`bridge-rock-${rockId}-placed`);
  setTimeout(() => setShowSparkle(null), 1500);
  
  sceneActions.updateState({
    bridgeRocks: newBridgeRocks,  // ✅ Simple array instead of positional
    bridgeStability: newStability,
    ganeshaCanCross: newBridgeRocks.length >= 5
  });
  
  if (newBridgeRocks.length >= 5) {
    console.log('Bridge completed naturally!');
    safeSetTimeout(() => {
      completeBridgeBuilding();
    }, 2000);
  }
};

  const completeBridgeBuilding = () => {
    console.log('🌉 Bridge building completed!');
    
    sceneActions.updateState({
      bridgeCompleted: true,
      phase: CAVE_PHASES.BRIDGE_BUILDING_COMPLETE
    });

    safeSetTimeout(() => {
      startKurumedevaLearning();
    }, 2000);
  };

  const startKurumedevaLearning = () => {
    console.log('📜 Starting Kurume Deva learning');
    
    sceneActions.updateState({
      symbolDiscoveryState: 'kurumedeva_discovering',
      currentPopup: 'kurumedeva_info',
      phase: CAVE_PHASES.KURUME_DEVA_LEARNING
    });

    setPopupBookContent({
      title: "Kurume Deva - Divine Help",
      symbolImage: kurumedevaCard,
      description: `Kurume Deva means "divine help in action", ${profileName}! You built bridges like receiving divine guidance to overcome challenges!`
    });

    setCurrentSourceElement('bridge-building-area');
    setShowPopupBook(true);
  };

  // Symbol celebration system (ADAPTED FROM SURYAKOTI)
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
      case 'nirvighnam':
        title = `You've learned Nirvighnam, ${profileName}!`;
        image = nirvighnamCard;
        stars = 3;
        
        sceneActions.updateState({
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          currentPopup: 'nirvighnam_card'
        });
        
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;

      case 'kurumedeva':
        title = `You've learned Kurume Deva, ${profileName}!`;
        image = kurumedevaCard;
        stars = 3;
        
        sceneActions.updateState({
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          currentPopup: 'kurumedeva_card'
        });
        
        setCardContent({ title, image, stars });
        setShowMagicalCard(true);
        break;
    }
  };

  // Close card handler (PROVEN FROM SURYAKOTI)
  const handleCloseCard = () => {
    setShowMagicalCard(false);
    sceneActions.updateState({ currentPopup: null });

    if (cardContent.title?.includes("Nirvighnam")) {
      console.log('📜 Nirvighnam card closed - triggering GameCoach wisdom');
      
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'nirvighnam_wisdom'
        });
      }, 500);

    } else if (cardContent.title?.includes("Kurume Deva")) {
      console.log('📜 Kurume Deva card closed - triggering final GameCoach wisdom');
      
      setTimeout(() => {
        sceneActions.updateState({
          readyForWisdom: true,
          gameCoachState: 'kurumedeva_wisdom'
        });
      }, 500);
    }
  };

  // Symbol info close handler (PROVEN FROM SURYAKOTI)
  const handleSymbolInfoClose = () => {
    console.log('🔍 Closing Sanskrit learning popup');
    setShowPopupBook(false);
    setPopupBookContent({});
    setCurrentSourceElement(null);
    sceneActions.updateState({ currentPopup: null });

    if (popupBookContent.title?.includes("Nirvighnam")) {
      console.log('📜 Nirvighnam info closed - highlighting sidebar first');
      
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.learnedWords,
          nirvighnam: { learned: true, scene: 3 }
        },
        learnedWords: {
          ...sceneState.learnedWords,
          nirvighnam: { learned: true, scene: 3 }
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'nirvighnam_highlighting'
      });

      safeSetTimeout(() => {
        console.log('🎉 Showing nirvighnam celebration after sidebar highlight');
        showSanskritCelebration('nirvighnam');
      }, 1000);

    } else if (popupBookContent.title?.includes("Kurume Deva")) {
      console.log('📜 Kurume Deva info closed - highlighting sidebar first');
      
      sceneActions.updateState({
        discoveredSymbols: {
          ...sceneState.learnedWords,
          kurumedeva: { learned: true, scene: 3 }
        },
        learnedWords: {
          ...sceneState.learnedWords,
          kurumedeva: { learned: true, scene: 3 }
        },
        symbolDiscoveryState: null,
        sidebarHighlightState: 'kurumedeva_highlighting'
      });

      safeSetTimeout(() => {
        console.log('🎉 Showing kurumedeva celebration after sidebar highlight');
        showSanskritCelebration('kurumedeva');
      }, 1000);
    }
  };

  const showFinalCelebration = () => {
    console.log('🎊 Starting final cave celebration');
    
    setShowMagicalCard(false);
    setShowPopupBook(false);
    setShowSparkle(null);
    setCardContent({});
    setPopupBookContent({});

    // Hide Sanskrit Sidebar during completion
    const sidebarElement = document.querySelector('.sanskrit-sidebar');
    if (sidebarElement) {
      sidebarElement.style.opacity = '0';
      sidebarElement.style.pointerEvents = 'none';
      sidebarElement.style.transition = 'opacity 0.5s ease';
    }

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
    return <div className="loading">Loading Obstacle Remover Chamber...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager
        messages={[]}
        sceneState={sceneState}
        sceneActions={sceneActions}
      >
        <div className="pond-scene-container" data-phase={sceneState.phase}>

          {/* Cave Background */}
          <div className="pond-background" style={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%',
            backgroundImage: `url(${caveBackgroundDark})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
            
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

            {/* Clear Storage Button */}
            <button 
              className="clear-storage-button"
              onClick={clearLocalStorage}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#ff4444',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                zIndex: 100,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
              title="Clear all saved progress"
            >
              🗑️ Clear Storage
            </button>

            {/* 🧪 SIMPLE PHASE TESTING */}
<div style={{
  position: 'absolute',
  top: '60px',
  right: '15px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  zIndex: 100
}}>
  
  <button onClick={() => {
    sceneActions.updateState({
      phase: CAVE_PHASES.CRYSTAL_FOG_INTRO,
      door1Completed: true,
      door1CurrentStep: 3,
      door1SyllablesPlaced: ['Nir', 'vigh', 'nam'],
      crystalFogStarted: false,
      selectedCrystal: null,
      clearedFogs: [],
      collectedRocks: []
    });
  }} style={{
    background: '#4CAF50', color: 'white', border: 'none', padding: '8px 12px',
    borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold'
  }}>
    ✅ Door 1 Done
  </button>

  <button onClick={() => {
    sceneActions.updateState({
      phase: CAVE_PHASES.DOOR2_ACTIVE,
      door1Completed: true,
      crystalFogCompleted: true,
      clearedFogs: ['anger', 'confusion', 'fear', 'lonely', 'sad'],
      collectedRocks: ['anger', 'confusion', 'fear', 'lonely', 'sad'],
      emotionalProgress: 100,
      door2Completed: false,
      door2CurrentStep: 0,
      door2SyllablesPlaced: []
    });
  }} style={{
    background: '#2196F3', color: 'white', border: 'none', padding: '8px 12px',
    borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold'
  }}>
    ✅ Game 1 Done
  </button>

  <button onClick={() => {
    sceneActions.updateState({
      phase: CAVE_PHASES.BRIDGE_BUILDING_INTRO,
      door1Completed: true,
      door2Completed: true,
      door2CurrentStep: 5,
      door2SyllablesPlaced: ['Ku', 'ru', 'me', 'de', 'va'],
      crystalFogCompleted: true,
      clearedFogs: ['anger', 'confusion', 'fear', 'lonely', 'sad'],
      collectedRocks: ['anger', 'confusion', 'fear', 'lonely', 'sad'],
      bridgeBuildingStarted: false,
      bridgeRocks: [],
      bridgeStability: 0
    });
  }} style={{
    background: '#FF9800', color: 'white', border: 'none', padding: '8px 12px',
    borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold'
  }}>
    ✅ Door 2 Done
  </button>

  <button onClick={() => {
    sceneActions.updateState({
      phase: CAVE_PHASES.COMPLETE,
      door1Completed: true,
      door2Completed: true,
      crystalFogCompleted: true,
      bridgeCompleted: true,
      clearedFogs: ['anger', 'confusion', 'fear', 'lonely', 'sad'],
      collectedRocks: [],
      bridgeRocks: ['anger', 'confusion', 'fear', 'lonely', 'sad'],
      ganeshaCanCross: true,
      learnedWords: {
        ...sceneState.learnedWords,
        nirvighnam: { learned: true, scene: 3 },
        kurumedeva: { learned: true, scene: 3 }
      },
      stars: 8,
      completed: true,
      progress: {
        percentage: 100,
        starsEarned: 8,
        completed: true
      }
    });
  }} style={{
    background: '#E91E63', color: 'white', border: 'none', padding: '8px 12px',
    borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold'
  }}>
    🎉 Complete Scene
  </button>

</div>

            {/* Door 1 Component */}
            {(sceneState.phase === CAVE_PHASES.DOOR1_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR1_COMPLETE) && (
              <div className="door1-area" id="door1-area">
                <DoorComponent
                  syllables={['Nir', 'vigh', 'nam']}
                  completedWord="Nirvighnam"
                  onDoorComplete={handleDoor1Complete}
                  onSyllablePlaced={handleDoor1SyllablePlaced}
                  sceneTheme="cave-of-secrets"
                  doorImage={doorImage}
                  className="nirvighnam-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door1CurrentStep || 0}
                  expectedSyllable={sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0]}
                  targetWordTitle="NIRVIGHNAM"
                  primaryColor="#FFD700"
                  secondaryColor="#FF8C42"
                  errorColor="#FF4444"
                  isCompleted={sceneState.door1Completed}
                  placedSyllables={sceneState.door1SyllablesPlaced || []}
                  isResuming={isReload}
                />
              </div>
            )}

            {/* Door 1 Completion Sparkles */}
            {showSparkle === 'door1-completing' && (
              <div style={{
                position: 'absolute',
                top: '5%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '400px',
                height: '500px',
                zIndex: 21,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="magic"
                  count={25}
                  color="#ffd700"
                  size={12}
                  duration={3000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Crystal Fog Clearing Game */}
            {(sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_INTRO || 
              sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_ACTIVE || 
              sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_COMPLETE ||
              sceneState.phase === CAVE_PHASES.NIRVIGHNAM_LEARNING) && (
              <div className="crystal-fog-area" id="crystal-fog-area">
                
                {/* Crystal Tools Selection */}
                <div className="crystal-tools-area">
                  {EMOTION_PAIRS.map((pair) => {
                    const isSelected = sceneState.selectedCrystal === pair.id;
                    const isUsed = sceneState.clearedFogs?.includes(pair.id);
                    
                    if (isUsed) return null;
                    
                    return (
                      <div 
                        key={pair.id} 
                        className={`crystal-tool crystal-${pair.id} ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleCrystalSelect(pair.id)}
                      >
                        <img 
                          src={pair.crystal}
                          alt={`${pair.emotion} crystal`}
                          style={{ 
                            width: '60px', 
                            height: '60px',
                            cursor: 'pointer',
                            filter: isSelected ? 'brightness(1.3) drop-shadow(0 0 10px #FFD700)' : 'brightness(1)'
                          }}
                        />
                        <div className="crystal-label">
                          {pair.emotion.charAt(0).toUpperCase() + pair.emotion.slice(1)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Canvas-based Fog Erasing Areas */}
                <div className="fog-erasing-areas">
                  {EMOTION_PAIRS.map((pair) => {
                    const isCleared = sceneState.clearedFogs?.includes(pair.id);
                    const canErase = sceneState.selectedCrystal === pair.id;
                    
                    return (
                      <div key={pair.id} className={`fog-erasing-container fog-${pair.id}`}>
                        {!isCleared && (
                          <FogErasingCanvas
                            emotionId={pair.id}
                            fogImage={pair.fog}
                            rockImage={pair.rock}
                            onComplete={handleFogClear}
                            isActive={canErase}
                          />
                        )}
                        
                        {/* Completed State - Show rock in collection */}
                        {isCleared && (
                          <div className="completed-fog-area">
                            <div className="revealed-rock-display">
                              <img 
                                src={pair.rock}
                                alt={`${pair.emotion} rock revealed`}
                                style={{ 
                                  width: '80px', 
                                  height: 'auto',
                                  //border: '3px solid #90EE90',
                                  borderRadius: '10px',
                                  animation: 'rockReveal 2s ease-out'
                                }}
                              />
                              <div className="rock-blessing">
                                ✨ {pair.emotion} overcome! ✨
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Progress Display 
                <div className="crystal-fog-progress">
                  <div className="progress-text">
                    Sacred Rocks Revealed: {sceneState.clearedFogs?.length || 0} / 5
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill"
                      style={{
                        width: `${((sceneState.clearedFogs?.length || 0) / 5) * 100}%`,
                        height: '8px',
                        background: 'linear-gradient(90deg, #ff6b6b, #feca57)',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                </div>*/}

              </div>
            )}

            {/* Door 2 Component */}
            {(sceneState.phase === CAVE_PHASES.DOOR2_ACTIVE || sceneState.phase === CAVE_PHASES.DOOR2_COMPLETE) && (
              <div className="door2-area" id="door2-area">
                <DoorComponent
                  syllables={['Ku', 'ru', 'me', 'de', 'va']}
                  completedWord="Kurume Deva"
                  onDoorComplete={handleDoor2Complete}
                  onSyllablePlaced={handleDoor2SyllablePlaced}
                  sceneTheme="cave-of-secrets"
                  doorImage={doorImage}
                  className="kurumedeva-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door2CurrentStep || 0}
                  expectedSyllable={sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0]}
                  targetWordTitle="KURUME DEVA"
                  primaryColor="#FFD700"
                  secondaryColor="#FF8C42"
                  errorColor="#FF4444"
                  isCompleted={sceneState.door2Completed}
                  placedSyllables={sceneState.door2SyllablesPlaced || []}
                  isResuming={isReload}
                />
              </div>
            )}

            {/* Door 2 Completion Sparkles */}
            {showSparkle === 'door2-completing' && (
              <div style={{
                position: 'absolute',
                top: '5%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '400px',
                height: '500px',
                zIndex: 21,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="magic"
                  count={25}
                  color="#ff8c42"
                  size={12}
                  duration={2500}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Bridge Building Game */}
            {(sceneState.phase === CAVE_PHASES.BRIDGE_BUILDING_INTRO || 
              sceneState.phase === CAVE_PHASES.BRIDGE_BUILDING_ACTIVE || 
              sceneState.phase === CAVE_PHASES.BRIDGE_BUILDING_COMPLETE ||
              sceneState.phase === CAVE_PHASES.KURUME_DEVA_LEARNING ||
              sceneState.phase === CAVE_PHASES.SCENE_CELEBRATION ||
              sceneState.phase === CAVE_PHASES.COMPLETE) && (
              
              <div className="bridge-building-area" id="bridge-building-area">
                
                {/* Simple Gap Visual */}
                <div className="simple-gap">
                  <div className="gap-line"></div>
                </div>

                {/* Clean Rocks Inventory */}
                <div className="bridge-rocks-inventory">
                  <div className="inventory-rocks">
                    {sceneState.collectedRocks?.map((rockId) => {
                      const isUsed = sceneState.bridgeRocks?.includes(rockId);
                      const pair = EMOTION_PAIRS.find(p => p.id === rockId);
                      
                      if (isUsed) return null;
                      
                      return (
                        <div key={rockId} className={`bridge-rock-inventory bridge-rock-${rockId}`}>
                          <DraggableItem
                            id={`bridge-rock-${rockId}`}
                            data={{ type: 'rock', id: rockId, emotion: pair.emotion }}
                            onDragStart={(id, data) => console.log('Dragging bridge rock:', id, data)}
                            onDragEnd={(id) => console.log('Bridge rock drag ended:', id)}
                          >
                            <img 
                              src={pair.rock}
                              alt={`Bridge rock ${pair.emotion}`}
                              style={{ 
                                width: '80px', 
                                height: '80px',
                                cursor: 'grab',
                                borderRadius: '12px'
                              }}
                            />
                          </DraggableItem>
                        </div>
                      );
                    })}
                  </div>
                </div>

{/* Golden Bridge Drop Target - Like Basket */}
<div className="bridge-golden-container" style={{
  position: 'absolute',
  top: '65%',           // Position over the water
  left: '55%',          // Center horizontally
  transform: 'translate(-50%, -50%)',
width: '420px',       // ✅ BIGGER width
  height: '130px',      // ✅ BIGGER height
  zIndex: 15
}}>
  <DropZone
    id="bridge-area"
    acceptTypes={['rock']}
    onDrop={handleBridgeRockPlace}
    style={{
      width: '100%',
      height: '100%',
      border: '4px solid #FFD700',           // ✅ GOLDEN BORDER
      borderRadius: '25px',
      backgroundColor: 'rgba(255, 215, 0, 0.15)',  // ✅ GOLDEN TINT
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.4), inset 0 2px 4px rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(3px)'
    }}
  >
{/* Empty drop zone - no text inside */}
<div style={{
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(255, 215, 0, 0.3)',
  fontSize: '16px',
  fontWeight: 'bold'
}}>
  Drop Rocks Here
</div>
  </DropZone>
</div>

{/* Separate Bridge Counter - Like Modak Counter */}
{(sceneState.phase === CAVE_PHASES.BRIDGE_BUILDING_INTRO || 
  sceneState.phase === CAVE_PHASES.BRIDGE_BUILDING_ACTIVE || 
  sceneState.phase === CAVE_PHASES.BRIDGE_BUILDING_COMPLETE ||
  sceneState.phase === CAVE_PHASES.KURUME_DEVA_LEARNING ||
  sceneState.phase === CAVE_PHASES.SCENE_CELEBRATION ||
  sceneState.phase === CAVE_PHASES.COMPLETE) && (
  
  <div className="bridge-counter" style={{
    position: 'absolute',
    top: '15px',
    left: '15px',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '25px',
    padding: '8px 16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 25,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '180px',
    height: '40px'
  }}>
    <div className="counter-icon" style={{ width: '24px', height: '24px' }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(45deg, #8B4513, #DAA520)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px'
      }}>
        🪨
      </div>
    </div>
    
    <div className="counter-progress" style={{
      flex: 1,
      height: '6px',
      background: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '3px',
      overflow: 'hidden'
    }}>
      <div 
        className="counter-progress-fill"
        style={{
          width: `${((sceneState.bridgeRocks?.length || 0) / 5) * 100}%`,
          height: '100%',
          background: 'linear-gradient(to right, #8B4513, #DAA520)',
          borderRadius: '3px',
          transition: 'width 0.5s ease'
        }}
      />
    </div>
    
    <div className="counter-display" style={{
      fontSize: '14px',
      fontWeight: '600',
      color: '#333'
    }}>
      {sceneState.bridgeRocks?.length || 0}/5
    </div>
  </div>
)}

{/* Crystal Fog Counter - Game 1 */}
{(sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_INTRO || 
  sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_ACTIVE || 
  sceneState.phase === CAVE_PHASES.CRYSTAL_FOG_COMPLETE ||
  sceneState.phase === CAVE_PHASES.NIRVIGHNAM_LEARNING) && (
  
  <div className="crystal-fog-counter" style={{
    position: 'absolute',
    top: '15px',
    left: '15px',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '25px',
    padding: '8px 16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 25,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '180px',
    height: '40px'
  }}>
    <div className="counter-icon" style={{ width: '24px', height: '24px' }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(45deg, #9C27B0, #E1BEE7)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px'
      }}>
        🔮
      </div>
    </div>
    
    <div className="counter-progress" style={{
      flex: 1,
      height: '6px',
      background: 'rgba(0, 0, 0, 0.1)',
      borderRadius: '3px',
      overflow: 'hidden'
    }}>
      <div 
        className="counter-progress-fill"
        style={{
          width: `${((sceneState.clearedFogs?.length || 0) / 5) * 100}%`,
          height: '100%',
          background: 'linear-gradient(to right, #9C27B0, #E1BEE7)',
          borderRadius: '3px',
          transition: 'width 0.5s ease'
        }}
      />
    </div>
    
    <div className="counter-display" style={{
      fontSize: '14px',
      fontWeight: '600',
      color: '#333'
    }}>
      {sceneState.clearedFogs?.length || 0}/5
    </div>
  </div>
)}

{/* Placed Bridge Rocks - Clustered in Golden Container */}
{sceneState.bridgeRocks && sceneState.bridgeRocks.map((rockId, displayIndex) => {
  const pair = EMOTION_PAIRS.find(p => p.id === rockId);
  if (!pair) return null;
  
  const position = getBridgeRockPosition(displayIndex);
  
  return (
    <div 
      key={`bridge-rock-placed-${rockId}-${displayIndex}`}
      className={`bridge-rock-placed bridge-rock-${displayIndex + 1}`}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: '90px',                    // ✅ Slightly smaller for better clustering
        height: 'auto',
        zIndex: 20 + displayIndex,        // ✅ Above golden container
        transform: 'translate(-50%, -50%)',
        transition: 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)', // ✅ Smooth placement
filter: 'brightness(1.1)'        }}
    >
      <img 
        src={pair.rock}
        alt={`Bridge ${pair.emotion} rock`}
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '12px',
          //border: '2px solid rgba(255, 215, 0, 0.6)'  // ✅ Golden highlight for placed rocks
        }}
      />
    </div>
  );
})}
                {/* Simple Success State 
                {sceneState.ganeshaCanCross && (
                  <div className="bridge-success">
                    <div className="success-glow">🎉 Bridge Complete! 🎉</div>
                  </div>
                )}*/}

              </div>
            )}

            {/* Sanskrit Sidebar */}
            {!sceneState.showingCompletionScreen && (
              <SanskritSidebar
                learnedWords={sceneState.learnedWords || {}}
                currentScene={3}
                unlockedScenes={[1, 2, 3]}
                mode="meanings"
                onWordClick={(wordId, wordData) => {
                  console.log(`Sanskrit word clicked: ${wordId}`, wordData);
                }}
                highlightState={sceneState.sidebarHighlightState}
              />
            )}

<SymbolSceneIntegration
  show={showPopupBook}
  symbolImage={popupBookContent.symbolImage}
  title={popupBookContent.title}
  description={popupBookContent.description}
  sourceElement={currentSourceElement}
  onClose={handleSymbolInfoClose}
/>



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
            {showMagicalCard && (cardContent.title?.includes("Nirvighnam") || cardContent.title?.includes("Kurume Deva")) && (
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
              
              @keyframes rockReveal {
                0% {
                  opacity: 0;
                  transform: scale(0.5) rotate(-45deg);
                }
                100% {
                  opacity: 1;
                  transform: scale(1) rotate(0deg);
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
                  console.log('🎯 Nirvighnam fireworks complete');
                  setShowSparkle(null);
                  
                  const profileId = localStorage.getItem('activeProfileId');
                  if (profileId) {
                    GameStateManager.saveGameState('cave-of-secrets', 'nirvighnam-kurumedeva', {
                      completed: true,
                      stars: 8,
                      sanskritWords: { nirvighnam: true, kurumedeva: true },
                      phase: 'complete',
                      timestamp: Date.now()
                    });
                    
                    localStorage.removeItem(`temp_session_${profileId}_cave-of-secrets_nirvighnam-kurumedeva`);
                    SimpleSceneManager.clearCurrentScene();
                    console.log('✅ NIRVIGHNAM: Completion saved and temp session cleared');
                  }
                  
                  setShowSceneCompletion(true);
                }}
              />
            )}

            {/* Scene Completion */}
            <SceneCompletionCelebration
              show={showSceneCompletion}
              sceneName="Obstacle Remover Chamber - Scene 3"
              sceneNumber={3}
              totalScenes={4}
              starsEarned={sceneState.progress?.starsEarned || 8}
              totalStars={8}
              discoveredSymbols={['nirvighnam', 'kurumedeva'].filter(word =>
                sceneState.learnedWords?.[word]?.learned
              )}
              symbolImages={{
                nirvighnam: nirvighnamCard,
                kurumedeva: kurumedevaCard
              }}
              nextSceneName="Divine Tasks Chamber"
              sceneId="nirvighnam-kurumedeva"
              completionData={{
                stars: 8,
                                  symbols: {},  // ← ADD: Empty symbols for Cave
                sanskritWords: { nirvighnam: true, kurumedeva: true },
  learnedWords: sceneState.learnedWords || {},
  chants: { nirvighnam: true, kurumedeva: true },
                completed: true,
                totalStars: 8
              }}
              onComplete={onComplete}

       // ADD THIS TO SceneCompletionCelebration:
onReplay={() => {
  console.log('🔄 Nirvighnam Scene: Play Again requested');
  
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    // Clear ALL storage
    localStorage.removeItem(`temp_session_${profileId}_cave-of-secrets_nirvighnam-kurumedeva`);
    localStorage.removeItem(`replay_session_${profileId}_cave-of-secrets_nirvighnam-kurumedeva`);
    localStorage.removeItem(`play_again_${profileId}_cave-of-secrets_nirvighnam-kurumedeva`);
    
    SimpleSceneManager.setCurrentScene('cave-of-secrets', 'nirvighnam-kurumedeva', false, false);
    console.log('🗑️ Nirvighnam scene storage cleared');
  }
  
  // Force clean reload
  setTimeout(() => {
    window.location.reload();
  }, 100);
}}

             // ADD THIS TO SceneCompletionCelebration:
onContinue={() => {
  console.log('🔧 CONTINUE: Nirvighnam scene to next scene');
  
  // 1. Clear GameCoach
  if (clearManualCloseTracking) clearManualCloseTracking();
  if (hideCoach) hideCoach();
  
  setTimeout(() => {
    if (clearManualCloseTracking) clearManualCloseTracking();
  }, 500);
  
  // 2. Save completion data - CHANT FORMAT
  const profileId = localStorage.getItem('activeProfileId');
  if (profileId) {
    ProgressManager.updateSceneCompletion(profileId, 'cave-of-secrets', 'nirvighnam-kurumedeva', {
      completed: true,
      stars: 8,
      symbols: {},  // ← Cave scenes don't learn symbols
      sanskritWords: { nirvighnam: true, kurumedeva: true },
      learnedWords: sceneState.learnedWords || {},
      chants: { nirvighnam: true, kurumedeva: true }
    });
    
    GameStateManager.saveGameState('cave-of-secrets', 'nirvighnam-kurumedeva', {
      completed: true,
      stars: 8,
      sanskritWords: { nirvighnam: true, kurumedeva: true },
      learnedWords: sceneState.learnedWords || {}
    });
    
    console.log('✅ CONTINUE: Nirvighnam completion data saved');
  }

  // 3. Set next scene for resume tracking (assuming this is the last scene)
  setTimeout(() => {
    SimpleSceneManager.setCurrentScene('cave-of-secrets', 'complete', false, false);
    console.log('✅ CONTINUE: Cave of Secrets zone completed');
    
    onNavigate?.('zone-complete');
  }, 100);
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

export default NirvighnamScene;