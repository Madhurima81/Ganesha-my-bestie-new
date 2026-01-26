import React, { useState } from 'react';

// Import your symbol images
import vakratundaSymbol from '../assets/images/symbols/vakratunda-symbol.png';
import mahakayaSymbol from '../assets/images/symbols/mahakaya-symbol.png';
import suryakotiSymbol from '../assets/images/symbols/suryakoti-symbol.png';
import samaprabhaSymbol from '../assets/images/symbols/samaprabha-symbol.png';
import nirvighnamSymbol from '../assets/images/symbols/nirvighnam-symbol.png';
import kurumedevaSymbol from '../assets/images/symbols/kurumedeva-symbol.png';
import sarvakaryeshuSymbol from '../assets/images/symbols/sarvakaryeshu-symbol.png';
import sarvadaSymbol from '../assets/images/symbols/sarvada-symbol.png';

const symbolInfo = {
  vakratunda: {
    title: "वक्रतुण्ड",
    transliteration: "VAKRATUNDA",
    meaning: "Curved Trunk",
    kidExplanation: "Ganesha's trunk is curved like a hook! It can pick up tiny things and big things too.",
    funFact: "His curved trunk makes him super special!",
    image: vakratundaSymbol,
    syllables: ['VA', 'KRA', 'TUN', 'DA'],
    color: '#FFD700',
    number: 1
  },
  mahakaya: {
    title: "महाकाय",
    transliteration: "MAHAKAYA", 
    meaning: "Great Body",
    kidExplanation: "Ganesha has a BIG, strong body! He's powerful and can help with big problems.",
    funFact: "Even though he's big, he's super gentle!",
    image: mahakayaSymbol,
    syllables: ['MA', 'HA', 'KA', 'YA'],
    color: '#FF6B35',
    number: 2
  },
  suryakoti: {
    title: "सूर्यकोटि",
    transliteration: "SURYAKOTI",
    meaning: "Million Suns",
    kidExplanation: "Ganesha shines as bright as a MILLION suns! He brings light and happiness.",
    funFact: "Imagine a million suns - that's how bright!",
    image: suryakotiSymbol,
    syllables: ['SUR', 'YA', 'KO', 'TI'],
    color: '#FFC107',
    number: 3
  },
  samaprabha: {
    title: "समप्रभ",
    transliteration: "SAMAPRABHA",
    meaning: "Equal Radiance",
    kidExplanation: "Ganesha's light shines the same for EVERYONE! He treats everyone fairly.",
    funFact: "He loves everyone equally - including you!",
    image: samaprabhaSymbol,
    syllables: ['SA', 'MA', 'PRA', 'BHA'],
    color: '#2196F3',
    number: 4
  },
  nirvighnam: {
    title: "निर्विघ्नं",
    transliteration: "NIRVIGHNAM",
    meaning: "Without Obstacles",
    kidExplanation: "Ganesha removes all the blocks in your way! He helps you finish things smoothly.",
    funFact: "Call on him when things get tough!",
    image: nirvighnamSymbol,
    syllables: ['NIR', 'VIGH', 'NAM'],
    color: '#9C27B0',
    number: 5
  },
  kurumedeva: {
    title: "कुरुमेदेव",
    transliteration: "KURUMEDEVA",
    meaning: "Please Do for Me, O Divine One",
    kidExplanation: "When we ask Ganesha nicely, he helps us! It's like saying 'Please help me!'",
    funFact: "Always remember to say please!",
    image: kurumedevaSymbol,
    syllables: ['KU', 'RU', 'ME', 'DEVA'],
    color: '#4CAF50',
    number: 6
  },
  sarvakaryeshu: {
    title: "सर्वकार्येषु",
    transliteration: "SARVAKARYESHU",
    meaning: "In All Tasks",
    kidExplanation: "In EVERYTHING you do - homework, play, eating - Ganesha can help!",
    funFact: "Every task becomes easier with Ganesha!",
    image: sarvakaryeshuSymbol,
    syllables: ['SAR', 'VA', 'KAR', 'YE', 'SHU'],
    color: '#795548',
    number: 7
  },
  sarvada: {
    title: "सर्वदा",
    transliteration: "SARVADA",
    meaning: "Always",
    kidExplanation: "Ganesha is ALWAYS there for you! Morning, afternoon, night - he never leaves.",
    funFact: "He's your forever friend!",
    image: sarvadaSymbol,
    syllables: ['SAR', 'VA', 'DA'],
    color: '#FF9800',
    number: 8
  }
};

