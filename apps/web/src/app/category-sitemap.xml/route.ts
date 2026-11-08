import { getBlogSitemap } from '@/lib/api';
import { sitemapResponse } from '@/lib/seo/sitemap';

/** Same file name as the Yoast sitemap on the live site (docs/03-seo-parity.md). */
export const dynamic = 'force-dynamic'; // never prerender at build (API not reachable then); the CDN caches it

export async function GET() {
  return sitemapResponse(() => getBlogSitemap('categories'));
}
