import React, { useState } from 'react';
import './SymbolSidebar.css';

// Colored icons only — same image for locked and unlocked states
import vakratundaSymbol    from '../assets/images/symbols/vakratunda-symbol.png';
import mahakayaSymbol      from '../assets/images/symbols/mahakaya-symbol.png';
import suryakotiSymbol     from '../assets/images/symbols/suryakoti-symbol.png';
import samaprabhaSymbol    from '../assets/images/symbols/samaprabha-symbol.png';
import nirvighnamSymbol    from '../assets/images/symbols/nirvighnam-symbol.png';
import kurumedevaSymbol    from '../assets/images/symbols/kurumedeva-symbol.png';
import sarvakaryeshuSymbol from '../assets/images/symbols/sarvakaryeshu-symbol.png';
import sarvadaSymbol       from '../assets/images/symbols/sarvada-symbol.png';

const mantraInfo = {
  vakratunda:    { title: "Vakratunda",    description: "I adapt.",            icon: vakratundaSymbol },
  mahakaya:      { title: "Mahakaya",      description: "I am strong.",        icon: mahakayaSymbol },
  suryakoti:     { title: "Suryakoti",     description: "I shine.",            icon: suryakotiSymbol },
  samaprabha:    { title: "Samaprabha",    description: "I stay bright.",      icon: samaprabhaSymbol },
  kurumedeva:    { title: "Kurumedeva",    description: "I try again.",        icon: kurumedevaSymbol },
  nirvighnam:    { title: "Nirvighnam",    description: "I move forward.",     icon: nirvighnamSymbol },
  sarvakaryeshu: { title: "Sarvakaryeshu", description: "I do my tasks.",      icon: sarvakaryeshuSymbol },
  sarvada:       { title: "Sarvada",       description: "I do not give up.",   icon: sarvadaSymbol },
};

const mantraOrder = [
  'vakratunda', 'mahakaya', 'suryakoti', 'samaprabha',
  'kurumedeva', 'nirvighnam', 'sarvakaryeshu', 'sarvada'
];

const SymbolSidebar = ({
  unlockedSymbols = {},
  onAppClick,
  className = '',
  // Flight animation system — controlled entirely by parent scene
  animatingSymbol = null,
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMantra, setSelectedMantra] = useState(null);

  const getIconClass = (mantraId) => {
    if (animatingSymbol === mantraId) return 'ganesha-icon animating';
    if (unlockedSymbols[mantraId])    return 'ganesha-icon symbol-unlocked';
    return 'ganesha-icon symbol-locked';
  };

  const handleSymbolClick = (mantraId) => {
    if (unlockedSymbols[mantraId]) {
      setSelectedMantra(mantraId);
      setShowPopup(true);
      if (onAppClick) onAppClick(mantraId);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedMantra(null);
  };

  const playAudio = (mantraId) => {
    try {
      const audio = new Audio(`/audio/words/${mantraId}.mp3`);
      audio.volume = 1.0;
      audio.play().catch(e => console.log('Audio play error:', e));
    } catch (error) {
      console.log('Audio error:', error);
    }
  };

  return (
    <>
      <div className={`ganesha-sidebar ${className}`}>
        {mantraOrder.map((mantraId) => {
          const info = mantraInfo[mantraId];
          return (
            <div
              key={mantraId}
              id={`sidebar-${mantraId}`}
              className={getIconClass(mantraId)}
              onClick={() => handleSymbolClick(mantraId)}
              style={{
                backgroundImage: `url(${info.icon})`,
                cursor: unlockedSymbols[mantraId] ? 'pointer' : 'not-allowed',
              }}
              title={unlockedSymbols[mantraId] ? info.title : 'Locked'}
            />
          );
        })}
      </div>

      {showPopup && selectedMantra && (
        <div className="ganesha-popup-overlay" onClick={closePopup}>
          <div className="ganesha-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="ganesha-popup-close-btn" onClick={closePopup}>×</button>

            <div className="ganesha-popup-img-container">
              <img
                src={mantraInfo[selectedMantra].icon}
                alt={mantraInfo[selectedMantra].title}
                className="ganesha-popup-custom-img"
              />
            </div>

            <h2 className="ganesha-popup-title">{mantraInfo[selectedMantra].title}</h2>
            <p className="ganesha-popup-description">{mantraInfo[selectedMantra].description}</p>

            <button
              className="ganesha-popup-audio-btn"
              onClick={() => playAudio(selectedMantra)}
            >
              🎵 {selectedMantra.toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SymbolSidebar;
