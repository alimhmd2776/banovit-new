'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { BlogPostCard } from '@banovit/api-client';
import { cx, faDigits, IconTag } from '@banovit/ui';
import { BookmarkButton } from './BookmarkButton';

/**
 * Featured posts slider (scroll-snap, swipeable, works without JS). Dots show
 * the active slide; the first image is the LCP element (priority).
 */
export function HeroSlider({ posts }: { posts: BlogPostCard[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { root: el, threshold: 0.6 },
    );
    el.querySelectorAll('li').forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [posts.length]);

  const go = (i: number) => {
    const el = track.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  };

  if (posts.length === 0) return null;

  return (
    <section aria-roledescription="carousel" aria-label="مقالات ویژه" className="relative -mx-4 lg:mx-0">
      <ul ref={track} className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto lg:rounded-lg">
        {posts.map((post, i) => (
            <li
              key={post.id}
              data-index={i}
              aria-roledescription="slide"
              aria-label={`${faDigits(i + 1)} از ${faDigits(posts.length)}`}
              className="relative aspect-[4/5] w-full shrink-0 snap-start overflow-hidden sm:aspect-[16/9] lg:aspect-[21/9]"
            >
              {post.cover ? (
                <Image
                  src={post.cover.url}
                  alt={post.cover.alt ?? post.title}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1280px) 1248px, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-primary" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 space-y-3 p-4 text-white lg:p-8">
                {post.author ? <p className="text-xs opacity-80">{post.author.name}</p> : null}
                <h2 className="text-lg font-extrabold leading-8 lg:max-w-2xl lg:text-3xl lg:leading-[3rem]">
                  <Link href={post.url} className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-white">
                    {post.title}
                  </Link>
                </h2>
                {post.category ? (
                  <p className="relative flex items-center gap-2">
                    <Link
                      href={post.category.url}
                      className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur hover:bg-white/25"
                    >
                      <IconTag size={14} />
                      {post.category.name}
                    </Link>
                  </p>
                ) : null}
              </div>
              <div className="absolute end-4 top-4 lg:end-8 lg:top-8">
                <BookmarkButton post={post} variant="overlay" />
              </div>
            </li>
        ))}
      </ul>
      {posts.length > 1 ? (
        <div className="pointer-events-none absolute start-4 top-4 flex gap-1 lg:start-8 lg:top-8" >
          {posts.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`رفتن به اسلاید ${faDigits(i + 1)}`}
              aria-current={i === active}
              className={cx('pointer-events-auto h-1.5 rounded-full transition-all', i === active ? 'w-5 bg-white' : 'w-1.5 bg-white/50')}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
