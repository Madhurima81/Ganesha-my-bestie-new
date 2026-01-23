// zones/about-me-hut/family-tree/helpConfig.js

// Import game object images
import babyGaneshaImg from './assets/images/ganesha/family-ganesha.png';
import shivaImg from './assets/images/ganesha/family-shiva.png';
import parvatiImg from './assets/images/ganesha/family-parvati.png';
import kartikeyaImg from './assets/images/ganesha/family-kartkeya.png';
import familyTree from './assets/images/family-tree.png';
import childMyselfImg from './assets/images/child/family-myself.png';

export const familyTreeHelpConfig = {
  sceneId: 'family-tree',
  sceneName: 'Family Tree',

  getHints: (sceneState) => {
    const hints = [];
    const { gamePhase, placedGaneshaMembers = [] } = sceneState;

    // INTRO PHASE
    if (gamePhase === 'intro') {
      hints.push({
        image: familyTree,
        name: 'Start the Game',
        description: 'Tap the "Start" button to begin building Ganesha\'s family tree!',
        priority: 1
      });
    }

    // GANESHA'S FAMILY TREE
    if (gamePhase === 'ganeshaTree') {
      // Show different hints based on progress
      if (placedGaneshaMembers.length === 0) {
        hints.push({
          image: familyTree,
          name: 'Empty Circles',
          description: 'Tap any empty circle on the tree to place a family member!',
          priority: 1
        });
        hints.push({
          image: shivaImg,
          name: 'Ganesha\'s Family',
          description: 'Choose from: Shiva (father), Parvati (mother), Kartikeya (brother), and baby Ganesha!',
          priority: 2
        });
      } else if (placedGaneshaMembers.length < 4) {
        hints.push({
          name: `Progress: ${placedGaneshaMembers.length}/4`,
          description: 'Keep going! Tap the remaining empty circles to place more family members.',
          priority: 1
        });
        hints.push({
          name: 'Tap to Learn',
          description: 'Tap any placed family member to learn a fun fact about them!',
          priority: 2
        });
      } else {
        hints.push({
          name: 'Tree Complete!',
          description: 'You placed all 4 family members! Tap "All Done!" to continue.',
          priority: 1
        });
      }
    }

    // TRANSITION PHASE
    if (gamePhase === 'transition') {
      hints.push({
        image: babyGaneshaImg,
        name: 'Your Turn Next!',
        description: 'Tap "Make My Tree" to create your own family tree!',
        priority: 1
      });
    }

    // CHILD'S FAMILY INPUT
    if (gamePhase === 'childInput') {
      hints.push({
        image: childMyselfImg,
        name: 'Build Your Tree',
        description: 'Tap the icons at the bottom to add your family members!',
        priority: 1
      });
      hints.push({
        name: 'Name Your Family',
        description: 'After adding each person, type their name to personalize your tree.',
        priority: 2
      });
      hints.push({
        name: 'Finish When Ready',
        description: 'Add as many family members as you like, then tap "All Done!"',
        priority: 3
      });
    }

    // SIDE BY SIDE (FINALE)
    if (gamePhase === 'sideBySide') {
      hints.push({
        name: 'Beautiful Trees!',
        description: 'See Ganesha\'s family tree and your family tree side by side!',
        priority: 1
      });
      hints.push({
        name: 'Celebration',
        description: 'You completed the family tree game! Tap "Continue" to finish.',
        priority: 2
      });
    }

    return hints;
  },

  generalTips: [
    'First build Ganesha\'s family tree, then make your own!',
    'Tap empty circles to place family members.',
    'Choose the correct family member from the options.',
    'Wrong choices shake and disappear - try again!',
    'Tap placed members to learn fun facts!',
    'Add as many family members as you want to your tree.',
    'Type names to personalize your family tree!'
  ]
};
