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

## Tasks

- [ ] T01 · Opening Modal — spec TBD (Madhurima will describe separately)
- [ ] T02 · Completion Modal — use NewModakV7 as benchmark
- [ ] T03 · New FWKS — First time / Welcome / Kids Speech V/O
- [ ] T04 · Sound on/off toggle → Purple styling
- [ ] T05 · Home button → Purple, with zone label
- [ ] T06 · Audio Symbol Reveal
- [ ] T07 · Simplify audio hints
- [ ] T08 · useAppVisibility.js → import and wire up in all scenes
- [ ] T09 · useVoiceGuidance.js → import and wire up in all scenes
- [ ] T10 · First time vs returning user → different V/O and SFX on entry
- [ ] T11 · Opening Modal → remove fade out (ONE fix in OpeningModal.css fixes all 22 scenes)
- [ ] T12 · Zone Completion Screen
- [ ] T13 · Zone Badge
- [ ] T14 · New Simple V/O audio files
- [ ] T15 · New SFX audio files
- [ ] T16 · New Ambient Sounds audio files
- [ ] T17 · Zone Completion Modal
- [ ] T18 · Ganesha Gestures — map which gesture per scene phase
- [ ] T19 · Image Audit — list all PNG and SVG assets used per scene
- [ ] T20 · CSS Media Queries audit — check clamp() present, add where missing
- [ ] T21 · Test Cases + Edge Cases — document in TESTCASES.md

---

## Progress Tracker

> Legend: [ ] not started · [x] done · [~] partial · [!] blocked

| # | Scene | File | T01 | T02 | T03 | T04 | T05 | T06 | T07 | T08 | T09 | T10 | T11 | T12 | T13 | T14 | T15 | T16 | T17 | T18 | T19 | T20 | T21 |
|---|-------|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| 01 | modak | NewModakSceneV7 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 02 | pond | PondSceneSimplifiedV4 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 03 | symbol | SymbolMountainSceneV3 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 04 | final-scene | SacredAssemblySceneV8 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 05 | vakratunda-mahakaya | CaveSceneFixedV2 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 06 | suryakoti-samaprabha | SuryakotiSceneV4 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 07 | nirvighnam-kurumedeva | NirvighnamSceneV5 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 08 | sarvakaryeshu-sarvada | SarvakaryeshuSarvadaV7 | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 09 | final-meaning-scene | Cavescene5memoryfinale | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 10 | vakratunda-grove | VakratundaGroveSimplified | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 11 | suryakoti-bank | SuryakotiBankSimplified | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 12 | nirvighnam-chant | NirvighnamChantSimplified | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 13 | sarvakaryeshu-chant | SarvakaryeshuChantSimplified | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 14 | shloka-river-finale | ShlokaRiverFinale | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 15 | game1 piano | FestivalPianoGame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 16 | game2 rangoli | FestivalRangoliGame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 17 | game3 cooking | ModakCookingGame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 18 | game4 mandap | MandapDecorationGame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 19 | family-tree | Namebirthdaygame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 20 | favorite-food | Familytreegame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 21 | dreams-wishes | Favoritefoodgame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| 22 | name-birthday | ObstacleRemoverGame | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

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