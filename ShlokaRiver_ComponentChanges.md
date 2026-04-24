# GANESHA MY BESTIE
## Shloka River — Component Change Log
**Date:** 22 April 2026 | **Session:** iOS audit + component cleanup

---

## Overview

This document records every change made to the Shloka River zone components during the iOS audit and component-cleanup session. Changes span five files. Each entry lists what changed, why it was needed, and the exact code modification for Claude Code to apply.

---

## 1. SyllableVoiceChallenge.jsx

> Core — used in every Shloka River scene. Critical iOS fix.

**Tags:** `iOS Fix` `UX` `All Scenes`

**What changed**
Replace auto-pass iOS fallback with a tap-to-confirm button.

**Why**
The previous fallback auto-passed the child after 1800ms regardless of whether they said anything. This is meaningless — the pedagogical moment (hear it, say it, confirm) is lost. `SpeechRecognition` is not supported on iOS Safari or iOS WKWebView. Android/Chrome keep the full recognition path unchanged.

**How**
- Add `showTapConfirm` state (boolean, default false)
- In `startListening()`: when `!supportsRecognition`, set `phase="listening"`, start waveform animation, `setShowTapConfirm(true)`. Remove the `setTimeout` auto-pass
- In render (inside `phase !== "result"` block): show `"I said it! ✓"` button when `showTapConfirm` is true. On tap: `stopWave`, `setShowTapConfirm(false)`, `burstStars`, `showResult("good", "Great! Keep going! 🌟")`
- In `handleClose()`: add `setShowTapConfirm(false)` so state clears if child dismisses the challenge
- Android path (`supportsRecognition === true`) is completely unchanged

---

## 2. VakratundaGroveSimplified.jsx

> Scene shell for Vakratunda and Mahakaya word games.

**Tags:** `Dead Code` `Cleanup`

**What changed**
Remove four dead imports and their render usage: `MessageManager`, `InteractionManager`, `ProgressiveHintSystem`, `PowerUnlockOverlay`.

**Why**
These components do nothing in the current scene. `MessageManager` is rendered with `messages={[]}` — never displays anything. `InteractionManager` is a passthrough wrapper with no consumed props. `ProgressiveHintSystem` is rendered with `enabled={false}` and `hintConfigs={[]}` — completely disabled. `PowerUnlockOverlay` is fully commented out with a note saying "superseded by SymbolAutoReveal". All four add bundle weight, render overhead, and confusion during debugging.

**How**
- Remove: `import MessageManager from ".../MessageManager"`
- Remove: `import InteractionManager from ".../InteractionManager"`
- Remove: `import ProgressiveHintSystem from ".../ProgressiveHintSystem"`
- Remove: `import PowerUnlockOverlay from ".../PowerUnlockOverlay"` (line 26)
- Remove: `<InteractionManager>` wrapper tags (lines 748, 1135)
- Remove: `<MessageManager messages={[]}>` wrapper tags (lines 749, 1134)
- Remove: `<ProgressiveHintSystem ref={useRef(null)} sceneId={sceneId} hintConfigs={[]} enabled={false} />` render block (lines 1124–1131)
- Remove: the entire commented-out `PowerUnlockOverlay` JSX block (lines 915–941)
- Keep everything else — `FireworksCompletion`, `CalmGoldenFireworks`, `SymbolAutoReveal`, `AppSidebar`, `GaneshaGestureCue` are all active

---

## 3. MemoryGameEngine.jsx

> Mode router between VakratundaGame/MahakayaGame and AutoPlayMode/ManualRoundMode.

**Tags:** `Dead Code` `Cleanup` `⚠️ Confirm First`

**What changed**
Remove `ManualRoundMode`, `ModeSelectionModal`, and all related mode-switching infrastructure. Remove all `console.log` calls.

**Why**
`VakratundaGroveSimplified` always passes `selectedMode="auto"` and `skipModeSelection={true}` to both games. `ManualRoundMode` is therefore never rendered. `ModeSelectionModal` `showModeModal` is always false. `handleSwitchToAuto` and `handleEarlyExit` are only called from `ManualRoundMode`. The Priority 2–5 fallback logic in the initialization `useEffect` never runs.

**⚠️ CONFIRM FIRST:** grep all scene files for `skipModeSelection={false}` or `selectedMode="manual"`. If any scene uses manual mode, keep `ManualRoundMode` for those scenes only.

