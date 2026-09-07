// zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV6.jsx
// V6 GAMEPLAY UPDATE — "Find a Way, Rise Anyway" (locked spec):
//   Phase 1 (Trunk, first) — Blocked stream + rock obstacle. Child free-drags
//     the water around the rock (either side) to reach the muddy pond.
//     Reaching the pond lifts the dormant/drooped lotus upright (confirmation
//     that water arrived) — this does NOT bloom it.
//   Phase 2 (Lotus, second) — Press-and-hold the now-upright lotus bud;
//     it rises from the still-muddy pond and blooms.
//   Phase 3 — Final reveal (existing flow preserved)
// All non-gameplay systems (reload, hints, audio, voice, sidebar, completion) untouched.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PondScene.css';
import '../../../../lib/styles/zone-themes.css'; // Ensure theme vars are loaded
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../../lib/config/content/openingModals';
import { getCompletionModal } from '../../../../lib/config/content';

// Shared Components
import OpeningModal from '../../../shared/components/OpeningModal';

// --- NEW MASTER LAYOUT & CONFIG ---
import GameLayout from '../../../../lib/components/layout/GameLayout';
import { pondHelpConfig } from './helpConfig';
// ----------------------------------

// Import scene management components
import SceneManager from "../../../../lib/components/scenes/SceneManager";
import MessageManager from "../../../../lib/components/scenes/MessageManager";
import InteractionManager from "../../../../lib/components/scenes/InteractionManager";
import GameStateManager from "../../../../lib/services/GameStateManager";
import ProgressManager from '../../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../../lib/services/SimpleSceneManager';

import useSceneReset from '../../../../lib/hooks/useSceneReset';
import { getSceneResetConfig } from '../../../../lib/config/SceneResetConfigs';
import { useGameSounds } from '../../../../lib/hooks/useGameSounds';
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import { useGaneshaVoice } from '../../../../lib/hooks/useGaneshaVoice';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import AudioToggle from '../../../../lib/components/ui/AudioToggle';
import usePauseAwareTimeout from '../../../../lib/hooks/usePauseAwareTimeout';
import useResumeCountdown from '../../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../../lib/components/feedback/ResumeCountdown';
import VOReplayButton from '../../../../lib/components/feedback/VOReplayButton';

// UI Components
import CulturalCelebrationModal from '../../../../lib/components/progress/CulturalCelebrationModal';
import CulturalProgressExtractor from '../../../../lib/services/CulturalProgressExtractor';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import GaneshaGestureCue from '../../../../lib/components/gesture/GaneshaGestureCue';
import { useMiniGesture } from '../../../../lib/hooks/useMiniGesture';
import FireworksCompletion from '../../../../lib/components/feedback/FireworksCompletion';
import CalmGoldenFireworks from '../../../../lib/components/feedback/CalmGoldenFireworks';
import GestureDemo from '../../../../lib/components/feedback/GestureDemo';
import SymbolSidebar from '../../shared/components/SymbolSidebar';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import InnerMandala from '../../../../lib/components/celebration/InnerMandala';
import HomeButton from '../../../../lib/components/ui/HomeButton';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import SimpleDiscoveryOverlay from '../../../shared/components/SimpleDiscoveryOverlay';
import SymbolAutoReveal from '../../../../lib/components/reveal/SymbolAutoReveal';

// Images
import trunkPondBg from './assets/images/trunk-pond-bg-new.webp';
import trunkRock from './assets/images/trunk-rock-new.webp';
import trunkReedsLeft from './assets/images/trunk-reeds-left.webp';
import trunkReedsRight from './assets/images/trunk-reeds-right.webp';
import lotusDormant from './assets/images/trunk-lotus-dormant-new.webp';
import lotusUpright from './assets/images/trunk-lotus-upright-new.webp';
import lotusBloomedImg from './assets/images/trunk-lotus-bloomed-new.webp';
import mooshikaCoach from "./assets/images/mooshika-coach.webp";
import symbolMooshikaColored from '../../shared/images/icons/symbol-mooshika-new.webp';
import symbolModakColored from '../../shared/images/icons/symbol-modak-new.webp';
import symbolBellyColored from '../../shared/images/icons/symbol-belly-new.webp';
import symbolLotusColored from '../../shared/images/icons/symbol-lotus-new.webp';
import symbolTrunkColored from '../../shared/images/icons/symbol-trunk-new.webp';

// Mission images
import lotusBefore from './assets/images/lotus-before.webp';
import lotusAfter from './assets/images/lotus-after.webp';
import trunkBefore from './assets/images/trunk-before.webp';
import trunkAfter from './assets/images/trunk-after.webp';
import ganeshaCharacter from './assets/images/ganesha-character.webp';

const GANESHA_REFLECTION_IMAGE = '/images/ganesha-sit.svg';

const RESUME_DELAY_MS = 3000;

const PHASES = {
  INITIAL: 'initial',           // heavy rock blocks water
  ROCK_MOVING: 'rock_moving',   // child holding rock
  REEDS_ACTIVE: 'reeds_active', // rock moved, soft reeds still block water
  TRUNK_SOLVED: 'trunk_solved', // reeds parted, water reaches lotus
  TRUNK_REVEAL: 'trunk_reveal', // SymbolAutoReveal card for trunk showing
  LOTUS_ACTIVE: 'lotus_active', // lotus upright, press-and-hold enabled
  BLOOMED: 'bloomed',           // lotus bloomed, about to reveal lotus card
  COMPLETE: 'complete'
};

const VOICE_LINES = {
  // Entry
  opening: 'A rock is blocking the water.',

  // Trunk phase (strength, then gentleness) — first
  rockRound: 'This heavy rock needs strength. Press and hold it.',
  idleRock: 'Keep holding. This one needs strength.',
  reedsRound: 'These reeds are delicate. Gently part them for the water.',
  idleReeds: 'A gentle touch will move the reeds.',
  waterPathPower: 'Strong when needed. Gentle when needed.',

  // Lotus phase (press-and-hold to bloom) — second
  lotusRound: 'The lotus is growing through the muddy water. Press and hold the bud.',
  idleLotus: 'Keep holding the bud.',
  lotusBloomPower: 'The lotus bloomed, even in the muddy pond.',

  // Completion
  complete: 'You used strength, then gentleness, and helped the lotus grow.'
};

const powerConfig = {
  lotus: {
    name: 'Sacred Purity',
    image: symbolLotusColored,
    color: '#4ECDC4'
  },
  trunk: {
    name: 'Divine Blessing',
    image: symbolTrunkColored,
    color: '#FFD700'
  }
};

const missionImages = {
  lotus: { before: lotusBefore, after: lotusAfter },
  trunk: { before: trunkBefore, after: trunkAfter }
};

// ==================== V6 GAMEPLAY CONFIG ====================
// Coordinates are % of the background container.
const ROCK_HOLD_MS = 1600;
const REEDS_START_POINT = { x: 55, y: 51 };
const REEDS_DRAG_DISTANCE = 90;
const LOTUS_HOLD_POINT = { x: 78.5, y: 53.5 };

