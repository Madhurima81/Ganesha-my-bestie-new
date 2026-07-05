// DirectSceneTest.jsx - Test scenes directly with zero navigation
import React, { useState, useEffect } from 'react';
import GameStateManager from './lib/services/GameStateManager';
import { GameCoachProvider } from './lib/components/coach/GameCoach';

// Import your scenes
import PondSceneSimplified from './zones/symbol-mountain/scenes/pond/PondSceneSimplified';
import NewModakScene from './zones/symbol-mountain/scenes/modak/NewModakScene';

const DirectSceneTest = () => {
  const [currentScene, setCurrentScene] = useState('pond'); // Start with pond
  const [testProfile, setTestProfile] = useState('test_direct_123');
  
  // Set up test profile automatically
  useEffect(() => {
    // Create test profile for testing manually
    try {
      // Set active profile first
      localStorage.setItem('activeProfileId', testProfile);
      
      // Create profile data manually
      const gameProfiles = JSON.parse(localStorage.getItem('gameProfiles') || '{"profiles":{}}');
      
      if (!gameProfiles.profiles[testProfile]) {
        gameProfiles.profiles[testProfile] = {
          id: testProfile,
          name: 'Direct Test',
          avatar: '🧪',
          color: '#FF5722',
          createdAt: Date.now(),
          totalStars: 0,
          completedScenes: 0
        };
        
        localStorage.setItem('gameProfiles', JSON.stringify(gameProfiles));
      }
      
      console.log('🧪 Direct Scene Test - Profile set up:', testProfile);
    } catch (error) {
      console.error('🚨 Profile setup error:', error);
    }
  }, [testProfile]);
  
  // Mock functions for scene testing
  const mockProps = {
    onComplete: (result) => {
      console.log('🎉 SCENE COMPLETED:', result);
      alert(`Scene completed!\nStars: ${result?.stars || 0}\nSymbols: ${JSON.stringify(result?.symbols || {})}`);
    },
    
    onNavigate: (destination, data) => {
      console.log('🧭 NAVIGATION REQUESTED:', destination, data);
      alert(`Navigation: ${destination}\nData: ${JSON.stringify(data || {})}`);
    },
    
    zoneId: 'symbol-mountain',
    sceneId: currentScene
  };
  
  // Test controls
  const testControls = {
    switchToPond: () => {
      console.log('🔄 Switching to Pond Scene');
      setCurrentScene('pond');
    },
    
    switchToModak: () => {
      console.log('🔄 Switching to Modak Scene');
      setCurrentScene('modak');
    },
    
    clearProgress: () => {
      const sceneKey = `${testProfile}_symbol-mountain_${currentScene}_state`;
      localStorage.removeItem(sceneKey);
      console.log('🧹 Cleared progress for:', currentScene);
      window.location.reload();
    },
    
    setPartialProgress: () => {
      const sceneKey = `${testProfile}_symbol-mountain_${currentScene}_state`;
      let mockProgress = {};
      
      if (currentScene === 'pond') {
        mockProgress = {
          lotusStates: [1, 1, 0], // 2 lotus found, 1 missing
          goldenLotusVisible: false,
          elephantVisible: false,
          discoveredSymbols: { lotus: true },
          stars: 1,
          completed: false,
          phase: 'lotus-discovery',
          lastSaved: Date.now()
        };
      } else if (currentScene === 'modak') {
        mockProgress = {
          mooshikaFound: true,
          modaksCollected: 3, // 3 out of 5 modaks
          modakStates: [true, true, true, false, false],
          phase: 'modak-collection',
          discoveredSymbols: { mooshika: true },
          stars: 1,
          completed: false,
          lastSaved: Date.now()
        };
      }
      
      localStorage.setItem(sceneKey, JSON.stringify(mockProgress));
      console.log('🎯 Set partial progress for:', currentScene, mockProgress);
      window.location.reload();
    },
    
    setCompleted: () => {
      const sceneKey = `${testProfile}_symbol-mountain_${currentScene}_state`;
      let completedState = {};
      
      if (currentScene === 'pond') {
        completedState = {
          lotusStates: [1, 1, 1],
          goldenLotusVisible: true,
          elephantVisible: true,
          elephantTransformed: true,
          discoveredSymbols: { lotus: true, elephant: true, goldenLotus: true },
          completed: true,
          stars: 3,
          completedAt: Date.now(),
          lastSaved: Date.now()
        };
      } else if (currentScene === 'modak') {
        completedState = {
          mooshikaFound: true,
          modaksCollected: 5,
          modakStates: [true, true, true, true, true],
          rockTransformed: true,
          phase: 'completed',
          discoveredSymbols: { mooshika: true, modak: true, belly: true },
          completed: true,
          stars: 3,
          completedAt: Date.now(),
          lastSaved: Date.now()
        };
      }
      
      localStorage.setItem(sceneKey, JSON.stringify(completedState));
      console.log('✅ Set completed state for:', currentScene, completedState);
      window.location.reload();
    },
    
    showCurrentState: () => {
      const sceneKey = `${testProfile}_symbol-mountain_${currentScene}_state`;
      const currentState = JSON.parse(localStorage.getItem(sceneKey) || '{}');
      console.log('📊 Current scene state:', currentState);
      
      const stateInfo = Object.keys(currentState).length === 0 
        ? 'No saved state (fresh start)' 
        : JSON.stringify(currentState, null, 2);
        
      alert(`Current ${currentScene} state:\n\n${stateInfo}`);
    }
  };
  
  // Scene components
  const scenes = {
    pond: PondSceneSimplified,
    modak: NewModakScene
  };
  
  const CurrentSceneComponent = scenes[currentScene];
  
  return (
    <GameCoachProvider>
      <div style={{ position: 'relative', height: 'var(--app-height, 100vh)', overflow: 'hidden' }}>
        
        {/* Floating Test Controls */}
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 9999,
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          fontSize: '14px',
          maxWidth: '350px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#FFD700' }}>
            🧪 Direct Scene Tester
          </h3>
          
          {/* Scene Selector */}
          <div style={{ marginBottom: '15px' }}>
            <strong>Current Scene: {currentScene.toUpperCase()}</strong>
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              <button 
                onClick={testControls.switchToPond}
                style={{
                  padding: '5px 10px',
                  background: currentScene === 'pond' ? '#4CAF50' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                🪷 Pond
              </button>
              <button 
                onClick={testControls.switchToModak}
                style={{
                  padding: '5px 10px',
                  background: currentScene === 'modak' ? '#4CAF50' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                🍯 Modak
              </button>
            </div>
          </div>
          
          {/* Progress Controls */}
          <div style={{ marginBottom: '15px' }}>
            <strong>Progress Controls:</strong>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '8px', 
              marginTop: '8px' 
            }}>
              <button 
                onClick={testControls.clearProgress}
                style={{
                  padding: '8px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🧹 Clear
              </button>
              <button 
                onClick={testControls.setPartialProgress}
                style={{
                  padding: '8px',
                  background: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                🎯 Partial
              </button>
              <button 
                onClick={testControls.setCompleted}
                style={{
                  padding: '8px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ✅ Complete
              </button>
              <button 
                onClick={testControls.showCurrentState}
                style={{
                  padding: '8px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📊 State
              </button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            <div>Profile: {testProfile}</div>
            <div>Press F12 for console logs</div>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '8px',
                padding: '5px 10px',
                background: '#9C27B0',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
        
        {/* Render Current Scene Directly */}
        {CurrentSceneComponent && (
          <CurrentSceneComponent {...mockProps} />
        )}
        
        {!CurrentSceneComponent && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'var(--app-height, 100vh)',
            backgroundColor: '#f0f0f0',
            textAlign: 'center'
          }}>
            <div>
              <h2>Scene Not Found</h2>
              <p>Scene "{currentScene}" is not available.</p>
            </div>
          </div>
        )}
      </div>
    </GameCoachProvider>
  );
};

export default DirectSceneTest;