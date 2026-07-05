import React, { useState, useEffect } from 'react';
import { useGameCoach } from "../coach/GameCoach";
import './SceneCompletionCelebration.css';

const SceneCompletionCelebration = ({ 
  show = false, 
  sceneName = "Pond Adventure",
  sceneNumber = 2,
  totalScenes = 4,
  starsEarned = 5,
  totalStars = 5,
  discoveredSymbols = ['lotus', 'trunk', 'golden'],
  symbolImages = {},
  nextSceneName = "Temple Discovery",
  onContinue,
  onReplay,
  onExploreZones,        // ← NEW: For final scene
  onViewProgress,        // ← NEW: For final scene
  onHome,                // ← NEW: For final scene
  sceneId = 'pond',
  completionData = null,
  onComplete = null,
  childName = "little explorer",
  isFinalScene = false   // ← NEW: Different buttons for final scene
}) => {
  const [stage, setStage] = useState('hidden');
  const [symbolsInBackpack, setSymbolsInBackpack] = useState([]);
  
  const { clearManualCloseTracking } = useGameCoach();

  useEffect(() => {
    if (!show) {
      setStage('hidden');
      setSymbolsInBackpack([]);
      return;
    }

    // Show immediately when scene tells us to
    setStage('celebrating');
    
    // Remove duplicates from discoveredSymbols first
    const uniqueSymbols = [...new Set(discoveredSymbols)];
    
    // Symbols appear in backpack one by one
    setTimeout(() => {
      uniqueSymbols.forEach((symbol, index) => {
        setTimeout(() => {
          setSymbolsInBackpack(prev => {
            // Prevent duplicates in state too
            if (prev.includes(symbol)) return prev;
            return [...prev, symbol];
          });
        }, index * 500);
      });
    }, 500);

    // Show action buttons after symbols
    setTimeout(() => {
      setStage('actions-ready');
    }, 500 + (uniqueSymbols.length * 500) + 2500);

  }, [show, discoveredSymbols]);

  // Generic action handler with GameCoach cleanup
  const handleAction = (actionCallback, skipComplete = false) => {
    console.log('🔧 ACTION: Scene-level handling + GameCoach cleanup');
    
    if (clearManualCloseTracking) {
      clearManualCloseTracking();
      console.log('✅ GameCoach state cleared');
    }
    
    setStage('exiting');
    setTimeout(() => {
      // Save completion data if needed
      if (!skipComplete && onComplete && completionData) {
        onComplete(sceneId, completionData);
      }
      actionCallback?.();
    }, 400);
  };

  // Regular scene handlers
  const handleContinue = () => {
    handleAction(() => onContinue?.());
  };

  const handleReplay = () => {
    handleAction(() => onReplay?.(), true); // Skip complete for replay
  };

  const handleBackToMap = () => {
    handleAction(() => console.log('Navigate to zone map'));
  };

  // Final scene handlers
  const handleExploreZones = () => {
    handleAction(() => onExploreZones?.());
  };

  const handleViewProgress = () => {
    handleAction(() => onViewProgress?.());
  };

  const handleHome = () => {
    handleAction(() => onHome?.());
  };

  if (stage === 'hidden') return null;

  return (
    <>
      {/* Light overlay to dim scene slightly */}
      <div className={`celebration-backdrop stage-${stage}`} />
      
      {/* Sparkle effects */}
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
      
      {/* Main celebration card */}
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
        
        {/* Backpack on left */}
        <div 
          className="backpack-container"
          style={{
            width: '280px',
            height: '260px',
            position: 'absolute',
            left: '10px',
            top: '10px'
          }}
        >
          <div className="backpack">
            <img src="/images/symbol-backpack.webp" alt="Adventure Backpack" className="backpack-image"
             style={{
                width: '280px',
                height: '260px',
                objectFit: 'contain',
                margin: '0 auto',
                display: 'block'
              }} />
            <div 
              className="backpack-symbols-overlay"
              style={{
                position: 'absolute',
                top: '90px',
                left: '50px', 
                right: '50px',
                bottom: '60px',
                pointerEvents: 'none',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)', 
                gap: '8px',
                alignItems: 'center',
                justifyItems: 'center'
              }}
            >
              {/* Symbols inside backpack */}
              {symbolsInBackpack.map((symbol, index) => (
                <div 
                  key={`backpack-${symbol}-${index}`}
                  className="backpack-symbol"
                  style={{
                    left: `${15 + (index % 3) * 20}%`,
                    top: `${15 + Math.floor(index / 3) * 30}%`,
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  {symbolImages[symbol] ? 
                    <img src={symbolImages[symbol]} alt={symbol} className="symbol-img" /> :
                    <span className="symbol-emoji">{
                      {lotus: '🪷', trunk: '🐘', golden: '⭐', om: '🕉️', temple: '🛕', garden: '🌺', water: '💧', mooshika: '🐭', modak: '🍯', belly: '🌌', eyes: '👁️', ear: '👂', tusk: '🦷'}[symbol] || '✨'
                    }</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trekker Ganesha on right */}
        <div className="trekker-container">
          {/* Trekker Ganesha character */}
          <div className="trekker-ganesha">
            <img src="/images/ganesha-character.webp" alt="Trekker Ganesha" />
          </div>
          
          {/* Speech bubble - Different text for final scene */}
          <div 
            className={`speech-bubble ${stage === 'actions-ready' ? 'stage-actions-ready' : ''}`}
            style={{
              '--bubble-color': stage === 'celebrating' ? '#FF6B6B' : '#4ECDC4',
              '--bubble-border': stage === 'celebrating' ? '#E55A5A' : '#45B7D1'
            }}
          >
            <div className="bubble-content">
              {stage === 'celebrating' && (
                <>
                  <div className="bubble-title">Amazing work, {childName}!</div>
                  <div className="bubble-text">
                    {isFinalScene ? 
                      `You completed the entire ${sceneName} zone!` : 
                      `You completed ${sceneName}!`
                    }
                  </div>
                </>
              )}
              {stage === 'actions-ready' && (
                <>
                  <div className="bubble-title">
                    {isFinalScene ? 'Zone mastered!' : 'Sacred symbols collected!'}
                  </div>
                  <div className="bubble-text">
                    {isFinalScene ? 
                      'What divine adventure awaits next?' : 
                      'Where shall your adventure lead next?'
                    }
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons - Different for final scene */}
        <div className="action-buttons">
          {!isFinalScene ? (
            // Regular scene buttons
            <>
              <button className="action-btn continue-btn" onClick={handleContinue}>
                <div className="btn-text">
                  <div className="btn-title">Continue</div>
                  <div className="btn-subtitle">{nextSceneName}</div>
                </div>
              </button>
              
              <button className="action-btn replay-btn" onClick={handleReplay}>
                <div className="btn-text">
                  <div className="btn-title">Play Again</div>
                  <div className="btn-subtitle">Replay scene</div>
                </div>
              </button>
              
              <button className="action-btn map-btn" onClick={handleBackToMap}>
                <div className="btn-text">
                  <div className="btn-title">Zone Map</div>
                  <div className="btn-subtitle">Choose scene</div>
                </div>
              </button>
            </>
          ) : (
            // Final scene buttons
            <>
              <button className="action-btn explore-btn" onClick={handleExploreZones}>
                <div className="btn-text">
                  <div className="btn-title">🌟 Explore Zones</div>
                  <div className="btn-subtitle">New adventures await</div>
                </div>
              </button>
              
              <button className="action-btn replay-btn" onClick={handleReplay}>
                <div className="btn-text">
                  <div className="btn-title">🔄 Play Again</div>
                  <div className="btn-subtitle">Replay this zone</div>
                </div>
              </button>
              
             {/* 
<button className="action-btn progress-btn" onClick={handleViewProgress}>
  <div className="btn-text">
    <div className="btn-title">📊 My Progress</div>
    <div className="btn-subtitle">View achievements</div>
  </div>
</button>
*/}

              <button className="action-btn home-btn" onClick={handleHome}>
                <div className="btn-text">
                  <div className="btn-title">🏠 Home</div>
                  <div className="btn-subtitle">Back to start</div>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SceneCompletionCelebration;