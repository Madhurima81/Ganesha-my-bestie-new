# Known pitfalls — things that broke before and how to avoid them

Read this before touching resume / Continue, voice lines, timers, shared components or CSS.
Each entry: **symptom → cause → how to spot it → fix → where it happened.** Add a new entry whenever a
coding bug (logic, timing, state, voice) could recur in another scene. Not for CSS/layout tweaks inside one scene. (Started 2026-10-12 from the Continue/resume work.)

---

## 1. Resume is frozen or silent — "started" flag set before the timer (React StrictMode)
- **Symptom:** after Continue the scene shows the old state but nothing happens: no card, no intro voice,
  nothing to tap. Only in `npm run dev`, never in a production build.
- **Cause:** in dev, React StrictMode mounts → cleans up → mounts again. Code like
  `if (startedRef.current) return; startedRef.current = true; setTimeout(startThing, 700)` schedules the
  timer on the first run; the scene's unmount cleanup (`clearAllTimeouts`) cancels it; the second run sees
  the flag and does nothing.
- **Spot it:** a `useRef` flag set at the top of a `useEffect`, followed by a timer or `safeSetTimeout`.
- **Fix:** set the flag **inside** the timer callback, use a plain `setTimeout`, and `return () => clearTimeout(t)`.
- **Seen in:** Ears (Cow resume), Garland (build/carry intros), Flower Journey (intros), Sacred Assembly
  (next card), OpeningModal (voice), Shloka River wrappers, Sarvada, Finale.

## 2. Voice silent when it starts at the very first instant after mount
- **Symptom:** the intro line is missing after Continue (but plays on a normal first play).
- **Cause:** the scene is still restoring; speech started at t=0 is dropped.
- **Fix:** wait ~500 ms before a resumed intro (`INTRO_START_DELAY_MS`).

## 3. Chrome drops `speak()` right after `cancel()`
- **Symptom:** a line is requested, no sound, no error.
- **Cause:** `speechSynthesis.cancel()` followed by `speak()` in the same tick can lose the new line.
- **Fix:** if a voice was `speaking`/`pending`, wait ~120 ms after `cancel()` before `speak()`.

## 4. A timer is cancelled by an unstable `useEffect` dependency
- **Symptom:** a card/reveal/completion never appears, but only sometimes; worse after we added saves.
- **Cause:** an effect lists an inline callback prop, or the whole `sceneState` / `sceneActions` object, as a
  dependency. Those are new objects on every scene update, so the effect's cleanup cancels its pending timer
  again and again (or cancels it once while a "done" flag blocks the retry).
- **Spot it:** `[..., onGameComplete, sceneState, sceneActions]` in a deps array, with a timer inside.
- **Fix:** read callbacks through a ref (`xRef.current = x`), depend on the specific values you read
  (`sceneState?.phase`), and never cancel a one-shot sequence in the cleanup.
- **Seen in:** Eyes (reveal never played after the last target), Suryakoti (reveal effect; and the bunny-hop effect in SuryakotiGame - a wrapper re-render cancelled the hop timers, so the scene froze after the success voice in NORMAL play, not just Continue), Sarvada.
- Note: `checkpoint()` re-renders the scene, so adding a save can expose this in code that was fine before.

## 5. Counters lag after a resume (the next card repeats)
- **Symptom:** after Continue, the third card is the same as the second.
- **Cause:** the resume started round N but never updated the saved `currentRound`, so "next round =
  currentRound + 1" repeated it.
- **Fix:** derive the next round from items completed (`placedCount`), and set the saved counter when you resume.
- **Seen in:** Sacred Assembly.

## 6. Resume code overwrites the checkpoint
- **Symptom:** the second Continue starts at the beginning.
- **Cause:** a "reset the game on resume" line (`flowers: 0`) wipes what the child had saved.
- **Fix:** never write a lower value than the saved one on resume; round down only to a beat boundary.
- **Seen in:** Modak Flower Journey.

## 7. Saving too late: beat saved when the *ending* finishes, not when the child solved it
- **Symptom:** the child solves a beat, leaves during the success voice, and has to redo it.
- **Rule (locked, see DECISIONS 2026-10-10/11):** save the moment the child solves it. Also save whether the
  success line *finished*. Continue: left during the line → replay it; left after it → go to the next thing.

## 8. The 1-second autosave loses a fast leave
- **Symptom:** place/solve something, leave within a second, Continue shows it undone.
- **Fix:** use `sceneActions.checkpoint({...})` (writes immediately), not `updateState` (debounced 1 s).

