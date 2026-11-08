import Image from 'next/image';
import Link from 'next/link';
import type { BlogPostCard } from '@banovit/api-client';
import { cx, IconTag } from '@banovit/ui';
import { faDate } from './format';

/** Category label with the tag icon (design: blue, small). */
export function CategoryLabel({ post, className }: { post: BlogPostCard; className?: string }) {
  if (!post.category) return null;
  return (
    <span className={cx('inline-flex items-center gap-1 text-xs font-medium text-primary', className)}>
      <IconTag size={14} />
      {post.category.name}
    </span>
  );
}

function Byline({ post }: { post: BlogPostCard }) {
  return (
    <p className="flex items-center justify-between gap-2 text-xs text-text-subtle">
      <span className="truncate">{post.author?.name}</span>
      {post.published_at ? <time dateTime={post.published_at}>{faDate(post.published_at)}</time> : null}
    </p>
  );
}

/**
 * Carousel card (پرطرفدارترین، راهنمای انتخاب، طراحی داخلی): image on top.
 * The whole card is one link; the category stays plain text to keep one tab stop.
 */
export function PostCardVertical({ post, priority = false, className }: { post: BlogPostCard; priority?: boolean; className?: string }) {
  return (
    <article className={cx('group h-full', className)}>
      <Link href={post.url} className="flex h-full flex-col gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-surface-muted">
          {post.cover ? (
            <Image
              src={post.cover.url}
              alt={post.cover.alt ?? post.title}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 300px, 60vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : null}
        </div>
        <CategoryLabel post={post} />
        <h3 className="line-clamp-2 text-sm font-bold leading-6 text-text group-hover:text-primary">{post.title}</h3>
        <div className="mt-auto">
          <Byline post={post} />
        </div>
      </Link>
    </article>
  );
}

/** List row (تازه‌ترین، همه مقالات، آرشیوها): text on the start side, square thumb on the end side. */
export function PostCardRow({ post, priority = false, headingLevel = 3 }: { post: BlogPostCard; priority?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="group">
      <Link href={post.url} className="flex items-stretch gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <CategoryLabel post={post} />
          <Heading className="line-clamp-2 text-sm font-bold leading-6 text-text group-hover:text-primary">{post.title}</Heading>
          {post.excerpt ? <p className="line-clamp-1 text-xs leading-5 text-text-muted">{post.excerpt}</p> : null}
          <div className="mt-auto">
            <Byline post={post} />
          </div>
        </div>
        <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-surface-muted sm:size-24">
          {post.cover ? (
            <Image src={post.cover.url} alt={post.cover.alt ?? post.title} fill priority={priority} sizes="96px" className="object-cover" />
          ) : null}
        </div>
      </Link>
    </article>
  );
}

/** Rows inside the grey rounded panel of the design; desktop switches to a 2-column grid of the same rows. */
export function PostList({ posts, footer, headingLevel }: { posts: BlogPostCard[]; footer?: React.ReactNode; headingLevel?: 2 | 3 }) {
  return (
    <div className="rounded-lg bg-surface-muted p-3 sm:p-4">
      <ul className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        {posts.map((p, i) => (
          <li key={p.id} className="rounded-md bg-surface p-3">
            <PostCardRow post={p} priority={i < 2} headingLevel={headingLevel} />
          </li>
        ))}
      </ul>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}

/** Horizontal scroll-snap row on mobile, grid from lg (no JS). */
export function PostRail({ posts, label }: { posts: BlogPostCard[]; label: string }) {
  return (
    <ul
      aria-label={label}
      className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0"
    >
      {posts.map((p) => (
        <li key={p.id} className="w-[62%] shrink-0 snap-start sm:w-[40%] lg:w-auto">
          <PostCardVertical post={p} />
        </li>
      ))}
    </ul>
  );
}

/** Section title of the design: icon in a circle, small blue English kicker, Persian title and a hairline. */
export function SectionHeader({
  title,
  kicker,
  icon,
  id,
  action,
}: {
  title: string;
  kicker?: string | null;
  icon: React.ReactNode;
  id?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center gap-3 lg:mb-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text">{icon}</span>
      <div className="min-w-0">
        {kicker ? (
          <p className="text-right text-xs font-medium text-primary" lang="en" dir="ltr">
            {kicker}
          </p>
        ) : null}
        <h2 id={id} className="text-base font-bold text-text lg:text-lg">
          {title}
        </h2>
      </div>
      <span aria-hidden="true" className="h-px flex-1 self-end bg-border" />
      {action}
    </div>
  );
}

export function MoreLink({ href, children = 'مطالب بیشتر' }: { href: string; children?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex h-12 w-full items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-on hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus lg:mx-auto lg:w-72"
    >
      {children}
    </Link>
  );
}
