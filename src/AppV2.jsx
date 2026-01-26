// Simple App.jsx - Scene Switcher for Testing
import React, { useState, useEffect } from 'react';
import './App.css';

// Symbol Mountain Scenes
import NewModakSceneV5 from './zones/symbol-mountain/scenes/modak/NewModakSceneV6';
import PondSceneSimplifiedV3 from './zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV3';
import SymbolMountainSceneV3 from './zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3';
import SacredAssemblySceneV8 from './zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8';

// Cave of Secrets Scenes
import CaveSceneFixedV1 from './zones/meaning-cave/scenes/VakratundaMahakaya/CaveSceneFixedV1';
import SuryakotiSceneV3 from './zones/meaning=cave/scenes/suryakoti-samaprabha/SuryakotiSceneV3.jsx';
import NirvighnamSceneV4 from './zones/meaning-cave/scenes/nirvighnam-kurumedeva/NirvighnamSceneV4';
import SarvakaryeshuSarvadaV6 from './zones/meaning-cave/scenes/sarvakaryeshu-sarvada/SarvakaryeshuSarvadaV6.jsx';
import CaveScene5MemoryFinale from './zones/meaning-cave/scenes/final-meaning-scene/CaveScene5MemoryFinale.jsx';

// Shloka River Scenes
import VakratundaGroveSimplified from './zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx';
import SuryakotiBankSimplified from './zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx';
import NirvighnamChantSimplified from './zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx';
import SarvakaryeshuChantSimplified from './zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx';
import ShlokaRiverFinale from './zones/shloka-river/scenes/scene5/ShlokaRiverFinale';

// Festival Square Games
import FestivalPianoGame from './zones/festival-square/Game1-piano/FestivalPianoGame.jsx';
import FestivalRangoliGame from './zones/festival-square/Game2-Rangoli/FestivalRangoliGame.jsx';
import ModakCookingGame from './zones/festival-square/game3-cooking/ModakCookingGame.jsx';
import MandapDecorationGame from './zones/festival-square/Game4-mandapdecor/MandapDecorationGame.jsx';

// About Me Hut
import Familytreegame from './zones/about-me-hut/family-tree/Familytreegame.jsx';
import Favoritefoodgame  from './zones/about-me-hut/food/Favoritefoodgame.jsx';
import ObstacleRemoverGame from './zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx';
import NameBirthdayGame from './zones/about-me-hut/name/Namebirthdaygame.jsx';


// Import GameCoach Provider (needed by some scenes)
import { GameCoachProvider } from './lib/components/coach/GameCoach.jsx';

// Mock GameStateManager for testing
const MockGameStateManager = {
  getActiveProfile: () => ({
    id: 'test-profile',
    name: 'Maya',
    avatar: '😊',
    color: '#4A90E2'
  }),
  
  saveGameState: (zoneId, sceneId, data) => {
    console.log('🎮 Mock Save:', { zoneId, sceneId, data });
    localStorage.setItem(`game_${zoneId}_${sceneId}`, JSON.stringify(data));
  },
  
  loadGameState: (zoneId, sceneId) => {
    const saved = localStorage.getItem(`game_${zoneId}_${sceneId}`);
    return saved ? JSON.parse(saved) : null;
  }
};

// Add mocks to window
window.MockGameStateManager = MockGameStateManager;

