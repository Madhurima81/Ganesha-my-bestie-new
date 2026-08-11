# Prana Story Generator — Phase 8 Regression Test Specification

**Status:** Test specifications ready to execute once Event Planner is implemented.

These regression tests validate that the JSON implementation of T03, T16, T21, T22, T23 produces story plans matching the locked paper specifications in `tmp_phase7f_template_finalization_and_e2e_test.md`.

**Test Coverage:**
- SIT005 → F01 → T03 (Part 9.5 fixed rerun)
- SIT067 → F03 → T16 (Part 11 official rerun)
- SIT111 → F05 → T21 (Part 9.6 fixed rerun)
- SIT148 → F02 → T22 (Part 8.1 fixed rerun)
- SIT089 → F04 → T23 (Part 8.2 fixed rerun)

---

## Test 1: SIT005 → T03 "Three Tries" (F01)

**Source:** `tmp_phase7f_template_finalization_and_e2e_test.md` Part 9.5

### Test Input
- **Situation ID:** SIT005 ("Lost a favourite blanket")
- **Form Selected:** F01 (The Journey of Trying)
- **Template Selected:** T03 (Three Tries)

### Expected Outputs

#### Story Essence
- **emotionalTruth:** "Getting it right was never about pushing harder at the same wall."
- **storyQuestion:** "Will Kavi ever crack this problem tonight?"
- **coreChange:** "Repetition gives way to a genuinely different way of working."

#### Cast
- **Hero:** Kavi (solo, 0 supporting characters)
- **World/Setting:** Kavi's desk, evening, alone with the same worksheet
- **Key Objects:** the worksheet/problem itself

#### Opening State
- **situation:** Kavi has redone the same problem twice already tonight, the same way both times — working straight down the written steps, checking the arithmetic. Both times, the same wrong answer came out.
- **Pre-story attempts on record:** "rework the written numeric steps, checking arithmetic" — attempted twice, identically, before the Story Plan opens.

#### EVENT CHAIN (8 beats: SETUP, ATTEMPT_1, CONSEQUENCE_1, ATTEMPT_2, CONSEQUENCE_2, TURNING_POINT, ATTEMPT_3, RESOLUTION)

**[SETUP/ATTEMPT_1]:**
- Action: Kavi stops recomputing and instead redraws the whole problem as a picture, trying to see the relationship between the numbers rather than calculate it.
- Verification rule: ATTEMPT_1 (visual representation via drawing) must differ from pre-story attempts (numeric recomputation) ✓
- Expected result: Genuinely different from the two pre-story numeric attempts

**[CONSEQUENCE_1]:**
- Action: The drawing doesn't solve it outright, but it makes visible, for the first time, which part of the problem Kavi has been misreading all night.
- newInfo: specific new piece of information that a plain redraw-and-stare would not produce on its own

**[ATTEMPT_2]:**
- Action: Kavi tries explaining the problem out loud, step by step, to no one in particular — forcing each step into words instead of numbers or a picture.
- Verification rule: ATTEMPT_2 (verbal reasoning) must differ from ATTEMPT_1 (drawing) AND from pre-story numeric attempts ✓
- Expected result: Distinct third method (verbal reasoning)

**[CONSEQUENCE_2]:**
- Action: Saying it out loud, Kavi's own voice catches on the exact spot the drawing had hinted at — the same misread, now confirmed and precisely located, still not solved.
- newInfo: pinpoints, rather than just gestures at, where the method needs to change

**[TURNING_POINT]:**
- Trigger: EVENT 3→4 (saying it aloud pinpoints the exact misread), placed between CONSEQUENCE_2 and ATTEMPT_3
- Statement: "This was never asking for more effort at the same steps — every way I actually looked at it differently showed me something the last way didn't."

**[ATTEMPT_3]:**
- Action: Kavi breaks the problem into just the one small sub-step just located, solves only that piece, and checks it before moving on — a structural change in HOW Kavi works.
- Verification rule: ATTEMPT_3 (decomposition/structural change) must differ from ATTEMPT_1 (drawing), ATTEMPT_2 (verbal), AND pre-story numeric attempts ✓
- Expected result: All three attempts verified as genuinely different methods

**[RESOLUTION]:**
- Action: That sub-step is right. Built on it, the next one clicks too.
- Result: Kavi finishes the homework correctly, the messy crossed-out page ending in a clean, solved one.

