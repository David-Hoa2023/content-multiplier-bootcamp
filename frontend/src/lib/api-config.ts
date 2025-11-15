/**
 * API Configuration
 *
 * Centralized API URL configuration that works in both development and production.
 * In development: Uses http://localhost:4000
 * In production: Uses NEXT_PUBLIC_API_URL environment variable
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Helper function to construct API endpoint URLs
 * @param path - The API endpoint path (e.g., '/ideas', '/ai/generate')
 * @returns Full API URL
 */
export function getApiUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}

/**
 * Check if we're running in production
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if API is configured (has a valid backend URL)
 */
export function isApiConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL) || !isProduction;
}
