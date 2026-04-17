# Ganesha My Bestie — Implementation Tasks
## Reference date: 3rd March 2026

---

## Benchmark Rule
Before every task, Claude Code must:
1. Read `src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx` fully
2. Extract the exact pattern for the task
3. Read the target scene
4. Compare — find what is missing
5. Add only what is missing — never rewrite existing code
6. Confirm with ✅ per file

---

## Tasks by Theme

### Modals & Overlays
- [x] T01 · Opening Modal — spec TBD (Madhurima will describe separately)
- [x] T02 · Completion Modal — use NewModakV7 as benchmark
- [x] T11 · Opening Modal → remove fade out (ONE fix in OpeningModal.css fixes all 22 scenes)
- [ ] T12 · Zone Completion Screen — 3 final scenes only
- [ ] T17 · Zone Completion Modal — 3 final scenes only

### Navigation & UI Chrome
- [x] T04 · Sound on/off toggle → Purple styling
- [x] T05 · Home button → Purple, with zone label
- [x] T13 · Zone Badge

### Voice & Audio
- [x] T03 · New FWKS — First time / Welcome / Kids Speech V/O
- [ ] T07 · Simplify audio hints
- [x] T09 · useVoiceGuidance.js → import and wire up in all scenes
- [ ] T10 · First time vs returning user → v/o off on returning screens
- [ ] T14 · New Simple V/O audio files — need to record
- [ ] T15 · New SFX audio files — need to finalise
- [ ] T16 · New Ambient Sounds audio files — need to create or search — one per zone
- [ ] T36 · when to use V/o vs web speech


### Scene Behaviour & Hooks
- [x] T06 · SymbolAutoReveal
- [x] T08 · useAppVisibility.js → import and wire up in all scenes
- [x] T22 · Idle hints — Symbol Mountain, Shloka River, Cave of Secrets
- [ ] T27 · Idle hints — About Me and Festival Square

### Ganesha & Mooshika Presence
- [ ] T18 · Ganesha Gestures — map which gesture per scene phase — Symbol Mountain, Cave of Secrets, Shloka River (zones 1–3)
- [ ] T23 · Gesture in main map — lock, unlock states
- [ ] T24 · Gesture in ZoneWelcome — current scene, next scene
- [ ] T25 · Mooshika — show only once per zone enter
- [ ] T26 · Mooshika — show when in ZoneWelcome
- [ ] T28 · Ganesha Gestures — map which gesture per scene phase — About Me and Festival Square (zones 4–5)
- [ ] T29 · Ganesha expressions
- [ ] T30 · Ganesha blinking eyes
- [ ] T31 · Mooshika expressions & blinking eyes


### Quality & Audit
- [ ] T19 · Image Audit — list all PNG and SVG assets used per scene
- [ ] T20 · CSS Media Queries audit — check clamp() present, add where missing
- [ ] T21 · Test Cases + Edge Cases — document in TESTCASES.md
- [ ] T32 · Content Audit — refer to CONTENT.md

### Additional things
- [ ] T34 · Parent Dashboard
- [ ] T35 · DailyDare and gratitude
- [ ] T37 · Scene 20 freeze sign-off (favorite-food nav: continue + tab-switch)
- [x] T38 · Scene 21 continue/resume behavior — restart phases on continue (wish1/2/3 intro & active, dream phases)
- [x] T39 · Scene 21 voice bug fix — return hint now clears only phase-specific VO key, allows subsequent VOs to play
- [x] T40 · Scene 21 combined modal — merge "all-wishes-complete" + "dream-intro" into single modal, skip dream-intro phase, go straight to drawing





---

## Progress Tracker

> Legend: [ ] not started · [x] done · [~] partial · [!] blocked · [--] not applicable

### Modals & UI Chrome

