import fs from "node:fs/promises";
import path from "node:path";

import {
  PAGE_WIDTH_PX,
  PAGE_HEIGHT_PX,
  buildAssetImageMarkup,
  findUnresolvedSlots,
  replaceGroupContents,
  replaceTextSlot,
  validateA4Dimensions,
  validateRectsWithinSafeMargin,
  vectorPdfFromSvg,
  previewPngFromSvg,
} from "./svgPrintableCore.mjs";
import { validateCanonicalPrintableContract } from "./printableContractValidator.mjs";

const SLOT_LAYOUT = {
  TITLE: { x: 397, y: 72, width: 650, fontSize: 30, lineHeight: 34, maxLines: 2, textAnchor: "middle" },
  HOOK: { x: 397, y: 104, width: 640, fontSize: 15, lineHeight: 19, maxLines: 3, textAnchor: "middle" },
  MISSION: { x: 76, y: 183, width: 635, fontSize: 15, lineHeight: 19, maxLines: 4, textAnchor: "start" },
  SCENE_INSTRUCTION: { x: 75, y: 282, width: 360, fontSize: 13, lineHeight: 17, maxLines: 3, textAnchor: "start" },
  CHARACTER_LABEL: { x: 192, y: 270, width: 300, fontSize: 13, lineHeight: 16, maxLines: 2, textAnchor: "middle" },
  HIDDEN_WORD_1: { x: 115, y: 350, width: 120, fontSize: 16, lineHeight: 18, maxLines: 1, textAnchor: "start" },
  HIDDEN_WORD_2: { x: 315, y: 405, width: 120, fontSize: 16, lineHeight: 18, maxLines: 1, textAnchor: "start" },
  HIDDEN_WORD_3: { x: 175, y: 525, width: 120, fontSize: 16, lineHeight: 18, maxLines: 1, textAnchor: "start" },
  HIDDEN_WORD_4: { x: 365, y: 565, width: 120, fontSize: 16, lineHeight: 18, maxLines: 1, textAnchor: "start" },
  SORT_PROMPT: { x: 522, y: 286, width: 200, fontSize: 13, lineHeight: 17, maxLines: 4, textAnchor: "start" },
  CLUE_1: { x: 522, y: 492, width: 200, fontSize: 13, lineHeight: 17, maxLines: 3, textAnchor: "start" },
  CLUE_2: { x: 522, y: 545, width: 200, fontSize: 13, lineHeight: 17, maxLines: 3, textAnchor: "start" },
  CLUE_3: { x: 522, y: 598, width: 200, fontSize: 13, lineHeight: 17, maxLines: 3, textAnchor: "start" },
  ANSWER: { x: 397, y: 736, width: 340, fontSize: 25, lineHeight: 29, maxLines: 1, textAnchor: "middle" },
  WISDOM: { x: 397, y: 878, width: 600, fontSize: 17, lineHeight: 22, maxLines: 3, textAnchor: "middle" },
  TODAY: { x: 397, y: 908, width: 600, fontSize: 13, lineHeight: 17, maxLines: 3, textAnchor: "middle" },
  FOOTER: { x: 397, y: 1010, width: 620, fontSize: 16, lineHeight: 20, maxLines: 3, textAnchor: "middle" },
};

const CONTENT_RECTS = [
  { name: "mission", x: 55, y: 128, width: 684, height: 82 },
  { name: "scene", x: 55, y: 230, width: 430, height: 390 },
  { name: "sorting", x: 505, y: 230, width: 234, height: 185 },
  { name: "clue", x: 505, y: 430, width: 234, height: 190 },
  { name: "answer", x: 55, y: 645, width: 684, height: 142 },
  { name: "wisdom", x: 55, y: 812, width: 684, height: 125 },
];

async function injectSceneArt(svg, sceneArt, registry) {
  if (!sceneArt || !Array.isArray(sceneArt.items) || sceneArt.items.length === 0) {
    return { svg, usedIntrinsicSceneArt: true };
  }

  const existingGroup = svg.match(/<g id="SCENE_ART"([^>]*)>([\s\S]*?)<\/g>/);
  if (!existingGroup) {
    throw new Error("SVG scene art group not found: SCENE_ART");
  }

  const baseMarkup = existingGroup[2];
  const overlayImages = [];
  for (const item of sceneArt.items) {
    overlayImages.push(await buildAssetImageMarkup(item.asset_id, registry, {
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
    }));
  }

  return {
    svg: replaceGroupContents(svg, "SCENE_ART", `${baseMarkup}${overlayImages.join("")}`),
    usedIntrinsicSceneArt: false,
  };
}

