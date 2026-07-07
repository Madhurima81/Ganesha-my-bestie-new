// zones/symbol-mountain/scenes/final-scene/SacredAssemblyScene.jsx - V8 DIVINE VERSION
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './SacredAssemblyScene.css';
import { GANESHA_ZONES } from '../../../ganeshaZones';
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
import VOReplayButton from '../../../../lib/components/feedback/VOReplayButton';
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
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import OpeningModal from '../../../shared/components/OpeningModal';
import GaneshaIllustration from './GaneshaIllustration';

import useSceneReset from '../../../../lib/hooks/useSceneReset';
import useAppVisibility from '../../../../lib/hooks/useAppVisibility';
import useResumeCountdown from '../../../../lib/hooks/useResumeCountdown';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';
import ResumeCountdown from '../../../../lib/components/feedback/ResumeCountdown';

// Images - Background
import sacredBackground from './assets/images/final_symbol_background.webp';

// Images - Ganesha Forms
import ganeshaStone from './assets/images/ganesha-stone.webp';
import ganeshaDivine from './assets/images/ganesha-divine.webp';
import purpleHeart from './assets/images/purple-heart.svg';

// Images - Symbol Icons
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-new.webp';
import symbolModakColored from '../../shared/images/icons/symbol-modak-new.webp';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-new.webp';
import symbolLotusColored from '../../shared/images/icons/symbol-lotus-new.webp';
import symbolTrunkColored from '../../shared/images/icons/symbol-trunk-new.webp';
import symbolEyesColored from '../../shared/images/icons/symbol-eyes-new.webp';
import symbolEarsColored from '../../shared/images/icons/symbol-ears-new.webp';
import symbolTuskColored from '../../shared/images/icons/broken-tusk-symbol.webp';

// Body Part Overlays - ADD THESE
import ganeshaFaded from './assets/images/ganesha-faded.webp';
import ganeshaEyes from './assets/images/ganesha-eyes-colored.webp';
import ganeshaEars from './assets/images/ganesha-ears-colored.webp';
import ganeshaTrunk from './assets/images/ganesha-trunk-colored.webp';
import ganeshaTusk from './assets/images/ganesha-tusk-colored.webp';
import ganeshaLeftHand from './assets/images/ganesha-left-hand-colored.webp';
import ganeshaRightHand from './assets/images/ganesha-right-hand-colored.webp';
import ganeshaBelly from './assets/images/ganesha-belly-colored.webp';
import ganeshaBase from './assets/images/ganesha-mouse-colored.webp';

// Association Icons (create placeholder icons for now, or use emojis)
// We'll use simple colored circles as placeholders - you can replace with actual icons later

// Coach image (for hints only)
// import mooshikaCoach from "../pond/assets/images/mooshika-coach.webp";

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
const iconTarget = '??';
const iconHeadphones = '??';
const iconRoadblock = '??';
const iconHammer = '??';
const iconHoney = '??';
const iconLightbulb = '??';
const iconUniverse = '??';
const iconPath = '???';
const BELLY_CARD_IMAGE_FALLBACK = '/images/icons/symbol-belly-new.webp';

