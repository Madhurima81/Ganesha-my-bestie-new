// ZoneCompletionCelebration.jsx - Epic effects + Clean card UI
import React, { useState, useEffect } from 'react';
import './ZoneCompletionCelebration.css';
import EnhancedDivineBlessing from './EnhancedDivineBlessing';

const ZoneCompletionCelebration = ({
  show = false,
  zoneId = 'symbol-mountain',
  playerName = 'little explorer',
  discoveredSymbols = [],
  onComplete,
  onContinueExploring,
  onViewProgress
}) => {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [showBlessing, setShowBlessing] = useState(false);
  const [showManifiestation, setShowManifiestation] = useState(false);
  const [showCard, setShowCard] = useState(false);

  // Zone-specific configurations
  const ZONE_CONFIGS = {
    'symbol-mountain': {
      title: 'Guardian of Sacred Symbols',
      subtitle: 'Symbol Mountain',
      icon: '⛰️',
      blessing: `Divine Child ${playerName}, you have mastered the ancient symbols! You carry the wisdom of Symbol Mountain within your heart!`,
      achievement: 'Master of 8 Sacred Symbols',
      symbolEmojis: ['🕉️', '🐘', '🪷', '🦷', '👁️', '👂', '🍯', '🫄'],
      realmColor: '#FFD700',
      ganeshaForm: '🐘',
      bubbleColor: '#4CAF50',
      bubbleBorder: '#45a049'
    },
    'meaning-cave': {
      title: 'Keeper of Ancient Stories',
      subtitle: 'Meaning Cave',
      icon: '🏔️',
      blessing: `Wise ${playerName}, you have unlocked the sacred stories! The ancient tales live within your spirit!`,
      achievement: 'Guardian of Sacred Tales',
      symbolEmojis: ['📜', '🏺', '💎', '🔥', '🌟', '📖', '🗿', '⚡'],
      realmColor: '#8A2BE2',
      ganeshaForm: '🐘',
      bubbleColor: '#8A2BE2',
      bubbleBorder: '#7B68EE'
    },
    'festival-square': {
      title: 'Master of Celebrations',
      subtitle: 'Festival Square',
      icon: '🎪',
      blessing: `Joyful ${playerName}, you have learned the art of celebration! May every day be a festival in your heart!`,
      achievement: 'Champion of Joy',
      symbolEmojis: ['🎉', '🎊', '🪔', '🎭', '🥳', '🎨', '🌈', '💃'],
      realmColor: '#FF1493',
      ganeshaForm: '🐘',
      bubbleColor: '#FF1493',
      bubbleBorder: '#FF69B4'
    },
    'shloka-river': {
      title: 'Voice of Sacred Songs',
      subtitle: 'Shloka River',
      icon: '🌊',
      blessing: `Melodious ${playerName}, you have found your divine voice! The sacred songs flow through you like a river!`,
      achievement: 'Master of Divine Music',
      symbolEmojis: ['🎵', '🎶', '🌊', '🎤', '🔔', '📯', '🎼', '💫'],
      realmColor: '#00CED1',
      ganeshaForm: '🐘',
      bubbleColor: '#00CED1',
      bubbleBorder: '#20B2AA'
    }
  };

  const config = ZONE_CONFIGS[zoneId] || ZONE_CONFIGS['symbol-mountain'];

  // Simplified 2-Phase timing
  const PHASE_DURATIONS = {
    1: 6000,  // Divine blessing + manifestation
    2: 8000   // Clean card display
  };

  useEffect(() => {
    if (!show) {
      setCurrentPhase(1);
      setShowBlessing(false);
      setShowManifiestation(false);
      setShowCard(false);
      return;
    }

    console.log(`🌌 Starting Zone Completion for ${zoneId}`);

    // Phase 1: Cosmic Divine Blessing + Epic Manifestation
    setShowBlessing(true);
    setCurrentPhase(1);

    // Start manifestation quickly after blessing
    const manifestationTimer = setTimeout(() => {
      setShowManifiestation(true);
    }, PHASE_DURATIONS[1] * 0.3);

    // Phase 2: Clean Card Display
    const cardTimer = setTimeout(() => {
      setCurrentPhase(2);
      setShowCard(true);
      setShowManifiestation(false); // Hide epic effects
      setShowBlessing(false);
    }, PHASE_DURATIONS[1]);

    // Cleanup timers
    return () => {
      clearTimeout(manifestationTimer);
      clearTimeout(cardTimer);
    };
  }, [show, zoneId]);

  const handleBlessingComplete = () => {
    console.log('🎆 Cosmic blessing phase complete');
  };

  const handleNextAdventure = () => {
    console.log('🗺️ Next Adventure clicked');
    onContinueExploring?.();
  };

  const handleCelebrateAgain = () => {
    console.log('🎉 Celebrate Again clicked');
    // Reset to show celebration again
    setCurrentPhase(1);
    setShowBlessing(true);
    setShowManifiestation(false);
    setShowCard(false);
    
    setTimeout(() => {
      setShowManifiestation(true);
    }, PHASE_DURATIONS[1] * 0.3);
    
    setTimeout(() => {
      setShowCard(true);
      setShowManifiestation(false);
      setShowBlessing(false);
    }, PHASE_DURATIONS[1]);
  };

  const handleHome = () => {
    console.log('🏠 Home clicked');
    onComplete?.();
  };

  // Generate sparkle positions for card
  const generateSparkles = () => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
      delay: `${Math.random() * 3}s`
    }));
  };

  const [sparkles] = useState(generateSparkles);

  if (!show) return null;

  return (
    <div className="zone-completion-celebration">
      {/* Phase 1: Enhanced Cosmic Divine Blessing */}
      <EnhancedDivineBlessing
        show={showBlessing}
        duration={PHASE_DURATIONS[1]}
        intensity="COSMIC"
        zoneId={zoneId}
        playerName={playerName}
        discoveredSymbols={config.symbolEmojis}
        onComplete={handleBlessingComplete}
      />

      {/* Phase 1: Divine Manifestation & Epic Effects */}
      {showManifiestation && (
        <div className="divine-manifestation-overlay">
          <div className="manifestation-container">
            {/* Divine Ganesha Manifestation */}
            <div className="divine-ganesha-large">
              <div 
                className="ganesha-cosmic"
                style={{ color: config.realmColor }}
              >
                {config.ganeshaForm}
              </div>
              <div className="divine-aura-rings">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div 
                    key={i}
                    className={`aura-ring ring-${i + 1}`}
                    style={{ borderColor: `${config.realmColor}40` }}
                  />
                ))}
              </div>
            </div>

            {/* Title Granting Ceremony */}
            <div className="title-granting">
              <div 
                className="divine-title"
                style={{ color: config.realmColor }}
              >
                {config.title}
              </div>
              <div className="title-subtitle">
                Granted to {playerName}
              </div>
              <div className="achievement-badge">
                <div 
                  className="badge-icon"
                  style={{ backgroundColor: config.realmColor }}
                >
                  ⭐
                </div>
                <div className="badge-text">{config.achievement}</div>
              </div>
            </div>

            {/* Divine Blessing Speech */}
            <div className="divine-blessing-speech">
              <div className="blessing-text">
                {config.blessing}
              </div>
              <div className="blessing-signature">
                — Lord Ganesha
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: Clean Card Display */}
      {showCard && (
        <>
          {/* Card backdrop */}
          <div className="zone-card-backdrop" />
          
          {/* Main zone completion card */}
          <div className="zone-celebration-card">
            {/* Card sparkles */}
            <div className="zone-card-sparkles">
              {sparkles.map(sparkle => (
                <div
                  key={sparkle.id}
                  className="zone-card-sparkle"
                  style={{
                    top: sparkle.top,
                    left: sparkle.left,
                    animationDelay: sparkle.delay
                  }}
                >
                  ✨
                </div>
              ))}
            </div>

            {/* Zone title section */}
            <div className="zone-title-section">
              <div className="zone-title">
                {config.title}
              </div>
              <div className="zone-subtitle">
                <span className="zone-icon">{config.icon}</span>
                {config.subtitle}
              </div>
            </div>

            {/* Achievement display */}
            <div className="zone-achievement-display">
              <div className="achievement-title">
                Sacred Symbols Mastered:
              </div>
              <div className="achievement-symbols">
                {config.symbolEmojis.map((symbol, i) => (
                  <div 
                    key={i} 
                    className="achievement-symbol"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {symbol}
                  </div>
                ))}
              </div>
              <div className="achievement-stats">
                <span className="stars-earned">{starsEarned}/{totalStars} ⭐</span> 
                • Zone Complete!
              </div>
            </div>

            {/* Character celebration */}
            <div className="zone-character-container">
              <div 
                className="zone-ganesha"
                style={{ color: config.realmColor }}
              >
                {config.ganeshaForm}
              </div>
              
              {/* Zone speech bubble */}
              <div 
                className="zone-speech-bubble"
                style={{
                  '--bubble-color': config.bubbleColor,
                  '--bubble-border': config.bubbleBorder
                }}
              >
                <div className="zone-bubble-title">
                  Amazing work, {playerName}!
                </div>
                <div className="zone-bubble-text">
                  You're a true guardian of wisdom!
                </div>
              </div>
            </div>

            {/* Zone action buttons */}
            <div className="zone-action-buttons">
              <button 
                className="zone-action-btn next-adventure-btn"
                onClick={handleNextAdventure}
              >
                <div className="zone-btn-title">🌟 Next Adventure!</div>
                <div className="zone-btn-subtitle">Choose another zone</div>
              </button>
              
              <button 
                className="zone-action-btn celebrate-again-btn"
                onClick={handleCelebrateAgain}
              >
                <div className="zone-btn-title">🎉 Celebrate Again!</div>
                <div className="zone-btn-subtitle">Watch victory again</div>
              </button>
              
              <button 
                className="zone-action-btn home-btn"
                onClick={handleHome}
              >
                <div className="zone-btn-title">🏠 Home</div>
                <div className="zone-btn-subtitle">Back to start</div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ZoneCompletionCelebration;