// Lotus phase: press-and-hold to bloom. Same forgiving-release feel as before.
const LOTUS_HOLD_MS = 1800;
const HOLD_DECAY_MULTIPLIER = 2;
const HOLD_RESET_GRACE_MS = 1000;

const LOTUS_GLOW_MS = 900;           // glow burst duration as the lotus wakes up
const TRUNK_REVEAL_DELAY_MS = 1200;  // pause before the trunk SymbolAutoReveal card
const WATER_TO_REEDS_MS = 900;
const WATER_TO_POND_MS = 1100;
const POND_OVERLAY_MID = null;
const POND_OVERLAY_FRONT = '';
// =============================================================

const discoveryConfig = {
  trunk: {
    foundTitle: "The Water Found a Way!",
    foundSubtitle: "Something magical appears...",
    powerName: "Divine Blessing",
    image: symbolTrunkColored
  },
  lotus: {
    foundTitle: "The Lotus Bloomed!",
    foundSubtitle: "Ganesha's lotus reveals its power...",
    powerName: "Sacred Purity",
    image: symbolLotusColored
  }
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details>
            <summary>Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>Reload Scene</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const PondSceneSimplifiedV5 = ({
  onComplete,
  onNavigate,
  zoneId = 'symbol-mountain',
  sceneId = 'pond'
}) => {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          rockMoved: false,
          reedsParted: false,
          streamSolved: false,
          lotusUpright: false,
          lotusBloomed: false,
          phase: 'initial',
          currentFocus: 'trunk',
          discoveredSymbols: {
            mooshika: true,
            modak: true,
            belly: true,
          },
          welcomeShown: false,
          currentPopup: null,
          showingCompletionScreen: false,
          stars: 0,
          completed: false,
          progress: {
            percentage: 0,
            starsEarned: 0,
            completed: false
          }
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <PondSceneContent
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
};

const PondSceneContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onNavigate,
  zoneId,
  sceneId
}) => {
  const { resetScene } = useSceneReset(sceneActions, 'symbol-mountain', 'pond', getSceneResetConfig('pond'));
  const completionModalContent = getCompletionModal(zoneId, sceneId);
  const activeProfile = GameStateManager.getActiveProfile();
  const profileName = activeProfile?.name || 'Friend';

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showMandala, setShowMandala] = useState(false);
  const [showCulturalCelebration, setShowCulturalCelebration] = useState(false);
  const [isSymbolPopupOpen, setIsSymbolPopupOpen] = useState(false);
  const [fireworksFinished, setFireworksFinished] = useState(false);

  // Discovery overlay states

  // Resume popup states
  const [showResumePopup, setShowResumePopup] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');
  const [showDiscoveryFlip1, setShowDiscoveryFlip1] = useState(false); // eslint-disable-line no-unused-vars
  const [showDiscoveryFlip2, setShowDiscoveryFlip2] = useState(false); // eslint-disable-line no-unused-vars
  const [revealConfig, setRevealConfig] = useState(null);

  // ==================== V6 HOLD-TO-BLOOM STATE (single lotus) ====================
  // holdProgress: 0–1. Drives the glow ring + bud "stirring" animation.
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef(null);       // active hold rAF id
  const holdReleaseRef = useRef(null);     // release decay rAF id
  const holdResetTimerRef = useRef(null);  // 1s grace timer

  // ==================== TRUNK GAME ====================
  const [rockHoldProgress, setRockHoldProgress] = useState(0);
  const rockHoldRafRef = useRef(null);
  const rockHoldStartRef = useRef(null);

  const [reedsDragActive, setReedsDragActive] = useState(false);
  const [reedsProgress, setReedsProgress] = useState(0);
  const reedsStartXRef = useRef(null);

  const [waterStage, setWaterStage] = useState(0);
  // ================================================================


  // Mini gesture cue
  const { miniGesture, triggerMiniGesture } = useMiniGesture();

  // Audio
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const { speak, stop: stopSpokenVoice } = useGaneshaVoice();
  const { setGlobalVolume } = useGameSounds();
  const { startMusic, stopMusic, setVoiceVolume, playCorrect, playPowerUnlock, playCelebration } = useVoiceGuidance(
    zoneId, sceneId, {
      enableMusic: true,
      musicVolume: 0.06,
      sfxVolume: 0.7,
      idleTimeout: 20,
      resumeDelay: RESUME_DELAY_MS,
    }
  );
  const playBloom = playCorrect;
  const playChime = playCorrect;
  const playGlow = playPowerUnlock;
  const playTwinkle = playCelebration;
  useEffect(() => { setVoiceVolume(isAudioOn ? 1 : 0); }, [isAudioOn, setVoiceVolume]);
  useEffect(() => { if (sceneState?.welcomeShown) startMusic(); }, [sceneState?.welcomeShown]);
  useEffect(() => {
    setGlobalVolume(0.35);
    return () => { stopMusic(); setGlobalVolume(1.0); };
  }, []);

  // Resume popup timeout ref
  const resumePopupTimeoutRef = useRef(null);

  // Backfill missing phase for older saved state objects (effect, not render).
  useEffect(() => {
    if (!sceneState?.phase) sceneActions.updateState({ phase: 'initial' });
  }, [sceneState?.phase, sceneActions]);

  // Live ref of sceneState so rAF hold callbacks never read a stale snapshot
  // (two-finger simultaneous holds were losing blooms).
  const sceneStateRef = useRef(sceneState);
  useEffect(() => { sceneStateRef.current = sceneState; }, [sceneState]);

  const progressiveHintRef = useRef(null);
  const reloadHandledRef = useRef(false);

  const lastAnnouncedPromptRef = useRef(null);
  const resumePromptPlayedRef = useRef(false);
  const idleVoGateRef = useRef(false);
  const wasAudioOnRef = useRef(isAudioOn);
  const [hintResetKey, setHintResetKey] = useState(0);
  const [idleHintLevel, setIdleHintLevel] = useState(0);
  const lastIdleInteractionAtRef = useRef(Date.now());
  const IDLE_HINT_L1_MS = 10000;
  const IDLE_HINT_L2_MS = 18000;
  const IDLE_HINT_L3_MS = 26000;
  const resetIdleBaseline = useCallback(() => {
    idleVoGateRef.current = false;
    setIdleHintLevel(0);
    lastIdleInteractionAtRef.current = Date.now();
  }, []);

  const rearmIdleHints = useCallback(() => {
    setHintResetKey(k => k + 1);
  }, []);

  const speakPondPrompt = useCallback((key) => {
    if (!isAudioOn || !VOICE_LINES[key]) return;
    speak(VOICE_LINES[key], {
      age: 7,
      style: 'child',
      moment: key === 'complete' ? 'celebration' : 'encouragement'
    });
  }, [isAudioOn, speak]);
  const getPromptKeyForPhase = useCallback(() => {
    if (!sceneState?.welcomeShown) return 'opening';
    if (revealConfig || showSparkle === 'final-fireworks') return null;
    if (sceneState?.phase === PHASES.COMPLETE) return 'complete';
    if (sceneState?.phase === PHASES.LOTUS_ACTIVE || sceneState?.phase === PHASES.BLOOMED) return 'lotusRound';
    if (sceneState?.phase === PHASES.INITIAL || sceneState?.phase === PHASES.ROCK_MOVING) return 'rockRound';
    if (sceneState?.phase === PHASES.REEDS_ACTIVE) return 'reedsRound';
    return null;
  }, [
    sceneState?.phase,
    sceneState?.welcomeShown,
    revealConfig,
    showSparkle
  ]);
  const replayCurrentVoice = useCallback(() => {
    const replayKey = getPromptKeyForPhase();
    if (replayKey) speakPondPrompt(replayKey);
  }, [getPromptKeyForPhase, speakPondPrompt]);
  function onPauseHide() {
    stopSpokenVoice();
    if (rockHoldRafRef.current) {
      cancelAnimationFrame(rockHoldRafRef.current);
      rockHoldRafRef.current = null;
    }
    rockHoldStartRef.current = null;
    setReedsDragActive(false);
    reedsStartXRef.current = null;
    // Lotus press-and-hold uses its own rAF loops (not covered by
    // cancelActiveDrag, which only tracks the rock-drag state) — a
    // pointercancel-equivalent pause (tab hidden mid-hold) must stop them too,
    // or the hold silently keeps progressing/animating in the background.
    if (holdTimerRef.current) {
      cancelAnimationFrame(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdReleaseRef.current) {
      cancelAnimationFrame(holdReleaseRef.current);
      holdReleaseRef.current = null;
    }
    if (holdResetTimerRef.current) {
      clearTimeout(holdResetTimerRef.current);
      holdResetTimerRef.current = null;
    }
    setHoldProgress(0);
  }
  const onPauseShow = useCallback(() => {
    const replayKey = getPromptKeyForPhase();
    if (replayKey) {
      resetIdleBaseline();
      speakPondPrompt(replayKey);
    }
    rearmIdleHints();
  }, [getPromptKeyForPhase, resetIdleBaseline, speakPondPrompt, rearmIdleHints]);

  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: onPauseHide,
    onShow: onPauseShow,
    resumeDelay: RESUME_DELAY_MS,
  });

  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
      stopSpokenVoice();
      if (rockHoldRafRef.current) cancelAnimationFrame(rockHoldRafRef.current);
      reloadHandledRef.current = false;
    };
  }, [clearAllTimeouts, stopSpokenVoice]);

  useEffect(() => {
    const wasAudioOn = wasAudioOnRef.current;
    wasAudioOnRef.current = isAudioOn;

    if (!wasAudioOn && isAudioOn) {
      idleVoGateRef.current = false;
      lastAnnouncedPromptRef.current = null;
      resumePromptPlayedRef.current = false;

      if (revealConfig?.symbolId) {
        const voMap = { lotus: 'lotusBloomPower', trunk: 'waterPathPower' };
        const voKey = voMap[revealConfig.symbolId];
        if (voKey) {
          speakPondPrompt(voKey);
          return;
        }
      }

      const replayKey = getPromptKeyForPhase();
      if (replayKey) speakPondPrompt(replayKey);
    }
  }, [isAudioOn, revealConfig, getPromptKeyForPhase, speakPondPrompt]);

  // Reset hook:
  // 1) clear current hint visuals
  // 2) reset idle hint level to 0
  // 3) restart the level timer from now
  useEffect(() => {
    setIdleHintLevel(0);
    idleVoGateRef.current = false;
    lastIdleInteractionAtRef.current = Date.now();
  }, [hintResetKey]);

  useEffect(() => {
    if (!isAudioOn) return;
    const promptKey = getPromptKeyForPhase();
    if (!promptKey || revealConfig || showSceneCompletion || isSymbolPopupOpen) return;
    if (lastAnnouncedPromptRef.current === promptKey) return;

    const timer = setTimeout(() => {
      resetIdleBaseline();
      speakPondPrompt(promptKey);
      lastAnnouncedPromptRef.current = promptKey;
    }, promptKey === 'complete' ? 250 : promptKey === 'rockRound' ? 850 : 500);
    return () => clearTimeout(timer);
  }, [
    isAudioOn,
    sceneState?.phase,
    sceneState?.welcomeShown,
    sceneState?.completed,
    isSymbolPopupOpen,
    revealConfig,
    showSceneCompletion
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Deterministic idle ladder:
  // L1 @ 10s (hint), L2 @ 18s (hint-strong), L3 @ 26s (hint-final + gesture).
  useEffect(() => {
    const hintPhases = [
      PHASES.INITIAL,
      PHASES.ROCK_MOVING,
      PHASES.REEDS_ACTIVE,
      PHASES.LOTUS_ACTIVE
    ];
    const isHintPhase = hintPhases.includes(sceneState?.phase)
      && sceneState?.welcomeShown
      && !isSymbolPopupOpen
      && !revealConfig
      && !showSceneCompletion;

    if (!isHintPhase) {
      setIdleHintLevel(0);
      return;
    }

    const tick = setInterval(() => {
      const idleFor = Date.now() - lastIdleInteractionAtRef.current;
      let nextLevel = 0;
      if (idleFor >= IDLE_HINT_L3_MS) nextLevel = 3;
      else if (idleFor >= IDLE_HINT_L2_MS) nextLevel = 2;
      else if (idleFor >= IDLE_HINT_L1_MS) nextLevel = 1;
      setIdleHintLevel(prev => (prev === nextLevel ? prev : nextLevel));
    }, 250);

    return () => clearInterval(tick);
  }, [
    sceneState?.phase,
    sceneState?.welcomeShown,
    isSymbolPopupOpen,
    revealConfig,
    showSceneCompletion
  ]);

  const hintClassName = idleHintLevel === 1
    ? 'hint'
    : idleHintLevel === 2
      ? 'hint-strong'
      : idleHintLevel >= 3
        ? 'hint-final'
        : '';

  useEffect(() => {
    if (idleHintLevel < 2) return;
    if (idleVoGateRef.current) return;

    let idleKey = null;
    if (sceneState?.phase === PHASES.INITIAL || sceneState?.phase === PHASES.ROCK_MOVING) idleKey = 'idleRock';
    if (sceneState?.phase === PHASES.REEDS_ACTIVE) idleKey = 'idleReeds';
    if (sceneState?.phase === PHASES.LOTUS_ACTIVE) idleKey = 'idleLotus';
    if (idleKey) speakPondPrompt(idleKey);
    idleVoGateRef.current = true;
  }, [idleHintLevel, sceneState?.phase, speakPondPrompt]);

  // Re-arm hints when phase/context changes.
  useEffect(() => {
    rearmIdleHints();
  }, [
    sceneState?.phase,
    sceneState?.welcomeShown,
    revealConfig,
    showSceneCompletion,
    rearmIdleHints
  ]);

  // ==================== RELOAD / RESUME LOGIC ====================
  // Runs once on mount — same pattern as Modak (empty deps, no isReload check).
  useEffect(() => {
    // NOTE: no isAudioOn guard here — this effect repairs STATE (reveal cards,
    // drag-drop seeding, completion screen), not just VO. Gating it on audio
    // soft-locked the scene for muted players reloading mid-phase.
    if (!sceneState?.welcomeShown) return;

    if (sceneState.phase === PHASES.INITIAL) {
      setRockHoldProgress(0);
      setReedsProgress(0);
      setWaterStage(0);
      return;
    }

    if (sceneState.phase === PHASES.ROCK_MOVING) {
      sceneActions.updateState({
        phase: PHASES.INITIAL,
        rockMoved: false
      });
      setRockHoldProgress(0);
      setReedsProgress(0);
      setWaterStage(0);
      return;
    }

    if (sceneState.phase === PHASES.REEDS_ACTIVE) {
      setRockHoldProgress(1);
      setReedsProgress(0);
      setWaterStage(1);
      return;
    }

    // 2. TRUNK SOLVED BUT CARD NOT YET SHOWN (rare mid-transition reload)
    if (sceneState.phase === PHASES.TRUNK_SOLVED) {
      setRockHoldProgress(1);
      setReedsProgress(1);
      setWaterStage(2);
      safeSetTimeout(() => {
        playChime();
        setRevealConfig({
          symbolId: 'trunk',
          symbolName: 'Trunk',
          affirmation: 'I can be strong and gentle.',
          symbolImage: symbolTrunkColored
        });
      }, 1200);
      return;
    }

    // 3. RESTORE TRUNK CARD FLIP
    if (sceneState.phase === PHASES.TRUNK_REVEAL) {
      setRockHoldProgress(1);
      setReedsProgress(1);
      setWaterStage(2);
      safeSetTimeout(() => {
        playChime();
        setRevealConfig({
          symbolId: 'trunk',
          symbolName: 'Trunk',
          affirmation: 'I can be strong and gentle.',
          symbolImage: symbolTrunkColored
        });
      }, 1200);
      return;
    }

    // 4. RESTORE LOTUS PRESS-HOLD PHASE — nothing to seed, target just needs
    // to render (handled by JSX reading sceneState.phase directly).
    if (sceneState.phase === PHASES.LOTUS_ACTIVE) {
      setRockHoldProgress(1);
      setReedsProgress(1);
      setWaterStage(2);
      return;
    }

    // 5. LOTUS BLOOMED BUT CARD NOT YET SHOWN
    if (sceneState.phase === PHASES.BLOOMED && !sceneState.completed) {
      setRockHoldProgress(1);
      setReedsProgress(1);
      setWaterStage(2);
      safeSetTimeout(() => {
        playChime();
        setRevealConfig({
          symbolId: 'lotus',
          symbolName: 'Lotus',
          affirmation: 'I can keep growing when things are hard.',
          symbolImage: symbolLotusColored
        });
      }, 1200);
      return;
    }
    // Defensive repair: if a stale save marks completed during lotus reveal phase,
    // clear it so reload resumes the card flow instead of treating scene as done.
    if (sceneState.phase === PHASES.BLOOMED && sceneState.completed) {
      sceneActions.updateState({
        completed: false,
        showingCompletionScreen: false,
        phase: PHASES.BLOOMED
      });
      safeSetTimeout(() => {
        playChime();
        setRevealConfig({
          symbolId: 'lotus',
          symbolName: 'Lotus',
          affirmation: 'I can keep growing when things are hard.',
          symbolImage: symbolLotusColored
        });
      }, 300);
      return;
    }

    // 6. RESTORE COMPLETION SCREEN
    if (sceneState.phase === PHASES.COMPLETE && !sceneState.showingCompletionScreen) {
      safeSetTimeout(() => setShowSceneCompletion(true), 500);
      return;
    }

  }, []); // Empty array — runs once on mount, same as Modak

  // Scene 2 resume/continue VO guard:
  // when entering with welcomeShown already true (mid-scene continue/reload),
  // replay the current phase prompt once so guidance never feels silent.
  useEffect(() => {
    if (!sceneState?.welcomeShown) return;
    if (resumePromptPlayedRef.current) return;
    if (showSceneCompletion || revealConfig || isSymbolPopupOpen) return;
    const promptKey = getPromptKeyForPhase();
    if (!promptKey || promptKey === 'opening') return;

    resumePromptPlayedRef.current = true;
    const timer = setTimeout(() => {
      resetIdleBaseline();
      speakPondPrompt(promptKey);
      lastAnnouncedPromptRef.current = promptKey;
    }, promptKey === 'rockRound' ? 850 : 500);
    return () => clearTimeout(timer);
  }, [
    isAudioOn,
    sceneState?.welcomeShown,
    showSceneCompletion,
    revealConfig,
    isSymbolPopupOpen,
    getPromptKeyForPhase,
    resetIdleBaseline,
    speakPondPrompt
  ]);

  // Completion message intentionally disabled for Pond (remove orange popup).

  const getNextDiscoveryText = (currentSymbol) => {
    const nextActions = { trunk: '🌸 Discover Lotus', lotus: '✨ End Scene' };
    return nextActions[currentSymbol] || '➡️ Continue';
  };

  const getPowerDescription = (symbolKey) => {
    const descriptions = {
      lotus: 'The lotus grows through muddy water and still blooms.\nIt reminds us that we can keep growing through difficult things.',
      trunk: "Ganesha's trunk can move something heavy or handle something tiny.\nIt reminds us to know when to use strength and when to be gentle."
    };
    return descriptions[symbolKey] || 'You unlocked a special power!';
  };

  // -- SymbolAutoReveal helpers -----------------------------------------------
  // Play power VO when the reveal card appears (Scene 1 parity).
  useEffect(() => {
    if (!revealConfig) return;
    if (!isAudioOn) return;
    const voMap = {
      lotus: 'lotusBloomPower',
      trunk: 'waterPathPower'
    };
    const voKey = voMap[revealConfig.symbolId];
    if (!voKey) return;
    const id = setTimeout(() => speakPondPrompt(voKey), 400);
    return () => clearTimeout(id);
  }, [revealConfig, isAudioOn, speakPondPrompt]);

  const getSidebarTarget = useCallback((symbolId) => {
    const el = document.getElementById(`sidebar-${symbolId}`);
    if (!el) return { x: 220, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2) - (window.innerWidth / 2),
      y: (r.top + r.height / 2) - (window.innerHeight / 2),
    };
  }, []);

  const triggerFireworks = () => {
    setShowSparkle('final-fireworks');
  };

  const persistPondCompletion = useCallback(() => {
    const profileId = localStorage.getItem('activeProfileId');
    if (!profileId) return;

    GameStateManager.saveGameState('symbol-mountain', 'pond', {
      completed: true,
      stars: 5,
      symbols: { lotus: true, trunk: true },
      phase: 'complete',
      timestamp: Date.now()
    });

    ProgressManager.updateSceneCompletion(profileId, 'symbol-mountain', 'pond', {
      completed: true,
      stars: 5,
      symbols: { lotus: true, trunk: true }
    });

    localStorage.removeItem(`temp_session_${profileId}_symbol-mountain_pond`);
    SimpleSceneManager.clearCurrentScene();
  }, []);

  const handleRevealComplete = (symbolId) => {
    setRevealConfig(null);

    if (symbolId === 'trunk') {
      // Update phase immediately — prevents reload handler re-triggering card during 950ms window
      sceneActions.updateState({ phase: PHASES.LOTUS_ACTIVE, currentFocus: 'lotus' });
      // discoveredSymbols delayed 950ms to protect sidebar bloom animation
      safeSetTimeout(() => {
        sceneActions.updateState({
          discoveredSymbols: { ...sceneState.discoveredSymbols, trunk: true }
        });
      }, 950);

    } else if (symbolId === 'lotus') {
      // Update phase immediately — prevents reload handler re-triggering card during 950ms window
      sceneActions.updateState({ phase: PHASES.COMPLETE, completed: false, showingCompletionScreen: false });
      // discoveredSymbols delayed 950ms to protect sidebar bloom animation
      safeSetTimeout(() => {
        sceneActions.updateState({ discoveredSymbols: { trunk: true, lotus: true } });
      }, 950);
      safeSetTimeout(() => triggerFireworks(), 2450);
    }
  };

  // -------------------------------------------------------------------------

  // ==================== V5 PHASE 1 — HOLD TO BLOOM ====================
  // Press and hold a lotus. A glow ring fills around it (1.5s for lotus 1 & 2,
  // 2s for lotus 3). Releasing early shrinks the glow at 2× speed; if the
  // child re-presses within 1s, hold resumes from current value. After 1s
  // grace, hold fully resets. No fail state, no reset on the lotus that's
  // already bloomed.

  // ==================== TRUNK GAME — STRENGTH THEN GENTLENESS ====================
  const completeRockMove = useCallback(() => {
    if (sceneStateRef.current?.rockMoved) return;
    sceneStateRef.current = {
      ...sceneStateRef.current,
      rockMoved: true,
      phase: PHASES.REEDS_ACTIVE
    };

    if (rockHoldRafRef.current) {
      cancelAnimationFrame(rockHoldRafRef.current);
      rockHoldRafRef.current = null;
    }
    rockHoldStartRef.current = null;

    playGlow();
    playChime();
    setRockHoldProgress(1);
    setWaterStage(1);

    sceneActions.updateState({
      rockMoved: true,
      phase: PHASES.REEDS_ACTIVE,
      progress: {
        percentage: 25,
        starsEarned: 0
      }
    });

    triggerMiniGesture('thumbsup', 'center', 1500);
    safeSetTimeout(() => {
      resetIdleBaseline();
      speakPondPrompt('reedsRound');
    }, WATER_TO_REEDS_MS);
  }, [
    playGlow,
    playChime,
    sceneActions,
    triggerMiniGesture,
    safeSetTimeout,
    resetIdleBaseline,
    speakPondPrompt
  ]);

  const handleRockHoldStart = useCallback((e) => {
    e.preventDefault?.();

    if (
      sceneState.phase !== PHASES.INITIAL &&
      sceneState.phase !== PHASES.ROCK_MOVING
    ) return;

    rearmIdleHints();
    stopSpokenVoice();
    if (rockHoldRafRef.current) {
      cancelAnimationFrame(rockHoldRafRef.current);
      rockHoldRafRef.current = null;
    }
    sceneActions.updateState({ phase: PHASES.ROCK_MOVING });
    rockHoldStartRef.current = performance.now();

    const tick = () => {
      if (!rockHoldStartRef.current) return;
      const elapsed = performance.now() - rockHoldStartRef.current;
      const progress = Math.min(elapsed / ROCK_HOLD_MS, 1);
      setRockHoldProgress(progress);

      if (progress >= 1) {
        completeRockMove();
        return;
      }

      rockHoldRafRef.current = requestAnimationFrame(tick);
    };

    rockHoldRafRef.current = requestAnimationFrame(tick);
  }, [
    sceneState.phase,
    sceneActions,
    completeRockMove,
    rearmIdleHints,
    stopSpokenVoice
  ]);

  const handleRockHoldEnd = useCallback(() => {
    if (sceneStateRef.current?.rockMoved) return;

    if (rockHoldRafRef.current) {
      cancelAnimationFrame(rockHoldRafRef.current);
      rockHoldRafRef.current = null;
    }
    rockHoldStartRef.current = null;
    setRockHoldProgress(prev => Math.max(0, prev - 0.18));
    sceneActions.updateState({ phase: PHASES.INITIAL });
  }, [sceneActions]);

  const completeReeds = useCallback(() => {
    if (sceneStateRef.current?.reedsParted) return;
    sceneStateRef.current = {
      ...sceneStateRef.current,
      reedsParted: true,
      streamSolved: true,
      phase: PHASES.TRUNK_SOLVED
    };

    setReedsDragActive(false);
    setReedsProgress(1);
    playGlow();
    playChime();
    setWaterStage(2);

    sceneActions.updateState({
      reedsParted: true,
      streamSolved: true,
      phase: PHASES.TRUNK_SOLVED,
      progress: {
        percentage: 50,
        starsEarned: 0
      }
    });

    safeSetTimeout(() => {
      setShowSparkle('lotus-wake');
      sceneActions.updateState({ lotusUpright: true });
      triggerMiniGesture('victory', 'center', 1800);
      playGlow();
    }, WATER_TO_POND_MS);

    safeSetTimeout(() => {
      setShowSparkle(null);
      sceneActions.updateState({ phase: PHASES.TRUNK_REVEAL });
      setRevealConfig({
        symbolId: 'trunk',
        symbolName: 'Trunk',
        affirmation: 'I can be strong and gentle.',
        symbolImage: symbolTrunkColored
      });
    }, WATER_TO_POND_MS + LOTUS_GLOW_MS);
  }, [
    playGlow,
    playChime,
    safeSetTimeout,
    sceneActions,
    triggerMiniGesture
  ]);

  const handleReedsPointerDown = useCallback((e) => {
    if (sceneState.phase !== PHASES.REEDS_ACTIVE) return;
    e.preventDefault?.();
    rearmIdleHints();
    stopSpokenVoice();
    setReedsDragActive(true);
    reedsStartXRef.current = e.clientX;
  }, [
    sceneState.phase,
    rearmIdleHints,
    stopSpokenVoice
  ]);

  const handleReedsPointerMove = useCallback((e) => {
    if (!reedsDragActive) return;
    if (reedsStartXRef.current == null) return;
    const distance = Math.abs(e.clientX - reedsStartXRef.current);
    const progress = Math.min(distance / REEDS_DRAG_DISTANCE, 1);
    setReedsProgress(progress);
  }, [reedsDragActive]);

  const handleReedsPointerUp = useCallback(() => {
    if (!reedsDragActive) return;
    setReedsDragActive(false);
    reedsStartXRef.current = null;

    if (reedsProgress >= 0.75) {
      completeReeds();
      return;
    }

    setReedsProgress(prev => prev * 0.65);
  }, [
    reedsDragActive,
    reedsProgress,
    completeReeds
  ]);
  // ==========================================================================================

  // ==================== V6 PHASE 2 (LOTUS, SECOND) — PRESS AND HOLD TO BLOOM ====================
  // Same forgiving-release feel as before, now driving a single lotus through
  // dormant → upright (already done by the Trunk phase) → bloomed.

  const completeLotusBloom = useCallback(() => {
    if (!sceneActions) return;
    playBloom();
    playChime();
    triggerMiniGesture('victory', 'center', 2500);
    sceneActions.updateState({
      lotusBloomed: true,
      phase: PHASES.BLOOMED,
      progress: { percentage: 100, starsEarned: 5 }
    });
    setShowSparkle('lotus-bloom');
    safeSetTimeout(() => setShowSparkle(null), 2000);

    // Give the child a clear moment to see the lotus actually bloom before
    // the reveal card covers the scene.
    safeSetTimeout(() => setRevealConfig({
      symbolId: 'lotus',
      symbolName: 'Lotus',
      affirmation: 'I can keep growing when things are hard.',
      symbolImage: symbolLotusColored
    }), 2400);
  }, [sceneActions, playBloom, playChime, triggerMiniGesture, safeSetTimeout]);

  const handleLotusHoldStart = () => {
    rearmIdleHints();
    if (progressiveHintRef.current?.hideHint) progressiveHintRef.current.hideHint();
    if (!sceneState || !sceneActions) return;
    if (sceneState.phase !== PHASES.LOTUS_ACTIVE) return;
    if (sceneState.lotusBloomed) return;

    if (holdReleaseRef.current) {
      cancelAnimationFrame(holdReleaseRef.current);
      holdReleaseRef.current = null;
    }
    if (holdResetTimerRef.current) {
      clearTimeout(holdResetTimerRef.current);
      holdResetTimerRef.current = null;
    }

    const startProgress = holdProgress; // resume from current value
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const added = elapsed / LOTUS_HOLD_MS;
      const next = Math.min(1, startProgress + added);
      setHoldProgress(next);

      if (next >= 1) {
        holdTimerRef.current = null;
        completeLotusBloom();
        setTimeout(() => setHoldProgress(0), 600);
        return;
      }
      holdTimerRef.current = requestAnimationFrame(tick);
    };

    holdTimerRef.current = requestAnimationFrame(tick);
  };

  const handleLotusHoldEnd = () => {
    if (!sceneState || sceneState.lotusBloomed) return;

    if (holdTimerRef.current) {
      cancelAnimationFrame(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    const decayDurationMs = LOTUS_HOLD_MS / HOLD_DECAY_MULTIPLIER;
    const startProgress = holdProgress;
    if (startProgress <= 0) return;

    const startTime = performance.now();
    const decayTick = (now) => {
      const elapsed = now - startTime;
      const shrinkRatio = elapsed / decayDurationMs;
      const next = Math.max(0, startProgress - shrinkRatio);
      setHoldProgress(next);

      if (next <= 0) {
        holdReleaseRef.current = null;
        return;
      }
      holdReleaseRef.current = requestAnimationFrame(decayTick);
    };
    holdReleaseRef.current = requestAnimationFrame(decayTick);

    holdResetTimerRef.current = setTimeout(() => {
      if (holdReleaseRef.current) {
        cancelAnimationFrame(holdReleaseRef.current);
        holdReleaseRef.current = null;
      }
      setHoldProgress(0);
      holdResetTimerRef.current = null;
    }, HOLD_RESET_GRACE_MS);
  };

  // Cleanup hold/drag timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) cancelAnimationFrame(holdTimerRef.current);
      if (holdReleaseRef.current) cancelAnimationFrame(holdReleaseRef.current);
      if (holdResetTimerRef.current) clearTimeout(holdResetTimerRef.current);
    };
  }, []);
  // ===============================================================================================

  const shouldEnableHints = () => {
    const disabledPhases = [PHASES.COMPLETE, PHASES.BLOOMED];
    return !disabledPhases.includes(sceneState?.phase);
  };

  const getHintConfigs = () => [
    {
      id: 'trunk-hint',
      message: 'Hold the rock, then gently part the reeds',
      position: { bottom: '60%', left: '30%', transform: 'translateX(-50%)' },
      condition: (sceneState) => sceneState?.phase === PHASES.INITIAL
    },
    {
      id: 'lotus-hint',
      message: 'Press and hold the lotus 🌸',
      position: { bottom: '60%', right: '20%', transform: 'translateX(50%)' },
      condition: (sceneState) => sceneState?.phase === PHASES.LOTUS_ACTIVE && !sceneState?.lotusBloomed
    }
  ];

  const getLotusImage = () => {
    if (sceneState?.lotusBloomed) return lotusBloomedImg;
    if (sceneState?.lotusUpright) return lotusUpright;
    return lotusDormant;
  };

  const isFinalCelebrationActive = showSparkle === 'final-fireworks' || showMandala || showSceneCompletion;

  // Fireworks completion handler (matches Modak-style fireworks swap)
  useEffect(() => {
    if (showSparkle !== 'final-fireworks') return;
    setFireworksFinished(false);
    const timer = setTimeout(() => {
      setShowSparkle(null);
      setFireworksFinished(true);
      persistPondCompletion();
      setShowMandala(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [persistPondCompletion, showSparkle]);

  // Keep completion UI sticky across tab switch/remount.
  useEffect(() => {
    if (sceneState?.showingCompletionScreen && !showSceneCompletion) {
      setShowSceneCompletion(true);
      setShowSparkle(null);
    }
  }, [sceneState?.showingCompletionScreen, showSceneCompletion]);

  if (!sceneState) {
    return <div className="loading">Loading scene state...</div>;
  }
  const isCompletionView = showSceneCompletion || sceneState.showingCompletionScreen || showMandala;
  const isFinalFireworksView = showSparkle === 'final-fireworks';

  // 1. WRAP IN GAMELAYOUT
  return (
    <GameLayout
      zoneId="symbol-mountain"
      helpConfig={pondHelpConfig}
      sceneState={sceneState}
      onHome={() => onNavigate?.('home')}
      onReplay={resetScene}
      isAudioOn={isAudioOn}
      onAudioToggle={toggleAudio}
      showMenu={false}
    >
      <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
        <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
          <div className="pond-scene-container">
            <HomeButton onNavigate={onNavigate} />
            <div
              className="pond-background"
              style={{ backgroundImage: `url(${trunkPondBg})` }}
              onContextMenu={(e) => e.preventDefault()}
            >
              {!isCompletionView && !isFinalFireworksView && (
                <>
              {POND_OVERLAY_MID ? (
                <div className="pond-bg-overlay pond-bg-overlay--mid" style={{ backgroundImage: `url(${POND_OVERLAY_MID})` }} aria-hidden="true" />
              ) : null}

              {/* REMOVE OLD MANUAL RENDERCOUNTER, UNIFIED HEADER IS HANDLED BELOW */}

              {/* UnifiedHeaderV2 disabled per request */}

              {sceneState.phase === PHASES.INITIAL && !sceneState.welcomeShown && (
                <OpeningModal
                  zoneId={zoneId}
                  sceneId={sceneId}
                  onStart={() => {
                    rearmIdleHints();
                    sceneActions.updateState({ welcomeShown: true });
                  }}
                  characterImg={ganeshaCharacter}
                  showButton={true}
                />
              )}

              <div
                className={`
                  pond-trunk-water-flow
                  pond-trunk-water-flow--${waterStage}
                `}
                aria-hidden="true"
              />

              <GestureDemo
                type="hold"
                from={{ x: 40, y: 51 }}
                active={
                  idleHintLevel >= 3 &&
                  (
                    sceneState.phase === PHASES.INITIAL ||
                    sceneState.phase === PHASES.ROCK_MOVING
                  ) &&
                  !sceneState.rockMoved
                }
                idleDelay={120}
                zIndex={28}
              />

              <div
                role="button"
                aria-label="Press and hold the heavy rock"
                className={`
                  pond-strength-rock-wrap
                  ${sceneState.rockMoved ? 'moved' : ''}
                  ${
                    (
                      sceneState.phase === PHASES.INITIAL ||
                      sceneState.phase === PHASES.ROCK_MOVING
                    )
                      ? hintClassName
                      : ''
                  }
                `}
                onPointerDown={handleRockHoldStart}
                onPointerUp={handleRockHoldEnd}
                onPointerLeave={handleRockHoldEnd}
                onPointerCancel={handleRockHoldEnd}
              >
                <img
                  src={trunkRock}
                  alt=""
                  aria-hidden="true"
                  className="pond-trunk-rock"
                  draggable={false}
                />

                {!sceneState.rockMoved && rockHoldProgress > 0 && (
                  <svg
                    viewBox="0 0 100 100"
                    className="pond-rock-strength-ring"
                    aria-hidden="true"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#FFD86B"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 * (1 - rockHoldProgress)}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                )}
              </div>

              <GestureDemo
                type="drag"
                from={REEDS_START_POINT}
                to={{ x: 61, y: 51 }}
                active={
                  idleHintLevel >= 3 &&
                  sceneState.phase === PHASES.REEDS_ACTIVE &&
                  !sceneState.reedsParted &&
                  !reedsDragActive
                }
                idleDelay={120}
                zIndex={28}
              />

              {sceneState.rockMoved && !sceneState.reedsParted && (
                <div
                  role="button"
                  aria-label="Gently part the soft reeds"
                  className={`
                    pond-trunk-reeds
                    ${sceneState.phase === PHASES.REEDS_ACTIVE ? hintClassName : ''}
                  `}
                  onPointerDown={handleReedsPointerDown}
                  onPointerMove={handleReedsPointerMove}
                  onPointerUp={handleReedsPointerUp}
                  onPointerCancel={handleReedsPointerUp}
                  onPointerLeave={handleReedsPointerUp}
                  style={{ '--reeds-progress': reedsProgress }}
                >
                  <img
                    src={trunkReedsLeft}
                    className="pond-reeds-half pond-reeds-half--left"
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                  />
                  <img
                    src={trunkReedsRight}
                    className="pond-reeds-half pond-reeds-half--right"
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                  />
                </div>
              )}

              {/* Lotus — dormant → upright (Trunk success) → bloomed (Lotus success) */}
              <GestureDemo
                type="hold"
                from={LOTUS_HOLD_POINT}
                active={
                  idleHintLevel >= 3 &&
                  sceneState.phase === PHASES.LOTUS_ACTIVE &&
                  !sceneState.lotusBloomed &&
                  holdProgress <= 0
                }
                idleDelay={120}
                zIndex={28}
              />

              <div
                className={`pond-trunk-lotus ${sceneState.phase === PHASES.LOTUS_ACTIVE && !sceneState.lotusBloomed ? hintClassName : ''}`}
              >
                {showSparkle === 'lotus-wake' && (
                  <div className="pond-lotus-wake-glow" aria-hidden="true">
                    <SparkleAnimation type="magic" count={18} color="#FFD86B" size={10} duration={LOTUS_GLOW_MS} fadeOut={true} area="full" />
                  </div>
                )}
                {sceneState.phase === PHASES.LOTUS_ACTIVE && !sceneState.lotusBloomed && holdProgress > 0 && (
                  <svg viewBox="0 0 100 100" className="pond-hold-ring" aria-hidden="true">
                    <circle
                      cx="50" cy="50" r="46" fill="none" stroke="#FFD86B" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 46}`}
                      strokeDashoffset={`${2 * Math.PI * 46 * (1 - holdProgress)}`}
                      transform="rotate(-90 50 50)"
                      style={{
                        filter: `drop-shadow(0 0 ${4 + holdProgress * 8}px rgba(255, 216, 107, ${0.5 + holdProgress * 0.4}))`,
                        transition: 'filter 0.1s linear',
                      }}
                    />
                  </svg>
                )}
                <div
                  role="button"
                  aria-label="Press and hold the lotus to let it bloom"
                  onPointerDown={(e) => {
                    e.preventDefault?.();
                    handleLotusHoldStart();
                  }}
                  onPointerUp={handleLotusHoldEnd}
                  onPointerLeave={handleLotusHoldEnd}
                  onPointerCancel={handleLotusHoldEnd}
                  className="pond-lotus-hold-target"
                  style={{ cursor: sceneState.phase === PHASES.LOTUS_ACTIVE && !sceneState.lotusBloomed ? 'pointer' : 'default' }}
                >
                  <img
                    src={getLotusImage()}
                    alt="Lotus"
                    className={`pond-lotus-image ${sceneState.lotusBloomed && showSparkle === 'lotus-bloom' ? 'pond-lotus-bloom-pop' : ''}`}
                    style={{
                      transform: sceneState.phase === PHASES.LOTUS_ACTIVE && !sceneState.lotusBloomed && holdProgress > 0
                        ? `scale(${1 + holdProgress * 0.06})`
                        : undefined,
                    }}
                    draggable={false}
                  />
                </div>
                {showSparkle === 'lotus-bloom' && (
                  <SparkleAnimation type="star" count={15} color="#ff9ebd" size={10} duration={2000} fadeOut={true} area="full" />
                )}
              </div>

              {/* Ganesha reflection in pond water — appears once the lotus blooms */}
              {sceneState.lotusBloomed && (
                <div className="pond-ganesha-reflection" aria-hidden="true">
                  <img
                    src={GANESHA_REFLECTION_IMAGE}
                    alt=""
                    className="pond-ganesha-reflection__img"
                  />
                </div>
              )}

              {POND_OVERLAY_FRONT ? (
                <div className="pond-bg-overlay pond-bg-overlay--front" style={{ backgroundImage: `url(${POND_OVERLAY_FRONT})` }} aria-hidden="true" />
              ) : null}

              {/* Symbol Learning Sparkles */}
              {showSparkle === 'lotus-to-sidebar' && (
                <div className="pond-symbol-stream pond-symbol-stream--lotus">
                  <SparkleAnimation type="stream" count={20} color="#4ECDC4" size={10} duration={3000} fadeOut={true} area="full" />
                </div>
              )}

              {showSparkle === 'trunk-to-sidebar' && (
                <div className="pond-symbol-stream pond-symbol-stream--trunk">
                  <SparkleAnimation type="stream" count={20} color="#FFD700" size={10} duration={3000} fadeOut={true} area="full" />
                </div>
              )}

              {/* ProgressiveHintSystem disabled per request */}

              {/* MINI GESTURE CUE — thumbs up / victory / ok */}
              {miniGesture.show && (
                <GaneshaGestureCue
                  key={miniGesture.key}
                  gestureType={miniGesture.type}
                  position={miniGesture.position}
                  anchor={miniGesture.anchor}
                  size={72}
                />
              )}
                </>
              )}
            </div>

            {/* Resume Popup */}
              {!isCompletionView && !isFinalFireworksView && showResumePopup && (
              <div className="pond-resume-popup">
                {resumeMessage}
              </div>
            )}

            {/* Fireworks (Modak-style) */}
            {!isCompletionView && (
              <FireworksCompletion
                show={showSparkle === 'final-fireworks'}
                showCard={false}
              />
            )}
            {!isCompletionView && (
              <CalmGoldenFireworks
                show={showSparkle === 'final-fireworks'}
                particles={14}
                duration={3500}
              />
            )}

            {showMandala && (
              <InnerMandala
                childName={profileName}
                symbolPetalStates={{
                  1: 'awakened',
                  2: 'awakened',
                  3: 'awakened',
                }}
                justEarnedPetals={[
                  { ring: 'middle', id: 4 },
                  { ring: 'middle', id: 5 },
                ]}
                earnedSymbols={[
                  { id: 'lotus', petalId: 4, ring: 'middle', image: symbolLotusColored },
                  { id: 'trunk', petalId: 5, ring: 'middle', image: symbolTrunkColored },
                ]}
                autoCloseMs={3000 + (2 * 950) + 2600}
                message="That power is growing inside you"
                onClose={() => {
                  setShowMandala(false);
                  setShowSceneCompletion(true);
                  // Persist so the sticky-completion effect and reload restore work.
                  sceneActions.updateState({ showingCompletionScreen: true });
                }}
              />
            )}

            {/* SYMBOL AUTO REVEAL */}
            {!isCompletionView && !isFinalFireworksView && revealConfig && (
              <SymbolAutoReveal
                key={revealConfig.symbolId}
                symbolId={revealConfig.symbolId}
                symbolName={revealConfig.symbolName}
                affirmation={revealConfig.affirmation}
                symbolImage={revealConfig.symbolImage}
                sidebarTargetRect={getSidebarTarget(revealConfig.symbolId)}
                enableTapHintPrompt={!sceneState?.discoveredSymbols?.trunk}
                onComplete={() => handleRevealComplete(revealConfig.symbolId)}
              />
            )}

            {/* Scene Completion */}
            {isCompletionView && !showMandala && (
              <SceneCompletionCelebration
                show={isCompletionView}
                zoneId={zoneId}
                sceneName="Pond Adventure"
                completionTitle={completionModalContent?.title}
                completionSubtitle={completionModalContent?.subtitle}
                sceneNumber={2}
                totalScenes={4}
                starsEarned={5}
                totalStars={5}
                discoveredSymbols={['trunk', 'lotus']}
                symbolImages={{
                  trunk: symbolTrunkColored,
                  lotus: symbolLotusColored
                }}
                symbolData={{
                  trunk: {
                    title: "Ganesha's Trunk",
                    description: "Ganesha's trunk can move something heavy or handle something tiny. It reminds us to know when to use strength and when to be gentle."
                  },
                  lotus: {
                    title: "Lotus",
                    description: "The lotus grows through muddy water and still blooms. It reminds us that we can keep growing through difficult things."
                  }
                }}
                nextSceneName="Temple Discovery"
                sceneId="pond"
                completionData={{
                  stars: 5,
                  symbols: { lotus: true, trunk: true },
                  completed: true,
                  totalStars: 5
                }}
                onComplete={onComplete}
                onReplay={() => {
                  setShowSceneCompletion(false);
                  resetScene();
                }}
                onContinue={() => {
                  persistPondCompletion();

                  setTimeout(() => {
                    SimpleSceneManager.setCurrentScene('symbol-mountain', 'temple', false, false);
                    onNavigate?.('scene-complete-continue');
                  }, 100);
                }}
              />
            )}

            {/* DELETE MANUAL TOCABOCA NAV - GameLayout HANDLES THIS NOW */}

            {/* BackToMapButton disabled per request */}

            {!isCompletionView && !isFinalFireworksView && (
              <CulturalCelebrationModal
                show={showCulturalCelebration}
                onClose={() => setShowCulturalCelebration(false)}
              />
            )}

            {!isCompletionView && !isFinalFireworksView && sceneState.welcomeShown && !isFinalCelebrationActive && (
              <SymbolSidebar
                discoveredSymbols={{
                  mooshika: true,
                  modak: true,
                  belly: true,
                  ...(sceneState.discoveredSymbols || {})
                }}
                onSymbolClick={(symbolId) => {
                  if (import.meta.env.DEV) console.log(`Sidebar symbol clicked: ${symbolId}`);
                }}
                onPopupOpen={() => {
                  setIsSymbolPopupOpen(true);
                  stopSpokenVoice();
                  resetIdleBaseline();
                }}
                onPopupClose={() => {
                  setIsSymbolPopupOpen(false);
                  resetIdleBaseline();
                  rearmIdleHints();
                  const replayKey = getPromptKeyForPhase();
                  if (replayKey) speakPondPrompt(replayKey);
                }}
              />
            )}

          </div>
        </MessageManager>
      </InteractionManager>

      <ZoneBadgeButton zoneId="symbol-mountain" onBack={() => onNavigate?.('zone-welcome')} />
      <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />
      <VOReplayButton
        onReplay={replayCurrentVoice}
        disabled={!isAudioOn || !getPromptKeyForPhase()}
      />
      {/* 3-2-1 resume countdown — renders on top of everything when child returns to tab */}
      <ResumeCountdown value={countdownValue} />
    </GameLayout>
  );
};

export default PondSceneSimplifiedV5;



