# SHLOKA RIVER - MASTER FREEZE CHECKLIST (Scenes 10-14)
## Single Comprehensive Checklist (Merged from Scene Freeze + Visual Assets & Mechanics)

Purpose: One print-ready checklist to freeze all Shloka River scenes end-to-end with minimal regression risk.

Scenes covered:
- Scene 10: Vakratunda Grove (`VakratundaGroveSimplified`)
- Scene 11: Suryakoti Bank (`SuryakotiBankSimplified`)
- Scene 12: Nirvighnam Chant (`NirvighnamChantSimplified`)
- Scene 13: Sarvakaryeshu Chant (`SarvakaryeshuChantSimplified`)
- Scene 14: Shloka River Finale (`ShlokaRiverFinale`)

---

## A. MASTER GATE (MUST PASS FOR ALL 5 SCENES)

### A1. Core Freeze Tasks (from main freeze checklist)

| Task | Description | S10 | S11 | S12 | S13 | S14 | Notes |
|---|---|---|---|---|---|---|---|
| T01 | OpeningModal imported/rendered correctly | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T02 | SceneCompletionCelebration + completion modal flow | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T03 | FWKS / scene VO trigger on start or key phase | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T04 | AudioToggle wired and working | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T05 | HomeButton visible and navigates safely | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T06 | SymbolAutoReveal where applicable | [ ] | [ ] | [ ] | [ ] | [ ] | Usually N/A in Shloka River |
| T07 | Idle hint UX/VO logic | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T08 | Tab visibility pause/resume safe | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T09 | useVoiceGuidance integration stable | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T10 | First-time vs returning user behavior | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T13 | ZoneBadgeButton / zone progress control | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T19 | Image audit completed | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T20 | Responsive check / clamp style quality | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T21 | Test cases documented and replayed | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T22 | Scene-specific idle hints validated | [ ] | [ ] | [ ] | [ ] | [ ] | |

### A2. Asset Integrity (all scenes)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Zero 404 assets in DevTools Network during full run | | |
| | Background image loads correctly per scene | | |
| | Syllable audio files and full-word audio files exist and play | | |
| | Recorder/sidebar icons and UI assets render correctly | | |
| | Completion modal icons/badge assets render correctly | | |

### A3. Stability / Resume / Reload

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Tab switch away/back does not break phase state | | |
| | Resume countdown shows and then gameplay/audio recover cleanly | | |
| | Mid-scene reload restores safe phase (no stuck recorder/modal) | | |
| | No duplicate VO, hints, or timers after return/reload | | |
| | Continue button from completion lands on correct next destination | | |

---

## B. SCENE 10 - VAKRATUNDA GROVE

### B1. Visual + UI

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Vakratunda scene background and mission UI render correctly | | |
| | AppSidebar toggle icon, panel, and recorder UI render correctly | | |
| | Sanskrit cards, meaning cards, and card back states render correctly | | |
| | Mode selection UI (Auto vs Manual) is visible and tappable | | |

### B2. App Sidebar + Recorder Mechanics (from visual/mechanics supplement)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Sidebar opens/closes from icon and outside click/X | | |
| | Recorder opens from Sanskrit syllable interaction | | |
| | Mic permission request flow is handled properly | | |
| | Record/stop/playback controls work without crashing | | |
| | Pronunciation matching feedback appears (success/fail) | | |
| | Retry works after fail | | |
| | Recorder closes cleanly and returns to game state | | |

### B3. Memory/Word Mechanics

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Auto-Play mode sequence plays in correct order | | |
| | Manual card flip/match logic works correctly | | |
| | Correct pair remains revealed; wrong pair flips back | | |
| | Completion appears only after all required pairs/steps | | |

---

## C. SCENE 11 - SURYAKOTI BANK

### C1. Visual + UI

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Suryakoti + Samaprabha assets and interactive objects render correctly | | |
| | AppSidebar + recorder controls visible and responsive | | |
| | Progress indicators and counters update correctly | | |

### C2. Game + Learning Mechanics

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Suryakoti game phase starts and completes correctly | | |
| | Samaprabha game phase starts and completes correctly | | |
| | Transition between the two words is correct and stable | | |
| | Syllable learning states and memory game state persist properly | | |
| | Mission complete path triggers correct completion phase/fireworks | | |

