import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameSounds } from '../../../../lib/hooks/useGameSounds';
import './SuryakotiBankSimplified.css';

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
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
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

import SuryakotiGame from './components/SuryakotiGame';
import SamaprabhaGame from './components/SamaprabhaGame';

import ganeshaHeadphones from './assets/images/ganesha_with_headphones.png';
import riverBackground from './assets/images/saurakoti-bg.png';
import mooshikaCoach from './assets/images/mooshika-coach.png';
import symbolVakratunda from '../../../meaning cave/assets/images/symbols/vakratunda-symbol.png';
import symbolMahakaya from '../../../meaning cave/assets/images/symbols/mahakaya-symbol.png';
import symbolSuryakoti from '../../../meaning cave/assets/images/symbols/suryakoti-symbol.png';
import symbolSamaprabha from '../../../meaning cave/assets/images/symbols/samaprabha-symbol.png';

const RESUME_DELAY_MS = 3000;
const sceneOuterPetalId = SCENE_TO_OUTER_PETAL_ID['Bring Back the Light!'];
const sceneOuterPetalIds = [sceneOuterPetalId - 1, sceneOuterPetalId];
const debugFireworksBtnStyle = {
  position: 'fixed',
  top: '18px',
  right: '18px',
  zIndex: 1200,
  padding: '8px 12px',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.45)',
  background: 'rgba(34, 24, 68, 0.82)',
  color: '#fff7d6',
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0.02em',
  cursor: 'pointer',
  boxShadow: '0 10px 24px rgba(0,0,0,0.22)',
};

const PHASES = {
  INITIAL: 'initial',
  SURYAKOTI_GAME: 'suryakoti_game',
  SURYAKOTI_COMPLETE: 'suryakoti_complete',
  SURYAKOTI_POWER: 'suryakoti_power',
  SAMAPRABHA_GAME: 'samaprabha_game',
  SAMAPRABHA_COMPLETE: 'samaprabha_complete',
  SAMAPRABHA_POWER: 'samaprabha_power',
  COMPLETE: 'complete',
};

