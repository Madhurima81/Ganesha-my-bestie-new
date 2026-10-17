import { usePreloadPoses } from '../../../lib/components/animation/PoseImage';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Favoritefoodgame.css';
import SceneCompletionCelebration from "../../../lib/components/celebration/SceneCompletionCelebration";
import DrawingPad from '../components/Drawingpad';
import StoryProgressHeader from '../components/StoryProgressHeader';
import TextInputModal from '../components/Textinputmodal';
import LetterInputKeyboard from '../components/LetterInputKeyboard';
import AboutMeGaneshaHost from '../components/AboutMeGaneshaHost';
import AboutMeSparkle from '../components/AboutMeSparkle';
import DiscoveryFlight from '../components/DiscoveryFlight';
import GaneshaGestureCue from '../../../lib/components/gesture/GaneshaGestureCue';
import { useMiniGesture } from '../../../lib/hooks/useMiniGesture';

// Import SceneManager & Navigation
import SceneManager from "../../../lib/components/scenes/SceneManager";
import AboutMeComparisonCard from '../components/AboutMeComparisonCard';
import GameStateManager from '../../../lib/services/GameStateManager';
import ProgressManager from '../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../lib/services/SimpleSceneManager';

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
import ZoneBadgeButton from '../../../lib/components/navigation/ZoneBadgeButton';
import AudioToggle from '../../../lib/components/ui/AudioToggle';
import VOReplayButton from '../../../lib/components/feedback/VOReplayButton';
import useAudioPreference from '../../../lib/hooks/useAudioPreference';
import useVoiceGuidance from '../../../lib/hooks/useVoiceGuidance';
import { useGaneshaVoice } from '../../../lib/hooks/useGaneshaVoice';
import useGuardedReveal from '../../../lib/hooks/useGuardedReveal';
import { logSceneEvent } from '../../../lib/utils/sceneEventLog';
import { useGameSounds } from '../../../lib/hooks/useGameSounds';
import usePauseAwareTimeout from '../../../lib/hooks/usePauseAwareTimeout';
import useResumeCountdown from '../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../lib/components/feedback/ResumeCountdown';
import SceneStallPrompt from '../../../lib/components/feedback/SceneStallPrompt';

// ?hitzones outlines the real tap box of every button in the scene.
const SHOW_HIT_ZONES = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('hitzones');

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

// Mini gesture cue anchor points (% of scene) — matches the old
// .ganesha-gesture-cue--{food,color,activity,friend,center} CSS positions.
const MINI_GESTURE_ANCHORS = {
  food: { x: 31, y: 35 },
  color: { x: 68, y: 35 },
  activity: { x: 31, y: 60 },
  friend: { x: 68, y: 60 },
  center: { x: 50, y: 30 },
};