### C3. Recorder/Audio/Resume

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Syllable play and full-word audio map correctly | | |
| | App recording save/delete workflows work | | |
| | Reload in INITIAL/ACTIVE/LEARNING/COMPLETE phases resumes correctly | | |
| | Tab switch during recording or VO returns safely without stale audio | | |

---

## D. SCENE 12 - NIRVIGHNAM CHANT

### D1. Visual + UI

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Chant scene background and interaction elements load correctly | | |
| | AppSidebar, recorder, and controls are visible and styled correctly | | |

### D2. Chant Mechanics

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Sequence/listening phase triggers correctly | | |
| | Interaction/playing phase accepts correct taps in order | | |
| | Feedback on correct/incorrect chant interaction is clear | | |
| | Completion transition and fireworks/completion modal are correct | | |

### D3. Voice + Idle + Resume

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | VO prompts are phase-accurate and not duplicated | | |
| | Idle hints in AppSidebar/game context trigger at right delay | | |
| | Resume/reload preserves progress without phase corruption | | |

---

## E. SCENE 13 - SARVAKARYESHU CHANT

### E1. Visual + UI

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Scene assets and chant UI load with no broken elements | | |
| | AppSidebar + recorder UI consistent with prior scenes | | |

### E2. Chant Mechanics

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Word/sequence logic is correct for this chant | | |
| | Tap interaction and correction flow are stable | | |
| | Correct completion condition fires once | | |
| | Completion modal navigation works correctly | | |

### E3. Voice + Idle + Resume

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | VO prompts map correctly for this chant | | |
| | Idle hints reset after interaction and do not spam | | |
| | Reload and tab return preserve valid scene state | | |

---

## F. SCENE 14 - SHLOKA RIVER FINALE

### F1. Visual + UI

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Intro/mode-select/word-select/level-select screens display correctly | | |
| | Lily pads, river stones, slots, and word cards render correctly | | |
| | Hear-word modal and highlighted syllable UI render correctly | | |

### F2. Core Mechanics (Critical)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Level 1 syllable placement works (select slot -> tap syllable) | | |
| | Used syllable prevention works and feedback is clear | | |
| | Wrong assembly feedback shows and supports correction flow | | |
| | Hear Word helper modal plays syllables in correct order | | |
| | Completed word progression to next word works correctly | | |
| | Level 2 shloka assembly with completed word cards works correctly | | |
| | Shloka completion triggers final completion flow once | | |

### F3. Audio + Completion

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Syllable audio paths map correctly for all words used | | |
| | Word-level audio triggers correctly | | |
| | Completion modal appears with correct title/subtitle/data | | |
| | End-game/onComplete routes correctly | | |

---

## G. APP SIDEBAR / RECORDER STANDARDS (Cross-scene)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Sidebar opens above gameplay with proper z-index | | |
| | Sidebar close does not lose game state | | |
| | Recorder lifecycle has no memory leak or stuck microphone state | | |
| | Failed speech match gives clear retry path | | |
| | Success path updates card/mission state correctly | | |

---

## H. FINAL SIGN-OFF

### H1. Test Matrix Completed

| Validation | Result | Notes |
|---|---|---|
| Desktop viewport tested (all 5 scenes) | [ ] | |
| Mobile viewport tested (all 5 scenes) | [ ] | |
| Audio ON/OFF tested (all 5 scenes) | [ ] | |
| Tab switch tested in early/mid/late phase of each scene | [ ] | |
| Mid-scene reload tested at least twice per scene | [ ] | |
| DevTools Console has no blocking errors | [ ] | |
| DevTools Network has zero missing critical assets | [ ] | |

### H2. Approval

| Role | Name | Date | Signature |
|---|---|---|---|
| QA Tester | | | |
| Senior UI/UX Reviewer | | | |
| Scene Owner | | | |

---

## Notes for Freeze Lead
- This is the merged Shloka River master checklist.
- Source intent merged from:
  - `FREEZE_CHECKLIST.md` (T-task matrix + stability expectations)
  - `VISUAL_ASSETS_AND_MECHANICS_SUPPLEMENT.md` (Scene 10 AppSidebar/recorder/memory checks)
- Freeze only when all critical mechanics, VO triggers, and resume/reload checks are green in all 5 scenes.
