// zones/shloka-river/scenes/scene5/RiverFinaleEnhanced.jsx
// ENHANCED FINALE: Level 1 (Build 8 Words) + Level 2 (Arrange Shloka)

import React, { useState, useEffect, useRef } from 'react';
import './RiverFinaleEnhanced.css';
import '../shared/components/OpeningModal.css';
import OpeningModal from '../../../shared/components/OpeningModal.jsx';

const RiverFinaleEnhanced = ({ onComplete, onBack, onNavigate }) => {
  const [gamePhase, setGamePhase] = useState('intro');
  // Phases: intro, level1, word-complete, level1-complete, level2, shloka-complete, scene-complete

  // Level 1: Build Words
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // 0-7
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([null, null, null, null]); // Max 5 for longest word
  const [usedSyllables, setUsedSyllables] = useState([]);
  const [completedWords, setCompletedWords] = useState([]);
  const [scrambledSyllables, setScrambledSyllables] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hint, setHint] = useState("Tap a lily pad to start!");

  // Level 2: Arrange Shloka
  const [selectedShlokaSlot, setSelectedShlokaSlot] = useState(null);
  const [shlokaSlots, setShlokaSlots] = useState(Array(8).fill(null));
  const [usedWords, setUsedWords] = useState([]);
  const [recitationIndex, setRecitationIndex] = useState(-1);

  const audioRef = useRef(null);

  // 8 Sanskrit words data
  const shlokaWords = [
    {
      id: 1,
      word: "Vakratunda",
      syllables: ["VA", "KRA", "TUN", "DA"],
      syllableAudio: [
        "/audio/syllables/vakratunda-va.mp3",
        "/audio/syllables/vakratunda-kra.mp3",
        "/audio/syllables/vakratunda-tun.mp3",
        "/audio/syllables/vakratunda-da.mp3"
      ],
      wordAudio: "/audio/words/vakratunda.mp3",
      meaning: "Curved Trunk",
      position: 0 // Position in shloka (0-7)
    },
    {
      id: 2,
      word: "Mahakaya",
      syllables: ["MA", "HA", "KA", "YA"],
      syllableAudio: [
        "/audio/syllables/mahakaya-ma.mp3",
        "/audio/syllables/mahakaya-ha.mp3",
        "/audio/syllables/mahakaya-ka.mp3",
        "/audio/syllables/mahakaya-ya.mp3"
      ],
      wordAudio: "/audio/words/mahakaya.mp3",
      meaning: "Big Body",
      position: 1
    },
    {
      id: 3,
      word: "Suryakoti",
      syllables: ["SUR", "YA", "KO", "TI"],
      syllableAudio: [
        "/audio/syllables/suryakoti-sur.mp3",
        "/audio/syllables/suryakoti-ya.mp3",
        "/audio/syllables/suryakoti-ko.mp3",
        "/audio/syllables/suryakoti-ti.mp3"
      ],
      wordAudio: "/audio/words/suryakoti.mp3",
      meaning: "Million Suns",
      position: 2
    },
    {
      id: 4,
      word: "Samaprabha",
      syllables: ["SA", "MA", "PRA", "BHA"],
      syllableAudio: [
        "/audio/syllables/samaprabha-sa.mp3",
        "/audio/syllables/samaprabha-ma.mp3",
        "/audio/syllables/samaprabha-pra.mp3",
        "/audio/syllables/samaprabha-bha.mp3"
      ],
      wordAudio: "/audio/words/samaprabha.mp3",
      meaning: "Equal Radiance",
      position: 3
    },
    {
      id: 5,
      word: "Nirvighnam",
      syllables: ["NIR", "VIGH", "NAM"],
      syllableAudio: [
        "/audio/syllables/nirvighnam-nir.mp3",
        "/audio/syllables/nirvighnam-vigh.mp3",
        "/audio/syllables/nirvighnam-nam.mp3"
      ],
      wordAudio: "/audio/words/nirvighnam.mp3",
      meaning: "Without Obstacles",
      position: 4
    },
    {
      id: 6,
      word: "Kurumedeva",
      syllables: ["KU", "RU", "ME", "DE", "VA"],
      syllableAudio: [
        "/audio/syllables/kurume-ku.mp3",
        "/audio/syllables/kurume-ru.mp3",
        "/audio/syllables/kurume-me.mp3",
        "/audio/syllables/deva-de.mp3",
        "/audio/syllables/deva-va.mp3"
      ],
      wordAudio: "/audio/words/kurumedeva.mp3",
      meaning: "Please Do For Me, O Lord",
      position: 5
    },
    {
      id: 7,
      word: "Sarvakaryeshu",
      syllables: ["SAR", "VA", "KAR", "YE", "SHU"],
      syllableAudio: [
        "/audio/syllables/sarvakaryeshu-sar.mp3",
        "/audio/syllables/sarvakaryeshu-va.mp3",
        "/audio/syllables/sarvakaryeshu-kar.mp3",
        "/audio/syllables/sarvakaryeshu-rye.mp3",
        "/audio/syllables/sarvakaryeshu-shu.mp3"
      ],
      wordAudio: "/audio/words/sarvakaryeshu.mp3",
      meaning: "In All Tasks",
      position: 6
    },
    {
      id: 8,
      word: "Sarvada",
      syllables: ["SAR", "VA", "DA"],
      syllableAudio: [
        "/audio/syllables/sarvada-sar.mp3",
        "/audio/syllables/sarvada-va.mp3",
        "/audio/syllables/sarvada-da.mp3"
      ],
      wordAudio: "/audio/words/sarvada.mp3",
      meaning: "Always",
      position: 7
    }
  ];

  // Fisher-Yates shuffle for syllables
  const scrambleSyllables = (syllables) => {
    const array = [...syllables];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Start game
  const handleStartGame = () => {
    setGamePhase('level1');
    loadWord(0);
  };

  // Load a word for Level 1
  const loadWord = (wordIndex) => {
    const word = shlokaWords[wordIndex];
    setCurrentWordIndex(wordIndex);
    setScrambledSyllables(scrambleSyllables(word.syllables));
    setSlots(Array(word.syllables.length).fill(null));
    setUsedSyllables([]);
    setSelectedSlot(null);
    setHint(`Build word ${wordIndex + 1} of 8: Tap a lily pad!`);
  };

  // Play audio
  const playAudio = (audioPath) => {
    if (audioRef.current) {
      audioRef.current.src = audioPath;
      audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
    }
  };

  // Handle lily pad slot click
  const handleSlotClick = (index) => {
    if (slots[index]) {
      // Slot filled - allow removal
      const syllableToRemove = slots[index];
      const newSlots = [...slots];
      newSlots[index] = null;
      setSlots(newSlots);
      setUsedSyllables(usedSyllables.filter(s => s !== syllableToRemove));
      setHint("Syllable removed. Try again!");
    } else {
      // Empty slot - select it
      setSelectedSlot(index);
      setHint(`Slot ${index + 1} selected. Now tap a stone!`);
    }
  };

  // Handle river stone syllable click
  const handleSyllableClick = (syllable, syllableIndex) => {
    if (usedSyllables.includes(syllable)) {
      setHint("You already used that syllable!");
      return;
    }

    if (selectedSlot === null) {
      setHint("First, tap an empty lily pad! 🪷");
      return;
    }

    // Play syllable audio
    const currentWord = shlokaWords[currentWordIndex];
    const audioPath = currentWord.syllableAudio[syllableIndex];
    playAudio(audioPath);

    // Place syllable in slot
    const newSlots = [...slots];
    newSlots[selectedSlot] = syllable;
    setSlots(newSlots);
    setUsedSyllables([...usedSyllables, syllable]);
    setSelectedSlot(null);

    // Check if all slots filled
    if (newSlots.every(s => s !== null)) {
      setTimeout(() => checkWord(newSlots), 800);
    } else {
      setHint("Great! Keep placing syllables! 🪨");
    }
  };

  // Check if word is correct
  const checkWord = (filledSlots) => {
    const currentWord = shlokaWords[currentWordIndex];
    const isCorrect = filledSlots.every((slot, i) => slot === currentWord.syllables[i]);

    if (isCorrect) {
      // CORRECT!
      setHint(`Perfect! That's ${currentWord.word}! ✨`);
      playAudio(currentWord.wordAudio);
      setShowCelebration(true);
      setGamePhase('word-complete');

      setTimeout(() => {
        setShowCelebration(false);
        const newCompletedWords = [...completedWords, currentWord];
        setCompletedWords(newCompletedWords);

        // Check if all 8 words done
        if (newCompletedWords.length === 8) {
          setTimeout(() => {
            setGamePhase('level1-complete');
            setTimeout(() => setGamePhase('level2'), 3000);
          }, 1000);
        } else {
          // Load next word
          setTimeout(() => {
            setGamePhase('level1');
            loadWord(currentWordIndex + 1);
          }, 1500);
        }
      }, 2500);
    } else {
      // WRONG ORDER
      setHint("Not quite! Listen to the syllables again 🔊");
      playAudio("/audio/effects/wrong.mp3");

      // Shake animation
      setTimeout(() => {
        setSlots(Array(currentWord.syllables.length).fill(null));
        setUsedSyllables([]);
        setSelectedSlot(null);
        setHint("Try again! Tap a lily pad to start 🪷");
      }, 1500);
    }
  };

  // Handle shloka slot click (Level 2)
  const handleShlokaSlotClick = (index) => {
    if (shlokaSlots[index]) {
      // Slot filled - allow removal
      const wordToRemove = shlokaSlots[index];
      const newSlots = [...shlokaSlots];
      newSlots[index] = null;
      setShlokaSlots(newSlots);
      setUsedWords(usedWords.filter(w => w.id !== wordToRemove.id));
      setSelectedShlokaSlot(null);
      setHint("Word removed. Place it correctly!");
    } else {
      // Empty slot - select it
      setSelectedShlokaSlot(index);
      setHint(`Boat ${index + 1} selected. Now pick a word scroll! ⛵`);
    }
  };

  // Handle word card click (Level 2)
  const handleWordClick = (word) => {
    if (usedWords.find(w => w.id === word.id)) {
      setHint("You already placed that word!");
      return;
    }

    if (selectedShlokaSlot === null) {
      setHint("First, tap an empty boat! ⛵");
      return;
    }

    // Play word audio
    playAudio(word.wordAudio);

    // Place word in boat
    const newSlots = [...shlokaSlots];
    newSlots[selectedShlokaSlot] = word;
    setShlokaSlots(newSlots);
    setUsedWords([...usedWords, word]);
    setSelectedShlokaSlot(null);

    // Check if all 8 placed
    if (newSlots.every(s => s !== null)) {
      setTimeout(() => checkShloka(newSlots), 800);
    } else {
      setHint(`Good! ${8 - usedWords.length - 1} more words to go! 📜`);
    }
  };

  // Check if shloka is in correct order
  const checkShloka = (filledSlots) => {
    const isCorrect = filledSlots.every((slot, i) => slot.position === i);

    if (isCorrect) {
      // CORRECT ORDER!
      setHint("Perfect! The shloka is complete! 🎉");
      setGamePhase('shloka-complete');

      // Recite shloka with highlighting
      setTimeout(() => reciteShloka(), 1000);
    } else {
      // WRONG ORDER
      setHint("Almost! The words aren't in the right order. Try rearranging! 🔄");
      playAudio("/audio/effects/wrong.mp3");
    }
  };

  // Recite complete shloka with word highlighting
  const reciteShloka = () => {
    setRecitationIndex(0);

    const reciteNext = (index) => {
      if (index < 8) {
        setRecitationIndex(index);
        playAudio(shlokaWords[index].wordAudio);

        setTimeout(() => {
          reciteNext(index + 1);
        }, 1500);
      } else {
        setTimeout(() => {
          setGamePhase('scene-complete');
        }, 2000);
      }
    };

    reciteNext(0);
  };

  const currentWord = shlokaWords[currentWordIndex];

  return (
    <div className="river-finale-enhanced">
      {/* Background with flowing water */}
      <div className="river-background">
        <div className="water-ripples"></div>
        <div className="floating-lotus" style={{ top: '10%', animationDelay: '0s' }}>🪷</div>
        <div className="floating-lotus" style={{ top: '30%', animationDelay: '5s' }}>🪷</div>
        <div className="floating-lotus" style={{ top: '50%', animationDelay: '10s' }}>🪷</div>
      </div>

      {/* Audio element */}
      <audio ref={audioRef} />

      {/* ========================================
          INTRO - OPENING MODAL
          ======================================== */}
      {gamePhase === 'intro' && (
        <div className="game-modal-overlay">
          <div className="game-modal-content">
            <div className="game-modal-character">
              <div className="ganesha-emoji">🐘</div>
            </div>

            <div className="game-modal-card">
              <h1 className="game-modal-title">Shloka River Finale! 🌊</h1>
              <p className="game-modal-subtitle">
                Build all 8 sacred words, then arrange the complete shloka!
              </p>

              <div className="game-modal-icons">
                <div className="game-modal-icon-item">
                  <div style={{ fontSize: '80px' }}>🪨</div>
                  <span className="game-modal-icon-label">Build Words</span>
                </div>
                <div className="game-modal-icon-item">
                  <div style={{ fontSize: '80px' }}>⛵</div>
                  <span className="game-modal-icon-label">Arrange</span>
                </div>
                <div className="game-modal-icon-item">
                  <div style={{ fontSize: '80px' }}>📜</div>
                  <span className="game-modal-icon-label">Complete!</span>
                </div>
              </div>

              <button className="game-modal-button" onClick={handleStartGame}>
                Begin Journey!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          LEVEL 1: BUILD WORDS (Syllable Assembly)
          ======================================== */}
      {(gamePhase === 'level1' || gamePhase === 'word-complete') && currentWord && (
        <div className="level1-screen">
          <button className="back-btn" onClick={onBack}>← Back</button>

          {/* Progress */}
          <div className="level-header">
            <h2 className="level-title">🪨 Build the Sacred Words 🪨</h2>
            <div className="word-progress">
              Word {currentWordIndex + 1} of 8: <strong>{currentWord.word}</strong>
              <div className="progress-dots">
                {shlokaWords.map((_, i) => (
                  <span key={i} className={`progress-dot ${i < completedWords.length ? 'filled' : i === currentWordIndex ? 'active' : 'empty'}`}>
                    {i < completedWords.length ? '✓' : '○'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Hint */}
          <div className="hint-bubble">{hint}</div>

          {/* Lily Pad Slots */}
          <div className="lily-pad-container">
            <div className="lily-pads">
              {slots.map((syllable, index) => (
                <div
                  key={`slot-${index}`}
                  className={`lily-pad-slot ${syllable ? 'filled' : 'empty'} ${selectedSlot === index ? 'active' : ''}`}
                  onClick={() => handleSlotClick(index)}
                >
                  <div className="slot-number">{index + 1}</div>
                  {syllable && (
                    <div className="syllable-on-pad">
                      <span className="syllable-text">{syllable}</span>
                    </div>
                  )}
                  {!syllable && <div className="slot-placeholder">?</div>}
                </div>
              ))}
            </div>
          </div>

          {/* River Stones (Scrambled Syllables) */}
          <div className="river-stones-container">
            <p className="stones-label">🌊 Tap stones to place them 🌊</p>
            <div className="river-stones">
              {scrambledSyllables.map((syllable, index) => {
                const originalIndex = currentWord.syllables.indexOf(syllable);
                return (
                  <button
                    key={`syllable-${index}`}
                    className={`river-stone ${usedSyllables.includes(syllable) ? 'used' : 'available'}`}
                    onClick={() => handleSyllableClick(syllable, originalIndex)}
                    disabled={usedSyllables.includes(syllable)}
                  >
                    <span className="river-stone-text">{syllable}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Word Celebration */}
          {showCelebration && (
            <div className="celebration-overlay">
              <div className="celebration-message">
                <h3>{currentWord.word}! ✨</h3>
                <p>{currentWord.meaning}</p>
              </div>
              <div className="confetti-container">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="confetti-piece"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 0.5}s`
                    }}
                  >
                    ✨
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Level 1 Complete */}
      {gamePhase === 'level1-complete' && (
        <div className="level-complete-screen">
          <div className="ganesha-blessing">
            <div className="ganesha-emoji large">🐘</div>
          </div>
          <h2 className="complete-title">All 8 Words Built! 🎉</h2>
          <p className="complete-message">
            Now arrange them in the correct order to complete the sacred shloka!
          </p>
          <div className="words-grid">
            {completedWords.map(word => (
              <div key={word.id} className="completed-word-badge">
                {word.word}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================
          LEVEL 2: ARRANGE SHLOKA (Word Boats)
          ======================================== */}
      {(gamePhase === 'level2' || gamePhase === 'shloka-complete') && (
        <div className="level2-screen">
          <button className="back-btn" onClick={onBack}>← Back</button>

          <div className="level-header">
            <h2 className="level-title">⛵ Arrange the Complete Shloka ⛵</h2>
            <div className="shloka-progress">
              Words Placed: {usedWords.length} / 8
            </div>
          </div>

          {gamePhase === 'level2' && (
            <div className="hint-bubble">{hint}</div>
          )}

          {/* Word Boats (Shloka Slots) */}
          <div className="word-boats-container">
            <div className="boats-grid">
              {/* Line 1 */}
              <div className="shloka-line">
                {[0, 1, 2, 3].map(index => (
                  <div
                    key={`boat-${index}`}
                    className={`word-boat ${shlokaSlots[index] ? 'filled' : 'empty'} ${selectedShlokaSlot === index ? 'active' : ''} ${recitationIndex === index ? 'reciting' : ''}`}
                    onClick={() => gamePhase === 'level2' && handleShlokaSlotClick(index)}
                  >
                    <div className="boat-number">{index + 1}</div>
                    {shlokaSlots[index] && (
                      <div className="word-in-boat">
                        <span className="boat-word-text">{shlokaSlots[index].word}</span>
                      </div>
                    )}
                    {!shlokaSlots[index] && <div className="boat-placeholder">?</div>}
                  </div>
                ))}
              </div>

              {/* Line 2 */}
              <div className="shloka-line">
                {[4, 5, 6, 7].map(index => (
                  <div
                    key={`boat-${index}`}
                    className={`word-boat ${shlokaSlots[index] ? 'filled' : 'empty'} ${selectedShlokaSlot === index ? 'active' : ''} ${recitationIndex === index ? 'reciting' : ''}`}
                    onClick={() => gamePhase === 'level2' && handleShlokaSlotClick(index)}
                  >
                    <div className="boat-number">{index + 1}</div>
                    {shlokaSlots[index] && (
                      <div className="word-in-boat">
                        <span className="boat-word-text">{shlokaSlots[index].word}</span>
                      </div>
                    )}
                    {!shlokaSlots[index] && <div className="boat-placeholder">?</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Word Cards (Completed Words to Place) */}
          {gamePhase === 'level2' && (
            <div className="word-cards-container">
              <p className="cards-label">📜 Your completed words (tap to place) 📜</p>
              <div className="word-cards">
                {completedWords.map(word => (
                  <button
                    key={`card-${word.id}`}
                    className={`word-card ${usedWords.find(w => w.id === word.id) ? 'used' : 'available'}`}
                    onClick={() => handleWordClick(word)}
                    disabled={usedWords.find(w => w.id === word.id)}
                  >
                    <span className="word-card-text">{word.word}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shloka Complete Message */}
          {gamePhase === 'shloka-complete' && (
            <div className="shloka-complete-overlay">
              <h2 className="shloka-title">The Sacred Shloka! 🙏</h2>
              <p className="shloka-subtitle">Listen as Ganesha recites it...</p>
            </div>
          )}
        </div>
      )}

      {/* Scene Complete */}
      {gamePhase === 'scene-complete' && (
        <div className="scene-complete-screen">
          <div className="ganesha-blessing">
            <div className="ganesha-emoji huge">🐘</div>
          </div>
          <h1 className="final-title">Shloka River Complete! 🎉🌊</h1>
          <p className="final-message">
            You've mastered the sacred Ganesha Shloka!
          </p>

          <div className="final-shloka">
            {shlokaWords.map(word => (
              <div key={word.id} className="final-word">
                <strong>{word.word}</strong>
                <span>{word.meaning}</span>
              </div>
            ))}
          </div>

          <div className="final-buttons">
            <button className="final-btn replay" onClick={() => {
              setGamePhase('intro');
              setCurrentWordIndex(0);
              setCompletedWords([]);
              setShlokaSlots(Array(8).fill(null));
              setUsedWords([]);
            }}>
              Play Again 🔄
            </button>
            <button className="final-btn continue" onClick={onComplete}>
              Continue Journey! ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiverFinaleEnhanced;