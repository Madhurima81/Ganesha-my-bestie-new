import React, { useState, useEffect, useRef } from 'react';
import OpeningModal from '../../shared/components/OpeningModal.jsx';
import './FestivalRangoliGame.css';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../lib/config/content/openingModals';

import SceneCompletionCelebration from "../../../lib/components/celebration/SceneCompletionCelebration";
import rangoliArtistBadge from './assets/images/rangoli-badge.png';
import ganeshaCompletion from './assets/images/ganesha-artist.png';
import learnIcon from '../assets/images/icons/learn-icon.png';
import drawIcon from '../assets/images/icons/draw-icon.png';
import designIcon from '../assets/images/icons/design-icon.png';
import { getCompletionModal } from "../../../lib/config/content";
import ganeshaArtist from './assets/images/ganesha-artist.png';
// In FestivalPianoGame.jsx (or any game inside Game1-piano folder)
import GamePauseMenu from '../components/GamePauseMenu';
import ZoneBadgeButton from '../../../lib/components/navigation/ZoneBadgeButton';
import useAudioPreference from '../../../lib/hooks/useAudioPreference';
import useVoiceGuidance from '../../../lib/hooks/useVoiceGuidance';
import SceneManager from '../../../lib/components/scenes/SceneManager';
import GameStateManager from '../../../lib/services/GameStateManager';
import ProgressManager from '../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../lib/services/SimpleSceneManager';
import useSceneReset from '../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../lib/config/SceneResetConfigs';

// 🎨 DESIGN COMPLETION OVERLAY COMPONENT
const DesignCompletionOverlay = ({
  show,
  designName,
  starsEarned,
  onPlayAgain,
  onCreateAnother,
  onFinish
}) => {
  if (!show) return null;

  return (
    <div className="mission-completion-overlay">


      <div className="completion-card">
        <div
          className="completion-ganesha"
          style={{ backgroundImage: `url(${ganeshaCompletion})` }}
        />

        <div className="completion-message">
          <h1 className="completion-title">Look at your rangoli!</h1>
          <p className="completion-subtitle">{designName}</p>

          <p className="completion-blessing">
            You made something beautiful.
          </p>
        </div>

        <div className="completion-buttons">
          {onFinish && (
            <button className="completion-btn rangoliFinishBtn" onClick={onFinish}>
              <span className="btn-icon">✓</span>
              <span className="btn-text">Done</span>
            </button>
          )}

          <button className="completion-btn play-again" onClick={onPlayAgain}>
            <span className="btn-icon">🔄</span>
            <span className="btn-text">Start Over</span>
          </button>

          <button className="completion-btn create-another" onClick={onCreateAnother}>
            <span className="btn-icon">🎨</span>
            <span className="btn-text">Make Another</span>
          </button>
        </div>
      </div>
    </div>
  );
};



// Game phases for progression
const PHASES = {
  INTRODUCTION: 'introduction',
  SELECTION: 'selection',
  COLORING: 'coloring',
  CELEBRATION: 'celebration',
  COMPLETE: 'complete'
};

// Rangoli designs configuration
const RANGOLI_DESIGNS = [
  {
    id: 'lotus',
    name: 'Lotus',
    culturalNote: 'The lotus brings prosperity and peace to your home!',
    difficulty: 'Easy',
    sections: 16,
    description: 'Beautiful blooming lotus pattern'
  },
  {
    id: 'peacock',
    name: 'Dancing Peacock',
    culturalNote: 'The peacock dances to welcome good fortune!',
    difficulty: 'Medium',
    sections: 20,
    description: 'Graceful peacock with flowing feathers'
  },
  {
    id: 'mandala',
    name: 'Festival Mandala',
    culturalNote: 'Sacred circles connect us to the universe!',
    difficulty: 'Advanced',
    sections: 24,
    description: 'Intricate geometric mandala design'
  }
];

// Festival color palette - vibrant rangoli colors
const COLOR_PALETTE = [
  '#FF6B6B', '#FFD93D', '#FF9A3C', '#9D65C9',
  '#6BCB77', '#4D96FF', '#2BCDC1', '#FFB6C1'
];

