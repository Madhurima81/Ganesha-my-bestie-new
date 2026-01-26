// zones/meaning-cave/scenes/sarvakaryeshu-sarvada/SarvakaryeshuSarvada.jsx
import React, { useState, useEffect, useRef } from 'react';
import './SarvakaryeshuSarvada.css';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import { useGameCoach, TriggerCoach } from '../../../../lib/components/coach/GameCoach';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import Fireworks from '../../../../lib/components/feedback/Fireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';

// Scene-specific components
import SanskritSidebar from '../../../../lib/components/feedback/SanskritSidebar';
import DoorComponent from '../../components/DoorComponent';
import DraggableItem from '../../../../lib/components/interactive/DraggableItem';
import DropZone from '../../../../lib/components/interactive/DropZone';
import HelperSignatureAnimation from './HelperSignatureAnimation';

// Import assets
import sceneBackground from './assets/images/scene-background.png';
import doorImage from './assets/images/door-image.png';
import boyPreview from './assets/images/boy-preview.png';
import girlPreview from './assets/images/girl-preview.png';
import ganeshaIcon from './assets/images/ganesha-icon.png';
import moreOptionsButton from './assets/images/more-options-button.png';
import mooshikaCoach from './assets/images/mooshika-coach.png';

// Game 1 Background imports - 6 scenarios
import homeworkWorriedBoy from './assets/images/game 1/backgrounds/homework_child_worried_boy.png';
import homeworkWorriedGirl from './assets/images/game 1/backgrounds/homework_child_worried_girl.png';
import homeworkSuccessBoy from './assets/images/game 1/backgrounds/homework_child_success_boy.png';
import homeworkSuccessGirl from './assets/images/game 1/backgrounds/homework_child_success_girl.png';

import sportsWorriedBoy from './assets/images/game 1/backgrounds/sports_worried_boy.png';
import sportsDiscouragedGirl from './assets/images/game 1/backgrounds/sports_child_discouraged_girl.png';
import sportsSuccessBoy from './assets/images/game 1/backgrounds/sports_success_boy.png';
import sportsVictoryGirl from './assets/images/game 1/backgrounds/sports_child_victory_girl.png';

import shoelacesWorriedBoy from './assets/images/game 1/backgrounds/shoelaces_worried_boy.png';
import shoelaceFrustratedGirl from './assets/images/game 1/backgrounds/shoelace_child_frustrated_girl.png';
import shoelacesSuccessBoy from './assets/images/game 1/backgrounds/shoelaces_success_boy.png';
import shoelaceSuccessGirl from './assets/images/game 1/backgrounds/shoelace_child_success_girl.png';

import broketoyWorriedBoy from './assets/images/game 1/backgrounds/broketoy_child_worried_boy.png';
import broketoyWorriedGirl from './assets/images/game 1/backgrounds/broketoy_child_worried_girl.png';
import broketoyJoyBoy from './assets/images/game 1/backgrounds/broketoy_child_joy_boy.png';
import broketoyJoyGirl from './assets/images/game 1/backgrounds/broketoy_child_joy_girl.png';

import sharingWorriedBoy from './assets/images/game 1/backgrounds/sharing_worried_boy.png';
import sharingGreedGirl from './assets/images/game 1/backgrounds/sharing_child_greed_girl.png';
import sharingSuccessBoy from './assets/images/game 1/backgrounds/sharing_success_boy.png';
import sharingGiveGirl from './assets/images/game 1/backgrounds/sharing_child_give_girl.png';

import bikeFearBoy from './assets/images/game 1/backgrounds/bike_child_fear_boy.png';
import bikeFearGirl from './assets/images/game 1/backgrounds/bike_child_fear_girl.png';
import bikeVictoryBoy from './assets/images/game 1/backgrounds/bike_child_victory_boy.png';
import bikeVictoryGirl from './assets/images/game 1/backgrounds/bike_child_victory_girl.png';

// Game 1 Symbol imports
import homeworkSymbolFamily from './assets/images/game 1/symbols/homework_symbol_family.png';
import homeworkSymbolGaming from './assets/images/game 1/symbols/homework_symbol_gaming.png';
import homeworkSymbolGiveup from './assets/images/game 1/symbols/homework_symbol_giveup.png';
import homeworkSymbolPatience from './assets/images/game 1/symbols/homework_symbol_patience.png';
import homeworkSymbolStepbook from './assets/images/game 1/symbols/homework_symbol_stepbook.png';
import homeworkSymbolThrow from './assets/images/game 1/symbols/homework_symbol_throw.png';

import sportsSymbolFriend from './assets/images/game 1/symbols/sports_symbol_friend.png';
import sportsSymbolHide from './assets/images/game 1/symbols/sports_symbol_hide.png';
import sportsSymbolRelax from './assets/images/game 1/symbols/sports_symbol_relax.png';
import sportsSymbolScared from './assets/images/game 1/symbols/sports_symbol_toohard.png';
import sportsSymbolTry from './assets/images/game 1/symbols/sports_symbol_try.png';
import sportsSymbolUpset from './assets/images/game 1/symbols/sports_symbol_upset.png';

import shoelaceSymbolAngry from './assets/images/game 1/symbols/shoelace_symbol_angry.png';
import shoelaceSymbolHelp from './assets/images/game 1/symbols/shoelace_symbol_help.png';
import shoelaceSymbolPatient from './assets/images/game 1/symbols/shoelace_symbol_patient.png';
import shoelaceSymbolSlipOn from './assets/images/game 1/symbols/shoelace_symbol_slipon.png';
import shoelaceSymbolTape from './assets/images/game 1/symbols/shoelace_symbol_tape.png';
import shoelacesSymbolMethod from './assets/images/game 1/symbols/shoelaces_symbol_method.png';

import brokenSymbolBlame from './assets/images/game 1/symbols/broken_symbol_blame.png';
import brokenSymbolGlue from './assets/images/game 1/symbols/broken_symbol_glue.png';
import brokenSymbolHelp from './assets/images/game 1/symbols/broken_symbol_help.png';
import brokenSymbolHide from './assets/images/game 1/symbols/broken_symbol_hide.png';
import brokenSymbolSorry from './assets/images/game 1/symbols/broken_symbol_sorry.png';
import brokenSymbolThrow from './assets/images/game 1/symbols/broken_symbol_throw.png';

import sharingSymbolAngry from './assets/images/game 1/symbols/sharing_symbol_anger.png';
import sharingSymbolEscape from './assets/images/game 1/symbols/sharing_symbol_escape.png';
import sharingSymbolFairness from './assets/images/game 1/symbols/sharing_symbol_fairness.png';
import sharingSymbolGenerosity from './assets/images/game 1/symbols/sharing_symbol_generosity.png';
import sharingSymbolJoy from './assets/images/game 1/symbols/sharing_symbol_joy.png';
import sharingSymbolLight from './assets/images/game 1/symbols/sharing_symbol_fight.png';

import bikeSymbolFear from './assets/images/game 1/symbols/bike_symbol_fear.png';
import bikeSymbolFocus from './assets/images/game 1/symbols/bike_symbol_focus.png';
import bikeSymbolGiveUp from './assets/images/game 1/symbols/bike_symbol_giveup.png';
import bikeSymbolHelp from './assets/images/game 1/symbols/bike_symbol_help.png';
import bikeSymbolRelax from './assets/images/game 1/symbols/bike_symbol_relax.png';
import bikeSymbolUpset from './assets/images/game 1/symbols/bike_symbol_upset.png';

// ✅ NEW: Game 2 Background imports
import grandparentsBefore from './assets/images/game 2/backgrounds/grandparents-tech-before.png';
import grandparentsAfter from './assets/images/game 2/backgrounds/grandparents-tech-after.png';
import dogBefore from './assets/images/game 2/backgrounds/dog-scared-before.png';
import dogAfter from './assets/images/game 2/backgrounds/dog-scared-after.png';
import constructionBefore from './assets/images/game 2/backgrounds/construction-worker-before.png';
import constructionAfter from './assets/images/game 2/backgrounds/construction-worker-after.png';
import momBefore from './assets/images/game 2/backgrounds/mom-kitchen-before.png';
import momAfter from './assets/images/game 2/backgrounds/mom-kitchen-after.png';
import siblingsBefore from './assets/images/game 2/backgrounds/siblings-fight-before.png';
import siblingsAfter from './assets/images/game 2/backgrounds/siblings-fight-after.png';
import parkBefore from './assets/images/game 2/backgrounds/park-litter-before.png';
import parkAfter from './assets/images/game 2/backgrounds/park-litter-after.png';

// ✅ NEW: Game 2 Helper imports
import grandparentsTimmytime from './assets/images/game 2/helpers/grandparents_timmytime.png';
import grandparentsClearolens from './assets/images/game 2/helpers/grandparents_clearolens.png';
import grandparentsMemoleaf from './assets/images/game 2/helpers/grandparents_memoleaf.png';
import grandparentsSnuggyshawl from './assets/images/game 2/helpers/grandparents_snuggyshawl.png';

import dogSnuggyblanket from './assets/images/game 2/helpers/dog_snuggyblanket.png';
import dogAquabuddy from './assets/images/game 2/helpers/dog_aquabuddy.png';
import dogHappytail from './assets/images/game 2/helpers/dog_happytail.png';
import dogBrighttorch from './assets/images/game 2/helpers/dog_brighttorch.png';

import constructionMelodymug from './assets/images/game 2/helpers/construction_melodymug.png';
import constructionRhythmoradio from './assets/images/game 2/helpers/construction_rhythmoradio.png';
import constructionHammerhero from './assets/images/game 2/helpers/construction_hammerhero.png';
import constructionSunnyspark from './assets/images/game 2/helpers/construction_sunnyspark.png';

import momChefchintu from './assets/images/game 2/helpers/mom_chefchintu.png';
import momBubblybottle from './assets/images/game 2/helpers/mom_bubblybottle.png';
import momGigglesspoon from './assets/images/game 2/helpers/mom_gigglesspoon.png';
import momPeacemittens from './assets/images/game 2/helpers/mom_peacemittens.png';

import siblingsGigglebox from './assets/images/game 2/helpers/siblings_gigglebox.png';
import siblingsPeaceballoon from './assets/images/game 2/helpers/siblings_peaceballoon.png';
import siblingsHuggypillow from './assets/images/game 2/helpers/siblings_huggypillow.png';
import siblingsSharebear from './assets/images/game 2/helpers/siblings_sharebear.png';

import parkLeafyfriend from './assets/images/game 2/helpers/park_leafyfriend.png';
import parkCleaniebucket from './assets/images/game 2/helpers/park_cleaniebucket.png';
import parkBloomyflower from './assets/images/game 2/helpers/park_bloomyflower.png';
import parkSparklestar from './assets/images/game 2/helpers/park_sparklestar.png';

