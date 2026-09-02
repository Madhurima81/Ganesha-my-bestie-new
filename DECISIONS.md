# DECISIONS.md
Locked calls — check here before re-litigating. Don't re-ask Claude about these.

- [2026] Scene completion must call `persistCompletion()` at state-write time, NOT inside animation callbacks. Reason: animation callbacks can be skipped/interrupted, causing lost progress.
- [2026] `InnerMandala` petal ring assignment: outer ring = shloka/teal, middle ring = symbols/gold. Do not swap.
- [2026] ZoneWelcome card positioning uses `scene.order`, NOT `index+1`. Index-based positioning breaks when scenes are reordered.
- [2026] Mandap Light Challenge (Festival Square) runs untimed — timer removed intentionally for accessibility/frustration reasons.
- [2026] Stage scenes use % positioning only — no vw/vh inside scenes. Chrome/UI screens (non-stage) may use viewport units.
- [2026] Portrait mode = rotate-device overlay, not a portrait layout. No portrait-responsive design work needed.
- [2026] SceneStage fixed design resolution: 1280×800, uniform CSS scale — this is the fix for cross-device tap/drag coordinate drift. Don't reintroduce relative/dynamic coordinate systems per scene.
- [2026-09-02] SUPERSEDES the above for Symbol Mountain: `src/components/SceneStage.jsx` was commented out / never wired into the 4 Symbol Mountain scenes because it caused layout issues. Those scenes (NewModakSceneV7, PondSceneSimplifiedV4, SymbolMountainSceneV3, SacredAssemblySceneV8) render straight into the viewport via `.<scene>-container { position:absolute; inset:0 }` and use per-scene `%` positioning + `clamp()` sizing + `@media` breakpoints. Zone 1 mobile/CSS work = fix in place at this architecture; do NOT migrate Zone 1 to SceneStage. The 1280×800 stage decision still stands only where SceneStage is actually mounted (verify per scene before assuming it applies).
- [2026] Fonts: Baloo 2 for headings, Nunito for body — set in index.html globally, always applies.
- [2026] Bug severity tiers: 🔴 Tier 1 (blocks progress/softlock), 🟠 Tier 2 (visible/annoying but workaroundable), 🟡 Tier 3 (cosmetic). Use this scale in all bug sweeps.

<!-- Add new entries below in format: [date] - decision - reason -->
- [2026-08-31] Replay analytics (`sceneAnalytics.js`) is fully decoupled from ProgressManager — no imports, no shared state. ProgressManager stays sole source of truth for parent-facing completion. Reason: analytics must never affect completion writes. Don't revisit unless analytics needs completion-derived fields (then read from localStorage, not ProgressManager).
- [2026-08-31] `sceneAnalytics` reuses CloudSync's anonymous auth session via read-only `whenReady()`/`getUserId()`, does NOT open its own. Reason: a second `signInAnonymously()` would key analytics rows to a different `auth.uid()` than progress. Don't revisit unless CloudSync's auth model changes.
- [2026-08-31] `scene_plays` uses snake_case columns (not spec camelCase) to match existing tables; PK (user_id, child_id, scene_id, game_id); increments via `increment_scene_play()` SQL function, never row-per-play.
