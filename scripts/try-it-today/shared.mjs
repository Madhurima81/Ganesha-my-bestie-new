import fs from "node:fs/promises";
import path from "node:path";

import {
  buildGenerationPrompt,
  buildPrintableRenderJob,
  createActivityBatchSkeleton,
  deriveApprovalDecision,
  inspectActivityBatch,
} from "../../public/prana-story-generator/try-it-today/tryItTodayMvp.js";

export const EARS_DEMO_INPUT = {
  theme_id: "GT01",
  symbol: "Ears",
  meaning: "Listen Like a Winnowing Basket - sift helpful words from noisy distractions.",
  belief: "I keep the words that help me grow.",
  activity_count: 5,
};

export const TRY_IT_TODAY_OUTPUT_DIR = path.resolve(process.cwd(), "output", "try-it-today");

export function getSystemPrompt(promptPath) {
  return fs.readFile(path.resolve(process.cwd(), promptPath), "utf8");
}

export function createDemoLlmActivities(input) {
  const skeleton = createActivityBatchSkeleton(input);

  const generated = [
    {
      title: "Winnowing Breath",
      hook: "Can you breathe in the words that help and let the noisy ones float away?",
      duration_minutes: 3,
      materials: [],
      steps: [
        "Sit comfortably and think of one helpful sentence someone said to you.",
        "Breathe in as you whisper that helpful sentence to yourself.",
        "Breathe out and imagine noisy unhelpful words blowing away like husks in the wind.",
      ],
      reflection: "Which words felt worth keeping today?",
      real_life_transfer: "Later today, pause for one breath before deciding which words to keep.",
      printable: {
        required: false,
      },
    },
    {
      title: "Keep or Let Go Cards",
      hook: "Can you beat the noise and sort the words that help you grow?",
      duration_minutes: 6,
      materials: ["printed cards or scrap paper"],
      steps: [
        "Place two labels in front of you: KEEP and LET GO.",
        "Read or hear one word card at a time.",
        "Put helpful growth words in KEEP and noisy put-down words in LET GO.",
        "Pick one KEEP card to say out loud at the end.",
      ],
      reflection: "Which card would you like to remember the next time someone speaks to you?",
      real_life_transfer: "The next time you hear mixed messages, look for one sentence that truly helps you grow.",
      printable: {
        required: true,
        template_id: "PT02",
        title: "Helpful Words / Noise",
        content_spec: {
          cards: [
            "Try another way.",
            "You can't do it.",
            "I don't understand yet.",
            "That's stupid.",
            "Keep practicing.",
            "Mistakes help us learn.",
          ],
          keep_label: "KEEP",
          let_go_label: "LET GO",
        },
        child_action: "Sort each card into KEEP or LET GO.",
      },
    },
    {
      title: "Sound Detective",
      hook: "Can your ears find three sounds that help you notice the world more carefully?",
      duration_minutes: 4,
      materials: [],
      steps: [
        "Stand or sit quietly and listen for one far-away sound.",
        "Next, listen for one nearby sound.",
        "Finally, listen for one sound inside your own body, like a breath or tiny rustle.",
        "Name the sound that helped you focus the most.",
      ],
      reflection: "Which sound helped you listen most carefully?",
      real_life_transfer: "When a room feels noisy later, find one sound to anchor your attention first.",
      printable: {
        required: false,
      },
    },
    {
      title: "Listening Pebble Turn-Taking",
      hook: "Can you listen so carefully that your partner feels completely heard?",
      duration_minutes: 7,
      materials: ["a pebble or small soft object"],
      steps: [
        "One person holds the pebble and shares one small idea, story, or plan.",
        "The listener may not interrupt and only listens until the pebble is passed over.",
        "Before speaking, the listener repeats one helpful thing they heard.",
        "Switch turns and try again.",
      ],
      reflection: "What changed when you listened for the helpful part first?",
      real_life_transfer: "At home today, try repeating one helpful sentence before answering back.",
      printable: {
        required: false,
      },
    },
    {
      title: "Pocket Reminder Ears",
      hook: "Can you make a tiny ears reminder that helps you keep good words close?",
      duration_minutes: 8,
      materials: ["paper", "crayons or pencil", "scissors optional"],
      steps: [
        "Draw a small pair of ears on paper.",
        "Inside the ears, write or draw one helpful sentence you want to keep.",
        "Decorate the card so it feels easy to notice later.",
        "Place it in a pocket, pencil box, or near your bed.",
      ],
      reflection: "What helpful words do you want your ears to remember most?",
      real_life_transfer: "Look at your reminder the next time noisy words try to stick to you.",
      printable: {
        required: true,
        template_id: "PT06",
        title: "My Helpful Words Ears Card",
        content_spec: {
          prompt: "Write or draw one helpful sentence inside the ears.",
          art_direction: "Simple ears outline with space for one sentence and colouring.",
        },
        child_action: "Write one helpful sentence inside the ears and keep the card nearby.",
      },
    },
  ];

  return skeleton.map((item, index) => {
    const draft = generated[index];
    return {
      ...item,
      activity: {
        ...item.activity,
        title: draft.title,
        hook: draft.hook,
        duration_minutes: draft.duration_minutes,
        materials: draft.materials,
        steps: draft.steps,
        reflection: draft.reflection,
        real_life_transfer: draft.real_life_transfer,
      },
      printable: draft.printable.required
        ? {
            required: true,
            template_id: draft.printable.template_id,
            title: draft.printable.title,
            content_spec: draft.printable.content_spec,
            child_action: draft.printable.child_action,
          }
        : {
            required: false,
            template_id: null,
            content_spec: null,
          },
      quality: {
        theme_integrity: "pass",
        belief_integrity: "pass",
        child_appeal: "pass",
        sel_quality: "pass",
        safety: "pass",
        parent_ux: "pass",
        duplication: "pass",
      },
      source: "demo_llm_fixture",
    };
  });
}

