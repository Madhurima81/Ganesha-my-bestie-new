import React, { useState } from 'react';
import './SymbolSidebar.css';
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import SymbolCardModal from './SymbolCardModal';
// FIX 1: named import (was default import — was returning undefined)
import { symbolCardContent } from './symbolCardContent';

// Import gray and colored symbol icons
import symbolBellyColored from '../images/icons/symbol-belly-new.png';
import symbolEarColored from '../images/icons/symbol-ears-new.png';
import symbolEyesColored from '../images/icons/symbol-eyes-new.png';
import symbolLotusColored from '../images/icons/symbol-lotus-new.png';
import symbolModakColored from '../images/icons/symbol-modak-new.png';
import symbolMooshikaColored from '../images/icons/symbol-mooshika-new.png';
import symbolTrunkColored from '../images/icons/symbol-trunk-new.png';
import symbolTuskColored from '../images/icons/broken-tusk-symbol.png';

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
  modak: { title: 'Modak', colorIcon: symbolModakColored },
  mooshika: { title: 'Mooshika', colorIcon: symbolMooshikaColored },
  belly: { title: 'Big Belly', colorIcon: symbolBellyColored },
  lotus: { title: 'Lotus', colorIcon: symbolLotusColored },
  trunk: { title: 'Trunk', colorIcon: symbolTrunkColored },
  eyes: { title: 'Eyes', colorIcon: symbolEyesColored },
  ear: { title: 'Ears', colorIcon: symbolEarColored },
  tusk: { title: 'Tusk', colorIcon: symbolTuskColored },
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
                const needsAttention = !isTapped;

                return (
                  <div
                    key={symbolId}
                    id={`sidebar-${symbolId}`}
                    className={`symbol-discovery-icon ${isHighlighted ? 'symbol-discovery-pulse' : ''} ${isTapped ? 'symbol-discovery-tapped' : ''} ${needsAttention ? 'symbol-discovery-soft-glow' : ''}`}
                    onClick={() => handleSymbolClick(symbolId)}
                  >
                    <img src={symbol.colorIcon} alt={symbol.title} />
                  </div>
                );
              })}
            </div>

            <button className="symbol-discovery-celebrate-btn" onClick={onCelebrate}>
              🎉 Celebrate!
            </button>
          </div>
        </div>

        {/* FIX 2 + 3: conditional render + correct prop names (symbolId + iconSrc) */}
        {showPopup && selectedSymbol && (
          <SymbolCardModal
            symbolId={selectedSymbol}
            iconSrc={symbolInfo[selectedSymbol]?.colorIcon}
            onClose={closePopup}
          />
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
          const needsAttention = isDiscovered && !tappedSymbols[symbolId];

          return (
            <div
              key={symbolId}
              id={`sidebar-${symbolId}`}
              className={`${getIconClass(symbolId)} ${needsAttention ? 'ganesha-icon-soft-glow' : ''}`}
              onClick={() => handleSymbolClick(symbolId)}
              style={{
                backgroundImage: `url(${symbol.colorIcon})`,
                cursor: isDiscovered ? 'pointer' : 'not-allowed',
                backgroundSize: svgSymbols.includes(symbolId) ? '130%' : undefined,
              }}
              title={isDiscovered ? symbol.title : 'Symbol not yet discovered'}
            >
            </div>
          );
        })}
      </div>

      {/* FIX 2 + 3: conditional render + correct prop names (symbolId + iconSrc) */}
      {showPopup && selectedSymbol && (
        <SymbolCardModal
          symbolId={selectedSymbol}
          iconSrc={symbolInfo[selectedSymbol]?.colorIcon}
          onClose={closePopup}
        />
      )}
    </>
  );
};

export default SymbolSidebar;

