import React, { useState, useEffect, useRef, useCallback } from 'react';
import './DreamsWishesGame.css';
import SceneCompletionCelebration from "../../../lib/components/celebration/SceneCompletionCelebration";
import DrawingPad from '../components/Drawingpad';
import StoryProgressHeader from '../components/StoryProgressHeader';

// Navigation Components
import SceneManager from "../../../lib/components/scenes/SceneManager";
import GameStateManager from "../../../lib/services/GameStateManager";

// Content Configs
import { getOpeningModal, getCompletionModal } from '../../../lib/config/content';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';

// Shared Components
import OpeningModal from '../../shared/components/OpeningModal';
import HomeButton from '../../../lib/components/ui/HomeButton';
import ZoneBadgeButton from '../../../lib/components/navigation/ZoneBadgeButton';
import AudioToggle from '../../../lib/components/ui/AudioToggle';
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
import dreamsBg from './assets/images/dream_background.jpg';

// Wish Icons
import wishIconEarth from './assets/images/wish-icon-earth.png';
import wishIconFlower from './assets/images/wish-icon-flower.png';
import wishIconShare from './assets/images/wish-icon-share.png';
import wishHeartIcon from './assets/images/heart-icon.png';
import wishStarIcon from './assets/images/shootingstar-icon.png';
import wishWorldIcon from './assets/images/world-icon.png';

