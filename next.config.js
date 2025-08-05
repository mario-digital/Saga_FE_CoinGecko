/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental optimizations for better performance
  experimental: {
    optimizePackageImports: ['@/components', '@/hooks', 'lucide-react'],
  },
  // Enable static export for flexible deployment
  // output: 'export', // Temporarily disabled to fix CSS issues
  trailingSlash: true,
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
  // Performance optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  // Development server configuration
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
  // Webpack optimization for mobile performance
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // More aggressive code splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 10000,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: false,
          vendors: false,
          // React and core libs
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Common libs
          lib: {
            test(module) {
              return (
                module.size() > 160000 &&
                /node_modules[\\/]/.test(module.identifier())
              );
            },
            name(module) {
              const hash = require('crypto')
                .createHash('sha256')
                .update(module.identifier())
                .digest('hex');
              return `lib-${hash.substring(0, 8)}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          // Shared components
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          // App code
          shared: {
            name(module, chunks) {
              return `shared-${chunks
                .map(chunk => chunk.name)
                .join('-')
                .substring(0, 20)}`;
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
        maxAsyncRequests: 30,
        maxInitialRequests: 25,
      };
    }
    return config;
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