**How**
- Confirm no other Shloka River scene uses `skipModeSelection={false}` or `selectedMode="manual"` before proceeding
- Remove: `import ManualRoundMode from "./ManualRoundMode"`
- Remove: `import ModeSelectionModal from "./ModeSelectionModal"`
- Remove: `showModeModal` state and `setShowModeModal`
- Remove: `manualModeKey` state and `setManualModeKey`
- Remove: `handleModeSelection` function
- Remove: `handleSwitchToAuto` function
- Remove: `handleEarlyExit` function
- Remove: Priority 2, 3, 4, 5 branches from the initialization `useEffect` — keep only Priority 1 (`savedGameState?.gameMode`)
- Remove: `<ModeSelectionModal>` render
- Remove: `{selectedMode === "manual" && <ManualRoundMode ...>}` render block
- Remove: `onSwitchToAuto` from `commonProps`
- Remove all `console.log()` calls (approximately 12 across the file). The render-level one fires on every render

---

## 4. VakratundaGame.jsx

> Thin wrapper connecting Vakratunda config + assets to MemoryGameEngine.

**Tags:** `Dead Props` `Cleanup`

**What changed**
Remove three dead props from the component signature: `getBudImage`, `getLotusImage`, `getBabyElephantImage`.

**Why**
These three props are in the destructured prop signature but are never forwarded to `MemoryGameEngine`. The asset getters are defined inline using direct imports (`lotusBud`, `lotusbitBloom`, etc.) rather than using the prop values. The props are accepted but silently ignored.

**How**
- In `VakratundaGame` prop destructuring, remove: `getBudImage`, `getLotusImage`, `getBabyElephantImage`
- Verify `VakratundaGroveSimplified` does not pass these props to `VakratundaGame` — if it does, remove them from the call site too
- No other changes needed — the component is otherwise a clean thin wrapper

---

## 5. AutoPlayModeV2.jsx

> The active game mode — renders elephants, lotus, and SyllableVoiceChallenge.

**Tags:** `Cleanup` `Low Priority`

**What changed**
Remove `console.log` calls. Dead code from multi-round era is noted but not removed.

**Why**
`AutoPlayModeV2` has approximately 15 `console.log` calls scattered through the pause/resume logic and flow handlers. The multi-round infrastructure (round stars display, `renderPreviousCentralElements`, `renderDualInitials`/`renderDualRewards`) is dead because `startRound=3` means only one round ever runs. However these render conditionals evaluate false cleanly — not worth the refactor risk before freeze.

**How**
- Remove all `console.log()` calls in `AutoPlayModeV2.jsx`
- Leave the multi-round render conditionals in place — they evaluate false and do not affect behaviour
- Note for post-freeze: if a full `AutoPlayMode` rewrite is done for other scenes, strip the multi-round paths at that point

---

## Summary — All Changes

| File | Changes Needed | When |
|------|---------------|------|
| `SyllableVoiceChallenge.jsx` | iOS tap-to-confirm fallback (replaces auto-pass) | Apply now |
| `VakratundaGroveSimplified.jsx` | Remove 4 dead imports + render blocks | Apply now |
| `MemoryGameEngine.jsx` | Remove ManualRoundMode + console.logs (confirm no manual usage first) | Confirm then apply |
| `VakratundaGame.jsx` | Remove 3 dead props from signature | Apply now |
| `AutoPlayModeV2.jsx` | Remove console.logs only | Apply now |

> All changes above are isolated — no shared component outside Shloka River is affected except `SyllableVoiceChallenge` (which improves iOS behaviour for all scenes that use it).

---

---

## Full Session — File Status

Complete record of every file touched this session across ALL zones. Use this as your deployment checklist.

---

### ✅ Already Changed — Ready to Deploy

These files have been edited and output. Copy them directly into your codebase.

---

#### ObstacleRemoverGame.jsx
**Zone:** About Me Hut — S21

**What changed:** VO reload fix, idle hint pulse-and-clear, iOS tab-switch fixes.

