

import React, { useState, useEffect } from 'react';
import './Familytreegame.css';

// Import images
import familyTreeBg from './assets/images/family tree bg.png';
import familyTree from './assets/images/family-tree.png';
import babyGaneshaImg from './assets/images/baby-ganesha.png';
import shivaImg from './assets/images/shiva.png';
import parvatiImg from './assets/images/parvati.png';
import kartikeyaImg from './assets/images/kartikeya.png';

const FamilyTreeGame = ({ onComplete, onBack }) => {
  const [gamePhase, setGamePhase] = useState('intro'); // intro, playing, celebration
  const [placedMembers, setPlacedMembers] = useState(new Set());
  const [selectedMember, setSelectedMember] = useState(null);
  const [flippedCard, setFlippedCard] = useState(null);

const familyMembers = [
  {
    id: 'shiva',
    name: 'Shiva Ji',
    role: 'Father',
    image: shivaImg,
    info: 'My wise father who teaches me meditation',
    position: { top: '20%', left: '15%' } // ✅ Moved left & up
  },
  {
    id: 'parvati',
    name: 'Parvati Mata',
    role: 'Mother',
    image: parvatiImg,
    info: 'My loving mother who makes modaks',
    position: { top: '20%', right: '15%' } // ✅ Moved right & up
  },
  {
    id: 'kartikeya',
    name: 'Kartikeya Bhai',
    role: 'Brother',
    image: kartikeyaImg,
    info: 'My brave brother, we play together',
    position: { bottom: '25%', left: '15%' } // ✅ Moved left & down
  },
  {
    id: 'ganesha',
    name: 'Baby Ganesha',
    role: 'Me!',
    image: babyGaneshaImg,
    info: "That's me! I remove obstacles!",
    position: { bottom: '25%', right: '15%' } // ✅ Moved right & down
  }
];

  // Start game after intro
  const handleStartGame = () => {
    setGamePhase('playing');
  };

  // Handle character placement
  const handlePlaceMember = (memberId) => {
    if (placedMembers.has(memberId)) return;

    const newPlaced = new Set(placedMembers);
    newPlaced.add(memberId);
    setPlacedMembers(newPlaced);
    setSelectedMember(memberId);

    // Check if all placed - trigger celebration
    if (newPlaced.size === familyMembers.length) {
      setTimeout(() => {
        setGamePhase('celebration');
        
        // Call onComplete after celebration
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 2500);
      }, 800);
    }
  };

  // Handle flip card
  const handleFlipCard = (memberId) => {
    if (!placedMembers.has(memberId) || flippedCard === memberId) return;
    setFlippedCard(memberId);

    // Auto-flip back after 4 seconds
    setTimeout(() => {
      setFlippedCard(null);
    }, 4000);
  };

  // Close flip card manually
  const handleCloseFlip = (e, memberId) => {
    e.stopPropagation();
    if (flippedCard === memberId) {
      setFlippedCard(null);
    }
  };

  const availableMembers = familyMembers.filter(m => !placedMembers.has(m.id));

  return (
    <div className="family-tree-game">
      {/* Background Image */}
      <img src={familyTreeBg} alt="Hut Background" className="tree-background" />

      {/* Intro Screen Overlay */}
      {gamePhase === 'intro' && (
        <div className="intro-overlay">
          <img 
            src={babyGaneshaImg} 
            alt="Baby Ganesha" 
            className="intro-ganesha bounce"
          />
          <div className="intro-speech">
            <p className="intro-text">Let's complete my family tree!</p>
            <button className="start-btn" onClick={handleStartGame}>
              Start! 🌟
            </button>
          </div>
        </div>
      )}

      {/* Game Playing Phase */}
      {gamePhase === 'playing' && (
        <>
          {/* Back Button & Progress */}
          <button className="back-btn" onClick={onBack}>← Back</button>
          <div className="progress-dots">
            {familyMembers.map((m, i) => (
              <span 
                key={i} 
                className={`progress-dot ${placedMembers.has(m.id) ? 'filled' : ''}`}
              >
                ●
              </span>
            ))}
          </div>

          {/* Tree Overlay */}
          <img src={familyTree} alt="Family Tree" className="tree-overlay" />

          {/* Empty Circle Spots */}
          {familyMembers.map(member => !placedMembers.has(member.id) && (
            <div
              key={`spot-${member.id}`}
              className="circle-spot glow-pulse"
              style={member.position}
            />
          ))}

          {/* Placed Family Members */}
          {familyMembers.map(member => placedMembers.has(member.id) && (
            <div
              key={`placed-${member.id}`}
              className={`placed-member ${selectedMember === member.id ? 'pop-in' : ''}`}
              style={member.position}
              onClick={() => handleFlipCard(member.id)}
            >
              {/* Front - Character */}
              {flippedCard !== member.id && (
                <div className="member-front">
                  <div className="member-circle">
                    <img src={member.image} alt={member.name} className="member-image" />
                  </div>
                  <div className="member-label">
                    <div className="member-name">{member.name}</div>
                    <div className="member-role">{member.role}</div>
                  </div>
                </div>
              )}

              {/* Back - Info (Simplified flip) */}
              {flippedCard === member.id && (
                <div className="member-info">
                  <button 
                    className="close-info-btn" 
                    onClick={(e) => handleCloseFlip(e, member.id)}
                  >
                    ×
                  </button>
                  <div className="info-emoji">💫</div>
                  <p className="info-text">{member.info}</p>
                </div>
              )}
            </div>
          ))}

          {/* Bottom Tray - Available Characters */}
          {availableMembers.length > 0 && (
            <div className="members-tray">
              <p className="tray-instruction">
                {placedMembers.size === 0 
                  ? "Tap a family member to place them on the tree!" 
                  : `Great! ${placedMembers.size} placed! Keep going!`}
              </p>
              <div className="members-list">
                {availableMembers.map(member => (
                  <button
                    key={member.id}
                    className="member-card bounce-gentle"
                    onClick={() => handlePlaceMember(member.id)}
                  >
                    <img src={member.image} alt={member.name} className="member-card-image" />
                    <div className="member-card-name">{member.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Celebration Phase */}
      {gamePhase === 'celebration' && (
        <div className="celebration-overlay">
          {/* Tree stays visible */}
          <img src={familyTree} alt="Family Tree" className="tree-overlay" />
          
          {/* All placed members visible */}
          {familyMembers.map(member => (
            <div
              key={`celebrate-${member.id}`}
              className="placed-member"
              style={member.position}
            >
              <div className="member-front">
                <div className="member-circle">
                  <img src={member.image} alt={member.name} className="member-image" />
                </div>
                <div className="member-label">
                  <div className="member-name">{member.name}</div>
                  <div className="member-role">{member.role}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Celebration sparkles */}
          <div className="celebration-sparkles">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              >
                ✨
              </div>
            ))}
            <div className="celebration-message">
              Beautiful Family! 🌟
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyTreeGame;