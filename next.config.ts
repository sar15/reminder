import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:3001", "localhost:3002", "localhost:3003"],
    },
  },
  // Disable turbopack for production builds to avoid chunk conflicts
  // Use: npm run dev (turbopack) OR npm run build (webpack) — never mix without clearing .next
};

export default nextConfig;
