# SYMBOL MOUNTAIN - MASTER FREEZE CHECKLIST (Scenes 01-04)
## Single Comprehensive Checklist (Merged from Scene Freeze + Visual Assets & Mechanics)

Purpose: One print-ready checklist to freeze all Symbol Mountain scenes end-to-end with minimal regression risk.

Scenes covered:
- Scene 01: Modak (`NewModakSceneV7`)
- Scene 02: Pond (`PondSceneSimplifiedV4`)
- Scene 03: Symbol (`SymbolMountainSceneV3`)
- Scene 04: Sacred Assembly (`SacredAssemblySceneV8`)

---

## A. MASTER GATE (MUST PASS FOR ALL 4 SCENES)

### A1. Core Freeze Tasks (from main freeze checklist)

| Task | Description | S01 | S02 | S03 | S04 | Notes |
|---|---|---|---|---|---|---|
| T01 | OpeningModal imported/rendered correctly | [ ] | [ ] | [ ] | [ ] | |
| T02 | SceneCompletionCelebration + completion modal flow | [ ] | [ ] | [ ] | [ ] | |
| T03 | FWKS / scene VO trigger on start or key phase | [ ] | [ ] | [ ] | [ ] | |
| T04 | AudioToggle wired and working | [ ] | [ ] | [ ] | [ ] | |
| T05 | HomeButton visible and navigates safely | [ ] | [ ] | [ ] | [ ] | |
| T06 | SymbolAutoReveal where applicable | [ ] | [ ] | [ ] | [ ] | N/A allowed in S04 if not used |
| T07 | Idle hint UX/VO logic | [ ] | [ ] | [ ] | [ ] | |
| T08 | Tab visibility pause/resume safe | [ ] | [ ] | [ ] | [ ] | |
| T09 | useVoiceGuidance integration stable | [ ] | [ ] | [ ] | [ ] | |
| T10 | First-time vs returning user behavior | [ ] | [ ] | [ ] | [ ] | |
| T13 | ZoneBadgeButton / zone progress control | [ ] | [ ] | [ ] | [ ] | |
| T18 | Ganesha gesture mapping verified | [ ] | [ ] | [ ] | [ ] | |
| T19 | Image audit completed | [ ] | [ ] | [ ] | [ ] | |
| T20 | Responsive check / clamp style quality | [ ] | [ ] | [ ] | [ ] | |
| T21 | Test cases documented and replayed | [ ] | [ ] | [ ] | [ ] | |
| T22 | Scene-specific idle hints validated | [ ] | [ ] | [ ] | [ ] | |

### A2. Asset Integrity (all scenes)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Zero 404 assets in DevTools Network during full run | | |
| | Background image correct for each scene (no wrong duplicate fallback asset) | | |
| | All symbol icon variants (colored + gray where applicable) load correctly | | |
| | Popups/cards use correct image per symbol | | |
| | No missing/incorrect PNG/SVG in side rail and completion modal | | |

### A3. Stability / Resume / Reload

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Tab switch away/back does not break state in any active phase | | |
| | Resume countdown behaves correctly and does not duplicate VO | | |
| | Mid-scene reload restores safe state (no stuck card/modal/overlay) | | |
| | No duplicate timers after return/reload (voice/hints/sparkles) | | |
| | Continue button from completion goes to correct next scene | | |

---

## B. SCENE 01 - MODAK (NewModakSceneV7)

### B1. Visual + UI

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Mooshika, modaks, basket, rock/belly assets all render correctly | | |
| | Side rail symbols visible and states update correctly | | |
| | Symbol flip card visuals render correctly (front/back/affirmation) | | |
| | Sparkles/fireworks are visible above gameplay and do not clip | | |

### B2. Mechanics

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Phase flow correct: mooshika search -> modak collect -> rock feed -> belly reveal -> completion | | |
| | Mooshika discovery triggers correct symbol reveal card | | |
| | Modak tap increments collect count and updates basket/logic correctly | | |
| | Drag/drop from basket to rock works; wrong drop handling is safe | | |
| | Belly symbol reveal triggers after required feed count | | |
| | Symbol card tap completes and flies/lands to sidebar correctly | | |
| | Fireworks and completion modal timing are correct | | |

### B3. Voice / Hint UX

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Intro VO, collect VO, feed VO, completion VO all trigger once as intended | | |
| | Idle hints appear in right phase and clear on interaction | | |
| | Tab switch during VO resumes cleanly (no stale line continues) | | |

---

## C. SCENE 02 - POND (PondSceneSimplifiedV4)

### C1. Visual + UI

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Lotus closed/bloomed states display correctly | | |
| | Golden lotus visual behavior (if enabled) is correct | | |
| | Trunk/elephant reveal assets render correctly | | |
| | Sidebar icons and completion symbols are accurate | | |

### C2. Mechanics

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Lotus tap mechanics work reliably (hitboxes and animation) | | |
| | Required lotus progression/order works as intended | | |
| | Trunk reveal triggers only after required progression | | |
| | Symbol reveal card flow works and moves to sidebar correctly | | |
| | Completion transition and next-scene navigation are correct | | |

