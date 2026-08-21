import fs from "node:fs/promises";
import path from "node:path";

import {
  buildAssetImageMarkup,
  escapeXml,
  findUnresolvedSlots,
  replaceGroupContents,
  replaceTextSlot,
  validateA4Dimensions,
  validateRectsWithinSafeMargin,
  vectorPdfFromSvg,
  previewPngFromSvg,
  wrapText,
} from "./svgPrintableCore.mjs";
import { validateCanonicalPrintableContract } from "./printableContractValidator.mjs";

const SLOT_LAYOUT = {
  TITLE: { x: 122, y: 84, width: 430, fontSize: 31, lineHeight: 35, maxLines: 2, textAnchor: "start" },
  SUBTITLE: { x: 122, y: 116, width: 430, fontSize: 15, lineHeight: 18, maxLines: 3, textAnchor: "start" },
  INSTRUCTION: { x: 122, y: 158, width: 430, fontSize: 13, lineHeight: 15, maxLines: 3, textAnchor: "start" },
  CATEGORY_LEFT_TITLE: { x: 220, y: 754, width: 240, fontSize: 23, lineHeight: 27, maxLines: 1, textAnchor: "middle" },
  CATEGORY_LEFT_HINT: { x: 220, y: 790, width: 220, fontSize: 14, lineHeight: 18, maxLines: 2, textAnchor: "middle" },
  CATEGORY_RIGHT_TITLE: { x: 574, y: 754, width: 240, fontSize: 23, lineHeight: 27, maxLines: 2, textAnchor: "middle" },
  CATEGORY_RIGHT_HINT: { x: 574, y: 790, width: 220, fontSize: 14, lineHeight: 18, maxLines: 2, textAnchor: "middle" },
  WISDOM: { x: 397, y: 990, width: 590, fontSize: 17, lineHeight: 22, maxLines: 3, textAnchor: "middle" },
  TODAY: { x: 397, y: 1018, width: 590, fontSize: 13, lineHeight: 17, maxLines: 3, textAnchor: "middle" },
  FOOTER: { x: 397, y: 1078, width: 620, fontSize: 15, lineHeight: 19, maxLines: 3, textAnchor: "middle" },
};

const CONTENT_RECTS = [
  { name: "header", x: 55, y: 50, width: 684, height: 140 },
  { name: "items-grid", x: 55, y: 210, width: 684, height: 470 },
  { name: "left-category", x: 55, y: 710, width: 330, height: 185 },
  { name: "right-category", x: 409, y: 710, width: 330, height: 185 },
  { name: "wisdom-panel", x: 55, y: 925, width: 684, height: 120 },
];

const ITEM_GRID = {
  columns: 2,
  rows: 4,
  startX: 79,
  startY: 265,
  cardWidth: 304,
  cardHeight: 88,
  columnGap: 28,
  rowGap: 20,
  textInsetX: 56,
  labelWidth: 220,
  fontSize: 14,
  lineHeight: 18,
  maxLines: 3,
};

function validateTemplateGeometry(svg, manifest) {
  const errors = [];
  errors.push(...validateA4Dimensions(svg));
  errors.push(...validateRectsWithinSafeMargin(CONTENT_RECTS, manifest.print_rules.safe_margin_mm));
  return errors;
}

