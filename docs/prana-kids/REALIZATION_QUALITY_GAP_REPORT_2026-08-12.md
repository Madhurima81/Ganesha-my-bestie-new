# Realization Quality Gap Report

**Date:** 2026-08-12
**Scope:** Read-only investigation of `public/prana-story-generator/` — no code, taxonomy, template, or output changes made.
**Inputs used:** live source (`phase6-app.js`, `phase8-tools/*.js`, `phase8-data/storyTemplates.json`, `phase6-data/situations.json`) and the existing corpus dump `tmp_visual_audit_corpus.json` (139 stories, generated 2026-08-11 22:08, more recent than the 2026-08-10 blind editorial review that produced the 2.0/5 score). No new generation was run; this dump already reflects the current pipeline state at commit `bea3dad`.

---

## 1. Executive summary

The "139/139 production-readiness validated" claim is true and irrelevant to the editorial failure. Automated QA checks structure (does a belief appear, does the hero have a want, are labels absent from prose) — it does not check whether two different stories are, in effect, **the same story with different nouns swapped in**.

They are. **103 of 139 stories (74%)** contain six word-for-word identical sentences — not paraphrases, not similar beats, the literal same English string — regardless of situation content:

> "But it did not work." / "That did not work either." / "This time it worked - not by trying harder, but by trying differently." / "This time it was actually done, and it was right." / "No longer needing to prove anything - just glad it was done." / "Everything felt calmer, warmer, and freer than before."

This happens because **one function**, `buildTemplateSpecificEventChain` in `phase6-app.js`, has real per-mechanism logic for exactly 4 of the corpus's 15 templates (T16, T21, T22, T23 — the ones with "Realization Contracts," approved 2026-08-10). Every other template — T02, T03, T04, T05, T08, T09, T11, T12, T14, T15, T18, covering **111 of 139 stories (80%)** — falls through, unconditionally, to one hardcoded generic "try → fail → try → fail → pause → succeed" event chain that literally stamps `templateId: "T03"` on its own output regardless of which template actually requested it (line 6897). That mislabeling is why the identical prose surfaces under 11 different template IDs: they're not 11 templates, they're 1 template wearing 11 name tags.

A homework situation, a toy-taken situation, and a misunderstood-by-parent situation all resolve to the identical shape: hero notices a random decorative object ("bent paperclip" / "round smooth stone" / "soft feathers"), tries, fails ("it did not work"), tries again, fails again, says "Wait," has an insight, tries a third time, succeeds, and "everything felt calmer, warmer, and freer than before." The object and the two belief sentences are the only situation-specific content; everything else is copy-pasted scaffolding. This is the exact defect the 2026-08-10 blind review diagnosed — it has been fixed for 4 templates and left completely untouched for the other 11.

QA still passes because the automated denylist (`runCorpusQualityAudit.js` line 241, `structuralNarrationPattern`) only bans the *specific phrases* the old T16/T21/T22/T23 failures produced (e.g. "restore attempt failed," "was not survivable as designed"). It has no rule against "did the prose reuse a hardcoded sentence verbatim across situations" — the actual, still-live failure mode. This is a real gap, not a guess: it is directly falsifiable by grepping the QA script for the phrases quoted above, which do not appear in its denylist.

---

## 2. Where the generic prose enters — exact code locations

| Layer | File:Line | Function | Role |
|---|---|---|---|
| Event chain (structure) | `phase6-app.js:6578` | `buildTemplateSpecificEventChain(templateId, ctx)` | Routes T16→6594, T21→6644, T22→6681, T23→6768 to real per-mechanism logic. Everything else falls through to the unconditional block at **6814–6902**. |
| Generic fallback event chain | `phase6-app.js:6814–6902` | (unnamed, bottom half of `buildTemplateSpecificEventChain`) | Builds the 6-beat SETUP/ATTEMPT_1/ATTEMPT_2/TURNING_POINT/ATTEMPT_3/RESOLUTION chain used by T02,T03,T04,T05,T08,T09,T11,T12,T14,T15,T18. **Line 6897 hardcodes `templateId: "T03"`** on the returned object regardless of the real template — this is the mislabel that makes `writeProseFromEventChain` treat 11 different templates as one. |
| Duplicate of the same fallback | `phase6-app.js:6904–6985` | `buildEventChain(template, blueprint, storyPlan, libraries)` | A second, near-identical copy of the same generic attempt/fail/attempt/fail/pause/succeed chain (compare 6934–6980 to 6837–6889 — same consequence strings, em-dash vs hyphen is the only diff). Two copies of one fallback to maintain in parallel. |
| Prose writer (where the literal sentences live) | `phase6-app.js:7156` (function start), hardcoded sentences at **7322, 7324, 7326 (attempt-3 success), 7333 ("smiled at last"), 7342** | `writeProseFromEventChain(template, eventChainResult, storyPlan)` | Lines 7159 (`if (templateId && templateId !== "T03")`) branch to real per-template rendering for T16/T21/T22/T23 only (7164–7275). Because the fallback chain hardcodes `templateId: "T03"`, all 11 generic-fallback templates fail this condition and fall to the bottom block (7286–7345), which is where "But it did not work", "That did not work either", "Everything felt calmer, warmer, and freer than before" are written as literal string constants. |
| Decorative-only obstacle text | `phase6-app.js:5933–5937` | `obstacleConsequenceText(ctx, which)` | Keyed off an abstract `obstacle_domain` taxonomy bucket, not the situation's own words. The code's own 2026-08-11 comment at **6801–6813** admits this directly: *"obstacleConsequenceText is purely decorative (keyed off an abstract obstacle_domain taxonomy, not the situation's actual words)."* |
| QA gap (why this passes 139/139) | `phase8-tools/runCorpusQualityAudit.js:241` | `structuralNarrationPattern` regex | Denylists the *old* T16/T21/T22/T23 failure phrases only. Does not detect cross-story verbatim sentence reuse — the mechanism that is still live. |