## 9. Global CSS name clashes — a scene breaks because of another scene
- **Symptom:** an animation/glow that looked right yesterday is wrong today (Kurumedeva's elephant jumped
  and glowed as a rectangle).
- **Cause:** Vite puts all CSS in ONE global stylesheet. Two files defining `@keyframes stageHintGlow` (or a
  generic class like `.hint-glow`, `.pulse`) with different content: the last one loaded wins everywhere.
- **Fix:** prefix every animation with the scene (`kuruHintGlow`) and scope classes under the scene's root.
- **Check:** `npm run check:css` lists clashes with different content. (2026-10-12: 86 still listed, many in
  old files that may not load. Fix them in small batches.)

## 10. Shared code changes ripple into other scenes
- Touching `SceneManager`, `BeatPlayerGame`, `OpeningModal`, timers, voice hooks or global CSS affects every
  scene that uses them. Before changing one: list the scenes that use it and re-run their short "still works?"
  rows. Prefer a new opt-in prop with a safe default over changing existing behaviour.

## 11. Several sessions editing the same files / one giant commit
- Checkpoint commits that mix work from different sessions can't be split or bisected afterwards.
- Prefer one commit per scene or per fix, made after the checklist passes.
- **Before `git add <file>`, read `git diff <file>`.** A file another session already edited (uncommitted) gets swept
  into your commit whole: a 3-line fix became 41 changed lines (Sacred Assembly, 2026-10-13). If the diff has hunks that are not
  yours, stage only yours with `git add -p`, or stop and ask. Same for shared docs such as CHANGELOG.md.

## 11b. Voice keeps going after leaving the scene (spills onto Zone Welcome)
- **Symptom:** tap the zone badge during a line; the next line(s) of that scene speak over Zone Welcome.
- **Cause:** `speechSynthesis.cancel()` makes the browser fire `onerror` on the cancelled utterance; if that handler runs `onEnded`, the scene's voice chain continues to its next line.
- **Fix:** when LEAVING (badge / back / unmount), detach `onend/onerror` and clear the tracked utterance BEFORE cancelling (`abortWebSpeech`). Keep the plain cancel for "a new line takes over", where the interrupted line's callback is expected to fire.
- **Seen in:** Suryakoti (Samaprabha) and Sarvakaryeshu wrappers (2026-10-12).

## 11c. A cancelled voice line saves "done" or advances the game
- **Symptom:** leave during a success line, tap Continue: the line is skipped and only the next card shows.
  Or two steps run at once / a voice overlaps another line.
- **Cause:** `cancel()` (a newer line, leaving, unmount) fires `onerror` ('canceled'/'interrupted') or `onend`
  on the old utterance. If the callback then saves `...SuccessDone` or runs the next step, a line that never
  finished counts as finished.
- **Fix:** in every `onEnd` that saves a marker or advances: ignore cancelled/interrupted errors; ignore the
  callback once the component is unmounted (an `aliveRef`/`leftSceneRef` set in the effect cleanup); and only
  save "success line done" if the line really played (check elapsed time as a backstop, e.g. >= 1.5 s).
- **Also:** a line that keeps speaking AFTER the child left (nothing cancels it on unmount) fires its `onend` later and saves
  the marker. Clear the saved-marker callback ref in the effect cleanup.
- **Seen in:** Pond lotus success line, Ears game (fresh start + lines replacing each other), Flower Journey, Eyes game
  (Continue said "Now find the mango" over a cut-off found line) - 2026-10-12/13.

## 11d. Play Again leaves the old state on screen or re-opens the completion modal
- **Symptom:** tap Play Again on the completion modal: the opening modal shows but the finished scene is still
  behind it (rock moved, lotus bloomed), or the completion modal immediately comes back.
- **Cause (three separate gaps):**
  1. The scene uses the shared `useSceneReset` and its entry in `SceneResetConfigs.js` clears fields the scene
     does not use, but not the flags it actually draws from (Pond: `rockMoved`, `reedsParted`, `lotusBloomed`...).
  2. The scene stays mounted, so local React state (`useState`) is not reset by the saved-state reset.
  3. An effect shows the completion modal while "finished" flags are true and the modal is closed
     (Sacred Assembly: `fireworksFinished` + `sceneCompleteVOFinished` were never cleared).
- **Fix:** list every saved flag the scene reads in its reset config; reset local state in the Replay handler
  (or remount with a `key`); clear every "finished/celebration done" flag that gates the completion modal.
