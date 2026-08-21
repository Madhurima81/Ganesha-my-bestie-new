# T21 Realization Contract — Proposal (research + design only, no code)

**Status:** For approval. Same process as T16: audit → mechanism families → 5-situation contract → read → only then implement.
**Scope:** T21 only. T16 and T22 stay frozen and untouched. Do not reuse T16's belief-reassessment mechanisms or T22's object-discovery mechanisms — deriving T21's own mechanisms from what its actual situations look like.

---

## 1. Audit: what T21 situations actually look like

Read the real `storySeed`/`ontology` records for the 6 active T21 situations already in the locked test corpus: SIT006, SIT111, SIT118, SIT120, SIT164, SIT157.

| Situation | False belief | True belief | What kind of "disruption" is this, really? |
|---|---|---|---|
| SIT006 — playdate cancelled | Plans must happen my way | I can adapt and still enjoy life | A concrete plan, cancelled outright by another person. Nothing of the original survives. |
| SIT111 — scratchy uniform/flickering light | I can't cope when things feel uncomfortable | I can care for myself and ask for help when needed | Not a single cancelling event at all — an ongoing, chronic sensory irritant eroding an ongoing effort (staying focused). |
| SIT118 — starting a new school | Nobody will accept me | I can create new friendships by being myself | There is no prior plan to disrupt. Hero has nothing established yet — this is orientation from zero, not restoration. |
| SIT120 — routine class cancelled | Everything has to happen the way I expected | I can adapt and discover new possibilities | Same shape as SIT006 (external cancellation), but a recurring routine cancelled by an authority figure, not a peer. |
| SIT164 — younger child wants to join the game | Younger children will spoil our fun | Everyone deserves a chance to belong | The "disruption" is a person's request, not an event. Tension is inclusion vs. protecting the plan — the resolution *expands* the plan rather than replacing it. |
| SIT157 — rumours spread about them | I have to prove myself to everyone | Truth and character matter more than rumours | Barely a "plan" at all — the disruption is reputational/social. "Restoring" here means trying to control what others think, which is exactly what has to be let go of. |

**Key finding:** T21's situations are far more heterogeneous than T16's or T22's. T21's structural beats (EXPECTATION → DISRUPTION_1 → REACTION → DISRUPTION_2 → RESTORE_ATTEMPT → RESTORE_FAILS → ADAPTATION_RESOLUTION) currently assume a single shape: a concrete plan gets cancelled by circumstance, hero tries to force it back into place, fails, then adapts. That shape genuinely fits only SIT006/SIT120. SIT111 has no plan being "restored" — it's chronic interference. SIT118 has no original plan to restore at all. SIT164's disruption is a person's request, not a circumstance. SIT157's "restore attempt" would naturally be trying to control others' opinions — which is itself the false belief, not a neutral restoration effort.

---

## 2. Five mechanism families (from the actual data)

1. **EXTERNAL_CANCELLATION** (SIT006, SIT120) — a concrete plan existed; something/someone external cancels it outright; nothing of the original plan survives; adaptation means building something new from scratch, not modifying the old plan.
2. **PERSISTENT_INTERFERENCE** (SIT111) — not a single cancelling event but an ongoing, chronic irritant that keeps eroding an ongoing effort. "Restoring the plan" here means trying to push through/ignore it, which keeps failing not because the plan was wrong but because self-care was never part of it. Adaptation = asking for help/accommodation, not a "new plan."
3. **UNFAMILIAR_TERRITORY** (SIT118) — no established plan or routine exists yet at all. The "disruption" is the unfamiliarity itself. "Restore attempt" doesn't mean returning to an old plan (there isn't one) — it means trying to fake competence/fit in the old way (e.g. pretending to already know), which fails because there's nothing to fake yet. Adaptation = orienting through honest initiative (asking, observing) instead.
4. **INCLUSION_REQUEST** (SIT164) — the disruption is a specific person's request to join, not a circumstance. The tension is protecting the existing plan vs. including someone new. "Restore attempt" = trying to keep the game exactly as planned (ignoring or deflecting the request); adaptation = expanding the plan to include them, which turns out to work rather than ruin it.
5. **SOCIAL_THREAT_MANAGEMENT** (SIT157) — the disruption is reputational: people are already talking. "Restore attempt" = trying to control what others say/think (confronting, defending, over-explaining); this fails because you cannot control other people's talk. Adaptation = anchoring in one's own consistent behavior/character instead of chasing everyone's opinion.

