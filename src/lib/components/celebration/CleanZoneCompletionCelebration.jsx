// CleanZoneCompletionCelebration.jsx - Epic orbital effects + Scene completion card
import React, { useState, useEffect } from 'react';
import './SceneCompletionCelebration.css';       // Import scene completion styles first
import './CleanZoneCompletionCelebration.css';   // Override with zone-specific styles
import Fireworks from '../feedback/Fireworks';

const CleanZoneCompletionCelebration = ({
  show = false,
  zoneId = 'symbol-mountain',
  playerName = 'little explorer',
  onComplete,
  onContinueExploring,
    onReplay,                    // ← ADD THIS LINE
      // ✅ ADD THESE MISSING PROPS:
  sceneId = 'final-scene',        // ← ADD THIS
  completionData = null,          // ← ADD THIS
  onCompleteScene = null,         // ← ADD THIS (different from onComplete)
  onViewProgress,
  // Symbol images
  ganeshaImage,
  symbolImages = {}
}) => {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [showPortal, setShowPortal] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [stage, setStage] = useState('hidden'); // For scene completion compatibility

  // Zone-specific configurations
  const ZONE_CONFIGS = {
    'symbol-mountain': {
      title: 'Guardian of Sacred Symbols',
      zoneName: 'Symbol Mountain',
      zoneIcon: '🏔️',
      achievement: '8 Sacred Elements Mastered',
      symbols: [
        { id: 'mooshika', name: 'Mooshika', image: symbolImages.mooshika },
        { id: 'om', name: 'Om', image: symbolImages.om },
        { id: 'lotus', name: 'Lotus', image: symbolImages.lotus },
        { id: 'trunk', name: 'Trunk', image: symbolImages.trunk },
        { id: 'eyes', name: 'Eyes', image: symbolImages.eyes },
        { id: 'ears', name: 'Ears', image: symbolImages.ears },
        { id: 'tusk', name: 'Tusk', image: symbolImages.tusk },
        { id: 'modak', name: 'Modak', image: symbolImages.modak },
        { id: 'belly', name: 'Belly', image: symbolImages.belly }
      ],
      realmColor: '#FFD700',
      bgGradient: 'radial-gradient(circle at center, rgba(255,215,0,0.2) 0%, rgba(138,43,226,0.4) 40%, rgba(25,25,112,0.8) 100%)',
      bubbleColor: '#4CAF50',
      bubbleBorder: '#45a049'
    }
  };

  const config = ZONE_CONFIGS[zoneId] || ZONE_CONFIGS['symbol-mountain'];

  // Phase timing - Keep original timing
  const PHASE_DURATIONS = {
    1: 5000,  // Portal + fireworks (original)
    2: 5000   // Scene completion card (new)
  };

  // DEBUG: Log symbol images
  useEffect(() => {
    console.log('🔍 ZONE CELEBRATION DEBUG:');
    console.log('symbolImages prop:', symbolImages);
    console.log('config.symbols:', config.symbols);
    
    config.symbols.forEach(symbol => {
      console.log(`Symbol ${symbol.name}:`, symbol.image ? 'HAS IMAGE' : 'NO IMAGE');
    });
  }, [symbolImages]);

  useEffect(() => {
    if (!show) {
      setCurrentPhase(1);
      setShowPortal(false);
      setShowFireworks(false);
      setShowCard(false);
      setStage('hidden');
      return;
    }

    console.log(`🌟 Starting Clean Zone Completion for ${zoneId}`);

    // Phase 1: KEEP ORIGINAL - Clean Portal with Aura Circles, Orbital Symbols, Cosmic Sound Waves
    setShowPortal(true);
    setCurrentPhase(1);

    // Fireworks timing: Start after 1.5s, run for 2.5s (ORIGINAL)
    const fireworksStartTimer = setTimeout(() => {
      console.log('🎆 Starting fireworks');
      setShowFireworks(true);
    }, 1500);

    const fireworksEndTimer = setTimeout(() => {
      console.log('🎆 Ending fireworks');
      setShowFireworks(false);
    }, 4000); // 1.5s + 2.5s = 4s

    // Phase 2: NEW - Scene completion card (after fireworks end)
    const cardTimer = setTimeout(() => {
      setCurrentPhase(2);
      setShowCard(true);
      setShowPortal(false); // Hide portal effects
      setStage('actions-ready'); // Set stage for scene completion styling
    }, PHASE_DURATIONS[1]);

    // Cleanup
    return () => {
      clearTimeout(fireworksStartTimer);
      clearTimeout(fireworksEndTimer);
      clearTimeout(cardTimer);
    };
  }, [show, zoneId]);

const handleNextAdventure = () => {
  console.log('🗺️ Next Adventure clicked');
  
  // ✅ ADD: Save completion before navigation
  if (onCompleteScene && completionData && sceneId) {
    console.log('💾 Saving zone completion before Next Adventure');
    onCompleteScene(sceneId, completionData);
  }
  
  onContinueExploring?.();
};

  /*const handleCelebrateAgain = () => {
    console.log('🎉 Celebrate Again clicked');
    // Reset to show celebration again
    setCurrentPhase(1);
    setShowPortal(true);
    setShowFireworks(false);
    setShowCard(false);
    setStage('hidden');
    
    // Restart fireworks sequence
    setTimeout(() => {
      setShowFireworks(true);
    }, 1500);
    
    setTimeout(() => {
      setShowFireworks(false);
    }, 4000);
    
    setTimeout(() => {
      setShowCard(true);
      setShowPortal(false);
      setStage('actions-ready');
    }, PHASE_DURATIONS[1]);
  };*/

  const handleCelebrateAgain = () => {
  console.log('🎉 Celebrate Again clicked - replaying scene');
  onReplay?.();
};

const handleHome = () => {
  console.log('🏠 Home clicked');
  
  // ✅ ADD: Save completion before navigation  
  if (onCompleteScene && completionData && sceneId) {
    console.log('💾 Saving zone completion before Home');
    onCompleteScene(sceneId, completionData);
  }
  
  onComplete?.();
};

  if (!show) return null;

  return (
    <div className="clean-zone-completion">
      {/* Phase 1: ORIGINAL EPIC PORTAL - Keep all orbital symbols, cosmic waves, etc. */}
      {showPortal && (
        <div className="mystical-portal">
          {/* FIREWORKS INTEGRATION */}
          <Fireworks 
            show={showFireworks}
            variant="zone"
            duration={2500}
            count={4}
            colors={['#FFD700', '#FF69B4', '#8A2BE2', '#FFA500', '#DA70D6', '#F0E68C']}
            onComplete={() => console.log('🎆 Fireworks sequence complete')}
          />
          
          <div className="portal-ring">
            <div className="portal-inner">
              <div className="portal-core">
                <div className="divine-ganesha-silhouette">
                  {ganeshaImage ? (
                    <img src={ganeshaImage} alt="Ganesha" className="ganesha-image" />
                  ) : (
                    <div className="ganesha-placeholder">🐘</div>
                  )}
                  
                  {/* KEEP ORIGINAL: Cosmic Sound Waves around Ganesha */}
                  <div className="cosmic-sound-waves">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`cosmic-sound-wave wave-${i + 1}`}
                        style={{
                          width: `${(i + 1) * 70}px`,
                          height: `${(i + 1) * 70}px`,
                          margin: `${-(i + 1) * 35}px 0 0 ${-(i + 1) * 35}px`
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* KEEP ORIGINAL: Orbital Symbols around Ganesha */}
                  <div className="orbital-symbols-container">
                    {config.symbols.slice(0, 8).map((symbol, index) => (
                      <div
                        key={symbol.id}
                        className={`orbital-symbol orbital-symbol-${index}`}
                        style={{
                          animationDelay: `${index * 0.2}s`
                        }}
                      >
                        {symbol.image ? (
                          <img 
                            src={symbol.image} 
                            alt={symbol.name} 
                            className="orbital-symbol-image" 
                          />
                        ) : (
                          <div className="orbital-symbol-placeholder">✨</div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* KEEP ORIGINAL: Divine Aura Rings - Clean expanding circles */}
                  <div className="divine-aura-rings">
                    <div className="aura-ring ring-1"></div>
                    <div className="aura-ring ring-2"></div>
                    <div className="aura-ring ring-3"></div>
                    <div className="aura-ring ring-4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: NEW - Scene Completion Card with Backpack + Trekker */}
      {showCard && (
        <>
          {/* Card backdrop */}
          <div className="celebration-backdrop" />
          
          {/* Sparkle effects - SAME AS SCENE */}
          <div className="sparkle-effects">
            {Array.from({length: 15}).map((_, i) => (
              <div 
                key={i} 
                className="floating-sparkle" 
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  fontSize: `${12 + Math.random() * 8}px`
                }}
              >
                ✨
              </div>
            ))}
          </div>
          
          {/* Main zone completion card - SAME AS SCENE COMPLETION */}
          <div className={`celebration-card stage-${stage}`}>
            {/* Background sparkles inside card */}
            <div className="card-sparkles">
              {Array.from({length: 12}).map((_, i) => (
                <div 
                  key={i} 
                  className="card-sparkle" 
                  style={{
                    left: `${5 + (i % 4) * 25 + Math.random() * 15}%`,
                    top: `${5 + Math.floor(i / 4) * 25 + Math.random() * 15}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                  ⭐
                </div>
              ))}
            </div>
            
            {/* Backpack on left - EXACT SAME AS SCENE */}
            <div className="backpack-container">
              <div className="backpack">
                <img src="/images/symbol-backpack.webp" alt="Adventure Backpack" className="backpack-image" />
                <div className="backpack-symbols-overlay">
                  {/* Use SPECIFIC symbols for Phase 2 backpack */}
                  {[
                    { key: 'mooshika', image: symbolImages.mooshika, fallback: '🐭' },
                    { key: 'lotus', image: symbolImages.lotus, fallback: '🪷' },
                    { key: 'trunk', image: symbolImages.trunk, fallback: '🐘' },
                    { key: 'eyes', image: symbolImages.eyes, fallback: '👁️' },
                    { key: 'ears', image: symbolImages.ears, fallback: '👂' },
                    { key: 'tusk', image: symbolImages.tusk, fallback: '🦷' },
                    { key: 'modak', image: symbolImages.modak, fallback: '🍯' },
                    { key: 'belly', image: symbolImages.belly, fallback: '🫄' }
                  ].map((symbol, index) => (
                    <div 
                      key={`backpack-${symbol.key}-${index}`}
                      className="backpack-symbol"
                      style={{
                        left: `${15 + (index % 3) * 20}%`,
                        top: `${15 + Math.floor(index / 3) * 30}%`,
                        animationDelay: `${index * 0.2}s`
                      }}
                    >
                      {symbol.image ? 
                        <img src={symbol.image} alt={symbol.key} className="symbol-img" /> :
                        <span className="symbol-emoji">{symbol.fallback}</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trekker Ganesha on right - EXACT SAME AS SCENE */}
            <div className="trekker-container">
              {/* Trekker Ganesha character - USE SPECIFIC IMAGE */}
              <div className="trekker-ganesha">
           <img src="/images/ganesha-character.webp" alt="Trekker Ganesha" />
              </div>
              
              {/* Speech bubble - ZONE SPECIFIC CONTENT */}
              <div 
                className={`speech-bubble stage-${stage}`}
                style={{
                  '--bubble-color': config.bubbleColor,
                  '--bubble-border': config.bubbleBorder
                }}
              >
                <div className="bubble-title">Incredible, {playerName}!</div>
                <div className="bubble-text">You mastered {config.zoneName}! What's your next adventure?</div>
              </div>
            </div>

            {/* Action buttons at bottom - ZONE SPECIFIC BUTTONS */}
            <div className="action-buttons">
              <button 
                className="action-btn continue-btn"
                onClick={handleNextAdventure}
              >
                <div className="btn-title">🌟 Next Adventure!</div>
                <div className="btn-subtitle">Choose another zone</div>
              </button>
              
              <button 
                className="action-btn replay-btn"
                onClick={handleCelebrateAgain}
              >
                <div className="btn-title">🎉 Celebrate Again!</div>
                <div className="btn-subtitle">Watch victory again</div>
              </button>
              
             <button 
              className="action-btn map-btn"
              onClick={handleHome}
            >
              <div className="btn-title">🏠 Home</div>
              <div className="btn-subtitle">Back to start</div>
            </button>
          </div>
        </div>
      </>
    )}
  </div>
);
};


export default CleanZoneCompletionCelebration;
