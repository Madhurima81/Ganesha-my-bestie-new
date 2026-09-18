# Ganesha My Bestie — Implementation Tasks
## Scope cleanup: 2026-09-18 — trimmed to the 13 live scenes per CLAUDE.md (was tracking all 22, including obsolete Cave of Secrets and parked Festival Square)

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
- [x] T11 · Opening Modal → remove fade out (ONE fix in OpeningModal.css fixes all 13 live scenes)
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
- [x] T55 · Voice mute + VOReplayButton audit — checked AudioToggle (mute) and VOReplayButton
  presence/wiring across all 13 live scenes. Mute present + correctly wired everywhere; found it
  only ever silences narration/music, never SFX (`useVoiceGuidance.js`/`AudioService.js` have no
  mute-awareness by existing deliberate design — "game audio, never muted by toggle"). Decided
  with Madhurima to keep this **voice-only** (it's an in-game control for repeat players skipping
  heard narration, not a whole-app silence button — muting SFX too would flatten the replay
  feedback loop). Relabeled AudioToggle's aria-label/title from "Mute"/"Turn off sound" to
  "Turn off voice narration"/"Turn off voice" so it stops implying whole-app mute, and documented
  the voice-only decision in a code comment. Found `VOReplayButton` genuinely missing from
  ShlokaRiverFinale (12 of 13 had it) — added it, wired to a new `replayCurrentVoice` mapping all
  6 of that scene's phases to their correct VO line. See CHANGELOG 2026-09-18.
  Not yet visually verified in-browser. Possible future add (not built): a "voice on by default"
  preference in Parent Dashboard for first launch.


### Scene Behaviour & Hooks
- [x] T06 · SymbolAutoReveal
- [x] T08 · useAppVisibility.js → import and wire up in all scenes
- [x] T22 · Idle hints — Symbol Mountain, Shloka River, Cave of Secrets
- [ ] T27 · Idle hints — About Me and Festival Square
- [x] T53 · GestureDemo coverage — every non-tap mini-game (drag/hold/scratch/swipe/pull-down)
  across the 13 live scenes now shows its gesture demo at the start of the mini-game, not just
  after idle-ladder escalation. Tap mechanics intentionally left on idle-hint only (tap is
  self-explanatory). Added where missing (Tusk's BeatPlayerGame — capped to first 2 interactive
  beats so it doesn't repeat forever; GarlandGame3's garland-carry step; Drawingpad.jsx shared
  "draw your dream" component used by Favoritefoodgame + ObstacleRemoverGame). Moved off
  idle-only gating (Pond scene, KurumedevaGame). Tightened multi-second first-encounter delays
  down to ~150ms (MahakayaRescueGame, SuryakotiGame, SamaprabhaGame, NirvighnamGame,
  Wish2PlateDropGame, MyIndianStoryGame). Confirmed tap-only/nothing-to-do: Familytreegame,
  SacredAssemblySceneV8, SarvakaryeshuGame, SarvadaGame, ShlokaRiverFinale, EyesPopUpGame,
  EarsSoundMatchGame. Confirmed dead code, left alone: EarsRhythmGame, TuskAssemblyGame,
  TuskPathGame (not wired into SymbolMountainSceneV3.jsx). See CHANGELOG 2026-09-18.
  Not yet visually verified in-browser — Madhurima to spot-check on next playthrough.
