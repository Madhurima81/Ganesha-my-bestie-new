# Next Session — Fresh 13-Scene Checklist Re-Sweep

**Why this file exists:** Most of the 13 live scenes have changed since the last
full checklist pass (PoseImage rollout, WebP conversions, KurumedevaGame/BeatPlayerGame
fixes, ongoing Pond scene rework, and other WIP). Rather than trust the previous
findings, run a **fresh** checklist sweep against current file state at the start
of the next session.

**Source of truth for the checklist:** `CLAUDE_CODE_PROMPT.md` and
`GMB_COMPREHENSIVE_CHECKLIST.html` (in `C:\Users\Madhurima Agarwal\Downloads\files_extracted`).
Fold results into `GMB_AUDIT_PUNCHLIST.md` in the repo root — that file is the
living document; don't create a new one.

**Standing rules (do not skip):**
- Report findings first. Wait for explicit go-ahead before editing/fixing anything.
- Never commit or revert on your own initiative — only after Madhurima says to.
- `src/App.jsx`'s import table is the only authoritative source for which file
  is actually live per scene — never trust folder names, `sceneRegistry.js`, or
  filename patterns alone.
- Read `src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx` fully first —
  it's the project's benchmark scene for every checklist item.

## Checklist to run per scene
- [ ] HomeButton/BackToMapButton present
- [ ] `useSceneReset` wired up (note: benchmark itself does NOT use this hook —
      its absence elsewhere isn't automatically a violation, cross-check first)
- [ ] `SceneCompletionCelebration` on win condition
- [ ] Progress persistence — `GameStateManager.saveGameState` /
      `ProgressManager.updateSceneCompletion` called on completion
- [ ] Only Baloo 2 (headings/buttons) + Nunito (body) fonts — no system fonts,
      no stray third fonts
- [ ] Touch targets ≥ 60px on all interactive elements (check CSS
      width/min-width/height/min-height; watch for values that dip under 60px
      at mobile breakpoints even if the base/clamp value is compliant)
- [ ] Mute/AudioToggle present if audio is present
- [ ] Visual + audio feedback on every major interaction
- [ ] Zone color scheme matches (see table below) — check actual background
      declarations, not just root CSS vars (some scenes have stale/unused vars)
- [ ] No `GameCoach` usage (should be `SimpleDiscoveryOverlay` if any overlay exists)
- [ ] No unguarded `console.log`/`warn`/`debug` (must be gated behind
      `import.meta.env.DEV` or a `DEBUG_UI_ENABLED`-style check)
- [ ] No fixed-px `!important` size overrides (should extend `clamp()` or a
      shared size token instead)
- [ ] Drag/hold mechanics have BOTH native `onPointerCancel` handling AND an
      explicit `isPaused`-triggered cleanup effect for active drag/hold state
      (known recurring bug class in this codebase — see `KurumedevaGame.jsx`
      fix from 2026-09-18 as the reference pattern)

## Zone color reference
| Zone | Primary | Accent | Background |
|------|---------|--------|------------|
| Symbol Mountain | `#FF5722` | `#FFD700` | `#FFF8E7` |
| Shloka River | `#2E7D32` | `#03A9F4` | `#E8F5E9` |
| About Me Hut | `#795548` | `#FF6B6B` | `#FBE9E7` |

## The 13 scenes (confirm each against App.jsx before assuming the file below is still live)

### Symbol Mountain (4)
1. `src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx` — benchmark
2. `src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx` — **actively being reworked by Madhurima, re-check fresh, do not assume prior findings still apply**
3. `src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx` (+ `TuskBeatPlayerLive.jsx`, `TuskPathGame.jsx`)
4. `src/zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8.jsx`

### Shloka River (5)
5. `src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx` (+ `VakratundaRescueGame.jsx`, `MahakayaRescueGame.jsx`)
6. `src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx` (+ `SuryakotiGame.jsx`, `SamaprabhaGame.jsx`)
7. `src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx` (+ `NirvighnamGame.jsx`, `KurumedevaGame.jsx`)
8. `src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx` (+ `SarvakaryeshuGame.jsx`, `SarvadaGame.jsx`)
9. `src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx`

### About Me Hut (4)
10. `src/zones/about-me-hut/family-tree/Familytreegame.jsx`
11. `src/zones/about-me-hut/food/Favoritefoodgame.jsx`
12. `src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx` (Dreams & Wishes — confirm this is still the live file for `dreams-wishes`, not `Wish2PlateDropGame.jsx`)
13. `src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx`

## Done this pass, don't re-run cold (2026-09-18, 3-agent zone resweep — Groups A+B+C)
Ran 3 background agents, one per zone, each covering Structure & UI (§1,2,3,16),
Runtime safety (§4,5,6,7), and Static hygiene (§9,10,11,12,13) against
`GMB_SCENE_LAUNCH_CHECKLIST.md`. Findings-only pass, fixes applied afterward by hand
(not by the agents) once confirmed:
- Symbol Mountain: agent reported "clean, no new bugs" — **this was misleading, not
  wrong about what it checked but silent on what it didn't.** Direct spot-check (by
  Madhurima's request) found 3 previously-flagged Symbol Mountain items from round 1
  were still unfixed and simply unmentioned: Tusk's Arial font, Tusk's sub-60px mobile
  touch targets, and Sacred Assembly's fixed-px `!important` overrides. The first two
  are now fixed (round 2, see punch-list). Sacred Assembly's `!important` overrides and
  dead GameCoach state are still open — held deliberately, see punch-list "New findings"
  table for why. **Lesson: a zone agent's "no new bugs" summary only covers what it
  actively found — it does not mean previously-flagged items were re-verified.** Always
  spot-check a sample of pre-existing findings against a "clean" report before trusting it.
  Confirmed Pond drag/hold pointercancel coverage and uncommitted `GarlandGame3.jsx/.css`
  changes compliant (this part of the report held up).
- Shloka River: fixed `SamaprabhaGame.jsx`'s 2 ungated debug-panel console calls
  (lines 111, 584) — DEV-gated. **False positive caught and corrected:** the agent's
  "ungated console.log in SarvakaryeshuGame.jsx/SarvadaGame.jsx" finding was against
  the dead `scene4/components/` duplicates, not the live `scene4/` files (which are
  clean, verified by import resolution + repo-wide grep). Don't re-flag those two live
  files for console.log again without re-verifying against `App.jsx`'s import path.
- About Me Hut: fixed shared `FreeDraggableItem.jsx` (single live consumer confirmed —
  `MyIndianStoryGame.jsx`'s magnifying-glass drag, no call-site compensation) — added
  `touchcancel` handling and a `disabled`-triggered mid-drag self-abort. Build-verified.
  `Favoritefoodgame.jsx:800` "unguarded console.log" from the original punchlist did
  NOT reproduce — already DEV-gated, no action needed.
- Still open for Madhurima: Dreams & Wishes (`DreamsWishesGame.css`) background palette
  doesn't match About Me Hut's zone colors — judgment call, not fixed.
Group D (live-browser pass, checklist §17) not yet run — do that as a second wave
once any further Group A/B/C fixes are approved and committed.

## Known-open items carried forward from the 2026-09-18 pass (see `GMB_AUDIT_PUNCHLIST.md` for full detail)
- Only 3 static findings remain genuinely open (round 2 fixed the rest — Arial font,
  Tusk touch targets, Vakratunda stale vars, off-palette backgrounds in Shloka Scenes 2 & 4,
  and 5 debug-panel console.logs across Vakratunda/Mahakaya/Nirvighnam/Kurumedeva/Samaprabha
  are all fixed):
  1. Sacred Assembly's fixed-px `!important` overrides on symbol images (`SacredAssemblyScene.css:590-639,840-841,863-864`) — held because each width pairs with a hand-tuned `translate()` offset; needs visual verification after a `clamp()` conversion, not just a build check.
  2. Sacred Assembly's dead GameCoach state (`SacredAssemblySceneV8.jsx`, ~12 sites) — held as non-functional, low-priority cleanup.
  3. Vakratunda's fixed-px breakpoint overrides (`VakratundaGroveSimplified.css:300-357`) — same visual-verification caveat as #1.
  4. `PondScene.css:869,970` sub-60px `.pond-trunk-reeds`/`.pond-trunk-lotus` — **not re-verified in round 2**, status unknown, check fresh.
- 6 design/content judgment calls awaiting Madhurima's decision (Sacred Assembly card-flip order, Pond emoji positioning, Sarvakaryeshu subtitle, Sarvada hide-and-seek redesign, Vakratunda re-check, opening unlock-dot threshold), plus a 7th added this pass: Dreams & Wishes (`DreamsWishesGame.css`) background palette doesn't match About Me Hut's zone colors — could be an intentional "dusk sky" sub-theme, needs Madhurima's call.
- Live-device-only items that can't be resolved by reading code (ghost-gesture on Pond/Ears/Eyes beyond what was fixed, About Me Hut's 2 unreproducible items, `AboutMeComparisonCard` clamp() conversion)
- `ObstacleRemoverGame.jsx` and `MyIndianStoryGame.jsx` flagged in the original punch-list as under-audited due to size — worth a dedicated full pass
- Repo-hygiene dead-file list — never deleted, still sitting in the repo (see punch-list bottom section)
- **(2026-09-18, later same day) `ProgressManager.SCENE_METADATA`** (lines 62-65) has
  the same stale `game1`-`game4` key problem as `ZONE_CONFIG` (which WAS fixed this
  pass) — but for display names/max-star counts, not unlock logic. Real scene IDs
  miss the lookup and fall back to generic defaults. Needs Madhurima to confirm the
  4 correct names/star totals before fixing — don't invent copy.

## Section 3 (Completion & Progress) — done this pass, don't re-run cold
A full completion/progress-persistence audit (saves-once, unlock-next, replay,
continue, reload-restore) ran across all 13 scenes on 2026-09-18. 11 of 13 were
clean. Two real fixes landed: `PondSceneSimplifiedV4.jsx` had no dedupe guard on
its completion save (fired from 2 call sites, now guarded); `ProgressManager`'s
`ZONE_CONFIG['about-me-hut'].scenes` had stale IDs breaking its auto-unlock block
(now corrected). See `GMB_AUDIT_PUNCHLIST.md`'s "Fixed this session" section for
detail. Re-verify only if either file changes again — don't re-audit from scratch.

## What NOT to re-litigate
- Anything already committed this session (`b5e8abd`) is fixed: KurumedevaGame's
  debug gate + pause-cleanup, BeatPlayerGame's pointercancel/isPaused RAF fix,
  TuskBeatPlayerLive's isPaused wiring. Don't re-flag these unless a fresh read
  shows they've regressed.
- ShlokaRiverFinale.jsx was audited clean end-to-end on 2026-09-18 — still worth
  a quick re-check given how much has changed elsewhere, but it's not a blind spot.
