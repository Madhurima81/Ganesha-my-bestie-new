// SanskritVoiceRecorder - TRIMMED MVP VERSION
import React, { useState, useRef, useEffect } from 'react';
import useSafeClick from '../../../zones/shloka-river/core/hooks/useSafeClick';
import './SanskritVoiceRecorder.css';

const SanskritVoiceRecorder = ({
  prompt = 'Try saying the word',
  word = '',
  syllables = null,
  chantResult = null,
  onComplete,
  onSkip,
  stopAudio,
  appIcon = null,
  show = true,
  title = 'Practice Chanting',
  allowSkip = true,
  maxRecordingTime = 20,
  savedRecordings = {},
  onSaveRecording,
  onDeleteRecording
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasHeardWord, setHasHeardWord] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [helperMessage, setHelperMessage] = useState('');

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const practiceAudioRef = useRef(null);
  const recordedAudioRef = useRef(null);

  const { safeClick, unlock, isLocked } = useSafeClick(300);

  const clearRecordingTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const revokeRecordedAudio = () => {
    if (recordedAudioRef.current) {
      URL.revokeObjectURL(recordedAudioRef.current);
      recordedAudioRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearRecordingTimer();
      mediaRecorderRef.current = null;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (practiceAudioRef.current) {
        practiceAudioRef.current.pause();
        practiceAudioRef.current = null;
      }
      revokeRecordedAudio();
      unlock();
    };
  }, []);

  // Pause game VO whenever recorder opens
  useEffect(() => {
    if (show) stopAudio?.();
  }, [show, stopAudio]);

  useEffect(() => {
    recordedAudioRef.current = recordedAudio;
  }, [recordedAudio]);

  useEffect(() => {
    if (!isRecording || recordingTime < maxRecordingTime) return;
    stopRecording();
  }, [isRecording, recordingTime, maxRecordingTime]);

  const getSyllablesForWord = (w) => {
    if (syllables && syllables.length > 0) {
      return syllables.map(s => s.toLowerCase());
    }

    const map = {
      vakratunda: ['va', 'kra', 'tun', 'da'],
      mahakaya: ['ma', 'ha', 'ka', 'ya'],
      suryakoti: ['sur', 'ya', 'ko', 'ti'],
      samaprabha: ['sa', 'ma', 'pra', 'bha'],
      nirvighnam: ['nir', 'vigh', 'nam'],
      kurumedeva: ['ku', 'ru', 'me', 'deva'],
      sarvakaryeshu: ['sar', 'va', 'kar', 'ye', 'shu'],
      sarvada: ['sar', 'va', 'da']
    };

    return map[w.toLowerCase()] || [w];
  };

  const playAudioSafe = async (src) => {
    setErrorMessage('');

    if (practiceAudioRef.current) {
      practiceAudioRef.current.pause();
      practiceAudioRef.current.currentTime = 0;
    }

    const a = new Audio(src);
    practiceAudioRef.current = a;

    a.onended = () => {
      if (practiceAudioRef.current === a) practiceAudioRef.current = null;
    };

    a.onerror = () => {
      if (practiceAudioRef.current === a) practiceAudioRef.current = null;
    };

    try {
      await a.play();
      return true;
    } catch {
      if (practiceAudioRef.current === a) practiceAudioRef.current = null;
      return false;
    }
  };

  const handleHearCompleteWord = async () => {
    const started = await playAudioSafe(`/audio/words/${word}.mp3`);
    setHasHeardWord(true);
    if (started) {
      setHelperMessage('');
      return;
    }

    setHelperMessage('The sound is taking a little nap. You can still try saying the word.');
  };

  const startRecording = async () => {
    safeClick(async () => {
      stopAudio?.();
      setErrorMessage('');
      setHelperMessage('');

      let stream = streamRef.current;
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
        } catch (err) {
          setErrorMessage('Please ask a grown-up to allow the microphone, then try again.');
          console.warn('[SVR] Mic permission denied:', err?.name);
          return;
        }
      }
      if (!stream) return;

      let recorder;
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : '';
        recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      } catch (err) {
        setErrorMessage('Recording is not ready on this device yet. Please try again.');
        console.warn('[SVR] Could not create MediaRecorder:', err?.name || err);
        return;
      }

      setRecordingTime(0);
      setIsRecording(true);
      setHasRecorded(false);
      clearRecordingTimer();

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

      mediaRecorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        clearRecordingTimer();
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        revokeRecordedAudio();
        setRecordedAudio(url);
        setHasRecorded(true);
        mediaRecorderRef.current = null;
      };

      recorder.start();
    });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    clearRecordingTimer();
    setIsRecording(false);
  };

  const resetForRetry = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    revokeRecordedAudio();
    setRecordedAudio(null);
    setHasRecorded(false);
    setIsPlaying(false);
    setRecordingTime(0);
    setErrorMessage('');
    setHelperMessage('');
  };

  const handleComplete = () => {
    safeClick(() => {
      if (hasRecorded && recordedAudio) {
        onSaveRecording?.(word, { url: recordedAudio, duration: recordingTime });
        // Saved URL now belongs to savedRecordings — don't revoke it on unmount.
        recordedAudioRef.current = null;
      }
      onComplete?.({
        recordingUrl: recordedAudio,
        duration: recordingTime,
        word
      });
    });
  };

  if (!show) return null;

  const locked = isLocked();
  const showIncorrectResult = chantResult === 'incorrect';
  const showSuccessResult = chantResult === 'success' || chantResult === null;

  return (
    <div className="svr-overlay">
      <div className="svr-card">
        <button
          onClick={handleComplete}
          className="svr-close"
          title="Close Recorder"
        >
          &times;
        </button>

        <h3 className="svr-title">{hasRecorded && !isRecording ? 'Great Chanting' : title}</h3>

        <p className="svr-prompt">
          {hasRecorded && !isRecording
            ? (showIncorrectResult ? 'Let us try once more' : 'Listen to your voice')
            : <>{prompt}: <span className="svr-word">{word.toUpperCase()}</span></>
          }
        </p>

        {helperMessage && <p className="svr-helper-message">{helperMessage}</p>}
        {errorMessage && <p className="svr-error-message">{errorMessage}</p>}

        {hasRecorded && !isRecording ? (
          <>
            <audio
              ref={audioRef}
              src={recordedAudio}
              onEnded={() => setIsPlaying(false)}
              hidden
            />

            <div className="rec2-actions">
              {showIncorrectResult ? (
                <>
                  <button className="rec2-try svr-btn" onClick={resetForRetry}>
                    Try Again
                  </button>
                  <button className="rec2-hear-word svr-btn" onClick={handleHearCompleteWord}>
                    Hear Word Again
                  </button>
                </>
              ) : showSuccessResult ? (
                <>
                  <button
                    className="rec2-listen svr-btn"
                    onClick={() => safeClick(() => {
                      if (isPlaying) {
                        audioRef.current.pause();
                        setIsPlaying(false);
                      } else {
                        audioRef.current.play();
                        setIsPlaying(true);
                      }
                    })}
                  >
                    {isPlaying ? 'Pause' : 'Listen to Your Voice'}
                  </button>
                  <button className="rec2-continue svr-btn" onClick={handleComplete}>
                    Continue
                  </button>
                </>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <div className="svr-practice">
              <div className="svr-syllables">
                {getSyllablesForWord(word).map((s, i) => (
                  <button
                    key={i}
                    className="svr-btn svr-syllable-btn"
                    onClick={() => safeClick(() => playAudioSafe(`/audio/syllables/${word}-${s}.mp3`))}
                    disabled={locked}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                className="svr-btn svr-word-btn"
                onClick={() => safeClick(handleHearCompleteWord)}
                disabled={locked}
              >
                Hear Complete Word
              </button>
            </div>

            {hasHeardWord && !isRecording && (
              <button
                className="svr-btn svr-btn-start"
                disabled={locked}
                onClick={startRecording}
              >
                Your Turn
              </button>
            )}

            {isRecording && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                  className={`svr-btn-stop ${isRecording ? 'recording' : ''}`}
                  onClick={stopRecording}
                  type="button"
                  title="Stop recording"
                  aria-label="Stop recording"
                >
                  <span className="svr-record-icon"></span>
                </button>
                <p className="svr-recording-time">
                  {Math.max(maxRecordingTime - recordingTime, 0)}s left
                </p>
              </div>
            )}
          </>
        )}

        {savedRecordings[word] && !isRecording && (
          <div className="svr-saved-row">
            <button
              className="svr-btn"
              onClick={() => safeClick(() => playAudioSafe(savedRecordings[word].url))}
            >
              My Last Chant
            </button>
            <button
              className="svr-btn svr-delete"
              aria-label="Delete recording"
              onClick={() => safeClick(() => onDeleteRecording?.(word))}
            >
              🗑️
            </button>
          </div>
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
