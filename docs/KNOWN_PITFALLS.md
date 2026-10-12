# Known pitfalls — things that broke before and how to avoid them

Read this before touching resume / Continue, voice lines, timers, shared components or CSS.
Each entry: **symptom → cause → how to spot it → fix → where it happened.** Add a new entry whenever a
bug costs more than an hour. (Started 2026-10-12 from the Continue/resume work.)

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

## 12. Tooling gotchas (Windows dev machine)
- **Two builds at once** (two sessions running `vite build`) clobber `dist/` — you get
  `ENOENT … dist/images/…`. Run one build at a time.
- **File locked (EPERM / UNKNOWN open)** when saving a file the dev server is watching: just retry.
- **`localhost:5173` and `127.0.0.1:5173` keep separate saved progress.** Stale `temp_session_*` /
  `replay_session_*` keys (and the `gametest` profile) make Continue tests confusing; clear them between runs.
- **Dev only vs production:** StrictMode double-runs effects only in `npm run dev`. If a bug appears only in
  dev, suspect #1 / #4 first.
- **No local test runner:** `package.json` says `jest` but it isn't installed, and
  `BeatPlayerGame.test.jsx` uses `jest.mock`. Those tests can't run.

---

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
