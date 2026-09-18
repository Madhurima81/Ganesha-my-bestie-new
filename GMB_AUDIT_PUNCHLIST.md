# GMB Pre-Launch Audit — Consolidated Punch List
_Generated from the 4-zone Claude Code audit (Symbol Mountain, Shloka River, About Me Hut, Opening Scenes) run against `CLAUDE_CODE_PROMPT.md` / `GMB_COMPREHENSIVE_CHECKLIST.html`._
_Updated 2026-09-18 — folded in a fresh 13-scene checklist re-sweep (3 background agents, one per zone) run against this same document. New items are marked "(2026-09-18)"._

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
| About Me Hut | (2026-09-18) `ProgressManager.SCENE_METADATA` still keys About Me Hut scenes as `game1`-`game4` with stale display names/star totals from an older scene lineup (`'game4': 'Name & Birthday'` — that scene doesn't exist anymore, real scene 4 is "My Indian Story"). Lookups by real scene ID (`family-tree` etc.) silently miss and fall back to `{name: sceneId, maxStars: 5}`, so About Me Hut scenes likely show a raw ID instead of a proper name and a wrong max-star count wherever this metadata is displayed (Parent Dashboard etc.) — needs Madhurima to confirm the 4 correct names + max-star values before fixing (not inventing copy). Note: the sibling bug in `ZONE_CONFIG['about-me-hut'].scenes` (same stale IDs, broke auto-unlock) was already fixed this session. | `ProgressManager.jsx:62-65` |

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
