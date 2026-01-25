import React, { useState } from 'react';
import './SymbolSidebar.css';

// Import gray and colored symbol icons
import symbolBellyGray from '../images/icons/symbol-belly-gray.png';
import symbolBellyColored from '../images/icons/symbol-belly-colored.png';
import symbolEarGray from '../images/icons/symbol-ear-gray.png';
import symbolEarColored from '../images/icons/symbol-ear-colored.png';
import symbolEyesGray from '../images/icons/symbol-eyes-gray.png';
import symbolEyesColored from '../images/icons/symbol-eyes-colored.png';
import symbolLotusGray from '../images/icons/symbol-lotus-gray.png';
import symbolLotusColored from '../images/icons/symbol-lotus-colored.png';
import symbolModakGray from '../images/icons/symbol-modak-gray.png';
import symbolModakColored from '../images/icons/symbol-modak-colored.png';
import symbolMooshikaGray from '../images/icons/symbol-mooshika-gray.png';
import symbolMooshikaColored from '../images/icons/symbol-mooshika-colored.png';
import symbolTrunkGray from '../images/icons/symbol-trunk-gray.png';
import symbolTrunkColored from '../images/icons/symbol-trunk-colored.png';
import symbolTuskGray from '../images/icons/symbol-tusk-gray.png';
import symbolTuskColored from '../images/icons/symbol-tusk-colored.png';

// Placeholder popup images
const popupLotus = symbolLotusColored;
const popupModak = symbolModakColored;
const popupMooshika = symbolMooshikaColored;
const popupBelly = symbolBellyColored;
const popupEar = symbolEarColored;
const popupEyes = symbolEyesColored;
const popupTrunk = symbolTrunkColored;
const popupTusk = symbolTuskColored;

// Updated Symbol Information
const symbolInfo = {
  modak: {
    title: "Modak — Ganesha’s Sweet Treat!",
    description: "A magical sweet that fills you with happy, joyful energy!",
    colorIcon: symbolModakColored,
    grayIcon: symbolModakGray,
    popupImage: popupModak
  },
  mooshika: {
    title: "Mooshika — Ganesha’s Clever Friend!",
    description: "A tiny mouse with a big heart! Mooshika helps Ganesha travel anywhere and reminds us to stay humble & smart.",
    colorIcon: symbolMooshikaColored,
    grayIcon: symbolMooshikaGray,
    popupImage: popupMooshika
  },
  belly: {
    title: "Belly — Big Happy Tummy!",
    description: "Ganesha’s big belly holds all worries and turns them into calm. It reminds us to feel safe, relaxed and happy inside.",
    colorIcon: symbolBellyColored,
    grayIcon: symbolBellyGray,
    popupImage: popupBelly
  },
  lotus: {
    title: "Lotus — Pure & Peaceful Heart",
    description: "The lotus grows clean even in mud! It teaches us to stay calm, kind, and good inside.",
    colorIcon: symbolLotusColored,
    grayIcon: symbolLotusGray,
    popupImage: popupLotus
  },
  trunk: {
    title: "Trunk — Strength with Flexibility",
    description: "Ganesha’s trunk is powerful yet gentle — showing us that real strength is soft, kind & adaptable.",
    colorIcon: symbolTrunkColored,
    grayIcon: symbolTrunkGray,
    popupImage: popupTrunk
  },
  eyes: {
    title: "Eyes — Divine Vision",
    description: "Ganesha sees the good in everyone! His eyes remind us to look with love, curiosity & wonder.",
    colorIcon: symbolEyesColored,
    grayIcon: symbolEyesGray,
    popupImage: popupEyes
  },
  ear: {
    title: "Ears — Listen with Love",
    description: "Big ears to hear prayers, stories & feelings! They teach us to listen carefully and understand others.",
    colorIcon: symbolEarColored,
    grayIcon: symbolEarGray,
    popupImage: popupEar
  },
  tusk: {
    title: "Tusks — Perfect Imperfection",
    description: "One broken, one whole — reminding us that even with flaws, we are powerful, unique & complete!",
    colorIcon: symbolTuskColored,
    grayIcon: symbolTuskGray,
    popupImage: popupTusk
  }
};

const SymbolSidebar = ({ discoveredSymbols = {}, onSymbolClick, className = '' }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [animatingSymbol, setAnimatingSymbol] = useState(null);
  const [tappedSymbols, setTappedSymbols] = useState({});

  // Symbol order for display
  const symbolOrder = ['modak', 'mooshika', 'belly', 'lotus', 'trunk', 'eyes', 'ear', 'tusk'];

  const handleSymbolClick = (symbolId) => {
    if (discoveredSymbols[symbolId]) {
      // Mark symbol as tapped
      setTappedSymbols(prev => ({ ...prev, [symbolId]: true }));

      setSelectedSymbol(symbolId);
      setShowPopup(true);
      if (onSymbolClick) {
        onSymbolClick(symbolId);
      }
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedSymbol(null);
  };

  // Trigger animation when a symbol is newly discovered
  React.useEffect(() => {
    const newlyDiscovered = symbolOrder.find(symbol => 
      discoveredSymbols[symbol] && !animatingSymbol
    );
    
    if (newlyDiscovered) {
      setAnimatingSymbol(newlyDiscovered);
      setTimeout(() => {
        setAnimatingSymbol(null);
      }, 1000);
    }
  }, [discoveredSymbols, animatingSymbol]);

  return (
    <>
      <div className={`ganesha-sidebar ${className}`}>
        {symbolOrder.map((symbolId) => {
          const symbol = symbolInfo[symbolId];
          const isDiscovered = discoveredSymbols[symbolId];
          const isAnimating = animatingSymbol === symbolId;
          const needsTap = isDiscovered && !tappedSymbols[symbolId];

          return (
            <div
              key={symbolId}
              className={`ganesha-icon ${isDiscovered ? 'discovered' : 'undiscovered'} ${isAnimating ? 'ganesha-star-burst-anim' : ''}`}
              onClick={() => handleSymbolClick(symbolId)}
              style={{
                backgroundImage: `url(${isDiscovered ? symbol.colorIcon : symbol.grayIcon})`,
                cursor: isDiscovered ? 'pointer' : 'not-allowed'
              }}
              title={isDiscovered ? symbol.title : 'Symbol not yet discovered'}
            >
              {needsTap && (
                <div className="tap-indicator">TAP!</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Symbol Information Popup */}
      {showPopup && selectedSymbol && (
        <div className="ganesha-popup-overlay" onClick={closePopup}>
          <div className="ganesha-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="ganesha-popup-close-btn" onClick={closePopup}>×</button>
            
            <div className="ganesha-popup-img-container">
              <img 
                src={symbolInfo[selectedSymbol].popupImage} 
                alt={symbolInfo[selectedSymbol].title}
                className="ganesha-popup-custom-img"
              />
            </div>
            
            <h2 className="ganesha-popup-title">{symbolInfo[selectedSymbol].title}</h2>
            <p className="ganesha-popup-description">{symbolInfo[selectedSymbol].description}</p>
            
            <button className="ganesha-popup-continue-btn" onClick={closePopup}>
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SymbolSidebar;