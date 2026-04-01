import React, { useState, useEffect, useRef } from 'react';
import './DreamsWishesGame.css';
import SceneCompletionCelebration from "../../../lib/components/celebration/SceneCompletionCelebration";
import DrawingPad from '../components/Drawingpad';
import StoryProgressHeader from '../components/StoryProgressHeader';

// Navigation Components
import BackToMapButton from '../../../lib/components/navigation/BackToMapButton';
import MenuButton from '../../../lib/components/navigation/MenuButton';
import TocaBocaNav from '../../../lib/components/navigation/TocaBocaNav';
import HelpMenu from '../../../lib/components/help/HelpMenu';
import { obstacleRemoverHelpConfig } from './helpConfig';
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

// Import Unified Design System
import Button from '../../../lib/components/ui/Button/Button';
import '../../../lib/styles/zone-themes.css';
import '../../../lib/styles/animations.css';

// Import images
import babyGaneshaImg from '../../../public/images/ganesha-final-new.svg';
import babyGaneshaSit from '../../../public/images/ganesha-final-new.svg';
import dreamsBg from './assets/images/dream-bg.png';

// Wish Icons
import wishIconEarth from './assets/images/wish-icon-earth.png';
import wishIconFlower from './assets/images/wish-icon-flower.png';
import wishIconShare from './assets/images/wish-icon-share.png';