// ✅ FIXED: Correct flow sequence
const SCENE_PHASES = {
  DOOR1_ACTIVE: 'door1_active',           
  DOOR1_COMPLETE: 'door1_complete',
  CHARACTER_SELECT: 'character_select',    
  GAME1_INTRO: 'game1_intro',
  SCENARIO_UNCERTAINTY: 'scenario_uncertainty',
  SCENARIO_CLARITY: 'scenario_clarity',
  SCENARIO_CHOOSING: 'scenario_choosing',
  SCENARIO_SUCCESS: 'scenario_success',
  SARVAKARYESHU_LEARNING: 'sarvakaryeshu_learning',
  DOOR2_ACTIVE: 'door2_active',           
  DOOR2_COMPLETE: 'door2_complete',
  // ✅ NEW: Game 2 phases
  GAME2_INTRO: 'game2_intro',
  HELPER_UNCERTAINTY: 'helper_uncertainty',
  HELPER_CHOOSING: 'helper_choosing',
  HELPER_ANIMATION: 'helper_animation',
  HELPER_SUCCESS: 'helper_success',
  TRANSFORMATION: 'transformation',
  SCENE_CELEBRATION: 'scene_celebration',
  COMPLETE: 'complete'
};

// Game 1 Scenario configuration
const SCENARIOS = {
  homework: {
    id: 'homework',
    name: 'Homework Challenge',    
    problemDeclaration: "This math homework is so hard! I don't know what to do!",
    backgrounds: {
      worried: { boy: homeworkWorriedBoy, girl: homeworkWorriedGirl },
      success: { boy: homeworkSuccessBoy, girl: homeworkSuccessGirl }
    },
    symbols: {
      wise: [
        { id: 'patience', image: homeworkSymbolPatience, name: 'Take Your Time' },
        { id: 'stepbook', image: homeworkSymbolStepbook, name: 'Step by Step' }
      ],
      unwise: [
        { id: 'gaming', image: homeworkSymbolGaming, name: 'Play Games Instead' },
        { id: 'giveup', image: homeworkSymbolGiveup, name: 'Give Up' }
      ]
    },
    helpRequest: 'Help him choose wisely',
    characterReactions: {
      patience: [
        "Oh! Taking my time sounds much better than rushing! 📚",
        "You're right! Being patient will help me understand! ⏰",
        "That's such good advice! I'll slow down and think! 🤔"
      ],
      stepbook: [
        "Step by step! That's perfect! I'll break it down! 📖",
        "You're so smart! One step at a time makes sense! 👣",
        "Breaking it into small parts will make it easier! ✨"
      ],
      gaming: [
        "But playing games won't help me learn math... 🎮",
        "Games are fun, but they won't finish my homework... 😅",
        "I know I should focus on learning instead... 📚"
      ],
      giveup: [
        "Giving up won't solve my homework problem... 😔",
        "But if I give up, I'll never learn this! 📚",
        "I don't want to quit... I want to understand! 💪"
      ]
    },
    coaching: 'When homework feels too hard, ask Ganesha for patience and wisdom!',
    gratitude: 'Thank you for helping me be patient! Now I can learn! 📚✨'
  },

  sports: {
    id: 'sports',
    name: 'Sports Challenge',     
    problemDeclaration: "I keep missing these shots! This is so frustrating!",
    backgrounds: {
      worried: { boy: sportsWorriedBoy, girl: sportsDiscouragedGirl },
      success: { boy: sportsSuccessBoy, girl: sportsVictoryGirl }
    },
    symbols: {
      wise: [
        { id: 'try', image: sportsSymbolTry, name: 'Keep Trying' },
        { id: 'relax', image: sportsSymbolRelax, name: 'Stay Calm' }
      ],
      unwise: [
        { id: 'scared', image: sportsSymbolScared, name: 'Get Scared' },
        { id: 'hide', image: sportsSymbolHide, name: 'Hide Away' }
      ]
    },
    helpRequest: 'Help him choose wisely',
    characterReactions: {
      try: [
        "Yes! I'll keep trying! Practice makes perfect! ⚽",
        "You're right! I won't give up on my goal! 💪",
        "Keep trying! That's how I'll get better! 🌟"
      ],
      relax: [
        "Staying calm will help me focus better! 🧘‍♂️", 
        "You're so wise! Being relaxed helps me play better! ✨",
        "Taking a deep breath makes me feel more confident! 😌"
      ],
      scared: [
        "Being scared won't help me get better... 😰",
        "Fear is just holding me back from improving... 😔",
        "I don't want to let fear stop me... 💭"
      ],
      hide: [
        "Hiding won't make me a better player... 🙈",
        "If I hide, I'll never learn to play well... 😕",
        "Running away means missing out on fun... 🏃‍♂️"
      ]
    },
    coaching: 'When sports get tough, ask Ganesha for courage and focus!',
    gratitude: 'Thank you for teaching me to stay brave and keep trying! ⚽✨'
  },

  shoelaces: {
    id: 'shoelaces',
    name: 'Shoelace Challenge',    
    problemDeclaration: "These shoelaces are all tangled! I'm getting so frustrated!",
    backgrounds: {
      worried: { boy: shoelacesWorriedBoy, girl: shoelaceFrustratedGirl },
      success: { boy: shoelacesSuccessBoy, girl: shoelaceSuccessGirl }
    },
    symbols: {
      wise: [
        { id: 'patient', image: shoelaceSymbolPatient, name: 'Be Patient' },
        { id: 'method', image: shoelacesSymbolMethod, name: 'Use Method' }
      ],
      unwise: [
        { id: 'angry', image: shoelaceSymbolAngry, name: 'Get Angry' },
        { id: 'slipon', image: shoelaceSymbolSlipOn, name: 'Use Slip-ons' }
      ]
    },
    helpRequest: 'Help him choose wisely',
    characterReactions: {
      patient: [
        "Being patient is much better than getting frustrated! 👟",
        "You're so wise! Slow and steady works best! 🐢",
        "Patience will help me untangle this carefully! ✨"
      ],
      method: [
        "Using a method will help me untangle this mess! 🧵",
        "You're right! Having a system makes it easier! 📋",
        "Step by step method is so much better! 👣"
      ],
      angry: [
        "Getting angry will just make the knots tighter... 😤",
        "Being mad won't help me solve this problem... 😠",
        "I know anger will just make things worse... 💭"
      ],
      slipon: [
        "Slip-ons won't teach me how to tie laces... 👟",
        "That's avoiding the problem, not solving it... 🤔",
        "I want to learn the proper way instead... 📚"
      ]
    },
    coaching: 'When things get tangled, ask Ganesha for patience and method!',
    gratitude: 'Thank you for teaching me patience! My laces are perfect now! 👟✨'
  },

  broketoy: {
    id: 'broketoy',
    name: 'Broken Toy Challenge',    
    problemDeclaration: "Oh no! I broke my toy! What am I going to do?",
    backgrounds: {
      worried: { boy: broketoyWorriedBoy, girl: broketoyWorriedGirl },
      success: { boy: broketoyJoyBoy, girl: broketoyJoyGirl }
    },
    symbols: {
      wise: [
        { id: 'sorry', image: brokenSymbolSorry, name: 'Say Sorry' },
        { id: 'help', image: brokenSymbolHelp, name: 'Ask for Help' }
      ],
      unwise: [
        { id: 'blame', image: brokenSymbolBlame, name: 'Blame Others' },
        { id: 'hide', image: brokenSymbolHide, name: 'Hide It' }
      ]
    },
    helpRequest: 'Help him choose wisely',
    characterReactions: {
      sorry: [
        "You're right! I should say sorry for breaking it! 😊",
        "Being honest and saying sorry feels right! 💚",
        "Apologizing is the brave thing to do! 🌟"
      ],
      help: [
        "Asking for help is much better than hiding! 🤝",
        "You're so wise! Getting help will fix this! ✨",
        "Together we can make it better! 👥"
      ],
      blame: [
        "Blaming others won't fix the toy... 😔",
        "It's not fair to blame someone else... 😕",
        "I know it was my mistake, not theirs... 💭"
      ],
      hide: [
        "Hiding it will just make things worse... 🙈",
        "If I hide it, no one can help me fix it... 😔",
        "Being secretive doesn't solve problems... 🤷‍♂️"
      ]
    },
    coaching: 'When we make mistakes, ask Ganesha for courage to be honest!',
    gratitude: 'Thank you for helping me be brave and honest! 🧸✨'
  },

  sharing: {
    id: 'sharing',
    name: 'Sharing Challenge',        
    problemDeclaration: "I want to keep all my toys! But my friend wants to play too...",
    backgrounds: {
      worried: { boy: sharingWorriedBoy, girl: sharingGreedGirl },
      success: { boy: sharingSuccessBoy, girl: sharingGiveGirl }
    },
    symbols: {
      wise: [
        { id: 'generosity', image: sharingSymbolGenerosity, name: 'Be Generous' },
        { id: 'joy', image: sharingSymbolJoy, name: 'Share Joy' }
      ],
      unwise: [
        { id: 'angry', image: sharingSymbolAngry, name: 'Get Angry' },
        { id: 'escape', image: sharingSymbolEscape, name: 'Run Away' }
      ]
    },
    helpRequest: 'Help him choose wisely',
    characterReactions: {
      generosity: [
        "Being generous makes me feel warm inside! 🤗",
        "You're right! Sharing is caring! 💝",
        "Generosity brings so much joy! ✨"
      ],
      joy: [
        "Sharing joy is so much better than keeping everything! 🎁",
        "You're so wise! Joy grows when we share it! 😊",
        "Making others happy makes me happy too! 🌈"
      ],
      angry: [
        "Getting angry won't help anyone have fun... 😠",
        "Being mad will just ruin playtime... 😔",
        "Anger pushes friends away... 💭"
      ],
      escape: [
        "Running away means missing out on friendship... 🏃‍♂️",
        "If I escape, I'll be all alone... 😕",
        "Avoiding sharing means avoiding fun... 🤷‍♂️"
      ]
    },
    coaching: 'When sharing feels hard, ask Ganesha for a generous heart!',
    gratitude: 'Thank you for teaching me the joy of sharing! 🎁✨'
  },

  bike: {
    id: 'bike',
    name: 'Bike Challenge',
    problemDeclaration: "Learning to ride this bike is scary! I'm afraid I'll fall!",
    backgrounds: {
      worried: { boy: bikeFearBoy, girl: bikeFearGirl },
      success: { boy: bikeVictoryBoy, girl: bikeVictoryGirl }
    },
    symbols: {
      wise: [
        { id: 'focus', image: bikeSymbolFocus, name: 'Stay Focused' },
        { id: 'relax', image: bikeSymbolRelax, name: 'Stay Calm' }
      ],
      unwise: [
        { id: 'fear', image: bikeSymbolFear, name: 'Give in to Fear' },
        { id: 'giveup', image: bikeSymbolGiveUp, name: 'Give Up' }
      ]
    },
    helpRequest: 'Help him choose wisely',
    characterReactions: {
      focus: [
        "Staying focused will help me balance better! 🚴‍♂️",
        "You're right! I can do this if I focus! 💪",
        "Concentrating on my balance makes me feel confident! ✨"
      ],
      relax: [
        "Being calm makes me feel braver! 😌",
        "You're so wise! Relaxing helps me ride better! 🌟",
        "Taking deep breaths gives me courage! 💨"
      ],
      fear: [
        "Giving in to fear won't help me learn... 😰",
        "I know fear is just holding me back... 😔",
        "Being scared will make me fall more... 💭"
      ],
      giveup: [
        "Giving up means I'll never learn to ride... 🚴‍♂️",
        "If I quit now, I'll miss out on so much fun... 😕",
        "I don't want to be the only one who can't ride... 💭"
      ]
    },
    coaching: 'When fear holds us back, ask Ganesha for courage!',
    gratitude: 'Thank you for helping me be brave! I can ride now! 🚴‍♂️✨'
  }
};

