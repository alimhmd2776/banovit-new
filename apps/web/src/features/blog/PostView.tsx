import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '@banovit/api-client';
import { Accordion, Breadcrumb, faDigits, IconBook, IconCalendar, IconEye, IconFolder, IconHistory } from '@banovit/ui';
import { abs, blogPostJsonLd } from '@/lib/seo/blog';
import { jsonLdScript } from '@/lib/seo';
import { PostBlocks, ProductCarousel, SummaryBox } from './blocks';
import { BookmarkButton } from './BookmarkButton';
import { PostRail, SectionHeader } from './cards';
import { BlogTitleBar } from './chrome';
import { faDate, internalHref, mainHeadings } from './format';
import { ShareBar, ShareButton } from './ShareButtons';
import { Toc } from './Toc';
import { ViewPing } from './ViewPing';


/**
 * Single post (/blog/{slug}/). Mobile: one column with the floating TOC pill.
 * From lg: article column + sticky sidebar (TOC). Same content in both.
 */
export function PostView({ post }: { post: BlogPost }) {
  const url = abs(post.url);
  const crumbs = post.breadcrumb.map((c, i) => (i === post.breadcrumb.length - 1 ? { name: c.name } : { name: c.name, url: c.url }));
  const author = post.author_profile;
  const showUpdated = post.updated_at && post.published_at && post.updated_at.slice(0, 10) !== post.published_at.slice(0, 10);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(blogPostJsonLd(post))} />
      <ViewPing slug={post.slug} />

      <div className="mx-auto max-w-container px-4 pb-28 pt-3 lg:pb-16 lg:pt-6">
        <div className="space-y-3">
          <BlogTitleBar
            actions={
              <>
                <ShareButton url={url} title={post.title} />
                <BookmarkButton post={post} />
              </>
            }
          />
          <Breadcrumb items={crumbs} />
        </div>

        <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-10">
          <article className="min-w-0">
            {post.banner ? (
              <Link href={internalHref(post.banner.url ?? '/')} className="mb-3 block overflow-hidden rounded-md">
                <Image
                  src={post.banner.image.url}
                  alt={post.banner.image.alt ?? ''}
                  width={post.banner.image.width ?? 1200}
                  height={post.banner.image.height ?? 120}
                  sizes="(min-width: 1024px) 860px, 100vw"
                  className="h-auto w-full"
                />
              </Link>
            ) : null}

            {post.cover ? (
              <div className="relative -mx-4 aspect-[16/11] overflow-hidden bg-surface-muted sm:mx-0 sm:rounded-lg lg:aspect-[16/9]">
                <Image
                  src={post.cover.url}
                  alt={post.cover.alt ?? post.title}
                  fill
                  priority
                  sizes="(min-width: 1280px) 900px, (min-width: 1024px) 70vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            <header className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3 text-xs">
                {post.category ? (
                  <Link href={post.category.url} className="font-medium text-primary hover:underline">
                    {post.category.name}
                  </Link>
                ) : (
                  <span />
                )}
                {post.published_at ? (
                  <span className="inline-flex items-center gap-1 text-text-muted">
                    <IconCalendar size={16} />
                    <time dateTime={post.published_at}>{faDate(post.published_at)}</time>
                  </span>
                ) : null}
              </div>

              <h1 className="text-xl font-extrabold leading-9 text-text lg:text-3xl lg:leading-[3rem]">{post.title}</h1>

              <div className="flex flex-wrap items-center justify-between gap-3">
                {post.categories.length > 0 ? (
                  <p className="inline-flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2 text-xs text-text-muted">
                    <IconFolder size={16} />
                    {post.categories.map((c, i) => (
                      <span key={c.id}>
                        {i > 0 ? '، ' : null}
                        <Link href={c.url} className="hover:text-primary">
                          {c.name}
                        </Link>
                      </span>
                    ))}
                  </p>
                ) : null}
                <p className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <IconEye size={16} />
                    {faDigits(post.views)} بازدید
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <IconBook size={16} />
                    {faDigits(post.reading_minutes)} دقیقه
                  </span>
                </p>
              </div>
              {showUpdated ? (
                <p className="inline-flex items-center gap-1 text-xs text-text-subtle">
                  <IconHistory size={14} />
                  به‌روزرسانی: <time dateTime={post.updated_at!}>{faDate(post.updated_at)}</time>
                </p>
              ) : null}
            </header>

            <div className="mt-5 space-y-5">
              {post.summary_html ? <SummaryBox html={post.summary_html} /> : null}
              <PostBlocks blocks={post.blocks} />
            </div>

            {post.related_products.length > 0 ? <ProductCarousel title="محصولات مرتبط" subtitle="انتخاب خریداران بانویت" products={post.related_products} /> : null}

            {post.faqs.length > 0 ? (
              <section aria-labelledby="post-faq" className="mt-8">
                <h2 id="post-faq" className="mb-3 text-lg font-bold text-text">
                  سوالات متداول
                </h2>
                <Accordion items={post.faqs.map((f, i) => ({ id: i, title: f.question, html: f.answer_html }))} className="divide-y-0 border-0 bg-transparent [&>details]:mb-3 [&>details]:rounded-md [&>details]:border [&>details]:border-border [&>details]:bg-surface" />
              </section>
            ) : null}

            {post.tags.length > 0 ? (
              <ul className="mt-8 flex flex-wrap gap-2" aria-label="برچسب‌ها">
                {post.tags.map((t) => (
                  <li key={t.slug}>
                    <Link href={t.url} className="inline-flex h-8 items-center rounded-full border border-border px-3 text-xs text-text-muted hover:border-primary hover:text-primary">
                      #{t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            {author ? (
              <section aria-label="نویسنده" className="mt-10 flex flex-col items-center gap-2 text-center">
                <Link href={author.url} className="relative size-28 overflow-hidden rounded-full border-4 border-surface bg-primary shadow-md">
                  {author.avatar ? <Image src={author.avatar.url} alt={author.avatar.alt ?? author.name} fill sizes="112px" className="object-cover" /> : null}
                </Link>
                <p className="flex items-center gap-2 text-base">
                  <Link href={author.url} className="font-bold text-text hover:text-primary" rel="author">
                    {author.name}
                  </Link>
                  {author.job_title ? (
                    <>
                      <span aria-hidden="true" className="h-4 w-px bg-border" />
                      <span className="text-primary">{author.job_title}</span>
                    </>
                  ) : null}
                </p>
                {author.bio ? <p className="max-w-md text-sm text-text-muted">{author.bio}</p> : null}
              </section>
            ) : null}

            <div className="mt-5">
              <ShareBar url={url} title={post.title} />
            </div>
          </article>

          <aside className="lg:sticky lg:top-[calc(var(--header-height)+24px)]">
            <Toc items={mainHeadings(post.toc, post.faqs.length > 0 ? 'سوالات متداول' : null)} />
          </aside>
        </div>

        {post.related_posts.length > 0 ? (
          <section aria-labelledby="related-posts" className="mt-12">
            <SectionHeader id="related-posts" title="مطالب مرتبط" kicker="Related" icon={<IconBook size={20} />} />
            <PostRail posts={post.related_posts} label="مطالب مرتبط" />
          </section>
        ) : null}
      </div>
    </>
  );
}
