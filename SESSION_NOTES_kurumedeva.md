# KurumeDeva Beat Player — Session Notes

Everything below happened in one long session building out the "Beat Player"
architecture for the KurumeDeva (bridge-building) minigame. This file is a
handoff doc — read it at the start of the next chat instead of re-deriving
context from scratch.

## Where things live

- **Engine**: `src/lib/beatPlayer/BeatPlayerGame.jsx` — generic, data-driven.
  Renders any `{version, type, beats: {...}}` JSON. Read the big comment
  block at the top of the file first — it documents every interaction type.
- **Live data**: `src/dev/beatPlayerPreview/kurumedeva/kurumedevaFlowSample.json`
  — the actual 11-beat flow (Setup → Logs → Ropes → Planks → Crossing →
  Reunion → Symbol reveal stub).
- **Preview wrapper**: `src/dev/beatPlayerPreview/kurumedeva/KurumeDevaBeatPlayerPreview.jsx`
  — asset map (editor path string → imported webp) + the mute/layout toggle
  buttons. Test at `/game-test.html?game=kurumedeva-beatplayer`.
- **NOT wired into the live app yet.** The real production scene is still
  the old hand-coded `src/zones/shloka-river/scenes/Scene3/KurumedevaGame.jsx`.
  Nobody has asked to switch production over to the beat player yet.

## Standalone test sandboxes (built this session, still in the repo)

These exist so Madhurima can test a mechanic without playing through beats
0-3 every time:

- `/rope-tie-test.html` → `src/dev/RopeTieTest.jsx` — 3 early mechanic
  candidates (press-hold, tap-3-times, drag-tail-into-loop). **Superseded**
  by the center-tie mechanic below; kept for reference, not deleted.
- `/rope-center-tie-test.html` → `src/dev/RopeCenterTieTest.jsx` — the
  **locked** mechanic (see below), refined side-by-side fail/success test.
  Good place to keep prototyping visual tweaks before touching the real
  engine.

## The locked rope-tie mechanic (center-tie)

Madhurima gave an exact spec after reviewing prototypes she built herself.
This is now implemented in the live engine (`BeatPlayerGame.jsx`) and wired
into beats 4 and 6 of the JSON. Do not reinvent this — extend it.

**Mechanic**: two rope ends (`dragLeft`/`dragRight`), each dragged
independently toward one shared `target` zone. No "drag across a distance"
motion — tying a rope is squeeze-together, not haul-it-over.

- Drag either end near target → it can dock/lock there.
- Once **both** are locked → hold briefly (~250ms) → then:
  - **try-fail** (`type: 'try-fail', gesture: 'center-tie'`): both spring
    back apart, beaver switches to its `activePath` fail pose, feedback
    tints red, then the beat auto-advances (help bubble follows via
    `appearDelayMs` on its own item).
  - **success** (`type: 'center-tie'`): both stay locked, resolves into the
    real bow-knot artwork (ported verbatim from Madhurima's own prototype —
    do not redesign this shape without asking).
- **No permanent target marker.** A soft glow only appears near the target
  while a hand is actively dragging near it — Madhurima was explicit this
  should never look like "a UI hotspot you missed."

New interaction schema fields (see beats 4 & 6 in the JSON for real
examples):
```json
{
  "type": "center-tie",                 // or "try-fail" + "gesture": "center-tie"
  "dragLeft": "ropeLeftEnd",
  "dragRight": "ropeRightEnd",
  "target": { "x": 58.5, "y": 71.0, "w": 8 },
  "lockLeft": { "x": 56.0, "y": 71.0 },
  "lockRight": { "x": 61.0, "y": 71.0 },
  "anchorLeft": { "x": 52.0, "y": 68.0 },
  "anchorRight": { "x": 65.0, "y": 68.0 }
}
```
The two drag items (`ropeLeftEnd`/`ropeRightEnd`) exist in the item list
purely as data bookkeeping (their `x`/`y` = rest position) — they never
render as image buttons, only as the procedural SVG rope + handle.

## Layout Debug (the in-engine visual editor)

Toggle **"📐 layout"** in the preview (top-right, next to mute). While on:
the beat's timeline freezes, every item becomes draggable, and a
bottom-right panel shows exact X/Y/Scale/Rotation/Flip for whatever's
selected. **"Copy beat JSON"** exports the current beat with all edits
merged in — paste that back to me (or directly into the JSON file) to make
it permanent.

For center-tie specifically, there are now **6 draggable things** per beat:
1. Left rope-end's rest position (the tan ellipse — "how long the dangling
   rope looks" = distance from this to its anchor)
