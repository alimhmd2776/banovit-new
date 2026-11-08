import { getBlogUi, listBlogPosts } from '@/lib/api';
import { resolveBlogUi } from '@/features/blog/ui';
import { env } from '@/lib/env';
import { abs } from '@/lib/seo/blog';
import { siteConfig } from '@/lib/site-config';

/** RSS 2.0 of the latest posts (WordPress /blog/feed/). */
export const dynamic = 'force-dynamic'; // never prerender at build (API not reachable then); the CDN caches it

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function GET() {
  const ui = resolveBlogUi(await getBlogUi());
  const { data } = await listBlogPosts({ page: 1, per_page: ui.archive.feed_limit });
  const items = data
    .map(
      (p) => `<item>
<title>${esc(p.title)}</title>
<link>${esc(abs(p.url))}</link>
<guid isPermaLink="true">${esc(abs(p.url))}</guid>
${p.published_at ? `<pubDate>${new Date(p.published_at).toUTCString()}</pubDate>` : ''}
${p.author ? `<dc:creator><![CDATA[${p.author.name}]]></dc:creator>` : ''}
${p.category ? `<category><![CDATA[${p.category.name}]]></category>` : ''}
<description><![CDATA[${p.excerpt}]]></description>
</item>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(`مقالات ${siteConfig.name}`)}</title>
<atom:link href="${env.canonicalOrigin}/blog/feed/" rel="self" type="application/rss+xml" />
<link>${env.canonicalOrigin}/blog/</link>
<description>${esc(ui.labels.feed_description)}</description>
<language>fa-IR</language>
${items}
</channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=UTF-8', 'Cache-Control': 'public, max-age=300, s-maxage=3600', ...(env.isProduction ? {} : { 'X-Robots-Tag': 'noindex, nofollow' }) } });
}
