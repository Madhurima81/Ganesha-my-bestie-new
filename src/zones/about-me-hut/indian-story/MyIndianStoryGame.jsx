import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MyIndianStoryGame.css';
import '../../shared/components/OpeningModal.css';
import SceneCompletionCelebration from '../../../lib/components/celebration/SceneCompletionCelebration';
import AboutMeComparisonCard from '../components/AboutMeComparisonCard';
import GameStateManager from '../../../lib/services/GameStateManager';
import { useGaneshaVoice } from '../../../lib/hooks/useGaneshaVoice';
import { useGameSounds } from '../../../lib/hooks/useGameSounds';
import useVoiceGuidance from '../../../lib/hooks/useVoiceGuidance';
import usePauseAwareTimeout from '../../../lib/hooks/usePauseAwareTimeout';
import useResumeCountdown from '../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../lib/components/feedback/ResumeCountdown';
import HomeButton from '../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../lib/components/ui/AudioToggle/AudioToggle';
import ZoneBadgeButton from '../../../lib/components/navigation/ZoneBadgeButton';
import useAudioPreference from '../../../lib/hooks/useAudioPreference';
import StoryProgressHeader from '../components/StoryProgressHeader';
import bgImage from './assets/images/name_background.webp';
import babyGaneshaImg from '/images/ganesha-final-new.svg';
import OpeningModal from '../../shared/components/OpeningModal';
import SceneManager from '../../../lib/components/scenes/SceneManager';
import storyHouseIcon from './assets/images/house-icon.png';
import storyLanguageIcon from './assets/images/language-icon.png';
import storyFestivalIcon from './assets/images/festival-icon.png';

// ─── PHASE 1: NEW IMPORTS ─────────────────────────────────────────
import FreeDraggableItem from '../../../lib/components/interactive/FreeDraggableItem';
import SparkleAnimation from '../../../lib/components/animation/SparkleAnimation';
import indiaMapImage from './assets/images/ganeshaplace/india-map.png';
import mglass from './assets/images/ganeshaplace/mglass.png';
import mumbaiIcon from './assets/images/ganeshaplace/mumbai.png';
import varansiIcon from './assets/images/ganeshaplace/Varanasi.png';
import tamilNaduIcon from './assets/images/ganeshaplace/TamilNadu.png';

// ─── PHASE 2: REGION ICONS ────────────────────────────────────────
import northIcon from './assets/images/ganeshaplace/north.png';
import northEastIcon from './assets/images/ganeshaplace/north-east.png';
import westIcon from './assets/images/ganeshaplace/west.png';
import centralIcon from './assets/images/ganeshaplace/central.png';
import eastIcon from './assets/images/ganeshaplace/east.png';
import southIcon from './assets/images/ganeshaplace/south.png';
import desertIcon from './assets/images/ganeshaplace/dessert.png';

// ─── PHASE 3: LANGUAGE ICONS & PLAY BUTTON ────────────────────────
import hindiLangIcon from './assets/images/languages/hindi.png';
import tamilLangIcon from './assets/images/languages/Tamil.png';
import sanskritLangIcon from './assets/images/languages/Sanskrit.png';
import teluguLangIcon from './assets/images/languages/Telugu.png';
import marathiLangIcon from './assets/images/languages/Marathi.png';
import gujaratiLangIcon from './assets/images/languages/Gujarati.png';
import bengaliLangIcon from './assets/images/languages/Bengali.png';
import kannadaLangIcon from './assets/images/languages/Kannada.png';
import malayalamLangIcon from './assets/images/languages/malyalam.png';
import punjabiLangIcon from './assets/images/languages/Punjabi.png';
import englishLangIcon from './assets/images/languages/English.png';
import otherLangIcon from './assets/images/languages/otherlanguage.png';
import playLangIcon from './assets/images/languages/play-language.png';

// ─── PHASE 4: FESTIVAL ICONS ──────────────────────────────────────
import pongalIcon from './assets/images/festivals/pongal.png';
import holiIcon from './assets/images/festivals/holi.png';
import janmashtamiIcon from './assets/images/festivals/janmashtami.png';
import chaturthiIcon from './assets/images/festivals/chaturthi.png';
import navratriIcon from './assets/images/festivals/sakranti.png';
import diwaliIcon from './assets/images/festivals/diwali.png';
import onamIcon from './assets/images/festivals/onam.png';
import eidIcon from './assets/images/festivals/eid.png';
import christmasIcon from './assets/images/festivals/xmas.png';
import durga_pujaIcon from './assets/images/festivals/durgapuja.png';
import dussehra_Icon from './assets/images/festivals/dussehra.png';
import rakhi_Icon from './assets/images/festivals/rakhi.png';
import modakImage from './assets/images/festivals/modak.png';

// ─── STEP CONSTANTS ───────────────────────────────────────────────
const STEPS = {
  OPENING: 'opening',
  GANESHA_HOME: 'ganesha_home',        // Phase 1
  CHILD_HOME: 'child_home',            // Phase 2
  LANGUAGE_GANESHA: 'language_ganesha', // Phase 3: Guess Ganesha's language
  LANGUAGE_CHILD: 'language_child',     // Phase 4: Child chooses their languages
  FESTIVALS_GANESHA: 'festivals_ganesha', // Phase 5: Guess Ganesha's festival
  FESTIVALS_CHILD: 'festivals_child',   // Phase 6: Child chooses their festivals
  ORIGIN_CARD: 'origin_card',           // Phase 7: Story origin card
  COMPLETE: 'complete',
};

const STORAGE_KEY = 'gmb_indian_story';
const RESUME_DELAY_MS = 3000;
const OPENING_VO_VOLUME = 0.55;
const STEP_VO_DEDUPE_MS = 5000;
const RECENT_STEP_VO = new Map();

const wasStepVoSpokenRecently = (key) => {
  const now = Date.now();
  const lastSpokenAt = RECENT_STEP_VO.get(key) || 0;
  RECENT_STEP_VO.set(key, now);
  return now - lastSpokenAt < STEP_VO_DEDUPE_MS;
};
const RESUMABLE_STEPS = new Set([
  STEPS.GANESHA_HOME,
  STEPS.CHILD_HOME,
  STEPS.LANGUAGE_GANESHA,
  STEPS.LANGUAGE_CHILD,
  STEPS.FESTIVALS_GANESHA,
  STEPS.FESTIVALS_CHILD,
  STEPS.ORIGIN_CARD,
]);

// ─── DATA ─────────────────────────────────────────────────────────
const REGION_ICONS = {
  north: northIcon,
  northwest: westIcon,
  west: westIcon,
  central: centralIcon,
  east: eastIcon,
  northeast: northEastIcon,
  south: southIcon,
  kailash: null,
  other: null,
};

const INDIA_REGIONS = [
  { id: 'north',     label: 'North India',                   states: 'Punjab, Haryana, UP, Delhi',              emoji: '??', icon: northIcon,     color: '#7B9FD4', mapTop: '18%', mapLeft: '32%', ganeshaFact: 'In Varanasi, my name echoes across the ghats every morning! ??' },
  { id: 'west',      label: 'West India',                    states: 'Maharashtra, Goa',                        emoji: '??', icon: westIcon,      color: '#FF9933', mapTop: '52%', mapLeft: '20%', ganeshaFact: 'Mumbai\'s Siddhivinayak temple is one of my most beloved homes! ??' },
  { id: 'central',   label: 'Central India',                 states: 'MP, Chhattisgarh',                        emoji: '??', icon: centralIcon,   color: '#5BA85A', mapTop: '45%', mapLeft: '38%', ganeshaFact: 'The forests here are full of my mouse Mushika\'s friends! ??' },
  { id: 'east',      label: 'East India',                    states: 'West Bengal, Odisha, Jharkhand, Bihar',   emoji: '??', icon: eastIcon,      color: '#4A9BB5', mapTop: '48%', mapLeft: '62%', ganeshaFact: 'In Kolkata, Durga Puja celebrations are so grand � I always visit! ??' },
  { id: 'northeast', label: 'Northeast India',               states: 'Assam, Meghalaya, Manipur, & more',       emoji: '??', icon: northEastIcon, color: '#B565A7', mapTop: '30%', mapLeft: '77%', ganeshaFact: 'The tea gardens here are magical � even I stop for a cup! ?' },
  { id: 'south',     label: 'South India',                   states: 'Tamil Nadu, Kerala, Karnataka, Telangana', emoji: '??', icon: southIcon,     color: '#2E7D32', mapTop: '70%', mapLeft: '32%', ganeshaFact: 'In Tamil Nadu, I am called Pillaiyar � the noble child! ??' },
  { id: 'kailash',   label: 'Mount Kailash! ???',            states: 'Where Amma & Appa live!',                  emoji: '???', icon: desertIcon,    color: '#5C6BC0', mapTop: '8%',  mapLeft: '42%', ganeshaFact: 'KAILASH?! That\'s where my Amma and Appa live! But where does YOUR family live on Earth?', isKailash: true },
  { id: 'other',     label: 'Outside India',                 states: 'Outside India or multiple states',         emoji: '??', icon: null,           color: '#888', mapTop: '70%', mapLeft: '76%', ganeshaFact: 'Wherever your family is from, India lives in your heart! ??' },
];

const LANGUAGES = [
  { id: 'hindi',      label: 'Hindi',      script: 'हिंदी',      icon: hindiLangIcon,      color: '#FF9933' },
  { id: 'tamil',      label: 'Tamil',      script: 'தமிழ்',     icon: tamilLangIcon,      color: '#E91E63' },
  { id: 'telugu',     label: 'Telugu',     script: 'తెలుగు',    icon: teluguLangIcon,     color: '#9C27B0' },
  { id: 'marathi',    label: 'Marathi',    script: 'मराठी',     icon: marathiLangIcon,    color: '#FF5722' },
  { id: 'gujarati',   label: 'Gujarati',   script: 'ગુજરાતી',   icon: gujaratiLangIcon,   color: '#FF9800' },
  { id: 'bengali',    label: 'Bengali',    script: 'বাংলা',     icon: bengaliLangIcon,    color: '#2196F3' },
  { id: 'kannada',    label: 'Kannada',    script: 'ಕನ್ನಡ',     icon: kannadaLangIcon,    color: '#4CAF50' },
  { id: 'malayalam',  label: 'Malayalam',  script: 'മലയാളം',   icon: malayalamLangIcon,  color: '#00BCD4' },
  { id: 'punjabi',    label: 'Punjabi',    script: 'ਪੰਜਾਬੀ',    icon: punjabiLangIcon,    color: '#8BC34A' },
  { id: 'sanskrit',   label: 'Sanskrit',   script: 'संस्कृत',    icon: sanskritLangIcon,   color: '#FFD700' },
  { id: 'english',    label: 'English',    script: 'English',    icon: englishLangIcon,    color: '#795548' },
  { id: 'other',      label: 'Other',      script: '🌍',        icon: otherLangIcon,      color: '#9E9E9E' },
];

const FESTIVALS = [
  { id: 'pongal',        label: 'Pongal',            emoji: '🌾', icon: pongalIcon,          season: 'winter', seasonLabel: 'Winter',  angle: 30,  ganeshaReact: 'Pongal! The harvest festival! 🌾', guessOption: true },
  { id: 'holi',          label: 'Holi',              emoji: '🎨', icon: holiIcon,            season: 'spring', seasonLabel: 'Spring',  angle: 60,  ganeshaReact: 'Holi! The festival of colors! 🎨', guessOption: true },
  { id: 'janmashtami',   label: 'Janmashtami',       emoji: '🎭', icon: janmashtamiIcon,     season: 'summer', seasonLabel: 'Summer',  angle: 120, ganeshaReact: 'Janmashtami! My friend Krishna\'s birthday! 🎭', guessOption: true },
  { id: 'ganesh',        label: 'Ganesh Chaturthi',  emoji: '🎉', icon: chaturthiIcon,       season: 'autumn', seasonLabel: 'Autumn',  angle: 180, ganeshaReact: 'Ganesh Chaturthi! MY festival! 🎉', guessOption: true, isGanesha: true },
  { id: 'durga_puja',    label: 'Durga Puja',        emoji: '⚔️', icon: durga_pujaIcon,      season: 'autumn', seasonLabel: 'Autumn',  angle: 155, ganeshaReact: 'Durga Puja celebrations are grand and joyful! 🎊', guessOption: false },
  { id: 'diwali',        label: 'Diwali',            emoji: '💡', icon: diwaliIcon,          season: 'autumn', seasonLabel: 'Autumn',  angle: 210, ganeshaReact: 'Diwali! The festival of lights! 💡', guessOption: false },
  { id: 'navratri',      label: 'Navratri',          emoji: '🎭', icon: navratriIcon,        season: 'autumn', seasonLabel: 'Autumn',  angle: 170, ganeshaReact: 'Navratri! Nine nights of celebration! 🎭', guessOption: false },
  { id: 'onam',          label: 'Onam',              emoji: '🌺', icon: onamIcon,            season: 'summer', seasonLabel: 'Summer',  angle: 135, ganeshaReact: 'Onam! Kerala\'s beautiful harvest festival! 🌺', guessOption: false },
  { id: 'eid',           label: 'Eid',               emoji: '🌙', icon: eidIcon,             season: 'spring', seasonLabel: 'Spring',  angle: 45,  ganeshaReact: 'Eid! A time of joy and togetherness! 🌙', guessOption: false },
  { id: 'christmas',     label: 'Christmas',         emoji: '🎄', icon: christmasIcon,       season: 'winter', seasonLabel: 'Winter',  angle: 0,   ganeshaReact: 'Christmas! A festival of love and lights! 🎄', guessOption: false },
  { id: 'dussehra',      label: 'Dussehra',          emoji: '🏹', icon: dussehra_Icon,       season: 'autumn', seasonLabel: 'Autumn',  angle: 165, ganeshaReact: 'Dussehra! Victory over evil! 🏹', guessOption: false },
  { id: 'rakhi',         label: 'Raksha Bandhan',    emoji: '🎀', icon: rakhi_Icon,          season: 'summer', seasonLabel: 'Summer',  angle: 140, ganeshaReact: 'Raksha Bandhan! A celebration of love! 🎀', guessOption: false },
];

// ─── LOOKUP MAPS (O(1) instead of O(n) .find()) ─────────────────────
const FESTIVAL_MAP = Object.fromEntries(FESTIVALS.map(f => [f.id, f]));
const LANGUAGE_MAP = Object.fromEntries(LANGUAGES.map(l => [l.id, l]));

// Common Festivals (top row - 4 cards)
const COMMON_FESTIVALS = [
  FESTIVAL_MAP['diwali'],
  FESTIVAL_MAP['holi'],
  FESTIVAL_MAP['ganesh'],
  FESTIVAL_MAP['navratri'],
].filter(Boolean);