// =========================================================
// 1. MAIN WRAPPER (Handles SceneManager)
// =========================================================
const FavoriteFoodGame = ({ onComplete, onBack, onNavigate, zoneId = 'about-me-hut', sceneId = 'favorite-food' }) => {
  return (
    <ErrorBoundary>
      <SceneManager
        flushKeys={['gamePhase']}
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
          currentModal: null, // 'food-draw', 'activity-draw'
          draftData: null,    // Stores incomplete drawing/text

          // "Success line finished" markers, saved when each line really ends. Continue replays a
          // solved beat's line only if the child left during it. Each one is also cleared in the
          // Play Again handler (KNOWN_PITFALLS 11d).
          foodSuccessDone: false,
          colorSuccessDone: false,
          activitySuccessDone: false,
          friendSuccessDone: false,
          childFoodDone: false,
          childColorDone: false,
          childActivityDone: false,
          childFriendDone: false,

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
const SCENE_IMAGES = [
  foodBg,
  babyGaneshaImg,
  babyGaneshaSit,
  modakImg,
  ladooImg,
  barfiImg,
  mouseImg,
  cowImg,
  peacockImg,
  favIconFood,
  favIconColor,
  favIconActivity,
  pencilImg,
  redImg,
  orangeImg,
  yellowImg,
  greenImg,
  blueImg,
  purpleImg,
  pinkImg,
  brownImg,
  actEatingImg,
  actDancingImg,
  actReadingImg,
  actPlayingImg,
  actTvImg,
  actDrawImg,
  kidActSportsImg,
  kidActReadImg,
  kidActArtImg,
  kidActSingImg,
  kidActCookImg,
  kidActNatureImg,
  kidActStemImg,
  kidActGameImg,
  pizzaImg,
  burgerImg,
  icecreamImg,
  noodlesImg,
  fruitImg,
  dosaImg,
  riceImg,
  friendsImg,
];

const FavoriteFoodGameContent = ({ sceneState, sceneActions, isReload, onComplete, onNavigate, onBack }) => {
  usePreloadPoses(SCENE_IMAGES);

  useEffect(() => {
    SimpleSceneManager.setCurrentScene('about-me-hut', 'favorite-food', false, false);
  }, []);

  const VOICE_LINES = {
    // Ganesha Section - Food
    foodQuestion: "Can you guess my favorite food?",
    foodCorrect: "Yes — I love modak!",

    // Ganesha Section - Color
    colorQuestion: "Can you guess my favorite color?",
    colorCorrect: "Yes — red!",

    // Ganesha Section - Activity
    activityQuestion: "What do you think I love doing?",
    activityCorrect: "Yes — I love to dance!",

    // Ganesha Section - Friend
    friendQuestion: "Who do you think my friend is?",
    friendCorrect: "Yes — Mooshika!",

    // Transition to Child Section
    childIntro: "Now I want to know your favorites.",

    // Child Section - Food
    childFoodQuestion: "Choose your favorite food.",
    childFoodCorrect: "Yummy!",

    // Child Section - Color
    childColorQuestion: "Choose your favorite color.",
    childColorCorrect: "Nice choice!",

    // Child Section - Activity
    childActivityQuestion: "Choose something you love to do.",
    childActivityCorrect: "That sounds like fun!",

    // Child Section - Friend
    childFriendQuestion: "Add the name of a friend you care about.",
    childFriendCorrect: "Thanks for telling me!",

    // Connection Moment (emotional beat)
    friendCelebration: "Now we know some things we each enjoy.",
    completionCelebration: "",

    // Idle Hints (Ganesha Section)
    foodHint: "Look for the sweet I love.",
    colorHint: "What color is an apple?",
    activityHint: "What lets me move to music?",
    friendHint: "Look for my tiny friend."
  };

  if (!sceneState) return <div>Loading...</div>;

  // Get content from configs
  const openingModalContent = getOpeningModal('about-me-hut', 'favorite-food');
  const completionModalContent = getCompletionModal('about-me-hut', 'favorite-food');
  const completionIcons = ['food', 'color', 'activity'];
  const activeProfile = GameStateManager.getCurrentProfile?.() || null;
  const profileDisplayName = (activeProfile?.name || sceneState.childFriendName || 'You').trim();
  const rawProfileAvatar = activeProfile?.avatar;
  const profileEmojiToAnimal = {
    '🐵': 'monkey',
    '🦚': 'peacock',
    '🐿️': 'squirrel',
    '🐯': 'tiger'
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

  // ── Resume Delay (shared across pause/resume logic) ──────────────────────────
  const RESUME_DELAY_MS = 3000;
  const RESUME_SETTLE_SENTINEL = '__resume__';
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

  // ── Callbacks for pause/resume ────────────────────────────────────────────────
  const onReturnHint = () => {
    // Optional: trigger visual hint on return (e.g., mini gesture, glow)
  };

  // ── T08/T09: visibility + idle timer infrastructure ──────────────────────────
  const { startIdleTimer, stopIdleTimer, setCurrentPhase, stopVoice, muteVoicePlayback, setVoiceVolume, startMusic, stopMusic, playVoice } = useVoiceGuidance(
    'about-me-hut', 'favorite-food', {
      enableMusic: true,
      musicVolume: 0.06,
      idleTimeout: 20,
      resumeDelay: RESUME_DELAY_MS,  // ← Wait before replaying VO
      onReturnHint                     // ← Called when child returns
    }
  );
  const { playUiTap, playWrongTap, playSparkle, playChime, playGlow, setGlobalVolume } = useGameSounds();
  const { speak, stop: stopSpokenVoice, mute: muteSpokenVoice } = useGaneshaVoice();
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

  // Mute (DECISIONS.md 2026-09-29): silence in-flight speech + MP3 now, but let each
  // line's callback fire on schedule. Unmuting never resumes the old line.
  useEffect(() => {
    if (!isAudioOn) {
      muteSpokenVoice();
      muteVoicePlayback();
    }
  }, [isAudioOn, muteSpokenVoice, muteVoicePlayback]);

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
      // The idle-hint timers are raw setTimeouts (not pause-aware): clear them so no hint voice or
      // glow fires while the tab is hidden. onShow bumps resumeHintCycleKey, which re-arms the Ganesha
      // ladder; the child repeat re-arms when the replayed question line ends (phaseVoiceDone).
      if (ganeshaIdleTimerRef.current) { clearTimeout(ganeshaIdleTimerRef.current); ganeshaIdleTimerRef.current = null; }
      if (childIdleTimerRef.current) { clearTimeout(childIdleTimerRef.current); childIdleTimerRef.current = null; }
      setIdleHintLevel(0);
      idleHintVoiceRef.current = false;
      childEntryVoRepeatRef.current = false;
      setDiscoveryFly(null);
      setSparkleState(prev => ({ ...prev, active: false }));
      hideMiniGesture();
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

  // Leaving the scene (any route, not only the zone badge): pending scene timers must not fire
  // afterwards - an advance timer would write the next phase to saved progress after the child left
  // (KNOWN_PITFALLS 11c). The resume effect's handled flag is reset here too, so StrictMode's
  // simulated remount re-schedules the resume timers this cleanup just cleared (KNOWN_PITFALLS 1).
  // Set alive true in the effect body so that remount leaves it true.
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      reloadHandledRef.current = false;
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

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
  const [selectedKidFoodId, setSelectedKidFoodId] = useState(null);
  const [selectedKidColorId, setSelectedKidColorId] = useState(null);
  const [selectedKidActivityId, setSelectedKidActivityId] = useState(null);
  const [showChildFoodTools, setShowChildFoodTools] = useState(false);
  const [showChildActivityTools, setShowChildActivityTools] = useState(false);

  const [discoveryFly, setDiscoveryFly] = useState(null);
  const [revealConfig, setRevealConfig] = useState(null);
  const revealConfigRef = useRef(null);
  revealConfigRef.current = revealConfig;
  const {
    showRevealOnce,
    markShown,
    resetReveals,
    expectReveal,
    stall: revealStall,
    resolveStall: resolveRevealStall,
  } = useGuardedReveal({
    sceneKey: 'favorite-food',
    getRevealConfig: () => revealConfigRef.current,
    setRevealConfig,
  });

  // Idle hint state for Ganesha choices (0: none, 1: wobble@10s, 2: VO@18s, 3: strong glow@26s)
  const [idleHintLevel, setIdleHintLevel] = useState(0);
  const [resumeHintCycleKey, setResumeHintCycleKey] = useState(0);
  const idleHintVoiceRef = useRef(false);
  const ganeshaIdleTimerRef = useRef(null);
  const childIdleTimerRef = useRef(null);
  const childEntryVoRepeatRef = useRef(false);
  // Gates the idle-hint ladders below: the countdown only starts once the
  // phase's own question VO has actually finished (onEnd), not the instant
  // the phase is entered — otherwise a hint could fire while Ganesha/the
  // child is still talking.
  const [phaseVoiceDone, setPhaseVoiceDone] = useState(false);

  // Mini gesture (thumbs up) on successful taps
  const { miniGesture, triggerMiniGesture: triggerMiniGestureRaw, hideMiniGesture } = useMiniGesture();
  const triggerMiniGesture = useCallback(
    (target = 'center', durationMs = 1500) => {
      triggerMiniGestureRaw('thumbsup', 'anchored', durationMs, MINI_GESTURE_ANCHORS[target] || MINI_GESTURE_ANCHORS.center);
    },
    [triggerMiniGestureRaw]
  );
  const [sparkleState, setSparkleState] = useState({ active: false, key: 0, type: 'single' });
  const sparkleTimerRef = useRef(null);

  // Reload Logic Refs
  const reloadHandledRef = useRef(false);
  // Decided once at mount: re-entering with saved progress (Continue from the map, app
  // relaunch, or a browser reload). `isReload` alone is only true for a browser refresh.
  const resumedOnMountRef = useRef(isReload || (!!sceneState?.lastSaved && sceneState?.gamePhase !== 'intro'));
  const hasHydratedOnceRef = useRef(false);
  const latestSceneStateRef = useRef(sceneState);
  const suppressCelebrationVoOnReloadRef = useRef(false);
  const suppressPhaseVoUntilReloadSettlesRef = useRef(false);
  const expectedReloadPhaseRef = useRef(null);
  const lastChildCompletionResumeKeyRef = useRef(0);
  const resumePopupTimeoutRef = useRef(null);
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
      emoji: item.emoji,
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

  // What is speaking right now ({ token, text, startedAt }) and a counter that names each requested line.
  // Both feed the scene event log (read it in the console with __sceneLog().food after a cut / overlap /
  // repeat) and let an idle HINT wait instead of cutting a line that is still speaking.
  const lineTokenRef = useRef(0);
  const speakingRef = useRef(null);
  const SPEAKING_STALE_MS = 15000; // Web Speech sometimes never reports an end: don't block hints forever
  const speakLine = useCallback((text, options = {}) => {
    if (!text) {
      options.onEnd?.();
      return;
    }
    const { onEnd, moment = 'encouragement', ignoreCancel = false, priority = 'normal', waitForCurrent = false, waitedMs = 0 } = options;
    const now = Date.now();
    const speaking = speakingRef.current;
    const stillSpeaking = speaking && (now - speaking.startedAt) < SPEAKING_STALE_MS;
    if (priority === 'hint' && stillSpeaking) {
      // A hint never cuts the line that is speaking. Its continuation (arming the answer glow) still runs.
      logSceneEvent('food', 'speak:hint-skipped', { text, speaking: speaking.text });
      onEnd?.();
      return;
    }
    if (waitForCurrent && stillSpeaking && waitedMs < 3500) {
      // A success line never cuts the word the child just tapped ("Pizza" ... "Yummy!"): it waits for
      // the line that is speaking to end (up to 3.5 s), then speaks.
      logSceneEvent('food', 'speak:waiting-for-current', { text, current: speaking.text });
      safeSetTimeout(() => speakLineRef.current?.(text, { ...options, waitedMs: waitedMs + 150 }), 150);
      return;
    }
    const token = ++lineTokenRef.current;
    if (stillSpeaking) {
      // useGaneshaVoice.speak() waits ~50 ms after cancel(); a newer line inside that window silently drops
      // the pending one WITHOUT calling its onEnd. Logged so a "line never played" can be traced to this.
      logSceneEvent('food', speaking.began ? 'speak:cuts' : 'speak:dropped-before-start', { text, cut: speaking.text });
    }
    speakingRef.current = { token, text, startedAt: now, began: false };
    logSceneEvent('food', 'speak:start', { token, text, priority });
    // Stop both engines first: useVoiceGuidance's own idle timer can fire its
    // hook-driven playVoice() independently of this scene's speakLine calls —
    // without this, a still-playing idle-hint MP3 keeps going under this line
    // (same two-speech-source issue as Family Tree).
    stopVoice();
    stopSpokenVoice();
    // A line that ends (or is cancelled) after the scene was left must not run its callback
    // (KNOWN_PITFALLS 11b/11c). `ignoreCancel` is for lines that save a "done" marker: a cancelled or
    // interrupted line is not a finished line.
    let cancelled = false;
    speak(text, {
      age: 7, style: 'child', moment,
      onStart: () => { if (speakingRef.current?.token === token) speakingRef.current.began = true; },
      onError: (e) => { if (e?.error === 'canceled' || e?.error === 'interrupted') cancelled = true; },
      onEnd: () => {
        const stale = lineTokenRef.current !== token;
        if (speakingRef.current?.token === token) speakingRef.current = null;
        logSceneEvent('food', cancelled ? 'speak:cancelled' : 'speak:end', { token, text, stale });
        if (!aliveRef.current) return;
        if (ignoreCancel && cancelled) return;
        onEnd?.();
      },
    });
  }, [isAudioOn, speak, stopVoice, stopSpokenVoice, safeSetTimeout]);
  const speakLineRef = useRef(null);
  speakLineRef.current = speakLine;

  // A success line that saves its own "done" marker the moment it really finishes. Continue replays an
  // unfinished success line and skips a finished one (KNOWN_PITFALLS 7). The 300 ms floor only rejects
  // an instant speech error; the shortest line ("Yummy!") takes longer.
  const speakSuccessLine = (text, doneKey, moment = 'celebration') => {
    const startedAt = Date.now();
    speakLine(text, {
      moment,
      ignoreCancel: true,
      waitForCurrent: true,
      onEnd: () => {
        if (Date.now() - startedAt < 300) return;
        sceneActions.checkpoint({ [doneKey]: true });
      },
    });
  };
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
    { id: 'modak', name: 'Modak', image: modakImg, emoji: '🥟', correct: true },
    { id: 'ladoo', name: 'Ladoo', image: ladooImg, emoji: '🍪', correct: false },
    { id: 'barfi', name: 'Barfi', image: barfiImg, emoji: '🥞', correct: false }
  ];

  const friends = [
    { id: 'mouse', name: 'Mooshika', image: mouseImg, emoji: '🐭', correct: true },
    { id: 'cow', name: 'Cow', image: cowImg, emoji: '🐮', correct: false },
    { id: 'peacock', name: 'Peacock', image: peacockImg, emoji: '🦚', correct: false }
  ];

  const colors = [
    { id: 'red', name: 'Red', image: redImg, correct: true },
    { id: 'orange', name: 'Orange', image: orangeImg, correct: false },
    { id: 'yellow', name: 'Yellow', image: yellowImg, correct: false },
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
    { id: 'pizza', name: 'Pizza', image: pizzaImg, emoji: '🍕' },
    { id: 'burger', name: 'Burger', image: burgerImg, emoji: '🍔' },
    { id: 'ice-cream', name: 'Ice Cream', image: icecreamImg, emoji: '🍦' },
    { id: 'dosa', name: 'Dosa', image: dosaImg, emoji: '🥞' },
    { id: 'noodles', name: 'Noodles', image: noodlesImg, emoji: '🍜' },
    { id: 'fruit', name: 'Fruit', image: fruitImg, emoji: '🍎' },
    { id: 'rice', name: 'Rice', image: riceImg, emoji: '🍚' }
  ];

  const kidActivities = [
    { id: 'reading', name: 'Reading', image: kidActReadImg, emoji: 'read' },
    { id: 'drawing', name: 'Drawing', image: kidActArtImg, emoji: 'art' },
    { id: 'dancing', name: 'Dancing', image: kidActSingImg, emoji: 'dance' },
    { id: 'sports', name: 'Play & Games', image: kidActSportsImg, emoji: 'play' },
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
    cooking: { left: 110, top: 190 },
    nature: { left: 300, top: 190 },
    stem: { left: 490, top: 190 },
    games: { left: 680, top: 190 },
    myown: { left: 680, top: 190 }
  };

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
  }, [isReload, sceneActions, sceneState.randomFoods.length]);

  useEffect(() => {
    return () => {
      if (discoveryFlyTimeoutRef.current) clearTimeout(discoveryFlyTimeoutRef.current);
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

  // The header strip of Ganesha's answers, rebuilt from how many beats are finished. Its own save used
  // to lag the solve, so a Continue could show a header missing the answer the child just found.
  const getGaneshaDiscoveries = (count) => [
    { image: modakImg, name: 'Modak' },
    { image: redImg, name: 'Red' },
    { image: kidActSingImg, name: 'Dancing' },
    { image: mouseImg, name: 'Mooshika' },
  ].slice(0, count);

  // --- RELOAD DETECTION & RESTORATION LOGIC ---
  useEffect(() => {
    if (resumedOnMountRef.current && !reloadHandledRef.current) {
      // If reload is true but state is still at the initial placeholder intro
      // (before persisted temp_session is fully reflected), wait one more render.
      // This prevents missing celebration phases like food-correct on reload.
      const hasPersistedState = !!sceneState?.lastSaved;
      if (!hasPersistedState && sceneState?.gamePhase === 'intro' && !sceneState?.currentModal) {
        return;
      }

      reloadHandledRef.current = true;
      const { gamePhase } = sceneState;
      const { currentModal } = sceneState;
      suppressPhaseVoUntilReloadSettlesRef.current = false;
      expectedReloadPhaseRef.current = null;

      if (import.meta.env.DEV) {
        console.log("🔄 Reload detected. Phase:", gamePhase, "Modal:", currentModal);
      }

      if (resumePopupTimeoutRef.current) clearTimeout(resumePopupTimeoutRef.current);
      // --- 1. RESTORE MODALS (Drawing) ---
      if (currentModal) {
        if (currentModal === 'food-draw' || currentModal === 'food-type') {
          setDrawingMode('food');
          setShowDrawingPad(true);
        } else if (currentModal === 'activity-draw' || currentModal === 'activity-type') {
          setDrawingMode('activity');
          setShowDrawingPad(true);
        }
        return; // Stop here if we restored a modal
      }

      // --- 2. A SOLVED beat (saved at the solving tap) ---
      // Show its finished state, replay the success line ONLY if the child left during it, then
      // move on. Child content (picks, drawings, typed names) is never cleared here. (KNOWN_PITFALLS 7)
      // The phase-entry effect stays silent (sentinel) until this branch releases it.
      const ganeshaSolvedPhase = (gamePhase === 'food-choice' && sceneState.selectedFood) ? 'food-correct' : gamePhase;
      const ganeshaSolved = {
        'food-correct': { count: 1, doneKey: 'foodSuccessDone', voiceFlag: 'foodCorrect', line: VOICE_LINES.foodCorrect, next: 'color-choice', nextLine: VOICE_LINES.colorQuestion, nextFlag: 'colorQuestion', nextMoment: 'thinking' },
        'color-correct': { count: 2, doneKey: 'colorSuccessDone', voiceFlag: 'colorCorrect', line: VOICE_LINES.colorCorrect, next: 'activity-choice', nextLine: VOICE_LINES.activityQuestion, nextFlag: 'activityQuestion', nextMoment: 'thinking' },
        'activity-correct': { count: 3, doneKey: 'activitySuccessDone', voiceFlag: 'activityCorrect', line: VOICE_LINES.activityCorrect, next: 'friend-choice', nextLine: VOICE_LINES.friendQuestion, nextFlag: 'friendQuestion', nextMoment: 'thinking' },
        'friend-correct': { count: 4, doneKey: 'friendSuccessDone', voiceFlag: 'friendCorrect', line: VOICE_LINES.friendCorrect, next: 'child-intro', nextLine: VOICE_LINES.childIntro, nextFlag: 'childIntro', nextMoment: 'encouragement' },
      }[ganeshaSolvedPhase];
      if (ganeshaSolved && !currentModal) {
        suppressPhaseVoUntilReloadSettlesRef.current = true;
        expectedReloadPhaseRef.current = RESUME_SETTLE_SENTINEL;
        clearAllTimeouts();
        interruptCurrentVoice();
        phaseVoiceRef.current = {};
        resetIdleHints();
        setShowShake(null);
        // The header is rebuilt from the beats finished so far (its own save lagged the solve).
        const solvedDiscoveries = getGaneshaDiscoveries(ganeshaSolved.count);
        const releaseGuard = () => {
          suppressPhaseVoUntilReloadSettlesRef.current = false;
          expectedReloadPhaseRef.current = null;
        };
        const settled = { wrongChoices: [], correctChoiceId: null, storyDiscoveries: solvedDiscoveries };
        if (sceneState[ganeshaSolved.doneKey]) {
          // Finished before the child left: show the NEXT question straight away (showing the finished
          // one for half a second looked like a glitch). Its line waits the 500 ms first-instant delay;
          // the phase-entry effect stays silent until then.
          sceneActions.updateState({ ...settled, gamePhase: ganeshaSolved.next });
          safeSetTimeout(() => {
            releaseGuard();
            phaseVoiceRef.current[ganeshaSolved.nextFlag] = true;
            speakLine(ganeshaSolved.nextLine, { moment: ganeshaSolved.nextMoment, onEnd: () => setPhaseVoiceDone(true) });
          }, 500);
        } else {
          // Left during the success line: show the celebration state and replay the line. The
          // auto-advance effect moves on to the next question afterwards.
          sceneActions.updateState({ ...settled, gamePhase: ganeshaSolvedPhase });
          safeSetTimeout(() => {
            releaseGuard();
            phaseVoiceRef.current[ganeshaSolved.voiceFlag] = true;
            speakSuccessLine(ganeshaSolved.line, ganeshaSolved.doneKey);
          }, 500);
        }
        return;
      }

      const childSolved = {
        'child-food-choice': { solved: !!(sceneState.childFoodChoice || sceneState.childFoodDrawing || sceneState.childFoodText), doneKey: 'childFoodDone', voiceFlag: 'childFoodQuestion', line: VOICE_LINES.childFoodCorrect, next: 'child-color-choice', nextLine: VOICE_LINES.childColorQuestion, nextFlag: 'childColorQuestion', nextDelay: 500 },
        'child-color-choice': { solved: !!sceneState.childColor, doneKey: 'childColorDone', voiceFlag: 'childColorQuestion', line: VOICE_LINES.childColorCorrect, next: 'child-activity-choice', nextLine: VOICE_LINES.childActivityQuestion, nextFlag: 'childActivityQuestion', nextDelay: 500 },
        'child-activity-choice': { solved: !!(sceneState.childActivityChoice || sceneState.childActivityDrawing || sceneState.childActivityText), doneKey: 'childActivityDone', voiceFlag: 'childActivityQuestion', line: VOICE_LINES.childActivityCorrect, next: 'child-friend-intro', nextLine: VOICE_LINES.childFriendQuestion, nextFlag: 'childFriendQuestion', nextDelay: 500 },
        'child-friend-input': { solved: !!sceneState.childFriendName, doneKey: 'childFriendDone', voiceFlag: 'childFriendQuestion', line: VOICE_LINES.childFriendCorrect, next: 'comparison-card', nextLine: VOICE_LINES.friendCelebration, nextFlag: 'friendCelebration', nextDelay: 1000 },
      }[gamePhase];
      if (childSolved?.solved) {
        suppressPhaseVoUntilReloadSettlesRef.current = true;
        expectedReloadPhaseRef.current = RESUME_SETTLE_SENTINEL;
        clearAllTimeouts();
        interruptCurrentVoice();
        phaseVoiceRef.current = {};
        // The question was already answered: the phase-entry effect must not ask it again.
        phaseVoiceRef.current[childSolved.voiceFlag] = true;
        resetIdleHints();
        const advance = () => {
          suppressPhaseVoUntilReloadSettlesRef.current = false;
          expectedReloadPhaseRef.current = null;
          advanceToChildPhase(childSolved.next);
        };
        if (sceneState[childSolved.doneKey]) {
          // Finished before the child left: show the next question at once (no flash of the answered one).
          // Its line waits for the first-instant delay; the phase-entry effect stays silent until then.
          advanceToChildPhase(childSolved.next);
          safeSetTimeout(() => {
            suppressPhaseVoUntilReloadSettlesRef.current = false;
            expectedReloadPhaseRef.current = null;
            phaseVoiceRef.current[childSolved.nextFlag] = true;
            speakLine(childSolved.nextLine, { moment: 'thinking', onEnd: () => setPhaseVoiceDone(true) });
          }, childSolved.nextDelay);
        } else {
          safeSetTimeout(() => {
            const startedAt = Date.now();
            speakLine(childSolved.line, {
              moment: 'celebration',
              ignoreCancel: true,
              onEnd: () => {
                if (Date.now() - startedAt >= 300) sceneActions.checkpoint({ [childSolved.doneKey]: true });
                safeSetTimeout(advance, 800);
              },
            });
          }, 500);
        }
        return;
      }

      const ganeshaRestartPhaseMap = {
        'food-choice': 'food-choice',
        // A '-correct' celebration is handled above (solved beat); these remain for old saves.
        'food-correct': 'color-choice',
        'color-choice': 'color-choice',
        'color-correct': 'activity-choice',
        'activity-choice': 'activity-choice',
        'activity-correct': 'friend-choice',
        'friend-intro': 'friend-choice',
        'friend-choice': 'friend-choice',
        'friend-correct': 'friend-choice' // handled above: resumes at child-intro
      };
      const childPhases = ['child-food-choice', 'child-color-choice', 'child-activity-choice', 'child-friend-input'];

      if (gamePhase === 'child-intro') {
        suppressPhaseVoUntilReloadSettlesRef.current = true;
        expectedReloadPhaseRef.current = RESUME_SETTLE_SENTINEL;
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
          }, 500);
        }
        safeSetTimeout(() => {
          suppressPhaseVoUntilReloadSettlesRef.current = false;
          expectedReloadPhaseRef.current = null;
        }, 520);
        return;
      }

      const restartPhase = ganeshaRestartPhaseMap[gamePhase];
      if (restartPhase) {
        // The phase-entry effect must stay silent until the resume line below plays: if it also
        // speaks, the first line is cut ~0.5 s in by the second ("Cho... Choose your color").
        // '__resume__' never matches a phase, so the effect keeps returning until the timer releases it.
        suppressPhaseVoUntilReloadSettlesRef.current = true;
        expectedReloadPhaseRef.current = RESUME_SETTLE_SENTINEL;
        // Reload rule: in any Ganesha phase (choice/hint/celebration), restart from phase entry.
        // Celebration phases now resume at the next question, so there is no celebration VO to suppress.
        suppressCelebrationVoOnReloadRef.current = false;
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
          storyDiscoveries: getGaneshaDiscoveries(maxDiscoveries)
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
          // Muted: speakLine finishes on the hook's silent timer, so onEnd still arms the hint clock.
          safeSetTimeout(() => {
            if (reloadVoFired.fired) return;
            reloadVoFired.fired = true;
            phaseVoiceRef.current[ganeshaVoiceKey] = true;
            speakLine(ganeshaEntryLine, { moment: 'thinking', onEnd: () => setPhaseVoiceDone(true) });
          }, 500);
        }
        safeSetTimeout(() => {
          suppressPhaseVoUntilReloadSettlesRef.current = false;
          expectedReloadPhaseRef.current = null;
        }, 520);
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
          // Keep the phase-entry effect silent until this line plays (see the Ganesha branch above).
          suppressPhaseVoUntilReloadSettlesRef.current = true;
          expectedReloadPhaseRef.current = RESUME_SETTLE_SENTINEL;
          safeSetTimeout(() => {
            if (reloadVoFired.fired) return;
            reloadVoFired.fired = true;
            phaseVoiceRef.current[childVoiceKey] = true;
            speakLine(childEntryLine, { moment: 'thinking', onEnd: () => setPhaseVoiceDone(true) });
          }, 500);
          // Same-phase child reloads may skip phase-effect rerun; keep guard state clean.
          safeSetTimeout(() => {
            suppressPhaseVoUntilReloadSettlesRef.current = false;
            expectedReloadPhaseRef.current = null;
          }, 520);
        }
        return;
      }
    }
  }, [isReload, sceneState.gamePhase, isAudioOn]);

  // Auto-transition Handler (Fixes frozen screens)
  const showComparisonCardOnce = useCallback(() => (
    showRevealOnce('favorite-food-comparison', { id: 'favorite-food-comparison', phase: 'comparison-card' }, 'live')
  ), [showRevealOnce]);

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
      expectReveal(
        'favorite-food-comparison',
        { id: 'favorite-food-comparison', phase: 'comparison-card' },
        'live',
      );
      cancelTimer = safeSetTimeout(showComparisonCardOnce, FRIEND_CELEBRATION_ADVANCE_DELAY_MS);
    }

    return () => cancelTimer?.();
  }, [
    sceneState.gamePhase,
    GANESHA_CORRECT_ADVANCE_DELAY_MS,
    GANESHA_FOOD_CORRECT_ADVANCE_DELAY_MS,
    GANESHA_FRIEND_CORRECT_ADVANCE_DELAY_MS,
    FRIEND_CELEBRATION_ADVANCE_DELAY_MS,
    safeSetTimeout,
    resumeHintCycleKey,
    expectReveal,
    showComparisonCardOnce,
  ]);

  useEffect(() => {
    if (revealConfig && sceneState.gamePhase !== 'comparison-card') {
      sceneActions.updateState({ gamePhase: 'comparison-card' });
    }
  }, [revealConfig, sceneActions, sceneState.gamePhase]);

  useEffect(() => {
    if (sceneState.gamePhase !== 'comparison-card') return undefined;
    markShown('favorite-food-comparison');
    setRevealConfig(null);
    return undefined;
  }, [markShown, sceneState.gamePhase]);

  useEffect(() => {
    if (sceneState.gamePhase === 'intro') {
      phaseVoiceRef.current = {};
      setVoiceVolume(isAudioOn ? OPENING_VO_VOLUME : 0);
      // No playVoice('opening') here: the shared OpeningModal speaks this same line itself on mount, and
      // a second copy cut the first (same fix as Family Tree and Dreams). The replay button still plays it.
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
      nextPhase = 'comparison-card';
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
      sceneActions.updateState({ gamePhase: nextPhase });
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

  // Safety net: the resume guard above silences every phase line until the resume code releases it with a
  // timer. If that timer is ever lost (cleared by another clearAllTimeouts, a remount) the guard stays on
  // and the next success / question line never plays. Release it if it has been on for ~2 s.
  useEffect(() => {
    let onTicks = 0;
    const id = window.setInterval(() => {
      if (!suppressPhaseVoUntilReloadSettlesRef.current) { onTicks = 0; return; }
      onTicks += 1;
      if (onTicks >= 4) {
        logSceneEvent('food', 'resume-guard:force-released', { phase: latestSceneStateRef.current?.gamePhase, expected: expectedReloadPhaseRef.current });
        suppressPhaseVoUntilReloadSettlesRef.current = false;
        expectedReloadPhaseRef.current = null;
        onTicks = 0;
      }
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const celebrationPhases = ['food-correct', 'color-correct', 'activity-correct', 'friend-correct'];

    // Reload stabilization guard:
    // block stale VO from pre-restore phases until the expected reload phase is active.
    if (suppressPhaseVoUntilReloadSettlesRef.current) {
      const expectedPhase = expectedReloadPhaseRef.current;
      if (!expectedPhase || sceneState.gamePhase !== expectedPhase) {
        logSceneEvent('food', 'phase-vo:blocked-by-resume-guard', { phase: sceneState.gamePhase, expected: expectedPhase });
        // This blocked run IS the first run after mount, so the "first run after a reload" check below
        // must not fire on a later run: it treated the child's first real answer after a Continue as a
        // reload landing in a celebration and skipped its success line (the line never played).
        hasHydratedOnceRef.current = true;
        return;
      }
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
        logSceneEvent('food', 'phase-vo:skipped-celebration-on-first-run', { phase: sceneState.gamePhase });
        return;
      }
    }

    // Collect all timeouts for cleanup
    const timers = [];

    // Ganesha's questions — idle-hint ladders below wait on phaseVoiceDone,
    // so reset it here and flip it true only once this question VO ends.
    // If the question was already spoken earlier (e.g. resumed mid-phase),
    // there's no VO left to wait for, so mark it done immediately.
    const ganeshaQuestionFlagByPhase = {
      'food-choice': 'foodQuestion',
      'color-choice': 'colorQuestion',
      'activity-choice': 'activityQuestion',
      'friend-choice': 'friendQuestion',
    };
    const ganeshaQuestionFlag = ganeshaQuestionFlagByPhase[sceneState.gamePhase];
    if (ganeshaQuestionFlag) {
      setPhaseVoiceDone(!!phaseVoiceRef.current[ganeshaQuestionFlag]);
    }

    if (sceneState.gamePhase === 'food-choice' && !phaseVoiceRef.current.foodQuestion) {
      phaseVoiceRef.current.foodCorrect = false;
      phaseVoiceRef.current.foodQuestion = true;
      speakLine(VOICE_LINES.foodQuestion, { moment: 'thinking', onEnd: () => setPhaseVoiceDone(true) });
    }
    if (sceneState.gamePhase === 'color-choice' && !phaseVoiceRef.current.colorQuestion) {
      phaseVoiceRef.current.colorCorrect = false;
      phaseVoiceRef.current.colorQuestion = true;
      speakLine(VOICE_LINES.colorQuestion, { moment: 'thinking', onEnd: () => setPhaseVoiceDone(true) });
    }
    if (sceneState.gamePhase === 'activity-choice' && !phaseVoiceRef.current.activityQuestion) {
      phaseVoiceRef.current.activityCorrect = false;
      phaseVoiceRef.current.activityQuestion = true;
      speakLine(VOICE_LINES.activityQuestion, { moment: 'thinking', onEnd: () => setPhaseVoiceDone(true) });
    }
    if (sceneState.gamePhase === 'friend-choice' && !phaseVoiceRef.current.friendQuestion) {
      phaseVoiceRef.current.friendCorrect = false;
      phaseVoiceRef.current.friendQuestion = true;
      speakLine(VOICE_LINES.friendQuestion, { moment: 'thinking', onEnd: () => setPhaseVoiceDone(true) });
    }

    // Ganesha's correct answers
    if (sceneState.gamePhase === 'food-correct' && !phaseVoiceRef.current.foodCorrect) {
      phaseVoiceRef.current.foodCorrect = true;
      speakSuccessLine(VOICE_LINES.foodCorrect, 'foodSuccessDone');
    }
    if (sceneState.gamePhase === 'color-correct' && !phaseVoiceRef.current.colorCorrect) {
      phaseVoiceRef.current.colorCorrect = true;
      speakSuccessLine(VOICE_LINES.colorCorrect, 'colorSuccessDone');
    }
    if (sceneState.gamePhase === 'activity-correct' && !phaseVoiceRef.current.activityCorrect) {
      phaseVoiceRef.current.activityCorrect = true;
      speakSuccessLine(VOICE_LINES.activityCorrect, 'activitySuccessDone');
    }
    if (sceneState.gamePhase === 'friend-correct' && !phaseVoiceRef.current.friendCorrect) {
      phaseVoiceRef.current.friendCorrect = true;
      speakSuccessLine(VOICE_LINES.friendCorrect, 'friendSuccessDone');
    }

    // Child intro
    if (sceneState.gamePhase === 'child-intro' && !phaseVoiceRef.current.childIntro) {
      phaseVoiceRef.current.childIntro = true;
      speakLine(VOICE_LINES.childIntro, { moment: 'encouragement' });
    }

    // Child's questions — same VO-done gate as the Ganesha questions above,
    // reused by the child-phase entry-VO-repeat timer.
    const childQuestionFlagByPhase = {
      'child-food-choice': 'childFoodQuestion',
      'child-color-choice': 'childColorQuestion',
      'child-activity-choice': 'childActivityQuestion',
      'child-friend-input': 'childFriendQuestion',
    };
    const childQuestionFlag = childQuestionFlagByPhase[sceneState.gamePhase];
    if (childQuestionFlag) {
      setPhaseVoiceDone(!!phaseVoiceRef.current[childQuestionFlag]);
    }

    if (sceneState.gamePhase === 'child-food-choice' && !phaseVoiceRef.current.childFoodQuestion) {
      phaseVoiceRef.current.childFoodQuestion = true;
      speakLine(VOICE_LINES.childFoodQuestion, { moment: 'thinking', onEnd: () => setPhaseVoiceDone(true) });
    }
    if (sceneState.gamePhase === 'child-color-choice' && !phaseVoiceRef.current.childColorQuestion) {
      phaseVoiceRef.current.childColorQuestion = true;
      speakLine(VOICE_LINES.childColorQuestion, { moment: 'thinking', onEnd: () => setPhaseVoiceDone(true) });
    }
    if (sceneState.gamePhase === 'child-activity-choice' && !phaseVoiceRef.current.childActivityQuestion) {
      phaseVoiceRef.current.childActivityQuestion = true;
      speakLine(VOICE_LINES.childActivityQuestion, { moment: 'thinking', onEnd: () => setPhaseVoiceDone(true) });
    }
    if (sceneState.gamePhase === 'child-friend-input' && !phaseVoiceRef.current.childFriendQuestion) {
      phaseVoiceRef.current.childFriendQuestion = true;
      speakLine(VOICE_LINES.childFriendQuestion, { moment: 'thinking', onEnd: () => setPhaseVoiceDone(true) });
    }

    // Final comparison card VO (starts after hearts appear)
    if (sceneState.gamePhase === 'comparison-card' && !phaseVoiceRef.current.friendCelebration) {
      // Flag is set when the timer FIRES: this effect's cleanup clears the timer (StrictMode remount
      // on Continue), and a flag set up front kept the second run from re-scheduling it, so the line
      // never played (KNOWN_PITFALLS 1).
      const comparisonVoTimer = setTimeout(() => {
        phaseVoiceRef.current.friendCelebration = true;
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

  // ── Idle Hint System (Scene 22 pattern: 10s wobble -> 18s glow+VO -> 26s stronger glow) ──
  useEffect(() => {
    const ganeshaPhases = ['food-choice', 'color-choice', 'activity-choice', 'friend-choice'];
    const currentPhase = sceneState.gamePhase;

    // Only run for Ganesha choice phases, and only once that phase's own
    // question VO has finished — otherwise the ladder could fire mid-VO.
    // showShake is deliberately NOT a gate here — a wrong guess gives
    // feedback but must not destroy/restart the hint clock, or repeated
    // random guessing would let a child indefinitely postpone real help.
    if (!ganeshaPhases.includes(currentPhase) || !phaseVoiceDone) {
      if (ganeshaIdleTimerRef.current) clearTimeout(ganeshaIdleTimerRef.current);
      setIdleHintLevel(0);
      idleHintVoiceRef.current = false;
      return;
    }

    // Reset idle hints when entering a new phase
    setIdleHintLevel(0);
    idleHintVoiceRef.current = false;
    if (ganeshaIdleTimerRef.current) clearTimeout(ganeshaIdleTimerRef.current);

    // Two-step recall support (the choices are already in front of the child, so no wobble):
    //   0 = no help
    //   1 @ ~13s = semantic clue VO
    //   2 = correct choice glows and stays lit (no extra VO)
    // The final gap counts from when the clue FINISHES speaking, so the answer glow never
    // appears while Ganesha is still talking.
    ganeshaIdleTimerRef.current = setTimeout(() => {
      if (document.hidden) return;
      setIdleHintLevel(1);

      const armFinalHint = () => {
        // A line cancelled by tab-hide ends here too: do not arm the glow while hidden.
        if (document.hidden) return;
        ganeshaIdleTimerRef.current = setTimeout(() => {
          if (document.hidden) return;
          setIdleHintLevel(2);
        }, 10000);
      };
      const hintMap = {
        'food-choice': VOICE_LINES.foodHint,
        'color-choice': VOICE_LINES.colorHint,
        'activity-choice': VOICE_LINES.activityHint,
        'friend-choice': VOICE_LINES.friendHint
      };
      if (hintMap[currentPhase] && !idleHintVoiceRef.current) {
        idleHintVoiceRef.current = true;
        speakLine(hintMap[currentPhase], { moment: 'encouragement', priority: 'hint', onEnd: armFinalHint });
      } else {
        armFinalHint();
      }
    }, 13000);

    return () => {
      if (ganeshaIdleTimerRef.current) clearTimeout(ganeshaIdleTimerRef.current);
    };
  }, [sceneState.gamePhase, resumeHintCycleKey, phaseVoiceDone]);

  // Child phase entry VO repeat @ 10s (once)
  useEffect(() => {
    const childPhases = ['child-food-choice', 'child-color-choice', 'child-activity-choice', 'child-friend-input'];
    const currentPhase = sceneState.gamePhase;

    // Only run for child choice phases, and only once the entry question
    // VO for this phase has finished.
    if (!childPhases.includes(currentPhase) || !phaseVoiceDone) {
      if (childIdleTimerRef.current) clearTimeout(childIdleTimerRef.current);
      childEntryVoRepeatRef.current = false;
      return;
    }

    // Reset flag when entering a new child phase
    childEntryVoRepeatRef.current = false;
    if (childIdleTimerRef.current) clearTimeout(childIdleTimerRef.current);

    // @ 10s: Repeat entry VO (once)
    childIdleTimerRef.current = setTimeout(() => {
      if (document.hidden) return;
      // Not once the child has answered (the success line is playing or about to) and not while the
      // drawing pad / typing box is open: it repeated "Choose your favorite food" after "Yummy!".
      const st = latestSceneStateRef.current || sceneState;
      const answered = {
        'child-food-choice': st.childFoodChoice || st.childFoodDrawing || st.childFoodText,
        'child-color-choice': st.childColor,
        'child-activity-choice': st.childActivityChoice || st.childActivityDrawing || st.childActivityText,
        'child-friend-input': st.childFriendName,
      }[currentPhase];
      if (answered || st.currentModal) return;
      if (!childEntryVoRepeatRef.current) {
        const voMap = {
          'child-food-choice': VOICE_LINES.childFoodQuestion,
          'child-color-choice': VOICE_LINES.childColorQuestion,
          'child-activity-choice': VOICE_LINES.childActivityQuestion,
          'child-friend-input': VOICE_LINES.childFriendQuestion
        };
        if (voMap[currentPhase]) {
          speakLine(voMap[currentPhase], { moment: 'thinking', priority: 'hint' });
          childEntryVoRepeatRef.current = true;
        }
      }
    }, 10000);

    return () => {
      if (childIdleTimerRef.current) clearTimeout(childIdleTimerRef.current);
    };
  }, [sceneState.gamePhase, isAudioOn, phaseVoiceDone]);

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
    const food = foods.find(f => f.id === foodId);
    if (food.correct) {
      interruptCurrentVoice();
      resetIdleHints();
      playSparkle();
      triggerMiniGesture('food', 1500);
      triggerSparkleFx('all', 2400);
      // Saved at the solving tap (checkpoint): selectedFood marks the beat solved before the 1 s animation.
      sceneActions.checkpoint({ correctChoiceId: foodId, selectedFood: foodId });
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
      // Once the clue has started, a wrong tap must not cut it by re-reading the option name.
      if (idleHintLevel === 0) speakOptionName(food?.name);
      setShowShake(foodId);
      sceneActions.updateState({ wrongChoices: [...sceneState.wrongChoices, foodId] });
      safeSetTimeout(() => setShowShake(null), 500);
    }
  };

  const handleColorClick = (colorId) => {
    playUiTap();
    if (sceneState.correctChoiceId) return;
    const color = colors.find(c => c.id === colorId);
    if (color.correct) {
      interruptCurrentVoice();
      resetIdleHints();
      playSparkle();
      triggerMiniGesture('color', 1500);
      triggerSparkleFx('all', 2400);
      triggerDiscoveryFly({ image: redImg, name: 'Red' }, { durationMs: GANESHA_CORRECT_ADVANCE_DELAY_MS });
      sceneActions.updateState({
        correctChoiceId: colorId,
        gamePhase: 'color-correct'
      });
      safeSetTimeout(() => {
        const currentState = latestSceneStateRef.current || sceneState;
        sceneActions.updateState({
          storyDiscoveries: appendUniqueDiscovery(currentState.storyDiscoveries, { image: redImg, name: 'Red' })
        });
      }, DISCOVERY_CENTER_REACH_MS);
    } else {
      playWrongTap();
      if (idleHintLevel === 0) speakOptionName(color?.name);
      setShowShake(colorId);
      sceneActions.updateState({ wrongChoices: [...sceneState.wrongChoices, colorId] });
      safeSetTimeout(() => setShowShake(null), 500);
    }
  };

  const handleActivityClick = (activityId) => {
    playUiTap();
    if (sceneState.correctChoiceId) return;
    const activity = activities.find(a => a.id === activityId);
    if (activity.correct) {
      interruptCurrentVoice();
      resetIdleHints();
      playSparkle();
      triggerMiniGesture('activity', 1500);
      triggerSparkleFx('all', 2400);
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
      if (idleHintLevel === 0) speakOptionName(activity?.name);
      setShowShake(activityId);
      sceneActions.updateState({ wrongChoices: [...sceneState.wrongChoices, activityId] });
      safeSetTimeout(() => setShowShake(null), 500);
    }
  };

  const handleFriendClick = (friendId) => {
    playUiTap();
    if (sceneState.correctChoiceId) return;
    const friend = friends.find(f => f.id === friendId);
    if (friend.correct) {
      interruptCurrentVoice();
      resetIdleHints();
      playSparkle();
      triggerMiniGesture('friend', 1500);
      triggerSparkleFx('all', 2400);
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
      if (idleHintLevel === 0) speakOptionName(friend?.name);
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
    sceneActions.checkpoint({
      childFoodChoice: foodId,
      childDiscoveries: [{ image: discoveryImage, name: selected.name }]
    });
    triggerMiniGesture('center', 1200);
    triggerSparkleFx('single', 1700);

    triggerDiscoveryFly({ image: discoveryImage, name: selected.name }, { isChild: true, durationMs: CHILD_SELECTION_ADVANCE_DELAY_MS });

    safeSetTimeout(() => {
      speakSuccessLine(VOICE_LINES.childFoodCorrect, 'childFoodDone');
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
    triggerDiscoveryFly({ image: data.image, name: 'My Food' }, { isChild: true, durationMs: CHILD_SELECTION_ADVANCE_DELAY_MS });
    sceneActions.checkpoint({
      childFoodDrawing: data.image,
      childDiscoveries: [{ image: data.image, name: 'My Food' }],
      currentModal: null,
      draftData: null
    });
    triggerMiniGesture('center', 1200);
    triggerSparkleFx('single', 1700);

    safeSetTimeout(() => {
      speakSuccessLine(VOICE_LINES.childFoodCorrect, 'childFoodDone');
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
    sceneActions.checkpoint({
      childColor: selectedColor.image || selectedColor.color,
      childColorName: selectedColor.name,
      childDiscoveries: appendUniqueDiscovery(currentState.childDiscoveries, {
        image: selectedColor.image,
        emoji: selectedColor.emoji,
        name: selectedColor.name
      })
    });
    triggerMiniGesture('center', 1200);
    triggerSparkleFx('single', 1700);
    triggerDiscoveryFly({
      image: selectedColor.image,
      emoji: selectedColor.emoji,
      name: selectedColor.name
    }, { isChild: true, durationMs: CHILD_SELECTION_ADVANCE_DELAY_MS });

    safeSetTimeout(() => {
      speakSuccessLine(VOICE_LINES.childColorCorrect, 'childColorDone');
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

    if (activityId === 'drawing') {
      setShowDrawingPad(true);
      setDrawingMode('activity');
      sceneActions.updateState({ currentModal: 'activity-draw' });
      return;
    }

    setSelectedKidActivityId(activityId);
    const selected = kidActivities.find(a => a.id === activityId);
    const discoveryImage = selected?.image;
    const currentState = latestSceneStateRef.current || sceneState;
    speakOptionName(selected?.name);
    sceneActions.checkpoint({
      childActivityChoice: activityId,
      childDiscoveries: appendUniqueDiscovery(currentState.childDiscoveries, { image: discoveryImage, name: selected.name })
    });
    triggerMiniGesture('center', 1200);
    triggerSparkleFx('single', 1700);
    triggerDiscoveryFly({ image: discoveryImage, name: selected.name }, { isChild: true, durationMs: CHILD_SELECTION_ADVANCE_DELAY_MS });

    safeSetTimeout(() => {
      speakSuccessLine(VOICE_LINES.childActivityCorrect, 'childActivityDone');
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
    triggerDiscoveryFly({ image: data.image, name: 'My Activity' }, { isChild: true, durationMs: CHILD_SELECTION_ADVANCE_DELAY_MS });
    sceneActions.checkpoint({
      childActivityDrawing: data.image,
      childDiscoveries: appendUniqueDiscovery(currentState.childDiscoveries, { image: data.image, name: 'My Activity' }),
      currentModal: null,
      draftData: null
    });
    triggerMiniGesture('center', 1200);
    triggerSparkleFx('single', 1700);

    safeSetTimeout(() => {
      speakSuccessLine(VOICE_LINES.childActivityCorrect, 'childActivityDone');
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
      {SHOW_HIT_ZONES && (
        <style>{'.favorite-food-game button:not(:disabled):not(.choice-card):not(.kid-choice-card):not(.color-choice-button), .favorite-food-game .color-choice-button:not(:disabled)::after, .favorite-food-game .choice-card:not(:disabled) .choice-image-container, .favorite-food-game .kid-choice-card:not(:disabled) img { outline: 3px dashed #E91E63 !important; background-color: rgba(233, 30, 99, 0.16) !important; }'}</style>
      )}
      <img src={foodBg} alt="Background" className="food-background" />
      <ZoneBadgeButton variant="gameplay" zoneId="about-me-hut" onBack={() => {
        SimpleSceneManager.clearCurrentScene();
        interruptCurrentVoice();
        clearAllTimeouts();
        onNavigate?.('zone-welcome');
      }} />
      {/* [per-scene mute removed 2026-10-09] <AudioToggle variant="gameplay" isAudioOn={isAudioOn} onToggle={toggleAudio} /> */}
      <VOReplayButton variant="gameplay" onReplay={replayCurrentVoice} disabled={!isAudioOn} />

      {discoveryFly && !['food-correct', 'color-correct', 'activity-correct', 'friend-correct'].includes(sceneState.gamePhase) && (
        <DiscoveryFlight
          key={discoveryFly.key}
          image={discoveryFly.image}
          emoji={discoveryFly.emoji}
          name={discoveryFly.name}
          durationMs={discoveryFly.durationMs || DISCOVERY_FLY_TOTAL_MS}
          size="lg"
          isChild={discoveryFly.isChild}
          isModak={discoveryFly.isModak}
          showName={discoveryFly.showNameBelow}
        />
      )}

      {sparkleState.active && (
        <div className="favorite-sparkle-overlay" key={`favorite-sparkle-${sparkleState.key}`}>
          <AboutMeSparkle key={sparkleState.key} preset={sparkleState.type === 'all' ? 'big' : 'burst'} />
        </div>
      )}

      {/* Mini Gesture (Thumbs Up) on Success */}
      {miniGesture.show && (
        <GaneshaGestureCue
          key={miniGesture.key}
          gestureType={miniGesture.type}
          position={miniGesture.position}
          anchor={miniGesture.anchor}
          size={72}
        />
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
        />
      )}

      {/* Food Choice Screen */}
      {sceneState.gamePhase === 'food-choice' && (
        <div className="choice-screen">
          <AboutMeGaneshaHost image={babyGaneshaImg} className="about-me-ganesha-host--favorite" />
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
                    className={`choice-image ${food.correct && idleHintLevel >= 2 ? 'fav-hint-final' : ''}`}
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
          {/* <div className="success-message">Yes! Modak is my favorite! 🎉</div> */}
        </div>
      )}

      {/* Color Choice */}
      {sceneState.gamePhase === 'color-choice' && (
        <div className="choice-screen">
          <AboutMeGaneshaHost image={babyGaneshaImg} className="about-me-ganesha-host--favorite" />
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
                    className={`choice-image ${color.correct && idleHintLevel >= 2 ? 'fav-hint-final' : ''}`}
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
            <img src={redImg} alt="Red" className="food-in-hand pop-in" style={{ width: '180px', height: '180px' }} />
          </div>
          {/* <div className="success-message">Yes! Orange is my favorite color! 🧡</div> */}
        </div>
      )}

      {/* Activity Choice */}
      {sceneState.gamePhase === 'activity-choice' && (
        <div className="choice-screen">
          <AboutMeGaneshaHost image={babyGaneshaImg} className="about-me-ganesha-host--favorite" />
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
                    className={`choice-image ${activity.correct && idleHintLevel >= 2 ? 'fav-hint-final' : ''}`}
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
          {/* <div className="success-message">Yes! I love Dancing! 💃✨</div> */}
        </div>
      )}

      {/* Friend Intro (commented out: flow now goes directly to friend-choice) */}
      {/* {sceneState.gamePhase === 'friend-intro' && (
        <div className="intro-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="intro-ganesha bounce" />
          <div className="friend-intro-box">
            <h2 className="friend-intro-text">Great! Now find my best friend!</h2>
            <button className="friend-intro-btn" onClick={handleStartFriendChoice}>Find Friend! {'\u{1F31F}'}</button>
          </div>
        </div>
      )} */}

      {/* Friend Choice */}
      {sceneState.gamePhase === 'friend-choice' && (
        <div className="choice-screen">
          <AboutMeGaneshaHost image={babyGaneshaImg} className="about-me-ganesha-host--favorite" />
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
                    className={`choice-image ${friend.correct && idleHintLevel >= 2 ? 'fav-hint-final' : ''}`}
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
          {/* <div className="success-message">Yes! Mooshika is my best friend! 🐭✨</div> */}
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
            {/* 8th choice: anything not listed. Tap -> draw pad with text tool. */}
            <div className="kid-choice-card myown-wrap">
              <button
                type="button"
                className={`myown-circle ${showChildFoodTools ? 'open' : ''}`}
                aria-label="My own"
                onClick={() => {
                  playUiTap();
                  setShowChildFoodTools(prev => !prev);
                }}
              />
              <div className="kid-choice-name">My own</div>
            </div>
          </div>
          )}

          {!(selectedKidFoodId || sceneState.childFoodChoice || sceneState.childFoodDrawing || sceneState.childFoodText) && showChildFoodTools && (
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
                    }}>Draw or type</button>
                  </div>
                )}
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
                  color.emoji
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
            {/* 'games' is merged into 'sports' ("Play & Games"); kept in the list only so an older saved choice still resolves. */}
            {kidActivities.filter(a => a.id !== 'games').map((activity, index) => (
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
            {/* 8th choice: anything not listed. Tap -> draw pad with text tool. */}
            <div
              className="kid-choice-card myown-wrap"
              style={{
                position: 'absolute',
                left: `${CHILD_ACTIVITY_POSITIONS.myown.left}px`,
                top: `${CHILD_ACTIVITY_POSITIONS.myown.top}px`
              }}
            >
              <button
                type="button"
                className={`myown-circle ${showChildActivityTools ? 'open' : ''}`}
                aria-label="My own"
                onClick={() => {
                  playUiTap();
                  setShowChildActivityTools(prev => !prev);
                }}
              />
              <div className="kid-choice-name">My own</div>
            </div>
          </div>
          )}

          {!(selectedKidActivityId || sceneState.childActivityChoice || sceneState.childActivityDrawing || sceneState.childActivityText) && showChildActivityTools && (
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
                    }}>Draw or type</button>
                  </div>
                )}
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
                triggerSparkleFx('single', 1700);
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
              setShowDrawingPad(false);
              setDrawingMode(null);
              const currentState = latestSceneStateRef.current || sceneState;
              sceneActions.checkpoint({
                childFriendName: name,
                childFriendLetters: name.split(''),
                childDiscoveries: appendUniqueDiscovery(currentState.childDiscoveries, { image: friendsImg, name }),
                friendNameDraft: ''
              });
              triggerMiniGesture('center', 1200);
              triggerSparkleFx('single', 1700);
              triggerDiscoveryFly(
                { image: friendsImg, name },
                { isChild: true, showNameBelow: true, durationMs: CHILD_FRIEND_ADVANCE_DELAY_MS }
              );
              safeSetTimeout(() => {
                speakSuccessLine(VOICE_LINES.childFriendCorrect, 'childFriendDone');
              }, DISCOVERY_CENTER_REACH_MS);
              safeSetTimeout(() => {
                sceneActions.updateState({
                  gamePhase: 'comparison-card'
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

      {/* Drawing Modal */}
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

      {/* COMPARISON CARD */}
      {sceneState.gamePhase === 'comparison-card' && !sceneState.showingCompletionScreen && (
        <AboutMeComparisonCard
          title="We're Friends Now!"
          leftColumn={{
            header: (
              <div className="aboutme-comparison-avatar-header">
                <div className="aboutme-comparison-avatar is-plain">
                  <img src={babyGaneshaSit} alt="Ganesha" />
                </div>
                <span className="aboutme-comparison-avatar-name">Ganesha</span>
              </div>
            ),
            items: [
              { id: 'g-food', label: 'FOOD', imageSrc: modakImg, imageAlt: 'Modak', text: 'Modak' },
              { id: 'g-color', label: 'COLOR', imageSrc: redImg, imageAlt: 'Red', text: 'Red' },
              { id: 'g-activity', label: 'ACTIVITY', imageSrc: kidActSingImg, imageAlt: 'Dancing', text: 'Dancing' },
              { id: 'g-friend', label: 'FRIEND', imageSrc: mouseImg, imageAlt: 'Mooshika', text: 'Mooshika' },
            ]
          }}
          rightColumn={{
            header: (
              <div className="aboutme-comparison-avatar-header">
                <div className={`aboutme-comparison-avatar${(activeProfile?.icon || activeProfile?.profileIcon || profileAvatarImage) ? '' : ' is-fallback'}`}>
                  {activeProfile?.icon ? (
                    <img src={activeProfile.icon} alt="Profile" />
                  ) : activeProfile?.profileIcon ? (
                    <img src={activeProfile.profileIcon} alt="Profile" />
                  ) : profileAvatarImage ? (
                    <img src={profileAvatarImage} alt={profileDisplayName} />
                  ) : (
                    profileAvatar
                  )}
                </div>
                <span className="aboutme-comparison-avatar-name">{profileDisplayName}</span>
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
                      {sceneState.childFoodText || (sceneState.childFoodDrawing ? 'My Food' : kidFoods.find(f => f.id === sceneState.childFoodChoice)?.name)}
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
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: sceneState.childColor }} />
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
                      {sceneState.childActivityText || (sceneState.childActivityDrawing ? 'My Activity' : kidActivities.find(a => a.id === sceneState.childActivityChoice)?.name)}
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
            SimpleSceneManager.clearCurrentScene();
            sceneActions.updateState({ completed: true, showingCompletionScreen: true });
            const profileId = GameStateManager.getCurrentProfile()?.id;
            if (profileId) {
              ProgressManager.updateSceneCompletion(profileId, 'about-me-hut', 'favorite-food', {
                completed: true,
                stars: sceneState.stars || 2
              });
            }
          }}
          continueLabel="Continue"
        />
      )}

      {/* Resume Countdown */}
      <ResumeCountdown value={countdownValue} />
      <SceneStallPrompt show={!!revealStall} onTap={resolveRevealStall} />

      {/* Completion Screen */}
      {sceneState.showingCompletionScreen && (
        <SceneCompletionCelebration
          show={sceneState.showingCompletionScreen}
          zoneId="about-me-hut"
          sceneId="favorite-food"
          sceneName="Our Favorite Things"
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
          nextSceneName="Our Wishes & Dreams"
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
              SimpleSceneManager.setCurrentScene('about-me-hut', 'dreams-wishes', false, false);
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
            resetReveals();
            setRevealConfig(null);
            SimpleSceneManager.setCurrentScene('about-me-hut', 'favorite-food', false, false);
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
              correctChoiceId: null,
              foodSuccessDone: false,
              colorSuccessDone: false,
              activitySuccessDone: false,
              friendSuccessDone: false,
              childFoodDone: false,
              childColorDone: false,
              childActivityDone: false,
              childFriendDone: false,
              showingCompletionScreen: false,
              stars: 2,
              completed: false,
              currentModal: null, // Reset modal
              draftData: null
            });
            setShowDrawingPad(false);
            setDrawingMode(null);
          }}
          onBackToMap={() => {
            playUiTap();
            hardStopSceneAudio();
            SimpleSceneManager.clearCurrentScene();
            if (onNavigate) {
              onNavigate('zone-welcome');
            } else if (onBack) {
              onBack();
            }
          }}
          onHome={() => {
            playUiTap();
            hardStopSceneAudio();
            SimpleSceneManager.clearCurrentScene();
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
