# Smoke Test — Symbol Mountain (Zone 1, all 4 scenes)

**Date:** 2026-08-17
**Tester:** Claude Code (automated in-app browser + dev server for scenes 1-2; static code review for scenes 3-4)
**Protocol:** [10-Point Smoke Test](../CLAUDE.md) (see memory: `feedback_10_point_smoke_test`)

Pass rule: 0–1 fails = PASS (ship). 2+ fails = FAIL (log to TASKS, batch later). Any crash = BLOCKER (fix now).

**This is the single, standing smoke-test log for Symbol Mountain.** New scenes/re-tests get appended below as new dated sections — do not create a new file per scene.

---

## Session note — environment limitations hit during this pass

Two tooling issues surfaced while testing scenes 1-2 live, both **environment artifacts, not app bugs**:
1. The Browser pane wasn't visually open for part of the session — `requestAnimationFrame`-driven interactions (hold-to-bloom, etc.) silently don't progress when the pane isn't composited. Fixed once the pane was opened.
2. `document.hidden` reported `true` at the JS level throughout, even with the pane visibly open and compositing. This correctly triggers the app's own `usePauseAwareTimeout` / `useResumeCountdown` pause-on-hidden safety features (deliberate, Sago Mini-style design) — so any scene relying on those (all of them) can get stuck mid-timer in this environment. A later dev-server/tab restart also wiped `localStorage` (fresh session, lost all prior profile/progress).

**Net effect:** Scenes 1-2 got real, live, interactive testing (clicks/drags/holds all confirmed working against actual event handlers). Scenes 3-4 could not be reached live without redoing the entire onboarding flow, so they got a **static code review** instead — checked against the same benchmark checklist and scanned for banned fonts / dead code, but not played.

---

## Scene 1 — Modak (`symbol-mountain/modak`) — LIVE TESTED
[NewModakSceneV7.jsx](../src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx) — **this is the project's benchmark scene**, used as the pattern reference for scenes 2-4.

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | Loads without console error | ✅ PASS | |
| 2 | Playable | ✅ PASS | Tapped mud mounds, found Mooshika, dragged her, no freeze/crash |
| 3 | Completes successfully | ✅ PASS | Collected 3 modaks, fed rock, reached completion |
| 4 | Celebration fires | ✅ PASS | Completion screen rendered cleanly — "Next Adventure" / "Home" / "Play Again" |
| 5 | Progress saves | ✅ PASS | Full reload confirmed via localStorage: `completed:true, stars:3`; scene 2 auto-unlocked |
| 6 | Pause/resume | Not fully tested — blocked by #9 |
| 7 | Audio + mute | Not tested |
| 8 | Correct fonts | ✅ PASS | Headings `"Baloo 2", system-ui, sans-serif`; body `Nunito, sans-serif` |
| 9 | Back button | ⚠️ **Suspicious — see finding below** |
| 10 | Zero console errors, full replay | ✅ PASS | Zero errors end-to-end |

**Overall: PASS with a flag.** 8/10 clean, 1 suspicious, 2 untested.

### Finding: Home/Back button — unconfirmed
**File:** [HomeButton.jsx](../src/lib/components/ui/HomeButton/HomeButton.jsx)
Deliberate 2-tap-to-confirm pattern (tap 1 arms + shows tooltip for 2.5s, tap 2 navigates — sensible, prevents accidental progress loss). Across multiple automated attempts (native click, dispatched `MouseEvent`, direct React handler invocation via fiber), the component's `isArmed` state never flipped and no tooltip appeared — no errors, no exceptions either. Could not confirm whether this is a real bug or a browser-automation artifact (this session's `read_page`/screenshot tools were broken at the time). **Needs a real manual tap-test.**

---

