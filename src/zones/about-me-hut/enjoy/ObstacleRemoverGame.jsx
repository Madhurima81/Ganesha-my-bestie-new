import { usePreloadPoses, preparePose } from '../../../lib/components/animation/PoseImage';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './DreamsWishesGame.css';
import SceneCompletionCelebration from "../../../lib/components/celebration/SceneCompletionCelebration";
import DrawingPad from '../components/Drawingpad';
import StoryProgressHeader from '../components/StoryProgressHeader';
import AboutMeGaneshaHost from '../components/AboutMeGaneshaHost';
import GaneshaGestureCue from '../../../lib/components/gesture/GaneshaGestureCue';
import { useMiniGesture } from '../../../lib/hooks/useMiniGesture';

// Navigation Components
import SceneManager from "../../../lib/components/scenes/SceneManager";
import GameStateManager from "../../../lib/services/GameStateManager";
import ProgressManager from "../../../lib/services/ProgressManager";
import SimpleSceneManager from "../../../lib/services/SimpleSceneManager";

// Content Configs
import { getOpeningModal, getCompletionModal } from '../../../lib/config/content';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';

// Shared Components
import OpeningModal from '../../shared/components/OpeningModal';
import ZoneBadgeButton from '../../../lib/components/navigation/ZoneBadgeButton';
import AudioToggle from '../../../lib/components/ui/AudioToggle';
import VOReplayButton from '../../../lib/components/feedback/VOReplayButton';
import useAudioPreference from '../../../lib/hooks/useAudioPreference';
import useVoiceGuidance from '../../../lib/hooks/useVoiceGuidance';
import { useGaneshaVoice } from '../../../lib/hooks/useGaneshaVoice';
import { useGameSounds } from '../../../lib/hooks/useGameSounds';
import usePauseAwareTimeout from '../../../lib/hooks/usePauseAwareTimeout';
import useResumeCountdown from '../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../lib/components/feedback/ResumeCountdown';
import SparkleAnimation from '../../../lib/components/animation/SparkleAnimation';
import Wish2PlateDropGame from './components/Wish2PlateDropGame';

// Import Unified Design System
import Button from '../../../lib/components/ui/Button/Button';
import '../../../lib/styles/zone-themes.css';
import '../../../lib/styles/animations.css';

// Import images
import babyGaneshaImg from '/images/ganesha-final-new.svg';
import babyGaneshaSit from '/images/ganesha-final-new.svg';
import dreamsBg from './assets/images/dream_background.webp';

// Wish Icons
import wishIconEarth from './assets/images/wish-icon-earth.webp';
import wishIconFlower from './assets/images/wish-icon-flower.webp';
import wishIconShare from './assets/images/wish-icon-share.webp';
import wishHeartIcon from './assets/images/heart-icon.webp';
import wishStarIcon from './assets/images/shootingstar-icon.webp';
import wishWorldIcon from './assets/images/world-icon.webp';

// Wish Images
import wishEarthSad from './assets/images/wish-images/wish-earth-sad.webp';
import wishEarthHappy from './assets/images/wish-images/wish-earth-happy.webp';
import wishBowlEmpty from './assets/images/wish-images/wish-bowl-empty.webp';
import wishBowlFull from './assets/images/wish-images/wish-bowl-full.webp';
import plateImg from './assets/images/wish-images/plate.webp';
import cowImg from './assets/images/wish-images/fav-cow.webp';
import mouseImg from './assets/images/wish-images/fav-mouse.webp';
import peacockImg from './assets/images/wish-images/fav-peacock.webp';
import appleImg from './assets/images/wish-images/apple.webp';
import bananaImg from './assets/images/wish-images/banana.webp';
import breadImg from './assets/images/wish-images/bread.webp';
import brocolliImg from './assets/images/wish-images/brocolli.webp';
import carrotImg from './assets/images/wish-images/carrot.webp';
import milkImg from './assets/images/wish-images/milk.webp';
import riceImg from './assets/images/wish-images/rice.webp';
import wishForest1 from './assets/images/wish-images/wish-forest-1.webp';
import wishForest2 from './assets/images/wish-images/wish-forest-2.webp';
import wishForest3 from './assets/images/wish-images/wish-forest-3.webp';
import wishForest4 from './assets/images/wish-images/wish-forest-4.webp';
import baseImg from './assets/images/wish-images/base.webp';
import flowerImg from './assets/images/wish-images/flower.webp';
import bushImg from './assets/images/wish-images/bush.webp';
import treeImg from './assets/images/wish-images/tree.webp';
import butterflyImg from './assets/images/wish-images/butterfly.webp';
import birdImg from './assets/images/wish-images/bird.webp';
import helpingImg from './assets/images/wish-images/helping.webp';
import sharingImg from './assets/images/wish-images/sharing.webp';
import huggingImg from './assets/images/wish-images/hugging.webp';
import giftingImg from './assets/images/wish-images/gifting.webp';
import angryImg from './assets/images/wish-images/angry.webp';
import fightImg from './assets/images/wish-images/fight.webp';
import hitImg from './assets/images/wish-images/hit.webp';
import teasingImg from './assets/images/wish-images/teasing.webp';
import cloudImg from './assets/images/cloud.webp';
import kindnessHeaderIcon from './assets/images/story-header/kindness-icon.webp';
import sharingHeaderIcon from './assets/images/story-header/sharing-icon.webp';
import natureHeaderIcon from './assets/images/story-header/nature-icon.webp';

// ?hitzones outlines the real tap box of every tappable thing in the scene.
// Same condition as the phone block in DreamsWishesGame.css.
const PHONE_LANDSCAPE_QUERY = '(orientation: landscape) and (max-height: 500px) and (max-width: 1023px)';
const MAX_ACTIVE_WISH1_BUBBLES_PHONE = 4;
const SHOW_HIT_ZONES = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('hitzones');

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) return <button onClick={() => window.location.reload()}>Reload Scene</button>;
    return this.props.children;
  }
}

// =========================================================
// 1. MAIN WRAPPER
// =========================================================
const DreamsWishesGame = ({ onComplete, onBack, onNavigate, zoneId = 'about-me-hut', sceneId = 'dreams-wishes' }) => {
  return (
    <ErrorBoundary>
      <SceneManager
        flushKeys={['gamePhase']}
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          gamePhase: 'intro',

          // --- COUNTERS & INTERACTIVE STATES ---
          wish1Taps: 0,
          wish1FinalMoment: false,

          wish2Taps: 0,
          wish2FinalMoment: false,
          bowlStates: [false, false, false], // Track individual bowls
          wish2PlateFoods: [null, null, null],
          wish2FoodPool: ['apple', 'banana', 'rice'],

          wish3Taps: 0,
          wish3FinalMoment: false,
          parkStates: [false, false, false], // Track individual park items (Grass, Butterfly, Slide)

          trunkTaps: 0,
          dreamRevealed: false,
          storyDiscoveries: [],

          // --- CHILD DATA ---
          childDreamDrawing: null, // The saved image string

          // --- MODAL SAVING (For Reloads) ---
          currentModal: null, // 'drawing'
          draftData: null,    // Temporary drawing data

          // --- COMPLETION ---
          stars: 3,
          completed: false,
          showingCompletionScreen: false
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <DreamsWishesGameContent
            sceneState={sceneState}
            sceneActions={sceneActions}
            isReload={isReload}
            onComplete={onComplete}
            onNavigate={onNavigate}
            onBack={onBack}
          />
        )}
      </SceneManager>
    </ErrorBoundary>
  );
};

// =========================================================
// 2. CONTENT COMPONENT
// =========================================================
const SCENE_IMAGES = [
  babyGaneshaImg,
  babyGaneshaSit,
  dreamsBg,
  wishIconEarth,
  wishIconFlower,
  wishIconShare,
  wishHeartIcon,
  wishStarIcon,
  wishWorldIcon,
  wishEarthSad,
  wishEarthHappy,
  wishBowlEmpty,
  wishBowlFull,
  plateImg,
  cowImg,
  mouseImg,
  peacockImg,
  appleImg,
  bananaImg,
  breadImg,
  brocolliImg,
  carrotImg,
  milkImg,
  riceImg,
  wishForest1,
  wishForest2,
  wishForest3,
  wishForest4,
  baseImg,
  flowerImg,
  bushImg,
  treeImg,
  butterflyImg,
  birdImg,
  helpingImg,
  sharingImg,
  huggingImg,
  giftingImg,
  angryImg,
  fightImg,
  hitImg,
  teasingImg,
  cloudImg,
  kindnessHeaderIcon,
  sharingHeaderIcon,
  natureHeaderIcon,
];

