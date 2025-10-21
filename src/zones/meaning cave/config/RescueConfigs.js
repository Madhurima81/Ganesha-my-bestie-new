// zones/cave-of-secrets/config/RescueConfigs.js
// ═══════════════════════════════════════════════════════════════
// ALL RESCUE IMAGES IMPORTED HERE - ONE CENTRAL LOCATION
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// SYMBOL IMAGES FOR PARTICLE FLOW
// ═══════════════════════════════════════════════════════════════
import vakratundaSymbol from '../assets/images/symbols/vakratunda-symbol.png';
import mahakayaSymbol from '../assets/images/symbols/mahakaya-symbol.png';
import suryakotiSymbol from '../assets/images/symbols/suryakoti-symbol.png';
import samaprabhaSymbol from '../assets/images/symbols/samaprabha-symbol.png';
import nirvighnamSymbol from '../assets/images/symbols/nirvighnam-symbol.png';
import kurumedevaSymbol from '../assets/images/symbols/kurumedeva-symbol.png';
import sarvakaryeshuSymbol from '../assets/images/symbols/sarvakaryeshu-symbol.png';
import sarvadaSymbol from '../assets/images/symbols/sarvada-symbol.png';

// ═══════════════════════════════════════════════════════════════
// SCENE 1: Vakratunda & Mahakaya
// ═══════════════════════════════════════════════════════════════
import mouseTrapped from '../scenes/VakratundaMahakaya/assets/rescue/mouse-trapped.png';
import mouseSaved from '../scenes/VakratundaMahakaya/assets/rescue/mouse-saved.png';
import mouseIcon from '../scenes/VakratundaMahakaya/assets/rescue/mouse-icon.png';
import pathStraight from '../scenes/VakratundaMahakaya/assets/rescue/path-straight.png';
import pathCurved from '../scenes/VakratundaMahakaya/assets/rescue/path-curved.png';
import pathZigzag from '../scenes/VakratundaMahakaya/assets/rescue/path-zigzag.png';

import rockCrushing from '../scenes/VakratundaMahakaya/assets/rescue/rock-crushing.png';
import rabbitSaved from '../scenes/VakratundaMahakaya/assets/rescue/rabbit-saved.png';
import rabbitIcon from '../scenes/VakratundaMahakaya/assets/rescue/rabbit-icon.png';

// ═══════════════════════════════════════════════════════════════
// SCENE 2: Suryakoti & Samaprabha
// ═══════════════════════════════════════════════════════════════
//import owlDark from '../scenes/suryakoti-samaprabha/assets/rescue/owl-dark.png';
//import owlLight from '../scenes/suryakoti-samaprabha/assets/rescue/owl-light.png';
//import owlIcon from '../scenes/suryakoti-samaprabha/assets/rescue/owl-icon.png';

//import squirrelsHungry from '../scenes/suryakoti-samaprabha/assets/rescue/squirrels-hungry.png';
//import squirrelsHappy from '../scenes/suryakoti-samaprabha/assets/rescue/squirrels-happy.png';
//import bigAcorn from '../scenes/suryakoti-samaprabha/assets/rescue/big-acorn.png';

// ═══════════════════════════════════════════════════════════════
// SCENE 3: Nirvighnam & Kurume Deva
// ═══════════════════════════════════════════════════════════════
//import deerBlocked from '../scenes/nirvighnam-kurumedeva/assets/rescue/deer-blocked.png';
//import deerFree from '../scenes/nirvighnam-kurumedeva/assets/rescue/deer-free.png';
//import deerIcon from '../scenes/nirvighnam-kurumedeva/assets/rescue/deer-icon.png';
//import obstacleRock from '../scenes/nirvighnam-kurumedeva/assets/rescue/obstacle-rock.png';
//import obstacleLog from '../scenes/nirvighnam-kurumedeva/assets/rescue/obstacle-log.png';
//import obstacleBrambles from '../scenes/nirvighnam-kurumedeva/assets/rescue/obstacle-brambles.png';

