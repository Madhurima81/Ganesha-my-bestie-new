import React, { useState, useRef, useEffect } from 'react';
import './Familytreegame.css';
import '../../shared/components/OpeningModal.css';
import AboutMeCompletion from "../components/Aboutmecompletion";

// Import SceneManager & Navigation
import SceneManager from "../../../lib/components/scenes/SceneManager";
import BackToMapButton from '../../../lib/components/navigation/BackToMapButton';

// Voice Guidance Hook
import useVoiceGuidance from '../../../lib/hooks/useVoiceGuidance';

// Pause Menu Components
import { PauseButton, PauseMenu } from '../../../lib/components/ui/PauseMenu';

// Content Configs
import { getOpeningModal } from '../../../lib/config/content';

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
      introTitle: '😊 That’s Me!', introText: 'I love modaks 🍬',
      flipTitle: 'Me', funFact: 'That’s me! I love modaks and helping my friends 😊'
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
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }
      
      // 3. GANESHA TREE - All placed
      if (gamePhase === 'ganeshaTree' && placedGaneshaMembers && placedGaneshaMembers.length === 4) {
        setResumeMessage(`Amazing! You completed Ganesha's family tree! Tap "All Done!" to continue.`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }
      
      // 4. CHILD INPUT - Some added
      if (gamePhase === 'childInput' && childFamily && childFamily.length > 0) {
        setResumeMessage(`You've added ${childFamily.length} family member${childFamily.length > 1 ? 's' : ''} to your tree!`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
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

  // ========================================
  // VOICE: Play welcome on OPENING MODAL (before game starts)
  // Button appears only after VO finishes
  // ========================================
  useEffect(() => {
    // Play welcome voice when opening modal is shown (phase is intro)
    if (sceneState.gamePhase === 'intro') {
      // Small delay before starting welcome VO
      const timer = setTimeout(() => {
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
      stopMusic();
      stopIdleTimer();
    };
  }, []);

  // ========================================
  // GANESHA PHASE: Play tap circle instruction when phase starts
  // ========================================
  useEffect(() => {
    if (sceneState.gamePhase === 'ganeshaTree') {
      // Play tap circle instruction VO
      setTimeout(() => {
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
        setTimeout(() => {
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
        setTimeout(() => {
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
        setTimeout(() => {
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
      setTimeout(() => {
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

      setTimeout(() => {
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

      setTimeout(() => {
        playVoice('childStart');
      }, 500);
    }
  }, [sceneState.gamePhase, childStartPlayed]);

  // ========================================
  // CHILD PHASE: Play name prompt VO when name modal opens (1-2-3 Rule + Idle Timer)
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

      // 1-2-3 Rule: Choose which VO to play
      const playNamePromptVO = () => {
        if (newCount === 1 || newCount === 2) {
          // 1st and 2nd time: Full guidance
          playVoice('namePrompt');
        } else if (newCount === 3) {
          // 3rd time: Short prompt
          playVoice('namePromptShort');
        }
        // 4th time onwards: Silent (no VO)
      };

      setTimeout(() => {
        playNamePromptVO();
      }, 300);

      // Idle Timer: Replay prompt after 8 seconds of inactivity (works for all times)
      namePromptTimerRef.current = setTimeout(() => {
        playNamePromptVO();
      }, 8000);
    }

    // Cleanup timer when modal closes
    return () => {
      if (namePromptTimerRef.current) {
        clearTimeout(namePromptTimerRef.current);
        namePromptTimerRef.current = null;
      }
    };
  }, [sceneState.showNameModal, sceneState.currentFamilyType, namePromptPlayed, namePromptCount]);

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
      setTimeout(() => {
        playVoice('finalReveal', () => {
          // After final reveal, play scene complete
          setTimeout(() => {
            playCelebration('sceneComplete');
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
      setTimeout(() => {
        playCorrect('correctChoice');
      }, 1800);

      sceneActions.updateState({ isSequencePlaying: true, showYouGotIt: choice.id });
      setTimeout(() => sceneActions.updateState({ correctChoiceId: choice.id }), 800);
      setTimeout(() => sceneActions.updateState({ showYouGotIt: null }), 1400);
      setTimeout(() => {
        sceneActions.updateState({
          showChoiceModal: false,
          placedGaneshaMembers: [...sceneState.placedGaneshaMembers, sceneState.selectedCircle],
          correctChoiceId: null
        });
      }, 1600);
      setTimeout(() => sceneActions.updateState({ justPlacedId: sceneState.selectedCircle }), 1700);
      setTimeout(() => {
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
          setTimeout(() => {
            // Step 3: Play wrong choice VO with callback
            playVoice('wrongChoice', () => {
              // Step 4: Unblock taps after both VOs finish
              setIsPlayingWrongVO(false);
            });

            // Trigger shake/fade animation
            sceneActions.updateState({ wrongChoice: choice.id });

            // Clear animation and disable choice after fade completes
            setTimeout(() => {
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
      setTimeout(() => playVoice('progressFirst'), 300);
    } else if (placedCount === 2) {
      setTimeout(() => playVoice('progressMid'), 300);
    } else if (placedCount === 3) {
      setTimeout(() => playVoice('progressNearFull'), 300);
    } else if (placedCount === 4) {
      // Will play when "All Done" button appears
    }
  };

  const handleGaneshaTreeDone = () => {
    sceneActions.updateState({ showTreeSparkles: true });
    setTimeout(() => {
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

    sceneActions.updateState({
      childFamily: newChildFamily,
      showNameModal: false,
      currentFamilyType: null,
      callName: ''
    });
    setAudioBlob(null);

    // Count members in each row
    const row1Count = newChildFamily.filter(m => m.row === 1).length; // Grandparents
    const row2Count = newChildFamily.filter(m => m.row === 2).length; // Parents
    const row3Count = newChildFamily.filter(m => m.row === 3).length; // Siblings/Pets

    // Play VOs: Row completion takes priority, then milestones
    const playVO = () => {
      // Row completion VOs (when a row hits 7 members)
      if (row1Count === 7 && newMember.row === 1) {
        playVoice('rowLimitGrandparents'); // "Wow! Your grandparents row is full!"
      } else if (row2Count === 7 && newMember.row === 2) {
        playVoice('rowLimitElders'); // "Amazing! Your parents row is complete!"
      } else if (row3Count === 7 && newMember.row === 3) {
        playVoice('rowLimitSiblingsPets'); // "Perfect! Your siblings and pets row is full!"
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
    setTimeout(() => {
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
        onClick={() => {
          stopVoice(); // Stop any playing VO
          setShowPauseMenu(true);
        }}
      />

      {/* Pause Menu */}
      <PauseMenu
        show={showPauseMenu}
        onResume={() => {
          setShowPauseMenu(false);
          // Restart idle timer if we're in an active phase
          if (sceneState.gamePhase === 'ganeshaTree' || sceneState.gamePhase === 'childInput') {
            startIdleTimer();
          }
        }}
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
        <div className="game-modal-overlay" id="family-tree-intro"> 
          <div className="game-modal-content">
            <div className="game-modal-character">
              <img src={babyGaneshaImg} alt="Baby Ganesha" />
            </div>
            <div className="game-modal-card">
              <h1 className="game-modal-title">{openingModalContent?.title || 'Meet My Family'}</h1>
              <p className="game-modal-subtitle">
                {openingModalContent?.subtitle || 'This is my family. They make me who I am.'}<br />
                {openingModalContent?.description || "After that, I'd love to meet yours too 💛"}
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
                <div className="empty-circle" />
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
                setTimeout(() => sceneActions.updateState({ showBottomTray: true }), 100);
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
            <div className="tray-hint-text">(Tap a face to remove it)</div>
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
              className="tray-done-btn" 
              onClick={() => sceneActions.updateState({ gamePhase: 'sideBySide' })}
              style={{
                position: 'absolute',
                bottom: '180px', // Sits above the tray height
                right: '20px',
                zIndex: 100,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              Done! ✓
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
            {familyMemberTypes.map(type => (
              <button
                key={type.id}
                className="member-card"
                onClick={() => handleSelectFamilyType(type)}
                style={{ borderColor: type.color }}
              >
                <div className="member-card-icon-wrap">
                  <img src={type.image} alt={type.label} className="member-card-icon" />
                </div>
                <div className="member-card-label">{type.label}</div>
              </button>
            ))}
          </div>

          {/* Name Input Modal */}
          {sceneState.showNameModal && sceneState.currentFamilyType && (
            <div className="modal-overlay">
              <div className="name-input-modal">
                <button className="modal-close-btn" onClick={() => sceneActions.updateState({ showNameModal: false })}>×</button>
                <div className="modal-emoji-large" style={{ width: '100px', height: '100px', margin: '0 auto 15px' }}>
                   <img src={sceneState.currentFamilyType.image} alt={sceneState.currentFamilyType.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <h2 className="modal-question">What do you call your {sceneState.currentFamilyType.label}?</h2>
                <div className="input-with-voice">
                  <input
                    type="text"
                    className="name-input"
                    placeholder="e.g., Papa, Mama..."
                    value={sceneState.callName}
                    onChange={(e) => {
                      sceneActions.updateState({ callName: e.target.value });
                      // Reset idle timer when user types
                      if (namePromptTimerRef.current) {
                        clearTimeout(namePromptTimerRef.current);
                        namePromptTimerRef.current = null;
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
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="final-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                width: `${Math.random() * 6 + 4}px`
              }}
            />
          ))}

          <h1 className="reveal-title">Look at Our Family Trees!</h1>
          <p className="reveal-subtitle">Connected by Love 💛</p>
          
          <div className="two-trees-container">
            {/* LEFT CARD: Ganesha */}
            <div className="tree-column slide-in-left">
              <h3 className="tree-heading">Ganesha's Family</h3>
              <p style={{textAlign:'center', color:'#5D4037', marginBottom:'10px'}}>🏔️ Mount Kailash</p>
              <div className="tree-visual">
                <img src={familyTree} alt="Tree" className="reveal-tree-img" />
                {ganeshaFamily.map(member => {
                  const deity = getPlacedDeityImage(member.id);
                 return (
                  <div key={member.id} className="tree-member-mini ganesha-comparison-icon" style={member.position}>
                    <img src={deity.image} alt={deity.name} className="mini-image ganesha-comparison-img" /> 
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
              <p style={{textAlign:'center', color:'#5D4037', marginBottom:'10px'}}>🏡 Your Home</p>
              
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
            <button className="end-game-btn" onClick={() => sceneActions.updateState({ showingCompletionScreen: true, completed: true, stars: 3 })}>
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
        <AboutMeCompletion
          show={sceneState.showingCompletionScreen}
          sceneName="My Family Tree"
          sceneNumber={1}
          totalScenes={4}
          starsEarned={3}
          totalStars={3}
          discoveredBadges={['family-connector', 'tree-builder']}
          badgeImages={{}}
          characterImages={{
            babyGanesha: babyGaneshaImg 
          }}
          nextSceneName="Favorite Food"
          childName="Family Star"
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
          onBackToMap={() => {
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
