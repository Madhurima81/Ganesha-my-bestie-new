import React, { useState, useEffect } from 'react';
import './SceneCompletionCelebration.css';
import '../../../zones/symbol-mountain/shared/components/SymbolSidebar.css';
import GameStateManager from "../../services/GameStateManager";
import SanskritVoiceRecorder from '../audio/SanskritVoiceRecorder';
import { applyCompletionScreenTheme } from "../../theme/CompletionScreenThemeAdapter";
import { applyRecorderTheme } from "../../theme/RecorderThemeAdapter";
import GaneshaPresence from '../character/GaneshaPresence';

const SceneCompletionCelebration = ({
  show = false,
  sceneName = "Adventure",
  completionTitle = null,
  completionSubtitle = null,
  discoveredSymbols = [],
  symbolImages = {},
  badgeImage = null,
  symbolData = {}, // { symbolId: { title, description } }
  nextSceneName = "Next Adventure",
  primaryAction = null, // NEW: { text, icon, onClick, subtext }
  onContinue,
  onReplay,
  onExploreZones,
  onBackToMap,
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
  const [isExiting, setIsExiting] = useState(false);
  const resolvedZoneId = zoneId || GameStateManager.currentZone || 'symbol-mountain';

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.8);
    } catch (e) { /* audio not available */ }
  };

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
    if (show) {
      setIsExiting(false);
      const t = setTimeout(() => playChime(), 1000);
      return () => clearTimeout(t);
    }
  }, [show]);

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

  // Stamp temp session as completed when celebration shows.
  // This ensures "Continue Journey" navigates to zone-welcome (not back into the scene).
  // Also saves to permanent storage (GameStateManager) so replay doesn't erase completion.
  useEffect(() => {
    if (!show || !sceneId || !resolvedZoneId) return;
    const profileId = localStorage.getItem('activeProfileId');
    if (!profileId) return;
    const tempKey = `temp_session_${profileId}_${resolvedZoneId}_${sceneId}`;
    try {
      const existing = JSON.parse(localStorage.getItem(tempKey) || '{}');
      localStorage.setItem(tempKey, JSON.stringify({
        ...existing,
        showingCompletionScreen: true,
        completed: true,
        phase: 'complete',
        timestamp: Date.now(),
      }));
    } catch (e) {}

    // Persist completion to permanent storage so it survives replay/refresh
    try {
      const saveData = {
        completed: true,
        stars: completionData?.stars || starsEarned || 3,
        ...(completionData || {}),
        phase: 'complete',
      };
      GameStateManager.saveGameState(resolvedZoneId, sceneId, saveData);
    } catch (e) {}
  }, [show, sceneId, resolvedZoneId]);

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

  const handleContinueWithAnimation = (callback) => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      callback?.();
    }, 700);
  };
  const handleExplore = onExploreZones || onBackToMap;

  if (!show) return null;

  return (
    <div className={`celebration-backdrop${isExiting ? ' exiting' : ''}`}>

      {/* Main Container added to match OpeningModal layout */}
      <div className="celebration-content">
        <div className="completion-ganesha-left" aria-hidden="true">
          <GaneshaPresence
            className="completion-ganesha"
            pose="blessing"
            size={520}
            breathing="gentle"
            blink
            style={{
              width: 'min(520px, 100%)',
              height: 'auto',
              aspectRatio: '1 / 1',
              flexShrink: 1,
            }}
          />
        </div>

        {/* Main Card */}
        <div className={`celebration-card${isExiting ? ' exiting' : ''}`}>

          {/* Text Header */}
          <div className="celebration-header">
            <div className="title-text">{completionTitle || '🌟 You Did It!'}</div>
            <div className="subtitle-text">{completionSubtitle || `${sceneName} is glowing because of you!`}</div>
          </div>

          <div className="celebration-body">

            {/* Symbol/App Trophy Row */}
            <div className="celebration-image-section">
              {badgeImage ? (
                <div className="completion-badge-holder">
                  <img
                    src={badgeImage}
                    alt={`${sceneName} badge`}
                    className="completion-badge completion-badge-img"
                  />
                </div>
              ) : containerType === 'backpack' && symbolsInContainer.length > 0 ? (
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

                  {/* Keep Exploring — primary CTA (only when no custom primaryAction) */}
                  {!primaryAction && (
                    <button
                      className="celebration-btn celebration-btn-orange"
                      onClick={() => {
                        const currentZone = resolvedZoneId || GameStateManager.currentZone || 'symbol-mountain';
                        const nextSceneInfo = GameStateManager.getNextScene(currentZone, sceneId);
                        if (nextSceneInfo) {
                          GameStateManager.clearSceneState(nextSceneInfo.zone, nextSceneInfo.scene);
                        }
                        handleContinueWithAnimation(() => handleAction(onContinue));
                      }}
                    >
                      Keep Exploring
                    </button>
                  )}

                  {/* Secondary / Tertiary actions */}
                  {!primaryAction ? (
                    <>
                      {/* 2nd tier: Explore Scenes */}
                      <button
                        className="celebration-btn celebration-btn-teal"
                        onClick={() => handleAction(handleExplore)}
                      >
                        Explore Scenes
                      </button>
                      {/* 3rd tier: Play Again — smallest, least prominent */}
                      <button
                        className="celebration-btn-replay"
                        onClick={() => handleAction(onReplay, true)}
                      >
                        Play Again
                      </button>
                    </>
                  ) : (
                    <div className="celebration-actions-row">
                      <button
                        className="celebration-btn celebration-btn-teal celebration-btn-ghost"
                        onClick={() => handleAction(onReplay, true)}
                      >
                        Play Again
                      </button>
                      <button
                        className="celebration-btn celebration-btn-teal"
                        onClick={() => {
                          const currentZone = GameStateManager.currentZone || 'symbol-mountain';
                          const nextSceneInfo = GameStateManager.getNextScene(currentZone, sceneId);
                          if (nextSceneInfo) {
                            GameStateManager.clearSceneState(nextSceneInfo.zone, nextSceneInfo.scene);
                          }
                          handleAction(onContinue);
                        }}
                      >
                        Next Scene
                      </button>
                      <button
                        className="celebration-btn celebration-btn-teal"
                        onClick={() => handleAction(handleExplore)}
                      >
                        Back to Zone
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    className="celebration-btn celebration-btn-orange"
                    onClick={() => handleAction(handleExplore)}
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
      {/* End Main Container */}

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
          chantResult={null}
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