// Wish Images
import wishEarthSad from './assets/images/wish-images/wish-earth-sad.png';
import wishEarthHappy from './assets/images/wish-images/wish-earth-happy.png';
import wishBowlEmpty from './assets/images/wish-images/wish-bowl-empty.png';
import wishBowlFull from './assets/images/wish-images/wish-bowl-full.png';
import plateImg from './assets/images/wish-images/plate.png';
import cowImg from './assets/images/wish-images/fav-cow.png';
import mouseImg from './assets/images/wish-images/fav-mouse.png';
import peacockImg from './assets/images/wish-images/fav-peacock.png';
import appleImg from './assets/images/wish-images/apple.png';
import bananaImg from './assets/images/wish-images/banana.png';
import breadImg from './assets/images/wish-images/bread.png';
import brocolliImg from './assets/images/wish-images/brocolli.png';
import carrotImg from './assets/images/wish-images/carrot.png';
import milkImg from './assets/images/wish-images/milk.png';
import riceImg from './assets/images/wish-images/rice.png';
import wishForest1 from './assets/images/wish-images/wish-forest-1.png';
import wishForest2 from './assets/images/wish-images/wish-forest-2.png';
import wishForest3 from './assets/images/wish-images/wish-forest-3.png';
import wishForest4 from './assets/images/wish-images/wish-forest-4.png';
import baseImg from './assets/images/wish-images/base.png';
import flowerImg from './assets/images/wish-images/flower.png';
import bushImg from './assets/images/wish-images/bush.png';
import treeImg from './assets/images/wish-images/tree.png';
import butterflyImg from './assets/images/wish-images/butterfly.png';
import birdImg from './assets/images/wish-images/bird.png';
import helpingImg from './assets/images/wish-images/helping.png';
import sharingImg from './assets/images/wish-images/sharing.png';
import huggingImg from './assets/images/wish-images/hugging.png';
import giftingImg from './assets/images/wish-images/gifting.png';
import angryImg from './assets/images/wish-images/angry.png';
import fightImg from './assets/images/wish-images/fight.png';
import hitImg from './assets/images/wish-images/hit.png';
import teasingImg from './assets/images/wish-images/teasing.png';
import cloudImg from './assets/images/cloud.png';

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
    apple: { left: '30%', top: '38%' },
    banana: { left: '50%', top: '30%' },
    rice: { left: '70%', top: '38%' },
  };
  const WISH2_PLATE_POSITIONS = [
    { left: '56%', top: '74%' },
    { left: '45%', top: '84%' },
    { left: '65%', top: '84%' },
  ];
  const WISH2_PLATE_LAYOUT = {
    containerLeft: 50,
    containerTop: 57,
    containerWidth: 74,
    containerHeight: 42,
  };

  const VOICE_LINES = {
    // Opening Modal
    opening: "Let’s help and dream together!",

    // Wish 1
    wish1Intro: "Let's make the world smile!",
    wish1Active: "Tap the kind actions.",
    wish1Complete: "You made the world kinder!",

    // Wish 2
    wish2Intro: "My second wish… is to share our food. So no one stays hungry.",
    wish2Active: "Drag food to the plates.",
    wish2Complete: "Everyone has food now!",

    // Wish 3
    wish3Intro: "My last wish… is for a green world full of life. Let’s help this forest grow!",
    wish3Active: "Tap to grow the garden.",
    wish3Complete: "The world is green and happy!",

    // All Wishes Complete (now combined with drawing intro)
    allWishesComplete: "Now it’s your turn! Draw your happy dream.",

    // Dream Phases
    // dreamIntro: (REMOVED — merged into allWishesComplete)
    dreamDrawing: "Draw your happy dream.",
    dreamClouded: "Tap my trunk to clear the clouds.",
    dreamClearing: "Keep tapping to clear the clouds!",
    dreamRevealed: "Your dream is beautiful!",

    // Comparison Card
    comparison: "Our dreams grow together!",

    // Ending
    ending: "Keep dreaming and helping!",

    // Idle hints
    wish1Hint: "Look for the kind actions.",
    wish2Hint: "Try dragging food to the plates.",
    wish3Hint: "Tap the forest to make it grow."
  };

  // Profile Display
  const activeProfile = GameStateManager.getCurrentProfile?.() || null;
  const profileDisplayName = (activeProfile?.name || 'Friend').trim();
  const profileAvatar = activeProfile?.avatar ? activeProfile.avatar : profileDisplayName.charAt(0).toUpperCase();

  if (!sceneState) return <div>Loading...</div>;

  // Get content from configs
  const openingModalContent = getOpeningModal('about-me-hut', 'dreams-wishes');
  const completionModalContent = getCompletionModal('about-me-hut', 'dreams-wishes');
  const completionIcons = openingModalContent?.icons || ['wish-heart', 'wish-star', 'wish-world'];

  // --- LOCAL UI STATE (Not saved in DB) ---
  // ── Resume Delay (shared across pause/resume logic) ──────────────────────────
  const RESUME_DELAY_MS = 3000;
  const IDLE_HINT_DELAY_MS = 15000;

  const { isAudioOn, toggleAudio } = useAudioPreference();

  const [returnHintNonce, setReturnHintNonce] = useState(0);
  const [wish1IdleLevel, setWish1IdleLevel] = useState(0);
  const [wish2IdleLevel, setWish2IdleLevel] = useState(0);
  const [wish3IdleLevel, setWish3IdleLevel] = useState(0);
  const idleVoFlagsRef = useRef({
    wish1Level2: false,
    wish1Level3: false,
    wish2Level2: false,
    wish2Level3: false,
    wish3Level2: false,
    wish3Level3: false,
  });
  const resetIdleHintsForActiveWish = useCallback((phase) => {
    if (phase === 'wish1-active') {
      setWish1IdleLevel(0);
      idleVoFlagsRef.current.wish1Level2 = false;
      idleVoFlagsRef.current.wish1Level3 = false;
    } else if (phase === 'wish2-active') {
      setWish2IdleLevel(0);
      idleVoFlagsRef.current.wish2Level2 = false;
      idleVoFlagsRef.current.wish2Level3 = false;
    } else if (phase === 'wish3-active') {
      setWish3IdleLevel(0);
      idleVoFlagsRef.current.wish3Level2 = false;
      idleVoFlagsRef.current.wish3Level3 = false;
    }
  }, []);
  const lastInteractionAtRef = useRef(Date.now());
  const markInteraction = useCallback(() => {
    lastInteractionAtRef.current = Date.now();
    resetIdleHintsForActiveWish(sceneState.gamePhase);
  }, [resetIdleHintsForActiveWish, sceneState.gamePhase]);

  // ── Callback for pause/resume (fires after resumeDelay via useVoiceGuidance) ─
  const onReturnHint = useCallback(() => {
    setReturnHintNonce(n => n + 1);
  }, []);

  // ── T08/T09: visibility + idle timer infrastructure ──────────────────────────
  const { startIdleTimer, stopIdleTimer, setCurrentPhase, stopVoice, setVoiceVolume, startMusic, stopMusic } = useVoiceGuidance(
    'about-me-hut', 'dreams-wishes', {
      enableMusic: true,
      musicVolume: 0.06,
      idleTimeout: 20,
      resumeDelay: RESUME_DELAY_MS,  // ← Wait before replaying VO
      onReturnHint                     // ← Called when child returns
    }
  );
  const { playUiTap, playSparkle, playChime, setGlobalVolume } = useGameSounds();
  const { speak, stop: stopSpokenVoice, isSpeaking } = useGaneshaVoice();
  const isSpeakingRef = useRef(false);
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);
  useEffect(() => { startIdleTimer(); return () => stopIdleTimer(); }, [startIdleTimer, stopIdleTimer]);
  useEffect(() => { setCurrentPhase(sceneState?.gamePhase ?? null); }, [sceneState?.gamePhase, setCurrentPhase]);
  useEffect(() => {
    if (isAudioOn && sceneState.gamePhase !== 'intro' && !sceneState.showingCompletionScreen) startMusic();
    else stopMusic();
  }, [isAudioOn, sceneState.gamePhase, sceneState.showingCompletionScreen, startMusic, stopMusic]);
  useEffect(() => { setGlobalVolume(isAudioOn ? 1 : 0); }, [isAudioOn, setGlobalVolume]);

  // Stop all voice when audio is toggled off
  useEffect(() => {
    if (!isAudioOn) {
      stopVoice();
      stopSpokenVoice();
    }
  }, [isAudioOn, stopVoice, stopSpokenVoice]);

  useEffect(() => () => stopMusic(), [stopMusic]);

  // ── Resume Countdown & Pause-Aware Timeout ──────────────────────────────────
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  // Pause/Resume refs for celebration transition
  const pauseCelebRef = useRef(() => {});
  const resumeCelebRef = useRef(() => {});

  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: () => {
      // On tab hide: stop voice, pause celebration
      stopVoice();
      stopSpokenVoice();
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
  const [selectedWish2FoodKey, setSelectedWish2FoodKey] = useState(null);

  const reloadHandledRef = useRef(false);
  const resumePopupTimeoutRef = useRef(null);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');
  const [openingButtonVisible] = useState(true);

  // Mini gesture (thumbs up) on successful taps
  const [miniGesture, setMiniGesture] = useState({
    show: false,
    target: 'center',
    durationMs: 1500,
    key: 0
  });
  const miniGestureTimerRef = useRef(null);
  const wish1SparkleCancelRef = useRef(null);
  const [wish1Sparkle, setWish1Sparkle] = useState({ type: null, key: 0 });
  const wish2SparkleCancelRef = useRef(null);
  const [wish2Sparkle, setWish2Sparkle] = useState({ type: null, key: 0, targetIndex: null });
  const wish3SparkleCancelRef = useRef(null);
  const [wish3Sparkle, setWish3Sparkle] = useState({ type: null, key: 0 });

  // Bubble tap game (wish 1)
  const [bubbles, setBubbles] = useState([]);
  const bubbleCounterRef = useRef(0);
  const removedWish1BubbleKeysRef = useRef(new Set());
  const activeWish1BubbleKeysRef = useRef(new Set());

  const phaseVoiceRef = useRef({});
  const speakLine = (text, options = {}) => {
    if (!isAudioOn || !text) {
      options.onEnd?.();
      return;
    }
    const { onEnd, moment = 'encouragement' } = options;
    speak(text, { age: 7, style: 'child', moment, onEnd });
  };

  const interruptCurrentVoice = () => {
    stopVoice();
    stopSpokenVoice();
  };

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
      case 'dream-clearing':
        if (sceneState.dreamRevealed) return null;
        return "Tap my trunk to clear the clouds.";
      default:
        return null;
    }
  }, [sceneState.dreamRevealed]);

  const getResumeVoiceLine = useCallback((phase) => {
    switch (phase) {
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
      case 'dream-clearing':
        if (sceneState.dreamRevealed) return VOICE_LINES.dreamRevealed;
        return VOICE_LINES.dreamClouded;
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

  const triggerMiniGesture = useCallback((target = 'center', durationMs = 1500) => {
    if (miniGestureTimerRef.current) {
      clearTimeout(miniGestureTimerRef.current);
      miniGestureTimerRef.current = null;
    }
    setMiniGesture(prev => ({
      show: true,
      target,
      durationMs,
      key: prev.key + 1
    }));
    miniGestureTimerRef.current = setTimeout(() => {
      setMiniGesture(prev => ({ ...prev, show: false }));
      miniGestureTimerRef.current = null;
    }, durationMs);
  }, []);

  // --- HELPERS ---
  const getDiscoveries = () => {
    const items = [];
    const phase = sceneState.gamePhase;

    // Logic to show progress badges in header
    const phasesAfterWish1 = ['wish1-complete', 'wish2-intro', 'wish2-active', 'wish2-complete', 'wish3-intro', 'wish3-active', 'wish3-complete', 'all-wishes-complete', 'dream-drawing', 'dream-clouded', 'dream-clearing', 'comparison-card', 'ending'];
    if (phasesAfterWish1.includes(phase)) items.push({ name: 'Happiness', emoji: '🌍' });

    const phasesAfterWish2 = ['wish2-complete', 'wish3-intro', 'wish3-active', 'wish3-complete', 'all-wishes-complete', 'dream-drawing', 'dream-clouded', 'dream-clearing', 'comparison-card', 'ending'];
    if (phasesAfterWish2.includes(phase)) items.push({ name: 'Sharing', emoji: '🥣' });

    const phasesAfterWish3 = ['wish3-complete', 'all-wishes-complete', 'dream-drawing', 'dream-clouded', 'dream-clearing', 'comparison-card', 'ending'];
    if (phasesAfterWish3.includes(phase)) items.push({ name: 'Nature', emoji: '🌸' });

    if (sceneState.childDreamDrawing) items.push({ name: 'My Dream', image: sceneState.childDreamDrawing });

    return items;
  };

  // --- RELOAD DETECTION & RESTORATION ---
  useEffect(() => {
    if (isReload && !reloadHandledRef.current) {
      reloadHandledRef.current = true;
      const { gamePhase, wish1Taps, wish3Taps, trunkTaps, bowlStates, currentModal, dreamRevealed } = sceneState;

      console.log("🔄 Reload detected. Phase:", gamePhase, "Modal:", currentModal);
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
      // Always stop any in-flight VO on reload before phase restoration.
      interruptCurrentVoice();
      phaseVoiceRef.current = {};
      setShowDrawingPad(false);

      // 1. DRAWING MODAL - restart from drawing intro modal.
      if (currentModal === 'drawing') {
        setResumeMessage("Let's start your drawing again!");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        sceneActions.updateState({
          gamePhase: 'all-wishes-complete',
          currentModal: null,
          draftData: null
        });
        phaseVoiceRef.current = {};
        return;
      }

      // 2. INTRO PHASES - RESTART FROM BEGINNING
      // On continue in Wish 1 intro, restart the intro
      if (gamePhase === 'wish1-intro') {
        setResumeMessage("Let's try that again! 🌍");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        phaseVoiceRef.current = {}; // Reset VO so intro replays
        return;
      }

      // On continue in Wish 2 intro, restart the intro
      if (gamePhase === 'wish2-intro') {
        setResumeMessage("Let's try that again! 🥣");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        phaseVoiceRef.current = {}; // Reset VO so intro replays
        return;
      }

      // On continue in Wish 3 intro, restart the intro
      if (gamePhase === 'wish3-intro') {
        setResumeMessage("Let's try that again! 🌸");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        phaseVoiceRef.current = {}; // Reset VO so intro replays
        return;
      }

      // 3. ACTIVE PHASES - JUMP BACK TO INTRO WITH COUNTERS RESET
      // On continue in Wish 1 active (in between tapping), jump back to wish1-intro
      if (gamePhase === 'wish1-active') {
        setResumeMessage("Let's hear the wish again! 🌍");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        sceneActions.updateState({
          gamePhase: 'wish1-intro',
          wish1Taps: 0,
          wish1FinalMoment: false
        });
        // Block stale active/final VO (effect may run once before state update settles).
        phaseVoiceRef.current = { wish1Active: true, wish1FinalMomentVo: true };
        return;
      }

      // On continue in Wish 2 active (in between tapping), restart Wish 2 active
      if (gamePhase === 'wish2-active') {
        setResumeMessage("Let's hear the wish again! 🥣");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        sceneActions.updateState({
          gamePhase: 'wish2-active',
          wish2Taps: 0,
          bowlStates: [false, false, false],
          wish2PlateFoods: [null, null, null],
          wish2FoodPool: [...WISH2_FOOD_KEYS],
          wish2FinalMoment: false
        });
        // Block stale active/final VO (effect may run once before state update settles).
        phaseVoiceRef.current = { wish2Active: true, wish2FinalMomentVo: true };
        return;
      }

      // On continue in Wish 3 active (in between tapping), restart Wish 3 active
      if (gamePhase === 'wish3-active') {
        setResumeMessage("Let's hear the wish again! 🌸");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        sceneActions.updateState({
          gamePhase: 'wish3-active',
          wish3Taps: 0,
          parkStates: [false, false, false],
          wish3FinalMoment: false
        });
        // Block stale active/final VO (effect may run once before state update settles).
        phaseVoiceRef.current = { wish3Active: true, wish3FinalMomentVo: true };
        return;
      }

      // 4. DREAM PHASES
      // 4a. If drawing phase was active without modal flag, restart from drawing intro modal.
      if (gamePhase === 'dream-drawing') {
        setResumeMessage("Let's start your drawing again!");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        sceneActions.updateState({
          gamePhase: 'all-wishes-complete',
          currentModal: null,
          draftData: null
        });
        phaseVoiceRef.current = {};
        return;
      }

      // 4b. If child was mid-clearing (1-2 taps), restart clearing from beginning (all 3 clouds).
      if (gamePhase === 'dream-clearing' && !dreamRevealed) {
        setResumeMessage("Welcome back! Let's clear the clouds from the start.");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        sceneActions.updateState({
          gamePhase: 'dream-clearing',
          trunkTaps: 0,
          dreamRevealed: false
        });
        phaseVoiceRef.current = {};
        return;
      }

      // 4c. For clouded or already revealed states, resume as-is.
      if (gamePhase === 'dream-clouded' || dreamRevealed) {
        setResumeMessage("Welcome back! Let's continue your dream.");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        // Keep existing dream phase state as-is.
        phaseVoiceRef.current = {};
        return;
      }

      // 5. COMPLETION PHASES — reset to the wish intro so the child replays from the start.
      // Block both stale VO paths: the phase effect (wish1Complete) AND the
      // wish1FinalMoment effect (wish1FinalMomentVo) — both fire "Thank you" otherwise.
      if (gamePhase === 'wish1-complete') {
        setResumeMessage("Let's hear the wish again! 🌍");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        sceneActions.updateState({ gamePhase: 'wish1-intro', wish1Taps: 0, wish1FinalMoment: false });
        phaseVoiceRef.current = { wish1Complete: true, wish1FinalMomentVo: true };
        return;
      }

      if (gamePhase === 'wish2-complete') {
        setResumeMessage("Let's hear the wish again! 🥣");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        sceneActions.updateState({
          gamePhase: 'wish2-active',
          wish2Taps: 0,
          bowlStates: [false, false, false],
          wish2PlateFoods: [null, null, null],
          wish2FoodPool: [...WISH2_FOOD_KEYS],
          wish2FinalMoment: false
        });
        phaseVoiceRef.current = { wish2Complete: true, wish2FinalMomentVo: true };
        return;
      }

      if (gamePhase === 'wish3-complete') {
        setResumeMessage("Let's hear the wish again! 🌸");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        sceneActions.updateState({ gamePhase: 'wish3-active', wish3Taps: 0, parkStates: [false, false, false], wish3FinalMoment: false });
        phaseVoiceRef.current = { wish3Complete: true, wish3FinalMomentVo: true };
        return;
      }

      if (gamePhase === 'all-wishes-complete') {
        setResumeMessage("All wishes complete! Time to dream! ✨");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        return;
      }

      if (gamePhase === 'intro') return;
    }
  }, [isReload, sceneState.gamePhase, sceneState.currentModal]);

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
    else if (sceneState.dreamRevealed) {
      cancel = safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'comparison-card' }); }, 6000);
    }

    return () => cancel?.();
  }, [sceneState.gamePhase, sceneState.dreamRevealed, safeSetTimeout]);

  useEffect(() => {
    if (sceneState.gamePhase === 'intro') {
      phaseVoiceRef.current = {};
      const cancel = safeSetTimeout(() => {
        speakLine(VOICE_LINES.opening, { moment: 'greeting' });
      }, 400);
      return () => cancel?.();
    }
  }, [sceneState.gamePhase, isAudioOn, safeSetTimeout]);

  useEffect(() => {
    // Guard: on the very first render after a reload, the reload-detection effect
    // hasn't run yet (effects fire in declaration order). Skip ALL VO here so the
    // stale saved phase never fires its line. Once the reload handler sets
    // reloadHandledRef.current = true and calls updateState, this effect re-runs
    // with the corrected phase and the correct phaseVoiceRef flags already in place.
    if (isReload && !reloadHandledRef.current) return;

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
      speakLine(VOICE_LINES.wish1Complete, { moment: 'celebration' });
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
      speakLine(VOICE_LINES.dreamClearing, { moment: 'encouragement' });
    }
    if (sceneState.dreamRevealed && !phaseVoiceRef.current.dreamRevealed) {
      phaseVoiceRef.current.dreamRevealed = true;
      speakLine(VOICE_LINES.dreamRevealed, { moment: 'celebration' });
    }

    // Comparison Card - VO removed
    // if (sceneState.gamePhase === 'comparison-card' && !phaseVoiceRef.current.comparison) {
    //   phaseVoiceRef.current.comparison = true;
    //   speakLine(VOICE_LINES.comparison, { moment: 'story' });
    // }

    // Ending
    if (sceneState.gamePhase === 'ending' && !phaseVoiceRef.current.ending) {
      phaseVoiceRef.current.ending = true;
      speakLine(VOICE_LINES.ending, { moment: 'closing' });
    }
  }, [sceneState.gamePhase, sceneState.dreamRevealed, isAudioOn]);

  // Completion screen VO removed
  useEffect(() => {
    if (sceneState.showingCompletionScreen && !phaseVoiceRef.current.completeVo) {
      phaseVoiceRef.current.completeVo = true;
      // No VO on completion modal
    }
  }, [sceneState.showingCompletionScreen, isAudioOn]);

  // Ensure no in-progress VO bleeds into the completion modal.
  useEffect(() => {
    if (!sceneState.showingCompletionScreen) return;
    stopVoice();
    stopSpokenVoice();
  }, [sceneState.showingCompletionScreen, stopVoice, stopSpokenVoice]);

  // Wish 1 final in-scene VO (reliable trigger after last tap state is set)
  useEffect(() => {
    if (isReload && !reloadHandledRef.current) return;
    if (sceneState.wish1FinalMoment && !phaseVoiceRef.current.wish1FinalMomentVo) {
      phaseVoiceRef.current.wish1FinalMomentVo = true;
      speakLine(VOICE_LINES.wish1Complete, { moment: 'celebration' });
    }
    if (!sceneState.wish1FinalMoment) {
      phaseVoiceRef.current.wish1FinalMomentVo = false;
    }
  }, [sceneState.wish1FinalMoment, isAudioOn]);

  useEffect(() => {
    if (isReload && !reloadHandledRef.current) return;
    if (sceneState.wish2FinalMoment && !phaseVoiceRef.current.wish2FinalMomentVo) {
      phaseVoiceRef.current.wish2FinalMomentVo = true;
      speakLine(VOICE_LINES.wish2Complete, { moment: 'celebration' });
    }
    if (!sceneState.wish2FinalMoment) {
      phaseVoiceRef.current.wish2FinalMomentVo = false;
    }
  }, [sceneState.wish2FinalMoment, isAudioOn]);

  useEffect(() => {
    if (isReload && !reloadHandledRef.current) return;
    if (sceneState.wish3FinalMoment && !phaseVoiceRef.current.wish3FinalMomentVo) {
      phaseVoiceRef.current.wish3FinalMomentVo = true;
      speakLine(VOICE_LINES.wish3Complete, { moment: 'celebration' });
    }
    if (!sceneState.wish3FinalMoment) {
      phaseVoiceRef.current.wish3FinalMomentVo = false;
    }
  }, [sceneState.wish3FinalMoment, isAudioOn]);

  useEffect(() => () => stopSpokenVoice(), [stopSpokenVoice]);

  // Replay a contextual phase hint after tab/app return.
  // useVoiceGuidance calls onReturnHint after RESUME_DELAY_MS.
  useEffect(() => {
    // During reload restore, suppress return-hint VO from stale saved phase.
    if (isReload && !reloadHandledRef.current) return;
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
    }, 700);
    return () => clearTimeout(retry);
  }, [isReload, returnHintNonce, isAudioOn, sceneState.gamePhase, sceneState.showingCompletionScreen, showDrawingPad, getResumeVoiceLine, getPhaseReminderLine]);

  // Wish-specific idle ladders (10s / 18s / 26s).
  useEffect(() => {
    if (!isAudioOn || sceneState.showingCompletionScreen || showDrawingPad) return;

    const getLevel = (idleForMs) => {
      if (idleForMs >= 26000) return 3;
      if (idleForMs >= 18000) return 2;
      if (idleForMs >= 10000) return 1;
      return 0;
    };

    const intervalId = setInterval(() => {
      const phase = sceneState.gamePhase;
      const idleFor = Date.now() - lastInteractionAtRef.current;
      const level = getLevel(idleFor);

      if (phase === 'wish1-active') {
        if (level !== wish1IdleLevel) setWish1IdleLevel(level);
        if (level >= 2 && !idleVoFlagsRef.current.wish1Level2) {
          speakLine("Look for the kind action bubbles.", { moment: 'encouragement' });
          idleVoFlagsRef.current.wish1Level2 = true;
        }
        if (level >= 3 && !idleVoFlagsRef.current.wish1Level3) {
          speakLine("Tap the bubbles that show helping, sharing, hugging, and gifting.", { moment: 'encouragement' });
          idleVoFlagsRef.current.wish1Level3 = true;
        }
        return;
      }

      if (phase === 'wish2-active') {
        if (level !== wish2IdleLevel) setWish2IdleLevel(level);
        if (level >= 2 && !idleVoFlagsRef.current.wish2Level2) {
          speakLine("Drag any food to a plate.", { moment: 'encouragement' });
          idleVoFlagsRef.current.wish2Level2 = true;
        }
        if (level >= 3 && !idleVoFlagsRef.current.wish2Level3) {
          speakLine("Try dragging a food item to the glowing plate.", { moment: 'encouragement' });
          idleVoFlagsRef.current.wish2Level3 = true;
        }
        return;
      }

      if (phase === 'wish3-active') {
        if (level !== wish3IdleLevel) setWish3IdleLevel(level);
        if (level >= 2 && !idleVoFlagsRef.current.wish3Level2) {
          speakLine("Tap the glowing spots on the land.", { moment: 'encouragement' });
          idleVoFlagsRef.current.wish3Level2 = true;
        }
        if (level >= 3 && !idleVoFlagsRef.current.wish3Level3) {
          speakLine("Tap each glowing spot to help the garden grow.", { moment: 'encouragement' });
          idleVoFlagsRef.current.wish3Level3 = true;
        }
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [isAudioOn, sceneState.gamePhase, sceneState.showingCompletionScreen, showDrawingPad, wish1IdleLevel, wish2IdleLevel, wish3IdleLevel]);

  // Idle hints (scene-level), similar behavior to other scenes.
  useEffect(() => {
    if (!isAudioOn || sceneState.showingCompletionScreen || showDrawingPad) return;
    const intervalId = setInterval(() => {
      const line = getPhaseReminderLine(sceneState.gamePhase);
      if (!line) return;
      const idleFor = Date.now() - lastInteractionAtRef.current;
      if (idleFor >= IDLE_HINT_DELAY_MS) {
        speakLine(line, { moment: 'encouragement' });
        lastInteractionAtRef.current = Date.now();
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isAudioOn, sceneState.gamePhase, sceneState.showingCompletionScreen, showDrawingPad, getPhaseReminderLine]);

  // Wish 1 Idle Hint Progression (10s → 18s → 26s, matching Scene 20 pattern)
  useEffect(() => {
    if (sceneState.gamePhase !== 'wish1-active' || sceneState.wish1Taps >= 3) {
      setWish1IdleLevel(0);
      idleVoFlagsRef.current.wish1Level2 = false;
      idleVoFlagsRef.current.wish1Level3 = false;
      return;
    }

    const timerRef = { id: null };
    timerRef.id = safeSetTimeout(() => {
      setWish1IdleLevel(1);

      timerRef.id = safeSetTimeout(() => {
        setWish1IdleLevel(2);
        if (!idleVoFlagsRef.current.wish1Level2) {
          speakLine(VOICE_LINES.wish1Hint, { moment: 'encouragement' });
          idleVoFlagsRef.current.wish1Level2 = true;
        }

        timerRef.id = safeSetTimeout(() => {
          setWish1IdleLevel(3);
        }, 8000);
      }, 8000);
    }, 10000);

    return () => {
      if (timerRef.id) {
        clearTimeout(timerRef.id);
      }
    };
  }, [sceneState.gamePhase, sceneState.wish1Taps, safeSetTimeout]);

  // Wish 2 Idle Hint Progression (10s → 18s → 26s)
  useEffect(() => {
    if (sceneState.gamePhase !== 'wish2-active' || sceneState.wish2Taps >= 3) {
      setWish2IdleLevel(0);
      idleVoFlagsRef.current.wish2Level2 = false;
      idleVoFlagsRef.current.wish2Level3 = false;
      return;
    }

    const timerRef = { id: null };
    timerRef.id = safeSetTimeout(() => {
      setWish2IdleLevel(1);

      timerRef.id = safeSetTimeout(() => {
        setWish2IdleLevel(2);
        if (!idleVoFlagsRef.current.wish2Level2) {
          speakLine(VOICE_LINES.wish2Hint, { moment: 'encouragement' });
          idleVoFlagsRef.current.wish2Level2 = true;
        }

        timerRef.id = safeSetTimeout(() => {
          setWish2IdleLevel(3);
        }, 8000);
      }, 8000);
    }, 10000);

    return () => {
      if (timerRef.id) {
        clearTimeout(timerRef.id);
      }
    };
  }, [sceneState.gamePhase, sceneState.wish2Taps, safeSetTimeout]);

  // Wish 3 Idle Hint Progression (10s → 18s → 26s)
  useEffect(() => {
    if (sceneState.gamePhase !== 'wish3-active' || sceneState.wish3Taps >= 3) {
      setWish3IdleLevel(0);
      idleVoFlagsRef.current.wish3Level2 = false;
      idleVoFlagsRef.current.wish3Level3 = false;
      return;
    }

    const timerRef = { id: null };
    timerRef.id = safeSetTimeout(() => {
      setWish3IdleLevel(1);

      timerRef.id = safeSetTimeout(() => {
        setWish3IdleLevel(2);
        if (!idleVoFlagsRef.current.wish3Level2) {
          speakLine(VOICE_LINES.wish3Hint, { moment: 'encouragement' });
          idleVoFlagsRef.current.wish3Level2 = true;
        }

        timerRef.id = safeSetTimeout(() => {
          setWish3IdleLevel(3);
        }, 8000);
      }, 8000);
    }, 10000);

    return () => {
      if (timerRef.id) {
        clearTimeout(timerRef.id);
      }
    };
  }, [sceneState.gamePhase, sceneState.wish3Taps, safeSetTimeout]);

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
    if (sceneState.wish1Taps >= 3) return;
    markInteraction();
    if (!fromBubble) {
      interruptCurrentVoice();
      playUiTap();
    }
    triggerMiniGesture('center', 1500);
    const newTaps = sceneState.wish1Taps + 1;
    sceneActions.updateState({ wish1Taps: newTaps });

    if (newTaps >= 3) {
      if (fromBubble) {
        triggerWish1Sparkle('all', 2400);
      }
      playSparkle();
      playChime();
      // Pre-mark as spoken so effect won't trigger it, then delay the actual VO
      phaseVoiceRef.current.wish1FinalMomentVo = true;
      sceneActions.updateState({ wish1FinalMoment: true });
      safeSetTimeout(() => {
        speakLine(VOICE_LINES.wish1Complete, { moment: 'celebration' });
      }, 1000);
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
      }, 4200);
    } else {
      if (fromBubble) {
        triggerWish1Sparkle('single', 1700);
      }
    }
  };

  // Bubble tap — kind actions advance wish progress; unkind actions disappear.
  const handleBubbleTap = (bubble) => {
    markInteraction();
    interruptCurrentVoice();
    playUiTap();
    if (bubble.voiceLine) {
      speakLine(bubble.voiceLine, { moment: 'encouragement' });
    }
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    if (bubble.actionKey) {
      removedWish1BubbleKeysRef.current.add(bubble.actionKey);
    }
    if (bubble.type === 'kind') {
      handleWish1Tap({ fromBubble: true });
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
    if (sceneState.gamePhase !== 'wish3-active' && wish3Sparkle.type !== null) {
      wish3SparkleCancelRef.current?.();
      wish3SparkleCancelRef.current = null;
      setWish3Sparkle(prev => ({ ...prev, type: null }));
    }
  }, [sceneState.gamePhase, wish3Sparkle.type]);

  useEffect(() => () => {
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
      setBubbles([]);
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

    spawnBubble();
    const recurringInterval = setInterval(spawnBubble, 1800);

    return () => {
      clearInterval(recurringInterval);
    };
  }, [sceneState.gamePhase, sceneState.wish1Taps, safeSetTimeout, wish1IdleLevel]);

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
    if (phase === 'wish2-active') updates.wish1Taps = 3;
    if (phase === 'wish2-complete') {
      updates.wish1Taps = 3;
      updates.wish2Taps = 3;
      updates.bowlStates = [true, true, true];
      updates.wish2PlateFoods = ['apple', 'banana', 'rice'];
      updates.wish2FoodPool = [];
    }
    if (phase === 'wish3-active') {
      updates.wish1Taps = 3;
      updates.wish2Taps = 3;
      updates.bowlStates = [true, true, true];
      updates.wish2PlateFoods = ['apple', 'banana', 'rice'];
      updates.wish2FoodPool = [];
    }
    if (phase === 'wish3-complete') {
      updates.wish1Taps = 3;
      updates.wish2Taps = 3;
      updates.wish3Taps = 3;
      updates.bowlStates = [true, true, true];
      updates.wish2PlateFoods = ['apple', 'banana', 'rice'];
      updates.wish2FoodPool = [];
    }
    sceneActions.updateState(updates);
    markInteraction();
  }, [getTestResetState, markInteraction, sceneActions]);

  const handleWish2FoodDrop = (index, foodKey) => {
    if (!foodKey) return;
    const currentPlateFoods = sceneState.wish2PlateFoods || [null, null, null];
    const currentFoodPool = sceneState.wish2FoodPool || [...WISH2_FOOD_KEYS];
    if (currentPlateFoods[index]) return;
    if (!currentFoodPool.includes(foodKey)) return;

    markInteraction();
    interruptCurrentVoice();
    playUiTap();
    triggerMiniGesture('center', 1500);

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
      triggerWish2Sparkle('all', 2400);
      playSparkle();
      playChime();
      // Trigger completion VO immediately on final tap (more reliable than waiting for effect timing).
      phaseVoiceRef.current.wish2FinalMomentVo = true;
      speakLine(VOICE_LINES.wish2Complete, { moment: 'celebration' });
      sceneActions.updateState({ wish2FinalMoment: true });
      safeSetTimeout(() => {
        sceneActions.updateState({
          gamePhase: 'wish3-active',
          wish2FinalMoment: false,
          wish3Taps: 0,
          parkStates: [false, false, false],
          wish3FinalMoment: false
        });
      }, 4200);
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
    triggerMiniGesture('center', 1500);
    const newTaps = sceneState.wish3Taps + 1;
    sceneActions.updateState({ wish3Taps: newTaps });

    if (newTaps >= 3) {
      triggerWish3Sparkle('all', 2400);
      playSparkle();
      playChime();
      // Trigger completion VO immediately on final tap (prevents missed/cut playback).
      phaseVoiceRef.current.wish3FinalMomentVo = true;
      speakLine(VOICE_LINES.wish3Complete, { moment: 'celebration' });
      sceneActions.updateState({ wish3FinalMoment: true });
      safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'all-wishes-complete', wish3FinalMoment: false }); }, 5600);
    } else {
      triggerWish3Sparkle('single', 1700);
    }
  };

  // Specific handler for individual park items (optional enhancement from your code logic)
  const handleParkTap = (index) => {
    if (sceneState.parkStates[index] === true) return;
    markInteraction();
    playUiTap();
    const newStates = [...sceneState.parkStates];
    newStates[index] = true;
    const count = newStates.filter(Boolean).length;

    sceneActions.updateState({ parkStates: newStates, wish3Taps: count });

    if (count === 3) {
      playSparkle();
      playChime();
      sceneActions.updateState({ wish3FinalMoment: true });
      safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'all-wishes-complete', wish3FinalMoment: false }); }, 1000);
    }
  };

  const handleTrunkTap = () => {
    markInteraction();
    playUiTap();
    const newTaps = sceneState.trunkTaps + 1;
    sceneActions.updateState({ trunkTaps: newTaps, gamePhase: 'dream-clearing' });

    if (newTaps >= 3) {
      playSparkle();
      playChime();
      sceneActions.updateState({ dreamRevealed: true });
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
    sceneActions.updateState({ currentModal: null, draftData: null });
  };

  return (
    <div className="dreams-wishes-game" data-zone="about-me-hut">
      <img src={dreamsBg} alt="Background" className="dreams-background" />
      <HomeButton onNavigate={onNavigate} />
      <ZoneBadgeButton zoneId="about-me-hut" onBack={() => onNavigate?.('zone-welcome')} />
      <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />

      {/* Story Progress Header */}
      {!sceneState.gamePhase.startsWith('dream') &&
        sceneState.gamePhase !== 'comparison-card' &&
        sceneState.gamePhase !== 'ending' && (
          <StoryProgressHeader discoveries={getDiscoveries()} isChildMode={false} />
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
        <div className="intro-overlay">
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
              className="heartbeat-delayed"
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
            <div className="earth-container" onClick={handleWish1Tap}>
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
                <div key={i} className="face-emoji" style={{ transform: `rotate(${i * 60}deg) translate(240px) rotate(-${i * 60}deg)`, opacity: sceneState.wish1Taps >= 2 ? 0.6 : 1, transition: 'all 0.6s ease' }}>{sceneState.wish1Taps >= 3 ? '😊' : sceneState.wish1Taps >= 2 ? '😐' : '😢'}</div>
              ))}
            </div>
            {/* Bubbles */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 12 }}>
              {bubbles.map(bubble => (
                <div
                  key={bubble.id}
                  onClick={() => handleBubbleTap(bubble)}
                  className={`bubble ${bubble.type === 'kind' && wish1IdleLevel === 1 ? 'hint' : ''} ${bubble.type === 'kind' && wish1IdleLevel === 2 ? 'hint-strong' : ''} ${bubble.type === 'kind' && wish1IdleLevel === 3 ? 'hint-final' : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${bubble.left}%`,
                    top: `${bubble.top}%`,
                    cursor: 'pointer',
                    userSelect: 'none',
                    animation: `bubbleFloat ${bubble.lifetimeS || 12}s linear forwards`,
                    transform: 'translate(-50%, -50%)',
                    width: '255px',
                    height: '255px',
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
                      width: '78%',
                      height: '78%',
                      objectFit: 'contain',
                    }}
                  />
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
              className="heartbeat-delayed"
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
              className="heartbeat-delayed"
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
                style={wish3IdleLevel >= 1 ? { filter: 'drop-shadow(0 0 14px rgba(255, 231, 160, 0.85))' } : undefined}
              />

              {/* Hotspot 0: Left - Flower reveal */}
              <div
                onClick={() => handleParkTap(0)}
                className={`${wish3IdleLevel === 1 && !sceneState.parkStates[0] ? 'hint' : ''} ${wish3IdleLevel === 2 && !sceneState.parkStates[0] ? 'hint-strong' : ''} ${wish3IdleLevel === 3 && !sceneState.parkStates[0] ? 'hint-final' : ''}`}
                style={{
                  position: 'absolute',
                  left: '18%',
                  bottom: '25%',
                  width: '120px',
                  height: '140px',
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
                  width: '140px',
                  height: '160px',
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
                  width: '140px',
                  height: '180px',
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
              className="heartbeat-delayed"
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
              className="heartbeat-delayed"
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
            onCancel={() => {
              setShowDrawingPad(false);
              handleDrawingCancel();
            }}
          />
        </div>
      )}

      {/* Dream Clouded / Clearing */}
      {(sceneState.gamePhase === 'dream-clouded' || sceneState.gamePhase === 'dream-clearing') && (
        <div className="dream-screen">
          {/* Sparkles when dream revealed */}
          {sceneState.dreamRevealed && (
            <SparkleAnimation
              type="magic"
              duration={2000}
              area="full"
            />
          )}
          <div className="dream-container">
            <div className="dream-drawing-display">
              {sceneState.childDreamDrawing && <img src={sceneState.childDreamDrawing} alt="Dream" className="dream-image" style={{ filter: sceneState.dreamRevealed ? 'none' : (sceneState.trunkTaps === 3 ? 'none' : 'blur(6px)'), opacity: sceneState.dreamRevealed ? 1 : (0.5 + (sceneState.trunkTaps * 0.15)), boxShadow: sceneState.dreamRevealed ? '0 0 40px rgba(242, 215, 167, 0.6), 0 0 80px rgba(242, 215, 167, 0.3)' : 'none' }} />}
            </div>
            <div className="clouds-container">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`dream-cloud cloud-${i + 1} ${sceneState.trunkTaps > i ? 'cloud-fade' : ''}`}><img src={cloudImg} alt="Cloud" className="cloud-icon" /></div>
              ))}
            </div>
            <div className={`ganesha-helper ${sceneState.trunkTaps > 0 ? 'ganesha-blowing' : ''}`} onClick={handleTrunkTap}>
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
          <h1 className="friendship-title">Our Dreams Together</h1>
          <p className="friendship-subtitle">When we help the world, dreams grow.</p>
          <div className="friendship-grid">
            <div className="friend-column ganesha-card">
              <img src={babyGaneshaSit} alt="Ganesha" className="column-header-image" />
              <div className="column-label">My Wishes</div>
              <div className="friend-items-grid">
                <div className="friend-item">
                  <div className="friend-item-label">Wish 1</div>
                  <img src={wishEarthHappy} alt="Happy Earth wish" className="friend-item-img" />
                  <div className="friend-item-text">Happiness</div>
                </div>
                <div className="friend-item">
                  <div className="friend-item-label">Wish 2</div>
                  <img src={wishBowlFull} alt="Sharing wish" className="friend-item-img" />
                  <div className="friend-item-text">Sharing</div>
                </div>
                <div className="friend-item">
                  <div className="friend-item-label">Wish 3</div>
                  <img src={wishForest4} alt="Green world wish" className="friend-item-img" />
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

      {/* Test Panel */}
      <div style={{ position: 'fixed', top: 84, right: 16, zIndex: 4000, background: 'rgba(255,255,255,0.95)', border: '1px solid #d8c4a7', borderRadius: 12, padding: 10, width: 230, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
        <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 8 }}>TEST PANEL</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <button onClick={() => jumpToTestPhase('intro')}>Intro</button>
          <button onClick={() => jumpToTestPhase('wish1-intro')}>W1 Intro</button>
          <button onClick={() => jumpToTestPhase('wish1-active')}>W1 Active</button>
          <button onClick={() => jumpToTestPhase('wish1-complete')}>W1 Done</button>
          <button onClick={() => jumpToTestPhase('wish2-active')}>W2 Active</button>
          <button onClick={() => jumpToTestPhase('wish2-complete')}>W2 Done</button>
          <button onClick={() => jumpToTestPhase('wish3-active')}>W3 Active</button>
          <button onClick={() => jumpToTestPhase('wish3-complete')}>W3 Done</button>
          <button onClick={() => jumpToTestPhase('dream-drawing')}>Dream Start</button>
          <button onClick={() => jumpToTestPhase('dream-clouded')}>Clouded</button>
          <button onClick={() => jumpToTestPhase('dream-clearing')}>Dream Clear</button>
          <button onClick={() => jumpToTestPhase('comparison-card')}>Compare</button>
          <button onClick={() => jumpToTestPhase('ending')}>Ending</button>
          <button onClick={() => jumpToTestPhase('intro')} style={{ gridColumn: '1 / span 2' }}>Reload Scene</button>
        </div>
      </div>

      {/* Mini Gesture (Thumbs Up) on Success */}
      {miniGesture.show && (
        <div
          key={`mini-gesture-${miniGesture.key}`}
          className={`ganesha-gesture-cue ganesha-gesture-cue--${miniGesture.target}`}
          style={{ '--mini-cue-duration': `${miniGesture.durationMs}ms` }}
          aria-hidden="true"
        >
          <img className="mini-gesture-icon" src="/images/hand-thumbsup.svg" alt="" />
        </div>
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
            childName="dream maker"
            isFinalScene={false}
            completionData={{
              completed: true,
              stars: sceneState.stars || 3
            }}
            onContinue={() => { playUiTap(); if (onNavigate) onNavigate('my-indian-story'); else if (onComplete) onComplete(); }}
            onExploreZones={() => { playUiTap(); if (onNavigate) onNavigate('zones'); }}
            onReplay={() => { playUiTap(); sceneActions.updateState({ gamePhase: 'intro', wish1Taps: 0, wish1FinalMoment: false, wish2Taps: 0, wish2FinalMoment: false, wish3Taps: 0, wish3FinalMoment: false, bowlStates: [false, false, false], wish2PlateFoods: [null, null, null], wish2FoodPool: [...WISH2_FOOD_KEYS], trunkTaps: 0, childDreamDrawing: null, showingCompletionScreen: false, completed: false }); }}
            onBackToMap={() => { if (onNavigate) onNavigate('zone-welcome'); else if (onBack) onBack(); }}
            onHome={() => { if (onNavigate) onNavigate('home'); }}
          />
        </div>
      )}
    </div>
  );
};

export default DreamsWishesGame;
