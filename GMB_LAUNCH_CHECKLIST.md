# GMB Scene Launch Checklist

Legend:
- 🟦 Agent = can be checked in code and/or live browser automation
- 🟧 Manual = needs real device / human judgment
- 🟪 Both = agent can pre-check, manual should confirm

**Before running this checklist with agents, read these two files first:**
- `GMB_AUDIT_PUNCHLIST.md` — living document of what's already fixed, already
  confirmed not-applicable, awaiting a design decision, or awaiting a live-device
  test. Don't re-report anything already resolved there.
- `NEXT_SESSION_13_SCENE_RESWEEP.md` — the 13 live scenes (confirmed via
  `src/App.jsx`), standing rules, and carried-forward open items.

**Two rules that caused false positives in the previous pass — don't skip:**
1. **Cross-check absence against the benchmark scene before flagging.**
   `src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx` itself doesn't
   call `useSceneReset` or make a direct `GameStateManager.saveGameState` call —
   it relies on `SceneManager`'s internal persistence. That's an intentional
   pattern, not a bug. If a scene's persistence differs from the benchmark, note
   it, but don't flag it as broken without checking whether it actually saves.
2. **Re-verify every finding with a direct read immediately before reporting it.**
   A stale grep or cached read produced a false positive this session
   (`Favoritefoodgame.jsx:801` was reported as an ungated `console.log` when it
   was already fixed). Read the exact line right before writing it into the report.

## 1. Live Scene Source
- 🟦 Confirm live scene file from `src/App.jsx`.
- 🟦 Ignore backup/V1/old/copy files unless imported by `src/App.jsx`.
- 🟦 Confirm child mini-games used by the live scene.

## 2. Required Scene UI
- 🟦 `HomeButton` present.
- 🟦 `ZoneBadgeButton` / back-to-zone control present.
- 🟦 `AudioToggle` present if scene has audio.
- 🟦 `VOReplayButton` present where VO guidance is used.
- 🟦 `SceneCompletionCelebration` appears on scene completion.
- 🟪 Completion modal has correct scene name, symbols, stars, and next-scene text.

## 3. Completion & Progress
- 🟦 Completion saves immediately and only once.
- 🟦 `GameStateManager.saveGameState` or equivalent persistence happens on completion.
- 🟦 `ProgressManager.updateSceneCompletion` happens on completion.
- 🟦 Map/zone unlock state updates correctly after completion.
- 🟦 Replay resets the scene cleanly.
- 🟦 Continue routes to the correct next scene.
- 🟦 Reload after completion restores completion state correctly.

## 4. Audio & VO
- 🟪 Audio toggle mutes VO, music, and SFX consistently.
- 🟪 VO replay button replays the correct current line.
- 🟪 No overlapping VO when tapping quickly.
- 🟦 No delayed/idle VO fires after phase change.
- 🟦 No delayed/idle VO fires after navigation.
- 🟦 Scene audio stops on unmount.
- 🟦 All timers/intervals/RAF loops are cleared on unmount and on pause (not just audio).
- 🟪 Tab hidden/app background pauses active timers and audio loops where relevant.

## 5. Modal Interrupt Behavior
- 🟦 Blocking modals pause gameplay/timers.
- 🟪 Blocking modals stop active VO immediately.
- 🟦 Closing the modal resumes gameplay.
- 🟪 Closing the modal replays the current relevant VO from the start.
- 🟪 Closing the modal does not replay VO if audio is muted.
- 🟪 Repeated modal open/close does not stack duplicate VO.
- 🟦 If phase changes while modal is open, resumed VO matches the current phase.
- 🟪 Symbol sidebar modals follow this rule.
- 🟪 Shloka River app/chant/practice modals follow this rule.
- 🟪 Opening/mode-selection/pause/completion modals follow this rule.

