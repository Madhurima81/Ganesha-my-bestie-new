// zones/symbol-mountain/scenes/final-scene/SacredAssemblyScene.jsx - V8 DIVINE VERSION
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './SacredAssemblyScene.css';
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../../lib/config/content/openingModals';
import { getCompletionModal } from '../../../../lib/config/content';

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../../lib/components/ui/AudioToggle';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import RotatingOrbsEffect from '../../../../lib/components/feedback/RotatingOrbsEffect';
import ZoneCompletionFireworks from '../../../../lib/components/feedback/ZoneCompletionFireworks';
// import SimpleGameCoach, { SimpleGameCoachConfigs } from '../../../../lib/components/coach/SimpleGameCoach'; // COMMENTED OUT
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import useGaneshaVoice from '../../../../lib/hooks/useGaneshaVoice';
import { useGameSounds } from '../../../../lib/hooks/useGameSounds';
import { getVoiceScript } from '../../../../lib/config/content/voiceGuidance';

// UI Components
import TocaBocaNav from '../../../../lib/components/navigation/TocaBocaNav';
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
// import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import MagicalCardFlip from '../../../../lib/components/animation/MagicalCardFlip';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import OpeningModal from '../../../shared/components/OpeningModal';
import GaneshaIllustration from './GaneshaIllustration';

import useSceneReset from '../../../../lib/hooks/useSceneReset';
import useAppVisibility from '../../../../lib/hooks/useAppVisibility';
import useResumeCountdown from '../../../../lib/hooks/useResumeCountdown';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';
import ResumeCountdown from '../../../../lib/components/feedback/ResumeCountdown';

// Images - Background
import sacredBackground from './assets/images/final_symbol_background.jpg';

// Images - Ganesha Forms
import ganeshaStone from './assets/images/ganesha-stone.png';
import ganeshaDivine from './assets/images/ganesha-divine.png';

// Images - Symbol Icons
import symbolMooshikaColored from './assets/images/symbol-mooshika-colored.svg';
import symbolModakColored from './assets/images/symbol-modak-colored.svg';
import symbolBellyColored from './assets/images/symbol-belly-colored.svg';
import symbolLotusColored from './assets/images/symbol-lotus-colored.png';
import symbolTrunkColored from './assets/images/symbol-trunk-colored.png';
import symbolEyesColored from './assets/images/symbol-eyes-colored.png';
import symbolEarsColored from './assets/images/symbol-ear-colored.png';
import symbolTuskColored from './assets/images/symbol-tusk-colored.png';

// Body Part Overlays - ADD THESE
import ganeshaFaded from './assets/images/ganesha-faded.png';
import ganeshaEyes from './assets/images/ganesha-eyes-colored.png';
import ganeshaEars from './assets/images/ganesha-ears-colored.png';
import ganeshaTrunk from './assets/images/ganesha-trunk-colored.png';
import ganeshaTusk from './assets/images/ganesha-tusk-colored.png';
import ganeshaLeftHand from './assets/images/ganesha-left-hand-colored.png';
import ganeshaRightHand from './assets/images/ganesha-right-hand-colored.png';
import ganeshaBelly from './assets/images/ganesha-belly-colored.png';
import ganeshaBase from './assets/images/ganesha-mouse-colored.png';

// Association Icons (create placeholder icons for now, or use emojis)
// We'll use simple colored circles as placeholders - you can replace with actual icons later

// Coach image (for hints only)
// import mooshikaCoach from "../pond/assets/images/mooshika-coach.png";

// Temporary Icon Placeholders (replace with actual images later)
const createIconDataURL = (emoji, color) => {
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');

  // Background circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(60, 60, 50, 0, Math.PI * 2);
  ctx.fill();

  // Emoji
  ctx.font = '50px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 60, 60);

  return canvas.toDataURL();
};

// Icon placeholders (you can replace these with actual icon imports later)
const iconTarget = '🎯';
const iconHeadphones = '🎧';
const iconRoadblock = '🚧';
const iconHammer = '🔨';
const iconHoney = '🍯';
const iconLightbulb = '💡';
const iconUniverse = '🌌';
const iconPath = '🛤️';

// Sacred Assembly Game Configuration
const SACRED_SYMBOLS = [
  {
    id: 'eyes',
    name: 'Eyes',
    emoji: '👁️',
    image: symbolEyesColored,
    associationIcon: iconTarget,
    associationText: "My big eyes help me see everything clearly.",
    bodyPartImage: ganeshaEyes,
    blessing: "Ganesha's divine eyes awaken! May you see truth in all things.",
    bodyPart: 'eyes',
    correctZone: 'eyes',
    wrongZones: ['belly', 'base', 'left-hand', 'trunk']
  },
  {
    id: 'ears',
    name: 'Ears',
    emoji: '👂',
    image: symbolEarsColored,
    associationIcon: iconHeadphones,
    associationText: "My big ears listen to everything you say.",
    bodyPartImage: ganeshaEars,
    blessing: "Ganesha's sacred ears come alive! May you listen with wisdom and compassion.",
    bodyPart: 'ears',
    correctZone: 'ears',
    wrongZones: ['trunk', 'right-hand', 'base', 'tusk']
  },
  {
    id: 'trunk',
    name: 'Trunk',
    emoji: '🐘',
    image: symbolTrunkColored,
    associationIcon: iconRoadblock,
    associationText: "My trunk is strong and helps me move things.",
    bodyPartImage: ganeshaTrunk,
    blessing: "Ganesha's mighty trunk awakens! May all obstacles be removed from your path.",
    bodyPart: 'trunk',
    correctZone: 'trunk',
    wrongZones: ['eyes', 'belly', 'right-hand', 'base']
  },
  {
    id: 'tusk',
    name: 'Tusk',
    emoji: '🦷',
    image: symbolTuskColored,
    associationIcon: iconHammer,
    associationText: "My tusk helps me stay strong and brave.",
    bodyPartImage: ganeshaTusk,
    blessing: "Ganesha's powerful tusk glows! May you break through any challenge with determination.",
    bodyPart: 'tusk',
    correctZone: 'tusk',
    wrongZones: ['ears', 'left-hand', 'belly', 'trunk']
  },
  {
    id: 'modak',
    name: 'Modak',
    emoji: '🍯',
    image: symbolModakColored,
    associationIcon: iconHoney,
    associationText: "My modak reminds me to share sweetness.",
    bodyPartImage: ganeshaLeftHand,
    blessing: "Ganesha's blessing hand awakens! May sweetness and abundance fill your life.",
    bodyPart: 'left-hand',
    correctZone: 'left-hand',
    wrongZones: ['right-hand', 'ears', 'base', 'belly']
  },
  {
    id: 'lotus',
    name: 'Lotus',
    emoji: '🪷',
    image: symbolLotusColored,
    associationIcon: iconLightbulb,
    associationText: "My lotus helps me stay calm and peaceful.",
    bodyPartImage: ganeshaRightHand,
    blessing: "Ganesha's wisdom hand comes alive! May purity and enlightenment guide you.",
    bodyPart: 'right-hand',
    correctZone: 'right-hand',
    wrongZones: ['left-hand', 'trunk', 'tusk', 'eyes']
  },
  {
    id: 'belly',
    name: 'Belly',
    emoji: '🫄',
    image: symbolBellyColored,
    associationIcon: iconUniverse,
    associationText: "My big belly holds lots of love inside.",
    bodyPartImage: ganeshaBelly,
    blessing: "Ganesha's sacred belly awakens! May you hold the universe's love within you.",
    bodyPart: 'belly',
    correctZone: 'belly',
    wrongZones: ['trunk', 'eyes', 'left-hand', 'right-hand']
  },
  {
    id: 'mooshika',
    name: 'Mooshika',
    emoji: '🐭',
    image: symbolMooshikaColored,
    associationIcon: iconPath,
    associationText: "My little friend helps guide me on my path.",
    bodyPartImage: ganeshaBase,
    blessing: "Mooshika, Ganesha's divine vehicle awakens! May wisdom guide your every journey, dear child.",
    bodyPart: 'base',
    correctZone: 'base',
    wrongZones: ['belly', 'trunk', 'ears', 'eyes']
  }
];


