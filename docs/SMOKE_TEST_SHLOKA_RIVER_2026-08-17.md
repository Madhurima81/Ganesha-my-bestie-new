# Smoke Test — Shloka River (Zone 3, all 5 scenes)

**Date:** 2026-08-17
**Tester:** Claude Code — **static code review only, not live-tested**
**Protocol:** [10-Point Smoke Test](../CLAUDE.md) (see memory: `feedback_10_point_smoke_test`)

**This is the single, standing smoke-test log for Shloka River.** New scenes/re-tests get appended below as new dated sections — do not create a new file per scene.

---

## Why static-only this session
This session's browser-automation tooling had persistent issues (`document.hidden` stuck `true`, a tab/server restart wiping `localStorage` mid-session — see [SMOKE_TEST_SYMBOL_MOUNTAIN_2026-08-17.md](SMOKE_TEST_SYMBOL_MOUNTAIN_2026-08-17.md) for full detail) that made live playthrough unreliable, and Shloka River is paid/locked content requiring a full replay from a fresh profile to reach. Did a source-level check instead: benchmark checklist (imports/wiring against [NewModakSceneV7.jsx](../src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx)) plus a full-zone scan for banned fonts.

---

## Benchmark checklist — all 5 scenes checked, all clean

| Scene | File | useSceneReset | HomeButton | AudioToggle | SceneCompletionCelebration | ProgressManager.updateSceneCompletion |
|---|---|---|---|---|---|---|
| Vakratunda Grove | [VakratundaGroveSimplified.jsx](../src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx) | ✅ | ✅ | ✅ | ✅ | ✅ (not commented out) |
| Suryakoti Bank | [SuryakotiBankSimplified.jsx](../src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Nirvighnam Chant | [NirvighnamChantSimplified.jsx](../src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sarvakaryeshu Chant | [SarvakaryeshuChantSimplified.jsx](../src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Shloka River Finale | [ShlokaRiverFinale.jsx](../src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx) | ✅ | ✅ | ✅ | ✅ | ✅ |

All 5 scenes wire the shared components consistently — no missing imports, no commented-out completion calls (unlike a bug found in Cave of Secrets' first scene, out of scope for this doc).

## Font scan — 1 finding, but dead code (no live impact)
**File:** [VakratundaGrove.css:177](../src/zones/shloka-river/scenes/Scene1/VakratundaGrove.css#L177)
```css
font-family: 'Comic Sans MS', 'Baloo 2', cursive; /* Matching font stack */
```
Comic Sans MS listed *first* in the stack — would win over Baloo 2 on any system that has it installed. **But traced the usage: this file is orphaned.** The live scene ([VakratundaGroveSimplified.jsx](../src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx), per `sceneRegistry.js`) imports `VakratundaGroveSimplified.css`, not this file — and a project-wide search confirms `VakratundaGrove.css` isn't imported anywhere. Not fixed (zero live impact); flagging for cleanup next time that file is touched, same as the dead CSS found in Symbol Mountain's Scene 3.

## Not checked (needs live testing)
All 10 smoke-test points require actual gameplay — none of the shloka-chanting mechanics, VO sync, or completion flow were exercised. Needs a full live pass once reachable (either a real device, or once a fresh profile can get this far without the tooling issues noted above).
