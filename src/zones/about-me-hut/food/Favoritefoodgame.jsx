import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Favoritefoodgame.css';
import SceneCompletionCelebration from "../../../lib/components/celebration/SceneCompletionCelebration";
import DrawingPad from '../components/Drawingpad';
import StoryProgressHeader from '../components/StoryProgressHeader';
import TextInputModal from '../components/Textinputmodal';
import LetterInputKeyboard from '../components/LetterInputKeyboard';

// Import SceneManager & Navigation
import SceneManager from "../../../lib/components/scenes/SceneManager";

// Content Configs
import { getOpeningModal, getCompletionModal } from '../../../lib/config/content';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';

// Shared Components
import OpeningModal from '../../shared/components/OpeningModal';

// --- EXISTING ASSETS ---
import foodBg from './assets/images/fav_background.jpg';
import babyGaneshaImg from '/images/ganesha-final-new.svg';
import babyGaneshaSit from '/images/ganesha-final-new.svg';

// Food images
import modakImg from './assets/images/food/fav-modak.png';
import ladooImg from './assets/images/food/fav-ladoo.png';
import barfiImg from './assets/images/food/fav-barfi.png';

// Animal images
import mouseImg from './assets/images/animal/fav-mouse.png';
import cowImg from './assets/images/animal/fav-cow.png';
import peacockImg from './assets/images/animal/fav-peacock.png';

// Icons
import favIconFood from './assets/images/fav-icon-food.png';
import favIconColor from './assets/images/fav-icon-color.png';
import favIconActivity from './assets/images/fav-icon-activity.png';

// Colors
import redImg from './assets/images/color/fav-red.png';
import orangeImg from './assets/images/color/fav-orange.png';
import yellowImg from './assets/images/color/fav-yellow.png';
import greenImg from './assets/images/color/fav-green.png';
import blueImg from './assets/images/color/fav-blue.png';
import purpleImg from './assets/images/color/fav-purple.png';
import pinkImg from './assets/images/color/fav-pink.png';
import brownImg from './assets/images/color/fav-brown.png';

// Activities
import actEatingImg from './assets/images/food/fav-sweets.png';
import actDancingImg from './assets/images/activity/fav-music.png';
import actReadingImg from './assets/images/activity/fav-reading.png';
import actPlayingImg from './assets/images/activity/fav-playing.png';
import actTvImg from './assets/images/activity/fav-tv.png';
import actDrawImg from './assets/images/activity/fav-drawing.png';

