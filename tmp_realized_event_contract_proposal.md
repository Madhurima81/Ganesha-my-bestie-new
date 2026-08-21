# Realized-Event Contract — Proposal (T22 only, no code yet)

**Status:** For approval. No implementation until this is signed off, per instruction.
**Scope:** T22 only. T16/T21/T23 not touched.

---

## 1. Data trace: what's actually available, stage by stage

I traced the real pipeline (not assumed) by reading `phase6-app.js` and the situation library JSON directly.

### Stage 1 — Situation record (`phase6-data/situations.json`)

Each situation carries a `storySeed` object:

```json
{
  "childExperience": "Kavi sees a friend bring a brand-new toy to school, and everyone gathers around to see it.",
  "immediateWant": "Have the toy or feel just as excited about what Kavi has.",
  "immediateObstacle": "The new toy belongs to the friend.",
  "emotionalTension": "Kavi suddenly compares their own favourite things with what someone else has.",
  "context": ["school or playtime"],
  "narrativeSummary": "The new toy comes out of the box, and everyone leans closer. Kavi looks at their own toy in their bag and suddenly it doesn't seem nearly as special."
}
```

**Finding: `narrativeSummary` is never read anywhere in `phase6-app.js`.** I grepped the whole file — zero references. It exists on 156 of 168 situations. It is exactly what the current engine has been synthesizing badly: a short, concrete, already-good scene — an actual moment, not a label. `concreteSceneFacts()` (the function I wrote last pass) and `buildStorySeedContextText()` both skip it entirely, only joining `childExperience + immediateWant + immediateObstacle + emotionalTension`.

This is the single biggest lever available. Before designing new generation logic, the realization layer should be **reading and adapting authored scene prose that already exists**, not synthesizing a substitute from fact fragments.

The `ontology` block also carries `falseBeliefText`/`trueBeliefText` (already used as `ctx.falseBelief`/`ctx.trueBelief`) and `ganeshaSymbolPrimary`/`Secondary` — the actual intended symbol pairing per situation, which the current code ignores in favor of whatever symbol the Story Plan's `symbolPlan[0]` happens to select generically.

### Stage 2 — Blueprint (`buildStoryBlueprint`)

Resolves: protagonist name + species (`character`), `mission`, `obstacle` (structural domain, e.g. `OD_SOCIAL`), `storyConflict`, belief pair, `storyActions` (3 generic action ids like `ACTION_SEARCH`). This stage supplies **structural roles**, not scene content — confirmed by its own comments ("Mission and Obstacle are the STRUCTURAL role... they do not supply the concrete content").

### Stage 3 — 7B Story Plan (`buildStoryPlan` → `scenePlan`, `symbolPlan`)

Resolves scene count/ids and picks a symbol record (`symbolPlan[0]`) used for `SYMBOL_MECHANISM` lookup (motif noun + verbs). This is where `ctx.mechanism` (e.g. `{motif: "warm modak", noticeVerb: "noticed"}`) comes from — genuinely useful concrete texture, currently attached generically rather than being the situation's *own* `ganeshaSymbolPrimary`.

### Stage 4 — Event Planner (`buildEventPlannerContext` → `ctx`)

Currently derives, from the Situation's `storySeed` (minus `narrativeSummary`):
- `realizedSituation.sentence` / `.want` (from `childExperience`/`immediateWant`, name-substituted)
- `obstacleClause` (domain flavor + `immediateObstacle`)
- `coreReference` / `objectReference` (a single noun guessed from a fixed word list against the joined storySeed text — brittle; this is how "friend" vs "toy" collided before I split the list)
- `concreteSceneFacts()` (`obstacleFact`, `tensionFact`) — the function I added last pass, which is really just `immediateObstacle` and `emotionalTension` restated

**What's missing that should be here:** the raw `narrativeSummary` sentence(s), unsplit and unprocessed, available for the realization layer to actually adapt into beats.

### Stage 5 — `buildTemplateSpecificEventChain` → `writeProseFromEventChain`

This is where beats get written today: a fixed per-template *shape* (NOTICE → INVESTIGATE → DISCOVER → CONNECTED_DISCOVERY → NEW_CHOICE → RESOLUTION for T22) with **one hardcoded realization mechanism per beat**, decorated with variant phrasing. This is the actual bug you're describing: the shape and the mechanism are both fixed; only word choice varies.

---

## 2. Why this produces the "same author" problem

`concreteSceneFacts()` only has two facts to draw from (`obstacleFact`, `tensionFact`), and T22's beat shape has 6 slots that all need to say *something* concrete. With only 2 real facts and 6 slots, the generation code is structurally forced to reuse the same 2 facts across multiple beats and pad the rest with mechanism-shaped filler ("crouched down," "took one slow breath," "set two details side by side") — which is identical in shape every time because it isn't drawing from the situation, it's drawing from the template.

`narrativeSummary` changes this ratio. It's typically 2-3 sentences of an actual described scene — enough raw material to ground 3-4 beats in genuinely different situation-specific content instead of 2 facts stretched across 6 slots.

---

## 3. Proposed `realizedEvent` schema

Every beat in every event chain becomes one of these, instead of a bare `action` string:

