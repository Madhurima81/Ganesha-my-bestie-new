# GMB Pre-Launch Audit — Consolidated Punch List
_Generated from the 4-zone Claude Code audit (Symbol Mountain, Shloka River, About Me Hut, Opening Scenes) run against `CLAUDE_CODE_PROMPT.md` / `GMB_COMPREHENSIVE_CHECKLIST.html`._
_Updated 2026-09-18 — folded in a fresh 13-scene checklist re-sweep (3 background agents, one per zone) run against this same document. New items are marked "(2026-09-18)"._
_Updated 2026-09-19 — folded in a shared-layer bug sweep (audited App.jsx/GameStateManager/ProgressManager/useVoiceGuidance/SoundManager/SceneCompletionCelebration instead of just the 13 scene files), item B's remaining touch-target fixes, and a live-browser pass on several scenes. Full detail for each fix lives in `CHANGELOG.md`'s 2026-09-18 entries; this section is the condensed cross-reference. Anything not explicitly listed as fixed/still-open below has not changed since the last update._
_Updated 2026-09-19 (later same day) — folded in the finalized content/VO pass across all 13 live scenes plus the Modak emotion redesign. Everything below "🚧 Sign-off blockers" is what's left before this pass can be called fully done — read that section first._

## 🚧 Sign-off blockers — content/VO pass (2026-09-19)
Full detail for each item lives in `CHANGELOG.md` (search "2026-09-19") and `TASKS.md` (T57/T58/T59). This is the condensed "what's actually left" list.

**Manual/live-browser verification needed** — nothing here failed a check; these just haven't been click-tested end-to-end, either because the automation tooling can't hold a pointer down for a timed press-and-hold, or because testing priority went elsewhere this session:
- [x] **Pond (Trunk + Lotus)** — re-verified live 2026-09-20/21: water-flow visual redesign, flower vanish/hit-zone bugs, and the success→affirmation VO cleanup all confirmed working in-browser. Still open: the rock hold and lotus-bloom hold gestures themselves weren't click-tested (timed press-and-hold, same automation limit as below) — visuals/VO around them are confirmed, the hold mechanic itself is not.
- [ ] **Kuru Me Deva (Shloka River Scene 3)** — the 5 new per-round hint lines (T57) render and enter cleanly with no console errors, but the actual timed beats — logs fail-after-hold, rope fail-after-hold — were only code-reviewed, not clicked through.
- [x] **Modak Game 2 entry VO** (2026-09-21) — found and fixed live: 2-3 stray VO lines were stacking at Game 2 start (`mudStart` + `VO.open` + `bushStart`); trimmed to one line per Madhurima's what's-happening→why→action pattern. Also found and fixed a real bug during this same test: the branch challenge's instruction line was silently never playing (a self-cancelling effect) — fixed and reverified live, line now plays correctly.
- [ ] **Modak Big Belly, branch + marsh challenges — the hold gestures themselves** — leaves/bush success (`pleased`) was click-tested live and confirmed working; branch's *entry VO* is now confirmed live too (see above). Still open: the actual press-and-hold to complete branch (`excited`) and marsh/crossing (`relieved`) need a real timed hold and were only code-reviewed + asset-load-verified, not clicked through.
- [x] **Sarvakaryeshu's new `gameplayIntro` VO / full Scene 4 flow** — live-tested 2026-09-21 via a new `sr-sarvakaryeshu` harness entry (opening modal confirmed rendering) and the standalone `SarvakaryeshuGame`/`SarvadaGame` mini-games with real TTS audio: situation cards, hints, correct/incorrect picks, card-to-card transitions, and the final success lines all confirmed correct with no stray/duplicate VO. (Also fixed a stale dev-only test script — `src/dev/webSpeechScripts.js` — that had been playing outdated Sarvakaryeshu lines during harness testing; production code was never affected.)
- [ ] **Samaprabha game flow and element positions** — general flow/layout check requested; not yet scoped or reviewed this pass.

**Known content gaps, not blocking but should be a conscious decision, not an oversight:**
- [ ] New Modak emotion `.png` fallbacks (`emotion-pleased/excited/relieved-game3.png`) are 139-218KB, notably larger than the existing set's 30-44KB — the app only ever loads the `.webp` versions so this doesn't affect runtime, but the pngs could use a proper compression pass (`pngquant`/`sharp`) if the fallback path ever matters.

**Not part of this pass, flagged for awareness only:**
- [ ] A separate, apparently still-in-progress Tusk-flow update (`TuskBeatPlayerLive.jsx`, `GameTestHarness.jsx`, new `tusk-nest` assets/`tuskNestFlow.json`) is sitting uncommitted in the working tree. Not touched or reviewed as part of this pass — whoever owns that thread should pick it back up.

## ✅ Shared-layer bugs fixed 2026-09-19 (see CHANGELOG.md for full detail per commit)
These live in code every one of the 13 scenes inherits from, so the per-scene "13/13 pass" reports on VO teardown/tab-hide/reload were structurally blind to them — a real gap in how the audit was scoped, not just missed bugs.

- **`useVoiceGuidance.js`** — tab-return replay was a bare unstored `setTimeout`; a quick Home tap within ~2s of returning to the tab could start the old scene's VO over Zone Welcome. Now tracked in a ref, cleared on stop/unmount. (commit `ae2c7be`)
- **`useVoiceGuidance.js`** — the TTS fallback path left `voiceRef` null, so hiding the tab never cancelled speech or recorded it for replay; TTS kept talking in the background and its `onend` could silently advance the scene while hidden. Fixed with a tracked utterance ref. (commit `ae2c7be`)
- **`SoundManager.js`** — only resumed an AudioContext from `suspended`; iOS Safari reports `interrupted` after Siri/calls/Control Center with no visibilitychange, leaving every Web Audio SFX silent until reload. Now resumes from either state. (commit `ae2c7be`)
- **`SceneCompletionCelebration.jsx`** — no double-tap guard on any action button; a fast second tap during the 700ms exit animation could queue the completion handler twice. Added an action lock mirroring HomeButton's pattern. (commit `ae2c7be`)
- **`SceneCompletionCelebration.jsx`** — the completion-save effect keyed on `completionData` identity, and 11 of 13 scenes pass it as a fresh object literal each render, so it re-ran on every parent re-render while the modal was open (fireworks, etc.). Now dedupes on the stringified payload per show cycle. (commit `ecd79a5`)
- **`GarlandGame3.jsx`, `FlowerJourneyGame2.jsx`, `EarsSoundMatchGame.jsx`** — these three call `window.speechSynthesis` directly instead of going through `useVoiceGuidance`, so the tab-hide fix above didn't reach them. Each now wired into `useAppVisibility` the same way. `TuskPathGame.jsx` also speaks directly but isn't imported by the live Tusk scene — left alone. (commit `ecd79a5`)
- **App.jsx, GameStateManager.js, ProgressManager.jsx** — the "no ungated console.log" rule had only ever been applied to the 13 scene files. All line-start `console.log/warn/debug` in these 3 shared files now gated behind `import.meta.env.DEV` (71/52/12 lines respectively). Side benefit: `GameStateManager.saveGameState`'s `new Error().stack` caller trace now only runs in dev instead of on every progress write. (commit `0260843`)
- **`SymbolMountainSceneV3.jsx`** — `triggerMiniGesture` was firing into a local hand-rolled `miniGesture` state that was never rendered anywhere (the shared `GaneshaGestureCue` import was commented out with no inline replacement) — Ganesha's gesture cue never appeared on eyes/ears/tusk completions in the Tusk zone, though sparkles fired correctly. Replaced with the real shared `useMiniGesture`/`GaneshaGestureCue` pattern used everywhere else. Confirmed already committed and present in code.
- **`AudioToggle.jsx` + `ShlokaRiverFinale.jsx`** — mute button's label/icon implied a whole-app mute, but it only ever silences voice (SFX intentionally stays on by design — discussed with Madhurima, keeping it voice-only so replay still feels rewarding). Relabeled to "Turn off/on voice narration" and documented the decision inline. Separately, `ShlokaRiverFinale` was the one live scene missing a `VOReplayButton` (12 of 13 had it) — added, wired to a 6-phase replay map. Confirmed already committed and present in code.

