/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove 'standalone' output for Cloudflare Pages compatibility
  // Cloudflare Pages supports standard Next.js builds natively
  
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
}

module.exports = nextConfig
