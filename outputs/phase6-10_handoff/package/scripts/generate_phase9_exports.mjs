import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [inputPath, outputRootArg] = process.argv.slice(2);

if (!inputPath || !outputRootArg) {
  console.error("Usage: node scripts/generate_phase9_exports.mjs <export-json> <output-root>");
  process.exit(1);
}

const repoRoot = process.cwd();
const input = JSON.parse(await fs.readFile(inputPath, "utf8"));
const { storyPackage, assetManifest, exportMetadata, exportReport } = input;
const slug = exportMetadata.titleSlug || "story-export";
const outputRoot = path.resolve(repoRoot, outputRootArg, slug);
const assetsDir = path.join(outputRoot, "assets");
const digitalDir = path.join(outputRoot, "digital-story");
const iconsDir = path.join(digitalDir, "icons");
const printDir = path.join(outputRoot, "print");

await fs.mkdir(outputRoot, { recursive: true });
await fs.mkdir(assetsDir, { recursive: true });
await fs.mkdir(digitalDir, { recursive: true });
await fs.mkdir(iconsDir, { recursive: true });
await fs.mkdir(printDir, { recursive: true });

const copiedAssets = [];
for (const asset of storyPackage.illustrations) {
  const sourcePath = path.resolve(repoRoot, "public", "prana-story-generator", asset.assetLocation.replace(/^\.\//, ""));
  const svgTarget = path.join(assetsDir, path.basename(sourcePath));
  const pngTarget = path.join(assetsDir, `${path.parse(sourcePath).name}.png`);
  await fs.copyFile(sourcePath, svgTarget);
  await sharp(sourcePath).png().resize(2550, 2550, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } }).toFile(pngTarget);
  copiedAssets.push({
    ...asset,
    sourcePath,
    svgPath: svgTarget,
    pngPath: pngTarget,
  });
}

if (copiedAssets[0]) {
  await sharp(copiedAssets[0].sourcePath).png().resize(512, 512).toFile(path.join(iconsDir, "icon-512.png"));
  await sharp(copiedAssets[0].sourcePath).png().resize(192, 192).toFile(path.join(iconsDir, "icon-192.png"));
}

const pagesHtml = copiedAssets.map((asset) => {
  const pageText = input.layout.pages.find((page) => page.page === asset.page)?.text.content || "";
  return `
    <section class="story-page" data-page="${asset.page}">
      <div class="page-frame">
        <img class="page-illustration" src="../assets/${path.basename(asset.svgPath)}" alt="Illustration for page ${asset.page}">
        <div class="page-text">
          <p>${escapeHtml(pageText)}</p>
          <div class="page-number">Page ${asset.page}</div>
        </div>
      </div>
    </section>
  `;
}).join("\n");

const digitalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(storyPackage.metadata.title)}</title>
  <link rel="manifest" href="./manifest.webmanifest">
  <style>
    :root {
      --bg: #f5efe4;
      --ink: #2c261f;
      --paper: #fffaf1;
      --accent: #8d5a33;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      color: var(--ink);
      background: linear-gradient(180deg, #f8f0dd, var(--bg));
    }
    header {
      padding: 32px 20px 18px;
      text-align: center;
    }
    header h1 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 3.2rem);
    }
    header p {
      margin: 10px auto 0;
      max-width: 760px;
      line-height: 1.6;
      color: #6f6357;
    }
    main {
      max-width: 980px;
      margin: 0 auto;
      padding: 0 18px 40px;
    }
    .story-page {
      margin: 24px 0;
    }
    .page-frame {
      background: var(--paper);
      border-radius: 22px;
      overflow: hidden;
      box-shadow: 0 18px 40px rgba(50, 34, 12, 0.12);
      border: 1px solid rgba(141, 90, 51, 0.18);
    }
    .page-illustration {
      display: block;
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: cover;
      background: #f1e5cf;
    }
    .page-text {
      padding: 18px 22px 26px;
    }
    .page-text p {
      margin: 0;
      font-size: 1.08rem;
      line-height: 1.7;
    }
    .page-number {
      margin-top: 14px;
      color: var(--accent);
      font-family: Arial, sans-serif;
      font-size: 0.88rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(storyPackage.metadata.title)}</h1>
    <p>A locked, production-ready digital story package exported by the Prana Story Engine. Story text, illustration references, and page order remain unchanged from the approved production layout.</p>
  </header>
  <main>
    ${pagesHtml}
  </main>
