// SyllableVoiceChallenge.jsx
// Duolingo-style "say it!" overlay that pops up after a kid taps an elephant.
// Mooshika coaches them to repeat the syllable they just heard.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SyllableVoiceChallenge.css';

// ── Phonetic accepted variants ─────────────────────────────────────────────
// Tuned for international-school NRI kids (British / American accent).
// Rule: variants must sound phonetically similar — NOT just visually close.
// "kra" ≠ "kar" (different consonant order), so "kar" is NOT a variant.
const ACCEPTED_VARIANTS = {
  // ── Single syllables ──────────────────────────────────────────────────────
  // Rule: first consonant MUST match. No rhymes. Accent drift only.
  va:   ['va', 'vaa', 'vah', 'vuh'],                        // removed: wa, waa, wah (w≠v for short match)
  kra:  ['kra', 'kraa', 'krah', 'kraw'],                    // removed: gra, graa, cra (different consonant cluster)
  tun:  ['tun', 'toon', 'tuhn', 'tunn', 'tund'],            // removed: dun, done, thun — rhymes
  da:   ['da', 'daa', 'dah', 'duh', 'tha', 'dhar'],         // removed: the, dur, dar — too generic
  ma:   ['ma', 'maa', 'mah', 'muh'],                        // removed: ba, baa — rhymes (b≠m)
  ha:   ['ha', 'haa', 'hah', 'huh'],                        // removed: ah — too generic, matches everything
  ka:   ['ka', 'kaa', 'kah', 'kuh', 'gah', 'gar'],         // kept: g≈k in many accents
  ya:   ['ya', 'yaa', 'yah', 'yuh', 'yar'],                 // removed: yeah, yea (diphthong), ia
  nir:  ['nir', 'neer', 'nihr', 'nur'],                     // removed: near (too English)
  vigh: ['vigh', 'vig', 'veeg', 'vick'],                    // removed: wig (w≠v)
  nam:  ['nam', 'naam', 'nuhm'],                            // removed: num, naum — too far
  ku:   ['ku', 'koo', 'kuh'],                               // removed: coo (English word)
  ru:   ['ru', 'roo', 'ruh'],                               // removed: rue (English word)
  me:   ['me', 'mee', 'meh'],                               // removed: may (diphthong drift)
  deva: ['deva', 'dayva', 'daiva'],                         // removed: diva (English, totally different)
  sur:  ['sur', 'soor', 'suur', 'suhr'],                    // removed: ser (too far for short)
  ko:   ['ko', 'koh', 'kow'],                               // removed: go (g≠k)
  ti:   ['ti', 'tee', 'tih'],                               // removed: thee (th≠t)
  sa:   ['sa', 'saa', 'sah', 'suh'],
  pra:  ['pra', 'praa', 'prah'],                            // removed: fra (f≠p)
  bha:  ['bha', 'bhaa', 'bah', 'buh'],                      // removed: baa (too generic)
  sar:  ['sar', 'saar', 'saur'],                            // removed: ser (too far)
  kar:  ['kar', 'kaar', 'car'],                             // removed: gar (g≈k only for ka, not kar)
  ye:   ['ye', 'yeh', 'yay'],                               // removed: yee (too far)
  shu:  ['shu', 'shoo', 'shoe'],                            // removed: chu (ch≠sh)

  // ── Accumulated / multi-syllable words ───────────────────────────────────
  // These are longer — fuzzy Levenshtein still applies, so variants can be looser
  vakra:         ['vakra', 'vak-ra', 'vakraa'],
  tunda:         ['tunda', 'toon-da', 'tundaa', 'tundaa'],
  vakratun:      ['vakratun', 'vakratoon', 'vakra-tun'],
  vakratunda:    ['vakratunda', 'vakra-tunda', 'vakratunde', 'vakrathunda'],
  maha:          ['maha', 'maa-ha', 'maaha'],
  mahaka:        ['mahaka', 'maha-ka', 'mahaaka'],
  mahakaya:      ['mahakaya', 'maha-kaya', 'mahakaia', 'mahakia'],
  surya:         ['surya', 'soorya', 'suriya', 'suuria'],
  suryako:       ['suryako', 'soorya-ko', 'suriako'],
  suryakoti:     ['suryakoti', 'soorya-koti', 'suryakody', 'suryakodi'],
  sama:          ['sama', 'saa-ma', 'saama'],
  samapra:       ['samapra', 'sama-pra'],
  samaprabha:    ['samaprabha', 'sama-prabha', 'samaprava', 'samaprabba'],
  nirvigh:       ['nirvigh', 'nir-vigh', 'nirvick', 'nirvig'],
  nirvighnam:    ['nirvighnam', 'nir-vighnam', 'nirvignam', 'nirvignum'],
  kuru:          ['kuru', 'koo-roo', 'kuroo', 'kuruu'],
  kurume:        ['kurume', 'kuru-me', 'kurumay'],
  kurumedeva:    ['kurumedeva', 'kuru-medeva', 'kurumideva', 'kurumadeva'],
  sarva:         ['sarva', 'sar-va', 'sarwa'],
  sarvaka:       ['sarvaka', 'sarva-ka', 'sarwaka'],
  sarvakar:      ['sarvakar', 'sarva-kar'],
  sarvakary:     ['sarvakary', 'sarva-kary'],
  sarvakaryeshu: ['sarvakaryeshu', 'sarva-karyeshu', 'sarvakarieshu', 'sarvakaryashu'],
  sarvada:       ['sarvada', 'sarva-da', 'sarwada'],
};

