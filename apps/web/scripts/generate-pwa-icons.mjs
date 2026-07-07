/**
 * One-off script to generate PWA icon PNGs from a shared SVG template.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../public/icons");

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

function iconSvg(size, maskable = false) {
  const padding = maskable ? Math.round(size * 0.2) : Math.round(size * 0.15);
  const inner = size - padding * 2;
  const fontSize = Math.round(inner * 0.55);
  const radius = maskable ? 0 : Math.round(size * 0.18);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#050B18"/>
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#22D3EE"/>
    </linearGradient>
  </defs>
  <text
    x="50%"
    y="54%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="${fontSize}"
    font-weight="700"
    fill="url(#g)"
  >P</text>
</svg>`;
}

async function generate() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const size of SIZES) {
    const filename = `icon-${size}x${size}.png`;
    const buffer = await sharp(Buffer.from(iconSvg(size)))
      .resize(size, size)
      .png()
      .toBuffer();
    await writeFile(join(OUT_DIR, filename), buffer);
    console.log(`Wrote ${filename}`);
  }

  const maskableBuffer = await sharp(Buffer.from(iconSvg(512, true)))
    .resize(512, 512)
    .png()
    .toBuffer();
  await writeFile(join(OUT_DIR, "icon-512x512-maskable.png"), maskableBuffer);
  console.log("Wrote icon-512x512-maskable.png");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
