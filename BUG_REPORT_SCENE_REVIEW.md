# Scene Bug Report — Symbol Mountain Zone (Scenes 1–4)

## SCENE 01: Modak (NewModakSceneV7.jsx)

### Critical Bugs

1. **Analytics stale closure** (line 380)
   - **Issue:** `Analytics.sceneAbandoned()` in cleanup captures the frozen initial `sceneState` from mount render, not live state
   - **Impact:** Every replay—even completed scenes—reports as abandoned
   - **Fix:** Read live state via `sceneStateRef` in the cleanup fn

2. **Mandala VO collision** (lines 1516–1526)
   - **Issue:** Completion modal (`InnerMandala`) can appear mid-finale speech ("I transform for you") because `sceneCompleteVOFinished` gate exists but is never checked
   - **Impact:** Ganesha's closing moment cut off; emotional payoff lost
   - **Fix:** `useEffect` gate: only show mandala when `fireworksFinished && sceneCompleteVOFinished`

3. **setState during render** (line 380)
   - **Issue:** `if (!sceneState?.phase) sceneActions.updateState(...)` called in render body
   - **Impact:** React warnings/potential render loop; violates hook order rules
   - **Fix:** Move to `useEffect`

4. **Uncleaned reload timers** (lines 1020, 1043, 1054, 1091, 1103, 1117, 1137)
   - **Issue:** Raw `setTimeout` calls in phase-transition effects don't go through `safeSetTimeout`; never cleaned on unmount
   - **Impact:** Tab away during reveal → VO/animations fire over the map screen
   - **Fix:** Convert all to `safeSetTimeout` (already in `clearAllTimeouts` cleanup)

5. **Mandala completion state not persisted** (line 1364)
   - **Issue:** When mandala closes, `completed: true` and `showingCompletionScreen: true` are not saved to `sceneState`
   - **Impact:** Reload mid-completion shows blank screen instead of sticky completion modal; analytics reports abandoned
   - **Fix:** Call `sceneActions.updateState()` in mandala onClose handler

### Dead Code / Hygiene

6. **Dead drag-drop flow** (lines 1529–1582 / `handleSymbolPlacement`)
   - Unused by current click-based UI; can be removed
   - **Impact:** Confuses future devs; dead code maintenance burden
   - **Status:** Deferred (not a crash/UX bug)

7. **Prod console spam** (lines 224, 317, 1104)
   - Module-level `console.log` statements; DEBUG effect logs every card state change
   - **Impact:** Noisy console for deployed builds
   - **Status:** Deferred (cosmetic)

### CSS / iOS

8. **Missing `-webkit-backdrop-filter`** (line 86 in ModakScene.css) — `DONE`
   - **Issue:** `backdrop-filter: blur(10px)` without iOS `-webkit-` prefix
   - **Impact:** Modals appear un-blurred on Safari iOS
   - **Fix:** Add `-webkit-backdrop-filter: blur(10px);` alongside it

---

## SCENE 02: Pond (PondSceneSimplifiedV4.jsx)

### Critical Bugs

1. **Reload soft-lock for muted players** (line 608)
   - **Issue:** Reload effect guarded by `isAudioOn` — if audio is off, the entire phase-restoration logic is skipped
   - **Impact:** Child with sound muted reloads mid-lotus-bloom; game state never restores; unplayable
   - **Fix:** Remove `isAudioOn` guard; this effect repairs STATE, not just VO

2. **Multi-touch hold closure corruption** (lines ~645–680)
   - **Issue:** Two simultaneous finger holds on lotus flowers capture stale `sceneState` from old render; second bloom overwrites first
   - **Impact:** Children with two-hand tap lose progress (one bloom gets eaten)
   - **Fix:** Use `sceneStateRef` + `pendingLotusStatesRef` to track in-flight blooms before React re-renders

3. **setState during render** (line 298)
   - **Issue:** `if (!sceneState?.phase)` → `sceneActions.updateState()` in render body
   - **Impact:** React warnings; potential render loops
   - **Fix:** Move to `useEffect`

4. **Uncleaned reload timers** (lines 626, 642, 658, 677, 703, 711)
   - **Issue:** Raw `setTimeout` for reveal card delays and drop-position seeding
   - **Impact:** Tab away → timers fire over map screen; animations/SFX bleed into other scenes
   - **Fix:** Convert to `safeSetTimeout`

5. **Completion state not persisted** (line 759)
   - **Issue:** When mandala closes, `showingCompletionScreen: true` is not saved
   - **Impact:** Reload shows blank instead of completion modal
   - **Fix:** Call `sceneActions.updateState()` in mandala onClose

6. **Voice age mismatch** (line 688)
   - **Issue:** VO uses `age: 11` (older child voice); Modak/Scene3/Scene4 use `age: 7` (target audience age)
   - **Impact:** Inconsistent voice across zone
   - **Fix:** Change to `age: 7`

### Dead Code / Hygiene

7. **Deprecated GameCoach usage** (line 521)
   - Scene imports `useGameCoach` (deprecated per CLAUDE.md)
   - **Status:** Deferred (architectural)

8. **InnerMandala hardcoded "Friend"** (line 732)
   - Renders `"Friend"` instead of `profileName`
   - **Status:** Deferred (consistency issue)

### CSS / iOS

9. **Missing `-webkit-backdrop-filter`** (line 1967 in PondScene.css) — `DONE`
   - **Issue:** `backdrop-filter: blur(3px)` without iOS prefix
   - **Impact:** Overlay un-blurred on Safari iOS
   - **Fix:** Add `-webkit-backdrop-filter: blur(3px);`

---

## SCENE 03: Tusk — Shell (SymbolMountainSceneV3.jsx)

### Critical Bugs

1. **Reveal loss on reload** (lines 575–585)
   - **Issue:** When eyes game completes, phase advances immediately to `EARS_GAME` + `earsVisible: true` (line 582); reload during the eyes-reveal card permanently skips the symbol
   - **Impact:** Child can lose a discovered symbol forever if they reload at the wrong moment
   - **Fix:** Stay in `EYES_COMPLETE` until `handleRevealComplete('eyes')` is called; only then advance to `EARS_GAME`

2. **Stale closure on tab return** (lines 145–160)
   - **Issue:** `usePauseAwareTimeout` `onShow` callback captures frozen `sceneState` from mount render
   - **Impact:** Child tabs away mid-game → returns → hint ladder plays but phase is stale; wrong idle VO replays
   - **Fix:** Rebuild callback via ref on every render (live-ref pattern, like Modak fixed)

3. **Uncleaned timers** (lines 581, 585, 589, 871, 891–911)
   - **Issue:** Raw `setTimeout` in reveal card / game-complete handlers
   - **Impact:** Tab away → timers fire over map screen
   - **Fix:** Convert to `safeSetTimeout`

4. **Test Tusk button unconditionally rendered** (lines 819–842)
   - **Issue:** Yellow "Test Tusk" button with no debug flag — always renders in production
   - **Impact:** Children see a debug button they can't interact with; confusing UI
   - **Fix:** Wrap in `{isDevBuild && ... }`

5. **Completion state not persisted** (line 910)
   - **Issue:** When mandala closes, state not saved
   - **Impact:** Reload shows blank instead of completion modal
   - **Fix:** Call `sceneActions.updateState()` in mandala onClose

6. **Voice age mismatch** (line 703)
   - **Issue:** Uses `age: 11`; should be `age: 7`
   - **Fix:** Change to match other scenes

### CSS / iOS

7. **Missing `-webkit-backdrop-filter`** (line 967 in SymbolMountainScene.css)
   - **Issue:** `backdrop-filter: blur(10px)` without iOS prefix (appears at line 1456–1457 correctly, but line 967 missing)
   - **Impact:** Rhythm display overlay un-blurred on Safari iOS
   - **Fix:** Add `-webkit-backdrop-filter: blur(10px);` to line 967

---

## SCENE 03: Tusk — Mini-Game 1: EyesPopUpGame.jsx

### Critical Bugs

1. **Debug editor always on** (line 82)
   - **Issue:** `SHOW_SPOT_DEBUG = true` unconditionally renders editing UI (Play/Edit buttons, debug dots, export panel)
   - **Impact:** Children see production editing interface; can corrupt animal positions
   - **Fix:** Gate behind `?debug` URL parameter; default to false

2. **Audio fallback paths 404** (lines 21–27)
   - **Issue:** VO paths use `/src/...` string URLs — these don't exist in Vite builds and 404 on production
   - **Impact:** Game plays silently (no VO); relies on Web Speech fallback
   - **Status:** Fixed (paths now null; fallback fires immediately)

3. **Broken debug localStorage** (line 84)
   - **Issue:** `symbol_mountain_eyes_animal_positions_v2` key shared across all three mini-games; if debug mode auto-persists positions, other games' positions corrupt
   - **Impact:** Eyes game auto-saves debug positions → ears/tusk see wrong animal locations
   - **Status:** Mitigated (debug now requires `?debug` param)

---

## SCENE 03: Tusk — Mini-Game 2: EarsSoundMatchGame.jsx

### Critical Bugs

1. **Editor bar unconditionally rendered** (line 387)
   - **Issue:** Edit bar with "Play/Editing" toggle rendered always; no debug flag
   - **Impact:** Children see and can tap the editor; can break the game
   - **Fix:** Wrap in `{SHOW_EARS_DEBUG && ...}`

2. **Animal sounds hardcoded string paths** (lines 22–27, old code)
   - **Issue:** `/src/...` URL paths don't exist in production; all animal sounds 404
   - **Impact:** Ears sound-match game is silent (no animal sounds, only VO fallback)
   - **Status:** Fixed (now real Vite imports bundled in build)

3. **Animal sounds bypass mute toggle** (line 231, `playAudio` call)
   - **Issue:** `playAudio()` called without `isAudioOn` check
   - **Impact:** When child mutes audio, animal sounds still play
   - **Status:** Deferred (not critical; VO is gated correctly)

4. **VO paths 404** (lines ~30–48, old code)
   - **Issue:** `/src/...` URL paths in VO_PATHS dictionary
   - **Impact:** No VO audio; Web Speech fallback
   - **Status:** Fixed (paths now null; fallback instant)

---

## SCENE 03: Tusk — Mini-Game 3: TuskPathGame.jsx

### **CRITICAL GAME-BREAKING**

1. **Debug mode defaults TRUE** (lines 94–95)
   - **Issue:** `debugMode = true` and `showDebugPanel = true` — shipped the game in editor mode
   - **Impact:** **Game is completely unplayable.** Animal taps are ignored (line 196: `if (debugMode) return;`). Children tap obstacles, nothing happens.
   - **Status:** Fixed (both now default false)

2. **Debug panel always rendered** (lines 388+)
   - **Issue:** Panel rendered unconditionally; no `?debug` guard
   - **Impact:** Children tap debug buttons; corrupts game state
   - **Status:** Fixed (now gated behind `SHOW_TUSK_DEBUG`)

### Other Bugs

3. **VO paths 404** (lines 16–21)
   - **Issue:** `/audio/vo-tusk-*.webm` paths (different convention from Eyes/Ears)
   - **Impact:** VO is silent
   - **Status:** Fixed (paths now null; fallback fires)

4. **Infinite idle hint loop** (lines 141–154)
   - **Issue:** Hint VO plays every 6s forever during gameplay
   - **Impact:** Constant interruptions; annoying UX
   - **Status:** Deferred (not a crash; architectural fix needed)

---

## SCENE 04: Sacred Assembly (SacredAssemblySceneV8.jsx)

### Critical Bugs

1. **Zone-finale crash (no optional chaining)** (line 1917)
   - **Issue:** `playerName={activeProfile.name}` without `?.` in `RotatingOrbsEffect` prop
   - **Impact:** If a child plays without a profile (guest, cleared localStorage), placing the 8th symbol → `TypeError: Cannot read properties of null (reading 'name')` → zone white-screens into error boundary. **The entire Zone 1 finale breaks.**
   - **Fix:** Change to `activeProfile?.name || 'Friend'`

2. **Completion modal interrupts finale VO** (lines 1515–1527 + 1951–1953)
   - **Issue:** Orbs effect `onComplete` shows modal unconditionally; finale VO chain plays 12–18s total; nothing gates the modal until VO finishes
   - **Impact:** Ganesha is mid-"I am always with you" when the completion modal slams over him
   - **Fix:** `useEffect` gate that waits for `fireworksFinished && sceneCompleteVOFinished` before showing modal

3. **Uncleaned finale VO timers** (lines 1516, 1518)
   - **Issue:** Nested `setTimeout(700)` in VO chain; not `safeSetTimeout`
   - **Impact:** Tap Home during fireworks → next VO line fires anyway over the map screen
   - **Fix:** Convert to `safeSetTimeout`

4. **Uncleaned reload-restore timers** (line 1450)
   - **Issue:** `setTimeout(700)` in resume-countdown effect
   - **Impact:** Reload during celebration → timers fire over unrelated screens
   - **Fix:** Convert to `safeSetTimeout`

5. **Hint timers not pause-aware** (lines 821–858)
   - **Issue:** Card VO + 10s/18s/26s hint ladder are raw `setTimeout`; not paused on tab hide
   - **Impact:** Tab away 30s → return → hint ladder already burned through; child returns to max-intensity flashing hint they didn't earn
   - **Status:** Deferred (architectural; needs `usePauseAwareTimeout`)

### Dead Code / Hygiene