// Other Festivals (bottom grid - 8 cards)
const OTHER_FESTIVALS = [
  FESTIVAL_MAP['pongal'],
  FESTIVAL_MAP['onam'],
  FESTIVAL_MAP['janmashtami'],
  FESTIVAL_MAP['durga_puja'],
  FESTIVAL_MAP['dussehra'],
  FESTIVAL_MAP['eid'],
  FESTIVAL_MAP['christmas'],
  FESTIVAL_MAP['rakhi'],
].filter(Boolean);

const FESTIVAL_GUESS_CARDS = [
  FESTIVAL_MAP['pongal'],
  FESTIVAL_MAP['holi'],
  FESTIVAL_MAP['janmashtami'],
  FESTIVAL_MAP['ganesh'],
  FESTIVAL_MAP['diwali'],
].filter(Boolean);

const PHASE1_LOCATIONS = [
  { name: 'Varanasi', icon: varansiIcon, x: 49, y: 34 },
  { name: 'Mumbai', icon: mumbaiIcon, x: 31, y: 54 },
  { name: 'Tamil Nadu', icon: tamilNaduIcon, x: 45, y: 80 },
];

const HEART_POSITIONS = [
  { top: '20%', left: '15%' },
  { top: '35%', left: '80%' },
  { top: '65%', left: '25%' },
  { top: '75%', left: '70%' },
  { top: '50%', left: '50%' },
];

const GANESHA_SPOTS = [
  { name: 'Varanasi Ghats', icon: varansiIcon, fact: 'In Varanasi, my name echoes across the ghats every morning! ??' },
  { name: 'Mumbai Temple', icon: mumbaiIcon, fact: 'Siddhivinayak temple in Mumbai is one of my most beloved homes! ??' },
  { name: 'Tamil Nadu Shrine', icon: tamilNaduIcon, fact: 'In Tamil Nadu, I am called Pillaiyar � the noble child! ??' },
];

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

// =========================================================
// 1. MAIN WRAPPER
// =========================================================
export default function MyIndianStoryGame({ onComplete, onBack, onNavigate, childName = 'friend', childAge = 8, zoneId = 'about-me-hut', sceneId = 'my-indian-story' }) {
  return (
    <ErrorBoundary>
      <SceneManager
        zoneId={zoneId}
        sceneId={sceneId}
        initialState={{
          phase: 'opening',
          selectedRegion: null,
          selectedLanguages: [],
          selectedFestivals: [],
          discoveredLocations: [],
          showCelebration: false,
          completed: false,
        }}
      >
        {({ sceneState, sceneActions, isReload }) => (
          <MyIndianStoryGameContent
            sceneState={sceneState}
            sceneActions={sceneActions}
            isReload={isReload}
            onComplete={onComplete}
            onNavigate={onNavigate}
            onBack={onBack}
            childName={childName}
            childAge={childAge}
            sceneId={sceneId}
          />
        )}
      </SceneManager>
    </ErrorBoundary>
  );
}

