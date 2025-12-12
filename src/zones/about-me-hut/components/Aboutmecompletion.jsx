import React, { useState, useEffect } from 'react';
import './AboutMeCompletion.css';

const AboutMeCompletion = ({ 
  show = false, 
  sceneName = "Family Tree",
  sceneNumber = 1,
  totalScenes = 4,
  starsEarned = 4,
  totalStars = 4,
  discoveredBadges = ['family-explorer', 'tree-builder', 'love-care', 'memory-keeper'],
  badgeImages = {},
  characterImages = {},
  nextSceneName = "My Favorite Things",
  onBackToMap,
  onContinue,
  onReplay,
  onHome,
  sceneId = 'family-tree',
  completionData = null,
  onComplete = null,
  childName = "little one",
  isFinalScene = false,
  
  // Hut-specific props
  containerType = "cozy-hut-interior",
  containerImage = null,
  hutBadges = {},
  zoneId = 'about-me-hut'
}) => {
  const [stage, setStage] = useState('hidden');
  const [badgesOnWall, setBadgesOnWall] = useState([]);

  useEffect(() => {
    if (!show) {
      setStage('hidden');
      setBadgesOnWall([]);
      return;
    }

    setStage('celebrating');
    const uniqueBadges = [...new Set(discoveredBadges)];
    
    setTimeout(() => {
      uniqueBadges.forEach((badge, index) => {
        setTimeout(() => {
          setBadgesOnWall(prev => {
            if (prev.includes(badge)) return prev;
            return [...prev, badge];
          });
        }, index * 500);
      });
    }, 500);

    setTimeout(() => {
      setStage('actions-ready');
    }, 500 + (uniqueBadges.length * 500) + 2500);

  }, [show, discoveredBadges]);

  const handleAction = (actionCallback, skipComplete = false) => {
    setStage('exiting');
    setTimeout(() => {
      if (!skipComplete && onComplete && completionData) {
        onComplete(sceneId, completionData);
      }
      actionCallback?.();
    }, 400);
  };

  const handleContinue = () => handleAction(() => onContinue?.());
  const handleReplay = () => handleAction(() => onReplay?.(), true);
  const handleBackToMap = () => handleAction(() => onBackToMap?.());
  const handleHome = () => handleAction(() => onHome?.());

  // Helper functions for badge positioning on walls
  const getWallPosition = (index) => {
    const positions = [
      { left: '12%', top: '15%' },
      { left: '42%', top: '10%' },
      { left: '72%', top: '18%' },
      { left: '22%', top: '45%' },
      { left: '60%', top: '50%' },
    ];
    return positions[index] || positions[0];
  };

  if (stage === 'hidden') return null;

  return (
    <>
      <div className={`hut-backdrop stage-${stage}`} />
      
      {/* Floating hearts sparkles */}
      <div className="hut-sparkles">
        {Array.from({length: 12}).map((_, i) => (
          <div 
            key={i} 
            className="floating-heart" 
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              fontSize: `${18 + Math.random() * 14}px`
            }}
          >
            {['💖', '💝', '🏡', '👨‍👩‍👦', '🌟'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>
      
      <div className={`hut-card stage-${stage}`}>
        
        {/* Card sparkles with warm theme */}
        <div className="card-sparkles">
          {Array.from({length: 10}).map((_, i) => (
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
        
        {/* Cozy Hut Interior Container */}
        <div 
          className={`container-holder ${containerType}`}
          style={{
            width: '320px',
            height: '280px',
            position: 'absolute',
            left: '20px',
            top: '10px'
          }}
        >
          <div className="cozy-hut-interior">
            {/* Wooden walls texture */}
            <div className="hut-wooden-walls"></div>
            
            {/* Lantern glow */}
            <div className="hut-lantern-glow"></div>
            
            {/* Window */}
            <div className="hut-window"></div>
            
            {/* Floor */}
            <div className="hut-floor"></div>
            
            {/* Family badges on wall (like photo frames) */}
            <div className="hut-badges-wall">
              {badgesOnWall.map((badge, index) => {
                const position = getWallPosition(index);
                return (
                  <div 
                    key={`wall-${badge}-${index}`}
                    className="wall-badge"
                    style={{
                      position: 'absolute',
                      left: position.left,
                      top: position.top,
                      animation: 'badgeHang 0.8s ease-out both',
                      animationDelay: `${index * 0.2}s`
                    }}
                  >
                    <div className="badge-frame">
                      {badgeImages[badge] ? 
                        <img src={badgeImages[badge]} alt={badge} className="badge-img" /> :
                        <span className="badge-emoji">{
                          {
                            'family-explorer': '👨‍👩‍👦', 
                            'tree-builder': '🌳', 
                            'love-care': '💝', 
                            'memory-keeper': '⭐',
                            'story-teller': '📖',
                            'happy-helper': '🤗'
                          }[badge] || '🏡'
                        }</span>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Baby Ganesha in Hut */}
        <div className="hut-ganesha-container">
          <div className="hut-ganesha">
            <img src={characterImages.babyGanesha} alt="Baby Ganesha" />
          </div>
          
          <div 
            className={`speech-bubble ${stage === 'actions-ready' ? 'stage-actions-ready' : ''}`}
            style={{
              '--bubble-color': stage === 'celebrating' ? '#FF8C69' : '#FFB6C1',
              '--bubble-border': stage === 'celebrating' ? '#CD5C5C' : '#FF69B4'
            }}
          >
            <div className="bubble-content">
              {stage === 'celebrating' && (
                <>
                  <div className="bubble-title">Beautiful work, {childName}!</div>
                  <div className="bubble-text">
                    {isFinalScene ? 
                      `You explored my whole world!` : 
                      `You completed ${sceneName} wonderfully!`
                    }
                  </div>
                </>
              )}
              {stage === 'actions-ready' && (
                <>
                  <div className="bubble-title">
                    {isFinalScene ? 'About Me Champion!' : 'Family memories made!'}
                  </div>
                  <div className="bubble-text">
                    {isFinalScene ? 
                      'What adventure shall we try next?' : 
                      'Ready for more fun together?'
                    }
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="action-buttons">
          <button className="action-btn continue-btn" onClick={handleContinue}>
            <div className="btn-text">
              <div className="btn-title">Continue</div>
              <div className="btn-subtitle">{nextSceneName}</div>
            </div>
          </button>
          
          <button className="action-btn replay-btn" onClick={handleReplay}>
            <div className="btn-text">
              <div className="btn-title">Play Again</div>
              <div className="btn-subtitle">Replay game</div>
            </div>
          </button>
          
          <button className="action-btn map-btn" onClick={handleBackToMap}>
            <div className="btn-text">
              <div className="btn-title">Hut Map</div>
              <div className="btn-subtitle">Choose activity</div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default AboutMeCompletion;