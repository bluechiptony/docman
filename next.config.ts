import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint during docker builds; keep linting in CI/local workflows
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
