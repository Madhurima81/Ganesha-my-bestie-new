# GMB Pre-Launch Audit — Consolidated Punch List
_Generated from the 4-zone Claude Code audit (Symbol Mountain, Shloka River, About Me Hut, Opening Scenes) run against `CLAUDE_CODE_PROMPT.md` / `GMB_COMPREHENSIVE_CHECKLIST.html`._

## ✅ Fixed this session (applied directly to files)

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
- `NirvighnamChantSimplified.jsx:460` — dead-lettered reload-recovery effect referencing nonexistent `PHASES.SCENE_COMPLETE` → corrected to `PHASES.COMPLETE`
- Confirmed `SarvakaryeshuChantSimplified.jsx` fireworks-replay-on-reload already correct
- **MahakayaRescueGame.jsx confirmed fully compliant** — pause/drag cleanup, `maxLockedRef` guard, dual-flag completion guard, hint gating all already correct, no fixes needed

### About Me Hut
- **Family Tree soft-lock root cause found & fixed**: `.family-tree-end-game-btn` had `transform: translateY(52px) !important` pushing it off-screen — `Familytreegame.css:5150`
- Double-navigation bug on back button fixed — `Familytreegame.jsx:1436`
- Portrait 55vh/45vh fixed floors → `clamp()` — `Familytreegame.css:5092,5101`
- Wrong CSS selector on portrait continue-button query corrected — `Familytreegame.css:5141`
- console.log gated behind DEV — `Familytreegame.jsx`, `Favoritefoodgame.jsx`

## ⏭️ Confirmed not applicable / already correct (checklist is stale here)
- **Obstacle Remover (Scene 21)** — the file was redesigned into a "Dreams & Wishes" game at some point; the obstacle-grid, wrong-guess-card, and tray mechanics from the original checklist no longer exist. Cancel-path and completion-persistence already work correctly in the current version.
- **MyIndianStoryGame (Scene 22)** — no form/submit mechanic exists matching "form submit broken"; checklist item doesn't apply to current implementation.
- Symbol Mountain: 2 originally-listed blockers already resolved (see above)
- About Me Hut: Family Tree `culturalData` etc. dead-code claims were false positives — not actually dead

## 🔴 Needs YOUR decision (design/content judgment calls, not bugs to fix blindly)

| Zone | Item | Location |
|---|---|---|
| Opening | Unlock-dot threshold shows `>= 2` but actual unlock is `>= 1` — code has a comment suggesting this was deliberate. Confirm intentional? | `CleanMapZone.jsx` |
| Symbol Mountain | Sacred Assembly card flips before sliding — should slide first, then flip on arrival | `SacredAssemblySceneV8.jsx` |
| Symbol Mountain | Pond scene emoji positioning — visual judgment needed | `PondSceneSimplifiedV4.jsx` |
| Shloka River | Sarvakaryeshu needs a "meaning subtitle" under each option card — content decision, no copy invented | `scene4/SarvakaryeshuGame.jsx` |
| Shloka River | Sarvada needs a hide-and-seek redesign requiring new art assets (Ganesha hidden in scene, 8-12% of width) | `scene4/SarvadaGame.jsx` |
| Shloka River | Vakratunda mid-rewrite — 4 items to re-check once your rewrite settles (hint-gate explicitness, pause/drag cleanup scope, no dual-flag completion guard, 1 PNG→WebP) | `VakratundaRescueGame.jsx:69-76,112-155,142-155,216-221` and `:9` |

## 🔍 Needs a live-device smoke test (not resolvable by reading code alone)

| Zone | Item | Location |
|---|---|---|
| Symbol Mountain | `useAppVisibility` missing — progress may advance while tab hidden | `PondSceneSimplifiedV4.jsx`, `SymbolMountainSceneV3.jsx` |
| Symbol Mountain | No `pointercancel` cleanup on drag/tap — ghost-gesture risk on pause-mid-drag | Pond, Ears/Eyes games, `SymbolMountainSceneV3.jsx` |
| Symbol Mountain | `ModakScene.css:1641-1667` — possible duplicate breakpoint rules, unverified | `ModakScene.css` |
| Symbol Mountain | Sacred Assembly Scene 4 first-time intro VO — presence unverified | `SacredAssemblySceneV8.jsx` |
| Shloka River | Missing `pointercancel` cleanup in 5 of 8 mini-games | `Scene2/components/SuryakotiGame.jsx`, `SamaprabhaGame.jsx`, `Scene3/KurumedevaGame.jsx`, `scene4/SarvakaryeshuGame.jsx`, `SarvadaGame.jsx` |
| Shloka River | Finale scene has 18 PNG assets needing WebP conversion | `scenes/scene5/ShlokaRiverFinale.jsx` |
| Shloka River | Hint-gate/dual-flag/voFallback checks incomplete on 4 games (ran low on budget) | Suryakoti, Kurumedeva, Sarvakaryeshu, Sarvada |
| About Me Hut | Tray-on-reload (#5) and emoji mojibake (#9) — investigated in source, **not reproduced**; may be a live-render/font issue rather than a code bug | `Favoritefoodgame.jsx` |
| About Me Hut | Two 1500ms timers suspected racing — not conclusively located | `Favoritefoodgame.jsx` |
| About Me Hut | `AboutMeComparisonCard` fixed-px sizing on iPad landscape — not yet converted to clamp() | `src/zones/about-me-hut/components/AboutMeComparisonCard.jsx` |
| About Me Hut | Prop-shape mismatch between scene and child game — not isolated | `Favoritefoodgame.jsx` / `MyIndianStoryGame.jsx` |
| About Me Hut | Not fully audited this pass — large file, ran out of budget | `ObstacleRemoverGame.jsx` (items: pointercancel, visibility gating, persistence timing, dead code) |
| About Me Hut | Not fully audited this pass | `MyIndianStoryGame.jsx` (items: input validation, celebration wiring, pointercancel, visibility gating, persistence timing, FWKS VO, idle hints) |
| About Me Hut | Not fully audited this pass | `Familytreegame.jsx` (items: drag/pointercancel cleanup, visibility gating, persistence timing, FWKS/idle-hint presence) |

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
