import React, { useState, useEffect, useRef, useCallback } from 'react';
import './DreamsWishesGame.css';
import SceneCompletionCelebration from "../../../lib/components/celebration/SceneCompletionCelebration";
import DrawingPad from '../components/Drawingpad';
import StoryProgressHeader from '../components/StoryProgressHeader';
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
import HomeButton from '../../../lib/components/ui/HomeButton';
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
const DreamsWishesGameContent = ({ sceneState, sceneActions, isReload, onComplete, onNavigate, onBack }) => {
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
    // Opening Modal
    opening: "I have a few wishes for the world. Will you help me?",

    // Wish 1
    wish1Intro: "My first wish is for more kindness.",
    wish1Active: "Tap the kind actions you can spot.",
    wish1Complete: "You found all the kind choices.",

    // Wish 2
    wish2Intro: "My next wish is for everyone to have food.",
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
    dreamClouded: "Your dream is hidden by the clouds. Tap my trunk to clear them.",
    dreamClearing: "There are still clouds in the way.",
    dreamRevealed: "There it is — your dream!",

    // Comparison Card
    comparison: "Everyone can dream about something different.",
    completionCelebration: "You helped my wishes grow, and made a dream of your own.",

    // Ending
    ending: "You helped my wishes grow, and made a dream of your own.",

    // Idle hints
    wish1Hint: "Can you find another kind action?",
    wish2Hint: "There's still an empty plate.",
    wish3Hint: "There's still space for more to grow."
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
  const completionIcons = openingModalContent?.icons || ['wish-heart', 'wish-star', 'wish-world'];

  // --- LOCAL UI STATE (Not saved in DB) ---
  // ── Resume Delay (shared across pause/resume logic) ──────────────────────────
  const RESUME_DELAY_MS = 3000;
  const OPENING_VO_VOLUME = 0.55;

  const { isAudioOn, toggleAudio } = useAudioPreference();

  const [returnHintNonce, setReturnHintNonce] = useState(0);
  const [wish1IdleLevel, setWish1IdleLevel] = useState(0);
  const [wish2IdleLevel, setWish2IdleLevel] = useState(0);
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
  const markInteraction = useCallback(() => {
    lastInteractionAtRef.current = Date.now();
    resetIdleHintsForActiveWish();
  }, [resetIdleHintsForActiveWish]);

  // ── Callback for pause/resume (fires after resumeDelay via useVoiceGuidance) ─
  const onReturnHint = useCallback(() => {
    setReturnHintNonce(n => n + 1);
  }, []);

  // ── T08/T09: visibility + idle timer infrastructure ──────────────────────────
  const { startIdleTimer, stopIdleTimer, setCurrentPhase, stopVoice, setVoiceVolume, startMusic, stopMusic, playVoice } = useVoiceGuidance(
    'about-me-hut', 'dreams-wishes', {
      enableMusic: true,
      musicVolume: 0.06,
      idleTimeout: 20,
      resumeDelay: RESUME_DELAY_MS,  // ← Wait before replaying VO
      onReturnHint                     // ← Called when child returns
    }
  );
  const { playUiTap, playSparkle, playChime, playGlow, setGlobalVolume } = useGameSounds();
  const { speak, stop: stopSpokenVoice, isSpeaking } = useGaneshaVoice();
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

  // Stop all voice when audio is toggled off
  useEffect(() => {
    if (!isAudioOn) {
      stopVoice();
      stopSpokenVoice();
    }
  }, [isAudioOn, stopVoice, stopSpokenVoice]);

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
    if (!isAudioOn || !text) {
      options.onEnd?.();
      return;
    }
    const { onStart, onEnd, onError, moment = 'encouragement' } = options;
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
        return "Tap my trunk to clear the clouds.";
      case 'dream-clearing':
        return null;
      default:
        return null;
    }
  }, [sceneState.dreamRevealed]);

  const getResumeVoiceLine = useCallback((phase) => {
    switch (phase) {
      case 'intro':
        return VOICE_LINES.opening;
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
      playVoice('opening');
      return;
    }
    const line = getResumeVoiceLine(sceneState.gamePhase) || getPhaseReminderLine(sceneState.gamePhase);
    if (!line) return;
    speakLine(line, { moment: sceneState.gamePhase === 'ending' ? 'closing' : 'encouragement' });
  }, [VOICE_LINES.completionCelebration, getPhaseReminderLine, getResumeVoiceLine, isAudioOn, playVoice, sceneState.gamePhase, sceneState.showingCompletionScreen, setVoiceVolume]);

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
    if (!isReload) return;

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

    // Completion phases — roll back to the active phase and replay its VO
    if (gamePhase === 'wish1-complete') {
      phaseVoiceRef.current.wish1Active = true;
      sceneActions.updateState({ gamePhase: 'wish1-active', wish1Taps: 0, wish1FinalMoment: false });
      safeSetTimeout(() => { speakLine(VOICE_LINES.wish1Active, { moment: 'encouragement' }); }, 500);
      return;
    }
    if (gamePhase === 'wish2-complete') {
      phaseVoiceRef.current.wish2Active = true;
      sceneActions.updateState({ gamePhase: 'wish2-active', wish2Taps: 0, bowlStates: [false, false, false], wish2PlateFoods: [null, null, null], wish2FoodPool: [...WISH2_FOOD_KEYS], wish2FinalMoment: false });
      safeSetTimeout(() => { speakLine(VOICE_LINES.wish2Active, { moment: 'encouragement' }); }, 500);
      return;
    }
    if (gamePhase === 'wish3-complete') {
      phaseVoiceRef.current.wish3Active = true;
      sceneActions.updateState({ gamePhase: 'wish3-active', wish3Taps: 0, parkStates: [false, false, false], wish3FinalMoment: false });
      safeSetTimeout(() => { speakLine(VOICE_LINES.wish3Active, { moment: 'encouragement' }); }, 500);
      return;
    }

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
    if (gamePhase === 'wish2-intro') {
      phaseVoiceRef.current.wish2Active = true;
      sceneActions.updateState({ gamePhase: 'wish2-active', wish2Taps: 0, bowlStates: [false, false, false], wish2PlateFoods: [null, null, null], wish2FoodPool: [...WISH2_FOOD_KEYS], wish2FinalMoment: false });
      safeSetTimeout(() => { speakLine(VOICE_LINES.wish2Active, { moment: 'encouragement' }); }, 500);
      return;
    }
    if (gamePhase === 'wish3-intro') {
      phaseVoiceRef.current.wish3Active = true;
      sceneActions.updateState({ gamePhase: 'wish3-active', wish3Taps: 0, parkStates: [false, false, false], wish3FinalMoment: false });
      safeSetTimeout(() => { speakLine(VOICE_LINES.wish3Active, { moment: 'encouragement' }); }, 500);
      return;
    }

    // All wishes complete
    if (gamePhase === 'all-wishes-complete') {
      phaseVoiceRef.current.allWishesComplete = true;
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

    // Intro / comparison / ending — just replay VO
    if (gamePhase === 'intro') {
      phaseVoiceRef.current.opening = true;
      safeSetTimeout(() => {
        setVoiceVolume(isAudioOnRef.current ? OPENING_VO_VOLUME : 0);
        playVoice('opening');
      }, 500);
      return;
    }
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
    // Opening modal intro VO — matches working Family Tree pattern:
    // 800ms delay gives the audio pipeline time to initialize on first mount,
    // and the cleanup cancels the pending call if phase changes before it fires.
    // We set phaseVoiceRef.current.opening INSIDE the timer (not before) so a
    // silently-failed playVoice can be retried on the next render.
    if (sceneState.gamePhase === 'intro' && !phaseVoiceRef.current.opening) {
      const cancel = safeSetTimeout(() => {
        phaseVoiceRef.current.opening = true;
        setVoiceVolume(isAudioOn ? OPENING_VO_VOLUME : 0);
        playVoice('opening');
      }, 800);
      return () => cancel?.();
    }

    // Wish 1
    if (sceneState.gamePhase === 'wish1-intro' && !phaseVoiceRef.current.wish1Intro) {
      phaseVoiceRef.current.wish1Intro = true;
      speakLine(VOICE_LINES.wish1Intro, { moment: 'story' });
    }
    if (sceneState.gamePhase === 'wish1-active' && !phaseVoiceRef.current.wish1Active) {
      phaseVoiceRef.current.wish1Active = true;
      speakLine(VOICE_LINES.wish1Active, { moment: 'encouragement' });
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
      speakLine(VOICE_LINES.wish2Active, { moment: 'encouragement' });
    }

    // Wish 3
    if (sceneState.gamePhase === 'wish3-intro' && !phaseVoiceRef.current.wish3Intro) {
      phaseVoiceRef.current.wish3Intro = true;
      speakLine(VOICE_LINES.wish3Intro, { moment: 'story' });
    }
    if (sceneState.gamePhase === 'wish3-active' && !phaseVoiceRef.current.wish3Active) {
      phaseVoiceRef.current.wish3Active = true;
      speakLine(VOICE_LINES.wish3Active, { moment: 'encouragement' });
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
      speakLine(VOICE_LINES.dreamClouded, { moment: 'story' });
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

  // ── Wish 1 idle hint ladder (setTimeout, not setInterval) ───────────────────
  // Bubbles keep floating. The hint class is applied briefly then removed so the
  // CSS animation (finite pulse/glow) plays once and the bubble returns to normal.
  // Same pattern as FavoriteFoodGame — level fires → animation plays → level resets.
  //   Level 1 @ 10s : hint       → ring pulses once  (wishHintRingSoft, 1 cycle, ~2s)
  //   Level 2 @ 18s : hint-strong → ring pulses 3×   (wishHintRingStrong, 3 cycles, ~3.6s) + VO
  //   Level 3 @ 26s : hint-final  → ring pulses 4×   (wishHintRingFinal, 4 cycles, ~4s) + VO
  //   After level 3 animation the class stays (child is stuck — keep static glow).
  useEffect(() => {
    if (sceneState.gamePhase !== 'wish1-active') {
      setWish1IdleLevel(0);
      idleVoFlagsRef.current.wish1Level2 = false;
      idleVoFlagsRef.current.wish1Level3 = false;
      return;
    }
    if (sceneState.showingCompletionScreen || showDrawingPad) return;

    setWish1IdleLevel(0);
    idleVoFlagsRef.current.wish1Level2 = false;
    idleVoFlagsRef.current.wish1Level3 = false;

    let t1 = null;
    let t1Clear = null;
    let t2 = null;
    let t2Clear = null;
    let t3 = null;

    // Level 1 @ 10s — soft pulse once (~2s), then clear
    t1 = setTimeout(() => {
      setWish1IdleLevel(1);
      t1Clear = setTimeout(() => setWish1IdleLevel(0), 2200); // clear after animation finishes

      // Level 2 @ 18s — 3 pulses (~3.6s) + VO hint, then clear
      t2 = setTimeout(() => {
        setWish1IdleLevel(2);
        if (!idleVoFlagsRef.current.wish1Level2) {
          speakLine("Look for the kind action bubbles.", { moment: 'encouragement' });
          idleVoFlagsRef.current.wish1Level2 = true;
        }
        t2Clear = setTimeout(() => setWish1IdleLevel(0), 3800); // clear after animation finishes

        // Level 3 @ 26s — 4 pulses + VO, stays on (child needs max help)
        t3 = setTimeout(() => {
          setWish1IdleLevel(3);
          if (!idleVoFlagsRef.current.wish1Level3) {
            speakLine("Tap the bubbles that show helping, sharing, hugging, and gifting.", { moment: 'encouragement' });
            idleVoFlagsRef.current.wish1Level3 = true;
          }
          // No clear — level 3 stays as persistent static glow
        }, 8000); // 18s + 8s = 26s
      }, 8000); // 10s + 8s = 18s
    }, 10000);

    return () => {
      if (t1) clearTimeout(t1);
      if (t1Clear) clearTimeout(t1Clear);
      if (t2) clearTimeout(t2);
      if (t2Clear) clearTimeout(t2Clear);
      if (t3) clearTimeout(t3);
    };
  }, [sceneState.gamePhase, isAudioOn, sceneState.showingCompletionScreen, showDrawingPad]);

  // ── Wish 2, 3, dream phases — setTimeout ladders (same pattern as wish1) ────
  // Level fires → class on → animation plays → level resets to 0 → element back to normal.
  // Level 3 stays on (child genuinely stuck).
  useEffect(() => {
    const phase = sceneState.gamePhase;
    const isWish2 = phase === 'wish2-active';
    const isWish3 = phase === 'wish3-active';
    const isDream = (phase === 'dream-clouded' || phase === 'dream-clearing') && !sceneState.dreamRevealed;

    if (!isWish2 && !isWish3 && !isDream) {
      setWish2IdleLevel(0);
      setWish3IdleLevel(0);
      setChildIdleLevel(0);
      idleVoFlagsRef.current.wish2Level2 = false;
      idleVoFlagsRef.current.wish2Level3 = false;
      idleVoFlagsRef.current.wish3Level2 = false;
      idleVoFlagsRef.current.wish3Level3 = false;
      idleVoFlagsRef.current.childLevel2 = false;
      idleVoFlagsRef.current.childLevel3 = false;
      return;
    }
    if (sceneState.showingCompletionScreen || showDrawingPad) return;

    const setLevel = isWish2 ? setWish2IdleLevel : isWish3 ? setWish3IdleLevel : setChildIdleLevel;
    const voL2Flag = isWish2 ? 'wish2Level2' : isWish3 ? 'wish3Level2' : 'childLevel2';
    const voL3Flag = isWish2 ? 'wish2Level3' : isWish3 ? 'wish3Level3' : 'childLevel3';
    const voL2Line = isWish2 ? "Drag any food to a plate."
      : isWish3 ? "Tap the glowing spots on the land."
      : "Keep tapping to clear the clouds!";
    const voL3Line = isWish3 ? "Tap each glowing spot to help the garden grow." : null;

    setLevel(0);
    idleVoFlagsRef.current[voL2Flag] = false;
    idleVoFlagsRef.current[voL3Flag] = false;

    let t1 = null;
    let t1Clear = null;
    let t2 = null;
    let t2Clear = null;
    let t3 = null;

    // Level 1 @ 10s — soft pulse once (~2s), then clear
    t1 = setTimeout(() => {
      setLevel(1);
      t1Clear = setTimeout(() => setLevel(0), 2200);

      // Level 2 @ 18s — 3 pulses + VO, then clear
      t2 = setTimeout(() => {
        setLevel(2);
        if (!idleVoFlagsRef.current[voL2Flag]) {
          speakLine(voL2Line, { moment: 'encouragement' });
          idleVoFlagsRef.current[voL2Flag] = true;
        }
        t2Clear = setTimeout(() => setLevel(0), 3800);

        // Level 3 @ 26s — 4 pulses + VO (if any), stays on
        t3 = setTimeout(() => {
          setLevel(3);
          if (voL3Line && !idleVoFlagsRef.current[voL3Flag]) {
            speakLine(voL3Line, { moment: 'encouragement' });
            idleVoFlagsRef.current[voL3Flag] = true;
          }
        }, 8000);
      }, 8000);
    }, 10000);

    return () => {
      if (t1) clearTimeout(t1);
      if (t1Clear) clearTimeout(t1Clear);
      if (t2) clearTimeout(t2);
      if (t2Clear) clearTimeout(t2Clear);
      if (t3) clearTimeout(t3);
    };
  }, [isAudioOn, sceneState.gamePhase, sceneState.dreamRevealed, sceneState.showingCompletionScreen, showDrawingPad]);

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
    // Ensure Wish 1 intro VO plays immediately when gameplay starts.
    phaseVoiceRef.current.wish1Intro = true;
    speakLine(VOICE_LINES.wish1Intro, { moment: 'story' });
    sceneActions.updateState({ gamePhase: 'wish1-intro' });
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
    markInteraction();
    interruptCurrentVoice();
    playUiTap();

    if (bubble.type === 'kind') {
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
      // Unkind action: shake, dim, and redirect gently without repeating the harmful word.
      setShakingBubbleId(bubble.id);
      speakLine("Oh no, that's not kind. Look for a helping bubble.", { moment: 'encouragement' });

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
      const availableKind = kindBubbles.filter(item => !removed.has(item.actionKey) && !activeKeys.has(item.actionKey));
      const availableUnkind = unkindBubbles.filter(item => !removed.has(item.actionKey) && !activeKeys.has(item.actionKey));
      if (availableKind.length === 0 && availableUnkind.length === 0) return;
      const canSpawnKind = availableKind.length > 0;
      const canSpawnUnkind = availableUnkind.length > 0;
      const isKind = canSpawnKind && (!canSpawnUnkind || Math.random() < 0.6);
      const source = isKind ? availableKind : availableUnkind;
      const data = source[Math.floor(Math.random() * source.length)];
      const newBubble = {
        id: bubbleCounterRef.current++,
        type: isKind ? 'kind' : 'unkind',
        ...data,
        left: Math.random() * 80 + 10,
        top: Math.random() * 60 + 10,
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
    playUiTap();
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

  return (
    <div className="dreams-wishes-game" data-zone="about-me-hut">
      <img src={dreamsBg} alt="Background" className="dreams-background" />
      <HomeButton onNavigate={(...args) => {
        SimpleSceneManager.clearCurrentScene();
        onNavigate?.(...args);
      }} />
      <ZoneBadgeButton zoneId="about-me-hut" onBack={() => {
        SimpleSceneManager.clearCurrentScene();
        onNavigate?.('zone-welcome');
      }} />
      <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />
      <VOReplayButton onReplay={replayCurrentVoice} disabled={!isAudioOn} />

      {/* Story Progress Header */}
      {!sceneState.gamePhase.startsWith('dream') &&
        sceneState.gamePhase !== 'comparison-card' &&
        sceneState.gamePhase !== 'ending' && (
          <StoryProgressHeader discoveries={getDiscoveries()} isChildMode={false} />
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

      {/* Wish 1 Intro */}
      {sceneState.gamePhase === 'wish1-intro' && (
        <div className="intro-overlay wish1-intro-layout">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">I have three giant wishes for the whole world.</p>
            <p className="wish-intro-text">Will you help me make them come true?</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => {
                interruptCurrentVoice();
                playUiTap();
                phaseVoiceRef.current.wish1Active = false; // allow VO to fire fresh on entry
                sceneActions.updateState({ gamePhase: 'wish1-active' });
              }}
            >
              Let's Make Them Smile!
            </Button>
          </div>
        </div>
      )}

      {/* Wish 1 Active */}
      {sceneState.gamePhase === 'wish1-active' && (
        <div className="wish-screen">
          <div className="game-header-hud">
            {/* Header instruction commented out - using progress header instead */}
            {/* <div className="wish-instruction-bubble">Tap the earth 3 times to send smiles! ({sceneState.wish1Taps}/3)</div> */}
            <div className="wish-progress-header">
              <div className="wish-progress-title">Wish 1: Make Earth Smile</div>
              <div className="wish-smiley-row">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`wish-smiley-icon ${i < sceneState.wish1Taps ? 'filled' : ''}`}>
                    {i < sceneState.wish1Taps ? '😊' : '😶'}
                  </span>
                ))}
              </div>
              <div className="wish-progress-count">{sceneState.wish1Taps}/3</div>
            </div>
          </div>
          <div className="wish-interactive-container">
            <div className="earth-container earth-readonly" style={{ width: '252px', height: '252px' }}>
              <img src={wishEarthSad} alt="Sad" className="earth-image sad" style={{ opacity: sceneState.wish1Taps === 0 ? 1 : sceneState.wish1Taps === 1 ? 0.6 : sceneState.wish1Taps === 2 ? 0.3 : 0 }} />
              <img src={wishEarthHappy} alt="Happy" className={`earth-image happy ${sceneState.wish1Taps >= 3 ? 'complete-glow-pulse' : ''}`} style={{ opacity: sceneState.wish1Taps === 0 ? 0 : sceneState.wish1Taps === 1 ? 0.4 : sceneState.wish1Taps === 2 ? 0.7 : 1 }} />
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
            <div className="faces-container">
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
                    bubble.type === 'kind' && wish1IdleLevel === 1 ? 'hint' : ''
                  } ${
                    bubble.type === 'kind' && wish1IdleLevel === 2 ? 'hint-strong' : ''
                  } ${
                    bubble.type === 'kind' && wish1IdleLevel === 3 ? 'hint-final' : ''
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
                      boxShadow: bubble.type === 'kind' && wish1IdleLevel >= 2
                        ? 'inset 0 8px 14px rgba(255,255,255,0.6), inset 0 -8px 16px rgba(173,126,57,0.28), 0 0 0 3px rgba(255,220,130,0.5), 0 8px 18px rgba(86,56,24,0.22)'
                        : 'inset 0 8px 14px rgba(255,255,255,0.55), inset 0 -8px 16px rgba(142,101,46,0.24), 0 8px 18px rgba(86,56,24,0.18)',
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
        <Wish2PlateDropGame
          sceneState={sceneState}
          wish2IdleLevel={wish2IdleLevel}
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
          cowImg={cowImg}
          mouseImg={mouseImg}
          peacockImg={peacockImg}
        />
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
          <div className="game-header-hud">
            <div className="wish-progress-header">
              <div className="wish-progress-title">Wish 3: Grow The Forest</div>
              <div className="wish-smiley-row">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`wish-smiley-icon ${i < sceneState.wish3Taps ? 'filled' : ''}`}>
                    {i < sceneState.wish3Taps ? '😊' : '😶'}
                  </span>
                ))}
              </div>
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
                style={wish3IdleLevel === 1 || wish3IdleLevel === 2 || wish3IdleLevel === 3 ? { filter: 'drop-shadow(0 0 14px rgba(255, 231, 160, 0.85))' } : undefined}
              />

              {/* Hotspot 0: Left - Flower reveal */}
              <div
                onClick={() => handleParkTap(0)}
                className={`${wish3IdleLevel === 1 && !sceneState.parkStates[0] ? 'hint' : ''} ${wish3IdleLevel === 2 && !sceneState.parkStates[0] ? 'hint-strong' : ''} ${wish3IdleLevel === 3 && !sceneState.parkStates[0] ? 'hint-final' : ''}`}
                style={{
                  position: 'absolute',
                  left: '18%',
                  bottom: '25%',
                  width: '96px',
                  height: '112px',
                  cursor: sceneState.parkStates[0] ? 'default' : 'pointer',
                  background: sceneState.parkStates[0] ? '' : 'rgba(255, 200, 87, 0.12)',
                  border: sceneState.parkStates[0] ? '' : '2px dashed rgba(255, 200, 87, 0.5)',
                  borderRadius: '50%',
                  zIndex: 10,
                  transition: 'all 0.2s ease',
                }}
              />
              {sceneState.parkStates[0] && (
                <img
                  src={flowerImg}
                  alt="Flower"
                  style={{ position: 'absolute', left: '8%', bottom: '15%', width: '190px', height: 'auto', zIndex: 5 }}
                />
              )}

              {/* Hotspot 1: Center - Bush + Butterfly reveal */}
              <div
                onClick={() => handleParkTap(1)}
                className={`${wish3IdleLevel === 1 && !sceneState.parkStates[1] ? 'hint' : ''} ${wish3IdleLevel === 2 && !sceneState.parkStates[1] ? 'hint-strong' : ''} ${wish3IdleLevel === 3 && !sceneState.parkStates[1] ? 'hint-final' : ''}`}
                style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bottom: '40%',
                  width: '112px',
                  height: '128px',
                  cursor: sceneState.parkStates[1] ? 'default' : 'pointer',
                  background: sceneState.parkStates[1] ? '' : 'rgba(255, 200, 87, 0.12)',
                  border: sceneState.parkStates[1] ? '' : '2px dashed rgba(255, 200, 87, 0.5)',
                  borderRadius: '50%',
                  zIndex: 10,
                  transition: 'all 0.2s ease',
                }}
              />
              {sceneState.parkStates[1] && (
                <>
                  <img
                    src={bushImg}
                    alt="Bush"
                    style={{ position: 'absolute', left: '48%', transform: 'translateX(-50%)', bottom: '12%', width: '210px', height: 'auto', zIndex: 5 }}
                  />
                  <img
                    src={butterflyImg}
                    alt="Butterfly"
                    style={{ position: 'absolute', left: '55%', transform: 'translateX(-50%)', bottom: '35%', width: '80px', height: 'auto', zIndex: 6 }}
                  />
                </>
              )}

              {/* Hotspot 2: Right - Tree + Bird reveal */}
              <div
                onClick={() => handleParkTap(2)}
                className={`${wish3IdleLevel === 1 && !sceneState.parkStates[2] ? 'hint' : ''} ${wish3IdleLevel === 2 && !sceneState.parkStates[2] ? 'hint-strong' : ''} ${wish3IdleLevel === 3 && !sceneState.parkStates[2] ? 'hint-final' : ''}`}
                style={{
                  position: 'absolute',
                  right: '18%',
                  bottom: '25%',
                  width: '112px',
                  height: '144px',
                  cursor: sceneState.parkStates[2] ? 'default' : 'pointer',
                  background: sceneState.parkStates[2] ? '' : 'rgba(255, 200, 87, 0.12)',
                  border: sceneState.parkStates[2] ? '' : '2px dashed rgba(255, 200, 87, 0.5)',
                  borderRadius: '50%',
                  zIndex: 10,
                  transition: 'all 0.2s ease',
                }}
              />
              {sceneState.parkStates[2] && (
                <>
                  <img
                    src={treeImg}
                    alt="Tree"
                    style={{ position: 'absolute', right: '5%', bottom: '5%', width: '300px', height: 'auto', zIndex: 5 }}
                  />
                  <img
                    src={birdImg}
                    alt="Bird"
                    style={{ position: 'absolute', right: '18%', bottom: '50%', width: '90px', height: 'auto', zIndex: 6 }}
                  />
                </>
              )}

              {/* Idle hint */}
              {wish3IdleLevel >= 3 && sceneState.wish3Taps < 3 && (
                <div style={{ position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)', fontSize: '42px', zIndex: 20 }}>👇</div>
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
        <div className="intro-overlay">
          <img src={babyGaneshaSit} alt="Baby Ganesha" className="intro-ganesha celebrate-scale" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">You made the world brighter!</p>
            <p className="wish-intro-text">Now it's your turn.<br />Draw your happy wish on this magic canvas!</p>
            <Button
              variant="primary"
              size="large"
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
        <div className="drawing-overlay">
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
              className={`ganesha-helper ${sceneState.trunkTaps > 0 ? 'ganesha-blowing' : ''} ${childIdleLevel === 1 ? 'hint' : ''} ${childIdleLevel === 2 ? 'hint-strong' : ''} ${childIdleLevel === 3 ? 'hint-final' : ''} ${ganeshaReactKey > 0 && sceneState.dreamRevealed ? 'ganesha-react' : ''}`}
              onClick={handleTrunkTap}
              style={{
                filter: childIdleLevel === 2 || childIdleLevel === 3 ? 'drop-shadow(0 0 14px rgba(255, 231, 160, 0.9))' : 'none',
              }}
            >
              <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-trunk bounce-gentle" />
            </div>
            {childIdleLevel >= 3 && !sceneState.dreamRevealed && (
              <div style={{ position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)', fontSize: '40px', zIndex: 12 }}>
                👆
              </div>
            )}
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
          <h1 className="friendship-title">Dreams Come Together</h1>
          <p className="friendship-subtitle">Helping others makes dreams grow.</p>
          <div className="friendship-grid">
            <div className="friend-column ganesha-card">
              <img src={babyGaneshaSit} alt="Ganesha" className="column-header-image" />
              <div className="column-label">My Wishes</div>
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
              {activeProfile?.icon ? (
                <img
                  src={activeProfile.icon}
                  alt="Profile"
                  style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}
                />
              ) : profileAvatarImage ? (
                <img
                  src={profileAvatarImage}
                  alt={profileDisplayName}
                  style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', border: '4px solid white' }}
                />
              ) : (
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                    border: '4px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: '50px',
                    color: 'white',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    marginBottom: '10px',
                  }}
                >
                  {profileAvatar}
                </div>
              )}
              <div className="column-label">{profileDisplayName}'s Dream</div>
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
            className="continue-btn-simple done-btn-pulse"
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
            sceneName="Dreams & Wishes"
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
            nextSceneName="About Me Hut Complete"
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
              // Pre-set the opening flag so intro-VO effect won't double-fire; we speak explicitly.
              phaseVoiceRef.current = { opening: true };
              safeSetTimeout(() => {
                setVoiceVolume(isAudioOn ? OPENING_VO_VOLUME : 0);
                playVoice('opening');
              }, 500);

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
