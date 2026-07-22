import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@postpylot/db",
    "@postpylot/ai",
    "@postpylot/platforms",
    "@postpylot/shared",
  ],
  serverExternalPackages: [
    "@prisma/client",
    "pg-boss",
    "@resvg/resvg-js",
    "sharp",
    "googleapis",
  ],
};

export default nextConfig;
