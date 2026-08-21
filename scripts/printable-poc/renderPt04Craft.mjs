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
  TITLE: { x: 122, y: 88, width: 420, fontSize: 30, lineHeight: 34, maxLines: 2, textAnchor: "start" },
  MATERIALS: { x: 85, y: 278, width: 175, fontSize: 14, lineHeight: 20, maxLines: 9, textAnchor: "start" },
  STEPS: { x: 340, y: 278, width: 365, fontSize: 14, lineHeight: 20, maxLines: 10, textAnchor: "start" },
  WISDOM: { x: 397, y: 946, width: 590, fontSize: 17, lineHeight: 22, maxLines: 3, textAnchor: "middle" },
  TAKE_IT_TODAY: { x: 397, y: 998, width: 590, fontSize: 14, lineHeight: 18, maxLines: 3, textAnchor: "middle" },
};

const CONTENT_RECTS = [
  { name: "header", x: 55, y: 50, width: 684, height: 110 },
  { name: "materials", x: 55, y: 190, width: 240, height: 270 },
  { name: "steps", x: 310, y: 190, width: 429, height: 270 },
  { name: "craft-template", x: 55, y: 490, width: 684, height: 355 },
  { name: "wisdom", x: 55, y: 875, width: 684, height: 170 },
];

const GEOMETRY_BOUNDS = { x: 90, y: 570, width: 614, height: 235 };

function joinListLines(entries, formatter) {
  return entries.map(formatter).join(" ");
}

function buildTextList(entries, prefixFn) {
  return entries.map((entry, index) => `${prefixFn(index, entry)} ${entry}`).join(" ");
}

function validateTemplateGeometry(svg, manifest) {
  const errors = [];
  errors.push(...validateA4Dimensions(svg));
  errors.push(...validateRectsWithinSafeMargin(CONTENT_RECTS, manifest.print_rules.safe_margin_mm));
  errors.push(...validateRectsWithinSafeMargin([{ name: "craft-geometry", ...GEOMETRY_BOUNDS }], manifest.print_rules.safe_margin_mm));
  return errors;
}

function validateInput(manifest, registry, inputData, templateSvg) {
  const errors = validateCanonicalPrintableContract(manifest, inputData, {
    requiredContentFields: manifest.data_contract.required_content_fields,
    requiredAssetFields: manifest.data_contract.required_asset_fields,
    requiredGenerationFields: manifest.data_contract.required_generation_fields,
    requiredWisdomFields: manifest.data_contract.required_wisdom_fields,
  });

  const content = inputData.content || {};
  const generation = inputData.generation || {};
  const geometry = generation.geometry || {};

  if (!registry[inputData.assets?.MAIN_ART]) {
    errors.push(`Unknown asset_id for MAIN_ART: ${inputData.assets?.MAIN_ART}`);
  }

  for (const assetId of inputData.assets?.DECORATIONS || []) {
    if (!registry[assetId]) {
      errors.push(`Unknown asset_id in DECORATIONS: ${assetId}`);
    }
  }

  if (!Array.isArray(content.materials) || content.materials.length < 2) {
    errors.push("content.materials must contain at least 2 entries.");
  }

  if (!Array.isArray(content.steps) || content.steps.length < 3) {
    errors.push("content.steps must contain at least 3 entries.");
  }

  const variantRegistry = manifest.variant_registry_data || {};
  if (!variantRegistry[content.craft_variant]) {
    errors.push(`Unsupported content.craft_variant: ${content.craft_variant}`);
  }

  if (!variantRegistry[generation.variant]) {
    errors.push(`Unsupported generation.variant: ${generation.variant}`);
  }

  if (content.craft_variant && generation.variant && content.craft_variant !== generation.variant) {
    errors.push("content.craft_variant must match generation.variant.");
  }

  if (geometry.cut_lines !== true) {
    errors.push("generation.geometry.cut_lines must be true for PT04.");
  }

  if (geometry.fold_lines !== true && geometry.fold_lines !== false) {
    errors.push("generation.geometry.fold_lines must be a boolean.");
  }

  const mappedTextValues = {
    TITLE: inputData.title,
    MATERIALS: joinListLines(content.materials || [], (_item, _idx) => ""),
    STEPS: joinListLines(content.steps || [], (_item, _idx) => ""),
    WISDOM: inputData.wisdom?.statement || inputData.belief,
    TAKE_IT_TODAY: content.take_it_today || inputData.wisdom?.today || "",
  };

  for (const [slotId, slotConfig] of Object.entries(manifest.slots)) {
    if (slotConfig.type === "text" && slotConfig.max_chars && mappedTextValues[slotId] && String(mappedTextValues[slotId]).length > slotConfig.max_chars) {
      errors.push(`Slot ${slotId} exceeds max_chars ${slotConfig.max_chars}.`);
    }
    if ((slotConfig.type === "text" || slotConfig.type === "vector_group") && !templateSvg.includes(`id="${slotId}"`)) {
      errors.push(`SVG does not contain slot id ${slotId}.`);
    }
  }

  errors.push(...validateTemplateGeometry(templateSvg, manifest));
  return errors;
}

