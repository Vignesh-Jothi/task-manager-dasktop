#!/usr/bin/env node
/* Generate PNG icon sizes from assets/icon.svg and produce .icns/.ico */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico');

const svgPath = path.join(__dirname, '../assets/icon.svg');
const outDir = path.join(__dirname, '../icons');
const iconsetDir = path.join(outDir, 'icon.iconset');

if (!fs.existsSync(svgPath)) {
  console.error('SVG source icon not found at', svgPath);
  process.exit(1);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
if (!fs.existsSync(iconsetDir)) fs.mkdirSync(iconsetDir);

// macOS iconset required sizes
const macSizes = [16,32,64,128,256,512];

(async () => {
  try {
    // Generate macOS iconset PNGs (including @2x variants)
    for (const size of macSizes) {
      const baseName = `icon_${size}x${size}.png`;
      const retinaName = `icon_${size}x${size}@2x.png`;
      await sharp(svgPath).resize(size, size).png().toFile(path.join(iconsetDir, baseName));
      await sharp(svgPath).resize(size*2, size*2).png().toFile(path.join(iconsetDir, retinaName));
    }

    // Base PNG for Linux (512x512)
    const linuxPng = path.join(outDir, 'icon.png');
    await sharp(svgPath).resize(512,512).png().toFile(linuxPng);

    // Windows ICO sizes
    const winSizes = [16,24,32,48,64,128,256];
    const tmpPngs = [];
    for (const size of winSizes) {
      const p = path.join(outDir, `win-${size}.png`);
      await sharp(svgPath).resize(size,size).png().toFile(p);
      tmpPngs.push(p);
    }
    const icoBuffer = await pngToIco(tmpPngs);
    fs.writeFileSync(path.join(outDir, 'icon.ico'), icoBuffer);

    // Attempt to create .icns using iconutil (mac only)
    const { execSync } = require('child_process');
    try {
      execSync(`iconutil -c icns ${iconsetDir} -o ${path.join(outDir,'icon.icns')}`);
    } catch (e) {
      console.warn('iconutil failed (non-mac or missing tool). Skipping icns generation.');
    }

    console.log('Icon generation complete.');
  } catch (err) {
    console.error('Icon generation failed:', err);
    process.exit(1);
  }
})();
