# QA Checklist — Gesture Demo, Idle Hints, Modal CSS, VO Replay, Mandala

**Date:** 2026-08-17
**Tester:** Claude Code — static code review only, not live-tested (see [SMOKE_TEST_SYMBOL_MOUNTAIN_2026-08-17.md](SMOKE_TEST_SYMBOL_MOUNTAIN_2026-08-17.md) for this session's tooling caveats)

**This is the single, standing doc for these 5 cross-zone mechanics.** Re-checks/new scenes get appended below — don't create a new file per scene or per zone for this topic.

Covers all scenes in the 3 active zones (Symbol Mountain, Shloka River, About Me Hut). Item "close button → close-modal pattern" from the original 6-item list is tracked separately as an open TODO, not a check — not included here.

---

## 1. Gesture Demo — which scenes/mini-games use it

**Only used in Shloka River**, specifically in the sub-games nested inside Scenes 1–3. Not used anywhere in Symbol Mountain or About Me Hut.

| Zone Scene | Mini-game file | Gesture type(s) | `idleDelay` | Gated on |
|---|---|---|---|---|
| Scene 1 (Vakratunda Grove) | [VakratundaRescueGame.jsx](../src/zones/shloka-river/scenes/Scene1/VakratundaRescueGame.jsx) | `drag` | **500ms** ⚠️ outlier | `phase==='build' && selectedMaterial && placedCount===0 && !dragging` |
| Scene 1 (Vakratunda Grove) | [MahakayaRescueGame.jsx](../src/zones/shloka-river/scenes/Scene1/MahakayaRescueGame.jsx) | `drag`, `pull-down` (2 separate demos) | 3000ms | rope-stage-specific (`detached`/`attached`) && `phase==='play'` && `locked===0` |
| Scene 2 (Suryakoti Bank) | [SuryakotiGame.jsx](../src/zones/shloka-river/scenes/Scene2/components/SuryakotiGame.jsx) | `scratch` | 3000ms | `phase==='play' && litCount===0` |
| Scene 2 (Suryakoti Bank) | [SamaprabhaGame.jsx](../src/zones/shloka-river/scenes/Scene2/components/SamaprabhaGame.jsx) | `drag` | 3000ms | `phase==='play' && currentStop===0` |
| Scene 3 (Nirvighnam Chant) | [NirvighnamGame.jsx](../src/zones/shloka-river/scenes/Scene3/NirvighnamGame.jsx) | `drag` | 3000ms | `phase==='play' && cleared.length===0` |
| Scene 3 (Nirvighnam Chant) | [KurumedevaGame.jsx](../src/zones/shloka-river/scenes/Scene3/KurumedevaGame.jsx) | `tap` | 3000ms | `phase==='play' && friendStep===0` |

**Finding:** `VakratundaRescueGame.jsx` uses `idleDelay={500}` — 6x faster than every other gesture demo in the codebase (all others are `3000`). At 500ms, the hand-gesture tutorial would appear almost immediately after the material is selected, before a child has any real chance to try it themselves first. This looks like a real inconsistency worth a second look — either a leftover debug value or a genuine intentional exception (worth asking Madhurima rather than guessing).

Scenes 4 (Sarvakaryeshu Chant) and 5 (Finale) don't use GestureDemo at all — their mini-games ([SarvakaryeshuGame.jsx](../src/zones/shloka-river/scenes/scene4/SarvakaryeshuGame.jsx), [SarvadaGame.jsx](../src/zones/shloka-river/scenes/scene4/SarvadaGame.jsx)) rely on idle hints only (see below), no gesture tutorial overlay.

---

## 2. Idle hint timing per mini-game — is it consistent

All 8 Shloka River sub-games use the shared [useRepeatedHintCycle](../src/lib/hooks/useRepeatedHintCycle.js) hook (3-level escalation: gentle pulse ×3 → stronger hint → explicit hint). Symbol Mountain (Modak, and by extension the rest of that zone) uses a **separate, hand-rolled** idle-timer system instead — not the shared hook.

| Scene | Mini-game | `initialDelay` | `pulseInterval` | `level2Delay` | `level3Delay` |
|---|---|---|---|---|---|
| 1 | VakratundaRescueGame | 7000–8500 (stage-dependent) | 1800 | 15000–16000 | 22000–23000 |
| 1 | MahakayaRescueGame | 7000–8000 (stage-dependent) | 1800 | 14000–15000 | 21000–22000 |
| 2 | SuryakotiGame | 8000 | 1800 | 15500 | 22500 |
| 2 | SamaprabhaGame | 8000 | 1800 | 15000 | 22000 |
| 3 | NirvighnamGame | 8000 | 1800 | 15000 | 22000 |
| 3 | KurumedevaGame | 8000 | 1800 | 15000 | 22000 |
| 4 | SarvakaryeshuGame | 8500 | **1500** ⚠️ | 16000 | 23000 |
| 4 | SarvadaGame | 7000 | **1400** ⚠️ | 15000 | 22000 |

**Finding:** `pulseCountBeforeEscalation: 3` is consistent everywhere. `pulseInterval` is `1800` in every mini-game across Scenes 1–3, but Scene 4's two mini-games use `1500` and `1400` — noticeably faster pulsing (repeats every 1.4-1.5s instead of 1.8s). `initialDelay`/`level2Delay`/`level3Delay` vary in the 7000-8500/14000-16000/21000-23000 ranges — small stage-dependent variance (e.g. faster hint once material is already selected) looks intentional, but Scene 4's faster pulse interval stands out as a possible unintentional drift rather than a deliberate pacing choice. Worth a quick confirm.

Symbol Mountain's separate system (Modak: `idleHintsEnabled`/`startIdleTimer`/`stopIdleTimer`) was not compared value-for-value here since it's a structurally different implementation — flagged previously as a pattern inconsistency, not re-measured in this pass.

---

## 3. Opening vs. closing modal CSS parity — per scene

The shared components ([OpeningModal.css](../src/zones/shared/components/OpeningModal.css), [SceneCompletionCelebration.css](../src/lib/components/celebration/SceneCompletionCelebration.css)) are used identically by every scene in all 3 zones — no scene ships its own override CSS for these two shared modals. So the finding is zone/scene-independent, not per-scene:

- **Card surface: consistent.** Both reuse the same SVG background (`openingmodal.svg`) and identical shadow value (`0 10px 24px rgba(40,20,80,0.12)`).
- **Backdrop blur: inconsistent.** Opening `blur(8px)` vs. completion `blur(2px)` — 4x weaker on the completion screen, same everywhere since it's shared CSS.
- **Close/exit animation: inconsistent.** Completion modal has a defined fade-out (`modalFadeOut`/`backdropFadeOut`); opening modal has none — likely closes abruptly everywhere, since again this is shared CSS, not scene-specific.

Since this is driven by shared CSS, the fix (if wanted) is a single edit to the two shared files, not per-scene work.

---

## 4. VO replay — per scene, is it working

| Zone | Scene | Wiring pattern | Phase-aware? |
|---|---|---|---|
| Symbol Mountain | Modak | `getLine`/`speak` mode — `lastVoRef` updated by every VO call via a `replaySpeak` wrapper (confirmed: only 1 raw `speak()` call in the file, inside the wrapper) | ✅ tracks last-played line correctly |
| Symbol Mountain | Pond | `onReplay={replayCurrentVoice}`, branches on `sceneState.phase` | ✅ |
| Symbol Mountain | Symbol (tusk) | `onReplay={replayCurrentVoice}`, branches on `sceneState.phase` | ✅ |
| Symbol Mountain | Sacred Assembly (finale) | `onReplay={replayVoiceForCurrentPhase}` (differently named, same pattern) | ✅ |
| Shloka River | Vakratunda Grove | `replayCurrentVoice`, branches on `phase` + sub-stage (`vakratundaStage`) | ✅ |
| Shloka River | Suryakoti Bank | `replayCurrentVoice`, branches on `phase` (SURYAKOTI_GAME / SAMAPRABHA_GAME) | ✅ |
| Shloka River | Nirvighnam Chant | `replayCurrentVoice`, branches on `phase` (NIRVIGHNAM_GAME / KURUMEDEVA_GAME) | ✅ |
| Shloka River | Sarvakaryeshu Chant | `replayCurrentVoice`, branches on `phase` (SARVAKARYESHU_GAME / SARVADA_GAME) | ✅ |
| Shloka River | **Finale** | **No `VOReplayButton` and no `replayCurrentVoice` anywhere in the file** ⚠️ | N/A — feature absent |
| About Me Hut | Family Tree | `replayCurrentVoice`, branches on `gamePhase` + sub-state (`flippedMember`) | ✅ |
| About Me Hut | Favorite Food | `replayCurrentVoice`, branches on `gamePhase` + completion state | ✅ |
| About Me Hut | Dreams and Wishes | `replayCurrentVoice`, branches on `gamePhase` + completion state | ✅ |
| About Me Hut | My Indian Story | `replayCurrentVoice`, wired to `VOReplayButton` | ✅ |

**Finding:** 12 of 13 scenes correctly implement phase-aware VO replay. **The Shloka River Finale scene has no VO replay button at all** — same scene that also skips the InnerMandala (see below). Both gaps in the same scene suggest this may be a deliberate "finale scenes get a simpler treatment" pattern rather than an oversight, but worth a direct confirm since it's a genuine feature absence, not just a styling nit.

---

## 5. Mandala consistency — per scene

| Zone | Scene | Uses `InnerMandala`? | Petal-state value used |
|---|---|---|---|
| Symbol Mountain | Modak | ✅ | `'awakened'` |
| Symbol Mountain | Pond | ✅ | `'awakened'` |
| Symbol Mountain | Symbol (tusk) | ✅ | `'awakened'` |
| Symbol Mountain | Sacred Assembly (finale) | ❌ not used | — |
| Shloka River | Vakratunda Grove | ✅ | `'activated'` |
| Shloka River | Suryakoti Bank | ✅ | `'activated'` |
| Shloka River | Nirvighnam Chant | ✅ | `'activated'` |
| Shloka River | Sarvakaryeshu Chant | ✅ | `'activated'` |
| Shloka River | Finale | ❌ not used | — |
| About Me Hut | all 4 scenes | ❌ not used anywhere in this zone | — |

**Finding — false alarm resolved:** Symbol Mountain scenes use petal-state `'awakened'`, Shloka River scenes use `'activated'`. Checked [InnerMandala.jsx:67-68](../src/lib/components/celebration/InnerMandala.jsx#L67) — `isActive()` explicitly accepts **both** values (plus `'energized'`, `'bloomed'`, `'glowing'`), by design, precisely to tolerate this kind of naming variance across zones. Not a bug.

**Real pattern, not a bug (needs confirm):** both zone-finale scenes (Sacred Assembly, Shloka River Finale) skip the mandala — likely because each finale has its own bigger culminating visual instead (the fully-assembled Ganesha for Symbol Mountain; presumably a full shloka recap for Shloka River, matching its reset config's `slots: Array(8).fill(null)`). About Me Hut doesn't use the mandala in any scene — different zone, likely has its own completion visual (family tree, story recap, etc.) instead. None of this looks like an oversight, but flagging so it's a confirmed decision rather than an assumption.

---

## Summary of open questions (not yet confirmed as bugs or intentional)
1. `VakratundaRescueGame.jsx` gesture-demo `idleDelay={500}` vs. `3000` everywhere else — intentional or drift?
2. Scene 4 (Sarvakaryeshu Chant) hint `pulseInterval` (1400-1500) vs. `1800` everywhere else — intentional pacing or drift?
3. Shloka River Finale has no VOReplayButton and no InnerMandala — deliberate "finale gets simpler treatment," or gaps?
4. Opening modal has no fade-out transition while completion modal does — worth adding for polish parity?
5. Opening modal's backdrop blur (8px) vs. completion's (2px) — intentional visual distinction or drift?