| # | Scene | File | T01 | T02 | T11 | T12 | T17 | T04 | T05 | T13 |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | modak | NewModakSceneV7 | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 02 | pond | PondSceneSimplifiedV4 | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 03 | symbol | SymbolMountainSceneV3 | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 04 | final-scene | SacredAssemblySceneV8 | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 05 | vakratunda-mahakaya | CaveSceneFixedV2 | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 06 | suryakoti-samaprabha | SuryakotiSceneV4 | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 07 | nirvighnam-kurumedeva | NirvighnamSceneV5 | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 08 | sarvakaryeshu-sarvada | SarvakaryeshuSarvadaV7 | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 09 | final-meaning-scene | Cavescene5memoryfinale | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 10 | vakratunda-grove | VakratundaGroveSimplified | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 11 | suryakoti-bank | SuryakotiBankSimplified | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 12 | nirvighnam-chant | NirvighnamChantSimplified | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 13 | sarvakaryeshu-chant | SarvakaryeshuChantSimplified | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 14 | shloka-river-finale | ShlokaRiverFinale | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 15 | game1-piano | FestivalPianoGame | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 16 | game2-rangoli | FestivalRangoliGame | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 17 | game3-cooking | ModakCookingGame | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 18 | game4-mandap | MandapDecorationGame | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 19 | family-tree | Familytreegame | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 20 | favorite-food | Favoritefoodgame | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 21 | dreams-wishes | ObstacleRemoverGame | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 22 | my-indian-story | MyIndianStoryGame | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |

### Voice & Audio

| # | Scene | File | T03 | T07 | T09 | T10 | T14 | T15 | T16 |
|---|---|---|---|---|---|---|---|---|---|
| 01 | modak | NewModakSceneV7 | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 02 | pond | PondSceneSimplifiedV4 | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 03 | symbol | SymbolMountainSceneV3 | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 04 | final-scene | SacredAssemblySceneV8 | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 05 | vakratunda-mahakaya | CaveSceneFixedV2 | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 06 | suryakoti-samaprabha | SuryakotiSceneV4 | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 07 | nirvighnam-kurumedeva | NirvighnamSceneV5 | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 08 | sarvakaryeshu-sarvada | SarvakaryeshuSarvadaV7 | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 09 | final-meaning-scene | Cavescene5memoryfinale | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 10 | vakratunda-grove | VakratundaGroveSimplified | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 11 | suryakoti-bank | SuryakotiBankSimplified | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 12 | nirvighnam-chant | NirvighnamChantSimplified | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 13 | sarvakaryeshu-chant | SarvakaryeshuChantSimplified | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 14 | shloka-river-finale | ShlokaRiverFinale | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 15 | game1-piano | FestivalPianoGame | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 16 | game2-rangoli | FestivalRangoliGame | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 17 | game3-cooking | ModakCookingGame | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 18 | game4-mandap | MandapDecorationGame | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 19 | family-tree | Familytreegame | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 20 | favorite-food | Favoritefoodgame | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 21 | dreams-wishes | ObstacleRemoverGame | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 22 | my-indian-story | MyIndianStoryGame | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |

> T14 · T15 · T16 are content creation tasks — mark [x] once files are recorded/created, not per scene.

### Scene Behaviour & Hooks

> T22 = zones 1–3 (scenes 01–14) · T27 = zones 4–5 (scenes 15–22)

| # | Scene | File | T06 | T08 | T22 | T27 |
|---|---|---|---|---|---|---|
| 01 | modak | NewModakSceneV7 | [ ] | [x] | [x] | [--] |
| 02 | pond | PondSceneSimplifiedV4 | [ ] | [x] | [x] | [--] |
| 03 | symbol | SymbolMountainSceneV3 | [x] | [x] | [x] | [--] |
| 04 | final-scene | SacredAssemblySceneV8 | [ ] | [x] | [x] | [--] |
| 05 | vakratunda-mahakaya | CaveSceneFixedV2 | [x] | [x] | [x] | [--] |
| 06 | suryakoti-samaprabha | SuryakotiSceneV4 | [x] | [x] | [x] | [--] |
| 07 | nirvighnam-kurumedeva | NirvighnamSceneV5 | [x] | [x] | [x] | [--] |
| 08 | sarvakaryeshu-sarvada | SarvakaryeshuSarvadaV7 | [x] | [x] | [x] | [--] |
| 09 | final-meaning-scene | Cavescene5memoryfinale | [ ] | [x] | [x] | [--] |
| 10 | vakratunda-grove | VakratundaGroveSimplified | [ ] | [x] | [x] | [--] |
| 11 | suryakoti-bank | SuryakotiBankSimplified | [x] | [x] | [x] | [--] |
| 12 | nirvighnam-chant | NirvighnamChantSimplified | [x] | [x] | [x] | [--] |
| 13 | sarvakaryeshu-chant | SarvakaryeshuChantSimplified | [x] | [x] | [x] | [--] |
| 14 | shloka-river-finale | ShlokaRiverFinale | [ ] | [x] | [x] | [--] |
| 15 | game1-piano | FestivalPianoGame | [ ] | [x] | [--] | [ ] |
| 16 | game2-rangoli | FestivalRangoliGame | [ ] | [x] | [--] | [ ] |
| 17 | game3-cooking | ModakCookingGame | [ ] | [x] | [--] | [ ] |
| 18 | game4-mandap | MandapDecorationGame | [ ] | [x] | [--] | [ ] |
| 19 | family-tree | Familytreegame | [ ] | [x] | [--] | [ ] |
| 20 | favorite-food | Favoritefoodgame | [ ] | [x] | [--] | [ ] |
| 21 | dreams-wishes | ObstacleRemoverGame | [ ] | [x] | [--] | [ ] |
| 22 | my-indian-story | MyIndianStoryGame | [ ] | [x] | [--] | [~] |