const SymbolSidebar = ({ unlockedSymbols = {}, onSymbolClick, currentWord = 'CAVE OF SECRETS' }) => {
  console.log('🔮 SymbolSidebar RENDERING!', { unlockedSymbols });
  
  const [showPopup, setShowPopup] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  const symbolOrder = ['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva', 'sarvakaryeshu', 'sarvada'];

  const handleSymbolClick = (symbolId) => {
    if (unlockedSymbols[symbolId]) {
      setSelectedSymbol(symbolId);
      setShowPopup(true);
      if (onSymbolClick) onSymbolClick(symbolId);
    }
  };

  const playAudio = (audioPath) => {
    try {
      const audio = new Audio(audioPath);
      audio.volume = 1.0;
      audio.play().catch(e => console.log(`Audio not found: ${audioPath}`));
    } catch (error) {
      console.log(`Audio error: ${error.message}`);
    }
  };

  // Get currently unlocked word for header
  const getCurrentWord = () => {
    const unlocked = symbolOrder.filter(id => unlockedSymbols[id]);
    if (unlocked.length === 0) return 'CAVE OF SECRETS';
    return symbolInfo[unlocked[unlocked.length - 1]].transliteration;
  };

  return (
    <>
      {/* Right Sidebar - Image 2 Style */}
      <div 
        style={{
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'white',
          borderRadius: '20px',
          padding: '15px 12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          zIndex: 10000,
          width: '80px',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}
      >
        {/* Header with current word */}
        <div style={{
          background: 'linear-gradient(135deg, #FFA500, #FF8C00)',
          borderRadius: '12px',
          padding: '8px 6px',
          marginBottom: '8px',
          boxShadow: '0 2px 8px rgba(255, 165, 0, 0.3)'
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            lineHeight: '1.2',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            {getCurrentWord()}
          </div>
        </div>

        {/* Number indicators for unlocked symbols */}
        <div style={{
          display: 'flex',
          gap: '6px',
          justifyContent: 'center',
          marginBottom: '10px',
          flexWrap: 'wrap'
        }}>
          {symbolOrder.map((symbolId) => {
            const symbol = symbolInfo[symbolId];
            const isUnlocked = unlockedSymbols[symbolId];
            
            return (
              <div
                key={symbolId}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isUnlocked 
                    ? 'linear-gradient(135deg, #FFA500, #FF8C00)' 
                    : 'linear-gradient(135deg, #E0E0E0, #BDBDBD)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'white',
                  boxShadow: isUnlocked 
                    ? '0 2px 8px rgba(255, 165, 0, 0.4)' 
                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleSymbolClick(symbolId)}
                onMouseEnter={(e) => {
                  if (isUnlocked) e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {symbol.number}
              </div>
            );
          })}
        </div>

        {/* Symbol icons */}
        {symbolOrder.map((symbolId) => {
          const symbol = symbolInfo[symbolId];
          const isUnlocked = unlockedSymbols[symbolId];
          
          return (
            <div
              key={symbolId}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundImage: `url(${symbol.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '3px solid',
                borderColor: isUnlocked ? symbol.color : 'transparent',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                opacity: isUnlocked ? 1 : 0.3,
                filter: isUnlocked ? 'none' : 'grayscale(1)',
                transition: 'all 0.3s ease',
                boxShadow: isUnlocked 
                  ? '0 3px 10px rgba(0, 0, 0, 0.2)' 
                  : '0 2px 4px rgba(0, 0, 0, 0.1)',
                position: 'relative'
              }}
              onClick={() => handleSymbolClick(symbolId)}
              onMouseEnter={(e) => {
                if (isUnlocked) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = isUnlocked 
                  ? '0 3px 10px rgba(0, 0, 0, 0.2)' 
                  : '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
              title={isUnlocked ? symbol.transliteration : '🔒 Keep learning!'}
            >
              {!isUnlocked && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '24px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}>
                  🔒
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Popup - Your Cave of Secrets Style */}
      {showPopup && selectedSymbol && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setShowPopup(false)}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              borderRadius: '25px',
              padding: '35px',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowPopup(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'rgba(255, 68, 68, 0.1)',
                border: '2px solid rgba(255, 68, 68, 0.3)',
                borderRadius: '50%',
                fontSize: '24px',
                color: '#ff4444',
                cursor: 'pointer',
                width: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              ×
            </button>
            
            <div style={{
              background: 'white',
              border: `4px solid ${symbolInfo[selectedSymbol].color}`,
              borderRadius: '20px',
              padding: '25px',
              marginBottom: '25px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#333'
              }}>
                {symbolInfo[selectedSymbol].title}
              </div>
              
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#666',
                letterSpacing: '2px',
                marginBottom: '20px'
              }}>
                {symbolInfo[selectedSymbol].transliteration}
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #fff9e6, #fffbf0)',
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '15px'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#888',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '5px'
                }}>
                  Word Meaning
                </div>
                <div style={{
                  fontSize: '22px',
                  fontWeight: 'bold',
                  color: '#2c3e50'
                }}>
                  {symbolInfo[selectedSymbol].meaning}
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #e3f2fd, #f1f8ff)',
                borderLeft: '4px solid #2196F3',
                borderRadius: '10px',
                padding: '15px',
                textAlign: 'left',
                fontSize: '16px',
                lineHeight: '1.6',
                marginBottom: '12px',
                color: '#333'
              }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>👶</span>
                {symbolInfo[selectedSymbol].kidExplanation}
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #fff3e0, #fffaf0)',
                borderLeft: '4px solid #FF9800',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'left',
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#555'
              }}>
                <span style={{ fontSize: '20px', marginRight: '8px' }}>✨</span>
                <strong>Fun Fact:</strong> {symbolInfo[selectedSymbol].funFact}
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#555',
                marginBottom: '12px'
              }}>
                🎵 Practice the Sounds
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                justifyContent: 'center', 
                flexWrap: 'wrap' 
              }}>
                {symbolInfo[selectedSymbol].syllables.map(syllable => (
                  <button 
                    key={syllable}
                    onClick={() => playAudio(`/audio/syllables/${selectedSymbol}-${syllable.toLowerCase()}.mp3`)}
                    style={{
                      background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                      border: 'none',
                      color: 'white',
                      padding: '10px 18px',
                      borderRadius: '25px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(76, 175, 80, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1) translateY(-2px)';
                      e.target.style.boxShadow = '0 5px 15px rgba(76, 175, 80, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 3px 10px rgba(76, 175, 80, 0.3)';
                    }}
                  >
                    {syllable}
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => playAudio(`/audio/words/${selectedSymbol}.mp3`)}
              style={{
                background: `linear-gradient(135deg, ${symbolInfo[selectedSymbol].color}, ${symbolInfo[selectedSymbol].color}dd)`,
                border: 'none',
                color: 'white',
                padding: '14px 30px',
                borderRadius: '30px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '15px',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05) translateY(-3px)';
                e.target.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.4)';
              }}
            >
              🔊 Listen Again
            </button>
            
            <button 
              onClick={() => setShowPopup(false)}
              style={{
                background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                border: 'none',
                color: 'white',
                padding: '14px 35px',
                borderRadius: '30px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 107, 53, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05) translateY(-3px)';
                e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.4)';
              }}
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SymbolSidebar;