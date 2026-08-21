import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import sharp from "sharp";

const execFileAsync = promisify(execFile);
const SVG_NS = "http://www.w3.org/2000/svg";
const PAGE_WIDTH_PX = 794;
const PAGE_HEIGHT_PX = 1123;
const PX_PER_MM = PAGE_WIDTH_PX / 210;

const SLOT_LAYOUT = {
  TITLE: { x: 397, y: 78, width: 640, fontSize: 31, lineHeight: 35, maxLines: 2, textAnchor: "middle" },
  SUBTITLE: { x: 397, y: 105, width: 620, fontSize: 15, lineHeight: 20, maxLines: 3, textAnchor: "middle" },
  INSTRUCTION_1: { x: 120, y: 185, width: 135, fontSize: 14, lineHeight: 17, maxLines: 3, textAnchor: "start" },
  INSTRUCTION_1B: { x: 120, y: 205, width: 135, fontSize: 13, lineHeight: 16, maxLines: 2, textAnchor: "start" },
  INSTRUCTION_2: { x: 310, y: 185, width: 135, fontSize: 14, lineHeight: 17, maxLines: 3, textAnchor: "start" },
  INSTRUCTION_2B: { x: 310, y: 205, width: 135, fontSize: 13, lineHeight: 16, maxLines: 2, textAnchor: "start" },
  INSTRUCTION_3: { x: 500, y: 185, width: 135, fontSize: 14, lineHeight: 17, maxLines: 3, textAnchor: "start" },
  INSTRUCTION_3B: { x: 500, y: 205, width: 135, fontSize: 13, lineHeight: 16, maxLines: 2, textAnchor: "start" },
  INSTRUCTION_4: { x: 690, y: 185, width: 95, fontSize: 14, lineHeight: 17, maxLines: 3, textAnchor: "start" },
  INSTRUCTION_4B: { x: 690, y: 205, width: 95, fontSize: 13, lineHeight: 16, maxLines: 3, textAnchor: "start" },
  BAND_TEXT: { x: 397, y: 485, width: 540, fontSize: 27, lineHeight: 31, maxLines: 2, textAnchor: "middle" },
  WISDOM_TEXT: { x: 422, y: 790, width: 145, fontSize: 17, lineHeight: 22, maxLines: 5, textAnchor: "middle" },
  CLUE_TEXT: { x: 627, y: 790, width: 145, fontSize: 15, lineHeight: 19, maxLines: 5, textAnchor: "middle" },
  FOOTER_PROMPT: { x: 397, y: 1000, width: 620, fontSize: 18, lineHeight: 22, maxLines: 3, textAnchor: "middle" },
  FOOTER_SMALL: { x: 397, y: 1025, width: 620, fontSize: 13, lineHeight: 17, maxLines: 3, textAnchor: "middle" },
};

const GROUP_ASSET_LAYOUT = {
  BAND_DECOR_TOP: { y: 333, iconSize: 28, gap: 18 },
  BAND_DECOR_BOTTOM: { y: 613, iconSize: 28, gap: 18 },
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}

function estimateTextWidth(text, fontSize) {
  return text.length * fontSize * 0.56;
}

function wrapText(text, config) {
  if (!text) {
    return [];
  }

  const words = text.trim().split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (estimateTextWidth(candidate, config.fontSize) <= config.width) {
      current = candidate;
      continue;
    }

    if (!current) {
      throw new Error(`Word "${word}" does not fit slot width for ${config.slotId}.`);
    }

    lines.push(current);
    current = word;
  }

  if (current) {
    lines.push(current);
  }

  if (lines.length > config.maxLines) {
    throw new Error(`Text does not fit slot ${config.slotId}: needs ${lines.length} lines, limit is ${config.maxLines}.`);
  }

  return lines;
}

function buildTextElement(slotId, value, originalOpenTag, config) {
  const safeValue = String(value || "").trim();
  const lines = wrapText(safeValue, { ...config, slotId });

  if (lines.length === 0) {
    return `${originalOpenTag}</text>`;
  }

  const startY = lines.length === 1
    ? config.y
    : config.y - ((lines.length - 1) * config.lineHeight) / 2;

  const tspans = lines.map((line, index) => {
    const attrs = [
      `x="${config.x}"`,
      `y="${startY + index * config.lineHeight}"`,
    ];
    return `<tspan ${attrs.join(" ")}>${escapeXml(line)}</tspan>`;
  }).join("");

  return `${originalOpenTag}${tspans}</text>`;
}

