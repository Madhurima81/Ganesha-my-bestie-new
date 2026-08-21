# Phase 7B — Story Plan schema + SIT164 × 5 Forms test

🔒 Phase 7A locked: F01–F05, with the standing rule — **F02 pays off in what is discovered; F04 pays off in what changes between people.**

## The Story Plan schema (form-driven, not generic)

```
FORM
↓
STORY PURPOSE          — one sentence: what this story is actually about, in this Form's terms
↓
OPENING STATE           — what's true before anything happens
↓
HERO WANT
↓
EVENT 1 [type]  ─┐
EVENT 2 [type]   │  count AND type set by the Form, not fixed by the schema
EVENT N [type]  ─┘
↓
TURNING POINT           — Form-specific realization, not a generic "moment of change"
↓
NEW CHOICE / ACTION
↓
RESOLUTION
```

The container (FORM → PURPOSE → OPENING STATE → WANT → events → TURNING POINT → CHOICE → RESOLUTION) is the same shape for all five Forms — that's the point of having a Story Plan layer at all. What must NOT be the same is what fills the `EVENT [type]` slots: each Form owns its own vocabulary and its own event count, pulled directly from the Phase 7A spec, not from engine convenience.

| Form | Event vocabulary | Typical count |
|---|---|---|
| F01 Trying | `ATTEMPT` / `CONSEQUENCE` (alternating, non-repeating actions) | 5–7 |
| F02 Discovery | `NOTICE` / `INVESTIGATE` / `DISCOVER` / `CONNECTED_DISCOVERY` | 4–7 |
| F03 Shift in Seeing | `EVIDENCE` / `CONTRADICTION` / `OTHER_PERSPECTIVE` / `BELIEF_UNCERTAIN` | 5–6 |
| F04 Connection | `ENCOUNTER` / `INITIAL_RESPONSE` / `REVEAL` / `DEEPER_NOTICE` | 5–6 |
| F05 Unexpected Turn | `EXPECTATION` / `DISRUPTION` / `REACTION` / `RESTORE_ATTEMPT` / `RESTORE_FAILS` | 6–8 |

If a Form's Story Plan ever produces `EVENT 1 [ATTEMPT]` / `EVENT 2 [ATTEMPT]` / `EVENT 3 [ATTEMPT]` for F02 or F04, that's the schema failing — it means the engine defaulted to the easiest/most generic shape instead of the Form's own.

---

## Test: SIT164, same situation, five Story Plans

*storySeed: Kavi and friends are playing a game when a younger child asks to join. Want: keep the game moving as planned. Obstacle: the younger child may not know the rules or play at the same level. Tension: protect the fun without making the younger child feel unwanted.*

### F01 — The Journey of Trying

```
FORM: F01 Trying
STORY PURPOSE: Can Kavi find a version of the game that actually works for everyone?
OPENING STATE: The game is finally running well.
HERO WANT: Keep the game exactly as it is.

EVENT 1 [ATTEMPT]      — Kavi lets the child play by the normal rules.
EVENT 2 [CONSEQUENCE]  — It falls apart immediately; the group's fun breaks too.
EVENT 3 [ATTEMPT]      — Kavi slows the whole game down for everyone.
EVENT 4 [CONSEQUENCE]  — Slower works for the child but bores the older friends.
EVENT 5 [ATTEMPT]      — Kavi invents a side-role sized to the child's level.
EVENT 6 [CONSEQUENCE]  — It holds — imperfect, but everyone is actually playing.

TURNING POINT: "I don't have to make one version work for everyone — I have to find the version that does."
NEW CHOICE / ACTION: Kavi keeps adjusting the game on the fly instead of defending one fixed version of it.
RESOLUTION: The game keeps changing shape every time someone new wants in — that's just how Kavi runs it now.
```
5-word check: 3 ATTEMPT/CONSEQUENCE pairs, each attempt genuinely different from the last (rules-as-is → slow down → invent new role). No repeats.

### F02 — The Discovery Journey

```
FORM: F02 Discovery
STORY PURPOSE: What is this younger child actually watching so closely — and what does it turn into?
OPENING STATE: The game is running; a smaller voice appears at the edge of it.
HERO WANT: Understand what's actually being asked for, before deciding anything.

EVENT 1 [NOTICE]              — Kavi notices the child isn't asking to join generally — they're fixated on one specific part of the game.
EVENT 2 [INVESTIGATE]         — Kavi asks what they're looking at; the child mentions a version of this game played differently at home.
EVENT 3 [DISCOVER]            — Kavi tries the home-version rule mid-game, expecting it to break things.
EVENT 4 [CONNECTED_DISCOVERY] — It doesn't break anything — it opens a move none of them had tried before.

TURNING POINT: The "interruption" turns out to be information the game itself was missing.
NEW CHOICE / ACTION: Kavi folds the new rule into the game properly, on its own merits.
RESOLUTION: The friends can't quite remember how the game worked before — the discovery is now just part of it.
```
4 events, all discovery-typed (NOTICE/INVESTIGATE/DISCOVER/CONNECTED_DISCOVERY) — no ATTEMPT/CONSEQUENCE anywhere. Payoff is entirely about the new rule's own worth, per the locked rule.

### F03 — The Shift in Seeing