const powerConfig = {
  suryakoti: {
    name: 'Radiance Power',
    image: symbolSuryakoti,
    color: '#EF9F27',
    affirmation: 'I shine bright like ten million suns.',
    story: 'Even in the dark, your light shows the way.',
  },
  samaprabha: {
    name: 'Equal Light',
    image: symbolSamaprabha,
    color: '#F9B7D2',
    affirmation: 'I share my light so everyone shines.',
    story: 'When you share, everyone glows.',
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
          <button type="button" onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const SuryakotiBankSimplified = ({
  onComplete,
  onNavigate,
  zoneId = 'shloka-river',
  sceneId = 'suryakoti-bank',
}) => (
  <ErrorBoundary>
    <SceneManager
      zoneId={zoneId}
      sceneId={sceneId}
      initialState={{
        phase: PHASES.INITIAL,
        learnedWords: { suryakoti: false, samaprabha: false },
        chantedVerses: {},
        learnedSyllables: {},
        unlockedApps: {
          vakratunda: true,
          mahakaya: true,
          suryakoti: false,
          samaprabha: false,
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
        <SuryakotiBankContent
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

const SuryakotiBankContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId,
}) => {
  const progressiveHintRef = useRef(null);
  const speechSynthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const audioEnabledRef = useRef(false);
  const suryaIntroPlayedRef = useRef(false);
  const samaIntroPlayedRef = useRef(false);
  const suryaInteractionStartedRef = useRef(false);
  const samaInteractionStartedRef = useRef(false);

  const { resetScene } = useSceneReset(sceneActions, zoneId, sceneId, getSceneResetConfig(sceneId));
  const completionModalContent = getCompletionModal(zoneId, sceneId);
  const { miniGesture, triggerMiniGesture } = useMiniGesture();

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showMandala, setShowMandala] = useState(false);
  const [revealConfig, setRevealConfig] = useState(null);
  const [showTapSparkles, setShowTapSparkles] = useState(false);
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
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  const { isAudioOn, toggleAudio } = useAudioPreference();
  audioEnabledRef.current = isAudioOn;

  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'explorer';
  const sidebarUnlockedApps = {
    vakratunda: true,
    mahakaya: true,
    ...(sceneState?.unlockedApps || {}),
  };

  const isFinalCelebrationActive =
    showSparkle === 'final-fireworks' ||
    showMandala ||
    showSceneCompletion ||
    sceneState?.phase === PHASES.COMPLETE;
  const shouldShowOpeningModal =
    sceneState?.phase === PHASES.INITIAL &&
    !sceneState?.welcomeShown &&
    !showSceneCompletion &&
    !showMandala &&
    showSparkle !== 'final-fireworks';

  const {
    stopVoice,
    setVoiceVolume,
    playWord: playWordAudio,
    playSyllable,
    playSfx,
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

  const stopWebSpeech = useCallback(() => {
    try {
      speechSynthRef.current?.cancel();
    } catch {
      // no-op
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

  const playGuidanceVoice = useCallback((key, onEnded) => {
    const webSpeechMap = {
      welcome: "The river is dark today. Let's bring back the light!",
      scene11_intro: "The river is dark today. Let's bring back the light!",
      scene11_surya_intro: 'The little bunny wants to find its way home!',
      scene11_surya_rub: 'Rub the darkness away.',
      scene11_surya_hint: 'Rub the darkness away.',
      scene11_surya_success: 'You brought back the light! The bunny found its way home!',
      scene11_surya_done: 'You brought back the light! The bunny found its way home!',
      scene11_surya_meaning: 'Suryakoti means bright as ten million suns.',
      scene11_sama_hint: 'Tap the glowing circle to move the sun.',
      scene11_sama_done: 'You shared the light! Now both birds are warm!',
      scene11_sama_meaning: 'Samaprabha means equal brightness.',
      suryakotiSetup: 'The bunny found its way because of your light.',
      suryakotiClaim: 'Suryakoti lights the way.',
      samaprabhaSetup: "One bird has too much light. Let's share it!",
      samaprabhaClaim: 'Samaprabha helps us share fairly.',
      sceneComplete: 'You found the bunny. You shared the light. Both powers are yours now.',
    };
    if (webSpeechMap[key]) {
      speakWebSpeech(webSpeechMap[key], onEnded);
      return;
    }
    onEnded?.();
  }, [speakWebSpeech]);

  const replayCurrentVoice = useCallback(() => {
    if (!isAudioOn) return;
    if (!sceneState?.welcomeShown || sceneState?.phase === PHASES.INITIAL) {
      playGuidanceVoice('welcome');
      return;
    }
    if (sceneState.phase === PHASES.SURYAKOTI_GAME) {
      playGuidanceVoice('scene11_surya_hint');
      return;
    }
    if (sceneState.phase === PHASES.SAMAPRABHA_GAME) {
      playGuidanceVoice('scene11_sama_hint');
      return;
    }
    if (showSceneCompletion) {
      playGuidanceVoice('sceneComplete');
    }
  }, [isAudioOn, playGuidanceVoice, sceneState?.phase, sceneState?.welcomeShown, showSceneCompletion]);

  const stopAllVoice = useCallback(() => {
    stopVoice();
    stopWebSpeech();
  }, [stopVoice, stopWebSpeech]);

  const pauseCelebRef = useRef(null);
  const onPauseHide = useCallback(() => pauseCelebRef.current?.(), []);
  const onPauseShow = useCallback(() => {
    if ([PHASES.SURYAKOTI_GAME, PHASES.SAMAPRABHA_GAME].includes(sceneState?.phase)) {
      startIdleTimer();
    }
  }, [sceneState?.phase, startIdleTimer]);

  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: onPauseHide,
    onShow: onPauseShow,
    resumeDelay: RESUME_DELAY_MS,
  });

  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts]);
  useEffect(() => () => stopWebSpeech(), [stopWebSpeech]);

  const getSidebarTarget = useCallback((symbolId) => {
    const el = document.getElementById(`sidebar-${symbolId}`);
    if (!el) return { x: 220, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2) - (window.innerWidth / 2),
      y: (r.top + r.height / 2) - (window.innerHeight / 2),
    };
  }, []);

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
      console.error('Error saving game state:', error);
    }
  }, [sceneId, sceneState.chantedVerses, sceneState.learnedSyllables, sceneState.learnedWords, sceneState.unlockedApps, zoneId]);

  const handleAppDiscoveryCelebrate = useCallback(() => {
    if (isAudioOn) {
      playGuidanceVoice('sceneComplete');
    }

    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true },
    });
    persistCompletion();

    setShowSparkle('final-fireworks');
  }, [isAudioOn, persistCompletion, playGuidanceVoice, sceneActions]);

  const handleDebugFireworks = useCallback(() => {
    stopAllVoice();
    setRevealConfig(null);
    setShowPowerOverlay(false);
    setShowMandala(false);
    setShowSceneCompletion(false);
    setShowSparkle('final-fireworks');
  }, [stopAllVoice]);

  useEffect(() => {
    if (
      sceneState?.phase === PHASES.COMPLETE &&
      !showSparkle &&
      !showMandala &&
      !showSceneCompletion
    ) {
      setShowMandala(true);
    }
  }, [sceneState?.phase, showMandala, showSparkle, showSceneCompletion]);

  // ── Reload: restore SymbolAutoReveal if resumed mid-reveal ─────────────────
  useEffect(() => {
    if (!sceneState || revealConfig) return;

    const restoreReveal = (word) => {
      safeSetTimeout(() => {
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

    if ([PHASES.SURYAKOTI_COMPLETE, PHASES.SURYAKOTI_POWER].includes(sceneState.phase)) {
      restoreReveal('suryakoti');
      return;
    }

    if ([PHASES.SAMAPRABHA_COMPLETE, PHASES.SAMAPRABHA_POWER].includes(sceneState.phase)) {
      restoreReveal('samaprabha');
    }
  }, [sceneState?.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRevealComplete = useCallback((symbolId) => {
    setRevealConfig(null);

    if (symbolId === 'suryakoti') {
      const appsNow = sceneState.unlockedApps || {};
      safeSetTimeout(() => {
        sceneActions.updateState({
          unlockedApps: { ...appsNow, suryakoti: true },
          phase: PHASES.SAMAPRABHA_GAME,
        });
      }, 950);
      return;
    }

    if (symbolId === 'samaprabha') {
      const appsNow = sceneState.unlockedApps || {};
      safeSetTimeout(() => {
        sceneActions.updateState({
          unlockedApps: { ...appsNow, samaprabha: true },
        });
      }, 950);
      safeSetTimeout(() => {
        handleAppDiscoveryCelebrate();
      }, 1500);
    }
  }, [handleAppDiscoveryCelebrate, safeSetTimeout, sceneActions, sceneState.unlockedApps]);

  const handleAudioToggle = useCallback(() => {
    const nextOn = !isAudioOn;
    setVoiceVolume(nextOn ? 1 : 0);
    if (!nextOn && sceneState?.phase === PHASES.INITIAL) {
      stopAllVoice();
    }
    toggleAudio();
  }, [isAudioOn, sceneState?.phase, setVoiceVolume, stopAllVoice, toggleAudio]);

  useEffect(() => {
    if (sceneState?.phase === PHASES.INITIAL && !sceneState?.welcomeShown) {
      setOpeningButtonVisible(true);
      if (!audioEnabledRef.current) return undefined;
      const timer = window.setTimeout(() => {
        playGuidanceVoice('welcome', () => {
          playSfx('chime');
        });
      }, 800);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [playGuidanceVoice, playSfx, sceneState?.phase, sceneState?.welcomeShown]);

  useEffect(() => {
    if (sceneState?.phase === PHASES.SURYAKOTI_GAME && sceneState?.welcomeShown) {
      setCurrentPhase('suryakotiGame');
      if (isAudioOn && !suryaIntroPlayedRef.current) {
        suryaIntroPlayedRef.current = true;
        const cancelIntro = safeSetTimeout(() => {
          if (suryaInteractionStartedRef.current) return;
          playGuidanceVoice('scene11_surya_intro', () => {
            if (suryaInteractionStartedRef.current) return;
            playGuidanceVoice('scene11_surya_rub', () => {
              if (suryaInteractionStartedRef.current) return;
              safeSetTimeout(() => {
                startIdleTimer();
              }, 3500);
            });
          });
        }, 2500);
        return () => cancelIntro?.();
      }
      startIdleTimer();
      return undefined;
    }

    return undefined;
  }, [isAudioOn, playGuidanceVoice, safeSetTimeout, sceneState?.phase, sceneState?.welcomeShown, setCurrentPhase, startIdleTimer]);

  useEffect(() => {
    if (sceneState?.phase !== PHASES.SURYAKOTI_GAME) {
      suryaIntroPlayedRef.current = false;
      suryaInteractionStartedRef.current = false;
    }
  }, [sceneState?.phase]);

  useEffect(() => {
    if (sceneState?.phase === PHASES.SAMAPRABHA_GAME) {
      setCurrentPhase('samaprabhaGame');
      if (isAudioOn && !samaIntroPlayedRef.current) {
        samaIntroPlayedRef.current = true;
        playGuidanceVoice('samaprabhaSetup', () => {
          if (samaInteractionStartedRef.current) return;
          playGuidanceVoice('scene11_sama_hint', () => {
            if (samaInteractionStartedRef.current) return;
            safeSetTimeout(() => {
              startIdleTimer();
            }, 3500);
          });
        });
        return undefined;
      }
      startIdleTimer();
      return undefined;
    }

    return undefined;
  }, [isAudioOn, playGuidanceVoice, safeSetTimeout, sceneState?.phase, setCurrentPhase, startIdleTimer]);

  useEffect(() => {
    if (sceneState?.phase !== PHASES.SAMAPRABHA_GAME) {
      samaIntroPlayedRef.current = false;
      samaInteractionStartedRef.current = false;
    }
  }, [sceneState?.phase]);

  const handlePhaseComplete = useCallback((word) => {
    safeSetTimeout(() => {
      triggerMiniGesture('blessing', 'center', 2500);
      stopIdleTimer();
      setCurrentPhase(null);

      const chantKey = word === 'suryakoti' ? 'suryakoti-chant' : 'samaprabha-chant';
      sceneActions.updateState({
        learnedWords: { ...(sceneState.learnedWords || {}), [word]: true },
        chantedVerses: { ...(sceneState.chantedVerses || {}), [chantKey]: true },
        phase: word === 'suryakoti' ? PHASES.SURYAKOTI_COMPLETE : PHASES.SAMAPRABHA_COMPLETE,
      });

      setShowSparkle(`${word}-celebration`);

      const triggerReveal = () => {
        setShowSparkle(null);
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
          phase: word === 'suryakoti' ? PHASES.SURYAKOTI_POWER : PHASES.SAMAPRABHA_POWER,
        });
      };

      safeSetTimeout(() => {
        triggerReveal();
      }, isAudioOn ? 400 : 1500);
    }, 0);
  }, [
    getSidebarTarget,
    isAudioOn,
    playChime,
    safeSetTimeout,
    sceneActions,
    sceneId,
    sceneState.chantedVerses,
    sceneState.learnedWords,
    setCurrentPhase,
    stopIdleTimer,
    triggerMiniGesture,
    zoneId,
  ]);

  const handleMicroWin = useCallback(() => {
    triggerMiniGesture('thumbsup', 'item', 1200);
    setShowTapSparkles(true);
    safeSetTimeout(() => setShowTapSparkles(false), 850);
  }, [safeSetTimeout, triggerMiniGesture]);

  if (!sceneState) return <div className="loading">Loading...</div>;

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="suryakoti-simplified-container">
          <HomeButton onNavigate={onNavigate} />
          <ZoneBadgeButton zoneId="shloka-river" onBack={() => onNavigate?.('zone-welcome')} />
          <button type="button" style={debugFireworksBtnStyle} onClick={handleDebugFireworks}>
            Debug Fireworks
          </button>
          <AudioToggle isAudioOn={isAudioOn} onToggle={handleAudioToggle} />
          <VOReplayButton onReplay={replayCurrentVoice} disabled={!isAudioOn} />
          <ResumeCountdown value={countdownValue} />

          <div className="suryakoti-river-background" style={{ backgroundImage: `url(${riverBackground})` }}>
            {!showSceneCompletion && (
              <>
                <SuryakotiGame
                  isActive={sceneState.phase === PHASES.SURYAKOTI_GAME}
                  hideElements={!!revealConfig}
                  onMicroWin={handleMicroWin}
                  onPhaseComplete={() => handlePhaseComplete('suryakoti')}
                  onGameComplete={() => {}}
                  onFirstInteraction={() => {
                    suryaInteractionStartedRef.current = true;
                    stopAllVoice();
                  }}
                  voiceGuidance={{
                    playVoice: playGuidanceVoice,
                    playWord: playWordAudio,
                    playSyllable: (syllable, onEnded) => {
                      stopAllVoice();
                      playSyllable('suryakoti', syllable, onEnded);
                    },
                    stopVoice: stopAllVoice,
                  }}
                  isPaused={isRecorderOpen}
                />

                <SamaprabhaGame
                  isActive={sceneState.phase === PHASES.SAMAPRABHA_GAME}
                  hideElements={!!revealConfig}
                  onMicroWin={handleMicroWin}
                  onPhaseComplete={() => handlePhaseComplete('samaprabha')}
                  onGameComplete={() => {}}
                  onFirstInteraction={() => {
                    samaInteractionStartedRef.current = true;
                    stopAllVoice();
                  }}
                  voiceGuidance={{
                    playVoice: playGuidanceVoice,
                    playWord: playWordAudio,
                    playSyllable: (syllable, onEnded) => {
                      stopAllVoice();
                      playSyllable('samaprabha', syllable, onEnded);
                    },
                    stopVoice: stopAllVoice,
                  }}
                  isPaused={isRecorderOpen}
                />

                {showTapSparkles && (
                  <div className="suryakoti-tap-sparkles">
                    <SparkleAnimation
                      type="magic"
                      count={14}
                      color="#FFD54F"
                      size={9}
                      duration={850}
                      area="full"
                    />
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
                      meaningKey: revealConfig.symbolId === 'suryakoti'
                        ? 'scene11_surya_meaning'
                        : revealConfig.symbolId === 'samaprabha'
                          ? 'scene11_sama_meaning'
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

                {!isFinalCelebrationActive &&
                  !(sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) && (
                    <AppSidebar
                      unlockedApps={sidebarUnlockedApps}
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
                        const activeGamePhases = [PHASES.SURYAKOTI_GAME, PHASES.SAMAPRABHA_GAME];
                        if (activeGamePhases.includes(sceneState.phase) && !revealConfig) {
                          startIdleTimer();
                        }
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
                    <FireworksCompletion
                      show={showSparkle === 'final-fireworks'}
                      showCard={false}
                    />
                    <CalmGoldenFireworks
                      show={showSparkle === 'final-fireworks'}
                      particles={14}
                      duration={3500}
                      onComplete={() => {
                        setShowSparkle(null);
                        setShowSparkle(null);
                        setShowMandala(true);
                      }}
                    />
                  </>
                )}

                {showMandala && (
                  <InnerMandala
                    childName={profileName}
                    shlokaPetalStates={{
                      1: 'activated', 2: 'activated',
                    }}
                    justEarnedPetals={sceneOuterPetalIds.map((id) => ({ ring: 'outer', id }))}
                    earnedSymbols={[
                      { id: 'suryakoti', petalId: 3, ring: 'middle', image: symbolSuryakoti },
                      { id: 'samaprabha', petalId: 4, ring: 'middle', image: symbolSamaprabha },
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
                    phase: PHASES.SURYAKOTI_GAME,
                  });
                }}
                characterImg={ganeshaHeadphones}
                showButton={openingButtonVisible}
              />
            )}

            <SceneCompletionCelebration
              show={showSceneCompletion && !showMandala}
              zoneId={zoneId}
              sceneName="Suryakoti Bank"
              completionTitle={completionModalContent?.title}
              completionSubtitle={completionModalContent?.subtitle}
              sceneNumber={2}
              totalScenes={5}
              starsEarned={5}
              totalStars={5}
              discoveredSymbols={['suryakoti', 'samaprabha']}
              containerType="backpack"
              symbolImages={{
                suryakoti: symbolSuryakoti,
                samaprabha: symbolSamaprabha,
              }}
              symbolData={{
                suryakoti: {
                  title: 'Suryakoti - Brightness of Ten Million Suns',
                  description: 'Radiance that lights up the world. Chant: SU-RYA-KO-TI',
                },
                samaprabha: {
                  title: 'Samaprabha - Equal Brightness',
                  description: 'Light shared equally with all. Chant: SA-MA-PRA-BHA',
                },
              }}
              savedRecordings={savedRecordings}
              nextSceneName="Next Scene"
              sceneId="suryakoti-bank"
              completionData={{
                stars: 5,
                syllables: sceneState.learnedSyllables,
                words: sceneState.learnedWords,
                completed: true,
              }}
              onComplete={() => onNavigate?.('zone-welcome')}
              onReplay={() => {
                clearAllTimeouts();
                stopAllVoice();
                setShowSceneCompletion(false);
                setShowMandala(false);
                setRevealConfig(null);
                setShowSparkle(null);
                setOpeningButtonVisible(true);
                resetScene();
              }}
              onContinue={() => {
                onNavigate?.('scene-complete-continue');
              }}
            />

            <ProgressiveHintSystem
              ref={progressiveHintRef}
              sceneId={sceneId}
              sceneState={sceneState}
              hintConfigs={[]}
              characterImage={mooshikaCoach}
              enabled={false}
            />
          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default SuryakotiBankSimplified;