// Kid Food Images
import pizzaImg from './assets/images/food/fav-pizza.png';
import burgerImg from './assets/images/food/fav-burger.png';
import icecreamImg from './assets/images/food/fav-icecream.png';
import noodlesImg from './assets/images/food/fav-noodles.png';
import fruitImg from './assets/images/food/fav-fruit.png';
import dosaImg from './assets/images/food/fav-dosa.png';
import riceImg from './assets/images/food/fav-rice.png';
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
const FavoriteFoodGame = ({ onComplete, onBack, onNavigate, zoneId = 'about-me-hut', sceneId = 'favorite-things' }) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          gamePhase: 'intro',

          // Data Arrays
          randomFoods: [],
          randomFriends: [],
          randomColors: [],
          randomActivities: [],

          // Selection State
          selectedFood: null,
          selectedFriend: null,
          wrongChoices: [],
          correctChoiceId: null,

          // Discovery Progress
          storyDiscoveries: [],
          childDiscoveries: [],

          // Child Choices
          childFoodChoice: null,
          childFoodDrawing: null,
          childFoodText: null,

          childColor: null,
          childColorName: '',

          childActivityChoice: null,
          childActivityDrawing: null,
          childActivityText: null,

          childFriendName: '',
          childFriendLetters: [],

          // Modal Persistence State (NEW)
          currentModal: null, // 'food-draw', 'food-type', 'activity-draw', 'activity-type'
          draftData: null,    // Stores incomplete drawing/text

          // Completion
          stars: 2,
          completed: false,
          showingCompletionScreen: false
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <FavoriteFoodGameContent
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
const FavoriteFoodGameContent = ({ sceneState, sceneActions, isReload, onComplete, onNavigate, onBack }) => {

  const VOICE_LINES = {
    // Opening Screen
    opening: "Let's discover our favorite things.",

    // Ganesha Section - Food
    foodQuestion: "Hmm... can you guess my favourite food?",
    foodCorrect: "Yes! Modak is my favourite. Sweet and yummy!",

    // Ganesha Section - Color
    colorQuestion: "Can you guess my favourite color?",
    colorCorrect: "Yes! Yellow is my favourite color, bright like the sun!",

    // Ganesha Section - Activity
    activityQuestion: "Can you guess my favourite activity?",
    activityCorrect: "Yes! I love to dance. It makes me so happy!",

    // Ganesha Section - Friend
    friendQuestion: "Can you guess who my best friend is?",
    friendCorrect: "Yes! Mooshika is my little mouse friend!",

    // Transition to Child Section
    transition: "Now let's discover your favorite things! It's your turn. Tell me what makes you special.",
    childIntro: "Now it's time to learn about YOU! Let's find out what makes you special.",

    // Child Section - Food
    childFoodQuestion: "What's your favorite food?",
    childFoodCorrect: "Mmm! That sounds yummy!",

    // Child Section - Color
    childColorQuestion: "What's your favorite color?",
    childColorCorrect: "That's a beautiful color!",
    childColorMatch: "Wow! We both love yellow!",

    // Child Section - Activity
    childActivityQuestion: "What do you love to do?",
    childActivityCorrect: "That sounds like fun!",
    childActivityMatch: "Haha! We both love dancing!",

    // Child Section - Friend
    childFriendQuestion: "Who is your best friend?",
    childFriendCorrect: "What a wonderful friend to have!",

    // Connection Moment (emotional beat)
    friendCelebration: "Now we know each other better. I'm happy we're friends!",

    // Idle Hints (Ganesha Section)
    foodHint: "My favourite sweet looks like a little mountain.",
    colorHint: "My favourite color shines like the bright sun.",
    activityHint: "My favourite activity is when my feet move to music.",
    friendHint: "My tiny friend scurries very fast."
  };

  if (!sceneState) return <div>Loading...</div>;

  // Get content from configs
  const openingModalContent = getOpeningModal('about-me-hut', 'favorite-food');
  const completionModalContent = getCompletionModal('about-me-hut', 'favorite-food');
  const completionIcons = openingModalContent?.icons || ['food', 'color', 'activity'];

  // ── Resume Delay (shared across pause/resume logic) ──────────────────────────
  const RESUME_DELAY_MS = 3000;
  const DISCOVERY_FLY_TOTAL_MS = 5200;
  const DISCOVERY_CENTER_REACH_MS = 1200;
  const CHILD_SELECTION_ADVANCE_DELAY_MS = DISCOVERY_FLY_TOTAL_MS + 2000;
  const CHILD_FRIEND_ADVANCE_DELAY_MS = DISCOVERY_FLY_TOTAL_MS + 2000;

  const { isAudioOn, toggleAudio } = useAudioPreference();

  // ── Callbacks for pause/resume ────────────────────────────────────────────────
  const onReturnHint = () => {
    // Optional: trigger visual hint on return (e.g., mini gesture, glow)
  };

  // ── T08/T09: visibility + idle timer infrastructure ──────────────────────────
  const { startIdleTimer, stopIdleTimer, setCurrentPhase, stopVoice, setVoiceVolume, startMusic, stopMusic } = useVoiceGuidance(
    'about-me-hut', 'favorite-food', {
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

  // Modak V7 pattern: volume 0 keeps MP3 VO playing silently so it resumes mid-sentence on unmute
  useEffect(() => { setVoiceVolume(isAudioOn ? 1 : 0); }, [isAudioOn, setVoiceVolume]);

  // Web Speech API TTS (useGaneshaVoice): pause/resume instead of cancel — keeps utterance alive
  useEffect(() => {
    if (!isAudioOn) {
      window.speechSynthesis?.pause();
    } else {
      window.speechSynthesis?.resume();
    }
  }, [isAudioOn]);

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
      // On tab resume: resume celebration + reset idle hints
      resumeCelebRef.current?.();
      onReturnHint?.();
      resetIdleHints();
    },
    resumeDelay: RESUME_DELAY_MS  // ← Timers sync with audio resume
  });

  // --- LOCAL UI STATE (Transient) ---
  const [showShake, setShowShake] = useState(null);
  const [showDrawingPad, setShowDrawingPad] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputMode, setTextInputMode] = useState(null);
  const [selectedKidFoodId, setSelectedKidFoodId] = useState(null);
  const [selectedKidColorId, setSelectedKidColorId] = useState(null);
  const [selectedKidActivityId, setSelectedKidActivityId] = useState(null);
  const [showChildFoodTools, setShowChildFoodTools] = useState(false);
  const [showChildActivityTools, setShowChildActivityTools] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isFeedbackShaking, setIsFeedbackShaking] = useState(false);
  const [discoveryFly, setDiscoveryFly] = useState(null);

  // Idle hint state for Ganesha choices
  // 0: none, 1: wobble@6s, 2: glow@6s, 3: VO@15s + pointer emoji, 4: sparkle@22s, 5: pulse@34s, 6: pulse@46s
  const [idleHintLevel, setIdleHintLevel] = useState(0);
  const [showPointerHint, setShowPointerHint] = useState(false);
  const pointerHintTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const idlePhaseRef = useRef(null);

  // Mini gesture (thumbs up) on successful taps
  const [miniGesture, setMiniGesture] = useState({
    show: false,
    target: 'center',
    durationMs: 1500,
    key: 0
  });
  const miniGestureTimerRef = useRef(null);

  // Reload Logic Refs
  const reloadHandledRef = useRef(false);
  const resumePopupTimeoutRef = useRef(null);
  const [openingButtonVisible] = useState(true);
  const phaseVoiceRef = useRef({});
  const discoveryFlyTimeoutRef = useRef(null);
  const childFoodToolsRef = useRef(null);
  const childActivityToolsRef = useRef(null);

  const triggerDiscoveryFly = (item, options = {}) => {
    const { isChild = false, isModak = false, durationMs = DISCOVERY_FLY_TOTAL_MS } = options;
    if (!item) return;

    setDiscoveryFly({
      key: `${Date.now()}-${Math.random()}`,
      image: item.image,
      emoji: item.emoji,
      name: item.name,
      isChild,
      isModak,
      durationMs
    });

    if (discoveryFlyTimeoutRef.current) {
      clearTimeout(discoveryFlyTimeoutRef.current);
    }

    discoveryFlyTimeoutRef.current = setTimeout(() => {
      setDiscoveryFly(null);
    }, durationMs);
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

  // --- CONSTANT DATA ---
  const foods = [
    { id: 'modak', name: 'Modak', image: modakImg, emoji: '🥟', correct: true },
    { id: 'ladoo', name: 'Ladoo', image: ladooImg, emoji: '🍪', correct: false },
    { id: 'barfi', name: 'Barfi', image: barfiImg, emoji: '🥞', correct: false }
  ];

  const friends = [
    { id: 'mouse', name: 'Mushika', image: mouseImg, emoji: '🐭', correct: true },
    { id: 'cow', name: 'Cow', image: cowImg, emoji: '🐮', correct: false },
    { id: 'peacock', name: 'Peacock', image: peacockImg, emoji: '🦚', correct: false }
  ];

  const colors = [
    { id: 'red', name: 'Red', image: redImg, correct: false },
    { id: 'orange', name: 'Orange', image: orangeImg, correct: false },
    { id: 'yellow', name: 'Yellow', image: yellowImg, correct: true },
    { id: 'green', name: 'Green', image: greenImg, correct: false }
  ];

  const activities = [
    { id: 'drawing', name: 'Drawing', image: actDrawImg, correct: false },
    { id: 'dancing', name: 'Dancing', image: actDancingImg, correct: true },
    { id: 'reading', name: 'Reading', image: actReadingImg, correct: false },
    { id: 'playing', name: 'Playing', image: actPlayingImg, correct: false }
  ];

  const kidFoods = [
    { id: 'pizza', name: 'Pizza', image: pizzaImg, emoji: '🍕' },
    { id: 'burger', name: 'Burger', image: burgerImg, emoji: '🍔' },
    { id: 'ice-cream', name: 'Ice Cream', image: icecreamImg, emoji: '🍦' },
    { id: 'dosa', name: 'Dosa', image: dosaImg, emoji: '🥞' },
    { id: 'noodles', name: 'Noodles', image: noodlesImg, emoji: '🍜' },
    { id: 'fruit', name: 'Fruit', image: fruitImg, emoji: '🍎' },
    { id: 'rice', name: 'Rice', image: riceImg, emoji: '🍚' }
  ];

  const kidActivities = [
    { id: 'sports', name: 'Playing', image: actPlayingImg, emoji: '⚽' },
    { id: 'reading', name: 'Reading', image: actReadingImg, emoji: '📚' },
    { id: 'drawing', name: 'Drawing', image: actDrawImg, emoji: '🎨' },
    { id: 'dancing', name: 'Dancing', image: actDancingImg, emoji: '💃' },
    { id: 'tv', name: 'Watching TV', image: actTvImg, emoji: '📺' },
    { id: 'games', name: 'Video Games', image: actPlayingImg, emoji: '🎮' }
  ];

  const kidColors = [
    { id: 'red', name: 'Red', image: redImg, emoji: '❤️' },
    { id: 'orange', name: 'Orange', image: orangeImg, emoji: '🧡' },
    { id: 'yellow', name: 'Yellow', image: yellowImg, emoji: '💛' },
    { id: 'green', name: 'Green', image: greenImg, emoji: '💚' },
    { id: 'blue', name: 'Blue', image: blueImg, emoji: '💙' },
    { id: 'purple', name: 'Purple', image: purpleImg, emoji: '💜' },
    { id: 'pink', name: 'Pink', image: pinkImg, emoji: '💗' },
    { id: 'brown', name: 'Brown', image: brownImg, emoji: '🤎' },
  ];

  // --- INITIALIZATION ---
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (sceneState.randomFoods.length === 0) {
      sceneActions.updateState({
        randomFoods: shuffleArray(foods),
        randomFriends: shuffleArray(friends),
        randomColors: shuffleArray(colors),
        randomActivities: shuffleArray(activities)
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (discoveryFlyTimeoutRef.current) clearTimeout(discoveryFlyTimeoutRef.current);
      if (miniGestureTimerRef.current) clearTimeout(miniGestureTimerRef.current);
      if (pointerHintTimerRef.current) clearTimeout(pointerHintTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (sceneState.gamePhase !== 'child-food-choice') {
      setSelectedKidFoodId(null);
      setShowChildFoodTools(false);
    }
    if (sceneState.gamePhase !== 'child-activity-choice') {
      setShowChildActivityTools(false);
    }
  }, [sceneState.gamePhase]);

  useEffect(() => {
    if (!showChildFoodTools || sceneState.gamePhase !== 'child-food-choice') return;

    const handleOutsideClick = (event) => {
      if (!childFoodToolsRef.current?.contains(event.target)) {
        setShowChildFoodTools(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showChildFoodTools, sceneState.gamePhase]);

  useEffect(() => {
    if (!showChildActivityTools || sceneState.gamePhase !== 'child-activity-choice') return;

    const handleOutsideClick = (event) => {
      if (!childActivityToolsRef.current?.contains(event.target)) {
        setShowChildActivityTools(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showChildActivityTools, sceneState.gamePhase]);

  // --- RELOAD DETECTION & RESTORATION LOGIC ---
  useEffect(() => {
    if (isReload && !reloadHandledRef.current) {
      reloadHandledRef.current = true;
      const { gamePhase, currentModal } = sceneState;

      console.log("🔄 Reload detected. Phase:", gamePhase, "Modal:", currentModal);

      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
      // --- 1. RESTORE MODALS (Drawing/Typing) ---
      if (currentModal) {
        if (currentModal === 'food-draw') {
          setDrawingMode('food');
          setShowDrawingPad(true);
        } else if (currentModal === 'activity-draw') {
          setDrawingMode('activity');
          setShowDrawingPad(true);
        } else if (currentModal === 'food-type') {
          setTextInputMode('food');
          setShowTextInput(true);
        } else if (currentModal === 'activity-type') {
          setTextInputMode('activity');
          setShowTextInput(true);
        }
        return; // Stop here if we restored a modal
      }

      const ganeshaChoicePhases = ['food-choice', 'color-choice', 'activity-choice', 'friend-choice'];
      const childPhases = ['child-food-choice', 'child-color-choice', 'child-activity-choice', 'child-friend-input'];

      if (ganeshaChoicePhases.includes(gamePhase)) {
        // Restart current Ganesha phase: replay phase VO + restart idle hint flow.
        phaseVoiceRef.current = {};
        resetIdleHints();
        setShowShake(null);
        setFeedbackMessage("");
        setIsFeedbackShaking(false);
        sceneActions.updateState({
          wrongChoices: [],
          correctChoiceId: null
        });
        return;
      }

      if (childPhases.includes(gamePhase)) {
        // Keep child phase as-is; only allow question VO to replay.
        // If a child sub-step was already completed before reload, move forward without popup.
        phaseVoiceRef.current = {};
        if (gamePhase === 'child-food-choice' && (sceneState.childFoodChoice || sceneState.childFoodDrawing || sceneState.childFoodText)) {
          sceneActions.updateState({ gamePhase: 'child-color-choice' });
          return;
        }
        if (gamePhase === 'child-color-choice' && sceneState.childColor) {
          sceneActions.updateState({ gamePhase: 'child-activity-choice' });
          return;
        }
        if (gamePhase === 'child-activity-choice' && (sceneState.childActivityChoice || sceneState.childActivityDrawing || sceneState.childActivityText)) {
          sceneActions.updateState({ gamePhase: 'child-friend-input' });
          return;
        }
        if (gamePhase === 'child-friend-input' && sceneState.childFriendName) {
          sceneActions.updateState({ gamePhase: 'friend-celebration' });
          return;
        }
        return;
      }
    }
  }, [isReload, sceneState.gamePhase]);

  // Auto-transition Handler (Fixes frozen screens)
  useEffect(() => {
    let timer;
    const { gamePhase } = sceneState;

    if (gamePhase === 'food-correct') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'color-choice', wrongChoices: [] }); }, 4500);
    }
    else if (gamePhase === 'color-correct') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'activity-choice', wrongChoices: [] }); }, 4500);
    }
    else if (gamePhase === 'activity-correct') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'friend-choice', wrongChoices: [] }); }, 4500);
    }
    else if (gamePhase === 'friend-intro') {
      // Backward compatibility for existing saved states that may still have friend-intro.
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'friend-choice', wrongChoices: [] }); }, 0);
    }
    else if (gamePhase === 'friend-correct') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'child-intro', wrongChoices: [] }); }, 4500);
    }
    else if (gamePhase === 'child-friend-intro') {
      // Auto-transition from intro to input screen
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'child-friend-input' }); }, 0);
    }
    else if (gamePhase === 'friend-celebration') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'comparison-card' }); }, 2000);
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
    // Ganesha's questions
    if (sceneState.gamePhase === 'food-choice' && !phaseVoiceRef.current.foodQuestion) {
      phaseVoiceRef.current.foodQuestion = true;
      // Two-part VO with pause
      speakLine(VOICE_LINES.foodQuestion, {
        moment: 'thinking',
        onEnd: () => {
          setTimeout(() => {
            speakLine("Tap the one you think I love.", { moment: 'thinking' });
          }, 800);
        }
      });
    }
    if (sceneState.gamePhase === 'color-choice' && !phaseVoiceRef.current.colorQuestion) {
      phaseVoiceRef.current.colorQuestion = true;
      speakLine(VOICE_LINES.colorQuestion, { moment: 'thinking' });
    }
    if (sceneState.gamePhase === 'activity-choice' && !phaseVoiceRef.current.activityQuestion) {
      phaseVoiceRef.current.activityQuestion = true;
      speakLine(VOICE_LINES.activityQuestion, { moment: 'thinking' });
    }
    if (sceneState.gamePhase === 'friend-choice' && !phaseVoiceRef.current.friendQuestion) {
      phaseVoiceRef.current.friendQuestion = true;
      speakLine(VOICE_LINES.friendQuestion, { moment: 'thinking' });
    }

    // Ganesha's correct answers
    if (sceneState.gamePhase === 'food-correct' && !phaseVoiceRef.current.foodCorrect) {
      phaseVoiceRef.current.foodCorrect = true;
      speakLine(VOICE_LINES.foodCorrect, { moment: 'celebration' });
    }
    if (sceneState.gamePhase === 'color-correct' && !phaseVoiceRef.current.colorCorrect) {
      phaseVoiceRef.current.colorCorrect = true;
      speakLine(VOICE_LINES.colorCorrect, { moment: 'celebration' });
    }
    if (sceneState.gamePhase === 'activity-correct' && !phaseVoiceRef.current.activityCorrect) {
      phaseVoiceRef.current.activityCorrect = true;
      speakLine(VOICE_LINES.activityCorrect, { moment: 'celebration' });
    }
    if (sceneState.gamePhase === 'friend-correct' && !phaseVoiceRef.current.friendCorrect) {
      phaseVoiceRef.current.friendCorrect = true;
      speakLine(VOICE_LINES.friendCorrect, { moment: 'celebration' });
    }

    // Child intro
    if (sceneState.gamePhase === 'child-intro' && !phaseVoiceRef.current.childIntro) {
      phaseVoiceRef.current.childIntro = true;
      speakLine(VOICE_LINES.childIntro, { moment: 'encouragement' });
    }

    // Child's questions
    if (sceneState.gamePhase === 'child-food-choice' && !phaseVoiceRef.current.childFoodQuestion) {
      phaseVoiceRef.current.childFoodQuestion = true;
      speakLine(VOICE_LINES.childFoodQuestion, { moment: 'thinking' });
    }
    if (sceneState.gamePhase === 'child-color-choice' && !phaseVoiceRef.current.childColorQuestion) {
      phaseVoiceRef.current.childColorQuestion = true;
      speakLine(VOICE_LINES.childColorQuestion, { moment: 'thinking' });
    }
    if (sceneState.gamePhase === 'child-activity-choice' && !phaseVoiceRef.current.childActivityQuestion) {
      phaseVoiceRef.current.childActivityQuestion = true;
      speakLine(VOICE_LINES.childActivityQuestion, { moment: 'thinking' });
    }
    if (sceneState.gamePhase === 'child-friend-input' && !phaseVoiceRef.current.childFriendQuestion) {
      phaseVoiceRef.current.childFriendQuestion = true;
      speakLine(VOICE_LINES.childFriendQuestion, { moment: 'thinking' });
    }

    // Final comparison card VO (starts after hearts appear)
    if (sceneState.gamePhase === 'comparison-card' && !phaseVoiceRef.current.friendCelebration) {
      phaseVoiceRef.current.friendCelebration = true;
      const comparisonVoTimer = setTimeout(() => {
        speakLine(VOICE_LINES.friendCelebration, { moment: 'celebration' });
      }, 1000);
      return () => clearTimeout(comparisonVoTimer);
    }
  }, [sceneState.gamePhase, isAudioOn]);

  // Completion VO intentionally disabled for scene completion screen.

  useEffect(() => () => stopSpokenVoice(), [stopSpokenVoice]);

  // ── Idle Hint System (Ganesha choices: food, color, activity, friend) ──
  useEffect(() => {
    const ganeshaPhases = ['food-choice', 'color-choice', 'activity-choice', 'friend-choice'];
    const currentPhase = sceneState.gamePhase;

    // Only run for Ganesha choice phases
    if (!ganeshaPhases.includes(currentPhase)) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      setIdleHintLevel(0);
      setShowPointerHint(false);
      idlePhaseRef.current = null;
      return;
    }

    // Track which phase we're in
    idlePhaseRef.current = currentPhase;

    // Reset idle hints when entering a new phase
    setIdleHintLevel(0);
    setShowPointerHint(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    // Set up idle hint progression: 6s wobble → 6s glow → 15s VO → 22s sparkle → 34s pulse → 46s pulse
    const t1 = setTimeout(() => {
      if (idlePhaseRef.current === currentPhase) setIdleHintLevel(1); // Wobble at 6s (motion catches attention)
    }, 6000);

    const t2 = setTimeout(() => {
      if (idlePhaseRef.current === currentPhase) setIdleHintLevel(2); // Static glow at 6s
    }, 6000);

    const t3 = setTimeout(() => {
      if (idlePhaseRef.current === currentPhase) {
        setIdleHintLevel(3); // VO clue at 15s
        // Show pointer emoji hint alongside VO
        setShowPointerHint(true);
        if (pointerHintTimerRef.current) clearTimeout(pointerHintTimerRef.current);
        pointerHintTimerRef.current = setTimeout(() => {
          setShowPointerHint(false);
        }, 3500);
        // Play hint VO based on phase
        const hintMap = {
          'food-choice': VOICE_LINES.foodHint,
          'color-choice': VOICE_LINES.colorHint,
          'activity-choice': VOICE_LINES.activityHint,
          'friend-choice': VOICE_LINES.friendHint
        };
        if (hintMap[currentPhase]) {
          speakLine(hintMap[currentPhase], { moment: 'encouragement' });
        }
      }
    }, 15000);

    const t4 = setTimeout(() => {
      if (idlePhaseRef.current === currentPhase) setIdleHintLevel(4); // Glow + sparkle at 22s
    }, 22000);

    const t5 = setTimeout(() => {
      if (idlePhaseRef.current === currentPhase) setIdleHintLevel(5); // Glow pulse again at 34s
    }, 34000);

    const t6 = setTimeout(() => {
      if (idlePhaseRef.current === currentPhase) setIdleHintLevel(6); // Glow pulse again at 46s
    }, 46000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [sceneState.gamePhase, sceneState.wrongChoices.length]);

  // Reset idle hints on any user interaction (choice click)
  const resetIdleHints = () => {
    setIdleHintLevel(0);
    setShowPointerHint(false);
    idlePhaseRef.current = null;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (pointerHintTimerRef.current) clearTimeout(pointerHintTimerRef.current);
  };

  // --- HANDLERS ---

  const handleStartGame = () => {
    playUiTap();
    stopVoice();
    stopSpokenVoice();
    setVoiceVolume(isAudioOn ? 1 : 0);
    sceneActions.updateState({ gamePhase: 'food-choice' });
  };

  const handleFoodClick = (foodId) => {
    if (sceneState.wrongChoices.includes(foodId) || sceneState.correctChoiceId) return;
    interruptCurrentVoice();
    resetIdleHints();
    const food = foods.find(f => f.id === foodId);
    if (food.correct) {
      playUiTap();
      playSparkle();
      triggerMiniGesture('food', 1500);
      sceneActions.updateState({ correctChoiceId: foodId });
      setFeedbackMessage("");
      setTimeout(() => {
        playChime();
        triggerDiscoveryFly({ image: modakImg, name: 'Modak' }, { isModak: true });
        sceneActions.updateState({
          selectedFood: foodId,
          storyDiscoveries: [{ image: modakImg, name: 'Modak' }],
          gamePhase: 'food-correct',
          correctChoiceId: null
        });
      }, 1000);
    } else {
      playWrongTap();
      setShowShake(foodId);
      setFeedbackMessage("Oops! Try again! 🥟");
      setIsFeedbackShaking(true);
      setTimeout(() => sceneActions.updateState({ wrongChoices: [...sceneState.wrongChoices, foodId] }), 100);
      setTimeout(() => { setShowShake(null); setIsFeedbackShaking(false); }, 500);
      setTimeout(() => setFeedbackMessage(""), 2000);
    }
  };

  const handleColorClick = (colorId) => {
    if (sceneState.wrongChoices.includes(colorId)) return;
    interruptCurrentVoice();
    resetIdleHints();
    const color = colors.find(c => c.id === colorId);
    if (color.correct) {
      playUiTap();
      playSparkle();
      triggerMiniGesture('color', 1500);
      playChime();
      triggerDiscoveryFly({ image: yellowImg, name: 'Yellow' });
      sceneActions.updateState({
        storyDiscoveries: [...sceneState.storyDiscoveries, { image: yellowImg, name: 'Yellow' }],
        gamePhase: 'color-correct'
      });
      setFeedbackMessage("");
    } else {
      playWrongTap();
      setShowShake(colorId);
      setFeedbackMessage("Oops! Not that one, try again! 🙈");
      setIsFeedbackShaking(true);
      setTimeout(() => sceneActions.updateState({ wrongChoices: [...sceneState.wrongChoices, colorId] }), 100);
      setTimeout(() => { setShowShake(null); setIsFeedbackShaking(false); }, 500);
      setTimeout(() => setFeedbackMessage(""), 2000);
    }
  };

  const handleActivityClick = (activityId) => {
    if (sceneState.wrongChoices.includes(activityId)) return;
    interruptCurrentVoice();
    resetIdleHints();
    const activity = activities.find(a => a.id === activityId);
    if (activity.correct) {
      playUiTap();
      playSparkle();
      triggerMiniGesture('activity', 1500);
      playChime();
      triggerDiscoveryFly({ image: actDancingImg, name: 'Dancing' });
      sceneActions.updateState({
        storyDiscoveries: [...sceneState.storyDiscoveries, { image: actDancingImg, name: 'Dancing' }],
        gamePhase: 'activity-correct'
      });
      setFeedbackMessage("");
    } else {
      playWrongTap();
      setShowShake(activityId);
      setFeedbackMessage("Oops! Try again! 💃");
      setIsFeedbackShaking(true);
      setTimeout(() => sceneActions.updateState({ wrongChoices: [...sceneState.wrongChoices, activityId] }), 100);
      setTimeout(() => { setShowShake(null); setIsFeedbackShaking(false); }, 500);
      setTimeout(() => setFeedbackMessage(""), 2000);
    }
  };

  const handleFriendClick = (friendId) => {
    if (sceneState.wrongChoices.includes(friendId)) return;
    interruptCurrentVoice();
    resetIdleHints();
    const friend = friends.find(f => f.id === friendId);
    if (friend.correct) {
      playUiTap();
      playSparkle();
      triggerMiniGesture('friend', 1500);
      playChime();
      triggerDiscoveryFly({ image: mouseImg, name: 'Mushika' });
      sceneActions.updateState({
        selectedFriend: friendId,
        storyDiscoveries: [...sceneState.storyDiscoveries, { image: mouseImg, name: 'Mushika' }],
        gamePhase: 'friend-correct'
      });
      setFeedbackMessage("");
    } else {
      playWrongTap();
      setShowShake(friendId);
      setFeedbackMessage("Not my best friend! Try again! 🐭");
      setIsFeedbackShaking(true);
      setTimeout(() => sceneActions.updateState({ wrongChoices: [...sceneState.wrongChoices, friendId] }), 100);
      setTimeout(() => { setShowShake(null); setIsFeedbackShaking(false); }, 500);
      setTimeout(() => setFeedbackMessage(""), 2000);
    }
  };

  // --- CHILD HANDLERS ---

  const handleKidFoodClick = (foodId) => {
    if (selectedKidFoodId || sceneState.childFoodChoice || sceneState.childFoodDrawing || sceneState.childFoodText) return;
    interruptCurrentVoice();
    playUiTap();
    setSelectedKidFoodId(foodId);
    const selected = kidFoods.find(f => f.id === foodId);
    sceneActions.updateState({
      childFoodChoice: foodId,
      childDiscoveries: [{ image: selected.image, name: selected.name }]
    });

    setTimeout(() => {
      triggerDiscoveryFly({ image: selected.image, name: selected.name }, { isChild: true });
    }, 200);

    setTimeout(() => {
      speakLine(VOICE_LINES.childFoodCorrect, { moment: 'celebration' });
    }, DISCOVERY_CENTER_REACH_MS);

    setTimeout(() => {
      playSparkle();
      playChime();
      sceneActions.updateState({
        gamePhase: 'child-color-choice'
      });
      setSelectedKidFoodId(null);
    }, CHILD_SELECTION_ADVANCE_DELAY_MS);
  };

  const handleFoodDrawingSave = (data) => {
    interruptCurrentVoice();
    playChime();
    setShowDrawingPad(false);
    setDrawingMode(null);
    triggerDiscoveryFly({ image: data.image, name: 'My Food' }, { isChild: true });
    sceneActions.updateState({
      childFoodDrawing: data.image,
      childDiscoveries: [{ image: data.image, name: 'My Food' }],
      gamePhase: 'child-color-choice',
      currentModal: null,
      draftData: null
    });
  };

  const handleKidColorClick = (colorId) => {
    if (sceneState.childColor || selectedKidColorId) return;
    interruptCurrentVoice();
    playUiTap();
    setSelectedKidColorId(colorId);
    const selectedColor = kidColors.find(c => c.id === colorId);
    sceneActions.updateState({
      childColor: selectedColor.image || selectedColor.color,
      childColorName: selectedColor.name,
      childDiscoveries: [...sceneState.childDiscoveries, {
        image: selectedColor.image,
        emoji: selectedColor.emoji,
        name: selectedColor.name
      }]
    });
    triggerDiscoveryFly({
      image: selectedColor.image,
      emoji: selectedColor.emoji,
      name: selectedColor.name
    }, { isChild: true });

    setTimeout(() => {
      const colorLine = colorId === 'yellow'
        ? VOICE_LINES.childColorMatch
        : VOICE_LINES.childColorCorrect;
      speakLine(colorLine, { moment: 'celebration' });
    }, DISCOVERY_CENTER_REACH_MS);

    setTimeout(() => {
      playSparkle();
      playChime();
      sceneActions.updateState({
        gamePhase: 'child-activity-choice'
      });
      setSelectedKidColorId(null);
    }, CHILD_SELECTION_ADVANCE_DELAY_MS);
  };

  const handleKidActivityClick = (activityId) => {
    if (sceneState.childActivityChoice || sceneState.childActivityDrawing || sceneState.childActivityText || selectedKidActivityId) return;
    interruptCurrentVoice();
    playUiTap();
    setSelectedKidActivityId(activityId);
    const selected = kidActivities.find(a => a.id === activityId);
    sceneActions.updateState({
      childActivityChoice: activityId,
      childDiscoveries: [...sceneState.childDiscoveries, { image: selected.image, name: selected.name }]
    });
    triggerDiscoveryFly({ image: selected.image, name: selected.name }, { isChild: true });

    setTimeout(() => {
      const activityLine = activityId === 'dancing'
        ? VOICE_LINES.childActivityMatch
        : VOICE_LINES.childActivityCorrect;
      speakLine(activityLine, { moment: 'celebration' });
    }, DISCOVERY_CENTER_REACH_MS);

    setTimeout(() => {
      playSparkle();
      playChime();
      sceneActions.updateState({
        gamePhase: 'child-friend-intro'
      });
      setSelectedKidActivityId(null);
    }, CHILD_SELECTION_ADVANCE_DELAY_MS);
  };

  const handleActivityDrawingSave = (data) => {
    interruptCurrentVoice();
    playChime();
    setShowDrawingPad(false);
    setDrawingMode(null);
    triggerDiscoveryFly({ image: data.image, name: 'My Activity' }, { isChild: true });
    sceneActions.updateState({
      childActivityDrawing: data.image,
      childDiscoveries: [...sceneState.childDiscoveries, { image: data.image, name: 'My Activity' }],
      gamePhase: 'child-friend-intro',
      currentModal: null,
      draftData: null
    });
  };

  const handleDrawingCancel = () => {
    playUiTap();
    setShowDrawingPad(false);
    setDrawingMode(null);
    sceneActions.updateState({ currentModal: null, draftData: null });
  };

  // --- RENDER ---
  return (
    <div className="favorite-food-game">
      <img src={foodBg} alt="Background" className="food-background" />
      <HomeButton onNavigate={onNavigate} />
      <ZoneBadgeButton zoneId="about-me-hut" onBack={() => onNavigate?.('zone-welcome')} />
      <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />

      {discoveryFly && (
        <div
          key={discoveryFly.key}
          className={`discovery-fly ${discoveryFly.isChild ? 'child' : ''} ${discoveryFly.isModak ? 'modak' : ''}`}
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

      {/* Pointer Emoji Hint (Hint Level 3) */}
      {showPointerHint && (
        <div
          className="idle-pointer-hint"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '72px',
            zIndex: 65,
            pointerEvents: 'none',
            animation: 'idlePointerBounce 1s ease-in-out infinite'
          }}
          aria-hidden="true"
        >
          👉
        </div>
      )}

      {/* Story Progress Header */}
      {!sceneState.gamePhase.includes('child') && sceneState.gamePhase !== 'comparison-card' && sceneState.gamePhase !== 'ending' && (
        <StoryProgressHeader discoveries={sceneState.storyDiscoveries} />
      )}

      {(sceneState.gamePhase.includes('child') || sceneState.gamePhase === 'friend-celebration') &&
        sceneState.gamePhase !== 'comparison-card' &&
        sceneState.gamePhase !== 'ending' && (
          <StoryProgressHeader discoveries={sceneState.childDiscoveries} isChildMode={true} />
        )}

      {sceneState.gamePhase === 'intro' && (
        <OpeningModal
          zoneId="about-me-hut"
          sceneId="favorite-food"
          onStart={handleStartGame}
          characterImg={babyGaneshaImg}
          showButton={openingButtonVisible}
        />
      )}

      {/* Food Choice Screen */}
      {sceneState.gamePhase === 'food-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          {/* Tap instruction removed */}
          <div className="choices-container food-scene">
            {sceneState.randomFoods.map((food, index) => (
              <button
                key={food.id}
                className={`choice-card ${showShake === food.id ? 'shake' : ''} ${sceneState.wrongChoices.includes(food.id) ? 'wrong' : ''} ${sceneState.correctChoiceId === food.id ? 'correct' : ''} bounce-gentle`}
                onClick={() => handleFoodClick(food.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                disabled={sceneState.wrongChoices.includes(food.id) || sceneState.correctChoiceId !== null}
              >
                <div className="choice-image-container">
                  <img
                    src={food.image}
                    alt={food.name}
                    className={`choice-image ${food.correct && idleHintLevel === 1 ? 'idle-wobble' : ''} ${food.correct && idleHintLevel >= 2 ? 'idle-glow' : ''} ${food.correct && idleHintLevel >= 4 ? 'idle-sparkle' : ''}`}
                  />
                </div>
                <div className="choice-name">{food.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Food Correct */}
      {sceneState.gamePhase === 'food-correct' && (
        <div className="correct-screen">
          <div className="ganesha-happy">
            <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate" />
          </div>
          {/* <div className="correct-food">
            <img src={foods.find(f => f.id === sceneState.selectedFood).image} alt="Modak" className="food-in-hand pop-in modak-special" />
          </div> */}
          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>✨</div>
            ))}
          </div>
          {/* <div className="success-message">Yes! Modak is my favorite! 🎉</div> */}
        </div>
      )}

      {/* Color Choice */}
      {sceneState.gamePhase === 'color-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          {/* Tap instruction removed */}
          <div className="choices-container color-scene">
            {sceneState.randomColors.map((color, index) => (
              <button
                key={color.id}
                className={`choice-card ${showShake === color.id ? 'shake' : ''} ${sceneState.wrongChoices.includes(color.id) ? 'wrong' : ''} ${sceneState.correctChoiceId === color.id ? 'correct' : ''} bounce-gentle`}
                onClick={() => handleColorClick(color.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                disabled={sceneState.wrongChoices.includes(color.id) || sceneState.correctChoiceId !== null}
              >
                <div className="choice-image-container">
                  <img
                    src={color.image}
                    alt={color.name}
                    className={`choice-image ${color.correct && idleHintLevel === 1 ? 'idle-wobble' : ''} ${color.correct && idleHintLevel >= 2 ? 'idle-glow' : ''} ${color.correct && idleHintLevel >= 4 ? 'idle-sparkle' : ''}`}
                  />
                </div>
                <div className="choice-name">{color.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Correct */}
      {sceneState.gamePhase === 'color-correct' && (
        <div className="correct-screen">
          <div className="ganesha-happy">
            <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate" />
          </div>
          {/* <div className="correct-food">
            <img src={yellowImg} alt="Yellow" className="food-in-hand pop-in" style={{ width: '180px', height: '180px' }} />
          </div> */}
          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>✨</div>
            ))}
          </div>
          {/* <div className="success-message">Yes! Orange is my favorite color! 🧡</div> */}
        </div>
      )}

      {/* Activity Choice */}
      {sceneState.gamePhase === 'activity-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          {/* Tap instruction removed */}
          <div className="choices-container activity-scene">
            {sceneState.randomActivities.map((activity, index) => (
              <button
                key={activity.id}
                className={`choice-card ${showShake === activity.id ? 'shake' : ''} ${sceneState.wrongChoices.includes(activity.id) ? 'wrong' : ''} ${sceneState.correctChoiceId === activity.id ? 'correct' : ''} bounce-gentle`}
                onClick={() => handleActivityClick(activity.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                disabled={sceneState.wrongChoices.includes(activity.id) || sceneState.correctChoiceId !== null}
              >
                <div className="choice-image-container">
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className={`choice-image ${activity.correct && idleHintLevel === 1 ? 'idle-wobble' : ''} ${activity.correct && idleHintLevel >= 2 ? 'idle-glow' : ''} ${activity.correct && idleHintLevel >= 4 ? 'idle-sparkle' : ''}`}
                  />
                </div>
                <div className="choice-name">{activity.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity Correct */}
      {sceneState.gamePhase === 'activity-correct' && (
        <div className="correct-screen">
          <div className="ganesha-happy">
            <img src={babyGaneshaSit} alt="Happy Ganesha" className="ganesha-celebrate" />
          </div>
          {/* <div className="correct-food">
            <img src={actDancingImg} alt="Dancing" className="food-in-hand pop-in" style={{ width: '180px', height: '180px' }} />
          </div> */}
          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>✨</div>
            ))}
          </div>
          {/* <div className="success-message">Yes! I love Dancing! 💃✨</div> */}
        </div>
      )}

      {/* Friend Intro (commented out: flow now goes directly to friend-choice) */}
      {/* {sceneState.gamePhase === 'friend-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="friend-intro-box">
            <h2 className="friend-intro-text">Great! Now find my best friend!</h2>
            <button className="friend-intro-btn" onClick={handleStartFriendChoice}>Find Friend! 🌟</button>
          </div>
        </div>
      )} */}

      {/* Friend Choice */}
      {sceneState.gamePhase === 'friend-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          {/* Tap instruction removed */}
          <div className="choices-container friend-scene">
            {sceneState.randomFriends.map((friend, index) => (
              <button
                key={friend.id}
                className={`choice-card ${showShake === friend.id ? 'shake' : ''} ${sceneState.wrongChoices.includes(friend.id) ? 'wrong' : ''} ${sceneState.correctChoiceId === friend.id ? 'correct' : ''} bounce-gentle`}
                onClick={() => handleFriendClick(friend.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                disabled={sceneState.wrongChoices.includes(friend.id) || sceneState.correctChoiceId !== null}
              >
                <div className="choice-image-container">
                  <img
                    src={friend.image}
                    alt={friend.name}
                    className={`choice-image ${friend.correct && idleHintLevel === 1 ? 'idle-wobble' : ''} ${friend.correct && idleHintLevel >= 2 ? 'idle-glow' : ''} ${friend.correct && idleHintLevel >= 4 ? 'idle-sparkle' : ''}`}
                  />
                </div>
                <div className="choice-name">{friend.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Friend Correct */}
      {sceneState.gamePhase === 'friend-correct' && (
        <div className="correct-screen">
          <div className="friends-together">
            <img src={babyGaneshaSit} alt="Ganesha" className="ganesha-with-friend" />
          </div>
          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="sparkle heart" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>💕</div>
            ))}
          </div>
          {/* <div className="success-message">Yes! Mushika is my best friend! 🐭✨</div> */}
        </div>
      )}

      {/* Child Intro */}
      {sceneState.gamePhase === 'child-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="child-phase-modal">
            <h2 className="child-phase-title">Now it's your turn! 😊</h2>
            <p className="child-phase-subtext">Tell me about you.</p>
            <button className="child-phase-button" onClick={() => sceneActions.updateState({ gamePhase: 'child-food-choice' })}>
              Tell Me about You!✨
            </button>
          </div>
        </div>
      )}

      {/* Child Food Choice */}
      {sceneState.gamePhase === 'child-food-choice' && (
        <div className="choice-screen">
          {!(selectedKidFoodId || sceneState.childFoodChoice || sceneState.childFoodDrawing || sceneState.childFoodText) && (
          <div className="child-food-scene">
            {kidFoods.map((food, index) => (
              <button
                key={food.id}
                className={`kid-choice-card food-${food.id} ${selectedKidFoodId === food.id ? 'selected' : ''}`}
                onClick={() => handleKidFoodClick(food.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
                disabled={Boolean(selectedKidFoodId || sceneState.childFoodChoice || sceneState.childFoodDrawing || sceneState.childFoodText)}
              >
                <img src={food.image} alt={food.name} className="choice-image" style={{ width: '60px', height: '60px' }} />
                <div className="kid-choice-name">{food.name}</div>
              </button>
            ))}
          </div>
          )}

          {!(selectedKidFoodId || sceneState.childFoodChoice || sceneState.childFoodDrawing || sceneState.childFoodText) && (
            <div className="custom-input-options child-food-actions">
              <div className="child-food-tools" ref={childFoodToolsRef}>
                {showChildFoodTools && (
                  <>
                    <button className="child-food-tool-btn draw" onClick={() => {
                      playUiTap();
                      setShowChildFoodTools(false);
                      setShowDrawingPad(true);
                      setDrawingMode('food');
                      sceneActions.updateState({ currentModal: 'food-draw' }); // Track modal
                    }}>✏ Draw</button>
                    <button className="child-food-tool-btn type" onClick={() => {
                      playUiTap();
                      setShowChildFoodTools(false);
                      setShowTextInput(true);
                      setTextInputMode('food');
                      sceneActions.updateState({ currentModal: 'food-type' }); // Track modal
                    }}>Aa Type</button>
                  </>
                )}
                <button
                  className={`child-food-tool-plus ${showChildFoodTools ? 'open' : ''}`}
                  onClick={() => {
                    playUiTap();
                    setShowChildFoodTools(prev => !prev);
                  }}
                  aria-label={showChildFoodTools ? 'Close creative tools' : 'Open creative tools'}
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Child Color Choice */}
      {sceneState.gamePhase === 'child-color-choice' && (
        <div className="choice-screen">
          {!(selectedKidColorId || sceneState.childColor) && (
          <div className="color-palette-grid">
            {kidColors.map((color, index) => (
              <button
                key={color.id}
                className={`color-choice-button color-${color.id} bounce-gentle`}
                onClick={() => handleKidColorClick(color.id)}
                style={{
                  backgroundColor: color.image ? 'transparent' : color.color,
                  border: color.image ? 'none' : '4px solid white',
                  animationDelay: `${index * 0.05}s`
                }}
                title={color.name}
                disabled={Boolean(sceneState.childColor)}
              >
                {color.image ? (
                  <img src={color.image} alt={color.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  color.emoji
                )}
              </button>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Child Activity Choice */}
      {sceneState.gamePhase === 'child-activity-choice' && (
        <div className="choice-screen">
          {!(selectedKidActivityId || sceneState.childActivityChoice || sceneState.childActivityDrawing || sceneState.childActivityText) && (
          <div className="child-activity-scene">
            {kidActivities.map((activity, index) => (
              <button
                key={activity.id}
                className={`kid-choice-card activity-${activity.id} bounce-gentle`}
                onClick={() => handleKidActivityClick(activity.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
                disabled={Boolean(sceneState.childActivityChoice || sceneState.childActivityDrawing || sceneState.childActivityText)}
              >
                <img src={activity.image} alt={activity.name} className="choice-image" style={{ width: '60px', height: '60px' }} />
                <div className="kid-choice-name">{activity.name}</div>
              </button>
            ))}
          </div>
          )}

          {!(selectedKidActivityId || sceneState.childActivityChoice || sceneState.childActivityDrawing || sceneState.childActivityText) && (
            <div className="custom-input-options child-activity-actions">
              <div className="child-activity-tools" ref={childActivityToolsRef}>
                {showChildActivityTools && (
                  <>
                    <button className="child-food-tool-btn draw" onClick={() => {
                      playUiTap();
                      setShowChildActivityTools(false);
                      setShowDrawingPad(true);
                      setDrawingMode('activity');
                      sceneActions.updateState({ currentModal: 'activity-draw' }); // Track modal
                    }}>{'✏ Draw'}</button>
                    <button className="child-food-tool-btn type" onClick={() => {
                      playUiTap();
                      setShowChildActivityTools(false);
                      setShowTextInput(true);
                      setTextInputMode('activity');
                      sceneActions.updateState({ currentModal: 'activity-type' }); // Track modal
                    }}>Aa Type</button>
                  </>
                )}
                <button
                  className={`child-food-tool-plus ${showChildActivityTools ? 'open' : ''}`}
                  onClick={() => {
                    playUiTap();
                    setShowChildActivityTools(prev => !prev);
                  }}
                  aria-label={showChildActivityTools ? 'Close activity tools' : 'Open activity tools'}
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Child Friend Intro */}
      {/* Child Friend Input */}
      {sceneState.gamePhase === 'child-friend-input' && !sceneState.childFriendName && (
        <div className="friend-input-screen">
          <LetterInputKeyboard
            onConfirm={(name) => {
              interruptCurrentVoice();
              playChime();
              sceneActions.updateState({
                childFriendName: name,
                childFriendLetters: name.split(''),
                childDiscoveries: [...sceneState.childDiscoveries, { emoji: '👤', name: name }]
              });
              triggerDiscoveryFly({ emoji: '👤', name }, { isChild: true });
              setTimeout(() => {
                speakLine(VOICE_LINES.childFriendCorrect, { moment: 'celebration' });
              }, DISCOVERY_CENTER_REACH_MS);
              setTimeout(() => {
                sceneActions.updateState({
                  gamePhase: 'friend-celebration'
                });
              }, CHILD_FRIEND_ADVANCE_DELAY_MS);

              localStorage.setItem('childFavorites', JSON.stringify({
                food: sceneState.childFoodChoice,
                foodDrawing: sceneState.childFoodDrawing,
                color: sceneState.childColor,
                colorName: sceneState.childColorName,
                activity: sceneState.childActivityChoice,
                activityDrawing: sceneState.childActivityDrawing,
                friend: name
              }));
            }}
            minLetters={2}
            maxLetters={20}
            placeholder="Type your Friend's Name"
            confirmButtonText="That's My Friend! ✓"
            deleteButtonText="⌫ Delete"
          />
        </div>
      )}

      {/* Drawing & Text Modals */}
      {showDrawingPad && (
        <div className="drawing-overlay">
          <DrawingPad
            prompt={drawingMode === 'food' ? "Draw your favorite food! 🍕" : "Draw your favorite activity! ⚽"}

            initialData={sceneState.draftData} // Restore draft
            onAutoSave={(data) => sceneActions.updateState({ draftData: data })} // Auto-save on stroke

            onSave={drawingMode === 'food' ? handleFoodDrawingSave : handleActivityDrawingSave}
            onCancel={handleDrawingCancel}
          />
        </div>
      )}

      {showTextInput && textInputMode === 'food' && (
        <TextInputModal
          prompt="What's YOUR favorite food?"

          initialValue={sceneState.draftData} // Restore text
          onAutoSave={(text) => sceneActions.updateState({ draftData: text })} // Auto-save on type

          onSave={(text) => {
            playChime();
            setShowTextInput(false);
            setTextInputMode(null);
            triggerDiscoveryFly({ emoji: '✏️', name: text }, { isChild: true });
            sceneActions.updateState({
              childFoodText: text,
              childDiscoveries: [{ emoji: '✏️', name: text }],
              gamePhase: 'child-color-choice',
              currentModal: null, // Clear modal
              draftData: null
            });
          }}
          onCancel={() => {
            playUiTap();
            setShowTextInput(false);
            setTextInputMode(null);
            sceneActions.updateState({ currentModal: null, draftData: null });
          }}
          maxLength={30}
        />
      )}

      {showTextInput && textInputMode === 'activity' && (
        <TextInputModal
          prompt="What's YOUR favorite activity?"

          initialValue={sceneState.draftData} // Restore text
          onAutoSave={(text) => sceneActions.updateState({ draftData: text })} // Auto-save on type

          onSave={(text) => {
            playChime();
            setShowTextInput(false);
            setTextInputMode(null);
            triggerDiscoveryFly({ emoji: '✏️', name: text }, { isChild: true });
            sceneActions.updateState({
              childActivityText: text,
              childDiscoveries: [...sceneState.childDiscoveries.slice(0, 2), { emoji: '✏️', name: text }],
              gamePhase: 'child-friend-intro',
              currentModal: null, // Clear modal
              draftData: null
            });
          }}
          onCancel={() => {
            playUiTap();
            setShowTextInput(false);
            setTextInputMode(null);
            sceneActions.updateState({ currentModal: null, draftData: null });
          }}
          maxLength={30}
        />
      )}

      {/* Friend Celebration Phase */}
      {sceneState.gamePhase === 'friend-celebration' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
        </div>
      )}

      {/* COMPARISON CARD */}
      {sceneState.gamePhase === 'comparison-card' && (
        <div className="friendship-overlay">
          <h1 className="friendship-title">You and Ganesha are friends forever! ✨</h1>
          <p className="friendship-subtitle">Ganesha loves knowing about you 💛</p>

          <div className="friendship-grid">
            {/* --- LEFT: GANESHA --- */}
            <div className="friend-column ganesha-card">
              <img src={babyGaneshaSit} alt="Ganesha" className="column-header-image" />
              <div className="column-label">GANESHA</div>
              <div className="friend-items-grid">
                <div className="friend-item">
                  <span className="friend-item-label">Food</span>
                  <img src={modakImg} alt="Modak" className="friend-item-img" />
                  <span className="friend-item-text">Modak</span>
                </div>
                <div className="friend-item">
                  <span className="friend-item-label">Color</span>
                  <img src={yellowImg} alt="Yellow" className="friend-item-img" />
                  <span className="friend-item-text">Yellow</span>
                </div>
                <div className="friend-item">
                  <span className="friend-item-label">Activity</span>
                  <img src={actDancingImg} alt="Dancing" className="friend-item-img" />
                  <span className="friend-item-text">Dancing</span>
                </div>
                <div className="friend-item">
                  <span className="friend-item-label">Friend</span>
                  <img src={mouseImg} alt="Mushika" className="friend-item-img" />
                  <span className="friend-item-text">Mushika</span>
                </div>
              </div>
            </div>

            {/* --- CENTER: CONNECTOR --- */}
            <div className="friend-connector-hearts" aria-hidden="true">
              <div className="connector-heart heart-1">♥</div>
              <div className="connector-heart heart-2">♥</div>
              <div className="connector-heart heart-3">♥</div>
            </div>

            {/* --- RIGHT: YOU --- */}
            <div className="friend-column you-card">
              <div className="child-avatar-display">
                {sceneState.childFriendName.charAt(0) || 'U'}
              </div>
              <div className="column-label">YOU</div>

              <div className="friend-items-grid">
                {/* Food */}
                <div className="friend-item">
                  <span className="friend-item-label">Food</span>
                  {sceneState.childFoodText ? (
                    <div className="friend-item-typed-text">{sceneState.childFoodText}</div>
                  ) : sceneState.childFoodDrawing ? (
                    <img src={sceneState.childFoodDrawing} alt="Draw" className="friend-item-img" style={{ borderRadius: '4px' }} />
                  ) : sceneState.childFoodChoice ? (
                    <img src={kidFoods.find(f => f.id === sceneState.childFoodChoice)?.image} alt="Food" className="friend-item-img" />
                  ) : (
                    <div style={{ fontSize: '20px' }}>🤷</div>
                  )}
                  <span className="friend-item-text">
                    {sceneState.childFoodText ? sceneState.childFoodText : sceneState.childFoodDrawing ? 'Drawing' : kidFoods.find(f => f.id === sceneState.childFoodChoice)?.name}
                  </span>
                </div>
                {/* Color */}
                <div className="friend-item">
                  <span className="friend-item-label">Color</span>
                  {sceneState.childColor && sceneState.childColor.startsWith('#') ? (
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: sceneState.childColor }}></div>
                  ) : (
                    <img src={sceneState.childColor} alt={sceneState.childColorName} className="friend-item-img" />
                  )}
                  <span className="friend-item-text">{sceneState.childColorName}</span>
                </div>
                {/* Activity */}
                <div className="friend-item">
                  <span className="friend-item-label">Activity</span>
                  {sceneState.childActivityText ? (
                    <div className="friend-item-typed-text">{sceneState.childActivityText}</div>
                  ) : sceneState.childActivityDrawing ? (
                    <img src={sceneState.childActivityDrawing} alt="Draw" className="friend-item-img" style={{ borderRadius: '4px' }} />
                  ) : sceneState.childActivityChoice ? (
                    <img src={kidActivities.find(a => a.id === sceneState.childActivityChoice)?.image} alt="Activity" className="friend-item-img" />
                  ) : (
                    <div style={{ fontSize: '20px' }}>🤷</div>
                  )}
                  <span className="friend-item-text">
                    {sceneState.childActivityText ? sceneState.childActivityText : sceneState.childActivityDrawing ? 'Drawing' : kidActivities.find(a => a.id === sceneState.childActivityChoice)?.name}
                  </span>
                </div>
                {/* Friend */}
                <div className="friend-item">
                  <span className="friend-item-label">Best Friend</span>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B4513' }}>
                    {sceneState.childFriendName.charAt(0)}
                  </div>
                  <span className="friend-item-text">{sceneState.childFriendName}</span>
                </div>
              </div>
            </div>
          </div>


          <button
            className="primary-cta"
            onClick={() => {
              playChime();
              sceneActions.updateState({
                completed: true,
                showingCompletionScreen: true
              });
            }}
          >
            🎉 Finish Game
          </button>
        </div>
      )}

      {/* Resume Countdown */}
      <ResumeCountdown value={countdownValue} />

      {/* Completion Screen */}
      {sceneState.showingCompletionScreen && (
        <SceneCompletionCelebration
          show={sceneState.showingCompletionScreen}
          zoneId="about-me-hut"
          sceneId="favorite-food"
          sceneName="My Favorite Things"
          completionTitle={completionModalContent?.title}
          completionSubtitle={completionModalContent?.subtitle}
          discoveredSymbols={completionIcons}
          symbolImages={{
            food: favIconFood,
            color: favIconColor,
            activity: favIconActivity
          }}
          starsEarned={sceneState.stars}
          totalStars={2}
          nextSceneName="Dream Big Together"
          childName="super finder"
          completionData={{
            completed: true,
            stars: sceneState.stars || 2,
            childFood: sceneState.childFoodChoice || '',
            childColor: sceneState.childColor || '',
            childActivity: sceneState.childActivityChoice || ''
          }}
          onContinue={() => {
            playUiTap();
            setTimeout(() => {
              if (onNavigate) {
                onNavigate('scene-complete-continue');
              } else if (onComplete) {
                onComplete();
              }
            }, 100);
          }}
          onReplay={() => {
            playUiTap();
            sceneActions.updateState({
              randomFoods: shuffleArray(foods),
              randomFriends: shuffleArray(friends),
              randomColors: shuffleArray(colors),
              randomActivities: shuffleArray(activities),
              gamePhase: 'intro',
              selectedFood: null,
              selectedFriend: null,
              wrongChoices: [],
              storyDiscoveries: [],
              childDiscoveries: [],
              childFoodChoice: null,
              childFoodDrawing: null,
              childFoodText: null,
              childColor: null,
              childColorName: '',
              childActivityChoice: null,
              childActivityDrawing: null,
              childActivityText: null,
              childFriendName: '',
              childFriendLetters: [],
              showingCompletionScreen: false,
              stars: 2,
              completed: false,
              currentModal: null, // Reset modal
              draftData: null
            });
            setShowDrawingPad(false);
            setDrawingMode(null);
            setShowTextInput(false);
            setTextInputMode(null);
          }}
          onBackToMap={() => {
            if (onNavigate) {
              onNavigate('zone-welcome');
            } else if (onBack) {
              onBack();
            }
          }}
          onHome={() => {
            if (onNavigate) {
              onNavigate('home');
            }
          }}
        />
      )}
    </div>
  );
};

export default FavoriteFoodGame;


