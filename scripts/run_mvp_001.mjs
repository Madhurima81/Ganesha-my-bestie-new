import fs from "node:fs/promises";
import path from "node:path";

import { renderPt03Template } from "./printable-poc/renderPt03SortMatchDecode.mjs";

const repoRoot = process.cwd();
const recordsPath = path.join(repoRoot, "public", "prana-story-generator", "mvp", "MVP-001.records.json");
const printableBaseDir = path.join(repoRoot, "public", "prana-story-generator", "printable-poc");
const pt03TemplateDir = path.join(printableBaseDir, "templates", "PT03_SORT_MATCH_DECODE");
const assetRegistryPath = path.join(printableBaseDir, "assetRegistry.json");
const outputRoot = path.join(repoRoot, "output", "mvp", "MVP-001");

function findRecordById(records, key, value) {
  return records.find((record) => record[key] === value) || null;
}

function buildEarsTrace(records) {
  return {
    wisdom: findRecordById(records.wisdom_records, "wisdom_id", "SYM-GAN-008"),
    practice: findRecordById(records.practice_records, "practice_id", "PRAC-GAN-EARS-001"),
    story: findRecordById(records.experience_records, "experience_id", "EXP-GAN-EARS-STORY-001"),
    try_it_today: findRecordById(records.experience_records, "experience_id", "EXP-GAN-EARS-TRYIT-001"),
    printable: findRecordById(records.experience_records, "experience_id", "EXP-GAN-EARS-PRINTABLE-001"),
  };
}

function buildPendingTrace(records, wisdomId, practiceId, experienceId) {
  return {
    wisdom: findRecordById(records.wisdom_records, "wisdom_id", wisdomId),
    practice: findRecordById(records.practice_records, "practice_id", practiceId),
    story: findRecordById(records.experience_records, "experience_id", experienceId),
  };
}

function statusFromRecord(record) {
  return record?.content_status || "NEEDS_REVIEW";
}