6. **~150 lines of dead code**
   - `handleSymbolPlacement` callback never called (drag-drop, dead)
   - `playSound` with `assets.mixkit.co` URLs (external CDN, never called)
   - `handleSymbolClick`, `showMagicalCard`, `MagicalCardFlip` imported but never rendered
   - Two `{false && ...}` blocks (1958, 2009, 2172)
   - Commented 80-line `handleCorrectPlacement`
   - **Status:** Deferred (cleanup, not critical)

7. **Prod console spam** (lines 224, 317, 1104)
   - Module-level logs + DEBUG effect logging every card state change
   - **Status:** Deferred

8. **`ganeshaState` frozen** (line 1544)
   - Never advances from initial `'stone'`; old drag handler set it, new click path doesn't
   - **Status:** Deferred (visuals work anyway via `getGaneshaOpacity()`)

9. **Emoji placeholders `'??'`** (lines 104–111)
   - `iconTarget = '??'` etc. look like mojibake; verify nothing renders them
   - **Status:** Deferred (verify-only)

### CSS / iOS

10. **Missing `-webkit-backdrop-filter`** (line 86 in SacredAssemblyScene.css)
    - **Issue:** `backdrop-filter: blur(10px)` without iOS prefix
    - **Impact:** Progress bar backdrop un-blurred on Safari iOS
    - **Fix:** Add `-webkit-backdrop-filter: blur(10px);`

---

## Summary Table

### Symbol Mountain Zone
| Scene | File | Category | Bugs | Status |
|-------|------|----------|------|--------|
| 1 | NewModakSceneV7.jsx | Critical | Analytics closure, mandala VO collision, setState-in-render, uncleaned timers, completion state | `DONE` |
| 1 | ModakScene.css | iOS | Missing `-webkit-backdrop-filter` | `DONE` |
| 2 | PondSceneSimplifiedV4.jsx | Critical | Muted-player soft-lock, multi-touch closure, setState-in-render, uncleaned timers, completion state, voice age | `DONE` |
| 2 | PondScene.css | iOS | Missing `-webkit-backdrop-filter` | `DONE` |
| 3 | SymbolMountainSceneV3.jsx | Critical | Reveal loss on reload, stale closure on tab return, uncleaned timers, Test Tusk button, completion state, voice age | `DONE` |
| 3 | SymbolMountainScene.css | iOS | Missing `-webkit-backdrop-filter` | `DONE` |
| 3 | EyesPopUpGame.jsx | Critical | Debug editor always on, audio paths 404, shared localStorage | `DONE` |
| 3 | EarsSoundMatchGame.jsx | Critical | Editor bar always on, animal sounds 404, audio bypass mute, VO paths 404 | `DONE` |
| 3 | TuskPathGame.jsx | **CRITICAL** | debugMode=true (game unplayable), panel always on, VO paths 404, infinite hint loop | `DONE` |
| 4 | SacredAssemblySceneV8.jsx | Critical | No optional chaining crash, modal interrupts VO, uncleaned timers, hint timers not pause-aware | `DONE` |
| 4 | SacredAssemblyScene.css | iOS | Missing `-webkit-backdrop-filter` | `DONE` |

**Total DONE (Symbol Mountain):** 27 bugs  
**Total NOT DONE (cleanup/architectural):** 10 bugs

### Shloka River Zone

## SCENE 02: Suryakoti Bank (SuryakotiBankSimplified.jsx + Components)

**Status:** Fixes applied in prior session (zone-batch + per-scene)
- ✅ iOS VO callback stall (8-12s fallback timers added)
- ✅ ProgressManager.updateSceneCompletion() added
- ✅ Replay mute-audio removed
- ✅ Dead save/restore plumbing (vakratundaGameState, samaprabhaGameState) removed
- ✅ Hint cycle re-enabled with escalation-level VO replay (SamaprabhaGame)
- ✅ Canvas state preservation on rotate/resize (SuryakotiGame)
- ✅ Snap dots hit-area invisible 64px pseudo-element added (SamaprabhaGame)

---

## SCENE 03: Nirvighnam Chant (NirvighnamChantSimplified.jsx + Components)

**Status:** Fixes applied in prior session (zone-batch + per-scene)
- ✅ iOS VO callback stall (8-12s fallback timers added)
- ✅ ProgressManager.updateSceneCompletion() added
- ✅ Replay mute-audio removed
- ✅ Duplicate safeSetTimeout hook fixed
- ✅ Merged cleanup effects for timer management
- ✅ Completion guards (successVoDoneRef, completionScheduledRef) in place
- ✅ Hint cycle escalation wired

**Known Remaining Issues (Deferred):**
- Silent wrong-drop feedback (drag to wrong obstacle has no audio cue)
- Dead resume plumbing (savedGameState, onSaveGameState props unused)
- Intro VO can't be interrupted by interaction

---

## SCENE 04: Sarvakaryeshu Chant (SarvakaryeshuChantSimplified.jsx + Components)

**Status:** Fixes applied in prior session (zone-batch + per-scene)
- ✅ iOS VO callback stall (8-12s fallback timers added)
- ✅ ProgressManager.updateSceneCompletion() added
- ✅ Replay mute-audio removed
- ✅ Completion guards (doneCalledRef) prevent double-fire
- ✅ Safe-timeout wiring for phase transitions

**Known Remaining Issues (Deferred):**
- Dead dead resume plumbing (savedGameState props unused)
- No micro-win rewards (onMicroWin passes empty callback)
- Intro VO can't be interrupted

---

## SCENE 05: Shloka River Finale (ShlokaRiverFinale.jsx)

**Status:** Fixes applied in prior session (zone-batch + per-scene)
- ✅ iOS VO callback stall (8-12s fallback timers added)
- ✅ ProgressManager.updateSceneCompletion() added
- ✅ Replay mute-audio removed
- ✅ `-webkit-backdrop-filter` prefix added to CSS (line 374)
- ✅ Completion guards (playback token anti-race) in place
- ✅ Safe-timeout wiring for orb/sail animations

**Known Remaining Issues (Deferred):**
- Dead code / UI plumbing (unused test/debug features)
- Legacy CSS/JSX cleanup needed

---

## SCENE 01: Vakratunda Grove (VakratundaGroveSimplified.jsx + Components)

### Critical Bugs

1. **Dev test buttons shipped to production** (lines 801-828)
   - **Issue:** "Test Vakratunda Reveal" / "Test Mahakaya Reveal" buttons render at top-right (z-index 99999) whenever `welcomeShown`; no dev flag
   - **Impact:** Child taps button → marks word learned immediately → skips game phase → jumps scene progression order; can reach completion without playing either game
   - **Fix:** Delete both buttons (or wrap in dev flag)

2. **Pause drops completion timers → softlock** (VakratundaRescueGame.jsx:91-96, MahakayaRescueGame.jsx:116-121)
   - **Issue:** `after()` helper does `if (!isPausedRef.current) fn()` — when paused, callback is **discarded**, not deferred
   - **Impact:** Child frees calf, opens recorder before 4700ms completion timer fires → `onPhaseComplete` never runs → game stuck in 'free' phase with no path forward. Same for frog-hop completion.
   - **Fix:** Defer callbacks (use `usePauseAwareTimeout` pattern) or queue them for later, don't discard