- [x] T54 · 3-level idle-hint audit — audited the L1(~9s pulse)→L2(~16s stronger+VO)→L3(~24s
  most explicit) ladder across all 13 live scenes. Most already correct (shared
  `useRepeatedHintCycle` hook or an equivalent hand-rolled ladder on the same timing) —
  confirmed clean: Suryakoti/Samaprabha/Nirvighnam/Kurumedeva/Sarvakaryeshu/Sarvada games,
  Familytreegame, Favoritefoodgame, ObstacleRemoverGame, MyIndianStoryGame, Pond, Modak main
  phase, Sacred Assembly, EarsSoundMatchGame (already complete, first audit pass missed it).
  Fixed the real "zero guidance if stuck" gaps: EyesPopUpGame (was single-level, added L2 VO +
  L3 strong pulse), Tusk's shared BeatPlayerGame engine (gesture demo previously died after the
  first 2 beats — added L1/L2 pulse + L3 re-shows the demo for any later beat), GarlandGame3
  (was a single one-shot 6s intro — added a full L1/L2/L3 ladder that resets on drag attempt or
  failed drop). Removed SymbolMountainSceneV3's dead `showIdleGestureHint` state (computed,
  never rendered). See CHANGELOG 2026-09-18.
  **Follow-up (2026-09-18) — closed 2 of 3 open items:** ShlokaRiverFinale's ladder retimed to
  18s/26s to match the app norm (was 20s/35s). Deleted the orphan `enjoy/Wish2PlateDropGame.jsx`
  duplicate — confirmed `ObstacleRemoverGame.jsx` only ever imported the live copy under
  `enjoy/components/`. **VakratundaRescueGame's failed-attempt-count model left as-is —
  Madhurima confirmed it's intentionally different, not a bug.** See CHANGELOG 2026-09-18.
  Not yet visually verified in-browser.

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
- [x] T56 · Sparkle + Ganesha gesture audit — checked "does sparkle AND a Ganesha gesture
  (thumbs-up/etc.) show on completion" across all 13 live scenes. 10 of 13 already correct via
  shared `useMiniGesture`/`GaneshaGestureCue`. The 2 finale scenes (SacredAssemblySceneV8,
  ShlokaRiverFinale) intentionally skip the small per-round gesture for their bigger
  `SceneCompletionCelebration` + fireworks instead (has its own Ganesha pose) — confirmed by
  design. Found a real bug: **SymbolMountainSceneV3 (Tusk zone)** called `triggerMiniGesture()`
  5 times on eyes/ears/tusk completions into a local hand-rolled state that was never rendered
  anywhere — `GaneshaGestureCue`'s import was even commented out ("inline gesture used") with no
  actual inline render either. Sparkles fired; Ganesha's gesture never did. Fixed by switching to
  the real shared hook + component (same pattern as the other 10 scenes), converting all 5 call
  sites to the shared signature. See CHANGELOG 2026-09-18.
  Not yet visually verified in-browser — Madhurima to spot-check Eyes/Ears/Tusk completions.


### Quality & Audit
- [ ] T19 · Image Audit — list all PNG and SVG assets used per scene
- [ ] T20 · CSS Media Queries audit — check clamp() present, add where missing
- [ ] T21 · Test Cases + Edge Cases — document in TESTCASES.md
- [ ] T32 · Content Audit — refer to CONTENT.md
- [x] T52 · PNG → WebP conversion — all `.png` actually loaded by the 13 live scenes +
  onboarding/navigation chrome converted to `.webp` and references updated (see
  CHANGELOG 2026-09-18 and IMAGE_AUDIT.md). Cave-of-secrets/Festival Square PNGs and
  old backup/copy scene files intentionally left untouched — out of scope.

