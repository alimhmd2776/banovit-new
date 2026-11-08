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
  const cleanCanonical = seo.canonical || `${env.canonicalOrigin}${path}`;
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

/** Head tags for a CMS content page: stored Yoast values, self canonical, never indexed off production. */
export function pageMetadata({ seo, path, ogType = 'article', modified }: { seo: Seo; path: string; ogType?: 'article' | 'website'; modified?: string | null }): Metadata {
  const canonical = seo.canonical || `${env.canonicalOrigin}${path}`;
  let robots: Metadata['robots'] = seo.robots;
  if (!env.isProduction) robots = { index: false, follow: false };

  return {
    title: { absolute: seo.title },
    description: seo.description ?? undefined,
    alternates: { canonical },
    robots,
    openGraph: {
      type: ogType,
      locale: 'fa_IR',
      siteName: SITE_NAME,
      title: seo.og_title ?? seo.title,
      description: seo.og_description ?? seo.description ?? undefined,
      url: canonical,
      modifiedTime: ogType === 'article' ? (modified ?? undefined) : undefined,
      images: seo.og_image?.url ? [{ url: seo.og_image.url, alt: seo.og_image.alt ?? seo.title }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
  };
}

/** WebPage (AboutPage for /about-us/) + BreadcrumbList (+ FAQPage), like Yoast's page graph. */
export function pageJsonLd({
  name,
  description,
  url,
  crumbs,
  faqs = [],
  type = 'WebPage',
  published,
  modified,
}: {
  name: string;
  description?: string | null;
  url: string;
  crumbs: Crumb[];
  faqs?: Faq[];
  type?: 'WebPage' | 'AboutPage' | 'ContactPage';
  published?: string | null;
  modified?: string | null;
}) {
  const graph: Record<string, unknown>[] = [
    {
      '@type': type,
      '@id': `${abs(url)}#webpage`,
      url: abs(url),
      name,
      description: description ?? undefined,
      inLanguage: 'fa-IR',
      datePublished: published ?? undefined,
      dateModified: modified ?? undefined,
      isPartOf: { '@type': 'WebSite', '@id': `${env.canonicalOrigin}/#website`, name: SITE_NAME, url: `${env.canonicalOrigin}/` },
      breadcrumb: { '@id': `${abs(url)}#breadcrumb` },
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
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer_html } })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