export function coerceGeneratedActivities(generatedActivities, input, source = "openai_live_generation") {
  const skeleton = createActivityBatchSkeleton(input);
  return skeleton.map((item, index) => {
    const generated = generatedActivities[index] || {};
    const activity = generated.activity || {};
    const printable = generated.printable || {};
    return {
      ...item,
      status: generated.status || item.status,
      theme: {
        id: input.theme_id,
        symbol: input.symbol,
        meaning: input.meaning,
        belief: input.belief,
      },
      activity: {
        ...item.activity,
        ...activity,
        affirmation: activity.affirmation || input.belief,
      },
      printable: printable.required
        ? {
            required: true,
            template_id: printable.template_id || null,
            title: printable.title || null,
            content_spec: printable.content_spec || printable.content || null,
            child_action: printable.child_action || null,
          }
        : {
            required: false,
            template_id: null,
            content_spec: null,
          },
      quality: {
        ...item.quality,
        ...(generated.quality || {}),
      },
      source,
    };
  });
}

export function buildPipelineOutput({
  input,
  promptPackage,
  generationProvider,
  normalizedActivities,
  validationReport,
  fallbackError = null,
  llmRequest = null,
  llmRawResponse = null,
  fixtureComparison = null,
}) {
  const printableDecisions = normalizedActivities.map((activity) => ({
    activity_id: activity.activity_id,
    title: activity.activity.title,
    required: activity.printable.required === true,
    template_id: activity.printable.template_id || null,
  }));

  const printableRenderJobs = normalizedActivities
    .map((activity) => buildPrintableRenderJob(activity))
    .filter(Boolean);

  return {
    generated_at: new Date().toISOString(),
    milestone: "Try It Today MVP content pipeline",
    provider: generationProvider,
    fallback_error: fallbackError,
    input,
    prompt_payload: promptPackage.userPayload,
    llm_request: llmRequest,
    llm_raw_response: llmRawResponse,
    activity_records: normalizedActivities,
    validation: {
      final_result: deriveApprovalDecision(validationReport),
      batch_valid: validationReport.valid,
      duplicate_mechanic_detected: validationReport.duplicateMechanicDetected,
      duplicate_mechanic_families: validationReport.duplicateMechanicFamilies,
      batch_rules: validationReport.batchRules,
      per_activity: validationReport.perActivity,
      errors: validationReport.errors,
      warnings: validationReport.warnings,
    },
    printable_decisions: printableDecisions,
    printable_render_jobs: printableRenderJobs,
    fixture_comparison: fixtureComparison,
  };
}

export function inspectNormalizedActivities(activities, input) {
  return inspectActivityBatch(activities, input);
}

export function buildPromptPackage(input) {
  return buildGenerationPrompt(input);
}

export async function writeJson(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export async function readJsonIfExists(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}
