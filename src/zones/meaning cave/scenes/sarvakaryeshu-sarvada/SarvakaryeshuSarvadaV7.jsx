// zones/cave-of-secrets/scenes/sarvakaryeshu-sarvada/SarvakaryeshuSarvada.jsx
import React, { useState, useEffect, useRef } from 'react';
import OpeningModal from '../../../shared/components/OpeningModal.jsx';
import './SarvakaryeshuSarvada.css';
// import SimpleDiscoveryOverlay from '../../../shared/components/SimpleDiscoveryOverlay'; // ← superseded by SymbolAutoReveal
import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';
import useIdleNudge from '../../../../lib/hooks/useIdleNudge';
import IdleHint from '../../../../lib/components/idle/IdleHint';
import ganeshaCharacterCave from './assets/images/ganesha-character-cave.png';
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../../lib/config/content/openingModals';
import { getCompletionModal } from '../../../../lib/config/content';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import { ClickableElement } from "../../../../lib/components/scenes/InteractionManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import FireworksCompletion from '../../../../lib/components/feedback/FireworksCompletion';
import CalmGoldenFireworks from '../../../../lib/components/feedback/CalmGoldenFireworks';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../../lib/components/ui/AudioToggle';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';

// Scene-specific components
import SymbolSidebar from '../../components/SymbolSidebar';
import DoorComponent from '../../components/DoorComponent';
import RescueModal from '../../components/RescueModal';
import { RESCUE_CONFIGS } from '../../config/RescueConfigs';
import HelperSignatureAnimation from './HelperSignatureAnimation';


import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';

// Import assets
import sceneBackground from './assets/images/scene-background.png';
import doorImage from './assets/images/door-image.png';
import boyPreview from './assets/images/boy-preview.png';
import girlPreview from './assets/images/girl-preview.png';
import ganeshaIcon from './assets/images/ganesha-icon.png';
import mooshikaCoach from './assets/images/mooshika-coach.png';

// Symbol images for celebrations
import sarvakaryeshuSymbol from '../../assets/images/symbols/sarvakaryeshu-symbol.png';
import sarvadaSymbol from '../../assets/images/symbols/sarvada-symbol.png';

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
import homeworkSymbolPatience from './assets/images/game 1/symbols/homework_symbol_patience.png';
import homeworkSymbolStepbook from './assets/images/game 1/symbols/homework_symbol_stepbook.png';
import homeworkSymbolGaming from './assets/images/game 1/symbols/homework_symbol_gaming.png';
import homeworkSymbolGiveup from './assets/images/game 1/symbols/homework_symbol_giveup.png';

import sportsSymbolTry from './assets/images/game 1/symbols/sports_symbol_try.png';
import sportsSymbolRelax from './assets/images/game 1/symbols/sports_symbol_relax.png';
import sportsSymbolScared from './assets/images/game 1/symbols/sports_symbol_toohard.png';
import sportsSymbolHide from './assets/images/game 1/symbols/sports_symbol_hide.png';

import shoelaceSymbolPatient from './assets/images/game 1/symbols/shoelace_symbol_patient.png';
import shoelacesSymbolMethod from './assets/images/game 1/symbols/shoelaces_symbol_method.png';
import shoelaceSymbolAngry from './assets/images/game 1/symbols/shoelace_symbol_angry.png';
import shoelaceSymbolSlipOn from './assets/images/game 1/symbols/shoelace_symbol_slipon.png';

import brokenSymbolSorry from './assets/images/game 1/symbols/broken_symbol_sorry.png';
import brokenSymbolHelp from './assets/images/game 1/symbols/broken_symbol_help.png';
import brokenSymbolBlame from './assets/images/game 1/symbols/broken_symbol_blame.png';
import brokenSymbolHide from './assets/images/game 1/symbols/broken_symbol_hide.png';

import sharingSymbolGenerosity from './assets/images/game 1/symbols/sharing_symbol_generosity.png';
import sharingSymbolJoy from './assets/images/game 1/symbols/sharing_symbol_joy.png';
import sharingSymbolAngry from './assets/images/game 1/symbols/sharing_symbol_anger.png';
import sharingSymbolEscape from './assets/images/game 1/symbols/sharing_symbol_escape.png';

import bikeSymbolFocus from './assets/images/game 1/symbols/bike_symbol_focus.png';
import bikeSymbolRelax from './assets/images/game 1/symbols/bike_symbol_relax.png';
import bikeSymbolFear from './assets/images/game 1/symbols/bike_symbol_fear.png';
import bikeSymbolGiveUp from './assets/images/game 1/symbols/bike_symbol_giveup.png';

// Game 2 Background imports
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

// Game 2 Helper imports
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

import meaningJournal from '../../assets/images/meaning-journal.png';

// All 8 app images
import appVakratunda from '../../assets/images/apps/app-Vakratunda.png';
import appMahakaya from '../../assets/images/apps/app-mahakaya.png';
import appSuryakoti from "../../assets/images/apps/app-suryakoti.png";
import appSamaprabha from "../../assets/images/apps/app-samaprabha.png";
import appNirvighnam from "../../assets/images/apps/app-nirvighnam.png";
import appKurumedeva from "../../assets/images/apps/app-kurumedeva.png";
import appSarvakaryeshu from "../../assets/images/apps/app-sarvakaryeshu.png";
import appSarvada from "../../assets/images/apps/app-sarvada.png";

// Power configuration for celebrations
const powerConfig = {
  sarvakaryeshu: {
    name: 'All Tasks Wisdom',
    image: sarvakaryeshuSymbol,
    color: '#FFD700'
  },
  sarvada: {
    name: 'Always Helper Power',
    image: sarvadaSymbol,
    color: '#FF8C42'
  }
};

const SCENE_PHASES = {
  STORY_INTRO: 'story_intro', // ← NEW
  DOOR1_ACTIVE: 'door1_active',
  DOOR1_COMPLETE: 'door1_complete',
  CHARACTER_SELECT: 'character_select',
  GAME1_INTRO: 'game1_intro',
  SCENARIO_CHOOSING: 'scenario_choosing',
  SCENARIO_SUCCESS: 'scenario_success',
  SARVAKARYESHU_LEARNING: 'sarvakaryeshu_learning',
  DOOR2_ACTIVE: 'door2_active',
  DOOR2_COMPLETE: 'door2_complete',
  GAME2_INTRO: 'game2_intro',
  HELPER_CHOOSING: 'helper_choosing',
  HELPER_SUCCESS: 'helper_success',
  SARVADA_LEARNING: 'sarvada_learning',  // ❌ Missing? Discovery 2
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
    characterReactions: {
      patience: "Oh! Taking my time sounds much better! 📚",
      stepbook: "Step by step! That's perfect! 📖",
      gaming: "But playing games won't help me learn... 🎮",
      giveup: "Giving up won't solve my problem... 😔"
    },
    gratitude: 'Thank you for helping me be patient! 📚✨'
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
    characterReactions: {
      try: "Yes! I'll keep trying! Practice makes perfect! ⚽",
      relax: "Staying calm will help me focus better! 🧘‍♂️",
      scared: "Being scared won't help me get better... 😰",
      hide: "Hiding won't make me a better player... 🙈"
    },
    gratitude: 'Thank you for teaching me to stay brave! ⚽✨'
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
    characterReactions: {
      patient: "Being patient is much better! 👟",
      method: "Using a method will help! 🧵",
      angry: "Getting angry will make it worse... 😤",
      slipon: "That's avoiding the problem... 🤔"
    },
    gratitude: 'Thank you for teaching me patience! 👟✨'
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
    characterReactions: {
      sorry: "I should say sorry for breaking it! 😊",
      help: "Asking for help is much better! 🤝",
      blame: "Blaming others won't fix it... 😔",
      hide: "Hiding will make things worse... 🙈"
    },
    gratitude: 'Thank you for helping me be brave! 🧸✨'
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
    characterReactions: {
      generosity: "Being generous makes me feel warm! 🤗",
      joy: "Sharing joy is so much better! 😊",
      angry: "Getting angry won't help... 😠",
      escape: "Running away means no friends... 🏃‍♂️"
    },
    gratitude: 'Thank you for teaching me to share! 🎁✨'
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
    characterReactions: {
      focus: "Staying focused will help me balance! 🚴‍♂️",
      relax: "Being calm makes me feel braver! 😌",
      fear: "Giving in to fear won't help... 😰",
      giveup: "Giving up means I'll never learn... 🚴‍♂️"
    },
    gratitude: 'Thank you for helping me be brave! 🚴‍♂️✨'
  }
};

