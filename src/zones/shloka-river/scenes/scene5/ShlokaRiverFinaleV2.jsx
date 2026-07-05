// zones/shloka-river/scenes/scene5/ShlokaRiverFinaleV2.jsx
// NEW: Chanting Circle — Random animal selection + timed hints

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './RiverFinaleEnhanced.css';

// Scene management
import SceneManager from '../../../../lib/components/scenes/SceneManager';
import MessageManager from '../../../../lib/components/scenes/MessageManager';
import InteractionManager from '../../../../lib/components/scenes/InteractionManager';

// UI Components
import HomeButton from '../../../../lib/components/ui/HomeButton';
import AudioToggle from '../../../../lib/components/ui/AudioToggle';
import ZoneBadgeButton from '../../../../lib/components/navigation/ZoneBadgeButton';
import useAudioPreference from '../../../../lib/hooks/useAudioPreference';
import useVoiceGuidance from '../../../../lib/hooks/useVoiceGuidance';
import SceneCompletionCelebration from '../../../../lib/components/celebration/SceneCompletionCelebration';
import OpeningModal from '../../../shared/components/OpeningModal';
import SparkleAnimation from '../../../../lib/components/animation/SparkleAnimation';
import { getCompletionModal } from '../../../../lib/config/content';
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';

// Data + helpers
import {
  SHLOKA_WORDS,
  FULL_SHLOKA_AUDIO,
  generateAllRounds,
  CELEBRATION_MESSAGES,
} from './ShlokaRiverFinaleData';

// Images
import bgImage from './assets/images/bg.png';
import ganeshaHeadphones from '../assets/images/ganesha_with_headphones.png';

// OLD version imports (keeping for now, will refactor)
import vakratundaElephant from '../../scenes/Scene1/assets/images/vakratunda/elephant-baby-va.png';
import mahakayaElephant from '../../scenes/Scene1/assets/images/mahakaya/elephant-ma.png';
import suryakotiFairy from '../../scenes/scene3/assets/images/suryakoti-fairy.png';
import samaprabhaKitten from '../../scenes/scene3/assets/images/samaprabha-kitten.png';
import nirvighnamSnail from '../../scenes/scene4/assets/images/nirvighnam-snail.png';
import kurumedevaPeacock from '../../scenes/scene4/assets/images/kurumedeva-peacock.png';
import sarvakaryeshuDuck from '../../scenes/scene4/assets/images/sarvakaryeshu-duck.png';
import sarvadaFawn from '../../scenes/scene4/assets/images/sarvada-fawn.png';

// Map animal image keys to imports
const ANIMAL_IMAGES = {
  vakratundaElephant,
  mahakayaElephant,
  suryakotiFairy,
  samaprabhaKitten,
  nirvighnamSnail,
  kurumedevaPeacock,
  sarvakaryeshuDuck,
  sarvadaFawn,
};

const PHASES = {
  INITIAL: 'initial',
  INTRO: 'intro', // Playing full shloka
  PLAYING: 'playing', // Active round
  MID_CELEBRATION: 'mid-celebration', // 4/8
  FINALE: 'finale', // All 8 aboard
  SCENE_COMPLETE: 'scene-complete',
};

const ShlokaRiverFinaleV2 = ({ onComplete, onBack, onNavigate }) => {
  return (
    <SceneManager
      zoneId="shloka-river"
      sceneId="shloka-river-finale"
      initialState={{
        phase: PHASES.INITIAL,
        rounds: [], // Will be filled on mount
        currentRoundIndex: 0,
        animalsBoarded: [], // Array of correct animal IDs
        hints: {
          showGlow: false, // 7s hint
          showVO: false, // 15s hint
          showSparkles: false, // 23s hint
        },
        wrongFeedback: null, // Animal ID that was clicked wrong
        showSceneCompletion: false,
      }}
    >
      {({ sceneState, sceneActions, isReload }) => (
        <ShlokaRiverFinaleContent
          sceneState={sceneState}
          sceneActions={sceneActions}
          isReload={isReload}
          onComplete={onComplete}
          onBack={onBack}
          onNavigate={onNavigate}
        />
      )}
    </SceneManager>
  );
};

