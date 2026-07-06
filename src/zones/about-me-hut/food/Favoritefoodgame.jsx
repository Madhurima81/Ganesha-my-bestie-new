import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Favoritefoodgame.css';
import SceneCompletionCelebration from "../../../lib/components/celebration/SceneCompletionCelebration";
import DrawingPad from '../components/Drawingpad';
import StoryProgressHeader from '../components/StoryProgressHeader';
import TextInputModal from '../components/Textinputmodal';
import LetterInputKeyboard from '../components/LetterInputKeyboard';
import SparkleAnimation from '../../../lib/components/animation/SparkleAnimation';

// Import SceneManager & Navigation
import SceneManager from "../../../lib/components/scenes/SceneManager";
import AboutMeComparisonCard from '../components/AboutMeComparisonCard';
import GameStateManager from '../../../lib/services/GameStateManager';

// Content Configs
import { getOpeningModal, getCompletionModal } from '../../../lib/config/content';
import { getZoneTheme } from '../../../lib/config/ZoneThemes';

// Shared Components
import OpeningModal from '../../shared/components/OpeningModal';

// --- EXISTING ASSETS ---
import foodBg from './assets/images/fav_background.webp';
import babyGaneshaImg from '/images/ganesha-final-new.svg';
import babyGaneshaSit from '/images/ganesha-final-new.svg';

// Food images
import modakImg from './assets/images/food/fav-modak.webp';
import ladooImg from './assets/images/food/fav-ladoo.webp';
import barfiImg from './assets/images/food/fav-barfi.webp';

// Animal images
import mouseImg from './assets/images/animal/fav-mouse.webp';
import cowImg from './assets/images/animal/fav-cow.webp';
import peacockImg from './assets/images/animal/fav-peacock.webp';

// Icons
import favIconFood from './assets/images/food-icon.webp';
import favIconColor from './assets/images/color-icon.webp';
import favIconActivity from './assets/images/sports-icon.webp';
import pencilImg from './assets/images/icons/pencil.svg';

// Colors
import redImg from './assets/images/color/fav-red.webp';
import orangeImg from './assets/images/color/fav-orange.webp';
import yellowImg from './assets/images/color/fav-yellow.webp';
import greenImg from './assets/images/color/fav-green.webp';
import blueImg from './assets/images/color/fav-blue.webp';
import purpleImg from './assets/images/color/fav-purple.webp';
import pinkImg from './assets/images/color/fav-pink.webp';
import brownImg from './assets/images/color/fav-brown.webp';

// Activities
import actEatingImg from './assets/images/food/fav-sweets.webp';
import actDancingImg from './assets/images/activity/fav-music.webp';
import actReadingImg from './assets/images/activity/fav-reading.webp';
import actPlayingImg from './assets/images/activity/fav-playing.webp';
import actTvImg from './assets/images/activity/fav-tv.webp';
import actDrawImg from './assets/images/activity/fav-drawing.webp';
import kidActSportsImg from './assets/images/activity/sports.webp';
import kidActReadImg from './assets/images/activity/read.webp';
import kidActArtImg from './assets/images/activity/art.webp';
import kidActSingImg from './assets/images/activity/sing.webp';
import kidActCookImg from './assets/images/activity/cook.webp';
import kidActNatureImg from './assets/images/activity/nature.webp';
import kidActStemImg from './assets/images/activity/stem.webp';
import kidActGameImg from './assets/images/activity/game.webp';

