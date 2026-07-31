import React, { useState } from 'react';
import CloseButton from '../../../components/CloseButton';

const FeelingsHelper = () => {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [animate, setAnimate] = useState(false);

  const emotions = [
    {
      id: 'nervous',
      name: 'Nervous',
      emoji: '😰',
      color: '#FFD166',
      explanation: 'When you feel nervous about something, saying the Vakratunda shloka can help you feel calm and brave. Ganesha helps remove the obstacle of fear!',
      exampleSituation: 'Like before a school presentation or a tough test'
    },
    {
      id: 'angry',
      name: 'Angry',
      emoji: '😡',
      color: '#EF476F',
      explanation: 'When you feel angry, the shloka can help you cool down. Ganesha gives you patience and reminds you that obstacles are temporary.',
      exampleSituation: 'When a friend breaks your toy or someone says something mean'
    },
    {
      id: 'sad',
      name: 'Sad',
      emoji: '😢',
      color: '#118AB2',
      explanation: 'When you feel sad, the shloka can bring comfort. Ganesha reminds you that you are strong enough to overcome any challenge.',
      exampleSituation: 'If you miss someone or something didn\'t go your way'
    },
    {
      id: 'confused',
      name: 'Confused',
      emoji: '😕',
      color: '#06D6A0',
      explanation: 'When you feel confused or stuck, the shloka helps clear your mind. Ganesha brings wisdom to solve problems!',
      exampleSituation: 'When homework seems too difficult or you don\'t understand something'
    },
    {
      id: 'worried',
      name: 'Worried',
      emoji: '😟',
      color: '#9C6644',
      explanation: 'When you feel worried about what might happen, the shloka helps you trust in Ganesha. He removes obstacles before they even appear!',
      exampleSituation: 'When you\'re worried about making friends at a new school'
    },
    {
      id: 'shy',
      name: 'Shy',
      emoji: '😳',
      color: '#8338EC',
      explanation: 'When you feel shy or scared to speak up, the shloka gives you confidence. Ganesha makes the path easier for you!',
      exampleSituation: 'When you want to ask a question or make a new friend'
    }
  ];

  const handleEmotionClick = (emotion) => {
    if (selectedEmotion && selectedEmotion.id === emotion.id) {
      setAnimate(false);
      setTimeout(() => setSelectedEmotion(null), 300);
      return;
    }

    if (selectedEmotion) {
      setAnimate(false);
      setTimeout(() => {
        setSelectedEmotion(emotion);
        setAnimate(true);
      }, 300);
    } else {
      setSelectedEmotion(emotion);
      setAnimate(true);
    }
  };

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => setSelectedEmotion(null), 300);
  };

  return (
    <div className="feelings-helper-container" style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '15px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      fontFamily: "'Comic Sans MS', 'Bubblegum Sans', sans-serif",
      position: 'relative',
    }}>
      <h2 style={{
        textAlign: 'center',
        color: '#5D1049',
        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
        marginBottom: '15px'
      }}>
        How Does Ganesha&apos;s Shloka Help Your Feelings?
      </h2>

      <p style={{
        textAlign: 'center',
        fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
        color: '#333',
        marginBottom: '20px'
      }}>
        Tap on a feeling to see how saying the shloka can help you feel better!
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {emotions.map((emotion) => (
          <div
            key={emotion.id}
            onClick={() => handleEmotionClick(emotion)}
            style={{
              backgroundColor: emotion.color,
              padding: '15px 5px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transform: selectedEmotion?.id === emotion.id ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
          >
            <span style={{ fontSize: '28px', marginBottom: '8px' }}>{emotion.emoji}</span>
            <span style={{
              fontSize: 'clamp(0.8rem, 2vw, 1rem)',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              {emotion.name}
            </span>
          </div>
        ))}
      </div>

      {selectedEmotion && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
          marginTop: '10px',
          position: 'relative',
          borderLeft: `8px solid ${selectedEmotion.color}`,
          opacity: animate ? 1 : 0,
          transform: animate ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}>
          <CloseButton onClose={handleClose} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '15px',
          }}>
            <span style={{
              fontSize: '40px',
              marginRight: '15px',
              backgroundColor: selectedEmotion.color,
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {selectedEmotion.emoji}
            </span>
            <div>
              <h3 style={{
                margin: '0 0 5px 0',
                fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                color: selectedEmotion.color
              }}>
                Feeling {selectedEmotion.name}
              </h3>
              <p style={{
                margin: '0',
                fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                fontStyle: 'italic',
                color: '#666'
              }}>
                {selectedEmotion.exampleSituation}
              </p>
            </div>
          </div>

          <p style={{
            margin: '0 0 15px 0',
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            lineHeight: '1.5',
            color: '#333'
          }}>
            {selectedEmotion.explanation}
          </p>

          <div style={{
            backgroundColor: '#F8F9FA',
            borderRadius: '10px',
            padding: '12px',
            marginTop: '15px'
          }}>
            <p style={{
              margin: '0',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              fontWeight: 'bold',
              color: '#5D1049'
            }}>
              Try it: Take a deep breath and say:
            </p>
            <p style={{
              margin: '10px 0 0 0',
              fontSize: 'clamp(0.8rem, 2vw, 1rem)',
              fontStyle: 'italic',
              textAlign: 'center',
              color: '#5D1049'
            }}>
              Vakratunda Mahakaya Suryakoti Samaprabha<br />
              Nirvighnam Kuru Me Deva Sarva-Kaaryeshu Sarvada
            </p>
          </div>
        </div>
      )}

      {!selectedEmotion && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '10px',
          animation: 'bounce 2s infinite'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#666'
          }}>
            <span style={{ fontSize: '24px' }}>👆</span>
            <span style={{ fontSize: '14px', marginTop: '5px' }}>Tap an emotion</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default FeelingsHelper;
