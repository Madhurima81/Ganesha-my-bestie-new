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

// Game components
import NirvighnamGame from './NirvighnamGame';
import KurumedevaGame from './KurumedevaGame';

// Assets
import ganeshaHeadphones from './assets/images/ganesha_with_headphones.webp';
import nirvighnamBg from './assets/images/nirvighnam/bg.webp';
import mooshikaCoach from './assets/images/mooshika-coach.webp';

// Symbol icons — TODO: replace with actual nirvighnam/kurumedeva symbols
import symbolVakratunda from '../../../meaning cave/assets/images/symbols/vakratunda-symbol.png';
import symbolMahakaya from '../../../meaning cave/assets/images/symbols/mahakaya-symbol.png';
import symbolSuryakoti from '../../../meaning cave/assets/images/symbols/suryakoti-symbol.png';
import symbolSamaprabha from '../../../meaning cave/assets/images/symbols/samaprabha-symbol.png';
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
const sceneOuterPetalId = SCENE_TO_OUTER_PETAL_ID['The River Needs You!'];
const sceneOuterPetalIds = [sceneOuterPetalId - 1, sceneOuterPetalId];

const PHASES = {
  INITIAL:              'initial',
  NIRVIGHNAM_GAME:      'nirvighnam_game',
  NIRVIGHNAM_COMPLETE:  'nirvighnam_complete',
  NIRVIGHNAM_POWER:     'nirvighnam_power',
  KURUMEDEVA_GAME:      'kurumedeva_game',
  KURUMEDEVA_COMPLETE:  'kurumedeva_complete',
  KURUMEDEVA_POWER:     'kurumedeva_power',
  SCENE_COMPLETE:       'complete',
  COMPLETE:             'complete'
};

