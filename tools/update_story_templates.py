#!/usr/bin/env python3
"""
Update storyTemplates.json with T03/T16 fixes and add T21/T22/T23.
Run this script to apply the locked 7F template architecture to the JSON.
"""

import json
from pathlib import Path

TEMPLATES_FILE = Path("public/prana-story-generator/phase8-data/storyTemplates.json")

# Load current templates
with open(TEMPLATES_FILE) as f:
    templates = json.load(f)

# Find and update T03
for t in templates:
    if t["templateId"] == "T03":
        t["repetitionPattern"]["variationRule"] = (
            "Each of ATTEMPT_1, ATTEMPT_2, ATTEMPT_3 must use a genuinely different action verb/approach "
            "from the other two AND from any pre-story attempt(s) named in OPENING STATE.situation — "
            "a reworded, slower, or more careful repeat of a method OPENING STATE already shows failing "
            "does not count as a new attempt, even if it is ATTEMPT_1's first appearance in the EVENT CHAIN itself."
        )
        print("[OK] Updated T03 variationRule")
        break

# Find and update T16
for t in templates:
    if t["templateId"] == "T16":
        # Add structural constraints to INTERPRETATION_1
        t["sceneStructure"][1] = (
            "Interpretation 1: hero reads the event through the false belief, and reacts accordingly. "
            "This interpretation is supported by concrete, specific evidence (evidenceCited field)."
        )

        # Add structural constraints to INTERPRETATION_2
        t["sceneStructure"][3] = (
            "Interpretation 2: new evidence reframes the same event through the true belief. "
            "Evidence supporting this interpretation must be comparable in weight/specificity to Interpretation 1 (weight-parity rule)."
        )

        # Add new fields to sceneStructure description for EVIDENCE_GATHERING
        t["sceneStructure"][2] = (
            "Evidence gathering: hero, prompted by consequence or curiosity, actively investigates (observation, test, or experience). "
            "The hero must personally discover the contradiction; evidence cannot be handed to the hero by another character. "
            "The contradiction discovered must be material — substantial enough to genuinely threaten Interpretation 1, not trivial or incidental."
        )

        # Add new fields to the template
        t["T16_structuralConstraints"] = {
            "INTERPRETATION_1": {
                "evidenceCited": {
                    "type": "array",
                    "minItems": 1,
                    "description": "Concrete, specific fact(s) that make the false-belief reading genuinely plausible in the moment, not a strawman. Must be grounded in OPENING STATE/EVENT content, not merely asserted anxiety."
                }
            },
            "INTERPRETATION_2": {
                "evidenceCited": {
                    "type": "array",
                    "minItems": 1,
                    "description": "Concrete fact(s) supporting the true-belief reading.",
                    "weightParityRule": "INTERPRETATION_2.evidenceCited must be at least as numerous/specific as INTERPRETATION_1.evidenceCited"
                }
            },
            "EVIDENCE_GATHERING": {
                "evidenceSource": {
                    "type": "enum",
                    "validValues": ["HERO_DIRECT_OBSERVATION", "HERO_DIRECT_TEST", "HERO_DIRECT_EXPERIENCE"],
                    "invalidValues": ["OTHER_CHARACTER_STATEMENT", "OTHER_CHARACTER_EXPLANATION"],
                    "description": "Hero must discover evidence directly, not receive it handed from another character"
                },
                "contradictionMoment": {
                    "type": "string",
                    "required": True,
                    "description": "Names the SPECIFIC observable event where hero encounters something that doesn't match INTERPRETATION_1",
                    "materialityRule": "Must be substantial enough to plausibly cause reconsideration of INTERPRETATION_1, not trivially small or incidental. Checkable test: could a reasonable reader see this as a real reason to reconsider INTERPRETATION_1?"
                },
                "reassessmentIsHeroOwned": {
                    "type": "boolean",
                    "requiredValue": True,
                    "description": "Hero's reassessment must come from their own contradictionMoment, not a statement from another character"
                }
            }
        }
        print("[OK] Updated T16 with structural constraints")
        break

