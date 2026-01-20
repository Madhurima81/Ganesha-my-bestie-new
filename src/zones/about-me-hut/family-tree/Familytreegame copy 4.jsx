import React, { useState, useRef } from 'react';
import './FamilyTreeGame.css';
import '../../shared/components/OpeningModal.css'; // <--- SHARED MODAL IMPORT
import AboutMeCompletion from "../components/Aboutmecompletion";

// Import images
import familyTreeBg from './assets/images/family tree bg.png';
import familyTree from './assets/images/family-tree.png';
import babyGaneshaImg from './assets/images/baby-ganesha.png';
import shivaImg from './assets/images/shiva.png';
import parvatiImg from './assets/images/parvati.png';
import kartikeyaImg from './assets/images/kartikeya.png';

const FamilyTreeGame = ({ onComplete, onBack }) => {
  // Game phases
  const [gamePhase, setGamePhase] = useState('intro');
  
  // Ganesha's tree state
  const [placedGaneshaMembers, setPlacedGaneshaMembers] = useState(new Set());
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [currentChoices, setCurrentChoices] = useState([]);
  const [wrongChoice, setWrongChoice] = useState(null);
  const [showFunFactModal, setShowFunFactModal] = useState(null);
  const [flippedMember, setFlippedMember] = useState(null);
  // new: scene return state ('idle' | 'scaling' | 'fading' | 'tray' | 'done')
const [sceneReturnState, setSceneReturnState] = useState('idle');
const [isReturning, setIsReturning] = useState(false);
const [showBottomTray, setShowBottomTray] = useState(false);
const [showYouGotIt, setShowYouGotIt] = useState(null); // Stores which choice ID

// 1. ADD THESE TWO LINES:
const [deletableMemberIndex, setDeletableMemberIndex] = useState(null); // Tracks which member shows the 'X'
const longPressTimer = useRef(null); // Holds the timer ID

  const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);

  const [showTreeSparkles, setShowTreeSparkles] = useState(false);
  // Tracks which members have been tapped/flipped at least once
const [tappedMembers, setTappedMembers] = useState(new Set());

