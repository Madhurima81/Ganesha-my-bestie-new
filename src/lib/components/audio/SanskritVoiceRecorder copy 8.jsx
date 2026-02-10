// Enhanced SanskritVoiceRecorder.jsx with DELETE, PROGRESS BARS, KID-FRIENDLY UI, and SAFE CLICK
import React, { useState, useRef, useEffect } from 'react';
import useSafeClick from '../../../zones/shloka-river/core/hooks/useSafeClick';
import './SanskritVoiceRecorder.css';

const SanskritVoiceRecorder = ({
  // Required props
  prompt = "Try saying the word",
  word = "",
  onComplete,
  onSkip,
  appIcon = null,
  appColor = null,
  
  // Optional props
  show = true,
  title = "Practice Chanting",
  allowSkip = true,
  autoStart = false,
  maxRecordingTime = 30,
  
  // Multi-recording props
  savedRecordings = {},
  onSaveRecording,
  onDeleteRecording, // NEW: Delete callback
  
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
  
  // Multi-recording state
  const [currentRecordingIndex, setCurrentRecordingIndex] = useState(null);
  const [playingRecordingId, setPlayingRecordingId] = useState(null);
  
  // NEW: Progress tracking state
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const progressIntervalRef = useRef(null);
  
  // NEW: Safe Click Hook - prevents rapid clicking
  const { safeClick, lock, unlock, isLocked } = useSafeClick(300);
  
const themes = {
  sanskrit: {
    background: 'linear-gradient(180deg, #FFF9E6 0%, #FFE8CC 100%)',
    cardBg: '#FFFFFF',
    border: '#FFB84D',
    text: '#5C3D2E',
    primary: '#FF8C42',
    secondary: '#4ECDC4',
    danger: '#FF6B6B',
    accent: '#FFD93D',
    success: '#6BCF7F',
    playful: '#FF69B4',
    lightBorder: '#E8D5B5',
    progressBar: '#FFB84D',
    progressBg: '#FFE8CC'
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
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio);
    }
    if (currentPlayingAudio) {
      currentPlayingAudio.pause();
      currentPlayingAudio.currentTime = 0;
    }
    unlock();
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
  
  // NEW: Start progress tracking
  const startProgressTracking = (audio) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (audio && !audio.paused) {
        setAudioProgress(audio.currentTime);
        setAudioDuration(audio.duration || 0);
      }
    }, 100);
  };
  
  // NEW: Stop progress tracking
  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setAudioProgress(0);
    setAudioDuration(0);
  };
  
  // NEW: Enhanced play audio with progress tracking and safe click
  const playAudioSafe = (audioSrc) => {
    safeClick(() => {
      // Stop any currently playing audio
      if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        currentPlayingAudio.currentTime = 0;
        stopProgressTracking();
      }
      
      try {
        const audio = new Audio(audioSrc);
        audio.volume = 0.8;
        setCurrentPlayingAudio(audio);
        
        // Lock during playback
        lock();
        startProgressTracking(audio);
        
        audio.addEventListener('ended', () => {
          stopProgressTracking();
          unlock();
          setCurrentPlayingAudio(null);
        });
        
        audio.addEventListener('error', (e) => {
          console.log('Audio file not found, using speech synthesis');
          stopProgressTracking();
          unlock();
          setCurrentPlayingAudio(null);
          
          const soundName = audioSrc.split('/').pop().replace('.mp3', '');
          if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(soundName);
            utterance.rate = 0.7;
            utterance.pitch = 1.2;
            utterance.volume = 0.8;
            
            utterance.addEventListener('end', () => {
              unlock();
            });
            
            speechSynthesis.speak(utterance);
          }
        });
        
        audio.play().catch(err => {
          console.log('Playback error:', err);
          stopProgressTracking();
          unlock();
          setCurrentPlayingAudio(null);
        });
        
      } catch (error) {
        console.log('Audio not available:', error);
        unlock();
      }
    });
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
  
  // Start recording with safe click
  const startRecording = async () => {
    safeClick(async () => {
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
    });
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
  
  // Save current recording
  const saveCurrentRecording = () => {
    console.log('🔍 Save Recording Clicked!');
    console.log('   - recordedAudio exists:', !!recordedAudio);
    console.log('   - onSaveRecording exists:', !!onSaveRecording);
    console.log('   - recordingTime:', recordingTime);
    console.log('   - word:', word);
    
    safeClick(() => {
      console.log('✅ Inside safeClick callback');
      
      if (recordedAudio && onSaveRecording) {
        const recordingData = {
          id: Date.now(),
          url: recordedAudio,
          duration: recordingTime,
          word: word.toLowerCase(),
          timestamp: new Date().toLocaleString()
        };
        
        console.log('💾 Calling onSaveRecording with data:', recordingData);
        onSaveRecording(recordingData);
        
        console.log('✨ Recording saved, clearing state...');
        // Clear current recording
        setRecordedAudio(null);
        setHasRecorded(false);
        setRecordingTime(0);
      } else {
        console.error('❌ Cannot save - missing recordedAudio or onSaveRecording callback');
        console.error('   - recordedAudio:', recordedAudio);
        console.error('   - onSaveRecording:', onSaveRecording);
      }
    });
  };
  
  // NEW: Delete recording with safe click
  const deleteRecording = (recordingId) => {
    safeClick(() => {
      if (onDeleteRecording && window.confirm('Delete this recording?')) {
        onDeleteRecording(recordingId, word.toLowerCase());
        
        // Stop if currently playing
        if (playingRecordingId === recordingId) {
          if (currentPlayingAudio) {
            currentPlayingAudio.pause();
            currentPlayingAudio.currentTime = 0;
          }
          setPlayingRecordingId(null);
          setIsPlaying(false);
          stopProgressTracking();
          unlock();
        }
      }
    });
  };
  
  // Play saved recording with pause/resume support
  const playSavedRecording = (recording) => {
    // Special case: If clicking the same recording that's playing/paused - toggle play/pause
    if (playingRecordingId === recording.id && currentPlayingAudio) {
      if (currentPlayingAudio.paused) {
        // Resume playback - don't use safeClick
        currentPlayingAudio.play();
        setIsPlaying(true);
        lock();
      } else {
        // Pause playback - don't use safeClick
        currentPlayingAudio.pause();
        setIsPlaying(false);
        unlock();
      }
      return;
    }
    
    // New recording clicked - use safeClick
    safeClick(() => {
      // Stop any currently playing audio (different recording)
      if (currentPlayingAudio) {
        currentPlayingAudio.pause();
        currentPlayingAudio.currentTime = 0;
        stopProgressTracking();
      }
      
      // Play new recording
      const audio = new Audio(recording.url);
      setCurrentPlayingAudio(audio);
      
      // Lock during playback
      lock();
      startProgressTracking(audio);
      
      audio.addEventListener('ended', () => {
        setPlayingRecordingId(null);
        setIsPlaying(false);
        stopProgressTracking();
        unlock();
        setCurrentPlayingAudio(null);
      });
      
      audio.play().then(() => {
        setPlayingRecordingId(recording.id);
        setIsPlaying(true);
      }).catch(err => {
        console.error('Error playing saved recording:', err);
        unlock();
        stopProgressTracking();
      });
    });
  };
  
  // Play all recordings with safe click
  const playAllRecordings = () => {
    safeClick(() => {
      if (currentWordRecordings.length === 0) return;
      
      lock(); // Lock for entire sequence
      let currentIndex = 0;
      
      const playNext = () => {
        if (currentIndex >= currentWordRecordings.length) {
          setPlayingRecordingId(null);
          setIsPlaying(false);
          stopProgressTracking();
          unlock();
          return;
        }
        
        const recording = currentWordRecordings[currentIndex];
        const audio = new Audio(recording.url);
        setCurrentPlayingAudio(audio);
        
        startProgressTracking(audio);
        
        audio.addEventListener('ended', () => {
          currentIndex++;
          stopProgressTracking();
          setTimeout(playNext, 500);
        });
        
        setPlayingRecordingId(recording.id);
        audio.play();
      };
      
      setIsPlaying(true);
      playNext();
    });
  };
  
  // Clear recording to try again
  const clearRecording = () => {
    safeClick(() => {
      if (recordedAudio) {
        URL.revokeObjectURL(recordedAudio);
      }
      setRecordedAudio(null);
      setHasRecorded(false);
      setRecordingTime(0);
      setIsPlaying(false);
    });
  };
  
  // Handle continue
  const handleComplete = () => {
    safeClick(() => {
      cleanup();
      onComplete && onComplete({
        hasRecording: hasRecorded,
        recordingUrl: recordedAudio,
        word: word,
        recordingDuration: recordingTime,
        totalSavedRecordings: currentWordRecordings.length
      });
    });
  };
  
  // Handle skip
  const handleSkip = () => {
    safeClick(() => {
      cleanup();
      onSkip && onSkip();
    });
  };
  
  if (!show) return null;
  
  const locked = isLocked();
  
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
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '550px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4)',
        color: currentTheme.text,
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        
        {/* Close Button (X) at top-right */}
        <button
          onClick={handleComplete}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: currentTheme.danger,
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            zIndex: 10
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.background = currentTheme.playful;
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = currentTheme.danger;
          }}
        >
          ×
        </button>
        
        {/* Header - KID FRIENDLY! */}
        <div style={{ marginBottom: '25px' }}>
          {appIcon && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '15px',
              animation: 'bounce 1s ease-in-out'
            }}>
              <img 
                src={appIcon} 
                alt={word}
                style={{
                  width: '100px',
                  height: '100px',
                  filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))',
                  transition: 'transform 0.3s ease'
                }}
              />
            </div>
          )}
          
          <h3 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '24px',
            color: currentTheme.primary,
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            {title} 🎵
          </h3>
          
          <p style={{ 
            margin: '0 0 20px 0', 
            fontSize: '18px',
            color: currentTheme.text,
            opacity: 0.9
          }}>
            {prompt}: <strong style={{ 
              color: currentTheme.accent,
              fontSize: '22px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}>
              {word.toUpperCase()}
            </strong>
          </p>
          
{/* Practice Chanting Section - IMPROVED */}
<div style={{
  background: currentTheme.cardBg,
  borderRadius: '16px',
  border: `3px dashed ${currentTheme.lightBorder}`,
  padding: '20px',
  marginBottom: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
}}>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    color: currentTheme.text,
    fontSize: '16px',
    fontWeight: '600'
  }}>
    <span style={{ fontSize: '20px' }}>💡</span>
    Listen first to practice:
  </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '15px'
            }}>
              {getSyllablesForWord(word).map((syllable, index) => (
                <button
                  key={index}
                  onClick={() => playAudioSafe(`/audio/syllables/${word.toLowerCase()}-${syllable}.mp3`)}
                  disabled={locked}
             style={{
      background: locked ? '#E0E0E0' : 'linear-gradient(135deg, #4ECDC4 0%, #44B3AA 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '14px 24px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: locked ? 'not-allowed' : 'pointer',
      textTransform: 'uppercase',
      boxShadow: locked ? 'none' : '0 4px 12px rgba(78, 205, 196, 0.3)',
      transition: 'all 0.2s ease',
      opacity: locked ? 0.5 : 1
    }}
                  onMouseOver={(e) => {
      if (!locked) {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 6px 16px rgba(78, 205, 196, 0.4)';
      }
    }}
    onMouseOut={(e) => {
      if (!locked) {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 12px rgba(78, 205, 196, 0.3)';
      }
    }}
                >
                  {syllable.toUpperCase()}
                </button>
              ))}
            </div>
            
 <button
  onClick={() => playAudioSafe(`/sounds/${word.toLowerCase()}.mp3`)}
  disabled={locked}
  style={{
    background: locked ? '#E0E0E0' : currentTheme.accent,
    color: currentTheme.text,
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: locked ? 'not-allowed' : 'pointer',
    width: '100%',
    boxShadow: locked ? 'none' : '0 3px 10px rgba(255, 217, 61, 0.3)',
    transition: 'all 0.2s ease',
    opacity: locked ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  }}
  onMouseOver={(e) => {
    if (!locked) {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 5px 14px rgba(255, 217, 61, 0.4)';
    }
  }}
  onMouseOut={(e) => {
    if (!locked) {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 3px 10px rgba(255, 217, 61, 0.3)';
    }
  }}
