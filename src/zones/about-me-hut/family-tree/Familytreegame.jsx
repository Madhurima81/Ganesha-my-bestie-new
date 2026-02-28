import React, { useState, useRef, useEffect } from 'react';
import './Familytreegame.css';
import '../../shared/components/OpeningModal.css';
import SceneCompletionCelebration from "../../../lib/components/celebration/SceneCompletionCelebration";

// Import SceneManager & Navigation
import SceneManager from "../../../lib/components/scenes/SceneManager";
import BackToMapButton from '../../../lib/components/navigation/BackToMapButton';

// Voice Guidance Hook
import useVoiceGuidance from '../../../lib/hooks/useVoiceGuidance';

// Pause Menu Components
import { PauseButton, PauseMenu, PauseBlurOverlay, usePauseEnhancements } from '../../../lib/components/ui/PauseMenu';

// Content Configs
import { getOpeningModal } from '../../../lib/config/content';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';

// --- IMPORT ASSETS (Ganesha's Family & Distractors) ---
import familyTreeBg from './assets/images/family tree bg.png';
import familyTree from './assets/images/family-tree.png';

// Correct Answers
import babyGaneshaImg from './assets/images/ganesha/family-ganesha.png';
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

  // IMPORTANT: Ensure phase exists (just like Modak code)
  if (!sceneState?.gamePhase) {
    sceneActions.updateState({ gamePhase: 'intro' });
  }

  // ========================================
  // VOICE GUIDANCE HOOK
  // ========================================
  const {
    playVoice,
    stopVoice,
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
    musicVolume: 0.2,
    voiceVolume: 1,
    sfxVolume: 0.7,
    idleTimeout: 10
  });

  // ========================================
  // PAUSE MENU STATE
  // ========================================
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);

  // ========================================
  // PAUSE MENU ENHANCEMENTS (ESC + AUTO-PAUSE + BLUR)
  // ========================================
  usePauseEnhancements(
    showPauseMenu,
    setShowPauseMenu,
    () => {
      // On pause: Stop VOs, timers, and block wrong-choice animations
      isPausedRef.current = true;
      clearScheduledTimeouts();
      stopIdleTimer();
      stopVoice();
      setIsPlayingWrongVO(false); // Unblock taps if pause interrupted wrong-choice VO

      // Clear name prompt timer if active
      if (namePromptTimerRef.current) {
        clearTimeout(namePromptTimerRef.current);
        namePromptTimerRef.current = null;
      }
    },
    () => {
      // On resume: Restart game if active
      isPausedRef.current = false;
      stopVoice(); // Ensure no stale VO resumes from before pause
      setIsPlayingWrongVO(false);

      // Handle phase-specific resume logic
      if (sceneState.gamePhase === 'transition') {
        // If transition VO was interrupted, keep the CTA available
        setTransitionButtonVisible(true);
      }

      if (sceneState.gamePhase === 'ganeshaTree') {
        // Defensive unlock in case pause interrupted a VO callback chain or wrong choice animation
        if (sceneState.wrongChoice && !sceneState.disabledChoices.includes(sceneState.wrongChoice)) {
          sceneActions.updateState({
            disabledChoices: [...sceneState.disabledChoices, sceneState.wrongChoice],
            wrongChoice: null,
            correctChoiceId: null,
            showYouGotIt: null,
            isSequencePlaying: false
          });
        } else {
          // Clear all animation states to re-enable buttons
          sceneActions.updateState({
            isSequencePlaying: false,
            showYouGotIt: null,
            wrongChoice: null,
            correctChoiceId: null
          });
        }
      }

      // Handle name input modal idle timer restart (for 4th+ time)
      if (sceneState.gamePhase === 'childInput' && sceneState.showNameModal && namePromptCount >= 4) {
        if (namePromptTimerRef.current) {
          clearTimeout(namePromptTimerRef.current);
        }
        namePromptTimerRef.current = scheduleTimeout(() => {
          playVoice('namePromptShort');
        }, 10000);
      }

      // Restart idle timer if we're in an active phase
      if (sceneState.gamePhase === 'ganeshaTree' || sceneState.gamePhase === 'childInput') {
        startIdleTimer();
      }
    },
    {
      gameActive: sceneState.gamePhase !== 'intro' && !sceneState.showingCompletionScreen,
      allowEsc: true,
      allowAutoPause: true
    }
  );

  // ========================================
  // VO-GATED BUTTON STATE
  // ========================================
  const [openingButtonVisible, setOpeningButtonVisible] = useState(false);

  // ========================================
  // GANESHA PHASE VO STATE
  // ========================================
  const [choiceModalPlayed, setChoiceModalPlayed] = useState(false);
  const [funFactModalPlayed, setFunFactModalPlayed] = useState(false);
  const [infoModalPlayed, setInfoModalPlayed] = useState(false);
  const [isPlayingWrongVO, setIsPlayingWrongVO] = useState(false); // Block taps during wrong choice VO

  // ========================================
  // TRANSITION & CHILD PHASE VO STATE
  // ========================================
  const [transitionButtonVisible, setTransitionButtonVisible] = useState(false);
  const [childStartPlayed, setChildStartPlayed] = useState(false);
  const [namePromptPlayed, setNamePromptPlayed] = useState(false);
  const [namePromptCount, setNamePromptCount] = useState(0); // Track how many times name modal opened (1-2-3 Rule)
  const [childProgressCount, setChildProgressCount] = useState(0); // Track which progress VO to play
  const namePromptTimerRef = useRef(null); // Idle timer for name prompt replay

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
  const ganeshaIdleHintTimerRef = useRef(null);
  const childIdleVOTimerRef = useRef(null);

  const clearScheduledTimeouts = () => {
    scheduledTimeoutsRef.current.forEach((id) => clearTimeout(id));
    scheduledTimeoutsRef.current = [];
  };

  const scheduleTimeout = (fn, delay) => {
    const id = window.setTimeout(() => {
      scheduledTimeoutsRef.current = scheduledTimeoutsRef.current.filter((t) => t !== id);
      if (isPausedRef.current) return;
      fn();
    }, delay);
    scheduledTimeoutsRef.current.push(id);
    return id;
  };

  // --- DATA DEFINITIONS ---
  const ganeshaFamily = [
    {
      id: 'father', role: 'Father', correctAnswer: 'shiva',
      position: { top: '30%', left: '35%' },
      introTitle: '🔱 My Father!', introText: 'He is calm and strong 🕉️',
      flipTitle: 'My Father', funFact: 'My father is calm and strong. He protects us and teaches me peace 🕉️'
    },
    {
      id: 'mother', role: 'Mother', correctAnswer: 'parvati',
      position: { top: '30%', right: '25%' },
      introTitle: '🌸 My Mother!', introText: 'She is kind and loving 💗',
      flipTitle: 'My Mother', funFact: 'My mother is kind and loving. She gives the best hugs and keeps me safe 💗'
    },
    {
      id: 'brother', role: 'Brother', correctAnswer: 'kartikeya',
      position: { bottom: '25%', left: '45%' },
      introTitle: '🦚 My Brother!', introText: 'He is brave and fast 🦚',
      flipTitle: 'My Brother', funFact: 'My brother is very brave. He travels the world on his peacock 🦚'
    },
     {
      id: 'myself', role: 'Me', correctAnswer: 'ganesha',
      position: { bottom: '25%', right: '30%' },
      introTitle: "😊 That's Me!", introText: 'I love modaks 🍬',
      flipTitle: 'Me', funFact: "That's me! I love modaks and helping my friends 😊"
    }
  ];

  const deityChoices = {
    father: [
      { id: 'shiva', name: 'Shiva Ji', image: shivaImg, type: 'img', isCorrect: true },
      { id: 'vishnu', name: 'Vishnu Ji', image: vishnuImg, type: 'img', isCorrect: false },
      { id: 'brahma', name: 'Brahma Ji', image: brahmaImg, type: 'img', isCorrect: false }
    ],
    mother: [
      { id: 'parvati', name: 'Parvati Mata', image: parvatiImg, type: 'img', isCorrect: true },
      { id: 'lakshmi', name: 'Lakshmi Mata', image: lakshmiImg, type: 'img', isCorrect: false },
      { id: 'saraswati', name: 'Saraswati Mata', image: saraswatiImg, type: 'img', isCorrect: false }
    ],
    brother: [
      { id: 'kartikeya', name: 'Kartikeya', image: kartikeyaImg, type: 'img', isCorrect: true },
      { id: 'hanuman', name: 'Hanuman Ji', image: hanumanImg, type: 'img', isCorrect: false },
      { id: 'krishna', name: 'Krishna Ji', image: krishnaImg, type: 'img', isCorrect: false }
    ],
    myself: [
      { id: 'ganesha', name: 'Ganesha', image: babyGaneshaImg, type: 'img', isCorrect: true },
      { id: 'mushak', name: 'Mushak', image: mouseImg, type: 'img', isCorrect: false },
      { id: 'kartikeya', name: 'Kartikeya', image: kartikeyaImg, type: 'img', isCorrect: false }
    ]
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
        setResumeMessage(`Amazing! You completed Ganesha's family tree! Tap "All Done!" to continue.`);
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
  // Button appears only after VO finishes
  // ========================================
  useEffect(() => {
    // Play welcome voice when opening modal is shown (phase is intro)
    if (sceneState.gamePhase === 'intro') {
      // Small delay before starting welcome VO
      const timer = scheduleTimeout(() => {
        playVoice('welcome', () => {
          // VO finished - show the button with fade-in
          playSfx('chime'); // Ready cue sound
          setOpeningButtonVisible(true);
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [sceneState.gamePhase]);

  // ========================================
  // CLEANUP: Stop music and timers on unmount
  // ========================================
  useEffect(() => {
    return () => {
      clearScheduledTimeouts();
      stopMusic();
      stopIdleTimer();
      if (childIdleVOTimerRef.current) {
        clearTimeout(childIdleVOTimerRef.current);
        childIdleVOTimerRef.current = null;
      }
    };
  }, []);

  // ========================================
  // GANESHA PHASE: Play tap circle instruction when phase starts
  // ========================================
  useEffect(() => {
    if (sceneState.gamePhase === 'ganeshaTree') {
      // Play tap circle instruction VO
      scheduleTimeout(() => {
        playVoice('tapCircle');
      }, 500);
    }
  }, [sceneState.gamePhase]);

  // ========================================
  // GANESHA PHASE: Play question VO when choice modal opens
  // ========================================
  useEffect(() => {
    if (sceneState.showChoiceModal && sceneState.selectedCircle && !choiceModalPlayed) {
      setChoiceModalPlayed(true);

      // Map circleId to VO file
      const questionVOMap = {
        'father': 'whoFather',
        'mother': 'whoMother',
        'brother': 'whoBrother',
        'myself': 'whoMyself'
      };

      const voKey = questionVOMap[sceneState.selectedCircle];
      if (voKey) {
        scheduleTimeout(() => {
          playVoice(voKey);
        }, 300);
      }
    }
  }, [sceneState.showChoiceModal, sceneState.selectedCircle, choiceModalPlayed]);

  // ========================================
  // GANESHA PHASE: Play fun fact VO when modal opens
  // ========================================
  useEffect(() => {
    if (sceneState.showFunFactModal && !funFactModalPlayed) {
      setFunFactModalPlayed(true);

      // Map member id to fun fact VO
      const funFactVOMap = {
        'father': 'factFather',
        'mother': 'factMother',
        'brother': 'factBrother',
        'myself': 'factMyself'
      };

      const voKey = funFactVOMap[sceneState.selectedCircle];
      if (voKey) {
        scheduleTimeout(() => {
          playVoice(voKey);
        }, 300);
      }
    }
  }, [sceneState.showFunFactModal, funFactModalPlayed]);

  // ========================================
  // GANESHA PHASE: Play info VO when tapping placed member (flipped card)
  // ========================================
  useEffect(() => {
    if (sceneState.flippedMember && !infoModalPlayed) {
      setInfoModalPlayed(true);

      // Map member id to info VO
      const infoVOMap = {
        'father': 'infoFather',
        'mother': 'infoMother',
        'brother': 'infoBrother',
        'myself': 'infoMyself'
      };

      const voKey = infoVOMap[sceneState.flippedMember];
      if (voKey) {
        scheduleTimeout(() => {
          playVoice(voKey);
        }, 300);
      }
    } else if (!sceneState.flippedMember) {
      // Reset when card is unflipped
      setInfoModalPlayed(false);
    }
  }, [sceneState.flippedMember, infoModalPlayed]);

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
      // Play "all placed" VO when button becomes visible
      scheduleTimeout(() => {
        playVoice('allPlaced');
      }, 500);
    }
  }, [
    sceneState.gamePhase,
    sceneState.placedGaneshaMembers.length,
    sceneState.showFunFactModal,
    sceneState.isSequencePlaying
  ]);

  // ========================================
  // TRANSITION PHASE: Play transition VO
  // ========================================
  useEffect(() => {
    if (sceneState.gamePhase === 'transition') {
      setTransitionButtonVisible(false);
      stopVoice();

      scheduleTimeout(() => {
        playVoice('transition', () => {
          playSfx('chime');
          setTransitionButtonVisible(true);
        });
      }, 500);
    }
  }, [sceneState.gamePhase]);

  // ========================================
  // CHILD PHASE: Play child start VO when phase begins
  // ========================================
  useEffect(() => {
    if (sceneState.gamePhase === 'childInput' && !childStartPlayed) {
      setChildStartPlayed(true);
      stopVoice();

      scheduleTimeout(() => {
        playVoice('childStart');
      }, 500);
    }
  }, [sceneState.gamePhase, childStartPlayed]);

  // ========================================
  // GANESHA TREE: Idle hint VO
  // First hint: 10s when 0 placed, otherwise 15s
  // Then repeat every 15s while still idle/tappable
  // ========================================
  useEffect(() => {
    if (ganeshaIdleHintTimerRef.current) {
      clearTimeout(ganeshaIdleHintTimerRef.current);
      ganeshaIdleHintTimerRef.current = null;
    }

    const inGaneshaTree = sceneState.gamePhase === 'ganeshaTree';
    const hasBlockingOverlay =
      sceneState.showChoiceModal ||
      sceneState.showFunFactModal ||
      sceneState.flippedMember ||
      sceneState.isSequencePlaying ||
      showPauseMenu;
    const allPlaced = sceneState.placedGaneshaMembers.length === ganeshaFamily.length;

    if (!inGaneshaTree || hasBlockingOverlay || allPlaced) return;

    const firstDelay = sceneState.placedGaneshaMembers.length === 0 ? 10000 : 15000;

    const scheduleNextHint = (delayMs) => {
      ganeshaIdleHintTimerRef.current = scheduleTimeout(() => {
        playVoice('hintTap');
        scheduleNextHint(15000);
      }, delayMs);
    };

    scheduleNextHint(firstDelay);

    return () => {
      if (ganeshaIdleHintTimerRef.current) {
        clearTimeout(ganeshaIdleHintTimerRef.current);
        ganeshaIdleHintTimerRef.current = null;
      }
    };
  }, [
    sceneState.gamePhase,
    sceneState.showChoiceModal,
    sceneState.showFunFactModal,
    sceneState.flippedMember,
    sceneState.isSequencePlaying,
    sceneState.placedGaneshaMembers.length,
    showPauseMenu
  ]);

  // ========================================
  // CHILD TREE: Idle hint VO (15s, repeating like ganesha)
  // ========================================
  useEffect(() => {
    if (childIdleVOTimerRef.current) {
      clearTimeout(childIdleVOTimerRef.current);
      childIdleVOTimerRef.current = null;
    }

    const inChildInput = sceneState.gamePhase === 'childInput';
    const hasBlockingOverlay = sceneState.showNameModal || showPauseMenu;
    const isChildTreeComplete = sceneState.childFamily.length >= 21;

    if (!inChildInput || hasBlockingOverlay || isChildTreeComplete) return;

    const scheduleNextHint = () => {
      childIdleVOTimerRef.current = scheduleTimeout(() => {
        playVoice('childHint');
        scheduleNextHint();
      }, 15000);
    };

    scheduleNextHint();

    return () => {
      if (childIdleVOTimerRef.current) {
        clearTimeout(childIdleVOTimerRef.current);
        childIdleVOTimerRef.current = null;
      }
    };
  }, [
    sceneState.gamePhase,
    sceneState.showNameModal,
    sceneState.childFamily.length,
    sceneState.selectedMemberIndex,
    showPauseMenu
  ]);

  // ========================================
  // CHILD PHASE: Play name prompt VO when name modal opens
  // Rule:
  // 1st-2nd open -> immediate full prompt
  // 3rd open -> immediate short prompt
  // 4th+ open -> only idle short prompt after 10s
  // ========================================
  useEffect(() => {
    // Clear any existing timer when modal state changes
    if (namePromptTimerRef.current) {
      clearTimeout(namePromptTimerRef.current);
      namePromptTimerRef.current = null;
    }

    if (sceneState.showNameModal && sceneState.currentFamilyType && !namePromptPlayed) {
      setNamePromptPlayed(true);

      // Increment the counter
      const newCount = namePromptCount + 1;
      setNamePromptCount(newCount);

      // 1st-2nd: full prompt immediately
      if (newCount === 1 || newCount === 2) {
        scheduleTimeout(() => {
          playVoice('namePrompt');
        }, 300);
      }

      // 3rd: short prompt immediately
      if (newCount === 3) {
        scheduleTimeout(() => {
          playVoice('namePromptShort');
        }, 300);
      }

      // 4th+: only play short prompt after 10s idle (using scheduleTimeout for pause-awareness)
      if (newCount >= 4) {
        namePromptTimerRef.current = scheduleTimeout(() => {
          playVoice('namePromptShort');
        }, 10000);
      }
    }

    // Cleanup timer when modal closes
    return () => {
      if (namePromptTimerRef.current) {
        clearTimeout(namePromptTimerRef.current);
        namePromptTimerRef.current = null;
      }
    };
  }, [sceneState.showNameModal, sceneState.currentFamilyType]);

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

      // Play final reveal VO
      scheduleTimeout(() => {
        playVoice('finalReveal', () => {
          // After final reveal, wait briefly, then play second VO directly (no celebration SFX)
          scheduleTimeout(() => {
            playVoice('sceneComplete');
          }, 500);
        });
      }, 500);
    }
  }, [sceneState.gamePhase, finalRevealPlayed]);

  // --- EVENT HANDLERS (Using sceneActions) ---
  const handleStartGame = () => {
    // Start background music
    startMusic();

    // Transition to game
    sceneActions.updateState({ gamePhase: 'ganeshaTree' });
  };

  const handleClickCircle = (circleId) => {
    if (sceneState.isSequencePlaying) return;
    if (sceneState.showFunFactModal || sceneState.showChoiceModal) return;

    // Check if already placed (Using Array.includes instead of Set.has)
    if (sceneState.placedGaneshaMembers.includes(circleId)) {
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

    // Open modal
    sceneActions.updateState({
      disabledChoices: [],
      selectedCircle: circleId,
      currentChoices: shuffleArray(deityChoices[circleId]),
      showChoiceModal: true,
      wrongChoice: null
    });

    // Reset choice modal VO state
    setChoiceModalPlayed(false);
  };

  const handleChoiceSelection = (choice) => {
    // Block if wrong VO is currently playing
    if (isPlayingWrongVO) return;

    // Stop any playing VO
    stopVoice();
    playTap();
    recordInteraction();

    if (choice.isCorrect) {
      // Play deity name VO
      const deityVOMap = {
        'shiva': 'shiva',      // Maps to shiva.wav
        'parvati': 'parvati',  // Maps to parvati-mata.wav
        'kartikeya': 'kartikeya', // Maps to kartikeya.wav
        'ganesha': 'ganesha'   // Maps to ganesha.wav
      };

      const deityVO = deityVOMap[choice.id];
      if (deityVO) {
        playVoice(deityVO);
      }

      // Play correct choice VO after deity name (increased delay to let deity name finish)
      scheduleTimeout(() => {
        playCorrect('correctChoice');
      }, 1800);

      sceneActions.updateState({ isSequencePlaying: true, showYouGotIt: choice.id });
      scheduleTimeout(() => sceneActions.updateState({ correctChoiceId: choice.id }), 800);
      scheduleTimeout(() => sceneActions.updateState({ showYouGotIt: null }), 1400);
      scheduleTimeout(() => {
        sceneActions.updateState({
          showChoiceModal: false,
          placedGaneshaMembers: [...sceneState.placedGaneshaMembers, sceneState.selectedCircle],
          correctChoiceId: null
        });
      }, 1600);
      scheduleTimeout(() => sceneActions.updateState({ justPlacedId: sceneState.selectedCircle }), 1700);
      scheduleTimeout(() => {
        const member = ganeshaFamily.find(m => m.id === sceneState.selectedCircle);
        const correctDeity = deityChoices[sceneState.selectedCircle].find(d => d.isCorrect);
        sceneActions.updateState({
          showFunFactModal: { ...member, ...correctDeity },
          justPlacedId: null
        });
        // Reset fun fact modal VO state
        setFunFactModalPlayed(false);
      }, 3800); // Increased delay to let "correct choice" VO finish before fun fact plays
    } else {
      // WRONG CHOICE - Simple Flow with blocking:
      // 1. Block further taps
      // 2. Play deity name → Wait 1s → Play wrong choice VO → Shake + fade
      // 3. Unblock taps

      // Block taps during wrong VO sequence
      setIsPlayingWrongVO(true);

      const wrongDeityVOMap = {
        'vishnu': 'vishnu',      // Maps to vishnu.wav
        'brahma': 'brahma',      // Maps to brahma.wav
        'lakshmi': 'lakshmi',    // Maps to lakshmi-mata.wav
        'saraswati': 'saraswati', // Maps to saraswati-mata.wav
        'hanuman': 'hanuman',    // Maps to hanuman.wav
        'krishna': 'krishna',    // Maps to krishna.wav
        'mushak': 'mushak',      // Maps to mushak.wav
        'kartikeya': 'kartikeya' // Maps to kartikeya.wav (when wrong choice for "myself")
      };

      const wrongDeityVO = wrongDeityVOMap[choice.id];

      // Step 1: Play deity name VO with callback
      if (wrongDeityVO) {
        playVoice(wrongDeityVO, () => {
          // Step 2: After deity name finishes, wait 1 second
          scheduleTimeout(() => {
            // Step 3: Play wrong choice VO with callback
            playVoice('wrongChoice', () => {
              // Step 4: Unblock taps after both VOs finish
              setIsPlayingWrongVO(false);
            });

            // Trigger shake/fade animation
            sceneActions.updateState({ wrongChoice: choice.id });

            // Clear animation and disable choice after fade completes
            scheduleTimeout(() => {
              sceneActions.updateState({
                wrongChoice: null,
                disabledChoices: [...sceneState.disabledChoices, choice.id]
              });
            }, 1500);
          }, 1000);
        });
      }
    }
  };

  const handleCloseFunFact = () => {
    sceneActions.updateState({ showFunFactModal: null, isSequencePlaying: false });

    // Play progress VO after closing fun fact modal
    const placedCount = sceneState.placedGaneshaMembers.length + 1; // +1 because we just placed one

    if (placedCount === 1) {
      scheduleTimeout(() => playVoice('progressFirst'), 300);
    } else if (placedCount === 2) {
      scheduleTimeout(() => playVoice('progressMid'), 300);
    } else if (placedCount === 3) {
      scheduleTimeout(() => playVoice('progressNearFull'), 300);
    } else if (placedCount === 4) {
      // Will play when "All Done" button appears
    }
  };

  const handleGaneshaTreeDone = () => {
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
    stopVoice();
    playTap();
    recordInteraction();

    sceneActions.updateState({
      currentFamilyType: type,
      callName: '',
      showNameModal: true
    });
    setAudioBlob(null);
    setNamePromptPlayed(false); // Reset for new modal
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

      // Row completion VO only when a new row completes and it's 1st or 2nd completed row
      if (newlyCompletedRow && completedRowsAfter > completedRowsBefore && completedRowsAfter <= 2) {
        if (newlyCompletedRow === 1) playVoice('rowLimitGrandparents');
        else if (newlyCompletedRow === 2) playVoice('rowLimitElders');
        else if (newlyCompletedRow === 3) playVoice('rowLimitSiblingsPets');
      }
      // Progress milestones (1, 5, 10, 16, 21)
      else if (memberCount === 1) {
        playVoice('childProgressStart'); // "Nice! Your tree has started growing."
      } else if (memberCount === 5) {
        playVoice('childProgressSmall'); // "Beautiful! You added someone to your family tree."
      } else if (memberCount === 10) {
        playVoice('childProgressMid'); // "Look at that! Your family tree is getting bigger."
      } else if (memberCount === 16) {
        playVoice('childProgressNearFull'); // "Mmm. Your tree is filling with love."
      } else if (memberCount === 21) {
        playVoice('childProgressComplete'); // "Aha! Your family tree is full of love!"
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

      {/* Pause Button - Visible after intro */}
      <PauseButton
        visible={sceneState.gamePhase !== 'intro'}
        onClick={() => setShowPauseMenu(true)}
      />

      {/* Visual Blur Overlay */}
      <PauseBlurOverlay show={showPauseMenu} />

      {/* Pause Menu */}
      <PauseMenu
        show={showPauseMenu}
        onResume={() => setShowPauseMenu(false)}
        onBackToMap={() => {
          setShowPauseMenu(false);
          stopMusic();
          onNavigate?.('zones');
        }}
        isSoundOn={isSoundOn}
        onSoundToggle={() => {
          setIsSoundOn(!isSoundOn);
          if (isSoundOn) {
            stopMusic();
          } else {
            startMusic();
          }
        }}
        zoneName="About Me Hut"
      />

      {/* Back to Map Button - Commented out like in Modak */}
      {/* {!sceneState.showingCompletionScreen && (
        <BackToMapButton onNavigate={onNavigate} />
      )} */}

      {/* INTRO PHASE */}
      {sceneState.gamePhase === 'intro' && (
         <>
          <div className="ganesha-tree-wrapper">
            <img src={familyTree} alt="Family Tree" className="tree-overlay" />
          </div>
        <div className="game-modal-overlay" id="family-tree-intro" style={(() => { const theme = getZoneTheme('about-me-hut'); return { '--modal-card-bg': theme.parentBg, '--modal-text-primary': theme.textPrimary, '--modal-btn-bg': theme.buttonActiveBg, '--modal-btn-shadow': theme.glowColor }; })()}>
          <div className="game-modal-content">
            <div className="game-modal-character">
              <img src={babyGaneshaImg} alt="Baby Ganesha" />
            </div>
            <div className="game-modal-card">
              <h1 className="game-modal-title">{openingModalContent?.title || 'Meet My Family'}</h1>
              <p className="game-modal-subtitle">
                {openingModalContent?.description || "After that, I'd love to meet yours too."}
              </p>
              <div className="game-modal-icons">
                <div className="game-modal-icon-item">
                  <img src={shivaImg} alt="Father" />
                  <span className="game-modal-icon-label">Father</span>
                </div>
                <div className="game-modal-icon-item">
                  <img src={parvatiImg} alt="Mother" />
                  <span className="game-modal-icon-label">Mother</span>
                </div>
                <div className="game-modal-icon-item">
                  <img src={kartikeyaImg} alt="Brother" />
                  <span className="game-modal-icon-label">Brother</span>
                </div>
              </div>
              <VOGatedButton
                visible={openingButtonVisible}
                onClick={() => {
                  playSfx('tap');
                  setOpeningButtonVisible(false);
                  handleStartGame();
                }}
                className="game-modal-button"
              >
                {openingModalContent?.buttonText || 'Meet My Family! 🌟'}
              </VOGatedButton>
            </div>
          </div>
        </div>
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

          <img src={familyTree} alt="Family Tree" className="tree-overlay" />

          {ganeshaFamily.map(member => (
            <div
              key={member.id}
              className={`circle-spot-with-label ${sceneState.isSequencePlaying ? 'blocked' : ''}`}
              style={member.position}
              onClick={() => handleClickCircle(member.id)}
            >
              {!sceneState.placedGaneshaMembers.includes(member.id) ? (
                <div className={`empty-circle ${!sceneState.isSequencePlaying ? 'empty-circle-hint-glow' : ''}`} />
              ) : (
                <div className={`placed-deity ${sceneState.justPlacedId === member.id ? 'just-placed-glow' : ''}`}>
                  <div className="deity-front">
                    <div className="deity-circle">
                      <img src={getPlacedDeityImage(member.id).image} alt="Deity" className="deity-image" />
                    </div>
                    {!sceneState.tappedMembers.includes(member.id) && (
                      <div className="tap-to-learn">👆 Tap!</div>
                    )}    
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
          ))}

          {sceneState.showChoiceModal && (
            <div className="modal-overlay" >
              <div className="choice-modal">
                <button className="modal-close-btn" onClick={() => sceneActions.updateState({ showChoiceModal: false })}>×</button>
                <h2 className="choice-title">
                  {ganeshaFamily.find(m => m.id === sceneState.selectedCircle)?.id === 'myself' 
                    ? "Who is Ganesha? 🤔" 
                    : `Who is Ganesha's ${ganeshaFamily.find(m => m.id === sceneState.selectedCircle)?.role}? 🤔`
                  }
                </h2>
                <div className="choice-options">
                  {sceneState.currentChoices.map(choice => (
                    <button
                      key={choice.id}
                      className={`choice-card ${sceneState.wrongChoice === choice.id ? 'wrong-shake' : ''} ${sceneState.correctChoiceId === choice.id && choice.isCorrect ? 'correct-card-hit' : ''}`}
                      onClick={() => handleChoiceSelection(choice)}
                      disabled={
                        sceneState.disabledChoices.includes(choice.id) ||
                        sceneState.wrongChoice !== null ||
                        sceneState.correctChoiceId !== null ||
                        sceneState.showYouGotIt !== null
                      }
                    >  
                      <div className="choice-image">
                        <img src={choice.image} alt={choice.name} />
                      </div>
                      <div className="family-choice-name">{choice.name}</div>

                      {/* "You got it!" text removed - using VO only */}
                      
                      {sceneState.correctChoiceId === choice.id && (
                        <div className="correct-checkmark">
                          <div className="checkmark-circle"><div className="checkmark-icon">✓</div></div>
                        </div>
                      )}
                      
                      {sceneState.correctChoiceId === choice.id && (
                        <div className="card-sparkles">
                          <span className="sparkle sparkle-1">✨</span>
                          <span className="sparkle sparkle-2">✨</span>
                          <span className="sparkle sparkle-3">✨</span>
                          <span className="sparkle sparkle-4">✨</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {/* Wrong feedback text removed - using VO only */}
              </div>
            </div>
          )}

          {sceneState.showFunFactModal && (
            <div className="modal-overlay modal-overlay-fade">
              <div className="fun-fact-modal fun-fact-modal-slide" data-from={sceneState.selectedCircle}>
                <button className="modal-close-btn" onClick={handleCloseFunFact}>×</button>
                <div className="modal-deity-image">
                  <img src={sceneState.showFunFactModal.image} alt={sceneState.showFunFactModal.name} />
                </div>
                <h3 className="modal-title">{sceneState.showFunFactModal.introTitle}</h3>
                <p className="modal-fact-text">{sceneState.showFunFactModal.introText}</p>
                <button className="modal-cool-btn" onClick={handleCloseFunFact}>Cool! ✨</button>
              </div>
            </div>
          )}

          {sceneState.placedGaneshaMembers.length === ganeshaFamily.length && !sceneState.showFunFactModal && !sceneState.isSequencePlaying && (
            <button className="tree-done-btn done-btn-pulse" onClick={handleGaneshaTreeDone}>
              All Done! ✨
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
              That's my family! Now, I want to see your world.<br/>
              Who are the special people in your house?
            </p>
            <VOGatedButton
              visible={transitionButtonVisible}
              className="continue-btn-simple"
              onClick={() => {
                playSfx('tap');
                setTransitionButtonVisible(false);
                sceneActions.updateState({ gamePhase: 'childInput' });
                scheduleTimeout(() => sceneActions.updateState({ showBottomTray: true }), 100);
                // Reset child start VO state
                setChildStartPlayed(false);
              }}
            >
             Add My Family! 🏠
            </VOGatedButton>
          </div>
        </div>
      )}

     {/* CHILD'S FAMILY INPUT */}
      {sceneState.gamePhase === 'childInput' && (
        <>
          <button className="back-btn" onClick={() => sceneActions.updateState({ gamePhase: 'transition' })}>← Back</button>
          <img src={familyTree} alt="Family Tree" className="tree-overlay" />

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
              onClick={() => sceneActions.updateState({ gamePhase: 'sideBySide' })}
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
                      // Reset idle short-prompt timer while typing
                      if (namePromptTimerRef.current) {
                        clearTimeout(namePromptTimerRef.current);
                        namePromptTimerRef.current = null;
                      }
                      // From 4th open onward, replay short prompt only after 10s idle (using scheduleTimeout for pause-awareness)
                      if (sceneState.showNameModal && namePromptCount >= 4) {
                        namePromptTimerRef.current = scheduleTimeout(() => {
                          playVoice('namePromptShort');
                        }, 10000);
                      }
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
      {sceneState.gamePhase === 'sideBySide' && (
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

          <h1 className="reveal-title">Look at Our Family Trees!</h1>
          <p className="reveal-subtitle">Connected by Love 💛</p>
          
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

            {/* MIDDLE: Magic Connector */}
            <div className="magic-connector">
              <span className="connector-heart">❤️</span>
              <span className="connector-heart">💖</span>
              <span className="connector-heart">✨</span>
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
            <button className="make-another-btn" onClick={() => sceneActions.updateState({ childFamily: [], gamePhase: 'childInput' })}>
              🌳 Make Another Tree
            </button>
            <button className="family-tree-end-game-btn" onClick={() => sceneActions.updateState({ showingCompletionScreen: true, completed: true, stars: 3 })}>
              End Game ✨
            </button>
          </div>
        </div>
      )}

      {/* Resume Popup */}
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

      {/* Completion Modal */}
      {sceneState.showingCompletionScreen && (
        <SceneCompletionCelebration
          show={sceneState.showingCompletionScreen}
          zoneId="about-me-hut"
          sceneName="My Family Tree"
          childName="Family Star"
          sceneId="family-tree"
          discoveredSymbols={['father', 'mother', 'me']}
          symbolImages={{
            father: shivaImg,
            mother: parvatiImg,
            me: babyGaneshaImg
          }}
          nextSceneName="Favorite Food"
          onContinue={() => {
            if (onNavigate) onNavigate('game2'); 
            else if (onComplete) onComplete();
          }}
          onReplay={() => {
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










