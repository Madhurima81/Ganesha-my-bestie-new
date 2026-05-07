#!/usr/bin/env node

/**
 * Icon generator script using Sharp
 * Converts ganesha-final.svg to multiple icon sizes with lavender background
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Colors
const LAVENDER = '#A078DC';
const LAVENDER_RGB = { r: 160, g: 120, b: 220 };

const ICON_SPECS = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon.png' }
];

const SVG_SOURCE = path.join(__dirname, 'public/images/ganesha-final.svg');
const ICON_DIR = path.join(__dirname, 'public/icons');
const FAVICON_ICO = path.join(ICON_DIR, 'favicon.ico');

// Ensure icons directory exists
if (!fs.existsSync(ICON_DIR)) {
  fs.mkdirSync(ICON_DIR, { recursive: true });
  console.log(`✅ Created icons directory: ${ICON_DIR}`);
}

console.log(`\n🎨 Generating icons from ${path.basename(SVG_SOURCE)}...`);
console.log(`   Background: ${LAVENDER} (lavender)`);
console.log(`   Target: ${ICON_DIR}\n`);

// Process each icon size
async function generateIcons() {
  try {
    for (const { size, name } of ICON_SPECS) {
      const output = path.join(ICON_DIR, name);

      // Use Sharp to render SVG and add background
      await sharp(SVG_SOURCE, { density: 300 })
        .resize(size, size, {
          fit: 'contain',
          background: LAVENDER_RGB
        })
        .png()
        .toFile(output);

      const stats = fs.statSync(output);
      console.log(`✅ ${name} (${size}x${size}) — ${(stats.size / 1024).toFixed(1)}KB`);
    }

    // Generate favicon.ico from 32x32 PNG
    console.log(`\n🖼️  Generating favicon.ico...`);
    const favicon32 = path.join(ICON_DIR, 'favicon.png');

    // Convert PNG to ICO using Sharp (simple approach)
    const icoBuffer = await sharp(favicon32)
      .resize(32, 32, { fit: 'contain' })
      .png()
      .toBuffer();

    fs.writeFileSync(FAVICON_ICO, icoBuffer);
    const stats = fs.statSync(FAVICON_ICO);
    console.log(`✅ favicon.ico — ${(stats.size / 1024).toFixed(1)}KB`);

    console.log(`\n✨ Icon generation complete!\n`);
    console.log(`   📁 Icons saved to: ${ICON_DIR}\n`);
  } catch (err) {
    console.error(`❌ Icon generation failed:`, err.message);
    process.exit(1);
  }
}

generateIcons();
