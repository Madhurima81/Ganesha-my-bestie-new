// zones/festival-square/scenes/Game3-modak/helpConfig.js
// Help menu configuration for Modak Cooking Game (Festival Square)

// Import images (adjust paths as needed)
import brassMixingBowl from './assets/images/brass-mixing-bowl-empty.png';
import coconutBowl from './assets/images/coconut-bowl.png';
import jaggeryBowl from './assets/images/jaggery-bowl.png';
import riceBowl from './assets/images/rice-bowl.png';
import perfectModakDough from './assets/images/perfect-modak-dough.png';
import woodenMold from './assets/images/wooden-mold.png';
import perfectModak from './assets/images/perfect-modak.png';
import ganeshaChef from './assets/images/ganesha-chef.png';
import cookingBadge from './assets/images/cooking-badge.png';
import stepIconMix from './assets/images/step-icon-mix.png';
import stepIconDough from './assets/images/step-icon-dough.png';
import stepIconShape from './assets/images/step-icon-shape.png';
import stepIconFill from './assets/images/step-icon-fill.png';
import stepIconSteam from './assets/images/step-icon-steam.png';

// Game steps
const STEPS = {
  INTRODUCTION: 'introduction',
  MIX_FILLING: 'mix_filling',
  MAKE_DOUGH: 'make_dough',
  SHAPE_DOUGH: 'shape_dough',
  FILL_CLOSE: 'fill_close',
  STEAM_MODAKS: 'steam_modaks',
  COMPLETE: 'complete'
};

