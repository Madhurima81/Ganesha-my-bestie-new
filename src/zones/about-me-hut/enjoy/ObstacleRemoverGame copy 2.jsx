// zones/about-me-hut/scenes/scene3/ObstacleRemoverGameRedesigned.jsx
// REDESIGNED: Learn from Ganesha, then input YOUR obstacles with visual transformation

import React, { useState, useEffect, useRef } from 'react';
import './ObstacleRemoverGameRedesigned.css';
import '../../shared/components/OpeningModal.css';
import AboutMeCompletion from '../components/Aboutmecompletion';

// Import images (update paths to match your structure)
// import obstacleBg from './assets/images/obstacle-bg.png';
// import babyGaneshaImg from './assets/images/baby-ganesha.png';

// BeforeAfterScenes Component (adapted for child's obstacles)
const ChildBeforeAfterScene = ({ obstacle, onNext, showControls = true }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [animateTransition, setAnimateTransition] = useState(false);
  const containerRef = useRef(null);

  const updateSliderPosition = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setShowHint(false);
    updateSliderPosition(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (isDragging) updateSliderPosition(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setShowHint(false);
    updateSliderPosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      updateSliderPosition(e.touches[0].clientX);
      e.preventDefault();
    }
  };

  const playShloka = () => {
    setShowHint(false);
    setAnimateTransition(true);
    setSliderPosition(100);
    
    setTimeout(() => {
      setAnimateTransition(false);
    }, 3000);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => isDragging && setIsDragging(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="before-after-scene">
      <h3 className="scene-title">{obstacle.name}</h3>
      
      <div 
        ref={containerRef}
        className="scene-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Before State */}
        <div className="scene-before" style={{ background: '#ffcdd2' }}>
          <div className="scene-emoji">{obstacle.beforeEmoji || '😰'}</div>
          <div className="scene-description">{obstacle.feeling}</div>
        </div>

        {/* After State */}
        <div 
          className="scene-after" 
          style={{ 
            background: '#c8e6c9',
            clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`,
            transition: animateTransition ? 'clip-path 2s ease-in-out' : 'none'
          }}
        >
          <div className="scene-emoji">{obstacle.afterEmoji || '😌'}</div>
          <div className="scene-description">{obstacle.solution}</div>
          
          {sliderPosition > 60 && (
            <div className="ganesha-appears">🐘</div>
          )}
        </div>

        {/* Slider Handle */}
        <div 
          className="slider-handle"
          style={{ 
            left: `${sliderPosition}%`,
            transition: animateTransition ? 'left 2s ease-in-out' : 'none'
          }}
        >
          <div className="handle-circle">↔️</div>
        </div>

        {/* Labels */}
        <div className="scene-label before-label">Before</div>
        <div className="scene-label after-label">After</div>

        {/* Hint */}
        {showHint && (
          <div className="slider-hint">
            <div className="hint-pointer">👆</div>
            <div className="hint-text">Slide to see the change!</div>
          </div>
        )}
      </div>

      <div className="scene-controls">
        <button className="shloka-btn" onClick={playShloka}>
          Say the Shloka! 🙏
        </button>
        {showControls && onNext && (
          <button className="next-obstacle-btn" onClick={onNext}>
            Next Obstacle →
          </button>
        )}
      </div>

      <div className="shloka-text">
        "Vakratunda Mahakaya Suryakoti Samaprabha<br />
        Nirvighnam Kuru Me Deva Sarva-Kaaryeshu Sarvada"
      </div>
    </div>
  );
};

const ObstacleRemoverGameRedesigned = ({ onComplete, onBack, onNavigate }) => {
  const [gamePhase, setGamePhase] = useState('intro');
  // Phases: intro, learn-ganesha, input-obstacle-1, view-obstacle-1, input-obstacle-2, view-obstacle-2, 
  // input-obstacle-3, view-obstacle-3, power-plan, completion
  
  const [obstacles, setObstacles] = useState([
    { name: '', feeling: '', solution: '', beforeEmoji: '😰', afterEmoji: '😌' },
    { name: '', feeling: '', solution: '', beforeEmoji: '😰', afterEmoji: '😌' },
    { name: '', feeling: '', solution: '', beforeEmoji: '😰', afterEmoji: '😌' }
  ]);
  
  const [currentObstacleIndex, setCurrentObstacleIndex] = useState(0);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [gameState, setGameState] = useState({
    stars: 3,
    completed: false
  });

  // Ganesha's example obstacles
  const ganeshaObstacles = [
    {
      name: "Mountain Blocking the Path",
      feeling: "A huge mountain blocks my way. I cannot pass through!",
      solution: "With my strength and wisdom, I find a way around or through any obstacle!",
      beforeEmoji: '🏔️',
      afterEmoji: '🛤️'
    },
    {
      name: "Difficult Problem to Solve",
      feeling: "This puzzle is so complex, I don't know where to start.",
      solution: "I break it down into smaller parts and solve each one step by step!",
      beforeEmoji: '🤯',
      afterEmoji: '💡'
    }
  ];

  // Common obstacle suggestions
  const obstacleOptions = [
    "Homework is too hard",
    "Making new friends",
    "Feeling nervous about tests",
    "Cleaning my room",
    "Learning something new",
    "Sharing with others",
    "Trying new foods",
    "Going to sleep on time"
  ];

  const handleStartGame = () => {
    setGamePhase('learn-ganesha');
  };

  const handleLearnComplete = () => {
    setGamePhase('input-obstacle-1');
    setCurrentObstacleIndex(0);
  };

  const handleObstacleInput = (field, value) => {
    const newObstacles = [...obstacles];
    newObstacles[currentObstacleIndex][field] = value;
    setObstacles(newObstacles);
  };

  const handleObstacleSubmit = () => {
    const current = obstacles[currentObstacleIndex];
    if (!current.name || !current.feeling || !current.solution) {
      alert('Please fill in all fields!');
      return;
    }

    // Move to view phase
    setGamePhase(`view-obstacle-${currentObstacleIndex + 1}`);
  };

  const handleNextObstacle = () => {
    if (currentObstacleIndex < 2) {
      // Move to next obstacle input
      setCurrentObstacleIndex(currentObstacleIndex + 1);
      setGamePhase(`input-obstacle-${currentObstacleIndex + 2}`);
    } else {
      // All 3 obstacles done, show power plan
      setGamePhase('power-plan');
    }
  };

  const handlePowerPlanComplete = () => {
    // Save data
    saveObstacleData();
    
    // Move to completion
    setGameState(prev => ({ ...prev, completed: true }));
    setShowSceneCompletion(true);
  };

  const saveObstacleData = () => {
    const profileId = localStorage.getItem('activeProfileId');
    if (!profileId) return;

    const profile = JSON.parse(localStorage.getItem(`profile_${profileId}`) || '{}');
    if (!profile.aboutMeHut) profile.aboutMeHut = {};
    profile.aboutMeHut.obstacles = obstacles.filter(o => o.name); // Only save filled obstacles

    localStorage.setItem(`profile_${profileId}`, JSON.stringify(profile));
  };

  return (
    <div className="obstacle-remover-game-redesigned">
      {/* Back Button */}
      {!showSceneCompletion && (
        <button className="back-btn" onClick={onBack}>← Back</button>
      )}

      {/* ========================================
          INTRO - OPENING SCREEN (Festival Piano Style)
          ======================================== */}
      {gamePhase === 'intro' && (
        <div className="game-modal-overlay">
          <div className="game-modal-content">
            <div className="game-modal-character">
              <div className="ganesha-emoji">🐘</div>
            </div>

            <div className="game-modal-card">
              <h1 className="game-modal-title">Obstacle Remover! 🪨</h1>
              <p className="game-modal-subtitle">
                I remove obstacles from everyone's path! Let me show you how, 
                then we'll work on YOUR obstacles together!
              </p>

              <div className="game-modal-icons">
                <div className="game-modal-icon-item">
                  <div style={{ fontSize: '80px' }}>📚</div>
                  <span className="game-modal-icon-label">Learn from Ganesha</span>
                </div>
                <div className="game-modal-icon-item">
                  <div style={{ fontSize: '80px' }}>✍️</div>
                  <span className="game-modal-icon-label">Your Obstacles</span>
                </div>
                <div className="game-modal-icon-item">
                  <div style={{ fontSize: '80px' }}>💪</div>
                  <span className="game-modal-icon-label">Power Plan!</span>
                </div>
              </div>

              <button className="game-modal-button" onClick={handleStartGame}>
                Let's Begin! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          LEARN: Ganesha's Obstacles (2 Examples)
          ======================================== */}
      {gamePhase === 'learn-ganesha' && (
        <div className="learn-section">
          <h2 className="section-title">How Ganesha Removes Obstacles 🐘</h2>
          <p className="section-subtitle">Watch how obstacles transform!</p>

          <div className="ganesha-examples">
            <ChildBeforeAfterScene 
              obstacle={ganeshaObstacles[0]} 
              showControls={false}
            />
            
            <div className="example-divider">
              <span>AND</span>
            </div>

            <ChildBeforeAfterScene 
              obstacle={ganeshaObstacles[1]} 
              showControls={false}
            />
          </div>

          <div className="learn-complete">
            <p className="learn-message">Now let's work on YOUR obstacles! 💪</p>
            <button className="continue-btn" onClick={handleLearnComplete}>
              Share My Obstacles →
            </button>
          </div>
        </div>
      )}

      {/* ========================================
          INPUT: Child's Obstacle (3 Times)
          ======================================== */}
      {(gamePhase === 'input-obstacle-1' || gamePhase === 'input-obstacle-2' || gamePhase === 'input-obstacle-3') && (
        <div className="input-section">
          <h2 className="section-title">Your Obstacle {currentObstacleIndex + 1} of 3</h2>
          <div className="progress-indicator">
            {[0, 1, 2].map(i => (
              <div key={i} className={`progress-dot ${i <= currentObstacleIndex ? 'active' : ''}`}>
                {i < currentObstacleIndex ? '✓' : i + 1}
              </div>
            ))}
          </div>

          <div className="input-form">
            <div className="form-field">
              <label>🎯 What's something hard for you?</label>
              <div className="quick-options">
                {obstacleOptions.map(option => (
                  <button
                    key={option}
                    className="quick-option"
                    onClick={() => handleObstacleInput('name', option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={obstacles[currentObstacleIndex].name}
                onChange={(e) => handleObstacleInput('name', e.target.value)}
                placeholder="Or type your own..."
              />
            </div>

            <div className="form-field">
              <label>😰 How does it make you feel?</label>
              <textarea
                value={obstacles[currentObstacleIndex].feeling}
                onChange={(e) => handleObstacleInput('feeling', e.target.value)}
                placeholder="I feel worried and stuck..."
                rows="3"
              />
            </div>

            <div className="form-field">
              <label>🌟 What would help you?</label>
              <textarea
                value={obstacles[currentObstacleIndex].solution}
                onChange={(e) => handleObstacleInput('solution', e.target.value)}
                placeholder="I could ask for help..."
                rows="3"
              />
            </div>

            <button className="submit-obstacle-btn" onClick={handleObstacleSubmit}>
              See My Transformation! ✨
            </button>
          </div>
        </div>
      )}

      {/* ========================================
          VIEW: Child's Obstacle Transformation
          ======================================== */}
      {(gamePhase === 'view-obstacle-1' || gamePhase === 'view-obstacle-2' || gamePhase === 'view-obstacle-3') && (
        <div className="view-section">
          <h2 className="section-title">Your Transformation! ✨</h2>
          <ChildBeforeAfterScene 
            obstacle={obstacles[currentObstacleIndex]}
            onNext={handleNextObstacle}
            showControls={true}
          />
        </div>
      )}

      {/* ========================================
          POWER PLAN: Summary of All 3 Obstacles
          ======================================== */}
      {gamePhase === 'power-plan' && (
        <div className="power-plan-section">
          <div className="power-plan-header">
            <h2 className="section-title">Your Power Plan! 💪</h2>
            <p className="section-subtitle">You've learned how to overcome these obstacles!</p>
          </div>

          <div className="obstacles-summary">
            {obstacles.filter(o => o.name).map((obstacle, index) => (
              <div key={index} className="obstacle-card">
                <div className="obstacle-number">{index + 1}</div>
                <div className="obstacle-info">
                  <h3 className="obstacle-title">{obstacle.name}</h3>
                  <div className="obstacle-transformation">
                    <div className="before-state">
                      <span className="state-label">Before:</span>
                      <p>{obstacle.feeling}</p>
                    </div>
                    <div className="arrow">→</div>
                    <div className="after-state">
                      <span className="state-label">After:</span>
                      <p>{obstacle.solution}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="power-message">
            <p className="power-text">
              🙏 Remember: When you face these obstacles, say the Ganesha Shloka 
              and use your power plan! You can overcome anything! 💪
            </p>
            <button className="complete-game-btn" onClick={handlePowerPlanComplete}>
              Complete! 🎉
            </button>
          </div>
        </div>
      )}

      {/* ========================================
          SCENE COMPLETION (From Your Obstacle Game)
          ======================================== */}
      {showSceneCompletion && (
        <AboutMeCompletion
          show={showSceneCompletion}
          sceneName="Obstacle Remover"
          sceneNumber={3}
          totalScenes={4}
          starsEarned={gameState.stars}
          totalStars={3}
          discoveredBadges={['obstacle-overcomer', 'problem-solver', 'brave-warrior']}
          badgeImages={{}}
          characterImages={{
            // babyGanesha: babyGaneshaImg // Add when you have the image
          }}
          nextSceneName="My Passport"
          childName="obstacle overcomer"
          
          onContinue={() => {
            console.log('🪨 OBSTACLE CONTINUE: Moving to next game');
            setTimeout(() => {
              if (onNavigate) {
                onNavigate('game4');
              } else if (onComplete) {
                onComplete();
              }
            }, 100);
          }}
          
          onReplay={() => {
            console.log('🎮 OBSTACLE REPLAY: Play Again');
            setGamePhase('intro');
            setObstacles([
              { name: '', feeling: '', solution: '', beforeEmoji: '😰', afterEmoji: '😌' },
              { name: '', feeling: '', solution: '', beforeEmoji: '😰', afterEmoji: '😌' },
              { name: '', feeling: '', solution: '', beforeEmoji: '😰', afterEmoji: '😌' }
            ]);
            setCurrentObstacleIndex(0);
            setShowSceneCompletion(false);
            setGameState({ stars: 3, completed: false });
          }}
          
          onBackToMap={() => {
            console.log('🗺️ OBSTACLE MAP: Back to About Me Hut');
            if (onNavigate) {
              onNavigate('zone-welcome');
            } else if (onBack) {
              onBack();
            }
          }}
          
          onHome={() => {
            if (onNavigate) {
              onNavigate('home');
            }
          }}
        />
      )}
    </div>
  );
};

export default ObstacleRemoverGameRedesigned;