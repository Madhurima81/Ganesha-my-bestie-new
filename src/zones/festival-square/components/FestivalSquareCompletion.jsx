import React, { useState, useEffect } from 'react';
//import { useGameCoach } from "../coach/GameCoach";
import './FestivalSquareCompletion.css';

// Add these imports at the top of FestivalSquareCompletion.jsx
//import ganeshaMusician from '../assets/images/ganesha-musician.png';
//import musicBadge from '../assets/images/music-badge.png';

const FestivalSquareCompletion = ({ 
  show = false, 
  sceneName = "Piano Mastery",
  sceneNumber = 1,
  totalScenes = 4,
  discoveredBadges = ['musician', 'artist', 'chef', 'decorator'],
  badgeImages = {},
    characterImages = {},    // ADD THIS LINE
  nextSceneName = "Rangoli Artistry",
    onBackToMap,  // ✅ ADD THIS LINE
  onContinue,
  onReplay,
  onExploreZones,
  onViewProgress,
  onHome,
  sceneId = 'piano',
  completionData = null,
  onComplete = null,
  childName = "little musician",
  isFinalScene = false,
  
  // Festival-specific props
  containerType = "musical-stage",     // "musical-stage", "festival-drum", or "celebration-scroll"
  containerImage = null,              
  festivalBadges = {},                // Festival badge mappings
  zoneId = 'festival-square'
}) => {
  const [stage, setStage] = useState('hidden');
  const [badgesOnStage, setBadgesOnStage] = useState([]);
  
  //const { clearManualCloseTracking } = useGameCoach();

  useEffect(() => {
    if (!show) {
      setStage('hidden');
      setBadgesOnStage([]);
      return;
    }

    setStage('celebrating');
    const uniqueBadges = [...new Set(discoveredBadges)];
    
    setTimeout(() => {
      uniqueBadges.forEach((badge, index) => {
        setTimeout(() => {
          setBadgesOnStage(prev => {
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
  // DELETE THESE LINES:
  // if (clearManualCloseTracking) {
  //   clearManualCloseTracking();
  // }
  
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
  const handleBackToMap = () => handleAction(() => console.log('Navigate to zone map'));
  const handleExploreZones = () => handleAction(() => onExploreZones?.());
  const handleViewProgress = () => handleAction(() => onViewProgress?.());
  const handleHome = () => handleAction(() => onHome?.());

  // Helper functions for badge positioning
  const getStagePosition = (index) => {
    const positions = [
      { left: '15%', top: '20%' },
      { left: '45%', top: '15%' },
      { left: '75%', top: '25%' },
      { left: '25%', top: '45%' },
      { left: '65%', top: '50%' },
    ];
    return positions[index] || positions[0];
  };

  if (stage === 'hidden') return null;

  return (
    <>
      <div className={`festival-backdrop stage-${stage}`} />
      
      {/* Musical note sparkles */}
      <div className="musical-sparkles">
        {Array.from({length: 15}).map((_, i) => (
          <div 
            key={i} 
            className="floating-note" 
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              fontSize: `${16 + Math.random() * 12}px`
            }}
          >
            {['🎵', '🎶', '🎼', '🎹', '🥁'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>
      
      <div className={`festival-card stage-${stage}`}>
        
        {/* Card sparkles with festival theme */}
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
        
        {/* Musical Stage Container */}
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
          <div className="musical-stage">
            {/* Stage background */}
            <div className="stage-background">
              <div className="stage-curtains"></div>
              <div className="stage-platform"></div>
            </div>
            
            {/* Festival badges on stage */}
            <div className="stage-badges-overlay">
              {badgesOnStage.map((badge, index) => {
                const position = getStagePosition(index);
                return (
                  <div 
                    key={`stage-${badge}-${index}`}
                    className="stage-badge"
                    style={{
                      position: 'absolute',
                      left: position.left,
                      top: position.top,
                      animation: 'badgeDance 0.8s ease-out both',
                      animationDelay: `${index * 0.2}s`
                    }}
                  >
                    {badgeImages[badge] ? 
                      <img src={badgeImages[badge]} alt={badge} className="badge-img" /> :
                      <span className="badge-emoji">{
                        {
                          musician: '🎹', 
                          artist: '🎨', 
                          chef: '👨‍🍳', 
                          decorator: '🏛️',
                          dancer: '💃',
                          drummer: '🥁'
                        }[badge] || '🎭'
                      }</span>
                    }
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Festival Ganesha */}
        <div className="festival-ganesha-container">
         <div className="festival-ganesha">
<img src={characterImages.ganeshaMusician} alt="Festival Ganesha" /></div>
          
          <div 
            className={`speech-bubble ${stage === 'actions-ready' ? 'stage-actions-ready' : ''}`}
            style={{
              '--bubble-color': stage === 'celebrating' ? '#FF8C00' : '#FFD700',
              '--bubble-border': stage === 'celebrating' ? '#FF6B47' : '#FFA500'
            }}
          >
            <div className="bubble-content">
              {stage === 'celebrating' && (
                <>
                  <div className="bubble-title">Wonderful celebration, {childName}!</div>
                  <div className="bubble-text">
                    {isFinalScene ? 
                      `You mastered the entire Festival Square!` : 
                      `You completed ${sceneName} beautifully!`
                    }
                  </div>
                </>
              )}
              {stage === 'actions-ready' && (
                <>
                  <div className="bubble-title">
                    {isFinalScene ? 'Festival Champion!' : 'Celebration badges earned!'}
                  </div>
                  <div className="bubble-text">
                    {isFinalScene ? 
                      'What joyful adventure calls you next?' : 
                      'Which festive activity shall we try next?'
                    }
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

{/* Action buttons - SIMPLIFIED */}
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
      <div className="btn-subtitle">Replay scene</div>
    </div>
  </button>
  
  <button className="action-btn map-btn" onClick={handleBackToMap}>
    <div className="btn-text">
      <div className="btn-title">Festival Map</div>
      <div className="btn-subtitle">Choose activity</div>
    </div>
  </button>
</div>
      </div>
    </>
  );
};

export default FestivalSquareCompletion;
