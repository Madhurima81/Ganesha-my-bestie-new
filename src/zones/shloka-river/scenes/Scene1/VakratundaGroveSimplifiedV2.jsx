// zones/shloka-river/scenes/Scene1/VakratundaGroveSimplifiedV2.jsx
// Original V2 structure preserved exactly.
// Only change: VakratundaGame + MahakayaGame replaced with new chanting mechanic (SVC inline).

import React, { useState, useEffect, useRef } from 'react';
import './VakratundaGroveSimplified.css';

// Scene management
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';
import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';

// UI Components
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import ProgressiveHintSystem from '../../../../lib/components/interactive/ProgressiveHintSystem';
import PowerUnlockOverlay from '../../../../lib/components/overlay/PowerUnlockOverlay';
import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../../lib/components/ui/AudioToggle/AudioToggle';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';

import AppSidebar from '../../shared/AppSidebar';
import OpeningModal from '../../../shared/components/OpeningModal';
import SanskritVoiceRecorder from '../../../../lib/components/audio/SanskritVoiceRecorder';

// Zone Theme
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal, getCompletionModal, getDiscoveryContent } from '../../../../lib/config/content';

// NEW: SVC for inline voice challenge
import SyllableVoiceChallenge from '../../core/SyllableVoiceChallenge';

// NEW: Water spray animation
import WaterSprayArc from './components/WaterSprayArc';

// Character images
import ganeshaHeadphones from './assets/images/ganesha_with_headphones.png';
import mooshikaCoach from "./assets/images/mooshika-coach.png";

// Background — updated to new SVG
import riverBackground from './assets/images/vakratundachant-bg-new2.svg';

// Symbol images (used in powerConfig + SceneCompletionCelebration)
import symbolVakratunda from '../../../meaning cave/assets/images/symbols/vakratunda-symbol.png';
import symbolMahakaya from '../../../meaning cave/assets/images/symbols/mahakaya-symbol.png';

// NEW: Chanting game assets
import elephantImg  from './assets/images/elephant.svg';
import lotusBud     from './assets/images/lotus-bud.svg';
import lotusHalf    from './assets/images/lotus-half-bloom.svg';
import lotusFull    from './assets/images/lotus-full-bloom.svg';
import banyanSprout from './assets/images/banyan-sprout.svg';
import banyanSapling from './assets/images/banyan-sapling.svg';
import banyanHalf   from './assets/images/banyan-half.svg';
import banyanFull   from './assets/images/banyan-full.svg';

// ── Chanting game config ───────────────────────────────────────────────────
const PARTS = {
  vakratunda: [
    { syllable: 'vakra',      label: 'VAKRA',      audio: '/audio/syllables/vakratunda - vakra.mp3', activeElephant: 1 },
    { syllable: 'tunda',      label: 'TUNDA',      audio: '/audio/syllables/vakratunda-tun.mp3',    activeElephant: 2 },
    { syllable: 'vakratunda', label: 'VAKRATUNDA', audio: '/audio/words/vakratunda.mp3',             activeElephant: 'both' },
  ],
  mahakaya: [
    { syllable: 'maha',     label: 'MAHA',     audio: '/audio/syllables/maha-mahakaya.mp3',      activeElephant: 1 },
    { syllable: 'kaya',     label: 'KAYA',     audio: '/audio/syllables/kaya-mahakaya.mp3',      activeElephant: 2 },
    { syllable: 'mahakaya', label: 'MAHAKAYA', audio: '/audio/words/mahakaya.mp3',               activeElephant: 'both' },
  ],
};
const LOTUS_IMAGES  = [lotusBud, lotusHalf, lotusFull, lotusFull];
const BANYAN_IMAGES = [banyanSprout, banyanSapling, banyanHalf, banyanFull];