The "Realization Contract" fix pattern that worked for T16/T21/T22/T23 is documented inline at each branch (e.g. 6594–6603, 6644, 6681, 6768) and in `writeProseFromEventChain` at 7164–7276: replace the fixed sentence pool with mode-detection (`detectT16RealizationMode`, `detectT21RealizationMode`, etc.) plus a `T*_MODE_FRAMING` table that writes situation-grounded prose per mechanism. This pattern exists, is proven, and has simply not been extended past 4 of 15 templates.

---

## 3. Ranked list of broken templates/families

Ranked by usage volume × repetitiveness × mechanism failure × child-story quality impact. Volume counts are situations in the 139-story corpus dump (`tmp_visual_audit_corpus.json`), grouped by `templateId`.

### #1 — Generic fallback family (T03, T18, T14, T15, T11, T08, T09, T05, T02, T12, T04) — 111/139 stories (80%)

This is not 11 separate problems; it is one shared, unfixed code path (§2) surfacing under 11 labels. Ranking as one item because fixing the shared function fixes all 11 at once — see §5.

- **T03 — 20 stories.** SIT005 ("Can't finish homework"): *"Tara wanted to finish the problem successfully. While wondering what to do, Tara found a bent paperclip nearby... So Tara tried the same thing again, a little harder."* A paperclip has no relationship to homework; it is the interchangeable "motif object" every story in this family gets.
- **T18 — 16 stories.** SIT001 ("Toy not shared or taken away"): identical arc, "round smooth stone" swapped in for the paperclip. Compression: *"Kavi chose a different response, and the ending felt warmer and freer than before"* — same closing clause family as T03's compression, different only in adjective order.
- **T14 — 16 stories.** SIT013 ("Adult doesn't understand what they mean"): *"Bodhi found a pair of soft feathers nearby... So Bodhi tried saying exactly what was meant."* Object swapped again ("soft feathers"); arc and six boilerplate sentences identical.
- **T15 — 15 stories, T11 — 14 stories, T08 — 5, T09 — 4, T05 — 4, T02 — 4, T12 — 4, T04 — 1.** Same shared code path; same evidence pattern confirmed by the cross-template sentence-frequency scan in §7 below (e.g. "The change was clear in what happened next" appears across T18, T21, T15, T11, T16, T05, T08, T03, T12, T02 — 10 different template IDs, 33 occurrences).

**Mechanism-failure assessment:** the promised narrative mechanism for these templates ("second attempt," "turning point," "resolution") is completely flattened. Nothing in the text differentiates *why* the second attempt differs from the first, or what specifically the hero understood — the turning point ("understood something new — [trueBelief]") is the only situation-specific content in a 5-beat arc; everything surrounding it is fixed scaffolding.

### #2 — Decorative motif objects across the same family

Not a separate template but worth ranking on its own because it is a second, independent genericness vector layered on top of #1: the "noticed object" (paperclip / stone / feathers / sprout / half-open door) that recurs through SETUP → ATTEMPT_2 → RESOLUTION has zero causal or symbolic connection to the situation or its resolution — it is picked from a decorative pool and never pays off. It "stays close by, a small reminder of what had changed" in every story that uses it (37 occurrences across T18, T09, T15, T03, T14, T04), reminding the child of nothing situation-specific.

### #3 — T16 (18 stories) — fixed, included only as the positive control

T16's Realization Contract (2026-08-10) is the working comparison case. SIT003 ("Told 'no' without explanation"): *"Vani asks to do something they really want to do, and a parent simply says no... Vani let the waiting stop feeling like a verdict, calmer for it."* This is genuinely situation-grounded — no paperclip, no "did not work," no shared closing sentence. Confirms the fix pattern works; the problem is coverage, not technique.

---

## 4. Which templates/families need "realization contracts"

All 11 templates currently routed to the generic fallback need the same treatment T16/T21/T22/T23 already received:

**T03, T18, T14, T15, T11, T08, T09, T05, T02, T12, T04**

