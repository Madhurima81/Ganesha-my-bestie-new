// VakratundaGroveScene.jsx — Scene 10
// Shloka River Zone 3
// Two-part chanting: child's voice blooms lotus (Vakratunda) + grows banyan (Mahakaya)

import React, { useState, useEffect, useRef } from 'react';
import BackToMapButton from '../../../../lib/components/navigation/BackToMapButton';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import OpeningModal from '../../../shared/components/OpeningModal';
import SyllableVoiceChallenge from '../../core/SyllableVoiceChallenge';

import elephantImg      from './assets/images/elephant.svg';
import lotusBud         from './assets/images/lotus-bud.svg';
import lotusHalf        from './assets/images/lotus-half-bloom.svg';
import lotusFull        from './assets/images/lotus-full-bloom.svg';
import banyanSprout     from './assets/images/banyan-sprout.svg';
import banyanSapling    from './assets/images/banyan-sapling.svg';
import banyanHalf       from './assets/images/banyan-half.svg';
import banyanFull       from './assets/images/banyan-full.svg';
import riverBg          from './assets/images/vakratundachant-bg-new2.svg';

import './VakratundaGroveSimplified.css';

// ── Config ─────────────────────────────────────────────────────────────────
const PARTS = {
  vakratunda: [
    { syllable: 'vakra',      label: 'वक्र',     audio: '/audio/shloka/vakra.mp3',      activeElephant: 1 },
    { syllable: 'tunda',      label: 'तुण्ड',     audio: '/audio/shloka/tunda.mp3',      activeElephant: 2 },
    { syllable: 'vakratunda', label: 'वक्रतुण्ड',  audio: '/audio/shloka/vakratunda.mp3', activeElephant: 'both' },
  ],
  mahakaya: [
    { syllable: 'maha',     label: 'महा',    audio: '/audio/shloka/maha.mp3',     activeElephant: 1 },
    { syllable: 'kaya',     label: 'काय',    audio: '/audio/shloka/kaya.mp3',     activeElephant: 2 },
    { syllable: 'mahakaya', label: 'महाकाय', audio: '/audio/shloka/mahakaya.mp3', activeElephant: 'both' },
  ],
};

// lotusState  0=bud  1=half  2=full  3=full+glow
const LOTUS_IMAGES  = [lotusBud, lotusHalf, lotusFull, lotusFull];
// banyanState 0=sprout 1=sapling 2=half 3=full
const BANYAN_IMAGES = [banyanSprout, banyanSapling, banyanHalf, banyanFull];

const IDLE_HINTS = {
  vakratunda: [
    'Tap the lotus to begin.',
    'Tap the lotus again.',
    'One final tap on the lotus.',
  ],
  mahakaya: [
    'Tap the little sapling.',
    'Tap the growing tree.',
    'One more tap to make it mighty.',
  ],
};