This directly follows the hard rule: none of these five reuse T16's evidence-based belief reassessment or T22's object-discovery pattern. All five are genuinely about **a plan meeting an obstacle it cannot be forced back into its original shape against, and the hero finding a different way through** — but the *kind* of obstacle and the *kind* of adaptation differ meaningfully (external event / chronic condition / total unfamiliarity / a person's request / social perception).

---

## 3. Five representative situations for the contract (event-level sketches)

Beats stay structurally fixed: EXPECTATION / DISRUPTION_1 / REACTION / DISRUPTION_2 / RESTORE_ATTEMPT / RESTORE_FAILS / ADAPTATION_RESOLUTION (Phase 7 locked, unchanged). Only how DISRUPTION_1/2 and RESTORE_ATTEMPT/FAILS are realized varies by mechanism. No belief text stated verbatim as narrator explanation — demonstrated through what the hero does, learned from this session's T16 pass.

### SIT006 — EXTERNAL_CANCELLATION
- **EXPECTATION**: Kavi has everything ready for the playdate — the whole afternoon already shaped around it.
- **DISRUPTION_1**: The news arrives: the friend isn't coming.
- **REACTION**: Kavi checks the clock anyway, like the friend might still show up.
- **DISRUPTION_2**: No one else is free either — this isn't a schedule mix-up to fix, it's just off.
- **RESTORE_ATTEMPT**: Kavi tries to recreate the same afternoon solo, the exact same games, just alone — and it falls flat immediately.
- **RESTORE_FAILS**: The games needed two people. Playing them alone isn't playing them at all.
- **ADAPTATION_RESOLUTION**: Kavi picks something that was never part of the original plan — something solo actually works for — and the afternoon turns out fine, just different.

### SIT111 — PERSISTENT_INTERFERENCE
- **EXPECTATION**: Kavi plans to get through the lesson the ordinary way, same as always.
- **DISRUPTION_1**: The collar scratches again.
- **REACTION**: Kavi tugs at it under the desk and tries to focus harder, willing it to fade into the background.
- **DISRUPTION_2**: The light starts flickering too — a second, different kind of irritation stacking on the first.
- **RESTORE_ATTEMPT**: Kavi grits through it, same as every other day, trying to look and feel like nothing's wrong.
- **RESTORE_FAILS**: By the end of the lesson Kavi hasn't heard a word — gritting through it took all the attention that should have gone to the lesson.
- **ADAPTATION_RESOLUTION**: Kavi asks the teacher if the collar can be loosened and for a seat further from the flickering light — and actually hears the next lesson.

### SIT118 — UNFAMILIAR_TERRITORY
- **EXPECTATION**: Kavi plans to find the way around the same way as at the last school — quietly figure it out alone rather than ask.
- **DISRUPTION_1**: Everyone else already knows exactly where to go. Kavi doesn't.
- **REACTION**: Kavi trails a step behind the crowd, watching for clues instead of asking anyone directly.
- **DISRUPTION_2**: The crowd splits three ways at a junction, and the trailing-along trick stops working entirely.
- **RESTORE_ATTEMPT**: Kavi picks a direction and walks confidently, hoping it looks like Kavi already knew.
- **RESTORE_FAILS**: It's the wrong hallway. Kavi ends up outside the wrong classroom, now late.
- **ADAPTATION_RESOLUTION**: Kavi asks the next person walking past — a real question, out loud — and gets pointed the right way in five seconds.

### SIT164 — INCLUSION_REQUEST
- **EXPECTATION**: Kavi and friends are deep in a game that's finally going well, exactly as planned.
- **DISRUPTION_1**: A smaller voice asks, "Can I play too?"
- **REACTION**: Kavi looks at the others. Nobody answers. The game keeps going like the question didn't happen.
- **DISRUPTION_2**: The younger child doesn't leave — just stands there, still watching, still hoping.
- **RESTORE_ATTEMPT**: Kavi tries to keep playing the exact same way, pretending not to notice.
- **RESTORE_FAILS**: The fun has gone thin — everyone's a little too aware of the kid standing at the edge for the game to feel the same.
- **ADAPTATION_RESOLUTION**: Kavi waves the younger child in and finds them an easy role in the game — and it turns out to be more fun with one more player, not less.

### SIT157 — SOCIAL_THREAT_MANAGEMENT
- **EXPECTATION**: Kavi walks toward the group planning to just have a normal day.
- **DISRUPTION_1**: The conversation goes quiet the second Kavi gets close.
- **REACTION**: Kavi pretends not to notice and sits down like nothing happened.
- **DISRUPTION_2**: Someone whispers to another kid, eyes flicking toward Kavi — the rumour is already moving without Kavi in the room.
- **RESTORE_ATTEMPT**: Kavi corners the loudest talker and tries to argue the rumour down, point by point.
- **RESTORE_FAILS**: Arguing it just makes it a bigger story — now more people are talking, not fewer.
- **ADAPTATION_RESOLUTION**: Kavi stops chasing the conversation and just keeps showing up the same way — same as always, whether anyone's watching or not. *(Corrected per review: the original draft claimed the rumour eventually died down, an external outcome Kavi can't know or control. The resolution is Kavi's own consistent behavior, not what other people end up doing.)*

---

## 4. What this deliberately avoids repeating

- No evidence-based belief reassessment (that's T16's job) and no object/discovery pattern (that's T22's job) — every DISRUPTION/RESTORE beat above is a plan meeting an obstacle it can't be forced back into shape, which is T21's own specific shape.
- Five genuinely different *kinds* of disruption (a cancelled external plan / a chronic condition / total unfamiliarity / a person's request / a rumour), not one shape with synonym swaps.
- No belief text stated as narrator explanation in any of the sketches above — ADAPTATION_RESOLUTION is shown entirely through the new action and its (different) outcome.
- No universal "took one slow breath and said 'Wait'" ritual, and no fixed "warmer/freer" ending vocabulary — learned directly from the T16 pass.

## 5. What I have not done

No code. `detectT21RealizationMode`, per-mode beat generation, and compression rewrite are not implemented. Waiting for sign-off on the mechanism families (§2) and the five sketches (§3) before implementing and running the same automated-corpus + blind-read cycle as T16.
