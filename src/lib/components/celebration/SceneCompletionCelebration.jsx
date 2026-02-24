import React, { useState, useEffect } from 'react';
import { useGameCoach } from "../coach/GameCoach";
import './SceneCompletionCelebration.css';
import '../../../zones/symbol-mountain/shared/components/SymbolSidebar.css';
import GameStateManager from "../../services/GameStateManager";
import SanskritVoiceRecorder from '../audio/SanskritVoiceRecorder';
import { applyCompletionScreenTheme } from "../../theme/CompletionScreenThemeAdapter";
import { applyRecorderTheme } from "../../theme/RecorderThemeAdapter";

const SceneCompletionCelebration = ({
  show = false,
  sceneName = "Adventure",
  discoveredSymbols = [],
  symbolImages = {},
  symbolData = {}, // { symbolId: { title, description } }
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
  zoneId = null,
  containerType = "backpack",
  appImages = {},
  // App trophy row props (containerType="apps")
  appData = {}, // { appId: { title, description, syllables, color } }
  savedRecordings = {}
}) => {
  const [symbolsInContainer, setSymbolsInContainer] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null); // for symbol popup
  const [selectedApp, setSelectedApp] = useState(null); // for app recorder popup
  // Generate random positions for stars once on mount so they don't jump around
  const [stars] = useState(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${3 + Math.random() * 4}s`,
    size: `${15 + Math.random() * 20}px`
  })));
  const resolvedZoneId = zoneId || GameStateManager.currentZone || 'symbol-mountain';


  useEffect(() => {
    if (!show) return;
    applyCompletionScreenTheme(resolvedZoneId);
  }, [show, zoneId]);

  useEffect(() => {
    if (selectedApp) {
      applyRecorderTheme(resolvedZoneId);
    }
  }, [selectedApp, resolvedZoneId]);

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

          {/* Symbol/App Trophy Row */}
          <div className="celebration-image-section">
            {containerType === 'backpack' && symbolsInContainer.length > 0 ? (
              <>
                <div className="trophy-symbols-row">
                  {symbolsInContainer.map((symbol, index) => (
                    <div
                      key={symbol}
                      className={`trophy-symbol ${symbolData[symbol] ? 'trophy-symbol-tappable' : ''}`}
                      onClick={() => symbolData[symbol] && setSelectedSymbol(symbol)}
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <div className="trophy-symbol-glow">
                        {symbolImages[symbol] ?
                          <img src={symbolImages[symbol]} alt={symbol} className="trophy-symbol-img" /> :
                          <span style={{ fontSize: '64px' }}>⭐</span>
                        }
                        {symbolData[symbol] && (
                          <div className="tap-indicator">TAP!</div>
                        )}
                      </div>
                      {symbolData[symbol] && (
                        <p className="trophy-symbol-name">{symbol.charAt(0).toUpperCase() + symbol.slice(1)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : containerType === 'apps' && discoveredSymbols.length > 0 ? (
              /* App Trophy Row — tapping opens the voice recorder */
              <>
                <div className="trophy-symbols-row">
                  {discoveredSymbols.map((appId, index) => (
                    <div
                      key={appId}
                      className="trophy-symbol trophy-symbol-tappable"
                      onClick={() => {
                        applyRecorderTheme(resolvedZoneId);
                        setSelectedApp(appId);
                      }}
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <div className="trophy-symbol-glow">
                        {appImages[appId] ?
                          <img src={appImages[appId]} alt={appId} className="trophy-symbol-img" /> :
                          <span style={{ fontSize: '64px' }}>🎵</span>
                        }
                        <div className="tap-indicator">TAP!</div>
                      </div>
                      <p className="trophy-symbol-name">
                        {appId.charAt(0).toUpperCase() + appId.slice(1)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : containerType === 'smartwatch' ? (
              <div className="container-holder">
                <img src="/images/smartwatch-screen.png" alt="Smartwatch" className="backpack-image" />
              </div>
            ) : (
              <div className="container-holder">
                <img src="/images/meaning-journal.png" alt="Journal" className="backpack-image" />
              </div>
            )}
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

      {/* Symbol popup - when tapping backpack symbols */}
      {selectedSymbol && symbolData[selectedSymbol] && (
        <div className="ganesha-popup-overlay" onClick={() => setSelectedSymbol(null)} style={{ zIndex: 9999 }}>
          <div className="ganesha-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="ganesha-popup-close-btn" onClick={() => setSelectedSymbol(null)}>×</button>
            <div className="ganesha-popup-img-container">
              {symbolImages[selectedSymbol] && (
                <img src={symbolImages[selectedSymbol]} alt={selectedSymbol} className="ganesha-popup-custom-img" />
              )}
            </div>
            <h2 className="ganesha-popup-title">{symbolData[selectedSymbol].title}</h2>
            <p className="ganesha-popup-description">{symbolData[selectedSymbol].description}</p>
            <button className="ganesha-popup-continue-btn" onClick={() => setSelectedSymbol(null)}>Got it!</button>
          </div>
        </div>
      )}

      {/* App recorder popup - when tapping app icons (containerType="apps") */}
      {selectedApp && appData[selectedApp] && (
        <SanskritVoiceRecorder
          word={selectedApp}
          syllables={appData[selectedApp].syllables}
          appIcon={appImages[selectedApp]}
          appColor={appData[selectedApp].color || '#FF6B35'}
          savedRecordings={savedRecordings}
          allowSkip={true}
          title="Practice Chanting"
          prompt={`Try saying ${selectedApp.toUpperCase()}`}
          onComplete={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
};

export default SceneCompletionCelebration;
