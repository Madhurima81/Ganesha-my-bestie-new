import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Namebirthdaygame.css';
import SceneCompletionCelebration from "../../../lib/components/celebration/SceneCompletionCelebration";

// Import SceneManager & Navigation
import SceneManager from "../../../lib/components/scenes/SceneManager";
import BackToMapButton from '../../../lib/components/navigation/BackToMapButton';

// Import Unified Design System
import Button from '../../../lib/components/ui/Button/Button';
import Modal from '../../../lib/components/ui/Modal/Modal';
import '../../../lib/styles/zone-themes.css';
import '../../../lib/styles/animations.css';

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
import useResumeCountdown from '../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../lib/components/feedback/ResumeCountdown';
import usePauseAwareTimeout from '../../../lib/hooks/usePauseAwareTimeout';
import { useGameSounds } from '../../../lib/hooks/useGameSounds';

// Import images
import nameBg from './assets/images/name-bg.png';
import babyGaneshaImg from '/images/ganesha-final-new.svg';
import babyGaneshaSit from '/images/ganesha-final-new.svg';

// Festival icons
import holiIcon from './assets/images/holi.png';
import diwaliIcon from './assets/images/diwali.png';
import janmashtamiIcon from './assets/images/janmashtami.png';
import ganeshChaturthiIcon from './assets/images/chaturthi.png';

// ... existing imports ...

// Month Images
import janImg from './assets/images/months/january.png';
import febImg from './assets/images/months/february.png';
import marImg from './assets/images/months/march.png';
import aprImg from './assets/images/months/april.png';
import mayImg from './assets/images/months/may.png';
import junImg from './assets/images/months/june.png';
import julImg from './assets/images/months/july.png';
import augImg from './assets/images/months/august.png';
import sepImg from './assets/images/months/september.png';
import octImg from './assets/images/months/october.png';
import novImg from './assets/images/months/november.png';
import decImg from './assets/images/months/december.png';

