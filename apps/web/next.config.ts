import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@postpylot/db"],
  serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
