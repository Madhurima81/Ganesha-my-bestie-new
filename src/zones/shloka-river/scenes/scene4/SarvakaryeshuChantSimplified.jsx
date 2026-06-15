import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameSounds } from '../../../../lib/hooks/useGameSounds';
import './SarvakaryeshuChantSimplified.css';

import SceneManager from '../../../../lib/components/scenes/SceneManager';
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import MessageManager from '../../../../lib/components/scenes/MessageManager';
import InteractionManager from '../../../../lib/components/scenes/InteractionManager';
import GameStateManager from '../../../../lib/services/GameStateManager';
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
import riverBg from './assets/images/Kurumedeva/bg.png';

import symbolSarvakaryeshu from '../../../meaning cave/assets/images/symbols/sarvakaryeshu-symbol.png';
import symbolSarvada from '../../../meaning cave/assets/images/symbols/sarvada-symbol.png';

const RESUME_DELAY_MS = 3000;

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

const powerConfig = {
  sarvakaryeshu: {
    name: 'In All Tasks',
    image: symbolSarvakaryeshu,
    color: '#9C6FD6',
    affirmation: 'I use my powers in every task.',
    story: 'Ganesha helps in all things - big and small.',
  },
  sarvada: {
    name: 'Always',
    image: symbolSarvada,
    color: '#FFB347',
    affirmation: 'These powers stay with me, always.',
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
        sarvakaryeshuGameState: null,
        sarvadaGameState: null,
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
  const [openingButtonVisible, setOpeningButtonVisible] = useState(false);
  const [savedRecordings, setSavedRecordings] = useState({});
  const [showAppDiscovery, setShowAppDiscovery] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  const { isAudioOn, toggleAudio, setAudioEnabled } = useAudioPreference();
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

  const {
    stopVoice,
    setVoiceVolume,
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
  const speechSynthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  const stopWebSpeech = useCallback(() => {
    try {
      speechSynthRef.current?.cancel();
    } catch {}
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
    const map = {
      welcome: "Let's discover two more powers.",
      sarva_hint: 'Pick the power that helps in each situation.',
      sarva_done: 'Ganesha helps in all things!',
      sarva_meaning: 'Sarvakaryeshu means - in all tasks. Every situation has a power.',
      sarvakaryeshuSetup: 'You matched the right power every time.',
      sarvakaryeshuClaim: 'I use my powers in every task.',
      sarvada_hint: 'Tap the memory bubble as it floats by.',
      sarvada_done: 'Sarvada - always.',
      sarvada_meaning: 'Sarvada means always. Morning, afternoon, night - these powers never leave.',
      sarvadaSetup: 'You remembered the powers across the whole day.',
      sarvadaClaim: 'These powers stay with me, always.',
      sceneComplete: 'In every task. Always. These powers are yours.',
    };

    if (map[key]) {
      speakWebSpeech(map[key], onEnded);
      return;
    }
    onEnded?.();
  }, [speakWebSpeech]);

  const replayCurrentVoice = useCallback(() => {
    if (!isAudioOn) return;
    if (!sceneState.welcomeShown || sceneState.phase === PHASES.INITIAL) {
      playGuidanceVoice('welcome');
      return;
    }
    if (sceneState.phase === PHASES.SARVAKARYESHU_GAME) {
      playGuidanceVoice('sarva_hint');
      return;
    }
    if (sceneState.phase === PHASES.SARVADA_GAME) {
      playGuidanceVoice('sarvada_hint');
      return;
    }
    if (showSceneCompletion) playGuidanceVoice('sceneComplete');
  }, [isAudioOn, playGuidanceVoice, sceneState.phase, sceneState.welcomeShown, showSceneCompletion]);

  const stopAllVoice = useCallback(() => {
    stopVoice();
    stopWebSpeech();
  }, [stopVoice, stopWebSpeech]);

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

  useEffect(() => {
    if (!revealConfig || !isAudioOn) return;
    const setupMap = { sarvakaryeshu: 'sarvakaryeshuSetup', sarvada: 'sarvadaSetup' };
    const claimMap = { sarvakaryeshu: 'sarvakaryeshuClaim', sarvada: 'sarvadaClaim' };
    const setup = setupMap[revealConfig.symbolId];
    const claim = claimMap[revealConfig.symbolId];
    if (!setup) return;
    const id = setTimeout(() => {
      playGuidanceVoice(setup, () => playGuidanceVoice(claim));
    }, 400);
    return () => clearTimeout(id);
  }, [revealConfig, isAudioOn, playGuidanceVoice]);

  const getSidebarTarget = (symbolId) => {
    const element = document.getElementById(`sidebar-${symbolId}`);
    if (!element) return { x: 220, y: 0 };
    const rect = element.getBoundingClientRect();
    return {
      x: (rect.left + rect.width / 2) - (window.innerWidth / 2),
      y: (rect.top + rect.height / 2) - (window.innerHeight / 2),
    };
  };

  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);
    const appsNow = sceneState.unlockedApps;

    if (symbolId === 'sarvakaryeshu') {
      window.setTimeout(() => {
        sceneActions.updateState({
          unlockedApps: { ...appsNow, sarvakaryeshu: true },
          phase: PHASES.SARVADA_GAME,
          sarvadaGameState: null,
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
    if (isReload) sceneActions.updateState({ sarvakaryeshuGameState: null, sarvadaGameState: null });
  }, [isReload, sceneActions]);

  const handlePhaseComplete = useCallback((word) => {
    triggerMiniGesture('blessing', 'center', 2500);
    stopIdleTimer();
    setCurrentPhase(null);

    sceneActions.updateState({
      learnedWords: { ...sceneState.learnedWords, [word]: true },
      chantedVerses: { ...sceneState.chantedVerses, [`${word}-chant`]: true },
      phase: word === 'sarvakaryeshu' ? PHASES.SARVAKARYESHU_COMPLETE : PHASES.SARVADA_COMPLETE,
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
        phase: word === 'sarvakaryeshu' ? PHASES.SARVAKARYESHU_POWER : PHASES.SARVADA_POWER,
      });
    };

    if (isAudioOn) {
      const meaningKey = word === 'sarvakaryeshu' ? 'sarva_meaning' : 'sarvada_meaning';
      window.setTimeout(() => {
        playGuidanceVoice(meaningKey, () => triggerReveal());
      }, 2000);
    } else {
      window.setTimeout(() => triggerReveal(), 1500);
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
    triggerMiniGesture('thumbsup', 'item', 1200);
    setShowTapSparkles(true);
    window.setTimeout(() => setShowTapSparkles(false), 850);
  }, [triggerMiniGesture]);

  const handleAppDiscoveryCelebrate = () => {
    setShowAppDiscovery(false);
    if (isAudioOn) playGuidanceVoice('sceneComplete');
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true },
    });
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

          <div className="sarva-scene-background" style={{ backgroundImage: `url(${riverBg})` }}>
            {!showSceneCompletion && (
              <>
                <SarvakaryeshuGame
                  isActive={sceneState.phase === PHASES.SARVAKARYESHU_GAME}
                  hideElements={!!revealConfig || showPowerOverlay}
                  onMicroWin={handleMicroWin}
                  onPhaseComplete={() => window.setTimeout(() => handlePhaseComplete('sarvakaryeshu'), 0)}
                  onGameComplete={() => {}}
                  isPaused={isRecorderOpen}
                />

                <SarvadaGame
                  isActive={sceneState.phase === PHASES.SARVADA_GAME}
                  hideElements={!!revealConfig || showPowerOverlay}
                  onMicroWin={handleMicroWin}
                  onPhaseComplete={() => window.setTimeout(() => handlePhaseComplete('sarvada'), 0)}
                  onGameComplete={() => {}}
                  isPaused={isRecorderOpen}
                />

                {showTapSparkles && (
                  <div className="sarva-tap-sparkles">
                    <SparkleAnimation type="magic" count={14} color="#FFD54F" size={9} duration={850} area="full" />
                  </div>
                )}

                {revealConfig && (
                  <SymbolAutoReveal
                    key={revealConfig.symbolId}
                    symbolId={revealConfig.symbolId}
                    symbolImage={revealConfig.symbolImage}
                    symbolName={revealConfig.symbolName}
                    affirmation={revealConfig.affirmation}
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
                        const profileId = localStorage.getItem('activeProfileId');
                        if (profileId) {
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
                            localStorage.removeItem(`temp_session_${profileId}_${zoneId}_${sceneId}`);
                            SimpleSceneManager.clearCurrentScene();
                          } catch (error) {
                            console.error('Error saving:', error);
                          }
                        }
                        setShowMandala(true);
                      }}
                    />
                  </>
                )}

                {showMandala && (
                  <InnerMandala
                    childName={profileName}
                    petalStates={{}}
                    middlePetalStates={{ 7: 'activated', 8: 'activated' }}
                    middleSymbolIcons={{ 7: symbolSarvakaryeshu, 8: symbolSarvada }}
                    innerPetalStates={{}}
                    highlightPetals={[7]}
                    message="These meanings are growing inside you"
                    onClose={() => {
                      setShowMandala(false);
                      setShowSceneCompletion(true);
                    }}
                  />
                )}
              </>
            )}

            <OpeningModal
              zoneId={zoneId}
              sceneId={sceneId}
              isOpen={!sceneState.welcomeShown}
              onStart={() => {
                playUiTap();
                stopAllVoice();
                sceneActions.updateState({
                  welcomeShown: true,
                  phase: PHASES.SARVAKARYESHU_GAME,
                  _forceUpdate: Date.now(),
                });
              }}
              characterImg={ganeshaHeadphones}
              showButton={openingButtonVisible}
            />

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
                audioEnabledRef.current = false;
                setAudioEnabled(false);
                setVoiceVolume(0);
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

            <ProgressiveHintSystem
              ref={hintSystemRef}
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

export default SarvakaryeshuChantSimplified;
