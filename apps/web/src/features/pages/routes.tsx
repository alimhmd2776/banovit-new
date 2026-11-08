import 'server-only';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getPage, isNotFound } from '@/lib/api';
import { pageJsonLd, pageMetadata, type Crumb } from '@/lib/seo';
import { PageView } from './PageView';
import { decode, toPagePath } from './path';

/**
 * Catch-all for CMS content pages (/{path}/ — about-us, shipping-methods,
 * terms, privacy-policy, ...). Runs only for URLs no other route claims.
 */

async function load(segments: string[]) {
  const path = toPagePath(segments);
  if (!path) notFound();
  try {
    return await getPage(path);
  } catch (e) {
    if (isNotFound(e)) notFound();
    throw e;
  }
}

export async function contentPageMetadata(segments: string[]): Promise<Metadata> {
  const page = await load(segments);
  return pageMetadata({ seo: page.seo, path: page.url, modified: page.updated_at });
}

export async function ContentPageRoute({ segments }: { segments: string[] }) {
  const page = await load(segments);

  // Uppercase or differently encoded request: 301 to the canonical URL (WordPress does the same).
  const requested = `/${segments.join('/')}/`;
  if (decode(requested) !== decode(page.url)) permanentRedirect(page.url);

  const crumbs: Crumb[] = [{ name: 'بانویت', url: '/' }, ...page.breadcrumb.map((c) => ({ name: c.name, url: c.url }))];
  const jsonLd = pageJsonLd({
    name: page.seo.title,
    description: page.seo.description,
    url: page.url,
    crumbs,
    faqs: page.faqs,
    type: page.path === 'about-us' ? 'AboutPage' : page.path === 'contact-us' ? 'ContactPage' : 'WebPage',
    published: page.published_at,
    modified: page.updated_at,
  });

  return <PageView page={page} jsonLd={jsonLd} />;
}
