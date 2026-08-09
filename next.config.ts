import path from "node:path";
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd()),
  transpilePackages: ["yjs", "y-prosemirror", "y-indexeddb", "y-protocols"],
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      yjs: path.resolve(process.cwd(), "node_modules/yjs/dist/yjs.mjs"),
    };
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
