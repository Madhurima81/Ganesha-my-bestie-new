/**
 * voiceCues — WHEN a gesture/visual should appear inside a spoken line.
 *
 * A teaching hand must land on the ACTION word of an instruction ("Rub the glow…"), not at a
 * guessed delay after the line starts. This registry is the single place that says which word
 * that is, and (once the line is a recorded MP3) exactly when it starts.
 *
 *   word   — the action word. While the line is TTS, the speech engine's word-boundary events
 *            fire the cue exactly at this word (see lib/utils/speechCue.js); where a device
 *            doesn't send them, a per-character estimate is used.
 *   cueMs  — for a RECORDED line: milliseconds from the start of the audio to the start of
 *            `word`. Leave it out (or null) until the recording exists. To measure it, open the
 *            app in dev, run   markCue('/audio/…/your-line.mp3')   in the console, and press
 *            Space the instant the action word begins — it prints the number to paste here.
 *
 * Call sites never hard-code the word or the delay:
 *   playVoice(key, onEnded, { cue: getLineCue('scene10_maha_intro', () => showHand()) })
 *
 * Keys are the same ids the scene uses for the line. Lines that are not in the voice-script
 * config (scene-local constants) use a `scene:` prefix so ids never collide.
 */
export const VOICE_CUES = {
  // ── Shloka River ──────────────────────────────────────────────────────────
  scene10_vak_intro:       { word: 'Drag' },   // "…Drag Frog to find another way."
  scene10_maha_intro:      { word: 'Drag' },   // "…Drag the logs to build a raft."
  scene11_surya_intro:     { word: 'Rub' },    // "…Rub the glow to bring back the light."
  scene11_sama_intro:      { word: 'Press' },  // "…Press and hold to look closely."
  scene12_nir_intro:       { word: 'Press' },  // "…Press and hold the rock to move it."
  nirv_branch_intro:       { word: 'Drag' },   // "…Drag it onto the bank."
  nirv_reed_intro:         { word: 'Swipe' },  // "…Swipe them apart."
  kuru_ask_elephant:       { word: 'drag' },   // "…Drag the help bubble to someone who can help."
  kuru_ask_monkey:         { word: 'drag' },
  kuru_plank_instruction:  { word: 'drag' },   // "Now drag the planks into place."

  // ── Symbol Mountain ───────────────────────────────────────────────────────
  'modak:calmMooshika':    { word: 'Press' },  // "…Press and hold to help him focus."
  'fjg:bushStart':         { word: 'Swipe' },  // "…Swipe them apart."
  'fjg:branchStart':       { word: 'Pull' },   // "…Pull the branch down."
  'fjg:marshStart':        { word: 'Guide' },  // "…Guide Mooshika from safe spot to safe spot."
  'garland:ready':         { word: 'Drag' },   // "The garland is ready! Drag it to Ganesha."
  'pond:rockRound':        { word: 'Press' },  // "…Press and hold to move it."
  'pond:reedsRound':       { word: 'Gently' }, // "…Gently move them aside."
  'pond:lotusRound':       { word: 'Hold' },   // "Hold the bud to help it bloom."
};

/** Build the `cue` option for a line: { word, cueMs?, onCue }, or null if the line has none. */
export const getLineCue = (key, onCue) => {
  const entry = VOICE_CUES[key];
  if (!entry || !onCue) return null;
  return { ...entry, onCue };
};