async function writeJson(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function main() {
  const records = JSON.parse(await fs.readFile(recordsPath, "utf8"));
  const earsTrace = buildEarsTrace(records);
  const hanumanTrace = buildPendingTrace(
    records,
    "SYM-HAN-002",
    "PRAC-HAN-SANJEEVANI-001",
    "EXP-HAN-SANJEEVANI-STORY-001"
  );
  const gitaTrace = buildPendingTrace(
    records,
    "BG-006",
    "PRAC-GITA-BG006-001",
    "EXP-GITA-BG006-STORY-001"
  );

  await fs.mkdir(outputRoot, { recursive: true });
  await writeJson(path.join(outputRoot, "canonical-records.json"), records);

  const earsDir = path.join(outputRoot, "ears");
  await writeJson(path.join(earsDir, "wisdom-record.json"), earsTrace.wisdom);
  await writeJson(path.join(earsDir, "practice-record.json"), earsTrace.practice);
  await writeJson(path.join(earsDir, "story.json"), earsTrace.story);
  await writeJson(path.join(earsDir, "try-it-today.json"), earsTrace.try_it_today);

  const pt03InputPath = path.join(earsDir, "printable-input.json");
  await writeJson(pt03InputPath, earsTrace.printable.printable_payload);

  const pt03OutputDir = path.join(earsDir, "printable", "PT03_SORT_MATCH_DECODE");
  const pt03Report = await renderPt03Template({
    templateDir: pt03TemplateDir,
    assetRegistryPath,
    inputJsonPath: pt03InputPath,
    outputDir: pt03OutputDir,
  });

  await writeJson(path.join(outputRoot, "hanuman", "canonical-trace.json"), hanumanTrace);
  await writeJson(path.join(outputRoot, "gita", "canonical-trace.json"), gitaTrace);

  const stageChecks = [
    {
      stage: "research_to_wisdom",
      slice: "ears",
      status: earsTrace.wisdom.content_status === "SOURCE_VERIFIED" ? "APPROVED" : "NEEDS_REVIEW",
      notes: "Large Ears anchor verified from research bundle.",
    },
    {
      stage: "wisdom_to_practice",
      slice: "ears",
      status: earsTrace.practice.content_status === "SOURCE_VERIFIED" ? "APPROVED" : "NEEDS_REVIEW",
      notes: "Practice locked to hear -> select -> sort.",
    },
    {
      stage: "practice_to_story",
      slice: "ears",
      status: earsTrace.story.content_status === "SOURCE_DERIVED" ? "APPROVED" : "NEEDS_REVIEW",
      notes: "Child story is a deterministic adaptation of the verified Ears anchor.",
    },
    {
      stage: "practice_to_try_it_today",
      slice: "ears",
      status: earsTrace.try_it_today.content_status === "SOURCE_DERIVED" ? "APPROVED" : "NEEDS_REVIEW",
      notes: "Try It Today mechanic stays on sift-helpful-vs-noise semantics.",
    },
    {
      stage: "practice_to_pt03_svg_pdf",
      slice: "ears",
      status: pt03Report.final_result,
      notes: "PT03 rendered from canonical Ears payload.",
    },
  ];

  const auditReport = {
    generated_at: new Date().toISOString(),
    run: records.run,
    stage_1_result: stageChecks.every((item) => item.status === "APPROVED") ? "APPROVED" : "NEEDS_REVIEW",
    run_result: "NEEDS_REVIEW",
    rationale: "Ears is fully run end to end. Hanuman and the requested Gita 2.47 slice remain open because source content is incomplete in the supplied bundle.",
    stage_checks: stageChecks,
    slices: {
      ears: {
        final_result: stageChecks.every((item) => item.status === "APPROVED") ? "APPROVED" : "NEEDS_REVIEW",
        wisdom_status: statusFromRecord(earsTrace.wisdom),
        practice_status: statusFromRecord(earsTrace.practice),
        story_status: statusFromRecord(earsTrace.story),
        try_it_today_status: statusFromRecord(earsTrace.try_it_today),
        printable_status: pt03Report.final_result,
        output_files: {
          story_json: path.relative(repoRoot, path.join(earsDir, "story.json")),
          try_it_today_json: path.relative(repoRoot, path.join(earsDir, "try-it-today.json")),
          printable_input_json: path.relative(repoRoot, pt03InputPath),
          printable_report_json: pt03Report.files ? path.relative(repoRoot, path.join(pt03OutputDir, "render-report.json")) : null,
          printable_pdf: pt03Report.files ? path.relative(repoRoot, path.join(pt03OutputDir, "printable.pdf")) : null,
          printable_preview_png: pt03Report.files ? path.relative(repoRoot, path.join(pt03OutputDir, "preview.png")) : null,
        },
      },
      hanuman: {
        final_result: "NEEDS_SOURCE_CONTENT",
        wisdom_status: statusFromRecord(hanumanTrace.wisdom),
        practice_status: statusFromRecord(hanumanTrace.practice),
        story_status: statusFromRecord(hanumanTrace.story),
        blocking_gap: hanumanTrace.wisdom.source_gap,
      },
      gita: {
        final_result: "NEEDS_SOURCE_CONTENT",
        wisdom_status: statusFromRecord(gitaTrace.wisdom),
        practice_status: statusFromRecord(gitaTrace.practice),
        story_status: statusFromRecord(gitaTrace.story),
        blocking_gap: gitaTrace.wisdom.source_reference,
        alternate_verified_source_reference: gitaTrace.wisdom.alternate_verified_source_reference,
      },
    },
    source_provenance_summary: {
      verified_now: ["SYM-GAN-008 Large Ears", "SYM-HAN-002 symbol id only"],
      missing_for_completion: ["Hanuman Sanjeevani child-facing supporting passage", "Bhagavad Gita 2.47 / BG-006 source content"],
    },
  };

  await writeJson(path.join(outputRoot, "mvp-audit-report.json"), auditReport);

  console.log(`MVP-001 stage 1 result: ${auditReport.stage_1_result}`);
  console.log(`Ears printable result: ${pt03Report.final_result}`);
  console.log(`Overall run result: ${auditReport.run_result}`);
  console.log(`Audit report written to ${path.join(outputRoot, "mvp-audit-report.json")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
