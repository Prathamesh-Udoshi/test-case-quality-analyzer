import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Allow API calls to the FastAPI backend during development */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