- **Spot it:** `grep` the scene's `initialState` and make sure each key is in the reset config; search effects
  that call `setShowSceneCompletion(true)` and list what they depend on.
- **Check:** finish the scene, tap Play Again on the completion modal, look at the board behind the opening modal.
- **Seen in:** Pond, Sacred Assembly (2026-10-12).

## 11e. Hand / glow cues look "offset" (GestureDemo)
- The hand image's centre is not its fingertip: the touch circle sits ~38% from the left and ~18% from the
  top. A cue point placed by eye on the target puts the fingertip up-left of it. Use `anchor="fingertip"` so
  the touch circle lands exactly on the cue point (hold rings are drawn centred on the point).
- Glows must share the hit zone's centre: put them inside the hit-zone element, not inside the art element
  (their boxes have different sizes and centres).
- Layout-debug panels must show a visible, draggable handle for every cue point; invisible points cannot be
  placed. A reeds-style swipe must be longer than the game's success distance (Pond: 68 px) or a child who
  copies the hand fails.

## 11f. Let's Explore leaves the scene's opening voice playing
- **Symptom:** tap the opening modal's button before its voice ends: the opening line keeps playing in the main scene.
- **Cause:** `OpeningModal` only stops `speechSynthesis` and DOM `<audio>` tags. A scene that speaks its own opening line
  through the Ganesha voice engine (`useGaneshaVoice().speak`) or a file player is not stopped; the
  `ganesha:stop-all-audio` event the modal dispatches has no listener.
- **Fix:** in the scene's `OpeningModal onStart`, stop that engine first (`stopSpokenVoice()` / `stopGaneshaVoice()` /
  `stopAllVoice()`), then set `welcomeShown`. Any new scene with its own opening VO needs this.
- **Seen in:** Symbol (scene 3), Sacred Assembly (2026-10-13). Other live scenes audited: they already stop their voice.

## 12. Tooling gotchas (Windows dev machine)
- **Two builds at once** (two sessions running `vite build`) clobber `dist/` — you get
  `ENOENT … dist/images/…`. Run one build at a time.
- **File locked (EPERM / UNKNOWN open)** when saving a file the dev server is watching: just retry.
- **`localhost:5173` and `127.0.0.1:5173` keep separate saved progress.** Stale `temp_session_*` /
  `replay_session_*` keys (and the `gametest` profile) make Continue tests confusing; clear them between runs.
- **Dev only vs production:** StrictMode double-runs effects only in `npm run dev`. If a bug appears only in
  dev, suspect #1 / #4 first.
- **The built-in browser pane can refuse `localhost`** ("site not approved"), so a bug cannot be reproduced by the
  assistant; ask what the screen looked like and whether it was dev or deployed before guessing.
- **No local test runner:** `package.json` says `jest` but it isn't installed, and
  `BeatPlayerGame.test.jsx` uses `jest.mock`. Those tests can't run.

---

## 13. A reveal card is missing, or shows twice (more than one path shows the same card)
- **Symptom:** after a word is finished the discovery card never appears (Nirvighnam, first play after Next adventure;
  replay showed it), or it appears twice and replays the chime / word voice, cutting the success lines (Samaprabha).
- **Cause:** a wrapper has several independent ways to show the same card: the live completion timer, a "pending
  phase" effect, and the reload restore. Each sets `revealConfig` on its own. Whichever fires, the others either
  duplicate it or, when the live timer is lost, nothing is left to show it. (Nirvighnam's lost-timer cause was NOT
  found; its live timer is the pause-aware `safeSetTimeout`, the other scenes use `window.setTimeout`.)
- **Fix:** one `revealStartedRef` Set of words already revealed, checked and filled by every path, cleared in the
  Replay handler; plus a fallback effect that shows the card ~1.8s after a finished word if none was started.
  Done in `SuryakotiBankSimplified.jsx` and `NirvighnamChantSimplified.jsx`; check Sarvakaryeshu / Vakratunda
  wrappers if the same symptom appears.
- **Check:** finish the word, count the cards and the word voice (one each); Next adventure -> finish -> card; Play Again.

## 14. A later audio cuts the Sanskrit syllable (the full word, or the next beat's English line)
- **Symptom:** the last syllable ("deva") is never heard; "Elephant helped..." is cut by the Monkey intro.
- **Cause:** starting any new clip stops the voice channel. The last syllable starts when the final step lands and
  the full word / next ask line starts a moment later. A syllable's chained after-line is also not a syllable, so it
  was not protected.
