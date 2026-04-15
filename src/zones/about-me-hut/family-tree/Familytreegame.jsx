import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGameSounds } from '../../../lib/hooks/useGameSounds';
import './Familytreegame.css';
import SceneCompletionCelebration from "../../../lib/components/celebration/SceneCompletionCelebration";

// Import SceneManager & Navigation
import SceneManager from "../../../lib/components/scenes/SceneManager";
import BackToMapButton from '../../../lib/components/navigation/BackToMapButton';

// Voice Guidance Hook
import useVoiceGuidance from '../../../lib/hooks/useVoiceGuidance';
import { useGaneshaVoice } from '../../../lib/hooks/useGaneshaVoice';

// Pause Menu Components (commented out — replaced by HomeButton)
// import { PauseButton, PauseMenu, PauseBlurOverlay, usePauseEnhancements } from '../../../lib/components/ui/PauseMenu';
import HomeButton from '../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../lib/components/ui/AudioToggle/AudioToggle';
import ZoneBadgeButton from '../../../lib/components/navigation/ZoneBadgeButton';
import useAudioPreference from '../../../lib/hooks/useAudioPreference';
import useResumeCountdown from '../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../lib/components/feedback/ResumeCountdown';
import usePauseAwareTimeout from '../../../lib/hooks/usePauseAwareTimeout';

// Content Configs
import { getOpeningModal, getCompletionModal } from '../../../lib/config/content';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';
import { getVoiceScript } from '../../../lib/config/content/voiceGuidance';

// Shared Components
import OpeningModal from '../../shared/components/OpeningModal';

// --- IMPORT ASSETS (Ganesha's Family & Distractors) ---
import familyTreeBg from './assets/images/family_background.jpg';
import familyTree from './assets/images/family_tree.png';

// Correct Answers
import babyGaneshaImg from '/images/ganesha-final-new.svg';
import shivaImg from './assets/images/ganesha/family-shiva.png';
import parvatiImg from './assets/images/ganesha/family-parvati.png';
import kartikeyaImg from './assets/images/ganesha/family-kartkeya.png';

// Incorrect Answers (Distractors)
import brahmaImg from './assets/images/ganesha/family-brahma.png';
import vishnuImg from './assets/images/ganesha/family-vishnu.png';
import lakshmiImg from './assets/images/ganesha/family-lakshmi.png';
import saraswatiImg from './assets/images/ganesha/family-saraswati.png';
import hanumanImg from './assets/images/ganesha/family-hanuman.png';
import krishnaImg from './assets/images/ganesha/family-krishna.png';
import mouseImg from './assets/images/ganesha/family-mouse.png';
import nandiImg from './assets/images/ganesha/family-nandi.png';

// --- IMPORT ASSETS (Child's Family) ---
import childDadImg from './assets/images/child/family-dad.png';
import childMomImg from './assets/images/child/family-mom.png';
import childGrandpaImg from './assets/images/child/family-grandpa.png';
import childGrandmaImg from './assets/images/child/family-grandma.png';
import childBrotherImg from './assets/images/child/family-brother.png';
import childSisterImg from './assets/images/child/family-sister.png';
import childMyselfImg from './assets/images/child/family-myself.png';
import childPetImg from './assets/images/child/family-pet.png';
import familyIconImg from './assets/images/family-icon.png';
import heartIconImg from './assets/images/heart-icon.png';
import homeIconImg from './assets/images/house-icon.png';

