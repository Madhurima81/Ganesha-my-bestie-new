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

### Scene 20 — Favorite Food (Familytreegame)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 21 — Dreams Wishes (Favoritefoodgame)

**Phases found in JSX:**
- [ ]

**Tab Switch** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Continue / Resume** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:
**Idle Hints** — Status: [ ] EXISTS  [ ] PARTIAL  [ ] MISSING / Notes:

**Gaps to fix:**
- [ ]

---

### Scene 22 — Name Birthday (ObstacleRemoverGame)

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