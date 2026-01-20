import React, { useState, useEffect } from 'react';
import { useGameCoach } from "../coach/GameCoach";
import './SceneCompletionCelebration.css';
import GameStateManager from "../../services/GameStateManager";

const SceneCompletionCelebration = ({ 
  show = false, 
  sceneName = "Adventure",
  discoveredSymbols = [],
  symbolImages = {},
  nextSceneName = "Next Adventure",
  primaryAction = null, // NEW: { text, icon, onClick, subtext }
  onContinue,
  onReplay,
  onExploreZones,
  onHome,
  sceneId = 'pond',
  completionData = null,
  onComplete = null,
  childName = "Little Explorer",
  isFinalScene = false,
  containerType = "backpack",
  appImages = {}
}) => {
  const [symbolsInContainer, setSymbolsInContainer] = useState([]);
  // Generate random positions for stars once on mount so they don't jump around
  const [stars] = useState(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${3 + Math.random() * 4}s`,
    size: `${15 + Math.random() * 20}px`
  })));


  useEffect(() => {
    if (!show) {
      setSymbolsInContainer([]);
      return;
    }
    const uniqueSymbols = [...new Set(discoveredSymbols)];
    uniqueSymbols.forEach((symbol, index) => {
      setTimeout(() => {
        setSymbolsInContainer(prev => prev.includes(symbol) ? prev : [...prev, symbol]);
      }, 500 + (index * 400));
    });
  }, [show, discoveredSymbols]);

const handleAction = (callback, skipComplete = false) => {
  if (!skipComplete && onComplete && completionData) {
    console.log('🎯 SceneCompletion handleAction called');
    console.log('🎯 sceneId:', sceneId);
    console.log('🎯 completionData:', completionData);
    console.log('🎯 completionData.chantedVerses:', completionData.chantedVerses);
    onComplete(sceneId, completionData);
  }
  callback?.();
};

  if (!show) return null;

  return (
    <div className="celebration-backdrop">
      
      {/* --- BACKGROUND SPARKLES (Lots of Stars) --- */}
      <div className="background-sparkles">
        {stars.map((star) => (
          <div 
            key={star.id} 
            className="bg-sparkle" 
            style={{
              top: star.top, 
              left: star.left, 
              animationDelay: star.delay,
              animationDuration: star.duration,
              fontSize: star.size
            }}
          >
            ⭐
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="celebration-card">

        {/* Text Header */}
        <div className="celebration-header">
          <div className="title-text">Amazing Work, {childName}!</div>
          <div className="subtitle-text">[{sceneName}] Completed!</div>
        </div>

        <div className="celebration-body">
          
          {/* Center Image (Backpack) */}
          <div className="celebration-image-section">
            <div className="container-holder">
              {containerType === 'backpack' ? (
                <>
                  <img src="/images/symbol-backpack.png" alt="Backpack" className="backpack-image" />
                  <div className="backpack-symbols-overlay">
                    {symbolsInContainer.map((symbol) => (
                      <div key={symbol} className="backpack-symbol">
                        {symbolImages[symbol] ? 
                          <img src={symbolImages[symbol]} alt={symbol} className="symbol-img" /> :
                          <span style={{fontSize: '24px'}}>⭐</span>
                        }
                      </div>
                    ))}
                  </div>
                </>
              ) : containerType === 'smartwatch' ? (
                 <img src="/images/smartwatch-base.png" alt="Smartwatch" className="backpack-image" />
              ) : (
                 <img src="/images/meaning-journal.png" alt="Journal" className="backpack-image" />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="celebration-actions-section">
            
            {!isFinalScene ? (
              <>
                {/* PRIMARY ACTION (if provided) */}
                {primaryAction && (
                  <div className="primary-action-container">
                    <button 
                      className="celebration-btn celebration-btn-primary" 
                      onClick={() => handleAction(primaryAction.onClick)}
                    >
                      {primaryAction.icon && <span className="btn-icon">{primaryAction.icon}</span>}
                      {primaryAction.text}
                    </button>
                    {primaryAction.subtext && (
                      <p className="primary-action-subtext">{primaryAction.subtext}</p>
                    )}
                  </div>
                )}

                {/* Continue Adventure - only show as primary if no primaryAction */}
                {!primaryAction && (
                  <button 
                    className="celebration-btn celebration-btn-orange" 
                    onClick={() => {
                      // Clear next scene state before continuing
                      console.log('🎯 Continue Adventure clicked');
                      console.log('🎯 Current sceneId:', sceneId);
                      console.log('🎯 GameStateManager.currentZone:', GameStateManager.currentZone);
                      
                      const currentZone = GameStateManager.currentZone || 'symbol-mountain';
                      const nextSceneInfo = GameStateManager.getNextScene(currentZone, sceneId);
                      
                      console.log('🎯 Next scene info:', nextSceneInfo);
                      
                      if (nextSceneInfo) {
                        console.log(`✨ Clearing next scene state: ${nextSceneInfo.scene}`);
                        GameStateManager.clearSceneState(nextSceneInfo.zone, nextSceneInfo.scene);
                      } else {
                        console.log('❌ No next scene found!');
                      }
                      
                      // Then continue normally
                      handleAction(onContinue);
                    }}
                  >
                    Continue Adventure
                  </button>
                )}
                
                {/* Secondary actions row */}
                <div className="celebration-actions-row">
                  <button 
                    className="celebration-btn celebration-btn-teal" 
                    onClick={() => handleAction(onReplay, true)}
                  >
                    Play Again
                  </button>
                  
                  {/* Show "Next Scene" button if primaryAction exists */}
                  {primaryAction && (
                    <button 
                      className="celebration-btn celebration-btn-teal" 
                      onClick={() => {
                        const currentZone = GameStateManager.currentZone || 'symbol-mountain';
                        const nextSceneInfo = GameStateManager.getNextScene(currentZone, sceneId);
                        
                        if (nextSceneInfo) {
                          console.log(`✨ Clearing next scene state: ${nextSceneInfo.scene}`);
                          GameStateManager.clearSceneState(nextSceneInfo.zone, nextSceneInfo.scene);
                        }
                        
                        handleAction(onContinue);
                      }}
                    >
                      Next Scene
                    </button>
                  )}
                  
                  <button 
                    className="celebration-btn celebration-btn-teal" 
                    onClick={() => handleAction(onExploreZones)}
                  >
                    {primaryAction ? 'Back to Zone' : 'Explore Scenes'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <button 
                  className="celebration-btn celebration-btn-orange" 
                  onClick={() => handleAction(onExploreZones)}
                >
                  Explore Zones
                </button>
                <div className="celebration-actions-row">
                  <button 
                    className="celebration-btn celebration-btn-teal" 
                    onClick={() => handleAction(onReplay, true)}
                  >
                    Replay Zone
                  </button>
                  <button 
                    className="celebration-btn celebration-btn-teal" 
                    onClick={() => handleAction(onHome)}
                  >
                    Go Home
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SceneCompletionCelebration;