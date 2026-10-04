# INPUT_AUDIT.md — Input boundary audit (read-only sweep)

Date: 2026-09-30. Started as a static code read, then continued with layout-debug visual QA on
2026-10-01. Purpose: for each interaction, what owns the pointer event, and what region is treated
as "valid". The QA question for every row is: *what happens if the child does the right gesture in
the wrong place?*

Legend: OK = region looks tight and event-owned / WATCH = permissive by design, verify visually /
FIXED = changed this session / OVERLAY = `?hitzones` visual overlay added / NOT READ = not covered yet.

## Findings (ranked)

| # | Scene | Beat | Gesture | Valid region in code | Concern | Verdict |
|---|-------|------|---------|----------------------|---------|---------|
| 1 | Samaprabha (Shloka R.) | Branch clue | Hold | `rx/ry` = 25.6% (was) | Zone covered most of the river; tapping the light glow bottom-left revealed the branch | FIXED: now 11 (`SamaprabhaGame.jsx:47`), tune in Layout Debug |
| 2 | Kurumedeva | Plank drop | Drag | `PLANK_DROP_RX = 4.2`, `PLANK_DROP_RY = 3.2` ellipse around the active slot only | Was too loose: old radius 18 plus the broad `GAP_ZONE` accepted most of the river gap | FIXED/OVERLAY: broad red `GAP_ZONE` removed from success logic; success now requires the active blue slot ellipse |
| 3 | Kurumedeva | Help token to friend | Drag | per-friend radius (`elephant: 6`, `monkey: 7`) | Elephant zone was too close to the help bubble; visible helper size is unchanged/restored | FIXED/OVERLAY: `?hitzones` shows the green friend drop radius for Elephant/Monkey |
| 4 | Flower Journey (Modak G2) | Marsh hop | Drag | landing inside `MARSH_HIT_RX = 11`, `MARSH_HIT_RY = 9` ellipse around target stop | Was too wide at radius 22; accepted much of the mud lane and nearly overlapped stops | OK: visually checked after tightening; clump-sized ellipses leave mud gaps |
| 5 | Nirvighnam | Branch to bank | Drag | `BRANCH_DROP_RX = 8`, `BRANCH_DROP_RY = 5` ellipse around the bank drop target | Was a broad 13% circle | FIXED/OVERLAY: `?hitzones` shows the bank drop ellipse |
| 6 | Mahakaya rescue | Log drop | Drag | `DROP_RX = 9.5`, `DROP_RY = 7` ellipse around the active log target | Original 16% circle was large; first tightened pass was hard on 3/4 screens | FIXED/OVERLAY: tuned larger after 3/4 layout check |
| 7 | Tusk Nest | Item to nest | Drag/drop | editable object target in `tuskNestFlow.json`: `{ x: 50.17, y: 58.32, w: 16 }` | String-target bounding boxes were tied to the nest sprite/padding and hard to tune independently | OK/OVERLAY: red rectangle is the completion/drop target; user checked and approved |
| 8 | Pond | Rock hold, reeds swipe, lotus hold | Hold / swipe | Owned by the element itself, ends on `pointerleave`; `?hitzones` shows start zones | Good design. On touch, implicit pointer capture can suppress `pointerleave`, so sliding a finger off may keep holding | OVERLAY: visual zones added; VERIFY slide-off on a real touch device |
| 9 | Pond | Reeds swipe | Swipe | `abs(dx)`, either direction | Left or right both count, and vertical movement is ignored | Confirm this is intended |
| 10 | Samaprabha | All four clues | Hold | ellipse test on each pointermove; leaving the zone drains the ring | Good pattern (position re-checked continuously). Other three zones are small (rx 14–19). Note the ellipse is in % of each axis | OK after #1 |
| 11 | Sarvada | Symbol find | Tap | true circle (corrects 4:3), miss = ripple only | Best example of a correct boundary | OK |
| 12 | Vakratunda rescue | Grab frog | Press | `GRAB_RADIUS = 15`, must press near the frog | Grab is bounded. Win radius 12 | OK / WATCH |
| 13 | Suryakoti (Shloka R.) | Rub | Rub | whole canvas | Free rub is valid | OK by design |

## Not yet read (coverage gaps)

Shloka River Finale, all four About Me Hut scenes.
About Me Hut uses forms/keyboard, so drag/hold checks mostly don't apply.

## Game-wise QA status