# Add T21 "The Disrupted Plan"
t21 = {
    "templateId": "T21",
    "name": "The Disrupted Plan",
    "storyMechanic": "A hero's explicit plan is disrupted twice, in different ways; attempts to restore it fail, and an adapted plan emerges instead.",
    "bestForNeeds": ["NEED_ADAPTABILITY", "NEED_RESILIENCE"],
    "bestForSituations": [],
    "bestForLogicFamilies": ["LOGIC_THRESHOLD_CROSSING"],
    "requiredBeats": ["EXPECTATION", "DISRUPTION_1", "REACTION", "DISRUPTION_2", "RESTORE_ATTEMPT", "RESTORE_FAILS", "ADAPTATION_RESOLUTION"],
    "sceneStructure": [
        "Expectation: the explicit, stated plan (F05's OPENING STATE.plan, verbatim).",
        "Disruption 1: first external, plan-breaking event; establishes a KIND of disruption (see disruptionCategory).",
        "Reaction: hero's first coping response, in service of keeping the plan alive.",
        "Disruption 2: second external, plan-breaking event; MUST differ in KIND from DISRUPTION_1 (different disruptionCategory value).",
        "Restore attempt: a genuine, real attempt to keep/recover the original plan (not a token gesture); often co-acted with supporting character if present.",
        "Restore fails: the attempt genuinely fails; the original plan is confirmed unsurvivable as designed.",
        "Adaptation/Resolution: a materially different, adapted plan emerges and is shown resolving, never narrated as a moral."
    ],
    "repetitionPattern": None,
    "repetitionNote": "T21's device is the disruption CATEGORY difference, not phrase repetition — DISRUPTION_1 and DISRUPTION_2 must be mechanically verified as different category values.",
    "escalationPattern": "Escalation is cumulative — first disruption is manageable alone; second disruption combines with first to overwhelm the original plan.",
    "turningPoint": "The restore-attempt failure, where the hero realizes the original plan is not recoverable.",
    "resolutionPattern": "Resolution shows the adapted plan in action, materially different from the original, and working where the original plan failed.",
    "requiredBlueprintSlots": ["situation", "hero", "plan", "DISRUPTION_1.disruptionCategory", "DISRUPTION_1.action", "DISRUPTION_1.newInformationOrShift", "REACTION.action", "DISRUPTION_2.disruptionCategory", "DISRUPTION_2.action", "DISRUPTION_2.newInformationOrShift", "RESTORE_ATTEMPT.action", "RESTORE_FAILS.action", "resolution"],
    "optionalBlueprintSlots": ["world", "supportingCharacter"],
    "symbolIntegrationPoint": "Symbol appears at the ADAPTATION beat — it is what the hero carries forward into the new plan.",
    "illustrationOpportunities": [
        "The original plan, stated clearly",
        "First disruption breaking the plan",
        "Hero's reaction, trying to push through",
        "Second disruption arriving, combining with the first",
        "The restore attempt, genuine effort",
        "Moment of failure, plan's unsuitability confirmed",
        "Adaptation emerging, new plan shown working"
    ],
    "pageRhythmGuidance": "Let the two disruptions breathe on separate pages; the restore-attempt and restore-fails should read as a paired effort-and-failure sequence; give the adaptation page room to show the new plan working distinctly.",
    "exampleSkeleton": ["[HERO] + [SITUATION] + [EXPECTATION]", "[DISRUPTION_1: category X]", "[REACTION]", "[DISRUPTION_2: category Y, Y≠X]", "[RESTORE_ATTEMPT]", "[RESTORE_FAILS]", "[ADAPTATION/RESOLUTION]", "[SYMBOL]"],
    "T21_structuralConstraints": {
        "disruptionCategory": {
            "type": "enum",
            "validValues": ["SENSORY", "SOCIAL", "LOGISTICAL", "EMOTIONAL_INTERNAL", "PHYSICAL_SAFETY"],
            "description": "Five mutually distinguishable disruption shapes grounded in real childExperience data. DISRUPTION_1 and DISRUPTION_2 must have DIFFERENT category values (category-level difference, not same-category with different surface description)."
        }
    }
}
templates.append(t21)
print("[OK] Added T21 'The Disrupted Plan'")

