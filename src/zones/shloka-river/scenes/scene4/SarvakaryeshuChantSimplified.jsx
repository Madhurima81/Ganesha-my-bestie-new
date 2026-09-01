import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameSounds } from '../../../../lib/hooks/useGameSounds';
import './SarvakaryeshuChantSimplified.css';

import SceneManager from '../../../../lib/components/scenes/SceneManager';
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
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
import HomeButton from '../../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../../lib/components/ui/AudioToggle/AudioToggle';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
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

import symbolVakratunda from '../../../meaning cave/assets/images/symbols/vakratunda-symbol.png';
import symbolMahakaya from '../../../meaning cave/assets/images/symbols/mahakaya-symbol.png';
import symbolSuryakoti from '../../../meaning cave/assets/images/symbols/suryakoti-symbol.png';
import symbolSamaprabha from '../../../meaning cave/assets/images/symbols/samaprabha-symbol.png';
import symbolNirvighnam from '../../../meaning cave/assets/images/symbols/nirvighnam-symbol.png';
import symbolKurumedeva from '../../../meaning cave/assets/images/symbols/kurumedeva-symbol.png';
import symbolSarvakaryeshu from '../../../meaning cave/assets/images/symbols/sarvakaryeshu-symbol.png';
import symbolSarvada from '../../../meaning cave/assets/images/symbols/sarvada-symbol.png';

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
  const guidanceVoiceActiveRef = useRef(false);
  const guidanceVoiceTimerRef = useRef(null);
  const lastGuidanceVoiceEndedAtRef = useRef(0);

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
    if (!audioEnabledRef.current || !text) {
      onEnded?.();
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
      utterance.onend = () => onEnded?.();
      utterance.onerror = () => onEnded?.();
      synth.speak(utterance);
    } catch {
      onEnded?.();
    }
  }, []);

  const playGuidanceVoice = useCallback((key, onEnded, options = {}) => {
    const { minDelayAfterVoiceMs = 0, replayOnReturn = false, stripLeadingText = null } = options;
    const map = {
      scene13_puzzle: "The painting didn’t go as planned. What could help him try a different way?",
      scene13_puzzle_after: "The Trunk helped him try another way — and the splat became a whale!",
      scene13_sports: "He feels upset inside. What could help him make room for his feelings?",
      scene13_sports_after: "The Belly reminded him to make room for his feelings and take a slow breath.",
      scene13_bike: "Everyone is looking, but they’re missing an important clue. What could help her notice it?",
      scene13_bike_after: "The Eyes helped her look carefully and notice what everyone else missed.",
      scene13_grandma: "He wants to finish his special card, but everything keeps pulling his attention away. What could help him stay focused?",
      scene13_grandma_after: "The Tusk helped him stay focused on what was important.",
      welcome: "Each friend is stuck in a different way. Look carefully and choose the power that can help.",
      scene13_try_again: "Try another symbol.",
      scene13_success: "Sarva-Karyeshu! You chose the right power and solved every task.",
      scene13_meaning: "Sarva Karyeshu means in everything we do.",
      scene14_intro: "Morning, afternoon, and night, Ganesha's symbols are there to find. Can you spot each one?",
      scene14_morning: "Let's look at the morning memory.",
      scene14_afternoon: "Now the afternoon memory.",
      scene14_night: "Now the night memory.",
      scene14_find_symbol: "Can you find the hidden symbol?",
      scene14_success: "Sarvada! You found the wisdom in every part of the day.",
      scene14_meaning: "Sarvada means always.",
      sceneComplete: "And you can carry them with you, all through your day.",
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
      playGuidanceVoice('scene14_morning');
      return;
    }
    if (showSceneCompletion) playGuidanceVoice('sceneComplete');
  }, [isAudioOn, playGuidanceVoice, sceneState.phase, sceneState.welcomeShown, showSceneCompletion]);

  const stopAllVoice = useCallback(() => {
    clearGuidanceVoiceTimer();
    guidanceVoiceActiveRef.current = false;
    stopVoice();
    stopWebSpeech();
  }, [clearGuidanceVoiceTimer, stopVoice, stopWebSpeech]);

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
    const element = document.getElementById(`sidebar-${symbolId}`);
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
        });
      }, 950);
    } else {
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
    if (!nextOn) stopAllVoice();
    toggleAudio();
  };

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

    if (isAudioOn) {
      const successKey = word === 'sarvakaryeshu' ? 'scene13_success' : 'scene14_success';
      // iOS Safari can silently drop utterance onend/onerror — don't let the reveal hang on VO
      const voFallback = window.setTimeout(() => triggerReveal(), 9000);
      window.setTimeout(() => {
        playGuidanceVoice(successKey, () => {
          window.clearTimeout(voFallback);
          window.setTimeout(() => triggerReveal(), 250);
        }, { stripLeadingText: word === 'sarvakaryeshu' ? 'Sarva-Karyeshu' : 'Sarvada' });
      }, 250);
    } else {
      window.setTimeout(() => triggerReveal(), 350);
    }
  }, [
    sceneState,
    sceneActions,
    zoneId,
    sceneId,
    isAudioOn,
    playChime,
    playGuidanceVoice,
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
    if (isAudioOn) playGuidanceVoice('sceneComplete');
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
          <HomeButton onNavigate={onNavigate} />
          <ZoneBadgeButton zoneId="shloka-river" onBack={() => onNavigate?.('zone-welcome')} />
          <AudioToggle isAudioOn={isAudioOn} onToggle={handleAudioToggle} />
          <VOReplayButton onReplay={replayCurrentVoice} disabled={!isAudioOn} />
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
                  isActive={sceneState.phase === PHASES.SARVAKARYESHU_GAME}
                  hideElements={!!revealConfig || showPowerOverlay}
                  onMicroWin={handleMicroWin}
                  onPhaseComplete={() => window.setTimeout(() => handlePhaseComplete('sarvakaryeshu'), 0)}
                  onGameComplete={() => {}}
                  isPaused={isRecorderOpen}
                  voiceGuidance={{
                    playVoice: playGuidanceVoice,
                    playWord: playWordAudio,
                    playSyllable: (syllable, onEnded) => {
                      if (!audioEnabledRef.current) {
                        onEnded?.();
                        return;
                      }
                      playSyllable('sarvakaryeshu', syllable, onEnded);
                    },
                    stopVoice: stopAllVoice
                  }}
                />

                <SarvadaGame
                  isActive={sceneState.phase === PHASES.SARVADA_GAME}
                  hideElements={!!revealConfig || showPowerOverlay}
                  onMicroWin={handleMicroWin}
                  onPhaseComplete={() => window.setTimeout(() => handlePhaseComplete('sarvada'), 0)}
                  onGameComplete={() => {}}
                  isPaused={isRecorderOpen}
                  voiceGuidance={{
                    playVoice: playGuidanceVoice,
                    playWord: playWordAudio,
                    playSyllable: (syllable, onEnded) => {
                      if (!audioEnabledRef.current) {
                        onEnded?.();
                        return;
                      }
                      playSyllable('sarvada', syllable, onEnded);
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
                      meaningKey: revealConfig.symbolId === 'sarvakaryeshu'
                        ? 'scene13_meaning'
                        : revealConfig.symbolId === 'sarvada'
                          ? 'scene14_meaning'
                          : null,
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
                        stopAllVoice();
                        stopIdleTimer();
                        setIsRecorderOpen(true);
                      }}
                      onPopupClose={() => {
                        setIsRecorderOpen(false);
                        const activeGamePhases = [PHASES.SARVAKARYESHU_GAME, PHASES.SARVADA_GAME];
                        if (activeGamePhases.includes(sceneState.phase) && !revealConfig) startIdleTimer();
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
                    highlightPetals={sceneOuterPetalIds}
                    message="These meanings are growing inside you"
                    autoCloseMs={3000 + (2 * 950) + 2600}
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
                  sceneActions.updateState({
                    welcomeShown: true,
                    phase: PHASES.SARVAKARYESHU_GAME,
                  });
                }}
                characterImg={ganeshaHeadphones}
                showButton={openingButtonVisible}
              />
            )}

            <SceneCompletionCelebration
              show={showSceneCompletion && !showMandala}
              zoneId={zoneId}
              sceneName="Sarvakaryeshu Chant"
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
              nextSceneName="Final Scene"
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
              onContinue={() => onNavigate?.('scene-complete-continue')}
            />

            {/* ProgressiveHintSystem disabled per request */}
          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default SarvakaryeshuChantSimplified;
