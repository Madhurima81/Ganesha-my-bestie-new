# T16 Realization Contract — Proposal (research + design only, no code)

**Status:** For approval. Per instruction: audit → mechanism families → 5-situation contract → read → only then implement.
**Scope:** T16 only. T22 stays frozen and untouched. Do not reuse T22's mechanism pattern — T16 is evidence → contradiction → self-reassessment about a belief, not an object-discovery/return arc.

---

## 1. Audit: what T16 situations actually look like

Read the real `storySeed`/`ontology` records for the 7 active T16 situations already in use (5 from the locked test corpus + 2 added later): SIT040, SIT064, SIT067, SIT077, SIT128, SIT060, SIT132.

| Situation | False belief | True belief | What's actually available as "evidence" |
|---|---|---|---|
| SIT040 — fear of trouble with teacher | Making mistakes makes me a bad child | Honesty and responsibility matter more than being perfect | A teacher's genuine reaction to the truth, once told |
| SIT064 — new glasses, feeling different | Looking different makes me less lovable | The things that make me different are part of who I am | A friend/family reaction to how Kavi actually looks |
| SIT067 — slower at reading | If I learn slowly, I'm not smart | Everyone learns at their own pace | Kavi's own unprompted retelling — proof Kavi generates themselves |
| SIT077 — "why can't you be more like—" | I have to be like someone else to be valued | My unique strengths make me valuable | Specific past moments Kavi already has, just not yet recalled |
| SIT128 — waiting for exam results | My marks decide my value | My effort and character matter more than any score | **None yet** — the result hasn't arrived. No external evidence is obtainable. |
| SIT060 — good intentions, bad outcome | Good intentions don't matter if I make mistakes | Honest intentions and taking responsibility both matter | The outcome of Kavi's own choice to take responsibility |
| SIT132 — lied to a parent | Hiding the truth will protect me | Honesty brings trust, even after mistakes | A physical, felt sensation (the "heavy stomach") — not a verbal or social signal at all |

**Key finding:** unlike T22 (where every situation has a physical thing to notice/investigate), T16 situations vary enormously in *what kind of evidence is even available*. SIT128 has literally no external evidence to gather — the exam result hasn't arrived. SIT132's evidence is a bodily sensation, not something anyone says or does. Forcing a single "gather evidence" shape onto all of these would repeat T22's original mistake in a new template.

---

## 2. Five mechanism families (from the actual data, not invented)

