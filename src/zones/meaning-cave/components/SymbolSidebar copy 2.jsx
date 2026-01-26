import React, { useState, useEffect } from 'react';
import './SymbolSidebar.css';

// Import your symbol images
import vakratundaSymbol from '../assets/images/symbols/vakratunda-symbol.png';
import mahakayaSymbol from '../assets/images/symbols/mahakaya-symbol.png';
import suryakotiSymbol from '../assets/images/symbols/suryakoti-symbol.png';
import samaprabhaSymbol from '../assets/images/symbols/samaprabha-symbol.png';
import nirvighnamSymbol from '../assets/images/symbols/nirvighnam-symbol.png';
import kurumedevaSymbol from '../assets/images/symbols/kurumedeva-symbol.png';
import sarvakaryeshuSymbol from '../assets/images/symbols/sarvakaryeshu-symbol.png';
import sarvadaSymbol from '../assets/images/symbols/sarvada-symbol.png';

// App information for popups (like symbolInfo in SymbolSidebar)
const appInfo = {
  vakratunda: {
    title: "वक्रतुण्ड - Vakratunda",
    description: "Vakratunda means 'Curved Trunk'. Ganesha's trunk is curved like a hook! It can pick up tiny things and big things too. His curved trunk makes him super special!",
    colorIcon: vakratundaSymbol,
    grayIcon: vakratundaSymbol,  // CSS will grayscale it
    syllables: ['VA', 'KRA', 'TUN', 'DA'],
    power: { name: 'Curved Trunk', icon: '🐘', color: '#FFD700' }
  },
  mahakaya: {
    title: "महाकाय - Mahakaya", 
    description: "Mahakaya means 'Great Body'. Ganesha has a BIG, strong body! He's powerful and can help with big problems. Even though he's big, he's super gentle!",
    colorIcon: mahakayaSymbol,
    grayIcon: mahakayaSymbol,
    syllables: ['MA', 'HA', 'KA', 'YA'],
    power: { name: 'Great Body', icon: '💪', color: '#FF6B35' }
  },
  suryakoti: {
    title: "सूर्यकोटि - Suryakoti",
    description: "Suryakoti means 'Million Suns'. Ganesha shines as bright as a MILLION suns! He brings light and happiness. Imagine a million suns - that's how bright!",
    colorIcon: suryakotiSymbol,
    grayIcon: suryakotiSymbol,
    syllables: ['SUR', 'YA', 'KO', 'TI'],
    power: { name: 'Million Suns', icon: '☀️', color: '#FFC107' }
  },
  samaprabha: {
    title: "समप्रभ - Samaprabha",
    description: "Samaprabha means 'Equal Radiance'. Ganesha's light shines the same for EVERYONE! He treats everyone fairly. He loves everyone equally - including you!",
    colorIcon: samaprabhaSymbol,
    grayIcon: samaprabhaSymbol,
    syllables: ['SA', 'MA', 'PRA', 'BHA'],
    power: { name: 'Equal Radiance', icon: '🌟', color: '#2196F3' }
  },
  nirvighnam: {
    title: "निर्विघ्नं - Nirvighnam",
    description: "Nirvighnam means 'Without Obstacles'. Ganesha removes all the blocks in your way! He helps you finish things smoothly. Call on him when things get tough!",
    colorIcon: nirvighnamSymbol,
    grayIcon: nirvighnamSymbol,
    syllables: ['NIR', 'VIGH', 'NAM'],
    power: { name: 'Clear Path', icon: '🌈', color: '#9C27B0' }
  },
  kurumedeva: {
    title: "कुरुमेदेव - Kurumedeva",
    description: "Kurumedeva means 'Please Do for Me, O Divine One'. When we ask Ganesha nicely, he helps us! It's like saying 'Please help me!'. Always remember to say please!",
    colorIcon: kurumedevaSymbol,
    grayIcon: kurumedevaSymbol,
    syllables: ['KU', 'RU', 'ME', 'DEVA'],
    power: { name: 'Protection', icon: '🛡️', color: '#4CAF50' }
  },
  sarvakaryeshu: {
    title: "सर्वकार्येषु - Sarvakaryeshu", 
    description: "Sarvakaryeshu means 'In All Tasks'. In EVERYTHING you do - homework, play, eating - Ganesha can help! Every task becomes easier with Ganesha!",
    colorIcon: sarvakaryeshuSymbol,
    grayIcon: sarvakaryeshuSymbol,
    syllables: ['SAR', 'VA', 'KAR', 'YE', 'SHU'],
    power: { name: 'Success', icon: '🏆', color: '#795548' }
  },
  sarvada: {
    title: "सर्वदा - Sarvada",
    description: "Sarvada means 'Always'. Ganesha is ALWAYS there for you! Morning, afternoon, night - he never leaves. He's your forever friend!",
    colorIcon: sarvadaSymbol,
    grayIcon: sarvadaSymbol,
    syllables: ['SAR', 'VA', 'DA'],
    power: { name: 'Generosity', icon: '🎁', color: '#FF9800' }
  }
};

