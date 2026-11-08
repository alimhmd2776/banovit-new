import 'server-only';

/** Server-side environment. Anything other than SITE_ENV=production is treated as a test deploy. */
export const env = {
  siteEnv: process.env.SITE_ENV ?? 'development',
  isProduction: process.env.SITE_ENV === 'production',
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://banovit.com').replace(/\/$/, ''),
  /** Canonical origin used in metadata/JSON-LD: always the real domain so tags match the live site. */
  canonicalOrigin: 'https://banovit.com',
  apiUrl: process.env.STOREFRONT_API_URL ?? 'http://127.0.0.1:8000/api/storefront/v1',
  apiToken: process.env.STOREFRONT_INTERNAL_TOKEN ?? '',
};
