import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase body size limit for base64 photo uploads (default is ~1MB)
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
