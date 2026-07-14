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