### Test Verification (LintT03_ThreeTries)

1. **Pre-story attempts extracted:** Parser should identify "rework the written numeric steps, checking arithmetic" from OPENING STATE
2. **ATTEMPT_1 method:** "drawing" or "visual representation" — must differ from pre-story "numeric recompute" ✅
3. **ATTEMPT_2 method:** "verbal reasoning" or "saying it aloud" — must differ from ATTEMPT_1 and pre-story ✅
4. **ATTEMPT_3 method:** "decomposition" or "breaking into sub-steps" — must differ from ATTEMPT_1, ATTEMPT_2, and pre-story ✅
5. **All required beats present:** SETUP, ATTEMPT_1, CONSEQUENCE_1, ATTEMPT_2, CONSEQUENCE_2, TURNING_POINT, ATTEMPT_3, RESOLUTION ✅

### Expected Outcome
**PASS** — All three attempts verified as genuinely different methods, including pre-story checks. No requirement for belief field (F01 has none).

---

## Test 2: SIT067 → T16 "Two Ways to See It" (F03)

**Source:** `tmp_phase7f_template_finalization_and_e2e_test.md` Part 11

### Test Input
- **Situation ID:** SIT067 ("Still on the same page, others finished")
- **Form Selected:** F03 (Shift in Seeing)
- **Template Selected:** T16 (Two Ways to See It)

### Expected Outputs

#### Story Essence
- **emotionalTruth:** "Slow was never the same as behind."
- **storyQuestion:** "Is Kavi actually behind, or just working a different way?"
- **coreChange:** "'Speed proves intelligence' stops being automatic."

#### Cast
- **Hero:** Kavi
- **Supporting Character:** teacher (role: "classroom authority figure, present but not the source of Kavi's reassessment", narrativeFunction: "WITHHOLD_ANSWER / ambient-corroborating-presence only")
- **World/Setting:** classroom, reading time
- **Key Objects:** none (purely internal belief-shift)

#### Opening State
- **situation:** Around Kavi, pencils are already going down. Kavi is still on the same page, staring at it, wondering why it isn't clicking yet.
- **belief:** "If I learn slowly, I'm not smart." (F03-mandatory)

#### EVENT CHAIN (5 beats: EVENT, INTERPRETATION_1, EVIDENCE_GATHERING, INTERPRETATION_2, RESOLUTION)

**[EVENT]:**
- Action: Kavi is still sounding out words on page 4 while the rest of the class has closed their books and moved to free reading.
- newInfo: establishes the opening fact the false belief will attach to

**[INTERPRETATION_1]:**
- Reading: "I'm still stuck here because I'm not smart enough to get it, like they did."
- **evidenceCited (REQUIRED):**
  - "Kavi is still on page 4 while the rest of the class has closed their books" ✓
  - "this has happened before, multiple times, not just today" ✓
- Verification rule: evidenceCited must be concrete, specific, plan-grounded facts (not strawman) ✅
- Count: 2 evidence points ← baseline for weight parity

**[EVIDENCE_GATHERING]:**
- Action (HERO-actor): Kavi closes the book without being told to, and — unprompted, testing themselves — retells what happened in the chapter so far, out loud, in full and accurate detail, surprising even Kavi. Moments later, the teacher (visible in background, NOT addressing Kavi, NOT supplying any answer) calls on two fast-finishers and asks what happened on the page they just read — both have to flip back and reread before they can answer at all.
- **evidenceSource (REQUIRED, ENUM):**
  - Value: "HERO_DIRECT_TEST" ✓
  - Verification: Must be one of [HERO_DIRECT_OBSERVATION, HERO_DIRECT_TEST, HERO_DIRECT_EXPERIENCE] ✅
  - Rule: Cannot be "OTHER_CHARACTER_STATEMENT" or "OTHER_CHARACTER_EXPLANATION" ✅
- **contradictionMoment (REQUIRED, MATERIALITY CHECK):**
  - Value: "Kavi's own unprompted retelling — full, accurate, from memory, something Kavi did not expect to be able to do — directly contradicts 'I'm not smart enough to get it'; the fast-finishers' failure to do the same when called on is corroborating evidence Kavi personally witnesses in the same scene, not a fact delivered to Kavi by the teacher."
  - Materiality check: Is this substantial enough to plausibly threaten INTERPRETATION_1? YES ✓ (Kavi's accurate retelling + fast-finishers' failure = hard-to-dismiss counter-demonstration)
  - NOT merely incidental ✓