### C3. Voice / Hint UX

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Welcome and phase VO trigger in correct order | | |
| | Idle hints trigger after expected delay and clear after interaction | | |
| | Resume/reload keeps pond progression safe and non-duplicated | | |

---

## D. SCENE 03 - SYMBOL (SymbolMountainSceneV3)

### D1. Visual + UI

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Eyes, ears, tusk symbol visuals render correctly | | |
| | Notes/instruments and tusk assembly visuals render correctly | | |
| | Side rail shows previously unlocked symbols + new unlocks | | |
| | Reveal cards and fireworks display at correct z-index | | |

### D2. Mechanics

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Phase order is correct: eyes game -> ears game -> tusk game -> all complete | | |
| | Eyes click opens/starts telescope interaction correctly | | |
| | Ears rhythm interaction advances only on correct pattern/progress | | |
| | Tusk assembly/note unlock logic works without skips | | |
| | Each completed subgame triggers correct SymbolAutoReveal card | | |
| | Reveal completion correctly advances to next sub-phase | | |
| | Final all-complete fireworks + completion modal behave correctly | | |

### D3. Voice / Hint UX

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Per-phase VO keys fire once and are context-correct | | |
| | Idle pointer/glow hints target the right object per phase | | |
| | Reload in each sub-phase restores safe expected state | | |

---

## E. SCENE 04 - SACRED ASSEMBLY (SacredAssemblySceneV8)

### E1. Visual + Layout

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Sacred background and Ganesha base render correctly | | |
| | All 8 symbol assets render and are selectable | | |
| | Body-part drop zones align correctly with Ganesha artwork | | |
| | Progress bar/count (`x/8 symbols`) updates correctly | | |
| | Zone hint overlays/pointers are visible and non-blocking | | |

### E2. Card Lifecycle + Side Movement (Critical)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Card phase sequence works in order: `appear -> flipped -> side -> play -> feedback` | | |
| | Card content (symbol name + association text) matches current round symbol | | |
| | Card slides to side correctly (no jump, no off-screen clipping) | | |
| | Guide arrow from card toward Ganesha appears in play phase | | |
| | Card VO plays after card lands (timing feels intentional) | | |
| | Card state recovers correctly after tab switch/reload mid-round | | |

### E3. Tap/Placement Mechanics (Critical)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Tapping/selecting current symbol works in play phase | | |
| | Tapping correct zone places symbol and locks that zone state | | |
| | Wrong zone tap gives wrong feedback then resets to idle | | |
| | Already placed zones/symbols cannot be broken by further taps | | |
| | Each correct placement triggers celebration sparkle and reaction | | |
| | Round advances correctly to next symbol in queue | | |
| | Queue completes at 8/8 with no duplicate/missing round | | |

### E4. Completion + Zone Exit

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | At 8/8, final fireworks trigger once | | |
| | Completion modal content and badge image are correct | | |
| | `onComplete` and progress save fire correctly | | |
| | Continue leads to correct post-zone route | | |

### E5. Voice/Hint/Resume

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Onboarding VO plays once before first round | | |
| | Card VO mapping is correct for all 8 symbols | | |
| | Idle hint VO triggers after inactivity in play phase | | |
| | Tab return countdown + phase resume is stable | | |
| | Reload mid-assembly resumes right round and avoids stale card state | | |

---

## F. SYMBOL SIDEBAR BEHAVIOR (Cross-scene)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Clicking unlocked symbol opens correct popup content | | |
| | Locked symbols are non-interactive where expected | | |
| | Popup close resumes paused celebration/phase correctly | | |
| | Sidebar icon highlight/bloom aligns with newly revealed symbol | | |
| | Sidebar z-index does not hide behind scene overlays | | |

---

## G. FINAL SIGN-OFF

### G1. Test Matrix Completed

| Validation | Result | Notes |
|---|---|---|
| Desktop viewport tested (all 4 scenes) | [ ] | |
| Mobile viewport tested (all 4 scenes) | [ ] | |
| Audio ON/OFF tested (all 4 scenes) | [ ] | |
| Tab switch tested in early/mid/late phase of each scene | [ ] | |
| Mid-scene reload tested at least twice per scene | [ ] | |
| DevTools Console has no blocking errors | [ ] | |
| DevTools Network has zero missing critical assets | [ ] | |

### G2. Approval

| Role | Name | Date | Signature |
|---|---|---|---|
| QA Tester | | | |
| Senior UI/UX Reviewer | | | |
| Scene Owner | | | |

---

## Notes for Freeze Lead
- This is a merged master checklist for Symbol Mountain only.
- Source intent merged from:
  - `FREEZE_CHECKLIST.md` (task matrix + stability expectations)
  - `VISUAL_ASSETS_AND_MECHANICS_SUPPLEMENT.md` (asset and symbol mechanic checks)
- Freeze only when all critical mechanics and resume/reload checks are green in all 4 scenes.
