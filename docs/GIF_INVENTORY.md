# Animated pictures inventory — where every animation is used

Updated 2026-11-23 (branch `staging`, up to commit `9dd59882`). Built from the code and the build output; **nothing has been play-tested scene by scene**, and Jest cannot run on this computer (`identity-obj-proxy` missing).

**Format.** 57 of the 64 project GIFs are now animated WebP (`*-anim.webp`, 11.4 MB to 4.2 MB, same frame delays and loop settings). **7 are still GIFs**, waiting for the artist's WebP versions:
intro-story family (`story-s5-family`), Kartikeya, Parvati, Mahakaya `aboard-peacock`, Sarvakaryeshu eyes `boy-after`, Samaprabha symbol, Tusk `peacock_happy_feather`.
The old GIF of each swapped file is still in its folder, unused.

**Legend.** **once** = plays once and holds the last frame. **loop** = repeats. **blink** = loops with a 2.5 s rest on the last (eyes-open) frame, so it blinks naturally instead of continuously.
**Fitting.** Every blink was fitted onto the old still picture (same content size, bottom-centre aligned), so it replaces that picture with no jump. Script: `scripts/fit_blink_to_static.py`.

---

## 1. The 16 symbol animations (once)

One module per zone, scenes import the same names. Tools: `scripts/gif_to_webp_swap.py`, `scripts/rewrite_gif_refs.py`.

| Zone | Module | Symbols |
|---|---|---|
| Symbol Mountain | `src/zones/symbol-mountain/shared/symbolGifs.js` | Mooshika (new "mouse walks to the Modak"), Trunk, Belly, Eyes, Ears, Tusk, Lotus, Modak |
| Shloka River | `src/zones/shloka-river/shared/shlokaSymbolGifs.js` | Vakratunda, Mahakaya, Suryakoti, Samaprabha (still a GIF), Nirvighnam, Kurumedeva, Sarvakaryeshu, Sarvada |

| Place | Shows | Notes |
|---|---|---|
| Symbol auto-reveal | the animation | the card **waits for it to finish, then flips** (`gifDuration.js` reads GIF and WebP frame delays; min 1.1 s, max 6 s) |
| Opened cards: mandala, Symbol Mountain sidebar, Shloka River sidebar, map popups (symbol, word, meaning, chant practice) | the animation | the card is the shared `AffirmationCard`: tap anywhere to close, speaker top-right |
| For Parents | the animation | |
| Tiles and grids: sidebars, phone drawer, map grids, closing-modal circles and trophies, opening modal, Shloka finale orbs, Sarvada/Sarvakaryeshu answer buttons | **the last frame of the animation** (`*-still.webp`) | so a small picture matches the animation it opens |

---

## 2. Symbol Mountain

| Scene | What animates | How |
|---|---|---|
| 1 Modak | Mooshika **calm** GIF after the press-and-hold settle walk (reveal card waits for it); Mooshika **satisfied** GIF when the Modak glows in the garland game | calm: loop with rest, only for the calm moment; satisfied: once |
| 1 Modak, flower and garland games | Mooshika = plain **blink** (`mooshika-blink`); Ganesha = the original open-palm Ganesha **blink** (`ganesha-garland-blink`) | both freeze to a still (last frame) while a symbol reveal or the side panel is up |
| 2 Pond | the sad turtle is the Nirvighnam turtle **blink** | |
| 3 Tusk, nest game | monkey, cow, peacock, elephant **blink** | |
| 3 Tusk, Eyes game | worried monkey and worried peacock **blink**; happy monkey once; happy peacock = GIF, once | animal calls play with the happy ones |
| 3 Tusk, Ears game | thirsty elephant, tired cow and hungry cow **blink**; happy elephant and cow once | |
| 3 Tusk, beat player | bunny helping | loop |
| 4 Sacred Assembly | all 8 symbols | see section 1 |

## 3. Shloka River