const FestivalRangoliContent = ({ sceneState, sceneActions, isReload, onComplete, onNavigate, zoneId, sceneId }) => {
  // Game state
  const { isAudioOn, toggleAudio } = useAudioPreference();
  // ── T08/T09: visibility + idle timer infrastructure ──────────────────────────
  const { startIdleTimer, stopIdleTimer, setCurrentPhase } = useVoiceGuidance(
    zoneId, sceneId, { enableMusic: false, idleTimeout: 20 }
  );
  useEffect(() => { startIdleTimer(); return () => stopIdleTimer(); }, [startIdleTimer, stopIdleTimer]);

  const [gameState, setGameState] = useState({
    phase: PHASES.INTRODUCTION,
    selectedDesign: null,
    coloredSections: 0,
    totalSections: 0,
    celebrationStarted: false,
    gameStartTime: Date.now(),
    stars: 0,
    completed: false,
    showDoneButton: false,
    showDesignComplete: false,
    completedDesignData: null
  });
  useEffect(() => { setCurrentPhase(gameState.phase); }, [gameState.phase, setCurrentPhase]);

  // Saved progress for each design
  const storageKey = `gmb-rangoli-progress-${typeof localStorage !== 'undefined' ? (localStorage.getItem('activeProfileId') || 'guest') : 'guest'}`;
  const [savedDesigns, setSavedDesigns] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); }
    catch { return {}; }
  });
  const [undoStack, setUndoStack] = useState([]);
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(savedDesigns)); } catch (error) { console.warn('Unable to save rangoli', error); }
  }, [savedDesigns, storageKey]);

  // Current coloring state
  const [colors, setColors] = useState({});
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');

  // UI state
  const [showSparkle, setShowSparkle] = useState(null);
  const [showCulturalNote, setShowCulturalNote] = useState(null);
  const [showCompletionBadge, setShowCompletionBadge] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [ganeshaMessage, setGaneshaMessage] = useState('');
  const [showGaneshaMessage, setShowGaneshaMessage] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const { resetScene } = useSceneReset(sceneActions, 'festival-square', 'game2', getSceneResetConfig('game2'));
  const completionModalContent = getCompletionModal('festival-square', 'game2');
  const completionIcons = ['learn-icon', 'draw-icon', 'design-icon'];


  const [showDesignConfirmation, setShowDesignConfirmation] = useState(false);
  const [pendingDesign, setPendingDesign] = useState(null);
  const [lastWorkedDesign, setLastWorkedDesign] = useState(null); // Track which design they were working on



  const timeoutsRef = useRef([]);

  // Safe timeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // Welcome message effect
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && !gameState.completed) {
        setShowPauseMenu(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.completed]);

  useEffect(() => {
    if (gameState.phase === PHASES.INTRODUCTION && !gameState.completed) {
      const welcomeTimeout = safeSetTimeout(() => {
        setGaneshaMessage("Welcome to my art station! Let's create beautiful rangoli designs together!");
        setShowGaneshaMessage(true);
      }, 1000);
    }
  }, [gameState.phase]);


  // Start rangoli game from introduction
  const startRangoliGame = () => {
    setGameState(prev => ({
      ...prev,
      phase: PHASES.SELECTION
    }));
    setGaneshaMessage('');
    setShowGaneshaMessage(false);
  };

  // Colored regions are counted for lightweight progress only (not rewards).
  const calculateProgress = (colorsObj) => ({
    coloredSections: Object.values(colorsObj).filter(c => c && c !== 'white').length,
    stars: 0,
    celebrationStarted: false,
    showDoneButton: Object.values(colorsObj).some(c => c && c !== 'white')
  });

  // Keep the Done affordance and lightweight progress in sync with recoloring/Undo.
  useEffect(() => {
    if (gameState.phase !== PHASES.COLORING) return;
    const progress = calculateProgress(colors);
    setGameState(prev => (prev.coloredSections === progress.coloredSections &&
      prev.showDoneButton === progress.showDoneButton) ? prev : ({...prev, ...progress}));
  }, [colors, gameState.phase]);

  // Persist every edit, including changes made without leaving the screen.
  useEffect(() => {
    const id = gameState.selectedDesign?.id;
    if (id && gameState.phase === PHASES.COLORING && Object.keys(colors).length) {
      setSavedDesigns(prev => ({ ...prev, [id]: {
        colors: { ...colors }, progress: calculateProgress(colors)
      }}));
    }
  }, [colors, gameState.phase, gameState.selectedDesign?.id]);

  // Save current progress
  const saveCurrentProgress = () => {
    if (gameState.selectedDesign) {
      setSavedDesigns(prev => ({
        ...prev,
        [gameState.selectedDesign.id]: {
          colors: { ...colors },
          progress: {
            coloredSections: gameState.coloredSections,
            stars: gameState.stars,
            celebrationStarted: gameState.celebrationStarted,
            showDoneButton: gameState.showDoneButton
          }
        }
      }));
    }
  };

  // Initialize coloring state when design is selected
  const initializeColoringState = (design, isReturning = false) => {
    // Check if we have saved progress for this design
    const savedProgress = savedDesigns[design.id];

    let initialColors;
    let progress;

    if (savedProgress && !isReturning) {
      // Restore saved progress
      initialColors = savedProgress.colors;
      progress = savedProgress.progress;
    } else {
      // Start fresh
      initialColors = {};
      for (let i = 1; i <= design.sections; i++) {
        initialColors[`section-${i}`] = 'white';
      }
      progress = {
        coloredSections: 0,
        stars: 0,
        celebrationStarted: false,
        showDoneButton: false
      };
    }

    setUndoStack([]);
    setColors(initialColors);

    setGameState(prev => ({
      ...prev,
      phase: PHASES.COLORING,
      selectedDesign: design,
      totalSections: design.sections,
      ...progress
    }));

  };

  const handleDesignSelection = (design) => {
    // Returning to a saved design resumes without an extra confirmation dialog.
    proceedWithDesign(design, false);
  };

  const proceedWithDesign = (design, startFresh = false) => {
    console.log(`Starting design: ${design.name}, Fresh: ${startFresh}`);

    setGameState(prev => ({
      ...prev,
      phase: PHASES.COLORING,
      selectedDesign: design,
      totalSections: design.sections
    }));

    if (startFresh) {
      // Clear saved progress and start fresh
      setSavedDesigns(prev => {
        const updated = { ...prev };
        delete updated[design.id];
        return updated;
      });
      initializeColoringState(design, true);
    } else {
      // Load saved progress or start fresh
      initializeColoringState(design, false);
    }

    // Clear the last worked design tracker
    setLastWorkedDesign(null);

  };

  // Start over current design (clears only current design)
  const startOverCurrentDesign = () => {
    if (gameState.selectedDesign) {
      console.log(`Starting over ${gameState.selectedDesign.name}`);

      // Clear saved progress for this design
      setSavedDesigns(prev => {
        const updated = { ...prev };
        delete updated[gameState.selectedDesign.id];
        return updated;
      });

      setUndoStack([]);
    // Reinitialize with fresh state
      initializeColoringState(gameState.selectedDesign, true);
    }
  };

  // Tap a region to color or recolor it. Pausing and overlays block input.
  const handleSectionClick = (sectionId) => {
    if (gameState.phase !== PHASES.COLORING || showPauseMenu || gameState.showDesignComplete || showSceneCompletion) return;
    if (colors[sectionId] === selectedColor) return;
    setUndoStack(prev => [...prev.slice(-49), { ...colors }]);
    setColors(prev => ({ ...prev, [sectionId]: selectedColor }));
  };

  const undoLastColor = () => {
    if (showPauseMenu || !undoStack.length) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setColors(previous);
  };

  const handleManualCompletion = () => {
    if (gameState.phase !== PHASES.COLORING || showPauseMenu || !gameState.showDoneButton) return;
    setGameState(prev => ({ ...prev, showDesignComplete: true,
      completedDesignData: { name: prev.selectedDesign.name, starsEarned: 0 }
    }));
  };

  // Reset everything
  const resetToSelection = () => {
    setGameState({
      phase: PHASES.SELECTION,
      selectedDesign: null,
      coloredSections: 0,
      totalSections: 0,
      celebrationStarted: false,
      gameStartTime: Date.now(),
      stars: 0,
      completed: false,
      showDoneButton: false
    });
    setColors({});
    setSelectedColor('#FF6B6B');
  };

  // Distinct simple SVGs with generous editable regions: Lotus 16,
  // Peacock 20, Mandala 24. Their IDs match the configured region totals.
  const generateRangoliSVG = (design) => {
    const outline = '#76513F';
    const petalD = 'M150 150 C128 126 124 91 150 58 C176 91 172 126 150 150 Z';
    const colorable = (n, d, transform) => (
      <path key={n} d={d} transform={transform} fill={colors[`section-${n}`] || '#FFFDF8'}
        stroke={outline} strokeWidth="2.2" strokeLinejoin="round"
        onClick={() => handleSectionClick(`section-${n}`)}
        style={{ cursor: 'pointer', touchAction: 'manipulation' }} />
    );
    const ring = (count, offset, first, scale = 1) => Array.from({ length: count }, (_, i) =>
      colorable(first + i, petalD, `rotate(${offset + i * 360 / count} 150 150) translate(${150*(1-scale)} ${150*(1-scale)}) scale(${scale})`)
    );
    let shapes;
    if (design.id === 'lotus') {
      shapes = <>
        {ring(8, 0, 1, 1.03)}
        {ring(6, 30, 9, .62)}
        {colorable(15, 'M150 121 C173 121 179 144 169 160 C155 183 130 177 123 155 C118 139 131 121 150 121 Z')}
        <circle cx="150" cy="148" r="13" fill={colors['section-16'] || '#FFFDF8'} stroke={outline} strokeWidth="2.2" onClick={() => handleSectionClick('section-16')} style={{cursor:'pointer'}} />
      </>;
    } else if (design.id === 'peacock') {
      shapes = <>
        {Array.from({length:6},(_,i) => <g key={i} transform={`rotate(${-65+i*26} 150 224)`}>
          {colorable(i+1,'M150 224 C112 185 108 117 150 55 C192 117 188 185 150 224 Z')}
          <ellipse cx="150" cy="123" rx="19" ry="26" fill={colors[`section-${i+7}`] || '#FFFDF8'} stroke={outline} strokeWidth="2" onClick={()=>handleSectionClick(`section-${i+7}`)} style={{cursor:'pointer'}} />
          <ellipse cx="150" cy="123" rx="10" ry="14" fill={colors[`section-${i+13}`] || '#FFFDF8'} stroke={outline} strokeWidth="2" onClick={()=>handleSectionClick(`section-${i+13}`)} style={{cursor:'pointer'}} />
        </g>)}
        {colorable(19,'M139 181 Q150 165 161 181 L167 241 Q150 258 133 241 Z')}
        {colorable(20,'M146 185 C127 170 131 145 147 144 C164 156 163 176 146 185 Z')}
      </>;
    } else {
      shapes = <>{ring(10,0,1,1.04)}{ring(8,22.5,11,.72)}{ring(6,30,19,.40)}</>;
    }
    return <svg viewBox="0 0 300 300" width="100%" height="100%" role="group" aria-label={`${design.name} rangoli to color`}>
      <circle cx="150" cy="150" r="139" fill="#FFF9E6" stroke="#D8AE72" strokeWidth="2" />
      {shapes}
    </svg>;
  };

  return (
    <div className="festival-rangoli-container">
      {/* Background */}
      <div className="rangoli-background" />

      <ZoneBadgeButton variant="gameplay" zoneId="festival-square" onBack={() => onNavigate?.('zone-welcome')} />


      {/* Opening Modal - Replaces Introduction Scene */}
      {gameState.phase === PHASES.INTRODUCTION && (
        <OpeningModal
          zoneId={zoneId}
          sceneId={sceneId}
          onStart={startRangoliGame}
          characterImg={ganeshaArtist}
          showButton={true}
        />
      )}

      {/* Selection Screen */}
      {gameState.phase === PHASES.SELECTION && (
        <div className="design-selection-screen">
          {/* Design Selection Grid */}
          <div className="design-grid">
            <h2 className="selection-title">Choose a rangoli</h2>
            <div className="design-cards">
              {RANGOLI_DESIGNS.map((design) => {
                const savedProgress = savedDesigns[design.id];
                const hasProgress = savedProgress && savedProgress.progress.coloredSections > 0;

                return (
                  <div
                    key={design.id}
                    className="design-card"
                    onClick={() => !showPauseMenu && handleDesignSelection(design)}
                  >
                    <div className="design-preview">
                      <div className={`design-icon design-${design.id}`}>
                        {design.id === 'lotus' && '🪷'}
                        {design.id === 'peacock' && '🦚'}
                        {design.id === 'mandala' && '🌟'}
                      </div>
                    </div>
                    <div className="design-info">
                      <h3 className="design-name">
                        {design.name}
                        {hasProgress && <span className="rangoli-resume-label"> · Continue</span>}
                      </h3>
                      


                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Coloring Screen */}
      {gameState.phase === PHASES.COLORING && (
        <div className="coloring-screen">
          {/* Coloring Interface */}
          <div className="coloring-interface">
            <div className="coloring-header">
              <h2 className="design-title">{gameState.selectedDesign?.name}</h2>

            </div>

            {/* Color Palette */}
            <div className="color-palette">
              {COLOR_PALETTE.map(color => (
                <button
                  key={color}
                  className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Choose color ${color}`}
                  aria-pressed={selectedColor === color}
                  disabled={showPauseMenu}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>

            {/* Rangoli Canvas */}
            <div className="rangoli-canvas">
              {generateRangoliSVG(gameState.selectedDesign)}

            </div>

            <div className="coloring-actions">
              <button type="button" className="rangoli-undo" onClick={undoLastColor} disabled={!undoStack.length || showPauseMenu}>↶ Undo</button>
              <button type="button" className="done-creating-btn" onClick={handleManualCompletion} disabled={!gameState.showDoneButton || showPauseMenu}>I'm Done</button>
            </div>
          </div>
        </div>
      )}




      {/* Design Confirmation Modal - Simplified */}
      {showDesignConfirmation && pendingDesign && (
        <div className="design-confirmation-overlay">
          <div className="design-confirmation-modal-simple">

            {/* Close X button */}
            <button
              className="modal-close-x"
              onClick={() => {
                setShowDesignConfirmation(false);
                setPendingDesign(null);
              }}
            >
              ×
            </button>

            {/* Header */}
            <div className="modal-header-simple">
              <div className="modal-icon-simple">
                {pendingDesign.id === 'lotus' && '🪷'}
                {pendingDesign.id === 'peacock' && '🦚'}
                {pendingDesign.id === 'mandala' && '🌟'}
              </div>
              <h3 className="modal-title-simple">Continue or Start Fresh?</h3>
              <p className="modal-subtitle-simple">You were working on {pendingDesign.name}</p>
            </div>

            {/* 2 Buttons Side by Side */}
            <div className="modal-buttons-row">
              <button
                className="modal-btn-simple continue-btn"
                onClick={() => {
                  setShowDesignConfirmation(false);
                  proceedWithDesign(pendingDesign, false); // Resume
                }}
              >
                <span className="modal-btn-icon-simple">▶️</span>
                <span className="modal-btn-text-simple">Continue</span>
              </button>

              <button
                className="modal-btn-simple fresh-btn"
                onClick={() => {
                  setShowDesignConfirmation(false);
                  proceedWithDesign(pendingDesign, true); // Start fresh
                }}
              >
                <span className="modal-btn-icon-simple">✨</span>
                <span className="modal-btn-text-simple">Start Fresh</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Cultural Note Popup */}
      {showCulturalNote && (
        <div className="cultural-note-popup">
          <div className="note-content">
            <h3>{showCulturalNote.design}</h3>
            <p>{showCulturalNote.note}</p>
          </div>
        </div>
      )}

      {/* Completion Badge */}
      {showCompletionBadge && (
        <div className="completion-badge">
          <div className="badge-content">
            <div className="artist-badge-icon">🎨</div>
            <div className="badge-title">Rangoli Artist!</div>
            <div className="badge-stars">
              {Array.from({ length: gameState.stars }).map((_, i) => (
                <span key={i} className="star">⭐</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Design Completion Overlay */}
      <DesignCompletionOverlay
        show={gameState.showDesignComplete}
        designName={gameState.completedDesignData?.name}
        starsEarned={gameState.completedDesignData?.starsEarned || 0}

        onFinish={() => {
          // Completing any one design is the win; "Create Another" stays an optional bonus
          setGameState(prev => ({
            ...prev,
            showDesignComplete: false,
            completedDesignData: null,
            completed: true,
            stars: Math.max(8, prev.stars)
          }));
          setShowSceneCompletion(true);
        }}

        onPlayAgain={() => {
          // Replay the SAME design - clear its colors and start fresh
          const currentDesign = gameState.selectedDesign;

          setUndoStack([]);
          setGameState(prev => ({
            ...prev,
            showDesignComplete: false,
            completedDesignData: null,
            coloredSections: 0,
            stars: 0,
            celebrationStarted: false,
            showDoneButton: false
          }));

          // Clear the colors for this design
          const freshColors = {};
          for (let i = 1; i <= currentDesign.sections; i++) {
            freshColors[`section-${i}`] = 'white';
          }
          setColors(freshColors);

          // Clear saved progress for this design
          setSavedDesigns(prev => {
            const updated = { ...prev };
            delete updated[currentDesign.id];
            return updated;
          });
        }}

        onCreateAnother={() => {
          // Go back to design selection to pick a different design
          setGameState(prev => ({
            ...prev,
            showDesignComplete: false,
            completedDesignData: null,
            phase: PHASES.SELECTION,
            selectedDesign: null,
            coloredSections: 0,
            totalSections: 0,
            stars: 0,
            showDoneButton: false
          }));
          setUndoStack([]);
          setColors({});
          setSelectedColor('#FF6B6B');
        }}
      />

      {/* Game Pause Menu */}
      <GamePauseMenu
        show={showPauseMenu}
        gameName="Rangoli Artistry"
        currentStars={gameState.stars}
        hasDesignOption={true}
        onResume={() => setShowPauseMenu(false)}
        onRestart={() => { setShowPauseMenu(false); startOverCurrentDesign(); }}
        onBackToModes={() => {
          setShowPauseMenu(false);
          saveCurrentProgress();
          setLastWorkedDesign(gameState.selectedDesign);
          setGameState(prev => ({ ...prev, phase: PHASES.SELECTION }));
        }}
        onComplete={() => { setShowPauseMenu(false); /* completion remains child-triggered from the canvas */ }}
      />

      {/* Festival Square Completion */}
      {showSceneCompletion && (
        <SceneCompletionCelebration
          show={showSceneCompletion}
          zoneId="festival-square"
          sceneId="game2"
          sceneName="Rangoli Artistry"
          completionTitle={completionModalContent?.title}
          completionSubtitle={completionModalContent?.subtitle}
          discoveredSymbols={completionIcons}
          symbolImages={{
            'learn-icon': learnIcon,
            'draw-icon': drawIcon,
            'design-icon': designIcon
          }}
          starsEarned={gameState.stars}
          totalStars={8}
          nextSceneName="Festival Cooking"
          childName="little artist"
          completionData={{
            completed: true,
            stars: gameState.stars || 8,
            badges: { artist: true }
          }}
          onContinue={() => {
            console.log('🎨 RANGOLI CONTINUE: Going to next game + preserving resume');

            const profileId = localStorage.getItem('activeProfileId');
            if (profileId) {
              ProgressManager.updateSceneCompletion(profileId, 'festival-square', 'game2', {
                completed: true,
                stars: gameState.stars,
                badges: { artist: true }
              });

              GameStateManager.saveGameState('festival-square', 'game2', {
                completed: true,
                stars: gameState.stars,
                badges: { artist: true },
                designUsed: gameState.selectedDesign?.id,
                sectionsColored: gameState.coloredSections
              });

              console.log('✅ RANGOLI CONTINUE: Completion data saved');
            }

            // Set next scene for resume
            setTimeout(() => {
              SimpleSceneManager.setCurrentScene('festival-square', 'game3', false, false);
              console.log('✅ RANGOLI CONTINUE: Next game (game3) set for resume tracking');

              onNavigate?.('scene-complete-continue');
            }, 100);
          }}

          onReplay={() => {
            console.log('🎮 RANGOLI REPLAY: Play Again');

            const profileId = localStorage.getItem('activeProfileId');
            if (profileId) {
              // Clear ALL storage
              localStorage.removeItem(`temp_session_${profileId}_festival-square_game2`);
              localStorage.removeItem(`replay_session_${profileId}_festival-square_game2`);
              localStorage.removeItem(`play_again_${profileId}_festival-square_game2`);

              SimpleSceneManager.setCurrentScene('festival-square', 'game2', false, false);
              console.log('🗑️ RANGOLI: All storage cleared');
            }

            // Reset to selection screen
            resetScene();
            resetToSelection();
            setShowSceneCompletion(false);

            console.log('🔄 RANGOLI: Game reset to selection');
          }}

          onBackToMap={() => {
            console.log('🗺️ RANGOLI MAP: Back to Festival Square');

            // Clear current scene tracking
            SimpleSceneManager.clearCurrentScene();

            if (onNavigate) {
              onNavigate('zone-welcome'); // Goes to Festival Square zone welcome
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

const FestivalRangoliGame = ({ onComplete, onNavigate, zoneId = 'festival-square', sceneId = 'game2' }) => (
  <SceneManager zoneId={zoneId} sceneId={sceneId} initialState={{ phase: 'intro' }}>
    {({ sceneState, sceneActions, isReload }) => (
      <FestivalRangoliContent
        sceneState={sceneState} sceneActions={sceneActions} isReload={isReload}
        onComplete={onComplete} onNavigate={onNavigate} zoneId={zoneId} sceneId={sceneId}
      />
    )}
  </SceneManager>
);

export default FestivalRangoliGame;