## 🔧 Downgraded from "bug" to "confirmed non-issue" (2026-09-19)
- **Completion `Continue` clearing the next scene's `_state` key** (previously listed as an actionable finding) — traced end-to-end with Madhurima. Replaying a scene restarts gameplay from the beginning regardless, which is the intended behavior, and the Map/Zone Welcome screens read a separate completed-flag record that `Continue` never touches — so nothing is actually lost from the child or parent's perspective. What gets cleared is an internal session label only. No fix needed, not re-opening this.

## Item B — touch-target and comparison-card fixes (2026-09-19, commit `9dc6c95`)
- `Familytreegame.css` — Continue button now keeps a 60px+ touch target in landscape
- `DreamsWishesGame.css` — intro button's tablet-width min-height raised slightly
- `Favoritefoodgame.jsx` — color-swatch sizing uses `clamp()` instead of fixed px (was overflowing the comparison-card column on iPad)
- `MyIndianStoryGame.jsx` — language/festival icon sizing uses `clamp()`, same fix
- Pond's equivalent reed-drag-target fix is still sitting uncommitted in Madhurima's active `PondScene.css` WIP — not yet landed.

## 🔍 Live-browser pass progress (2026-09-19, checklist §17/§8)
Spot-checked at the two extreme required viewports (`667×375` and `1366×1024`) via the `game-test.html` harness, real audio on:
- **Sacred Assembly** — opening modal and in-progress gameplay clean at both extremes. Did not reach the fully-assembled overlay state (debug quick-place controls kept re-showing the same reveal card instead of advancing) — that state still needs a real playthrough check, which will happen naturally when the held `!important`→`clamp()` conversion below gets its required visual verification.
- **Vakratunda Grove** — clean at both extremes.
- **Suryakoti Bank** — clean; the only visual artifact was the harness's own dev toolbar eating vertical space at the small viewport, not a real bug.
- **Shloka River Finale** — clean at `1366×1024` with the full 8-boat word tray visible. At `667×375` the harness showed the tray clipped, but this is very likely the same harness-toolbar overhead (the scene uses a full-height layout that would have that space back in real production) — flagged for a quick real-device/full-flow confirmation rather than treated as a confirmed bug.
- **Modak** (from an earlier pass) — full flow, all 5 required viewports, clean.
- **Family Tree** (from an earlier pass) — 2 viewports; found and fixed the progress-hearts clipping at `1024×768` (removed entirely, see below).
- **Not yet live-tested this pass:** Pond, Tusk/Symbol (functionally spot-checked only, not viewport-verified), Nirvighnam Chant, Sarvakaryeshu Chant, Favorite Food, Dreams & Wishes, My Indian Story.

## ✅ Family Tree hearts progress row removed (2026-09-19, commit `b92872a`)
Was clipped off-screen at iPad landscape (`1024×768`) and no longer matched the current tree-building design (leftover from an earlier quiz-style version). Removed rather than repositioned, per Madhurima.

## ✅ About Me Hut scene names finalized and wired everywhere (2026-09-19, commits `36bb340`, `e3782bb`, `ecd79a5`)
Final child-facing names (Our Families → Our Favorite Things → Our Wishes & Dreams → My Indian Story, plus all Symbol Mountain/Shloka River names) are now live in: `ZoneConfig.js` (map cards), each scene's `sceneName`/`nextSceneName` completion props, and `ProgressManager.SCENE_METADATA`'s About Me Hut keys (renamed from stale `game1`-`game4` placeholders to the real scene IDs — this resolves the judgment-call item below). `maxStars` values in that metadata were deliberately left unchanged since they're not displayed anywhere live.

## ✅ Fixed this session (applied directly to files)

### Section 3 — Completion & Progress (2026-09-18, new checklist run)
- `PondSceneSimplifiedV4.jsx` — `persistPondCompletion()` had no dedupe guard and
  was called from two sites (fireworks-finish effect + Continue button), double-
  saving/double-unlocking on every normal playthrough. Added a `pondCompletionSavedRef`
  guard, reset on both replay paths.
- `ProgressManager.jsx` — `ZONE_CONFIG['about-me-hut'].scenes` had stale placeholder
  IDs (`game1`-`game4`) instead of the real `family-tree`/`favorite-food`/
  `dreams-wishes`/`my-indian-story`, so the "auto-unlock next scene" block wrote to
  a phantom key and never unlocked correctly by this path (harmless in practice —
  `ZoneWelcome` has a separate completed-flag fallback that did the real work).
  Corrected to the real scene IDs.
- All other 11 of 13 scenes confirmed clean on saves-once/persistence/unlock-next/
  replay/continue/reload — see full table in session transcript, not duplicated here.

### Opening Scenes (16 of 18 items resolved)
- Resume-hijack: malformed localStorage JSON no longer overrides navigation — `CleanGameWelcomeScreen.jsx`
- Fake-petal-1 fallback removed for brand-new profiles — `CleanGameWelcomeScreen.jsx`
- Dead `getOuterPetalStatesFromSymbols` deleted — `CleanGameWelcomeScreen.jsx`
- Petal-state strings standardized to `'awakened'` — `CleanGameWelcomeScreen.jsx`
- Long-press-to-delete no longer accidentally launches the game (stale closure → ref guard) — `CleanProfileSelector.jsx`
- Confetti DOM-leak fixed with a properly tracked ref timeout — `ZoneWelcome.jsx`
- Ambient-audio-in-modal, map/ZoneWelcome completion disagreement, `loadSavedProps` merge, MapEditor DEV-gating, `getSceneStatus` memoization, console.log gating, `.replaceAll` fix, GaneshaIntroStory VO captions/replay/back-nav — all confirmed already fixed from an earlier interrupted pass

### Symbol Mountain
- console.log spam gated behind `import.meta.env.DEV` — `PondSceneSimplifiedV4.jsx`, `SymbolMountainSceneV3.jsx`, `SacredAssemblySceneV8.jsx`
- Confirmed already resolved on disk (no action needed): "Test Tusk" debug button, 130px `!important` modak override, 44%→30% basket-modak-top fix

### Shloka River
- (2026-09-18) **`SamaprabhaGame.jsx`** — 2 ungated debug-panel-only console calls
  (`loadDebugLayout` catch block, line 111; `copyDebugLayout`, line 584) → gated
  both behind `import.meta.env.DEV`. Build-verified.