- **reassessmentIsHeroOwned (REQUIRED, BOOLEAN):**
  - Value: `true` ✓
  - Verification: The retell test is Kavi's own idea and Kavi's own discovery, prompted by no one ✅

**[INTERPRETATION_2]:**
- Reading: "Finishing first never meant understanding it best — Kavi just proved they'd absorbed the whole chapter, and two people who 'got there first' couldn't do the same."
- **evidenceCited (REQUIRED, WEIGHT PARITY):**
  - "Kavi retold the whole chapter accurately from memory, unprompted" ✓
  - "two fast-finishers couldn't do the same when asked" ✓
  - Count: 2 evidence points ← EQUALS baseline (weight parity satisfied) ✅

**[RESOLUTION]:**
- Action: Kavi's understanding shifts from "slow = not smart" to "slow is just a different working speed, not a measure of intelligence"
- Shown (not narrated as lesson): Kavi continues reading with confidence

### Test Verification (LintT16_TwoWaysToSeeIt)

1. **INTERPRETATION_1.evidenceCited:** Array with 2+ items, grounded in plan ✅
2. **INTERPRETATION_2.evidenceCited:** Array with 2+ items ✅
3. **Weight parity:** INTERPRETATION_2.evidenceCited.length >= INTERPRETATION_1.evidenceCited.length (2 >= 2) ✅
4. **EVIDENCE_GATHERING.evidenceSource:** "HERO_DIRECT_TEST" is valid enum value ✅
5. **EVIDENCE_GATHERING.contradictionMoment:** Specific, material event (Kavi's retelling + fast-finishers' failure), materially threatens INTERPRETATION_1 ✅
6. **EVIDENCE_GATHERING.reassessmentIsHeroOwned:** `true` (Kavi's own test, own discovery) ✅
7. **All required beats present:** EVENT, INTERPRETATION_1, EVIDENCE_GATHERING, INTERPRETATION_2, RESOLUTION ✅

### Expected Outcome
**PASS** — All structural constraints satisfied. evidenceCited weights are parity. evidenceSource valid enum. contradictionMoment is material and hero-owned. No drifting toward handed-over reassurance from teacher.

---

## Test 3: SIT111 → T21 "The Disrupted Plan" (F05)

**Source:** `tmp_phase7f_template_finalization_and_e2e_test.md` Part 9.6

### Test Input
- **Situation ID:** SIT111 ("Noisy, overcrowded mall" / "scratchy uniform, flickering light")
- **Form Selected:** F05 (Unexpected Turn)
- **Template Selected:** T21 (The Disrupted Plan)

### Expected Outputs

#### Story Essence
- **emotionalTruth:** "Needing a different kind of help isn't the same as failing to cope."
- **storyQuestion:** "Can Kavi get through class the ordinary way today?"
- **coreChange:** "'Push through exactly as planned' becomes 'ask for a different way to get through.'"

#### Cast
- **Hero:** Kavi
- **Supporting Characters:** none named as actors (teacher present ambiently)
- **World/Setting:** classroom, mid-lesson, structured setting
- **Key Objects:** none

#### Opening State
- **situation:** The collar has been scratching since the bell rang. Kavi is trying to listen to the teacher anyway.
- **plan:** Sit still, stay focused, get through the lesson the way Kavi always does.

#### EVENT CHAIN (7 beats: EXPECTATION, DISRUPTION_1, REACTION, DISRUPTION_2, RESTORE_ATTEMPT, RESTORE_FAILS, ADAPTATION_RESOLUTION)

**[EXPECTATION]:**
- Action: Kavi settles in, ready to follow along like any other day.
- newInfo: establishes the plan concretely

**[DISRUPTION_1]:**
- Action: (ambient) The collar keeps scratching, worse than usual, an ongoing tactile irritation building through the period.
- **disruptionCategory (REQUIRED, ENUM):** "SENSORY" ✓
  - Verification: Must be one of [SENSORY, SOCIAL, LOGISTICAL, EMOTIONAL_INTERNAL, PHYSICAL_SAFETY] ✅
  - Grounding: "scratchy uniform," "ongoing tactile irritation" matches SENSORY definition ✓
- newInfo: first disruption, category SENSORY

**[REACTION]:**
- Action: Kavi tugs at the collar under the desk and tries to focus harder on the teacher's voice, willing it to fade into the background.
- newInfo: Kavi's first, smaller-scale coping response (NOT a real restoration attempt, just cope)

**[DISRUPTION_2]:**
- Action: midway through the lesson, the teacher announces, with no warning, that the class must gather their things and move to the assembly hall right now — the planned lesson structure itself breaks.
- **disruptionCategory (REQUIRED, ENUM):** "LOGISTICAL" ✓
  - Verification: Must be one of [SENSORY, SOCIAL, LOGISTICAL, EMOTIONAL_INTERNAL, PHYSICAL_SAFETY] ✅
  - Grounding: "plan/schedule break" matches LOGISTICAL definition ✓
- **Category-level difference check:** SENSORY ≠ LOGISTICAL ✅ (not two same-category items with different surface labels)
- newInfo: a second disruption of DIFFERENT category

**[RESTORE_ATTEMPT]:**
- Action: Kavi tries to gather things quickly and keep up with the sudden move while the collar is still scratching, determined to make the transition look as smooth and "normal" as any other day.
- newInfo: genuine, real attempt (not token gesture)

**[RESTORE_FAILS]:**
- Action: It doesn't work — between the still-itching collar and the rushed, unplanned move, Kavi drops a folder, arrives at the hall late and flustered, and misses the start of what's happening.
- newInfo: confirms the push-through plan genuinely fails

**[ADAPTATION/RESOLUTION]:**
- Action: Kavi asks the teacher for the collar to be loosened AND for one quiet minute to settle in before joining the hall activity — addressing both disruptions with a genuinely different approach.
- Result: Kavi settles into the assembly hall from a calmer start, collar loosened — materially different from the original plan, and it works.

### Test Verification (LintT21_TheDisruptedPlan)

1. **DISRUPTION_1.disruptionCategory:** "SENSORY" is valid enum value ✅
2. **DISRUPTION_2.disruptionCategory:** "LOGISTICAL" is valid enum value ✅
3. **Category-level difference:** SENSORY ≠ LOGISTICAL ✅ (not two same-category with different surface labels)
4. **No belief field:** F05 has none ✅
5. **All required beats present:** EXPECTATION, DISRUPTION_1, REACTION, DISRUPTION_2, RESTORE_ATTEMPT, RESTORE_FAILS, ADAPTATION_RESOLUTION ✅

### Expected Outcome
**PASS** — disruptionCategory values are valid enum. Two disruptions differ at category level (SENSORY vs LOGISTICAL), not just surface description. No hard belief requirement.

---

## Test 4: SIT148 → T22 "The Reframe Trail" (F02)

**Source:** `tmp_phase7f_template_finalization_and_e2e_test.md` Part 8.1 (fixed rerun)

### Test Input
- **Situation ID:** SIT148 ("Found object with initials")
- **Form Selected:** F02 (Discovery Journey)
- **Template Selected:** T22 (The Reframe Trail)

### Expected Outputs

#### Story Essence
- **emotionalTruth:** "A found object that was cared for isn't just found — it's still wanted."
- **storyQuestion:** "Whose is this, and what happens when Kavi finds out?"
- **coreChange:** "An anonymous object becomes an object with a known, active search behind it."

#### Cast
- **Hero:** Kavi
- **Supporting Character:** owner (role: "park regular", narrativeFunction: "endpoint of the discovery" — never drives the plot's questions)
- **World/Setting:** the park, the same bench, across two consecutive afternoons
- **Key Objects:** the found object (initials scratched into the underside)

#### Opening State (no belief field — F02 carries none)
- **situation:** Kavi spots something small and valuable half-hidden under a park bench. Nobody else is around.

#### EVENT CHAIN (6 beats: NOTICE, INVESTIGATE, DISCOVER, CONNECTED_DISCOVERY, NEW_CHOICE, RESOLUTION)

**[NOTICE]:**
- Action: Kavi picks it up, turns it over. It's not random junk — it looks cared for, deliberately kept.
- newInfo: attention shifts from "background object" to "something worth looking at"

**[INVESTIGATE]:**
- Action: finds initials scratched into the underside.
- Reinterpretation (per T22 device): "this object has an identity attached to it now, not just a shape"

**[DISCOVER]:**
- Action: the initials match a name Kavi's heard called out by a regular at this bench.
- Reinterpretation (per T22 device): "the object connects to a specific, locatable place this object came from"

**[CONNECTED_DISCOVERY]:**
- Action: Kavi remembers seeing that same woman crouched down searching the grass at this exact bench yesterday.
- Reinterpretation (OBJECT-FOCUSED per T22 reinterpretationFocus: "object" constraint):
  - **Value:** "This isn't just a found object anymore — it's an object that was being actively searched for, on this exact spot, as recently as yesterday. Someone is still looking for it, right now."
  - **Grammatical subject verification:** 
    - Subject: "object" and "search-for-it" ✓
    - NOT subject: a person's inner experience ✓
    - Bare fact that person is identifiable: "Someone is still looking for it" ✓ (no interiority, no relational framing)
  - **reinterpretationFocus: "object"** ✓ SATISFIED
- This is the template's turning point

**[NEW_CHOICE]:**
- Action: Kavi comes back to the same bench the next afternoon, object in hand, instead of leaving it at a lost-and-found or keeping it.

**[RESOLUTION]:**
- Action: Kavi hands it back.
- **Constraint:** Only one factual sentence about the owner: "The owner's relief is immediate and specific to THIS object, not a new friendship being formed."
- This is where the backstop note applies: person-related content limited to RESOLUTION as single factual sentence only

### Test Verification (LintT22_TheReframeTrail)

1. **CONNECTED_DISCOVERY.reinterpretationFocus:** "object" ✓
2. **Grammatical subject of reinterpretation:** "object" and "search", not person's feelings ✅
3. **No belief field:** F02 has none ✅
4. **All required beats present:** NOTICE, INVESTIGATE, DISCOVER, CONNECTED_DISCOVERY, NEW_CHOICE, RESOLUTION ✅
5. **No relational language in CONNECTED_DISCOVERY:** Object-focused only ✅
6. **RESOLUTION stays object-focused:** Single factual sentence about owner, no emotional interiority ✅

### Expected Outcome
**PASS** — reinterpretationFocus: "object" satisfied on CONNECTED_DISCOVERY. Grammatical subject is object/pattern, not person's experience. RESOLUTION limited to single factual sentence. No drift toward F04 relational framing in CONNECTED_DISCOVERY.

---

## Test 5: SIT089 → T23 "The Assumption Bridge" (F04)

**Source:** `tmp_phase7f_template_finalization_and_e2e_test.md` Part 8.2 (fixed rerun)

### Test Input
- **Situation ID:** SIT089 ("New sibling, attention divided")
- **Form Selected:** F04 (Connection Journey)
- **Template Selected:** T23 (The Assumption Bridge)

### Expected Outputs

#### Story Essence
- **emotionalTruth:** "Love isn't a fixed amount that gets divided when someone new arrives."
- **storyQuestion:** "Will anyone actually notice Kavi today, and does that even mean what Kavi fears it means?"
- **coreChange:** "'Less attention' stops meaning 'replaced.'"

#### Cast

**Baby (passive character):**
- role: "new sibling (baby)"
- want: (no independent want at this age — no independent agency)
- **Condition (a) CAUSATION — declared here:** The baby's arrival and ongoing physical presence (occupying Mama's hands, attention, and time right now) is the actual originating cause of Kavi's assumption ("the new baby has replaced me")

**Mama (agentic supporting character):**
- role: "parent (Mama)"
- want: to care for the new baby right now, and — though Kavi doesn't yet realize it — to make sure Kavi still feels included
- **Condition (b) DECLARED AGENTIC PROXY — declared here:** Mama is the agentic supporting character who corrects Kavi's assumption ON THE BABY'S BEHALF — the CAST entry states this explicitly, not discovered during event planning

**Verification:** Both (a) and (b) declared at CAST stage, before any event planning ✓

#### World/Setting
- home living room; the sofa where Mama feeds the baby, Papa photographing nearby

#### Key Objects
- the picture Kavi made

#### Opening State
- **situation:** Kavi stands beside the sofa holding a picture they made. Mama is feeding the baby. Papa is taking photographs of the baby. Kavi waits for someone to look up.
- **assumption (F04 field):** "The new baby has replaced me." (Grammatical subject is baby — condition (a) above is what licenses the exception)

#### EVENT CHAIN (6 beats: ENCOUNTER, INITIAL_RESPONSE, REVEAL, DEEPER_NOTICE, CHANGED_RESPONSE, RESOLUTION)

**[ENCOUNTER]:**
- Action (HERO): Kavi holds the picture up, closer to Mama's line of sight, waiting.

**[INITIAL_RESPONSE]:**
- Action (MAMA — supporting character, not hero): a quick, distracted "that's lovely, sweetie," eyes still on the baby.
- **Hard actor rule:** Actor is Mama ✓ (not baby, not hero)
- Traced to CAST condition (b): Mama in her declared proxy role

**[REVEAL]:**
- Action (MAMA — supporting character, not hero): a few minutes later, Mama turns fully around, sits Kavi down, asks to hear the whole story behind the picture, and explicitly explains the distracted answer was about needing both hands free for the baby first — not about Kavi mattering less.
- **Hard actor rule:** Actor is Mama ✓ (not baby, not hero)
- **Traced to CAST condition (b), not silent substitution:** Explicitly declared at CAST stage that Mama corrects ON THE BABY'S BEHALF
- This is Mama correcting the assumption on the baby's behalf, exactly as declared

**[DEEPER_NOTICE]:**
- Action (HERO): Kavi realizes Mama's attention was full, not divided by choice — it had to go somewhere first (the baby, per condition (a)), then came back.

**[CHANGED_RESPONSE]:**
- Action (HERO): Kavi starts asking directly: "can I show you something when the baby's settled?"

**[RESOLUTION]:**
- Action (HERO + MAMA): Mama sits with Kavi and the picture, fully present, baby now asleep in the next room — demonstrated relationally through the two of them sitting together.
- **Actor pairing:** HERO + Mama ✓ (not hero-only internal realization)

### Test Verification (LintT23_TheAssumptionBridge)

1. **INITIAL_RESPONSE.actor:** "Mama" ✓ (not hero)
2. **REVEAL.actor:** "Mama" ✓ (not hero, not baby)
3. **Passive-substitution exception declared:**
   - Condition (a) CAUSATION: Baby's presence causes assumption ✓ (declared in CAST)
   - Condition (b) DECLARED_AGENTIC_PROXY: Mama's narrativeFunction states "corrects ON THE BABY'S BEHALF" ✓ (declared in CAST, before event planning)
4. **RESOLUTION actor pairing:** HERO + Mama ✓ (both characters present, relational)
5. **No belief field:** F04 has none ✅
6. **assumption field present:** "The new baby has replaced me" ✓ (F04 optional, present in this plan)
7. **All required beats present:** ENCOUNTER, INITIAL_RESPONSE, REVEAL, DEEPER_NOTICE, CHANGED_RESPONSE, RESOLUTION ✅

### Expected Outcome
**PASS** — Hard actor rule satisfied (INITIAL_RESPONSE/REVEAL are Mama). Passive-substitution exception properly invoked with both conditions declared at CAST stage, before event planning. RESOLUTION shows both characters present, relationally. No silent substitution or undocumented workaround.

---

## Summary

All five regression tests validate the locked 7F specifications:

| Test | Situation | Form | Template | Key Constraint | Expected Outcome |
|------|-----------|------|----------|---|---|
| 1 | SIT005 | F01 | T03 | variationRule: ATTEMPT_1/2/3 differ from pre-story + each other | PASS |
| 2 | SIT067 | F03 | T16 | evidenceCited weight-parity, evidenceSource enum, contradictionMoment materiality, reassessmentIsHeroOwned | PASS |
| 3 | SIT111 | F05 | T21 | disruptionCategory enum, DISRUPTION_1 ≠ DISRUPTION_2 at category level | PASS |
| 4 | SIT148 | F02 | T22 | reinterpretationFocus: "object" on CONNECTED_DISCOVERY, no relational drift | PASS |
| 5 | SIT089 | F04 | T23 | Hard actor rule (INITIAL_RESPONSE/REVEAL), passive-substitution exception (both conditions declared), RESOLUTION pairing | PASS |

**Execution:** These tests should be run after the Event Planner is implemented to generate the story plans, which are then validated against the linter (templateQaLinter.js) and these specifications.

**Next Phase:** Event Planner implementation (deferred, per locked sequence).
