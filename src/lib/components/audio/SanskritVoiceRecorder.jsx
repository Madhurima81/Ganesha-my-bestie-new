// SanskritVoiceRecorder — TRIMMED MVP VERSION
import React, { useState, useRef, useEffect } from 'react';
import useSafeClick from '../../../zones/shloka-river/core/hooks/useSafeClick';
import './SanskritVoiceRecorder.css';

const SanskritVoiceRecorder = ({
  prompt = "Try saying the word",
  word = "",
  syllables = null,
  onComplete,
  onSkip,
  appIcon = null,
  show = true,
  title = "Practice Chanting",
  allowSkip = true,
  maxRecordingTime = 20
}) => {

  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permission, setPermission] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const practiceAudioRef = useRef(null);

  const { safeClick, lock, unlock, isLocked } = useSafeClick(300);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (practiceAudioRef.current) {
        practiceAudioRef.current.pause();
        practiceAudioRef.current = null;
      }
      if (recordedAudio) URL.revokeObjectURL(recordedAudio);
      unlock();
    };
  }, []);

  const getSyllablesForWord = (w) => {
    // Use syllables prop if provided (from AppSidebar / SceneCompletionCelebration)
    if (syllables && syllables.length > 0) {
      return syllables.map(s => s.toLowerCase());
    }
    // Fallback hardcoded map
    const map = {
      vakratunda:    ['va','kra','tun','da'],
      mahakaya:      ['ma','ha','ka','ya'],
      suryakoti:     ['sur','ya','ko','ti'],
      samaprabha:    ['sa','ma','pra','bha'],
      nirvighnam:    ['nir','vigh','nam'],
      kurumedeva:    ['ku','ru','me','deva'],
      sarvakaryeshu: ['sar','va','kar','ye','shu'],
      sarvada:       ['sar','va','da'],
    };
    return map[w.toLowerCase()] || [w];
  };

  const playAudioSafe = (src) => {
    // Allow immediate syllable switching: stop previous preview and play latest tap.
    if (practiceAudioRef.current) {
      practiceAudioRef.current.pause();
      practiceAudioRef.current.currentTime = 0;
    }
    const a = new Audio(src);
    practiceAudioRef.current = a;
    a.onended = () => {
      if (practiceAudioRef.current === a) {
        practiceAudioRef.current = null;
      }
    };
    a.onerror = () => {
      if (practiceAudioRef.current === a) {
        practiceAudioRef.current = null;
      }
    };
    a.play().catch(() => {
      if (practiceAudioRef.current === a) {
        practiceAudioRef.current = null;
      }
    });
  };

  const getPermission = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    setPermission(true);
    return stream;
  };

  const startRecording = async () => {
    safeClick(async () => {
      const stream = streamRef.current || await getPermission();
      if (!stream) return;

      setRecordingTime(0);
      setIsRecording(true);
      setHasRecorded(false);

      timerRef.current = setInterval(() => {
        setRecordingTime(t => {
          if (t >= maxRecordingTime) stopRecording();
          return t + 1;
        });
      }, 1000);

      const rec = new MediaRecorder(stream);
      mediaRecorderRef.current = rec;
      const chunks = [];

      rec.ondataavailable = e => chunks.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunks);
        const url = URL.createObjectURL(blob);
        setRecordedAudio(url);
        setHasRecorded(true);
      };

      rec.start();
    });
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const handleComplete = () => {
    safeClick(() => {
      onComplete?.({
        recordingUrl: recordedAudio,
        duration: recordingTime,
        word
      });
    });
  };

  if (!show) return null;
  const locked = isLocked();

  return (
    <div className="svr-overlay">
      <div className="svr-card">

        {/* --- CLOSE BUTTON START --- */}
        <button
          onClick={handleComplete}
          className="svr-close"
          title="Close Recorder"
        >
          &times;
        </button>
        {/* --- CLOSE BUTTON END --- */}

        <h3 className="svr-title">{hasRecorded && !isRecording ? 'Great Chanting' : title} 🎵</h3>

        <p className="svr-prompt">
          {hasRecorded && !isRecording
            ? 'Listen to your voice'
            : <>{prompt}: <span className="svr-word">{word.toUpperCase()}</span></>
          }
        </p>

        {/* Post-recording layout */}
        {hasRecorded && !isRecording ? (
          <>
            <audio
              ref={audioRef}
              src={recordedAudio}
              onEnded={() => setIsPlaying(false)}
              hidden
            />

            {/* Big Listen Again button */}
            <button
              className="rec2-play-main"
              style={{ display: 'block', margin: '24px auto' }}
              onClick={() => {
                if (isPlaying) {
                  audioRef.current.pause();
                  setIsPlaying(false);
                } else {
                  audioRef.current.play();
                  setIsPlaying(true);
                }
              }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Listen to Your Voice'}
            </button>

            {/* Reference box with Hear Word + syllables */}
            <div className="rec2-reference">
              <button
                className="rec2-hear-word"
                onClick={() => playAudioSafe(`/audio/words/${word}.mp3`)}
              >
                🔊 Hear Word
              </button>
              <div className="rec2-syllables">
                {getSyllablesForWord(word).map((s, i) => (
                  <button
                    key={i}
                    className="rec2-syllable-btn"
                    onClick={() => playAudioSafe(`/audio/syllables/${word}-${s}.mp3`)}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Try Again / Continue */}
            <div className="rec2-actions">
              <button className="rec2-try svr-btn" onClick={() => {
                setRecordedAudio(null);
                setHasRecorded(false);
              }}>
                🔄 Try Again
              </button>
              <button className="rec2-continue svr-btn" onClick={handleComplete}>
                ✅ Continue
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Practice box — shown before/during recording */}
            <div className="svr-practice">
              <div className="svr-syllables">
                {getSyllablesForWord(word).map((s,i) => (
                  <button
                    key={i}
                    className="svr-btn svr-syllable-btn"
                    onClick={() => playAudioSafe(`/audio/syllables/${word}-${s}.mp3`)}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                className="svr-btn svr-word-btn"
                onClick={() => playAudioSafe(`/audio/words/${word}.mp3`)}
              >
                🔊 Hear Complete Word
              </button>
            </div>

            {/* Permission */}
            {!permission && (
              <button className="svr-btn svr-btn-start" onClick={getPermission}>
                🎤 Enable Microphone
              </button>
            )}

            {/* Recording Controls */}
            {permission && !isRecording && (
              <button
                className="svr-btn svr-btn-start"
                disabled={locked}
                onClick={startRecording}
              >
                🎤 Start Recording
              </button>
            )}

            {isRecording && (
              <button className="svr-btn svr-btn-stop" onClick={stopRecording}>
                ⏹ Stop Recording
              </button>
            )}
          </>
        )}

        {allowSkip && (
          <button className="svr-btn svr-btn-skip" onClick={onSkip}>
            Skip
          </button>
        )}

      </div>
    </div>
  );
};

export default SanskritVoiceRecorder;
