import path from "node:path";
import crypto from "node:crypto";

import {
  EARS_DEMO_INPUT,
  TRY_IT_TODAY_OUTPUT_DIR,
  buildPipelineOutput,
  buildPromptPackage,
  coerceGeneratedActivities,
  createDemoLlmActivities,
  getSystemPrompt,
  inspectNormalizedActivities,
  readJsonIfExists,
  writeJson,
} from "./try-it-today/shared.mjs";

const LIVE_REPORT_FILE = path.join(TRY_IT_TODAY_OUTPUT_DIR, "ears-live-report.json");
const RAW_RESPONSE_FILE = path.join(TRY_IT_TODAY_OUTPUT_DIR, "ears-live-raw-response.json");
const NORMALIZED_FILE = path.join(TRY_IT_TODAY_OUTPUT_DIR, "ears-live-normalized.json");
const FIXTURE_REPORT_FILE = path.join(TRY_IT_TODAY_OUTPUT_DIR, "ears-demo-report.json");

function buildActivityJsonSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["activities"],
    properties: {
      activities: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["status", "activity", "printable", "quality"],
          properties: {
            status: {
              type: "string",
              enum: ["draft"],
            },
            activity: {
              type: "object",
              additionalProperties: false,
              required: [
                "title",
                "family",
                "primary_skill",
                "hook",
                "duration_minutes",
                "players",
                "materials",
                "steps",
                "reflection",
                "affirmation",
                "real_life_transfer",
                "core_mechanic",
                "emotional_payoff",
              ],
              properties: {
                title: { type: "string" },
                family: {
                  type: "string",
                  enum: ["calm", "play", "notice", "talk", "make"],
                },
                primary_skill: { type: "string" },
                hook: { type: "string" },
                duration_minutes: { type: "integer" },
                players: { type: "string" },
                materials: {
                  type: "array",
                  items: { type: "string" },
                },
                steps: {
                  type: "array",
                  minItems: 3,
                  maxItems: 6,
                  items: { type: "string" },
                },
                reflection: { type: "string" },
                affirmation: { type: "string" },
                real_life_transfer: { type: "string" },
                core_mechanic: { type: "string" },
                emotional_payoff: { type: "string" },
              },
            },
            printable: {
              type: "object",
              additionalProperties: false,
              required: ["required", "template_id", "title", "content_spec", "child_action"],
              properties: {
                required: { type: "boolean" },
                template_id: {
                  anyOf: [
                    { type: "string" },
                    { type: "null" },
                  ],
                },
                title: {
                  anyOf: [
                    { type: "string" },
                    { type: "null" },
                  ],
                },
                content_spec: {
                  anyOf: [
                    { type: "object", additionalProperties: true },
                    { type: "array", items: { type: "string" } },
                    { type: "null" },
                  ],
                },
                child_action: {
                  anyOf: [
                    { type: "string" },
                    { type: "null" },
                  ],
                },
              },
            },
            quality: {
              type: "object",
              additionalProperties: false,
              required: [
                "theme_integrity",
                "belief_integrity",
                "child_appeal",
                "sel_quality",
                "safety",
                "parent_ux",
                "duplication",
              ],
              properties: {
                theme_integrity: { type: "string", enum: ["pass", "review"] },
                belief_integrity: { type: "string", enum: ["pass", "review"] },
                child_appeal: { type: "string", enum: ["pass", "review"] },
                sel_quality: { type: "string", enum: ["pass", "review"] },
                safety: { type: "string", enum: ["pass", "review"] },
                parent_ux: { type: "string", enum: ["pass", "review"] },
                duplication: { type: "string", enum: ["pass", "review"] },
              },
            },
          },
        },
      },
    },
  };
}

