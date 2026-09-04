// lib/components/navigation/TocaBocaNav.jsx

import React, { useState, useRef } from 'react';
import './TocaBocaNav.css';

const getZoneName = (zoneId) => {
  const names = {
    'symbol-mountain': 'Symbol Mountain',
    'cave-of-secrets': 'Cave of Secrets',
    'festival-square': 'Festival Square',
    'shloka-river': 'Shloka River',
    'about-me-hut': 'Lambodara Lodge'
  };
  return names[zoneId] || 'Game Zone';
};

const getZoneSubtitle = (zoneId) => {
  const subtitles = {
    'symbol-mountain': 'Discover & Learn',
    'cave-of-secrets': 'Hidden Treasures',
    'festival-square': 'Celebrate & Create',
    'shloka-river': 'Flow & Chant',
    'about-me-hut': 'Your Story'
  };
  return subtitles[zoneId] || 'Have Fun!';
};

const TocaBocaNav = ({
  show,
  onClose,
  onHome,
  onHelp,
  onStartFresh,
  isAudioOn,
  onAudioToggle,
  onParentMenu,
  zoneId = 'symbol-mountain'
}) => {
  const [showParentAccess, setShowParentAccess] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [mathProblem, setMathProblem] = useState({ n1: 0, n2: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const pressTimerRef = useRef(null);

  // --- Logic ---
  const generateProblem = () => {
    setMathProblem({ 
      n1: Math.floor(Math.random() * 10) + 10, 
      n2: Math.floor(Math.random() * 9) + 1 
    });
    setUserAnswer('');
    setErrorMsg('');
  };

  const startPress = () => {
    setIsPressing(true);
    pressTimerRef.current = setTimeout(() => {
      setIsPressing(false);
      generateProblem();
      setShowParentAccess(true);
    }, 1000); 
  };

  const cancelPress = () => {
    setIsPressing(false);
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
  };

  const handleVerify = () => {
    if (parseInt(userAnswer) === mathProblem.n1 + mathProblem.n2) {
      setShowParentAccess(false);
      onClose?.();
      onParentMenu?.('dashboard');
    } else {
      setErrorMsg('Try again!');
      setUserAnswer('');
    }
  };

  const handleMenuAction = (action) => {
    action?.();
    onClose?.();
  };

  return (
    <>
      {show && <div className="menu-overlay" onClick={onClose} />}
      
      <div 
        className={`side-menu ${show ? 'visible' : ''}`}
        data-zone={zoneId} 
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside menu from closing it
      >
        
        {/* HEADER WITH SUBTITLE */}
        <div className="menu-zone-header">
          <h2 className="menu-zone-title">
            {getZoneName(zoneId)}
          </h2>
          <p className="menu-zone-subtitle">
            {getZoneSubtitle(zoneId)}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* PRIMARY */}
          <button 
            className="nav-btn-primary" 
            onClick={() => handleMenuAction(() => {
              if (window.confirm('Restart?')) onStartFresh?.();
            })}
          >
            <span style={{ fontSize: '24px' }}>🔄</span>
            Play Again
          </button>
          
          {/* SECONDARY */}
          <button 
            className="nav-btn-secondary"
            onClick={() => handleMenuAction(onHelp)}
            style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: '15px', paddingLeft: '24px' }}
          >
            <span style={{ fontSize: '24px' }}>❓</span>
            How to Play
          </button>

          {/* SECONDARY SPLIT ROW */}
          <div className="menu-settings-row">
            <button 
              className="nav-btn-secondary"
              onClick={() => handleMenuAction(onHome)}
            >
              <span style={{ fontSize: '24px' }}>🏠</span>
              <span>Map</span>
            </button>

            <button 
              className="nav-btn-secondary"
              onClick={onAudioToggle}
            >
              <span style={{ fontSize: '24px' }}>
                {isAudioOn ? '🔊' : '🔇'}
              </span>
              <span>{isAudioOn ? 'On' : 'Off'}</span>
            </button>
          </div>
          
          {/* PARENT LOCK */}
          <div style={{ marginTop: '10px' }}>
            <button 
              className={`nav-btn-muted ${isPressing ? 'pressing' : ''}`}
              onMouseDown={startPress}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={startPress}
              onTouchEnd={cancelPress}
            >
              <div className="long-press-indicator" />
              <span style={{ fontSize: '24px', zIndex: 2 }}>🐘</span>
              <span style={{ zIndex: 2 }}>Parents (Hold)</span>
            </button>
          </div>
        </div>

        {/* FOOTER HINT */}
        <div className="menu-footer-hint">
          ( Tap outside to close )
        </div>
      </div>

      {/* PARENT MODAL */}
      {showParentAccess && (
        <div className="parent-overlay" onClick={() => setShowParentAccess(false)}>
          <div className="parent-modal" onClick={e => e.stopPropagation()} data-zone={zoneId}>
            <h2 style={{ margin: '0 0 10px 0', color: '#4E342E' }}>Parent Zone</h2>
            <p style={{ color: '#4E342E' }}>
              {mathProblem.n1} + {mathProblem.n2} = ?
            </p>
            
            <input 
              type="number"
              className="parent-input"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              autoFocus
            />
            {errorMsg && <div style={{color:'#F44336', marginBottom:'10px', fontWeight:'bold'}}>{errorMsg}</div>}

            <div style={{display:'flex', justifyContent:'center'}}>
              <button 
                className="parent-button unlock"
                onClick={handleVerify}
              >
                Unlock
              </button>
              <button className="parent-button cancel" onClick={() => setShowParentAccess(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TocaBocaNav;
