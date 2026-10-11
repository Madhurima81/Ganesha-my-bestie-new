import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameSounds } from '../../../../lib/hooks/useGameSounds';
import './SarvakaryeshuChantSimplified.css';

import SceneManager from '../../../../lib/components/scenes/SceneManager';
import useVoiceGuidance, { estimateSpeechMs } from '../../../../lib/hooks/useVoiceGuidance';
import useSidebarPause from '../../../../lib/hooks/useSidebarPause';
import MessageManager from '../../../../lib/components/scenes/MessageManager';
import InteractionManager from '../../../../lib/components/scenes/InteractionManager';
import GameStateManager from '../../../../lib/services/GameStateManager';
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import FireworksCompletion from '../../../../lib/components/feedback/FireworksCompletion';
import CalmGoldenFireworks from '../../../../lib/components/feedback/CalmGoldenFireworks';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import InnerMandala from '../../../../lib/components/celebration/InnerMandala';
// import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';
import AudioToggle from '../../../../lib/components/ui/AudioToggle/AudioToggle';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import { getCollectionTarget } from '../../../../lib/utils/collectionTarget';
import { SCENE_TO_OUTER_PETAL_ID } from '../../../../lib/components/navigation/ProgressPopup';
import VOReplayButton from '../../../../lib/components/feedback/VOReplayButton';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import useResumeCountdown from '../../../../lib/hooks/useResumeCountdown';
import usePauseAwareTimeout from '../../../../lib/hooks/usePauseAwareTimeout';
import ResumeCountdown from '../../../../lib/components/feedback/ResumeCountdown';
import GaneshaGestureCue from '../../../../lib/components/gesture/GaneshaGestureCue';
import { useMiniGesture } from '../../../../lib/hooks/useMiniGesture';

import AppSidebar from '../../shared/AppSidebar';
import OpeningModal from '../../../shared/components/OpeningModal';
import { getCompletionModal, getDiscoveryContent } from '../../../../lib/config/content';

import SarvakaryeshuGame from './SarvakaryeshuGame';
import SarvadaGame from './SarvadaGame';

import ganeshaHeadphones from './assets/images/ganesha_with_headphones.webp';
import mooshikaCoach from './assets/images/mooshika-coach.webp';
import sarvadaBg from './assets/images/sarvada/night.webp';
import sarvakaryeshuBg from './assets/images/sarvakaryeshu-bg.webp';

import symbolVakratunda from '../../../meaning cave/assets/images/symbols/vakratunda-symbol.webp';
import symbolMahakaya from '../../../meaning cave/assets/images/symbols/mahakaya-symbol.webp';
import symbolSuryakoti from '../../../meaning cave/assets/images/symbols/suryakoti-symbol.webp';
import symbolSamaprabha from '../../../meaning cave/assets/images/symbols/samaprabha-symbol.webp';
import symbolNirvighnam from '../../../meaning cave/assets/images/symbols/nirvighnam-symbol.webp';
import symbolKurumedeva from '../../../meaning cave/assets/images/symbols/kurumedeva-symbol.webp';
import symbolSarvakaryeshu from '../../../meaning cave/assets/images/symbols/sarvakaryeshu-symbol.webp';
import symbolSarvada from '../../../meaning cave/assets/images/symbols/sarvada-symbol.webp';

const RESUME_DELAY_MS = 3000;
const sceneOuterPetalId = SCENE_TO_OUTER_PETAL_ID['River Memories!'];
const sceneOuterPetalIds = [sceneOuterPetalId - 1, sceneOuterPetalId];

const PHASES = {
  INITIAL: 'initial',
  SARVAKARYESHU_GAME: 'sarvakaryeshu_game',
  SARVAKARYESHU_COMPLETE: 'sarvakaryeshu_complete',
  SARVAKARYESHU_POWER: 'sarvakaryeshu_power',
  SARVADA_GAME: 'sarvada_game',
  SARVADA_COMPLETE: 'sarvada_complete',
  SARVADA_POWER: 'sarvada_power',
  COMPLETE: 'complete',
};

const stripLeadingSpeechText = (text, leadingText) => {
  if (!text || !leadingText) return text;
  const pattern = new RegExp(`^\\s*${leadingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:.!,-]*\\s*`, 'i');
  return text.replace(pattern, '').trim();
};

const SARVADA_PHASES = [PHASES.SARVADA_GAME, PHASES.SARVADA_COMPLETE, PHASES.SARVADA_POWER, PHASES.COMPLETE];

