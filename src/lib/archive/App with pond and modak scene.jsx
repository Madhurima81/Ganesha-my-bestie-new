// App.jsx - Updated with GameCoachProvider and ModakScene integration

import React, { useState, useEffect } from 'react';
import './App.css';
//import PondScene from './zones/symbol-mountain/scenes/pond/PondScene';
import PondScene from '../../zones/symbol-mountain/scenes/pond/PondSceneSimplified';
import ModakScene from '../../zones/symbol-mountain/scenes/modak/NewModakScene';  // 🌟 ADDED
import GameWelcomeScreen from '../components/navigation/GameWelcomeScreen';
import MapZone from '../../pages/MapZone';
import GameStateManager from '../services/GameStateManager';
import { GameCoachProvider } from '../components/coach/GameCoach';
// Import debug panel (optional)
// import DebugPanel from './lib/components/developer/DebugPanel';

// Access the class to get static properties
const GameStateManagerClass = GameStateManager.constructor;

function App() {
  const [currentView, setCurrentView] = useState('loading');
  const [currentZone, setCurrentZone] = useState(null);
  const [currentScene, setCurrentScene] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize app and check for profiles/saves
  useEffect(() => {
    console.log('App mounting, checking GameStateManager:', GameStateManager);
    console.log('GameStateManager.constructor.ZONES:', GameStateManagerClass.ZONES);
    initializeApp();
  }, []);
  
  const initializeApp = () => {
    try {
      // Verify GameStateManager is available
      if (!GameStateManager) {
        console.error('GameStateManager is not imported correctly');
        setCurrentView('error');
        return;
      }
      
      console.log('GameStateManager initialized successfully');
      
      // Check if any profiles exist
      const profiles = GameStateManager.getProfiles();
      const hasProfiles = profiles && profiles.profiles && Object.keys(profiles.profiles).length > 0;
      
      console.log('Has profiles:', hasProfiles);
      
      // Check for active profile
      const activeProfile = GameStateManager.getCurrentProfile();
      console.log('Active profile from GameStateManager:', activeProfile);
      
      if (!hasProfiles) {
        // No profiles - show welcome to create one
        console.log('No profiles exist, showing welcome');
        setCurrentView('welcome');
        return;
      }
      
      if (activeProfile) {
        // Has active profile - set it and show welcome screen
        setCurrentProfile(activeProfile);
        
        // IMPORTANT: Always go to welcome screen and let it decide 
        // whether to show continue/new game options
        console.log('Active profile found, showing welcome screen');
        setCurrentView('welcome');
      } else {
        // Has profiles but no active profile
        console.log('No active profile, showing welcome to select one');
        setCurrentView('welcome');
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setCurrentView('error');
    }
  };
  
  // Handle continuing from last save
  const handleContinue = () => {
    try {
      console.log('Continuing game');
      const lastLocation = GameStateManager.getLastPlayedLocation();
      console.log('Last location:', lastLocation);
      
      if (lastLocation && lastLocation.zone && lastLocation.scene) {
        setCurrentZone(lastLocation.zone);
        setCurrentScene(lastLocation.scene);
        setCurrentView('scene'); // Go directly to the saved scene
      } else {
        setCurrentView('map');
      }
    } catch (error) {
      console.error('Error continuing game:', error);
      handleNewGame();
    }
  };
  
  // Handle new game - 🌟 UPDATED: Start with modak scene
  const handleNewGame = () => {
    setCurrentZone('symbol-mountain');
    setCurrentScene('modak');  // 🌟 CHANGED: Start with modak first
    setCurrentView('map');
  };
  
  const handleZoneSelect = (zoneId, sceneId = null) => {
  console.log('🎯 FLOW DEBUG - handleZoneSelect called with:', { zoneId, sceneId });
  setCurrentZone(zoneId);
  
  if (zoneId === 'symbol-mountain') {
    if (sceneId) {
      console.log('🎯 FLOW DEBUG - Using provided sceneId:', sceneId);
      setCurrentScene(sceneId);
    } else {
      console.log('🎯 FLOW DEBUG - No sceneId provided, checking progress...');
      try {
        const modakProgress = GameStateManager.getSceneProgress('symbol-mountain', 'modak');
        console.log('🎯 FLOW DEBUG - Modak progress:', modakProgress);
        
        if (modakProgress && modakProgress.completed) {
          console.log('🎯 FLOW DEBUG - Modak completed, going to pond');
          setCurrentScene('pond');
        } else {
          console.log('🎯 FLOW DEBUG - Modak not completed, going to modak');
          setCurrentScene('modak');
        }
      } catch (error) {
        console.log('🎯 FLOW DEBUG - Error checking progress, defaulting to modak');
        setCurrentScene('modak');
      }
    }
    
    console.log('🎯 FLOW DEBUG - About to set currentView to scene');
    setCurrentView('scene');
   
      // Save current location when entering a scene
      const finalScene = sceneId || currentScene || 'modak';
      GameStateManager.saveGameState(zoneId, finalScene, {
        currentZone: zoneId,
        currentScene: finalScene,
        enteredAt: Date.now()
      });
    }
  };
  
  // Handle scene navigation
  const handleSceneSelect = (sceneId) => {
    setCurrentScene(sceneId);
    setCurrentView('scene');
    
    // Save current location
    GameStateManager.saveGameState(currentZone, sceneId, {
      currentZone: currentZone,
      currentScene: sceneId,
      enteredAt: Date.now()
    });
  };
  
  // Handle navigation from scenes
  const handleNavigate = (destination) => {
    const root = document.getElementById('root');
    
    // Restore styles when leaving scene
    document.body.style.cssText = '';
    if (root) root.style.cssText = '';
    
    // Save current location before navigating away
    if (currentZone && currentScene) {
      GameStateManager.saveGameState(currentZone, currentScene, {
        currentZone: currentZone,
        currentScene: currentScene,
        lastNavigated: Date.now()
      });
    }
    
    switch (destination) {
      case 'home':
        setCurrentView('welcome');
        break;
      case 'zones':
      case 'map':
        setCurrentView('map');
        break;
      case 'profile':
        setCurrentView('welcome');
        break;
      // 🌟 UPDATED: Handle next scene navigation with new flow
      case 'next-scene':
        if (currentScene === 'modak') {
          setCurrentScene('pond');
          setCurrentView('scene');
        } else if (currentScene === 'pond') {
          // Future: navigate to temple scene
          setCurrentView('map');
        }
        break;
      default:
        console.log('Unknown navigation:', destination);
    }
  };
  
  // Handle scene completion - 🌟 UPDATED: New scene flow
  const handleSceneComplete = (sceneId, result) => {
    console.log('Scene completed:', sceneId, result);
    
    // Save completion state
    if (result.stars) {
      GameStateManager.saveGameState(currentZone, sceneId, {
        completed: true,
        stars: result.stars,
        completedAt: Date.now()
      });
    }
    
    // Restore styles
    document.body.style.cssText = '';
    const root = document.getElementById('root');
    if (root) root.style.cssText = '';
    
    // 🌟 UPDATED: Navigate to next scene with new flow (modak → pond)
    if (sceneId === 'modak') {
      // Modak completed - go to pond scene
      setCurrentScene('pond');
      setCurrentView('scene');
    } else if (sceneId === 'pond') {
      // Pond completed - go back to map (until temple scene ready)
      setCurrentView('map');
    } else {
      // Default: go back to map
      setCurrentView('map');
    }
  };
  
  // Handle profile changes
  const handleProfileChange = () => {
    // Refresh current profile
    const activeProfile = GameStateManager.getCurrentProfile();
    setCurrentProfile(activeProfile);
    
    // Re-initialize the app state
    initializeApp();
  };
  
  // Render different views - now wrapped with GameCoachProvider
  return (
    <GameCoachProvider defaultConfig={{
      name: 'Ganesha',
      image: 'images/ganesha-character.png',
      position: 'top-right'
    }}>
      {currentView === 'loading' && (
        <div className="loading-screen">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}
      
      {currentView === 'error' && (
        <div className="error-screen">
          <h1>Initialization Error</h1>
          <p>Failed to load game resources. Please refresh the page.</p>
          <button onClick={() => window.location.reload()}>Refresh</button>
        </div>
      )}
      
      {currentView === 'welcome' && (
        <>
          <GameWelcomeScreen
            onContinue={handleContinue}
            onNewGame={handleNewGame}
          />
          {/* Uncomment to use debug panel */}
          {/* <DebugPanel /> */}
        </>
      )}
      
      {currentView === 'map' && (
        <>
          <MapZone 
            onZoneSelect={handleZoneSelect}
            currentZone={currentZone}
            highlightedScene={currentScene}
          />
          {/* Uncomment to use debug panel */}
          {/* <DebugPanel /> */}
        </>
      )}
      
      {currentView === 'scene' && (() => {
        console.log('🎯 FLOW DEBUG - Rendering scene view');
  console.log('🎯 FLOW DEBUG - currentZone:', currentZone);
  console.log('🎯 FLOW DEBUG - currentScene:', currentScene);
        // Apply scene-specific styles
        document.body.className = '';
        document.body.style.cssText = 'margin: 0; padding: 0; overflow: hidden; width: 100vw; height: var(--app-height, 100vh);';
        
        const root = document.getElementById('root');
        if (root) {
          root.className = '';
          root.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: var(--app-height, 100vh); margin: 0; padding: 0;';
        }
        
        // 🌟 UPDATED: Handle both modak and pond scenes
        if (currentZone === 'symbol-mountain') {
          if (currentScene === 'modak') {
                  console.log('🎯 FLOW DEBUG - Should render ModakScene');
            return (
              <>
                <ModakScene 
                  onNavigate={handleNavigate}
                  onComplete={handleSceneComplete}
                  onSceneSelect={handleSceneSelect}
                  zoneId={currentZone}
                  sceneId={currentScene}
                />
                {/* Uncomment to use debug panel */}
                {/* <DebugPanel /> */}
              </>
            );
          } else if (currentScene === 'pond') {
            return (
              <>
                <PondScene 
                  onNavigate={handleNavigate}
                  onComplete={handleSceneComplete}
                  onSceneSelect={handleSceneSelect}
                  zoneId={currentZone}
                  sceneId={currentScene}
                />
                {/* Uncomment to use debug panel */}
                {/* <DebugPanel /> */}
              </>
            );
          }
        }
        
        // Fallback for scenes not yet implemented
        return (
          <>
            <div className="scene-placeholder">
              <h2>Scene: {currentScene} in {currentZone}</h2>
              <p>This scene is not yet available.</p>
              <button onClick={() => handleNavigate('map')}>
                Back to Map
              </button>
            </div>
            {/* Uncomment to use debug panel */}
            {/* <DebugPanel /> */}
          </>
        );
      })()}
      
      {/* Fallback view */}
      {!['loading', 'error', 'welcome', 'map', 'scene'].includes(currentView) && (
        <>
          <div>Error: Unknown view state</div>
          {/* Uncomment to use debug panel */}
          {/* <DebugPanel /> */}
        </>
      )}
    </GameCoachProvider>
  );
}

export default App;