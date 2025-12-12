import React, { useState, useEffect } from 'react';
import './ObstacleRemoverGame.css';
import AboutMeCompletion from "../components/Aboutmecompletion";

// Import images - using enjoy folder assets
import enjoyBg from './assets/images/enjoy-bg.png'; // Background
import babyGaneshaSitting from './assets/images/baby-ganesha-sit.png';
// import babyGaneshaBlessing from './assets/images/baby-ganesha-blessing.png'; // TODO: Create this

// Obstacle images - ✅ ACTUAL ASSETS
import woodenLog from './assets/images/log.png';
import roundStone from './assets/images/stone.png';
import darkCloud from './assets/images/cloud.png';

// Badge image - TODO: Create this
// import obstacleRemoverBadge from './assets/images/obstacle-remover-badge.png';

const ObstacleRemoverGame = ({ onComplete, onBack, onNavigate }) => {
  const [gamePhase, setGamePhase] = useState('intro'); // intro, playing, clearing-1, clearing-2, clearing-3, blessing, complete
  const [clearedObstacles, setClearedObstacles] = useState(new Set());
  const [selectedValue, setSelectedValue] = useState(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [gameState, setGameState] = useState({
    stars: 3, // 3 obstacles cleared = 3 stars
    completed: false
  });

  // Obstacle-Value mapping
  const obstacles = [
    {
      id: 'cloud',
      name: 'Dark Cloud',
      emoji: '☁️',
      image: darkCloud, // ✅ Using actual asset
      position: { top: '20%', right: '15%' },
      value: 'joy',
      clearMessage: 'The cloud brightens and disappears! ☀️'
    },
    {
      id: 'stone',
      name: 'Round Stone',
      emoji: '🪨',
      image: roundStone, // ✅ Using actual asset
      position: { bottom: '30%', left: '15%' },
      value: 'peace',
      clearMessage: 'The stone softens and dissolves! ✨'
    },
    {
      id: 'log',
      name: 'Wooden Log',
      emoji: '🪵',
      image: woodenLog, // ✅ Using actual asset
      position: { top: '40%', left: '25%' },
      value: 'love',
      clearMessage: 'The log floats up and vanishes! 💫'
    }
  ];

  // Value bubbles
  const values = [
    {
      id: 'love',
      name: 'Love',
      emoji: '❤️',
      color: '#FF69B4',
      glow: 'rgba(255, 105, 180, 0.6)'
    },
    {
      id: 'joy',
      name: 'Joy',
      emoji: '💛',
      color: '#FFD700',
      glow: 'rgba(255, 215, 0, 0.6)'
    },
    {
      id: 'peace',
      name: 'Peace',
      emoji: '💙',
      color: '#4682B4',
      glow: 'rgba(70, 130, 180, 0.6)'
    }
  ];

  // Start game after intro
  const handleStartGame = () => {
    setGamePhase('playing');
  };

  // Handle value bubble click
  const handleValueClick = (valueId) => {
    // Find which obstacle this value clears
    const obstacleToRemove = obstacles.find(obs => obs.value === valueId);
    
    if (!obstacleToRemove || clearedObstacles.has(obstacleToRemove.id)) {
      return; // Already cleared or invalid
    }

    // Mark obstacle as being cleared
    setSelectedValue(valueId);
    setShowSparkles(true);

    // Add to cleared obstacles
    setTimeout(() => {
      setClearedObstacles(prev => new Set([...prev, obstacleToRemove.id]));
      setShowSparkles(false);
      
      // Check if all obstacles cleared
      if (clearedObstacles.size + 1 === obstacles.length) {
        setTimeout(() => {
          setGamePhase('blessing');
          
          // Move to completion
          setTimeout(() => {
            setGamePhase('complete');
            setGameState(prev => ({ ...prev, completed: true }));
            
            setTimeout(() => {
              setShowSceneCompletion(true);
            }, 2500);
          }, 3000);
        }, 1000);
      } else {
        setSelectedValue(null);
      }
    }, 1200);
  };

  // Get available values (not yet used)
  const availableValues = values.filter(v => {
    const obstacle = obstacles.find(obs => obs.value === v.id);
    return !clearedObstacles.has(obstacle.id);
  });

  return (
    <div className="obstacle-remover-game">
      {/* Background - gets brighter as obstacles clear */}
      <div 
        className={`game-background ${clearedObstacles.size === obstacles.length ? 'golden' : ''}`}
        style={{
          backgroundImage: `url(${enjoyBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: `brightness(${1 + (clearedObstacles.size * 0.15)})`
        }}
      >
      </div>

      {/* Intro Screen */}
      {gamePhase === 'intro' && (
        <div className="intro-overlay">
          <img 
            src={babyGaneshaSitting} 
            alt="Baby Ganesha" 
            className="intro-ganesha bounce"
          />
          <div className="intro-speech">
            <p className="intro-text">Let's remove the obstacles with my special powers!</p>
            <button className="start-btn" onClick={handleStartGame}>
              Let's Start! 🪔
            </button>
          </div>
        </div>
      )}

      {/* Back Button */}
      {gamePhase !== 'intro' && !showSceneCompletion && (
        <button className="back-btn" onClick={onBack}>← Back</button>
      )}

      {/* Playing Phase */}
      {(gamePhase === 'playing' || selectedValue) && (
        <>
          {/* Baby Ganesha in center */}
          <div className="ganesha-center">
            <img 
              src={babyGaneshaSitting} 
              alt="Baby Ganesha" 
              className={`ganesha-sitting ${showSparkles ? 'glowing' : ''}`}
            />
          </div>

          {/* Obstacles */}
          {obstacles.map(obstacle => !clearedObstacles.has(obstacle.id) && (
            <div
              key={obstacle.id}
              className={`obstacle ${selectedValue === obstacle.value ? 'clearing' : ''}`}
              style={obstacle.position}
            >
              {/* Actual obstacle image! ✅ */}
              <img 
                src={obstacle.image} 
                alt={obstacle.name} 
                className="obstacle-image"
              />
              
              {/* Sparkles when clearing */}
              {selectedValue === obstacle.value && showSparkles && (
                <div className="clear-sparkles">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="sparkle-particle"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 0.3}s`
                      }}
                    >
                      ✨
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Value Bubbles */}
          <div className="values-container">
            <p className="instruction-text">
              {clearedObstacles.size === 0 
                ? "Tap a value to clear obstacles!"
                : `${obstacles.length - clearedObstacles.size} obstacle${obstacles.length - clearedObstacles.size > 1 ? 's' : ''} left!`}
            </p>
            
            <div className="values-bubbles">
              {availableValues.map((value, index) => (
                <button
                  key={value.id}
                  className="value-bubble bounce-gentle"
                  onClick={() => handleValueClick(value.id)}
                  style={{
                    '--bubble-color': value.color,
                    '--bubble-glow': value.glow,
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  <div className="bubble-emoji">{value.emoji}</div>
                  <div className="bubble-name">{value.name}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Blessing Phase */}
      {gamePhase === 'blessing' && (
        <div className="blessing-screen">
          {/* Golden light rays */}
          <div className="golden-light"></div>
          
          {/* Ganesha blessing pose */}
          <div className="ganesha-blessing">
            <img 
              src={babyGaneshaSitting} 
              alt="Ganesha Blessing" 
              className="ganesha-blessing-pose"
            />
          </div>

          {/* Blessing message */}
          <div className="blessing-message fade-in">
            <p className="blessing-text">
              "With joy, peace and love…<br/>obstacles go away!"
            </p>
          </div>

          {/* Ambient sparkles */}
          <div className="ambient-sparkles">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="ambient-sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                ✨
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Phase */}
      {gamePhase === 'complete' && !showSceneCompletion && (
        <div className="complete-screen">
          <div className="golden-light"></div>
          
          <div className="ganesha-final">
            <img 
              src={babyGaneshaSitting} 
              alt="Ganesha" 
              className="ganesha-final-pose"
            />
          </div>

          <div className="completion-badge pop-in">
            <div className="badge-icon">🪔</div>
            <div className="badge-text">Obstacle Remover!</div>
          </div>

          <div className="final-message">
            <p>All obstacles are cleared! 🌟</p>
          </div>
        </div>
      )}

      {/* About Me Completion Screen */}
      {showSceneCompletion && (
        <AboutMeCompletion
          show={showSceneCompletion}
          sceneName="Obstacle Remover"
          sceneNumber={3}
          totalScenes={4}
          starsEarned={gameState.stars}
          totalStars={3}
          discoveredBadges={['obstacle-remover', 'joy-bringer', 'peace-keeper', 'love-spreader']}
          badgeImages={{
            // 'obstacle-remover': obstacleRemoverBadge
          }}
          characterImages={{
            babyGanesha: babyGaneshaSitting
          }}
          nextSceneName="Spell GANESHA"
          childName="obstacle remover"
          
          onContinue={() => {
            console.log('🪔 OBSTACLE REMOVER CONTINUE: Moving to next game');
            
            setTimeout(() => {
              if (onNavigate) {
                onNavigate('game4');
              } else if (onComplete) {
                onComplete();
              }
            }, 100);
          }}
          
          onReplay={() => {
            console.log('🎮 OBSTACLE REMOVER REPLAY: Play Again');
            
            setGamePhase('intro');
            setClearedObstacles(new Set());
            setSelectedValue(null);
            setShowSparkles(false);
            setShowSceneCompletion(false);
            setGameState({
              stars: 3,
              completed: false
            });
          }}
          
          onBackToMap={() => {
            console.log('🗺️ OBSTACLE REMOVER MAP: Back to About Me Hut');
            
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

export default ObstacleRemoverGame;