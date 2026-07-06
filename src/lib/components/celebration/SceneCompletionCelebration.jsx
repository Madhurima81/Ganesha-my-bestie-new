import React, { useEffect, useRef, useState } from 'react';
import './SceneCompletionCelebration.css';
import GameStateManager from "../../services/GameStateManager";
import SanskritVoiceRecorder from '../audio/SanskritVoiceRecorder';
import { applyCompletionScreenTheme } from "../../theme/CompletionScreenThemeAdapter";
import { applyRecorderTheme } from "../../theme/RecorderThemeAdapter";
import { GANESHA_POSE_ASSETS } from '../../config/ganeshaUsageSystem';
import ProfilePillBtn from '../shared/ProfilePillBtn';
import { getProfilePillBtnStyle } from '../../config/ZoneThemes';

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
  const symbolTimeoutsRef = useRef([]);
  const resolvedZoneId = zoneId || GameStateManager.currentZone || 'symbol-mountain';
  const isZoneFinalCompletionBadge =
    isFinalScene &&
    ['symbol-mountain', 'shloka-river', 'cave-of-secrets'].includes(resolvedZoneId);
  const finalBadgeConfig = {
    'symbol-mountain': {
      icon: '/images/icons/symbols-icon.png',
      alt: 'Symbol',
      glowClass: 'symbol-final-icon-glow',
    },
    'shloka-river': {
      icon: '/images/icons/chant-icon.png',
      alt: 'Chant',
      glowClass: 'symbol-final-icon-glow-blue',
    },
    'cave-of-secrets': {
      icon: '/images/icons/meanings-icon.png',
      alt: 'Meaning',
      glowClass: 'symbol-final-icon-glow-purple',
    },
  };

  useEffect(() => {
    if (!show) return;
    applyCompletionScreenTheme(resolvedZoneId);
  }, [show, resolvedZoneId]);

  useEffect(() => {
    if (selectedApp) {
      applyRecorderTheme(resolvedZoneId);
    }
  }, [selectedApp, resolvedZoneId]);

  useEffect(() => {
    if (show) {
      setIsExiting(false);
    }
  }, [show]);

  useEffect(() => {
    if (!show) {
      symbolTimeoutsRef.current.forEach(clearTimeout);
      symbolTimeoutsRef.current = [];
      setSymbolsInContainer([]);
      return;
    }

    symbolTimeoutsRef.current.forEach(clearTimeout);
    symbolTimeoutsRef.current = [];
    const uniqueSymbols = [...new Set(discoveredSymbols)];
    uniqueSymbols.forEach((symbol, index) => {
      const timeoutId = setTimeout(() => {
        setSymbolsInContainer(prev => prev.includes(symbol) ? prev : [...prev, symbol]);
      }, 500 + (index * 400));
      symbolTimeoutsRef.current.push(timeoutId);
    });

    return () => {
      symbolTimeoutsRef.current.forEach(clearTimeout);
      symbolTimeoutsRef.current = [];
    };
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
        stars: completionData?.stars ?? 3,
        ...(completionData || {}),
        phase: 'complete',
      };
      GameStateManager.saveGameState(resolvedZoneId, sceneId, saveData);
    } catch (e) {}
  }, [show, sceneId, resolvedZoneId, completionData]);

  const handleAction = (callback, skipComplete = false) => {
    if (!skipComplete && onComplete && completionData) {
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
  const cleanedSubtitle = (completionSubtitle || `${sceneName} is glowing because of you!`)
    .replace(/\s*Wonderful work, little friend\.?/i, '')
    .trim();

  if (!show) return null;

  return (
    <div className={`celebration-backdrop${isExiting ? ' exiting' : ''}`}>

      {/* Main Container added to match OpeningModal layout */}
      <div className="scene-completion-content">
        <div className="completion-ganesha-left" aria-hidden="true">
          <img
            className="completion-ganesha"
            src={GANESHA_POSE_ASSETS.sitModak}
            alt="Ganesha"
            style={{
              width: 'min(470px, 100%)',
              height: 'auto',
              aspectRatio: '1 / 1',
              flexShrink: 1,
            }}
          />
        </div>

        {/* Main Card */}
        <div className={`celebration-card${isExiting ? ' exiting' : ''}`}>
          <div className="celebration-soft-sparkles" aria-hidden="true">
            <span className="soft-sparkle soft-sparkle-1" />
            <span className="soft-sparkle soft-sparkle-2" />
            <span className="soft-sparkle soft-sparkle-3" />
            <span className="soft-sparkle soft-sparkle-4" />
            <span className="soft-sparkle soft-sparkle-5" />
            <span className="soft-sparkle soft-sparkle-6" />
          </div>

          {/* Text Header */}
          <div className="celebration-header">
            <span className="celebration-lotus-top" aria-hidden="true" />
            <div className="title-text">{completionTitle || '🌟 You Did It!'}</div>
            <div className="subtitle-text">{cleanedSubtitle}</div>
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
              ) : isZoneFinalCompletionBadge ? (
                <div className="symbol-complete-badge-wrap">
                  <div
                    className={`symbol-complete-glow ${finalBadgeConfig[resolvedZoneId]?.glowClass || 'symbol-final-icon-glow'}`}
                    aria-hidden="true"
                  />
                  <span className="symbol-sparkle sparkle-1" aria-hidden="true" />
                  <span className="symbol-sparkle sparkle-2" aria-hidden="true" />
                  <span className="symbol-sparkle sparkle-3" aria-hidden="true" />
                  <span className="symbol-sparkle sparkle-4" aria-hidden="true" />
                  <img
                    src={finalBadgeConfig[resolvedZoneId]?.icon || '/images/icons/symbols-icon.png'}
                    alt={finalBadgeConfig[resolvedZoneId]?.alt || 'Symbol'}
                    className="symbol-complete-badge symbol-final-icon"
                  />
                </div>
              ) : (
                <div className="container-holder">
                  <img src="/images/meaning-journal.png" alt="Journal" className="backpack-image" />
                </div>
              )}
            </div>
            {((containerType === 'backpack' && symbolsInContainer.length > 0) ||
              (containerType === 'apps' && discoveredSymbols.length > 0)) && (
              <p className="discovered-growth-bridge">These powers are growing inside you.</p>
            )}

            {/* Action Buttons */}
            <div className="celebration-actions-section">

              <>
                {/* PRIMARY ACTION (if provided) */}
                {primaryAction && (
                  <div className="primary-action-container">
                    <ProfilePillBtn
                      onClick={() => handleAction(primaryAction.onClick)}
                      label={primaryAction.icon ? `${primaryAction.icon} ${primaryAction.text}` : primaryAction.text}
                      size="md"
                      fullWidth={true}
                      style={getProfilePillBtnStyle(resolvedZoneId)}
                    />
                    {primaryAction.subtext && (
                      <p className="primary-action-subtext">{primaryAction.subtext}</p>
                    )}
                  </div>
                )}

                {/* Primary CTA */}
                {!primaryAction && (
                  <ProfilePillBtn
                    onClick={() => {
                      if (isFinalScene) {
                        handleContinueWithAnimation(() => handleAction(onHome || onContinue || handleExplore));
                        return;
                      }
                      const currentZone = resolvedZoneId || GameStateManager.currentZone || 'symbol-mountain';
                      const nextSceneInfo = GameStateManager.getNextScene(currentZone, sceneId);
                      if (nextSceneInfo) {
                        GameStateManager.clearSceneState(nextSceneInfo.zone, nextSceneInfo.scene);
                      }
                      handleContinueWithAnimation(() => handleAction(onContinue));
                    }}
                    label={isFinalScene ? 'Home' : 'Next Adventure'}
                    size="md"
                    fullWidth={true}
                    style={getProfilePillBtnStyle(resolvedZoneId)}
                  />
                )}

                {/* Secondary / Tertiary actions */}
                {!primaryAction ? (
                  <div className="celebration-secondary-row">
                    <button
                      type="button"
                      onClick={() => handleAction(handleExplore)}
                      className="celebration-btn-teal"
                    >
                      Home
                    </button>
                    <span className="celebration-secondary-sep" aria-hidden="true">•</span>
                    <button
                      type="button"
                      onClick={() => handleAction(onReplay, true)}
                      className="celebration-btn-replay"
                    >
                      Play Again
                    </button>
                  </div>
                ) : (
                  <div className="celebration-actions-row">
                    <ProfilePillBtn
                      onClick={() => handleAction(onReplay, true)}
                      label="Play Again"
                      size="sm"
                      fullWidth={false}
                      style={getProfilePillBtnStyle(resolvedZoneId, {
                        top: '#E8E1D7',
                        base: '#D6CDC0',
                        shadow: '#AA9F90',
                        glow: 'rgba(170, 159, 144, 0.16)'
                      })}
                    />
                    <ProfilePillBtn
                      onClick={() => handleAction(isFinalScene ? (onHome || onContinue || handleExplore) : onContinue)}
                      label={isFinalScene ? 'Home' : 'Next Adventure'}
                      size="sm"
                      fullWidth={false}
                      style={getProfilePillBtnStyle(resolvedZoneId, {
                        top: '#CFE9E6',
                        base: '#A7D4CE',
                        shadow: '#6EA69E',
                        glow: 'rgba(110, 166, 158, 0.18)'
                      })}
                    />
                    <ProfilePillBtn
                      onClick={() => handleAction(handleExplore)}
                      label="Back to Zone"
                      size="sm"
                      fullWidth={false}
                      style={getProfilePillBtnStyle(resolvedZoneId, {
                        top: '#E8E1D7',
                        base: '#D6CDC0',
                        shadow: '#AA9F90',
                        glow: 'rgba(170, 159, 144, 0.16)'
                      })}
                    />
                  </div>
                )}
              </>

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
          stopAudio={() => {
            document.querySelectorAll('audio').forEach((audio) => {
              audio.pause();
              audio.currentTime = 0;
            });
          }}
          title="Practice Chanting"
          prompt={`Try saying ${selectedApp.toUpperCase()}`}
          onComplete={() => setSelectedApp(null)}
          onSkip={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
};

export default SceneCompletionCelebration;
