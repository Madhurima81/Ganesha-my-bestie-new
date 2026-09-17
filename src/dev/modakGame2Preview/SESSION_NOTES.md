# Modak Game 2 ("Belly Feeding" / Lambodara) — Dev Preview Session Notes

Isolated, dev-only preview of the redesigned Game 2 flow: **Bush (swipe) → Branch
(pull+hold) → Marsh (guide across stones) → Belly Recognition**. Lives at
`src/dev/modakGame2Preview/ModakGame2Preview.jsx` + `.css`, registered as
`modak-game2-new` in `src/dev/GameTestHarness.jsx`. Test at:

```
http://localhost:5174/game-test.html?game=modak-game2-new
```
(port varies — check what `npm run dev` actually prints)

**Nothing here touches the live game.** `NewModakSceneV7.jsx` has not been
edited for any of this — per standing instruction, Game 2 redesign work stays
in this isolated preview until explicitly approved to port over.

---

## What's been done this session

### 1. Pacing / VO sequencing overhaul
- Added `speakAsync()` + `wait()` helpers — VO now sequences by actually
  waiting for `utterance.onend` instead of fixed timers that could cut lines
  off mid-sentence.
- Fixed `VO.bushStart` never being spoken (opening sequence was incomplete).
- Slowed every phase transition to give "breathing space" (previously
  ~1.2–1.3s between beats, now ~2.5–3s): Bush→Branch, Branch→Marsh,
  Marsh→Belly all have proper pauses for flowers-flying-to-basket and
  travel beats.
- Belly Recognition rewritten as a full async sequence (~9s) with a locked
  final affirmation line added, and the symbol reveal now shows **"Lambodara"**
  (not "Belly") to match the spoken word.
- Fixed a duplicate-Mooshika render bug in Belly Recognition (was rendering
  a bare `<img>` *plus* a full `MooshikaWithBasket`).

### 2. Required-fail-before-success pattern (matches Bush across all 3 mechanics)
- **Bush**: first swipe fails (bush closes again), second succeeds. (already existed)
- **Branch**: first successful hold now springs back with a "So close!" beat
  and sad emotion — only the *second* hold actually completes. Uses
  `branchAttemptedRef`, reset correctly by debug phase-jumps.
- **Marsh**: the "ooh, wobbly" beat + worried emotion now fires on landing
  the **2nd** stone (not the 1st), matching the "at least one beat before it
  feels easy" request.
- Emotion bubbles in general were audited to only show on *real* failed
  attempts, not automatically on phase entry (this flipped back and forth a
  few times per feedback — current state is the ladder above).

### 3. Idle-hint ladder (ported from `NewModakSceneV7.jsx`)
Full 3-tier system now in the preview, matching the live scene's pattern:
- **Intro gesture**: shows the animated-hand `GestureDemo` for 6s whenever
  Bush/Branch/Marsh begins, regardless of idle.
- **Idle ladder** (10s / 18s / 26s of no interaction): L1 = `.hint` CSS glow
  pulse on the target, L2 = one-time nudge VO, L3 = full `GestureDemo` hand
  animation.
- Reuses the shared `src/lib/components/feedback/GestureDemo.jsx` component
  (no duplication) — `swipe-left` for Bush, `pull-down` for Branch, `drag`
  (current stone → next stone) for Marsh.
- `noteInteraction()` wired into all three phases' pointer-down handlers,
  resets the whole ladder on any real interaction.

### 4. Marsh mechanic fixes
- Fixed a real bug: landing on stone 3/4 used to fly *both* flowers while
  only incrementing the count by one — now uses a proper single-flower
  helper (`flyOneFlowerToBasket`) so the visual always matches the count.
- Loosened the snap-hit radius from 13% → 22% of the marsh box (was too
  precise for a touch game).
- **Split the marsh art**: was one flattened image with 4 grass clumps baked
  in (impossible to reposition independently, and the aspect-ratio was wrong
  causing `object-fit: contain` letterboxing — waypoints landed in the wrong
  visual spot). Now: `fj-mud-plain.webp` (bare mud, no clumps) +
  `fj-marsh-clump.webp` (one reusable clump asset), with the 4 clumps
  rendered as real draggable/scalable layers at the *exact same coordinates*
  as the drag-snap targets — no more mismatch between "where the target is"
  and "what's drawn there."
- Added a debug-only **drop-zone visualizer** (`.mg2-debug-dropzone`,
  dashed circles) that renders the *actual* 22%-radius hit zone so you can
  see exactly where a drop will register, not just guess from the art.
- Moved `MARSH_START` away from stone 1 (was close enough that Mooshika's
  sprite visually overlapped the first drop-zone circle at rest).

### 5. Debug panel — made everything actually tunable
Following the **BeatPlayerGame.jsx pattern** (click the real sprite to
select, small pill toggle top-right, compact panel bottom-right — *not* the
older ghost-marker-overlay style), these are now independently
draggable/scalable layout keys (previously several were hardcoded CSS classes
with no debug hook at all):
- `bush`, `tree`, `branch`, `marsh` (+ scale)
- `mooshikaBush`, `mooshikaBranch`, `mooshikaBelly` (+ scale)
- `branchFlower1`, `branchFlower2` (+ scale) — previously fixed CSS classes
- `marshFlower1`, `marshFlower2` (+ scale) — previously fixed CSS classes
- `marshStop1-4` (+ scale, now the visible clumps themselves) and `marshStart`
- Marsh scale (`layout.marsh.s`) now scales **only the mud art**, not
  Mooshika/flowers/clumps sitting on top of it (was a container-level
  `transform: scale()` bug that scaled the whole subtree).