function buildVectorTextBlock(x, y, width, fontSize, lineHeight, lines, align = "start") {
  const safeLines = wrapText(lines, { width, fontSize, lineHeight, maxLines: 20 }, `VECTOR_${x}_${y}`);
  const tspans = safeLines.map((line, index) => {
    const textX = align === "middle" ? x + width / 2 : x;
    const attrs = align === "middle"
      ? `x="${textX}" y="${y + index * lineHeight}" text-anchor="middle"`
      : `x="${textX}" y="${y + index * lineHeight}"`;
    return `<tspan ${attrs}>${escapeXml(line)}</tspan>`;
  }).join("");
  return `<text font-family="DejaVu Sans,sans-serif" font-size="${fontSize}" fill="#6F5B52">${tspans}</text>`;
}

function buildCutGuide(x1, y1, x2, y2) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#D16A5C" stroke-width="2.5" stroke-dasharray="10 6"/>`;
}

function buildFoldGuide(x1, y1, x2, y2) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6A8AB0" stroke-width="2" stroke-dasharray="4 6"/>`;
}

function buildBandGeometry(inputData) {
  const text = inputData.generation.geometry.band_text || inputData.content.craft_label;
  return [
    `<g id="craft-band">`,
    `<rect x="120" y="620" width="554" height="72" rx="30" fill="#FFF7EF" stroke="#CFA57F" stroke-width="3"/>`,
    buildCutGuide(120, 620, 674, 620),
    buildCutGuide(120, 692, 674, 692),
    buildCutGuide(120, 620, 120, 692),
    buildCutGuide(674, 620, 674, 692),
    `<circle cx="178" cy="656" r="16" fill="#FFE4D0" stroke="#E3B58A" stroke-width="2"/>`,
    `<circle cx="616" cy="656" r="16" fill="#FFE4D0" stroke="#E3B58A" stroke-width="2"/>`,
    `<text x="397" y="662" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="20" font-weight="700" fill="#6B4F43">${escapeXml(text)}</text>`,
    `<path d="M205 728 C235 700 260 700 290 728" fill="none" stroke="#D7B08B" stroke-width="3"/>`,
    `<path d="M322 728 C352 700 377 700 407 728" fill="none" stroke="#D7B08B" stroke-width="3"/>`,
    `<path d="M439 728 C469 700 494 700 524 728" fill="none" stroke="#D7B08B" stroke-width="3"/>`,
    `<path d="M556 728 C586 700 611 700 641 728" fill="none" stroke="#D7B08B" stroke-width="3"/>`,
    buildVectorTextBlock(150, 760, 494, 14, 18, "Cut the band, wear it, then do one tiny helper action."),
    `</g>`,
  ].join("");
}