async function createOpenAiRequest(promptPackage) {
  const systemPrompt = await getSystemPrompt(promptPackage.systemPromptPath);
  const temperature = Number(process.env.TRY_IT_TODAY_TEMPERATURE || "0.2");
  const seed = Number(process.env.TRY_IT_TODAY_SEED || "101");
  const model = process.env.TRY_IT_TODAY_MODEL || "gpt-5-mini";

  return {
    model,
    temperature,
    seed,
    max_output_tokens: Number(process.env.TRY_IT_TODAY_MAX_OUTPUT_TOKENS || "4000"),
    text: {
      format: {
        type: "json_schema",
        name: "try_it_today_activity_batch",
        strict: true,
        schema: buildActivityJsonSchema(),
      },
    },
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text:
              `${JSON.stringify(promptPackage.userPayload, null, 2)}\n\n` +
              "Return exactly 5 activities for Ears. Keep the locked meaning and belief unchanged. " +
              "Make the five activities genuinely different in mechanic and emotional payoff. " +
              "Only require a printable when removing it makes the experience meaningfully worse.",
          },
        ],
      },
    ],
  };
}

async function callOpenAi(requestBody) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for the live runner.");
  }

  const clientRequestId = crypto.randomUUID();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "X-Client-Request-Id": clientRequestId,
    },
    body: JSON.stringify(requestBody),
  });

  const responseJson = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status} ${JSON.stringify(responseJson)}`);
  }

  return {
    client_request_id: clientRequestId,
    response_json: responseJson,
  };
}

function parseGeneratedActivities(rawResponse) {
  const outputText = rawResponse?.response_json?.output_text;
  if (!outputText) {
    throw new Error("OpenAI response did not include output_text.");
  }

  const parsed = JSON.parse(outputText);
  if (!Array.isArray(parsed.activities) || parsed.activities.length !== 5) {
    throw new Error("OpenAI response JSON must include exactly 5 activities.");
  }

  return parsed.activities;
}

function compareAgainstFixture(liveOutput, fixtureOutput) {
  const fixtureActivities = fixtureOutput?.activity_records || [];
  const liveActivities = liveOutput || [];

  return {
    fixture_found: Boolean(fixtureOutput),
    fixture_activity_count: fixtureActivities.length,
    live_activity_count: liveActivities.length,
    same_activity_count: fixtureActivities.length === liveActivities.length,
    same_family_sequence:
      fixtureActivities.map((item) => item.activity.family).join("|") ===
      liveActivities.map((item) => item.activity.family).join("|"),
    same_printable_count:
      fixtureActivities.filter((item) => item.printable.required).length ===
      liveActivities.filter((item) => item.printable.required).length,
    title_pairs: liveActivities.map((item, index) => ({
      family: item.activity.family,
      fixture_title: fixtureActivities[index]?.activity?.title || null,
      live_title: item.activity.title,
      exact_title_match: fixtureActivities[index]?.activity?.title === item.activity.title,
    })),
  };
}

async function main() {
  const promptPackage = buildPromptPackage(EARS_DEMO_INPUT);
  const llmRequest = await createOpenAiRequest(promptPackage);
  const rawResponse = await callOpenAi(llmRequest);
  await writeJson(RAW_RESPONSE_FILE, {
    generated_at: new Date().toISOString(),
    request: llmRequest,
    raw_response: rawResponse,
  });

  const parsedActivities = parseGeneratedActivities(rawResponse);
  const normalizedActivities = coerceGeneratedActivities(parsedActivities, EARS_DEMO_INPUT, "openai_live_generation");
  const validationReport = inspectNormalizedActivities(normalizedActivities, EARS_DEMO_INPUT);
  await writeJson(NORMALIZED_FILE, {
    generated_at: new Date().toISOString(),
    normalized_activities: normalizedActivities,
    validation: validationReport,
  });

  const fixtureReport = await readJsonIfExists(FIXTURE_REPORT_FILE);
  const fixtureComparison = compareAgainstFixture(normalizedActivities, fixtureReport);

  const liveReport = buildPipelineOutput({
    input: EARS_DEMO_INPUT,
    promptPackage,
    generationProvider: "openai_live",
    normalizedActivities,
    validationReport,
    llmRequest,
    llmRawResponse: rawResponse,
    fixtureComparison,
  });

  await writeJson(LIVE_REPORT_FILE, liveReport);

  console.log(`Live report written to ${LIVE_REPORT_FILE}`);
  console.log(`Raw response written to ${RAW_RESPONSE_FILE}`);
  console.log(`Normalized output written to ${NORMALIZED_FILE}`);
  console.log(`Final result: ${liveReport.validation.final_result}`);
  console.log(`Duplicate mechanic detected: ${liveReport.validation.duplicate_mechanic_detected}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
