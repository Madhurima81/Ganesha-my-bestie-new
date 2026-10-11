// Run one spoken line and report when it is really finished.
//
// A line that is cancelled before it ever starts (another speak()/cancel() or a slow TTS
// load) fires onEnd without onStart, so the sequence would move on in silence. If that
// happens, play the line once more; after that, accept the end and move on.
//
//   speakWithRetry((onEnd, onStart) => speak(text, { ...opts, onEnd, onStart }), done);
export function speakWithRetry(start, done, retryDelayMs = 700) {
  let retried = false;
  const attempt = () => {
    let started = false;
    let finished = false;
    start(
      () => {
        if (finished) return;
        finished = true;
        if (!started && !retried) {
          retried = true;
          setTimeout(attempt, retryDelayMs);
        } else {
          done?.();
        }
      },
      () => { started = true; }
    );
  };
  attempt();
}