// Sacred Assembly Game Configuration
const SACRED_SYMBOLS = [
  {
    id: 'eyes',
    name: 'Eyes',
    emoji: '???',
    image: symbolEyesColored,
    associationIcon: iconTarget,
    associationText: "I see clearly.",
    bodyPartImage: ganeshaEyes,
    blessing: "Ganesha's divine eyes awaken! May you see truth in all things.",
    bodyPart: 'eyes',
    correctZone: 'eyes',
    wrongZones: ['belly', 'base', 'left-hand', 'trunk']
  },
  {
    id: 'ears',
    name: 'Ears',
    emoji: '??',
    image: symbolEarsColored,
    associationIcon: iconHeadphones,
    associationText: "I listen with care.",
    bodyPartImage: ganeshaEars,
    blessing: "Ganesha's sacred ears come alive! May you listen with wisdom and compassion.",
    bodyPart: 'ears',
    correctZone: 'ears',
    wrongZones: ['trunk', 'right-hand', 'base', 'tusk']
  },
  {
    id: 'trunk',
    name: 'Trunk',
    emoji: '??',
    image: symbolTrunkColored,
    associationIcon: iconRoadblock,
    associationText: "I find my way.",
    bodyPartImage: ganeshaTrunk,
    blessing: "Ganesha's mighty trunk awakens! May all obstacles be removed from your path.",
    bodyPart: 'trunk',
    correctZone: 'trunk',
    wrongZones: ['eyes', 'belly', 'right-hand', 'base']
  },
  {
    id: 'tusk',
    name: 'Tusk',
    emoji: '??',
    image: symbolTuskColored,
    associationIcon: iconHammer,
    associationText: "I finish what I start.",
    bodyPartImage: ganeshaTusk,
    blessing: "Ganesha's powerful tusk glows! May you break through any challenge with determination.",
    bodyPart: 'tusk',
    correctZone: 'tusk',
    wrongZones: ['ears', 'left-hand', 'belly', 'trunk']
  },
  {
    id: 'modak',
    name: 'Modak',
    emoji: '??',
    image: symbolModakColored,
    associationIcon: iconHoney,
    associationText: "I am full of joy.",
    bodyPartImage: ganeshaLeftHand,
    blessing: "Ganesha's blessing hand awakens! May sweetness and abundance fill your life.",
    bodyPart: 'left-hand',
    correctZone: 'left-hand',
    wrongZones: ['right-hand', 'ears', 'base', 'belly']
  },
  {
    id: 'lotus',
    name: 'Lotus',
    emoji: '??',
    image: symbolLotusColored,
    associationIcon: iconLightbulb,
    associationText: "I stay calm.",
    bodyPartImage: ganeshaRightHand,
    blessing: "Ganesha's wisdom hand comes alive! May purity and enlightenment guide you.",
    bodyPart: 'right-hand',
    correctZone: 'right-hand',
    wrongZones: ['left-hand', 'trunk', 'tusk', 'eyes']
  },
  {
    id: 'belly',
    name: 'Belly',
    emoji: '??',
    image: symbolBellyColored,
    associationIcon: iconUniverse,
    associationText: "I feel good inside.",
    bodyPartImage: ganeshaBelly,
    blessing: "Ganesha's sacred belly awakens! May you hold the universe's love within you.",
    bodyPart: 'belly',
    correctZone: 'belly',
    wrongZones: ['trunk', 'eyes', 'left-hand', 'right-hand']
  },
  {
    id: 'mooshika',
    name: 'Mooshika',
    emoji: '??',
    image: symbolMooshikaColored,
    associationIcon: iconPath,
    associationText: "I can focus.",
    bodyPartImage: ganeshaBase,
    blessing: "Mooshika, Ganesha's divine vehicle awakens! May wisdom guide your every journey, dear child.",
    bodyPart: 'base',
    correctZone: 'base',
    wrongZones: ['belly', 'trunk', 'ears', 'eyes']
  }
];


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
const NEXT_CARD_BREATHING_DELAY_MS = 2400;     // was 3000
const VO_CHECK_INTERVAL_MS = 200;
const VO_WAIT_MAX_MS = 4000;                   // was 3200 � allow longer VO
const POST_VO_GRACE_MS = 600;                  // was 800
const PLACEMENT_SETTLE_MS = 1200;              // NEW � "look at what you did" beat

// Body part drop zone configurations � import from shared config
const BODY_PART_ZONES = GANESHA_ZONES;

// Keep glow/sparkle anchors in sync with real drop zones so highlights never drift.
const getPx = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  if (!value.endsWith('px')) return fallback;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