//import birdFallen from '../scenes/nirvighnam-kurumedeva/assets/rescue/bird-fallen.png';
//import birdNest from '../scenes/nirvighnam-kurumedeva/assets/rescue/bird-nest.png';
//import ganeshaTrunkGlow from '../scenes/nirvighnam-kurumedeva/assets/rescue/ganesha-trunk-glow.png';

// ═══════════════════════════════════════════════════════════════
// SCENE 4: Sarvakaryeshu & Sarvada
// ═══════════════════════════════════════════════════════════════
//import puppyConfused from '../scenes/sarvakaryeshu-sarvada/assets/rescue/puppy-confused.png';
//import puppyHappy from '../scenes/sarvakaryeshu-sarvada/assets/rescue/puppy-happy.png';

//import catAlone from '../scenes/sarvakaryeshu-sarvada/assets/rescue/cat-alone.png';
//import catCared from '../scenes/sarvakaryeshu-sarvada/assets/rescue/cat-cared.png';

// ═══════════════════════════════════════════════════════════════
// EXPORT CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════

export const RESCUE_CONFIGS = {
  
  vakratunda: {
    wordName: 'Vakratunda',
    sanskritWord: 'वक्रतुण्ड',
    meaning: 'Curved Trunk',
    
    // ⭐ SYMBOL IMAGE FOR PARTICLE FLOW
    symbolImage: vakratundaSymbol,
    
    question: 'What does VAKRA mean?',
    hint: 'Think about the trunk path you traced!',
    taskInstruction: 'Click the path that means VAKRA:',
    
    beforeImage: mouseTrapped,
    afterImage: mouseSaved,
    animalIcon: mouseIcon,
    particleColor: '#FFD700',
    
    options: [
      {
        id: 'straight',
        label: 'Straight Path',
        icon: '📏',
        isCorrect: false
      },
      {
        id: 'curved',
        label: 'Curved Path',
        icon: '🌙',
        isCorrect: true
      },
      {
        id: 'zigzag',
        label: 'Zigzag Path',
        icon: '⚡',
        isCorrect: false
      }
    ],
    
    successMessage: 'You knew VAKRA means curved!',
    animalSavedMessage: 'Mouse reached the cheese! 🧀'
  },

  mahakaya: {
    wordName: 'Mahakaya',
    sanskritWord: 'महाकाय',
    meaning: 'Great Body',
    
    // ⭐ SYMBOL IMAGE FOR PARTICLE FLOW
    symbolImage: mahakayaSymbol,
    
    question: 'What does MAHAKAYA mean?',
    hint: 'Think about how Ganesha grew mighty!',
    taskInstruction: 'Click the power that means MAHAKAYA:',
    
    beforeImage: rockCrushing,
    afterImage: rabbitSaved,
    animalIcon: rabbitIcon,
    particleColor: '#FF8C42',
    
    options: [
      {
        id: 'fast',
        label: 'Fast Speed',
        icon: '⚡',
        isCorrect: false
      },
      {
        id: 'mighty',
        label: 'Mighty Strength',
        icon: '💪',
        isCorrect: true
      },
      {
        id: 'tiny',
        label: 'Tiny Size',
        icon: '🤏',
        isCorrect: false
      }
    ],
    
    successMessage: 'You knew MAHAKAYA means mighty!',
    animalSavedMessage: 'Rabbit is free! 🐰'
  },

  suryakoti: {
  wordName: 'Suryakoti',
  sanskritWord: 'सूर्यकोटि',
  meaning: 'Million Suns',
  
  // ⭐ TEMPORARY: Reuse vakratunda symbol until you create suryakoti-symbol.png
    symbolImage: suryakotiSymbol,
  
  question: 'What does SURYA mean?',
  hint: 'What did you collect to light the cave?',
  taskInstruction: 'Click the object that means SURYA:',
  
  // ⭐ TEMPORARY: Reuse mouse images until you create owl images
  beforeImage: mouseTrapped,
  afterImage: mouseSaved,
  animalIcon: mouseIcon,
  particleColor: '#FFA500',
  
  options: [
    {
      id: 'moon',
      label: 'Moon',
      icon: '🌙',
      isCorrect: false
    },
    {
      id: 'sun',
      label: 'Sun',
      icon: '☀️',
      isCorrect: true
    },
    {
      id: 'star',
      label: 'Star',
      icon: '⭐',
      isCorrect: false
    }
  ],
  
  successMessage: 'You knew SURYA means sun!',
  animalSavedMessage: 'Owl found its way home! 🦉'
},

samaprabha: {
  wordName: 'Samaprabha',
  sanskritWord: 'समप्रभ',
  meaning: 'Equal Brilliance',
  
  // ⭐ TEMPORARY: Reuse mahakaya symbol until you create samaprabha-symbol.png
    symbolImage: samaprabhaSymbol,
  
  question: 'What does SAMA mean?',
  hint: 'How did you help all the children equally?',
  taskInstruction: 'Click how to share that means SAMA:',
  
  // ⭐ TEMPORARY: Reuse rabbit images until you create squirrel images
  beforeImage: rockCrushing,
  afterImage: rabbitSaved,
  animalIcon: rabbitIcon,
  particleColor: '#27ae60',
  
  options: [
    {
      id: 'more',
      label: 'Give MORE to one',
      icon: '⬆️',
      isCorrect: false
    },
    {
      id: 'equal',
      label: 'Share EQUALLY',
      icon: '⚖️',
      isCorrect: true
    },
    {
      id: 'less',
      label: 'Give LESS to all',
      icon: '⬇️',
      isCorrect: false
    }
  ],
  
  successMessage: 'You knew SAMA means equal!',
  animalSavedMessage: 'Everyone got a fair share! 🐿️'
},

nirvighnam: {
    wordName: 'Nirvighnam',
    sanskritWord: 'निर्विघ्नम्',
    meaning: 'Without Obstacles',
    
    symbolImage: nirvighnamSymbol,
    
    question: 'What does VIGHNA mean?',
    hint: 'What did you remove from the sacred rocks?',
    taskInstruction: 'Click the word that means VIGHNA:',
    
  beforeImage: mouseTrapped,
  afterImage: mouseSaved,
  animalIcon: mouseIcon,
  particleColor: '#FFA500',
    
    options: [
      {
        id: 'helper',
        label: 'Helper',
        icon: '🤝',
        isCorrect: false
      },
      {
        id: 'obstacle',
        label: 'Obstacle',
        icon: '🚧',
        isCorrect: true
      },
      {
        id: 'path',
        label: 'Path',
        icon: '🛤️',
        isCorrect: false
      }
    ],
    
    successMessage: 'You knew VIGHNA means obstacle!',
    animalSavedMessage: 'Path is clear! 🦌'
  },

  kurumedeva: {
    wordName: 'Kurume Deva',
    sanskritWord: 'कुरुमे देव',
    meaning: 'Divine Help',
    
    symbolImage: kurumedevaSymbol,
    
    question: 'What does DEVA mean?',
    hint: 'Who gave you the sacred rocks?',
    taskInstruction: 'Click who DEVA refers to:',
    
      beforeImage: rockCrushing,
  afterImage: rabbitSaved,
  animalIcon: rabbitIcon,
  particleColor: '#27ae60',
    
    options: [
      {
        id: 'human',
        label: 'Call Human',
        icon: '👤',
        isCorrect: false
      },
      {
        id: 'animal',
        label: 'Call Animal',
        icon: '🐘',
        isCorrect: false
      },
      {
        id: 'divine',
        label: 'Call DIVINE',
        icon: '✨',
        isCorrect: true
      }
    ],
    
    successMessage: 'You knew DEVA means divine!',
    animalSavedMessage: 'Divine help saved the bird! 🐦'
  },

   sarvakaryeshu: {
    wordName: 'Sarvakaryeshu',
    sanskritWord: 'सर्वकार्येषु',
    meaning: 'In All Tasks',
    
    symbolImage: sarvakaryeshuSymbol,
    
    question: 'What does SARVA mean?',
    hint: 'How many tasks can Ganesha help with?',
    taskInstruction: 'Click how many tasks SARVA means:',
    
   beforeImage: mouseTrapped,
    afterImage: mouseSaved,
    animalIcon: mouseIcon,
    particleColor: '#FFD700',
    
    
    options: [
      {
        id: 'one',
        label: 'One Task',
        icon: '1️⃣',
        isCorrect: false
      },
      {
        id: 'some',
        label: 'Some Tasks',
        icon: '➕',
        isCorrect: false
      },
      {
        id: 'all',
        label: 'ALL Tasks',
        icon: '✨',
        isCorrect: true
      }
    ],
    
    successMessage: 'You knew SARVA means all!',
    animalSavedMessage: 'Puppy is happy in every task! 🐾'
  },

  sarvada: {
    wordName: 'Sarvada',
    sanskritWord: 'सर्वदा',
    meaning: 'Always',
    
    symbolImage: sarvadaSymbol,
    
    question: 'What does SARVADA mean?',
    hint: 'When can you help others?',
    taskInstruction: 'Click when SARVADA means:',
    
   beforeImage: mouseTrapped,
    afterImage: mouseSaved,
    animalIcon: mouseIcon,
    particleColor: '#FFD700',
    
    
    options: [
      {
        id: 'sometimes',
        label: 'Sometimes',
        icon: '⏱️',
        isCorrect: false
      },
      {
        id: 'never',
        label: 'Never',
        icon: '🚫',
        isCorrect: false
      },
      {
        id: 'always',
        label: 'ALWAYS',
        icon: '♾️',
        isCorrect: true
      }
    ],
    
    successMessage: 'You knew SARVADA means always!',
    animalSavedMessage: 'Cat is cared for all day! 🐱'
  }

  /*suryakoti: {
    wordName: 'Suryakoti',
    sanskritWord: 'सूर्यकोटि',
    meaning: 'Million Suns',
    
    symbolImage: suryakotiSymbol,
    
    question: 'What does SURYA mean?',
    hint: 'What did you collect to light the cave?',
    taskInstruction: 'Click the object that means SURYA:',
    
    beforeImage: owlDark,
    afterImage: owlLight,
    animalIcon: owlIcon,
    particleColor: '#FFA500',
    
    options: [
      {
        id: 'moon',
        label: 'Moon',
        icon: '🌙',
        isCorrect: false
      },
      {
        id: 'sun',
        label: 'Sun',
        icon: '☀️',
        isCorrect: true
      },
      {
        id: 'star',
        label: 'Star',
        icon: '⭐',
        isCorrect: false
      }
    ],
    
    successMessage: 'You knew SURYA means sun!',
    animalSavedMessage: 'Owl found its way home! 🦉'
  },

  samaprabha: {
    wordName: 'Samaprabha',
    sanskritWord: 'समप्रभ',
    meaning: 'Equal Brilliance',
    
    symbolImage: samaprabhaSymbol,
    
    question: 'What does SAMA mean?',
    hint: 'How did you help all the children equally?',
    taskInstruction: 'Click how to share that means SAMA:',
    
    beforeImage: squirrelsHungry,
    afterImage: squirrelsHappy,
    particleColor: '#27ae60',
    
    options: [
      {
        id: 'more',
        label: 'Give MORE to one',
        icon: '⬆️',
        isCorrect: false
      },
      {
        id: 'equal',
        label: 'Share EQUALLY',
        icon: '⚖️',
        isCorrect: true
      },
      {
        id: 'less',
        label: 'Give LESS to all',
        icon: '⬇️',
        isCorrect: false
      }
    ],
    
    successMessage: 'You knew SAMA means equal!',
    animalSavedMessage: 'Everyone got a fair share! 🐿️'
  },

  nirvighnam: {
    wordName: 'Nirvighnam',
    sanskritWord: 'निर्विघ्नम्',
    meaning: 'Without Obstacles',
    
    symbolImage: nirvighnamSymbol,
    
    question: 'What does VIGHNA mean?',
    hint: 'What did you remove from the sacred rocks?',
    taskInstruction: 'Click the word that means VIGHNA:',
    
    beforeImage: deerBlocked,
    afterImage: deerFree,
    animalIcon: deerIcon,
    particleColor: '#3498db',
    
    options: [
      {
        id: 'helper',
        label: 'Helper',
        icon: '🤝',
        isCorrect: false
      },
      {
        id: 'obstacle',
        label: 'Obstacle',
        icon: '🚧',
        isCorrect: true
      },
      {
        id: 'path',
        label: 'Path',
        icon: '🛤️',
        isCorrect: false
      }
    ],
    
    successMessage: 'You knew VIGHNA means obstacle!',
    animalSavedMessage: 'Path is clear! 🦌'
  },

  kurumedeva: {
    wordName: 'Kurume Deva',
    sanskritWord: 'कुरुमे देव',
    meaning: 'Divine Help',
    
    symbolImage: kurumedevaSymbol,
    
    question: 'What does DEVA mean?',
    hint: 'Who gave you the sacred rocks?',
    taskInstruction: 'Click who DEVA refers to:',
    
    beforeImage: birdFallen,
    afterImage: birdNest,
    animalIcon: ganeshaTrunkGlow,
    particleColor: '#9b59b6',
    
    options: [
      {
        id: 'human',
        label: 'Call Human',
        icon: '👤',
        isCorrect: false
      },
      {
        id: 'animal',
        label: 'Call Animal',
        icon: '🐘',
        isCorrect: false
      },
      {
        id: 'divine',
        label: 'Call DIVINE',
        icon: '✨',
        isCorrect: true
      }
    ],
    
    successMessage: 'You knew DEVA means divine!',
    animalSavedMessage: 'Divine help saved the bird! 🐦'
  },

  sarvakaryeshu: {
    wordName: 'Sarvakaryeshu',
    sanskritWord: 'सर्वकार्येषु',
    meaning: 'In All Tasks',
    
    symbolImage: sarvakaryeshuSymbol,
    
    question: 'What does SARVA mean?',
    hint: 'How many tasks can Ganesha help with?',
    taskInstruction: 'Click how many tasks SARVA means:',
    
    beforeImage: puppyConfused,
    afterImage: puppyHappy,
    particleColor: '#e67e22',
    
    options: [
      {
        id: 'one',
        label: 'One Task',
        icon: '1️⃣',
        isCorrect: false
      },
      {
        id: 'some',
        label: 'Some Tasks',
        icon: '➕',
        isCorrect: false
      },
      {
        id: 'all',
        label: 'ALL Tasks',
        icon: '✨',
        isCorrect: true
      }
    ],
    
    successMessage: 'You knew SARVA means all!',
    animalSavedMessage: 'Puppy is happy in every task! 🐾'
  },

  sarvada: {
    wordName: 'Sarvada',
    sanskritWord: 'सर्वदा',
    meaning: 'Always',
    
    symbolImage: sarvadaSymbol,
    
    question: 'What does SARVADA mean?',
    hint: 'When can you help others?',
    taskInstruction: 'Click when SARVADA means:',
    
    beforeImage: catAlone,
    afterImage: catCared,
    particleColor: '#1abc9c',
    
    options: [
      {
        id: 'sometimes',
        label: 'Sometimes',
        icon: '⏱️',
        isCorrect: false
      },
      {
        id: 'never',
        label: 'Never',
        icon: '🚫',
        isCorrect: false
      },
      {
        id: 'always',
        label: 'ALWAYS',
        icon: '♾️',
        isCorrect: true
      }
    ],
    
    successMessage: 'You knew SARVADA means always!',
    animalSavedMessage: 'Cat is cared for all day! 🐱'
  }*/

};