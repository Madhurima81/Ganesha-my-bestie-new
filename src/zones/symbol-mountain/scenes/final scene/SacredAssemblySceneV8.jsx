import { usePreloadPoses } from '../../../../lib/components/animation/PoseImage';
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
import AudioToggle from '../../../../lib/components/ui/AudioToggle';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import VOReplayButton from '../../../../lib/components/feedback/VOReplayButton';
import RotatingOrbsEffect from '../../../../lib/components/feedback/RotatingOrbsEffect';
import ZoneCompletionFireworks from '../../../../lib/components/feedback/ZoneCompletionFireworks';
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
    associationText: "I can focus on what matters.",
    bodyPartImage: ganeshaEyes,
    blessing: "Eyes. I can focus on what matters.",
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
    associationText: "I can listen for what helps me.",
    bodyPartImage: ganeshaEars,
    blessing: "Ears. I can listen for what helps me.",
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
    associationText: "I can be strong and gentle.",
    bodyPartImage: ganeshaTrunk,
    blessing: "Trunk. I can be strong and gentle.",
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
    associationText: "I can use what I have for something important.",
    bodyPartImage: ganeshaTusk,
    blessing: "Tusk. I can use what I have for something important.",
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
    associationText: "I can learn, keep trying, and find joy.",
    bodyPartImage: ganeshaLeftHand,
    blessing: "Modak. I can learn, keep trying, and find joy.",
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
    associationText: "I can keep growing when things are hard.",
    bodyPartImage: ganeshaRightHand,
    blessing: "Lotus. I can keep growing when things are hard.",
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
    associationText: "I can have lots of feelings and keep going.",
    bodyPartImage: ganeshaBelly,
    blessing: "Big Belly. I can have lots of feelings and keep going.",
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
    associationText: "I can keep going, one small step at a time.",
    bodyPartImage: ganeshaBase,
    blessing: "Mooshika. I can keep going, one small step at a time.",
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

const persistSacredAssemblyCompletion = () => {
  const profileId = localStorage.getItem('activeProfileId');
  if (!profileId) return;

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
};

const GANESHA_ZONE_DESIGN_SIZE = 920;

// Keep sparkle anchors in sync with real drop zones so highlights never drift.
const getDesignPx = (value, fallback) => {
  if (typeof value !== 'string') return fallback;
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return fallback;
  if (value.endsWith('%')) return Math.round((n / 100) * GANESHA_ZONE_DESIGN_SIZE);
  if (!value.endsWith('px')) return fallback;
  return Number.isFinite(n) ? n : fallback;
};

