import path from "node:path";

import {
  EARS_DEMO_INPUT,
  TRY_IT_TODAY_OUTPUT_DIR,
  buildPipelineOutput,
  buildPromptPackage,
  createDemoLlmActivities,
  inspectNormalizedActivities,
  writeJson,
} from "./try-it-today/shared.mjs";

async function main() {
  const promptPackage = buildPromptPackage(EARS_DEMO_INPUT);
  const activities = createDemoLlmActivities(EARS_DEMO_INPUT);
  const validationReport = inspectNormalizedActivities(activities, EARS_DEMO_INPUT);
  const demoOutput = buildPipelineOutput({
    input: EARS_DEMO_INPUT,
    promptPackage,
    generationProvider: "demo_fixture",
    normalizedActivities: activities,
    validationReport,
  });

  const outputFile = path.join(TRY_IT_TODAY_OUTPUT_DIR, "ears-demo-report.json");
  await writeJson(outputFile, demoOutput);

  console.log(`Demo report written to ${outputFile}`);
  console.log(`Provider: ${demoOutput.provider}`);
  console.log(`Final result: ${demoOutput.validation.final_result}`);
  console.log(`Activities: ${demoOutput.activity_records.length}`);
  console.log(`Printable render jobs: ${demoOutput.printable_render_jobs.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
