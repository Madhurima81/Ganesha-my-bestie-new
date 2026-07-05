// zones/symbol-mountain/ZoneWelcome.jsx
// 🎯 Zone Welcome screen using the new unlock system

import React from 'react';
import { useZoneUnlocks } from "../../hooks/useZoneUnlocks";

const ZoneWelcome = ({ onNavigate, profileId }) => {
  const {
    getSceneStatus,
    getZoneProgress,
    getZoneStars,
    getAllZonesStatus,
    loading,
    debugUnlocks
  } = useZoneUnlocks(profileId);

  if (loading) {
    return (
      <div className="zone-welcome-loading">
        <div className="loading-spinner">🔄</div>
        <div>Loading progress...</div>
      </div>
    );
  }

  const symbolMountainProgress = getZoneProgress('symbol-mountain');
  const symbolMountainStars = getZoneStars('symbol-mountain');

  // Define scenes for Symbol Mountain
  const scenes = [
    { id: 'pond', name: 'Sacred Pond', description: 'Discover the lotus and elephant symbols' },
    { id: 'modak', name: 'Modak Forest', description: 'Find Mooshika and collect sweet modaks' },
    { id: 'temple', name: 'Ancient Temple', description: 'Explore sacred temple mysteries' },
    { id: 'garden', name: 'Sacred Garden', description: 'Complete your symbol journey' }
  ];

  const handleSceneClick = (sceneId) => {
    const status = getSceneStatus('symbol-mountain', sceneId);
    
    if (status === 'locked') {
      console.log(`🔒 Scene ${sceneId} is locked`);
      return;
    }
    
    console.log(`🎯 Navigating to scene: ${sceneId}`);
    onNavigate?.(`${sceneId}-scene`);
  };

  const getSceneIcon = (sceneId, status) => {
    const icons = {
      pond: '🏞️',
      modak: '🍯',
      temple: '🛕',
      garden: '🌺'
    };
    
    if (status === 'locked') return '🔒';
    if (status === 'completed') return '⭐';
    return icons[sceneId] || '🎯';
  };

  const getSceneStyles = (status) => {
    const baseStyles = {
      padding: '20px',
      margin: '10px',
      borderRadius: '15px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'center',
      border: '3px solid',
      fontSize: '16px',
      fontWeight: 'bold'
    };

    switch (status) {
      case 'completed':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          borderColor: '#FF8C00',
          color: '#8B4513',
          boxShadow: '0 8px 16px rgba(255, 215, 0, 0.4)'
        };
      case 'unlocked':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #90EE90, #32CD32)',
          borderColor: '#228B22',
          color: '#006400',
          boxShadow: '0 8px 16px rgba(50, 205, 50, 0.4)'
        };
      case 'locked':
      default:
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #D3D3D3, #A9A9A9)',
          borderColor: '#808080',
          color: '#696969',
          cursor: 'not-allowed',
          opacity: 0.6
        };
    }
  };

  return (
    <div className="zone-welcome-container" style={{
      padding: '20px',
      minHeight: 'var(--app-height, 100vh)',
      background: 'linear-gradient(135deg, #E6F3FF, #B3E0FF)',
      fontFamily: 'Comic Sans MS, cursive'
    }}>
      {/* Back Button */}
      <button 
        onClick={() => onNavigate?.('zones')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'linear-gradient(135deg, #32CD32, #228B22)',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          padding: '10px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}
      >
        ← Back to Map
      </button>

      {/* Debug Button (remove in production) */}
      <button 
        onClick={debugUnlocks}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'purple',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '8px 12px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        🔧 Debug Unlocks
      </button>

      {/* Zone Header */}
      <div style={{ textAlign: 'center', marginTop: '80px', marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '3rem',
          color: '#4B0082',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
          margin: '0 0 20px 0'
        }}>
          🏔️ Symbol Mountain
        </h1>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '15px 30px',
          borderRadius: '20px',
          display: 'inline-block',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8B4513' }}>
            Progress: {symbolMountainProgress.completed}/{symbolMountainProgress.total} scenes
          </div>
          <div style={{ fontSize: '1.2rem', color: '#4B0082' }}>
            Total Stars: {symbolMountainStars} ⭐
          </div>
        </div>
      </div>

      {/* Scene Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {scenes.map((scene) => {
          const status = getSceneStatus('symbol-mountain', scene.id);
          const styles = getSceneStyles(status);
          
          return (
            <div
              key={scene.id}
              onClick={() => handleSceneClick(scene.id)}
              style={styles}
              onMouseEnter={(e) => {
                if (status !== 'locked') {
                  e.target.style.transform = 'translateY(-5px)';
                  e.target.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (status !== 'locked') {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = styles.boxShadow;
                }
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                {getSceneIcon(scene.id, status)}
              </div>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                {scene.name}
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                {scene.description}
              </div>
              <div style={{ 
                marginTop: '10px', 
                padding: '5px 10px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {status === 'completed' ? '✅ Complete' : 
                 status === 'unlocked' ? '🎯 Available' : 
                 '🔒 Locked'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div style={{
        marginTop: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '20px',
          borderRadius: '20px',
          display: 'inline-block',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ marginBottom: '15px', fontSize: '1.3rem', fontWeight: 'bold', color: '#4B0082' }}>
            Zone Progress
          </div>
          <div style={{
            width: '300px',
            height: '20px',
            background: '#E0E0E0',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '2px solid #8B4513'
          }}>
            <div style={{
              width: `${symbolMountainProgress.percentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #FFD700, #FFA500)',
              transition: 'width 0.8s ease'
            }} />
          </div>
          <div style={{ marginTop: '10px', fontSize: '1.1rem', color: '#8B4513' }}>
            {symbolMountainProgress.percentage}% Complete
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '40px',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '20px',
        borderRadius: '15px',
        maxWidth: '600px',
        margin: '40px auto 0 auto',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '1.2rem', color: '#4B0082', marginBottom: '10px' }}>
          🎯 <strong>How to Play:</strong>
        </div>
        <div style={{ fontSize: '1rem', color: '#8B4513', lineHeight: '1.5' }}>
          Complete scenes in order to unlock the next adventure! 
          Each scene teaches you about different symbols of Lord Ganesha.
          Collect stars and discover the wisdom hidden in each location.
        </div>
      </div>
    </div>
  );
};

export default ZoneWelcome;