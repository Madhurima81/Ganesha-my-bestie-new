import React, { useState } from 'react';
import './SymbolSidebar.css';

// Import gray and colored symbol icons from the correct path
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

// For testing - use colored icons as popup placeholders
// Replace these with actual popup imports when ready
const popupLotus = symbolLotusColored;
const popupModak = symbolModakColored;
const popupMooshika = symbolMooshikaColored;
const popupBelly = symbolBellyColored;
const popupEar = symbolEarColored;
const popupEyes = symbolEyesColored;
const popupTrunk = symbolTrunkColored;
const popupTusk = symbolTuskColored;

// Symbol information for popups
const symbolInfo = {
  modak: {
    title: "Modak - Ganesha's Favorite Sweet",
    description: "Modak is Lord Ganesha's favorite sweet! This dumpling-shaped dessert symbolizes the reward of spiritual pursuit and the sweetness of the realized inner self.",
    colorIcon: symbolModakColored,
    grayIcon: symbolModakGray,
    popupImage: popupModak
  },
  mooshika: {
    title: "Mooshika - Ganesha's Vehicle",
    description: "Mooshika is Lord Ganesha's faithful mouse vehicle! It represents our ego and desires that need to be controlled, while also symbolizing Ganesha's ability to navigate through small spaces.",
    colorIcon: symbolMooshikaColored,
    grayIcon: symbolMooshikaGray,
    popupImage: popupMooshika
  },
  belly: {
    title: "Ganesha's Belly - Symbol of Abundance",
    description: "Ganesha's large belly contains the entire universe! It represents his ability to consume and digest all experiences, symbolizing abundance and prosperity.",
    colorIcon: symbolBellyColored,
    grayIcon: symbolBellyGray,
    popupImage: popupBelly
  },
  lotus: {
    title: "Lotus - Symbol of Purity",
    description: "The lotus flower represents purity and spiritual awakening. Despite growing in muddy water, it blooms beautifully, teaching us that we can rise above our circumstances.",
    colorIcon: symbolLotusColored,
    grayIcon: symbolLotusGray,
    popupImage: popupLotus
  },
  ear: {
    title: "Large Ears - Listen More, Talk Less",
    description: "Ganesha's large ears symbolize the importance of listening more and speaking less. They remind us to be good listeners and gain wisdom through observation.",
    colorIcon: symbolEarColored,
    grayIcon: symbolEarGray,
    popupImage: popupEar
  },
  trunk: {
    title: "Elephant Trunk - Strength and Adaptability",
    description: "Ganesha's trunk represents strength and adaptability. It can uproot a tree or pick up a needle, teaching us to be both powerful and gentle as the situation demands.",
    colorIcon: symbolTrunkColored,
    grayIcon: symbolTrunkGray,
    popupImage: popupTrunk
  },
  tusk: {
    title: "Single Tusk - Sacrifice for Greater Good",
    description: "Ganesha's broken tusk symbolizes sacrifice. He broke it to write the Mahabharata, teaching us that sometimes we must give up something valuable for a greater purpose.",
    colorIcon: symbolTuskColored,
    grayIcon: symbolTuskGray,
    popupImage: popupTusk
  },
  eyes: {
    title: "Small Eyes - Focus and Concentration",
    description: "Ganesha's small eyes represent concentration and the ability to focus on goals. They teach us to look beyond the obvious and see the inner beauty of things.",
    colorIcon: symbolEyesColored,
    grayIcon: symbolEyesGray,
    popupImage: popupEyes
  }
};

const SymbolSidebar = ({ discoveredSymbols = {}, onSymbolClick, className = '' }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [animatingSymbol, setAnimatingSymbol] = useState(null);

  // Symbol order for display - as specified
  const symbolOrder = ['modak', 'mooshika', 'belly', 'lotus', 'trunk', 'eyes', 'ear', 'tusk'];

  const handleSymbolClick = (symbolId) => {
    if (discoveredSymbols[symbolId]) {
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
      <div className={`symbol-sidebar ${className}`}>
        {symbolOrder.map((symbolId) => {
          const symbol = symbolInfo[symbolId];
          const isDiscovered = discoveredSymbols[symbolId];
          const isAnimating = animatingSymbol === symbolId;
          
          return (
            <div
              key={symbolId}
              className={`symbol-icon ${isDiscovered ? 'discovered' : 'undiscovered'} ${isAnimating ? 'star-burst' : ''}`}
              onClick={() => handleSymbolClick(symbolId)}
              style={{
                backgroundImage: `url(${isDiscovered ? symbol.colorIcon : symbol.grayIcon})`,
                cursor: isDiscovered ? 'pointer' : 'not-allowed'
              }}
              title={isDiscovered ? symbol.title : 'Symbol not yet discovered'}
            />
          );
        })}
      </div>

      {/* Symbol Information Popup */}
      {showPopup && selectedSymbol && (
        <div className="symbol-popup-overlay" onClick={closePopup}>
          <div className="symbol-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close-btn" onClick={closePopup}>×</button>
            
            <div className="popup-symbol-icon">
              <img 
                src={symbolInfo[selectedSymbol].popupImage} 
                alt={symbolInfo[selectedSymbol].title}
                className="popup-custom-image"
              />
            </div>
            
            <h2 className="popup-title">{symbolInfo[selectedSymbol].title}</h2>
            <p className="popup-description">{symbolInfo[selectedSymbol].description}</p>
            
            <button className="popup-continue-btn" onClick={closePopup}>
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SymbolSidebar;