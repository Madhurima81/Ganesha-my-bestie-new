# Phase 7B — Formal Story Plan Specification + Validation Rules, then 8-situation test

🔒 7A locked (F01–F05). 🔒 7B schema locked (Form-driven event container). This document adds the missing piece: **hard structural rules per Form**, so a generator can't satisfy the letter of the event-type labels while producing weak events — then tests the whole thing on 8 real situations spanning all 5 Forms and different primary emotion groups.

---

## Phase 7B Specification — hard structural rules per Form

Labels alone (`EVENT 1 [ATTEMPT]`) are necessary but not sufficient. Each Form gets rules that check the *substance* behind the label.

### F01 — The Journey of Trying
1. **≥3 attempts**, or 2 attempts minimum only if the situation's own severity is low (regulation/everyday-friction situations may run shorter).
2. Each `ATTEMPT` must differ from every prior attempt **in strategy, not just wording** — same action described differently fails this rule.
3. Each `CONSEQUENCE` must state a **distinct reason** the attempt fell short — "it didn't work" repeated twice fails this rule.
4. `TURNING POINT` must be a **reframe of approach** ("doing it differently" / "I don't have to be perfect"), never a moral statement.
5. Final attempt must **resolve the emotional problem**, not just stop the event sequence.

### F02 — The Discovery Journey
1. No obstacle or antagonist may drive the plot. If one appears, the Form has failed.
2. Each `DISCOVER` beat must add **information the previous beat didn't have** — a second "and then they saw X" with no new information fails this rule.
3. The final discovery must **reframe the opening NOTICE** — it must recontextualize something shown at the start, not just add a new fact.
4. Per the locked rule: **payoff must be about the discovered thing itself.** If the ending payoff is "and that's why the relationship is fine now," this is actually F04 wearing F02's labels — fail.

### F03 — The Shift in Seeing
1. `OPENING STATE` must state an explicit **belief**, not just a mood.
2. Must include at least one `EVIDENCE` beat that genuinely appears to **confirm** the belief before any contradiction — skipping straight to the reveal fails this rule.
3. The `CONTRADICTION` must **not resolve instantly** — some uncertainty must sit unresolved for at least one beat before the turning point.
4. `TURNING POINT` must be an **internally felt realization**, never delivered as another character's spoken lesson.
5. `RESOLUTION` must be **shown through action**, not narrated as "Kavi learned that..."

### F04 — The Connection Journey
1. Must establish **two characters with distinct, stated wants** at the open — one active hero and one passive prop fails this rule.
2. `INITIAL_RESPONSE` must be based on an **assumption or misreading** of the other character — if Kavi's first response is already correct, there's no arc.
3. `REVEAL` must expose something **about the other character** Kavi didn't know — a reveal about an object or fact (not a person) means this has drifted into F02.
4. `CHANGED_RESPONSE` must be a **concrete action**, not just an internal feeling.
5. `RESOLUTION` must be **demonstrated relationally** — an action between the two characters, not a solo realization.

### F05 — The Unexpected Turn
1. `OPENING STATE` must state an explicit **plan or expectation**.
2. Requires **≥2 disruptions that differ in kind** — two versions of the same disruption fails this rule.
3. Must include a genuine `RESTORE_ATTEMPT` that **actually fails** — skipping straight to acceptance fails this rule.
4. Each disruption must be **plausibly connected** to the situation's own domain — an arbitrary/unrelated disruption inserted for excitement fails this rule (this is the anti-"random chaos" check from the 7A spec).
5. The adaptation must produce an outcome **materially different** from the original plan — a "turns out the plan happened anyway" ending fails this rule.

### Cross-Form acceptance test (qualitative, applied to every plan below)
> **Does the Story Plan make you want to read the next event?**
Proxy checks: does each event raise a question the next event answers; does the turning point feel earned rather than arriving on schedule; would removing any single event leave a noticeable gap.

---

## Test: 8 situations, one Form each, spanning all 5 Forms and multiple primary emotion groups

