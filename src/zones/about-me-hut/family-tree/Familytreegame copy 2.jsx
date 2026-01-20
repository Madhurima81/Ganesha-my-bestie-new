import React, { useState, useRef } from 'react';
import './FamilyTreeGame.css';
import '../../shared/components/OpeningModal.css'; // <--- SHARED MODAL IMPORT


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

// Add this with your other useState hooks
const [correctChoiceId, setCorrectChoiceId] = useState(null); // Tracks the card to pop
const [justPlacedId, setJustPlacedId] = useState(null); // Tracks the tree node to sparkle
  const [showCelebration, setShowCelebration] = useState(null);

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
funFact: 'My father is calm and strong. He keeps everyone safe!',
      position: { top: '20%', left: '15%' }
    },
    {
      id: 'mother',
      role: 'Mother',
      correctAnswer: 'parvati',
funFact: 'My mother is kind and loving. She gives the best hugs!',
      position: { top: '20%', right: '15%' }
    },
    {
      id: 'brother',
      role: 'Brother',
      correctAnswer: 'kartikeya',
funFact: 'My brother is brave! He rides a beautiful peacock.',
      position: { bottom: '25%', left: '15%' }
    },
     {
      id: 'myself',
      role: 'Me', // or "Myself"
      correctAnswer: 'ganesha',
funFact: 'That’s me! I love modaks and helping my friends.',
      position: { bottom: '25%', right: '15%' } // Mirrored position
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
    if (placedGaneshaMembers.has(circleId)) {
      setFlippedMember(flippedMember === circleId ? null : circleId);
      return;
    }
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
    // STEP 1: Show "You got it!" text (0ms)
    setShowYouGotIt(choice.id);
    
    // STEP 2: Show checkmark WHILE text still visible (1200ms)
    setTimeout(() => {
      setCorrectChoiceId(choice.id);
      // DON'T hide text yet - let it stay
    }, 1200);
    
    // STEP 3: Hide text and start fade (1800ms)
    setTimeout(() => {
      setShowYouGotIt(null);
    }, 1800);
    
    // STEP 4: Close modal (2000ms)
    setTimeout(() => {
      setShowChoiceModal(false);
      
      const newPlaced = new Set(placedGaneshaMembers);
      newPlaced.add(selectedCircle);
      setPlacedGaneshaMembers(newPlaced);
      
      setCorrectChoiceId(null);
    }, 2000);
    
    // STEP 5: Circle glow (2200ms)
    setTimeout(() => {
      setJustPlacedId(selectedCircle);
    }, 2200);
    
    // STEP 6: Fun fact opens (5000ms - giving circle time to glow)
    setTimeout(() => {
      const member = ganeshaFamily.find(m => m.id === selectedCircle);
      const correctDeity = deityChoices[selectedCircle].find(d => d.isCorrect);
      setShowFunFactModal({ ...member, ...correctDeity });
      
      setJustPlacedId(null);
    }, 5000);
    
  } else {
    setWrongChoice(choice.id);
    setTimeout(() => setWrongChoice(null), 1500);
  }
};

  const handleCloseFunFact = () => {
    // 1. Close the modal
    setShowFunFactModal(null);

    // 2. Check if the game is finished NOW (after user acknowledges)
    if (placedGaneshaMembers.size === ganeshaFamily.length) {
      setShowCelebration('all-complete');
      setTimeout(() => setShowCelebration(null), 3000);
      setTimeout(() => setGamePhase('transition'), 3500);
    }
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
  const handleSceneReturnTransition = () => {
    // 1. Start: Shrink the Card
    setSceneReturnState('scaling');

    // 2. 160ms later: Start Fading Overlay AND Switch to Game Screen
    setTimeout(() => {
      setGamePhase('childInput'); // Switch to game screen (so it renders behind overlay)
      setSceneReturnState('fading'); // Trigger fade out CSS
    }, 160);

    // 3. 400ms later: Trigger Tray Slide Up (Overlay is mostly gone now)
    setTimeout(() => {
      setSceneReturnState('tray-up');
    }, 400);

    // 4. 800ms later: Finish (Snap tree to sharp)
    setTimeout(() => {
      setSceneReturnState('finished');
    }, 800);
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
          <div className="progress-dots">
            {ganeshaFamily.map((m, i) => (
              <span key={i} className={`progress-dot ${placedGaneshaMembers.has(m.id) ? 'filled' : ''}`}>●</span>
            ))}
          </div>
          <div className="instruction-text">
            <p>👉 Tap a circle to meet my family!</p>
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
                className="circle-spot-with-label"
                style={member.position}
                onClick={() => handleClickCircle(member.id)}
              >
                {/* 1. Empty State (Uses CSS animation) */}
                {!placedGaneshaMembers.has(member.id) ? (
                  <div className="empty-circle glow-pulse" />
                ) : (
                  
                  /* 2. Placed State (Render Front, Back & Sparkles together) */
                  <div className={`placed-deity ${flippedMember === member.id ? 'flipped' : ''}`}>
                    
                    {/* Front Side (Image) */}
                    <div className="deity-front">
                      <div className="deity-circle">
                         {/* Juice: Add pop animation class if just placed */}
                         <div className={justPlacedId === member.id ? "tree-avatar-appear" : ""}>
                           {getPlacedDeityImage(member.id)?.type === 'img' ? (
                            <img src={getPlacedDeityImage(member.id).image} alt="Deity" className="deity-image" />
                          ) : (
                            <span className="deity-emoji">{getPlacedDeityImage(member.id)?.image}</span>
                          )}
                         </div>
                      </div>
                    </div>

                    {/* Back Side (Fun Fact) */}
                    <div className="deity-back">
                      <div className="flip-fun-fact"><p>{member.funFact}</p></div>
                    </div>

                    {/* 3. Sparkles (Juice) */}
                    {justPlacedId === member.id && (
                      <div className="tree-sparkle-burst">
                        <div className="sparkle-dot"></div>
                        <div className="sparkle-dot"></div>
                        <div className="sparkle-dot"></div>
                        <div className="sparkle-dot"></div>
                        <div className="sparkle-dot"></div>
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
            <div className="modal-overlay" onClick={() => setShowChoiceModal(false)}>
              <div className="choice-modal" onClick={(e) => e.stopPropagation()}>
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
    disabled={wrongChoice !== null || correctChoiceId !== null || showYouGotIt !== null}
  >
    <div className="choice-image">
      {choice.type === 'img' ? (
        <img src={choice.image} alt={choice.name} />
      ) : (
        <span className="choice-emoji">{choice.image}</span>
      )}
    </div>
    
    <div className="choice-name">{choice.name}</div>
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
          {showFunFactModal && (
            <div className="modal-overlay" onClick={handleCloseFunFact}>
              {/* Standard DIV with CSS class for animation */}
              <div className="fun-fact-modal" onClick={(e) => e.stopPropagation()}>
                
                {/* Close 'X' Button */}
                <button className="modal-close-btn" onClick={handleCloseFunFact}>×</button>
                
                <div className="modal-deity-image">
                  {showFunFactModal.type === 'img' ? (
                    <img src={showFunFactModal.image} alt={showFunFactModal.name} />
                  ) : (
                    <span className="modal-deity-emoji">{showFunFactModal.image}</span>
                  )}
                </div>
                
                <h3 className="modal-title">
                  {showFunFactModal.role === 'Me' ? "Meet Me!" : `Meet My ${showFunFactModal.role}!`}
                </h3>
                
                <h2 className="modal-name">{showFunFactModal.name}</h2>
                <p className="modal-fun-fact">{showFunFactModal.funFact}</p>
                
                {/* Manual Close Button */}
                <button 
                  className="game-modal-button" 
                  style={{marginTop: '15px', padding: '10px 40px', fontSize: '1.2rem'}} 
                  onClick={handleCloseFunFact}
                >
                  Cool! ✨
                </button>

              </div>
            </div>
          )}
        </>
      )}

{/* TRANSITION OVERLAY */}
      {/* Logic: Keep rendered if we are in 'transition' phase OR if we are animating out */}
      {(gamePhase === 'transition' || sceneReturnState === 'fading' || sceneReturnState === 'tray-up') && (
        <div className={`transition-overlay ${sceneReturnState === 'fading' || sceneReturnState === 'tray-up' ? 'overlay-fade' : ''}`}>
          
          {/* 1. Ganesha Image */}
          <img 
            src={babyGaneshaImg} 
            alt="Baby Ganesha" 
            className="transition-ganesha floating-anim" 
          />
          
          {/* 2. The Card (Scales down when state is 'scaling') */}
          <div className={`transition-speech ${sceneReturnState === 'scaling' ? 'scene-return-scale' : ''}`}>
            <h2 className="transition-title">Your Turn!</h2>
            <p className="transition-text">
              That's my family! Now, I want to see your world. 
              Who are the special people in your house? Let's build your tree!
            </p>
            
            <button className="continue-btn pulse-anim" onClick={handleSceneReturnTransition}>
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
            <p>👇 “Pick someone to add to your tree!” 🌱!</p>
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
<div className={`members-tray ${sceneReturnState === 'tray-up' || sceneReturnState === 'finished' ? 'tray-visible' : ''}`}>
              <div className="members-list">
              {familyMemberTypes.map(type => (
                <button key={type.id} className="member-card" onClick={() => handleSelectFamilyType(type)}>
                  <div className="member-card-emoji">{type.emoji}</div>
                  <div className="member-card-label">{type.label}</div>
                </button>
              ))}
            </div>
            {childFamily.length > 0 && (
              <button className="done-tray-btn" onClick={() => setGamePhase('sideBySide')}>Done! ✓</button>
            )}
          </div>

          {/* Name Modal */}
          {showNameModal && currentFamilyType && (
            <div className="modal-overlay" onClick={() => setShowNameModal(false)}>
              <div className="name-input-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setShowNameModal(false)}>×</button>
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

      {/* SIDE BY SIDE */}
{/* SIDE BY SIDE */}
      {gamePhase === 'sideBySide' && (
        <div className="side-by-side-screen">
          <h1 className="reveal-title">Look at Us!</h1>
          <p className="reveal-subtitle">Connected by Love ❤️</p>
          
          <div className="two-trees-container">
            
            {/* LEFT COLUMN: Ganesha */}
            <div className="tree-column slide-in-left">
              <h3 className="tree-heading">Ganesha's Family</h3>
              <div className="tree-visual">
                {/* 1. SINGLE TREE IMAGE */}
                <img src={familyTree} alt="Tree" className="reveal-tree-img" />
                
                {/* Members */}
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
              <p className="tree-location">🏔️ Mount Kailash, India</p>
            </div>

            {/* RIGHT COLUMN: Your Family */}
            <div className="tree-column slide-in-right">
              <h3 className="tree-heading">Your Family</h3>
              <div className="tree-visual">
                {/* 2. MATCHING TREE IMAGE */}
                <img src={familyTree} alt="Tree" className="reveal-tree-img" />
                
                {/* Rows of your family */}
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
              <p className="tree-location">🏡 Your Home</p>
            </div>
          </div>

          <div className="bonding-message">
            <img src={babyGaneshaImg} alt="Ganesha" className="bonding-ganesha" />
            <p className="bonding-text">
              Your family is amazing! Even though we use different words, we both have families who love us very much!
            </p>
          </div>
          
          <div className="action-buttons">
            <button className="make-another-btn" onClick={() => {
              setChildFamily([]);
              setGamePhase('childInput');
            }}>
              Make Another Tree 🌳
            </button>
            <button className="end-game-btn" onClick={() => setGamePhase('celebration')}>
              End Game ✨
            </button>
          </div>
        </div>
      )}

      {/* CELEBRATION */}
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
      )}
    </div>
  );
};

export default FamilyTreeGame;