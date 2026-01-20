import React, { useState, useRef } from 'react';
import './FamilyTreeGame.css';
import '../../shared/components/OpeningModal.css'; 
import AboutMeCompletion from "../components/Aboutmecompletion";

// --- IMPORT ASSETS (Ganesha's Family & Distractors) ---
import familyTreeBg from './assets/images/family tree bg.png';
import familyTree from './assets/images/family-tree.png';

// Correct Answers
import babyGaneshaImg from './assets/images/ganesha/family-ganesha.png';
import shivaImg from './assets/images/ganesha/family-shiva.png';
import parvatiImg from './assets/images/ganesha/family-parvati.png';
import kartikeyaImg from './assets/images/ganesha/family-kartkeya.png'; // Note: Matches screenshot spelling

// Incorrect Answers (Distractors)
import brahmaImg from './assets/images/ganesha/family-brahma.png';
import vishnuImg from './assets/images/ganesha/family-vishnu.png';
import lakshmiImg from './assets/images/ganesha/family-lakshmi.png'; // Assuming hyphen based on standard, check file if it has '='
import saraswatiImg from './assets/images/ganesha/family-saraswati.png';
import hanumanImg from './assets/images/ganesha/family-hanuman.png';
import krishnaImg from './assets/images/ganesha/family-krishna.png';
import mouseImg from './assets/images/ganesha/family-mouse.png';
import nandiImg from './assets/images/ganesha/family-nandi.png';

// --- IMPORT ASSETS (Child's Family) ---
import childDadImg from './assets/images/child/family-dad.png';
import childMomImg from './assets/images/child/family-mom.png';
import childGrandpaImg from './assets/images/child/family-grandpa.png';
import childGrandmaImg from './assets/images/child/family-grandma.png';
import childBrotherImg from './assets/images/child/family-brother.png';
import childSisterImg from './assets/images/child/family-sister.png';
import childMyselfImg from './assets/images/child/family-myself.png';
import childPetImg from './assets/images/child/family-pet.png';


