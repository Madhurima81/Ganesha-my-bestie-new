import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MyIndianStoryGame.css';
import '../../shared/components/OpeningModal.css';
import '../comparisoncard.css';
import SceneCompletionCelebration from '../../../lib/components/celebration/SceneCompletionCelebration';
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
import bgImage from './assets/images/name_background.jpg';
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
  { id: 'other',     label: 'Outside India',                 states: 'Outside India or multiple states',         emoji: '??', icon: null,           color: '#888', mapTop: '50%', mapLeft: '50%', ganeshaFact: 'Wherever your family is from, India lives in your heart! ??' },
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

// Common Festivals (top row - 4 cards)
const COMMON_FESTIVALS = [
  FESTIVALS.find(f => f.id === 'diwali'),
  FESTIVALS.find(f => f.id === 'holi'),
  FESTIVALS.find(f => f.id === 'ganesh'),
  FESTIVALS.find(f => f.id === 'navratri'),
];

// Other Festivals (bottom grid - 8 cards)
const OTHER_FESTIVALS = [
  FESTIVALS.find(f => f.id === 'pongal'),
  FESTIVALS.find(f => f.id === 'onam'),
  FESTIVALS.find(f => f.id === 'janmashtami'),
  FESTIVALS.find(f => f.id === 'durga_puja'),
  FESTIVALS.find(f => f.id === 'dussehra'),
  FESTIVALS.find(f => f.id === 'eid'),
  FESTIVALS.find(f => f.id === 'christmas'),
  FESTIVALS.find(f => f.id === 'rakhi'),
];

const FESTIVAL_GUESS_CARDS = [
  FESTIVALS.find(f => f.id === 'pongal'),
  FESTIVALS.find(f => f.id === 'holi'),
  FESTIVALS.find(f => f.id === 'janmashtami'),
  FESTIVALS.find(f => f.id === 'ganesh'),
  FESTIVALS.find(f => f.id === 'diwali'),
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
export default function MyIndianStoryGame({ onComplete, onBack, onNavigate, childName = 'friend', childAge = 8, zoneId = 'about-me-hut', sceneId = 'indian-story' }) {
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
          />
        )}
      </SceneManager>
    </ErrorBoundary>
  );
}

