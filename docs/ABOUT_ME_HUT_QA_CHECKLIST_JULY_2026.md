# About Me Hut QA Checklist — July 2026

Scenes covered:
- `FamilyTreeGame`
- `DreamsWishesGame / ObstacleRemoverGame`
- `FavoriteFoodGame`
- `MyIndianStoryGame`

Use this as a manual verification sheet after the July 2026 bug sweep fixes.

---

## 1. FamilyTreeGame

### Core Flow
- [ ] Place all 4 Ganesha family members.
- [ ] Wait 5 seconds after the 4th placement.
- [ ] Confirm sparkles appear.
- [ ] Confirm sparkles turn off after about 2.5 seconds.
- [ ] Confirm `Continue` becomes tappable after sparkles end.
- [ ] Confirm `Continue` stays tappable and does not soft-lock.

### Placement Feedback
- [ ] Confirm the just-placed glow is visible before it clears.
- [ ] Confirm wrong-choice cards shake but stay tappable.
- [ ] Confirm rapid wrong-then-correct taps do not break flow.

### Child Tree Flow
- [ ] Confirm pressing Enter on empty name input does nothing.
- [ ] Confirm deleting child-family entries below 2 hides `Done`.

### Reload / Recovery
- [ ] Reload during `transition -> childInput`.
- [ ] Confirm the bottom tray appears after reload.
- [ ] Reload in `transition`.
- [ ] Confirm recovery is correct.
- [ ] Reload in `sideBySide`.
- [ ] Confirm recovery is correct there too.

### Audio
- [ ] Turn audio off before Tree Done.
- [ ] Confirm the scene still advances normally.

---

## 2. DreamsWishesGame / ObstacleRemoverGame

### Drawing Flow
- [ ] Enter the drawing flow.
- [ ] Tap `Cancel`.
- [ ] Confirm it returns to `all-wishes-complete` instead of a blank screen.
- [ ] Start drawing again.
- [ ] Reload during `dream-drawing`.
- [ ] Confirm the drawing pad reopens after reload.
- [ ] Save a drawing.
- [ ] Confirm flow continues into the dream reveal sequence.

### Trunk Reveal Flow
- [ ] Reach the trunk-tap phase.
- [ ] Tap Ganesha's trunk 3 times to reveal the dream.
- [ ] After reveal, spam extra taps on the trunk/helper.
- [ ] Confirm extra taps do not restart or postpone the transition.
- [ ] Confirm the comparison card still appears on time after reveal.

### Reload / Recovery
- [ ] Hide and return to the tab during dream phases.
- [ ] Confirm there is no dead end or VO pileup.
- [ ] Reload during `wish1-complete`.
- [ ] Confirm rollback recovery works.
- [ ] Reload during `wish2-complete`.
- [ ] Confirm rollback recovery works.
- [ ] Reload during `wish3-complete`.
- [ ] Confirm rollback recovery works.

### Replay
- [ ] Trigger completion replay/reset.
- [ ] Confirm the whole scene resets cleanly.

---

## 3. FavoriteFoodGame

### Ganesha Choice Recovery
- [ ] Reload a Ganesha choice phase with missing/empty randomized arrays.
- [ ] Confirm choice cards still populate.
- [ ] Confirm the scene does not come back blank.

### Text Input Saves
- [ ] Open food text input.
- [ ] Save a value while VO is active.
- [ ] Confirm the current VO stops before success feedback plays.
- [ ] Open activity text input.
- [ ] Save a value while VO is active.
- [ ] Confirm the current VO stops before success feedback plays.

### Modal / Flow Safety
- [ ] Confirm cancel from drawing returns to the live choice screen.
- [ ] Confirm cancel from typing returns to the live choice screen.
- [ ] Reload mid-advance.
- [ ] Confirm the scene rolls back to the correct question and replays VO.
- [ ] Hide and return to the tab during child completion flow.
- [ ] Confirm recovery does not double-advance.

### Tap Guards
- [ ] Confirm all Ganesha choice screens block double-taps correctly.
- [ ] Confirm all child choice screens block double-taps correctly.

