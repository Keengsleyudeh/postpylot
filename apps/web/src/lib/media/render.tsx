import "server-only";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import sharp from "sharp";
import type { Platform } from "@postpylot/shared";

// Template-based media generation (no paid image APIs — see postpylot-cost.mdc).
// Satori builds an SVG from a JSX template, Resvg rasterizes it, and Sharp
// optimizes the PNG. Runs in the web server path for the MVP; extractable to the
// worker later.

export type RenderInput = {
  title: string;
  body: string;
  brandName: string;
  platform: Platform;
  colors: string[];
};

const DIMENSIONS: Record<Platform, { width: number; height: number }> = {
  youtube: { width: 1280, height: 720 },
  tiktok: { width: 1080, height: 1920 },
  linkedin: { width: 1200, height: 1200 },
  facebook: { width: 1200, height: 630 },
};

// Google Fonts serves a TTF when no browser User-Agent is sent, which Satori
// needs. Cached across invocations.
let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const cssRes = await fetch(
    "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700"
  );
  if (!cssRes.ok) {
    throw new Error("Could not load font for media rendering.");
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

export async function renderQuoteCard(input: RenderInput): Promise<{
  buffer: Buffer;
  width: number;
  height: number;
}> {
  const { width, height } = DIMENSIONS[input.platform];
  const accent = input.colors[0] ?? "#C8FF00";
  const font = await loadFont();

  const svg = await satori(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        backgroundColor: "#0A0A0A",
        color: "#FFFFFF",
        fontFamily: "Plus Jakarta Sans",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            backgroundColor: accent,
          }}
        />
        <div style={{ fontSize: 28, color: "#8A8A8A" }}>{input.brandName}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 56, lineHeight: 1.1 }}>
          {truncate(input.title, 90)}
        </div>
        <div style={{ fontSize: 30, color: "#B5B5B5", lineHeight: 1.35 }}>
          {truncate(input.body, 220)}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ fontSize: 24, color: accent }}>PostPylot</div>
      </div>
    </div>,
    {
      width,
      height,
      fonts: [
        {
          name: "Plus Jakarta Sans",
          data: font,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
  })
    .render()
    .asPng();

  const buffer = await sharp(png).png({ quality: 82 }).toBuffer();
  return { buffer, width, height };
}
