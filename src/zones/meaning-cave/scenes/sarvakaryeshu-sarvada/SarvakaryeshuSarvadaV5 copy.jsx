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

// Game 2 Mission Background imports
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

// Game 2 Helper imports - Grandparents
import grandparentsTimmytime from './assets/images/game 2/helpers/grandparents_timmytime.png';
import grandparentsClearolens from './assets/images/game 2/helpers/grandparents_clearolens.png';
import grandparentsMemoleaf from './assets/images/game 2/helpers/grandparents_memoleaf.png';
import grandparentsSnuggyshawl from './assets/images/game 2/helpers/grandparents_snuggyshawl.png';

// Game 2 Helper imports - Dog
import dogSnuggyblanket from './assets/images/game 2/helpers/dog_snuggyblanket.png';
import dogAquabuddy from './assets/images/game 2/helpers/dog_aquabuddy.png';
import dogHappytail from './assets/images/game 2/helpers/dog_happytail.png';
import dogBrighttorch from './assets/images/game 2/helpers/dog_brighttorch.png';

// Game 2 Helper imports - Construction
import constructionMelodymug from './assets/images/game 2/helpers/construction_melodymug.png';
import constructionRhythmoradio from './assets/images/game 2/helpers/construction_rhythmoradio.png';
import constructionHammerhero from './assets/images/game 2/helpers/construction_hammerhero.png';
import constructionSunnyspark from './assets/images/game 2/helpers/construction_sunnyspark.png';

// Game 2 Helper imports - Mom
import momChefchintu from './assets/images/game 2/helpers/mom_chefchintu.png';
import momBubblybottle from './assets/images/game 2/helpers/mom_bubblybottle.png';
import momGigglesspoon from './assets/images/game 2/helpers/mom_gigglesspoon.png';
import momPeacemittens from './assets/images/game 2/helpers/mom_peacemittens.png';

// Game 2 Helper imports - Siblings
import siblingsGigglebox from './assets/images/game 2/helpers/siblings_gigglebox.png';
import siblingsPeaceballoon from './assets/images/game 2/helpers/siblings_peaceballoon.png';
import siblingsHuggypillow from './assets/images/game 2/helpers/siblings_huggypillow.png';
import siblingsSharebear from './assets/images/game 2/helpers/siblings_sharebear.png';

// Game 2 Helper imports - Park
import parkLeafyfriend from './assets/images/game 2/helpers/park_leafyfriend.png';
import parkCleaniebucket from './assets/images/game 2/helpers/park_cleaniebucket.png';
import parkBloomyflower from './assets/images/game 2/helpers/park_bloomyflower.png';
import parkSparklestar from './assets/images/game 2/helpers/park_sparklestar.png';

// âœ… FIXED: Correct flow sequence with Game 2
const SCENE_PHASES = {
  DOOR1_ACTIVE: 'door1_active',           // â† FIRST: Door 1
  DOOR1_COMPLETE: 'door1_complete',
  CHARACTER_SELECT: 'character_select',    // â† MOVED: After Door 1
  GAME1_INTRO: 'game1_intro',
  SCENARIO_UNCERTAINTY: 'scenario_uncertainty',
  SCENARIO_CLARITY: 'scenario_clarity',
  SCENARIO_CHOOSING: 'scenario_choosing',
  SCENARIO_SUCCESS: 'scenario_success',
  SARVAKARYESHU_LEARNING: 'sarvakaryeshu_learning', // âœ… Clean text phase
  
  // âœ… NEW: Game 2 phases (same pattern as Game 1)
  GAME2_INTRO: 'game2_intro',
  HELPER_UNCERTAINTY: 'helper_uncertainty',
  HELPER_CHOOSING: 'helper_choosing', 
  HELPER_ANIMATION: 'helper_animation',
  HELPER_SUCCESS: 'helper_success',
  
  DOOR2_ACTIVE: 'door2_active',           // â† After Game 2 complete
  DOOR2_COMPLETE: 'door2_complete',
  COMPLETE: 'complete'
};

// Scenario configuration with drag-and-drop flow

const SCENARIOS = {
  homework: {
    id: 'homework',
    name: 'Homework Challenge',    problemDeclaration: "This math homework is so hard! I don't know what to do!",

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
      // Wise symbol reactions
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
      // Unwise symbol reactions
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
    //successMessage: 'With patience and guidance, learning becomes possible!',
    gratitude: 'Thank you for helping me be patient! Now I can learn! 📚✨'
  },

  sports: {
    id: 'sports',
    name: 'Sports Challenge',     problemDeclaration: "I keep missing these shots! This is so frustrating!",

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
      // Wise symbol reactions
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
      // Unwise symbol reactions
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
    //successMessage: 'With courage and focus, you can overcome any challenge!',
    gratitude: 'Thank you for teaching me to stay brave and keep trying! ⚽✨'
  },

  shoelaces: {
    id: 'shoelaces',
    name: 'Shoelace Challenge',    problemDeclaration: "These shoelaces are all tangled! I'm getting so frustrated!",

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
      // Wise symbol reactions
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
      // Unwise symbol reactions
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
    //successMessage: 'With patience and method, any problem can be solved!',
    gratitude: 'Thank you for teaching me patience! My laces are perfect now! 👟✨'
  },

  broketoy: {
    id: 'broketoy',
    name: 'Broken Toy Challenge',    problemDeclaration: "Oh no! I broke my toy! What am I going to do?",

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
      // Wise symbol reactions
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
      // Unwise symbol reactions
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
    //successMessage: 'With honesty and courage, mistakes become learning!',
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
      // Wise symbol reactions
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
      // Unwise symbol reactions
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
    //successMessage: 'With generosity and joy, sharing becomes a gift!',
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
      // Wise symbol reactions
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
      // Unwise symbol reactions
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
    //successMessage: 'With courage and focus, any fear can be overcome!',
    gratitude: 'Thank you for helping me be brave! I can ride now! 🚴‍♂️✨'
  }
};