const ShlokaRiverFinaleContent = ({
  sceneState,
  sceneActions,
  isReload,
  onComplete,
  onBack,
  onNavigate,
}) => {
  const { isAudioOn, toggleAudio } = useAudioPreference();
  const { startIdleTimer, stopIdleTimer, setCurrentPhase } = useVoiceGuidance(
    'shloka-river',
    'shloka-river-finale',
    { enableMusic: false, idleTimeout: 20 }
  );

  const audioRef = useRef(null);
  const timersRef = useRef([]);
  const speechSynthesisRef = useRef(null);
  const theme = getZoneTheme('shloka-river');
  const completionModalContent = getCompletionModal('shloka-river', 'shloka-river-finale');

  // Initialize Web Speech API
  useEffect(() => {
    const synth = window.speechSynthesis;
    speechSynthesisRef.current = synth;
    return () => {
      if (synth) synth.cancel();
    };
  }, []);

  // Initialize rounds on first mount
  useEffect(() => {
    if (sceneState.phase === PHASES.INITIAL && sceneState.rounds.length === 0) {
      const rounds = generateAllRounds();
      sceneActions.updateState({
        rounds,
        phase: PHASES.INTRO,
      });
    }
  }, [sceneState.phase, sceneState.rounds.length]);

  // Start idle timer
  useEffect(() => {
    startIdleTimer();
    return () => stopIdleTimer();
  }, [startIdleTimer, stopIdleTimer]);

  // Update current phase for voice guidance
  useEffect(() => {
    setCurrentPhase(sceneState.phase);
  }, [sceneState.phase, setCurrentPhase]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const playAudio = (path) => {
    if (!isAudioOn) return;
    try {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(path);
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch((e) => console.log('Audio play prevented:', e));
    } catch (error) {
      console.warn('Audio error:', error);
    }
  };

  const speakVOHint = (hintText) => {
    if (!isAudioOn || !speechSynthesisRef.current) return;

    // Cancel any previous speech
    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(hintText);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Try to use a clear voice (English)
    const voices = speechSynthesisRef.current.getVoices();
    const femaleVoice = voices.find(
      (voice) =>
        voice.name.includes('Female') ||
        voice.name.includes('woman') ||
        voice.name.includes('Google UK English Female')
    ) || voices[0];

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    speechSynthesisRef.current.speak(utterance);
  };

  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timersRef.current.push(id);
    return id;
  };

  // ===== PHASE 1: INTRO — Play full shloka =====
  const handleIntroStart = () => {
    // Play full shloka first
    playAudio(FULL_SHLOKA_AUDIO);

    // After 3 seconds (shloka is playing), move to first round
    safeSetTimeout(() => {
      sceneActions.updateState({
        phase: PHASES.PLAYING,
        currentRoundIndex: 0,
        animalsBoarded: [],
      });
      // Clear hint states for first round
      startRoundHints();
    }, 3000);
  };

  // ===== PHASE 2: PLAYING — Animal selection with timed hints =====
  const startRoundHints = () => {
    // Clear previous hints
    sceneActions.updateState({
      hints: { showGlow: false, showVO: false, showSparkles: false },
    });

    // 7s: Show golden glow on correct animal
    safeSetTimeout(() => {
      sceneActions.updateState({
        hints: { ...sceneState.hints, showGlow: true },
      });
    }, 7000);

    // 15s: Play VO hint via Web Speech API
    safeSetTimeout(() => {
      const currentRound = sceneState.rounds[sceneState.currentRoundIndex];
      sceneActions.updateState({
        hints: { ...sceneState.hints, showVO: true },
      });
      // Speak the VO hint
      if (currentRound?.correct.voHint) {
        speakVOHint(currentRound.correct.voHint);
      }
    }, 15000);

    // 23s: Show big sparkles + hint becomes obvious
    safeSetTimeout(() => {
      sceneActions.updateState({
        hints: { ...sceneState.hints, showSparkles: true },
      });
    }, 23000);
  };

  const handleAnimalClick = (clickedAnimal) => {
    const currentRound = sceneState.rounds[sceneState.currentRoundIndex];
    const isCorrect = clickedAnimal.id === currentRound.correct.id;

    if (!isCorrect) {
      // Wrong answer — Favorite Food pattern (wiggle + grayscale)
      sceneActions.updateState({
        wrongFeedback: clickedAnimal.id,
      });

      // Play sad note sound effect
      if (isAudioOn) {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.value = 300; // Low sad note
          gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
          console.log('Audio context not available');
        }
      }

      // Clear feedback after 0.4 seconds (wrongWiggle animation duration)
      safeSetTimeout(() => {
        sceneActions.updateState({
          wrongFeedback: null,
        });
      }, 400);

      return;
    }

    // Correct! Animal boards the raft
    const newAnimalsBoarded = [...sceneState.animalsBoarded, clickedAnimal.id];
    sceneActions.updateState({
      animalsBoarded: newAnimalsBoarded,
    });

    // Play word audio
    playAudio(currentRound.correct.wordAudio);

    // Check if we're at round 4 (mid-celebration)
    if (newAnimalsBoarded.length === 4) {
      sceneActions.updateState({
        phase: PHASES.MID_CELEBRATION,
      });

      safeSetTimeout(() => {
        sceneActions.updateState({
          phase: PHASES.PLAYING,
          currentRoundIndex: sceneState.currentRoundIndex + 1,
        });
        startRoundHints();
      }, 3000);
    } else if (newAnimalsBoarded.length === 8) {
      // All animals boarded! Go to finale
      sceneActions.updateState({
        phase: PHASES.FINALE,
      });

      // Play full shloka again
      safeSetTimeout(() => {
        playAudio(FULL_SHLOKA_AUDIO);
      }, 1000);

      // Show completion after shloka finishes
      safeSetTimeout(() => {
        sceneActions.updateState({
          phase: PHASES.SCENE_COMPLETE,
          showSceneCompletion: true,
        });
      }, 4000);
    } else {
      // Move to next round
      safeSetTimeout(() => {
        sceneActions.updateState({
          currentRoundIndex: sceneState.currentRoundIndex + 1,
        });
        startRoundHints();
      }, 2000);
    }
  };

  // ===== RENDER =====

  if (sceneState.phase === PHASES.INITIAL) {
    return (
      <div className="shloka-river-finale">
        <OpeningModal
          zoneId="shloka-river"
          sceneId="shloka-river-finale"
          onStart={handleIntroStart}
          characterImg={ganeshaHeadphones}
          showButton={true}
        />
      </div>
    );
  }

  if (sceneState.phase === PHASES.INTRO) {
    return (
      <div className="shloka-river-finale">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ fontFamily: 'Baloo 2, cursive', color: theme.textPrimary }}>
            Listen to the Sacred Prayer...
          </h2>
          <div style={{ marginTop: '40px', fontSize: '60px' }}>🙏</div>
          <p style={{ fontFamily: 'Nunito, sans-serif', color: theme.subtleColor }}>
            The shloka is playing...
          </p>
        </div>
      </div>
    );
  }

  if (sceneState.phase === PHASES.PLAYING) {
    const currentRound = sceneState.rounds[sceneState.currentRoundIndex];

    return (
      <div className="shloka-river-finale">
        <HomeButton onNavigate={(dest) => (onNavigate ? onNavigate(dest) : onBack?.())} />
        <ZoneBadgeButton
          zoneId="shloka-river"
          onBack={() => (onNavigate ? onNavigate('zone-welcome') : onBack?.())}
        />
        <AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />

        {/* Background */}
        <div
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'absolute',
            inset: 0,
            zIndex: 0,
          }}
        />

        {/* Game Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            padding: '40px 20px',
            textAlign: 'center',
            minHeight: 'var(--app-height, 100vh)',
          }}
        >
          {/* Progress */}
          <div
            style={{
              fontSize: '18px',
              fontFamily: 'Baloo 2, cursive',
              color: theme.textPrimary,
              marginBottom: '30px',
            }}
          >
            Word {sceneState.currentRoundIndex + 1} of 8
          </div>

          {/* Current word + meaning */}
          <div
            style={{
              marginBottom: '40px',
              padding: '20px',
              background: `linear-gradient(135deg, ${theme.accentColor}33, ${theme.accentColor}11)`,
              borderRadius: '20px',
            }}
          >
            <h2
              style={{
                fontFamily: 'Baloo 2, cursive',
                color: theme.textPrimary,
                fontSize: '36px',
                margin: 0,
              }}
            >
              {currentRound.correct.word}
            </h2>
            <p
              style={{
                fontFamily: 'Nunito, sans-serif',
                color: theme.subtleColor,
                fontSize: '16px',
                margin: '10px 0 0 0',
              }}
            >
              "{currentRound.correct.meaning}"
            </p>
          </div>

          {/* Hint text (appears at 15s) */}
          {sceneState.hints.showVO && (
            <div
              style={{
                marginBottom: '40px',
                padding: '15px',
                background: theme.accentColor + '22',
                borderRadius: '12px',
                fontFamily: 'Nunito, sans-serif',
                color: theme.textPrimary,
                fontSize: '16px',
                animation: 'fadeIn 0.5s ease-out',
              }}
            >
              {currentRound.correct.voHint}
            </div>
          )}

          {/* The 3 animal choices */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              maxWidth: '900px',
              margin: '0 auto 40px',
              padding: '0 20px',
            }}
          >
            {currentRound.options.map((animal) => {
              const isCorrect = animal.id === currentRound.correct.id;
              const hasGlow = sceneState.hints.showGlow && isCorrect;
              const hasSparkles = sceneState.hints.showSparkles && isCorrect;
              const isWrongFeedback = sceneState.wrongFeedback === animal.id;

              return (
                <button
                  key={animal.id}
                  onClick={() => handleAnimalClick(animal)}
                  style={{
                    background: 'none',
                    border: hasGlow
                      ? `4px solid ${theme.accentColor}`
                      : '2px solid #ccc',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: isWrongFeedback ? 'default' : 'pointer',
                    transition: 'all 0.3s ease',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: hasGlow ? `0 0 20px ${theme.accentColor}` : 'none',
                    animation: isWrongFeedback ? 'wrongWiggle 0.4s ease-out forwards' : hasSparkles ? 'pulse 0.5s ease-out' : 'none',
                    opacity: isWrongFeedback ? 0.6 : 1,
                    filter: isWrongFeedback ? 'grayscale(40%) blur(0.5px)' : 'none',
                    pointerEvents: isWrongFeedback ? 'none' : 'auto',
                  }}
                >
                  {/* Animal emoji */}
                  <div style={{ fontSize: '60px', marginBottom: '10px' }}>
                    {animal.emoji}
                  </div>
                  {/* Animal name */}
                  <div
                    style={{
                      fontFamily: 'Baloo 2, cursive',
                      fontSize: '16px',
                      color: theme.textPrimary,
                    }}
                  >
                    {animal.word}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Raft progress */}
          <div
            style={{
              marginTop: '40px',
              padding: '20px',
              background: '#fff8e7',
              borderRadius: '12px',
              fontFamily: 'Nunito, sans-serif',
              color: theme.textPrimary,
            }}
          >
            Animals boarded: {sceneState.animalsBoarded.length}/8 🚤
          </div>
        </div>

        <audio ref={audioRef} />
      </div>
    );
  }

  if (sceneState.phase === PHASES.MID_CELEBRATION) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
        }}
      >
        <div
          style={{
            background: '#fff8e7',
            borderRadius: '24px',
            padding: '60px 40px',
            textAlign: 'center',
            maxWidth: '600px',
            animation: 'popIn 0.6s ease-out',
          }}
        >
          <h2
            style={{
              fontFamily: 'Baloo 2, cursive',
              color: theme.textPrimary,
              fontSize: '32px',
              margin: 0,
            }}
          >
            {CELEBRATION_MESSAGES.midpoint}
          </h2>
          <p
            style={{
              fontFamily: 'Nunito, sans-serif',
              color: theme.subtleColor,
              fontSize: '18px',
              marginTop: '20px',
            }}
          >
            Four sacred words learned. Keep going!
          </p>
        </div>
      </div>
    );
  }

  if (sceneState.phase === PHASES.FINALE) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
        }}
      >
        <div
          style={{
            background: '#fff8e7',
            borderRadius: '24px',
            padding: '60px 40px',
            textAlign: 'center',
            maxWidth: '600px',
            animation: 'popIn 0.6s ease-out',
          }}
        >
          <h2
            style={{
              fontFamily: 'Baloo 2, cursive',
              color: theme.textPrimary,
              fontSize: '32px',
              margin: 0,
            }}
          >
            {CELEBRATION_MESSAGES.complete}
          </h2>
          <p
            style={{
              fontFamily: 'Nunito, sans-serif',
              color: theme.subtleColor,
              fontSize: '18px',
              marginTop: '20px',
            }}
          >
            All 8 animals are aboard the raft! 🙏
          </p>
          <div style={{ fontSize: '80px', marginTop: '30px' }}>🎉</div>
        </div>

        {/* Fireworks */}
        <SparkleAnimation
          type="firework"
          count={50}
          color={theme.accentColor}
          size={10}
          duration={3000}
          fadeOut={true}
          area="full"
        />
      </div>
    );
  }

  if (sceneState.phase === PHASES.SCENE_COMPLETE) {
    return (
      <SceneCompletionCelebration
        show={true}
        zoneId="shloka-river"
        sceneName="Shloka River Finale"
        completionTitle={completionModalContent?.title}
        completionSubtitle={completionModalContent?.subtitle}
        sceneNumber={5}
        totalScenes={5}
        starsEarned={5}
        totalStars={5}
        discoveredSymbols={[]}
        sceneId="shloka-river-finale"
        completionData={{ stars: 5, completed: true }}
        onComplete={() => {
          onNavigate?.('zone-welcome');
          onComplete?.();
        }}
        onReplay={() => {
          sceneActions.updateState({
            phase: PHASES.INTRO,
            currentRoundIndex: 0,
            animalsBoarded: [],
          });
        }}
        onContinue={() => {
          onNavigate?.('zone-welcome');
        }}
      />
    );
  }

  return <div>Loading...</div>;
};

// Keyframe animations (from Favorite Food Game)
const STYLES = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.6); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 currentColor; }
    50% { box-shadow: 0 0 0 15px rgba(255,255,255,0); }
  }
  @keyframes wrongWiggle {
    0% { transform: translateX(0) scale(1); }
    20% { transform: translateX(-6px) scale(0.98); }
    40% { transform: translateX(6px) scale(0.98); }
    60% { transform: translateX(-4px) scale(0.97); }
    80% { transform: translateX(4px) scale(0.97); }
    100% { transform: translateX(0) scale(0.95); }
  }
`;

// Inject keyframes into document
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);
}

export default ShlokaRiverFinaleV2;
