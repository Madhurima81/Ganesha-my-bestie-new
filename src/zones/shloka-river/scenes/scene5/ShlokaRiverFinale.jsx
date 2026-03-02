// zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx
// SIMPLIFIED FEEDBACK SYSTEM
import React, { useState, useRef } from 'react';
import './RiverFinaleEnhanced.css';
import '../../../shared/components/OpeningModal.css'; // <--- SHARED MODAL IMPORT
import GamePauseMenu from '../../core/GamePauseMenu-river';
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { getOpeningModal } from '../../../../lib/config/content';


// Import background image
import bgImage from './assets/images/bg.png';

const ShlokaRiverFinale = ({ onComplete, onBack }) => {
  // Game state
  const [gamePhase, setGamePhase] = useState('intro');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([null, null, null, null]);
  const [usedSyllables, setUsedSyllables] = useState([]);
  const [completedWords, setCompletedWords] = useState([]);
  const [scrambledSyllables, setScrambledSyllables] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hint, setHint] = useState("Tap a lily pad to start!");

  // Simple feedback system
  const [slotFeedback, setSlotFeedback] = useState([]); // 'correct', 'wrong', or null
  const [showHearWordButton, setShowHearWordButton] = useState(false);
  const [showHearWordModal, setShowHearWordModal] = useState(false);
  const [highlightedModalSlot, setHighlightedModalSlot] = useState(null);

  // Level 2 state
  const [selectedShlokaSlot, setSelectedShlokaSlot] = useState(null);
  const [shlokaSlots, setShlokaSlots] = useState(Array(8).fill(null));
  const [usedWords, setUsedWords] = useState([]);

  // Add after existing state, before shlokaWords array:
  const [gameMode, setGameMode] = useState(null); // 'full-journey', 'practice', 'quick-play'
  const [selectedWordForPractice, setSelectedWordForPractice] = useState(null);
  const [selectedLevelMode, setSelectedLevelMode] = useState(null); // 'level1', 'level2', 'both'
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  const audioRef = useRef(null);

  // 8 Sanskrit words
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
      position: 0
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

  // Scramble syllables
  const scrambleSyllables = (syllables) => {
    const array = [...syllables];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Start game
  // REPLACE the existing handleStartGame with:
  const handleStartGame = () => {
    setGamePhase('mode-select'); // Go to mode selection instead of directly to level1
  };

  // ADD these new functions after handleStartGame:

  const handleModeSelect = (mode) => {
    setGameMode(mode);
    if (mode === 'full-journey') {
      setSelectedLevelMode('both');
      setGamePhase('level1');
      loadWord(0);
    } else if (mode === 'practice') {
      setGamePhase('word-select');
    } else if (mode === 'quick-play') {
      const randomIndex = Math.floor(Math.random() * 8);
      setSelectedWordForPractice(randomIndex);
      setSelectedLevelMode('both');
      setGamePhase('level1');
      loadWord(randomIndex);
    }
  };

  const handleWordSelect = (wordIndex) => {
    setSelectedWordForPractice(wordIndex);
    setGamePhase('level-select');
  };

  const handleLevelSelect = (level) => {
    setSelectedLevelMode(level);
    const wordIdx = selectedWordForPractice !== null ? selectedWordForPractice : 0;

    if (level === 'level1' || level === 'both') {
      setGamePhase('level1');
      loadWord(wordIdx);
    } else if (level === 'level2') {
      setCompletedWords(shlokaWords); // Pre-fill all words
      setGamePhase('level2');
      setHint("Arrange the words in the correct order!");
    }
  };

  // Pause Menu Handlers
  const handlePauseClick = () => setShowPauseMenu(true);
  const handleResume = () => setShowPauseMenu(false);
  const handleRestartGame = () => {
    setShowPauseMenu(false);
    if (gamePhase === 'level1') loadWord(currentWordIndex);
    else if (gamePhase === 'level2') {
      setShlokaSlots(Array(8).fill(null));
      setUsedWords([]);
      setShlokaFeedback([]);
      setShowHearShlokaButton(false);
    }
  };
  const handleChangeWord = () => { setShowPauseMenu(false); setGamePhase('word-select'); };
  const handleChangeLevel = () => { setShowPauseMenu(false); setGamePhase('level-select'); };
  const handleEndGame = () => { setShowPauseMenu(false); setGamePhase('scene-complete'); };

  // Load word
  const loadWord = (wordIndex) => {
    console.log("Loading word:", wordIndex);
    const word = shlokaWords[wordIndex];
    setCurrentWordIndex(wordIndex);
    setScrambledSyllables(scrambleSyllables(word.syllables));
    setSlots(Array(word.syllables.length).fill(null));
    setUsedSyllables([]);
    setSelectedSlot(null);
    setSlotFeedback([]);
    setShowHearWordButton(false);
    setHint(`Build word ${wordIndex + 1} of 8: Tap a lily pad!`);
  };

  // Play audio
  const playAudio = (audioPath) => {
    if (audioRef.current && audioPath) {
      audioRef.current.src = audioPath;
      audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
    }
  };

  // Handle slot click
  const handleSlotClick = (index) => {
    console.log("Slot clicked:", index);
    if (slots[index]) {
      // Slot filled - allow removal
      const syllableToRemove = slots[index];
      const newSlots = [...slots];
      newSlots[index] = null;
      setSlots(newSlots);
      setUsedSyllables(usedSyllables.filter(s => s !== syllableToRemove));
      setSlotFeedback([]); // Clear feedback when editing
      setShowHearWordButton(false); // Hide button when editing
      setHint("Syllable removed. Try again!");
    } else {
      // Empty slot - select it
      setSelectedSlot(index);
      setHint(`Slot ${index + 1} selected. Now tap a stone!`);
    }
  };

  // Handle syllable click
  const handleSyllableClick = (syllable, syllableIndex) => {
    console.log("Syllable clicked:", syllable);

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
    setHint("Great! Keep building the word!");

    // Check if word is complete
    const allFilled = newSlots.every(slot => slot !== null);
    if (allFilled) {
      checkWord(newSlots);
    }
  };

  // SIMPLIFIED: Check word and show tick/cross feedback
  const checkWord = (currentSlots) => {
    const currentWord = shlokaWords[currentWordIndex];

    // Generate feedback for each slot
    const feedback = currentSlots.map((slot, idx) =>
      slot === currentWord.syllables[idx] ? 'correct' : 'wrong'
    );

    setSlotFeedback(feedback);

    const allCorrect = feedback.every(f => f === 'correct');

    // FIND the checkWord function and UPDATE the section after "ALL CORRECT!":

    if (allCorrect) {
      setHint(`Perfect! You built "${currentWord.word}"! 🎉`);
      setShowHearWordButton(false);

      setTimeout(() => {
        setShowCelebration(true);
        playAudio(currentWord.wordAudio);
      }, 500);

      setTimeout(() => {
        setShowCelebration(false);
        const newCompletedWords = [...completedWords, currentWord];
        setCompletedWords(newCompletedWords);

        // CHECK GAME MODE FOR PROGRESSION
        if (gameMode === 'full-journey') {
          // Full journey - advance through all words
          if (currentWordIndex < 7) {
            loadWord(currentWordIndex + 1);
          } else {
            setGamePhase('level1-complete');
            setTimeout(() => {
              setGamePhase('level2');
              setHint("Arrange the words in the correct order!");
            }, 3000);
          }
        } else if (gameMode === 'practice' && selectedLevelMode === 'both') {
          // Practice mode with both levels - go to level 2 with just this word
          setGamePhase('level2');
          setHint("Now arrange the shloka!");
        } else {
          // Single level practice or quick play - end game
          setGamePhase('scene-complete');
        }
      }, 3500);

    } else {
      // SOME WRONG - Show "Hear Word" button
      setShowHearWordButton(true);
      setHint("Not quite right! Tap wrong syllables to fix them, or press 'Hear Word' for help!");
    }
  };

  // MODAL: Play word with highlights in popup showing correct arrangement
  const handleHearWord = async () => {
    const currentWord = shlokaWords[currentWordIndex];

    // Show modal with correct syllables
    setShowHearWordModal(true);

    // Wait a moment for modal to appear
    await new Promise(resolve => setTimeout(resolve, 300));

    // Play syllables one by one with highlights
    for (let i = 0; i < currentWord.syllables.length; i++) {
      // Highlight current syllable in modal
      setHighlightedModalSlot(i);

      // Play syllable audio
      playAudio(currentWord.syllableAudio[i]);

      // Wait for syllable duration
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    // Clear highlight and keep modal open for a moment
    setHighlightedModalSlot(null);

    // Wait then close modal
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowHearWordModal(false);

    setHint("Now tap the red ✗ syllables to remove them and try again!");
  };

  // Level 2: Handle boat slot click
  const handleShlokaSlotClick = (index) => {
    if (shlokaSlots[index]) {
      const wordToRemove = shlokaSlots[index];
      const newSlots = [...shlokaSlots];
      newSlots[index] = null;
      setShlokaSlots(newSlots);
      setUsedWords(usedWords.filter(w => w.id !== wordToRemove.id));
      setHint("Word removed. Try again!");
    } else {
      setSelectedShlokaSlot(index);
      setHint(`Boat ${index + 1} selected. Now tap a word scroll!`);
    }
  };

  // Level 2: Handle word click
  const handleWordClick = (word) => {
    if (usedWords.find(w => w.id === word.id)) {
      setHint("You already used that word!");
      return;
    }

    if (selectedShlokaSlot === null) {
      setHint("First, tap an empty boat! ⛵");
      return;
    }

    // Play word audio
    playAudio(word.wordAudio);

    const newSlots = [...shlokaSlots];
    newSlots[selectedShlokaSlot] = word;
    setShlokaSlots(newSlots);
    setUsedWords([...usedWords, word]);
    setSelectedShlokaSlot(null);
    setHint("Excellent! Keep arranging the shloka!");

    const allFilled = newSlots.every(slot => slot !== null);
    if (allFilled) {
      checkShloka(newSlots);
    }
  };

  // Check shloka
  const checkShloka = (currentSlots) => {
    const isCorrect = currentSlots.every((slot, idx) => slot && slot.position === idx);

    if (isCorrect) {
      setGamePhase('shloka-complete');
      setTimeout(() => {
        setGamePhase('scene-complete');
      }, 3000);
    } else {
      setHint("Not quite right! Try arranging the words differently.");
    }
  };

  const currentWord = shlokaWords[currentWordIndex] || shlokaWords[0];

  return (
    <div className="river-finale-container">
      {/* Background */}
      <div
        className="river-bg"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      <audio ref={audioRef} />

      {/* INTRO SCREEN */}
      {gamePhase === 'intro' && (
        <OpeningModal
          zoneId="shloka-river"
          sceneId="shloka-river-finale"
          onStart={handleStartGame}
          characterImg={'ganeshaHeadphones'}
          showButton={true}
        />
      )}

      {/* MODE SELECTION SCREEN */}
      {gamePhase === 'mode-select' && (
        <div className="game-screen selection-screen">
          <div className="selection-modal">
            <h2 className="selection-title">🌊 Choose Your Journey 🌊</h2>

            <div className="selection-options">
              <button className="selection-btn journey" onClick={() => handleModeSelect('full-journey')}>
                <span className="selection-icon">🎯</span>
                <div className="selection-content">
                  <h3>Full Journey</h3>
                  <p>Master all 8 sacred words!</p>
                </div>
              </button>

              <button className="selection-btn practice" onClick={() => handleModeSelect('practice')}>
                <span className="selection-icon">📚</span>
                <div className="selection-content">
                  <h3>Practice Mode</h3>
                  <p>Choose specific word & level</p>
                </div>
              </button>

              <button className="selection-btn quick" onClick={() => handleModeSelect('quick-play')}>
                <span className="selection-icon">🎲</span>
                <div className="selection-content">
                  <h3>Quick Play</h3>
                  <p>Random word practice</p>
                </div>
              </button>
            </div>

            <button className="selection-back-btn" onClick={onBack}>← Back to Map</button>
          </div>
        </div>
      )}

      {/* WORD SELECTION SCREEN */}
      {gamePhase === 'word-select' && (
        <div className="game-screen selection-screen">
          <div className="selection-modal wide">
            <h2 className="selection-title">Choose a Word to Practice</h2>

            <div className="word-selection-grid">
              {shlokaWords.map((word, index) => (
                <button
                  key={word.id}
                  className="word-select-btn"
                  onClick={() => handleWordSelect(index)}
                >
                  <span className="word-select-number">{index + 1}</span>
                  <span className="word-select-name">{word.word}</span>
                  <span className="word-select-meaning">{word.meaning}</span>
                </button>
              ))}
            </div>

            <button className="selection-back-btn" onClick={() => setGamePhase('mode-select')}>
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* LEVEL SELECTION SCREEN */}
      {gamePhase === 'level-select' && (
        <div className="game-screen selection-screen">
          <div className="selection-modal">
            <h2 className="selection-title">What do you want to practice?</h2>
            <p className="selection-subtitle">
              Word: {shlokaWords[selectedWordForPractice]?.word} ({shlokaWords[selectedWordForPractice]?.meaning})
            </p>

            <div className="selection-options">
              <button className="selection-btn level1" onClick={() => handleLevelSelect('level1')}>
                <span className="selection-icon">🪷</span>
                <div className="selection-content">
                  <h3>Build Word</h3>
                  <p>Level 1: Syllable practice</p>
                </div>
              </button>

              <button className="selection-btn level2" onClick={() => handleLevelSelect('level2')}>
                <span className="selection-icon">⛵</span>
                <div className="selection-content">
                  <h3>Arrange Shloka</h3>
                  <p>Level 2: Word order</p>
                </div>
              </button>

              <button className="selection-btn both" onClick={() => handleLevelSelect('both')}>
                <span className="selection-icon">🌊</span>
                <div className="selection-content">
                  <h3>Both Levels</h3>
                  <p>Complete practice</p>
                </div>
              </button>
            </div>

            <button className="selection-back-btn" onClick={() => setGamePhase('word-select')}>
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* LEVEL 1 SCREEN */}
      {gamePhase === 'level1' && (
        <div className="game-screen level1-game">
          <button className="game-back-btn" onClick={onBack}>← Back</button>
          {/* Add this button right after the "Back" button in both level1-game and level2-game: */}
          <button className="game-pause-btn" onClick={handlePauseClick}>⏸️</button>

          <div className="game-header">
            <h2 className="game-title">🪷 Build the Sacred Words 🪷</h2>
            <div className="game-progress">Word {currentWordIndex + 1} of 8</div>
          </div>

          <div className="game-hint">{hint}</div>

          {/* HEAR WORD BUTTON - Only shows when there are mistakes */}
          {showHearWordButton && (
            <button className="hear-word-btn" onClick={handleHearWord}>
              🔊 Hear Word
            </button>
          )}


          {/* Lily Pads with Simple Tick/Cross Feedback */}
          <div className="lily-pads-area">
            {slots.map((syllable, index) => (
              <div
                key={`slot-${index}`}
                className={`lily-pad ${syllable ? 'filled' : 'empty'} ${selectedSlot === index ? 'selected' : ''}`}
                onClick={() => handleSlotClick(index)}
              >
                <span className="lily-number">{index + 1}</span>
                {syllable ? (
                  <div className="syllable-stone">
                    <span>{syllable}</span>
                    {/* SIMPLE FEEDBACK ICONS - Only tick or cross */}
                    {slotFeedback[index] === 'correct' && (
                      <span className="feedback-icon correct">✓</span>
                    )}
                    {slotFeedback[index] === 'wrong' && (
                      <span className="feedback-icon wrong">✗</span>
                    )}
                  </div>
                ) : (
                  <span className="lily-placeholder">?</span>
                )}
              </div>
            ))}
          </div>

          {/* HEAR WORD MODAL - Shows correct syllables */}
          {showHearWordModal && (
            <div className="hear-word-modal-overlay">
              <div className="hear-word-modal">
                <div className="modal-title-section">
                  <h3>Listen and Learn! 🎧</h3>
                  <p>This is the correct word:</p>
                </div>
                <div className="modal-syllables">
                  {currentWord.syllables.map((syllable, index) => (
                    <div
                      key={`modal-syllable-${index}`}
                      className={`modal-syllable ${highlightedModalSlot === index ? 'highlighted' : ''}`}
                    >
                      <span className="modal-slot-number">{index + 1}</span>
                      <span className="modal-syllable-text">{syllable}</span>
                    </div>
                  ))}
                </div>
                <div className="modal-word-meaning">
                  <strong>{currentWord.word}</strong>
                  <span>{currentWord.meaning}</span>
                </div>
              </div>
            </div>
          )}

          {/* River Stones */}
          <div className="river-stones-area">
            <p className="stones-label">🌊 Tap stones to place them 🌊</p>
            <div className="river-stones">
              {scrambledSyllables.map((syllable, index) => {
                const originalIndex = currentWord.syllables.indexOf(syllable);
                return (
                  <button
                    key={`stone-${index}`}
                    className={`river-stone ${usedSyllables.includes(syllable) ? 'used' : 'available'}`}
                    onClick={() => handleSyllableClick(syllable, originalIndex)}
                    disabled={usedSyllables.includes(syllable)}
                  >
                    {syllable}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Celebration */}
          {showCelebration && (
            <div className="celebration-popup">
              <div className="celebration-content">
                <h3>{currentWord.word}! ✨</h3>
                <p>{currentWord.meaning}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LEVEL 1 COMPLETE */}
      {gamePhase === 'level1-complete' && (
        <div className="game-screen complete-screen">
          <div className="complete-ganesha">🐘</div>
          <h2 className="complete-title">All 8 Words Built! 🎉</h2>
          <p className="complete-message">
            Now arrange them in the correct order to complete the sacred shloka!
          </p>
        </div>
      )}

      {/* LEVEL 2 SCREEN */}
      {(gamePhase === 'level2' || gamePhase === 'shloka-complete') && (
        <div className="game-screen level2-game">
          <button className="game-back-btn" onClick={onBack}>← Back</button>
          {/* Add this button right after the "Back" button in both level1-game and level2-game: */}
          <button className="game-pause-btn" onClick={handlePauseClick}>⏸️</button>

          <div className="game-header">
            <h2 className="game-title">⛵ Arrange the Complete Shloka ⛵</h2>
            <div className="game-progress">Words Placed: {usedWords.length} / 8</div>
          </div>

          {gamePhase === 'level2' && (
            <div className="game-hint">{hint}</div>
          )}

          {/* Word Boats */}
          <div className="boats-area">
            <div className="boats-line">
              {[0, 1, 2, 3].map(index => (
                <div
                  key={`boat-${index}`}
                  className={`word-boat ${shlokaSlots[index] ? 'filled' : 'empty'} ${selectedShlokaSlot === index ? 'selected' : ''}`}
                  onClick={() => gamePhase === 'level2' && handleShlokaSlotClick(index)}
                >
                  <span className="boat-number">{index + 1}</span>
                  {shlokaSlots[index] ? (
                    <span className="boat-word">{shlokaSlots[index].word}</span>
                  ) : (
                    <span className="boat-placeholder">?</span>
                  )}
                </div>
              ))}
            </div>
            <div className="boats-line">
              {[4, 5, 6, 7].map(index => (
                <div
                  key={`boat-${index}`}
                  className={`word-boat ${shlokaSlots[index] ? 'filled' : 'empty'} ${selectedShlokaSlot === index ? 'selected' : ''}`}
                  onClick={() => gamePhase === 'level2' && handleShlokaSlotClick(index)}
                >
                  <span className="boat-number">{index + 1}</span>
                  {shlokaSlots[index] ? (
                    <span className="boat-word">{shlokaSlots[index].word}</span>
                  ) : (
                    <span className="boat-placeholder">?</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Word Cards */}
          {gamePhase === 'level2' && (
            <div className="word-cards-area">
              <p className="cards-label">📜 Your completed words (tap to place) 📜</p>
              <div className="word-cards">
                {completedWords.map(word => (
                  <button
                    key={`card-${word.id}`}
                    className={`word-card ${usedWords.find(w => w.id === word.id) ? 'used' : 'available'}`}
                    onClick={() => handleWordClick(word)}
                    disabled={usedWords.find(w => w.id === word.id)}
                  >
                    {word.word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shloka Complete */}
          {gamePhase === 'shloka-complete' && (
            <div className="shloka-popup">
              <h2>The Sacred Shloka! 🙏</h2>
              <p>Listen as Ganesha recites it...</p>
            </div>
          )}
        </div>
      )}

      {/* SCENE COMPLETE */}
      {gamePhase === 'scene-complete' && (
        <div className="game-screen final-screen">
          <div className="final-ganesha">🐘</div>
          <h1 className="final-title">Shloka River Complete! 🎉🌊</h1>
          <p className="final-message">You've mastered the sacred Ganesha Shloka!</p>

          <div className="final-shloka">
            {shlokaWords.map(word => (
              <div key={word.id} className="final-word-item">
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

      {/* Add at the end, just before the final closing </div> of river-finale-container: */}
      <GamePauseMenu
        show={showPauseMenu}
        gameName="Shloka River"
        onResume={handleResume}
        onRestart={handleRestartGame}
        onBackToModes={() => { setShowPauseMenu(false); setGamePhase('mode-select'); }}
        onChangeWord={gameMode === 'practice' ? handleChangeWord : null}
        onChangeLevel={gameMode === 'practice' ? handleChangeLevel : null}
        onComplete={handleEndGame}
      />
    </div>
  );
};

export default ShlokaRiverFinale;