// ── Unchanged constants ────────────────────────────────────────────────────
const VOGatedButton = ({ visible, onClick, children, className = '', style = {} }) => {
  if (!visible) return null;
  return (
    <button onClick={onClick} className={className} style={{ ...style, animation: 'buttonFadeIn 0.35s ease-out', opacity: 1, transform: 'translateY(0)' }}>
      {children}
      <style>{`@keyframes buttonFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </button>
  );
};

const PHASES = {
  INITIAL: 'initial',
  VAKRATUNDA_GAME: 'vakratunda_game',
  VAKRATUNDA_COMPLETE: 'vakratunda_complete',
  VAKRATUNDA_POWER: 'vakratunda_power',
  MAHAKAYA_GAME: 'mahakaya_game',
  MAHAKAYA_COMPLETE: 'mahakaya_complete',
  MAHAKAYA_POWER: 'mahakaya_power',
  COMPLETE: 'complete'
};

const powerConfig = {
  vakratunda: { name: 'Flexibility Power', image: symbolVakratunda, color: '#4ECDC4', affirmation: 'My trunk bends to find a new way.', story: 'When you feel stuck, try a new way.' },
  mahakaya:   { name: 'Inner Strength',    image: symbolMahakaya,   color: '#FF6B35', affirmation: 'I am big and strong — and you have strength inside too.', story: 'Stand tall. Be brave.' }
};

// ── ErrorBoundary (unchanged) ──────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
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

// ── Outer shell (unchanged) ────────────────────────────────────────────────
const VakratundaGroveSimplified = ({ onComplete, onNavigate, zoneId = 'shloka-river', sceneId = 'vakratunda-grove' }) => (
  <ErrorBoundary>
    <SceneManager
      zoneId={zoneId}
      sceneId={sceneId}
      initialState={{
        phase: PHASES.INITIAL,
        learnedWords: { vakratunda: false, mahakaya: false },
        chantedVerses: {},
        learnedSyllables: {},
        unlockedApps: {},
        welcomeShown: false,
        currentPopup: null,
        showingCompletionScreen: false,
        stars: 0,
        completed: false,
        progress: { percentage: 0, starsEarned: 0, completed: false },
      }}
    >
      {({ sceneState, sceneActions, isReload }) => (
        <VakratundaGroveContent
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

// ── Content component ──────────────────────────────────────────────────────
const VakratundaGroveContent = ({ sceneState, sceneActions, isReload, onComplete, onNavigate, zoneId, sceneId }) => {
  if (!sceneState?.phase) sceneActions.updateState({ phase: PHASES.INITIAL });

  const { resetScene } = useSceneReset(sceneActions, zoneId, sceneId, getSceneResetConfig(sceneId));
  const completionModalContent = getCompletionModal(zoneId, sceneId);

  // ── State (unchanged from original) ──────────────────────────────────────
  const [showSparkle, setShowSparkle]                   = useState(null);
  const [showSceneCompletion, setShowSceneCompletion]   = useState(false);
  const [showCenteredWord, setShowCenteredWord]         = useState(null);
  const [showPowerOverlay, setShowPowerOverlay]         = useState(false);
  const [showPowerButton, setShowPowerButton]           = useState(false);
  const [showPracticeAgainButton, setShowPracticeAgainButton] = useState(false);
  const [revealConfig, setRevealConfig]                 = useState(null);
  const [currentWord, setCurrentWord]                   = useState(null);
  const { isAudioOn, toggleAudio, setAudioEnabled }     = useAudioPreference();
  const audioEnabledRef                                 = useRef(isAudioOn);
  audioEnabledRef.current                               = isAudioOn;
  const [showGaneshaCelebration, setShowGaneshaCelebration] = useState(false);
  const [showFinalGanesha, setShowFinalGanesha]         = useState(false);
  const [openingButtonVisible, setOpeningButtonVisible] = useState(true);
  const [savedRecordings, setSavedRecordings]           = useState({});
  const [showAppDiscovery, setShowAppDiscovery]         = useState(false);
  const [isRecorderOpen, setIsRecorderOpen]             = useState(false);

  const timeoutsRef   = useRef([]);
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName   = activeProfile?.name || 'explorer';

  const isFinalCelebrationActive =
    showSparkle === 'final-fireworks' || showFinalGanesha || showSceneCompletion ||
    showAppDiscovery || sceneState.phase === PHASES.COMPLETE;

  const isCelebrationOrOverlayActive =
    isFinalCelebrationActive || !!revealConfig || showPowerOverlay || showCenteredWord;

  // ── NEW: Chanting game state ───────────────────────────────────────────────
  const currentPart   = sceneState.phase === PHASES.MAHAKAYA_GAME ? 'mahakaya' : 'vakratunda';
  const [chantStep,      setChantStep]      = useState(0);
  const [lotusState,     setLotusState]     = useState(0);
  const [banyanState,    setBanyanState]    = useState(0);
  const [wordFragments,  setWordFragments]  = useState([]);
  const [wordMerged,     setWordMerged]     = useState(false);
  const [el1State,       setEl1State]       = useState('neutral');
  const [el2State,       setEl2State]       = useState('neutral');
  const [awaitingTap,    setAwaitingTap]    = useState(false);
  const [activeElephant, setActiveElephant] = useState(null);
  const [awaitingElTap,  setAwaitingElTap]  = useState(false);
  const [svcActive,      setSvcActive]      = useState(false);
  const [svcElephant,    setSvcElephant]    = useState(null);
  const [tapGlow,        setTapGlow]        = useState(false);
  const [svcResult,      setSvcResult]      = useState(null); // { word, elephant } to trigger water spray after success
  const [ganeshaWord,    setGaneshaWord]    = useState(null); // Ganesha celebration word ("Good job!", "Amazing!", etc.)
  const audioRef = useRef(null);
  const el1Ref = useRef(null);
  const el2Ref = useRef(null);
  const plantRef = useRef(null);
  const idleT1   = useRef(null);
  const idleT2   = useRef(null);

  // ── safeSetTimeout (unchanged) ────────────────────────────────────────────
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutsRef.current.push(id);
    return id;
  };
  useEffect(() => () => timeoutsRef.current.forEach(id => clearTimeout(id)), []);

  // ── useVoiceGuidance (unchanged) ──────────────────────────────────────────
  const {
    playVoice: playVO, stopVoice, setVoiceVolume,
    playWord: playWordAudio, playSfx,
    isPlaying: isVOPlaying,
    setCurrentPhase, startIdleTimer, stopIdleTimer
  } = useVoiceGuidance(zoneId, sceneId, { enableMusic: false, voiceVolume: 1, sfxVolume: 0.7, idleTimeout: 20 });

  // ── SymbolAutoReveal helpers (unchanged) ──────────────────────────────────
  const getSidebarTarget = (symbolId) => {
    const el = document.getElementById(`sidebar-${symbolId}`);
    if (!el) return { x: 220, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: (r.left + r.width / 2) - (window.innerWidth / 2), y: (r.top + r.height / 2) - (window.innerHeight / 2) };
  };

  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);
    if (symbolId === 'vakratunda') {
      safeSetTimeout(() => {
        sceneActions.updateState({ unlockedApps: { ...sceneState.unlockedApps, vakratunda: true }, phase: PHASES.MAHAKAYA_GAME });
      }, 950);
    } else if (symbolId === 'mahakaya') {
      safeSetTimeout(() => {
        sceneActions.updateState({ unlockedApps: { ...sceneState.unlockedApps, mahakaya: true } });
      }, 950);
      safeSetTimeout(() => handleAppDiscoveryCelebrate(), 1500);
    }
  };

  const handleHomeToMainMap = () => {
    stopVoice(); stopIdleTimer();
    const activeProfileId = localStorage.getItem('activeProfileId');
    if (activeProfileId) localStorage.removeItem(`temp_session_${activeProfileId}_${zoneId}_${sceneId}`);
    SimpleSceneManager.clearCurrentScene();
    onNavigate?.('direct-to-map');
  };

  // ── Opening modal VO (unchanged) ──────────────────────────────────────────
  useEffect(() => {
    if (sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) {
      if (!audioEnabledRef.current) { setOpeningButtonVisible(true); return; }
      const timer = setTimeout(() => {
        playVO('welcome', () => { playSfx('chime'); setOpeningButtonVisible(true); });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [sceneState.phase, sceneState.welcomeShown, isAudioOn]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Audio helpers (unchanged) ─────────────────────────────────────────────
  const playAudio = (audioPath, volume = 1.0) => {
    if (!isAudioOn) return Promise.resolve();
    try {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      const a = new Audio(audioPath); a.volume = volume;
      audioRef.current = a;
      return a.play().catch(() => Promise.resolve());
    } catch { return Promise.resolve(); }
  };

  const playWord = (word) => playWordAudio(word);

  const handleAudioToggle = () => {
    const nextOn = !isAudioOn;
    setVoiceVolume(nextOn ? 1 : 0);
    if (!nextOn && sceneState.phase === PHASES.INITIAL) stopVoice();
    toggleAudio();
  };

  // ── Idle phase tracking (unchanged) ───────────────────────────────────────
  useEffect(() => {
    if (sceneState.phase === PHASES.VAKRATUNDA_GAME && sceneState.welcomeShown) setCurrentPhase('vakratundaGame');
  }, [sceneState.phase, sceneState.welcomeShown, setCurrentPhase]);

  useEffect(() => {
    if (sceneState.phase === PHASES.MAHAKAYA_GAME) setCurrentPhase('mahakayaGame');
  }, [sceneState.phase, setCurrentPhase]);

  // ── handlePhaseComplete (unchanged — SymbolAutoReveal triggered here) ──────
  const handlePhaseComplete = (word) => {
    stopIdleTimer(); setCurrentPhase(null);
    if (isAudioOn) playVO('chantWordReveal');

    const wordRevealKey = word === 'vakratunda' ? 'vakratunda-word-reveal' : 'mahakaya-word-reveal';
    const chantKey = word === 'vakratunda' ? 'vakratunda-chant' : 'mahakaya-chant';
    sceneActions.updateState({
      learnedWords: { ...sceneState.learnedWords, [word]: true },
      chantedVerses: { ...sceneState.chantedVerses, [chantKey]: true },
      phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_COMPLETE : PHASES.MAHAKAYA_COMPLETE
    });

    setShowSparkle(`${word}-celebration`);
    playWord(word);

    const triggerReveal = () => {
      setShowSparkle(null);
      const discoveryData = getDiscoveryContent(zoneId, sceneId, word);
      setRevealConfig({
        symbolId: word,
        symbolImage: powerConfig[word].image,
        symbolName: discoveryData?.title || powerConfig[word].name,
        affirmation: discoveryData?.affirmation || powerConfig[word].affirmation,
        sidebarTarget: getSidebarTarget(word)
      });
      sceneActions.updateState({ phase: word === 'vakratunda' ? PHASES.VAKRATUNDA_POWER : PHASES.MAHAKAYA_POWER });
    };

    if (isAudioOn) {
      safeSetTimeout(() => playVO(wordRevealKey, () => triggerReveal()), 2000);
    } else {
      safeSetTimeout(() => triggerReveal(), 1500);
    }
  };

  const handlePowerUnlockComplete = () => {
    setShowPowerOverlay(false); stopVoice();
    if (currentWord === 'vakratunda') {
      sceneActions.updateState({ phase: PHASES.MAHAKAYA_GAME });
    } else {
      setShowAppDiscovery(true);
    }
  };

  const handleAppDiscoveryCelebrate = () => {
    setShowAppDiscovery(false);
    if (isAudioOn) playVO('sceneComplete');
    sceneActions.updateState({ phase: PHASES.COMPLETE, stars: 5, completed: true, progress: { percentage: 100, starsEarned: 5, completed: true } });
    setShowFinalGanesha(true);
    setShowSparkle('final-fireworks');
  };

  const handleFinalCelebrationComplete = () => {
    setShowSparkle(null);
    setShowFinalGanesha(false);
    const profileId = localStorage.getItem('activeProfileId');
    if (profileId) {
      try {
        GameStateManager.saveGameState(zoneId, sceneId, {
          completed: true, stars: 5, phase: PHASES.COMPLETE,
          words: sceneState.learnedWords || {},
          syllables: sceneState.learnedSyllables || {},
          apps: sceneState.unlockedApps || {},
          timestamp: Date.now()
        });
        localStorage.removeItem(`temp_session_${profileId}_${zoneId}_${sceneId}`);
        SimpleSceneManager.clearCurrentScene();
      } catch (error) { console.error('Error saving game state:', error); }
    }
    setShowSceneCompletion(true);
  };

  const handlePlayAgain = () => {
    setShowPowerOverlay(false);
    if (currentWord === 'vakratunda') {
      sceneActions.updateState({ phase: PHASES.VAKRATUNDA_GAME, learnedWords: { ...sceneState.learnedWords, vakratunda: false } });
    } else if (currentWord === 'mahakaya') {
      sceneActions.updateState({ phase: PHASES.MAHAKAYA_GAME, learnedWords: { ...sceneState.learnedWords, mahakaya: false } });
    }
    setCurrentWord(null);
  };

  // ── NEW: Phase transition resets chanting state ───────────────────────────
  useEffect(() => {
    if (sceneState.phase === PHASES.VAKRATUNDA_GAME) {
      setChantStep(0); setLotusState(0); setWordFragments([]); setWordMerged(false);
      setEl1State('neutral'); setEl2State('neutral');
      safeSetTimeout(() => setAwaitingTap(true), 400);
    } else if (sceneState.phase === PHASES.MAHAKAYA_GAME) {
      setChantStep(0); setBanyanState(0); setWordFragments([]); setWordMerged(false);
      setEl1State('neutral'); setEl2State('neutral');
      safeSetTimeout(() => setAwaitingTap(true), 400);
    } else {
      setAwaitingTap(false);
    }
  }, [sceneState.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── NEW: Idle hint glow ───────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(idleT1.current); clearTimeout(idleT2.current); setTapGlow(false);
    if (!awaitingTap) return;
    idleT2.current = setTimeout(() => setTapGlow(true), 19000);
    return () => { clearTimeout(idleT1.current); clearTimeout(idleT2.current); };
  }, [awaitingTap, currentPart, chantStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── NEW: Plant tap ────────────────────────────────────────────────────────
  const handlePlantTap = () => {
    if (!awaitingTap || svcActive || isCelebrationOrOverlayActive) return;
    clearTimeout(idleT1.current); clearTimeout(idleT2.current);
    setTapGlow(false); setAwaitingTap(false);

    const cfg = PARTS[currentPart][chantStep];
    if (cfg.activeElephant === 1 || cfg.activeElephant === 'both') setEl1State('encourage');
    if (cfg.activeElephant === 2 || cfg.activeElephant === 'both') setEl2State('encourage');

    playAudio(cfg.audio);

    safeSetTimeout(() => {
      setEl1State('neutral'); setEl2State('neutral');
      setActiveElephant(cfg.activeElephant);
      setAwaitingElTap(true);
    }, 1600);
  };

  // ── NEW: Elephant tap ─────────────────────────────────────────────────────
  const handleElephantTap = (num) => {
    if (!awaitingElTap) return;
    const cfg = PARTS[currentPart][chantStep];
    if (cfg.activeElephant !== num && cfg.activeElephant !== 'both') return;
    setAwaitingElTap(false); setSvcElephant(num); setSvcActive(true);
    stopVoice();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  };

  // ── NEW: SVC complete — advances step or calls handlePhaseComplete ─────────
  const handleSvcComplete = () => {
    setSvcActive(false); setSvcElephant(null); setActiveElephant(null); setAwaitingElTap(false);

    const cfg = PARTS[currentPart][chantStep];
    const celebrationWords = ['Good job!', 'Amazing!', 'Wonderful!', 'Excellent!'];
    const randomWord = celebrationWords[Math.floor(Math.random() * celebrationWords.length)];
    setGaneshaWord(randomWord);

    if (cfg.activeElephant === 1 || cfg.activeElephant === 'both') setEl1State('celebrate');
    if (cfg.activeElephant === 2 || cfg.activeElephant === 'both') setEl2State('celebrate');

    // Trigger water spray after celebration word displays
    safeSetTimeout(() => {
      setSvcResult({ syllable: cfg.syllable, elephant: cfg.activeElephant });
      setGaneshaWord(null);
    }, 600);

    safeSetTimeout(() => { setEl1State('neutral'); setEl2State('neutral'); }, 2200);

    if (currentPart === 'vakratunda') {
      if (chantStep === 0) {
        setWordFragments(['VAKRA']); setLotusState(1);
        safeSetTimeout(() => { setChantStep(1); setAwaitingTap(true); setSvcResult(null); }, 1800);
      } else if (chantStep === 1) {
        setWordFragments(['VAKRA', 'TUNDA']); setLotusState(2);
        safeSetTimeout(() => { setChantStep(2); setAwaitingTap(true); setSvcResult(null); }, 1800);
      } else {
        setWordMerged(true); setLotusState(3); playSfx('chime');
        safeSetTimeout(() => { setSvcResult(null); handlePhaseComplete('vakratunda'); }, 1500);
      }
    } else {
      if (chantStep === 0) {
        setWordFragments(['MAHA']); setBanyanState(1);
        safeSetTimeout(() => { setChantStep(1); setAwaitingTap(true); setSvcResult(null); }, 1800);
      } else if (chantStep === 1) {
        setWordFragments(['MAHA', 'KAYA']); setBanyanState(2);
        safeSetTimeout(() => { setChantStep(2); setAwaitingTap(true); setSvcResult(null); }, 1800);
      } else {
        setWordMerged(true); setBanyanState(3); playSfx('chime');
        safeSetTimeout(() => { setSvcResult(null); handlePhaseComplete('mahakaya'); }, 1500);
      }
    }
  };

  // ── NEW: SVC audio helpers ────────────────────────────────────────────────
  const replayChantAudio = () => {
    const cfg = PARTS[currentPart]?.[chantStep];
    if (cfg) playAudio(cfg.audio);
  };
  const stopChantAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    stopVoice();
  };

  // ── Derived render values ─────────────────────────────────────────────────
  if (!sceneState) return <div className="loading">Loading...</div>;

  const isChantingActive = sceneState.phase === PHASES.VAKRATUNDA_GAME || sceneState.phase === PHASES.MAHAKAYA_GAME;
  const cfg              = PARTS[currentPart][chantStep];
  const plantImg         = currentPart === 'vakratunda' ? LOTUS_IMAGES[Math.min(lotusState, 3)] : BANYAN_IMAGES[Math.min(banyanState, 3)];
  const isFullBloom      = (currentPart === 'vakratunda' && lotusState === 3) || (currentPart === 'mahakaya' && banyanState === 3);

  const showBubble1 = awaitingElTap
    ? (activeElephant === 1 || activeElephant === 'both')
    : (svcActive && svcElephant === 1);
  const showBubble2 = awaitingElTap
    ? (activeElephant === 2 || activeElephant === 'both')
    : (svcActive && svcElephant === 2);

  useEffect(() => {
    if (showSparkle !== 'final-fireworks') return;
    const id = setTimeout(() => handleFinalCelebrationComplete(), 2600);
    return () => clearTimeout(id);
  }, [showSparkle]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="vakratunda-simplified-container">
          <HomeButton onNavigate={onNavigate} />
          <AudioToggle isAudioOn={isAudioOn} onToggle={handleAudioToggle} />
          <div className="river-background" style={{ backgroundImage: `url(${riverBackground})` }}>

            {/* DEV TEST BUTTONS */}
            {sceneState.welcomeShown && !showPowerOverlay && !showCenteredWord && (
              <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 99999, display: 'flex', gap: '6px', flexDirection: 'column' }}>
                <button onClick={() => handlePhaseComplete('vakratunda')} style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', background: '#4ECDC4', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: 0.85 }}>⚡ Test Vakratunda Reveal</button>
                <button onClick={() => handlePhaseComplete('mahakaya')} style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', opacity: 0.85 }}>⚡ Test Mahakaya Reveal</button>
              </div>
            )}

            {/* OPENING MODAL (unchanged) */}
            <OpeningModal
              zoneId={zoneId}
              sceneId={sceneId}
              isOpen={!sceneState.welcomeShown}
              onStart={() => sceneActions.updateState({ welcomeShown: true, phase: PHASES.VAKRATUNDA_GAME })}
              characterImg={ganeshaHeadphones}
              showButton={openingButtonVisible}
            />

            {/* ── NEW CHANTING GAME (replaces VakratundaGame + MahakayaGame) ── */}
            {isChantingActive && !isCelebrationOrOverlayActive && (
              <>
                {/* Word stage — top centre */}
                {wordFragments.length > 0 && (
                  <div className="grove-word-stage">
                    {wordMerged ? (
                      <span className="grove-fragment grove-fragment--merged">
                        {currentPart === 'vakratunda' ? 'VAKRATUNDA' : 'MAHAKAYA'}
                      </span>
                    ) : (
                      wordFragments.map((f, i) => (
                        <span key={i} className="grove-fragment grove-fragment--float">{f}</span>
                      ))
                    )}
                  </div>
                )}

                {/* Stage: Elephant1 · Plant · Elephant2 */}
                <div className="grove-stage">

                  {/* Elephant 1 */}
                  <div className="grove-elephant grove-elephant--left">
                    {showBubble1 && (
                      <div className="grove-speech-bubble grove-speech-bubble--left">
                        {svcActive && svcElephant === 1 ? (
                          <SyllableVoiceChallenge
                            syllable={cfg.syllable}
                            displayLabel={cfg.label}
                            onComplete={handleSvcComplete}
                            replayAudio={replayChantAudio}
                            stopAudio={stopChantAudio}
                            inline={true}
                          />
                        ) : (
                          <span className="grove-bubble-text">Say {cfg.label}! 🎤</span>
                        )}
                      </div>
                    )}
                    <img
                      ref={el1Ref}
                      src={elephantImg}
                      alt="Elephant 1"
                      className={`grove-elephant-img grove-elephant-img--${el1State}`}
                      style={{ width: 320, minWidth: 320, maxWidth: 'none', height: 'auto' }}
                      onClick={() => handleElephantTap(1)}
                      draggable={false}
                    />
                  </div>

                  {/* Lotus / Banyan */}
                  <div className="grove-plant-area">
                    <img
                      ref={plantRef}
                      src={plantImg}
                      alt={currentPart === 'vakratunda' ? 'Lotus' : 'Banyan tree'}
                      className={['grove-plant', awaitingTap ? 'grove-plant--tappable' : '', tapGlow ? 'grove-plant--glow' : '', isFullBloom ? 'grove-plant--bloomed' : ''].filter(Boolean).join(' ')}
                      onClick={handlePlantTap}
                      draggable={false}
                    />
                  </div>

                  {/* Elephant 2 (mirrored) */}
                  <div className="grove-elephant grove-elephant--right">
                    {showBubble2 && (
                      <div className="grove-speech-bubble grove-speech-bubble--right">
                        {svcActive && svcElephant === 2 ? (
                          <SyllableVoiceChallenge
                            syllable={cfg.syllable}
                            displayLabel={cfg.label}
                            onComplete={handleSvcComplete}
                            replayAudio={replayChantAudio}
                            stopAudio={stopChantAudio}
                            inline={true}
                          />
                        ) : (
                          <span className="grove-bubble-text">Say {cfg.label}! 🎤</span>
                        )}
                      </div>
                    )}
                    <img
                      ref={el2Ref}
                      src={elephantImg}
                      alt="Elephant 2"
                      className={`grove-elephant-img grove-elephant-img--${el2State} grove-elephant-img--mirror`}
                      style={{ width: 320, minWidth: 320, maxWidth: 'none', height: 'auto' }}
                      onClick={() => handleElephantTap(2)}
                      draggable={false}
                    />
                  </div>

                </div>{/* grove-stage */}

                {/* Ganesha celebration word */}
                {ganeshaWord && (
                  <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '36px', fontFamily: 'Baloo 2', fontWeight: 700, color: '#2E7D32', textShadow: '0 0 20px rgba(255, 215, 0, 0.6)', zIndex: 100, animation: 'ganeshaWordFloat 0.8s ease-out both', pointerEvents: 'none' }}>
                    {ganeshaWord}
                    <style>{`@keyframes ganeshaWordFloat { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); } 50% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -120%) scale(1.1); } }`}</style>
                  </div>
                )}

                {/* Water spray animations — triggered after SVC success */}
                {svcResult && el1Ref.current && plantRef.current && (svcResult.elephant === 1 || svcResult.elephant === 'both') && (
                  <WaterSprayArc
                    isActive={true}
                    sourcePosition={{ left: ((el1Ref.current.getBoundingClientRect().left + el1Ref.current.getBoundingClientRect().width / 2) / window.innerWidth * 100).toFixed(1) + '%', top: ((el1Ref.current.getBoundingClientRect().top + el1Ref.current.getBoundingClientRect().height * 0.3) / window.innerHeight * 100).toFixed(1) + '%' }}
                    targetPosition={{ left: ((plantRef.current.getBoundingClientRect().left + plantRef.current.getBoundingClientRect().width / 2) / window.innerWidth * 100).toFixed(1) + '%', top: ((plantRef.current.getBoundingClientRect().top + plantRef.current.getBoundingClientRect().height * 0.2) / window.innerHeight * 100).toFixed(1) + '%' }}
                    duration={1500}
                    phase={currentPart}
                  />
                )}
                {svcResult && el2Ref.current && plantRef.current && (svcResult.elephant === 2 || svcResult.elephant === 'both') && (
                  <WaterSprayArc
                    isActive={true}
                    sourcePosition={{ left: ((el2Ref.current.getBoundingClientRect().left + el2Ref.current.getBoundingClientRect().width / 2) / window.innerWidth * 100).toFixed(1) + '%', top: ((el2Ref.current.getBoundingClientRect().top + el2Ref.current.getBoundingClientRect().height * 0.3) / window.innerHeight * 100).toFixed(1) + '%' }}
                    targetPosition={{ left: ((plantRef.current.getBoundingClientRect().left + plantRef.current.getBoundingClientRect().width / 2) / window.innerWidth * 100).toFixed(1) + '%', top: ((plantRef.current.getBoundingClientRect().top + plantRef.current.getBoundingClientRect().height * 0.2) / window.innerHeight * 100).toFixed(1) + '%' }}
                    duration={1500}
                    phase={currentPart}
                  />
                )}

                {/* River */}
                <div className="grove-river">
                  <div className="grove-river-wave" />
                  <div className="grove-river-wave grove-river-wave--2" />
                </div>
              </>
            )}
            {/* ── END CHANTING GAME ── */}

            {/* GANESHA CELEBRATION (unchanged) */}
            {showGaneshaCelebration && (
              <div className="vakratunda-ganesha-celebration-enter">
                <img src={ganeshaHeadphones} alt="Ganesha" className="vakratunda-ganesha-slides-in" />
              </div>
            )}

            {/* SYMBOL AUTO-REVEAL (unchanged) */}
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

            {/* APPSIDEBAR (unchanged) */}
            {!showAppDiscovery && !isFinalCelebrationActive && !(sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown) && (
              <AppSidebar
                unlockedApps={sceneState.unlockedApps || {}}
                savedRecordings={savedRecordings}
                isReload={isReload}
                onPopupOpen={() => { stopVoice(); stopIdleTimer(); setIsRecorderOpen(true); }}
                onPopupClose={() => {
                  setIsRecorderOpen(false);
                  if ([PHASES.VAKRATUNDA_GAME, PHASES.MAHAKAYA_GAME].includes(sceneState.phase) && !showPowerOverlay && !showCenteredWord) startIdleTimer();
                }}
              />
            )}

            {/* CALM FINAL CELEBRATION */}
            {showSparkle === 'final-fireworks' && (
              <div style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 80,
                background: 'radial-gradient(circle at 50% 70%, rgba(255, 215, 0, 0.16), rgba(255,255,255,0) 55%)'
              }}>
                <SparkleAnimation
                  type="glitter"
                  count={28}
                  color="#FFD700"
                  size={10}
                  duration={2400}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* FINAL GANESHA (unchanged) */}
            {showFinalGanesha && !showSceneCompletion && (
              <div className="vakratunda-final-ganesha-appears">
                <img src={ganeshaHeadphones} alt="Ganesha" className="vakratunda-ganesha-final-enters" />
              </div>
            )}

            {/* SCENE COMPLETION (unchanged) */}
            <SceneCompletionCelebration
              show={showSceneCompletion}
              zoneId={zoneId}
              sceneName="Vakratunda Grove"
              completionTitle={completionModalContent?.title}
              completionSubtitle={completionModalContent?.subtitle}
              sceneNumber={1}
              totalScenes={5}
              starsEarned={5}
              totalStars={5}
              discoveredSymbols={['vakratunda', 'mahakaya']}
              containerType="backpack"
              symbolImages={{ vakratunda: symbolVakratunda, mahakaya: symbolMahakaya }}
              symbolData={{
                vakratunda: { title: "Vakratunda - Curved Trunk", description: "Remover of obstacles with his curved trunk. Chant: VA-KRA-TUN-DA" },
                mahakaya:   { title: "Mahakaya - Great Body",    description: "Great cosmic form that holds the universe. Chant: MA-HA-KA-YA" }
              }}
              savedRecordings={savedRecordings}
              nextSceneName="Suryakoti Bank"
              sceneId="vakratunda-grove"
              completionData={{ stars: 5, syllables: sceneState.learnedSyllables, words: sceneState.learnedWords, completed: true }}
              onComplete={() => onNavigate?.('zone-welcome')}
              onReplay={() => {
                audioEnabledRef.current = false;
                setAudioEnabled(false); setVoiceVolume(0); stopVoice();
                setShowSceneCompletion(false); setRevealConfig(null); setShowSparkle(null);
                setShowFinalGanesha(false); setShowGaneshaCelebration(false); setShowPowerOverlay(false);
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

export default VakratundaGroveSimplified;
