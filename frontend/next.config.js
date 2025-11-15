const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Note: Static export configuration is handled by OpenNext for Cloudflare deployments
  // For Railway deployment, standard SSR mode is used (no output: 'export')
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  
  // Cloudflare Pages optimization
  images: {
    unoptimized: true,
  },
  
  // Disable SWC minifier if needed for Cloudflare
  swcMinify: true,
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Webpack configuration to ensure @ alias works
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
}

module.exports = nextConfig