// ✅ NEW: Game 2 scenarios configuration  
const GAME2_SCENARIOS = {
  grandparents: {
    id: 'grandparents',
    name: 'Help Grandparents with Technology',
    problemDeclaration: "This tablet is so confusing! I can't figure out how to video call!",
    backgrounds: {
      before: grandparentsBefore,
      after: grandparentsAfter
    },
    helpers: [
      { id: 'timmytime', image: grandparentsTimmytime, name: 'Take Time' },
      { id: 'clearolens', image: grandparentsClearolens, name: 'Clear Instructions' },
      { id: 'memoleaf', image: grandparentsMemoleaf, name: 'Help Remember' },
      { id: 'snuggyshawl', image: grandparentsSnuggyshawl, name: 'Comfort' }
    ],
    gratitude: "Thank you for being so patient with us! Now we can call the family! 📱✨",
    ganeshaBlessing: "You showed patience and kindness - true helper qualities!"
  },

  dog: {
    id: 'dog',
    name: 'Comfort Scared Dog',
    problemDeclaration: "I'm so scared of the thunder! Help me feel safe!",
    backgrounds: { 
      before: dogBefore, 
      after: dogAfter 
    },
    helpers: [
      { id: 'snuggyblanket', image: dogSnuggyblanket, name: 'Cozy Comfort' },
      { id: 'aquabuddy', image: dogAquabuddy, name: 'Calm Friend' },
      { id: 'happytail', image: dogHappytail, name: 'Bring Joy' },
      { id: 'brighttorch', image: dogBrighttorch, name: 'Light Way' }
    ],
    gratitude: "Woof! Thank you for making me feel safe! 🐕✨",
    ganeshaBlessing: "You brought comfort to the frightened - compassionate heart!"
  },

  construction: {
    id: 'construction',
    name: 'Help Tired Construction Worker',
    problemDeclaration: "This work is so hard and loud! I need some energy and peace!",
    backgrounds: { 
      before: constructionBefore, 
      after: constructionAfter 
    },
    helpers: [
      { id: 'melodymug', image: constructionMelodymug, name: 'Peaceful Music' },
      { id: 'rhythmoradio', image: constructionRhythmoradio, name: 'Good Rhythm' },
      { id: 'hammerhero', image: constructionHammerhero, name: 'Work Spirit' },
      { id: 'sunnyspark', image: constructionSunnyspark, name: 'Bright Energy' }
    ],
    gratitude: "Thank you for helping me work with joy! 🔨✨",
    ganeshaBlessing: "You brought energy to the weary - supportive spirit!"
  },

  mom: {
    id: 'mom',
    name: 'Help Busy Mom in Kitchen',
    problemDeclaration: "I have so much cooking to do! I could use some help and encouragement!",
    backgrounds: { 
      before: momBefore, 
      after: momAfter 
    },
    helpers: [
      { id: 'chefchintu', image: momChefchintu, name: 'Cooking Help' },
      { id: 'bubblybottle', image: momBubblybottle, name: 'Happy Spirit' },
      { id: 'gigglesspoon', image: momGigglesspoon, name: 'Joyful Work' },
      { id: 'peacemittens', image: momPeacemittens, name: 'Calm Hands' }
    ],
    gratitude: "Thank you for making cooking fun again! 🍳✨",
    ganeshaBlessing: "You brought joy to daily work - blessed helper!"
  },

  siblings: {
    id: 'siblings',
    name: 'Help Fighting Siblings',
    problemDeclaration: "We're fighting and can't agree on anything! Help us make peace!",
    backgrounds: { 
      before: siblingsBefore, 
      after: siblingsAfter 
    },
    helpers: [
      { id: 'gigglebox', image: siblingsGigglebox, name: 'Share Fun' },
      { id: 'peaceballoon', image: siblingsPeaceballoon, name: 'Float Peace' },
      { id: 'huggypillow', image: siblingsHuggypillow, name: 'Hug Time' },
      { id: 'sharebear', image: siblingsSharebear, name: 'Share Bear' }
    ],
    gratitude: "Thank you for helping us be friends again! 👫✨",
    ganeshaBlessing: "You created harmony from chaos - peacemaker spirit!"
  },

  park: {
    id: 'park',
    name: 'Clean Up Littered Park',
    problemDeclaration: "This beautiful park is so messy! It needs cleaning up!",
    backgrounds: { 
      before: parkBefore, 
      after: parkAfter 
    },
    helpers: [
      { id: 'leafyfriend', image: parkLeafyfriend, name: 'Nature Friend' },
      { id: 'cleaniebucket', image: parkCleaniebucket, name: 'Clean Up' },
      { id: 'bloomyflower', image: parkBloomyflower, name: 'Bloom Beauty' },
      { id: 'sparklestar', image: parkSparklestar, name: 'Shine Bright' }
    ],
    gratitude: "Thank you for making our park beautiful again! 🌳✨",
    ganeshaBlessing: "You cared for nature and community - environmental guardian!"
  }
};

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in Sarvakaryeshu Scene ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong in the Spiritual Learning Scene.</h2>
          <details>
            <summary>Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>Reload Scene</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const SarvakaryeshuSarvada = ({
  onComplete,
  onNavigate,
  zoneId = 'meaning-cave',
  sceneId = 'sarvakaryeshu-sarvada'
}) => {
  console.log('SarvakaryeshuSarvada props:', { onComplete, onNavigate, zoneId, sceneId });

  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // ✅ FIXED: Start with Door 1, not character selection
          phase: SCENE_PHASES.DOOR1_ACTIVE,
          currentFocus: 'door1',
          
          // Character selection moved to after Door 1
          selectedCharacter: null,
          characterSelected: false,
          
          // Door 1 system (Sarvakaryeshu)
          door1State: 'waiting',
          door1SyllablesPlaced: [],
          door1Completed: false,
          door1CurrentStep: 0,
          door1Syllables: ['Sar', 'va', 'kar', 'ye', 'shu'],

          // Door 2 system (Sarvada)
          door2State: 'waiting',
          door2SyllablesPlaced: [],
          door2Completed: false,
          door2CurrentStep: 0,
          door2Syllables: ['Sar', 'va', 'da'],
          
          // ✅ FIXED: Game 1 with 3 scenarios required
          currentGame: 1, // ✅ Track current game (1 or 2)
          currentScenario: 0,
          selectedScenarios: [], // 3 random scenarios from 6 available
          scenarioPhase: 'uncertainty', // uncertainty → clarity → choosing → success
          symbolsVisible: 'faint', // faint → clear → interactive
          symbolsRevealed: 'initial', // initial → all 
          wiseChoicesMade: [],
          unwiseChoicesTried: [],
          symbolsClickable: false,
          sceneClarity: 'uncertain', // uncertain → clear → success
          ganeshaClicked: false,
          game1Completed: false,
          currentBackground: 'worried', // worried → success
          scenariosCompleted: 0, // Track completed scenarios

          // ✅ NEW: Game 2 state
          game2Scenarios: [], // 3 random scenarios from 6 available  
          currentGame2Scenario: 0,
          game2ScenariosCompleted: 0,
          selectedHelperSymbol: null,
          helperPopupVisible: false,
          helperAnimationActive: false,
          game2Background: 'before', // 'before' → 'after' during animation
          helperSymbolsGenerated: [], // 3 random helpers for current scenario
          game2Completed: false,

          helperBadgeVisible: false,
          characterMessage: null,
          characterMessageType: null,
          showProblemDeclaration: false,
          problemDeclarationShown: false,

          ganeshaEmerged: false,
          ganeshaBlessing: false,
          ganeshaBlessingMessage: null,

          selectedSymbol: null,        
          selectedSymbolData: null,    
          sceneClickable: false,       

          // Game 2 helper display
showHelperOnScreen: false,
helperScreenPosition: { x: 25, y: 30 }, // Where helper appears on screen
helperImageData: null, // Current helper image and data
// Added to initial state:
helperReadyToSend: false, // ✅ NEW: Controls send button visibility
          
          // Sanskrit learning
          learnedWords: {
            sarvakaryeshu: { learned: false, scene: 4 },
            sarvada: { learned: false, scene: 4 }
          },
          
          // Discovery and popup states
          discoveredSymbols: {},
          currentPopup: null,
          symbolDiscoveryState: null,
          sidebarHighlightState: null,
          
          // GameCoach states
          gameCoachState: null,
          isReloadingGameCoach: false,
          welcomeShown: false,
          sarvakaryeshuWisdomShown: false,
          sarvadaWisdomShown: false,
          readyForWisdom: false,
          lastGameCoachTime: 0,
          
          // Progress tracking
          stars: 0,
          completed: false,
          progress: {
            percentage: 0,
            starsEarned: 0,
            completed: false
          },

          showInAllTasksText: false,  
          showAlwaysText: false,      
          
          // UI states
          showingCompletionScreen: false,
          fireworksCompleted: false
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <SarvakaryeshuSarvadaContent
            sceneState={sceneState}
            sceneActions={sceneActions}
            isReload={isReload}
            onComplete={onComplete}
            onNavigate={onNavigate}
            zoneId={zoneId}
            sceneId={sceneId}
          />
        )}
      </SceneManager>
    </ErrorBoundary>
  );
};

const SarvakaryeshuSarvadaContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  console.log('SarvakaryeshuSarvadaContent render', { sceneState, isReload, zoneId, sceneId });

  if (!sceneState?.phase) sceneActions.updateState({ phase: SCENE_PHASES.DOOR1_ACTIVE });

  // Access GameCoach functionality
  const { showMessage, hideCoach, isVisible, clearManualCloseTracking } = useGameCoach();

  // State management
  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Refs
  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);
  const [hintUsed, setHintUsed] = useState(false);

  // Get profile name
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  // Safe setTimeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // ✅ NEW: Generate random scenarios functions for both games
  const generateRandomScenarios = () => {
    const scenarioKeys = Object.keys(SCENARIOS);
    const shuffled = [...scenarioKeys].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const generateRandomGame2Scenarios = () => {
    const scenarioKeys = Object.keys(GAME2_SCENARIOS);
    const shuffled = [...scenarioKeys].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // ✅ Always use cave background
  const getCurrentBackground = () => {
    return sceneBackground;
  };

  // ✅ UPDATED: Handle both Game 1 and Game 2 scenario images
  const getCurrentScenarioImage = () => {
    if (sceneState.currentGame === 2) {
      // Game 2: Use before/after based on animation state
      const scenario = getCurrentGame2Scenario();
      const imageState = sceneState.game2Background || 'before';
      return scenario.backgrounds[imageState];
    } else {
      // Game 1: Use character-based images
      const scenario = getCurrentScenario();
      const character = sceneState.selectedCharacter || 'boy';
      const backgroundState = sceneState.currentBackground || 'worried';
      return scenario.backgrounds[backgroundState][character];
    }
  };

  // Door 1 handlers
  const handleDoor1SyllablePlaced = (syllable) => {
    hideActiveHints();
    console.log(`Door 1 syllable placed: ${syllable}`);
    
    const expectedSyllable = sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0] || 'Sar';
    const isCorrect = syllable === expectedSyllable;
    
    if (isCorrect) {
      const newStep = (sceneState.door1CurrentStep || 0) + 1;
      const newSyllablesPlaced = [...(sceneState.door1SyllablesPlaced || []), syllable];
      
      sceneActions.updateState({
        door1SyllablesPlaced: newSyllablesPlaced,
        door1CurrentStep: newStep
      });
      
      if (newStep >= 5) {
        setTimeout(() => {
          handleDoor1Complete();
        }, 1000);
      }
    } else {
      if (showMessage) {
        showMessage(`Try "${expectedSyllable}" next, ${profileName}!`, {
          duration: 2000,
          animation: 'shake',
          position: 'top-center'
        });
      }
    }
  };

  const handleDoor1Complete = () => {
    console.log('🚪 Door 1 completed - now choose character');
    
    setShowSparkle('door1-completing');
    
    sceneActions.updateState({
      door1Completed: true,
      phase: SCENE_PHASES.CHARACTER_SELECT,
      stars: 2,
      progress: {
        percentage: 20,
        starsEarned: 2,
        completed: false
      }
    });
    
    setTimeout(() => {
      setShowSparkle(null);
    }, 3000);
  };

  const handleCharacterSelect = (character) => {
    console.log(`👦👧 Character selected: ${character} - starting Game 1`);
    
    setShowSparkle('character-selected');
    
    sceneActions.updateState({
      selectedCharacter: character,
      helperBadgeVisible: true,
      characterSelected: true,
      phase: SCENE_PHASES.GAME1_INTRO,
      selectedScenarios: generateRandomScenarios(),
      currentScenario: 0,
      stars: 3,
      progress: {
        percentage: 30,
        starsEarned: 3,
        completed: false
      }
    });
    
    setTimeout(() => {
      setShowSparkle(null);
      startScenario(0);
    }, 2000);
  };

  // ✅ Reusable function for starting scenarios
  const startScenario = (scenarioIndex = 0) => {
    console.log(`🎯 Starting scenario ${scenarioIndex + 1} with problem declaration`);
    
    sceneActions.updateState({
      currentScenario: scenarioIndex,
      phase: SCENE_PHASES.SCENARIO_UNCERTAINTY,
      scenarioPhase: 'uncertainty',
      showProblemDeclaration: true,
      symbolsVisible: 'none',
      symbolsClickable: false,
      sceneClarity: 'uncertain',
      ganeshaClicked: false,
      wiseChoicesMade: [],
      unwiseChoicesTried: [],
      currentBackground: 'worried',
      sceneInstructionText: null,
      ganeshaEmerged: false,
      ganeshaBlessing: false,
      ganeshaBlessingMessage: null,
      characterMessage: null,
      characterMessageType: null
    });
    
    setTimeout(() => {
      const instructionText = "What should I choose?";
      
      sceneActions.updateState({
        showProblemDeclaration: false,
        problemDeclarationShown: true,
        symbolsVisible: 'clear',
        symbolsClickable: true,
        sceneInstructionText: instructionText
      });
    }, 3000);
  };

  // Game 1 handlers
  const handleGaneshaClick = () => {
    console.log('🐘 Phase 1: Ganesha clicked - divine clarity received!');
    
    setShowSparkle('divine-clarity');
    
    if (showMessage) {
      showMessage("Let's look at the choices together", {
        duration: 2000,
        animation: 'gentle',
        position: 'top-center'
      });
    }
    
    sceneActions.updateState({
      phase: SCENE_PHASES.SCENARIO_CLARITY,
      scenarioPhase: 'clarity',
      symbolsVisible: 'clear',
      symbolsClickable: true,
      sceneClarity: 'clear',
      ganeshaClicked: true
    });
    
    setTimeout(() => setShowSparkle(null), 2000);
  };

  const handleSymbolClick = (symbolId, isWise) => {
    console.log(`🤔 Symbol selected for consideration: ${symbolId}, wise: ${isWise}`);
    
    sceneActions.updateState({
      selectedSymbol: symbolId,
      selectedSymbolData: { symbolId, isWise },
      sceneClickable: true,
      sceneInstructionText: "Let's see what happens if I do this!",
      phase: SCENE_PHASES.SCENARIO_CHOOSING,
      scenarioPhase: 'choosing'
    });
    
    setShowSparkle('symbol-selected');
    setTimeout(() => setShowSparkle(null), 1000);
  };

  const handleSceneClick = () => {
    if (!sceneState.selectedSymbolData || !sceneState.sceneClickable) return;
    
    const { symbolId, isWise } = sceneState.selectedSymbolData;
    console.log(`✅ Choice confirmed: ${symbolId}, wise: ${isWise}`);
    
    const scenario = getCurrentScenario();
    const symbolReactions = scenario.characterReactions[symbolId] || [];
    const randomReaction = symbolReactions[Math.floor(Math.random() * symbolReactions.length)];
    
    sceneActions.updateState({
      selectedSymbol: null,
      selectedSymbolData: null,
      sceneClickable: false
    });
    
    sceneActions.updateState({
      phase: SCENE_PHASES.SCENARIO_CHOOSING,
      scenarioPhase: 'choosing'
    });
    
    if (isWise) {
      setShowSparkle('wise-choice');
      
      const newWiseChoices = [...(sceneState.wiseChoicesMade || []), symbolId];
      
      sceneActions.updateState({
        wiseChoicesMade: newWiseChoices,
        sceneClarity: 'success',
        currentBackground: 'success',
        characterMessage: randomReaction,
        characterMessageType: 'wise'
      });
      
      setTimeout(() => {
        handleGaneshaEmergence(symbolId);
      }, 2500);
      
    } else {
      setShowSparkle('unwise-choice');
      
      const newUnwiseChoices = [...(sceneState.unwiseChoicesTried || []), symbolId];
      
      sceneActions.updateState({
        unwiseChoicesTried: newUnwiseChoices,
        sceneClarity: 'dimmed',
        characterMessage: randomReaction,
        characterMessageType: 'unwise'
      });
      
      setTimeout(() => {
        sceneActions.updateState({
          characterMessage: "Let me think of a better choice... 💭",
          characterMessageType: 'encouragement'
        });
        
        setTimeout(() => {
          sceneActions.updateState({
            scenarioPhase: 'clarity',
            sceneClarity: 'clear',
            characterMessage: null,
            characterMessageType: null,
            sceneInstructionText: "That's okay, let me try again!"
          });
          setShowSparkle(null);
        }, 2000);
      }, 1500);
    }
  };

  const completeCurrentScenario = () => {
    const scenario = getCurrentScenario();
    console.log(`✨ Scenario ${sceneState.currentScenario + 1} completed: ${scenario.name}`);
    
    setShowSparkle('scenario-success');
    
    const nextScenario = (sceneState.currentScenario || 0) + 1;
    const scenariosCompleted = (sceneState.scenariosCompleted || 0) + 1;
    
    sceneActions.updateState({
      phase: SCENE_PHASES.SCENARIO_SUCCESS,
      scenarioPhase: 'success',
      scenariosCompleted: scenariosCompleted
    });
    
    if (scenariosCompleted >= 3) {
      setTimeout(() => completeGame1(), 3000);
    } else {
      setTimeout(() => {
        setShowSparkle(null);
        startScenario(nextScenario);
      }, 3000);
    }
  };

  const completeGame1 = () => {
    console.log('🌟 All 3 scenarios completed - transitioning to text display!');
    
    setShowSparkle('transformation-golden');
    
    if (showMessage) {
      showMessage("You have learned to seek wisdom in all your tasks...", {
        duration: 4000,
        animation: 'divine',
        position: 'center'
      });
    }
    
    sceneActions.updateState({
      game1Completed: true,
      phase: SCENE_PHASES.SARVAKARYESHU_LEARNING,
      showInAllTasksText: true,
      learnedWords: {
        ...sceneState.learnedWords,
        sarvakaryeshu: { learned: true, scene: 4 }
      },
      sidebarHighlightState: 'sarvakaryeshu',
      stars: 6,
      progress: {
        percentage: 70,
        starsEarned: 6,
        completed: false
      }
    });
    
    setTimeout(() => {
      sceneActions.updateState({ 
        showInAllTasksText: false,
        sidebarHighlightState: null 
      });
    }, 4000);
    
    setTimeout(() => {
      setShowSparkle(null);
      completeSarvakaryeshuLearning();
    }, 5000);
  };

  const completeSarvakaryeshuLearning = () => {
    console.log('📜 Sarvakaryeshu learned - transitioning to Door 2');
    
    setShowSparkle('sarvakaryeshu-to-sidebar');
    
    setTimeout(() => {
      setShowSparkle(null);
      sceneActions.updateState({
        phase: SCENE_PHASES.DOOR2_ACTIVE
      });
      
      if (showMessage) {
        showMessage("Now you will help others as I helped you!", {
          duration: 3000,
          animation: 'gentle',
          position: 'top-center'
        });
      }
    }, 3000);
  };

  const handleGaneshaEmergence = (symbolId) => {
    sceneActions.updateState({ ganeshaEmerged: true });
    
    setTimeout(() => {
      sceneActions.updateState({ 
        ganeshaBlessing: true,
        ganeshaBlessingMessage: "Well done! I am with you in all your tasks!"
      });
    }, 1500);
    
    setTimeout(() => {
      sceneActions.updateState({
        characterMessage: "Thank you Ganesha! I feel your guidance! ✨",
        characterMessageType: 'grateful'
      });
    }, 3500);
    
    setTimeout(() => completeCurrentScenario(), 3000);
  };

  // Door 2 handlers
  const handleDoor2SyllablePlaced = (syllable) => {
    hideActiveHints();
    console.log(`Door 2 syllable placed: ${syllable}`);
    
    const expectedSyllable = sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0] || 'Sar';
    const isCorrect = syllable === expectedSyllable;
    
    if (isCorrect) {
      const newStep = (sceneState.door2CurrentStep || 0) + 1;
      const newSyllablesPlaced = [...(sceneState.door2SyllablesPlaced || []), syllable];
      
      sceneActions.updateState({
        door2SyllablesPlaced: newSyllablesPlaced,
        door2CurrentStep: newStep
      });
      
      if (newStep >= 3) {
        setTimeout(() => {
          handleDoor2Complete();
        }, 1000);
      }
    } else {
      if (showMessage) {
        showMessage(`Try "${expectedSyllable}" next, ${profileName}!`, {
          duration: 2000,
          animation: 'shake',
          position: 'top-center'
        });
      }
    }
  };

  // ✅ UPDATED: Door 2 completion starts Game 2 instead of completing scene
  const handleDoor2Complete = () => {
    console.log('🚪 Door 2 completed - starting Game 2!');
    
    setShowSparkle('door2-completing');
    
    sceneActions.updateState({
      door2Completed: true,
      // ✅ Don't complete scene yet - start Game 2
      stars: 7,
      progress: {
        percentage: 80,
        starsEarned: 7,
        completed: false
      }
    });
    
    setTimeout(() => {
      setShowSparkle(null);
      startGame2(); // ✅ Start Game 2 instead of completing
    }, 3000);
  };

  // ✅ NEW: Game 2 functions - following Game 1 patterns

  const startGame2 = () => {
    console.log('🌟 Starting Game 2 - Helping Others');
    
    sceneActions.updateState({
      currentGame: 2,
      phase: SCENE_PHASES.GAME2_INTRO,
      game2Scenarios: generateRandomGame2Scenarios(),
      currentGame2Scenario: 0,
      game2ScenariosCompleted: 0
    });
    
    if (showMessage) {
      showMessage("Now you will help others as I helped you!", {
        duration: 3000,
        animation: 'divine',
        position: 'center'
      });
    }
    
    setTimeout(() => {
      startGame2Scenario(0);
    }, 3000);
  };

  // ✅ ADD THIS NEW FUNCTION (before startGame2Scenario):
