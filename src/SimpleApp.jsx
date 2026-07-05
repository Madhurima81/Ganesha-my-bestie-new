// SimpleApp.jsx - Minimal test version
import React, { useState } from 'react';
import MapZone from './pages/MapZone';
import PondScene from './zones/symbol-mountain/scenes/pond/PondScene';

function SimpleApp() {
  const [view, setView] = useState('map');

  const handleZoneSelect = (zoneId) => {
    console.log('Zone selected:', zoneId);
    if (zoneId === 'symbol-mountain') {
      setView('pond');
    }
  };

  const handleNavigate = (destination) => {
    console.log('Navigate to:', destination);
    if (destination === 'map' || destination === 'zones') {
      setView('map');
    }
  };

  return (
    <div style={{ width: '100vw', height: 'var(--app-height, 100vh)' }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: 'yellow',
        padding: '10px',
        zIndex: 9999
      }}>
        Current View: {view}
      </div>
      
      {view === 'map' && (
        <MapZone onZoneSelect={handleZoneSelect} />
      )}
      
      {view === 'pond' && (
        <PondScene 
          onNavigate={handleNavigate}
          onComplete={() => setView('map')}
        />
      )}
    </div>
  );
}

export default SimpleApp;