(Note: for the 🟪 items above, an agent's code-level pass can only confirm the
teardown/replay *call exists* in the right place — it can't hear whether VO
actually overlaps in practice. Treat a code-level pass as "no obvious gap
found," not proof there's no audible overlap; manual confirms that part.)

## 6. Navigation Audio Teardown
- 🟪 `HomeButton` stops active VO/music/SFX before navigation.
- 🟪 `ZoneBadgeButton` stops active VO/music/SFX before navigation.
- 🟪 Completion `Continue` stops scene audio before navigation.
- 🟪 Completion `Replay` clears old audio/timers before restart.
- 🟪 Any custom back/close scene-exit control stops audio before navigation.
- 🟪 Previous-scene audio never leaks into Zone Welcome, Map, or next scene.

## 7. Drag / Hold / Swipe Safety
- 🟦 Every drag/hold mechanic has `onPointerCancel`.
- 🟦 Every drag/hold mechanic cleans up active state when paused (`isPaused`-triggered cleanup effect, not just the native pointercancel handler).
- 🟦 Drag handlers that call `setPointerCapture` release it correctly on cancel/up.
- 🟪 If drag is interrupted, item returns to a valid resting place.
- 🟪 Finger leaving the element does not soft-lock the game.
- 🟪 Rapid drag/tap does not double-complete or skip required steps.
- 🟪 Wrong interaction gives clear visual/audio feedback.

## 8. Phone-First Layout Gate
- 🟦 Scene is playable at `667 x 375` phone landscape.
- 🟦 Scene is playable at `844 x 390` phone landscape.
- 🟦 Scene is playable at `932 x 430` large-phone landscape.
- 🟦 Scene is playable at `1024 x 768` iPad landscape.
- 🟦 Scene is playable at `1366 x 1024` iPad Pro landscape.
- 🟦 No clipped instructions.
- 🟦 No hidden Home/Zone/Audio controls.
- 🟦 No overlapping modals or completion screens.
- 🟪 Drag targets are reachable by finger.
- 🟦 Text fits inside buttons/cards/modals.
- 🟪 Browser safe-area/notch/home-indicator does not cover controls.

(Use the built-in browser pane's `resize_window` for viewport sizes and
`computer` screenshot action to capture each one.)

## 9. Touch Targets
- 🟦 All interactive controls are at least `60px` touch targets.
- 🟦 Mobile breakpoints do not shrink targets below `60px`.
- 🟦 Drag/drop targets are at least `60px`.
- 🟦 Icon-only buttons still have adequate hit area.
- 🟦 Disabled states are visually clear.

## 10. Visual Design / Palette
- 🟦 Symbol Mountain uses `#FF5722`, `#FFD700`, `#FFF8E7`.
- 🟦 Shloka River uses `#2E7D32`, `#03A9F4`, `#E8F5E9`.
- 🟦 About Me Hut uses `#795548`, `#FF6B6B`, `#FBE9E7`.
- 🟦 Actual backgrounds match zone palette, not just CSS vars.
- 🟦 No off-palette stale backgrounds.
- 🟦 No visible placeholder/debug UI.
- 🟧 Scene looks polished on phone and iPad.

## 11. Fonts & CSS Hygiene
- 🟦 Headings/buttons use Baloo 2.
- 🟦 Body text uses Nunito.
- 🟦 No Arial/system/Georgia/Comic Sans in live scene UI unless intentional.
- 🟦 No fixed-px `!important` size overrides for key responsive elements.
- 🟦 Fixed sizes use `clamp()` or shared responsive tokens where needed.
- 🟦 No duplicate/conflicting CSS rules that affect live layout.

## 12. Console / Debug Hygiene
- 🟦 No ungated `console.log`.
- 🟦 No ungated `console.warn` / `console.debug`.
- 🟦 Debug panels gated behind `import.meta.env.DEV` or explicit debug flag.
- 🟦 No `GameCoach` usage in live scene.
- 🟦 Dead `GameCoach` state removed or documented as intentionally inert.
- 🟪 No production console errors during scene play (static read confirms no
  obviously-thrown code path; a live browser pass is needed to actually catch
  runtime errors under real interaction sequences).

## 13. Assets
- 🟦 All live images load successfully.
- 🟦 No missing audio files.
- 🟦 Prefer WebP for scene images.
- 🟦 PNG/JPG/GIF usage is intentional and listed.
- 🟦 Production build has no broken asset paths.
- 🟪 Scene works after cache clear / slow network reload.

## 14. Content QA
- 🟪 Sanskrit/mantra spelling is correct.
- 🟪 Captions match VO.
- 🟪 Symbol names match across reveal, sidebar, and completion.
- 🟪 Symbol meanings/affirmations are consistent.
- 🟧 Instructions are child-clear.
- 🟦 No internal/debug copy visible to child.

## 15. Accessibility Basics
- 🟦 Buttons have useful accessible labels.
- 🟦 Image controls are actual buttons or keyboard-accessible controls.
- 🟦 Text contrast is readable over backgrounds.
- 🟪 Important information is not audio-only.
- 🟦 Reduced-motion settings do not break progress.

## 16. Fresh Profile / Saved Profile
- 🟦 Fresh profile can enter scene cleanly.
- 🟦 Opening modal appears at the right time.
- 🟦 Scene does not depend on stale localStorage.
- 🟦 Saved profile resumes/starts scene as intended.
- 🟦 Malformed localStorage does not break scene entry.

## 17. Agent Live-Browser Checks
- 🟦 Run scene in browser at required phone/iPad viewports.
- 🟦 Check console errors.
- 🟦 Check network asset failures.
- 🟦 Measure visible touch targets.
- 🟪 Open/close modals during VO.
- 🟪 Use Home/Zone/Continue during VO.
- 🟦 Complete scene enough to verify save/unlock/completion.
- 🟦 Screenshot each viewport.

Run this section AFTER Groups A/B/C static checks (sections 1-3, 4-7, 9-13) have
landed and any resulting fixes are applied — it's the most expensive section to
run and re-run, so don't burn it on issues static reading already caught.

## 18. Manual Real-Device Checks
- 🟧 Real phone landscape playthrough.
- 🟧 Real iPad landscape playthrough.
- 🟧 Real finger drag/hold/swipe feel.
- 🟧 Lock screen / app switch / notification interruption.
- 🟧 Safari/iOS audio behavior.
- 🟧 Performance/jank on device.
- 🟧 Child understands what to do without adult explanation.

## Recommended agent split
Zone-wise (Symbol Mountain / Shloka River / About Me Hut), further split by
section group so each agent's task stays narrow enough to avoid skimming:
- **Group A — Structure & UI**: sections 1, 2, 3, 16
- **Group B — Runtime safety**: sections 4, 5, 6, 7 (apply the benchmark-comparison
  and re-verify-before-reporting rules above especially here)
- **Group C — Static hygiene**: sections 9, 10, 11, 12, 13
- **Group D — Live-browser pass**: section 17, run after A/B/C fixes land

Sections 8, 14, 15, 18 are manual/human-judgment passes for Madhurima once the
agent-found issues are fixed — not agent work.