// Game 2 scenarios configuration  
const GAME2_SCENARIOS = {
  grandparents: {
    id: 'grandparents',
    name: 'Help Grandparents with Technology',
    problemDeclaration: "This tablet is so confusing! We can't figure out video calling!",
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
    gratitude: "Thank you for being so patient! Now we can call family! 📱✨",
    ganeshaBlessing: "You showed patience and kindness!"
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
    ganeshaBlessing: "You brought comfort to the frightened!"
  },
  construction: {
    id: 'construction',
    name: 'Help Tired Construction Worker',
    problemDeclaration: "This work is so hard and loud! I need energy!",
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
    ganeshaBlessing: "You brought energy to the weary!"
  },
  mom: {
    id: 'mom',
    name: 'Help Busy Mom in Kitchen',
    problemDeclaration: "I have so much cooking to do! I could use help!",
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
    gratitude: "Thank you for making cooking fun! 🍳✨",
    ganeshaBlessing: "You brought joy to daily work!"
  },
  siblings: {
    id: 'siblings',
    name: 'Help Fighting Siblings',
    problemDeclaration: "We're fighting! Help us make peace!",
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
    gratitude: "Thank you for helping us be friends! 👫✨",
    ganeshaBlessing: "You created harmony from chaos!"
  },
  park: {
    id: 'park',
    name: 'Clean Up Littered Park',
    problemDeclaration: "This beautiful park is so messy!",
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
    gratitude: "Thank you for making our park beautiful! 🌳✨",
    ganeshaBlessing: "You cared for nature and community!"
  }
};

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Scene 4 Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SarvakaryeshuSarvada = ({ onComplete, onNavigate, zoneId = 'cave-of-secrets', sceneId = 'sarvakaryeshu-sarvada' }) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          phase: SCENE_PHASES.DOOR1_ACTIVE,
          selectedCharacter: null,

          phase: SCENE_PHASES.DOOR1_ACTIVE, // ✅ Was 'STORY_INTRO'
          welcomeShown: false, // ✅ Add this

          // Door states
          door1Completed: false,
          door1CurrentStep: 0,
          door1SyllablesPlaced: [],
          door1Syllables: ['Sar', 'va', 'kar', 'yeshu'],

          door2Completed: false,
          door2CurrentStep: 0,
          door2SyllablesPlaced: [],
          door2Syllables: ['Sar', 'va', 'da'],

          // Game 1
          currentGame: 1,
          selectedScenarios: [],
          currentScenario: 0,
          scenariosCompleted: 0,
          game1Completed: false,
          currentBackground: 'worried',

          symbolsVisible: 'none',
          symbolsClickable: false,  // ← ADD THIS
          selectedSymbol: null,  // ← Make sure this is null initially

          ganeshaGuidanceMessage: null,
          unwiseChoicesTried: [],


          // Game 2
          game2Scenarios: [],
          currentGame2Scenario: 0,
          game2ScenariosCompleted: 0,
          game2Completed: false,
          game2Background: 'before',
          selectedHelper: null,          // ← ADD THIS
          showHelperAnimation: false,    // ← ADD THIS

          // Sanskrit learning
          learnedWords: {
            vakratunda: { learned: true, scene: 1 },
            mahakaya: { learned: true, scene: 1 },
            suryakoti: { learned: true, scene: 2 },
            samaprabha: { learned: true, scene: 2 },
            nirvighnam: { learned: true, scene: 3 },
            kurumedeva: { learned: true, scene: 3 },
            sarvakaryeshu: { learned: false, scene: 4 },
            sarvada: { learned: false, scene: 4 }
          },

          stars: 0,
          completed: false,
          showingCompletionScreen: false
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
  // GameCoach removed - stub functions
  const hideCoach = () => { };
  const clearManualCloseTracking = () => { };

  const { resetScene } = useSceneReset(
    sceneActions,
    'cave-of-secrets',
    'sarvakaryeshu-sarvada',
    getSceneResetConfig('sarvakaryeshu-sarvada')
  );
  const completionModalContent = getCompletionModal(zoneId, sceneId);
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const primaryRef = useRef(null);
  const { isIdle, resetIdle } = useIdleNudge(20000);
  // ── T08/T09: visibility + idle timer infrastructure ──────────────────────────
  const { startIdleTimer, stopIdleTimer, setCurrentPhase } = useVoiceGuidance(
    zoneId, sceneId, { enableMusic: false, idleTimeout: 20 }
  );
  useEffect(() => { startIdleTimer(); return () => stopIdleTimer(); }, [startIdleTimer, stopIdleTimer]);
  useEffect(() => { setCurrentPhase(sceneState?.phase ?? null); }, [sceneState?.phase, setCurrentPhase]);

  // State management
  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);

  // NEW: Celebration states
  const [showCenteredSymbol, setShowCenteredSymbol] = useState(null);
  const [showPowerModal, setShowPowerModal] = useState(false);
  const [currentMissionSymbol, setCurrentMissionSymbol] = useState(null);
  const [showRescueModal, setShowRescueModal] = useState(false);
  const [currentRescueWord, setCurrentRescueWord] = useState(null);

  const timeoutsRef = useRef([]);
  const progressiveHintRef = useRef(null);

  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';
  // Add to state
  const [showStoryModal, setShowStoryModal] = useState(null); // 'sarvakaryeshu' or 'sarvada'
  const isProcessingClickRef = useRef(false);
  const lastClickTimeRef = useRef(0);
  const CLICK_COOLDOWN = 800; // 800ms between clicks
  const [bannerMessage, setBannerMessage] = useState('initial');
  const currentlyProcessingSymbolRef = useRef(null);  // ← NEW: Track specific symbol
  const game2HelperSelectedRef = useRef(false);  // Track if ANY helper selected
  const game2ProcessingHelperRef = useRef(null); // Track which helper is processing

  // Discovery overlay states — superseded by SymbolAutoReveal
  const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false); // kept for guard compat
  const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false); // kept for guard compat
  // ── SymbolAutoReveal state ─────────────────────────────────────────────────
  const [revealConfig, setRevealConfig] = useState(null);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');
  const resumePopupTimeoutRef = useRef(null);
  const reloadHandledRef = useRef(false);

  // Story modal data
  const STORY_MODALS = {
    sarvakaryeshu: {
      icon: ganeshaIcon,
      speech: "Let's create divine decorations! ✨",
      title: "Help Ganesha Bless All Actions!",
      subtitle: "2 divine words to master!",
      description: "First, learn to chant SARVAKARYESHU to unlock divine action power and save animals!",
      buttonText: "Start Learning!",
      buttonColor: "linear-gradient(135deg, #FFD700, #FFA500)"
    },
    sarvada: {
      icon: ganeshaIcon,
      speech: "One more divine word! 💪",
      title: "Great Work!",
      subtitle: "Now unlock eternal blessing!",
      description: "Learn to chant SARVADA to unlock eternal blessing power and save animals!",
      buttonText: "Start Learning!",
      buttonColor: "linear-gradient(135deg, #9C27B0, #E91E63)"
    }
  };

  // ============================================
  // 🔄 COMPLETE RELOAD LOGIC (Final 7-Point Version)
  // ============================================
  useEffect(() => {
    if (!isReload || reloadHandledRef.current || !sceneState.welcomeShown) {
      return;
    }

    console.log('🔄 RELOAD DETECTED - Phase:', sceneState.phase);
    reloadHandledRef.current = true;

    // --------------------------------------------
    // 1. DISCOVERY PHASES
    // --------------------------------------------
    if (sceneState.phase === SCENE_PHASES.SARVAKARYESHU_LEARNING) {
      sceneActions.updateState({
        learnedWords: { ...sceneState.learnedWords, sarvakaryeshu: { learned: true, scene: 4 } }
      });
      setTimeout(() => setShowDiscoveryFlip1(true), 500);
      return;
    }

    // --------------------------------------------
    // ✅ ADD THIS: Discovery 2 (Sarvada)
    // --------------------------------------------
    if (sceneState.phase === SCENE_PHASES.SARVADA_LEARNING) {
      console.log('📌 Reload: Sarvada Discovery');

      // 1. Force clear everything
      sceneActions.updateState({
        showHelperAnimation: false, // Kill animation
        selectedHelper: null,
        symbolsVisible: 'none',
        ganeshaGuidanceMessage: null,

        learnedWords: {
          ...sceneState.learnedWords,
          sarvada: { learned: true, scene: 4 }
        }
      });

      // 2. Ensure NO fireworks are showing
      setShowSparkle(null);

      // 3. Show only the card
      setTimeout(() => setShowDiscoveryFlip2(true), 500);
      return;
    }


    // --------------------------------------------
    // 2. DOOR 1 & CHARACTER SELECT
    // --------------------------------------------
    if (sceneState.phase === SCENE_PHASES.DOOR1_ACTIVE) {
      const placed = sceneState.door1SyllablesPlaced?.length || 0;
      if (placed < 4) {
        setResumeMessage(`Spell Sarvakaryeshu! ${placed}/4 syllables placed.`);
        setShowResumePopup(true);
        if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
      }
      return;
    }

    if (sceneState.phase === SCENE_PHASES.DOOR1_COMPLETE || sceneState.phase === SCENE_PHASES.CHARACTER_SELECT) {
      sceneActions.updateState({ phase: SCENE_PHASES.CHARACTER_SELECT, door1Completed: true });
      return;
    }

    // --------------------------------------------
    // 3. GAME 1 (SCENARIO CHOOSING)
    // --------------------------------------------
    if (sceneState.phase === SCENE_PHASES.GAME1_INTRO ||
      sceneState.phase === SCENE_PHASES.SCENARIO_CHOOSING ||
      sceneState.phase === SCENE_PHASES.SCENARIO_SUCCESS) {

      const completed = sceneState.scenariosCompleted || 0;
      if (completed >= 3) {
        completeGame1();
        return;
      }

      sceneActions.updateState({
        phase: SCENE_PHASES.SCENARIO_CHOOSING,
        symbolsVisible: 'clear',
        symbolsClickable: true,
        characterMessage: null,
        showProblemDeclaration: false,
        selectedSymbol: null,
        ganeshaGuidanceMessage: null // Clear overlay
      });

      setResumeMessage(`Make wise choices! ${completed}/3 scenarios completed.`);
      setShowResumePopup(true);
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
      resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
      return;
    }

    // --------------------------------------------
    // 4. GAME 2 INTRO (⚠️ YELLOW MESSAGE FIX)
    // --------------------------------------------
    if ((sceneState.phase === SCENE_PHASES.DOOR2_ACTIVE && sceneState.door2Completed) ||
      sceneState.phase === SCENE_PHASES.DOOR2_COMPLETE ||
      sceneState.phase === SCENE_PHASES.GAME2_INTRO) {

      console.log('📌 Reload: Unfreezing Game 2 Message');

      sceneActions.updateState({
        ganeshaGuidanceMessage: null, // 🛡️ Force remove "Now help others..."
        currentGame: 2,
        phase: SCENE_PHASES.HELPER_CHOOSING,
        game2Scenarios: sceneState.game2Scenarios?.length ? sceneState.game2Scenarios : generateRandomGame2Scenarios(),
        currentGame2Scenario: 0,
        symbolsVisible: 'clear',
        showProblemDeclaration: false
      });
      return;
    }

    // --------------------------------------------
    // 5. DOOR 2 ACTIVE (Normal)
    // --------------------------------------------
    if (sceneState.phase === SCENE_PHASES.DOOR2_ACTIVE) {
      const placed = sceneState.door2SyllablesPlaced?.length || 0;
      setResumeMessage(`Spell Sarvada! ${placed}/3 syllables placed.`);
      setShowResumePopup(true);
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
      resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
      return;
    }

    // --------------------------------------------
    // 6. GAME 2 (HELPER CHOOSING)
    // --------------------------------------------
    if (sceneState.phase === SCENE_PHASES.HELPER_CHOOSING ||
      sceneState.phase === SCENE_PHASES.HELPER_SUCCESS) {

      const completed = sceneState.game2ScenariosCompleted || 0;

      // ✅ COMPLETION CHECK
      if (completed >= 3) {
        console.log('📌 Game 2 finished on reload');
        // 🛡️ CRITICAL: Kill animation before calling complete
        sceneActions.updateState({ showHelperAnimation: false });
        completeGame2();
        return;
      }

      console.log('📌 Reload: Resuming Game 2');
      game2HelperSelectedRef.current = false;
      game2ProcessingHelperRef.current = null;

      sceneActions.updateState({
        phase: SCENE_PHASES.HELPER_CHOOSING,
        symbolsVisible: 'clear',
        selectedHelper: null,
        showHelperAnimation: false, // 🛡️ Ensure no ghost animation
        characterMessage: null,
        showProblemDeclaration: false,
        ganeshaGuidanceMessage: null
      });

      setResumeMessage(`Help others! ${completed}/3 helpers sent.`);
      setShowResumePopup(true);
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
      resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
      return;
    }


    // --------------------------------------------
    // 7. ALREADY COMPLETE (Post-Fireworks)
    // --------------------------------------------
    if (sceneState.phase === SCENE_PHASES.COMPLETE) {
      console.log('📌 Reload: Scene Already Complete');

      sceneActions.updateState({
        ganeshaGuidanceMessage: null,
        showHelperAnimation: false,
        symbolsVisible: 'none'
      });

      // If scene is done, just show the journal/end screen
      // Do NOT trigger fireworks here on reload
      setTimeout(() => setShowSceneCompletion(true), 500);
      return;
    }

  }, [isReload, sceneState.phase, sceneState.welcomeShown]);

  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // ── SymbolAutoReveal helpers ──────────────────────────────────────────────
  const getSidebarTarget = (symbolId) => {
    const el = document.getElementById(`sidebar-${symbolId}`);
    if (!el) return { x: 220, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: (r.left + r.width / 2) - (window.innerWidth / 2), y: (r.top + r.height / 2) - (window.innerHeight / 2) };
  };

  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);
    if (symbolId === 'sarvakaryeshu') {
      safeSetTimeout(() => {
        sceneActions.updateState({
          phase: SCENE_PHASES.DOOR2_ACTIVE,
          learnedWords: { ...sceneState.learnedWords, sarvakaryeshu: { learned: true, scene: 4 } }
        });
      }, 950);
    } else if (symbolId === 'sarvada') {
      safeSetTimeout(() => {
        sceneActions.updateState({
          phase: SCENE_PHASES.COMPLETE,
          completed: true,
          learnedWords: { sarvakaryeshu: { learned: true, scene: 4 }, sarvada: { learned: true, scene: 4 } }
        });
        setShowSparkle('final-fireworks');
      }, 950);
    }
  };

  const playAudio = (audioPath, volume = 1.0) => {
    try {
      const audio = new Audio(audioPath);
      audio.volume = volume;
      audio.play().catch(() => { });
    } catch (error) {
      console.warn('Audio failed:', error);
    }
  };

  const playSyllable = (syllable) => {
    const map = {
      // Door 1: Sarvakaryeshu syllables (4 syllables)
      'sar': 'sarvakaryeshu-sar',
      'va': 'sarvakaryeshu-va',
      'kar': 'sarvakaryeshu-kar',
      'yeshu': 'sarvakaryeshu-yeshu',
      // Door 2: Sarvada syllables
      'sar2': 'sarvada-sar',
      'va2': 'sarvada-va',
      'da': 'sarvada-da'
    };
    playAudio(`/audio/syllables/${map[syllable] || syllable}.mp3`);
  };


  const generateRandomScenarios = () => {
    const keys = Object.keys(SCENARIOS);
    return [...keys].sort(() => 0.5 - Math.random()).slice(0, 3);
  };

  const generateRandomGame2Scenarios = () => {
    const keys = Object.keys(GAME2_SCENARIOS);
    return [...keys].sort(() => 0.5 - Math.random()).slice(0, 3);
  };

  const getCurrentScenario = () => {
    if (!sceneState.selectedScenarios || sceneState.currentScenario >= sceneState.selectedScenarios.length) {
      return SCENARIOS.homework;
    }
    const key = sceneState.selectedScenarios[sceneState.currentScenario];
    return SCENARIOS[key] || SCENARIOS.homework;
  };

  const getCurrentGame2Scenario = () => {
    if (!sceneState.game2Scenarios || sceneState.currentGame2Scenario >= sceneState.game2Scenarios.length) {
      return GAME2_SCENARIOS.grandparents;
    }
    const key = sceneState.game2Scenarios[sceneState.currentGame2Scenario];
    return GAME2_SCENARIOS[key] || GAME2_SCENARIOS.grandparents;
  };

  const getCurrentHelperPosition = (helperId) => {
    const scenario = getCurrentGame2Scenario();
    const helperIndex = scenario.helpers.findIndex(h => h.id === helperId);

    const positions = [
      { x: 18, y: 25 },   // position-1
      { x: 8, y: 75 },   // position-2
      { x: 92, y: 25 },  // position-3
      { x: 92, y: 75 }   // position-4
    ];

    return positions[helperIndex] || positions[0];
  };

  const getCurrentScenarioImage = () => {
    if (sceneState.currentGame === 2) {
      const scenario = getCurrentGame2Scenario();
      return scenario.backgrounds[sceneState.game2Background || 'before'];
    } else {
      const scenario = getCurrentScenario();
      const char = sceneState.selectedCharacter || 'boy';
      const bg = sceneState.currentBackground || 'worried';
      return scenario.backgrounds[bg][char];
    }
  };

  // Door 1
  const handleDoor1SyllablePlaced = (syllable) => {
    if (showResumePopup) {
      setShowResumePopup(false);
      if (resumePopupTimeoutRef.current) {
        clearTimeout(resumePopupTimeoutRef.current);
      }
    }

    const expected = sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0];
    if (syllable === expected) {
      const newStep = (sceneState.door1CurrentStep || 0) + 1;
      sceneActions.updateState({
        door1SyllablesPlaced: [...(sceneState.door1SyllablesPlaced || []), syllable],
        door1CurrentStep: newStep
      });
      if (newStep >= 4) {
        // ❌ REMOVED: Don't auto-trigger door completion
        // The DoorComponent will call onDoorComplete when button is clicked
        console.log('✅ All syllables placed - waiting for Start Challenge button');
      }
    }
  };

  const handleDoor1Complete = () => {
    setShowSparkle('door1-completing');
    sceneActions.updateState({
      door1Completed: true,
      phase: SCENE_PHASES.CHARACTER_SELECT,
      stars: 2
    });
    setTimeout(() => setShowSparkle(null), 3000);
  };

  // After character selection, show Ganesha message
  const handleCharacterSelect = (character) => {
    resetIdle();
    setShowSparkle('character-selected');
    sceneActions.updateState({
      selectedCharacter: character,
      phase: SCENE_PHASES.GAME1_INTRO,
      selectedScenarios: generateRandomScenarios(),
      currentScenario: 0,
      stars: 3
    });

    setTimeout(() => {
      setShowSparkle(null);
      // ✅ Show Ganesha's guidance message
      sceneActions.updateState({
        ganeshaGuidanceMessage: "I will guide you to make wise choices! 🕉️"
      });

      setTimeout(() => {
        sceneActions.updateState({ ganeshaGuidanceMessage: null });
        startScenario(0);
      }, 3000);
    }, 2000);
  };


  const startScenario = (index) => {
    setBannerMessage('initial');  // ← ADD THIS

    setTimeout(() => {
      setBannerMessage('ready');  // ← THEN CHANGE TO READY
    }, 2000);

    // ✅ ADD THESE 3 LINES
    isProcessingClickRef.current = false;
    lastClickTimeRef.current = 0;

    sceneActions.updateState({
      currentScenario: index,
      phase: SCENE_PHASES.SCENARIO_CHOOSING,
      showProblemDeclaration: true,
      symbolsVisible: 'none', // Start hidden
      symbolsClickable: false,
      selectedSymbol: null,  // ← ADD THIS LINE if missing

      currentBackground: 'worried',
      characterMessage: null,
      unwiseChoicesTried: [] // ← Reset tried symbols
    });

    // ✅ After 3 seconds: Hide problem, show symbols
    setTimeout(() => {
      sceneActions.updateState({
        showProblemDeclaration: false,
        symbolsVisible: 'clear', // Show symbols
        symbolsClickable: true,   // Enable clicking
        selectedSymbol: null  // ← ADD THIS LINE

      });
    }, 3000);
  };

  const handleSymbolClick = (symbolId, isWise) => {
    resetIdle();
    if (showResumePopup) {
      setShowResumePopup(false);
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
    }
    console.log('🎯 Click attempt:', symbolId);

    const now = Date.now();

    // ========== 🛡️ PROTECTION LAYER 1: SAME SYMBOL DOUBLE-CLICK ==========
    if (currentlyProcessingSymbolRef.current === symbolId) {
      console.log('🚫 BLOCKED: Already processing this exact symbol:', symbolId);
      return;
    }

    // ========== 🛡️ PROTECTION LAYER 2: GLOBAL COOLDOWN ==========
    if (now - lastClickTimeRef.current < CLICK_COOLDOWN) {
      console.log('🚫 BLOCKED: Click too fast! Wait', CLICK_COOLDOWN, 'ms between clicks');
      return;
    }

    // ========== 🛡️ PROTECTION LAYER 3: GLOBAL PROCESSING LOCK ==========
    if (isProcessingClickRef.current) {
      console.log('🚫 BLOCKED: Already processing another click!');
      return;
    }

    // ========== 🛡️ PROTECTION LAYER 4: ALREADY TRIED CHECK ==========
    const alreadyTried = (sceneState.unwiseChoicesTried || []).includes(symbolId);
    if (alreadyTried) {
      console.log('🚫 BLOCKED: Symbol already tried:', symbolId);
      return;
    }

    // ========== 🛡️ PROTECTION LAYER 5: CLICKABLE STATE ==========
    if (!sceneState.symbolsClickable) {
      console.log('🚫 BLOCKED: Symbols not clickable yet!');
      return;
    }

    // ========== ✅ ALL CHECKS PASSED - PROCESS CLICK ==========
    console.log('✅ Click APPROVED:', symbolId, 'Wise:', isWise);

    // 🔒 LOCK EVERYTHING IMMEDIATELY
    lastClickTimeRef.current = now;
    isProcessingClickRef.current = true;
    currentlyProcessingSymbolRef.current = symbolId;  // ← NEW: Lock this specific symbol

    // Immediate state update to lock UI
    sceneActions.updateState({
      selectedSymbol: symbolId,
      symbolsClickable: false
    });

    const scenario = getCurrentScenario();
    const reaction = scenario.characterReactions[symbolId];

    // Show sparkles based on choice
    setShowSparkle(isWise ? 'wise-choice' : 'unwise-choice');

    if (isWise) {
      // ========== ✅ CORRECT CHOICE ==========
      console.log('🎉 Correct choice!');

      setBannerMessage('success');

      sceneActions.updateState({
        currentBackground: 'success',
        characterMessage: reaction,
        symbolsClickable: false,
        selectedSymbol: symbolId
      });

      // Celebrate for 2.5 seconds, then complete
      setTimeout(() => {
        setShowSparkle(null);
        completeCurrentScenario();

        // ✅ UNLOCK after scenario complete
        isProcessingClickRef.current = false;
        currentlyProcessingSymbolRef.current = null;  // ← Clear symbol lock
      }, 2500);

    } else {
      // ========== ❌ WRONG CHOICE ==========
      console.log('❌ Wrong choice - showing feedback');

      const newUnwiseTried = [...(sceneState.unwiseChoicesTried || []), symbolId];

      // Stage 1: Immediate feedback
      setBannerMessage('processing');

      sceneActions.updateState({
        unwiseChoicesTried: newUnwiseTried,
        characterMessage: reaction,
        symbolsClickable: false
      });

      // Stage 2: After 800ms - unlock for retry
      setTimeout(() => {
        setBannerMessage('try-again');
        sceneActions.updateState({
          characterMessage: null,
          symbolsClickable: true
        });
        setShowSparkle(null);

        // ✅ UNLOCK after feedback shown
        isProcessingClickRef.current = false;
        currentlyProcessingSymbolRef.current = null;  // ← Clear symbol lock
      }, 800);

      // Stage 3: Reset banner after 3 seconds
      setTimeout(() => {
        setBannerMessage('ready');
      }, 3000);
    }
  };

  const completeCurrentScenario = () => {
    const nextScenario = (sceneState.currentScenario || 0) + 1;
    const completed = (sceneState.scenariosCompleted || 0) + 1;

    sceneActions.updateState({
      scenariosCompleted: completed,
      characterMessage: null // Clear message
    });

    if (completed >= 3) {
      setTimeout(() => {
        // ✅ Hide game before celebration
        sceneActions.updateState({
          symbolsVisible: 'none',
          phase: SCENE_PHASES.SARVAKARYESHU_LEARNING
        });
        completeGame1();
      }, 1000);
    } else {
      setTimeout(() => {
        startScenario(nextScenario);
      }, 1000);
    }
  };

  const completeGame1 = () => {
    console.log('⭐ Game 1 completed!');

    sceneActions.updateState({
      game1Completed: true,
      phase: SCENE_PHASES.SARVAKARYESHU_LEARNING, // ✅ Set phase
      symbolsVisible: 'none'
    });

    // ✅ Trigger Discovery 1
    safeSetTimeout(() => {
      setRevealConfig({ symbolId: 'sarvakaryeshu', symbolImage: sarvakaryeshuSymbol, symbolName: 'Sarvakaryeshu', affirmation: 'I can do things.', sidebarTarget: getSidebarTarget('sarvakaryeshu') });
    }, 1500);
  };

  // Door 2
  const handleDoor2SyllablePlaced = (syllable) => {
    if (showResumePopup) {
      setShowResumePopup(false);
      if (resumePopupTimeoutRef.current) {
        clearTimeout(resumePopupTimeoutRef.current);
      }
    }
    const expected = sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0];
    if (syllable === expected) {
      const newStep = (sceneState.door2CurrentStep || 0) + 1;
      sceneActions.updateState({
        door2SyllablesPlaced: [...(sceneState.door2SyllablesPlaced || []), syllable],
        door2CurrentStep: newStep
      });
      if (newStep >= 3) {
        // ❌ REMOVED: Don't auto-trigger door completion
        // The DoorComponent will call onDoorComplete when button is clicked
        console.log('✅ All syllables placed - waiting for Start Challenge button');
      }
    }
  };

  // After Door 2 complete, before Game 2
  const handleDoor2Complete = () => {
    setShowSparkle('door2-completing');
    sceneActions.updateState({
      door2Completed: true,
      stars: 7
    });

    safeSetTimeout(() => {
      setShowSparkle(null);
      // ✅ Show Ganesha's guidance for helping others
      sceneActions.updateState({
        ganeshaGuidanceMessage: "Now help others as I helped you! 🌟"
      });

      safeSetTimeout(() => {
        sceneActions.updateState({ ganeshaGuidanceMessage: null });
        startGame2();
      }, 3000);
    }, 1000);
  };

  // Game 2
  const startGame2 = () => {
    sceneActions.updateState({
      currentGame: 2,
      phase: SCENE_PHASES.GAME2_INTRO,
      game2Scenarios: generateRandomGame2Scenarios(),
      currentGame2Scenario: 0
    });

    safeSetTimeout(() => startGame2Scenario(0), 2000);
  };

  const startGame2Scenario = (index) => {
    // ✅ Reset locks for new scenario
    game2HelperSelectedRef.current = false;
    game2ProcessingHelperRef.current = null;

    sceneActions.updateState({
      currentGame2Scenario: index,
      phase: SCENE_PHASES.HELPER_CHOOSING,
      showProblemDeclaration: true,
      symbolsVisible: 'none',  // Start hidden
      game2Background: 'before',
      characterMessage: null,
      selectedHelper: null
    });

    // Show helpers after 2 seconds (time to read problem)
    setTimeout(() => {
      sceneActions.updateState({
        symbolsVisible: 'clear',
        showProblemDeclaration: false
      });
    }, 2000);
  };

  const handleHelperClick = (helperId) => {
    resetIdle();
    if (showResumePopup) {
      setShowResumePopup(false);
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
    }
    console.log('🎯 Game 2: Helper click attempt:', helperId);

    // ========== 🛡️ PROTECTION LAYER 1: ALREADY SELECTED CHECK ==========
    if (game2HelperSelectedRef.current) {
      console.log('🚫 GAME2 BLOCKED: Helper already chosen!');
      return;
    }

    // ========== 🛡️ PROTECTION LAYER 2: PROCESSING CHECK ==========
    if (game2ProcessingHelperRef.current) {
      console.log('🚫 GAME2 BLOCKED: Already processing helper:', game2ProcessingHelperRef.current);
      return;
    }

    // ========== 🛡️ PROTECTION LAYER 3: CLICKABLE STATE ==========
    if (sceneState.symbolsVisible !== 'clear') {
      console.log('🚫 GAME2 BLOCKED: Helpers not visible yet!');
      return;
    }

    // ========== ✅ ALL CHECKS PASSED ==========
    console.log('✅ GAME2 Click APPROVED:', helperId);

    // 🔒 INSTANT LOCK - No second chances in Game 2!
    game2HelperSelectedRef.current = true;
    game2ProcessingHelperRef.current = helperId;

    // Mark selection - this triggers fade of non-selected helpers
    sceneActions.updateState({
      selectedHelper: helperId,
      // Keep symbolsVisible: 'clear' so selected helper stays visible
    });

    // Show sparkles for celebration
    setShowSparkle('helper-selected');

    // Wait 800ms for non-selected to fade, THEN start animation
    safeSetTimeout(() => {
      sceneActions.updateState({
        showHelperAnimation: true
        // DON'T set symbolsVisible: 'none' here!
      });
    }, 800);
  };

  const handleHelperAnimationComplete = () => {
    setShowSparkle(null);

    const scenario = getCurrentGame2Scenario();

    // Show gratitude
    sceneActions.updateState({
      game2Background: 'after',
      characterMessage: scenario.gratitude
    });

    safeSetTimeout(() => {
      completeGame2Scenario();

      // ✅ Keep locks until next scenario starts
      // (they'll be reset in startGame2Scenario)
    }, 2500);
  };

  const completeGame2Scenario = () => {
    const nextScenario = (sceneState.currentGame2Scenario || 0) + 1;
    const completed = (sceneState.game2ScenariosCompleted || 0) + 1;

    sceneActions.updateState({
      game2ScenariosCompleted: completed
    });

    if (completed >= 3) {
      safeSetTimeout(() => completeGame2(), 3000);
    } else {
      safeSetTimeout(() => {
        setShowSparkle(null);
        startGame2Scenario(nextScenario);
      }, 3000);
    }
  };

  const completeGame2 = () => {
    console.log('⭐ Game 2 completed!');

    sceneActions.updateState({
      game2Completed: true,
      phase: SCENE_PHASES.SARVADA_LEARNING,  // ✅ CHANGE from COMPLETE
      symbolsVisible: 'none',
      characterMessage: null,
      showProblemDeclaration: false
    });

    // ✅ Trigger Discovery 2
    safeSetTimeout(() => {
      setRevealConfig({ symbolId: 'sarvada', symbolImage: sarvadaSymbol, symbolName: 'Sarvada', affirmation: 'I help always.', sidebarTarget: getSidebarTarget('sarvada') });
    }, 1500);
  };

  // Power Modal Actions
  const handleSaveAnimal = () => {
    setShowPowerModal(false);
    setCurrentRescueWord(currentMissionSymbol);
    setShowRescueModal(true);
  };

  // After Game 1 celebration, show modal 2
  const handleContinueLearning = () => {
    setShowPowerModal(false);

    if (currentMissionSymbol === 'sarvakaryeshu') {
      // Show second story modal before Door 2
      setShowStoryModal('sarvada');
    } else if (currentMissionSymbol === 'sarvada') {
      safeSetTimeout(() => showFinalCelebration(), 500);
    }
  };

  const getNextDiscoveryText = (symbol) => {
    return symbol === 'sarvakaryeshu' ? '🚪 Discover Sarvada' : '✨ Complete Scene';
  };

  const handleRescueComplete = (success) => {
    if (!success) return;

    setShowRescueModal(false);

    if (currentRescueWord === 'sarvakaryeshu') {
      safeSetTimeout(() => {
        setShowStoryModal('sarvada');  // ✅ Show second story modal
      }, 500);
    } else if (currentRescueWord === 'sarvada') {
      safeSetTimeout(() => {
        showFinalCelebration();
      }, 500);
    }

    setCurrentRescueWord(null);
  };

  const showFinalCelebration = () => {
    sceneActions.updateState({
      showingCompletionScreen: true,
      phase: SCENE_PHASES.COMPLETE,
      stars: 8,
      completed: true
    });

    setShowSparkle('final-fireworks');
  };

  const hideActiveHints = () => {
    if (progressiveHintRef.current?.hideHint) {
      progressiveHintRef.current.hideHint();
    }
  };

  /*useEffect(() => {
  if (sceneState.phase === SCENE_PHASES.STORY_INTRO) {
    setShowStoryModal('sarvakaryeshu');
  }
}, [sceneState.phase]);*/


  useEffect(() => {
    return () => {
      isProcessingClickRef.current = false;     // ← ADD THIS
      lastClickTimeRef.current = 0;              // ← ADD THIS
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    console.log('🔒 Protection State:', {
      isProcessing: isProcessingClickRef.current,
      currentSymbol: currentlyProcessingSymbolRef.current,
      symbolsClickable: sceneState.symbolsClickable,
      unwiseTried: sceneState.unwiseChoicesTried
    });
  }, [sceneState.symbolsClickable, sceneState.unwiseChoicesTried]);

  if (!sceneState) return <div>Loading...</div>;

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="scene-container" data-phase={sceneState.phase}>
          <HomeButton onNavigate={onNavigate} />
          <ZoneBadgeButton zoneId="cave-of-secrets" onBack={() => onNavigate?.('zone-welcome')} />
          <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />
          <div className="scene-background" style={{ backgroundImage: `url(${sceneBackground})` }}>

            {/* ✅ OPENING SCREEN: Sarvakaryeshu Sarvada */}
            <OpeningModal
              zoneId={zoneId}
              sceneId={sceneId}
              onStart={() => sceneActions.updateState({ welcomeShown: true })}
              characterImg={ganeshaCharacterCave}
              showButton={true}
            />

            {/* Story Modal 
{showStoryModal && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200
  }}>
        <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 199,
        pointerEvents: 'all'
      }}
      onClick={(e) => {
        e.stopPropagation();
        console.log('🛡️ Click blocked by story modal shield');
      }}
    />
    <div style={{
      background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D4B8 100%)', // ← Warm beige
      borderRadius: '25px', // ← Slightly smaller radius
      padding: '35px 40px', // ← Reduced padding
      maxWidth: '500px', // ← Smaller width (was 600px)
      textAlign: 'center',
      boxShadow: '0 10px 50px rgba(0,0,0,0.5)',
      border: '4px solid #8B4513', // ← Brown border for cave feel
      animation: 'modalAppear 0.5s ease-out',
       position: 'relative',  // ✅ ADD THIS
      zIndex: 201  // ✅ ADD THIS
    }}>
      {/* Ganesha Icon 
      <img 
        src={STORY_MODALS[showStoryModal].icon}
        alt="Ganesha"
        style={{
          width: '80px', // ← Smaller (was 100px)
          height: '80px',
          marginBottom: '2px',
          filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))'
        }}
      />
      
      {/* Speech Bubble 
      <div style={{
        background: '#FFF8DC', // ← Cream color
        border: '3px solid #FFD700',
        borderRadius: '18px',
        padding: '12px 20px', // ← Smaller padding
        marginBottom: '20px',
        fontSize: '16px', // ← Smaller font (was 18px)
        color: '#8B4513',
        fontWeight: 'bold'
      }}>
        {STORY_MODALS[showStoryModal].speech}
      </div>
      
      {/* Title 
      <h1 style={{
        color: '#8B4513', // ← Brown instead of gold
        fontSize: '28px', // ← Smaller (was 32px)
        margin: '15px 0', // ← Tighter spacing
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
      }}>
        {STORY_MODALS[showStoryModal].title}
      </h1>
      
      {/* Subtitle 
      <h2 style={{
        color: '#D2691E', // ← Chocolate brown
        fontSize: '20px', // ← Smaller (was 24px)
        margin: '12px 0'
      }}>
        {STORY_MODALS[showStoryModal].subtitle}
      </h2>
      
      {/* Description 
      <p style={{
        color: '#5D4E37', // ← Dark brown text
        fontSize: '16px', // ← Smaller (was 18px)
        lineHeight: '1.5',
        margin: '15px 0 30px 0' // ← Tighter spacing
      }}>
        {STORY_MODALS[showStoryModal].description}
      </p>
      
      {/* Start Button 
      <button
        onClick={() => {
          setShowStoryModal(null);
          if (showStoryModal === 'sarvakaryeshu') {
            sceneActions.updateState({ phase: SCENE_PHASES.DOOR1_ACTIVE });
          } else {
            sceneActions.updateState({ phase: SCENE_PHASES.DOOR2_ACTIVE });
          }
        }}
        style={{
          background: STORY_MODALS[showStoryModal].buttonColor,
          color: 'white',
          border: 'none',
          padding: '15px 40px', // ← Smaller padding (was 20px 50px)
          borderRadius: '25px',
          fontSize: '18px', // ← Smaller font (was 20px)
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        {STORY_MODALS[showStoryModal].buttonText}
      </button>
    </div>
  </div>
)}

            {/* Phase Headers */}
            {!showPowerModal && !showRescueModal && !showCenteredSymbol && (
              <>
                {sceneState.phase === SCENE_PHASES.DOOR1_ACTIVE && !sceneState.door1Completed && (
                  <div className="phase-header">
                    🔤 SPELL SARVAKARYESHU! Click syllables in order!
                  </div>
                )}


                {(sceneState.symbolsVisible === 'clear' || sceneState.symbolsVisible === 'all') &&
                  sceneState.currentGame === 1 &&
                  sceneState.phase === SCENE_PHASES.SCENARIO_CHOOSING && (
                    <div style={{
                      position: 'absolute',
                      bottom: '12%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      // Dynamic background based on stage
                      background: bannerMessage === 'processing'
                        ? 'linear-gradient(135deg, #FFA500, #FF8C42)'  // Orange during processing
                        : bannerMessage === 'try-again'
                          ? 'linear-gradient(135deg, #FF6B6B, #FF8E53)'  // Red when ready to retry
                          : sceneState.currentBackground === 'success'
                            ? 'linear-gradient(135deg, #4ECDC4, #44A08D)'  // Green for correct
                            : 'linear-gradient(135deg, #FFD700, #FFA500)',  // Gold for initial
                      padding: '15px 30px',
                      borderRadius: '20px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#2C1810',
                      zIndex: 1000,
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                      // Only bounce when clickable AND ready
                      animation: (sceneState.symbolsClickable && bannerMessage === 'ready')
                        ? 'bannerBounce 2s infinite'
                        : bannerMessage === 'try-again'
                          ? 'bannerPulse 0.8s ease-out'  // One-time pulse when unlocked
                          : 'none',
                      border: '3px solid #FF8C42',
                      textAlign: 'center',
                      maxWidth: '80%',
                      transition: 'all 0.4s ease',
                    }}>
                      {/* STAGED MESSAGES */}
                      {bannerMessage === 'initial' && '📖 Read the problem...'}
                      {bannerMessage === 'ready' && sceneState.symbolsClickable && '🎯 CLICK A SYMBOL to make your choice!'}
                      {bannerMessage === 'processing' && '🤔 Hmm, let me think...'}
                      {bannerMessage === 'try-again' && '💭 Try another symbol!'}
                      {sceneState.currentBackground === 'success' && '✨ Perfect choice!'}
                    </div>
                  )}

                {/* Keep the Door phase headers separate - they work fine */}
                {sceneState.phase === SCENE_PHASES.DOOR2_ACTIVE && !sceneState.door2Completed && (
                  <div className="phase-header">
                    🔤 SPELL SARVADA! Click syllables in order!
                  </div>
                )}

                {sceneState.currentGame === 2 &&
                  sceneState.phase === SCENE_PHASES.HELPER_CHOOSING &&
                  sceneState.symbolsVisible === 'clear' &&
                  !sceneState.selectedHelper && (
                    <div style={{
                      position: 'absolute',
                      bottom: '12%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                      padding: '15px 30px',
                      borderRadius: '20px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: 'white',
                      zIndex: 1000,
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                      animation: 'bannerBounce 2s infinite',
                      border: '3px solid #3AAFA9',
                      textAlign: 'center',
                      maxWidth: '80%'
                    }}>
                      💝 Choose a helper to send!
                    </div>
                  )}


              </>
            )}

            {/* Door 1 */}
            {sceneState.phase === SCENE_PHASES.DOOR1_ACTIVE && (
              <div className="door1-area" ref={primaryRef}>
                <DoorComponent
                  syllables={['Sar', 'va', 'kar', 'yeshu']}
                  completedWord="Sarvakaryeshu"
                  onDoorComplete={handleDoor1Complete}
                  onSyllablePlaced={handleDoor1SyllablePlaced}
                  onSyllableAudio={playSyllable}  // ← ADD THIS LINE

                  sceneTheme="cave-of-secrets"
                  doorImage={doorImage}
                  className="sarvakaryeshu-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door1CurrentStep || 0}
                  expectedSyllable={sceneState.door1Syllables?.[sceneState.door1CurrentStep || 0]}
                  isCompleted={sceneState.door1Completed}
                  placedSyllables={sceneState.door1SyllablesPlaced || []}
                />
              </div>
            )}

            <IdleHint isIdle={isIdle} targetRef={primaryRef} gesturePosition="above" />

            {/* Character Selection */}
            {sceneState.phase === SCENE_PHASES.CHARACTER_SELECT && (
              <div className="character-selection-clean">
                <h2>Choose Your Character</h2>
                <div className="character-options-cave">
                  <ClickableElement id="select-boy" onClick={() => handleCharacterSelect('boy')}>
                    <div className="character-option-clean">
                      <img src={boyPreview} alt="Boy" />
                      <span>Boy</span>
                    </div>
                  </ClickableElement>
                  <ClickableElement id="select-girl" onClick={() => handleCharacterSelect('girl')}>
                    <div className="character-option-clean">
                      <img src={girlPreview} alt="Girl" />
                      <span>Girl</span>
                    </div>
                  </ClickableElement>
                </div>
              </div>
            )}

            {/* Game 1 - Scenario Window */}
            {sceneState.currentGame === 1 && sceneState.phase === SCENE_PHASES.SCENARIO_CHOOSING && (
              <>
                <div className="scenario-window">
                  <img src={getCurrentScenarioImage()} alt="Scenario" />
                </div>

                {/* Problem Declaration - OUTSIDE window */}
                {sceneState.showProblemDeclaration && (
                  <div className="character-problem-speech">
                    <p>{getCurrentScenario().problemDeclaration}</p>
                  </div>
                )}

                {/* Character Reaction - OUTSIDE window */}
                {sceneState.characterMessage && (
                  <div className="character-speech-bubble">
                    <p>{sceneState.characterMessage}</p>
                  </div>
                )}

                {/* Game 1 Symbols */}
                {sceneState.symbolsVisible === 'clear' && (() => {
                  const scenario = getCurrentScenario();
                  const symbols = [
                    scenario.symbols.wise[0],
                    scenario.symbols.unwise[0],
                    scenario.symbols.wise[1],
                    scenario.symbols.unwise[1]
                  ];

                  return symbols.map((symbol, index) => {
                    const isWise = scenario.symbols.wise.includes(symbol);
                    const hasBeenTried = (sceneState.unwiseChoicesTried || []).includes(symbol.id);
                    const isCurrentlyProcessing = currentlyProcessingSymbolRef.current === symbol.id;  // ← NEW

                    return (
                      <div
                        key={symbol.id}
                        className={`cave-symbol-individual ${sceneState.symbolsVisible} position-${index + 1}`}
                        style={{
                          opacity: hasBeenTried ? 0.4
                            : isCurrentlyProcessing ? 0.7  // ← NEW: Dim while processing
                              : 1,
                          filter: hasBeenTried
                            ? 'grayscale(50%) brightness(0.7)'
                            : (bannerMessage === 'try-again' && !hasBeenTried && sceneState.symbolsClickable)
                              ? 'drop-shadow(0 0 15px #FFD700) brightness(1.2)'
                              : isCurrentlyProcessing  // ← NEW: Show processing state
                                ? 'blur(2px)'
                                : 'none',
                          pointerEvents: (hasBeenTried || isCurrentlyProcessing) ? 'none' : 'auto',  // ← Updated
                          transition: 'all 0.3s ease',
                          transform: hasBeenTried
                            ? 'scale(0.95)'
                            : (bannerMessage === 'try-again' && !hasBeenTried && sceneState.symbolsClickable)
                              ? 'scale(1.05)'
                              : isCurrentlyProcessing  // ← NEW: Pulse while processing
                                ? 'scale(1.1)'
                                : 'scale(1)',
                          animation: isCurrentlyProcessing ? 'processingPulse 0.5s ease-in-out' : 'none'  // ← NEW
                        }}
                      >
                        <ClickableElement
                          id={`symbol-${symbol.id}`}
                          onClick={() => handleSymbolClick(symbol.id, isWise)}
                          disabled={!sceneState.symbolsClickable || hasBeenTried || isCurrentlyProcessing}  // ← Updated
                        >
                          <div className={`cave-symbol-item ${hasBeenTried ? 'tried-symbol' : ''}`}>
                            <img src={symbol.image} alt={symbol.name} />
                            <span className="symbol-name-text">{symbol.name}</span>

                            {/* Show X for tried symbols */}
                            {hasBeenTried && (
                              <div style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                fontSize: '20px'
                              }}>❌</div>
                            )}


                          </div>
                        </ClickableElement>
                      </div>
                    );
                  });
                })()}
              </>
            )}

            {/* Door 2 */}
            {sceneState.phase === SCENE_PHASES.DOOR2_ACTIVE && (
              <div className="door2-area">
                <DoorComponent
                  syllables={['Sar', 'va', 'da']}
                  completedWord="Sarvada"
                  onDoorComplete={handleDoor2Complete}
                  onSyllablePlaced={handleDoor2SyllablePlaced}
                  onSyllableAudio={playSyllable}  // ← ADD THIS LINE

                  sceneTheme="cave-of-secrets"
                  doorImage={doorImage}
                  className="sarvada-door"
                  educationalMode={true}
                  showTargetWord={true}
                  currentStep={sceneState.door2CurrentStep || 0}
                  expectedSyllable={sceneState.door2Syllables?.[sceneState.door2CurrentStep || 0]}
                  isCompleted={sceneState.door2Completed}
                  placedSyllables={sceneState.door2SyllablesPlaced || []}
                />
              </div>
            )}

            {/* Game 2 - Hide during celebration */}
            {sceneState.currentGame === 2 &&
              sceneState.phase === SCENE_PHASES.HELPER_CHOOSING &&
              !showCenteredSymbol &&
              !showPowerModal && (
                <>
                  <div className="scenario-window game2-style">
                    <img src={getCurrentScenarioImage()} alt="Helper mission" />
                    {sceneState.showProblemDeclaration && (
                      <div className="person-problem-speech">
                        <p>{getCurrentGame2Scenario().problemDeclaration}</p>
                      </div>
                    )}
                    {sceneState.characterMessage && (
                      <div className="character-speech-bubble">
                        <p>{sceneState.characterMessage}</p>
                      </div>
                    )}
                  </div>
// Update helper rendering (around line 1496-1507) with selection visual:

                  {sceneState.symbolsVisible === 'clear' &&
                    getCurrentGame2Scenario().helpers.map((helper, index) => {
                      const isSelected = sceneState.selectedHelper === helper.id;
                      const isProcessing = game2ProcessingHelperRef.current === helper.id;

                      return (
                        <div
                          key={helper.id}
                          className={`helper-symbol position-${index + 1}`}
                          style={{
                            // Once ANY helper selected, hide all others instantly
                            opacity: sceneState.selectedHelper && !isSelected ? 0 : 1,
                            transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                            transition: 'all 0.3s ease',
                            pointerEvents: game2HelperSelectedRef.current ? 'none' : 'auto',  // Lock all after selection
                            filter: isSelected ? 'drop-shadow(0 0 20px #4ECDC4) brightness(1.3)' : 'none'
                          }}
                        >
                          <ClickableElement
                            id={`helper-${helper.id}`}
                            onClick={() => handleHelperClick(helper.id)}
                            disabled={game2HelperSelectedRef.current}  // Disable all after any selection
                          >
                            <div className="helper-symbol-item">
                              <img src={helper.image} alt={helper.name} />
                              <span>{helper.name}</span>

                              {/* Show instant selection indicator */}
                              {isSelected && (
                                <div style={{
                                  position: 'absolute',
                                  top: '-10px',
                                  right: '-10px',
                                  background: '#4ECDC4',
                                  borderRadius: '50%',
                                  width: '30px',
                                  height: '30px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '18px',
                                  animation: 'pop 0.3s ease-out',
                                  boxShadow: '0 4px 12px rgba(78, 205, 196, 0.6)'
                                }}>
                                  ✓
                                </div>
                              )}
                            </div>
                          </ClickableElement>
                        </div>
                      );
                    })
                  }
                </>
              )}

            {/* Helper Animation - STRICT CHECK ADDED */}
            {sceneState.showHelperAnimation &&
              sceneState.selectedHelper &&
              sceneState.phase !== SCENE_PHASES.COMPLETE && ( // 🛡️ BLOCKS GHOST ANIMATION
                <HelperSignatureAnimation
                  helperId={sceneState.selectedHelper}
                  fromPosition={{
                    x: getCurrentHelperPosition(sceneState.selectedHelper).x,
                    y: getCurrentHelperPosition(sceneState.selectedHelper).y
                  }}
                  toPosition={{ x: 50, y: 40 }}
                  onAnimationComplete={handleHelperAnimationComplete}
                  onAnimationStart={(id, name) => console.log(`🎭 ${name} started`)}
                />
              )}

            {/* Ganesha Guidance Message */}
            {sceneState.ganeshaGuidanceMessage && (
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 150
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  {/* ✅ ADD GANESHA IMAGE */}
                  <img
                    src={ganeshaIcon}
                    alt="Ganesha"
                    style={{
                      width: '100px',
                      height: '100px',
                      filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))',
                      animation: 'ganeshaGlow 2s ease-in-out infinite alternate'
                    }}
                  />

                  {/* Message Box */}
                  <div style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    padding: '30px 50px',
                    borderRadius: '25px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 0 40px rgba(255, 215, 0, 0.8)',
                    animation: 'fadeInScale 0.5s ease-out'
                  }}>
                    {sceneState.ganeshaGuidanceMessage}
                  </div>
                </div>
              </div>
            )}

            {/* Centered Symbol Celebration 
      {showCenteredSymbol && (
  <>
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(3px)',
      zIndex: 199,
      animation: 'fadeIn 0.3s ease-out',
      pointerEvents: 'all'  // ✅ ADD THIS - blocks all clicks!
    }} 
    onClick={(e) => {
      e.stopPropagation();
      console.log('🛡️ Click blocked during symbol celebration');
    }}
    />
                
                <div style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 200,
                  textAlign: 'center'
                }}>
                  <img 
                    src={powerConfig[showCenteredSymbol]?.image}
                    alt={showCenteredSymbol}
                    style={{
                      width: '180px',
                      height: '180px',
                      filter: `drop-shadow(0 0 40px ${powerConfig[showCenteredSymbol]?.color})`,
                      animation: 'symbolGlow 2s ease-in-out infinite alternate',
                      marginBottom: '25px'
                    }}
                  />
                  
                  <div style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: `3px 3px 6px ${powerConfig[showCenteredSymbol]?.color}`
                  }}>
                    {powerConfig[showCenteredSymbol]?.name}
                  </div>
                </div>
              </>
            )}

            {/* Power Modal 
            {showPowerModal && (
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 500
              }}>
                    {/* Blocker 
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 499,
        pointerEvents: 'all'
      }}
      onClick={(e) => e.stopPropagation()}
    />
                <div style={{
                  background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                  borderRadius: '25px',
                  padding: '40px',
                  maxWidth: '500px',
                  textAlign: 'center',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                   position: 'relative',  // ✅ ADD THIS
      zIndex: 501  // ✅ ADD THIS
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1565C0', marginBottom: '25px' }}>
                    {powerConfig[currentMissionSymbol]?.name} Unlocked!
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: '16px', color: '#666', marginBottom: '15px' }}>
                        You can now use this power to help animals!
                      </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                      <img 
                        src={powerConfig[currentMissionSymbol]?.image}
                        alt="power"
                        style={{ width: '100px', height: '100px', marginBottom: '10px' }}
                      />

                      {/* ⭐ NEW: Play Again button 
<button 
  onClick={() => {
    console.log(`🔄 Play Again: Restarting ${currentMissionSymbol} game`);
    setShowPowerModal(false);
    setShowSparkle(null);
    setShowCenteredSymbol(null);
    setCurrentMissionSymbol(null);
    
    // Reset to the appropriate phase and game for the current symbol
    if (currentMissionSymbol === 'sarvakaryeshu') {
      // Reset Game 1 - Back to CHARACTER SELECT
      sceneActions.updateState({ 
        phase: SCENE_PHASES.CHARACTER_SELECT,
        selectedCharacter: null,
        currentGame: 1,
        selectedScenarios: [],
        currentScenario: 0,
        scenariosCompleted: 0,
        game1Completed: false,
        currentBackground: 'worried',
        symbolsVisible: 'none',
        symbolsClickable: false,
        ganeshaGuidanceMessage: null,
        unwiseChoicesTried: [],
        showProblemDeclaration: false,
        characterMessage: null,
        learnedWords: {
          ...sceneState.learnedWords,
          sarvakaryeshu: { learned: false, scene: 4 }
        },
        discoveredSymbols: {
          ...sceneState.discoveredSymbols,
          sarvakaryeshu: false
        },
        stars: 0
      });
      
    } else if (currentMissionSymbol === 'sarvada') {
      // Reset Game 2 - Trigger Ganesha's message and Game 2 start
      sceneActions.updateState({ 
        phase: SCENE_PHASES.DOOR2_COMPLETE,
        door2Completed: true,
        currentGame: 2,
        game2Scenarios: [],
        currentGame2Scenario: 0,
        game2ScenariosCompleted: 0,
        game2Completed: false,
        game2Background: 'before',
        selectedHelper: null,
        showHelperAnimation: false,
        symbolsVisible: 'none',
        symbolsClickable: false,
        showProblemDeclaration: false,
        characterMessage: null,
        ganeshaGuidanceMessage: null,
        learnedWords: {
          ...sceneState.learnedWords,
          sarvada: { learned: false, scene: 4 }
        },
        discoveredSymbols: {
          ...sceneState.discoveredSymbols,
          sarvada: false
        },
        stars: 6
      });
      
      // Manually trigger the Ganesha message and Game 2 start sequence
      setTimeout(() => {
        sceneActions.updateState({
          ganeshaGuidanceMessage: "Now help others as I helped you! 🌟"
        });
        
        setTimeout(() => {
          sceneActions.updateState({ ganeshaGuidanceMessage: null });
          startGame2();
        }, 3000);
      }, 500);
    }
  }}
  style={{
    background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(156,39,176,0.4)',
    width: '100%',
    transition: 'transform 0.2s ease',
    marginBottom: '10px'
  }}
  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
>
  🔄 Play Again
</button>
                      
                      <button 
                        onClick={handleSaveAnimal}
                        style={{
                          background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 25px',
                          borderRadius: '25px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        🐾 Save an Animal
                      </button>
                      
                      <button 
                        onClick={handleContinueLearning}
                        style={{
                          background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 25px',
                          borderRadius: '25px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        {getNextDiscoveryText(currentMissionSymbol)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rescue Modal */}
            <RescueModal
              key={currentRescueWord} // ✅ ADD THIS LINE - Forces remount for each word

              show={showRescueModal}
              wordData={currentRescueWord ? RESCUE_CONFIGS[currentRescueWord] : null}
              onComplete={handleRescueComplete}
              profileName={profileName}
            />

            {/* Symbol Sidebar */}
            {!sceneState.showingCompletionScreen && !showSceneCompletion && (
              <div style={{ filter: 'none' }}>
                <SymbolSidebar
                  unlockedSymbols={{
                    vakratunda: sceneState.learnedWords?.vakratunda?.learned || false,
                    mahakaya: sceneState.learnedWords?.mahakaya?.learned || false,
                    suryakoti: sceneState.learnedWords?.suryakoti?.learned || false,
                    samaprabha: sceneState.learnedWords?.samaprabha?.learned || false,
                    nirvighnam: sceneState.learnedWords?.nirvighnam?.learned || false,
                    kurumedeva: sceneState.learnedWords?.kurumedeva?.learned || false,
                    sarvakaryeshu: sceneState.learnedWords?.sarvakaryeshu?.learned || false,
                    sarvada: sceneState.learnedWords?.sarvada?.learned || false
                  }}
                  onSymbolClick={(symbolId) => console.log(`Symbol: ${symbolId}`)}
                />
              </div>
            )}

            {showSparkle === 'wise-choice' && (
              <SparkleAnimation
                type="magic"
                count={30}  // More sparkles for correct!
                color="#4ECDC4"  // Green/teal
                size={12}
                duration={2000}
                fadeOut={true}
                area="full"
              />
            )}

            {showSparkle === 'unwise-choice' && (
              <SparkleAnimation
                type="magic"
                count={15}  // Fewer sparkles for wrong
                color="#FF6B6B"  // Red/orange
                size={8}
                duration={1000}  // Shorter duration
                fadeOut={true}
                area="symbol"  // Just around the symbol, not full screen
              />
            )}



            {/* ==================== DISCOVERY 1: SARVAKARYESHU ==================== */}
            {showDiscoveryFlip1 && (
              <SimpleDiscoveryOverlay
                // STAGE 1: Discovery Moment
                celebrationTitle="Sarvakaryeshu Mastered!"
                celebrationText={"Self-Help Power...\n\nYou found the right Ganesha power for every task! Sarvakaryeshu means 'In All Activities'—you can handle anything!"}
                celebrationImage={doorImage} // or one of the game scenario images

                // STAGE 2: Mastery Power Reveal
                powerTitle="Mastery Unlocked!"
                powerText="You have all the tools you need! Use your powers to finish tasks, try new things, and do your best every day."
                powerIcon={sarvakaryeshuSymbol}

                buttonText="I Can Do It!"
                onComplete={() => {
                  console.log("Discovery 1 complete!");
                  setShowDiscoveryFlip1(false);

                  // Update sidebar + move to Door 2
                  sceneActions.updateState({
                    phase: SCENE_PHASES.DOOR2_ACTIVE,
                    learnedWords: {
                      ...sceneState.learnedWords,
                      sarvakaryeshu: { learned: true, scene: 4 }
                    }
                  });
                }}
                showSparkles={true}
              />
            )}

            {/* ==================== DISCOVERY 2: SARVADA ==================== */}
            {showDiscoveryFlip2 && (
              <SimpleDiscoveryOverlay
                // STAGE 1: Discovery Moment
                celebrationTitle="Sarvada Revealed!"
                celebrationText={"Always Ready...\n\nYou helped your friends! Sarvada means 'Always'—your powers work every day, for everyone."}
                celebrationImage={doorImage} // or a helper image

                // STAGE 2: Infinite Wisdom Power Reveal
                powerTitle="Infinite Wisdom Unlocked!"
                powerText="Ganesha's wisdom is with you—always. Use your powers to be a kind friend, a good helper, and a brave leader."
                powerIcon={sarvadaSymbol}

                buttonText="The Journey Continues!"
                onComplete={() => {
                  console.log("Discovery 2 complete!");
                  setShowDiscoveryFlip2(false);

                  // Update sidebar + complete scene
                  sceneActions.updateState({
                    phase: SCENE_PHASES.COMPLETE,
                    completed: true,
                    learnedWords: {
                      sarvakaryeshu: { learned: true, scene: 4 },
                      sarvada: { learned: true, scene: 4 }
                    }
                  });

                  // Show completion screen
                  setShowSparkle('final-fireworks');
                }}


                showSparkles={true}
              />
            )}

            {/* ── SymbolAutoReveal ── */}
            {revealConfig && (
              <SymbolAutoReveal
                key={revealConfig.symbolId}
                symbolId={revealConfig.symbolId}
                symbolImage={revealConfig.symbolImage}
                symbolName={revealConfig.symbolName}
                affirmation={revealConfig.affirmation}
                sidebarTargetRect={revealConfig.sidebarTarget}
                onComplete={() => handleRevealComplete(revealConfig.symbolId)}
              />
            )}

            {/* ==================== RESUME POPUP ==================== */}
            {showResumePopup && (
              <div style={{
                position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
                zIndex: 1000, background: 'linear-gradient(135deg, #6A1B9A 0%, #AB47BC 100%)',
                color: 'white', padding: '20px 40px', borderRadius: '15px',
                fontFamily: "'Baloo 2', cursive", fontSize: '1.4rem',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)', border: '3px solid #FFD700',
                textAlign: 'center', animation: 'slideDown 0.3s ease'
              }}>
                {resumeMessage}
              </div>
            )}

            {sceneState.welcomeShown && !showSceneCompletion && (
              <BackToMapButton onNavigate={onNavigate} />
            )}

            {/* Final Fireworks */}
            {showSparkle === 'final-fireworks' && (
              <>
                {/* ✅ ADD GANESHA IMAGE BEHIND FIREWORKS */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 29, // Just below fireworks (which is 30)
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  <img
                    src={ganeshaIcon}
                    alt="Ganesha Blessing"
                    style={{
                      width: '150px',
                      height: '150px',
                      filter: 'drop-shadow(0 0 40px rgba(255, 215, 0, 1))',
                      animation: 'ganeshaBlessing 3s ease-in-out infinite alternate'
                    }}
                  />

                  <div style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    color: 'white',
                    padding: '20px 40px',
                    borderRadius: '25px',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    boxShadow: '0 0 30px rgba(255, 215, 0, 0.8)'
                  }}>
                    Divine Blessings Complete! 🙏✨
                  </div>
                </div>

                {/* Fireworks Component */}
                <FireworksCompletion
                  show={showSparkle === 'final-fireworks'}
                  showCard={false}
                />
                <CalmGoldenFireworks
                  show={showSparkle === 'final-fireworks'}
                  particles={14}
                  duration={3500}
                  onComplete={() => {
                    console.log('🎯 Sarvakaryeshu-Sarvada fireworks complete');
                    setShowSparkle(null);

                    const profileId = localStorage.getItem('activeProfileId');
                    if (profileId) {
                      GameStateManager.saveGameState('cave-of-secrets', 'sarvakaryeshu-sarvada', {
                        completed: true,
                        stars: 8,
                        sanskritWords: { sarvakaryeshu: true, sarvada: true },
                        learnedWords: sceneState.learnedWords || {},
                        phase: 'complete',
                        timestamp: Date.now()
                      });

                      localStorage.removeItem(`temp_session_${profileId}_cave-of-secrets_sarvakaryeshu-sarvada`);
                      SimpleSceneManager.clearCurrentScene();
                    }

                    setShowSceneCompletion(true);
                  }}
                />
              </>
            )}

            {/* Scene Completion */}
            <SceneCompletionCelebration
              show={showSceneCompletion}
              sceneName="Cave of Secrets - Complete"
              completionTitle={completionModalContent?.title}
              completionSubtitle={completionModalContent?.subtitle}
              sceneNumber={4}
              totalScenes={5}
              starsEarned={8}
              totalStars={8}
              discoveredSymbols={['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva', 'sarvakaryeshu', 'sarvada']}
              containerType="journal"
              containerImage={meaningJournal}
              meaningCards={{
                vakratunda: { sanskrit: "वक्रतुण्ड", meaning: "Curved Trunk" },
                mahakaya: { sanskrit: "महाकाय", meaning: "Great Body" },
                suryakoti: { sanskrit: "सूर्यकोटि", meaning: "Million Suns" },
                samaprabha: { sanskrit: "समप्रभ", meaning: "Equal Radiance" },
                nirvighnam: { sanskrit: "निर्विघ्नम्", meaning: "Without Obstacles" },
                kurumedeva: { sanskrit: "कुरुमे देव", meaning: "Please Bless" },
                sarvakaryeshu: { sanskrit: "सर्वकार्येषु", meaning: "In All Tasks" },
                sarvada: { sanskrit: "सर्वदा", meaning: "Always" }
              }}
              appImages={{
                vakratunda: appVakratunda,
                mahakaya: appMahakaya,
                suryakoti: appSuryakoti,
                samaprabha: appSamaprabha,
                nirvighnam: appNirvighnam,
                kurumedeva: appKurumedeva,
                sarvakaryeshu: appSarvakaryeshu,
                sarvada: appSarvada
              }}
              nextSceneName="Cave of Secrets"

              sceneId="sarvakaryeshu-sarvada"
              zoneId="cave-of-secrets"
              completionData={{
                completed: true,
                stars: 8,
                symbols: {},
                sanskritWords: { sarvakaryeshu: true, sarvada: true },
                learnedWords: sceneState?.learnedWords || {},
                chants: { sarvakaryeshu: true, sarvada: true }
              }}
              onComplete={onComplete}
              onReplay={() => {
                setShowSceneCompletion(false);
                resetScene();
              }}
              onContinue={() => {
                const profileId = localStorage.getItem('activeProfileId');
                if (profileId) {
                  ProgressManager.updateSceneCompletion(profileId, 'cave-of-secrets', 'sarvakaryeshu-sarvada', {
                    completed: true,
                    stars: 8,
                    symbols: {},
                    sanskritWords: { sarvakaryeshu: true, sarvada: true },
                    learnedWords: sceneState.learnedWords || {},
                    chants: { sarvakaryeshu: true, sarvada: true }
                  });
                }

                setTimeout(() => {
                  SimpleSceneManager.setCurrentScene('cave-of-secrets', 'sarvakaryeshu-sarvada', false, false);
                  onNavigate?.('scene-complete-continue');
                }, 100);
              }}
              onExploreZones={() => {
                setShowSceneCompletion(false);
                onNavigate?.('zone-welcome');
              }}
            />


            {/* Navigation - Always on top */}
            <div style={{ position: 'relative', zIndex: 10000 }}>
              <TocaBocaNav
                onHome={() => {
                  onNavigate?.('home');
                }}
                onProgress={() => {
                  const name = activeProfile?.name || 'little explorer';
                  console.log(`Great Sanskrit progress, ${name}!`);
                  setShowCulturalCelebration(true);
                }}
                onHelp={() => console.log('Show help')}
                onParentMenu={() => console.log('Parent menu')}
                isAudioOn={isAudioOn}
                onAudioToggle={toggleAudio}
                onZonesClick={() => {
                  onNavigate?.('zones');
                }}
                onStartFresh={() => resetScene()}
                currentProgress={{
                  stars: sceneState.stars || 0,
                  completed: sceneState.completed ? 1 : 0,
                  total: 1
                }}
              />
            </div>

            <CulturalCelebrationModal
              show={showCulturalCelebration}
              onClose={() => setShowCulturalCelebration(false)}
            />

            {/*<style>{`
              @keyframes symbolGlow {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.4); }
              }
              
              .phase-header {
                position: absolute;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 215, 0, 0.95);
                color: #333;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 18px;
                font-weight: bold;
                z-index: 100;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                animation: bounce 2s infinite;
                border: 3px solid #FF8C42;
              }
              
              @keyframes bounce {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                50% { transform: translateX(-50%) translateY(-10px); }
              }
              
              .cave-symbol-individual {
                position: absolute;
                transition: all 0.3s ease;
              }
              
           .cave-symbol-individual.position-1 { top: 30%; left: 12%; }
.cave-symbol-individual.position-2 { bottom: 30%; left: 12%; }
.cave-symbol-individual.position-3 { top: 30%; right: 12%; }
.cave-symbol-individual.position-4 { bottom: 30%; right: 12%; }
              
              .cave-symbol-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 15px;
                border: 2px solid #FFD700;
                cursor: pointer;
                transition: all 0.3s ease;
              }
              
              .cave-symbol-item:hover {
                transform: scale(1.1);
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
              }
              
              .cave-symbol-item img {
                width: 60px;
                height: 60px;
                margin-bottom: 5px;
              }
              
              .helper-symbol {
                position: absolute;
              }
              
          /* Helper symbols - same positioning 
.helper-symbol.position-1 { top: 30%; left: 12%; }
.helper-symbol.position-2 { bottom: 30%; left: 12%; }
.helper-symbol.position-3 { top: 30%; right: 12%; }
.helper-symbol.position-4 { bottom: 30%; right: 12%; }
              
              .helper-symbol-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                background: rgba(255, 255, 255, 0.9);
                border-radius: 15px;
                border: 2px solid #FF8C42;
                cursor: pointer;
                transition: all 0.3s ease;
              }
              
              .helper-symbol-item:hover {
                transform: scale(1.1);
              }
              
              .helper-symbol-item img {
                width: 60px;
                height: 60px;
                margin-bottom: 5px;
              }
              
              .scenario-window {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 50%;
                max-width: 600px;
                border: 4px solid #FFD700;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
              }
              
              .scenario-window img {
                width: 100%;
                display: block;
              }
              
              .character-problem-speech,
              .person-problem-speech,
              .character-speech-bubble {
                position: absolute;
                top: 10%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 255, 255, 0.95);
                padding: 15px 20px;
                border-radius: 20px;
                max-width: 80%;
                text-align: center;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                z-index: 10;
              }
              
              .character-selection-clean {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
              }
              
              .character-options-cave {
                display: flex;
                gap: 40px;
                margin-top: 20px;
              }
              
              .character-option-clean {
                background: white;
                padding: 20px;
                border-radius: 20px;
                border: 3px solid #FFD700;
                cursor: pointer;
                transition: all 0.3s ease;
              }
              
              .character-option-clean:hover {
                transform: scale(1.1);
                box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);
              }
              
              .character-option-clean img {
                width: 150px;
                height: 150px;
                object-fit: contain;
              }
            `}</style>*/}
            {/* Add this to your CSS section */}
            <style>{`
  @keyframes bannerBounce {
    0%, 100% { 
      transform: translateX(-50%) translateY(0); 
    }
    50% { 
      transform: translateX(-50%) translateY(-8px); 
    }
  }
  
  @keyframes bannerFadeIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes processingPulse {
  0%, 100% { 
    transform: scale(1.1);
    opacity: 0.7;
  }
  50% { 
    transform: scale(1.15);
    opacity: 0.9;
  }
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
  
// Add to CSS section (around line 2020):

@keyframes pop {
  0% { 
    transform: scale(0);
    opacity: 0;
  }
  50% { 
    transform: scale(1.2);
  }
  100% { 
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes helperGlow {
  0%, 100% { 
    filter: drop-shadow(0 0 20px #4ECDC4) brightness(1.3);
  }
  50% { 
    filter: drop-shadow(0 0 30px #44A08D) brightness(1.4);
  }
}
`}</style>

          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default SarvakaryeshuSarvada;
