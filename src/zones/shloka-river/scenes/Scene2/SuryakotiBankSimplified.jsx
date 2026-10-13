import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGameSounds } from '../../../../lib/hooks/useGameSounds';
import { getVoiceScript } from '../../../../lib/config/content/voiceGuidance';
import './SuryakotiBankSimplified.css';

import SceneManager from '../../../../lib/components/scenes/SceneManager';
import useVoiceGuidance, { estimateSpeechMs } from '../../../../lib/hooks/useVoiceGuidance';
import useSidebarPause from '../../../../lib/hooks/useSidebarPause';
import { getLineCue } from '../../../../lib/config/content/voiceCues';
import { attachSpeechCue, startCueTimer } from '../../../../lib/utils/speechCue';
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

import SuryakotiGame from './components/SuryakotiGame';
import SamaprabhaGame from './components/SamaprabhaGame';

import ganeshaHeadphones from './assets/images/ganesha_with_headphones.webp';
import riverBackground from './assets/images/saurakoti-bg.webp';
import mooshikaCoach from './assets/images/mooshika-coach.webp';
import symbolVakratunda from '../../../meaning cave/assets/images/symbols/vakratunda-symbol.webp';
import symbolMahakaya from '../../../meaning cave/assets/images/symbols/mahakaya-symbol.webp';
import symbolSuryakoti from '../../../meaning cave/assets/images/symbols/suryakoti-symbol.webp';
import symbolSamaprabha from '../../../meaning cave/assets/images/symbols/samaprabha-symbol.webp';

const RESUME_DELAY_MS = 3000;
const sceneOuterPetalId = SCENE_TO_OUTER_PETAL_ID['Bring Back the Light!'];
const sceneOuterPetalIds = [sceneOuterPetalId - 1, sceneOuterPetalId];

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

