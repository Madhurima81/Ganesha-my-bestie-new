import React, { useState, useRef, useEffect } from 'react';
import './FestivalRangoliGameV1.css';

const GAME_PHASES = {
  PATTERN_SELECTION: 'pattern_selection',
  ART_CREATION: 'art_creation',
  DIYA_CEREMONY: 'diya_ceremony',
  CELEBRATION: 'celebration'
};

// Cultural colors with meanings
const CULTURAL_COLORS = {
  red: { hex: '#DC143C', name: 'Prosperity Red', symbol: '💪' },
  yellow: { hex: '#FFD700', name: 'Knowledge Gold', symbol: '📚' },
  orange: { hex: '#FF8C00', name: 'Energy Orange', symbol: '🌞' },
  green: { hex: '#32CD32', name: 'Harmony Green', symbol: '🌱' },
  blue: { hex: '#4169E1', name: 'Peace Blue', symbol: '🕊️' },
  purple: { hex: '#9370DB', name: 'Spiritual Purple', symbol: '🙏' }
};

// Traditional rangoli patterns
const RANGOLI_PATTERNS = {
  'lotus-garden': {
    id: 'lotus-garden',
    name: 'Lotus Garden',
    description: 'Traditional temple design',
    culturalStory: "Lotus designs come from ancient temple art. The lotus grows pure and beautiful from muddy water, teaching us to stay pure in heart.",
    sections: ['lotus-center', 'petal-top', 'petal-right', 'petal-bottom', 'petal-left', 'diamond-top', 'diamond-bottom', 'outer-border']
  },
  'peacock-paradise': {
    id: 'peacock-paradise', 
    name: 'Peacock Paradise',
    description: 'Natural flowing design',
    culturalStory: "Peacocks represent beauty and grace. Lord Krishna is often shown with peacock feathers, connecting us to nature's artistry.",
    sections: ['peacock-body', 'tail-feather-top', 'tail-feather-left', 'tail-feather-right', 'tail-feather-bottom', 'wing-detail', 'flower-border-top', 'flower-border-bottom']
  },
  'festival-lights': {
    id: 'festival-lights',
    name: 'Festival Lights',
    description: 'Celebration focused design', 
    culturalStory: "Festival lights represent the victory of light over darkness. Every diya we light brings joy and prosperity to our homes.",
    sections: ['central-diya', 'flame-pattern-top', 'flame-pattern-left', 'flame-pattern-right', 'star-top', 'star-bottom', 'border-top', 'border-bottom']
  }
};

