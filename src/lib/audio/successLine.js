// successLine.js — did a spoken success line really finish?
//
// A "success done" marker is saved so Continue does not replay a line the child already heard.
// It must never be saved for a line that was cut off (pitfall 1/11b/11c).
//
//  - Web Speech: a cancelled utterance fires "ended" almost at once, so a line only counts if it
//    ran for at least `minMs` (the game's SUCCESS_LINE_MIN_MS).
//  - Recording: an <audio> fires "ended" only when it plays to the end, and a stop (sidebar, tab
//    hide, leaving) never fires it. So a recording counts as done if it actually STARTED and
//    ended normally; the elapsed-time rule would wrongly reject a short clip on a slow device.
//
// lineResult is what the game's speak() hands to its callback:
//   TTS:       { finished, elapsedMs }
//   recording: { finished, elapsedMs, recorded: true, played }   (played = the audio really started)
export function isSuccessLineDone(lineResult, minMs) {
  if (!lineResult?.finished) return { done: false, path: lineResult?.recorded ? 'recording' : 'tts' };
  if (lineResult.recorded) return { done: Boolean(lineResult.played), path: 'recording' };
  return { done: (lineResult.elapsedMs || 0) >= minMs, path: 'tts' };
}