- **RELOAD:** Removed all 5 blocking refs (`blockPhaseVoDuringReloadReplayRef`, `suppressCelebrationVoOnReloadRef`, `suppressPhaseVoUntilReloadSettlesRef`, `reloadHandledRef`, `hasHydratedOnceRef`). Replaced reload handler with Modak-pattern `useEffect([], [])` — each phase resets state then calls `speakLine()` at `setTimeout(500ms)`. Added single `reloadVoFiredRef` (one-time flag, clears after VO fires) to guard phase VO effect during reload render
- **RELOAD:** Removed duplicate phase VO effect (was running twice). Removed separate intro VO effect (was double-firing)
- **RELOAD:** Removed `replayPhaseVoiceOnReload()` — entire function deleted. Was using `safeSetTimeout` retries that could be swallowed on iOS
- **IDLE HINTS (wish1):** Replaced `setInterval` with `setTimeout` ladder. Level fires → CSS animation plays (finite cycles) → level resets to 0 → bubble returns to normal. Level 3 stays on (child stuck)
- **IDLE HINTS (wish2/wish3/dream):** Same `setTimeout` ladder pattern. Single unified `useEffect` handles all three phases
- **IDLE HINTS:** Fixed CSS class names: `hint-glow` → `hint-strong`, `hint-strng` → `hint-final` to match CSS definitions
- **IDLE HINTS:** Fixed inline drop-shadow styles — were using `>=` so they stayed permanently. Now use `===` so they clear with the level
- **iOS TAB-SWITCH:** `onHide` now calls `setBubbles([])` and clears `activeWish1BubbleKeysRef` — stale bubbles no longer sit on screen after return
- **iOS TAB-SWITCH:** `onHide` now calls `setSelectedWish2FoodKey(null)` — cancels any in-flight wish2 food selection if app is backgrounded mid-tap
- **TAB-SWITCH RESUME VO:** Added `intro` case to `getResumeVoiceLine()` — was returning null causing no VO on tab return when on intro phase

---

#### Favoritefoodgame.jsx
**Zone:** About Me Hut — S20

**What changed:** Reload handler rewritten to Modak pattern. 4 dead refs removed. Idle hint fix.

- Removed 4 refs: `reloadHandledRef`, `hasHydratedOnceRef`, `suppressCelebrationVoOnReloadRef`, `suppressPhaseVoUntilReloadSettlesRef`
- Added single `reloadVoFiredRef` (same pattern as ObstacleRemoverGame fix)
- Reload handler rewritten to `useEffect([], [])` — per-phase: reset state + `setTimeout(500ms, speakLine)`. Celebration phases (`food-correct` etc.) fold into their choice phase branch
- Phase VO effect: replaced 3-layer guard block with single `if (reloadVoFiredRef.current) return`
- Added `resetIdleHints()` and `setShowShake(null)` at the top of the reload handler — fixes idle hint not starting after reload (old handler called these explicitly; new handler was missing them)

---

#### KidsDraggable.jsx
**Zone:** Shared — All Zones

**What changed:** Remove opacity dim on drag. Add `visibilitychange` cancel for iOS stuck drag.

- Removed `el.style.opacity = "0.35"` from `onPointerDown` — original stays full opacity during drag. Clone already provides visual feedback
- `onPointerCancel`: added `el.style.opacity = ""` restore (was missing — left element dimmed on iOS system interruption)
- Added `onVisibilityChange` handler — on hide, calls `onPointerCancel()` as safety net for edge cases where `pointercancel` doesn't fire

---

#### DraggableItem.jsx
**Zone:** Shared — All Zones

**What changed:** Add `visibilitychange` cancel + inline style cleanup for iOS stuck drag.

- Added `cancelDragOnHide()` in a new `useEffect` — `document.addEventListener("visibilitychange")`
- On hide: resets `isDraggingRef.current = false`, calls `setIsDragging(false)`, sets `window.__dragData = null`
- Clears all 8 inline styles on the element: `position`, `top`, `left`, `zIndex`, `opacity`, `pointerEvents`, `width`, `height`
- Calls `onDragEnd(id)` so the parent knows the drag was cancelled

---

#### FreeDraggableItem.jsx
**Zone:** Shared — All Zones

**What changed:** Add `visibilitychange` cancel for iOS stuck drag.

- Added `cancelDragOnHide()` in a new `useEffect` — `document.addEventListener("visibilitychange")`
- On hide: clears `dragDataRef.current.dragTimer` if running, resets `dragDataRef.current.hasMoved = false`, calls `setIsDragging(false)` and `setDragStarted(false)`

---

#### NewModakSceneV7.jsx
**Zone:** Symbol Mountain — S01

**What changed:** Add `stopVoice()` to `onPauseHide` so VO stops on tab/app switch.

