import path from "node:path";

import { renderThemePack } from "../public/prana-story-generator/try-it-today/deterministicRenderer.js";
import { writeJson, TRY_IT_TODAY_OUTPUT_DIR } from "./try-it-today/shared.mjs";

const themeId = process.argv[2] || "GT01";

async function main() {
  const result = renderThemePack(themeId);
  const symbolSlug = result.theme.symbol.toLowerCase();
  const baseDir = path.join(TRY_IT_TODAY_OUTPUT_DIR, "renderer", symbolSlug);

  await writeJson(path.join(baseDir, "activity.json"), result.activity_json);
  await writeJson(path.join(baseDir, "carousel.json"), result.carousel_json);
  await writeJson(path.join(baseDir, "printable-render-job.json"), result.printable_render_job_json);
  await writeJson(path.join(baseDir, "validation-report.json"), result.validation);

  console.log(`Renderer output written to ${baseDir}`);
  console.log(`Theme: ${result.theme.symbol}`);
  console.log(`Activities: ${result.activity_json.length}`);
  console.log(`Printable render jobs: ${result.printable_render_job_json.length}`);
  console.log(`Final result: ${result.validation.final_result}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