// Add this with your other useState hooks
const [correctChoiceId, setCorrectChoiceId] = useState(null); // Tracks the card to pop
const [justPlacedId, setJustPlacedId] = useState(null); // Tracks the tree node to sparkle
  const [showCelebration, setShowCelebration] = useState(null);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [disabledChoices, setDisabledChoices] = useState(new Set());
    const [showSceneCompletion, setShowSceneCompletion] = useState(false);

  // Existing state - no change needed

  // Child's family state
  const [childFamily, setChildFamily] = useState([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [currentFamilyType, setCurrentFamilyType] = useState(null);
  const [callName, setCallName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Ganesha's family members
const ganeshaFamily = [
    {
      id: 'father',
      role: 'Father',
      correctAnswer: 'shiva',
      position: { top: '20%', left: '15%' },
      
      // 1. INFO MODAL (Quick Text)
      introTitle: '🔱 My Father!',
      introText: 'He is calm and strong 🕉️',
      
      // 2. FLIPPED CARD (Richer Text)
      flipTitle: 'My Father',
      funFact: 'My father is calm and strong. He protects us and teaches me peace 🕉️'
    },
    {
      id: 'mother',
      role: 'Mother',
      correctAnswer: 'parvati',
      position: { top: '20%', right: '15%' },
      
      // 1. INFO MODAL
      introTitle: '🌸 My Mother!',
      introText: 'She is kind and loving 💗',
      
      // 2. FLIPPED CARD
      flipTitle: 'My Mother',
      funFact: 'My mother is kind and loving. She gives the best hugs and keeps me safe 💗'
    },
    {
      id: 'brother',
      role: 'Brother',
      correctAnswer: 'kartikeya',
      position: { bottom: '25%', left: '15%' },
      
      // 1. INFO MODAL
      introTitle: '🦚 My Brother!',
      introText: 'He is brave and fast 🦚',
      
      // 2. FLIPPED CARD
      flipTitle: 'My Brother',
      funFact: 'My brother is very brave. He travels the world on his peacock 🦚'
    },
     {
      id: 'myself',
      role: 'Me',
      correctAnswer: 'ganesha',
      position: { bottom: '25%', right: '15%' },
      
      // 1. INFO MODAL
      introTitle: '😊 That’s Me!',
      introText: 'I love modaks 🍬',
      
      // 2. FLIPPED CARD
      flipTitle: 'Me',
      funFact: 'That’s me! I love modaks and helping my friends 😊'
    }
  ];

  // Deity choices
// Update your deityChoices like this:
  const deityChoices = {
    father: [
      // Add type: 'img' for the real images
      { id: 'shiva', name: 'Shiva Ji', image: shivaImg, type: 'img',  isCorrect: true },
      // Add type: 'emoji' for the emojis
      { id: 'vishnu', name: 'Vishnu Ji', image: '🔱', type: 'emoji',  isCorrect: false },
      { id: 'brahma', name: 'Brahma Ji', image: '🪷', type: 'emoji',  isCorrect: false }
    ],
    mother: [
      { id: 'parvati', name: 'Parvati Mata', image: parvatiImg, type: 'img',  isCorrect: true },
      { id: 'lakshmi', name: 'Lakshmi Mata', image: '💰', type: 'emoji',  isCorrect: false },
      { id: 'saraswati', name: 'Saraswati Mata', image: '📚', type: 'emoji',  isCorrect: false }
    ],
    brother: [
      { id: 'kartikeya', name: 'Kartikeya', image: kartikeyaImg, type: 'img',  isCorrect: true },
      { id: 'hanuman', name: 'Hanuman Ji', image: '🐒', type: 'emoji', isCorrect: false },
      { id: 'krishna', name: 'Krishna Ji', image: '🪈', type: 'emoji',  isCorrect: false }
    ],
     myself: [
      { id: 'ganesha', name: 'Ganesha', image: babyGaneshaImg, type: 'img', subtitle: 'That\'s Me!', isCorrect: true },
      { id: 'mushak', name: 'Mushak', image: '🐭', type: 'emoji', isCorrect: false },
      { id: 'nandi', name: 'Nandi', image: '🐮', type: 'emoji',  isCorrect: false }
    ]
  };

  // Child's family types
const familyMemberTypes = [
  { id: 'dad', label: 'Dad', emoji: '👨', color: '#6BB6FF', row: 2 },
  { id: 'mom', label: 'Mom', emoji: '👩', color: '#FF8FB1', row: 2 },

  { id: 'grandparent-m', label: 'Grandparent', emoji: '👴', color: '#BEE7D8', row: 1 },
  { id: 'grandparent-f', label: 'Grandparent', emoji: '👵', color: '#F7C6D9', row: 1 },

  { id: 'brother', label: 'Brother', emoji: '👦', color: '#7EDC9A', row: 3 },
  { id: 'sister', label: 'Sister', emoji: '👧', color: '#FFA6C9', row: 3 },

  { id: 'myself', label: 'Myself', emoji: '😊', color: '#FFD966', row: 3 },
  { id: 'pet', label: 'Pet', emoji: '🐕', color: '#F2D3A2', row: 3 }
];


  // Handlers
  const handleStartGame = () => setGamePhase('ganeshaTree');

const handleClickCircle = (circleId) => {
  // BLOCK if sequence is playing
  if (isSequencePlaying) {
    return; // Do nothing!
  }
  
  // BLOCK if modals are open
  if (showFunFactModal || showChoiceModal) {
    return;
  }
  
// If clicking a placed deity, toggle BIG flip card
  if (placedGaneshaMembers.has(circleId)) {
    setFlippedMember(flippedMember === circleId ? null : circleId);

      // Mark this member as 'tapped' so the hint disappears
    setTappedMembers(prev => {
      const newSet = new Set(prev);
      newSet.add(circleId);
      return newSet;
    });
    return;
  }

setDisabledChoices(new Set()); // Clear previous wrong guesses

  // If clicking empty circle, open choice modal
  setSelectedCircle(circleId);
  setCurrentChoices(deityChoices[circleId]);
  setShowChoiceModal(true);
  setWrongChoice(null);
};

  /*const handleChoiceSelection = (choice) => {
    if (choice.isCorrect) {
      setShowChoiceModal(false);
      const member = ganeshaFamily.find(m => m.id === selectedCircle);
      const correctDeity = deityChoices[selectedCircle].find(d => d.isCorrect);
      setShowFunFactModal({ ...member, ...correctDeity });
      const newPlaced = new Set(placedGaneshaMembers);
      newPlaced.add(selectedCircle);
      setPlacedGaneshaMembers(newPlaced);
      setTimeout(() => {
        setShowFunFactModal(null);
        if (newPlaced.size === ganeshaFamily.length) {
          setTimeout(() => setGamePhase('transition'), 1000);
        }
      }, 4000);
    } else {
      setWrongChoice(choice.id);
      setTimeout(() => setWrongChoice(null), 1500);
    }
  };*/

const handleChoiceSelection = (choice) => {
  if (choice.isCorrect) {
    // BLOCK all interactions during sequence
    setIsSequencePlaying(true);
    
    // STEP 1: Show "You got it!" (0ms)
    setShowYouGotIt(choice.id);
    
    // STEP 2: Checkmark appears (800ms)
    setTimeout(() => {
      setCorrectChoiceId(choice.id);
    }, 800);
    
    // STEP 3: Hide text, start fade (1400ms)
    setTimeout(() => {
      setShowYouGotIt(null);
    }, 1400);
    
    // STEP 4: Close modal, show deity (1600ms)
    setTimeout(() => {
      setShowChoiceModal(false);
      
      const newPlaced = new Set(placedGaneshaMembers);
      newPlaced.add(selectedCircle);
      setPlacedGaneshaMembers(newPlaced);
      
      setCorrectChoiceId(null);
    }, 1600);
    
    // STEP 5: Circle glows briefly (1700ms)
    setTimeout(() => {
      setJustPlacedId(selectedCircle);
    }, 1700);
    
    // STEP 6: Open fun fact modal SMOOTHLY (2200ms - shorter gap!)
    setTimeout(() => {
      const member = ganeshaFamily.find(m => m.id === selectedCircle);
      const correctDeity = deityChoices[selectedCircle].find(d => d.isCorrect);
      setShowFunFactModal({ ...member, ...correctDeity });
      
      setJustPlacedId(null);
    }, 2200); // Reduced from 5000ms!
    
  } else {
    // Wrong answer
    setWrongChoice(choice.id);
    
    setTimeout(() => {
      setWrongChoice(null);
      
      /*setDisabledChoices(prev => {
        const newDisabled = new Set(prev);
        newDisabled.add(choice.id);
        return newDisabled;
      });*/

      // --- ADD THIS BLOCK ---
      setDisabledChoices(prev => {
        const newSet = new Set(prev);
        newSet.add(choice.id);
        return newSet;
      });
      // ----------------------
    }, 1500);
  }
};

const handleCloseFunFact = () => {
  setShowFunFactModal(null);
  setIsSequencePlaying(false);
  
  // DON'T auto-advance anymore
  // Just close the modal, let user click Done button when ready
};

/*const handleGaneshaTreeDone = () => {
  // 1. Show sparkles
  setShowTreeSparkles(true);
  
  // 2. After sparkles peak (400ms), start transition overlay
  setTimeout(() => {
    setShowCelebration('all-complete');
  }, 400);
  
  // 3. Fade out sparkles (1500ms)
  setTimeout(() => {
    setShowTreeSparkles(false);
  }, 1500);
  
  // 4. Transition to next phase (3000ms)
  setTimeout(() => {
    setShowCelebration(null);
    setGamePhase('transition');
  }, 3000);
};*/

const handleGaneshaTreeDone = () => {
  // 1. Start sparkles immediately
  setShowTreeSparkles(true);
  
  // 2. Wait 2.5 seconds (or however long you want the joy to last)
  // The sparkles will keep looping during this time because of CSS 'infinite'
  setTimeout(() => {
    // 3. Switch directly to transition phase
    // The sparkles disappear naturally because the GaneshaTree scene unmounts
    setGamePhase('transition'); 
    
    // 4. Reset sparkles state just for cleanup (optional)
    setShowTreeSparkles(false);
    setShowCelebration(null); // Ensure no old overlays linger
  }, 2500); 
};

  const handleSelectFamilyType = (type) => {
    setCurrentFamilyType(type);
    setCallName('');
    setAudioBlob(null);
    setShowNameModal(true);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAddFamilyMember = () => {
    if (!callName.trim() && !audioBlob) return;
    const newMember = {
      ...currentFamilyType,
      callName: callName.trim() || 'My ' + currentFamilyType.label,
      audioBlob
    };
    setChildFamily([...childFamily, newMember]);
    setShowNameModal(false);
    setCurrentFamilyType(null);
    setCallName('');
    setAudioBlob(null);
  };

  const getPlacedDeityImage = (memberId) => {
    const member = ganeshaFamily.find(m => m.id === memberId);
    if (!member) return null;
    return deityChoices[memberId].find(d => d.isCorrect);
  };

  const getFamilyByRow = (rowNumber) => childFamily.filter(m => m.row === rowNumber);

  // SceneReturnTransition orchestrator
// SceneReturnTransition orchestrator
 /*const handleSceneReturnTransition = () => {
  // 0. Disable button immediately
  setIsReturning(true);
  
  // 1. Start: Shrink the Card (0ms)
  setSceneReturnState('scaling');

  // 2. 160ms later: Start Fading Overlay
  setTimeout(() => {
    setSceneReturnState('fading');
  }, 160);

  // 3. 400ms later: Switch to Game Screen & Trigger Tray Slide Up
  setTimeout(() => {
    setGamePhase('childInput'); // Switch to game screen (so it renders behind overlay)
    setSceneReturnState('tray-up');
  }, 400);

  // 4. 800ms later: Finish (Snap tree to sharp, remove overlay)
  setTimeout(() => {
    setSceneReturnState('finished');
    setIsReturning(false); // Re-enable interactions
  }, 800);
};*/

const handleSceneReturnTransition = () => {
  // Just switch to the next scene - that's it!
  setGamePhase('childInput');
  setShowBottomTray(true);
};

// 2. ADD THESE HELPER FUNCTIONS:
  
  const handlePressStart = (index) => {
    // Start a timer when user touches/clicks
    longPressTimer.current = setTimeout(() => {
      setDeletableMemberIndex(index);
      // Optional: Add a tiny vibration on mobile for feedback
      if (navigator.vibrate) navigator.vibrate(50);
    }, 800); // 800ms = Long Press
  };

  const handlePressEnd = () => {
    // If user lets go before 800ms, cancel the timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Close delete mode if clicking anywhere else on the background
  const handleBackgroundClick = () => {
    setDeletableMemberIndex(null);
  };

const handleMemberClick = (index, e) => {
    e.stopPropagation(); // Prevent background click
    // If clicking the same one, toggle it off. Otherwise, select it.
    if (selectedMemberIndex === index) {
      setSelectedMemberIndex(null);
    } else {
      setSelectedMemberIndex(index);
    }
  };


  return (
    <div className="family-tree-game">
      <img src={familyTreeBg} alt="Background" className="tree-background" />

      {/*{gamePhase !== 'intro' && gamePhase !== 'celebration' && (
        <div className="part-indicator">Part 1: Ganesha's Family 👨‍👩‍👦</div>
      )}*/}

      {/* INTRO */}
{/* INTRO PHASE */}
      {gamePhase === 'intro' && (
         <>
          {/* 1. SHOW TREE IN BACKGROUND */}
          <div className="ganesha-tree-wrapper">
            <img src={familyTree} alt="Family Tree" className="tree-overlay" />
          </div>
        // ADD THE ID HERE 👇
        <div className="game-modal-overlay" id="family-tree-intro"> 
          <div className="game-modal-content">
            
            {/* Character */}
            <div className="game-modal-character">
              <img src={babyGaneshaImg} alt="Baby Ganesha" />
            </div>

            {/* Card */}
            <div className="game-modal-card">
              <h1 className="game-modal-title">Meet My Family</h1>
      <p className="game-modal-subtitle">
  This is my family.<br />
  They make me who I am.<br />
  After that, I'd love to meet yours too 💛
</p>

              {/* Icons */}
              <div className="game-modal-icons">
                <div className="game-modal-icon-item">
                  <img src={shivaImg} alt="Father" />
                  <span className="game-modal-icon-label">Father</span>
                </div>
                <div className="game-modal-icon-item">
                  <img src={parvatiImg} alt="Mother" />
                  <span className="game-modal-icon-label">Mother</span>
                </div>
                <div className="game-modal-icon-item">
                  <img src={kartikeyaImg} alt="Brother" />
                  <span className="game-modal-icon-label">Brother</span>
                </div>
              </div>

              <button className="game-modal-button" onClick={handleStartGame}>
                Meet My Family! 🌟
              </button>
            </div>
          </div>
        </div>
                </>

      )}

      {/* GANESHA'S TREE */}
      {gamePhase === 'ganeshaTree' && (
        <>
          <button className="back-btn" onClick={onBack}>← Back</button>
  {/* === NEW HEART HEADER === */}
<div className="game-header-hud">
  
  {/* 1. TEXT BUBBLE (Hides after 2 members are placed) */}
  {placedGaneshaMembers.size < 2 && (
    <div className="hud-instruction-bubble">
      👉 Tap a circle to meet my family!
    </div>
  )}

  {/* 2. HEART TRACKER (Always visible, inside header area) */}
  <div className="hud-hearts-row">
    {ganeshaFamily.map((m, i) => (
      <span 
        key={i} 
        className={`heart-icon ${placedGaneshaMembers.has(m.id) ? 'filled' : ''}`}
      >
        {placedGaneshaMembers.has(m.id) ? '❤️' : '🤍'} 
      </span>
    ))}
  </div>

</div>

          
          {/* Tree overlay */}
{/* Tree overlay */}
          <img 
            src={familyTree} 
            alt="Family Tree" 
            className={`tree-overlay ${sceneReturnState === 'finished' || sceneReturnState === 'idle' ? 'sharp' : 'blurred'}`} 
          />

         

          {/* Circle spots */}
            {ganeshaFamily.map(member => (
              <div
                key={member.id}
                
  className={`circle-spot-with-label ${isSequencePlaying ? 'blocked' : ''}`}
  style={member.position}
  onClick={() => handleClickCircle(member.id)}
>
              
                {/* 1. Empty State (Uses CSS animation) */}
      {!placedGaneshaMembers.has(member.id) ? (
  <div className="empty-circle" />
) : (
  <div className={`placed-deity ${justPlacedId === member.id ? 'just-placed-glow' : ''}`}>
    <div className="deity-front">
      <div className="deity-circle">
        {getPlacedDeityImage(member.id)?.type === 'img' ? (
          <img src={getPlacedDeityImage(member.id).image} alt="Deity" className="deity-image" />
        ) : (
          <span className="deity-emoji">{getPlacedDeityImage(member.id)?.image}</span>
        )}
      </div>
      
      {/* Add subtle hint */}
 {/* UPDATE THIS SECTION */}
      {/* Only show "Tap!" if user hasn't tapped it yet */}
      {!tappedMembers.has(member.id) && (
        <div className="tap-to-learn">👆 Tap!</div>
      )}    </div>
    
    {/* Sparkles during glow */}
    {justPlacedId === member.id && (
      <div className="circle-celebration-sparkles">
        <span className="circle-sparkle cs-1">✨</span>
        <span className="circle-sparkle cs-2">⭐</span>
        <span className="circle-sparkle cs-3">✨</span>
        <span className="circle-sparkle cs-4">⭐</span>
      </div>
    )}
  </div>
)}
                
                {/* Label */}
                <div className="circle-label">{member.role}</div>
              </div>
            ))}

          {/* Choice Modal */}
          {showChoiceModal && (
            <div className="modal-overlay" >
              <div className="choice-modal">
                <button className="modal-close-btn" onClick={() => setShowChoiceModal(false)}>×</button>
             <h2 className="choice-title">
                  {/* Logic: If it's 'myself', say "Who is Ganesha?", otherwise say "Who is Ganesha's [Role]?" */}
                  {ganeshaFamily.find(m => m.id === selectedCircle)?.id === 'myself' 
                    ? "Who is Ganesha? 🤔" 
                    : `Who is Ganesha's ${ganeshaFamily.find(m => m.id === selectedCircle)?.role}? 🤔`
                  }
                </h2>
<div className="choice-options">
{currentChoices.map(choice => (
  <button
    key={choice.id}
    className={`choice-card ${wrongChoice === choice.id ? 'wrong-shake' : ''} ${correctChoiceId === choice.id ? 'correct-card-hit' : ''}`}
    onClick={() => handleChoiceSelection(choice)}
// --- UPDATED DISABLED LOGIC ---
    disabled={
      disabledChoices.has(choice.id) ||     // Is this specific card disabled?
      wrongChoice !== null ||               // Is a shake animation playing?
      correctChoiceId !== null ||           // Is the correct sequence playing?
      showYouGotIt !== null                 // Is the text bubble showing?
    }
    // ------------------------------
  >  
    <div className="choice-image">
      {choice.type === 'img' ? (
        <img src={choice.image} alt={choice.name} />
      ) : (
        <span className="choice-emoji">{choice.image}</span>
      )}
    </div>
    
    <div className="family-choice-name">{choice.name}</div>
    <div className="choice-subtitle">{choice.subtitle}</div>
    
    {/* "YOU GOT IT!" TEXT - Shows FIRST */}
    {showYouGotIt === choice.id && (
      <div className="you-got-it-text">
        <div className="you-got-it-bubble">
          🎉 You got it! 🎉
        </div>
      </div>
    )}
    
    {/* GREEN CHECKMARK - Shows AFTER text */}
    {correctChoiceId === choice.id && (
      <div className="correct-checkmark">
        <div className="checkmark-circle">
          <div className="checkmark-icon">✓</div>
        </div>
      </div>
    )}
    
    {/* SPARKLES - Shows WITH checkmark */}
    {correctChoiceId === choice.id && (
      <div className="card-sparkles">
        <span className="sparkle sparkle-1">✨</span>
        <span className="sparkle sparkle-2">✨</span>
        <span className="sparkle sparkle-3">✨</span>
        <span className="sparkle sparkle-4">✨</span>
      </div>
    )}
  </button>
))}
</div>
                {wrongChoice && (
                  <div className="wrong-feedback"><p>Hmm, not quite! 🤔 Try again! ✨</p></div>
                )}
              </div>
            </div>
          )}

{/* Fun Fact Modal */}
{/* Fun Fact Modal (Immediate Success) */}
{showFunFactModal && (
  <div className="modal-overlay modal-overlay-fade">
    <div 
      className="fun-fact-modal fun-fact-modal-slide"
      data-from={selectedCircle}
    >
      <button className="modal-close-btn" onClick={handleCloseFunFact}>×</button>
      
      <div className="modal-deity-image">
        {showFunFactModal.type === 'img' ? (
          <img src={showFunFactModal.image} alt={showFunFactModal.name} />
        ) : (
          <span className="modal-deity-emoji">{showFunFactModal.image}</span>
        )}
      </div>
      
      {/* UPDATED TITLE: Uses specific introTitle */}
      <h3 className="modal-title">
         {showFunFactModal.introTitle}
      </h3>

      {/* UPDATED BODY: Uses specific introText */}
      <p className="modal-fact-text">{showFunFactModal.introText}</p>
      
      <button className="modal-cool-btn" onClick={handleCloseFunFact}>
        Cool! ✨
      </button>
    </div>
  </div>
)}

{/* Only show when: 1. All placed, 2. Modal closed, 3. Animation sequence finished */}
{placedGaneshaMembers.size === ganeshaFamily.length && !showFunFactModal && !isSequencePlaying && (
  <button 
    className="done-btn done-btn-pulse" 
    onClick={handleGaneshaTreeDone}
  >
    All Done! ✨
  </button>
)}
        </>
      )}

{/* SPARKLE LAYER */}
    <div className={`tree-sparkle-layer ${showTreeSparkles ? 'active' : ''}`}>
      {/* Increased count to 100 for more density */}
      {showTreeSparkles && [...Array(100)].map((_, i) => (
        <div
          key={i}
          className="tree-sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            // Randomize delay so they don't start at once
            animationDelay: `${Math.random() * 2}s`, 
            // Randomize speed slightly for natural feel
            animationDuration: `${1.5 + Math.random()}s` 
          }}
        />
      ))}
    </div>

{/* BIG FLIP CARD OVERLAY */}
{flippedMember && (
  <div 
    className="flip-card-overlay" 
    onClick={() => setFlippedMember(null)}
  >
    <div 
      className="flip-card-big"
      onClick={() => setFlippedMember(null)} 
    >
      {/* ... image section (keep as is) ... */}
      <div className="flip-card-deity">
        {getPlacedDeityImage(flippedMember)?.type === 'img' ? (
          <img 
            src={getPlacedDeityImage(flippedMember).image} 
            alt="Deity" 
          />
        ) : (
          <span className="flip-card-emoji">
            {getPlacedDeityImage(flippedMember)?.image}
          </span>
        )}
      </div>
      
      <div className="flip-card-content">
        {/* UPDATED TITLE: Uses specific flipTitle */}
        <h3 className="flip-card-title">
          {ganeshaFamily.find(m => m.id === flippedMember)?.flipTitle}
        </h3>
        
        {/* UPDATED BODY: Uses specific funFact (Richer Text) */}
        <p className="flip-card-fact">
          {ganeshaFamily.find(m => m.id === flippedMember)?.funFact}
        </p>
      </div>
      
      <div className="flip-card-hint">
        Tap anywhere to close ✨
      </div>
    </div>
  </div>
)}

{/* TRANSITION (New Simplified Version) */}
      {gamePhase === 'transition' && (
        <div className="transition-modal-simple">
          
          {/* Floating Ganesha */}
          <img 
            src={babyGaneshaImg} 
            alt="Ganesha" 
            className="transition-ganesha-float" 
          />
          
          {/* Simple Card */}
          <div className="transition-card-simple">
            <h2 className="transition-title">Your Turn!</h2>
            <p className="transition-text">
              That's my family! Now, I want to see your world.<br/>
              Who are the special people in your house?
            </p>
            
            <button 
              className="continue-btn-simple" 
              onClick={() => {
                 setGamePhase('childInput');
                 // Small delay to let scene render before sliding up tray
                 setTimeout(() => setShowBottomTray(true), 100);
              }}
            >
             Add My Family! 🏠
            </button>
          </div>
        </div>
      )}

      {/* CHILD'S FAMILY INPUT */}
      {gamePhase === 'childInput' && (
        <>
          <button className="back-btn" onClick={() => setGamePhase('transition')}>← Back</button>
          <img src={familyTree} alt="Family Tree" className="tree-overlay" />
       {/* Hide instruction after 3 members are added so it doesn't block the view */}
          {childFamily.length < 3 && (
            <div className="instruction-text">
            <p>👇 “Tap someone to add to your tree!” 🌱!</p>
            </div>
          )}
         {/* Display on tree */}
          <div className="child-family-tree" onClick={() => setSelectedMemberIndex(null)}>
            
            {/* ROW 1 */}
            <div className="family-row row-1">
              {getFamilyByRow(1).map((member, idx) => {
                const actualIdx = childFamily.findIndex(m => m === member);
                const isSelected = selectedMemberIndex === actualIdx;

                return (
                  <div key={idx} className="tree-member-small">
                    <div 
                      className={`member-avatar-small ${isSelected ? 'selected-mode' : ''}`} 
                      style={{ background: member.color, position: 'relative', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle selection
                        setSelectedMemberIndex(isSelected ? null : actualIdx);
                      }}
                    >
                      {member.emoji}
                      
                      {/* DELETE BUTTON (No Animation Wrapper) */}
                      {isSelected && (
                        <button
                          className="delete-member-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newFamily = childFamily.filter((_, i) => i !== actualIdx);
                            setChildFamily(newFamily);
                            setSelectedMemberIndex(null);
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="member-name-small">{member.callName}</div>
                  </div>
                );
              })}
            </div>

            {/* ROW 2 */}
            <div className="family-row row-2">
              {getFamilyByRow(2).map((member, idx) => {
                const actualIdx = childFamily.findIndex(m => m === member);
                const isSelected = selectedMemberIndex === actualIdx;

                return (
                  <div key={idx} className="tree-member-small">
                    <div 
                      className={`member-avatar-small ${isSelected ? 'selected-mode' : ''}`} 
                      style={{ background: member.color, position: 'relative', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMemberIndex(isSelected ? null : actualIdx);
                      }}
                    >
                      {member.emoji}
                      
                      {isSelected && (
                        <button
                          className="delete-member-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newFamily = childFamily.filter((_, i) => i !== actualIdx);
                            setChildFamily(newFamily);
                            setSelectedMemberIndex(null);
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="member-name-small">{member.callName}</div>
                  </div>
                );
              })}
            </div>

            {/* ROW 3 */}
            <div className="family-row row-3">
              {getFamilyByRow(3).map((member, idx) => {
                const actualIdx = childFamily.findIndex(m => m === member);
                const isSelected = selectedMemberIndex === actualIdx;

                return (
                  <div key={idx} className="tree-member-small">
                    <div 
                      className={`member-avatar-small ${isSelected ? 'selected-mode' : ''}`} 
                      style={{ background: member.color, position: 'relative', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMemberIndex(isSelected ? null : actualIdx);
                      }}
                    >
                      {member.emoji}
                      
                      {isSelected && (
                        <button
                          className="delete-member-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newFamily = childFamily.filter((_, i) => i !== actualIdx);
                            setChildFamily(newFamily);
                            setSelectedMemberIndex(null);
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="member-name-small">{member.callName}</div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Bottom tray */}
{/* NEW BOTTOM TRAY */}
          <div className={`bottom-member-tray ${showBottomTray ? 'tray-visible' : ''}`}>
            
            {/* 1. Family Member Buttons */}
            {familyMemberTypes.map(type => (
              <button 
                key={type.id} 
                // Note: You might need to add .member-type-btn styling or reuse .member-card
                className="member-card" 
                onClick={() => handleSelectFamilyType(type)}
                style={{ 
                  background: 'white', 
                  border: `2px solid ${type.color}`,
                  minWidth: '80px'
                }}
              >
                <div style={{ fontSize: '2rem' }}>{type.emoji}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{type.label}</div>
              </button>
            ))}

            {/* 2. Done Button (Only shows when needed) */}
            {childFamily.length > 0 && (
              <button 
                className="continue-btn-simple" 
                style={{ padding: '10px 30px', fontSize: '1.2rem', marginLeft: 'auto' }}
                onClick={() => setGamePhase('sideBySide')}
              >
                Done! ✓
              </button>
            )}
            
          </div>

          {/* Name Modal */}
       {showNameModal && currentFamilyType && (
  <div className="modal-overlay">
    <div className="name-input-modal">
      <button 
        className="modal-close-btn" 
        onClick={() => setShowNameModal(false)}
      >
        ×
      </button>
                <div className="modal-emoji-large">{currentFamilyType.emoji}</div>
                <h2 className="modal-question">What do you call your {currentFamilyType.label}?</h2>
                <div className="input-with-voice">
                  <input
                    type="text"
                    className="name-input"
                    placeholder="e.g., Papa, Mama..."
                    value={callName}
                    onChange={(e) => setCallName(e.target.value)}
                    autoFocus
                  />
                  <button className={`voice-btn ${isRecording ? 'recording' : ''}`} onClick={isRecording ? stopRecording : startRecording}>
                    {isRecording ? '⏹️' : '🎤'}
                  </button>
                </div>
                {audioBlob && <p className="audio-recorded">✓ Voice recorded!</p>}
                <button className="submit-name-btn" onClick={handleAddFamilyMember} disabled={!callName.trim() && !audioBlob}>
                  Add to Tree! ✓
                </button>
              </div>
            </div>
          )}
        </>
      )}

{/* SIDE BY SIDE (Magical Reveal) */}
      {gamePhase === 'sideBySide' && (
        <div className="side-by-side-screen">
          
          {/* 1. BACKGROUND SPARKLES */}
          {[...Array(30)].map((_, i) => (
            <div 
              key={i} 
              className="final-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                width: `${Math.random() * 6 + 4}px`
              }}
            />
          ))}

          <h1 className="reveal-title">Look at Our Family Trees!</h1>
          <p className="reveal-subtitle">Connected by Love 💛</p>
          
          <div className="two-trees-container">
            
            {/* LEFT CARD: Ganesha */}
            <div className="tree-column slide-in-left">
              <h3 className="tree-heading">Ganesha's Family</h3>
              <p style={{textAlign:'center', color:'#5D4037', marginBottom:'10px'}}>🏔️ Mount Kailash</p>
              
              <div className="tree-visual">
                <img src={familyTree} alt="Tree" className="reveal-tree-img" />
                {ganeshaFamily.map(member => {
                  const deity = getPlacedDeityImage(member.id);
                  return (
                    <div key={member.id} className="tree-member-mini" style={member.position}>
                      {deity?.type === 'img' ? (
                        <img src={deity.image} alt={deity.name} className="mini-image" />
                      ) : (
                        <span className="mini-emoji">{deity?.image}</span>
                      )}
                      <p className="mini-name">{member.role}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MIDDLE: Magic Connector */}
            <div className="magic-connector">
              <span className="connector-heart">❤️</span>
              <span className="connector-heart">💖</span>
              <span className="connector-heart">✨</span>
            </div>

            {/* RIGHT CARD: Your Family */}
            <div className="tree-column slide-in-right">
              <h3 className="tree-heading">Your Family</h3>
              <p style={{textAlign:'center', color:'#5D4037', marginBottom:'10px'}}>🏡 Your Home</p>

              <div className="tree-visual">
                <img src={familyTree} alt="Tree" className="reveal-tree-img" />
                <div className="reveal-row reveal-row-1">
                  {getFamilyByRow(1).map((member, idx) => (
                    <div key={idx} className="reveal-member">
                      <div className="reveal-avatar" style={{ background: member.color }}>{member.emoji}</div>
                      <div className="reveal-name">{member.callName}</div>
                    </div>
                  ))}
                </div>
                <div className="reveal-row reveal-row-2">
                  {getFamilyByRow(2).map((member, idx) => (
                    <div key={idx} className="reveal-member">
                      <div className="reveal-avatar" style={{ background: member.color }}>{member.emoji}</div>
                      <div className="reveal-name">{member.callName}</div>
                    </div>
                  ))}
                </div>
                <div className="reveal-row reveal-row-3">
                  {getFamilyByRow(3).map((member, idx) => (
                    <div key={idx} className="reveal-member">
                      <div className="reveal-avatar" style={{ background: member.color }}>{member.emoji}</div>
                      <div className="reveal-name">{member.callName}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

{/* In the action-buttons div */}
<div className="action-buttons">
  <button className="make-another-btn" onClick={() => {
    setChildFamily([]);
    setGamePhase('childInput');
  }}>
    🌳 Make Another Tree
  </button>
  
  {/* --- UPDATE THIS BUTTON --- */}
{/* In the action-buttons div */}
  <button 
    className="end-game-btn" 
    onClick={() => {
      // Show the Completion Modal IMMEDIATELY
      setShowSceneCompletion(true);
    }}
  >
    End Game ✨
  </button>
</div>
        </div>
      )}

      {/* CELEBRATION 
      {gamePhase === 'celebration' && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <h1 className="celebration-title">Family Power Unlocked!</h1>
            <div className="celebration-icon">🌟</div>
            <p className="celebration-message">You've shared your roots! Knowing where we come from makes us strong.</p>
            <p className="celebration-next">Ready to tell me your name and secret superpowers next?</p>
          </div>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="confetti-piece" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, fontSize: `${1 + Math.random() * 1.5}rem` }}>
              {['🎉', '✨', '🌟', '💫', '🎊'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}*/}

          {/* --- ADD THIS BLOCK AT THE END --- */}
      {showSceneCompletion && (
        <AboutMeCompletion
          show={showSceneCompletion}
          sceneName="My Family Tree"
          sceneNumber={1}   // This is Game 1
          totalScenes={4}
          starsEarned={3}   // Giving full stars for completing the tree
          totalStars={3}
          discoveredBadges={['family-connector', 'tree-builder']}
          badgeImages={{}}  // Pass specific images if you have them
          characterImages={{
            babyGanesha: babyGaneshaImg // Reuse your existing import
          }}
          nextSceneName="Favorite Food"
          childName="Family Star" // Or pass dynamic name if you have it
          
          onContinue={() => {
            console.log('🌳 FAMILY TREE CONTINUE');
            // Navigate to Game 2 (Favorite Food)
            if (onNavigate) {
              onNavigate('game2'); 
            } else if (onComplete) {
              onComplete();
            }
          }}
          
          onReplay={() => {
            console.log('🔄 FAMILY TREE REPLAY');
            // Reset Game State
            setGamePhase('intro');
            setPlacedGaneshaMembers(new Set());
            setChildFamily([]);
            setShowSceneCompletion(false);
          }}
          
          onBackToMap={() => {
            console.log('🗺️ BACK TO MAP');
            if (onNavigate) {
              onNavigate('zone-welcome');
            } else if (onBack) {
              onBack();
            }
          }}
          
          onHome={() => {
             if (onNavigate) onNavigate('home');
          }}
        />
      )}
    </div>
  );
};

export default FamilyTreeGame;