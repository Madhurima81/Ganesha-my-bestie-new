// CulturalCelebrationModal.jsx - Adventure Backpack Design (Self-Extracting)
import React, { useState, useEffect } from 'react';
import './CulturalCelebrationModal.css';
import CulturalProgressExtractor from '../../services/CulturalProgressExtractor';

const CulturalCelebrationModal = ({ 
  show = false,
  onClose
}) => {
  // ✨ DISNEY PATTERN: Self-extracting modal (same as GameWelcomeScreen)
  const [culturalData, setCulturalData] = useState(null);
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // ✨ DISNEY PATTERN: Real-time data watching (not one-time extraction)
  useEffect(() => {
    if (show) {
      console.log('🎒 Modal opening - starting real-time data watching');
      
      // Function to extract fresh data
      const extractFreshData = () => {
        const freshData = CulturalProgressExtractor.getCulturalProgressData();
        setCulturalData(freshData);
        console.log('🎒 Real-time update:', {
          symbolsCount: freshData.symbolsCount,
          storiesCount: freshData.storiesCount,
          chantsCount: freshData.chantsCount,
          totalLearnings: freshData.totalLearnings
        });
      };
      
      // Initial extract with delay for stability
      setTimeout(() => {
        extractFreshData();
        setTimeout(() => setShowCelebration(true), 500);
      }, 100);
      
      // ✨ REAL-TIME WATCHING: Listen for localStorage changes
      const handleStorageChange = (e) => {
        // Re-extract when temp sessions or permanent data changes
        if (e.key && (e.key.includes('temp_session') || e.key.includes('gameState'))) {
          console.log('🔄 Storage changed, updating modal data');
          setTimeout(extractFreshData, 50); // Small delay for stability
        }
      };
      
      // ✨ POLLING FALLBACK: Re-extract every 2 seconds while modal open
      const pollingInterval = setInterval(() => {
        console.log('🔄 Polling for fresh data');
        extractFreshData();
      }, 2000);
      
      window.addEventListener('storage', handleStorageChange);
      
      // Cleanup
      return () => {
        clearInterval(pollingInterval);
        window.removeEventListener('storage', handleStorageChange);
      };
      
    } else {
      setSelectedFeeling(null);
      setShowCelebration(false);
      setCulturalData(null);
    }
  }, [show]);

  // ✨ MANUAL REFRESH: For immediate updates
  const refreshData = () => {
    console.log('🔄 Manual refresh triggered');
    const freshData = CulturalProgressExtractor.getCulturalProgressData();
    setCulturalData(freshData);
  };

  // ✨ AUTO-REFRESH on modal focus
  useEffect(() => {
    if (show) {
      const handleFocus = () => {
        console.log('🎯 Modal focused, refreshing data');
        refreshData();
      };
      
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [show]);

  // ✨ DISNEY PATTERN: Use extracted data (same as GameWelcomeScreen)
  const achievements = culturalData ? {
    symbolsCount: culturalData.symbolsCount || 0,
    storiesCount: culturalData.storiesCount || 0,
    shlokasCount: culturalData.chantsCount || 0,
    totalLearnings: culturalData.totalLearnings || 0
  } : {
    symbolsCount: 0,
    storiesCount: 0,
    shlokasCount: 0,
    totalLearnings: 0
  };

  // Cultural level info
  const getCulturalLevelInfo = () => {
    const totalAchievements = achievements.totalLearnings;
    
    if (totalAchievements >= 15) {
      return { title: "Cultural Ambassador", emoji: "🌟", color: "#FFD700" };
    } else if (totalAchievements >= 10) {
      return { title: "Wisdom Keeper", emoji: "🕉️", color: "#FF6B35" };
    } else if (totalAchievements >= 5) {
      return { title: "Symbol Scholar", emoji: "📚", color: "#4ECDC4" };
    } else {
      return { title: "Wisdom Seeker", emoji: "🔍", color: "#45B7D1" };
    }
  };

  const levelInfo = getCulturalLevelInfo();

  // Emotions with character reactions
  const emotions = [
    {
      id: 'happy',
      emoji: '😄',
      label: 'Happy!',
      color: '#FFD93D',
      response: "Your happiness makes my whiskers twitch with joy! 🐭✨",
      animation: 'bounce'
    },
    {
      id: 'proud',
      emoji: '💪',
      label: 'Proud!',
      color: '#FF6B6B',
      response: "Stand tall, little scholar! You're learning your heritage! 🌟",
      animation: 'proud-chest'
    },
    {
      id: 'excited',
      emoji: '🤩',
      label: 'Excited!',
      color: '#4ECDC4',
      response: "Your excitement makes me want to explore more adventures! 🚀",
      animation: 'excited-dance'
    },
    {
      id: 'wise',
      emoji: '🧠',
      label: 'Wise!',
      color: '#95E1D3',
      response: "Yes! Wisdom grows in you like a beautiful lotus! 🪷",
      animation: 'wise-nod'
    }
  ];

  const handleFeelingSelect = (feeling) => {
    setSelectedFeeling(feeling);
  };

  const selectedEmotion = emotions.find(e => e.id === selectedFeeling);

  if (!show) return null;

  // ✨ DISNEY PATTERN: Show loading until data extracted
  if (!culturalData) {
    return (
      <div className="adventure-celebration-overlay" onClick={onClose}>
        <div className="adventure-celebration-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading-cultural-data">
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }}>🎒</div>
              <div style={{ fontSize: '18px', color: '#666', fontFamily: 'Comic Sans MS, cursive' }}>
                Collecting your adventures...
              </div>
              <div style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
                ✨ Finding symbols and stories ✨
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adventure-celebration-overlay" onClick={onClose}>
      <div className="adventure-celebration-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className="adventure-close-btn" onClick={onClose}>×</button>
        
        {/* ✨ DEBUG: Manual refresh button (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <button 
            style={{
              position: 'absolute',
              top: '50px',
              right: '50px',
              background: '#4ECDC4',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              zIndex: 10001
            }}
            onClick={refreshData}
          >
            🔄 Refresh Data
          </button>
        )}
        
        {/* Celebration Effects */}
        <div className="celebration-sparkles">
          <div className="sparkle sparkle-1">✨</div>
          <div className="sparkle sparkle-2">🌟</div>
          <div className="sparkle sparkle-3">⭐</div>
          <div className="sparkle sparkle-4">✨</div>
        </div>

        {/* Main Content - No Scrolling */}
        <div className="adventure-content">
          
          {/* Header Celebration */}
          <div className="adventure-header">
            <h1 className="adventure-title">Amazing Adventures Collected! 🎒</h1>
            <div className="cultural-level-badge" style={{ borderColor: levelInfo.color }}>
              <span className="level-emoji">{levelInfo.emoji}</span>
              <span className="level-title">{levelInfo.title}</span>
            </div>
          </div>

          {/* Main Adventure Display */}
          <div className="adventure-main">
            
            {/* Mooshika Character */}
            <div className="adventure-character">
              <img 
                src="/images/mooshika-coach.webp" 
                alt="Mooshika"
                className={`mooshika-character ${selectedEmotion ? selectedEmotion.animation : 'celebrate'}`}
              />
              
              {selectedEmotion && (
                <div className="character-response">
                  <div className="response-bubble">
                    {selectedEmotion.response}
                  </div>
                </div>
              )}
            </div>

            {/* Adventure Backpack */}
            <div className="adventure-backpack">
              <img 
                src="/images/symbol-backpack.webp" 
                alt="Adventure Backpack"
                className="backpack-image"
              />
              
              {/* Items Inside Backpack */}
              <div className="backpack-contents">
                {/* Sacred Symbols */}
                {achievements.symbolsCount > 0 && (
                  <div className="backpack-item symbols">
                    <div className="item-icon">🕉️</div>
                    <div className="item-count">{achievements.symbolsCount}</div>
                  </div>
                )}
                
                {/* Story Scrolls */}
                {achievements.storiesCount > 0 && (
                  <div className="backpack-item stories">
                    <div className="item-icon">📜</div>
                    <div className="item-count">{achievements.storiesCount}</div>
                  </div>
                )}
                
                {/* Musical Chants */}
                {achievements.shlokasCount > 0 && (
                  <div className="backpack-item chants">
                    <div className="item-icon">🎵</div>
                    <div className="item-count">{achievements.shlokasCount}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Achievement Numbers */}
            <div className="adventure-stats">
              <div className="big-stat">
                <div className="stat-number">{achievements.symbolsCount}</div>
                <div className="stat-label">Sacred Symbols</div>
              </div>
              
              <div className="big-stat">
                <div className="stat-number">{achievements.storiesCount}</div>
                <div className="stat-label">Stories Learned</div>
              </div>
              
              <div className="big-stat">
                <div className="stat-number">{achievements.shlokasCount}</div>
                <div className="stat-label">Chants Mastered</div>
              </div>
            </div>
          </div>

          {/* Feelings Section */}
          {!selectedFeeling && (
            <div className="feelings-section">
              <h3 className="feelings-title">How do you feel about your adventure? 🌟</h3>
              
              <div className="feelings-grid">
                {emotions.map((emotion) => (
                  <div 
                    key={emotion.id}
                    className="feeling-option"
                    style={{ borderColor: emotion.color }}
                    onClick={() => handleFeelingSelect(emotion.id)}
                  >
                    <div className="feeling-emoji">{emotion.emoji}</div>
                    <div className="feeling-label">{emotion.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="adventure-actions">
            <button 
              className="action-btn continue-btn"
              onClick={onClose}
            >
              🚀 Continue Adventure!
            </button>
            
            {achievements.totalLearnings > 0 && (
              <button 
                className="action-btn share-btn"
                onClick={() => {
                  console.log('Share adventure with family!');
                }}
              >
                📧 Share with Family
              </button>
            )}
          </div>

          {/* Motivational Message */}
          {achievements.totalLearnings > 0 && (
            <div className="adventure-motivation">
              <div className="motivation-text">
                "Every symbol you discover makes you wiser! Keep exploring! 🌟"
              </div>
              <div className="motivation-signature">- Mooshika</div>
            </div>
          )}

          {/* ✨ DEBUG INFO (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ 
              position: 'absolute', 
              bottom: '10px', 
              left: '10px', 
              background: 'rgba(0,0,0,0.8)', 
              color: 'white', 
              padding: '8px', 
              borderRadius: '4px', 
              fontSize: '11px',
              fontFamily: 'monospace'
            }}>
              🔍 Debug: S:{achievements.symbolsCount} | St:{achievements.storiesCount} | C:{achievements.shlokasCount} | Total:{achievements.totalLearnings}
            </div>
          )}
        </div>

        {/* Add pulse animation for loading */}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CulturalCelebrationModal;