const FamilyTreeGame = ({ onComplete, onBack, onNavigate }) => {
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
  
  // Scene return state
  const [sceneReturnState, setSceneReturnState] = useState('idle');
  const [isReturning, setIsReturning] = useState(false);
  const [showBottomTray, setShowBottomTray] = useState(false);
  const [showYouGotIt, setShowYouGotIt] = useState(null); 

  const [deletableMemberIndex, setDeletableMemberIndex] = useState(null); 
  const longPressTimer = useRef(null); 

  const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);
  const [showTreeSparkles, setShowTreeSparkles] = useState(false);
  const [tappedMembers, setTappedMembers] = useState(new Set());

  const [correctChoiceId, setCorrectChoiceId] = useState(null); 
  const [justPlacedId, setJustPlacedId] = useState(null); 
  const [showCelebration, setShowCelebration] = useState(null);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [disabledChoices, setDisabledChoices] = useState(new Set());
  const [showSceneCompletion, setShowSceneCompletion] = useState(false);

  // Child's family state
  const [childFamily, setChildFamily] = useState([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [currentFamilyType, setCurrentFamilyType] = useState(null);
  const [callName, setCallName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Ganesha's family members data
  const ganeshaFamily = [
    {
      id: 'father',
      role: 'Father',
      correctAnswer: 'shiva',
      position: { top: '30%', left: '35%' },
      introTitle: '🔱 My Father!',
      introText: 'He is calm and strong 🕉️',
      flipTitle: 'My Father',
      funFact: 'My father is calm and strong. He protects us and teaches me peace 🕉️'
    },
    {
      id: 'mother',
      role: 'Mother',
      correctAnswer: 'parvati',
      position: { top: '30%', right: '25%' },
      introTitle: '🌸 My Mother!',
      introText: 'She is kind and loving 💗',
      flipTitle: 'My Mother',
      funFact: 'My mother is kind and loving. She gives the best hugs and keeps me safe 💗'
    },
    {
      id: 'brother',
      role: 'Brother',
      correctAnswer: 'kartikeya',
      position: { bottom: '25%', left: '45%' },
      introTitle: '🦚 My Brother!',
      introText: 'He is brave and fast 🦚',
      flipTitle: 'My Brother',
      funFact: 'My brother is very brave. He travels the world on his peacock 🦚'
    },
     {
      id: 'myself',
      role: 'Me',
      correctAnswer: 'ganesha',
      position: { bottom: '25%', right: '30%' },
      introTitle: '😊 That’s Me!',
      introText: 'I love modaks 🍬',
      flipTitle: 'Me',
      funFact: 'That’s me! I love modaks and helping my friends 😊'
    }
  ];

  // Deity choices (UPDATED with Images for distractors)
  const deityChoices = {
    father: [
      { id: 'shiva', name: 'Shiva Ji', image: shivaImg, type: 'img',  isCorrect: true },
      { id: 'vishnu', name: 'Vishnu Ji', image: vishnuImg, type: 'img',  isCorrect: false },
      { id: 'brahma', name: 'Brahma Ji', image: brahmaImg, type: 'img',  isCorrect: false }
    ],
    mother: [
      { id: 'parvati', name: 'Parvati Mata', image: parvatiImg, type: 'img',  isCorrect: true },
      { id: 'lakshmi', name: 'Lakshmi Mata', image: lakshmiImg, type: 'img',  isCorrect: false },
      { id: 'saraswati', name: 'Saraswati Mata', image: saraswatiImg, type: 'img',  isCorrect: false }
    ],
    brother: [
      { id: 'kartikeya', name: 'Kartikeya', image: kartikeyaImg, type: 'img',  isCorrect: true },
      { id: 'hanuman', name: 'Hanuman Ji', image: hanumanImg, type: 'img', isCorrect: false },
      { id: 'krishna', name: 'Krishna Ji', image: krishnaImg, type: 'img',  isCorrect: false }
    ],
     myself: [
      { id: 'ganesha', name: 'Ganesha', image: babyGaneshaImg, type: 'img', isCorrect: true },
      { id: 'mushak', name: 'Mushak', image: mouseImg, type: 'img', isCorrect: false },
      { id: 'nandi', name: 'Nandi', image: nandiImg, type: 'img',  isCorrect: false }
    ]
  };

  // Child's family types (UPDATED with Images)
  const familyMemberTypes = [
    { id: 'dad', label: 'Dad', image: childDadImg, color: '#6BB6FF', row: 2 },
    { id: 'mom', label: 'Mom', image: childMomImg, color: '#FF8FB1', row: 2 },

    { id: 'grandparent-m', label: 'Grandpa', image: childGrandpaImg, color: '#BEE7D8', row: 1 },
    { id: 'grandparent-f', label: 'Grandma', image: childGrandmaImg, color: '#F7C6D9', row: 1 },

    { id: 'brother', label: 'Brother', image: childBrotherImg, color: '#7EDC9A', row: 3 },
    { id: 'sister', label: 'Sister', image: childSisterImg, color: '#FFA6C9', row: 3 },

    { id: 'myself', label: 'Myself', image: childMyselfImg, color: '#FFD966', row: 3 },
    { id: 'pet', label: 'Pet', image: childPetImg, color: '#F2D3A2', row: 3 }
  ];


  // Handlers
  const handleStartGame = () => setGamePhase('ganeshaTree');

  // ... inside FamilyTreeGame component ...

  // 1. ADD THIS HELPER FUNCTION
  const shuffleArray = (array) => {
    const shuffled = [...array]; // Create a copy so we don't change original data
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ... existing code ...

  // 2. UPDATE THIS FUNCTION
  const handleClickCircle = (circleId) => {
    if (isSequencePlaying) return;
    if (showFunFactModal || showChoiceModal) return;
    
    // If clicking a placed deity, toggle BIG flip card
    if (placedGaneshaMembers.has(circleId)) {
      setFlippedMember(flippedMember === circleId ? null : circleId);
      setTappedMembers(prev => {
        const newSet = new Set(prev);
        newSet.add(circleId);
        return newSet;
      });
      return;
    }

    setDisabledChoices(new Set()); 
    setSelectedCircle(circleId);

    // ✨ CHANGED HERE: Wrap the choices in shuffleArray() ✨
    setCurrentChoices(shuffleArray(deityChoices[circleId]));
    
    setShowChoiceModal(true);
    setWrongChoice(null);
  };

  /*const handleClickCircle = (circleId) => {
    if (isSequencePlaying) return;
    if (showFunFactModal || showChoiceModal) return;
    
    // If clicking a placed deity, toggle BIG flip card
    if (placedGaneshaMembers.has(circleId)) {
      setFlippedMember(flippedMember === circleId ? null : circleId);
      setTappedMembers(prev => {
        const newSet = new Set(prev);
        newSet.add(circleId);
        return newSet;
      });
      return;
    }

    setDisabledChoices(new Set()); 
    setSelectedCircle(circleId);
    setCurrentChoices(deityChoices[circleId]);
    setShowChoiceModal(true);
    setWrongChoice(null);
  };*/

  const handleChoiceSelection = (choice) => {
    if (choice.isCorrect) {
      setIsSequencePlaying(true);
      setShowYouGotIt(choice.id);
      
      setTimeout(() => setCorrectChoiceId(choice.id), 800);
      setTimeout(() => setShowYouGotIt(null), 1400);
      
      setTimeout(() => {
        setShowChoiceModal(false);
        const newPlaced = new Set(placedGaneshaMembers);
        newPlaced.add(selectedCircle);
        setPlacedGaneshaMembers(newPlaced);
        setCorrectChoiceId(null);
      }, 1600);
      
      setTimeout(() => setJustPlacedId(selectedCircle), 1700);
      
      setTimeout(() => {
        const member = ganeshaFamily.find(m => m.id === selectedCircle);
        const correctDeity = deityChoices[selectedCircle].find(d => d.isCorrect);
        setShowFunFactModal({ ...member, ...correctDeity });
        setJustPlacedId(null);
      }, 2200); 
      
    } else {
      setWrongChoice(choice.id);
      setTimeout(() => {
        setWrongChoice(null);
        setDisabledChoices(prev => {
          const newSet = new Set(prev);
          newSet.add(choice.id);
          return newSet;
        });
      }, 1500);
    }
  };

  const handleCloseFunFact = () => {
    setShowFunFactModal(null);
    setIsSequencePlaying(false);
  };

  const handleGaneshaTreeDone = () => {
    setShowTreeSparkles(true);
    setTimeout(() => {
      setGamePhase('transition'); 
      setShowTreeSparkles(false);
      setShowCelebration(null); 
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

  return (
    <div className="family-tree-game">
      <img src={familyTreeBg} alt="Background" className="tree-background" />

      {/* INTRO PHASE */}
      {gamePhase === 'intro' && (
         <>
          <div className="ganesha-tree-wrapper">
            <img src={familyTree} alt="Family Tree" className="tree-overlay" />
          </div>
        <div className="game-modal-overlay" id="family-tree-intro"> 
          <div className="game-modal-content">
            <div className="game-modal-character">
              <img src={babyGaneshaImg} alt="Baby Ganesha" />
            </div>
            <div className="game-modal-card">
              <h1 className="game-modal-title">Meet My Family</h1>
              <p className="game-modal-subtitle">
                This is my family.<br />
                They make me who I am.<br />
                After that, I'd love to meet yours too 💛
              </p>
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
          
          {/* HEADER */}
          <div className="game-header-hud">
            {placedGaneshaMembers.size < 2 && (
              <div className="hud-instruction-bubble">
                👉 Tap a circle to meet my family!
              </div>
            )}
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
              {!placedGaneshaMembers.has(member.id) ? (
                <div className="empty-circle" />
              ) : (
                <div className={`placed-deity ${justPlacedId === member.id ? 'just-placed-glow' : ''}`}>
                  <div className="deity-front">
                    <div className="deity-circle">
                      {/* Always using Image type now for deities based on new imports */}
                      <img src={getPlacedDeityImage(member.id).image} alt="Deity" className="deity-image" />
                    </div>
                    {!tappedMembers.has(member.id) && (
                      <div className="tap-to-learn">👆 Tap!</div>
                    )}    
                  </div>
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
              <div className="circle-label">{member.role}</div>
            </div>
          ))}

          {/* Choice Modal */}
          {showChoiceModal && (
            <div className="modal-overlay" >
              <div className="choice-modal">
                <button className="modal-close-btn" onClick={() => setShowChoiceModal(false)}>×</button>
                <h2 className="choice-title">
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
                      disabled={
                        disabledChoices.has(choice.id) ||
                        wrongChoice !== null ||
                        correctChoiceId !== null ||
                        showYouGotIt !== null
                      }
                    >  
                      <div className="choice-image">
                        {/* Render Images from new imports */}
                        <img src={choice.image} alt={choice.name} />
                      </div>
                      
                      <div className="family-choice-name">{choice.name}</div>
                      <div className="choice-subtitle">{choice.subtitle}</div>
                      
                      {showYouGotIt === choice.id && (
                        <div className="you-got-it-text">
                          <div className="you-got-it-bubble">
                            🎉 You got it! 🎉
                          </div>
                        </div>
                      )}
                      
                      {correctChoiceId === choice.id && (
                        <div className="correct-checkmark">
                          <div className="checkmark-circle">
                            <div className="checkmark-icon">✓</div>
                          </div>
                        </div>
                      )}
                      
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
            <div className="modal-overlay modal-overlay-fade">
              <div 
                className="fun-fact-modal fun-fact-modal-slide"
                data-from={selectedCircle}
              >
                <button className="modal-close-btn" onClick={handleCloseFunFact}>×</button>
                <div className="modal-deity-image">
                  <img src={showFunFactModal.image} alt={showFunFactModal.name} />
                </div>
                <h3 className="modal-title">
                  {showFunFactModal.introTitle}
                </h3>
                <p className="modal-fact-text">{showFunFactModal.introText}</p>
                <button className="modal-cool-btn" onClick={handleCloseFunFact}>
                  Cool! ✨
                </button>
              </div>
            </div>
          )}

          {placedGaneshaMembers.size === ganeshaFamily.length && !showFunFactModal && !isSequencePlaying && (
            <button 
    className="tree-done-btn done-btn-pulse" 
              onClick={handleGaneshaTreeDone}
            >
              All Done! ✨
            </button>
          )}
        </>
      )}

      {/* SPARKLE LAYER */}
      <div className={`tree-sparkle-layer ${showTreeSparkles ? 'active' : ''}`}>
        {showTreeSparkles && [...Array(100)].map((_, i) => (
          <div
            key={i}
            className="tree-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`, 
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
            <div className="flip-card-deity">
              <img 
                src={getPlacedDeityImage(flippedMember).image} 
                alt="Deity" 
              />
            </div>
            
            <div className="flip-card-content">
              <h3 className="flip-card-title">
                {ganeshaFamily.find(m => m.id === flippedMember)?.flipTitle}
              </h3>
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

      {/* TRANSITION PHASE */}
      {gamePhase === 'transition' && (
        <div className="transition-modal-simple">
          <img 
            src={babyGaneshaImg} 
            alt="Ganesha" 
            className="transition-ganesha-float" 
          />
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
          {childFamily.length < 3 && (
            <div className="instruction-text">
            <p>👇 “Tap someone to add to your tree!” 🌱!</p>
            </div>
          )}

          {/* SHOW HINT: Only appears if there is at least 1 person on the tree */}
{childFamily.length > 0 && (
  <div className="tray-hint-text">
    (Tap a face to remove it)
  </div>
)}
          
          <div className="child-family-tree" onClick={() => setSelectedMemberIndex(null)}>
            {/* Helper to render members with images */}
            {[1, 2, 3].map(rowNum => (
              <div key={rowNum} className={`family-row row-${rowNum}`}>
                {getFamilyByRow(rowNum).map((member, idx) => {
                  const actualIdx = childFamily.findIndex(m => m === member);
                  const isSelected = selectedMemberIndex === actualIdx;
                  return (
                    <div key={idx} className="tree-member-small">
                      <div 
                        className={`member-avatar-small ${isSelected ? 'selected-mode' : ''}`} 
                        style={{ background: member.color, position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMemberIndex(isSelected ? null : actualIdx);
                        }}
                      >
                        {/* Replaced emoji with Image */}
                        <img 
                          src={member.image} 
                          alt={member.label} 
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px' }} 
                        />
                        
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
            ))}
          </div>

          {/* NEW BOTTOM TRAY WITH IMAGES */}
          <div className={`bottom-member-tray ${showBottomTray ? 'tray-visible' : ''}`}>
            {familyMemberTypes.map(type => (
              <button 
                key={type.id} 
                className="member-card" 
                onClick={() => handleSelectFamilyType(type)}
                style={{ 
                  border: `2px solid ${type.color}`,
                  minWidth: '85px',
                  padding: '10px'
                }}
              >
                <div style={{ width: '50px', height: '50px', marginBottom: '5px' }}>
                  <img src={type.image} alt={type.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{type.label}</div>
              </button>
            ))}

            {childFamily.length > 0 && (
              <button 
                      className="tray-done-btn" 
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
                {/* Replaced emoji with Image */}
                <div className="modal-emoji-large" style={{ width: '100px', height: '100px', margin: '0 auto 15px' }}>
                   <img src={currentFamilyType.image} alt={currentFamilyType.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <h2 className="modal-question">What do you call your {currentFamilyType.label}?</h2>
                <div className="input-with-voice">
                  <input
                    
              
  type="text"
  className="name-input"
  placeholder="e.g., Papa, Mama..."
  value={callName}
  onChange={(e) => setCallName(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && callName.trim()) {
      e.preventDefault();
      handleAddFamilyMember();
    }
  }}
  autoFocus
/>
                  <button className={`voice-btn ${isRecording ? 'recording' : ''}`} onClick={isRecording ? stopRecording : startRecording}>
                    {isRecording ? '⏹️' : '🎤'}
                  </button>
                </div>
                {audioBlob && <p className="audio-recorded">✓ Voice recorded!</p>}
<p className="input-hint">💡 Press Enter to add to tree</p>
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
        <div 
          key={member.id} 
          className="tree-member-mini ganesha-comparison-icon"  
          style={member.position}
        >
          <img src={deity.image} alt={deity.name} className="mini-image ganesha-comparison-img" />  {/* ADD THIS CLASS */}
          <p className="mini-name ganesha-comparison-label">{member.role}</p>  {/* ADD THIS CLASS */}
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
  
  {/* ADD DATA ATTRIBUTE FOR MEMBER COUNT */}
  <div 
    className="tree-visual"
    data-member-count={childFamily.length}  
  >
    <img src={familyTree} alt="Tree" className="reveal-tree-img" />
    
    {/* Child Rows using Images */}
    {[1, 2, 3].map(rowNum => (
      <div key={rowNum} className={`reveal-row reveal-row-${rowNum}`}>
        {getFamilyByRow(rowNum).map((member, idx) => (
          <div key={idx} className="reveal-member">
            <div className="reveal-avatar" style={{ background: member.color, padding: '5px' }}>
              <img src={member.image} alt={member.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div className="reveal-name">{member.callName}</div>
          </div>
        ))}
      </div>
    ))}
  </div>
</div>
          </div>

          

          <div className="action-buttons">
            <button className="make-another-btn" onClick={() => {
              setChildFamily([]);
              setGamePhase('childInput');
            }}>
              🌳 Make Another Tree
            </button>
            <button 
              className="end-game-btn" 
              onClick={() => {
                setShowSceneCompletion(true);
              }}
            >
              End Game ✨
            </button>
          </div>
        </div>
      )}

      {showSceneCompletion && (
        <AboutMeCompletion
          show={showSceneCompletion}
          sceneName="My Family Tree"
          sceneNumber={1}
          totalScenes={4}
          starsEarned={3}
          totalStars={3}
          discoveredBadges={['family-connector', 'tree-builder']}
          badgeImages={{}}
          characterImages={{
            babyGanesha: babyGaneshaImg 
          }}
          nextSceneName="Favorite Food"
          childName="Family Star"
          onContinue={() => {
            if (onNavigate) {
              onNavigate('game2'); 
            } else if (onComplete) {
              onComplete();
            }
          }}
          onReplay={() => {
            setGamePhase('intro');
            setPlacedGaneshaMembers(new Set());
            setChildFamily([]);
            setShowSceneCompletion(false);
          }}
          onBackToMap={() => {
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