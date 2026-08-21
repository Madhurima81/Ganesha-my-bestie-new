import fs from "node:fs/promises";
import path from "node:path";

import { renderPrintableTemplate } from "./printable-poc/renderPrintableTemplate.mjs";

const baseDir = path.resolve(process.cwd(), "public", "prana-story-generator", "printable-poc");
const templateDir = path.join(baseDir, "templates", "PT02_KINDNESS_BAND");
const assetRegistryPath = path.join(baseDir, "assetRegistry.json");
const variantsPath = path.join(baseDir, "data", "pt02_variants.json");
const outputRoot = path.resolve(process.cwd(), "output", "printable");

async function main() {
  const variants = JSON.parse(await fs.readFile(variantsPath, "utf8"));
  const reports = [];

  for (const variantRecord of variants) {
    const report = await renderPrintableTemplate({
      templateDir,
      assetRegistryPath,
      variantRecord,
      outputRoot,
    });
    reports.push(report);
    console.log(`${variantRecord.variant_id}: ${report.final_result}`);
  }

  const summary = {
    generated_at: new Date().toISOString(),
    template_id: "PT02_KINDNESS_BAND",
    variants: reports.map((report) => ({
      variant_id: report.variant_id,
      final_result: report.final_result,
      errors: report.errors,
    })),
    final_result: reports.every((report) => report.final_result === "APPROVED") ? "APPROVED" : "NEEDS_REVIEW",
  };

  const summaryPath = path.join(outputRoot, "PT02_KINDNESS_BAND", "render-summary.json");
  await fs.mkdir(path.dirname(summaryPath), { recursive: true });
  await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`Summary written to ${summaryPath}`);
  console.log(`Final result: ${summary.final_result}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