// Wish Images
import wishEarthSad from './assets/images/wish-images/wish-earth-sad.png';
import wishEarthHappy from './assets/images/wish-images/wish-earth-happy.png';
import wishGrassDry from './assets/images/wish-images/wish-grass-dry.png';
import wishGrassGreen from './assets/images/wish-images/wish-grass-green.png';
import wishBowlEmpty from './assets/images/wish-images/wish-bowl-empty.png';
import wishBowlFull from './assets/images/wish-images/wish-bowl-full.png';
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

          wish2Taps: 0,
          bowlStates: [false, false, false], // Track individual bowls

          wish3Taps: 0,
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
    wish1Intro: "My first wish… is for a happy world. Oh no… the Earth looks a little sad. Can you help make it smile?",
    wish1Active: "Tap the Earth… to help it smile!",
    wish1Complete: "Look! … The Earth is smiling! Thank you for helping the world.",

    // Wish 2
    wish2Intro: "My second wish… is to share with everyone. When we share… no one feels hungry or alone.",
    wish2Active: "Tap the bowls… to fill them with sharing!",
    wish2Complete: "Wonderful! … The bowls are full! Sharing makes hearts happy.",

    // Wish 3
    wish3Intro: "My last wish… is for a green world full of play. Let's help this park grow!",
    wish3Active: "Tap the park… to help it bloom!",
    wish3Complete: "Wow! … The park is alive and happy! You helped nature grow.",

    // All Wishes Complete
    allWishesComplete: "You did it! You helped make the world brighter. Now… it's your turn.",

    // Dream Phases
    dreamIntro: "We all have dreams inside us. Draw your dream… on this magic canvas.",
    dreamDrawing: "What would you love to dream?",
    dreamClouded: "Your dream is beautiful! Oh look… clouds are hiding it. Sometimes obstacles hide our dreams.",
    dreamClearing: "Tap my trunk… to move the clouds! Keep going… you're clearing them!",
    dreamRevealed: "There it is… your dream! What a beautiful dream. I believe in you.",

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
  const [showSlideMenu, setShowSlideMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  // ── Resume Delay (shared across pause/resume logic) ──────────────────────────
  const RESUME_DELAY_MS = 3000;

  const { isAudioOn, toggleAudio } = useAudioPreference();

  // ── Callbacks for pause/resume ────────────────────────────────────────────────
  const onReturnHint = () => {
    // Optional: trigger visual hint on return
  };

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
  const { speak, stop: stopSpokenVoice } = useGaneshaVoice();
  useEffect(() => { startIdleTimer(); return () => stopIdleTimer(); }, [startIdleTimer, stopIdleTimer]);
  useEffect(() => { setCurrentPhase(sceneState?.gamePhase ?? null); }, [sceneState?.gamePhase, setCurrentPhase]);
  useEffect(() => {
    if (isAudioOn && sceneState.gamePhase !== 'intro' && !sceneState.showingCompletionScreen) startMusic();
    else stopMusic();
  }, [isAudioOn, sceneState.gamePhase, sceneState.showingCompletionScreen, startMusic, stopMusic]);
  useEffect(() => { setGlobalVolume(isAudioOn ? 1 : 0); }, [isAudioOn, setGlobalVolume]);
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
      resumeCelebRef.current?.();
      onReturnHint?.();
    },
    resumeDelay: RESUME_DELAY_MS  // ← Timers sync with audio resume
  });

  const [showDrawingPad, setShowDrawingPad] = useState(false); // Controls visibility

  const reloadHandledRef = useRef(false);
  const resumePopupTimeoutRef = useRef(null);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');
  const [openingButtonVisible] = useState(true);
  const phaseVoiceRef = useRef({});
  const speakLine = (text, options = {}) => {
    if (!isAudioOn || !text) {
      options.onEnd?.();
      return;
    }
    const { onEnd, moment = 'encouragement' } = options;
    speak(text, { age: 7, style: 'child', moment, onEnd });
  };

  // --- HELPERS ---
  const getDiscoveries = () => {
    const items = [];
    const phase = sceneState.gamePhase;

    // Logic to show progress badges in header
    const phasesAfterWish1 = ['wish1-complete', 'wish2-intro', 'wish2-active', 'wish2-complete', 'wish3-intro', 'wish3-active', 'wish3-complete', 'all-wishes-complete', 'dream-intro', 'dream-drawing', 'dream-clouded', 'dream-clearing', 'dream-revealed', 'comparison-card', 'ending'];
    if (phasesAfterWish1.includes(phase)) items.push({ name: 'Happiness', emoji: '🌍' });

    const phasesAfterWish2 = ['wish2-complete', 'wish3-intro', 'wish3-active', 'wish3-complete', 'all-wishes-complete', 'dream-intro', 'dream-drawing', 'dream-clouded', 'dream-clearing', 'dream-revealed', 'comparison-card', 'ending'];
    if (phasesAfterWish2.includes(phase)) items.push({ name: 'Sharing', emoji: '🥣' });

    const phasesAfterWish3 = ['wish3-complete', 'all-wishes-complete', 'dream-intro', 'dream-drawing', 'dream-clouded', 'dream-clearing', 'dream-revealed', 'comparison-card', 'ending'];
    if (phasesAfterWish3.includes(phase)) items.push({ name: 'Nature', emoji: '🌸' });

    if (sceneState.childDreamDrawing) items.push({ name: 'My Dream', image: sceneState.childDreamDrawing });

    return items;
  };

  // --- RELOAD DETECTION & RESTORATION ---
  useEffect(() => {
    if (isReload && !reloadHandledRef.current) {
      reloadHandledRef.current = true;
      const { gamePhase, wish1Taps, wish3Taps, trunkTaps, bowlStates, currentModal, draftData } = sceneState;

      console.log("🔄 Reload detected. Phase:", gamePhase, "Modal:", currentModal);
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);

      // 1. RESTORE DRAWING IF OPEN
      if (currentModal === 'drawing') {
        setResumeMessage("Welcome back! We saved your drawing! 🎨");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        setShowDrawingPad(true); // Re-open the pad
        return;
      }

      // Add this BEFORE checking gamePhase values:

      // CHECK TAP COMPLETION - force phase if taps complete but phase not updated
      if (wish1Taps === 3 && gamePhase === 'wish1-active') {
        console.log("🔧 Reload fix: Forcing wish1-complete");
        sceneActions.updateState({ gamePhase: 'wish1-complete' });
        return;
      }

      if (bowlStates.filter(Boolean).length === 3 && gamePhase === 'wish2-active') {
        console.log("🔧 Reload fix: Forcing wish2-complete");
        sceneActions.updateState({ gamePhase: 'wish2-complete' });
        return;
      }

      if (wish3Taps === 3 && gamePhase === 'wish3-active') {
        console.log("🔧 Reload fix: Forcing wish3-complete");
        sceneActions.updateState({ gamePhase: 'wish3-complete' });
        return;
      }

      if (trunkTaps === 3 && (gamePhase === 'dream-clouded' || gamePhase === 'dream-clearing')) {
        console.log("🔧 Reload fix: Forcing dream-revealed");
        sceneActions.updateState({ gamePhase: 'dream-revealed' });
        return;
      }

      // Add this right after the drawing modal check:

      // 2. CHECK FOR WISH COMPLETION PHASES
      if (gamePhase === 'wish1-complete') {
        setResumeMessage("Welcome back! Your first wish is complete! ✨");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        // Let the auto-transition useEffect handle moving to wish2-intro
        return;
      }

      if (gamePhase === 'wish2-complete') {
        setResumeMessage("Welcome back! Two wishes complete! ✨");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        return;
      }

      if (gamePhase === 'wish3-complete') {
        setResumeMessage("Welcome back! All three wishes complete! ✨");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        return;
      }

      if (gamePhase === 'all-wishes-complete') {
        setResumeMessage("All wishes complete! Time to dream! ✨");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        // Auto-transition useEffect will handle moving to dream-clouded
        return;
      }


      // 2. PHASE MESSAGES
      if (gamePhase === 'intro') return;

      if (gamePhase === 'wish1-active' && wish1Taps > 0) {
        setResumeMessage(`Keep tapping! You've tapped ${wish1Taps}/3 times!`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }

      if (gamePhase === 'wish2-active') {
        const filled = bowlStates.filter(Boolean).length;
        if (filled > 0) {
          setResumeMessage(`Great! You've filled ${filled}/3 bowls!`);
          setShowResumePopup(true);
          resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        }
        return;
      }

      if (gamePhase === 'wish3-active' && wish3Taps > 0) {
        setResumeMessage(`Keep going! ${wish3Taps}/3 parts of the park are green!`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }

      if ((gamePhase === 'dream-clouded' || gamePhase === 'dream-clearing') && trunkTaps > 0) {
        setResumeMessage(`Keep clearing the clouds! ${trunkTaps}/3 done!`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }
    }
  }, [isReload, sceneState.gamePhase, sceneState.currentModal]);

  // --- AUTO-TRANSITION HANDLER ---
  useEffect(() => {
    let timer;
    const { gamePhase } = sceneState;

    if (gamePhase === 'wish1-complete') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'wish2-intro' }); }, 4500);
    }
    else if (gamePhase === 'wish2-complete') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'wish3-intro' }); }, 4500);
    }
    else if (gamePhase === 'wish3-complete') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'all-wishes-complete' }); }, 4500);
    }
    else if (gamePhase === 'dream-revealed') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'comparison-card' }); }, 2500);
    }
    else if (gamePhase === 'ending') {
      timer = setTimeout(() => { sceneActions.updateState({ showingCompletionScreen: true }); }, 1500);
    }

    return () => clearTimeout(timer);
  }, [sceneState.gamePhase]);

  useEffect(() => {
    if (sceneState.gamePhase === 'intro') {
      phaseVoiceRef.current = {};
      const timer = setTimeout(() => {
        speakLine(VOICE_LINES.opening, { moment: 'greeting' });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [sceneState.gamePhase, isAudioOn]);

  useEffect(() => {
    // Wish 1
    if (sceneState.gamePhase === 'wish1-intro' && !phaseVoiceRef.current.wish1Intro) {
      phaseVoiceRef.current.wish1Intro = true;
      speakLine(VOICE_LINES.wish1Intro);
    }
    if (sceneState.gamePhase === 'wish1-active' && !phaseVoiceRef.current.wish1Active) {
      phaseVoiceRef.current.wish1Active = true;
      speakLine(VOICE_LINES.wish1Active);
    }
    if (sceneState.gamePhase === 'wish1-complete' && !phaseVoiceRef.current.wish1Complete) {
      phaseVoiceRef.current.wish1Complete = true;
      speakLine(VOICE_LINES.wish1Complete, { moment: 'celebration' });
    }

    // Wish 2
    if (sceneState.gamePhase === 'wish2-intro' && !phaseVoiceRef.current.wish2Intro) {
      phaseVoiceRef.current.wish2Intro = true;
      speakLine(VOICE_LINES.wish2Intro);
    }
    if (sceneState.gamePhase === 'wish2-active' && !phaseVoiceRef.current.wish2Active) {
      phaseVoiceRef.current.wish2Active = true;
      speakLine(VOICE_LINES.wish2Active);
    }
    if (sceneState.gamePhase === 'wish2-complete' && !phaseVoiceRef.current.wish2Complete) {
      phaseVoiceRef.current.wish2Complete = true;
      speakLine(VOICE_LINES.wish2Complete, { moment: 'celebration' });
    }

    // Wish 3
    if (sceneState.gamePhase === 'wish3-intro' && !phaseVoiceRef.current.wish3Intro) {
      phaseVoiceRef.current.wish3Intro = true;
      speakLine(VOICE_LINES.wish3Intro);
    }
    if (sceneState.gamePhase === 'wish3-active' && !phaseVoiceRef.current.wish3Active) {
      phaseVoiceRef.current.wish3Active = true;
      speakLine(VOICE_LINES.wish3Active);
    }
    if (sceneState.gamePhase === 'wish3-complete' && !phaseVoiceRef.current.wish3Complete) {
      phaseVoiceRef.current.wish3Complete = true;
      speakLine(VOICE_LINES.wish3Complete, { moment: 'celebration' });
    }

    // All Wishes Complete
    if (sceneState.gamePhase === 'all-wishes-complete' && !phaseVoiceRef.current.allWishesComplete) {
      phaseVoiceRef.current.allWishesComplete = true;
      speakLine(VOICE_LINES.allWishesComplete);
    }

    // Dream Phases
    if (sceneState.gamePhase === 'dream-intro' && !phaseVoiceRef.current.dreamIntro) {
      phaseVoiceRef.current.dreamIntro = true;
      speakLine(VOICE_LINES.dreamIntro);
    }
    if (sceneState.gamePhase === 'dream-drawing' && !phaseVoiceRef.current.dreamDrawing) {
      phaseVoiceRef.current.dreamDrawing = true;
      speakLine(VOICE_LINES.dreamDrawing);
    }
    if (sceneState.gamePhase === 'dream-clouded' && !phaseVoiceRef.current.dreamClouded) {
      phaseVoiceRef.current.dreamClouded = true;
      speakLine(VOICE_LINES.dreamClouded);
    }
    if (sceneState.gamePhase === 'dream-clearing' && !phaseVoiceRef.current.dreamClearing) {
      phaseVoiceRef.current.dreamClearing = true;
      speakLine(VOICE_LINES.dreamClearing);
    }
    if (sceneState.gamePhase === 'dream-revealed' && !phaseVoiceRef.current.dreamRevealed) {
      phaseVoiceRef.current.dreamRevealed = true;
      speakLine(VOICE_LINES.dreamRevealed, { moment: 'celebration' });
    }

    // Comparison Card
    if (sceneState.gamePhase === 'comparison-card' && !phaseVoiceRef.current.comparison) {
      phaseVoiceRef.current.comparison = true;
      speakLine(VOICE_LINES.comparison);
    }

    // Ending
    if (sceneState.gamePhase === 'ending' && !phaseVoiceRef.current.ending) {
      phaseVoiceRef.current.ending = true;
      speakLine(VOICE_LINES.ending, { moment: 'closing' });
    }
  }, [sceneState.gamePhase, isAudioOn]);

  useEffect(() => {
    if (sceneState.showingCompletionScreen && !phaseVoiceRef.current.completeVo) {
      phaseVoiceRef.current.completeVo = true;
      // Completion screen uses the 'ending' line
      speakLine(VOICE_LINES.ending, { moment: 'closing' });
    }
  }, [sceneState.showingCompletionScreen, isAudioOn]);

  useEffect(() => () => stopSpokenVoice(), [stopSpokenVoice]);


  // --- GAMEPLAY HANDLERS ---

  const handleStartGame = () => {
    playUiTap();
    stopVoice();
    stopSpokenVoice();
    setVoiceVolume(isAudioOn ? 1 : 0);
    sceneActions.updateState({ gamePhase: 'wish1-intro' });
  };

  const handleWish1Tap = () => {
    if (sceneState.wish1Taps >= 3) return;
    playUiTap();
    const newTaps = sceneState.wish1Taps + 1;
    sceneActions.updateState({ wish1Taps: newTaps });

    if (newTaps >= 3) {
      playSparkle();
      playChime();
      setTimeout(() => { sceneActions.updateState({ gamePhase: 'wish1-complete' }); }, 3000);
    }
  };

  const handleWish2Tap = (index) => {
    if (sceneState.bowlStates[index] === true) return;
    playUiTap();

    const newStates = [...sceneState.bowlStates];
    newStates[index] = true;
    const count = newStates.filter(Boolean).length;

    sceneActions.updateState({ bowlStates: newStates, wish2Taps: count });

    if (count === 3) {
      playSparkle();
      playChime();
      setTimeout(() => { sceneActions.updateState({ gamePhase: 'wish2-complete' }); }, 3000);
    }
  };

  const handleWish3Tap = () => {
    if (sceneState.wish3Taps >= 3) return;
    playUiTap();
    const newTaps = sceneState.wish3Taps + 1;
    sceneActions.updateState({ wish3Taps: newTaps });

    if (newTaps >= 3) {
      playSparkle();
      playChime();
      setTimeout(() => { sceneActions.updateState({ gamePhase: 'wish3-complete' }); }, 3000);
    }
  };

  // Specific handler for individual park items (optional enhancement from your code logic)
  const handleParkTap = (index) => {
    if (sceneState.parkStates[index] === true) return;
    playUiTap();
    const newStates = [...sceneState.parkStates];
    newStates[index] = true;
    const count = newStates.filter(Boolean).length;

    sceneActions.updateState({ parkStates: newStates, wish3Taps: count });

    if (count === 3) {
      playSparkle();
      playChime();
      setTimeout(() => { sceneActions.updateState({ gamePhase: 'wish3-complete' }); }, 1000);
    }
  };

  const handleTrunkTap = () => {
    playUiTap();
    const newTaps = sceneState.trunkTaps + 1;
    sceneActions.updateState({ trunkTaps: newTaps, gamePhase: 'dream-clearing' });

    if (newTaps >= 3) {
      playSparkle();
      playChime();
      setTimeout(() => { sceneActions.updateState({ gamePhase: 'dream-revealed' }); }, 1500);
    }
  };

  // --- DRAWING HANDLERS ---

  const handleDreamDrawingSave = (data) => {
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

      {/* Back Button */}
      {sceneState.gamePhase !== 'intro' && !sceneState.showingCompletionScreen && (
        <BackToMapButton onNavigate={onNavigate} />
      )}

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
            <p className="wish-intro-text">The world looks a little sad right now 😔</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => {
                playUiTap();
                sceneActions.updateState({ gamePhase: 'wish1-active' });
              }}
              className="heartbeat-delayed"
            >
              Let's Make Them Smile! 😊
            </Button>
          </div>
        </div>
      )}

      {/* Wish 1 Active */}
      {sceneState.gamePhase === 'wish1-active' && (
        <div className="wish-screen">
          <div className="wish-instruction-bubble">Tap the earth 3 times to send smiles! ({sceneState.wish1Taps}/3)</div>
          <div className="wish-interactive-container">
            <div className="earth-container" onClick={handleWish1Tap}>
              <img src={wishEarthSad} alt="Sad" className="earth-image sad" style={{ opacity: sceneState.wish1Taps === 0 ? 1 : sceneState.wish1Taps === 1 ? 0.6 : sceneState.wish1Taps === 2 ? 0.3 : 0 }} />
              <img src={wishEarthHappy} alt="Happy" className={`earth-image happy ${sceneState.wish1Taps >= 3 ? 'complete-glow-pulse' : ''}`} style={{ opacity: sceneState.wish1Taps === 0 ? 0 : sceneState.wish1Taps === 1 ? 0.4 : sceneState.wish1Taps === 2 ? 0.7 : 1 }} />
            </div>
            <div className="faces-container">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="face-emoji" style={{ transform: `rotate(${i * 60}deg) translate(160px) rotate(-${i * 60}deg)`, opacity: sceneState.wish1Taps >= 2 ? 0.6 : 1, transition: 'all 0.6s ease' }}>{sceneState.wish1Taps >= 3 ? '😊' : sceneState.wish1Taps >= 2 ? '😐' : '😢'}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wish 1 Complete */}
      {sceneState.gamePhase === 'wish1-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          <div className="success-message-large">You made the world smile! 😊✨</div>
          <div className="soft-thank-you">Thank you for helping me 💛</div>
          <div className="wish-checkmark">🌱 1 of 3 wishes complete</div>
          <div className="celebration-elements">{Array.from({ length: 15 }).map((_, i) => <div key={i} className="floating-element" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}>😊</div>)}</div>
        </div>
      )}

      {/* Wish 2 Intro */}
      {sceneState.gamePhase === 'wish2-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">My second wish is that no one feels hungry or alone.</p>
            <p className="wish-intro-text">Let's share with everyone! 🤝</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => {
                playUiTap();
                sceneActions.updateState({ gamePhase: 'wish2-active' });
              }}
              className="heartbeat-delayed"
            >
              Let's Share! 🍎
            </Button>
          </div>
        </div>
      )}

      {/* Wish 2 Active */}
      {sceneState.gamePhase === 'wish2-active' && (
        <div className="wish-screen">
          <div className="wish-instruction-bubble">Tap the bowls 3 times to fill them! ({sceneState.wish2Taps}/3)</div>
          <div className="wish-interactive-container">
            <div className="bowls-container">
              {sceneState.bowlStates.map((isFilled, index) => (
                <div key={index} className={`bowl ${isFilled ? 'bowl-filled' : 'bowl-empty'}`} onClick={() => handleWish2Tap(index)}>
                  <img src={isFilled ? wishBowlFull : wishBowlEmpty} alt={`Bowl ${index + 1}`} className={`bowl-image ${isFilled ? 'bowl-glow-bounce' : ''}`} />
                  {isFilled && <div className="bowl-food pop-in">🍚</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wish 2 Complete */}
      {sceneState.gamePhase === 'wish2-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          <div className="success-message-large">You filled hearts with sharing! ✨</div>
          <div className="soft-thank-you">Thank you for caring so much 💛</div>
          <div className="wish-checkmark">🌱 2 of 3 wishes complete</div>
          <div className="celebration-elements">{Array.from({ length: 15 }).map((_, i) => <div key={i} className="floating-element" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}>❤️</div>)}</div>
        </div>
      )}

      {/* Wish 3 Intro */}
      {sceneState.gamePhase === 'wish3-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">My last wish is for a green, happy world.</p>
            <p className="wish-intro-text">Where kids can run, play, and smile outside! 🌿</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => {
                playUiTap();
                sceneActions.updateState({ gamePhase: 'wish3-active' });
              }}
              className="heartbeat-delayed"
            >
              Let's Make It Green! 🌸
            </Button>
          </div>
        </div>
      )}

      {/* Wish 3 Active */}
      {sceneState.gamePhase === 'wish3-active' && (
        <div className="wish-screen">
          <div className="wish-instruction-bubble">Tap the park 3 times to make it bloom! ({sceneState.wish3Taps}/3)</div>
          <div className="wish-interactive-container">
            <div className={`park-scene ${sceneState.wish3Taps >= 1 ? 'park-tap1' : ''}`} onClick={handleWish3Tap}>
              <img src={wishGrassDry} alt="Dry" className="park-ground-image dry" style={{ opacity: sceneState.wish3Taps === 0 ? 1 : 0.3 }} />
              <img src={wishGrassGreen} alt="Green" className={`park-ground-image green ${sceneState.wish3Taps >= 3 ? 'complete-glow-pulse' : ''}`} style={{ opacity: sceneState.wish3Taps === 0 ? 0 : 1 }} />

              {sceneState.wish3Taps >= 1 && <div className="flowers-container">{['🌸', '🌺', '🌻'].map((fl, i) => <div key={i} className="flower pop-in" style={{ left: `${20 + i * 20}%` }}>{fl}</div>)}</div>}
              {sceneState.wish3Taps >= 2 && <div className="butterflies-container">{['🦋', '🦋'].map((bf, i) => <div key={i} className="butterfly flutter" style={{ left: `${30 + i * 30}%` }}>{bf}</div>)}</div>}
              {sceneState.wish3Taps >= 3 && <div className="playground pop-in"><div className="playground-item">🛝</div></div>}
            </div>
          </div>
        </div>
      )}

      {/* Wish 3 Complete */}
      {sceneState.gamePhase === 'wish3-complete' && (
        <div className="wish-complete-screen">
          <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" />
          <div className="success-message-large">You made the world green and playful! ✨</div>
          <div className="soft-thank-you">Thank you for helping the Earth 💛</div>
          <div className="wish-checkmark">🌱 3 of 3 wishes complete</div>
          <div className="celebration-elements">{Array.from({ length: 15 }).map((_, i) => <div key={i} className="floating-element" style={{ left: `${Math.random() * 100}%` }}>🌸</div>)}</div>
        </div>
      )}

      {/* All Wishes Complete */}
      {sceneState.gamePhase === 'all-wishes-complete' && (
        <div className="intro-overlay">
          <img src={babyGaneshaSit} alt="Baby Ganesha" className="intro-ganesha celebrate-scale" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">WOW! You made the world brighter! ✨</p>
            <p className="wish-intro-text">Now it's your turn 💛<br />What would you love to wish for?</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => {
                playUiTap();
                sceneActions.updateState({ gamePhase: 'dream-intro' });
              }}
              className="heartbeat-delayed"
            >
              Tell Me Your Dream! 💭
            </Button>
          </div>
        </div>
      )}

      {/* Dream Intro */}
      {sceneState.gamePhase === 'dream-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="wish-intro-card">
            <p className="wish-intro-text">Draw a happy wish on this magic canvas! ✨</p>
            <p className="wish-intro-text">What would you love to draw today? 🎨</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => {
                playUiTap();
                setShowDrawingPad(true);
                sceneActions.updateState({ gamePhase: 'dream-drawing', currentModal: 'drawing' }); // Set modal state
              }}
              className="heartbeat-delayed"
            >
              Start Drawing! ✏️
            </Button>
          </div>
        </div>
      )}

      {/* Drawing Pad */}
      {showDrawingPad && (
        <div className="drawing-overlay">
          <DrawingPad
            prompt="Draw your biggest dream! What do you want to be? 🌟"

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
          <div className="dream-container">
            <div className="dream-drawing-display">
              {sceneState.childDreamDrawing && <img src={sceneState.childDreamDrawing} alt="Dream" className="dream-image" style={{ filter: sceneState.trunkTaps === 3 ? 'none' : 'blur(6px)', opacity: 0.5 + (sceneState.trunkTaps * 0.15) }} />}
            </div>
            <div className="clouds-container">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`dream-cloud cloud-${i + 1} ${sceneState.trunkTaps > i ? 'cloud-fade' : ''}`}><img src={cloudImg} alt="Cloud" className="cloud-icon" /></div>
              ))}
            </div>
            <div className={`ganesha-helper ${sceneState.trunkTaps > 0 ? 'ganesha-blowing' : ''}`} onClick={handleTrunkTap}>
              <img src={babyGaneshaImg} alt="Ganesha" className="ganesha-trunk bounce-gentle" />
              {sceneState.trunkTaps > 0 && <div className="wind-puff">💨</div>}
            </div>
          </div>
          <div className="dream-instruction-box">
            {sceneState.trunkTaps === 0 ? "Tap my trunk 3 times to move the clouds! ☁️" : sceneState.trunkTaps < 3 ? `Tap again! (${sceneState.trunkTaps}/3)` : "Yay! Your dream is clear now! 🌟"}
          </div>
        </div>
      )}

      {/* Dream Revealed */}
      {sceneState.gamePhase === 'dream-revealed' && (
        <div className="dream-revealed-screen">
          <div className="dream-glow-container">
            {sceneState.childDreamDrawing && <img src={sceneState.childDreamDrawing} alt="Dream" className="dream-image-glowing" />}
            <div className="sparkles-container">{Array.from({ length: 20 }).map((_, i) => <div key={i} className="sparkle-float" style={{ left: `${Math.random() * 100}%` }}>✨</div>)}</div>
          </div>
          <img src={babyGaneshaSit} alt="Ganesha" className="ganesha-proud celebrate-scale" />
          <div className="success-message-large">Your dream will come true!<br />I believe in you! 🌟</div>
        </div>
      )}

      {/* Comparison Card */}
      {sceneState.gamePhase === 'comparison-card' && (
        <div className="friendship-overlay">
          <h1 className="friendship-title">Dreams Come Together! ✨</h1>
          <p className="friendship-subtitle">Friends Help Each Other</p>
          <div className="friendship-grid">
            <div className="friend-column">
              <img src={babyGaneshaSit} alt="Ganesha" className="column-header-image" />
              <div className="column-label">GANESHA'S WISHES</div>
              <div className="wishes-list">
                <div className="wish-item"><span className="wish-icon">😊</span> Happiness ✓</div>
                <div className="wish-item"><span className="wish-icon">🤝</span> Sharing ✓</div>
                <div className="wish-item"><span className="wish-icon">🌳</span> Earth ✓</div>
              </div>
            </div>
            <div className="friend-connector"><div className="connector-heart">❤️</div>FRIENDS<div className="connector-heart">❤️</div></div>
            <div className="friend-column">
              <div className="column-label">YOUR DREAM</div>
              <div className="dream-display-box">
                {sceneState.childDreamDrawing ? <img src={sceneState.childDreamDrawing} alt="Dream" className="dream-thumbnail" /> : "Loading..."}
              </div>
            </div>
          </div>
          <Button
            variant="info"
            size="large"
            onClick={() => {
              playChime();
              sceneActions.updateState({ gamePhase: 'ending', completed: true });
            }}
            className="heartbeat-gentle"
          >
            🎉 Finish Game
          </Button>
        </div>
      )}

      {/* Ending */}
      {sceneState.gamePhase === 'ending' && !sceneState.showingCompletionScreen && (
        <div className="ending-screen">
          <img src={babyGaneshaSit} alt="Ganesha" className="ganesha-final celebrate-scale" />
          <div className="final-title">Dreams Connected! 🌟</div>
        </div>
      )}

      {/* Resume Popup */}
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

      {/* Resume Countdown */}
      <ResumeCountdown value={countdownValue} />

      {/* Menu & Help */}
      {sceneState.gamePhase !== 'intro' && <MenuButton onClick={() => setShowSlideMenu(true)} zoneId="about-me-hut" />}

      <TocaBocaNav show={showSlideMenu} onClose={() => setShowSlideMenu(false)} zoneId="about-me-hut" onHome={() => onNavigate('home')} onHelp={() => { setShowSlideMenu(false); setShowHelpMenu(true); }} onStartFresh={() => { playUiTap(); setShowSlideMenu(false); sceneActions.updateState({ gamePhase: 'intro', wish1Taps: 0, wish2Taps: 0, wish3Taps: 0, bowlStates: [false, false, false], trunkTaps: 0, childDreamDrawing: null }); }} isAudioOn={isAudioOn} onAudioToggle={toggleAudio} />
      <HelpMenu show={showHelpMenu} onClose={() => setShowHelpMenu(false)} onNavigate={onNavigate} />

      {/* Completion Modal */}
      {sceneState.showingCompletionScreen && (
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
          nextSceneName="Symbol Mountain"
          childName="dream maker"
          isFinalScene={true}
          completionData={{
            completed: true,
            stars: sceneState.stars || 3
          }}
          onContinue={() => { playUiTap(); if (onNavigate) onNavigate('scene-complete-continue'); else if (onComplete) onComplete(); }}
          onReplay={() => { playUiTap(); sceneActions.updateState({ gamePhase: 'intro', wish1Taps: 0, wish2Taps: 0, wish3Taps: 0, bowlStates: [false, false, false], trunkTaps: 0, childDreamDrawing: null, showingCompletionScreen: false, completed: false }); }}
          onBackToMap={() => { if (onNavigate) onNavigate('zone-welcome'); else if (onBack) onBack(); }}
          onHome={() => { if (onNavigate) onNavigate('home'); }}
        />
      )}
    </div>
  );
};

export default DreamsWishesGame;
