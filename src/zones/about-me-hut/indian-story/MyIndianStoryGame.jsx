import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MyIndianStoryGame.css';
import '../../shared/components/OpeningModal.css';
import AboutMeCompletion from '../components/Aboutmecompletion';
import { useGaneshaVoice } from '../../../lib/hooks/useGaneshaVoice';
import { useGameSounds } from '../../../lib/hooks/useGameSounds';
import useVoiceGuidance from '../../../lib/hooks/useVoiceGuidance';
import HomeButton from '../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../lib/components/ui/AudioToggle/AudioToggle';
import ZoneBadgeButton from '../../../lib/components/navigation/ZoneBadgeButton';
import useAudioPreference from '../../../lib/hooks/useAudioPreference';
import StoryProgressHeader from '../components/StoryProgressHeader';
import bgImage from './assets/images/name_background.jpg';
import babyGaneshaImg from '/images/ganesha-final-new.svg';
import OpeningModal from '../../shared/components/OpeningModal';

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
  { id: 'north',     label: 'North India',                   states: 'Punjab, Haryana, UP, Delhi',              emoji: '??', icon: northIcon,     color: '#7B9FD4', mapTop: '18%', mapLeft: '40%', ganeshaFact: 'In Varanasi, my name echoes across the ghats every morning! ??' },
  { id: 'west',      label: 'West India',                    states: 'Maharashtra, Goa',                        emoji: '??', icon: westIcon,      color: '#FF9933', mapTop: '52%', mapLeft: '32%', ganeshaFact: 'Mumbai\'s Siddhivinayak temple is one of my most beloved homes! ??' },
  { id: 'central',   label: 'Central India',                 states: 'MP, Chhattisgarh',                        emoji: '??', icon: centralIcon,   color: '#5BA85A', mapTop: '45%', mapLeft: '45%', ganeshaFact: 'The forests here are full of my mouse Mushika\'s friends! ??' },
  { id: 'east',      label: 'East India',                    states: 'West Bengal, Odisha, Jharkhand, Bihar',   emoji: '??', icon: eastIcon,      color: '#4A9BB5', mapTop: '48%', mapLeft: '58%', ganeshaFact: 'In Kolkata, Durga Puja celebrations are so grand � I always visit! ??' },
  { id: 'northeast', label: 'Northeast India',               states: 'Assam, Meghalaya, Manipur, & more',       emoji: '??', icon: northEastIcon, color: '#B565A7', mapTop: '30%', mapLeft: '68%', ganeshaFact: 'The tea gardens here are magical � even I stop for a cup! ?' },
  { id: 'south',     label: 'South India',                   states: 'Tamil Nadu, Kerala, Karnataka, Telangana', emoji: '??', icon: southIcon,     color: '#2E7D32', mapTop: '70%', mapLeft: '44%', ganeshaFact: 'In Tamil Nadu, I am called Pillaiyar � the noble child! ??' },
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
  { id: 'pongal',        label: 'Pongal',         emoji: '🌾', icon: pongalIcon,        season: 'winter', seasonLabel: 'Winter',  angle: 30,  ganeshaReact: 'Pongal! The harvest festival! 🌾', guessOption: true },
  { id: 'holi',          label: 'Holi',           emoji: '🎨', icon: holiIcon,          season: 'spring', seasonLabel: 'Spring',  angle: 60,  ganeshaReact: 'Holi! The festival of colors! 🎨', guessOption: true },
  { id: 'janmashtami',   label: 'Janmashtami',    emoji: '🎭', icon: janmashtamiIcon,   season: 'summer', seasonLabel: 'Summer',  angle: 120, ganeshaReact: 'Janmashtami! My friend Krishna\'s birthday! 🎭', guessOption: true },
  { id: 'ganesh',        label: 'Ganesh Chaturthi', emoji: '🎉', icon: chaturthiIcon,    season: 'autumn', seasonLabel: 'Autumn',  angle: 180, ganeshaReact: 'Ganesh Chaturthi! MY festival! 🎉', guessOption: true, isGanesha: true },
  { id: 'durga_puja',    label: 'Durga Puja',     emoji: '⚔️', icon: navratriIcon,      season: 'autumn', seasonLabel: 'Autumn',  angle: 155, ganeshaReact: 'Durga Puja celebrations are grand and joyful! 🎊', guessOption: false },
  { id: 'diwali',        label: 'Diwali',         emoji: '💡', icon: diwaliIcon,        season: 'autumn', seasonLabel: 'Autumn',  angle: 210, ganeshaReact: 'Diwali! The festival of lights! 💡', guessOption: false },
  { id: 'navratri',      label: 'Navratri',       emoji: '🎭', icon: navratriIcon,      season: 'autumn', seasonLabel: 'Autumn',  angle: 170, ganeshaReact: 'Navratri! Nine nights of celebration! 🎭', guessOption: false },
  { id: 'onam',          label: 'Onam',           emoji: '🌺', icon: onamIcon,          season: 'summer', seasonLabel: 'Summer',  angle: 135, ganeshaReact: 'Onam! Kerala\'s beautiful harvest festival! 🌺', guessOption: false },
  { id: 'eid',           label: 'Eid',            emoji: '🌙', icon: eidIcon,           season: 'spring', seasonLabel: 'Spring',  angle: 45,  ganeshaReact: 'Eid! A time of joy and togetherness! 🌙', guessOption: false },
  { id: 'christmas',     label: 'Christmas',      emoji: '🎄', icon: christmasIcon,     season: 'winter', seasonLabel: 'Winter',  angle: 0,   ganeshaReact: 'Christmas! A festival of love and lights! 🎄', guessOption: false },
];