2. Right rope-end's rest position
3. `anchorLeft` (small orange dot — where the rope visually starts on the log)
4. `anchorRight`
5. `lockLeft` (where the left end snaps once tied)
6. `lockRight`
7. The shared `target` zone (dashed orange circle — the hit-test area)

This works via a **generic named-point debug system**
(`debugPoint`/`startDebugPointDrag` in `BeatPlayerGame.jsx`) — any future
interaction field that's a raw `{x,y}` point with no item of its own can
reuse this same mechanism, just add its name to the `.map(['anchorLeft', ...])`
list in the center-tie render block (or wherever else needs it).

**Known-fixed gotcha**: the rope-end items were invisible/undraggable in
Layout Debug for one commit (canGrab excluded `layoutDebug`) — already
fixed. If you add another interaction type with its own drag items, make
sure their debug-mode visibility isn't accidentally gated the same way.

## Assets (this session's additions)

- `src/dev/beatPlayerPreview/kurumedeva/uploads/beaver-tying-notrope.webp`
  — replaces the old beaver-tie pose (which had a rope baked into the
  image, conflicting with the live SVG rope). Mapped to `assets/upload_3.png`.
- `.../uploads/beaver-fail-tie.webp` — dedicated worried/fail pose. Mapped
  to `assets/upload_8.png`. Beat 4's beaver: `path` = this (default/idle
  look), `activePath` = `assets/upload_3.png` (effort pose, shown only
  while actively gripping) — this matches the **real** pattern already
  used in the Logs beat (idle = worried by default, effort pose only
  during the active hold), which was backwards in an earlier commit this
  session and has since been corrected.
- Old `uploads/beaver-tie.webp` (with rope) is still referenced by
  `RopeCenterTieTest.jsx` (the sandbox) — don't delete it.

## VO — locked, all beats 0-9 have it

Full table lives in conversation history; the short version: every
"before" line is story/question framing with **no mechanic instructions**
("press and hold", "drag the X") and **no outcome spoilers** — the child
discovers the result by acting. "After" lines are the payoff. Beats 2 and
5 ("call for help") intentionally share the *identical* line ("Who can
Beaver ask for help?") — that repetition is a deliberate feature, not a
bug to fix.

## Recurring bug classes to keep checking for (found & fixed many times)

When touching any beat, check for these — they've each recurred 2-4 times:
1. **Leftover items from beat-splitting**: an item still present in a
   state that no longer needs it (duplicate gameKeys, stale help bubbles,
   a static PNG that should've been fully replaced by SVG).
2. **Snap-back-then-slide**: `movement` state leaves a dragged item at its
   pre-drag position while only `after` moves it → looks like it snaps
   back then auto-slides. Fix: sync `movement`'s position to `after`'s.
3. **Pose+position teleport**: a pose swap (via `activePath` or a literally
   different named item) happening at the same instant as a position jump,
   with no walk/transition → reads as a teleport glitch. Fix: hold position
   constant across the swap, or move the position change to an earlier
   state where it's less jarring.
4. **Z-index gaps**: decorative continuity items (e.g. "Support logs — pair")
   need z above the bridge (z:10) or they render washed-out/hidden behind it.

## What's still open / not yet asked for

- Beats 9 (Reunion) and 10 (Symbol reveal / word + affirmation) — beat 10
  is explicitly **out of scope** for this JSON per Madhurima ("part of the
  main scene, not this beat player").
- No request yet to wire the beat player into the live production scene —
  it's still preview-only via `game-test.html`.
- The center-tie mechanic's default point positions (anchor/lock/target for
  beats 4 & 6) are a rough first-pass layout, not yet tuned against the
  real log art — that's the very next thing Madhurima will likely do via
  Layout Debug, then send back a "Copy beat JSON" paste to apply.
- The extended WebP conversion (rest of the 12 live scenes, ~800MB) was
  explicitly scoped OUT earlier ("just KurumeDeva/Bridge assets for now")
  — she flagged it as a possible later ask, not decided yet.

## Git workflow reminder (unchanged all session)

Commit specific files (never `git add -A` blindly — check `git status`
first), message ends with the `Co-Authored-By`/`Claude-Session` trailer
lines from the system reminder, then:
```
git pull --no-edit --no-rebase origin staging && git push -u origin staging
```
`staging` is the standing target branch for this repo.

## How to pick this up next session

1. Read this file.
2. Read the top-of-file comment block in `BeatPlayerGame.jsx` (interaction
   type reference).
3. Check if Madhurima has sent a "Copy beat JSON" paste for beats 4/6 —
   if so, that's the position data to apply first.
4. `git pull origin staging`, run `npm run dev`, open
   `/game-test.html?game=kurumedeva-beatplayer` to verify current state
   before making changes.
