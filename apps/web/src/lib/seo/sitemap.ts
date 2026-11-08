import 'server-only';
import type { SitemapRow } from '@banovit/api-client';
import { env } from '@/lib/env';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** Yoast-compatible urlset (with image:image like Yoast's post sitemap). */
export function urlsetXml(rows: SitemapRow[]): string {
  const urls = rows
    .map(
      (r) =>
        `<url><loc>${esc(r.url)}</loc>${r.lastmod ? `<lastmod>${esc(r.lastmod)}</lastmod>` : ''}${r.images
          .map((img) => `<image:image><image:loc>${esc(img)}</image:loc></image:image>`)
          .join('')}</url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`;
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=UTF-8', 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' },
  });
}

/**
 * Yoast-named sitemap response. Exposed only on the indexable production deploy
 * (SITE_INDEXABLE): test deploys answer 404 so nothing points crawlers at them.
 */
export async function sitemapResponse(load: () => Promise<SitemapRow[]>): Promise<Response> {
  if (!env.isProduction) return new Response('Not Found', { status: 404, headers: { 'X-Robots-Tag': 'noindex, nofollow' } });
  return xmlResponse(urlsetXml(await load()));
}