- Added `stopVoiceRef = useRef(null)` above `onPauseHide` declaration (`stopVoice` is defined later in the component — ref needed to avoid closure ordering issue)
- After `stopVoice` is defined: added `stopVoiceRef.current = stopVoice` to keep ref current
- `onPauseHide` now calls `stopVoiceRef.current?.()` before `pauseCelebRef.current?.()`

---

#### SyllableVoiceChallenge.jsx
**Zone:** Shloka River — All Scenes

**What changed:** Replace iOS auto-pass with tap-to-confirm. Android recognition path unchanged.

- Added `showTapConfirm` state (boolean, default false)
- In `startListening()`, `!supportsRecognition` branch: removed `setTimeout` auto-pass. Now sets `phase="listening"`, starts waveform animation, calls `setShowTapConfirm(true)`
- In render: added `"I said it! ✓"` button shown when `showTapConfirm` is true. On tap: `stopWave()`, `setShowTapConfirm(false)`, `burstStars()`, `showResult("good", "Great! Keep going! 🌟")`
- In `handleClose()`: added `setShowTapConfirm(false)`
- Android/Chrome path (`supportsRecognition === true`): completely unchanged

---

#### ABOUT_ME_HUT_FREEZE_CHECKLIST.md
**Zone:** About Me Hut — Zone 5

**What changed:** Added missing sections, updated T27 status, added Web Speech API notes, logged session fixes.

- Added 19G UX Polish, 20H UX Polish, 21H UX Polish
- Added 21A Phases, 21B Tab Switch (BLOCKER), 21C Reload/Continue (BLOCKER), 21D Idle Hints (BLOCKER)
- Expanded 22I UX Polish
- T27 marked complete in all locations — scorecard, section 9A gate, section 22D, outstanding action items
- T14 updated: Web Speech API now (testing), MP3 recordings needed pre-launch
- Added specific iOS QA items (4 items replacing vague note)
- Added S20 and S21 code fix tracking blocks with manual QA items
- Scorecard updated: S20/S21 marked `FIXED†`

---

### ⏳ Needs Claude Code — Instructions Provided

| File | Changes Needed | Instructions |
|------|---------------|--------------|
| `VakratundaGroveSimplified.jsx` | Remove MessageManager, InteractionManager, ProgressiveHintSystem, PowerUnlockOverlay | Section 2 of this doc |
| `MemoryGameEngine.jsx` | Remove ManualRoundMode, ModeSelectionModal, dead mode logic, all console.logs | Section 3 — confirm no manual mode usage first |
| `VakratundaGame.jsx` | Remove 3 dead props: getBudImage, getLotusImage, getBabyElephantImage | Section 4 of this doc |
| `AutoPlayModeV2.jsx` | Remove all console.log calls (~15 total) | Section 5 of this doc |
| `NewModakSceneV7.jsx` (basket drag) | Migrate DraggableItem + DropZone → KidsDraggable + KidsDropZone | Step-by-step in chat |

---

### ℹ️ Reviewed — No Changes Needed

| File | Audit Result | Zone |
|------|-------------|------|
| `Familytreegame.jsx` | Clean. `playVoice` from `useVoiceGuidance` (file audio), no Web Speech API issues, reload handler correct | About Me Hut — S19 |
| `MyIndianStoryGame.jsx` | Clean. Best VO architecture of the zone (`RECENT_STEP_VO` + `entryVoPlayedForPhaseRef`). No issues | About Me Hut — S22 |
| `KidsDropZone` (in KidsDraggable.jsx) | Clean. Pointer events, `pointercancel` already handled. No stuck drag risk | Shared — all zones |
| `Wish2PlateDropGame.jsx` | Clean. Purely presentational, no internal state. Uses KidsDraggable + KidsDropZone | About Me Hut — S21 |
| `DropZone.jsx` | `isOver` state can desync but no visual effect (transparent background). Not a production issue | Symbol Mountain only |
| `VakratundaGame.jsx` (engine path) | Clean thin wrapper — correct pattern. Only dead props to remove (in needs-change list) | Shloka River |
| `MemoryGameEngine.jsx` (AutoPlay path) | Active path is clean. Dead code from multi-round era is inert (evaluates false) | Shloka River |

---

> **Deploy order:** Apply "Already Changed" files first (no dependencies). Then give "Needs Claude Code" items to Claude Code one file at a time. Verify Modak basket drag migration separately after confirming KidsDraggable output works correctly.