const DreamsWishesGameContent = ({ sceneState, sceneActions, isReload, onComplete, onNavigate, onBack }) => {
  usePreloadPoses(SCENE_IMAGES);
  const [earthHappyReady, setEarthHappyReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    preparePose(wishEarthHappy).then(() => {
      if (!cancelled) setEarthHappyReady(true);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    SimpleSceneManager.setCurrentScene('about-me-hut', 'dreams-wishes', false, false);
  }, []);

  const WISH2_FOOD_KEYS = ['apple', 'banana', 'rice'];
  const WISH2_FOOD_ASSETS = {
    apple: appleImg,
    banana: bananaImg,
    bread: breadImg,
    brocolli: brocolliImg,
    carrot: carrotImg,
    milk: milkImg,
    rice: riceImg,
  };
  const WISH2_FOOD_POSITIONS = {
    apple: { left: '30%', top: '45%' },
    banana: { left: '50%', top: '37%' },
    rice: { left: '70%', top: '45%' },
  };
  const WISH2_PLATE_POSITIONS = [
    { left: '50%', top: '70%' },
    { left: '33%', top: '83%' },
    { left: '67%', top: '83%' },
  ];
  const WISH2_PLATE_LAYOUT = {
    containerLeft: 50,
    containerTop: 57,
    containerWidth: 74,
    containerHeight: 42,
  };

  const VOICE_LINES = {
    // Opening Modal VO now lives solely in openingModals.js (single source
    // of truth) — the shared OpeningModal component speaks it directly.

    // Wish 1
    wish1Intro: "My first wish is for more kindness.",
    wish1Active: "Tap the kind actions you can spot.",
    wish1Complete: "You found all the kind choices.",

    // Wish 2
    wish2Intro: "My next wish is for everyone to have enough food.",
    wish2Active: "Drag food to each empty plate.",
    wish2Complete: "Now every plate has food.",

    // Wish 3
    wish3Intro: "My next wish is for a greener world.",
    wish3Active: "Tap the bare spaces to help the garden grow.",
    wish3Complete: "Look how green it has become.",

    // All Wishes Complete
    allWishesComplete: "Now it's your turn to make a wish.",

    // Dream Phases
    // dreamIntro: (REMOVED — merged into allWishesComplete)
    dreamDrawing: "Draw something you hope for or dream about.",
    dreamClouded: "Your dream is hiding behind the clouds. Help me clear them — tap me.",
    dreamRevealed: "There it is — your dream!",

    // Comparison Card
    comparison: "Everyone can dream about something different.",
    completionCelebration: "",

    // Ending
    ending: ""
  };

  // Profile Display
  const activeProfile = GameStateManager.getCurrentProfile?.() || null;
  const profileDisplayName = (activeProfile?.name || 'Friend').trim();
  const PROFILE_ANIMAL_IDS = ['monkey', 'peacock', 'squirrel', 'tiger'];
  const PROFILE_EMOJI_TO_ANIMAL = { '🐵': 'monkey', '🦚': 'peacock', '🐿️': 'squirrel', '🐯': 'tiger' };
  const rawAvatar = activeProfile?.avatar;
  const profileAnimalId = PROFILE_ANIMAL_IDS.includes(rawAvatar) ? rawAvatar : (PROFILE_EMOJI_TO_ANIMAL[rawAvatar] || null);
  const profileAvatarImage = profileAnimalId ? `/images/new-explorer-${profileAnimalId}.webp` : null;
  const profileAvatar = (typeof rawAvatar === 'string' && rawAvatar.trim().length <= 2)
    ? rawAvatar
    : profileDisplayName.charAt(0).toUpperCase();

  if (!sceneState) return <div>Loading...</div>;

  // Get content from configs
  const openingModalContent = getOpeningModal('about-me-hut', 'dreams-wishes');
  const completionModalContent = getCompletionModal('about-me-hut', 'dreams-wishes');
  const completionIcons = ['wish-heart', 'wish-star', 'wish-world'];

  // --- LOCAL UI STATE (Not saved in DB) ---
  // ── Resume Delay (shared across pause/resume logic) ──────────────────────────
  const RESUME_DELAY_MS = 3000;
  const OPENING_VO_VOLUME = 0.55;

  const { isAudioOn, toggleAudio } = useAudioPreference();

  const [returnHintNonce, setReturnHintNonce] = useState(0);
  // Gates the idle-hint ladders below: the countdown only starts once the
  // phase's own entry VO has actually finished (onEnd), not the instant the
  // phase is entered — otherwise a hint could fire while Ganesha is still
  // talking. Keyed by phase so unrelated phases don't block each other.
  const [phaseVoiceDoneFor, setPhaseVoiceDoneFor] = useState(null);
  const [wish1IdleLevel, setWish1IdleLevel] = useState(0);
  const [wish2IdleLevel, setWish2IdleLevel] = useState(0);
  // Wish 2's teaching-drag GestureDemo is synced to the "Drag food..." VO
  // actually starting to speak, not to the phase merely mounting.
  const [wish2TeachingReady, setWish2TeachingReady] = useState(false);
  const [wish3IdleLevel, setWish3IdleLevel] = useState(0);
  const [childIdleLevel, setChildIdleLevel] = useState(0);
  const idleVoFlagsRef = useRef({
    wish1Level2: false,
    wish1Level3: false,
    wish2Level2: false,
    wish2Level3: false,
    wish3Level2: false,
    wish3Level3: false,
    childLevel2: false,
    childLevel3: false,
  });
  const resetIdleHintsForActiveWish = useCallback(() => {
    setWish1IdleLevel(0);
    setWish2IdleLevel(0);
    setWish3IdleLevel(0);
    setChildIdleLevel(0);
    idleVoFlagsRef.current.wish1Level2 = false;
    idleVoFlagsRef.current.wish1Level3 = false;
    idleVoFlagsRef.current.wish2Level2 = false;
    idleVoFlagsRef.current.wish2Level3 = false;
    idleVoFlagsRef.current.wish3Level2 = false;
    idleVoFlagsRef.current.wish3Level3 = false;
    idleVoFlagsRef.current.childLevel2 = false;
    idleVoFlagsRef.current.childLevel3 = false;
  }, []);
  const lastInteractionAtRef = useRef(Date.now());
  // Bumped on every meaningful interaction — included in the idle-hint
  // effects' dependency arrays below so they actually cancel their old
  // setTimeout chain and start a fresh 10/18/26 from this moment, instead
  // of just clearing the visible hint level while the stale timers kept
  // running underneath (a child interacting at 16s would still get the
  // 18s hint two seconds later).
  const [idleHintRestartNonce, setIdleHintRestartNonce] = useState(0);
  const markInteraction = useCallback(() => {
    lastInteractionAtRef.current = Date.now();
    resetIdleHintsForActiveWish();
    setIdleHintRestartNonce(n => n + 1);
  }, [resetIdleHintsForActiveWish]);

  // ── Callback for pause/resume (fires after resumeDelay via useVoiceGuidance) ─
  const onReturnHint = useCallback(() => {
    setReturnHintNonce(n => n + 1);
  }, []);

  // ── T08/T09: visibility + idle timer infrastructure ──────────────────────────
  const { startIdleTimer, stopIdleTimer, setCurrentPhase, stopVoice, muteVoicePlayback, setVoiceVolume, startMusic, stopMusic, playVoice } = useVoiceGuidance(
    'about-me-hut', 'dreams-wishes', {
      enableMusic: true,
      musicVolume: 0.06,
      idleTimeout: 20,
      resumeDelay: RESUME_DELAY_MS,  // ← Wait before replaying VO
      onReturnHint                     // ← Called when child returns
    }
  );
  const { playUiTap, playPlace, playWrongTap, playSparkle, playChime, playGlow, setGlobalVolume } = useGameSounds();
  const { speak, stop: stopSpokenVoice, mute: muteSpokenVoice, isSpeaking } = useGaneshaVoice();
  const isSpeakingRef = useRef(false);
  const isAudioOnRef = useRef(isAudioOn);
  const latestSceneStateRef = useRef(sceneState);
  const wish1TapCountRef = useRef(sceneState?.wish1Taps || 0);
  const wish1CompletionQueuedRef = useRef(false);
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);
  useEffect(() => {
    isAudioOnRef.current = isAudioOn;
  }, [isAudioOn]);
  useEffect(() => {
    latestSceneStateRef.current = sceneState;
    wish1TapCountRef.current = sceneState?.wish1Taps || 0;
    if (sceneState?.gamePhase !== 'wish1-active') {
      wish1CompletionQueuedRef.current = false;
    }
  }, [sceneState]);
  useEffect(() => { startIdleTimer(); return () => stopIdleTimer(); }, [startIdleTimer, stopIdleTimer]);
  useEffect(() => { setCurrentPhase(sceneState?.gamePhase ?? null); }, [sceneState?.gamePhase, setCurrentPhase]);
  useEffect(() => {
    if (isAudioOn && sceneState.gamePhase !== 'intro' && !sceneState.showingCompletionScreen) startMusic();
    else stopMusic();
  }, [isAudioOn, sceneState.gamePhase, sceneState.showingCompletionScreen, startMusic, stopMusic]);
  // Keep SFX + ambience audible even when voice toggle is off.
  // Audio toggle should only mute voiceover.
  useEffect(() => { setGlobalVolume(1); }, [setGlobalVolume]);

  // Audio off: silence now, but finish each in-flight line's callback on schedule
  useEffect(() => {
    if (!isAudioOn) {
      muteVoicePlayback();
      muteSpokenVoice();
    }
  }, [isAudioOn, muteVoicePlayback, muteSpokenVoice]);

  useEffect(() => () => stopMusic(), [stopMusic]);
  useEffect(() => () => {
    if (discoveryFlyTimeoutRef.current) clearTimeout(discoveryFlyTimeoutRef.current);
  }, []);

  // ── Resume Countdown & Pause-Aware Timeout ──────────────────────────────────
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  // Pause/Resume refs for celebration transition
  const pauseCelebRef = useRef(() => {});
  const resumeCelebRef = useRef(() => {});
  const wish1SpawnLoopCancelRef = useRef(null);

  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: () => {
      // On tab hide: stop voice, pause celebration, clear bubbles.
      // Bubble expire timers are safeSetTimeouts — cleared by clearAll.
      // Without clearing bubbles here, stale bubbles sit on screen forever on return.
      // removedWish1BubbleKeysRef is NOT cleared — it tracks already-tapped kind bubbles
      // so they don't respawn and give the child double credit.
      stopVoice();
      stopSpokenVoice();
      wish1SpawnLoopCancelRef.current?.();
      wish1SpawnLoopCancelRef.current = null;
      setBubbles([]);
      activeWish1BubbleKeysRef.current.clear();
      setSelectedWish2FoodKey(null); // Cancel any in-flight wish2 drag
      pauseCelebRef.current?.();
      // Clear phaseVoiceRef so VO can replay after resume delay
      phaseVoiceRef.current = {};
    },
    onShow: () => {
      // On tab resume: resume celebration
      // NOTE: do NOT call onReturnHint here — useVoiceGuidance already calls it
      // after resumeDelay when no VO is queued. Calling it here too causes a
      // double-increment of returnHintNonce which stomps the VO and corrupts phaseVoiceRef.
      resumeCelebRef.current?.();
    },
    resumeDelay: RESUME_DELAY_MS  // ← Timers sync with audio resume
  });
  useEffect(() => clearAllTimeouts, [clearAllTimeouts]);

  const [showDrawingPad, setShowDrawingPad] = useState(false); // Controls visibility
  const [showDreamContinue, setShowDreamContinue] = useState(false); // Continue button after dream reveal magic moment
  const [ganeshaReactKey, setGaneshaReactKey] = useState(0); // Triggers ganesha bounce on dream reveal
  const [selectedWish2FoodKey, setSelectedWish2FoodKey] = useState(null);

  const resumePopupTimeoutRef = useRef(null);
  // Blocks the ongoing phase VO effect on the first render of a reload session only.
  // The reload useEffect clears this after firing its own VO, so phase transitions
  // after reload work normally.
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');
  const [openingButtonVisible] = useState(true);

  // Mini gesture (thumbs up) on successful taps
  const { miniGesture, triggerMiniGesture } = useMiniGesture();
  const wish1SparkleCancelRef = useRef(null);
  const [wish1Sparkle, setWish1Sparkle] = useState({ type: null, key: 0 });
  const wish2SparkleCancelRef = useRef(null);
  const [wish2Sparkle, setWish2Sparkle] = useState({ type: null, key: 0, targetIndex: null });
  const wish3SparkleCancelRef = useRef(null);
  const [wish3Sparkle, setWish3Sparkle] = useState({ type: null, key: 0 });
  const [discoveryFly, setDiscoveryFly] = useState(null);
  const discoveryFlyTimeoutRef = useRef(null);
  const lastCheerIndexRef = useRef(-1);
  const DISCOVERY_FLY_TOTAL_MS = 2200;
  const DISCOVERY_FLY_START_DELAY_MS = 800;
  const DISCOVERY_CENTER_REACH_MS = 900;
  const COMPLETION_CHEER_DELAY_MS = 550;
  const PHASE_BREATHER_MS = 1500;
  const WISH1_FINAL_ICON_DELAY_MS = 1400;
  const WISH1_FINAL_CHEER_DELAY_MS = 1700;

  const appendUniqueDiscovery = useCallback((discoveries, item) => {
    if (!item?.name) return discoveries || [];
    const list = Array.isArray(discoveries) ? discoveries : [];
    if (list.some(d => d?.name === item.name)) return list;
    return [...list, item];
  }, []);

  const triggerDiscoveryFly = useCallback((item, options = {}) => {
    if (!item) return;
    const { durationMs = DISCOVERY_FLY_TOTAL_MS } = options;
    setDiscoveryFly({
      key: `${Date.now()}-${Math.random()}`,
      image: item.image,
      emoji: item.emoji,
      name: item.name,
      durationMs
    });
    if (discoveryFlyTimeoutRef.current) clearTimeout(discoveryFlyTimeoutRef.current);
    discoveryFlyTimeoutRef.current = setTimeout(() => {
      setDiscoveryFly(null);
      discoveryFlyTimeoutRef.current = null;
    }, durationMs);
  }, []);

  // Bubble tap game (wish 1)
  const [bubbles, setBubbles] = useState([]);
  const [shakingBubbleId, setShakingBubbleId] = useState(null);
  const bubbleCounterRef = useRef(0);
  const removedWish1BubbleKeysRef = useRef(new Set());
  const activeWish1BubbleKeysRef = useRef(new Set());

  const phaseVoiceRef = useRef({});
  const speakLine = (text, options = {}) => {
    if (!text) {
      options.onEnd?.();
      return;
    }
    const { onStart, onEnd, onError, moment = 'encouragement' } = options;
    // Stop both engines first: useVoiceGuidance's own idle timer can fire its
    // hook-driven playVoice() independently of this scene's speakLine calls —
    // without this, a still-playing idle-hint MP3 keeps going under this line
    // (same two-speech-source issue as Family Tree).
    stopVoice();
    stopSpokenVoice();
    speak(text, { age: 7, style: 'child', moment, onStart, onEnd, onError });
  };

  const interruptCurrentVoice = () => {
    stopVoice();
    stopSpokenVoice();
  };

  const audioStopFnsRef = useRef({ stopVoice, stopSpokenVoice, clearAllTimeouts });
  useEffect(() => {
    audioStopFnsRef.current = { stopVoice, stopSpokenVoice, clearAllTimeouts };
  }, [stopVoice, stopSpokenVoice, clearAllTimeouts]);

  const hardStopSceneAudio = useCallback(() => {
    const stopFns = audioStopFnsRef.current;
    stopFns.stopVoice();
    stopFns.stopSpokenVoice();
    stopFns.clearAllTimeouts();
    window.speechSynthesis?.cancel?.();
  }, []);

  useEffect(() => {
    window.addEventListener('beforeunload', hardStopSceneAudio);
    window.addEventListener('pagehide', hardStopSceneAudio);
    return () => {
      window.removeEventListener('beforeunload', hardStopSceneAudio);
      window.removeEventListener('pagehide', hardStopSceneAudio);
    };
  }, [hardStopSceneAudio]);

  const triggerWish1Sparkle = useCallback((type, durationMs = 1700) => {
    wish1SparkleCancelRef.current?.();
    setWish1Sparkle(prev => ({ type, key: prev.key + 1 }));
    wish1SparkleCancelRef.current = safeSetTimeout(() => {
      setWish1Sparkle(prev => ({ ...prev, type: null }));
      wish1SparkleCancelRef.current = null;
    }, durationMs + 50);
  }, [safeSetTimeout]);

  const triggerWish2Sparkle = useCallback((type, durationMs = 1700, targetIndex = null) => {
    wish2SparkleCancelRef.current?.();
    setWish2Sparkle(prev => ({ type, key: prev.key + 1, targetIndex }));
    wish2SparkleCancelRef.current = safeSetTimeout(() => {
      setWish2Sparkle(prev => ({ ...prev, type: null, targetIndex: null }));
      wish2SparkleCancelRef.current = null;
    }, durationMs + 50);
  }, [safeSetTimeout]);

  const triggerWish3Sparkle = useCallback((type, durationMs = 1700) => {
    wish3SparkleCancelRef.current?.();
    setWish3Sparkle(prev => ({ type, key: prev.key + 1 }));
    wish3SparkleCancelRef.current = safeSetTimeout(() => {
      setWish3Sparkle(prev => ({ ...prev, type: null }));
      wish3SparkleCancelRef.current = null;
    }, durationMs + 50);
  }, [safeSetTimeout]);

  const getPhaseReminderLine = useCallback((phase) => {
    switch (phase) {
      case 'wish1-active':
        return null;
      case 'wish2-active':
        return null;
      case 'wish3-active':
        return null;
      case 'dream-clouded':
        if (sceneState.dreamRevealed) return null;
        return "Tap me to clear the clouds.";
      case 'dream-clearing':
        return null;
      default:
        return null;
    }
  }, [sceneState.dreamRevealed]);

  const getResumeVoiceLine = useCallback((phase) => {
    switch (phase) {
      case 'intro':
        return openingModalContent?.voiceover;
      case 'wish1-intro':
        return VOICE_LINES.wish1Intro;
      case 'wish1-active':
        return VOICE_LINES.wish1Active;
      case 'wish2-intro':
        return VOICE_LINES.wish2Intro;
      case 'wish2-active':
        return VOICE_LINES.wish2Active;
      case 'wish3-intro':
        return VOICE_LINES.wish3Intro;
      case 'wish3-active':
        return VOICE_LINES.wish3Active;
      case 'all-wishes-complete':
        return VOICE_LINES.allWishesComplete;
      // case 'dream-intro': (removed — merged into all-wishes-complete)
      case 'dream-drawing':
        return VOICE_LINES.dreamDrawing;
      case 'dream-clouded':
        if (sceneState.dreamRevealed) return VOICE_LINES.dreamRevealed;
        return VOICE_LINES.dreamClouded;
      case 'dream-clearing':
        if (sceneState.dreamRevealed) return VOICE_LINES.dreamRevealed;
        return null;
      case 'dream-revealed':
        return VOICE_LINES.dreamRevealed;
      case 'comparison-card':
        return VOICE_LINES.comparison;
      case 'ending':
        return VOICE_LINES.ending;
      default:
        return null;
    }
  }, [VOICE_LINES, sceneState.dreamRevealed]);
  const replayCurrentVoice = useCallback(() => {
    if (sceneState.showingCompletionScreen) {
      speakLine(VOICE_LINES.completionCelebration, { moment: 'celebration' });
      return;
    }
    if (sceneState.gamePhase === 'intro') {
      setVoiceVolume(isAudioOn ? OPENING_VO_VOLUME : 0);
      if (openingModalContent?.voiceover) speakLine(openingModalContent.voiceover, { moment: 'greeting' });
      return;
    }
    const line = getResumeVoiceLine(sceneState.gamePhase) || getPhaseReminderLine(sceneState.gamePhase);
    if (!line) return;
    speakLine(line, { moment: sceneState.gamePhase === 'ending' ? 'closing' : 'encouragement' });
  }, [VOICE_LINES.completionCelebration, getPhaseReminderLine, getResumeVoiceLine, isAudioOn, openingModalContent, sceneState.gamePhase, sceneState.showingCompletionScreen, setVoiceVolume, speakLine]);

  // --- HELPERS ---
  const getDiscoveries = () => {
    const items = Array.isArray(sceneState.storyDiscoveries) ? [...sceneState.storyDiscoveries] : [];
    if (sceneState.childDreamDrawing) items.push({ name: 'My Dream', image: sceneState.childDreamDrawing });
    return items;
  };

  const getCompletionCheer = useCallback(() => {
    const cheers = ['Awesome!', 'Amazing!', 'Great job!', 'Wonderful!', 'Fantastic!', 'Brilliant!'];
    const pool =
      cheers.length > 1
        ? cheers.filter((_, idx) => idx !== lastCheerIndexRef.current)
        : cheers;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    lastCheerIndexRef.current = cheers.indexOf(picked);
    return picked;
  }, []);

  const queueCompletionWithCheer = useCallback((completionLine, options = {}) => {
    const { startDelayMs = COMPLETION_CHEER_DELAY_MS } = options;
    const cheer = getCompletionCheer();
    safeSetTimeout(() => {
      speakLine(`${cheer} ${completionLine}`, { moment: 'celebration' });
    }, startDelayMs);
  }, [getCompletionCheer, safeSetTimeout, speakLine]);

  // --- RELOAD DETECTION & RESTORATION ---
  // Runs once on mount. For each saved phase: reset any partial state,
  // then play the phase entry VO after a short settle delay.
  // Mirrors the pattern in NewModakSceneV7 — no guards, no suppress flags, just speak.
  useEffect(() => {
    // Resume on any re-entry with saved progress (Continue from the map, relaunch, or a
    // browser reload) — `isReload` alone is only true for a browser refresh. A fresh game
    // (no save, still at 'intro') must not run this: it stops voice the OpeningModal needs.
    if (!(isReload || (sceneState?.lastSaved && sceneState?.gamePhase !== 'intro'))) return;

    const { gamePhase, dreamRevealed, currentModal } = sceneState;
    // Pre-seed phaseVoiceRef flags so the phase-VO effect won't double-fire; we speak explicitly below.
    phaseVoiceRef.current = {};
    stopVoice();
    stopSpokenVoice();

    // Drawing modal was open — resume drawing phase with preserved draft
    if (currentModal === 'drawing') {
      phaseVoiceRef.current.dreamDrawing = true;
      sceneActions.updateState({ gamePhase: 'dream-drawing', currentModal: 'drawing' });
      setShowDrawingPad(true);
      safeSetTimeout(() => { speakLine(VOICE_LINES.dreamDrawing, { moment: 'coregulation' }); }, 500);
      return;
    }

    // Completion phases: that wish is finished, so resume at the NEXT beat (never redo it).
    // wish1-complete -> wish2, wish2-complete -> wish3, wish3-complete -> all-wishes-complete.

    // Active phases — reset counters, replay entry VO
    if (gamePhase === 'wish1-active') {
      phaseVoiceRef.current.wish1Active = true;
      sceneActions.updateState({ wish1Taps: 0, wish1FinalMoment: false });
      safeSetTimeout(() => { speakLine(VOICE_LINES.wish1Active, { moment: 'encouragement' }); }, 500);
      return;
    }
    if (gamePhase === 'wish2-active') {
      phaseVoiceRef.current.wish2Active = true;
      sceneActions.updateState({ wish2Taps: 0, bowlStates: [false, false, false], wish2PlateFoods: [null, null, null], wish2FoodPool: [...WISH2_FOOD_KEYS], wish2FinalMoment: false });
      safeSetTimeout(() => { speakLine(VOICE_LINES.wish2Active, { moment: 'encouragement' }); }, 500);
      return;
    }
    if (gamePhase === 'wish3-active') {
      phaseVoiceRef.current.wish3Active = true;
      sceneActions.updateState({ wish3Taps: 0, parkStates: [false, false, false], wish3FinalMoment: false });
      safeSetTimeout(() => { speakLine(VOICE_LINES.wish3Active, { moment: 'encouragement' }); }, 500);
      return;
    }

    // Intro phases — replay entry VO as-is
    if (gamePhase === 'wish1-intro') {
      phaseVoiceRef.current.wish1Intro = true;
      safeSetTimeout(() => { speakLine(VOICE_LINES.wish1Intro, { moment: 'story' }); }, 500);
      return;
    }
    if (gamePhase === 'wish2-intro' || gamePhase === 'wish1-complete') {
      phaseVoiceRef.current.wish2Active = true;
      sceneActions.updateState({ gamePhase: 'wish2-active', wish2Taps: 0, bowlStates: [false, false, false], wish2PlateFoods: [null, null, null], wish2FoodPool: [...WISH2_FOOD_KEYS], wish2FinalMoment: false });
      safeSetTimeout(() => { speakLine(VOICE_LINES.wish2Active, { moment: 'encouragement' }); }, 500);
      return;
    }
    if (gamePhase === 'wish3-intro' || gamePhase === 'wish2-complete') {
      phaseVoiceRef.current.wish3Active = true;
      sceneActions.updateState({ gamePhase: 'wish3-active', wish3Taps: 0, parkStates: [false, false, false], wish3FinalMoment: false });
      safeSetTimeout(() => { speakLine(VOICE_LINES.wish3Active, { moment: 'encouragement' }); }, 500);
      return;
    }

    // All wishes complete
    if (gamePhase === 'all-wishes-complete' || gamePhase === 'wish3-complete') {
      phaseVoiceRef.current.allWishesComplete = true;
      if (gamePhase === 'wish3-complete') sceneActions.updateState({ gamePhase: 'all-wishes-complete', wish3FinalMoment: false });
      safeSetTimeout(() => { speakLine(VOICE_LINES.allWishesComplete, { moment: 'celebration' }); }, 500);
      return;
    }

    // Dream phases
    if (gamePhase === 'dream-drawing') {
      phaseVoiceRef.current.dreamDrawing = true;
      setShowDrawingPad(true);
      sceneActions.updateState({ currentModal: 'drawing' });
      safeSetTimeout(() => { speakLine(VOICE_LINES.dreamDrawing, { moment: 'coregulation' }); }, 500);
      return;
    }
    if (gamePhase === 'dream-clearing' && !dreamRevealed) {
      phaseVoiceRef.current.dreamClouded = true;
      sceneActions.updateState({ trunkTaps: 0, dreamRevealed: false });
      safeSetTimeout(() => { speakLine(VOICE_LINES.dreamClouded, { moment: 'thinking' }); }, 500);
      return;
    }
    if (gamePhase === 'dream-clouded') {
      phaseVoiceRef.current.dreamClouded = true;
      safeSetTimeout(() => { speakLine(VOICE_LINES.dreamClouded, { moment: 'thinking' }); }, 500);
      return;
    }

    // Comparison / ending — just replay VO
    // (no 'intro' case: the shared OpeningModal speaks its own voiceover on mount)
    if (gamePhase === 'comparison-card') {
      phaseVoiceRef.current.comparison = true;
      safeSetTimeout(() => { speakLine(VOICE_LINES.comparison, { moment: 'story' }); }, 500);
      return;
    }
    if (gamePhase === 'ending') {
      phaseVoiceRef.current.ending = true;
      safeSetTimeout(() => { speakLine(VOICE_LINES.ending, { moment: 'closing' }); }, 500);
      return;
    }
  }, []); // Runs once on mount only

  // --- AUTO-TRANSITION HANDLER ---
  useEffect(() => {
    let cancel;
    const { gamePhase } = sceneState;

    if (gamePhase === 'wish1-complete') {
      cancel = safeSetTimeout(() => {
        sceneActions.updateState({
          gamePhase: 'wish2-active',
          wish1FinalMoment: false,
          wish2Taps: 0,
          bowlStates: [false, false, false],
          wish2PlateFoods: [null, null, null],
          wish2FoodPool: [...WISH2_FOOD_KEYS],
          wish2FinalMoment: false
        });
      }, 4500);
    }
    else if (sceneState.dreamRevealed && (gamePhase === 'dream-clouded' || gamePhase === 'dream-clearing')) {
      // Magical moment: sparkles + glow up; Ganesha bounces at 900ms; VO fires from its own effect;
      // auto-advance to comparison card after the VO + pause.
      const bounceTimer = safeSetTimeout(() => { setGaneshaReactKey(k => k + 1); }, 900);
      cancel = safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'comparison-card' }); }, 5000);
      return () => { bounceTimer?.(); cancel?.(); };
    }

    return () => cancel?.();
  }, [sceneState.gamePhase, sceneState.dreamRevealed, safeSetTimeout]);

  useEffect(() => {
    // Idle-hint gate: if this phase's entry VO already played earlier
    // (e.g. resumed mid-phase), there's no VO left to wait for — mark it
    // done immediately so the idle ladder below isn't blocked forever.
    // (No 'intro' case here: the shared OpeningModal speaks its own
    // voiceover on mount — this scene no longer has a second copy.)
    const idleGatedPhaseFlag = {
      'wish1-active': 'wish1Active',
      'wish2-active': 'wish2Active',
      'wish3-active': 'wish3Active',
      'dream-clouded': 'dreamClouded',
    }[sceneState.gamePhase];
    if (idleGatedPhaseFlag && phaseVoiceRef.current[idleGatedPhaseFlag]) {
      setPhaseVoiceDoneFor(sceneState.gamePhase);
    }

    // Wish 1 — no separate intro screen anymore; speak the intro line then
    // the active/instruction line back-to-back on landing on wish1-active.
    if (sceneState.gamePhase === 'wish1-active' && !phaseVoiceRef.current.wish1Active) {
      phaseVoiceRef.current.wish1Active = true;
      speakLine(VOICE_LINES.wish1Intro, {
        moment: 'story',
        onEnd: () => {
          speakLine(VOICE_LINES.wish1Active, { moment: 'encouragement', onEnd: () => setPhaseVoiceDoneFor('wish1-active') });
        }
      });
    }
    if (sceneState.gamePhase === 'wish1-complete' && !phaseVoiceRef.current.wish1Complete) {
      phaseVoiceRef.current.wish1Complete = true;
      queueCompletionWithCheer(VOICE_LINES.wish1Complete, { startDelayMs: 0 });
    }

    // Wish 2
    if (sceneState.gamePhase === 'wish2-intro' && !phaseVoiceRef.current.wish2Intro) {
      phaseVoiceRef.current.wish2Intro = true;
      speakLine(VOICE_LINES.wish2Intro, { moment: 'story' });
    }
    if (sceneState.gamePhase === 'wish2-active' && !phaseVoiceRef.current.wish2Active) {
      phaseVoiceRef.current.wish2Active = true;
      speakLine(VOICE_LINES.wish2Active, {
        moment: 'encouragement',
        onStart: () => setWish2TeachingReady(true),
        // Muted audio calls onEnd without ever calling onStart — don't
        // strand the teaching gesture in that case.
        onEnd: () => { setWish2TeachingReady(true); setPhaseVoiceDoneFor('wish2-active'); },
      });
    }

    // Wish 3 — no separate intro screen (flow goes straight to wish3-active);
    // speak the intro line then the active/instruction line back-to-back.
    if (sceneState.gamePhase === 'wish3-active' && !phaseVoiceRef.current.wish3Active) {
      phaseVoiceRef.current.wish3Active = true;
      speakLine(VOICE_LINES.wish3Intro, {
        moment: 'story',
        onEnd: () => {
          speakLine(VOICE_LINES.wish3Active, { moment: 'encouragement', onEnd: () => setPhaseVoiceDoneFor('wish3-active') });
        }
      });
    }

    // All Wishes Complete
    if (sceneState.gamePhase === 'all-wishes-complete' && !phaseVoiceRef.current.allWishesComplete) {
      phaseVoiceRef.current.allWishesComplete = true;
      speakLine(VOICE_LINES.allWishesComplete, { moment: 'celebration' });
    }

    // Dream Phases
    // dream-intro now handled by all-wishes-complete VO above
    // if (sceneState.gamePhase === 'dream-intro' && !phaseVoiceRef.current.dreamIntro) {
    //   phaseVoiceRef.current.dreamIntro = true;
    //   speakLine(VOICE_LINES.dreamIntro, { moment: 'coregulation' });
    // }
    if (sceneState.gamePhase === 'dream-drawing' && !phaseVoiceRef.current.dreamDrawing) {
      phaseVoiceRef.current.dreamDrawing = true;
      speakLine(VOICE_LINES.dreamDrawing, { moment: 'coregulation' });
    }
    if (sceneState.gamePhase === 'dream-clouded' && !sceneState.dreamRevealed && !phaseVoiceRef.current.dreamClouded) {
      phaseVoiceRef.current.dreamClouded = true;
      speakLine(VOICE_LINES.dreamClouded, { moment: 'story', onEnd: () => setPhaseVoiceDoneFor('dream-clouded') });
    }
    if (sceneState.gamePhase === 'dream-clearing' && !sceneState.dreamRevealed && !phaseVoiceRef.current.dreamClearing) {
      phaseVoiceRef.current.dreamClearing = true;
    }
    if (sceneState.dreamRevealed && !phaseVoiceRef.current.dreamRevealed) {
      phaseVoiceRef.current.dreamRevealed = true;
      speakLine(VOICE_LINES.dreamRevealed, { moment: 'celebration' });
    }

    // Comparison Card
    if (sceneState.gamePhase === 'comparison-card' && !phaseVoiceRef.current.comparison) {
      phaseVoiceRef.current.comparison = true;
      safeSetTimeout(() => {
        speakLine(VOICE_LINES.comparison, { moment: 'story' });
      }, 200);
    }

    // Ending
    if (sceneState.gamePhase === 'ending' && !phaseVoiceRef.current.ending) {
      phaseVoiceRef.current.ending = true;
      speakLine(VOICE_LINES.ending, { moment: 'closing' });
    }
  }, [sceneState.gamePhase, sceneState.dreamRevealed, isAudioOn, playVoice]);

  const prevPhaseRef = useRef(sceneState.gamePhase);
  useEffect(() => {
    if (sceneState.gamePhase === 'comparison-card' && prevPhaseRef.current !== 'comparison-card') {
      playGlow();
    }
    prevPhaseRef.current = sceneState.gamePhase;
  }, [sceneState.gamePhase, playGlow]);

  // Completion screen VO (single guided line)
  useEffect(() => {
    if (sceneState.showingCompletionScreen && !phaseVoiceRef.current.completeVo) {
      stopVoice();
      stopSpokenVoice();
      phaseVoiceRef.current.completeVo = true;
      const completionVoTimer = setTimeout(() => {
        speakLine(VOICE_LINES.completionCelebration, { moment: 'celebration' });
      }, 180);
      return () => clearTimeout(completionVoTimer);
    }
    if (!sceneState.showingCompletionScreen) phaseVoiceRef.current.completeVo = false;
  }, [sceneState.showingCompletionScreen, isAudioOn]);

  // Ensure no in-progress VO bleeds into the completion modal.
  useEffect(() => {
    if (!sceneState.showingCompletionScreen) {
      phaseVoiceRef.current.completionAudioCleared = false;
      return;
    }
    if (phaseVoiceRef.current.completionAudioCleared) return;
    stopVoice();
    stopSpokenVoice();
    phaseVoiceRef.current.completionAudioCleared = true;
  }, [sceneState.showingCompletionScreen, stopVoice, stopSpokenVoice]);

  // Wish 1 final in-scene VO (reliable trigger after last tap state is set)
  useEffect(() => {
    if (sceneState.wish1FinalMoment && !phaseVoiceRef.current.wish1FinalMomentVo) {
      phaseVoiceRef.current.wish1FinalMomentVo = true;
      queueCompletionWithCheer(VOICE_LINES.wish1Complete, { startDelayMs: 0 });
    }
    if (!sceneState.wish1FinalMoment) {
      phaseVoiceRef.current.wish1FinalMomentVo = false;
    }
  }, [sceneState.wish1FinalMoment, isAudioOn]);

  useEffect(() => {
    if (sceneState.wish2FinalMoment && !phaseVoiceRef.current.wish2FinalMomentVo) {
      phaseVoiceRef.current.wish2FinalMomentVo = true;
      queueCompletionWithCheer(VOICE_LINES.wish2Complete, { startDelayMs: 0 });
    }
    if (!sceneState.wish2FinalMoment) {
      phaseVoiceRef.current.wish2FinalMomentVo = false;
    }
  }, [sceneState.wish2FinalMoment, isAudioOn]);

  useEffect(() => {
    if (sceneState.wish3FinalMoment && !phaseVoiceRef.current.wish3FinalMomentVo) {
      phaseVoiceRef.current.wish3FinalMomentVo = true;
      queueCompletionWithCheer(VOICE_LINES.wish3Complete, { startDelayMs: 0 });
    }
    if (!sceneState.wish3FinalMoment) {
      phaseVoiceRef.current.wish3FinalMomentVo = false;
    }
  }, [sceneState.wish3FinalMoment, isAudioOn]);

  useEffect(() => () => {
    // On unmount (navigation away), stop all voice + pending reload VO timeouts
    // so VO from this scene doesn't spill onto the next screen.
    stopSpokenVoice();
    audioStopFnsRef.current?.stopVoice?.();
    audioStopFnsRef.current?.clearAllTimeouts?.();
    window.speechSynthesis?.cancel?.();
  }, [stopSpokenVoice]);

  // Replay a contextual phase hint after tab/app return.
  // useVoiceGuidance calls onReturnHint after RESUME_DELAY_MS.
  useEffect(() => {
    if (!returnHintNonce || !isAudioOn || sceneState.showingCompletionScreen || showDrawingPad) return;
    const line = getResumeVoiceLine(sceneState.gamePhase) || getPhaseReminderLine(sceneState.gamePhase);
    if (!line) return;

    // Clear only the specific phase VO key, NOT the entire object
    // This allows phase-specific VOs to trigger after resume
    const phase = sceneState.gamePhase;
    if (phase === 'wish1-intro') phaseVoiceRef.current.wish1Intro = false;
    else if (phase === 'wish1-active') phaseVoiceRef.current.wish1Active = false;
    else if (phase === 'wish2-intro') phaseVoiceRef.current.wish2Intro = false;
    else if (phase === 'wish2-active') phaseVoiceRef.current.wish2Active = false;
    else if (phase === 'wish3-intro') phaseVoiceRef.current.wish3Intro = false;
    else if (phase === 'wish3-active') phaseVoiceRef.current.wish3Active = false;
    else if (phase === 'dream-clouded') phaseVoiceRef.current.dreamClouded = false;
    else if (phase === 'dream-clearing') phaseVoiceRef.current.dreamClearing = false;

    speakLine(line, { moment: 'encouragement' });
    const resumeNonce = returnHintNonce;
    const retry = setTimeout(() => {
      if (
        !document.hidden &&
        isAudioOn &&
        !sceneState.showingCompletionScreen &&
        !showDrawingPad &&
        returnHintNonce === resumeNonce &&
        !isSpeakingRef.current
      ) {
        speakLine(line, { moment: 'encouragement' });
      }
    }, 1500);
    return () => clearTimeout(retry);
  }, [isReload, returnHintNonce, isAudioOn, sceneState.gamePhase, sceneState.showingCompletionScreen, showDrawingPad, getResumeVoiceLine, getPhaseReminderLine]);

  // ── Dreams & Wishes hints: a simple 2-step system per beat (0 = none, 1 = reminder/clue,
  //    2 = final visual rescue — never a level 3, never a visual-only "notice" step first). ──
  // The final gap counts from when the clue FINISHES speaking, so the rescue glow never lands
  // while Ganesha is still talking. markInteraction() (real progress) restarts the cycle.
  //
  // Wish 1: ~13s clue VO ("Look for actions that help…") → remaining kind bubbles glow and stay lit.
  useEffect(() => {
    if (sceneState.gamePhase !== 'wish1-active') {
      setWish1IdleLevel(0);
      idleVoFlagsRef.current.wish1Level2 = false;
      return;
    }
    if (sceneState.showingCompletionScreen || showDrawingPad) return;
    if (phaseVoiceDoneFor !== 'wish1-active') return;

    setWish1IdleLevel(0);
    idleVoFlagsRef.current.wish1Level2 = false;

    let cancelled = false;
    let t2 = null;
    const t1 = safeSetTimeout(() => {
      setWish1IdleLevel(1);
      const armFinal = () => {
        if (cancelled) return;
        t2 = safeSetTimeout(() => setWish1IdleLevel(2), 10000);
      };
      if (!idleVoFlagsRef.current.wish1Level2) {
        idleVoFlagsRef.current.wish1Level2 = true;
        speakLine("Look for actions that help or care for someone.", { moment: 'encouragement', onEnd: armFinal });
      } else {
        armFinal();
      }
    }, 13000);

    return () => {
      cancelled = true;
      if (t1) t1();
      if (t2) t2();
    };
  }, [sceneState.gamePhase, isAudioOn, sceneState.showingCompletionScreen, showDrawingPad, safeSetTimeout, phaseVoiceDoneFor, idleHintRestartNonce]);

  // Wish 2, Wish 3, dream clouds — same two steps, ~12s to the reminder VO:
  //   Wish 2, before any food is placed: "Drag one food…" + one teaching hand, then the empty plate glows.
  //   Wish 2, after the first food (drag already learned): "There's still an empty plate." — one
  //     remaining food nudges, then the exact plate glows. Never a hand again.
  //   Wish 3: "There's still space for more to grow." — one remaining spot pulses, then glows stronger.
  //   Dream clouds: "Tap me to clear the clouds." / "Keep tapping." — then Ganesha glows.
  useEffect(() => {
    const phase = sceneState.gamePhase;
    const isWish2 = phase === 'wish2-active';
    const isWish3 = phase === 'wish3-active';
    const isDream = (phase === 'dream-clouded' || phase === 'dream-clearing') && !sceneState.dreamRevealed;

    if (!isWish2 && !isWish3 && !isDream) {
      setWish2IdleLevel(0);
      setWish2TeachingReady(false);
      setWish3IdleLevel(0);
      setChildIdleLevel(0);
      return;
    }
    if (sceneState.showingCompletionScreen || showDrawingPad) return;
    // dream-clearing has no entry VO of its own to wait for; the others do.
    if (phase !== 'dream-clearing' && phaseVoiceDoneFor !== phase) return;

    const setLevel = isWish2 ? setWish2IdleLevel : isWish3 ? setWish3IdleLevel : setChildIdleLevel;
    const clueLine = isWish2
      ? ((sceneState.wish2Taps || 0) > 0 ? "There's still an empty plate." : "Drag one food toward an empty plate.")
      : isWish3 ? "There's still space for more to grow."
      : sceneState.trunkTaps > 0 ? "Keep tapping." : "Tap me to clear the clouds.";

    setLevel(0);

    let cancelled = false;
    let t2 = null;
    const t1 = safeSetTimeout(() => {
      setLevel(1);
      const armFinal = () => {
        if (cancelled) return;
        t2 = safeSetTimeout(() => setLevel(2), 10000);
      };
      speakLine(clueLine, { moment: 'encouragement', onEnd: armFinal });
    }, 12000);

    return () => {
      cancelled = true;
      if (t1) t1();
      if (t2) t2();
    };
  }, [isAudioOn, sceneState.gamePhase, sceneState.dreamRevealed, sceneState.showingCompletionScreen, sceneState.trunkTaps, sceneState.wish2Taps, showDrawingPad, safeSetTimeout, phaseVoiceDoneFor, idleHintRestartNonce]);

  // Reset idle timer on major phase/modal transitions
  useEffect(() => {
    markInteraction();
  }, [sceneState.gamePhase, showDrawingPad, markInteraction]);


  // --- GAMEPLAY HANDLERS ---

  const handleStartGame = () => {
    markInteraction();
    interruptCurrentVoice();
    playUiTap();
    setVoiceVolume(isAudioOn ? 1 : 0);
    // No separate wish1-intro screen — land straight on wish1-active, whose
    // mount effect speaks wish1Intro then wish1Active in sequence.
    sceneActions.updateState({ gamePhase: 'wish1-active' });
  };

  const handleWish1Tap = ({ fromBubble = false } = {}) => {
    if (wish1CompletionQueuedRef.current) return;
    const currentTaps = wish1TapCountRef.current;
    if (currentTaps >= 3) return;
    markInteraction();
    if (!fromBubble) {
      interruptCurrentVoice();
      playUiTap();
    }
    triggerMiniGesture('thumbsup', 'center', 1500);
    const newTaps = currentTaps + 1;
    wish1TapCountRef.current = newTaps;
    sceneActions.updateState({ wish1Taps: newTaps });

    if (newTaps >= 3) {
      wish1CompletionQueuedRef.current = true;
      const discovery = { name: 'Kindness', image: kindnessHeaderIcon };
      safeSetTimeout(() => {
        triggerDiscoveryFly(discovery);
      }, fromBubble ? WISH1_FINAL_ICON_DELAY_MS : DISCOVERY_FLY_START_DELAY_MS);
      if (fromBubble) {
        triggerWish1Sparkle('all', 2400);
      }
      playSparkle();
      playChime();
      // Pre-mark as spoken so effect won't trigger it, then delay the actual VO
      phaseVoiceRef.current.wish1FinalMomentVo = true;
      sceneActions.updateState({
        wish1FinalMoment: true
      });
      safeSetTimeout(() => {
        const currentState = latestSceneStateRef.current || sceneState;
        sceneActions.updateState({
          storyDiscoveries: appendUniqueDiscovery(currentState.storyDiscoveries, discovery)
        });
      }, (fromBubble ? WISH1_FINAL_ICON_DELAY_MS : DISCOVERY_FLY_START_DELAY_MS) + DISCOVERY_CENTER_REACH_MS);
      queueCompletionWithCheer(VOICE_LINES.wish1Complete, {
        startDelayMs: fromBubble ? WISH1_FINAL_CHEER_DELAY_MS : COMPLETION_CHEER_DELAY_MS
      });
      safeSetTimeout(() => {
        sceneActions.updateState({
          gamePhase: 'wish2-active',
          wish1FinalMoment: false,
          wish2Taps: 0,
          bowlStates: [false, false, false],
          wish2PlateFoods: [null, null, null],
          wish2FoodPool: [...WISH2_FOOD_KEYS],
          wish2FinalMoment: false
        });
      }, 4200 + PHASE_BREATHER_MS);
    } else {
      if (fromBubble) {
        triggerWish1Sparkle('single', 1700);
      }
    }
  };

  // Bubble tap — kind actions advance wish progress; unkind actions shake + dim.
  const handleBubbleTap = (bubble) => {
    playUiTap();

    if (bubble.type === 'kind') {
      interruptCurrentVoice();
      // Only a kind (correct) bubble is progress. An unkind tap is a wrong attempt: it must not
      // reset the idle-hint ladder or dismiss a hint that is already showing.
      markInteraction();
      // Kind action: speak and advance progress
      if (bubble.voiceLine) {
        speakLine(bubble.voiceLine, { moment: 'encouragement' });
      }
      setBubbles(prev => prev.filter(b => b.id !== bubble.id));
      if (bubble.actionKey) {
        removedWish1BubbleKeysRef.current.add(bubble.actionKey);
      }
      handleWish1Tap({ fromBubble: true });
    } else {
      // Unkind action: local shake + dim only. No spoken correction — it would repeat on every
      // wrong bubble and could cut off the semantic clue that is trying to help.
      setShakingBubbleId(bubble.id);

      // Remove shake class after 200ms (animation + dim duration)
      safeSetTimeout(() => {
        setShakingBubbleId(null);
      }, 200);
    }
  };

  useEffect(() => {
    if (sceneState.gamePhase !== 'wish1-active' && wish1Sparkle.type !== null) {
      wish1SparkleCancelRef.current?.();
      wish1SparkleCancelRef.current = null;
      setWish1Sparkle(prev => ({ ...prev, type: null }));
    }
  }, [sceneState.gamePhase, wish1Sparkle.type]);

  useEffect(() => {
    if (sceneState.gamePhase !== 'wish2-active' && wish2Sparkle.type !== null) {
      wish2SparkleCancelRef.current?.();
      wish2SparkleCancelRef.current = null;
      setWish2Sparkle(prev => ({ ...prev, type: null, targetIndex: null }));
    }
  }, [sceneState.gamePhase, wish2Sparkle.type]);

  useEffect(() => {
    const allowWish3SparklePhases = new Set(['wish3-active', 'dream-clouded', 'dream-clearing']);
    if (!allowWish3SparklePhases.has(sceneState.gamePhase) && wish3Sparkle.type !== null) {
      wish3SparkleCancelRef.current?.();
      wish3SparkleCancelRef.current = null;
      setWish3Sparkle(prev => ({ ...prev, type: null }));
    }
  }, [sceneState.gamePhase, wish3Sparkle.type]);

  useEffect(() => () => {
    wish1SpawnLoopCancelRef.current?.();
    wish1SparkleCancelRef.current?.();
    wish2SparkleCancelRef.current?.();
    wish3SparkleCancelRef.current?.();
  }, []);

  // Bubble spawner effect for Wish 1
  useEffect(() => {
    activeWish1BubbleKeysRef.current = new Set(bubbles.map(b => b.actionKey));
  }, [bubbles]);

  useEffect(() => {
    if (sceneState.gamePhase !== 'wish1-active') {
      wish1SpawnLoopCancelRef.current?.();
      wish1SpawnLoopCancelRef.current = null;
      setBubbles([]);
      setShakingBubbleId(null);
      removedWish1BubbleKeysRef.current.clear();
      activeWish1BubbleKeysRef.current.clear();
      return;
    }

    const kindBubbles = [
      { actionKey: 'helping', image: helpingImg, voiceLine: 'Helping' },
      { actionKey: 'sharing', image: sharingImg, voiceLine: 'Sharing' },
      { actionKey: 'hugging', image: huggingImg, voiceLine: 'Hugging' },
      { actionKey: 'gifting', image: giftingImg, voiceLine: 'Gifting' },
    ];

    const unkindBubbles = [
      { actionKey: 'angry', image: angryImg, voiceLine: 'Angry' },
      { actionKey: 'fight', image: fightImg, voiceLine: 'Fight' },
      { actionKey: 'hit', image: hitImg, voiceLine: 'Hit' },
      { actionKey: 'teasing', image: teasingImg, voiceLine: 'Teasing' },
    ];
    const bubbleDurationSeconds = wish1IdleLevel >= 1 ? 18 : 12;
    const bubbleDurationMs = bubbleDurationSeconds * 1000;

    const spawnBubble = () => {
      if (document.hidden) return;
      if (sceneState.wish1Taps >= 3) return;
      const removed = removedWish1BubbleKeysRef.current;
      const activeKeys = activeWish1BubbleKeysRef.current;
      // Phone only: bubbles live 12-18s but spawn every ~1.8s, which stacks up to 8 on a short screen.
      if (activeKeys.size >= MAX_ACTIVE_WISH1_BUBBLES_PHONE && window.matchMedia(PHONE_LANDSCAPE_QUERY).matches) return;
      const availableKind = kindBubbles.filter(item => !removed.has(item.actionKey) && !activeKeys.has(item.actionKey));
      const availableUnkind = unkindBubbles.filter(item => !removed.has(item.actionKey) && !activeKeys.has(item.actionKey));
      if (availableKind.length === 0 && availableUnkind.length === 0) return;
      const canSpawnKind = availableKind.length > 0;
      const canSpawnUnkind = availableUnkind.length > 0;
      const isKind = canSpawnKind && (!canSpawnUnkind || Math.random() < 0.6);
      const source = isKind ? availableKind : availableUnkind;
      const data = source[Math.floor(Math.random() * source.length)];
      // Phone: re-roll a spot that would sit under the corner controls (zone badge top-left,
      // Replay / Sound bottom-right) or the Ganesha host (bottom-left). The bubble is drawn
      // centred on its (left, top) point.
      let left = Math.random() * 80 + 10;
      let top = Math.random() * 60 + 10;
      if (window.matchMedia(PHONE_LANDSCAPE_QUERY).matches) {
        const box = document.querySelector('.wish-interactive-container')?.getBoundingClientRect();
        if (box) {
          const size = Math.min(98, Math.max(84, window.innerWidth * 0.11));
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const blocked = (l, t) => {
            // bubbleFloat replaces the inner translate(-50%,-50%), so the bubble occupies
            // [point, point + size] (top-left origin), plus a little margin.
            const px = box.left + (box.width * l) / 100;
            const py = box.top + (box.height * t) / 100;
            const x0 = px - 6, x1 = px + size + 6, y0 = py - 6, y1 = py + size + 6;
            const hits = (ax0, ay0, ax1, ay1) => x1 > ax0 && x0 < ax1 && y1 > ay0 && y0 < ay1;
            return hits(0, 0, 80, 80)                      // zone badge
              || hits(vw - 130, vh - 70, vw, vh)           // Replay + Sound
              || hits(0, vh - 150, 140, vh);               // Ganesha host
          };
          for (let tries = 0; tries < 10 && blocked(left, top); tries++) {
            left = Math.random() * 80 + 10;
            top = Math.random() * 60 + 10;
          }
        }
      }
      const newBubble = {
        id: bubbleCounterRef.current++,
        type: isKind ? 'kind' : 'unkind',
        ...data,
        left,
        top,
        lifetimeS: bubbleDurationSeconds,
      };
      setBubbles(prev => [...prev, newBubble]);
      safeSetTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== newBubble.id));
      }, bubbleDurationMs);
    };

    let cancelled = false;
    const scheduleNextSpawn = (delayMs = 1800) => {
      wish1SpawnLoopCancelRef.current?.();
      wish1SpawnLoopCancelRef.current = safeSetTimeout(() => {
        if (cancelled) return;
        if (document.hidden) {
          scheduleNextSpawn(600);
          return;
        }
        spawnBubble();
        scheduleNextSpawn(1800);
      }, delayMs);
    };

    if (!document.hidden) spawnBubble();
    scheduleNextSpawn(1800);
    return () => {
      cancelled = true;
      wish1SpawnLoopCancelRef.current?.();
      wish1SpawnLoopCancelRef.current = null;
    };
  }, [sceneState.gamePhase, sceneState.wish1Taps, safeSetTimeout]);

  const firstUnfilledBowlIndex = sceneState.bowlStates.findIndex(filled => !filled);

  useEffect(() => {
    if (sceneState.gamePhase !== 'wish2-active') return;
    const noWish2Progress = sceneState.wish2Taps === 0 && (sceneState.bowlStates || []).every(v => !v);
    if (!noWish2Progress) return;
    const hasPool = Array.isArray(sceneState.wish2FoodPool) && sceneState.wish2FoodPool.length > 0;
    const hasPlateFoods = Array.isArray(sceneState.wish2PlateFoods) && sceneState.wish2PlateFoods.length === 3;
    if (!hasPool || !hasPlateFoods) {
      sceneActions.updateState({
        wish2FoodPool: [...WISH2_FOOD_KEYS],
        wish2PlateFoods: [null, null, null],
      });
    }
  }, [sceneState.gamePhase, sceneState.wish2Taps, sceneState.bowlStates, sceneState.wish2FoodPool, sceneState.wish2PlateFoods, sceneActions]);

  const getTestResetState = useCallback(() => ({
    wish1Taps: 0,
    wish1FinalMoment: false,
    wish2Taps: 0,
    wish2FinalMoment: false,
    wish3Taps: 0,
    wish3FinalMoment: false,
    bowlStates: [false, false, false],
    wish2PlateFoods: [null, null, null],
    wish2FoodPool: [...WISH2_FOOD_KEYS],
    parkStates: [false, false, false],
    trunkTaps: 0,
    storyDiscoveries: [],
    dreamRevealed: false,
    childDreamDrawing: null,
    currentModal: null,
    draftData: null,
    showingCompletionScreen: false,
    completed: false,
  }), []);

  const jumpToTestPhase = useCallback((phase) => {
    const base = getTestResetState();
    const updates = { ...base, gamePhase: phase };
    if (phase === 'wish1-complete') updates.wish1Taps = 3;
    if (['wish2-active', 'wish2-complete', 'wish3-active', 'wish3-complete', 'all-wishes-complete', 'dream-drawing', 'dream-clouded', 'dream-clearing', 'comparison-card', 'ending'].includes(phase)) {
      updates.storyDiscoveries = appendUniqueDiscovery(updates.storyDiscoveries, { name: 'Kindness', image: kindnessHeaderIcon });
    }
    if (phase === 'wish2-active') updates.wish1Taps = 3;
    if (phase === 'wish2-complete') {
      updates.wish1Taps = 3;
      updates.wish2Taps = 3;
      updates.bowlStates = [true, true, true];
      updates.wish2PlateFoods = ['apple', 'banana', 'rice'];
      updates.wish2FoodPool = [];
      updates.storyDiscoveries = appendUniqueDiscovery(updates.storyDiscoveries, { name: 'Sharing', image: sharingHeaderIcon });
    }
    if (phase === 'wish3-active') {
      updates.wish1Taps = 3;
      updates.wish2Taps = 3;
      updates.bowlStates = [true, true, true];
      updates.wish2PlateFoods = ['apple', 'banana', 'rice'];
      updates.wish2FoodPool = [];
      updates.storyDiscoveries = appendUniqueDiscovery(updates.storyDiscoveries, { name: 'Sharing', image: sharingHeaderIcon });
    }
    if (phase === 'wish3-complete') {
      updates.wish1Taps = 3;
      updates.wish2Taps = 3;
      updates.wish3Taps = 3;
      updates.bowlStates = [true, true, true];
      updates.wish2PlateFoods = ['apple', 'banana', 'rice'];
      updates.wish2FoodPool = [];
      updates.storyDiscoveries = appendUniqueDiscovery(updates.storyDiscoveries, { name: 'Sharing', image: sharingHeaderIcon });
      updates.storyDiscoveries = appendUniqueDiscovery(updates.storyDiscoveries, { name: 'Nature', image: natureHeaderIcon });
    }
    sceneActions.updateState(updates);
    markInteraction();
  }, [appendUniqueDiscovery, getTestResetState, markInteraction, sceneActions]);

  const handleWish2FoodDrop = (index, foodKey) => {
    if (!foodKey) return;
    const currentPlateFoods = sceneState.wish2PlateFoods || [null, null, null];
    const currentFoodPool = sceneState.wish2FoodPool || [...WISH2_FOOD_KEYS];
    if (currentPlateFoods[index]) return;
    if (!currentFoodPool.includes(foodKey)) return;

    markInteraction();
    interruptCurrentVoice();
    playPlace(); // food lands on the plate: soft "placed" sound, not a generic tap
    triggerMiniGesture('thumbsup', 'center', 1500);

    const newStates = [...sceneState.bowlStates];
    newStates[index] = true;
    const newPlateFoods = [...currentPlateFoods];
    newPlateFoods[index] = foodKey;
    const newFoodPool = currentFoodPool.filter(key => key !== foodKey);
    const count = newStates.filter(Boolean).length;

    sceneActions.updateState({
      bowlStates: newStates,
      wish2Taps: count,
      wish2PlateFoods: newPlateFoods,
      wish2FoodPool: newFoodPool,
    });
    setSelectedWish2FoodKey(null);

    if (count === 3) {
      const discovery = { name: 'Sharing', image: sharingHeaderIcon };
      safeSetTimeout(() => {
        triggerDiscoveryFly(discovery);
      }, DISCOVERY_FLY_START_DELAY_MS);
      triggerWish2Sparkle('all', 2400);
      playSparkle();
      playChime();
      // Trigger completion VO immediately on final tap (more reliable than waiting for effect timing).
      phaseVoiceRef.current.wish2FinalMomentVo = true;
      queueCompletionWithCheer(VOICE_LINES.wish2Complete, { startDelayMs: COMPLETION_CHEER_DELAY_MS });
      sceneActions.updateState({
        wish2FinalMoment: true
      });
      safeSetTimeout(() => {
        const currentState = latestSceneStateRef.current || sceneState;
        sceneActions.updateState({
          storyDiscoveries: appendUniqueDiscovery(currentState.storyDiscoveries, discovery)
        });
      }, DISCOVERY_FLY_START_DELAY_MS + DISCOVERY_CENTER_REACH_MS);
      safeSetTimeout(() => {
        sceneActions.updateState({
          gamePhase: 'wish3-active',
          wish2FinalMoment: false,
          wish3Taps: 0,
          parkStates: [false, false, false],
          wish3FinalMoment: false
        });
      }, 4200 + PHASE_BREATHER_MS);
    } else {
      triggerWish2Sparkle('single', 1700, index);
    }
  };

  const handleWish2PlateClick = (index) => {
    if (!selectedWish2FoodKey) return;
    handleWish2FoodDrop(index, selectedWish2FoodKey);
  };

  const handleWish3Tap = () => {
    if (sceneState.wish3Taps >= 3) return;
    markInteraction();
    interruptCurrentVoice();
    playUiTap();
    triggerMiniGesture('thumbsup', 'center', 1500);
    const newTaps = sceneState.wish3Taps + 1;
    sceneActions.updateState({ wish3Taps: newTaps });

    if (newTaps >= 3) {
      const discovery = { name: 'Nature', image: natureHeaderIcon };
      safeSetTimeout(() => {
        triggerDiscoveryFly(discovery);
      }, DISCOVERY_FLY_START_DELAY_MS);
      triggerWish3Sparkle('all', 2400);
      playSparkle();
      playChime();
      // Trigger completion VO immediately on final tap (prevents missed/cut playback).
      phaseVoiceRef.current.wish3FinalMomentVo = true;
      queueCompletionWithCheer(VOICE_LINES.wish3Complete, { startDelayMs: COMPLETION_CHEER_DELAY_MS });
      sceneActions.updateState({
        wish3FinalMoment: true
      });
      safeSetTimeout(() => {
        const currentState = latestSceneStateRef.current || sceneState;
        sceneActions.updateState({
          storyDiscoveries: appendUniqueDiscovery(currentState.storyDiscoveries, discovery)
        });
      }, DISCOVERY_FLY_START_DELAY_MS + DISCOVERY_CENTER_REACH_MS);
      safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'all-wishes-complete', wish3FinalMoment: false }); }, 5600 + PHASE_BREATHER_MS);
    } else {
      triggerWish3Sparkle('single', 1700);
    }
  };

  // Specific handler for individual park items (optional enhancement from your code logic)
  // The tap zones are large but invisible; each bare spot shows a small golden marker. The hint
  // only ever points at ONE remaining spot: it pulses (clue) then glows stronger (rescue).
  const wish3MarkerClass = (index) => {
    const isHintSpot = sceneState.parkStates.findIndex((filled) => !filled) === index;
    const level = isHintSpot ? (wish3IdleLevel >= 2 ? ' is-final' : wish3IdleLevel === 1 ? ' is-hint' : '') : '';
    return `wish3-marker${level}`;
  };

  const handleParkTap = (index) => {
    if (sceneState.parkStates[index] === true) return;
    markInteraction();
    interruptCurrentVoice();
    playUiTap();
    triggerMiniGesture('thumbsup', 'center', 1500);
    const newStates = [...sceneState.parkStates];
    newStates[index] = true;
    const count = newStates.filter(Boolean).length;

    sceneActions.updateState({ parkStates: newStates, wish3Taps: count });

    if (count === 3) {
      const discovery = { name: 'Nature', image: natureHeaderIcon };
      safeSetTimeout(() => {
        triggerDiscoveryFly(discovery);
      }, DISCOVERY_FLY_START_DELAY_MS);
      triggerWish3Sparkle('all', 2400);
      playSparkle();
      playChime();
      // Ensure completion VO is spoken before advancing to drawing intro.
      phaseVoiceRef.current.wish3FinalMomentVo = true;
      queueCompletionWithCheer(VOICE_LINES.wish3Complete, { startDelayMs: COMPLETION_CHEER_DELAY_MS });
      sceneActions.updateState({
        wish3FinalMoment: true
      });
      safeSetTimeout(() => {
        const currentState = latestSceneStateRef.current || sceneState;
        sceneActions.updateState({
          storyDiscoveries: appendUniqueDiscovery(currentState.storyDiscoveries, discovery)
        });
      }, DISCOVERY_FLY_START_DELAY_MS + DISCOVERY_CENTER_REACH_MS);
      safeSetTimeout(() => {
        sceneActions.updateState({ gamePhase: 'all-wishes-complete', wish3FinalMoment: false });
      }, 4200 + PHASE_BREATHER_MS);
    } else {
      triggerWish3Sparkle('single', 1700);
      playSparkle();
    }
  };

  const handleTrunkTap = () => {
    if (sceneState.dreamRevealed || sceneState.trunkTaps >= 3) return;
    markInteraction();
    interruptCurrentVoice();
    playUiTap();
    triggerMiniGesture('thumbsup', 'center', 1500);
    const newTaps = sceneState.trunkTaps + 1;
    sceneActions.updateState({ trunkTaps: newTaps, gamePhase: 'dream-clearing' });

    if (newTaps >= 3) {
      triggerWish3Sparkle('all', 2200);
      playSparkle();
      playChime();
      // Explicitly speak reveal VO at reveal moment for reliability.
      phaseVoiceRef.current.dreamRevealed = true;
      speakLine(VOICE_LINES.dreamRevealed, { moment: 'celebration' });
      sceneActions.updateState({ dreamRevealed: true });
    } else {
      triggerWish3Sparkle('single', 1500);
      playSparkle();
    }
  };

  // --- DRAWING HANDLERS ---

  const handleDreamDrawingSave = (data) => {
    markInteraction();
    playChime();
    setShowDrawingPad(false);
    sceneActions.updateState({
      childDreamDrawing: data.image,
      gamePhase: 'dream-clouded',
      currentModal: null, // Clear modal state
      draftData: null
    });
  };

  const handleDrawingCancel = () => {
    markInteraction();
    playUiTap();
    setShowDrawingPad(false);
    sceneActions.updateState({ currentModal: null, draftData: null, gamePhase: 'all-wishes-complete' });
  };

  const currentDiscoveries = getDiscoveries();

  return (
    <div className="dreams-wishes-game" data-zone="about-me-hut">
      {SHOW_HIT_ZONES && (
        <style>{'.dreams-wishes-game .bubble, .dreams-wishes-game .wish3-hotspot, .dreams-wishes-game .ganesha-helper { outline: 3px dashed #E91E63 !important; background-color: rgba(233, 30, 99, 0.16) !important; }'}</style>
      )}
      <img src={dreamsBg} alt="Background" className="dreams-background" />
      <ZoneBadgeButton variant="gameplay" zoneId="about-me-hut" onBack={() => {
        interruptCurrentVoice();
        SimpleSceneManager.clearCurrentScene();
        onNavigate?.('zone-welcome');
      }} />
      {/* [per-scene mute removed 2026-10-09] <AudioToggle variant="gameplay" isAudioOn={isAudioOn} onToggle={toggleAudio} /> */}
      <VOReplayButton variant="gameplay" onReplay={replayCurrentVoice} disabled={!isAudioOn} />

      {/* Story Progress Header */}
      {/* Phone: not rendered until there is a first discovery — the empty strip it drew before the
          first Wish 1 tap wasted the top of a short screen. iPad/desktop keep the old behaviour. */}
      {!sceneState.gamePhase.startsWith('dream') &&
        sceneState.gamePhase !== 'comparison-card' &&
        sceneState.gamePhase !== 'ending' &&
        (currentDiscoveries.length > 0 || !window.matchMedia(PHONE_LANDSCAPE_QUERY).matches) && (
          <StoryProgressHeader discoveries={currentDiscoveries} isChildMode={false} />
        )}

      {discoveryFly && (
        <div
          key={discoveryFly.key}
          className="discovery-fly"
          style={{ '--discovery-duration': `${discoveryFly.durationMs || DISCOVERY_FLY_TOTAL_MS}ms` }}
          aria-hidden="true"
        >
          {discoveryFly.image ? (
            <img src={discoveryFly.image} alt={discoveryFly.name} className="discovery-fly-image" />
          ) : (
            <span className="discovery-fly-emoji">{discoveryFly.emoji}</span>
          )}
        </div>
      )}

      {sceneState.gamePhase === 'intro' && (
        <OpeningModal
          zoneId="about-me-hut"
          sceneId="dreams-wishes"
          onStart={handleStartGame}
          characterImg={babyGaneshaImg}
          showButton={openingButtonVisible}
        />
      )}

      {/* Wish 1 Active */}
      {sceneState.gamePhase === 'wish1-active' && (
        <div className="wish-screen">
          <AboutMeGaneshaHost image={babyGaneshaImg} className="about-me-ganesha-host--left-bottom" />
          <div className="game-header-hud">
            {/* Header instruction commented out - using progress header instead */}
            {/* <div className="wish-instruction-bubble">Tap the earth 3 times to send smiles! ({sceneState.wish1Taps}/3)</div> */}
            <div className="wish-progress-header">
              <div className="wish-progress-title">Wish 1: Make Earth Smile</div>
              <div className="wish-progress-count">{sceneState.wish1Taps}/3</div>
            </div>
          </div>
          <div className="wish-interactive-container">
            <div className="earth-container earth-readonly wish1-earth" style={{ width: '252px', height: '252px' }}>
              <img src={wishEarthSad} alt="Sad" className="earth-image sad" style={{ opacity: !earthHappyReady || sceneState.wish1Taps === 0 ? 1 : sceneState.wish1Taps === 1 ? 0.6 : sceneState.wish1Taps === 2 ? 0.3 : 0 }} />
              <img src={wishEarthHappy} alt="Happy" className={`earth-image happy ${sceneState.wish1Taps >= 3 ? 'complete-glow-pulse' : ''}`} style={{ opacity: !earthHappyReady || sceneState.wish1Taps === 0 ? 0 : sceneState.wish1Taps === 1 ? 0.4 : sceneState.wish1Taps === 2 ? 0.7 : 1 }} />
              {wish1Sparkle.type === 'single' && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 40, pointerEvents: 'none' }}>
                  <SparkleAnimation
                    key={`wish1-single-${wish1Sparkle.key}`}
                    type="magic"
                    count={14}
                    color="rgba(255, 210, 92, 0.98)"
                    size={10}
                    duration={1700}
                    fadeOut={true}
                    area="full"
                  />
                </div>
              )}
              {wish1Sparkle.type === 'all' && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 40, pointerEvents: 'none' }}>
                  <SparkleAnimation
                    key={`wish1-all-${wish1Sparkle.key}`}
                    type="magic"
                    count={42}
                    color="rgba(255, 214, 102, 0.92)"
                    size={12}
                    duration={2400}
                    fadeOut={true}
                    area="full"
                  />
                </div>
              )}
            </div>
            <div className="faces-container wish1-face-orbit">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="face-emoji" style={{ transform: `rotate(${i * 60}deg) translate(155px) rotate(-${i * 60}deg)`, fontSize: '40px', marginTop: '-20px', marginLeft: '-20px', opacity: sceneState.wish1Taps >= 2 ? 0.6 : 1, transition: 'all 0.6s ease' }}>{sceneState.wish1Taps >= 3 ? '😊' : sceneState.wish1Taps >= 2 ? '😐' : '😢'}</div>
              ))}
            </div>
            {/* Bubbles */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 12 }}>
              {bubbles.map(bubble => (
                <div
                  key={bubble.id}
                  className={`wish1-bubble-shell ${shakingBubbleId === bubble.id ? 'bubble-wrong-shake' : ''} ${
                    bubble.type === 'kind' && wish1IdleLevel >= 2 ? 'wish1-hint-final' : ''
                  }`}
                  style={{
                    position: 'absolute',
                    left: `${bubble.left}%`,
                    top: `${bubble.top}%`,
                    width: 'clamp(104px, 12.8vw, 160px)',
                    height: 'clamp(104px, 12.8vw, 160px)',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    onClick={() => handleBubbleTap(bubble)}
                    className="bubble"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      cursor: 'pointer',
                      userSelect: 'none',
                      animation: `bubbleFloat ${bubble.lifetimeS || 12}s linear forwards`,
                      transform: 'translate(-50%, -50%)',
                      width: 'clamp(104px, 12.8vw, 160px)',
                      height: 'clamp(104px, 12.8vw, 160px)',
                      borderRadius: '50%',
                      border: 'none',
                      background: bubble.type === 'kind' ? '#FFF4DE' : '#F0E2CC',
                      boxShadow: 'inset 0 8px 14px rgba(255,255,255,0.55), inset 0 -8px 16px rgba(142,101,46,0.24), 0 8px 18px rgba(86,56,24,0.18)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      pointerEvents: 'auto',
                    }}
                  >
                    <img
                      src={bubble.image}
                      alt={bubble.type === 'kind' ? 'Kind action' : 'Unkind action'}
                      style={{
                        width: '74%',
                        height: '74%',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wish 1 Complete */}
      {/*
      {sceneState.gamePhase === 'wish1-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          <div className="success-message-large">You made the world smile! 😊✨</div>
          <div className="soft-thank-you">Thank you for helping me 💛</div>
          <div className="wish-checkmark">🌱 1 of 3 wishes complete</div>
          <div className="celebration-elements">{Array.from({ length: 15 }).map((_, i) => <div key={i} className="floating-element" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}>😊</div>)}</div>
        </div>
      )}
      */}

      {/* Wish 2 Intro (disabled: flow goes directly to wish2-active) */}
      {false && sceneState.gamePhase === 'wish2-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">My second wish is that no one feels hungry.</p>
            <p className="wish-intro-text">Let's share our food with everyone!</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => {
                interruptCurrentVoice();
                playUiTap();
                phaseVoiceRef.current.wish2Active = false; // allow VO to fire fresh on entry
                sceneActions.updateState({ gamePhase: 'wish2-active' });
              }}
            >
              Let's Share!
            </Button>
          </div>
        </div>
      )}

      {/* Wish 2 Active */}
      {sceneState.gamePhase === 'wish2-active' && (
        <>
          <AboutMeGaneshaHost image={babyGaneshaImg} className="about-me-ganesha-host--left-bottom" />
          <Wish2PlateDropGame
            sceneState={sceneState}
            wish2IdleLevel={wish2IdleLevel}
            wish2TeachingReady={wish2TeachingReady}
            firstUnfilledBowlIndex={firstUnfilledBowlIndex}
            selectedWish2FoodKey={selectedWish2FoodKey}
            setSelectedWish2FoodKey={setSelectedWish2FoodKey}
            markInteraction={markInteraction}
            handleWish2FoodDrop={handleWish2FoodDrop}
            handleWish2PlateClick={handleWish2PlateClick}
            wish2Sparkle={wish2Sparkle}
            WISH2_FOOD_KEYS={WISH2_FOOD_KEYS}
            WISH2_FOOD_ASSETS={WISH2_FOOD_ASSETS}
            WISH2_FOOD_POSITIONS={WISH2_FOOD_POSITIONS}
            WISH2_PLATE_POSITIONS={WISH2_PLATE_POSITIONS}
            plateImg={plateImg}
            onWish2Miss={() => playWrongTap()}
            cowImg={cowImg}
            mouseImg={mouseImg}
            peacockImg={peacockImg}
          />
        </>
      )}

      {/* Wish 2 Complete */}
      {/*
      {sceneState.gamePhase === 'wish2-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          <div className="success-message-large">You filled hearts with sharing! ✨</div>
          <div className="soft-thank-you">Thank you for caring so much 💛</div>
          <div className="wish-checkmark">🌱 2 of 3 wishes complete</div>
          <div className="celebration-elements">{Array.from({ length: 15 }).map((_, i) => <div key={i} className="floating-element" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}>❤️</div>)}</div>
        </div>
      )}
      */}

      {/* Wish 3 Intro (disabled: flow goes directly to wish3-active) */}
      {false && sceneState.gamePhase === 'wish3-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">My last wish is for a green world full of life.</p>
            <p className="wish-intro-text">Let's help this forest grow!</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => {
                interruptCurrentVoice();
                playUiTap();
                phaseVoiceRef.current.wish3Active = false; // allow VO to fire fresh on entry
                sceneActions.updateState({ gamePhase: 'wish3-active' });
              }}
            >
              Let's Make It Green!
            </Button>
          </div>
        </div>
      )}

      {/* Wish 3 Active */}
      {sceneState.gamePhase === 'wish3-active' && (
        <div className="wish-screen">
          <AboutMeGaneshaHost image={babyGaneshaImg} className="about-me-ganesha-host--left-bottom" />
          <div className="game-header-hud">
            <div className="wish-progress-header">
              <div className="wish-progress-title">Wish 3: Grow The Forest</div>
              <div className="wish-progress-count">{sceneState.wish3Taps}/3</div>
            </div>
          </div>
          <div className="wish-interactive-container">
            <div className="park-scene" style={{ position: 'relative', overflow: 'hidden' }}>
              {/* Base landscape image */}
              <img
                src={baseImg}
                alt="Forest landscape"
                className={`park-ground-image green ${sceneState.wish3Taps >= 3 ? 'complete-glow-pulse' : ''}`}
              />

              {/* Hotspot 0: Left - Flower reveal */}
              {/* Hotspots sit over the PAINTED pixels of the art they reveal: the wrapper has the same
                  box as the revealed image, the hotspot is the art's visible bounds inside it. */}
              <div className="wish3-reveal wish3-reveal--flower" style={{ position: 'absolute', left: '8%', bottom: '15%', width: '190px', height: '190px', pointerEvents: 'none', zIndex: 10 }}>
              <div
                onClick={() => handleParkTap(0)}
                className="wish3-hotspot"
                style={{
                  position: 'absolute',
                  left: '15.2%',
                  top: '37.9%',
                  width: '69.2%',
                  height: '33.6%',
                  pointerEvents: 'auto',
                  cursor: sceneState.parkStates[0] ? 'default' : 'pointer',
                  borderRadius: '50%',
                  zIndex: 10,
                }}
              >
                {!sceneState.parkStates[0] && <span className={wish3MarkerClass(0)} />}
              </div>
              </div>
              {sceneState.parkStates[0] && (
                <img
                  src={flowerImg}
                  alt="Flower"
                  className="wish3-reveal-art wish3-reveal-art--flower"
                  style={{ position: 'absolute', left: '8%', bottom: '15%', width: '190px', height: 'auto', zIndex: 5 }}
                />
              )}

              {/* Hotspot 1: Center - Bush + Butterfly reveal */}
              <div className="wish3-reveal wish3-reveal--bush" style={{ position: 'absolute', left: '48%', transform: 'translateX(-50%)', bottom: '12%', width: '210px', height: '210px', pointerEvents: 'none', zIndex: 10 }}>
              <div
                onClick={() => handleParkTap(1)}
                className="wish3-hotspot"
                style={{
                  position: 'absolute',
                  left: '15.2%',
                  top: '31.3%',
                  width: '70.7%',
                  height: '38.2%',
                  pointerEvents: 'auto',
                  cursor: sceneState.parkStates[1] ? 'default' : 'pointer',
                  borderRadius: '50%',
                  zIndex: 10,
                }}
              >
                {!sceneState.parkStates[1] && <span className={wish3MarkerClass(1)} />}
              </div>
              </div>
              {sceneState.parkStates[1] && (
                <>
                  <img
                    src={bushImg}
                    alt="Bush"
                    className="wish3-reveal-art wish3-reveal-art--bush"
                    style={{ position: 'absolute', left: '48%', transform: 'translateX(-50%)', bottom: '12%', width: '210px', height: 'auto', zIndex: 5 }}
                  />
                  <img
                    src={butterflyImg}
                    alt="Butterfly"
                    className="wish3-butterfly"
                    style={{ position: 'absolute', left: '55%', transform: 'translateX(-50%)', bottom: '35%', width: '80px', height: 'auto', zIndex: 6 }}
                  />
                </>
              )}

              {/* Hotspot 2: Right - Tree + Bird reveal */}
              <div className="wish3-reveal wish3-reveal--tree" style={{ position: 'absolute', right: '5%', bottom: '5%', width: '300px', height: '300px', pointerEvents: 'none', zIndex: 10 }}>
              <div
                onClick={() => handleParkTap(2)}
                className="wish3-hotspot"
                style={{
                  position: 'absolute',
                  left: '25.4%',
                  top: '21.5%',
                  width: '50.4%',
                  height: '55.8%',
                  pointerEvents: 'auto',
                  cursor: sceneState.parkStates[2] ? 'default' : 'pointer',
                  borderRadius: '50%',
                  zIndex: 10,
                }}
              >
                {!sceneState.parkStates[2] && <span className={wish3MarkerClass(2)} />}
              </div>
              </div>
              {sceneState.parkStates[2] && (
                <>
                  <img
                    src={treeImg}
                    alt="Tree"
                    className="wish3-reveal-art wish3-reveal-art--tree"
                    style={{ position: 'absolute', right: '5%', bottom: '5%', width: '300px', height: 'auto', zIndex: 5 }}
                  />
                  <img
                    src={birdImg}
                    alt="Bird"
                    className="wish3-bird"
                    style={{ position: 'absolute', right: '18%', bottom: '50%', width: '90px', height: 'auto', zIndex: 6 }}
                  />
                </>
              )}

              {/* Sparkle animations */}
              {wish3Sparkle.type === 'single' && (
                <SparkleAnimation
                  key={`wish3-single-${wish3Sparkle.key}`}
                  type="magic"
                  count={14}
                  color="rgba(255, 210, 92, 0.98)"
                  size={10}
                  duration={1700}
                  fadeOut={true}
                  area="full"
                />
              )}
              {wish3Sparkle.type === 'all' && (
                <SparkleAnimation
                  key={`wish3-all-${wish3Sparkle.key}`}
                  type="magic"
                  count={42}
                  color="rgba(255, 214, 102, 0.92)"
                  size={12}
                  duration={2400}
                  fadeOut={true}
                  area="full"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wish 3 Complete */}
      {/*
      {sceneState.gamePhase === 'wish3-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          <div className="success-message-large">You made the world green and playful! ✨</div>
          <div className="soft-thank-you">Thank you for helping the Earth 💛</div>
          <div className="wish-checkmark">🌱 3 of 3 wishes complete</div>
          <div className="celebration-elements">{Array.from({ length: 15 }).map((_, i) => <div key={i} className="floating-element" style={{ left: `${Math.random() * 100}%` }}>🌸</div>)}</div>
        </div>
      )}
      */}

      {/* All Wishes Complete → Combined Modal (Goes straight to drawing) */}
      {sceneState.gamePhase === 'all-wishes-complete' && (
        <div className="intro-overlay dreams-turn-overlay">
          <img src={babyGaneshaSit} alt="Baby Ganesha" className="intro-ganesha celebrate-scale" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">You made the world brighter!</p>
            <p className="wish-intro-text">Now it's your turn.<br />Draw your happy wish on this magic canvas!</p>
            <Button
              variant="primary"
              size="large"
              className="dreams-brown-cta"
              onClick={() => {
                interruptCurrentVoice();
                playUiTap();
                setShowDrawingPad(true);
                sceneActions.updateState({ gamePhase: 'dream-drawing', currentModal: 'drawing' });
              }}
            >
              Start Drawing
            </Button>
          </div>
        </div>
      )}

      {/* Dream Intro — Commented out, now merged into all-wishes-complete modal */}
      {/*
      {sceneState.gamePhase === 'dream-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">Draw a happy wish on this magic canvas!</p>
            <p className="wish-intro-text">What would you love to draw today?</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => {
                playUiTap();
                setShowDrawingPad(true);
                sceneActions.updateState({ gamePhase: 'dream-drawing', currentModal: 'drawing' });
              }}
            >
              Start Drawing!
            </Button>
          </div>
        </div>
      )}
      */}

      {/* Drawing Pad */}
      {showDrawingPad && (
        <div className="drawing-overlay dreams-drawing-overlay">
          <DrawingPad
            prompt="Draw your dream"

            initialData={sceneState.draftData} // Restore draft if reloaded
            onAutoSave={(data) => sceneActions.updateState({ draftData: data })} // Save as they draw

            onSave={handleDreamDrawingSave}
            onCancel={handleDrawingCancel}
          />
        </div>
      )}

      {/* Dream Clouded / Clearing */}
      {(sceneState.gamePhase === 'dream-clouded' || sceneState.gamePhase === 'dream-clearing') && (
        <div className="dream-screen">
          {wish3Sparkle.type && !sceneState.dreamRevealed && (
            <div className="dream-clearing-sparkles">
              <SparkleAnimation
                key={`dream-cloud-${wish3Sparkle.type}-${wish3Sparkle.key}`}
                type="magic"
                count={wish3Sparkle.type === 'all' ? 42 : 22}
                color="rgba(255, 214, 102, 0.98)"
                size={wish3Sparkle.type === 'all' ? 14 : 12}
                duration={wish3Sparkle.type === 'all' ? 2200 : 1500}
                fadeOut={true}
                area="full"
              />
            </div>
          )}
          {/* Sparkles when dream revealed */}
          {sceneState.dreamRevealed && (
            <div className="dream-clearing-sparkles">
              <SparkleAnimation
                type="magic"
                duration={2000}
                area="full"
              />
            </div>
          )}
          <div className="dream-container">
            <div className="dream-drawing-display">
              {sceneState.dreamRevealed && <div className="canvas-glow" />}
              {sceneState.childDreamDrawing && <img src={sceneState.childDreamDrawing} alt="Dream" className={`dream-image ${sceneState.dreamRevealed ? 'dream-image-pulse' : ''}`} style={{ filter: sceneState.dreamRevealed ? 'none' : (sceneState.trunkTaps === 3 ? 'none' : 'blur(6px)'), opacity: sceneState.dreamRevealed ? 1 : (0.5 + (sceneState.trunkTaps * 0.15)), boxShadow: sceneState.dreamRevealed ? '0 0 40px rgba(242, 215, 167, 0.6), 0 0 80px rgba(242, 215, 167, 0.3)' : 'none', position: 'relative', zIndex: 2 }} />}
              {sceneState.dreamRevealed && (
                <div className="sparkle-ring">
                  <span className="sparkle s1" />
                  <span className="sparkle s2" />
                  <span className="sparkle s3" />
                  <span className="sparkle s4" />
                  <span className="sparkle s5" />
                  <span className="sparkle s6" />
                </div>
              )}
            </div>
            <div className="clouds-container">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`dream-cloud cloud-${i + 1} ${sceneState.trunkTaps > i ? 'cloud-fade' : ''}`}><img src={cloudImg} alt="Cloud" className="cloud-icon" /></div>
              ))}
            </div>
            <div
              key={`ganesha-helper-${ganeshaReactKey}`}
              className={`ganesha-helper ${sceneState.trunkTaps > 0 ? 'ganesha-blowing' : ''} ${childIdleLevel >= 2 ? 'dream-trunk-hint-final' : ''} ${ganeshaReactKey > 0 && sceneState.dreamRevealed ? 'ganesha-react' : ''}`}
              onClick={handleTrunkTap}
            >
              <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-trunk bounce-gentle" />
            </div>
          </div>
          {/* Instruction box hidden */}
          {/* <div className="dream-instruction-box">
            {sceneState.trunkTaps === 0 ? "Tap my trunk 3 times to move the clouds! ☁️" : sceneState.trunkTaps < 3 ? `Tap again! (${sceneState.trunkTaps}/3)` : "Yay! Your dream is clear now! 🌟"}
          </div> */}
        </div>
      )}


      {/* Comparison Card */}
      {sceneState.gamePhase === 'comparison-card' && !sceneState.showingCompletionScreen && (
        <div className="friendship-overlay">
          {/* Subtle background sparkles */}
          <SparkleAnimation
            type="star"
            duration={3000}
            area="full"
          />
          <h1 className="friendship-title">We Both Have Wishes</h1>
          <p className="friendship-subtitle">Everyone can dream about something different.</p>
          <div className="friendship-grid">
            <div className="friend-column ganesha-card">
              <div className="dream-card-header">
              <img src={babyGaneshaSit} alt="Ganesha" className="column-header-image" />
              <div className="column-label">My Wishes</div>
              </div>
              <div className="friend-items-grid">
                <div className="friend-item">
                  <div className="friend-item-label">Wish 1</div>
                  <img src={kindnessHeaderIcon} alt="Kindness wish" className="friend-item-img" />
                  <div className="friend-item-text">Happiness</div>
                </div>
                <div className="friend-item">
                  <div className="friend-item-label">Wish 2</div>
                  <img src={sharingHeaderIcon} alt="Sharing wish" className="friend-item-img" />
                  <div className="friend-item-text">Sharing</div>
                </div>
                <div className="friend-item">
                  <div className="friend-item-label">Wish 3</div>
                  <img src={natureHeaderIcon} alt="Nature wish" className="friend-item-img" />
                  <div className="friend-item-text">Green World</div>
                </div>
              </div>
              {/*
              <div className="wishes-list">
                <div className="wish-item"><span className="wish-icon">😊</span> Happiness ✓</div>
                <div className="wish-item"><span className="wish-icon">🤝</span> Sharing ✓</div>
                <div className="wish-item"><span className="wish-icon">🌳</span> Earth ✓</div>
              </div>
              */}
            </div>
            <div className="friend-column you-card">
              <div className="dream-card-header">
              {activeProfile?.icon ? (
                <img
                  src={activeProfile.icon}
                  alt="Profile"
                  className="dream-comparison-avatar"
                  style={{ width: 'clamp(55px, 7vw, 80px)', height: 'clamp(55px, 7vw, 80px)', borderRadius: '50%', objectFit: 'cover', marginBottom: 0, boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
                />
              ) : profileAvatarImage ? (
                <img
                  src={profileAvatarImage}
                  alt={profileDisplayName}
                  className="dream-comparison-avatar"
                  style={{ width: 'clamp(55px, 7vw, 80px)', height: 'clamp(55px, 7vw, 80px)', borderRadius: '50%', objectFit: 'cover', marginBottom: 0, boxShadow: '0 5px 15px rgba(0,0,0,0.2)', border: '4px solid white' }}
                />
              ) : (
                <div
                  className="dream-comparison-avatar"
                  style={{
                    width: 'clamp(55px, 7vw, 80px)',
                    height: 'clamp(55px, 7vw, 80px)',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                    border: '4px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: 'clamp(28px, 3.6vw, 40px)',
                    color: 'white',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    marginBottom: 0,
                  }}
                >
                  {profileAvatar}
                </div>
              )}
              <div className="column-label">{profileDisplayName}'s Dream</div>
              </div>
              <div className="dream-display-box">
                {sceneState.childDreamDrawing ? <img src={sceneState.childDreamDrawing} alt="Dream" className="dream-thumbnail" /> : "Loading..."}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              playChime();
              SimpleSceneManager.clearCurrentScene();
              sceneActions.updateState({ showingCompletionScreen: true, completed: true });
            }}
            className="continue-btn-simple done-btn-pulse dreams-brown-cta"
          >
            Continue
          </button>
        </div>
      )}

      {/* Ending */}
      {/*
      {sceneState.gamePhase === 'ending' && !sceneState.showingCompletionScreen && (
        <div className="ending-screen">
          <img src={babyGaneshaSit} alt="Ganesha" className="ganesha-final celebrate-scale" />
          <div className="final-title">Dreams Connected! 🌟</div>
        </div>
      )}
      */}

      {/* Resume Popup - Removed */}
      {/*
      {showResumePopup && (
        <div style={{
          position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%)', color: 'white',
          padding: '20px 40px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          zIndex: 9999, fontSize: '18px', fontWeight: 'bold'
        }}>
          {resumeMessage}
        </div>
      )}
      */}

      {/* Resume Countdown */}
      <ResumeCountdown value={countdownValue} />

      {/* Mini Gesture (Thumbs Up) on Success */}
      {miniGesture.show && (
        <GaneshaGestureCue
          key={miniGesture.key}
          gestureType={miniGesture.type}
          position={miniGesture.position}
          anchor={miniGesture.anchor}
          size={72}
        />
      )}

      {/* Completion Modal */}
      {sceneState.showingCompletionScreen && (
        <div className="dreams-completion-overlay-tint">
          <SceneCompletionCelebration
            show={sceneState.showingCompletionScreen}
            zoneId="about-me-hut"
            sceneId="dreams-wishes"
            sceneName="Our Wishes & Dreams"
            completionTitle={completionModalContent?.title}
            completionSubtitle={completionModalContent?.subtitle}
            discoveredSymbols={completionIcons}
            symbolImages={{
              'wish-heart': wishHeartIcon,
              'wish-star': wishStarIcon,
              'wish-world': wishWorldIcon,
              'wish-earth': wishIconEarth,
              'wish-share': wishIconShare,
              'wish-flower': wishIconFlower
            }}
            starsEarned={sceneState.stars}
            totalStars={3}
            nextSceneName="My Indian Story"
            childName={profileDisplayName}
            isFinalScene={false}
            completionData={{
              completed: true,
              stars: sceneState.stars || 3
            }}
            onContinue={() => {
              playUiTap();
              hardStopSceneAudio();
              const profileId = GameStateManager.getCurrentProfile()?.id;
              if (profileId) {
                ProgressManager.updateSceneCompletion(profileId, 'about-me-hut', 'dreams-wishes', {
                  completed: true,
                  stars: sceneState.stars || 3
                });
              }
              SimpleSceneManager.setCurrentScene('about-me-hut', 'my-indian-story', false, false);
              if (onNavigate) onNavigate('my-indian-story');
              else if (onComplete) onComplete();
            }}
            onExploreZones={() => {
              playUiTap();
              hardStopSceneAudio();
              SimpleSceneManager.clearCurrentScene();
              if (onNavigate) onNavigate('zones');
            }}
            onReplay={() => {
              playUiTap();
              hardStopSceneAudio();
              SimpleSceneManager.setCurrentScene('about-me-hut', 'dreams-wishes', false, false);
              // No manual opening-VO call here: the shared OpeningModal remounts
              // fresh at gamePhase 'intro' and speaks its own voiceover on mount.
              phaseVoiceRef.current = {};

              sceneActions.updateState({
                gamePhase: 'intro',
                wish1Taps: 0,
                wish1FinalMoment: false,
                wish2Taps: 0,
                wish2FinalMoment: false,
                wish3Taps: 0,
                wish3FinalMoment: false,
                bowlStates: [false, false, false],
                wish2PlateFoods: [null, null, null],
                wish2FoodPool: [...WISH2_FOOD_KEYS],
                parkStates: [false, false, false],
                trunkTaps: 0,
                storyDiscoveries: [],
                dreamRevealed: false,
                childDreamDrawing: null,
                draftData: null,
                currentModal: null,
                showingCompletionScreen: false,
                completed: false
              });
            }}
            onBackToMap={() => {
              playUiTap();
              hardStopSceneAudio();
              SimpleSceneManager.clearCurrentScene();
              if (onNavigate) onNavigate('zone-welcome');
              else if (onBack) onBack();
            }}
            onHome={() => {
              playUiTap();
              hardStopSceneAudio();
              SimpleSceneManager.clearCurrentScene();
              if (onNavigate) onNavigate('home');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DreamsWishesGame;