1. **SOCIAL_REACTION** — a trusted person's genuine, observed response directly contradicts the fear once the hero risks finding out. (SIT040: teacher's reaction to the truth; SIT064: a friend's actual reaction to the glasses.)
2. **SELF_TEST** — the hero deliberately creates their own proof, without being prompted. (SIT067: the unprompted retelling that proves comprehension — this is the exact mechanism already locked in the regression spec, `tmp_phase7f_template_finalization_and_e2e_test.md` Part 11 / HERO_DIRECT_TEST.)
3. **RETROSPECTIVE_RECALL** — no new event is needed at all; the hero remembers specific past instances that already contradict the belief. (SIT077: recalling concrete moments where being themselves — not being like the cousin — actually mattered.)
4. **SOMATIC_SIGNAL** — the evidence is a physical, felt sensation, not something said or done by anyone. (SIT132: the heavy stomach itself is the contradiction — carrying the lie feels worse than the fear of telling the truth.)
5. **INTERNAL_REASONING** — no evidence, old or new, is available to gather. The shift is the hero reasoning through what "value" or "worth" actually means, entirely without external proof. (SIT128: the result hasn't arrived — there is nothing to observe yet.)

SIT060 fits SOCIAL_REACTION with a twist (the evidence is the *outcome of the hero's own repair action*, observed after the fact) — noted as a variant, not a 6th family, since it's still fundamentally "someone/something reacts and that reaction is the evidence."

This directly answers the hard rule: none of these five are "notice an object, investigate it, connect two facts about it." All five are forms of **evidence → contradiction → self-reassessment**, just varying in *where the evidence comes from* (another person's reaction / a self-made test / memory / the body / pure reasoning).

---

## 3. Five representative situations for the contract (event-level sketches)

Same principle as T22: EVENT / INTERPRETATION_1 / EVIDENCE_GATHERING / INTERPRETATION_2 / RESOLUTION beats stay structurally fixed (Phase 7 locked); only how EVIDENCE_GATHERING and INTERPRETATION_2 are realized varies by mechanism. No belief text stated verbatim as dialogue/narration — demonstrated through what the hero notices, does, or remembers.

### SIT040 — SOCIAL_REACTION
- **EVENT**: Kavi looks at the mess on the desk. Nobody's noticed yet.
- **INTERPRETATION_1**: Kavi almost pockets it — quietly fixing it before anyone sees, because getting caught would mean being "that kid who messes up."
- **EVIDENCE_GATHERING**: Kavi tells the teacher what happened instead of hiding it. The teacher's response isn't anger — just a nod, and "thanks for telling me, let's fix it."
- **INTERPRETATION_2**: The mistake didn't make Kavi anything. Telling the truth is what the teacher actually noticed.
- **RESOLUTION**: Kavi cleans it up alongside the teacher, already moving on.

### SIT067 — SELF_TEST
- **EVENT**: Around Kavi, pencils are already going down. Kavi is still on the same page.
- **INTERPRETATION_1**: Everyone else finishing first must mean Kavi isn't smart enough to keep up.
- **EVIDENCE_GATHERING**: Unprompted, Kavi closes the book and retells the whole chapter out loud, from memory — surprising even Kavi. Two of the fast-finishers get asked the same question and have to flip back to check.
- **INTERPRETATION_2**: Finishing first was never the same as understanding it best.
- **RESOLUTION**: Kavi goes back to the page, working at their own pace, unbothered by who's already done.

### SIT077 — RETROSPECTIVE_RECALL
- **EVENT**: "Why can't you be more like—" The sentence lands heavily.
- **INTERPRETATION_1**: Kavi starts measuring themselves against the cousin, coming up short.
- **EVIDENCE_GATHERING**: Kavi doesn't go looking for anything new — a specific memory just surfaces on its own: the time Kavi fixed the wobbly shelf everyone else had given up on, using a method nobody else would have thought to try.
- **INTERPRETATION_2**: That moment didn't happen because Kavi was like anyone else. It happened because Kavi wasn't.
- **RESOLUTION**: Kavi answers the comparison honestly instead of shrinking from it: "I'm not like them. I'm good at different things."

### SIT128 — INTERNAL_REASONING
- **EVENT**: Kavi checks the school portal again. Nothing. Three more days.
- **INTERPRETATION_1**: The number, whatever it turns out to be, is about to say something true about Kavi.
- **EVIDENCE_GATHERING**: There is nothing to check, find, or test — the result doesn't exist yet. Kavi sits with that fact directly: whatever the number says in three days, Kavi already knows exactly how much effort went in this week, question by question.
- **INTERPRETATION_2**: The score was always going to arrive eventually and say a number. It was never going to be able to say anything about the effort that already happened.
- **RESOLUTION**: Kavi closes the portal and goes to do something else, the waiting no longer feeling like a verdict.

### SIT132 — SOMATIC_SIGNAL
- **EVENT**: Mama asks the question again. Kavi already gave an answer that wasn't true.
- **INTERPRETATION_1**: Kavi considers just repeating it — the lie is already out, one more time won't change anything.
- **EVIDENCE_GATHERING**: The heavy twist in Kavi's stomach gets worse, not better, at the thought of saying it again. Telling the truth is the only thing that's made the feeling let up at all, even for a second, when Kavi's tried it before.
- **INTERPRETATION_2**: Hiding it was supposed to make things feel safer. It hasn't, not once.
- **RESOLUTION**: Kavi tells Mama the real answer. The heavy feeling actually starts to lift.

---

## 4. What this deliberately avoids repeating from T22

- No "took one slow breath and said, 'Wait'" universal ritual — each EVIDENCE_GATHERING beat is a different kind of moment (a spoken confession, a spontaneous test, a surfacing memory, a bodily sensation, an absence of evidence).
- No belief text stated verbatim anywhere above.
- No single fixed ending shape — SIT040 ends mid-action (cleaning up together), SIT067 ends with a changed relationship to pace, SIT077 ends with a spoken line, SIT128 ends with the hero walking away from the source of the anxiety, SIT132 ends with relief following the truth.
- INTERPRETATION_2 in each case names what changed through the specific evidence just shown, not through an abstract "X was not what it looked like" formula.

---

## 5. What I have not done

No code. `detectT16RealizationMode`, per-mode beat generation, and compression rewrite are not implemented. Waiting for sign-off on the mechanism families (§2) and the five sketches (§3) before doing what T22 needed several iterations to get right: wiring this into `buildTemplateSpecificEventChain`, the `writeProseFromEventChain` wrapper, and the T16-specific compression clause, then running the automated corpus and reading the output the same way.
