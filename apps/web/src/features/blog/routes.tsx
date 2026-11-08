import 'server-only';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Crumb } from '@banovit/api-client';
import {
  getBlogAuthor,
  getBlogCategory,
  getBlogHome,
  getBlogPost,
  getBlogTag,
  isNotFound,
  listBlogCategories,
  listBlogPosts,
  movedLocation,
} from '@/lib/api';
import { blogArchiveMetadata, blogPostMetadata } from '@/lib/seo/blog';
import { ArchiveView } from './ArchiveView';
import { postPagePath } from './format';
import { HomeView } from './HomeView';
import { PostView } from './PostView';

/**
 * Route handlers for every blog URL kept from WordPress (docs/03-seo-parity.md):
 *   /blog/ [page/N/]   /blog/{slug}/   /blog/category/{...path}/ [page/N/]
 *   /blog/tag/{slug}/ [page/N/]   /blog/author/{slug}/ [page/N/]   /blog/?q= (noindex)
 * A renamed post/category (CMS slug_history) answers 301 to its current URL.
 */

export type SearchParams = Record<string, string | string[] | undefined>;

const PER_PAGE = 12;
const BLOG: Crumb = { name: 'مقالات', url: '/blog/' };

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

async function load<T>(p: Promise<T>): Promise<T> {
  try {
    return await p;
  } catch (e) {
    const moved = movedLocation(e);
    if (moved) permanentRedirect(moved);
    if (isNotFound(e)) notFound();
    throw e;
  }
}

export function parsePage(n: string | undefined): number {
  if (n === undefined) return 1;
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2 || page > 100 || String(page) !== n) notFound(); // /page/1/ and junk are not pages
  return page;
}

/** [..., 'page', '3'] -> {segments: [...], page: 3} */
function splitPage(segments: string[]): { segments: string[]; page: number } {
  if (segments.length >= 2 && segments.at(-2) === 'page') {
    return { segments: segments.slice(0, -2), page: parsePage(segments.at(-1)) };
  }
  return { segments, page: 1 };
}

function query(sp: SearchParams): string | undefined {
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  return q && q.trim() ? q.trim().slice(0, 100) : undefined;
}

function guardPage(page: number, lastPage: number) {
  if (page > lastPage) notFound();
}

/* ---------------- /blog/ and /blog/page/N/ ---------------- */

export async function blogIndexMetadata(pageParam: string | undefined, sp: SearchParams): Promise<Metadata> {
  const page = parsePage(pageParam);
  const home = await load(getBlogHome());
  const q = query(sp);
  if (q) return blogArchiveMetadata({ seo: { ...home.seo, title: `نتایج جستجو برای «${q}» - مقالات بانویت` }, page: 1, lastPage: 1, noindex: true });
  const lastPage = page > 1 ? (await load(listBlogPosts({ page, per_page: PER_PAGE }))).meta.last_page : 1;
  return blogArchiveMetadata({ seo: home.seo, page, lastPage });
}

export async function BlogIndexPage({ pageParam, sp }: { pageParam?: string; sp: SearchParams }) {
  const page = parsePage(pageParam);
  const q = query(sp);
  if (q) {
    const spPage = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;
    const [listing, categories] = await Promise.all([load(listBlogPosts({ q, page: Math.min(Math.max(1, spPage), 100), per_page: PER_PAGE })), load(listBlogCategories())]);
    return <ArchiveView title={`نتایج جستجو برای «${q}»`} crumbs={[BLOG, { name: 'جستجو', url: '/blog/' }]} basePath="/blog/" listing={listing} page={listing.meta.page} categories={categories} query={q} />;
  }
  if (page === 1) return <HomeView home={await load(getBlogHome())} />;

  const [listing, categories] = await Promise.all([load(listBlogPosts({ page, per_page: PER_PAGE })), load(listBlogCategories())]);
  guardPage(page, listing.meta.last_page);
  return <ArchiveView title="همه مقالات بانویت" crumbs={[BLOG]} basePath="/blog/" listing={listing} page={page} categories={categories} />;
}