// =========================================================
// 2. CONTENT COMPONENT
// =========================================================
function MyIndianStoryGameContent({ sceneState, sceneActions, isReload, onComplete, onNavigate, onBack, childName = 'friend', childAge = 8 }) {
  // ─── PHASE (from SceneManager - single source of truth) ───────────
  const phase = sceneState.phase || STEPS.OPENING;

  // ─── STATE ───────────────────────────────────────────────────────
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedFestivals, setSelectedFestivals] = useState([]);

  // Phase 1 state
  const [discoveredLocations, setDiscoveredLocations] = useState([]);
  const [revealedSpots, setRevealedSpots] = useState([]);
  const [activeSpotFact, setActiveSpotFact] = useState(null);
  const [mglassPosition, setMglassPosition] = useState({ top: '30%', left: '20%' });
  const [showCelebration, setShowCelebration] = useState(false);
  const [phase1SpotSparkle, setPhase1SpotSparkle] = useState({ index: null, key: 0 });
  const [isChildHomeContinueEnabled, setIsChildHomeContinueEnabled] = useState(false);

  // Language phase state
  const [langGuessPhase, setLangGuessPhase] = useState('guessing');
  const [wrongLangGuesses, setWrongLangGuesses] = useState(new Set());
  const [shakeLang, setShakeLang] = useState(null);
  const [langWrongReaction, setLangWrongReaction] = useState(null);

  // Festival phase state
  const [guessPhase, setGuessPhase] = useState('guessing');
  const [wrongGuesses, setWrongGuesses] = useState(new Set());
  const [shakeGuess, setShakeGuess] = useState(null);
  const [activeFestReaction, setActiveFestReaction] = useState(null);
  const [returnHintNonce, setReturnHintNonce] = useState(0);

  // Gesture & sparkle
  const [miniGesture, setMiniGesture] = useState({ show: false, target: 'center', position: null, durationMs: 1500, key: 0 });
  const [sparkleState, setSparkleState] = useState({ type: null, key: 0 });

  // Idle Hint Level for Ganesha Home Phase
  const [ganeshaHomeIdleLevel, setGaneshaHomeIdleLevel] = useState(0);
  const ganeshaHomeIdleTimerRef = useRef(null);
  const ganeshaHomeIdleVoiceRef = useRef(false);

  // Idle Hint Level for Language Ganesha Phase
  const [langGuessIdleLevel, setLangGuessIdleLevel] = useState(0);
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
  const { setCurrentPhase } = useVoiceGuidance('about-me-hut', 'indian-story', {
    enableMusic: true,
    musicVolume: 0.07,
    voiceVolume: 0.65,
    sfxVolume: 0.7,
    idleTimeout: 25,
    resumeDelay: RESUME_DELAY_MS,
    onReturnHint,
  });
  const { countdownValue } = useResumeCountdown(RESUME_DELAY_MS / 1000);
  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: () => {
      stop();
    },
    onShow: () => {
      onReturnHint();
    },
    resumeDelay: RESUME_DELAY_MS
  });

  // Refs
  const discoveredRef = useRef(new Set());
  const miniGestureTimerRef = useRef(null);
  const sparkleCancelRef = useRef(null);
  const phase1SpotSparkleTimerRef = useRef(null);
  const childHomeEntryVoiceTimerRef = useRef(null);
  const childHomeIdleTimerRef = useRef(null);
  const childHomePostSelectTimerRef = useRef(null);
  const lastDiscoveryTime = useRef(0);
  const reloadHandledRef = useRef(false);

  // Stop voice on unmount
  useEffect(() => {
    return () => {
      stop();
      clearAllTimeouts();
      if (miniGestureTimerRef.current) clearTimeout(miniGestureTimerRef.current);
      if (sparkleCancelRef.current) clearTimeout(sparkleCancelRef.current);
      if (phase1SpotSparkleTimerRef.current) clearTimeout(phase1SpotSparkleTimerRef.current);
      if (childHomeEntryVoiceTimerRef.current) clearTimeout(childHomeEntryVoiceTimerRef.current);
      if (childHomeIdleTimerRef.current) clearTimeout(childHomeIdleTimerRef.current);
      if (childHomePostSelectTimerRef.current) clearTimeout(childHomePostSelectTimerRef.current);
    };
  }, [stop, clearAllTimeouts]);

  // Restore selections from sceneState on reload
  useEffect(() => {
    if (isReload && !reloadHandledRef.current) {
      reloadHandledRef.current = true;
      if (sceneState.selectedRegion) setSelectedRegion(sceneState.selectedRegion);
      if (sceneState.selectedLanguages?.length) setSelectedLanguages(sceneState.selectedLanguages);
      if (sceneState.selectedFestivals?.length) setSelectedFestivals(sceneState.selectedFestivals);
    }
  }, [isReload, sceneState]);

  // Audio & Music Setup
  useEffect(() => {
    setCurrentPhase(phase);
  }, [phase, setCurrentPhase]);

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

  const triggerSparkle = useCallback((type, durationMs = 1500) => {
    if (sparkleCancelRef.current) clearTimeout(sparkleCancelRef.current);
    setSparkleState(prev => ({ type, key: prev.key + 1 }));
    sparkleCancelRef.current = setTimeout(() => {
      setSparkleState(prev => ({ ...prev, type: null }));
    }, durationMs + 50);
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
    opening:        `Let's discover where our story in India begins.`,
    ganesha_home:   `I live in three special places in India. Drag the magnifying glass to find me!`,
    child_home_entry: `Now tell me where is your home in India? Tap the place where your family lives.`,
    child_home_idle: `Look closely… can you find your home?`,
    language_guess:   `Can you guess my language? Tap play to listen… then tap the correct card!`,
    language_audio:   `Vakratunda Mahakaya Suryakoti Samaprabha!`,
    language_correct: `Yes! That's Sanskrit — the language of mantras and shlokas.`,
    language_wheel:   `Which language does your family speak at home? Tap the cards to choose.`,
    language_confirmed: `Wonderful! These are the languages your family speaks.`,
    festivals_guess:  `I have a favourite festival! Can you guess which one?`,
    festivals_wheel:  `Wonderful! Which festivals does your family celebrate?`,
    origin_card:      `Look, ${childName}! Our stories meet right here in India.`,
  };

  const langVoice = langGuessPhase === 'revealed' ? VOICE.language_wheel : VOICE.language_guess;
  const festVoice = guessPhase === 'revealed' ? VOICE.festivals_wheel : VOICE.festivals_guess;

  // Speak on step change
  useEffect(() => {
    const voiceMap = {
      [STEPS.OPENING]:           { text: VOICE.opening,      moment: 'greeting'    },
      [STEPS.GANESHA_HOME]:      { text: VOICE.ganesha_home, moment: 'story'       },
      [STEPS.LANGUAGE_GANESHA]:  { text: langVoice,           moment: 'default'     },
      [STEPS.LANGUAGE_CHILD]:    { text: langVoice,           moment: 'default'     },
      [STEPS.FESTIVALS_GANESHA]: { text: festVoice,           moment: 'default'     },
      [STEPS.FESTIVALS_CHILD]:   { text: festVoice,           moment: 'celebration' },
      [STEPS.ORIGIN_CARD]:       { text: VOICE.origin_card,  moment: 'gratitude'   },
    };
    const info = voiceMap[phase];
    if (info) speakIfUnmuted(info.text, { age: childAge, moment: info.moment });
  }, [phase, VOICE.opening, VOICE.ganesha_home, VOICE.origin_card, langVoice, festVoice, speakIfUnmuted, childAge]);

  const getPhaseReminderLine = useCallback((phase) => {
    switch (phase) {
      case STEPS.GANESHA_HOME:
        return 'Drag the magnifying glass to find my special places!';
      case STEPS.CHILD_HOME:
        return 'Tap where your family lives in India.';
      case STEPS.LANGUAGE_GANESHA:
        return 'Tap play and choose the correct language card.';
      case STEPS.LANGUAGE_CHILD:
        return 'Choose up to three languages your family speaks.';
      case STEPS.FESTIVALS_GANESHA:
        return 'Tap my favourite festival card.';
      case STEPS.FESTIVALS_CHILD:
        return 'Choose the festivals your family celebrates.';
      case STEPS.ORIGIN_CARD:
        return `Our stories connect in India, ${childName}!`;
      default:
        return null;
    }
  }, [childName]);

  useEffect(() => {
    if (!returnHintNonce || !isAudioOn) return;
    const line = getPhaseReminderLine(phase);
    if (!line) return;
    speakIfUnmuted(line, { age: childAge, moment: 'encouragement' });
  }, [returnHintNonce, isAudioOn, getPhaseReminderLine, phase, speakIfUnmuted, childAge]);

  // Child Home entry VO — single combined line, immediate
  useEffect(() => {
    if (phase !== STEPS.CHILD_HOME) return;
    if (childHomeEntryVoiceTimerRef.current) clearTimeout(childHomeEntryVoiceTimerRef.current);
    speakIfUnmuted(VOICE.child_home_entry, { age: childAge, moment: 'default' });
    return () => {
      if (childHomeEntryVoiceTimerRef.current) clearTimeout(childHomeEntryVoiceTimerRef.current);
    };
  }, [phase, VOICE.child_home_entry, speakIfUnmuted, childAge]);

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

  // Load saved data ONLY if coming from mid-scene resume (not fresh entry)
  useEffect(() => {
    // Always start with opening modal on fresh entry
    // Only load saved progress if user explicitly clicked "Continue" from completion screen
    // For now, always clear and start fresh - opening modal will handle resume logic
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }, []);

  // Reset state when entering each step
  useEffect(() => {
    if (phase === STEPS.GANESHA_HOME) {
      setDiscoveredLocations([]);
      discoveredRef.current = new Set();
      setShowCelebration(false);
      setPhase1SpotSparkle(prev => ({ ...prev, index: null }));
      setMglassPosition({ top: '30%', left: '20%' });
      setRevealedSpots([]);
      setActiveSpotFact(null);
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
    setShowCelebration(false);
    const cancel1 = safeSetTimeout(() => {
      setShowCelebration(true);
      triggerSparkle('all', 2000);
      speakIfUnmuted('You found all my hiding places! I am everywhere in India!', { age: childAge, moment: 'celebration' });
    }, 1500);
    const cancel2 = safeSetTimeout(() => sceneActions.updateState({ phase: STEPS.CHILD_HOME }), 6000);
    return () => { cancel1?.(); cancel2?.(); };
  }, [phase, discoveredLocations.length, safeSetTimeout, triggerSparkle, speakIfUnmuted, childAge]);

  // Ganesha Home: Idle hint progression (Level 1 @ 6s, Level 2 @ 12s, Level 3 @ 18s)
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

      // Level 2 @ 18 seconds: Spots glow 2-3 times + voice over
      ganeshaHomeIdleTimerRef.current = setTimeout(() => {
        console.log('[Idle Hint] Level 2 triggered: Repeating glow + voice over');
        setGaneshaHomeIdleLevel(2);
        if (!ganeshaHomeIdleVoiceRef.current) {
          speakIfUnmuted('Drag the magnifying glass to find my special places!', { age: childAge, moment: 'default' });
          ganeshaHomeIdleVoiceRef.current = true;
        }

        // Level 3 @ 26 seconds: Pointing emoji + continue glowing
        ganeshaHomeIdleTimerRef.current = setTimeout(() => {
          console.log('[Idle Hint] Level 3 triggered: Pointing emoji appears');
          setGaneshaHomeIdleLevel(3);
        }, 8000);
      }, 8000);
    }, 10000);

    return () => {
      if (ganeshaHomeIdleTimerRef.current) clearTimeout(ganeshaHomeIdleTimerRef.current);
    };
  }, [phase, discoveredLocations.length, speakIfUnmuted, childAge]);

  // Language Ganesha: Idle hint progression (Level 1 @ 10s, Level 2 @ 18s, Level 3 @ 26s)
  useEffect(() => {
    if (phase !== STEPS.LANGUAGE_GANESHA || shakeLang !== null || langGuessPhase !== 'guessing') {
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
          speakIfUnmuted('This is the language I speak!', { age: childAge, moment: 'default' });
          langGuessIdleVoiceRef.current = true;
        }

        // Level 3 @ 26 seconds: Pointing emoji on correct card
        langGuessIdleTimerRef.current = setTimeout(() => {
          console.log('[Idle Hint Language] Level 3 triggered: Pointing emoji appears');
          setLangGuessIdleLevel(3);
        }, 8000);
      }, 8000);
    }, 10000);

    return () => {
      if (langGuessIdleTimerRef.current) clearTimeout(langGuessIdleTimerRef.current);
    };
  }, [phase, langGuessPhase, shakeLang, speakIfUnmuted, childAge]);

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
          speakIfUnmuted('This is my favorite festival!', { age: childAge, moment: 'default' });
          festGuessIdleVoiceRef.current = true;
        }

        // Level 3 @ 26 seconds: Pointing emoji on correct card
        festGuessIdleTimerRef.current = setTimeout(() => {
          console.log('[Idle Hint Festival] Level 3 triggered: Pointing emoji appears');
          setFestGuessIdleLevel(3);
        }, 8000);
      }, 8000);
    }, 10000);

    return () => {
      if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
    };
  }, [phase, guessPhase, shakeGuess, speakIfUnmuted, childAge]);

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

  // Persist phase on reload
  useEffect(() => {
    if (!RESUMABLE_STEPS.has(phase)) return;
    saveProgress(null, null, null, phase);
  }, [phase, selectedRegion, selectedLanguages, selectedFestivals]);

  // Handle spot tap
  const handleSpotTap = (index) => {
    const spot = GANESHA_SPOTS[index];
    if (revealedSpots.includes(index)) {
      setActiveSpotFact({ index, ...spot });
      speakIfUnmuted(spot.fact, { age: childAge, moment: 'story' });
      return;
    }
  };

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

    const location = PHASE1_LOCATIONS[index];
    setDiscoveredLocations(prev => [...prev, index]);
    playSparkle();
    triggerMiniGesture({
      target: 'phase1-spot',
      durationMs: 1500,
      position: { x: location.x, y: Math.max(8, location.y - 8) },
    });
    triggerPhase1SpotSparkle(index, 1200);
    speakIfUnmuted(location.name, { age: childAge, moment: 'story' });
  }, [playSparkle, triggerMiniGesture, triggerPhase1SpotSparkle, speakIfUnmuted, childAge]);

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
  const handleRegionSelect = (region) => {
    playUiTap();
    triggerMiniGesture(1500);
    triggerSparkle('single', 1500);
    if (childHomeIdleTimerRef.current) clearTimeout(childHomeIdleTimerRef.current);
    if (childHomePostSelectTimerRef.current) clearTimeout(childHomePostSelectTimerRef.current);
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
  const toggleLanguage = (lang) => {
    playUiTap();
    triggerMiniGesture(1500);
    triggerSparkle('single', 1500);
    // Reset idle hint on language selection
    if (langGuessIdleLevel > 0) {
      console.log('[Idle Hint Language] Reset: Child selected language');
      setLangGuessIdleLevel(0);
      langGuessIdleVoiceRef.current = false;
      if (langGuessIdleTimerRef.current) clearTimeout(langGuessIdleTimerRef.current);
    }
    setSelectedLanguages(prev => {
      const exists = prev.find(l => l.id === lang.id);
      if (exists) return prev.filter(l => l.id !== lang.id);
      return [...prev, lang];
    });
    speakIfUnmuted(lang.name, { age: childAge, moment: 'encouragement' });
  };

  // Handle festival toggle
  const toggleFestival = (fest) => {
    playUiTap();
    triggerMiniGesture(1500);
    triggerSparkle('single', 1500);
    // Reset idle hint on festival selection
    if (festGuessIdleLevel > 0) {
      console.log('[Idle Hint Festival] Reset: Child selected festival');
      setFestGuessIdleLevel(0);
      festGuessIdleVoiceRef.current = false;
      if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
    }
    setSelectedFestivals(prev => {
      const exists = prev.find(f => f.id === fest.id);
      if (exists) return prev.filter(f => f.id !== fest.id);
      if (prev.length >= 4) return prev;
      return [...prev, fest];
    });
    speakIfUnmuted(fest.name, { age: childAge, moment: 'encouragement' });
  };

  // Handle language guess
  const handleLanguageGuess = (guessLang) => {
    playUiTap();
    const isCorrect = guessLang.id === 'sanskrit';

    if (isCorrect) {
      setLangGuessPhase('correct');
      playSparkle();
      triggerMiniGesture(1500);
      playChime();
      speakIfUnmuted(VOICE.language_correct, { age: childAge, moment: 'celebration' });
      safeSetTimeout(() => {
        setLangGuessPhase('revealed');
        sceneActions.updateState({ phase: STEPS.LANGUAGE_CHILD });
      }, 3000);
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
    if (wrongGuesses.has(fest.id)) return;
    const isCorrect = fest.id === 'ganesh';

    if (isCorrect) {
      setGuessPhase('correct');
      playSparkle();
      triggerMiniGesture(1500);
      playChime();
      speakIfUnmuted('Yes! Ganesh Chaturthi is my favorite festival!', { age: childAge, moment: 'celebration' });
      safeSetTimeout(() => {
        setGuessPhase('revealed');
        sceneActions.updateState({ phase: STEPS.FESTIVALS_CHILD });
      }, 3000);
    } else {
      setWrongGuesses(prev => new Set(prev).add(fest.id));
      setShakeGuess(fest.id);
      speakIfUnmuted(fest.label, { age: childAge, moment: 'default' });
      safeSetTimeout(() => setShakeGuess(null), 500);
    }
  };

  // Complete scene
  const handleComplete = () => {
    saveProgress(selectedRegion, selectedLanguages, selectedFestivals, STEPS.COMPLETE);
    sceneActions.updateState({ completed: true, phase: STEPS.COMPLETE });
    sceneActions.updateState({ phase: STEPS.COMPLETE });
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
          ].map((phase) => (
            <button
              key={phase.value}
              onClick={() => setStep(phase.value)}
              style={{
                padding: '4px 8px',
                background: phase === phase.value ? '#4CAF50' : '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {phase.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sparkles */}
      {sparkleState.type && (
        <SparkleAnimation
          type={sparkleState.type === 'all' ? 'magic' : 'star'}
          count={sparkleState.type === 'all' ? 34 : 14}
          color={sparkleState.type === 'all' ? 'rgba(0, 229, 255, 0.78)' : 'rgba(0, 229, 255, 0.45)'}
          size={sparkleState.type === 'all' ? 10 : 5}
          duration={sparkleState.type === 'all' ? 2200 : 1100}
          fadeOut={true}
          area="full"
          key={sparkleState.key}
        />
      )}

      {/* Opening Modal */}
      {phase === STEPS.OPENING && (
        <OpeningModal
          zoneId="about-me-hut"
          sceneId="my-indian-story"
          title="My Indian Story"
          description="Let's share our homes, languages, and festivals from across India."
          icons={['story-home', 'story-language', 'story-festival']}
          iconLabels={['Home', 'Language', 'Festival']}
          buttonText="Let's Explore"
          onStart={() => {
            stop();
            clearProgress();
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
          completionTitle="Our Stories Connect!"
          completionSubtitle="You discovered where your roots meet Ganesha's world."
          childName={childName || 'Friend'}
          sceneId="indian-story"
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
            if (onNavigate) onNavigate('scene-complete-continue');
            else if (onComplete) onComplete();
          }}
          onReplay={() => {
            clearProgress();
            setSelectedRegion(null);
            setSelectedLanguages([]);
            setSelectedFestivals([]);
            sceneActions.updateState({ phase: STEPS.OPENING });
          }}
          onExploreZones={() => {
            if (onNavigate) onNavigate('zone-welcome');
            else if (onBack) onBack();
          }}
          onHome={() => {
            if (onNavigate) onNavigate('home');
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
              const shouldGlowRepeating = isUndiscovered && ganeshaHomeIdleLevel >= 2;

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
                  border: ganeshaHomeIdleLevel >= 1 ? '3px solid #00E5FF' : 'none',
                  background: ganeshaHomeIdleLevel >= 1 ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                  pointerEvents: 'none',
                  zIndex: 1,
                  animation: ganeshaHomeIdleLevel === 3 ? 'idleGlowSteady 1s ease-in-out infinite' : ganeshaHomeIdleLevel === 2 ? 'idleGlowMultiple 2.4s ease-in-out' : shouldGlow ? 'idleGlow 1.2s ease-in-out' : 'none',
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
                  zIndex: 12,
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

            {/* Pointing emoji for level 3 hint - above first undiscovered spot */}
            {ganeshaHomeIdleLevel >= 3 && (() => {
              const firstUndiscovered = GANESHA_SPOTS.findIndex((_, idx) => !discoveredLocations.includes(idx));
              if (firstUndiscovered === -1 || !PHASE1_LOCATIONS[firstUndiscovered]) return null;
              const loc = PHASE1_LOCATIONS[firstUndiscovered];
              return (
                <div
                  key="pointing-emoji"
                  style={{
                    position: 'absolute',
                    top: `calc(${loc.y}% - 60px)`,
                    left: `${loc.x}%`,
                    transform: 'translateX(-50%)',
                    fontSize: '48px',
                    pointerEvents: 'none',
                    zIndex: 8,
                    animation: 'bounce 1s ease-in-out infinite',
                  }}
                >
                  👇
                </div>
              );
            })()}

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
              @keyframes idleGlow {
                0% {
                  box-shadow: none;
                }
                50% {
                  box-shadow:
                    0 0 0 3px rgba(0, 229, 255, 1) inset,
                    0 0 28px rgba(0, 229, 255, 0.6),
                    0 0 44px rgba(0, 229, 255, 0.35);
                  opacity: 1;
                }
                100% {
                  box-shadow: none;
                }
              }
              @keyframes idleGlowMultiple {
                0%, 100% { box-shadow: none; }
                12.5%, 25% {
                  box-shadow:
                    0 0 0 3px rgba(0, 229, 255, 1) inset,
                    0 0 28px rgba(0, 229, 255, 0.6),
                    0 0 44px rgba(0, 229, 255, 0.35);
                }
                37.5%, 50% {
                  box-shadow:
                    0 0 0 3px rgba(0, 229, 255, 1) inset,
                    0 0 28px rgba(0, 229, 255, 0.6),
                    0 0 44px rgba(0, 229, 255, 0.35);
                }
                62.5%, 75% {
                  box-shadow:
                    0 0 0 3px rgba(0, 229, 255, 1) inset,
                    0 0 28px rgba(0, 229, 255, 0.6),
                    0 0 44px rgba(0, 229, 255, 0.35);
                }
                87.5%, 100% { box-shadow: none; }
              }
              @keyframes idleGlowSteady {
                0%, 100% {
                  box-shadow:
                    0 0 0 3px rgba(0, 229, 255, 1) inset,
                    0 0 28px rgba(0, 229, 255, 0.6),
                    0 0 44px rgba(0, 229, 255, 0.35);
                }
              }
              @keyframes bounce {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                50% { transform: translateX(-50%) translateY(-10px); }
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

          {/* Fact Display */}
          {activeSpotFact && (
            <div style={{
              maxWidth: '600px',
              margin: '30px auto 0',
              background: '#ADD8E6',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
              textAlign: 'center',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '16px',
              color: '#654321',
              lineHeight: '1.6',
            }}>
              <div style={{ marginBottom: '12px' }}>
                {activeSpotFact.icon ? (
                  <img
                    src={activeSpotFact.icon}
                    alt={activeSpotFact.name}
                    style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto', display: 'block' }}
                  />
                ) : (
                  <img
                    src={babyGaneshaImg}
                    alt="Ganesha"
                    style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto', display: 'block' }}
                  />
                )}
              </div>
              <div>{activeSpotFact.fact}</div>
            </div>
          )}
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
                onClick={() => handleRegionSelect(region)}
                style={{
                  position: 'absolute',
                  top: region.mapTop,
                  left: region.mapLeft,
                  transform: selectedRegion?.id === region.id ? 'translate(-50%, -50%) scale(1.08)' : 'translate(-50%, -50%)',
                  width: '120px',
                  padding: '12px 16px',
                  background: selectedRegion?.id === region.id ? '#FFE7A3' : '#FFFFFF',
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

            {/* Outside India - Near South India Border */}
            <button
              onClick={() => handleRegionSelect(INDIA_REGIONS.find(r => r.id === 'other'))}
              style={{
                position: 'absolute',
                top: '82%',
                left: '36%',
                transform: selectedRegion?.id === 'other' ? 'translate(-50%, -50%) scale(1.08)' : 'translate(-50%, -50%)',
                width: '120px',
                padding: '12px 10px',
                background: selectedRegion?.id === 'other' ? '#FFE7A3' : '#FFFFFF',
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

            {/* Continue Button — Positioned Below Map */}
            <button
              onClick={() => sceneActions.updateState({ phase: STEPS.LANGUAGE_GANESHA })}
              disabled={!isChildHomeContinueEnabled}
              style={{
                position: 'absolute',
                bottom: '-80px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '16px 32px',
                backgroundColor: isChildHomeContinueEnabled ? '#FF9933' : '#D4D4D4',
                color: isChildHomeContinueEnabled ? '#fff' : '#777',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontFamily: "'Baloo 2', cursive",
                fontWeight: 700,
                cursor: isChildHomeContinueEnabled ? 'pointer' : 'not-allowed',
                opacity: isChildHomeContinueEnabled ? 1 : 0.85,
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
                // Speak Sanskrit mantra using Ganesha voice
                speakIfUnmuted('Vakratunda Mahakaya', { age: childAge, moment: 'default' });
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
                animation: langGuessPhase !== 'correct' ? 'pulse 1.5s ease-in-out infinite' : 'none',
                opacity: langGuessPhase === 'correct' ? 0.5 : 1,
              }}
            >
              <img src={playLangIcon} alt="Play" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
            </button>
          </div>

          {/* Language Cards Grid — 2x2 (Always Visible) */}
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '72px',
            padding: '0 24px',
            marginBottom: '80px',
          }}>
            {[
              { id: 'hindi', label: 'Hindi', script: 'हिंदी', icon: hindiLangIcon, color: '#FF9933' },
              { id: 'tamil', label: 'Tamil', script: 'தமிழ்', icon: tamilLangIcon, color: '#E91E63' },
              { id: 'sanskrit', label: 'Sanskrit', script: 'संस्कृत', icon: sanskritLangIcon, color: '#FFD700' },
              { id: 'telugu', label: 'Telugu', script: 'తెలుగు', icon: teluguLangIcon, color: '#9C27B0' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
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
                  borderRadius: '28px',
                  border: langGuessPhase === 'correct' && lang.id === 'sanskrit' ? '4px solid #FFC857' : `4px solid #FFD700`,
                  backgroundColor:
                    langGuessPhase === 'correct' && lang.id === 'sanskrit' ? '#FFF4D8' :
                    wrongLangGuesses.has(lang.id) ? '#F5F5F5' : '#FFFFFF',
                  cursor: (wrongLangGuesses.has(lang.id) || langGuessPhase === 'correct') ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  transition: 'all 0.3s',
                  boxShadow:
                    langGuessPhase === 'correct' && lang.id === 'sanskrit' ? '0 6px 16px rgba(255, 200, 87, 0.4)' :
                    '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transform:
                    shakeLang === lang.id ? 'scale(0.95)' :
                    langGuessPhase === 'correct' && lang.id === 'sanskrit' ? 'scale(1.05)' :
                    'scale(1)',
                  opacity: wrongLangGuesses.has(lang.id) ? 0.5 : 1,
                  animation: shakeLang === lang.id ? 'shake 0.3s ease-in-out' : langGuessIdleLevel >= 1 ? 'idleWobble 0.5s ease-in-out infinite' : 'none',
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
            ))}
          </div>

          {/* Pointing emoji for level 3 hint - above Sanskrit card (position 2 in grid) */}
          {langGuessIdleLevel >= 3 && (
            <div
              style={{
                position: 'fixed',
                top: '45%',
                right: '20%',
                fontSize: '48px',
                pointerEvents: 'none',
                zIndex: 100,
                animation: 'bounce 1s ease-in-out infinite',
              }}
            >
              👇
            </div>
          )}

          {/* Shake Animation */}
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.08); }
              100% { transform: scale(1); }
            }
            @keyframes shake {
              0%, 100% { transform: translateX(0) scale(1); }
              25% { transform: translateX(-8px) scale(0.95); }
              75% { transform: translateX(8px) scale(0.95); }
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', marginBottom: '40px' }}>
                {[
                  LANGUAGES.find(l => l.id === 'hindi'),
                  LANGUAGES.find(l => l.id === 'english'),
                  LANGUAGES.find(l => l.id === 'tamil'),
                  LANGUAGES.find(l => l.id === 'marathi'),
                ].filter(Boolean).map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => toggleLanguage(lang)}
                    disabled={selectedLanguages.length >= 3 && !selectedLanguages.find(l => l.id === lang.id)}
                    style={{
                      width: '100%',
                      minHeight: '160px',
                      padding: '20px',
                      borderRadius: '20px',
                      border: selectedLanguages.find(l => l.id === lang.id) ? `4px solid #FFD76A` : '2px solid #E0E0E0',
                      backgroundColor: selectedLanguages.find(l => l.id === lang.id) ? '#FFFBE9' : '#FFFFFF',
                      cursor: selectedLanguages.length >= 3 && !selectedLanguages.find(l => l.id === lang.id) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      transition: 'all 0.2s',
                      boxShadow: selectedLanguages.find(l => l.id === lang.id) ? '0 6px 16px rgba(255, 215, 106, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.08)',
                      transform: selectedLanguages.find(l => l.id === lang.id) ? 'scale(1.05)' : 'scale(1)',
                      opacity: selectedLanguages.length >= 3 && !selectedLanguages.find(l => l.id === lang.id) ? 0.6 : 1,
                      position: 'relative',
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
                  LANGUAGES.find(l => l.id === 'gujarati'),
                  LANGUAGES.find(l => l.id === 'bengali'),
                  LANGUAGES.find(l => l.id === 'kannada'),
                  LANGUAGES.find(l => l.id === 'malayalam'),
                  LANGUAGES.find(l => l.id === 'punjabi'),
                  LANGUAGES.find(l => l.id === 'telugu'),
                  LANGUAGES.find(l => l.id === 'sanskrit'),
                  LANGUAGES.find(l => l.id === 'other'),
                ].filter(Boolean).map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => toggleLanguage(lang)}
                    disabled={selectedLanguages.length >= 3 && !selectedLanguages.find(l => l.id === lang.id)}
                    style={{
                      width: '100%',
                      minHeight: '160px',
                      padding: '20px',
                      borderRadius: '20px',
                      border: selectedLanguages.find(l => l.id === lang.id) ? `4px solid #FFD76A` : '2px solid #E0E0E0',
                      backgroundColor: selectedLanguages.find(l => l.id === lang.id) ? '#FFFBE9' : '#FFFFFF',
                      cursor: selectedLanguages.length >= 3 && !selectedLanguages.find(l => l.id === lang.id) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      transition: 'all 0.2s',
                      boxShadow: selectedLanguages.find(l => l.id === lang.id) ? '0 6px 16px rgba(255, 215, 106, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.08)',
                      transform: selectedLanguages.find(l => l.id === lang.id) ? 'scale(1.05)' : 'scale(1)',
                      opacity: selectedLanguages.length >= 3 && !selectedLanguages.find(l => l.id === lang.id) ? 0.6 : 1,
                      position: 'relative',
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
                onClick={() => {
                  playUiTap();
                  speakIfUnmuted(VOICE.language_confirmed, { age: childAge, moment: 'celebration' });
                  safeSetTimeout(() => {
                    sceneActions.updateState({ phase: STEPS.FESTIVALS_GANESHA });
                  }, 2000);
                }}
                style={{
                  display: 'block',
                  margin: '60px auto 0',
                  padding: '18px 48px',
                  backgroundColor: '#FF9933',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '24px',
                  fontSize: '20px',
                  fontFamily: "'Baloo 2', cursive",
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 6px 16px rgba(255, 153, 51, 0.3)',
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
            }}>
              <button
                key="pongal"
                onClick={() => {
                  setFestGuessIdleLevel(0);
                  festGuessIdleVoiceRef.current = false;
                  if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
                  handleFestivalGuess(FESTIVALS.find(f => f.id === 'pongal'));
                }}
                disabled={wrongGuesses.has('pongal') || guessPhase === 'correct'}
                style={{
                  width: '220px',
                  height: '220px',
                  padding: '20px',
                  borderRadius: '28px',
                  border: `4px solid #FFD700`,
                  backgroundColor: wrongGuesses.has('pongal') ? '#F5F5F5' : '#FFFFFF',
                  cursor: (wrongGuesses.has('pongal') || guessPhase === 'correct') ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transform: shakeGuess === 'pongal' ? 'scale(0.95)' : 'scale(1)',
                  opacity: wrongGuesses.has('pongal') ? 0.3 : 1,
                  filter: wrongGuesses.has('pongal') ? 'grayscale(20%)' : 'none',
                  animation: shakeGuess === 'pongal' ? 'shake 0.3s ease-in-out' : festGuessIdleLevel >= 1 ? 'idleWobble 0.5s ease-in-out infinite' : 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0s',
                }}
              >
                <img src={pongalIcon} alt="Pongal" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
              </button>
              <button
                key="holi"
                onClick={() => {
                  setFestGuessIdleLevel(0);
                  festGuessIdleVoiceRef.current = false;
                  if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
                  handleFestivalGuess(FESTIVALS.find(f => f.id === 'holi'));
                }}
                disabled={wrongGuesses.has('holi') || guessPhase === 'correct'}
                style={{
                  width: '220px',
                  height: '220px',
                  padding: '20px',
                  borderRadius: '28px',
                  border: `4px solid #FFD700`,
                  backgroundColor: wrongGuesses.has('holi') ? '#F5F5F5' : '#FFFFFF',
                  cursor: (wrongGuesses.has('holi') || guessPhase === 'correct') ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transform: shakeGuess === 'holi' ? 'scale(0.95)' : 'scale(1)',
                  opacity: wrongGuesses.has('holi') ? 0.3 : 1,
                  filter: wrongGuesses.has('holi') ? 'grayscale(20%)' : 'none',
                  animation: shakeGuess === 'holi' ? 'shake 0.3s ease-in-out' : festGuessIdleLevel >= 1 ? 'idleWobble 0.5s ease-in-out infinite' : 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s',
                }}
              >
                <img src={holiIcon} alt="Holi" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
              </button>
            </div>

            {/* BOTTOM ROW: 3 cards centered */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '48px',
            }}>
              <button
                key="janmashtami"
                onClick={() => {
                  setFestGuessIdleLevel(0);
                  festGuessIdleVoiceRef.current = false;
                  if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
                  handleFestivalGuess(FESTIVALS.find(f => f.id === 'janmashtami'));
                }}
                disabled={wrongGuesses.has('janmashtami') || guessPhase === 'correct'}
                style={{
                  width: '220px',
                  height: '220px',
                  padding: '20px',
                  borderRadius: '28px',
                  border: `4px solid #FFD700`,
                  backgroundColor: wrongGuesses.has('janmashtami') ? '#F5F5F5' : '#FFFFFF',
                  cursor: (wrongGuesses.has('janmashtami') || guessPhase === 'correct') ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transform: shakeGuess === 'janmashtami' ? 'scale(0.95)' : 'scale(1)',
                  opacity: wrongGuesses.has('janmashtami') ? 0.3 : 1,
                  filter: wrongGuesses.has('janmashtami') ? 'grayscale(20%)' : 'none',
                  animation: shakeGuess === 'janmashtami' ? 'shake 0.3s ease-in-out' : festGuessIdleLevel >= 1 ? 'idleWobble 0.5s ease-in-out infinite' : 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s',
                }}
              >
                <img src={janmashtamiIcon} alt="Janmashtami" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
              </button>
              <button
                key="ganesh"
                onClick={() => {
                  setFestGuessIdleLevel(0);
                  festGuessIdleVoiceRef.current = false;
                  if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
                  handleFestivalGuess(FESTIVALS.find(f => f.id === 'ganesh'));
                }}
                disabled={wrongGuesses.has('ganesh')}
                style={{
                  width: '220px',
                  height: '220px',
                  padding: '20px',
                  borderRadius: '28px',
                  border: `4px solid #FFD700`,
                  backgroundColor: guessPhase === 'correct' ? '#FFF4D8' : (wrongGuesses.has('ganesh') ? '#F5F5F5' : '#FFFFFF'),
                  borderColor: guessPhase === 'correct' ? '#FFC857' : 'transparent',
                  borderWidth: guessPhase === 'correct' ? '2px' : '0px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  boxShadow: guessPhase === 'correct'
                    ? '0 0 20px rgba(255, 200, 87, 0.6), 0px 6px 12px rgba(0,0,0,0.12)'
                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transform: guessPhase === 'correct' ? 'scale(1.05)' : (shakeGuess === 'ganesh' ? 'scale(0.95)' : 'scale(1)'),
                  opacity: wrongGuesses.has('ganesh') ? 0.3 : 1,
                  filter: wrongGuesses.has('ganesh') ? 'grayscale(20%)' : 'none',
                  animation: guessPhase === 'correct' ? 'glow 0.6s ease-in-out' : (shakeGuess === 'ganesh' ? 'shake 0.3s ease-in-out' : festGuessIdleLevel >= 1 ? 'idleWobble 0.5s ease-in-out infinite' : 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s'),
                }}
              >
                <img src={modakImage} alt="Ganesh Chaturthi - Modak" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
              </button>
              <button
                key="diwali"
                onClick={() => {
                  setFestGuessIdleLevel(0);
                  festGuessIdleVoiceRef.current = false;
                  if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
                  handleFestivalGuess(FESTIVALS.find(f => f.id === 'diwali'));
                }}
                disabled={wrongGuesses.has('diwali') || guessPhase === 'correct'}
                style={{
                  width: '220px',
                  height: '220px',
                  padding: '20px',
                  borderRadius: '28px',
                  border: `4px solid #FFD700`,
                  backgroundColor: wrongGuesses.has('diwali') ? '#F5F5F5' : '#FFFFFF',
                  cursor: (wrongGuesses.has('diwali') || guessPhase === 'correct') ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transform: shakeGuess === 'diwali' ? 'scale(0.95)' : 'scale(1)',
                  opacity: wrongGuesses.has('diwali') ? 0.3 : 1,
                  filter: wrongGuesses.has('diwali') ? 'grayscale(20%)' : 'none',
                  animation: shakeGuess === 'diwali' ? 'shake 0.3s ease-in-out' : festGuessIdleLevel >= 1 ? 'idleWobble 0.5s ease-in-out infinite' : 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
                }}
              >
                <img src={diwaliIcon} alt="Diwali" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
              </button>
            </div>
          </div>

          {/* Correct Celebration Sparkle */}
          {guessPhase === 'correct' && (
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
          )}

          {/* Pointing emoji for level 3 hint - above Ganesh Chaturthi (middle bottom position) */}
          {festGuessIdleLevel >= 3 && (
            <div
              style={{
                position: 'fixed',
                top: '58%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '48px',
                pointerEvents: 'none',
                zIndex: 100,
                animation: 'bounce 1s ease-in-out infinite',
              }}
            >
              👇
            </div>
          )}

          {/* Animations */}
          <style>{`
            @keyframes popIn {
              0% { transform: scale(0.9); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes shake {
              0%, 100% { transform: translateX(0) scale(1); }
              25% { transform: translateX(-6px) scale(0.95); }
              75% { transform: translateX(6px) scale(0.95); }
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '32px',
                marginBottom: '40px',
              }}>
                {COMMON_FESTIVALS.filter(Boolean).map((fest) => (
                  <button
                    key={fest.id}
                    onClick={() => toggleFestival(fest)}
                    disabled={selectedFestivals.length >= 4 && !selectedFestivals.find(f => f.id === fest.id)}
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '20px',
                      borderRadius: '20px',
                      border: selectedFestivals.find(f => f.id === fest.id) ? '2px solid #FFC857' : '2px solid #E0E0E0',
                      backgroundColor: selectedFestivals.find(f => f.id === fest.id) ? '#FFF4D8' : '#FFFFFF',
                      cursor: (selectedFestivals.length >= 4 && !selectedFestivals.find(f => f.id === fest.id)) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      transition: 'all 0.3s',
                      boxShadow: selectedFestivals.find(f => f.id === fest.id)
                        ? '0 6px 16px rgba(255, 200, 87, 0.4)'
                        : '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: selectedFestivals.find(f => f.id === fest.id) ? 'scale(1.05)' : 'scale(1)',
                      opacity: (selectedFestivals.length >= 4 && !selectedFestivals.find(f => f.id === fest.id)) ? 0.6 : 1,
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
                    onClick={() => toggleFestival(fest)}
                    disabled={selectedFestivals.length >= 4 && !selectedFestivals.find(f => f.id === fest.id)}
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '20px',
                      borderRadius: '20px',
                      border: selectedFestivals.find(f => f.id === fest.id) ? '2px solid #FFC857' : '2px solid #E0E0E0',
                      backgroundColor: selectedFestivals.find(f => f.id === fest.id) ? '#FFF4D8' : '#FFFFFF',
                      cursor: (selectedFestivals.length >= 4 && !selectedFestivals.find(f => f.id === fest.id)) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      transition: 'all 0.3s',
                      boxShadow: selectedFestivals.find(f => f.id === fest.id)
                        ? '0 6px 16px rgba(255, 200, 87, 0.4)'
                        : '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: selectedFestivals.find(f => f.id === fest.id) ? 'scale(1.05)' : 'scale(1)',
                      opacity: (selectedFestivals.length >= 4 && !selectedFestivals.find(f => f.id === fest.id)) ? 0.6 : 1,
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
                onClick={() => sceneActions.updateState({ phase: STEPS.ORIGIN_CARD })}
                style={{
                  display: 'block',
                  margin: '60px auto 0',
                  padding: '18px 48px',
                  backgroundColor: '#FF9933',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '24px',
                  fontSize: '20px',
                  fontFamily: "'Baloo 2', cursive",
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 6px 16px rgba(255, 153, 51, 0.3)',
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
        <div className="comparison-overlay">
          <h1 className="comparison-title">Our Story Connects</h1>
          <p className="comparison-subtitle">When families share their roots, magic happens.</p>

          <div className="comparison-grid">
            {/* LEFT COLUMN — Ganesha's Connection */}
            <div className="comparison-column">
              <img
                src={babyGaneshaImg}
                alt="Ganesha"
                className="comparison-column-header-image"
              />
              <div className="comparison-column-label">Ganesha's Connection</div>

              <div className="comparison-items-grid">
                <div className="comparison-item">
                  <div className="comparison-item-label">Home</div>
                  <img src={northIcon} alt="India" className="comparison-item-img" />
                  <div className="comparison-item-text">All of India</div>
                </div>

                <div className="comparison-item">
                  <div className="comparison-item-label">Language</div>
                  <img src={sanskritLangIcon} alt="Sanskrit" className="comparison-item-img" />
                  <div className="comparison-item-text">Sanskrit</div>
                </div>

                <div className="comparison-item" style={{gridColumn: '1 / -1'}}>
                  <div className="comparison-item-label">Celebration</div>
                  <img src={chaturthiIcon} alt="Ganesh Chaturthi" className="comparison-item-img" />
                  <div className="comparison-item-text">Ganesh Chaturthi</div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — Child's Connection */}
            <div className="comparison-column">
              <div className="comparison-child-avatar">
                {childName.charAt(0).toUpperCase()}
              </div>
              <div className="comparison-column-label">
                {childName}'s Connection
              </div>

              <div className="comparison-items-grid">
                <div className="comparison-item">
                  <div className="comparison-item-label">Home</div>
                  <img src={selectedRegion?.icon || northIcon} alt={selectedRegion?.label} className="comparison-item-img" />
                  <div className="comparison-item-text">
                    {selectedRegion?.label?.split(' ')[0] || '?'}
                  </div>
                </div>

                <div className="comparison-item">
                  <div className="comparison-item-label">Languages</div>
                  <img src={hindiLangIcon} alt="Languages" className="comparison-item-img" />
                  <div className="comparison-item-text">
                    {selectedLanguages.length > 0 ? selectedLanguages.length : '?'}
                  </div>
                </div>

                <div className="comparison-item" style={{gridColumn: '1 / -1'}}>
                  <div className="comparison-item-label">Celebrations</div>
                  <img src={diwaliIcon} alt="Celebrations" className="comparison-item-img" />
                  <div className="comparison-item-text">
                    {selectedFestivals.length > 0 ? selectedFestivals.length : '?'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playUiTap();
              playChime();
              handleComplete();
            }}
            className="comparison-btn"
          >
            Continue
          </button>
        </div>
      )}

    </div>
  );
}
