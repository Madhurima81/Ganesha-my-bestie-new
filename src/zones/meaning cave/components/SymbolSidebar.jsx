import React, { useState, useEffect } from 'react';
import './SymbolSidebar.css';

// Import your symbol images
import vakratundaSymbol from '../assets/images/symbols/vakratunda-symbol.png';
import mahakayaSymbol from '../assets/images/symbols/mahakaya-symbol.png';
import suryakotiSymbol from '../assets/images/symbols/suryakoti-symbol.png';
import samaprabhaSymbol from '../assets/images/symbols/samaprabha-symbol.png';
import nirvighnamSymbol from '../assets/images/symbols/nirvighnam-symbol.png';
import kurumedevaSymbol from '../assets/images/symbols/kurumedeva-symbol.png';
import sarvakaryeshuSymbol from '../assets/images/symbols/sarvakaryeshu-symbol.png';
import sarvadaSymbol from '../assets/images/symbols/sarvada-symbol.png';

// Mantra Information
const mantraInfo = {
  vakratunda: {
    title: "Vakratunda — Curved Trunk!",
    description: "A curvy trunk that lifts anything — tiny or huge! Powerful yet gentle — just like Ganesha. ✨",
    colorIcon: vakratundaSymbol,
    grayIcon: vakratundaSymbol,
    audioKey: 'vakratunda',
  },
  mahakaya: {
    title: "Mahakaya — Mighty Form!", 
    description: "Ganesha’s body is big, strong and steady like a mountain! A powerful protector with a warm, loving heart. ❤️",
    colorIcon: mahakayaSymbol,
    grayIcon: mahakayaSymbol,
    audioKey: 'mahakaya',
  },
  suryakoti: {
    title: "Suryakoti — Brighter Than Suns!",
    description: "Ganesha shines brighter than millions of suns! His light removes fear and fills us with joy. ☀️",
    colorIcon: suryakotiSymbol,
    grayIcon: suryakotiSymbol,
    audioKey: 'suryakoti',
  },
  samaprabha: {
    title: "Samaprabha — Radiant Glow!",
    description: "A divine glow that brightens everything around him! Where Ganesha is, light and happiness follow. ✨",
    colorIcon: samaprabhaSymbol,
    grayIcon: samaprabhaSymbol,
    audioKey: 'samaprabha',
  },
  kurumedeva: {
    title: "Kurumedeva — O Lord, Please Guide Me!",
    description: "We ask Ganesha to help us learn and move ahead. With effort + blessings, great things happen. 🧡",
    colorIcon: kurumedevaSymbol,
    grayIcon: kurumedevaSymbol,
    audioKey: 'kurumedeva',
  },
  nirvighnam: {
    title: "Sarva-Vighnam — Remove All Obstacles!",
    description: "Ganesha clears the path when things get tough. Try bravely — he helps us move forward. 🚧➡️✨",
    colorIcon: nirvighnamSymbol,
    grayIcon: nirvighnamSymbol,
    audioKey: 'nirvighnam',
  },
  sarvakaryeshu: {
    title: "Sarva-Karyeshu — In All Tasks!", 
    description: "For every work — big or small — he is with us. We try with focus, he supports with grace. 🌿",
    colorIcon: sarvakaryeshuSymbol,
    grayIcon: sarvakaryeshuSymbol,
    audioKey: 'sarvakaryeshu',
  },
  sarvada: {
    title: "Sarvada — Always!",
    description: "Ganesha’s love and blessings stay always with us. Forever guiding, forever protecting. 💛",
    colorIcon: sarvadaSymbol,
    grayIcon: sarvadaSymbol,
    audioKey: 'sarvada',
  }
};

const SymbolSidebar = ({ unlockedSymbols = {}, onAppClick, className = '' }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMantra, setSelectedMantra] = useState(null);
  
  // State to track which item is currently animating
  const [animatingMantra, setAnimatingMantra] = useState(null);
  // State to remember which items we have ALREADY animated so we don't loop
  const [animatedSet, setAnimatedSet] = useState(new Set());

  // Order for display
  const mantraOrder = ['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'kurumedeva', 'nirvighnam', 'sarvakaryeshu', 'sarvada'];

  const handleSymbolClick = (mantraId) => {
    if (unlockedSymbols[mantraId]) {
      setSelectedMantra(mantraId);
      setShowPopup(true);
    }
  };

  const handleWordPlay = (mantraId) => {
    console.log(`Playing full mantra word: ${mantraId}`);
    playAudio(`/audio/words/${mantraId}.mp3`);
  };

  const playAudio = (audioPath) => {
    try {
      const audio = new Audio(audioPath);
      audio.volume = 1.0;
      audio.play().catch(e => console.log("Audio play error:", e));
    } catch (error) {
      console.log("Audio error:", error);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedMantra(null);
  };

  // --- FIXED ANIMATION LOGIC ---
  useEffect(() => {
    // Find the first symbol that is Unlocked AND has NOT been animated yet
    const newlyUnlocked = mantraOrder.find(id => 
      unlockedSymbols[id] && !animatedSet.has(id)
    );
      
    if (newlyUnlocked) {
      // Start animation
      setAnimatingMantra(newlyUnlocked);
      
      // Add to our "Already Animated" list immediately so we don't find it again next render
      setAnimatedSet(prev => new Set(prev).add(newlyUnlocked));

      // Stop animation after 1 second
      setTimeout(() => {
        setAnimatingMantra(null);
      }, 1000);
    }
  }, [unlockedSymbols, animatedSet]); 

  return (
    <>
      <div className={`mantra-cave-sidebar ${className}`}>
        {mantraOrder.map((mantraId) => {
          const info = mantraInfo[mantraId];
          const isUnlocked = unlockedSymbols[mantraId];
          const isAnimating = animatingMantra === mantraId;
          
          return (
            <div
              key={mantraId}
              // RENAMED CLASS: 'mantra-cave-animate' to avoid global conflict
              className={`mantra-cave-icon ${isUnlocked ? 'unlocked' : 'locked'} ${isAnimating ? 'mantra-cave-animate' : ''}`}
              onClick={() => handleSymbolClick(mantraId)}
              style={{
                backgroundImage: `url(${isUnlocked ? info.colorIcon : info.grayIcon})`,
              }}
              title={isUnlocked ? info.title : 'Locked'}
            />
          );
        })}
      </div>

      {/* Mantra Popup */}
      {showPopup && selectedMantra && (
        <div className="mantra-cave-popup-overlay" onClick={closePopup}>
          <div className="mantra-cave-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="mantra-cave-close-x" onClick={closePopup}>×</button>
            
            <div className="mantra-cave-popup-img-container">
              <img 
                src={mantraInfo[selectedMantra].colorIcon} 
                alt={mantraInfo[selectedMantra].title}
                className="mantra-cave-popup-img"
              />
            </div>
            
            <h2 className="mantra-cave-popup-title">
              {mantraInfo[selectedMantra].title.split('—')[0]}
            </h2>
            <p className="mantra-cave-popup-desc">
              {mantraInfo[selectedMantra].description}
            </p>
            
            <div className="mantra-cave-btn-group">
              <button 
                className="mantra-cave-audio-btn"
                onClick={() => handleWordPlay(selectedMantra)}
              >
                🎵 {selectedMantra.toUpperCase()}
              </button>

              <button className="mantra-cave-action-close-btn" onClick={closePopup}>
                Close
              </button>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
};

export default SymbolSidebar;