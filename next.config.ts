import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // <--- Critical for Hostinger Shared Hosting
  images: {
    unoptimized: true, // <--- Required because shared hosting doesn't support Next.js Image Optimization
  },
  // Ensure trailing slashes to avoid 404s on refresh
  trailingSlash: true,
};

export default nextConfig;