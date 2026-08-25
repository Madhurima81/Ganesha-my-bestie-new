# Ganesha My Bestie — Navigation & Phase Map
## Auto-generated from JSX + gap analysis

---

## How to generate this file

Run this in Claude Code for each scene:
"Read NAVIGATION.md.
Then read [scene file path from sceneRegistry.js].
Map all phases found in the JSX.
For each phase check tab-switch, continue/resume, and idle hints.
Fill in the scene section below.
Flag all gaps as EXISTS / MISSING / PARTIAL.
Update the SUMMARY section at the bottom when done."

Always start with Scene 01 (NewModakSceneV7) as the benchmark.
All other scenes are compared against it.

---

## Navigation events — definitions

### Tab Switch
User switches browser tab or app goes to background.
- Expected: pause audio, pause animations, save progress to localStorage
- Hook to check for: useAppVisibility.js
- Mark as EXISTS if useAppVisibility is imported and wired
- Mark as PARTIAL if imported but not fully wired
- Mark as MISSING if not present at all

### Continue / Resume
User returns to a scene they left mid-way.
- Expected: restore correct phase, restore progress from localStorage, replay V/O for current phase if first visit to that phase
- Source to check: localStorage.getItem calls, resume logic in useEffect
- Mark as EXISTS if phase + progress are both restored
- Mark as PARTIAL if only one is restored
- Mark as MISSING if no resume logic found

### Idle Hints
User has not interacted for X seconds.
- Expected: Ganesha gives a gentle audio + visual nudge
- Hook to check for: useVoiceGuidance.js, idle timer, setTimeout hint logic
- Mark as EXISTS if idle timer and hint trigger are both present
- Mark as PARTIAL if timer exists but no audio/visual nudge
- Mark as MISSING if no idle logic found

---

## Scenes

---

### Scene 01 — Modak (NewModakSceneV7) ← BENCHMARK
*Fill this first. All other scenes compared against it.*

**Phases found in JSX:**
- [ ] Phase 1:
- [ ] Phase 2:
- [ ] Phase 3:
- [ ] Phase 4:

**Tab Switch**
- Status: [ ✔️] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference:
- Notes: working except during mooshika found v/o 

**Continue / Resume**
- Status: [✔️ ] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference:
- Notes: Working

**Idle Hints**
- Status: [✔️ ] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference:
- Notes: Need to change emoji position


**Gaps to fix:**
- [ ]

---

### Scene 02 — Pond (PondSceneSimplifiedV4)

**Phases found in JSX:**
- [x] INITIAL — stream blocked by rock, lotus dormant, drag-around-rock active (line 91)
- [x] TRUNK_SOLVED — water reached pond, lotus lifting upright (line 92)
- [x] TRUNK_REVEAL — SymbolAutoReveal card for Trunk showing (line 93)
- [x] LOTUS_ACTIVE — lotus upright, press-and-hold enabled (line 94)
- [x] BLOOMED — lotus bloomed, about to reveal Lotus card (line 95)
- [x] COMPLETE (line 96)

**Tab Switch**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: `usePauseAwareTimeout` wired at [PondSceneSimplifiedV4.jsx:466-470](src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx:466); `onPauseHide` at line 436 stops voice, cancels drag, cancels lotus-hold rAF loops; `onPauseShow` at line 457 replays current phase prompt + rearms idle hints.
- Notes: working except during mooshika found v/o (carried over note — check if still applies to Pond specifically)

**Continue / Resume**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: reload/resume effect at [PondSceneSimplifiedV4.jsx:610-705](src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx:610) — restores drag UI on INITIAL, re-triggers Trunk reveal card on TRUNK_SOLVED/TRUNK_REVEAL, re-triggers Lotus reveal card on BLOOMED, restores completion screen on COMPLETE.
- Notes: in phase in-between restarts phase, on card reveal restarts the card

**Idle Hints**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: idle ladder useEffect at [PondSceneSimplifiedV4.jsx:544-577](src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx:544) (L1/L2/L3 = 10s/18s/26s, constants at lines 384-386); idle VO trigger at line 587-595.
- Notes: Need to change emoji position

**Gaps to fix:**
- [ ] Confirm mooshika-found VO note doesn't apply here (likely stale, carried from Modak notes)
- [ ] Move idle-hint emoji position (per existing note)

---

### Scene 03 — Symbol / Tusk (SymbolMountainSceneV3)
*Three sub-games chained by phase: Eyes → Ears → Tusk*