### Replay
- [ ] Trigger completion replay/reset.
- [ ] Confirm modals, child data, and flow state reset cleanly.

### Layout Follow-Up
- [ ] iPad / portrait CSS pass: review `CHILD_ACTIVITY_POSITIONS` for overflow risk.

---

## 4. MyIndianStoryGame

### Origin Card Reload
- [ ] Reach Origin Card and make selections.
- [ ] Reload on the same phase.
- [ ] Confirm region, languages, and festivals restore correctly.
- [ ] Reload from a later phase.
- [ ] Confirm restore still works there too.

### Language Guess Flow
- [ ] Tap a wrong language guess.
- [ ] Confirm the wrong card is not permanently disabled.
- [ ] Tap the correct language.
- [ ] Confirm normal success flow and advance.

### Festival Guess Sanity Check
- [ ] Confirm festival guess behavior still feels consistent with the intended non-elimination pattern.

### Navigation
- [ ] From completion, tap `Home`.
- [ ] Confirm it navigates to `home`.

### Tab Hide / Return
- [ ] Hide and return to the tab during `Ganesha Home`.
- [ ] Confirm idle hints reset cleanly.
- [ ] Hide and return to the tab during language guess.
- [ ] Confirm idle hints reset cleanly.
- [ ] Hide and return to the tab during festival guess.
- [ ] Confirm idle hints reset cleanly.

### Cleanup / Regression
- [ ] Confirm no regression from removing dead `languagePlayNudgeIntervalRef`.

### Product Decision Follow-Up
- [ ] Decide whether hidden `kailash` content should remain cut or be restored.

---

## 5. Cross-Scene Sweep

### Safety Patterns
- [ ] Every cancel/close path returns to a live interactive screen.
- [ ] Reload on the same phase restores state, not just later phases.
- [ ] Success triggers become non-repeatable immediately.
- [ ] Effects do not cancel their own timers through dependency churn.
- [ ] Duplicate timers in one handler do not race unintentionally.

### Hidden Tab / Resume
- [ ] Hidden-tab return does not stack resume VO over idle VO.

### Replay / Reset
- [ ] Completion replay fully resets transient state and modals.

### Audio-Off Paths
- [ ] Audio-off paths still advance without waiting on VO callbacks.

---

## 6. Symbol Mountain Addendum

### Pond
- [ ] Drag the water drop, background the app/tab, return after countdown, then move your finger without pressing.
- [ ] Confirm there is no ghost drag and the drop stays reset at the start.
- [ ] Drag the water drop and trigger a system cancel on iPad.
- [ ] Confirm the drag cancels cleanly.
- [ ] Drag off-path.
- [ ] Confirm the drop fades and resets once.
- [ ] Drag partway and release.
- [ ] Confirm the drop fades and resets once.
- [ ] Complete the full petal path to the golden lotus.
- [ ] Confirm the normal success flow still works.
- [ ] Reload during drag-ready state, trunk-active state, and bloom/celebration state.
- [ ] Confirm there is no stuck drag, no console issue, and resume is sensible.

### Tusk Mini-Game
- [ ] Start elephant hold, background the app for 3 to 5 seconds, return, and keep holding.
- [ ] Confirm the obstacle does not auto-complete on resume.
- [ ] Start elephant hold, then release normally before completion.
- [ ] Confirm hold resets cleanly.
- [ ] Start scrubbing a non-elephant obstacle, then trigger a system gesture or interruption.
- [ ] Confirm scrub stops immediately.
- [ ] Start scrubbing, release outside the obstacle, then move back over it without pressing.
- [ ] Confirm there is no ghost scrub.
- [ ] Complete a full tusk sequence.
- [ ] Confirm all layers, VO, and finale still work.
- [ ] Background and return during idle.
- [ ] Confirm there is no instant strong idle hint or VO.