### 1. SIT021 — Darkness or shadows in the room — **F01 Trying** (Worried/Scared)
```
STORY PURPOSE: Can Kavi get across the dark room without the fear winning?
OPENING STATE: Kavi needs to cross a dark room to get something on the other side.
HERO WANT: Reach the object.

EVENT 1 [ATTEMPT]     — Kavi tries walking straight across at normal speed, eyes on the goal.
EVENT 2 [CONSEQUENCE] — Halfway across, a shadow shifts (curtain in the breeze) and Kavi freezes, retreats to the doorway.
EVENT 3 [ATTEMPT]     — Kavi tries again with the hallway light on behind them, throwing more light in.
EVENT 4 [CONSEQUENCE] — Better, but the far corner is still solid dark — Kavi stalls at the edge of the light.
EVENT 5 [ATTEMPT]     — Kavi tries naming what's actually in the room out loud, out toward the dark, as they move.
EVENT 6 [CONSEQUENCE] — Naming the shelf, the chair, the toy box as they pass each one turns the dark shapes back into known objects.

TURNING POINT: "It's not that I need the room to not be dark — I need to remember what's actually in it."
NEW CHOICE / ACTION: Kavi keeps naming things instead of trying to out-walk the fear.
RESOLUTION: Kavi reaches the object, dark room and all — the room itself never changed, Kavi's approach to it did.
```
**Validation:** 3 distinct attempts (speed → light → naming) ✓ | 3 distinct consequence reasons (startled/dark corner/none — resolved) ✓ | turning point is reframe not moral ✓ | resolution is emotional resolve, not just arrival ✓. **Pass.**
**Read-on test:** each failed attempt suggests a specific next fix rather than just "try harder" — yes, wants next event.

---

### 2. SIT007 — Someone breaks their Lego or drawing — **F01 Trying** (Angry/Frustrated)
```
STORY PURPOSE: Can Kavi save something of what was lost, even if it can't be exactly rebuilt?
OPENING STATE: Kavi's finished creation has just been knocked apart.
HERO WANT: Get it back exactly as it was.

EVENT 1 [ATTEMPT]     — Kavi tries rebuilding from memory, piece by piece, the same way.
EVENT 2 [CONSEQUENCE] — Two pieces are missing entirely (rolled under the shelf) — it can't be identical.
EVENT 3 [ATTEMPT]     — Kavi searches for the exact missing pieces first before continuing.
EVENT 4 [CONSEQUENCE] — Finds one, not the other — still stuck, still not "the same."
EVENT 5 [ATTEMPT]     — Kavi tries swapping in a different piece that's close but not identical, just to see.
EVENT 6 [CONSEQUENCE] — It actually looks kind of good — different, but its own thing.

TURNING POINT: "It doesn't have to be the exact same to still be mine."
NEW CHOICE / ACTION: Kavi finishes the rebuild with the substitute piece on purpose, not as a compromise.
RESOLUTION: The new version sits on the shelf next to where the old one would have been — not a copy, a sequel.
```
**Validation:** 3 distinct attempt strategies (rebuild-identical → search-first → substitute) ✓, distinct consequences ✓, turning point is reframe ✓. **Pass.**
**Read-on test:** yes — "will they find the piece" then "will the substitute actually work" both genuinely open questions.

---

### 3. SIT051 — Close friend moved to another city — **F03 Shift in Seeing** (Sad/Missing)
```
STORY PURPOSE: Does distance actually end a friendship, or just change its shape?
OPENING STATE: Kavi believes that if you can't see someone every day, the friendship is basically over.
HERO WANT: Keep the friendship exactly as it was.

EVENT 1 [EVIDENCE]           — The first week after the move, no messages come. The belief seems confirmed.
EVENT 2 [CONTRADICTION]      — A message finally arrives — not an apology for the silence, but a photo of something that made the friend think of Kavi immediately.
EVENT 3 [OTHER_PERSPECTIVE]  — Kavi realizes the friend has been building a new routine too, and it doesn't erase the old one — it's just slower now.
EVENT 4 [BELIEF_UNCERTAIN]   — Kavi sits with not being sure anymore whether "less often" really means "less real."
EVENT 5 [REVEALING MOMENT]   — Kavi finds an old photo together and realizes the friendship doesn't live in the daily-ness — it lives in moments like this one, which still exist.

TURNING POINT: "Maybe a friendship doesn't need to happen every day to still be real."
NEW CHOICE / ACTION: Kavi sends something back — not an urgent message, just something ordinary, the way they used to.
RESOLUTION: A slower rhythm of messages starts — different, still real.
```
**Validation:** explicit belief stated at open ✓ | evidence-that-confirms present before contradiction ✓ | contradiction doesn't resolve instantly — event 4 sits in uncertainty ✓ | turning point felt, not spoken by another character ✓ | resolution shown via action (sending something) not narrated ✓. **Pass.**
**Read-on test:** yes — the silence in event 1 creates real tension; whether the photo means anything is a genuine open question.

---

### 4. SIT061 — Made a mistake in front of the class — **F03 Shift in Seeing** (Shy/Embarrassed)
```
STORY PURPOSE: Does one wrong answer actually prove Kavi isn't capable?
OPENING STATE: Kavi believes a public mistake means everyone now thinks less of them.
HERO WANT: Make the mistake disappear, or at least stop everyone from noticing it.

EVENT 1 [EVIDENCE]          — A classmate snickers right after the wrong answer — seems to confirm the fear immediately.
EVENT 2 [CONTRADICTION]     — Minutes later, that same classmate gets an answer wrong too, and nobody reacts the way Kavi feared they would to their own mistake.
EVENT 3 [OTHER_PERSPECTIVE] — Kavi notices the teacher moved on just as quickly for both — the mistake wasn't the big moment Kavi thought it was.
EVENT 4 [BELIEF_UNCERTAIN]  — Kavi isn't sure anymore whether the class actually remembers, or whether it was only Kavi still replaying it.
EVENT 5 [REVEALING MOMENT]  — At the end of class, a friend brings up something totally unrelated from earlier — proof nobody's mentally stuck on the mistake but Kavi.

TURNING POINT: "Maybe I was the only one still in that moment."
NEW CHOICE / ACTION: Kavi raises a hand again before the class ends, on a different question.
RESOLUTION: The answer this time is right — but it wouldn't have mattered either way; Kavi's already stopped waiting for the class's verdict.
```
**Validation:** belief stated ✓ | evidence-confirms (snicker) precedes contradiction ✓ | uncertainty sits for a beat (event 4) ✓ | turning point internal ✓ | resolution shown via the hand-raise action, not narrated ✓. **Pass.**
**Read-on test:** yes — "did anyone else notice/remember" is a real question the plan keeps answering incrementally.

---

### 5. SIT083 — Friend got a new toy — **F03 Shift in Seeing** (Left Out/Jealous)
```
STORY PURPOSE: Does the friend's new toy actually make Kavi's own things less good?
OPENING STATE: Kavi believes the newest, shiniest thing is automatically the best thing.
HERO WANT: Have the toy, or feel as excited as everyone else does about it.

EVENT 1 [EVIDENCE]          — Everyone crowds around the new toy; Kavi's own favourite toy, in comparison, suddenly looks boring.
EVENT 2 [CONTRADICTION]     — Ten minutes later, half the group has wandered off from the new toy already, bored of it.
EVENT 3 [OTHER_PERSPECTIVE] — Kavi notices the friend who owns it now anxiously guarding it, worried about it getting broken or lost — not actually enjoying it freely.
EVENT 4 [BELIEF_UNCERTAIN]  — Kavi isn't sure "newest" was ever the same as "most enjoyed."
EVENT 5 [REVEALING MOMENT]  — Kavi goes back to their own worn, familiar toy and realizes they never once worried about it getting damaged — they just play.

TURNING POINT: "The new thing isn't more fun — it's just more fragile."
NEW CHOICE / ACTION: Kavi starts a game with the old, familiar toy instead of waiting for a turn with the new one.
RESOLUTION: Others drift over to join Kavi's game — the "boring" toy turns out to be where the actual fun is happening.
```
**Validation:** belief stated ✓ | evidence-confirms precedes contradiction ✓ | uncertainty sits (event 4) ✓ | turning point internal, specific, non-generic ✓ | resolution shown via action ✓. **Pass.**
**Read-on test:** yes — the friend's anxious guarding (event 3) is a genuine, specific surprise, not a generic "twist."

---

### 6. SIT099 — Noisy, overcrowded mall — **F05 Unexpected Turn** (Overwhelmed/Restless)
```
STORY PURPOSE: What does Kavi do when the fun outing stops feeling fun?
OPENING STATE: Kavi expects today's mall trip to be exciting — new sights, maybe a treat.
HERO WANT: Enjoy the outing the way it was supposed to go.

EVENT 1 [EXPECTATION]      — Kavi walks in eager, ready for the planned fun.
EVENT 2 [DISRUPTION]       — The noise and crowd are much more than expected — music, voices, a trolley clattering, all at once.
EVENT 3 [REACTION]         — Kavi tries to push through it and keep to the original plan (the toy shop first, like always).
EVENT 4 [DISRUPTION]       — A sudden loud announcement over the speakers makes everything worse, unrelated to the crowd itself — a second, different kind of overload.
EVENT 5 [RESTORE_ATTEMPT]  — Kavi tries covering their ears and pushing on toward the toy shop anyway, determined to stick to the plan.
EVENT 6 [RESTORE_FAILS]    — It doesn't work — the plan-as-designed just isn't survivable in this much noise.

TURNING POINT: Kavi stops trying to push through and asks to find a quieter spot instead — not a failure, a different plan.
NEW CHOICE / ACTION: They find a quiet corner café instead of the toy shop.
RESOLUTION: The outing doesn't end the way it was supposed to — it ends with a calm ten minutes that turns out to be the actual best part of the day.
```
**Validation:** explicit plan stated ✓ | 2 disruptions of different kinds (ambient crowd noise vs sudden announcement) ✓ | genuine restore-attempt that fails (event 5→6) ✓ | disruptions plausibly connected to a mall/crowd domain, not arbitrary ✓ | ending materially different from the plan (café, not toy shop) ✓. **Pass.**
**Read-on test:** yes — whether Kavi can push through is a real question, and its failure isn't foregone.

