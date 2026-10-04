# Interaction Boundary Audit Handoff

Core QA question:

> What happens if the child does the right gesture in the wrong place?

## Done Means

Madhurima visually approves the zone in the harness, the approved values are locked into the scene defaults/config, `INPUT_AUDIT.md` is updated, and focused lint passes for touched files.

## Process

1. Open the scene in `game-test.html`, usually with `?hitzones`.
2. Make the overlay show the real valid region, not a decorative guess.
3. Test:
   - correct place + correct gesture
   - wrong place + correct gesture
   - correct place + wrong gesture
   - slide-off: start inside target, then move outside while still holding/dragging
   - edge cases: just outside the target, transparent padding, overlaps, and gaps
4. If artwork and hit zone need different sizes, split them, e.g. `lotus` / `lotusHit`.
5. Lock approved values into the relevant scene defaults/config.
6. Update `INPUT_AUDIT.md`.
7. Run focused lint.

`?hitzones` should only be a QA overlay. Normal play must stay clean.

If Vite uses a different port, replace `5173` in the links.

## Status

Complete as of 2026-10-04. Evidence is in the `INPUT_AUDIT.md` game-wise QA table.

Covered areas:

- Modak G1
- Modak G2
- Modak G3 / Garland
- Pond
- Eyes
- Ear
- Tusk Nest
- Sacred Assembly
- Shloka River scenes: Vakratunda, Suryakoti, Samaprabha, Nirvighnam, Kurumedeva, Mahakaya, Sarvakaryeshu, Sarvada, Finale
- About Me Hut scenes: Family Tree, Favorite Food, Dreams/Wishes, My Indian Story

Ignore old notes for “Symbol Mountain Symbol scene” and “Grove mini-games”; those are not separate remaining active games.

## Reference Links

- About Me Family Tree: `http://localhost:5173/game-test.html?game=amh-family-tree`
- About Me Favorite Food: `http://localhost:5173/game-test.html?game=amh-favorite-food`
- About Me Dreams/Wishes: `http://localhost:5173/game-test.html?game=amh-dreams-wishes`
- About Me Indian Story: `http://localhost:5173/game-test.html?game=amh-indian-story`
- Shloka Finale: `http://localhost:5173/game-test.html?game=sr-finale`
