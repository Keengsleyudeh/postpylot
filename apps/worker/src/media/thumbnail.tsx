import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import sharp from "sharp";

// Template-based YouTube thumbnail (1280x720). No paid image APIs — Satori +
// Resvg + Sharp only (postpylot-cost.mdc). Worker-local copy so we never import
// the Next.js web app into the worker process.

const WIDTH = 1280;
const HEIGHT = 720;

let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const cssRes = await fetch(
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700"
  );
  if (!cssRes.ok) {
    throw new Error("Could not load font for thumbnail rendering.");
  }
  const css = await cssRes.text();
  const match =
    css.match(/src:\s*url\((https:[^)]+\.ttf)\)/) ??
    css.match(/url\((https:[^)]+)\)/);
  if (!match?.[1]) {
    throw new Error("Could not resolve a usable font file.");
  }
  const fontRes = await fetch(match[1]);
  fontCache = await fontRes.arrayBuffer();
  return fontCache;
}

function truncate(value: string, max: number): string {
  const clean = value.trim().replace(/\s+/g, " ");
  return clean.length > max ? `${clean.slice(0, max - 1)}\u2026` : clean;
}

export async function renderThumbnail(input: {
  title: string;
  brandName: string;
  accent?: string;
}): Promise<{ buffer: Buffer; width: number; height: number }> {
  const accent = input.accent ?? "#C8FF00";
  const font = await loadFont();

  const svg = await satori(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: "#0A0A0A",
        color: "#FFFFFF",
        fontFamily: "Plus Jakarta Sans",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 8,
            backgroundColor: accent,
          }}
        />
        <div style={{ fontSize: 32, color: "#8A8A8A" }}>{input.brandName}</div>
      </div>

      <div style={{ display: "flex", fontSize: 84, lineHeight: 1.05, maxWidth: 1000 }}>
        {truncate(input.title, 90)}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ fontSize: 28, color: accent }}>PostPylot</div>
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Plus Jakarta Sans", data: font, weight: 700, style: "normal" },
      ],
    }
  );

  const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } })
    .render()
    .asPng();
  const buffer = await sharp(png).png({ quality: 82 }).toBuffer();
  return { buffer, width: WIDTH, height: HEIGHT };
}
