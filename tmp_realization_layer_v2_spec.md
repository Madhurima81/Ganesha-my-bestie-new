# Realization Layer V2 — Rewrite Spec

**Status:** APPROVED for implementation (2026-08-10). §7 is not to be treated as a design exercise — extend the existing T22 `objectRef` pattern first, using the locked data hierarchy. Locked sequence: (1) implement V2, (2) run automated 30-story corpus, (3) run blind 30-story editorial review, (4) compare to 2.0/5 baseline, (5) fix only systemic failures, (6) lock V2 → site integration. No further architecture redesign unless the blind review exposes a genuinely structural problem.
**Locked context:** [tmp_story_quality_report.md](tmp_story_quality_report.md) automated audit (8/25 PASS) + 30-story blind editorial review (2.0/5, all FAIL, 2026-08-10). Diagnosis locked: the content library and situation choices are fine; the layer that turns event-chain beats into prose is the problem. No per-story patching. No Phase 6-7 architecture changes. No touching the situation library.

---

## 1. Root cause (grounded in code, not guesswork)

Two functions in `public/prana-story-generator/phase6-app.js` are responsible for essentially all 30 FAILs.

### 1a. Event beats are written as structural summaries, not scenes

`buildTemplateSpecificEventChain(templateId, ctx)` ([phase6-app.js:5604](public/prana-story-generator/phase6-app.js:5604)) sets each beat's `action` field to a sentence that describes *what kind of narrative function just happened*, not *what a child would see happen*. Examples pulled directly from the function:

| Beat | Current `action` (verbatim) |
|---|---|
| T21 RESTORE_FAILS | `` `The restore attempt failed; the original plan was not survivable as designed.` `` (line 5664) |
| T22 CONNECTED_DISCOVERY reinterpretation | `` `${capitalizeWord(objectRef)} now revealed a connected origin and meaning that none of the single clues could show alone.` `` (line 5687) |
| T23 INITIAL_RESPONSE | `` `${supportingActor} responded in a way that did not match ${p}'s first assumption.` `` (line 5703) |
| T16 RESOLUTION | `` `${p} acted on the second interpretation and moved forward more accurately.` `` (line 5641) |

These are metadata descriptions of the beat's job (what a QA linter checks for), not story sentences. They read like commit messages, because structurally that's what they are.

Then `writeProseFromEventChain` ([phase6-app.js:6051](public/prana-story-generator/phase6-app.js:6051)) wraps each beat in one or two scaffold sentences and inserts the raw `action` string in between — e.g. line 6119: `join(sentence(event.action), sentence(event.newInformationOrShift), sentence(event.contradictionMoment), sentence(event.reinterpretation))`. There is no step that converts the abstract beat into a concrete scene with a visible action, object, and sensory or dialogue detail. The abstraction is the final output.

### 1b. Compression re-inserts raw situation-library text

`buildCompressedStory` ([phase6-app.js:3588](public/prana-story-generator/phase6-app.js:3588)) does:
```js
const situationTitle = lowerFirst(ctx.situationTitle || "a difficult moment");
...
text = `${hero} nearly treated ${situationTitle} as something simple, while the old thought said ${falseBelief}. ` ...
```
`ctx.situationTitle` is the situation library's title field (e.g. "friend got a new toy"), lowercased and spliced into a hero-as-subject sentence with no rewording. This produces exactly the leaks Madhurima flagged: "Gauri nearly treated friend got a new toy as something simple." The bug is structural — the template treats a noun-phrase label as if it were a clause that can follow "treated ___ as."

---

## 2. What "PASS" looks like

Structure → semantic event → natural prose, replacing structure → structural instruction → sentence.

Concrete target (from the feedback): the beat "assumption challenged" must produce something like:

> "Bodhi expected Maya to laugh when he asked to join. Instead, Maya handed him the ball and said, 'We were just choosing teams.'"

not:

> "Their friend responded in a way that did not match Bodhi's first assumption."

The difference: the first version names a concrete expectation, a concrete action, and (where natural) a line of dialogue. The second names the *category* of thing that happened. Every beat in every template needs this transformation.

---

## 3. Scope of the rewrite