// =========================================================
// 2. CONTENT COMPONENT
// =========================================================
function MyIndianStoryGameContent({ sceneState, sceneActions, isReload, onComplete, onNavigate, onBack, childName = 'friend', childAge = 8, sceneId = 'my-indian-story' }) {
  // ─── PHASE (from SceneManager - single source of truth) ───────────
  const phase = sceneState.phase || STEPS.OPENING;

  // ─── STATE ───────────────────────────────────────────────────────
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedFestivals, setSelectedFestivals] = useState([]);

  // Phase 1 state
  const [discoveredLocations, setDiscoveredLocations] = useState([]);
  const [mglassPosition, setMglassPosition] = useState({ top: '30%', left: '20%' });
  const [showCelebration, setShowCelebration] = useState(false);
  const [phase1SpotSparkle, setPhase1SpotSparkle] = useState({ index: null, key: 0 });
  const [isChildHomeContinueEnabled, setIsChildHomeContinueEnabled] = useState(false);

  // Language phase state
  const [langGuessPhase, setLangGuessPhase] = useState('guessing');
  const [wrongLangGuesses, setWrongLangGuesses] = useState(new Set());
  const [shakeLang, setShakeLang] = useState(null);
  const [langWrongReaction, setLangWrongReaction] = useState(null);
  const [hasPressedLanguagePlay, setHasPressedLanguagePlay] = useState(false);
  const [showLanguageCards, setShowLanguageCards] = useState(false); // Show cards only after mantra finishes
  const [swappingOutLangId, setSwappingOutLangId] = useState(null); // Track which language is being swapped out
  const [showLangSelectionHelper, setShowLangSelectionHelper] = useState(false); // Show helper text at 3 selections

  // Festival phase state
  const [guessPhase, setGuessPhase] = useState('guessing');
  const [wrongGuesses, setWrongGuesses] = useState(new Set());
  const [shakeGuess, setShakeGuess] = useState(null);
  const [activeFestReaction, setActiveFestReaction] = useState(null);
  const [returnHintNonce, setReturnHintNonce] = useState(0);
  const [swappingOutFestId, setSwappingOutFestId] = useState(null); // Track which festival is being swapped out
  const [showFestSelectionHelper, setShowFestSelectionHelper] = useState(false); // Show helper text at 4 selections

  // Gesture & sparkle
  const [miniGesture, setMiniGesture] = useState({ show: false, target: 'center', position: null, durationMs: 1500, key: 0 });
  const [sparkleState, setSparkleState] = useState({ type: null, key: 0, position: null, radius: 180 });

  // Idle Hint Level for Ganesha Home Phase
  const [ganeshaHomeIdleLevel, setGaneshaHomeIdleLevel] = useState(0);
  const ganeshaHomeIdleTimerRef = useRef(null);
  const ganeshaHomeIdleVoiceRef = useRef(false);

  // Idle Hint Level for Language Ganesha Phase
  const [langGuessIdleLevel, setLangGuessIdleLevel] = useState(0);
  const [langIdleRestartNonce, setLangIdleRestartNonce] = useState(0);
  const langGuessIdleTimerRef = useRef(null);
  const langGuessIdleVoiceRef = useRef(false);

  // Idle Hint Level for Festival Ganesha Phase
  const [festGuessIdleLevel, setFestGuessIdleLevel] = useState(0);
  const festGuessIdleTimerRef = useRef(null);
  const festGuessIdleVoiceRef = useRef(false);

  // Audio & voices
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const { speak, stop } = useGaneshaVoice();
  const { playUiTap, playSparkle, playChime } = useGameSounds();
  const onReturnHint = useCallback(() => {
    setReturnHintNonce(n => n + 1);
  }, []);
  const { setCurrentPhase, startMusic, stopMusic, playVoice, stopVoice, setVoiceVolume } = useVoiceGuidance('about-me-hut', 'my-indian-story', {
    enableMusic: true,
    musicVolume: 0.07,
    voiceVolume: 0.65,
    sfxVolume: 0.7,
    idleTimeout: 25,
    resumeDelay: RESUME_DELAY_MS,
    onReturnHint,
  });
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);
  // Refs
  const discoveredRef = useRef(new Set());
  const miniGestureTimerRef = useRef(null);
  const sparkleCancelRef = useRef(null);
  const phase1SpotSparkleTimerRef = useRef(null);
  const childHomeEntryVoiceTimerRef = useRef(null);
  const childHomeIdleTimerRef = useRef(null);
  const childHomePostSelectTimerRef = useRef(null);
  const childHomeIdleHintTimerRef = useRef(null);
  const childHomeIdleHintVoiceRef = useRef(false);
  const languageSelectionIdleHintTimerRef = useRef(null);
  const languageSelectionIdleHintVoiceRef = useRef(false);
  const festivalSelectionIdleHintTimerRef = useRef(null);
  const festivalSelectionIdleHintVoiceRef = useRef(false);
  const languagePlayNudgeTimeoutRef = useRef(null);
  const languagePlayNudgeIntervalRef = useRef(null);
  const phase1ReturnHintTimerCancelRef = useRef(null);
  const phaseEnteredAtRef = useRef(Date.now());
  const entryVoPlayedForPhaseRef = useRef(null);
  const lastHandledReturnHintNonceRef = useRef(0);
  const lastDiscoveryTime = useRef(0);
  const reloadHandledRef = useRef(false);

  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: () => {
      stop();
    },
    onShow: () => {},
    resumeDelay: RESUME_DELAY_MS
  });

  // Stop voice on unmount
  useEffect(() => {
    return () => {
      stop();
      stopMusic();
      clearAllTimeouts();
      if (miniGestureTimerRef.current) clearTimeout(miniGestureTimerRef.current);
      if (sparkleCancelRef.current) clearTimeout(sparkleCancelRef.current);
      if (phase1SpotSparkleTimerRef.current) clearTimeout(phase1SpotSparkleTimerRef.current);
      if (childHomeEntryVoiceTimerRef.current) clearTimeout(childHomeEntryVoiceTimerRef.current);
      if (childHomeIdleTimerRef.current) clearTimeout(childHomeIdleTimerRef.current);
      if (childHomePostSelectTimerRef.current) clearTimeout(childHomePostSelectTimerRef.current);
      if (languagePlayNudgeTimeoutRef.current) clearTimeout(languagePlayNudgeTimeoutRef.current);
      if (languagePlayNudgeIntervalRef.current) clearInterval(languagePlayNudgeIntervalRef.current);
      if (phase1ReturnHintTimerCancelRef.current) {
        phase1ReturnHintTimerCancelRef.current();
        phase1ReturnHintTimerCancelRef.current = null;
      }
    };
  }, [stop, stopMusic, clearAllTimeouts]);


  // Audio & Music Setup
  useEffect(() => {
    setCurrentPhase(phase);
  }, [phase, setCurrentPhase]);

  // Track phase-entry time so return-hint VO doesn't double-play right after navigation.
  useEffect(() => {
    phaseEnteredAtRef.current = Date.now();
    entryVoPlayedForPhaseRef.current = null;
  }, [phase]);

  // Gesture & Sparkle triggers
  const triggerMiniGesture = useCallback((options = 1500) => {
    let durationMs = 1500;
    let target = 'center';
    let position = null;

    if (typeof options === 'number') {
      durationMs = options;
    } else if (options && typeof options === 'object') {
      durationMs = options.durationMs ?? 1500;
      target = options.target ?? 'center';
      position = options.position ?? null;
    }

    if (miniGestureTimerRef.current) clearTimeout(miniGestureTimerRef.current);
    setMiniGesture(prev => ({
      show: true,
      target,
      position,
      durationMs,
      key: prev.key + 1
    }));
    miniGestureTimerRef.current = setTimeout(() => {
      setMiniGesture(prev => ({ ...prev, show: false }));
    }, durationMs);
  }, []);

  const triggerSparkle = useCallback((typeOrOptions, durationMs = 1500) => {
    let sparkleType = 'single';
    let sparkleDuration = durationMs;
    let sparklePosition = null;
    let sparkleRadius = 180;

    if (typeof typeOrOptions === 'string') {
      sparkleType = typeOrOptions;
    } else if (typeOrOptions && typeof typeOrOptions === 'object') {
      sparkleType = typeOrOptions.type ?? 'single';
      sparkleDuration = typeOrOptions.durationMs ?? durationMs;
      sparklePosition = typeOrOptions.position ?? null;
      sparkleRadius = typeOrOptions.radius ?? 180;
    }

    if (sparkleCancelRef.current) clearTimeout(sparkleCancelRef.current);
    setSparkleState(prev => ({
      type: sparkleType,
      key: prev.key + 1,
      position: sparklePosition,
      radius: sparkleRadius
    }));
    sparkleCancelRef.current = setTimeout(() => {
      setSparkleState(prev => ({ ...prev, type: null, position: null }));
    }, sparkleDuration + 50);
  }, []);

  const triggerPhase1SpotSparkle = useCallback((spotIndex, durationMs = 1200) => {
    if (phase1SpotSparkleTimerRef.current) clearTimeout(phase1SpotSparkleTimerRef.current);
    setPhase1SpotSparkle(prev => ({ index: spotIndex, key: prev.key + 1 }));
    phase1SpotSparkleTimerRef.current = setTimeout(() => {
      setPhase1SpotSparkle(prev => ({ ...prev, index: null }));
      phase1SpotSparkleTimerRef.current = null;
    }, durationMs + 50);
  }, []);

  // Audio toggle handler
  const handleAudioToggle = useCallback(() => {
    toggleAudio();
    if (isAudioOn) stop();
  }, [isAudioOn, toggleAudio, stop]);

  // Audio-gated speak
  const speakIfUnmuted = useCallback((text, opts) => {
    if (isAudioOn) speak(text, opts);
  }, [isAudioOn, speak]);

  // Voice lines
  const VOICE = {
    opening:        `Tap to explore my India story and yours!`,
    ganesha_home:   `Drag the magnifying glass to find me.`,
    child_home_entry: `Tap where your family lives in India.`,
    child_home_idle: `Look closely… can you find your home?`,
    child_home_confirmed: `Beautiful! This is your home.`,
    language_play_first: `Tap play to listen.`,
    language_play_hint: `Tap play.`,
    language_guess:   `Tap the right language.`,
    language_guess_hint: `Listen carefully… look for the prayer scroll.`,
    language_audio:   `Vakratunda Mahakaya Suryakoti Samaprabha!`,
    language_correct: `Yes! That's Sanskrit — the language of many mantras.`,
    language_wheel:   `Tap up to three languages you speak.`,
    language_confirmed: `Wonderful! These are your languages.`,
    language_child_idle: `Tap the cards to choose.`,
    festivals_guess:  `Tap my favorite festival.`,
    festivals_guess_hint: `Look for the sweet I love.`,
    festivals_wheel:  `Tap the festivals you celebrate.`,
    festivals_child_idle: `Tap the cards to choose.`,
    festivals_confirmed: `Lovely! These are your festivals.`,
    origin_card:      `We are part of India!`,
    phase1_complete:  `You found my special places! I am everywhere!`,
    completion_screen: `Your story is special. We're all connected!`,
  };

  const activeProfile = GameStateManager.getCurrentProfile?.() || null;
  const profileDisplayName = (activeProfile?.name || childName || 'Friend').trim();
  const rawProfileAvatar = activeProfile?.avatar;
  const PROFILE_ANIMAL_IDS = ['monkey', 'peacock', 'squirrel', 'tiger'];
  const PROFILE_EMOJI_TO_ANIMAL = { '🐵': 'monkey', '🦚': 'peacock', '🐿️': 'squirrel', '🐯': 'tiger' };
  const profileAnimalId = PROFILE_ANIMAL_IDS.includes(rawProfileAvatar) ? rawProfileAvatar : (PROFILE_EMOJI_TO_ANIMAL[rawProfileAvatar] || null);
  const profileAvatarImage = profileAnimalId ? `/images/new-explorer-${profileAnimalId}.png` : null;
  const profileAvatar = (typeof rawProfileAvatar === 'string' && rawProfileAvatar.trim().length <= 2)
    ? rawProfileAvatar
    : profileDisplayName.charAt(0).toUpperCase();

  // Speak on step change — Entry VOs only (LANGUAGE_GANESHA entry VO only)
  useEffect(() => {
    const voiceMap = {
      [STEPS.GANESHA_HOME]:      { text: VOICE.ganesha_home, moment: 'story'       },
      [STEPS.LANGUAGE_GANESHA]:  { text: VOICE.language_play_first, moment: 'default' }, // Entry VO only
      [STEPS.LANGUAGE_CHILD]:    { text: VOICE.language_wheel, moment: 'default'     },
      [STEPS.FESTIVALS_GANESHA]: { text: VOICE.festivals_guess, moment: 'default'     },
      [STEPS.FESTIVALS_CHILD]:   { text: VOICE.festivals_wheel, moment: 'celebration' },
      [STEPS.ORIGIN_CARD]:       { text: VOICE.origin_card,  moment: 'gratitude'   },
      [STEPS.COMPLETE]:          { text: VOICE.completion_screen, moment: 'celebration' },
    };
    const info = voiceMap[phase];
    if (!info?.text) return;
    if (!isAudioOn) return;
    const phaseEntryKey = `${phase}:${info.text}`;
    if (entryVoPlayedForPhaseRef.current === phaseEntryKey) return;
    const stepVoiceKey = `about-me-hut:my-indian-story:${phase}:${info.text}`;
    const shouldBypassRecentDedupe = isReload && !reloadHandledRef.current;
    if (!shouldBypassRecentDedupe && wasStepVoSpokenRecently(stepVoiceKey)) return;
    speak(info.text, { age: childAge, moment: info.moment });
    RECENT_STEP_VO.set(stepVoiceKey, Date.now());
    entryVoPlayedForPhaseRef.current = phaseEntryKey;
  }, [phase, childAge, isAudioOn, isReload, speak]);

  // Opening VO: dedicated path for reliability on scene entry.
  useEffect(() => {
    if (phase === STEPS.OPENING && isAudioOn) {
      setVoiceVolume(OPENING_VO_VOLUME);
      playVoice('opening');
    }
  }, [phase, isAudioOn, playVoice, setVoiceVolume]);

  // LANGUAGE_GANESHA: Play reminder VO when cards are revealed
  useEffect(() => {
    if (phase !== STEPS.LANGUAGE_GANESHA || !showLanguageCards) return;
    const reminderKey = `about-me-hut:my-indian-story:${phase}:cards-revealed:${VOICE.language_guess}`;
    if (wasStepVoSpokenRecently(reminderKey)) return;
    if (isAudioOn) speak(VOICE.language_guess, { age: childAge, moment: 'default' });
  }, [phase, showLanguageCards, childAge, isAudioOn, speak]);

  const getPhaseReminderLine = useCallback((phase) => {
    switch (phase) {
      case STEPS.GANESHA_HOME:
        return 'Drag the magnifying glass to find me.';
      case STEPS.CHILD_HOME:
        return 'Tap where your family lives in India.';
      case STEPS.LANGUAGE_GANESHA:
        return hasPressedLanguagePlay ? VOICE.language_guess : VOICE.language_play_hint;
      case STEPS.LANGUAGE_CHILD:
        return 'Tap up to three languages you speak.';
      case STEPS.FESTIVALS_GANESHA:
        return 'Tap my favorite festival.';
      case STEPS.FESTIVALS_CHILD:
        return 'Tap the festivals you celebrate.';
      case STEPS.ORIGIN_CARD:
        return 'Our stories connect in India!';
      default:
        return null;
    }
  }, [childName, hasPressedLanguagePlay, VOICE.language_guess, VOICE.language_play_hint]);

  useEffect(() => {
    if (!returnHintNonce) return;
    if (lastHandledReturnHintNonceRef.current === returnHintNonce) return;
    lastHandledReturnHintNonceRef.current = returnHintNonce;
    // Reset per-phase idle hint state/timers immediately on tab return
    if (phase === STEPS.CHILD_HOME) {
      childHomeIdleHintVoiceRef.current = false;
      if (childHomeIdleHintTimerRef.current) {
        clearTimeout(childHomeIdleHintTimerRef.current);
        childHomeIdleHintTimerRef.current = null;
      }
    }
    if (phase === STEPS.LANGUAGE_CHILD) {
      languageSelectionIdleHintVoiceRef.current = false;
      if (languageSelectionIdleHintTimerRef.current) {
        clearTimeout(languageSelectionIdleHintTimerRef.current);
        languageSelectionIdleHintTimerRef.current = null;
      }
    }
    if (phase === STEPS.FESTIVALS_CHILD) {
      festivalSelectionIdleHintVoiceRef.current = false;
      if (festivalSelectionIdleHintTimerRef.current) {
        clearTimeout(festivalSelectionIdleHintTimerRef.current);
        festivalSelectionIdleHintTimerRef.current = null;
      }
    }
    if (phase === STEPS.LANGUAGE_GANESHA) {
      setLangGuessIdleLevel(0);
      langGuessIdleVoiceRef.current = false;
      if (langGuessIdleTimerRef.current) {
        clearTimeout(langGuessIdleTimerRef.current);
        langGuessIdleTimerRef.current = null;
      }
      if (languagePlayNudgeTimeoutRef.current) {
        clearTimeout(languagePlayNudgeTimeoutRef.current);
        languagePlayNudgeTimeoutRef.current = null;
      }
    }
    if (phase === STEPS.FESTIVALS_GANESHA) {
      setFestGuessIdleLevel(0);
      festGuessIdleVoiceRef.current = false;
      if (festGuessIdleTimerRef.current) {
        clearTimeout(festGuessIdleTimerRef.current);
        festGuessIdleTimerRef.current = null;
      }
    }
    // Reset shake states on tab return
    if (shakeLang !== null) {
      console.log('[Tab Return] Clearing shake state for language guess');
      setShakeLang(null);
    }
    if (shakeGuess !== null) {
      console.log('[Tab Return] Clearing shake state for festival guess');
      setShakeGuess(null);
    }
    // Play return hint VO if audio is on
    if (!isAudioOn) return;

    // Guard: skip return-hint VO immediately after phase entry.
    // Prevents duplicate "entry + return" lines during quick navigation/replay.
    const msSincePhaseEntry = Date.now() - phaseEnteredAtRef.current;
    if (msSincePhaseEntry < 2500) return;

    // Special sequencing for Ganesha Home on tab return:
    // play one reminder after a short pause to avoid abrupt overlap.
    if (phase === STEPS.GANESHA_HOME) {
      if (discoveredLocations.length === PHASE1_LOCATIONS.length) return;
      // On every tab return, reset idle hint visuals/VO gate immediately.
      setGaneshaHomeIdleLevel(0);
      ganeshaHomeIdleVoiceRef.current = false;
      if (ganeshaHomeIdleTimerRef.current) {
        clearTimeout(ganeshaHomeIdleTimerRef.current);
        ganeshaHomeIdleTimerRef.current = null;
      }
      if (phase1ReturnHintTimerCancelRef.current) {
        phase1ReturnHintTimerCancelRef.current();
        phase1ReturnHintTimerCancelRef.current = null;
      }
      const phase1Line = 'Drag the magnifying glass to find me.';
      phase1ReturnHintTimerCancelRef.current = safeSetTimeout(() => {
        phase1ReturnHintTimerCancelRef.current = null;
        const phase1ReturnKey = `about-me-hut:my-indian-story:${phase}:resume:${phase1Line}`;
        if (wasStepVoSpokenRecently(phase1ReturnKey)) return;
        speakIfUnmuted(phase1Line, { age: childAge, moment: 'encouragement' });
      }, 2000);
      return;
    }

    // Special sequencing for Language Ganesha on tab return:
    // If play was already pressed before cards appeared, replay the full mantra
    // from the beginning, then reveal cards. This keeps tab-return behavior
    // aligned with the normal Play button flow.
    // This avoids overlap between return hint and idle/prompt VO.
    if (phase === STEPS.LANGUAGE_GANESHA) {
      if (hasPressedLanguagePlay) {
        if (!showLanguageCards) {
          const revealCards = () => setShowLanguageCards(true);
          const resumeMantraKey = `about-me-hut:my-indian-story:${phase}:resume:${VOICE.language_audio}`;
          if (!wasStepVoSpokenRecently(resumeMantraKey)) {
            speakIfUnmuted(VOICE.language_audio, {
              age: childAge,
              moment: 'default',
              onEnd: () => safeSetTimeout(revealCards, 200),
              onError: () => safeSetTimeout(revealCards, 200)
            });
            safeSetTimeout(revealCards, 7000);
          }
          return;
        }
        const followupLine = VOICE.language_guess;
        const resumeFollowupKey = `about-me-hut:my-indian-story:${phase}:resume:${followupLine}`;
        if (!wasStepVoSpokenRecently(resumeFollowupKey)) {
          speakIfUnmuted(followupLine, { age: childAge, moment: 'encouragement' });
        }
        return;
      }
      const prePlayLine = VOICE.language_play_hint;
      const prePlayKey = `about-me-hut:my-indian-story:${phase}:resume:${prePlayLine}`;
      if (!wasStepVoSpokenRecently(prePlayKey)) {
        speakIfUnmuted(prePlayLine, { age: childAge, moment: 'encouragement' });
      }
      return;
    }

    const line = getPhaseReminderLine(phase);
    if (!line) return;
    const returnHintVoiceKey = `about-me-hut:my-indian-story:${phase}:${line}`;
    if (wasStepVoSpokenRecently(returnHintVoiceKey)) return;
    speakIfUnmuted(line, { age: childAge, moment: 'encouragement' });
  }, [returnHintNonce, isAudioOn, getPhaseReminderLine, phase, speakIfUnmuted, childAge, shakeLang, shakeGuess, hasPressedLanguagePlay, showLanguageCards, safeSetTimeout, discoveredLocations.length, VOICE.language_audio, VOICE.language_guess, VOICE.language_play_hint]);

  // Child Home entry VO — single combined line, immediate
  useEffect(() => {
    if (phase !== STEPS.CHILD_HOME) return;
    if (!isAudioOn) return;
    if (childHomeEntryVoiceTimerRef.current) clearTimeout(childHomeEntryVoiceTimerRef.current);
    const childHomeEntryKey = `${phase}:${VOICE.child_home_entry}`;
    if (entryVoPlayedForPhaseRef.current === childHomeEntryKey) return;
    const childHomeStepVoiceKey = `about-me-hut:my-indian-story:${phase}:${VOICE.child_home_entry}`;
    const shouldBypassRecentDedupe = isReload && !reloadHandledRef.current;
    if (!shouldBypassRecentDedupe && wasStepVoSpokenRecently(childHomeStepVoiceKey)) return;
    speakIfUnmuted(VOICE.child_home_entry, { age: childAge, moment: 'default' });
    RECENT_STEP_VO.set(childHomeStepVoiceKey, Date.now());
    entryVoPlayedForPhaseRef.current = childHomeEntryKey;
    return () => {
      if (childHomeEntryVoiceTimerRef.current) clearTimeout(childHomeEntryVoiceTimerRef.current);
    };
  }, [phase, VOICE.child_home_entry, speakIfUnmuted, childAge, isAudioOn, isReload]);

  // Child Home idle hint (4s of no selection)
  useEffect(() => {
    if (phase !== STEPS.CHILD_HOME || selectedRegion) return;
    if (childHomeIdleTimerRef.current) clearTimeout(childHomeIdleTimerRef.current);
    childHomeIdleTimerRef.current = setTimeout(() => {
      // Idle hint removed - child has enough context from entry VO
      // speakIfUnmuted(VOICE.child_home_idle, { age: childAge, moment: 'default' });
    }, 4000);
    return () => {
      if (childHomeIdleTimerRef.current) clearTimeout(childHomeIdleTimerRef.current);
    };
  }, [phase, selectedRegion, VOICE.child_home_idle, speakIfUnmuted, childAge]);

  // Reload restore: recover last saved scene step on reload.
  // If SceneManager restore is slightly stale (debounced save race), prefer the later saved step.
  useEffect(() => {
    if (!isReload) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      const savedStep = saved?.step;
      if (!savedStep || !RESUMABLE_STEPS.has(savedStep)) return;
      const stepOrder = {
        [STEPS.OPENING]: 0,
        [STEPS.GANESHA_HOME]: 1,
        [STEPS.CHILD_HOME]: 2,
        [STEPS.LANGUAGE_GANESHA]: 3,
        [STEPS.LANGUAGE_CHILD]: 4,
        [STEPS.FESTIVALS_GANESHA]: 5,
        [STEPS.FESTIVALS_CHILD]: 6,
        [STEPS.ORIGIN_CARD]: 7,
        [STEPS.COMPLETE]: 8,
      };
      const currentOrder = stepOrder[phase] ?? 0;
      const savedOrder = stepOrder[savedStep] ?? 0;
      const shouldRestoreSavedStep = phase === STEPS.OPENING || savedOrder > currentOrder;
      if (!shouldRestoreSavedStep) return;

      sceneActions.updateState({
        phase: savedStep,
        selectedRegion: saved?.region ?? null,
        selectedLanguages: saved?.languages ?? [],
        selectedFestivals: saved?.festivals ?? [],
      });
    } catch (e) {}
  }, [isReload, phase, sceneActions]);

  // ── RELOAD: Restart each phase state; entry VO is handled by phase-entry effects ─────────
  useEffect(() => {
    if (!isReload || reloadHandledRef.current) return;
    if (phase === STEPS.OPENING || phase === STEPS.COMPLETE) return;

    reloadHandledRef.current = true;
    entryVoPlayedForPhaseRef.current = null;
    RECENT_STEP_VO.clear();

    // Phase 1: Ganesha Home — reset discovered locations
    if (phase === STEPS.GANESHA_HOME) {
      setDiscoveredLocations([]);
      discoveredRef.current = new Set();
      setMglassPosition({ top: '30%', left: '20%' });
      setShowCelebration(false);
      setGaneshaHomeIdleLevel(0);
      ganeshaHomeIdleVoiceRef.current = false;
      setCurrentPhase('ganesha_home');
      return;
    }

    // Phase 2: Child Home — reset region selection
    if (phase === STEPS.CHILD_HOME) {
      setSelectedRegion(null);
      setIsChildHomeContinueEnabled(false);
      setCurrentPhase('child_home');
      return;
    }

    // Phase 3: Language Ganesha (Guess) — reset guessing state
    if (phase === STEPS.LANGUAGE_GANESHA) {
      setLangGuessPhase('guessing');
      setWrongLangGuesses(new Set());
      setShakeLang(null);
      setLangWrongReaction(null);
      setShowLanguageCards(false);
      setHasPressedLanguagePlay(false);
      setLangGuessIdleLevel(0);
      langGuessIdleVoiceRef.current = false;
      setCurrentPhase('language_ganesha');
      return;
    }

    // Phase 4: Language Child (Select) — reset language selections
    if (phase === STEPS.LANGUAGE_CHILD) {
      setSelectedLanguages([]);
      setSwappingOutLangId(null);
      setShowLangSelectionHelper(false);
      setCurrentPhase('language_child');
      return;
    }

    // Phase 5: Festival Ganesha (Guess) — reset guessing state
    if (phase === STEPS.FESTIVALS_GANESHA) {
      setGuessPhase('guessing');
      setWrongGuesses(new Set());
      setShakeGuess(null);
      setActiveFestReaction(null);
      setFestGuessIdleLevel(0);
      festGuessIdleVoiceRef.current = false;
      setCurrentPhase('festivals_ganesha');
      return;
    }

    // Phase 6: Festival Child (Select) — reset festival selections
    if (phase === STEPS.FESTIVALS_CHILD) {
      setSelectedFestivals([]);
      setSwappingOutFestId(null);
      setShowFestSelectionHelper(false);
      setCurrentPhase('festivals_child');
      return;
    }

    // Phase 7: Origin Card — replay entry VO
    if (phase === STEPS.ORIGIN_CARD) {
      setCurrentPhase('origin_card');
      return;
    }

  }, [isReload, phase, childAge, speakIfUnmuted, setCurrentPhase, VOICE]);

  // Reset state when entering each step
  useEffect(() => {
    if (phase === STEPS.GANESHA_HOME) {
      setDiscoveredLocations([]);
      discoveredRef.current = new Set();
      setShowCelebration(false);
      setPhase1SpotSparkle(prev => ({ ...prev, index: null }));
      setMglassPosition({ top: '30%', left: '20%' });
    }
    if (phase === STEPS.FESTIVALS_GANESHA || phase === STEPS.FESTIVALS_CHILD) {
      setGuessPhase('guessing');
      setWrongGuesses(new Set());
      setShakeGuess(null);
    }
    if (phase === STEPS.LANGUAGE_GANESHA) {
      setLangGuessPhase('guessing');
      setWrongLangGuesses(new Set());
      setShakeLang(null);
      setLangWrongReaction(null);
      setShowLanguageCards(false); // Reset: hide cards until Play is pressed
      setHasPressedLanguagePlay(false);
    }
    if (phase === STEPS.CHILD_HOME && !isReload) {
      setSelectedRegion(null);
      setIsChildHomeContinueEnabled(false);
    }
  }, [phase, isReload]);

  // Step 1 UX: once all locations are found, advance
  useEffect(() => {
    if (phase !== STEPS.GANESHA_HOME) return;
    if (discoveredLocations.length !== PHASE1_LOCATIONS.length) return;
    if (phase1ReturnHintTimerCancelRef.current) {
      phase1ReturnHintTimerCancelRef.current();
      phase1ReturnHintTimerCancelRef.current = null;
    }
    setShowCelebration(false);
    let advanced = false;
    let cancelAdvance = null;
    const goToChildHome = () => {
      if (advanced) return;
      advanced = true;
      sceneActions.updateState({ phase: STEPS.CHILD_HOME });
    };

    // Let the final place-name VO finish before phase completion VO starts.
    const elapsedSinceLastDiscovery = Date.now() - lastDiscoveryTime.current;
    const completionDelayMs = Math.max(1500, 2600 - elapsedSinceLastDiscovery);

    const cancel1 = safeSetTimeout(() => {
      setShowCelebration(true);
      triggerSparkle('all', 2000);
      if (isAudioOn) {
        speakIfUnmuted(VOICE.phase1_complete, {
          age: childAge,
          moment: 'celebration',
          onEnd: goToChildHome,
          onError: goToChildHome
        });
        // Failsafe: proceed even if voice callbacks fail.
        cancelAdvance = safeSetTimeout(goToChildHome, 6500);
      } else {
        cancelAdvance = safeSetTimeout(goToChildHome, 1200);
      }
    }, completionDelayMs);
    return () => {
      cancel1?.();
      cancelAdvance?.();
    };
  }, [phase, discoveredLocations.length, safeSetTimeout, triggerSparkle, speakIfUnmuted, childAge, VOICE.phase1_complete, isAudioOn]);

  // Ganesha Home: Idle hint progression (Level 1 @ 10s, Level 2 @ 18s, Level 3 @ 26s)
  useEffect(() => {
    if (phase !== STEPS.GANESHA_HOME || discoveredLocations.length === PHASE1_LOCATIONS.length) {
      if (ganeshaHomeIdleLevel > 0) {
        console.log('[Idle Hint] Cleared: Exiting Ganesha Home phase or all spots discovered');
      }
      setGaneshaHomeIdleLevel(0);
      ganeshaHomeIdleVoiceRef.current = false;
      if (ganeshaHomeIdleTimerRef.current) clearTimeout(ganeshaHomeIdleTimerRef.current);
      return;
    }
    console.log('[Idle Hint] Started: Ganesha Home phase idle timer will trigger in 6s');

    ganeshaHomeIdleTimerRef.current = setTimeout(() => {
      // Level 1 @ 10 seconds: Spots glow once + magnifying glass wobbles
      console.log('[Idle Hint] Level 1 triggered: Spots glow + magnifying glass wobbles');
      setGaneshaHomeIdleLevel(1);

      // Level 2 @ 18 seconds: Spots glow stronger + voice over (single play)
      ganeshaHomeIdleTimerRef.current = setTimeout(() => {
        console.log('[Idle Hint] Level 2 triggered: Repeating glow + voice over');
        setGaneshaHomeIdleLevel(2);
        if (!ganeshaHomeIdleVoiceRef.current) {
          speakIfUnmuted('Drag the magnifying glass to find me.', { age: childAge, moment: 'default' });
          ganeshaHomeIdleVoiceRef.current = true;
        }

        // Level 3 @ 26 seconds: Pointing emoji + continue glowing (visual-only)
        ganeshaHomeIdleTimerRef.current = setTimeout(() => {
          console.log('[Idle Hint] Level 3 triggered: Pointing emoji appears');
          setGaneshaHomeIdleLevel(3);
          // Keep Level 3 visual-only to avoid VO overlap right after Level 2.
        }, 8000);
      }, 8000);
    }, 10000);

    return () => {
      if (ganeshaHomeIdleTimerRef.current) clearTimeout(ganeshaHomeIdleTimerRef.current);
    };
  }, [phase, discoveredLocations.length, returnHintNonce, speakIfUnmuted, childAge]);

  // Language Ganesha pre-play nudges: focus on Play button until it is pressed
  // Flow: Entry "Tap play to listen." → After 5s: pulse Play + repeat entry hint once
  useEffect(() => {
    if (phase !== STEPS.LANGUAGE_GANESHA || hasPressedLanguagePlay || langGuessPhase !== 'guessing') {
      if (languagePlayNudgeTimeoutRef.current) clearTimeout(languagePlayNudgeTimeoutRef.current);
      languagePlayNudgeTimeoutRef.current = null;
      return;
    }

    // Play nudge at 5 seconds — ONCE only, no interval
    languagePlayNudgeTimeoutRef.current = setTimeout(() => {
      if (isAudioOn) speak(VOICE.language_play_hint, { age: childAge, moment: 'encouragement' });
    }, 5000);

    return () => {
      if (languagePlayNudgeTimeoutRef.current) clearTimeout(languagePlayNudgeTimeoutRef.current);
      languagePlayNudgeTimeoutRef.current = null;
    };
  }, [phase, hasPressedLanguagePlay, langGuessPhase, childAge, isAudioOn, speak, VOICE.language_play_hint]);

  // Child Home: Idle hint (6-7s of no selection)
  useEffect(() => {
    if (phase !== STEPS.CHILD_HOME || selectedRegion) return;
    if (childHomeIdleHintTimerRef.current) clearTimeout(childHomeIdleHintTimerRef.current);
    childHomeIdleHintVoiceRef.current = false;
    childHomeIdleHintTimerRef.current = setTimeout(() => {
      if (!childHomeIdleHintVoiceRef.current && isAudioOn) {
        speak(VOICE.child_home_idle, { age: childAge, moment: 'default' });
        childHomeIdleHintVoiceRef.current = true;
      }
    }, 6500);
    return () => {
      if (childHomeIdleHintTimerRef.current) clearTimeout(childHomeIdleHintTimerRef.current);
    };
  }, [phase, selectedRegion, childAge, isAudioOn, speak, VOICE.child_home_idle, returnHintNonce]);

  // Language Child: Idle hint (6-7s of no selection)
  useEffect(() => {
    if (phase !== STEPS.LANGUAGE_CHILD || selectedLanguages.length > 0) return;
    if (languageSelectionIdleHintTimerRef.current) clearTimeout(languageSelectionIdleHintTimerRef.current);
    languageSelectionIdleHintVoiceRef.current = false;
    languageSelectionIdleHintTimerRef.current = setTimeout(() => {
      if (!languageSelectionIdleHintVoiceRef.current && isAudioOn) {
        speak(VOICE.language_child_idle, { age: childAge, moment: 'default' });
        languageSelectionIdleHintVoiceRef.current = true;
      }
    }, 6500);
    return () => {
      if (languageSelectionIdleHintTimerRef.current) clearTimeout(languageSelectionIdleHintTimerRef.current);
    };
  }, [phase, selectedLanguages.length, childAge, isAudioOn, speak, VOICE.language_child_idle, returnHintNonce]);

  // Festivals Child: Idle hint (6-7s of no selection)
  useEffect(() => {
    if (phase !== STEPS.FESTIVALS_CHILD || selectedFestivals.length > 0) return;
    if (festivalSelectionIdleHintTimerRef.current) clearTimeout(festivalSelectionIdleHintTimerRef.current);
    festivalSelectionIdleHintVoiceRef.current = false;
    festivalSelectionIdleHintTimerRef.current = setTimeout(() => {
      if (!festivalSelectionIdleHintVoiceRef.current && isAudioOn) {
        speak(VOICE.festivals_child_idle, { age: childAge, moment: 'default' });
        festivalSelectionIdleHintVoiceRef.current = true;
      }
    }, 6500);
    return () => {
      if (festivalSelectionIdleHintTimerRef.current) clearTimeout(festivalSelectionIdleHintTimerRef.current);
    };
  }, [phase, selectedFestivals.length, childAge, isAudioOn, speak, VOICE.festivals_child_idle, returnHintNonce]);

  // Language Ganesha: Idle hint progression (Level 1 @ 10s, Level 2 @ 18s, Level 3 @ 26s)
  useEffect(() => {
    if (phase !== STEPS.LANGUAGE_GANESHA || shakeLang !== null || langGuessPhase !== 'guessing' || !hasPressedLanguagePlay) {
      if (langGuessIdleLevel > 0) {
        console.log('[Idle Hint Language] Cleared: Exiting phase or user made a guess');
      }
      setLangGuessIdleLevel(0);
      langGuessIdleVoiceRef.current = false;
      if (langGuessIdleTimerRef.current) clearTimeout(langGuessIdleTimerRef.current);
      return;
    }
    console.log('[Idle Hint Language] Started: Idle timer will trigger in 10s');

    langGuessIdleTimerRef.current = setTimeout(() => {
      // Level 1 @ 10 seconds: Cards wobble
      console.log('[Idle Hint Language] Level 1 triggered: Cards wobble');
      setLangGuessIdleLevel(1);

      // Level 2 @ 18 seconds: Cards wobble + voice over
      langGuessIdleTimerRef.current = setTimeout(() => {
        console.log('[Idle Hint Language] Level 2 triggered: Repeating wobble + voice over');
        setLangGuessIdleLevel(2);
        if (!langGuessIdleVoiceRef.current) {
          speakIfUnmuted(VOICE.language_guess_hint, { age: childAge, moment: 'default' });
          langGuessIdleVoiceRef.current = true;
        }

        // Level 3 @ 26 seconds: stronger glow only (visual-only, no repeated VO)
        langGuessIdleTimerRef.current = setTimeout(() => {
          console.log('[Idle Hint Language] Level 3 triggered: Repeat hint audio');
          setLangGuessIdleLevel(3);
          // Keep Level 3 visual-only to avoid back-to-back hint VO.
        }, 8000);
      }, 8000);
    }, 10000);

    return () => {
      if (langGuessIdleTimerRef.current) clearTimeout(langGuessIdleTimerRef.current);
    };
  }, [phase, langGuessPhase, shakeLang, returnHintNonce, speakIfUnmuted, childAge, hasPressedLanguagePlay, VOICE.language_guess_hint, langIdleRestartNonce]);

  // Festival Ganesha: Idle hint progression (Level 1 @ 10s, Level 2 @ 18s, Level 3 @ 26s)
  useEffect(() => {
    if (phase !== STEPS.FESTIVALS_GANESHA || shakeGuess !== null || guessPhase !== 'guessing') {
      if (festGuessIdleLevel > 0) {
        console.log('[Idle Hint Festival] Cleared: Exiting phase or user made a guess');
      }
      setFestGuessIdleLevel(0);
      festGuessIdleVoiceRef.current = false;
      if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
      return;
    }
    console.log('[Idle Hint Festival] Started: Idle timer will trigger in 10s');

    festGuessIdleTimerRef.current = setTimeout(() => {
      // Level 1 @ 10 seconds: Cards wobble
      console.log('[Idle Hint Festival] Level 1 triggered: Cards wobble');
      setFestGuessIdleLevel(1);

      // Level 2 @ 18 seconds: Cards wobble + voice over
      festGuessIdleTimerRef.current = setTimeout(() => {
        console.log('[Idle Hint Festival] Level 2 triggered: Repeating wobble + voice over');
        setFestGuessIdleLevel(2);
        if (!festGuessIdleVoiceRef.current) {
          speakIfUnmuted(VOICE.festivals_guess_hint, { age: childAge, moment: 'default' });
          festGuessIdleVoiceRef.current = true;
        }

        // Level 3 @ 26 seconds: stronger glow only (no repeated VO)
        festGuessIdleTimerRef.current = setTimeout(() => {
          console.log('[Idle Hint Festival] Level 3 triggered: stronger glow only');
          setFestGuessIdleLevel(3);
        }, 8000);
      }, 8000);
    }, 10000);

    return () => {
      if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
    };
  }, [phase, guessPhase, shakeGuess, returnHintNonce, speakIfUnmuted, childAge]);

  // Save progress
  const saveProgress = (region, langs, fests, stepValue = phase) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        region: region ?? selectedRegion,
        languages: langs ?? selectedLanguages,
        festivals: fests ?? selectedFestivals,
        step: stepValue,
        completedAt: new Date().toISOString(),
      }));
    } catch (e) {}
  };

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }, []);

  // Persist phase and selections on reload
