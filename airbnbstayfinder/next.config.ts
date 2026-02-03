import type { NextConfig } from "next";

console.log("Next config loading...");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a0.muscache.com",
      },
      {
        protocol: "https",
        hostname: "*.muscache.com",
      },
    ],
  },
};

export default nextConfig;