</body>
</html>`;

const manifest = {
  name: storyPackage.metadata.title,
  short_name: storyPackage.metadata.title.slice(0, 20),
  start_url: "./index.html",
  display: "standalone",
  background_color: "#f5efe4",
  theme_color: "#8d5a33",
  icons: [
    { src: "./icons/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "./icons/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
};

const exportedStoryPackage = {
  ...storyPackage,
  status: "EXPORTED",
  illustrations: storyPackage.illustrations.map((asset) => ({
    ...asset,
    assetLocation: `./assets/${path.parse(asset.assetLocation).name}.png`,
    format: "png",
    width: 2550,
    height: 2550,
  })),
};

const finalAssetManifest = {
  ...assetManifest,
  assets: copiedAssets.map((asset) => ({
    assetId: asset.assetId,
    page: asset.page,
    location: `./assets/${path.basename(asset.pngPath)}`,
    svgSource: `./assets/${path.basename(asset.svgPath)}`,
    format: "png",
    width: 2550,
    height: 2550,
    promptReference: asset.promptReference,
    layoutReference: input.layoutDebug?.find((entry) => entry.page === asset.page)?.sourceSceneId || "",
  })),
};

const finalExportReport = {
  ...exportReport,
  generatedFiles: {
    digitalIndex: "./digital-story/index.html",
    digitalManifest: "./digital-story/manifest.webmanifest",
    pdf: "./print/story-book.pdf",
    storyPackage: "./story-package.json",
    assetManifest: "./asset-manifest.json",
    exportMetadata: "./export-metadata.json",
  },
};

await fs.writeFile(path.join(outputRoot, "story-package.json"), JSON.stringify(exportedStoryPackage, null, 2));
await fs.writeFile(path.join(outputRoot, "asset-manifest.json"), JSON.stringify(finalAssetManifest, null, 2));
await fs.writeFile(path.join(outputRoot, "export-metadata.json"), JSON.stringify(exportMetadata, null, 2));
await fs.writeFile(path.join(outputRoot, "export-report.json"), JSON.stringify(finalExportReport, null, 2));
await fs.writeFile(path.join(outputRoot, "layout.json"), JSON.stringify(input.layout, null, 2));
await fs.writeFile(path.join(outputRoot, "final-story.json"), JSON.stringify(input.finalStory, null, 2));
await fs.writeFile(path.join(digitalDir, "index.html"), digitalHtml);
await fs.writeFile(path.join(digitalDir, "manifest.webmanifest"), JSON.stringify(manifest, null, 2));

const exportBuild = {
  outputRoot,
  slug,
  storyPackagePath: path.join(outputRoot, "story-package.json"),
  assetManifestPath: path.join(outputRoot, "asset-manifest.json"),
  exportMetadataPath: path.join(outputRoot, "export-metadata.json"),
  exportReportPath: path.join(outputRoot, "export-report.json"),
  digitalIndexPath: path.join(digitalDir, "index.html"),
  digitalManifestPath: path.join(digitalDir, "manifest.webmanifest"),
  copiedAssets: copiedAssets.map((asset) => ({
    assetId: asset.assetId,
    svgPath: asset.svgPath,
    pngPath: asset.pngPath,
  })),
};

await fs.writeFile(path.join(outputRoot, "export-build.json"), JSON.stringify(exportBuild, null, 2));
console.log(JSON.stringify(exportBuild, null, 2));

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
