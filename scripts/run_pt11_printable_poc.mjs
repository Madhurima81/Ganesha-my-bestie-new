import path from "node:path";
import fs from "node:fs/promises";

import { renderPt11Template } from "./printable-poc/renderPt11MysteryDetective.mjs";

const baseDir = path.resolve(process.cwd(), "public", "prana-story-generator", "printable-poc");
const templateDir = path.join(baseDir, "templates", "PT11_MYSTERY_DETECTIVE");
const assetRegistryPath = path.join(baseDir, "assetRegistry.json");
const outputRoot = path.resolve(process.cwd(), "output", "printable", "PT11_MYSTERY_DETECTIVE");

const variants = [
  {
    name: "ears-sample",
    inputJsonPath: path.join(baseDir, "data", "PT11_MYSTERY_DETECTIVE", "PT11_MYSTERY_DETECTIVE_EARS.sample.json"),
  },
  {
    name: "eyes-sample",
    inputJsonPath: path.join(baseDir, "data", "PT11_MYSTERY_DETECTIVE", "PT11_MYSTERY_DETECTIVE_EYES.sample.json"),
  },
];

async function main() {
  const reports = [];
  for (const variant of variants) {
    const outputDir = path.join(outputRoot, variant.name);
    const report = await renderPt11Template({
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
    template_id: "PT11_MYSTERY_DETECTIVE",
    variants: reports.map((report) => ({
      name: report.name,
      final_result: report.final_result,
      errors: report.errors,
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
