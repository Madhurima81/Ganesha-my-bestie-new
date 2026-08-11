#!/usr/bin/env node
/**
 * Regression Test Runner for Phase 7F Template Implementation
 *
 * Executes the 5 locked regression tests against storyTemplates.json + linter.
 * Tests: SIT005→T03, SIT067→T16, SIT111→T21, SIT148→T22, SIT089→T23
 */

import { TemplateQaLinter } from "./templateQaLinter.js";

// ============================================================================
// TEST FIXTURES: Story plans constructed per regressionTestSpec.md
// ============================================================================

const TEST_CASES = {
  SIT005_T03: {
    situationId: "SIT005",
    templateId: "T03",
    title: "Three Tries - Homework Problem",
    description: "Kavi tries three different methods to solve a math problem",
    storyPlan: {
      templateId: "T03",
      situationId: "SIT005",
      form: "F01",
      openingState: {
        situation:
          "Kavi has redone the same problem twice already tonight, the same way both times — working straight down the written steps, checking the arithmetic. Both times, the same wrong answer came out. The page is getting messier.",
        preStoryAttempts: [
          "rework the written numeric steps, checking arithmetic",
          "rework the written numeric steps, checking arithmetic"
        ]
      },
      eventChain: [
        {
          label: "SETUP",
          action: "Kavi sits at the desk with the worksheet",
          newInfo: "establishes the situation"
        },
        {
          label: "ATTEMPT_1",
          action:
            "Kavi stops recomputing and instead redraws the whole problem as a picture, trying to see the relationship between the numbers rather than calculate it.",
          method: "drawing/visual representation",
          newInfo:
            "genuinely different from the two pre-story attempts (visual representation, not numeric recomputation)"
        },
        {
          label: "CONSEQUENCE_1",
          action:
            "The drawing doesn't solve it outright, but it makes visible, for the first time, which part of the problem Kavi has been misreading all night.",
          newInfo:
            "a specific new piece of information neither the pre-story attempts nor a plain redraw-and-stare would produce"
        },
        {
          label: "ATTEMPT_2",
          action:
            "Kavi tries explaining the problem out loud, step by step, to no one in particular — forcing each step into words instead of numbers or a picture.",
          method: "verbal reasoning/saying it aloud",
          newInfo:
            "a third distinct method (verbal reasoning) — different from both the pre-story numeric attempts AND from EVENT 1's drawing"
        },
        {
          label: "CONSEQUENCE_2",
          action:
            "Saying it out loud, Kavi's own voice catches on the exact spot the drawing had hinted at — the same misread, now confirmed and precisely located, still not solved.",
          newInfo:
            "pinpoints, rather than just gestures at, where the method needs to change"
        },
        {
          label: "TURNING_POINT",
          action:
            "Kavi pauses instead of trying a fourth variation of the same strategy, and the true belief surfaces.",
          statement:
            "This was never asking for more effort at the same steps — every way I actually looked at it differently showed me something the last way didn't."
        },
        {
          label: "ATTEMPT_3",
          action:
            "Kavi breaks the problem into just the one small sub-step just located, solves only that piece, and checks it before moving on — a structural change in HOW Kavi works.",
          method: "decomposition/breaking into sub-steps",
          newInfo:
            "this is the first attempt aimed at the located sub-step specifically, not the whole problem again"
        },
        {
          label: "RESOLUTION",
          action:
            "That sub-step is right. Built on it, the next one clicks too. Kavi finishes the homework correctly, the messy crossed-out page ending in a clean, solved one.",
          newInfo: "success through structural change, not more effort"
        }
      ],
      blueprint: {
        situation:
          "Kavi has a homework problem that won't solve, and attempts have all failed the same way.",
        hero: "Kavi",
        heroWant: "get the answer right tonight before giving up",
        // F01 has no belief field
        supportingCharacters: [] // solo story
      }
    },
    expectedConstraintChecks: [
      {
        name: "ATTEMPT_1 differs from pre-story",
        check:
          "method 'drawing' is different from pre-story 'numeric recompute'"
      },
      {
        name: "ATTEMPT_2 differs from ATTEMPT_1 and pre-story",
        check:
          "method 'verbal reasoning' differs from both 'drawing' and 'numeric recompute'"
      },
      {
        name: "ATTEMPT_3 differs from ATTEMPT_1, ATTEMPT_2, and pre-story",
        check:
          "method 'decomposition' differs from 'drawing', 'verbal', and 'numeric recompute'"
      },
      {
        name: "All required beats present",
        check: "8 beats: SETUP, ATTEMPT_1, CONSEQUENCE_1, ATTEMPT_2, CONSEQUENCE_2, TURNING_POINT, ATTEMPT_3, RESOLUTION"
      }
    ]
  },

  SIT067_T16: {
    situationId: "SIT067",
    templateId: "T16",
    title: "Two Ways to See It - Reading Speed",
    description: "Kavi believes slow reading means low intelligence, then discovers speed and comprehension are separate",
    storyPlan: {
      templateId: "T16",
      situationId: "SIT067",
      form: "F03",
      openingState: {
        situation:
          "Around Kavi, pencils are already going down. Kavi is still on the same page, staring at it, wondering why it isn't clicking yet.",
        belief: "If I learn slowly, I'm not smart."
      },
      eventChain: [
        {
          label: "EVENT",
          action:
            "Kavi is still sounding out words on page 4 while the rest of the class has closed their books and moved to free reading.",
          newInfo: "establishes the opening fact the false belief will attach to"
        },
        {
          label: "INTERPRETATION_1",
          action:
            "Kavi reads the closed books around the room as proof: 'I'm still stuck here because I'm not smart enough to get it, like they did.'",
          evidenceCited: [
            "Kavi is still on page 4 while the rest of the class has closed their books",
            "this has happened before, multiple times, not just today"
          ],
          verified: "Two concrete, plan-grounded facts, not a strawman"
        },
        {
          label: "EVIDENCE_GATHERING",
          action:
            "Kavi closes the book without being told to, and — unprompted, testing themselves — retells what happened in the chapter so far, out loud, in full and accurate detail, surprising even Kavi. Moments later, the teacher (visible in the background, not addressing Kavi, not supplying any answer) calls on two of the fast-finishers and asks what happened on the page they just read — both have to flip back and reread before they can answer at all.",
          evidenceSource: "HERO_DIRECT_TEST",
          contradictionMoment:
            "Kavi's own unprompted retelling — full, accurate, from memory, something Kavi did not expect to be able to do — directly contradicts 'I'm not smart enough to get it'; the fast-finishers' failure to do the same when called on is corroborating evidence Kavi personally witnesses in the same scene",
          contradictionMateriality:
            "Not incidental — directly rebutting the specific claim 'finishing first = understanding it, and I don't understand it,' with a concrete, hard-to-dismiss counter-demonstration",
          reassessmentIsHeroOwned: true
        },
        {
          label: "INTERPRETATION_2",
          action:
            "Kavi reassesses: finishing first never meant understanding it best — Kavi just proved they'd absorbed the whole chapter, and two people who 'got there first' couldn't do the same.",
          evidenceCited: [
            "Kavi retold the whole chapter accurately from memory, unprompted",
            "two fast-finishers couldn't do the same when asked"
          ],
          weightParityCheck: "2 items, equal to INTERPRETATION_1's count (2 items) — WEIGHT PARITY satisfied"
        },
        {
          label: "RESOLUTION",
          action:
            "Kavi continues reading with confidence; the shift from 'slow = not smart' to 'slow is just a different working speed' is complete.",
          newInfo: "shown, not narrated as a lesson"
        }
      ],
      blueprint: {
        situation:
          "Kavi finishes reading later than classmates and interprets this as lack of intelligence",
        hero: "Kavi",
        heroWant: "catch up and get it right, like everyone else seems to",
        belief: "If I learn slowly, I'm not smart.",
        trueBelief: "Slow is not the same as behind.",
        supportingCharacters: [
          {
            role: "teacher",
            narrativeFunction:
              "WITHHOLD_ANSWER / ambient-corroborating-presence only"
          }
        ]
      }
    },
    expectedConstraintChecks: [
      { name: "INTERPRETATION_1.evidenceCited", check: "Array with 2 items, grounded in plan" },
      { name: "INTERPRETATION_2.evidenceCited", check: "Array with 2 items" },
      { name: "Weight parity", check: "2 items >= 2 items ✓" },
      { name: "evidenceSource enum", check: "HERO_DIRECT_TEST is valid" },
      {
        name: "contradictionMoment materiality",
        check: "Kavi's retelling + fast-finishers' failure is material, not trivial"
      },
      { name: "reassessmentIsHeroOwned", check: "true — Kavi's own test and discovery" }
    ]
  },

  SIT111_T21: {
    situationId: "SIT111",
    templateId: "T21",
    title: "The Disrupted Plan - Classroom Disruptions",
    description: "Kavi's plan to get through class is disrupted first by sensory irritation, then by schedule change",
    storyPlan: {
      templateId: "T21",
      situationId: "SIT111",
      form: "F05",
      openingState: {
        situation:
          "The collar has been scratching since the bell rang. Kavi is trying to listen to the teacher anyway.",
        plan: "Sit still, stay focused, get through the lesson the way Kavi always does."
      },
      eventChain: [
        {
          label: "EXPECTATION",
          action: "Kavi settles in, ready to follow along like any other day.",
          newInfo: "establishes the plan concretely"
        },
        {
          label: "DISRUPTION_1",
          action:
            "(ambient) The collar keeps scratching, worse than usual, an ongoing tactile irritation building through the period.",
          disruptionCategory: "SENSORY",
          categoryVerification: "Matches SENSORY definition: ongoing physical/environmental input (tactile irritation)",
          newInfo: "first disruption, category SENSORY"
        },
        {
          label: "REACTION",
          action:
            "Kavi tugs at the collar under the desk and tries to focus harder on the teacher's voice, willing it to fade into the background.",
          newInfo: "Kavi's first, smaller-scale coping response (not full restoration attempt)"
        },
        {
          label: "DISRUPTION_2",
          action:
            "midway through the lesson, the teacher announces, with no warning, that the class must gather their things and move to the assembly hall right now — the planned lesson structure itself breaks, not another sensory input.",
          disruptionCategory: "LOGISTICAL",
          categoryVerification: "Matches LOGISTICAL definition: plan/schedule/mechanism breaking, non-social, non-bodily",
          categoryLevelDifference: "SENSORY ≠ LOGISTICAL ✓ (not two same-category items with different surface labels)",
          newInfo: "a second disruption of a DIFFERENT category"
        },
        {
          label: "RESTORE_ATTEMPT",
          action:
            "Kavi tries to gather things quickly and keep up with the sudden move while the collar is still scratching, determined to make the transition look as smooth and 'normal' as any other day.",
          newInfo: "genuine, real attempt (not token gesture)"
        },
        {
          label: "RESTORE_FAILS",
          action:
            "It doesn't work — between the still-itching collar and the rushed, unplanned move, Kavi drops a folder, arrives at the hall late and flustered, and misses the start of what's happening.",
          newInfo: "confirms the push-through plan genuinely fails"
        },
        {
          label: "ADAPTATION_RESOLUTION",
          action:
            "Kavi asks the teacher for the collar to be loosened AND for one quiet minute to settle in before joining the hall activity — addressing both disruptions with a genuinely different approach, not by pushing through either one harder.",
          newInfo: "materially different plan that works"
        }
      ],
      blueprint: {
        situation:
          "Kavi wants to get through class normally, but is disrupted by sensory irritation (scratchy collar) followed by schedule disruption (unplanned assembly)",
        hero: "Kavi",
        heroWant: "get through the lesson normally, the way every other day goes",
        // F05 has no belief field
        supportingCharacters: [] // solo (teacher is ambient)
      }
    },
    expectedConstraintChecks: [
      { name: "DISRUPTION_1.disruptionCategory", check: "SENSORY is valid enum value" },
      { name: "DISRUPTION_2.disruptionCategory", check: "LOGISTICAL is valid enum value" },
      { name: "Category-level difference", check: "SENSORY ≠ LOGISTICAL ✓" },
      { name: "Not same-category", check: "Not two SENSORY items with different labels" },
      { name: "All required beats present", check: "7 beats: EXPECTATION, DISRUPTION_1, REACTION, DISRUPTION_2, RESTORE_ATTEMPT, RESTORE_FAILS, ADAPTATION_RESOLUTION" }
    ]
  },

  SIT148_T22: {
    situationId: "SIT148",
    templateId: "T22",
    title: "The Reframe Trail - Found Object",
    description: "Kavi finds an object, notices details, discovers who it belongs to, and realizes it's an active search",
    storyPlan: {
      templateId: "T22",
      situationId: "SIT148",
      form: "F02",
      openingState: {
        situation:
          "Kavi spots something small and valuable half-hidden under a park bench. Nobody else is around."
        // F02 has no belief field
      },
      eventChain: [
        {
          label: "NOTICE",
          action:
            "Kavi picks it up, turns it over. It's not random junk — it looks cared for, deliberately kept.",
          newInfo: "attention shifts from 'background object' to 'something worth looking at'"
        },
        {
          label: "INVESTIGATE",
          action: "finds initials scratched into the underside.",
          reinterpretation:
            "this object has an identity attached to it now, not just a shape",
          verified: "Reinterpretation per T22 device ✓"
        },
        {
          label: "DISCOVER",
          action:
            "the initials match a name Kavi's heard called out by a regular at this bench.",
          reinterpretation:
            "the object connects to a specific, locatable place this object came from",
          verified: "Reinterpretation per T22 device ✓"
        },
        {
          label: "CONNECTED_DISCOVERY",
          action:
            "Kavi remembers seeing that same woman crouched down searching the grass at this exact bench yesterday.",
          reinterpretation:
            "This isn't just a found object anymore — it's an object that was being actively searched for, on this exact spot, as recently as yesterday. Someone is still looking for it, right now.",
          reinterpretationFocus: "object",
          grammaticalSubjectVerification:
            "Subject: 'object' and 'search-for-it' ✓ NOT subject: person's inner experience ✓",
          bareFactAboutPerson:
            "Bare fact that person exists stated minimally: 'Someone is still looking for it' (no interiority, no relational framing) ✓",
          verified: "reinterpretationFocus: 'object' SATISFIED ✓"
        },
        {
          label: "NEW_CHOICE",
          action:
            "Kavi comes back to the same bench the next afternoon, object in hand, instead of leaving it at a lost-and-found or keeping it.",
          newInfo: "discovery is now acted on"
        },
        {
          label: "RESOLUTION",
          action: "Kavi hands it back.",
          ownerReaction:
            "The owner's relief is immediate and specific to THIS object, not a new friendship being formed.",
          constraint:
            "Only one factual sentence about the owner (backstop guardrail) — no emotional interiority ✓",
          verified: "RESOLUTION stays object-focused ✓"
        }
      ],
      blueprint: {
        situation:
          "Kavi finds an object and discovers through investigation that it belongs to a specific person who is actively searching for it",
        hero: "Kavi",
        heroWant:
          "figure out what this thing is and who it belongs to",
        // F02 has no belief field
        supportingCharacters: [
          {
            role: "owner",
            narrativeFunction: "endpoint of the discovery"
          }
        ]
      }
    },
    expectedConstraintChecks: [
      { name: "CONNECTED_DISCOVERY.reinterpretationFocus", check: "'object' ✓" },
      { name: "Grammatical subject", check: "object/pattern, not person's feelings ✓" },
      { name: "No relational drift", check: "No emotional interiority in CONNECTED_DISCOVERY ✓" },
      { name: "RESOLUTION constraint", check: "Single factual sentence about owner, no interiority ✓" },
      { name: "All required beats present", check: "6 beats: NOTICE, INVESTIGATE, DISCOVER, CONNECTED_DISCOVERY, NEW_CHOICE, RESOLUTION" }
    ]
  },

  SIT089_T23: {
    situationId: "SIT089",
    templateId: "T23",
    title: "The Assumption Bridge - New Sibling",
    description: "Kavi assumes baby has replaced them; Mama reveals it's about attention distribution, not replacement",
    storyPlan: {
      templateId: "T23",
      situationId: "SIT089",
      form: "F04",
      openingState: {
        situation:
          "Kavi stands beside the sofa holding a picture they made. Mama is feeding the baby. Papa is taking photographs of the baby. Kavi waits for someone to look up.",
        assumption: "The new baby has replaced me."
      },
      cast: {
        hero: "Kavi",
        supportingCharacters: [
          {
            role: "new sibling (baby)",
            want: "no independent want (newborn, no independent agency)",
            narrativeFunction:
              "CAUSATION — declared: baby's arrival and ongoing physical presence (occupying Mama's hands, attention, and time) is the actual originating cause of Kavi's assumption",
            passiveCharacterStatus: true
          },
          {
            role: "parent (Mama)",
            want: "to care for the new baby right now, and to make sure Kavi still feels included",
            narrativeFunction:
              "DECLARED_AGENTIC_PROXY — declared: Mama corrects Kavi's assumption ON THE BABY'S BEHALF",
            agenticProxyStatus: true,
            correctsOnBehalfOf: "baby"
          }
        ],
        passiveSubstitutionException: {
          invoked: true,
          condition_a_CAUSATION: true,
          condition_b_DECLARED_AGENTIC_PROXY: true,
          declaredAtCastStage: true,
          verified: "Both conditions declared at CAST step, before event planning ✓"
        }
      },
      eventChain: [
        {
          label: "ENCOUNTER",
          action: "Kavi holds the picture up, closer to Mama's line of sight, waiting.",
          actor: "HERO",
          newInfo: "hero acts on the assumption"
        },
        {
          label: "INITIAL_RESPONSE",
          action:
            "a quick, distracted 'that's lovely, sweetie,' eyes still on the baby.",
          actor: "Mama",
          hardActorRuleVerification: "Actor is supporting character (Mama), not hero ✓",
          tracedToCASTCondition: "CAST condition (b): Mama in declared proxy role ✓",
          newInfo: "response doesn't match hero's assumption"
        },
        {
          label: "REVEAL",
          action:
            "a few minutes later, Mama turns fully around, sits Kavi down, asks to hear the whole story behind the picture, and explicitly explains the distracted answer was about needing both hands free for the baby first — not about Kavi mattering less.",
          actor: "Mama",
          hardActorRuleVerification: "Actor is supporting character (Mama), not hero ✓",
          tracedToCASTCondition:
            "CAST condition (b): Mama declared proxy correcting ON THE BABY'S BEHALF, not a silent substitution ✓",
          verified: "Not improvised during planning; declared upstream at CAST ✓"
        },
        {
          label: "DEEPER_NOTICE",
          action: "Kavi realizes Mama's attention was full, not divided by choice — it had to go somewhere first (the baby, per condition (a)), then came back.",
          actor: "HERO",
          newInfo: "hero's understanding shifts"
        },
        {
          label: "CHANGED_RESPONSE",
          action:
            "Kavi starts asking directly: 'can I show you something when the baby's settled?'",
          actor: "HERO",
          newInfo: "hero acts differently based on new understanding"
        },
        {
          label: "RESOLUTION",
          action:
            "Mama sits with Kavi and the picture, fully present, baby now asleep in the next room — demonstrated relationally through the two of them sitting together.",
          actor: "HERO + Mama",
          actorPairingVerification: "Both characters present, relationally demonstrated ✓ (not hero-only internal realization)",
          newInfo: "shown relationally"
        }
      ],
      blueprint: {
        situation:
          "Kavi assumes baby has replaced them; corrected by Mama who reveals it's about attention distribution during baby care",
        hero: "Kavi",
        heroWant: "get someone to notice the picture Kavi made",
        // F04 has no belief field; assumption is optional (present here)
        assumption: "The new baby has replaced me."
      }
    },
    expectedConstraintChecks: [
      { name: "INITIAL_RESPONSE.actor", check: "Mama (supporting character), not hero ✓" },
      { name: "REVEAL.actor", check: "Mama (supporting character), not hero ✓" },
      { name: "Passive-substitution exception", check: "Invoked with both conditions declared at CAST ✓" },
      { name: "Condition (a) CAUSATION", check: "Baby's presence causes assumption ✓" },
      { name: "Condition (b) DECLARED_AGENTIC_PROXY", check: "Mama declared as proxy correcting on baby's behalf ✓" },
      { name: "RESOLUTION actor pairing", check: "HERO + Mama, relational, both present ✓" },
      { name: "All required beats present", check: "6 beats: ENCOUNTER, INITIAL_RESPONSE, REVEAL, DEEPER_NOTICE, CHANGED_RESPONSE, RESOLUTION" }
    ]
  }
};