export const festivalModakHelpConfig = {
  sceneId: 'game3-modak',
  sceneName: 'Modak Cooking',
  zoneId: 'festival-square',
  
  // Dynamic hints based on current step
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== INTRODUCTION ====================
    if (sceneState.currentStep === STEPS.INTRODUCTION) {
      hints.push({
        image: ganeshaChef,
        name: 'Welcome to Modak Cooking!',
        description: 'Learn to make Ganesha\'s favorite sweet - traditional modak!',
        priority: 1
      });
      
      hints.push({
        image: perfectModak,
        name: 'What is Modak?',
        description: 'Sweet dumpling filled with coconut and jaggery - Ganesha\'s most loved treat!',
        priority: 2
      });
      
      hints.push({
        image: cookingBadge,
        name: '5 Cooking Steps',
        description: 'Mix filling → Make dough → Shape dough → Fill & close → Steam cook!',
        priority: 3
      });
    }
    
    // ==================== STEP 1: MIX FILLING ====================
    if (sceneState.currentStep === STEPS.MIX_FILLING) {
      hints.push({
        image: stepIconMix,
        name: 'Step 1: Mix Filling',
        description: 'Add coconut, jaggery, and stir the sweet filling!',
        priority: 1
      });
      
      hints.push({
        image: coconutBowl,
        name: 'Add Coconut',
        description: 'Tap the coconut bowl to add fresh grated coconut to the mixing bowl!',
        priority: 2
      });
      
      if (sceneState.actionProgress?.coconutAdded) {
        hints.push({
          image: jaggeryBowl,
          name: 'Add Jaggery',
          description: 'Tap the jaggery bowl to add sweet jaggery (natural sugar)!',
          priority: 3
        });
      }
      
      if (sceneState.actionProgress?.jaggeryAdded) {
        hints.push({
          image: brassMixingBowl,
          name: 'Stir the Mixture',
          description: 'Tap the spoon to stir everything together into sweet filling!',
          priority: 4
        });
      }
    }
    
    // ==================== STEP 2: MAKE DOUGH ====================
    if (sceneState.currentStep === STEPS.MAKE_DOUGH) {
      hints.push({
        image: stepIconDough,
        name: 'Step 2: Make Dough',
        description: 'Add rice flour, water, and mix into smooth dough!',
        priority: 1
      });
      
      hints.push({
        image: riceBowl,
        name: 'Add Rice Flour',
        description: 'Tap the rice bowl to add rice flour to make the outer covering!',
        priority: 2
      });
      
      if (sceneState.actionProgress?.flourAdded) {
        hints.push({
          image: brassMixingBowl,
          name: 'Add Water',
          description: 'Tap the water pot to add water and bind the flour!',
          priority: 3
        });
      }
      
      if (sceneState.actionProgress?.waterAdded) {
        hints.push({
          image: perfectModakDough,
          name: 'Mix the Dough',
          description: 'Tap to knead everything into smooth, perfect dough!',
          priority: 4
        });
      }
    }
    
    // ==================== STEP 3: SHAPE DOUGH ====================
    if (sceneState.currentStep === STEPS.SHAPE_DOUGH) {
      hints.push({
        image: stepIconShape,
        name: 'Step 3: Shape Dough',
        description: 'Place dough, flatten it, and shape into a cup!',
        priority: 1
      });
      
      hints.push({
        image: perfectModakDough,
        name: 'Place Dough',
        description: 'Tap the dough ball to place it on the rolling mat!',
        priority: 2
      });
      
      if (sceneState.actionProgress?.doughPlaced) {
        hints.push({
          image: perfectModakDough,
          name: 'Flatten Dough',
          description: 'Tap to roll and flatten the dough into a round circle!',
          priority: 3
        });
      }
      
      if (sceneState.actionProgress?.doughFlattened) {
        hints.push({
          image: woodenMold,
          name: 'Shape Cup',
          description: 'Tap the wooden mold to shape the dough into a cup!',
          priority: 4
        });
      }
    }
    
    // ==================== STEP 4: FILL & CLOSE ====================
    if (sceneState.currentStep === STEPS.FILL_CLOSE) {
      hints.push({
        image: stepIconFill,
        name: 'Step 4: Fill & Close',
        description: 'Add the sweet filling and seal the modak!',
        priority: 1
      });
      
      hints.push({
        image: brassMixingBowl,
        name: 'Add Filling',
        description: 'Tap the coconut-jaggery filling bowl to add sweet filling inside!',
        priority: 2
      });
      
      if (sceneState.actionProgress?.fillingAdded) {
        hints.push({
          image: perfectModak,
          name: 'Seal Edges',
          description: 'Tap to bring the edges together and seal the modak!',
          priority: 3
        });
      }
    }
    
    // ==================== STEP 5: STEAM MODAKS ====================
    if (sceneState.currentStep === STEPS.STEAM_MODAKS) {
      hints.push({
        image: stepIconSteam,
        name: 'Step 5: Steam Cook',
        description: 'Place modak in steamer, close lid, and wait for it to cook!',
        priority: 1
      });
      
      hints.push({
        image: perfectModak,
        name: 'Add to Steamer',
        description: 'Tap the modak to place it in the brass steamer!',
        priority: 2
      });
      
      if (sceneState.actionProgress?.modakInSteamer) {
        hints.push({
          image: stepIconSteam,
          name: 'Close Lid',
          description: 'Tap the steamer lid to cover and start cooking!',
          priority: 3
        });
      }
      
      if (sceneState.actionProgress?.lidClosed) {
        hints.push({
          image: stepIconSteam,
          name: 'Wait for Steam',
          description: 'Watch the steam rise! Modak is cooking... almost ready!',
          priority: 4
        });
      }
    }
    
    // ==================== COMPLETE ====================
    if (sceneState.currentStep === STEPS.COMPLETE) {
      hints.push({
        image: cookingBadge,
        name: 'Modak Complete! 🍬',
        description: 'Perfect! You made Ganesha\'s favorite sweet!',
        priority: 1
      });
      
      hints.push({
        image: ganeshaChef,
        name: 'Ganesha\'s Blessing',
        description: 'Offering modak brings wisdom and removes obstacles!',
        priority: 2
      });
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Modak is Ganesha\'s favorite sweet dumpling!',
    'Follow each step carefully - mix, dough, shape, fill, steam!',
    'Tap ingredients and tools in the correct order!',
    'Traditional recipe uses coconut and jaggery filling!',
    'Steaming makes the modak soft and delicious!'
  ]
};