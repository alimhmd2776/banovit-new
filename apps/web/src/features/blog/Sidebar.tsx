'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { BlogPostSidebar } from '@banovit/api-client';
import { cx, IconChevronLeft, IconChevronRight, IconClock } from '@banovit/ui';
import { faAgo, internalHref } from './format';

/** Divider + «جدید ترین» (blue) + « مقاله ها», like the live sidebar headings. */
export function SidebarHeading({ accent, rest, id }: { accent: string; rest: string; id?: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2 id={id} className="shrink-0 text-base font-bold text-text">
        <span className="text-primary">{accent}</span> {rest}
      </h2>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}

function useAutoplay(count: number, ms: number): [number, (i: number) => void] {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (count < 2) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const t = setInterval(() => setI((x) => (x + 1) % count), ms);
    return () => clearInterval(t);
  }, [count, ms]);
  return [i, setI];
}

function Dots({ count, active, onPick, label }: { count: number; active: number; onPick: (i: number) => void; label: string }) {
  if (count < 2) return null;
  return (
    <div className="mt-2 flex justify-center gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`${label} ${i + 1}`}
          aria-current={i === active ? 'true' : undefined}
          onClick={() => onPick(i)}
          className="flex size-6 items-center justify-center focus-visible:outline-2 focus-visible:outline-focus"
        >
          <span className={cx('block h-2 rounded-full transition-all', i === active ? 'w-5 bg-primary' : 'w-2 bg-border-strong')} />
        </button>
      ))}
    </div>
  );
}

/** The post's own banners ([sidebar_banner]): fading slider, 4s autoplay, dots when more than one. */
export function SidebarBanners({ banners }: { banners: BlogPostSidebar['banners'] }) {
  const [active, setActive] = useAutoplay(banners.length, 4000);
  if (banners.length === 0) return null;
  return (
    <div>
      <div className="relative overflow-hidden rounded-lg">
        {banners.map((b, i) => {
          const img = (
            <Image
              src={b.image.url}
              alt={b.image.alt ?? 'Banner'}
              width={b.image.width ?? 600}
              height={b.image.height ?? 600}
              sizes="(min-width: 1024px) 300px, 100vw"
              className="h-auto w-full"
            />
          );
          return (
            <div key={i} className={cx('transition-opacity duration-500', i === 0 ? 'relative' : 'absolute inset-0', i === active ? 'opacity-100' : 'pointer-events-none opacity-0')} aria-hidden={i !== active}>
              {b.url ? (
                <a href={internalHref(b.url)} target="_blank" rel="nofollow noopener" tabIndex={i === active ? 0 : -1}>
                  {img}
                </a>
              ) : (
                img
              )}
            </div>
          );
        })}
      </div>
      <Dots count={banners.length} active={active} onPick={setActive} label="بنر" />
    </div>
  );
}

/** «جدید ترین مقاله ها»: 75×75 thumbnail, title, «… پیش». */
export function RecentPosts({ posts }: { posts: BlogPostSidebar['recent_posts'] }) {
  if (posts.length === 0) return null;
  return (
    <section aria-labelledby="sidebar-recent-posts">
      <SidebarHeading id="sidebar-recent-posts" accent="جدید ترین" rest="مقاله ها" />
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={p.url} className="group flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-focus">
              <span className="relative size-[75px] shrink-0 overflow-hidden rounded-[8px] bg-surface-muted">
                {p.cover ? <Image src={p.cover.url} alt={p.cover.alt ?? p.title} fill sizes="75px" className="object-cover" /> : null}
              </span>
              <span className="min-w-0 flex-1 space-y-1.5">
                <span className="line-clamp-2 text-[15px] font-semibold leading-6 text-text group-hover:text-primary">{p.title}</span>
                {p.published_at ? (
                  <span className="flex items-center gap-1 text-xs text-text-subtle">
                    <IconClock size={14} />
                    <time dateTime={p.published_at}>{faAgo(p.published_at)}</time>
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** «جدید ترین نظرات مشتریان»: «نظرات اخیر کاربران» card, one comment per slide, dots + arrows. */
export function RecentComments({ comments }: { comments: BlogPostSidebar['recent_comments'] }) {
  const [active, setActive] = useState(0);
  if (comments.length === 0) return null;
  const c = comments[active] ?? comments[0]!;
  const go = (d: number) => setActive((x) => (x + d + comments.length) % comments.length);
  return (
    <section aria-labelledby="sidebar-recent-comments">
      <SidebarHeading id="sidebar-recent-comments" accent="جدید ترین" rest="نظرات مشتریان" />
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-text">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="text-primary">
            <path fill="currentColor" d="M10 7H6a3 3 0 0 0-3 3v4h5v5h2v-6H5v-3a1 1 0 0 1 1-1h4V7zm11 0h-4a3 3 0 0 0-3 3v4h5v5h2v-6h-5v-3a1 1 0 0 1 1-1h4V7z" />
          </svg>
          نظرات اخیر کاربران
        </p>
        <figure aria-live="polite">
          <figcaption className="flex items-center gap-2">
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-sm font-bold text-primary">
              {c.author.trim().charAt(0)}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-text">{c.author}</span>
              <Link href={internalHref(c.url)} className="line-clamp-1 text-xs text-primary hover:underline">
                {c.title}
              </Link>
            </span>
          </figcaption>
          <blockquote className="mt-3 line-clamp-3 text-sm leading-7 text-text-muted">«{c.text}»</blockquote>
        </figure>
        {comments.length > 1 ? (
          <div className="mt-2 flex items-center justify-between">
            <button type="button" onClick={() => go(-1)} aria-label="نظر قبلی" className="flex size-9 items-center justify-center rounded-full border border-border text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus">
              <IconChevronRight size={16} />
            </button>
            <Dots count={comments.length} active={active} onPick={setActive} label="نظر" />
            <button type="button" onClick={() => go(1)} aria-label="نظر بعدی" className="flex size-9 items-center justify-center rounded-full border border-border text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus">
              <IconChevronLeft size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
