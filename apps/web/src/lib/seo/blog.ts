import 'server-only';
import type { Metadata } from 'next';
import type { BlogAuthor, BlogFaq, BlogPost, BlogPostCard, Crumb, Seo } from '@banovit/api-client';
import { env } from '@/lib/env';
import { siteConfig } from '@/lib/site-config';

/**
 * Blog head tags and JSON-LD (docs/03-seo-parity.md). Values come from the CMS
 * (migrated Yoast fields or the Yoast templates), so titles/descriptions match
 * the live site. Like Yoast:
 *  - post: og:type article + article:published_time/modified_time/author/section/tag
 *  - archives: /page/N/ self-canonical with «صفحه N از M» in the title
 *  - search results: noindex, follow
 *  - every non-production deploy: noindex, nofollow
 */

const LOCALE = 'fa_IR';

export function abs(url: string): string {
  return url.startsWith('http') ? url : `${env.canonicalOrigin}${url}`;
}

function robotsFrom(seo: Seo, override?: Metadata['robots']): Metadata['robots'] {
  if (!env.isProduction) return { index: false, follow: false };
  if (override) return override;
  const r = seo.robots.toLowerCase();
  return { index: !r.includes('noindex'), follow: !r.includes('nofollow') };
}

function ogImages(seo: Seo, fallbackAlt: string) {
  return seo.og_image?.url
    ? [{ url: seo.og_image.url, width: seo.og_image.width ?? undefined, height: seo.og_image.height ?? undefined, alt: seo.og_image.alt ?? fallbackAlt }]
    : undefined;
}

export function blogPostMetadata(post: BlogPost): Metadata {
  const { seo } = post;
  return {
    title: { absolute: seo.title },
    description: seo.description ?? undefined,
    alternates: { canonical: seo.canonical, types: { 'application/rss+xml': `${env.canonicalOrigin}/blog/feed/` } },
    robots: robotsFrom(seo),
    authors: post.author ? [{ name: post.author.name, url: abs(post.author.url) }] : undefined,
    openGraph: {
      type: 'article',
      locale: LOCALE,
      siteName: siteConfig.name,
      title: seo.og_title ?? seo.title,
      description: seo.og_description ?? seo.description ?? undefined,
      url: seo.canonical,
      images: ogImages(seo, post.title),
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: post.author ? [abs(post.author.url)] : undefined,
      section: post.category?.name,
      tags: post.tags.map((t) => t.name),
    },
    twitter: { card: 'summary_large_image', title: seo.og_title ?? seo.title, description: seo.og_description ?? seo.description ?? undefined },
    other: {
      // Yoast prints these for posts; some crawlers read them instead of JSON-LD.
      'twitter:label1': 'نوشته‌شده توسط',
      'twitter:data1': post.author?.name ?? siteConfig.name,
      'twitter:label2': 'زمان تقریبی برای خواندن',
      'twitter:data2': `${post.reading_minutes} دقیقه`,
    },
  };
}

/** Category / tag / author / blog index (with /page/N/). */
export function blogArchiveMetadata({
  seo,
  page,
  lastPage,
  noindex = false,
}: {
  seo: Seo;
  page: number;
  lastPage: number;
  noindex?: boolean;
}): Metadata {
  const canonical = page > 1 ? `${seo.canonical.replace(/\/$/, '')}/page/${page}/` : seo.canonical;
  const title = page > 1 ? `${seo.title} - صفحه ${page.toLocaleString('fa-IR')} از ${lastPage.toLocaleString('fa-IR')}` : seo.title;
  return {
    title: { absolute: title },
    description: seo.description ?? undefined,
    alternates: { canonical, types: { 'application/rss+xml': `${env.canonicalOrigin}/blog/feed/` } },
    robots: robotsFrom(seo, noindex ? { index: false, follow: true } : undefined),
    openGraph: {
      type: 'website',
      locale: LOCALE,
      siteName: siteConfig.name,
      title: seo.og_title ?? title,
      description: seo.og_description ?? seo.description ?? undefined,
      url: canonical,
      images: ogImages(seo, title),
    },
    twitter: { card: 'summary_large_image' },
  };
}

const organization = () => ({
  '@type': 'Organization',
  '@id': `${env.canonicalOrigin}/#organization`,
  name: siteConfig.name,
  url: `${env.canonicalOrigin}/`,
});

