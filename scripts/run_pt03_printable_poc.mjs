import path from "node:path";
import fs from "node:fs/promises";

import { renderPt03Template } from "./printable-poc/renderPt03SortMatchDecode.mjs";

const baseDir = path.resolve(process.cwd(), "public", "prana-story-generator", "printable-poc");
const templateDir = path.join(baseDir, "templates", "PT03_SORT_MATCH_DECODE");
const assetRegistryPath = path.join(baseDir, "assetRegistry.json");
const outputRoot = path.resolve(process.cwd(), "output", "printable", "PT03_SORT_MATCH_DECODE");

const variants = [
  {
    name: "ears-sample",
    inputJsonPath: path.join(baseDir, "data", "PT03_SORT_MATCH_DECODE", "PT03_SORT_MATCH_DECODE_EARS.sample.json"),
  },
  {
    name: "eyes-sample",
    inputJsonPath: path.join(baseDir, "data", "PT03_SORT_MATCH_DECODE", "PT03_SORT_MATCH_DECODE_EYES.sample.json"),
  },
];

async function main() {
  const reports = [];
  for (const variant of variants) {
    const outputDir = path.join(outputRoot, variant.name);
    const report = await renderPt03Template({
      templateDir,
      assetRegistryPath,
      inputJsonPath: variant.inputJsonPath,
      outputDir,
    });
    reports.push({ name: variant.name, ...report });
    console.log(`${variant.name}: ${report.final_result}`);
  }

  const summary = {
    generated_at: new Date().toISOString(),
    template_id: "PT03_SORT_MATCH_DECODE",
    variants: reports.map((report) => ({
      name: report.name,
      final_result: report.final_result,
      errors: report.errors,
      input_json: report.input_json,
    })),
    final_result: reports.every((report) => report.final_result === "APPROVED") ? "APPROVED" : "NEEDS_REVIEW",
  };
  const summaryPath = path.join(outputRoot, "render-summary.json");
  await fs.mkdir(outputRoot, { recursive: true });
  await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(`Summary written to ${summaryPath}`);
  console.log(`Final result: ${summary.final_result}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
