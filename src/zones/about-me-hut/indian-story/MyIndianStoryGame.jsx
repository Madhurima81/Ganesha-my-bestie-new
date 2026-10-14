import { usePreloadPoses } from '../../../lib/components/animation/PoseImage';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './MyIndianStoryGame.css';
import '../../shared/components/OpeningModal.css';
import SceneCompletionCelebration from '../../../lib/components/celebration/SceneCompletionCelebration';
import GaneshaGestureCue from '../../../lib/components/gesture/GaneshaGestureCue';
import { useMiniGesture } from '../../../lib/hooks/useMiniGesture';
import AboutMeComparisonCard from '../components/AboutMeComparisonCard';
import GameStateManager from '../../../lib/services/GameStateManager';
import ProgressManager from '../../../lib/services/ProgressManager';
import SimpleSceneManager from '../../../lib/services/SimpleSceneManager';
import { useGaneshaVoice } from '../../../lib/hooks/useGaneshaVoice';
import { useGameSounds } from '../../../lib/hooks/useGameSounds';
import useVoiceGuidance from '../../../lib/hooks/useVoiceGuidance';
import usePauseAwareTimeout from '../../../lib/hooks/usePauseAwareTimeout';
import useResumeCountdown from '../../../lib/hooks/useResumeCountdown';
import ResumeCountdown from '../../../lib/components/feedback/ResumeCountdown';
import AudioToggle from '../../../lib/components/ui/AudioToggle/AudioToggle';
import ZoneBadgeButton from '../../../lib/components/navigation/ZoneBadgeButton';
import VOReplayButton from '../../../lib/components/feedback/VOReplayButton';
import useAudioPreference from '../../../lib/hooks/useAudioPreference';
import StoryProgressHeader from '../components/StoryProgressHeader';
import AboutMeGaneshaHost from '../components/AboutMeGaneshaHost';
import bgImage from './assets/images/name_background.webp';
import babyGaneshaImg from '/images/ganesha-final-new.svg';
import OpeningModal from '../../shared/components/OpeningModal';
import SceneManager from '../../../lib/components/scenes/SceneManager';
import storyHouseIcon from './assets/images/house-icon.webp';
import storyLanguageIcon from './assets/images/language-icon.webp';
import storyFestivalIcon from './assets/images/festival-icon.webp';

// ─── PHASE 1: NEW IMPORTS ─────────────────────────────────────────
import FreeDraggableItem from '../../../lib/components/interactive/FreeDraggableItem';
import AboutMeSparkle from '../components/AboutMeSparkle';
import GestureDemo from '../../../lib/components/feedback/GestureDemo';
import indiaMapImage from './assets/images/ganeshaplace/india-map.webp';
import mglass from './assets/images/ganeshaplace/mglass.webp';
import mumbaiIcon from './assets/images/ganeshaplace/mumbai.webp';
import varansiIcon from './assets/images/ganeshaplace/Varanasi.webp';
import tamilNaduIcon from './assets/images/ganeshaplace/TamilNadu.webp';

// ─── PHASE 2: REGION ICONS ────────────────────────────────────────
import northIcon from './assets/images/ganeshaplace/north.webp';
import northEastIcon from './assets/images/ganeshaplace/north-east.webp';
import westIcon from './assets/images/ganeshaplace/west.webp';
import centralIcon from './assets/images/ganeshaplace/central.webp';
import eastIcon from './assets/images/ganeshaplace/east.webp';
import southIcon from './assets/images/ganeshaplace/south.webp';
import desertIcon from './assets/images/ganeshaplace/dessert.webp';

// ─── PHASE 3: LANGUAGE ICONS & PLAY BUTTON ────────────────────────
import hindiLangIcon from './assets/images/languages/hindi.webp';
import tamilLangIcon from './assets/images/languages/Tamil.webp';
import sanskritLangIcon from './assets/images/languages/Sanskrit.webp';
import teluguLangIcon from './assets/images/languages/Telugu.webp';
import marathiLangIcon from './assets/images/languages/Marathi.webp';
import gujaratiLangIcon from './assets/images/languages/Gujarati.webp';
import bengaliLangIcon from './assets/images/languages/Bengali.webp';
import kannadaLangIcon from './assets/images/languages/Kannada.webp';
import malayalamLangIcon from './assets/images/languages/malyalam.webp';
import punjabiLangIcon from './assets/images/languages/Punjabi.webp';
import englishLangIcon from './assets/images/languages/English.webp';
import otherLangIcon from './assets/images/languages/otherlanguage.webp';
import playLangIcon from './assets/images/languages/play-language.webp';

// ─── PHASE 4: FESTIVAL ICONS ──────────────────────────────────────
import pongalIcon from './assets/images/festivals/pongal.webp';
import holiIcon from './assets/images/festivals/holi.webp';
import janmashtamiIcon from './assets/images/festivals/janmashtami.webp';
import chaturthiIcon from './assets/images/festivals/chaturthi.webp';
import navratriIcon from './assets/images/festivals/sakranti.webp';
import diwaliIcon from './assets/images/festivals/diwali.webp';
import onamIcon from './assets/images/festivals/onam.webp';
import eidIcon from './assets/images/festivals/eid.webp';
import christmasIcon from './assets/images/festivals/xmas.webp';
import durga_pujaIcon from './assets/images/festivals/durgapuja.webp';
import dussehra_Icon from './assets/images/festivals/dussehra.webp';
import rakhi_Icon from './assets/images/festivals/rakhi.webp';
import modakImage from './assets/images/festivals/modak.webp';

// ?hitzones outlines the real tap box of every button in the scene.
const SHOW_HIT_ZONES = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('hitzones');

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

const STORAGE_KEY_BASE = 'gmb_indian_story';
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

const getStoryStorageKey = (profileId) => `${STORAGE_KEY_BASE}_${profileId || 'default'}`;
const EMPTY_LIST = [];

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
  { id: 'north',     label: 'North India',                   states: 'Punjab, Haryana, UP, Delhi',               emoji: '\u{1F3D4}\uFE0F', icon: northIcon,     color: '#7B9FD4', mapTop: '18%', mapLeft: '32%', ganeshaFact: 'In Varanasi, my name echoes across the ghats every morning! \u2728' },
  { id: 'west',      label: 'West India',                    states: 'Maharashtra, Goa',                         emoji: '\u{1F30A}',       icon: westIcon,      color: '#FF9933', mapTop: '52%', mapLeft: '20%', ganeshaFact: 'Mumbai\'s Siddhivinayak temple is one of my most beloved homes! \u{1F64F}' },
  { id: 'central',   label: 'Central India',                 states: 'MP, Chhattisgarh',                         emoji: '\u{1F333}',       icon: centralIcon,   color: '#5BA85A', mapTop: '45%', mapLeft: '38%', ganeshaFact: 'The forests here are full of my mouse Mooshika\'s friends! \u{1F42D}' },
  { id: 'east',      label: 'East India',                    states: 'West Bengal, Odisha, Jharkhand, Bihar',   emoji: '🌅', icon: eastIcon,      color: '#4A9BB5', mapTop: '48%', mapLeft: '62%', ganeshaFact: 'In Kolkata, Durga Puja celebrations are so grand - I always visit! 🎊' },
  { id: 'northeast', label: 'Northeast India',               states: 'Assam, Meghalaya, Manipur, & more',       emoji: '🍃', icon: northEastIcon, color: '#B565A7', mapTop: '30%', mapLeft: '77%', ganeshaFact: 'The tea gardens here are magical - even I stop for a cup! ☕' },
  { id: 'south',     label: 'South India',                   states: 'Tamil Nadu, Kerala, Karnataka, Telangana', emoji: '🪷', icon: southIcon,     color: '#2E7D32', mapTop: '70%', mapLeft: '32%', ganeshaFact: 'In Tamil Nadu, I am called Pillaiyar - the noble child! ✨' },
  { id: 'kailash',   label: 'Mount Kailash! 🏔️',            states: 'Where Amma & Appa live!',                  emoji: '🏔️', icon: desertIcon,    color: '#5C6BC0', mapTop: '8%',  mapLeft: '42%', ganeshaFact: 'KAILASH?! That\'s where my Amma and Appa live! But where does YOUR family live on Earth?', isKailash: true },
  { id: 'other',     label: 'Outside India',                 states: 'Outside India or multiple states',         emoji: '🌍', icon: null,           color: '#888', mapTop: '70%', mapLeft: '76%', ganeshaFact: 'Wherever your family is from, India lives in your heart! 💖' },
];

const LANGUAGES = [
  { id: 'hindi',      label: 'Hindi',      script: 'हिंदी',      icon: hindiLangIcon,      color: '#FF9933' },
  { id: 'tamil',      label: 'Tamil',      script: 'தமிழ்',      icon: tamilLangIcon,      color: '#E91E63' },
  { id: 'telugu',     label: 'Telugu',     script: 'తెలుగు',     icon: teluguLangIcon,     color: '#9C27B0' },
  { id: 'marathi',    label: 'Marathi',    script: 'मराठी',      icon: marathiLangIcon,    color: '#FF5722' },
  { id: 'gujarati',   label: 'Gujarati',   script: 'ગુજરાતી',    icon: gujaratiLangIcon,   color: '#FF9800' },
  { id: 'bengali',    label: 'Bengali',    script: 'বাংলা',      icon: bengaliLangIcon,    color: '#2196F3' },
  { id: 'kannada',    label: 'Kannada',    script: 'ಕನ್ನಡ',      icon: kannadaLangIcon,    color: '#4CAF50' },
  { id: 'malayalam',  label: 'Malayalam',  script: 'മലയാളം',     icon: malayalamLangIcon,  color: '#00BCD4' },
  { id: 'punjabi',    label: 'Punjabi',    script: 'ਪੰਜਾਬੀ',      icon: punjabiLangIcon,    color: '#8BC34A' },
  { id: 'sanskrit',   label: 'Sanskrit',   script: 'संस्कृत',     icon: sanskritLangIcon,   color: '#FFD700' },
  { id: 'english',    label: 'English',    script: 'English',    icon: englishLangIcon,    color: '#795548' },
  { id: 'other',      label: 'Other',      script: '🌍',         icon: otherLangIcon,      color: '#9E9E9E' },
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

const PHASE1_ZONE_RADIUS = 7; // % of the map box, ellipse around each target

// Where the lens circle sits inside the magnifying-glass image box (measured from the
// 256px PNG's opaque lens). Used to turn the glass's top-left position into the lens centre.
const MGLASS_LENS_FRACTION = { x: 0.43, y: 0.4 };

const getMglassLensPercent = (percentX, percentY) => {
  const img = typeof document !== 'undefined' ? document.querySelector('img[alt="Magnifying Glass"]') : null;
  const glass = img?.parentElement;
  const parent = glass?.parentElement;
  if (!glass || !parent) return { x: percentX + 7, y: percentY + 7 };
  const g = glass.getBoundingClientRect();
  const p = parent.getBoundingClientRect();
  if (!p.width || !p.height) return { x: percentX + 7, y: percentY + 7 };
  return {
    x: percentX + (g.width * MGLASS_LENS_FRACTION.x / p.width) * 100,
    y: percentY + (g.height * MGLASS_LENS_FRACTION.y / p.height) * 100,
  };
};

const HEART_POSITIONS = [
  { top: '20%', left: '15%' },
  { top: '35%', left: '80%' },
  { top: '65%', left: '25%' },
  { top: '75%', left: '70%' },
  { top: '50%', left: '50%' },
];

const parsePercent = (value, fallback = 0) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const GANESHA_SPOTS = [
  { name: 'Varanasi Ghats', icon: varansiIcon, fact: 'In Varanasi, my name echoes across the ghats every morning! ✨' },
  { name: 'Mumbai Temple', icon: mumbaiIcon, fact: 'Siddhivinayak temple in Mumbai is one of my most beloved homes! 🙏' },
  { name: 'Tamil Nadu Shrine', icon: tamilNaduIcon, fact: 'In Tamil Nadu, I am called Pillaiyar - the noble child! ✨' },
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
        flushKeys={['phase']}
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
          homeChildConfirmed: false,    // Continue tapped on your home (saved at the tap)
          homeChildConfirmDone: false,  // its confirm line finished
          langChildConfirmed: false,    // Continue tapped on your languages (saved at the tap)
          langChildConfirmDone: false,  // its confirm line finished (Continue replays it only if the child left during it)
          festChildConfirmed: false,
          festChildConfirmDone: false,
          homeSolved: false,            // all places found (saved the moment the last one is found)
          homeSuccessDone: false,       // its closing line finished (Continue replays it only if the child left during it)
          langGuessSolved: false,       // correct language tapped (saved at the tap)
          langGuessSuccessDone: false,  // its success line finished (Continue replays it only if the child left during it)
          festGuessSolved: false,
          festGuessSuccessDone: false,
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
const SCENE_IMAGES = [
  bgImage,
  babyGaneshaImg,
  storyHouseIcon,
  storyLanguageIcon,
  storyFestivalIcon,
  indiaMapImage,
  mglass,
  mumbaiIcon,
  varansiIcon,
  tamilNaduIcon,
  northIcon,
  northEastIcon,
  westIcon,
  centralIcon,
  eastIcon,
  southIcon,
  desertIcon,
  hindiLangIcon,
  tamilLangIcon,
  sanskritLangIcon,
  teluguLangIcon,
  marathiLangIcon,
  gujaratiLangIcon,
  bengaliLangIcon,
  kannadaLangIcon,
  malayalamLangIcon,
  punjabiLangIcon,
  englishLangIcon,
  otherLangIcon,
  playLangIcon,
  pongalIcon,
  holiIcon,
  janmashtamiIcon,
  chaturthiIcon,
  navratriIcon,
  diwaliIcon,
  onamIcon,
  eidIcon,
  christmasIcon,
  durga_pujaIcon,
  dussehra_Icon,
  rakhi_Icon,
  modakImage,
];

// One language choice card. Sizes use --u (defined on .mis-wrapper): the smaller of 1vw and
// ~1.45% of the app height, so the whole language screen scales together on any iPad.
const LANG_HEADING_STYLE = {
  fontFamily: "'Baloo 2', cursive",
  fontSize: 'max(16px, calc(var(--u) * 1.8))',
  fontWeight: 700,
  color: '#8B6914',
  textAlign: 'center',
  marginBottom: 'calc(var(--u) * 0.8)',
};

function LangCard({ lang, isSelected, isSwappingOut, onToggle }) {
  return (
    <button
      onClick={(event) => onToggle(lang, event)}
      disabled={false}
      style={{
        width: '100%',
        maxWidth: 'calc(var(--u) * 14)',
        justifySelf: 'center',
        minHeight: 'calc(var(--u) * 8.4)',
        padding: 'calc(var(--u) * 0.8)',
        borderRadius: '20px',
        border: isSelected ? '4px solid #FFD76A' : '2px solid #E0E0E0',
        backgroundColor: isSelected ? '#FFFBE9' : '#F8F1E2',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'calc(var(--u) * 0.8)',
        transition: isSwappingOut ? 'none' : 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: isSelected ? '0 0 0 4px rgba(255, 215, 106, 0.35), 0 6px 16px rgba(0, 0, 0, 0.12)' : '0 2px 6px rgba(0, 0, 0, 0.08)',
        transform: 'none',
        opacity: isSwappingOut ? 0.3 : 1,
        position: 'relative',
        animation: isSwappingOut ? 'swapOut 0.3s ease-out forwards' : 'none',
      }}
    >
      {isSelected && <div style={{ fontSize: '18px', position: 'absolute', top: '8px', right: '12px', fontWeight: 'bold' }}>✓</div>}
      <img src={lang.icon} alt={lang.label} style={{ width: 'calc(var(--u) * 3.4)', height: 'calc(var(--u) * 3.4)', objectFit: 'contain' }} />
      <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 'max(14px, calc(var(--u) * 1.5))', fontWeight: 700, color: '#654321' }}>
        {lang.label}
      </div>
      <div style={{ fontFamily: "'Nunito', sans-serif", fontSize: 'max(12px, calc(var(--u) * 1.1))', color: '#8B6914' }}>
        {lang.script}
      </div>
    </button>
  );
}

