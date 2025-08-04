/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Enable static export for flexible deployment
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Development server configuration
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

module.exports = nextConfig;