- **Fix:** keep the voice "busy" from the syllable through its after-line, and make the next line wait
  (`afterSyllableRef` + `voiceFreeTick` in `KurumedevaGame.jsx`); a watchdog releases it if `onEnded` is lost.

## 15. A syllable has no recording mapped, so a different (old) file plays
- **Symptom:** a syllable sounds wrong or silent; "backup TTS" plays.
- **Cause:** `getSyllablePath` uses `PRERECORDED_SYLLABLE_PATHS[word][syllable]`, else falls back to
  `/audio/voiceover/<word>/<syllable>.mp3` (older files). Kurumedeva's recordings were split `de` + `va` but the scene
  asks for `deva`, so the fallback file played.
- **Fix:** map every syllable key the scene uses (`voiceGuidance.js`). `deva` = `kurumedeva-deva.mp3`, made by
  trimming and joining the two recordings with ffmpeg. Match the keys in `AUDIO.syllables` to this map.

## 16. Opening voice is silent (first play and Play Again)
- **Cause:** the shared `OpeningModal` speaks only if its config has a `voiceover` (the Shloka River scenes have none)
  and, ~300ms after it appears, nothing else is playing; it never retries. A scene that relied on it was silent.
- **Fix:** the scene speaks its own opening line (~500ms after the opening phase shows), through a ref to
  `playVoice` so the effect does not re-run. NOTE: another session's uncommitted Finale change removed the old
  opening-voice effect; whichever version is committed, the opening line must be spoken exactly once.

## 17. A hint ladder is dismissed for good after the first action
- **Symptom:** Vakratunda: drag the frog, let go and wait: no hint (only the 3-bump "stuck" hint existed).
- **Cause:** the idle ladder was enabled only `!hasStartedDrag`.
- **Fix:** enable it again whenever the child is not dragging; the hand starts from the object's current position.

## 18. An action should stop the voice (fast press / hold / tap), but a queued line still plays over it
- **Symptom:** Samaprabha: pressing the next clue quickly does not stop the VO; the previous clue's reveal line
  starts after its syllable, over the new hold.
- **Cause:** the stop ran only for a press ON the clue and only if no syllable was playing; the reveal line was
  queued behind the syllable and played later.
- **Fix:** stop spoken lines whenever a hold starts (press or slide-on); skip the queued line if the next hold is
  already active. A syllable is still never cut. In Sarvada the search was gated behind the intro voice-over; the
  tap target must be live as soon as the picture is shown.

## 19. The 3-2-1 countdown shows but the game is not paused
- **Cause:** the scene only rendered the overlay. Pausing needs `resumeDelay` on `useVoiceGuidance` AND
  `usePauseAwareTimeout`, and any scene-owned `Audio` element (the Finale's whole-Shloka recording) must be paused
  in `onHide` and resumed in `onShow`. Timers made with `window.setTimeout` are not paused at all.
- **Check:** switch tab for ~10s mid-recap and mid-play; the recording and timers must wait for the countdown.

## 20. Shuffled cards break position-based progress
- **Rule:** if card order is random per game, syllables / progress must follow POSITION (Nth card lights the Nth
  syllable), and the order must be saved with the checkpoint (`cardOrder`) so Continue does not repeat a card;
  clear it in the reset config and the Replay handler. Shuffle the answer options too, or the right symbol is always
  in the same place (Sarvakaryeshu).

## 21. Reading old PENDING lines as if they were open
- Before telling Madhurima something is still open (e.g. the Mahakaya syllable clip), read the LATER entries in
  DECISIONS.md and CHANGELOG.md: a PENDING line is often superseded by a LOCKED entry or already built.

## Quick debugging snippets (paste in the browser console)
Log every speech call and cancel (find who cancels a line):
```js
const ss = speechSynthesis, s = ss.speak.bind(ss), c = ss.cancel.bind(ss);
ss.speak = u => { console.log('SPEAK', u.text); return s(u); };
ss.cancel = () => { console.log('CANCEL', new Error().stack.split('\n').slice(2, 5).join('\n')); return c(); };
```
Dump a scene's saved state (replace `final-scene` with the scene id):
```js
Object.keys(localStorage).filter(k => k.includes('final-scene')).map(k => [k, JSON.parse(localStorage[k])]);
```

## Before you call a scene "done"
1. `npm run check:css` — no new clashes. 2. `vite build` passes. 3. The scene's checklist
(`http://localhost:5173/?unlockall=1`) passes, including Replay and "Continue from the completion modal".
4. For Continue code: test leaving *during* a success line, *after* it, and *within 1 s* of a solve.
