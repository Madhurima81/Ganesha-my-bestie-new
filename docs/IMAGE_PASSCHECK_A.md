# Session A — Scene2 pass-check

Use the dev server with DevTools **Disable cache UNTICKED** for visual transitions and voice timing. Tick it only for cold-load measurements. No commit has been made.

- [ ] **Samaprabha rock reveal first:** hold/reveal the rock-and-grass clue; check small leaves, rock faces and cut-out edges.
- [ ] **Suryakoti happy bunny next:** finish clearing the darkness; inspect the happy pose and its change/hop toward the burrow on light and dark areas.
- [ ] Opening → Suryakoti: dark cover/rubbing, full backdrop, sad bunny and burrow; Sun remains original.
- [ ] Samaprabha: branch, reeds/leaves, stump and shadow-stump; complete the clues and check the fawn walk. Branch/reed/leaves shadow originals remain unchanged.
- [ ] Continue into each Scene2 game, then Play Again; check intros, crossfades and spoken timing with cache enabled.

Only 10 image-import lines changed in SuryakotiGame.jsx and SamaprabhaGame.jsx. Existing preload variables resolve to the new URLs; no preload timing, voice, timer or gameplay changes.


## Scene3 pass-check — approved four-image rollout

Use the dev server with **Disable cache UNTICKED** for transitions and voice.

- [ ] Nirvighnam: inspect both sad/happy turtle poses and their change, the egg nest, and the full river background.
- [ ] Move through the stone, branch and reed obstacle sequence; those original alpha images remain unchanged.
- [ ] Kurumedeva: enter the bridge/helper game and check its intro and existing artwork; no image/preload changes there.
- [ ] Continue into either game, then Play Again; check crossfades, voice timing and the full scene completion.

Scene2 was tested and reported fine by Madhurima. Scene3 changes exactly four image-import lines in NirvighnamGame.jsx; no other runtime changes. No commit/push.


## Scene4 pass-check — approved boat

Use the dev server with **Disable cache UNTICKED**.

- [ ] Sarvakaryeshu boat: check children, Mooshika, flower garland, transparency and movement.
- [ ] Step through Mooshika, eyes, trunk and tusk before/after artwork (unchanged).
- [ ] Sarvada morning, afternoon and night artwork (unchanged).
- [ ] Continue into both games and Play Again; check transitions and voice timing.

Only one boat image import changed. No commit/push.
