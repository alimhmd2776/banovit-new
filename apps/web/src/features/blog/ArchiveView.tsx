import Image from 'next/image';
import type { BlogAuthor, BlogCategoryTab, BlogPostListing, Crumb } from '@banovit/api-client';
import { Breadcrumb, faDigits, Pagination } from '@banovit/ui';
import { jsonLdScript } from '@/lib/seo';
import { blogArchiveJsonLd } from '@/lib/seo/blog';
import { PostList } from './cards';
import { BlogSearch, BlogTitleBar, CategoryTabs } from './chrome';
import { localizeLinks, postPagePath } from './format';

import type { ResolvedBlogUi } from './ui';
/**
 * Archive pages kept from WordPress: /blog/page/N/, /blog/category/{path}/,
 * /blog/tag/{slug}/, /blog/author/{slug}/ (each with /page/N/), and the
 * noindex search /blog/?q=. Pagination links are plain paths like WordPress.
 */
export function ArchiveView({
  title,
  crumbs,
  basePath,
  listing,
  page,
  categories,
  activeCategory,
  descriptionHtml,
  author,
  query,
  ui,
}: {
  ui: ResolvedBlogUi;
  title: string;
  crumbs: Crumb[];
  basePath: string;
  listing: BlogPostListing;
  page: number;
  categories: BlogCategoryTab[];
  activeCategory?: string | null;
  descriptionHtml?: string | null;
  author?: BlogAuthor;
  query?: string;
}) {
  const { meta } = listing;
  const visibleCrumbs = crumbs.map((c, i) => (i === crumbs.length - 1 ? { name: c.name } : c));

  return (
    <>
      {query === undefined ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(blogArchiveJsonLd({ url: postPagePath(basePath, page), name: title, crumbs, posts: listing.data, author }))}
        />
      ) : null}
      <div className="mx-auto max-w-container space-y-5 px-4 pb-24 pt-3 lg:space-y-8 lg:pb-16 lg:pt-6">
        <div className="space-y-4">
          <BlogTitleBar labels={ui.labels} />
          <BlogSearch defaultValue={query} placeholder={ui.labels.search_placeholder} />
          <CategoryTabs categories={categories} activePath={activeCategory} labels={ui.labels} />
        </div>

        <header className="space-y-3">
          <Breadcrumb items={visibleCrumbs} />
          {author ? (
            <div className="flex items-center gap-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-primary">
                {author.avatar ? <Image src={author.avatar.url} alt={author.avatar.alt ?? author.name} fill sizes="80px" className="object-cover" /> : null}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-text">{author.name}</h1>
                {author.job_title ? <p className="text-sm text-primary">{author.job_title}</p> : null}
                {author.bio ? <p className="mt-1 text-sm text-text-muted">{author.bio}</p> : null}
              </div>
            </div>
          ) : (
            <h1 className="text-xl font-extrabold text-text lg:text-2xl">
              {title}
              {page > 1 ? <span className="ms-2 text-sm font-normal text-text-muted">صفحه {faDigits(page)}</span> : null}
            </h1>
          )}
          {descriptionHtml && page === 1 ? <div className="blog-prose text-sm" dangerouslySetInnerHTML={{ __html: localizeLinks(descriptionHtml) }} /> : null}
          <p className="text-xs text-text-subtle">{faDigits(meta.total)} مقاله</p>
        </header>

        {listing.data.length > 0 ? (
          <PostList posts={listing.data} headingLevel={2} />
        ) : (
          <p className="rounded-lg bg-surface-muted p-8 text-center text-sm text-text-muted">{ui.labels.empty}</p>
        )}

        {meta.last_page > 1 ? (
          <Pagination
            current={meta.page}
            last={meta.last_page}
            hrefFor={(n) => (query !== undefined ? `/blog/?q=${encodeURIComponent(query)}${n > 1 ? `&page=${n}` : ''}` : postPagePath(basePath, n))}
          />
        ) : null}
      </div>
    </>
  );
}