// DEBUG: Verify SACRED_SYMBOLS is correct
console.log('🔍 SACRED_SYMBOLS check:', {
  count: SACRED_SYMBOLS.length,
  ids: SACRED_SYMBOLS.map(s => s.id),
  hasDuplicates: SACRED_SYMBOLS.map(s => s.id).length !== new Set(SACRED_SYMBOLS.map(s => s.id)).size
});

// Individual styling for placed symbols
const PLACED_SYMBOL_CONFIGS = {
  mooshika: { width: 'auto', height: '50px', transform: 'translate(8px, -48px) rotate(0deg) scaleX(-1)', borderRadius: '50%' },
  modak: { width: '50px', height: 'auto', transform: 'translate(18px, -8px) rotate(0deg) scaleX(-1)', borderRadius: '40%' },
  belly: { width: '70px', height: 'auto', transform: 'translate(-8px, -8px) rotate(0deg) scaleX(-1)', borderRadius: '50%' },
  lotus: { width: '58px', height: 'auto', transform: 'translate(-8px, -8px) rotate(0deg) scaleX(-1)', borderRadius: '45%' },
  trunk: { width: '245px', height: 'auto', transform: 'translate(-8px, -8px) rotate(0deg)', borderRadius: '30%' },
  eyes: { width: '65px', height: 'auto', transform: 'translate(-8px, -8px) rotate(0deg) scaleX(-1)', borderRadius: '60%' },
  ears: { width: '125px', height: 'auto', transform: 'translate(-8px, 18px) rotate(0deg)', borderRadius: '40%' },
  tusk: { width: '35px', height: 'auto', transform: 'translate(-8px, -8px) rotate(0deg) scaleX(-1)', borderRadius: '25%' }
};

// DIVINE: Sacred Color Palette
const SACRED_COLOR_PALETTE = {
  primary: '#8A2BE2',
  secondary: '#FF6B35',
  accent: '#4ECDC4',
  divine: '#E6E6FA',
  glow: 'rgba(138, 43, 226, 0.6)',
  selection: '#9932CC',
  highlight: 'rgba(138, 43, 226, 0.3)',
  aura: 'rgba(230, 230, 250, 0.4)'
};

const RESUME_DELAY_MS = 3000;

// Hint overlay positions — approximate center of each body part within the ganesha container
// These are used to render a glow <div> on top of Ganesha (no SVG manipulation)
const ZONE_HINT_POSITIONS = {
  'eyes':       { top: '41%', left: '48%' },
  'ears':       { top: '43%', left: '67%' },
  'trunk':      { top: '57%', left: '50%' },
  'tusk':       { top: '54%', left: '54%' },
  'left-hand':  { top: '61%', left: '60%' },
  'right-hand': { top: '48%', left: '73%' },
  'belly':      { top: '62%', left: '50%' },
  'base':       { top: '81%', left: '40%' },
};

const ZONE_SPARKLE_POSITIONS = {
  eyes: { top: '41%', left: '48%', width: '120px', height: '120px' },
  ears: { top: '43%', left: '67%', width: '130px', height: '130px' },
  trunk: { top: '57%', left: '50%', width: '140px', height: '140px' },
  tusk: { top: '54%', left: '54%', width: '100px', height: '100px' },
  'left-hand': { top: '61%', left: '60%', width: '120px', height: '120px' },
  'right-hand': { top: '48%', left: '73%', width: '120px', height: '120px' },
  belly: { top: '62%', left: '50%', width: '150px', height: '150px' },
  base: { top: '81%', left: '40%', width: '130px', height: '130px' }
};

// Body part drop zone configurations
const BODY_PART_ZONES = [
  { id: 'eyes', acceptTypes: ['eyes'], position: { top: '30%', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '60px' }, hint: 'Divine Sight' },
  { id: 'ears', acceptTypes: ['ears'], position: { top: '25%', left: '65%', width: '80px', height: '80px' }, hint: 'Deep Listening' },
  { id: 'trunk', acceptTypes: ['trunk'], position: { top: '35%', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '120px' }, hint: 'Removing Obstacles' },
  { id: 'tusk', acceptTypes: ['tusk'], position: { top: '40%', right: '40%', width: '60px', height: '80px' }, hint: 'Breaking Barriers' },
  { id: 'left-hand', acceptTypes: ['modak'], position: { top: '35%', left: '20%', width: '80px', height: '80px' }, hint: 'Sweet Blessings' },
  { id: 'right-hand', acceptTypes: ['lotus'], position: { top: '38%', right: '12%', width: '80px', height: '80px' }, hint: 'Pure Wisdom' },
  { id: 'belly', acceptTypes: ['belly'], position: { top: '50%', left: '50%', transform: 'translateX(-50%)', width: '160px', height: '120px' }, hint: 'Universe Within' },
  { id: 'base', acceptTypes: ['mooshika'], position: { bottom: '25%', left: '60%', transform: 'translateX(-50%)', width: '120px', height: '80px' }, hint: 'Divine Vehicle' }
];

// Ganesha transformation states
const GANESHA_STATES = {
  STONE: 'stone',
  AWAKENING: 'awakening',
  DIVINE: 'divine',
  BLESSED: 'blessed'
};

const SYMBOL_POSITIONS = [
  { top: '38%', left: '25%' },
  { top: '12%', left: '75%' },
  { top: '35%', left: '8%' },
  { top: '20%', left: '86%' },
  { top: '60%', left: '15%' },
  { top: '55%', left: '85%' },
  { bottom: '15%', left: '30%' },
  { bottom: '20%', left: '70%' }
];

const ACTIVE_BODY_PART_IMAGES = {
  eyes: ganeshaEyes,
  ears: ganeshaEars,
  trunk: ganeshaTrunk,
  tusk: ganeshaTusk,
  'left-hand': ganeshaLeftHand,
  'right-hand': ganeshaRightHand,
  belly: ganeshaBelly,
  base: ganeshaBase
};

