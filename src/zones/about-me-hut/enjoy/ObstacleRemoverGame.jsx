import React, { useState, useEffect, useRef, useCallback } from 'react';
import './DreamsWishesGame.css';
import SceneCompletionCelebration from "../../../lib/components/celebration/SceneCompletionCelebration";
import DrawingPad from '../components/Drawingpad';
import StoryProgressHeader from '../components/StoryProgressHeader';

// Navigation Components
import SceneManager from "../../../lib/components/scenes/SceneManager";

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

// Wish Images
import wishEarthSad from './assets/images/wish-images/wish-earth-sad.png';
import wishEarthHappy from './assets/images/wish-images/wish-earth-happy.png';
import wishBowlEmpty from './assets/images/wish-images/wish-bowl-empty.png';
import wishBowlFull from './assets/images/wish-images/wish-bowl-full.png';
import wishForest1 from './assets/images/wish-images/wish-forest-1.png';
import wishForest2 from './assets/images/wish-images/wish-forest-2.png';
import wishForest3 from './assets/images/wish-images/wish-forest-3.png';
import wishForest4 from './assets/images/wish-images/wish-forest-4.png';
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

  const VOICE_LINES = {
    // Opening Modal
    opening: "Let's discover… how we can make wishes come true!",

    // Wish 1
    wish1Intro: "My wish is for a happy world... Let's help make it smile.",
    wish1Active: "Tap the Earth to help it smile!",
    wish1Complete: "The Earth is smiling. Thank you for helping the world.",

    // Wish 2
    wish2Intro: "My second wish… is to share our food. So no one stays hungry.",
    wish2Active: "Tap the bowl to fill with food.",
    wish2Complete: "Wonderful! The bowls are full. Sharing makes everyone happy.",

    // Wish 3
    wish3Intro: "My last wish… is for a green world full of life. Let’s help this forest grow!",
    wish3Active: "Tap the forest to help it grow!",
    wish3Complete: "Wow! The forest is full of life. You helped nature grow.",

    // All Wishes Complete (now combined with drawing intro)
    allWishesComplete: "You made the world brighter. Now it's your turn. Draw your happy wish.",

    // Dream Phases
    // dreamIntro: (REMOVED — merged into allWishesComplete)
    dreamDrawing: "What would you draw?",
    dreamClouded: "Your dream is beautiful… but clouds are hiding it. Tap my trunk to clear them.",
    dreamClearing: "Keep tapping my trunk to clear the clouds!",
    dreamRevealed: "There it is… your dream. Dream big, little friend. I believe in you.",

    // Comparison Card
    comparison: "My wishes… and your dream… When we help each other… dreams grow stronger.",

    // Ending
    ending: "Dream big, little friend. I'm always cheering for you."
  };

  if (!sceneState) return <div>Loading...</div>;

  // Get content from configs
  const openingModalContent = getOpeningModal('about-me-hut', 'dreams-wishes');
  const completionModalContent = getCompletionModal('about-me-hut', 'dreams-wishes');
  const completionIcons = openingModalContent?.icons || ['wish-earth', 'wish-share', 'wish-flower'];

  // --- LOCAL UI STATE (Not saved in DB) ---
  // ── Resume Delay (shared across pause/resume logic) ──────────────────────────
  const RESUME_DELAY_MS = 3000;
  const IDLE_HINT_DELAY_MS = 15000;

  const { isAudioOn, toggleAudio } = useAudioPreference();

  const [returnHintNonce, setReturnHintNonce] = useState(0);
  const lastInteractionAtRef = useRef(Date.now());
  const markInteraction = useCallback(() => {
    lastInteractionAtRef.current = Date.now();
  }, []);

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

  const triggerWish1Sparkle = useCallback((type, durationMs = 1500) => {
    wish1SparkleCancelRef.current?.();
    setWish1Sparkle(prev => ({ type, key: prev.key + 1 }));
    wish1SparkleCancelRef.current = safeSetTimeout(() => {
      setWish1Sparkle(prev => ({ ...prev, type: null }));
      wish1SparkleCancelRef.current = null;
    }, durationMs + 50);
  }, [safeSetTimeout]);

  const triggerWish2Sparkle = useCallback((type, durationMs = 1500, targetIndex = null) => {
    wish2SparkleCancelRef.current?.();
    setWish2Sparkle(prev => ({ type, key: prev.key + 1, targetIndex }));
    wish2SparkleCancelRef.current = safeSetTimeout(() => {
      setWish2Sparkle(prev => ({ ...prev, type: null, targetIndex: null }));
      wish2SparkleCancelRef.current = null;
    }, durationMs + 50);
  }, [safeSetTimeout]);

  const triggerWish3Sparkle = useCallback((type, durationMs = 1500) => {
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
        return "Tap the Earth to help it smile.";
      case 'wish2-active':
        return "Tap each bowl to fill it with food.";
      case 'wish3-active':
        return "Tap the forest to help it grow.";
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

      // On continue in Wish 2 active (in between tapping), jump back to wish2-intro
      if (gamePhase === 'wish2-active') {
        setResumeMessage("Let's hear the wish again! 🥣");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        sceneActions.updateState({
          gamePhase: 'wish2-intro',
          bowlStates: [false, false, false],
          wish2FinalMoment: false
        });
        // Block stale active/final VO (effect may run once before state update settles).
        phaseVoiceRef.current = { wish2Active: true, wish2FinalMomentVo: true };
        return;
      }

      // On continue in Wish 3 active (in between tapping), jump back to wish3-intro
      if (gamePhase === 'wish3-active') {
        setResumeMessage("Let's hear the wish again! 🌸");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        sceneActions.updateState({
          gamePhase: 'wish3-intro',
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
        sceneActions.updateState({ gamePhase: 'wish2-intro', bowlStates: [false, false, false], wish2FinalMoment: false });
        phaseVoiceRef.current = { wish2Complete: true, wish2FinalMomentVo: true };
        return;
      }

      if (gamePhase === 'wish3-complete') {
        setResumeMessage("Let's hear the wish again! 🌸");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        sceneActions.updateState({ gamePhase: 'wish3-intro', wish3Taps: 0, parkStates: [false, false, false], wish3FinalMoment: false });
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
      cancel = safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'wish2-intro', wish1FinalMoment: false }); }, 4500);
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
    sceneActions.updateState({ gamePhase: 'wish1-intro' });
  };

  const handleWish1Tap = () => {
    if (sceneState.wish1Taps >= 3) return;
    markInteraction();
    interruptCurrentVoice();
    playUiTap();
    triggerMiniGesture('center', 1500);
    const newTaps = sceneState.wish1Taps + 1;
    sceneActions.updateState({ wish1Taps: newTaps });

    if (newTaps >= 3) {
      triggerWish1Sparkle('all', 1500);
      playSparkle();
      playChime();
      sceneActions.updateState({ wish1FinalMoment: true });
      safeSetTimeout(() => {
        sceneActions.updateState({ gamePhase: 'wish2-intro', wish1FinalMoment: false });
      }, 4200);
    } else {
      triggerWish1Sparkle('single', 1500);
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

  const handleWish2Tap = (index) => {
    if (sceneState.bowlStates[index] === true) return;
    markInteraction();
    interruptCurrentVoice();
    playUiTap();
    triggerMiniGesture('center', 1500);

    const newStates = [...sceneState.bowlStates];
    newStates[index] = true;
    const count = newStates.filter(Boolean).length;

    sceneActions.updateState({ bowlStates: newStates, wish2Taps: count });

    if (count === 3) {
      triggerWish2Sparkle('all', 1500);
      playSparkle();
      playChime();
      // Trigger completion VO immediately on final tap (more reliable than waiting for effect timing).
      phaseVoiceRef.current.wish2FinalMomentVo = true;
      speakLine(VOICE_LINES.wish2Complete, { moment: 'celebration' });
      sceneActions.updateState({ wish2FinalMoment: true });
      safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'wish3-intro', wish2FinalMoment: false }); }, 4200);
    } else {
      triggerWish2Sparkle('single', 1500, index);
    }
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
      triggerWish3Sparkle('all', 1500);
      playSparkle();
      playChime();
      // Trigger completion VO immediately on final tap (prevents missed/cut playback).
      phaseVoiceRef.current.wish3FinalMomentVo = true;
      speakLine(VOICE_LINES.wish3Complete, { moment: 'celebration' });
      sceneActions.updateState({ wish3FinalMoment: true });
      safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'all-wishes-complete', wish3FinalMoment: false }); }, 5600);
    } else {
      triggerWish3Sparkle('single', 1500);
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
            <p className="wish-intro-text">My first wish is for a happy world.</p>
            <p className="wish-intro-text">The world looks a little sad right now</p>
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
                <SparkleAnimation
                  key={`wish1-single-${wish1Sparkle.key}`}
                  type="star"
                  count={15}
                  color="#ff9ebd"
                  size={10}
                  duration={1500}
                  fadeOut={true}
                  area="full"
                />
              )}
              {wish1Sparkle.type === 'all' && (
                <SparkleAnimation
                  key={`wish1-all-${wish1Sparkle.key}`}
                  type="magic"
                  count={20}
                  color="lightblue"
                  size={10}
                  duration={1500}
                  fadeOut={true}
                  area="full"
                />
              )}
            </div>
            <div className="faces-container">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="face-emoji" style={{ transform: `rotate(${i * 60}deg) translate(240px) rotate(-${i * 60}deg)`, opacity: sceneState.wish1Taps >= 2 ? 0.6 : 1, transition: 'all 0.6s ease' }}>{sceneState.wish1Taps >= 3 ? '😊' : sceneState.wish1Taps >= 2 ? '😐' : '😢'}</div>
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

      {/* Wish 2 Intro */}
      {sceneState.gamePhase === 'wish2-intro' && (
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
        <div className="wish-screen">
          <div className="game-header-hud">
            {/* Header instruction commented out - using progress header instead */}
            {/* <div className="wish-instruction-bubble">Tap the bowls 3 times to fill them! ({sceneState.wish2Taps}/3)</div> */}
            <div className="wish-progress-header">
              <div className="wish-progress-title">Wish 2: Fill The Bowls</div>
              <div className="wish-smiley-row">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`wish-smiley-icon ${i < sceneState.wish2Taps ? 'filled' : ''}`}>
                    {i < sceneState.wish2Taps ? '😊' : '😶'}
                  </span>
                ))}
              </div>
              <div className="wish-progress-count">{sceneState.wish2Taps}/3</div>
            </div>
          </div>
          <div className="wish-interactive-container">
            <div className="bowls-container">
              {sceneState.bowlStates.map((isFilled, index) => (
                <div key={index} className={`bowl ${isFilled ? 'bowl-filled' : 'bowl-empty'}`} onClick={() => handleWish2Tap(index)}>
                  <img src={isFilled ? wishBowlFull : wishBowlEmpty} alt={`Bowl ${index + 1}`} className={`bowl-image ${isFilled ? 'bowl-glow-bounce' : ''}`} />
                  {wish2Sparkle.type === 'single' && wish2Sparkle.targetIndex === index && (
                    <SparkleAnimation
                      key={`wish2-single-${wish2Sparkle.key}-${index}`}
                      type="star"
                      count={15}
                      color="#ff9ebd"
                      size={10}
                      duration={1500}
                      fadeOut={true}
                      area="full"
                    />
                  )}
                </div>
              ))}
              {wish2Sparkle.type === 'all' && (
                <SparkleAnimation
                  key={`wish2-all-${wish2Sparkle.key}`}
                  type="magic"
                  count={20}
                  color="lightblue"
                  size={10}
                  duration={1500}
                  fadeOut={true}
                  area="full"
                />
              )}
            </div>
          </div>
        </div>
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

      {/* Wish 3 Intro */}
      {sceneState.gamePhase === 'wish3-intro' && (
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
            {/* Header instruction commented out - using progress header instead */}
            {/* <div className="wish-instruction-bubble">Tap the park 3 times to make it bloom! ({sceneState.wish3Taps}/3)</div> */}
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
            <div className="park-scene" onClick={handleWish3Tap}>
              <img
                src={[wishForest1, wishForest2, wishForest3, wishForest4][sceneState.wish3Taps]}
                alt="Growing forest"
                className={`park-ground-image green ${sceneState.wish3Taps >= 3 ? 'complete-glow-pulse' : ''}`}
              />
              {wish3Sparkle.type === 'single' && (
                <SparkleAnimation
                  key={`wish3-single-${wish3Sparkle.key}`}
                  type="star"
                  count={15}
                  color="#ff9ebd"
                  size={10}
                  duration={1500}
                  fadeOut={true}
                  area="full"
                />
              )}
              {wish3Sparkle.type === 'all' && (
                <SparkleAnimation
                  key={`wish3-all-${wish3Sparkle.key}`}
                  type="magic"
                  count={20}
                  color="lightblue"
                  size={10}
                  duration={1500}
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
          <h1 className="friendship-title">Dreams Come Together</h1>
          <p className="friendship-subtitle">When we help the world, dreams grow.</p>
          <div className="friendship-grid">
            <div className="friend-column ganesha-card">
              <img src={babyGaneshaSit} alt="Ganesha" className="column-header-image" />
              <div className="column-label">Ganesha's Wishes</div>
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
              <div className="column-label">Your Dream</div>
              <div className="dream-display-box">
                {sceneState.childDreamDrawing ? <img src={sceneState.childDreamDrawing} alt="Dream" className="dream-thumbnail" /> : "Loading..."}
              </div>
            </div>
          </div>
          <Button
            variant="primary"
            size="large"
            onClick={() => {
              playChime();
              sceneActions.updateState({ showingCompletionScreen: true, completed: true });
            }}
            className="heartbeat-gentle"
          >
            Continue
          </Button>
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
              'wish-earth': wishIconEarth,
              'wish-share': wishIconShare,
              'wish-flower': wishIconFlower
            }}
            starsEarned={sceneState.stars}
            totalStars={3}
            nextSceneName="About Me Hut Complete"
            childName="dream maker"
            isFinalScene={true}
            completionData={{
              completed: true,
              stars: sceneState.stars || 3
            }}
            onContinue={() => { playUiTap(); if (onNavigate) onNavigate('scene-complete-continue'); else if (onComplete) onComplete(); }}
            onExploreZones={() => { playUiTap(); if (onNavigate) onNavigate('zones'); }}
            onReplay={() => { playUiTap(); sceneActions.updateState({ gamePhase: 'intro', wish1Taps: 0, wish1FinalMoment: false, wish2Taps: 0, wish2FinalMoment: false, wish3Taps: 0, wish3FinalMoment: false, bowlStates: [false, false, false], trunkTaps: 0, childDreamDrawing: null, showingCompletionScreen: false, completed: false }); }}
            onBackToMap={() => { if (onNavigate) onNavigate('zone-welcome'); else if (onBack) onBack(); }}
            onHome={() => { if (onNavigate) onNavigate('home'); }}
          />
        </div>
      )}
    </div>
  );
};

export default DreamsWishesGame;
