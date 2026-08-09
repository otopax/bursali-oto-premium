/**
 * Security Headers configuration helper for Next.js middleware or headers config
 */
export const SECURITY_HEADERS = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://upload.wikimedia.org https://maps.gstatic.com https://lh3.googleusercontent.com https://*.google.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https://maps.googleapis.com https://mybusinessbusinessinformation.googleapis.com https://*.sentry.io",
      "frame-src 'self' https://www.google.com https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  }
];

/**
 * Apply security headers to a Response object
 * @param {Response} response 
 * @returns {Response}
 */
export function applySecurityHeaders(response) {
  SECURITY_HEADERS.forEach(({ key, value }) => {
    response.headers.set(key, value);
  });
  return response;
}