// Completion icons (reuse opening modal icons)
import balloonsIcon from '../../festival-square/Game4-mandapdecor/assets/images/fun_balloons_cluster.png';
import birthdayIcon from '../../festival-square/Game1-piano/assets/images/name-birthday-icon.png';

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
const NameBirthdayGame = ({ onComplete, onBack, onNavigate, zoneId = 'about-me-hut', sceneId = 'name-birthday' }) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          gamePhase: 'intro',
          poppedLetters: [],
          currentLetterIndex: 0,
          selectedFestival: null,
          wrongFestivals: [],
          flippedCards: [],
          childName: '',
          childNameLetters: [],
          childBirthdayMonth: '',
          childBirthdayMonthName: '',
          childBirthdayDate: '',
          stars: 2,
          completed: false,
          showingCompletionScreen: false
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <NameBirthdayGameContent
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
const NameBirthdayGameContent = ({ sceneState, sceneActions, isReload, onComplete, onNavigate, onBack }) => {
  const RESUME_DELAY_MS = 3000;

  const VOICE_LINES = {
    // Opening Modal
    opening: "Hello, little friend! Let's learn something special about each other.",

    // Name Balloons
    nameBalloons: "Can you find the letters of my name? Pop the balloons… in the right order!",
    nameComplete: "You did it! My name is Ganesha! Thank you for helping me spell it!",

    // Child Name
    childNameIntro: "Now I know my name… but what is your name?",
    childNameInput: "Tap the letters… and spell your name!",
    childNameComplete: "{childName}… what a beautiful name! I'm happy to meet you.",

    // Birthday Intro
    birthdayIntro: "Now let's discover something else about me. Can you find which festival is my birthday?",
    birthdayChoice: "Look carefully… Which festival is my birthday?",
    birthdayCorrect: "Yes! Ganesh Chaturthi is my birthday! That is when everyone celebrates me.",

    // Child Birthday
    childBirthdayIntro: "Now I know your name, {childName}. When is your birthday?",
    childBirthdayMonth: "Tap the month you were born.",
    childBirthdayDate: "And which day… in {monthName}?",
    childBirthdayComplete: "{monthName} {date}! That's a wonderful birthday! I will remember it.",

    // Besties Card
    bestiesCard: "Now we know something special about each other. Your birthday… and my birthday. We are friends!",

    // Completion
    complete: "You learned something beautiful today. Thank you for being my friend!"
  };

  if (!sceneState) return <div>Loading...</div>;

  // Get content from configs
  const openingModalContent = getOpeningModal('about-me-hut', 'name-birthday');
  const completionModalContent = getCompletionModal('about-me-hut', 'name-birthday');
  const completionIcons = openingModalContent?.icons || ['balloons', 'birthday'];

  const { isAudioOn, toggleAudio } = useAudioPreference();

  // ── Callbacks for pause/resume ────────────────────────────────────────────────
  const onReturnHint = () => {
    // Optional: trigger visual hint on return
  };

  // ── T08/T09: visibility + idle timer infrastructure ──────────────────────────
  const { startIdleTimer, stopIdleTimer, setCurrentPhase, stopVoice, setVoiceVolume, startMusic, stopMusic } = useVoiceGuidance(
    'about-me-hut', 'name-birthday', {
      enableMusic: true,
      musicVolume: 0.06,
      idleTimeout: 20,
      resumeDelay: RESUME_DELAY_MS,  // ← Wait before replaying VO
      onReturnHint                     // ← Called when child returns
    }
  );
  const { playUiTap, playWrongTap, playSparkle, playChime, setGlobalVolume } = useGameSounds();
  const { speak, stop: stopSpokenVoice } = useGaneshaVoice();
  useEffect(() => { startIdleTimer(); return () => stopIdleTimer(); }, [startIdleTimer, stopIdleTimer]);
  useEffect(() => { setCurrentPhase(sceneState?.gamePhase ?? null); }, [sceneState?.gamePhase, setCurrentPhase]);
  useEffect(() => {
    if (isAudioOn && sceneState.gamePhase !== 'intro' && !sceneState.showingCompletionScreen) startMusic();
    else stopMusic();
  }, [isAudioOn, sceneState.gamePhase, sceneState.showingCompletionScreen, startMusic, stopMusic]);
  useEffect(() => { setGlobalVolume(isAudioOn ? 1 : 0); }, [isAudioOn, setGlobalVolume]);
  useEffect(() => () => stopMusic(), [stopMusic]);

  // --- LOCAL UI STATE ---
  const [showShake, setShowShake] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeWrongBalloon, setShakeWrongBalloon] = useState(null);
  const [instructionMessage, setInstructionMessage] = useState('Pop the balloons in order! 🎈');
  const [showHintModal, setShowHintModal] = useState(false);
  const [availableLetters] = useState('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));

  // Reload Logic Refs
  const reloadHandledRef = useRef(false);
  const resumePopupTimeoutRef = useRef(null);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');
  const [openingButtonVisible] = useState(true);
  const phaseVoiceRef = useRef({});
  const [showReturnHint, setShowReturnHint] = useState(false);
  const returnHintTimerRef = useRef(null);
  const miniGestureTimerRef = useRef(null);
  const [miniGesture, setMiniGesture] = useState({
    show: false,
    durationMs: 1200,
    key: 0,
    icon: '/images/hand-thumbsup.svg'
  });
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);
  const triggerMiniGesture = useCallback((durationMs = 1200, icon = '/images/hand-thumbsup.svg') => {
    if (miniGestureTimerRef.current) {
      clearTimeout(miniGestureTimerRef.current);
      miniGestureTimerRef.current = null;
    }
    setMiniGesture((prev) => ({
      show: true,
      durationMs,
      key: prev.key + 1,
      icon
    }));
    miniGestureTimerRef.current = setTimeout(() => {
      setMiniGesture((prev) => ({ ...prev, show: false }));
      miniGestureTimerRef.current = null;
    }, durationMs);
  }, []);
  const speakLine = (text, options = {}) => {
    if (!isAudioOn || !text) {
      options.onEnd?.();
      return;
    }
    const { onEnd, moment = 'encouragement' } = options;
    speak(text, { age: 7, style: 'child', moment, onEnd });
  };

  // --- DATA ---
  const nameLetters = [
    { id: 'G', letter: 'G', color: '#FF6B6B', left: '15%', top: '45%' },
    { id: 'A1', letter: 'A', color: '#4ECDC4', left: '75%', top: '30%' },
    { id: 'N', letter: 'N', color: '#FFE66D', left: '45%', top: '60%' },
    { id: 'E', letter: 'E', color: '#95E1D3', left: '70%', top: '65%' },
    { id: 'S', letter: 'S', color: '#F38181', left: '30%', top: '25%' },
    { id: 'H', letter: 'H', color: '#AA96DA', left: '55%', top: '35%' },
    { id: 'A2', letter: 'A', color: '#FCBAD3', left: '20%', top: '70%' }
  ];

  const festivals = [
    {
      id: 'holi',
      name: 'Holi', // Revealed in Info Panel
      clue: 'Splash of Colors! 🎨', // Shown on Card
      image: holiIcon,
      correct: false,
      month: 'March',
      fact: 'We play with water and bright colors!'
    },
    {
      id: 'diwali',
      name: 'Diwali',
      clue: 'Lights & Lamps! 🪔',
      image: diwaliIcon,
      correct: false,
      month: 'Oct-Nov',
      fact: 'We light clay lamps (Diyas) and smile bright.'
    },
    {
      id: 'janmashtami',
      name: 'Janmashtami',
      clue: 'Milk & Butter! 🥛',
      image: janmashtamiIcon,
      correct: false,
      month: 'August',
      fact: 'Baby Krishna is born. He loves butter!'
    },
    {
      id: 'ganesh-chaturthi',
      name: 'Ganesh Chaturthi',
      clue: 'My Favorite Treat! 🥟',
      image: ganeshChaturthiIcon,
      correct: true,
      month: 'Aug-Sept',
      fact: 'We make Ganesha with clay and eat Modaks!'
    }
  ];

  const monthFestivals = [
    { month: 1, name: 'January', festival: 'Makar Sankranti', image: janImg, color: '#87CEEB' },
    { month: 2, name: 'February', festival: 'Maha Shivaratri', image: febImg, color: '#9370DB' },
    { month: 3, name: 'March', festival: 'Holi', image: marImg, color: '#FF69B4' },
    { month: 4, name: 'April', festival: 'Ugadi', image: aprImg, color: '#FFB6C1' },
    { month: 5, name: 'May', festival: 'Akshaya Tritiya', image: mayImg, color: '#FFD700' },
    { month: 6, name: 'June', festival: 'Rath Yatra', image: junImg, color: '#FFA07A' },
    { month: 7, name: 'July', festival: 'Guru Purnima', image: julImg, color: '#DDA0DD' },
    { month: 8, name: 'August', festival: 'Raksha Bandhan', image: augImg, color: '#F0E68C' },
    { month: 9, name: 'September', festival: 'Ganesh Chaturthi', image: sepImg, color: '#FFA500' },
    { month: 10, name: 'October', festival: 'Navratri', image: octImg, color: '#FF6347' },
    { month: 11, name: 'November', festival: 'Diwali', image: novImg, color: '#FFD700' },
    { month: 12, name: 'December', festival: 'Karthigai Deepam', image: decImg, color: '#F4A460' }
  ];

  const encouragingPhrases = ["Let's try the next one 🌼", "Look closely 👀", "You've got this 💛"];
  const LETTER_VO_MAP = {
    A: 'Ay',
    G: 'Gee',
    N: 'Enn',
    E: 'Ee',
    S: 'Ess',
    H: 'Aitch'
  };

  // --- RELOAD DETECTION & RESTORATION ---
  useEffect(() => {
    if (isReload && !reloadHandledRef.current) {
      reloadHandledRef.current = true;
      const {
        gamePhase,
        poppedLetters,
        childNameLetters,
        childName,
        wrongFestivals,
        childBirthdayMonth,
        childBirthdayMonthName,
        childBirthdayDate
      } = sceneState;

      console.log("🔄 Reload detected. Phase:", gamePhase);
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);

      // 0. INTRO - no reload needed
      if (gamePhase === 'intro') return;

      // 1. CHECK COMPLETION EDGE CASES - Force correct phase if completed but phase not updated
      if (poppedLetters.length === 7 && gamePhase === 'name-balloons') {
        console.log("🔧 Reload fix: Forcing name-complete");
        sceneActions.updateState({ gamePhase: 'name-complete' });
        return;
      }

      if (childName && gamePhase === 'child-name-input') {
        console.log("🔧 Reload fix: Forcing child-name-complete");
        sceneActions.updateState({ gamePhase: 'child-name-complete' });
        return;
      }

      if (childBirthdayDate && childBirthdayMonth && gamePhase === 'child-birthday-date') {
        console.log("🔧 Reload fix: Forcing child-birthday-complete");
        sceneActions.updateState({ gamePhase: 'child-birthday-complete' });
        return;
      }

      // 2. AUTO-TRANSITION PHASES - Let them continue
      // Replace the name-complete handler with:
      if (gamePhase === 'name-complete') {
        console.log("🔧 Reload during name-complete, jumping to child-name-intro");
        // Don't show popup, just move directly to next phase
        sceneActions.updateState({ gamePhase: 'child-name-intro' });
        return;
      }

      if (gamePhase === 'child-name-complete') {
        console.log("🔧 Reload during child-name-complete, jumping to birthday-intro");
        sceneActions.updateState({ gamePhase: 'birthday-intro' });
        return;
      }

      if (gamePhase === 'birthday-correct') {
        console.log("🔧 Reload during birthday-correct, jumping to child-birthday-intro");
        sceneActions.updateState({ gamePhase: 'child-birthday-intro' });
        return;
      }

      if (gamePhase === 'child-birthday-complete') {
        setResumeMessage("Welcome back! We saved your birthday! 🎂");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        return;
      }

      // 3. FINAL PHASE
      if (gamePhase === 'besties-card') {
        setResumeMessage("Welcome back! Here's your bestie card! 💖");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 3000);
        return;
      }

      // 4. INTRO PHASES - just return, no message needed
      if (gamePhase === 'child-name-intro' ||
        gamePhase === 'birthday-intro' ||
        gamePhase === 'child-birthday-intro' ||
        gamePhase === 'child-birthday-month') {
        return;
      }

      // 5. PARTIAL PROGRESS PHASES
      if (gamePhase === 'name-balloons' && poppedLetters.length > 0) {
        setResumeMessage(`Great! You've popped ${poppedLetters.length}/7 balloons!`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }

      if (gamePhase === 'child-name-input' && childNameLetters.length > 0) {
        setResumeMessage(`Continue typing your name! (${childNameLetters.length} letters typed)`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }

      if (gamePhase === 'birthday-choice' && wrongFestivals.length > 0) {
        setResumeMessage(`Keep trying! You've eliminated ${wrongFestivals.length} options!`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }

      if (gamePhase === 'child-birthday-date' && childBirthdayMonth) {
        setResumeMessage(`You picked ${childBirthdayMonthName}! Now pick the date. 📅`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }

      if (childBirthdayDate && childBirthdayMonth &&
        (gamePhase === 'child-birthday-date' || gamePhase === 'child-birthday-complete')) {
        console.log("🔧 Reload fix: Birthday complete, moving to besties-card");
        sceneActions.updateState({ gamePhase: 'besties-card' });
        return;
      }
    }
  }, [isReload, sceneState.gamePhase]);

  // --- AUTO-TRANSITION HANDLER ---
  useEffect(() => {
    let timer;

    console.log("🔄 Auto-transition check. Current phase:", sceneState.gamePhase);

    if (sceneState.gamePhase === 'name-complete') {
      console.log("⏰ Setting timer for name-complete → child-name-intro");
      timer = setTimeout(() => {
        console.log("✅ Transitioning to child-name-intro");
        sceneActions.updateState({ gamePhase: 'child-name-intro' });
      }, 3000);
    }
    else if (sceneState.gamePhase === 'child-name-complete') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'birthday-intro' }); }, 3000);
    }
    else if (sceneState.gamePhase === 'birthday-correct') {
      timer = setTimeout(() => {
        sceneActions.updateState({ gamePhase: 'child-birthday-intro' });
      }, 2500);
    }
    else if (sceneState.gamePhase === 'child-birthday-complete') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'besties-card' }); }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [sceneState.gamePhase, sceneActions]);

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
    // Name Balloons
    if (sceneState.gamePhase === 'name-balloons' && !phaseVoiceRef.current.nameBalloons) {
      phaseVoiceRef.current.nameBalloons = true;
      speakLine(VOICE_LINES.nameBalloons);
    }

    // Name Complete
    if (sceneState.gamePhase === 'name-complete' && !phaseVoiceRef.current.nameComplete) {
      phaseVoiceRef.current.nameComplete = true;
      speakLine(VOICE_LINES.nameComplete, { moment: 'celebration' });
    }

    // Child Name Intro
    if (sceneState.gamePhase === 'child-name-intro' && !phaseVoiceRef.current.childNameIntro) {
      phaseVoiceRef.current.childNameIntro = true;
      speakLine(VOICE_LINES.childNameIntro);
    }

    // Child Name Input
    if (sceneState.gamePhase === 'child-name-input' && !phaseVoiceRef.current.childNameInput) {
      phaseVoiceRef.current.childNameInput = true;
      speakLine(VOICE_LINES.childNameInput);
    }

    // Child Name Complete
    if (sceneState.gamePhase === 'child-name-complete' && !phaseVoiceRef.current.childNameComplete) {
      phaseVoiceRef.current.childNameComplete = true;
      const nameCompleteLine = VOICE_LINES.childNameComplete.replace('{childName}', sceneState.childName || 'little friend');
      speakLine(nameCompleteLine, { moment: 'celebration' });
    }

    // Birthday Intro
    if (sceneState.gamePhase === 'birthday-intro' && !phaseVoiceRef.current.birthdayIntro) {
      phaseVoiceRef.current.birthdayIntro = true;
      speakLine(VOICE_LINES.birthdayIntro);
    }

    // Birthday Choice
    if (sceneState.gamePhase === 'birthday-choice' && !phaseVoiceRef.current.birthdayChoice) {
      phaseVoiceRef.current.birthdayChoice = true;
      speakLine(VOICE_LINES.birthdayChoice);
    }

    // Birthday Correct
    if (sceneState.gamePhase === 'birthday-correct' && !phaseVoiceRef.current.birthdayCorrect) {
      phaseVoiceRef.current.birthdayCorrect = true;
      speakLine(VOICE_LINES.birthdayCorrect, { moment: 'celebration' });
    }

    // Child Birthday Intro
    if (sceneState.gamePhase === 'child-birthday-intro' && !phaseVoiceRef.current.childBirthdayIntro) {
      phaseVoiceRef.current.childBirthdayIntro = true;
      const birthdayIntroLine = VOICE_LINES.childBirthdayIntro.replace('{childName}', sceneState.childName || 'little friend');
      speakLine(birthdayIntroLine);
    }

    // Child Birthday Month
    if (sceneState.gamePhase === 'child-birthday-month' && !phaseVoiceRef.current.childBirthdayMonth) {
      phaseVoiceRef.current.childBirthdayMonth = true;
      speakLine(VOICE_LINES.childBirthdayMonth);
    }

    // Child Birthday Date
    if (sceneState.gamePhase === 'child-birthday-date' && !phaseVoiceRef.current.childBirthdayDate) {
      phaseVoiceRef.current.childBirthdayDate = true;
      const dateLines = VOICE_LINES.childBirthdayDate.replace('{monthName}', sceneState.childBirthdayMonthName || 'month');
      speakLine(dateLines);
    }

    // Child Birthday Complete
    if (sceneState.gamePhase === 'child-birthday-complete' && !phaseVoiceRef.current.childBirthdayComplete) {
      phaseVoiceRef.current.childBirthdayComplete = true;
      let completeLine = VOICE_LINES.childBirthdayComplete
        .replace('{monthName}', sceneState.childBirthdayMonthName || 'month')
        .replace('{date}', sceneState.childBirthdayDate || 'date');
      speakLine(completeLine, { moment: 'celebration' });
    }

    // Besties Card
    if (sceneState.gamePhase === 'besties-card' && !phaseVoiceRef.current.bestiesCard) {
      phaseVoiceRef.current.bestiesCard = true;
      speakLine(VOICE_LINES.bestiesCard, { moment: 'closing' });
    }
  }, [sceneState.gamePhase, sceneState.childName, sceneState.childBirthdayMonthName, sceneState.childBirthdayDate, isAudioOn]);

  useEffect(() => {
    if (sceneState.showingCompletionScreen && !phaseVoiceRef.current.completeVo) {
      phaseVoiceRef.current.completeVo = true;
      speakLine(VOICE_LINES.complete, { moment: 'closing' });
    }
  }, [sceneState.showingCompletionScreen, isAudioOn]);

  useEffect(() => () => stopSpokenVoice(), [stopSpokenVoice]);
  useEffect(() => {
    return () => {
      if (returnHintTimerRef.current) clearTimeout(returnHintTimerRef.current);
      if (miniGestureTimerRef.current) clearTimeout(miniGestureTimerRef.current);
    };
  }, []);

  usePauseAwareTimeout({
    onHide: () => {
      stopVoice();
      stopSpokenVoice();
      setShowReturnHint(false);
      if (returnHintTimerRef.current) {
        clearTimeout(returnHintTimerRef.current);
        returnHintTimerRef.current = null;
      }
      // Clear phase VO ref to allow replay after resume countdown
      phaseVoiceRef.current = {};
    },
    onShow: () => {
      triggerMiniGesture(1200);
      setShowReturnHint(true);
      if (returnHintTimerRef.current) clearTimeout(returnHintTimerRef.current);
      returnHintTimerRef.current = setTimeout(() => {
        setShowReturnHint(false);
        returnHintTimerRef.current = null;
      }, 2200);
      onReturnHint();
    },
    resumeDelay: RESUME_DELAY_MS
  });

  // --- HANDLERS ---

  const handleStartGame = () => {
    stopVoice();
    stopSpokenVoice();
    setVoiceVolume(isAudioOn ? 1 : 0);
    sceneActions.updateState({ gamePhase: 'name-balloons' });
  };

  const handlePopBalloon = (letterId, letterIndex) => {
    if (sceneState.poppedLetters.includes(letterId)) return;

    const currentNeededLetter = nameLetters[sceneState.currentLetterIndex].letter;
    const clickedLetter = nameLetters[letterIndex].letter;

    if (clickedLetter !== currentNeededLetter) {
      playWrongTap();
      setShakeWrongBalloon(letterId);
      setTimeout(() => setShakeWrongBalloon(null), 500);
      return;
    }

    playUiTap();
    playSparkle();
    const newPopped = [...sceneState.poppedLetters, letterId];
    sceneActions.updateState({
      poppedLetters: newPopped,
      currentLetterIndex: sceneState.currentLetterIndex + 1
    });
    if (isAudioOn) {
      const voicedLetter = LETTER_VO_MAP[clickedLetter] || clickedLetter;
      speak(voicedLetter, { age: 7, style: 'child', moment: 'encouragement' });
    }
    triggerMiniGesture(900);

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 500);

    if (newPopped.length === nameLetters.length) {
      playChime();
      setInstructionMessage('Amazing! All balloons popped! 🎉');
      setTimeout(() => {
        sceneActions.updateState({ gamePhase: 'name-complete' });
      }, 800);
    } else {
      setInstructionMessage(encouragingPhrases[Math.floor(Math.random() * encouragingPhrases.length)]);
    }
  };

  const handleStartBirthdayChoice = () => {
    playUiTap();
    sceneActions.updateState({ wrongFestivals: [], gamePhase: 'birthday-choice' });
    setShowShake(null);
  };

  // --- UPDATED HANDLER: SHAKE -> FADE -> INFO SEQUENCE ---
  const handleFestivalClick = (festivalId) => {
    // If THIS card is already open, do nothing
    if (sceneState.flippedCards.includes(festivalId)) return;

    // If another card is open, close it first (optional, prevents multi-open)
    if (sceneState.flippedCards.length > 0) return;

    // CHECK: Is this card ALREADY marked as wrong?
    // If yes, we skip the shake/delay and just let them read the info again.
    if (sceneState.wrongFestivals.includes(festivalId)) {
      sceneActions.updateState({ flippedCards: [festivalId] });
      setInstructionMessage("Read again! 🤓");
      return;
    }

    const festival = festivals.find(f => f.id === festivalId);

    if (festival.correct) {
      // Correct!
      playSparkle();
      playChime();
      triggerMiniGesture(1100);
      sceneActions.updateState({
        selectedFestival: festivalId,
        gamePhase: 'birthday-correct'
      });
    } else {
      // 1. TRIGGER SHAKE ONLY (No Active/Flipped state yet)
      playWrongTap();
      setShowShake(festivalId);
      setInstructionMessage("Oops! Not that one... 🙊");

      // 2. DELAY: Wait for shake to finish
      setTimeout(() => {
        sceneActions.updateState({
          flippedCards: [festivalId], // Now we flip it
          wrongFestivals: [...sceneState.wrongFestivals, festivalId] // And mark it wrong/grey
        });
        setShowShake(null);
        setInstructionMessage("But look what you found! 🤓");
      }, 600);
    }
  };

  // --- UPDATED CLOSE HANDLER ---
  const handleCloseInfo = (e) => {
    if (e) e.stopPropagation();
    sceneActions.updateState({ flippedCards: [] });
    // Reset Header to the "Choice" prompt
    setInstructionMessage("Tap the cards to choose ✨");
  };

  const handleCardFlip = (festivalId) => {
    let newFlipped = [...sceneState.flippedCards];
    if (newFlipped.includes(festivalId)) {
      newFlipped = newFlipped.filter(id => id !== festivalId);
    } else {
      newFlipped.push(festivalId);
    }
    sceneActions.updateState({ flippedCards: newFlipped });
  };

  const handleChildNameLetterClick = (letter) => {
    playUiTap();
    sceneActions.updateState({ childNameLetters: [...sceneState.childNameLetters, letter] });
  };

  const handleChildNameBackspace = () => {
    playUiTap();
    sceneActions.updateState({ childNameLetters: sceneState.childNameLetters.slice(0, -1) });
  };

  const handleChildNameConfirm = () => {
    const name = sceneState.childNameLetters.join('');
    if (name.length < 2) return;

    playChime();
    sceneActions.updateState({
      childName: name,
      gamePhase: 'child-name-complete'
    });
    triggerMiniGesture(1000);
    localStorage.setItem('childName', name);
  };

  const handleMonthSelect = (monthData) => {
    playUiTap();
    sceneActions.updateState({
      childBirthdayMonth: monthData.month,
      childBirthdayMonthName: monthData.name,
      gamePhase: 'child-birthday-date'
    });
  };

  const handleDateSelect = (date) => {
    playChime();
    sceneActions.updateState({
      childBirthdayDate: date,
      gamePhase: 'child-birthday-complete',
      completed: true // Mark completed here so it saves
    });
    triggerMiniGesture(1200);
    localStorage.setItem('childBirthday', `${sceneState.childBirthdayMonth}-${date}`);
  };

  const getDaysInMonth = (month) => {
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysInMonth[month - 1] || 31;
  };

  const getGaneshaResponse = () => {
    const month = sceneState.childBirthdayMonth;
    if (month === 9) return "September! That's MY birthday month too! We're birthday twins! 🐘❤️";
    else if (month === 8) return "August! That's so close to my birthday in September! Almost birthday twins! 🎈";
    else {
      const monthData = monthFestivals.find(m => m.month === month);
      return `${monthData?.name}! That's during ${monthData?.festival}! What a special birthday! ${monthData?.emoji}`;
    }
  };

  // --- RENDER ---
  return (
    <div className="name-birthday-game" data-zone="about-me-hut">
      <div className="game-background" style={{ backgroundImage: `url(${nameBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
      <HomeButton onNavigate={onNavigate} />
      <ZoneBadgeButton zoneId="about-me-hut" onBack={() => onNavigate?.('zone-welcome')} />
      <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />
      <ResumeCountdown value={countdownValue} />
      {showReturnHint && (
        <div style={{
          position: 'fixed',
          top: '18px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1200,
          background: 'rgba(46, 28, 13, 0.88)',
          color: '#FFF9E8',
          padding: '10px 16px',
          borderRadius: '999px',
          fontWeight: 700,
          fontSize: '14px',
          letterSpacing: '0.2px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.22)'
        }}>
          Welcome back, let's continue
        </div>
      )}
      {miniGesture.show && (
        <div
          key={`name-mini-gesture-${miniGesture.key}`}
          style={{
            position: 'fixed',
            left: '50%',
            top: '42%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1300,
            pointerEvents: 'none',
            animation: `nameGesturePop ${miniGesture.durationMs}ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards`
          }}
        >
          <img src={miniGesture.icon} alt="" style={{ width: '62px', height: '62px' }} />
        </div>
      )}
      <style>{`
        @keyframes nameGesturePop {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6) rotate(-8deg); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.08) rotate(0deg); }
          100% { opacity: 0; transform: translate(-50%, -58%) scale(1); }
        }
      `}</style>

      {/* Intro */}
      {sceneState.gamePhase === 'intro' && (
        <OpeningModal
          zoneId="about-me-hut"
          sceneId="name-birthday"
          onStart={handleStartGame}
          characterImg={babyGaneshaImg}
          showButton={openingButtonVisible}
        />
      )}

      {/* Back Button */}
      {sceneState.gamePhase !== 'intro' && !sceneState.showingCompletionScreen && (
        <BackToMapButton onNavigate={onNavigate} />
      )}

      {/* Name Balloons Phase */}
      {sceneState.gamePhase === 'name-balloons' && (
        <div className="name-phase">
          <div className="ganesha-center"><img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-waiting bounce-gentle" /></div>
          <div className="instruction-bubble">{instructionMessage}</div>

          <div className="letter-tracker">
            {nameLetters.map((item, index) => {
              const isFilled = index < sceneState.currentLetterIndex;
              return <div key={item.id} className={`letter-box ${isFilled ? 'filled' : 'empty'}`}>{isFilled ? nameLetters[index].letter : ''}</div>;
            })}
            <div className="tracker-progress">{sceneState.currentLetterIndex} of {nameLetters.length}</div>
          </div>

          <Button
            variant="secondary"
            size="small"
            onClick={() => setShowHintModal(true)}
            className="pulse-infinite"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 100
            }}
          >
            💡 Hint
          </Button>

          <div className="balloons-container">
            {nameLetters.map((item, index) => !sceneState.poppedLetters.includes(item.id) && (
              <button
                key={item.id}
                className={`balloon-btn float-balloon ${shakeWrongBalloon === item.id ? 'shake-wrong' : ''}`}
                onClick={() => handlePopBalloon(item.id, index)}
                style={{ left: item.left, top: item.top, '--balloon-color': item.color, animationDelay: `${index * 0.2}s` }}
              >
                <div className="balloon-body"><div className="balloon-letter">{item.letter}</div></div>
                <div className="balloon-string"></div>
              </button>
            ))}
          </div>
          {showConfetti && <div className="mini-confetti">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="confetti-piece" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 50 + 25}%` }}>✨</div>)}</div>}
        </div>
      )}

      {/* Hint Modal */}
      <Modal
        isOpen={showHintModal}
        onClose={() => setShowHintModal(false)}
        title="Hint"
        confirmText="Got It!"
        size="medium"
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src={babyGaneshaImg}
            alt="Ganesha"
            className="bounce"
            style={{ width: '120px', margin: '0 auto 20px', display: 'block' }}
          />
          <p style={{ fontSize: '20px', fontWeight: '600', marginBottom: '15px', color: 'var(--zone-current-accent)' }}>
            My name is:
          </p>
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '15px'
          }}>
            {nameLetters.map((item, index) => (
              <span
                key={item.id}
                className="scale-in"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: 'var(--play-action-green)',
                  padding: '10px',
                  background: 'var(--zone-current-soft)',
                  borderRadius: '10px',
                  minWidth: '50px',
                  display: 'inline-block'
                }}
              >
                {item.letter}
              </span>
            ))}
          </div>
          <p style={{ fontSize: '16px', color: 'var(--play-text-main)' }}>
            Pop the balloons in this order!
          </p>
        </div>
      </Modal>

      {/* Name Complete */}
      {sceneState.gamePhase === 'name-complete' && (
        <div className="name-complete-screen">
          <div className="ganesha-happy"><img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-clapping celebrate-scale" /></div>
          <div className="name-reveal"><div className="name-text glow-text">GANESHA</div></div>
          <div className="celebration-confetti">{Array.from({ length: 20 }).map((_, i) => <div key={i} className="confetti-piece"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>🎉</div>)}</div>
        </div>
      )}

      {/* Child Name Intro */}
      {sceneState.gamePhase === 'child-name-intro' && (
        <div className="child-intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="child-intro-ganesha bounce" />
          <div className="child-intro-card">
            <h2 className="child-intro-title">Hi! I am Ganesha.</h2>
            <Button
              variant="primary"
              size="large"
              onClick={() => sceneActions.updateState({ gamePhase: 'child-name-input' })}
              className="heartbeat-delayed"
            >
              What is your name? 👋
            </Button>
          </div>
        </div>
      )}

      {/* Child Name Input */}
      {sceneState.gamePhase === 'child-name-input' && (
        <div className="child-name-input-screen">
          <div className="child-instruction-bubble">Tap the letters to spell your name! 🎈</div>
          <div className="child-name-display">
            {sceneState.childNameLetters.length === 0 ? <div className="name-placeholder">Your Name Here</div> : sceneState.childNameLetters.map((letter, index) => <div key={index} className="child-name-letter pop-in">{letter}</div>)}
          </div>
          <div className="child-name-controls">
            <Button
              variant="secondary"
              size="medium"
              onClick={handleChildNameBackspace}
              disabled={sceneState.childNameLetters.length === 0}
            >
              ⌫ Delete
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={handleChildNameConfirm}
              disabled={sceneState.childNameLetters.length < 2}
            >
              That's My Name! ✓
            </Button>
          </div>
          <div className="child-letter-keyboard">
            {availableLetters.map((letter, index) => <button key={index} className="child-letter-tile bounce-gentle" onClick={() => handleChildNameLetterClick(letter)} style={{ animationDelay: `${index * 0.02}s` }}>{letter}</button>)}
          </div>
        </div>
      )}

      {/* Child Name Complete */}
      {sceneState.gamePhase === 'child-name-complete' && (
        <div className="child-name-celebration-screen">
          <div className="celebration-ganesha"><img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" /></div>
          <div className="child-name-reveal">
            <div className="child-name-text glow-text">{sceneState.childName}!</div>
            <p className="ganesha-compliment">What a beautiful name! 🌟</p>
          </div>
          <div className="celebration-confetti">{Array.from({ length: 20 }).map((_, i) => <div key={i} className="confetti-piece" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>🎉</div>)}</div>
        </div>
      )}

      {/* Child Birthday Intro */}
      {sceneState.gamePhase === 'child-birthday-intro' && (
        <div className="child-bday-intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="child-bday-intro-ganesha bounce" />
          <div className="child-bday-intro-card">
            <h2 className="child-bday-intro-title">Now I know YOUR name, {sceneState.childName}! 🎈</h2>
            <p className="child-bday-intro-text">But when is YOUR birthday? 🎂</p>
            <Button
              variant="primary"
              size="large"
              onClick={() => sceneActions.updateState({ gamePhase: 'child-birthday-month' })}
              className="heartbeat-delayed"
            >
              Tell You My Birthday! 🎉
            </Button>
          </div>
        </div>
      )}

      {/* Birthday Month */}
      {sceneState.gamePhase === 'child-birthday-month' && (
        <div className="child-birthday-month-screen">

          <div className="child-instruction-bubble">Tap the month you were born! 🗓️</div>

          <div className="month-festivals-grid">
            {monthFestivals.map((monthData, index) => (
              <button
                key={monthData.month}
                className="month-festival-card bounce-gentle"
                onClick={() => handleMonthSelect(monthData)}
                style={{ animationDelay: `${index * 0.05}s`, borderColor: monthData.color }}
              >
                {/* REPLACED EMOJI WITH IMAGE */}
                <img src={monthData.image} alt={monthData.name} className="month-card-image" />
                <div className="month-festival-name">{monthData.name}</div>
                <div className="month-festival-subtitle">{monthData.festival}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Birthday Date */}
      {sceneState.gamePhase === 'child-birthday-date' && (
        <div className="child-birthday-date-screen">
          <div className="child-instruction-bubble">Which day in {sceneState.childBirthdayMonthName}? 📅</div>
          <div className="date-picker-grid">
            {Array.from({ length: getDaysInMonth(sceneState.childBirthdayMonth) }, (_, i) => i + 1).map((date) => (
              <button key={date} className="date-picker-button bounce-gentle" onClick={() => handleDateSelect(date)} style={{ animationDelay: `${date * 0.02}s` }}>{date}</button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={() => sceneActions.updateState({ gamePhase: 'child-birthday-month' })}
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            ← Change Month
          </Button>
        </div>
      )}

      {/* Birthday Complete */}
      {sceneState.gamePhase === 'child-birthday-complete' && (
        <div className="child-birthday-celebration-screen">
          <div className="celebration-ganesha"><img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate celebrate-scale" /></div>
          <div className="child-birthday-reveal">
            <div className="child-birthday-text glow-text">{sceneState.childBirthdayMonthName} {sceneState.childBirthdayDate}!</div>
            <p className="ganesha-birthday-response">{getGaneshaResponse()}</p>
          </div>
          <div className="celebration-confetti">{Array.from({ length: 20 }).map((_, i) => <div key={i} className="confetti-piece" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>🎂</div>)}</div>
        </div>
      )}

      {/* Besties Card */}
      {sceneState.gamePhase === 'besties-card' && (
        <div className="besties-overlay">
          <h1 className="besties-title">BEST FRIENDS FOREVER! 💖</h1>
          <div className="besties-subtitle">We both love celebrations!</div>
          <div className="besties-cards">
            <div className="besties-card">
              <img src={babyGaneshaSit} alt="Ganesha" className="besties-avatar" />
              <div className="besties-card-name">GANESHA</div>
              <div className="besties-info-row"><span className="besties-label">Birthday:</span><span className="besties-value">Ganesh Chaturthi</span></div>
              <div className="besties-info-row"><span className="besties-label">Month:</span><span className="besties-value">Aug-Sept 🐘</span></div>
            </div>
            <div className="besties-connector"><div className="besties-heart">❤️</div><span>FRIENDS</span><div className="besties-heart">❤️</div></div>
            <div className="besties-card">
              <div className="child-avatar-circle" style={{ width: '80px', height: '80px', margin: '0 auto' }}>
                <div className="child-initial" style={{ fontSize: '40px' }}>{sceneState.childName.charAt(0)}</div>
              </div>
              <div className="besties-card-name">{sceneState.childName.toUpperCase()}</div>
              <div className="besties-info-row"><span className="besties-label">Birthday:</span><span className="besties-value">{sceneState.childBirthdayMonthName} {sceneState.childBirthdayDate}</span></div>
              <div className="besties-info-row"><span className="besties-label">Festival:</span><span className="besties-value">{monthFestivals.find(m => m.month === sceneState.childBirthdayMonth)?.emoji} {monthFestivals.find(m => m.month === sceneState.childBirthdayMonth)?.name}</span></div>
            </div>
          </div>
          <div className="besties-badge-container">
            <div className="besties-badge">🎖️ OFFICIAL BESTIES BADGE 🎖️</div>
            <Button
              variant="info"
              size="large"
              onClick={() => sceneActions.updateState({ showingCompletionScreen: true })}
              className="heartbeat-gentle"
            >
              Finish Game ✨
            </Button>
          </div>
        </div>
      )}

      {/* Birthday Intro */}
      {sceneState.gamePhase === 'birthday-intro' && (
        <div className="bday-quest-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="bday-quest-ganesha bounce" />
          <div className="bday-quest-card">
            <h2 className="bday-quest-title">Let's Find My Birthday 🎂</h2>
            <p className="bday-quest-text">My birthday is a joyful day when people celebrate together.<br />It comes during the festival season.</p>
            <Button
              variant="primary"
              size="large"
              onClick={handleStartBirthdayChoice}
              className="heartbeat-delayed"
            >
              Let's Explore 🌼
            </Button>
          </div>
        </div>
      )}

      {/* Birthday Choice */}
      {/* Birthday Choice */}
      {sceneState.gamePhase === 'birthday-choice' && (
        <div className="birthday-choice-screen">

          {/* 1. Movable Ganesha */}
          <div className="birthday-ganesha-movable">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="birthday-ganesha-small bounce-gentle" />
          </div>

          {/* 2. DYNAMIC HEADER BUBBLE */}
          <div className="birthday-speech-bubble">
            <span className="bubble-main-text">Which festival is my birthday? 🎊</span>
            <span className="bubble-instruction-small">
              {/* If a card is open (flipped), show "Tap to close", else show "Tap to choose" */}
              {sceneState.flippedCards.length > 0
                ? "Tap anywhere to close ✖"
                : "Tap a card to guess (or ⓘ to peek) ✨"}
            </span>
          </div>

          {/* 3. Cards Container */}
          <div className="birthday-choices-container">

            {/* BACKGROUND OVERLAY (Click to Close) */}
            {sceneState.flippedCards.length > 0 && (
              <div
                className="birthday-info-overlay"
                onClick={handleCloseInfo}
              />
            )}

            {festivals.map((festival, index) => {
              const isLeftColumn = index % 2 === 0;
              const isFlipped = sceneState.flippedCards.includes(festival.id);
              const isWrong = sceneState.wrongFestivals.includes(festival.id);

              return (
                <div key={festival.id} className={`birthday-card-container ${isFlipped ? 'container-active' : ''}`}>

                  <button
                    className={`birthday-choice-card heartbeat-card ${isFlipped ? 'card-info-open' : ''} ${isWrong ? 'birthday-wrong' : ''}`}
                    onClick={() => handleFestivalClick(festival.id)}
                    /* FIX: Only disable if A card is open, but allow clicking this one even if wrong */
                    disabled={sceneState.flippedCards.length > 0 && !isFlipped}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="birthday-choice-image-container">
                      <img src={festival.image} alt={festival.name} className="birthday-choice-image" />
                    </div>
                    <div className="birthday-choice-clue">{festival.clue}</div>
                  </button>

                  {/* INFO ICON: Always clickable even if card is wrong/grayed out, so they can re-read */}
                  <button
                    className="birthday-info-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      sceneActions.updateState({ flippedCards: [festival.id] });
                      setInstructionMessage("Learning Mode! 🤓");
                    }}
                    style={{ [isLeftColumn ? 'left' : 'right']: '10px' }}
                  >ⓘ</button>

                  {/* INFO PANEL (Tap to Close) */}
                  {isFlipped && (
                    <div
                      className={`birthday-info-panel ${isLeftColumn ? 'slide-left' : 'slide-right'}`}
                      onClick={handleCloseInfo}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="birthday-info-content">
                        <div className="birthday-info-month">{festival.name}</div>
                        <div className="birthday-info-fact">{festival.fact}</div>
                        <div className="birthday-info-sub">{festival.month}</div>

                        {/* Subtle Hint to tap to close */}
                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '5px', fontStyle: 'italic' }}>
                          (Tap to close)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Birthday Correct */}
      {sceneState.gamePhase === 'birthday-correct' && (
        <div className="birthday-correct-screen">
          <div className="birthday-ganesha-happy"><img src={babyGaneshaSit} alt="Happy Ganesha" className="birthday-ganesha-celebrate" /></div>
          <div className="birthday-correct-festival"><img src={festivals.find(f => f.id === sceneState.selectedFestival).image} alt="Ganesh Chaturthi" className="birthday-festival-in-hand pop-in" /></div>
          <div className="birthday-celebration-sparkles">{Array.from({ length: 15 }).map((_, i) => <div key={i} className="birthday-sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>✨</div>)}</div>
          <div className="birthday-success-message">Yes! Ganesh Chaturthi is my birthday! 🎉</div>
        </div>
      )}

      {/* Resume Popup */}
      {showResumePopup && (
        <div style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
          color: 'white',
          padding: '20px 40px',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          maxWidth: '80%',
          animation: 'slideDown 0.5s ease-out'
        }}>
          {resumeMessage}
        </div>
      )}

      {/* Completion Modal */}
      {sceneState.showingCompletionScreen && (
        <SceneCompletionCelebration
          show={sceneState.showingCompletionScreen}
          zoneId="about-me-hut"
          sceneId="name-birthday"
          sceneName="Name & Birthday"
          completionTitle={completionModalContent?.title}
          completionSubtitle={completionModalContent?.subtitle}
          discoveredSymbols={completionIcons}
          symbolImages={{
            balloons: balloonsIcon,
            birthday: birthdayIcon
          }}
          nextSceneName="What We Love"
          childName="festival finder"
          isFinalScene={false}
          starsEarned={sceneState.stars}
          totalStars={2}
          completionData={{
            completed: true,
            stars: sceneState.stars || 2,
            childName: sceneState.childName || ''
          }}
          onContinue={() => {
            setTimeout(() => {
              if (onNavigate) onNavigate('scene-complete-continue');
              else if (onComplete) onComplete();
            }, 100);
          }}
          onReplay={() => {
            sceneActions.updateState({
              gamePhase: 'intro',
              poppedLetters: [],
              selectedFestival: null,
              wrongFestivals: [],
              flippedCards: [],
              childName: '',
              childNameLetters: [],
              childBirthdayMonth: '',
              childBirthdayDate: '',
              showingCompletionScreen: false,
              completed: false,
              currentLetterIndex: 0
            });
          }}
          onBackToMap={() => {
            if (onNavigate) onNavigate('zone-welcome');
            else if (onBack) onBack();
          }}
          onHome={() => { if (onNavigate) onNavigate('home'); }}
        />
      )}
    </div>
  );
};

export default NameBirthdayGame;