// 🎯 SCENE CONFIGURATION - Organized by Zone
const SCENES = {
  // 🏔️ SYMBOL MOUNTAIN
  'symbol-modak': {
    name: '🍬 Modak Scene',
    zone: 'Symbol Mountain',
    component: NewModakSceneV5,
    zoneId: 'symbol-mountain',
    sceneId: 'modak'
  },
  'symbol-pond': {
    name: '🌊 Pond Scene',
    zone: 'Symbol Mountain',
    component: PondSceneSimplifiedV3,
    zoneId: 'symbol-mountain',
    sceneId: 'pond'
  },
  'symbol-tusk': {
    name: '🐘 Tusk/Symbol Scene',
    zone: 'Symbol Mountain',
    component: SymbolMountainSceneV3,
    zoneId: 'symbol-mountain',
    sceneId: 'symbol'
  },
  'symbol-final': {
    name: '✨ Sacred Assembly',
    zone: 'Symbol Mountain',
    component: SacredAssemblySceneV8,
    zoneId: 'symbol-mountain',
    sceneId: 'final-scene'
  },

  // 🕉️ CAVE OF SECRETS
  /*'cave-vakratunda': {
    name: '🕉️ Vakratunda Mahakaya',
    zone: 'Cave of Secrets',
    component: CaveSceneFixedV1,
    zoneId: 'cave-of-secrets',
    sceneId: 'vakratunda-mahakaya'
  },
  'cave-suryakoti': {
    name: '☀️ Suryakoti Samaprabha',
    zone: 'Cave of Secrets',
    component: SuryakotiSceneV3,
    zoneId: 'cave-of-secrets',
    sceneId: 'suryakoti-samaprabha'
  },
  'cave-nirvighnam': {
    name: '🙏 Nirvighnam Kurumedeva',
    zone: 'Cave of Secrets',
    component: NirvighnamSceneV4,
    zoneId: 'cave-of-secrets',
    sceneId: 'nirvighnam-kurumedeva'
  },
  'cave-sarvakaryeshu': {
    name: '🌟 Sarvakaryeshu Sarvada',
    zone: 'Cave of Secrets',
    component: SarvakaryeshuSarvadaV6,
    zoneId: 'cave-of-secrets',
    sceneId: 'sarvakaryeshu-sarvada'
  },

  'cave-finale': {
    name: '🎊 Memory Finale',
    zone: 'Cave of Secrets',
    component: CaveScene5MemoryFinale,
    zoneId: 'cave-of-secrets',
    sceneId: 'memory-finale'
  },
  // 🌊 SHLOKA RIVER
 'shloka-vakratunda': {
    name: '🐘 Vakratunda Grove',
    zone: 'Shloka River',
    component: VakratundaGroveSimplified,
    zoneId: 'shloka-river',
    sceneId: 'vakratunda-grove'
  },
  'shloka-suryakoti': {
    name: '☀️ Suryakoti Bank',
    zone: 'Shloka River',
    component: SuryakotiBankSimplified,
    zoneId: 'shloka-river',
    sceneId: 'suryakoti-bank'
  },
  'shloka-nirvighnam': {
    name: '✨ Nirvighnam Chant',
    zone: 'Shloka River',
    component: NirvighnamChantSimplified,
    zoneId: 'shloka-river',
    sceneId: 'nirvighnam-chant'
  },
  'shloka-sarvakaryeshu': {
    name: '🎵 Sarvakaryeshu Chant',
    zone: 'Shloka River',
    component: SarvakaryeshuChantSimplified,
    zoneId: 'shloka-river',
    sceneId: 'sarvakaryeshu-chant'
  },
  'shloka-finale': {
    name: '🎊 Shloka River Finale',
    zone: 'Shloka River',
    component: ShlokaRiverFinale,
    zoneId: 'shloka-river',
    sceneId: 'shloka-river-finale'
  },*/

  // 🎪 FESTIVAL SQUARE
  'festival-piano': {
    name: '🎹 Piano Game',
    zone: 'Festival Square',
    component: FestivalPianoGame,
    zoneId: 'festival-square',
    sceneId: 'game1'
  },
  'festival-rangoli': {
    name: '🎨 Rangoli Game',
    zone: 'Festival Square',
    component: FestivalRangoliGame,
    zoneId: 'festival-square',
    sceneId: 'game2'
  },
  'festival-cooking': {
    name: '👨‍🍳 Modak Cooking',
    zone: 'Festival Square',
    component: ModakCookingGame,
    zoneId: 'festival-square',
    sceneId: 'game3'
  },
  'festival-mandap': {
    name: '🏛️ Mandap Decoration',
    zone: 'Festival Square',
    component: MandapDecorationGame,
    zoneId: 'festival-square',
    sceneId: 'game4'
  },

  // 🏠 ABOUT ME HUT
  'family-tree': {
    name: '🌳 Family Tree',
    zone: 'About Me Hut',
    component: Familytreegame,
    zoneId: 'about-me-hut',
    sceneId: 'game1'
  },
  'favourite-food': {
    name: '🍬 Favorite Food',
    zone: 'About Me Hut',
    component: Favoritefoodgame,
    zoneId: 'about-me-hut',
    sceneId: 'game2'
  },
  'obstacle-remover': {
    name: '🪔 Obstacle Remover',
    zone: 'About Me Hut',
    component: ObstacleRemoverGame,
    zoneId: 'about-me-hut',
    sceneId: 'game3'
  },
  'name-birthday': {
    name: '🎈 Name & Birthday',
    zone: 'About Me Hut',
    component: NameBirthdayGame,
    zoneId: 'about-me-hut',
    sceneId: 'game4'
  }
};