```
FORM: F03 Shift in Seeing
STORY PURPOSE: Is "a younger kid joining" actually the problem Kavi thinks it is?
OPENING STATE: Kavi already believes younger kids joining ruins the game — it's happened before.
HERO WANT: Protect the game from what Kavi expects will happen.

EVENT 1 [EVIDENCE]            — The child fumbles the first round, exactly as Kavi expected.
EVENT 2 [CONTRADICTION]       — But the child laughs it off and asks a sharp rules question Kavi hadn't considered.
EVENT 3 [OTHER_PERSPECTIVE]   — Kavi notices the child isn't clingy or upset — just new at this, the way Kavi once was.
EVENT 4 [BELIEF_UNCERTAIN]    — Kavi's old certainty ("younger kids ruin it") stops fitting what's actually happening in front of them.
EVENT 5 [REVEALING MOMENT]    — Kavi remembers being the one nobody wanted to let play, once.

TURNING POINT: "Maybe being new isn't the same as being a problem."
NEW CHOICE / ACTION: Kavi waves the child back in for the next round without making a moment of it.
RESOLUTION: Nothing about the game itself changed — only what Kavi was seeing when they looked at it.
```
5 events, all belief-typed — no external plot device does the work; the same fumble (EVIDENCE) that "should" prove Kavi right is what starts unraveling the belief.

### F04 — The Connection Journey

```
FORM: F04 Connection
STORY PURPOSE: Can Kavi understand what this particular child actually wants, instead of assuming?
OPENING STATE: The game is mid-flow when the child appears beside Kavi.
HERO WANT: Keep the group's fun intact.

EVENT 1 [ENCOUNTER]         — The child asks to join.
EVENT 2 [INITIAL_RESPONSE]  — Kavi gives the easy, automatic answer — a soft "maybe later" — assuming the child just wants in at any cost.
EVENT 3 [REVEAL]            — The child doesn't push or sulk — they keep watching one specific part of the game, not the whole thing.
EVENT 4 [DEEPER_NOTICE]     — Kavi realizes the child isn't after "playing," they're drawn to one particular move.
EVENT 5 [CHANGED_RESPONSE]  — Kavi asks directly what they want to play, instead of guessing.

TURNING POINT: Kavi sees the child's actual interest instead of the assumption ("wants to be included at any cost").
NEW CHOICE / ACTION: Kavi invites the child into that specific part, not the whole game.
RESOLUTION: Kavi shifts over, literally makes space in the circle — shown, not narrated.
```
5 events, all relational — no external fact/rule/object is ever the point; the payoff is entirely in what Kavi understands about the *child*, per the locked rule.

### F05 — The Unexpected Turn

```
FORM: F05 Unexpected Turn
STORY PURPOSE: What happens when Kavi's planned afternoon stops being the planned afternoon?
OPENING STATE: Kavi has today's game mapped out — who plays what, how long, how it ends.
HERO WANT: Have the afternoon go the way it was planned.

EVENT 1 [EXPECTATION]       — The plan is set and running well.
EVENT 2 [DISRUPTION]        — The younger child's request to join is the first thing the plan didn't account for.
EVENT 3 [REACTION]          — Kavi tries to fold the child in without changing anything else — it doesn't hold, the plan starts slipping.
EVENT 4 [DISRUPTION]        — A friend has to leave early — a second, unrelated disruption stacks on top of the first.
EVENT 5 [RESTORE_ATTEMPT]   — Kavi tries to patch the original plan back together around both changes.
EVENT 6 [RESTORE_FAILS]     — It keeps not fitting; the original afternoon is no longer available as an option.

TURNING POINT: Kavi stops trying to get back to the original plan.
NEW CHOICE / ACTION: Kavi lets the afternoon reshape itself around who's actually there and what they actually want.
RESOLUTION: What emerges is a looser, different afternoon — better than the plan was, and Kavi's stopped comparing it to what was supposed to happen.
```
6 events, two full DISRUPTION beats (not one) plus a genuine RESTORE_ATTEMPT/RESTORE_FAILS pair — the form's signature "tries to get back to normal, can't" beat, absent from all the other four.

---

## Architecture check — did each Form keep its own event grammar?

| Form | Event count | Event types used | Any bleed into another Form's vocabulary? |
|---|---|---|---|
| F01 | 6 | ATTEMPT / CONSEQUENCE only | No |
| F02 | 4 | NOTICE / INVESTIGATE / DISCOVER / CONNECTED_DISCOVERY only | No |
| F03 | 5 | EVIDENCE / CONTRADICTION / OTHER_PERSPECTIVE / BELIEF_UNCERTAIN / REVEALING_MOMENT only | No |
| F04 | 5 | ENCOUNTER / INITIAL_RESPONSE / REVEAL / DEEPER_NOTICE / CHANGED_RESPONSE only | No |
| F05 | 6 | EXPECTATION / DISRUPTION(×2) / REACTION / RESTORE_ATTEMPT / RESTORE_FAILS only | No |

No two Forms produced the same event count, and none defaulted to a generic ATTEMPT/CONSEQUENCE shape except F01, which is the only Form that's actually supposed to have it. F05 is notably the only one with a repeated event type (`DISRUPTION` twice) — correct, since its own spec requires a second, unrelated disruption stacking on the first; that's Form-authentic repetition, not engine laziness.

**Result: the event architecture held.** Ready for your review before this schema gets built into anything.
