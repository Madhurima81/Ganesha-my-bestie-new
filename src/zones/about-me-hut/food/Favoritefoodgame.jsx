import React, { useState, useEffect, useRef } from 'react';
import './Favoritefoodgame.css';
import SceneCompletionCelebration from "../../../lib/components/celebration/SceneCompletionCelebration";
import DrawingPad from '../components/Drawingpad';
import StoryProgressHeader from '../components/StoryProgressHeader';
import TextInputModal from '../components/Textinputmodal';
import LetterInputKeyboard from '../components/LetterInputKeyboard';

// Import SceneManager & Navigation
import SceneManager from "../../../lib/components/scenes/SceneManager";
import BackToMapButton from '../../../lib/components/navigation/BackToMapButton';

// Content Configs
import { getOpeningModal, getCompletionModal } from '../../../lib/config/content';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';

// Shared Components
import OpeningModal from '../../shared/components/OpeningModal';

// --- EXISTING ASSETS ---
import foodBg from './assets/images/fav_background.jpg';
import babyGaneshaImg from './assets/images/baby-ganesha.png';
import babyGaneshaSit from './assets/images/baby-ganesha-sit.png';

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
import pastaImg from './assets/images/food/fav-pasta.png';
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
    foodQuestion: "Which food... do you think... is my favorite?",
    foodCorrect: "Yes! ... Modak is my favorite. So sweet... and yummy!",

    // Ganesha Section - Color
    colorQuestion: "What's... my favorite color?",
    colorCorrect: "Right! ... I love yellow... like the sun!",

    // Ganesha Section - Activity
    activityQuestion: "What... do I love to do?",
    activityCorrect: "Yes! ... I love to dance!",

    // Ganesha Section - Friend
    friendQuestion: "Who... is my best friend?",
    friendCorrect: "Yes! ... Mooshika is my little mouse friend!",

    // Transition to Child Section
    transition: "Now... let's discover your favorite things! It's your turn... Tell me what makes you special.",

    // Child Section - Food
    childFoodQuestion: "What's your favorite food?",
    childFoodCorrect: "Mmm... that sounds yummy!",

    // Child Section - Color
    childColorQuestion: "What's your favorite color?",
    childColorCorrect: "That's a beautiful color!",

    // Child Section - Activity
    childActivityQuestion: "What do you love to do?",
    childActivityCorrect: "That sounds fun!",

    // Child Section - Friend
    childFriendQuestion: "Who is your best friend?",
    childFriendCorrect: "What a wonderful friend to have!",

    // Connection Moment (emotional beat)
    friendCelebration: "Now we know each other better... I'm happy we're friends!",

    // Scene Complete
    complete: "You shared your favorite things with me... That makes you special."
  };

  if (!sceneState) return <div>Loading...</div>;

  // Get content from configs
  const openingModalContent = getOpeningModal('about-me-hut', 'favorite-food');
  const completionModalContent = getCompletionModal('about-me-hut', 'favorite-food');
  const completionIcons = openingModalContent?.icons || ['food', 'color', 'activity'];

  // ── Resume Delay (shared across pause/resume logic) ──────────────────────────
  const RESUME_DELAY_MS = 3000;

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

  // --- LOCAL UI STATE (Transient) ---
  const [showShake, setShowShake] = useState(null);
  const [showDrawingPad, setShowDrawingPad] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputMode, setTextInputMode] = useState(null);

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isFeedbackShaking, setIsFeedbackShaking] = useState(false);

  // Reload Logic Refs
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
    { id: 'orange', name: 'Orange', image: orangeImg, correct: true },
    { id: 'yellow', name: 'Yellow', image: yellowImg, correct: false },
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
    { id: 'rice', name: 'Rice', image: riceImg, emoji: '🍚' },
    { id: 'pasta', name: 'Pasta', image: pastaImg, emoji: '🍝' }
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

  // --- RELOAD DETECTION & RESTORATION LOGIC ---
  useEffect(() => {
    if (isReload && !reloadHandledRef.current) {
      reloadHandledRef.current = true;
      const {
        gamePhase, wrongChoices, currentModal,
        childFoodChoice, childColor, childActivityChoice, childFriendLetters
      } = sceneState;

      console.log("🔄 Reload detected. Phase:", gamePhase, "Modal:", currentModal);

      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);

      // --- 1. RESTORE MODALS (Drawing/Typing) ---
      if (currentModal) {
        setResumeMessage("Welcome back! We saved your progress! 🎨");
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);

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

      // --- 2. EXISTING LOGIC (If no modal was open) ---
      if (gamePhase === 'intro') return;

      if (gamePhase === 'food-choice' && wrongChoices.length > 0) {
        setResumeMessage(`Keep trying! You've eliminated ${wrongChoices.length} option${wrongChoices.length > 1 ? 's' : ''}!`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }

      if ((gamePhase === 'color-choice' || gamePhase === 'activity-choice' || gamePhase === 'friend-choice') && wrongChoices.length > 0) {
        setResumeMessage(`Keep going! Try another option!`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }

      // Child Food Phase
      if (gamePhase === 'child-food-choice') {
        if (childFoodChoice || sceneState.childFoodDrawing || sceneState.childFoodText) {
          setResumeMessage(`You already picked your favorite food! Continue to color choice.`);
          setShowResumePopup(true);
          resumePopupTimeoutRef.current = setTimeout(() => {
            setShowResumePopup(false);
            sceneActions.updateState({ gamePhase: 'child-color-choice' });
          }, 3000);
        } else {
          setResumeMessage(`Welcome back! Ready to pick (or draw) your favorite food? 🍕`);
          setShowResumePopup(true);
          resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        }
        return;
      }

      // Child Color Phase
      if (gamePhase === 'child-color-choice') {
        if (childColor) {
          setResumeMessage(`You picked ${sceneState.childColorName}! Continue to activity choice.`);
          setShowResumePopup(true);
          resumePopupTimeoutRef.current = setTimeout(() => {
            setShowResumePopup(false);
            sceneActions.updateState({ gamePhase: 'child-activity-choice' });
          }, 3000);
        } else {
          setResumeMessage(`Let's pick your favorite color! 🎨`);
          setShowResumePopup(true);
          resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        }
        return;
      }

      // Child Activity Phase
      if (gamePhase === 'child-activity-choice') {
        if (childActivityChoice || sceneState.childActivityDrawing || sceneState.childActivityText) {
          setResumeMessage(`Great! Now tell us about your best friend!`);
          setShowResumePopup(true);
          resumePopupTimeoutRef.current = setTimeout(() => {
            setShowResumePopup(false);
            sceneActions.updateState({ gamePhase: 'child-friend-input' });
          }, 3000);
        } else {
          setResumeMessage(`Welcome back! Ready to pick (or draw) your favorite activity? ⚽`);
          setShowResumePopup(true);
          resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        }
        return;
      }

      // Friend Input
      if (gamePhase === 'child-friend-input' && childFriendLetters.length > 0) {
        setResumeMessage(`Continue typing your friend's name! (${childFriendLetters.length} letters)`);
        setShowResumePopup(true);
        resumePopupTimeoutRef.current = setTimeout(() => setShowResumePopup(false), 5000);
        return;
      }
    }
  }, [isReload, sceneState.gamePhase]);

  // Auto-transition Handler (Fixes frozen screens)
  useEffect(() => {
    let timer;
    const { gamePhase } = sceneState;

    if (gamePhase === 'food-correct') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'color-choice', wrongChoices: [] }); }, 2500);
    }
    else if (gamePhase === 'color-correct') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'activity-choice', wrongChoices: [] }); }, 2500);
    }
    else if (gamePhase === 'activity-correct') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'friend-intro', wrongChoices: [] }); }, 2500);
    }
    else if (gamePhase === 'friend-correct') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'child-intro', wrongChoices: [] }); }, 2500);
    }
    else if (gamePhase === 'friend-celebration') {
      timer = setTimeout(() => { sceneActions.updateState({ gamePhase: 'comparison-card' }); }, 3000);
    }

    return () => clearTimeout(timer);
  }, [sceneState.gamePhase]);

  useEffect(() => {
    if (sceneState.gamePhase === 'intro') {
      phaseVoiceRef.current = {};
      const timer = setTimeout(() => {
        speakLine(VOICE_LINES.opening);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [sceneState.gamePhase, isAudioOn]);

  useEffect(() => {
    // Ganesha's questions
    if (sceneState.gamePhase === 'food-choice' && !phaseVoiceRef.current.foodQuestion) {
      phaseVoiceRef.current.foodQuestion = true;
      speakLine(VOICE_LINES.foodQuestion);
    }
    if (sceneState.gamePhase === 'color-choice' && !phaseVoiceRef.current.colorQuestion) {
      phaseVoiceRef.current.colorQuestion = true;
      speakLine(VOICE_LINES.colorQuestion);
    }
    if (sceneState.gamePhase === 'activity-choice' && !phaseVoiceRef.current.activityQuestion) {
      phaseVoiceRef.current.activityQuestion = true;
      speakLine(VOICE_LINES.activityQuestion);
    }
    if (sceneState.gamePhase === 'friend-choice' && !phaseVoiceRef.current.friendQuestion) {
      phaseVoiceRef.current.friendQuestion = true;
      speakLine(VOICE_LINES.friendQuestion);
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
      speakLine(VOICE_LINES.childIntro);
    }

    // Child's questions
    if (sceneState.gamePhase === 'child-food-choice' && !phaseVoiceRef.current.childFoodQuestion) {
      phaseVoiceRef.current.childFoodQuestion = true;
      speakLine(VOICE_LINES.childFoodQuestion);
    }
    if (sceneState.gamePhase === 'child-color-choice' && !phaseVoiceRef.current.childColorQuestion) {
      phaseVoiceRef.current.childColorQuestion = true;
      speakLine(VOICE_LINES.childColorQuestion);
    }
    if (sceneState.gamePhase === 'child-activity-choice' && !phaseVoiceRef.current.childActivityQuestion) {
      phaseVoiceRef.current.childActivityQuestion = true;
      speakLine(VOICE_LINES.childActivityQuestion);
    }
    if (sceneState.gamePhase === 'child-friend-input' && !phaseVoiceRef.current.childFriendQuestion) {
      phaseVoiceRef.current.childFriendQuestion = true;
      speakLine(VOICE_LINES.childFriendQuestion);
    }

    // Transition & celebration
    if (sceneState.gamePhase === 'comparison-card' && !phaseVoiceRef.current.transition) {
      phaseVoiceRef.current.transition = true;
      speakLine(VOICE_LINES.transition);
    }
    if (sceneState.gamePhase === 'friend-celebration' && !phaseVoiceRef.current.friendCelebration) {
      phaseVoiceRef.current.friendCelebration = true;
      speakLine(VOICE_LINES.friendCelebration, { moment: 'celebration' });
    }
  }, [sceneState.gamePhase, isAudioOn]);

  useEffect(() => {
    if (sceneState.showingCompletionScreen && !phaseVoiceRef.current.completeVo) {
      phaseVoiceRef.current.completeVo = true;
      speakLine(VOICE_LINES.complete);
    }
  }, [sceneState.showingCompletionScreen, isAudioOn]);

  useEffect(() => () => stopSpokenVoice(), [stopSpokenVoice]);


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
    const food = foods.find(f => f.id === foodId);
    if (food.correct) {
      playUiTap();
      playSparkle();
      sceneActions.updateState({ correctChoiceId: foodId });
      setFeedbackMessage("");
      setTimeout(() => {
        playChime();
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
    const color = colors.find(c => c.id === colorId);
    if (color.correct) {
      playUiTap();
      playSparkle();
      playChime();
      sceneActions.updateState({
        storyDiscoveries: [...sceneState.storyDiscoveries, { image: orangeImg, name: 'Orange' }],
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
    const activity = activities.find(a => a.id === activityId);
    if (activity.correct) {
      playUiTap();
      playSparkle();
      playChime();
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

  const handleStartFriendChoice = () => {
    playUiTap();
    sceneActions.updateState({ wrongChoices: [], gamePhase: 'friend-choice' });
  };

  const handleFriendClick = (friendId) => {
    if (sceneState.wrongChoices.includes(friendId)) return;
    const friend = friends.find(f => f.id === friendId);
    if (friend.correct) {
      playUiTap();
      playSparkle();
      playChime();
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
    playUiTap();
    const selected = kidFoods.find(f => f.id === foodId);
    sceneActions.updateState({
      childFoodChoice: foodId,
      childDiscoveries: [{ image: selected.image, name: selected.name }],
      gamePhase: 'child-color-choice'
    });
  };

  const handleFoodDrawingSave = (data) => {
    playChime();
    setShowDrawingPad(false);
    setDrawingMode(null);
    sceneActions.updateState({
      childFoodDrawing: data.image,
      childDiscoveries: [{ image: data.image, name: 'My Food' }],
      gamePhase: 'child-color-choice',
      currentModal: null, // Clear modal state
      draftData: null
    });
  };

  const handleKidColorClick = (colorId) => {
    playUiTap();
    const selectedColor = kidColors.find(c => c.id === colorId);
    sceneActions.updateState({
      childColor: selectedColor.image || selectedColor.color,
      childColorName: selectedColor.name,
      childDiscoveries: [...sceneState.childDiscoveries, {
        image: selectedColor.image,
        emoji: selectedColor.emoji,
        name: selectedColor.name
      }],
      gamePhase: 'child-activity-choice'
    });
  };

  const handleKidActivityClick = (activityId) => {
    playUiTap();
    const selected = kidActivities.find(a => a.id === activityId);
    sceneActions.updateState({
      childActivityChoice: activityId,
      childDiscoveries: [...sceneState.childDiscoveries, { image: selected.image, name: selected.name }],
      gamePhase: 'child-friend-intro'
    });
  };

  const handleActivityDrawingSave = (data) => {
    playChime();
    setShowDrawingPad(false);
    setDrawingMode(null);
    sceneActions.updateState({
      childActivityDrawing: data.image,
      childDiscoveries: [...sceneState.childDiscoveries, { image: data.image, name: 'My Activity' }],
      gamePhase: 'child-friend-intro',
      currentModal: null, // Clear modal state
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

      {/* Back Button */}
      {sceneState.gamePhase !== 'intro' && !sceneState.showingCompletionScreen && (
        <BackToMapButton onNavigate={onNavigate} />
      )}

      {/* Food Choice Screen */}
      {sceneState.gamePhase === 'food-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          <div className={`feedback-message visible ${isFeedbackShaking ? 'shake-text' : ''}`}>
            {feedbackMessage || "Tap the food you think I love! 🥟"}
          </div>
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
                  <img src={food.image} alt={food.name} className="choice-image" />
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
          <div className="correct-food">
            <img src={foods.find(f => f.id === sceneState.selectedFood).image} alt="Modak" className="food-in-hand pop-in" />
          </div>
          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>✨</div>
            ))}
          </div>
          <div className="success-message">Yes! Modak is my favorite! 🎉</div>
        </div>
      )}

      {/* Color Choice */}
      {sceneState.gamePhase === 'color-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          <div className={`feedback-message visible ${isFeedbackShaking ? 'shake-text' : ''}`}>
            {feedbackMessage || "Tap the color you think I love! 💛"}
          </div>
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
                  <img src={color.image} alt={color.name} className="choice-image" />
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
          <div className="correct-food">
            <img src={orangeImg} alt="Orange" className="food-in-hand pop-in" style={{ width: '180px', height: '180px' }} />
          </div>
          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>✨</div>
            ))}
          </div>
          <div className="success-message">Yes! Orange is my favorite color! 🧡</div>
        </div>
      )}

      {/* Activity Choice */}
      {sceneState.gamePhase === 'activity-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          <div className={`feedback-message visible ${isFeedbackShaking ? 'shake-text' : ''}`}>
            {feedbackMessage || "Tap the activity you think I love! 🎮"}
          </div>
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
                  <img src={activity.image} alt={activity.name} className="choice-image" />
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
          <div className="correct-food">
            <img src={actDancingImg} alt="Dancing" className="food-in-hand pop-in" style={{ width: '180px', height: '180px' }} />
          </div>
          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>✨</div>
            ))}
          </div>
          <div className="success-message">Yes! I love Dancing! 💃✨</div>
        </div>
      )}

      {/* Friend Intro */}
      {sceneState.gamePhase === 'friend-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="friend-intro-box">
            <h2 className="friend-intro-text">Great! Now find my best friend!</h2>
            <button className="friend-intro-btn" onClick={handleStartFriendChoice}>Find Friend! 🌟</button>
          </div>
        </div>
      )}

      {/* Friend Choice */}
      {sceneState.gamePhase === 'friend-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          <div className={`feedback-message visible ${isFeedbackShaking ? 'shake-text' : ''}`}>
            {feedbackMessage || "Tap my best friend! 🐭"}
          </div>
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
                  <img src={friend.image} alt={friend.name} className="choice-image" />
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
            <img src={friends.find(f => f.id === sceneState.selectedFriend).image} alt="Mouse" className="friend-character pop-in" />
          </div>
          <div className="celebration-sparkles">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="sparkle heart" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}>💕</div>
            ))}
          </div>
          <div className="success-message">Yes! Mushika is my best friend! 🐭✨</div>
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
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          <div className="kid-choices-grid">
            {kidFoods.map((food, index) => (
              <button
                key={food.id}
                className="kid-choice-card bounce-gentle"
                onClick={() => handleKidFoodClick(food.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img src={food.image} alt={food.name} className="choice-image" style={{ width: '60px', height: '60px' }} />
                <div className="kid-choice-name">{food.name}</div>
              </button>
            ))}
          </div>

          <div className="custom-input-options">
            <button className="draw-button" onClick={() => {
              playUiTap();
              setShowDrawingPad(true);
              setDrawingMode('food');
              sceneActions.updateState({ currentModal: 'food-draw' }); // Track modal
            }}>🎨 Draw</button>
            <button className="type-button" onClick={() => {
              playUiTap();
              setShowTextInput(true);
              setTextInputMode('food');
              sceneActions.updateState({ currentModal: 'food-type' }); // Track modal
            }}>✏️ Type</button>
          </div>
        </div>
      )}

      {/* Child Color Choice */}
      {sceneState.gamePhase === 'child-color-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          <div className="color-palette-grid">
            {kidColors.map((color, index) => (
              <button
                key={color.id}
                className="color-choice-button bounce-gentle"
                onClick={() => handleKidColorClick(color.id)}
                style={{
                  backgroundColor: color.image ? 'transparent' : color.color,
                  border: color.image ? 'none' : '4px solid white',
                  animationDelay: `${index * 0.05}s`
                }}
                title={color.name}
              >
                {color.image ? (
                  <img src={color.image} alt={color.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  color.emoji
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Child Activity Choice */}
      {sceneState.gamePhase === 'child-activity-choice' && (
        <div className="choice-screen">
          <div className="ganesha-waiting">
            <img src={babyGaneshaImg} alt="Baby Ganesha" className="ganesha-small bounce-gentle" />
          </div>
          <div className="kid-choices-grid child-activity-scene">
            {kidActivities.map((activity, index) => (
              <button
                key={activity.id}
                className="kid-choice-card bounce-gentle"
                onClick={() => handleKidActivityClick(activity.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img src={activity.image} alt={activity.name} className="choice-image" style={{ width: '60px', height: '60px' }} />
                <div className="kid-choice-name">{activity.name}</div>
              </button>
            ))}
          </div>

          <div className="custom-input-options">
            <button className="draw-button" onClick={() => {
              playUiTap();
              setShowDrawingPad(true);
              setDrawingMode('activity');
              sceneActions.updateState({ currentModal: 'activity-draw' }); // Track modal
            }}>🎨 Draw</button>
            <button className="type-button" onClick={() => {
              playUiTap();
              setShowTextInput(true);
              setTextInputMode('activity');
              sceneActions.updateState({ currentModal: 'activity-type' }); // Track modal
            }}>✏️ Type</button>
          </div>
        </div>
      )}

      {/* Child Friend Intro */}
      {/* Child Friend Input */}
      {sceneState.gamePhase === 'child-friend-input' && (
        <div className="friend-input-screen">
          <LetterInputKeyboard
            onConfirm={(name) => {
              playChime();
              sceneActions.updateState({
                childFriendName: name,
                childFriendLetters: name.split(''),
                childDiscoveries: [...sceneState.childDiscoveries, { emoji: '👤', name: name }],
                gamePhase: 'friend-celebration'
              });

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
            <div className="friend-column">
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
                  <img src={orangeImg} alt="Orange" className="friend-item-img" />
                  <span className="friend-item-text">Orange</span>
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
            <div className="friend-connector">
              <div className="connector-heart">❤️</div>
              <div className="connector-text">FRIENDS</div>
              <div className="connector-heart">❤️</div>
            </div>

            {/* --- RIGHT: YOU --- */}
            <div className="friend-column">
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

          <div className="badge-strip">
            <span style={{ fontSize: '24px' }}>🏆</span>
            <span className="badge-text">Friendship Badge Unlocked!</span>
            <span style={{ fontSize: '24px' }}>🏆</span>
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
          <div className="celebration-sparkles">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}>✨</div>
            ))}
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
          background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
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
