// TestSetup.jsx - Component for testing the navigation flow
import React, { useState } from 'react';
import GameStateManager from './lib/services/GameStateManager';

const TestSetup = () => {
  const [testResults, setTestResults] = useState([]);
  
  const addResult = (message, success = true) => {
    setTestResults(prev => [...prev, { message, success, timestamp: Date.now() }]);
  };

  // Test 1: First Time User Flow
  const testFirstTimeFlow = () => {
    addResult('Starting First Time User Flow Test...');
    
    // Reset game to simulate first time user
    GameStateManager.resetGame();
    addResult('Game reset - simulating first time user');
    
    // Check if no saved progress
    const hasSaves = GameStateManager.hasSavedProgress();
    addResult(`Has saved progress: ${hasSaves}`, !hasSaves);
    
    // Get initial game progress
    const progress = GameStateManager.getGameProgress();
    addResult(`Initial zone: ${progress.currentZone}`);
    addResult(`Initial scene: ${progress.currentScene}`);
    addResult(`Total stars: ${progress.totalStars}`, progress.totalStars === 0);
    
    addResult('First Time User Flow Test Complete!');
  };

  // Test 2: Save State Testing
  const testSaveState = () => {
    addResult('Starting Save State Test...');
    
    // Simulate playing pond scene
    const testState = {
      lotusStates: [1, 1, 0],
      goldenLotusVisible: true,
      goldenLotusBloom: false,
      elephantVisible: false,
      elephantTransformed: false,
      gameStage: 2,
      bloomedCount: 2,
      stars: 3,
      symbols: {
        lotus: true,
        modak: false,
        mooshika: false
      }
    };
    
    // Save the state
    GameStateManager.saveGameState('symbol-mountain', 'pond', testState);
    addResult('Saved test state to GameStateManager');
    
    // Retrieve and verify
    const savedState = GameStateManager.getSceneState('symbol-mountain', 'pond');
    addResult(`Retrieved saved state: ${savedState !== null}`);
    addResult(`Lotus states match: ${JSON.stringify(savedState.lotusStates) === JSON.stringify(testState.lotusStates)}`);
    addResult(`Stars saved: ${savedState.stars === testState.stars}`);
    
    // Check overall progress
    const progress = GameStateManager.getGameProgress();
    addResult(`Has saved progress: ${GameStateManager.hasSavedProgress()}`);
    addResult(`Zone progress updated: ${progress.zones['symbol-mountain'].scenes.pond.stars === 3}`);
    
    addResult('Save State Test Complete!');
  };

  // Test 3: Navigation Flow
  const testNavigationFlow = () => {
    addResult('Starting Navigation Flow Test...');
    
    // Test scene unlocking
    const isFirstSceneUnlocked = GameStateManager.isSceneUnlocked('symbol-mountain', 'pond');
    addResult(`First scene (pond) unlocked: ${isFirstSceneUnlocked}`);
    
    // Test second scene (should be locked initially)
    const isSecondSceneUnlocked = GameStateManager.isSceneUnlocked('symbol-mountain', 'temple');
    addResult(`Second scene (temple) locked initially: ${!isSecondSceneUnlocked}`, !isSecondSceneUnlocked);
    
    // Complete first scene
    GameStateManager.saveGameState('symbol-mountain', 'pond', {
      completed: true,
      stars: 3
    });
    
    // Check if second scene is now unlocked
    const isSecondSceneUnlockedAfter = GameStateManager.isSceneUnlocked('symbol-mountain', 'temple');
    addResult(`Second scene unlocked after completing first: ${isSecondSceneUnlockedAfter}`);
    
    // Test zone unlocking
    const progress = GameStateManager.getGameProgress();
    const rainbowValleyUnlocked = progress.zones['rainbow-valley'].unlocked;
    addResult(`Rainbow Valley still locked: ${!rainbowValleyUnlocked}`, !rainbowValleyUnlocked);
    
    addResult('Navigation Flow Test Complete!');
  };

  // Test 4: Progress Calculation
  const testProgressCalculation = () => {
    addResult('Starting Progress Calculation Test...');
    
    // Add some progress
    GameStateManager.saveGameState('symbol-mountain', 'pond', {
      completed: true,
      stars: 3
    });
    
    GameStateManager.saveGameState('symbol-mountain', 'temple', {
      completed: true,
      stars: 2
    });
    
    const progress = GameStateManager.getGameProgress();
    addResult(`Total stars: ${progress.totalStars}`, progress.totalStars === 5);
    addResult(`Completed scenes: ${progress.completedScenes}`, progress.completedScenes === 2);
    
    // Calculate zone progress
    const symbolMountainProgress = progress.zones['symbol-mountain'];
    addResult(`Symbol Mountain stars: ${symbolMountainProgress.stars}`, symbolMountainProgress.stars === 5);
    
    addResult('Progress Calculation Test Complete!');
  };

  // Quick Debug Commands
  const debugCommands = {
    checkProgress: () => {
      const progress = GameStateManager.getGameProgress();
      console.log('Game Progress:', progress);
      addResult(`Current progress: ${progress.totalStars} stars, ${progress.completedScenes} scenes completed`);
    },
    
    checkPondState: () => {
      const state = GameStateManager.getSceneState('symbol-mountain', 'pond');
      console.log('Pond State:', state);
      addResult(`Pond state exists: ${state !== null}`);
      if (state) {
        addResult(`Pond stars: ${state.stars || 0}`);
      }
    },
    
    resetGame: () => {
      GameStateManager.resetGame();
      addResult('Game reset successfully');
    },
    
    hasSavedProgress: () => {
      const hasSaves = GameStateManager.hasSavedProgress();
      addResult(`Has saved progress: ${hasSaves}`);
    }
  };

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: 'var(--app-height, 100vh)',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '20px',
      overflowY: 'auto',
      zIndex: 9999
    }}>
      <h2>Test Panel</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test Flows</h3>
        <button onClick={testFirstTimeFlow} style={buttonStyle}>
          Test First Time User Flow
        </button>
        <button onClick={testSaveState} style={buttonStyle}>
          Test Save State
        </button>
        <button onClick={testNavigationFlow} style={buttonStyle}>
          Test Navigation Flow
        </button>
        <button onClick={testProgressCalculation} style={buttonStyle}>
          Test Progress Calculation
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Debug Commands</h3>
        <button onClick={debugCommands.checkProgress} style={buttonStyle}>
          Check Progress
        </button>
        <button onClick={debugCommands.checkPondState} style={buttonStyle}>
          Check Pond State
        </button>
        <button onClick={debugCommands.hasSavedProgress} style={buttonStyle}>
          Has Saved Progress?
        </button>
        <button onClick={debugCommands.resetGame} style={buttonStyle}>
          Reset Game
        </button>
      </div>
      
      <div>
        <h3>Test Results</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {testResults.map((result, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '10px',
                padding: '10px',
                backgroundColor: result.success ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                borderRadius: '5px'
              }}
            >
              {result.message}
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={() => setTestResults([])} 
        style={{...buttonStyle, backgroundColor: '#666'}}
      >
        Clear Results
      </button>
    </div>
  );
};

const buttonStyle = {
  display: 'block',
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default TestSetup;