| Game | Beat | Mechanic | Valid area / overlay | Invalid-region check | Status |
|------|------|----------|----------------------|----------------------|--------|
| Modak Game 1: Calm Mooshika | Calm Mooshika | Press-and-hold | Green Mooshika button zone; hold now cancels on pointer move outside the button | Background, food items and slide-off should not complete the hold | DONE: user visually checked |
| Modak Game 2: Bush/Branch/Marsh | Marsh hops | Drag/drop | Four marsh ellipses (`11 x 9`) | Dropping in mud gaps or between clumps should fail | DONE: user visually checked |
| Modak Game 2: Bush/Branch/Marsh | Bush | Swipe | Smaller blue bush start zone; success requires a 55px horizontal swipe | Swiping grass/background or tiny wiggles should not count | DONE: user visually checked |
| Modak Game 2: Bush/Branch/Marsh | Branch/tree | Pull-and-hold | Tuned green branch polygon copied from layout debug | Holding tree leaves/empty space, tapping, or releasing early should not complete | DONE: user visually checked |
| Kurumedeva | Friend help | Drag/drop | Green Elephant/Monkey drop circles | Dropping token near the friend or help bubble but outside the circle should fail | FIXED/OVERLAY |
| Kurumedeva | Plank bridge | Drag/drop | Small blue slot ellipses (`4.2 x 3.2`) | Dropping in the old broad river gap should fail | FIXED/OVERLAY |
| Mahakaya Rescue | Logs | Drag/drop | Pink log-target ellipse (`9.5 x 7`) | Releasing in open water outside the ellipse should fail | FIXED/OVERLAY |
| Nirvighnam | Branch to bank | Drag/drop | Pink bank-target ellipse (`8 x 5`) | Releasing on river/bank outside ellipse should fail | FIXED/OVERLAY |
| Nirvighnam | Rock, branch drop, reeds | Hold / drag-drop / swipe | Editable oval hit zones locked from Layout Debug; reeds require a 55px swipe | Holding/swiping/dropping outside the visible oval should fail | DONE |
| Tusk Nest | Nest build items | Drag/drop | Red editable target object in layout debug | Crossing the target then releasing elsewhere should fail | DONE: user approved |
| Pond | Rock, reeds, lotus | Hold/swipe | Rock oval, reeds invisible swipe zone, separate editable lotus oval | Slide-off during hold still needs real touch confirmation | DONE: user tuned layout values |
| Tusk Eyes | Hidden eyes | Tap/search | Round visible item zones with `?hitzones` overlay | Tapping background or transparent padding should not find items | DONE: user checked |
| Tusk Ear | Listen source | Tap-choice | Separate editable oval hit zones (`leftBushHit`, `centerRockHit`, `rightSourceHit`) with `?hitzones` overlay; full square artwork no longer counts | Tapping source-corner padding, cow overlap, or background should not choose the sound | DONE: user checked |
| Sacred Assembly | Ganesha parts | Tap-choice | Oval tap zones with `?hitzones` overlay; rectangle corners do not count | Tapping outside visible oval should not place the active symbol | DONE: user checked |
| Modak Game 3: Garland | Flowers + finished garland | Tap / drag-drop | Flower tap buttons and smaller oval Ganesha drop zone with `?hitzones` overlay | Tapping between flowers should not thread; dropping garland outside Ganesha oval should fail | DONE: user checked |
| Samaprabha | Shadow clues | Hold | Clue ellipses; branch corrected in layout debug | Holding the glow/background should not reveal the clue | DONE: user checked/corrected |
| Sarvakaryeshu | Pick a Ganesha power | Tap-choice | `?hitzones` outlines the visible option buttons that own the tap | Tapping between/around option buttons should not pick a power | OVERLAY/READY TO CHECK |
| Sarvada | Hidden symbol search | Tap/search | `?hitzones` or Tap Zone Debug shows the circular symbol zone | Tapping outside the visible circle should ripple only, no progress | OVERLAY/READY TO CHECK |
| Shloka River Finale | Choose word boats | Tap-choice | `?hitzones` outlines the visible choice boat buttons that own the tap | Tapping water/empty space near a boat should not choose it | OVERLAY/READY TO CHECK |

## Suggested next steps (need Madhurima's go-ahead)

1. Open the WATCH/OVERLAY scenes with `?hitzones` and judge the visible target shapes by eye.
2. Manual six-check pass on those rows using the overlay, results into TESTCASES.md.
3. Add a shared code-comment/config convention: each mechanic states its valid AND invalid region.

Zone sizes changed: Samaprabha branch clue; Flower Journey marsh hop was tightened from a
22%-radius circle to an 11% x 9% ellipse; Kurumedeva plank slots now use small ellipses instead of
the broad river gap; Mahakaya and Nirvighnam drops now use tunable ellipses; Tusk Nest uses an
editable flow target; Modak Game 1 hold cancels when the pointer leaves Mooshika; Modak Game 2
branch uses a tuned polygon hit zone and bush requires a longer deliberate swipe.
