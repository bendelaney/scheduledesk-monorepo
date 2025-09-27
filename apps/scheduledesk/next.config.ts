import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  sassOptions: {
    includePaths: ['./app/styles'],
    prependData: `@use './app/styles/variables' as *;
                  @use './app/styles/mixins' as *;`,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Nuclear option - completely override webpack config
      config.devtool = false;
      
      // Add source map plugin manually
      // FUCK NEXTJS FOR FUCKING WITH THIS.
      const SourceMapDevToolPlugin = require('webpack').SourceMapDevToolPlugin;
      config.plugins.push(
        new SourceMapDevToolPlugin({
          filename: '[file].map',
          exclude: ['vendor.js'],
          moduleFilenameTemplate: 'webpack://[namespace]/[resourcePath]',
          fallbackModuleFilenameTemplate: 'webpack://[namespace]/[resourcePath]?[hash]'
        })
      );
    }
    return config;
  },
};

export default nextConfig;