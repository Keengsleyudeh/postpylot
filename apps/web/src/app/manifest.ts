import type { MetadataRoute } from "next";

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512] as const;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PostPylot",
    short_name: "PostPylot",
    description:
      "Your AI content engine on autopilot. Generate, schedule, publish, and track content across YouTube, TikTok, LinkedIn, and Facebook.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#050B18",
    theme_color: "#050B18",
    orientation: "portrait",
    icons: [
      ...ICON_SIZES.map((size) => ({
        src: `/icons/icon-${size}x${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: "any" as const,
      })),
      {
        src: "/icons/icon-512x512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
