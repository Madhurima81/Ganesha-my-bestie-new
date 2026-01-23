// zones/about-me-hut/food/helpConfig.js

// Import game object images
import modakImg from './assets/images/food/fav-modak.png';
import ladooImg from './assets/images/food/fav-ladoo.png';
import barfiImg from './assets/images/food/fav-barfi.png';
import redImg from './assets/images/color/fav-red.png';
import babyGaneshaImg from './assets/images/baby-ganesha.png';
import favIconFood from './assets/images/fav-icon-food.png';
import favIconColor from './assets/images/fav-icon-color.png';
import favIconActivity from './assets/images/fav-icon-activity.png';

export const favoriteFoodHelpConfig = {
  sceneId: 'favorite-food',
  sceneName: 'Favorite Things',

  getHints: (sceneState) => {
    const hints = [];
    const { gamePhase } = sceneState;

    // INTRO PHASE
    if (gamePhase === 'intro') {
      hints.push({
        image: babyGaneshaImg,
        name: 'Baby Ganesha',
        description: 'Tap baby Ganesha to start learning about favorites!',
        priority: 1
      });
    }

    // GANESHA'S FOOD CHOICE
    if (gamePhase === 'food-choice') {
      hints.push({
        image: modakImg,
        name: 'Find Ganesha\'s Favorite',
        description: 'Tap the foods to find what Ganesha loves most! Wrong guesses will disappear.',
        priority: 1
      });
      hints.push({
        image: favIconFood,
        name: 'Tip',
        description: 'Ganesha LOVES modaks - sweet dumplings! Keep trying until you find it.',
        priority: 2
      });
    }

    // GANESHA'S COLOR CHOICE
    if (gamePhase === 'color-choice') {
      hints.push({
        image: redImg,
        name: 'Find Ganesha\'s Color',
        description: 'Tap the colors to find Ganesha\'s favorite! Red is an auspicious color.',
        priority: 1
      });
    }

    // GANESHA'S ACTIVITY CHOICE
    if (gamePhase === 'activity-choice') {
      hints.push({
        image: favIconActivity,
        name: 'Find Ganesha\'s Activity',
        description: 'What does Ganesha love doing? Tap to find out!',
        priority: 1
      });
    }

    // CHILD'S FOOD CHOICE
    if (gamePhase === 'child-food-choice') {
      hints.push({
        image: favIconFood,
        name: 'Your Turn!',
        description: 'Tap your favorite food! You can also draw or write it.',
        priority: 1
      });
    }

    // CHILD'S COLOR CHOICE
    if (gamePhase === 'child-color-choice') {
      hints.push({
        image: favIconColor,
        name: 'Your Favorite Color',
        description: 'Pick your favorite color from the rainbow!',
        priority: 1
      });
    }

    // CHILD'S ACTIVITY CHOICE
    if (gamePhase === 'child-activity-choice') {
      hints.push({
        image: favIconActivity,
        name: 'Your Favorite Activity',
        description: 'Choose what you love doing! Or draw/write your own.',
        priority: 1
      });
    }

    // FRIEND INPUT
    if (gamePhase === 'child-friend-input') {
      hints.push({
        name: 'Best Friend',
        description: 'Type your best friend\'s name using the keyboard!',
        priority: 1
      });
    }

    return hints;
  },

  generalTips: [
    'First learn about Ganesha\'s favorites, then share yours!',
    'You can pick from choices, draw, or type your answers!',
    'Wrong guesses disappear - keep trying!',
    'Look at the top to see which step you\'re on.',
    'Mooshika the mouse helps guide you!'
  ]
};