const website = () => ({
  '@type': 'WebSite',
  '@id': `${env.canonicalOrigin}/#website`,
  url: `${env.canonicalOrigin}/`,
  name: siteConfig.name,
  inLanguage: 'fa-IR',
  publisher: { '@id': `${env.canonicalOrigin}/#organization` },
});

function breadcrumbList(id: string, crumbs: Crumb[]) {
  const items: Crumb[] = [{ name: siteConfig.name, url: '/' }, ...crumbs];
  return {
    '@type': 'BreadcrumbList',
    '@id': id,
    itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.url) })),
  };
}

function person(a: Pick<BlogAuthor, 'name' | 'url' | 'bio' | 'avatar' | 'social'>) {
  return {
    '@type': 'Person',
    '@id': `${abs(a.url)}#person`,
    name: a.name,
    url: abs(a.url),
    description: a.bio ?? undefined,
    image: a.avatar ? { '@type': 'ImageObject', url: a.avatar.url, caption: a.name } : undefined,
    sameAs: Object.values(a.social ?? {}).filter(Boolean),
  };
}

export function faqPage(faqs: BlogFaq[], url: string) {
  return {
    '@type': 'FAQPage',
    '@id': `${abs(url)}#faq`,
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer_html } })),
  };
}

/** Article/BlogPosting + WebPage + BreadcrumbList + Person (+ FAQPage), one @graph like Yoast. */
export function blogPostJsonLd(post: BlogPost) {
  const url = abs(post.url);
  const graph: Record<string, unknown>[] = [
    {
      '@type': post.schema_type,
      '@id': `${url}#article`,
      isPartOf: { '@id': `${url}#webpage` },
      mainEntityOfPage: { '@id': `${url}#webpage` },
      headline: post.title,
      description: post.seo.description ?? post.excerpt,
      datePublished: post.published_at ?? undefined,
      dateModified: post.updated_at ?? post.published_at ?? undefined,
      wordCount: post.word_count,
      timeRequired: `PT${post.reading_minutes}M`,
      inLanguage: 'fa-IR',
      articleSection: post.categories.map((c) => c.name),
      keywords: post.tags.map((t) => t.name),
      image: post.cover ? { '@type': 'ImageObject', url: post.cover.url, width: post.cover.width ?? undefined, height: post.cover.height ?? undefined, caption: post.cover.alt ?? post.title } : undefined,
      author: post.author_profile ? { '@id': `${abs(post.author_profile.url)}#person` } : { '@id': `${env.canonicalOrigin}/#organization` },
      publisher: { '@id': `${env.canonicalOrigin}/#organization` },
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: post.seo.title,
      isPartOf: { '@id': `${env.canonicalOrigin}/#website` },
      primaryImageOfPage: post.cover ? { '@type': 'ImageObject', url: post.cover.url } : undefined,
      datePublished: post.published_at ?? undefined,
      dateModified: post.updated_at ?? undefined,
      breadcrumb: { '@id': `${url}#breadcrumb` },
      inLanguage: 'fa-IR',
    },
    breadcrumbList(`${url}#breadcrumb`, post.breadcrumb),
    website(),
    organization(),
  ];
  if (post.author_profile) graph.push(person(post.author_profile));
  if (post.faqs.length) graph.push(faqPage(post.faqs, post.url));
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** CollectionPage + ItemList of posts + BreadcrumbList (blog index, category, tag); ProfilePage for authors. */
export function blogArchiveJsonLd({
  url,
  name,
  description,
  crumbs,
  posts,
  author,
}: {
  url: string;
  name: string;
  description?: string | null;
  crumbs: Crumb[];
  posts: BlogPostCard[];
  author?: BlogAuthor;
}) {
  const u = abs(url);
  const graph: Record<string, unknown>[] = [
    {
      '@type': author ? 'ProfilePage' : 'CollectionPage',
      '@id': `${u}#webpage`,
      url: u,
      name,
      description: description ?? undefined,
      inLanguage: 'fa-IR',
      isPartOf: { '@id': `${env.canonicalOrigin}/#website` },
      breadcrumb: { '@id': `${u}#breadcrumb` },
      mainEntity: author
        ? { '@id': `${abs(author.url)}#person` }
        : {
            '@type': 'ItemList',
            numberOfItems: posts.length,
            itemListElement: posts.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(p.url), name: p.title })),
          },
    },
    breadcrumbList(`${u}#breadcrumb`, crumbs),
    website(),
    organization(),
  ];
  if (author) graph.push(person(author));
  return { '@context': 'https://schema.org', '@graph': graph };
}