// One festival choice card. Sized from --u (see .mis-wrapper) like LangCard, so the festival
// screen scales with the screen instead of staying a fixed 178x116px.
const FEST_HEADING_STYLE = {
  fontFamily: "'Baloo 2', cursive",
  fontSize: 'max(16px, calc(var(--u) * 1.8))',
  fontWeight: 700,
  color: '#8B6914',
  textAlign: 'center',
  marginBottom: 'calc(var(--u) * 0.8)',
};

function FestCard({ fest, isSelected, isSwappingOut, onToggle }) {
  return (
    <button
      onClick={(event) => onToggle(fest, event)}
      disabled={false}
      style={{
        width: '100%',
        maxWidth: 'calc(var(--u) * 15)',
        justifySelf: 'center',
        minHeight: 'calc(var(--u) * 9.5)',
        padding: 'calc(var(--u) * 0.8)',
        borderRadius: '20px',
        border: isSelected ? '2px solid #FFC857' : '2px solid #E0E0E0',
        backgroundColor: isSelected ? '#FFF4D8' : '#F8F1E2',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        gap: 'calc(var(--u) * 0.8)',
        transition: isSwappingOut ? 'none' : 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: isSelected
          ? '0 0 0 4px rgba(255, 200, 87, 0.35), 0 6px 16px rgba(0, 0, 0, 0.12)'
          : '0 4px 12px rgba(0, 0, 0, 0.1)',
        transform: 'none',
        opacity: isSwappingOut ? 0.3 : 1,
        position: 'relative',
        animation: isSwappingOut ? 'swapOut 0.3s ease-out forwards' : 'none',
      }}
    >
      <img src={fest.icon} alt={fest.label} style={{ width: 'calc(var(--u) * 3.4)', height: 'calc(var(--u) * 3.4)', objectFit: 'contain' }} />
      <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 'max(14px, calc(var(--u) * 1.5))', fontWeight: 700, color: '#654321' }}>
        {fest.label}
      </div>
    </button>
  );
}

