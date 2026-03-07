import React, { useState } from 'react';
import './SymbolSidebar.css';
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';

// Import gray and colored symbol icons
import symbolBellyColored from '../images/icons/symbol-belly-colored.svg';
import symbolEarColored from '../images/icons/symbol-ear-colored.png';
import symbolEyesColored from '../images/icons/symbol-eyes-colored.png';
import symbolLotusColored from '../images/icons/symbol-lotus-colored.png';
import symbolModakColored from '../images/icons/symbol-modak-colored.svg';
import symbolMooshikaColored from '../images/icons/symbol-mooshika-colored.svg';
import symbolTrunkColored from '../images/icons/symbol-trunk-colored.png';
import symbolTuskColored from '../images/icons/symbol-tusk-colored.png';

// Symbol Information
/*const symbolInfo = {
  modak: {
    title: "Modak — Ganesha's Sweet Treat!",
    description: "A magical sweet that fills you with happy, joyful energy!",
    colorIcon: symbolModakColored,
    grayIcon: symbolModakGray,
    popupImage: symbolModakColored,
  },
  mooshika: {
    title: "Mooshika — Ganesha's Clever Friend!",
    description: "A tiny mouse with a big heart! Mooshika helps Ganesha travel anywhere and reminds us to stay humble & smart.",
    colorIcon: symbolMooshikaColored,
    grayIcon: symbolMooshikaGray,
    popupImage: symbolMooshikaColored,
  },
  belly: {
    title: "Belly — Big Happy Tummy!",
    description: "Ganesha's big belly holds all worries and turns them into calm. It reminds us to feel safe, relaxed and happy inside.",
    colorIcon: symbolBellyColored,
    grayIcon: symbolBellyGray,
    popupImage: symbolBellyColored,
  },
  lotus: {
    title: "Lotus — Pure & Peaceful Heart",
    description: "The lotus grows clean even in mud! It teaches us to stay calm, kind, and good inside.",
    colorIcon: symbolLotusColored,
    grayIcon: symbolLotusGray,
    popupImage: symbolLotusColored,
  },
  trunk: {
    title: "Trunk — Strength with Flexibility",
    description: "Ganesha's trunk is powerful yet gentle — showing us that real strength is soft, kind & adaptable.",
    colorIcon: symbolTrunkColored,
    grayIcon: symbolTrunkGray,
    popupImage: symbolTrunkColored,
  },
  eyes: {
    title: "Eyes — Divine Vision",
    description: "Ganesha sees the good in everyone! His eyes remind us to look with love, curiosity & wonder.",
    colorIcon: symbolEyesColored,
    grayIcon: symbolEyesGray,
    popupImage: symbolEyesColored,
  },
  ear: {
    title: "Ears — Listen with Love",
    description: "Big ears to hear prayers, stories & feelings! They teach us to listen carefully and understand others.",
    colorIcon: symbolEarColored,
    grayIcon: symbolEarGray,
    popupImage: symbolEarColored,
  },
  tusk: {
    title: "Tusks — Perfect Imperfection",
    description: "One broken, one whole — reminding us that even with flaws, we are powerful, unique & complete!",
    colorIcon: symbolTuskColored,
    grayIcon: symbolTuskGray,
    popupImage: symbolTuskColored,
  },
};*/

const symbolInfo = {
  modak: {
    title: "Modak",
    description: "I share with joy.",
    colorIcon: symbolModakColored,
    popupImage: symbolModakColored,
  },

  mooshika: {
    title: "Mooshika",
    description: "I can focus.",
    colorIcon: symbolMooshikaColored,
    popupImage: symbolMooshikaColored,
  },

  belly: {
    title: "Big Belly",
    description: "I feel safe inside.",
    colorIcon: symbolBellyColored,
    popupImage: symbolBellyColored,
  },

  lotus: {
    title: "Lotus",
    description: "I stay calm and kind.",
    colorIcon: symbolLotusColored,
    popupImage: symbolLotusColored,
  },

  trunk: {
    title: "Trunk",
    description: "I am strong and gentle.",
    colorIcon: symbolTrunkColored,
    popupImage: symbolTrunkColored,
  },

  eyes: {
    title: "Eyes",
    description: "I notice the good.",
    colorIcon: symbolEyesColored,
    popupImage: symbolEyesColored,
  },

  ear: {
    title: "Ears",
    description: "I listen with care.",
    colorIcon: symbolEarColored,
    popupImage: symbolEarColored,
  },

  tusk: {
    title: "Tusk",
    description: "I finish what I start.",
    colorIcon: symbolTuskColored,
    popupImage: symbolTuskColored,
  },
};

// Display order
const symbolOrder = ['modak', 'mooshika', 'belly', 'lotus', 'trunk', 'eyes', 'ear', 'tusk'];

// SVG icons have internal transparent padding — use larger background-size
const svgSymbols = ['mooshika', 'modak', 'belly'];

