/**
 * Template QA & Lint Layer for Prana Story Generator Phase 8
 *
 * Mechanically enforces structural constraints from the locked 7F template specs.
 * Used to validate story plans against template structural requirements.
 */

// ============================================================================
// STRUCTURAL CONSTRAINT DEFINITIONS (from 7F locked specs)
// ============================================================================

const DISRUPTION_CATEGORIES = {
  SENSORY: "physical/environmental input (touch, sight, sound, smell)",
  SOCIAL: "another person's action, word, or absence",
  LOGISTICAL: "plan/schedule/mechanism breaking, non-social, non-bodily",
  EMOTIONAL_INTERNAL: "disruption from hero's anticipation, worry, or imagination",
  PHYSICAL_SAFETY: "hero's body or immediate physical safety/exertion (hazard, strain, fatigue)"
};

const EVIDENCE_SOURCES = ["HERO_DIRECT_OBSERVATION", "HERO_DIRECT_TEST", "HERO_DIRECT_EXPERIENCE"];

// ============================================================================
// LINTER RULES
// ============================================================================

class TemplateQaLinter {
  constructor(storyPlan) {
    this.plan = storyPlan;
    this.errors = [];
    this.warnings = [];
  }

  lint() {
    // Dispatch to template-specific linters based on templateId
    if (!this.plan.templateId) {
      this.errors.push("No templateId found in story plan");
      return this;
    }

    switch (this.plan.templateId) {
      case "T03":
        this.lintT03_ThreeTries();
        break;
      case "T16":
        this.lintT16_TwoWaysToSeeit();
        break;
      case "T21":
        this.lintT21_TheDisruptedPlan();
        break;
      case "T22":
        this.lintT22_TheReframeTrail();
        break;
      case "T23":
        this.lintT23_TheAssumptionBridge();
        break;
      default:
        // Other templates don't have new constraints in this revision
        break;
    }

    // Check for no-hard-belief-requirement on new/edited templates
    if (["T03", "T16", "T21", "T22", "T23"].includes(this.plan.templateId)) {
      this.lintNoHardBeliefRequirement();
    }

    return this;
  }

  // ========================================================================
  // T03: THREE TRIES
  // ========================================================================

  lintT03_ThreeTries() {
    const beats = this.plan.eventChain || [];
    const openingState = this.plan.openingState || {};

    // Extract pre-story attempts from OPENING STATE
    const preStoryAttempts = this._extractPreStoryAttempts(openingState.situation || "");

    // Find ATTEMPT beats
    const attempts = beats.filter(b => b.label && b.label.includes("ATTEMPT"));

    if (attempts.length < 3) {
      this.warnings.push("T03 expects 3 ATTEMPT beats; found " + attempts.length);
    }

    // Verify each ATTEMPT differs from pre-story attempts and from each other
    const attemptMethods = [];

    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i];
      const method = this._extractAttemptMethod(attempt.action || "");

      if (!method) {
        this.warnings.push(`ATTEMPT_${i + 1} has no clearly identifiable method`);
        continue;
      }

      // Check against pre-story attempts
      for (const preMethod of preStoryAttempts) {
        if (this._areMethodsIdentical(method, preMethod)) {
          this.errors.push(
            `ATTEMPT_${i + 1} appears to be a repeat of a pre-story attempt ` +
            `(both use method: "${preMethod}"). Per fixed variationRule, ATTEMPT_${i + 1} ` +
            `must differ from pre-story attempts.`
          );
        }
      }

      // Check against other attempts (original rule)
      for (let j = 0; j < attemptMethods.length; j++) {
        if (this._areMethodsIdentical(method, attemptMethods[j])) {
          this.errors.push(
            `ATTEMPT_${i + 1} (method: "${method}") is identical to ATTEMPT_${j + 1} ` +
            `(method: "${attemptMethods[j]}"). All three attempts must use genuinely different methods.`
          );
        }
      }

