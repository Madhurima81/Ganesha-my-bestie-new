# Live files, scene by scene

Read-only analysis (2026-10-27). For each of the 13 live scenes: the pictures and sounds that **only that scene** brings in (imported by its own code) and the files in `public/` that its own code names. Files used by two or more scenes are listed once, at the end, under "Shared".

How to read it: a scene should be roughly **one background + 5 or 6 pictures per mini game**. Sizes are on disk, before the server compresses anything.

| Scene | Imported files | Imported size | Public files named | Public size |
|---|---:|---:|---:|---:|
| Modak | 23 | 1.05 MB | 3 | 0.05 MB |
| Pond | 20 | 7.13 MB | 7 | 0.45 MB |
| Symbol | 45 | 2.02 MB | 9 | 0.31 MB |
| Sacred Assembly | 21 | 0.77 MB | 11 | 3.02 MB |
| Vakratunda Grove | 24 | 2.14 MB | 4 | 0.42 MB |
| Suryakoti Bank | 24 | 3.12 MB | 6 | 0.69 MB |
| Nirvighnam Chant | 39 | 3.16 MB | 8 | 0.73 MB |
| Sarvakaryeshu Chant | 29 | 2.98 MB | 17 | 0.96 MB |
| Shloka River Finale | 9 | 0.28 MB | 17 | 0.49 MB |
| Family Tree | 14 | 0.32 MB | 53 | 15.49 MB |
| Favorite Food | 38 | 0.55 MB | 53 | 15.49 MB |
| Dreams and Wishes | 41 | 1.10 MB | 53 | 15.49 MB |
| My Indian Story | 39 | 0.60 MB | 54 | 15.61 MB |
| **Shared by 2+ scenes** | 32 | 0.68 MB | 398 | 43.07 MB |

Notes:
- The four About Me scenes (Family Tree, Favourite Food, Dreams, My Indian Story) each show the same 53 public files, about 15.5 MB. That is one shared set (the explorer-friend avatars), counted four times here. The real download list keeps only the WebP of each avatar, so most of that 15.5 MB is not downloaded.
- "Public files named" means files the scene's code names by path or by bare file name. It includes lighter/heavier twins (png next to webp, wav next to mp3); the real download list drops a heavy twin the app does not name.

## Modak

Entry: `symbol-mountain/scenes/modak/NewModakSceneV7.jsx`

**Imported by this scene: 23 files, 1.05 MB**

- 117 KB — `symbol-mountain/scenes/modak/assets/images/fj-bush-open-new.webp`
- 101 KB — `symbol-mountain/scenes/modak/assets/images/fj-bush-closed-new.webp`
- 100 KB — `symbol-mountain/scenes/modak/assets/images/fj-garland-complete.webp`
- 93 KB — `symbol-mountain/scenes/modak/assets/images/fj-tree-new.webp`
- 81 KB — `symbol-mountain/scenes/modak/assets/images/fj-branch-new.webp`
- 75 KB — `symbol-mountain/scenes/modak/assets/images/ganesha-game3-new.webp`
- 64 KB — `symbol-mountain/scenes/modak/assets/images/fj-marsh-clump.webp`
- 63 KB — `symbol-mountain/scenes/modak/assets/images/fj-garland-empty.webp`
- 62 KB — `symbol-mountain/scenes/modak/assets/images/mooshika-turned-game2.webp`
- 57 KB — `symbol-mountain/scenes/modak/assets/images/fj-mud-plain.webp`
- 41 KB — `symbol-mountain/scenes/modak/assets/images/fj-flower-cream.webp`
- 37 KB — `symbol-mountain/scenes/modak/assets/images/journey-berry.webp`
- 29 KB — `symbol-mountain/scenes/modak/assets/images/modak-fj-bg.webp`
- 28 KB — `symbol-mountain/scenes/modak/assets/images/fj-flower-coral.webp`
- 25 KB — `symbol-mountain/scenes/modak/assets/images/journey-acorn.webp`
- 23 KB — `symbol-mountain/scenes/modak/assets/images/journey-feather.webp`
- 14 KB — `symbol-mountain/scenes/modak/assets/images/emotion-excited-game3-opt.webp`
- 13 KB — `symbol-mountain/scenes/modak/assets/images/emotion-pleased-game3-opt.webp`
- 13 KB — `symbol-mountain/scenes/modak/assets/images/emotion-angry-game3-opt.webp`
- 11 KB — `symbol-mountain/scenes/modak/assets/images/emotion-relieved-game3-opt.webp`
- 11 KB — `symbol-mountain/scenes/modak/assets/images/emotion-happy-game3-opt.webp`
- 11 KB — `symbol-mountain/scenes/modak/assets/images/emotion-worried-game3-opt.webp`
- 9 KB — `symbol-mountain/scenes/modak/assets/images/emotion-sad-game3-opt.webp`

**Public files its code names: 3 files, 0.05 MB**

- 20 KB — `/images/symbols-symbolmountain/symbol-mooshika-new.webp`
- 15 KB — `/images/symbols-symbolmountain/symbol-modak-new.webp`
- 13 KB — `/images/icons/symbol-belly-new-opt.webp`

## Pond

Entry: `symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx`

**Imported by this scene: 20 files, 7.13 MB**

- 2.27 MB — `symbol-mountain/scenes/pond/assets/images/water-elephant.png`
- 2.03 MB — `symbol-mountain/scenes/pond/assets/images/golden-lotus-closed.png`
- 627 KB — `symbol-mountain/scenes/pond/assets/images/lotus-bloomed.png`
- 306 KB — `symbol-mountain/scenes/pond/assets/images/lotus-closed.png`
- 225 KB — `symbol-mountain/scenes/pond/assets/images/trunk-after.webp`
- 223 KB — `symbol-mountain/scenes/pond/assets/images/elephant-full.png`
- 200 KB — `symbol-mountain/scenes/pond/assets/images/mooshika-coach.webp`
- 192 KB — `symbol-mountain/scenes/pond/assets/images/ganesha-character.webp`
- 186 KB — `symbol-mountain/scenes/pond/assets/images/trunk-before.webp`
- 170 KB — `symbol-mountain/scenes/pond/assets/images/lotus-before.webp`
- 164 KB — `symbol-mountain/scenes/pond/assets/images/lotus-after.webp`
- 123 KB — `symbol-mountain/scenes/pond/assets/images/pond-flower.webp`
- 117 KB — `symbol-mountain/scenes/pond/assets/images/pond-turtle-sad.webp`
- 77 KB — `symbol-mountain/scenes/pond/assets/images/pond-stream-overlay.webp`
- 75 KB — `symbol-mountain/scenes/pond/assets/images/trunk-lotus-bloomed-new.webp`
- 66 KB — `symbol-mountain/scenes/pond/assets/images/trunk-lotus-dormant-new.webp`
- 43 KB — `symbol-mountain/scenes/pond/assets/images/pond-big-rock.webp`
- 42 KB — `symbol-mountain/scenes/pond/assets/images/trunk-lotus-upright-new.webp`
- 32 KB — `symbol-mountain/scenes/pond/assets/images/pond-bg-fixed.webp`
- 30 KB — `symbol-mountain/scenes/pond/assets/images/pond-pebble.webp`

