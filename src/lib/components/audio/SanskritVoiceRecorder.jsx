// Enhanced SanskritVoiceRecorder.jsx with multiple recording saves
import React, { useState, useRef, useEffect } from 'react';

const SanskritVoiceRecorder = ({
  // Required props
  prompt = "Try saying the word",
  word = "",
  onComplete,
  onSkip,
   appIcon = null, // NEW
  appColor = null, // NEW
  
  // Optional props
  show = true,
  title = "Practice Chanting",
  allowSkip = true,
  autoStart = false,
  maxRecordingTime = 30,
  
  // NEW: Multi-recording props
  savedRecordings = {}, // { vakratunda: [recording1, recording2], mahakaya: [recording1] }
  onSaveRecording, // Callback to save recording to parent state
  
  // Styling props
  containerStyle = {},
  theme = 'sanskrit'
}) => {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permission, setPermission] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // NEW: Multi-recording state
  const [currentRecordingIndex, setCurrentRecordingIndex] = useState(null);
  const [playingRecordingId, setPlayingRecordingId] = useState(null);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  
  // Theme styles
  const themes = {
    sanskrit: {
      background: 'rgba(255, 248, 220, 0.95)',
      border: '2px solid #D2B48C',
      text: '#8B4513',
      primary: '#FF6B35',
      secondary: '#4ECDC4',
      danger: '#E55934',
      accent: '#FFD700'
    }
  };
  
  const currentTheme = themes[theme] || themes.sanskrit;
  
  // Get current word's recordings
  const currentWordRecordings = savedRecordings[word.toLowerCase()] || [];
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);
  
  // Cleanup function
  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Helper function to get syllables for a word
  const getSyllablesForWord = (word) => {
   const syllableMap = {
        'vakratunda':    ['va', 'kra', 'tun', 'da'],
        'mahakaya':      ['ma', 'ha', 'ka', 'ya'],
        'suryakoti':     ['sur', 'ya', 'ko', 'ti'],
        'samaprabha':    ['sa', 'ma', 'pra', 'bha'],
        'nirvighnam':    ['nir', 'vigh', 'nam'],
        'kurumedeva':    ['ku', 'ru', 'me', 'de', 'va'],
        'sarvakaryeshu': ['sar', 'va', 'kar', 'ye', 'shu'],
        'sarvada':       ['sar', 'va', 'da']
      };
    return syllableMap[word.toLowerCase()] || [word];
  };
  
  // Play audio function for reference sounds
  const playAudio = (audioSrc) => {
    try {
      const audio = new Audio(audioSrc);
      audio.volume = 0.8;
      audio.play().catch(e => {
        console.log('Audio file not found, using speech synthesis:', e);
        
        const soundName = audioSrc.split('/').pop().replace('.mp3', '');
        
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(soundName);
          utterance.rate = 0.7;
          utterance.pitch = 1.2;
          utterance.volume = 0.8;
          speechSynthesis.speak(utterance);
        }
      });
    } catch (error) {
      console.log('Audio not available:', error);
    }
  };
  
  // Request microphone permission
  const getMicrophonePermission = async () => {
    if (!("MediaRecorder" in window)) {
      alert("Audio recording not supported in this browser");
      return null;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
        video: false,
      });
      
      setPermission(true);
      streamRef.current = stream;
      return stream;
    } catch (err) {
      console.error("Microphone permission denied:", err);
      alert("Microphone access is needed to record your voice. Please allow microphone access and try again.");
      return null;
    }
  };
  
  // Start recording
  const startRecording = async () => {
    let stream = streamRef.current;
    
    if (!stream) {
      stream = await getMicrophonePermission();
      if (!stream) return;
    }
    
    setRecordingTime(0);
    setIsRecording(true);
    setHasRecorded(false);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prevTime => {
        const newTime = prevTime + 1;
        if (newTime >= maxRecordingTime) {
          stopRecording();
        }
        return newTime;
      });
    }, 1000);
    
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks = [];
      
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      });
      
      mediaRecorder.addEventListener("stop", () => {
        try {
          const audioBlob = new Blob(audioChunks, { 
            type: mediaRecorder.mimeType || 'audio/webm' 
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          setRecordedAudio(audioUrl);
          setHasRecorded(true);
        } catch (err) {
          console.error('Error creating audio blob:', err);
          alert('Recording failed. Please try again.');
          setIsRecording(false);
        }
      });
      
      mediaRecorder.start(100);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Could not start recording. Please check your microphone permissions.');
      setIsRecording(false);
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  // NEW: Save current recording
  const saveCurrentRecording = () => {
    if (recordedAudio && onSaveRecording) {
      const recordingData = {
        id: Date.now(),
        url: recordedAudio,
        duration: recordingTime,
        word: word.toLowerCase(),
        timestamp: new Date().toLocaleString()
      };
      
      onSaveRecording(recordingData);
      
      // Clear current recording
      setRecordedAudio(null);
      setHasRecorded(false);
      setRecordingTime(0);
    }
  };
  
  // NEW: Play saved recording
  const playSavedRecording = (recording) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (playingRecordingId === recording.id) {
      setPlayingRecordingId(null);
      setIsPlaying(false);
      return;
    }
    
    const audio = new Audio(recording.url);
    audioRef.current = audio;
    
    audio.addEventListener('ended', () => {
      setPlayingRecordingId(null);
      setIsPlaying(false);
    });
    
    audio.play().then(() => {
      setPlayingRecordingId(recording.id);
      setIsPlaying(true);
    }).catch(err => {
      console.error('Error playing saved recording:', err);
    });
  };
  
  // NEW: Play all recordings for this word in sequence
  const playAllRecordings = () => {
    if (currentWordRecordings.length === 0) return;
    
    let currentIndex = 0;
    
    const playNext = () => {
      if (currentIndex >= currentWordRecordings.length) {
        setPlayingRecordingId(null);
        setIsPlaying(false);
        return;
      }
      
      const recording = currentWordRecordings[currentIndex];
      const audio = new Audio(recording.url);
      
      audio.addEventListener('ended', () => {
        currentIndex++;
        setTimeout(playNext, 500); // Small gap between recordings
      });
      
      setPlayingRecordingId(recording.id);
      audio.play();
    };
    
    setIsPlaying(true);
    playNext();
  };
  
  // Clear recording to try again
  const clearRecording = () => {
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio);
    }
    setRecordedAudio(null);
    setHasRecorded(false);
    setRecordingTime(0);
    setIsPlaying(false);
  };
  
  // Handle continue
  const handleComplete = () => {
    cleanup();
    onComplete && onComplete({
      hasRecording: hasRecorded,
      recordingUrl: recordedAudio,
      word: word,
      recordingDuration: recordingTime,
      totalSavedRecordings: currentWordRecordings.length
    });
  };
  
  // Handle skip
  const handleSkip = () => {
    cleanup();
    onSkip && onSkip();
  };
  
  if (!show) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      ...containerStyle
    }}>
      <div style={{
        background: currentTheme.background,
        border: currentTheme.border,
        borderRadius: '15px',
        padding: '25px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        color: currentTheme.text,
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        
     {/* Header */}
<div style={{ marginBottom: '20px' }}>
  {/* NEW: App Icon */}
  {appIcon && (
    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
      <img 
        src={appIcon} 
        alt={word}
        style={{
          width: '80px',
          height: '80px',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
        }}
      />
    </div>
  )}
  
  <h3 style={{ 
    margin: '0 0 10px 0', 
    fontSize: '20px',
    color: currentTheme.text 
  }}>
    {title}
  </h3>
          <p style={{ 
            margin: '0 0 15px 0', 
            fontSize: '16px',
            color: currentTheme.text,
            opacity: 0.8
          }}>
            {prompt}: <strong style={{ 
              color: currentTheme.accent,
              fontSize: '18px' 
            }}>
              {word.toUpperCase()}
            </strong>
          </p>
          
          {/* Audio Reference Section */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '10px'
          }}>
            <p style={{ 
              margin: '0 0 10px 0', 
              fontSize: '14px',
              color: currentTheme.text,
              opacity: 0.7
            }}>
              Listen first to practice:
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '10px'
            }}>
              {getSyllablesForWord(word).map((syllable, index) => (
                <button
                  key={index}
                  onClick={() => playAudio(`/audio/syllables/${word.toLowerCase()}-${syllable}.mp3`)}
                  style={{
                    background: currentTheme.secondary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {syllable.toUpperCase()}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => playAudio(`/audio/words/${word.toLowerCase()}.mp3`)}
              style={{
                background: currentTheme.accent,
                color: currentTheme.text,
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🔊 Hear Complete Word
            </button>
          </div>
        </div>
        
        {/* NEW: Saved Recordings Section */}
        {currentWordRecordings.length > 0 && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '15px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
              Your {word} Recordings ({currentWordRecordings.length})
            </h4>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              marginBottom: '10px'
            }}>
              {currentWordRecordings.map((recording, index) => (
                <div key={recording.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.5)',
                  padding: '8px 12px',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontSize: '12px' }}>
                    Recording {index + 1} ({formatTime(recording.duration)})
                  </span>
                  <button
                    onClick={() => playSavedRecording(recording)}
                    style={{
                      background: playingRecordingId === recording.id ? currentTheme.danger : currentTheme.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    {playingRecordingId === recording.id ? '⏸️' : '▶️'}
                  </button>
                </div>
              ))}
            </div>
            
            {currentWordRecordings.length > 1 && (
              <button
                onClick={playAllRecordings}
                style={{
                  background: currentTheme.secondary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                🎵 Play All {currentWordRecordings.length} Recordings
              </button>
            )}
          </div>
        )}
        
        {/* Permission Section */}
        {!permission ? (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ marginBottom: '15px', fontSize: '14px' }}>
              Allow microphone access to record your voice
            </p>
            <button 
              onClick={getMicrophonePermission}
              style={{
                background: currentTheme.primary,
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Enable Microphone
            </button>
          </div>
        ) : (
          <div>
            {/* Recording Status */}
            {isRecording && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                fontSize: '18px',
                color: currentTheme.danger
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: currentTheme.danger,
                  borderRadius: '50%',
                  marginRight: '8px',
                  animation: 'pulse 1s infinite'
                }} />
                Recording: {formatTime(recordingTime)}
              </div>
            )}
            
            {/* Current Recording Playback */}
            {recordedAudio && !isRecording && (
              <div style={{ marginBottom: '20px' }}>
                <audio 
                  ref={audioRef}
                  src={recordedAudio} 
                  style={{ display: 'none' }}
                />
                
                <div style={{
                  background: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '10px',
                  padding: '15px',
                  marginBottom: '15px'
                }}>
                  <p style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '14px',
                    opacity: 0.8 
                  }}>
                    New recording ({formatTime(recordingTime)}):
                  </p>
                  
                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        if (isPlaying) {
                          audioRef.current.pause();
                          setIsPlaying(false);
                        } else {
                          audioRef.current.play();
                          setIsPlaying(true);
                        }
                      }
                    }}
                    style={{
                      background: isPlaying ? currentTheme.danger : currentTheme.secondary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Recording Controls */}
            <div style={{ marginBottom: '20px' }}>
              {!isRecording && !hasRecorded && (
                <button 
                  onClick={startRecording}
                  style={{
                    background: currentTheme.primary,
                    color: 'white',
                    border: 'none',
                    padding: '15px 25px',
                    borderRadius: '25px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🎤 Start Recording
                </button>
              )}
              
              {isRecording && (
                <button 
                  onClick={stopRecording}
                  style={{
                    background: currentTheme.danger,
                    color: 'white',
                    border: 'none',
                    padding: '15px 25px',
                    borderRadius: '25px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  ⏹️ Stop Recording
                </button>
              )}
              
              {hasRecorded && !isRecording && (
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button 
                    onClick={clearRecording}
                    style={{
                      background: currentTheme.secondary,
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Try Again
                  </button>
                  
                  <button 
                    onClick={saveCurrentRecording}
                    style={{
                      background: currentTheme.primary,
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    💾 Save Recording
                  </button>
                  
                  <button 
                    onClick={handleComplete}
                    style={{
                      background: currentTheme.accent,
                      color: currentTheme.text,
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    ✅ Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Skip Option */}
        {allowSkip && (
          <div style={{ 
            borderTop: `1px solid ${currentTheme.border}`,
            paddingTop: '15px',
            marginTop: '15px'
          }}>
            <button 
              onClick={handleSkip}
              style={{
                background: 'transparent',
                color: currentTheme.text,
                border: `1px solid ${currentTheme.text}`,
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                opacity: 0.7,
                transition: 'all 0.3s ease'
              }}
            >
              Skip Recording
            </button>
          </div>
        )}
        
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(1.1); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default SanskritVoiceRecorder;