const FestivalRangoliGame = ({ onComplete, onNavigate }) => {
  // Game state
  const [gameState, setGameState] = useState({
    phase: GAME_PHASES.PATTERN_SELECTION,
    selectedPattern: null,
    selectedColor: null,
    completed: false,
    gameStartTime: Date.now(),
    showDoneButton: false
  });

  // Simple colors state like your working example
  const [sectionColors, setSectionColors] = useState({});

  // UI state
  const [ganeshaMessage, setGaneshaMessage] = useState('');
  const [showGaneshaMessage, setShowGaneshaMessage] = useState(false);
  const [showSparkles, setShowSparkles] = useState(null);
  const [showDiyaCeremony, setShowDiyaCeremony] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

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

  // Welcome message
  useEffect(() => {
    safeSetTimeout(() => {
      setGaneshaMessage("Welcome to sacred rangoli art! Choose a beautiful pattern to create your blessing artwork!");
      setShowGaneshaMessage(true);
      safeSetTimeout(() => setShowGaneshaMessage(false), 4000);
    }, 1000);
  }, []);

  // Pattern selection
  const handlePatternSelect = (patternId) => {
    const pattern = RANGOLI_PATTERNS[patternId];
    
    setGameState(prev => ({
      ...prev,
      selectedPattern: patternId,
      phase: GAME_PHASES.ART_CREATION
    }));

    // Initialize section colors for this pattern
    const initialColors = {};
    pattern.sections.forEach(section => {
      initialColors[section] = 'white';
    });
    setSectionColors(initialColors);

    setGaneshaMessage(pattern.culturalStory);
    setShowGaneshaMessage(true);
    safeSetTimeout(() => setShowGaneshaMessage(false), 5000);
  };

  // Color selection
  const handleColorSelect = (colorId) => {
    setGameState(prev => ({
      ...prev,
      selectedColor: colorId
    }));
  };

  // Section filling - Using your working pattern
  const handleSectionClick = (sectionId) => {
    console.log(`Coloring ${sectionId} with ${gameState.selectedColor}`);
    
    if (!gameState.selectedColor) {
      console.log('No color selected');
      return;
    }
    
    if (sectionColors[sectionId] !== 'white') {
      console.log('Section already filled');
      return;
    }
    
    const selectedColorHex = CULTURAL_COLORS[gameState.selectedColor].hex;
    console.log('Filling with color:', selectedColorHex);
    
    // Simple state update like your working example
    setSectionColors({
      ...sectionColors,
      [sectionId]: selectedColorHex
    });

    // Visual effects
    setShowSparkles(sectionId);
    safeSetTimeout(() => setShowSparkles(null), 1000);

    // Check completion
    const filledSections = Object.values({...sectionColors, [sectionId]: selectedColorHex}).filter(color => color !== 'white').length;
    
    if (filledSections >= 5) {
      setGameState(prev => ({ ...prev, showDoneButton: true }));
    }

    if (filledSections >= 7) {
      safeSetTimeout(() => startDiyaCeremony(), 1500);
    }

    // Ganesha encouragement
    if (filledSections % 2 === 0) {
      const encouragements = [
        "Beautiful colors are blooming!",
        "Your artwork is taking shape!",
        "Such wonderful creativity!",
        "Almost ready for the blessing!"
      ];
      
      const message = encouragements[Math.min(Math.floor(filledSections / 2) - 1, 3)];
      if (message) {
        setGaneshaMessage(message);
        setShowGaneshaMessage(true);
        safeSetTimeout(() => setShowGaneshaMessage(false), 2500);
      }
    }
  };

  // Manual completion
  const handleManualCompletion = () => {
    startDiyaCeremony();
  };

  // Diya ceremony
  const startDiyaCeremony = () => {
    setGameState(prev => ({ ...prev, phase: GAME_PHASES.DIYA_CEREMONY }));
    setShowDiyaCeremony(true);
    
    setGaneshaMessage("Your beautiful rangoli is complete! Light the sacred diya to bless your artwork!");
    setShowGaneshaMessage(true);
    safeSetTimeout(() => setShowGaneshaMessage(false), 4000);
  };

  // Light the diya
  const handleDiyaLight = () => {
    setGameState(prev => ({
      ...prev,
      phase: GAME_PHASES.CELEBRATION,
      completed: true
    }));

    setShowDiyaCeremony(false);
    setShowCompletion(true);
    
    setGaneshaMessage("Beautiful! You are now a Sacred Artist! Your rangoli brings blessings and joy!");
    setShowGaneshaMessage(true);

    // Auto-complete after celebration
    safeSetTimeout(() => {
      if (onComplete) {
        onComplete({
          stars: 8,
          completed: true,
          timeSpent: Date.now() - gameState.gameStartTime,
          pattern: gameState.selectedPattern,
          sectionsCompleted: Object.values(sectionColors).filter(color => color !== 'white').length
        });
      }
    }, 5000);
  };

  // SVG Patterns - Using your direct approach
  const LotusGardenSVG = () => (
    <svg viewBox="0 0 400 400" className="rangoli-svg">
      <rect width="400" height="400" fill="#F5F5DC" opacity="0.3"/>
      
      {/* Corner diyas */}
      <circle cx="50" cy="50" r="6" fill="#FFD700" opacity="0.6"/>
      <circle cx="350" cy="50" r="6" fill="#FFD700" opacity="0.6"/>
      <circle cx="50" cy="350" r="6" fill="#FFD700" opacity="0.6"/>
      <circle cx="350" cy="350" r="6" fill="#FFD700" opacity="0.6"/>
      
      {/* Fillable sections */}
      <circle 
        cx="200" cy="200" r="25" 
        fill={sectionColors['lotus-center'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('lotus-center')}
      />
      
      <path 
        d="M200,175 Q185,155 200,135 Q215,155 200,175 Z"
        fill={sectionColors['petal-top'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('petal-top')}
      />
      
      <path 
        d="M225,200 Q245,185 265,200 Q245,215 225,200 Z"
        fill={sectionColors['petal-right'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('petal-right')}
      />
      
      <path 
        d="M200,225 Q215,245 200,265 Q185,245 200,225 Z"
        fill={sectionColors['petal-bottom'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('petal-bottom')}
      />
      
      <path 
        d="M175,200 Q155,215 135,200 Q155,185 175,200 Z"
        fill={sectionColors['petal-left'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('petal-left')}
      />
      
      <path 
        d="M200,120 L230,150 L200,180 L170,150 Z"
        fill={sectionColors['diamond-top'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('diamond-top')}
      />
      
      <path 
        d="M200,220 L170,250 L200,280 L230,250 Z"
        fill={sectionColors['diamond-bottom'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('diamond-bottom')}
      />
      
      <path 
        d="M100,100 Q150,80 200,100 Q250,80 300,100 Q320,150 300,200 Q320,250 300,300 Q250,320 200,300 Q150,320 100,300 Q80,250 100,200 Q80,150 100,100 Z"
        fill={sectionColors['outer-border'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('outer-border')}
      />
    </svg>
  );

  const PeacockParadiseSVG = () => (
    <svg viewBox="0 0 400 400" className="rangoli-svg">
      <rect width="400" height="400" fill="#F5F5DC" opacity="0.3"/>
      
      {/* Corner flowers */}
      <circle cx="60" cy="60" r="8" fill="#FF69B4" opacity="0.4"/>
      <circle cx="340" cy="60" r="8" fill="#FF69B4" opacity="0.4"/>
      <circle cx="60" cy="340" r="8" fill="#FF69B4" opacity="0.4"/>
      <circle cx="340" cy="340" r="8" fill="#FF69B4" opacity="0.4"/>
      
      {/* Fillable sections */}
      <ellipse 
        cx="200" cy="250" rx="30" ry="45"
        fill={sectionColors['peacock-body'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('peacock-body')}
      />
      
      <path 
        d="M200,205 Q180,160 160,120 Q180,140 200,160 Q220,140 240,120 Q220,160 200,205 Z"
        fill={sectionColors['tail-feather-top'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('tail-feather-top')}
      />
      
      <path 
        d="M170,220 Q130,200 90,180 Q110,200 130,220 Q110,240 90,260 Q130,240 170,220 Z"
        fill={sectionColors['tail-feather-left'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('tail-feather-left')}
      />
      
      <path 
        d="M230,220 Q270,200 310,180 Q290,200 270,220 Q290,240 310,260 Q270,240 230,220 Z"
        fill={sectionColors['tail-feather-right'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('tail-feather-right')}
      />
      
      <path 
        d="M200,295 Q180,340 160,380 Q180,360 200,340 Q220,360 240,380 Q220,340 200,295 Z"
        fill={sectionColors['tail-feather-bottom'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('tail-feather-bottom')}
      />
      
      <ellipse 
        cx="170" cy="250" rx="20" ry="30"
        fill={sectionColors['wing-detail'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('wing-detail')}
      />
      
      <path 
        d="M80,80 Q120,70 160,80 Q200,70 240,80 Q280,70 320,80 Q310,120 280,120 Q240,130 200,120 Q160,130 120,120 Q90,120 80,80 Z"
        fill={sectionColors['flower-border-top'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('flower-border-top')}
      />
      
      <path 
        d="M80,320 Q90,280 120,280 Q160,270 200,280 Q240,270 280,280 Q310,280 320,320 Q280,330 240,320 Q200,330 160,320 Q120,330 80,320 Z"
        fill={sectionColors['flower-border-bottom'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('flower-border-bottom')}
      />
    </svg>
  );

  const FestivalLightsSVG = () => (
    <svg viewBox="0 0 400 400" className="rangoli-svg">
      <rect width="400" height="400" fill="#F5F5DC" opacity="0.3"/>
      
      {/* Corner stars */}
      <polygon points="60,50 65,65 80,65 68,75 73,90 60,82 47,90 52,75 40,65 55,65" fill="#FFD700" opacity="0.5"/>
      <polygon points="340,50 345,65 360,65 348,75 353,90 340,82 327,90 332,75 320,65 335,65" fill="#FFD700" opacity="0.5"/>
      <polygon points="60,350 65,365 80,365 68,375 73,390 60,382 47,390 52,375 40,365 55,365" fill="#FFD700" opacity="0.5"/>
      <polygon points="340,350 345,365 360,365 348,375 353,390 340,382 327,390 332,375 320,365 335,365" fill="#FFD700" opacity="0.5"/>
      
      {/* Fillable sections */}
      <ellipse 
        cx="200" cy="200" rx="35" ry="25"
        fill={sectionColors['central-diya'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('central-diya')}
      />
      
      <path 
        d="M200,175 Q185,155 200,135 Q215,155 200,175 Q190,165 200,150 Q210,165 200,175"
        fill={sectionColors['flame-pattern-top'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('flame-pattern-top')}
      />
      
      <path 
        d="M175,200 Q155,185 135,200 Q155,215 175,200 Q165,190 150,200 Q165,210 175,200"
        fill={sectionColors['flame-pattern-left'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('flame-pattern-left')}
      />
      
      <path 
        d="M225,200 Q245,185 265,200 Q245,215 225,200 Q235,190 250,200 Q235,210 225,200"
        fill={sectionColors['flame-pattern-right'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('flame-pattern-right')}
      />
      
      <polygon 
        points="200,100 205,115 220,115 208,125 213,140 200,132 187,140 192,125 180,115 195,115"
        fill={sectionColors['star-top'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('star-top')}
      />
      
      <polygon 
        points="200,300 205,285 220,285 208,275 213,260 200,268 187,260 192,275 180,285 195,285"
        fill={sectionColors['star-bottom'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('star-bottom')}
      />
      
      <path 
        d="M100,120 Q150,110 200,120 Q250,110 300,120 Q290,140 250,140 Q200,150 150,140 Q110,140 100,120 Z"
        fill={sectionColors['border-top'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('border-top')}
      />
      
      <path 
        d="M100,280 Q110,260 150,260 Q200,250 250,260 Q290,260 300,280 Q250,290 200,280 Q150,290 100,280 Z"
        fill={sectionColors['border-bottom'] || 'white'}
        stroke="#8B4513" strokeWidth="3"
        className="fillable-section"
        onClick={() => handleSectionClick('border-bottom')}
      />
    </svg>
  );

  const renderCurrentSVG = () => {
    if (!gameState.selectedPattern) return null;
    
    const SVGComponent = {
      'lotus-garden': LotusGardenSVG,
      'peacock-paradise': PeacockParadiseSVG,
      'festival-lights': FestivalLightsSVG
    }[gameState.selectedPattern];
    
    return SVGComponent ? <SVGComponent /> : null;
  };

  return (
    <div className="festival-rangoli-container">
      {/* Background */}
      <div className="rangoli-background" />
      
      {/* Ganesha Character */}
      <div className="ganesha-character">
        <div className="ganesha-image" />
        {showGaneshaMessage && (
          <div className="ganesha-speech-bubble">
            {ganeshaMessage}
          </div>
        )}
      </div>

      {/* Pattern Selection Phase */}
      {gameState.phase === GAME_PHASES.PATTERN_SELECTION && (
        <div className="pattern-selection-phase">
          <h2 className="phase-title">Choose Your Sacred Pattern</h2>
          <div className="patterns-grid">
            {Object.entries(RANGOLI_PATTERNS).map(([patternId, pattern]) => (
              <div
                key={patternId}
                className={`pattern-card pattern-${patternId}`}
                onClick={() => handlePatternSelect(patternId)}
              >
                <div className="pattern-icon">
                  {patternId === 'lotus-garden' && '🪷'}
                  {patternId === 'peacock-paradise' && '🦚'}
                  {patternId === 'festival-lights' && '🪔'}
                </div>
                <h3 className="pattern-name">{pattern.name}</h3>
                <p className="pattern-description">{pattern.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Art Creation Phase */}
      {gameState.phase === GAME_PHASES.ART_CREATION && (
        <div className="art-creation-phase">
          
          {/* Color Palette */}
          <div className="color-palette">
            <h2 className="palette-title">Sacred Colors</h2>
            <div className="colors-grid">
              {Object.entries(CULTURAL_COLORS).map(([colorId, colorData]) => (
                <div
                  key={colorId}
                  className={`color-pot ${gameState.selectedColor === colorId ? 'selected' : ''}`}
                  style={{ '--color': colorData.hex }}
                  onClick={() => handleColorSelect(colorId)}
                >
                  <div className="color-symbol">{colorData.symbol}</div>
                  <div className="color-name">{colorData.name.split(' ')[0]}</div>
                </div>
              ))}
            </div>
            
            {gameState.selectedColor && (
              <div className="selected-color-info">
                <div 
                  className="selected-color-display"
                  style={{ backgroundColor: CULTURAL_COLORS[gameState.selectedColor].hex }}
                />
                <div className="selected-color-name">
                  {CULTURAL_COLORS[gameState.selectedColor].name}
                </div>
              </div>
            )}
          </div>

          {/* Rangoli Canvas */}
          <div className="rangoli-canvas">
            <div className="canvas-container">
              {renderCurrentSVG()}
              
              {/* Sparkle effects */}
              {showSparkles && (
                <div className="sparkle-effects">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="sparkle" />
                  ))}
                </div>
              )}
            </div>
            
            {/* Progress */}
            <div className="progress-tracker">
              <div className="progress-text">
                Progress: {Object.values(sectionColors).filter(color => color !== 'white').length}/8 sections
              </div>
            </div>
          </div>
        </div>
      )}

      {/* I'm Done Button */}
      {gameState.showDoneButton && !gameState.completed && (
        <div className="done-button" onClick={handleManualCompletion}>
          I'm Done Creating!
        </div>
      )}

      {/* Diya Ceremony */}
      {showDiyaCeremony && (
        <div className="diya-ceremony-modal">
          <div className="ceremony-content">
            <h3 className="ceremony-title">Light the Sacred Diya</h3>
            <div className="diya-container" onClick={handleDiyaLight}>
              <div className="diya-flame">🪔</div>
            </div>
            <p className="ceremony-instruction">
              Tap the diya to complete your sacred blessing artwork!
            </p>
          </div>
        </div>
      )}

      {/* Completion */}
      {showCompletion && (
        <div className="completion-modal">
          <div className="completion-content">
            <h3 className="completion-title">Sacred Artist Achievement!</h3>
            <div className="achievement-badge">🏆</div>
            <div className="completion-details">
              <div className="completion-pattern">
                Pattern: {RANGOLI_PATTERNS[gameState.selectedPattern]?.name}
              </div>
              <div className="completion-stats">
                <div>Sections Filled: {Object.values(sectionColors).filter(color => color !== 'white').length}/8</div>
              </div>
            </div>
            
            <div className="completion-buttons">
              <button 
                className="completion-button replay"
                onClick={() => window.location.reload()}
              >
                Create Another Rangoli
              </button>
              
              <button 
                className="completion-button continue"
                onClick={() => {
                  if (onNavigate) onNavigate('festival-square');
                }}
              >
                Continue to Festival Square
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FestivalRangoliGame;