'use client';

import Link from 'next/link';
import { faDigits, IconChevronDown, IconHeart, IconUser } from '@banovit/ui';
import { useHeaderSession } from './header-session';
import { DEFAULT_TEXTS, type HeaderTexts } from './header-texts';

/** Desktop wishlist button (with count) and «خوش‌آمدید! name» account box (designs/menu/01). */
export function HeaderAccount({ texts = DEFAULT_TEXTS }: { texts?: HeaderTexts }) {
  const { name, signedIn, wishlistCount } = useHeaderSession();
  return (
    <>
      <Link
        href={signedIn ? '/my-account/wishlist/' : '/login/?redirect=%2Fmy-account%2Fwishlist%2F'}
        className="relative hidden size-12 items-center justify-center rounded-md border border-border text-text hover:bg-surface-muted lg:inline-flex"
        aria-label="علاقه‌مندی‌ها"
      >
        <IconHeart />
        {wishlistCount > 0 ? (
          <span className="absolute -top-1 end-0 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-on ring-2 ring-surface">
            {faDigits(wishlistCount > 99 ? 99 : wishlistCount)}
            <span className="sr-only"> کالا در علاقه‌مندی‌ها</span>
          </span>
        ) : null}
      </Link>
      <Link
        href={signedIn ? '/my-account/' : '/login/'}
        className="ms-3 hidden items-center gap-3 rounded-md px-2 py-1 hover:bg-surface-muted lg:flex"
      >
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-muted text-text-muted">
          <IconUser size={20} />
        </span>
        <span className="min-w-[96px] leading-tight">
          <span className="block text-[11px] text-text-subtle">{texts.welcome}</span>
          <span className="block max-w-[160px] truncate text-sm font-medium text-text">
            {name === undefined ? ' ' : signedIn ? name : texts.login}
          </span>
        </span>
        {signedIn ? <IconChevronDown size={18} className="text-text-muted" /> : null}
      </Link>
    </>
  );
}