### Eyes Mini-Game
- [ ] Wait for the first idle hint.
- [ ] Confirm one specific animal is hinted.
- [ ] Keep waiting through later idle thresholds.
- [ ] Confirm the hint stays on the same animal and does not hop every second.
- [ ] Discover the hinted animal, then wait again.
- [ ] Confirm a new undiscovered target is chosen later.
- [ ] Background the app for 10 to 30 seconds and return.
- [ ] Confirm there is no instant strongest hint on resume.
- [ ] Complete the round normally.
- [ ] Confirm there is no regression in discovery flow.

### Symbol Mountain Scene
- [ ] Finish tusk and trigger final fireworks.
- [ ] Confirm completion state is written immediately.
- [ ] Reload during fireworks before completion UI.
- [ ] Confirm the scene still comes back completed.
- [ ] Tab away during fireworks and return.
- [ ] Confirm voice stops on hide and the completion flow does not break.
- [ ] Let fireworks finish normally.
- [ ] Confirm mandala / completion still appears.

### Sacred Assembly
- [ ] Place a correct symbol while Ganesha is speaking.
- [ ] Confirm the next round waits correctly for live VO, then advances.
- [ ] Place several symbols in a row.
- [ ] Confirm there is no premature next-card start and no stuck wait.
- [ ] Place the 8th symbol and trigger final celebration.
- [ ] Confirm completion is persisted immediately.
- [ ] Reload during fireworks / orbs.
- [ ] Confirm the completion flow recovers and does not hang.
- [ ] Tab away mid-celebration and return.
- [ ] Confirm there is no stuck celebration gate.
- [ ] Let full celebration finish normally.
- [ ] Confirm the completion UI still appears.

### Global Sanity
- [ ] Confirm there are no ghost gestures after pause/cancel.
- [ ] Confirm there is no instant idle hint blast immediately after tab return.
- [ ] Confirm there are no console errors during pause/resume, reload mid-celebration, or completion.

---

## 7. Modak Addendum

### NewModakSceneV7
- [ ] Reach game 3 and feed one modak normally.
- [ ] Confirm the basket loses 1 modak, Ganesha's belly grows once, and feed count advances once.
- [ ] Feed the second modak at a normal pace.
- [ ] Confirm the basket loses 1 more modak, belly grows again, and no progress is missed.
- [ ] Try two very fast back-to-back drops.
- [ ] Confirm only one drop is accepted if they land too close together, with no desync where a modak disappears without belly growth.
- [ ] Wait about half a second, then drop again.
- [ ] Confirm the next drop works normally once the short lock window has passed.
- [ ] After feeding modak 1, stop interacting and wait for idle hints.
- [ ] Confirm visual hints restart and the feed voice hint can play again.
- [ ] After feeding modak 2, stop interacting and wait again.
- [ ] Confirm visual hints restart again and the feed voice hint can play again.
- [ ] Feed all 3 modaks.
- [ ] Confirm dragging stops, no extra drops are accepted, and the transformation flow still starts correctly.
- [ ] Reload during game 3 before finishing.
- [ ] Confirm game 3 restores, feed instruction voice replays, and the idle timer restarts.
- [ ] Confirm also that the original drag gesture currently does not reappear on reload.
- [ ] Pause during game 3, then resume.
- [ ] Confirm feeding still works, hints/timers remain stable, and no stuck drag/feed state appears.
- [ ] Try dropping after the completion threshold is reached.
- [ ] Confirm no more feeding happens once `rockFeedCount` is `3`.

---

## 8. Shloka River Addendum

### Scene 1 — Vakratunda Grove
- [ ] Zone map (Shloka River welcome screen) shows `Continue`, not `Play Again`, when leaving mid-scene (e.g. during the Mahakaya symbol reveal).
- [ ] Tap Home mid-second-symbol-reveal, return via `Continue` — confirm the reveal card reappears (not a blank/frozen scene).
- [ ] Complete a word — confirm fireworks play fully, then the mandala appears (not simultaneously with fireworks), then the completion modal after tapping through the mandala.
- [ ] Pause (open recorder / background tab) mid Mahakaya rope-pull — confirm the log freezes in place, does not sink, and resumes from the same spot.
- [ ] Recorder open/close during either mini-game — confirm the intro VO sequence does not restart.
- [ ] Vakratunda frog-crossing: drop a piece on a wrong (non-next) slot — confirm the correct-next ring shakes and plays the "blocked" VO line, instead of silently snapping back.
- [ ] Vakratunda frog-crossing: confirm pieces can only be placed in syllable order (va→kra→tun→da) — a piece dropped on a future slot bounces back.
- [ ] Home button mid-scene — confirm progress is preserved (does not clear temp session / force replay).

