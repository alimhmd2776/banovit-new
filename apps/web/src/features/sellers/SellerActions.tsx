'use client';

import { useNavRouter as useRouter } from '@/lib/use-nav-router';
import { useEffect, useState } from 'react';
import { cx, IconChevronRight, IconHeart, IconShare } from '@banovit/ui';
import { me } from '@/features/account/client';

/**
 * Likes made before signing in (and the old browser-only favorites) wait
 * here; after login they are sent to /me/seller-likes and the key is cleared.
 */
const PENDING_KEY = 'bnv:favorite-sellers';

function readPending(): string[] {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function writePending(list: string[]) {
  try {
    if (list.length) window.localStorage.setItem(PENDING_KEY, JSON.stringify(list));
    else window.localStorage.removeItem(PENDING_KEY);
  } catch {
    /* storage blocked */
  }
}

const path = (slug: string) => `seller-likes/${encodeURIComponent(slug)}`;

const EVENT = 'seller-like:updated';
let loading: Promise<string[] | null> | null = null;

/** One request per page load, shared by the mobile and desktop headers. */
function loadLikes(): Promise<string[] | null> {
  loading ??= fetchLikes().finally(() => window.setTimeout(() => (loading = null), 0));
  return loading;
}

/** Liked slugs of the signed-in customer, or null for a guest. Sends pending likes first. */
async function fetchLikes(): Promise<string[] | null> {
  const res = await fetch('/api/me/seller-likes/slugs/', {
    credentials: 'same-origin',
    cache: 'no-store',
  }).catch(() => null);
  if (!res?.ok) return null;
  const liked = ((await res.json()) as { data?: string[] }).data ?? [];
  const pending = readPending().filter((s) => !liked.includes(s));
  if (pending.length) {
    const sent = await Promise.all(
      pending.map((s) =>
        me('PUT', path(s)).then(
          () => s,
          () => null,
        ),
      ),
    );
    liked.push(...sent.filter((s): s is string => s !== null));
  }
  writePending([]);
  return liked;
}

const iconButton =
  'inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface text-text hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus';

/** «بازگشت» in the mobile app bar: history back when the visitor came from this site, else home. */
export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className={iconButton}
      aria-label="بازگشت"
      onClick={() => (window.history.length > 1 && document.referrer.startsWith(window.location.origin) ? router.back() : router.push('/'))}
    >
      <IconChevronRight size={22} />
    </button>
  );
}

/**
 * Share + like («فروشگاه‌های محبوب»). Likes are saved per customer
 * (/me/seller-likes) and listed in /my-account/favorite-sellers/; a guest's
 * click goes to login and the like is sent once they are back. The heart is
 * hidden when the CMS switches likes off (`likesEnabled`).
 */
export function SellerActions({ slug, name, url, likesEnabled = true }: { slug: string; name: string; url: string; likesEnabled?: boolean }) {
  const [favorite, setFavorite] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!likesEnabled) return;
    let alive = true;
    loadLikes().then((liked) => {
      if (!alive) return;
      setSignedIn(liked !== null);
      setFavorite(liked?.includes(slug) ?? false);
    });
    // Keep the other header copy (mobile / desktop) in step.
    const onUpdate = (e: Event) => {
      const d = (e as CustomEvent<{ slug: string; liked: boolean }>).detail;
      if (d?.slug === slug) setFavorite(d.liked);
    };
    window.addEventListener(EVENT, onUpdate);
    return () => {
      alive = false;
      window.removeEventListener(EVENT, onUpdate);
    };
  }, [slug, likesEnabled]);

  const toggleFavorite = async () => {
    if (busy) return;
    if (signedIn === false) {
      writePending([...readPending().filter((s) => s !== slug), slug]);
      window.location.href = `/login/?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    const next = !favorite;
    const announce = (liked: boolean) => window.dispatchEvent(new CustomEvent(EVENT, { detail: { slug, liked } }));
    setFavorite(next);
    announce(next);
    setBusy(true);
    try {
      await me(next ? 'PUT' : 'DELETE', path(slug));
    } catch {
      setFavorite(!next);
      announce(!next);
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    const href = new URL(url, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url: href });
        return;
      }
      await navigator.clipboard.writeText(href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      <button type="button" className={iconButton} aria-label="اشتراک‌گذاری فروشگاه" onClick={share}>
        <IconShare />
      </button>
      {likesEnabled && (
        <button
          type="button"
          className={cx(iconButton, favorite && 'text-danger')}
          aria-label={favorite ? 'حذف از فروشگاه‌های محبوب' : 'افزودن به فروشگاه‌های محبوب'}
          aria-pressed={favorite}
          aria-busy={busy}
          onClick={toggleFavorite}
        >
          <IconHeart fill={favorite ? 'currentColor' : 'none'} />
        </button>
      )}
      <span role="status" aria-live="polite" className={cx('absolute end-0 top-full mt-1 whitespace-nowrap rounded-sm bg-text px-2 py-1 text-xs text-surface', !copied && 'sr-only')}>
        {copied ? 'لینک فروشگاه کپی شد' : ''}
      </span>
    </div>
  );
}