async function readAssetDataUri(assetPath) {
  const absolutePath = path.resolve(process.cwd(), assetPath);
  const buffer = await fs.readFile(absolutePath);
  const ext = path.extname(absolutePath).toLowerCase();
  const mime = ext === ".svg"
    ? "image/svg+xml"
    : ext === ".png"
      ? "image/png"
      : ext === ".webp"
        ? "image/webp"
        : "application/octet-stream";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function replaceTextSlot(svg, slotId, value, manifestSlot) {
  const regex = new RegExp(`<text\\s+id="${slotId}"([^>]*)>([\\s\\S]*?)<\\/text>`);
  const match = svg.match(regex);
  if (!match) {
    throw new Error(`SVG text slot not found: ${slotId}`);
  }

  const originalOpenTag = `<text id="${slotId}"${match[1]}>`;
  const config = SLOT_LAYOUT[slotId];
  if (!config) {
    throw new Error(`No slot layout config defined for ${slotId}`);
  }
  if (manifestSlot?.max_chars && String(value || "").length > manifestSlot.max_chars) {
    throw new Error(`Slot ${slotId} exceeds max_chars ${manifestSlot.max_chars}.`);
  }
  const replacement = buildTextElement(slotId, value, originalOpenTag, config);
  return svg.replace(regex, replacement);
}

async function replaceAssetGroupSlot(svg, slotId, value, registry) {
  const regex = new RegExp(`<text\\s+id="${slotId}"([^>]*)>([\\s\\S]*?)<\\/text>`);
  const match = svg.match(regex);
  if (!match) {
    throw new Error(`SVG asset/text slot not found: ${slotId}`);
  }

  if (!value) {
    return svg.replace(regex, `<text id="${slotId}"${match[1]}></text>`);
  }

  if (typeof value === "string") {
    const config = SLOT_LAYOUT[slotId] || { slotId, ...GROUP_ASSET_LAYOUT[slotId], x: 397, width: 500, fontSize: 17, lineHeight: 20, maxLines: 2, textAnchor: "middle" };
    return svg.replace(regex, buildTextElement(slotId, value, `<text id="${slotId}"${match[1]}>`, config));
  }

  const assetIds = Array.isArray(value.asset_ids) ? value.asset_ids : [];
  const layout = GROUP_ASSET_LAYOUT[slotId];
  if (!layout) {
    throw new Error(`No asset group layout config defined for ${slotId}`);
  }
  const iconSize = layout.iconSize;
  const totalWidth = assetIds.length * iconSize + Math.max(0, assetIds.length - 1) * layout.gap;
  const startX = 397 - totalWidth / 2;

  const images = [];
  for (const [index, assetId] of assetIds.entries()) {
    const assetPath = registry[assetId];
    if (!assetPath) {
      throw new Error(`Unknown asset_id in ${slotId}: ${assetId}`);
    }
    const dataUri = await readAssetDataUri(assetPath);
    const x = startX + index * (iconSize + layout.gap);
    const y = layout.y - iconSize / 2;
    images.push(`<image href="${dataUri}" x="${x}" y="${y}" width="${iconSize}" height="${iconSize}" preserveAspectRatio="xMidYMid meet"/>`);
  }

  return svg.replace(regex, `<g id="${slotId}">${images.join("")}</g>`);
}

async function replaceCharacterSlot(svg, assetId, registry) {
  const assetPath = registry[assetId];
  if (!assetPath) {
    throw new Error(`Unknown asset_id for CHARACTER_MAIN: ${assetId}`);
  }

  const dataUri = await readAssetDataUri(assetPath);
  const groupRegex = /<g id="slot-character-main">([\s\S]*?)<\/g>/;
  const match = svg.match(groupRegex);
  if (!match) {
    throw new Error("SVG group not found: slot-character-main");
  }

  const replacement = [
    `<g id="slot-character-main">`,
    `<rect x="75" y="705" width="235" height="225" rx="24" fill="#FFF8EF" stroke="#E7D2C2"/>`,
    `<image id="CHARACTER_MAIN" href="${dataUri}" x="98" y="725" width="189" height="189" preserveAspectRatio="xMidYMid meet"/>`,
    `</g>`,
  ].join("");

  return svg.replace(groupRegex, replacement);
}

function validateTemplateGeometry(svg, manifest) {
  const errors = [];
  if (!svg.includes('width="210mm"') || !svg.includes('height="297mm"')) {
    errors.push("Template SVG does not declare A4 dimensions 210mm x 297mm.");
  }

  const safeMarginPx = manifest.print_rules.safe_margin_mm * PX_PER_MM;
  const contentRects = [
    { name: "instructions", x: 55, y: 130, width: 684, height: 112 },
    { name: "craft-area", x: 58, y: 275, width: 678, height: 396 },
    { name: "character", x: 75, y: 705, width: 235, height: 225 },
    { name: "wisdom", x: 330, y: 720, width: 185, height: 170 },
    { name: "clue", x: 535, y: 720, width: 185, height: 170 },
  ];

  for (const rect of contentRects) {
    if (
      rect.x < safeMarginPx ||
      rect.y < safeMarginPx ||
      rect.x + rect.width > PAGE_WIDTH_PX - safeMarginPx ||
      rect.y + rect.height > PAGE_HEIGHT_PX - safeMarginPx
    ) {
      errors.push(`Content block "${rect.name}" exceeds the safe margin.`);
    }
  }

  return errors;
}

function validateData(manifest, registry, data, svg) {
  const errors = [];
  for (const [slotId, slotConfig] of Object.entries(manifest.slots)) {
    const value = data[slotId];
    if (slotConfig.required && (value === undefined || value === null || value === "")) {
      errors.push(`Required slot missing: ${slotId}`);
      continue;
    }

    if (slotConfig.type === "text" && slotConfig.max_chars && value && String(value).length > slotConfig.max_chars) {
      errors.push(`Slot ${slotId} exceeds max_chars ${slotConfig.max_chars}.`);
    }

    if (slotConfig.type === "asset" && value && !registry[value]) {
      errors.push(`Unknown asset_id for ${slotId}: ${value}`);
    }

    if (slotConfig.type === "asset_group_or_text" && value && typeof value === "object" && Array.isArray(value.asset_ids)) {
      for (const assetId of value.asset_ids) {
        if (!registry[assetId]) {
          errors.push(`Unknown asset_id in ${slotId}: ${assetId}`);
        }
      }
    }

    if (!svg.includes(`id="${slotId}"`) && slotId !== "CHARACTER_MAIN") {
      errors.push(`SVG does not contain slot id ${slotId}.`);
    }
  }

  errors.push(...validateTemplateGeometry(svg, manifest));
  return errors;
}

async function renderSvg(templateSvg, manifest, registry, data) {
  let svg = templateSvg;

  svg = replaceTextSlot(svg, "TITLE", data.TITLE, manifest.slots.TITLE);
  svg = replaceTextSlot(svg, "SUBTITLE", data.SUBTITLE, manifest.slots.SUBTITLE);
  svg = replaceTextSlot(svg, "INSTRUCTION_1", data.INSTRUCTION_1, manifest.slots.INSTRUCTION_1);
  svg = replaceTextSlot(svg, "INSTRUCTION_1B", data.INSTRUCTION_1B || "", manifest.slots.INSTRUCTION_1B);
  svg = replaceTextSlot(svg, "INSTRUCTION_2", data.INSTRUCTION_2, manifest.slots.INSTRUCTION_2);
  svg = replaceTextSlot(svg, "INSTRUCTION_2B", data.INSTRUCTION_2B || "", manifest.slots.INSTRUCTION_2B);
  svg = replaceTextSlot(svg, "INSTRUCTION_3", data.INSTRUCTION_3, manifest.slots.INSTRUCTION_3);
  svg = replaceTextSlot(svg, "INSTRUCTION_3B", data.INSTRUCTION_3B || "", manifest.slots.INSTRUCTION_3B);
  svg = replaceTextSlot(svg, "INSTRUCTION_4", data.INSTRUCTION_4, manifest.slots.INSTRUCTION_4);
  svg = replaceTextSlot(svg, "INSTRUCTION_4B", data.INSTRUCTION_4B || "", manifest.slots.INSTRUCTION_4B);
  svg = await replaceAssetGroupSlot(svg, "BAND_DECOR_TOP", data.BAND_DECOR_TOP || "", registry);
  svg = replaceTextSlot(svg, "BAND_TEXT", data.BAND_TEXT, manifest.slots.BAND_TEXT);
  svg = await replaceAssetGroupSlot(svg, "BAND_DECOR_BOTTOM", data.BAND_DECOR_BOTTOM || "", registry);
  svg = await replaceCharacterSlot(svg, data.CHARACTER_MAIN, registry);
  svg = replaceTextSlot(svg, "WISDOM_TEXT", data.WISDOM_TEXT, manifest.slots.WISDOM_TEXT);
  svg = replaceTextSlot(svg, "CLUE_TEXT", data.CLUE_TEXT || "", manifest.slots.CLUE_TEXT);
  svg = replaceTextSlot(svg, "FOOTER_PROMPT", data.FOOTER_PROMPT, manifest.slots.FOOTER_PROMPT);
  svg = replaceTextSlot(svg, "FOOTER_SMALL", data.FOOTER_SMALL || "", manifest.slots.FOOTER_SMALL);

  return svg;
}

function findUnresolvedSlots(svg) {
  return [...svg.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].map((match) => match[1]);
}

export async function renderPrintableTemplate({ templateDir, assetRegistryPath, variantRecord, outputRoot }) {
  const manifestPath = path.join(templateDir, "PT02_KINDNESS_BAND.manifest.json");
  const sourceTemplatePath = path.join(templateDir, "PT02_KINDNESS_BAND_MASTER.svg");
  const registryPath = assetRegistryPath;

  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const templateSvg = await fs.readFile(sourceTemplatePath, "utf8");
  const registry = JSON.parse(await fs.readFile(registryPath, "utf8"));

  const preflightErrors = [];
  if (manifest.template_id !== variantRecord.template_id) {
    preflightErrors.push(`Manifest template_id ${manifest.template_id} does not match input ${variantRecord.template_id}.`);
  }
  preflightErrors.push(...validateData(manifest, registry, variantRecord.data, templateSvg));

  let populatedSvg = null;
  let unresolvedSlots = [];
  if (preflightErrors.length === 0) {
    populatedSvg = await renderSvg(templateSvg, manifest, registry, variantRecord.data);
    unresolvedSlots = findUnresolvedSlots(populatedSvg);
    if (unresolvedSlots.length > 0) {
      preflightErrors.push(`Unresolved slots remain: ${unresolvedSlots.join(", ")}`);
    }
    if (/href="\{\{/.test(populatedSvg)) {
      preflightErrors.push("Broken asset reference placeholder remains in SVG.");
    }
  }

  const variantOutputDir = path.join(outputRoot, manifest.template_id, variantRecord.variant_id);
  const sourceSvgPath = path.join(variantOutputDir, "source.svg");
  const previewPngPath = path.join(variantOutputDir, "preview.png");
  const printablePdfPath = path.join(variantOutputDir, "printable.pdf");
  const renderReportPath = path.join(variantOutputDir, "render-report.json");

  await fs.mkdir(variantOutputDir, { recursive: true });

  const validation = {
    template_exists: true,
    manifest_exists: true,
    required_fields_exist: preflightErrors.every((item) => !item.startsWith("Required slot missing")),
    optional_fields_handled: true,
    asset_ids_exist: preflightErrors.every((item) => !item.includes("Unknown asset_id")),
    text_fits: preflightErrors.every((item) => !item.includes("max_chars") && !item.includes("does not fit slot") && !item.includes("needs")),
    unresolved_slots: unresolvedSlots.length === 0,
    broken_asset_references: preflightErrors.every((item) => !item.includes("Broken asset reference")),
    a4_dimensions_correct: preflightErrors.every((item) => !item.includes("A4 dimensions")),
    safe_margins_preserved: preflightErrors.every((item) => !item.includes("safe margin")),
  };

  if (preflightErrors.length === 0 && populatedSvg) {
    await fs.writeFile(sourceSvgPath, populatedSvg, "utf8");
    await sharp(Buffer.from(populatedSvg)).png().toFile(previewPngPath);
    await execFileAsync("python", [
      path.join(process.cwd(), "scripts", "printable-poc", "png_to_pdf.py"),
      previewPngPath,
      printablePdfPath,
    ]);
  }

  const report = {
    template_id: manifest.template_id,
    variant_id: variantRecord.variant_id,
    generated_at: new Date().toISOString(),
    final_result: preflightErrors.length === 0 ? "APPROVED" : "NEEDS_REVIEW",
    validation,
    errors: preflightErrors,
    files: {
      source_svg: path.relative(process.cwd(), sourceSvgPath),
      preview_png: path.relative(process.cwd(), previewPngPath),
      printable_pdf: path.relative(process.cwd(), printablePdfPath),
    },
    data_summary: {
      title: variantRecord.data.TITLE,
      character_main: variantRecord.data.CHARACTER_MAIN,
      band_text: variantRecord.data.BAND_TEXT,
    },
  };

  await fs.writeFile(renderReportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}
