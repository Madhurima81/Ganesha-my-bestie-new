// zones/festival-square/scenes/Game4-mandap/helpConfig.js
// Help menu configuration for Mandap Decoration Game (Festival Square)

// Import images (adjust paths as needed)
import mandapBase from './assets/images/mandap-base.png';
import flowerGarland from './assets/images/flower-garland.png';
import silkDrape from './assets/images/silk-drape.png';
import diyaLamp from './assets/images/diya-lamp.png';
import petalScatter from './assets/images/petal-scatter.png';
import ganeshaMandap from './assets/images/ganesha-mandap.png';
import decorationBadge from './assets/images/decoration-badge.png';
import missionIcon from './assets/images/mission-icon.png';
import freeDecorateIcon from './assets/images/free-decorate-icon.png';

// Game modes
const GAME_MODES = {
  INTRO: 'intro',
  SELECTION: 'selection',
  MISSION: 'mission',
  FREE_DECORATE: 'freeDecorate'
};

export const festivalMandapHelpConfig = {
  sceneId: 'game4-mandap',
  sceneName: 'Mandap Decoration',
  zoneId: 'festival-square',
  
  // Dynamic hints based on game mode
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== INTRO ====================
    if (sceneState.currentMode === GAME_MODES.INTRO) {
      hints.push({
        image: ganeshaMandap,
        name: 'Welcome to Mandap!',
        description: 'Create beautiful wedding canopy decorations for special ceremonies!',
        priority: 1
      });
      
      hints.push({
        image: mandapBase,
        name: 'What is Mandap?',
        description: 'Traditional canopy used in Indian weddings and celebrations!',
        priority: 2
      });
    }
    
    // ==================== MODE SELECTION ====================
    if (sceneState.currentMode === GAME_MODES.SELECTION) {
      hints.push({
        image: decorationBadge,
        name: 'Choose Your Mode',
        description: 'Free Decorate: Creative freedom! | Missions: Complete design challenges!',
        priority: 1
      });
      
      hints.push({
        image: freeDecorateIcon,
        name: 'Free Decorate',
        description: 'Drag, rotate, and scale decorations anywhere you like - pure creativity!',
        priority: 2
      });
      
      hints.push({
        image: missionIcon,
        name: 'Mission Mode',
        description: 'Complete specific mandap designs: Classic, Royal, Floral, and Festival!',
        priority: 3
      });
    }
    
    // ==================== MISSION MODE ====================
    if (sceneState.currentMode === GAME_MODES.MISSION) {
      
      // Mission selected
      if (sceneState.currentMission) {
        hints.push({
          image: missionIcon,
          name: `Mission: ${sceneState.currentMission.name}`,
          description: sceneState.currentMission.description || 'Drag decorations to their correct spots!',
          priority: 1
        });
        
        hints.push({
          image: flowerGarland,
          name: 'How to Complete',
          description: 'Drag each decoration to its highlighted spot on the mandap!',
          priority: 2
        });
        
        // Show progress
        const totalItems = sceneState.currentMission.items?.length || 0;
        const placedItems = sceneState.placedDecorations?.length || 0;
        
        if (placedItems > 0 && placedItems < totalItems) {
          hints.push({
            image: decorationBadge,
            name: `Progress: ${placedItems}/${totalItems}`,
            description: `${totalItems - placedItems} more decoration${totalItems - placedItems > 1 ? 's' : ''} to place!`,
            priority: 3
          });
        }
        
        hints.push({
          image: diyaLamp,
          name: 'Timed Challenge',
          description: 'Complete missions as fast as you can! Your time is tracked.',
          priority: 4
        });
      } 
      // No mission selected yet
      else {
        hints.push({
          image: missionIcon,
          name: 'Choose a Mission',
          description: 'Select from 4 different mandap designs to create!',
          priority: 1
        });
        
        hints.push({
          image: decorationBadge,
          name: 'Mission Styles',
          description: 'Classic (simple), Royal (grand), Floral (flowers), Festival (bright colors)!',
          priority: 2
        });
      }
      
      // Mission completion
      if (sceneState.showMissionComplete) {
        const time = sceneState.completionTime || 0;
        hints.push({
          image: decorationBadge,
          name: 'Mission Complete! 🏛️',
          description: `Finished in ${time}s! Beautiful mandap decoration!`,
          priority: 1
        });
      }
    }
    
    // ==================== FREE DECORATE MODE ====================
    if (sceneState.currentMode === GAME_MODES.FREE_DECORATE) {
      hints.push({
        image: freeDecorateIcon,
        name: 'Free Decorating',
        description: 'Drag and place decorations anywhere on your mandap!',
        priority: 1
      });
      
      hints.push({
        image: flowerGarland,
        name: 'Drag & Drop',
        description: 'Tap and drag flower garlands, drapes, diyas, and petals!',
        priority: 2
      });
      
      hints.push({
        image: silkDrape,
        name: 'Rotate Decorations',
        description: 'Use the rotate button to angle decorations perfectly!',
        priority: 3
      });
      
      hints.push({
        image: diyaLamp,
        name: 'Scale Decorations',
        description: 'Use scale buttons to make decorations bigger or smaller!',
        priority: 4
      });
      
      hints.push({
        image: petalScatter,
        name: 'Layer Your Design',
        description: 'Place decorations on top of each other to create depth!',
        priority: 5
      });
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Mandap is a traditional canopy for weddings and celebrations!',
    'Mission Mode: Drag decorations to correct spots!',
    'Free Mode: Rotate and scale to customize your design!',
    'Use flowers, drapes, diyas, and petals to decorate!',
    'Complete missions fast to get better time scores!'
  ]
};