const stripLeadingSpeechText = (text, leadingText) => {
  if (!text || !leadingText) return text;
  const pattern = new RegExp(`^\\s*${leadingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:.!,-]*\\s*`, 'i');
  return text.replace(pattern, '').trim();
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
    affirmation: 'I can make the light even.',
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
        finalCardCollected: false,
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
  const webSpeechRef = useRef(null); // in-flight scene-owned utterance, for mute-mid-line
  const audioEnabledRef = useRef(false);
  const suryaIntroPlayedRef = useRef(false);
  const samaClueCountRef = useRef(0);
  const samaIntroPlayedRef = useRef(false);
  const suryaInteractionStartedRef = useRef(false);
  const samaInteractionStartedRef = useRef(false);
  const [samaIntroComplete, setSamaIntroComplete] = useState(false);
  const [samaIntroVoStarted, setSamaIntroVoStarted] = useState(false);
  const [suryaIntroComplete, setSuryaIntroComplete] = useState(false);
  const [suryaIntroVoStarted, setSuryaIntroVoStarted] = useState(false);

  const { resetScene } = useSceneReset(sceneActions, zoneId, sceneId, getSceneResetConfig(sceneId));
  const completionModalContent = getCompletionModal(zoneId, sceneId);
  const { miniGesture, triggerMiniGesture } = useMiniGesture();

  const [showSparkle, setShowSparkle] = useState(null);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);
  const [showMandala, setShowMandala] = useState(false);
  const [revealConfig, setRevealConfig] = useState(null);
  // Words whose reveal card has already been started. The live completion timer, the pending-phase effect and
  // the reload restore can all fire for the same word; only the first may show the card (and its chime/voice).
  const revealStartedRef = useRef(new Set());
  const [showTapSparkles, setShowTapSparkles] = useState(false);
  const [showWordStar, setShowWordStar] = useState(false);
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
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  // Sidebar = true pause: tracks the in-flight VO so it can be replayed after the sidebar closes.
  const sidebarPause = useSidebarPause();

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
    muteVoicePlayback,
    playSilent,
    setVoiceVolume,
    playWord: playWordAudio,
    playSyllable,
    playSfx,
    setCurrentPhase,
    startIdleTimer,
    stopIdleTimer,
    playVoice: playHookVoice,
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

  // LEAVING the scene (zone badge / back / unmount): stop the line AND detach its callbacks first.
  // A cancelled utterance fires onerror, whose handler runs onEnded and carries the voice chain on to the
  // next line - which then spoke over Zone Welcome. (stopWebSpeech above is still used before speaking a
  // new line, where an interrupted line's callback firing is expected.)
  const abortWebSpeech = useCallback(() => {
    const w = webSpeechRef.current;
    webSpeechRef.current = null;
    if (w?.utterance) {
      w.utterance.onend = null;
      w.utterance.onerror = null;
    }
    try {
      speechSynthRef.current?.cancel();
    } catch {
      // no-op
    }
  }, []);

  const speakWebSpeech = useCallback((text, onEnded, onStart, cue) => {
    if (!text) {
      onEnded?.();
      return;
    }
    if (!audioEnabledRef.current) {
      // Muted: finish on a silent timer matching the line's length, not instantly,
      // so mute never skips a step (DECISIONS.md 2026-09-29).
      onStart?.();
      startCueTimer(text, cue); // muted: the hand still lands on the action word's estimated time
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
      utterance.onstart = () => onStart?.();
      attachSpeechCue(utterance, text, cue); // hand appears exactly when the action word is spoken
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

  const playGuidanceVoiceRaw = useCallback((key, onEnded, options = {}) => {
    // Stop both channels before speaking: playHookVoice already cancels Web
    // Speech internally, but speakWebSpeech only cancels its own utterance —
    // without this, a still-playing MP3 line keeps going under a new
    // Web-Speech line (same two-speech-source issue as Family Tree).
    stopVoice();
    stopWebSpeech();
    const webSpeechMap = {
      welcome: "The river is dark. Let’s bring back some light.",
      scene11_surya_intro: "Bunny can’t find home. Rub the glow to bring back the light.",
      scene11_surya_hint: "Keep rubbing.",
      surya_hint_rub: "Rub the glowing spot.",
      surya_hint_keep: "Keep rubbing.",
      surya_hint_almost: "Almost there!",
      scene11_surya_success: 'Suryakoti! You brought back the light and helped Bunny home.',
      scene11_sama_intro: 'Deer sees a strange shadow. Press and hold to look closely.',
      scene11_sama_hint: 'Press and hold on the shadow.',
      scene11_sama_find_another: 'Press and hold another part of the shadow.',
      scene11_sama_resume: 'Keep pressing and holding to look closely.',
      scene11_sama_hint_find: 'Look for another part of the shadow.',
      scene11_sama_hint_keep: 'Keep holding.',
      scene11_sama_reveal_branch: 'That part is just a branch.',
      scene11_sama_reveal_reeds: 'Those are just reeds and leaves.',
      scene11_sama_reveal_stump: 'That part is a tree stump.',
      scene11_sama_reveal_rocks: 'And those are just rocks and grass.',
      scene11_sama_done: 'Samaprabha! You looked closely and helped Deer feel safe.',
      sceneComplete: 'You brought back the light and saw what was really there.',
    };
    if (webSpeechMap[key]) {
      speakWebSpeech(stripLeadingSpeechText(webSpeechMap[key], options.stripLeadingText), onEnded, options.onStart, options.cue);
      return;
    }
    const script = getVoiceScript(zoneId, sceneId, key);
    if (script) {
      playHookVoice(key, onEnded, options);
      return;
    }
    onEnded?.();
  }, [playHookVoice, sceneId, speakWebSpeech, stopVoice, stopWebSpeech, zoneId]);

  const { playTracked, clearActive: clearActiveVoice } = sidebarPause;
  const playGuidanceVoice = useCallback((key, onEnded, options = {}) => {
    playTracked(
      'line',
      (done, overrides) => playGuidanceVoiceRaw(key, done, { ...options, ...overrides }),
      onEnded,
    );
  }, [playTracked, playGuidanceVoiceRaw]);

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
    // A deliberate stop is not a sidebar interruption — don't leave a stale replay entry.
    clearActiveVoice();
    stopVoice();
    stopWebSpeech();
  }, [clearActiveVoice, stopVoice, stopWebSpeech]);

  // Leaving the scene (zone badge): also detach the in-flight line's callbacks so its chain cannot continue
  // over Zone Welcome. NOT used for stopVoice handed to the games (a game taking over must still let the
  // scene's interrupted line finish its step).
  const abortAllVoice = useCallback(() => {
    clearActiveVoice();
    stopVoice();
    abortWebSpeech();
  }, [clearActiveVoice, stopVoice, abortWebSpeech]);

  // Beat = which game step we're on. Set during render (not in an effect) so a
  // clip started by a child effect this render is tagged with the current beat.
  sidebarPause.setBeat(String(sceneState?.phase));

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
  useEffect(() => () => abortWebSpeech(), [abortWebSpeech]);

  const getSidebarTarget = useCallback((symbolId) => {
    const el = getCollectionTarget(symbolId);
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
    sceneActions.updateState({
      phase: PHASES.COMPLETE,
      stars: 5,
      completed: true,
      progress: { percentage: 100, starsEarned: 5, completed: true },
    });
    persistCompletion();

    setShowSparkle('final-fireworks');
  }, [persistCompletion, sceneActions]);

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
  // Guarded to run once per mount (not on every live phase change) — otherwise
  // this races the live completion handler's own reveal trigger for the same
  // phase transition and both fire playChime()/setRevealConfig() (double SFX).
  const hasRestoredRevealRef = useRef(false);
  useEffect(() => {
    if (!sceneState || revealConfig) return;
    if (hasRestoredRevealRef.current) return;
    // Mark handled only when the timer FIRES: React StrictMode (dev) cleans up and re-runs this effect,
    // and a flag set up front would stop the second run from ever scheduling the card.
    let restoreTimer = null;
    const cleanup = () => window.clearTimeout(restoreTimer);

    const restoreReveal = (word) => {
      restoreTimer = window.setTimeout(() => {
        if (revealStartedRef.current.has(word)) return;
        revealStartedRef.current.add(word);
        hasRestoredRevealRef.current = true;
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
    if (sceneState.finalCardCollected && [PHASES.SAMAPRABHA_COMPLETE, PHASES.SAMAPRABHA_POWER].includes(sceneState.phase)) {
      sceneActions.updateState({ unlockedApps: { ...(sceneState.unlockedApps || {}), samaprabha: true } });
      restoreTimer = window.setTimeout(() => { hasRestoredRevealRef.current = true; handleAppDiscoveryCelebrate(); }, 600);
      return cleanup;
    }

    if ([PHASES.SURYAKOTI_COMPLETE, PHASES.SURYAKOTI_POWER].includes(sceneState.phase)) {
      restoreReveal('suryakoti');
      return cleanup;
    }

    if ([PHASES.SAMAPRABHA_COMPLETE, PHASES.SAMAPRABHA_POWER].includes(sceneState.phase)) {
      restoreReveal('samaprabha');
      return cleanup;
    }
    hasRestoredRevealRef.current = true; // nothing to restore
  }, [sceneState?.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRevealComplete = useCallback((symbolId) => {
    setRevealConfig(null);

    if (symbolId === 'suryakoti') {
      const appsNow = sceneState.unlockedApps || {};
      safeSetTimeout(() => {
        sceneActions.updateState({
          unlockedApps: { ...appsNow, suryakoti: true },
          phase: PHASES.SAMAPRABHA_GAME,
          cluesRevealed: 0,
          cluesVoDone: true,
        });
      }, 950);
      return;
    }

    if (symbolId === 'samaprabha') {
      const appsNow = sceneState.unlockedApps || {};
      sceneActions.checkpoint({ finalCardCollected: true });
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
    if (!nextOn) {
      muteVoicePlayback();
      muteWebSpeech();
    }
    toggleAudio();
  }, [isAudioOn, muteVoicePlayback, muteWebSpeech, setVoiceVolume, toggleAudio]);

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
        setSuryaIntroComplete(true);
        setSuryaIntroVoStarted(false);
        // "Played" is marked when the timer FIRES, not before it is scheduled: StrictMode (dev) cleans up
        // and re-runs this effect, and a flag set up front would stop the second run from ever speaking.
        const cancelIntro = safeSetTimeout(() => {
          suryaIntroPlayedRef.current = true;
          if (suryaInteractionStartedRef.current) { setSuryaIntroComplete(true); setSuryaIntroVoStarted(true); return; }
          playGuidanceVoice('scene11_surya_intro', () => {
            setSuryaIntroComplete(true);
            setSuryaIntroVoStarted(true);
            if (suryaInteractionStartedRef.current) return;
            startIdleTimer();
          }, { cue: getLineCue('scene11_surya_intro', () => setSuryaIntroVoStarted(true)) });
        }, 800);
        return () => cancelIntro?.();
      }
      setSuryaIntroComplete(true);
      setSuryaIntroVoStarted(true);
      startIdleTimer();
      return undefined;
    }

    return undefined;
  }, [isAudioOn, playGuidanceVoice, safeSetTimeout, sceneState?.phase, sceneState?.welcomeShown, setCurrentPhase, startIdleTimer]);

  useEffect(() => {
    if (sceneState?.phase !== PHASES.SURYAKOTI_GAME) {
      suryaIntroPlayedRef.current = false;
      suryaInteractionStartedRef.current = false;
      setSuryaIntroComplete(false);
      setSuryaIntroVoStarted(false);
    }
  }, [sceneState?.phase]);

  useEffect(() => {
    if (sceneState?.phase === PHASES.SAMAPRABHA_GAME) {
      setCurrentPhase('samaprabhaGame');
      // Resumed after revealed clues: skip the intro line; the game replays the last clue's line only if it was cut off.
      if ((sceneState.cluesRevealed || 0) > 0 && !samaIntroPlayedRef.current) {
        samaIntroPlayedRef.current = true;
        setSamaIntroComplete(true);
        setSamaIntroVoStarted(true);
        startIdleTimer();
        return undefined;
      }
      if (isAudioOn && !samaIntroPlayedRef.current) {
        setSamaIntroComplete(true);
        setSamaIntroVoStarted(false);
        // ~500ms wait: speech at the very first instant after mount is silent on Continue. Flag set when
        // the timer fires (StrictMode re-runs this effect).
        const introTimer = window.setTimeout(() => {
          samaIntroPlayedRef.current = true;
          playGuidanceVoice('scene11_sama_intro', () => {
            setSamaIntroComplete(true);
            setSamaIntroVoStarted(true);
            if (samaInteractionStartedRef.current) return;
            startIdleTimer();
          }, { cue: getLineCue('scene11_sama_intro', () => setSamaIntroVoStarted(true)) });
        }, 500);
        return () => window.clearTimeout(introTimer);
      }
      setSamaIntroComplete(true);
      setSamaIntroVoStarted(true);
      startIdleTimer();
      return undefined;
    }

    return undefined;
  }, [isAudioOn, playGuidanceVoice, safeSetTimeout, sceneState?.phase, setCurrentPhase, startIdleTimer]);

  useEffect(() => {
    if (sceneState?.phase !== PHASES.SAMAPRABHA_GAME) {
      samaIntroPlayedRef.current = false;
      samaInteractionStartedRef.current = false;
      setSamaIntroComplete(false);
      setSamaIntroVoStarted(false);
    }
  }, [sceneState?.phase]);

  const handlePhaseComplete = useCallback((word) => {
    safeSetTimeout(() => {
      triggerMiniGesture('blessing', 'center', 2500);
      setShowWordStar(true);
      safeSetTimeout(() => setShowWordStar(false), 1500);
      stopIdleTimer();
      setCurrentPhase(null);

      const chantKey = word === 'suryakoti' ? 'suryakoti-chant' : 'samaprabha-chant';
      sceneActions.updateState({
        learnedWords: { ...(sceneState.learnedWords || {}), [word]: true },
        chantedVerses: { ...(sceneState.chantedVerses || {}), [chantKey]: true },
        phase: word === 'suryakoti' ? PHASES.SURYAKOTI_COMPLETE : PHASES.SAMAPRABHA_COMPLETE,
      });

      setShowSparkle(`${word}-celebration`);
        if (revealStartedRef.current.has(word)) return;
        revealStartedRef.current.add(word);

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
      }, isAudioOn ? 2000 : 1500);
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

  useEffect(() => {
    if (!sceneState || revealConfig) return undefined;

    const isSuryakotiPending =
      [PHASES.SURYAKOTI_COMPLETE, PHASES.SURYAKOTI_POWER].includes(sceneState.phase);
    const isSamaprabhaPending =
      [PHASES.SAMAPRABHA_COMPLETE, PHASES.SAMAPRABHA_POWER].includes(sceneState.phase) &&
      !sceneState.finalCardCollected;
    const word = isSuryakotiPending ? 'suryakoti' : isSamaprabhaPending ? 'samaprabha' : null;

    if (!word) return undefined;
      if (revealStartedRef.current.has(word)) return;
      revealStartedRef.current.add(word);

    const timer = window.setTimeout(() => {
      const discoveryData = getDiscoveryContent(zoneId, sceneId, word);
      playChime();
      setShowSparkle(null);
      setRevealConfig({
        symbolId: word,
        symbolImage: powerConfig[word].image,
        symbolName: discoveryData?.title || powerConfig[word].name,
        affirmation: discoveryData?.affirmation || powerConfig[word].affirmation,
        sidebarTarget: getSidebarTarget(word),
      });

      if (sceneState.phase === PHASES.SURYAKOTI_COMPLETE) {
        sceneActions.updateState({ phase: PHASES.SURYAKOTI_POWER });
      } else if (sceneState.phase === PHASES.SAMAPRABHA_COMPLETE) {
        sceneActions.updateState({ phase: PHASES.SAMAPRABHA_POWER });
      }
    }, 1800);

    return () => window.clearTimeout(timer);
    // Depend on the two values the effect actually reads, NOT on the whole sceneState / sceneActions
    // objects: those are new on every scene update, which kept cancelling this 1.8s timer so the card
    // never showed (see docs/KNOWN_PITFALLS.md, "unstable effect dependencies").
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    revealConfig,
    sceneState?.phase,
    sceneState?.finalCardCollected,
    sceneId,
    zoneId,
  ]);

  const handleMicroWin = useCallback(() => {
    setSparklePos(lastPointRef.current);
    setShowTapSparkles(true);
    safeSetTimeout(() => setShowTapSparkles(false), 1600);
  }, [safeSetTimeout]);

  // Stable identity for SceneCompletionCelebration's completionData prop —
  // an inline object literal here would recreate on every render and re-fire
  // that component's save-on-show effect in a loop while showing.
  const completionData = useMemo(() => ({
    stars: 5,
    syllables: sceneState?.learnedSyllables,
    words: sceneState?.learnedWords,
    completed: true
  }), [sceneState?.learnedSyllables, sceneState?.learnedWords]);

  if (!sceneState) return <div className="loading">Loading...</div>;

  return (
    <InteractionManager sceneState={sceneState} sceneActions={sceneActions}>
      <MessageManager messages={[]} sceneState={sceneState} sceneActions={sceneActions}>
        <div className="suryakoti-simplified-container">
          {!(showSparkle === 'final-fireworks' || showMandala) && (
            <ZoneBadgeButton variant="gameplay" zoneId="shloka-river" onBack={() => { abortAllVoice(); onNavigate?.('zone-welcome'); }} />
          )}
          {/* [per-scene mute removed 2026-10-09] <AudioToggle variant="gameplay" isAudioOn={isAudioOn} onToggle={handleAudioToggle} /> */}
          <VOReplayButton variant="gameplay" onReplay={replayCurrentVoice} disabled={!isAudioOn} />
          <ResumeCountdown value={countdownValue} />

          <div className="suryakoti-river-background" ref={fxBgRef} onPointerDownCapture={recordPoint} style={{ backgroundImage: `url(${riverBackground})` }}>
            {!showSceneCompletion && (
              <>
                <SuryakotiGame
                  isActive={sceneState.phase === PHASES.SURYAKOTI_GAME}
                  introComplete={suryaIntroComplete}
                  introVoStarted={suryaIntroVoStarted}
                  hideElements={!!revealConfig}
                  onMicroWin={handleMicroWin}
                  onPhaseComplete={() => handlePhaseComplete('suryakoti')}
                  onGameComplete={() => {}}
                  onFirstInteraction={() => {
                    suryaInteractionStartedRef.current = true;
                    setSuryaIntroComplete(true);
                    stopAllVoice();
                  }}
                  voiceGuidance={{
                    playVoice: playGuidanceVoice,
                    playWord: (word, onEnded) => playTracked('word', (done) => playWordAudio(word, done), onEnded),
                    playSyllable: (syllable, onEnded) => {
                      stopAllVoice();
                      playTracked('syllable', (done) => playSyllable('suryakoti', syllable, done), onEnded);
                    },
                    stopVoice: stopAllVoice,
                  }}
                  isPaused={isRecorderOpen || sidebarPause.isSidebarPaused}
                  isSidebarOpen={isRecorderOpen}
                />

                <SamaprabhaGame
                  isActive={sceneState.phase === PHASES.SAMAPRABHA_GAME}
                  introComplete={samaIntroComplete}
                  introVoStarted={samaIntroVoStarted}
                  hideElements={!!revealConfig}
                  onMicroWin={handleMicroWin}
                  initialClues={sceneState.cluesRevealed || 0}
                  initialClueVoDone={sceneState.cluesVoDone !== false}
                  onBeatComplete={(n, voDone) => {
                    samaClueCountRef.current = n;
                    sceneActions.checkpoint({ cluesRevealed: n, cluesVoDone: voDone });
                  }}
                  onClueVoDone={(n) => {
                    // Ignore a late line from an earlier clue once the child has already revealed the next one.
                    if ((samaClueCountRef.current || sceneState.cluesRevealed || 0) === n) sceneActions.checkpoint({ cluesVoDone: true });
                  }}
                  onPhaseComplete={() => handlePhaseComplete('samaprabha')}
                  onGameComplete={() => {}}
                  onFirstInteraction={() => {
                    samaInteractionStartedRef.current = true;
                    stopAllVoice();
                  }}
                  voiceGuidance={{
                    playVoice: playGuidanceVoice,
                    playWord: (word, onEnded) => playTracked('word', (done) => playWordAudio(word, done), onEnded),
                    playSyllable: (syllable, onEnded) => {
                      stopAllVoice();
                      playTracked('syllable', (done) => playSyllable('samaprabha', syllable, done), onEnded);
                    },
                    stopVoice: stopAllVoice,
                  }}
                  isPaused={isRecorderOpen || sidebarPause.isSidebarPaused}
                  isSidebarOpen={isRecorderOpen}
                />

                {showWordStar && (
                  <div className="suryakoti-word-star">
                    <SparkleAnimation type="star" count={20} color="#FFD54F" size={14} duration={1500} area="full" />
                  </div>
                )}

                {showTapSparkles && (
                  <div className="suryakoti-tap-sparkles" style={sparklePos ? { left: `${sparklePos.x}%`, top: `${sparklePos.y}%`, width: '32%', height: '32%', right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)' } : undefined}>
                    <SparkleAnimation
                      type="dust"
                      count={22}
                      color="#FFD54F"
                      size={5}
                      duration={1600}
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
                        if ([PHASES.SURYAKOTI_GAME, PHASES.SAMAPRABHA_GAME].includes(sceneState.phase)) sidebarPause.beginPause();
                        // Re-time the teaching hand to the replayed intro's action word (only while the child
                        // hasn't started playing).
                        if (!suryaInteractionStartedRef.current && sceneState.phase === PHASES.SURYAKOTI_GAME) setSuryaIntroVoStarted(false);
                        if (!samaInteractionStartedRef.current && sceneState.phase === PHASES.SAMAPRABHA_GAME) setSamaIntroVoStarted(false);
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
                        sidebarPause.endPause();
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
                      { id: 'suryakoti', petalId: 3, ring: 'outer', image: symbolSuryakoti },
                      { id: 'samaprabha', petalId: 4, ring: 'outer', image: symbolSamaprabha },
                    ]}
                    waitForVoice
                    onEarnedPetalReveal={(earnedPetal, _index, done) => {
                      const symbolByPetal = {
                        3: 'suryakoti',
                        4: 'samaprabha',
                      };
                      const lines = {
                        suryakoti: 'You found hope and brought back the light.',
                        samaprabha: 'You looked closely and saw what was really there.',
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
                  sceneActions.updateState({
                    welcomeShown: true,
                    phase: PHASES.SURYAKOTI_GAME,
                    cluesRevealed: 0,
                    cluesVoDone: true,
                  });
                }}
                characterImg={ganeshaHeadphones}
                showButton={openingButtonVisible}
              />
            )}

            <SceneCompletionCelebration
              show={showSceneCompletion && !showMandala}
              zoneId={zoneId}
              sceneName="Bring Back the Light!"
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
              nextSceneName="Clear the Way Together!"
              sceneId="suryakoti-bank"
              completionData={completionData}
              onComplete={() => onNavigate?.('zone-welcome')}
              onReplay={() => {
                clearAllTimeouts();
                stopAllVoice();
                revealStartedRef.current.clear();
                setShowSceneCompletion(false);
                setShowMandala(false);
                setRevealConfig(null);
                setShowSparkle(null);
                setOpeningButtonVisible(true);
                resetScene();
              }}
              onContinue={() => {
                stopAllVoice();
                onNavigate?.('scene-complete-continue');
              }}
            />

            {/* ProgressiveHintSystem disabled per request */}
          </div>
        </div>
      </MessageManager>
    </InteractionManager>
  );
};

export default SuryakotiBankSimplified;
