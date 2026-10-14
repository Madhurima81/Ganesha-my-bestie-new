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
- **Also (Family Tree comparison line, 2026-10-13):** the effect called `setFinalRevealPlayed(true)` and listed `finalRevealPlayed` in its own deps, so it re-ran at once and its cleanup cancelled the 500 ms timer it had just scheduled; the second run then skipped. The line never played. An effect must not cancel, in its cleanup, a one-shot it started when its own state change re-runs it.
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

## 11g. A resumed line is spoken twice and the first is cut ("Cho... Choose your color")
- **Symptom:** after Continue the question starts, stops after a word or two, then plays again in full.
- **Cause:** two things speak: the scene's resume code (timer, ~500 ms) AND the phase-entry effect that fires for the restored phase. The second cancels the first.
- **Fix:** keep the phase-entry effect silent until the resume line plays (a sentinel in the expected-phase ref, released inside the resume timer), and have the resume line arm the hint clock with its own `onEnd`. Do not gate the resume line on audio being on: muted speech completes on a silent timer.
- **Same family:** an effect that acts on mount can also cut a resume line. Family Tree's auto-fill ("And that's me, Ganesha!", 0.9 s after load when 3 members are placed) cut the replayed third-member line. Gate such an effect on the saved "line still pending" marker (`pendingMemberLine`) so it runs only after the replay ends.
- **Seen in:** Favourite Food, Family Tree (2026-10-13).

## 11h. The opening line is spoken twice (shared OpeningModal + the scene)
- **Symptom:** the opening line plays, is cut after a word or two, and plays again.
- **Cause:** the shared `OpeningModal` speaks its own `voiceover` on mount. A scene that also speaks the same line at intro (a `playVoice('opening')` / welcome effect, 0.8 s later) cuts the first.
- **Fix:** the scene must not speak the opening line itself; keep only the replay button's call. See also 11f (stop the scene's own opening voice when Let's Explore is tapped).
- **Seen in:** Dreams, Family Tree, Favourite Food (2026-10-13).

## 11i. A "sequence finished" function is called from two paths and runs twice
- **Symptom:** a chime (or a state clear) plays twice, sometimes only after a short pause.
- **Cause:** the finish function is called from the line's `onEnd` AND from a failsafe timer, and nothing makes it one-shot (Family Tree `finishSequence`: chime when the line ended, again when the 4 s failsafe fired).
- **Fix:** a local `finished` flag checked and set inside the function.
- **Seen in:** Family Tree (2026-10-13).

