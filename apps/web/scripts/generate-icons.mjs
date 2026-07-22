import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "public");
const iconSvg = fs.readFileSync(path.join(root, "icon.svg"));
const maskableSvg = fs.readFileSync(path.join(root, "icon-maskable.svg"));
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function main() {
  for (const size of sizes) {
    const out = path.join(root, "icons", `icon-${size}x${size}.png`);
    await sharp(iconSvg).resize(size, size).png().toFile(out);
    console.log("wrote", path.basename(out));
  }

  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(root, "icons", "icon-512x512-maskable.png"));
  console.log("wrote icon-512x512-maskable.png");

  await sharp(iconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(root, "favicon-32x32.png"));
  await sharp(iconSvg)
    .resize(16, 16)
    .png()
    .toFile(path.join(root, "favicon-16x16.png"));
  await sharp(iconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(root, "favicon.ico"));
  await sharp(iconSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(root, "apple-touch-icon.png"));

  console.log("done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
