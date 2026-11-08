'use client';

import { useEffect, useState } from 'react';
import type { BlogPostCard } from '@banovit/api-client';
import { cx, IconBookmark } from '@banovit/ui';

const KEY = 'bv-blog-bookmarks';

type Saved = { url: string; title: string; at: number };

function read(): Saved[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Saved[];
  } catch {
    return [];
  }
}

/** Per-device «ذخیره مقاله» (localStorage) until customer accounts store it server-side. */
export function BookmarkButton({ post, variant = 'plain' }: { post: Pick<BlogPostCard, 'url' | 'title'>; variant?: 'plain' | 'overlay' }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(read().some((s) => s.url === post.url)), [post.url]);

  const toggle = () => {
    const list = read().filter((s) => s.url !== post.url);
    if (!saved) list.unshift({ url: post.url, title: post.title, at: Date.now() });
    try {
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, 100)));
    } catch {
      /* storage blocked */
    }
    setSaved(!saved);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? 'حذف از ذخیره‌شده‌ها' : 'ذخیره مقاله'}
      className={cx(
        'relative z-[1] inline-flex size-10 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-focus',
        variant === 'overlay' ? 'rounded-full bg-white text-text shadow-sm' : 'text-text hover:bg-surface-muted',
      )}
    >
      <IconBookmark size={20} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-primary' : undefined} />
    </button>
  );
}