const stripLeadingSpeechText = (text, leadingText) => {
  if (!text || !leadingText) return text;
  const pattern = new RegExp(`^\\s*${leadingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:.!,-]*\\s*`, 'i');
  return text.replace(pattern, '').trim();
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
        unlockedApps:    {
          vakratunda: true,
          mahakaya: true,
          suryakoti: true,
          samaprabha: true,
        },
        welcomeShown:    false,
        currentPopup:    null,
        showingCompletionScreen: false,
        stars:     0,
        completed: false,
        progress:  { percentage: 0, starsEarned: 0, completed: false },
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
  const [showWordStar,         setShowWordStar]         = useState(false);
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
  const [savedRecordings,      setSavedRecordings]      = useState({});
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
  const [showAppDiscovery,     setShowAppDiscovery]     = useState(false);
  const [isRecorderOpen,       setIsRecorderOpen]       = useState(false);

  const { isAudioOn, toggleAudio } = useAudioPreference();
  const audioEnabledRef = useRef(isAudioOn);
  audioEnabledRef.current = isAudioOn;

  const activeProfile = GameStateManager.getActiveProfile();
  const profileName   = activeProfile?.name || 'explorer';

  const isFinalCelebrationActive =
    showSparkle === 'final-fireworks' || showMandala || showSceneCompletion ||
    showAppDiscovery || sceneState.phase === PHASES.COMPLETE;
  const shouldShowOpeningModal =
    sceneState.phase === PHASES.INITIAL &&
    !sceneState.welcomeShown &&
    !showSceneCompletion &&
    !showMandala &&
    !showAppDiscovery &&
    showSparkle !== 'final-fireworks';

  const isCelebrationOrOverlayActive =
    isFinalCelebrationActive || !!revealConfig || showPowerOverlay || showCenteredWord;

  // ── Voice guidance ─────────────────────────────────────────────────────────
  const {
    stopVoice, setVoiceVolume, playSfx, setCurrentPhase, startIdleTimer, stopIdleTimer,
    playWord: playWordAudio, playSyllable, isPlaying: isVOPlaying,
  } = useVoiceGuidance(zoneId, sceneId, {
    enableMusic: false, voiceVolume: 1, sfxVolume: 0.7,
    idleTimeout: 999999, resumeDelay: RESUME_DELAY_MS,
  });

  const { playUiTap, playChime } = useGameSounds();
  const speechSynthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const nirvIntroPlayedRef = useRef(false);
  const kuruIntroPlayedRef = useRef(false);
  const hintRef = useRef(null);
  const revealTimeoutsRef = useRef([]);

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

  const playGuidanceVoice = useCallback((key, onEnded, options = {}) => {
    const map = {
      welcome:             "Let's help our river friends.",
      scene12_nir_intro:   "The turtle's way home is blocked. Clear what's in her path, one thing at a time.",
      scene12_nir_drag:    "Something's still blocking the turtle's way.",
      nirv_hint:           "Something's still blocking the turtle's way.",
      nirv_done:           'Nirvighnam! You cleared the way and helped the turtle through.',
      nirv_meaning:        'Nirvighnam means removing obstacles.',
      nirvighnamSetup:     'You cleared the path… and the turtle made it home.',
      nirvighnamClaim:     'I clear the way and move forward.',
      scene12_kuru_intro:  "Beaver can't build the bridge alone. Help him ask his friends to build it together.",
      scene12_kuru_tap:    'Who can Beaver ask for help next?',
      kuru_hint:           'Who can Beaver ask for help next?',
      kuru_done:           'Kurume Deva! You asked for help and built the beaver’s bridge.',
      kuru_meaning:        'Kuru Me Deva means please help us.',
      kurumedevaSetup:     'You called for help… and friends came.',
      kurumedevaClaim:     'Asking for help is a superpower.',
      sceneComplete:       'The turtle reached her nest. The bridge is ready. Both powers are yours now.',
    };
    if (map[key]) { speakWebSpeech(stripLeadingSpeechText(map[key], options.stripLeadingText), onEnded); return; }
    onEnded?.();
  }, [speakWebSpeech]);

  const replayCurrentVoice = useCallback(() => {
    if (!isAudioOn) return;
    if (!sceneState.welcomeShown || sceneState.phase === PHASES.INITIAL) {
      playGuidanceVoice('welcome'); return;
    }
    if (sceneState.phase === PHASES.NIRVIGHNAM_GAME)  { playGuidanceVoice('scene12_nir_drag');  return; }
    if (sceneState.phase === PHASES.KURUMEDEVA_GAME)  { playGuidanceVoice('scene12_kuru_tap');  return; }
    if (showSceneCompletion) playGuidanceVoice('sceneComplete');
  }, [isAudioOn, playGuidanceVoice, sceneState.phase, sceneState.welcomeShown, showSceneCompletion]);

  const stopAllVoice = useCallback(() => { stopVoice(); stopWebSpeech(); }, [stopVoice, stopWebSpeech]);

  useEffect(() => {
    if (!sceneState?.phase) {
      sceneActions.updateState({ phase: PHASES.INITIAL });
    }
  }, [sceneActions, sceneState?.phase]);

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

  useEffect(() => () => {
    revealTimeoutsRef.current.forEach((cancel) => cancel?.());
    revealTimeoutsRef.current = [];
    clearAllTimeouts();
  }, [clearAllTimeouts]);
  useEffect(() => () => stopWebSpeech(), [stopWebSpeech]);

  // ── SymbolAutoReveal VO ────────────────────────────────────────────────────
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
  const persistCompletion = useCallback(() => {
    const profileId = localStorage.getItem('activeProfileId');
    if (!profileId) return;

    try {
      GameStateManager.saveGameState(zoneId, sceneId, {
        completed: true, stars: 5, phase: PHASES.COMPLETE,
        words: sceneState.learnedWords || {},
        syllables: sceneState.learnedSyllables || {},
        apps: sceneState.unlockedApps || {},
        chantedVerses: sceneState.chantedVerses || {},
        timestamp: Date.now()
      });
      ProgressManager.updateSceneCompletion(profileId, zoneId, sceneId, {
        completed: true,
        stars: 5,
      });
      localStorage.removeItem(`temp_session_${profileId}_${zoneId}_${sceneId}`);
      SimpleSceneManager.clearCurrentScene();
    } catch (e) {
      console.error('Error saving game state:', e);
    }
  }, [sceneId, sceneState.chantedVerses, sceneState.learnedSyllables, sceneState.learnedWords, sceneState.unlockedApps, zoneId]);

  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);
    const appsNow = sceneState.unlockedApps;

    if (symbolId === 'nirvighnam') {
      const timer = safeSetTimeout(() => {
        sceneActions.updateState({
          unlockedApps: { ...appsNow, nirvighnam: true },
          phase: PHASES.KURUMEDEVA_GAME,
        });
      }, 950);
      revealTimeoutsRef.current.push(timer);
    } else if (symbolId === 'kurumedeva') {
      const unlockTimer = safeSetTimeout(() => {
        sceneActions.updateState({ unlockedApps: { ...appsNow, kurumedeva: true } });
      }, 950);
      const celebrateTimer = safeSetTimeout(() => handleAppDiscoveryCelebrate(), 1500);
      revealTimeoutsRef.current.push(unlockTimer, celebrateTimer);
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
      setCurrentPhase('nirvighnamGame');
      if (isAudioOn && !nirvIntroPlayedRef.current) {
        nirvIntroPlayedRef.current = true;
        playGuidanceVoice('scene12_nir_intro', () => {
          safeSetTimeout(() => startIdleTimer(), 3500);
        });
        return;
      }
      startIdleTimer();
      return;
    }
    if (sceneState.phase !== PHASES.NIRVIGHNAM_GAME) {
      nirvIntroPlayedRef.current = false;
    }
  }, [isAudioOn, playGuidanceVoice, sceneState.phase, sceneState.welcomeShown, setCurrentPhase, startIdleTimer, safeSetTimeout]);

  useEffect(() => {
    if (sceneState.phase === PHASES.KURUMEDEVA_GAME) {
      setCurrentPhase('kurumedevaGame');
      if (isAudioOn && !kuruIntroPlayedRef.current) {
        kuruIntroPlayedRef.current = true;
        playGuidanceVoice('scene12_kuru_intro', () => {
          safeSetTimeout(() => startIdleTimer(), 3500);
        });
        return;
      }
      startIdleTimer();
      return;
    }
    if (sceneState.phase !== PHASES.KURUMEDEVA_GAME) {
      kuruIntroPlayedRef.current = false;
    }
  }, [isAudioOn, playGuidanceVoice, sceneState.phase, setCurrentPhase, startIdleTimer, safeSetTimeout]);

  // ── Reload: clear mini-game states ────────────────────────────────────────
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

    if ([PHASES.NIRVIGHNAM_COMPLETE, PHASES.NIRVIGHNAM_POWER].includes(sceneState.phase)) {
      restoreReveal('nirvighnam');
      return;
    }

    if ([PHASES.KURUMEDEVA_COMPLETE, PHASES.KURUMEDEVA_POWER].includes(sceneState.phase)) {
      restoreReveal('kurumedeva');
    }
  }, [sceneState?.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Phase complete handler ─────────────────────────────────────────────────
  const handlePhaseComplete = useCallback((word) => {
    triggerMiniGesture('blessing', 'center', 2500);
    setShowWordStar(true);
    window.setTimeout(() => setShowWordStar(false), 1500);
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

    const revealDelay = isAudioOn ? 400 : 1500;
    const revealTimer = safeSetTimeout(() => triggerReveal(), revealDelay);
    revealTimeoutsRef.current.push(revealTimer);
  }, [sceneState, sceneActions, zoneId, sceneId, isAudioOn, playChime, playGuidanceVoice,
      stopIdleTimer, setCurrentPhase, triggerMiniGesture, safeSetTimeout]);

  const handleMicroWin = useCallback(() => {
    setSparklePos(lastPointRef.current);
    setShowTapSparkles(true);
    window.setTimeout(() => setShowTapSparkles(false), 1600);
  }, []);

  const handleAppDiscoveryCelebrate = () => {
    setShowAppDiscovery(false);
    if (isAudioOn) playGuidanceVoice('sceneComplete');
    sceneActions.updateState({
      phase: PHASES.COMPLETE, stars: 5, completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true },
    });
    persistCompletion();
    setShowSparkle('final-fireworks');
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

          <div className="nirv-scene-background" ref={fxBgRef} onPointerDownCapture={recordPoint} style={{ backgroundImage: `url(${nirvighnamBg})` }}>
            {!showSceneCompletion && (
            <>
              {/* ── NIRVIGHNAM GAME — drag obstacles ── */}
              <NirvighnamGame
                isActive={sceneState.phase === PHASES.NIRVIGHNAM_GAME}
                hideElements={showCenteredWord || showPowerOverlay || !!revealConfig}
                onMicroWin={handleMicroWin}
                onPhaseComplete={() => window.setTimeout(() => handlePhaseComplete('nirvighnam'), 0)}
                onGameComplete={() => {}}
                voiceGuidance={{
                  playVoice: playGuidanceVoice,
                  playWord: playWordAudio,
                  playSyllable: (syllable, onEnded) => {
                    stopAllVoice();
                    playSyllable('nirvighnam', syllable, onEnded);
                  },
                  stopVoice: stopAllVoice,
                }}
                isPaused={isRecorderOpen}
              />

              {/* ── KURUMEDEVA GAME — tap friends ── */}
              <KurumedevaGame
                isActive={sceneState.phase === PHASES.KURUMEDEVA_GAME}
                hideElements={showCenteredWord || showPowerOverlay || !!revealConfig}
                onMicroWin={handleMicroWin}
                onPhaseComplete={() => window.setTimeout(() => handlePhaseComplete('kurumedeva'), 0)}
                onGameComplete={() => {}}
                voiceGuidance={{
                  playVoice: playGuidanceVoice,
                  playWord: playWordAudio,
                  playSyllable: (syllable, onEnded) => {
                    stopAllVoice();
                    playSyllable('kurumedeva', syllable, onEnded);
                  },
                  stopVoice: stopAllVoice,
                }}
                isPaused={isRecorderOpen}
              />

              {showWordStar && (
                <div className="nirv-word-star">
                  <SparkleAnimation type="star" count={20} color="#FFD54F" size={14} duration={1500} area="full" />
                </div>
              )}
              {showTapSparkles && (
                <div className="nirv-tap-sparkles" style={sparklePos ? { left: `${sparklePos.x}%`, top: `${sparklePos.y}%`, width: '32%', height: '32%', right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)' } : undefined}>
                  <SparkleAnimation type="dust" count={22} color="#FFD54F" size={5} duration={1600} area="full" />
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
                  revealVoice={{
                    isEnabled: isAudioOn,
                    wordId: revealConfig.symbolId,
                    meaningKey: revealConfig.symbolId === 'nirvighnam'
                      ? 'nirv_meaning'
                      : revealConfig.symbolId === 'kurumedeva'
                        ? 'kuru_meaning'
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

              {/* ── SIDEBAR ── */}
              {!showAppDiscovery &&
                !isFinalCelebrationActive &&
                !(sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) && (
                  <AppSidebar
                    unlockedApps={sceneState.unlockedApps || {}}
                    savedRecordings={savedRecordings}
                    onSaveRecording={handleSaveRecording}
                    onDeleteRecording={handleDeleteRecording}
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
                      setShowMandala(true);
                    }}
                  />
                </>
              )}

              {showMandala && (
                <InnerMandala
                  childName={profileName}
                  shlokaPetalStates={{ 1: 'activated', 2: 'activated', 3: 'activated', 4: 'activated' }}
                  justEarnedPetals={sceneOuterPetalIds.map((id) => ({ ring: 'outer', id }))}
                  earnedSymbols={[
                    { id: 'nirvighnam', petalId: 5, ring: 'outer', image: symbolNirvighnam },
                    { id: 'kurumedeva', petalId: 6, ring: 'outer', image: symbolKurumedeva },
                  ]}
                  highlightPetals={sceneOuterPetalIds}
                  message="These meanings are growing inside you"
                  autoCloseMs={3000 + (2 * 950) + 2600}
                  onClose={() => { setShowMandala(false); setShowSceneCompletion(true); }}
                />
              )}
            </>
            )}

            {/* ── OPENING MODAL ── */}
            {shouldShowOpeningModal && (
              <OpeningModal
                zoneId={zoneId}
                sceneId={sceneId}
                isOpen
                onStart={() => {
                  playUiTap();
                  stopAllVoice();
                  sceneActions.updateState({ welcomeShown: true, phase: PHASES.NIRVIGHNAM_GAME });
                }}
                characterImg={ganeshaHeadphones}
                showButton={openingButtonVisible}
              />
            )}

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

            {/* ProgressiveHintSystem disabled per request */}
          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default NirvighnamChantSimplified;