Because they all share one fallback function, this is a single engineering task with 11 template-specific `T*_MODE_FRAMING` tables to author (mirroring `T16_MODE_FRAMING`, `T21_MODE_FRAMING`, etc.), not 11 separate debugging efforts.

---

## 5. Shared architecture to fix once

Fix in exactly two places, both already identified in §2:

1. **`buildTemplateSpecificEventChain`** (`phase6-app.js:6578`) — add real branches for the 11 remaining templates following the existing T16/T21/T22/T23 pattern (mode detection function + `T*_MODE_FRAMING` table), instead of letting them fall through to the 6814–6902 block. Critically, **stop that fallback block from stamping `templateId: "T03"`** on chains it builds for other templates (line 6897) — even as an interim step before full fixes land, correcting this mislabel would at least let each template's QA and prose paths be reasoned about independently instead of silently merging into "T03."
2. **`writeProseFromEventChain`** (`phase6-app.js:7156`) — once (1) is fixed, extend the `if (templateId && templateId !== "T03")` branch (7159) with real per-template rendering blocks (7164–7275 pattern) for the same 11 templates, and retire the literal hardcoded sentences at 7322–7342.

Also worth fixing once rather than duplicating: **`buildEventChain`** (`phase6-app.js:6904`) is a second, nearly-identical copy of the same generic chain already present in the 6814–6902 block. Confirm whether it's still called anywhere (vs. superseded by `buildEventChainV2` → `buildTemplateSpecificEventChain`); if dead, remove it so there is one fallback to fix, not two.

**Do not touch:** the situation content library (`phase6-data/situations.json`), Phase 6-7 architecture, or template/selector logic — all confirmed out of scope per the locked diagnosis and consistent with what this investigation found: the situations themselves carry plenty of specific, usable detail (paperclip situations reference real homework struggles, real belief text); the prose layer simply never uses most of it for these 11 templates.

---

## 6. Recommended implementation order for next session

1. **Stop the mislabel first** (`phase6-app.js:6897`) — make the fallback event chain report its real `templateId` instead of hardcoded `"T03"`. Low-risk, immediately makes downstream QA/dumps able to distinguish the 11 templates instead of merging them, and is a prerequisite for per-template fixes to even be measurable.
2. **Pick the two highest-volume templates first: T03 (20 stories) and T18 (16 stories).** Author `T03_MODE_FRAMING` / `T18_MODE_FRAMING` and mode-detection functions following the T16 pattern (`detectT16RealizationMode` at 6108 is the shortest, cleanest template to copy). This alone moves ~26% of the corpus off the generic path.
3. **T14 (16) and T15 (15) next** — same pattern, brings coverage to ~51% of the corpus fixed.
4. **T11 (14) and T08/T09/T05/T02/T12/T04 (5,4,4,4,4,1)** — remaining long tail, can be batched since volume per template is low.
5. **After all 11 are converted**, retire the dead literal sentences in `writeProseFromEventChain` (7322–7342) and the now-unused fallback block (6814–6902), and confirm `buildEventChain` (6904) is dead code and safe to delete.
6. **Close the QA gap** by adding a same-sentence-across-different-situations check to `runCorpusQualityAudit.js` (a real regression net for this failure mode, not just the old denylist) — so a future regression here fails automated QA instead of requiring another blind human review to catch.
7. Re-run a blind editorial spot-check (5-8 stories, mixed templates) after step 3 (roughly half the corpus fixed) to confirm the fix actually reads better to a human, not just structurally different — matching the standard the original 2.0/5 review used.

---

## 7. Supporting evidence — cross-story sentence-frequency scan

Method: concatenated all page text + compression text for all 139 stories in `tmp_visual_audit_corpus.json`, split into sentences, counted exact string matches, cross-referenced against `templateId`.

| Occurrences | Templates it spans | Sentence |
|---|---|---|
| 103 | T02,T03,T04,T05,T08,T09,T11,T12,T14,T15,T18 | "But it did not work." |
| 103 | (same 11) | "That did not work either." |
| 103 | (same 11) | "This time it worked - not by trying harder, but by trying differently." |
| 103 | (same 11) | "This time it was actually done, and it was right." |
| 103 | (same 11) | "No longer needing to prove anything - just glad it was done." |
| 103 | (same 11) | "Everything felt calmer, warmer, and freer than before." |
| 37 | T18,T09,T15,T03,T14,T04 | "The round smooth stone stayed close by, a small reminder of what had changed." (motif-object variants of this exact sentence shape) |
| 33 | T18,T21,T15,T11,T16,T05,T08,T03,T12,T02 | "The change was clear in what happened next." |
| 34 | T08,T03,T09,T15,T11,T14,T18 | "It did not work - it still would not budge." |
| 26 | T18,T03,T05,T02,T11 | "It did not work - it still did not make any sense." |

103/139 = 74% of the entire corpus shares the same six sentences verbatim. This is the single largest, most damaging, and most fixable finding in the corpus.