// ========================================
// VO-GATED BUTTON COMPONENT
// ========================================
const VOGatedButton = ({
  visible,
  onClick,
  children,
  className = '',
  style = {}
}) => {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        ...style,
        animation: 'buttonFadeIn 0.35s ease-out',
        opacity: 1,
        transform: 'translateY(0)'
      }}
    >
      {children}
      <style>{`
        @keyframes buttonFadeIn {
          from {
            opacity: 0;
            transform: translateY(4px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </button>
  );
};

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
// 1. MAIN WRAPPER (Handles SceneManager)
// =========================================================
const FamilyTreeGame = ({
  onComplete,
  onNavigate,
  onBack,
  zoneId = 'about-me-hut',
  sceneId = 'family-tree'
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          // Game Phase Control
          gamePhase: 'intro',

          // Ganesha Tree State (Arrays for JSON compatibility)
          placedGaneshaMembers: [],
          tappedMembers: [],

          // Selection State
          selectedCircle: null,
          showChoiceModal: false,
          currentChoices: [],
          disabledChoices: [],
          wrongChoice: null,
          correctChoiceId: null,
          justPlacedId: null,

          // Modals & Popups
          showFunFactModal: null,
          flippedMember: null,
          showYouGotIt: null,
          showTreeSparkles: false,
          showCelebration: null,

          // Transition & Child Tree State
          isSequencePlaying: false,
          showBottomTray: false,

          // Child Family Data
          childFamily: [],
          showNameModal: false,
          currentFamilyType: null,
          callName: '',
          selectedMemberIndex: null,

          // Completion
          showingCompletionScreen: false,
          stars: 0,
          completed: false
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <FamilyTreeGameContent
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
// 2. CONTENT COMPONENT (Logic & UI)
// =========================================================
const FamilyTreeGameContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  onBack
}) => {

  if (!sceneState || !sceneActions) return <div>Loading...</div>;

  // Get content from configs
  const openingModalContent = getOpeningModal('about-me-hut', 'family-tree');
  const completionModalContent = getCompletionModal('about-me-hut', 'family-tree');
  const completionIcons = openingModalContent?.icons || ['home', 'heart', 'family'];

  // IMPORTANT: Ensure phase exists (just like Modak code)
  if (!sceneState?.gamePhase) {
    sceneActions.updateState({ gamePhase: 'intro' });
  }

  // ========================================
  // VOICE GUIDANCE HOOK
  // ========================================
  const RESUME_DELAY_MS = 3000;
  const { isAudioOn, toggleAudio, setAudioEnabled } = useAudioPreference();
  const audioEnabledRef = useRef(isAudioOn);
  audioEnabledRef.current = isAudioOn;

  const setCurrentPhaseRef = useRef(null);

  const onReturnHint = useCallback(() => {
    // Called when child returns to tab — triggers idle timer reset in useVoiceGuidance
    setCurrentPhaseRef.current?.(sceneState?.gamePhase ?? null);
  }, [sceneState?.gamePhase]);

  const {
    playVoice,
    stopVoice,
    setVoiceVolume,
    playSfx,
    playTap,
    playCorrect,
    playWrong,
    playCelebration,
    playPowerUnlock,
    startMusic,
    stopMusic,
    startIdleTimer,
    stopIdleTimer,
    setCurrentPhase,
    recordInteraction
  } = useVoiceGuidance('about-me-hut', 'family-tree', {
    enableMusic: true,
    musicVolume: 0.07,
    voiceVolume: 0.65,
    sfxVolume: 0.7,
    idleTimeout: 10,
    resumeDelay: RESUME_DELAY_MS,
    onReturnHint
  });
  setCurrentPhaseRef.current = setCurrentPhase;

  const { playUiTap, playWrongTap, playSparkle, playBloom, playChime, playGlow, playTwinkle } = useGameSounds();

  // Web Speech API for idle hint VO (arbitrary text)
  const { speak: speakHint, stop: stopSpokenVoice } = useGaneshaVoice();

  // Audio toggle — no syllable/word game audio here, stopVoice() is safe on toggle-off
  const handleAudioToggle = () => {
    const nextOn = !isAudioOn;
    setVoiceVolume(nextOn ? 1 : 0);
    if (!nextOn) stopVoice();
    if (nextOn) setShowVoiceOffPill(false);
    toggleAudio();
  };

  // ========================================
  // PAUSE MENU STATE (commented out — replaced by HomeButton)
  // ========================================
  // const [showPauseMenu, setShowPauseMenu] = useState(false);
  // const [isSoundOn, setIsSoundOn] = useState(true);

  // usePauseEnhancements(showPauseMenu, setShowPauseMenu, ...) — removed

  // ========================================
  // VO-GATED BUTTON STATE
  // ========================================
  const [openingButtonVisible, setOpeningButtonVisible] = useState(true);
  const [showVoiceOffPill, setShowVoiceOffPill] = useState(false);

  // ========================================
  // GANESHA PHASE VO STATE
  // ========================================
  const [isPlayingWrongVO, setIsPlayingWrongVO] = useState(false); // Block taps during wrong choice animation

  // ========================================
  // TRANSITION & CHILD PHASE VO STATE
  // ========================================
  const [transitionButtonVisible, setTransitionButtonVisible] = useState(false);
  const [childProgressCount, setChildProgressCount] = useState(0); // Track which progress VO to play
  const ganeshaTreeDoneClickedRef = useRef(false);

  // --- LOCAL REFS & STATE (Not persisted in SceneManager) ---
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  // --- RELOAD DETECTION STATE ---
  const reloadHandledRef = useRef(false);
  const resumePopupTimeoutRef = useRef(null);
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');
  const isPausedRef = useRef(false);
  const scheduledTimeoutsRef = useRef([]);
  const [showReturnHint, setShowReturnHint] = useState(false);
  const prevCountdownRef = useRef(null);
  const childStartTimerRef = useRef(null);
  const tapCircleTimerRef = useRef(null);

  // Mini gesture (thumbs up) on successful taps
  const [miniGesture, setMiniGesture] = useState({
    show: false,
    target: 'center',
    durationMs: 1500,
    key: 0
  });
  const miniGestureTimerRef = useRef(null);

  // Idle hint system (choice modal)
  const [idleHintLevel, setIdleHintLevel] = useState(0); // 0=none, 1=wobble, 2=glow, 3=sparkle
  const idleHintTimersRef = useRef([]);
  const modalOpenCountRef = useRef({}); // tracks open count per circle id
  // Mirror refs so usePauseAwareTimeout callbacks can read current state without stale closures
  const showChoiceModalRef = useRef(sceneState.showChoiceModal);
  showChoiceModalRef.current = sceneState.showChoiceModal;
  const selectedCircleRef = useRef(sceneState.selectedCircle);
  selectedCircleRef.current = sceneState.selectedCircle;

  // Resume Countdown & Pause-Aware Timeout
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: () => {
      // On tab hide: stop all voices + kill idle hint timers so they don't fire in background
      stopVoice();
      stopSpokenVoice();
      setShowReturnHint(false);
      // Clear idle hint timers and hide glow
      idleHintTimersRef.current.forEach(id => clearTimeout(id));
      idleHintTimersRef.current = [];
      setIdleHintLevel(0);
    },
    onShow: () => {
      // On tab resume: trigger idle timer reset
      onReturnHint?.();
      // Restart idle hints if choice modal is still open when child returns
      if (showChoiceModalRef.current && selectedCircleRef.current) {
        const circle = selectedCircleRef.current;
        const openCount = modalOpenCountRef.current[circle] || 1;
        const t1 = openCount > 1 ? 4000 : 6000;
        const t2 = openCount > 1 ? 10000 : 14000;
        const t3 = openCount > 1 ? 16000 : 22000;
        idleHintTimersRef.current.forEach(id => clearTimeout(id));
        idleHintTimersRef.current = [];
        const timer1 = setTimeout(() => setIdleHintLevel(1), t1);
        const timer2 = setTimeout(() => {
          setIdleHintLevel(2);
          if (audioEnabledRef.current && IDLE_HINT_VO[circle]) {
            stopSpokenVoice();
            speakHint(IDLE_HINT_VO[circle], { age: 7, style: 'child', moment: 'encouragement' });
          }
        }, t2);
        const timer3 = setTimeout(() => setIdleHintLevel(3), t3);
        idleHintTimersRef.current = [timer1, timer2, timer3];
      }
    },
    resumeDelay: RESUME_DELAY_MS
  });

  // Show pointing hint on first unplaced circle when child returns from tab switch
  useEffect(() => {
    if (countdownValue === null && prevCountdownRef.current !== null) {
      // Countdown just finished — show hint if in ganeshaTree phase with circles remaining
      const canShowHint =
        sceneState.gamePhase === 'ganeshaTree' &&
        sceneState.placedGaneshaMembers.length < 4 &&
        !sceneState.isSequencePlaying &&
        !sceneState.showFunFactModal &&
        !sceneState.showChoiceModal &&
        !sceneState.flippedMember;

      if (canShowHint) {
        setShowReturnHint(true);
        if (isAudioOn) playVoice('hintTap');
        const id = setTimeout(() => setShowReturnHint(false), 3000);
        return () => clearTimeout(id);
      }
    }
    prevCountdownRef.current = countdownValue;
  }, [countdownValue]);

  // scheduleTimeout now uses pause-aware timeout management
  const scheduleTimeout = (fn, delay) => {
    return safeSetTimeout(fn, delay);
  };

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

  // --- IDLE HINT VO CLUES (spoken via Web Speech API) ---
  const IDLE_HINT_VO = {
    father: "My father carries a trident.",
    mother: "My mother wears a beautiful golden sari.",
    brother: "My brother rides a peacock.",
    myself: "I have an elephant head."
  };

  // --- DATA DEFINITIONS ---
  const ganeshaFamily = [
    {
      id: 'father', role: 'Father', correctAnswer: 'shiva',
      position: { top: '38%', left: '40%' },
      // Centered on left foliage lobe
      introTitle: 'My Father', introText: 'He is calm and strong',
      flipTitle: 'My Father', funFact: 'My father is calm and strong. He protects us and teaches me peace'
    },
    {
      id: 'mother', role: 'Mother', correctAnswer: 'parvati',
      position: { top: '38%', right: '30%' },
      // Centered on right foliage lobe
      introTitle: 'My Mother', introText: 'She is kind and loving',
      flipTitle: 'My Mother', funFact: 'My mother is kind and loving. She gives the best hugs and keeps me safe'
    },
    {
      id: 'brother', role: 'Brother', correctAnswer: 'kartikeya',
      position: { top: '60%', left: '41%' },
      // Lower left area near trunk
      introTitle: 'My Brother', introText: 'He is brave and fast',
      flipTitle: 'My Brother', funFact: 'My brother is very brave. He travels the world on his peacock'
    },
    {
      id: 'myself', role: 'Me', correctAnswer: 'ganesha',
      position: { top: '60%', right: '30%' },
      // Lower right area near trunk
      introTitle: "That's Me", introText: 'I love modaks',
      flipTitle: 'Me', funFact: "That's me! I love modaks and helping my friends"
    }
  ];

  const deityChoices = {
    father: [
      { id: 'shiva', name: 'Shiva', image: shivaImg, type: 'img', isCorrect: true },
      { id: 'vishnu', name: 'Vishnu', image: vishnuImg, type: 'img', isCorrect: false },
      { id: 'brahma', name: 'Brahma', image: brahmaImg, type: 'img', isCorrect: false }
    ],
    mother: [
      { id: 'parvati', name: 'Parvati Ma', image: parvatiImg, type: 'img', isCorrect: true },
      { id: 'lakshmi', name: 'Lakshmi Ma', image: lakshmiImg, type: 'img', isCorrect: false },
      { id: 'saraswati', name: 'Saraswati Ma', image: saraswatiImg, type: 'img', isCorrect: false }
    ],
    brother: [
      { id: 'kartikeya', name: 'Kartikeya', image: kartikeyaImg, type: 'img', isCorrect: true },
      { id: 'hanuman', name: 'Hanuman', image: hanumanImg, type: 'img', isCorrect: false },
      { id: 'krishna', name: 'Krishna', image: krishnaImg, type: 'img', isCorrect: false }
    ],
    myself: [
      { id: 'ganesha', name: 'Ganesha', image: babyGaneshaImg, type: 'img', isCorrect: true },
      { id: 'mushak', name: 'Mushak', image: mouseImg, type: 'img', isCorrect: false },
      { id: 'kartikeya', name: 'Kartikeya', image: kartikeyaImg, type: 'img', isCorrect: false }
    ]
  };

  const deityNameVoiceKeyMap = {
    shiva: 'shiva',
    parvati: 'parvati',
    kartikeya: 'kartikeya',
    ganesha: 'ganesha',
    vishnu: 'vishnu',
    brahma: 'brahma',
    lakshmi: 'lakshmi',
    saraswati: 'saraswati',
    hanuman: 'hanuman',
    krishna: 'krishna',
    mushak: 'mushak'
  };

  const familyMemberTypes = [
    { id: 'dad', label: 'Dad', image: childDadImg, color: '#6BB6FF', row: 2 },
    { id: 'mom', label: 'Mom', image: childMomImg, color: '#FF8FB1', row: 2 },
    { id: 'grandparent-m', label: 'Grandpa', image: childGrandpaImg, color: '#BEE7D8', row: 1 },
    { id: 'grandparent-f', label: 'Grandma', image: childGrandmaImg, color: '#F7C6D9', row: 1 },
    { id: 'brother', label: 'Brother', image: childBrotherImg, color: '#7EDC9A', row: 3 },
    { id: 'sister', label: 'Sister', image: childSisterImg, color: '#FFA6C9', row: 3 },
    { id: 'myself', label: 'Myself', image: childMyselfImg, color: '#FFD966', row: 3 },
    { id: 'pet', label: 'Pet', image: childPetImg, color: '#F2D3A2', row: 3 }
  ];

  // ==================== RELOAD DETECTION (Exactly like Modak) ====================
  useEffect(() => {
    // If we are reloading and haven't handled it yet
    if (isReload && !reloadHandledRef.current) {
      reloadHandledRef.current = true;

      const { gamePhase, placedGaneshaMembers, childFamily } = sceneState;

      console.log("🔄 Reload detected, gamePhase:", gamePhase);

      // Clear any existing timeouts
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);

      // Always clear transient modal/overlay states on reload — never restore mid-modal
      sceneActions.updateState({
        showChoiceModal: false,
        selectedCircle: null,
        currentChoices: [],
        wrongChoice: null,
        disabledChoices: [],
        correctChoiceId: null,
        showFunFactModal: null,
        isSequencePlaying: false,
        flippedMember: null,
        showNameModal: false,
        currentFamilyType: null,
        callName: '',
        justPlacedId: null,
        showTreeSparkles: false,
      });

      // 1. INTRO - Don't show popup
      if (gamePhase === 'intro') {
        return;
      }

      // 2. GANESHA TREE - Some placed (Note: .length for arrays)
      if (gamePhase === 'ganeshaTree' && placedGaneshaMembers && placedGaneshaMembers.length > 0 && placedGaneshaMembers.length < 4) {
        setResumeMessage(`Great progress! You've placed ${placedGaneshaMembers.length}/4 family members. Keep going!`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = scheduleTimeout(() => setShowResumePopup(false), 5000);
        return;
      }

      // 3. GANESHA TREE - All placed
      if (gamePhase === 'ganeshaTree' && placedGaneshaMembers && placedGaneshaMembers.length === 4) {
        setResumeMessage(`Amazing! You completed Ganesha's family tree! Tap "Continue" to continue.`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = scheduleTimeout(() => setShowResumePopup(false), 5000);
        return;
      }

      // 4. CHILD INPUT - Some added
      if (gamePhase === 'childInput' && childFamily && childFamily.length > 0) {
        setResumeMessage(`You've added ${childFamily.length} family member${childFamily.length > 1 ? 's' : ''} to your tree!`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = scheduleTimeout(() => setShowResumePopup(false), 5000);
        return;
      }

      // 5. TRANSITION / SIDE BY SIDE
      // Just show the UI as-is, no special popup needed
    }
  }, [isReload, sceneState.gamePhase]); // Run when isReload changes

  // Cleanup ref on unmount
  useEffect(() => {
    return () => {
      reloadHandledRef.current = false;
      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
    };
  }, []);

  // --- HELPER FUNCTIONS ---
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getPlacedDeityImage = (memberId) => {
    const choices = deityChoices[memberId];
    if (!choices) return null;
    return choices.find(d => d.isCorrect);
  };

  const getFamilyByRow = (rowNumber) => {
    return sceneState.childFamily ? sceneState.childFamily.filter(m => m.row === rowNumber) : [];
  };

  const getNamePromptQuestion = (typeId, fallbackLabel) => {
    const promptMap = {
      dad: 'What do you call your Dad/Uncle?',
      mom: 'What do you call your Mom/Aunt?',
      brother: 'What do you call your Brother/Cousin?',
      sister: 'What do you call your Sister/Cousin?',
      myself: 'What do you call yourself?'
    };
    return promptMap[typeId] || `What do you call your ${fallbackLabel}?`;
  };

  const getNamePromptPlaceholder = (typeId) => {
    const placeholderMap = {
      dad: 'e.g., Papa, Chachu...',
      mom: 'e.g., Mama, Maasi...',
      brother: 'e.g., Bhaiya, Cousin...',
      sister: 'e.g., Didi, Cousin...',
      myself: 'e.g., My nickname...'
    };
    return placeholderMap[typeId] || 'e.g., Papa, Mama...';
  };

  // ========================================
  // VOICE: Play welcome on OPENING MODAL (before game starts)
  // Button is visible immediately (like ModakScene)
  // ========================================
  useEffect(() => {
    // Play welcome voice when opening modal is shown (phase is intro)
    if (sceneState.gamePhase === 'intro') {
      setOpeningButtonVisible(true);
      // Always play welcome VO on opening modal — regardless of audio preference.
      // Audio-off is applied in handleStartGame when "Let's Explore" is tapped.
      const timer = scheduleTimeout(() => {
        // Check if welcome uses Web Speech API
        const welcomeScript = getVoiceScript('about-me-hut', 'family-tree', 'welcome');
        if (welcomeScript?.useWebSpeech) {
          // Use Web Speech API
          speakHint(welcomeScript.text);
          playSfx('chime');
        } else {
          // Use file-based audio
          playVoice('welcome', () => {
            playSfx('chime');
          });
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [sceneState.gamePhase]);

  // Show "Voice is off" nudge pill when game begins with audio off
  // Only fires when game phase starts (not on opening modal)
  useEffect(() => {
    if (sceneState.gamePhase === 'ganeshaTree' && !isAudioOn) {
      const timer = setTimeout(() => setShowVoiceOffPill(true), 800);
      return () => clearTimeout(timer);
    }
  }, [sceneState.gamePhase, isAudioOn]);

  // Auto-dismiss pill after 5s so child has time to notice and tap the toggle
  useEffect(() => {
    if (!showVoiceOffPill) return;
    const timer = setTimeout(() => setShowVoiceOffPill(false), 5000);
    return () => clearTimeout(timer);
  }, [showVoiceOffPill]);

  // ========================================
  // MOUNT SYNC: Sync voice volume with stored audio preference
  // Skip intro phase — welcome VO should always play on opening modal.
  // Mute is applied in handleStartGame when game begins.
  // On continue/reload to a non-intro phase, mute immediately.
  // ========================================
  useEffect(() => {
    if (!isAudioOn && sceneState.gamePhase !== 'intro') {
      setVoiceVolume(0);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ========================================
  // CLEANUP: Stop music and timers on unmount
  // ========================================
  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (tapCircleTimerRef.current) {
        clearTimeout(tapCircleTimerRef.current);
        tapCircleTimerRef.current = null;
      }
      stopMusic();
      stopIdleTimer();
    };
  }, [clearAllTimeouts, stopMusic, stopIdleTimer]);


  // ========================================
  // Auto-close fun fact modal (without stopping VO)
  // ========================================
  useEffect(() => {
    if (sceneState.showFunFactModal) {
      // Immediately reset state without stopping voice (VO plays in background)
      sceneActions.updateState({ showFunFactModal: null, isSequencePlaying: false });
    }
  }, [sceneState.showFunFactModal]);

  // ========================================
  // GANESHA PHASE: Play "all placed" VO when all 4 members placed
  // ========================================
  useEffect(() => {
    if (
      sceneState.gamePhase === 'ganeshaTree' &&
      sceneState.placedGaneshaMembers.length === 4 &&
      !sceneState.showFunFactModal &&
      !sceneState.isSequencePlaying
    ) {
      // Wait 4 seconds for correct choice VO to finish before playing allPlaced VO
      scheduleTimeout(() => {
        if (isAudioOn) {
          speakHint("Great! You met my loving family!", { age: 7, style: 'child', moment: 'celebration' });
        }
      }, 4000);
    }
  }, [
    sceneState.gamePhase,
    sceneState.placedGaneshaMembers.length,
    sceneState.showFunFactModal,
    sceneState.isSequencePlaying,
    isAudioOn
  ]);

  // ========================================
  // GANESHA PHASE: Play tapCircle hint 3.5s after phase begins
  // ========================================
  useEffect(() => {
    if (tapCircleTimerRef.current) {
      clearTimeout(tapCircleTimerRef.current);
      tapCircleTimerRef.current = null;
    }

    const canPlayTapHint =
      sceneState.gamePhase === 'ganeshaTree' &&
      sceneState.placedGaneshaMembers.length === 0 &&
      !sceneState.showChoiceModal &&
      !sceneState.showFunFactModal &&
      !sceneState.isSequencePlaying;

    if (canPlayTapHint) {
      tapCircleTimerRef.current = setTimeout(() => {
        playVoice('tapCircle');
        tapCircleTimerRef.current = null;
      }, 3500);
    }

    return () => {
      if (tapCircleTimerRef.current) {
        clearTimeout(tapCircleTimerRef.current);
        tapCircleTimerRef.current = null;
      }
    };
  }, [
    sceneState.gamePhase,
    sceneState.placedGaneshaMembers.length,
    sceneState.showChoiceModal,
    sceneState.showFunFactModal,
    sceneState.isSequencePlaying
  ]);

  // ========================================
  // CHOICE MODAL: Stop voice + run idle hint progression
  // 6s wobble → 6s glow → 14s VO clue → 22s sparkle (no further hints)
  // ========================================
  useEffect(() => {
    // Always clear running hint timers first
    idleHintTimersRef.current.forEach(id => clearTimeout(id));
    idleHintTimersRef.current = [];
    setIdleHintLevel(0);

    if (sceneState.showChoiceModal && sceneState.selectedCircle) {
      stopVoice();

      const circle = sceneState.selectedCircle;

      const timer1 = setTimeout(() => {
        setIdleHintLevel(1); // wobble on correct card at 6s
      }, 6000);

      const timer2 = setTimeout(() => {
        setIdleHintLevel(2); // glow at 6s (immediately follows wobble)
      }, 6000);

      const timer3 = setTimeout(() => {
        // keep glow + play VO clue at 14s
        if (audioEnabledRef.current && IDLE_HINT_VO[circle]) {
          stopSpokenVoice();
          speakHint(IDLE_HINT_VO[circle], { age: 7, style: 'child', moment: 'encouragement' });
        }
      }, 14000);

      const timer4 = setTimeout(() => {
        setIdleHintLevel(3); // sparkle at 22s — no further hints after this
      }, 22000);

      idleHintTimersRef.current = [timer1, timer2, timer3, timer4];
    }

    return () => {
      idleHintTimersRef.current.forEach(id => clearTimeout(id));
      idleHintTimersRef.current = [];
    };
  }, [sceneState.showChoiceModal, sceneState.selectedCircle]);

  // ========================================
  // CHILD PHASE: Play childStart VO 3.5s after phase begins (fresh start only)
  // ========================================
  useEffect(() => {
    if (sceneState.gamePhase === 'childInput' && sceneState.childFamily.length === 0) {
      childStartTimerRef.current = scheduleTimeout(() => {
        childStartTimerRef.current = null;
        playVoice('childStart');
      }, 3500);
      return () => {
        clearTimeout(childStartTimerRef.current);
        childStartTimerRef.current = null;
      };
    }
  }, [sceneState.gamePhase]);

  // ========================================
  // TRANSITION PHASE: Play transition VO
  // ========================================
  useEffect(() => {
    if (sceneState.gamePhase === 'transition') {
      stopVoice();

      scheduleTimeout(() => {
        playVoice('transition');
        setTransitionButtonVisible(true);
      }, 500);
    }
  }, [sceneState.gamePhase]);




  // ========================================
  // OLD: Removed childProgressFull logic - now using milestone system in handleAddFamilyMember
  // ========================================

  // ========================================
  // FINAL SCENE: Play final reveal and scene complete VOs
  // ========================================
  const [finalRevealPlayed, setFinalRevealPlayed] = useState(false);

  useEffect(() => {
    if (sceneState.gamePhase === 'sideBySide' && !finalRevealPlayed) {
      setFinalRevealPlayed(true);
      stopVoice();

      // No VO for this screen - let the visual moment speak for itself
      // scheduleTimeout(() => {
      //   playVoice('sceneComplete');
      // }, 500);
    }
  }, [sceneState.gamePhase, finalRevealPlayed]);

  // --- EVENT HANDLERS (Using sceneActions) ---
  const handleStartGame = () => {
    stopVoice();
    if (!isAudioOn) setVoiceVolume(0); // Apply audio-off preference when game begins
    startMusic();

    // Transition to game
    sceneActions.updateState({ gamePhase: 'ganeshaTree' });
  };

  const handleClickCircle = (circleId) => {
    if (sceneState.isSequencePlaying) return;
    if (sceneState.showFunFactModal || sceneState.showChoiceModal) return;
    setShowReturnHint(false);

    // Check if already placed — play info VO and flip card
    if (sceneState.placedGaneshaMembers.includes(circleId)) {
      const infoVOMap = {
        'father': 'infoFather',
        'mother': 'infoMother',
        'brother': 'infoBrother',
        'myself': 'infoMyself'
      };
      playVoice(infoVOMap[circleId]);
      sceneActions.updateState({
        flippedMember: sceneState.flippedMember === circleId ? null : circleId,
        tappedMembers: sceneState.tappedMembers.includes(circleId)
          ? sceneState.tappedMembers
          : [...sceneState.tappedMembers, circleId]
      });
      return;
    }

    // Stop any playing VO and play tap sound
    stopVoice();
    playTap();
    recordInteraction();

    // Open modal and play voice guidance
    const member = ganeshaFamily.find(m => m.id === circleId);
    sceneActions.updateState({
      disabledChoices: [],
      selectedCircle: circleId,
      currentChoices: shuffleArray(deityChoices[circleId]),
      showChoiceModal: true,
      wrongChoice: null
    });

    // Play Web Speech guidance when choice cards open.
    if (isAudioOn && member) {
      scheduleTimeout(() => {
        stopSpokenVoice();
        const guidanceText = member.id === 'myself'
          ? "Tap to choose me."
          : `Tap to choose my ${member.role.toLowerCase()}.`;
        speakHint(guidanceText, { age: 7, style: 'child', moment: 'thinking' });
      }, 300);
    }

  };

  const handleChoiceSelection = (choice) => {
    // Block if wrong VO is currently playing
    if (isPlayingWrongVO) return;

    // Stop any playing VO
    stopVoice();
    stopSpokenVoice();
    playTap();
    recordInteraction();

    if (choice.isCorrect) {
      playSparkle();
      const selectedCircle = sceneState.selectedCircle;
      const placementRevealDelayMs = 1600;
      const preFunFactSparkleMs = 1200;
      const funFactOpenDelayMs = placementRevealDelayMs + preFunFactSparkleMs;
      const sequenceFailsafeDelayMs = funFactOpenDelayMs + 900;
      const correctSpeechMap = {
        father: "Shiva, my father. He's calm and strong.",
        mother: "Parvati, my mother. She's kind and loving.",
        brother: "Kartikeya, my brother. He's very brave.",
        myself: "That's me, Ganesha! I love to help."
      };
      if (isAudioOn && correctSpeechMap[selectedCircle]) {
        scheduleTimeout(() => {
          speakHint(correctSpeechMap[selectedCircle], { age: 7, style: 'child', moment: 'encouragement' });
        }, 120);
      }

      triggerMiniGesture('center', 1500);
      sceneActions.updateState({ isSequencePlaying: true, showYouGotIt: choice.id });
      scheduleTimeout(() => sceneActions.updateState({ correctChoiceId: choice.id }), 800);
      scheduleTimeout(() => sceneActions.updateState({ showYouGotIt: null }), 1400);
      scheduleTimeout(() => {
        sceneActions.updateState({
          showChoiceModal: false,
          placedGaneshaMembers: [...sceneState.placedGaneshaMembers, selectedCircle],
          correctChoiceId: null,
          justPlacedId: selectedCircle
        });
      }, placementRevealDelayMs);
      scheduleTimeout(() => {
        const member = ganeshaFamily.find(m => m.id === selectedCircle);
        const correctDeity = deityChoices[selectedCircle].find(d => d.isCorrect);
        playChime();
        sceneActions.updateState({
          showFunFactModal: { ...member, ...correctDeity },
          justPlacedId: null
        });
      }, funFactOpenDelayMs);

      // FAILSAFE: Reset isSequencePlaying after fun fact modal opens to prevent click-blocking
      scheduleTimeout(() => {
        sceneActions.updateState({ isSequencePlaying: false });
      }, sequenceFailsafeDelayMs);
    } else {
      // WRONG CHOICE - Shake/fade animation, no VOs
      playWrongTap();
      setIsPlayingWrongVO(true);

      // RESET IDLE HINTS on wrong choice
      idleHintTimersRef.current.forEach(id => clearTimeout(id));
      idleHintTimersRef.current = [];
      setIdleHintLevel(0);

      // Speak tapped deity name on wrong click:
      // use recorded VO key when available, otherwise fallback to Web Speech.
      if (isAudioOn) {
        const nameVoiceKey = deityNameVoiceKeyMap[choice.id] || choice.id;
        const hasRecordedName = !!getVoiceScript('about-me-hut', 'family-tree', nameVoiceKey);
        if (hasRecordedName) {
          playVoice(nameVoiceKey);
        } else {
          speakHint(choice.name, { age: 7, style: 'child', moment: 'thinking' });
        }
      }

      // Lock this wrong choice immediately so it stays faded.
      const nextDisabledChoices = [...new Set([...sceneState.disabledChoices, choice.id])];
      sceneActions.updateState({
        wrongChoice: choice.id,
        disabledChoices: nextDisabledChoices
      });

      // Clear shake marker and unblock taps after feedback.
      scheduleTimeout(() => {
        sceneActions.updateState({
          wrongChoice: null
        });
        setIsPlayingWrongVO(false);
      }, 1500);
    }
  };

  const handleCloseFunFact = () => {
    stopVoice();
    sceneActions.updateState({ showFunFactModal: null, isSequencePlaying: false });
  };

  const handleGaneshaTreeDone = () => {
    if (ganeshaTreeDoneClickedRef.current) return;
    ganeshaTreeDoneClickedRef.current = true;
    stopVoice();
    playChime();
    sceneActions.updateState({ showTreeSparkles: true });
    scheduleTimeout(() => {
      sceneActions.updateState({
        gamePhase: 'transition',
        showTreeSparkles: false,
        showCelebration: null
      });
    }, 2500);
  };

  const handleSelectFamilyType = (type) => {
    // Cancel childStart VO if user taps before 3.5s timer fires
    if (childStartTimerRef.current) {
      clearTimeout(childStartTimerRef.current);
      childStartTimerRef.current = null;
    }
    stopVoice();
    playTap();
    recordInteraction();

    sceneActions.updateState({
      currentFamilyType: type,
      callName: '',
      showNameModal: true
    });
    setAudioBlob(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAddFamilyMember = () => {
    if (!sceneState.callName.trim() && !audioBlob) return;

    stopVoice();
    playTap();
    recordInteraction();

    const newMember = {
      ...sceneState.currentFamilyType,
      callName: sceneState.callName.trim() || 'My ' + sceneState.currentFamilyType.label,
      audioBlob
    };

    const newChildFamily = [...sceneState.childFamily, newMember];
    const memberCount = newChildFamily.length;
    const previousChildFamily = sceneState.childFamily;

    sceneActions.updateState({
      childFamily: newChildFamily,
      showNameModal: false,
      currentFamilyType: null,
      callName: ''
    });
    setAudioBlob(null);

    // Count members in each row
    const prevRow1Count = previousChildFamily.filter(m => m.row === 1).length; // Grandparents
    const prevRow2Count = previousChildFamily.filter(m => m.row === 2).length; // Parents
    const prevRow3Count = previousChildFamily.filter(m => m.row === 3).length; // Siblings/Pets

    const row1Count = newChildFamily.filter(m => m.row === 1).length; // Grandparents
    const row2Count = newChildFamily.filter(m => m.row === 2).length; // Parents
    const row3Count = newChildFamily.filter(m => m.row === 3).length; // Siblings/Pets

    // Play VOs:
    // - Row completion VO only for the first two rows that become full (dynamic order)
    // - Third row completion does NOT play a row-limit VO
    // - Milestones (including 21 complete) still play
    const playVO = () => {
      const completedRowsBefore = [prevRow1Count, prevRow2Count, prevRow3Count].filter(c => c >= 7).length;
      const completedRowsAfter = [row1Count, row2Count, row3Count].filter(c => c >= 7).length;

      let newlyCompletedRow = null;
      if (prevRow1Count < 7 && row1Count >= 7) newlyCompletedRow = 1;
      if (prevRow2Count < 7 && row2Count >= 7) newlyCompletedRow = 2;
      if (prevRow3Count < 7 && row3Count >= 7) newlyCompletedRow = 3;

      // Progress milestones (most kids add ~8 max, 21 is the limit)
      if (memberCount === 1) {
        playVoice('childProgressStart');
      } else if (memberCount === 3) {
        playVoice('childProgressSmall');
      } else if (memberCount === 7) {
        playVoice('childProgressNearFull');
      } else if (memberCount === 10) {
        playVoice('childProgressMid');
      } else if (memberCount === 21) {
        playVoice('childProgressComplete');
      }
    };

    // Delay VO slightly after member is added
    scheduleTimeout(() => {
      playVO();
    }, 800);
  };

  const handleDeleteMember = (index) => {
    const newFamily = sceneState.childFamily.filter((_, i) => i !== index);
    sceneActions.updateState({
      childFamily: newFamily,
      selectedMemberIndex: null
    });
  };

  return (
    <div className="family-tree-game">
      <img src={familyTreeBg} alt="Background" className="tree-background" />

      {/* Home Button */}
      <HomeButton onNavigate={onNavigate} />
      <ZoneBadgeButton zoneId="about-me-hut" onBack={() => { onNavigate?.('zone-welcome') || onBack?.(); }} />
      <AudioToggle isAudioOn={isAudioOn} onToggle={handleAudioToggle} />

      {/* TEST BUTTONS - DEV ONLY */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          right: 10,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          padding: '8px',
          background: 'rgba(0,0,0,0.7)',
          borderRadius: '8px'
        }}>
          <button onClick={() => sceneActions.updateState({ gamePhase: 'ganeshaTree', placedGaneshaMembers: [] })} style={{ padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}>Test: Ganesha</button>
          <button onClick={() => sceneActions.updateState({ gamePhase: 'childInput', childFamily: [], placedGaneshaMembers: ['father', 'mother', 'brother', 'myself'] })} style={{ padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}>Test: Child Input</button>
          <button onClick={() => sceneActions.updateState({ gamePhase: 'transition', placedGaneshaMembers: ['father', 'mother', 'brother', 'myself'] })} style={{ padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}>Test: Transition</button>
          <button onClick={() => sceneActions.updateState({ gamePhase: 'sideBySide', childFamily: [{ id: 1, image: childDadImg, label: 'Dad', color: '#6BB6FF', callName: 'Papa', row: 2 }] })} style={{ padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}>Test: Reveal</button>
          <button onClick={() => sceneActions.updateState({ showingCompletionScreen: true, completed: true })} style={{ padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}>Test: Complete</button>
        </div>
      )}
      {showVoiceOffPill && (
        <div className="voice-off-pill">
          <span className="voice-off-pill__icon">🔇</span>
          Voice is off · Tap to hear story
        </div>
      )}
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

      {/* Back to Map Button - Commented out like in Modak */}
      {/* {!sceneState.showingCompletionScreen && (
        <BackToMapButton onNavigate={onNavigate} />
      )} */}

      {/* INTRO PHASE */}
      {sceneState.gamePhase === 'intro' && (
        <>
          <div className="ganesha-tree-wrapper">
            <img src={familyTree} alt="Family Tree" className="tree-overlay intro-tree-overlay" />
          </div>
          <OpeningModal
            zoneId="about-me-hut"
            sceneId="family-tree"
            onStart={() => {
              handleStartGame();
            }}
            characterImg={babyGaneshaImg}
            showButton={openingButtonVisible}
          />
        </>
      )}

      {/* GANESHA'S TREE */}
      {sceneState.gamePhase === 'ganeshaTree' && (
        <>
          <button className="back-btn" onClick={onBack}>← Back</button>

          <div className="game-header-hud">
            {/* Header instruction commented out - using VO instead */}
            {/* {sceneState.placedGaneshaMembers.length < 2 && (
              <div className="hud-instruction-bubble">
                👉 Tap a circle to meet my family!
              </div>
            )} */}
            <div className="hud-hearts-row">
              {ganeshaFamily.map((m, i) => (
                <span
                  key={i}
                  className={`heart-icon ${sceneState.placedGaneshaMembers.includes(m.id) ? 'filled' : ''}`}
                >
                  {sceneState.placedGaneshaMembers.includes(m.id) ? '❤️' : '🤍'}
                </span>
              ))}
            </div>
          </div>

          <div className="tree-and-circles-wrapper">
            <img src={familyTree} alt="Family Tree" className="tree-overlay ganesha-tree-overlay" />

            {(() => {
              const firstUnplacedId = ganeshaFamily.find(m => !sceneState.placedGaneshaMembers.includes(m.id))?.id;
              return ganeshaFamily.map(member => (
              <div
                key={member.id}
                className={`circle-spot-with-label ${sceneState.isSequencePlaying ? 'blocked' : ''}`}
                style={member.position}
              onClick={() => handleClickCircle(member.id)}
            >
              {!sceneState.placedGaneshaMembers.includes(member.id) ? (
                <div className={`empty-circle ${!sceneState.isSequencePlaying ? 'empty-circle-hint-glow' : ''}`}>
                  {showReturnHint && member.id === firstUnplacedId && (
                    <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '72px', animation: 'bounce 0.6s ease-in-out infinite alternate', pointerEvents: 'none', zIndex: 20 }}>👆</span>
                  )}
                </div>
              ) : (
                <div className={`placed-deity ${sceneState.justPlacedId === member.id ? 'just-placed-glow' : ''}`}>
                  <div className="deity-front">
                    <div className="deity-circle">
                      <img src={getPlacedDeityImage(member.id).image} alt="Deity" className="deity-image" />
                    </div>
                    {/* Tap hint commented out
                    {!sceneState.tappedMembers.includes(member.id) && (
                      <div className="tap-to-learn">👆 Tap!</div>
                    )}
                    */}
                  </div>
                  {sceneState.justPlacedId === member.id && (
                    <div className="circle-celebration-sparkles">
                      <span className="circle-sparkle cs-1">✨</span>
                      <span className="circle-sparkle cs-2">⭐</span>
                      <span className="circle-sparkle cs-3">✨</span>
                      <span className="circle-sparkle cs-4">⭐</span>
                    </div>
                  )}
                </div>
              )}
              <div className="circle-label">{member.role}</div>
            </div>
          ));
          })()}
          </div>

          {sceneState.showChoiceModal && (
            <div className="choice-screen-integrated">
              <div className="choice-screen-container">
                <h2 className="choice-title-screen">
                  {ganeshaFamily.find(m => m.id === sceneState.selectedCircle)?.id === 'myself'
                    ? "Who is Ganesha?"
                    : `Who is Ganesha's ${ganeshaFamily.find(m => m.id === sceneState.selectedCircle)?.role}?`
                  }
                </h2>
                <div className="choices-container-integrated">
                  {sceneState.currentChoices.map((choice, index) => (
                    <button
                      key={choice.id}
                      className={[
                        'choice-card-integrated',
                        sceneState.wrongChoice === choice.id ? 'wrong-shake' : '',
                        sceneState.disabledChoices.includes(choice.id) ? 'wrong-choice-locked' : '',
                        sceneState.correctChoiceId === choice.id && choice.isCorrect ? 'correct-card-hit' : ''
                      ].filter(Boolean).join(' ')}
                      onClick={() => handleChoiceSelection(choice)}
                      disabled={
                        sceneState.disabledChoices.includes(choice.id) ||
                        sceneState.wrongChoice !== null ||
                        sceneState.correctChoiceId !== null ||
                        sceneState.showYouGotIt !== null
                      }
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className={[
                        'choice-image-integrated',
                        choice.isCorrect && idleHintLevel === 1 ? 'idle-wobble' : '',
                        choice.isCorrect && idleHintLevel === 2 ? 'idle-glow' : '',
                        choice.isCorrect && idleHintLevel >= 3 ? 'idle-sparkle' : ''
                      ].filter(Boolean).join(' ')}>
                        <img src={choice.image} alt={choice.name} />
                      </div>
                      <div className="choice-name-integrated">{choice.name}</div>
                    </button>
                  ))}
                </div>

                {/* Ganesha thumbs-up — commented out (using voice-over only) */}
                {/* {sceneState.showYouGotIt && (
                  <div className="choice-thumbsup-cue" key={sceneState.showYouGotIt}>
                    <img src="/images/hand-thumbsup.svg" alt="" className="choice-thumbsup-icon" />
                  </div>
                )} */}
              </div>
            </div>
          )}

          {/* Fun fact modal — commented out (using flip card overlay instead) */}
          {sceneState.showFunFactModal && (
            <div className="modal-overlay modal-overlay-fade">
              <div className="fun-fact-modal fun-fact-modal-slide" data-from={sceneState.selectedCircle}>
                <button className="modal-close-btn" onClick={handleCloseFunFact}>×</button>
                <div className="modal-deity-image">
                  <img src={sceneState.showFunFactModal.image} alt={sceneState.showFunFactModal.name} />
                </div>
                <h3 className="modal-title">{sceneState.showFunFactModal.introTitle}</h3>
                <p className="modal-fact-text">{sceneState.showFunFactModal.introText}</p>
                <button className="modal-cool-btn" onClick={handleCloseFunFact}>Cool!</button>
              </div>
            </div>
          )}

          {sceneState.placedGaneshaMembers.length === ganeshaFamily.length && !sceneState.showFunFactModal && !sceneState.isSequencePlaying && (
            <button
              className="tree-done-btn done-btn-pulse"
              onClick={handleGaneshaTreeDone}
              disabled={sceneState.showTreeSparkles}
            >
              Continue
            </button>
          )}
        </>
      )}

      {/* SPARKLE LAYER */}
      <div className={`tree-sparkle-layer ${sceneState.showTreeSparkles ? 'active' : ''}`}>
        {sceneState.showTreeSparkles && [...Array(100)].map((_, i) => (
          <div
            key={i}
            className="tree-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.5 + Math.random()}s`
            }}
          />
        ))}
      </div>

      {/* BIG FLIP CARD OVERLAY */}
      {sceneState.flippedMember && (
        <div className="flip-card-overlay" onClick={() => {
          stopVoice(); // Stop voice-over when info card closes
          sceneActions.updateState({ flippedMember: null });
        }}>
          <div className="flip-card-big" onClick={() => {
            stopVoice(); // Stop voice-over when info card closes
            sceneActions.updateState({ flippedMember: null });
          }}>
            <div className="flip-card-deity">
              <img src={getPlacedDeityImage(sceneState.flippedMember).image} alt="Deity" />
            </div>
            <div className="flip-card-content">
              <h3 className="flip-card-title">{ganeshaFamily.find(m => m.id === sceneState.flippedMember)?.flipTitle}</h3>
              <p className="flip-card-fact">{ganeshaFamily.find(m => m.id === sceneState.flippedMember)?.funFact}</p>
            </div>
            <div className="flip-card-hint">Tap anywhere to close ✨</div>
          </div>
        </div>
      )}

      {/* TRANSITION PHASE */}
      {sceneState.gamePhase === 'transition' && (
        <div className="transition-modal-simple">
          <img src={babyGaneshaImg} alt="Ganesha" className="transition-ganesha-float" />
          <div className="transition-card-simple">
            <h2 className="transition-title">Your Turn!</h2>
            <p className="transition-text">
              Show me your family!
            </p>
            <VOGatedButton
              visible={transitionButtonVisible}
              className="continue-btn-simple"
              onClick={() => {
                stopVoice();
                playSfx('tap');
                setTransitionButtonVisible(false);
                sceneActions.updateState({ gamePhase: 'childInput' });
                scheduleTimeout(() => sceneActions.updateState({ showBottomTray: true }), 100);
              }}
            >
              Continue
            </VOGatedButton>
          </div>
        </div>
      )}

      {/* CHILD'S FAMILY INPUT */}
      {sceneState.gamePhase === 'childInput' && (
        <>
          <button className="back-btn" onClick={() => sceneActions.updateState({ gamePhase: 'transition' })}>← Back</button>
          <img src={familyTree} alt="Family Tree" className="tree-overlay child-tree-overlay" />

          {/* Header instruction commented out - using VO instead */}
          {/* {sceneState.childFamily.length < 3 && (
            <div className="instruction-text"><p>👇 "Tap someone to add to your tree!" 🌱!</p></div>
          )} */}
          {sceneState.childFamily.length > 0 && (
            <div className="tray-hint-text">Tap a member to delete</div>
          )}

          {/* Tree Display */}
          <div className="child-family-tree" onClick={() => sceneActions.updateState({ selectedMemberIndex: null })}>
            {[1, 2, 3].map(rowNum => (
              <div key={rowNum} className={`family-row row-${rowNum}`}>
                {getFamilyByRow(rowNum).map((member, idx) => {
                  const actualIdx = sceneState.childFamily.findIndex(m => m === member);
                  const isSelected = sceneState.selectedMemberIndex === actualIdx;
                  return (
                    <div key={idx} className="tree-member-small">
                      <div
                        className={`member-avatar-small ${isSelected ? 'selected-mode' : ''}`}
                        style={{ background: member.color, position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          sceneActions.updateState({ selectedMemberIndex: isSelected ? null : actualIdx });
                        }}
                      >
                        <img src={member.image} alt={member.label} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px' }} />
                        {isSelected && (
                          <button
                            className="delete-member-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMember(actualIdx);
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <div className="member-name-small">{member.callName}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* FLOATING DONE BUTTON (Moved Above Tray) */}
          {sceneState.childFamily.length > 0 && (
            <button
              className={`tray-done-btn ${sceneState.childFamily.length >= 21 ? 'tray-done-btn-attention' : ''}`}
              onClick={() => { playGlow(); sceneActions.updateState({ gamePhase: 'sideBySide' }); }}
            >
              <span className="tray-done-main">Done!</span>
              <span className="tray-done-sub">Finish Tree</span>
            </button>
          )}

          {/* BOTTOM TRAY (Centered & Padded) */}
          <div
            className={`bottom-member-tray ${sceneState.showBottomTray ? 'tray-visible' : ''}`}
            style={{
              justifyContent: 'center', // Center the items
              paddingLeft: '140px',     // Push items away from the "Back to Map" button
              paddingRight: '20px'      // Balance the padding
            }}
          >
            {familyMemberTypes.map(type => {
              // Count members in this type's row
              const rowCount = sceneState.childFamily.filter(m => m.row === type.row).length;
              const isRowFull = rowCount >= 7;

              return (
                <button
                  key={type.id}
                  className="member-card"
                  onClick={() => !isRowFull && handleSelectFamilyType(type)}
                  disabled={isRowFull}
                  style={{
                    borderColor: type.color,
                    opacity: isRowFull ? 0.4 : 1,
                    cursor: isRowFull ? 'not-allowed' : 'pointer'
                  }}
                >
                  <div className="member-card-icon-wrap">
                    <img src={type.image} alt={type.label} className="member-card-icon" />
                  </div>
                  <div className="member-card-label">{type.label}</div>
                </button>
              );
            })}
          </div>

          {/* Name Input Modal */}
          {sceneState.showNameModal && sceneState.currentFamilyType && (
            <div className="modal-overlay">
              <div className="name-input-modal">
                <button className="modal-close-btn" onClick={() => {
                  stopVoice(); // Stop VO when modal closes
                  sceneActions.updateState({ showNameModal: false });
                }}>×</button>
                <div className="modal-emoji-large" style={{ width: '100px', height: '100px', margin: '0 auto 15px' }}>
                  <img src={sceneState.currentFamilyType.image} alt={sceneState.currentFamilyType.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <h2 className="modal-question">
                  {getNamePromptQuestion(sceneState.currentFamilyType.id, sceneState.currentFamilyType.label)}
                </h2>
                <div className="input-with-voice">
                  <input
                    type="text"
                    className="name-input"
                    placeholder={getNamePromptPlaceholder(sceneState.currentFamilyType.id)}
                    value={sceneState.callName}
                    onChange={(e) => {
                      sceneActions.updateState({ callName: e.target.value });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && sceneState.callName.trim()) {
                        e.preventDefault();
                        handleAddFamilyMember();
                      }
                    }}
                    autoFocus
                  />
                  <button className={`voice-btn ${isRecording ? 'recording' : ''}`} onClick={isRecording ? stopRecording : startRecording}>
                    {isRecording ? '⏹️' : '🎤'}
                  </button>
                </div>
                {audioBlob && <p className="audio-recorded">✓ Voice recorded!</p>}
                <p className="input-hint">💡 Press Enter to add to tree</p>
                <button className="submit-name-btn" onClick={handleAddFamilyMember} disabled={!sceneState.callName.trim() && !audioBlob}>
                  Add to Tree! ✓
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* SIDE BY SIDE (Magical Reveal) */}
      {sceneState.gamePhase === 'sideBySide' && !sceneState.showingCompletionScreen && (
        <div className="side-by-side-screen">
          {[...Array(45)].map((_, i) => (
            <div
              key={i}
              className="final-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                width: `${Math.random() * 7 + 4}px`,
                height: `${Math.random() * 7 + 4}px`,
                opacity: `${Math.random() * 0.35 + 0.45}`
              }}
            />
          ))}

          <h1 className="reveal-title">Our Family Trees!</h1>
          <p className="reveal-subtitle">Connected by Love</p>

          <div className="two-trees-container">
            {/* LEFT CARD: Ganesha */}
            <div className="tree-column slide-in-left">
              <h3 className="tree-heading">Ganesha's Family</h3>
              <p className="tree-location">Mount Kailash</p>
              <div className="tree-visual">
                <img src={familyTree} alt="Tree" className="reveal-tree-img" />
                {ganeshaFamily.map(member => {
                  const deity = getPlacedDeityImage(member.id);
                  return (
                    <div key={member.id} className="tree-member-mini ganesha-comparison-icon" style={member.position}>
                      <div className="mini-image ganesha-comparison-img">
                        <img src={deity.image} alt={deity.name} className="ganesha-comparison-photo" />
                      </div>
                      <p className="mini-name ganesha-comparison-label">{member.role}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT CARD: Your Family */}
            <div className="tree-column slide-in-right">
              <h3 className="tree-heading">Your Family</h3>
              <p className="tree-location">Your Home</p>

              <div className="tree-visual" data-member-count={sceneState.childFamily.length}>
                <img src={familyTree} alt="Tree" className="reveal-tree-img" />
                {[1, 2, 3].map(rowNum => (
                  <div key={rowNum} className={`reveal-row reveal-row-${rowNum}`}>
                    {getFamilyByRow(rowNum).map((member, idx) => (
                      <div key={idx} className="reveal-member">
                        <div className="reveal-avatar" style={{ background: member.color, padding: '5px' }}>
                          <img src={member.image} alt={member.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div className="reveal-name">{member.callName}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="family-tree-end-game-btn" onClick={() => { playTwinkle(); sceneActions.updateState({ showingCompletionScreen: true, completed: true, stars: 3 }); }}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Resume Popup */}
      {/* Resume popup commented out
      {showResumePopup && (
        <div style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
      */}

      {/* Completion Modal */}
      {sceneState.showingCompletionScreen && (
        <SceneCompletionCelebration
          show={sceneState.showingCompletionScreen}
          zoneId="about-me-hut"
          sceneName="My Family Tree"
          completionTitle={completionModalContent?.title}
          completionSubtitle={completionModalContent?.subtitle}
          childName="Family Star"
          sceneId="family-tree"
          discoveredSymbols={completionIcons}
          symbolImages={{
            home: homeIconImg,
            heart: heartIconImg,
            family: familyIconImg
          }}
          nextSceneName="Let's Be Friends"
          completionData={{
            completed: true,
            stars: 3,
            childFamily: sceneState.childFamily || []
          }}
          onContinue={() => {
            if (onNavigate) onNavigate('scene-complete-continue');
            else if (onComplete) onComplete();
          }}
          onReplay={() => {
            audioEnabledRef.current = false;
            setAudioEnabled(false);
            setVoiceVolume(0);
            stopVoice();
            sceneActions.updateState({
              gamePhase: 'intro',
              placedGaneshaMembers: [],
              childFamily: [],
              showingCompletionScreen: false
            });
          }}
          onExploreZones={() => {
            if (onNavigate) onNavigate('zone-welcome');
            else if (onBack) onBack();
          }}
          onHome={() => {
            if (onNavigate) onNavigate('home');
          }}
        />
      )}
    </div>
  );
};

export default FamilyTreeGame;