// ── Component ──────────────────────────────────────────────────────────────
const VakratundaGroveScene = ({
  onComplete,
  onNavigate,
  zoneId  = 'shloka-river',
  sceneId = 'vakratunda-grove',
}) => {
  // ── State ─────────────────────────────────────────────────────────────────
  const [part, setPart]                     = useState('vakratunda');
  const [step, setStep]                     = useState(0);
  const [lotusState, setLotusState]         = useState(0);
  const [banyanState, setBanyanState]       = useState(0);
  const [wordFragments, setWordFragments]   = useState([]);
  const [wordMerged, setWordMerged]         = useState(false);

  // elephant visual states
  const [el1State, setEl1State]             = useState('neutral'); // neutral | encourage | celebrate
  const [el2State, setEl2State]             = useState('neutral');

  // interaction phase flags
  const [awaitingTap, setAwaitingTap]       = useState(false);   // lotus/sapling tap
  const [activeElephant, setActiveElephant] = useState(null);    // 1 | 2 | 'both' | null
  const [awaitingElTap, setAwaitingElTap]   = useState(false);   // elephant tap
  const [svcActive, setSvcActive]           = useState(false);
  const [svcElephant, setSvcElephant]       = useState(null);    // 1 | 2

  // UI
  const [showModal, setShowModal]           = useState('opening');
  const [tapGlow, setTapGlow]               = useState(false);
  const [isMuted, setIsMuted]               = useState(false);
  const [isComplete, setIsComplete]         = useState(false);

  const audioRef   = useRef(null);
  const voRef      = useRef(window.speechSynthesis);
  const idleT1     = useRef(null);
  const idleT2     = useRef(null);

  // ── Audio ─────────────────────────────────────────────────────────────────
  const playAudio = (src) => {
    if (isMuted) return;
    try {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      const a = new Audio(src);
      audioRef.current = a;
      a.play().catch(() => {});
    } catch {}
  };

  const stopAllAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (voRef.current) voRef.current.cancel();
  };

  const replayAudio = () => {
    const cfg = PARTS[part]?.[step];
    if (cfg) playAudio(cfg.audio);
  };

  const playVO = (text) => {
    if (isMuted || !voRef.current) return;
    voRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88; u.pitch = 1.0;
    voRef.current.speak(u);
  };

  useEffect(() => () => stopAllAudio(), []);

  // ── Idle hints ─────────────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(idleT1.current);
    clearTimeout(idleT2.current);
    setTapGlow(false);
    if (!awaitingTap) return;

    const hint = IDLE_HINTS[part]?.[step];
    if (!hint) return;

    idleT1.current = setTimeout(() => playVO(hint), 13000);
    idleT2.current = setTimeout(() => setTapGlow(true), 19000);

    return () => { clearTimeout(idleT1.current); clearTimeout(idleT2.current); };
  }, [awaitingTap, part, step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Plant tap ─────────────────────────────────────────────────────────────
  const handlePlantTap = () => {
    if (!awaitingTap || svcActive) return;
    clearTimeout(idleT1.current); clearTimeout(idleT2.current);
    setTapGlow(false);
    setAwaitingTap(false);

    const cfg = PARTS[part][step];

    // Elephant trunk-dip animation
    if (cfg.activeElephant === 1 || cfg.activeElephant === 'both') setEl1State('encourage');
    if (cfg.activeElephant === 2 || cfg.activeElephant === 'both') setEl2State('encourage');

    playAudio(cfg.audio);

    // After audio (~1.5s), show speech bubble
    setTimeout(() => {
      setEl1State('neutral');
      setEl2State('neutral');
      setActiveElephant(cfg.activeElephant);
      setAwaitingElTap(true);
    }, 1600);
  };

  // ── Elephant tap (opens SVC inline) ───────────────────────────────────────
  const handleElephantTap = (num) => {
    if (!awaitingElTap) return;
    const cfg = PARTS[part][step];
    const relevant = cfg.activeElephant === num || cfg.activeElephant === 'both';
    if (!relevant) return;

    setAwaitingElTap(false);
    setSvcElephant(num);
    setSvcActive(true);
    stopAllAudio();
  };

  // ── SVC complete ──────────────────────────────────────────────────────────
  const handleSvcComplete = () => {
    setSvcActive(false);
    setSvcElephant(null);
    setActiveElephant(null);
    setAwaitingElTap(false);

    const cfg = PARTS[part][step];

    // Celebrate
    if (cfg.activeElephant === 1 || cfg.activeElephant === 'both') setEl1State('celebrate');
    if (cfg.activeElephant === 2 || cfg.activeElephant === 'both') setEl2State('celebrate');
    setTimeout(() => { setEl1State('neutral'); setEl2State('neutral'); }, 2200);

    // Advance state
    if (part === 'vakratunda') {
      if (step === 0) {
        setWordFragments(['वक्र']);
        setLotusState(1);
        setTimeout(() => { setStep(1); setAwaitingTap(true); }, 900);
      } else if (step === 1) {
        setWordFragments(['वक्र', 'तुण्ड']);
        setLotusState(2);
        setTimeout(() => { setStep(2); setAwaitingTap(true); }, 900);
      } else {
        setWordMerged(true);
        setLotusState(3);
        setTimeout(() => playVO('Vakratunda — the curved trunk. I am flexible, like water.'), 700);
        setTimeout(() => setShowModal('transition'), 2200);
      }
    } else {
      if (step === 0) {
        setWordFragments(['महा']);
        setBanyanState(1);
        setTimeout(() => { setStep(1); setAwaitingTap(true); }, 900);
      } else if (step === 1) {
        setWordFragments(['महा', 'काय']);
        setBanyanState(2);
        setTimeout(() => { setStep(2); setAwaitingTap(true); }, 900);
      } else {
        setWordMerged(true);
        setBanyanState(3);
        setTimeout(() => playVO('Mahakaya — the great body. I am strong, like the banyan tree.'), 700);
        setTimeout(() => setIsComplete(true), 2800);
      }
    }
  };

  // ── Start Mahakaya ────────────────────────────────────────────────────────
  const startMahakaya = () => {
    setShowModal(null);
    setPart('mahakaya');
    setStep(0);
    setWordFragments([]);
    setWordMerged(false);
    setBanyanState(0);
    setEl1State('neutral');
    setEl2State('neutral');
    setAwaitingTap(true);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const plantImg = part === 'vakratunda'
    ? LOTUS_IMAGES[Math.min(lotusState, 3)]
    : BANYAN_IMAGES[Math.min(banyanState, 3)];

  const isFullyBloomed = (part === 'vakratunda' && lotusState === 3) ||
                         (part === 'mahakaya'    && banyanState === 3);

  // which elephants show a speech bubble
  const showBubble1 = awaitingElTap
    ? (activeElephant === 1 || activeElephant === 'both')
    : (svcActive && svcElephant === 1);

  const showBubble2 = awaitingElTap
    ? (activeElephant === 2 || activeElephant === 'both')
    : (svcActive && svcElephant === 2);

  const currentLabel = PARTS[part][step]?.label ?? '';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="grove-scene"
      style={{ backgroundImage: `url(${riverBg})` }}
    >
      {/* Top bar */}
      <div className="grove-topbar">
        <BackToMapButton onNavigate={onNavigate} />
        <button
          className="grove-mute-btn"
          onClick={() => setIsMuted(m => !m)}
          aria-label="Toggle sound"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Word stage — top centre */}
      {wordFragments.length > 0 && (
        <div className="grove-word-stage">
          {wordMerged ? (
            <span className="grove-fragment grove-fragment--merged">
              {part === 'vakratunda' ? 'वक्रतुण्ड' : 'महाकाय'}
            </span>
          ) : (
            wordFragments.map((f, i) => (
              <span key={i} className="grove-fragment grove-fragment--float">{f}</span>
            ))
          )}
        </div>
      )}

      {/* Main stage */}
      <div className="grove-stage">

        {/* Elephant 1 — left */}
        <div className="grove-elephant grove-elephant--left">
          {showBubble1 && (
            <div className="grove-speech-bubble grove-speech-bubble--left">
              {svcActive && svcElephant === 1 ? (
                <SyllableVoiceChallenge
                  syllable={PARTS[part][step].syllable}
                  displayLabel={PARTS[part][step].label}
                  onComplete={handleSvcComplete}
                  replayAudio={replayAudio}
                  stopAudio={stopAllAudio}
                  inline={true}
                />
              ) : (
                <span className="grove-bubble-text">Say {currentLabel}! 🎤</span>
              )}
            </div>
          )}
          <img
            src={elephantImg}
            alt="Elephant 1"
            className={`grove-elephant-img grove-elephant-img--${el1State}`}
            style={{ minWidth: 80, minHeight: 80 }}
            onClick={() => handleElephantTap(1)}
            draggable={false}
          />
        </div>

        {/* Centre — lotus or banyan */}
        <div className="grove-plant-area">
          <img
            src={plantImg}
            alt={part === 'vakratunda' ? 'Lotus' : 'Banyan tree'}
            className={[
              'grove-plant',
              awaitingTap  ? 'grove-plant--tappable' : '',
              tapGlow      ? 'grove-plant--glow'     : '',
              isFullyBloomed ? 'grove-plant--bloomed' : '',
            ].join(' ')}
            style={{ minWidth: 80, minHeight: 80 }}
            onClick={handlePlantTap}
            draggable={false}
          />
        </div>

        {/* Elephant 2 — right, mirrored */}
        <div className="grove-elephant grove-elephant--right">
          {showBubble2 && (
            <div className="grove-speech-bubble grove-speech-bubble--right">
              {svcActive && svcElephant === 2 ? (
                <SyllableVoiceChallenge
                  syllable={PARTS[part][step].syllable}
                  displayLabel={PARTS[part][step].label}
                  onComplete={handleSvcComplete}
                  replayAudio={replayAudio}
                  stopAudio={stopAllAudio}
                  inline={true}
                />
              ) : (
                <span className="grove-bubble-text">Say {currentLabel}! 🎤</span>
              )}
            </div>
          )}
          <img
            src={elephantImg}
            alt="Elephant 2"
            className={`grove-elephant-img grove-elephant-img--${el2State} grove-elephant-img--mirror`}
            style={{ minWidth: 80, minHeight: 80 }}
            onClick={() => handleElephantTap(2)}
            draggable={false}
          />
        </div>

      </div>{/* grove-stage */}

      {/* River */}
      <div className="grove-river">
        <div className="grove-river-wave" />
        <div className="grove-river-wave grove-river-wave--2" />
      </div>

      {/* Opening modal */}
      {showModal === 'opening' && (
        <OpeningModal
          zoneId={zoneId}
          sceneId={sceneId}
          onStart={() => { setShowModal(null); setAwaitingTap(true); }}
          showButton={true}
        />
      )}

      {/* Transition modal */}
      {showModal === 'transition' && (
        <div className="grove-overlay">
          <div className="grove-modal">
            <div className="grove-modal-title">Vakratunda! 🌸</div>
            <p className="grove-modal-desc">
              The lotus bloomed with your voice.<br />
              Now grow something even mightier.
            </p>
            <button className="grove-modal-btn" onClick={startMahakaya}>
              Grow the Banyan
            </button>
          </div>
        </div>
      )}

      {/* Completion */}
      {isComplete && (
        <SceneCompletionCelebration
          show={true}
          sceneName="Vakratunda Grove"
          sceneNumber={10}
          totalScenes={22}
          starsEarned={2}
          totalStars={2}
          discoveredSymbols={['vakratunda', 'mahakaya']}
          nextSceneName="Suryakoti Bank"
          sceneId={sceneId}
          completionData={{ stars: 2, completed: true }}
          onComplete={onComplete}
          onReplay={() => {
            setIsComplete(false);
            setPart('vakratunda'); setStep(0);
            setLotusState(0); setBanyanState(0);
            setWordFragments([]); setWordMerged(false);
            setEl1State('neutral'); setEl2State('neutral');
            setShowModal('opening');
            setAwaitingTap(false);
          }}
          onContinue={() => onNavigate?.('scene-complete-continue')}
        />
      )}
    </div>
  );
};

export default VakratundaGroveScene;
