# Test Checklists (dev harness)

A floating, step-by-step test runner for the dev harness. Dev-only, not part of the live app.

- Open: `/dev/game-test?game=<key>` (run `npm run dev`). The panel floats over the game.
- Shows one step at a time: **Do this** and **Should happen**. Buttons: Pass and next, Fail, Skip.
- Per step: a note, and screenshots (paste with Ctrl+V into the note, "Add image", or "Capture this tab").
- A numbered strip shows every step's status; click a number to jump.
- "Pop out" moves it into its own small window (Chrome/Edge) so it does not cover the game.
- Results save in the browser (localStorage) per checklist, so you can leave and come back.
- Share: "Share / more" -> **Download report** (one `.html`, screenshots embedded) or **Copy as text**.

The panel is a floating overlay. It stops pointer events from reaching the game, so using it never counts as a touch on the scene.

## Files

| File | Purpose |
|---|---|
| `src/dev/TestChecklistPanel.jsx` | The panel UI, saving, export, pop-out. Rarely needs editing. |
| `src/dev/testChecklists.js` | The built-in checklists. **Add new ones here.** |
| `src/dev/GameTestHarness.jsx` | Mounts the panel (`<TestChecklistPanel gameKey={gameKey} />`). |

## Add a checklist

### Option A: save it in the repo (every session and teammate gets it)

Edit `src/dev/testChecklists.js`. Add an entry to `TEST_CHECKLISTS`, keyed by the harness `?game=` key
(the keys are in `GAMES` / `SCENES` in `GameTestHarness.jsx`):

```js
export const TEST_CHECKLISTS = {
  'modak-game2-new': {
    title: 'Modak Game 2 - Branch phase: hints must ignore random touches',
    items: [
      { text: 'Wait ~18s for L2, then tap sky / grass.', expect: 'L2 hand stays; background taps change nothing.' },
      { text: 'Pull the branch part-way and let go at L3.', expect: 'Hand stays up; level does not reset.' },
    ],
  },
};
```

- `text`: what the tester does. `expect` (optional): what should happen, shown in a green box.
- Plain text only. No emoji.
- If several harness keys mount the same game, add them to `CHECKLIST_ALIASES`
  (`'sm-modak-game2': 'modak-game2-new'`) instead of copying the list.
- A game with no entry gets `GENERIC_CHECKLIST` (the 4-step hint smoke test).
- Every built-in checklist is in the panel's **Checklist** dropdown, whichever game is open.

### Option B: paste it in the panel (one-off, kept only in that browser)

Panel -> **Share / more** -> **New checklist from pasted text**. Paste a list:

```
# Optional title
- First step
  Expected: what should happen
- [ ] Second step
```

One step per line (`-`, `*`, `1.` or `- [ ]`). An `Expected:` line or an indented line under a step becomes its
pass condition. It then appears under **Pasted by you** in the dropdown.

## Writing good steps

- One action per step, with a clear pass condition.
- Say the starting state: "L3 visible", "no hint showing", "first teaching hand".
- Hint-system work: always include the standing check
  **"With L1/L2/L3 visible, tap random background parts of the scene. The hint must not disappear or restart
  unless the touch belongs to the current interactive beat."**

## Sending results

1. Tick through the steps; add notes and screenshots on failures.
2. **Share / more** -> **Download report** and send the `.html`, or **Copy as text** and paste into chat.
3. To reset a checklist: **Share / more** -> **Clear all results for this checklist**.

## Limits

- Screenshots are shrunk to about 900px wide and stored in browser storage. If storage fills, the panel warns you
  to download the report.
- "Capture this tab" depends on the browser's screen-share permission. Pasting or adding a file always works.
- "Pop out" needs Document Picture-in-Picture (Chrome/Edge). It is hidden elsewhere.
- Results live in one browser profile; they do not sync between machines. Download the report to keep them.