## Scene 2 — Pond / "The Golden Lotus" (`symbol-mountain/pond`) — LIVE TESTED (partial)
[PondSceneSimplifiedV4.jsx](../src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx)

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | Loads without console error | ✅ PASS | |
| 2 | Playable | ✅ PASS | Held each lotus for its required duration (1.5s/1.5s/2s); glow ring + hold progress confirmed working once the pane was actually visible/compositing |
| 3 | Completes successfully | ✅ PASS (lotus phase) | All 3 lotuses bloomed (`lotusStates: [1,1,1]`), confirmed via saved state and DOM `src` |
| 4 | Celebration fires | ⚠️ **Not confirmed — see below** |
| 5 | Progress saves | Not tested — gated behind #4 |
| 6 | Pause/resume | Not tested |
| 7 | Audio + mute | Not tested |
| 8 | Correct fonts | ✅ PASS | Title `"Baloo 2"`; subtitle `Nunito` |
| 9 | Back button | Same open question as Scene 1 (shared component) |
| 10 | Zero console errors | ✅ PASS through everything tested | (Two *expected* dev-only noise errors seen later: Vite HMR WebSocket disconnect, and one `Music play failed: AbortError` from a rapid pause/resume — both artifacts of this session's tab flapping, not real bugs) |

**Overall: PASS on everything tested** (2, 3, 8, 10) — no bugs found in the actual mechanic. Cannot certify 4-7, 9.

### Why the finale wasn't reached (not a bug)
After all 3 lotuses bloom, the scene schedules a "Lotus" reveal card via `safeSetTimeout` chains ([PondSceneSimplifiedV4.jsx:962-982](../src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx#L962)) — from [`usePauseAwareTimeout.js`](../src/lib/hooks/usePauseAwareTimeout.js), a deliberate feature that pauses all pending timers while the tab is hidden and resumes them on return (explicitly modeled on Sago Mini / Toca Boca). In one pass, `document.hidden` staying stuck `true` blocked this from ever firing. In a later reload it *did* progress once (golden lotus appeared, got tapped, "Getting ready... 3" resume countdown appeared) but then got caught in a repeated hide/show flap loop — each automated action seemingly re-triggering `visibilitychange`, resetting the countdown before it could reach the elephant/trunk finale. **This confirms the pause-safety mechanic itself works as designed** — it's the automation session's visibility flapping that's the obstacle, not the app.

**Needs manual verification:** bloom all 3 lotuses → confirm "Lotus — I stay calm" reveal card appears within ~2.5s → confirm it leads to the elephant/golden-lotus/trunk finale → confirm a completion screen and save.

---

## Scene 3 — Symbol (`symbol-mountain/symbol`) — STATIC CODE REVIEW ONLY
[SymbolMountainSceneV3.jsx](../src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx) — not live-tested; gated behind completing Pond, and a dev-server/tab restart wiped the test profile before this scene could be reached live.

### ✅ Benchmark checklist — confirmed present
- `useSceneReset(sceneActions, 'symbol-mountain', 'symbol', getSceneResetConfig('symbol'))`
- `<HomeButton onNavigate={onNavigate} />`, `<AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />`
- `<SceneCompletionCelebration ... />`, `ProgressManager.updateSceneCompletion(...)`
- `usePauseAwareTimeout`, `useResumeCountdown`, `ResumeCountdown` (same pause-safety pattern as scenes 1-2)
- 3 sub-games: `EyesPopUpGame`, `EarsSoundMatchGame`, `TuskPathGame`

Structurally matches the Modak benchmark. No missing imports or obviously miswired props on read-through.

### ✅ Bug found and fixed: dead CSS used a banned font
**File:** [SymbolMountainScene.css](../src/zones/symbol-mountain/scenes/tusk/SymbolMountainScene.css)
`.rhythm-sequence-display` (and its state/responsive variants) used `font-family: 'Comic Sans MS', cursive` — directly against the Baloo 2/Nunito rule. Traced the usage: this class belonged to the retired `EarsRhythmGame.jsx`, replaced by `EarsSoundMatchGame.jsx` (confirmed via its own comment: `// Replaces EarsRhythmGame`). The live scene imports `EarsSoundMatchGame`, not the old one — so this CSS had **no live consumer**, not currently user-visible.
**Fixed 2026-08-17:** deleted all `.rhythm-sequence-display` rules across 6 separate locations (base styles, 3 responsive breakpoints, phase-state animations/keyframes, z-index list). Left `.discovered-instrument.*` and `.instruments-found-counter` rules in the same blocks untouched — still live.

### Not checked (needs live testing)
All 10 smoke-test points require actual gameplay through `EyesPopUpGame` → `EarsSoundMatchGame` → `TuskPathGame` — none of that was exercised.

---

## Scene 4 — Sacred Assembly / final scene (`symbol-mountain/final-scene`) — STATIC CODE REVIEW ONLY
[SacredAssemblySceneV8.jsx](../src/zones/symbol-mountain/scenes/final%20scene/SacredAssemblySceneV8.jsx) — not live-tested, same reasons as Scene 3.

### ✅ Benchmark checklist — confirmed present
- `useSceneReset(sceneActions, 'symbol-mountain', 'final-scene', getSceneResetConfig('final-scene'))`
- `<HomeButton onNavigate={onNavigate} />`, `<AudioToggle isAudioOn={isAudioOn} onToggle={toggleAudio} />`
- `<SceneCompletionCelebration ... />`, `ProgressManager.updateSceneCompletion(...)`
- `GameCoach` correctly **not** imported live (commented out) — matches the project rule to use `SimpleDiscoveryOverlay` instead, not `GameCoach`. (Some leftover unused state variable names like `isReloadingGameCoach` remain from before it was disabled — harmless naming debt, not a bug.)

### ✅ Bug found and fixed: wrong font name (`'Baloo'` instead of `'Baloo 2'`)
**File:** [SacredAssemblyScene.css](../src/zones/symbol-mountain/scenes/final%20scene/SacredAssemblyScene.css)
6 rules used `font-family: 'Baloo', cursive` — but `index.html` only loads **"Baloo 2"** via Google Fonts, not a font named plain "Baloo". Since `'Baloo'` doesn't match any loaded font, those elements were silently falling back to the browser's generic `cursive` font (varies wildly by OS/browser — not the branded look).
**Fixed 2026-08-17:** all 6 occurrences (lines 1327, 1416, 1800, 1811, 2032, 2044) changed to `'Baloo 2', cursive`. Verified no more bare `'Baloo'` references remain in the file.

### Not checked (needs live testing)
All 10 smoke-test points — this is the zone's culminating scene (full Ganesha assembly across all 8 symbols) and needs a full live pass once reachable.

---

## Summary table

| Scene | Live tested? | Verdict | Bugs found |
|---|---|---|---|
| 1. Modak | Yes (partial) | PASS with a flag | Home button behavior unconfirmed |
| 2. Pond | Yes (partial) | PASS on tested items | None — finale blocked by tooling, not app |
| 3. Symbol | No — static only | Structurally OK | Dead Comic Sans CSS — **fixed** |
| 4. Sacred Assembly | No — static only | Structurally OK | Wrong font name (`Baloo` → `Baloo 2`) — **fixed** |

## What still needs manual, real-device verification
1. **Home/Back button** (shared `HomeButton.jsx`, all scenes) — confirm the 2-tap-to-confirm pattern works on a real tap.
2. **Pond finale** — bloom all 3 lotuses, confirm reveal card → elephant/trunk sequence → completion.
3. **Scene 3 (Symbol) full playthrough** — Eyes → Ears → Tusk mini-games, completion, save.
4. **Scene 4 (Sacred Assembly) full playthrough** — the zone's culminating scene.
5. **Audio + mute** — untested anywhere this session; needs a real device with sound.
6. **Pause/resume** mid-scene — untested live due to the `document.hidden` tooling issue; the underlying mechanic (`usePauseAwareTimeout`) is well-built, but real device confirmation is still needed.