const getZoneCenter = (zone) => {
  const { position } = zone;
  const widthPx = getPx(position.width, 120);
  const heightPx = getPx(position.height, 120);
  const halfW = Math.round(widthPx / 2);
  const halfH = Math.round(heightPx / 2);

  // Detect centering transforms � when present, the anchor IS the center.
  const transformStr = position.transform || '';
  const isCenteredX = /translateX\(-50%\)|translate\(-50%/.test(transformStr);
  const isCenteredY = /translateY\(-50%\)|translate\([^,]+,\s*-50%/.test(transformStr);

  const left = position.left
    ? (isCenteredX ? position.left : `calc(${position.left} + ${halfW}px)`)
    : position.right
      ? (isCenteredX ? `calc(100% - ${position.right})` : `calc(100% - ${position.right} - ${halfW}px)`)
      : '50%';

  const top = position.top
    ? (isCenteredY ? position.top : `calc(${position.top} + ${halfH}px)`)
    : position.bottom
      ? (isCenteredY ? `calc(100% - ${position.bottom})` : `calc(100% - ${position.bottom} - ${halfH}px)`)
      : '50%';

  return { top, left, widthPx, heightPx };
};

const ZONE_HINT_POSITIONS = BODY_PART_ZONES.reduce((acc, zone) => {
  const center = getZoneCenter(zone);
  acc[zone.id] = { top: center.top, left: center.left };
  return acc;
}, {});

const ZONE_SPARKLE_POSITIONS = BODY_PART_ZONES.reduce((acc, zone) => {
  const center = getZoneCenter(zone);
  acc[zone.id] = {
    top: center.top,
    left: center.left,
    width: `${Math.max(center.widthPx + 40, 100)}px`,
    height: `${Math.max(center.heightPx + 40, 100)}px`
  };
  return acc;
}, {});

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

function SymbolFlipCard({ name, associationText, image, flipped, imageFallback }) {
  const [currentImage, setCurrentImage] = useState(image || imageFallback || '');

  useEffect(() => {
    setCurrentImage(image || imageFallback || '');
  }, [image, imageFallback]);

  const wrapperStyle = {
    perspective: '1200px',
    WebkitPerspective: '1200px',
    width: '230px',
    height: '245px',
    transformStyle: 'preserve-3d',
    WebkitTransformStyle: 'preserve-3d'
  };

  const cardStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    willChange: 'transform, opacity',
    isolation: 'isolate'
  };

  const faceStyle = {
    position: 'absolute',
    inset: 0,
    borderRadius: '26px',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    background: 'linear-gradient(180deg, #fff8ea 0%, #f7ecd4 100%)',
    border: '3px solid rgba(255, 255, 255, 0.92)',
    boxShadow: '0 18px 40px rgba(95, 63, 20, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '18px',
    textAlign: 'center',
    gap: '12px',
    transformOrigin: 'center center',
    transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s ease',
    willChange: 'transform, opacity'
  };

  const imageStyle = {
    width: '130px',
    height: 'auto',
    objectFit: 'contain',
    display: 'block',
    filter: 'drop-shadow(0 8px 20px rgba(255, 190, 84, 0.35))'
  };

  const titleStyle = {
    fontFamily: "'Baloo 2', cursive",
    fontSize: '24px',
    fontWeight: 700,
    color: '#5A3B1E'
  };

  const textStyle = {
    fontFamily: "'Nunito', sans-serif",
    fontSize: '18px',
    fontWeight: 700,
    color: '#6B4F2A',
    lineHeight: 1.5
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <div
          style={{
            ...faceStyle,
            opacity: flipped ? 0 : 1,
            transform: flipped ? 'rotateY(-90deg) scale(0.98)' : 'rotateY(0deg) scale(1)',
            pointerEvents: flipped ? 'none' : 'auto'
          }}
        >
          <div style={titleStyle}>{name}</div>
          <div style={textStyle}>{associationText}</div>
        </div>
        <div
          style={{
            ...faceStyle,
            opacity: flipped ? 1 : 0,
            transform: flipped ? 'rotateY(0deg) scale(1)' : 'rotateY(90deg) scale(0.98)',
            pointerEvents: flipped ? 'auto' : 'none'
          }}
        >
          {currentImage ? (
            <img
              src={currentImage}
              alt=""
              style={imageStyle}
              onError={() => {
                if (imageFallback && currentImage !== imageFallback) {
                  setCurrentImage(imageFallback);
                  return;
                }
                setCurrentImage('');
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

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
  const isDevBuild = process.env.NODE_ENV !== 'production';
  const [showSparkle, setShowSparkle] = useState(null);
  const [cardContent, setCardContent] = useState({});
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [sceneCompleteVOFinished, setSceneCompleteVOFinished] = useState(false);
  const [fireworksFinished, setFireworksFinished] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [showZoneCompletion, setShowZoneCompletion] = useState(false);
  // const [hintUsed, setHintUsed] = useState(false);
  const [isOrbsRunning, setIsOrbsRunning] = useState(false);
  const [celebrationZoneId, setCelebrationZoneId] = useState(null);
  const [hideProgressBar, setHideProgressBar] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(() =>
    typeof document === 'undefined' ? true : !document.hidden
  );
  const [showHintDebug, setShowHintDebug] = useState(false);
  const [selectedHintDebugZone, setSelectedHintDebugZone] = useState(null);
  const completionModalContent = getCompletionModal(zoneId, sceneId);
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const {
    speak: speakGanesha,
    stop: stopGaneshaVoice,
    isSpeaking: isGaneshaSpeaking
  } = useGaneshaVoice();
  const {
    playSparkle,
    setGlobalVolume
  } = useGameSounds();
  // -- T08/T09: visibility + idle timer infrastructure --------------------------
  const { startIdleTimer, stopIdleTimer, setCurrentPhase, startMusic, stopMusic, setVoiceVolume, playVoice, playTap, playCorrect, playWrong, playPowerUnlock, playCelebration } = useVoiceGuidance(
    zoneId, sceneId, { enableMusic: true, musicVolume: 0.06, sfxVolume: 0.7, idleTimeout: 20 }
  );
  const playUiTap = playTap;
  const playWrongTap = playWrong;
  const playChime = playCorrect;
  const playGlow = playPowerUnlock;
  const playTwinkle = playCelebration;
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
  const currentAssociationSymbol = useMemo(
    () => SACRED_SYMBOLS.find((s) => s.id === sceneState?.currentAssociationSymbol),
    [sceneState?.currentAssociationSymbol]
  );
  const zoneDebugLabels = useMemo(() => {
    const labels = {};
    BODY_PART_ZONES.forEach((zone) => {
      const matchingSymbol = SACRED_SYMBOLS.find((symbol) => symbol.correctZone === zone.id);
      labels[zone.id] = matchingSymbol?.name || zone.id;
    });
    return labels;
  }, []);

  const [cardPhase, setCardPhase] = useState('hidden'); // 'hidden' | 'appear' | 'flipped' | 'side' | 'play' | 'feedback'
  const [flyingSymbol, setFlyingSymbol] = useState(null);
  const [ganeshaReaction, setGaneshaReaction] = useState('');
  const devPhaseIndexRef = useRef(0);
  const resumeHandledRef = useRef(false);
  const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
  const isSceneCompletedState =
    placedCount === 8 ||
    sceneState?.completed === true ||
    sceneState?.phase === 'complete';
  const isCelebrationRunning =
    showSparkle === 'final-fireworks' ||
    isOrbsRunning ||
    sceneState?.showingZoneCompletion === true ||
    sceneState?.celebrationActive === true;
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
  const firstSymbolMilestoneVoPlayedRef = useRef(false);
  const midProgressMilestoneVoPlayedRef = useRef(false);
  const wasAudioOnRef = useRef(isAudioOn);

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
  const HINT_VO_MAP = useMemo(() => ({
    eyes: 'hintEyes',
    ears: 'hintEars',
    trunk: 'hintTrunk',
    tusk: 'hintTusk',
    modak: 'hintModak',
    lotus: 'hintLotus',
    belly: 'hintBelly',
    mooshika: 'hintMooshika'
  }), []);
  const getMomentForVoiceKey = useCallback((key) => {
    if (key === 'openingModalPrompt') return 'greeting';
    if (key === 'firstSymbolPlaced' || key === 'midProgressWonder') return 'celebration';
    if (key.startsWith('wrong') || key.startsWith('hint') || key.startsWith('onboarding')) return 'encouragement';
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
        const hintVoKey = HINT_VO_MAP[currentSymbolId];
        if (hintVoKey) playSceneVoice(hintVoKey, null, { replayOnReturn: false, auto: true });
      }
      return;
    }

    if (currentSymbolId && cardPhase === 'feedback') return;
  }, [
    CARD_VO_MAP,
    HINT_VO_MAP,
    cardPhase,
    isAudioOn,
    playSceneVoice,
    sceneState,
    showSceneCompletion,
    showSparkle
  ]);

  useEffect(() => {
    const wasAudioOn = wasAudioOnRef.current;
    wasAudioOnRef.current = isAudioOn;
    if (!wasAudioOn && isAudioOn) {
      replayVoiceForCurrentPhase();
    }
  }, [isAudioOn, replayVoiceForCurrentPhase]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useAppVisibility(
    () => {
      stopGaneshaVoice();
    },
    () => {
      replayVoiceForCurrentPhase();
    },
    { resumeDelay: RESUME_DELAY_MS }
  );

  // Zone state: idle | wrong | correct | placed | hint | hint-strong | hint-final
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

  // CARD PHASE TIMELINE � drives the card animation state machine
  useEffect(() => {
    if (!sceneState?.currentAssociationSymbol) return;
    if (!isPageVisible) return;
    const currentRound = sceneState?.currentRound || 0;
    const cardVoKey = CARD_VO_MAP[sceneState.currentAssociationSymbol];

    if (cardPhase === 'appear') {
      playChime();
      const t = safeSetTimeout(() => setCardPhase('flipped'), 2200);
      return () => clearTimeout(t);
    }

    if (cardPhase === 'flipped') {
      // No VO here � card is mid-flip, child can't read it yet
      playSparkle();
      const t = safeSetTimeout(() => setCardPhase('side'), 1100);
      return () => clearTimeout(t);
    }

    if (cardPhase === 'side') {
      // No VO here � card is still sliding. VO fires in 'play' once card has landed.
      playUiTap();
      const t = safeSetTimeout(() => setCardPhase('play'), 600);
      return () => clearTimeout(t);
    }
  }, [CARD_VO_MAP, cardPhase, isPageVisible, playChime, playSceneVoice, playSparkle, playUiTap, sceneState?.currentAssociationSymbol, sceneState?.currentRound]);

  // Play-phase VO sequence: card VO when card lands, then 3-level idle hint escalation
  useEffect(() => {
    if (cardPhase !== 'play') return;
    if (!isPageVisible) return;
    const currentSymbol = SACRED_SYMBOLS.find(s => s.id === sceneState?.currentAssociationSymbol);
    if (!currentSymbol) return;
    const correctZone = currentSymbol.correctZone;
    const cardVoKey = CARD_VO_MAP[currentSymbol.id];

    // Card VO � 2.5s after card lands, giving child time to look first
    // Guard prevents double-play if effect re-runs while still in 'play'
    const roundIndex = sceneState?.currentRound ?? -1;
    const ENTRY_VO_DELAY_MS = 2500;
    const cardVoTimer = safeSetTimeout(() => {
      if (cardVoKey && cardVoPlayedForRoundRef.current !== roundIndex) {
        cardVoPlayedForRoundRef.current = roundIndex;
        playSceneVoice(cardVoKey, null, { replayOnReturn: false });
      }
    }, ENTRY_VO_DELAY_MS);

    const hintLevel1Timer = safeSetTimeout(() => {
      setZoneStates(prev => {
        if (prev[correctZone] === 'idle') return { ...prev, [correctZone]: 'hint' };
        return prev;
      });
    }, ENTRY_VO_DELAY_MS + 10000);

    const hintLevel2Timer = safeSetTimeout(() => {
      setZoneStates(prev => {
        if (prev[correctZone] === 'hint' || prev[correctZone] === 'idle') {
          return { ...prev, [correctZone]: 'hint-strong' };
        }
        return prev;
      });
      if (!idleNudgePlayedRef.current) {
        const hintVoKey = HINT_VO_MAP[currentSymbol.id];
        if (hintVoKey) {
          playSceneVoice(hintVoKey, null, { replayOnReturn: false });
          idleNudgePlayedRef.current = true;
        }
      }
    }, ENTRY_VO_DELAY_MS + 18000);

    const hintLevel3Timer = safeSetTimeout(() => {
      setZoneStates(prev => {
        if (prev[correctZone] === 'hint-strong' || prev[correctZone] === 'hint' || prev[correctZone] === 'idle') {
          return { ...prev, [correctZone]: 'hint-final' };
        }
        return prev;
      });
    }, ENTRY_VO_DELAY_MS + 26000);

    return () => {
      clearTimeout(cardVoTimer);
      clearTimeout(hintLevel1Timer);
      clearTimeout(hintLevel2Timer);
      clearTimeout(hintLevel3Timer);
    };
  }, [cardPhase, HINT_VO_MAP, isPageVisible, sceneState?.currentAssociationSymbol]);

  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
  };

  const hardResetSceneState = useCallback(() => {
    clearAllTimeouts();
    stopGaneshaVoice();
    GameStateManager.clearSceneState('symbol-mountain', 'final-scene');

    const profileId = localStorage.getItem('activeProfileId');
    if (profileId) {
      localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_final-scene`);
      localStorage.removeItem(`${profileId}_symbol-mountain_final-scene_state`);
    }

    setShowSparkle(null);
    setCardContent({});
    setShowSceneCompletion(false);
    setShowCulturalCelebration(false);
    setShowZoneCompletion(false);
    setIsOrbsRunning(false);
    setCelebrationZoneId(null);
    setCardPhase('hidden');
    setFlyingSymbol(null);
    setGaneshaReaction('');
    setZoneStates(initZoneStates({}));

    onboardingPlayedRef.current = false;
    onboardingPlayedAtRef.current = 0;
    idleNudgePlayedRef.current = false;
    cardVoPlayedForRoundRef.current = -1;
    finalVoPlayedRef.current = false;
    openingModalVoPlayedRef.current = false;
    firstSymbolMilestoneVoPlayedRef.current = false;
    midProgressMilestoneVoPlayedRef.current = false;

    sceneActions.updateState({
      placedSymbols: {},
      ganeshaState: GANESHA_STATES.STONE,
      selectedSymbol: null,
      highlightedZone: null,
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
      onboardingPlayed: false,
      progress: {
        percentage: 0,
        starsEarned: 0,
        completed: false
      }
    });
  }, [sceneActions, stopGaneshaVoice]);

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
      firstSymbolMilestoneVoPlayedRef.current = false;
      midProgressMilestoneVoPlayedRef.current = false;
    }
  }, [sceneState?.welcomeShown, sceneState?.placedSymbols]);

  // Opening modal VO � plays when modal APPEARS, not when button is tapped
  useEffect(() => {
    if (sceneState?.welcomeShown) return;           // modal not showing
    if (openingModalVoPlayedRef.current) return;    // already played this session
    if (!isAudioOn) return;
    if (!isPageVisible) return;
    const t = safeSetTimeout(() => {
      const started = playSceneVoice('openingModalPrompt', null, { replayOnReturn: false });
      if (started) openingModalVoPlayedRef.current = true;
    }, 700); // wait for modal entrance animation to finish
    return () => clearTimeout(t);
  }, [isAudioOn, isPageVisible, playSceneVoice, sceneState?.welcomeShown]);

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
      audio.play().catch(() => {});
    } catch {}
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

      // Create array of all symbol IDs (should be exactly 8)
      const allSymbolIds = SACRED_SYMBOLS.map(s => s.id);

      // Fisher-Yates shuffle for better randomization
      const shuffledSymbols = [...allSymbolIds];
      for (let i = shuffledSymbols.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledSymbols[i], shuffledSymbols[j]] = [shuffledSymbols[j], shuffledSymbols[i]];
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
        // Round 0, first time � play onboarding VO, then start first card after it ends
        safeSetTimeout(() => {
          onboardingPlayedRef.current = true;
          sceneActions.updateState({ onboardingPlayed: true }); // persist so back+return skips onboarding
          playSceneVoice('onboardingTapRightPart', () => {
            safeSetTimeout(() => startNextRound(0), 400);
          }, { replayOnReturn: false });
        }, 600);
      } else {
        // Resume path � onboarding already played, start card directly
        safeSetTimeout(() => startNextRound(0), 500);
      }
    }
  }, [
    sceneState?.symbolQueue,
    sceneState?.currentRound,
    sceneState?.currentAssociationSymbol,
    sceneState?.showingAssociationCard,
    sceneState?.placedSymbols // <--- ADD THIS to the dependency array
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

  // Zone click � discovery system, no pre-highlights
  const handleZoneClick = (zoneId) => {
    if (!sceneState || !sceneActions) return;
    if (cardPhase !== 'play') return;

    setZoneStates(prev => {
      const next = { ...prev };
      let changed = false;
      Object.keys(next).forEach(z => {
        if (next[z] === 'hint' || next[z] === 'hint-strong' || next[z] === 'hint-final') {
          next[z] = 'idle';
          changed = true;
        }
      });
      return changed ? next : prev;
    });

    const currentSymbol = SACRED_SYMBOLS.find(s => s.id === sceneState.currentAssociationSymbol);
    if (!currentSymbol) return;

    const isCorrect = zoneId === currentSymbol.correctZone;

    if (isCorrect) {
      playUiTap();
      // correct ? pop animation ? then permanently placed
      setZoneStates(prev => ({ ...prev, [zoneId]: 'correct' }));
      safeSetTimeout(() => {
        setZoneStates(prev => ({ ...prev, [zoneId]: 'placed' }));
      }, 420);
      handleCorrectPlacement(currentSymbol);
    } else {
      playWrongTap();
      setGaneshaReaction('wrong');
      safeSetTimeout(() => setGaneshaReaction(''), 300);
      // wrong ? wiggle ? snap back to idle
      setZoneStates(prev => ({ ...prev, [zoneId]: 'wrong' }));
      safeSetTimeout(() => {
        setZoneStates(prev => (prev[zoneId] === 'wrong' ? { ...prev, [zoneId]: 'idle' } : prev));
      }, 320);
      handleWrongPlacement();
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
  
    console.log(`?? Flying to: Top ${tTop}, Left ${tLeft}`); // Debug log
  
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
    safeSetTimeout(() => playTwinkle(), 450);
    setShowSparkle(`celebration-${symbol.id}`);

    // Phase 1: sparkle burst (0�1.2s)
    safeSetTimeout(() => {
      setShowSparkle(null);
    }, 1200);

    // Phase 2: gentle settle glow on the placed body part (1.2s�2.4s)
    // Keep celebrationZoneId active longer so child's eyes land on Ganesha
    safeSetTimeout(() => {
      setCelebrationZoneId(null);
    }, PLACEMENT_SETTLE_MS * 2);

    const newPlacedSymbols = {
      ...sceneState.placedSymbols,
      [symbol.id]: true
    };
    const count = Object.keys(newPlacedSymbols).length;
    const percentage = Math.round((count / 8) * 100);

    if (count === 1 && !firstSymbolMilestoneVoPlayedRef.current) {
      firstSymbolMilestoneVoPlayedRef.current = true;
      playSceneVoice('firstSymbolPlaced', null, { replayOnReturn: false });
    } else if ((count === 4 || count === 5) && !midProgressMilestoneVoPlayedRef.current) {
      midProgressMilestoneVoPlayedRef.current = true;
      playSceneVoice('midProgressWonder', null, { replayOnReturn: false });
    }

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
      // Halfway breathing beat � once, after 4th symbol
      const isHalfwayMoment = count === 4;
      const extraHalfwayPause = isHalfwayMoment ? 1000 : 0;   // was 1500
      safeSetTimeout(() => {
        sceneActions.updateState({ currentRound: nextRound });
        setCardPhase('hidden');

        const waitForVoiceThenStart = (waitedMs = 0) => {
          // VO finished OR max wait hit ? add grace pause, THEN next card
          if (!isGaneshaSpeaking || waitedMs >= VO_WAIT_MAX_MS) {
            safeSetTimeout(() => {
              startNextRound(nextRound);
            }, POST_VO_GRACE_MS);  // 800ms of silence � the breathing space
            return;
          }
          safeSetTimeout(() => {
            waitForVoiceThenStart(waitedMs + VO_CHECK_INTERVAL_MS);
          }, VO_CHECK_INTERVAL_MS);
        };

        waitForVoiceThenStart();
      }, NEXT_CARD_BREATHING_DELAY_MS + extraHalfwayPause);
    }
  };

  // NEW: Handle wrong placement
  const handleWrongPlacement = () => {
    if (!sceneState || !sceneActions) return;

    const newWrongAttempts = (sceneState.wrongAttempts || 0) + 1;

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
      // Reloaded mid-celebration: the VO chain is not replayed, so open the gate.
      setSceneCompleteVOFinished(true);
      safeSetTimeout(() => {
        setShowZoneCompletion(true);
      }, 500);
    }
    else {
      sceneActions.updateState({ isReloadingGameCoach: false });
    }
  }, [isReload]);

  // FINAL CELEBRATION: completion modal waits for BOTH the orbs and the finale
  // VO to finish, so Ganesha's closing words are never cut off.
  useEffect(() => {
    if (fireworksFinished && sceneCompleteVOFinished && !showSceneCompletion) {
      setShowSceneCompletion(true);
    }
  }, [fireworksFinished, sceneCompleteVOFinished, showSceneCompletion]);

  // RESUME � runs once on mount, handles returning mid-game
  useEffect(() => {
    if (resumeHandledRef.current) return;
    resumeHandledRef.current = true;

    if (!sceneState?.welcomeShown) return; // first-time player, OpeningModal handles it

    const placed = Object.keys(sceneState.placedSymbols || {}).length;
    const celebrationInProgress =
      sceneState.currentPopup === 'final_fireworks' ||
      sceneState.showingZoneCompletion ||
      sceneState.celebrationActive ||
      showSparkle === 'final-fireworks' ||
      isOrbsRunning;

    // Already finished � restore completion screen
    if (placed === 8 || sceneState.phase === 'complete') {
      // Do not show completion modal while final celebration is still active.
      if (celebrationInProgress) return;
      safeSetTimeout(() => setShowSceneCompletion(true), 500);
      return;
    }

    // Was mid-round when they left � clear the stale card state first
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
      safeSetTimeout(() => startNextRound(resumeRound), 700);
    }

  }, []); // run once on mount; avoids repeated card/audio re-triggers

  // Hide progress bar 1s after all 8 symbols placed � keeps fireworks clean
  useEffect(() => {
    const placedCount = Object.keys(sceneState?.placedSymbols || {}).length;
    if (placedCount >= 8 && !hideProgressBar) {
      const t = safeSetTimeout(() => setHideProgressBar(true), 1000);
      return () => clearTimeout(t);
    }
  }, [sceneState?.placedSymbols, hideProgressBar]);

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

    // Reset gates for a fresh celebration pass.
    setSceneCompleteVOFinished(false);
    setFireworksFinished(false);

    sceneActions.updateState({
      currentPopup: 'final_fireworks',
      // Keep completion modal hidden until fireworks/orbs fully finish.
      showingCompletionScreen: false,
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

    finalVoPlayedRef.current = false;
    playSceneVoice('finalYouFoundAll', () => {
      safeSetTimeout(() => {
        playSceneVoice('finalNowComplete', () => {
          safeSetTimeout(() => {
            playSceneVoice('finalAlwaysWithYou', () => {
              finalVoPlayedRef.current = true;
              setSceneCompleteVOFinished(true);
            }, { replayOnReturn: false });
          }, 700);
        }, { replayOnReturn: false });
      }, 700);
    }, { replayOnReturn: false });

    // Safety net: if a VO onEnd never fires (interrupted speech engine),
    // release the completion-modal gate after a generous ceiling.
    safeSetTimeout(() => setSceneCompleteVOFinished(true), 25000);
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

  const runDevPhase = () => {
    // Ensure fully assembled state first so both phases are meaningful.
    const allPlaced = {};
    SACRED_SYMBOLS.forEach((symbol) => {
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

    const phase = devPhaseIndexRef.current % 2;
    devPhaseIndexRef.current += 1;

    // Phase 0: Fireworks + Orbs
    if (phase === 0) {
      setShowSceneCompletion(false);
      setShowZoneCompletion(false);
      setIsOrbsRunning(true);
      setShowSparkle('final-fireworks');
      return;
    }

    // Phase 1: Scene completion modal directly
    setIsOrbsRunning(false);
    setShowSparkle(null);
    setShowZoneCompletion(false);
    setShowSceneCompletion(true);
  };

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
          <VOReplayButton
            onReplay={replayVoiceForCurrentPhase}
            disabled={!isAudioOn}
          />

          <OpeningModal
            zoneId={zoneId}
            sceneId={sceneId}
            isOpen={!sceneState.welcomeShown && !isSceneCompletedState && !showSceneCompletion}
            onStart={() => {
              sceneActions.updateState({ welcomeShown: true });
            }}
            characterImg={ganeshaDivine}
            showButton={true}
          />

          {/* HEARTS PROGRESS BAR */}
          {sceneState.welcomeShown && !hideProgressBar && (
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
                      <img src={purpleHeart} alt="" className="heart-icon" aria-hidden="true" />
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
            </div>
          )}

          {/* CREAM SYMBOL CARD � slides right before zones appear */}
          {sceneState?.currentAssociationSymbol && cardPhase !== 'hidden' && (() => {
            const isFlippedCard =
              cardPhase === 'flipped' ||
              cardPhase === 'side' ||
              cardPhase === 'play' ||
              cardPhase === 'feedback';
            const isSideCard = cardPhase === 'side' || cardPhase === 'play' || cardPhase === 'feedback';
            return (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: isSideCard ? '13%' : '50%',
                  transform: isSideCard ? 'translate(0, -50%)' : 'translate(-50%, -50%) scale(1)',
                  zIndex: 150,
                  opacity: cardPhase !== 'hidden' ? 1 : 0,
                  transition: 'transform 1.1s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s ease, left 1.1s cubic-bezier(0.22, 1, 0.36, 1), top 0.9s ease',
                  pointerEvents: 'none'
                }}
              >
                <SymbolFlipCard
                  name={currentAssociationSymbol?.name}
                  associationText={currentAssociationSymbol?.associationText}
                  image={currentAssociationSymbol?.image}
                  imageFallback={currentAssociationSymbol?.id === 'belly' ? BELLY_CARD_IMAGE_FALLBACK : null}
                  flipped={isFlippedCard}
                />
              </div>
            );
          })()}

          {/* Guide arrow removed */}

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
            {/* Ganesha � ganesha-sit.svg with click zones */}
            {!showSceneCompletion && (
            <div
              className={`ganesha-assembly-container ${ganeshaReaction}`}
            >
              {/* Ganesha inline SVG � zones glow via CSS, opacity grows as symbols placed */}
              <GaneshaIllustration
                zoneStates={zoneStates}
                onZoneClick={handleZoneClick}
                activeZoneId={activeTargetZoneId}
                baseOpacity={getGaneshaOpacity()}
              />

              {/* Hint glow only � uses SAME position as hitbox, perfect alignment */}
              {Object.entries(zoneStates).map(([zoneId, state]) => {
                if (state !== 'hint' && state !== 'hint-strong' && state !== 'hint-final') return null;
                const zone = BODY_PART_ZONES.find(z => z.id === zoneId);
                if (!zone) return null;
                return (
                  <div
                    key={`hint-${zoneId}`}
                    className="zone-hint-overlay"
                    data-hint-level={state}
                    style={zone.position}
                  />
                );
              })}

              {showHintDebug && selectedHintDebugZone && BODY_PART_ZONES.filter((zone) => zone.id === selectedHintDebugZone).map((zone) => (
                <div
                  key={`hint-debug-${zone.id}`}
                  className="zone-hint-overlay zone-hint-overlay-debug"
                  data-hint-level="hint-final"
                  style={zone.position}
                >
                  <div className="zone-hint-text">{zoneDebugLabels[zone.id]}</div>
                </div>
              ))}

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
                      width: '80px',
                      height: '80px',
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                      zIndex: 210
                    }}
                  >
                    <SparkleAnimation
                      type="star"
                      count={8}
                      color={SACRED_COLOR_PALETTE.primary}
                      size={4}
                      duration={3000}
                      fadeOut
                      area="contained"
                      key={`sparkle-${symbolId}`}
                    />
                  </div>
                );
              })}
            </div>
            )}



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
                  duration={7000}
                  rotationDuration={7000}
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
                  playerName={activeProfile?.name || 'Friend'}
                  showCentralGanesha={false}
                  showBuiltInFireworks={false}
                  onComplete={() => {
                    setShowSparkle(null);
                    setIsOrbsRunning(false);

                    // Mark celebration finished
                    sceneActions.updateState({
                      showingCompletionScreen: false,
                      showingZoneCompletion: false,
                      celebrationActive: false
                    });

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

                    // Signal orbs finished; the completion modal opens once the
                    // finale VO has also finished (gating effect below).
                    setFireworksFinished(true);
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
              ?? Start Fresh
            </div>)}

            {isDevBuild && (
              <>
                <button
                  type="button"
                  style={{
                    position: 'fixed',
                    top: '88px',
                    right: '18px',
                    zIndex: 9999,
                    background: '#5B3FA5',
                    color: '#fff',
                    border: '2px solid rgba(255,255,255,0.9)',
                    borderRadius: '999px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.3px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 14px rgba(20,10,40,0.3)'
                  }}
                  onClick={runDevPhase}
                  title="Cycle: Fireworks -> Completion Modal"
                >
                  DEV Phase
                </button>
                <button
                  type="button"
                  style={{
                    position: 'fixed',
                    top: '140px',
                    right: '18px',
                    zIndex: 9999,
                    background: showHintDebug ? '#8D68D8' : 'rgba(91, 63, 165, 0.88)',
                    color: '#fff',
                    border: '2px solid rgba(255,255,255,0.9)',
                    borderRadius: '999px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.3px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 14px rgba(20,10,40,0.3)'
                  }}
                  onClick={() => {
                    setShowHintDebug((prev) => {
                      const next = !prev;
                      if (!next) {
                        setSelectedHintDebugZone(null);
                      } else if (!selectedHintDebugZone) {
                        setSelectedHintDebugZone(BODY_PART_ZONES[0]?.id || null);
                      }
                      return next;
                    });
                  }}
                  title="Toggle hint debug panel"
                >
                  {showHintDebug ? 'Hide Hint Debug' : 'Show Hint Debug'}
                </button>
                {showHintDebug && (
                  <div
                    style={{
                      position: 'fixed',
                      top: '192px',
                      right: '18px',
                      zIndex: 9999,
                      width: '150px',
                      background: 'rgba(66, 34, 106, 0.94)',
                      border: '2px solid rgba(255,255,255,0.88)',
                      borderRadius: '18px',
                      padding: '10px',
                      boxShadow: '0 10px 24px rgba(20,10,40,0.3)',
                      display: 'grid',
                      gap: '8px'
                    }}
                  >
                    {BODY_PART_ZONES.map((zone) => (
                      <button
                        key={`hint-debug-button-${zone.id}`}
                        type="button"
                        style={{
                          border: 'none',
                          borderRadius: '999px',
                          padding: '8px 10px',
                          background: selectedHintDebugZone === zone.id ? '#FF5C5C' : 'rgba(255,255,255,0.14)',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedHintDebugZone(zone.id)}
                      >
                        {zoneDebugLabels[zone.id]}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
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
            badgeImage={null}
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
              clearAllTimeouts();
              stopGaneshaVoice();
              setShowSceneCompletion(false);
              onNavigate?.('zones');
            }}
            onHome={() => {
              clearAllTimeouts();
              stopGaneshaVoice();
              setShowSceneCompletion(false);
              onNavigate?.('home');
            }}
            onReplay={() => {
              hardResetSceneState();
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
