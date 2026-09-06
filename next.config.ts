import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal self-contained server bundle (the root Dockerfile
  // relies on this) instead of requiring the full node_modules tree in the image.
  output: "standalone",
};

export default nextConfig;