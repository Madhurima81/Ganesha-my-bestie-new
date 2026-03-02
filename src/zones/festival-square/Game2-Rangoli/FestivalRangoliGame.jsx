import React, { useState, useEffect, useRef } from 'react';
import OpeningModal from '../../../shared/components/OpeningModal.jsx';
import './FestivalRangoliGame.css';
import '../../shared/components/OpeningModal.css'; // <--- SHARED MODAL IMPORT
import { getZoneTheme } from '../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../lib/config/content/openingModals';

import FestivalSquareCompletion from '../components/FestivalSquareCompletion';
import rangoliArtistBadge from './assets/images/rangoli-badge.png';
import ganeshaCompletion from './assets/images/ganesha-artist.png';
import ganeshaArtist from './assets/images/ganesha-artist.png';
// In FestivalPianoGame.jsx (or any game inside Game1-piano folder)
import HomeButton from '../../../lib/components/ui/HomeButton';
import TocaBocaNav from '../../../lib/components/navigation/TocaBocaNav';

// 🎨 DESIGN COMPLETION OVERLAY COMPONENT
const DesignCompletionOverlay = ({
  show,
  designName,
  starsEarned,
  onPlayAgain,
  onCreateAnother
}) => {
  if (!show) return null;

  return (
    <div className="mission-completion-overlay">
      <div className="completion-sparkles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="completion-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            ⭐
          </div>
        ))}
      </div>

      <div className="completion-card">
        <div
          className="completion-ganesha"
          style={{ backgroundImage: `url(${ganeshaCompletion})` }}
        />

        <div className="completion-message">
          <h1 className="completion-title">🎨 Rangoli Complete! 🎨</h1>
          <p className="completion-subtitle">{designName}</p>

          <div className="completion-stars">
            {Array.from({ length: starsEarned }).map((_, i) => (
              <span key={i} className="star-earned">⭐</span>
            ))}
          </div>

          <p className="completion-blessing">
            "Beautiful artwork, little artist! Your rangoli shines bright!"
          </p>
        </div>

        <div className="completion-buttons">
          <button className="completion-btn play-again" onClick={onPlayAgain}>
            <span className="btn-icon">🔄</span>
            <span className="btn-text">Play Again!</span>
          </button>

          <button className="completion-btn create-another" onClick={onCreateAnother}>
            <span className="btn-icon">🎨</span>
            <span className="btn-text">Create Another!</span>
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
    name: 'Sacred Lotus',
    culturalNote: 'The lotus brings prosperity and peace to your home!',
    difficulty: 'Easy',
    sections: 24,
    description: 'Beautiful blooming lotus pattern'
  },
  {
    id: 'peacock',
    name: 'Dancing Peacock',
    culturalNote: 'The peacock dances to welcome good fortune!',
    difficulty: 'Medium',
    sections: 32,
    description: 'Graceful peacock with flowing feathers'
  },
  {
    id: 'mandala',
    name: 'Festival Mandala',
    culturalNote: 'Sacred circles connect us to the universe!',
    difficulty: 'Advanced',
    sections: 40,
    description: 'Intricate geometric mandala design'
  }
];

// Festival color palette - vibrant rangoli colors
const COLOR_PALETTE = [
  '#FF6B6B', '#FFD93D', '#FF9A3C', '#FF5677', '#9D65C9', '#6BCB77',
  '#4D96FF', '#2BCDC1', '#FFB6C1', '#87CEEB', '#DDA0DD', '#F0E68C'
];