function MyIndianStoryGameContent({ sceneState, sceneActions, isReload, onComplete, onNavigate, onBack, childName = 'friend', childAge = 8, sceneId = 'my-indian-story' }) {
  usePreloadPoses(SCENE_IMAGES);
  // ─── PHASE (from SceneManager - single source of truth) ───────────
  const phase = sceneState.phase || STEPS.OPENING;

  useEffect(() => {
    SimpleSceneManager.setCurrentScene('about-me-hut', 'my-indian-story', false, false);
  }, []);

  // Declared BEFORE useGaneshaVoice on purpose: unmount cleanups run in declaration order and the voice
  // hook's cleanup cancels speech, which calls onEnd. This must already be false by then, or the next
  // line of a sequence starts after the scene is left and plays on Zone Welcome.
  // False once the scene is left: speech callbacks that advance or save must ignore a line that
  // ends (or is cancelled) after unmount (KNOWN_PITFALLS 11b/11c). Set true in the effect body so
  // StrictMode's simulated unmount/remount leaves it true.
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  // ─── STATE ───────────────────────────────────────────────────────
  // The child's picks live in sceneState (SceneManager), the one saved copy. Every change is a
  // checkpoint, so a Continue / refresh / tab return finds them (they used to be local state).
  const stateRef = useRef(sceneState);
  stateRef.current = sceneState;
  const selectedRegion = sceneState.selectedRegion ?? null;
  const selectedLanguages = sceneState.selectedLanguages ?? EMPTY_LIST;
  const selectedFestivals = sceneState.selectedFestivals ?? EMPTY_LIST;
  // Setters take a value or an updater, like useState, and read the latest saved list.
  const writePick = (key, next) => {
    stateRef.current = { ...stateRef.current, [key]: next };
    sceneActions.checkpoint({ [key]: next });
  };
  const setSelectedRegion = (v) => writePick('selectedRegion', v);
  const setSelectedLanguages = (v) => writePick('selectedLanguages', typeof v === 'function' ? v(stateRef.current.selectedLanguages ?? EMPTY_LIST) : v);
  const setSelectedFestivals = (v) => writePick('selectedFestivals', typeof v === 'function' ? v(stateRef.current.selectedFestivals ?? EMPTY_LIST) : v);
  // Which guess phases were already solved when the scene mounted (Continue / refresh): they show
  // the finished state and replay the success line only if the child left during it.
  const solvedAtMountRef = useRef({
    home: phase === STEPS.GANESHA_HOME && !!sceneState.homeSolved,
    homeChild: phase === STEPS.CHILD_HOME && !!sceneState.homeChildConfirmed,
    langChild: phase === STEPS.LANGUAGE_CHILD && !!sceneState.langChildConfirmed,
    festChild: phase === STEPS.FESTIVALS_CHILD && !!sceneState.festChildConfirmed,
    lang: phase === STEPS.LANGUAGE_GANESHA && !!sceneState.langGuessSolved,
    fest: phase === STEPS.FESTIVALS_GANESHA && !!sceneState.festGuessSolved,
  });

  // Phase 1 state
  const [discoveredLocations, setDiscoveredLocations] = useState(() => (solvedAtMountRef.current.home ? PHASE1_LOCATIONS.map((_, i) => i) : []));
  const [mglassPosition, setMglassPosition] = useState({ top: '30%', left: '20%' });
  const [showCelebration, setShowCelebration] = useState(false);
  const [phase1SpotSparkle, setPhase1SpotSparkle] = useState({ index: null, key: 0 });
  const [isChildHomeContinueEnabled, setIsChildHomeContinueEnabled] = useState(false);
  const [ganeshaHomePromptReady, setGaneshaHomePromptReady] = useState(false);

  // One-time teaching gesture for the magnifying-glass drag — becomes
  // eligible when the Ganesha Home VO actually starts speaking (synced to
  // "Move the magnifying glass..."), and is dismissed for good the instant
  // the child moves it themselves.
  const [ganeshaHomeGestureReady, setGaneshaHomeGestureReady] = useState(false);
  const [ganeshaHomeGestureDismissed, setGaneshaHomeGestureDismissed] = useState(false);

  const [childHomePromptReady, setChildHomePromptReady] = useState(false);

  // Language phase state
  const [langGuessPhase, setLangGuessPhase] = useState(solvedAtMountRef.current.lang ? 'correct' : 'guessing');
  const [wrongLangGuesses, setWrongLangGuesses] = useState(new Set());
  const [shakeLang, setShakeLang] = useState(null);
  const [langWrongReaction, setLangWrongReaction] = useState(null);
  const [hasPressedLanguagePlay, setHasPressedLanguagePlay] = useState(solvedAtMountRef.current.lang);
  const [playPulseKey, setPlayPulseKey] = useState(0); // bumped to replay the Play button's 2-pulse nudge
  const [showLanguageCards, setShowLanguageCards] = useState(solvedAtMountRef.current.lang); // Show cards only after mantra finishes
  const [languageGuessPromptReady, setLanguageGuessPromptReady] = useState(false);
  const [languageChildPromptReady, setLanguageChildPromptReady] = useState(false);
  const [swappingOutLangId, setSwappingOutLangId] = useState(null); // Track which language is being swapped out

  // Festival phase state
  const [guessPhase, setGuessPhase] = useState(solvedAtMountRef.current.fest ? 'correct' : 'guessing');
  const [wrongGuesses, setWrongGuesses] = useState(new Set());
  const [shakeGuess, setShakeGuess] = useState(null);
  const [activeFestReaction, setActiveFestReaction] = useState(null);
  const [returnHintNonce, setReturnHintNonce] = useState(0);
  const [swappingOutFestId, setSwappingOutFestId] = useState(null); // Track which festival is being swapped out
  const [festivalGuessPromptReady, setFestivalGuessPromptReady] = useState(false);
  const [festivalChildPromptReady, setFestivalChildPromptReady] = useState(false);

  // Gesture & sparkle
  const { miniGesture, triggerMiniGesture: triggerMiniGestureRaw } = useMiniGesture();
  const [sparkleState, setSparkleState] = useState({ type: null, key: 0, position: null, radius: 180 });

  // Idle Hint Level for Ganesha Home Phase
  const [ganeshaHomeIdleLevel, setGaneshaHomeIdleLevel] = useState(0);
  // Mirror of the level for event handlers (a magnifier drag must not wipe a visible hint).
  const ganeshaHomeIdleLevelRef = useRef(0);
  ganeshaHomeIdleLevelRef.current = ganeshaHomeIdleLevel;
  const [ganeshaHomeIdleRestartNonce, setGaneshaHomeIdleRestartNonce] = useState(0);
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
  const { speak, stop, mute: muteSpokenVoice } = useGaneshaVoice();
  const { playUiTap, playSparkle, playChime, playGlow } = useGameSounds();
  const onReturnHint = useCallback(() => {
    setReturnHintNonce(n => n + 1);
  }, []);
  const { setCurrentPhase, startMusic, stopMusic, playVoice, stopVoice, muteVoicePlayback, setVoiceVolume } = useVoiceGuidance('about-me-hut', 'my-indian-story', {
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
  const discoveredRef = useRef(new Set(solvedAtMountRef.current.home ? PHASE1_LOCATIONS.map((_, i) => i) : []));
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
  const phase1ReturnHintTimerCancelRef = useRef(null);
  const phaseEnteredAtRef = useRef(Date.now());
  const entryVoPlayedForPhaseRef = useRef(null);
  const lastHandledReturnHintNonceRef = useRef(0);
  const lastDiscoveryTime = useRef(0);
  const reloadHandledRef = useRef(false);
  const childHomeAdvanceRef = useRef(false);
  // First phase-entry line after mount (Continue / refresh) waits ~500 ms: speech at the very first
  // instant is dropped, and StrictMode's remount cancels it (KNOWN_PITFALLS 1, 2).
  // A fresh start (phase 'opening') never needs it.
  const firstEntryVoRef = useRef(phase !== STEPS.OPENING);

  const { safeSetTimeout, clearAll: clearAllTimeouts } = usePauseAwareTimeout({
    onHide: () => {
      stop();
    },
    onShow: () => {
      setGaneshaHomeIdleLevel(0);
      ganeshaHomeIdleVoiceRef.current = false;
      if (ganeshaHomeIdleTimerRef.current) {
        clearTimeout(ganeshaHomeIdleTimerRef.current);
        ganeshaHomeIdleTimerRef.current = null;
      }

      setLangGuessIdleLevel(0);
      langGuessIdleVoiceRef.current = false;
      if (langGuessIdleTimerRef.current) {
        clearTimeout(langGuessIdleTimerRef.current);
        langGuessIdleTimerRef.current = null;
      }

      setFestGuessIdleLevel(0);
      festGuessIdleVoiceRef.current = false;
      if (festGuessIdleTimerRef.current) {
        clearTimeout(festGuessIdleTimerRef.current);
        festGuessIdleTimerRef.current = null;
      }

      // Remaining idle/nudge/sparkle timers left running unreconciled after
      // tab-hide/show — only the 3 above were being reset, so these could
      // keep ticking (and fire idle VO) in the background after a return.
      if (childHomeIdleTimerRef.current) {
        clearTimeout(childHomeIdleTimerRef.current);
        childHomeIdleTimerRef.current = null;
      }
      if (childHomePostSelectTimerRef.current) {
        clearTimeout(childHomePostSelectTimerRef.current);
        childHomePostSelectTimerRef.current = null;
      }
      childHomeIdleHintVoiceRef.current = false;
      if (childHomeIdleHintTimerRef.current) {
        clearTimeout(childHomeIdleHintTimerRef.current);
        childHomeIdleHintTimerRef.current = null;
      }
      languageSelectionIdleHintVoiceRef.current = false;
      if (languageSelectionIdleHintTimerRef.current) {
        clearTimeout(languageSelectionIdleHintTimerRef.current);
        languageSelectionIdleHintTimerRef.current = null;
      }
      festivalSelectionIdleHintVoiceRef.current = false;
      if (festivalSelectionIdleHintTimerRef.current) {
        clearTimeout(festivalSelectionIdleHintTimerRef.current);
        festivalSelectionIdleHintTimerRef.current = null;
      }
      if (languagePlayNudgeTimeoutRef.current) {
        clearTimeout(languagePlayNudgeTimeoutRef.current);
        languagePlayNudgeTimeoutRef.current = null;
      }
      if (sparkleCancelRef.current) {
        clearTimeout(sparkleCancelRef.current);
        sparkleCancelRef.current = null;
      }
      if (phase1SpotSparkleTimerRef.current) {
        clearTimeout(phase1SpotSparkleTimerRef.current);
        phase1SpotSparkleTimerRef.current = null;
      }
    },
    resumeDelay: RESUME_DELAY_MS
  });

  // Stop voice on unmount
  useEffect(() => {
    return () => {
      stop();
      stopMusic();
      clearAllTimeouts();
      if (sparkleCancelRef.current) clearTimeout(sparkleCancelRef.current);
      if (phase1SpotSparkleTimerRef.current) clearTimeout(phase1SpotSparkleTimerRef.current);
      if (childHomeEntryVoiceTimerRef.current) clearTimeout(childHomeEntryVoiceTimerRef.current);
      if (childHomeIdleTimerRef.current) clearTimeout(childHomeIdleTimerRef.current);
      if (childHomePostSelectTimerRef.current) clearTimeout(childHomePostSelectTimerRef.current);
      if (languagePlayNudgeTimeoutRef.current) clearTimeout(languagePlayNudgeTimeoutRef.current);
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
    if (phase === STEPS.CHILD_HOME) {
      childHomeAdvanceRef.current = false;
    }
  }, [phase]);

  const prevStepRef = useRef(phase);
  useEffect(() => {
    if (phase === STEPS.ORIGIN_CARD && prevStepRef.current !== STEPS.ORIGIN_CARD) {
      playGlow();
    }
    prevStepRef.current = phase;
  }, [phase, playGlow]);

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

    const anchor = target === 'phase1-spot' && position ? position : null;
    triggerMiniGestureRaw('thumbsup', anchor ? 'anchored' : 'center', durationMs, anchor);
  }, [triggerMiniGestureRaw]);

  const triggerSparkle = useCallback((typeOrOptions, durationMs = 1700) => {
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

  const triggerPhase1SpotSparkle = useCallback((spotIndex, durationMs = 1700) => {
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
    if (isAudioOn) {
      muteSpokenVoice();
      muteVoicePlayback();
    }
  }, [isAudioOn, toggleAudio, muteSpokenVoice, muteVoicePlayback]);

  // Speak a line. When muted, useGaneshaVoice completes it on a silent timer
  // (DECISIONS.md 2026-09-29), so onEnd/onError callbacks keep the scene's pacing.
  // `ignoreCancel: true` for lines whose end advances the game: a cancelled/interrupted line is not a
  // finished line. Callbacks are always ignored once the scene is unmounted.
  const speakIfUnmuted = useCallback((text, opts = {}) => {
    if (!text) return;
    const { onEnd, onError, ignoreCancel, ...rest } = opts;
    let cancelled = false;
    speak(text, {
      ...rest,
      onError: (e) => {
        const isCancel = e?.error === 'canceled' || e?.error === 'interrupted';
        if (isCancel) cancelled = true;
        if (!aliveRef.current) return;
        if (ignoreCancel && isCancel) return;
        onError?.(e);
      },
      onEnd: () => {
        if (!aliveRef.current) return;
        if (ignoreCancel && cancelled) return;
        onEnd?.();
      },
    });
  }, [speak]);

  // Voice lines
  const VOICE = {
    ganesha_home:   `Move the magnifying glass around the map to find my places.`,
    child_home_entry: `Now choose a place your family feels connected to.`,
    child_home_confirmed: `This is the place you chose.`,
    child_home_idle: `Which place feels connected to your family?`,
    language_play_first: `Tap play and listen carefully.`,
    language_guess:   `Which language do you hear?`,
    language_guess_hint: `Think of the language many shlokas are in.`,
    language_audio:   `Vakratunda Mahakaya Suryakoti Samaprabha!`,
    language_correct: `Yes — that's Sanskrit, a language used in many mantras.`,
    language_wheel:   `Now choose up to three languages you use or hear.`,
    language_confirmed: `These are the languages you chose.`,
    language_child_idle: `Choose the languages that are part of your life.`,
    festivals_guess:  `Can you find my festival?`,
    festivals_guess_hint: `Think of the festival that celebrates Ganesha.`,
    festivals_wheel:  `Now choose the festivals your family celebrates.`,
    festivals_child_idle: `Which celebrations are part of your family?`,
    festivals_confirmed: `These are the festivals you chose.`,
    origin_card:      `Your places, languages, and celebrations can all be part of that connection.`,
    phase1_complete:  `You found some places connected to my story.`,
    completion_screen: ``,
  };

  const activeProfile = GameStateManager.getCurrentProfile?.() || null;
  const activeProfileId = activeProfile?.id || null;
  const storyStorageKey = getStoryStorageKey(activeProfileId);
  const profileDisplayName = (activeProfile?.name || childName || 'Friend').trim();
  const rawProfileAvatar = activeProfile?.avatar;
  const PROFILE_ANIMAL_IDS = ['monkey', 'peacock', 'squirrel', 'tiger'];
  const PROFILE_EMOJI_TO_ANIMAL = { '🐵': 'monkey', '🦚': 'peacock', '🐿️': 'squirrel', '🐯': 'tiger' };
  const profileAnimalId = PROFILE_ANIMAL_IDS.includes(rawProfileAvatar) ? rawProfileAvatar : (PROFILE_EMOJI_TO_ANIMAL[rawProfileAvatar] || null);
  const profileAvatarImage = profileAnimalId ? `/images/new-explorer-${profileAnimalId}.webp` : null;
  const profileAvatar = (typeof rawProfileAvatar === 'string' && rawProfileAvatar.trim().length <= 2)
    ? rawProfileAvatar
    : profileDisplayName.charAt(0).toUpperCase();

  useEffect(() => {
    setGaneshaHomePromptReady(false);
    setChildHomePromptReady(false);
    setLanguageGuessPromptReady(false);
    setLanguageChildPromptReady(false);
    setFestivalGuessPromptReady(false);
    setFestivalChildPromptReady(false);

    if (phase === STEPS.GANESHA_HOME) {
      setGaneshaHomeGestureReady(false);
      setGaneshaHomeGestureDismissed(false);
    }
  }, [phase]);

  const markPromptReady = useCallback((step) => {
    switch (step) {
      case STEPS.GANESHA_HOME:
        setGaneshaHomePromptReady(true);
        break;
      case STEPS.CHILD_HOME:
        setChildHomePromptReady(true);
        break;
      case STEPS.LANGUAGE_GANESHA:
        setLanguageGuessPromptReady(true);
        break;
      case STEPS.LANGUAGE_CHILD:
        setLanguageChildPromptReady(true);
        break;
      case STEPS.FESTIVALS_GANESHA:
        setFestivalGuessPromptReady(true);
        break;
      case STEPS.FESTIVALS_CHILD:
        setFestivalChildPromptReady(true);
        break;
      default:
        break;
    }
  }, []);

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
    // A solved guess phase resumes with its success line (below), not the entry line.
    if ((phase === STEPS.LANGUAGE_CHILD && solvedAtMountRef.current.langChild) ||
        (phase === STEPS.FESTIVALS_CHILD && solvedAtMountRef.current.festChild) ||
        (phase === STEPS.GANESHA_HOME && solvedAtMountRef.current.home) ||
        (phase === STEPS.LANGUAGE_GANESHA && solvedAtMountRef.current.lang) ||
        (phase === STEPS.FESTIVALS_GANESHA && solvedAtMountRef.current.fest)) return;
    const phaseEntryKey = `${phase}:${info.text}`;
    if (entryVoPlayedForPhaseRef.current === phaseEntryKey) return;
    const playEntry = () => {
      const stepVoiceKey = `about-me-hut:my-indian-story:${phase}:${info.text}`;
      const shouldBypassRecentDedupe = isReload && !reloadHandledRef.current;
      if (!shouldBypassRecentDedupe && wasStepVoSpokenRecently(stepVoiceKey)) {
        if (phase === STEPS.GANESHA_HOME) {
          setGaneshaHomeGestureReady(true);
        }
        markPromptReady(phase);
        return;
      }
      speak(info.text, {
        age: childAge,
        moment: info.moment,
        onStart: () => {
          if (phase === STEPS.GANESHA_HOME) {
            setGaneshaHomeGestureReady(true);
          }
        },
        onEnd: () => markPromptReady(phase),
        onError: () => {
          // Don't strand the visual teaching cue if VO fails.
          if (phase === STEPS.GANESHA_HOME) {
            setGaneshaHomeGestureReady(true);
          }
          markPromptReady(phase);
        }
      });
      RECENT_STEP_VO.set(stepVoiceKey, Date.now());
      entryVoPlayedForPhaseRef.current = phaseEntryKey;
    };
    if (firstEntryVoRef.current) {
      // Flag and refs are set when the timer FIRES, never before it (StrictMode cleanup clears it).
      const t = setTimeout(() => {
        firstEntryVoRef.current = false;
        playEntry();
      }, 500);
      return () => clearTimeout(t);
    }
    playEntry();
  }, [phase, childAge, isAudioOn, isReload, speak, markPromptReady]);

  // Opening VO: dedicated path for reliability on scene entry.
  // Played once per mount: muted, it completes silently and counts as played, so
  // unmuting later never resurrects the opening line.
  const openingVoPlayedRef = useRef(false);
  useEffect(() => {
    if (phase === STEPS.OPENING && !openingVoPlayedRef.current) {
      openingVoPlayedRef.current = true;
      if (isAudioOn) setVoiceVolume(OPENING_VO_VOLUME);
      playVoice('opening');
    }
  }, [phase, isAudioOn, playVoice, setVoiceVolume]);

  // LANGUAGE_GANESHA: Play reminder VO when cards are revealed.
  // NOTE: this races the entry-VO effect above (VOICE.language_play_first)
  // if showLanguageCards ever flips true within ~0-2s of phase entry - today
  // it's safe because showLanguageCards is only set after explicit user
  // action (Play tap / mantra finish), never synchronously on phase entry.
  // speak() cancels any in-flight utterance (see useGaneshaVoice.js), so if
  // that timing ever changes, this line and language_play_first will cut
  // each other off (same class of bug as the Modak/Pond VO fix).
  useEffect(() => {
    if (phase !== STEPS.LANGUAGE_GANESHA || !showLanguageCards) return;
    const reminderKey = `about-me-hut:my-indian-story:${phase}:cards-revealed:${VOICE.language_guess}`;
    if (wasStepVoSpokenRecently(reminderKey)) {
      setLanguageGuessPromptReady(true);
      return;
    }
    speak(VOICE.language_guess, {
      age: childAge,
      moment: 'default',
      onEnd: () => setLanguageGuessPromptReady(true),
      onError: () => setLanguageGuessPromptReady(true)
    });
  }, [phase, showLanguageCards, childAge, isAudioOn, speak, VOICE.language_guess]);

  const getPhaseReminderLine = useCallback((phase) => {
    switch (phase) {
      case STEPS.GANESHA_HOME:
        return 'Drag the magnifying glass to find me.';
      case STEPS.CHILD_HOME:
        return 'Choose the place connected with your family.';
      case STEPS.LANGUAGE_GANESHA:
        return hasPressedLanguagePlay ? VOICE.language_guess : VOICE.language_play_first;
      case STEPS.LANGUAGE_CHILD:
        return 'Choose up to three languages you use or hear.';
      case STEPS.FESTIVALS_GANESHA:
        return 'Tap my favorite festival.';
      case STEPS.FESTIVALS_CHILD:
        return 'Tap the festivals you celebrate.';
      case STEPS.ORIGIN_CARD:
        return 'Your places, languages, and celebrations can all be part of that connection.';
      default:
        return null;
    }
  }, [childName, hasPressedLanguagePlay, VOICE.language_guess, VOICE.language_play_first]);
  const replayCurrentVoice = useCallback(() => {
    if (!isAudioOn) return;
    if (phase === STEPS.OPENING) {
      setVoiceVolume(OPENING_VO_VOLUME);
      playVoice('opening');
      return;
    }
    if (phase === STEPS.LANGUAGE_GANESHA && hasPressedLanguagePlay && !showLanguageCards) {
      speakIfUnmuted(VOICE.language_audio, { age: childAge, moment: 'default' });
      return;
    }
    if (phase === STEPS.COMPLETE) {
      speakIfUnmuted(VOICE.completion_screen, { age: childAge, moment: 'celebration' });
      return;
    }
    const line = getPhaseReminderLine(phase);
    if (!line) return;
    speakIfUnmuted(line, { age: childAge, moment: 'encouragement' });
  }, [VOICE.completion_screen, VOICE.language_audio, childAge, getPhaseReminderLine, hasPressedLanguagePlay, isAudioOn, phase, playVoice, setVoiceVolume, showLanguageCards, speakIfUnmuted]);

  const replayLanguageAudio = useCallback(() => {
    playUiTap();
    if (!hasPressedLanguagePlay) {
      setHasPressedLanguagePlay(true);
    }
    setLangGuessIdleLevel(0);
    setLanguageGuessPromptReady(false);
    langGuessIdleVoiceRef.current = false;
    if (langGuessIdleTimerRef.current) clearTimeout(langGuessIdleTimerRef.current);
    setLangIdleRestartNonce(n => n + 1);

    const revealCards = () => setShowLanguageCards(true);
    const isFirstPlayReveal = phase === STEPS.LANGUAGE_GANESHA && !showLanguageCards;

    if (isFirstPlayReveal) {
      setShowLanguageCards(false);
      speakIfUnmuted(VOICE.language_audio, {
        age: childAge,
        moment: 'default',
        onEnd: () => safeSetTimeout(revealCards, 200),
        onError: () => safeSetTimeout(revealCards, 200)
      });
      safeSetTimeout(revealCards, 7000);
      return;
    }

    speakIfUnmuted(VOICE.language_audio, {
      age: childAge,
      moment: 'default',
      onEnd: () => setLanguageGuessPromptReady(true),
      onError: () => setLanguageGuessPromptReady(true)
    });
  }, [VOICE.language_audio, childAge, hasPressedLanguagePlay, isAudioOn, phase, playUiTap, safeSetTimeout, showLanguageCards, speakIfUnmuted]);

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
      if (import.meta.env.DEV) console.log('[Tab Return] Clearing shake state for language guess');
      setShakeLang(null);
    }
    if (shakeGuess !== null) {
      if (import.meta.env.DEV) console.log('[Tab Return] Clearing shake state for festival guess');
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
      const prePlayLine = VOICE.language_play_first;
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
  }, [returnHintNonce, isAudioOn, getPhaseReminderLine, phase, speakIfUnmuted, childAge, shakeLang, shakeGuess, hasPressedLanguagePlay, showLanguageCards, safeSetTimeout, discoveredLocations.length, VOICE.language_audio, VOICE.language_guess, VOICE.language_play_first]);

  // Child Home entry VO — single combined line, immediate
  useEffect(() => {
    if (phase !== STEPS.CHILD_HOME) return;
    if (solvedAtMountRef.current.homeChild) return; // resumes with its confirm line instead
    if (childHomeEntryVoiceTimerRef.current) clearTimeout(childHomeEntryVoiceTimerRef.current);
    const childHomeEntryKey = `${phase}:${VOICE.child_home_entry}`;
    if (entryVoPlayedForPhaseRef.current === childHomeEntryKey) {
      setChildHomePromptReady(true);
      return;
    }
    const playChildHomeEntry = () => {
      const childHomeStepVoiceKey = `about-me-hut:my-indian-story:${phase}:${VOICE.child_home_entry}`;
      const shouldBypassRecentDedupe = isReload && !reloadHandledRef.current;
      if (!shouldBypassRecentDedupe && wasStepVoSpokenRecently(childHomeStepVoiceKey)) {
        setChildHomePromptReady(true);
        return;
      }
      speakIfUnmuted(VOICE.child_home_entry, {
        age: childAge,
        moment: 'default',
        onEnd: () => setChildHomePromptReady(true),
        onError: () => setChildHomePromptReady(true)
      });
      RECENT_STEP_VO.set(childHomeStepVoiceKey, Date.now());
      entryVoPlayedForPhaseRef.current = childHomeEntryKey;
    };
    // Always wait ~500 ms: this line starts right as Ganesha Home's closing line ends or is cut off,
    // and speech started that instant is dropped silently (KNOWN_PITFALLS 2, 3). Flag and refs are
    // set when the timer FIRES, never before it (StrictMode cleanup clears it).
    const t = setTimeout(() => {
      firstEntryVoRef.current = false;
      playChildHomeEntry();
    }, 500);
    return () => clearTimeout(t);
  }, [phase, VOICE.child_home_entry, speakIfUnmuted, childAge, isAudioOn, isReload]);


  // One-time cleanup of the old private save (gmb_indian_story_<profile>): sceneState is the only
  // copy now, and a stale step in the old key must never resurrect.
  useEffect(() => {
    try { localStorage.removeItem(storyStorageKey); } catch (e) {}
  }, [storyStorageKey]);

  // ── RELOAD: Restart each phase state; entry VO is handled by phase-entry effects ─────────
  useEffect(() => {
    if (!isReload || reloadHandledRef.current) return;
    if (phase === STEPS.OPENING || phase === STEPS.COMPLETE) return;

    reloadHandledRef.current = true;
    entryVoPlayedForPhaseRef.current = null;
    RECENT_STEP_VO.clear();

    // Phase 1: Ganesha Home — reset discovered locations
    if (phase === STEPS.GANESHA_HOME) {
      if (!solvedAtMountRef.current.home) {
        setDiscoveredLocations([]);
        discoveredRef.current = new Set();
        setMglassPosition({ top: '30%', left: '20%' });
        setShowCelebration(false);
      }
      setGaneshaHomeIdleLevel(0);
      ganeshaHomeIdleVoiceRef.current = false;
      setCurrentPhase('ganesha_home');
      return;
    }

    // Phase 2: Child Home — reset region selection
    if (phase === STEPS.CHILD_HOME) {
      if (!solvedAtMountRef.current.homeChild) setSelectedRegion(null);
      setIsChildHomeContinueEnabled(false);
      setCurrentPhase('child_home');
      return;
    }

    // Phase 3: Language Ganesha (Guess) — reset guessing state
    if (phase === STEPS.LANGUAGE_GANESHA) {
      if (!solvedAtMountRef.current.lang) {
        setLangGuessPhase('guessing');
        setWrongLangGuesses(new Set());
        setShakeLang(null);
        setLangWrongReaction(null);
        setShowLanguageCards(false);
        setHasPressedLanguagePlay(false);
      }
      setLangGuessIdleLevel(0);
      langGuessIdleVoiceRef.current = false;
      setCurrentPhase('language_ganesha');
      return;
    }

    // Phase 4: Language Child (Select) — reset language selections
    if (phase === STEPS.LANGUAGE_CHILD) {
      if (!solvedAtMountRef.current.langChild) setSelectedLanguages([]);
      setSwappingOutLangId(null);
      setCurrentPhase('language_child');
      return;
    }

    // Phase 5: Festival Ganesha (Guess) — reset guessing state
    if (phase === STEPS.FESTIVALS_GANESHA) {
      if (!solvedAtMountRef.current.fest) setGuessPhase('guessing');
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
      if (!solvedAtMountRef.current.festChild) setSelectedFestivals([]);
      setSwappingOutFestId(null);
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
    if (phase === STEPS.GANESHA_HOME && !solvedAtMountRef.current.home) {
      setDiscoveredLocations([]);
      discoveredRef.current = new Set();
      setShowCelebration(false);
      setPhase1SpotSparkle(prev => ({ ...prev, index: null }));
      setMglassPosition({ top: '30%', left: '20%' });
    }
    if (phase === STEPS.FESTIVALS_GANESHA || phase === STEPS.FESTIVALS_CHILD) {
      if (!solvedAtMountRef.current.fest) setGuessPhase('guessing');
      setWrongGuesses(new Set());
      setShakeGuess(null);
    }
    if (phase === STEPS.LANGUAGE_GANESHA && !solvedAtMountRef.current.lang) {
      setLangGuessPhase('guessing');
      setWrongLangGuesses(new Set());
      setShakeLang(null);
      setLangWrongReaction(null);
      setShowLanguageCards(false); // Reset: hide cards until Play is pressed
      setHasPressedLanguagePlay(false);
    }
    if (phase === STEPS.CHILD_HOME && !isReload && !solvedAtMountRef.current.homeChild) {
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
    // Saved the moment the last place is found, not by the autosave: leaving now resumes solved.
    if (!stateRef.current.homeSolved) sceneActions.checkpoint({ homeSolved: true, homeSuccessDone: false });
    const wasResumed = solvedAtMountRef.current.home;
    let advanced = false;
    let cancelAdvance = null;
    const goToChildHome = () => {
      if (advanced) return;
      advanced = true;
      solvedAtMountRef.current.home = false;
      sceneActions.updateState({ phase: STEPS.CHILD_HOME });
    };
    if (wasResumed && stateRef.current.homeSuccessDone) {
      // Closing line finished before the child left: go straight on (after the 500 ms first-instant wait).
      setShowCelebration(true);
      const t = safeSetTimeout(goToChildHome, 500);
      return () => t?.();
    }
    setShowCelebration(false);

    // Let the final place-name VO finish before phase completion VO starts.
    // A resumed scene has no place name playing, so it only needs the 500 ms first-instant wait.
    const elapsedSinceLastDiscovery = Date.now() - lastDiscoveryTime.current;
    const completionDelayMs = wasResumed ? 500 : Math.max(1500, 2600 - elapsedSinceLastDiscovery);

    const cancel1 = safeSetTimeout(() => {
      setShowCelebration(true);
      triggerSparkle('all', 2400);
      const startedAt = Date.now();
      speakIfUnmuted(VOICE.phase1_complete, {
        age: childAge,
        moment: 'celebration',
        ignoreCancel: true,
        onEnd: () => {
          // Finished only if it really played to its end (not cancelled, not after leaving, not an instant error).
          if (Date.now() - startedAt >= 1000) sceneActions.checkpoint({ homeSuccessDone: true });
          goToChildHome();
        },
        onError: goToChildHome
      });
      // Failsafe: proceed even if voice callbacks fail.
      cancelAdvance = safeSetTimeout(goToChildHome, 6500);
    }, completionDelayMs);
    return () => {
      cancel1?.();
      cancelAdvance?.();
    };
  }, [phase, discoveredLocations.length, safeSetTimeout, triggerSparkle, speakIfUnmuted, childAge, VOICE.phase1_complete, isAudioOn]);

  // Ganesha Home hints — two steps, chosen by what the child already knows:
  //   Never dragged the magnifier yet (still learning HOW): ~12s "Move the magnifying glass around
  //     the map." + a brief finite magnifier nudge; ~10s after the line, the teaching hand replays once.
  //   Has dragged at least once (knows HOW, needs WHERE): ~12s one undiscovered spot softly glows
  //     (no VO); ~25s that exact spot gets a ring that stays until it is found. Never all spots.
  // Finding a spot restarts the cycle for the next one. Level 0 = none, 1 = clue, 2 = rescue.
  useEffect(() => {
    if (phase !== STEPS.GANESHA_HOME || discoveredLocations.length === PHASE1_LOCATIONS.length || !ganeshaHomePromptReady) {
      // NOTE: the level state must NOT be read here or listed in the deps below — a dependency on
      // the effect's own level re-ran it on every level change and restarted the chain.
      setGaneshaHomeIdleLevel(0);
      ganeshaHomeIdleVoiceRef.current = false;
      if (ganeshaHomeIdleTimerRef.current) clearTimeout(ganeshaHomeIdleTimerRef.current);
      return;
    }

    let cancelled = false;
    setGaneshaHomeIdleLevel(0);
    ganeshaHomeIdleTimerRef.current = setTimeout(() => {
      setGaneshaHomeIdleLevel(1);
      const armFinal = () => {
        if (cancelled) return;
        ganeshaHomeIdleTimerRef.current = setTimeout(() => setGaneshaHomeIdleLevel(2), ganeshaHomeGestureDismissed ? 13000 : 10000);
      };
      if (!ganeshaHomeGestureDismissed) {
        ganeshaHomeIdleVoiceRef.current = true;
        speakIfUnmuted('Move the magnifying glass around the map.', { age: childAge, moment: 'default', onEnd: armFinal, onError: armFinal });
      } else {
        armFinal();
      }
    }, 12000);

    return () => {
      cancelled = true;
      if (ganeshaHomeIdleTimerRef.current) clearTimeout(ganeshaHomeIdleTimerRef.current);
    };
  }, [phase, discoveredLocations.length, returnHintNonce, speakIfUnmuted, childAge, ganeshaHomePromptReady, ganeshaHomeIdleRestartNonce, ganeshaHomeGestureDismissed]);

  // Language Ganesha pre-play: the Play button pulses twice (finite, not a permanent breathing
  // button). If the child still hasn't pressed it after ~11s, repeat "Tap play and listen
  // carefully." once and pulse twice more.
  useEffect(() => {
    if (phase !== STEPS.LANGUAGE_GANESHA || hasPressedLanguagePlay || langGuessPhase !== 'guessing') {
      if (languagePlayNudgeTimeoutRef.current) clearTimeout(languagePlayNudgeTimeoutRef.current);
      languagePlayNudgeTimeoutRef.current = null;
      return;
    }

    languagePlayNudgeTimeoutRef.current = setTimeout(() => {
      speakIfUnmuted(VOICE.language_play_first, { age: childAge, moment: 'default' });
      setPlayPulseKey((n) => n + 1);
    }, 11000);

    return () => {
      if (languagePlayNudgeTimeoutRef.current) clearTimeout(languagePlayNudgeTimeoutRef.current);
      languagePlayNudgeTimeoutRef.current = null;
    };
  }, [phase, hasPressedLanguagePlay, langGuessPhase, speakIfUnmuted, childAge, VOICE.language_play_first]);

  // Child Home: reflective/personal-question repeat — one repeat at 10s, no escalation.
  useEffect(() => {
    if (phase !== STEPS.CHILD_HOME || selectedRegion || !childHomePromptReady) return;
    if (childHomeIdleHintTimerRef.current) clearTimeout(childHomeIdleHintTimerRef.current);
    childHomeIdleHintVoiceRef.current = false;
    childHomeIdleHintTimerRef.current = setTimeout(() => {
      if (!childHomeIdleHintVoiceRef.current && isAudioOn) {
        speak(VOICE.child_home_idle, { age: childAge, moment: 'default' });
        childHomeIdleHintVoiceRef.current = true;
      }
    }, 10000);
    return () => {
      if (childHomeIdleHintTimerRef.current) clearTimeout(childHomeIdleHintTimerRef.current);
    };
  }, [phase, selectedRegion, childAge, isAudioOn, speak, VOICE.child_home_idle, returnHintNonce, childHomePromptReady]);

  // Language Child: reflective/personal-question repeat — one repeat at 10s, no escalation.
  useEffect(() => {
    if (phase !== STEPS.LANGUAGE_CHILD || selectedLanguages.length > 0 || !languageChildPromptReady) return;
    if (languageSelectionIdleHintTimerRef.current) clearTimeout(languageSelectionIdleHintTimerRef.current);
    languageSelectionIdleHintVoiceRef.current = false;
    languageSelectionIdleHintTimerRef.current = setTimeout(() => {
      if (!languageSelectionIdleHintVoiceRef.current && isAudioOn) {
        speak(VOICE.language_child_idle, { age: childAge, moment: 'default' });
        languageSelectionIdleHintVoiceRef.current = true;
      }
    }, 10000);
    return () => {
      if (languageSelectionIdleHintTimerRef.current) clearTimeout(languageSelectionIdleHintTimerRef.current);
    };
  }, [phase, selectedLanguages.length, childAge, isAudioOn, speak, VOICE.language_child_idle, returnHintNonce, languageChildPromptReady]);

  // Festivals Child: reflective/personal-question repeat — one repeat at 10s, no escalation.
  useEffect(() => {
    if (phase !== STEPS.FESTIVALS_CHILD || selectedFestivals.length > 0 || !festivalChildPromptReady) return;
    if (festivalSelectionIdleHintTimerRef.current) clearTimeout(festivalSelectionIdleHintTimerRef.current);
    festivalSelectionIdleHintVoiceRef.current = false;
    festivalSelectionIdleHintTimerRef.current = setTimeout(() => {
      if (!festivalSelectionIdleHintVoiceRef.current && isAudioOn) {
        speak(VOICE.festivals_child_idle, { age: childAge, moment: 'default' });
        festivalSelectionIdleHintVoiceRef.current = true;
      }
    }, 10000);
    return () => {
      if (festivalSelectionIdleHintTimerRef.current) clearTimeout(festivalSelectionIdleHintTimerRef.current);
    };
  }, [phase, selectedFestivals.length, childAge, isAudioOn, speak, VOICE.festivals_child_idle, returnHintNonce, festivalChildPromptReady]);

  // Language Ganesha (Sanskrit guess) — recognition task, two steps (no decorative wobble first):
  //   ~12s  meaning clue VO ("Think of the language many shlokas are in.")
  //   ~10s after the clue ends (~25s) → Sanskrit gets the strong persistent glow. No 2nd VO.
  // A wrong tap must NOT end or restart this (it is evidence the child needs help), so it neither
  // clears the timers nor appears in the deps.
  useEffect(() => {
    if (phase !== STEPS.LANGUAGE_GANESHA || langGuessPhase !== 'guessing' || !hasPressedLanguagePlay || !showLanguageCards || !languageGuessPromptReady) {
      // (level state intentionally not read/listed in deps — see Ganesha Home above)
      setLangGuessIdleLevel(0);
      langGuessIdleVoiceRef.current = false;
      if (langGuessIdleTimerRef.current) clearTimeout(langGuessIdleTimerRef.current);
      return;
    }

    let cancelled = false;
    let fallbackId = null;
    setLangGuessIdleLevel(0);
    langGuessIdleTimerRef.current = setTimeout(() => {
      setLangGuessIdleLevel(1);
      let armed = false;
      const armFinal = () => {
        if (armed || cancelled) return;
        armed = true;
        langGuessIdleTimerRef.current = setTimeout(() => setLangGuessIdleLevel(2), 10000);
      };
      // Armed when the clue line ends — or after a time limit, since speech "ended" is not always
      // delivered (a tap can cut the line).
      fallbackId = setTimeout(armFinal, 7000);
      langGuessIdleVoiceRef.current = true;
      speakIfUnmuted(VOICE.language_guess_hint, { age: childAge, moment: 'default', onEnd: armFinal, onError: armFinal });
    }, 12000);

    return () => {
      cancelled = true;
      if (fallbackId) clearTimeout(fallbackId);
      if (langGuessIdleTimerRef.current) clearTimeout(langGuessIdleTimerRef.current);
    };
  }, [phase, langGuessPhase, returnHintNonce, speakIfUnmuted, childAge, hasPressedLanguagePlay, showLanguageCards, VOICE.language_audio, VOICE.language_guess_hint, langIdleRestartNonce, languageGuessPromptReady, isAudioOn]);

  // Festival Ganesha — same two steps as the Sanskrit guess:
  //   ~12s meaning clue VO → ~10s after it ends (~25s) Ganesh Chaturthi gets the persistent glow.
  // A wrong tap must NOT end or restart the timers (see the Language effect above).
  useEffect(() => {
    if (phase !== STEPS.FESTIVALS_GANESHA || guessPhase !== 'guessing' || !festivalGuessPromptReady) {
      // (level state intentionally not read/listed in deps — see Ganesha Home above)
      setFestGuessIdleLevel(0);
      festGuessIdleVoiceRef.current = false;
      if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
      return;
    }

    let cancelled = false;
    let fallbackId = null;
    setFestGuessIdleLevel(0);
    festGuessIdleTimerRef.current = setTimeout(() => {
      setFestGuessIdleLevel(1);
      let armed = false;
      const armFinal = () => {
        if (armed || cancelled) return;
        armed = true;
        festGuessIdleTimerRef.current = setTimeout(() => setFestGuessIdleLevel(2), 10000);
      };
      fallbackId = setTimeout(armFinal, 7000);
      festGuessIdleVoiceRef.current = true;
      speakIfUnmuted(VOICE.festivals_guess_hint, { age: childAge, moment: 'default', onEnd: armFinal, onError: armFinal });
    }, 12000);

    return () => {
      cancelled = true;
      if (fallbackId) clearTimeout(fallbackId);
      if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
    };
  }, [phase, guessPhase, returnHintNonce, speakIfUnmuted, childAge, festivalGuessPromptReady, VOICE.festivals_guess_hint]);

  // Check location discovery
  // percentX/percentY are the glass's top-left corner. The child aims the LENS, so
  // test the lens centre (measured from the PNG: ~43% / 40% into the image box),
  // not the corner. Zone = 7% radius ellipse around the target.
  const checkLocationDiscovery = useCallback((percentX, percentY) => {
    const lens = getMglassLensPercent(percentX, percentY);
    PHASE1_LOCATIONS.forEach((loc, idx) => {
      const dx = lens.x - loc.x;
      const dy = lens.y - loc.y;
      if ((dx * dx + dy * dy) / (PHASE1_ZONE_RADIUS * PHASE1_ZONE_RADIUS) < 1) {
        discoverLocation(idx);
      }
    });
  }, []);

const discoverLocation = useCallback((index) => {
  if (discoveredRef.current.has(index)) return;
  discoveredRef.current.add(index);
  lastDiscoveryTime.current = Date.now();

  const location = PHASE1_LOCATIONS[index];
    // A find is real progress: clear the hint ladder so the next spot starts a fresh 10/18/26.
    setGaneshaHomeIdleLevel(0);
    ganeshaHomeIdleVoiceRef.current = false;
    setDiscoveredLocations(prev => [...prev, index]);
    playSparkle();
    triggerMiniGesture({
      target: 'phase1-spot',
      durationMs: 1500,
      position: { x: location.x, y: Math.max(8, location.y - 8) },
    });
    triggerSparkle('single', 1700);
    triggerPhase1SpotSparkle(index, 1700);
    speakIfUnmuted(location.name, { age: childAge, moment: 'story' });
  }, [playSparkle, triggerMiniGesture, triggerSparkle, triggerPhase1SpotSparkle, speakIfUnmuted, childAge]);

  // Handle magnifying glass move
  const handleMglassMove = useCallback((newPosition) => {
    stopVoice();
    setMglassPosition(newPosition);
    if (phase === STEPS.GANESHA_HOME) {
      // The child has understood the drag mechanic. Teaching hand should
      // never compete with their own finger.
      setGaneshaHomeGestureDismissed(true);

      // Searching is an attempt, not progress. With NO hint showing, a drag restarts the idle
      // window; once a hint (L1/L2/L3) is up it stays up — the L3 region highlight must not
      // vanish the moment the child starts moving the magnifier. Finding a spot resets the ladder.
      if (ganeshaHomeIdleLevelRef.current < 1) {
        ganeshaHomeIdleVoiceRef.current = false;
        if (ganeshaHomeIdleTimerRef.current) clearTimeout(ganeshaHomeIdleTimerRef.current);
        setGaneshaHomeIdleRestartNonce(n => n + 1);
      }
    }
    const percentX = parseFloat(newPosition.left);
    const percentY = parseFloat(newPosition.top);
    checkLocationDiscovery(percentX, percentY);
  }, [checkLocationDiscovery, phase, stopVoice]);

  // Handle region select
  const handleRegionSelect = (region, event) => {
    stopVoice();
    playUiTap();
    triggerMiniGesture(1500);
    const regionRect = event?.currentTarget?.getBoundingClientRect?.();
    const regionSparklePosition = regionRect
      ? { x: regionRect.left + regionRect.width / 2, y: regionRect.top + regionRect.height / 2 }
      : null;
    triggerSparkle({ type: 'single', durationMs: 1700, position: regionSparklePosition, radius: 170 });
    if (childHomeIdleTimerRef.current) clearTimeout(childHomeIdleTimerRef.current);
    if (childHomePostSelectTimerRef.current) clearTimeout(childHomePostSelectTimerRef.current);
    if (childHomeIdleHintTimerRef.current) clearTimeout(childHomeIdleHintTimerRef.current);
    childHomeIdleHintVoiceRef.current = false;
    // Reset idle hint on region selection
    if (ganeshaHomeIdleLevel > 0) {
      if (import.meta.env.DEV) console.log('[Idle Hint] Reset: Child selected region');
      setGaneshaHomeIdleLevel(0);
      ganeshaHomeIdleVoiceRef.current = false;
    }
    setSelectedRegion(region);
    setIsChildHomeContinueEnabled(false);
    // Like languages/festivals: tapping a place says its name; Continue then plays the confirm line.
    speakIfUnmuted(region.label, { age: childAge, moment: 'story' });
    childHomePostSelectTimerRef.current = setTimeout(() => {
      setIsChildHomeContinueEnabled(true);
    }, 900);
  };

  // Handle language toggle
  const toggleLanguage = (lang, event) => {
    stopVoice();
    playUiTap();
    triggerMiniGesture(1500);
    const langRect = event?.currentTarget?.getBoundingClientRect?.();
    const langSparklePosition = langRect
      ? { x: langRect.left + langRect.width / 2, y: langRect.top + langRect.height / 2 }
      : null;
    triggerSparkle({ type: 'single', durationMs: 1700, position: langSparklePosition, radius: 170 });
    // Reset idle hints on language selection
    if (langGuessIdleLevel > 0) {
      if (import.meta.env.DEV) console.log('[Idle Hint Language] Reset: Child selected language');
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
      return [...prev, lang];
    });
    speakIfUnmuted(lang.label, { age: childAge, moment: 'encouragement' });
  };

  // Handle festival toggle
  const toggleFestival = (fest, event) => {
    stopVoice();
    playUiTap();
    triggerMiniGesture(1500);
    const festRect = event?.currentTarget?.getBoundingClientRect?.();
    const festSparklePosition = festRect
      ? { x: festRect.left + festRect.width / 2, y: festRect.top + festRect.height / 2 }
      : null;
    triggerSparkle({ type: 'single', durationMs: 1700, position: festSparklePosition, radius: 170 });
    // Reset idle hints on festival selection
    if (festGuessIdleLevel > 0) {
      if (import.meta.env.DEV) console.log('[Idle Hint Festival] Reset: Child selected festival');
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
      return [...prev, fest];
    });
    speakIfUnmuted(fest.label, { age: childAge, moment: 'encouragement' });
  };

  // Language success: sparkle + line, then on to the child's languages. The line only counts as
  // finished when it really played to its end (not cancelled, not after leaving, not an instant
  // error), and only then is langGuessSuccessDone saved (KNOWN_PITFALLS 7, 11c).
  const playLangSuccess = ({ celebrate = false } = {}) => {
    setLangGuessPhase('correct');
    if (celebrate) {
      triggerSparkle('all', 2400);
      playSparkle();
      triggerMiniGesture(1500);
      playChime();
    }
    let advanced = false;
    const advanceToNextPhase = () => {
      if (advanced) return;
      advanced = true;
      safeSetTimeout(() => {
        setLangGuessPhase('revealed');
        sceneActions.updateState({ phase: STEPS.LANGUAGE_CHILD });
      }, 2000);
    };
    const startedAt = Date.now();
    speakIfUnmuted(VOICE.language_correct, {
      age: childAge,
      moment: 'celebration',
      ignoreCancel: true,
      onEnd: () => {
        if (Date.now() - startedAt >= 1000) sceneActions.checkpoint({ langGuessSuccessDone: true });
        advanceToNextPhase();
      },
      onError: advanceToNextPhase
    });
    safeSetTimeout(advanceToNextPhase, 5000);
  };

  // Handle language guess
  const handleLanguageGuess = (guessLang) => {
    playUiTap();
    const isCorrect = guessLang.id === 'sanskrit';

    if (isCorrect) {
      stopVoice();
      // Only a correct answer ends the hint cycle; a wrong one leaves the clock (and any glow) alone.
      setLangGuessIdleLevel(0);
      langGuessIdleVoiceRef.current = false;
      if (langGuessIdleTimerRef.current) clearTimeout(langGuessIdleTimerRef.current);
      // Saved at the tap, not by the autosave: leaving now resumes on the solved state.
      sceneActions.checkpoint({ langGuessSolved: true, langGuessSuccessDone: false });
      playLangSuccess({ celebrate: true });
    } else {
      setWrongLangGuesses(prev => new Set(prev).add(guessLang.id));
      setShakeLang(null);
      safeSetTimeout(() => setShakeLang(guessLang.id), 0);
      // Once the clue has started (or the glow is showing), a wrong tap is shake-only so it never
      // cuts the useful clue by reading out the tapped language.
      if (langGuessIdleLevel === 0) {
        stopVoice();
        speakIfUnmuted(guessLang.label, { age: childAge, moment: 'default' });
      }
      safeSetTimeout(() => setShakeLang(null), 500);
    }
  };

  // Festival success: the tapped label, then "Yes - Ganesh Chaturthi!", then on to the child's
  // festivals. Resuming (label = null) replays only the interrupted closing line.
  const playFestSuccess = ({ celebrate = false, label = null } = {}) => {
    setGuessPhase('correct');
    if (celebrate) {
      triggerSparkle('all', 2400);
      playSparkle();
      triggerMiniGesture(1500);
      playChime();
    }
    let advanced = false;
    const goToFestivalChildPhase = () => {
      if (advanced) return;
      advanced = true;
      setGuessPhase('revealed');
      sceneActions.updateState({ phase: STEPS.FESTIVALS_CHILD });
    };
    const speakCorrectFeedback = () => {
      const startedAt = Date.now();
      speakIfUnmuted('Yes \u2014 Ganesh Chaturthi!', {
        age: childAge,
        moment: 'celebration',
        ignoreCancel: true,
        onEnd: () => {
          if (Date.now() - startedAt >= 1000) sceneActions.checkpoint({ festGuessSuccessDone: true });
          goToFestivalChildPhase();
        },
        onError: goToFestivalChildPhase
      });
    };
    if (label) {
      speakIfUnmuted(label, {
        age: childAge,
        moment: 'default',
        ignoreCancel: true,
        onEnd: speakCorrectFeedback,
        onError: speakCorrectFeedback
      });
    } else {
      speakCorrectFeedback();
    }
    safeSetTimeout(goToFestivalChildPhase, 6500);
  };

  // Handle festival guess
  const handleFestivalGuess = (fest) => {
    playUiTap();
    const isCorrect = fest.id === 'ganesh';

    if (isCorrect) {
      stopVoice();
      // Only a correct answer ends the hint cycle; a wrong one leaves the clock (and any glow) alone.
      setFestGuessIdleLevel(0);
      festGuessIdleVoiceRef.current = false;
      if (festGuessIdleTimerRef.current) clearTimeout(festGuessIdleTimerRef.current);
      sceneActions.checkpoint({ festGuessSolved: true, festGuessSuccessDone: false });
      playFestSuccess({ celebrate: true, label: fest.label });
    } else {
      if (!wrongGuesses.has(fest.id)) {
        setWrongGuesses(prev => new Set(prev).add(fest.id));
      }
      setShakeGuess(null);
      safeSetTimeout(() => setShakeGuess(fest.id), 0);
      // Shake-only once the clue has started / the glow is showing, so it never cuts the clue.
      if (festGuessIdleLevel === 0) {
        stopVoice();
        speakIfUnmuted(fest.label, { age: childAge, moment: 'default' });
      }
      safeSetTimeout(() => setShakeGuess(null), 500);
    }
  };

  // Child steps: Continue / See Our Story speak a confirm line, then move on. The line only counts as
  // finished when it really played to its end; only then is ...ConfirmDone saved (KNOWN_PITFALLS 7, 11c).
  const playChildConfirm = (line, doneKey, goNext) => {
    let advanced = false;
    const advance = () => {
      if (advanced) return;
      advanced = true;
      goNext();
    };
    const startedAt = Date.now();
    speakIfUnmuted(line, {
      age: childAge,
      moment: 'celebration',
      ignoreCancel: true,
      onEnd: () => {
        if (Date.now() - startedAt >= 1000) sceneActions.checkpoint({ [doneKey]: true });
        advance();
      },
      onError: advance,
    });
    safeSetTimeout(advance, 4500);
  };
  const playLangChildConfirm = () => playChildConfirm(VOICE.language_confirmed, 'langChildConfirmDone', () => sceneActions.updateState({ phase: STEPS.FESTIVALS_GANESHA }));
  const playFestChildConfirm = () => playChildConfirm(VOICE.festivals_confirmed, 'festChildConfirmDone', () => sceneActions.updateState({ phase: STEPS.ORIGIN_CARD }));
  const playHomeChildConfirm = () => playChildConfirm(VOICE.child_home_confirmed, 'homeChildConfirmDone', () => sceneActions.updateState({ phase: STEPS.LANGUAGE_GANESHA }));
  const playHomeChildConfirmRef = useRef(null);
  playHomeChildConfirmRef.current = playHomeChildConfirm;
  const playLangChildConfirmRef = useRef(null);
  const playFestChildConfirmRef = useRef(null);
  playLangChildConfirmRef.current = playLangChildConfirm;
  playFestChildConfirmRef.current = playFestChildConfirm;

  // Resume on a SOLVED guess phase (Continue / refresh): show the finished state, replay the success
  // line only if the child left during it, then advance. The flag is cleared when the timer FIRES,
  // never before it (StrictMode cleanup clears the timer; KNOWN_PITFALLS 1).
  const playLangSuccessRef = useRef(null);
  const playFestSuccessRef = useRef(null);
  playLangSuccessRef.current = playLangSuccess;
  playFestSuccessRef.current = playFestSuccess;
  useEffect(() => {
    const solved = solvedAtMountRef.current;
    if (phase === STEPS.LANGUAGE_GANESHA && solved.lang) {
      const t = setTimeout(() => {
        solved.lang = false;
        if (stateRef.current.langGuessSuccessDone) {
          setLangGuessPhase('revealed');
          sceneActions.updateState({ phase: STEPS.LANGUAGE_CHILD });
        } else {
          playLangSuccessRef.current();
        }
      }, 500);
      return () => clearTimeout(t);
    }
    if (phase === STEPS.CHILD_HOME && solved.homeChild) {
      const t = setTimeout(() => {
        solved.homeChild = false;
        if (stateRef.current.homeChildConfirmDone) sceneActions.updateState({ phase: STEPS.LANGUAGE_GANESHA });
        else playHomeChildConfirmRef.current();
      }, 500);
      return () => clearTimeout(t);
    }
    if (phase === STEPS.LANGUAGE_CHILD && solved.langChild) {
      const t = setTimeout(() => {
        solved.langChild = false;
        if (stateRef.current.langChildConfirmDone) sceneActions.updateState({ phase: STEPS.FESTIVALS_GANESHA });
        else playLangChildConfirmRef.current();
      }, 500);
      return () => clearTimeout(t);
    }
    if (phase === STEPS.FESTIVALS_CHILD && solved.festChild) {
      const t = setTimeout(() => {
        solved.festChild = false;
        if (stateRef.current.festChildConfirmDone) sceneActions.updateState({ phase: STEPS.ORIGIN_CARD });
        else playFestChildConfirmRef.current();
      }, 500);
      return () => clearTimeout(t);
    }
    if (phase === STEPS.FESTIVALS_GANESHA && solved.fest) {
      const t = setTimeout(() => {
        solved.fest = false;
        if (stateRef.current.festGuessSuccessDone) {
          setGuessPhase('revealed');
          sceneActions.updateState({ phase: STEPS.FESTIVALS_CHILD });
        } else {
          playFestSuccessRef.current();
        }
      }, 500);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- sceneActions is a new object every SceneManager render
  }, [phase]);

  // Complete scene
const handleComplete = () => {
  SimpleSceneManager.clearCurrentScene();
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
      {SHOW_HIT_ZONES && (
        <style>{'.mis-wrapper button:not(:disabled):not(.mis-language-replay-btn), .mis-wrapper .mis-language-replay-btn:not(:disabled)::after { outline: 3px dashed #E91E63 !important; background-color: rgba(233, 30, 99, 0.16) !important; }'}</style>
      )}
      <img src={bgImage} alt="Background" className="mis-background" />
      <ResumeCountdown value={countdownValue} />
      <ZoneBadgeButton variant="gameplay" zoneId="about-me-hut" onBack={() => {
        stopVoice();
        SimpleSceneManager.clearCurrentScene();
        onNavigate?.('zone-welcome');
      }} />
      {/* [per-scene mute removed 2026-10-09] <AudioToggle variant="gameplay" isAudioOn={isAudioOn} onToggle={handleAudioToggle} /> */}
      <VOReplayButton variant="gameplay" onReplay={replayCurrentVoice} disabled={!isAudioOn} />
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
          <AboutMeSparkle key={sparkleState.key} preset={sparkleState.type === 'all' ? 'big' : 'burst'} />
        </div>
      )}

      {/* Center mini gesture (used across child phases and celebration taps) */}
      {miniGesture.show && miniGesture.position === 'center' && (
        <GaneshaGestureCue
          key={miniGesture.key}
          gestureType={miniGesture.type}
          position="center"
          size={56}
        />
      )}

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
          completionSubtitle="Families can connect to India in many different ways."
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
            stopVoice();
            SimpleSceneManager.clearCurrentScene();
            if (onComplete) onComplete(sceneId, { stars: 3, completed: true });
            if (onNavigate) onNavigate('zone-welcome');
          }}
          onReplay={() => {
            SimpleSceneManager.setCurrentScene('about-me-hut', 'my-indian-story', false, false);
            clearAllTimeouts();
            stopVoice();
            stop();
            stopMusic();

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
            if (phase1ReturnHintTimerCancelRef.current) phase1ReturnHintTimerCancelRef.current();
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
            setGuessPhase('guessing');
            setWrongGuesses(new Set());
            setShakeGuess(null);
            setActiveFestReaction(null);
            setSwappingOutFestId(null);
            sceneActions.updateState({
              phase: STEPS.OPENING,
              selectedRegion: null,
              selectedLanguages: [],
              selectedFestivals: [],
              discoveredLocations: [],
              showCelebration: false,
              completed: false,
              showingCompletionScreen: false,
              homeChildConfirmed: false,
              homeChildConfirmDone: false,
              langChildConfirmed: false,
              langChildConfirmDone: false,
              festChildConfirmed: false,
              festChildConfirmDone: false,
              homeSolved: false,
              homeSuccessDone: false,
              langGuessSolved: false,
              langGuessSuccessDone: false,
              festGuessSolved: false,
              festGuessSuccessDone: false
            });
            solvedAtMountRef.current = { home: false, lang: false, fest: false, homeChild: false, langChild: false, festChild: false };
          }}
          onExploreZones={() => {
            SimpleSceneManager.clearCurrentScene();
            if (onNavigate) onNavigate('zone-welcome');
            else if (onBack) onBack();
          }}
          onHome={() => {
            SimpleSceneManager.clearCurrentScene();
            if (onNavigate) onNavigate('home');
          }}
        />
        );
      })()}

      {/* Ganesha Home Phase */}
      {phase === STEPS.GANESHA_HOME && (
        <div className="mis-ganesha-home-phase" style={{ minHeight: 'var(--app-height, 100vh)', paddingTop: '40px', paddingBottom: '40px' }}>
          <StoryProgressHeader
            discoveries={discoveredLocations.length > 0 ? discoveredLocations.map(idx => ({ ...PHASE1_LOCATIONS[idx], image: PHASE1_LOCATIONS[idx].icon })) : []}
            isChildMode={false}
          />

          <AboutMeGaneshaHost image={babyGaneshaImg} className="about-me-ganesha-host--left-middle" />

          {/* India Map Container */}
          <div
            className="mis-india-map-wrap"
            style={{
              margin: 'clamp(24px, 6vh, 90px) auto 0',
              overflow: 'visible',
            }}
          >
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
            {miniGesture.show && miniGesture.position === 'anchored' && miniGesture.anchor && (
              <GaneshaGestureCue
                key={miniGesture.key}
                gestureType={miniGesture.type}
                position="anchored"
                anchor={miniGesture.anchor}
                size={56}
              />
            )}

            {/* Undiscovered location targets with idle hint glow */}
            {GANESHA_SPOTS.map((spot, idx) => {
              const isDiscovered = discoveredLocations.includes(idx);
              const isUndiscovered = !isDiscovered;
              // Only once the child knows how to drag does the hint answer WHERE — and only for ONE
              // undiscovered spot (the first), never all of them at once. Step 1 glows softly, step 2
              // is a ring that stays until the spot is found. No VO, no pointing emoji.
              const isHintSpot = isUndiscovered && ganeshaHomeGestureDismissed
                && idx === PHASE1_LOCATIONS.findIndex((_, i) => !discoveredLocations.includes(i));
              const shouldGlow = isHintSpot && ganeshaHomeIdleLevel === 1;
              const isFinalTarget = isHintSpot && ganeshaHomeIdleLevel >= 2;

              return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  top: PHASE1_LOCATIONS[idx] ? `${PHASE1_LOCATIONS[idx].y}%` : '50%',
                  left: PHASE1_LOCATIONS[idx] ? `${PHASE1_LOCATIONS[idx].x}%` : '50%',
                  width: isFinalTarget ? '64px' : '40px',
                  height: isFinalTarget ? '64px' : '40px',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  border: isFinalTarget ? '3px solid rgba(0, 229, 255, 0.9)' : 'none',
                  background: 'transparent',
                  pointerEvents: 'none',
                  zIndex: 1,
                  animation: isFinalTarget
                    ? 'phase1HintGlowFinal 1.6s ease-in-out infinite'
                    : shouldGlow
                      ? 'phase1HintGlowGuide 1.6s ease-in-out 2'
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
                <AboutMeSparkle key={`phase1-spot-sparkle-${phase1SpotSparkle.key}`} preset="burst" />
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
                    width: 'clamp(42px, 4vw + 24px, 68px)',
                    height: 'clamp(42px, 4vw + 24px, 68px)',
                    zIndex: 5,
                    pointerEvents: 'none',
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

            {/* Standard sparkle burst on celebration */}
            {showCelebration && HEART_POSITIONS.map((pos, i) => (
              <div
                key={`phase1-celebration-sparkle-${i}`}
                style={{
                  position: 'absolute',
                  top: pos.top,
                  left: pos.left,
                  width: '110px',
                  height: '110px',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  pointerEvents: 'none',
                }}
              >
                <AboutMeSparkle preset="burst" />
              </div>
            ))}

            <style>{`
              @keyframes popIn {
                from { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
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

            <GestureDemo
              type="drag"
              from={{
                x: Math.min(92, parsePercent(mglassPosition.left, 20) + 7),
                y: Math.min(92, parsePercent(mglassPosition.top, 30) + 7),
              }}
              to={{
                x: Math.min(92, parsePercent(mglassPosition.left, 20) + 19),
                y: Math.min(92, parsePercent(mglassPosition.top, 30) + 10),
              }}
              active={
                phase === STEPS.GANESHA_HOME &&
                ganeshaHomeGestureReady &&
                !ganeshaHomeGestureDismissed &&
                discoveredLocations.length < PHASE1_LOCATIONS.length &&
                !showCelebration
              }
              idleDelay={300}
              iterations={1}
              zIndex={25}
            />

            {/* Rescue: only if the child has STILL never dragged — replay the demonstration once. */}
            {phase === STEPS.GANESHA_HOME && !ganeshaHomeGestureDismissed && ganeshaHomeIdleLevel >= 2 && discoveredLocations.length < PHASE1_LOCATIONS.length && !showCelebration && (
              <GestureDemo
                key="mis-home-rescue-demo"
                type="drag"
                from={{
                  x: Math.min(92, parsePercent(mglassPosition.left, 20) + 7),
                  y: Math.min(92, parsePercent(mglassPosition.top, 30) + 7),
                }}
                to={{
                  x: Math.min(92, parsePercent(mglassPosition.left, 20) + 19),
                  y: Math.min(92, parsePercent(mglassPosition.top, 30) + 10),
                }}
                active
                idleDelay={0}
                iterations={1}
                zIndex={25}
              />
            )}

            {SHOW_HIT_ZONES && (
              <>
                {/* Discovery zones exactly as checkLocationDiscovery tests them: an ellipse of PHASE1_ZONE_RADIUS (% of the map box) around each target */}
                {PHASE1_LOCATIONS.map((loc) => (
                  <div
                    key={`hz-${loc.name}`}
                    style={{
                      position: 'absolute',
                      left: `${loc.x - PHASE1_ZONE_RADIUS}%`,
                      top: `${loc.y - PHASE1_ZONE_RADIUS}%`,
                      width: `${PHASE1_ZONE_RADIUS * 2}%`,
                      height: `${PHASE1_ZONE_RADIUS * 2}%`,
                      borderRadius: '50%',
                      outline: '3px dashed #E91E63',
                      background: 'rgba(233, 30, 99, 0.16)',
                      zIndex: 19,
                      pointerEvents: 'none',
                    }}
                  />
                ))}
                {/* The point that is actually compared: the lens centre */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${getMglassLensPercent(parsePercent(mglassPosition.left, 20), parsePercent(mglassPosition.top, 30)).x}%`,
                    top: `${getMglassLensPercent(parsePercent(mglassPosition.left, 20), parsePercent(mglassPosition.top, 30)).y}%`,
                    width: 10,
                    height: 10,
                    marginLeft: -5,
                    marginTop: -5,
                    borderRadius: '50%',
                    background: '#1565C0',
                    zIndex: 30,
                    pointerEvents: 'none',
                  }}
                />
              </>
            )}

            {/* Draggable Magnifying Glass using FreeDraggableItem */}
            <FreeDraggableItem
              id="magnifying-glass"
              position={mglassPosition}
              onPositionChange={(newPos) => handleMglassMove(newPos)}
              bounds={{ top: 0, left: 0, right: 100, bottom: 140 }}
              style={{
                width: 'clamp(72px, 9vw + 48px, 130px)',
                height: 'clamp(72px, 9vw + 48px, 130px)',
                zIndex: 20,
                cursor: 'grab',
                // A brief nudge (3 short wobbles), and only before the child has dragged it themselves —
                // once they know the mechanic, a moving tool is distracting; the SPOT is the hint then.
                animation: ganeshaHomeIdleLevel === 1 && !ganeshaHomeGestureDismissed ? 'idleWobble 0.5s ease-in-out 3' : 'none',
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
        <div className="mis-child-home-phase" style={{ minHeight: 'var(--app-height, 100vh)', paddingTop: '40px', paddingBottom: '40px' }}>
          <div
            className="mis-india-map-wrap"
            style={{
              margin: 'clamp(24px, 6vh, 90px) auto 0',
              overflow: 'visible',
            }}
          >
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

            {INDIA_REGIONS.filter(r => r.id !== 'kailash').map((region) => {
              const isSelected = selectedRegion?.id === region.id;
              const shortLabel = region.label.replace(' India', '');
              return (
                <button
                  key={region.id}
                  className={`mis-region-pin ${isSelected ? 'is-selected' : ''}`}
                  onClick={(event) => handleRegionSelect(region, event)}
                  style={{
                    position: 'absolute',
                    top: region.mapTop,
                    left: region.mapLeft,
                    transform: isSelected
                      ? 'translate(-50%, -50%) scale(1.08)'
                      : 'translate(-50%, -50%)',
                  }}
                  aria-label={region.label}
                >
                  <img src={region.icon || otherLangIcon} alt="" className="mis-region-pin-icon" />
                  <div className="mis-region-pin-label">{shortLabel}</div>
                </button>
              );
            })}

            {selectedRegion && selectedRegion.id !== 'other' && (
              <div
                className="mis-region-glow"
                style={{
                  top: selectedRegion.mapTop,
                  left: selectedRegion.mapLeft,
                }}
              />
            )}

            {selectedRegion && (
              <div
                style={{
                  position: 'absolute',
                  top: selectedRegion.mapTop,
                  left: selectedRegion.mapLeft,
                  transform: 'translate(-50%, -130%)',
                  zIndex: 10,
                  animation: 'housePop 0.45s ease-out',
                }}
              >
                <img
                  src={storyHouseIcon}
                  alt="Home"
                  style={{ width: 'clamp(34px, 5vw, 44px)', height: 'auto', display: 'block' }}
                />
              </div>
            )}

            <style>{`
              @keyframes housePop {
                0% { transform: translate(-50%, -120%) scale(0); }
                70% { transform: translate(-50%, -120%) scale(1.1); }
                100% { transform: translate(-50%, -120%) scale(1); }
              }
            `}</style>
          </div>

          <button
            className="mis-continue-btn-uniform mis-child-home-continue"
            onClick={() => {
              if (childHomeAdvanceRef.current || stateRef.current.homeChildConfirmed) return;
              playUiTap();
              childHomeAdvanceRef.current = true;
              sceneActions.checkpoint({ homeChildConfirmed: true, homeChildConfirmDone: false });
              playHomeChildConfirm();
            }}
            disabled={!isChildHomeContinueEnabled}
          >
            Continue {'\u2192'}
          </button>
        </div>
      )}
      {/* Language Ganesha Phase — 4 Language Guess Game */}
      {phase === STEPS.LANGUAGE_GANESHA && (
        <div className="mis-language-guess-phase" style={{ paddingTop: 'calc(var(--u) * 1.5)', paddingBottom: 'calc(var(--u) * 4)', minHeight: 'var(--app-height, 100vh)' }}>
          <AboutMeGaneshaHost image={babyGaneshaImg} className="about-me-ganesha-host--left-middle" />

          {/* Play Button Section */}
          <div className="mis-language-play-wrap" style={{ textAlign: 'center', marginTop: 'calc(var(--u) * 2)', marginBottom: 'calc(var(--u) * 0.5)' }}>
            <button
              key={`play-btn-${playPulseKey}`}
              onClick={replayLanguageAudio}
              className="mis-language-replay-btn"
              style={{
                width: 'calc(var(--u) * 17)',
                height: 'calc(var(--u) * 17)',
                borderRadius: '50%',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none',
                transition: 'all 0.2s',
                margin: '0 auto',
                animation: !hasPressedLanguagePlay && langGuessPhase !== 'correct' ? 'pulse 1.5s ease-in-out 2' : 'none',
                opacity: 1,
              }}
            >
              <img src={playLangIcon} alt="Play" style={{ width: '50%', height: '50%', objectFit: 'contain' }} />
            </button>
          </div>

          {/* Language Cards Grid — 2x2 (Hidden until mantra finishes) */}
          {showLanguageCards && (
          <div className="mis-language-guess-grid" style={{
            maxWidth: 'calc(var(--u) * 66)',
            margin: 'calc(var(--u) * 1) auto 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'calc(var(--u) * 2.4)',
            padding: '0 calc(var(--u) * 1.5)',
            marginBottom: 'calc(var(--u) * 2)',
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
                className={`card ${isSelected ? 'selected' : ''} ${wrongLangGuesses.has(lang.id) ? 'lang-attempted' : ''} ${shakeLang === lang.id ? 'wrong' : ''} ${langGuessIdleLevel >= 2 && lang.id === 'sanskrit' ? 'hint-final hint-final--settle' : ''}`}
                onClick={() => {
                  if (!hasPressedLanguagePlay) {
                    playUiTap();
                    speakIfUnmuted(VOICE.language_play_first, { age: childAge, moment: 'default' });
                    return;
                  }
                  handleLanguageGuess(lang);
                }}
                disabled={langGuessPhase === 'correct'}
                style={{
                  width: '100%',
                  minHeight: 'calc(var(--u) * 15)',
                  padding: 'calc(var(--u) * 1.6)',
                  border: 'none',
                  backgroundColor: '#F8F1E2',
                  cursor: langGuessPhase === 'correct' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'calc(var(--u) * 0.9)',
                  boxShadow: isSelected ? undefined : '0 6px 16px rgba(0, 0, 0, 0.16)',
                  transform: isSelected ? undefined : 'scale(1)',
                  position: 'relative',
                }}
              >
                <img src={lang.icon} alt={lang.label} style={{ width: 'calc(var(--u) * 6)', height: 'calc(var(--u) * 6)', objectFit: 'contain' }} />
                <div style={{
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: 'calc(var(--u) * 2.5)',
                  fontWeight: 700,
                  color: '#654321',
                }}>
                  {lang.label}
                </div>
                <div style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 'calc(var(--u) * 1.8)',
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
        <div className="mis-language-child-phase" style={{
          paddingTop: 'calc(var(--u) * 5.5)',
          paddingBottom: 'calc(var(--u) * 20)',
          minHeight: 'var(--app-height, 100vh)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {selectedLanguages.length > 0 && (
            <StoryProgressHeader discoveries={selectedLanguages.map(lang => ({ ...lang, image: lang.icon, name: lang.label }))} isChildMode={false} />
          )}
          <div className="mis-language-child-panel" style={{ width: '100%', maxWidth: 'calc(var(--u) * 70)', margin: '0 auto', padding: '0 20px', position: 'relative' }}>
            {/* Most Spoken At Home */}
            <div style={{ marginBottom: 'calc(var(--u) * 1.2)' }}>
              <h3 style={LANG_HEADING_STYLE}>
                Most Spoken At Home
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'calc(var(--u) * 1.6)', marginBottom: 'calc(var(--u) * 1.6)' }}>
                {['hindi', 'english', 'tamil', 'marathi'].map((id) => LANGUAGE_MAP[id]).filter(Boolean).map((lang) => (
                  <LangCard
                    key={lang.id}
                    lang={lang}
                    isSelected={selectedLanguages.some(l => l.id === lang.id)}
                    isSwappingOut={swappingOutLangId === lang.id}
                    onToggle={toggleLanguage}
                  />
                ))}
              </div>
            </div>

            {/* More Languages */}
            <div>
              <h3 style={LANG_HEADING_STYLE}>
                More Languages
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'calc(var(--u) * 1.6)', marginBottom: 'calc(var(--u) * 1)' }}>
                {['gujarati', 'bengali', 'kannada', 'malayalam', 'punjabi', 'telugu', 'sanskrit', 'other'].map((id) => LANGUAGE_MAP[id]).filter(Boolean).map((lang) => (
                  <LangCard
                    key={lang.id}
                    lang={lang}
                    isSelected={selectedLanguages.some(l => l.id === lang.id)}
                    isSwappingOut={swappingOutLangId === lang.id}
                    onToggle={toggleLanguage}
                  />
                ))}
              </div>
            </div>

            {/* Selection Counter */}
            {selectedLanguages.length > 0 && (
              <div className="mis-language-child-count" style={{ textAlign: 'center', marginBottom: '10px', fontFamily: "'Nunito', sans-serif", fontSize: '14px', color: '#8B6914', fontWeight: 600 }}>
                Pick up to 3 languages. {selectedLanguages.length} of 3 selected
              </div>
            )}

            {/* Continue Button */}
            {selectedLanguages.length > 0 && (
              <button
                className="mis-continue-btn-uniform mis-language-child-continue"
                onClick={() => {
                  if (stateRef.current.langChildConfirmed) return; // a second tap must not start a second line
                  playUiTap();
                  sceneActions.checkpoint({ langChildConfirmed: true, langChildConfirmDone: false });
                  playLangChildConfirm();
                }}
                style={{
                  display: 'block',
                  margin: '18px auto 0',
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
        <div className="mis-festivals-ganesha-phase" style={{
          minHeight: 'var(--app-height, 100vh)',
          paddingTop: 'calc(var(--u) * 2.5)',
          paddingBottom: 'calc(var(--u) * 3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <AboutMeGaneshaHost image={babyGaneshaImg} className="about-me-ganesha-host--left-middle" />

          {/* Festival Cards Container — Flexbox for proper centering */}
          <div style={{
            marginTop: 'calc(var(--u) * 3)',
            marginBottom: 'calc(var(--u) * 2)',
          }}>
            {/* TOP ROW: 2 cards centered */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'calc(var(--u) * 2.5)',
              marginBottom: 'calc(var(--u) * 2.5)',
              flexWrap: 'wrap',
            }}>
              <button
                key="pongal"
                className={`card mis-fest-guess-card ${shakeGuess === 'pongal' ? 'wrong' : ''}`}
                onClick={() => {
                  handleFestivalGuess(FESTIVAL_MAP['pongal']);
                }}
                disabled={guessPhase === 'correct'}
                style={{
                  border: 'none',
                  backgroundColor: '#F8F1E2',
                  cursor: guessPhase === 'correct' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  opacity: 1,
                }}
              >
                <img src={pongalIcon} alt="Pongal" style={{ width: '68%', height: '68%', objectFit: 'contain' }} />
                <span className="mis-fest-guess-label">Pongal</span>
              </button>
              <button
                key="holi"
                className={`card mis-fest-guess-card ${shakeGuess === 'holi' ? 'wrong' : ''}`}
                onClick={() => {
                  handleFestivalGuess(FESTIVAL_MAP['holi']);
                }}
                disabled={guessPhase === 'correct'}
                style={{
                  border: 'none',
                  backgroundColor: '#F8F1E2',
                  cursor: guessPhase === 'correct' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  opacity: 1,
                }}
              >
                <img src={holiIcon} alt="Holi" style={{ width: '68%', height: '68%', objectFit: 'contain' }} />
                <span className="mis-fest-guess-label">Holi</span>
              </button>
            </div>

            {/* BOTTOM ROW: 3 cards centered */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'calc(var(--u) * 2.5)',
              flexWrap: 'wrap',
            }}>
              <button
                key="janmashtami"
                className={`card mis-fest-guess-card ${shakeGuess === 'janmashtami' ? 'wrong' : ''}`}
                onClick={() => {
                  handleFestivalGuess(FESTIVAL_MAP['janmashtami']);
                }}
                disabled={guessPhase === 'correct'}
                style={{
                  border: 'none',
                  backgroundColor: '#F8F1E2',
                  cursor: guessPhase === 'correct' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  opacity: 1,
                }}
              >
                <img src={janmashtamiIcon} alt="Janmashtami" style={{ width: '68%', height: '68%', objectFit: 'contain' }} />
                <span className="mis-fest-guess-label">Janmashtami</span>
              </button>
              <button
                key="ganesh"
                className={`card mis-fest-guess-card ${guessPhase === 'correct' ? 'selected' : ''} ${festGuessIdleLevel >= 2 ? 'hint-final hint-final--settle' : ''}`}
                onClick={() => {
                  handleFestivalGuess(FESTIVAL_MAP['ganesh']);
                }}
                disabled={guessPhase === 'correct'}
                style={{
                  border: 'none',
                  backgroundColor: '#F8F1E2',
                  cursor: guessPhase === 'correct' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: guessPhase === 'correct' ? undefined : '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transform: guessPhase === 'correct' ? undefined : 'scale(1)',
                  opacity: 1,
                  animation: guessPhase === 'correct' ? 'none' : undefined,
                }}
              >
                <img src={modakImage} alt="Ganesh Chaturthi - Modak" style={{ width: '68%', height: '68%', objectFit: 'contain' }} />
                <span className="mis-fest-guess-label">Ganesh Chaturthi</span>
              </button>
              <button
                key="diwali"
                className={`card mis-fest-guess-card ${shakeGuess === 'diwali' ? 'wrong' : ''}`}
                onClick={() => {
                  handleFestivalGuess(FESTIVAL_MAP['diwali']);
                }}
                disabled={guessPhase === 'correct'}
                style={{
                  border: 'none',
                  backgroundColor: '#F8F1E2',
                  cursor: guessPhase === 'correct' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  opacity: 1,
                }}
              >
                <img src={diwaliIcon} alt="Diwali" style={{ width: '68%', height: '68%', objectFit: 'contain' }} />
                <span className="mis-fest-guess-label">Diwali</span>
              </button>
            </div>
          </div>

          {/* Correct Celebration Sparkle */}
          {guessPhase === 'correct' && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1500, pointerEvents: 'none' }}>
              <AboutMeSparkle key={sparkleState.key} preset="linger" />
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
        <div className="mis-festival-child-phase" style={{
          minHeight: 'var(--app-height, 100vh)',
          paddingTop: 'calc(var(--u) * 5.5)',
          paddingBottom: 'calc(var(--u) * 15.5)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <StoryProgressHeader discoveries={selectedFestivals.map(fest => ({ ...fest, image: fest.icon, name: fest.label }))} isChildMode={false} />

          <div className="mis-festival-child-panel" style={{ width: '100%', maxWidth: 'calc(var(--u) * 70)', margin: '0 auto', padding: '0 20px' }}>
            {/* COMMON FESTIVALS (Top Row - 4 cards) */}
            <div style={{ marginBottom: 'calc(var(--u) * 1.2)' }}>
              <h3 className="mis-festival-section-title" style={FEST_HEADING_STYLE}>
                Most Common Festivals
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 'calc(var(--u) * 1.6)',
                marginBottom: 'calc(var(--u) * 1.6)',
              }}>
                {COMMON_FESTIVALS.filter(Boolean).map((fest) => (
                  <FestCard
                    key={fest.id}
                    fest={fest}
                    isSelected={selectedFestivals.some(f => f.id === fest.id)}
                    isSwappingOut={swappingOutFestId === fest.id}
                    onToggle={toggleFestival}
                  />
                ))}
              </div>
            </div>

            {/* OTHER FESTIVALS (Bottom Grid - 8 cards in 4x2) */}
            <div>
              <h3 className="mis-festival-section-title" style={FEST_HEADING_STYLE}>
                More Festivals
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 'calc(var(--u) * 1.6)',
                marginBottom: 'calc(var(--u) * 1)',
              }}>
                {OTHER_FESTIVALS.filter(Boolean).map((fest) => (
                  <FestCard
                    key={fest.id}
                    fest={fest}
                    isSelected={selectedFestivals.some(f => f.id === fest.id)}
                    isSwappingOut={swappingOutFestId === fest.id}
                    onToggle={toggleFestival}
                  />
                ))}
              </div>
            </div>

            {/* Selection Count */}
            {selectedFestivals.length > 0 && (
              <div style={{
                textAlign: 'center',
                marginBottom: '10px',
                fontFamily: "'Nunito', sans-serif",
                fontSize: '14px',
                color: '#8B6914',
                fontWeight: 600,
              }} className="mis-festival-child-count">
                Pick up to 4 festivals. {selectedFestivals.length} of 4 selected
              </div>
            )}

            {/* Continue Button */}
            {selectedFestivals.length > 0 && (
              <button
                className="mis-continue-btn-uniform mis-festival-child-continue"
                onClick={() => {
                  if (stateRef.current.festChildConfirmed) return;
                  playUiTap();
                  sceneActions.checkpoint({ festChildConfirmed: true, festChildConfirmDone: false });
                  playFestChildConfirm();
                }}
              >
                See Our Story
              </button>
            )}
          </div>
        </div>
      )}

      {/* Origin Card Phase */}
      {phase === STEPS.ORIGIN_CARD && phase !== STEPS.COMPLETE && (
        <AboutMeComparisonCard
          className="aboutme-comparison--story-connect"
          title="My Indian Story"
          subtitle="There are many ways to feel connected to India."
          onContinue={() => {
            playUiTap();
            playChime();
            handleComplete();
          }}
          leftColumn={{
            header: (
              <div className="aboutme-comparison-avatar is-plain">
                <img src={babyGaneshaImg} alt="Ganesha" />
              </div>
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
              <div className={`aboutme-comparison-avatar${(activeProfile?.icon || activeProfile?.profileIcon || profileAvatarImage) ? '' : ' is-fallback'}`}>
                {activeProfile?.icon ? (
                  <img src={activeProfile.icon} alt="Profile" />
                ) : activeProfile?.profileIcon ? (
                  <img src={activeProfile.profileIcon} alt="Profile" />
                ) : profileAvatarImage ? (
                  <img src={profileAvatarImage} alt={profileDisplayName} />
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
                  <div style={{ display: 'flex', gap: 'calc(var(--u) * 3.5)', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                    {selectedLanguages.map(lang => (
                      <div key={lang.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'calc(var(--u) * 0.5)' }}>
                        <img src={lang?.icon} alt={lang?.label} style={{ width: 'calc(var(--u) * 5)', height: 'calc(var(--u) * 5)', objectFit: 'contain' }} />
                        <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 'max(13px, calc(var(--u) * 1.6))', fontWeight: 700, color: '#3e2723', textAlign: 'center' }}>{lang?.label}</div>
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
                  <div style={{ display: 'flex', gap: 'calc(var(--u) * 1.8)', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                    {selectedFestivals.map(fest => (
                      <div key={fest.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'calc(var(--u) * 0.5)' }}>
                        <img src={fest?.icon} alt={fest?.label} style={{ width: 'calc(var(--u) * 3.6)', height: 'calc(var(--u) * 3.6)', objectFit: 'contain' }} />
                        <div style={{ fontFamily: "'Baloo 2', cursive", fontSize: 'max(12px, calc(var(--u) * 1.4))', fontWeight: 700, color: '#3e2723', textAlign: 'center', whiteSpace: 'nowrap' }}>{fest?.label}</div>
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
