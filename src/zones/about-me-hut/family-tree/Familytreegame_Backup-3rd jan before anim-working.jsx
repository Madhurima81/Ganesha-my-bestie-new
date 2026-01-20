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
      funFact: 'My Appa is the King of Yoga! He is very calm and has a moon in his hair.',
      position: { top: '20%', left: '15%' }
    },
    {
      id: 'mother',
      role: 'Mother',
      correctAnswer: 'parvati',
      funFact: 'My Amma is so strong and kind. She makes the best food and gives the warmest hugs!',
      position: { top: '20%', right: '15%' }
    },
    {
      id: 'brother',
      role: 'Brother',
      correctAnswer: 'kartikeya',
      funFact: 'My brother is a brave warrior! He travels the world on a beautiful peacock.',
      position: { bottom: '25%', left: '15%' }
    },
     {
      id: 'myself',
      role: 'Me', // or "Myself"
      correctAnswer: 'ganesha',
      funFact: 'And that is me! I love eating Modaks and removing obstacles for my friends!',
      position: { bottom: '25%', right: '15%' } // Mirrored position
    }
  ];

  // Deity choices
// Update your deityChoices like this:
  const deityChoices = {
    father: [
      // Add type: 'img' for the real images
      { id: 'shiva', name: 'Shiva Ji', image: shivaImg, type: 'img', subtitle: 'King of Yoga', isCorrect: true },
      // Add type: 'emoji' for the emojis
      { id: 'vishnu', name: 'Vishnu Ji', image: '🔱', type: 'emoji', subtitle: 'Preserver of World', isCorrect: false },
      { id: 'brahma', name: 'Brahma Ji', image: '🪷', type: 'emoji', subtitle: 'Creator of World', isCorrect: false }
    ],
    mother: [
      { id: 'parvati', name: 'Parvati Mata', image: parvatiImg, type: 'img', subtitle: 'Goddess of Power', isCorrect: true },
      { id: 'lakshmi', name: 'Lakshmi Mata', image: '💰', type: 'emoji', subtitle: 'Goddess of Prosperity', isCorrect: false },
      { id: 'saraswati', name: 'Saraswati Mata', image: '📚', type: 'emoji', subtitle: 'Goddess of Knowledge', isCorrect: false }
    ],
    brother: [
      { id: 'kartikeya', name: 'Kartikeya', image: kartikeyaImg, type: 'img', subtitle: 'Warrior God', isCorrect: true },
      { id: 'hanuman', name: 'Hanuman Ji', image: '🐒', type: 'emoji', subtitle: 'Devotee of Rama', isCorrect: false },
      { id: 'krishna', name: 'Krishna Ji', image: '🪈', type: 'emoji', subtitle: 'Avatar of Vishnu', isCorrect: false }
    ],
     myself: [
      { id: 'ganesha', name: 'Ganesha', image: babyGaneshaImg, type: 'img', subtitle: 'That\'s Me!', isCorrect: true },
      { id: 'mushak', name: 'Mushak', image: '🐭', type: 'emoji', subtitle: 'My Mouse Friend', isCorrect: false },
      { id: 'nandi', name: 'Nandi', image: '🐮', type: 'emoji', subtitle: 'My Father\'s Bull', isCorrect: false }
    ]
  };

  // Child's family types
  const familyMemberTypes = [
    { id: 'dad', label: 'Dad', emoji: '👨', color: '#4facfe', row: 2 },
    { id: 'mom', label: 'Mom', emoji: '👩', color: '#ff6b9d', row: 2 },
    { id: 'grandparent-m', label: 'Grandparent', emoji: '👴', color: '#a8edea', row: 1 },
    { id: 'grandparent-f', label: 'Grandparent', emoji: '👵', color: '#fed6e3', row: 1 },
    { id: 'brother', label: 'Brother', emoji: '👦', color: '#43e97b', row: 3 },
    { id: 'sister', label: 'Sister', emoji: '👧', color: '#fa709a', row: 3 },
    { id: 'myself', label: 'Myself', emoji: '😊', color: '#ffd93d', row: 3 },
    { id: 'pet', label: 'Pet', emoji: '🐕', color: '#ffeaa7', row: 3 }
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

  const handleChoiceSelection = (choice) => {
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

      {gamePhase !== 'intro' && gamePhase !== 'celebration' && (
        <div className="part-indicator">Part 1: Ganesha's Family 👨‍👩‍👦</div>
      )}

      {/* INTRO */}
{/* INTRO PHASE */}
      {gamePhase === 'intro' && (
        // ADD THE ID HERE 👇
        <div className="game-modal-overlay" id="family-tree-intro"> 
          <div className="game-modal-content">
            
            {/* Character */}
            <div className="game-modal-character">
              <img src={babyGaneshaImg} alt="Baby Ganesha" />
            </div>

            {/* Card */}
            <div className="game-modal-card">
              <h1 className="game-modal-title">Our Family Trees</h1>
              <p className="game-modal-subtitle">
                I live on Mount Kailash with a very special family. 
                Help me place them on my tree so you can meet them!
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
                Meet Ganesha's Family! 🌟
              </button>
            </div>
          </div>
        </div>
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
            <p>👆 Tap a circle to learn about Ganesha's family!</p>
          </div>
          
          {/* Tree overlay */}
          <img src={familyTree} alt="Family Tree" className="tree-overlay" />

          {/* Circle spots - ALWAYS VISIBLE */}
          {ganeshaFamily.map(member => (
            <div
              key={member.id}
              className="circle-spot-with-label"
              style={member.position}
              onClick={() => handleClickCircle(member.id)}
            >
              {/* Empty circle or placed deity */}
              {!placedGaneshaMembers.has(member.id) ? (
                <div className="empty-circle glow-pulse" />
              ) : (
                <div className={`placed-deity ${flippedMember === member.id ? 'flipped' : ''}`}>
                  {flippedMember !== member.id ? (
                    <div className="deity-front">
         <div className="deity-circle">
  {getPlacedDeityImage(member.id)?.type === 'img' ? (
    <img src={getPlacedDeityImage(member.id).image} alt="Deity" className="deity-image" />
  ) : (
    <span className="deity-emoji">{getPlacedDeityImage(member.id)?.image}</span>
  )}
</div>
                      
                    </div>
                  ) : (
                    <div className="deity-back">
                      <div className="flip-fun-fact"><p>{member.funFact}</p></div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Label - ALWAYS VISIBLE */}
              <div className="circle-label">{member.role}</div>
            </div>
          ))}

          {/* Choice Modal */}
          {showChoiceModal && (
            <div className="modal-overlay" onClick={() => setShowChoiceModal(false)}>
              <div className="choice-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setShowChoiceModal(false)}>×</button>
                <h2 className="choice-title">
                  Who is Ganesha's {ganeshaFamily.find(m => m.id === selectedCircle)?.role}? 🤔
                </h2>
                <div className="choice-options">
                  {currentChoices.map(choice => (
                    <button
                      key={choice.id}
                      className={`choice-card ${wrongChoice === choice.id ? 'wrong-shake' : ''}`}
                      onClick={() => handleChoiceSelection(choice)}
                      disabled={wrongChoice !== null}
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
            <div className="modal-overlay" onClick={() => setShowFunFactModal(null)}>
              <div className="fun-fact-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setShowFunFactModal(null)}>×</button>
       <div className="modal-deity-image">
  {showFunFactModal.type === 'img' ? (
    <img src={showFunFactModal.image} alt={showFunFactModal.name} />
  ) : (
    <span className="modal-deity-emoji">{showFunFactModal.image}</span>
  )}
</div>
                <h3 className="modal-title">Meet My {showFunFactModal.role}!</h3>
                <h2 className="modal-name">{showFunFactModal.name}</h2>
                <p className="modal-fun-fact">{showFunFactModal.funFact}</p>
                <div className="modal-emoji">💫</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TRANSITION */}
      {gamePhase === 'transition' && (
        <div className="transition-overlay">
          <img src={babyGaneshaImg} alt="Baby Ganesha" className="transition-ganesha bounce" />
          <div className="transition-speech">
            <h2 className="transition-title">Your Turn!</h2>
            <p className="transition-text">
              That's my family! Now, I want to see your world. 
              Who are the special people in your house? Let's build your tree!
            </p>
            <button className="continue-btn" onClick={() => setGamePhase('childInput')}>
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
          <div className="instruction-text">
            <p>👇 Tap a family member below to add them!</p>
          </div>

          {/* Display on tree */}
          <div className="child-family-tree">
            <div className="family-row row-1">
              {getFamilyByRow(1).map((member, idx) => {
                const actualIdx = childFamily.findIndex(m => m === member);
                return (
                  <div key={idx} className="tree-member-small">
                    <div className="member-avatar-small" style={{ background: member.color }}>
                      {member.emoji}
                      <button 
                        className="delete-member-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const newFamily = childFamily.filter((_, i) => i !== actualIdx);
                          setChildFamily(newFamily);
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="member-name-small">{member.callName}</div>
                  </div>
                );
              })}
            </div>
            <div className="family-row row-2">
              {getFamilyByRow(2).map((member, idx) => {
                const actualIdx = childFamily.findIndex(m => m === member);
                return (
                  <div key={idx} className="tree-member-small">
                    <div className="member-avatar-small" style={{ background: member.color }}>
                      {member.emoji}
                      <button 
                        className="delete-member-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const newFamily = childFamily.filter((_, i) => i !== actualIdx);
                          setChildFamily(newFamily);
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="member-name-small">{member.callName}</div>
                  </div>
                );
              })}
            </div>
            <div className="family-row row-3">
              {getFamilyByRow(3).map((member, idx) => {
                const actualIdx = childFamily.findIndex(m => m === member);
                return (
                  <div key={idx} className="tree-member-small">
                    <div className="member-avatar-small" style={{ background: member.color }}>
                      {member.emoji}
                      <button 
                        className="delete-member-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const newFamily = childFamily.filter((_, i) => i !== actualIdx);
                          setChildFamily(newFamily);
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="member-name-small">{member.callName}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom tray */}
          <div className="members-tray">
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
      {gamePhase === 'sideBySide' && (
        <div className="side-by-side-screen">
          <h1 className="reveal-title">Look at Us!</h1>
          <p className="reveal-subtitle">Connected by Love ❤️</p>
          <div className="two-trees-container">
            <div className="tree-column">
              <h3 className="tree-heading">Ganesha's Family</h3>
              <div className="tree-visual ganesha-tree">
                <img src={familyTree} alt="Tree" className="tree-image" />
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
            <div className="tree-column">
              <h3 className="tree-heading">Your Family</h3>
              <div className="tree-visual child-tree-reveal">
                <img src={familyTree} alt="Tree" className="tree-image" />
                
                {/* Row 1: Grandparents */}
                <div className="reveal-row reveal-row-1">
                  {getFamilyByRow(1).map((member, idx) => (
                    <div key={idx} className="reveal-member">
                      <div className="reveal-avatar" style={{ background: member.color }}>
                        {member.emoji}
                      </div>
                      <div className="reveal-name">{member.callName}</div>
                    </div>
                  ))}
                </div>
                
                {/* Row 2: Parents */}
                <div className="reveal-row reveal-row-2">
                  {getFamilyByRow(2).map((member, idx) => (
                    <div key={idx} className="reveal-member">
                      <div className="reveal-avatar" style={{ background: member.color }}>
                        {member.emoji}
                      </div>
                      <div className="reveal-name">{member.callName}</div>
                    </div>
                  ))}
                </div>
                
                {/* Row 3: Siblings + Pets */}
                <div className="reveal-row reveal-row-3">
                  {getFamilyByRow(3).map((member, idx) => (
                    <div key={idx} className="reveal-member">
                      <div className="reveal-avatar" style={{ background: member.color }}>
                        {member.emoji}
                      </div>
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