### Scene 2 — Suryakoti Bank + Samaprabha
- [ ] Scratch the sun reveal — confirm syllables (su-ya-ko-ti) sound out as they light up.
- [ ] Mid-scratch, resize/rotate the viewport — confirm cleared progress is preserved (does not reset to 0%).
- [ ] Pause mid-bunny-hop sequence — confirm the hop holds instead of continuing in the background.
- [ ] Confirm only one scratch-target ring cue is visible (no duplicate static + animated ring).
- [ ] Samaprabha: drag the sun handle — confirm it actually responds to pointerdown/drag (not frozen) and snaps per stop with syllable audio (sa-ma-pra-bha).
- [ ] Samaprabha: mute audio, reach the "done" state — confirm completion still fires via the fallback timer (~4s) instead of hanging.
- [ ] Complete both games — confirm fireworks → mandala → completion modal sequencing (mandala waits for fireworks, matches Scene 1).

### Scene 3 — Nirvighnam + Kurumedeva
- [ ] Nirvighnam: drag each of the 3 obstacles (stone, branch, reed) to its ground drop-zone — confirm it clears regardless of drag angle, and confirm the drop-zone rings sit clearly on the grass bank, not overlapping the obstacle's own resting spot.
- [ ] Nirvighnam: drag an obstacle partway and release without reaching a drop zone — confirm it springs back to its original position (no permanent shift).
- [ ] Nirvighnam: confirm the stone's on-load position matches its configured spot with no debug panel / element-highlight open (rule out visual artifact vs. real state bug).
- [ ] Nirvighnam: confirm nir-vigh-nam syllable audio plays as obstacles clear.
- [ ] Kurumedeva: tap each of the 4 friends (turtle, bird, squirrel, bunny) — confirm ku-ru-me-deva syllable audio plays per tap.
- [ ] Kurumedeva: confirm the tap hitbox is forgiving — taps near (not just dead-center on) each friend should still register.
- [ ] Kurumedeva: pause mid-friend-tap sequence — confirm timers hold instead of continuing in the background.
- [ ] Kurumedeva: confirm all 4 friends' bridge pieces land in the correct visual spot (post `scene3LayoutConfig` position cleanup for turtle/squirrel).

### Scene 4 — Sarvakaryeshu + Sarvada
- [ ] Each of the 4 situation cards (puzzle, sports, bike, grandma) — confirm the before-image and question show first, the story auto-narrates, then the after-image reveals, then options become tappable (not tappable before the story finishes).
- [ ] Confirm the bike card shows the correct before/after images (was previously swapped).
- [ ] Mute audio / with VO files still missing — confirm the before→after→pickable sequence still advances via the fallback timers instead of hanging.
- [ ] Pick correctly — confirm the flying-power animation + extended golden glow (1200ms) plays, then the situation advances.
- [ ] Sarvada game — not yet audited; general smoke test (completion, pause, audio) recommended.

### Shloka River Cross-Scene
- [ ] Confirm every scene shows `Continue` (not `Play Again`) on the zone map while genuinely incomplete, and `Play Again` only once actually completed.
- [ ] Confirm Home mid-reveal/mid-game across all 4 scenes preserves resume (no forced replay, no blank scene on return).

### Nirvighnam — Hint Pulse Jump Fix
- [ ] Enter the scene, don't touch anything for ~8s — confirm the "next" stone/branch/reed pulses smoothly with no visible jump/snap in size or position when the hint kicks in.
- [ ] Try a failed/partial drag first (pick up an obstacle, drop it wrong), then wait for the hint — confirm still no jump now that the idle breathing animation and hint pulse don't overlap.
- [ ] Let it run to level 2/3 hints (glow) — same check, no snap.