**Public files its code names: 7 files, 0.45 MB**

- 194 KB — `/images/mooshika-coach.webp`
- 185 KB — `/images/ganesha-character.webp`
- 20 KB — `/images/symbols-symbolmountain/symbol-mooshika-new.webp`
- 18 KB — `/images/icons/symbol-lotus-new-opt.webp`
- 15 KB — `/images/symbols-symbolmountain/symbol-modak-new.webp`
- 14 KB — `/images/icons/symbol-trunk-new-opt.webp`
- 13 KB — `/images/icons/symbol-belly-new-opt.webp`

## Symbol

Entry: `symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx`

**Imported by this scene: 45 files, 2.02 MB**

- 225 KB — `symbol-mountain/scenes/tusk/assets/audio/ear_bird_forest_ambient.wav`
- 198 KB — `symbol-mountain/scenes/tusk/assets/audio/ear_grass_rustle.wav`
- 192 KB — `symbol-mountain/scenes/tusk/assets/images/ganesha-character.webp`
- 188 KB — `symbol-mountain/scenes/tusk/assets/audio/ear_water_drip.wav`
- 162 KB — `symbol-mountain/scenes/tusk/assets/audio/dragon-studio-wind-gust-386158.mp3`
- 66 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/eyes-game/symbol_mountain_3_bg.webp`
- 59 KB — `symbol-mountain/scenes/tusk/assets/images/tusk-giving/symbol_mountain_3_bg.webp`
- 50 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/ears-game-v2/hidden_spring.webp`
- 48 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/ears-game-v2/revealed_grass_bush.webp`
- 44 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/ears-game-v2/leafy_bush.webp`
- 44 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/peacock-new.webp`
- 44 KB — `symbol-mountain/scenes/tusk/assets/audio/dragon-studio-dry-grass-rustling-478361.mp3`
- 42 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/ears-game-v2/revealed_spring.webp`
- 39 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/eyes-game-v2/new_feather_bush.webp`
- 38 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/eyes-game-v2/new_mango_bush.webp`
- 38 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/eyes-game/peacock_04_feather_highlight.webp`
- 37 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/elephant-new1.webp`
- 36 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/ears-game-v2/hidden_grass_bush.webp`
- 36 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/eyes-game-v2/peacock_worried_missing_feather.webp`
- 33 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/tusk-nest/nest-4.webp`
- 30 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/tusk-nest/nest-3.webp`
- 30 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/ears-game-v2/cow_eating_grass.webp`
- 30 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/ears-game-v2/elephant_thirsty.webp`
- 29 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/ears-game-v2/cow_hungry.webp`
- 29 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/ears-game-v2/elephant_happy_water.webp`
- 29 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/ears-game-v2/cow_happy_chewing_new.webp`
- 28 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/cow-new.webp`
- 28 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/ears-game-v2/cow_tired.webp`
- 27 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/ears-game-v2/elephant_drinking.webp`
- 26 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/tusk-nest/nest-2.webp`
- 24 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/tusk-nest/nest-1.webp`
- 20 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/tusk-nest/nest-0.webp`
- 18 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/tusk-nest/bunny-helping.webp`
- 17 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/monkey-new.webp`
- 15 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/eyes-game-v2/monkey_hungry_worried.webp`
- 14 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/eyes-game-v2/yellow_flower_cluster.webp`
- 14 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/eyes-game/monkey_04_smiles_holds_close.webp`
- 10 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/eyes-game-v2/peacock_feather_single.webp`
- 9 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/tusk-nest/grass-bundle.webp`
- 6 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/tusk-nest/leaf.webp`
- 5 KB — `symbol-mountain/scenes/tusk/assets/images-opt/margin35/eyes-game/mango.webp`
- 5 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/tusk-nest/feather.webp`
- 4 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/tusk-nest/baby-bird-happy.webp`
- 4 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/tusk-nest/baby-bird-sad.webp`
- 2 KB — `symbol-mountain/scenes/tusk/assets/images-opt/tusk-margin35/tusk-nest/broken-twig.webp`

**Public files its code names: 9 files, 0.31 MB**

- 185 KB — `/images/ganesha-character.webp`
- 24 KB — `/images/symbols-symbolmountain/symbol-eyes-new.webp`
- 20 KB — `/images/symbols-symbolmountain/symbol-mooshika-new.webp`
- 18 KB — `/images/icons/symbol-lotus-new-opt.webp`
- 15 KB — `/images/symbols-symbolmountain/symbol-modak-new.webp`
- 14 KB — `/images/symbols-symbolmountain/broken-tusk-symbol.webp`
- 14 KB — `/images/icons/symbol-trunk-new-opt.webp`
- 13 KB — `/images/icons/symbol-ears-new-opt.webp`
- 13 KB — `/images/icons/symbol-belly-new-opt.webp`

## Sacred Assembly

Entry: `symbol-mountain/scenes/final scene/SacredAssemblySceneV8.jsx`

**Imported by this scene: 21 files, 0.77 MB**