const GAME2_SCENARIOS = {
  grandparents: {
    id: 'grandparents',
    name: 'Grandparents & Technology',
    theme: 'Calm, learning, feeling supported',
    intro: 'The grandparents need help with their tablet!',
    gratitude: 'Thank you for helping us understand technology!',
    backgrounds: {
      before: grandparentsBefore,
      after: grandparentsAfter
    },
    helpers: [
      { 
        id: 'timmytime', 
        name: 'Timmy Time', 
        phrase: "No hurry, let's take our time!",
        interaction: { type: 'flip', instruction: 'Flip the hourglass!' },
        image: grandparentsTimmytime
      },
      { 
        id: 'clearolens', 
        name: 'Clearo Lens', 
        phrase: "I'll make things crystal clear!",
        interaction: { type: 'wipe', instruction: 'Wipe the lens clean!' },
        image: grandparentsClearolens
      },
      { 
        id: 'memoleaf', 
        name: 'Memo Leaf', 
        phrase: "I'll help you remember!",
        interaction: { type: 'tap', instruction: 'Tap to create memories!' },
        image: grandparentsMemoleaf
      },
      { 
        id: 'snuggyshawl', 
        name: 'Snuggy Shawl', 
        phrase: "Feel cozy, you've got this!",
        interaction: { type: 'hug', instruction: 'Wrap with warmth!' },
        image: grandparentsSnuggyshawl
      }
    ]
  },
  
  dog: {
    id: 'dog',
    name: 'Scared Dog',
    theme: 'Gentle love, security, happiness',
    intro: 'This little dog is frightened and needs comfort!',
    gratitude: 'Woof! Thank you for making me feel safe and happy!',
    backgrounds: {
      before: dogBefore,
      after: dogAfter
    },
    helpers: [
      { 
        id: 'snuggyblanket', 
        name: 'Snuggy Blanket', 
        phrase: "Warm hugs for you!",
        interaction: { type: 'hug', instruction: 'Give a warm hug!' },
        image: dogSnuggyblanket
      },
      { 
        id: 'aquabuddy', 
        name: 'Aqua Buddy', 
        phrase: "Here's a cool sip!",
        interaction: { type: 'pour', instruction: 'Pour refreshing water!' },
        image: dogAquabuddy
      },
      { 
        id: 'happytail', 
        name: 'Happy Tail', 
        phrase: "Let's wag away the fear!",
        interaction: { type: 'swing', instruction: 'Wag the tail!' },
        image: dogHappytail
      },
      { 
        id: 'brighttorch', 
        name: 'Bright Torch', 
        phrase: "I'll keep you safe in the dark!",
        interaction: { type: 'tap', instruction: 'Turn on the light!' },
        image: dogBrighttorch
      }
    ]
  },

  construction: {
    id: 'construction',
    name: 'Tired Construction Worker',
    theme: 'Motivation, energy boost, rhythm',
    intro: 'This worker is exhausted and needs energy!',
    gratitude: 'Thank you for giving me the strength to continue!',
    backgrounds: {
      before: constructionBefore,
      after: constructionAfter
    },
    helpers: [
      { 
        id: 'melodymug', 
        name: 'Melody Mug', 
        phrase: "Sip and sing!",
        interaction: { type: 'stir', instruction: 'Stir to create music!' },
        image: constructionMelodymug
      },
      { 
        id: 'rhythmoradio', 
        name: 'Rhythmo Radio', 
        phrase: "Shake off the tiredness!",
        interaction: { type: 'tap', instruction: 'Tune the radio!' },
        image: constructionRhythmoradio
      },
      { 
        id: 'hammerhero', 
        name: 'Hammer Hero', 
        phrase: "Strong and steady!",
        interaction: { type: 'swing', instruction: 'Heroic hammer swing!' },
        image: constructionHammerhero
      },
      { 
        id: 'sunnyspark', 
        name: 'Sunny Spark', 
        phrase: "A boost of sunshine for you!",
        interaction: { type: 'tap', instruction: 'Spread the sunshine!' },
        image: constructionSunnyspark
      }
    ]
  },

  mom: {
    id: 'mom',
    name: 'Tired Mom in Kitchen',
    theme: 'Love, support, refreshment',
    intro: 'Mom is overwhelmed with cooking and needs help!',
    gratitude: 'Thank you for making cooking fun again!',
    backgrounds: {
      before: momBefore,
      after: momAfter
    },
    helpers: [
      { 
        id: 'chefchintu', 
        name: 'Chef Chintu', 
        phrase: "I'll help stir things up!",
        interaction: { type: 'stir', instruction: 'Stir the pot!' },
        image: momChefchintu
      },
      { 
        id: 'bubblybottle', 
        name: 'Bubbly Bottle', 
        phrase: "Here's some energy for you!",
        interaction: { type: 'pour', instruction: 'Pour refreshing energy!' },
        image: momBubblybottle
      },
      { 
        id: 'gigglesspoon', 
        name: 'Giggles Spoon', 
        phrase: "Let's make cooking fun!",
        interaction: { type: 'stir', instruction: 'Mix with giggles!' },
        image: momGigglesspoon
      },
      { 
        id: 'peacemittens', 
        name: 'Peace Mittens', 
        phrase: "Stay cool, you're amazing!",
        interaction: { type: 'hug', instruction: 'Gentle squeeze!' },
        image: momPeacemittens
      }
    ]
  },

  siblings: {
    id: 'siblings',
    name: 'Fighting Siblings',
    theme: 'Harmony, love, playfulness',
    intro: 'These siblings are fighting and need to make peace!',
    gratitude: 'Thank you for helping us be friends again!',
    backgrounds: {
      before: siblingsBefore,
      after: siblingsAfter
    },
    helpers: [
      { 
        id: 'gigglebox', 
        name: 'Giggle Box', 
        phrase: "Let's play together!",
        interaction: { type: 'tap', instruction: 'Open the fun box!' },
        image: siblingsGigglebox
      },
      { 
        id: 'peaceballoon', 
        name: 'Peace Balloon', 
        phrase: "Float away the anger!",
        interaction: { type: 'tap', instruction: 'Make it float!' },
        image: siblingsPeaceballoon
      },
      { 
        id: 'huggypillow', 
        name: 'Huggy Pillow', 
        phrase: "One big hug time!",
        interaction: { type: 'hug', instruction: 'Fluff the pillow!' },
        image: siblingsHuggypillow
      },
      { 
        id: 'sharebear', 
        name: 'Share Bear', 
        phrase: "Sharing is caring!",
        interaction: { type: 'hug', instruction: 'Squeeze for sharing!' },
        image: siblingsSharebear
      }
    ]
  },

  park: {
    id: 'park',
    name: 'Littered Park',
    theme: 'Environment love, kindness, teamwork',
    intro: 'This beautiful park needs cleaning up!',
    gratitude: 'Thank you for making our park beautiful again!',
    backgrounds: {
      before: parkBefore,
      after: parkAfter
    },
    helpers: [
      { 
        id: 'leafyfriend', 
        name: 'Leafy Friend', 
        phrase: "Keep nature smiling!",
        interaction: { type: 'tap', instruction: 'Help the leaf grow!' },
        image: parkLeafyfriend
      },
      { 
        id: 'cleaniebucket', 
        name: 'Cleanie Bucket', 
        phrase: "Let's clean up together!",
        interaction: { type: 'pour', instruction: 'Pour cleaning sparkles!' },
        image: parkCleaniebucket
      },
      { 
        id: 'bloomyflower', 
        name: 'Bloomy Flower', 
        phrase: "I love a tidy garden!",
        interaction: { type: 'tap', instruction: 'Make the flower bloom!' },
        image: parkBloomyflower
      },
      { 
        id: 'sparklestar', 
        name: 'Sparkle Star', 
        phrase: "Shine bright when you help!",
        interaction: { type: 'tap', instruction: 'Star burst!' },
        image: parkSparklestar
      }
    ]
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

          helperBadgeVisible: false,
  characterMessage: null,
  characterMessageType: null, // ← Add this line
   // ✅ ADD THESE TWO LINES:
  showProblemDeclaration: false,
  problemDeclarationShown: false,

  ganeshaEmerged: false,
ganeshaBlessing: false,
ganeashaBlessingMessage: null,

selectedSymbol: null,        // Which symbol is selected for consideration  
selectedSymbolData: null,    // Store symbolId and isWise data
sceneClickable: false,       // Whether main scene can be clicked

// ✅ ADD these to existing Game 2 state:
game2Background: 'before', // before → after (during animation)
helperSymbolsGenerated: [], // 3 random symbols for current scenario
helperAnimationCompleted: false,

// ✅ ADD this line to existing Game 2 state:
game2Scenarios: [], // 3 random scenarios from 6 available
currentGame2Scenario: 0,
game2ScenariosCompleted: 0,
selectedHelperSymbol: null,
helperPopupVisible: false,
helperAnimationActive: false,
// ✅ ADD this missing line:
currentGame: 1, // 1 = Game 1, 2 = Game 2

          // Game 2: Golden Helper status  
          goldenHelperStatus: false,
          helperMissionsCompleted: 0,
          
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

          // ✅ ADD THESE TWO LINES:
showInAllTasksText: false,  // For "In All Tasks" after Game 1
showAlwaysText: false,      // For "Always" after Door 2 complete
          
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

  // Generate random scenarios for Game 1
  const generateRandomScenarios = () => {
    const scenarioKeys = Object.keys(SCENARIOS);
    const shuffled = [...scenarioKeys].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3); // Take first 3 for variety
  };

  // ✅ NEW: Generate random scenarios for Game 2
const generateRandomGame2Scenarios = () => {
  const scenarioKeys = Object.keys(GAME2_SCENARIOS);
  const shuffled = [...scenarioKeys].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3); // Take first 3 for variety
};

  // ✅ FIXED: Always use cave background
  const getCurrentBackground = () => {
    return sceneBackground; // Always cave background, never scenario images
  };

