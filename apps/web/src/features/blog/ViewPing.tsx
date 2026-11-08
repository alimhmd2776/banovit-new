'use client';

import { useEffect } from 'react';

/** Counts one view after the page has been visible for a moment (the CMS dedupes per IP for 30 minutes). */
export function ViewPing({ slug }: { slug: string }) {
  useEffect(() => {
    const t = setTimeout(() => {
      fetch('/api/blog-views/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }), keepalive: true }).catch(() => {});
    }, 3000);
    return () => clearTimeout(t);
  }, [slug]);
  return null;
}
