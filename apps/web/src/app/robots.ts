import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

// Read SITE_ENV at request time, not at build time.
export const dynamic = 'force-dynamic';

/**
 * Non-production: block everything (Ali, 2026-11-08: no crawling of the new
 * site before cutover). Production: same rules as the live robots.txt.
 */
export default function robots(): MetadataRoute.Robots {
  if (!env.isProduction) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [
      { userAgent: ['Baiduspider', 'Baiduspider-render', 'Baiduspider-image'], disallow: '/' },
      // Filters/sorts stay crawlable on purpose: they are noindex,follow with a clean canonical.
      { userAgent: '*', disallow: ['/*filter_bnvtrap', '/*add-to-cart=', '/*?s=', '/?s='] },
    ],
    sitemap: `${env.canonicalOrigin}/sitemap_index.xml`,
  };
}
