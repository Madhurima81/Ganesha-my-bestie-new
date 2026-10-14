# Pitfall Sweep - Checks 2-6 Only

Scope: read-only audit of the 13 live scenes from `src/config/sceneRegistry.js` and rendered live files. Excludes obsolete Meaning Cave, parked Festival Square, backups, and imported-but-unused files.

Check 1 (Play Again / reset gaps) is intentionally skipped. Madhurima verified Play Again in all 13 scenes on 2026-10-14, and `DECISIONS.md` records that as VERIFIED.

## Confirmed Risk

1. Shloka River scenes 10-13 use raw Web Speech wrappers that call the completion callback on `onerror`.
   - Evidence: `src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx:385,395-396`; `src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx:318,328-329`; `src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx:313,323-324`; `src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx:326,334-335`.
   - Why it matters: cancelled/interrupted speech can arrive through `onerror`; these wrappers treat it like a real finish. If a caller advances phase, reveals, or saves a done marker from that callback, it can skip unfinished audio.
   - Fix size: medium, about 20-35 lines per wrapper or one shared helper used by all four wrappers.
   - Test: start a guidance line, leave during it, Continue, and confirm the line is not counted finished unless it really played.

2. Shloka River scenes 10-13 use raw Web Speech without the `useGaneshaVoice` start watchdog.
   - Evidence: raw utterances at `VakratundaGroveSimplified.jsx:385`, `SuryakotiBankSimplified.jsx:318`, `NirvighnamChantSimplified.jsx:313`, and `SarvakaryeshuChantSimplified.jsx:326`. Known good watchdog lives in `src/lib/hooks/useGaneshaVoice.js:280-308`.
   - Why it matters: Chrome can wedge after repeated `cancel()`, so the next raw utterance may never start.
   - Fix size: medium if duplicated, small-medium if extracted into a shared helper.
   - Test: Play Again or Continue repeatedly in each Shloka River wrapper and confirm first gameplay line always starts.

3. Shared `OpeningModal` uses raw speech without the start watchdog.
   - Evidence: `src/zones/shared/components/OpeningModal.jsx:90-103` creates and speaks a `SpeechSynthesisUtterance` directly.
   - Why it matters: the opening line is specifically called out in pitfall 57 as not covered by the fixed `useGaneshaVoice` engine.
   - Fix size: small, about 20-30 lines by adding a one-retry start-watch similar to `useGaneshaVoice`.
   - Test: repeat Play Again from completion modal across several scenes and confirm the opening voice always starts.

4. Nirvighnam Chant has the exact unstable timer dependency shape from pitfall 4.
   - Evidence: `src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx:780-784` schedules `safeSetTimeout(() => triggerReveal(), revealDelay)` and depends on whole `sceneState` plus `sceneActions`.
   - Why it matters: a checkpoint/re-render can recreate the effect, cleanup/cancel a pending reveal timer, or race the reveal guard.
   - Fix size: small-medium, about 10-20 lines to depend on scalar fields and refs.
   - Test: finish each word after a normal play and after Continue; confirm exactly one reveal card appears.

5. Sarvakaryeshu Chant reveal/completion path has a similar timer dependency risk and weaker reveal dedupe than Nirvighnam.
   - Evidence: `src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx:651-694` schedules `window.setTimeout(() => triggerReveal(), ...)` from a callback depending on whole `sceneState` and `sceneActions`. Restore path can also call `handleAppDiscoveryCelebrate()` at `SarvakaryeshuChantSimplified.jsx:632-636`, while live path calls it after final card completion at `SarvakaryeshuChantSimplified.jsx:545-550`.
   - Why it matters: unlike Nirvighnam, this file does not show a `revealStartedRef` guard around all reveal paths in the audited lines, so duplicate reveal/celebration is more plausible.
   - Fix size: small-medium, likely a shared `revealStartedRef` / `completionSavedRef` guard.
   - Test: leave during final Sarvada reveal/celebration and Continue; confirm one reveal, one completion save, one modal.

## Possible

1. Ears child game uses direct speech outside `useGaneshaVoice`.
   - Evidence: `src/zones/symbol-mountain/scenes/tusk/EarsSoundMatchGame.jsx:344-389`.
   - Status: parent is wired through guarded progress callbacks at `src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx:928-930` and nearby Ears/Tusk props, but the child bypasses the shared watchdog.
   - Test: leave during an Ears success line and Continue; confirm the same line replays and is not counted done.

2. `useVoiceGuidance` still contains a raw TTS path without the `useGaneshaVoice` start watchdog.
   - Evidence: `src/lib/hooks/useVoiceGuidance.js:197,243`.
   - Status: many scenes use `useVoiceGuidance`; most current lines appear to run through `useGaneshaVoice`, recorded files, or scene-specific wrappers, but any fallback TTS line remains a possible engine-wedge path.
   - Test: identify an actual live `playVoice` fallback-to-TTS line before changing this shared hook.

