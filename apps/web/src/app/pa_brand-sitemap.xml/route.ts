import { catalogSitemapResponse } from '@/lib/seo/catalogSitemap';

/** Same file name as the Yoast sitemap on the live site (docs/03-seo-parity.md). */
export const dynamic = 'force-dynamic'; // never prerender at build (API not reachable then); the CDN caches it

export async function GET() {
  return catalogSitemapResponse('pa_brand');
}