const SymbolSidebar = ({
  discoveredSymbols = {},
  onSymbolClick,
  onPopupOpen,
  onPopupClose,
  className = '',
  centerMode = false,
  highlightSymbols = [],
  onCelebrate,
  zoneId = 'symbol-mountain',
  // Flight animation system — controlled entirely by parent scene
  animatingSymbol = null,   // symbolId currently blooming after flight
}) => {
  const theme = getZoneTheme(zoneId);
  const zoneThemeVars = {
    '--zone-accent-color': theme.accentColor,
    '--zone-glow-color': theme.glowColor,
  };

  const [showPopup, setShowPopup] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [tappedSymbols, setTappedSymbols] = useState({});

  // In centerMode, only show discovered symbols
  const displaySymbols = centerMode
    ? symbolOrder.filter(s => discoveredSymbols[s])
    : symbolOrder;

  // ── Icon class — pure visual, no timers ──────────────────────────────────
  const getIconClass = (symbolId) => {
    if (animatingSymbol === symbolId)   return 'ganesha-icon animating';
    if (discoveredSymbols[symbolId])    return 'ganesha-icon completed';
    return 'ganesha-icon locked';
  };

  // ── Popup ────────────────────────────────────────────────────────────────
  const handleSymbolClick = (symbolId) => {
    if (discoveredSymbols[symbolId]) {
      setTappedSymbols(prev => ({ ...prev, [symbolId]: true }));
      setSelectedSymbol(symbolId);
      setShowPopup(true);
      onPopupOpen?.();
      if (onSymbolClick) onSymbolClick(symbolId);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedSymbol(null);
    onPopupClose?.();
  };

  // ── CENTER MODE ───────────────────────────────────────────────────────────
  if (centerMode) {
    return (
      <>
        <div className="symbol-discovery-overlay">
          <div className="symbol-discovery-panel" style={zoneThemeVars}>
            <p className="symbol-discovery-title">Tap the symbols to learn about them!</p>

            <div className="symbol-discovery-grid">
              {displaySymbols.map((symbolId) => {
                const symbol = symbolInfo[symbolId];
                const isHighlighted = highlightSymbols.includes(symbolId);
                const isTapped = tappedSymbols[symbolId];

                return (
                  <div
                    key={symbolId}
                    id={`sidebar-${symbolId}`}
                    className={`symbol-discovery-icon ${isHighlighted ? 'symbol-discovery-pulse' : ''} ${isTapped ? 'symbol-discovery-tapped' : ''}`}
                    onClick={() => handleSymbolClick(symbolId)}
                  >
                    <img src={symbol.colorIcon} alt={symbol.title} />
                    {!isTapped && (
                      <div className="tap-indicator">TAP!</div>
                    )}
                  </div>
                );
              })}
            </div>

            <button className="symbol-discovery-celebrate-btn" onClick={onCelebrate}>
              🎉 Celebrate!
            </button>
          </div>
        </div>

        {showPopup && selectedSymbol && (
          <div className="ganesha-popup-overlay" onClick={closePopup}>
            <div className="ganesha-popup-content" style={zoneThemeVars}>
              <div className="ganesha-popup-img-container">
                <img src={symbolInfo[selectedSymbol].popupImage} alt={symbolInfo[selectedSymbol].title} className="ganesha-popup-custom-img" />
              </div>
              <h2 className="ganesha-popup-title">{symbolInfo[selectedSymbol].title}</h2>
              <p className="ganesha-popup-description">{symbolInfo[selectedSymbol].description}</p>
              <p className="ganesha-popup-tap-hint">Tap anywhere to close</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── SIDE RAIL MODE (default) ──────────────────────────────────────────────
  return (
    <>
      <div className={`ganesha-sidebar ${className}`} style={zoneThemeVars}>
        {displaySymbols.map((symbolId) => {
          const symbol = symbolInfo[symbolId];
          const isDiscovered = discoveredSymbols[symbolId];
          const needsTap = isDiscovered && !tappedSymbols[symbolId];

          return (
            <div
              key={symbolId}
              id={`sidebar-${symbolId}`}
              className={getIconClass(symbolId)}
              onClick={() => handleSymbolClick(symbolId)}
              style={{
                backgroundImage: `url(${symbol.colorIcon})`,
                cursor: isDiscovered ? 'pointer' : 'not-allowed',
                backgroundSize: svgSymbols.includes(symbolId) ? '130%' : undefined,
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

      {showPopup && selectedSymbol && (
        <div className="ganesha-popup-overlay" onClick={closePopup}>
          <div className="ganesha-popup-content" style={zoneThemeVars}>
            <div className="ganesha-popup-img-container">
              <img src={symbolInfo[selectedSymbol].popupImage} alt={symbolInfo[selectedSymbol].title} className="ganesha-popup-custom-img" />
            </div>
            <h2 className="ganesha-popup-title">{symbolInfo[selectedSymbol].title}</h2>
            <p className="ganesha-popup-description">{symbolInfo[selectedSymbol].description}</p>
            <p className="ganesha-popup-tap-hint">Tap anywhere to close</p>
          </div>
        </div>
      )}
    </>
  );
};

export default SymbolSidebar;