const getCurrentScenarioImage = () => {
  if (sceneState.currentGame === 2) {
    const scenario = getCurrentGame2Scenario();
    const imageState = sceneState.game2Background || 'before';
    return scenario.backgrounds[imageState]; // ✅ Use before/after
  } else {
    // Game 1 logic stays same
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

  // ✅ FIXED: Door 1 completion leads to character selection
  const handleDoor1Complete = () => {
    console.log('🚪 Door 1 completed - now choose character');
    
    setShowSparkle('door1-completing');
    
    sceneActions.updateState({
      door1Completed: true,
      phase: SCENE_PHASES.CHARACTER_SELECT,  // ← Go to character selection
     
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

  // ✅ FIXED: Character selection leads to Game 1
  const handleCharacterSelect = (character) => {
    
    console.log(`👦👧 Character selected: ${character} - starting Game 1`);
    
    setShowSparkle('character-selected');
    
    sceneActions.updateState({
      selectedCharacter: character,
  helperBadgeVisible: true, // ✅ NEW: Show helper badge
      characterSelected: true,
      phase: SCENE_PHASES.GAME1_INTRO,  // ← Go directly to Game 1
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
          startScenario(0);  // Instead of startFirstScenario()

    }, 2000);
  };

  // ✅ NEW: Start first scenario with uncertainty phase
  /*const startFirstScenario = () => {
    console.log('🎯 Starting first scenario in uncertainty phase');
    
    sceneActions.updateState({
      phase: SCENE_PHASES.SCENARIO_UNCERTAINTY,
      scenarioPhase: 'uncertainty',
      symbolsVisible: 'faint',
      symbolsClickable: false,
      sceneClarity: 'uncertain',
      ganeshaClicked: false,
      wiseChoicesMade: [],
      unwiseChoicesTried: [],
      currentBackground: 'worried'
    });
  };*/

  // ✅ WITH this new reusable function:
const startScenario = (scenarioIndex = 0) => {
  console.log(`🎯 Starting scenario ${scenarioIndex + 1} with problem declaration`);
  
  sceneActions.updateState({
    currentScenario: scenarioIndex,
    phase: SCENE_PHASES.SCENARIO_UNCERTAINTY,
    scenarioPhase: 'uncertainty',
    showProblemDeclaration: true,  // ✅ Show problem first
    symbolsVisible: 'none',        // ✅ Hide symbols initially
    symbolsClickable: false,
    sceneClarity: 'uncertain',
    ganeshaClicked: false,
    wiseChoicesMade: [],
    unwiseChoicesTried: [],
    currentBackground: 'worried',
      sceneInstructionText: null, // ✅ ADD THIS LINE - Reset instruction


     // ✅ ADD THESE LINES: Reset Ganesha states for clean start
  ganeshaEmerged: false,
  ganeshaBlessing: false,
  ganeshaBlessingMessage: null,
  characterMessage: null,
  characterMessageType: null
});
  
setTimeout(() => {
  // ✅ Always start with "Choose an option" for new scenario
  const instructionText = "What should I choose?";  // ✅ Personal & thoughtful
  
  sceneActions.updateState({
    showProblemDeclaration: false,
    problemDeclarationShown: true,
    symbolsVisible: 'clear',
    symbolsClickable: true,
    sceneInstructionText: instructionText
  });
}, 3000);
};

  // ✅ NEW: Ganesha guidance click - Phase 1: Ask for Help
  const handleGaneshaClick = () => {
    console.log('🐘 Phase 1: Ganesha clicked - divine clarity received!');
    
    setShowSparkle('divine-clarity');
    
    // Play temple chime sound effect here
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

// ✅ Symbol drop handler with specific symbol reactions
/*const handleSymbolDrop = (dragData) => {
  const { id, data } = dragData;
  const symbolId = data.symbolId;
  const isWise = data.isWise;
  
  console.log(`🎯 Symbol dropped: ${symbolId}, wise: ${isWise}`);
  
  // Get the specific reaction for this exact symbol
  const scenario = getCurrentScenario();
  const symbolReactions = scenario.characterReactions[symbolId] || [];
  const randomReaction = symbolReactions[Math.floor(Math.random() * symbolReactions.length)];
  
  sceneActions.updateState({
    phase: SCENE_PHASES.SCENARIO_CHOOSING,
    scenarioPhase: 'choosing'
  });
  
  if (isWise) {
    // ✅ Wise choice - specific positive reaction
    setShowSparkle('wise-choice');
    
    const newWiseChoices = [...(sceneState.wiseChoicesMade || []), symbolId];
    
    sceneActions.updateState({
      wiseChoicesMade: newWiseChoices,
      sceneClarity: 'success',
      currentBackground: 'success',
      characterMessage: randomReaction,
      characterMessageType: 'wise'
    });
    
  // ✅ NEW: Start Ganesha emergence sequence after character reacts
setTimeout(() => {
  handleGaneshaEmergence(symbolId);
}, 2500);
    
  } else {
    // ✅ Unwise choice - specific gentle feedback
    setShowSparkle('unwise-choice');
    
    const newUnwiseChoices = [...(sceneState.unwiseChoicesTried || []), symbolId];
    
    sceneActions.updateState({
      unwiseChoicesTried: newUnwiseChoices,
      sceneClarity: 'dimmed',
      characterMessage: randomReaction,
      characterMessageType: 'unwise'
    });
    
    // Show encouragement and return to choosing
    setTimeout(() => {
      sceneActions.updateState({
        characterMessage: "Let me think of a better choice... 💭",
        characterMessageType: 'encouragement'
      });
      
      // Clear message and return to choosing
      setTimeout(() => {
        sceneActions.updateState({
          scenarioPhase: 'clarity',
          sceneClarity: 'clear',
          characterMessage: null,
          characterMessageType: null
        });
        setShowSparkle(null);
      }, 2000);
    }, 1500);
  }
};*/

const handleSymbolClick = (symbolId, isWise) => {
  console.log(`🤔 Symbol selected for consideration: ${symbolId}, wise: ${isWise}`);
  
  sceneActions.updateState({
    selectedSymbol: symbolId,
    selectedSymbolData: { symbolId, isWise },
    sceneClickable: true,
        sceneInstructionText: "Let's see what happens if I do this!",  // ✅ NEW: Confirmation text
    phase: SCENE_PHASES.SCENARIO_CHOOSING,
    scenarioPhase: 'choosing'
  });
  
  // Visual feedback for selection
  setShowSparkle('symbol-selected');
  setTimeout(() => setShowSparkle(null), 1000);
};

const handleSceneClick = () => {
  if (!sceneState.selectedSymbolData || !sceneState.sceneClickable) return;
  
  const { symbolId, isWise } = sceneState.selectedSymbolData;
  console.log(`✅ Choice confirmed: ${symbolId}, wise: ${isWise}`);
  
  // Get the specific reaction for this exact symbol
  const scenario = getCurrentScenario();
  const symbolReactions = scenario.characterReactions[symbolId] || [];
  const randomReaction = symbolReactions[Math.floor(Math.random() * symbolReactions.length)];
  
  // Clear selection and disable scene clicking
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
    // ✅ Wise choice - specific positive reaction
    setShowSparkle('wise-choice');
    
    const newWiseChoices = [...(sceneState.wiseChoicesMade || []), symbolId];
    
    sceneActions.updateState({
      wiseChoicesMade: newWiseChoices,
      sceneClarity: 'success',
      currentBackground: 'success',
      characterMessage: randomReaction,
      characterMessageType: 'wise'
    });
    
    // ✅ NEW: Start Ganesha emergence sequence after character reacts
    setTimeout(() => {
      handleGaneshaEmergence(symbolId);
    }, 2500);
    
  } else {
    // ✅ Unwise choice - specific gentle feedback
    setShowSparkle('unwise-choice');
    
    const newUnwiseChoices = [...(sceneState.unwiseChoicesTried || []), symbolId];
    
    sceneActions.updateState({
      unwiseChoicesTried: newUnwiseChoices,
      sceneClarity: 'dimmed',
      characterMessage: randomReaction,
      characterMessageType: 'unwise'
    });
    
    // Show encouragement and return to choosing
    setTimeout(() => {
      sceneActions.updateState({
        characterMessage: "Let me think of a better choice... 💭",
        characterMessageType: 'encouragement'
      });
      
  // Clear message and return to choosing
setTimeout(() => {
  sceneActions.updateState({
    scenarioPhase: 'clarity',
    sceneClarity: 'clear',
    characterMessage: null,
    characterMessageType: null,
    sceneInstructionText: "That's okay, let me try again!"  // ✅ Encouraging & warm
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
    // All 3 scenarios complete - go to Door 2
    setTimeout(() => completeGame1(), 3000);
  } else {
    // ✅ REPLACE this entire section:
    setTimeout(() => {
      // ❌ Remove this old logic:
      /*
      sceneActions.updateState({
        currentScenario: nextScenario,
        phase: SCENE_PHASES.SCENARIO_UNCERTAINTY,
        scenarioPhase: 'uncertainty',
        symbolsVisible: 'faint',
        symbolsClickable: false,
        sceneClarity: 'uncertain',
        ganeshaClicked: false,
        wiseChoicesMade: [],
        unwiseChoicesTried: [],
        currentBackground: 'worried'
      });
      */
      
      // ✅ Use the reusable function instead:
      setShowSparkle(null);
      startScenario(nextScenario);  // This will show problem declaration!
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
  
  // ✅ STEP 1: Hide Game 1, show clean text phase
  sceneActions.updateState({
    game1Completed: true,
    phase: SCENE_PHASES.SARVAKARYESHU_LEARNING, // ✅ NEW: Clean phase for text
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
  
  // ✅ STEP 2: Hide text after animation
  setTimeout(() => {
    sceneActions.updateState({ 
      showInAllTasksText: false,
      sidebarHighlightState: null 
    });
  }, 4000);
  
  // ✅ STEP 3: Transition to Door 2
  setTimeout(() => {
    setShowSparkle(null);
    completeSarvakaryeshuLearning();
  }, 5000);
};

// ✅ NEW: Separate function to transition to Door 2 (like Nirvighnam)
const completeSarvakaryeshuLearning = () => {
  console.log('📜 Sarvakaryeshu learned - transitioning to Door 2');
  
  // Brief sparkle effect toward sidebar
  setShowSparkle('sarvakaryeshu-to-sidebar');
  
  // Auto-transition to Door 2 after brief celebration
  setTimeout(() => {
    setShowSparkle(null);
    sceneActions.updateState({
      phase: SCENE_PHASES.DOOR2_ACTIVE  // ✅ NOW Door 2 appears
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
  // Phase 1: Ganesha emerges (immediately)
  sceneActions.updateState({ ganeshaEmerged: true });
  
  // Phase 2: Ganesha blesses (after 1.5 seconds)
  setTimeout(() => {
    sceneActions.updateState({ 
      ganeshaBlessing: true,
      ganeshaBlessingMessage: "Well done! I am with you in all your tasks!"
    });
  }, 1500);
  
  // Phase 3: Character gratitude (after 3.5 seconds)
  setTimeout(() => {
    sceneActions.updateState({
      characterMessage: "Thank you Ganesha! I feel your guidance! ✨",
      characterMessageType: 'grateful'
    });
  }, 3500);
  
  // Phase 4: Complete scenario (after 6 seconds)
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

const handleDoor2Complete = () => {
  console.log('🚪 Door 2 completed - starting Game 2!');
  
  setShowSparkle('door2-completing');
  
  sceneActions.updateState({
    door2Completed: true,
    // ✅ NO phase change yet - wait for sparkle
    stars: 7,
    progress: {
      percentage: 85,
      starsEarned: 7,
      completed: false
    }
  });
  
  setTimeout(() => {
    setShowSparkle(null);
    startGame2(); // ✅ Start Game 2 (like Door 1 starts Game 1)
  }, 3000);
};

// ✅ NEW: Start Game 2 - Helping Others
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

// ✅ FIX: Use scenario.helpers instead of scenario.symbols
const generateRandomHelperSymbols = (scenario) => {
  const allSymbols = scenario.helpers; // ✅ FIXED: Use helpers array
  const shuffled = [...allSymbols].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3); // Take 3 random ones
};

// ✅ FIX: Use scenario.helpers
const getCurrentHelperSymbols = () => {
  if (!sceneState.helperSymbolsGenerated?.length) {
    const scenario = getCurrentGame2Scenario();
    return generateRandomHelperSymbols(scenario);
  }
  return sceneState.helperSymbolsGenerated;
};

const startGame2Scenario = (scenarioIndex = 0) => {
  console.log(`🎯 Starting Game 2 scenario ${scenarioIndex + 1}`);
  
  const scenario = getCurrentGame2Scenario();
// ✅ CHANGE this line:
const randomSymbols = generateRandomHelperSymbols(scenario);
  
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
    helperSymbolsGenerated: randomSymbols, // ✅ Store 3 random symbols
    characterMessage: null
  });
  
  setTimeout(() => {
    sceneActions.updateState({
      showProblemDeclaration: false,
      symbolsVisible: 'clear',
      symbolsClickable: true,
      sceneInstructionText: "How can I help them?"
    });
  }, 3000);
};

const handleHelperPopupClick = () => {
  if (!sceneState.selectedHelperSymbol) return;
  
  sceneActions.updateState({
    helperPopupVisible: false,
    helperAnimationActive: true,
    game2Background: 'after', // ✅ Switch to 'after' image
    phase: SCENE_PHASES.HELPER_ANIMATION
  });
  
  // Simulate helper animation duration
  setTimeout(() => {
    sceneActions.updateState({
      helperAnimationCompleted: true
    });
    completeGame2Scenario();
  }, 3000);
};

// ✅ NEW: Handle Game 2 symbol selection (different from Game 1)
const handleGame2SymbolClick = (symbolId) => {
  console.log(`🤝 Helper symbol selected: ${symbolId}`);
  
  sceneActions.updateState({
    selectedHelperSymbol: symbolId,
    helperPopupVisible: true,
    phase: SCENE_PHASES.HELPER_CHOOSING,
    sceneInstructionText: "Click the popup to help!"
  });
  
  setShowSparkle('helper-symbol-selected');
  setTimeout(() => setShowSparkle(null), 1000);
};

// ✅ NEW: Complete Game 2 scenario
const completeGame2Scenario = () => {
  const scenario = getCurrentGame2Scenario();
  console.log(`✨ Game 2 scenario ${sceneState.currentGame2Scenario + 1} completed: ${scenario.name}`);
  
  setShowSparkle('helper-success');
  
  const nextScenario = (sceneState.currentGame2Scenario || 0) + 1;
  const scenariosCompleted = (sceneState.game2ScenariosCompleted || 0) + 1;
  
  sceneActions.updateState({
    phase: SCENE_PHASES.HELPER_SUCCESS,
    game2ScenariosCompleted: scenariosCompleted,
    helperAnimationActive: false,
    characterMessage: scenario.gratitude,
    characterMessageType: 'grateful'
  });
  
  // Ganesha blessing for being a helper
  setTimeout(() => {
    sceneActions.updateState({
      ganeshaEmerged: true,
      ganeshaBlessing: true,
      ganeshaBlessingMessage: "You are truly my helper! Well done!"
    });
  }, 2000);
  
  if (scenariosCompleted >= 3) {
    // All 3 Game 2 scenarios complete - go to final celebration
    setTimeout(() => completeGame2(), 4000);
  } else {
    // Start next scenario
    setTimeout(() => {
      setShowSparkle(null);
      startGame2Scenario(nextScenario);
    }, 4000);
  }
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
  
  // ✅ Show "Always" text + complete the scene
  sceneActions.updateState({
    game2Completed: true,
    phase: SCENE_PHASES.COMPLETE, // ✅ Complete the scene
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
  
  // ✅ Hide text after animation
  setTimeout(() => {
    sceneActions.updateState({ 
      showAlwaysText: false,
      sidebarHighlightState: null 
    });
  }, 4000);
  
  // ✅ Start final fireworks
  setTimeout(() => {
    setShowSparkle('final-fireworks');
  }, 5000);
};

  // Get current scenario data
  const getCurrentScenario = () => {
    if (!sceneState.selectedScenarios || sceneState.currentScenario >= sceneState.selectedScenarios.length) {
      return SCENARIOS.homework; // Fallback
    }
    const scenarioKey = sceneState.selectedScenarios[sceneState.currentScenario];
    return SCENARIOS[scenarioKey] || SCENARIOS.homework;
  };

  // ✅ NEW: Get current Game 2 scenario data
const getCurrentGame2Scenario = () => {
  if (!sceneState.game2Scenarios || sceneState.currentGame2Scenario >= sceneState.game2Scenarios.length) {
    return GAME2_SCENARIOS.grandparents; // Fallback
  }
  const scenarioKey = sceneState.game2Scenarios[sceneState.currentGame2Scenario];
  return GAME2_SCENARIOS[scenarioKey] || GAME2_SCENARIOS.grandparents;
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

           {/* ✅ UPDATED: Character Selection - Clean version */}
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

            {/* ✅ THIRD: Game 1 - Cave Environment with Central Window */}
            {(sceneState.phase === SCENE_PHASES.SCENARIO_UNCERTAINTY ||
              sceneState.phase === SCENE_PHASES.SCENARIO_CLARITY ||
              sceneState.phase === SCENE_PHASES.SCENARIO_CHOOSING ||
              sceneState.phase === SCENE_PHASES.SCENARIO_SUCCESS) && (
              <>

{sceneState.sceneInstructionText && 
 !sceneState.characterMessage && 
 (sceneState.symbolsClickable || sceneState.sceneClickable) && (  // ✅ Show for both symbol selection AND confirmation
<div className="personal-instruction-bubble">
  <p>{sceneState.sceneInstructionText}</p>
</div>
)}

  {/* ✅ SIMPLE: Just make the scenario window clickable when needed */}
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

  {/* Character Speech Bubble */}
  {sceneState.characterMessage && (
    <div className={`character-speech-bubble ${sceneState.characterMessageType}`}>
      <p>{sceneState.characterMessage}</p>
    </div>
  )}

  {/* Problem Declaration */}
  {sceneState.showProblemDeclaration && (
    <div className="character-problem-speech">
      <p>{getCurrentScenario().problemDeclaration}</p>
    </div>
  )}
  
  {/* Simple instruction overlay */}
  {sceneState.sceneClickable && (
    <div className="simple-click-instruction">
      <p>Click Here</p>
    </div>
  )}
</div>

{/* ❌ REMOVE all the complicated ClickableElement overlay stuff */}


                {/* Child Character Drop Zone - Over Window 
                {sceneState.symbolsClickable && (
                  <DropZone
                    id="child-character"
                    acceptTypes={['wise-symbol', 'unwise-symbol']}
                    onDrop={handleSymbolDrop}
                    className="scenario-drop-zone"
                  />
                )}

                {/* ✅ FIXED - Always visible during Game 1 scenarios 
{(sceneState.phase === SCENE_PHASES.SCENARIO_UNCERTAINTY ||
  sceneState.phase === SCENE_PHASES.SCENARIO_CLARITY ||
  sceneState.phase === SCENE_PHASES.SCENARIO_CHOOSING ||
  sceneState.phase === SCENE_PHASES.SCENARIO_SUCCESS) && (
  <ClickableElement
    id="ganesha-guidance"
    onClick={handleGaneshaClick}
    completed={false}
    zone="guidance-zone"
  >
    <div className="ganesha-cave-position">
      <img src={ganeshaIcon} alt="Ask Ganesha for Help" />
      <div className="ganesha-cave-glow"></div>
    </div>
  </ClickableElement>
)}*/}

{/* NEW: Only appears when ganeshaEmerged is true */}
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

      {/* Individual Symbols - FIXED Positions - NO reshuffling */}
{sceneState.symbolsVisible !== 'none' && 
  (() => {
    const scenario = getCurrentScenario();
    // Simple fixed order: wise[0], unwise[0], wise[1], unwise[1]
    const fixedSymbols = [
      scenario.symbols.wise[0],    // position-1
      scenario.symbols.unwise[0],  // position-2  
      scenario.symbols.wise[1],    // position-3
      scenario.symbols.unwise[1]   // position-4
    ];
    
    return fixedSymbols.map((symbol, index) => {
      const isWise = scenario.symbols.wise.includes(symbol);
        const hasBeenTried = (sceneState.unwiseChoicesTried || []).includes(symbol.id);  // ✅ ADD THIS

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
  ${sceneState.selectedSymbol === symbol.id ? 'selected' : ''}`}  style={{
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

{/* ✅ SIMPLE: Jump to Game 2 Button */}
<div style={{
  position: 'absolute',
  top: '50px',
  right: '50px',
  zIndex: 1000
}}>
  <button 
    onClick={() => {
      console.log('🎮 Jumping to Game 2');
      
      sceneActions.updateState({
        // Basic setup
        selectedCharacter: 'boy',
        currentGame: 2,
        phase: SCENE_PHASES.HELPER_UNCERTAINTY,
        
        // Game 2 state
        game2Scenarios: ['grandparents', 'dog', 'construction'], // Fixed scenarios for testing
        currentGame2Scenario: 0,
        game2ScenariosCompleted: 0,
        
        // UI state
        showProblemDeclaration: true,
        symbolsVisible: 'clear',
        symbolsClickable: true,
        sceneInstructionText: "How can I help them?",
        
        // Progress
        stars: 6,
        learnedWords: {
          sarvakaryeshu: { learned: true, scene: 4 },
          sarvada: { learned: false, scene: 4 }
        }
      });
    }}
    style={{
      background: '#FF6B6B',
      color: 'white',
      border: 'none',
      padding: '10px 15px',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '14px'
    }}
  >
    → Game 2
  </button>
</div>

                
                {/*{sceneState.scenarioPhase === 'uncertainty' && (
                  <div className="cave-coaching-message">
                    <p>{getCurrentScenario().coaching}</p>
                  </div>
                )}*/}
              </>
            )}

            {/* ✅ FOURTH: Door 2 Component - Shows AFTER 3 scenarios complete */}
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

            {/* ✅ GAME 2 SCENARIOS */}
{sceneState.currentGame === 2 && (
  sceneState.phase === SCENE_PHASES.HELPER_UNCERTAINTY ||
  sceneState.phase === SCENE_PHASES.HELPER_CHOOSING ||
  sceneState.phase === SCENE_PHASES.HELPER_ANIMATION ||
  sceneState.phase === SCENE_PHASES.HELPER_SUCCESS
) && (
  <>
    {/* Game 2 Scenario Window */}
    <div className="scenario-window game2-style">
      <img 
        src={getCurrentScenarioImage()} 
        alt="Helper mission"
        className="scenario-image"
      />
      
      {/* Problem Declaration */}
      {sceneState.showProblemDeclaration && (
        <div className="person-problem-speech">
          <p>{getCurrentGame2Scenario().problemDeclaration}</p>
        </div>
      )}
    </div>

    {/* 3 Helper Symbols */}
    {sceneState.symbolsVisible !== 'none' && (
      getCurrentHelperSymbols().map((symbol, index) => (
        <div key={symbol.id} className={`helper-symbol position-${index + 1}`}>
          <ClickableElement
            id={`helper-${symbol.id}`}
            onClick={() => handleGame2SymbolClick(symbol.id)}
            disabled={!sceneState.symbolsClickable}
          >
            <div className="helper-symbol-item">
              <img src={symbol.image} alt={symbol.name} />
              <span>{symbol.name}</span>
            </div>
          </ClickableElement>
        </div>
      ))
    )}

    {/* Helper Popup */}
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
    )}
  </>
)}

            {/* ✅ NEW: Sarvakaryeshu & Sarvada Animated Texts */}

{/* ✅ UPDATED: Centered text when Game 1 is hidden */}
{sceneState.showInAllTasksText && (
  <div className="in-all-tasks-text" style={{
    position: 'absolute',
    top: '50%',        // ✅ CHANGED: Centered vertically
    left: '50%',       // ✅ CHANGED: Centered horizontally
    transform: 'translate(-50%, -50%)', // ✅ CHANGED: Perfect center
    fontSize: '32px',  // ✅ BIGGER: More prominent
    fontWeight: 'bold',
    color: '#FFD700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    animation: 'textGlow 3s ease-out forwards',
    zIndex: 15
  }}>
    In All Tasks
  </div>
)}

{/* Sarvada - Always Text (after Door 2 completion) */}
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

{/* ✅ NEW: Sarvakaryeshu to Sidebar Effect */}
{showSparkle === 'sarvakaryeshu-to-sidebar' && (
  <div style={{
    position: 'absolute',
    top: '30%',
    left: '25%',
    width: '300px',
    height: '200px',
    zIndex: 15,
    pointerEvents: 'none'
  }}>
    <SparkleAnimation
      type="stream"
      count={20}
      color="#FFD700"
      size={10}
      duration={3000}
      fadeOut={true}
      area="full"
    />
  </div>
)}

{/* ✅ NEW: Sarvada to Sidebar Effect */}
{showSparkle === 'sarvada-to-sidebar' && (
  <div style={{
    position: 'absolute',
    top: '30%',
    right: '25%',
    width: '300px',
    height: '200px',
    zIndex: 15,
    pointerEvents: 'none'
  }}>
    <SparkleAnimation
      type="stream"
      count={20}
      color="#FF8C42"
      size={10}
      duration={3000}
      fadeOut={true}
      area="full"
    />
  </div>
)}

            {/* Progress Counter 
            <div className="scene-counter">
              <div className="counter-icon">
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(45deg, #FFD700, #ffb347)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}>
                  📜
                </div>
              </div>
              
              <div className="counter-progress">
                <div 
                  className="counter-progress-fill"
                  style={{
                    width: `${sceneState.progress?.percentage || 0}%`,
                    height: '100%',
                    background: 'linear-gradient(to right, #FFD700, #ffb347)',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
              
              <div className="counter-display" style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#333'
              }}>
                {sceneState.stars || 0}/8
              </div>
            </div>

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