### ShlokaRiverFinale (shloka assembly + recap)

**Hint timing**
- [ ] Tap a few wrong boats in a row — hint clock should NOT reset; the level-1/2/3 hints should still arrive on schedule (10s/20s/35s) despite the wrong taps.
- [ ] Place a correct boat — hint clock should reset for the next slot.

**Word-audio prompting**
- [ ] Start the game — first word's audio ("Vakratunda") should auto-play ~1.8s after start, before you touch anything.
- [ ] Place each correct word — confirm the next word's audio plays automatically (~420ms after placement), so you're matching by sound, not reading labels.
- [ ] Placed-word echo audio (existing behavior) should still play immediately on correct placement — check both echo and next-prompt aren't stepping on each other.

**GestureDemo removal**
- [ ] Sit idle 3s+ on the tray with 0 correct so far — confirm no floating tap-hand demo appears anymore (it was pointing at the wrong boat before).

**Pointer handling**
- [ ] Drag a boat and drag your finger/cursor off the edge of the screen/container before releasing — confirm the drag still cancels cleanly (was `onPointerLeave`, now `onPointerCancel` — test both mouse-out and an actual OS-level pointer cancel if possible, e.g. an incoming touch interruption).

**Reload / resume (already-present logic — verify it still works)**
- [ ] Get all 8 correct — right as the SUCCESS overlay shows, reload the page — should resume into RECAP after ~3s, not strand on the overlay.
- [ ] Reload mid-RECAP — should resume RECAP from a valid boat, not blank.