// Words in this set are judged only by explicit accepted variants (no fuzzy fallback).
// This prevents near-sounding but incorrect outputs like "kanda" for "tunda".
const STRICT_VARIANT_WORDS = new Set([
  'vakra',
  'tunda',
  'vakratunda',
  'maha',
  'kaya',
  'mahakaya',
]);

// ── Levenshtein distance ───────────────────────────────────────────────────
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// ── Phonetic matcher ───────────────────────────────────────────────────────
// Short syllables (≤3 chars): exact variant match only — no fuzzy.
// Levenshtein of 1 on a 2-char word = 50% error = rhyme territory.
// Long syllables (4+ chars): fuzzy Levenshtein with tighter ratios.
function matchSyllable(target, spokenText) {
  if (!spokenText || !spokenText.trim()) return 'notHeard';

  const normalize = s => s.toLowerCase().replace(/[^a-z]/g, '');
  const t = normalize(target);
  const accepted = (ACCEPTED_VARIANTS[t] || [t]).map(normalize);
  const isShort = t.length <= 3; // va, kra, ma, ha, ko, ti etc.
  const strictVariantsOnly = STRICT_VARIANT_WORDS.has(t);

  // Build candidates: individual words + space-collapsed string
  const rawWords = spokenText.toLowerCase().split(/\s+/).map(normalize).filter(Boolean);
  const collapsed = rawWords.join('');
  const candidates = rawWords.length > 1 ? [...rawWords, collapsed] : rawWords;

  // ── Phase 1: Exact variant match (all lengths) ────────────────────────
  for (const word of candidates) {
    if (accepted.includes(word)) return 'perfect';
  }

  if (strictVariantsOnly) return 'tryAgain';

  // ── Phase 2: Levenshtein ≤1 — only for long syllables ────────────────
  // Skip for short syllables: 1 error on "ma" matches "ba", "na", "ta" etc.
  if (!isShort) {
    for (const word of candidates) {
      for (const v of accepted) {
        if (levenshtein(word, v) <= 1) return 'perfect';
      }
    }
  }

  // ── Phase 3: Fuzzy ratio — only for long syllables (4+ chars) ─────────
  // Short syllables never reach here — too many false positives.
  if (!isShort) {
    for (const word of candidates) {
      // Compare against the target itself (for accumulated words not in variants)
      const dist = levenshtein(t, word);
      const ratio = dist / Math.max(t.length, word.length, 1);
      if (ratio <= 0.25) return 'perfect';
      if (ratio <= 0.38) return 'good';
    }
  }

  return 'tryAgain';
}