- `NirvighnamChantSimplified.jsx:460` — dead-lettered reload-recovery effect referencing nonexistent `PHASES.SCENE_COMPLETE` → corrected to `PHASES.COMPLETE`
- Confirmed `SarvakaryeshuChantSimplified.jsx` fireworks-replay-on-reload already correct
- **MahakayaRescueGame.jsx confirmed fully compliant** — pause/drag cleanup, `maxLockedRef` guard, dual-flag completion guard, hint gating all already correct, no fixes needed
- (2026-09-18) **`KurumedevaGame.jsx`** — debug-toggle button had no `DEBUG_UI_ENABLED` gate (any child could tap it mid-gameplay and open the layout-editing panel) → gated behind `DEBUG_UI_ENABLED`. Piece-drag/help-drag state had no `isPaused`-triggered cleanup (only native `pointercancel`) → added a `useEffect` that clears both on pause without touching `helpDelivered`. Build-verified, **committed in `b5e8abd`**.
- (2026-09-18) **`BeatPlayerGame.jsx`** (shared engine, used by Tusk) — press-hold RAF loop wasn't cancelled on `onPointerCancel`, and the existing `isPaused` guard only covered the timer-driven beat timeline, never the hold RAF → `cancelHold()` now called from both. **Committed in `b5e8abd`**.
- (2026-09-18) **`TuskBeatPlayerLive.jsx`** — accepted an `isPaused` prop but nothing fed it (tab-hide didn't pause the RAF loops) → wired `isPaused` via `useAppVisibility`. **Committed in `b5e8abd`**.
- (2026-09-18) **`ShlokaRiverFinale.jsx`** — freshly audited, fully clean (pointercancel coverage, 60px touch targets via a global min-width/min-height rule, no console.log/debug/GameCoach issues). No changes needed.
- (2026-09-18, checklist re-sweep round 2) **`SymbolMountainScene.css:791`** — stray `Arial, sans-serif` → changed to `'Nunito', sans-serif`.
- (2026-09-18, round 2) **`SymbolMountainScene.css:657,681,686`** — `.eyes-symbol-container`/`.ears-symbol-container` no longer dip below 60px at either mobile breakpoint (were 45px/35px/50px height).
- (2026-09-18, round 2) **`SuryakotiBankSimplified.css:8`** — background `#f1e7fc` → `#E8F5E9` (zone palette).
- (2026-09-18, round 2) **`SarvakaryeshuChantSimplified.css:8`** — background `#fff8e1` → `#E8F5E9` (zone palette).
- (2026-09-18, round 2) **`VakratundaGroveSimplified.css:10-12`** — deleted stale/unused `--color-primary`/`--color-secondary`/`--color-accent` root vars (confirmed zero references anywhere in the file before deleting).
- (2026-09-18, round 2) **`VakratundaRescueGame.jsx:700`, `MahakayaRescueGame.jsx:479`** — debug-panel clipboard-fallback `console.log` calls gated behind `import.meta.env.DEV`.
- (2026-09-18, round 2) **`NirvighnamGame.jsx:79,691`, `KurumedevaGame.jsx:1257`** — same DEV-gate applied to 3 more debug-panel `console.log`/`console.warn` calls found via a targeted re-check.
- (2026-09-18, round 2) **`SamaprabhaGame.jsx:111,584`** — 2 ungated debug-panel-only `console.log` calls gated behind `import.meta.env.DEV`.

### About Me Hut
- **Family Tree soft-lock root cause found & fixed**: `.family-tree-end-game-btn` had `transform: translateY(52px) !important` pushing it off-screen — `Familytreegame.css:5150`
- Double-navigation bug on back button fixed — `Familytreegame.jsx:1436`
- Portrait 55vh/45vh fixed floors → `clamp()` — `Familytreegame.css:5092,5101`
- Wrong CSS selector on portrait continue-button query corrected — `Familytreegame.css:5141`
- console.log gated behind DEV — `Familytreegame.jsx`, `Favoritefoodgame.jsx`
- (2026-09-18) **`FreeDraggableItem.jsx`** (shared component; blast-radius audit confirmed its
  only live consumer is `MyIndianStoryGame.jsx`'s magnifying-glass drag, no call-site
  compensation) — no `touchcancel` handling and no mid-drag abort when `disabled` flips
  true → added `touchcancel` listener (mirrors `touchend`) and a `disabled`-triggered
  self-terminate effect that clears drag state and fires `onDragEnd`. Build-verified.

## ⏭️ Confirmed not applicable / already correct (checklist is stale here)
- **Obstacle Remover (Scene 21)** — the file was redesigned into a "Dreams & Wishes" game at some point; the obstacle-grid, wrong-guess-card, and tray mechanics from the original checklist no longer exist. Cancel-path and completion-persistence already work correctly in the current version.
- **MyIndianStoryGame (Scene 22)** — no form/submit mechanic exists matching "form submit broken"; checklist item doesn't apply to current implementation.
- Symbol Mountain: 2 originally-listed blockers already resolved (see above)
- About Me Hut: Family Tree `culturalData` etc. dead-code claims were false positives — not actually dead
- (2026-09-18) **Shloka River — `SarvakaryeshuGame.jsx` / `SarvadaGame.jsx` "ungated console.log"
  reported by the resweep agent was a false positive.** The agent audited the dead duplicate
  files at `scene4/components/SarvakaryeshuGame.jsx` / `scene4/components/SarvadaGame.jsx`.
  The actual live files (`scene4/SarvakaryeshuGame.jsx`, `scene4/SarvadaGame.jsx`, imported by
  `SarvakaryeshuChantSimplified.jsx` via `'./SarvakaryeshuGame'` / `'./SarvadaGame'` with no
  `components/` prefix) have zero console.log calls — confirmed clean, no fix needed. Nothing
  imports the `components/` duplicates anywhere in the repo (verified by repo-wide grep).
- (2026-09-18) **About Me Hut — `Favoritefoodgame.jsx:800` "unguarded console.log" in the
  existing punchlist did not reproduce.** That line is already wrapped in
  `if (import.meta.env.DEV) { ... }`. Either already fixed in an earlier session or the
  original line reference was off — no action needed.

## 🔴 Needs YOUR decision (design/content judgment calls, not bugs to fix blindly)

| Zone | Item | Location |
|---|---|---|
| Opening | Unlock-dot threshold shows `>= 2` but actual unlock is `>= 1` — code has a comment suggesting this was deliberate. Confirm intentional? | `CleanMapZone.jsx` |
| Symbol Mountain | Sacred Assembly card flips before sliding — should slide first, then flip on arrival | `SacredAssemblySceneV8.jsx` |
| About Me Hut | (2026-09-18) Dreams & Wishes background palette (`#f8f2ea`, `#d99a65`→`#c9824c`, `#FF8A65`→`#FF7043`, `#EE7CA3`, `#FFD93D`→`#FF9800`, `#FFD700`→`#FFA500`) doesn't match zone palette (`#795548`/`#FF6B6B`/`#FBE9E7`). Could be an intentional "dusk wishing sky" sub-theme — confirm intentional or should be corrected? | `DreamsWishesGame.css` |
| Symbol Mountain | Pond scene emoji positioning — visual judgment needed | `PondSceneSimplifiedV4.jsx` |
| Shloka River | Sarvakaryeshu needs a "meaning subtitle" under each option card — content decision, no copy invented | `scene4/SarvakaryeshuGame.jsx` |
| Shloka River | Sarvada needs a hide-and-seek redesign requiring new art assets (Ganesha hidden in scene, 8-12% of width) | `scene4/SarvadaGame.jsx` |
| Shloka River | Vakratunda mid-rewrite — 4 items to re-check once your rewrite settles (hint-gate explicitness, pause/drag cleanup scope, no dual-flag completion guard, 1 PNG→WebP) | `VakratundaRescueGame.jsx:69-76,112-155,142-155,216-221` and `:9` |
| ~~About Me Hut~~ | ~~`ProgressManager.SCENE_METADATA` stale `game1`-`game4` keys~~ | **RESOLVED 2026-09-19** — see "About Me Hut scene names finalized" section above. |

## 🔍 Needs a live-device smoke test (not resolvable by reading code alone)

| Zone | Item | Location |
|---|---|---|
| Symbol Mountain | `useAppVisibility` missing — Tusk's beat-player progressed while tab hidden | **(2026-09-18) RESOLVED** — `TuskBeatPlayerLive.jsx` now wires `isPaused` via `useAppVisibility`; `SymbolMountainSceneV3.jsx`/`PondSceneSimplifiedV4.jsx` not re-checked this pass |
| Symbol Mountain | No `pointercancel` cleanup on drag/tap — ghost-gesture risk on pause-mid-drag | **(2026-09-18) RESOLVED for Tusk's press-hold** (`BeatPlayerGame.jsx` now calls `cancelHold()` on `pointercancel`); Pond/Ears/Eyes games not re-checked this pass, still open |
| Symbol Mountain | `ModakScene.css:1641-1667` — possible duplicate breakpoint rules, unverified | `ModakScene.css` |
| Symbol Mountain | Sacred Assembly Scene 4 first-time intro VO — presence unverified | `SacredAssemblySceneV8.jsx` |
| Shloka River | Missing `pointercancel` cleanup in 5 of 8 mini-games | **(2026-09-18) RESOLVED** — re-checked all 6 live mini-games; 5/6 were already compliant, `KurumedevaGame.jsx` was the one real gap and is now fixed (see above) |
| Shloka River | Finale scene has 18 PNG assets needing WebP conversion | **(2026-09-18) RESOLVED** — `ShlokaRiverFinale.jsx` already imports all assets as `.webp`, none remaining |
| Shloka River | Hint-gate/dual-flag/voFallback checks incomplete on 4 games (ran low on budget) | Suryakoti, Kurumedeva, Sarvakaryeshu, Sarvada — not re-checked this pass, still open |
| About Me Hut | Tray-on-reload (#5) and emoji mojibake (#9) — investigated in source, **not reproduced**; may be a live-render/font issue rather than a code bug | `Favoritefoodgame.jsx` |
| About Me Hut | Two 1500ms timers suspected racing — not conclusively located | `Favoritefoodgame.jsx` |
| About Me Hut | `AboutMeComparisonCard` fixed-px sizing on iPad landscape — not yet converted to clamp() | `src/zones/about-me-hut/components/AboutMeComparisonCard.jsx` |
| About Me Hut | Prop-shape mismatch between scene and child game — not isolated | `Favoritefoodgame.jsx` / `MyIndianStoryGame.jsx` |
| About Me Hut | Not fully audited this pass — large file, ran out of budget | `ObstacleRemoverGame.jsx` (items: pointercancel, visibility gating, persistence timing, dead code) |
| About Me Hut | Not fully audited this pass | `MyIndianStoryGame.jsx` (items: input validation, celebration wiring, pointercancel, visibility gating, persistence timing, FWKS VO, idle hints) |
| About Me Hut | Not fully audited this pass | `Familytreegame.jsx` (items: drag/pointercancel cleanup, visibility gating, persistence timing, FWKS/idle-hint presence) |

## 🆕 New findings (2026-09-18 checklist re-sweep) — still open, awaiting go-ahead

_Most of the items originally listed here are now fixed — see "Fixed this session" above
(round 2 entries). `Favoritefoodgame.jsx:801` was a false positive (see "Confirmed not
applicable" above). Only the two visually-risky CSS items and one non-functional cleanup
remain open:_

| Zone | Item | Location | Why still open |
|---|---|---|---|
| Symbol Mountain | Multiple hardcoded fixed-px `!important` overrides on symbol images | `SacredAssemblyScene.css:590-639,840-841,863-864` | Each width is paired with a hand-tuned `transform: translate(Xpx, Ypx)` offset. Converting to `clamp()` without also rescaling the translate offsets at every breakpoint would misplace each symbol — needs visual verification after the change, not just a build check. |
| Symbol Mountain | Dead `GameCoach`-related state (`gameCoachState`, `lastGameCoachTime`, `isReloadingGameCoach`) still wired through the file even though the component itself is commented out | `SacredAssemblySceneV8.jsx:510-511,624,978-979,1345,1376,1594,1962,2011-2012` | Non-functional cleanup touching ~12 call sites including a derived `isGameCoachVisible` var used elsewhere (line 624) — low priority, holding until a dedicated pass. |
| Shloka River | Fixed-px `!important` breakpoint overrides (mobile/tablet/desktop tiers) instead of `clamp()` | `VakratundaGroveSimplified.css:300-357` | All values are well above 60px already (not a touch-target bug) — this is pure CSS hygiene, but each breakpoint tier pairs a hand-placed width with hand-placed `left`/`top` percentages; wants visual check after conversion. |

**Fixed in round 2 (2026-09-18) — moved here from this table, see "Fixed this session" for detail:**
Tusk's Arial font, Tusk's sub-60px mobile touch targets, Suryakoti Bank's off-palette background, Sarvakaryeshu Chant's off-palette background, Vakratunda's stale root CSS vars, Vakratunda/Mahakaya/Nirvighnam/Kurumedeva's ungated debug-panel console.logs, Samaprabha's ungated debug-panel console.logs, FreeDraggableItem.jsx's missing touchcancel/disabled-mid-drag handling.

**Still not re-checked this pass:** `PondScene.css:869,970` (`.pond-trunk-reeds`/`.pond-trunk-lotus` sub-60px drag targets) — flagged in round 1, not yet verified as fixed or still open in round 2.

## About Me Hut — Group A audit (Sections 1, 2, 3, 16)
_Audited 2026-09-18 against `GMB_SCENE_LAUNCH_CHECKLIST.md`. Scope was limited to the four live About Me Hut scenes imported by `src/App.jsx`: `Familytreegame.jsx`, `Favoritefoodgame.jsx`, `ObstacleRemoverGame.jsx`, and `MyIndianStoryGame.jsx`. Group B and Group C were not audited in this pass._

### Resolved — was listed as an actionable bug, now confirmed fixed (2026-09-22)
- ~~**Section 2 — Completion next-scene text**~~ — `SceneCompletionCelebration.jsx` now accepts, defaults, and renders `nextSceneName` (subtext at `:374-375`, CTA label at `:415`, `isFinalScene ? 'Home' : nextSceneName`). All live About Me Hut callers verified with correct current values: `Familytreegame.jsx:1803` → "Our Favorite Things", `Favoritefoodgame.jsx:2499` → "Our Wishes & Dreams", `ObstacleRemoverGame.jsx:2420` → "My Indian Story". `MyIndianStoryGame.jsx:1721` still carries a stale `"Let's Be Friends"` value but it's never rendered — that scene is `isFinalScene`, which always shows "Home" instead. Star props (`starsEarned`/`totalStars`) are still not accepted/rendered by the component, but stars aren't displayed anywhere live in the app, so this isn't user-visible. Confirmed not an issue, closing.

### Known punchlist item still present
- ~~Sections 2/3 — About Me metadata~~ — **RESOLVED 2026-09-19**, see "About Me Hut scene names finalized" section near the top of this file.

### Manual/device-only follow-ups
- Recheck Favorite Food's previously un-reproduced tray-on-reload and emoji-rendering reports on a real device.
- ~~Check `AboutMeComparisonCard` on iPad landscape~~ — **RESOLVED**, converted to `clamp()` earlier in the 2026-09-19 sweep (commit `59ad626`). This note and the matching one in the Group C section below were stale.
- Sections 8, 14, 15, and 18 were intentionally skipped; phone/iPad layout, content judgment, accessibility, real-finger interaction, iOS audio, interruption behavior, and child comprehension remain manual gates.

### Checklist status summary
| Section | Checklist item | Status |
|---|---|---|
| 1 | Live scene files confirmed from `src/App.jsx` | PASS |
| 1 | Child mini-games/components used by each live scene confirmed | PASS |
| 1 | CSS files imported by live scenes/children confirmed | PASS |
| 2 | `HomeButton` present | PASS |
| 2 | `ZoneBadgeButton` / back-to-zone control present | PASS |
| 2 | `AudioToggle` present | PASS |
| 2 | `VOReplayButton` present | PASS |
| 2 | `SceneCompletionCelebration` present | PASS |
| 2 | Completion scene name, symbols, stars, and next-scene text | **RESOLVED 2026-09-22** — next-scene text confirmed rendering correctly, see above |
| 3 | Completion saves immediately and only once | PASS |
| 3 | Persistence path present | PASS |
| 3 | `ProgressManager.updateSceneCompletion` or equivalent update occurs | PASS |
| 3 | Map/zone unlock updates | PASS |
| 3 | Replay resets cleanly | PASS |
| 3 | Continue routes correctly | PASS |
| 3 | Reload after completion restores completion state | PASS |
| 3 | Missing direct saves checked against shared/benchmark persistence | PASS |
| 16 | Fresh profile can enter each scene | PASS |
| 16 | Opening modal appears at the correct phase | PASS |
| 16 | Scene does not require stale localStorage | PASS |
| 16 | Saved profile resume/start path is present | PASS (device smoke test remains) |
| 16 | Malformed scene localStorage falls back to initial state | PASS |

## Shloka River — Group A audit (Sections 1, 2, 3, 16)
_Audited 2026-09-18 against `GMB_SCENE_LAUNCH_CHECKLIST.md`. Scope was limited to the five live Shloka River scenes imported by `src/App.jsx`: `VakratundaGroveSimplified.jsx`, `SuryakotiBankSimplified.jsx`, `NirvighnamChantSimplified.jsx`, `SarvakaryeshuChantSimplified.jsx`, and `ShlokaRiverFinale.jsx`, plus their directly imported child mini-games and CSS. Group B and Group C were not audited in this pass._

### Data inconsistency — confirmed NOT user-visible, downgraded from actionable bug
- **Finale star metadata mismatch (not currently shown to users):** the live finale saves and reports 8 stars (`ShlokaRiverFinale.jsx:643-652,658-662`), but `ProgressManager.SCENE_METADATA` declares `maxStars: 6` for `shloka-river-finale` (`ProgressManager.jsx:75`). `calculateZoneProgress()` is the only place that combines saved stars with this metadata maximum (`ProgressManager.jsx:107-140`) — **but nothing in the live app calls `calculateZoneProgress()`** (confirmed via repo-wide grep: only `ProgressManager.jsx` itself references it). The only live star display is `ZoneWelcome.jsx:1017` (`{status.stars}⭐`), which shows the raw earned count with no "X of Y" comparison against any max at all. So this mismatch exists in dead calculation logic only — real, but currently invisible to any child or parent. Low priority; fix opportunistically if `calculateZoneProgress()` ever gets wired into a real UI, not before.

### Resolved — was listed as a known punchlist item, now confirmed fixed (2026-09-22)
- ~~**Section 2 — Shared completion next-scene text**~~ — `SceneCompletionCelebration.jsx` now renders `nextSceneName` correctly (see the About Me Hut Group A entry above). All 4 non-final Shloka River callers verified with correct current finalized values: `VakratundaGroveSimplified.jsx:1226` → "Bring Back the Light!", `SuryakotiBankSimplified.jsx:856` → "Clear the Way Together!", `NirvighnamChantSimplified.jsx:765` → "Ganesha All Day", `SarvakaryeshuChantSimplified.jsx:814` → "Build the Shloka!". Closing.

### Manual/device-only follow-ups
- Visually confirm completion titles, subtitles, discovered symbols, and child-facing CTA wording on phone and iPad.
- Sections 8, 14, 15, and 18 were intentionally skipped; viewport/safe-area behavior, Sanskrit/caption/content judgment, accessibility, real-finger interaction, iOS audio, interruption behavior, performance, and child comprehension remain manual gates.

### Checklist status summary
| Section | Checklist item | Status |
|---|---|---|
| 1 | Live scene files confirmed from `src/App.jsx` | PASS |
| 1 | Child mini-games used by each live scene confirmed | PASS |
| 1 | CSS files imported by live scenes/children confirmed | PASS |
| 2 | `HomeButton` present | PASS |
| 2 | `ZoneBadgeButton` / back-to-zone control present | PASS |
| 2 | `AudioToggle` present | PASS |
| 2 | `VOReplayButton` present | PASS |
| 2 | `SceneCompletionCelebration` present | PASS |
| 2 | Completion scene name, symbols, stars, and next-scene text | **RESOLVED 2026-09-22** — shared CTA confirmed rendering `nextSceneName` correctly; final visual/content check remains MANUAL |
| 3 | Completion saves immediately and only once | PASS |
| 3 | Persistence path present | PASS |
| 3 | `ProgressManager.updateSceneCompletion` or equivalent update occurs | FINDING — finale writes 8 stars against `maxStars: 6` |
| 3 | Map/zone unlock updates | PASS |
| 3 | Replay resets cleanly | PASS |
| 3 | Continue routes correctly | PASS |
| 3 | Reload after completion restores completion state | PASS |
| 3 | Missing direct saves checked against shared/benchmark persistence | N/A — all five live containers have a direct completion persistence path |
| 16 | Fresh profile can enter each scene | PASS |
| 16 | Opening modal appears at the correct phase | PASS |
| 16 | Scene does not require stale localStorage | PASS |
| 16 | Saved profile resume/start path is present | PASS (device smoke test remains) |
| 16 | Malformed scene localStorage falls back to initial state | PASS |

## Symbol Mountain — Group A (Sections 1, 2, 3, 16)

_Audited 2026-09-18 against `GMB_SCENE_LAUNCH_CHECKLIST.md`. Scope is limited to the four live Symbol Mountain scenes imported by `src/App.jsx:129-135`: `NewModakSceneV7.jsx`, `PondSceneSimplifiedV4.jsx`, `SymbolMountainSceneV3.jsx`, and `SacredAssemblySceneV8.jsx`, plus their live child games and shared completion/persistence components. Backup/V1/old/copy files were excluded._

### New actionable bugs

| Status | Checklist item | Finding | Location |
|---|---|---|---|
| ~~**FINDING**~~ **RESOLVED 2026-09-22** | 2.6 — Completion modal content | `SceneCompletionCelebration` now renders `nextSceneName` correctly. All 3 live Symbol Mountain callers verified with correct current values: `NewModakSceneV7.jsx:1693` → "Find a Way to the Lotus", `PondSceneSimplifiedV4.jsx:1845` → "Ganesha's Eyes, Ears & Tusk" (the stale "Temple Discovery" label only exists in dead backup files, not the live one), `SymbolMountainSceneV3.jsx:1129` → "Ganesha's Symbol Challenge". Star props still unrendered but stars aren't displayed live anywhere — not user-visible, closing. | `SceneCompletionCelebration.jsx:374-375,415` |
| **FINDING** | 3.1 — Completion saves immediately and only once | Completion persistence/unlocking runs through overlapping paths. `SceneCompletionCelebration` saves through `GameStateManager`, then its CTA calls the app completion handler, which updates `ProgressManager` and unlocks again. Pond and Sacred additionally write through both managers locally; Tusk also saves directly. This is separate from the fixed Pond two-call-site bug: the local ref guard exists, but shared/app paths bypass it. | `SceneCompletionCelebration.jsx:123-166`; `App.jsx:1355-1379`; `PondSceneSimplifiedV4.jsx:891-916`; `SymbolMountainSceneV3.jsx:793-808,1130-1141`; `SacredAssemblySceneV8.jsx:257-277,1461-1487` |
| **FINDING** | 3.5 / 16.4 — Replay and saved-profile integrity | Sacred Assembly's Play Again path calls `hardResetSceneState()`, which clears the permanent `final-scene` completion record. Exiting before finishing the replay can therefore leave the saved profile no longer marked complete. The Modak benchmark resets playback/UI state without clearing permanent completion. | `SacredAssemblySceneV8.jsx:924-993,2196-2198`; `NewModakSceneV7.jsx:1225-1263` |
| **FINDING** | 3.7 / 16.4 — Reload after completion | Pond and Tusk delete their temp session before the final fireworks/mandala transition has stamped `showingCompletionScreen`. Reloading in that gap can return the scene to initial state: `SceneManager` only enters its completed-scene replay branch when `!isActualReload`, and otherwise falls back to `initialState` when no temp session exists. | `PondSceneSimplifiedV4.jsx:891-916,1275-1295,1790-1797`; `SymbolMountainSceneV3.jsx:793-812,1045-1091`; `SceneManager.jsx:60-131` |

### Known punchlist / judgment items

| Status | Item | Current audit result | Location |
|---|---|---|---|
| **KNOWN** | Pond art/emoji positioning | Still a visual judgment call; no new static bug asserted. Confirm on the target phone/iPad layouts. | `PondSceneSimplifiedV4.jsx:1321-1335` |
| **PASS** | Sacred Assembly card order | Current code enters the side/slide phase, waits 1350ms for the 1.1s slide, and only then flips. The older consolidated “flips before sliding” entry did not reproduce in the current source. | `SacredAssemblySceneV8.jsx:822-851,1677-1707` |

### Manual/device-only follow-ups

| Status | Follow-up |
|---|---|
| **MANUAL** | After the completion-modal contract is corrected, visually confirm scene identity, symbols, stars, and next-scene wording. |
| **MANUAL** | Resolve the documented Pond positioning judgment on the target phone and iPad layouts. |
| **MANUAL** | Sections 8 and 18 remain deferred: viewport screenshots, real-finger interaction, app switching, Safari/iOS behavior, and device performance. |
| **MANUAL** | Section 14 human content/child-comprehension checks remain deferred. |

### Complete Group A checklist ledger

| Section | Checklist item | Status | Evidence / note |
|---|---|---|---|
| 1 | Confirm live scene file from `src/App.jsx` | **PASS** | Four live imports confirmed at `src/App.jsx:129-135`. |
| 1 | Confirm child mini-games used by the live scene | **PASS** | Modak: `FlowerJourneyGame2`, `GarlandGame3`; Tusk: `EyesPopUpGame`, `EarsSoundMatchGame`, `TuskBeatPlayerLive`/`BeatPlayerGame`; Sacred: `GaneshaIllustration`; Pond mechanics are inline. |
| 1 | Confirm CSS files actually imported by live scenes/children | **PASS** | Scene and live-child CSS imports traced; no backup/old/copy stylesheet is in the live import graph. |
| 2 | `HomeButton` present or intentionally replaced | **PASS** | Present in all four live scene control blocks. |
| 2 | `ZoneBadgeButton` / back-to-zone control present | **PASS** | Present in all four live scene control blocks. |
| 2 | `AudioToggle` present if scene has audio | **PASS** | Present in all four audio-enabled scenes. |
| 2 | `VOReplayButton` present where VO guidance is used | **PASS** | Present in all four live scenes. |
| 2 | `SceneCompletionCelebration` appears on completion | **PASS** | Present in Modak `:1664`, Pond `:1817`, Tusk `:1096`, Sacred `:2157`. |
| 2 | Completion modal has correct scene name, symbols, stars, and next-scene text | **FINDING** | Stars and scene-specific next text are not rendered; see actionable finding above. |
| 3 | Completion saves immediately and only once | **FINDING** | Overlapping shared, app, and scene-local writes/unlocks; see actionable finding above. |
| 3 | Persistence path is present | **PASS** | All four scenes have shared or direct persistence. |
| 3 | `ProgressManager.updateSceneCompletion` or equivalent happens | **PASS** | App completion handler covers every scene; Pond and Sacred also call it directly. Duplication is tracked separately. |
| 3 | Map/zone unlock state updates correctly | **PASS** | Completion reaches `GameStateManager.unlockNextScene`; duplication is tracked separately. |
| 3 | Replay resets the scene cleanly | **FINDING** | Sacred replay clears permanent completion; see actionable finding above. |
| 3 | Continue routes to the correct next scene | **PASS** | Live App progression is `modak -> pond -> symbol -> final-scene`; `scene-complete-continue` uses that helper. Pond's stale `temple` tracking call does not control the live App route. |
| 3 | Reload after completion restores completion state correctly | **FINDING** | Pond/Tusk have a final-transition temp-session gap; see actionable finding above. |
| 3 | Absence of direct save calls checked against benchmark/shared persistence | **PASS** | Modak's lack of a scene-local completion save is covered by `SceneCompletionCelebration`; it was not treated as missing. |
| 16 | Fresh profile can enter scene cleanly | **PASS** | Every live scene supplies a complete `SceneManager` initial state. |
| 16 | Opening modal appears at the right time | **PASS** | Each scene starts with `welcomeShown: false` and gates `OpeningModal` on that state. |
| 16 | Scene does not depend on stale localStorage | **PASS** | Saved state is merged over defaults; malformed state falls back to the scene's initial state. |
| 16 | Saved profile resumes/starts scene as intended | **FINDING** | Sacred replay and the Pond/Tusk completion-transition reload gap can damage/lose the intended saved-profile state; see findings above. |
| 16 | Malformed localStorage does not break scene entry | **PASS** | `SceneManager.jsx:60-131` catches parse failures; `CleanGameWelcomeScreen.jsx:228-267` ignores malformed temp sessions. |

## Shloka River — Group B audit (Sections 4, 5, 6, 7)
_Audited 2026-09-18 against `GMB_SCENE_LAUNCH_CHECKLIST.md`. Scope: the five live Shloka River scenes and their live child mini-games (`VakratundaRescueGame.jsx`/`MahakayaRescueGame.jsx`, `components/SuryakotiGame.jsx`/`components/SamaprabhaGame.jsx`, `NirvighnamGame.jsx`/`KurumedevaGame.jsx`, `SarvakaryeshuGame.jsx`/`SarvadaGame.jsx`)._

### Resolved — was listed as a new actionable bug, now confirmed fixed (2026-09-22)
- ~~**Section 6 — HomeButton/ZoneBadgeButton/Continue don't stop scene audio before navigating**~~ — this was dated 2026-09-18, before the audio-teardown pass applied to all 5 Shloka River scenes later the same session. Re-verified now: all 5 files correctly wrap Home/ZoneBadge/Continue with `stopAllVoice()` — `VakratundaGroveSimplified.jsx:890-891,1230-1244`, `SuryakotiBankSimplified.jsx:642-643,860-872`, `NirvighnamChantSimplified.jsx:591-592,779`, `SarvakaryeshuChantSimplified.jsx:619-620,832`, `ShlokaRiverFinale.jsx:710-711,926`. `SceneCompletionCelebration`'s separately-passed `onComplete` prop is only a progress-save callback fired alongside `onContinue`, not an independent navigation path — no leak there either. Closing.

### Known punchlist items — resolved, recommend closing
- "Hint-gate/dual-flag/voFallback checks incomplete on 4 games (Suryakoti, Kurumedeva, Sarvakaryeshu, Sarvada)" — re-investigated, all four have correct single-fire completion guards (`completionScheduledRef`, `finished`/`advanceCalled`, `completeCalledRef`/`doneCalledRef`) and correct hint-gating via `useRepeatedHintCycle`. No bugs found — closing this line.
- KurumedevaGame's pause/drag-cleanup fix and MahakayaRescueGame's overall compliance both re-spot-checked, still hold, no regression.
- **Vakratunda mid-rewrite flagged lines are stale**: `VakratundaRescueGame.jsx:69-76,112-155,142-155,216-221,:9` now hold unrelated obstacle/geometry code post-rewrite. Needs a fresh targeted pass once the rewrite is confirmed settled — don't trust the old line numbers.

### Manual/device-only follow-ups
- VO-replay-plays-correct-line, no audible overlap on rapid tap, audible confirmation of no cross-scene audio leak (code gap is the finding above).
- Modal open/close VO stacking — wiring correct in code, audible dedupe needs a live check.

### No-issue confirmations
- Timers/intervals/RAF cleared on unmount and on pause/`useAppVisibility` tab-hide across all 5 scenes + 8 child mini-games.
- Drag/hold pointer-capture pairing correct wherever drag exists; tap-only games (Sarvakaryeshu/Sarvada) correctly have no pointercancel to flag.
- Audio toggle mutes VO/music/SFX consistently in all 5 scenes.

## Symbol Mountain — Group B audit (Sections 4, 5, 6, 7)
_Audited 2026-09-18. Scope: `NewModakSceneV7.jsx` (benchmark), `PondSceneSimplifiedV4.jsx`, `SymbolMountainSceneV3.jsx` (+ `EyesPopUpGame.jsx`, `EarsSoundMatchGame.jsx`, `TuskBeatPlayerLive.jsx`/`BeatPlayerGame.jsx`), `SacredAssemblySceneV8.jsx`._

### New actionable bugs
- **Section 6 — same HomeButton/ZoneBadgeButton audio-teardown gap as Shloka River, in Pond, Tusk, and Sacred Assembly** (Modak is the compliant benchmark): `PondSceneSimplifiedV4.jsx:1318,1908`, `SymbolMountainSceneV3.jsx:833-834`, `SacredAssemblySceneV8.jsx:1624-1625` all call `<HomeButton onNavigate={onNavigate} />` / `<ZoneBadgeButton ... onBack={() => onNavigate?.('zone-welcome')} />` unwrapped, vs. benchmark `NewModakSceneV7.jsx:1370-1371`.
- **Completion `Continue` also skips VO teardown in Pond and Tusk** (`PondSceneSimplifiedV4.jsx:1856-1863`, `SymbolMountainSceneV3.jsx:1130-1142`) — Sacred Assembly's completion path does it correctly (`SacredAssemblySceneV8.jsx:2190-2198`), matching benchmark `NewModakSceneV7.jsx:1710-1714`.

### Known punchlist items — resolved, recommend closing
- "useAppVisibility missing — Pond/Tusk tab-hide, not re-checked" — resolved via shared `usePauseAwareTimeout` (wires `useAppVisibility` internally, confirmed `usePauseAwareTimeout.js:2,72`); Sacred Assembly also gates directly via `useAppVisibility` (`SacredAssemblySceneV8.jsx:800-808`).
- "No pointercancel cleanup — Pond/Ears/Eyes, not re-checked" — Pond's rock-hold/reeds-drag/lotus-hold all correctly route `onPointerCancel`/`onPointerLeave` to end handlers (`PondSceneSimplifiedV4.jsx:1451-1454,1592-1596,1686`). Eyes/Ears games are tap-only — Section 7 doesn't apply to their gameplay; their `setPointerCapture` calls are DEV-only debug-layout tools, unrelated to child interaction.

### Manual/device-only follow-ups
- Rapid-tap VO overlap and audible confirmation of no cross-navigation leak.
- Modal open/close VO stacking on symbol sidebar/opening/mode-selection modals.

### No-issue confirmations
- Pond's `onPauseHide`/`onPauseShow` pause/resume handling is a strong reference implementation, arguably cleaner than Modak's for RAF-loop cleanup.
- Sacred Assembly's card-phase timeline correctly gates all timers on `isPageVisible`.

## About Me Hut — Group B audit (Sections 4, 5, 6, 7)
_Audited 2026-09-18. Scope: `Familytreegame.jsx`, `Favoritefoodgame.jsx`, `ObstacleRemoverGame.jsx` (Dreams & Wishes), `MyIndianStoryGame.jsx`. These four were previously flagged "not fully audited" for this territory — this pass covers it in full._

### New actionable bugs
- **Section 6 — HomeButton/ZoneBadgeButton skip voice teardown in 3 of 4 files**: `Familytreegame.jsx:1250-1257`, `ObstacleRemoverGame.jsx:1659-1666` (no `interruptCurrentVoice()`/`hardStopSceneAudio()` despite both existing in-file), `MyIndianStoryGame.jsx:1527-1534`. `Favoritefoodgame.jsx:1656-1665` is the compliant exception (calls `interruptCurrentVoice()` + `clearAllTimeouts()`) — use as the in-zone reference.
- **Completion `Continue` also skips teardown — Familytreegame, MyIndianStoryGame** (`Familytreegame.jsx:1779-1784`, `MyIndianStoryGame.jsx:1626-1630`); each file's own `onReplay` right next to it does call `stopVoice()` correctly.
- **New: idle-hint timers not paused on tab-hide — ObstacleRemoverGame, MyIndianStoryGame.** `ObstacleRemoverGame.jsx:1060-1099,1143-1170` — wish1/wish2/wish3 idle-hint ladders use raw `setTimeout` instead of the file's own `safeSetTimeout`; `onHide` (`:428-444`) never clears them, so idle VO can fire while the tab is backgrounded. `MyIndianStoryGame.jsx:430-457` — `onShow` resets only 3 of ~9 idle-timer refs, leaving `childHomeIdleTimerRef`, `childHomeIdleHintTimerRef`, `languageSelectionIdleHintTimerRef`, `festivalSelectionIdleHintTimerRef`, `languagePlayNudgeTimeoutRef`, `childHomePostSelectTimerRef`, and 2 sparkle timers running unreconciled in the background.
- **Minor — Familytreegame tap-hint timer not covered by `onHide`**: `Familytreegame.jsx:819-823` (`tapCircleTimerRef`) isn't cleared, unlike sibling `treeIdleHintTimersRef` right next to it. Low severity, single VO line.

### Known punchlist items — resolved, recommend closing
- `ObstacleRemoverGame.jsx`/`MyIndianStoryGame.jsx`/`Familytreegame.jsx` "not fully audited" for pointercancel/visibility-gating — pointercancel resolved as **N/A** (none has a real drag mechanic; Family Tree and Dreams & Wishes are tap-only; `MyIndianStoryGame`'s magnifying-glass drag via `FreeDraggableItem` is already fixed, confirmed still present at `:1965-1988`); visibility-gating is now the confirmed finding above rather than "unaudited."

### Manual/device-only follow-ups
- No overlapping VO on rapid tapping; modal-reopen VO stacking; audible leak of previous-scene audio into next scene; rapid tap double-complete on the wish2 tap-to-place mechanic.

### No-issue confirmations
- None of the 4 files use `requestAnimationFrame` or `setInterval` — Section 4's RAF/interval items are structurally N/A here.
- Section 7 (drag/hold) is largely N/A for this zone, not actually under-audited as previously implied — no real drag/hold mechanic exists outside the already-fixed `FreeDraggableItem` case.

**Cross-zone pattern note:** the Home/ZoneBadge/Continue audio-teardown gap is now confirmed identical across all three zones (Modak and Favoritefoodgame are the only two compliant scenes of the 13). Worth fixing once as a single cross-zone pass rather than zone-by-zone.

## Shloka River — Group C audit (Sections 9, 10, 11, 12, 13)
_Audited 2026-09-18. Scope: the five live Shloka River scenes and their live child mini-games (`VakratundaRescueGame.jsx`/`MahakayaRescueGame.jsx`, `SuryakotiGame.jsx`/`SamaprabhaGame.jsx`, `NirvighnamGame.jsx`/`KurumedevaGame.jsx`, `SarvakaryeshuGame.jsx`/`SarvadaGame.jsx`) and their CSS._

### New actionable bug
- **Off-palette background on the live Vakratunda scene root.** `VakratundaGroveSimplified.css:14-21` — `.vakratunda-simplified-container` (the actual root `<div>` rendered at `VakratundaGroveSimplified.jsx:890`) has `background: #f1e7fc` (lavender), not the zone palette's `#E8F5E9`. Same class of bug already fixed this session for `SuryakotiBankSimplified.css:8` and `SarvakaryeshuChantSimplified.css:8` — Scene 1 was missed in that pass. Note: there's a correct `#E8F5E9` at `VakratundaGroveSimplified.css:586`, but it's on the dead leftover class `.grove-scene`, not the live container — don't mistake it for the fix.

### Known punchlist items — still open, confirmed on re-check
- `VakratundaGroveSimplified.css:296-359` (breakpoint tiers) still pair hand-placed `width/height !important` with hand-placed `left/top` percentages instead of `clamp()`. All sizes ≥80px, so CSS hygiene only, not a touch-target violation — still wants a visual check after any conversion.

### Manual/device-only follow-ups
- Phone/iPad polish; production-build asset paths and cache-clear/slow-network reload.

### No-issue confirmations
- Zero non-Baloo-2/Nunito `font-family` declarations across all 13 live CSS files.
- Every `console.log/warn/debug` across the 13 live files is DEV-gated (including `SamaprabhaGame.jsx:111-113,584-588`).
- Zero `GameCoach` references in this zone.
- Every relative image/audio import resolves to a real file — no broken references.
- PNG (not WebP) usage present but functional: `VakratundaRescueGame.jsx` (2), `MahakayaRescueGame.jsx` (5), `SuryakotiGame.jsx` (5), `SamaprabhaGame.jsx` (6), `NirvighnamGame.jsx` (8), `KurumedevaGame.jsx` (2), `SarvakaryeshuGame.jsx` (6), `SarvadaGame.jsx` (8) — worth a batch WebP pass, not a bug.
- `SanskritRiverProgress.css`, `GaneshaBlessing.css`, `VakratundaGrove.css` under Scene1 confirmed dead code, not imported anywhere.

## Symbol Mountain — Group C audit (Sections 9, 10, 11, 12, 13)
_Audited 2026-09-18. Scope: `NewModakSceneV7.jsx` (benchmark), `PondSceneSimplifiedV4.jsx`, `SymbolMountainSceneV3.jsx` (+ Eyes/Ears/Beat games), `SacredAssemblySceneV8.jsx`, and their CSS._

### New actionable bugs
None beyond what's already tracked below — no new findings this pass.

### Known punchlist items — verification status
- **`SacredAssemblyScene.css:590-639,840-841,863-864`** fixed-px `!important` symbol overrides paired with hand-tuned `translate()` offsets — **STILL OPEN**, confirmed present.
- **`SacredAssemblySceneV8.jsx` dead GameCoach state** (`gameCoachState`, `lastGameCoachTime`, `isReloadingGameCoach`, derived `isGameCoachVisible` at :624) — **STILL OPEN**, confirmed present at all cited lines.
- **`ModakScene.css:1641-1667` possible duplicate breakpoint rules** — **RESOLVED**. File is now only 1625 lines total (verified via `wc -l`); that range no longer exists.
- **`PondScene.css:869,970` sub-60px drag targets** — **STILL OPEN**, location drifted slightly: `.pond-trunk-reeds` `min-width:50px` confirmed at line 869; `.pond-trunk-lotus` `min-width:40px`/`min-height:70px` confirmed now at line 939 (was 970). Both let `clamp()` shrink below 60px on small viewports.

### Manual/device-only follow-ups
- Scene polish on phone/iPad; production console errors during live play; broken asset paths/cache-clear reload in production build; disabled-state visuals for Modak/Pond/Sacred buttons (rely on shared component, not confirmable via static read).

### No-issue confirmations
- No ungated `console.log`/`warn`/`debug` in any of the 9 files scanned.
- All local image imports across all 4 scenes resolve to real files on disk, including the 5 new Pond `.webp` assets in the current uncommitted working tree.
- 100% WebP/SVG in these scenes — no PNG/JPG anywhere.
- Zone palette (`#FF5722`/`#FFD700`/`#FFF8E7`) confirmed applied via `zone-themes.css` plus scene-local overrides.
- The one `Arial` reference (`SacredAssemblySceneV8.jsx:95`) is inside an offscreen `<canvas>` badge generator, not rendered UI text — not a real font-hygiene violation.

## About Me Hut — Group C audit (Sections 9, 10, 11, 12, 13)
_Audited 2026-09-18. Scope: `Familytreegame`, `Favoritefoodgame`, `ObstacleRemoverGame` (+ `DreamsWishesGame.css`), `MyIndianStoryGame` (+ `FreeDraggableItem`), `AboutMeComparisonCard`._

### Resolved — was listed as a new actionable bug, now confirmed fixed (2026-09-22)
- ~~**Dreams & Wishes intro CTA drops below 60px at tablet/small-desktop width**~~ — dated 2026-09-18, before this session's Item B touch-target pass. Re-verified: `DreamsWishesGame.css:443-447` (`@media max-width: 1024px`) now sets `min-height: 64px`, above the 60px floor. Closing.
- **Family Tree "Continue" button has no min-height on mobile.** `Familytreegame.css:4853-4857`, inside `@media (max-width: 900px)`:
  ```css
  .continue-btn-simple {
    font-size: clamp(0.95rem, 1.8vw, 1.2rem) !important;
    padding: 12px 32px !important;
    min-width: clamp(120px, 18vw, 180px) !important;
  }
  ```
  No `min-height` at this breakpoint — computes to roughly 39-43px tall with 12px vertical padding + ~15-19px font, below 60px. Desktop rule stays safe on padding/font alone; mobile-only regression.

### Known punchlist items — confirmed still present, unconverted
- ~~`AboutMeComparisonCard.css:50-51`~~ — **RESOLVED**, converted to `clamp()` in commit `59ad626`. This entry was stale.
- **Dreams & Wishes off-palette "dusk wishing sky" background** — still intact in `DreamsWishesGame.css`, still diverges from `#795548/#FF6B6B/#FBE9E7`. Not re-flagged as new — still awaiting your yes/no on whether it's an intentional sub-theme (see "Needs YOUR decision" table above).

### Manual/device-only follow-ups
- Phone/iPad visual polish; production build asset-path integrity, cache-clear/slow-network reload; visually confirm the two new touch-target bugs at their actual breakpoint widths (1024px, 900px) since computed heights are estimated from CSS, not measured live.

### No-issue confirmations
- Font hygiene clean across all 4 scenes — Baloo 2/Nunito primary everywhere, system-font fallbacks only ever secondary.
- No `console.warn`/`console.debug` anywhere; every `console.log` DEV-gated (confirmed including `Favoritefoodgame.jsx:800-802`).
- No `GameCoach` reference in live code (only in a non-live `.backup` file).
- All local image imports resolve to real files on disk — zero missing assets, 100% WebP.
- Dead `Obstacleremovergameredesigned.css`'s sub-60px `.handle-circle` is not imported by the live `ObstacleRemoverGame.jsx` — correctly out of scope.

## Repo hygiene note (not a bug, just noise)
Several zones turned up dead/decoy duplicate files that could confuse future audits or edits:
- Shloka River: `Scene3/components/*`, `scene4/components/*`, `SamaprabhaRainbowGame.jsx` — unused variants, containers import siblings one level up instead
- About Me Hut: `ObstacleRemoverGame_FIXED.jsx`, `ObstacleRemoverGameV1.jsx`, multiple `copy`/`backup` files — none are live
- Symbol Mountain, Opening Scenes: numerous versioned/backup `.jsx` files not imported anywhere

Not deleted in this pass (out of scope) — flagging in case you want a cleanup pass later.

## Recommended next step
The flagged items split into two groups:
1. **Judgment calls** — quick, just need your yes/no or a content decision
2. **Needs live-device testing** — pointercancel/ghost-gesture behavior, tab-visibility, and the two About Me Hut items that couldn't be reproduced in source are the kind of thing that only shows up on an actual iPad/phone

A focused follow-up pass on `ObstacleRemoverGame.jsx` and `MyIndianStoryGame.jsx` (both under-audited due to size/session interruptions) would also be worth doing before calling About Me Hut done.

## Scope note on this fold-in (2026-09-19)
This update reconciles the punch-list against everything from the 2026-09-18/19 shared-layer sweep and today's live-browser spot-check. `CHANGELOG.md` has a much longer history predating this punch-list (multiple sessions of WIP, checkpoints, and fixes going back further) that was not fully reconciled here — that would be a separate, larger pass. If something looks like it's missing from this file, check `CHANGELOG.md` first before assuming it was never done.

**Currently uncommitted, in progress (not reflected as fixed above):** `SacredAssemblyScene.css`, `SacredAssemblySceneV8.jsx`, `PondScene.css`, `DreamsWishesGame.css`, `ObstacleRemoverGame.jsx`, `Favoritefoodgame.jsx`, `MyIndianStoryGame.jsx`, `DECISIONS.md`, plus a new untracked `AboutMeGaneshaHost.jsx`/`.css` component — active WIP as of this update. Don't treat those items as resolved until a build-verified commit lands.

**New verified-but-uncommitted finding (2026-09-19):** live-device testing of Sacred Assembly at a real phone-landscape size (812×375) turned up a bigger bug than the `!important` cleanup this was meant to verify — the `.ganesha-assembly-container` had zero responsive coverage for the 769-1023px landscape width range (existing breakpoints only covered ≤768px and 1024-1366px), so on phones like an iPhone 14 turned sideways it rendered at full desktop size (920×1020px, ~2.7x the viewport height) instead of scaling down. Fixed in-progress by adding `@media (min-width: 769px) and (max-width: 1023px) and (orientation: landscape)` reusing the proven 560×640 sizing from the 768px breakpoint (`SacredAssemblyScene.css:897-902`) — confirmed via `getComputedStyle` that the container now sizes correctly and the scene plays through without regression. Still needs: a build check, a real screenshot with all 8 symbols placed simultaneously (the completion modal fires almost immediately after the 8th lands, so this was verified via computed styles/math rather than a direct screenshot), and a real-device eyeball pass before treating as done.
