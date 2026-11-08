import 'server-only';
import type { Metadata } from 'next';
import type { Faq, ProductCard, Seo } from '@banovit/api-client';
import { env } from '@/lib/env';

const SITE_NAME = 'بانویت';

/**
 * Head tags for a listing page (docs/03-seo-parity.md):
 * - title/description/canonical/og from the CMS (migrated Yoast values)
 * - /page/N/: self-referencing canonical, title suffix like Yoast («صفحه N از M»)
 * - filtered or re-sorted URLs: noindex, follow + canonical to the clean category
 * - any non-production deploy: noindex, nofollow regardless
 */
export function listingMetadata({
  seo,
  path,
  page,
  lastPage,
  filtered,
}: {
  seo: Seo;
  path: string;
  page: number;
  lastPage: number;
  filtered: boolean;
}): Metadata {
  // CMS canonicals are absolute banovit.com URLs; keep the path, take the origin from the deploy.
  const canonicalPath = seo.canonical ? safePath(seo.canonical) ?? path : path;
  const cleanCanonical = `${env.canonicalOrigin}${canonicalPath}`;
  const canonical = filtered || page <= 1 ? cleanCanonical : `${cleanCanonical.replace(/\/$/, '')}/page/${page}/`;
  const title = page > 1 ? `${seo.title} - صفحه ${page.toLocaleString('fa-IR')} از ${lastPage.toLocaleString('fa-IR')}` : seo.title;

  let robots: Metadata['robots'] = seo.robots;
  if (filtered) robots = { index: false, follow: true };
  if (!env.isProduction) robots = { index: false, follow: false };

  return {
    title: { absolute: title },
    description: seo.description ?? undefined,
    alternates: { canonical },
    robots,
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      siteName: SITE_NAME,
      title: seo.og_title ?? title,
      description: seo.og_description ?? seo.description ?? undefined,
      url: canonical,
      images: seo.og_image?.url ? [{ url: seo.og_image.url, alt: seo.og_image.alt ?? title }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
  };
}

function safePath(url: string): string | null {
  try {
    return new URL(url, env.canonicalOrigin).pathname;
  } catch {
    return null;
  }
}

export type Crumb = { name: string; url: string };

function abs(url: string): string {
  return url.startsWith('http') ? url : `${env.canonicalOrigin}${url}`;
}

/** CollectionPage + ItemList + BreadcrumbList (+ FAQPage) for category/brand/shop pages. */
export function listingJsonLd({
  name,
  description,
  url,
  crumbs,
  products,
  faqs,
}: {
  name: string;
  description?: string | null;
  url: string;
  crumbs: Crumb[];
  products: ProductCard[];
  faqs: Faq[];
}) {
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'CollectionPage',
      '@id': `${abs(url)}#webpage`,
      url: abs(url),
      name,
      description: description ?? undefined,
      inLanguage: 'fa-IR',
      isPartOf: { '@type': 'WebSite', '@id': `${env.canonicalOrigin}/#website`, name: SITE_NAME, url: `${env.canonicalOrigin}/` },
      breadcrumb: { '@id': `${abs(url)}#breadcrumb` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: abs(p.path),
          name: p.name,
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${abs(url)}#breadcrumb`,
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.url) })),
    },
  ];
  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer_html },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Safe inline JSON-LD (no </script> breakout). */
export function jsonLdScript(data: unknown): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}

/**
 * Personal pages (/cart/, /checkout/, /my-account/...): always noindex, like
 * the live site, with a self canonical. Non-production stays nofollow too.
 */
export function privatePageMetadata(title: string, path: string): Metadata {
  return {
    title: { absolute: `${title} - ${SITE_NAME}` },
    alternates: { canonical: `${env.canonicalOrigin}${path}` },
    robots: { index: false, follow: env.isProduction },
  };
}