useEffect(() => {
  if (!RESUMABLE_STEPS.has(phase)) return;
  // Only save if there's actual data
  if (selectedRegion || selectedLanguages.length > 0 || selectedFestivals.length > 0) {
    saveProgress(null, null, null, phase);
    sceneActions.updateState({
      selectedRegion: selectedRegion || undefined,
      selectedLanguages: selectedLanguages?.length > 0 ? selectedLanguages : undefined,
      selectedFestivals: selectedFestivals?.length > 0 ? selectedFestivals : undefined,
    });
  }
}, [phase, selectedRegion, selectedLanguages, selectedFestivals, sceneActions]);

  // Check location discovery
  const checkLocationDiscovery = useCallback((percentX, percentY) => {
    PHASE1_LOCATIONS.forEach((loc, idx) => {
      if (Math.abs(percentX - loc.x) < 7 && Math.abs(percentY - loc.y) < 7) {
        discoverLocation(idx);
      }
    });
  }, []);

const discoverLocation = useCallback((index) => {
  if (discoveredRef.current.has(index)) return;
  discoveredRef.current.add(index);
  lastDiscoveryTime.current = Date.now();

  const location = PHASE1_LOCATIONS[index];
    setDiscoveredLocations(prev => [...prev, index]);
    playSparkle();
    triggerMiniGesture({
      target: 'phase1-spot',
      durationMs: 1500,
      position: { x: location.x, y: Math.max(8, location.y - 8) },
    });
    triggerSparkle('single', 1500);
    triggerPhase1SpotSparkle(index, 1200);
    speakIfUnmuted(location.name, { age: childAge, moment: 'story' });
  }, [playSparkle, triggerMiniGesture, triggerSparkle, triggerPhase1SpotSparkle, speakIfUnmuted, childAge]);

  // Handle magnifying glass move
  const handleMglassMove = useCallback((newPosition) => {
    setMglassPosition(newPosition);
    // Reset idle hint level when user interacts
    if (phase === STEPS.GANESHA_HOME && ganeshaHomeIdleLevel > 0) {
      console.log('[Idle Hint] Reset: User dragged magnifying glass');
      setGaneshaHomeIdleLevel(0);
      ganeshaHomeIdleVoiceRef.current = false;
      if (ganeshaHomeIdleTimerRef.current) clearTimeout(ganeshaHomeIdleTimerRef.current);
    }
    const percentX = parseFloat(newPosition.left);
    const percentY = parseFloat(newPosition.top);
    checkLocationDiscovery(percentX, percentY);
  }, [checkLocationDiscovery, phase, ganeshaHomeIdleLevel]);

  // Handle region select
  const handleRegionSelect = (region, event) => {
    playUiTap();
    triggerMiniGesture(1500);
    const regionRect = event?.currentTarget?.getBoundingClientRect?.();
    const regionSparklePosition = regionRect
      ? { x: regionRect.left + regionRect.width / 2, y: regionRect.top + regionRect.height / 2 }
      : null;
    triggerSparkle({ type: 'single', durationMs: 1200, position: regionSparklePosition, radius: 170 });
    if (childHomeIdleTimerRef.current) clearTimeout(childHomeIdleTimerRef.current);
    if (childHomePostSelectTimerRef.current) clearTimeout(childHomePostSelectTimerRef.current);
    if (childHomeIdleHintTimerRef.current) clearTimeout(childHomeIdleHintTimerRef.current);
    childHomeIdleHintVoiceRef.current = false;
    // Reset idle hint on region selection
    if (ganeshaHomeIdleLevel > 0) {
      console.log('[Idle Hint] Reset: Child selected region');
      setGaneshaHomeIdleLevel(0);
      ganeshaHomeIdleVoiceRef.current = false;
    }
    setSelectedRegion(region);
    setIsChildHomeContinueEnabled(false);
    speakIfUnmuted(region.label, { age: childAge, moment: 'story' });
    childHomePostSelectTimerRef.current = setTimeout(() => {
      setIsChildHomeContinueEnabled(true);
    }, 900);
    saveProgress(region, null, null);
  };

  // Handle language toggle
  const toggleLanguage = (lang, event) => {
    playUiTap();
    triggerMiniGesture(1500);
    const langRect = event?.currentTarget?.getBoundingClientRect?.();
    const langSparklePosition = langRect
      ? { x: langRect.left + langRect.width / 2, y: langRect.top + langRect.height / 2 }
      : null;
    triggerSparkle({ type: 'single', durationMs: 1200, position: langSparklePosition, radius: 170 });
    // Reset idle hints on language selection
    if (langGuessIdleLevel > 0) {
      console.log('[Idle Hint Language] Reset: Child selected language');
      setLangGuessIdleLevel(0);
      langGuessIdleVoiceRef.current = false;
      if (langGuessIdleTimerRef.current) clearTimeout(langGuessIdleTimerRef.current);
    }
    // Reset selection idle hint
    if (languageSelectionIdleHintTimerRef.current) clearTimeout(languageSelectionIdleHintTimerRef.current);
    languageSelectionIdleHintVoiceRef.current = false;
    setSelectedLanguages(prev => {
      const exists = prev.find(l => l.id === lang.id);
      if (exists) {
        // Deselecting
        return prev.filter(l => l.id !== lang.id);
      }
      if (prev.length >= 3) {
        // 4th tap: replace oldest (FIFO)
        const oldestId = prev[0].id;
        setSwappingOutLangId(oldestId);
        // Clear the swap animation after it completes
        setTimeout(() => setSwappingOutLangId(null), 300);
        return [prev[1], prev[2], lang];
      }
      // Adding new language
      if (prev.length === 2) {
        // Show helper text when reaching 3
        setShowLangSelectionHelper(true);
        setTimeout(() => setShowLangSelectionHelper(false), 2000);
      }
      return [...prev, lang];
    });
    speakIfUnmuted(lang.label, { age: childAge, moment: 'encouragement' });
  };

  // Handle festival toggle
  const toggleFestival = (fest, event) => {
    playUiTap();
    triggerMiniGesture(1500);
    const festRect = event?.currentTarget?.getBoundingClientRect?.();
    const festSparklePosition = festRect
      ? { x: festRect.left + festRect.width / 2, y: festRect.top + festRect.height / 2 }
      : null;
    triggerSparkle({ type: 'single', durationMs: 1200, position: festSparklePosition, radius: 170 });
    // Reset idle hints on festival selection
    if (festGuessIdleLevel > 0) {
      console.log('[Idle Hint Festival] Reset: Child selected festival');
      setFestGuessIdleLevel(0);
      festGuessIdleVoiceRef.current = false;
      if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
    }
    // Reset selection idle hint
    if (festivalSelectionIdleHintTimerRef.current) clearTimeout(festivalSelectionIdleHintTimerRef.current);
    festivalSelectionIdleHintVoiceRef.current = false;
    setSelectedFestivals(prev => {
      const exists = prev.find(f => f.id === fest.id);
      if (exists) {
        // Deselecting
        return prev.filter(f => f.id !== fest.id);
      }
      if (prev.length >= 4) {
        // 4th tap: replace oldest (FIFO)
        const oldestId = prev[0].id;
        setSwappingOutFestId(oldestId);
        // Clear the swap animation after it completes
        setTimeout(() => setSwappingOutFestId(null), 300);
        return [prev[1], prev[2], prev[3], fest];
      }
      // Adding new festival
      if (prev.length === 3) {
        // Show helper text when reaching 4
        setShowFestSelectionHelper(true);
        setTimeout(() => setShowFestSelectionHelper(false), 2000);
      }
      return [...prev, fest];
    });
    speakIfUnmuted(fest.label, { age: childAge, moment: 'encouragement' });
  };

  // Handle language guess
  const handleLanguageGuess = (guessLang) => {
    playUiTap();
    const isCorrect = guessLang.id === 'sanskrit';

    if (isCorrect) {
      setLangGuessPhase('correct');
      triggerSparkle('all', 2000);
      playSparkle();
      triggerMiniGesture(1500);
      playChime();
      let advanced = false;
      const advanceToNextPhase = () => {
        if (advanced) return;
        advanced = true;
        safeSetTimeout(() => {
          setLangGuessPhase('revealed');
          sceneActions.updateState({ phase: STEPS.LANGUAGE_CHILD });
        }, 2000);
      };
      if (isAudioOn) {
        speakIfUnmuted(VOICE.language_correct, {
          age: childAge,
          moment: 'celebration',
          onEnd: advanceToNextPhase,
          onError: advanceToNextPhase
        });
      } else {
        // Audio-off: keep same UX rhythm with a short pause before advancing.
        advanceToNextPhase();
      }
    } else {
      setWrongLangGuesses(prev => new Set(prev).add(guessLang.id));
      setShakeLang(guessLang.id);
      speakIfUnmuted(guessLang.label, { age: childAge, moment: 'default' });
      safeSetTimeout(() => setShakeLang(null), 500);
    }
  };

  // Handle festival guess
  const handleFestivalGuess = (fest) => {
    playUiTap();
    const isCorrect = fest.id === 'ganesh';

    if (isCorrect) {
      setGuessPhase('correct');
      triggerSparkle('all', 2000);
      playSparkle();
      triggerMiniGesture(1500);
      playChime();
      let advanced = false;
      const goToFestivalChildPhase = () => {
        if (advanced) return;
        advanced = true;
        setGuessPhase('revealed');
        sceneActions.updateState({ phase: STEPS.FESTIVALS_CHILD });
      };

      if (isAudioOn) {
        speakIfUnmuted('Yes! Ganesh Chaturthi is my birthday!', {
          age: childAge,
          moment: 'celebration',
          onEnd: goToFestivalChildPhase,
          onError: goToFestivalChildPhase
        });
        safeSetTimeout(goToFestivalChildPhase, 5000);
      } else {
        safeSetTimeout(goToFestivalChildPhase, 1200);
      }
    } else {
      if (!wrongGuesses.has(fest.id)) {
        setWrongGuesses(prev => new Set(prev).add(fest.id));
      }
      setShakeGuess(null);
      safeSetTimeout(() => setShakeGuess(fest.id), 0);
      safeSetTimeout(() => setShakeGuess(null), 500);
    }
  };

  // Complete scene
