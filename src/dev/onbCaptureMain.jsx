// Dev-only harness: renders Parent Gate / Add-Friend create flow for layout capture.
import React from 'react';
import '../index.css';
import '../App.css';
import { createRoot } from 'react-dom/client';
import ParentGate from '../lib/components/onboarding/ParentGate';
import CleanProfileSelector from '../lib/components/navigation/CleanProfileSelector';
import ProgressPopup from '../lib/components/navigation/ProgressPopup';
import { symbolCardContent } from '../zones/symbol-mountain/shared/components/symbolCardContent';
import CleanGameWelcomeScreen from '../lib/components/navigation/CleanGameWelcomeScreen';

const s = new URLSearchParams(location.search).get('s');
if (s === 'welcome' || s === 'welcomemodal') {
  localStorage.setItem('gameProfiles', JSON.stringify({ schemaVersion: 1, lastUpdated: Date.now(), profiles: { p1: { id: 'p1', name: 'Madhurima', avatar: 'elephant', age: 7 } } }));
  localStorage.setItem('activeProfileId', 'p1');
  localStorage.setItem('p1_sceneState_demo', JSON.stringify({ completed: true, stars: 3 }));
}
const popupItems = Object.entries(symbolCardContent).map(([id, d]) => ({ id, name: d.label || d.title || id, image: d.icon || d.image, description: d.description || d.gift || '' }));
const popupId = new URLSearchParams(location.search).get('id') || 'mooshika';
createRoot(document.getElementById('root')).render(
  s === 'popup'
    ? <ProgressPopup isOpen onClose={() => {}} title="Sacred Symbols" items={popupItems} completedItems={Object.keys(symbolCardContent)} type="symbols" directItemId={popupId} />
    : s === 'welcome' || s === 'welcomemodal'
    ? <CleanGameWelcomeScreen onContinue={() => {}} onNewGame={() => {}} onClose={() => {}} displayMode={s === 'welcome' ? 'fullscreen' : 'modal'} />
    : s === 'gate'
    ? <ParentGate onComplete={() => {}} onBackToWelcome={() => {}} />
    : <CleanProfileSelector forceCreate profiles={{}} onProfileSelect={() => {}} onBackToMap={() => {}} />
);
