import 'server-only';
import type { CatalogSitemapType, SitemapRow } from '@banovit/api-client';
import { getBlogSitemap, getCatalogSitemap, isNotFound, listCatalogSitemaps, listPages } from '@/lib/api';
import { env } from '@/lib/env';
import { indexXml, sitemapResponse, urlsetXml, xmlResponse } from './sitemap';

/** File name on the live Yoast site for a catalog sitemap (product-sitemap.xml, product-sitemap2.xml, …). */
export function catalogFileName(type: CatalogSitemapType, page: number): string {
  return `${type}-sitemap${page > 1 ? page : ''}.xml`;
}

/** product-sitemapN.xml / product_cat / pa_brand / product_tag: 404 when the file does not exist (fewer products). */
export async function catalogSitemapResponse(type: CatalogSitemapType, page = 1): Promise<Response> {
  if (!env.isProduction) return sitemapResponse(async () => []);
  let rows: SitemapRow[];
  try {
    rows = await getCatalogSitemap(type, page);
  } catch (e) {
    if (isNotFound(e)) return new Response('Not Found', { status: 404 });
    throw e;
  }
  return xmlResponse(urlsetXml(rows));
}

/** page-sitemap.xml: published, indexable CMS content pages. */
export async function pageSitemapResponse(): Promise<Response> {
  return sitemapResponse(async () => {
    const pages = await listPages();
    return pages
      .filter((p) => p.indexable)
      .map((p) => ({ url: `${env.canonicalOrigin}${p.url}`, lastmod: p.updated_at ?? null, images: [] }) satisfies SitemapRow);
  });
}

const newest = (rows: SitemapRow[]) => rows.reduce<string | null>((m, r) => (r.lastmod && (!m || r.lastmod > m) ? r.lastmod : m), null);

/** sitemap_index.xml in the live order: post, page, product…, category, product_cat, product_tag, pa_brand, author. */
export async function sitemapIndexResponse(): Promise<Response> {
  if (!env.isProduction) return new Response('Not Found', { status: 404, headers: { 'X-Robots-Tag': 'noindex, nofollow' } });
  const origin = env.canonicalOrigin;
  const [catalog, posts, categories, authors, pages] = await Promise.all([
    listCatalogSitemaps(),
    getBlogSitemap('posts'),
    getBlogSitemap('categories'),
    getBlogSitemap('authors'),
    listPages(),
  ]);
  const cat = (type: CatalogSitemapType) =>
    catalog.filter((f) => f.type === type).map((f) => ({ loc: `${origin}/${catalogFileName(type, f.page)}`, lastmod: f.lastmod }));
  const pageLastmod = pages.filter((p) => p.indexable).reduce<string | null>((m, p) => (p.updated_at && (!m || p.updated_at > m) ? p.updated_at : m), null);
  const files = [
    ...(posts.length ? [{ loc: `${origin}/post-sitemap.xml`, lastmod: newest(posts) }] : []),
    ...(pages.some((p) => p.indexable) ? [{ loc: `${origin}/page-sitemap.xml`, lastmod: pageLastmod }] : []),
    ...cat('product'),
    ...(categories.length ? [{ loc: `${origin}/category-sitemap.xml`, lastmod: newest(categories) }] : []),
    ...cat('product_cat'),
    ...cat('product_tag'),
    ...cat('pa_brand'),
    ...(authors.length ? [{ loc: `${origin}/author-sitemap.xml`, lastmod: newest(authors) }] : []),
  ];
  return xmlResponse(indexXml(files));
}

