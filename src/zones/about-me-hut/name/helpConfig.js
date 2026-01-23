// zones/about-me-hut/name/helpConfig.js

// Import game object images
import babyGaneshaImg from './assets/images/baby-ganesha-sit.png';
import holiIcon from './assets/images/holi.png';
import diwaliIcon from './assets/images/diwali.png';
import ganeshChaturthiIcon from './assets/images/chaturthi.png';
import janImg from './assets/images/months/january.png';

export const nameBirthdayHelpConfig = {
  sceneId: 'name-birthday',
  sceneName: 'Name & Birthday',

  getHints: (sceneState) => {
    const hints = [];
    const { gamePhase } = sceneState;

    // INTRO PHASE
    if (gamePhase === 'intro') {
      hints.push({
        image: babyGaneshaImg,
        name: 'Baby Ganesha',
        description: 'Tap baby Ganesha to start learning about names and birthdays!',
        priority: 1
      });
    }

    // GANESHA'S NAME BALLOONS
    if (gamePhase === 'name-balloons') {
      hints.push({
        name: 'Pop the Balloons!',
        description: 'Tap the balloons in order to spell Ganesha\'s name: G-A-N-E-S-H-A!',
        priority: 1
      });
      hints.push({
        name: 'Tip',
        description: 'Each balloon you pop reveals one letter. Pop all 7 to complete the name!',
        priority: 2
      });
    }

    // GANESHA'S BIRTHDAY - MONTH SELECTION
    if (gamePhase === 'birthday-month') {
      hints.push({
        image: janImg,
        name: 'Find the Month',
        description: 'Ganesha\'s birthday is in different months each year! Tap months to find when it usually falls.',
        priority: 1
      });
      hints.push({
        name: 'Hint',
        description: 'Ganesh Chaturthi is usually in August or September!',
        priority: 2
      });
    }

    // GANESHA'S BIRTHDAY - DATE SELECTION
    if (gamePhase === 'birthday-date') {
      hints.push({
        name: 'Find the Date',
        description: 'Tap the dates to find when Ganesha\'s birthday celebration happens!',
        priority: 1
      });
    }

    // CHILD'S NAME INPUT
    if (gamePhase === 'child-name-intro' || gamePhase === 'child-name-input') {
      hints.push({
        name: 'Your Turn!',
        description: 'Type your name using the keyboard. Tap the letters!',
        priority: 1
      });
      hints.push({
        name: 'Tip',
        description: 'Watch as each letter appears in a colorful bubble!',
        priority: 2
      });
    }

    // CHILD'S BIRTHDAY - DATE INPUT
    if (gamePhase === 'child-birthday-date' || gamePhase === 'birthday-intro') {
      hints.push({
        image: janImg,
        name: 'Your Birthday',
        description: 'First pick your birth month, then pick the date!',
        priority: 1
      });
    }

    // CHILD'S FESTIVAL CHOICE
    if (gamePhase === 'child-festival-choice') {
      hints.push({
        image: ganeshChaturthiIcon,
        name: 'Favorite Festival',
        description: 'Tap your favorite festival from the choices!',
        priority: 1
      });
      hints.push({
        image: holiIcon,
        name: 'Options',
        description: 'Choose from Holi, Diwali, Janmashtami, or Ganesh Chaturthi!',
        priority: 2
      });
    }

    return hints;
  },

  generalTips: [
    'First learn Ganesha\'s name and birthday, then share yours!',
    'Pop balloons to spell G-A-N-E-S-H-A!',
    'Ganesh Chaturthi is usually in August or September.',
    'Type your name letter by letter.',
    'Pick your birth month first, then the date!',
    'Choose your favorite Indian festival at the end!'
  ]
};