const FestivalRangoliGame = ({ onComplete, onNavigate, zoneId = 'festival-square', sceneId = 'game2' }) => {
  // Game state
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

  // Saved progress for each design
  const [savedDesigns, setSavedDesigns] = useState({});

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

  // Calculate progress from colors
  const calculateProgress = (colorsObj, totalSections) => {
    const coloredCount = Object.values(colorsObj).filter(color => color !== 'white').length;
    return {
      coloredSections: coloredCount,
      stars: Math.min(8, Math.floor(coloredCount / (totalSections / 8))),
      celebrationStarted: coloredCount >= Math.floor(totalSections * 0.4),
      showDoneButton: coloredCount >= Math.floor(totalSections * 0.4)
    };
  };

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

    setColors(initialColors);

    setGameState(prev => ({
      ...prev,
      phase: PHASES.COLORING,
      selectedDesign: design,
      totalSections: design.sections,
      ...progress
    }));

    // Show cultural note
    setShowCulturalNote({
      note: design.culturalNote,
      design: design.name
    });
    safeSetTimeout(() => setShowCulturalNote(null), 4000);
  };

  const handleDesignSelection = (design) => {
    const savedProgress = savedDesigns[design.id];
    const hasProgress = savedProgress && savedProgress.progress.coloredSections > 0;

    // Check if they're selecting the same design they were just working on
    const isSameAsLastWorked = lastWorkedDesign && lastWorkedDesign.id === design.id;

    if (isSameAsLastWorked && hasProgress) {
      // Show confirmation modal - they're picking the same design again
      setPendingDesign(design);
      setShowDesignConfirmation(true);
    } else {
      // Different design or no progress - proceed normally
      proceedWithDesign(design, false);
      setLastWorkedDesign(null); // Clear the tracker
    }
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

    setShowCulturalNote({
      design: design.name,
      note: design.culturalNote
    });

    safeSetTimeout(() => setShowCulturalNote(null), 4000);
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

      // Reinitialize with fresh state
      initializeColoringState(gameState.selectedDesign, true);
    }
  };

  // Handle section coloring
  const handleSectionClick = (sectionId) => {
    if (gameState.phase !== PHASES.COLORING || colors[sectionId] !== 'white') return;

    console.log(`Coloring ${sectionId} with ${selectedColor}`);

    // Update colors
    const newColors = {
      ...colors,
      [sectionId]: selectedColor
    };
    setColors(newColors);

    // Calculate new progress
    const newProgress = calculateProgress(newColors, gameState.totalSections);

    // Update game state
    setGameState(prev => ({
      ...prev,
      ...newProgress
    }));

    // Visual feedback
    setShowSparkle(sectionId);
    safeSetTimeout(() => setShowSparkle(null), 800);

    // Trigger celebration when enough sections are colored
    if (newProgress.celebrationStarted && !gameState.celebrationStarted) {
      safeSetTimeout(() => triggerGentleCelebration(), 1000);
    }

    // Check if ALL sections are now colored (100% complete)
    if (newProgress.coloredSections >= gameState.totalSections) {
      console.log('🎨 ALL SECTIONS COLORED! Auto-triggering completion modal...');

      // Wait a moment for the last sparkle animation, then show completion
      safeSetTimeout(() => {
        const designData = {
          name: gameState.selectedDesign.name,
          starsEarned: newProgress.stars
        };

        setGameState(prev => ({
          ...prev,
          showDesignComplete: true,
          completedDesignData: designData
        }));
      }, 1200); // Give time for final sparkle to show
    }
  };

  // Trigger gentle celebration
  const triggerGentleCelebration = () => {
    console.log('Starting gentle celebration');

    // Show celebration sparkles
    setShowSparkle('celebration');

    safeSetTimeout(() => {
      setShowSparkle(null);
    }, 3000);
  };

  const handleManualCompletion = () => {
    console.log('Manual completion triggered');

    const designData = {
      name: gameState.selectedDesign.name,
      starsEarned: gameState.stars
    };

    setGameState(prev => ({
      ...prev,
      showDesignComplete: true,
      completedDesignData: designData
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
    setSavedDesigns({});
    setSelectedColor('#FF6B6B');
  };

  // Generate rangoli SVG based on design
  const generateRangoliSVG = (design) => {
    if (design.id === 'lotus') {
      return (
        <svg width="100%" height="100%" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
          {/* SVG Texture Patterns */}
          <defs>
            <pattern id="sandTexture" patternUnits="userSpaceOnUse" width="8" height="8">
              <rect width="8" height="8" fill="currentColor" />
              <circle cx="2" cy="2" r="0.8" fill="rgba(255,255,255,0.3)" />
              <circle cx="6" cy="6" r="0.5" fill="rgba(255,255,255,0.2)" />
              <circle cx="4" cy="1" r="0.3" fill="rgba(0,0,0,0.1)" />
              <circle cx="1" cy="5" r="0.4" fill="rgba(0,0,0,0.08)" />
            </pattern>

            <filter id="textureFilter">
              <feTurbulence baseFrequency="0.9" numOctaves="4" result="noise" />
              <feColorMatrix in="noise" type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="discrete" tableValues="0.1 0.15 0.1 0.2" />
              </feComponentTransfer>
              <feComposite operator="over" in2="SourceGraphic" />
            </filter>
          </defs>

          {/* Outer petals - 8 sections */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45) * Math.PI / 180;
            const x1 = 150 + 80 * Math.cos(angle);
            const y1 = 150 + 80 * Math.sin(angle);
            const sectionColor = colors[`section-${i + 1}`] || 'white';

            return (
              <g key={`outer-${i}`}>
                {/* Base color with texture */}
                <ellipse
                  cx={x1}
                  cy={y1}
                  rx="25"
                  ry="15"
                  fill={sectionColor}
                  stroke="black"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSectionClick(`section-${i + 1}`)}
                  transform={`rotate(${i * 45} ${x1} ${y1})`}
                  filter={sectionColor !== 'white' ? 'url(#textureFilter)' : ''}
                />
                {/* Highlight overlay for texture */}
                {sectionColor !== 'white' && (
                  <ellipse
                    cx={x1}
                    cy={y1}
                    rx="22"
                    ry="12"
                    fill="rgba(255,255,255,0.2)"
                    stroke="none"
                    style={{ pointerEvents: 'none' }}
                    transform={`rotate(${i * 45} ${x1} ${y1})`}
                  />
                )}
                {/* Shadow for depth */}
                {sectionColor !== 'white' && (
                  <ellipse
                    cx={x1 + 1}
                    cy={y1 + 1}
                    rx="24"
                    ry="14"
                    fill="rgba(0,0,0,0.15)"
                    stroke="none"
                    style={{ pointerEvents: 'none' }}
                    transform={`rotate(${i * 45} ${x1 + 1} ${y1 + 1})`}
                  />
                )}
              </g>
            );
          })}

          {/* Inner petals - 8 sections */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 + 22.5) * Math.PI / 180;
            const x = 150 + 50 * Math.cos(angle);
            const y = 150 + 50 * Math.sin(angle);
            const sectionColor = colors[`section-${i + 9}`] || 'white';

            return (
              <g key={`inner-${i}`}>
                {/* Shadow */}
                {sectionColor !== 'white' && (
                  <ellipse
                    cx={x + 1}
                    cy={y + 1}
                    rx="19"
                    ry="11"
                    fill="rgba(0,0,0,0.15)"
                    stroke="none"
                    style={{ pointerEvents: 'none' }}
                    transform={`rotate(${i * 45 + 22.5} ${x + 1} ${y + 1})`}
                  />
                )}
                {/* Base color */}
                <ellipse
                  cx={x}
                  cy={y}
                  rx="20"
                  ry="12"
                  fill={sectionColor}
                  stroke="black"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSectionClick(`section-${i + 9}`)}
                  transform={`rotate(${i * 45 + 22.5} ${x} ${y})`}
                  filter={sectionColor !== 'white' ? 'url(#textureFilter)' : ''}
                />
                {/* Highlight */}
                {sectionColor !== 'white' && (
                  <ellipse
                    cx={x}
                    cy={y}
                    rx="17"
                    ry="9"
                    fill="rgba(255,255,255,0.25)"
                    stroke="none"
                    style={{ pointerEvents: 'none' }}
                    transform={`rotate(${i * 45 + 22.5} ${x} ${y})`}
                  />
                )}
              </g>
            );
          })}

          {/* Center circles with enhanced texture */}
          <g>
            {/* Outer center shadow */}
            {colors['section-17'] !== 'white' && (
              <circle cx="151" cy="151" r="29" fill="rgba(0,0,0,0.2)" stroke="none" style={{ pointerEvents: 'none' }} />
            )}
            {/* Outer center */}
            <circle
              cx="150"
              cy="150"
              r="30"
              fill={colors['section-17'] || 'white'}
              stroke="black"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onClick={() => handleSectionClick('section-17')}
              filter={colors['section-17'] !== 'white' ? 'url(#textureFilter)' : ''}
            />
            {/* Outer center highlight */}
            {colors['section-17'] !== 'white' && (
              <circle cx="147" cy="147" r="25" fill="rgba(255,255,255,0.3)" stroke="none" style={{ pointerEvents: 'none' }} />
            )}

            {/* Inner center shadow */}
            {colors['section-18'] !== 'white' && (
              <circle cx="151" cy="151" r="19" fill="rgba(0,0,0,0.25)" stroke="none" style={{ pointerEvents: 'none' }} />
            )}
            {/* Inner center */}
            <circle
              cx="150"
              cy="150"
              r="20"
              fill={colors['section-18'] || 'white'}
              stroke="black"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onClick={() => handleSectionClick('section-18')}
              filter={colors['section-18'] !== 'white' ? 'url(#textureFilter)' : ''}
            />
            {/* Inner center highlight */}
            {colors['section-18'] !== 'white' && (
              <circle cx="147" cy="147" r="15" fill="rgba(255,255,255,0.4)" stroke="none" style={{ pointerEvents: 'none' }} />
            )}
          </g>

          {/* Decorative dots with texture */}
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * 60) * Math.PI / 180;
            const x = 150 + 70 * Math.cos(angle);
            const y = 150 + 70 * Math.sin(angle);
            const sectionColor = colors[`section-${i + 19}`] || 'white';

            return (
              <g key={`dot-${i}`}>
                {/* Dot shadow */}
                {sectionColor !== 'white' && (
                  <circle cx={x + 1} cy={y + 1} r="7" fill="rgba(0,0,0,0.2)" stroke="none" style={{ pointerEvents: 'none' }} />
                )}
                {/* Dot base */}
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill={sectionColor}
                  stroke="black"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSectionClick(`section-${i + 19}`)}
                  filter={sectionColor !== 'white' ? 'url(#textureFilter)' : ''}
                />
                {/* Dot highlight */}
                {sectionColor !== 'white' && (
                  <circle cx={x - 1} cy={y - 1} r="5" fill="rgba(255,255,255,0.4)" stroke="none" style={{ pointerEvents: 'none' }} />
                )}
              </g>
            );
          })}
        </svg>
      );
    }

    // Simplified designs for peacock and mandala
    return (
      <svg width="100%" height="100%" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
        {/* Generic pattern with appropriate number of sections */}
        {Array.from({ length: design.sections }).map((_, i) => {
          const angle = (i * (360 / design.sections)) * Math.PI / 180;
          const radius = 50 + (i % 3) * 25;
          const x = 150 + radius * Math.cos(angle);
          const y = 150 + radius * Math.sin(angle);

          return (
            <circle
              key={`section-${i}`}
              cx={x}
              cy={y}
              r={8 + (i % 3) * 4}
              fill={colors[`section-${i + 1}`] || 'white'}
              stroke="black"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onClick={() => handleSectionClick(`section-${i + 1}`)}
            />
          );
        })}

        {/* Center element */}
        <circle cx="150" cy="150" r="20" fill={colors['section-center'] || 'white'} stroke="black" strokeWidth="3" style={{ cursor: 'pointer' }} onClick={() => handleSectionClick('section-center')} />
      </svg>
    );
  };

  return (
    <div className="festival-rangoli-container">
      {/* Background */}
      <div className="rangoli-background" />

      {/* ADD PAUSE BUTTON HERE */}
      <button
        className="game-pause-button"
        onClick={() => setShowPauseMenu(true)}
        aria-label="Pause Game"
      >
        ⏸️
      </button>


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
            <h2 className="selection-title">Choose Your Rangoli Design</h2>
            <div className="design-cards">
              {RANGOLI_DESIGNS.map((design) => {
                const savedProgress = savedDesigns[design.id];
                const hasProgress = savedProgress && savedProgress.progress.coloredSections > 0;

                return (
                  <div
                    key={design.id}
                    className="design-card"
                    onClick={() => handleDesignSelection(design)}
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
                        {hasProgress && <span style={{ color: '#FF6B47', marginLeft: '8px' }}>⭐</span>}
                      </h3>
                      <p className="design-description">{design.description}</p>
                      {hasProgress && (
                        <p style={{ color: '#FF6B47', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          Progress: {savedProgress.progress.coloredSections}/{design.sections} sections
                        </p>
                      )}
                      <div className="design-stats">
                        <span className="difficulty">{design.difficulty}</span>
                        <span className="sections">{design.sections} sections</span>
                      </div>
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
              <h2 className="design-title">Creating: {gameState.selectedDesign?.name}</h2>
              <div className="progress-info">
                <div className="stars">⭐ {gameState.stars}</div>
                <div className="sections">🎨 {gameState.coloredSections}/{gameState.totalSections}</div>
              </div>
            </div>

            {/* Color Palette */}
            <div className="color-palette">
              {COLOR_PALETTE.map(color => (
                <button
                  key={color}
                  className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>

            {/* Rangoli Canvas */}
            <div className="rangoli-canvas">
              {generateRangoliSVG(gameState.selectedDesign)}

              {/* Sparkle effects */}
              {showSparkle === 'celebration' && (
                <div className="celebration-sparkles">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div
                      key={i}
                      className="celebration-sparkle"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        backgroundColor: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons - Completion is automatic at 100% */}
            <div className="coloring-actions">
              {/* Modal shows automatically when all sections colored */}
            </div>

            {/* Action Buttons 
            <div className="coloring-actions">
              <button 
                className="back-to-selection-btn"
                onClick={goBackToSelection}
              >
                🎨 Choose Different Design
              </button>
              
              <button 
                className="start-over-btn"
                onClick={startOverCurrentDesign}
              >
                🔄 Start Over
              </button>
              
              {gameState.showDoneButton && (
                <button 
                  className="done-creating-btn"
                  onClick={handleManualCompletion}
                >
                  ✨ I'm Done Creating!
                </button>
              )}
            </div>*/}
          </div>
        </div>
      )}


      {/* Game Pause Menu */}
      <GamePauseMenu
        show={showPauseMenu}
        gameName="Rangoli Artistry"
        currentStars={gameState.stars}
        hasDesignOption={true}

        onResume={() => setShowPauseMenu(false)}

        onRestart={() => {
          setShowPauseMenu(false);
          startOverCurrentDesign();
        }}

        // 3. "Change Mode" -> ALWAYS goes to the main menu
        onBackToModes={() => {

          setShowPauseMenu(false);

          // IMPORTANT: Save current progress FIRST
          saveCurrentProgress();

          // Save which design they were working on
          setLastWorkedDesign(gameState.selectedDesign);

          // Go back to selection
          setGameState(prev => ({
            ...prev,
            phase: PHASES.SELECTION
          }));
        }}

        onComplete={() => {
          setShowPauseMenu(false);
          handleManualCompletion();
        }}
      />


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

        onPlayAgain={() => {
          // Replay the SAME design - clear its colors and start fresh
          const currentDesign = gameState.selectedDesign;

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
          setColors({});
          setSelectedColor('#FF6B6B');
        }}
      />

      {/* Festival Square Completion */}
      {showSceneCompletion && (
        <FestivalSquareCompletion
          show={showSceneCompletion}
          sceneName="Rangoli Artistry"
          sceneNumber={2}
          totalScenes={4}
          starsEarned={gameState.stars}
          totalStars={8}
          discoveredBadges={['artist']}
          badgeImages={{
            artist: rangoliArtistBadge
          }}
          characterImages={{
            ganeshaMusician: ganeshaCompletion
          }}
          nextSceneName="Festival Cooking"
          childName="little artist"

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

      {/* ADD TOCA BOCA NAV HERE */}
      <TocaBocaNav
        onHome={() => onNavigate?.('home')}
        onProgress={() => {
          // Show progress/cultural celebration if you have it
          console.log('Show festival progress');
        }}
        onHelp={() => console.log('Show help')}
        onParentMenu={() => console.log('Parent menu')}
        isAudioOn={true}
        onAudioToggle={() => console.log('Toggle audio')}
        onZonesClick={() => onNavigate?.('zones')}
        onStartFresh={() => {
          // Reset ENTIRE game - back to introduction
          setGameState({
            phase: PHASES.INTRODUCTION,
            selectedDesign: null,
            coloredSections: 0,
            totalSections: 0,
            celebrationStarted: false,
            gameStartTime: Date.now(),
            stars: 0,
            completed: false,
            showDoneButton: false
          });
          setSavedDesigns({});
          setColors({});
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

export default FestivalRangoliGame;