**Audio teardown (the actual regression risk)**
- [ ] Play through a good chunk of the game (place several words, trigger a couple of hint cycles) and confirm voice/SFX keep working throughout — audio should not cut out partway through before reaching SUCCESS. (Previously the cleanup effect could fire mid-game and kill `fullShlokaAudioRef`/timers early if `clearAllTimeouts`/`clearHintTimers` identities changed; it should now only fire on unmount.)
- [ ] Actually unmount the scene (nav home / zones / back button) mid-recap while `playFullShloka` audio is playing — confirm audio actually stops (the real unmount-cleanup path, now isolated to `[]` — make sure it still fires on real unmount, not just that it doesn't fire early).

**Nav stars (already present)**
- [ ] Check TocaBocaNav's progress indicator reflects `sceneState.stars`/`completed` correctly before and after finishing the scene.

**Regression sweep**
- [ ] Full run-through once with audio ON and once with audio OFF (muted) — confirm SUCCESS→RECAP→FINALE→COMPLETE all still transition (the muted path relies on the 2000ms fixed-tick recap advance, not `onWordStart`).

---

## 9. Map + ZoneWelcome Addendum

Covers `CleanMapZone.jsx` and `ZoneWelcome.jsx` fixes from the July 2026 changelog.

### Launch Blocker — Completion Alignment
- [ ] Fresh profile → complete Modak fully (through the completion screen, not just `rock_transformed`) → return to map.
- [ ] Confirm the Modak dot fills and Shloka River unlocks on the map.
- [ ] Reopen the Modak card from Shloka River's zone-welcome-equivalent map state — confirm it shows `Play Again`, not `Continue`.
- [ ] Leave Modak mid-way at the `rock_transformed` stage (belly card reveal, not full completion) → return to map — confirm the map does NOT mark it complete or unlock River yet.

### Map Editor Props Merge
- [ ] With a saved `gmb_map_props` snapshot already in localStorage, ship a code change to `MAP_PROPS` (or simulate by editing a prop's `left`/`top` in code) — confirm the map picks up the new code default rather than being stuck on the stale saved value.

### Persistence Effects — No Write on Fresh Mount
- [ ] Load the map fresh on a device/profile that has never opened the map editor — confirm `gmb_map_props` / `gmb_map_overlays` / `gmb_map_zone_art` are NOT written to localStorage just from mounting.
- [ ] Open the map editor (dev mode) and make an edit — confirm persistence now does write after that edit.

### Map Editor Prod Gating
- [ ] In a production build, hold the parent-corner icon for 900ms+ — confirm the map editor does NOT open (no-op).
- [ ] In a dev build, hold the parent-corner icon for 900ms+ — confirm the map editor still opens normally.
- [ ] Confirm `MapEditorFull` is not present in the production bundle (lazy-loaded, dev-only).

### Ambient Audio + Console Logging
- [ ] Confirm the map's ambient audio loads the `.mp3` file (not `.wav`) — check network tab or file size.
- [ ] Confirm no `[VO]`-prefixed console logs appear during normal map play (unlock chimes, zone taps, idle nudges).

### Shloka River Dots Threshold
- [ ] Complete exactly 1 Symbol Mountain scene → open the map — confirm Shloka River is unlocked AND its progress dots are visible (not just unlocked with no dots until scene 2).

### ZoneWelcome Confetti
- [ ] Complete the final scene in a zone → confirm confetti plays once and fully clears from the DOM (inspect after ~2s — no leftover invisible confetti nodes).
- [ ] Re-enter the same completed zone on the same profile — confirm confetti does NOT replay (once-per-profile-per-zone).

### ZoneWelcome Console Logging
- [ ] In a production build, confirm ZoneWelcome does not spam scene-status console logs on every render/state change.
- [ ] In a dev build, confirm the debug logs still appear (gated correctly, not fully deleted where still useful).

### ZoneWelcome Multi-line Zone Names VO
- [ ] Enter a zone whose name has an embedded newline (e.g. "Shloka\nRiver") — confirm the welcome VO line reads naturally with all newlines replaced by spaces, not just the first one.
- [ ] Complete that same zone — confirm the completion VO line also reads correctly with all newlines replaced.

### Regression Sweep
- [ ] Fresh profile end-to-end: complete Modak → map shows correct state → enter Shloka River zone welcome → confirm scene statuses, dots, and confetti all behave consistently with the map.
- [ ] Confirm no new console errors introduced by the lazy `MapEditorFull` import or the `React.Suspense` wrapper.

---

## 10. GaneshaIntroStory Addendum

Covers `GaneshaIntroStory.jsx` fixes from the July 2026 changelog.

### Double-Tap Loop (fix #3)
- [ ] On slide 1 ("Tap to begin"), tap once, then immediately tap the stage/button a second time before the 2.8s window elapses.
- [ ] Confirm the second tap is silently ignored — no VO restart, no timer reset, no loop.
- [ ] Confirm the story advances to slide 2 exactly once, at ~2.8s after the first tap.

### VO Cutoff on Slide 1 (fix #2)
- [ ] Tap "Tap to begin" with audio on — confirm the intro VO line ("Are you ready? Let's meet Ganesha!") plays to completion before the slide advances (not cut off at ~1.1s).
- [ ] With audio explicitly disabled (`ganesha_audio_enabled` = `'false'`), tap "Tap to begin" — confirm the advance is fast (~1.1s), not the full 2.8s.

### Dead `spokenSlideRef` Removal (fix #1)
- [ ] Step through all 6 slides normally — confirm each slide's VO still plays exactly once per slide-visit (no double-speak, no missing speech).
- [ ] Navigate back to a previously-visited slide (if reachable) — confirm VO still fires correctly with no stale-ref suppression.

### Skip Cancels VO Immediately (fix #4)
- [ ] Start VO playing on any slide, then tap `Skip` mid-sentence.
- [ ] Confirm speech stops immediately — no trailing audio after the story overlay closes.

### Regression Sweep
- [ ] Full run-through with audio ON: all slides advance, VO plays per slide, end screen reachable, `onComplete` fires correctly.
- [ ] Full run-through with audio OFF: all slides advance at the faster pace with no hangs or console errors.
- [ ] Confirm no console errors related to `speechSynthesis` across mount, slide changes, Skip, and unmount.