const resetGame2HelperState = () => {
  sceneActions.updateState({
    selectedHelperSymbol: null,
    showHelperOnScreen: false,
    helperImageData: null,
    helperAnimationActive: false,
    characterMessage: null,
    characterMessageType: null,
    helperSymbolsGenerated: []
  });
};

const startGame2Scenario = (scenarioIndex = 0) => {
  console.log(`🎯 Starting Game 2 scenario ${scenarioIndex + 1}`);
  
  // ✅ FIRST: Reset helper state completely
  resetGame2HelperState();
  
  // ✅ THEN: Small delay before setting new state
  setTimeout(() => {
    const scenario = getCurrentGame2Scenario();
    const randomHelpers = generateRandomHelperSymbols(scenario);
    
    sceneActions.updateState({
      currentGame2Scenario: scenarioIndex,
      phase: SCENE_PHASES.HELPER_UNCERTAINTY,
      showProblemDeclaration: true,
      symbolsVisible: 'none',
      symbolsClickable: false,
      selectedHelperSymbol: null,
      helperPopupVisible: false,
      helperAnimationActive: false,
      game2Background: 'before',
      helperSymbolsGenerated: randomHelpers, // ✅ STORE HERE
      characterMessage: null,
      ganeshaEmerged: false,
      ganeshaBlessing: false
    });
    
    // ✅ THEN: Enable interactions after problem declaration
    setTimeout(() => {
      sceneActions.updateState({
        showProblemDeclaration: false,
        symbolsVisible: 'clear',
        symbolsClickable: true,
        sceneInstructionText: "How can I help them?"
      });
    }, 3000);
  }, 50); // ✅ Small delay for state to clear
};

const handleGame2SymbolClick = (symbolId) => {
  const scenario = getCurrentGame2Scenario();
  const helperData = scenario.helpers.find(h => h.id === symbolId);
  
  console.log(`🎯 Symbol clicked: ${symbolId}`);
  console.log('- Current selectedHelperSymbol:', sceneState.selectedHelperSymbol);
  console.log('- Current phase:', sceneState.phase);
  console.log('- showHelperOnScreen:', sceneState.showHelperOnScreen);
  
  // ✅ FIX: More specific condition for second click
  if (sceneState.selectedHelperSymbol === symbolId && 
      sceneState.phase === SCENE_PHASES.HELPER_CHOOSING && 
      sceneState.showHelperOnScreen === true) {
    console.log('✨ SECOND CLICK - Would start animation (commented out)');
    // ❌ COMMENTED OUT: Animation logic
    /*
    sceneActions.updateState({
      phase: SCENE_PHASES.HELPER_ANIMATION,
      helperAnimationActive: true,
      characterMessage: null,
      sceneInstructionText: null
    });
    */
    
 // ✅ FIX: Remove automatic timeout, complete immediately on actual second click
    completeGame2Scenario();
    
  } else {
    console.log('🤔 FIRST CLICK - Showing helper on screen');
    
    const helpMessage = getHelperMessage(symbolId, scenario);
    
    sceneActions.updateState({
      selectedHelperSymbol: symbolId,
      phase: SCENE_PHASES.HELPER_CHOOSING,
      showHelperOnScreen: true,
      helperImageData: helperData,
      // ❌ COMMENTED OUT: Animation-related state
      // helperAnimationActive: false,
      characterMessage: helpMessage,
      characterMessageType: 'helper-speech',
      sceneInstructionText: "Click me again to send my help!"
    });

        // ✅ FIX: Add debug to see if this branch is actually running
    console.log('🔍 FIRST CLICK STATE SET - Speech bubble should show now');
  }
};

/*const startGame2Scenario = (scenarioIndex = 0) => {
  console.log(`🎯 Starting Game 2 scenario ${scenarioIndex + 1}`);
  const scenario = getCurrentGame2Scenario();
  
  // ✅ GENERATE AND STORE symbols when scenario starts
  const randomHelpers = generateRandomHelperSymbols(scenario);
  
  sceneActions.updateState({
    currentGame2Scenario: scenarioIndex,
    phase: SCENE_PHASES.HELPER_UNCERTAINTY,
    showProblemDeclaration: true,
    symbolsVisible: 'none',
    symbolsClickable: false,
    selectedHelperSymbol: null,
    helperPopupVisible: false,
    helperAnimationActive: false,
    game2Background: 'before',
    helperSymbolsGenerated: randomHelpers, // ✅ STORE HERE
    characterMessage: null,
    ganeshaEmerged: false,
    ganeshaBlessing: false
  });
  
  setTimeout(() => {
    sceneActions.updateState({
      showProblemDeclaration: false,
      symbolsVisible: 'clear',
      symbolsClickable: true,
      sceneInstructionText: "How can I help them?"
    });
  }, 3000);
};*/

/*const handleGame2SymbolClick = (symbolId) => {
  const scenario = getCurrentGame2Scenario();
  const helperData = scenario.helpers.find(h => h.id === symbolId);
  
  if (sceneState.selectedHelperSymbol === symbolId) {
    // ✅ SECOND CLICK: Start signature animation
    console.log(`✨ Starting signature animation: ${helperData.name}`);
    
    sceneActions.updateState({
      phase: SCENE_PHASES.HELPER_ANIMATION,
      helperAnimationActive: true,
      characterMessage: null,
      sceneInstructionText: null
    });
    
  } else {
    // ✅ FIRST CLICK: Show helper on main screen
    console.log(`🤔 Helper appears on screen: ${helperData.name}`);
    
    const helpMessage = getHelperMessage(symbolId, scenario);
    
    sceneActions.updateState({
      selectedHelperSymbol: symbolId,
      phase: SCENE_PHASES.HELPER_CHOOSING,
      showHelperOnScreen: true,
      helperImageData: helperData,
      characterMessage: helpMessage,
      characterMessageType: 'helper-speech',
      sceneInstructionText: "Click me again to send my help!"
    });
  }
};*/

/*const handleGame2SymbolClick = (symbolId) => {
  const scenario = getCurrentGame2Scenario();
  const helperData = scenario.helpers.find(h => h.id === symbolId);
  
  console.log(`🎯 Symbol clicked: ${symbolId}`);
  console.log('- Current selectedHelperSymbol:', sceneState.selectedHelperSymbol);
  
  if (sceneState.selectedHelperSymbol === symbolId && sceneState.phase === SCENE_PHASES.HELPER_CHOOSING) {
    console.log('✨ SECOND CLICK - Starting animation');
    
    sceneActions.updateState({
      phase: SCENE_PHASES.HELPER_ANIMATION,
      helperAnimationActive: true,
      characterMessage: null,
      sceneInstructionText: null
    });
    
  } else {
    console.log('🤔 FIRST CLICK - Showing helper on screen');
    
    const helpMessage = getHelperMessage(symbolId, scenario);
    
    sceneActions.updateState({
      selectedHelperSymbol: symbolId,
      phase: SCENE_PHASES.HELPER_CHOOSING,
      showHelperOnScreen: true,
      helperImageData: helperData,
        helperAnimationActive: false, // ✅ ADD THIS LINE
      characterMessage: helpMessage,
      characterMessageType: 'helper-speech',
      sceneInstructionText: "Click me again to send my help!"
    });
    
    // 🔍 DEBUG: Check if state was actually updated
    setTimeout(() => {
      console.log('🔍 State after update:', {
        selectedHelperSymbol: sceneState.selectedHelperSymbol,
        showHelperOnScreen: sceneState.showHelperOnScreen,
        helperImageData: sceneState.helperImageData
      });
    }, 100);
  }
};*/