// ============================================================================
// TEST RUNNER
// ============================================================================

class RegressionTestRunner {
  constructor() {
    this.results = [];
  }

  run() {
    console.log("\n" + "=".repeat(80));
    console.log(
      "PHASE 7F REGRESSION TEST SUITE — Template QA Linter Validation"
    );
    console.log("=".repeat(80) + "\n");

    for (const [testKey, testCase] of Object.entries(TEST_CASES)) {
      this.runTest(testKey, testCase);
    }

    this.printSummary();
  }

  runTest(testKey, testCase) {
    const { situationId, templateId, title, storyPlan, expectedConstraintChecks } = testCase;

    console.log(
      `\n${"─".repeat(80)}`
    );
    console.log(`TEST: ${situationId} → ${templateId}`);
    console.log(`Title: ${title}`);
    console.log(`${"─".repeat(80)}`);

    // Run the linter
    const linter = new TemplateQaLinter(storyPlan);
    const report = linter.lint().getReport();

    const passed = report.valid;
    const status = passed ? "PASS" : "FAIL";

    console.log(`\nStatus: ${status}`);
    console.log(`Summary: ${report.summary}`);

    // Print constraint checks
    console.log(`\nExpected Constraint Checks:`);
    expectedConstraintChecks.forEach((check, i) => {
      console.log(`  ${i + 1}. ${check.name}`);
      console.log(`     → ${check.check}`);
    });

    // Print errors and warnings
    if (report.errors.length > 0) {
      console.log(`\nERRORS:`);
      report.errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    }

    if (report.warnings.length > 0) {
      console.log(`\nWARNINGS:`);
      report.warnings.forEach((warn, i) => {
        console.log(`  ${i + 1}. ${warn}`);
      });
    }

    this.results.push({
      testKey,
      situationId,
      templateId,
      title,
      passed,
      errors: report.errors,
      warnings: report.warnings
    });

    return passed;
  }

  printSummary() {
    console.log("\n" + "=".repeat(80));
    console.log("SUMMARY");
    console.log("=".repeat(80) + "\n");

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;

    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    console.log(`\nDetailed Results:\n`);
    this.results.forEach(r => {
      const status = r.passed ? "✓ PASS" : "✗ FAIL";
      console.log(`${status} | ${r.situationId} → ${r.templateId} | ${r.title}`);
      if (!r.passed) {
        console.log(`      Errors: ${r.errors.length}`);
        r.errors.forEach(err => {
          console.log(`        - ${err.substring(0, 70)}${err.length > 70 ? "..." : ""}`);
        });
      }
    });

    console.log(`\n${"=".repeat(80)}`);
    if (failed === 0) {
      console.log("ALL TESTS PASSED ✓");
      console.log(
        "Phase 7F template implementation is ready for Event Planner work."
      );
    } else {
      console.log(`${failed} TEST(S) FAILED ✗`);
      console.log("Root cause analysis required before proceeding.");
    }
    console.log(`${"=".repeat(80)}\n`);
  }
}

// ============================================================================
// MAIN
// ============================================================================

const runner = new RegressionTestRunner();
runner.run();