**Phases found in JSX:**
- [x] EYES_GAME / EYES_COMPLETE (lines 103-104) — `EyesPopUpGame`
- [x] EARS_GAME / EARS_COMPLETE (lines 105-106) — `EarsSoundMatchGame`
- [x] TUSK_GAME / TUSK_COMPLETE (lines 107-108) — `TuskPathGame`
- [x] ALL_COMPLETE (line 109)

**Tab Switch**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: `usePauseAwareTimeout` at [SymbolMountainSceneV3.jsx:309-313](src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx:309) — `onHide` stops spoken voice only (no explicit game-state pause for the 3 sub-games' internal timers); `onShow` goes through `onTabReturnImplRef` (line 364-377) which resets hint cadence and replays the current phase prompt.
- Notes: sub-games (EyesPopUpGame / EarsSoundMatchGame / TuskPathGame) have their own internal timers (dart intervals, scrub/hold loops) — verify they're actually paused on tab-hide, not just scene-level VO.

**Continue / Resume**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: Reload Handling effect at [SymbolMountainSceneV3.jsx:556-619](src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx:556) — force-restarts an in-progress mini-game from scratch (`showEyesTelescopeGame`/`showEarsRhythmGame`/`showTuskAssemblyGame` reset to false) rather than resuming mid-game; restores the correct SymbolAutoReveal card if reload lands between game-complete and card-shown; restores completion screen on ALL_COMPLETE.
- Notes: resume policy for the 3 mini-games is "restart the current mini-game," not "resume mid-mini-game" — intentional given complexity of match/gesture state.

**Idle Hints**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: idle ladder useEffect at [SymbolMountainSceneV3.jsx:445-482](src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx:445) (L1/L2/L3 = 10s/18s/26s, constants at lines 277-279); scene-level idle VO gate at lines 534-553. Additionally, `EyesPopUpGame` has its own idle ladder (8s/16s/24s glow→zone-hint→full-reveal, `EyesPopUpGame.jsx:66-68`) and `TuskPathGame` has its own 6s idle hint (`TuskPathGame.jsx:89`).
- Notes: idle hints exist at 3 different layers (scene + 2 of the 3 mini-games) — verify they don't double-fire when a mini-game is active.

**Gaps to fix:**
- [ ] Confirm tab-hide actually pauses mini-game internal timers (dart/hold/scrub loops), not just VO
- [ ] Verify scene-level idle ladder is suppressed while a sub-game's own idle ladder is active (partially handled — see line 536)

---

### Scene 04 — Final Scene (SacredAssemblySceneV8)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 05 — Vakratunda Mahakaya (CaveSceneFixedV2)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 06 — Suryakoti Samaprabha (SuryakotiSceneV4)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 07 — Nirvighnam Kurumedeva (NirvighnamSceneV5)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 08 — Sarvakaryeshu Sarvada (SarvakaryeshuSarvadaV7)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 09 — Final Meaning Scene (Cavescene5memoryfinale)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 10 — Vakratunda Grove (VakratundaGroveSimplified)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 11 — Suryakoti Bank (SuryakotiBankSimplified)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 12 — Nirvighnam Chant (NirvighnamChantSimplified)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 13 — Sarvakaryeshu Chant (SarvakaryeshuChantSimplified)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 14 — Shloka River Finale (ShlokaRiverFinale)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 15 — Piano Game (FestivalPianoGame)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 16 — Rangoli Game (FestivalRangoliGame)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 17 — Modak Cooking (ModakCookingGame)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 18 — Mandap Decoration (MandapDecorationGame)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 19 — Family Tree (Familytreegame)
*Corrected file name — sceneRegistry.js:168 points to `family-tree/Familytreegame.jsx`, not Namebirthdaygame.*

**Phases found in JSX:**
- [x] intro (line 284)
- [x] ganeshaTree — place Shiva/Parvati/Kartikeya via choice modal, distractors mixed in (line 290)
- [x] transition (line 298)
- [x] childInput — child builds own tree (Dad/Mom/Grandpa/Grandma/Brother/Sister/Myself/Pet), types names (line 303)
- [x] sideBySide — Ganesha's tree vs. child's tree comparison (line 307)

**Tab Switch**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: `usePauseAwareTimeout` at [Familytreegame.jsx:434](src/zones/about-me-hut/family-tree/Familytreegame.jsx:434) — `onHide` at line 435, `onShow` at line 453.
- Notes: not yet manually freeze-tested (no checklist run recorded).

**Continue / Resume**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: `isReload` handling at [Familytreegame.jsx:635](src/zones/about-me-hut/family-tree/Familytreegame.jsx:635), `reloadHandledRef` guard at line 696.
- Notes: needs a manual pass to confirm mid-tree reload restores `placedGaneshaMembers`/`childFamily` correctly, not just the phase.

**Idle Hints**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: idle ladder at [Familytreegame.jsx:389](src/zones/about-me-hut/family-tree/Familytreegame.jsx:389) (`idleHintLevel`), delays at lines 402-403 (`IDLE_HINT_FIRST_DELAY_MS` 10s, `IDLE_HINT_STEP_MS` 8s → L2 @18s, L3 @26s), per-circle idle VO map `IDLE_HINT_VO` at line 538.
- Notes: matches the standard 10s/18s/26s ladder used elsewhere.

**Gaps to fix:**
- [ ] Run a manual freeze pass (mid-tree reload, tab-switch mid-choice-modal, wrong-choice + reload)

---

### Scene 20 — Favorite Food (Favoritefoodgame)

**Phases found in JSX:**
- [x] intro
- [x] food-choice
- [x] food-correct
- [x] color-choice
- [x] color-correct
- [x] activity-choice
- [x] activity-correct
- [x] friend-choice
- [x] friend-correct
- [x] child-intro
- [x] child-food-choice
- [x] child-color-choice
- [x] child-activity-choice
- [x] child-friend-input
- [x] friend-celebration
- [x] comparison-card

**Tab Switch**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Notes: uses visibility/pause-resume hooks. Ganesha choice phases restart cleanly on reload/continue (VO + idle hints). Child phases stay in same step and replay VO; if step already completed, auto-advance to next child step without popup.

**Continue / Resume**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Notes: no resume popup. Completion `Continue` goes to next scene via `scene-complete-continue`. Mid-scene reload restores open modal (`food/activity draw/type`) and draft data.

**Idle Hints**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Notes: hint progression active in Ganesha choice phases. Wrong click re-arms idle hint cycle. Pointer emoji appears only at Hint 3 (VO hint), then hides.

**Freeze Checklist (Pass/Fail)**
- [x] Start scene fresh: intro -> food-choice works with question VO.
- [ ] Completion screen `Continue` moves to next scene (or zone welcome if last).
- [ ] Completion screen `Replay` fully resets scene state.
- [ ] Tab switch in `food-choice`: returns to same phase with VO + idle hints re-running.
- [ ] Tab switch in `color-choice` after wrong click: wrong choices reset, VO + idle hints restart.
- [ ] Tab switch in `activity-choice` mid-attempt: phase restarts cleanly with VO + idle hints.
- [ ] Idle pointer emoji appears only during Hint 3 and auto-hides.
- [ ] No resume popup appears in any phase.
- [ ] Child phase tab switch with no selection: remains in same child phase, VO replay only.
- [ ] Child food already selected + reload/tab-return: auto-advances to `child-color-choice`.
- [ ] Child color already selected + reload/tab-return: auto-advances to `child-activity-choice`.
- [ ] Child activity already selected + reload/tab-return: auto-advances to `child-friend-input`.
- [ ] Child friend already entered + reload/tab-return: moves to `friend-celebration`.
- [ ] Open `food-draw` modal + reload/tab-return: modal restores with draft.
- [ ] Open `activity-type` modal + reload/tab-return: modal restores with draft.

**Gaps to fix:**
- [ ] Run full manual freeze pass once and mark each checklist item.

---

### Scene 21 — Dreams and Wishes (ObstacleRemoverGame)
*Corrected file name — sceneRegistry.js:184 points to `enjoy/ObstacleRemoverGame.jsx`, not Favoritefoodgame.*

**Phases found in JSX:**
- [x] wish1-intro / wish1-active — tap kind-action icons (kindness), taps tracked via `wish1Taps` (line 116)
- [x] wish2-intro / wish2-active — drag food onto 3 plates (`Wish2PlateDropGame`), `wish2Taps`/`bowlStates` (lines 119-123)
- [x] wish3-intro / wish3-active — tap-to-grow forest, `wish3Taps`/`parkStates` (lines 125-127)
- [x] dream reveal — `trunkTaps` → `dreamRevealed` → child draws own dream on DrawingPad, saved as `childDreamDrawing` (lines 129-134)

**Tab Switch**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: `usePauseAwareTimeout` at [ObstacleRemoverGame.jsx:361](src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx:361) — `onHide` line 362, `onShow` line 379.
- Notes: per T39 (TASKS.md) — return-hint bug already fixed so it clears only the phase-specific VO key.

**Continue / Resume**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: `isReload` handling at [ObstacleRemoverGame.jsx:641](src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx:641).
- Notes: per T38 (TASKS.md) — restarts wish1/2/3 intro & active phases and dream phases on continue (deliberate "restart the phase" policy, not mid-progress restore). Per T40, the old separate "all-wishes-complete" + "dream-intro" modals were merged — flow now goes straight to drawing.

**Idle Hints**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: per-wish idle levels at [ObstacleRemoverGame.jsx:261-263](src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx:261) (`wish1IdleLevel`/`wish2IdleLevel`/`wish3IdleLevel`), idle VO fired-once flags at lines 266-271 (`idleVoFlagsRef` — Level2/Level3 per wish), hint text `wish1Hint`/`wish2Hint`/`wish3Hint` around lines 229-231.
- Notes: each of the 3 wishes has its own idle ladder rather than one scene-wide ladder — matches the fact each wish is a distinct mechanic (tap / drag / tap).

**Gaps to fix:**
- [ ] Run a manual freeze pass (mid-wish2 drag reload, tab-switch during drawing pad)

---

### Scene 22 — My Indian Story (MyIndianStoryGame)
*Corrected name — sceneRegistry.js:192 points to `indian-story/MyIndianStoryGame.jsx`, not "Name Birthday/ObstacleRemoverGame".*

**Phases found in JSX:**
- [x] OPENING (line 79)
- [x] GANESHA_HOME — explore India map, region facts, Ganesha's true home = Kailash (line 80)
- [x] CHILD_HOME — child picks own family's region (line 81)
- [x] LANGUAGE_GANESHA / LANGUAGE_CHILD — guess then pick language(s) (lines 82-83)
- [x] FESTIVALS_GANESHA / FESTIVALS_CHILD — guess then pick festival(s) (lines 84-85)
- [x] ORIGIN_CARD — final personalized summary card (line 86)
- [x] COMPLETE (line 87)

**Tab Switch**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: `usePauseAwareTimeout` at [MyIndianStoryGame.jsx:376](src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx:376) — `onHide` line 377, `onShow` line 380.
- Notes: not yet manually freeze-tested.

**Continue / Resume**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: `RESUMABLE_STEPS` set at [MyIndianStoryGame.jsx:104-112](src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx:104) (excludes OPENING and COMPLETE by design); step persisted to localStorage under a per-profile key at lines 1188/1200; reload restore effect at lines 803-841 reads the saved step and validates it's in `RESUMABLE_STEPS` before restoring; `isReload && !reloadHandledRef.current` guard used repeatedly (lines 575, 845, 922) so VO doesn't replay on every re-render.
- Notes: most thorough resume implementation of the 4 About Me Hut scenes — explicit persisted-step + resumable-step allowlist rather than relying only on sceneState.

**Idle Hints**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Line reference: separate idle ladder per exploration phase — `ganeshaHomeIdleLevel` (line 322), `langGuessIdleLevel` (line 327), `festGuessIdleLevel` (line 333), plus `childHomeIdleHintTimerRef`/`languageSelectionIdleHintTimerRef`/`festivalSelectionIdleHintTimerRef` (lines 362-366); `useVoiceGuidance` `idleTimeout: 25` at line 349.
- Notes: 6 independent idle timers (one per Ganesha-guess phase + one per child-pick phase) — most fragmented idle-hint setup of the 22 scenes; worth checking they're properly torn down on phase change to avoid stray timers firing after the phase has moved on.

**Gaps to fix:**
- [ ] Run a manual freeze pass (mid-map-exploration reload, tab-switch during language/festival picking)
- [ ] Audit the 6 idle timer refs for proper cleanup on phase transitions

---

## Summary — gaps by type
*Claude Code fills this in after scanning all 22 scenes*
*Scanned so far: Scenes 01 (benchmark), 02, 03, 19, 20, 21, 22. Scenes 04-18 not yet scanned.*

**Tab Switch missing in:**
- (none found missing among scanned scenes — all use `usePauseAwareTimeout`)

**Continue / Resume missing in:**
- (none found missing among scanned scenes — all have reload/isReload handling; Scene 03's resume policy is "restart the mini-game" rather than mid-progress resume — flagged as a gap, not a miss)

**Idle Hints missing in:**
- (none found missing among scanned scenes)

**Needs manual freeze-test pass (implementation exists but untested):**
- [ ] Scene 02 — Pond
- [ ] Scene 03 — Symbol/Tusk (also: verify mini-game timers actually pause on tab-hide)
- [ ] Scene 19 — Family Tree
- [ ] Scene 20 — Favorite Food (checklist drafted, not run)
- [ ] Scene 21 — Dreams and Wishes
- [ ] Scene 22 — My Indian Story (also: audit 6 idle timer refs for cleanup)

**Total scenes fully covered:** 0 / 22 (implementation present in all 6 scanned scenes; none have a completed manual freeze-test sign-off yet)
**Total scenes scanned for this pass:** 7 / 22 (01, 02, 03, 19, 20, 21, 22)