// ── Feedback config ────────────────────────────────────────────────────────
const FEEDBACK = {
  perfect: {
    emoji: '⭐',
    title: 'Amazing!',
    messages: [
      'Perfect Sanskrit chanting!',
      'You sound like a Sanskrit scholar!',
      'Ganesha is smiling at you!',
      'Beautiful — just like that!',
    ],
    titleColor: '#D97706',
    bg: 'linear-gradient(160deg, #FFFBEB 0%, #FEF3C7 100%)',
  },
  good: {
    emoji: '✨',
    title: 'Good job!',
    messages: [
      'Good job!',
      'Amazing!',
      'Wonderful!',
      'Excellent!',
    ],
    titleColor: '#059669',
    bg: 'linear-gradient(160deg, #F0FDF4 0%, #DCFCE7 100%)',
  },
  tryAgain: {
    emoji: '🎤',
    title: 'Almost there!',
    messages: [
      'Almost there!',
      'Try again!',
      "You've got this!",
    ],
    titleColor: '#EA580C',
    bg: 'linear-gradient(160deg, #FFF7ED 0%, #FFEDD5 100%)',
  },
};

const STAR_EMOJIS = ['⭐', '✨', '🌟', '💫', '⭐', '✨', '🌟', '💫', '⭐', '✨', '🌟', '💫'];

