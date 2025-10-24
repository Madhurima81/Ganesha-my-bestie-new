// GaneshaBlessing.jsx - Complete Blessing Ceremony Component
import React, { useState, useEffect, useRef } from 'react';
import './GaneshaBlessing.css';

import ganeshaImage from '../assets/images/ganesha_with_headphones.png';



const GaneshaBlessing = ({ 
  power, 
  characterGender = 'boy',
  onBlessingComplete,
  ganeshaImage = ganeshaImage, // Use the imported image
  characterImage = null,
  show = true
}) => {
  const [blessingPhase, setBlessingPhase] = useState('welcome');
  const [showRecording, setShowRecording] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const timeoutRefs = useRef([]);

  // Power configuration
  const powerConfig = {
    vakratunda: {
      name: 'Flexibility',
      icon: '🌀',
      color: '#FFD700',
      blessing: "I bless you with the power of flexibility!",
      description: "Like my curved trunk, you can find new paths around any obstacle.",
      element: 'curves'
    },
    mahakaya: {
      name: 'Inner Strength', 
      icon: '💎',
      color: '#FF6B35',
      blessing: "I bless you with inner strength!",
      description: "Like my mighty form, you have the power to help others in need.",
      element: 'strength'
    },
    suryakoti: {
      name: 'Illumination',
      icon: '☀️', 
      color: '#FFA500',
      blessing: "I bless you with the light of a million suns!",
      description: "Your inner light can guide others through darkness.",
      element: 'light'
    },
    samaprabha: {
      name: 'Harmony',
      icon: '⚖️',
      color: '#9C27B0', 
      blessing: "I bless you with perfect harmony!",
      description: "You can bring balance and peace wherever you go.",
      element: 'balance'
    }
  };

  const currentPower = powerConfig[power] || powerConfig.vakratunda;

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(id => clearTimeout(id));
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Safe timeout function
  const safeSetTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay);
    timeoutRefs.current.push(id);
    return id;
  };

  // Start blessing sequence with speech bubbles
  useEffect(() => {
    if (!show) return;

    const blessingSequence = async () => {
      try {
        // Phase 1: Welcome (3 seconds)
        setBlessingPhase('welcome');
        await new Promise(resolve => safeSetTimeout(resolve, 3000));

        // Phase 2: Blessing announcement (4 seconds)
        setBlessingPhase('blessing');
        await new Promise(resolve => safeSetTimeout(resolve, 4000));

        // Phase 3: Power transfer animation (4 seconds)
        setBlessingPhase('transfer');
        await new Promise(resolve => safeSetTimeout(resolve, 4000));

        // Phase 4: Recording invitation
        setBlessingPhase('recording');
        setShowRecording(true);

      } catch (error) {
        console.error('Blessing sequence error:', error);
        // Continue to recording phase even if error
        setBlessingPhase('recording');
        setShowRecording(true);
      }
    };

    blessingSequence();
  }, [show, power]);

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setHasRecorded(true);
        setIsRecording(false);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 5 seconds
      safeSetTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 5000);

    } catch (error) {
      console.error('Recording failed:', error);
      // Graceful fallback
      setHasRecorded(true);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play().catch(e => console.log('Playback failed:', e));
    }
  };

  const handleRecordingComplete = () => {
    setBlessingPhase('complete');
    
    safeSetTimeout(() => {
      if (onBlessingComplete) {
        onBlessingComplete({
          power: power,
          powerConfig: currentPower,
          recording: audioBlob,
          timestamp: Date.now()
        });
      }
    }, 2000);
  };

  const handleSkipRecording = () => {
    setBlessingPhase('complete');
    
    safeSetTimeout(() => {
      if (onBlessingComplete) {
        onBlessingComplete({
          power: power,
          powerConfig: currentPower,
          recording: null,
          timestamp: Date.now()
        });
      }
    }, 2000);
  };

  if (!show) return null;

  return (
    <div className="ganesha-blessing-overlay">
      <div className="blessing-container">
        
        {/* Ganesha Avatar with Dynamic Glow */}
        <div className={`ganesha-avatar ${blessingPhase} power-${power}`}>
          <img 
            src={ganeshaImage}
            alt="Ganesha Blessing"
            className="ganesha-image"
          />
          
          {/* Power Transfer Particles */}
          {blessingPhase === 'transfer' && (
            <div className="power-particles">
              {Array.from({length: 8}).map((_, i) => (
                <div 
                  key={i} 
                  className="particle"
                  style={{ 
                    '--delay': `${i * 0.2}s`,
                    '--color': currentPower.color 
                  }}
                >
                  {currentPower.icon}
                </div>
              ))}
            </div>
          )}

          {/* Recording Pulse Effects */}
          {blessingPhase === 'recording' && isRecording && (
            <div className="recording-pulse">
              <div className="pulse-ring" style={{ borderColor: currentPower.color }}></div>
              <div className="pulse-ring delay-1" style={{ borderColor: currentPower.color }}></div>
              <div className="pulse-ring delay-2" style={{ borderColor: currentPower.color }}></div>
            </div>
          )}
        </div>

        {/* Ganesha Speech Bubble */}
        <div className={`ganesha-speech-bubble ${blessingPhase}`}>
          <div className="speech-bubble-content">
            {blessingPhase === 'welcome' && (
              <>
                <div className="speech-text">Wonderful work!</div>
              </>
            )}
            
            {blessingPhase === 'blessing' && (
              <>
                <div className="speech-text" style={{ color: currentPower.color }}>
                  {currentPower.icon} {currentPower.name} Power!
                </div>
              </>
            )}
            
            {blessingPhase === 'transfer' && (
              <>
                <div className="speech-text" style={{ color: currentPower.color }}>
                  Power flowing to you...
                </div>
              </>
            )}
            
            {blessingPhase === 'recording' && (
              <>
                <div className="speech-text">Say "{power}"</div>
              </>
            )}
            
            {blessingPhase === 'complete' && (
              <>
                <div className="speech-text" style={{ color: currentPower.color }}>
                  {currentPower.name} is yours!
                </div>
              </>
            )}
          </div>
          <div className="speech-bubble-tail"></div>
        </div>
          <div className={`character-receiving ${blessingPhase} power-${power}`}>
            <img 
              src={characterImage}
              alt="Character receiving blessing"
              className="character-image"
            />
          </div>
        

        {/* Recording Interface */}
        {showRecording && blessingPhase === 'recording' && (
          <div className="recording-interface">
            
            {!hasRecorded && !isRecording && (
              <button 
                className="record-button"
                onClick={startRecording}
                style={{ background: `linear-gradient(45deg, ${currentPower.color}, #fff)` }}
              >
                🎤 Record with Ganesha
              </button>
            )}

            {isRecording && (
              <button 
                className="stop-button recording"
                onClick={stopRecording}
                style={{ background: `linear-gradient(45deg, ${currentPower.color}, #ff6b35)` }}
              >
                ⏹️ Listening... (tap to stop)
              </button>
            )}

            {hasRecorded && (
              <div className="recording-complete">
                <button 
                  className="play-button"
                  onClick={playRecording}
                >
                  ▶️ Hear Your Voice
                </button>
                <button 
                  className="complete-button"
                  onClick={handleRecordingComplete}
                  style={{ background: `linear-gradient(45deg, ${currentPower.color}, #4CAF50)` }}
                >
                  ✨ Activate Power!
                </button>
              </div>
            )}

            <div className="skip-section">
              <button 
                className="skip-button"
                onClick={handleSkipRecording}
              >
                Skip Recording (Power still yours!)
              </button>
            </div>

          </div>
        )}

        {/* Power Badge Display */}
        {blessingPhase === 'complete' && (
          <div className="power-badge">
            <div 
              className="power-icon"
              style={{ 
                color: currentPower.color,
                textShadow: `0 0 20px ${currentPower.color}` 
              }}
            >
              {currentPower.icon}
            </div>
            <div className="power-name">{currentPower.name}</div>
            <div className="power-status">GRANTED</div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GaneshaBlessing;