import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint during docker builds; keep linting in CI/local workflows
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        // Browser: /api/auth/login
        // Docker network: http://docman-api:3500/auth/login
        source: "/api/:path*",
        destination: "http://docman-api:3500/:path*",
      },
    ];
  },
};

export default nextConfig;