const handleComplete = () => {
  saveProgress(selectedRegion, selectedLanguages, selectedFestivals, STEPS.COMPLETE);
  sceneActions.updateState({ completed: true, phase: STEPS.COMPLETE, showingCompletionScreen: true });
  
  // ⭐ ADD THIS - Save to ProgressManager's storage
  const profileId = GameStateManager.getCurrentProfile()?.id;
  if (profileId) {
    ProgressManager.updateSceneCompletion(profileId, 'about-me-hut', 'my-indian-story', {
      completed: true,
      stars: 3
    });
  }
};
  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <div className="mis-wrapper">
      <img src={bgImage} alt="Background" className="mis-background" />
      <ResumeCountdown value={countdownValue} />
      <HomeButton onNavigate={onNavigate} />
      <ZoneBadgeButton zoneId="about-me-hut" onBack={() => onNavigate?.('zone-welcome')} />
      <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />

      {/* DEBUG: Test Controls Panel */}
      <div style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '12px',
        borderRadius: '8px',
        maxWidth: '220px',
      }}>
        {/* Reset Button */}
        <button
          onClick={() => {
            clearProgress();
            sceneActions.updateState({ phase: STEPS.OPENING });
            setSelectedRegion(null);
            setSelectedLanguages([]);
            setSelectedFestivals([]);
            setDiscoveredLocations([]);
            setMglassPosition({ top: '30%', left: '20%' });
            setShowCelebration(false);
          }}
          style={{
            padding: '6px 10px',
            background: 'rgba(255, 0, 0, 0.8)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          🔄 Reset All
        </button>

        {/* Phase Jump Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
          {[
            { label: 'Opening', value: STEPS.OPENING },
            { label: 'Phase1', value: STEPS.GANESHA_HOME },
            { label: 'Phase2', value: STEPS.CHILD_HOME },
            { label: 'Phase3', value: STEPS.LANGUAGE_GANESHA },
            { label: 'Phase4', value: STEPS.LANGUAGE_CHILD },
            { label: 'Phase5', value: STEPS.FESTIVALS_GANESHA },
            { label: 'Phase6', value: STEPS.FESTIVALS_CHILD },
            { label: 'Phase7', value: STEPS.ORIGIN_CARD },
            { label: 'Complete', value: STEPS.COMPLETE },
          ].map((phaseOption) => (
            <button
              key={phaseOption.value}
              onClick={() => sceneActions.updateState({ phase: phaseOption.value })}
              style={{
                padding: '4px 8px',
                background: phase === phaseOption.value ? '#4CAF50' : '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {phaseOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sparkles */}
      {sparkleState.type && (
        <div
          style={
            sparkleState.type === 'single' && sparkleState.position
              ? {
                  position: 'fixed',
                  left: sparkleState.position.x,
                  top: sparkleState.position.y,
                  width: sparkleState.radius,
                  height: sparkleState.radius,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1500,
                  pointerEvents: 'none'
                }
              : { position: 'fixed', inset: 0, zIndex: 1500, pointerEvents: 'none' }
          }
        >
          <SparkleAnimation
            type={sparkleState.type === 'all' ? 'magic' : 'magic'}
            count={sparkleState.type === 'all' ? 42 : 14}
            color={sparkleState.type === 'all' ? 'rgba(255, 214, 102, 0.92)' : 'rgba(255, 210, 92, 0.98)'}
            size={sparkleState.type === 'all' ? 12 : 10}
            duration={sparkleState.type === 'all' ? 2400 : 1700}
            fadeOut={true}
            area="full"
            key={sparkleState.key}
          />
        </div>
      )}

      {/* Center mini gesture (used across child phases and celebration taps) */}
      {miniGesture.show && miniGesture.target === 'center' && (
        <div
          key={`center-mini-gesture-${miniGesture.key}`}
          style={{
            position: 'fixed',
            left: '50%',
            top: '28%',
            transform: 'translate(-50%, -50%)',
            zIndex: 170,
            pointerEvents: 'none',
            fontSize: 48,
            lineHeight: 1,
            animation: `misMiniGestureCenterPop ${miniGesture.durationMs}ms ease-out forwards`,
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.18))'
          }}
          aria-hidden="true"
        >
          <img
            src="/images/hand-thumbsup.svg"
            alt=""
            style={{
              width: '56px',
              height: '56px',
              display: 'block',
              filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25))'
            }}
          />
        </div>
      )}
      <style>{`
        @keyframes misMiniGestureCenterPop {
          0% { opacity: 0; transform: translate(-50%, -42%) scale(0.75); }
          18% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
          62% { opacity: 1; transform: translate(-50%, -52%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -58%) scale(0.92); }
        }
      `}</style>

      {/* Opening Modal */}
      {phase === STEPS.OPENING && (
        <OpeningModal
          zoneId="about-me-hut"
          sceneId="my-indian-story"
          onStart={() => {
            stopVoice(); // Stop file-based opening VO immediately on CTA tap
            stop();
            setVoiceVolume(isAudioOn ? 1 : 0);
            startMusic();
            //clearProgress();
            setSelectedRegion(null);
            setSelectedLanguages([]);
            setSelectedFestivals([]);
            sceneActions.updateState({ phase: STEPS.GANESHA_HOME });
          }}
          showButton={true}
        />
      )}

      {/* Completion Screen */}
      {phase === STEPS.COMPLETE && (() => {
        const completionIcons = ['story-home', 'story-language', 'story-festival'];

        return (
        <SceneCompletionCelebration
          show={phase === STEPS.COMPLETE}
          zoneId="about-me-hut"
          sceneName="My Indian Story"
          completionTitle="Your Story Is Special!"
          completionSubtitle="You are part of India’s story."
          childName={childName || 'Friend'}
          sceneId="my-indian-story"
          isFinalScene={true}
          discoveredSymbols={completionIcons}
          symbolImages={{
            'story-home': storyHouseIcon,
            'story-language': storyLanguageIcon,
            'story-festival': storyFestivalIcon
          }}
          nextSceneName="Let's Be Friends"
          completionData={{
            completed: true,
            stars: 3,
            selectedRegion: selectedRegion,
            selectedLanguages: selectedLanguages,
            selectedFestivals: selectedFestivals
          }}
          onContinue={() => {
            if (onComplete) onComplete(sceneId, { stars: 3, completed: true });
            if (onNavigate) onNavigate('zone-welcome');
          }}
          onReplay={() => {
            clearAllTimeouts();
            stopVoice();
            stop();
            stopMusic();
            clearProgress();

            if (ganeshaHomeIdleTimerRef.current) clearTimeout(ganeshaHomeIdleTimerRef.current);
            if (langGuessIdleTimerRef.current) clearTimeout(langGuessIdleTimerRef.current);
            if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
            if (phase1SpotSparkleTimerRef.current) clearTimeout(phase1SpotSparkleTimerRef.current);
            if (childHomeEntryVoiceTimerRef.current) clearTimeout(childHomeEntryVoiceTimerRef.current);
            if (childHomeIdleTimerRef.current) clearTimeout(childHomeIdleTimerRef.current);
            if (childHomePostSelectTimerRef.current) clearTimeout(childHomePostSelectTimerRef.current);
            if (childHomeIdleHintTimerRef.current) clearTimeout(childHomeIdleHintTimerRef.current);
            if (languageSelectionIdleHintTimerRef.current) clearTimeout(languageSelectionIdleHintTimerRef.current);
            if (festivalSelectionIdleHintTimerRef.current) clearTimeout(festivalSelectionIdleHintTimerRef.current);
            if (languagePlayNudgeTimeoutRef.current) clearTimeout(languagePlayNudgeTimeoutRef.current);
            if (languagePlayNudgeIntervalRef.current) clearInterval(languagePlayNudgeIntervalRef.current);
            if (phase1ReturnHintTimerCancelRef.current) phase1ReturnHintTimerCancelRef.current();
            if (miniGestureTimerRef.current) clearTimeout(miniGestureTimerRef.current);
            if (sparkleCancelRef.current) clearTimeout(sparkleCancelRef.current);

            discoveredRef.current = new Set();
            ganeshaHomeIdleVoiceRef.current = false;
            langGuessIdleVoiceRef.current = false;
            festGuessIdleVoiceRef.current = false;
            childHomeIdleHintVoiceRef.current = false;
            languageSelectionIdleHintVoiceRef.current = false;
            festivalSelectionIdleHintVoiceRef.current = false;
            entryVoPlayedForPhaseRef.current = null;
            reloadHandledRef.current = false;
            RECENT_STEP_VO.clear();

            setSelectedRegion(null);
            setSelectedLanguages([]);
            setSelectedFestivals([]);
            setDiscoveredLocations([]);
            setMglassPosition({ top: '30%', left: '20%' });
            setShowCelebration(false);
            setIsChildHomeContinueEnabled(false);
            setHasPressedLanguagePlay(false);
            setShowLanguageCards(false);
            setGaneshaHomeIdleLevel(0);
            setLangGuessIdleLevel(0);
            setFestGuessIdleLevel(0);
            setLangGuessPhase('guessing');
            setWrongLangGuesses(new Set());
            setShakeLang(null);
            setLangWrongReaction(null);
            setSwappingOutLangId(null);
            setShowLangSelectionHelper(false);
            setGuessPhase('guessing');
            setWrongGuesses(new Set());
            setShakeGuess(null);
            setActiveFestReaction(null);
            setSwappingOutFestId(null);
            setShowFestSelectionHelper(false);
            sceneActions.updateState({
              phase: STEPS.OPENING,
              selectedRegion: null,
              selectedLanguages: [],
              selectedFestivals: [],
              discoveredLocations: [],
              showCelebration: false,
              completed: false,
              showingCompletionScreen: false
            });
          }}
          onExploreZones={() => {
            if (onNavigate) onNavigate('zone-welcome');
            else if (onBack) onBack();
          }}
          onHome={() => {
            if (onNavigate) onNavigate('map');
          }}
        />
        );
      })()}

      {/* Ganesha Home Phase */}
      {phase === STEPS.GANESHA_HOME && (
        <div style={{ minHeight: '100vh', paddingTop: '40px', paddingBottom: '40px' }}>
          <StoryProgressHeader
            discoveries={discoveredLocations.length > 0 ? discoveredLocations.map(idx => ({ ...PHASE1_LOCATIONS[idx], image: PHASE1_LOCATIONS[idx].icon })) : []}
            isChildMode={false}
          />

          {/* India Map Container */}
          <div style={{
            position: 'relative',
            width: '900px',
            height: '980px',
            margin: '120px auto 0',
            maxWidth: '90vw',
            overflow: 'visible',
          }}>
            {/* Map */}
            <img
              src={indiaMapImage}
              alt="India Map"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {/* Mini gesture near discovered spot */}
            {miniGesture.show && miniGesture.target === 'phase1-spot' && miniGesture.position && (
              <div
                key={`phase1-mini-gesture-${miniGesture.key}`}
                style={{
                  position: 'absolute',
                  left: `${miniGesture.position.x}%`,
                  top: `${miniGesture.position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 14,
                  pointerEvents: 'none',
                  animation: `miniGesturePop ${miniGesture.durationMs}ms ease-out forwards`,
                }}
              >
                <img
                  src="/images/hand-thumbsup.svg"
                  alt=""
                  aria-hidden="true"
                  style={{
                    width: '56px',
                    height: '56px',
                    display: 'block',
                    filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25))',
                  }}
                />
              </div>
            )}

            {/* Undiscovered location targets with idle hint glow */}
            {GANESHA_SPOTS.map((spot, idx) => {
              const isDiscovered = discoveredLocations.includes(idx);
              const isUndiscovered = !isDiscovered;
              const shouldGlow = isUndiscovered && ganeshaHomeIdleLevel >= 1;

              return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  top: PHASE1_LOCATIONS[idx] ? `${PHASE1_LOCATIONS[idx].y}%` : '50%',
                  left: PHASE1_LOCATIONS[idx] ? `${PHASE1_LOCATIONS[idx].x}%` : '50%',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  border: 'none',
                  background: 'transparent',
                  pointerEvents: 'none',
                  zIndex: 1,
                  animation:
                    ganeshaHomeIdleLevel === 3
                      ? 'phase1HintGlowFinal 2s ease-in-out 3'
                      : ganeshaHomeIdleLevel === 2
                        ? 'phase1HintGlowGuide 1.6s ease-in-out 2'
                        : shouldGlow
                          ? 'phase1HintGlow 1.2s ease-in-out 1'
                          : 'none',
                }}
              />
            );
            })}

            {/* Per-tap sparkle overlay at discovered spot */}
            {phase1SpotSparkle.index !== null && PHASE1_LOCATIONS[phase1SpotSparkle.index] && (
              <div
                key={`phase1-spot-sparkle-wrap-${phase1SpotSparkle.key}`}
                style={{
                  position: 'absolute',
                  top: `${PHASE1_LOCATIONS[phase1SpotSparkle.index].y}%`,
                  left: `${PHASE1_LOCATIONS[phase1SpotSparkle.index].x}%`,
                  width: '120px',
                  height: '120px',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  zIndex: 30,
                }}
              >
                <SparkleAnimation
                  key={`phase1-spot-sparkle-${phase1SpotSparkle.key}`}
                  type="magic"
                  count={18}
                  color="rgba(0, 229, 255, 0.9)"
                  size={8}
                  duration={1000}
                  fadeOut={true}
                  area="full"
                />
              </div>
            )}

            {/* Discovered location icons */}
            {discoveredLocations.map((idx) => {
              const loc = PHASE1_LOCATIONS[idx];
              return (
                <div
                  key={`discovered-${idx}`}
                  style={{
                    position: 'absolute',
                    top: loc ? `${loc.y}%` : '50%',
                    left: loc ? `${loc.x}%` : '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120px',
                    height: '120px',
                    zIndex: 5,
                    animation: 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                  }}
                >
                  {loc?.icon && (
                    <img src={loc.icon} alt={loc.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  )}
                </div>
              );
            })}

            {/* Floating hearts on celebration */}
            {showCelebration && HEART_POSITIONS.map((pos, i) => (
              <div
                key={`heart-${i}`}
                style={{
                  position: 'absolute',
                  top: pos.top,
                  left: pos.left,
                  fontSize: '48px',
                  zIndex: 10,
                  animation: `floatUp 2s ease-out ${i * 0.15}s forwards`,
                  pointerEvents: 'none',
                }}
              >
                💖
              </div>
            ))}

            <style>{`
              @keyframes popIn {
                from { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
              }
              @keyframes floatUp {
                0% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(-120px); opacity: 0; }
              }
              @keyframes idleWobble {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-3deg); }
                75% { transform: rotate(3deg); }
              }
              @keyframes phase1HintGlow {
                0% {
                  box-shadow: 0 0 0 rgba(0, 229, 255, 0);
                }
                50% {
                  box-shadow: 0 0 18px rgba(0, 229, 255, 0.9);
                }
                100% {
                  box-shadow: 0 0 0 rgba(0, 229, 255, 0);
                }
              }
              @keyframes phase1HintGlowGuide {
                0% {
                  box-shadow: 0 0 0 rgba(0, 229, 255, 0);
                }
                50% {
                  box-shadow: 0 0 24px rgba(0, 229, 255, 0.95);
                }
                100% {
                  box-shadow: 0 0 0 rgba(0, 229, 255, 0);
                }
              }
              @keyframes phase1HintGlowFinal {
                0% {
                  box-shadow: 0 0 0 rgba(0, 229, 255, 0);
                }
                50% {
                  box-shadow: 0 0 30px rgba(0, 229, 255, 1);
                }
                100% {
                  box-shadow: 0 0 0 rgba(0, 229, 255, 0);
                }
              }
              @keyframes miniGesturePop {
                0% {
                  opacity: 0;
                  transform: translate(-50%, -50%) scale(0.6) translateY(20px);
                }
                20% {
                  opacity: 1;
                  transform: translate(-50%, -50%) scale(1.15) translateY(-10px);
                }
                50% {
                  opacity: 1;
                  transform: translate(-50%, -50%) scale(1) translateY(0px) rotate(6deg);
                }
                80% {
                  opacity: 0.9;
                  transform: translate(-50%, -50%) scale(1) translateY(-4px);
                }
                100% {
                  opacity: 0;
                  transform: translate(-50%, -50%) scale(0.8) translateY(-24px);
                }
              }
            `}</style>

            {/* Ganesha appears only after all locations discovered */}
            {showCelebration && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 3,
                pointerEvents: 'none',
                animation: 'popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}>
                <img src={babyGaneshaImg} alt="Ganesha" style={{ width: '200px', height: 'auto' }} />
              </div>
            )}

            {/* Draggable Magnifying Glass using FreeDraggableItem */}
            <FreeDraggableItem
              id="magnifying-glass"
              position={mglassPosition}
              onPositionChange={(newPos) => handleMglassMove(newPos)}
              bounds={{ top: 0, left: 0, right: 100, bottom: 100 }}
              style={{
                width: '160px',
                height: '160px',
                zIndex: 20,
                cursor: 'grab',
                animation: ganeshaHomeIdleLevel >= 1 ? 'idleWobble 0.5s ease-in-out infinite' : 'none',
              }}
            >
              <img
                src={mglass}
                alt="Magnifying Glass"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
            </FreeDraggableItem>
          </div>

        </div>
      )}

      {/* Child Home Phase */}
      {phase === STEPS.CHILD_HOME && (
        <div style={{ paddingTop: '40px', paddingBottom: '40px' }}>
          {/* Story header removed - only one region selection, header not needed */}

          {/* India Map Container with Region Badges */}
          <div style={{
            position: 'relative',
            width: '900px',
            height: '980px',
            margin: '120px auto 0',
            maxWidth: '90vw',
            overflow: 'visible',
          }}>
            {/* Map */}
            <img
              src={indiaMapImage}
              alt="India Map"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {/* Region Badges on Map */}
            {INDIA_REGIONS.filter(r => r.id !== 'kailash' && r.id !== 'other').map((region) => (
              <button
                key={region.id}
                onClick={(event) => handleRegionSelect(region, event)}
                style={{
                  position: 'absolute',
                  top: region.mapTop,
                  left: region.mapLeft,
                  transform: selectedRegion?.id === region.id ? 'translate(-50%, -50%) scale(1.08)' : 'translate(-50%, -50%)',
                  width: '120px',
                  padding: '12px 16px',
                  background: selectedRegion?.id === region.id ? '#FFE7A3' : '#F8F1E2',
                  border: selectedRegion?.id === region.id ? '3px solid #F4B942' : '2px solid #ccc',
                  borderRadius: '16px',
                  boxShadow: selectedRegion?.id === region.id
                    ? '0 10px 20px rgba(0,0,0,0.2), 0 0 0 5px rgba(108,195,255,0.5)'
                    : '0 4px 12px rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  zIndex: 5,
                  transition: 'all 0.2s ease',
                }}
              >
                <img src={region.icon} alt={region.label} style={{ width: '46px', height: '46px', objectFit: 'contain', margin: '0 auto 8px', display: 'block' }} />
                <div style={{
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#5D2E0F',
                  lineHeight: '1.2',
                }}>
                  {region.label}
                </div>
              </button>
            ))}

            {/* Selected region highlight on map */}
            {selectedRegion && selectedRegion.id !== 'other' && (
              <div
                style={{
                  position: 'absolute',
                  top: selectedRegion.mapTop,
                  left: selectedRegion.mapLeft,
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(108,195,255,0.62) 0%, rgba(108,195,255,0.18) 60%, rgba(108,195,255,0) 100%)',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              />
            )}

            {/* House Icon on Selected Region */}
            {selectedRegion && (
              <div
                style={{
                  position: 'absolute',
                  top: selectedRegion.mapTop,
                  left: selectedRegion.mapLeft,
                  transform: 'translate(-50%, -120%)',
                  fontSize: '48px',
                  zIndex: 10,
                  animation: 'housePop 0.45s ease-out',
                }}
              >
                🏠
              </div>
            )}

            {/* Outside India - Uses INDIA_REGIONS coordinates */}
            {(() => {
              const outsideIndiaRegion = INDIA_REGIONS.find(r => r.id === 'other');
              return (
            <button
              onClick={(event) => handleRegionSelect(outsideIndiaRegion, event)}
              style={{
                position: 'absolute',
                top: outsideIndiaRegion?.mapTop || '82%',
                left: outsideIndiaRegion?.mapLeft || '36%',
                transform: selectedRegion?.id === 'other' ? 'translate(-50%, -50%) scale(1.08)' : 'translate(-50%, -50%)',
                width: '120px',
                padding: '12px 10px',
                background: selectedRegion?.id === 'other' ? '#FFE7A3' : '#F8F1E2',
                border: selectedRegion?.id === 'other' ? '3px solid #F4B942' : '2px solid #ccc',
                borderRadius: '16px',
                boxShadow: selectedRegion?.id === 'other'
                  ? '0 10px 20px rgba(0,0,0,0.2), 0 0 0 5px rgba(108,195,255,0.5)'
                  : '0 4px 12px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                fontFamily: "'Baloo 2', cursive",
                fontSize: '12px',
                fontWeight: 700,
                color: '#5D2E0F',
                zIndex: 5,
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
            >
              <img src={otherLangIcon} alt="Elsewhere" style={{ width: '30px', height: '30px', objectFit: 'contain', margin: '0 auto 6px', display: 'block' }} />
              Outside India
            </button>
              );
            })()}

            {/* Continue Button — Positioned Below Map */}
            <button
              className="mis-continue-btn-uniform"
              onClick={() => {
                playUiTap();
                let advanced = false;
                const goToLanguagePhase = () => {
                  if (advanced) return;
                  advanced = true;
                  saveProgress(selectedRegion, null, null, STEPS.LANGUAGE_GANESHA);
                  sceneActions.updateState({ phase: STEPS.LANGUAGE_GANESHA });
                };

                if (isAudioOn) {
                  speakIfUnmuted(VOICE.child_home_confirmed, {
                    age: childAge,
                    moment: 'celebration',
                    onEnd: goToLanguagePhase,
                    onError: goToLanguagePhase,
                  });
                  // Failsafe: advance even if browser speech callbacks do not fire.
                  safeSetTimeout(goToLanguagePhase, 4500);
                } else {
                  goToLanguagePhase();
                }
              }}
              disabled={!isChildHomeContinueEnabled}
              style={{
                position: 'absolute',
                bottom: '-80px',
                left: '50%',
                marginTop: 0,
                ['--mis-continue-transform']: 'translateX(-50%)',
                ['--mis-continue-hover-transform']: 'translateX(-50%) translateY(-3px)',
                ['--mis-continue-active-transform']: 'translateX(-50%) translateY(-1px)',
                zIndex: 5,
              }}
            >
              Continue {'\u2192'}
            </button>

            <style>{`
              @keyframes housePop {
                0% { transform: translate(-50%, -120%) scale(0); }
                70% { transform: translate(-50%, -120%) scale(1.1); }
                100% { transform: translate(-50%, -120%) scale(1); }
              }
            `}</style>
          </div>
        </div>
      )}
      {/* Language Ganesha Phase — 4 Language Guess Game */}
      {phase === STEPS.LANGUAGE_GANESHA && (
        <div style={{ paddingTop: '60px', paddingBottom: '80px', minHeight: '100vh' }}>
          {/* Play Button Section */}
          <div style={{ textAlign: 'center', marginTop: '220px', marginBottom: '28px' }}>
            <button
              onClick={() => {
                playUiTap();
                if (!hasPressedLanguagePlay) {
                  setHasPressedLanguagePlay(true);
                }
                // Replaying Play should restart card hint timing from Level 1.
                setLangGuessIdleLevel(0);
                langGuessIdleVoiceRef.current = false;
                if (langGuessIdleTimerRef.current) clearTimeout(langGuessIdleTimerRef.current);
                setLangIdleRestartNonce(n => n + 1);
                const isFirstPlayReveal = !showLanguageCards;
                const revealCards = () => setShowLanguageCards(true);

                // Only first play should gate card reveal. Subsequent replays keep cards visible.
                if (isFirstPlayReveal) {
                  setShowLanguageCards(false);
                  if (isAudioOn) {
                    speakIfUnmuted(VOICE.language_audio, {
                      age: childAge,
                      moment: 'default',
                      onEnd: () => safeSetTimeout(revealCards, 200),
                      onError: () => safeSetTimeout(revealCards, 200)
                    });
                    // Safety fallback in case onEnd never fires on a device/browser edge-case.
                    safeSetTimeout(revealCards, 7000);
                  } else {
                    safeSetTimeout(revealCards, 250);
                  }
                  return;
                }

                // Replay mode: keep cards visible while mantra plays.
                speakIfUnmuted(VOICE.language_audio, { age: childAge, moment: 'default' });
              }}
              disabled={langGuessPhase === 'correct'}
              style={{
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                cursor: langGuessPhase === 'correct' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none',
                transition: 'all 0.2s',
                margin: '0 auto',
                animation: !hasPressedLanguagePlay && langGuessPhase !== 'correct' ? 'pulse 1.5s ease-in-out infinite' : 'none',
                opacity: langGuessPhase === 'correct' ? 0.5 : 1,
              }}
            >
              <img src={playLangIcon} alt="Play" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
            </button>
          </div>

          {/* Language Cards Grid — 2x2 (Hidden until mantra finishes) */}
          {showLanguageCards && (
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '72px',
            padding: '0 24px',
            marginBottom: '80px',
            animation: 'fadeIn 0.6s ease-out',
          }}>
            {[
              { id: 'hindi', label: 'Hindi', script: 'हिंदी', icon: hindiLangIcon, color: '#FF9933' },
              { id: 'tamil', label: 'Tamil', script: 'தமிழ்', icon: tamilLangIcon, color: '#E91E63' },
              { id: 'sanskrit', label: 'Sanskrit', script: 'संस्कृत', icon: sanskritLangIcon, color: '#FFD700' },
              { id: 'telugu', label: 'Telugu', script: 'తెలుగు', icon: teluguLangIcon, color: '#9C27B0' },
            ].map((lang) => {
              const isSelected = langGuessPhase === 'correct' && lang.id === 'sanskrit';
              return (
              <button
                key={lang.id}
                className={`card ${isSelected ? 'selected' : ''} ${wrongLangGuesses.has(lang.id) ? 'wrong' : ''} ${langGuessIdleLevel === 1 && lang.id === 'sanskrit' ? 'hint' : ''} ${langGuessIdleLevel === 2 && lang.id === 'sanskrit' ? 'hint-strong' : ''} ${langGuessIdleLevel === 3 && lang.id === 'sanskrit' ? 'hint-final' : ''}`}
                onClick={() => {
                  if (!hasPressedLanguagePlay) {
                    playUiTap();
                    speakIfUnmuted(VOICE.language_play_first, { age: childAge, moment: 'default' });
                    return;
                  }
                  setLangGuessIdleLevel(0);
                  langGuessIdleVoiceRef.current = false;
                  if (langGuessIdleTimerRef.current) clearTimeout(langGuessIdleTimerRef.current);
                  handleLanguageGuess(lang);
                }}
                disabled={wrongLangGuesses.has(lang.id) || langGuessPhase === 'correct'}
                style={{
                  width: '100%',
                  minHeight: '280px',
                  padding: '28px',
                  border: 'none',
                  backgroundColor: '#F8F1E2',
                  cursor: (wrongLangGuesses.has(lang.id) || langGuessPhase === 'correct') ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  boxShadow: isSelected ? undefined : '0 6px 16px rgba(0, 0, 0, 0.16)',
                  transform: isSelected ? undefined : 'scale(1)',
                  position: 'relative',
                }}
              >
                <img src={lang.icon} alt={lang.label} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                <div style={{
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#654321',
                }}>
                  {lang.label}
                </div>
                <div style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '20px',
                  color: '#8B6914',
                }}>
                  {lang.script}
                </div>
              </button>
            );
            })}
          </div>
          )}

          {/* Phase-local animation utilities */}
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.08); }
              100% { transform: scale(1); }
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes swapOut {
              0% { transform: scale(1); opacity: 1; }
              100% { transform: scale(0.85); opacity: 0.3; }
            }
            @keyframes popIn {
              0% { transform: scale(0.85); }
              70% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
            @keyframes glow {
              0%, 100% { box-shadow: 0 6px 16px rgba(255, 215, 106, 0.3); }
              50% { box-shadow: 0 6px 20px rgba(255, 215, 106, 0.6); }
            }
          `}</style>
        </div>
      )}

      {/* Language Child Phase — 12 Language Selection */}
      {phase === STEPS.LANGUAGE_CHILD && (
        <div style={{ paddingTop: '60px', paddingBottom: '80px', minHeight: '100vh' }}>
          {selectedLanguages.length > 0 && (
            <StoryProgressHeader discoveries={selectedLanguages.map(lang => ({ ...lang, image: lang.icon, name: lang.label }))} isChildMode={false} />
          )}

          <div style={{ maxWidth: '1100px', margin: '140px auto 0', padding: '0 24px' }}>
            {/* Most Spoken At Home */}
            <div style={{ marginBottom: '80px' }}>
              <h3 style={{ fontFamily: "'Baloo 2', cursive", fontSize: '28px', fontWeight: 700, color: '#8B6914', textAlign: 'center', marginBottom: '40px' }}>
                Most Spoken At Home
              </h3>
              {showLangSelectionHelper && (
                <div style={{
                  textAlign: 'center',
                  marginBottom: '30px',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '16px',
                  color: '#4A3A2F',
                  fontWeight: 600,
                  background: '#F7F1E3',
                  borderRadius: '42px',
                  padding: '12px 24px',
                  display: 'inline-block',
                  margin: '0 auto 30px',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  Pick 3. Tap another to change.
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', marginBottom: '40px' }}>
                {[
                  LANGUAGE_MAP['hindi'],
                  LANGUAGE_MAP['english'],
                  LANGUAGE_MAP['tamil'],
                  LANGUAGE_MAP['marathi'],
                ].filter(Boolean).map((lang) => (
                  <button
                    key={lang.id}
                    onClick={(event) => toggleLanguage(lang, event)}
                    disabled={false}
                    style={{
                      width: '100%',
                      minHeight: '160px',
                      padding: '20px',
                      borderRadius: '20px',
                      border: selectedLanguages.find(l => l.id === lang.id) ? `4px solid #FFD76A` : '2px solid #E0E0E0',
                      backgroundColor: selectedLanguages.find(l => l.id === lang.id) ? '#FFFBE9' : '#F8F1E2',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      transition: swappingOutLangId === lang.id ? 'none' : 'all 0.2s',
                      boxShadow: selectedLanguages.find(l => l.id === lang.id) ? '0 6px 16px rgba(255, 215, 106, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.08)',
                      transform: selectedLanguages.find(l => l.id === lang.id) ? 'scale(1.05)' : 'scale(1)',
                      opacity: swappingOutLangId === lang.id ? 0.3 : 1,
                      position: 'relative',
                      animation: swappingOutLangId === lang.id ? 'swapOut 0.3s ease-out forwards' : 'none',
                    }}
                  >
                    {selectedLanguages.find(l => l.id === lang.id) && <div style={{ fontSize: '18px', position: 'absolute', top: '8px', right: '12px', fontWeight: 'bold' }}>✓</div>}
                    <img src={lang.icon} alt={lang.label} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                    <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: '16px', fontWeight: 700, color: '#654321' }}>
                      {lang.label}
                    </div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: '12px', color: '#8B6914' }}>
                      {lang.script}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* More Languages */}
            <div>
              <h3 style={{ fontFamily: "'Baloo 2', cursive", fontSize: '28px', fontWeight: 700, color: '#8B6914', textAlign: 'center', marginBottom: '40px' }}>
                More Languages
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', marginBottom: '60px' }}>
                {[
                  LANGUAGE_MAP['gujarati'],
                  LANGUAGE_MAP['bengali'],
                  LANGUAGE_MAP['kannada'],
                  LANGUAGE_MAP['malayalam'],
                  LANGUAGE_MAP['punjabi'],
                  LANGUAGE_MAP['telugu'],
                  LANGUAGE_MAP['sanskrit'],
                  LANGUAGE_MAP['other'],
                ].filter(Boolean).map((lang) => (
                  <button
                    key={lang.id}
                    onClick={(event) => toggleLanguage(lang, event)}
                    disabled={false}
                    style={{
                      width: '100%',
                      minHeight: '160px',
                      padding: '20px',
                      borderRadius: '20px',
                      border: selectedLanguages.find(l => l.id === lang.id) ? `4px solid #FFD76A` : '2px solid #E0E0E0',
                      backgroundColor: selectedLanguages.find(l => l.id === lang.id) ? '#FFFBE9' : '#F8F1E2',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      transition: swappingOutLangId === lang.id ? 'none' : 'all 0.2s',
                      boxShadow: selectedLanguages.find(l => l.id === lang.id) ? '0 6px 16px rgba(255, 215, 106, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.08)',
                      transform: selectedLanguages.find(l => l.id === lang.id) ? 'scale(1.05)' : 'scale(1)',
                      opacity: swappingOutLangId === lang.id ? 0.3 : 1,
                      position: 'relative',
                      animation: swappingOutLangId === lang.id ? 'swapOut 0.3s ease-out forwards' : 'none',
                    }}
                  >
                    {selectedLanguages.find(l => l.id === lang.id) && <div style={{ fontSize: '18px', position: 'absolute', top: '8px', right: '12px', fontWeight: 'bold' }}>✓</div>}
                    <img src={lang.icon} alt={lang.label} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                    <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: '16px', fontWeight: 700, color: '#654321' }}>
                      {lang.label}
                    </div>
                    <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: '12px', color: '#8B6914' }}>
                      {lang.script}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selection Counter */}
            {selectedLanguages.length > 0 && (
              <div style={{ textAlign: 'center', marginBottom: '40px', fontFamily: "'Nunito', sans-serif", fontSize: '14px', color: '#8B6914', fontWeight: 600 }}>
                Pick up to 3 languages. {selectedLanguages.length} of 3 selected
              </div>
            )}

            {/* Continue Button */}
            {selectedLanguages.length > 0 && (
              <button
                className="mis-continue-btn-uniform"
                onClick={() => {
                  playUiTap();
                  let advanced = false;
                  const goToFestivalsPhase = () => {
                    if (advanced) return;
                    advanced = true;
                    sceneActions.updateState({ phase: STEPS.FESTIVALS_GANESHA });
                  };

                  if (isAudioOn) {
                    speakIfUnmuted(VOICE.language_confirmed, {
                      age: childAge,
                      moment: 'celebration',
                      onEnd: goToFestivalsPhase,
                      onError: goToFestivalsPhase,
                    });
                    safeSetTimeout(goToFestivalsPhase, 4500);
                  } else {
                    goToFestivalsPhase();
                  }
                }}
                style={{
                  display: 'block',
                  margin: '60px auto 0',
                }}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      )}

      {/* Festivals Ganesha Phase — 5 Festival Guess Game (2x3 Layout) */}
      {phase === STEPS.FESTIVALS_GANESHA && (
        <div style={{
          minHeight: '100vh',
          paddingTop: '60px',
          paddingBottom: '80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {/* Festival Cards Container — Flexbox for proper centering */}
          <div style={{
            marginTop: '360px',
            marginBottom: '80px',
          }}>
            {/* TOP ROW: 2 cards centered */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '48px',
              marginBottom: '48px',
              flexWrap: 'wrap',
            }}>
              <button
                key="pongal"
                className={`card mis-fest-guess-card ${shakeGuess === 'pongal' ? 'wrong' : ''}`}
                onClick={() => {
                  setFestGuessIdleLevel(0);
                  festGuessIdleVoiceRef.current = false;
                  if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
                  handleFestivalGuess(FESTIVAL_MAP['pongal']);
                }}
                disabled={guessPhase === 'correct'}
                style={{
                  width: 'clamp(128px, 28vw, 220px)',
                  height: 'clamp(128px, 28vw, 220px)',
                  padding: '20px',
                  border: 'none',
                  backgroundColor: '#F8F1E2',
                  cursor: guessPhase === 'correct' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  opacity: 1,
                }}
              >
                <img src={pongalIcon} alt="Pongal" style={{ width: '82%', height: '82%', objectFit: 'contain' }} />
              </button>
              <button
                key="holi"
                className={`card mis-fest-guess-card ${shakeGuess === 'holi' ? 'wrong' : ''}`}
                onClick={() => {
                  setFestGuessIdleLevel(0);
                  festGuessIdleVoiceRef.current = false;
                  if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
                  handleFestivalGuess(FESTIVAL_MAP['holi']);
                }}
                disabled={guessPhase === 'correct'}
                style={{
                  width: 'clamp(128px, 28vw, 220px)',
                  height: 'clamp(128px, 28vw, 220px)',
                  padding: '20px',
                  border: 'none',
                  backgroundColor: '#F8F1E2',
                  cursor: guessPhase === 'correct' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  opacity: 1,
                }}
              >
                <img src={holiIcon} alt="Holi" style={{ width: '82%', height: '82%', objectFit: 'contain' }} />
              </button>
            </div>

            {/* BOTTOM ROW: 3 cards centered */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '48px',
              flexWrap: 'wrap',
            }}>
              <button
                key="janmashtami"
                className={`card mis-fest-guess-card ${shakeGuess === 'janmashtami' ? 'wrong' : ''}`}
                onClick={() => {
                  setFestGuessIdleLevel(0);
                  festGuessIdleVoiceRef.current = false;
                  if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
                  handleFestivalGuess(FESTIVAL_MAP['janmashtami']);
                }}
                disabled={guessPhase === 'correct'}
                style={{
                  width: 'clamp(128px, 28vw, 220px)',
                  height: 'clamp(128px, 28vw, 220px)',
                  padding: '20px',
                  border: 'none',
                  backgroundColor: '#F8F1E2',
                  cursor: guessPhase === 'correct' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  opacity: 1,
                }}
              >
                <img src={janmashtamiIcon} alt="Janmashtami" style={{ width: '82%', height: '82%', objectFit: 'contain' }} />
              </button>
              <button
                key="ganesh"
                className={`card mis-fest-guess-card ${guessPhase === 'correct' ? 'selected' : ''} ${festGuessIdleLevel === 1 ? 'hint' : ''} ${festGuessIdleLevel === 2 ? 'hint-strong' : ''} ${festGuessIdleLevel === 3 ? 'hint-final' : ''}`}
                onClick={() => {
                  setFestGuessIdleLevel(0);
                  festGuessIdleVoiceRef.current = false;
                  if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
                  handleFestivalGuess(FESTIVAL_MAP['ganesh']);
                }}
                disabled={guessPhase === 'correct'}
                style={{
                  width: 'clamp(128px, 28vw, 220px)',
                  height: 'clamp(128px, 28vw, 220px)',
                  padding: '20px',
                  border: 'none',
                  backgroundColor: '#F8F1E2',
                  cursor: guessPhase === 'correct' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: guessPhase === 'correct' ? undefined : '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transform: guessPhase === 'correct' ? undefined : 'scale(1)',
                  opacity: 1,
                  animation: guessPhase === 'correct' ? 'none' : undefined,
                }}
              >
                <img src={modakImage} alt="Ganesh Chaturthi - Modak" style={{ width: '82%', height: '82%', objectFit: 'contain' }} />
              </button>
              <button
                key="diwali"
                className={`card mis-fest-guess-card ${shakeGuess === 'diwali' ? 'wrong' : ''}`}
                onClick={() => {
                  setFestGuessIdleLevel(0);
                  festGuessIdleVoiceRef.current = false;
                  if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
                  handleFestivalGuess(FESTIVAL_MAP['diwali']);
                }}
                disabled={guessPhase === 'correct'}
                style={{
                  width: 'clamp(128px, 28vw, 220px)',
                  height: 'clamp(128px, 28vw, 220px)',
                  padding: '20px',
                  border: 'none',
                  backgroundColor: '#F8F1E2',
                  cursor: guessPhase === 'correct' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  opacity: 1,
                }}
              >
                <img src={diwaliIcon} alt="Diwali" style={{ width: '82%', height: '82%', objectFit: 'contain' }} />
              </button>
            </div>
          </div>

          {/* Correct Celebration Sparkle */}
          {guessPhase === 'correct' && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1500, pointerEvents: 'none' }}>
              <SparkleAnimation
                type="star"
                count={20}
                color="rgba(255, 200, 87, 0.8)"
                size={6}
                duration={2000}
                fadeOut={true}
                area="full"
                key={sparkleState.key}
              />
            </div>
          )}


          {/* Animations */}
          <style>{`
            @keyframes popIn {
              0% { transform: scale(0.9); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes glow {
              0% { box-shadow: 0 0 0 rgba(255, 200, 87, 0.6), 0px 6px 12px rgba(0,0,0,0.12); }
              50% { box-shadow: 0 0 25px rgba(255, 200, 87, 0.8), 0px 6px 12px rgba(0,0,0,0.12); }
              100% { box-shadow: 0 0 20px rgba(255, 200, 87, 0.6), 0px 6px 12px rgba(0,0,0,0.12); }
            }
          `}</style>
        </div>
      )}

      {/* Festivals Child Phase — Festival Selection (2-Section Layout) */}
      {phase === STEPS.FESTIVALS_CHILD && (
        <div style={{
          minHeight: '100vh',
          paddingTop: '60px',
          paddingBottom: '80px',
        }}>
          {selectedFestivals.length > 0 && (
            <StoryProgressHeader discoveries={selectedFestivals.map(fest => ({ ...fest, image: fest.icon, name: fest.label }))} isChildMode={false} />
          )}

          <div style={{ maxWidth: '1200px', margin: '140px auto 0', padding: '0 24px' }}>
            {/* COMMON FESTIVALS (Top Row - 4 cards) */}
            <div style={{ marginBottom: '80px' }}>
              <h3 style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: '28px',
                fontWeight: 700,
                color: '#8B6914',
                textAlign: 'center',
                marginBottom: '40px',
              }}>
                Common Festivals
              </h3>
              {showFestSelectionHelper && (
                <div style={{
                  textAlign: 'center',
                  marginBottom: '30px',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '16px',
                  color: '#4A3A2F',
                  fontWeight: 600,
                  background: '#F7F1E3',
                  borderRadius: '42px',
                  padding: '12px 24px',
                  display: 'inline-block',
                  margin: '0 auto 30px',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  Pick 4. Tap another to change.
                </div>
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '32px',
                marginBottom: '40px',
              }}>
                {COMMON_FESTIVALS.filter(Boolean).map((fest) => (
                  <button
                    key={fest.id}
                    onClick={(event) => toggleFestival(fest, event)}
                    disabled={false}
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '20px',
                      borderRadius: '20px',
                      border: selectedFestivals.find(f => f.id === fest.id) ? '2px solid #FFC857' : '2px solid #E0E0E0',
                      backgroundColor: selectedFestivals.find(f => f.id === fest.id) ? '#FFF4D8' : '#F8F1E2',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      outline: 'none',
                      WebkitTapHighlightColor: 'transparent',
                      gap: '12px',
                      transition: swappingOutFestId === fest.id ? 'none' : 'all 0.3s',
                      boxShadow: selectedFestivals.find(f => f.id === fest.id)
                        ? '0 6px 16px rgba(255, 200, 87, 0.4)'
                        : '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: selectedFestivals.find(f => f.id === fest.id) ? 'scale(1.05)' : 'scale(1)',
                      opacity: swappingOutFestId === fest.id ? 0.3 : 1,
                      position: 'relative',
                      animation: swappingOutFestId === fest.id ? 'swapOut 0.3s ease-out forwards' : 'none',
                    }}
                  >
                    <img src={fest.icon} alt={fest.label} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                    <div style={{
                      fontFamily: "'Baloo 2', cursive",
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#654321',
                    }}>
                      {fest.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* OTHER FESTIVALS (Bottom Grid - 8 cards in 4x2) */}
            <div>
              <h3 style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: '28px',
                fontWeight: 700,
                color: '#8B6914',
                textAlign: 'center',
                marginBottom: '40px',
              }}>
                Other Festivals
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '32px',
                marginBottom: '60px',
              }}>
                {OTHER_FESTIVALS.filter(Boolean).map((fest) => (
                  <button
                    key={fest.id}
                    onClick={(event) => toggleFestival(fest, event)}
                    disabled={false}
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '20px',
                      borderRadius: '20px',
                      border: selectedFestivals.find(f => f.id === fest.id) ? '2px solid #FFC857' : '2px solid #E0E0E0',
                      backgroundColor: selectedFestivals.find(f => f.id === fest.id) ? '#FFF4D8' : '#F8F1E2',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      outline: 'none',
                      WebkitTapHighlightColor: 'transparent',
                      gap: '12px',
                      transition: swappingOutFestId === fest.id ? 'none' : 'all 0.3s',
                      boxShadow: selectedFestivals.find(f => f.id === fest.id)
                        ? '0 6px 16px rgba(255, 200, 87, 0.4)'
                        : '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: selectedFestivals.find(f => f.id === fest.id) ? 'scale(1.05)' : 'scale(1)',
                      opacity: swappingOutFestId === fest.id ? 0.3 : 1,
                      position: 'relative',
                      animation: swappingOutFestId === fest.id ? 'swapOut 0.3s ease-out forwards' : 'none',
                    }}
                  >
                    <img src={fest.icon} alt={fest.label} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                    <div style={{
                      fontFamily: "'Baloo 2', cursive",
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#654321',
                    }}>
                      {fest.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selection Count */}
            {selectedFestivals.length > 0 && (
              <div style={{
                textAlign: 'center',
                marginBottom: '40px',
                fontFamily: "'Nunito', sans-serif",
                fontSize: '14px',
                color: '#8B6914',
                fontWeight: 600,
              }}>
                Pick up to 4 festivals. {selectedFestivals.length} of 4 selected
              </div>
            )}

            {/* Continue Button */}
            {selectedFestivals.length > 0 && (
              <button
                className="mis-continue-btn-uniform"
                onClick={() => {
                  playUiTap();
                  let advanced = false;
                  const goToOriginPhase = () => {
                    if (advanced) return;
                    advanced = true;
                    sceneActions.updateState({ phase: STEPS.ORIGIN_CARD });
                  };

                  if (isAudioOn) {
                    speakIfUnmuted(VOICE.festivals_confirmed, {
                      age: childAge,
                      moment: 'celebration',
                      onEnd: goToOriginPhase,
                      onError: goToOriginPhase,
                    });
                    safeSetTimeout(goToOriginPhase, 4500);
                  } else {
                    goToOriginPhase();
                  }
                }}
                style={{
                  display: 'block',
                  margin: '60px auto 0',
                }}
              >
                See Our Story 🌟
              </button>
            )}
          </div>
        </div>
      )}

      {/* Origin Card Phase */}
      {phase === STEPS.ORIGIN_CARD && phase !== STEPS.COMPLETE && (
        <AboutMeComparisonCard
          className="aboutme-comparison--family-size"
          title="Our Stories Connect!"
          subtitle={null}
          onContinue={() => {
            playUiTap();
            playChime();
            handleComplete();
          }}
          leftColumn={{
            header: (
              <img
                src={babyGaneshaImg}
                alt="Ganesha"
                style={{
                  width: '96px',
                  height: '96px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.2))'
                }}
              />
            ),
            title: "Ganesha's Story",
            items: [
              { label: 'Home', imageSrc: northIcon, imageAlt: 'India', text: 'All of India' },
              { label: 'Language', imageSrc: sanskritLangIcon, imageAlt: 'Sanskrit', text: 'Sanskrit', wide: true },
              { label: 'Celebration', imageSrc: chaturthiIcon, imageAlt: 'Ganesh Chaturthi', text: 'Ganesh Chaturthi', wide: true }
            ]
          }}
          rightColumn={{
            header: (
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: (activeProfile?.icon || activeProfile?.profileIcon || profileAvatarImage) ? 'transparent' : 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                  border: (activeProfile?.icon || activeProfile?.profileIcon || profileAvatarImage) ? 'none' : '4px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: '40px',
                  color: 'white',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                  overflow: 'hidden'
                }}
              >
                {activeProfile?.icon ? (
                  <img src={activeProfile.icon} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : activeProfile?.profileIcon ? (
                  <img src={activeProfile.profileIcon} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : profileAvatarImage ? (
                  <img src={profileAvatarImage} alt={profileDisplayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  profileAvatar
                )}
              </div>
            ),
            title: `${profileDisplayName}'s Story`,
            items: [
              // Row 1: Home
              {
                label: 'Home',
                imageSrc: selectedRegion?.icon || northIcon,
                imageAlt: selectedRegion?.label || 'Home',
                text: selectedRegion?.label?.split(' ')[0] || '?'
              },
              // Row 2: Languages (grouped custom rendering)
              {
                label: 'Language',
                wide: true,
                custom: (
                  <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                    {selectedLanguages.map(lang => (
                      <div key={lang.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <img src={lang?.icon} alt={lang?.label} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                        <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: '16px', fontWeight: 700, color: '#3e2723', textAlign: 'center' }}>{lang?.label}</div>
                      </div>
                    ))}
                  </div>
                )
              },
              // Row 3: Festivals (grouped custom rendering)
              {
                label: 'Festivals',
                wide: true,
                custom: (
                  <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                    {selectedFestivals.map(fest => (
                      <div key={fest.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <img src={fest?.icon} alt={fest?.label} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                        <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: '16px', fontWeight: 700, color: '#3e2723', textAlign: 'center' }}>{fest?.label}</div>
                      </div>
                    ))}
                  </div>
                )
              }
            ]
          }}
        />
      )}

    </div>
  );
}