3. Completion save may fire more than once in Shloka River wrappers if final reveal restore and live final reveal both run.
   - Evidence: Suryakoti and Sarvakaryeshu call `persistCompletion()` from unguarded handlers (`SuryakotiBankSimplified.jsx:492-502`, `SarvakaryeshuChantSimplified.jsx:702-711`). Nirvighnam also calls `persistCompletion()` at `NirvighnamChantSimplified.jsx:792-799`, but has stronger reveal dedupe elsewhere.
   - Status: possible, not proven. The saves are idempotent-looking, but no `completionSavedRef` was visible in these handlers.
   - Test: resume during the final reveal/mandala close and inspect that `ProgressManager.updateSceneCompletion` is called once.

4. Shloka River Finale completion save has no visible one-shot guard.
   - Evidence: `src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx:1052-1082` saves completion and opens the modal in `handleOrbsComplete`.
   - Status: possible only if `handleOrbsComplete` can be invoked twice by the orbs animation or resume path.
   - Test: complete Finale and reload/tap during the orbs celebration; confirm one save and one modal open.

5. Modak child subgames still need a narrow rendered-file callback pass.
   - Evidence: parent save callbacks for Flower Journey and Garland are at `src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx:1709,1722`. Rendered subfiles include `FlowerJourneyGame2.jsx` and `GarlandGame3.jsx`, which use direct speech paths.
   - Status: possible because the parent itself routes scene lines through tracked voice, but the rendered subgames own some raw speech behavior.
   - Test: leave during Flower/Garland success lines and confirm the appropriate done marker is not saved early.

## Fine

1. StrictMode started-flag-before-timer pattern was not found in the 13 live scene components.
   - Evidence: targeted search found no `startedRef.current = true` pattern in live scene files. Sacred Assembly explicitly documents the correct pattern and sets `resumeHandledRef.current = true` inside the timer at `src/zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8.jsx:1656-1668`.

2. Pond completion save is guarded.
   - Evidence: `src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx:1048-1050` returns if `pondCompletionSavedRef.current` is already true before saving.

3. Sacred Assembly completion save has explicit helper paths and no raw speech callback save found in the parent.
   - Evidence: completion transition waits for `sceneCompleteVOFinished` before showing the modal at `src/zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8.jsx:1610-1631`; save helpers write completion at `SacredAssemblySceneV8.jsx:260-268`, `1736-1743`, and `1829-1837`.

4. About Me Hut speech callbacks are generally guarded.
   - Evidence: Family Tree documents mixed engines and cleanup ordering at `src/zones/about-me-hut/family-tree/Familytreegame.jsx:1114-1115`; Favorite Food stores success markers in initial state at `src/zones/about-me-hut/food/Favoritefoodgame.jsx:173-183`; Dreams `speakLine` wrapper handles cancel flow around `src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx:546-568`; My Indian Story declares `aliveRef` before `useGaneshaVoice` at `src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx:471-478` and uses elapsed-time checks at `MyIndianStoryGame.jsx:1386-1394`, `1774-1780`, `1834-1846`, `1897-1903`.

5. Symbol Mountain parent scene voice mostly uses `useGaneshaVoice`.
   - Evidence: Modak uses `useGaneshaVoice` at `NewModakSceneV7.jsx:498`; Pond at `PondSceneSimplifiedV4.jsx:437`; Symbol / Eyes-Ears-Tusk at `SymbolMountainSceneV3.jsx:289`; Sacred Assembly at `SacredAssemblySceneV8.jsx:644`.

## 10-Line Summary

1. Check 1 is skipped because Play Again was manually verified in all 13 scenes.
2. The highest-risk issue is raw Web Speech in Shloka River scenes 10-13.
3. Those wrappers treat `onerror` as a completed line, which can advance after cancel/interruption.
4. Those same wrappers also lack the `useGaneshaVoice` start watchdog.
5. Shared `OpeningModal` also lacks the start watchdog for its raw opening VO.
6. Nirvighnam has the exact unstable `sceneState` + timer dependency shape from pitfall 4.
7. Sarvakaryeshu has a similar reveal/completion timer risk and less visible dedupe.
8. No live scene showed the known started-ref-before-timer StrictMode pattern.
9. Pond completion save is one-shot guarded; several Shloka completion saves are only possibly double-callable.
10. Recommended Phase 2 order: OpeningModal watchdog, shared Shloka raw-speech guard/watchdog, Nirvighnam deps, Sarvakaryeshu reveal/completion dedupe, then targeted Ears/Modak child callback checks.
