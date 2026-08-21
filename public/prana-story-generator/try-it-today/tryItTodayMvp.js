import printableTemplateLibrary from "./printableTemplateLibrary.json" with { type: "json" };

const ACTIVITY_MODES = [
  {
    family: "calm",
    primary_skill: "attention",
    players: "solo",
    mechanic: "mindful filtering",
    emotional_payoff: "inner clarity",
  },
  {
    family: "play",
    primary_skill: "discernment",
    players: "solo_or_pair",
    mechanic: "fast sorting game",
    emotional_payoff: "lighthearted mastery",
  },
  {
    family: "notice",
    primary_skill: "sensory awareness",
    players: "solo",
    mechanic: "real-world sound hunt",
    emotional_payoff: "curious noticing",
  },
  {
    family: "talk",
    primary_skill: "communication",
    players: "pair_or_family",
    mechanic: "turn-taking conversation",
    emotional_payoff: "feeling heard",
  },
  {
    family: "make",
    primary_skill: "creative expression",
    players: "solo_or_pair",
    mechanic: "hands-on creation",
    emotional_payoff: "creative ownership",
  },
  {
    family: "action",
    primary_skill: "real-life transfer",
    players: "solo",
    mechanic: "small daily action",
    emotional_payoff: "confident follow-through",
  },
];

const PRINTABLE_REQUIRED_TEMPLATE_IDS = new Set(["PT02", "PT03", "PT04", "PT05", "PT08", "PT09", "PT10"]);
const PRINTABLE_TEMPLATE_IDS = new Set(printableTemplateLibrary.map((template) => template.id));
const APPROVAL_STATUSES = {
  APPROVED: "APPROVED",
  NEEDS_REVIEW: "NEEDS_REVIEW",
};

function assertNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string.`);
  }
}

function slugifyToken(value) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildActivityId(themeSymbol, index) {
  const token = slugifyToken(themeSymbol).slice(0, 3) || "SYM";
  return `TIT-${token}-${String(index + 1).padStart(3, "0")}`;
}

export function validateGenerationInput(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Generation input must be an object.");
  }

  assertNonEmptyString(input.theme_id, "theme_id");
  assertNonEmptyString(input.symbol, "symbol");
  assertNonEmptyString(input.meaning, "meaning");
  assertNonEmptyString(input.belief, "belief");

  if (!Number.isInteger(input.activity_count) || input.activity_count < 1 || input.activity_count > ACTIVITY_MODES.length) {
    throw new Error(`activity_count must be an integer between 1 and ${ACTIVITY_MODES.length}.`);
  }

  return true;
}

export function buildGenerationPrompt(input) {
  validateGenerationInput(input);

  return {
    systemPromptPath: "public/prana-story-generator/try-it-today/coreSystemPrompt.txt",
    userPayload: {
      theme_id: input.theme_id,
      symbol: input.symbol,
      meaning: input.meaning,
      belief: input.belief,
      activity_count: input.activity_count,
      required_variety_modes: ACTIVITY_MODES.slice(0, input.activity_count).map((mode) => mode.family),
      printable_template_ids: printableTemplateLibrary.map((template) => template.id),
      critical_rules: [
        "Do not invent or rewrite the locked symbol meaning.",
        "Do not invent or rewrite the locked belief.",
        "Return distinct experiences, not superficial variations.",
        "Use a printable only when removing it makes the activity meaningfully worse.",
      ],
    },
  };
}

export function createActivityBatchSkeleton(input) {
  validateGenerationInput(input);

  return ACTIVITY_MODES.slice(0, input.activity_count).map((mode, index) => ({
    activity_id: buildActivityId(input.symbol, index),
    status: "draft",
    theme: {
      id: input.theme_id,
      symbol: input.symbol,
      meaning: input.meaning,
      belief: input.belief,
    },
    activity: {
      title: "",
      family: mode.family,
      primary_skill: mode.primary_skill,
      hook: "",
      duration_minutes: 0,
      players: mode.players,
      materials: [],
      steps: [],
      reflection: "",
      affirmation: input.belief,
      real_life_transfer: "",
      core_mechanic: mode.mechanic,
      emotional_payoff: mode.emotional_payoff,
    },
    printable: {
      required: false,
      template_id: null,
      content_spec: null,
    },
    quality: {
      theme_integrity: "review",
      belief_integrity: "review",
      child_appeal: "review",
      sel_quality: "review",
      safety: "review",
      parent_ux: "review",
      duplication: "review",
    },
    source: "original",
  }));
}

export function normalizePrintableSpec(printable) {
  if (!printable || printable.required !== true) {
    return {
      required: false,
      template_id: null,
      content_spec: null,
    };
  }

  if (!PRINTABLE_TEMPLATE_IDS.has(printable.template_id)) {
    throw new Error(`Unknown printable template_id: ${printable.template_id}`);
  }

  return {
    required: true,
    template_id: printable.template_id,
    content_spec: printable.content_spec || printable.content || null,
    title: printable.title || null,
    child_action: printable.child_action || null,
  };
}

export function validateActivityBatch(activities, lockedTheme) {
  const report = inspectActivityBatch(activities, lockedTheme);
  return {
    valid: report.valid,
    errors: report.errors,
    warnings: report.warnings,
  };
}

function buildRuleResult(rule, passed, details = null, severity = "error") {
  return {
    rule,
    passed,
    severity,
    details,
  };
}

function pushRule(ruleResults, errors, warnings, prefix, rule, passed, failureMessage, severity = "error") {
  const details = passed ? "pass" : `${prefix}: ${failureMessage}`;
  ruleResults.push(buildRuleResult(rule, passed, details, severity));
  if (!passed) {
    if (severity === "warning") {
      warnings.push(`${prefix}: ${failureMessage}`);
    } else {
      errors.push(`${prefix}: ${failureMessage}`);
    }
  }
}

export function inspectActivityBatch(activities, lockedTheme) {
  if (!Array.isArray(activities) || activities.length === 0) {
    return {
      valid: false,
      errors: ["At least one activity is required."],
      warnings: [],
      duplicateMechanicDetected: false,
      duplicateMechanicFamilies: [],
      perActivity: [],
      batchRules: [buildRuleResult("non_empty_batch", false, "At least one activity is required.")],
      finalDecision: APPROVAL_STATUSES.NEEDS_REVIEW,
    };
  }

  const errors = [];
  const warnings = [];
  const perActivity = [];
  const seenFamilies = new Map();
  const seenMechanics = new Map();
  const seenPayoffs = new Map();

  activities.forEach((entry, index) => {
    const prefix = `Activity ${index + 1}`;
    const theme = entry?.theme || {};
    const activity = entry?.activity || {};
    const printable = entry?.printable || {};
    const steps = Array.isArray(activity.steps) ? activity.steps : [];
    const ruleResults = [];

    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "theme_integrity",
      theme.symbol === lockedTheme.symbol && theme.meaning === lockedTheme.meaning,
      "theme connection is not locked to the canonical symbol/meaning input."
    );

    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "belief_integrity",
      theme.belief === lockedTheme.belief,
      "belief has changed from the locked canonical input."
    );

    const familyKey = String(activity.family || "").toLowerCase();
    const familyRepeated = familyKey && seenFamilies.has(familyKey);
    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "distinct_activity_family",
      !familyRepeated,
      `repeats activity family "${activity.family}".`
    );
    if (familyKey) {
      seenFamilies.set(familyKey, prefix);
    }

    let duplicateMechanicAgainst = null;
    if (activity.core_mechanic) {
      const mechanicKey = activity.core_mechanic.toLowerCase();
      duplicateMechanicAgainst = seenMechanics.get(mechanicKey) || null;
      seenMechanics.set(mechanicKey, prefix);
    }
    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "duplicate_mechanic_check",
      !duplicateMechanicAgainst,
      `repeats the same core mechanic "${activity.core_mechanic}"${duplicateMechanicAgainst ? ` first used in ${duplicateMechanicAgainst}` : ""}.`
    );

    let duplicatePayoffAgainst = null;
    if (activity.emotional_payoff) {
      const payoffKey = activity.emotional_payoff.toLowerCase();
      duplicatePayoffAgainst = seenPayoffs.get(payoffKey) || null;
      seenPayoffs.set(payoffKey, prefix);
    }
    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "distinct_emotional_payoff",
      !duplicatePayoffAgainst,
      `repeats the same emotional payoff "${activity.emotional_payoff}"${duplicatePayoffAgainst ? ` first used in ${duplicatePayoffAgainst}` : ""}.`
    );

    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "duration_range",
      Number.isInteger(activity.duration_minutes) && activity.duration_minutes >= 2 && activity.duration_minutes <= 10,
      "duration must be an integer between 2 and 10 minutes."
    );

    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "step_count",
      steps.length >= 3 && steps.length <= 6,
      "must contain 3-6 simple steps."
    );

    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "reflection_present",
      typeof activity.reflection === "string" && activity.reflection.trim().length > 0,
      "reflection question is required."
    );

    const combinedText = [
      activity.hook,
      activity.reflection,
      activity.real_life_transfer,
      ...steps,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "no_clinical_claims",
      !/(adhd|anxiety|depression|trauma|treats?|therapy|diagnos)/i.test(combinedText),
      "contains a clinical or therapeutic claim."
    );

    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "no_breath_holds",
      !/(hold your breath|breath hold|stop breathing)/i.test(combinedText),
      "contains prohibited breath-holding guidance."
    );

    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "no_forced_disclosure",
      !/(tell your biggest secret|share your secret|most embarrassing|confess)/i.test(combinedText),
      "requires uncomfortable disclosure."
    );

    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "printable_template_valid",
      printable.required !== true || PRINTABLE_TEMPLATE_IDS.has(printable.template_id),
      "printable template_id is missing or invalid."
    );

    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "printable_content_present_when_required",
      printable.required !== true || Boolean(printable.content_spec),
      "printable is marked required but content_spec is missing."
    );

    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "printable_decision_consistency",
      !(printable.required === false && PRINTABLE_REQUIRED_TEMPLATE_IDS.has(printable.template_id)),
      `printable template ${printable.template_id} is present but marked not required.`,
      "warning"
    );

    pushRule(
      ruleResults,
      errors,
      warnings,
      prefix,
      "parent_setup_lightweight",
      (activity.materials || []).length <= 5,
      "parent setup may be too heavy for MVP.",
      "warning"
    );

    perActivity.push({
      activity_id: entry?.activity_id || null,
      title: activity.title || null,
      family: activity.family || null,
      printable_required: printable.required === true,
      printable_template_id: printable.template_id || null,
      rules: ruleResults,
      approved: ruleResults.every((item) => item.severity === "warning" || item.passed),
    });
  });

  const duplicateMechanicFamilies = perActivity
    .filter((item) => item.rules.some((rule) => rule.rule === "duplicate_mechanic_check" && !rule.passed))
    .map((item) => item.family)
    .filter(Boolean);

  const batchRules = [
    buildRuleResult("non_empty_batch", true, "pass"),
    buildRuleResult("all_required_families_unique", !errors.some((item) => item.includes("repeats activity family")), "pass"),
    buildRuleResult("duplicate_mechanic_detection", duplicateMechanicFamilies.length === 0, duplicateMechanicFamilies.length === 0 ? "pass" : `Duplicate mechanic found in families: ${duplicateMechanicFamilies.join(", ")}`),
  ];

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    duplicateMechanicDetected: duplicateMechanicFamilies.length > 0,
    duplicateMechanicFamilies,
    perActivity,
    batchRules,
    finalDecision: errors.length === 0 ? APPROVAL_STATUSES.APPROVED : APPROVAL_STATUSES.NEEDS_REVIEW,
  };
}

export function buildPrintableRenderJob(activityRecord) {
  const printable = normalizePrintableSpec(activityRecord.printable);
  if (!printable.required) {
    return null;
  }

  return {
    template_id: printable.template_id,
    renderer_family: printableTemplateLibrary.find((template) => template.id === printable.template_id)?.renderer_family || null,
    activity_id: activityRecord.activity_id,
    theme_id: activityRecord.theme?.id || null,
    title: printable.title || activityRecord.activity?.title || null,
    content_spec: printable.content_spec,
    child_action: printable.child_action || null,
  };
}

export function deriveApprovalDecision(report) {
  return report?.finalDecision || APPROVAL_STATUSES.NEEDS_REVIEW;
}

export { ACTIVITY_MODES, APPROVAL_STATUSES, printableTemplateLibrary };