function validateGeometry(svg) {
  const errors = [];
  errors.push(...validateA4Dimensions(svg));
  errors.push(...validateRectsWithinSafeMargin(CONTENT_RECTS, 12));
  return errors;
}

function toSlotData(inputData) {
  const content = inputData.content || {};
  const hiddenWords = Array.isArray(content.hidden_words) ? content.hidden_words : [];
  const clues = Array.isArray(content.clues) ? content.clues : [];
  const answerKey = inputData.answer_key || {};
  const wisdom = inputData.wisdom || {};

  return {
    TITLE: inputData.title,
    HOOK: content.hook || inputData.subtitle,
    MISSION: content.mission,
    SCENE_INSTRUCTION: content.scene_instruction,
    SCENE_ART: inputData.assets?.SCENE_ART || null,
    CHARACTER_LABEL: content.character_label || "",
    HIDDEN_WORD_1: hiddenWords[0] || "",
    HIDDEN_WORD_2: hiddenWords[1] || "",
    HIDDEN_WORD_3: hiddenWords[2] || "",
    HIDDEN_WORD_4: hiddenWords[3] || "",
    SORT_PROMPT: content.sort_prompt,
    CLUE_1: clues[0] || "",
    CLUE_2: clues[1] || "",
    CLUE_3: clues[2] || "",
    ANSWER: answerKey.secret_word || "",
    WISDOM: wisdom.statement || inputData.belief,
    TODAY: wisdom.today || "",
    FOOTER: content.footer,
  };
}

function validateInput(manifest, inputData, slotData, svg) {
  const errors = validateCanonicalPrintableContract(manifest, inputData, {
    requiredContentFields: manifest.data_contract.required_content_fields,
    requiredAssetFields: manifest.data_contract.required_asset_fields,
    requiredGenerationFields: manifest.data_contract.required_generation_fields,
    requiredWisdomFields: manifest.data_contract.required_wisdom_fields,
  });

  if (!Array.isArray(inputData.content?.hidden_words) || inputData.content.hidden_words.length !== 4) {
    errors.push("content.hidden_words must contain exactly 4 entries.");
  }

  if (!Array.isArray(inputData.content?.clues) || inputData.content.clues.length !== 3) {
    errors.push("content.clues must contain exactly 3 entries.");
  }

  if (!inputData.answer_key?.secret_word) {
    errors.push("Required answer_key field missing: secret_word");
  }

  if (inputData.assets?.SCENE_ART && !Array.isArray(inputData.assets.SCENE_ART.items)) {
    errors.push("assets.SCENE_ART.items must be an array when SCENE_ART is supplied.");
  }

  for (const [slotId, slotConfig] of Object.entries(manifest.slots)) {
    const value = slotData[slotId];
    if (slotConfig.required && slotId !== "SCENE_ART" && (value === undefined || value === null || value === "")) {
      errors.push(`Required slot missing: ${slotId}`);
    }
    if (slotConfig.type === "text" && slotConfig.max_chars && value && String(value).length > slotConfig.max_chars) {
      errors.push(`Slot ${slotId} exceeds max_chars ${slotConfig.max_chars}.`);
    }
    if (!svg.includes(`id="${slotId}"`) && slotId !== "SCENE_ART") {
      errors.push(`SVG does not contain slot id ${slotId}.`);
    }
  }
  errors.push(...validateGeometry(svg));
  return errors;
}

async function renderSvg(templateSvg, manifest, registry, slotData) {
  let svg = templateSvg;

  svg = replaceTextSlot(svg, "TITLE", slotData.TITLE, manifest.slots.TITLE, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "HOOK", slotData.HOOK, manifest.slots.HOOK, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "MISSION", slotData.MISSION, manifest.slots.MISSION, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "SCENE_INSTRUCTION", slotData.SCENE_INSTRUCTION, manifest.slots.SCENE_INSTRUCTION, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "CHARACTER_LABEL", slotData.CHARACTER_LABEL || "", manifest.slots.CHARACTER_LABEL, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "HIDDEN_WORD_1", slotData.HIDDEN_WORD_1, manifest.slots.HIDDEN_WORD_1, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "HIDDEN_WORD_2", slotData.HIDDEN_WORD_2, manifest.slots.HIDDEN_WORD_2, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "HIDDEN_WORD_3", slotData.HIDDEN_WORD_3, manifest.slots.HIDDEN_WORD_3, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "HIDDEN_WORD_4", slotData.HIDDEN_WORD_4, manifest.slots.HIDDEN_WORD_4, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "SORT_PROMPT", slotData.SORT_PROMPT, manifest.slots.SORT_PROMPT, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "CLUE_1", slotData.CLUE_1, manifest.slots.CLUE_1, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "CLUE_2", slotData.CLUE_2, manifest.slots.CLUE_2, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "CLUE_3", slotData.CLUE_3, manifest.slots.CLUE_3, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "ANSWER", slotData.ANSWER, manifest.slots.ANSWER, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "WISDOM", slotData.WISDOM, manifest.slots.WISDOM, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "TODAY", slotData.TODAY || "", manifest.slots.TODAY, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "FOOTER", slotData.FOOTER, manifest.slots.FOOTER, SLOT_LAYOUT);

  const sceneResult = await injectSceneArt(svg, slotData.SCENE_ART, registry);
  svg = sceneResult.svg;

  return { svg, usedIntrinsicSceneArt: sceneResult.usedIntrinsicSceneArt };
}