**In scope:**
- `buildTemplateSpecificEventChain` (T16, T21, T22, T23 branches) and the shared T03 beat builder below it — replace abstract `action` strings with concrete-event generation.
- `writeProseFromEventChain` — once beats carry concrete events, the scaffold-wrapping logic needs to change from "structural sentence + raw action" to "scene sentence using the concrete event," since the current scaffold sentences (e.g. "X took one slow breath and said, 'Wait'") are formulaic filler layered around the abstraction. These may partially survive as connective tissue but should no longer be doing the load-bearing work of narration.
- `buildCompressedStory` — situation reference must be reworded into a clause, not spliced as a noun phrase. Needs a per-situation or per-template compression clause generator instead of `${situationTitle}` string interpolation.

**Explicitly out of scope:**
- Phase 6/7 blueprint, event-chain *structure* (beat sequence, beat count, required fields like `evidenceCited`, `disruptionCategory`, `reinterpretationFocus`) — these pass the automated linter today and are not what reviewers flagged.
- The situation library content itself (situations, emotions, worlds, characters) — confirmed good by the blind review.
- `templateQaLinter.js` structural validation rules — stay as-is; they validate beat *shape*, and shape is fine. Add new content-quality checks (see §5) without removing existing ones.

---

## 4. Approach

### 4a. Concrete-event generation per beat

For each template beat, instead of one hardcoded abstract sentence, generate the sentence from **situation-specific concrete slots**.