const getHelperMessage = (symbolId, scenario) => {
  const helperMessages = {
    // Grandparents helpers
    timmytime: "I can help them take their time and go slowly! 🕐",
    clearolens: "I can make the instructions super clear and easy! 🔍", 
    memoleaf: "I can help them remember the steps! 🌿",
    snuggyshawl: "I can give them comfort and patience! 🤗",
    
    // Dog helpers  
    snuggyblanket: "I can wrap them in cozy comfort! 🛌",
    aquabuddy: "I can bring calm and peace! 💧",
    happytail: "I can bring joy and happiness! 🎾",
    brighttorch: "I can light the way and chase fears! 🔦",
    
    // Construction helpers
    melodymug: "I can bring peaceful music for focus! 🎵",
    rhythmoradio: "I can energize with good rhythms! 📻", 
    hammerhero: "I can boost their work spirit! 🔨",
    sunnyspark: "I can bring bright energy! ☀️",
    
    // Mom helpers
    chefchintu: "I can help make cooking fun! 👨‍🍳",
    bubblybottle: "I can bring happy energy! 🫧",
    gigglesspoon: "I can make work more joyful! 🥄",
    peacemittens: "I can bring calm to busy hands! 🧤",
    
    // Siblings helpers
    gigglebox: "I can bring fun and laughter! 📦",
    peaceballoon: "I can float away the anger! 🎈",
    huggypillow: "I can bring comfort and hugs! 🛏️", 
    sharebear: "I can encourage sharing! 🧸",
    
    // Park helpers
    leafyfriend: "I can help nature grow! 🍃",
    cleaniebucket: "I can help clean everything! 🪣",
    bloomyflower: "I can make flowers bloom! 🌸",
    sparklestar: "I can make everything sparkle! ⭐"
  };
  
  return helperMessages[symbolId] || "I can help in my special way! ✨";
};

  const handleHelperPopupClick = () => {
    if (!sceneState.selectedHelperSymbol) return;
    
    console.log(`✅ Helper action confirmed: ${sceneState.selectedHelperSymbol}`);
    
    sceneActions.updateState({
      helperPopupVisible: false,
      helperAnimationActive: true,
      game2Background: 'after',
      phase: SCENE_PHASES.HELPER_ANIMATION
    });
    
    setTimeout(() => {
      completeGame2Scenario();
    }, 3000);
  };

// ✅ SIMPLIFIED: completeGame2Scenario (no animation)
const completeGame2Scenario = () => {
  const scenario = getCurrentGame2Scenario();
  console.log(`✨ Game 2 scenario ${sceneState.currentGame2Scenario + 1} completed: ${scenario.name}`);
  
  setShowSparkle('helper-success');
  
  const nextScenario = (sceneState.currentGame2Scenario || 0) + 1;
  const scenariosCompleted = (sceneState.game2ScenariosCompleted || 0) + 1;
  
  sceneActions.updateState({
    phase: SCENE_PHASES.HELPER_SUCCESS,
    game2ScenariosCompleted: scenariosCompleted,
    // ❌ COMMENTED OUT: Animation state
    // helperAnimationActive: false,
    characterMessage: scenario.gratitude,
    characterMessageType: 'grateful'
  });
  
  setTimeout(() => {
    sceneActions.updateState({
      ganeshaEmerged: true,
      ganeshaBlessing: true,
      ganeshaBlessingMessage: scenario.ganeshaBlessing
    });
  }, 2000);
  
  setTimeout(() => {
    if (scenariosCompleted >= 3) {
      completeGame2();
    } else {
      setShowSparkle(null);
      sceneActions.updateState({ helperSymbolsGenerated: [] });
      startGame2Scenario(nextScenario);
    }
  }, 4000);
};

  const completeGame2 = () => {
    console.log('🌟 All Game 2 scenarios completed - showing Always text and final celebration!');
    
    setShowSparkle('game2-complete');
    
    if (showMessage) {
      showMessage("You have learned to always help others...", {
        duration: 4000,
        animation: 'divine',
        position: 'center'
      });
    }
    
    sceneActions.updateState({
      game2Completed: true,
      phase: SCENE_PHASES.COMPLETE,
      showAlwaysText: true,
      learnedWords: {
        ...sceneState.learnedWords,
        sarvada: { learned: true, scene: 4 }
      },
      sidebarHighlightState: 'sarvada',
      stars: 8,
      completed: true,
      progress: {
        percentage: 100,
        starsEarned: 8,
        completed: true
      }
    });
    
    setTimeout(() => {
      sceneActions.updateState({ 
        showAlwaysText: false,
        sidebarHighlightState: null 
      });
    }, 4000);
    
    setTimeout(() => {
      setShowSparkle('final-fireworks');
    }, 5000);
  };

  // ✅ NEW: Game 2 helper functions
  
const getCurrentGame2Scenario = () => {
  console.log('🔍 Debug Game 2 Scenario:');
  console.log('- game2Scenarios:', sceneState.game2Scenarios);
  console.log('- currentGame2Scenario index:', sceneState.currentGame2Scenario);
  
  if (!sceneState.game2Scenarios || sceneState.currentGame2Scenario >= sceneState.game2Scenarios.length) {
    console.log('- Using fallback: grandparents');
    return GAME2_SCENARIOS.grandparents;
  }
  
  const scenarioKey = sceneState.game2Scenarios[sceneState.currentGame2Scenario];
  console.log('- scenarioKey:', scenarioKey);
  
  const scenario = GAME2_SCENARIOS[scenarioKey] || GAME2_SCENARIOS.grandparents;
  console.log('- scenario name:', scenario.name);
  console.log('- scenario helpers:', scenario.helpers.map(h => h.name));
  
  return scenario;
};

const generateRandomHelperSymbols = (scenario) => {
  // ✅ Return ALL 4 helpers instead of random 3
  console.log(`🎯 Using ALL helpers for scenario: ${scenario.name}`);
  return scenario.helpers; // Return all 4 helpers
};

