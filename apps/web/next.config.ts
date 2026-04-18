import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@solana-frontier/sdk", "@solana-frontier/ui"],
};

export default nextConfig;
