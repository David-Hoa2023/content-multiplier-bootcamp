/**
 * API Configuration
 *
 * Centralized API URL configuration that works in both development and production.
 * In development: Uses http://localhost:4000
 * In production: Uses NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_BACKEND_URL environment variable
 */

const getApiBase = () => {
  // Check environment variables first
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // In production (browser), use hardcoded production URL if no env var is set
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://content-multiplier-bootcamp-production.up.railway.app';
  }

  // Default to localhost for development
  return "http://localhost:4000";
};

// Use a getter to ensure the URL is evaluated at runtime for client-side code
let _cachedApiUrl: string | null = null;

export const API_URL = (() => {
  // For server-side rendering, return production URL
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://content-multiplier-bootcamp-production.up.railway.app';
  }
  // For client-side, cache the result
  if (_cachedApiUrl === null) {
    _cachedApiUrl = getApiBase();
  }
  return _cachedApiUrl;
})();

// Debug: log the API URL in production
if (typeof window !== 'undefined') {
  console.log('API_URL configured as:', API_URL);
}

/**
 * Helper function to construct API endpoint URLs
 * @param path - The API endpoint path (e.g., '/ideas', '/ai/generate')
 * @returns Full API URL
 */
export function getApiUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}

/**
 * Check if we're running in production
 */
export const isProduction = process.env.NODE_ENV === "production";

/**
 * Check if API is configured (has a valid backend URL)
 */
export function isApiConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL) || !isProduction;
}
