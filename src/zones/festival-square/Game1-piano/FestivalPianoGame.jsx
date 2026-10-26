import React, { useCallback, useEffect, useRef, useState } from 'react';
import './FestivalPianoGame.css';
import OpeningModal from '../../shared/components/OpeningModal.jsx';
import SceneManager from '../../../lib/components/scenes/SceneManager';
import SceneCompletionCelebration from '../../../lib/components/celebration/SceneCompletionCelebration';
import GamePauseMenu from '../components/GamePauseMenu';
import ZoneBadgeButton from '../../../lib/components/navigation/ZoneBadgeButton';
import GameLayout from '../../../lib/components/layout/GameLayout';
import ganeshaGameScene from './assets/images/ganesha-musician.png';
import listenIcon from '../assets/images/icons/listen-icon.png';
import playIcon from '../assets/images/icons/play-icon.png';
import createIcon from '../assets/images/icons/create-icon.png';
import { getCompletionModal } from '../../../lib/config/content';

// Mapping C–G to Sa–Pa assumes Sa=C. These are pitched keys, NOT five sampled instruments.
const KEYS = [
  { id: 'bells',     sargam: 'Sa', western: 'C', hz: 261.63, color: '#4169E1' },
  { id: 'cymbals',   sargam: 'Re', western: 'D', hz: 293.66, color: '#D8AF24' },
  { id: 'shehnai',   sargam: 'Ga', western: 'E', hz: 329.63, color: '#E8862E' },
  { id: 'dhol',      sargam: 'Ma', western: 'F', hz: 349.23, color: '#CC5050' },
  { id: 'drum',      sargam: 'Pa', western: 'G', hz: 392.00, color: '#3FA36C' }
];

// TEMPORARY DEMO PATTERN copied from the old code. This is NOT verified Jai Ganesh Deva notation.
// Replace 'phrases' with musically valid, manually chosen phrases after melody + vocal approval.
// Keep future vocal assets separate from the instant-feedback key synthesizer.
const SONG = {
  id: 'jai-ganesh-aarti',
  name: 'Jai Ganesh Deva',
  phrases: [
    ['bells', 'cymbals', 'shehnai'],
    ['bells', 'cymbals', 'shehnai'],
    ['shehnai', 'cymbals', 'bells']
  ]
};
const NOTE_MS = 600;
const DEMO_NOTE_MS = 380;