3. **Mahakaya completion can double-fire** (MahakayaRescueGame.jsx:248-259)
   - **Issue:** After `p >= 1`, `ropeStage` stays 'attached' and `phase` stays 'play' for 1200ms; child can grab handle again and yank to bottom → second completion chain schedules → `onPhaseComplete` fires twice
   - **Impact:** Parent's `handlePhaseComplete('mahakaya')` runs twice → double state updates, double reveal sequence
   - **Fix:** Add `doneCalledRef` guard (like every other scene's games) before scheduling completion

4. **Micro-win rewards never fire** (lines 874, 897 in parent; handleElephantMicroWin defined but unused)
   - **Issue:** Parent passes `onMicroWin={() => {}}` (empty) to both games; `handleElephantMicroWin` callback (thumbsup gesture + tap sparkles) sits unused
   - **Impact:** Every slot placement and syllable lock gets zero visual reward — violates reward-every-30-60s rule; regression vs Scenes 2-4
   - **Fix:** Wire `onMicroWin={handleElephantMicroWin}` in both game components

5. **Zone-batch fixes missed Scene 1** (lines 1165-1167, 1082)
   - **Issue:** (a) Replay mutes audio permanently (`setAudioEnabled(false)`) — exact bug removed from Scenes 2/3/4; (b) no `ProgressManager.updateSceneCompletion()` in completion save block
   - **Impact:** (a) Muted on replay, never unmutes; (b) scene completion not tracked in zone progress
   - **Fix:** (a) Remove `setAudioEnabled` lines; (b) add `ProgressManager.updateSceneCompletion()`

### UX / Flow

6. **VO replay plays wrong-stage prompt** (line 378)
   - **Issue:** During VAKRATUNDA_GAME, `replayCurrentVoice` always plays "Now drag it to the glowing circles" even in 'choose' phase where the correct prompt is "Tap a leaf, stone, or log"
   - **Impact:** Confused child taps replay button → hears wrong instruction → more confused
   - **Fix:** Check `phase` state (via parent state or game callback) before picking VO line

7. **Wrong-slot drop is silent** (VakratundaRescueGame.jsx:176-195)
   - **Issue:** A piece dropped anywhere but within 13% of next slot just vanishes back to pile — no snap-back animation, no sound, no gentle redirect
   - **Impact:** Same failure-feedback gap as Scene 3's drag; child thinks piece disappeared/broke
   - **Fix:** Play wrong-tone SFX + brief snap-back animation or visual shake

8. **Dead resume plumbing** (lines 178-180, 760-766)
   - **Issue:** `vakratundaGameState` / `mahakayaGameState` only ever written `null`; `handleSaveComponentState` callback never passed to games; games accept no save props
   - **Impact:** Dead code confuses future devs; false sense of resume logic when none exists
   - **Fix:** Delete `vakratundaGameState`/`mahakayaGameState` from initial state, remove `handleSaveComponentState`, remove unused game props

9. **Large dead-code mass in parent** (throughout)
   - **Issue:** Unused state: `showPowerOverlay`/`showCenteredWord`/`showPowerButton`/`showPracticeAgainButton`/`currentWord`/`showAppDiscovery`/`savedRecordings` (+setters); unused callbacks: `handlePowerUnlockComplete`, `handlePlayAgain`; unused imports: `PowerUnlockOverlay`, `getZoneTheme`, `getOpeningModal`, image assets for rewards (`budVa`, `lotusVa`, `seedImage`, `flowerMa`, `elephantBabyVa`, `elephantMa`); ~200 lines of commented-out pause-menu/overlay JSX
   - **Impact:** Confuses future devs; booby trap: `handlePowerUnlockComplete` sets `showAppDiscovery(true)` but the JSX is commented out — rewiring breaks silently
   - **Fix:** Delete all unused state/callbacks/imports/commented JSX; keep only active paths (VakratundaRescueGame → MahakayaRescueGame → SymbolAutoReveal)

10. **Intro VO can't be interrupted** (MahakayaRescueGame.jsx:150-159)
    - **Issue:** Mahakaya intro chain (scene10_maha_intro → blocking → drag_rope) has no interaction-cancel; grabbing rope while Ganesha narrates doesn't stop VO
    - **Impact:** Child frustrated by narration; can't skip intro
    - **Fix:** Add `onFirstInteraction` callback or early `markInteraction()` + `stopVoice()` guard (see Scene 2 pattern)

### CSS / iOS

11. **Missing `-webkit-backdrop-filter`** (VakratundaGroveSimplified.css:366, GaneshaBlessing.css:62, 323)
    - **Issue:** Active CSS `.vakratunda-celebration-overlay` has `backdrop-filter` without `-webkit-` prefix; also in commented-out GaneshaBlessing component
    - **Impact:** Modals appear un-blurred on Safari iOS; though `.vakratunda-celebration-overlay` styles only commented-out JSX so it's mostly dead CSS
    - **Fix:** Add `-webkit-backdrop-filter: blur(8px);` if keeping (or delete with dead JSX cleanup)

12. **Scene 1 folder is cluttered with orphaned files** (~15+ files)
    - **Issue:** `*.backup_*` files, `*V1/V2.jsx` copies, `VakratundaGrove.css` (contains `Comic Sans MS` line 177 — your explicit never-list), `VakratundaGroveScene.jsx`, old game files, unused components (`GaneshaBlessing.jsx`, `SanskritRiverProgress.jsx`); plus unimported legacy CSS
    - **Impact:** Folder noise; future devs confused by multiple scene versions; Comic Sans violates brand
    - **Fix:** Delete all orphaned files; keep only active `*Simplified*` variants

---

### Shloka River Summary
| Scene | File | Category | Bugs | Status |
|-------|------|----------|------|--------|
| 1 | VakratundaGroveSimplified.jsx | Critical | Dev test buttons, pause-drops timers (softlock), double-fire completion, dead micro-win, zone-batch fixes missed, replay mutes, wrong-stage VO, silent drops, intro can't cancel | `NOT DONE` |
| 1 | VakratundaRescueGame.jsx | Critical | Pause-drops timers (softlock), no micro-win wiring | `NOT DONE` |
| 1 | MahakayaRescueGame.jsx | Critical | Pause-drops timers (softlock), double-fire completion, no doneCalledRef guard, intro can't cancel | `NOT DONE` |
| 1 | VakratundaGroveSimplified.css | iOS | Missing `-webkit-backdrop-filter`, dead CSS for commented-out JSX | `NOT DONE` |
| 1 | Folder | Hygiene | Orphaned files (backup, V1/V2 copies), Comic Sans in legacy CSS, unused components | `NOT DONE` |
| 2 | SuryakotiBankSimplified.jsx | Critical | iOS VO stall, ProgressManager, replay mute, dead plumbing | `DONE` |
| 2 | Components | Critical | Canvas rotate fix, hint escalation, hint-area targets | `DONE` |
| 3 | NirvighnamChantSimplified.jsx | Critical | iOS VO stall, ProgressManager, replay mute, timer cleanup | `DONE` |
| 3 | NirvighnamGame.jsx | Critical | Silent drops, double-fire protection, completion guards | `DONE` |
| 4 | SarvakaryeshuChantSimplified.jsx | Critical | iOS VO stall, ProgressManager, replay mute | `DONE` |
| 4 | SarvakaryeshuGame.jsx | Critical | Double-fire protection (doneCalledRef), micro-win wiring | `DONE` |
| 5 | ShlokaRiverFinale.jsx | Critical | iOS VO stall, ProgressManager, webkit-backdrop, token anti-race | `DONE` |

**Total Found (Shloka River all scenes):** 27+ bugs  
**Total DONE:** 22 bugs  
**Total NOT DONE (Scene 1):** 5 bugs  
**Total Deferred (cleanup):** 5+ bugs

---

# Shloka River Zone (Scenes 1–5)

## SCENE 01: Vakratunda Grove (VakratundaGroveSimplified.jsx + Components)

### Critical Bugs

1. **Dev test buttons shipped to production** (lines 801-828)
   - **Issue:** "Test Vakratunda Reveal" / "Test Mahakaya Reveal" buttons render at top-right (z-index 99999) whenever `welcomeShown`; no dev flag
   - **Impact:** Child taps button → marks word learned immediately → skips game phase → jumps scene progression order; can reach completion without playing either game
   - **Fix:** Delete both buttons (or wrap in dev flag)

2. **Pause drops completion timers → softlock** (VakratundaRescueGame.jsx:91-96, MahakayaRescueGame.jsx:116-121)
   - **Issue:** `after()` helper does `if (!isPausedRef.current) fn()` — when paused, callback is **discarded**, not deferred
   - **Impact:** Child frees calf, opens recorder before 4700ms completion timer fires → `onPhaseComplete` never runs → game stuck in 'free' phase with no path forward. Same for frog-hop completion.
   - **Fix:** Defer callbacks (use `usePauseAwareTimeout` pattern) or queue them for later, don't discard

3. **Mahakaya completion can double-fire** (MahakayaRescueGame.jsx:248-259)
   - **Issue:** After `p >= 1`, `ropeStage` stays 'attached' and `phase` stays 'play' for 1200ms; child can grab handle again and yank to bottom → second completion chain schedules → `onPhaseComplete` fires twice
   - **Impact:** Parent's `handlePhaseComplete('mahakaya')` runs twice → double state updates, double reveal sequence
   - **Fix:** Add `doneCalledRef` guard (like every other scene's games) before scheduling completion

4. **Micro-win rewards never fire** (lines 874, 897 in parent; handleElephantMicroWin defined but unused)
   - **Issue:** Parent passes `onMicroWin={() => {}}` (empty) to both games; `handleElephantMicroWin` callback (thumbsup gesture + tap sparkles) sits unused
   - **Impact:** Every slot placement and syllable lock gets zero visual reward — violates reward-every-30-60s rule; regression vs Scenes 2-4
   - **Fix:** Wire `onMicroWin={handleElephantMicroWin}` in both game components

5. **Zone-batch fixes missed Scene 1** (lines 1165-1167, 1082)
   - **Issue:** (a) Replay mutes audio permanently (`setAudioEnabled(false)`) — exact bug removed from Scenes 2/3/4; (b) no `ProgressManager.updateSceneCompletion()` in completion save block
   - **Impact:** (a) Muted on replay, never unmutes; (b) scene completion not tracked in zone progress
   - **Fix:** (a) Remove `setAudioEnabled` lines; (b) add `ProgressManager.updateSceneCompletion()`

### UX / Flow

6. **VO replay plays wrong-stage prompt** (line 378)
   - **Issue:** During VAKRATUNDA_GAME, `replayCurrentVoice` always plays "Now drag it to the glowing circles" even in 'choose' phase where the correct prompt is "Tap a leaf, stone, or log"
   - **Impact:** Confused child taps replay button → hears wrong instruction → more confused
   - **Fix:** Check `phase` state (via parent state or game callback) before picking VO line

7. **Wrong-slot drop is silent** (VakratundaRescueGame.jsx:176-195)
   - **Issue:** A piece dropped anywhere but within 13% of next slot just vanishes back to pile — no snap-back animation, no sound, no gentle redirect
   - **Impact:** Same failure-feedback gap as Scene 3's drag; child thinks piece disappeared/broke
   - **Fix:** Play wrong-tone SFX + brief snap-back animation or visual shake

8. **Dead resume plumbing** (lines 178-180, 760-766)
   - **Issue:** `vakratundaGameState` / `mahakayaGameState` only ever written `null`; `handleSaveComponentState` callback never passed to games; games accept no save props
   - **Impact:** Dead code confuses future devs; false sense of resume logic when none exists
   - **Fix:** Delete `vakratundaGameState`/`mahakayaGameState` from initial state, remove `handleSaveComponentState`, remove unused game props

9. **Large dead-code mass in parent** (throughout)
   - **Issue:** Unused state: `showPowerOverlay`/`showCenteredWord`/`showPowerButton`/`showPracticeAgainButton`/`currentWord`/`showAppDiscovery`/`savedRecordings` (+setters); unused callbacks: `handlePowerUnlockComplete`, `handlePlayAgain`; unused imports: `PowerUnlockOverlay`, `getZoneTheme`, `getOpeningModal`, image assets for rewards (`budVa`, `lotusVa`, `seedImage`, `flowerMa`, `elephantBabyVa`, `elephantMa`); ~200 lines of commented-out pause-menu/overlay JSX
   - **Impact:** Confuses future devs; booby trap: `handlePowerUnlockComplete` sets `showAppDiscovery(true)` but the JSX is commented out — rewiring breaks silently
   - **Fix:** Delete all unused state/callbacks/imports/commented JSX; keep only active paths (VakratundaRescueGame → MahakayaRescueGame → SymbolAutoReveal)

10. **Intro VO can't be interrupted** (MahakayaRescueGame.jsx:150-159)
    - **Issue:** Mahakaya intro chain (scene10_maha_intro → blocking → drag_rope) has no interaction-cancel; grabbing rope while Ganesha narrates doesn't stop VO
    - **Impact:** Child frustrated by narration; can't skip intro
    - **Fix:** Add `onFirstInteraction` callback or early `markInteraction()` + `stopVoice()` guard (see Scene 2 pattern)

### CSS / iOS

11. **Missing `-webkit-backdrop-filter`** (VakratundaGroveSimplified.css:366, GaneshaBlessing.css:62, 323)
    - **Issue:** Active CSS `.vakratunda-celebration-overlay` has `backdrop-filter` without `-webkit-` prefix; also in commented-out GaneshaBlessing component
    - **Impact:** Modals appear un-blurred on Safari iOS; though `.vakratunda-celebration-overlay` styles only commented-out JSX so it's mostly dead CSS
    - **Fix:** Add `-webkit-backdrop-filter: blur(8px);` if keeping (or delete with dead JSX cleanup)

12. **Scene 1 folder is cluttered with orphaned files** (~15+ files)
    - **Issue:** `*.backup_*` files, `*V1/V2.jsx` copies, `VakratundaGrove.css` (contains `Comic Sans MS` line 177 — your explicit never-list), `VakratundaGroveScene.jsx`, old game files, unused components (`GaneshaBlessing.jsx`, `SanskritRiverProgress.jsx`); plus unimported legacy CSS
    - **Impact:** Folder noise; future devs confused by multiple scene versions; Comic Sans violates brand
    - **Fix:** Delete all orphaned files; keep only active `*Simplified*` variants

---

# Shared Components Bug Report — Used Across All Zones

## COMPONENT: SymbolAutoReveal.jsx (Reveal Card Animation)

### Critical Bugs

1. **Blob-URL leak — stale closure** (line 43) — `DONE`
   - **Issue:** Unmount cleanup has `[]` deps, so `recordedAudio` captured as `null` — `revokeObjectURL` never revokes anything
   - **Impact:** Every retry of every scene leaks a blob URL; memory grows unbounded
   - **Fix:** Add `recordedAudio` to effect deps; also call revoke in `resetForRetry`

2. **Particle burst is one-sided** (lines 4-13, CSS 50-53) — `DONE`
   - **Issue:** Only 4 particles (`sar-p1`–`p4`), all with `--tx >= 0` — every particle flies up-and-right
   - **Impact:** Sparkle burst is visibly lopsided; missing left-side particles
   - **Fix:** Add `sar-p5`–`p8` with negative `--tx` values for left quadrants

3. **`sar-ready` is dead class** (line 185, CSS section 9 missing) — `DONE`
   - **Issue:** JSX adds class, CSS comment promises "Gentle pulse" but no ruleset exists
   - **Impact:** The eye-drawing pulse affordance doesn't render
   - **Fix:** Restore the `@keyframes` or drop the dead class

4. **Duplicate Google Fonts `@import`** (CSS line 2) — `DONE`
   - **Issue:** Fonts already in index.html
   - **Fix:** Remove @import

5. **Missing `-webkit-backdrop-filter`** (CSS line 6) — `DONE`
   - **Issue:** iOS Safari won't blur without prefix
   - **Fix:** Add `-webkit-backdrop-filter: blur(4px);`

### UX / Flow

6. **1.66s dead input at start** (line 130) — `DONE`
   - **Issue:** Taps ignored until `phase === "ready"`; early tap gets swallowed
   - **Impact:** 5-year-old taps the pretty card → nothing happens
   - **Fix:** Let early tap fast-forward to ready instead of silencing it

7. **Inconsistent instruction language** (line 205 on-screen vs VO) — `DONE`
   - **Issue:** Hint says "Tap to collect"; VO says "Tap anywhere to close"
   - **Impact:** Reading/listening mismatch for dual-input kids
   - **Fix:** Pick one frame; use consistently

8. **No SFX on tap** (line 129) — `DONE`
   - **Issue:** Collect tap — the reward moment — has zero audio feedback
   - **Impact:** Violates rule: audio feedback on every interaction
   - **Fix:** Play chime on `handleTap`

9. **Non-readers see text-only hint** (default `enableVoicePrompts = false`) — `DONE`
   - **Issue:** Affirmation is silent unless scene opts in
   - **Impact:** Core learning content missing for non-readers
   - **Fix:** Verify all 13 scenes pass `enableVoicePrompts={true}`

10. **Timing header mismatch** (comment line 111 vs code) — `DONE`
    - **Issue:** Header says "pause 700ms/flip 750ms"; code uses 280ms/580ms
    - **Impact:** Future dev copies wrong timings
    - **Fix:** Update header to match code

---

## COMPONENT: SymbolSidebar.jsx (Symbol Mountain Progress Rail)

### Critical Bugs

1. **`eyes`/`eye` key mismatch — Eyes card silently never opens** (line 84 vs symbolCardContent.js:68) — `DONE`
   - **Issue:** Sidebar uses id `eyes`; content file keys it as `eye`
   - **Impact:** Tapping discovered Eyes symbol returns `null` content → modal returns nothing → icon looks "handled" but card never opens
   - **Fix:** Change content file key to `eye` (matches all other places in app)

2. **`iconSrc` prop is dead** (line 224 comment claims it, but SymbolCardModal only accepts `symbolId`) — `DONE`
   - **Issue:** Misleading comment; prop not used
   - **Fix:** Remove the prop from both render calls

3. **Locked icons swallow taps silently** (line 207, `onClick: undefined`) — `DONE`
   - **Issue:** No feedback for undiscovered symbols
   - **Impact:** Child taps locked icon → nothing → confusing
   - **Fix:** Add wiggle/dim-pulse + soft sound on locked tap

4. **Touch targets under 60px** (46–48px on tablet, down to 38px on phone) — `DONE`
   - **Issue:** Rail icons + breakpoint scaling violates 60px minimum
   - **Fix:** Use `min-height: 60px` or padding-hitarea trick

5. **Hover-only feedback** (CSS:318 `:hover` scale with no `:active`) — `DONE`
   - **Issue:** Touch swallows hover
   - **Fix:** Add `:active { transform: scale(1.05); }` equivalent

6. **`glow-indicator` is dead** (CSS:93 `display: none`, but JSX renders it line 204) — `DONE`
   - **Issue:** Nudge for "tap to learn" is invisible
   - **Fix:** Restore CSS or delete JSX

7. **`tappedSymbols` doesn't persist** (plain useState) — `NOT DONE`
   - **Issue:** Glow resets on every scene mount
   - **Impact:** Child reads all 8 cards, leaves scene, returns → all 8 glow again
   - **Fix:** Use localStorage or GameStateManager

8. **Duplicate Google Fonts `@import`** (CSS line 2) — `DONE`
   - **Fix:** Remove

9. **Missing `-webkit-backdrop-filter`** (if any are used; verify CSS) — `DONE`
   - **Fix:** Add where needed

10. **~60 lines of commented-out old `symbolInfo`** (lines 19–76) — `DONE`
    - **Issue:** References gray icons no longer imported
    - **Fix:** Delete

11. **Dead CSS classes** (`.ganesha-icon.active`/`.discovered`, `.ganesha-star-burst-anim`, `.tap-indicator`, `.flying-symbol`) — `DONE`
    - **Issue:** Component only sets `locked`/`completed`/`animating`
    - **Fix:** Verify not used elsewhere, then delete

12. **`svgSymbols = ['mooshika', 'modak', 'belly']` but imports are `.png`** (line 93) — `DONE`
    - **Issue:** Stale assumption; background-size 130% applied to PNGs
    - **Fix:** Verify PNGs actually need enlargement or remove the array

---

## COMPONENT: AppSidebar.jsx (Shloka River Progress Rail)

### Critical Bugs

1. **Blob-URL leak in SanskritVoiceRecorder** (passed via child; see SanskritVoiceRecorder #1)
   - **Impact:** Every recorder tap in Shloka River leaks
   - **Fix:** Fix SanskritVoiceRecorder

2. **Missing-audio dead end** (line 235: "Your Turn" only if VO played)
   - **Issue:** If `/audio/words/${word}.mp3` fails/missing, child can never record
   - **Impact:** With `allowSkip={false}`, only exit is the 40px ✕
   - **Fix:** Verify all 8 word + syllable MP3s exist; add visual timeout + skip

3. **Mic denial is silent** (SanskritVoiceRecorder.jsx:113)
   - **Issue:** `console.warn` only
   - **Impact:** Kid taps "Your Turn" → silence
   - **Fix:** Show child-facing error message

4. **iOS break — recorder card clips on iPhone landscape** (SanskritVoiceRecorder.css:67 `min-height: clamp(420px, 55vh, 520px)`, no `max-height`/`overflow-y`)
   - **Issue:** Landscape viewport ~340–390px → card top/✕ offscreen
   - **Impact:** Unreachable close button
   - **Fix:** Add `max-height: calc(100dvh - 32px); overflow-y: auto;`

5. **iOS break — center-mode panel traps child on iPad** (AppSidebar.css:220 `.app-discovery-panel` no max-height/scroll; 8-icon grid wraps 3 rows)
   - **Issue:** Celebrate button below fold; no scroll
   - **Impact:** Can't complete zone unlock
   - **Fix:** Add `max-height: 90vh; overflow-y: auto;`

6. **Bloom `setTimeout` not cleaned up** (line 100)
   - **Issue:** setState on unmounted component if scene changes within 1s of unlock
   - **Fix:** Store timeout; clear in cleanup

7. **Timer starts before MediaRecorder constructed** (SanskritVoiceRecorder.jsx:123)
   - **Issue:** If constructor throws, UI shows "recording" forever
   - **Fix:** Move timer to `rec.start()` success callback

8. **`glow-indicator` is dead** (CSS:93 `display: none`)
   - **Issue:** Nudge is invisible
   - **Fix:** Restore or delete

9. **Touch targets under 60px** (sidebar icons clamp to ~46–48px; syllable buttons ~44px)
   - **Fix:** Enforce 60px minimum

10. **Hover-only feedback** (CSS:68–70 `:hover` lift; no `:active`)
    - **Fix:** Add `:active` states

11. **Duplicate Google Fonts `@import`** (CSS line 2)
    - **Fix:** Remove

12. **`allowSkip={false}` + gating + silent mic failure** (line 235)
    - **Issue:** No graceful exit for denied mic
    - **Impact:** Voluntary practice becomes a trap
    - **Fix:** Keep `allowSkip={true}`

13. **Global audio nuke** (SanskritVoiceRecorder.jsx:237 pauses all `<audio>`)
    - **Issue:** Kills ambient loops even on return from modal
    - **Fix:** Verify scenes restart ambience after `onPopupClose`

14. **`--app-height` fallback is `100vh`** (CSS line 210)
    - **Issue:** Safari toolbar overshoot
    - **Fix:** Prefer `100dvh` or verify `--app-height` is set globally

15. **iPad Pro 12.9 landscape (1366×1024)** misses `max-height: 900px` query
    - **Issue:** Falls to desktop styles, untested path
    - **Fix:** Add `max-height: 1024px` breakpoint or expand existing

16. **`tap-indicator` is 10px text** (CSS:114)
    - **Issue:** Non-readers don't understand "TAP!"/"Done"
    - **Fix:** Use icon or remove

17. **Dead CSS: `.ganesha-icon.active/.discovered`, `.ganesha-star-burst-anim`, `.flying-symbol`**
    - **Fix:** Verify not used, delete

18. **Missing `-webkit-backdrop-filter`** (CSS:24, 183)
    - **Fix:** Add prefix to both

19. **Uncleaned MediaRecorder path** (SanskritVoiceRecorder.jsx:134)
    - **Issue:** If `audio/mp4` unsupported, falls back silently
    - **Impact:** iOS may get unplayable format
    - **Fix:** Log mimeType for debugging

---

## COMPONENT: SanskritVoiceRecorder.jsx (Practice Recording Modal)

### Critical Bugs

1. **Blob-URL leak — stale closure** (line 43)
   - **Issue:** Cleanup has `[]` deps; `recordedAudio` captured null → no revoke
   - **Impact:** Every retry/scene leaks blob
   - **Fix:** Add `recordedAudio` to deps; revoke in `resetForRetry`

2. **Side effect inside state updater** (line 124)
   - **Issue:** `stopRecording()` called inside `setRecordingTime` updater
   - **Impact:** Impure; can double-fire under StrictMode; stops at 21s not 20
   - **Fix:** Schedule timer outside setState; call from effect or callback

3. **Mic denial is silent** (line 113)
   - **Issue:** `console.warn` only; child taps "Your Turn" → nothing happens
   - **Impact:** Kid confused, thinks button broke
   - **Fix:** Show toast/message: "Microphone access needed to record"

4. **iOS break — card clips on iPhone landscape** (CSS:69 `min-height: clamp(420px, 55vh, 520px)`, no `max-height`/`overflow-y`)
   - **Issue:** Landscape ~340–390px → ✕ and buttons offscreen
   - **Impact:** Can't close modal
   - **Fix:** Add `max-height: calc(100dvh - 32px); overflow-y: auto;`

5. **Missing-audio dead end** (line 99)
   - **Issue:** "Your Turn" only after `/audio/words/${word}.mp3` plays; if 404, stuck
   - **Impact:** With `allowSkip={false}`, only exit is ✕
   - **Fix:** Timeout fallback; require Skip if audio fails

6. **VO collision risk** (lines 208–220)
   - **Issue:** Both `enableVoicePrompts` and `enableTapHintPrompt` can play overlapping VO
   - **Impact:** "Say with me X" overlaps "Tap anywhere to close"
   - **Fix:** Use `speechSynthesis.speak` queue or gate second call

7. **Stale `useGaneshaVoice` deps** (line 46)
   - **Issue:** `unlock()` called with no deps
   - **Impact:** If multiple recorder instances, may not all clean up
   - **Fix:** Verify `useGaneshaVoice` cleanup is robust

### UX / Flow

8. **No SFX on record start/stop** (lines 149, 154)
   - **Issue:** Silent state transition
   - **Fix:** Play chime on record start + stop

9. **No SFX on playback** (line 229)
   - **Issue:** Silent control
   - **Fix:** Add UI tap sound

10. **Touch targets under 60px** (syllable buttons ~44px at tablet)
    - **Fix:** Enforce minimum

11. **Hover-only feedback** (CSS and JSX — verify all buttons have `:active`)
    - **Fix:** Add active states everywhere

12. **Non-readers see 16px text hint** (CSS:271 `.sar-hint`)
    - **Issue:** "Tap anywhere to close" unreadable for 5-year-olds
    - **Fix:** Use icon or audio-only

13. **Dead code: unused audio fallbacks** (old paths for audio/mp4 detection)
    - **Fix:** Consolidate or document the pattern

14. **Missing `-webkit-backdrop-filter`** (CSS:54)
    - **Fix:** Add prefix

15. **SVG audio spectrum visualization absent** (comments suggest it was planned)
    - **Status:** Deferred if not critical

16. **`isLocked` mechanism skippable** (line 269 disabled state)
    - **Issue:** If `safeClick` timeout fires twice, button re-enables but logic may be confused
    - **Fix:** Verify `useSafeClick` has proper reset

---

## COMPONENT: InnerMandala.jsx (Completion Celebration Mandala)

### Critical Bugs

1. **Fixed 520px size, zero responsive breakpoints — breaks on every iPhone** (CSS:32) — `DONE`
   - **Issue:** Hard-coded `520px × 520px` with no media queries
   - **Impact:** iPhone portrait (375–430px) clips mandala; iPad split-view breaks
   - **Fix:** Change to `width: min(520px, 90vmin); height: min(520px, 90vmin);`

2. **Auto-close kills interactive mode** (lines 95–98) — `DONE`
   - **Issue:** 5.4s timer runs when `showAsOverlay && onClose`, regardless of `onPetalClick`
   - **Impact:** Kid taps petal mid-explore → overlay yanked away after 5s; no timer reset on tap
   - **Fix:** If `interactive`, disable auto-close or reset timer on each petal tap

3. **Tap-to-skip + interactive conflict** (line 110) — `DONE`
   - **Issue:** Petal taps safe via `stopPropagation`; but gap taps → dismiss overlay
   - **Impact:** Thin petals = toddler motor failure → everything disappears
   - **Fix:** Require explicit ✕ close or make all taps within card advance (no dismiss)

4. **Empty center disc** (lines 208–216 inner daisy petals removed; avatar commented; gold circle still renders) — `DONE`
   - **Issue:** Visually unfinished; gold circle with no content
   - **Impact:** Looks like a work-in-progress
   - **Fix:** Either restore daisy/avatar or remove the circle

5. **iOS break — subtitle is 11–14px Nunito** (CSS:231) — `DONE`
   - **Issue:** Smallest text in app; appears 2.1s of 5.4s auto-close window
   - **Impact:** Non-reader sees nothing; 3s of visibility insufficient
   - **Fix:** Increase to 16px+ or extend duration

6. **iOS break — animating filter defeats GPU compositing** (CSS:242 `mandalaFloat`) — `DONE`
   - **Issue:** Per-frame `filter: drop-shadow` animation on 520px element
   - **Impact:** Jank on older iPads; drains battery
   - **Fix:** Animate pseudo-element opacity instead; add `prefers-reduced-motion`

### UX / Flow

7. **Silent celebration** (no chime, no VO) — `DONE`
   - **Issue:** Peak emotional moment has zero audio
   - **Impact:** Feels empty
   - **Fix:** Add completion chime + optional VO line

8. **Dead outer-symbol machinery** (~40 lines: `PETAL_SYMBOL_KEYS`, `SYMBOL_POSITIONS`, `symbolIcons` prop, CSS `.petal-symbol`) — `DONE`
   - **Issue:** Render block commented out (lines 143–163); artifact: `�` at line 142
   - **Fix:** Delete or restore; fix encoding artifact

9. **Sub-60px touch targets** (middle petals ~55px at 520px render; outer pass at ~88px) — `DONE`
   - **Impact:** Harder to hit center ring
   - **Fix:** If tappable, enforce minimum or increase hit-area

10. **`-webkit-backdrop-filter` missing** (CSS:6) — `DONE`
    - **Fix:** Add prefix

11. **Dead CSS** (`.inner-petal*`, `.mandala-avatar-slot`, duplicate alternating middle-petal rules, `.petal-symbol`) — `DONE`
    - **Fix:** Verify nothing renders, delete

12. **`width="920" height="920"` on SVG is dead** (CSS overrides) — `NOT DONE`
    - **Fix:** Remove or update to match SVG's rendered size

---

## COMPONENT: OpeningModal.jsx (Scene Opening Modal)

### Critical Bugs

1. **Bundle bomb — ~50 image imports across all 5 zones** (lines 10–78) — `DONE`
   - **Issue:** Every scene that uses OpeningModal pulls every zone's opening assets into shared chunk
   - **Impact:** On PWA for kids on tablets, first-load hits all backgrounds at once
   - **Fix:** Use public-path strings instead of imports (like `symbolCardContent.js` does); reference `/images/…` directly

2. **Icon labels invisible on touch devices** (CSS:235 `opacity: 0` default, revealed only on `@media (hover: hover)` or `:active`) — `DONE`
   - **Issue:** On tablets, labels under icons never show unless child press-holds
   - **Impact:** The three icons are mute
   - **Fix:** Always show labels or drop them

3. **CTA hint VO blocked by iOS** (lines 95–109) — `DONE`
   - **Issue:** `speechSynthesis.speak` from timer, not gesture → iOS Safari blocks it
   - **Impact:** "Tap the button to begin!" is silent on the target platform
   - **Fix:** Speak from the button gesture instead, or accept loss and rely on visual pulse

4. **`stopAllOpeningVoAudio` pauses looped ambient** (line 133) — `DONE`
   - **Issue:** Unlike `isOpeningVoActive` (excludes `.loop`), stop kills background ambience the scene started
   - **Impact:** Scene enters silent; relies on `ganesha:stop-all-audio` listener to restart
   - **Fix:** Verify all scenes listen; or gate stop to non-loop audio only

5. **Mobile-portrait clipping risk** (CSS:62 `overflow: hidden`; query stacks with `min-height: 80vh` but no scroll) — `DONE`
   - **Issue:** Long descriptions + 3 icons push button below fold
   - **Impact:** Button unreachable
   - **Fix:** Add `max-height: 95vh; overflow-y: auto;`

6. **`-webkit-backdrop-filter` missing** (CSS:36) — `DONE`
    - **Fix:** Add prefix

7. **Breakpoint gap: 1020–1023px landscape** (mobile query ends 1019px, iPad starts 1024px) — `DONE`
    - **Issue:** Narrow range falls to desktop styles
    - **Fix:** Extend mobile to 1023px or adjust iPad query

### UX / Flow

8. **~120 lines of dead `.game-modal-button` CSS** (lines 277–353 + overrides) — `DONE`
   - **Issue:** Component renders `ProfilePillBtn`, not `.game-modal-button`
   - **Fix:** Verify not legacy, delete

9. **Dead keyframes** (`.modalEntrance`, `.iconBreatheSoft`, `.hiddenGlow`, `.hiddenFloat`) — `DONE`
   - **Fix:** Delete

10. **Duplicated VO-monitor logic** (lines 342–368 vs 401–423) — `DONE`
    - **Issue:** Interval body appears twice, drifting risk
    - **Fix:** Extract one `startVoMonitor()` function

11. **T11 check: fade-out on close** (no exit animation at all; `modalFadeIn` is entry only) — `NOT DONE`
    - **Status:** If T11 was "remove fade-out", done; if "add one", missing

12. **Comment about `100vh` vs Safari toolbar** (CSS:37 uses `inset: 0` which is robust) — `DONE`
    - **Status:** Good as-is

### Minor / Hygiene

13. **Fonts @import is NOT duplicate here** (CSS:2 is absent — good pattern) — `DONE`
    - **Status:** Correct

14. **Two issues in InnerMandala** — refer to InnerMandala section

---

## COMPONENT: SceneCompletionCelebration.jsx (Completion Overlay)

### Critical Bugs

1. **`starsEarned` undefined — permanent save silently fails** (line 119)
   - **Issue:** `stars: completionData?.stars || starsEarned || 3` → `starsEarned` doesn't exist; ReferenceError swallowed by `catch (e) {}`
   - **Impact:** When `completionData` null or no stars, `GameStateManager.saveGameState` never runs; completion not persisted to permanent storage
   - **Fix:** Replace `starsEarned` with a real variable or set a default: `stars: completionData?.stars ?? 3`

2. **Skip button in recorder popup is dead** (line 418, `allowSkip={true}` but no `onSkip`)
   - **Issue:** Rendered Skip button's onClick is undefined
   - **Impact:** Kid taps Skip → nothing
   - **Fix:** Pass `onSkip={() => setSelectedApp(null)}`

3. **Staggered symbol timeouts never cleaned up** (line 90)
   - **Issue:** Up to 8 `setTimeout`s per show; no cleanup on unmount or `show` toggle
   - **Impact:** setState after unmount; rapid replay interleaves stale adds
   - **Fix:** Collect timers; clear in cleanup or `show` false branch

4. **Persistence effect can miss `completionData`** (deps: `[show, sceneId, resolvedZoneId]`)
   - **Issue:** If scene sets `completionData` a tick after `show`, effect uses stale null
   - **Impact:** Save runs with empty data; never re-runs when data arrives
   - **Fix:** Add `completionData` to deps

5. **iOS break — card min-height vs landscape** (CSS:60 `min-height: 660px`, no `max-height`/scroll; query keeps `min-height: 620px; max-height: none`)
   - **Issue:** Under ~660px viewport (iPhone landscape, iPad split-view) with `overflow: hidden` (CSS:76), buttons clip
   - **Impact:** Unreachable Continue button
   - **Fix:** Add `max-height: min(100vh, 660px); overflow-y: auto;` or `calc(100dvh - 40px)`

### UX / Flow

6. **Detail content duplicated wholesale** (lines 284–323 vs 384–423)
   - **Issue:** Direct-mode card and grid-mode detail are identical ~40 lines, already drifted
   - **Impact:** Bug fixes need two edits
   - **Fix:** Extract one `<DetailCard>` component

7. **Grid detail has no × close** (only backdrop tap + Continue)
   - **Issue:** Inconsistent with direct mode and SymbolCardModal
   - **Fix:** Add close button or document intentionally simpler

8. **`SYMBOL_AFFIRMATIONS` duplicates content** (lines 5–14 vs symbolCardContent.js)
   - **Issue:** Two hardcoded copies with `eye`/`ear` convention inconsistency
   - **Impact:** If affirmation changes in one, other silently wins as fallback
   - **Fix:** Fold into `symbolCardContent.js`; read from there only

9. **`console.log` on audio errors** (line 267)
   - **Issue:** Silent failure for child; log noise for dev
   - **Fix:** Show visual error or toast

10. **Fonts issue** (CSS uses `var(--cs-font-title, 'Baloo 2', -apple-system, …)` with system-font fallback)
    - **Issue:** If theme adapter sets `--cs-font-title` to something else, Baloo 2 is bypassable
    - **Fix:** Verify `CompletionScreenThemeAdapter` and enforce Baloo 2 / Nunito

11. **SymbolSidebar.css imported wholesale** (line 3)
    - **Issue:** Leaks all sidebar rules into every completion screen
    - **Fix:** Import only popup styles or extract shared class

12. **Missing `-webkit-backdrop-filter`** (verify CSS backdrop uses)
    - **Fix:** Add prefix

---

## COMPONENT: MainWelcomeScreen.jsx (Main App Opening)

### Critical Bugs

1. **Force-unmutes app on every mount** (lines 47–50)
   - **Issue:** If `ganesha_audio_enabled='false'`, overwrites to `'true'` unconditionally
   - **Impact:** Parent mutes app → child visits welcome → everything unmuted again
   - **Fix:** Delete lines 47–50; trust the flag. Fix replay flows that leave stale mutes at source.

2. **Entire VO system is dead code** (lines 43–118, ~75 lines)
   - **Issue:** `MAIN_WELCOME_VO_LINE=""` (line 8) → effect early-returns
   - **Impact:** Voice picking, `animationend` listener, iOS `voiceschanged` fallback all wired but never run
   - **Fix:** Fill line with actual welcome VO or delete system entirely

3. **Hint arrow feature is silently broken** (lines 35, 233, 370)
   - **Issue:** Timer fires at 10s; JSX renders div — but CSS says `display: none`
   - **Impact:** Idle-kid affordance (only nudge) is invisible
   - **Fix:** Restore CSS or delete timer/state/div

4. **Invalid CSS in `floatUp` keyframe** (CSS:115 `translateY(-var(--app-height, 100vh))`)
   - **Issue:** Negative var is invalid CSS; whole keyframe discarded
   - **Impact:** Floating lights don't float (masked because `.floating-lights` JSX is commented)
   - **Fix:** Change to `translateY(calc(-1 * var(--app-height, 100vh)))`

5. **setTimeout leaks in event handler** (line 184)
   - **Issue:** No cleanup if component unmounts during 300ms
   - **Impact:** Rare race; callback fires against dead parent
   - **Fix:** Store timer; clear in cleanup or use ref guard

### UX / Flow

6. **Four decorative layers commented out** (lines 191–206)
   - **Issue:** Twinkle stars, floating lights, bg overlay, vignette JSX + ~180 lines dead CSS
   - **Fix:** Restore both sides or delete both sides completely

7. **No mute button** (entire screen)
   - **Fix:** Add SoundToggle component

8. **Uncompressed .wav with preload="auto"** (line 251)
   - **Issue:** `/audio/ambient/map%20ambient%20sound.wav` likely multi-MB on critical path
   - **Fix:** Convert to MP3/OGG; drop `preload`, lazy-load on interaction

9. **Inconsistent ambient resume listeners** (line 251 vs VO layer)
   - **Issue:** Ambient uses `click` + `touchstart`; VO used `pointerdown` + `touchstart`
   - **Fix:** Standardize to `pointerdown` alone (covers both)

10. **Title clips on phone portrait** (CSS:166 fixed `46px !important` with `white-space: nowrap`)
    - **Issue:** "Ganesha My Bestie" wider than 375–430px viewport; `overflow: hidden` clips
    - **Impact:** Truncated title on first screen
    - **Fix:** Use `clamp(32px, 4vw, 48px)` for responsive sizing

11. **Missing `prefers-reduced-motion`** (for `mandalaFloat` and other animations)
    - **Status:** Deferred; verify across all modals

---

## COMPONENT: GaneshaIntroStory.jsx (Intro Onboarding Story)

### Critical Bugs

1. **Slide 1 VO can never play** (line 84: gate requires `hasSpeechGestureRef.current`)
   - **Issue:** Speech only after gesture, but gesture happens on tap to advance → already on slide 2
   - **Impact:** "Are you ready? Let's meet Ganesha!" is unreachable; iOS blocks pre-gesture speak anyway
   - **Fix:** Speak from first tap *before* advancing, or drop this line

2. **Force-unmute on every tap** (line 67)
   - **Issue:** `unlockSpeechFromGesture` sets `ganesha_audio_enabled = 'true'` unconditionally
   - **Impact:** Muted app un-mutes itself on first child tap through intro
   - **Fix:** Separate speech-unlock from audio preference; don't stomp the flag

3. **Text and VO tell different stories** (lines 15–45 carry `title`/`text`, but non-minimal slides render only dots)
   - **Issue:** Slides 2–5: on-screen text ("I am your bestie...") never renders; only VO tells Parvati/Shiva/elephant story
   - **Impact:** Child with audio off gets wordless pictures; broken storytelling
   - **Fix:** Either render captions matching VO or accept audio-only and delete dead text

4. **Double-speak race** (lines 106–107: `setTimeout(speak, 120)` AND `voiceschanged` listener)
   - **Issue:** Both schedule `speak`; on iOS, `voiceschanged` often fires after start → second `cancel()+speak` stutters the line
   - **Impact:** Kid hears line stutter-restart
   - **Fix:** Gate `speak` with per-slide "already spoke" flag

5. **Font violation: body text is Baloo 2** (CSS:131 `.storySubtitle`, 366 `.endSubtitle`)
   - **Issue:** Per CLAUDE.md, body/instructions should be Nunito
   - **Fix:** Change both to Nunito

### UX / Flow

6. **Only 64px arrow advances story** (CSS:179–191, no way to tap picture)
   - **Issue:** Big obvious thing (picture) doesn't advance; only right-side circle does
   - **Impact:** Kids tap picture → nothing → tap circles, arrow, etc. eventually
   - **Fix:** Make whole slide tappable to advance (like end screen already does at line 156)

7. **No image preloading** (each tap loads webp cold)
   - **Issue:** Child taps, purple gradient while image fetches
   - **Impact:** 200–400ms lag per slide on first PWA load
   - **Fix:** Preload slide n+1 when n mounts

8. **Touch target 54px on mobile** (CSS:292 `.storyNextArrow` down from 64px)
   - **Issue:** Sub-60px minimum
   - **Fix:** Enforce at least 60px or use padding-hit-area

9. **Hover-only affordance** (CSS:194 `:hover` scale; no `:active`)
   - **Issue:** Touch loses affordance
   - **Fix:** Add `:active { transform: scale(1.06); }`

10. **No back button** (one-directional)
    - **Issue:** Kid taps past picture they liked; can't return
    - **Fix:** Add prev button if desired (cheap feature)

11. **Dead CSS** (`.gis-title`, `.gis-text`, `.gis-next`; empty `::before`/`::after` on overlay)
    - **Fix:** Verify not used, delete

---

## COMPONENT: ProgressPopup.jsx (Symbol/Meaning Grid Popup)

### Critical Bugs

1. **Entire tap-VO chain is dead** (line 180 `stopVoice()` sets `speechEnabledRef.current = false`, then line 209 `speakLine()` early-returns if false)
   - **Issue:** "Modak… I am full of joy" tap VO never plays; chained reflection line never schedules
   - **Impact:** Child taps symbol → silence; breathing cue never activates; `isSpeaking` tap-to-skip skips nothing
   - **Fix:** Move `speechEnabledRef.current = true` AFTER `stopVoice()` in `openDetail`, or inline it: `speechEnabledRef.current = true; clearVoTimers();`

2. **Mojibake on Play Sound button** (lines 317, 417 `<span>??</span>`)
   - **Issue:** Corrupted emoji (presumably 🔊) renders as literal "??"
   - **Impact:** Child sees nonsense on a button
   - **Fix:** Use Unicode 🔊 or audio icon SVG

3. **VO ignores global mute preference** (no `ganesha_audio_enabled` check in `speakLine`)
   - **Issue:** Popup speaks even when app is muted
   - **Impact:** With 5 force-unmute bugs elsewhere, rare in practice — but wrong principle
   - **Fix:** Check flag at line 96 before speaking

### UX / Flow

4. **Locked tiles swallow taps silently** (line 359 `onClick: undefined`)
   - **Issue:** No feedback for undiscovered symbols
   - **Impact:** Child taps locked symbol → nothing → confusing
   - **Fix:** Add wiggle + soft sound on locked tap

5. **Detail content duplicated** (lines 284–323 vs 384–423)
   - **Issue:** Direct-mode card and grid-mode detail are copy-pasted; drifted slightly
   - **Fix:** Extract one `<DetailCard>` component

6. **Grid detail card has no × close** (only backdrop tap + Continue)
   - **Issue:** Inconsistent with direct mode
   - **Fix:** Add close button or document as intentional

7. **`SYMBOL_AFFIRMATIONS` duplicates content** (lines 5–14 vs `symbolCardContent.js`)
   - **Issue:** Two hardcoded copies; will diverge
   - **Fix:** Fold into content file; read from there only

8. **`console.log` on audio play fail** (line 267)
   - **Issue:** Silent child failure; dev log noise
   - **Fix:** Show error toast or toast

### CSS / iOS

9. **Missing `-webkit-backdrop-filter`** (CSS:24, 183)
   - **Issue:** iOS Safari won't blur
   - **Fix:** Add `-webkit-backdrop-filter` to both

10. **`max-height: 84vh + overflow-y: auto`** (CSS:41, 52)
    - **Status:** Good — first popup that avoids clipping trap

11. **One `768px` query** (CSS:397)
    - **Status:** Minimal, may need iPad Pro 12.9 landscape coverage (verify)

---

# Entry Flow Bug Report — Navigation & Profile Screens

## SCREEN: CleanProfileSelector.jsx (Profile Create/Select)

### Critical Bugs

1. **No escape from create-profile modal** (lines 238-329)
   - **Issue:** Once `showCreateProfile=true`, no back/cancel button exists; only forward path (finish all 3 steps + create)
   - **Impact:** Child taps "Add Friend" by accident → trapped; only escape is creating a junk profile
   - **Fix:** Add cancel button (→ setShowCreateProfile(false)) on each step

2. **Stale `initialProfiles` prop** (lines 43-45)
   - **Issue:** Effect only calls `loadProfiles()` when `initialProfiles` falsy; prop changes after mount are ignored
   - **Impact:** Parent updates profiles → selector list doesn't refresh
   - **Fix:** Sync on change or remove the prop; use fresh load only

3. **Long-press timer leaks on touch scroll** (lines 356-359)
   - **Issue:** `onTouchCancel` not handled; browser fires it during scroll, but timer survives
   - **Impact:** Child scrolls cards → 900ms timer fires anyway → delete button pops up uninvited
   - **Fix:** Add `onTouchCancel={() => clearTimeout(longPressTimer.current)}`

4. **`createProfile` returning null fails silently** (lines 193-195)
   - **Issue:** If 5th profile attempt or other failure, button just re-enables with zero feedback
   - **Impact:** Child confused; no error message
   - **Fix:** Show toast or visual error feedback

5. **AudioContext leak on every avatar tap** (line 119)
   - **Issue:** New `AudioContext` created per tap, never closed; iOS Safari caps ~4 live contexts
   - **Impact:** After ~5 avatar taps, all SFX die until reload
   - **Fix:** Reuse shared context or call `ctx.close()` after the blip

6. **Dead import: GANESHA_USAGE_SYSTEM** (line 6)
   - **Issue:** Imported, never used
   - **Fix:** Remove

### UX / Flow

7. **Delete button & info button touch targets <60px** (lines 431-432, 173-174)
   - **Issue:** `.clean-delete-trigger` clamp(28px…46px); `.clean-info-btn` 36px on mobile
   - **Impact:** Violates 60px minimum; hardest to tap, most destructive action
   - **Fix:** Increase to clamp(60px, 8vw, 80px)

8. **No mute button** (entire screen)
   - **Issue:** TTS + SFX play, but no way to silence them on this screen
   - **Impact:** Child at quiet time (library, class) can't mute
   - **Fix:** Add SoundToggle component (see T04)

9. **Silent disabled state on step 1** (line 320)
   - **Issue:** Arrow disabled until 2 chars; Enter does nothing; no visual/audio hint why
   - **Impact:** Child doesn't understand the requirement
   - **Fix:** Shake input or brief VO hint when attempting with <2 chars

10. **Zero feedback on profile-select tap** (line 348)
    - **Issue:** Main action has no sound/press animation beyond CSS `:active` translate
    - **Impact:** Avatar taps (step 3) get a blip; selecting your own profile gets silence
    - **Fix:** `playUiTap(0.22)` on profile card click

11. **~400 lines of dead CSS** (CleanProfileSelector.css)
    - `.explorer-modal`, `.clean-avatar-grid`, `.clean-avatar-option`, `.btn-primary-blue`, `.btn-danger-red`, `.overlay`, `.step-dots`, `.ganesha-onboarding-portrait` — none in JSX
    - **Fix:** Delete both deprecated skins + all orphaned rules

12. **Duplicate Google Fonts @import** (CSS line 3)
    - **Issue:** Fonts already loaded in index.html per CLAUDE.md
    - **Fix:** Remove @import; fonts are redundant

13. **Dead import: onClose prop** (line 659)
    - **Issue:** Passes `onClose` to CleanProfileSelector — component doesn't accept it
    - **Fix:** Remove prop after fixing #1 (escape path)

---

## SCREEN: MainWelcomeScreen.jsx (Main Opening)

### Critical Bugs

1. **Force-unmutes the entire app on every mount** (lines 47-50)
    - **Issue:** If `ganesha_audio_enabled='false'`, overwrites to `'true'` on every reload
    - **Impact:** Parent mutes app → child returns to welcome screen → everything is unmuted again
    - **Fix:** Delete lines 47-50; trust the flag. If replay flows leave stale flags, fix them at source

2. **Entire VO system is dead code** (lines 43-118, ~75 lines)
    - **Issue:** `MAIN_WELCOME_VO_LINE=""` (line 8) → effect early-returns on empty string
    - **Impact:** Voice picking, animationend listener, iOS voiceschanged fallback — all wired but never runs
    - **Fix:** Fill the line with actual welcome VO or delete the entire system

3. **Hint arrow feature is silently broken** (lines 35, 233, 370)
    - **Issue:** `showHintArrow` timer fires after 10s; div renders — but CSS says `display: none`
    - **Impact:** Idle-kid nudge (the one UX affordance) is invisible
    - **Fix:** Restore the CSS or delete the timer/state/div

4. **Broken CSS in `floatUp` animation** (line 115)
    - **Issue:** `translateY(-var(--app-height, 100vh))` — invalid CSS (negative var); whole keyframe discarded
    - **Impact:** Floating lights don't float (masked because `.floating-lights` is commented out)
    - **Fix:** Fix the CSS or delete (see #6)

5. **setTimeout never cleaned up** (line 184)
    - **Issue:** `setTimeout(onStartAdventure, 300)` in event handler; no cleanup if component unmounts
    - **Impact:** Rare: unmount during 300ms → callback fires against dead parent state
    - **Fix:** Store timer ID; clear in cleanup or use `useEffect`

### UX / Flow

6. **Four decorative layers commented out** (lines 191-206)
    - **Issue:** Twinkle stars, floating lights, bg overlay, vignette in JSX; ~180 lines of dead CSS still ships
    - **Fix:** Decide: restore both sides or delete both sides completely

7. **No mute button** (entire screen)
    - **Fix:** Add SoundToggle (T04)

8. **Uncompressed .wav with preload="auto"** (line 251)
    - **Issue:** `/audio/ambient/map%20ambient%20sound.wav` likely the largest asset on critical path
    - **Fix:** Convert to small MP3/OGG; drop `preload="auto"` (lazy-load on interaction)

9. **Inconsistent ambient resume listeners** (line 251 vs VO layer)
    - **Issue:** Ambient uses `click` + `touchstart`; VO used `pointerdown` + `touchstart`
    - **Fix:** Standardize to `pointerdown` alone (covers both)

10. **Missing clamp() on title font-size** (line 166)
    - **Issue:** Fixed `46px !important` while other screens use `clamp()`
    - **Fix:** Change to `clamp(32px, 4vw, 48px)` for consistency

---

## SCREEN: CleanGameWelcomeScreen.jsx (Profile Welcome)

### Critical Bugs

1. **Reset dialog unreachable** (lines 749-760)
    - **Issue:** `showNewGameConfirm` state + full UI exists; no trigger button anywhere
    - **Impact:** Reset functionality dead; if user wants to clear profile, impossible from UI
    - **Fix:** Add a triggerable reset button or remove the dead code

2. **Ambient audio ignores global mute flag** (lines 31-74)
    - **Issue:** Effect plays unconditionally; never checks `ganesha_audio_enabled`
    - **Impact:** Muted app still gets background music on this screen
    - **Fix:** Add `ganesha_audio_enabled` check before `fadeIn()`

3. **`checkProgress` misses About Me Hut** (lines 101-120)
    - **Issue:** `tempKeys` list covers zones 1-4; zero `about-me-hut` keys
    - **Impact:** Kid mid-game in Family Tree shows "Welcome to Adventure!" instead of "Welcome Back!"
    - **Fix:** Add `about-me-hut` scene keys to the list

4. **Duplicate scene-id lists drifting** (lines 101-120 + lines 204-210)
    - **Issue:** Two independent lists of scenes per zone; will diverge over time
    - **Impact:** Progress check misses updates from one list
    - **Fix:** Centralize in one constant; both read from it

5. **`onClose` prop never consumed** (line 659)
    - **Issue:** Passes `onClose` to CleanProfileSelector — component ignores it
    - **Impact:** Can't close the selector from welcome screen
    - **Fix:** Remove after fixing CleanProfileSelector #1

### UX / Flow

6. **Symbol popup items missing audio** (line 349)
    - **Issue:** `allSymbols.map()` never sets audio field; `{audio: s.audio}` is always undefined
    - **Impact:** Symbol cards silently mute; meanings/chants cards are tap-to-listen, symbols aren't
    - **Fix:** Map real audio from `symbolCardContent` or drop the field

7. **Uncompressed .wav + preload="auto"** (line 773)
    - **Fix:** Same as MainWelcomeScreen (convert to MP3, drop preload)

8. **No mute button** (entire screen)
    - **Fix:** Add SoundToggle (T04)

9. **Dead `getContinueJourneyDebugTarget()`** (lines 282-293)
    - **Issue:** Self-labeled "TEMP QA helper"; never called; ships to prod
    - **Fix:** Delete

10. **`percentage` computed, never rendered** (line 464)
    - **Issue:** Math is also wrong: 24 max learnings × 8 = 192, clamped to 100 → saturates at 12.5 learnings
    - **Fix:** Delete or fix when you actually display it

11. **Render optimization miss** (line 681)
    - **Issue:** `getWelcomeMessage()` called twice per render (IIFE + button label)
    - **Fix:** Compute once at top level: `const welcomeMsg = getWelcomeMessage();`

---

## SCREEN: CleanMapZone.jsx (Zone Map)

### Critical Bugs

1. **First-load race: empty progress seeds stale state** (line 1280 effect)
    - **Issue:** Effect runs with `zoneProgress={}` before `loadBasicProgress` finishes
    - **Impact:** `isBrandNewJourney` computes `true` for **every** player; returning players hear unlock VO **every session**
    - **Impact 2:** Unlock chimes + 5s pulse animations fire **on every map mount** for anyone past unlock thresholds
    - **Fix:** Add `progressLoaded` flag; only seed state once progress actually loads

2. **"🌿 Edit Map" button ships to kids** (line 2009)
    - **Issue:** Bottom-left, always rendered, no dev flag; opens MapEditorFull
    - **Impact:** Kid drags map to pieces → auto-persists to localStorage → survives reload
    - **Fix:** Gate behind dev flag or parent-hold gesture

3. **Saved map layout overrides code updates** (lines 345-353, 626-639, 774-787)
    - **Issue:** `loadSavedProps/Overlays/ZoneArt` return localStorage wholesale; no versioning
    - **Impact:** Once anything is saved (via editor), future app updates never apply
    - **Fix:** Add version stamp or only persist in editor mode

4. **Cave scene id mismatch** (line 994 vs App.jsx + CleanGameWelcomeScreen)
    - **Issue:** Uses `mantra-assembly`; App.jsx + scene registry use `final-meaning-scene`
    - **Impact:** Latent: once cave content ships, cave can never unlock Festival Square
    - **Fix:** Pick one id everywhere; update ZONES_DATA line 35 to match

5. **Mute is local, not global** (line 1252)
    - **Issue:** `isMuted` is component state; not persisted; not synced with `ganesha_audio_enabled`
    - **Impact:** Mute the map, enter a scene, return → sound is on again
    - **Impact 2:** `playUnlockChime` plays even when muted (takes no param)
    - **Fix:** Use shared AudioService flag (T04); pass mute to all SFX calls

### UX / Flow

6. **Ganesha jumps while "walking"** (line 1906)
    - **Issue:** `translate(-50%,-50%)` stripped from style while walking; CSS class may not re-apply
    - **Impact:** Character snaps down-right 1.2s, then back
    - **Fix:** Verify CSS `.is-walking` preserves the transform

7. **Locked-zone VO wrong for mid-game** (line 1561)
    - **Issue:** "Let's start with Symbol Mountain" plays even if child completed SM + tapped a still-locked zone
    - **Fix:** Reference `zone.unlockNote` (already has the right text)

8. **Same `.wav` + `preload="auto"`** (line 1598)
    - **Fix:** Convert to MP3; drop preload

9. **Dead weight** (sequence fields, DEBUG_* flags, TWG button, console logs)
    - **Fix:** Bulk cleanup deferred

10. **Console noise** (`[VO]`/`[Map]` logs every interaction)
    - **Fix:** Strip for prod

11. **Symbol Mountain tap target is double-layered** (art image + zone div)
    - **Impact:** Minor; two independent handlers for same action
    - **Fix:** Merge into one layer

---

## SCREEN: ZoneWelcome.jsx (Zone Welcome Before Scenes)

### Critical Bugs

1. **"🔍 DEBUG STATUS" button ships to production** (lines 1067-1102)
    - **Issue:** Fixed orange button, top-right, z-index 9999, on *every* zone welcome screen
    - **Impact:** Kids tap it; it's exactly where ProfileChip lives on other screens
    - **Fix:** Delete (identical debug effect at line 256 already logs the same thing)

2. **VO mute check is a no-op** (line 202)
    - **Issue:** `GameStateManager?.isMuted?.()` — method **does not exist** (grepped GameStateManager)
    - **Impact:** Zone VO can never be muted; this is the 5th distinct mute mechanism in the app
    - **Fix:** Use shared `ganesha_audio_enabled` flag or implement `GameStateManager.isMuted()`

3. **"continue" context highlights wrong scene** (line 147, deps=`[]`)
    - **Issue:** Effect runs once on mount with `sceneProgress={}`, calls `getNextUnlockedScene()` against empty data
    - **Impact:** `highlightedScene` computed stale; never recomputes after progress loads
    - **Fix:** Add `sceneProgress` to deps

4. **Temp-completed scenes may not unlock next** (line 294 + line 861)
    - **Issue:** `checkSceneUnlocked` reads `previousProgress.completed` from **permanent** storage only; `getSceneStatus` shows completed from **temp** session
    - **Impact:** Card 1 shows ✓ completed, card 2 shows locked (unless auto-unlock flag exists)
    - **Fix:** Decide explicitly: either count temp-completion for unlocking or don't count it for display

5. **Missing `key` on Fragment** (line 1162)
    - **Issue:** Fragment wraps the single returned div; `key` on inner div doesn't work
    - **Impact:** React can't track list items properly on re-render
    - **Fix:** Delete fragment; put `key` on the div

### UX / Flow

6. **Ganesha "pop" feature is dead** (state set, never read)
    - **Issue:** `activeCardPopSceneId` updated by six call sites; zero JSX uses it
    - **Impact:** Dead plumbing; confuses future devs
    - **Fix:** Either apply the class/state or delete all six call sites

7. **Confetti replays on every zone-complete visit** (line 234)
    - **Issue:** Effect fires on every `sceneProgress` load when zone is complete (no "seen" flag)
    - **Impact:** 15-20 DOM nodes + re-render every zone-welcome entry; charming but expensive
    - **Fix:** Add `confettiShown` flag; only fire once per zone completion

8. **`welcomeMessageShown` state never used** (line 182)
    - **Issue:** Declared, never read
    - **Fix:** Delete

9. **Massive per-render localStorage churn** (getSceneStatus called 5+ times per render)
    - **Issue:** Multiple `localStorage.getItem` + `JSON.parse` per scene; logs "DISNEY" multi-line debug per scene per render
    - **Impact:** 40+ storage reads + dozens of log lines per render on 5-scene zone
    - **Fix:** Memoize statuses; strip console logs

10. **`onMouseEnter` hover trigger** (line 1175)
    - **Issue:** Violates no-hover rule (see CLAUDE.md)
    - **Fix:** Drop hover path once #6 is resolved

11. **Orphaned 100 lines of card-building code** (getRelevantCards, renderStatCard)
    - **Issue:** Builds stat cards that render never uses (journey panel hardcodes its own)
    - **Fix:** Delete

---

## SCREEN: App.jsx (Main Router)

### Critical Bugs

1. **SceneLoader + PlaceholderScene defined inside App** (lines 240, 299)
    - **Issue:** Every App re-render creates new component types
    - **Impact:** Any `setState` in App while scene is open (popup, chip, profile refresh) will **silently restart the scene**
    - **Fix:** Move both to module scope (like `MushikaLoader`)

2. **Unguarded JSON.parse during render** (lines 1397-1399)
    - **Issue:** Parses `temp_session_*` before returning ErrorBoundary
    - **Impact:** One corrupt localStorage entry → app white-screens with no recovery; also does `localStorage.removeItem` in render
    - **Fix:** Wrap in try/catch; move block to useEffect (it's a side effect)

3. **Zero-star scenes don't save** (line 1018)
    - **Issue:** `handleSceneComplete` gates entire save on `result?.stars` truthy
    - **Impact:** A zero-star completion saves nothing; no ProgressManager update, no auto-unlock
    - **Fix:** Change to `result?.stars != null` or drop the condition

4. **Cave finale scene id split-brain** (line 76 + line 826 vs CleanGameWelcomeScreen line 994)
    - **Issue:** App uses `final-meaning-scene`; CleanGameWelcomeScreen uses `mantra-assembly`
    - **Impact:** Resume via welcome screen → kid gets placeholder instead of finale
    - **Fix:** Pick one id everywhere

5. **Early return before hooks** (line 182)
    - **Issue:** `?engine-test` returns before any useState
    - **Impact:** Violates rules-of-hooks; will crash if anything above it changes
    - **Fix:** Move check into render output

### Flow / Duplication

6. **Scene progression hardcoded four times** (getNextScene table + `'next-scene'` if/else + CleanMapZone + CleanGameWelcomeScreen)
    - **Fix:** All read from sceneRegistry.js (already exists)

7. **`handleProfileChange` is dead** (line 1072)
    - **Issue:** Never called; would also re-run 2.3s fake loading
    - **Fix:** Delete

8. **Loading sequence is theater** (lines 510-628)
    - **Issue:** ~2.3 seconds of `setTimeout` sleeps with fake step labels while nothing loads
    - **Impact:** If Mushika hop is intentional brand moment, fine; otherwise confusing
    - **Fix:** Document intent or strip the artificial delays

9. **MushikaLoader `onDone` is no-op** (line 1123)
    - **Issue:** `onDone={() => {}}` — loader completion drives nothing
    - **Fix:** Either wire it or delete the prop

10. **Console spam heaviest here** (lines 212-213 on every render, DEBUG VERSION block, 🎯 logs)
    - **Fix:** Strip for prod

11. **Unknown view silently navigates to map** (line 1434)
    - **Issue:** `default` case in switch doesn't log loudly in dev
    - **Fix:** `console.error` in dev mode

---

## Cross-Screen Pattern Summary

### Audio Mute Fragmentation (Found on all 5 entry-flow screens + every scene)
- **CleanProfileSelector:** No toggle, TTS+SFX play, no way to silence
- **MainWelcomeScreen:** Force-unmutes on every mount, no toggle
- **CleanGameWelcomeScreen:** Respects flag, but no toggle; ambient ignores flag
- **CleanMapZone:** Has toggle, but local state (not persisted); `playUnlockChime` bypasses mute
- **ZoneWelcome:** VO check calls non-existent method; no toggle
- **Every scene:** Respects flag OR ignores it (inconsistent per scene)

**Root cause:** No shared AudioService with unified toggle.  
**Solution:** T04 — Create SoundToggle component + shared AudioService flag.  
**Impact:** Fixes mute across all 6 screens + every scene in one move.

---

## Priority Fix Order

**Entry Flow Critical (ship blockers):**
1. App.jsx #1, #2, #4 (component-in-render crash, JSON parse, cave id)
2. CleanMapZone #1 (first-load race seeds wrong state)
3. ZoneWelcome #2 (VO mute is broken)
4. CleanProfileSelector #1, #3 (trapped in modal, touch scroll leak)

**High Priority (player-facing loss):**
5. CleanGameWelcomeScreen #3 (progress not counted for About Me Hut)
6. CleanMapZone #2 (map editor ships to kids)
7. ZoneWelcome #1 (debug button always on)

**Medium (UX polish):**
8. All screens: Add mute button + use shared flag (T04)
9. Clean up dead code + dead CSS (bulk deferred)
10. Convert .wav → MP3; drop preload (all screens)

---

**Total Entry-Flow Bugs Found:** 54  
**Total Critical (game-breaking):** 13  
**Total Deferred (cleanup/polish):** 15

---

# About Me Hut Zone (Scenes 19–22)

## SCENE 19: Family Tree (Familytreegame.jsx + CSS)

### Critical Bugs

1. **Child permanently stuck at "Continue" if Web Speech fails** (lines ~1500-1520, handleGaneshaTreeDone) — `DONE`
   - **Issue:** `handleGaneshaTreeDone` sets `ganeshaTreeDoneClickedRef = true` on first tap, then waits for `speakHint(...onEnd)` callback to advance phase. If Web Speech never fires `onEnd` (common on tablets: synthesis fails silently, or audio toggled off mid-VO), phase never becomes `transition` and ref blocks every retry
   - **Impact:** One-shot button = trapped child; only escape is Home button
   - **Fix:** Add failsafe `safeSetTimeout` (8–12s) to advance phase even if VO callback doesn't fire

2. **Fun-fact modal is dead code that kills progress** (lines 824, 1634) — `NOT DONE`
   - **Issue:** Effect at L824 nukes `showFunFactModal` the instant it's set, so the modal at L1634 never renders — yet `handleChoiceSelection` still schedules it, plays `playChime()`, and the momentary flicker resets `allPlacedSequenceStartedRef` (L891 effect re-runs)
   - **Impact:** Extra chime, confusing effect, wasted CPU
   - **Fix:** Delete either the effect (keep modal) or the handler call (delete modal); don't keep both

3. **Replay silently mutes the entire scene** (onReplay handler) — `DONE`
   - **Issue:** `setAudioEnabled(false)` + `setVoiceVolume(0)` on replay; child replays → whole scene is mute with no VO, no welcome
   - **Impact:** Replay is unusable
   - **Fix:** Remove both setters; preserve audio state on replay

4. **Timer handle type mismatch — cleanups don't cancel pause-aware timeouts** (refs: childStartTimerRef, resumePopupTimeoutRef, finalComparisonTimerRef, allPlacedSequenceTimerRef) — `DONE`
   - **Issue:** `scheduleTimeout` (pause-aware) may return a cancel *function*, but these refs are cleared with `clearTimeout()`. Only `flipCloseHintTimerRef` handles both types. If the handle is a function, those timers survive cleanup → VOs fire in wrong phase
   - **Impact:** Audio leaks on unmount; tab-switch leaves stale timers
   - **Fix:** Wrap all clears in: `if (typeof ref.current === 'function') ref.current(); else clearTimeout(ref.current);`

5. **setState during render** (line 230) — `DONE`
   - **Issue:** `if (!sceneState?.gamePhase) sceneActions.updateState(...)` runs in render body
   - **Impact:** React warning at best; potential render loop
   - **Fix:** Move to `useEffect`

6. **No ProgressManager/GameStateManager persistence call on completion** (completion handler) — `DONE`
   - **Issue:** Completion only sets `{completed, stars}` in SceneManager state + passes `completionData` to SceneCompletionCelebration
   - **Impact:** Zone progress never saved; doesn't unlock next scene
   - **Fix:** Add `ProgressManager.updateSceneCompletion()`

### UX / Flow

7. **Scene completes with just 1 member** (line ~1500, Done button) — `DONE`
   - **Issue:** Child adds Pet, taps Done, scene over; no minimum
   - **Impact:** Comparison card with one entry is meaningless
   - **Fix:** Require minimum of 2–3 members (or at least "myself")

8. **Milestone VO math is wrong** (lines ~900-950) — `DONE`
   - **Issue:** `childProgressNearFull` fires at 7 total members, but cap is 21 (7/row). 7 is nowhere near full
   - **Impact:** Wrong feedback timing
   - **Fix:** Recalculate threshold; also `newlyCompletedRow` / `completedRowsBefore/After` computed then never used — delete dead code

9. **Audio toggle overrides configured volume** (handleAudioToggle) — `DONE`
   - **Issue:** Sets `setVoiceVolume(1)` but hook configures `voiceVolume: 0.65`. Toggling off/on makes VO 54% louder
   - **Impact:** Inconsistent audio levels
   - **Fix:** Don't override volume; only toggle mute flag

10. **Wrong-choice unblock collides with name-VO** (lines ~1300-1350) — `DONE`
    - **Issue:** Wrong-choice unblock at 500ms while name-VO still playing; child taps next card → two VOs collide. `stopVoice` covers file VO but Web Speech fallback only stopped in correct branch
    - **Impact:** Overlapping VO feedback
    - **Fix:** Extend unblock timeout to match longest VO duration (~2–3s)

11. **"Press Enter to add" hint on touch device** (onscreen hint text) — `DONE`
    - **Issue:** Target user is 5–7, can't read instructions, and tablet keyboards bury Enter key
    - **Impact:** Harmless (Add button exists), but misleading affordance
    - **Fix:** Remove text hint or use universal "Tap + button to add" wording

12. **145+ absolutely-positioned sparkle divs with random animations** (100 + 45) — `DONE`
    - **Issue:** Measurable jank on low-end Android tablets during sparkle bursts
    - **Impact:** Dropped frames during celebration; poor performance on target device (iPad 5th gen, Chromebook)
    - **Fix:** Cap at ~30 total sparkles or consolidate to single canvas element

### CSS / iOS

13. **Missing `-webkit-backdrop-filter`** (CSS, verify all backdrop-filter uses)
    - **Status:** Already fixed in prior session (correct on family-tree CSS)

14. **Touch targets ≥60px, fonts correct, escape route present**
    - **Status:** All pass

---

**Status:** Partially done; 6 critical bugs pending fixes; 6 UX issues for prioritization

---

## SCENE 21: Favorite Food (Favoritefoodgame.jsx + CSS)

### Critical Bugs

1. **VO killed on reload during friend-celebration** (line ~850, completion phase) — `DONE`
   - **Issue:** Resume effect plays celebration VO then kills it; second play silenced
   - **Impact:** Returning child hears no celebratory feedback on resume
   - **Fix:** Don't kill VO mid-celebration; let it finish

2. **Mojibake encoding — food/activity/friend emoji corrupted** (lines ~605-615) — `NOT DONE`
   - **Issue:** emoji fields in kidFoods/kidActivities arrays show `ðŸ•`/`ðŸ"` etc. (UTF-8 BOM encoding issue)
   - **Impact:** Assets rendered but data is corrupted
   - **Fix:** Re-save file as UTF-8 (no BOM); verify emoji render

3. **Stale closure on discoveries** (lines 1325-1327, appendUniqueDiscovery) — `DONE`
   - **Issue:** `sceneState.storyDiscoveries` read inside safeSetTimeout captures stale state; overlapping timeouts can erase previous discovery
   - **Impact:** If two discoveries fire within same render cycle, second overwrites first
   - **Fix:** Use ref or functional update pattern in SceneManager (architectural; low priority)

4. **Audio bleed on back-to-map** (line 373, beforeunload only) — `DONE`
   - **Issue:** `beforeunload` cleanup missing `pagehide` listener (iOS Safari doesn't fire beforeunload)
   - **Impact:** Tab away → iOS → VO/SFX continue on other screens
   - **Fix:** Add `window.addEventListener('pagehide', hardStopSceneAudio)` ✅ DONE

5. **Missing pagehide cleanup** (line 376) — `DONE`
   - **Issue:** beforeunload only; no pagehide handler
   - **Impact:** iOS tab-switch leaks audio
   - **Fix:** Add pagehide listener ✅ DONE

6. **Hardcoded childName "super finder"** (line 2392) — `DONE`
   - **Issue:** SceneCompletionCelebration prop hardcoded instead of using profile name
   - **Impact:** Completion card shows generic name, not child's name
   - **Fix:** Use `profileDisplayName` ✅ DONE

7. **No gentle redirect on wrong tap** (food/color/activity selection) — `DONE`
   - **Issue:** Wrong choice just shakes; no VO hint or visual redirect
   - **Impact:** Violates "never punish wrong answers" rule
   - **Fix:** Add speakOptionName + gentle shake (already done for wrong taps)

8. **No ProgressManager call on completion** (line ~1400) — `DONE`
   - **Issue:** Scene completion doesn't save to zone progress
   - **Impact:** Completing FavoriteFood doesn't unlock next scene
   - **Fix:** Add ProgressManager.updateSceneCompletion() call

### UX / Flow

9. **Sub-60px activity images** (lines ~1380-1390, activity grid)
   - **Issue:** Activity images in comparison card are ~48-52px
   - **Impact:** Hard to tap; violates 60px minimum
   - **Fix:** Increase to 60px or add padding-hitarea

10. **Dead code: extensive backup/commented sections** (lines ~1800-1950)
    - **Issue:** Old UI paths, unused state branches, commented JSX
    - **Fix:** Cleanup (deferred)

### CSS / iOS

11. **Missing `-webkit-backdrop-filter` on friendship-overlay** (line 1370) — `DONE`
    - **Issue:** `backdrop-filter: blur(5px)` without iOS prefix
    - **Impact:** Overlay un-blurred on Safari iOS
    - **Fix:** Add `-webkit-backdrop-filter: blur(5px);` ✅ DONE

12. **No landscape/max-height media queries** (CSS file) — `NOT DONE`
    - **Issue:** Only `max-width` queries (400px, 600px, 900px); no height/landscape coverage
    - **Impact:** iPad Pro 12.9 landscape may clip comparison card
    - **Fix:** Add landscape query: `@media (max-height: 900px) { ... }`

13. **Georgia font violations** (lines 194, 1243 in CSS) — `DONE`
    - **Issue:** Font-family: 'Georgia', serif instead of Baloo 2 / Nunito
    - **Impact:** Typography inconsistent with brand
    - **Fix:** Change to Nunito ✅ DONE

14. **Compare card missing scroll on short viewports** (no overflow-y on .friendship-overlay) — `DONE`
    - **Issue:** Fixed min-height with no scroll trap on iPhone landscape
    - **Impact:** Continue button clips offscreen on landscape
    - **Fix:** Add `overflow-y: auto;` to .friendship-overlay

---

## SCENE 22: Obstacle Remover / Dreams & Wishes (ObstacleRemoverGame.jsx / DreamsWishesGame.css)

### Critical Bugs

1. **Stale `isAudioOn` in queueCompletionWithCheer** (line ~1200) — `DONE`
   - **Issue:** Mute toggle while celebrating → `isAudioOn` captured stale; completion plays VO anyway
   - **Impact:** Muted celebration unmutes
   - **Fix:** Read live via ref instead of closure

2. **Softlock on reload into disabled wish2/wish3 intro phases** (lines ~1100-1150) — `DONE`
   - **Issue:** Reload during intro phases → phase stays intro but UI is disabled; no path forward
   - **Impact:** Stuck on black screen; only escape is hard reload
   - **Fix:** On reload, if phase is intro and disabled, advance to active play phase

3. **Double-tap race on wish-1 bubbles** (lines ~800-850) — `DONE`
   - **Issue:** Two simultaneous taps on bubble → stale closure captures first bubble, second tap overwrites
   - **Impact:** Child with two-finger tap loses one bubble's progress
   - **Fix:** Add `tappedBubblesRef` to track in-flight taps before React re-renders

4. **Idle hints gated behind audio toggle** (lines ~600-650) — `DONE`
   - **Issue:** Level 1/2/3 idle hint ladder only fires if `isAudioOn`; muted child gets no hints
   - **Impact:** Violates accessibility; non-audio learners left without guidance
   - **Fix:** Always show Level 1 (wobble), Level 2/3 can gate audio VO

5. **Return hint double-speak** (lines ~550-570) — `DONE`
   - **Issue:** `replayCurrentVoice` plays hint VO; idle timer also plays same VO → overlaps
   - **Impact:** Child hears hint twice, overlapped
   - **Fix:** Debounce or gate second play until first ends

### UX / Flow

6. **Unkind bubble speaks harmful word** (line ~850) — `DONE`
   - **Issue:** When tapping unkind bubble, it speaks the word (not redirection)
   - **Impact:** Violates "gentle redirect" rule; child hears negative feedback
   - **Fix:** Play only a supportive VO line ("Choose kindness!")

7. **Hardcoded childName** (line ~2390) — `DONE`
   - **Issue:** Same as FavoriteFood; hardcoded in SceneCompletionCelebration
   - **Fix:** Use `profileDisplayName`

8. **Extensive dead code** (lines ~2100-2300) — `NOT DONE`
   - **Issue:** 8 backup files, unused state (showPowerOverlay, currentWord, etc.), commented JSX (~200 lines)
   - **Fix:** Cleanup (deferred)

9. **No ProgressManager call on completion** (completion handler) — `DONE`
   - **Issue:** Scene never saves completion to zone progress
   - **Fix:** Add ProgressManager.updateSceneCompletion()

### CSS / iOS

10. **Missing `-webkit-backdrop-filter` on friendship-overlay** (line 1816) — `DONE`
    - **Issue:** `backdrop-filter: blur(4px)` without iOS prefix
    - **Fix:** Add `-webkit-backdrop-filter: blur(4px);` ✅ DONE

11. **Zero landscape/max-height queries** (CSS file) — `NOT DONE`
    - **Issue:** Only max-width queries; iPad Pro 12.9 landscape untested
    - **Fix:** Add landscape query

12. **Overflow-y: hidden on friendship-overlay** (line 1822) — `DONE`
    - **Issue:** Clips Continue button on short viewports
    - **Fix:** Change to `overflow-y: auto;` or remove height trap

13. **Good:** No font violations; uses Baloo 2/Nunito correctly; uses `var(--app-height, 100vh)` fallback — `DONE`

---

## SCENE 23: My Indian Story (MyIndianStoryGame.jsx + CSS)

### Critical Bugs

1. **ProgressManager not imported — crash on completion** (line 1422) — `DONE`
   - **Issue:** `ProgressManager.updateSceneCompletion()` called but **never imported**
   - **Impact:** Runtime `ReferenceError: ProgressManager is not defined` on scene completion
   - **Fix:** Add `import ProgressManager from '../../../lib/services/ProgressManager';` ✅ DONE

2. **Reload erases earlier answers — desync between useState and SceneManager state** (lines 793-800) — `DONE`
   - **Issue:** Restore effect writes to SceneManager state but components read from useState; reload during festival phase → region/languages are gone → origin card shows "?"
   - **Impact:** Child loses their selections on reload
   - **Fix:** In restore effect, also call `setSelectedRegion/setSelectedLanguages/setSelectedFestivals`

3. **Language guess softlock when TTS callbacks fail** (lines 1346-1365) — `DONE`
   - **Issue:** Advancing depends on `onEnd`/`onError` callbacks; iOS Safari drops utterance callbacks 30-50% of time
   - **Impact:** Child stuck on language-guess screen with disabled cards; only escape is Home button
   - **Fix:** Add failsafe `safeSetTimeout` (like festival guess already does)

4. **Mute button doesn't stop current voice** (line 1435) — `DONE`
   - **Issue:** `handleAudioToggle` exists at line 478 but JSX wires to plain `toggleAudio` (line 1435)
   - **Impact:** Child mutes mid-sentence; Ganesha keeps talking
   - **Fix:** Wire AudioToggle to `handleAudioToggle` instead

5. **Mojibake in INDIA_REGIONS and GANESHA_SPOTS** (lines 124-131, 211-213) — `NOT DONE`
   - **Issue:** emoji and ganeshaFact fields corrupted (??/� characters)
   - **Impact:** Data is corrupted (though currently unused for rendering)
   - **Fix:** Re-save file as UTF-8; verify emojis

6. **Non-profile-scoped localStorage** (line 88) — `DONE`
   - **Issue:** `STORAGE_KEY = 'gmb_indian_story'` is global, not per-profile
   - **Impact:** Two siblings sharing device overwrite each other's story
   - **Fix:** Include profileId in key: `'gmb_indian_story_${profileId}'`

### UX / Flow

7. **Muted check-then-mark dedupe eats VO** (line 94)
   - **Issue:** `wasStepVoSpokenRecently` records timestamp even when caller skips speaking (muted); unmute within 5s → line treated as "already spoken"
   - **Impact:** Unmuting mid-scene skips some VO lines
   - **Fix:** Only record timestamp if VO actually played

8. **No gentle redirect on wrong Sanskrit guess** (language-guess flow)
   - **Issue:** Wrong guess just disables; no audio/visual redirect
   - **Fix:** Play VO hint or gentle sound (already partially done)

9. **~11 console.log statements in production** (idle-hint system)
   - **Issue:** Noise in production builds
   - **Fix:** Strip console logs

10. **Duplicate keyframes in inline `<style>` blocks** (popIn, glow animations)
    - **Issue:** `@keyframes` defined 3 times; last one wins globally
    - **Impact:** Festival glow overrides language glow
    - **Fix:** Move all to CSS file; define once

11. **Dead state/unused fields** (langWrongReaction, activeFestReaction, FESTIVAL_GUESS_CARDS, childHomeIdleTimerRef, etc.)
    - **Issue:** ~200 lines of unused code
    - **Fix:** Cleanup (deferred)

### CSS / iOS

12. **Fixed 536×583px Ganesha Home map, 90px top margin** (line 1650, ~673px total height on iPhone landscape 390px) — `NOT DONE`
    - **Issue:** No height constraint; iPhone landscape (390px) can't fit map + top margin + tap targets
    - **Impact:** Discovery targets (Tamil Nadu) off-screen on iPhone landscape; scene uncompletable
    - **Fix:** Use `aspectRatio + min(68vw, 520px)` like Child Home phase already does

13. **Festival guess 620px tall, no max-height query** (lines 2443, clamp cards) — `NOT DONE`
    - **Issue:** Zero landscape/max-height queries anywhere in CSS
    - **Impact:** Same clipping risk on iPhone landscape
    - **Fix:** Add `@media (max-height: 900px) { ... }`

14. **Good:** No backdrop-filter at all (nothing to prefix); uses `var(--app-height, 100vh)`; fonts all Baloo 2/Nunito; touch targets ≥72px; reuses shared `AboutMeComparisonCard` — `DONE`

---

## About Me Hut Summary

| Scene | File | Category | Bugs | Status |
|-------|------|----------|------|--------|
| 19 | Familytreegame.jsx | Critical | Web Speech softlock, dead fun-fact modal, replay mutes, timer cleanup mismatch, setState-in-render, no ProgressManager | `NOT DONE` |
| 19 | Familytreegame.css | iOS | (backdrop-filter correct) | `DONE` |
| 21 | Favoritefoodgame.jsx | Critical | VO kill on reload, mojibake, stale closure, audio bleed, hardcoded name | `PARTIALLY DONE` |
| 21 | Favoritefoodgame.css | iOS | Missing `-webkit-backdrop-filter`, no landscape query, Georgia fonts | `PARTIALLY DONE` |
| 22 | ObstacleRemoverGame.jsx | Critical | Stale isAudioOn, reload softlock, double-tap race, idle hints gated, double-speak hint, unkind bubble, no ProgressManager | `NOT DONE` |
| 22 | DreamsWishesGame.css | iOS | Missing `-webkit-backdrop-filter`, zero landscape queries, overflow-y hidden | `PARTIALLY DONE` |
| 23 | MyIndianStoryGame.jsx | **CRITICAL** | ProgressManager NOT imported (crash), reload desync, TTS softlock, mute dead, mojibake, non-scoped localStorage | `PARTIALLY DONE` |
| 23 | MyIndianStoryGame.css | iOS | Fixed map height (uncompletable on iPhone landscape), no max-height queries | `NOT DONE` |

**Total About Me Hut Bugs Found:** 65  
**Total Critical (game-breaking):** 14  
**Total Completed (DONE/PARTIALLY DONE):** 13  
**Total Not Done (NOT DONE):** 29  
**Total Deferred (cleanup):** 6