# Add T22 "The Reframe Trail"
t22 = {
    "templateId": "T22",
    "name": "The Reframe Trail",
    "storyMechanic": "A chain of re-interpretations where each discovery leads the hero to understand what the previous discovery now means — three escalating reframings until accumulated discoveries reveal something invisible from any single one of them.",
    "bestForNeeds": ["NEED_CURIOSITY", "NEED_PATIENCE"],
    "bestForSituations": [],
    "bestForLogicFamilies": ["LOGIC_CUMULATIVE_BUILD"],
    "requiredBeats": ["NOTICE", "INVESTIGATE", "DISCOVER", "CONNECTED_DISCOVERY", "NEW_CHOICE", "RESOLUTION"],
    "sceneStructure": [
        "Notice: hero's attention shifts from 'not my concern' to 'look closer.' Establishes the ordinary, easy-to-walk-past starting point.",
        "Investigate: hero takes one small active step (crouches, looks again, asks) and finds there's more here than the first glance showed. First reinterpretation: the initial beat wasn't isolated.",
        "Discover: a specific, escalating piece of information arrives (a pattern, an identity, a location). Second reinterpretation: accumulated NOTICE+INVESTIGATE point toward something concrete, not just 'more of the same.'",
        "Connected discovery: NOTICE/INVESTIGATE/DISCOVER, taken together, are shown to add up to something invisible from any single one of them (an effect, a person, a scale). Third and final reinterpretation. This is the template's turning point.",
        "New choice: hero acts differently than they would have at NOTICE — the discovery is now acted on, not just understood.",
        "Resolution: what's concretely different now, shown not summarized. Must stay about the object/mystery/situation, not about a newly-identified person's feelings or relationships."
    ],
    "repetitionPattern": {
        "phrase/source": "Implicit in the reinterpretation device: each slot after NOTICE is defined by what the previous slot is now understood to mean",
        "occurrenceCount": 3,
        "occurrenceStages": ["INVESTIGATE", "DISCOVER", "CONNECTED_DISCOVERY"],
        "variationRule": "Each slot must state 'NOTICE wasn't isolated' (INVESTIGATE) / 'this is bigger than INVESTIGATE suggested' (DISCOVER) / 'all three together mean something none meant alone' (CONNECTED_DISCOVERY) — reinterpretation, not just additional facts",
        "finalVariation": "CONNECTED_DISCOVERY is the turning point where all three together reveal the invisible meaning"
    },
    "escalationPattern": "Escalation is specificity — from 'something here to notice' to 'a pattern' to 'what the pattern means together.'",
    "turningPoint": "Placed at CONNECTED_DISCOVERY — the hard turning-point slot where all three accumulated discoveries mean something none meant alone.",
    "resolutionPattern": "The payoff is about what was discovered (the object/mystery/situation). If a person is discovered, state the bare fact they're now identifiable/findable, but never characterize that person's feelings, interiority, or relationship to the hero — those belong only in a single-sentence factual reaction in RESOLUTION, if at all.",
    "requiredBlueprintSlots": ["situation", "hero", "heroWant", "NOTICE.action", "NOTICE.newInformationOrShift", "INVESTIGATE.action", "INVESTIGATE.newInformationOrShift", "DISCOVER.action", "DISCOVER.newInformationOrShift", "CONNECTED_DISCOVERY.action", "CONNECTED_DISCOVERY.newInformationOrShift", "newChoiceAction", "resolution"],
    "optionalBlueprintSlots": ["world", "supportingCharacter"],
    "symbolIntegrationPoint": "Symbol appears subtly at DISCOVER or CONNECTED_DISCOVERY, pointing toward the reinterpretation.",
    "illustrationOpportunities": [
        "NOTICE: the overlooked starting point",
        "INVESTIGATE: something more is revealed",
        "DISCOVER: specificity emerges",
        "CONNECTED_DISCOVERY: all three together create new meaning",
        "NEW_CHOICE: hero acts on the discovery",
        "RESOLUTION: the concrete difference, shown"
    ],
    "pageRhythmGuidance": "Each slot should build momentum toward CONNECTED_DISCOVERY; give that turning-point page space to breathe; NEW_CHOICE and RESOLUTION can breathe together or on separate pages.",
    "exampleSkeleton": ["[HERO] + [SITUATION] + [NOTICE]", "[INVESTIGATE: reinterpretation 1]", "[DISCOVER: reinterpretation 2]", "[CONNECTED_DISCOVERY: reinterpretation 3]", "[NEW_CHOICE]", "[RESOLUTION]"],
    "T22_structuralConstraints": {
        "CONNECTED_DISCOVERY": {
            "reinterpretationFocus": {
                "type": "enum",
                "requiredValue": "object",
                "description": "Reinterpretation must state what the accumulated discoveries NOW REVEAL about the OBJECT/SITUATION/PATTERN. Grammatical subject must be object/pattern, not a person's experience. Checkable test: does the reinterpretation have object/pattern as grammatical subject, or does it have a person's inner experience as subject? Only the former passes."
            },
            "resolutionPatternNote": "If the discovery leads to identifying a specific person, state the bare fact they're now identifiable/findable, but any warmth, relational framing, or emotional interiority about that person belongs only in RESOLUTION as a single-sentence factual reaction. If that person is given interiority or relational weight here, the story has drifted into F04."
        }
    }
}
templates.append(t22)
print("[OK] Added T22 'The Reframe Trail'")