- 276 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-divine.webp`
- 134 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-faded.webp`
- 85 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-stone.webp`
- 71 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-base.png`
- 28 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-ears-colored.webp`
- 18 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-belly-colored.webp`
- 16 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-ear.png`
- 16 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-mooshika.png`
- 16 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-right-hand-colored.webp`
- 15 KB — `symbol-mountain/scenes/final scene/assets/images/final_symbol_background.webp`
- 14 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-mouse-colored.webp`
- 12 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-lotus.png`
- 12 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-left-hand-colored.webp`
- 12 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-trunk-colored.webp`
- 11 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-modak.png`
- 11 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-trunk.png`
- 11 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-eyes.png`
- 9 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-belly.png`
- 8 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-eyes-colored.webp`
- 7 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-tusk.png`
- 4 KB — `symbol-mountain/scenes/final scene/assets/images/ganesha-tusk-colored.webp`

**Public files its code names: 11 files, 3.02 MB**

- 2.28 MB — `/images/ganesha-sit.svg`
- 434 KB — `/images/icons/symbol-belly-new.webp`
- 194 KB — `/images/mooshika-coach.webp`
- 24 KB — `/images/symbols-symbolmountain/symbol-eyes-new.webp`
- 20 KB — `/images/symbols-symbolmountain/symbol-mooshika-new.webp`
- 18 KB — `/images/icons/symbol-lotus-new-opt.webp`
- 15 KB — `/images/symbols-symbolmountain/symbol-modak-new.webp`
- 14 KB — `/images/symbols-symbolmountain/broken-tusk-symbol.webp`
- 14 KB — `/images/icons/symbol-trunk-new-opt.webp`
- 13 KB — `/images/icons/symbol-ears-new-opt.webp`
- 13 KB — `/images/icons/symbol-belly-new-opt.webp`

## Vakratunda Grove

Entry: `shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx`

**Imported by this scene: 24 files, 2.14 MB**

- 287 KB — `symbol-mountain/shared/images/icons/symbol-trunk-new.webp`
- 265 KB — `symbol-mountain/scenes/tusk/assets/images/peacock-new.png`
- 219 KB — `symbol-mountain/scenes/tusk/assets/images/cow-new.png`
- 206 KB — `shloka-river/scenes/Scene1/assets/images/vakratunda/reeds.webp`
- 197 KB — `shloka-river/scenes/Scene1/assets/images/vakratunda/18.png`
- 194 KB — `symbol-mountain/scenes/tusk/assets/images/monkey-new.png`
- 171 KB — `shloka-river/scenes/Scene1/assets/images/mooshika-coach.webp`
- 156 KB — `shloka-river/scenes/Scene1/assets/images/ganesha_with_headphones.webp`
- 148 KB — `shloka-river/scenes/Scene1/assets/images/vakratunda/19.png`
- 96 KB — `shloka-river/scenes/Scene1/assets/images/mahakaya/mahakaya-log-single.png`
- 92 KB — `shloka-river/scenes/Scene1/assets/images/vakratunda/frog-baby.webp`
- 34 KB — `shloka-river/scenes/Scene1/assets/images/banyan-full-from-download.webp`
- 23 KB — `shloka-river/scenes/Scene1/assets/images/vakratunda-scene-bg.webp`
- 17 KB — `shloka-river/scenes/Scene1/assets/images/vakratunda/frog-happy.webp`
- 15 KB — `meaning cave/assets/images/symbols/mahakaya-symbol.webp`
- 15 KB — `shloka-river/scenes/Scene1/assets/images/mahakaya/elephant-calf.png`
- 14 KB — `shloka-river/scenes/Scene1/assets/images/vakratunda/frog-family-from-download.webp`
- 8 KB — `shloka-river/scenes/Scene1/assets/images/mahakaya/elephant-ma.webp`
- 8 KB — `shloka-river/scenes/Scene1/assets/images/vakratunda/elephant-baby-va.webp`
- 8 KB — `shloka-river/scenes/Scene1/assets/images/vakratunda/lilypad.webp`
- 7 KB — `shloka-river/scenes/Scene1/assets/images/mahakaya/ma-flower.webp`
- 6 KB — `shloka-river/scenes/Scene1/assets/images/vakratunda/va-lotus.webp`
- 4 KB — `shloka-river/scenes/Scene1/assets/images/vakratunda/va-bud.webp`
- 3 KB — `shloka-river/scenes/Scene1/assets/images/mahakaya/seed.webp`

**Public files its code names: 4 files, 0.42 MB**

- 194 KB — `/images/mooshika-coach.webp`
- 149 KB — `/images/ganesha_with_headphones.webp`
- 74 KB — `/images/symbols-symbolmountain/symbol-trunk-new.webp`
- 15 KB — `/images/meanings-caveofsecrets/mahakaya-symbol.webp`

## Suryakoti Bank

Entry: `shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx`

**Imported by this scene: 24 files, 3.12 MB**

- 781 KB — `shloka-river/scenes/Scene2/assets/images/Samaprabha/shadow-reed.png`
- 470 KB — `shloka-river/scenes/Scene2/assets/images/Samaprabha/shadow-branch.png`
- 391 KB — `shloka-river/scenes/Scene2/assets/images/Samaprabha/shadow-leaves.png`
- 287 KB — `meaning cave/assets/images/symbols/vakratunda-symbol.webp`
- 200 KB — `shloka-river/scenes/Scene2/assets/images/mooshika-coach.webp`
- 159 KB — `shloka-river/scenes/Scene2/assets/images/ganesha_with_headphones.webp`
- 114 KB — `shloka-river/scenes/Scene2/assets/images/Samaprabha/fawn-worried.webp`
- 112 KB — `shloka-river/scenes/Scene2/assets/images-opt/Samaprabha/reveal-branch-new-opt.webp`
- 104 KB — `shloka-river/scenes/Scene2/assets/images-opt/Samaprabha/reveal-rock-new-opt.webp`
- 95 KB — `shloka-river/scenes/Scene2/assets/images/Samaprabha/fawn-happy.webp`
- 87 KB — `shloka-river/scenes/Scene2/assets/images/Suryakoti/sun-zip.png`
- 61 KB — `shloka-river/scenes/Scene2/assets/images-opt/Samaprabha/reveal-reeds-leaves-opt.webp`
- 55 KB — `shloka-river/scenes/Scene2/assets/images/Samaprabha/samaprabha-bg.webp`
- 44 KB — `shloka-river/scenes/Scene2/assets/images-opt/Samaprabha/shadow-stump-opt.webp`
- 36 KB — `shloka-river/scenes/Scene2/assets/images/saurakoti-bg.webp`
- 35 KB — `shloka-river/scenes/Scene2/assets/images-opt/saurakoti-bg-opt.webp`
- 33 KB — `meaning cave/assets/images/symbols/samaprabha-symbol.webp`
- 29 KB — `shloka-river/scenes/Scene2/assets/images-opt/Samaprabha/reveal-stump-opt.webp`
- 24 KB — `meaning cave/assets/images/symbols/suryakoti-symbol.webp`
- 21 KB — `shloka-river/scenes/Scene2/assets/images-opt/Samaprabha/fawn-walk-new-opt.webp`
- 21 KB — `shloka-river/scenes/Scene2/assets/images-opt/Suryakoti/burrow-zip-opt.webp`
- 15 KB — `meaning cave/assets/images/symbols/mahakaya-symbol.webp`
- 11 KB — `shloka-river/scenes/Scene2/assets/images-opt/Suryakoti/bunny-sad-zip-opt.webp`
- 10 KB — `shloka-river/scenes/Scene2/assets/images-opt/Suryakoti/bunny-happy-zip-opt.webp`

**Public files its code names: 6 files, 0.69 MB**

- 287 KB — `/images/meanings-caveofsecrets/vakratunda-symbol.webp`
- 194 KB — `/images/mooshika-coach.webp`
- 149 KB — `/images/ganesha_with_headphones.webp`
- 33 KB — `/images/meanings-caveofsecrets/samaprabha-symbol.webp`
- 24 KB — `/images/meanings-caveofsecrets/suryakoti-symbol.webp`
- 15 KB — `/images/meanings-caveofsecrets/mahakaya-symbol.webp`

## Nirvighnam Chant

Entry: `shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx`

**Imported by this scene: 39 files, 3.16 MB**

- 287 KB — `meaning cave/assets/images/symbols/vakratunda-symbol.webp`
- 195 KB — `shloka-river/scenes/Scene3/assets/images/nirvighnam/reeds-open.png`
- 171 KB — `shloka-river/scenes/Scene3/assets/images/mooshika-coach.webp`
- 167 KB — `shloka-river/scenes/Scene3/assets/images/Kurumedeva/vine.webp`
- 156 KB — `shloka-river/scenes/Scene3/assets/images/ganesha_with_headphones.webp`
- 142 KB — `shloka-river/scenes/Scene3/assets/images/nirvighnam/reeds-closed.png`
- 134 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/monkey-playing-twig.webp`
- 124 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/monkey-happy.webp`
- 123 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/monkey-tie.webp`
- 117 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-tie.webp`
- 112 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-baby-reunion.webp`
- 112 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-lift.webp`
- 102 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/elephant-happy.webp`
- 102 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-placing-plank.webp`
- 101 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-crossing.webp`
- 99 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-asking.webp`
- 97 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/elephant-idle-banana.webp`
- 94 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/elephant-lift.webp`
- 88 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/help-bubble-elephant-logs.webp`
- 86 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/beaver-idle-worried.webp`
- 85 KB — `shloka-river/scenes/Scene3/assets/images/bridge/Characters/baby-beaver-waving.webp`
- 66 KB — `shloka-river/scenes/Scene3/assets/images/Kurumedeva/help-vine.webp`
- 57 KB — `shloka-river/scenes/Scene3/assets/images/Kurumedeva/step2.webp`
- 43 KB — `shloka-river/scenes/Scene3/assets/images/Kurumedeva/help-hand-icon.webp`
- 41 KB — `shloka-river/scenes/Scene3/assets/images/Kurumedeva/step1.webp`
- 35 KB — `shloka-river/scenes/Scene3/assets/images-opt/saurakoti-bg-opt.webp`
- 33 KB — `shloka-river/scenes/Scene3/assets/images/nirvighnam/stone.png`
- 33 KB — `meaning cave/assets/images/symbols/samaprabha-symbol.webp`
- 31 KB — `shloka-river/scenes/Scene3/assets/images/nirvighnam/bg.webp`
- 29 KB — `shloka-river/scenes/Scene3/assets/images/nirvighnam/branch.png`
- 24 KB — `meaning cave/assets/images/symbols/suryakoti-symbol.webp`
- 24 KB — `meaning cave/assets/images/symbols/nirvighnam-symbol.webp`
- 23 KB — `meaning cave/assets/images/symbols/kurumedeva-symbol.webp`
- 22 KB — `shloka-river/scenes/Scene3/assets/images/Kurumedeva/log-turtle.webp`
- 22 KB — `shloka-river/scenes/Scene3/assets/images/Kurumedeva/plank-bunny.webp`
- 15 KB — `meaning cave/assets/images/symbols/mahakaya-symbol.webp`
- 14 KB — `shloka-river/scenes/Scene3/assets/images-opt/nirvighnam/nir-turtle-happy-opt.webp`
- 13 KB — `shloka-river/scenes/Scene3/assets/images-opt/nirvighnam/nir-turtle-sad-opt.webp`
- 12 KB — `shloka-river/scenes/Scene3/assets/images-opt/nirvighnam/nest-opt.webp`

**Public files its code names: 8 files, 0.73 MB**

- 287 KB — `/images/meanings-caveofsecrets/vakratunda-symbol.webp`
- 194 KB — `/images/mooshika-coach.webp`
- 149 KB — `/images/ganesha_with_headphones.webp`
- 33 KB — `/images/meanings-caveofsecrets/samaprabha-symbol.webp`
- 24 KB — `/images/meanings-caveofsecrets/suryakoti-symbol.webp`
- 24 KB — `/images/meanings-caveofsecrets/nirvighnam-symbol.webp`
- 23 KB — `/images/meanings-caveofsecrets/kurumedeva-symbol.webp`
- 15 KB — `/images/meanings-caveofsecrets/mahakaya-symbol.webp`

## Sarvakaryeshu Chant

Entry: `shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx`

**Imported by this scene: 29 files, 2.98 MB**

- 287 KB — `meaning cave/assets/images/symbols/vakratunda-symbol.webp`
- 227 KB — `shloka-river/scenes/scene4/assets/images/sarvada/afternoon-scene.webp`
- 223 KB — `shloka-river/scenes/scene4/assets/images/mooshika-coach.webp`
- 219 KB — `shloka-river/scenes/scene4/assets/images/sarvada/morning-scene.webp`
- 192 KB — `shloka-river/scenes/scene4/assets/images/ganesha_with_headphones.webp`
- 169 KB — `shloka-river/scenes/scene4/assets/images/sarvakaryeshu/trunk-after.webp`
- 167 KB — `shloka-river/scenes/scene4/assets/images/sarvakaryeshu/mooshika-before.webp`
- 163 KB — `shloka-river/scenes/scene4/assets/images/sarvakaryeshu/mooshika-after.webp`
- 152 KB — `shloka-river/scenes/scene4/assets/images/sarvada/night-scene.webp`
- 148 KB — `shloka-river/scenes/scene4/assets/images/sarvakaryeshu/trunk-before.webp`
- 142 KB — `shloka-river/scenes/scene4/assets/images/sarvakaryeshu/eyes-before.webp`
- 123 KB — `shloka-river/scenes/scene4/assets/images/sarvakaryeshu/eyes-after.webp`
- 118 KB — `shloka-river/scenes/scene4/assets/images-opt/boat-opt.webp`
- 97 KB — `shloka-river/scenes/scene4/assets/images/sarvakaryeshu/tusk-after.webp`
- 95 KB — `shloka-river/scenes/scene4/assets/images/sarvakaryeshu/tusk-before.webp`
- 90 KB — `shloka-river/scenes/scene4/assets/images/sarvakaryeshu-bg.webp`
- 74 KB — `shloka-river/scenes/scene4/assets/images/sarvada/boat.webp`
- 50 KB — `meaning cave/assets/images/symbols/sarvakaryeshu-symbol.webp`
- 40 KB — `shloka-river/scenes/scene4/assets/images/sarvada/night.webp`
- 39 KB — `shloka-river/scenes/scene4/assets/images/sarvada/afternoon.webp`
- 39 KB — `shloka-river/scenes/scene4/assets/images/sarvada/morning.webp`
- 33 KB — `meaning cave/assets/images/symbols/samaprabha-symbol.webp`
- 29 KB — `meaning cave/assets/images/symbols/sarvada-symbol.webp`
- 24 KB — `meaning cave/assets/images/symbols/suryakoti-symbol.webp`
- 24 KB — `meaning cave/assets/images/symbols/nirvighnam-symbol.webp`
- 23 KB — `symbol-mountain/shared/images/icons/symbol-tusk-new.webp`
- 23 KB — `meaning cave/assets/images/symbols/kurumedeva-symbol.webp`
- 23 KB — `shloka-river/scenes/scene4/assets/images/sarvada/night-phase.webp`
- 15 KB — `meaning cave/assets/images/symbols/mahakaya-symbol.webp`

**Public files its code names: 17 files, 0.96 MB**

- 287 KB — `/images/meanings-caveofsecrets/vakratunda-symbol.webp`
- 194 KB — `/images/mooshika-coach.webp`
- 149 KB — `/images/ganesha_with_headphones.webp`
- 52 KB — `/images/ganesha-hi-stand.webp`
- 50 KB — `/images/meanings-caveofsecrets/sarvakaryeshu-symbol.webp`
- 33 KB — `/images/meanings-caveofsecrets/samaprabha-symbol.webp`
- 29 KB — `/images/meanings-caveofsecrets/sarvada-symbol.webp`
- 24 KB — `/images/meanings-caveofsecrets/suryakoti-symbol.webp`
- 24 KB — `/images/symbols-symbolmountain/symbol-eyes-new.webp`
- 24 KB — `/images/meanings-caveofsecrets/nirvighnam-symbol.webp`
- 23 KB — `/images/meanings-caveofsecrets/kurumedeva-symbol.webp`
- 20 KB — `/images/symbols-symbolmountain/symbol-mooshika-new.webp`
- 15 KB — `/images/meanings-caveofsecrets/mahakaya-symbol.webp`
- 15 KB — `/images/symbols-symbolmountain/symbol-modak-new.webp`
- 14 KB — `/images/icons/symbol-trunk-new-opt.webp`
- 13 KB — `/images/icons/symbol-ears-new-opt.webp`
- 13 KB — `/images/icons/symbol-belly-new-opt.webp`

## Shloka River Finale

Entry: `shloka-river/scenes/scene5/ShlokaRiverFinale.jsx`

**Imported by this scene: 9 files, 0.28 MB**

- 63 KB — `shloka-river/scenes/scene5/assets/images/river-finale-bg.webp`
- 50 KB — `meaning cave/assets/images/symbols/sarvakaryeshu-symbol.webp`
- 33 KB — `meaning cave/assets/images/symbols/samaprabha-symbol.webp`
- 29 KB — `meaning cave/assets/images/symbols/sarvada-symbol.webp`
- 24 KB — `meaning cave/assets/images/symbols/suryakoti-symbol.webp`
- 24 KB — `meaning cave/assets/images/symbols/nirvighnam-symbol.webp`
- 23 KB — `shloka-river/scenes/scene5/assets/images/choice-boat-opt.webp`
- 23 KB — `meaning cave/assets/images/symbols/kurumedeva-symbol.webp`
- 15 KB — `meaning cave/assets/images/symbols/mahakaya-symbol.webp`

**Public files its code names: 17 files, 0.49 MB**

- 62 KB — `/images/new-ganesha-sit-modak.webp`
- 50 KB — `/images/meanings-caveofsecrets/sarvakaryeshu-symbol.webp`
- 36 KB — `/audio/words/sarvakaryeshu.mp3`
- 33 KB — `/audio/words/vakratunda.mp3`
- 33 KB — `/images/meanings-caveofsecrets/samaprabha-symbol.webp`
- 29 KB — `/images/meanings-caveofsecrets/sarvada-symbol.webp`
- 29 KB — `/audio/words/kurumedeva.mp3`
- 29 KB — `/audio/words/suryakoti.mp3`
- 28 KB — `/audio/words/mahakaya.mp3`
- 27 KB — `/audio/words/samaprabha.mp3`
- 25 KB — `/audio/words/nirvighnam.mp3`
- 24 KB — `/images/meanings-caveofsecrets/suryakoti-symbol.webp`
- 24 KB — `/images/meanings-caveofsecrets/nirvighnam-symbol.webp`
- 23 KB — `/images/meanings-caveofsecrets/kurumedeva-symbol.webp`
- 22 KB — `/audio/words/sarvada.mp3`
- 15 KB — `/images/meanings-caveofsecrets/mahakaya-symbol.webp`
- 14 KB — `/images/icons/symbol-trunk-new-opt.webp`

## Family Tree

Entry: `about-me-hut/family-tree/Familytreegame.jsx`

**Imported by this scene: 14 files, 0.32 MB**

- 84 KB — `about-me-hut/family-tree/assets/images/ganesha/family-kartkeya.webp`
- 58 KB — `about-me-hut/family-tree/assets/images/ganesha/family-shiva.webp`
- 54 KB — `about-me-hut/family-tree/assets/images/ganesha/family-parvati.webp`
- 17 KB — `about-me-hut/family-tree/assets/images/family_tree.webp`
- 15 KB — `about-me-hut/family-tree/assets/images/child/family-grandma.webp`
- 15 KB — `about-me-hut/family-tree/assets/images/child/family-grandpa.webp`
- 15 KB — `about-me-hut/family-tree/assets/images/child/family-dad.webp`
- 14 KB — `about-me-hut/family-tree/assets/images/child/family-mom.webp`
- 14 KB — `about-me-hut/family-tree/assets/images/child/family-sister.webp`
- 14 KB — `about-me-hut/family-tree/assets/images/child/family-brother.webp`
- 11 KB — `about-me-hut/family-tree/assets/images/child/family-myself.webp`
- 11 KB — `about-me-hut/family-tree/assets/images/child/family-pet.webp`
- 10 KB — `about-me-hut/family-tree/assets/images/family_background.webp`
- 1 KB — `about-me-hut/family-tree/assets/images/purple-heart.svg`

**Public files its code names: 53 files, 15.49 MB**

- 2.50 MB — `/images/new-explorer-squirrel1.png`
- 2.50 MB — `/images/new-explorer-tiger1.png`
- 2.46 MB — `/images/new-explorer-monkey1.png`
- 2.21 MB — `/images/new-explorer-peacock1.png`
- 1.64 MB — `/images/new-explorer-avatars.png`
- 1.50 MB — `/images/ganesha-final-new.svg`
- 380 KB — `/images/new-explorer-panda.png`
- 260 KB — `/images/new-explorer-tiger1.webp`
- 238 KB — `/images/new-explorer-squirrel1.webp`
- 231 KB — `/images/new-explorer-monkey1.webp`
- 205 KB — `/images/new-explorer-peacock1.webp`
- 200 KB — `/images/new-explorer-avatars.webp`
- 73 KB — `/images/new-explorer-peacock.png`
- 62 KB — `/images/new-explorer-cobra.png`
- 61 KB — `/images/new-explorer-turtle.png`
- 60 KB — `/images/new-explorer-tiger.png`
- 57 KB — `/images/new-explorer-owl.png`
- 56 KB — `/images/new-explorer-panda.webp`
- 52 KB — `/images/new-explorer-buffalo.png`
- 51 KB — `/images/new-explorer-squirrel.png`
- 51 KB — `/images/new-explorer-horse.png`
- 50 KB — `/images/new-explorer-fish.png`
- 49 KB — `/images/new-explorer-camel.png`
- 49 KB — `/images/new-explorer-monkey.png`
- 44 KB — `/images/new-explorer-lion.png`
- … and 28 more

## Favorite Food

Entry: `about-me-hut/food/Favoritefoodgame.jsx`

**Imported by this scene: 38 files, 0.55 MB**

- 48 KB — `about-me-hut/food/assets/images/animal/fav-peacock.webp`
- 42 KB — `about-me-hut/food/assets/images/animal/fav-cow.webp`
- 40 KB — `about-me-hut/food/assets/images/food/fav-noodles.webp`
- 36 KB — `about-me-hut/food/assets/images/animal/fav-mouse.webp`
- 31 KB — `about-me-hut/food/assets/images/food/fav-burger.webp`
- 29 KB — `about-me-hut/food/assets/images/fav_background.webp`
- 28 KB — `about-me-hut/food/assets/images/food/fav-dosa.webp`
- 25 KB — `about-me-hut/food/assets/images/food/fav-fruit.webp`
- 25 KB — `about-me-hut/food/assets/images/food/fav-rice.webp`
- 23 KB — `about-me-hut/food/assets/images/food/fav-pizza.webp`
- 21 KB — `about-me-hut/food/assets/images/food/fav-barfi.webp`
- 18 KB — `about-me-hut/food/assets/images/food/fav-ladoo.webp`
- 17 KB — `about-me-hut/food/assets/images/food/fav-icecream.webp`
- 12 KB — `about-me-hut/food/assets/images/food/fav-modak.webp`
- 11 KB — `about-me-hut/food/assets/images/color/fav-brown.webp`
- 11 KB — `about-me-hut/food/assets/images/activity/stem.webp`
- 9 KB — `about-me-hut/food/assets/images/activity/read.webp`
- 8 KB — `about-me-hut/food/assets/images/activity/sing.webp`
- 8 KB — `about-me-hut/food/assets/images/color/fav-orange.webp`
- 8 KB — `about-me-hut/food/assets/images/color/fav-purple.webp`
- 8 KB — `about-me-hut/food/assets/images/color/fav-pink.webp`
- 7 KB — `about-me-hut/food/assets/images/activity/sports.webp`
- 7 KB — `about-me-hut/food/assets/images/color/fav-green.webp`
- 7 KB — `about-me-hut/food/assets/images/activity/cook.webp`
- 7 KB — `about-me-hut/food/assets/images/color/fav-yellow.webp`
- 7 KB — `about-me-hut/food/assets/images/color/fav-blue.webp`
- 7 KB — `about-me-hut/food/assets/images/color/fav-red.webp`
- 7 KB — `about-me-hut/food/assets/images/activity/fav-drawing.webp`
- 6 KB — `about-me-hut/food/assets/images/activity/game.webp`
- 6 KB — `about-me-hut/food/assets/images/activity/nature.webp`
- 6 KB — `about-me-hut/food/assets/images/friends.webp`
- 6 KB — `about-me-hut/food/assets/images/activity/art.webp`
- 6 KB — `about-me-hut/food/assets/images/food/fav-sweets.webp`
- 6 KB — `about-me-hut/food/assets/images/activity/fav-reading.webp`
- 5 KB — `about-me-hut/food/assets/images/activity/fav-playing.webp`
- 5 KB — `about-me-hut/food/assets/images/activity/fav-tv.webp`
- 4 KB — `about-me-hut/food/assets/images/activity/fav-music.webp`
- 3 KB — `about-me-hut/food/assets/images/icons/pencil.svg`

**Public files its code names: 53 files, 15.49 MB**

- 2.50 MB — `/images/new-explorer-squirrel1.png`
- 2.50 MB — `/images/new-explorer-tiger1.png`
- 2.46 MB — `/images/new-explorer-monkey1.png`
- 2.21 MB — `/images/new-explorer-peacock1.png`
- 1.64 MB — `/images/new-explorer-avatars.png`
- 1.50 MB — `/images/ganesha-final-new.svg`
- 380 KB — `/images/new-explorer-panda.png`
- 260 KB — `/images/new-explorer-tiger1.webp`
- 238 KB — `/images/new-explorer-squirrel1.webp`
- 231 KB — `/images/new-explorer-monkey1.webp`
- 205 KB — `/images/new-explorer-peacock1.webp`
- 200 KB — `/images/new-explorer-avatars.webp`
- 73 KB — `/images/new-explorer-peacock.png`
- 62 KB — `/images/new-explorer-cobra.png`
- 61 KB — `/images/new-explorer-turtle.png`
- 60 KB — `/images/new-explorer-tiger.png`
- 57 KB — `/images/new-explorer-owl.png`
- 56 KB — `/images/new-explorer-panda.webp`
- 52 KB — `/images/new-explorer-buffalo.png`
- 51 KB — `/images/new-explorer-squirrel.png`
- 51 KB — `/images/new-explorer-horse.png`
- 50 KB — `/images/new-explorer-fish.png`
- 49 KB — `/images/new-explorer-camel.png`
- 49 KB — `/images/new-explorer-monkey.png`
- 44 KB — `/images/new-explorer-lion.png`
- … and 28 more

## Dreams and Wishes

Entry: `about-me-hut/enjoy/ObstacleRemoverGame.jsx`

**Imported by this scene: 41 files, 1.10 MB**

- 99 KB — `about-me-hut/enjoy/assets/images/wish-images/plate.webp`
- 73 KB — `about-me-hut/enjoy/assets/images/wish-images/wish-forest-4.webp`
- 69 KB — `about-me-hut/enjoy/assets/images/wish-images/butterfly.webp`
- 69 KB — `about-me-hut/enjoy/assets/images/wish-images/wish-earth-happy.webp`
- 61 KB — `about-me-hut/enjoy/assets/images/wish-images/wish-earth-sad.webp`
- 48 KB — `about-me-hut/enjoy/assets/images/wish-images/fav-peacock.webp`
- 48 KB — `about-me-hut/enjoy/assets/images/wish-images/tree-opt.webp`
- 46 KB — `about-me-hut/enjoy/assets/images/wish-images/wish-forest-3.webp`
- 42 KB — `about-me-hut/enjoy/assets/images/wish-images/fav-cow.webp`
- 40 KB — `about-me-hut/enjoy/assets/images/wish-images/bird.webp`
- 37 KB — `about-me-hut/enjoy/assets/images/wish-images/wish-forest-2.webp`
- 36 KB — `about-me-hut/enjoy/assets/images/wish-images/fav-mouse.webp`
- 33 KB — `about-me-hut/enjoy/assets/images/wish-images/bush-opt.webp`
- 30 KB — `about-me-hut/enjoy/assets/images/wish-images/wish-forest-1.webp`
- 30 KB — `about-me-hut/enjoy/assets/images/dream_background.webp`
- 27 KB — `about-me-hut/enjoy/assets/images/wish-images/hit.webp`
- 26 KB — `about-me-hut/enjoy/assets/images/wish-images/flower-opt.webp`
- 25 KB — `about-me-hut/enjoy/assets/images/wish-images/fight.webp`
- 23 KB — `about-me-hut/enjoy/assets/images/wish-images/wish-bowl-full.webp`
- 22 KB — `about-me-hut/enjoy/assets/images/wish-images/sharing.webp`
- 21 KB — `about-me-hut/enjoy/assets/images/wish-images/teasing.webp`
- 21 KB — `about-me-hut/enjoy/assets/images/wish-images/helping.webp`
- 20 KB — `about-me-hut/enjoy/assets/images/wish-images/gifting.webp`
- 19 KB — `about-me-hut/enjoy/assets/images/wish-images/angry.webp`
- 18 KB — `about-me-hut/enjoy/assets/images/wish-images/base.webp`
- 16 KB — `about-me-hut/enjoy/assets/images/wish-images/hugging.webp`
- 14 KB — `about-me-hut/enjoy/assets/images/cloud-opt.webp`
- 13 KB — `about-me-hut/enjoy/assets/images/wish-icon-earth.webp`
- 11 KB — `about-me-hut/enjoy/assets/images/wish-images/wish-bowl-empty.webp`
- 9 KB — `about-me-hut/enjoy/assets/images/story-header/sharing-icon.webp`
- 9 KB — `about-me-hut/enjoy/assets/images/wish-icon-flower.webp`
- 9 KB — `about-me-hut/enjoy/assets/images/story-header/nature-icon.webp`
- 9 KB — `about-me-hut/enjoy/assets/images/story-header/kindness-icon.webp`
- 8 KB — `about-me-hut/enjoy/assets/images/wish-images/brocolli.webp`
- 8 KB — `about-me-hut/enjoy/assets/images/wish-icon-share.webp`
- 8 KB — `about-me-hut/enjoy/assets/images/wish-images/carrot.webp`
- 7 KB — `about-me-hut/enjoy/assets/images/wish-images/milk.webp`
- 7 KB — `about-me-hut/enjoy/assets/images/wish-images/rice.webp`
- 7 KB — `about-me-hut/enjoy/assets/images/wish-images/banana.webp`
- 6 KB — `about-me-hut/enjoy/assets/images/wish-images/bread.webp`
- 6 KB — `about-me-hut/enjoy/assets/images/wish-images/apple.webp`

**Public files its code names: 53 files, 15.49 MB**

- 2.50 MB — `/images/new-explorer-squirrel1.png`
- 2.50 MB — `/images/new-explorer-tiger1.png`
- 2.46 MB — `/images/new-explorer-monkey1.png`
- 2.21 MB — `/images/new-explorer-peacock1.png`
- 1.64 MB — `/images/new-explorer-avatars.png`
- 1.50 MB — `/images/ganesha-final-new.svg`
- 380 KB — `/images/new-explorer-panda.png`
- 260 KB — `/images/new-explorer-tiger1.webp`
- 238 KB — `/images/new-explorer-squirrel1.webp`
- 231 KB — `/images/new-explorer-monkey1.webp`
- 205 KB — `/images/new-explorer-peacock1.webp`
- 200 KB — `/images/new-explorer-avatars.webp`
- 73 KB — `/images/new-explorer-peacock.png`
- 62 KB — `/images/new-explorer-cobra.png`
- 61 KB — `/images/new-explorer-turtle.png`
- 60 KB — `/images/new-explorer-tiger.png`
- 57 KB — `/images/new-explorer-owl.png`
- 56 KB — `/images/new-explorer-panda.webp`
- 52 KB — `/images/new-explorer-buffalo.png`
- 51 KB — `/images/new-explorer-squirrel.png`
- 51 KB — `/images/new-explorer-horse.png`
- 50 KB — `/images/new-explorer-fish.png`
- 49 KB — `/images/new-explorer-camel.png`
- 49 KB — `/images/new-explorer-monkey.png`
- 44 KB — `/images/new-explorer-lion.png`
- … and 28 more

## My Indian Story

Entry: `about-me-hut/indian-story/MyIndianStoryGame.jsx`

**Imported by this scene: 39 files, 0.60 MB**

- 72 KB — `about-me-hut/indian-story/assets/images/ganeshaplace/india-map.webp`
- 29 KB — `about-me-hut/indian-story/assets/images/name_background.webp`
- 25 KB — `about-me-hut/indian-story/assets/images/languages/otherlanguage.webp`
- 23 KB — `about-me-hut/indian-story/assets/images/languages/play-language.webp`
- 23 KB — `about-me-hut/indian-story/assets/images/languages/Telugu.webp`
- 20 KB — `about-me-hut/indian-story/assets/images/languages/Bengali.webp`
- 20 KB — `about-me-hut/indian-story/assets/images/languages/Kannada.webp`
- 20 KB — `about-me-hut/indian-story/assets/images/languages/English.webp`
- 19 KB — `about-me-hut/indian-story/assets/images/languages/Marathi.webp`
- 19 KB — `about-me-hut/indian-story/assets/images/ganeshaplace/TamilNadu.webp`
- 19 KB — `about-me-hut/indian-story/assets/images/languages/hindi.webp`
- 18 KB — `about-me-hut/indian-story/assets/images/languages/malyalam.webp`
- 18 KB — `about-me-hut/indian-story/assets/images/languages/Punjabi.webp`
- 17 KB — `about-me-hut/indian-story/assets/images/languages/Tamil.webp`
- 17 KB — `about-me-hut/indian-story/assets/images/festivals/chaturthi.webp`
- 17 KB — `about-me-hut/indian-story/assets/images/languages/Sanskrit.webp`
- 17 KB — `about-me-hut/indian-story/assets/images/festivals/dussehra.webp`
- 16 KB — `about-me-hut/indian-story/assets/images/festivals/onam.webp`
- 16 KB — `about-me-hut/indian-story/assets/images/festivals/sakranti.webp`
- 14 KB — `about-me-hut/indian-story/assets/images/languages/Gujarati.webp`
- 13 KB — `about-me-hut/indian-story/assets/images/festivals/eid.webp`
- 12 KB — `about-me-hut/indian-story/assets/images/ganeshaplace/south.webp`
- 12 KB — `about-me-hut/indian-story/assets/images/ganeshaplace/dessert.webp`
- 12 KB — `about-me-hut/indian-story/assets/images/festivals/modak.webp`
- 11 KB — `about-me-hut/indian-story/assets/images/festivals/pongal.webp`
- 11 KB — `about-me-hut/indian-story/assets/images/festivals/xmas.webp`
- 11 KB — `about-me-hut/indian-story/assets/images/ganeshaplace/east.webp`
- 10 KB — `about-me-hut/indian-story/assets/images/festivals/holi.webp`
- 10 KB — `about-me-hut/indian-story/assets/images/ganeshaplace/Varanasi.webp`
- 10 KB — `about-me-hut/indian-story/assets/images/festivals/diwali.webp`
- 9 KB — `about-me-hut/indian-story/assets/images/festivals/durgapuja.webp`
- 9 KB — `about-me-hut/indian-story/assets/images/ganeshaplace/mumbai.webp`
- 9 KB — `about-me-hut/indian-story/assets/images/festivals/rakhi.webp`
- 8 KB — `about-me-hut/indian-story/assets/images/ganeshaplace/north.webp`
- 8 KB — `about-me-hut/indian-story/assets/images/ganeshaplace/central.webp`
- 8 KB — `about-me-hut/indian-story/assets/images/ganeshaplace/west.webp`
- 7 KB — `about-me-hut/indian-story/assets/images/ganeshaplace/north-east.webp`
- 5 KB — `about-me-hut/indian-story/assets/images/festivals/janmashtami.webp`
- 5 KB — `about-me-hut/indian-story/assets/images/ganeshaplace/mglass.webp`

**Public files its code names: 54 files, 15.61 MB**

- 2.50 MB — `/images/new-explorer-squirrel1.png`
- 2.50 MB — `/images/new-explorer-tiger1.png`
- 2.46 MB — `/images/new-explorer-monkey1.png`
- 2.21 MB — `/images/new-explorer-peacock1.png`
- 1.64 MB — `/images/new-explorer-avatars.png`
- 1.50 MB — `/images/ganesha-final-new.svg`
- 380 KB — `/images/new-explorer-panda.png`
- 260 KB — `/images/new-explorer-tiger1.webp`
- 238 KB — `/images/new-explorer-squirrel1.webp`
- 231 KB — `/images/new-explorer-monkey1.webp`
- 205 KB — `/images/new-explorer-peacock1.webp`
- 200 KB — `/images/new-explorer-avatars.webp`
- 117 KB — `/images/modak.webp`
- 73 KB — `/images/new-explorer-peacock.png`
- 62 KB — `/images/new-explorer-cobra.png`
- 61 KB — `/images/new-explorer-turtle.png`
- 60 KB — `/images/new-explorer-tiger.png`
- 57 KB — `/images/new-explorer-owl.png`
- 56 KB — `/images/new-explorer-panda.webp`
- 52 KB — `/images/new-explorer-buffalo.png`
- 51 KB — `/images/new-explorer-squirrel.png`
- 51 KB — `/images/new-explorer-horse.png`
- 50 KB — `/images/new-explorer-fish.png`
- 49 KB — `/images/new-explorer-camel.png`
- 49 KB — `/images/new-explorer-monkey.png`
- … and 29 more

## Shared by two or more scenes

**Imported (shared code): 32 files, 0.68 MB**

- 87 KB — `about-me-hut/family-tree/assets/images/family tree bg.webp`
- 64 KB — `meaning cave/assets/images/symbols/sarvakaryeshu-symbol.png`
- 49 KB — `meaning cave/assets/images/symbols/samaprabha-symbol.png`
- 48 KB — `meaning cave/assets/images/symbols/mahakaya-symbol.png`
- 45 KB — `meaning cave/assets/images/symbols/suryakoti-symbol.png`
- 41 KB — `meaning cave/assets/images/symbols/kurumedeva-symbol.png`
- 38 KB — `meaning cave/assets/images/symbols/sarvada-symbol.png`
- 36 KB — `meaning cave/assets/images/symbols/nirvighnam-symbol.png`
- 34 KB — `src/lib/components/feedback/assets/images/gesture-point-finger.png`
- 29 KB — `src/lib/components/feedback/assets/images/gesture-touch-finger.png`
- 22 KB — `symbol-mountain/shared/images/icons/symbol-lotus-new-opt.webp`
- 22 KB — `symbol-mountain/shared/images/icons/symbol-eyes-new.webp`
- 18 KB — `symbol-mountain/shared/images/icons/symbol-mooshika-new.webp`
- 18 KB — `symbol-mountain/shared/images/icons/symbol-trunk-new-opt.webp`
- 17 KB — `symbol-mountain/shared/images/icons/symbol-ears-new-opt.webp`

**Public files named by shared code: 398 files, 43.07 MB, by folder**

| Folder | Files | Size |
|---|---:|---:|
| `/audio/family-tree` | 88 | 11.09 MB |
| `/audio/ambient` | 2 | 5.59 MB |
| `/audio/voiceover` | 129 | 5.22 MB |
| `/audio/voice` | 35 | 3.07 MB |
| `/audio/sfx` | 21 | 2.84 MB |
| `/images/festivalsquare-bg.png` | 1 | 2.78 MB |
| `/images/cave-of-secrets-background.png` | 1 | 2.51 MB |
| `/audio/music` | 1 | 2.43 MB |
| `/audio/voicenew` | 15 | 1.39 MB |
| `/images/hut-bg.png` | 1 | 1.00 MB |
| `/images/shloka-river-bg.png` | 1 | 0.92 MB |
| `/images/modakmtn-bg.png` | 1 | 0.75 MB |
| `/audio/syllables` | 36 | 0.73 MB |
| `/audio/sfx-role-mapping-2` | 11 | 0.50 MB |
| `/images/meanings-caveofsecrets` | 8 | 0.47 MB |
| `/images/ganesha-poses` | 8 | 0.43 MB |
| `/images/icons` | 14 | 0.24 MB |
| `/audio/words` | 8 | 0.22 MB |
| `/images/mooshika-coach.webp` | 1 | 0.19 MB |
| `/images/festivalsquare-bg.webp` | 1 | 0.19 MB |
| `/images/cave-of-secrets-background.webp` | 1 | 0.11 MB |
| `/images/symbol-backpack.webp` | 1 | 0.09 MB |
| `/images/hut-bg.webp` | 1 | 0.06 MB |
| `/images/shloka-river-bg.webp` | 1 | 0.05 MB |
| `/images/cave-of-secrets-map-icon.png` | 1 | 0.04 MB |

Why this bucket is large: shared configuration (for example the voice-line configuration) lists the audio of every scene in one place, including parked and obsolete zones, so everything it names counts as "used by the live app". Listing voice files per live scene (instead of per config file) is the way to bring this down.
