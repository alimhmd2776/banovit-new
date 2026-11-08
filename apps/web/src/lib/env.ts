import 'server-only';

/** Server-side environment. Anything other than SITE_ENV=production is treated as a test deploy. */
export const env = {
  siteEnv: process.env.SITE_ENV ?? 'development',
  // Indexable only on the real production deploy, and SITE_INDEXABLE=false always wins.
  isProduction: process.env.SITE_ENV === 'production' && process.env.SITE_INDEXABLE !== 'false',
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://banovit.com').replace(/\/$/, ''),
  /**
   * Origin for canonical/og/JSON-LD URLs: banovit.com on the production deploy
   * (same tags as the live site); a test deploy points them at itself
   * (docs/06-infra-stage2.md, SITE_INDEXABLE layer).
   */
  canonicalOrigin:
    process.env.SITE_ENV === 'production' && process.env.SITE_INDEXABLE !== 'false'
      ? 'https://banovit.com'
      : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  apiUrl: process.env.STOREFRONT_API_URL ?? 'http://127.0.0.1:8000/api/storefront/v1',
  apiToken: process.env.STOREFRONT_INTERNAL_TOKEN ?? '',
};