| Scene | What animates | How |
|---|---|---|
| 1 Vakratunda | sad frog and waiting family **blink**; at the reunion the frog's happy and the family's happy GIFs **start together**; water ripples | happy GIFs loop; ripples loop |
| 1 Mahakaya | waiting elephant, cow, monkey, peacock **blink**; boarded animals loop with a rest until the reveal (peacock = GIF); animal calls | calls play after the syllable, never over Sanskrit |
| 2 Suryakoti | sad bunny **blink**; happy bunny | happy: loop |
| 2 Samaprabha | worried fawn **blinks** until the game is done, then the happy fawn-walk GIF | walk: once |
| 3 Nirvighnam | sad turtle **blink**; swim; walk | swim: loop; walk: once |
| 3 Kurumedeva | elephant-with-banana, monkey-with-twig and beaver-asking **blink**; beaver walking; hug; lift / carry / place / pick-plank / vine-knot GIFs (another session) | walking: loop; hug and the help GIFs: once |
| 4 Sarvakaryeshu, Sarvada | layered rounds: background + Before and After characters | once (eyes After boy = GIF) |
| 5 Finale | orbs use the symbol stills | |

## 4. About Me Hut

| What | How |
|---|---|
| Ganesha, idle and wrong answer (Favourite Food, Dreams, My Indian Story) | `ganesha-favorite-idle-blink`: **blink**; a wrong tap replays it (picture restarts) |
| Ganesha, correct answer; Family Tree celebration | new waving happy GIF, **once** |
| Family Tree Shiva (WebP), Parvati and Kartikeya (GIFs) | **loop with a 2.5 s rest** |
| Dreams | the bottom-left Ganesha is raised a little |
| Cow and peacock "friends" in Favourite Food (favourite friend) and Dreams (wishes) | **blink**, in their own drawing style (`fav-cow-blink`, `fav-peacock-blink`; one copy per game folder) |
| Mouse (Mooshika) "friend" in Favourite Food and Dreams | **blink** (`fav-mouse-blink`) |

## 5. Opening, intro story, loading, map

| What | How |
|---|---|
| Opening animation (welcome and the intro story's start) | background video + transparent Ganesha overlay (`WelcomeLayers.jsx`); Ganesha plays once, then a still |
| Intro story page 1 (Parvati makes Ganesha), page 5 (family; GIF) | once |
| Intro story page 3 | Parvati and Shiva PNG on the same garden background |
| Ganesha blink poses (`GANESHA_POSE_ASSETS` in `ganeshaUsageSystem.js`) | sitting baby with modak: closing modal and loading screens; standing pointing: opening modal; hands together: end of the intro story. All **blink** |
| Map | Ganesha pointing | loop |

## 6. Animal calls (shared sound engine)

`animalCow`, `animalElephant`, `animalMonkey`, `animalPeacock` in `src/lib/audio/sfx.js` (files `public/audio/sound-*.webm`, 1.6 to 2.7 s). They follow Parent Settings > Sound effects and are dropped while a Sanskrit syllable is speaking. Used with the Tusk success animations and when each animal boards the Mahakaya raft.

---

## 7. Still pictures on purpose, or not done

- Small tiles, grids, the opening modal pictures, the finale orbs and the Sarvada/Sarvakaryeshu answer buttons use the last-frame stills.
- **No blink yet:** other beaver poses, the ZoneConfig Tusk icon.
- **Not needed:** the happy turtle and happy fawn already have moving animations (turtle walk, fawn walk); the Vakratunda baby elephants are old art that is no longer used.
- The golden Modak glow in the garland game stays still.
- Help-overlay configs (`helpConfig.js`) are not used by the live scenes.

## 8. Open

1. The 7 flagged GIFs: swap to WebP when the artist's versions arrive; Kartikeya and Parvati also need the loop with a rest.
2. Play-test every scene: sizes, positions, Before/After timing, blink look, animal-call timing, the symbol-card wait with the WebP files.
3. Unused leftovers: old GIFs (about 1.7 MB of them sit in `public/` and are copied into the build, but they are not downloaded for offline use), `ganesha-favorite-idle.png`, the old wrong-answer blink, `GMB` trial files.
4. Uncommitted helpers: `docs/GIF-WebP-Comparison.html`, `docs/gif-webp-map.json`, an unused `story-s5-family-anim.webp`.