---

### 7. SIT148 — Found something and doesn't know whether to keep it — **F02 Discovery** (Unsure/Difficult Choice)
```
STORY PURPOSE: What is this thing, and who does it actually belong to?
OPENING STATE: Kavi finds something valuable near a park bench, nobody else around.
HERO WANT: Figure out what to do with it.

EVENT 1 [NOTICE]              — Kavi spots it half-hidden under the bench and picks it up.
EVENT 2 [INVESTIGATE]         — Turning it over, Kavi notices a small detail — initials scratched into it, or a faded name tag.
EVENT 3 [DISCOVER]            — Kavi realizes the initials match someone from the same park who comes most afternoons.
EVENT 4 [CONNECTED_DISCOVERY] — Kavi remembers seeing that same person searching the ground here yesterday, looking for something.

TURNING POINT: The object isn't just "a found thing" anymore — it's very specifically someone's search finally answered.
NEW CHOICE / ACTION: Kavi waits at the bench the next afternoon to return it in person.
RESOLUTION: The owner's relief when they get it back tells Kavi more than any rule about "finders keepers" ever could.
```
**Validation:** no obstacle/antagonist drives this — pure discovery chain ✓ | each DISCOVER beat adds new information (initials → whose initials → they were searching) — no repetition ✓ | final discovery reframes the opening NOTICE (a "found thing" becomes "someone's answered search") ✓ | payoff is about the object/mystery, not a relationship being repaired — the return is a consequence of solving the mystery, not the plot's engine ✓. **Pass**, though flagged as the closest call — a lazier draft could easily have let step 4→resolution become "and now Kavi and the owner are friends," which would drift toward F04. Kept the payoff on the discovery itself.
**Read-on test:** yes — each investigate beat answers exactly what the previous one raised.

---

### 8. SIT165 — Friend is nervous before a performance — **F04 Connection** (Friendship, Worried/Nervous)
```
STORY PURPOSE: Can Kavi actually help, or just feel like they're helping?
OPENING STATE: Kavi's friend is minutes from performing and visibly panicking.
HERO WANT: Kavi wants the friend to feel brave enough to go on. The friend wants the fear to just stop.

EVENT 1 [ENCOUNTER]         — Kavi finds the friend backstage, hands shaking.
EVENT 2 [INITIAL_RESPONSE]  — Kavi says the obvious thing — "you'll be great, don't worry" — assuming reassurance is what's needed.
EVENT 3 [REVEAL]            — It doesn't land; the friend admits it's not about being good, it's the fear of forgetting everything the second they're on stage.
EVENT 4 [DEEPER_NOTICE]     — Kavi realizes the friend doesn't need confidence talk — they need a way to not go blank.
EVENT 5 [CHANGED_RESPONSE]  — Kavi quickly runs through the first line with them, just the first line, over and over — something concrete to hold onto.

TURNING POINT: Kavi understood what the fear actually was, not what Kavi assumed it was.
NEW CHOICE / ACTION: The friend walks on gripping just that one first line, not a whole speech about bravery.
RESOLUTION: They get through it — not fearless, just holding onto the one thing Kavi actually gave them.
```
**Validation:** two characters with distinct, stated wants (Kavi wants friend brave; friend wants the fear to stop) ✓ | initial response is a misreading (generic reassurance, not what's needed) ✓ | reveal is about the OTHER character's specific fear, not an object/fact ✓ | changed response is concrete action (rehearsing the line) ✓ | resolution demonstrated relationally, through the given line, not a solo realization ✓. **Pass.**
**Read-on test:** yes — "what does the friend actually need" is a real question the plan answers specifically, not generically.

---

## Overall result

**8/8 pass their Form's hard structural rules.** All 5 Forms exercised (F01×2, F03×3, F04×1, F05×1, F02×1), across 6 different primary emotion groups (Scared, Angry/Frustrated, Sad, Embarrassed, Jealous, Overwhelmed, Unsure, Nervous). Every plan clears the qualitative "want to read the next event" test — each event raises a specific question the next event answers, not a generic one.

**One structural finding worth flagging**, not a failure: SIT148 (F02) was the plan most at risk of quietly becoming F04 — a lazy draft would let "returning it" become a friendship beat instead of a discovery payoff. This confirms the same F02/F04 boundary risk already found and locked in the earlier stress test — it shows up again here, on a genuinely different situation, which is further evidence it's a real, recurring seam in the system rather than a one-off.

Recommend: **Phase 7B specification (schema + hard structural rules) is ready to lock.** Next per your sequence — only after this — bring T01–T20 back in.