## 11j. Zone Welcome treats a leave point as "completed" (shows Play Again, not Continue)
- **Symptom:** leave on a scene's last screen before the completion modal (Family Tree's side-by-side comparison); Zone Welcome shows Play Again and Continue is gone.
- **Cause:** `ZoneWelcome` decides completion per scene from the temp session, and the Family Tree branch counted `gamePhase === 'sideBySide'` as complete.
- **Fix:** count a scene as completed only on `completed` / `showingCompletionScreen` (or the scene's real completion phase). A screen the child can still act on is a leave point.
- **Check:** for every scene, leave on the screen just before the completion modal and read the Zone Welcome card.
- **Seen in:** Family Tree (2026-10-13).

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
- **Never stage hunks with `git diff -U0` + `git apply --unidiff-zero` after dropping some hunks:** the dropped hunks shift line numbers and the rest land a line or two off. 34998eac committed Familytreegame.jsx with a syntax error that way. Stage with normal context, or stage the whole file, and parse the staged copy (`git show :path | esbuild --loader:.jsx=jsx`) before committing.
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

## 22. Web Speech `onend` never fires, so the scene waits forever
- **Symptom:** a beat finishes speaking, but the next beat / hint / reveal never starts.
- **Cause:** browser speech events are not reliable. `speechSynthesis` may drop `onend`, especially after tab
  hide, cancel, mute, or rapid line replacement.
- **Fix:** every voice-gated step needs a watchdog/fallback timer. The fallback should advance only the intended
  step, and must still respect "left scene" / cancelled guards so it does not save a cut-off line as complete.
- **Seen in:** Kurumedeva / BeatPlayer work (2026-09-15), hint L2->L3 gating.

## 23. Replay repeats the wrong or stale line
- **Symptom:** Replay speaks an old scene line while a mini-game is active, does nothing during a silent phase, or
  repeats a line from the previous beat.
- **Cause:** some mini-games speak through their own `speechSynthesis` path, so the wrapper's `lastVoice` ref never
  learns the current line. Or Replay remains enabled during phases that have no valid VO.
- **Fix:** mini-games that own speech must report each spoken line to the wrapper (`onLineSpoken`-style), and Replay
  should be disabled whenever there is no current contextual line.
- **Seen in:** Flower Journey, Garland, Eyes/Ears, Sacred Assembly card intro (2026-10-07).

## 24. Mute skips timing instead of silently preserving it
- **Symptom:** turning voice off skips a step, instantly marks a line done, or unmuting replays a stale line.
- **Cause:** treating mute as "do not run voice logic" instead of "run the voice timeline silently".
- **Fix:** voice-off should silence current/future narration but keep the same line-duration timer and callback
  semantics. Mute mid-line silences immediately; its callback still fires on schedule. Unmute must not replay old
  lines automatically. SFX stay on by design unless a separate sound setting changes.
- **Seen in:** voice-mute standardization (2026-09-29 / 2026-10-09).

## 25. Hint clocks start before the child has heard the instruction
- **Symptom:** hints appear or speak while the intro/teaching line is still playing; L3 cuts off L2.
- **Cause:** the idle ladder is armed on scene entry or fixed wall-clock timing instead of after the relevant VO
  has finished.
- **Fix:** start the first hint clock from the instruction VO's real `onEnd` (with a fallback). L3 should be armed
  after the L2 line finishes, not at a fixed "26s from idle start" time.
- **Seen in:** GMB Hint Standard v1 rollout, Shloka River and Symbol Mountain hint passes (2026-09-21 to 2026-10-05).

## 26. Random touches dismiss help
- **Symptom:** the child taps scenery or wiggles the pointer and the visible hint disappears / timer restarts, leaving
  them stuck again.
- **Cause:** code treats any pointer movement or any tap as "interaction".
- **Fix:** only meaningful progress clears a hint. A genuine but incomplete attempt keeps the visible hint; wrong
  attempts escalate; random background touches do nothing. `GestureDemo` is display-only and should not decide this.
- **Seen in:** hint-system pass (2026-10-01), choice-game ladders.

## 27. GestureDemo does not replay on L2 -> L3 escalation
- **Symptom:** the teaching hand plays at L2, but when the hint escalates to L3 nothing replays even though the hint
  level changed.
- **Cause:** `active={hintLevel >= 2}` stays true across both levels, so GestureDemo never sees a false->true edge.
- **Fix:** pass `replayKey={hintLevel}` (or another changing key) whenever one active condition covers multiple hint
  levels.
- **Seen in:** GestureDemo shared-component audit (2026-09-24).

## 28. Sidebar / tab pause loses the pending replay
- **Symptom:** open the sidebar or hide the tab during an intro; close/return; the interrupted line never replays, so
  the intro callback or hint clock never starts.
- **Cause:** a line is waiting in a replay window, then a second sidebar/tab interruption clears the pending replay
  without putting it back into the interrupted slot.
- **Fix:** track pending replays explicitly. If interrupted again before replay starts, preserve that line as the
  interrupted line so its normal callback can still run exactly once after replay.
- **Seen in:** sidebar-pause race fixes, Ears tab-hide, Flower Journey/Garland/Eyes (2026-10-01).

## 29. Drag/hold cleanup misses `pointercancel`, pause, or disabled state
- **Symptom:** an item stays grabbed, a hold ring keeps filling, RAF/timers continue, or a disabled drag still calls
  completion after tab hide / pause / touch interruption.
- **Cause:** cleanup handles only `pointerup` / `touchend`, not `pointercancel`, `isPaused`, unmount, or a `disabled`
  prop flipping while the gesture is active.
- **Fix:** every drag/hold must cancel active state on `pointercancel`, pause/tab-hide, unmount, and disabled changes.
  RAF loops need explicit cancellation too.
- **Seen in:** FreeDraggableItem, BeatPlayerGame, Kurumedeva, Garland, Pond-style holds (2026-09-18).

## 30. Completion saves or actions fire more than once
- **Symptom:** completion saves repeatedly while fireworks render, Continue double-navigates, or a fast double tap queues
  the completion handler twice.
- **Cause:** completion effects depend on fresh object identities (`completionData={{...}}`) or action buttons are
  still live during exit animations.
- **Fix:** dedupe completion saves by a stable key/payload per show cycle, and lock completion modal actions after the
  first tap.
- **Seen in:** `SceneCompletionCelebration.jsx` shared-layer fixes (2026-09-18/19).

## 31. Progress state treats `false` as missing
- **Symptom:** a scene or zone is marked complete when it should remain incomplete, or an explicit `completed:false`
  is overwritten by a default.
- **Cause:** merge/default logic uses `||` or other truthy checks where `false` is a valid value.
- **Fix:** use nullish checks (`??`) / explicit property checks for progress booleans. Preserve `false`.
- **Seen in:** ProgressManager `completed:false` fix (2026-09-27).

## 32. The wrong saved-state bucket is being tested
- **Symptom:** Continue looks fixed in one browser but broken in another; `?checklist=1` looks reset; Replay brings back
  old state after "fresh" start.
- **Cause:** `localhost:5173`, `127.0.0.1:5173`, normal profile storage, `gametest` harness storage, `temp_session_*`,
  and `replay_session_*` are separate buckets.
- **Fix:** when testing Continue/Replay, identify the active profile and origin, and clear both temp and replay keys
  for that scene. Do not read harness state as live app state without checking the prefix.

## 33. Dev harness / webSpeech scripts drift from live scene code
- **Symptom:** a VO line or intro works in the scene but not in the harness, or the harness plays old copy and sends the
  fix hunt to the wrong file.
- **Cause:** `src/dev/webSpeechScripts.js`, GameTestHarness maps, and live wrappers can duplicate the same VO/config.
- **Fix:** trace the live route from `App.jsx` and compare the harness copy before changing production code. Keep dev
  maps updated when VO keys change.
- **Seen in:** Sarvakaryeshu stale dev script and Samaprabha intro mapping issues.

## 34. Debug UI leaks into child gameplay
- **Symptom:** a child can open a layout panel, copy debug JSON, or trigger dev-only controls in a live scene.
- **Cause:** debug buttons/panels are rendered without `import.meta.env.DEV` / `DEBUG_UI_ENABLED` gates.
- **Fix:** gate every debug panel, copy-layout button, debug console line, and phase-jump UI. Confirm the live scene
  has no visible debug affordance.
- **Seen in:** Kurumedeva debug toggle, Samaprabha debug console calls, several layout-debug panels.

## 35. Hit area is smaller than the art looks, or art is smaller than the hit area rule
- **Symptom:** a control is hard to tap on phone/iPad, or audit says "looks fine" while the actual button is under
  60px.
- **Cause:** checking the visible icon/card instead of the real interactive box, or shrinking `min-width` /
  `min-height` at a breakpoint.
- **Fix:** measure the actual clickable element. Keep at least a 60px transparent hit area even when the visible icon
  is smaller.
- **Seen in:** Favorite Food, Family Tree, Pond reeds/lotus, phone chrome and modal passes.

## 36. Layout/debug coordinates use the wrong coordinate system
- **Symptom:** the hand points beside the target, a hit zone misses the visible object, or an imported editor layout
  appears shifted/scaled.
- **Cause:** mixing center-anchored vs top-left coordinates, stage vs background coordinates, shadow vs object
  placement, or a different basis between debug overlay and gameplay.
- **Fix:** write down the coordinate basis for each debug panel. Hit zones, glows, hands, and success checks should
  share the same element/coordinate space.
- **Seen in:** Eyes layout port, Samaprabha shadow/bank placement, Pond hand cues, Tusk/Kurumedeva debug tools.

## 37. Editing a dead duplicate file
- **Symptom:** a fix "lands" but the app does not change, or an audit flags console/CSS in a file the app never imports.
- **Cause:** the repo has obsolete Meaning Cave files, parked Festival Square scenes, backup/copy files, and old
  component folders.
- **Fix:** before editing or reporting, trace the live scene from `src/App.jsx` import mapping. Treat folder names and
  `sceneRegistry.js` as clues, not proof.

## 38. Asset path casing works locally but fails elsewhere
- **Symptom:** audio/image works on Windows dev but fails in build/deploy, or a fallback old recording plays.
- **Cause:** file path casing or public-path filenames differ (`KuruMeDeva` vs `kurumedeva`, uppercase/lowercase
  audio names, `.wav`/`.mp3` mismatch).
- **Fix:** match import/public paths exactly to disk casing and deployed filenames. For public audio maps, verify the
  key and extension against the actual file.
- **Seen in:** Scene3 filename casing, lowercase `/audio/words/*.mp3`, syllable mapping issues.

## 39. Service worker / cache hides asset fixes
- **Symptom:** deployed app still shows old art/audio after the code was fixed, or a cache-clear behaves differently
  from a normal reload.
- **Cause:** scene-bundled assets, public assets, or the app shell are cached by the service worker.
- **Fix:** when an asset fix does not appear on staging/prod, test after cache clear / update-manager reload and check
  service-worker precache rules before assuming the scene code is wrong.

## 40. Animation callbacks are used as the only completion save
- **Symptom:** progress is lost if the child leaves during an animation or if the animation callback is skipped.
- **Cause:** completion/progress writes happen inside `onAnimationEnd`, fireworks callbacks, fly-to-sidebar callbacks,
  or delayed visual cleanup instead of at the solve moment.
- **Fix:** save completion/progress at state-write / solve time. Animation callbacks may show visuals, but should not
  be the only source of truth for progress.
- **Seen in:** Scene completion persistence fixes and DECISIONS.md completion rule.

## 41. Beat transitions update pose, position, and carried objects separately
- **Symptom:** a character teleports, flickers back to idle, appears behind/in front of the wrong object, or a carried
  item snaps back before sliding.
- **Cause:** separate timers/effects update pose, position, z-index, placed/carry state, and "after" art independently.
- **Fix:** model each beat transition as one explicit state. Update pose/position/z-index/carry/placed art together,
  or use a single timeline that cannot briefly render impossible combinations.
- **Seen in:** Kurumedeva bridge work, Tusk bunny/bird/nest fixes.

## 42. A scene freezes and nobody can say why (use the stall watchdog + event log)
- **Symptom:** the game plays, then nothing happens: a card never shows (Nirvighnam after Next adventure), a
  game is dead after several Continues (Ears). The cause differs each time (StrictMode, a lost timer, a
  cancelled line), so fixing one at a time does not stop the next.
- **Tool:** `lib/hooks/useSceneWatchdog.js` + `lib/utils/sceneEventLog.js` + `lib/components/feedback/SceneStallPrompt.jsx`.
  `arm('reveal-card', 12000, recover)` when the GAME owes the child something; `disarm('reveal-card')` when it
  happens. On timeout: the last 40 scene events + a state snapshot are dumped (console + `localStorage.gmb_scene_stall_dumps`),
  `recover()` runs once, and if it still does not happen a big "Tap to keep going" button shows.
- **Rules:** (1) only for waits the game controls, never for "child should act" (idle is not stuck);
  (2) `recover()` must be idempotent - route it through the same guarded function as the normal path
  (the `revealStartedRef` Set, pitfall 13) so a slow-but-fine original path can't show two cards;
  (3) the clock freezes while the tab is hidden or the sidebar is open; (4) call `log(name, data)` at the steps you
  would want to see in a dump (line start/end/cancel, checkpoint, card set).
- **Reading a dump:** the table lists events with how long ago each was; the missing step is the cause. If the
  same cause shows up twice, give it its own fix and a pitfall entry.
- **Status:** built 2026-10-13, not yet adopted in any scene. Adopt first in the Shloka River card reveals and the
  Ears/Eyes start/resume, then only where a freeze has been seen.

## 43. A two-line voice sequence keeps talking after the scene is left
- **Symptom:** leave during line 1 of "line 1, then line 2" and line 2 plays on Zone Welcome.
- **Cause:** `useGaneshaVoice` cancels speech on unmount and reports that as `onEnd`. The scene's `aliveRef` cleanup was declared AFTER the hook, so it was still true when `onEnd` ran, and the next line started. Unmount cleanups run in declaration order.
- **Fix:** declare `aliveRef` (and its effect) BEFORE `useGaneshaVoice`. Also: unlock a Continue button from the line's end (with a failsafe timer), not a short fixed delay, or the next step's voice cuts the line.

## 44. A button keeps a purple shadow after it is tapped
- **Symptom:** a Continue / See Our Story button shows a purple shadow that stays after the tap (My Indian Story, 2026-10-13).
- **Cause:** `App.css` has a global `button:focus, button:focus-visible { box-shadow: 0 6px 0 #5a3fc0 }`. A tapped button keeps focus, and a scene class like `.btn` (one class) loses to `button:focus` (element + pseudo-class).
- **Fix:** give the scene's button its own `:focus, :focus-visible` rule that restates its normal shadow (specificity 0,2,0 beats 0,1,1). Do not edit the global rule: every scene relies on it.

## 45. The child's picks vanish after Continue (picks in local state or a private storage key)
- **Symptom:** the comparison card shows `?` and empty rows after Continue; the picks only came back on F5.
- **Cause:** picks lived in `useState` and a private `localStorage` key restored only when `isReload` was true. A plain Continue (not a reload) mounted with empty state.
- **Fix:** keep picks in `sceneState` and write each change with `checkpoint()`; no second private copy. Clear any old private key once so a stale step cannot resurrect.

## 46. A solved guess phase restarts on Continue
- **Symptom:** the child answered correctly, left during the success line, and Continue asks the guess again (or replays the entry line).
- **Cause:** the correct tap was only local state (`'correct'`), and the entry/reset effects set `'guessing'` on mount.
- **Fix:** `...Solved` checkpointed at the tap and `...SuccessDone` checkpointed when the line really ends (not cancelled, not unmounted, not an instant error). Capture "solved at mount" in a ref and gate the reset effects, entry voice and hint effects on it. Resume replays only an unfinished line, then advances; the flag is cleared when the timer FIRES (pitfall 1). Add every marker to `initialState` and Play Again (pitfall 11d).

## 47. A line starts the instant the previous phase's line ends, and is dropped
- **Symptom:** the next step's intro (e.g. child home) is silent after the closing line of the step before it.
- **Cause:** same family as pitfalls 2 and 3: speech started in the same moment another line ends or is cancelled is lost.
- **Fix:** every phase-entry line waits ~500 ms, not only the first one after a resume. A closing line's `onEnd` must use `ignoreCancel` so a cancelled line is not treated as finished (pitfall 11c).

## 48. Blank "Reload Scene" screen after adding a function used by an effect
- **Symptom:** the scene shows only the error boundary's Reload Scene button; console says "Cannot access 'x' before initialization".
- **Cause:** a ref assignment (`xRef.current = x`) or effect dependency placed ABOVE the `const x = ...` it reads. eslint and esbuild did not flag it.
- **Fix:** put the effect and ref assignments BELOW the handlers they read. After adding such code, open the scene in the browser; lint and a syntax check are not enough.

## 49. A "first run" guard is only consumed by a run that gets past an earlier return
- **Symptom:** after Continue on a question, the next success line never plays (Favourite Food). The log shows the
  line was never requested.
- **Cause:** an effect has `if (blockedByResumeGuard) return;` ABOVE `if (!hydratedOnce) { hydratedOnce = true; if (celebration) return; }`.
  On mount the guard blocks the first run, so `hydratedOnce` stays false; the child's first real answer is then the
  "first run" and is skipped as a stale reload into a celebration.
- **Fix:** mark the first-run flag in the run that actually happens first, even when it returns early.
- **Spot it:** a "first run / hydrated / mounted once" ref that is set below an early `return`.

## 50. A success line cuts the word the child just tapped; hints cut speaking lines
- **Symptom:** "Pizza" is cut by "Yummy!"; an idle hint starts over a question.
- **Cause:** success lines start on a fixed timer, hints on their own clocks, and nothing knows what is speaking.
- **Fix:** keep one voice gate per scene (`speakLine`) that remembers the line that is speaking. Success lines
  `waitForCurrent` (up to ~3.5 s); hints `priority: 'hint'` are skipped (their follow-up still runs) while a line speaks.
  Log every start/end/cancel/cut to the scene event log (`__sceneLog()`), so the next report comes with evidence.
- **Seen in:** Favourite Food (2026-10-14). Same pattern likely in Dreams and Family Tree.

## 51. A resume "silence guard" stays on forever if its one release timer is lost
- **Symptom:** after Continue, every phase line (questions, success lines) is silent for the rest of the scene.
- **Cause:** resume code sets `suppressPhaseVo = true` and releases it from one `safeSetTimeout`. Another
  `clearAllTimeouts()`, a remount or a pause can cancel that timer, and nothing else turns the guard off.
- **Fix:** every "block until X" flag needs a second way out: a short interval or a deadline that releases it
  and logs `resume-guard:force-released`. Never rely on a single timer to un-silence a scene.
- **Seen in:** Favourite Food (safety net added 2026-10-14; the main cause that day was pitfall 49).

## 52. Read the scene's event log before guessing at a voice bug
- **Symptom:** "the line didn't play", "it cut", "it repeated": three scenes, six different causes in a week.
- **Rule:** put every voice request through one function that writes to the scene event log
  (`logSceneEvent('food', 'speak:start' ...)`, read with `__sceneLog().food`). Then decide by the log:
  - the line is NOT in the log -> the scene never asked for it (a guard, an early return, a stale flag: look in the code);
  - `speak:start` but no sound -> the browser/engine (check cancel/pause state);
  - `speak:cuts` / `dropped-before-start` -> two requests landed together (add waiting or priority).
- Ask the tester to run `__sceneLog().<scene>` right after the bug; it survives Continue (it lives in memory).
- **Seen in:** Favourite Food 2026-10-14: the log showed the missing success line was never requested, which
  ruled out the engine and pointed at pitfall 49 in one step.

## 53. A shared doc silently loses an entry when two sessions write it
- **Symptom:** a CHANGELOG entry that was committed is gone from the working copy; `git diff` shows only deletions.
- **Cause:** a session rewrites the file from an older copy.
- **Fix:** before editing CHANGELOG / KNOWN_PITFALLS / DECISIONS, `git diff` the file; if it shows deletions you did
  not make, restore the committed version (`git checkout HEAD -- <file>`) and add your entry on top.
- **Seen in:** CHANGELOG 2026-10-14 (the 2026-10-13 About Me entry was missing from the working copy).

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