```
realizedEvent = {
  beatLabel: string,            // e.g. "CONNECTED_DISCOVERY" — structural, unchanged
  actor: string,                // who does this beat's action (hero, or a named supporting person)
  mechanism: enum,               // HOW the beat is realized — see §4. Chosen per-situation, not fixed per-beat.
  concreteAction: string,        // WHAT actor visibly does — a physical action, sourced from narrativeSummary
                                  // or storySeed facts, never invented
  target: string | null,         // the specific object/person/place the action is directed at
                                  // (must be type-correct: object beats get objects, never people)
  trigger: string | null,        // WHY this happens now — the immediate cause, from immediateObstacle/
                                  // emotionalTension/narrativeSummary, not a generic connector
  consequence: string,           // the visible/felt result of concreteAction — sets up the next beat
  sourceField: enum,             // AUDIT FIELD: which situation field this event was actually grounded in
                                  // (narrativeSummary | childExperience | immediateObstacle |
                                  // emotionalTension | NONE_AVAILABLE) — makes "did we invent this?"
                                  // checkable in review, not just trusted
}
```

`sourceField: NONE_AVAILABLE` is an allowed, honest value — per your instruction, if the situation genuinely doesn't support a concrete event at a beat, the beat stays structurally simpler (shorter, more generic) rather than inventing decorative specifics. That's a visible, reviewable flag rather than a silent gap.

---

## 4. Realization mechanisms (breaking the sentence skeleton)

Per your note: synonym swaps ("crouched" / "bent closer" / "leaned in") are not variety — they're the same sentence architecture. The fix is to vary **what kind of thing happens**, not just which words describe it. Proposed mechanism pool for T22's "notice/investigate" beats (the part of the chain currently hardcoded as physical crouch-and-pick-up):