      attemptMethods.push(method);
    }
  }

  _extractPreStoryAttempts(situationText) {
    // Heuristic extraction: look for references to prior failed attempts
    // This is approximate and depends on clear narrative structure
    const attempts = [];

    // Look for patterns like "Kavi has redone the same problem twice already"
    const matchAlready = situationText.match(/redone|tried|attempted|failed.*(\d+).*times?/i);
    if (matchAlready) {
      // Mark as "prior attempt found" without specific method
      attempts.push("prior_attempt_identified");
    }

    return attempts;
  }

  _extractAttemptMethod(actionText) {
    // Extract the core verb/method from action description
    // Examples: "Kavi draws the problem as a picture" → "drawing"
    if (!actionText) return null;

    const verbPatterns = [
      /(?:redraw|draw|create|sketch|visualiz)/i,
      /(?:recalculat|compute|calculate|arithmetic|numeric|recompute)/i,
      /(?:explain|tell|speak|verbali|say out loud)/i,
      /(?:decompos|break down|split|separate|isolat)/i,
      /(?:ask|question|inquire|request)/i,
      /(?:wait|observe|watch|notice|look|see)/i
    ];

    for (const pattern of verbPatterns) {
      if (pattern.test(actionText)) {
        return actionText.substring(0, 50); // Return action snippet for comparison
      }
    }

    return actionText.substring(0, 30); // Fallback: return first 30 chars
  }

  _areMethodsIdentical(method1, method2) {
    if (!method1 || !method2) return false;
    // Fuzzy matching: if both methods are similar enough, they're identical
    return method1.toLowerCase().includes(method2.toLowerCase().substring(0, 10)) ||
           method2.toLowerCase().includes(method1.toLowerCase().substring(0, 10));
  }

  // ========================================================================
  // T16: TWO WAYS TO SEE IT
  // ========================================================================

  lintT16_TwoWaysToSeeit() {
    const beats = this.plan.eventChain || [];

    // Find INTERPRETATION and EVIDENCE_GATHERING beats
    const interpretation1Beat = beats.find(b => b.label && b.label.includes("INTERPRETATION_1"));
    const interpretation2Beat = beats.find(b => b.label && b.label.includes("INTERPRETATION_2"));
    const evidenceGatheringBeat = beats.find(b => b.label && b.label.includes("EVIDENCE_GATHERING"));

    // Check evidenceCited exists on both interpretations
    if (!interpretation1Beat?.evidenceCited) {
      this.errors.push("T16 INTERPRETATION_1 missing required evidenceCited field");
    }
    if (!interpretation2Beat?.evidenceCited) {
      this.errors.push("T16 INTERPRETATION_2 missing required evidenceCited field");
    }

    // Weight parity rule
    const count1 = interpretation1Beat?.evidenceCited?.length || 0;
    const count2 = interpretation2Beat?.evidenceCited?.length || 0;

    if (count1 > 0 && count2 > 0 && count2 < count1) {
      this.errors.push(
        `T16 weight-parity rule violated: INTERPRETATION_2.evidenceCited (${count2} items) ` +
        `must have at least as many items as INTERPRETATION_1.evidenceCited (${count1} items). ` +
        `A single generic reassurance outweighing multi-fact false impression is not weight parity.`
      );
    }

    // Check evidenceSource enum
    if (evidenceGatheringBeat?.evidenceSource) {
      if (!EVIDENCE_SOURCES.includes(evidenceGatheringBeat.evidenceSource)) {
        this.errors.push(
          `T16 EVIDENCE_GATHERING evidenceSource must be one of: ${EVIDENCE_SOURCES.join(", ")}. ` +
          `Got: "${evidenceGatheringBeat.evidenceSource}". Evidence cannot be handed to the hero by another character.`
        );
      }
    } else {
      this.warnings.push("T16 EVIDENCE_GATHERING missing evidenceSource field");
    }

    // Check contradictionMoment exists and has materiality
    if (!evidenceGatheringBeat?.contradictionMoment) {
      this.errors.push("T16 EVIDENCE_GATHERING missing required contradictionMoment field");
    } else if (typeof evidenceGatheringBeat.contradictionMoment === "string" &&
               evidenceGatheringBeat.contradictionMoment.length < 20) {
      this.warnings.push(
        "T16 contradictionMoment seems too brief to be material. " +
        "Must be substantial enough to plausibly threaten INTERPRETATION_1, not trivial/incidental."
      );
    }

    // Check reassessmentIsHeroOwned
    if (evidenceGatheringBeat?.reassessmentIsHeroOwned !== true) {
      this.errors.push(
        "T16 EVIDENCE_GATHERING reassessmentIsHeroOwned must be true. " +
        "Hero's reassessment must come from their own contradiction, not a statement from another character."
      );
    }
  }

  // ========================================================================
  // T21: THE DISRUPTED PLAN
  // ========================================================================

  lintT21_TheDisruptedPlan() {
    const beats = this.plan.eventChain || [];

    // Find DISRUPTION beats
    const disruptions = beats.filter(b => b.label && b.label.includes("DISRUPTION"));

    if (disruptions.length < 2) {
      this.errors.push("T21 requires exactly 2 DISRUPTION beats; found " + disruptions.length);
      return;
    }

    // Check disruptionCategory on first two DISRUPTION beats
    const d1 = disruptions[0];
    const d2 = disruptions[1];

    if (!d1.disruptionCategory || !Object.keys(DISRUPTION_CATEGORIES).includes(d1.disruptionCategory)) {
      this.errors.push(
        `T21 DISRUPTION_1 missing or invalid disruptionCategory. ` +
        `Must be one of: ${Object.keys(DISRUPTION_CATEGORIES).join(", ")}`
      );
    }

    if (!d2.disruptionCategory || !Object.keys(DISRUPTION_CATEGORIES).includes(d2.disruptionCategory)) {
      this.errors.push(
        `T21 DISRUPTION_2 missing or invalid disruptionCategory. ` +
        `Must be one of: ${Object.keys(DISRUPTION_CATEGORIES).join(", ")}`
      );
    }

    // Enforce category-level difference
    if (d1.disruptionCategory && d2.disruptionCategory &&
        d1.disruptionCategory === d2.disruptionCategory) {
      this.errors.push(
        `T21 category-level difference rule violated: DISRUPTION_1 and DISRUPTION_2 ` +
        `must have DIFFERENT disruptionCategory values. Both are: "${d1.disruptionCategory}". ` +
        `Two same-category disruptions (e.g., two SENSORY events) do not satisfy the rule, ` +
        `even if they have different surface descriptions.`
      );
    }
  }

  // ========================================================================
  // T22: THE REFRAME TRAIL
  // ========================================================================

  lintT22_TheReframeTrail() {
    const beats = this.plan.eventChain || [];
    const connectedDiscoveryBeat = beats.find(b => b.label && b.label.includes("CONNECTED_DISCOVERY"));

    if (!connectedDiscoveryBeat) {
      this.errors.push("T22 CONNECTED_DISCOVERY beat not found in eventChain");
      return;
    }

    // Check reinterpretationFocus: "object"
    if (connectedDiscoveryBeat.reinterpretationFocus !== "object") {
      this.errors.push(
        "T22 CONNECTED_DISCOVERY must have reinterpretationFocus: 'object'. " +
        "Reinterpretation must focus on what the object/pattern/situation reveals, " +
        "not on a newly-identified person's feelings or interiority."
      );
    }

    // Check grammatical subject of reinterpretation
    const reinterpretation = connectedDiscoveryBeat.reinterpretation || "";
    if (reinterpretation) {
      const personPhrases = [
        "feeling", "felt", "wanting", "wanted", "needs", "need",
        "loves", "loved", "cares", "caring", "worried", "fear", "afraid",
        "emotion", "emotional", "relationship", "friendship", "hope", "despair"
      ];

      const hasPerson = personPhrases.some(phrase =>
        reinterpretation.toLowerCase().includes(phrase)
      );

      if (hasPerson && reinterpretation.length > 100) {
        this.warnings.push(
          "T22 CONNECTED_DISCOVERY reinterpretation may be drifting toward person/relationship language. " +
          "Checkable test: Is the grammatical subject the object/pattern/situation, or is it a person's experience? " +
          "Only object-as-subject passes."
        );
      }
    }
  }

  // ========================================================================
  // T23: THE ASSUMPTION BRIDGE
  // ========================================================================

  lintT23_TheAssumptionBridge() {
    const initialResponse = this.plan.initialResponse || {};
    const reveal = this.plan.reveal || {};
    const cast = this.plan.cast || {};
    const resolution = this.plan.resolution || {};

    // Hard actor rule: INITIAL_RESPONSE actor must be supporting character
    if (initialResponse.actor && initialResponse.actor.toLowerCase() === "hero") {
      this.errors.push(
        "T23 INITIAL_RESPONSE hard actor rule violated: actor must be the supporting character, never the hero."
      );
    }

    // Hard actor rule: REVEAL actor must be supporting character
    if (reveal.actor && reveal.actor.toLowerCase() === "hero") {
      this.errors.push(
        "T23 REVEAL hard actor rule violated: actor must be the supporting character, never the hero. " +
        "The correction must come from the other character's own action or admission, not from the hero figuring it out."
      );
    }

    // Check passive-substitution exception if applicable
    this._checkT23PassiveSubstitutionException(cast, initialResponse, reveal);

    // Check RESOLUTION actor pairing
    if (resolution.actor && !resolution.actor.includes("HERO") && !resolution.actor.includes("supporting")) {
      this.warnings.push(
        "T23 RESOLUTION should show actor pairing (HERO + supporting character), " +
        "not hero-only internal realization. Current actor: " + resolution.actor
      );
    }
  }

  _checkT23PassiveSubstitutionException(cast, initialResponse, reveal) {
    // If exception is being invoked, check both conditions are declared at CAST stage

    // Look for passive character in cast
    const supportingChars = cast.supportingCharacters || [];
    const passiveChar = supportingChars.find(sc =>
      sc.narrativeFunction && sc.narrativeFunction.includes("passive")
    );

    if (passiveChar) {
      // Exception may be in play; check both conditions
      const hasCAUSATION = supportingChars.some(sc =>
        sc.narrativeFunction && sc.narrativeFunction.includes("CAUSATION")
      );

      const hasDECLARED_AGENTIC_PROXY = supportingChars.some(sc =>
        sc.narrativeFunction && (
          sc.narrativeFunction.includes("on the") && sc.narrativeFunction.includes("behalf")
        )
      );

      if (!hasCAUSATION) {
        this.errors.push(
          "T23 passive-substitution exception condition (a) CAUSATION not declared at CAST stage. " +
          "Exception requires explicit declaration that the passive character genuinely CAUSES the situation."
        );
      }

      if (!hasDECLARED_AGENTIC_PROXY) {
        this.errors.push(
          "T23 passive-substitution exception condition (b) DECLARED_AGENTIC_PROXY not found at CAST stage. " +
          "Exception requires explicit identification of agentic character correcting ON THE PASSIVE CHARACTER'S BEHALF."
        );
      }
    }
  }

  // ========================================================================
  // NO-HARD-BELIEF-REQUIREMENT LINT RULE
  // ========================================================================

  lintNoHardBeliefRequirement() {
    // For new/edited templates (T03/T16/T21/T22/T23), check that
    // belief.falseBelief and belief.trueBelief are not required

    const blueprint = this.plan.blueprint || {};
    const belief = blueprint.belief || {};

    // These templates should have no hard belief requirement:
    // - T21: no belief field (F05)
    // - T22: no belief field (F02)
    // - T23: no belief field (F04), only optional assumption

    // T03 and T16 are legacy and may still reference belief for compatibility

    if (["T21", "T22", "T23"].includes(this.plan.templateId)) {
      if (belief.falseBelief !== undefined || belief.trueBelief !== undefined) {
        this.warnings.push(
          `${this.plan.templateId} is designed to not require belief fields. ` +
          `Found belief.falseBelief or belief.trueBelief in this plan. ` +
          `This may be legacy data; ensure it's not actually required for the story to work.`
        );
      }
    }
  }

  // ========================================================================
  // RESULT ACCESSORS
  // ========================================================================

  isValid() {
    return this.errors.length === 0;
  }

  getReport() {
    return {
      valid: this.isValid(),
      templateId: this.plan.templateId,
      errors: this.errors,
      warnings: this.warnings,
      summary: `${this.errors.length} error(s), ${this.warnings.length} warning(s)`
    };
  }

  printReport() {
    const report = this.getReport();
    console.log(`\n=== T${this.plan.templateId} QA Report ===`);
    console.log(`Status: ${report.valid ? "PASS" : "FAIL"}`);
    console.log(`Summary: ${report.summary}\n`);

    if (this.errors.length > 0) {
      console.log("ERRORS:");
      this.errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
      console.log();
    }

    if (this.warnings.length > 0) {
      console.log("WARNINGS:");
      this.warnings.forEach((warn, i) => {
        console.log(`  ${i + 1}. ${warn}`);
      });
      console.log();
    }

    return report;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { TemplateQaLinter, DISRUPTION_CATEGORIES, EVIDENCE_SOURCES };
