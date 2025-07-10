import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src'
    }
    // Exclude scripts directory from webpack processing
    config.externals = config.externals || [];
    if (typeof config.externals === 'object' && !Array.isArray(config.externals)) {
      config.externals = [config.externals];
    }
    return config
  },
  // Configure Turbopack (stable)
  turbopack: {
    rules: {
      // Add any custom Turbopack rules here
    },
    resolveAlias: {
      '@/*': './src/*'
    }
  }
};

export default nextConfig;
