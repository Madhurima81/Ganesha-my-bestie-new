# SHLOKA RIVER — MASTER QA HARNESS CHECKLIST (Scenes 10–14)

## Rewritten 2026-09-27 — the previous version of this file was stale/wrong
The prior checklist described a card-matching + mic-recorder architecture
("Sanskrit cards, meaning cards, card back states", "Recorder opens from
Sanskrit syllable interaction", "Mic permission request flow", "Auto-Play
mode sequence") for Scene 10, and generic "chant tap sequence" mechanics for
Scenes 12–13. **That is not what these scenes do today.** There is no
recorder/mic mechanic anywhere in Shloka River, and each of Scenes 10–13
is actually two back-to-back sub-games, not one. This rewrite is based on
`git log` (commits through `1273269f`, 2026-09-27) and `CHANGELOG.md`
entries from 2026-08-21 through 2026-09-26. All Pass/Fail cells are reset
to `[ ]` — the previous checkmarks were validating the wrong mechanic and
cannot be trusted.

Scenes covered (each = word intro + a mechanic sub-game):
- **Scene 10:** Vakratunda word intro (`VakratundaGroveSimplified.jsx`) → Mahakaya Rescue (`MahakayaRescueGame.jsx`)
- **Scene 11:** Suryakoti Bank (`SuryakotiBankSimplified.jsx`) → Samaprabha hold-game (`components/SamaprabhaGame.jsx`)
- **Scene 12:** Nirvighnam Chant (`NirvighnamGame.jsx`) → Kuru Me Deva bridge (`KurumedevaGame.jsx`)
- **Scene 13:** Sarvakaryeshu (`SarvakaryeshuGame.jsx`) → Sarvada tap-to-find (`SarvadaGame.jsx`)
- **Scene 14:** Shloka River Finale — boat-drag word assembly (`ShlokaRiverFinale.jsx`)

Harness access: `?game=vakratunda|mahakaya|suryakoti|samaprabha|nirvighnam|kurumedeva|sarvakaryeshu|sarvada` (see `src/dev/GameTestHarness.jsx`); Finale is tested end-to-end in the live zone, not via a single harness key.

---

## A. MASTER GATE (MUST PASS FOR ALL SCENES/SUB-GAMES)

### A1. Core Freeze Tasks

| Task | Description | S10 | S11 | S12 | S13 | S14 | Notes |
|---|---|---|---|---|---|---|---|
| T01 | OpeningModal imported/rendered correctly | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T02 | SceneCompletionCelebration + completion modal flow | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T03 | Scene VO triggers on start / phase change, no dupes | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T04 | AudioToggle wired and working | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T05 | HomeButton / BackToMapButton visible and navigates safely | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T07 | Idle hint ladder matches the locked spec per mechanic (see B–F) | [ ] | [ ] | [ ] | [ ] | [ ] | Hint timings differ per sub-game — see per-scene tables, not a single shared ladder |
| T08 | Tab visibility pause/resume safe (no stuck timers/VO after return) | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T09 | useVoiceGuidance integration stable, no dead VO keys | [ ] | [ ] | [ ] | [ ] | [ ] | Check `voiceGuidance.js` + local `webSpeechMap` fallback are in sync — mismatches here caused real bugs in Sept 2026 |
| T10 | First-time vs returning user behavior | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T13 | ZoneBadgeButton / zone progress control | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T19 | Image audit completed (incl. new Samaprabha assets: fawn-walk-new, reveal-branch-new, reveal-rock-new) | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T20 | Responsive check / clamp() style quality — no fixed-px `!important` overrides (CLAUDE.md rule) | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T21 | Test cases documented and replayed | [ ] | [ ] | [ ] | [ ] | [ ] | |
| T22 | Wrong-action feedback is gentle, never a hard fail state | [ ] | [ ] | [ ] | [ ] | [ ] | Per CLAUDE.md Child UX Rules — never punish wrong answers |

### A2. Asset Integrity (all scenes)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Zero 404 assets in DevTools Network during full run | | |
| | Background image loads correctly per scene | | |
| | Syllable/word audio files exist and play (Vakratunda, Suryakoti, Samaprabha, Nirvighnam, Kuru Me Deva, Sarvakaryeshu, Sarvada success lines) | | |
| | New content-only VO keys not yet recorded fall back to TTS/Web Speech cleanly (no silence, no crash) — currently true for Mahakaya's `scene10_maha_drag_water` / `scene10_maha_place_here` | | |
| | Completion modal icons/badge assets render correctly | | |

### A3. Stability / Resume / Reload

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Tab switch away/back does not break phase state or restart a hint timer twice | | |
| | Mid-scene reload restores a safe phase (no stuck drag ghost / half-open modal) | | |
| | No duplicate VO, hints, or timers after return/reload | | |
| | Continue button from completion lands on correct next destination | | |

---

## B. SCENE 10 — VAKRATUNDA (word intro) → MAHAKAYA RESCUE

### B1. Vakratunda word intro (`VakratundaGroveSimplified.jsx`)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Word intro/teaching beat plays before handoff to Mahakaya Rescue | | |
| | Frog collision/blocking system works; 3-bump trigger fires `softWrong` only (no red X) | | |
| | Reactive stuck escalation fires at 6s/12s after a blocked attempt | | |
| | Passive no-interaction nudge fires at 10s (lowered from 18s on 2026-09-26) | | |
| | Stuck L2 hint line is "Try going around it." (locked copy) | | |

### B2. Mahakaya Rescue (`MahakayaRescueGame.jsx`) — direct drag-and-drop, NOT the old rope-pull rig

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | **No rope/knob/pull-handle UI exists** — rig was fully removed 2026-09-26; flag as a regression if it reappears | | |
| | Child can drag each waiting log straight into its raft's water dropzone | | |
| | Idle-hint ladder is per-log 10s/18s/26s, restarting fresh each round (keyed on `activeLog`) | | |
| | Log 1 gets an immediate one-time teaching cue: single `drag` gesture demo, log → dropzone, no VO | | |
| | L1 hint (10s) is visual-only: log nudge + a broad, blurred, "breathing" dropzone — NOT the exact target shape, and hidden entirely before L1 | | |
| | L2 hint (18s) sharpens the dropzone to its exact "clear" shape + VO "Drag the log into the water." | | |
| | L3 hint (26s) shows the full gesture demo + VO "Put the log here." | | |
| | Wrong/missed drop: log bounces briefly in place then slides back to the bank — no sound, no VO, no red X | | |
| | 1st–2nd miss stays visual-only; from the 2nd consecutive miss, dropzone/gesture escalate to L2-style clarity early, independent of the timer (spoken lines do NOT pull forward) | | |
| | VO keys `scene10_maha_drag_water` / `scene10_maha_place_here` fire correctly; obsolete keys `scene10_maha_blocking` / `scene10_maha_drag_rope` / `scene10_maha_pull_down` are gone from both `voiceGuidance.js` and the local Web Speech fallback map | | |
| | Replay-voice button in the parent scene does not reference a dead VO key | | |

---

## C. SCENE 11 — SURYAKOTI BANK → SAMAPRABHA

### C1. Suryakoti Bank (`SuryakotiBankSimplified.jsx`)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Suryakoti phase starts and completes correctly, hands off to Samaprabha | | |
| | Progress indicators/counters update correctly | | |
| | Reload in INITIAL/ACTIVE/COMPLETE phases resumes correctly | | |

### C2. Samaprabha (`components/SamaprabhaGame.jsx`) — hold-gesture clue game

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Hold-to-reveal mechanic works on each clue (branch, rock, walking fawn) | | |
| | Incomplete hold (child releases early) drains the visible hold ring smoothly — no wrong counter, no wrong VO, no shake/rejection state (2026-09-26 fix) | | |
| | New assets render correctly: branch reveal, rock reveal, walking-deer images (`fawn-walk-new.png`, `reveal-branch-new.png`, `reveal-rock-new.png`) | | |
| | Layout-panel controls for `Reveal: Branch`, `Reveal: Rock`, `Fawn Start`, `Fawn Walk Target` (position/size/rotation/flip/scale) work and persist — walking-deer position is no longer hardcoded in CSS | | |
| | Mission-complete path triggers the correct completion phase/fireworks | | |

---

## D. SCENE 12 — NIRVIGHNAM CHANT → KURU ME DEVA BRIDGE

### D1. Nirvighnam (`NirvighnamGame.jsx`) — drag branch / swipe reeds obstacle game, NOT a tap-sequence chant

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Branch-drag and reed-swipe obstacles both function as drag/swipe gestures (this is not "listen then tap in order" — correct that framing if it's still assumed anywhere) | | |
| | Wrong branch drop visibly lands, pauses briefly, then returns smoothly (2026-09-26) | | |
| | Repeated wrong branch drops trigger the existing branch hint | | |
| | Mostly-vertical reed swipes get a gentle resistance nudge; repeated vertical swipes trigger the existing reeds hint | | |
| | Rock obstacle behavior and generic wrong-SFX/VO are unchanged from before this pass | | |
| | Level-3 "keep going" VO fires correctly (per T53 fix) | | |
| | Closing line is "Nirvighnam! You cleared the way and helped Turtle through" → affirmation "I can solve one thing at a time." | | |

### D2. Kuru Me Deva bridge (`KurumedevaGame.jsx`) — 3-stage ask-for-help mechanic, NOT a chant/tap game

This entire sub-game was rebuilt (commits `3d3328e9` → `948a459d` → `d56a4d30`). The old checklist's "chant tap sequence" framing does not apply here at all.

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Opening beat shows the broken bridge (not a pre-fixed one) | | |
| | Beat order is: Beaver tries and fails → asks for help → two ask-for-help helper loops → bridge completes — confirm there is NO third helper (explicitly removed) | | |
| | Log-try beat is a press-and-hold gesture, not a tap | | |
| | Bridge/log drag uses the bendable SVG rope, not the old rigid rope-tie | | |
| | Visible drop zone shows for the log-drag round | | |
| | Teaching gestures only appear for genuinely new mechanics — not repeated for moves the child already learned (locked decision, `d56a4d30`) | | |
| | Hint system is mechanic-specific (log-try hint vs. ask-for-help hint), not a single generic pulsing hint (`9e1f6ee7`) | | |
| | 5 `playSceneLine` VO calls per helper round fire at the right beats, matching the local `webSpeechMap` fallback | | |
| | Bridge-stage art maps to the correct stage (no doubling/mismatch — was a real bug, `00a5c2f1`) | | |
| | Opening line is "Baby Beaver is across the broken bridge..."; closing line is "Kuru Me Deva! You asked for help and finished the bridge" → affirmation "I can ask for help..." | | |

---

## E. SCENE 13 — SARVAKARYESHU → SARVADA

### E1. Sarvakaryeshu (`SarvakaryeshuGame.jsx`)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Word/sequence logic correct, hands off to Sarvada cleanly | | |
| | Reload and tab return preserve valid scene state | | |

### E2. Sarvada (`SarvadaGame.jsx`) — tap-to-find symbol game, NOT a chant

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Tap-to-find mechanic works across all target symbols | | |
| | A missed tap shows a small neutral ripple exactly at the tap point (2026-09-26) — no shake/VO/red/penalty | | |
| | Correct-tap completion condition fires once | | |
| | Completion modal navigation works correctly | | |
| | Existing hint ladder untouched by the ripple change — verify it's still the previously locked version | | |

---

## F. SCENE 14 — SHLOKA RIVER FINALE

### F1. Visual + UI

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Intro/mode-select/word-select/level-select screens display correctly | | |
| | Boats, river slots, and word cards render correctly | | |
| | Hear-word modal and highlighted syllable UI render correctly | | |

### F2. Core Mechanics — drag-the-boat-into-slot (Critical)

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Level 1 boat-to-slot placement works | | |
| | Wrong boat into the active slot: sound is `softWrong` (softened from `wrong` on 2026-09-26); wobble-then-clear behavior unchanged — this is a memory-order game, not a failure state | | |
| | Tray boat is never removed on pickup, so a missed boat is immediately available to retry | | |
| | Drop released outside the target slot: ghost briefly "lands" at the release point with a small bounce, then shrinks/fades back — no VO, no red, no penalty (2026-09-26) | | |
| | Repeated misses still escalate through the existing hint ladder (left untouched) | | |
| | Hear Word helper modal plays syllables/words in correct order | | |
| | Level 2 shloka assembly with completed word cards works correctly | | |
| | Shloka completion triggers the final completion flow once | | |

### F3. Audio + Completion

| # | Check | Pass/Fail | Notes |
|---|---|---|---|
| | Word-level audio triggers correctly for all words used | | |
| | Completion modal appears with correct title/subtitle/data | | |
| | End-game/onComplete routes correctly | | |

---

## G. CROSS-SCENE CONTENT LOCKS (verify, don't re-litigate)

All 8 Shloka River word success lines are locked to a "success VO → affirmation VO" structure — do not propose new copy without Madhurima's sign-off:

| Word | Success → Affirmation |
|---|---|
| Vakratunda | (locked, matches Mahakaya already) |
| Mahakaya | (already matched before the lock pass) |
| Suryakoti | locked |
| Samaprabha | locked |
| Nirvighnam | "Nirvighnam! You cleared the way and helped Turtle through" → "I can solve one thing at a time." |
| Kuru Me Deva | "Kuru Me Deva! You asked for help and finished the bridge" → "I can ask for help..." |
| Sarvakaryeshu | locked |
| Sarvada | locked (extra reflection-line path was dropped — only success → affirmation, fireworks VO handles the wrap) |

---

## H. FINAL SIGN-OFF

### H1. Test Matrix Completed

| Validation | Result | Notes |
|---|---|---|
| Desktop viewport tested (all 5 scenes, all 8 sub-games) | [ ] | |
| Mobile viewport tested (all 5 scenes, all 8 sub-games) | [ ] | |
| Audio ON/OFF tested (all 5 scenes) | [ ] | |
| Tab switch tested in early/mid/late phase of each sub-game | [ ] | |
| Mid-scene reload tested at least twice per scene | [ ] | |
| DevTools Console has no blocking errors | [ ] | |
| DevTools Network has zero missing critical assets | [ ] | |
| Mahakaya Rescue drop-distance threshold and broad→clear dropzone feel reviewed live by Madhurima (flagged open as of 2026-09-26) | [ ] | |

### H2. Approval

| Role | Name | Date | Signature |
|---|---|---|---|
| QA Tester | | | |
| Senior UI/UX Reviewer | | | |
| Scene Owner | | | |

---

## Notes for Freeze Lead
- This checklist was rewritten 2026-09-27 against actual `git log`/`CHANGELOG.md` state, replacing a version that still described a recorder/mic/card-matching architecture and generic chant-tap mechanics that no longer exist in this zone.
- Each of Scenes 10–13 is two sub-games back to back — test and sign off on both halves separately (see sections B–E).
- Kuru Me Deva ("Guru Maharaja") is the most-changed sub-game in the zone: a full 3-stage ask-for-help bridge rebuild, not a chant. Do not reuse old Kurumedeva test notes.
- If any future session touches these scenes again, re-diff this file against `CHANGELOG.md` before trusting its Pass/Fail state — it goes stale fast.