const COMMON_FESTIVALS = [
  FESTIVALS.find(f => f.id === 'holi'),
  FESTIVALS.find(f => f.id === 'janmashtami'),
  FESTIVALS.find(f => f.id === 'pongal'),
  FESTIVALS.find(f => f.id === 'diwali'),
];

const OTHER_FESTIVALS = [
  FESTIVALS.find(f => f.id === 'ganesh'),
  FESTIVALS.find(f => f.id === 'navratri'),
  FESTIVALS.find(f => f.id === 'durga_puja'),
  FESTIVALS.find(f => f.id === 'onam'),
  FESTIVALS.find(f => f.id === 'eid'),
  FESTIVALS.find(f => f.id === 'christmas'),
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

export default function MyIndianStoryGame({ onComplete, onBack, onNavigate, childName = 'friend', childAge = 8 }) {
  // ─── STATE ───────────────────────────────────────────────────────
  const [step, setStep] = useState(STEPS.OPENING);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedFestivals, setSelectedFestivals] = useState([]);

  // Phase 1 state
  const [discoveredLocations, setDiscoveredLocations] = useState([]);
  const [revealedSpots, setRevealedSpots] = useState([]);
  const [activeSpotFact, setActiveSpotFact] = useState(null);
  const [mglassPosition, setMglassPosition] = useState({ top: '30%', left: '20%' });
  const [showCelebration, setShowCelebration] = useState(false);
  const [showPhase1Sparkle, setShowPhase1Sparkle] = useState(null);
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

  // Gesture & sparkle
  const [miniGesture, setMiniGesture] = useState({ show: false, target: 'center', durationMs: 1500, key: 0 });
  const [sparkleState, setSparkleState] = useState({ type: null, key: 0 });

  // Audio & voices
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const { speak, stop } = useGaneshaVoice();
  const { playUiTap, playSparkle, playChime } = useGameSounds();
  const { setCurrentPhase } = useVoiceGuidance({ childName, childAge, idleTimeout: 25 });

  // Refs
  const discoveredRef = useRef(new Set());
  const miniGestureTimerRef = useRef(null);
  const sparkleCancelRef = useRef(null);
  const childHomeEntryVoiceTimerRef = useRef(null);
  const childHomeIdleTimerRef = useRef(null);
  const childHomePostSelectTimerRef = useRef(null);
  const lastDiscoveryTime = useRef(0);

  // Stop voice on unmount
  useEffect(() => {
    return () => {
      stop();
      if (childHomeEntryVoiceTimerRef.current) clearTimeout(childHomeEntryVoiceTimerRef.current);
      if (childHomeIdleTimerRef.current) clearTimeout(childHomeIdleTimerRef.current);
      if (childHomePostSelectTimerRef.current) clearTimeout(childHomePostSelectTimerRef.current);
    };
  }, []);

  // Audio & Music Setup
  useEffect(() => {
    setCurrentPhase(step);
  }, [step, setCurrentPhase]);

  // Gesture & Sparkle triggers
  const triggerMiniGesture = useCallback((durationMs = 1500) => {
    if (miniGestureTimerRef.current) clearTimeout(miniGestureTimerRef.current);
    setMiniGesture(prev => ({
      show: true,
      target: 'center',
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
    opening:        `Hi ${childName}! I am Ganesha — your new bestie! Let's find out where you and I both come from!`,
    ganesha_home:   `I hide in four special places across India! Drag the magnifying glass to find me! 🔍`,
    child_home_entry_1: `Now tell me... where does your family live in India?`,
    child_home_entry_2: `Tap your home on the map!`,
    child_home_idle: `Look carefully... where is your home?`,
    language_guess:   `I speak many languages! Can you guess which language I am speaking right now?`,
    language_audio:   `Vakratunda Mahakaya Suryakoti Samaprabha!`,
    language_correct: `Yes! That is Sanskrit! The language of all mantras and shlokas!`,
    language_wheel:   `Which language does your family speak at home?`,
    festivals_guess:  `I have one favourite festival above all others! Can you guess which one it is?`,
    festivals_wheel:  `Amazing! Which festivals does your family celebrate?`,
    origin_card:      `Look at this, ${childName}! You and I are connected — right here in India!`,
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
    const info = voiceMap[step];
    if (info) speakIfUnmuted(info.text, { age: childAge, moment: info.moment });
  }, [step, VOICE.opening, VOICE.ganesha_home, VOICE.origin_card, langVoice, festVoice, speakIfUnmuted, childAge]);

  // Child Home entry VO sequence
  useEffect(() => {
    if (step !== STEPS.CHILD_HOME) return;
    if (childHomeEntryVoiceTimerRef.current) clearTimeout(childHomeEntryVoiceTimerRef.current);
    speakIfUnmuted(VOICE.child_home_entry_1, { age: childAge, moment: 'default' });
    childHomeEntryVoiceTimerRef.current = setTimeout(() => {
      speakIfUnmuted(VOICE.child_home_entry_2, { age: childAge, moment: 'default' });
    }, 1000);
    return () => {
      if (childHomeEntryVoiceTimerRef.current) clearTimeout(childHomeEntryVoiceTimerRef.current);
    };
  }, [step, VOICE.child_home_entry_1, VOICE.child_home_entry_2, speakIfUnmuted, childAge]);

  // Child Home idle hint (4s of no selection)
  useEffect(() => {
    if (step !== STEPS.CHILD_HOME || selectedRegion) return;
    if (childHomeIdleTimerRef.current) clearTimeout(childHomeIdleTimerRef.current);
    childHomeIdleTimerRef.current = setTimeout(() => {
      speakIfUnmuted(VOICE.child_home_idle, { age: childAge, moment: 'default' });
    }, 4000);
    return () => {
      if (childHomeIdleTimerRef.current) clearTimeout(childHomeIdleTimerRef.current);
    };
  }, [step, selectedRegion, VOICE.child_home_idle, speakIfUnmuted, childAge]);

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
    if (step === STEPS.GANESHA_HOME) {
      setDiscoveredLocations([]);
      discoveredRef.current = new Set();
      setShowCelebration(false);
      setShowPhase1Sparkle(null);
      setMglassPosition({ top: '30%', left: '20%' });
      setRevealedSpots([]);
      setActiveSpotFact(null);
    }
    if (step === STEPS.FESTIVALS_GANESHA || step === STEPS.FESTIVALS_CHILD) {
      setGuessPhase('guessing');
      setWrongGuesses(new Set());
      setShakeGuess(null);
    }
    if (step === STEPS.LANGUAGE_GANESHA) {
      setLangGuessPhase('guessing');
      setWrongLangGuesses(new Set());
      setShakeLang(null);
      setLangWrongReaction(null);
    }
    if (step === STEPS.CHILD_HOME) {
      setSelectedRegion(null);
      setIsChildHomeContinueEnabled(false);
    }
  }, [step]);

  // Step 1 UX: once all locations are found, advance
  useEffect(() => {
    if (step !== STEPS.GANESHA_HOME) return;
    if (discoveredLocations.length !== PHASE1_LOCATIONS.length) return;
    setShowCelebration(false);
    const t1 = setTimeout(() => {
      setShowCelebration(true);
      triggerSparkle('all', 2000);
      speakIfUnmuted('You found all my hiding places! I am everywhere in India!', { age: childAge, moment: 'celebration' });
    }, 1500);
    const t2 = setTimeout(() => setStep(STEPS.CHILD_HOME), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [step, discoveredLocations.length]);

  // Save progress
  const saveProgress = (region, langs, fests, stepValue = step) => {
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
    if (!RESUMABLE_STEPS.has(step)) return;
    saveProgress(null, null, null, step);
  }, [step, selectedRegion, selectedLanguages, selectedFestivals]);

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

    setDiscoveredLocations(prev => [...prev, index]);
    playSparkle();
    triggerMiniGesture(1500);
    triggerSparkle('single', 1500);
    setShowPhase1Sparkle(`location-${index}`);
    setTimeout(() => setShowPhase1Sparkle(null), 1500);

    const location = PHASE1_LOCATIONS[index];
    speakIfUnmuted(location.name, { age: childAge, moment: 'story' });
  }, [playSparkle, triggerMiniGesture, triggerSparkle, speakIfUnmuted, childAge]);

  // Handle magnifying glass move
  const handleMglassMove = useCallback((newPosition) => {
    setMglassPosition(newPosition);
    const percentX = parseFloat(newPosition.left);
    const percentY = parseFloat(newPosition.top);
    checkLocationDiscovery(percentX, percentY);
  }, [checkLocationDiscovery]);

  // Handle region select
  const handleRegionSelect = (region) => {
    playUiTap();
    triggerMiniGesture(1500);
    triggerSparkle('single', 1500);
    if (childHomeIdleTimerRef.current) clearTimeout(childHomeIdleTimerRef.current);
    if (childHomePostSelectTimerRef.current) clearTimeout(childHomePostSelectTimerRef.current);
    setSelectedRegion(region);
    setIsChildHomeContinueEnabled(false);
    speakIfUnmuted(`Ah! Your family lives here!`, { age: childAge, moment: 'story' });
    childHomePostSelectTimerRef.current = setTimeout(() => {
      speakIfUnmuted(`That's your home!`, { age: childAge, moment: 'story' });
      childHomePostSelectTimerRef.current = setTimeout(() => {
        speakIfUnmuted(`India is full of wonderful places.`, { age: childAge, moment: 'story' });
        setIsChildHomeContinueEnabled(true);
      }, 900);
    }, 900);
    saveProgress(region, null, null);
  };

  // Handle language toggle
  const toggleLanguage = (lang) => {
    playUiTap();
    triggerMiniGesture(1500);
    triggerSparkle('single', 1500);
    setSelectedLanguages(prev => {
      const exists = prev.find(l => l.id === lang.id);
      if (exists) return prev.filter(l => l.id !== lang.id);
      return [...prev, lang];
    });
    speakIfUnmuted('Great choice!', { age: childAge, moment: 'encouragement' });
  };

  // Handle festival toggle
  const toggleFestival = (fest) => {
    playUiTap();
    if (selectedFestivals.length >= 4) return;
    setSelectedFestivals(prev => {
      if (prev.length >= 4) return prev;
      return [...prev, fest];
    });
    setActiveFestReaction({ emoji: fest.emoji, text: 'Nice! That\'s a wonderful festival.' });
    speakIfUnmuted('Nice! That\'s a wonderful festival.', { age: childAge, moment: 'encouragement' });
    setTimeout(() => setActiveFestReaction(null), 2800);
  };

  // Handle language guess
  const handleLanguageGuess = (guessLang) => {
    playUiTap();
    const isCorrect = guessLang.id === 'sanskrit';

    if (isCorrect) {
      setLangGuessPhase('correct');
      speakIfUnmuted(VOICE.language_correct, { age: childAge, moment: 'celebration' });
      setTimeout(() => {
        setLangGuessPhase('revealed');
        setStep(STEPS.LANGUAGE_CHILD);
      }, 3000);
    } else {
      setWrongLangGuesses(prev => new Set(prev).add(guessLang.id));
      setShakeLang(guessLang.id);
      speakIfUnmuted('Not quite! Try again!', { age: childAge, moment: 'default' });
      setTimeout(() => setShakeLang(null), 500);
    }
  };

  // Handle festival guess
  const handleFestivalGuess = (fest) => {
    playUiTap();
    if (wrongGuesses.has(fest.id)) return;
    const isCorrect = fest.id === 'ganesh';

    if (isCorrect) {
      setGuessPhase('correct');
      playChime();
      triggerSparkle('all', 1200);
      speakIfUnmuted('Yes! Ganesh Chaturthi is my favorite festival!', { age: childAge, moment: 'celebration' });
      setTimeout(() => {
        setGuessPhase('revealed');
        setStep(STEPS.FESTIVALS_CHILD);
      }, 3000);
    } else {
      setWrongGuesses(prev => new Set(prev).add(fest.id));
      setShakeGuess(fest.id);
      speakIfUnmuted(`${fest.label}! Try another one.`, { age: childAge, moment: 'default' });
      setTimeout(() => setShakeGuess(null), 300);
    }
  };

  // Complete scene
  const handleComplete = () => {
    saveProgress(selectedRegion, selectedLanguages, selectedFestivals, STEPS.COMPLETE);
    setStep(STEPS.COMPLETE);
  };

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <div className="mis-wrapper">
      <img src={bgImage} alt="Background" className="mis-background" />

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
            setStep(STEPS.OPENING);
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
                background: step === phase.value ? '#4CAF50' : '#666',
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
          type={sparkleState.type}
          count={20}
          color="rgba(255, 215, 0, 0.6)"
          size={6}
          duration={3000}
          fadeOut={true}
          area="full"
          key={sparkleState.key}
        />
      )}

      {/* Opening Modal */}
      {step === STEPS.OPENING && (
        <OpeningModal
          zoneId="about-me-hut"
          sceneId="my-indian-story"
          title="My Indian Story"
          description={`Ganesha and ${childName} discover their shared roots in India!`}
          icons={['🗺️', '🏡', '🌟']}
          iconLabels={["Ganesha's India", 'Your Home', 'Origin Card']}
          buttonText="Let's Explore! 🇮🇳"
          onStart={() => {
            stop();
            clearProgress();
            setSelectedRegion(null);
            setSelectedLanguages([]);
            setSelectedFestivals([]);
            setStep(STEPS.GANESHA_HOME);
          }}
          showButton={true}
        />
      )}

      {/* Completion Screen */}
      {step === STEPS.COMPLETE && (
        <AboutMeCompletion
          show={true}
          sceneName="My Indian Story"
          sceneNumber={4}
          totalScenes={4}
          starsEarned={2}
          totalStars={2}
          discoveredBadges={['culture-explorer']}
          characterImages={{ babyGanesha: babyGaneshaImg }}
          isFinalScene={true}
          onContinue={() => {
            if (onNavigate) {
              onNavigate('zone-complete');
            } else if (onComplete) {
              onComplete();
            }
          }}
          onReplay={() => {
            clearProgress();
            setSelectedRegion(null);
            setSelectedLanguages([]);
            setSelectedFestivals([]);
            setStep(STEPS.OPENING);
          }}
          onBackToMap={() => {
            if (onNavigate) {
              onNavigate('zone-welcome');
            } else if (onBack) {
              onBack();
            }
          }}
          onHome={() => {
            if (onNavigate) {
              onNavigate('home');
            } else if (onBack) {
              onBack();
            }
          }}
          sceneId="my-indian-story"
        />
      )}

      {/* Ganesha Home Phase */}
      {step === STEPS.GANESHA_HOME && (
        <div style={{ minHeight: '100vh', paddingTop: '40px', paddingBottom: '40px' }}>
          <StoryProgressHeader
            discoveries={discoveredLocations.length > 0 ? discoveredLocations.map(idx => ({ ...PHASE1_LOCATIONS[idx], image: PHASE1_LOCATIONS[idx].icon })) : []}
            isChildMode={false}
          />

          {/* Progress indicator */}
          <div style={{ textAlign: 'center', marginBottom: '20px', fontFamily: "'Baloo 2', cursive", fontSize: '18px', fontWeight: 700, color: '#654321' }}>
            Found: {discoveredLocations.length} / {PHASE1_LOCATIONS.length} 🔍
          </div>

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

            {/* Invisible location targets for discovery */}
            {GANESHA_SPOTS.map((spot, idx) => (
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
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
            ))}

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
      {step === STEPS.CHILD_HOME && (
        <div style={{ paddingTop: '40px', paddingBottom: '40px' }}>
          <StoryProgressHeader discoveries={selectedRegion ? [selectedRegion] : []} isChildMode={false} />

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

            {/* Elsewhere Option - Below Map */}
            <button
              onClick={() => handleRegionSelect(INDIA_REGIONS.find(r => r.id === 'other'))}
              style={{
                position: 'absolute',
                bottom: '-80px',
                left: '50%',
                transform: selectedRegion?.id === 'other' ? 'translateX(-50%) scale(1.08)' : 'translateX(-50%)',
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

            <style>{`
              @keyframes housePop {
                0% { transform: translate(-50%, -120%) scale(0); }
                70% { transform: translate(-50%, -120%) scale(1.1); }
                100% { transform: translate(-50%, -120%) scale(1); }
              }
            `}</style>
          </div>

          {/* Continue Button */}
          <button
            onClick={() => setStep(STEPS.LANGUAGE_GANESHA)}
            disabled={!isChildHomeContinueEnabled}
            style={{
              marginTop: '140px',
              display: 'block',
              margin: '140px auto 0',
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
            }}
          >
            Continue {'\u2192'}
          </button>
        </div>
      )}
      {/* Language Ganesha Phase — 4 Language Guess Game */}
      {step === STEPS.LANGUAGE_GANESHA && (
        <div style={{ paddingTop: '60px', paddingBottom: '80px', minHeight: '100vh' }}>
          {/* Play Button Section */}
          <div style={{ textAlign: 'center', marginTop: '120px', marginBottom: '80px' }}>
            <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: '24px', fontWeight: 700, color: '#654321', marginBottom: '40px' }}>
              Listen and guess my language!
            </div>
            <button
              onClick={() => {
                playUiTap();
                // Play Sanskrit audio
                const audio = new Audio('/audio/sanskrit-vakratunda.mp3');
                audio.play().catch(e => console.log('Audio play error:', e));
              }}
              disabled={langGuessPhase === 'correct'}
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                backgroundColor: '#FF8A2B',
                border: 'none',
                cursor: langGuessPhase === 'correct' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(255, 138, 43, 0.4)',
                transition: 'all 0.2s',
                margin: '0 auto',
                animation: langGuessPhase !== 'correct' ? 'pulse 1.5s ease-in-out infinite' : 'none',
                opacity: langGuessPhase === 'correct' ? 0.5 : 1,
              }}
            >
              <img src={playLangIcon} alt="Play" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
            </button>
          </div>

          {/* Language Cards Grid — 2x2 (Always Visible) */}
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '48px',
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
                onClick={() => handleLanguageGuess(lang)}
                disabled={wrongLangGuesses.has(lang.id) || langGuessPhase === 'correct'}
                style={{
                  width: '100%',
                  minHeight: '280px',
                  padding: '28px',
                  borderRadius: '28px',
                  border: shakeLang === lang.id ? `4px solid #FF6B6B` : `4px solid #E0E0E0`,
                  backgroundColor: wrongLangGuesses.has(lang.id) ? '#F5F5F5' : '#FFFFFF',
                  cursor: (wrongLangGuesses.has(lang.id) || langGuessPhase === 'correct') ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  transition: 'all 0.2s',
                  boxShadow: shakeLang === lang.id
                    ? '0 8px 24px rgba(255, 107, 107, 0.3)'
                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transform: shakeLang === lang.id ? 'scale(0.95)' : 'scale(1)',
                  opacity: wrongLangGuesses.has(lang.id) ? 0.5 : 1,
                  animation: shakeLang === lang.id ? 'shake 0.3s ease-in-out' : 'none',
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
      {step === STEPS.LANGUAGE_CHILD && (
        <div style={{ paddingTop: '60px', paddingBottom: '80px', minHeight: '100vh' }}>
          <StoryProgressHeader discoveries={selectedLanguages} isChildMode={false} />

          {/* Ganesha Speech Bubble */}
          <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '60px', paddingX: '24px' }}>
            <div style={{
              display: 'inline-block',
              backgroundColor: '#FFE8A3',
              borderRadius: '24px',
              padding: '16px 24px',
              fontFamily: "'Baloo 2', cursive",
              fontSize: '18px',
              fontWeight: 700,
              color: '#654321',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              maxWidth: '600px',
            }}>
              Namaste! {selectedLanguages.length > 0 ? `I love hearing ${selectedLanguages.map(l => l.label).join(' & ')}! 🙏` : 'Which languages do you speak at home? 🗣️'}
            </div>
          </div>

          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
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
                onClick={() => setStep(STEPS.FESTIVALS_GANESHA)}
                style={{
                  display: 'block',
                  margin: '60px auto 0',
                  padding: '18px 48px',
                  backgroundColor: '#FFD76A',
                  color: '#654321',
                  border: 'none',
                  borderRadius: '24px',
                  fontSize: '20px',
                  fontFamily: "'Baloo 2', cursive",
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 6px 16px rgba(255, 215, 106, 0.4)',
                }}
              >
                We speak {selectedLanguages.map(l => l.label).join(' & ')}! →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Festivals Ganesha Phase — 4 Festival Guess Game */}
      {step === STEPS.FESTIVALS_GANESHA && (
        <div style={{ paddingTop: '60px', paddingBottom: '80px', minHeight: '100vh' }}>
          {/* Play Button Section */}
          <div style={{ textAlign: 'center', marginTop: '120px', marginBottom: '80px' }}>
            <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: '24px', fontWeight: 700, color: '#654321', marginBottom: '40px' }}>
              Guess my favorite festival!
            </div>
            <button
              onClick={() => {
                playUiTap();
                setGuessPhase('revealed');
              }}
              disabled={guessPhase === 'revealed'}
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                backgroundColor: '#FF8A2B',
                border: 'none',
                cursor: guessPhase === 'guessing' ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '70px',
                boxShadow: '0 8px 24px rgba(255, 138, 43, 0.4)',
                transition: 'all 0.2s',
                margin: '0 auto',
                animation: guessPhase === 'guessing' ? 'pulse 1.5s ease-in-out infinite' : 'none',
                opacity: guessPhase === 'revealed' ? 0.5 : 1,
              }}
            >
              ▶️
            </button>
          </div>

          {/* Festival Cards Grid — 2x2 */}
          {guessPhase === 'revealed' && (
            <div style={{
              maxWidth: '900px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '48px',
              padding: '0 24px',
              marginBottom: '80px',
            }}>
              {[
                { id: 'pongal', label: 'Pongal', emoji: '🌾', icon: pongalIcon },
                { id: 'holi', label: 'Holi', emoji: '🎨', icon: holiIcon },
                { id: 'janmashtami', label: 'Janmashtami', emoji: '🎭', icon: janmashtamiIcon },
                { id: 'ganesh', label: 'Ganesh Chaturthi', emoji: '🎉', icon: chaturthiIcon },
              ].map((fest) => (
                <button
                  key={fest.id}
                  onClick={() => handleFestivalGuess(fest)}
                  disabled={wrongGuesses.has(fest.id)}
                  style={{
                    width: '100%',
                    minHeight: '280px',
                    padding: '28px',
                    borderRadius: '28px',
                    border: shakeGuess === fest.id ? `4px solid #FF6B6B` : `4px solid #E0E0E0`,
                    backgroundColor: wrongGuesses.has(fest.id) ? '#F5F5F5' : '#FFFFFF',
                    cursor: wrongGuesses.has(fest.id) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    transition: 'all 0.2s',
                    boxShadow: shakeGuess === fest.id
                      ? '0 8px 24px rgba(255, 107, 107, 0.3)'
                      : '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transform: shakeGuess === fest.id ? 'scale(0.95)' : 'scale(1)',
                    opacity: wrongGuesses.has(fest.id) ? 0.5 : 1,
                    animation: shakeGuess === fest.id ? 'shake 0.3s ease-in-out' : 'none',
                  }}
                >
                  <img src={fest.icon} alt={fest.label} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                  <div style={{
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#654321',
                  }}>
                    {fest.label}
                  </div>
                </button>
              ))}
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

      {/* Festivals Child Phase — Festival Selection */}
      {step === STEPS.FESTIVALS_CHILD && (
        <div style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <StoryProgressHeader discoveries={selectedFestivals} isChildMode={false} />
          {guessPhase === 'revealed' && (
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
              <h3 style={{ fontFamily: "'Baloo 2', cursive", fontSize: '36px', fontWeight: 900, color: '#654321', textAlign: 'center', marginBottom: '48px', marginTop: '40px' }}>
                Popular Festivals
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', marginBottom: '80px' }}>
                {COMMON_FESTIVALS.filter(Boolean).map((fest) => (
                  <button
                    key={fest.id}
                    onClick={() => toggleFestival(fest)}
                    style={{
                      padding: '28px',
                      borderRadius: '24px',
                      border: selectedFestivals.find(f => f.id === fest.id) ? '4px solid #FFD700' : '3px solid #E0E0E0',
                      backgroundColor: selectedFestivals.find(f => f.id === fest.id) ? '#FFFBE9' : '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '88px',
                      minHeight: '220px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      transition: 'all 0.2s',
                      boxShadow: selectedFestivals.find(f => f.id === fest.id)
                        ? '0 8px 24px rgba(255, 215, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: selectedFestivals.find(f => f.id === fest.id) ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {fest.emoji}
                    <div style={{ fontSize: '20px', fontFamily: "'Baloo 2', cursive", fontWeight: 700, color: '#654321' }}>{fest.label}</div>
                  </button>
                ))}
              </div>

              <h3 style={{ fontFamily: "'Baloo 2', cursive", fontSize: '36px', fontWeight: 900, color: '#654321', textAlign: 'center', marginBottom: '48px' }}>
                More Festivals
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginBottom: '80px' }}>
                {OTHER_FESTIVALS.filter(Boolean).map((fest) => (
                  <button
                    key={fest.id}
                    onClick={() => toggleFestival(fest)}
                    style={{
                      padding: '28px',
                      borderRadius: '24px',
                      border: selectedFestivals.find(f => f.id === fest.id) ? '4px solid #FFD700' : '3px solid #E0E0E0',
                      backgroundColor: selectedFestivals.find(f => f.id === fest.id) ? '#FFFBE9' : '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '88px',
                      minHeight: '220px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      transition: 'all 0.2s',
                      boxShadow: selectedFestivals.find(f => f.id === fest.id)
                        ? '0 8px 24px rgba(255, 215, 0, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: selectedFestivals.find(f => f.id === fest.id) ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {fest.emoji}
                    <div style={{ fontSize: '20px', fontFamily: "'Baloo 2', cursive", fontWeight: 700, color: '#654321' }}>{fest.label}</div>
                  </button>
                ))}
              </div>

              {selectedFestivals.length > 0 && (
                <button
                  onClick={() => setStep(STEPS.ORIGIN_CARD)}
                  style={{
                    display: 'block',
                    margin: '80px auto 0',
                    padding: '18px 48px',
                    backgroundColor: '#FF9933',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '16px',
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
          )}
        </div>
      )}

      {/* Origin Card Phase */}
      {step === STEPS.ORIGIN_CARD && (
        <div style={{
          background: 'linear-gradient(160deg, #FFFBF0 0%, #FFF9E8 100%)',
          minHeight: '100vh',
          paddingBottom: '60px',
        }}>
          <SparkleAnimation
            type="star"
            count={20}
            color="rgba(255, 215, 0, 0.6)"
            size={6}
            duration={3000}
            fadeOut={true}
            area="full"
          />

          <div style={{textAlign: 'center', marginBottom: '32px', paddingTop: '40px'}}>
            <h1 style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: '28px',
              fontWeight: 700,
              color: '#FF9933',
              margin: '0 0 8px 0',
            }}>
              Our Story Connects! 🌟
            </h1>
            <p style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '16px',
              color: '#666',
              margin: 0,
            }}>
              When families share their roots, magic happens.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            maxWidth: '800px',
            margin: '0 auto 32px',
          }}>
            {/* LEFT COLUMN — Ganesha's Story */}
            <div style={{
              background: '#FFF6E8',
              borderRadius: '24px',
              padding: '25px',
              boxShadow: '0 7px 18px rgba(0, 0, 0, 0.15)',
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '16px',
              }}>
                <div style={{
                  fontSize: '72px',
                  lineHeight: '1',
                }}>🐘</div>
              </div>

              <div style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: '24px',
                fontWeight: 900,
                color: '#654321',
                textAlign: 'center',
                marginBottom: '20px',
              }}>
                Ganesha's Story
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '15px 10px',
                  textAlign: 'center',
                  boxShadow: '0 6px 14px rgba(139, 69, 19, 0.12)',
                }}>
                  <div style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '6px',
                  }}>
                    Home
                  </div>
                  <div style={{
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#FF9933',
                  }}>
                    All of India 🇮🇳
                  </div>
                </div>

                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '15px 10px',
                  textAlign: 'center',
                  boxShadow: '0 6px 14px rgba(139, 69, 19, 0.12)',
                }}>
                  <div style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '6px',
                  }}>
                    Languages
                  </div>
                  <div style={{
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#FF9933',
                  }}>
                    Sanskrit 🕉️
                  </div>
                </div>

                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '15px 10px',
                  textAlign: 'center',
                  boxShadow: '0 6px 14px rgba(139, 69, 19, 0.12)',
                }}>
                  <div style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '6px',
                  }}>
                    Special Day
                  </div>
                  <div style={{
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#FF9933',
                  }}>
                    Ganesh Chaturthi 🎉
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — Child's Story */}
            <div style={{
              background: '#FFF6E8',
              borderRadius: '24px',
              padding: '25px',
              boxShadow: '0 7px 18px rgba(0, 0, 0, 0.15)',
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '16px',
              }}>
                <div style={{
                  fontSize: '72px',
                  lineHeight: '1',
                }}>
                  {childName.charAt(0).toUpperCase()}
                </div>
              </div>

              <div style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: '24px',
                fontWeight: 900,
                color: '#654321',
                textAlign: 'center',
                marginBottom: '20px',
              }}>
                {childName}'s Story
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}>
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '15px 10px',
                  textAlign: 'center',
                  boxShadow: '0 6px 14px rgba(139, 69, 19, 0.12)',
                }}>
                  <div style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '6px',
                  }}>
                    Family Home
                  </div>
                  <div style={{
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#E91E63',
                  }}>
                    {selectedRegion?.label || '?'}
                  </div>
                </div>

                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '15px 10px',
                  textAlign: 'center',
                  boxShadow: '0 6px 14px rgba(139, 69, 19, 0.12)',
                }}>
                  <div style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '6px',
                  }}>
                    Languages at Home
                  </div>
                  <div style={{
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#E91E63',
                    lineHeight: '1.4',
                  }}>
                    {selectedLanguages.map(l => l.label).join(', ') || '?'}
                  </div>
                </div>

                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '15px 10px',
                  textAlign: 'center',
                  boxShadow: '0 6px 14px rgba(139, 69, 19, 0.12)',
                }}>
                  <div style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '6px',
                  }}>
                    Celebrations
                  </div>
                  <div style={{
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#E91E63',
                    lineHeight: '1.4',
                  }}>
                    {selectedFestivals.map(f => f.label).join(', ') || '?'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {selectedFestivals.find(f => f.id === 'ganesh') && (
            <div style={{
              background: 'linear-gradient(160deg, #FFE0B2, #FFD180)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '32px',
              boxShadow: '0 6px 16px rgba(255, 152, 0, 0.25)',
            }}>
              <div style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: '20px',
                fontWeight: 700,
                color: '#FF6F00',
                marginBottom: '8px',
              }}>
                🐘 We Both Celebrate Ganesh Chaturthi! 🎉
              </div>
              <div style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: '14px',
                color: '#E65100',
              }}>
                We are true besties! Our roots connect us across the world. 💛
              </div>
            </div>
          )}

          <div style={{
            textAlign: 'center',
            marginBottom: '24px',
          }}>
            <p style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '16px',
              color: '#666',
              lineHeight: '1.6',
            }}>
              <strong>Your roots are your superpower!</strong><br/>
              When you know where you come from,<br/>
              you know where you're going. 🌟
            </p>
          </div>

          <button
            onClick={() => {
              playUiTap();
              playChime();
              handleComplete();
            }}
            style={{
              display: 'block',
              margin: '0 auto',
              backgroundColor: '#FF9933',
              fontSize: '18px',
              fontWeight: 700,
              padding: '16px 32px',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: "'Baloo 2', cursive",
            }}
          >
            Our Story is Complete! 🎉
          </button>
        </div>
      )}

    </div>
  );
}