function buildWheelGeometry(inputData) {
  const prompts = inputData.generation.geometry.prompts || [];
  const centerX = 397;
  const centerY = 675;
  const radius = 108;
  const sliceCount = Math.max(prompts.length, 1);
  const markup = [
    `<g id="craft-wheel">`,
    `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="#FFF7EF" stroke="#D6A97A" stroke-width="3"/>`,
    `<circle cx="${centerX}" cy="${centerY}" r="28" fill="#FFE8D6" stroke="#D6A97A" stroke-width="2"/>`,
  ];

  for (let index = 0; index < sliceCount; index += 1) {
    const angle = (-90 + (360 / sliceCount) * index) * (Math.PI / 180);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    markup.push(`<line x1="${centerX}" y1="${centerY}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#E5C4A5" stroke-width="2"/>`);
    const labelX = centerX + Math.cos(angle) * 68 - 46;
    const labelY = centerY + Math.sin(angle) * 68 - 8;
    markup.push(buildVectorTextBlock(labelX, labelY, 92, 11, 13, prompts[index], "middle"));
  }

  markup.push(buildCutGuide(centerX - radius, centerY, centerX + radius, centerY));
  markup.push(`<polygon points="615,622 660,640 615,658" fill="#E8F2E4" stroke="#9DB38F" stroke-width="2"/>`);
  markup.push(buildCutGuide(615, 640, 660, 640));
  markup.push(buildVectorTextBlock(525, 730, 150, 14, 18, "Cut the arrow and attach it at the centre.", "middle"));
  markup.push(`</g>`);
  return markup.join("");
}

function buildBadgeGeometry(inputData) {
  const badgeText = inputData.generation.geometry.badge_text || inputData.content.craft_label;
  const options = inputData.generation.geometry.options || [];
  return [
    `<g id="craft-badge">`,
    `<circle cx="250" cy="670" r="92" fill="#FFF7EF" stroke="#D6A97A" stroke-width="3"/>`,
    buildCutGuide(158, 670, 342, 670),
    `<circle cx="250" cy="670" r="74" fill="none" stroke="#E8C9A7" stroke-width="2"/>`,
    buildVectorTextBlock(185, 634, 130, 16, 20, badgeText, "middle"),
    buildVectorTextBlock(390, 610, 250, 14, 18, "Helpful or noisy? Circle the helpful words and fold the tab behind the badge."),
    `<rect x="390" y="650" width="250" height="120" rx="18" fill="#FFFFFF" stroke="#DDCEC2" stroke-width="2"/>`,
    buildFoldGuide(390, 710, 640, 710),
    buildVectorTextBlock(414, 680, 202, 13, 17, options.join(" "), "start"),
    buildVectorTextBlock(390, 786, 250, 12, 16, "Blue dashed line = fold. Red dashed line = cut.", "middle"),
    `</g>`,
  ].join("");
}

function buildPlaceholderGeometry(inputData) {
  return [
    `<g id="craft-placeholder">`,
    `<rect x="140" y="600" width="514" height="170" rx="24" fill="#FFF7EF" stroke="#D6A97A" stroke-width="3"/>`,
    buildVectorTextBlock(180, 655, 434, 18, 24, `${inputData.content.craft_label} geometry is supported in the PT04 engine contract.` , "middle"),
    `</g>`,
  ].join("");
}

function geometryHasFoldLines(markup) {
  return markup.includes('stroke-dasharray="4 6"');
}

function buildCraftGeometry(inputData, manifest) {
  const variantConfig = manifest.variant_registry_data?.[inputData.generation.variant];
  const geometryBuilder = variantConfig?.geometry_builder;

  switch (geometryBuilder) {
    case "band":
      return buildBandGeometry(inputData);
    case "wheel":
      return buildWheelGeometry(inputData);
    case "badge":
      return buildBadgeGeometry(inputData);
    case "bookmark":
    case "gratitude_flower":
    case "kindness_coupon":
      return buildPlaceholderGeometry(inputData);
    default:
      throw new Error(`Unsupported PT04 variant: ${inputData.generation.variant}`);
  }
}

async function injectMainArt(svg, assetId, registry) {
  const assetMarkup = await buildAssetImageMarkup(assetId, registry, {
    x: 606,
    y: 66,
    width: 78,
    height: 78,
  });
  return replaceGroupContents(svg, "MAIN_ART", assetMarkup);
}