const getZoneCenter = (zone) => {
  const { position } = zone;
  const widthPx = getDesignPx(position.width, 120);
  const heightPx = getDesignPx(position.height, 120);
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

// Phone landscape only (same query the rest of the app uses): the square Ganesha is taller than the
// screen (~560px on 844x390, ~117px cropped at the bottom), so the tusk box was only ~48px tall and the
// Mooshika target sat off-screen. Same shape of override the Hint Debug panel writes. iPad/desktop: none.
const PHONE_MQ = '(orientation: landscape) and (max-height: 500px) and (max-width: 1023px)';
const IS_PHONE_LAYOUT = typeof window !== 'undefined' && !!window.matchMedia?.(PHONE_MQ).matches;
const PHONE_ZONE_OVERRIDES = IS_PHONE_LAYOUT ? {
  // same centre as before, taller: >= 62px even at 740x360
  tusk: { top: '45.35%', left: '39.5%', width: '18.5%', height: '12%' },
  // Mooshika art is a separate layer; lifted 8% on phones (see .ganesha-zone-part-base in the CSS) so the target follows it
  base: { bottom: '18%', left: '20%', transform: 'translateX(-50%)', width: '19.6%', height: '19.6%' },
} : {};
const ANCHOR_ZONES = BODY_PART_ZONES.map((zone) => (
  PHONE_ZONE_OVERRIDES[zone.id] ? { ...zone, position: PHONE_ZONE_OVERRIDES[zone.id] } : zone
));

const ZONE_HINT_POSITIONS = ANCHOR_ZONES.reduce((acc, zone) => {
  const center = getZoneCenter(zone);
  acc[zone.id] = { top: center.top, left: center.left };
  return acc;
}, {});

const ZONE_SPARKLE_POSITIONS = ANCHOR_ZONES.reduce((acc, zone) => {
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
    width: IS_PHONE_LAYOUT ? '190px' : '230px',
    height: IS_PHONE_LAYOUT ? '200px' : '245px',
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
    borderRadius: IS_PHONE_LAYOUT ? '20px' : '26px',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    background: 'linear-gradient(180deg, #fff8ea 0%, #f7ecd4 100%)',
    border: '3px solid rgba(255, 255, 255, 0.92)',
    boxShadow: '0 18px 40px rgba(95, 63, 20, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: IS_PHONE_LAYOUT ? '12px' : '18px',
    textAlign: 'center',
    gap: IS_PHONE_LAYOUT ? '8px' : '12px',
    transformOrigin: 'center center',
    transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s ease',
    willChange: 'transform, opacity'
  };

  const imageStyle = {
    width: IS_PHONE_LAYOUT ? '100px' : '130px',
    height: 'auto',
    objectFit: 'contain',
    display: 'block',
    filter: 'drop-shadow(0 8px 20px rgba(255, 190, 84, 0.35))'
  };

  const titleStyle = {
    fontFamily: "'Baloo 2', cursive",
    fontSize: IS_PHONE_LAYOUT ? '20px' : '24px',
    fontWeight: 700,
    color: '#5A3B1E'
  };

  const textStyle = {
    fontFamily: "'Nunito', sans-serif",
    fontSize: IS_PHONE_LAYOUT ? '15px' : '18px',
    fontWeight: 700,
    color: '#6B4F2A',
    lineHeight: IS_PHONE_LAYOUT ? 1.35 : 1.5
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
        <div
          style={{
            ...faceStyle,
            opacity: flipped ? 1 : 0,
            transform: flipped ? 'rotateY(0deg) scale(1)' : 'rotateY(90deg) scale(0.98)',
            pointerEvents: flipped ? 'auto' : 'none'
          }}
        >
          <div style={titleStyle}>{name}</div>
          <div style={textStyle}>{associationText}</div>
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

const SCENE_IMAGES = [
  sacredBackground,
  symbolMooshikaColored,
  symbolModakColored,
  symbolBellyColored,
  symbolLotusColored,
  symbolTrunkColored,
  symbolEyesColored,
  symbolEarsColored,
  symbolTuskColored,
];

const SacredAssemblyContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  usePreloadPoses(SCENE_IMAGES);
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
  const [isPageVisible, setIsPageVisible] = useState(() =>
    typeof document === 'undefined' ? true : !document.hidden
  );
  const [showHintDebug, setShowHintDebug] = useState(false);
  const [selectedHintDebugZone, setSelectedHintDebugZone] = useState(null);
  // Dev-only: lets someone drag the selected zone's hitbox to a better
  // spot in the Hint Debug panel instead of hand-editing ganeshaZones.js
  // and reloading. Keyed by zoneId -> a position override that fully
  // replaces that zone's `position` (see getZonePosition below).
  const [zonePositionOverrides, setZonePositionOverrides] = useState(PHONE_ZONE_OVERRIDES);
  const [layoutCopyStatus, setLayoutCopyStatus] = useState('');
  // All available tap markers pulse together only on the first round, then
  // later rounds keep the markers faint and still.
  const [showTapIntroPulse, setShowTapIntroPulse] = useState(false);
  const ganeshaContainerRef = useRef(null);
  const zoneDragStateRef = useRef(null);
  const getZonePosition = useCallback((zoneId) => {
    const zone = BODY_PART_ZONES.find((z) => z.id === zoneId);
    return zonePositionOverrides[zoneId] || zone?.position || {};
  }, [zonePositionOverrides]);

  // One-shot dump of ALL 8 zones (dragged + untouched) as a single JSON
  // blob keyed by zone id, ready to paste straight over the `position`
  // field of each entry in ganeshaZones.js — instead of copying each
  // zone's position one at a time with no name attached to it.
  const copyAllZonePositionsJson = useCallback(async () => {
    const payload = BODY_PART_ZONES.reduce((acc, zone) => {
      acc[zone.id] = getZonePosition(zone.id);
      return acc;
    }, {});
    const json = JSON.stringify(payload, null, 2);
    const canPrompt = typeof window !== 'undefined' && typeof window.prompt === 'function';

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(json);
        setLayoutCopyStatus('Copied');
      } else if (canPrompt) {
        window.prompt('Copy all zone positions JSON', json);
        setLayoutCopyStatus('Shown');
      }
    } catch {
      if (canPrompt) {
        window.prompt('Copy all zone positions JSON', json);
        setLayoutCopyStatus('Shown');
      } else {
        if (import.meta.env.DEV) console.log('Sacred Assembly zone positions JSON:', json);
        setLayoutCopyStatus('Logged');
      }
    }
  }, [getZonePosition]);
  const completionModalContent = getCompletionModal(zoneId, sceneId);
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const {
    speak: speakGanesha,
    stop: stopGaneshaVoice,
    mute: muteGaneshaVoice,
    isSpeaking: isGaneshaSpeaking
  } = useGaneshaVoice();
  const isGaneshaSpeakingRef = useRef(false);
  const {
    playSparkle,
    setGlobalVolume
  } = useGameSounds();
  // -- T08/T09: visibility + idle timer infrastructure --------------------------
  const { startIdleTimer, stopIdleTimer, setCurrentPhase, startMusic, stopMusic, setVoiceVolume, muteVoicePlayback, playVoice, playTap, playCorrect, playWrong, playPowerUnlock, playCelebration } = useVoiceGuidance(
    zoneId, sceneId, { enableMusic: true, musicVolume: 0.06, sfxVolume: 0.7, idleTimeout: 20 }
  );
  const playUiTap = playTap;
  const playWrongTap = playWrong;
  const playChime = playCorrect;
  const playGlow = playPowerUnlock;
  const playTwinkle = playCelebration;
  useEffect(() => { startIdleTimer(); return () => stopIdleTimer(); }, [startIdleTimer, stopIdleTimer]);
  useEffect(() => { setCurrentPhase(sceneState?.phase ?? null); }, [sceneState?.phase, setCurrentPhase]);
  useEffect(() => {
    setVoiceVolume(isAudioOn ? 1 : 0);
    if (!isAudioOn) { muteGaneshaVoice(); muteVoicePlayback(); } // finish in-flight lines silently, on schedule
  }, [isAudioOn, setVoiceVolume, muteGaneshaVoice, muteVoicePlayback]);
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

  const selectedSymbol = sceneState?.selectedSymbol ?
    SACRED_SYMBOLS.find(s => s.id === sceneState.selectedSymbol) : null;
  const highlightedZone = sceneState?.highlightedZone ?
    BODY_PART_ZONES.find(z => z.id === sceneState.highlightedZone) : null;
  const currentAssociationSymbol = useMemo(
    () => SACRED_SYMBOLS.find((s) => s.id === sceneState?.currentAssociationSymbol),
    [sceneState?.currentAssociationSymbol]
  );
  // Drag the selected zone's debug box to reposition it live. Converts the
  // drop point to percent-of-container top/left, drops right/bottom/transform
  // (so a right-anchored zone like "ears" becomes left-anchored once moved —
  // visually identical, just simpler to read back out). Deliberately never
  // touches width/height: those were previously captured via
  // getBoundingClientRect(), which reflects whatever page zoom/"fit to
  // window" scale the browser or game-test harness happens to be applying —
  // storing that back as a CSS px width caused every drag to re-measure an
  // already-scaled box and grow it further, compounding into a runaway size
  // increase. Dragging only ever moves a zone now; resize it by hand in
  // ganeshaZones.js if it's genuinely the wrong size.
  const handleZoneDebugDragStart = useCallback((e, zoneId) => {
    const container = ganeshaContainerRef.current;
    if (!container) return;
    e.preventDefault();
    const boxRect = e.currentTarget.getBoundingClientRect();
    const existing = getZonePosition(zoneId);
    zoneDragStateRef.current = {
      zoneId,
      offsetX: e.clientX - boxRect.left,
      offsetY: e.clientY - boxRect.top,
      width: existing.width,
      height: existing.height,
    };

    const onMove = (moveEvent) => {
      const drag = zoneDragStateRef.current;
      if (!drag) return;
      const containerRect = container.getBoundingClientRect();
      const leftPx = moveEvent.clientX - drag.offsetX - containerRect.left;
      const topPx = moveEvent.clientY - drag.offsetY - containerRect.top;
      const leftPct = Math.max(0, Math.min(100, (leftPx / containerRect.width) * 100));
      const topPct = Math.max(0, Math.min(100, (topPx / containerRect.height) * 100));
      setZonePositionOverrides((prev) => ({
        ...prev,
        [drag.zoneId]: {
          top: `${topPct.toFixed(1)}%`,
          left: `${leftPct.toFixed(1)}%`,
          width: drag.width,
          height: drag.height,
        },
      }));
    };
    const onUp = () => {
      zoneDragStateRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [getZonePosition]);

  // Arrow keys nudge the selected zone by ~0.3% per press (~5px on a
  // typical scene width) for fine-tuning after a drag.
  useEffect(() => {
    if (!showHintDebug || !selectedHintDebugZone) return undefined;
    const onKeyDown = (e) => {
      const step = e.shiftKey ? 1.5 : 0.3;
      let dx = 0, dy = 0;
      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else return;
      e.preventDefault();
      const current = getZonePosition(selectedHintDebugZone);
      const container = ganeshaContainerRef.current;
      const containerRect = container?.getBoundingClientRect();
      const boxEl = container?.querySelector('.zone-hint-overlay-debug');
      const boxRect = boxEl?.getBoundingClientRect();
      if (!containerRect || !boxRect) return;
      const currentLeftPct = ((boxRect.left - containerRect.left) / containerRect.width) * 100;
      const currentTopPct = ((boxRect.top - containerRect.top) / containerRect.height) * 100;
      setZonePositionOverrides((prev) => ({
        ...prev,
        [selectedHintDebugZone]: {
          top: `${(currentTopPct + dy).toFixed(1)}%`,
          left: `${(currentLeftPct + dx).toFixed(1)}%`,
          // Never derived from a measured rect (see handleZoneDebugDragStart's
          // comment) — always carried over from the existing position so
          // nudging can never inflate the zone's size.
          width: current.width,
          height: current.height,
        },
      }));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showHintDebug, selectedHintDebugZone, getZonePosition]);

  const zoneDebugLabels = useMemo(() => {
    const labels = {};
    BODY_PART_ZONES.forEach((zone) => {
      const matchingSymbol = SACRED_SYMBOLS.find((symbol) => symbol.correctZone === zone.id);
      labels[zone.id] = matchingSymbol?.name || zone.id;
    });
    return labels;
  }, []);

  const [cardPhase, setCardPhase] = useState('hidden'); // 'hidden' | 'appear' | 'flipped' | 'side' | 'play' | 'feedback'
  // GMB hint standard: notice -> understand -> do. 0 = nothing yet,
  // 1 = quiet wait, 2 = semantic clue VO, 3 = exact target marker only.
  const [roundHintLevel, setRoundHintLevel] = useState(0);
  const hintVoPlayedRef = useRef({ l2: false, l3: false });
  // When the L2 hint line finished speaking — L3's 8s gap counts from THIS,
  // not from a fixed 26s-from-arm mark, so a slow L2 line doesn't eat into
  // the real gap the child gets before L3 fires.
  const l2VoiceEndedAtRef = useRef(null);
  const l3TimerRef = useRef(null);
  const hintGenerationRef = useRef(0);
  const playSceneVoiceRef = useRef(null);
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
    // Do NOT give the correct hitbox priority before L3 — otherwise
    // overlapping hit areas can silently favour the answer even when
    // there's no visible hint at all.
    if (cardPhase !== 'play' || roundHintLevel < 3) return null;
    const currentSymbol = SACRED_SYMBOLS.find(s => s.id === sceneState?.currentAssociationSymbol);
    return currentSymbol?.correctZone || null;
  }, [cardPhase, roundHintLevel, sceneState?.currentAssociationSymbol]);
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);
  const onboardingPlayedRef = useRef(sceneState?.onboardingPlayed || false);
  const onboardingPlayedAtRef = useRef(0);
  useEffect(() => {
    isGaneshaSpeakingRef.current = isGaneshaSpeaking;
  }, [isGaneshaSpeaking]);
  const cardVoPlayedForRoundRef = useRef(-1); // tracks which round's card VO has already played
  const finalVoPlayedRef = useRef(false);
  const openingModalVoPlayedRef = useRef(false);
  const sixSymbolMilestoneVoPlayedRef = useRef(false);
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
    if (key === 'sixSymbolsPlaced') return 'celebration';
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

  playSceneVoiceRef.current = playSceneVoice;

  const replayVoiceForCurrentPhase = useCallback(() => {
    if (!isAudioOn || !sceneState) return;

    if (!sceneState.welcomeShown) {
      playSceneVoice('openingModalPrompt', null, { replayOnReturn: false, auto: true });
      return;
    }

    if (
      sceneState.phase === 'complete' ||
      sceneState.showingZoneCompletion ||
      showSceneCompletion
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
        return;
      }

      // Replay should replay the amount of help the child has already
      // reached — it should NOT secretly jump them to L2/L3.
      if (roundHintLevel >= 3) return;

      if (roundHintLevel >= 2) {
        const hintVoKey = HINT_VO_MAP[currentSymbolId];
        if (hintVoKey) playSceneVoice(hintVoKey, null, { replayOnReturn: false, auto: true });
        return;
      }

      if (cardVoKey) playSceneVoice(cardVoKey, null, { replayOnReturn: false, auto: true });
      return;
    }

    if (currentSymbolId && cardPhase === 'feedback') return;
  }, [
    CARD_VO_MAP,
    HINT_VO_MAP,
    cardPhase,
    isAudioOn,
    playSceneVoice,
    roundHintLevel,
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

    if (cardPhase === 'appear') {
      playChime();
      const t = safeSetTimeout(() => setCardPhase('side'), 2200);
      return () => clearTimeout(t);
    }

    if (cardPhase === 'side') {
      // No VO here � card is mid-flip, child can't read it yet
      playUiTap();
      // Card slides to the side over a 1.1s CSS transition (see style block below) —
      // wait for the slide to visibly finish before starting the flip, so the two
      // animations never overlap even on a slower device.
      const t = safeSetTimeout(() => setCardPhase('flipped'), 1350);
      return () => clearTimeout(t);
    }

    if (cardPhase === 'flipped') {
      // No VO here � card is still sliding. VO fires in 'play' once card has landed.
      playSparkle();
      const t = safeSetTimeout(() => setCardPhase('play'), 600);
      return () => clearTimeout(t);
    }

    if (
      cardPhase === 'play' &&
      (sceneState?.currentRound ?? 0) === 0
    ) {
      setShowTapIntroPulse(true);
      const t = safeSetTimeout(() => setShowTapIntroPulse(false), 1700);
      return () => clearTimeout(t);
    }

    if (cardPhase === 'play') {
      setShowTapIntroPulse(false);
    }
  }, [cardPhase, isPageVisible, playChime, playSparkle, playUiTap, sceneState?.currentAssociationSymbol, sceneState?.currentRound]);

  // ---------------------------------------------------------
  // PLAY PHASE
  //
  // Card VO ends
  //      ↓
  // 10s  L1 = quiet wait
  // 18s  L2 = semantic clue VO
  // 26s  L3 = exact target marker only; no extra VO
  //
  // Wrong answers can promote the same ladder early (handleWrongPlacement).
  // ---------------------------------------------------------
  useEffect(() => {
    if (cardPhase !== 'play') return;
    if (!isPageVisible) return;
    const currentSymbol = SACRED_SYMBOLS.find(s => s.id === sceneState?.currentAssociationSymbol);
    if (!currentSymbol) return;
    const cardVoKey = CARD_VO_MAP[currentSymbol.id];

    // Card VO — 2.5s after card lands, giving child time to look first.
    // Guard prevents double-play if effect re-runs while still in 'play'.
    const roundIndex = sceneState?.currentRound ?? -1;
    const ENTRY_VO_DELAY_MS = 2500;
    const hintTimers = [];
    // This run's token. Cleanup flips it so a late VO callback or a stale
    // timer from a previous card can never push the NEXT card's hint level.
    const generation = ++hintGenerationRef.current;
    const isCurrent = () => hintGenerationRef.current === generation;

    const armHintLadder = () => {
      if (!isCurrent()) return;
      hintTimers.forEach(clearTimeout);
      hintTimers.length = 0;
      l2VoiceEndedAtRef.current = null;
      hintTimers.push(safeSetTimeout(() => {
        if (isCurrent()) setRoundHintLevel((level) => Math.max(level, 1));
      }, 10000));

      hintTimers.push(safeSetTimeout(() => {
        if (isCurrent()) setRoundHintLevel((level) => Math.max(level, 2));
      }, 18000));

      // Fallback L3 — replaced by the L2-voice-completion timer below once
      // the L2 hint line actually finishes speaking; kept in case it's
      // muted or has no VO, so L3 still eventually fires.
      const fallback = safeSetTimeout(() => {
        if (isCurrent()) setRoundHintLevel((level) => Math.max(level, 3));
      }, 26000);
      hintTimers.push(fallback);
      l3TimerRef.current = fallback;
    };

    // Card VO plays first; the idle-hint ladder only starts counting once
    // that VO has actually finished (onEnded), not from a flat delay after
    // the card lands — otherwise a hint could appear while the card VO is
    // still talking. If there's no VO for this card, arm the ladder right away.
    const cardVoTimer = safeSetTimeout(() => {
      if (cardVoKey && cardVoPlayedForRoundRef.current !== roundIndex) {
        cardVoPlayedForRoundRef.current = roundIndex;
        playSceneVoiceRef.current(cardVoKey, armHintLadder, { replayOnReturn: false });
      } else {
        armHintLadder();
      }
    }, ENTRY_VO_DELAY_MS);

    return () => {
      hintGenerationRef.current += 1;
      clearTimeout(cardVoTimer);
      hintTimers.forEach(clearTimeout);
      if (l3TimerRef.current) clearTimeout(l3TimerRef.current);
    };
    // playSceneVoice is read through a ref on purpose: it changes identity
    // whenever Ganesha starts/stops speaking, which used to tear this effect
    // down mid card-VO and arm the hint ladder while the card was still talking.
  }, [cardPhase, CARD_VO_MAP, isPageVisible, sceneState?.currentAssociationSymbol, sceneState?.currentRound]);

  // Translates roundHintLevel into actual behaviour — the ladder above only
  // decides WHEN each level fires, this decides WHAT happens at each one.
  useEffect(() => {
    if (cardPhase !== 'play') {
      return;
    }

    const currentSymbol = SACRED_SYMBOLS.find(s => s.id === sceneState?.currentAssociationSymbol);
    if (!currentSymbol) return;
    const correctZone = currentSymbol.correctZone;

    // First clear any exact-target hint left from a previous level/round.
    // Preserve placed / correct / wrong transient feedback.
    if (roundHintLevel < 3) {
      setZoneStates((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.keys(next).forEach((zoneId) => {
          if (next[zoneId] === 'hint' || next[zoneId] === 'hint-strong' || next[zoneId] === 'hint-final') {
            next[zoneId] = 'idle';
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }

    // L2: semantic clue only. Do NOT identify the correct body part.
    if (roundHintLevel >= 2 && !hintVoPlayedRef.current.l2) {
      hintVoPlayedRef.current.l2 = true;
      const hintVoKey = HINT_VO_MAP[currentSymbol.id];
      // L3's 8s gap counts from when this L2 line finishes speaking, not
      // from the fixed 26s-from-arm fallback armed in armHintLadder above.
      const l2Generation = hintGenerationRef.current;
      const onL2VoiceEnded = () => {
        if (hintGenerationRef.current !== l2Generation) return;
        l2VoiceEndedAtRef.current = Date.now();
        if (l3TimerRef.current) clearTimeout(l3TimerRef.current);
        l3TimerRef.current = safeSetTimeout(() => {
          if (hintGenerationRef.current === l2Generation) {
            setRoundHintLevel((level) => Math.max(level, 3));
          }
        }, 8000);
      };
      if (hintVoKey) {
        playSceneVoice(hintVoKey, onL2VoiceEnded, { replayOnReturn: false });
      } else {
        onL2VoiceEnded();
      }
    }

    // L3: visual rescue only.
    if (roundHintLevel >= 3) {
      setZoneStates((prev) => {
        if (prev[correctZone] === 'placed' || prev[correctZone] === 'correct') return prev;
        return { ...prev, [correctZone]: 'hint-final' };
      });

      if (!hintVoPlayedRef.current.l3) {
        hintVoPlayedRef.current.l3 = true;
      }
    }
  }, [roundHintLevel, cardPhase, sceneState?.currentAssociationSymbol, HINT_VO_MAP, playSceneVoice]);

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

    // The final-celebration effect shows the completion modal whenever these are true and the modal
    // is closed: left set, Play Again re-opened the completion modal at once.
    setSceneCompleteVOFinished(false);
    setFireworksFinished(false);
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
    setRoundHintLevel(0);
    hintVoPlayedRef.current = { l2: false, l3: false };

    onboardingPlayedRef.current = false;
    onboardingPlayedAtRef.current = 0;
    cardVoPlayedForRoundRef.current = -1;
    finalVoPlayedRef.current = false;
    openingModalVoPlayedRef.current = false;
    sixSymbolMilestoneVoPlayedRef.current = false;

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
      finalVoPlayedRef.current = false;
      openingModalVoPlayedRef.current = false;
      sixSymbolMilestoneVoPlayedRef.current = false;
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

    setRoundHintLevel(0);
    hintVoPlayedRef.current = { l2: false, l3: false };
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
      // Only the tapped part wiggles — don't shake all of Ganesha for a
      // normal exploration mistake. If a child already needed L3 and then
      // taps somewhere else, the correct glowing target stays put.
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
  
    if (import.meta.env.DEV) console.log(`Flying to: Top ${tTop}, Left ${tLeft}`);

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
    setRoundHintLevel(0);
    hintVoPlayedRef.current = { l2: false, l3: false };
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

    if (count === 6 && !sixSymbolMilestoneVoPlayedRef.current) {
      sixSymbolMilestoneVoPlayedRef.current = true;
      playSceneVoice('sixSymbolsPlaced', null, { replayOnReturn: false });
    }

    // checkpoint = saved immediately, so leaving right after the drop never loses the placement
    sceneActions.checkpoint({
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
      // Next round = symbols placed so far (round k = queue[k]). Not currentRound + 1: after a resume
      // currentRound lagged, so the next card repeated the one just placed.
      const nextRound = Math.max((sceneState.currentRound || 0) + 1, count);
      // Halfway breathing beat � once, after 4th symbol
      const isHalfwayMoment = count === 4;
      const extraHalfwayPause = isHalfwayMoment ? 1000 : 0;   // was 1500
      safeSetTimeout(() => {
        sceneActions.updateState({ currentRound: nextRound });
        setCardPhase('hidden');

        const waitForVoiceThenStart = (waitedMs = 0) => {
          // VO finished OR max wait hit ? add grace pause, THEN next card
          if (!isGaneshaSpeakingRef.current || waitedMs >= VO_WAIT_MAX_MS) {
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

  // Wrong taps stay visual/SFX-only. A second wrong choice brings the
  // placement clue forward early, which gives useful information without
  // narrating every exploration miss.
  const handleWrongPlacement = () => {
    if (!sceneState || !sceneActions) return;

    const nextWrongAttempts = (sceneState.wrongAttempts || 0) + 1;

    if (nextWrongAttempts >= 2) {
      setRoundHintLevel((level) => Math.max(level, 2));
    }

    sceneActions.updateState({ wrongAttempts: nextWrongAttempts });
  };


  useEffect(() => {
    if (!isReload || !sceneState) return;

    if (sceneState.showingZoneCompletion || sceneState.celebrationActive) {
      setIsOrbsRunning(true);
      setShowSparkle('final-fireworks');
      // Reloaded mid-celebration: the VO chain is not replayed, so open the gate.
      setSceneCompleteVOFinished(true);
      setFireworksFinished(true);
      safeSetTimeout(() => {
        setShowZoneCompletion(true);
      }, 500);
    }
  }, [isReload]);

  // FINAL CELEBRATION: play the closing VO while the all-symbols orbs/fireworks
  // are on screen, then move to the completion modal once both VO and animation
  // have finished.
  useEffect(() => {
    if (showSparkle === 'final-fireworks' && !sceneCompleteVOFinished && !finalVoPlayedRef.current) {
      finalVoPlayedRef.current = true;
      playSceneVoice('finalYouFoundAll', () => {
        safeSetTimeout(() => {
          playSceneVoice('finalAlwaysWithYou', () => {
            setSceneCompleteVOFinished(true);
          }, { replayOnReturn: false });
        }, 700);
      }, { replayOnReturn: false });
      return;
    }

    if (fireworksFinished && sceneCompleteVOFinished && !showSceneCompletion) {
      setShowSceneCompletion(true);
    }
  }, [
    fireworksFinished,
    playSceneVoice,
    safeSetTimeout,
    sceneCompleteVOFinished,
    showSceneCompletion,
    showSparkle,
  ]);

  // RESUME � runs once on mount, handles returning mid-game
  useEffect(() => {
    if (resumeHandledRef.current) return undefined;

    if (!sceneState?.welcomeShown) { resumeHandledRef.current = true; return undefined; } // first-time player, OpeningModal handles it

    const placed = Object.keys(sceneState.placedSymbols || {}).length;
    const celebrationInProgress =
      sceneState.currentPopup === 'final_fireworks' ||
      sceneState.showingZoneCompletion ||
      sceneState.celebrationActive ||
      showSparkle === 'final-fireworks' ||
      isOrbsRunning;

    // NOTE: the "handled" flag is set when a timer FIRES, not up front. The scene clears its timers on
    // unmount and React StrictMode (dev) unmounts/remounts once: a timer scheduled up front was cancelled
    // and the flag then stopped the second run from scheduling it again (no card after Continue).

    // Already finished - restore completion screen
    if (placed === 8 || sceneState.phase === 'complete') {
      // Do not show completion modal while final celebration is still active.
      if (celebrationInProgress) { resumeHandledRef.current = true; return undefined; }
      const completionTimer = setTimeout(() => {
        if (resumeHandledRef.current) return;
        resumeHandledRef.current = true;
        setShowSceneCompletion(true);
      }, 500);
      return () => clearTimeout(completionTimer);
    }

    // Was mid-round when they left - clear the stale card state first
    if (sceneState.currentAssociationSymbol) {
      sceneActions.updateState({
        currentAssociationSymbol: null,
        glowingZones: [],
        showingAssociationCard: false,
      });
    }

    // currentRound advances a few seconds AFTER a symbol is placed (sparkle + voice wait), so
    // leaving in that gap saved a stale round whose card is the symbol already placed. The next
    // card is always the one after the symbols already placed (round k = queue[k]).
    const resumeRound = Math.max(sceneState.currentRound || 0, placed);

    // Round 0 with nothing placed = start-first-round useEffect handles it naturally.
    // Only explicitly jump to a round when we're genuinely mid-game.
    if (resumeRound > 0 || placed > 0) {
      const resumeTimer = setTimeout(() => {
        if (resumeHandledRef.current) return;
        resumeHandledRef.current = true;
        sceneActions.updateState({ currentRound: resumeRound });
        startNextRound(resumeRound);
      }, 700);
      return () => clearTimeout(resumeTimer);
    }

    resumeHandledRef.current = true;
    return undefined;
  }, []); // run once on mount; avoids repeated card/audio re-triggers

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
    persistSacredAssemblyCompletion();

    setIsOrbsRunning(true);
    setShowSparkle('final-fireworks');
    finalVoPlayedRef.current = false;

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
      readyForWisdom: false
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
          {/* Hidden while the zone-completion fireworks / orbs celebration plays. */}
          {!isCelebrationRunning && <ZoneBadgeButton variant="gameplay" zoneId="symbol-mountain" onBack={() => { stopGaneshaVoice(); onNavigate?.('zone-welcome'); }} />}
          {/* [per-scene mute removed 2026-10-09] <AudioToggle variant="gameplay" isAudioOn={isAudioOn} onToggle={toggleAudio} /> */}
          <VOReplayButton variant="gameplay"
            onReplay={replayVoiceForCurrentPhase}
            // No VO exists yet while the card is arriving (appear/flipped/side) — grey the
            // button out so it never looks tappable but does nothing.
            disabled={!isAudioOn || (
              !!sceneState?.welcomeShown
              && !!sceneState?.currentAssociationSymbol
              && !showSceneCompletion
              && sceneState?.phase !== 'complete'
              && !sceneState?.showingZoneCompletion
              && (cardPhase === 'appear' || cardPhase === 'flipped' || cardPhase === 'side')
            )}
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

          {/* CREAM SYMBOL CARD � slides right before zones appear */}
          {sceneState?.currentAssociationSymbol && cardPhase !== 'hidden' && (() => {
            const isFlippedCard =
              cardPhase === 'flipped' ||
              cardPhase === 'play' ||
              cardPhase === 'feedback';
            const isSideCard =
              cardPhase === 'side' ||
              cardPhase === 'flipped' ||
              cardPhase === 'play' ||
              cardPhase === 'feedback';
            return (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: isSideCard ? (IS_PHONE_LAYOUT ? '5%' : '13%') : '50%',
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

          {/* Sacred Mountain Background */}
          <div
            className="sacred-background"
            style={{ backgroundImage: `url(${sacredBackground})` }}
          >
            {/* Ganesha � ganesha-sit.svg with click zones */}
            {!showSceneCompletion && (
            <div
              ref={ganeshaContainerRef}
              className={`ganesha-assembly-container ${ganeshaReaction}`}
            >
              {/* Ganesha inline SVG � zones glow via CSS, opacity grows as symbols placed */}
              <GaneshaIllustration
                zoneStates={zoneStates}
                onZoneClick={handleZoneClick}
                activeZoneId={activeTargetZoneId}
                baseOpacity={getGaneshaOpacity()}
                showTapMarkers={cardPhase === 'play'}
                zoneOverrides={zonePositionOverrides}
                showTapIntroPulse={showTapIntroPulse}
              />

              {showHintDebug && selectedHintDebugZone && BODY_PART_ZONES.filter((zone) => zone.id === selectedHintDebugZone).map((zone) => (
                <div
                  key={`hint-debug-${zone.id}`}
                  className="zone-hint-overlay zone-hint-overlay-debug"
                  data-hint-level="hint-final"
                  style={{ ...getZonePosition(zone.id), cursor: 'grab' }}
                  onPointerDown={(e) => handleZoneDebugDragStart(e, zone.id)}
                  title="Drag to reposition. Arrow keys to nudge (Shift = bigger step)."
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
                readyForWisdom: false
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
                      width: '190px',
                      background: 'rgba(66, 34, 106, 0.94)',
                      border: '2px solid rgba(255,255,255,0.88)',
                      borderRadius: '18px',
                      padding: '10px',
                      boxShadow: '0 10px 24px rgba(20,10,40,0.3)',
                      display: 'grid',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        style={{ flex: 1, border: 'none', borderRadius: '999px', padding: '8px 10px', background: '#4CAF50', color: '#fff', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                        onClick={copyAllZonePositionsJson}
                        title="Copies all 8 zones' current positions (dragged or not) as one JSON object, keyed by zone id — paste straight over the position fields in ganeshaZones.js"
                      >
                        Copy All Positions
                      </button>
                      {layoutCopyStatus && <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>{layoutCopyStatus}</span>}
                    </div>

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

                    {selectedHintDebugZone && (
                      <>
                        <div
                          style={{
                            color: '#fff',
                            fontSize: '10px',
                            fontFamily: 'monospace',
                            background: 'rgba(0,0,0,0.25)',
                            borderRadius: '8px',
                            padding: '6px 8px',
                            wordBreak: 'break-all',
                            lineHeight: 1.4
                          }}
                        >
                          {(() => {
                            const pos = getZonePosition(selectedHintDebugZone);
                            return Object.entries(pos).map(([k, v]) => `${k}: '${v}'`).join(', ') || 'no override';
                          })()}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            style={{ flex: 1, border: 'none', borderRadius: '999px', padding: '6px 8px', background: '#4CAF50', color: '#fff', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                            onClick={() => {
                              const pos = getZonePosition(selectedHintDebugZone);
                              const snippet = `position: { ${Object.entries(pos).map(([k, v]) => `${k}: '${v}'`).join(', ')} }`;
                              navigator.clipboard?.writeText(snippet);
                            }}
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            style={{ flex: 1, border: 'none', borderRadius: '999px', padding: '6px 8px', background: 'rgba(255,255,255,0.14)', color: '#fff', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                            onClick={() => {
                              setZonePositionOverrides((prev) => {
                                const next = { ...prev };
                                delete next[selectedHintDebugZone];
                                return next;
                              });
                            }}
                          >
                            Reset
                          </button>
                        </div>
                      </>
                    )}
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
              onHelp={() => { if (import.meta.env.DEV) console.log('Show help'); }}
              onParentMenu={() => { if (import.meta.env.DEV) console.log('Parent menu'); }}
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
            sceneName="Ganesha's Symbol Challenge"
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
