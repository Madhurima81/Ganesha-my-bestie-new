// zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx
// Cloned from VakratundaGroveSimplified — words: Nirvighnam + Kurumedeva

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameSounds } from '../../../../lib/hooks/useGameSounds';
import './NirvighnamChantSimplified.css';

import SceneManager from "../../../../lib/components/scenes/SceneManager";
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
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

// Game components
import NirvighnamGame from './NirvighnamGame';
import KurumedevaGame from './KurumedevaGame';

// Assets
import ganeshaHeadphones from './assets/images/ganesha_with_headphones.webp';
import nirvighnamBg from './assets/images/Nirvighnam/bg.png';
import mooshikaCoach from './assets/images/mooshika-coach.webp';

// Symbol icons — TODO: replace with actual nirvighnam/kurumedeva symbols
import symbolNirvighnam from '../../../meaning cave/assets/images/symbols/nirvighnam-symbol.png';
import symbolKurumedeva from '../../../meaning cave/assets/images/symbols/kurumedeva-symbol.png';

// ── Local UI ─────────────────────────────────────────────────────────────────
const VOGatedButton = ({ visible, onClick, children, className = '', style = {} }) => {
  if (!visible) return null;
  return (
    <button onClick={onClick} className={className} style={{
      ...style,
      animation: 'buttonFadeIn 0.35s ease-out',
      opacity: 1,
      transform: 'translateY(0)'
    }}>
      {children}
      <style>{`
        @keyframes buttonFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </button>
  );
};

const RESUME_DELAY_MS = 3000;

const PHASES = {
  INITIAL:              'initial',
  NIRVIGHNAM_GAME:      'nirvighnam_game',
  NIRVIGHNAM_COMPLETE:  'nirvighnam_complete',
  NIRVIGHNAM_POWER:     'nirvighnam_power',
  KURUMEDEVA_GAME:      'kurumedeva_game',
  KURUMEDEVA_COMPLETE:  'kurumedeva_complete',
  KURUMEDEVA_POWER:     'kurumedeva_power',
  COMPLETE:             'complete'
};

const powerConfig = {
  nirvighnam: {
    name: 'Clear Path Power',
    image: symbolNirvighnam,
    color: '#6DBF67',
    affirmation: 'I clear the way and move forward.',
    story: 'When something blocks you, you can find a way through.'
  },
  kurumedeva: {
    name: 'Ask for Help',
    image: symbolKurumedeva,
    color: '#7B9ED9',
    affirmation: 'I ask for help and friends show up.',
    story: 'Asking for help is a superpower.'
  }
};

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div className="error-boundary">
        <h2>Something went wrong.</h2>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
    return this.props.children;
  }
}

// ── Root component ────────────────────────────────────────────────────────────
const NirvighnamChantSimplified = ({
  onComplete,
  onNavigate,
  zoneId  = 'shloka-river',
  sceneId = 'nirvighnam-chant'
}) => (
  <ErrorBoundary>
    <SceneManager
      zoneId={zoneId}
      sceneId={sceneId}
      initialState={{
        phase: PHASES.INITIAL,
        learnedWords:    { nirvighnam: false, kurumedeva: false },
        chantedVerses:   {},
        learnedSyllables:{},
        unlockedApps:    {},
        welcomeShown:    false,
        currentPopup:    null,
        showingCompletionScreen: false,
        stars:     0,
        completed: false,
        progress:  { percentage: 0, starsEarned: 0, completed: false },
        nirvighnamGameState:  null,
        kurumedevaGameState:  null,
      }}
    >
      {({ sceneState, sceneActions, isReload }) => (
        <NirvighnamChantContent
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

// ── Content component ─────────────────────────────────────────────────────────
const NirvighnamChantContent = ({
  sceneState, sceneActions, isReload, onComplete, onNavigate, zoneId, sceneId
}) => {
  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.INITIAL });

  const { resetScene } = useSceneReset(sceneActions, zoneId, sceneId, getSceneResetConfig(sceneId));
  const completionModalContent = getCompletionModal(zoneId, sceneId);
  const { miniGesture, triggerMiniGesture } = useMiniGesture();

  const [showSparkle,          setShowSparkle]          = useState(null);
  const [showSceneCompletion,  setShowSceneCompletion]  = useState(false);
  const [showMandala,          setShowMandala]          = useState(false);
  const [showCenteredWord,     setShowCenteredWord]     = useState(null);
  const [showPowerOverlay,     setShowPowerOverlay]     = useState(false);
  const [revealConfig,         setRevealConfig]         = useState(null);
  const [currentWord,          setCurrentWord]          = useState(null);
  const [showTapSparkles,      setShowTapSparkles]      = useState(false);
  const [openingButtonVisible, setOpeningButtonVisible] = useState(false);
  const [savedRecordings,      setSavedRecordings]      = useState({});
  const [showAppDiscovery,     setShowAppDiscovery]     = useState(false);
  const [isRecorderOpen,       setIsRecorderOpen]       = useState(false);

  const { isAudioOn, toggleAudio, setAudioEnabled } = useAudioPreference();
  const audioEnabledRef = useRef(isAudioOn);
  audioEnabledRef.current = isAudioOn;

  const activeProfile = GameStateManager.getActiveProfile();
  const profileName   = activeProfile?.name || 'explorer';

  const isFinalCelebrationActive =
    showSparkle === 'final-fireworks' || showMandala || showSceneCompletion ||
    showAppDiscovery || sceneState.phase === PHASES.COMPLETE;

  const isCelebrationOrOverlayActive =
    isFinalCelebrationActive || !!revealConfig || showPowerOverlay || showCenteredWord;

  // ── Voice guidance ─────────────────────────────────────────────────────────
  const {
    stopVoice, setVoiceVolume, playSfx, setCurrentPhase, startIdleTimer, stopIdleTimer,
    playWord: playWordAudio, isPlaying: isVOPlaying,
  } = useVoiceGuidance(zoneId, sceneId, {
    enableMusic: false, voiceVolume: 1, sfxVolume: 0.7,
    idleTimeout: 999999, resumeDelay: RESUME_DELAY_MS,
  });

  const { playUiTap, playChime } = useGameSounds();
  const speechSynthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  const stopWebSpeech = useCallback(() => {
    try { speechSynthRef.current?.cancel(); } catch {}
  }, []);

  const speakWebSpeech = useCallback((text, onEnded) => {
    if (!audioEnabledRef.current || !text) { onEnded?.(); return; }
    const synth = speechSynthRef.current;
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') { onEnded?.(); return; }
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-IN'; u.rate = 0.95; u.pitch = 1; u.volume = 0.95;
      u.onend = () => onEnded?.();
      u.onerror = () => onEnded?.();
      synth.speak(u);
    } catch { onEnded?.(); }
  }, []);

  const playGuidanceVoice = useCallback((key, onEnded) => {
    const map = {
      welcome:             "Let's clear the path and call for help by the river.",
      nirv_hint:           'Drag the obstacles away so the turtle can reach her nest.',
      nirv_done:           'The path is clear!',
      nirv_meaning:        'Nirvighnam means obstacle-free — nothing blocks the way.',
      nirvighnamSetup:     'You cleared the path… and the turtle made it home.',
      nirvighnamClaim:     'I clear the way and move forward.',
      kuru_hint:           'Tap each friend to help build the bridge.',
      kuru_done:           'The bridge is ready! Everyone helped!',
      kuru_meaning:        'Kurumedeva means — please do it, O Lord. You asked, and help came.',
      kurumedevaSetup:     'You called for help… and friends came.',
      kurumedevaClaim:     'Asking for help is a superpower.',
      sceneComplete:       'You cleared the path. You called for help. Both powers — yours now.',
    };
    if (map[key]) { speakWebSpeech(map[key], onEnded); return; }
    onEnded?.();
  }, [speakWebSpeech]);

  const replayCurrentVoice = useCallback(() => {
    if (!isAudioOn) return;
    if (!sceneState.welcomeShown || sceneState.phase === PHASES.INITIAL) {
      playGuidanceVoice('welcome'); return;
    }
    if (sceneState.phase === PHASES.NIRVIGHNAM_GAME)  { playGuidanceVoice('nirv_hint');  return; }
    if (sceneState.phase === PHASES.KURUMEDEVA_GAME)  { playGuidanceVoice('kuru_hint');  return; }
    if (showSceneCompletion) playGuidanceVoice('sceneComplete');
  }, [isAudioOn, playGuidanceVoice, sceneState.phase, sceneState.welcomeShown, showSceneCompletion]);

  const stopAllVoice = useCallback(() => { stopVoice(); stopWebSpeech(); }, [stopVoice, stopWebSpeech]);

  // ── Pause/resume ───────────────────────────────────────────────────────────
  const pauseCelebRef = useRef(null);
  const onPauseHide = useCallback(() => pauseCelebRef.current?.(), []);
  const onPauseShow = useCallback(() => {
    if ([PHASES.NIRVIGHNAM_GAME, PHASES.KURUMEDEVA_GAME].includes(sceneState.phase)) startIdleTimer();
  }, [sceneState.phase, startIdleTimer]);

  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: onPauseHide, onShow: onPauseShow, resumeDelay: RESUME_DELAY_MS,
  });
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  useEffect(() => () => clearAllTimeouts(), []);
  useEffect(() => () => stopWebSpeech(), [stopWebSpeech]);

  // ── SymbolAutoReveal VO ────────────────────────────────────────────────────
  useEffect(() => {
    if (!revealConfig || !isAudioOn) return;
    const setupMap = { nirvighnam: 'nirvighnamSetup', kurumedeva: 'kurumedevaSetup' };
    const claimMap = { nirvighnam: 'nirvighnamClaim', kurumedeva: 'kurumedevaClaim' };
    const setup = setupMap[revealConfig.symbolId];
    const claim = claimMap[revealConfig.symbolId];
    if (!setup) return;
    const id = setTimeout(() => {
      playGuidanceVoice(setup, () => playGuidanceVoice(claim));
    }, 400);
    return () => clearTimeout(id);
  }, [revealConfig, isAudioOn, playGuidanceVoice]);

  const getSidebarTarget = (symbolId) => {
    const el = document.getElementById(`sidebar-${symbolId}`);
    if (!el) return { x: 220, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2) - (window.innerWidth / 2),
      y: (r.top + r.height / 2) - (window.innerHeight / 2)
    };
  };

  // ── Reveal complete → advance phase ───────────────────────────────────────
  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);
    const appsNow = sceneState.unlockedApps;

    if (symbolId === 'nirvighnam') {
      window.setTimeout(() => {
        sceneActions.updateState({
          unlockedApps: { ...appsNow, nirvighnam: true },
          phase: PHASES.KURUMEDEVA_GAME,
          kurumedevaGameState: null,
        });
      }, 950);
    } else if (symbolId === 'kurumedeva') {
      window.setTimeout(() => {
        sceneActions.updateState({ unlockedApps: { ...appsNow, kurumedeva: true } });
      }, 950);
      window.setTimeout(() => handleAppDiscoveryCelebrate(), 1500);
    }
  };

  const handleHomeToMainMap = () => {
    stopAllVoice(); stopIdleTimer();
    const activeProfileId = localStorage.getItem('activeProfileId');
    if (activeProfileId) localStorage.removeItem(`temp_session_${activeProfileId}_${zoneId}_${sceneId}`);
    SimpleSceneManager.clearCurrentScene();
    onNavigate?.('direct-to-map');
  };

  // ── Welcome VO ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) {
      setOpeningButtonVisible(true);
      if (!audioEnabledRef.current) return;
      const t = setTimeout(() => playGuidanceVoice('welcome', () => playSfx('chime')), 800);
      return () => clearTimeout(t);
    }
  }, [sceneState.phase, sceneState.welcomeShown, isAudioOn, playGuidanceVoice]);

  const handleAudioToggle = () => {
    const nextOn = !isAudioOn;
    setVoiceVolume(nextOn ? 1 : 0);
    if (!nextOn && sceneState.phase === PHASES.INITIAL) stopAllVoice();
    toggleAudio();
  };

  // ── Idle timer per game phase ──────────────────────────────────────────────
  useEffect(() => {
    if (sceneState.phase === PHASES.NIRVIGHNAM_GAME && sceneState.welcomeShown) {
      setCurrentPhase('nirvighnamGame'); startIdleTimer();
    }
  }, [sceneState.phase, sceneState.welcomeShown, setCurrentPhase]);

  useEffect(() => {
    if (sceneState.phase === PHASES.KURUMEDEVA_GAME) {
      setCurrentPhase('kurumedevaGame'); startIdleTimer();
    }
  }, [sceneState.phase, setCurrentPhase]);

  // ── Reload: clear mini-game states ────────────────────────────────────────
  useEffect(() => {
    if (isReload) sceneActions.updateState({ nirvighnamGameState: null, kurumedevaGameState: null });
  }, []);

  // ── Phase complete handler ─────────────────────────────────────────────────
  const handlePhaseComplete = useCallback((word) => {
    triggerMiniGesture('blessing', 'center', 2500);
    stopIdleTimer();
    setCurrentPhase(null);

    sceneActions.updateState({
      learnedWords:  { ...sceneState.learnedWords, [word]: true },
      chantedVerses: { ...sceneState.chantedVerses, [`${word}-chant`]: true },
      phase: word === 'nirvighnam' ? PHASES.NIRVIGHNAM_COMPLETE : PHASES.KURUMEDEVA_COMPLETE,
    });

    setShowSparkle(`${word}-celebration`);

    let revealTriggered = false;
    const triggerReveal = () => {
      if (revealTriggered) return;
      revealTriggered = true;
      setShowSparkle(null);
      const discoveryData = getDiscoveryContent(zoneId, sceneId, word);
      playChime();
      setRevealConfig({
        symbolId:      word,
        symbolImage:   powerConfig[word].image,
        symbolName:    discoveryData?.title || powerConfig[word].name,
        affirmation:   discoveryData?.affirmation || powerConfig[word].affirmation,
        sidebarTarget: getSidebarTarget(word),
      });
      sceneActions.updateState({
        phase: word === 'nirvighnam' ? PHASES.NIRVIGHNAM_POWER : PHASES.KURUMEDEVA_POWER,
      });
    };

    if (isAudioOn) {
      const meaningKey = word === 'nirvighnam' ? 'nirv_meaning' : 'kuru_meaning';
      window.setTimeout(() => {
        playGuidanceVoice(meaningKey, () => triggerReveal());
      }, 2000);
      window.setTimeout(() => triggerReveal(), 7000);
    } else {
      window.setTimeout(() => triggerReveal(), 1500);
    }
  }, [sceneState, sceneActions, zoneId, sceneId, isAudioOn, playChime, playGuidanceVoice,
      stopIdleTimer, setCurrentPhase, triggerMiniGesture]);

  const handleMicroWin = useCallback(() => {
    triggerMiniGesture('thumbsup', 'item', 1200);
    setShowTapSparkles(true);
    window.setTimeout(() => setShowTapSparkles(false), 850);
  }, [triggerMiniGesture]);

  const handleAppDiscoveryCelebrate = () => {
    setShowAppDiscovery(false);
    if (isAudioOn) playGuidanceVoice('sceneComplete');
    sceneActions.updateState({
      phase: PHASES.COMPLETE, stars: 5, completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true },
    });
    setShowSparkle('final-fireworks');
  };

  const handleSaveComponentState = (type, state) => {
    sceneActions.updateState({
      ...(type === 'nirvighnamGame'  && { nirvighnamGameState: state }),
      ...(type === 'kurumedevaGame'  && { kurumedevaGameState: state }),
    });
  };

  if (!sceneState) return <div className="loading">Loading...</div>;

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="nirv-scene-container">
          <HomeButton onNavigate={onNavigate} />
          <ZoneBadgeButton zoneId="shloka-river" onBack={() => onNavigate?.('zone-welcome')} />
          <AudioToggle isAudioOn={isAudioOn} onToggle={handleAudioToggle} />
          <VOReplayButton onReplay={replayCurrentVoice} disabled={!isAudioOn} />
          <ResumeCountdown value={countdownValue} />

          <div className="nirv-scene-background" style={{ backgroundImage: `url(${nirvighnamBg})` }}>
            {!showSceneCompletion && (
            <>
              {/* ── NIRVIGHNAM GAME — drag obstacles ── */}
              <NirvighnamGame
                isActive={sceneState.phase === PHASES.NIRVIGHNAM_GAME}
                hideElements={showCenteredWord || showPowerOverlay || !!revealConfig}
                onMicroWin={handleMicroWin}
                onPhaseComplete={() => window.setTimeout(() => handlePhaseComplete('nirvighnam'), 0)}
                onGameComplete={() => {}}
                isPaused={isRecorderOpen}
              />

              {/* ── KURUMEDEVA GAME — tap friends ── */}
              <KurumedevaGame
                isActive={sceneState.phase === PHASES.KURUMEDEVA_GAME}
                hideElements={showCenteredWord || showPowerOverlay || !!revealConfig}
                onMicroWin={handleMicroWin}
                onPhaseComplete={() => window.setTimeout(() => handlePhaseComplete('kurumedeva'), 0)}
                onGameComplete={() => {}}
                isPaused={isRecorderOpen}
              />

              {showTapSparkles && (
                <div className="nirv-tap-sparkles">
                  <SparkleAnimation type="magic" count={14} color="#FFD54F" size={9} duration={850} area="full" />
                </div>
              )}

              {/* ── SYMBOL AUTO REVEAL ── */}
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

              {/* ── SIDEBAR ── */}
              {!showAppDiscovery &&
                !isFinalCelebrationActive &&
                !(sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) && (
                  <AppSidebar
                    unlockedApps={sceneState.unlockedApps || {}}
                    savedRecordings={savedRecordings}
                    isReload={isReload}
                    onPopupOpen={() => { stopAllVoice(); stopIdleTimer(); setIsRecorderOpen(true); }}
                    onPopupClose={() => {
                      setIsRecorderOpen(false);
                      const activeGamePhases = [PHASES.NIRVIGHNAM_GAME, PHASES.KURUMEDEVA_GAME];
                      if (activeGamePhases.includes(sceneState.phase) && !showPowerOverlay && !revealConfig && !showCenteredWord) {
                        startIdleTimer();
                      }
                    }}
                  />
                )}

              {miniGesture.show && (
                <GaneshaGestureCue key={miniGesture.key} gestureType={miniGesture.type} position={miniGesture.position} size={120} />
              )}

              {showSparkle === 'final-fireworks' && (
                <>
                  <FireworksCompletion show={showSparkle === 'final-fireworks'} showCard={false} />
                  <CalmGoldenFireworks
                    show={showSparkle === 'final-fireworks'}
                    particles={14}
                    duration={3500}
                    onComplete={() => {
                      setShowSparkle(null);
                      const profileId = localStorage.getItem('activeProfileId');
                      if (profileId) {
                        try {
                          GameStateManager.saveGameState(zoneId, sceneId, {
                            completed: true, stars: 5, phase: PHASES.COMPLETE,
                            words: sceneState.learnedWords || {},
                            syllables: sceneState.learnedSyllables || {},
                            apps: sceneState.unlockedApps || {},
                            chantedVerses: sceneState.chantedVerses || {},
                            timestamp: Date.now()
                          });
                          localStorage.removeItem(`temp_session_${profileId}_${zoneId}_${sceneId}`);
                          SimpleSceneManager.clearCurrentScene();
                        } catch (e) { console.error('Error saving game state:', e); }
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
                  middlePetalStates={{ 5: 'activated', 6: 'activated' }}
                  middleSymbolIcons={{ 5: symbolNirvighnam, 6: symbolKurumedeva }}
                  innerPetalStates={{}}
                  highlightPetals={[5]}
                  message="These meanings are growing inside you"
                  onClose={() => { setShowMandala(false); setShowSceneCompletion(true); }}
                />
              )}
            </>
            )}

            {/* ── OPENING MODAL ── */}
            <OpeningModal
              zoneId={zoneId}
              sceneId={sceneId}
              isOpen={!sceneState.welcomeShown}
              onStart={() => {
                playUiTap();
                stopAllVoice();
                sceneActions.updateState({ welcomeShown: true, phase: PHASES.NIRVIGHNAM_GAME });
              }}
              characterImg={ganeshaHeadphones}
              showButton={openingButtonVisible}
            />

            <SceneCompletionCelebration
              show={showSceneCompletion && !showMandala}
              zoneId={zoneId}
              sceneName="Nirvighnam Chant"
              completionTitle={completionModalContent?.title}
              completionSubtitle={completionModalContent?.subtitle}
              sceneNumber={3}
              totalScenes={5}
              starsEarned={5}
              totalStars={5}
              discoveredSymbols={['nirvighnam', 'kurumedeva']}
              containerType="backpack"
              symbolImages={{ nirvighnam: symbolNirvighnam, kurumedeva: symbolKurumedeva }}
              symbolData={{
                nirvighnam:  { title: 'Nirvighnam - Obstacle Free',   description: 'Nothing blocks the way. Chant: NIR-VIGH-NAM' },
                kurumedeva:  { title: 'Kurumedeva - Please Help Me',  description: 'Ask and help arrives. Chant: KU-RU-ME-DE-VA' },
              }}
              savedRecordings={savedRecordings}
              nextSceneName="Next Scene"
              sceneId="nirvighnam-chant"
              completionData={{ stars: 5, syllables: sceneState.learnedSyllables, words: sceneState.learnedWords, completed: true }}
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
                setShowPowerOverlay(false);
                setOpeningButtonVisible(true);
                resetScene();
              }}
              onContinue={() => onNavigate?.('scene-complete-continue')}
            />

            <ProgressiveHintSystem
              ref={useRef(null)}
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

export default NirvighnamChantSimplified;
