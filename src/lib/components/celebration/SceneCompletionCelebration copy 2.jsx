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
  onExploreZones,
  onViewProgress,
  onHome,
  sceneId = 'pond',
  completionData = null,
  onComplete = null,
  childName = "little explorer",
  isFinalScene = false,
  
  // Container type props
  containerType = "backpack",        // "backpack", "smartwatch", or "journal"
  containerImage = null,             // Base container image
  containerScreenImage = null,       // Screen overlay (smartwatch only)
  appImages = {},                    // App icon mappings (smartwatch)
  meaningCards = {},                 // Meaning card data (journal)
  zoneId = 'symbol-mountain'
}) => {
  const [stage, setStage] = useState('hidden');
  const [symbolsInContainer, setSymbolsInContainer] = useState([]);
  
  const { clearManualCloseTracking } = useGameCoach();

useEffect(() => {
  if (!show) {
    // IMMEDIATE: Hide without delay or animation
    setStage('hidden');
    setSymbolsInContainer([]);
    return;
  }

  // Only animate in if we're actually showing
  setStage('celebrating');
  const uniqueSymbols = [...new Set(discoveredSymbols)];
  
  setTimeout(() => {
    uniqueSymbols.forEach((symbol, index) => {
      setTimeout(() => {
        setSymbolsInContainer(prev => {
          if (prev.includes(symbol)) return prev;
          return [...prev, symbol];
        });
      }, index * 500);
    });
  }, 500);

  setTimeout(() => {
    setStage('actions-ready');
  }, 500 + (uniqueSymbols.length * 500) + 2500);

}, [show, discoveredSymbols]);

  // Action handlers
  const handleAction = (actionCallback, skipComplete = false) => {
    if (clearManualCloseTracking) {
      clearManualCloseTracking();
    }
    
    setStage('exiting');
    setTimeout(() => {
      if (!skipComplete && onComplete && completionData) {
        onComplete(sceneId, completionData);
      }
      actionCallback?.();
    }, 400);
  };

  const handleContinue = () => handleAction(() => onContinue?.());

const handleReplay = () => {
  console.log('🔄 COMPLETION: Immediate hide + callback');
  
  if (clearManualCloseTracking) {
    clearManualCloseTracking();
  }
  
  // IMMEDIATE: Force hide the component
  setStage('hidden');
  
  // IMMEDIATE: Execute callback (no delay)
  onReplay?.();
  
  // FAIL-SAFE: Force hide again after a tick
  setTimeout(() => {
    setStage('hidden');
  }, 10);
};

  const handleBackToMap = () => handleAction(() => console.log('Navigate to zone map'));
  const handleExploreZones = () => handleAction(() => onExploreZones?.());
  const handleViewProgress = () => handleAction(() => onViewProgress?.());
  const handleHome = () => handleAction(() => onHome?.());

  // Helper functions
  const getAppGridPosition = (index) => {
    if (index < 3) return { gridColumn: index + 1, gridRow: 1 };
    if (index < 5) return { gridColumn: (index - 3) + 2, gridRow: 2 };
    return { gridColumn: (index - 5) + 1, gridRow: 3 };
  };

  const getJournalPosition = (index) => {
    const isLeftPage = index % 2 === 0;
    const rowOnPage = Math.floor(index / 2);
    return {
      page: isLeftPage ? 'left' : 'right',
      row: rowOnPage + 1
    };
  };

  if (stage === 'hidden') return null;

  return (
    <>
      <div className={`celebration-backdrop stage-${stage}`} />
      
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
      
      <div className={`celebration-card stage-${stage}`}>
        
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
        
        {/* Container - Backpack, Smartwatch, or Journal */}
        <div 
          className={`container-holder ${containerType}`}
          style={{
            width: containerType === 'smartwatch' ? '320px' : containerType === 'journal' ? '360px' : '280px',
            height: containerType === 'smartwatch' ? '300px' : containerType === 'journal' ? '280px' : '260px',
            position: 'absolute',
            left: containerType === 'smartwatch' ? '40px' : containerType === 'journal' ? '20px' : '10px',
            top: containerType === 'smartwatch' ? '5px' : containerType === 'journal' ? '10px' : '10px'
          }}
        >
          {containerType === 'backpack' && (
            <div className="backpack">
              <img 
                src="/images/symbol-backpack.png" 
                alt="Adventure Backpack" 
                className="backpack-image"
                style={{
                  width: '280px',
                  height: '260px',
                  objectFit: 'contain',
                  margin: '0 auto',
                  display: 'block'
                }} 
              />
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
                {symbolsInContainer.map((symbol, index) => (
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
          )}

          {containerType === 'smartwatch' && (
            <div className="smartwatch-container">
              {containerScreenImage && (
                <img 
                  src={containerScreenImage} 
                  alt="Smartwatch Screen" 
                  className="smartwatch-screen"
                  style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'contain',
                    position: 'absolute',
                    top: '40px',
                    left: '60px',
                    zIndex: 2
                  }} 
                />
              )}
              
              <div 
                className="smartwatch-apps-overlay"
                style={{
                  position: 'absolute',
                  top: '60px',
                  left: '80px',
                  width: '160px',
                  height: '160px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gridTemplateRows: 'repeat(3, 1fr)',
                  gap: '6px',
                  alignItems: 'center',
                  justifyItems: 'center',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              >
                {symbolsInContainer.map((symbol, index) => {
                  const gridPosition = getAppGridPosition(index);
                  return (
                    <div 
                      key={`smartwatch-${symbol}-${index}`}
                      className="smartwatch-app"
                      style={{
                        gridColumn: gridPosition.gridColumn,
                        gridRow: gridPosition.gridRow,
                        width: '36px',
                        height: '36px',
                        animation: 'symbolPop 0.6s ease-out both',
                        animationDelay: `${index * 0.2}s`
                      }}
                    >
                      {appImages[symbol] ? 
                        <img 
                          src={appImages[symbol]} 
                          alt={symbol} 
                          className="app-icon" 
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.6))'
                          }}
                        /> :
                        <span className="app-emoji" style={{ 
                          fontSize: '28px',
                          filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.6))'
                        }}>
                          📱
                        </span>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {containerType === 'journal' && (
            <div className="journal-container">
              <img 
                src={containerImage || "/images/meaning-journal.png"} 
                alt="Sacred Knowledge Journal" 
                className="journal-base"
                style={{
                  width: '360px',
                  height: '280px',
                  objectFit: 'contain',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1
                }} 
              />
              
              <div className="journal-pages-overlay">
                {/* Left Page */}
                <div 
                  className="journal-page left-page"
                  style={{
                    position: 'absolute',
                    top: '40px',
                    left: '30px',
                    width: '140px',
                    height: '180px',
                    zIndex: 10
                  }}
                >
                  {symbolsInContainer.filter((_, index) => index % 2 === 0).map((symbol, index) => {
                    const actualIndex = index * 2;
                    const card = meaningCards[symbol];
                    return (
                      <div 
                        key={`journal-left-${symbol}`}
                        className="meaning-card"
                        style={{
                          position: 'absolute',
                          top: `${index * 40}px`,
                          left: '10px',
                          width: '120px',
                          height: '35px',
                          animation: 'meaningCardAppear 0.8s ease-out both',
                          animationDelay: `${actualIndex * 0.3}s`
                        }}
                      >
                        <div className="meaning-content">
                          {appImages[symbol] && (
                            <img 
                              src={appImages[symbol]}
                              alt={symbol}
                              className="meaning-icon"
                              style={{
                                width: '20px',
                                height: '20px',
                                objectFit: 'contain',
                                float: 'left',
                                marginRight: '8px'
                              }}
                            />
                          )}
                          <div className="meaning-text">
                            <div className="sanskrit-text" style={{ fontSize: '10px', fontWeight: 'bold' }}>
                              {card?.sanskrit || symbol}
                            </div>
                            <div className="english-meaning" style={{ fontSize: '8px', color: '#666' }}>
                              {card?.meaning || symbol}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Page */}
                <div 
                  className="journal-page right-page"
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: '30px',
                    width: '140px',
                    height: '180px',
                    zIndex: 10
                  }}
                >
                  {symbolsInContainer.filter((_, index) => index % 2 === 1).map((symbol, index) => {
                    const actualIndex = (index * 2) + 1;
                    const card = meaningCards[symbol];
                    return (
                      <div 
                        key={`journal-right-${symbol}`}
                        className="meaning-card"
                        style={{
                          position: 'absolute',
                          top: `${index * 40}px`,
                          left: '10px',
                          width: '120px',
                          height: '35px',
                          animation: 'meaningCardAppear 0.8s ease-out both',
                          animationDelay: `${actualIndex * 0.3}s`
                        }}
                      >
                        <div className="meaning-content">
                          {appImages[symbol] && (
                            <img 
                              src={appImages[symbol]}
                              alt={symbol}
                              className="meaning-icon"
                              style={{
                                width: '30px',
                                height: '30px',
                                objectFit: 'contain',
                                float: 'left',
                                marginRight: '8px'
                              }}
                            />
                          )}
                          <div className="meaning-text">
                            <div className="sanskrit-text" style={{ fontSize: '10px', fontWeight: 'bold' }}>
                              {card?.sanskrit || symbol}
                            </div>
                            <div className="english-meaning" style={{ fontSize: '8px', color: '#666' }}>
                              {card?.meaning || symbol}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Trekker Ganesha */}
        <div className="trekker-container">
          <div className="trekker-ganesha">
            <img src="/images/ganesha-character.png" alt="Trekker Ganesha" />
          </div>
          
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
                    {isFinalScene ? 'Zone mastered!' : 
                     containerType === 'smartwatch' ? 'Sacred apps collected!' : 
                     containerType === 'journal' ? 'Sacred meanings learned!' : 'Sacred symbols collected!'}
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

        {/* Action buttons */}
        <div className="action-buttons">
          {!isFinalScene ? (
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