function App() {
  const [reloadKey, setReloadKey] = useState(0);
  const [activeScene, setActiveScene] = useState('family-tree'); // Default to Family Tree

  // Set up test profile
  useEffect(() => {
    localStorage.setItem('activeProfileId', 'test-profile');
  }, []);

  // Simple navigation handler
  const handleNavigate = (destination) => {
    console.log('🧭 Navigation:', destination);
    if (destination === 'next-scene') {
      console.log('🦋 Would navigate to next scene');
    }
  };

  // Simple completion handler
  const handleComplete = (sceneId, data) => {
    console.log('🎉 Scene Complete:', { sceneId, data });
  };

  // Simple reload function
  const reloadScene = () => {
    console.log('🔄 Reloading Scene');
    
    // Clear all localStorage
    localStorage.clear();
    
    // Reset profile
    localStorage.setItem('activeProfileId', 'test-profile');
    
    // Force component remount
    setReloadKey(prev => prev + 1);
  };

  // Get current scene config
  const currentScene = SCENES[activeScene];
  const SceneComponent = currentScene.component;

  // Group scenes by zone for organized dropdown
  const scenesByZone = Object.entries(SCENES).reduce((acc, [key, scene]) => {
    if (!acc[scene.zone]) acc[scene.zone] = [];
    acc[scene.zone].push({ key, ...scene });
    return acc;
  }, {});

  return (
    <div className="App">
      {/* 🎛️ SCENE SWITCHER CONTROL */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        zIndex: 9999,
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.9)',
        padding: '12px 16px',
        borderRadius: '12px',
      }}>
        {/* Scene Selector Dropdown with Grouped Options */}
        <select 
          value={activeScene}
          onChange={(e) => {
            setActiveScene(e.target.value);
            reloadScene(); // Auto-reload when switching
          }}
          style={{
            padding: '10px 14px',
            fontSize: '14px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            minWidth: '250px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          {Object.entries(scenesByZone).map(([zone, scenes]) => (
            <optgroup key={zone} label={`${zone}`}>
              {scenes.map(scene => (
                <option key={scene.key} value={scene.key}>
                  {scene.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Reload Button */}
        <button 
          onClick={reloadScene}
          style={{
            padding: '10px 18px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'transform 0.1s',
          }}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          🔄 Reload
        </button>
      </div>

      {/* Active Scene - With GameCoach wrapper */}
      <GameCoachProvider>
        <SceneComponent
          key={reloadKey}
          onComplete={handleComplete}
          onNavigate={handleNavigate}
          zoneId={currentScene.zoneId}
          sceneId={currentScene.sceneId}
        />
      </GameCoachProvider>
    </div>
  );
}

export default App;