function FestivalPianoContent({ sceneState, sceneActions, onComplete, onNavigate, zoneId, sceneId }) {
  const [screen, setScreen] = useState('intro'); // intro | modes | free | challenge
  const [paused, setPaused] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [misses, setMisses] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isHearingTune, setIsHearingTune] = useState(false);
  const [freeRecording, setFreeRecording] = useState(false);
  const [freeNotes, setFreeNotes] = useState([]);
  const [freePlaying, setFreePlaying] = useState(false);
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);

  const audioRef = useRef(null);
  const oscillatorsRef = useRef(new Set());
  const timersRef = useRef(new Set());
  const hintTimersRef = useRef(new Set());
  const playbackToken = useRef(0);
  const freeStartRef = useRef(0);
  const pausedRef = useRef(false);
  const demoRef = useRef(false);
  const screenRef = useRef(screen);
  const phraseRef = useRef(0);
  const stepRef = useRef(0);
  const songNotesRef = useRef([]);
  const freePlayingRef = useRef(false);
  const completedRef = useRef(false);

  useEffect(() => { screenRef.current = screen; }, [screen]);
  useEffect(() => { phraseRef.current = phraseIndex; }, [phraseIndex]);
  useEffect(() => { stepRef.current = stepIndex; }, [stepIndex]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { demoRef.current = isDemo; }, [isDemo]);

  const schedule = useCallback((fn, ms, hint = false) => {
    const bucket = hint ? hintTimersRef.current : timersRef.current;
    const id = setTimeout(() => { bucket.delete(id); fn(); }, ms);
    bucket.add(id);
    return id;
  }, []);
  const clearTimers = useCallback((bucket) => {
    bucket.current.forEach(clearTimeout);
    bucket.current.clear();
  }, []);
  const stopNotes = useCallback(() => {
    oscillatorsRef.current.forEach(osc => { try { osc.stop(); } catch (_) {} });
    oscillatorsRef.current.clear();
    setActiveKey(null);
  }, []);
  const stopPlayback = useCallback(() => {
    playbackToken.current += 1;
    clearTimers(timersRef);
    clearTimers(hintTimersRef);
    stopNotes();
    demoRef.current = false;
    freePlayingRef.current = false;
    setIsDemo(false);
    setIsHearingTune(false);
    setFreePlaying(false);
  }, [clearTimers, stopNotes]);
  useEffect(() => () => {
    playbackToken.current += 1;
    timersRef.current.forEach(clearTimeout);
    hintTimersRef.current.forEach(clearTimeout);
    oscillatorsRef.current.forEach(osc => { try { osc.stop(); } catch (_) {} });
    if (audioRef.current) audioRef.current.close().catch(() => {});
  }, []);

  const playNote = useCallback((key, duration = .34) => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioRef.current) audioRef.current = new Ctx();
      const ctx = audioRef.current;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      const t = ctx.currentTime;
      [1, 2, 3].forEach((multiple, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = key.hz * multiple;
        gain.gain.setValueAtTime(.0001, t);
        gain.gain.exponentialRampToValueAtTime([.17, .035, .012][i], t + .018);
        gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
        osc.connect(gain); gain.connect(ctx.destination);
        oscillatorsRef.current.add(osc);
        osc.onended = () => oscillatorsRef.current.delete(osc);
        osc.start(t); osc.stop(t + duration + .01);
      });
    } catch (error) { console.warn('Piano audio unavailable', error); }
  }, []);

  const playSequence = useCallback((ids, { after, preserveHints = false } = {}) => {
    // Cancel scheduled notes, not the child's completed challenge progress.
    playbackToken.current += 1;
    const token = playbackToken.current;
    clearTimers(timersRef);
    if (!preserveHints) clearTimers(hintTimersRef);
    stopNotes();
    ids.forEach((id, index) => schedule(() => {
      if (token !== playbackToken.current || pausedRef.current) return;
      const key = KEYS.find(k => k.id === id);
      if (!key) return;
      playNote(key, DEMO_NOTE_MS / 1000);
      setActiveKey(id);
      schedule(() => { if (token === playbackToken.current) setActiveKey(null); }, DEMO_NOTE_MS);
    }, index * NOTE_MS));
    schedule(() => {
      if (token === playbackToken.current && !pausedRef.current) after?.();
    }, ids.length * NOTE_MS + 200);
  }, [clearTimers, schedule, stopNotes, playNote]);

  const armHints = useCallback((index) => {
    clearTimers(hintTimersRef);
    setHintLevel(0);
    schedule(() => {
      if (!pausedRef.current && screenRef.current === 'challenge' && !demoRef.current) setHintLevel(1);
    }, 10000, true);
    schedule(() => {
      if (pausedRef.current || screenRef.current !== 'challenge' || demoRef.current) return;
      setHintLevel(2);
      demoRef.current = true;
      setIsDemo(true);
      playSequence(SONG.phrases[index], {
        preserveHints: true,
        after: () => { demoRef.current = false; setIsDemo(false); }
      });
    }, 18000, true);
    schedule(() => {
      if (!pausedRef.current && screenRef.current === 'challenge') setHintLevel(3);
    }, 26000, true);
  }, [clearTimers, schedule, playSequence]);

  const startPhrase = useCallback((index, keepStep = false) => {
    if (pausedRef.current) return;
    clearTimers(hintTimersRef);
    demoRef.current = true;
    setIsDemo(true);
    setHintLevel(0);
    if (!keepStep) { stepRef.current = 0; setStepIndex(0); }
    playSequence(SONG.phrases[index], {
      after: () => {
        demoRef.current = false;
        setIsDemo(false);
        armHints(index);
      }
    });
  }, [armHints, clearTimers, playSequence]);

  const startChallenge = () => {
    stopPlayback();
    screenRef.current = 'challenge';
    setScreen('challenge');
    phraseRef.current = 0; stepRef.current = 0;
    setPhraseIndex(0); setStepIndex(0); setMisses(0);
    completedRef.current = false; setIsComplete(false);
    songNotesRef.current = [];
    schedule(() => startPhrase(0), 350);
  };
  const startFree = () => {
    stopPlayback();
    screenRef.current = 'free'; setScreen('free');
    setFreeRecording(false); setFreeNotes([]);
  };
  const returnToModes = () => {
    stopPlayback();
    setPaused(false); pausedRef.current = false;
    screenRef.current = 'modes'; setScreen('modes');
    setIsComplete(false); setShowSceneCompletion(false);
  };
  const pauseGame = () => {
    if (pausedRef.current) return;
    pausedRef.current = true;
    setPaused(true);
    stopPlayback();
    setFreeRecording(false);
  };
  const resumeGame = () => {
    pausedRef.current = false;
    setPaused(false);
    if (screenRef.current === 'challenge' && !completedRef.current) {
      // Recovery from pause restarts the short demonstration, preserving completed notes.
      schedule(() => startPhrase(phraseRef.current, true), 350);
    }
  };

  const onKey = (key) => {
    if (pausedRef.current || isDemo || isHearingTune || freePlaying || isComplete || showSceneCompletion) return;
    if (screenRef.current === 'challenge') {
      const phrase = SONG.phrases[phraseRef.current];
      const expected = phrase?.[stepRef.current];
      if (!expected) return;
      playNote(key);
      setActiveKey(key.id);
      schedule(() => setActiveKey(null), 290);
      if (key.id !== expected) {
        const nextMiss = misses + 1;
        setMisses(nextMiss);
        if (nextMiss >= 2) {
          // No step reset: support the child by replaying the phrase.
          setMisses(0);
          startPhrase(phraseRef.current, true);
        }
        return;
      }
      setMisses(0);
      clearTimers(hintTimersRef);
      setHintLevel(0);
      songNotesRef.current.push(key.id);
      const nextStep = stepRef.current + 1;
      stepRef.current = nextStep;
      setStepIndex(nextStep);
      if (nextStep === phrase.length) {
        demoRef.current = true; setIsDemo(true); // block rapid taps during transition
        if (phraseRef.current === SONG.phrases.length - 1) {
          completedRef.current = true;
          schedule(() => { setIsDemo(false); setIsComplete(true); }, 650);
        } else {
          const nextPhrase = phraseRef.current + 1;
          phraseRef.current = nextPhrase; setPhraseIndex(nextPhrase);
          schedule(() => startPhrase(nextPhrase), 850);
        }
      } else {
        // The next correct key is not shown unless L3 is reached.
        armHints(phraseRef.current);
      }
    } else if (screenRef.current === 'free') {
      playNote(key);
      setActiveKey(key.id);
      schedule(() => setActiveKey(null), 280);
      if (freeRecording) {
        const now = performance.now();
        setFreeNotes(prev => [...prev, { id: key.id, at: now - freeStartRef.current }]);
      }
    }
  };

  const hearMyTune = (ids, withTiming = false) => {
    if (!ids.length || pausedRef.current) return;
    clearTimers(hintTimersRef);
    setIsHearingTune(screenRef.current === 'challenge');
    freePlayingRef.current = true; setFreePlaying(true);
    playbackToken.current += 1;
    const token = playbackToken.current;
    clearTimers(timersRef);
    stopNotes();
    const start = withTiming ? ids[0].at : 0;
    ids.forEach((note, i) => schedule(() => {
      if (token !== playbackToken.current || pausedRef.current) return;
      const id = withTiming ? note.id : note;
      const key = KEYS.find(k => k.id === id);
      if (!key) return;
      playNote(key);
      setActiveKey(id);
      schedule(() => { if (token === playbackToken.current) setActiveKey(null); }, 300);
    }, withTiming ? Math.min(30000, note.at - start) : i * NOTE_MS));
    const end = withTiming ? Math.min(30000, ids[ids.length - 1].at - start) : (ids.length - 1) * NOTE_MS;
    schedule(() => {
      if (token !== playbackToken.current) return;
      freePlayingRef.current = false; setFreePlaying(false); setIsHearingTune(false);
    }, end + 650);
  };

  const finishScene = () => {
    stopPlayback();
    sceneActions.updateState({ completed: true, phase: 'complete', stars: 0 });
    setShowSceneCompletion(true);
  };
  const completionContent = getCompletionModal('festival-square', 'game1');
  if (!sceneState) return <div className="festival-piano-game">Loading…</div>;
  if (screen === 'intro') return <>
    <div className="festival-piano-game" />
    <OpeningModal zoneId={zoneId} sceneId={sceneId} characterImg={ganeshaGameScene} showButton onStart={() => { screenRef.current = 'modes'; setScreen('modes'); }} />
  </>;
  if (screen === 'modes') return <div className="festival-piano-game fp-center">
    <h1>Make Music with Ganesha</h1>
    <div className="fp-modes">
      <button className="fp-mode" onClick={startFree}><span className="fp-mode-icon">♫</span><strong>Free Play</strong><small>Make your own music</small></button>
      <button className="fp-mode" onClick={startChallenge}><span className="fp-mode-icon">♪</span><strong>Play with Ganesha</strong><small>Listen and repeat</small></button>
    </div>
    <button className="fp-text-button" onClick={() => onNavigate?.('zone-welcome')}>Back to Festival Square</button>
  </div>;

  const phrase = SONG.phrases[phraseIndex] || [];
  const nextCorrect = phrase[stepIndex];
  return <GameLayout
    zoneId={zoneId}
    sceneState={sceneState}
    onHome={() => { stopPlayback(); onNavigate?.('home'); }}
    onReplay={() => { if (screen === 'challenge') startPhrase(phraseRef.current, true); else if (screen === 'free') { stopPlayback(); setFreeRecording(false); setFreeNotes([]); } }}
    showMenuLabel showPauseButton onPause={pauseGame}
  >
    <div className="festival-piano-game fp-play">
      <div className="fp-head">
        <img src={ganeshaGameScene} alt="Ganesha" className="fp-ganesha" />
        <div className="fp-head-copy">
          <h1>{screen === 'challenge' ? SONG.name : 'Make Your Music'}</h1>
          {screen === 'challenge' ? <>
            <p className="fp-status" aria-live="polite">{isDemo ? "Ganesha's turn — listen" : (hintLevel === 1 ? 'Remember the tune? Try a note!' : hintLevel >= 3 ? 'Try the glowing key' : 'Your turn!')}</p>
            <p className="fp-progress">Phrase {phraseIndex + 1} of {SONG.phrases.length}</p>
            <div className="fp-dots" aria-label={`${stepIndex} of ${phrase.length} notes completed`}>
              {phrase.map((_, i) => <span key={i} className={i < stepIndex ? 'done' : ''} />)}
            </div>
          </> : <p className="fp-status">Tap the keys to create a tune</p>}
        </div>
      </div>
      {screen === 'challenge' && !isComplete && <button
        className="fp-hear" disabled={isDemo || paused}
        onClick={() => startPhrase(phraseRef.current, true)}
      >Hear Again</button>}
      <div className="fp-keyboard" role="group" aria-label="Five musical keys">
        {KEYS.map(k => <button key={k.id} type="button"
          className={`fp-key ${activeKey === k.id ? 'active' : ''} ${screen === 'challenge' && !isDemo && hintLevel >= 3 && nextCorrect === k.id ? 'fp-hint' : ''}`}
          style={{ '--fp-key-color': k.color }}
          disabled={paused || isDemo || isHearingTune || freePlaying || isComplete}
          onClick={() => onKey(k)} aria-label={`${k.sargam}, ${k.western}`}>
          <strong>{k.sargam}</strong><small>{k.western}</small>
        </button>)}
      </div>
      {screen === 'free' && <div className="fp-controls">
        <button onClick={() => {
          if (freeRecording) setFreeRecording(false);
          else { setFreeNotes([]); freeStartRef.current = performance.now(); setFreeRecording(true); }
        }} disabled={paused || freePlaying}>{freeRecording ? 'Stop Recording' : 'Record My Tune'}</button>
        <button disabled={paused || freeRecording || !freeNotes.length} onClick={() => freePlaying ? stopPlayback() : hearMyTune(freeNotes, true)}>{freePlaying ? 'Stop' : 'Hear My Tune'}</button>
        <button onClick={finishScene} disabled={paused}>Done</button>
      </div>}
      {isComplete && screen === 'challenge' && <div className="fp-complete" role="dialog" aria-label="Tune complete">
        <h2>You played the tune!</h2>
        <div className="fp-complete-actions">
          <button disabled={isHearingTune} onClick={() => hearMyTune(songNotesRef.current)}>Hear My Tune</button>
          <button disabled={isHearingTune} onClick={startChallenge}>Play Again</button>
          <button disabled={isHearingTune} onClick={finishScene}>Done</button>
        </div>
      </div>}
      <ZoneBadgeButton variant="gameplay" zoneId="festival-square" onBack={() => { stopPlayback(); onNavigate?.('zone-welcome'); }} />
      <GamePauseMenu
        show={paused}
        gameName={screen === 'challenge' ? 'Play with Ganesha' : 'Free Play'}
        onResume={resumeGame}
        onRestart={() => { pausedRef.current = false; setPaused(false); if (screen === 'challenge') startChallenge(); else startFree(); }}
        onBackToModes={returnToModes}
        onComplete={() => { pausedRef.current = false; setPaused(false); finishScene(); }}
      />
      {showSceneCompletion && <SceneCompletionCelebration
        show zoneId="festival-square" sceneId="game1" sceneName="Festival Piano"
        completionTitle={completionContent?.title} completionSubtitle={completionContent?.subtitle}
        discoveredSymbols={['listen-icon', 'play-icon', 'create-icon']}
        symbolImages={{ 'listen-icon': listenIcon, 'play-icon': playIcon, 'create-icon': createIcon }}
        starsEarned={0} totalStars={0} completionData={{ completed: true, stars: 0 }}
        onContinue={() => { onComplete?.(); onNavigate?.('scene-complete-continue'); }}
        onReplay={() => { setShowSceneCompletion(false); returnToModes(); }}
        onBackToMap={() => onNavigate?.('zone-welcome')}
      />}
    </div>
  </GameLayout>;
}

export default function FestivalPianoGame({ onComplete, onNavigate, zoneId = 'festival-square', sceneId = 'game1' }) {
  return <SceneManager zoneId={zoneId} sceneId={sceneId} initialState={{ phase: 'discovery', completed: false, stars: 0 }}>
    {({ sceneState, sceneActions }) => <FestivalPianoContent
      sceneState={sceneState} sceneActions={sceneActions} onComplete={onComplete} onNavigate={onNavigate} zoneId={zoneId} sceneId={sceneId} />}
  </SceneManager>;
}