const AppSidebar = ({ unlockedSymbols = {}, onAppClick, className = '' }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [animatingApp, setAnimatingApp] = useState(null);

  // App order for display (matching scene progression)
  const appOrder = ['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva','sarvakaryeshu', 'sarvada'];

const handleAppClick = (appId) => {
  if (unlockedSymbols[appId]) {  // ← CHANGED!
    setSelectedApp(appId);
    setShowPopup(true);
    // Remove onAppClick to prevent second popup
  }
};

// Add these new functions (replace the placeholder ones):
const handleSyllableClick = (syllable, appId) => {
  console.log(`Playing syllable: ${syllable} for app: ${appId}`);
  
  // Use the same audio logic as VakratundaGrove
  const syllableFileMap = {
    'VA': 'vakratunda-va',
    'KRA': 'vakratunda-kra', 
    'TUN': 'vakratunda-tun',
    'DA': 'vakratunda-da',
    'MA': 'mahakaya-ma',
    'HA': 'mahakaya-ha',
    'KA': 'mahakaya-ka',
    'YA': 'mahakaya-ya',
    'SUR': 'suryakoti-sur',
    'YA': 'suryakoti-ya',
    'KO': 'suryakoti-ko',
    'TI': 'suryakoti-ti',
    'SA': 'samaprabha-sa',
    'MA': 'samaprabha-ma',
    'PRA': 'samaprabha-pra',
    'BHA': 'samaprabha-bha',
    'NIR': 'nirvighnam-nir',
    'VIGH': 'nirvighnam-vigh',
    'NAM': 'nirvighnam-nam',
    'KU': 'kurumedeva-ku',
    'RU': 'kurumedeva-ru',
    'ME': 'kurumedeva-me',
    'DEVA': 'kurumedeva-deva',
    'SAR': 'sarvada-sar',
    'VA': 'sarvada-va',
    'DA': 'sarvada-da',
    'KAR': 'sarvakaryeshu-kar',
    'YE': 'sarvakaryeshu-ye',
    'SHU': 'sarvakaryeshu-shu'
  };
  
  const fileName = syllableFileMap[syllable] || `${appId}-${syllable.toLowerCase()}`;
  playAudio(`/audio/syllables/${fileName}.mp3`);
};

const handleWordPlay = (appId) => {
  console.log(`Playing word: ${appId}`);
  playAudio(`/audio/words/${appId}.mp3`);
};

// Add the playAudio function (copy from VakratundaGrove):
const playAudio = (audioPath, volume = 1.0) => {
  try {
    const audio = new Audio(audioPath);
    audio.volume = volume;
    return audio.play().catch(e => {
      console.log(`Audio not found: ${audioPath}`);
      return Promise.resolve();
    });
  } catch (error) {
    console.log(`Audio error: ${error.message}`);
    return Promise.resolve();
  }
};

  const closePopup = () => {
    setShowPopup(false);
    setSelectedApp(null);
  };

useEffect(() => {
  const newlyUnlocked = appOrder.find(app => 
    unlockedSymbols[app] && !animatingApp
  );
    
    if (newlyUnlocked) {
      setAnimatingApp(newlyUnlocked);
      setTimeout(() => {
        setAnimatingApp(null);
      }, 1000);
    }
}, [unlockedSymbols, animatingApp]);
  return (
    <>
      <div className={`app-sidebar ${className}`}>
        {appOrder.map((appId) => {
          const app = appInfo[appId];
const isUnlocked = unlockedSymbols[appId];
          const isAnimating = animatingApp === appId;
          
          return (
            <div
              key={appId}
              className={`app-icon ${isUnlocked ? 'unlocked' : 'locked'} ${isAnimating ? 'star-burst' : ''}`}
              onClick={() => handleAppClick(appId)}
              style={{
                backgroundImage: `url(${isUnlocked ? app.colorIcon : app.grayIcon})`,
                cursor: isUnlocked ? 'pointer' : 'not-allowed'
              }}
              title={isUnlocked ? app.title : 'App not yet unlocked'}
            />
          );
        })}
      </div>

      {/* App Information Popup (like SymbolSidebar popup) */}
      {showPopup && selectedApp && (
        <div className="app-popup-overlay" onClick={closePopup}>
          <div className="app-popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close-btn" onClick={closePopup}>×</button>
            
            <div className="popup-app-icon">
              <img 
                src={appInfo[selectedApp].colorIcon} 
                alt={appInfo[selectedApp].title}
                className="popup-app-image"
              />
            </div>
            
            <h2 className="popup-title">{appInfo[selectedApp].title}</h2>
            <p className="popup-description">{appInfo[selectedApp].description}</p>
            
{/* Syllable Practice Buttons */}
<div className="syllable-practice">
  {appInfo[selectedApp].syllables.map(syllable => (
    <button 
      key={syllable} 
      className="syllable-btn"
      onClick={() => handleSyllableClick(syllable, selectedApp)}
    >
      {syllable}
    </button>
  ))}
</div>

{/* Add Word Practice Button */}
<button 
  className="word-practice-btn"
  onClick={() => handleWordPlay(selectedApp)}
>
  🎵 {selectedApp.toUpperCase()}
</button>
            
       <button className="popup-continue-btn" onClick={closePopup}>
  Close
</button>
          </div>
        </div>
      )}


    </>
  );
};

export default AppSidebar;