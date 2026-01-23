// zones/festival-square/scenes/Game2-rangoli/helpConfig.js
// Help menu configuration for Rangoli Game (Festival Square)

// Import images (adjust paths as needed)
import lotusIcon from './assets/images/lotus-icon.png';
import peacockIcon from './assets/images/peacock-icon.png';
import colorPalette from './assets/images/color-palette.png';
import rangoliPattern from './assets/images/rangoli-pattern.png';
import ganeshaArtist from './assets/images/ganesha-artist.png';
import rangoliBadge from './assets/images/rangoli-badge.png';

// Phase constants
const PHASES = {
  INTRODUCTION: 'introduction',
  SELECTION: 'selection',
  COLORING: 'coloring',
  CELEBRATION: 'celebration',
  COMPLETE: 'complete'
};

export const festivalRangoliHelpConfig = {
  sceneId: 'game2-rangoli',
  sceneName: 'Rangoli Art',
  zoneId: 'festival-square',
  
  // Dynamic hints based on phase
  getHints: (sceneState) => {
    const hints = [];
    
    // ==================== INTRODUCTION ====================
    if (sceneState.currentStep === PHASES.INTRODUCTION) {
      hints.push({
        image: ganeshaArtist,
        name: 'Welcome to Rangoli!',
        description: 'Create beautiful traditional Indian floor art with colorful patterns!',
        priority: 1
      });
      
      hints.push({
        image: rangoliPattern,
        name: 'What is Rangoli?',
        description: 'Traditional art made during festivals to welcome guests and bring good luck!',
        priority: 2
      });
    }
    
    // ==================== DESIGN SELECTION ====================
    if (sceneState.currentStep === PHASES.SELECTION) {
      hints.push({
        image: rangoliBadge,
        name: 'Choose Your Design',
        description: 'Pick from Sacred Lotus, Dancing Peacock, Diya Lights, or Ganesha patterns!',
        priority: 1
      });
      
      hints.push({
        image: lotusIcon,
        name: 'Design Difficulty',
        description: 'Start with Easy designs like Lotus, then try Medium and Hard patterns!',
        priority: 2
      });
      
      hints.push({
        image: peacockIcon,
        name: 'Cultural Meanings',
        description: 'Each design has special meaning - Lotus brings prosperity, Peacock brings fortune!',
        priority: 3
      });
    }
    
    // ==================== COLORING ====================
    if (sceneState.currentStep === PHASES.COLORING) {
      const currentDesign = sceneState.selectedDesign;
      
      hints.push({
        image: rangoliPattern,
        name: `Creating: ${currentDesign?.name || 'Rangoli'}`,
        description: currentDesign?.culturalNote || 'Tap sections to fill them with beautiful colors!',
        priority: 1
      });
      
      hints.push({
        image: colorPalette,
        name: 'How to Color',
        description: 'Pick a color from the palette, then tap any white section to fill it!',
        priority: 2
      });
      
      // Show progress
      const totalSections = currentDesign?.sections || 24;
      const coloredSections = sceneState.coloredSections?.length || 0;
      
      if (coloredSections > 0 && coloredSections < totalSections) {
        hints.push({
          image: rangoliPattern,
          name: `Progress: ${coloredSections}/${totalSections}`,
          description: `${totalSections - coloredSections} more section${totalSections - coloredSections > 1 ? 's' : ''} to complete your rangoli!`,
          priority: 3
        });
      }
      
      hints.push({
        image: colorPalette,
        name: 'Color Palette',
        description: 'Choose from vibrant festival colors - red, orange, yellow, green, blue, purple, pink!',
        priority: 4
      });
      
      hints.push({
        image: rangoliBadge,
        name: 'Symmetry Matters',
        description: 'Traditional rangolis are symmetrical - try using the same colors on opposite sides!',
        priority: 5
      });
    }
    
    // ==================== CELEBRATION ====================
    if (sceneState.currentStep === PHASES.CELEBRATION) {
      hints.push({
        image: rangoliBadge,
        name: 'Rangoli Complete! 🎨',
        description: 'Your beautiful festival art is finished! Create another or play again!',
        priority: 1
      });
      
      hints.push({
        image: ganeshaArtist,
        name: 'Cultural Blessing',
        description: 'Beautiful artwork brings blessings and good fortune to your home!',
        priority: 2
      });
    }
    
    return hints;
  },
  
  // General tips (always shown)
  generalTips: [
    'Rangoli is traditional Indian floor art made during festivals!',
    'Pick a color from the palette, then tap sections to fill!',
    'Try to make your design symmetrical like real rangolis!',
    'Each design has cultural meaning and blessings!',
    'Complete all sections to finish your beautiful artwork!'
  ]
};