/* ---------------- /blog/{slug}/ ---------------- */

export async function postMetadata(slug: string): Promise<Metadata> {
  return blogPostMetadata(await load(getBlogPost(decode(slug))));
}

export async function BlogPostPage({ slug }: { slug: string }) {
  const post = await load(getBlogPost(decode(slug)));
  return <PostView post={post} />;
}

/* ---------------- /blog/category/{...path}/[page/N/] ---------------- */

async function loadCategory(raw: string[]) {
  const { segments, page } = splitPage(raw.map(decode));
  if (segments.length === 0) notFound();
  const path = segments.join('/').toLowerCase();
  const [category, listing, categories] = await Promise.all([
    load(getBlogCategory(path)),
    load(listBlogPosts({ category: path, page, per_page: PER_PAGE })),
    load(listBlogCategories()),
  ]);
  guardPage(page, listing.meta.last_page);
  return { category, listing, categories, page };
}

export async function categoryMetadata(raw: string[]): Promise<Metadata> {
  const { category, listing, page } = await loadCategory(raw);
  return blogArchiveMetadata({ seo: category.seo, page, lastPage: listing.meta.last_page });
}

export async function BlogCategoryPage({ raw }: { raw: string[] }) {
  const { category, listing, categories, page } = await loadCategory(raw);
  const root = category.path.split('/')[0];
  return (
    <ArchiveView
      title={category.name}
      crumbs={category.breadcrumb}
      basePath={category.url}
      listing={listing}
      page={page}
      categories={categories}
      activeCategory={categories.some((c) => c.path === category.path && c.parent_id === null) ? category.path : root}
      descriptionHtml={category.description_html}
    />
  );
}

/* ---------------- /blog/tag/{slug}/ ---------------- */

async function loadTag(slug: string, pageParam?: string) {
  const page = parsePage(pageParam);
  const s = decode(slug).toLowerCase();
  const [tag, listing, categories] = await Promise.all([load(getBlogTag(s)), load(listBlogPosts({ tag: s, page, per_page: PER_PAGE })), load(listBlogCategories())]);
  guardPage(page, listing.meta.last_page);
  return { tag, listing, categories, page };
}

export async function tagMetadata(slug: string, pageParam?: string): Promise<Metadata> {
  const { tag, listing, page } = await loadTag(slug, pageParam);
  return blogArchiveMetadata({ seo: tag.seo, page, lastPage: listing.meta.last_page });
}

export async function BlogTagPage({ slug, pageParam }: { slug: string; pageParam?: string }) {
  const { tag, listing, categories, page } = await loadTag(slug, pageParam);
  return <ArchiveView title={`برچسب: ${tag.name}`} crumbs={tag.breadcrumb} basePath={tag.url} listing={listing} page={page} categories={categories} descriptionHtml={tag.description_html} />;
}

/* ---------------- /blog/author/{slug}/ ---------------- */

async function loadAuthor(slug: string, pageParam?: string) {
  const page = parsePage(pageParam);
  const s = decode(slug).toLowerCase();
  const [author, listing, categories] = await Promise.all([load(getBlogAuthor(s)), load(listBlogPosts({ author: s, page, per_page: PER_PAGE })), load(listBlogCategories())]);
  guardPage(page, listing.meta.last_page);
  return { author, listing, categories, page };
}

export async function authorMetadata(slug: string, pageParam?: string): Promise<Metadata> {
  const { author, listing, page } = await loadAuthor(slug, pageParam);
  return blogArchiveMetadata({ seo: author.seo, page, lastPage: listing.meta.last_page });
}

export async function BlogAuthorPage({ slug, pageParam }: { slug: string; pageParam?: string }) {
  const { author, listing, categories, page } = await loadAuthor(slug, pageParam);
  return <ArchiveView title={author.name} crumbs={author.breadcrumb} basePath={author.url} listing={listing} page={page} categories={categories} author={author} />;
}