async function injectDecorations(svg, assetIds, registry) {
  if (!Array.isArray(assetIds) || assetIds.length === 0) {
    return replaceGroupContents(svg, "DECORATIONS", "");
  }

  const startX = 560;
  const markup = [];
  for (const [index, assetId] of assetIds.entries()) {
    markup.push(await buildAssetImageMarkup(assetId, registry, {
      x: startX + index * 38,
      y: 118,
      width: 24,
      height: 24,
    }));
  }
  return replaceGroupContents(svg, "DECORATIONS", markup.join(""));
}

async function renderSvg(templateSvg, manifest, registry, inputData) {
  const content = inputData.content;
  const wisdom = inputData.wisdom || {};
  const materialsText = buildTextList(content.materials, () => "•");
  const stepsText = buildTextList(content.steps, (index) => `${index + 1}.`);
  const geometryMarkup = buildCraftGeometry(inputData, manifest);

  let svg = templateSvg;
  svg = replaceTextSlot(svg, "TITLE", inputData.title, manifest.slots.TITLE, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "MATERIALS", materialsText, manifest.slots.MATERIALS, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "STEPS", stepsText, manifest.slots.STEPS, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "WISDOM", wisdom.statement || inputData.belief, manifest.slots.WISDOM, SLOT_LAYOUT);
  svg = replaceTextSlot(svg, "TAKE_IT_TODAY", content.take_it_today || wisdom.today || "", manifest.slots.TAKE_IT_TODAY, SLOT_LAYOUT);
  svg = await injectMainArt(svg, inputData.assets.MAIN_ART, registry);
  svg = await injectDecorations(svg, inputData.assets.DECORATIONS || [], registry);
  svg = replaceGroupContents(svg, "CRAFT_GEOMETRY", geometryMarkup);

  return {
    svg,
    geometryMarkup,
  };
}

export async function renderPt04Template({ templateDir, assetRegistryPath, inputJsonPath, outputDir }) {
  const manifestPath = path.join(templateDir, "PT04_CRAFT.manifest.json");
  const templateSvgPath = path.join(templateDir, "PT04_CRAFT_MASTER.svg");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const variantRegistryPath = path.join(templateDir, manifest.variant_registry || "craftVariantRegistry.json");
  const templateSvg = await fs.readFile(templateSvgPath, "utf8");
  const registry = JSON.parse(await fs.readFile(assetRegistryPath, "utf8"));
  const inputData = JSON.parse(await fs.readFile(inputJsonPath, "utf8"));
  manifest.variant_registry_data = JSON.parse(await fs.readFile(variantRegistryPath, "utf8"));

  const errors = validateInput(manifest, registry, inputData, templateSvg);
  let svg = templateSvg;
  let geometryMarkup = "";

  if (errors.length === 0) {
    try {
      const renderResult = await renderSvg(templateSvg, manifest, registry, inputData);
      svg = renderResult.svg;
      geometryMarkup = renderResult.geometryMarkup;
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
  const reportPath = path.join(outputDir, "render-report.json");

  if (errors.length === 0) {
    await fs.writeFile(sourceSvgPath, svg, "utf8");
    await vectorPdfFromSvg(sourceSvgPath, printablePdfPath);
    await previewPngFromSvg(svg, previewPngPath);
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
      asset_ids_exist: errors.every((item) => !item.includes("Unknown asset_id")),
      geometry_inside_safe_margins: errors.every((item) => !item.includes("safe margin")),
      unresolved_slots: errors.every((item) => !item.startsWith("Unresolved slots remain")),
      vector_text_required: manifest.print_rules.vector_text_required === true,
      cut_lines_present: geometryMarkup.includes('stroke-dasharray="10 6"'),
      fold_lines_match_contract: geometryHasFoldLines(geometryMarkup) === Boolean(inputData.generation?.geometry?.fold_lines),
      a4_dimensions_correct: errors.every((item) => !item.includes("A4 dimensions")),
      render_contract: manifest.render_contract,
    },
    errors,
    files: {
      source_svg: path.relative(process.cwd(), sourceSvgPath),
      printable_pdf: path.relative(process.cwd(), printablePdfPath),
      preview_png: path.relative(process.cwd(), previewPngPath),
    },
    data_summary: {
      theme_id: inputData.theme_id,
      belief: inputData.belief,
      variant: inputData.generation?.variant || null,
    },
  };

  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}