const powerConfig = {
  sarvakaryeshu: {
    name: 'In All Tasks',
    image: symbolSarvakaryeshu,
    color: '#9C6FD6',
    affirmation: 'I do every task with care.',
    story: 'Ganesha helps in all things - big and small.',
  },
  sarvada: {
    name: 'Always',
    image: symbolSarvada,
    color: '#FFB347',
    affirmation: 'What I learn stays with me.',
    story: 'Morning, afternoon, night - always.',
  },
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SarvakaryeshuChantSimplified = ({
  onComplete,
  onNavigate,
  zoneId = 'shloka-river',
  sceneId = 'sarvakaryeshu-chant',
}) => (
  <ErrorBoundary>
    <SceneManager
      zoneId={zoneId}
      sceneId={sceneId}
      initialState={{
        phase: PHASES.INITIAL,
        learnedWords: { sarvakaryeshu: false, sarvada: false },
        chantedVerses: {},
        learnedSyllables: {},
        unlockedApps: {
          vakratunda: true,
          mahakaya: true,
          suryakoti: true,
          samaprabha: true,
          nirvighnam: true,
          kurumedeva: true,
        },
        welcomeShown: false,
        finalCardCollected: false,
        cardsDone: 0,
        timesDone: 0,
        currentPopup: null,
        showingCompletionScreen: false,
        stars: 0,
        completed: false,
        progress: { percentage: 0, starsEarned: 0, completed: false },
      }}
    >
      {({ sceneState, sceneActions, isReload }) => (
        <SarvakaryeshuChantContent
          sceneState={sceneState}
          sceneActions={sceneActions}
          isReload={isReload}
          onComplete={onComplete}
          onNavigate={onNavigate}
          zoneId={zoneId}
          sceneId={sceneId}
        />
      )}
    </SceneManager>
  </ErrorBoundary>
);

const SarvakaryeshuChantContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId,
}) => {
  const { resetScene } = useSceneReset(sceneActions, zoneId, sceneId, getSceneResetConfig(sceneId));
  const completionModalContent = getCompletionModal(zoneId, sceneId);
  const { miniGesture, triggerMiniGesture } = useMiniGesture();
  const hintSystemRef = useRef(null);

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showMandala, setShowMandala] = useState(false);
  const [showPowerOverlay, setShowPowerOverlay] = useState(false);
  const [revealConfig, setRevealConfig] = useState(null);
  const [showTapSparkles, setShowTapSparkles] = useState(false);
  const fxBgRef = useRef(null);
  const lastPointRef = useRef(null);
  const [sparklePos, setSparklePos] = useState(null);
  const recordPoint = useCallback((e) => {
    const el = fxBgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const cx = e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
    const cy = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
    if (cx == null || cy == null) return;
    lastPointRef.current = {
      x: Math.min(95, Math.max(5, ((cx - r.left) / r.width) * 100)),
      y: Math.min(95, Math.max(5, ((cy - r.top) / r.height) * 100)),
    };
  }, []);

  const [openingButtonVisible, setOpeningButtonVisible] = useState(false);
  const [savedRecordings, setSavedRecordings] = useState({});
  const handleSaveRecording = useCallback((wordId, data) => {
    setSavedRecordings((prev) => ({ ...prev, [wordId]: data }));
  }, []);
  const handleDeleteRecording = useCallback((wordId) => {
    setSavedRecordings((prev) => {
      const next = { ...prev };
      delete next[wordId];
      return next;
    });
  }, []);
  const [showAppDiscovery, setShowAppDiscovery] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const audioEnabledRef = useRef(isAudioOn);
  audioEnabledRef.current = isAudioOn;

  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'explorer';

  const isFinalCelebrationActive =
    showSparkle === 'final-fireworks' ||
    showMandala ||
    showSceneCompletion ||
    showAppDiscovery ||
    sceneState.phase === PHASES.COMPLETE;
  const shouldShowOpeningModal =
    sceneState.phase === PHASES.INITIAL &&
    !sceneState.welcomeShown &&
    !showSceneCompletion &&
    !showMandala &&
    !showAppDiscovery &&
    showSparkle !== 'final-fireworks';

  const {
    playVoice: playConfiguredVoice,
    stopVoice,
    muteVoicePlayback,
    playSilent,
    setVoiceVolume,
    playSfx,
    playSyllable,
    playWord: playWordAudio,
    setCurrentPhase,
    startIdleTimer,
    stopIdleTimer,
  } = useVoiceGuidance(zoneId, sceneId, {
    enableMusic: false,
    voiceVolume: 1,
    sfxVolume: 0.7,
    idleTimeout: 999999,
    resumeDelay: RESUME_DELAY_MS,
  });

  const { playUiTap, playChime } = useGameSounds();
  const speechSynthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const webSpeechRef = useRef(null); // in-flight scene-owned utterance, for mute-mid-line
  const guidanceVoiceActiveRef = useRef(false);
  const guidanceVoiceTimerRef = useRef(null);
  const lastGuidanceVoiceEndedAtRef = useRef(0);
  const sarvadaReplayKeyRef = useRef('scene14_intro');

  const stopWebSpeech = useCallback(() => {
    try {
      speechSynthRef.current?.cancel();
    } catch {}
  }, []);

  const clearGuidanceVoiceTimer = useCallback(() => {
    if (guidanceVoiceTimerRef.current) {
      window.clearTimeout(guidanceVoiceTimerRef.current);
      guidanceVoiceTimerRef.current = null;
    }
  }, []);

  const speakWebSpeech = useCallback((text, onEnded) => {
    if (!text) {
      onEnded?.();
      return;
    }
    if (!audioEnabledRef.current) {
      // Muted: finish on a silent timer matching the line's length, not instantly,
      // so mute never skips a step (DECISIONS.md 2026-09-29).
      playSilent(text, onEnded);
      return;
    }
    const synth = speechSynthRef.current;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      onEnded?.();
      return;
    }
    try {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 0.95;
      const clearTracked = () => {
        if (webSpeechRef.current?.utterance === utterance) webSpeechRef.current = null;
      };
      utterance.onend = () => { clearTracked(); onEnded?.(); };
      utterance.onerror = () => { clearTracked(); onEnded?.(); };
      webSpeechRef.current = { utterance, onEnded, at: Date.now(), ms: estimateSpeechMs(text) };
      synth.speak(utterance);
    } catch {
      onEnded?.();
    }
  }, [playSilent]);

  // Mute pressed mid-line: silence the utterance now but let its callback fire
  // once, when it would have finished, so mute never skips or stalls a step.
  const muteWebSpeech = useCallback(() => {
    const w = webSpeechRef.current;
    if (!w) return;
    webSpeechRef.current = null;
    w.utterance.onend = null;
    w.utterance.onerror = null;
    try { speechSynthRef.current?.cancel(); } catch {}
    playSilent(Math.max(0, w.ms - (Date.now() - w.at)), w.onEnded);
  }, [playSilent]);

  // ── Sidebar = true pause ────────────────────────────────────────────────────
  // Shared hook: tracks the in-flight VO so it can be replayed after the sidebar closes.
  const sidebarPause = useSidebarPause();
  const {
    setBeat,
    playTracked,
    clearActive: clearActiveVoice,
    beginPause: beginSidebarPause,
    endPause: endSidebarPause,
  } = sidebarPause;

  const playGuidanceVoiceRaw = useCallback((key, onEnded, options = {}) => {
    const { minDelayAfterVoiceMs = 0, replayOnReturn = false, stripLeadingText = null } = options;
    const map = {
      scene13_puzzle: "So much to do. Which symbol can help him start small?",
      scene13_puzzle_after: "Mooshika helped him begin with one small thing.",
      scene13_sports: "So many distractions. Which symbol can help him focus?",
      scene13_sports_after: "The Eyes helped him focus on what mattered.",
      scene13_bike: "Heavy here, gentle there. Which symbol can help?",
      scene13_bike_after: "The Trunk helped him use strength, then gentleness.",
      scene13_grandma: "The crayon is broken. Which symbol can help?",
      scene13_grandma_after: "The Tusk reminded her that something broken can still help.",
      welcome: "Let’s see where Ganesha is with you today.",
      scene13_success: "Sarvakaryeshu! You chose a Ganesha symbol for each task.",
      scene14_intro: "Morning, afternoon and night — let’s find Ganesha through your day.",
      scene14_morning: "Morning can be busy. What can help him listen?",
      scene14_afternoon: "Things didn’t go his way. What can help him keep going?",
      scene14_night: "He kept trying and finished the puzzle. What can remind him of that happy feeling?",
      scene14_find_symbol: "Can you find the hidden symbol?",
      scene14_success: "You found Ganesha through the whole day.",
      sceneComplete: "From morning to night, Ganesha was with you.",
    };
    const finishPlayback = () => {
      guidanceVoiceActiveRef.current = false;
      lastGuidanceVoiceEndedAtRef.current = Date.now();
      onEnded?.();
    };
    const startPlayback = () => {
      guidanceVoiceActiveRef.current = true;
      if (map[key]) {
        speakWebSpeech(stripLeadingSpeechText(map[key], stripLeadingText), finishPlayback);
        return;
      }
      playConfiguredVoice?.(key, finishPlayback, { replayOnReturn, stripLeadingText });
    };
    const remainingQuietGap = Math.max(
      0,
      lastGuidanceVoiceEndedAtRef.current + minDelayAfterVoiceMs - Date.now(),
    );
    if (guidanceVoiceActiveRef.current || remainingQuietGap > 0) {
      clearGuidanceVoiceTimer();
      const schedulePlayback = () => {
        const delay = guidanceVoiceActiveRef.current
          ? minDelayAfterVoiceMs
          : Math.max(0, lastGuidanceVoiceEndedAtRef.current + minDelayAfterVoiceMs - Date.now());
        guidanceVoiceTimerRef.current = window.setTimeout(() => {
          guidanceVoiceTimerRef.current = null;
          if (guidanceVoiceActiveRef.current) {
            schedulePlayback();
            return;
          }
          startPlayback();
        }, delay);
      };
      schedulePlayback();
      return;
    }
    startPlayback();
  }, [clearGuidanceVoiceTimer, playConfiguredVoice, speakWebSpeech]);

  const playGuidanceVoice = useCallback((key, onEnded, options = {}) => {
    playTracked(
      'line',
      (done, overrides) => playGuidanceVoiceRaw(key, done, { ...options, ...overrides }),
      onEnded,
    );
  }, [playTracked, playGuidanceVoiceRaw]);

  const replayCurrentVoice = useCallback(() => {
    if (!isAudioOn) return;
    if (!sceneState.welcomeShown || sceneState.phase === PHASES.INITIAL) {
      playGuidanceVoice('welcome');
      return;
    }
    if (sceneState.phase === PHASES.SARVAKARYESHU_GAME) {
      playGuidanceVoice('scene13_puzzle');
      return;
    }
    if (sceneState.phase === PHASES.SARVADA_GAME) {
      playGuidanceVoice(sarvadaReplayKeyRef.current || 'scene14_intro');
      return;
    }
    if (showSceneCompletion) playGuidanceVoice('sceneComplete');
  }, [isAudioOn, playGuidanceVoice, sceneState.phase, sceneState.welcomeShown, showSceneCompletion]);

  const handleSarvadaReplayKeyChange = useCallback((key) => {
    if (key) sarvadaReplayKeyRef.current = key;
  }, []);

  const stopAllVoice = useCallback(() => {
    clearGuidanceVoiceTimer();
    guidanceVoiceActiveRef.current = false;
    // A deliberate stop (new clip taking over) is not a sidebar interruption:
    // don't leave a stale entry that a later sidebar-open would replay.
    clearActiveVoice();
    stopVoice();
    stopWebSpeech();
  }, [clearActiveVoice, clearGuidanceVoiceTimer, stopVoice, stopWebSpeech]);

  // Sarvakaryeshu is a single beat for the wrapper (SarvadaGame drives its own beats via setBeat).
  // Set during render so a clip started by a child effect this render is tagged with it.
  if (sceneState.phase === PHASES.SARVAKARYESHU_GAME) setBeat('sarvakaryeshu');

  const pauseCelebRef = useRef(null);
  const onPauseHide = useCallback(() => pauseCelebRef.current?.(), []);
  const onPauseShow = useCallback(() => {
    if ([PHASES.SARVAKARYESHU_GAME, PHASES.SARVADA_GAME].includes(sceneState.phase)) startIdleTimer();
  }, [sceneState.phase, startIdleTimer]);

  const { clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: onPauseHide,
    onShow: onPauseShow,
    resumeDelay: RESUME_DELAY_MS,
  });
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts]);
  useEffect(() => () => stopWebSpeech(), [stopWebSpeech]);
  useEffect(() => {
    if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.INITIAL });
  }, [sceneActions, sceneState?.phase]);

  const getSidebarTarget = (symbolId) => {
    const element = getCollectionTarget(symbolId);
    if (!element) return { x: 220, y: 0 };
    const rect = element.getBoundingClientRect();
    return {
      x: (rect.left + rect.width / 2) - (window.innerWidth / 2),
      y: (rect.top + rect.height / 2) - (window.innerHeight / 2),
    };
  };

  const persistCompletion = useCallback(() => {
    const profileId = localStorage.getItem('activeProfileId');
    if (!profileId) return;

    try {
      GameStateManager.saveGameState(zoneId, sceneId, {
        completed: true,
        stars: 5,
        phase: PHASES.COMPLETE,
        words: sceneState.learnedWords || {},
        syllables: sceneState.learnedSyllables || {},
        apps: sceneState.unlockedApps || {},
        chantedVerses: sceneState.chantedVerses || {},
        timestamp: Date.now(),
      });
      ProgressManager.updateSceneCompletion(profileId, zoneId, sceneId, {
        completed: true,
        stars: 5,
      });
      localStorage.removeItem(`temp_session_${profileId}_${zoneId}_${sceneId}`);
      SimpleSceneManager.clearCurrentScene();
    } catch (error) {
      console.error('Error saving:', error);
    }
  }, [sceneId, sceneState.chantedVerses, sceneState.learnedSyllables, sceneState.learnedWords, sceneState.unlockedApps, zoneId]);

  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);
    const appsNow = sceneState.unlockedApps;

    if (symbolId === 'sarvakaryeshu') {
      window.setTimeout(() => {
        sceneActions.updateState({
          unlockedApps: { ...appsNow, sarvakaryeshu: true },
          phase: PHASES.SARVADA_GAME,
          timesDone: 0,
        });
      }, 950);
    } else {
      sceneActions.checkpoint({ finalCardCollected: true });
      window.setTimeout(() => {
        sceneActions.updateState({ unlockedApps: { ...appsNow, sarvada: true } });
      }, 950);
      window.setTimeout(() => handleAppDiscoveryCelebrate(), 1500);
    }
  };

  useEffect(() => {
    if (sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) {
      setOpeningButtonVisible(true);
      if (!audioEnabledRef.current) return;
      const timer = setTimeout(() => playGuidanceVoice('welcome', () => playSfx('chime')), 800);
      return () => clearTimeout(timer);
    }
  }, [sceneState.phase, sceneState.welcomeShown, isAudioOn, playGuidanceVoice, playSfx]);

  const handleAudioToggle = () => {
    const nextOn = !isAudioOn;
    setVoiceVolume(nextOn ? 1 : 0);
    if (!nextOn) {
      muteVoicePlayback();
      muteWebSpeech();
    }
    toggleAudio();
  };

  // No extra gameplay intro VO here: after the opening modal, the first
  // Sarvakaryeshu task prompt is the next spoken line.
  const [sarvaIntroReady, setSarvaIntroReady] = useState(true);
  useEffect(() => {
    if (sceneState.phase === PHASES.SARVAKARYESHU_GAME) setSarvaIntroReady(true);
  }, [sceneState.phase]);

  useEffect(() => {
    if (sceneState.phase === PHASES.SARVAKARYESHU_GAME && sceneState.welcomeShown) {
      setCurrentPhase('sarvakaryeshuGame');
      startIdleTimer();
    }
  }, [sceneState.phase, sceneState.welcomeShown, setCurrentPhase, startIdleTimer]);

  useEffect(() => {
    if (sceneState.phase === PHASES.SARVADA_GAME) {
      setCurrentPhase('sarvadaGame');
      startIdleTimer();
    }
  }, [sceneState.phase, setCurrentPhase, startIdleTimer]);

  useEffect(() => {
    if (
      sceneState.phase === PHASES.COMPLETE &&
      !showSparkle &&
      !showMandala &&
      !showSceneCompletion
    ) {
      setShowMandala(true);
    }
  }, [sceneState.phase, showMandala, showSparkle, showSceneCompletion]);

  // ── Reload: restore SymbolAutoReveal if resumed mid-reveal ─────────────────
  // Guarded to run once per mount (not on every live phase change) — otherwise
  // this races the live completion handler's own reveal trigger for the same
  // phase transition and both fire playChime()/setRevealConfig() (double SFX).
  const hasRestoredRevealRef = useRef(false);
  useEffect(() => {
    if (!sceneState || revealConfig) return;
    if (hasRestoredRevealRef.current) return;
    hasRestoredRevealRef.current = true;

    const restoreReveal = (word) => {
      window.setTimeout(() => {
        const discoveryData = getDiscoveryContent(zoneId, sceneId, word);
        playChime();
        setShowSparkle(null);
        setRevealConfig({
          symbolId: word,
          symbolImage: powerConfig[word].image,
          symbolName: discoveryData?.title || powerConfig[word].name,
          affirmation: discoveryData?.affirmation || powerConfig[word].affirmation,
          sidebarTarget: getSidebarTarget(word)
        });
      }, 1200);
    };

    // Final card already collected before leaving: never show it twice, go on to the celebration.
    if (sceneState.finalCardCollected && [PHASES.SARVADA_COMPLETE, PHASES.SARVADA_POWER].includes(sceneState.phase)) {
      sceneActions.updateState({ unlockedApps: { ...(sceneState.unlockedApps || {}), sarvada: true } });
      window.setTimeout(() => handleAppDiscoveryCelebrate(), 600);
      return;
    }

    if ([PHASES.SARVAKARYESHU_COMPLETE, PHASES.SARVAKARYESHU_POWER].includes(sceneState.phase)) {
      restoreReveal('sarvakaryeshu');
      return;
    }

    if ([PHASES.SARVADA_COMPLETE, PHASES.SARVADA_POWER].includes(sceneState.phase)) {
      restoreReveal('sarvada');
    }
  }, [sceneState?.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePhaseComplete = useCallback((word) => {
    triggerMiniGesture('blessing', 'center', 2500);
    stopIdleTimer();
    setCurrentPhase(null);

    sceneActions.updateState({
      learnedWords: { ...sceneState.learnedWords, [word]: true },
      chantedVerses: { ...sceneState.chantedVerses, [`${word}-chant`]: true },
      phase: word === 'sarvakaryeshu' ? PHASES.SARVAKARYESHU_COMPLETE : PHASES.SARVADA_COMPLETE,
    });

    let revealTriggered = false;
    const triggerReveal = () => {
      if (revealTriggered) return;
      revealTriggered = true;
      const discoveryData = getDiscoveryContent(zoneId, sceneId, word);
      playChime();
      setRevealConfig({
        symbolId: word,
        symbolImage: powerConfig[word].image,
        symbolName: discoveryData?.title || powerConfig[word].name,
        affirmation: discoveryData?.affirmation || powerConfig[word].affirmation,
        sidebarTarget: getSidebarTarget(word),
      });
      sceneActions.updateState({
        phase: word === 'sarvakaryeshu' ? PHASES.SARVAKARYESHU_POWER : PHASES.SARVADA_POWER,
      });
    };

    // The child mini-games already play the full word MP3 followed by their
    // success VO before calling onPhaseComplete. Do not replay that success
    // line here; just give the reveal a small breath after the game hands off.
    window.setTimeout(() => triggerReveal(), isAudioOn ? 350 : 250);
  }, [
    sceneState,
    sceneActions,
    zoneId,
    sceneId,
    isAudioOn,
    playChime,
    stopIdleTimer,
    setCurrentPhase,
    triggerMiniGesture,
  ]);

  const handleMicroWin = useCallback(() => {
    setSparklePos(lastPointRef.current);
    setShowTapSparkles(true);
    window.setTimeout(() => setShowTapSparkles(false), 1600);
  }, []);

  const handleAppDiscoveryCelebrate = () => {
    setShowAppDiscovery(false);
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true },
    });
    persistCompletion();
    setShowSparkle('final-fireworks');
  };

  if (!sceneState) return <div className="loading">Loading...</div>;

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="sarva-scene-container">
          {!(showSparkle === 'final-fireworks' || showMandala) && (
            <ZoneBadgeButton variant="gameplay" zoneId="shloka-river" onBack={() => { stopAllVoice(); onNavigate?.('zone-welcome'); }} />
          )}
          {/* [per-scene mute removed 2026-10-09] <AudioToggle variant="gameplay" isAudioOn={isAudioOn} onToggle={handleAudioToggle} /> */}
          <VOReplayButton variant="gameplay" onReplay={replayCurrentVoice} disabled={!isAudioOn} />
          <ResumeCountdown value={countdownValue} />

          <div
            className="sarva-scene-background"
            ref={fxBgRef}
            onPointerDownCapture={recordPoint}
            style={{
              backgroundImage: `url(${SARVADA_PHASES.includes(sceneState.phase) ? sarvadaBg : sarvakaryeshuBg})`,
            }}
          >
            {!showSceneCompletion && (
              <>
                <SarvakaryeshuGame
                  isActive={sceneState.phase === PHASES.SARVAKARYESHU_GAME && sarvaIntroReady}
                  hideElements={!!revealConfig || showPowerOverlay}
                  onMicroWin={handleMicroWin}
                  initialCards={sceneState.cardsDone || 0}
                  onBeatComplete={(n) => sceneActions.checkpoint({ cardsDone: n })}
                  onPhaseComplete={() => window.setTimeout(() => handlePhaseComplete('sarvakaryeshu'), 0)}
                  onGameComplete={() => {}}
                  isPaused={isRecorderOpen || sidebarPause.isSidebarPaused}
                  voiceGuidance={{
                    playVoice: playGuidanceVoice,
                    playWord: (word, onEnded) => playTracked('word', (done) => playWordAudio(word, done), onEnded),
                    playSyllable: (syllable, onEnded) => {
                      playTracked('syllable', (done) => playSyllable('sarvakaryeshu', syllable, done), onEnded);
                    },
                    stopVoice: stopAllVoice
                  }}
                />

                <SarvadaGame
                  isActive={sceneState.phase === PHASES.SARVADA_GAME}
                  hideElements={!!revealConfig || showPowerOverlay}
                  onMicroWin={handleMicroWin}
                  initialTimes={sceneState.timesDone || 0}
                  onBeatComplete={(n) => sceneActions.checkpoint({ timesDone: n })}
                  onPhaseComplete={() => window.setTimeout(() => handlePhaseComplete('sarvada'), 0)}
                  onGameComplete={() => {}}
                  onReplayKeyChange={handleSarvadaReplayKeyChange}
                  isPaused={isRecorderOpen || sidebarPause.isSidebarPaused}
                  voiceGuidance={{
                    playVoice: playGuidanceVoice,
                    setBeat,
                    playWord: (word, onEnded) => playTracked(
                      'word',
                      (done) => playWordAudio(word, done),
                      onEnded,
                    ),
                    playSyllable: (syllable, onEnded) => {
                      playTracked(
                        'syllable',
                        (done) => playSyllable('sarvada', syllable, done),
                        onEnded,
                      );
                    },
                    stopVoice: stopAllVoice
                  }}
                />

                {showTapSparkles && (
                  <div className="sarva-tap-sparkles" style={sparklePos ? { left: `${sparklePos.x}%`, top: `${sparklePos.y}%`, width: '42%', height: '42%', right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)' } : undefined}>
                    <SparkleAnimation type="star" count={16} color="#FFD54F" size={13} duration={1300} area="full" />
                  </div>
                )}

                {revealConfig && (
                  <SymbolAutoReveal
                    key={revealConfig.symbolId}
                    symbolId={revealConfig.symbolId}
                    symbolImage={revealConfig.symbolImage}
                    symbolName={revealConfig.symbolName}
                    affirmation={revealConfig.affirmation}
                    revealVoice={{
                      isEnabled: isAudioOn,
                      wordId: revealConfig.symbolId,

                      playWord: playWordAudio,
                      playLine: playGuidanceVoice,
                      stopVoice: stopAllVoice,
                    }}
                    sidebarTargetRect={revealConfig.sidebarTarget}
                    zoneId={zoneId}
                    sceneId={sceneId}
                    onComplete={() => handleRevealComplete(revealConfig.symbolId)}
                  />
                )}

                {!showAppDiscovery &&
                  !isFinalCelebrationActive &&
                  !(sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) && (
                    <AppSidebar
                      unlockedApps={sceneState.unlockedApps || {}}
                      savedRecordings={savedRecordings}
                      onSaveRecording={handleSaveRecording}
                      onDeleteRecording={handleDeleteRecording}
                      isReload={isReload}
                      onPopupOpen={() => {
                        if ([PHASES.SARVAKARYESHU_GAME, PHASES.SARVADA_GAME].includes(sceneState.phase)) beginSidebarPause();
                        stopAllVoice();
                        stopIdleTimer();
                        setIsRecorderOpen(true);
                      }}
                      onPopupClose={() => {
                        setIsRecorderOpen(false);
                        const activeGamePhases = [PHASES.SARVAKARYESHU_GAME, PHASES.SARVADA_GAME];
                        if (activeGamePhases.includes(sceneState.phase) && !revealConfig) startIdleTimer();
                        endSidebarPause();
                      }}
                    />
                  )}

                {miniGesture.show && (
                  <GaneshaGestureCue
                    key={miniGesture.key}
                    gestureType={miniGesture.type}
                    position={miniGesture.position}
                    size={120}
                  />
                )}

                {showSparkle === 'final-fireworks' && (
                  <>
                    <FireworksCompletion show showCard={false} />
                    <CalmGoldenFireworks
                      show
                      particles={14}
                      duration={3500}
                      onComplete={() => {
                        setShowSparkle(null);
                        setShowMandala(true);
                      }}
                    />
                  </>
                )}

                {showMandala && (
                  <InnerMandala
                    childName={profileName}
                    shlokaPetalStates={{ 1: 'activated', 2: 'activated', 3: 'activated', 4: 'activated', 5: 'activated', 6: 'activated' }}
                    justEarnedPetals={sceneOuterPetalIds.map((id) => ({ ring: 'outer', id }))}
                    earnedSymbols={[
                      { id: 'sarvakaryeshu', petalId: 7, ring: 'outer', image: symbolSarvakaryeshu },
                      { id: 'sarvada', petalId: 8, ring: 'outer', image: symbolSarvada },
                    ]}
                    waitForVoice
                    onEarnedPetalReveal={(earnedPetal, _index, done) => {
                      const symbolByPetal = {
                        7: 'sarvakaryeshu',
                        8: 'sarvada',
                      };
                      const lines = {
                        sarvakaryeshu: 'You remembered Ganesha in what you did.',
                        sarvada: 'You found Ganesha with you through the whole day.',
                      };
                      const symbol = symbolByPetal[earnedPetal?.id];
                      // The Mandala holds the next symbol until this line ends (done). The
                      // scene-complete line plays on the completion screen, not here.
                      if (lines[symbol]) {
                        speakWebSpeech(lines[symbol], done);
                      } else {
                        done?.();
                      }
                    }}
                    highlightPetals={sceneOuterPetalIds}
                    message="These meanings are growing inside you"
                    autoCloseMs={3000 + (2 * 950) + 2600 + 5500}
                    onClose={() => {
                      setShowMandala(false);
                      setShowSceneCompletion(true);
                    }}
                  />
                )}
              </>
            )}

            {shouldShowOpeningModal && (
              <OpeningModal
                zoneId={zoneId}
                sceneId={sceneId}
                isOpen
                onStart={() => {
                  playUiTap();
                  stopAllVoice();
                  sceneActions.checkpoint({
                    welcomeShown: true,
                    phase: PHASES.SARVAKARYESHU_GAME,
                    cardsDone: 0,
                  });
                }}
                characterImg={ganeshaHeadphones}
                showButton={openingButtonVisible}
              />
            )}

            <SceneCompletionCelebration
              show={showSceneCompletion && !showMandala}
              zoneId={zoneId}
              sceneName="Ganesha All Day"
              completionTitle={completionModalContent?.title}
              completionSubtitle={completionModalContent?.subtitle}
              sceneNumber={4}
              totalScenes={5}
              starsEarned={5}
              totalStars={5}
              discoveredSymbols={['sarvakaryeshu', 'sarvada']}
              containerType="backpack"
              symbolImages={{ sarvakaryeshu: symbolSarvakaryeshu, sarvada: symbolSarvada }}
              symbolData={{
                sarvakaryeshu: {
                  title: 'Sarvakaryeshu - In All Tasks',
                  description: 'Every situation has a power. Chant: SAR-VA-KAR-YE-SHU',
                },
                sarvada: {
                  title: 'Sarvada - Always',
                  description: 'Morning, afternoon, night. Chant: SAR-VA-DA',
                },
              }}
              savedRecordings={savedRecordings}
              nextSceneName="Build the Shloka!"
              sceneId="sarvakaryeshu-chant"
              completionData={{
                stars: 5,
                syllables: sceneState.learnedSyllables,
                words: sceneState.learnedWords,
                completed: true,
              }}
              onComplete={() => onNavigate?.('zone-welcome')}
              onReplay={() => {
                stopAllVoice();
                setShowSceneCompletion(false);
                setShowMandala(false);
                setRevealConfig(null);
                setShowSparkle(null);
                setOpeningButtonVisible(true);
                resetScene();
              }}
              onContinue={() => { stopAllVoice(); onNavigate?.('scene-complete-continue'); }}
            />

            {/* ProgressiveHintSystem disabled per request */}
          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default SarvakaryeshuChantSimplified;