### 6. Asset fixes
- `fj-flower-coral.webp` was cropped at the source (left petal cut off) —
  replaced with a clean version from `red flower.png` (Downloads), matching
  `fj-flower-cream.webp`'s style/dimensions exactly.
- Fixed a size mismatch between the two flowers: they had very different
  amounts of transparent padding baked into their canvases (coral filled
  ~74% of its canvas off-center, cream ~87% centered) — tightly cropped both
  to matching content bounds so same CSS `width: X%` now renders them the
  same visual size.
- Added `mooshika-turned-game2.webp` (side-profile walking pose) — now used
  for Bush, Branch, and Marsh (via a `pose="turned"` prop on
  `MooshikaWithBasket`); Belly Recognition still uses the original
  front-facing `mushika-calm-game2.webp`.

### 7. Current tuned layout (baked into `LAYOUT_DEFAULTS`)
```
bush:          { l: 29.5, t: 69.1, s: 100 }
tree:          { l: 76,   t: 47.9, s: 120 }
branch:        { l: 67.6, t: 44.8, s: 100 }
marsh:         { l: 56,   t: 56,   s: 200 }
mooshikaBush:  { l: 28.5, t: 78.4, s: 100 }
mooshikaBranch:{ l: 66.3, t: 72.8, s: 100 }
mooshikaBelly: { l: 50,   t: 56,   s: 100 }
branchFlower1: { l: 49.1, t: 34.4, s: 100 }
branchFlower2: { l: 20.3, t: 48.1, s: 100 }
marshStart:    { l: 2,    t: 80 }            (MARSH_START const)
marshStop1-4:  { 19.8/47.2, 41.8/39.2, 56/57, 84.9/55.4 }  (MARSH_STOPS const)
```
`marshFlower1`/`marshFlower2` still on their original defaults (`66/48`,
`87/31`) — never explicitly re-tuned, may want a look now that the mud is
bigger (200% scale).

---

## How to continue in the next chat

1. **Start the dev server** if not already running:
   ```
   npm run dev
   ```
   then open `http://localhost:5174/game-test.html?game=modak-game2-new`
   (check the actual printed port — it auto-shifts if 5173/5174 are busy).

2. **Standing conventions from this session** (keep following these):
   - Test with the in-game **mute button** toggled on (or check
     `aria-label === 'Unmute'`) before any automated verification — don't
     rely on hearing TTS. Note: don't monkey-patch
     `window.speechSynthesis.speak` to a no-op for muting — `speakAsync()`
     awaits `utterance.onend`, which never fires if `speak` is stubbed out,
     and the whole VO sequence hangs. Use the real mute button instead.
   - When testing drag/pointer interactions via `dispatchEvent(new
     PointerEvent(...))`, expect `setPointerCapture` to throw
     (`NotFoundError: No active pointer with the given id`) — this is a
     synthetic-event limitation, not a real bug. It blocks handlers that
     call `e.currentTarget.setPointerCapture()` (Branch's hold-drag) from
     completing via pure `dispatchEvent`. Bush (down+up, no capture) and
     Marsh (down+move+up, no capture call) test fine this way; Branch does
     not — either trust code review for Branch drag logic, or use the
     `computer` tool's real mouse actions instead.
   - After any layout-default change, remember `localStorage` persists a
     user's last-tuned values *per browser*, which will silently override
     new code defaults. Clear via debug panel's **"Reset layout"** button,
     or `localStorage.removeItem('modakGame2PreviewLayout')` + reload.
   - When Madhurima sends a "Copy layout JSON" dump with a note like
     "— tree branch" or "— mud etc", she means: bake *only the fields she
     mentions* into `LAYOUT_DEFAULTS` (and the matching `MARSH_STOPS` /
     `MARSH_START` consts if marsh waypoints changed) — not the whole dump
     blindly, since other fields may be mid-tuning/stale.
   - This session hit the known Windows `EPERM` transient file-lock issue on
     `Edit` calls repeatedly — just retry the identical edit, it succeeds on
     the 2nd/3rd attempt.

3. **Known follow-ups not yet done**:
   - `marshFlower1`/`marshFlower2` positions never re-tuned after the mud
     scale went to 200% — worth a look.
   - The 4 marsh drop-zone circles are visible in debug mode now
     (`.mg2-debug-dropzone`) but haven't been individually re-checked/tuned
     against the *current* clump positions since `marshStart` moved — quick
     visual pass recommended before considering Marsh "done."
   - Belly Recognition's Mooshika pose was deliberately left as the
     front-facing "calm" one (not "turned") — confirm that's still wanted.
   - Nothing has been ported to `NewModakSceneV7.jsx` yet. Garland Build
     (post-Belly-Recognition hand-off) is explicitly out of scope for this
     pass, per the original brief.
   - No commits made for anything in this session yet — everything above is
     uncommitted working-tree changes. Standard workflow when asked: `git
     status --short` → stage only the relevant files (never `git add -A`) →
     commit with the required Co-Authored-By trailer → `git fetch origin
     staging` → `git merge origin/staging --no-edit` → `git push origin
     staging`.

4. **If Madhurima says "test in mute" or "check in mute"**: toggle the real
   mute button first (see conventions above), then proceed with whatever
   verification was asked.