function validateInput(manifest, registry, inputData, templateSvg) {
  const errors = validateCanonicalPrintableContract(manifest, inputData, {
    requiredContentFields: manifest.data_contract.required_content_fields,
  });

  const content = inputData.content || {};

  const mappedTextValues = {
    TITLE: inputData.title,
    SUBTITLE: inputData.subtitle,
    INSTRUCTION: content.instruction,
    CATEGORY_LEFT_TITLE: content.category_left_title,
    CATEGORY_LEFT_HINT: content.category_left_hint || "",
    CATEGORY_RIGHT_TITLE: content.category_right_title,
    CATEGORY_RIGHT_HINT: content.category_right_hint || "",
    WISDOM: inputData.wisdom?.statement || inputData.belief,
    TODAY: inputData.wisdom?.today || "",
    FOOTER: content.footer,
  };

  for (const [slotId, slotConfig] of Object.entries(manifest.slots)) {
    if (slotConfig.type === "text" && slotConfig.max_chars && mappedTextValues[slotId] && String(mappedTextValues[slotId]).length > slotConfig.max_chars) {
      errors.push(`Slot ${slotId} exceeds max_chars ${slotConfig.max_chars}.`);
    }
  }

  if (inputData.assets?.MAIN_ART && !registry[inputData.assets.MAIN_ART]) {
    errors.push(`Unknown asset_id for MAIN_ART: ${inputData.assets.MAIN_ART}`);
  }

  const items = Array.isArray(content.items) ? content.items : [];
  if (items.length !== manifest.data_contract.items.min) {
    errors.push(`PT03 requires exactly ${manifest.data_contract.items.min} items; received ${items.length}.`);
  }

  const seenIds = new Set();
  for (const item of items) {
    for (const fieldName of manifest.data_contract.items.required_fields) {
      if (item[fieldName] === undefined || item[fieldName] === null || item[fieldName] === "") {
        errors.push(`Item is missing required field ${fieldName}.`);
      }
    }

    if (item.id) {
      if (seenIds.has(item.id)) {
        errors.push(`Duplicate item id detected: ${item.id}`);
      }
      seenIds.add(item.id);
    }

    if (item.answer && !["LEFT", "RIGHT"].includes(item.answer)) {
      errors.push(`Invalid item answer for ${item.id}: ${item.answer}`);
    }

    if (item.label && String(item.label).length > 48) {
      errors.push(`Item ${item.id} exceeds 48 characters.`);
    }
  }

  const answerKey = inputData.answer_key || {};
  for (const bucket of ["LEFT", "RIGHT"]) {
    if (!Array.isArray(answerKey[bucket])) {
      errors.push(`answer_key.${bucket} must be an array.`);
    }
  }

  for (const bucket of ["LEFT", "RIGHT"]) {
    for (const itemId of answerKey[bucket] || []) {
      if (!seenIds.has(itemId)) {
        errors.push(`answer_key.${bucket} references unknown item id ${itemId}.`);
      }
    }
  }

  for (const [slotId, slotConfig] of Object.entries(manifest.slots)) {
    if (slotConfig.type === "text" && !templateSvg.includes(`id="${slotId}"`)) {
      errors.push(`SVG does not contain slot id ${slotId}.`);
    }
  }

  errors.push(...validateTemplateGeometry(templateSvg, manifest));
  return errors;
}

function buildItemCardMarkup(item, index) {
  const column = index % ITEM_GRID.columns;
  const row = Math.floor(index / ITEM_GRID.columns);
  const x = ITEM_GRID.startX + column * (ITEM_GRID.cardWidth + ITEM_GRID.columnGap);
  const y = ITEM_GRID.startY + row * (ITEM_GRID.cardHeight + ITEM_GRID.rowGap);
  const textX = x + ITEM_GRID.textInsetX;
  const numberCx = x + 26;
  const numberCy = y + 26;
  const lines = wrapText(item.label, {
    width: ITEM_GRID.labelWidth,
    fontSize: ITEM_GRID.fontSize,
    maxLines: ITEM_GRID.maxLines,
    lineHeight: ITEM_GRID.lineHeight,
  }, item.id);
  const textStartY = lines.length === 1
    ? y + 36
    : y + 36 - ((lines.length - 1) * ITEM_GRID.lineHeight) / 2;
  const tspanMarkup = lines.map((line, lineIndex) => (
    `<tspan x="${textX}" y="${textStartY + lineIndex * ITEM_GRID.lineHeight}">${escapeXml(line)}</tspan>`
  )).join("");

  return [
    `<g id="${escapeXml(item.id)}">`,
    `<rect x="${x}" y="${y}" width="${ITEM_GRID.cardWidth}" height="${ITEM_GRID.cardHeight}" rx="18" fill="#FFFFFF" stroke="#DDCEC2" stroke-width="2"/>`,
    `<circle cx="${numberCx}" cy="${numberCy}" r="16" fill="#FFF0DE" stroke="#E3C8AD" stroke-width="2"/>`,
    `<text x="${numberCx}" y="${numberCy + 5}" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="13" font-weight="700" fill="#6B4F43">${index + 1}</text>`,
    `<text x="${textX}" y="${y + 36}" font-family="DejaVu Sans,sans-serif" font-size="${ITEM_GRID.fontSize}" fill="#6F5B52">${tspanMarkup}</text>`,
    `<line x1="${x + ITEM_GRID.cardWidth - 52}" y1="${y + 20}" x2="${x + ITEM_GRID.cardWidth - 18}" y2="${y + 20}" stroke="#C8B8AC" stroke-width="2" stroke-dasharray="6 5"/>`,
    `<line x1="${x + ITEM_GRID.cardWidth - 52}" y1="${y + 34}" x2="${x + ITEM_GRID.cardWidth - 18}" y2="${y + 34}" stroke="#C8B8AC" stroke-width="2" stroke-dasharray="6 5"/>`,
    `</g>`,
  ].join("");
}

async function injectMainArt(svg, assetId, registry) {
  const assetMarkup = await buildAssetImageMarkup(assetId, registry, {
    x: 606,
    y: 66,
    width: 88,
    height: 88,
  });
  return replaceGroupContents(svg, "MAIN_ART", `${assetMarkup}`);
}