>
  <span style={{ fontSize: '18px' }}>🔊</span>
  Hear Complete Word
</button>
            
            {/* NEW: Progress Bar for Audio Playback */}
            {locked && audioDuration > 0 && !playingRecordingId && (
              <div style={{ marginTop: '15px' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '5px'
                }}>
                  <div style={{
                    width: `${(audioProgress / audioDuration) * 100}%`,
                    height: '100%',
                    background: currentTheme.primary,
                    transition: 'width 0.1s linear',
                    borderRadius: '4px'
                  }} />
                </div>
                <p style={{ 
                  fontSize: '12px', 
                  margin: 0,
                  color: currentTheme.text,
                  opacity: 0.7
                }}>
                  {formatTime(Math.floor(audioProgress))} / {formatTime(Math.floor(audioDuration))}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Saved Recordings Section - UNIFORM KID-FRIENDLY DESIGN! */}
        {currentWordRecordings.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            borderRadius: '20px',
            padding: '25px',
            marginBottom: '20px',
            border: '3px solid #2E7D32',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}>
            <h4 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '20px',
              color: 'white',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              textAlign: 'center'
            }}>
              🎤 Your {word} Recordings ({currentWordRecordings.length})
            </h4>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '15px'
            }}>
              {currentWordRecordings.map((recording, index) => {
                const isThisPlaying = playingRecordingId === recording.id && currentPlayingAudio && !currentPlayingAudio.paused;
                
                return (
                  <div key={recording.id} style={{
                    background: isThisPlaying
                      ? 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)'
                      : 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '15px',
                    padding: '15px',
                    border: isThisPlaying ? '3px solid #FF6B35' : '2px solid rgba(255,255,255,0.3)',
                    transition: 'all 0.3s ease',
                    boxShadow: isThisPlaying 
                      ? '0 6px 12px rgba(255, 107, 53, 0.4)'
                      : '0 4px 8px rgba(0,0,0,0.15)'
                  }}>
                    {/* Title and Timer Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          margin: '0 0 5px 0', 
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: isThisPlaying ? '#8B4513' : '#2E7D32'
                        }}>
                          🎵 Recording {index + 1}
                        </p>
                        
                        {/* Timer Display */}
                        {playingRecordingId === recording.id && (
                          <div style={{
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '8px',
                            padding: '5px 10px',
                            display: 'inline-block'
                          }}>
                            <p style={{
                              margin: 0,
                              fontSize: '14px',
                              fontWeight: 'bold',
                              color: isThisPlaying ? '#8B4513' : '#666',
                              fontFamily: 'monospace'
                            }}>
                              {formatTime(Math.floor(audioProgress))} / {formatTime(Math.floor(recording.duration))}
                            </p>
                          </div>
                        )}
                        
                        {/* Show duration when not playing */}
                        {playingRecordingId !== recording.id && (
                          <p style={{
                            margin: 0,
                            fontSize: '13px',
                            color: '#666',
                            fontWeight: '500'
                          }}>
                            Duration: {formatTime(Math.floor(recording.duration))}
                          </p>
                        )}
                      </div>
                      
                      {/* Big Play/Pause Button */}
                      <button
                        onClick={() => playSavedRecording(recording)}
                        disabled={locked && playingRecordingId !== recording.id}
                        style={{
                          background: isThisPlaying
                            ? 'linear-gradient(135deg, #E55934 0%, #d54529 100%)'
                            : 'linear-gradient(135deg, #4ECDC4 0%, #44a6a0 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '60px',
                          height: '60px',
                          cursor: (locked && playingRecordingId !== recording.id) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: (locked && playingRecordingId !== recording.id) ? 0.5 : 1,
                          fontSize: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                          marginLeft: '15px'
                        }}
                        onMouseOver={(e) => !locked && (e.target.style.transform = 'scale(1.1)')}
                        onMouseOut={(e) => !locked && (e.target.style.transform = 'scale(1)')}
                      >
                        {isThisPlaying ? '⏸️' : '▶️'}
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => deleteRecording(recording.id)}
                        disabled={locked}
                        style={{
                          background: locked ? '#ccc' : '#E55934',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '45px',
                          height: '45px',
                          cursor: locked ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: locked ? 0.5 : 1,
                          fontSize: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                          marginLeft: '10px'
                        }}
                        onMouseOver={(e) => !locked && (e.target.style.transform = 'scale(1.1)')}
                        onMouseOut={(e) => !locked && (e.target.style.transform = 'scale(1)')}
                        title="Delete recording"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    {/* Progress Bar - ONLY when playing */}
                    {playingRecordingId === recording.id && recording.duration > 0 && (
                      <div style={{
                        width: '100%',
                        height: '10px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        <div style={{
                          width: `${(audioProgress / recording.duration) * 100}%`,
                          height: '100%',
                          background: isThisPlaying 
                            ? 'linear-gradient(90deg, #FF6B35 0%, #E55934 100%)'
                            : '#4ECDC4',
                          transition: 'width 0.1s linear',
                          borderRadius: '5px',
                          boxShadow: isThisPlaying ? '0 0 10px rgba(255, 107, 53, 0.5)' : 'none'
                        }} />
                      </div>
                    )}
                    
                    {/* Playing Indicator */}
                    {isThisPlaying && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '10px',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#E55934',
                          animation: 'pulse 1s infinite'
                        }} />
                        <span style={{
                          color: '#8B4513',
                          fontSize: '13px',
                          fontWeight: 'bold'
                        }}>
                          🎵 Playing...
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Permission Section */}
        {!permission ? (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ 
              marginBottom: '20px', 
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              🎤 Allow microphone access to record your voice
            </p>
            <button 
              onClick={getMicrophonePermission}
              style={{
                background: currentTheme.primary,
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '15px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 12px rgba(0,0,0,0.3)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              ✅ Enable Microphone
            </button>
          </div>
        ) : (
          <div>
            {/* Recording Status - MORE VISUAL! */}
            {isRecording && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '25px',
                fontSize: '20px',
                fontWeight: 'bold',
                color: currentTheme.danger,
                background: 'rgba(229, 89, 52, 0.1)',
                padding: '15px',
                borderRadius: '12px',
                border: '2px solid ' + currentTheme.danger
              }}>
                <div style={{
                  width: '15px',
                  height: '15px',
                  backgroundColor: currentTheme.danger,
                  borderRadius: '50%',
                  marginRight: '10px',
                  animation: 'pulse 1s infinite'
                }} />
                🎙️ Recording: {formatTime(recordingTime)}
              </div>
            )}
            
            {/* Current Recording Playback - KID FRIENDLY! */}
            {recordedAudio && !isRecording && (
              <div style={{ marginBottom: '25px' }}>
                <audio 
                  ref={audioRef}
                  src={recordedAudio}
                  onTimeUpdate={(e) => {
                    setAudioProgress(e.target.currentTime);
                    setAudioDuration(e.target.duration || recordingTime);
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                  }}
                  style={{ display: 'none' }}
                />
                
                <div style={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  borderRadius: '20px',
                  padding: '25px',
                  marginBottom: '15px',
                  border: '3px solid #2E7D32',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '15px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        ✨ Your New Recording!
                      </p>
                      
                      {/* Timer Display - BIG and CLEAR */}
                      <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '12px',
                        padding: '10px 15px',
                        display: 'inline-block'
                      }}>
                        <p style={{
                          margin: 0,
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: '#FFD700',
                          fontFamily: 'monospace',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                        }}>
                          {formatTime(Math.floor(isPlaying ? audioProgress : 0))} / {formatTime(Math.floor(recordingTime))}
                        </p>
                      </div>
                    </div>
                    
                    {/* BIG Play/Pause Button */}
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
                        background: isPlaying 
                          ? 'linear-gradient(135deg, #E55934 0%, #d54529 100%)' 
                          : 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
                        color: isPlaying ? 'white' : '#8B4513',
                        border: 'none',
                        borderRadius: '50%',
                        width: '80px',
                        height: '80px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        fontSize: '36px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                        marginLeft: '20px'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>
                  </div>
                  
                  {/* Animated Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '12px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    <div style={{
                      width: `${recordingTime > 0 ? (audioProgress / recordingTime) * 100 : 0}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #FFD700 0%, #FF6B35 100%)',
                      transition: 'width 0.1s linear',
                      borderRadius: '6px',
                      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                    }} />
                    
                    {/* Animated Waveform Effect when Playing */}
                    {isPlaying && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        padding: '0 10px'
                      }}>
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            style={{
                              width: '2px',
                              height: `${30 + Math.sin(Date.now() / 100 + i) * 50}%`,
                              background: 'rgba(255,255,255,0.3)',
                              borderRadius: '2px',
                              animation: `wave 0.5s ease-in-out infinite`,
                              animationDelay: `${i * 0.05}s`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Playing Indicator */}
                  {isPlaying && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '12px',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#FFD700',
                        animation: 'pulse 1s infinite'
                      }} />
                      <span style={{
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                      }}>
                        🎵 Playing...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Recording Controls - BIGGER & MORE PLAYFUL! */}
            <div style={{ marginBottom: '25px' }}>
              {!isRecording && !hasRecorded && (
                <button 
                  onClick={startRecording}
                  disabled={locked}
                  style={{
                    background: locked ? '#ccc' : currentTheme.primary,
                    color: 'white',
                    border: 'none',
                    padding: '20px 40px',
                    borderRadius: '20px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: locked ? 'none' : '0 8px 16px rgba(0,0,0,0.3)',
                    opacity: locked ? 0.5 : 1
                  }}
                  onMouseOver={(e) => !locked && (e.target.style.transform = 'scale(1.05)')}
                  onMouseOut={(e) => !locked && (e.target.style.transform = 'scale(1)')}
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
                    padding: '20px 40px',
                    borderRadius: '20px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    animation: 'pulse 1.5s infinite'
                  }}
                >
                  ⏹️ Stop Recording
                </button>
              )}
              
              {hasRecorded && !isRecording && (
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button 
                    onClick={clearRecording}
                    disabled={locked}
                    style={{
                      background: locked ? '#ccc' : currentTheme.secondary,
                      color: 'white',
                      border: 'none',
                      padding: '15px 25px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: locked ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: locked ? 'none' : '0 4px 8px rgba(0,0,0,0.2)',
                      opacity: locked ? 0.5 : 1
                    }}
                  >
                    🔄 Try Again
                  </button>
                  
                  <button 
                    onClick={saveCurrentRecording}
                    disabled={locked}
                    style={{
                      background: locked ? '#ccc' : currentTheme.success,
                      color: 'white',
                      border: 'none',
                      padding: '15px 25px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: locked ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: locked ? 'none' : '0 4px 8px rgba(0,0,0,0.2)',
                      opacity: locked ? 0.5 : 1
                    }}
                  >
                    💾 Save Recording
                  </button>
                  
                  <button 
                    onClick={handleComplete}
                    disabled={locked}
                    style={{
                      background: locked ? '#ccc' : currentTheme.accent,
                      color: currentTheme.text,
                      border: 'none',
                      padding: '15px 25px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: locked ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: locked ? 'none' : '0 4px 8px rgba(0,0,0,0.2)',
                      opacity: locked ? 0.5 : 1
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
            borderTop: `2px dashed ${currentTheme.border}`,
            paddingTop: '20px',
            marginTop: '20px'
          }}>
            <button 
              onClick={handleSkip}
              disabled={locked}
              style={{
                background: 'transparent',
                color: currentTheme.text,
                border: `2px solid ${currentTheme.text}`,
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.3 : 0.7,
                transition: 'all 0.3s ease',
                fontWeight: 'bold'
              }}
              onMouseOver={(e) => !locked && (e.target.style.opacity = '1')}
              onMouseOut={(e) => !locked && (e.target.style.opacity = '0.7')}
            >
              ⏭️ Skip Recording
            </button>
          </div>
        )}
        
        <style>
          {`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.05); }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            @keyframes wave {
              0%, 100% { height: 30%; }
              50% { height: 80%; }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default SanskritVoiceRecorder;