### Additional things
- [ ] T34 · Parent Dashboard
- [ ] T35 · DailyDare and gratitude
- [ ] T37 · Scene 20 freeze sign-off (favorite-food nav: continue + tab-switch)
- [x] T38 · Scene 21 continue/resume behavior — restart phases on continue (wish1/2/3 intro & active, dream phases)
- [x] T39 · Scene 21 voice bug fix — return hint now clears only phase-specific VO key, allows subsequent VOs to play
- [x] T40 · Scene 21 combined modal — merge "all-wishes-complete" + "dream-intro" into single modal, skip dream-intro phase, go straight to drawing
- [x] T41 · GestureDemo — cap loop to exactly 2 iterations (was infinite), hide on browser's own `animationend` instead of a fade timer
- [x] T42 · GaneshaGestureCue — add optional `anchor` `{x, y}` prop to pin the cue to a specific on-screen spot instead of only fixed item/center corners
- [x] T43 · useMiniGesture — add `anchor` param passthrough + new `hideMiniGesture()` escape hatch (e.g. for tab-hide handling)
- [x] T44 · Migrate 6 scenes off hand-rolled gesture cues onto shared `GaneshaGestureCue` + `useMiniGesture`: NewModakSceneV7, PondSceneSimplifiedV4, Familytreegame (also fixed a real bug — cue had no matching CSS before), Favoritefoodgame, ObstacleRemoverGame, MyIndianStoryGame — removed dead duplicate `character/GaneshaGestureCue.jsx`, Family Tree's commented-out `choice-thumbsup-cue` block + CSS, and orphaned per-scene gesture CSS
- [x] T45 · TuskPathGame — add GestureDemo for tap-the-correct-animal and scratch-the-obstacle steps (was missing from all 3 tusk sub-games)
- [x] T46 · ShlokaRiverFinale — wire SFX consistently with other Shloka River scenes: `playUiTap` on word pickup, `playSparkle` on every correct placement, `playSparkle`+`playChime` on the 8th/final word (matches Pond's bloom+chime pattern)
- [x] T47 · InnerMandala — earned-symbol size increased ~33% (7.2%/36px → 9.6%/48px max) and subtitle/hint text repositioned below the flower (was overlapping the lowest petal) — confirmed via DOM measurement, mobile breakpoint updated to match
- [x] T48 · CleanGameWelcomeScreen / InnerMandala — nudged avatar/monkey slot up 6px total via `.mandala-avatar-slot`
- [~] T20 · CSS media-queries audit — Zone 1 (Symbol Mountain) done: phone-landscape (915×412 / 640×360) audit + fixes in 3 shared components (SymbolSidebar, ZoneWelcome, OpeningModal) via new `@media (max-height: 480px)` blocks; verified in-browser on all 4 SM scenes (Modak, Pond, Symbol, Sacred Assembly). Portrait out of scope (rotate overlay). SceneStage NOT used by SM scenes — see DECISIONS.md #7. Zones 2–3 still pending.
- [ ] T49 · CleanGameWelcomeScreen (returning-user "Welcome Back / Continue Adventure" screen) — short-landscape (≤412px h) vertical overflow: "Continue Adventure" + Home / Switch Explorer / Start Over buttons sit below the fold, page scrolls. Flagged and deferred by TWO separate 2026-09-02 sweeps (Zone 1 CSS pilot + pre-Zone-1 onboarding). Returning families hit this every session — needs its own `@media (max-height: 480px)` pass (same pattern as ParentGate / ProfileSelector). Do before wider beta.
- [ ] T50 · Marketing landing page (`src/pages/LandingPage.jsx`, `?view=landing`) — no nav menu yet (hamburger removed until it does something). Add the trigger + a real menu together before wider launch.
- [x] T52a · SparkleAnimation glow-color bug — shared component only ever wrote `color` to
  `backgroundColor`, never to the `--sparkle-color` CSS var the glow (`box-shadow`) reads,
  so glow silently fell back to CSS defaults (gold star / PURPLE magic) regardless of the
  color prop passed — read as a muddy red blob on Tusk's `type="magic"` gold burst. Fixed
  in SparkleAnimation.jsx (one-line: set `--sparkle-color` inline) + standardized Tusk,
  Modak, and Pond's pre-reveal bursts from `type="magic"` to `type="star"` to match
  Vakratunda's canonical gold star. See CHANGELOG 2026-09-18. Not yet visually verified
  in-browser — Madhurima to confirm on next Tusk eyes-game playthrough.
- [ ] T51 · Onboarding install/hand-off scene (`CleanProfileSelector.jsx`, `PwaInstallManager.getInstallGuide`) — device-test the *install* state on real iOS Safari, iOS Chrome and Android (desktop Chrome skips it, so it was never seen live). Also verify the installed-PWA relaunch → Pick Your Friend boot on a real installed PWA. Nudge the beside-card Ganesha up a little if it reads too low.





---

## Progress Tracker

> Legend: [ ] not started · [x] done · [~] partial · [!] blocked · [--] not applicable
>
> **Scope: the 13 live scenes only** (Symbol Mountain 4 + Shloka River 5 + About Me Hut 4), per
> CLAUDE.md. Cave of Secrets (was rows 05–09, "vakratunda-mahakaya" through "final-meaning-scene")
> and Festival Square (was rows 15–18, "game1-piano" through "game4-mandap") are removed from
> active tracking — Cave of Secrets is obsolete/dead, Festival Square is parked for later. Their
> old checkbox history isn't lost, just not tracked here — see git history on this file if needed.

### Modals & UI Chrome

| # | Scene | File | T01 | T02 | T11 | T12 | T17 | T04 | T05 | T13 |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | modak | NewModakSceneV7 | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 02 | pond | PondSceneSimplifiedV4 | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 03 | symbol | SymbolMountainSceneV3 | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 04 | final-scene | SacredAssemblySceneV8 | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 05 | vakratunda-grove | VakratundaGroveSimplified | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 06 | suryakoti-bank | SuryakotiBankSimplified | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 07 | nirvighnam-chant | NirvighnamChantSimplified | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 08 | sarvakaryeshu-chant | SarvakaryeshuChantSimplified | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 09 | shloka-river-finale | ShlokaRiverFinale | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 10 | family-tree | Familytreegame | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 11 | favorite-food | Favoritefoodgame | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 12 | dreams-wishes | ObstacleRemoverGame | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |
| 13 | my-indian-story | MyIndianStoryGame | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [x] |

### Voice & Audio

| # | Scene | File | T03 | T07 | T09 | T10 | T14 | T15 | T16 |
|---|---|---|---|---|---|---|---|---|---|
| 01 | modak | NewModakSceneV7 | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 02 | pond | PondSceneSimplifiedV4 | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 03 | symbol | SymbolMountainSceneV3 | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 04 | final-scene | SacredAssemblySceneV8 | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 05 | vakratunda-grove | VakratundaGroveSimplified | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 06 | suryakoti-bank | SuryakotiBankSimplified | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 07 | nirvighnam-chant | NirvighnamChantSimplified | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 08 | sarvakaryeshu-chant | SarvakaryeshuChantSimplified | [x] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 09 | shloka-river-finale | ShlokaRiverFinale | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 10 | family-tree | Familytreegame | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 11 | favorite-food | Favoritefoodgame | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 12 | dreams-wishes | ObstacleRemoverGame | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |
| 13 | my-indian-story | MyIndianStoryGame | [ ] | [ ] | [x] | [ ] | [ ] | [ ] | [ ] |

> T14 · T15 · T16 are content creation tasks — mark [x] once files are recorded/created, not per scene.

### Scene Behaviour & Hooks

> T22 = Symbol Mountain + Shloka River (scenes 01–09) · T27 = About Me Hut (scenes 10–13)

| # | Scene | File | T06 | T08 | T22 | T27 |
|---|---|---|---|---|---|---|
| 01 | modak | NewModakSceneV7 | [ ] | [x] | [x] | [--] |
| 02 | pond | PondSceneSimplifiedV4 | [ ] | [x] | [x] | [--] |
| 03 | symbol | SymbolMountainSceneV3 | [x] | [x] | [x] | [--] |
| 04 | final-scene | SacredAssemblySceneV8 | [ ] | [x] | [x] | [--] |
| 05 | vakratunda-grove | VakratundaGroveSimplified | [ ] | [x] | [x] | [--] |
| 06 | suryakoti-bank | SuryakotiBankSimplified | [x] | [x] | [x] | [--] |
| 07 | nirvighnam-chant | NirvighnamChantSimplified | [x] | [x] | [x] | [--] |
| 08 | sarvakaryeshu-chant | SarvakaryeshuChantSimplified | [x] | [x] | [x] | [--] |
| 09 | shloka-river-finale | ShlokaRiverFinale | [ ] | [x] | [x] | [--] |
| 10 | family-tree | Familytreegame | [ ] | [x] | [--] | [ ] |
| 11 | favorite-food | Favoritefoodgame | [ ] | [x] | [--] | [ ] |
| 12 | dreams-wishes | ObstacleRemoverGame | [ ] | [x] | [--] | [ ] |
| 13 | my-indian-story | MyIndianStoryGame | [ ] | [x] | [--] | [~] |

### Ganesha & Mooshika Presence

> T18 = Symbol Mountain + Shloka River (scenes 01–09) · T28 = About Me Hut (scenes 10–13)
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
| 05 | vakratunda-grove | VakratundaGroveSimplified | [ ] | [--] |
| 06 | suryakoti-bank | SuryakotiBankSimplified | [ ] | [--] |
| 07 | nirvighnam-chant | NirvighnamChantSimplified | [ ] | [--] |
| 08 | sarvakaryeshu-chant | SarvakaryeshuChantSimplified | [ ] | [--] |
| 09 | shloka-river-finale | ShlokaRiverFinale | [ ] | [--] |
| 10 | family-tree | Familytreegame | [--] | [ ] |
| 11 | favorite-food | Favoritefoodgame | [--] | [ ] |
| 12 | dreams-wishes | ObstacleRemoverGame | [--] | [ ] |
| 13 | my-indian-story | MyIndianStoryGame | [--] | [ ] |

### Quality & Audit

| # | Scene | File | T19 | T20 | T21 |
|---|---|---|---|---|---|
| 01 | modak | NewModakSceneV7 | [ ] | [x] | [ ] |
| 02 | pond | PondSceneSimplifiedV4 | [ ] | [x] | [ ] |
| 03 | symbol | SymbolMountainSceneV3 | [ ] | [x] | [ ] |
| 04 | final-scene | SacredAssemblySceneV8 | [ ] | [x] | [ ] |
| 05 | vakratunda-grove | VakratundaGroveSimplified | [ ] | [ ] | [ ] |
| 06 | suryakoti-bank | SuryakotiBankSimplified | [ ] | [ ] | [ ] |
| 07 | nirvighnam-chant | NirvighnamChantSimplified | [ ] | [ ] | [ ] |
| 08 | sarvakaryeshu-chant | SarvakaryeshuChantSimplified | [ ] | [ ] | [ ] |
| 09 | shloka-river-finale | ShlokaRiverFinale | [ ] | [ ] | [ ] |
| 10 | family-tree | Familytreegame | [ ] | [ ] | [ ] |
| 11 | favorite-food | Favoritefoodgame | [ ] | [ ] | [ ] |
| 12 | dreams-wishes | ObstacleRemoverGame | [ ] | [ ] | [ ] |
| 13 | my-indian-story | MyIndianStoryGame | [ ] | [ ] | [ ] |

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

**Cave of Secrets — OBSOLETE, excluded from all work per CLAUDE.md.** (Old checklist for this
zone removed here; see git history if it's ever needed for reference.)

**Shloka River**
- Scene 1 Vakratunda Grove: Idle hints already inline; do not duplicate
- Scene 2 Suryakoti Bank: IdleHint on AppSidebar; reset on app + hint btn
- Scene 3 Nirvighnam Chant: IdleHint on AppSidebar; reset on app + hint btn
- Scene 4 Sarvakaryeshu Chant: IdleHint on AppSidebar; reset on app click
- Scene 5 Finale: no IdleHint required

**Festival Square — PARKED, not in current scope per CLAUDE.md.** Has scene code in the repo but
is not being built/audited proactively — ask before touching. (Old checklist kept only as a note
that this section still exists for whenever this zone is picked back up.)

**About Me Hut**
- Scenes 1-4: Opening/Completion/Audio/Home/Badge wired