export async function renderPt11Template({ templateDir, assetRegistryPath, inputJsonPath, outputDir }) {
  const manifestPath = path.join(templateDir, "PT11_MYSTERY_DETECTIVE.manifest.json");
  const templateSvgPath = path.join(templateDir, "PT11_MYSTERY_DETECTIVE_MASTER.svg");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const templateSvg = await fs.readFile(templateSvgPath, "utf8");
  const registry = JSON.parse(await fs.readFile(assetRegistryPath, "utf8"));
  const inputData = JSON.parse(await fs.readFile(inputJsonPath, "utf8"));
  const slotData = toSlotData(inputData);

  const errors = validateInput(manifest, inputData, slotData, templateSvg);
  let svg = templateSvg;
  let usedIntrinsicSceneArt = false;

  if (errors.length === 0) {
    try {
      const renderResult = await renderSvg(templateSvg, manifest, registry, slotData);
      svg = renderResult.svg;
      usedIntrinsicSceneArt = renderResult.usedIntrinsicSceneArt;
      const unresolved = findUnresolvedSlots(svg);
      if (unresolved.length > 0) {
        errors.push(`Unresolved slots remain: ${unresolved.join(", ")}`);
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  await fs.mkdir(outputDir, { recursive: true });
  const sourceSvgPath = path.join(outputDir, "source.svg");
  const printablePdfPath = path.join(outputDir, "printable.pdf");
  const previewPngPath = path.join(outputDir, "preview.png");
  const answerKeyPath = path.join(outputDir, "answer-key.json");
  const reportPath = path.join(outputDir, "render-report.json");

  if (errors.length === 0) {
    await fs.writeFile(sourceSvgPath, svg, "utf8");
    await vectorPdfFromSvg(sourceSvgPath, printablePdfPath);
    await previewPngFromSvg(svg, previewPngPath);
    await fs.writeFile(answerKeyPath, `${JSON.stringify(inputData.answer_key || {}, null, 2)}\n`, "utf8");
  }

  const report = {
    template_id: manifest.template_id,
    input_json: path.relative(process.cwd(), inputJsonPath),
    generated_at: new Date().toISOString(),
    final_result: errors.length === 0 ? "APPROVED" : "NEEDS_REVIEW",
    validation: {
      template_exists: true,
      manifest_exists: true,
      canonical_contract_valid: errors.every((item) => !item.includes("top-level") && !item.includes("content.") && !item.includes("assets.") && !item.includes("generation") && !item.includes("wisdom")),
      required_fields_exist: errors.every((item) => !item.includes("Required ")),
      vector_text_required: manifest.print_rules.vector_text_required === true,
      used_intrinsic_scene_art: usedIntrinsicSceneArt,
      unresolved_slots: errors.every((item) => !item.startsWith("Unresolved slots remain")),
      a4_dimensions_correct: errors.every((item) => !item.includes("A4 dimensions")),
      safe_margins_preserved: errors.every((item) => !item.includes("safe margin")),
      render_contract: manifest.render_contract,
      preview_generated: errors.length === 0,
      answer_key_generated: errors.length === 0,
      page_size_px: { width: PAGE_WIDTH_PX, height: PAGE_HEIGHT_PX },
    },
    errors,
    files: {
      source_svg: path.relative(process.cwd(), sourceSvgPath),
      printable_pdf: path.relative(process.cwd(), printablePdfPath),
      preview_png: path.relative(process.cwd(), previewPngPath),
      answer_key_json: path.relative(process.cwd(), answerKeyPath),
    },
    data_summary: {
      theme_id: inputData.theme_id,
      belief: inputData.belief,
      mode: inputData.generation?.mode || null,
    },
  };

  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}
