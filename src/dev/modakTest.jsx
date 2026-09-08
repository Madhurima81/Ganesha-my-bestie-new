// Throwaway harness: mounts the reworked Modak scene with zero navigation.
// Open /modak-test.html (add ?debugModak=1 for the beat-jump buttons).
import React from 'react';
import { createRoot } from 'react-dom/client';
import NewModakScene from '../zones/symbol-mountain/scenes/modak/NewModakSceneV7';

const TEST_PROFILE = 'test_modak_direct';
try {
  localStorage.setItem('activeProfileId', TEST_PROFILE);
  const gp = JSON.parse(localStorage.getItem('gameProfiles') || '{"profiles":{}}');
  if (!gp.profiles[TEST_PROFILE]) {
    gp.profiles[TEST_PROFILE] = {
      id: TEST_PROFILE, name: 'Test', avatar: 'monkey', color: '#FF5722',
      createdAt: Date.now(), totalStars: 0, completedScenes: 0
    };
    localStorage.setItem('gameProfiles', JSON.stringify(gp));
  }
  // Start every load fresh at the opening modal.
  Object.keys(localStorage)
    .filter((k) => k.includes('symbol-mountain') && k.includes('modak'))
    .forEach((k) => localStorage.removeItem(k));
} catch (e) {
  console.error('modakTest profile setup failed', e);
}

const props = {
  onComplete: (r) => console.log('SCENE COMPLETE', r),
  onNavigate: (d, data) => console.log('NAVIGATE', d, data),
  zoneId: 'symbol-mountain',
  sceneId: 'modak'
};

createRoot(document.getElementById('modak-test-root')).render(
  <React.StrictMode>
    <NewModakScene {...props} />
  </React.StrictMode>
);
