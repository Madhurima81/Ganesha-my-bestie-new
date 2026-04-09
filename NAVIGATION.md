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
- [ ]

**Tab Switch**
- Status: [✔️ ] EXISTS  [ ] PARTIAL  [ ] MISSING
- Notes: Need to check after vo

**Continue / Resume**
- Status: [✔️ ] EXISTS  [ ] PARTIAL  [ ] MISSING
- Notes: in phase inbtw restarts phase, on card reveal restarts the card 

**Idle Hints**
- Status: [✔️ ] EXISTS  [ ] PARTIAL  [ ] MISSING
- Notes: Need to change emoji position

**Gaps to fix:**
- [ ]

---

### Scene 03 — Symbol (SymbolMountainSceneV3)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

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

### Scene 19 — Family Tree (Namebirthdaygame)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

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
- [ ] Start scene fresh: intro -> food-choice works with question VO.
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

### Scene 21 — Dreams Wishes (ObstacleRemoverGame)

**Phases found in JSX:**
- [x] intro
- [x] wish1-intro
- [x] wish1-active
- [x] wish1-complete
- [x] wish2-intro
- [x] wish2-active
- [x] wish2-complete
- [x] wish3-intro
- [x] wish3-active
- [x] wish3-complete
- [x] all-wishes-complete (now combined with dream-intro, goes straight to drawing)
- [~] dream-intro (commented out — merged into all-wishes-complete)
- [x] dream-drawing
- [x] dream-clouded
- [x] dream-clearing
- [x] dream-revealed
- [x] comparison-card
- [x] ending

**Tab Switch**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Notes: uses usePauseAwareTimeout and useAppVisibility hooks (via useVoiceGuidance). Pauses voice, clears timeouts, resets phaseVoiceRef on tab hide.

**Continue / Resume**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Notes: T38+T39 implemented. On continue in intro phases: restart with VO replay. On continue in active phases (wish1/2/3-active, dream-clouded/clearing): jump BACK to intro phase + reset counters + replay intro VO. Drawing modal exception: resume in modal with VO. T39 fixed voice bug: return hint clears only phase-specific VO key, allowing subsequent VOs to trigger.

**Idle Hints**
- Status: [x] EXISTS  [ ] PARTIAL  [ ] MISSING
- Notes: Implements idle hints via getPhaseReminderLine() for active/cloud-clearing phases. Uses IDLE_HINT_DELAY_MS (15 seconds), triggered on markInteraction reset.

**Gaps to fix:**
- [ ] Uncomment dream-intro and dream-drawing restart logic when finalizing phase restart behavior.

---

### Scene 22 — Name Birthday (Namebirthdaygame)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

## Summary — gaps by type
*Claude Code fills this in after scanning all 22 scenes*

**Tab Switch missing in:**
- [ ]

**Continue / Resume missing in:**
- [ ]

**Idle Hints missing in:**
- [ ]

**Total scenes fully covered:** 0 / 22
