import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src'
    }
    return config
  },
  // Configure Turbopack
  experimental: {
    turbo: {
      rules: {
        // Add any custom Turbopack rules here
      },
      resolveAlias: {
        '@/*': './src/*'
      }
    }
  }
};

export default nextConfig;