const SacredAssemblyScene = ({
  onComplete,
  onNavigate,
  zoneId = 'symbol-mountain',
  sceneId = 'final-scene'
}) => {
  return (
    <SceneManager
      zoneId={zoneId}
      sceneId={sceneId}
      initialState={{
        placedSymbols: {},
        ganeshaState: GANESHA_STATES.STONE,
        selectedSymbol: null,
        highlightedZone: null,

        // NEW: Association Challenge State
        currentRound: 0,
        currentAssociationSymbol: null,
        glowingZones: [],
        wrongAttempts: 0,
        showingAssociationCard: false,
        symbolQueue: [],

        placementAnimation: null,
        currentBlessing: null,
        blessingsHeard: [],
        finalBlessingShown: false,
        phase: 'initial',
        currentFocus: 'assembly',
        discoveredSymbols: {
          mooshika: true, modak: true, belly: true, lotus: true,
          trunk: true, eyes: true, ear: true, tusk: true
        },
        welcomeShown: false,
        assemblyWisdomShown: false,
        masteryShown: false,
        readyForWisdom: false,
        gameCoachState: null,
        lastGameCoachTime: 0,
        isReloadingGameCoach: false,
        currentPopup: null,
        showingCompletionScreen: false,
        showingZoneCompletion: false,
        celebrationActive: false,
        stars: 0,
        completed: false,
        progress: {
          percentage: 0,
          starsEarned: 0,
          completed: false
        }
      }}
    >
      {({ sceneState, sceneActions, isReload }) => (
        <SacredAssemblyContent
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
  );
};

const SacredAssemblyContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  const [showSparkle, setShowSparkle] = useState(null);
  const [showMagicalCard, setShowMagicalCard] = useState(false);
  const [cardContent, setCardContent] = useState({});
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [showZoneCompletion, setShowZoneCompletion] = useState(false);
  // const [hintUsed, setHintUsed] = useState(false);
  const [isOrbsRunning, setIsOrbsRunning] = useState(false);
  const [celebrationZoneId, setCelebrationZoneId] = useState(null);
  const completionModalContent = getCompletionModal(zoneId, sceneId);
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const {
    speak: speakGanesha,
    stop: stopGaneshaVoice,
    isSpeaking: isGaneshaSpeaking
  } = useGaneshaVoice();
  const {
    playUiTap,
    playWrongTap,
    playSparkle,
    playChime,
    playGlow,
    playTwinkle,
    setGlobalVolume
  } = useGameSounds();
  // ── T08/T09: visibility + idle timer infrastructure ──────────────────────────
  const { startIdleTimer, stopIdleTimer, setCurrentPhase, startMusic, stopMusic, setVoiceVolume, playVoice } = useVoiceGuidance(
    zoneId, sceneId, { enableMusic: true, musicVolume: 0.06, sfxVolume: 0.35, idleTimeout: 20 }
  );
  useEffect(() => { startIdleTimer(); return () => stopIdleTimer(); }, [startIdleTimer, stopIdleTimer]);
  useEffect(() => { setCurrentPhase(sceneState?.phase ?? null); }, [sceneState?.phase, setCurrentPhase]);
  useEffect(() => { setVoiceVolume(isAudioOn ? 1 : 0); }, [isAudioOn, setVoiceVolume]);
  useEffect(() => {
    if (sceneState?.welcomeShown) startMusic();
  }, [sceneState?.welcomeShown, startMusic]);
  useEffect(() => {
    setGlobalVolume(0.5);
    return () => {
      stopGaneshaVoice();
      stopMusic();
      setGlobalVolume(1);
    };
  }, [setGlobalVolume, stopGaneshaVoice, stopMusic]);

  const { resetScene } = useSceneReset(sceneActions, 'symbol-mountain', 'final-scene', getSceneResetConfig('final-scene'));

  const timeoutsRef = useRef([]);
  // const progressiveHintRef = useRef(null);

  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'little explorer';

  const isGameCoachVisible = sceneState?.gameCoachState || sceneState?.isReloadingGameCoach;

  const selectedSymbol = sceneState?.selectedSymbol ?
    SACRED_SYMBOLS.find(s => s.id === sceneState.selectedSymbol) : null;
  const highlightedZone = sceneState?.highlightedZone ?
    BODY_PART_ZONES.find(z => z.id === sceneState.highlightedZone) : null;

  const [cardPhase, setCardPhase] = useState('hidden'); // 'hidden' | 'appear' | 'flipped' | 'side' | 'play' | 'feedback'
  const [flyingSymbol, setFlyingSymbol] = useState(null);
  const [ganeshaReaction, setGaneshaReaction] = useState('');
  const activeTargetZoneId = useMemo(() => {
    if (cardPhase !== 'play') return null;
    const currentSymbol = SACRED_SYMBOLS.find(s => s.id === sceneState?.currentAssociationSymbol);
    return currentSymbol?.correctZone || null;
  }, [cardPhase, sceneState?.currentAssociationSymbol]);
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);
  const onboardingPlayedRef = useRef(sceneState?.onboardingPlayed || false);
  const onboardingPlayedAtRef = useRef(0);
  const idleNudgePlayedRef = useRef(false);
  const cardVoPlayedForRoundRef = useRef(-1); // tracks which round's card VO has already played
  const finalVoPlayedRef = useRef(false);
  const openingModalVoPlayedRef = useRef(false);
  const correctVoIndexRef = useRef(0);

  const CARD_VO_MAP = useMemo(() => ({
    eyes: 'cardEyes',
    ears: 'cardEars',
    trunk: 'cardTrunk',
    tusk: 'cardTusk',
    modak: 'cardModak',
    lotus: 'cardLotus',
    belly: 'cardBelly',
    mooshika: 'cardMooshika'
  }), []);
  const CORRECT_VO_ROTATION = useMemo(
    () => ['correctYes', 'correctThatsRight', 'correctYouFoundIt', 'correctWellDone'],
    []
  );

  const getMomentForVoiceKey = useCallback((key) => {
    if (key === 'openingModalPrompt') return 'greeting';
    if (key.startsWith('correct')) return 'celebration';
    if (key.startsWith('wrong') || key.startsWith('idle') || key.startsWith('onboarding')) return 'encouragement';
    if (key.startsWith('final')) return 'closing';
    return 'story';
  }, []);

  const playSceneVoice = useCallback((key, onEnded = null, options = {}) => {
    const { auto = false } = options;

    if (!isAudioOn) {
      if (onEnded) onEnded();
      return false;
    }

    if (auto && isGaneshaSpeaking) return false;

    const script = getVoiceScript(zoneId, sceneId, key);
    if (script?.text) {
      speakGanesha(script.text, {
        age: 7,
        style: 'child',
        moment: getMomentForVoiceKey(key),
        onEnd: onEnded || undefined
      });
      return true;
    }

    playVoice(key, onEnded, options);
    return true;
  }, [getMomentForVoiceKey, isAudioOn, isGaneshaSpeaking, playVoice, sceneId, speakGanesha, zoneId]);

  const replayVoiceForCurrentPhase = useCallback(() => {
    if (!isAudioOn || !sceneState) return;

    if (!sceneState.welcomeShown) {
      playSceneVoice('openingModalPrompt', null, { replayOnReturn: false, auto: true });
      return;
    }

    if (
      sceneState.phase === 'complete' ||
      sceneState.showingZoneCompletion ||
      showSceneCompletion ||
      showSparkle === 'final-fireworks'
    ) {
      playSceneVoice('finalAlwaysWithYou', null, { replayOnReturn: false, auto: true });
      return;
    }

    const currentSymbolId = sceneState.currentAssociationSymbol;
    const cardVoKey = currentSymbolId ? CARD_VO_MAP[currentSymbolId] : null;

    if (currentSymbolId && (cardPhase === 'appear' || cardPhase === 'flipped' || cardPhase === 'side')) {
      return;
    }

    if (currentSymbolId && cardPhase === 'play') {
      if ((sceneState.currentRound || 0) === 0 && !onboardingPlayedRef.current) {
        const onboardingStarted = playSceneVoice('onboardingTapRightPart', null, { replayOnReturn: false, auto: true });
        if (onboardingStarted) {
          onboardingPlayedRef.current = true;
          onboardingPlayedAtRef.current = Date.now();
        }
      } else {
        playSceneVoice('idleLookCarefully', null, { replayOnReturn: false, auto: true });
      }
      return;
    }

    if (currentSymbolId && cardPhase === 'feedback') {
      const lastCorrectIdx =
        (correctVoIndexRef.current - 1 + CORRECT_VO_ROTATION.length) % CORRECT_VO_ROTATION.length;
      playSceneVoice(CORRECT_VO_ROTATION[lastCorrectIdx], null, { replayOnReturn: false });
    }
  }, [
    CARD_VO_MAP,
    CORRECT_VO_ROTATION,
    cardPhase,
    isAudioOn,
    playSceneVoice,
    sceneState,
    showSceneCompletion,
    showSparkle
  ]);

  useAppVisibility(
    () => {
      stopGaneshaVoice();
    },
    () => {
      replayVoiceForCurrentPhase();
    },
    { resumeDelay: RESUME_DELAY_MS }
  );

  // Zone state: idle | wrong | correct | placed | hint
  const initZoneStates = (placedSymbols = {}) => {
    const states = {};
    ['eyes','ears','trunk','tusk','belly','left-hand','right-hand','base'].forEach(z => { states[z] = 'idle'; });
    Object.keys(placedSymbols).forEach(symbolId => {
      const sym = SACRED_SYMBOLS.find(s => s.id === symbolId);
      if (sym) states[sym.correctZone] = 'placed';
    });
    return states;
  };
  const [zoneStates, setZoneStates] = useState(() => initZoneStates(sceneState?.placedSymbols));

  // CARD PHASE TIMELINE — drives the card animation state machine
  useEffect(() => {
    if (!sceneState?.currentAssociationSymbol) return;
    const currentRound = sceneState?.currentRound || 0;
    const cardVoKey = CARD_VO_MAP[sceneState.currentAssociationSymbol];

    if (cardPhase === 'appear') {
      playChime();
      const t = setTimeout(() => setCardPhase('flipped'), 1100);
      return () => clearTimeout(t);
    }

    if (cardPhase === 'flipped') {
      // No VO here — card is mid-flip, child can't read it yet
      playSparkle();
      const t = setTimeout(() => setCardPhase('side'), 1100);
      return () => clearTimeout(t);
    }

    if (cardPhase === 'side') {
      // No VO here — card is still sliding. VO fires in 'play' once card has landed.
      playUiTap();
      setCardPhase('play');
    }
  }, [CARD_VO_MAP, cardPhase, playChime, playSceneVoice, playSparkle, playUiTap, sceneState?.currentAssociationSymbol, sceneState?.currentRound]);

  // Play-phase VO sequence: card VO when card lands, idle hint after 10s silence
  useEffect(() => {
    if (cardPhase !== 'play') return;
    const currentSymbol = SACRED_SYMBOLS.find(s => s.id === sceneState?.currentAssociationSymbol);
    if (!currentSymbol) return;
    const correctZone = currentSymbol.correctZone;
    const cardVoKey = CARD_VO_MAP[currentSymbol.id];

    // Card VO — 2.5s after card lands, giving child time to look first
    // Guard prevents double-play if effect re-runs while still in 'play'
    const roundIndex = sceneState?.currentRound ?? -1;
    const cardVoTimer = setTimeout(() => {
      if (cardVoKey && cardVoPlayedForRoundRef.current !== roundIndex) {
        cardVoPlayedForRoundRef.current = roundIndex;
        playSceneVoice(cardVoKey, null, { replayOnReturn: false });
      }
    }, 2500);

    // Idle hint — 10s of no tap → one visual blink + VO
    const hintTimer = setTimeout(() => {
      if (!idleNudgePlayedRef.current) {
        playSceneVoice('idleLookCarefully', null, { replayOnReturn: false });
        idleNudgePlayedRef.current = true;
      }
      setZoneStates(prev => {
        if (prev[correctZone] === 'idle') return { ...prev, [correctZone]: 'hint' };
        return prev;
      });
      setTimeout(() => {
        setZoneStates(prev => (prev[correctZone] === 'hint' ? { ...prev, [correctZone]: 'idle' } : prev));
      }, 700);
    }, 10000);

    return () => {
      clearTimeout(cardVoTimer);
      clearTimeout(hintTimer);
    };
  }, [cardPhase, sceneState?.currentAssociationSymbol]);

  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  useEffect(() => {
    const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
    if (!sceneState?.welcomeShown && placedCount === 0) {
      onboardingPlayedRef.current = false;
      onboardingPlayedAtRef.current = 0;
      idleNudgePlayedRef.current = false;
      finalVoPlayedRef.current = false;
      openingModalVoPlayedRef.current = false;
      correctVoIndexRef.current = 0;
    }
  }, [sceneState?.welcomeShown, sceneState?.placedSymbols]);

  // Opening modal VO — plays when modal APPEARS, not when button is tapped
  useEffect(() => {
    if (sceneState?.welcomeShown) return;           // modal not showing
    if (openingModalVoPlayedRef.current) return;    // already played this session
    const t = setTimeout(() => {
      openingModalVoPlayedRef.current = true;
      playSceneVoice('openingModalPrompt', null, { replayOnReturn: false });
    }, 700); // wait for modal entrance animation to finish
    return () => clearTimeout(t);
  }, [sceneState?.welcomeShown]);

  const playSound = (type) => {
    // Simple sound effects (you can replace URLs later)
    const sounds = {
      pop: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-click-1112.mp3',
      success: 'https://assets.mixkit.co/sfx/preview/mixkit-magical-coin-win-193.mp3',
      wrong: 'https://assets.mixkit.co/sfx/preview/mixkit-cartoon-negative-sound-2273.mp3'
    };
    try {
      const audio = new Audio(sounds[type]);
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play blocked", e));
    } catch (e) { console.log("Audio error"); }
  };

  const handleSymbolClick = (symbol) => {
    if (!sceneState || !sceneActions) return;

    if (sceneState.placedSymbols?.[symbol.id]) {
      setShowSparkle(`symbol-placed-${symbol.id}`);
      safeSetTimeout(() => setShowSparkle(null), 1500);
      return;
    }

    // Progressive hint disabled in this scene.

    const currentSelected = sceneState.selectedSymbol;

    if (currentSelected === symbol.id) {
      sceneActions.updateState({
        selectedSymbol: null,
        highlightedZone: null
      });
    } else {
      const matchingZone = BODY_PART_ZONES.find(zone =>
        zone.acceptTypes.includes(symbol.id)
      );

      sceneActions.updateState({
        selectedSymbol: symbol.id,
        highlightedZone: matchingZone?.id || null
      });
    }
  };

  // NEW: Initialize random symbol queue when game starts
  // REPLACE LINES 409-430 in SacredAssemblySceneV8.jsx with this:

  // NEW: Initialize random symbol queue when game starts
  // NEW: Initialize random symbol queue when game starts
  useEffect(() => {
    if (sceneState?.phase === 'initial' &&
      sceneState?.welcomeShown &&
      (!sceneState?.symbolQueue || sceneState.symbolQueue.length === 0)) {

      console.log('🎮 Initializing symbol queue...'); // DEBUG

      // Create array of all symbol IDs (should be exactly 8)
      const allSymbolIds = SACRED_SYMBOLS.map(s => s.id);
      console.log('📋 All symbol IDs:', allSymbolIds, 'Count:', allSymbolIds.length); // DEBUG

      // Fisher-Yates shuffle for better randomization
      const shuffledSymbols = [...allSymbolIds];
      for (let i = shuffledSymbols.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledSymbols[i], shuffledSymbols[j]] = [shuffledSymbols[j], shuffledSymbols[i]];
      }

      console.log('🎲 Symbol queue created:', shuffledSymbols); // DEBUG
      console.log('✅ Queue length:', shuffledSymbols.length, 'Should be 8'); // DEBUG

      // Verify no duplicates
      const uniqueSymbols = [...new Set(shuffledSymbols)];
      if (uniqueSymbols.length !== 8) {
        console.error('❌ DUPLICATE SYMBOLS IN QUEUE!', shuffledSymbols); // DEBUG
      }

      sceneActions.updateState({
        symbolQueue: shuffledSymbols,
        currentRound: 0
      });
    }
  }, [sceneState?.phase, sceneState?.welcomeShown, sceneState?.symbolQueue]);

  // NEW: Separate useEffect to start first round AFTER symbolQueue is set
  // NEW: Separate useEffect to start first round AFTER symbolQueue is set
  useEffect(() => {
    // Check if any symbols are already placed
    const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;

    if (sceneState?.symbolQueue &&
      sceneState.symbolQueue.length > 0 &&
      sceneState.currentRound === 0 &&
      placedCount === 0 &&
      !sceneState.currentAssociationSymbol &&
      !sceneState.showingAssociationCard) {

      if (!onboardingPlayedRef.current) {
        // Round 0, first time — play onboarding VO, then start first card after it ends
        safeSetTimeout(() => {
          onboardingPlayedRef.current = true;
          sceneActions.updateState({ onboardingPlayed: true }); // persist so back+return skips onboarding
          playSceneVoice('onboardingTapRightPart', () => {
            safeSetTimeout(() => startNextRound(0), 400);
          }, { replayOnReturn: false });
        }, 600);
      } else {
        // Resume path — onboarding already played, start card directly
        safeSetTimeout(() => startNextRound(0), 500);
      }
    }
  }, [
    sceneState?.symbolQueue,
    sceneState?.currentRound,
    sceneState?.currentAssociationSymbol,
    sceneState?.placedSymbols // <--- ADD THIS to the dependency array
  ]);

  // ADD THIS NEW useEffect AFTER the other useEffects (around line 470)
  // This will help us see when state changes:

  // DEBUG: Monitor association card state
  useEffect(() => {
    console.log('🔍 Association Card State Changed:', {
      showingAssociationCard: sceneState?.showingAssociationCard,
      currentAssociationSymbol: sceneState?.currentAssociationSymbol,
      glowingZones: sceneState?.glowingZones,
      currentRound: sceneState?.currentRound,
      symbolQueue: sceneState?.symbolQueue
    });
  }, [
    sceneState?.showingAssociationCard,
    sceneState?.currentAssociationSymbol,
    sceneState?.glowingZones,
    sceneState?.currentRound,
    sceneState?.symbolQueue
  ]);

  const startNextRound = (roundNumber = null) => {
    if (!sceneState || !sceneActions) return;

    const currentRound = roundNumber !== null ? roundNumber : (sceneState.currentRound || 0);
    const symbolQueue = sceneState.symbolQueue || [];

    if (currentRound >= 8) {
      triggerFinalCelebration();
      return;
    }

    const currentSymbolId = symbolQueue[currentRound];
    const currentSymbol = SACRED_SYMBOLS.find(s => s.id === currentSymbolId);
    if (!currentSymbol) return;

    idleNudgePlayedRef.current = false;
    cardVoPlayedForRoundRef.current = -1;
    setCardPhase('appear');
    // Reset non-placed zones to idle for the new round
    setZoneStates(prev => {
      const next = {};
      Object.keys(prev).forEach(z => { next[z] = prev[z] === 'placed' ? 'placed' : 'idle'; });
      return next;
    });
    sceneActions.updateState({
      currentAssociationSymbol: currentSymbolId,
      glowingZones: [],
      showingAssociationCard: true,
      wrongAttempts: 0,
      selectedSymbol: null,
      highlightedZone: null
    });
  };

  // Zone click — discovery system, no pre-highlights
  const handleZoneClick = (zoneId) => {
    if (!sceneState || !sceneActions) return;
    if (cardPhase !== 'play') return;

    const currentSymbol = SACRED_SYMBOLS.find(s => s.id === sceneState.currentAssociationSymbol);
    if (!currentSymbol) return;

    const isCorrect = zoneId === currentSymbol.correctZone;

    if (isCorrect) {
      const correctVoKey = CORRECT_VO_ROTATION[correctVoIndexRef.current % CORRECT_VO_ROTATION.length];
      correctVoIndexRef.current += 1;
      playSceneVoice(correctVoKey, null, { replayOnReturn: false });
      playUiTap();
      // correct → pop animation → then permanently placed
      setZoneStates(prev => ({ ...prev, [zoneId]: 'correct' }));
      setTimeout(() => {
        setZoneStates(prev => ({ ...prev, [zoneId]: 'placed' }));
      }, 420);
      handleCorrectPlacement(currentSymbol);
    } else {
      playWrongTap();
      // wrong → wiggle → snap back to idle
      setZoneStates(prev => ({ ...prev, [zoneId]: 'wrong' }));
      setTimeout(() => {
        setZoneStates(prev => (prev[zoneId] === 'wrong' ? { ...prev, [zoneId]: 'idle' } : prev));
      }, 320);
      handleWrongPlacement(zoneId);
    }
  };

  // NEW: Handle correct placement with MAGIC & FUN
  // NEW: Handle correct placement with MAGIC & FUN
  /*const handleCorrectPlacement = (symbol) => {
    if (!sceneState || !sceneActions) return;
    
    clearAllTimeouts();
  
    // 1. Play Success Sound
    playSound('success');
  
    // 2. Trigger Flying Animation
    // --- FIX: CALCULATE COORDINATES CORRECTLY ---
    const targetZone = BODY_PART_ZONES.find(z => z.id === symbol.correctZone);
    
    // Default to 50% if not found
    let tTop = targetZone?.position?.top || '50%';
    let tLeft = targetZone?.position?.left;
  
    // Fix: If zone uses 'right' instead of 'left', calculate the left position
    if (!tLeft && targetZone?.position?.right) {
       tLeft = `calc(100% - ${targetZone.position.right})`; 
    }
    // Fallback
    if (!tLeft) tLeft = '50%'; 
  
    console.log(`✈️ Flying to: Top ${tTop}, Left ${tLeft}`); // Debug log
  
    setFlyingSymbol({
      image: symbol.image,
      targetTop: tTop,
      targetLeft: tLeft
    });
    // --------------------------------------------
  
    // 3. Wait for flight to finish (0.9s), THEN update game state
    safeSetTimeout(() => {
      // A. Trigger Ganesha Wiggle Reaction
      setGaneshaReaction('happy');
      safeSetTimeout(() => setGaneshaReaction(''), 800);
  
      // B. Clear Flying Symbol
      setFlyingSymbol(null);
  
      // C. ACTUAL LOGIC
      const newPlacedSymbols = {
        ...sceneState.placedSymbols,
        [symbol.id]: true
      };
      
      const placedCount = Object.keys(newPlacedSymbols).length;
      const percentage = Math.round((placedCount / 8) * 100);
      
      // Update state
      sceneActions.updateState({
        placedSymbols: newPlacedSymbols,
        showingAssociationCard: false,
        glowingZones: [],
        currentAssociationSymbol: null,
        stars: placedCount,
        progress: {
          percentage: percentage,
          starsEarned: placedCount,
          completed: placedCount === 8
        }
      });
      
      // Show sparkle celebration
      setShowSparkle(`symbol-placed-${symbol.id}`);
      safeSetTimeout(() => setShowSparkle(null), 2000);
      
      // Check completion
      if (placedCount === 8) {
        safeSetTimeout(() => triggerFinalCelebration(), 1500);
      } else {
        // Move to next round
        const nextRound = (sceneState.currentRound || 0) + 1;
        safeSetTimeout(() => {
          sceneActions.updateState({ currentRound: nextRound });
          safeSetTimeout(() => {
            playSound('pop'); 
            startNextRound(nextRound);
          }, 300);
        }, 1000); 
      }
    }, 900); // 0.9s delay matches the flight animation time
  };*/

  const handleCorrectPlacement = (symbol) => {
    if (!sceneState || !sceneActions) return;

    setCardPhase('feedback');
    setCelebrationZoneId(symbol.correctZone);
    playGlow();
    setTimeout(() => playTwinkle(), 450);
    setShowSparkle(`celebration-${symbol.id}`);
    safeSetTimeout(() => {
      setShowSparkle(null);
      setCelebrationZoneId(null);
    }, 1800);

    const newPlacedSymbols = {
      ...sceneState.placedSymbols,
      [symbol.id]: true
    };
    const count = Object.keys(newPlacedSymbols).length;
    const percentage = Math.round((count / 8) * 100);

    sceneActions.updateState({
      placedSymbols: newPlacedSymbols,
      showingAssociationCard: false,
      glowingZones: [],
      currentAssociationSymbol: null,
      stars: count,
      progress: { percentage, starsEarned: count, completed: count === 8 }
    });

    if (count === 8) {
      safeSetTimeout(() => triggerFinalCelebration(), 1500);
    } else {
      const nextRound = (sceneState.currentRound || 0) + 1;
      safeSetTimeout(() => {
        sceneActions.updateState({ currentRound: nextRound });
        setCardPhase('hidden');
        safeSetTimeout(() => startNextRound(nextRound), 300);
      }, 1200);
    }
  };

  // NEW: Handle wrong placement
  const handleWrongPlacement = (clickedZoneId) => {
    if (!sceneState || !sceneActions) return;

    const newWrongAttempts = (sceneState.wrongAttempts || 0) + 1;
    // Show shake animation on wrong zone
    setShowSparkle(`wrong-zone-${clickedZoneId}`);
    safeSetTimeout(() => setShowSparkle(null), 800);

    // Update wrong attempts count
    sceneActions.updateState({
      wrongAttempts: newWrongAttempts
    });

    // Progressive hint disabled in this scene.
  };


  // COMMENTED OUT: Auto-welcome trigger
  /*
  useEffect(() => {
    if (sceneState?.phase === 'initial' && 
        !sceneState?.welcomeShown && 
        !sceneState?.isReloadingGameCoach) {
      
      safeSetTimeout(() => {
        setShowSparkle('divine-light');
        
        safeSetTimeout(() => {
          setShowSparkle(null);
          sceneActions.updateState({ 
            welcomeShown: true,
            phase: 'initial'
          });
        }, 1800);
      }, 500);
    }
  }, [sceneState?.phase, sceneState?.welcomeShown]);
  */

  useEffect(() => {
    if (!isReload || !sceneState) return;

    if (sceneState.showingZoneCompletion || sceneState.celebrationActive) {
      setIsOrbsRunning(true);
      setShowSparkle('final-fireworks');
      setTimeout(() => {
        setShowZoneCompletion(true);
      }, 500);
    }
    else {
      sceneActions.updateState({ isReloadingGameCoach: false });
    }
  }, [isReload]);

  // RESUME — runs once on mount, handles returning mid-game
  useEffect(() => {
    if (!sceneState?.welcomeShown) return; // first-time player, OpeningModal handles it

    const placed = Object.keys(sceneState.placedSymbols || {}).length;

    // Already finished — restore completion screen
    if (placed === 8 || sceneState.phase === 'complete') {
      setTimeout(() => setShowSceneCompletion(true), 500);
      return;
    }

    // Was mid-round when they left — clear the stale card state first
    if (sceneState.currentAssociationSymbol) {
      sceneActions.updateState({
        currentAssociationSymbol: null,
        glowingZones: [],
        showingAssociationCard: false,
      });
    }

    // Resume from the correct round (e.g. round 2 = 3rd card)
    const resumeRound = sceneState.currentRound || 0;

    // Round 0 with nothing placed = start-first-round useEffect handles it naturally.
    // Only explicitly jump to a round when we're genuinely mid-game.
    if (resumeRound > 0 || placed > 0) {
      setTimeout(() => startNextRound(resumeRound), 700);
    }

  }, []); // empty dep — runs exactly once on mount

  const getGaneshaOpacity = () => {
    const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
    // Keep Ganesha visible from the start; still brighten as symbols are placed.
    if (placedCount === 0) return 0.28;
    if (placedCount <= 2) return 0.45;
    if (placedCount <= 4) return 0.62;
    if (placedCount <= 6) return 0.78;
    if (placedCount === 7) return 0.85;
    return 1;
  };

  const getGaneshaAwakeningClass = () => {
    const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
    if (placedCount === 0) return 'sleeping';
    if (placedCount <= 2) return 'stirring';
    if (placedCount <= 4) return 'awakening';
    if (placedCount <= 6) return 'rising';
    if (placedCount === 7) return 'manifesting';
    return 'divine-radiance';
  };

  const triggerFinalCelebration = () => {
    clearAllTimeouts();

    const profileId = localStorage.getItem('activeProfileId');

    sceneActions.updateState({
      currentPopup: 'final_fireworks',
      showingCompletionScreen: true,
      showingZoneCompletion: true,
      celebrationActive: true,
      phase: 'complete',
      stars: 8,
      completed: true,
      selectedSymbol: null,
      highlightedZone: null,
      placementAnimation: null,
      progress: {
        percentage: 100,
        starsEarned: 8,
        completed: true
      }
    });

    setIsOrbsRunning(true);
    setShowSparkle('final-fireworks');
  };

  const playFinalCompletionVo = () => {
    if (finalVoPlayedRef.current) return;
    finalVoPlayedRef.current = true;

    playSceneVoice('finalYouFoundAll', () => {
      setTimeout(() => {
        playSceneVoice('finalNowComplete', () => {
          setTimeout(() => {
            playSceneVoice('finalAlwaysWithYou', null, { replayOnReturn: false });
          }, 700);
        }, { replayOnReturn: false });
      }, 700);
    }, { replayOnReturn: false });
  };

  const handleSymbolPlacement = ({ id, zone, data }) => {
    if (!sceneState || !sceneActions) return;

    // Progressive hint disabled in this scene.

    clearAllTimeouts();

    const newPlacedSymbols = {
      ...sceneState.placedSymbols,
      [id]: true
    };

    const placedCount = Object.keys(newPlacedSymbols).length;
    const percentage = Math.round((placedCount / 8) * 100);

    let newGaneshaState = GANESHA_STATES.STONE;
    if (placedCount >= 6) newGaneshaState = GANESHA_STATES.DIVINE;
    else if (placedCount >= 3) newGaneshaState = GANESHA_STATES.AWAKENING;

    sceneActions.updateState({
      placedSymbols: newPlacedSymbols,
      ganeshaState: newGaneshaState,
      selectedSymbol: null,
      highlightedZone: null,
      placementAnimation: null,
      stars: placedCount,
      progress: {
        percentage: percentage,
        starsEarned: placedCount,
        completed: placedCount === 8
      }
    });

    setShowSparkle(`symbol-placed-${id}`);
    safeSetTimeout(() => setShowSparkle(null), 2000);

    if (placedCount === 3) {
      setShowSparkle('divine-light');
      safeSetTimeout(() => {
        setShowSparkle(null);
        sceneActions.updateState({
          readyForWisdom: true,
          phase: 'awakening'
        });
      }, 1800);

    } else if (placedCount === 8) {
      setShowSparkle('divine-light');
      safeSetTimeout(() => {
        setShowSparkle(null);
        triggerFinalCelebration(); // Trigger celebration directly instead of waiting for coach
      }, 1800);
    }
  };

  // Progressive hint disabled in this scene.

  if (!sceneState) {
    return <div className="loading">Loading sacred assembly...</div>;
  }

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager
        messages={[]}
        sceneState={sceneState}
        sceneActions={sceneActions}
      >
        <div className="sacred-assembly-container">
          <HomeButton onNavigate={onNavigate} />
          <ZoneBadgeButton zoneId="symbol-mountain" onBack={() => onNavigate?.('zone-welcome')} />
          <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />

          <OpeningModal
            zoneId={zoneId}
            sceneId={sceneId}
            isOpen={!sceneState.welcomeShown}
            onStart={() => {
              sceneActions.updateState({ welcomeShown: true });
            }}
            characterImg={ganeshaDivine}
            showButton={true}
          />

          {/* HEARTS PROGRESS BAR */}
          {sceneState.welcomeShown && (
            <div className="hearts-progress-container">
              <div className="hearts-row">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
                  const isCompleted = Object.keys(sceneState.placedSymbols || {}).length > index;
                  const isJustCompleted = Object.keys(sceneState.placedSymbols || {}).length - 1 === index;

                  return (
                    <div
                      key={`heart-${index}`}
                      className={`progress-heart ${isCompleted ? 'filled' : 'empty'} ${isJustCompleted ? 'just-completed' : ''}`}
                    >
                      💜
                      {isJustCompleted && (
                        <div className="heart-sparkle-burst">
                          <SparkleAnimation
                            type="star"
                            count={8}
                            color="#8A2BE2"
                            size={4}
                            duration={1000}
                            fadeOut={true}
                            area="contained"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="progress-text">
                {Object.keys(sceneState.placedSymbols || {}).length}/8 Symbols Awakened
              </div>
            </div>
          )}

          {/* CREAM SYMBOL CARD — slides right before zones appear */}
          {sceneState?.currentAssociationSymbol && cardPhase !== 'hidden' && (() => {
            const sym = SACRED_SYMBOLS.find(s => s.id === sceneState.currentAssociationSymbol);
            const isFlippedCard = ['flipped', 'side', 'play', 'feedback'].includes(cardPhase);
            return (
              <div
                className={[
                  'symbol-card-container',
                  cardPhase !== 'hidden' ? 'visible' : '',
                  (cardPhase === 'side' || cardPhase === 'play' || cardPhase === 'feedback') ? 'to-side' : ''
                ].filter(Boolean).join(' ')}
              >
                <div className={`symbol-card ${isFlippedCard ? 'flip' : ''}`}>
                  <div className="symbol-card-face symbol-card-front">
                    <img src={sym?.image} alt={sym?.name} className="symbol-card-image" />
                  </div>
                  <div className="symbol-card-face symbol-card-back">
                    <div className="symbol-title">{sym?.name}</div>
                    <div className="symbol-text">{sym?.associationText}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Guide arrow — points from card to Ganesha */}
          {cardPhase === 'play' && (
            <div className="guide-arrow">👉</div>
          )}

          {/* SimpleGameCoach COMMENTED OUT 
          <SimpleGameCoach
            config={{...}}
            sceneState={sceneState}
            sceneActions={sceneActions}
            profileName={profileName}
          />
          */}

          {/* Sacred Mountain Background */}
          <div
            className="sacred-background"
            style={{ backgroundImage: `url(${sacredBackground})` }}
          >
            {/* Progress Display */}
            <div className="assembly-progress">
              <div className="progress-text">
                <span style={{ fontSize: '16px' }}>🏔️</span>
                {Object.keys(sceneState.placedSymbols || {}).length}/8 symbols
              </div>
              <div
                className="assembly-progress-fill"
                style={{
                  width: `${(Object.keys(sceneState.placedSymbols || {}).length / 8) * 100}%`
                }}
              />
            </div>

            {/* Ganesha — ganesha-sit.svg with click zones */}
            <div
              className={`ganesha-assembly-container ${ganeshaReaction}`}
            >
              {/* Ganesha inline SVG — zones glow via CSS, opacity grows as symbols placed */}
              <GaneshaIllustration
                zoneStates={zoneStates}
                onZoneClick={handleZoneClick}
                activeZoneId={activeTargetZoneId}
                baseOpacity={getGaneshaOpacity()}
              />

              {/* Hint glow + tap pointer — pure divs on top, never touches SVG */}
              {Object.entries(zoneStates).map(([zoneId, state]) => {
                if (state !== 'hint') return null;
                const pos = ZONE_HINT_POSITIONS[zoneId];
                if (!pos) return null;
                return (
                  <React.Fragment key={`hint-${zoneId}`}>
                    <div
                      className="zone-hint-overlay"
                      style={{ top: pos.top, left: pos.left }}
                    />
                    <div
                      className="zone-hint-pointer"
                      style={{ top: pos.top, left: pos.left }}
                      aria-hidden="true"
                    >
                      👆
                    </div>
                  </React.Fragment>
                );
              })}

              {/* Wrong Click Feedback */}
              {showSparkle?.startsWith('wrong-zone-') && (
                <div className="wrong-zone-feedback">
                  <p className="try-again-text">Try again!</p>
                </div>
              )}

              {showSparkle?.startsWith('celebration-') && celebrationZoneId && (
                <div
                  className="soft-celebration-cluster"
                  style={ZONE_SPARKLE_POSITIONS[celebrationZoneId]}
                >
                  <SparkleAnimation
                    type="star"
                    count={15}
                    color="#ffd700"
                    size={10}
                    duration={1500}
                    fadeOut={true}
                    area="full"
                  />
                  <SparkleAnimation
                    type="magic"
                    count={10}
                    color="#fff1b3"
                    size={8}
                    duration={1400}
                    fadeOut={true}
                    area="full"
                  />
                </div>
              )}
              {/* CORRECT ANSWER CELEBRATION (global burst disabled; using local sparkles only) */}

              {/* Placed Symbol Sparkles */}
              {Object.keys(sceneState.placedSymbols || {}).map(symbolId => {
                const zone = BODY_PART_ZONES.find(z => z.acceptTypes.includes(symbolId));
                if (sceneState?.masteryShown) return null;

                return (
                  <div
                    key={`sparkle-${symbolId}`}
                    className="placed-symbol-sparkle"
                    style={{
                      position: 'absolute',
                      ...zone.position,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                      zIndex: 60
                    }}
                  >
                    <SparkleAnimation
                      type="star"
                      count={8}
                      color={SACRED_COLOR_PALETTE.primary}
                      size={4}
                      duration={3000}
                      fadeOut={false}
                      area="contained"
                      key={`sparkle-${symbolId}-${Date.now()}`}
                    />
                  </div>
                );
              })}
            </div>



            {/* Symbol placement sparkles */}
            {showSparkle?.startsWith('symbol-placed-') && (
              <div className="symbol-placement-sparkles">
                <SparkleAnimation
                  type="star"
                  count={20}
                  color={SACRED_COLOR_PALETTE.primary}
                  size={8}
                  duration={2000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Divine firefly light */}
            {showSparkle === 'divine-light' && (
              <div style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '400px',
                height: '200px',
                zIndex: 199,
                pointerEvents: 'none'
              }}>
                <SparkleAnimation
                  type="glitter"
                  count={80}
                  color={SACRED_COLOR_PALETTE.divine}
                  size={3}
                  duration={2000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Sacred Orbs Effect */}
            {showSparkle === 'final-fireworks' && (
              <>
                <ZoneCompletionFireworks
                  show={true}
                  burstsPerWave={5}
                  particles={24}
                  radius={140}
                  duration={2600}
                />
                <RotatingOrbsEffect
                  show={true}
                  duration={9000}
                  symbolImages={{
                    mooshika: symbolMooshikaColored,
                    modak: symbolModakColored,
                    belly: symbolBellyColored,
                    lotus: symbolLotusColored,
                    trunk: symbolTrunkColored,
                    eyes: symbolEyesColored,
                    ears: symbolEarsColored,
                    tusk: symbolTuskColored
                  }}
                  ganeshaImage={ganeshaDivine}
                  playerName={profileName}
                  orbitCenter={{ top: '58%', left: '50%' }}
                  orbSize={430}
                  orbRadius={165}
                  showCentralGanesha={false}
                  showBuiltInFireworks={false}
                  onComplete={() => {
                    setShowSparkle(null);
                    setIsOrbsRunning(false);
                    playFinalCompletionVo();

                    const profileId = localStorage.getItem('activeProfileId');
                    if (profileId) {
                      GameStateManager.saveGameState('symbol-mountain', 'final-scene', {
                        completed: true,
                        stars: 8,
                        symbols: { all: true },
                        phase: 'complete',
                        timestamp: Date.now()
                      });

                      ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'final-scene', {
                        completed: true,
                        stars: 8,
                        symbols: { all: true }
                      });

                      localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_final-scene`);
                      SimpleSceneManager.clearCurrentScene();
                    }

                    setShowSceneCompletion(true);
                  }}
                />
              </>
            )}

            {false && <div style={{
              position: 'fixed',
              top: '40px',
              right: '40px',
              zIndex: 9999,
              background: 'purple',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }} onClick={() => {
              clearAllTimeouts();
              setShowSparkle(null);
              setShowMagicalCard(false);
              setShowSceneCompletion(false);
              setIsOrbsRunning(false);
              
              const allPlaced = {};
              SACRED_SYMBOLS.forEach(symbol => {
                allPlaced[symbol.id] = true;
              });
              
              sceneActions.updateState({
                placedSymbols: allPlaced,
                ganeshaState: GANESHA_STATES.DIVINE,
                phase: 'complete',
                completed: true,
                stars: 8,
                selectedSymbol: null,
                highlightedZone: null,
                placementAnimation: null,
                progress: {
                  percentage: 100,
                  starsEarned: 8,
                  completed: true
                },
                welcomeShown: true,
                assemblyWisdomShown: true,
                masteryShown: false,
                readyForWisdom: false,
                gameCoachState: null,
                isReloadingGameCoach: false
              });
              
              triggerFinalCelebration();
            }}>
              COMPLETE V8
            </div>}

            {false && (
            <div style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 9999,
              background: '#FF4444',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(255, 68, 68, 0.3)',
              border: '2px solid white'
            }} onClick={() => {
              if (confirm('Start this scene from the beginning? You will lose current progress.')) {
                clearAllTimeouts();
                setShowSparkle(null);
                setShowMagicalCard(false);
                setShowSceneCompletion(false);
                setShowZoneCompletion(false);
                setIsOrbsRunning(false);

                setTimeout(() => {
                  sceneActions.updateState({
                    placedSymbols: {},
                    ganeshaState: GANESHA_STATES.STONE,
                    selectedSymbol: null,
                    highlightedZone: null,
                    placementAnimation: null,
                    phase: 'initial',
                    currentFocus: 'assembly',
                    currentPopup: null,
                    showingCompletionScreen: false,
                    showingZoneCompletion: false,
                    celebrationActive: false,
                    welcomeShown: false,
                    assemblyWisdomShown: false,
                    masteryShown: false,
                    readyForWisdom: false,
                    gameCoachState: null,
                    lastGameCoachTime: 0,
                    isReloadingGameCoach: false,
                    stars: 0,
                    completed: false,
                    progress: {
                      percentage: 0,
                      starsEarned: 0,
                      completed: false
                    }
                  });
                }, 100);
              }
            }}>
              🔄 Start Fresh
            </div>)}
          </div>

          {/* ProgressiveHintSystem disabled in this scene */}

          {/* 3-2-1 resume countdown on tab return */}
          <ResumeCountdown value={countdownValue} />

          {false && (
            <TocaBocaNav
              onHome={() => {
                setTimeout(() => onNavigate?.('home'), 100);
              }}
              onProgress={() => {
                setShowCulturalCelebration(true);
              }}
              onHelp={() => console.log('Show help')}
              onParentMenu={() => console.log('Parent menu')}
              isAudioOn={isAudioOn}
              onAudioToggle={toggleAudio}
              onZonesClick={() => {
                setTimeout(() => onNavigate?.('zones'), 100);
              }}
              onStartFresh={() => resetScene()}
              currentProgress={{
                stars: sceneState.stars || 0,
                completed: sceneState.completed ? 1 : 0,
                total: 1
              }}
            />
          )}

          {/* Scene Completion */}
          <SceneCompletionCelebration
            show={showSceneCompletion}
            sceneName="Symbol Mountain"
            completionTitle={completionModalContent?.title}
            completionSubtitle={completionModalContent?.subtitle}
            sceneNumber={4}
            totalScenes={4}
            starsEarned={8}
            totalStars={8}
            discoveredSymbols={[]}
            symbolImages={{}}
            badgeImage="/images/zones/symbol-mountain/assembly-icon.png"
            sceneId="final-scene"
            completionData={{
              stars: 8,
              symbols: {
                mooshika: true, lotus: true, trunk: true, eyes: true,
                ears: true, tusk: true, modak: true, belly: true
              },
              completed: true,
              totalStars: 8
            }}
            onComplete={onComplete}
            childName={profileName}
            isFinalScene={true}
            hideGanesha={true}

            onExploreZones={() => {
              setShowSceneCompletion(false);
              onNavigate?.('zones');
            }}
            onHome={() => {
              setShowSceneCompletion(false);
              onNavigate?.('zone-welcome');
            }}
            onReplay={() => {
              setShowSceneCompletion(false);
              resetScene();
            }}
          />

          {/* Cultural Celebration Modal */}
          <CulturalCelebrationModal
            show={showCulturalCelebration}
            onClose={() => setShowCulturalCelebration(false)}
          />
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default SacredAssemblyScene;