### Ganesha & Mooshika Presence

> T18 = zones 1–3 (scenes 01–14) · T28 = zones 4–5 (scenes 15–22)
> T23 · T24 · T25 · T26 are navigation-level — tracked as global below.

**Global (navigation-level):**

| Task | Description | Status |
|---|---|---|
| T23 | Gesture in main map — lock, unlock states | [ ] |
| T24 | Gesture in ZoneWelcome — current scene, next scene | [ ] |
| T25 | Mooshika — show only once per zone enter | [ ] |
| T26 | Mooshika — show when in ZoneWelcome | [ ] |

**Per-scene:**

| # | Scene | File | T18 | T28 |
|---|---|---|---|---|
| 01 | modak | NewModakSceneV7 | [ ] | [--] |
| 02 | pond | PondSceneSimplifiedV4 | [ ] | [--] |
| 03 | symbol | SymbolMountainSceneV3 | [ ] | [--] |
| 04 | final-scene | SacredAssemblySceneV8 | [ ] | [--] |
| 05 | vakratunda-mahakaya | CaveSceneFixedV2 | [ ] | [--] |
| 06 | suryakoti-samaprabha | SuryakotiSceneV4 | [ ] | [--] |
| 07 | nirvighnam-kurumedeva | NirvighnamSceneV5 | [ ] | [--] |
| 08 | sarvakaryeshu-sarvada | SarvakaryeshuSarvadaV7 | [ ] | [--] |
| 09 | final-meaning-scene | Cavescene5memoryfinale | [ ] | [--] |
| 10 | vakratunda-grove | VakratundaGroveSimplified | [ ] | [--] |
| 11 | suryakoti-bank | SuryakotiBankSimplified | [ ] | [--] |
| 12 | nirvighnam-chant | NirvighnamChantSimplified | [ ] | [--] |
| 13 | sarvakaryeshu-chant | SarvakaryeshuChantSimplified | [ ] | [--] |
| 14 | shloka-river-finale | ShlokaRiverFinale | [ ] | [--] |
| 15 | game1-piano | FestivalPianoGame | [--] | [ ] |
| 16 | game2-rangoli | FestivalRangoliGame | [--] | [ ] |
| 17 | game3-cooking | ModakCookingGame | [--] | [ ] |
| 18 | game4-mandap | MandapDecorationGame | [--] | [ ] |
| 19 | family-tree | Familytreegame | [--] | [ ] |
| 20 | favorite-food | Favoritefoodgame | [--] | [ ] |
| 21 | dreams-wishes | ObstacleRemoverGame | [--] | [ ] |
| 22 | my-indian-story | MyIndianStoryGame | [--] | [ ] |

### Quality & Audit