# Add T23 "The Assumption Bridge"
t23 = {
    "templateId": "T23",
    "name": "The Assumption Bridge",
    "storyMechanic": "Hero acts on an assumption about another character's want or state; the other character's real response doesn't match what was assumed, and the other character themselves reveal what's actually true — building a bridge across the gap between assumption and reality.",
    "bestForNeeds": ["NEED_COMPASSION", "NEED_RESPECT"],
    "bestForSituations": [],
    "bestForLogicFamilies": ["LOGIC_PERSPECTIVE_SHIFT"],
    "requiredBeats": ["ENCOUNTER", "INITIAL_RESPONSE", "REVEAL", "DEEPER_NOTICE", "CHANGED_RESPONSE", "RESOLUTION"],
    "sceneStructure": [
        "Encounter: hero acts on an assumption about the other character (from OPENING STATE.assumption, when present) — this is the hero closing distance, not just observing it.",
        "Initial response: the other character's real response doesn't match what the hero's assumption predicted. ACTOR MUST BE THE SUPPORTING CHARACTER, never the hero.",
        "Reveal: the other character's own action or admission corrects the hero's understanding. This is the one non-negotiable structural rule: the correction must come from the other character, never from the hero figuring it out alone. ACTOR MUST BE THE SUPPORTING CHARACTER. (EXCEPTION: sanctioned passive-character substitution, see notes below.)",
        "Deeper notice: hero integrates what REVEAL just supplied and understands what the other character actually needs/feels/means, distinct from what was assumed.",
        "Changed response: hero acts differently, concretely, based on DEEPER_NOTICE — never narrated as 'hero learned that...'",
        "Resolution: shown through both characters together (talking normally, sitting together, relationally demonstrated), not through the hero's internal realization alone."
    ],
    "repetitionPattern": None,
    "repetitionNote": "T23 is a single-encounter template — its power depends on one clear assumption-reveal-recalibration arc, not multiple encounters.",
    "escalationPattern": "Escalation is in how genuinely plausible the hero's assumption is — it must feel like a real possibility in the moment, not a strawman.",
    "turningPoint": "REVEAL is the hard turning-point-triggering slot; DEEPER_NOTICE carries the actual turning-point statement (hero's understanding turns here).",
    "resolutionPattern": "Resolution is relational — shown through both hero and supporting character together, not hero-only internal realization.",
    "requiredBlueprintSlots": ["situation", "hero", "heroWant", "supportingCharacter.want", "ENCOUNTER.action", "INITIAL_RESPONSE.action", "INITIAL_RESPONSE.newInformationOrShift", "REVEAL.action", "REVEAL.newInformationOrShift", "DEEPER_NOTICE.action", "CHANGED_RESPONSE.action", "resolution"],
    "optionalBlueprintSlots": ["assumption", "world"],
    "symbolIntegrationPoint": "Symbol appears during REVEAL or DEEPER_NOTICE, present as a quiet influence on the corrected understanding.",
    "illustrationOpportunities": [
        "ENCOUNTER: hero approaching with assumed expectation",
        "INITIAL_RESPONSE: supporting character's real response, not matching assumption",
        "REVEAL: supporting character's own admission or action",
        "DEEPER_NOTICE: hero's realization, visually shown",
        "CHANGED_RESPONSE: hero acting differently",
        "RESOLUTION: both characters together, relationally"
    ],
    "pageRhythmGuidance": "Give ENCOUNTER and INITIAL_RESPONSE matched weight so the assumption-and-contradiction feels clean; let REVEAL breathe; give RESOLUTION space to show both characters present.",
    "exampleSkeleton": ["[HERO] + [SITUATION] + [ASSUMPTION]", "[ENCOUNTER]", "[INITIAL_RESPONSE]", "[REVEAL]", "[DEEPER_NOTICE]", "[CHANGED_RESPONSE]", "[RESOLUTION: both characters]"],
    "T23_structuralConstraints": {
        "hardActorRule": {
            "INITIAL_RESPONSE": "actor must be the supporting character, never the hero",
            "REVEAL": "actor must be the supporting character, never the hero — the other character's own action/admission is what corrects the assumption"
        },
        "sanctionedPassiveSubstitutionException": {
            "description": "When assumption's grammatical subject is a non-agentic/passive supporting character, REVEAL may be carried by a DIFFERENT, agentic supporting character ONLY when BOTH conditions are true AND both are declared at CAST stage (before event planning, not improvised later):",
            "condition_a_CAUSATION": "The passive character genuinely CAUSES the situation (their existence/presence/action is the actual originating cause of the hero's assumption, not merely 'present while it happens')",
            "condition_b_DECLARED_AGENTIC_PROXY": "An explicitly identified agentic supporting character's CAST entry states they correct the assumption ON THE PASSIVE CHARACTER'S BEHALF (not generically 'carries the reveal' — must name the passive character and the on-behalf-of relationship)",
            "consequence": "If plan does not declare both (a) and (b) at the CAST step, this exception does not apply and T23 is not eligible for that plan. Exception must never be read as 'any convenient supporting character may stand in' — it is narrow, requires both conditions, and requires CAST-level declaration before event planning."
        },
        "RESOLUTION": {
            "actorPairing": "Required: HERO + supporting character. Must show both characters present and relationally demonstrated, not hero-only internal realization."
        }
    }
}
templates.append(t23)
print("[OK] Added T23 'The Assumption Bridge'")

# Write back the updated templates
with open(TEMPLATES_FILE, 'w') as f:
    json.dump(templates, f, indent=2)

print(f"\n[OK] Updated {TEMPLATES_FILE} with T03/T16 fixes and T21/T22/T23")
print(f"Total templates: {len(templates)}")
print(f"Templates present: {', '.join([t['templateId'] for t in templates])}")