| Mechanism | What it looks like | Best fits |
|---|---|---|
| **Physical discovery** | Hero physically finds/picks something up | SIT148 (found object) — genuinely a discovery |
| **Absence noticed** | Hero notices something is *missing*, not present | SIT045 (lost blanket) — there's nothing to pick up, the whole scene is an absence |
| **Social observation** | Hero watches something happen to/around someone else | SIT083 (friend's new toy) — the "event" is watching a crowd gather, not touching an object |
| **Sound/aftermath** | Hero reacts to a sound or its physical aftermath | SIT139 (broke something) — there's a crash, then evidence, before any "investigation" |
| **Recognition-in-speech** | Hero hears/sees their own idea presented by someone else | SIT154 (friend copies idea) — this is fundamentally a listening/recognition moment, not an object-investigation moment at all |

This alone breaks the crouch → look → pause → Wait → connect skeleton for 4 of the 5 stories, because 4 of the 5 situations don't actually involve physically handling a found object at all — only SIT148 genuinely does. T22's *name* ("The Reframe Trail," object-focused) has been forcing all 5 into an object-discovery shape regardless of what the situation actually is. That's worth flagging as a possible Form/Template *selection* issue, separate from prose — noted, not solved here, since it's outside "realization layer" scope.

---

## 5. Five rewritten T22 event chains (for approval — prose sketch, not final copy)

Each uses `narrativeSummary` as primary grounding, a distinct mechanism, and keeps the same six structural beat labels (NOTICE / INVESTIGATE / DISCOVER / CONNECTED_DISCOVERY / NEW_CHOICE / RESOLUTION) so the Phase 7 structure stays untouched.

### SIT045 — Lost a favourite toy or comfort blanket
*Mechanism: absence noticed*
- **NOTICE**: Bedtime is close. Arin reaches for the blanket on the pillow — and it isn't there. *(sourceField: narrativeSummary)*
- **INVESTIGATE**: Arin checks under the bed, behind the door, in the laundry basket — nothing. *(sourceField: narrativeSummary, extended physically)*
- **DISCOVER**: Nobody in the house has seen it either. *(sourceField: immediateObstacle)*
- **CONNECTED_DISCOVERY**: Arin realizes the panic isn't really about the blanket being *gone* — it's about needing to feel safe *right now*, tonight, whether or not it's found. *(sourceField: emotionalTension, reframed toward trueBelief)*
- **NEW_CHOICE**: Arin decides to get ready for bed anyway, blanket or not.
- **RESOLUTION**: Arin finds the blanket eventually (fallen behind the toy chest) — but notices falling asleep would have been okay either way.

### SIT083 — Friend got a new toy
*Mechanism: social observation, not object handling*
- **NOTICE**: The new toy comes out of a friend's bag at school, and a circle of kids forms around it. Gauri stays at the edge. *(sourceField: narrativeSummary)*
- **INVESTIGATE**: Gauri glances down at their own bag, at their own things, and for a second none of it looks as good. *(sourceField: narrativeSummary)*
- **DISCOVER**: Gauri notices this happens every time someone else has something new — the comparing, not the toy, is the actual pattern. *(sourceField: emotionalTension)*
- **CONNECTED_DISCOVERY**: The friend isn't showing off *at* Gauri — they're just excited, the way Gauri gets excited about things too.
- **NEW_CHOICE**: Gauri walks over and asks a real question about the toy instead of standing at the edge of the circle.
- **RESOLUTION**: The friend lets Gauri try it. Gauri still likes their own things just as much afterward.

### SIT139 — Broke something by mistake and hid it
*Mechanism: sound/aftermath, not investigation*
- **NOTICE**: A crash. Kavi freezes, then looks at the broken pieces on the floor. *(sourceField: narrativeSummary)*
- **INVESTIGATE**: Kavi sweeps the pieces out of sight before anyone comes to look. *(sourceField: narrativeSummary — the actual described action)*
- **DISCOVER**: Hiding it doesn't make the worry go away — it just moves the worry to "when will someone find out." *(sourceField: emotionalTension)*
- **CONNECTED_DISCOVERY**: Kavi realizes the broken thing itself was never the real problem — it's whether Kavi tells the truth about it.
- **NEW_CHOICE**: Kavi goes and tells a parent what happened, before being asked.
- **RESOLUTION**: The parent is more relieved that Kavi told the truth than upset about the broken object.

### SIT148 — Found something and doesn't know whether to keep it
*Mechanism: physical discovery (the one situation where object-handling genuinely fits)*
- **NOTICE**: Ved spots something near the park bench and picks it up. *(sourceField: narrativeSummary — closest to original T22 shape, and correctly so)*
- **INVESTIGATE**: Nobody around seems to be looking for it. Ved turns it over, wondering who it belongs to. *(sourceField: narrativeSummary)*
- **DISCOVER**: Ved catches themselves already imagining keeping it — and immediately pictures how the owner must feel right now. *(sourceField: emotionalTension)*
- **CONNECTED_DISCOVERY**: This object isn't just found — someone, right now, is retracing their steps looking for exactly this.
- **NEW_CHOICE**: Ved brings it to the park's lost-and-found bench instead of taking it home.
- **RESOLUTION**: A week later, Ved sees a "FOUND" flyer come down from the noticeboard — someone got it back.

### SIT154 — Friend copies their work or idea
*Mechanism: recognition-in-speech, not object investigation*
- **NOTICE**: The friend presents their project to the class — and it's almost exactly the idea Vani described to them last week. *(sourceField: narrativeSummary)*
- **INVESTIGATE**: Vani sits with the specific, uncomfortable feeling of hearing your own words come out of someone else's mouth. *(sourceField: emotionalTension)*
- **DISCOVER**: The friend doesn't seem to realize it's the same idea at all — genuinely, not slyly.
- **CONNECTED_DISCOVERY**: Being copied isn't the same as being erased — Vani still had the idea first, and still has more ideas.
- **NEW_CHOICE**: Vani tells the friend directly: "That was actually my idea — I'd been excited about it too."
- **RESOLUTION**: The friend is surprised, then credits Vani in front of the class. Vani starts a new idea that afternoon, already thinking ahead.

---

## 6. Acceptance test (per your instruction)

- ✅ **Faithful to actual situation**: every NOTICE beat above is either lifted or directly adapted from that situation's own `narrativeSummary`/`emotionalTension` — none borrow another situation's premise.
- ✅ **Concrete, child-visible events**: a crash and sweeping up pieces; a circle of kids around a toy; checking under a bed; a "FOUND" flyer; hearing your own idea presented aloud. All picturable actions, not label restatements.
- ✅ **Recognizably different from each other**: different mechanism per story (absence / social-watching / sound-aftermath / physical-discovery / recognition-in-speech), different opening image, different NEW_CHOICE action, different RESOLUTION image. Removing the hero names, these do not read as the same template.
- **Signature-sequence check**: "crouched down and picked it up" now appears in exactly one of the five (SIT148, where it's actually true to the situation) instead of all five. "Took one slow breath and said 'Wait'" does not appear literally in any of the five above — the realization moment is dramatized differently per mechanism instead of announced through one fixed ritual phrase.

---

## 7. What implementing this requires (not done yet)

1. Add `narrativeSummary` (raw, unprocessed) to `ctx` in `buildEventPlannerContext`.
2. Replace `concreteSceneFacts()`'s two-fact model with a richer extraction that treats `narrativeSummary` as the primary scene source and falls back to `immediateObstacle`/`emotionalTension` only where `narrativeSummary` is absent (12 of 168 situations) or insufficient.
3. Replace T22's single hardcoded beat-shape function with mechanism selection: pick one of the 5 mechanisms above per situation (deterministic, based on situation content — e.g. does `narrativeSummary` describe an absence vs. a social scene vs. a sound event — not random), then generate beats using that mechanism's shape.
4. Every generated sentence must carry a `sourceField` so a reviewer (human or automated) can audit whether it's grounded or a `NONE_AVAILABLE` honest fallback.
5. Re-run the automated corpus and expect some QA gates (`QA-003`, `QA-009` — the ones hardcoded to "one slow breath"/"wait") to need genuine reconsideration this time, not another word-list patch, since the realization moment itself is no longer one fixed ritual phrase across every story. I'll flag exactly which gates break and why, rather than silently rewording around them.

**I have not written any of this code.** Waiting for your read of §5 and approval of the schema in §3 before implementing.
