import React, { useEffect, useRef, useState } from 'react';
import './SymbolSidebar.css';
import { getZoneTheme } from '../../../../lib/config/ZoneThemes';
import { useGaneshaVoice } from '../../../../lib/hooks/useGaneshaVoice';
import {
  playCardRevealChime,
  playUiTap,
  playWrongTap,
} from '../../../../lib/services/AudioService';
import SymbolCardModal from './SymbolCardModal';

import symbolBellyColored from '../images/icons/symbol-belly-new.png';
import symbolEarColored from '../images/icons/symbol-ears-new.png';
import symbolEyesColored from '../images/icons/symbol-eyes-new.png';
import symbolLotusColored from '../images/icons/symbol-lotus-new.png';
import symbolModakColored from '../images/icons/symbol-modak-new.png';
import symbolMooshikaColored from '../images/icons/symbol-mooshika-new.png';
import symbolTrunkColored from '../images/icons/symbol-trunk-new.png';
import symbolTuskColored from '../images/icons/broken-tusk-symbol.png';

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

const symbolOrder = ['mooshika', 'modak', 'belly', 'lotus', 'trunk', 'eyes', 'ear', 'tusk'];
const TAPPED_SYMBOLS_STORAGE_KEY = 'symbol-sidebar-tapped-symbols-v1';

const readTappedSymbols = () => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = window.localStorage.getItem(TAPPED_SYMBOLS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

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
  animatingSymbol = null,
}) => {
  const theme = getZoneTheme(zoneId);
  const { speak, stop: stopSpokenVoice } = useGaneshaVoice();
  const zoneThemeVars = {
    '--zone-accent-color': theme.accentColor,
    '--zone-glow-color': theme.glowColor,
  };

  const [showPopup, setShowPopup] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [tappedSymbols, setTappedSymbols] = useState(readTappedSymbols);
  const [lockedFeedbackSymbol, setLockedFeedbackSymbol] = useState(null);
  const lockedFeedbackTimerRef = useRef(null);
  const centerModeVoicePlayedRef = useRef(false);

  const displaySymbols = centerMode
    ? symbolOrder.filter((symbolId) => discoveredSymbols[symbolId])
    : symbolOrder;

  useEffect(() => {
    try {
      window.localStorage.setItem(TAPPED_SYMBOLS_STORAGE_KEY, JSON.stringify(tappedSymbols));
    } catch {}
  }, [tappedSymbols]);

  useEffect(() => () => {
    if (lockedFeedbackTimerRef.current) {
      clearTimeout(lockedFeedbackTimerRef.current);
    }
    stopSpokenVoice();
  }, [stopSpokenVoice]);

  useEffect(() => {
    if (!centerMode || displaySymbols.length === 0 || centerModeVoicePlayedRef.current) return;
    centerModeVoicePlayedRef.current = true;
    speak('Tap the symbols to learn about them.', {
      age: 6,
      style: 'child',
      moment: 'encouragement',
    });
  }, [centerMode, displaySymbols.length, speak]);

  const getIconClass = (symbolId) => {
    if (animatingSymbol === symbolId) return 'ganesha-icon animating';
    if (discoveredSymbols[symbolId]) return 'ganesha-icon completed';
    return 'ganesha-icon locked';
  };

  const triggerLockedFeedback = (symbolId) => {
    playWrongTap();
    setLockedFeedbackSymbol(symbolId);
    if (lockedFeedbackTimerRef.current) {
      clearTimeout(lockedFeedbackTimerRef.current);
    }
    lockedFeedbackTimerRef.current = setTimeout(() => {
      setLockedFeedbackSymbol(null);
      lockedFeedbackTimerRef.current = null;
    }, 380);
  };

  const handleSymbolClick = (symbolId) => {
    if (!discoveredSymbols[symbolId]) {
      triggerLockedFeedback(symbolId);
      return;
    }

    playUiTap();
    setTappedSymbols((prev) => ({ ...prev, [symbolId]: true }));
    setSelectedSymbol(symbolId);
    setShowPopup(true);
    onPopupOpen?.();
    onSymbolClick?.(symbolId);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedSymbol(null);
    onPopupClose?.();
  };

  const handleCelebrateClick = () => {
    playCardRevealChime();
    onCelebrate?.();
  };

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
                  <button
                    type="button"
                    key={symbolId}
                    id={`sidebar-${symbolId}`}
                    className={[
                      'symbol-discovery-icon',
                      isHighlighted ? 'symbol-discovery-pulse' : '',
                      isTapped ? 'symbol-discovery-tapped' : '',
                      needsAttention ? 'symbol-discovery-soft-glow' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleSymbolClick(symbolId)}
                    aria-label={symbol.title}
                  >
                    <img src={symbol.colorIcon} alt={symbol.title} />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="symbol-discovery-celebrate-btn"
              onClick={handleCelebrateClick}
            >
              Celebrate!
            </button>
          </div>
        </div>

        {showPopup && selectedSymbol && (
          <SymbolCardModal
            symbolId={selectedSymbol}
            onClose={closePopup}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className={`ganesha-sidebar ${className}`} style={zoneThemeVars}>
        {displaySymbols.map((symbolId) => {
          const symbol = symbolInfo[symbolId];
          const isDiscovered = discoveredSymbols[symbolId];
          const needsAttention = isDiscovered && !tappedSymbols[symbolId];

          return (
            <button
              type="button"
              key={symbolId}
              className="ganesha-icon-hitarea"
              onClick={() => handleSymbolClick(symbolId)}
              aria-label={isDiscovered ? symbol.title : `${symbol.title} not yet discovered`}
              title={isDiscovered ? symbol.title : 'Symbol not yet discovered'}
            >
              <div
                id={`sidebar-${symbolId}`}
                className={[
                  getIconClass(symbolId),
                  needsAttention ? 'ganesha-icon-soft-glow' : '',
                  lockedFeedbackSymbol === symbolId ? 'ganesha-icon-locked-feedback' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  backgroundImage: `url(${symbol.colorIcon})`,
                  cursor: isDiscovered ? 'pointer' : 'not-allowed',
                }}
              />
            </button>
          );
        })}
      </div>

      {showPopup && selectedSymbol && (
        <SymbolCardModal
          symbolId={selectedSymbol}
          onClose={closePopup}
        />
      )}
    </>
  );
};

export default SymbolSidebar;