**Data source order (mandatory, per Madhurima's change #2):**
1. Use existing concrete event data already on `ctx` first (protagonist, coreReference/object, obstacleClause, supportProfile, world/setting, realizedSituation.sentence).
2. If that data is insufficient to make the beat concrete, fall back to the already-authorized Story Plan / event-detail layer (the layer upstream of `buildTemplateSpecificEventChain` that already carries richer scene furniture for some situations, per Madhurima's own earlier testing that some situations lack enough `ctx` detail alone).
3. Never invent arbitrary decorative detail not sourced from `ctx` or the Story Plan. If neither source has enough material for a concrete beat, that is a data-coverage gap to flag, not something the prose layer papers over with invented specifics.

Example rewrite direction for T23 INITIAL_RESPONSE (currently line 5703):
- Old: `${supportingActor} responded in a way that did not match ${p}'s first assumption.`
- New pattern: `${supportingActor} did [concrete micro-action drawn from ctx.obstacleClause / coreReference, or Story Plan detail if ctx is insufficient], not [the thing p expected].`

This requires auditing what concrete nouns/verbs are already available on `ctx` per situation (object references, world details, obstacle clauses already exist per the T22 `objectRef` pattern at line 5607) and routing them, plus Story Plan fallback data, through every beat, not just some.

**Hard rule — the "two of five" test (mandatory, per Madhurima's most important architectural addition):**
Every concrete-event beat must answer at least two of:
- What did someone do?
- What did someone say?
- What changed physically?
- What specific object/place was involved?
- What consequence became visible?

This replaces the earlier draft's "dialogue OR concrete physical action" requirement, which Madhurima flagged as likely to produce fake, forced dialogue/actions just to satisfy a linter. The two-of-five test instead requires *observable evidence* in whatever form the beat naturally supports — action, dialogue, object interaction, environmental change, or visible consequence — not a mandatory dialogue/action slot on every beat.

**No-structural-narration invariant (mandatory, per Madhurima's change #3):**
This is a semantic rule, not a denylist. A denylist only catches today's flagged phrases (`restore attempt failed`, `responded in a way`, `moved forward more accurately`, etc.) — tomorrow's equivalent phrasing slips through the same hole. The actual rule:

> `action` may never describe what the beat *does* (its structural/narrative function). It must describe what happens *in-world* — a visible, concrete event a reader could picture.

Any `action` string that could be paraphrased as "[beat label] happened" without losing information has failed this test, regardless of exact wording. This is the standing rule implementers write beats against; the denylist in §5 is a regression net for the already-known failures, not the primary guard.

### 4b. Retire the "announce the belief" scaffold pattern

Current scaffolds explicitly narrate the insight as a stated line (`"${ctx.protagonist} could finally feel that ${ctx.trueBelief}"` at line 6080, `"Slowly ${ctx.protagonist} understood that ${ctx.trueBelief}"` at line 6114). **Locked decision:** the event must demonstrate the insight; a stated-belief line (e.g. "Slowly X understood that...") may never be the *primary* realization mechanism. It may appear only where it reads naturally as a brief closing confirmation after the event has already shown the change — never as the thing doing the narrative work. This is a prose-pattern change across all four T16/T21/T22/T23 branches in `writeProseFromEventChain`.

### 4c. Compression rewrite

**Locked decision:** compression must use `ctx.realizedSituation.sentence` or `ctx.obstacleClause` — both already full clauses, already used correctly elsewhere (e.g. line 6073, 6086) — and must never interpolate `ctx.situationTitle` directly into subject/object position. The current corruption (`"Gauri nearly treated friend got a new toy as something simple"`) is undeniable and this is a direct fix to `buildCompressedStory`'s per-template text-building branches (T16/T21/T22/T23, lines 3603-3623).

### 4d. Dialogue policy (locked)

Dialogue is allowed wherever naturally supported by the beat's data — not mandatory on any beat (see the two-of-five test in §4a, which dialogue can help satisfy but is never required to satisfy alone). Supporting-character beats (T16 EVIDENCE_GATHERING-adjacent, T23 INITIAL_RESPONSE/REVEAL) should *strongly prefer* dialogue or a concrete action, since these are exactly the beats where current prose collapses into abstraction (e.g. the T23 `responded in a way that did not match` example).

### 4e. Length (locked)

Retain the existing 50-70 word compression constraint (`validateCompressedStory` CQA-002, line 3678) as-is. No new reading-level or word-count system is introduced in V2.

---

## 5. Verification plan

1. **Automated — regression net, not the primary guard:** extend `templateQaLinter.js` / `runCorpusQualityAudit.js` with:
   - A denylist regex seeded from the known-flagged phrases (`restore attempt`, `did not match`, `revealed a connected origin`, `responded in a way that`, `moved forward more accurately`, `treated ... as something simple`) — catches regressions to exactly these known failures.
   - A check that no compression sentence contains a normalized `ctx.situationTitle` string as a verbatim fragment.
   - A "two of five" check per beat (§4a) — flag any beat whose `action`/associated fields don't demonstrate at least two of: action taken, dialogue spoken, physical change, specific object/place, visible consequence. This is a heuristic proxy for the semantic no-structural-narration invariant, not a substitute for it — the invariant itself must be applied by whoever writes/reviews each beat's generation logic, since "does this describe what happens in-world vs. what the beat's job is" is a judgment call a regex can only approximate.
2. **Human:** rerun the same 25-case automated corpus, then rerun a blind editorial pass on the same 30-story pack Madhurima already scored, so before/after is apples-to-apples.
3. **Gate:** do not consider this done at "automated audit passes." The automated audit already showed 8/25 PASS while the blind human read still failed all 30 — automated checks are a floor, not the target. The bar is the blind read.

---

## 6. Decisions locked (2026-08-10 review)

- Dialogue: allowed wherever naturally supported, not mandatory; strongly preferred on supporting-character beats. (§4d)
- Compression: `realizedSituation.sentence` / `obstacleClause` only, never `situationTitle`. (§4c)
- Insight: event must demonstrate the change; "Slowly X understood that..." style lines may appear only as a brief natural closer, never as the primary realization mechanism. (§4b)
- Length: existing 50-70 word compression constraint retained, no new system. (§4e)
- Beat concreteness: two-of-five observable-evidence test, not a mandatory dialogue/action slot. (§4a)
- Data sourcing: `ctx` first, Story Plan/event-detail layer as fallback when `ctx` is insufficient, never invented decorative detail. (§4a)

## 7. Remaining open question for Madhurima before implementation starts

Should concrete per-beat scene detail be hand-authored per template+situation-category (more control, more authoring work), or generated from existing `ctx`/Story Plan fields via better sentence patterns (less authoring work, less guaranteed specificity)? The T22 object-focused branch already has a working example of the pattern-generation approach (`objectRef`) — proposal is to extend that pattern first and only fall back to hand-authoring for beats/templates where pattern generation can't clear the two-of-five test even with Story Plan fallback data.