// ── Component ──────────────────────────────────────────────────────────────
const SyllableVoiceChallenge = ({
  syllable,       // e.g. 'va'
  displayLabel,   // e.g. 'VA'  (shown big to the kid)
  onComplete,     // () => void — resumes the game
  mooshikaImage,  // path to mooshika-coach.png
  replayAudio,    // () => void — replays the syllable/word audio (Duolingo retry loop)
  stopAudio,      // () => void — stops all game audio before mic opens (prevents bleed)
  inline = false, // true → renders as card only (no backdrop overlay); parent controls positioning
  simpleMode = false, // true → simplified success/fail copy for custom scene flow
  autoContinueOnSuccessMs = 0, // >0 → auto-close on success after delay
}) => {
  const [phase, setPhase] = useState('prompt');  // prompt | listening | result | replaying
  const [result, setResult] = useState(null);    // null | 'perfect' | 'good' | 'tryAgain'
  const [attempts, setAttempts] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [waveHeights, setWaveHeights] = useState(Array(14).fill(4));
  const [stars, setStars] = useState([]);

  const recognitionRef  = useRef(null);
  const waveTimerRef    = useRef(null);
  const autoStartTimer  = useRef(null);
  const autoCloseTimer  = useRef(null);
  const MAX_ATTEMPTS    = 3;

  const supportsRecognition =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // ── Waveform ─────────────────────────────────────────────────────────────
  const startWave = () => {
    waveTimerRef.current = setInterval(() => {
      setWaveHeights(Array(14).fill(0).map(() => 4 + Math.random() * 36));
    }, 90);
  };
  const stopWave = () => {
    clearInterval(waveTimerRef.current);
    setWaveHeights(Array(14).fill(4));
  };

  // ── Star burst ────────────────────────────────────────────────────────────
  const burstStars = () => {
    const generated = STAR_EMOJIS.map((emoji, i) => ({
      id: i,
      emoji,
      x: 15 + Math.random() * 70,
      y: 20 + Math.random() * 60,
      delay: i * 55,
    }));
    setStars(generated);
    setTimeout(() => setStars([]), 1400);
  };

  // ── Show result ───────────────────────────────────────────────────────────
  const showResult = useCallback((type, msg) => {
    stopWave();
    setFeedbackMsg(msg);
    setResult(type);
    setPhase('result');
    if (type === 'perfect' || type === 'good') burstStars();
  }, []);

  // ── Speech recognition ────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (phase === 'listening') return; // already running

    if (!supportsRecognition) {
      // No API — show "great try" after brief pause so kid feels heard
      setPhase('listening');
      startWave();
      setTimeout(() => {
        showResult('good', "Great effort! Let's keep going!");
      }, 1800);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    recognitionRef.current = rec;

    rec.lang = 'en-US'; // en-US has best short-word recognition on Windows Chrome; Latin output matches our ACCEPTED_VARIANTS
    rec.continuous = false;
    rec.interimResults = false; // final-only avoids partial results racing with onend
    rec.maxAlternatives = 3;

    let finalTranscript = '';
    let errorHandled = false;
    // onspeechstart fires when Chrome's VAD confirmed it heard a voice, even if
    // the transcription engine later returns nothing (e.g. short syllables).
    // We use this to distinguish "mic silent" from "spoke but Chrome couldn't transcribe".
    let speechStarted = false;

    rec.onstart = () => {
      setPhase('listening');
      startWave();
    };

    rec.onspeechstart = () => {
      speechStarted = true;
      console.log('[SVC] onspeechstart — Chrome VAD detected voice');
    };

    rec.onresult = (e) => {
      // Collect all alternatives from all final results.
      // Chrome often places the best Sanskrit match in alt 1 or 2, not alt 0.
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          for (let j = 0; j < e.results[i].length; j++) {
            finalTranscript += e.results[i][j].transcript + ' ';
          }
        }
      }
      console.log('[SVC] onresult — final:', JSON.stringify(finalTranscript));
    };

    rec.onend = () => {
      stopWave();
      recognitionRef.current = null;
      if (errorHandled) return;

      const heard = finalTranscript.trim();
      console.log('[SVC] onend — heard:', JSON.stringify(heard), '| speechStarted:', speechStarted, '| syllable:', syllable);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (!heard) {
        // Chrome VAD confirmed speech was present but transcription returned nothing.
        // This happens with short Sanskrit syllables — treat it as a valid attempt
        // so kids are never penalised for Chrome's accuracy limits on 1-syllable words.
        if (speechStarted) {
          showResult('good', "Great try! Keep practising! 🌟");
          return;
        }
        if (newAttempts >= MAX_ATTEMPTS) {
          showResult('tryAgain', "Mooshika couldn't hear — let's keep going! 🐭");
        } else {
          showResult('tryAgain', "Mooshika didn't hear you — try again!");
        }
        return;
      }

      const matchResult = matchSyllable(syllable, heard);
      console.log('[SVC] matchResult:', matchResult, '| heard:', heard);
      if (matchResult === 'perfect' || matchResult === 'good') {
        const fb = FEEDBACK[matchResult];
        showResult(matchResult, fb.messages[Math.floor(Math.random() * fb.messages.length)]);
      } else if (newAttempts >= MAX_ATTEMPTS) {
        showResult('good', "Great try! You're almost there! 🌟");
      } else {
        const fb = FEEDBACK.tryAgain;
        showResult('tryAgain', fb.messages[Math.floor(Math.random() * fb.messages.length)]);
      }
    };

    rec.onerror = (e) => {
      stopWave();
      recognitionRef.current = null;
      console.log('[SVC] onerror:', e.error);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        onComplete?.(); // mic denied — silently skip so game never blocks
        return;
      }
      errorHandled = true;
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (e.error === 'no-speech') {
        // Timed out waiting for voice — prompt kid to speak louder/sooner
        showResult('tryAgain', newAttempts >= MAX_ATTEMPTS
          ? "Mooshika couldn't hear — let's keep going! 🐭"
          : "Speak a bit louder! 🎤");
      } else if (newAttempts >= MAX_ATTEMPTS) {
        showResult('good', "Amazing effort! You're a star! ⭐");
      } else {
        showResult('tryAgain', "Oops! Let's try one more time!");
      }
    };

    try {
      rec.start();
    } catch {
      // start() can throw if called twice; silently proceed
      onComplete?.();
    }
  }, [phase, syllable, attempts, supportsRecognition, showResult, onComplete]);

  // Auto-replay syllable audio when tryAgain shows and attempts remain
  // (Duolingo style: kid hears it again before their next attempt)
  useEffect(() => {
    if (phase === 'result' && result === 'tryAgain' && attempts < MAX_ATTEMPTS && replayAudio) {
      const t = setTimeout(() => replayAudio(), 400);
      return () => clearTimeout(t);
    }
  }, [result, attempts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount only — mic is tap-to-start, NOT auto-started
  // (auto-start caused game's Hindi audio to bleed into the recogniser)
  useEffect(() => {
    return () => {
      clearTimeout(autoStartTimer.current);
      clearTimeout(autoCloseTimer.current);
      clearInterval(waveTimerRef.current);
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!autoContinueOnSuccessMs) return;
    if (phase !== 'result') return;
    if (!(result === 'perfect' || result === 'good')) return;
    clearTimeout(autoCloseTimer.current);
    autoCloseTimer.current = setTimeout(() => {
      onComplete?.();
    }, autoContinueOnSuccessMs);
    return () => clearTimeout(autoCloseTimer.current);
  }, [phase, result, autoContinueOnSuccessMs, onComplete]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleClose = () => {
    recognitionRef.current?.abort();
    clearInterval(waveTimerRef.current);
    onComplete?.();
  };

  const handleRetry = () => {
    setResult(null);
    if (replayAudio) {
      // Duolingo loop: replay audio → then kid taps mic button to respond
      setPhase('replaying');
      replayAudio();
      // After audio plays, return to prompt so kid sees the tap-to-speak button
      setTimeout(() => setPhase('prompt'), 1800);
    } else {
      setPhase('prompt');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const isSuccess = result === 'perfect' || result === 'good';
  const fb = result ? FEEDBACK[result] : null;
  const resultTitle = simpleMode
    ? (isSuccess ? 'Amazing!' : 'Almost there!')
    : fb?.title;

  const card = (
    <div className={`svc-card${inline ? ' svc-card--inline' : ''}`} style={fb ? { background: fb.bg } : {}}>

      {/* × close button — always visible */}
      <button className="svc-close" onClick={handleClose} aria-label="Close">×</button>

        {/* Floating stars on success */}
        {stars.map(s => (
          <span
            key={s.id}
            className="svc-star"
            style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.delay}ms` }}
          >
            {s.emoji}
          </span>
        ))}

        {/* Mooshika coach */}
        {mooshikaImage && (
          <div className={`svc-mooshika ${isSuccess && phase === 'result' ? 'svc-mooshika--bounce' : ''}`}>
            <img src={mooshikaImage} alt="Mooshika" draggable={false} />
          </div>
        )}

        {/* ── Prompt / Listening phase ── */}
        {phase !== 'result' && (
          <div className="svc-body">
            <div className="svc-syllable">{displayLabel || syllable.toUpperCase()}</div>

            <p className="svc-prompt-text">
              {phase === 'replaying' ? 'Listen carefully… 🔊'
                : phase === 'listening' ? 'Listening… 🎙️'
                : attempts > 0 ? 'Now try again! 🎤'
                : 'Now say it! 🎤'}
            </p>

            {/* Animated waveform */}
            <div className={`svc-waveform ${phase === 'listening' ? 'svc-waveform--active' : ''}`}>
              {waveHeights.map((h, i) => (
                <div key={i} className="svc-wave-bar" style={{ height: `${h}px` }} />
              ))}
            </div>

            {/* Tap-to-speak — kid must tap, mic never auto-opens */}
            {phase === 'prompt' && (
              <button
                className="svc-btn svc-btn--mic svc-btn--mic-pulse"
                onClick={() => {
                  stopAudio?.();   // pause game audio synchronously — mic capture is async,
                  startListening(); // so audio is already silent by the time Chrome's mic opens
                }}
              >
                🎤 Tap & Say It!
              </button>
            )}
          </div>
        )}

        {/* ── Result phase ── */}
        {phase === 'result' && fb && (
          <div className="svc-body svc-body--result">
            {!simpleMode && <div className="svc-result-emoji">{fb.emoji}</div>}
            <div className="svc-result-title" style={{ color: fb.titleColor }}>
              {resultTitle}
            </div>

            <div className="svc-actions">
              {result === 'tryAgain' && attempts < MAX_ATTEMPTS ? (
                <button className="svc-btn svc-btn--retry" onClick={handleRetry}>
                  Try Again
                </button>
              ) : !(simpleMode && isSuccess && autoContinueOnSuccessMs > 0) ? (
                <button className="svc-btn svc-btn--continue" onClick={handleClose}>
                  Continue →
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
  );

  if (inline) return card;

  return (
    <div className="svc-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      {card}
    </div>
  );
};

export default SyllableVoiceChallenge;