async function renderSvg(templateSvg, manifest, registry, inputData) {
  const content = inputData.content;
  const wisdom = inputData.wisdom || {};
  let svg = templateSvg;

  svg = replaceTextSlot(svg, "TITLE", inputData.title, manifest.slots.TITLE, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "SUBTITLE", inputData.subtitle, manifest.slots.SUBTITLE, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "INSTRUCTION", content.instruction, manifest.slots.INSTRUCTION, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "CATEGORY_LEFT_TITLE", content.category_left_title, manifest.slots.CATEGORY_LEFT_TITLE, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "CATEGORY_LEFT_HINT", content.category_left_hint || "", manifest.slots.CATEGORY_LEFT_HINT, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "CATEGORY_RIGHT_TITLE", content.category_right_title, manifest.slots.CATEGORY_RIGHT_TITLE, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "CATEGORY_RIGHT_HINT", content.category_right_hint || "", manifest.slots.CATEGORY_RIGHT_HINT, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "WISDOM", wisdom.statement || inputData.belief, manifest.slots.WISDOM, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "TODAY", wisdom.today || "", manifest.slots.TODAY, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "FOOTER", content.footer, manifest.slots.FOOTER, SLOT_LAYOUT);

  const itemMarkup = content.items.map((item, index) => buildItemCardMarkup(item, index)).join("");
  svg = replaceGroupContents(svg, "ITEMS_GRID", itemMarkup);
  svg = await injectMainArt(svg, inputData.assets.MAIN_ART, registry);

  return svg;
}

function buildAnswerKey(inputData) {
  const items = inputData.content.items;
  const indexById = new Map(items.map((item) => [item.id, item]));
  return {
    template_id: inputData.template_id,
    theme_id: inputData.theme_id,
    title: inputData.title,
    left_category: {
      title: inputData.content.category_left_title,
      items: (inputData.answer_key.LEFT || []).map((itemId) => ({
        id: itemId,
        label: indexById.get(itemId)?.label || null,
      })),
    },
    right_category: {
      title: inputData.content.category_right_title,
      items: (inputData.answer_key.RIGHT || []).map((itemId) => ({
        id: itemId,
        label: indexById.get(itemId)?.label || null,
      })),
    },
  };
}

export async function renderPt03Template({ templateDir, assetRegistryPath, inputJsonPath, outputDir }) {
  const manifestPath = path.join(templateDir, "PT03_SORT_MATCH_DECODE.manifest.json");
  const templateSvgPath = path.join(templateDir, "PT03_SORT_MATCH_DECODE_MASTER.svg");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const templateSvg = await fs.readFile(templateSvgPath, "utf8");
  const registry = JSON.parse(await fs.readFile(assetRegistryPath, "utf8"));
  const inputData = JSON.parse(await fs.readFile(inputJsonPath, "utf8"));

  const errors = validateInput(manifest, registry, inputData, templateSvg);
  let svg = templateSvg;

  if (errors.length === 0) {
    try {
      svg = await renderSvg(templateSvg, manifest, registry, inputData);
      const unresolved = findUnresolvedSlots(svg);
      if (unresolved.length > 0) {
        errors.push(`Unresolved slots remain: ${unresolved.join(", ")}`);
      }
      if (/href="\{\{/.test(svg)) {
        errors.push("Broken asset reference placeholder remains in SVG.");
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
    await fs.writeFile(answerKeyPath, `${JSON.stringify(buildAnswerKey(inputData), null, 2)}\n`, "utf8");
  }

  const report = {
    template_id: manifest.template_id,
    input_json: path.relative(process.cwd(), inputJsonPath),
    generated_at: new Date().toISOString(),
    final_result: errors.length === 0 ? "APPROVED" : "NEEDS_REVIEW",
    validation: {
      template_exists: true,
      manifest_exists: true,
      required_fields_exist: errors.every((item) => !item.includes("Required ")),
      no_duplicate_item_ids: errors.every((item) => !item.startsWith("Duplicate item id")),
      asset_ids_exist: errors.every((item) => !item.includes("Unknown asset_id")),
      text_fits: errors.every((item) => !item.includes("does not fit") && !item.includes("exceeds")),
      unresolved_slots: errors.every((item) => !item.startsWith("Unresolved slots remain")),
      broken_asset_references: errors.every((item) => !item.includes("Broken asset reference")),
      a4_dimensions_correct: errors.every((item) => !item.includes("A4 dimensions")),
      safe_margins_preserved: errors.every((item) => !item.includes("safe margin")),
      vector_text_required: manifest.print_rules.vector_text_required === true,
      child_pdf_reveals_answers: false,
      answer_key_generated: errors.length === 0,
      render_contract: manifest.render_contract,
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
      item_count: Array.isArray(inputData.content?.items) ? inputData.content.items.length : 0,
    },
  };

  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}