// Kid Food Images
import pizzaImg from './assets/images/food/fav-pizza.webp';
import burgerImg from './assets/images/food/fav-burger.webp';
import icecreamImg from './assets/images/food/fav-icecream.webp';
import noodlesImg from './assets/images/food/fav-noodles.webp';
import fruitImg from './assets/images/food/fav-fruit.webp';
import dosaImg from './assets/images/food/fav-dosa.webp';
import riceImg from './assets/images/food/fav-rice.webp';
import friendsImg from './assets/images/friends.webp';
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
const FavoriteFoodGame = ({ onComplete, onBack, onNavigate, zoneId = 'about-me-hut', sceneId = 'favorite-food' }) => {
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
          friendNameDraft: '',

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
    opening: "Let's explore my favorite things and yours!",

    // Ganesha Section - Food
    foodQuestion: "Tap my favorite food.",
    foodCorrect: "Yes! Modak is my favorite!",

    // Ganesha Section - Color
    colorQuestion: "Tap my favorite color.",
    colorCorrect: "Yes! Yellow is my favorite!",

    // Ganesha Section - Activity
    activityQuestion: "Tap my favorite activity.",
    activityCorrect: "Yes! I love to dance!",

    // Ganesha Section - Friend
    friendQuestion: "Tap my best friend.",
    friendCorrect: "Yes! Mooshika is my friend!",

    // Transition to Child Section
    transition: "Now it's your turn!",
    childIntro: "Now it's your turn!",

    // Child Section - Food
    childFoodQuestion: "Tap your favorite food.",
    childFoodCorrect: "Yummy!",

    // Child Section - Color
    childColorQuestion: "Tap your favorite color.",
    childColorCorrect: "Nice choice!",

    // Child Section - Activity
    childActivityQuestion: "Tap what you love to do.",
    childActivityCorrect: "That sounds like fun!",

    // Child Section - Friend
    childFriendQuestion: "Type the name of your best friend.",
    childFriendCorrect: "That's lovely!",

    // Connection Moment (emotional beat)
    friendCelebration: "We like so many fun things!",
    completionCelebration: "We know what we both love! Let's make our dreams come true!",

    // Idle Hints (Ganesha Section)
    foodHint: "Look for the sweet I love.",
    colorHint: "Look for the color of the sun.",
    activityHint: "I love moving to music.",
    friendHint: "My tiny friend runs very fast."
  };

  if (!sceneState) return <div>Loading...</div>;

  // Get content from configs
  const openingModalContent = getOpeningModal('about-me-hut', 'favorite-food');
  const completionModalContent = getCompletionModal('about-me-hut', 'favorite-food');
  const completionIcons = openingModalContent?.icons || ['food', 'color', 'activity'];
  const activeProfile = GameStateManager.getCurrentProfile?.() || null;
  const profileDisplayName = (activeProfile?.name || sceneState.childFriendName || 'You').trim();
  const rawProfileAvatar = activeProfile?.avatar;
  const profileEmojiToAnimal = {
    '🐵': 'monkey',
    '🦚': 'peacock',
    '🐿️': 'squirrel',
    '🐯': 'tiger',
    'ðŸµ': 'monkey',
    'ðŸ¦š': 'peacock',
    'ðŸ¿ï¸': 'squirrel',
    'ðŸ¯': 'tiger'
  };
  const PROFILE_ANIMAL_IDS = ['monkey', 'peacock', 'squirrel', 'tiger'];
  const PROFILE_EMOJI_TO_ANIMAL = { '🐵': 'monkey', '🦚': 'peacock', '🐿️': 'squirrel', '🐯': 'tiger' };
  const profileAnimalId = PROFILE_ANIMAL_IDS.includes(rawProfileAvatar)
    ? rawProfileAvatar
    : ((profileEmojiToAnimal[rawProfileAvatar] || PROFILE_EMOJI_TO_ANIMAL[rawProfileAvatar]) || null);
  const profileAvatarImage = profileAnimalId ? `/images/new-explorer-${profileAnimalId}.webp` : null;
  const profileAvatar = (typeof rawProfileAvatar === 'string' && rawProfileAvatar.trim().length <= 2)
    ? rawProfileAvatar
    : profileDisplayName.charAt(0).toUpperCase();

  // â”€â”€ Resume Delay (shared across pause/resume logic) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const RESUME_DELAY_MS = 3000;
  const OPENING_VO_VOLUME = 0.55;
  const DISCOVERY_FLY_TOTAL_MS = 3200;
  const DISCOVERY_CENTER_REACH_MS = 900;
  const PHASE_VO_BUFFER_MS = 1000;
  const CHILD_VO_FINISH_BUFFER_MS = 1200;
  const GANESHA_CORRECT_ADVANCE_DELAY_MS = 2600 + PHASE_VO_BUFFER_MS;
  const GANESHA_FOOD_CORRECT_ADVANCE_DELAY_MS = 3600 + PHASE_VO_BUFFER_MS;
  const GANESHA_FRIEND_CORRECT_ADVANCE_DELAY_MS = 3800 + PHASE_VO_BUFFER_MS;
  const FRIEND_CELEBRATION_ADVANCE_DELAY_MS = 600;
  const CHILD_SELECTION_ADVANCE_DELAY_MS = 3800 + PHASE_VO_BUFFER_MS + CHILD_VO_FINISH_BUFFER_MS;
  const CHILD_FRIEND_ADVANCE_DELAY_MS = 3800 + PHASE_VO_BUFFER_MS + CHILD_VO_FINISH_BUFFER_MS;

  const { isAudioOn, toggleAudio } = useAudioPreference();

  // â”€â”€ Callbacks for pause/resume â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const onReturnHint = () => {
    // Optional: trigger visual hint on return (e.g., mini gesture, glow)
  };

  // â”€â”€ T08/T09: visibility + idle timer infrastructure â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { startIdleTimer, stopIdleTimer, setCurrentPhase, stopVoice, setVoiceVolume, startMusic, stopMusic, playVoice } = useVoiceGuidance(
    'about-me-hut', 'favorite-food', {
      enableMusic: true,
      musicVolume: 0.06,
      idleTimeout: 20,
      resumeDelay: RESUME_DELAY_MS,  // â† Wait before replaying VO
      onReturnHint                     // â† Called when child returns
    }
  );
  const { playUiTap, playWrongTap, playSparkle, playChime, playGlow, setGlobalVolume } = useGameSounds();
  const { speak, stop: stopSpokenVoice } = useGaneshaVoice();
  useEffect(() => { startIdleTimer(); return () => stopIdleTimer(); }, [startIdleTimer, stopIdleTimer]);
  useEffect(() => { setCurrentPhase(sceneState?.gamePhase ?? null); }, [sceneState?.gamePhase, setCurrentPhase]);
  useEffect(() => {
    if (isAudioOn && sceneState.gamePhase !== 'intro' && !sceneState.showingCompletionScreen) startMusic();
    else stopMusic();
  }, [isAudioOn, sceneState.gamePhase, sceneState.showingCompletionScreen, startMusic, stopMusic]);
  // Keep SFX + ambience audible even when voice toggle is off.
  // Audio toggle should only mute voiceover.
  useEffect(() => { setGlobalVolume(1); }, [setGlobalVolume]);

  // Modak V7 pattern: volume 0 keeps MP3 VO playing silently so it resumes mid-sentence on unmute
  useEffect(() => { setVoiceVolume(isAudioOn ? 1 : 0); }, [isAudioOn, setVoiceVolume]);

  // Web Speech API TTS (useGaneshaVoice): pause/resume instead of cancel â€” keeps utterance alive
  useEffect(() => {
    if (!isAudioOn) {
      window.speechSynthesis?.pause();
    } else {
      window.speechSynthesis?.resume();
    }
  }, [isAudioOn]);

  // Prevent stale VO at scene boundaries without cancelling reload replays
  // during normal state updates.
  useEffect(() => {
    stopVoice();
    stopSpokenVoice();
    window.speechSynthesis?.cancel?.();
    return () => {
      stopVoice();
      stopSpokenVoice();
      window.speechSynthesis?.cancel?.();
    };
    // Intentionally mount/unmount only: rerunning on every callback identity
    // change can cancel the delayed reload entry VO.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => stopMusic(), [stopMusic]);

  // â”€â”€ Resume Countdown & Pause-Aware Timeout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      setDiscoveryFly(null);
      setSparkleState(prev => ({ ...prev, active: false }));
      setMiniGesture(prev => ({ ...prev, show: false }));
    },
    onShow: () => {
      // On tab resume: resume celebration + reset idle hints
      resumeCelebRef.current?.();
      setResumeHintCycleKey(prev => prev + 1);
      const ganeshaChoicePhases = ['food-choice', 'color-choice', 'activity-choice', 'friend-choice'];
      if (ganeshaChoicePhases.includes(sceneState?.gamePhase)) {
        setShowShake(null);
        sceneActions.updateState({
          wrongChoices: [],
          correctChoiceId: null
        });
      }
      // IMPORTANT: Do NOT call onReturnHint here.
      // useVoiceGuidance already invokes onReturnHint after resumeDelay when
      // no VO is queued. Calling it here too can double-trigger return logic.
      resetIdleHints();
    },
    resumeDelay: RESUME_DELAY_MS,
    resumePending: false
  });

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

  const [discoveryFly, setDiscoveryFly] = useState(null);

  // Idle hint state for Ganesha choices (0: none, 1: wobble@10s, 2: VO@18s, 3: strong glow@26s)
  const [idleHintLevel, setIdleHintLevel] = useState(0);
  const [resumeHintCycleKey, setResumeHintCycleKey] = useState(0);
  const idleHintVoiceRef = useRef(false);
  const ganeshaIdleTimerRef = useRef(null);
  const childIdleTimerRef = useRef(null);
  const childEntryVoRepeatRef = useRef(false);

  // Mini gesture (thumbs up) on successful taps
  const [miniGesture, setMiniGesture] = useState({
    show: false,
    target: 'center',
    durationMs: 1500,
    key: 0
  });
  const miniGestureTimerRef = useRef(null);
  const [sparkleState, setSparkleState] = useState({ active: false, key: 0, type: 'single' });
  const sparkleTimerRef = useRef(null);

  // Reload Logic Refs
  const reloadHandledRef = useRef(false);
  const hasHydratedOnceRef = useRef(false);
  const latestSceneStateRef = useRef(sceneState);
  const suppressCelebrationVoOnReloadRef = useRef(false);
  const suppressPhaseVoUntilReloadSettlesRef = useRef(false);
  const expectedReloadPhaseRef = useRef(null);
  const lastChildCompletionResumeKeyRef = useRef(0);
  const resumePopupTimeoutRef = useRef(null);
  const [openingButtonVisible] = useState(true);
  const phaseVoiceRef = useRef({});
  const discoveryFlyTimeoutRef = useRef(null);
  const childFoodToolsRef = useRef(null);
  const childActivityToolsRef = useRef(null);

  useEffect(() => {
    latestSceneStateRef.current = sceneState;
  }, [sceneState]);

  const triggerDiscoveryFly = (item, options = {}) => {
    const { isChild = false, isModak = false, showNameBelow = false, durationMs = DISCOVERY_FLY_TOTAL_MS } = options;
    if (!item) return;

    setDiscoveryFly({
      key: `${Date.now()}-${Math.random()}`,
      image: item.image,
      emoji: sanitizeEmoji(item.emoji, item.id),
      name: item.name,
      isChild,
      isModak,
      showNameBelow,
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

  const triggerSparkleFx = useCallback((type = 'single', durationMs = 1700) => {
    if (sparkleTimerRef.current) {
      clearTimeout(sparkleTimerRef.current);
      sparkleTimerRef.current = null;
    }
    setSparkleState(prev => ({ active: true, key: prev.key + 1, type }));
    sparkleTimerRef.current = setTimeout(() => {
      setSparkleState(prev => ({ ...prev, active: false }));
      sparkleTimerRef.current = null;
    }, durationMs + 80);
  }, []);

  const speakLine = useCallback((text, options = {}) => {
    if (!isAudioOn || !text) {
      options.onEnd?.();
      return;
    }
    const { onEnd, moment = 'encouragement' } = options;
    speak(text, { age: 7, style: 'child', moment, onEnd });
  }, [isAudioOn, speak]);
  const replayCurrentVoice = useCallback(() => {
    if (sceneState.showingCompletionScreen) {
      speakLine(VOICE_LINES.completionCelebration, { moment: 'celebration' });
      return;
    }

    switch (sceneState.gamePhase) {
      case 'intro':
        setVoiceVolume(OPENING_VO_VOLUME);
        playVoice('opening');
        return;
      case 'food-choice':
        speakLine(VOICE_LINES.foodQuestion, { moment: 'thinking' });
        return;
      case 'color-choice':
        speakLine(VOICE_LINES.colorQuestion, { moment: 'thinking' });
        return;
      case 'activity-choice':
        speakLine(VOICE_LINES.activityQuestion, { moment: 'thinking' });
        return;
      case 'friend-choice':
        speakLine(VOICE_LINES.friendQuestion, { moment: 'thinking' });
        return;
      case 'food-correct':
        speakLine(VOICE_LINES.foodCorrect, { moment: 'celebration' });
        return;
      case 'color-correct':
        speakLine(VOICE_LINES.colorCorrect, { moment: 'celebration' });
        return;
      case 'activity-correct':
        speakLine(VOICE_LINES.activityCorrect, { moment: 'celebration' });
        return;
      case 'friend-correct':
        speakLine(VOICE_LINES.friendCorrect, { moment: 'celebration' });
        return;
      case 'child-intro':
        speakLine(VOICE_LINES.childIntro, { moment: 'encouragement' });
        return;
      case 'child-food-choice':
        speakLine(VOICE_LINES.childFoodQuestion, { moment: 'thinking' });
        return;
      case 'child-color-choice':
        speakLine(VOICE_LINES.childColorQuestion, { moment: 'thinking' });
        return;
      case 'child-activity-choice':
        speakLine(VOICE_LINES.childActivityQuestion, { moment: 'thinking' });
        return;
      case 'child-friend-input':
        speakLine(VOICE_LINES.childFriendQuestion, { moment: 'thinking' });
        return;
      case 'comparison-card':
        speakLine(VOICE_LINES.friendCelebration, { moment: 'celebration' });
        return;
      default:
        break;
    }
  }, [VOICE_LINES, playVoice, sceneState.gamePhase, sceneState.showingCompletionScreen, setVoiceVolume, speakLine]);
  const interruptCurrentVoice = useCallback(() => {
    stopVoice();
    stopSpokenVoice();
  }, [stopVoice, stopSpokenVoice]);
  const speakOptionName = useCallback((name) => {
    if (!name) return;
    speakLine(name, { moment: 'thinking' });
  }, [speakLine]);
  const advanceToChildPhase = useCallback((nextPhase, extraState = {}) => {
    const nextVoiceKeyMap = {
      'child-color-choice': 'childColorQuestion',
      'child-activity-choice': 'childActivityQuestion',
      'child-friend-input': 'childFriendQuestion'
    };
    interruptCurrentVoice();
    if (nextPhase === 'child-friend-intro') {
      phaseVoiceRef.current.childFriendQuestion = false;
    }
    const nextVoiceKey = nextVoiceKeyMap[nextPhase];
    if (nextVoiceKey) {
      phaseVoiceRef.current[nextVoiceKey] = false;
    }
    sceneActions.updateState({
      ...extraState,
      gamePhase: nextPhase
    });
  }, [interruptCurrentVoice, sceneActions]);

  // --- CONSTANT DATA ---
  const foods = [
    { id: 'modak', name: 'Modak', image: modakImg, emoji: 'ðŸ¥Ÿ', correct: true },
    { id: 'ladoo', name: 'Ladoo', image: ladooImg, emoji: 'ðŸª', correct: false },
    { id: 'barfi', name: 'Barfi', image: barfiImg, emoji: 'ðŸ¥ž', correct: false }
  ];

  const friends = [
    { id: 'mouse', name: 'Mooshika', image: mouseImg, emoji: 'ðŸ­', correct: true },
    { id: 'cow', name: 'Cow', image: cowImg, emoji: 'ðŸ®', correct: false },
    { id: 'peacock', name: 'Peacock', image: peacockImg, emoji: 'ðŸ¦š', correct: false }
  ];

  const colors = [
    { id: 'red', name: 'Red', image: redImg, correct: false },
    { id: 'orange', name: 'Orange', image: orangeImg, correct: false },
    { id: 'yellow', name: 'Yellow', image: yellowImg, correct: true },
    { id: 'green', name: 'Green', image: greenImg, correct: false }
  ];

  const activities = [
    { id: 'drawing', name: 'Drawing', image: kidActArtImg, correct: false },
    { id: 'dancing', name: 'Dancing', image: kidActSingImg, correct: true },
    { id: 'reading', name: 'Reading', image: kidActReadImg, correct: false },
    { id: 'playing', name: 'Playing', image: kidActSportsImg, correct: false }
  ];

  const appendUniqueDiscovery = useCallback((discoveries, item) => {
    if (!item?.name) return discoveries || [];
    const list = Array.isArray(discoveries) ? discoveries : [];
    if (list.some(d => d?.name === item.name)) return list;
    return [...list, item];
  }, []);

  const kidFoods = [
    { id: 'pizza', name: 'Pizza', image: pizzaImg, emoji: 'ðŸ•' },
    { id: 'burger', name: 'Burger', image: burgerImg, emoji: 'ðŸ”' },
    { id: 'ice-cream', name: 'Ice Cream', image: icecreamImg, emoji: 'ðŸ¦' },
    { id: 'dosa', name: 'Dosa', image: dosaImg, emoji: 'ðŸ¥ž' },
    { id: 'noodles', name: 'Noodles', image: noodlesImg, emoji: 'ðŸœ' },
    { id: 'fruit', name: 'Fruit', image: fruitImg, emoji: 'ðŸŽ' },
    { id: 'rice', name: 'Rice', image: riceImg, emoji: 'ðŸš' }
  ];

  const kidActivities = [
    { id: 'reading', name: 'Reading', image: kidActReadImg, emoji: 'read' },
    { id: 'drawing', name: 'Drawing', image: kidActArtImg, emoji: 'art' },
    { id: 'dancing', name: 'Dancing', image: kidActSingImg, emoji: 'dance' },
    { id: 'sports', name: 'Playing', image: kidActSportsImg, emoji: 'play' },
    { id: 'cooking', name: 'Cooking', image: kidActCookImg, emoji: 'cook' },
    { id: 'nature', name: 'Nature', image: kidActNatureImg, emoji: 'nature' },
    { id: 'stem', name: 'Science', image: kidActStemImg, emoji: 'stem' },
    { id: 'games', name: 'Games', image: kidActGameImg, emoji: 'games' }
  ];

  const CHILD_ACTIVITY_POSITIONS = {
    reading: { left: 110, top: 48 },
    drawing: { left: 300, top: 48 },
    dancing: { left: 490, top: 48 },
    sports: { left: 680, top: 48 },
    cooking: { left: 110, top: 255 },
    nature: { left: 300, top: 255 },
    stem: { left: 490, top: 255 },
    games: { left: 680, top: 255 }
  };

  const kidColors = [
    { id: 'red', name: 'Red', image: redImg, emoji: 'â¤ï¸' },
    { id: 'orange', name: 'Orange', image: orangeImg, emoji: 'ðŸ§¡' },
    { id: 'yellow', name: 'Yellow', image: yellowImg, emoji: 'ðŸ’›' },
    { id: 'green', name: 'Green', image: greenImg, emoji: 'ðŸ’š' },
    { id: 'blue', name: 'Blue', image: blueImg, emoji: 'ðŸ’™' },
    { id: 'purple', name: 'Purple', image: purpleImg, emoji: 'ðŸ’œ' },
    { id: 'pink', name: 'Pink', image: pinkImg, emoji: 'ðŸ’—' },
    { id: 'brown', name: 'Brown', image: brownImg, emoji: 'ðŸ¤Ž' },
  ];

  const sanitizeEmoji = useCallback((emoji, fallbackKey = '') => {
    const emojiMap = {
      modak: '🥟',
      ladoo: '🍪',
      barfi: '🧁',
      mouse: '🐭',
      cow: '🐮',
      peacock: '🦚',
      pizza: '🍕',
      burger: '🍔',
      'ice-cream': '🍦',
      dosa: '🧁',
      noodles: '🍜',
      fruit: '🍎',
      rice: '🍚',
      red: '❤️',
      orange: '🧡',
      yellow: '💛',
      green: '💚',
      blue: '💙',
      purple: '💜',
      pink: '💗',
      brown: '🤎'
    };

    if (fallbackKey && emojiMap[fallbackKey]) {
      return emojiMap[fallbackKey];
    }

    return emoji;
  }, []);

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
    if (!isReload && sceneState.randomFoods.length === 0) {
      sceneActions.updateState({
        randomFoods: shuffleArray(foods),
        randomFriends: shuffleArray(friends),
        randomColors: shuffleArray(colors),
        randomActivities: shuffleArray(activities)
      });
    }
  }, [isReload, sceneActions, sceneState.randomFoods.length]);

  useEffect(() => {
    return () => {
      if (discoveryFlyTimeoutRef.current) clearTimeout(discoveryFlyTimeoutRef.current);
      if (miniGestureTimerRef.current) clearTimeout(miniGestureTimerRef.current);
      if (sparkleTimerRef.current) clearTimeout(sparkleTimerRef.current);
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
      // If reload is true but state is still at the initial placeholder intro
      // (before persisted temp_session is fully reflected), wait one more render.
      // This prevents missing celebration phases like food-correct on reload.
      const hasPersistedState = !!sceneState?.lastSaved;
      if (!hasPersistedState && sceneState?.gamePhase === 'intro' && !sceneState?.currentModal) {
        return;
      }

      reloadHandledRef.current = true;
      const { gamePhase, currentModal } = sceneState;
      suppressPhaseVoUntilReloadSettlesRef.current = false;
      expectedReloadPhaseRef.current = null;

      console.log("ðŸ”„ Reload detected. Phase:", gamePhase, "Modal:", currentModal);

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

      const ganeshaRestartPhaseMap = {
        'food-choice': 'food-choice',
        'food-correct': 'food-choice',
        'color-choice': 'color-choice',
        'color-correct': 'color-choice',
        'activity-choice': 'activity-choice',
        'activity-correct': 'activity-choice',
        'friend-intro': 'friend-choice',
        'friend-choice': 'friend-choice',
        'friend-correct': 'friend-choice'
      };
      const childPhases = ['child-food-choice', 'child-color-choice', 'child-activity-choice', 'child-friend-input'];

      if (gamePhase === 'child-intro') {
        suppressPhaseVoUntilReloadSettlesRef.current = true;
        expectedReloadPhaseRef.current = 'child-intro';
        clearAllTimeouts();
        interruptCurrentVoice();
        phaseVoiceRef.current = {};
        phaseVoiceRef.current.childIntro = false;
        const reloadVoFired = { fired: false };
        if (isAudioOn) {
          safeSetTimeout(() => {
            if (reloadVoFired.fired) return;
            reloadVoFired.fired = true;
            phaseVoiceRef.current.childIntro = true;
            speakLine(VOICE_LINES.childIntro, { moment: 'encouragement' });
          }, 180);
        }
        safeSetTimeout(() => {
          suppressPhaseVoUntilReloadSettlesRef.current = false;
          expectedReloadPhaseRef.current = null;
        }, 220);
        return;
      }

      const restartPhase = ganeshaRestartPhaseMap[gamePhase];
      if (restartPhase) {
        suppressPhaseVoUntilReloadSettlesRef.current = true;
        expectedReloadPhaseRef.current = restartPhase;
        // Reload rule: in any Ganesha phase (choice/hint/celebration), restart from phase entry.
        const wasCelebrationPhase = ['food-correct', 'color-correct', 'activity-correct', 'friend-correct'].includes(gamePhase);
        suppressCelebrationVoOnReloadRef.current = wasCelebrationPhase;
        clearAllTimeouts();
        interruptCurrentVoice();
        phaseVoiceRef.current = {};
        resetIdleHints();
        setShowShake(null);
        const restartDiscoveryCountMap = {
          'food-choice': 0,
          'color-choice': 1,
          'activity-choice': 2,
          'friend-choice': 3
        };
        const maxDiscoveries = restartDiscoveryCountMap[restartPhase] ?? 0;
        const restartState = {
          gamePhase: restartPhase,
          wrongChoices: [],
          correctChoiceId: null,
          storyDiscoveries: (sceneState.storyDiscoveries || []).slice(0, maxDiscoveries)
        };
        if (restartPhase === 'food-choice') restartState.selectedFood = null;
        if (restartPhase === 'friend-choice') restartState.selectedFriend = null;
        sceneActions.updateState(restartState);

        // Force replay of Ganesha entry VO after reload settle.
        const ganeshaEntryVoMap = {
          'food-choice': VOICE_LINES.foodQuestion,
          'color-choice': VOICE_LINES.colorQuestion,
          'activity-choice': VOICE_LINES.activityQuestion,
          'friend-choice': VOICE_LINES.friendQuestion
        };
        const ganeshaVoiceKeyMap = {
          'food-choice': 'foodQuestion',
          'color-choice': 'colorQuestion',
          'activity-choice': 'activityQuestion',
          'friend-choice': 'friendQuestion'
        };
        const ganeshaEntryLine = ganeshaEntryVoMap[restartPhase];
        const ganeshaVoiceKey = ganeshaVoiceKeyMap[restartPhase];
        if (ganeshaEntryLine && ganeshaVoiceKey) {
          // Keep false until playback starts.
          phaseVoiceRef.current[ganeshaVoiceKey] = false;
          const reloadVoFired = { fired: false };
          if (isAudioOn) {
            safeSetTimeout(() => {
              if (reloadVoFired.fired) return;
              reloadVoFired.fired = true;
              phaseVoiceRef.current[ganeshaVoiceKey] = true;
              speakLine(ganeshaEntryLine, { moment: 'thinking' });
            }, 160);
          }
        }
        if (gamePhase === restartPhase) {
          // Same-phase reload can skip phase-effect rerun; clear suppress manually.
          safeSetTimeout(() => {
            suppressPhaseVoUntilReloadSettlesRef.current = false;
            expectedReloadPhaseRef.current = null;
          }, 200);
        }
        return;
      }

      if (childPhases.includes(gamePhase)) {
        suppressPhaseVoUntilReloadSettlesRef.current = true;
        expectedReloadPhaseRef.current = gamePhase;
        // Reload rule for child phases:
        // restart same phase, replay entry VO, and rollback child discoveries for that phase.
        clearAllTimeouts();
        interruptCurrentVoice();
        phaseVoiceRef.current = {};
        childEntryVoRepeatRef.current = false;
        const childRestartDiscoveryCountMap = {
          'child-food-choice': 0,
          'child-color-choice': 1,
          'child-activity-choice': 2,
          'child-friend-input': 3
        };
        const childMaxDiscoveries = childRestartDiscoveryCountMap[gamePhase] ?? 0;
        const restartChildState = {
          gamePhase,
          childDiscoveries: (sceneState.childDiscoveries || []).slice(0, childMaxDiscoveries)
        };
        if (gamePhase === 'child-food-choice') {
          restartChildState.childFoodChoice = null;
          restartChildState.childFoodDrawing = null;
          restartChildState.childFoodText = null;
        }
        if (gamePhase === 'child-color-choice') {
          restartChildState.childColor = null;
          restartChildState.childColorName = '';
        }
        if (gamePhase === 'child-activity-choice') {
          restartChildState.childActivityChoice = null;
          restartChildState.childActivityDrawing = null;
          restartChildState.childActivityText = null;
        }
        if (gamePhase === 'child-friend-input') {
          restartChildState.childFriendName = '';
          restartChildState.childFriendLetters = [];
        }
        sceneActions.updateState(restartChildState);

        // Since gamePhase stays the same here, phase-entry effect won't re-run.
        // Replay child entry VO explicitly after reset settles.
        const childEntryVoMap = {
          'child-food-choice': VOICE_LINES.childFoodQuestion,
          'child-color-choice': VOICE_LINES.childColorQuestion,
          'child-activity-choice': VOICE_LINES.childActivityQuestion,
          'child-friend-input': VOICE_LINES.childFriendQuestion
        };
        const childVoiceKeyMap = {
          'child-food-choice': 'childFoodQuestion',
          'child-color-choice': 'childColorQuestion',
          'child-activity-choice': 'childActivityQuestion',
          'child-friend-input': 'childFriendQuestion'
        };
        const childEntryLine = childEntryVoMap[gamePhase];
        const childVoiceKey = childVoiceKeyMap[gamePhase];
        if (childEntryLine && childVoiceKey) {
          phaseVoiceRef.current[childVoiceKey] = false;
          const reloadVoFired = { fired: false };
          suppressPhaseVoUntilReloadSettlesRef.current = false;
          expectedReloadPhaseRef.current = null;
          if (isAudioOn) {
            safeSetTimeout(() => {
              if (reloadVoFired.fired) return;
              reloadVoFired.fired = true;
              phaseVoiceRef.current[childVoiceKey] = true;
              speakLine(childEntryLine, { moment: 'thinking' });
            }, 160);
          }
          // Same-phase child reloads may skip phase-effect rerun; keep guard state clean.
          safeSetTimeout(() => {
            suppressPhaseVoUntilReloadSettlesRef.current = false;
            expectedReloadPhaseRef.current = null;
          }, 200);
        }
        return;
      }
    }
  }, [isReload, sceneState.gamePhase, isAudioOn]);

  // Auto-transition Handler (Fixes frozen screens)
  useEffect(() => {
    let cancelTimer = null;
    const { gamePhase } = sceneState;

    if (gamePhase === 'food-correct') {
      cancelTimer = safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'color-choice', wrongChoices: [], correctChoiceId: null }); }, GANESHA_FOOD_CORRECT_ADVANCE_DELAY_MS);
    }
    else if (gamePhase === 'color-correct') {
      cancelTimer = safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'activity-choice', wrongChoices: [], correctChoiceId: null }); }, GANESHA_CORRECT_ADVANCE_DELAY_MS);
    }
    else if (gamePhase === 'activity-correct') {
      cancelTimer = safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'friend-choice', wrongChoices: [], correctChoiceId: null }); }, GANESHA_CORRECT_ADVANCE_DELAY_MS);
    }
    else if (gamePhase === 'friend-intro') {
      // Backward compatibility for existing saved states that may still have friend-intro.
      cancelTimer = safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'friend-choice', wrongChoices: [] }); }, 0);
    }
    else if (gamePhase === 'friend-correct') {
      cancelTimer = safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'child-intro', wrongChoices: [], correctChoiceId: null }); }, GANESHA_FRIEND_CORRECT_ADVANCE_DELAY_MS);
    }
    else if (gamePhase === 'child-friend-intro') {
      // Auto-transition from intro to input screen
      cancelTimer = safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'child-friend-input' }); }, 0);
    }
    else if (gamePhase === 'friend-celebration') {
      cancelTimer = safeSetTimeout(() => { sceneActions.updateState({ gamePhase: 'comparison-card' }); }, FRIEND_CELEBRATION_ADVANCE_DELAY_MS);
    }

    return () => cancelTimer?.();
  }, [
    sceneState.gamePhase,
    GANESHA_CORRECT_ADVANCE_DELAY_MS,
    GANESHA_FOOD_CORRECT_ADVANCE_DELAY_MS,
    GANESHA_FRIEND_CORRECT_ADVANCE_DELAY_MS,
    FRIEND_CELEBRATION_ADVANCE_DELAY_MS,
    safeSetTimeout,
    resumeHintCycleKey
  ]);

  useEffect(() => {
    if (sceneState.gamePhase === 'intro') {
      phaseVoiceRef.current = {};
      setVoiceVolume(isAudioOn ? OPENING_VO_VOLUME : 0);
      playVoice('opening');
    }
  }, [sceneState.gamePhase, isAudioOn, playVoice, setVoiceVolume]);

  const prevPhaseRef = useRef(sceneState.gamePhase);
  useEffect(() => {
    if (sceneState.gamePhase === 'comparison-card' && prevPhaseRef.current !== 'comparison-card') {
      playGlow();
    }
    prevPhaseRef.current = sceneState.gamePhase;
  }, [sceneState.gamePhase, playGlow]);

  useEffect(() => {
    if (!resumeHintCycleKey || !isAudioOn || sceneState.showingCompletionScreen) return;
    if (lastChildCompletionResumeKeyRef.current === resumeHintCycleKey) return;
    lastChildCompletionResumeKeyRef.current = resumeHintCycleKey;

    let completionLine = null;
    let nextPhase = null;
    let afterAdvance = null;

    if (
      sceneState.gamePhase === 'child-food-choice' &&
      (sceneState.childFoodChoice || sceneState.childFoodDrawing || sceneState.childFoodText)
    ) {
      completionLine = VOICE_LINES.childFoodCorrect;
      nextPhase = 'child-color-choice';
      phaseVoiceRef.current.childFoodQuestion = true;
      afterAdvance = () => setSelectedKidFoodId(null);
    } else if (sceneState.gamePhase === 'child-color-choice' && sceneState.childColor) {
      completionLine = sceneState.childColorName
        ? `${sceneState.childColorName}. ${VOICE_LINES.childColorCorrect}`
        : VOICE_LINES.childColorCorrect;
      nextPhase = 'child-activity-choice';
      phaseVoiceRef.current.childColorQuestion = true;
      afterAdvance = () => setSelectedKidColorId(null);
    } else if (
      sceneState.gamePhase === 'child-activity-choice' &&
      (sceneState.childActivityChoice || sceneState.childActivityDrawing || sceneState.childActivityText)
    ) {
      const selectedActivityName = sceneState.childActivityText
        || kidActivities.find(a => a.id === sceneState.childActivityChoice)?.name
        || null;
      completionLine = selectedActivityName
        ? `${selectedActivityName}. ${VOICE_LINES.childActivityCorrect}`
        : VOICE_LINES.childActivityCorrect;
      nextPhase = 'child-friend-intro';
      phaseVoiceRef.current.childActivityQuestion = true;
      afterAdvance = () => setSelectedKidActivityId(null);
    } else if (sceneState.gamePhase === 'child-friend-input' && sceneState.childFriendName) {
      completionLine = `${sceneState.childFriendName}. ${VOICE_LINES.childFriendCorrect}`;
      nextPhase = 'friend-celebration';
      phaseVoiceRef.current.childFriendQuestion = true;
    }

    if (!completionLine || !nextPhase) return;

    clearAllTimeouts();
    interruptCurrentVoice();

    safeSetTimeout(() => {
      speakLine(completionLine, { moment: 'celebration' });
    }, 160);

    safeSetTimeout(() => {
      playSparkle();
      if (nextPhase === 'friend-celebration') {
        sceneActions.updateState({ gamePhase: nextPhase });
      } else {
        advanceToChildPhase(nextPhase);
      }
      afterAdvance?.();
    }, CHILD_SELECTION_ADVANCE_DELAY_MS);
  }, [
    resumeHintCycleKey,
    isAudioOn,
    sceneState.showingCompletionScreen,
    sceneState.gamePhase,
    sceneState.childFoodChoice,
    sceneState.childFoodDrawing,
    sceneState.childFoodText,
    sceneState.childColor,
    sceneState.childColorName,
    sceneState.childActivityChoice,
    sceneState.childActivityDrawing,
    sceneState.childActivityText,
    sceneState.childFriendName,
    interruptCurrentVoice,
    speakLine,
    playSparkle,
    playChime,
    advanceToChildPhase,
    sceneActions,
    safeSetTimeout,
    clearAllTimeouts
  ]);

  useEffect(() => {
    const celebrationPhases = ['food-correct', 'color-correct', 'activity-correct', 'friend-correct'];

    // Reload stabilization guard:
    // block stale VO from pre-restore phases until the expected reload phase is active.
    if (suppressPhaseVoUntilReloadSettlesRef.current) {
      const expectedPhase = expectedReloadPhaseRef.current;
      if (!expectedPhase || sceneState.gamePhase !== expectedPhase) return;
      suppressPhaseVoUntilReloadSettlesRef.current = false;
      expectedReloadPhaseRef.current = null;
    }

    // Reload race guard:
    // when user reloads during a celebration phase, we restart to choice phase.
    // Prevent stale pre-restart celebration render from speaking once.
    if (suppressCelebrationVoOnReloadRef.current && celebrationPhases.includes(sceneState.gamePhase)) {
      return;
    }
    if (!celebrationPhases.includes(sceneState.gamePhase)) {
      suppressCelebrationVoOnReloadRef.current = false;
    }

    if (!hasHydratedOnceRef.current) {
      hasHydratedOnceRef.current = true;
      if (celebrationPhases.includes(sceneState.gamePhase)) {
        return;
      }
    }

    // Collect all timeouts for cleanup
    const timers = [];

    // Ganesha's questions
    if (sceneState.gamePhase === 'food-choice' && !phaseVoiceRef.current.foodQuestion) {
      phaseVoiceRef.current.foodCorrect = false;
      phaseVoiceRef.current.foodQuestion = true;
      speakLine(VOICE_LINES.foodQuestion, { moment: 'thinking' });
    }
    if (sceneState.gamePhase === 'color-choice' && !phaseVoiceRef.current.colorQuestion) {
      phaseVoiceRef.current.colorCorrect = false;
      phaseVoiceRef.current.colorQuestion = true;
      speakLine(VOICE_LINES.colorQuestion, { moment: 'thinking' });
    }
    if (sceneState.gamePhase === 'activity-choice' && !phaseVoiceRef.current.activityQuestion) {
      phaseVoiceRef.current.activityCorrect = false;
      phaseVoiceRef.current.activityQuestion = true;
      speakLine(VOICE_LINES.activityQuestion, { moment: 'thinking' });
    }
    if (sceneState.gamePhase === 'friend-choice' && !phaseVoiceRef.current.friendQuestion) {
      phaseVoiceRef.current.friendCorrect = false;
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
      timers.push(comparisonVoTimer);
    }

    return () => timers.forEach(clearTimeout);
  }, [sceneState.gamePhase, isAudioOn, resumeHintCycleKey]);

  // Completion VO (single guided line)
  useEffect(() => {
    if (sceneState.showingCompletionScreen && !phaseVoiceRef.current.completionCelebration) {
      phaseVoiceRef.current.completionCelebration = true;
      const completionVoTimer = setTimeout(() => {
        speakLine(VOICE_LINES.completionCelebration, { moment: 'celebration' });
      }, 180);
      return () => clearTimeout(completionVoTimer);
    }
    if (!sceneState.showingCompletionScreen) {
      phaseVoiceRef.current.completionCelebration = false;
    }
  }, [sceneState.showingCompletionScreen, isAudioOn]);

  // â”€â”€ Idle Hint System (Scene 22 pattern: 10s wobble -> 18s glow+VO -> 26s stronger glow) â”€â”€
  useEffect(() => {
    const ganeshaPhases = ['food-choice', 'color-choice', 'activity-choice', 'friend-choice'];
    const currentPhase = sceneState.gamePhase;

    // Only run for Ganesha choice phases
    if (!ganeshaPhases.includes(currentPhase) || showShake) {
      if (ganeshaIdleTimerRef.current) clearTimeout(ganeshaIdleTimerRef.current);
      setIdleHintLevel(0);
      idleHintVoiceRef.current = false;
      return;
    }

    // Reset idle hints when entering a new phase
    setIdleHintLevel(0);
    idleHintVoiceRef.current = false;
    if (ganeshaIdleTimerRef.current) clearTimeout(ganeshaIdleTimerRef.current);

    // Level 1 @ 10s: Wobble
    ganeshaIdleTimerRef.current = setTimeout(() => {
      setIdleHintLevel(1);

      // Level 2 @ 18s: Wobble + VO hint (speak once)
      ganeshaIdleTimerRef.current = setTimeout(() => {
        setIdleHintLevel(2);
        if (!idleHintVoiceRef.current) {
          const hintMap = {
            'food-choice': VOICE_LINES.foodHint,
            'color-choice': VOICE_LINES.colorHint,
            'activity-choice': VOICE_LINES.activityHint,
            'friend-choice': VOICE_LINES.friendHint
          };
          if (hintMap[currentPhase]) {
            speakLine(hintMap[currentPhase], { moment: 'encouragement' });
            idleHintVoiceRef.current = true;
          }
        }

        // Level 3 @ 26s: Strong glow (visual only)
        ganeshaIdleTimerRef.current = setTimeout(() => {
          setIdleHintLevel(3);
        }, 8000);
      }, 8000);
    }, 10000);

    return () => {
      if (ganeshaIdleTimerRef.current) clearTimeout(ganeshaIdleTimerRef.current);
    };
  }, [sceneState.gamePhase, showShake, resumeHintCycleKey]);

  // Child phase entry VO repeat @ 10s (once)
  useEffect(() => {
    const childPhases = ['child-food-choice', 'child-color-choice', 'child-activity-choice', 'child-friend-input'];
    const currentPhase = sceneState.gamePhase;

    // Only run for child choice phases
    if (!childPhases.includes(currentPhase)) {
      if (childIdleTimerRef.current) clearTimeout(childIdleTimerRef.current);
      childEntryVoRepeatRef.current = false;
      return;
    }

    // Reset flag when entering a new child phase
    childEntryVoRepeatRef.current = false;
    if (childIdleTimerRef.current) clearTimeout(childIdleTimerRef.current);

    // @ 10s: Repeat entry VO (once)
    childIdleTimerRef.current = setTimeout(() => {
      if (!childEntryVoRepeatRef.current) {
        const voMap = {
          'child-food-choice': VOICE_LINES.childFoodQuestion,
          'child-color-choice': VOICE_LINES.childColorQuestion,
          'child-activity-choice': VOICE_LINES.childActivityQuestion,
          'child-friend-input': VOICE_LINES.childFriendQuestion
        };
        if (voMap[currentPhase]) {
          speakLine(voMap[currentPhase], { moment: 'thinking' });
          childEntryVoRepeatRef.current = true;
        }
      }
    }, 10000);

    return () => {
      if (childIdleTimerRef.current) clearTimeout(childIdleTimerRef.current);
    };
  }, [sceneState.gamePhase, isAudioOn]);

  // Reset idle hints on any user interaction (choice click)
  const resetIdleHints = () => {
    setIdleHintLevel(0);
    idleHintVoiceRef.current = false;
    childEntryVoRepeatRef.current = false;
    if (ganeshaIdleTimerRef.current) clearTimeout(ganeshaIdleTimerRef.current);
    if (childIdleTimerRef.current) clearTimeout(childIdleTimerRef.current);
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
    playUiTap();
    if (sceneState.correctChoiceId) return;
    interruptCurrentVoice();
    resetIdleHints();
    const food = foods.find(f => f.id === foodId);
    if (food.correct) {
      playSparkle();
      triggerMiniGesture('food', 1500);
      triggerSparkleFx('all', 1700);
      sceneActions.updateState({ correctChoiceId: foodId });
      safeSetTimeout(() => {
        triggerDiscoveryFly({ image: modakImg, name: 'Modak' }, { isModak: true, durationMs: GANESHA_FOOD_CORRECT_ADVANCE_DELAY_MS });
        sceneActions.updateState({
          selectedFood: foodId,
          gamePhase: 'food-correct',
          correctChoiceId: null
        });
        safeSetTimeout(() => {
          const currentState = latestSceneStateRef.current || sceneState;
          sceneActions.updateState({
            storyDiscoveries: appendUniqueDiscovery(currentState.storyDiscoveries, { image: modakImg, name: 'Modak' })
          });
        }, DISCOVERY_CENTER_REACH_MS);
      }, 1000);
    } else {
      playWrongTap();
      speakOptionName(food?.name);
      setShowShake(foodId);
      sceneActions.updateState({ wrongChoices: [...sceneState.wrongChoices, foodId] });
      safeSetTimeout(() => setShowShake(null), 500);
    }
  };

  const handleColorClick = (colorId) => {
    playUiTap();
    if (sceneState.correctChoiceId) return;
    interruptCurrentVoice();
    resetIdleHints();
    const color = colors.find(c => c.id === colorId);
    if (color.correct) {
      playSparkle();
      triggerMiniGesture('color', 1500);
      triggerSparkleFx('all', 1700);
      triggerDiscoveryFly({ image: yellowImg, name: 'Yellow' }, { durationMs: GANESHA_CORRECT_ADVANCE_DELAY_MS });
      sceneActions.updateState({
        correctChoiceId: colorId,
        gamePhase: 'color-correct'
      });
      safeSetTimeout(() => {
        const currentState = latestSceneStateRef.current || sceneState;
        sceneActions.updateState({
          storyDiscoveries: appendUniqueDiscovery(currentState.storyDiscoveries, { image: yellowImg, name: 'Yellow' })
        });
      }, DISCOVERY_CENTER_REACH_MS);
    } else {
      playWrongTap();
      speakOptionName(color?.name);
      setShowShake(colorId);
      sceneActions.updateState({ wrongChoices: [...sceneState.wrongChoices, colorId] });
      safeSetTimeout(() => setShowShake(null), 500);
    }
  };

  const handleActivityClick = (activityId) => {
    playUiTap();
    if (sceneState.correctChoiceId) return;
    interruptCurrentVoice();
    resetIdleHints();
    const activity = activities.find(a => a.id === activityId);
    if (activity.correct) {
      playSparkle();
      triggerMiniGesture('activity', 1500);
      triggerSparkleFx('all', 1700);
      triggerDiscoveryFly({ image: activity.image, name: activity.name }, { durationMs: GANESHA_CORRECT_ADVANCE_DELAY_MS });
      sceneActions.updateState({
        correctChoiceId: activityId,
        gamePhase: 'activity-correct'
      });
      safeSetTimeout(() => {
        const currentState = latestSceneStateRef.current || sceneState;
        sceneActions.updateState({
          storyDiscoveries: appendUniqueDiscovery(currentState.storyDiscoveries, { image: activity.image, name: activity.name })
        });
      }, DISCOVERY_CENTER_REACH_MS);
    } else {
      playWrongTap();
      speakOptionName(activity?.name);
      setShowShake(activityId);
      sceneActions.updateState({ wrongChoices: [...sceneState.wrongChoices, activityId] });
      safeSetTimeout(() => setShowShake(null), 500);
    }
  };

  const handleFriendClick = (friendId) => {
    playUiTap();
    if (sceneState.correctChoiceId) return;
    interruptCurrentVoice();
    resetIdleHints();
    const friend = friends.find(f => f.id === friendId);
    if (friend.correct) {
      playSparkle();
      triggerMiniGesture('friend', 1500);
      triggerSparkleFx('all', 1700);
      triggerDiscoveryFly({ image: mouseImg, name: 'Mooshika' }, { durationMs: GANESHA_FRIEND_CORRECT_ADVANCE_DELAY_MS });
      sceneActions.updateState({
        correctChoiceId: friendId,
        selectedFriend: friendId,
        gamePhase: 'friend-correct'
      });
      safeSetTimeout(() => {
        const currentState = latestSceneStateRef.current || sceneState;
        sceneActions.updateState({
          storyDiscoveries: appendUniqueDiscovery(currentState.storyDiscoveries, { image: mouseImg, name: 'Mooshika' })
        });
      }, DISCOVERY_CENTER_REACH_MS);
    } else {
      playWrongTap();
      speakOptionName(friend?.name);
      setShowShake(friendId);
      sceneActions.updateState({ wrongChoices: [...sceneState.wrongChoices, friendId] });
      safeSetTimeout(() => setShowShake(null), 500);
    }
  };

  // --- CHILD HANDLERS ---

  const handleKidFoodClick = (foodId) => {
    if (selectedKidFoodId || sceneState.childFoodChoice || sceneState.childFoodDrawing || sceneState.childFoodText) return;
    interruptCurrentVoice();
    playUiTap();
    setSelectedKidFoodId(foodId);
    const selected = kidFoods.find(f => f.id === foodId);
    const discoveryImage = selected?.id === 'drawing' ? pencilImg : selected?.image;
    speakOptionName(selected?.name);
    sceneActions.updateState({
      childFoodChoice: foodId,
      childDiscoveries: [{ image: discoveryImage, name: selected.name }]
    });
    triggerMiniGesture('center', 1200);
    triggerSparkleFx('single', 1500);

    triggerDiscoveryFly({ image: discoveryImage, name: selected.name }, { isChild: true, durationMs: CHILD_SELECTION_ADVANCE_DELAY_MS });

    safeSetTimeout(() => {
      speakLine(VOICE_LINES.childFoodCorrect, { moment: 'celebration' });
    }, DISCOVERY_CENTER_REACH_MS);

    safeSetTimeout(() => {
      playSparkle();
      advanceToChildPhase('child-color-choice');
      setSelectedKidFoodId(null);
    }, CHILD_SELECTION_ADVANCE_DELAY_MS);
  };

  const handleFoodDrawingSave = (data) => {
    interruptCurrentVoice();
    playChime();
    setShowDrawingPad(false);
    setDrawingMode(null);
    triggerDiscoveryFly({ image: pencilImg, name: 'My Food' }, { isChild: true, durationMs: CHILD_SELECTION_ADVANCE_DELAY_MS });
    sceneActions.updateState({
      childFoodDrawing: data.image,
      childDiscoveries: [{ image: pencilImg, name: 'My Food' }],
      currentModal: null,
      draftData: null
    });
    triggerMiniGesture('center', 1200);
    triggerSparkleFx('single', 1500);

    safeSetTimeout(() => {
      speakLine(VOICE_LINES.childFoodCorrect, { moment: 'celebration' });
    }, DISCOVERY_CENTER_REACH_MS);

    safeSetTimeout(() => {
      playSparkle();
      advanceToChildPhase('child-color-choice');
    }, CHILD_SELECTION_ADVANCE_DELAY_MS);
  };

  const handleKidColorClick = (colorId) => {
    if (sceneState.childColor || selectedKidColorId) return;
    interruptCurrentVoice();
    playUiTap();
    setSelectedKidColorId(colorId);
    const selectedColor = kidColors.find(c => c.id === colorId);
    const currentState = latestSceneStateRef.current || sceneState;
    speakOptionName(selectedColor?.name);
    sceneActions.updateState({
      childColor: selectedColor.image || selectedColor.color,
      childColorName: selectedColor.name,
      childDiscoveries: appendUniqueDiscovery(currentState.childDiscoveries, {
        image: selectedColor.image,
        emoji: sanitizeEmoji(selectedColor.emoji, selectedColor.id),
        name: selectedColor.name
      })
    });
    triggerMiniGesture('center', 1200);
    triggerSparkleFx('single', 1500);
    triggerDiscoveryFly({
      image: selectedColor.image,
      emoji: selectedColor.emoji,
      name: selectedColor.name
    }, { isChild: true, durationMs: CHILD_SELECTION_ADVANCE_DELAY_MS });

    safeSetTimeout(() => {
      speakLine(VOICE_LINES.childColorCorrect, { moment: 'celebration' });
    }, DISCOVERY_CENTER_REACH_MS);

    safeSetTimeout(() => {
      playSparkle();
      advanceToChildPhase('child-activity-choice');
      setSelectedKidColorId(null);
    }, CHILD_SELECTION_ADVANCE_DELAY_MS);
  };

  const handleKidActivityClick = (activityId) => {
    if (sceneState.childActivityChoice || sceneState.childActivityDrawing || sceneState.childActivityText || selectedKidActivityId) return;
    interruptCurrentVoice();
    playUiTap();
    setSelectedKidActivityId(activityId);
    const selected = kidActivities.find(a => a.id === activityId);
    const discoveryImage = selected?.image;
    const currentState = latestSceneStateRef.current || sceneState;
    speakOptionName(selected?.name);
    sceneActions.updateState({
      childActivityChoice: activityId,
      childDiscoveries: appendUniqueDiscovery(currentState.childDiscoveries, { image: discoveryImage, name: selected.name })
    });
    triggerMiniGesture('center', 1200);
    triggerSparkleFx('single', 1500);
    triggerDiscoveryFly({ image: discoveryImage, name: selected.name }, { isChild: true, durationMs: CHILD_SELECTION_ADVANCE_DELAY_MS });

    safeSetTimeout(() => {
      speakLine(VOICE_LINES.childActivityCorrect, { moment: 'celebration' });
    }, DISCOVERY_CENTER_REACH_MS);

    safeSetTimeout(() => {
      playSparkle();
      advanceToChildPhase('child-friend-intro');
      setSelectedKidActivityId(null);
    }, CHILD_SELECTION_ADVANCE_DELAY_MS);
  };

  const handleActivityDrawingSave = (data) => {
    interruptCurrentVoice();
    playChime();
    setShowDrawingPad(false);
    setDrawingMode(null);
    const currentState = latestSceneStateRef.current || sceneState;
    triggerDiscoveryFly({ image: data.image, name: 'Drawing' }, { isChild: true, durationMs: CHILD_SELECTION_ADVANCE_DELAY_MS });
    sceneActions.updateState({
      childActivityDrawing: data.image,
      childDiscoveries: appendUniqueDiscovery(currentState.childDiscoveries, { image: data.image, name: 'Drawing' }),
      currentModal: null,
      draftData: null
    });
    triggerMiniGesture('center', 1200);
    triggerSparkleFx('single', 1500);

    safeSetTimeout(() => {
      speakLine(VOICE_LINES.childActivityCorrect, { moment: 'celebration' });
    }, DISCOVERY_CENTER_REACH_MS);

    safeSetTimeout(() => {
      playSparkle();
      advanceToChildPhase('child-friend-intro');
    }, CHILD_SELECTION_ADVANCE_DELAY_MS);
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
      <HomeButton onNavigate={(...args) => {
        interruptCurrentVoice();
        clearAllTimeouts();
        onNavigate?.(...args);
      }} />
      <ZoneBadgeButton zoneId="about-me-hut" onBack={() => {
        interruptCurrentVoice();
        clearAllTimeouts();
        onNavigate?.('zone-welcome');
      }} />
      <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />
      <VOReplayButton onReplay={replayCurrentVoice} disabled={!isAudioOn} />

      {discoveryFly && !['food-correct', 'color-correct', 'activity-correct', 'friend-correct'].includes(sceneState.gamePhase) && (
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
          {discoveryFly.showNameBelow && discoveryFly.name && (
            <div className="discovery-fly-label">{discoveryFly.name}</div>
          )}
        </div>
      )}

      {sparkleState.active && (
        <div className="favorite-sparkle-overlay" key={`favorite-sparkle-${sparkleState.key}`}>
          <SparkleAnimation
            type="magic"
            count={sparkleState.type === 'all' ? 42 : 14}
            color={sparkleState.type === 'all' ? 'rgba(255, 214, 102, 0.92)' : 'rgba(255, 210, 92, 0.98)'}
            size={sparkleState.type === 'all' ? 12 : 10}
            duration={sparkleState.type === 'all' ? 2400 : 1700}
            fadeOut
            area="full"
            key={sparkleState.key}
          />
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
                className={`choice-card ${showShake === food.id ? 'wrong' : ''} ${sceneState.correctChoiceId === food.id ? 'correct' : ''}`}
                onClick={() => handleFoodClick(food.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                disabled={sceneState.correctChoiceId !== null}
              >
                <div className="choice-image-container">
                  <img
                    src={food.image}
                    alt={food.name}
                    className={`choice-image ${food.correct && idleHintLevel === 1 ? 'hint' : ''} ${food.correct && idleHintLevel === 2 ? 'hint-strong' : ''} ${food.correct && idleHintLevel === 3 ? 'hint-final' : ''}`}
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
          <div className="correct-food">
            <img src={modakImg} alt="Modak" className="food-in-hand pop-in modak-special" />
          </div>
          {/* <div className="success-message">Yes! Modak is my favorite! ðŸŽ‰</div> */}
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
                className={`choice-card ${showShake === color.id ? 'wrong' : ''} ${sceneState.correctChoiceId === color.id ? 'correct' : ''}`}
                onClick={() => handleColorClick(color.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                disabled={sceneState.correctChoiceId !== null}
              >
                <div className="choice-image-container">
                  <img
                    src={color.image}
                    alt={color.name}
                    className={`choice-image ${color.correct && idleHintLevel === 1 ? 'hint' : ''} ${color.correct && idleHintLevel === 2 ? 'hint-strong' : ''} ${color.correct && idleHintLevel === 3 ? 'hint-final' : ''}`}
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
          <div className="correct-food">
            <img src={yellowImg} alt="Yellow" className="food-in-hand pop-in" style={{ width: '180px', height: '180px' }} />
          </div>
          {/* <div className="success-message">Yes! Orange is my favorite color! ðŸ§¡</div> */}
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
                className={`choice-card ${showShake === activity.id ? 'wrong' : ''} ${sceneState.correctChoiceId === activity.id ? 'correct' : ''}`}
                onClick={() => handleActivityClick(activity.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                disabled={sceneState.correctChoiceId !== null}
              >
                <div className="choice-image-container">
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className={`choice-image ${activity.correct && idleHintLevel === 1 ? 'hint' : ''} ${activity.correct && idleHintLevel === 2 ? 'hint-strong' : ''} ${activity.correct && idleHintLevel === 3 ? 'hint-final' : ''}`}
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
          <div className="correct-food">
            <img src={kidActSingImg} alt="Dancing" className="food-in-hand pop-in" style={{ width: '180px', height: '180px' }} />
          </div>
          {/* <div className="success-message">Yes! I love Dancing! ðŸ’ƒâœ¨</div> */}
        </div>
      )}

      {/* Friend Intro (commented out: flow now goes directly to friend-choice) */}
      {/* {sceneState.gamePhase === 'friend-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="friend-intro-box">
            <h2 className="friend-intro-text">Great! Now find my best friend!</h2>
            <button className="friend-intro-btn" onClick={handleStartFriendChoice}>Find Friend! ðŸŒŸ</button>
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
                data-id={friend.id}
                className={`choice-card ${showShake === friend.id ? 'wrong' : ''} ${sceneState.correctChoiceId === friend.id ? 'correct' : ''}`}
                onClick={() => handleFriendClick(friend.id)}
                style={{ animationDelay: `${index * 0.2}s` }}
                disabled={sceneState.correctChoiceId !== null}
              >
                <div className="choice-image-container">
                  <img
                    src={friend.image}
                    alt={friend.name}
                    className={`choice-image ${friend.correct && idleHintLevel === 1 ? 'hint' : ''} ${friend.correct && idleHintLevel === 2 ? 'hint-strong' : ''} ${friend.correct && idleHintLevel === 3 ? 'hint-final' : ''}`}
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
          <div className="correct-food">
            <img src={mouseImg} alt="Mooshika" className="food-in-hand pop-in" style={{ width: '180px', height: '180px' }} />
          </div>
          {/* <div className="success-message">Yes! Mooshika is my best friend! ðŸ­âœ¨</div> */}
        </div>
      )}

      {/* Child Intro */}
      {sceneState.gamePhase === 'child-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="child-phase-modal">
            <h2 className="child-phase-title">Your turn!</h2>
            <p className="child-phase-subtext">Show me your favorites!</p>
            <button className="child-phase-button" onClick={() => sceneActions.updateState({ gamePhase: 'child-food-choice' })}>
              Show Me!
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
                <img src={food.image} alt={food.name} className="choice-image" style={{ width: '80px', height: '80px' }} />
                <div className="kid-choice-name">{food.name}</div>
              </button>
            ))}
          </div>
          )}

          {!(selectedKidFoodId || sceneState.childFoodChoice || sceneState.childFoodDrawing || sceneState.childFoodText) && (
            <div className="custom-input-options child-food-actions">
              <div className="child-food-tools" ref={childFoodToolsRef}>
                {showChildFoodTools && (
                  <div className="child-food-tool-row">
                    <button className="child-food-tool-btn draw" onClick={() => {
                      playUiTap();
                      setShowChildFoodTools(false);
                      setShowDrawingPad(true);
                      setDrawingMode('food');
                      sceneActions.updateState({ currentModal: 'food-draw' }); // Track modal
                    }}>Draw</button>
                    <button className="child-food-tool-btn type" onClick={() => {
                      playUiTap();
                      setShowChildFoodTools(false);
                      setShowTextInput(true);
                      setTextInputMode('food');
                      sceneActions.updateState({ currentModal: 'food-type' }); // Track modal
                    }}>Type</button>
                  </div>
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

          {!discoveryFly && (selectedKidFoodId || sceneState.childFoodChoice || sceneState.childFoodDrawing || sceneState.childFoodText) && (
            <div className="child-completion-object">
              {sceneState.childFoodText ? (
                <div className="child-completion-text">{sceneState.childFoodText}</div>
              ) : (
                <img
                  src={sceneState.childFoodDrawing || kidFoods.find(f => f.id === (sceneState.childFoodChoice || selectedKidFoodId))?.image}
                  alt="Your favorite food"
                  className="child-completion-image"
                />
              )}
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
                  sanitizeEmoji(color.emoji, color.id)
                )}
              </button>
            ))}
          </div>
          )}

          {!discoveryFly && (selectedKidColorId || sceneState.childColor) && (
            <div className="child-completion-object">
              {sceneState.childColor?.startsWith?.('#') ? (
                <div
                  className="child-completion-color-swatch"
                  style={{ background: sceneState.childColor }}
                  aria-label={sceneState.childColorName || 'Your favorite color'}
                />
              ) : (
                <img
                  src={sceneState.childColor || kidColors.find(c => c.id === selectedKidColorId)?.image}
                  alt={sceneState.childColorName || kidColors.find(c => c.id === selectedKidColorId)?.name || 'Your favorite color'}
                  className="child-completion-image"
                />
              )}
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
                style={{
                  animationDelay: `${index * 0.1}s`,
                  position: 'absolute',
                  left: `${CHILD_ACTIVITY_POSITIONS[activity.id]?.left ?? 0}px`,
                  top: `${CHILD_ACTIVITY_POSITIONS[activity.id]?.top ?? 0}px`
                }}
                disabled={Boolean(sceneState.childActivityChoice || sceneState.childActivityDrawing || sceneState.childActivityText)}
              >
                <img src={activity.image} alt={activity.name} className="choice-image" style={{ width: '50px', height: '50px' }} />
                <div className="kid-choice-name">{activity.name}</div>
              </button>
            ))}
          </div>
          )}

          {!(selectedKidActivityId || sceneState.childActivityChoice || sceneState.childActivityDrawing || sceneState.childActivityText) && (
            <div className="custom-input-options child-activity-actions">
              <div className="child-activity-tools" ref={childActivityToolsRef}>
                {showChildActivityTools && (
                  <div className="child-food-tool-row">
                    <button className="child-food-tool-btn draw" onClick={() => {
                      playUiTap();
                      setShowChildActivityTools(false);
                      setShowDrawingPad(true);
                      setDrawingMode('activity');
                      sceneActions.updateState({ currentModal: 'activity-draw' }); // Track modal
                    }}>Draw</button>
                    <button className="child-food-tool-btn type" onClick={() => {
                      playUiTap();
                      setShowChildActivityTools(false);
                      setShowTextInput(true);
                      setTextInputMode('activity');
                      sceneActions.updateState({ currentModal: 'activity-type' }); // Track modal
                    }}>Type</button>
                  </div>
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

          {!discoveryFly && (selectedKidActivityId || sceneState.childActivityChoice || sceneState.childActivityDrawing || sceneState.childActivityText) && (
            <div className="child-completion-object">
              {sceneState.childActivityText ? (
                <div className="child-completion-text">{sceneState.childActivityText}</div>
              ) : (
                <img
                  src={sceneState.childActivityDrawing || kidActivities.find(a => a.id === (sceneState.childActivityChoice || selectedKidActivityId))?.image}
                  alt="Your favorite activity"
                  className="child-completion-image"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Child Friend Intro */}
      {/* Child Friend Input */}
      {sceneState.gamePhase === 'child-friend-input' && !sceneState.childFriendName && (
        <div className="friend-input-screen">
          {/*
            <LetterInputKeyboard
              onConfirm={(name) => {
                interruptCurrentVoice();
                playChime();
                sceneActions.updateState({
                  childFriendName: name,
                  childFriendLetters: name.split(''),
                  childDiscoveries: [...sceneState.childDiscoveries, { image: friendsImg, name }]
                });
                triggerMiniGesture('center', 1200);
                triggerSparkleFx('single', 1500);
                triggerDiscoveryFly(
                  { image: friendsImg, name },
                  { isChild: true, showNameBelow: true, durationMs: CHILD_FRIEND_ADVANCE_DELAY_MS }
                );
                safeSetTimeout(() => {
                  speakLine(VOICE_LINES.childFriendCorrect, { moment: 'celebration' });
                }, DISCOVERY_CENTER_REACH_MS);
                safeSetTimeout(() => {
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
              confirmButtonText="That's My Friend!"
              deleteButtonText="Delete"
            />
          */}

          <TextInputModal
            prompt="What's your friend's name?"
            maxLength={20}
            initialValue={sceneState.friendNameDraft || ''}
            onAutoSave={(val) => sceneActions.updateState({ friendNameDraft: val })}
            onSave={(name) => {
              interruptCurrentVoice();
              playChime();
              const currentState = latestSceneStateRef.current || sceneState;
              sceneActions.updateState({
                childFriendName: name,
                childFriendLetters: name.split(''),
                childDiscoveries: appendUniqueDiscovery(currentState.childDiscoveries, { image: friendsImg, name }),
                friendNameDraft: ''
              });
              triggerMiniGesture('center', 1200);
              triggerSparkleFx('single', 1500);
              triggerDiscoveryFly(
                { image: friendsImg, name },
                { isChild: true, showNameBelow: true, durationMs: CHILD_FRIEND_ADVANCE_DELAY_MS }
              );
              safeSetTimeout(() => {
                speakLine(VOICE_LINES.childFriendCorrect, { moment: 'celebration' });
              }, DISCOVERY_CENTER_REACH_MS);
              safeSetTimeout(() => {
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
            onCancel={() => {
              playUiTap();
              sceneActions.updateState({
                friendNameDraft: '',
                gamePhase: 'child-activity-choice'
              });
            }}
          />
        </div>
      )}

      {/* Drawing & Text Modals */}
      {showDrawingPad && (
        <div className="drawing-overlay">
          <DrawingPad
            prompt={drawingMode === 'food' ? "Draw your favorite food!" : "Draw your favorite activity!"}

            initialData={sceneState.draftData} // Restore draft
            onAutoSave={(data) => sceneActions.updateState({ draftData: data })} // Auto-save on stroke

            onSave={drawingMode === 'food' ? handleFoodDrawingSave : handleActivityDrawingSave}
            onCancel={handleDrawingCancel}
          />
        </div>
      )}

      {showTextInput && textInputMode === 'food' && (
        <TextInputModal
          prompt="What do you love eating?"

          initialValue={sceneState.draftData} // Restore text
          onAutoSave={(text) => sceneActions.updateState({ draftData: text })} // Auto-save on type

          onSave={(text) => {
            playChime();
            setShowTextInput(false);
            setTextInputMode(null);
            triggerDiscoveryFly({ image: pencilImg, name: text }, { isChild: true, durationMs: CHILD_SELECTION_ADVANCE_DELAY_MS });
            sceneActions.updateState({
              childFoodText: text,
              childDiscoveries: [{ image: pencilImg, name: text }],
              currentModal: null, // Clear modal
              draftData: null
            });
            triggerMiniGesture('center', 1200);
            triggerSparkleFx('single', 1500);

            safeSetTimeout(() => {
              speakLine(VOICE_LINES.childFoodCorrect, { moment: 'celebration' });
            }, DISCOVERY_CENTER_REACH_MS);

            safeSetTimeout(() => {
              playSparkle();
              advanceToChildPhase('child-color-choice');
            }, CHILD_SELECTION_ADVANCE_DELAY_MS);
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
          prompt="What do you love doing?"

          initialValue={sceneState.draftData} // Restore text
          onAutoSave={(text) => sceneActions.updateState({ draftData: text })} // Auto-save on type

          onSave={(text) => {
            playChime();
            setShowTextInput(false);
            setTextInputMode(null);
            const currentState = latestSceneStateRef.current || sceneState;
            triggerDiscoveryFly({ image: pencilImg, name: text }, { isChild: true, durationMs: CHILD_SELECTION_ADVANCE_DELAY_MS });
            sceneActions.updateState({
              childActivityText: text,
              childDiscoveries: appendUniqueDiscovery(currentState.childDiscoveries.slice(0, 2), { image: pencilImg, name: text }),
              currentModal: null, // Clear modal
              draftData: null
            });
            triggerMiniGesture('center', 1200);
            triggerSparkleFx('single', 1500);

            safeSetTimeout(() => {
              speakLine(VOICE_LINES.childActivityCorrect, { moment: 'celebration' });
            }, DISCOVERY_CENTER_REACH_MS);

            safeSetTimeout(() => {
              playSparkle();
              advanceToChildPhase('child-friend-intro');
            }, CHILD_SELECTION_ADVANCE_DELAY_MS);
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


      {/* COMPARISON CARD */}
      {sceneState.gamePhase === 'comparison-card' && !sceneState.showingCompletionScreen && (
        <AboutMeComparisonCard
          title="We're Friends Now!"
          leftColumn={{
            header: (
              <div className="profile-header">
                <img src={babyGaneshaSit} alt="Ganesha" className="column-header-image profile-avatar" />
                <span className="profile-name">Ganesha</span>
              </div>
            ),
            items: [
              { id: 'g-food', label: 'FOOD', imageSrc: modakImg, imageAlt: 'Modak', text: 'Modak' },
              { id: 'g-color', label: 'COLOR', imageSrc: yellowImg, imageAlt: 'Yellow', text: 'Yellow' },
              { id: 'g-activity', label: 'ACTIVITY', imageSrc: kidActSingImg, imageAlt: 'Dancing', text: 'Dancing' },
              { id: 'g-friend', label: 'FRIEND', imageSrc: mouseImg, imageAlt: 'Mooshika', text: 'Mooshika' },
            ]
          }}
          rightColumn={{
            header: (
              <div className="profile-header">
                <div
                  className="profile-avatar child-avatar-display"
                  style={{
                    background: (activeProfile?.icon || activeProfile?.profileIcon || profileAvatarImage) ? 'transparent' : 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                    border: (activeProfile?.icon || activeProfile?.profileIcon || profileAvatarImage) ? 'none' : '4px solid white',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    overflow: 'hidden'
                  }}
                >
                  {activeProfile?.icon ? (
                    <img src={activeProfile.icon} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : activeProfile?.profileIcon ? (
                    <img src={activeProfile.profileIcon} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : profileAvatarImage ? (
                    <img src={profileAvatarImage} alt={profileDisplayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    profileAvatar
                  )}
                </div>
                <span className="profile-name">{profileDisplayName}</span>
              </div>
            ),
            items: [
              {
                id: 'c-food',
                custom: (
                  <>
                    <div className="aboutme-comparison-item-label">FOOD</div>
                    <div className="aboutme-comparison-item-media">
                      {sceneState.childFoodText ? (
                        null
                      ) : sceneState.childFoodDrawing ? (
                        <img src={sceneState.childFoodDrawing} alt="Your food" className="aboutme-comparison-item-img" style={{ borderRadius: '4px' }} />
                      ) : (
                        <img src={kidFoods.find(f => f.id === sceneState.childFoodChoice)?.image} alt="Your food" className="aboutme-comparison-item-img" />
                      )}
                    </div>
                    <div className="aboutme-comparison-item-text">
                      {sceneState.childFoodText || (sceneState.childFoodDrawing ? 'Drawing' : kidFoods.find(f => f.id === sceneState.childFoodChoice)?.name)}
                    </div>
                  </>
                )
              },
              {
                id: 'c-color',
                custom: (
                  <>
                    <div className="aboutme-comparison-item-label">COLOR</div>
                    <div className="aboutme-comparison-item-media">
                      {sceneState.childColor?.startsWith('#') ? (
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: sceneState.childColor }} />
                      ) : (
                        <img src={sceneState.childColor} alt={sceneState.childColorName} className="aboutme-comparison-item-img" />
                      )}
                    </div>
                    <div className="aboutme-comparison-item-text">{sceneState.childColorName}</div>
                  </>
                )
              },
              {
                id: 'c-activity',
                custom: (
                  <>
                    <div className="aboutme-comparison-item-label">ACTIVITY</div>
                    <div className="aboutme-comparison-item-media">
                      {sceneState.childActivityText ? (
                        <img src={pencilImg} alt="Activity icon" className="aboutme-comparison-item-img" />
                      ) : sceneState.childActivityDrawing ? (
                        <img src={sceneState.childActivityDrawing} alt="Your activity" className="aboutme-comparison-item-img" style={{ borderRadius: '4px' }} />
                      ) : (
                        <img src={kidActivities.find(a => a.id === sceneState.childActivityChoice)?.image} alt="Your activity" className="aboutme-comparison-item-img" />
                      )}
                    </div>
                    <div className="aboutme-comparison-item-text">
                      {sceneState.childActivityText || (sceneState.childActivityDrawing ? 'Drawing' : kidActivities.find(a => a.id === sceneState.childActivityChoice)?.name)}
                    </div>
                  </>
                )
              },
              {
                id: 'c-friend',
                className: 'aboutme-best-friend-item',
                custom: (
                  <>
                    <div className="aboutme-comparison-item-label">BEST FRIEND</div>
                    <div className="aboutme-comparison-item-media">
                      <img src={friendsImg} alt="Best friend" className="aboutme-comparison-item-img" />
                    </div>
                    <div className="aboutme-comparison-item-text">{sceneState.childFriendName}</div>
                  </>
                )
              }
            ]
          }}
          onContinue={() => {
            playChime();
            hardStopSceneAudio();
            sceneActions.updateState({ completed: true, showingCompletionScreen: true });
          }}
          continueLabel="Continue"
        />
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
          childName={profileDisplayName}
          isFinalScene={false}
          completionData={{
            completed: true,
            stars: sceneState.stars || 2,
            childFood: sceneState.childFoodChoice || '',
            childColor: sceneState.childColor || '',
            childActivity: sceneState.childActivityChoice || ''
          }}
          onContinue={() => {
            playUiTap();
            hardStopSceneAudio();
            setTimeout(() => {
              hardStopSceneAudio();
              if (onNavigate) {
                onNavigate('dreams-wishes');
              } else if (onComplete) {
                onComplete();
              }
            }, 100);
          }}
          onReplay={() => {
            playUiTap();
            hardStopSceneAudio();
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
              friendNameDraft: '',
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
