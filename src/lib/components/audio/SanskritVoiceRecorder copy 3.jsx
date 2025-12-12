// Enhanced SanskritVoiceRecorder.jsx with DELETE, PROGRESS BARS, KID-FRIENDLY UI, and SAFE CLICK
import React, { useState, useRef, useEffect } from 'react';
import useSafeClick from '../../../zones/shloka-river/core/hooks/useSafeClick';

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
  
  // Theme styles - MORE KID FRIENDLY!
  const themes = {
    sanskrit: {
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)',
      border: '3px solid #FFD700',
      text: '#8B4513',
      primary: '#FF6B35',
      secondary: '#4ECDC4',
      danger: '#E55934',
      accent: '#FFD700',
      success: '#4CAF50',
      playful: '#FF69B4'
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
  
  // Play saved recording with safe click and progress
  const playSavedRecording = (recording) => {
    safeClick(() => {
      // If clicking the same recording that's currently playing - PAUSE it
      if (playingRecordingId === recording.id && currentPlayingAudio) {
        if (currentPlayingAudio.paused) {
          // Resume playback
          currentPlayingAudio.play();
          setIsPlaying(true);
          lock();
        } else {
          // Pause playback
          currentPlayingAudio.pause();
          setIsPlaying(false);
          unlock();
        }
        return;
      }
      
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
          
          {/* Audio Reference Section - BIGGER & MORE PLAYFUL */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '15px',
            border: '2px dashed ' + currentTheme.secondary
          }}>
            <p style={{ 
              margin: '0 0 15px 0', 
              fontSize: '16px',
              color: currentTheme.text,
              fontWeight: 'bold'
            }}>
              👂 Listen first to practice:
            </p>
            
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
                    background: locked ? '#ccc' : currentTheme.secondary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 18px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    transform: locked ? 'scale(0.95)' : 'scale(1)',
                    boxShadow: locked ? 'none' : '0 4px 8px rgba(0,0,0,0.2)',
                    opacity: locked ? 0.5 : 1
                  }}
                  onMouseOver={(e) => !locked && (e.target.style.transform = 'scale(1.1)')}
                  onMouseOut={(e) => !locked && (e.target.style.transform = 'scale(1)')}
                >
                  {syllable.toUpperCase()}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => playAudioSafe(`/audio/words/${word.toLowerCase()}.mp3`)}
              disabled={locked}
              style={{
                background: locked ? '#ccc' : currentTheme.accent,
                color: currentTheme.text,
                border: 'none',
                borderRadius: '15px',
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: locked ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: locked ? 'none' : '0 6px 12px rgba(0,0,0,0.3)',
                opacity: locked ? 0.5 : 1
              }}
              onMouseOver={(e) => !locked && (e.target.style.background = currentTheme.playful)}
              onMouseOut={(e) => !locked && (e.target.style.background = currentTheme.accent)}
            >
              🔊 Hear Complete Word
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
        
        {/* Saved Recordings Section - WITH DELETE! */}
        {currentWordRecordings.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '20px',
            border: '2px solid ' + currentTheme.success
          }}>
            <h4 style={{ 
              margin: '0 0 15px 0', 
              fontSize: '18px',
              color: currentTheme.success,
              fontWeight: 'bold'
            }}>
              🎤 Your {word} Recordings ({currentWordRecordings.length})
            </h4>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              marginBottom: '15px'
            }}>
              {currentWordRecordings.map((recording, index) => (
                <div key={recording.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: playingRecordingId === recording.id 
                    ? 'rgba(255, 215, 0, 0.3)' 
                    : 'rgba(255, 255, 255, 0.8)',
                  padding: '12px 15px',
                  borderRadius: '12px',
                  border: playingRecordingId === recording.id 
                    ? '2px solid ' + currentTheme.accent 
                    : '2px solid transparent',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}>
                  <span style={{ 
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: currentTheme.text
                  }}>
                    🎵 Recording {index + 1} 
                    <span style={{ opacity: 0.7, marginLeft: '5px' }}>
                      ({formatTime(recording.duration)})
                    </span>
                  </span>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Play/Pause Button */}
                    <button
                      onClick={() => playSavedRecording(recording)}
                      disabled={locked && playingRecordingId !== recording.id}
                      style={{
                        background: playingRecordingId === recording.id 
                          ? currentTheme.danger 
                          : currentTheme.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        cursor: (locked && playingRecordingId !== recording.id) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: (locked && playingRecordingId !== recording.id) ? 0.5 : 1,
                        fontWeight: 'bold'
                      }}
                    >
                      {playingRecordingId === recording.id ? '⏸️' : '▶️'}
                    </button>
                    
                    {/* NEW: Delete Button */}
                    <button
                      onClick={() => deleteRecording(recording.id)}
                      disabled={locked}
                      style={{
                        background: locked ? '#ccc' : currentTheme.danger,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        cursor: locked ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: locked ? 0.5 : 1
                      }}
                      title="Delete recording"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  {/* NEW: Progress Bar for Individual Recording */}
                  {playingRecordingId === recording.id && audioDuration > 0 && (
                    <div style={{ 
                      width: '100%', 
                      marginTop: '8px',
                      gridColumn: '1 / -1'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'rgba(0,0,0,0.1)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(audioProgress / audioDuration) * 100}%`,
                          height: '100%',
                          background: currentTheme.accent,
                          transition: 'width 0.1s linear',
                          borderRadius: '3px'
                        }} />
                      </div>
                      <p style={{ 
                        fontSize: '11px', 
                        margin: '4px 0 0 0',
                        color: currentTheme.text,
                        opacity: 0.7
                      }}>
                        {formatTime(Math.floor(audioProgress))} / {formatTime(Math.floor(audioDuration))}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Play All Button */}
            {currentWordRecordings.length > 1 && (
              <button
                onClick={playAllRecordings}
                disabled={locked}
                style={{
                  background: locked ? '#ccc' : currentTheme.secondary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: locked ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: locked ? 'none' : '0 4px 8px rgba(0,0,0,0.2)',
                  opacity: locked ? 0.5 : 1
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
            
            {/* Current Recording Playback */}
            {recordedAudio && !isRecording && (
              <div style={{ marginBottom: '25px' }}>
                <audio 
                  ref={audioRef}
                  src={recordedAudio} 
                  style={{ display: 'none' }}
                />
                
                <div style={{
                  background: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: '15px',
                  padding: '20px',
                  marginBottom: '15px',
                  border: '2px solid ' + currentTheme.success
                }}>
                  <p style={{ 
                    margin: '0 0 15px 0', 
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: currentTheme.success
                  }}>
                    ✨ New recording ({formatTime(recordingTime)}):
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
                      background: isPlaying ? currentTheme.danger : currentTheme.success,
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '70px',
                      height: '70px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      transition: 'all 0.3s ease',
                      fontSize: '30px',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.3)'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
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
          `}
        </style>
      </div>
    </div>
  );
};

export default SanskritVoiceRecorder;