# Image session B - one pass-check list (all groups), 2026-10-19
Build: one lone production build of the working tree (HEAD `38932dc6` + the uncommitted edits below) finished with exit 0, no unresolved imports; the private build folder was deleted. Not browser-tested beyond Group 1.

Git state (checked, `git status`): **uncommitted image changes** = `ObstacleRemoverGame.jsx` (Dreams, plus another session's voice fix), `ShlokaRiverFinale.jsx` (boat) and `PondSceneSimplifiedV4.jsx` (preload trim). Everything else below is already in checkpoint commit `38932dc6`.

## Test in this order (about 10 minutes, DevTools Network optional)
| # | Where | What to look for | Changed files / lines |
|---|---|---|---|
| 1 | Loader + welcome screen | looks the same; no missing images | `App.jsx` ~823-826: loader list now `welcome-background.svg`, `welcome-opening-bg.webp`, `ganesha-welcome-poster.webp` (3 never-shown welcome images removed); `preloadImages.js` `avatarImagePaths` webp only |
| 2 | Profile screen, then Map | river, waterfall, bridge, butterflies, bird, lock all drawn | `CleanMapZone.jsx` 740/746/752 (`shloka-{stream,waterfall,bridge}-opt.webp`); `App.jsx` ~659-662 (profile-welcome preload now `.webp`: butterflyyellow, butterflyblue, birdnew, lock) |
| 3 | Welcome-back overlay (window at least 900x600) | background looks right, no banding | `CleanGameWelcomeScreen.css:1953` -> `welcome-back-bg.webp` |
| 4 | Zone Welcome (tap Modak Mountain) | looks the same | none (checks the preload fixes) |
| 5 | Symbol Mountain sidebar and symbol card popup | all 8 icons sharp; card popup icons right | `SymbolSidebar.jsx` 12,13,15,18; `symbolCardContent.js` 9,22,36,49,62,75,88; `OpeningModal.jsx` 11,12,13,15 |
| 6 | Modak: Flower Journey + Garland | emotion bubbles crisp at 48-72 px | `FlowerJourneyGame2.jsx` 31-36; `NewModakSceneV7.jsx` 91-94 and belly icon 99 |
| 7 | Pond | plays as before; the Ganesha lotus reflection is removed (Madhurima: not wanted), nothing appears in the water when the lotus blooms | `PondSceneSimplifiedV4.jsx` 78-80 (icons) and preload list `SCENE_IMAGES` (~238-252): removed `GANESHA_REFLECTION_IMAGE`, `mooshikaCoach`, `lotusBefore/After`, `trunkBefore/After`, `ganeshaCharacter` |
| 8 | Sacred Assembly | cards and Ganesha figure fine | `SacredAssemblySceneV8.jsx` 54-56, 58 |
| 9 | Tusk (Symbol Mountain scene 3) | sidebar icons only; no old 300-450 KB lossless icons in Network | `SymbolMountainSceneV3.jsx` 79, 83-85 |
| 10 | Shloka River: Sarvada, Sarvakaryeshu, Finale | sidebar/word icons fine; **Finale boats** (choice + sailing journey) look like before | `SarvadaGame.jsx` 15,16; `SarvakaryeshuGame.jsx` 22,27; `ShlokaRiverFinale.jsx` 34 (`choice-boat-opt.webp`) and 35 (trunk); `shloka-river/shared/AppSidebar.jsx:11` and `components/chantCardContent.js:1` (trunk) |
| 11 | About Me Hut: Dreams (obstacle remover) | clouds in the intro; wish 3 flower, bush, tree reveals | `ObstacleRemoverGame.jsx` 78-80 (flower, bush, tree) and 91 (cloud) |

## Quick console check (after clicking through the above)
```js
const r=performance.getEntriesByType('resource').map(e=>e.name.split('/').pop().split('?')[0]);
console.log('OLD (should be empty):',r.filter(f=>/^(shloka-(stream|waterfall|bridge)\.png|welcome-back-bg\.png|symbol-(belly|lotus|ears|trunk)-new\.webp|symbol-.*-new\.png|welcome-(board|ganesha|mooshika)\.webp|choice-boat\.png|ganesha-sit\.svg)$/.test(f)));
```
`ganesha-sit.svg` should no longer load in Pond (reflection block removed).

## Known leftovers (not bugs)
- Shloka Scene1 `VakratundaGroveSimplified.jsx:69` still imports the old lossless trunk icon (session A's folder).
- A saved Edit Map layout (`localStorage gmb_map_zone_art`) on a device can keep the old map PNG paths; clear it with `localStorage.removeItem('gmb_map_zone_art')`.
- The build still emits an old `choice-boat-*.png` asset from an unused variant import; it is not requested at runtime.
- The before/after loader, map and Zone Welcome measurement is deferred until after your pass-check.

Pass-check status (Madhurima, 2026-10-19): Dreams (step 11) fine and committed (e3f545d1); Pond (step 7) fine. Pending: steps 1-6, 8-10 (Finale boat is step 10).
Pass-check update: steps 1-6 checked by Madhurima. Pending: steps 8 (Sacred Assembly), 9 (Tusk), 10 (Shloka scenes incl. Finale boat).
Pass-check update: step 9 (Tusk) checked by Madhurima. Pending: step 8 (Sacred Assembly), step 10 (Shloka scenes incl. Finale boat).