| # | Scene | File | T19 | T20 | T21 |
|---|---|---|---|---|---|
| 01 | modak | NewModakSceneV7 | [ ] | [ ] | [ ] |
| 02 | pond | PondSceneSimplifiedV4 | [ ] | [ ] | [ ] |
| 03 | symbol | SymbolMountainSceneV3 | [ ] | [ ] | [ ] |
| 04 | final-scene | SacredAssemblySceneV8 | [ ] | [ ] | [ ] |
| 05 | vakratunda-mahakaya | CaveSceneFixedV2 | [ ] | [ ] | [ ] |
| 06 | suryakoti-samaprabha | SuryakotiSceneV4 | [ ] | [ ] | [ ] |
| 07 | nirvighnam-kurumedeva | NirvighnamSceneV5 | [ ] | [ ] | [ ] |
| 08 | sarvakaryeshu-sarvada | SarvakaryeshuSarvadaV7 | [ ] | [ ] | [ ] |
| 09 | final-meaning-scene | Cavescene5memoryfinale | [ ] | [ ] | [ ] |
| 10 | vakratunda-grove | VakratundaGroveSimplified | [ ] | [ ] | [ ] |
| 11 | suryakoti-bank | SuryakotiBankSimplified | [ ] | [ ] | [ ] |
| 12 | nirvighnam-chant | NirvighnamChantSimplified | [ ] | [ ] | [ ] |
| 13 | sarvakaryeshu-chant | SarvakaryeshuChantSimplified | [ ] | [ ] | [ ] |
| 14 | shloka-river-finale | ShlokaRiverFinale | [ ] | [ ] | [ ] |
| 15 | game1-piano | FestivalPianoGame | [ ] | [ ] | [ ] |
| 16 | game2-rangoli | FestivalRangoliGame | [ ] | [ ] | [ ] |
| 17 | game3-cooking | ModakCookingGame | [ ] | [ ] | [ ] |
| 18 | game4-mandap | MandapDecorationGame | [ ] | [ ] | [ ] |
| 19 | family-tree | Familytreegame | [ ] | [ ] | [ ] |
| 20 | favorite-food | Favoritefoodgame | [ ] | [ ] | [ ] |
| 21 | dreams-wishes | ObstacleRemoverGame | [ ] | [ ] | [ ] |
| 22 | my-indian-story | MyIndianStoryGame | [ ] | [ ] | [ ] |

---

## How to use this file in Claude Code

Start a task:
"Read CLAUDE.md, TASKS.md, and sceneRegistry.js.
Work on T05. Start from Scene 02.
Use NewModakSceneV7 as benchmark.
Update TASKS.md after each scene is done."

Resume after a break:
"Read TASKS.md. Find the first [ ] cell for T05.
Continue from there."

Do a full zone:
"Read TASKS.md and sceneRegistry.js.
Apply T08 to all Zone 2 scenes (05–09).
Update TASKS.md after each file."
---

## Pre-Commit Checklist (Per Scene)

Use this quick pass before committing. Mark mentally or copy into your review notes.

**Common checks for every scene**
- OpeningModal: shared component, config wired, button visible immediately
- Completion: SceneCompletionCelebration + getCompletionModal
- Audio: useAudioPreference + AudioToggle wired
- Navigation: HomeButton + ZoneBadgeButton
- Symbol reveal: SymbolAutoReveal (no inline overlays)
- Fireworks: new fireworks (where applicable)
- Idle hints: useIdleNudge + IdleHint (except Vakratunda Grove inline)

**Symbol Mountain**
- Scene 1 Modak: IdleHint wired (Modak pattern)
- Scene 2 Pond: IdleHint on first lotus; reset on lotus/golden/elephant clicks
- Scene 3 Symbol: IdleHint on eyes symbol; reset on eyes/ears/note clicks
- Scene 4 Final: no IdleHint required

**Cave of Secrets (Meaning Cave)**
- Scene 1 Vakratunda-Mahakaya: IdleHint on Door 1; reset on syllable/stone clicks
- Scene 2 Suryakoti-Samaprabha: IdleHint on first healing sun; reset on sun + hint btn
- Scene 3 Nirvighnam-Kurumedeva: IdleHint on first crystal; reset on crystal/fog/rock
- Scene 4 Sarvakaryeshu-Sarvada: IdleHint on Door 1; reset on char/symbol/helper
- Scene 5 Final: no IdleHint required

**Shloka River**
- Scene 1 Vakratunda Grove: Idle hints already inline; do not duplicate
- Scene 2 Suryakoti Bank: IdleHint on AppSidebar; reset on app + hint btn
- Scene 3 Nirvighnam Chant: IdleHint on AppSidebar; reset on app + hint btn
- Scene 4 Sarvakaryeshu Chant: IdleHint on AppSidebar; reset on app click
- Scene 5 Finale: no IdleHint required

**Festival Square**
- Scenes 1-4: Opening/Completion/Audio/Home/Badge wired

**About Me Hut**
- Scenes 1-4: Opening/Completion/Audio/Home/Badge wired