const getCurrentHelperSymbols = () => {
  const scenario = getCurrentGame2Scenario();
  
  // ✅ Check if cached symbols belong to current scenario
  if (sceneState.helperSymbolsGenerated?.length && 
      sceneState.cachedScenarioId === scenario.id) {
    return sceneState.helperSymbolsGenerated;
  }
  
  // Generate fresh and cache with scenario ID
  const freshSymbols = generateRandomHelperSymbols(scenario);
  sceneActions.updateState({
    helperSymbolsGenerated: freshSymbols,
    cachedScenarioId: scenario.id
  });
  
  return freshSymbols;
};

  // Get current scenario data (for Game 1)
  const getCurrentScenario = () => {
    if (!sceneState.selectedScenarios || sceneState.currentScenario >= sceneState.selectedScenarios.length) {
      return SCENARIOS.homework;
    }
    const scenarioKey = sceneState.selectedScenarios[sceneState.currentScenario];
    return SCENARIOS[scenarioKey] || SCENARIOS.homework;
  };

  // Hint configurations
  const getHintConfigs = () => [
    {
      id: 'door1-hint',
      message: 'Try arranging the Sanskrit syllables in order!',
      explicitMessage: 'Drag Sar-va-kar-ye-shu syllables to spell Sarvakaryeshu!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === SCENE_PHASES.DOOR1_ACTIVE && 
               !sceneState?.door1Completed &&
               !isVisible;
      }
    },
    {
      id: 'character-selection-hint',
      message: 'Choose your character to continue the spiritual journey!',
      explicitMessage: 'Click on the boy or girl to start the learning games!',
      position: { bottom: '60%', left: '50%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === SCENE_PHASES.CHARACTER_SELECT && 
               !sceneState?.characterSelected &&
               !isVisible;
      }
    },
    {
      id: 'ganesha-hint',
      message: 'Ask Ganesha for guidance when feeling uncertain!',
      explicitMessage: 'Click the glowing Ganesha icon for divine clarity!',
      position: { bottom: '60%', right: '25%', transform: 'translateX(50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === SCENE_PHASES.SCENARIO_UNCERTAINTY && 
               !sceneState?.ganeshaClicked &&
               !isVisible;
      }
    },
    {
      id: 'door2-hint',
      message: 'Arrange the syllables for Sarvada!',
      explicitMessage: 'Drag Sar-va-da syllables to spell Sarvada!',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState, hintLevel) => {
        if (!sceneState) return false;
        return sceneState?.phase === SCENE_PHASES.DOOR2_ACTIVE && 
               !sceneState?.door2Completed &&
               !isVisible;
      }
    }
  ];

  // Hide active hints
  const hideActiveHints = () => {
    if (progressiveHintRef.current && typeof progressiveHintRef.current.hideHint === 'function') {
      progressiveHintRef.current.hideHint();
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  if (!sceneState) {
    return <div className="loading">Loading spiritual learning scene...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager
        messages={[]}
        sceneState={sceneState}
        sceneActions={sceneActions}
      >
        <div className="scene-container" data-phase={sceneState.phase}>
          <div 
            className="scene-background" 
            style={{ backgroundImage: `url(${getCurrentBackground()})` }}
          >
            
            {/* ✅ FIRST: Door 1 Component */}
            {(sceneState.phase === SCENE_PHASES.DOOR1_ACTIVE || sceneState.phase === SCENE_PHASES.DOOR1_COMPLETE) && (
              <div className="door1-area" id="door1-area">
                <DoorComponent
                  syllables={['Sar', 'va', 'kar', 'ye', 'shu']}
                  completedWord="Sarvakaryeshu"
                  onDoorComplete={handleDoor1Complete}
                  onSyllablePlaced={handleDoor1SyllablePlaced}
                  sceneTheme="meaning-cave"
                  doorImage={doorImage}
                  className="sarvakaryeshu-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door1CurrentStep || 0}
                  expectedSyllable={sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0]}
                  targetWordTitle="SARVAKARYESHU"
                  primaryColor="#FFD700"
                  secondaryColor="#FF8C42"
                  errorColor="#FF4444"
                  isCompleted={sceneState.door1Completed}
                  placedSyllables={sceneState.door1SyllablesPlaced || []}
                  isResuming={isReload}
                />
              </div>
            )}

            {/* ✅ Character Selection */}
            {sceneState.phase === SCENE_PHASES.CHARACTER_SELECT && (
              <div className="character-selection-clean">
                <div className="character-title-cave">
                  <h2>Choose Your Character for the Spiritual Journey</h2>
                </div>
                <div className="character-options-cave">
                  <ClickableElement
                    id="select-boy"
                    onClick={() => handleCharacterSelect('boy')}
                    completed={false}
                    zone="character-zone"
                  >
                    <div className="character-option-clean">
                      <img src={boyPreview} alt="Boy Character" />
                      <span>Boy</span>
                    </div>
                  </ClickableElement>
                  
                  <ClickableElement
                    id="select-girl"
                    onClick={() => handleCharacterSelect('girl')}
                    completed={false}
                    zone="character-zone"
                  >
                    <div className="character-option-clean">
                      <img src={girlPreview} alt="Girl Character" />
                      <span>Girl</span>
                    </div>
                  </ClickableElement>
                </div>
              </div>
            )}

            {/* ✅ GAME 1 - Personal Choice Scenarios */}
            {sceneState.currentGame === 1 && (
              sceneState.phase === SCENE_PHASES.SCENARIO_UNCERTAINTY ||
              sceneState.phase === SCENE_PHASES.SCENARIO_CLARITY ||
              sceneState.phase === SCENE_PHASES.SCENARIO_CHOOSING ||
              sceneState.phase === SCENE_PHASES.SCENARIO_SUCCESS
            ) && (
              <>
                {sceneState.sceneInstructionText && 
                 !sceneState.characterMessage && 
                 (sceneState.symbolsClickable || sceneState.sceneClickable) && (
                  <div className="personal-instruction-bubble">
                    <p>{sceneState.sceneInstructionText}</p>
                  </div>
                )}

                <div 
                  className="scenario-window"
                  onClick={sceneState.sceneClickable ? handleSceneClick : undefined}
                  style={{
                    cursor: sceneState.sceneClickable ? 'pointer' : 'default'
                  }}
                >
                  <img 
                    src={getCurrentScenarioImage()} 
                    alt="Current scenario"
                    className={`scenario-image ${sceneState.sceneClarity}`}
                  />

                  {sceneState.characterMessage && (
                    <div className={`character-speech-bubble ${sceneState.characterMessageType}`}>
                      <p>{sceneState.characterMessage}</p>
                    </div>
                  )}

                  {sceneState.showProblemDeclaration && (
                    <div className="character-problem-speech">
                      <p>{getCurrentScenario().problemDeclaration}</p>
                    </div>
                  )}
                  
                  {sceneState.sceneClickable && (
                    <div className="simple-click-instruction">
                      <p>Click Here</p>
                    </div>
                  )}
                </div>

                {sceneState.ganeshaEmerged && (
                  <div className="ganesha-emergence">
                    <div className="ganesha-emergence-glow"></div>
                    <div className="emerging-ganesha blessing">
                      <img src={ganeshaIcon} alt="Divine Ganesha Blessing" />
                    </div>
                    {sceneState.ganeshaBlessingMessage && (
                      <div className="divine-blessing-speech">
                        <p>{sceneState.ganeshaBlessingMessage}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Game 1 Symbols */}
                {sceneState.symbolsVisible !== 'none' && 
                  (() => {
                    const scenario = getCurrentScenario();
                    const fixedSymbols = [
                      scenario.symbols.wise[0],
                      scenario.symbols.unwise[0],  
                      scenario.symbols.wise[1],
                      scenario.symbols.unwise[1]
                    ];
                    
                    return fixedSymbols.map((symbol, index) => {
                      const isWise = scenario.symbols.wise.includes(symbol);
                      const hasBeenTried = (sceneState.unwiseChoicesTried || []).includes(symbol.id);

                      return (
                        <div 
                          key={symbol.id} 
                          className={`cave-symbol-individual position-${index + 1} ${sceneState.symbolsVisible} ${sceneState.symbolsClickable ? 'clickable' : 'unclickable'}`}
                        >
                          <ClickableElement
                            id={`symbol-${symbol.id}`}
                            onClick={() => handleSymbolClick(symbol.id, isWise)}
                            completed={false}
                            zone="symbol-zone"
                            disabled={!sceneState.symbolsClickable}
                          >
                            <div 
                              className={`cave-symbol-item ${isWise ? 'wise-symbol' : 'unwise-symbol'} ${hasBeenTried ? 'tried-symbol' : ''} 
                              ${sceneState.selectedSymbol === symbol.id ? 'selected' : ''}`}
                              style={{
                                animation: 'none',
                                transition: 'transform 0.3s ease'
                              }}
                            >
                              <img src={symbol.image} alt={symbol.name} />
                              <span className="symbol-name-text">{symbol.name}</span>
                            </div>
                          </ClickableElement>
                        </div>
                      );
                    });
                  })()
                }
              </>
            )}

            {/* ✅ NEW: GAME 2 - Helper Mission Scenarios */}
            {sceneState.currentGame === 2 && (
              sceneState.phase === SCENE_PHASES.HELPER_UNCERTAINTY ||
              sceneState.phase === SCENE_PHASES.HELPER_CHOOSING ||
              sceneState.phase === SCENE_PHASES.HELPER_ANIMATION ||
              sceneState.phase === SCENE_PHASES.HELPER_SUCCESS
            ) && (
              <>
                {sceneState.sceneInstructionText && 
                 !sceneState.characterMessage && 
                 sceneState.symbolsClickable && (
                  <div className="personal-instruction-bubble">
                    <p>{sceneState.sceneInstructionText}</p>
                  </div>
                )}

                {/* Game 2 Scenario Window */}
                <div className="scenario-window game2-style">
                  <img
                    src={getCurrentScenarioImage()}
                    alt="Helper mission"
                    className="scenario-image"
                  />

                  {sceneState.showProblemDeclaration && (
                    <div className="person-problem-speech">
                      <p>{getCurrentGame2Scenario().problemDeclaration}</p>
                    </div>
                  )}

             {sceneState.characterMessage && sceneState.characterMessageType !== 'helper-speech' && (
  <div className={`character-speech-bubble ${sceneState.characterMessageType}`}>
    <p>{sceneState.characterMessage}</p>
  </div>
)}
                </div>

                {/* 🔍 DEBUG: Always show this to test 
<div style={{ position: 'absolute', top: '200px', left: '10px', background: 'red', color: 'white', padding: '5px', zIndex: 999 }}>
  Debug: showHelperOnScreen={String(sceneState.showHelperOnScreen)}, helperImageData={String(!!sceneState.helperImageData)}
</div>

                {/* ✅ ADD THIS: Helper on Main Screen */}
{sceneState.showHelperOnScreen && sceneState.helperImageData && (
  <div 
    className="helper-on-screen"
    style={{
      position: 'absolute',
      left: `${sceneState.helperScreenPosition.x}%`,
      top: `${sceneState.helperScreenPosition.y}%`,
      cursor: 'pointer',
      zIndex: 15
    }}
    onClick={() => handleGame2SymbolClick(sceneState.selectedHelperSymbol)}
  >
    <div className="helper-avatar">
      <img 
        src={sceneState.helperImageData.image} 
        alt={sceneState.helperImageData.name}
        style={{ width: '80px', height: '80px', objectFit: 'contain' }}
      />
    </div>
    
    {sceneState.characterMessage && sceneState.characterMessageType === 'helper-speech' && (
      <div className="helper-speech-bubble">
        <p>{sceneState.characterMessage}</p>
        <div className="speech-arrow"></div>
      </div>
    )}
  </div>
)}

{/* 🔍 DEBUG: Check phase and message 
<div style={{ 
  position: 'absolute', 
  top: '100px', 
  left: '80px', 
  background: 'green', 
  color: 'white', 
  padding: '5px', 
  fontSize: '12px',
  zIndex: 999 
}}>
  Phase Debug:<br/>
  phase: {sceneState.phase}<br/>
  HELPER_ANIMATION: {SCENE_PHASES.HELPER_ANIMATION}<br/>
  characterMessage: {sceneState.characterMessage || 'null'}<br/>
  characterMessageType: {sceneState.characterMessageType || 'null'}
</div>

{/* 4 Helper Symbols - ALL of them */}
{sceneState.symbolsVisible !== 'none' && (
  getCurrentHelperSymbols().map((helper, index) => (
    <div key={helper.id} className={`helper-symbol position-${index + 1} ${sceneState.symbolsVisible}`}>
      <ClickableElement
        id={`helper-${helper.id}`}
        onClick={() => handleGame2SymbolClick(helper.id)}
        disabled={!sceneState.symbolsClickable}
        completed={false}
        zone="helper-zone"
      >
        <div className="helper-symbol-item">
          <img src={helper.image} alt={helper.name} />
          <span>{helper.name}</span>
        </div>
      </ClickableElement>
    </div>
  ))
)}

{/* 🔍 DEBUG: Check animation rendering conditions 
<div style={{ 
  position: 'absolute', 
  top: '250px', 
  left: '10px', 
  background: 'blue', 
  color: 'white', 
  padding: '5px', 
  fontSize: '12px',
  zIndex: 999 
}}>
  Animation Debug:<br/>
  helperAnimationActive: {String(sceneState.helperAnimationActive)}<br/>
  helperImageData: {String(!!sceneState.helperImageData)}<br/>
  Should render: {String(sceneState.helperAnimationActive && sceneState.helperImageData)}
</div>

{/* ❌ COMMENTED OUT: Animation component
{sceneState.helperAnimationActive && 
 sceneState.helperImageData && 
 sceneState.phase === SCENE_PHASES.HELPER_ANIMATION && (
  <HelperSignatureAnimation
    helperId={sceneState.selectedHelperSymbol}
    fromPosition={sceneState.helperScreenPosition}
    toPosition={{ x: 50, y: 50 }}
    onAnimationStart={(helperId, animationName) => {
      console.log(`🎭 ${animationName} animation started`);
    }}
    onAnimationComplete={(helperId, animation) => {
      console.log(`✅ ${animation.name} completed`);
      sceneActions.updateState({
        game2Background: 'after',
        showHelperOnScreen: false
      });
      setTimeout(() => completeGame2Scenario(), 1000);
    }}
  />
)}
*/}
                {/* Helper Popup 
                {sceneState.helperPopupVisible && (
                  <div className="helper-popup-overlay" onClick={handleHelperPopupClick}>
                    <div className="helper-popup-content">
                      {(() => {
                        const symbolData = getCurrentHelperSymbols().find(s => s.id === sceneState.selectedHelperSymbol);
                        return symbolData ? (
                          <>
                            <img src={symbolData.image} alt={symbolData.name} />
                            <h3>{symbolData.name}</h3>
                            <p>Click to help!</p>
                          </>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}*/}

                {/* Ganesha Emergence (like Game 1) */}
                {sceneState.ganeshaEmerged && (
                  <div className="ganesha-emergence">
                    <div className="ganesha-emergence-glow"></div>
                    <div className="emerging-ganesha blessing">
                      <img src={ganeshaIcon} alt="Divine Ganesha Blessing" />
                    </div>
                    {sceneState.ganeshaBlessingMessage && (
                      <div className="divine-blessing-speech">
                        <p>{sceneState.ganeshaBlessingMessage}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ✅ Door 2 Component */}
            {(sceneState.phase === SCENE_PHASES.DOOR2_ACTIVE || sceneState.phase === SCENE_PHASES.DOOR2_COMPLETE) && (
              <div className="door2-area" id="door2-area">
                <DoorComponent
                  syllables={['Sar', 'va', 'da']}
                  completedWord="Sarvada"
                  onDoorComplete={handleDoor2Complete}
                  onSyllablePlaced={handleDoor2SyllablePlaced}
                  sceneTheme="meaning-cave"
                  doorImage={doorImage}
                  className="sarvada-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door2CurrentStep || 0}
                  expectedSyllable={sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0]}
                  targetWordTitle="SARVADA"
                  primaryColor="#FFD700"
                  secondaryColor="#FF8C42"
                  errorColor="#FF4444"
                  isCompleted={sceneState.door2Completed}
                  placedSyllables={sceneState.door2SyllablesPlaced || []}
                  isResuming={isReload}
                />
              </div>
            )}

            {/* ✅ Animated Texts */}
            {sceneState.showInAllTasksText && (
              <div className="in-all-tasks-text" style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#FFD700',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                animation: 'textGlow 3s ease-out forwards',
                zIndex: 15
              }}>
                In All Tasks
              </div>
            )}

            {sceneState.showAlwaysText && (
              <div className="always-text" style={{
                position: 'absolute',
                top: '65%',
                left: '70%',
                transform: 'translateX(-50%)',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#FF8C42',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                animation: 'textGrow 2s ease-out forwards',
                zIndex: 15
              }}>
                Always
              </div>
            )}

            {/* Sparkle Effects */}
            {showSparkle && (
              <div className="sparkle-container">
                <SparkleAnimation
                  type={showSparkle === 'divine-clarity' ? 'divine' : 'magic'}
                  count={showSparkle === 'transformation-golden' ? 50 : 20}
                  color={showSparkle === 'transformation-golden' ? "#FFD700" : "#FFD700"}
                  size={showSparkle === 'divine-clarity' ? 15 : 10}
                  duration={showSparkle === 'transformation-golden' ? 4000 : 2000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Sanskrit Sidebar */}
            {!sceneState.showingCompletionScreen && (
              <SanskritSidebar
                learnedWords={sceneState.learnedWords || {}}
                currentScene={4}
                unlockedScenes={[4]}
                mode="meanings"
                onWordClick={(wordId, wordData) => {
                  console.log(`Sanskrit word clicked: ${wordId}`, wordData);
                }}
                highlightState={sceneState.sidebarHighlightState}
              />
            )}

            <style>{`
@keyframes textGlow {
  0% {
    opacity: 0;
    transform: scale(0.8) rotateY(-20deg);
    text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
  }
  50% {
    opacity: 1;
    transform: scale(1.1) rotateY(0deg);
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0,0,0,0.7);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotateY(0deg);
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.4), 2px 2px 4px rgba(0,0,0,0.7);
  }
}

@keyframes textGrow {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.5);
    text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
  }
  50% {
    opacity: 1;
    transform: translateX(-50%) scale(1.2);
    text-shadow: 0 0 20px rgba(255, 140, 66, 0.8), 2px 2px 4px rgba(0,0,0,0.7);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
    text-shadow: 0 0 10px rgba(255, 140, 66, 0.4), 2px 2px 4px rgba(0,0,0,0.7);
  }
}

/* ✅ NEW: Game 2 specific styles */
.helper-symbol {
  position: absolute;
  transition: all 0.3s ease;
}

.helper-symbol.position-1 {
  top: 15%;        /* ← Change from bottom to top */
  left: 12%;
}

.helper-symbol.position-2 {
  bottom: 25%;     /* ← Keep bottom */
  left: 12%;
}

.helper-symbol.position-3 {
  top: 15%;        /* ← Change from bottom to top */
  right: 12%;
}

.helper-symbol.position-4 {
  bottom: 25%;     /* ← Keep bottom */
  right: 12%;
}

.helper-symbol-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  border: 2px solid #FFD700;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.helper-symbol-item:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
}

.helper-symbol-item img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 5px;
}

.helper-symbol-item span {
  font-size: 12px;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.helper-popup-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  cursor: pointer;
}

.helper-popup-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  border: 3px solid #FFD700;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  max-width: 300px;
}

.helper-popup-content img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 15px;
}

.helper-popup-content h3 {
  margin: 10px 0;
  color: #333;
  font-size: 18px;
}

.helper-popup-content p {
  margin: 10px 0 0 0;
  color: #666;
  font-size: 14px;
}

.person-problem-speech {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 15px 20px;
  border-radius: 20px;
  border: 2px solid #FF8C42;
  max-width: 300px;
  font-size: 14px;
  color: #333;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  animation: fadeInDown 0.5s ease-out;
  z-index: 10;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
`}</style>

            {/* Final Fireworks */}
            {showSparkle === 'final-fireworks' && (
              <Fireworks
                show={true}
                duration={8000}
                count={25}
                colors={['#FFD700', '#FF8C00', '#FFA500', '#DAA520', '#B8860B']}
                onComplete={() => {
                  console.log('🎯 Spiritual learning fireworks complete');
                  setShowSparkle(null);
                  setShowSceneCompletion(true);
                }}
              />
            )}

            {/* Scene Completion */}
            <SceneCompletionCelebration
              show={showSceneCompletion}
              sceneName="Spiritual Learning - Sarvakaryeshu Sarvada"
              sceneNumber={4}
              totalScenes={4}
              starsEarned={sceneState.progress?.starsEarned || 8}
              totalStars={8}
              discoveredSymbols={['sarvakaryeshu', 'sarvada'].filter(word =>
                sceneState.learnedWords?.[word]?.learned
              )}
              nextSceneName="Complete Cave Journey"
              sceneId="sarvakaryeshu-sarvada"
              completionData={{
                stars: 8,
                symbols: {},
                sanskritWords: { sarvakaryeshu: true, sarvada: true },
                learnedWords: sceneState.learnedWords || {},
                chants: { sarvakaryeshu: true, sarvada: true },
                completed: true,
                totalStars: 8
              }}
              onComplete={onComplete}
              onReplay={() => window.location.reload()}
              onContinue={() => onNavigate?.('scene-complete-continue')}
            />

            {/* Progressive Hints System */}
            <ProgressiveHintSystem
              ref={progressiveHintRef}
              sceneId={sceneId}
              sceneState={sceneState}
              hintConfigs={getHintConfigs()}
              characterImage={mooshikaCoach}
              initialDelay={20000}        
              hintDisplayTime={10000}    
              position="bottom-right"
              iconSize={60}
              zIndex={2000}
              onHintShown={(level) => {
                console.log(`Hint level ${level} shown`);
                setHintUsed(true);
              }}
              onHintButtonClick={() => console.log("Hint button clicked")}
              enabled={true}
            />

            {/* ✅ TEST BUTTON FOR GAME 2 */}
            <button
              onClick={() => {
                console.log('🎮 Testing Game 2 directly');
                sceneActions.updateState({
                  // Character and game setup
                  selectedCharacter: 'boy',
                  characterSelected: true,
                  currentGame: 2,
                  
                  // Skip to Game 2
                  phase: SCENE_PHASES.HELPER_UNCERTAINTY,
                  game1Completed: true,
                  door1Completed: true,
                  door2Completed: true,
                  
                  // Game 2 scenarios
                  game2Scenarios: ['grandparents', 'dog', 'construction'], // Fixed scenarios for testing
                  currentGame2Scenario: 0, // Start with grandparents
                  game2ScenariosCompleted: 0,
                  
                  // Helper symbols setup
                  helperSymbolsGenerated: [], // Force regeneration
                  showProblemDeclaration: false,
                  symbolsVisible: 'clear',
                  symbolsClickable: true,
                  sceneInstructionText: "How can I help them?",
                  
                  // Initial states
                  selectedHelperSymbol: null,
                  helperPopupVisible: false,
                  helperAnimationActive: false,
                  game2Background: 'before',
                  characterMessage: null,
                  ganeshaEmerged: false,
                  ganeshaBlessing: false,
                  
                  // Progress states
                  stars: 6,
                  learnedWords: {
                    sarvakaryeshu: { learned: true, scene: 4 },
                    sarvada: { learned: false, scene: 4 }
                  },
                  progress: {
                    percentage: 80,
                    starsEarned: 6,
                    completed: false
                  }
                });
                
                // Force helper symbols to regenerate after state update
                setTimeout(() => {
                  const scenario = GAME2_SCENARIOS.grandparents;
                  const randomHelpers = generateRandomHelperSymbols(scenario);
                  sceneActions.updateState({
                    helperSymbolsGenerated: randomHelpers
                  });
                  console.log('🎯 Game 2 test setup complete - Grandparents scenario loaded');
                }, 100);
              }}
              style={{
                position: 'absolute',
                top: '60px',
                right: '10px',
                background: '#FF8C42',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                zIndex: 100,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              🎮 Test Game 2
            </button>

            {/* ✅ TEST BUTTON FOR DOOR 2 → GAME 2 */}
            <button
              onClick={() => {
                console.log('🚪 Testing Door 2 → Game 2 flow');
                sceneActions.updateState({
                  // Character and Game 1 setup (completed)
                  selectedCharacter: 'boy',
                  characterSelected: true,
                  
                  // Game 1 completed states
                  game1Completed: true,
                  door1Completed: true,
                  currentGame: 1, // Still in Game 1 mode until Door 2 completes
                  scenariosCompleted: 3,
                  
                  // ✅ START AT DOOR 2
                  phase: SCENE_PHASES.DOOR2_ACTIVE,
                  
                  // Door 2 setup (fresh start)
                  door2State: 'waiting',
                  door2SyllablesPlaced: [],
                  door2Completed: false,
                  door2CurrentStep: 0,
                  door2Syllables: ['Sar', 'va', 'da'],
                  
                  // Sarvakaryeshu learned (from Game 1)
                  learnedWords: {
                    sarvakaryeshu: { learned: true, scene: 4 },
                    sarvada: { learned: false, scene: 4 }
                  },
                  
                  // Game 2 scenarios ready (for when Door 2 completes)
                  game2Scenarios: ['grandparents', 'dog', 'construction'],
                  currentGame2Scenario: 0,
                  game2ScenariosCompleted: 0,
                  
                  // Reset any active states
                  showProblemDeclaration: false,
                  symbolsVisible: 'none',
                  symbolsClickable: false,
                  characterMessage: null,
                  ganeshaEmerged: false,
                  ganeshaBlessing: false,
                  showInAllTasksText: false,
                  showAlwaysText: false,
                  
                  // Progress
                  stars: 6,
                  progress: {
                    percentage: 70,
                    starsEarned: 6,
                    completed: false
                  }
                });
                
                console.log('🎯 Door 2 test setup complete - Ready to spell Sarvada');
              }}
              style={{
                position: 'absolute',
                top: '60px',
                right: '10px',
                background: '#FF8C42',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                zIndex: 100,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              🚪 Test Door 2
            </button>

            {/* Navigation */}
            <TocaBocaNav
              onHome={() => {
                if (hideCoach) hideCoach();
                if (clearManualCloseTracking) clearManualCloseTracking();
                setTimeout(() => onNavigate?.('home'), 100);
              }}
              onProgress={() => setShowCulturalCelebration(true)}
              onZonesClick={() => {
                if (hideCoach) hideCoach();
                if (clearManualCloseTracking) clearManualCloseTracking();
                setTimeout(() => onNavigate?.('zones'), 100);
              }}
              currentProgress={{
                stars: sceneState.stars || 0,
                completed: sceneState.completed ? 1 : 0,
                total: 1
              }}
            />

            {/* Cultural Celebration Modal */}
            <CulturalCelebrationModal
              show={showCulturalCelebration}
              onClose={() => setShowCulturalCelebration(false)}
            />

          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default SarvakaryeshuSarvada;