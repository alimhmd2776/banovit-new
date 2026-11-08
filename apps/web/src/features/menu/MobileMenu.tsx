'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import type { MenuItem } from '@banovit/api-client';
import { cx, IconBag, IconChevronLeft, IconChevronRight, IconDots4, IconMenu, IconSearch, IconUser } from '@banovit/ui';
import { CategorySheet } from './CategorySheet';
import { MenuIcon, MenuLink } from './parts';
import { useModal } from './useModal';
import { Logo } from './Logo';

/**
 * Mobile navigation: hamburger -> side drawer (designs/menu/07) with the
 * «محصولات» links (first one opens the category sheet) and «دسترسی سریع»;
 * cart card and account row at the bottom. Hidden from lg.
 */
export function MobileMenu({
  categories,
  productLinks,
  quickLinks,
  cartCount,
  userName,
}: {
  categories: MenuItem[];
  productLinks: MenuItem[];
  quickLinks: MenuItem[];
  /** Filled in by the cart/account threads; unknown until then. */
  cartCount?: number | null;
  userName?: string | null;
}) {
  const [drawer, setDrawer] = useState(false);
  const [sheet, setSheet] = useState(false);
  const closeDrawer = useCallback(() => setDrawer(false), []);
  const closeSheet = useCallback(() => setSheet(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setDrawer(true)}
        aria-label="منو"
        aria-haspopup="dialog"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-text hover:bg-surface-muted lg:hidden"
      >
        <IconMenu />
      </button>
      <Drawer
        open={drawer}
        onClose={closeDrawer}
        onOpenCategories={() => {
          setDrawer(false);
          setSheet(true);
        }}
        productLinks={productLinks}
        quickLinks={quickLinks}
        cartCount={cartCount}
        userName={userName}
      />
      <CategorySheet items={categories} open={sheet} onClose={closeSheet} />
    </>
  );
}

function isActive(url: string, pathname: string, search: string): boolean {
  try {
    const u = new URL(url, 'https://x.invalid');
    if (u.origin !== 'https://x.invalid') return false;
    return u.pathname === pathname && u.search === search;
  } catch {
    return false;
  }
}

function Drawer({
  open,
  onClose,
  onOpenCategories,
  productLinks,
  quickLinks,
  cartCount,
  userName,
}: {
  open: boolean;
  onClose: () => void;
  onOpenCategories: () => void;
  productLinks: MenuItem[];
  quickLinks: MenuItem[];
  cartCount?: number | null;
  userName?: string | null;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname() ?? '/';
  // read on open (no useSearchParams: it would force a Suspense boundary around the layout header)
  const search = typeof window !== 'undefined' ? window.location.search : '';
  useModal(open, panel, onClose);

  if (!open || typeof document === 'undefined') return null;

  const row = 'flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus';
  const activeRow = 'bg-warning-subtle font-medium text-warning';

  const linkRow = (item: MenuItem) => {
    const active = isActive(item.url, pathname, search);
    return (
      <li key={item.id}>
        <MenuLink href={item.url} onNavigate={onClose} className={cx(row, active && activeRow)} aria-current={active ? 'page' : undefined}>
          <MenuIcon name={item.icon} size={20} className={active ? undefined : 'text-text-muted'} />
          <span className="flex-1">{item.title}</span>
          {active ? <IconChevronLeft size={18} /> : null}
        </MenuLink>
      </li>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-drawer lg:hidden" role="presentation">
      <div className="absolute inset-0 animate-[fadeIn_150ms_ease-out] bg-overlay" onClick={onClose} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 start-0 flex w-[300px] max-w-[85vw] animate-[drawerInStart_300ms_var(--ease-standard)] flex-col rounded-e-[28px] bg-surface shadow-lg"
      >
        <h2 id={titleId} className="sr-only">
          منوی سایت
        </h2>
        <div className="flex items-center justify-between px-4 pt-4">
          <Logo compact />
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن منو"
            className="inline-flex size-11 items-center justify-center rounded-full border border-border text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus"
          >
            <IconChevronRight size={22} />
          </button>
        </div>

        <form action="/" role="search" className="relative mx-4 mt-4">
          <label htmlFor={`${titleId}-s`} className="sr-only">
            جستجو محصولات
          </label>
          <input
            id={`${titleId}-s`}
            name="s"
            type="search"
            placeholder="جستجو محصولات ..."
            className="h-11 w-full rounded-md bg-surface-muted pe-11 ps-4 text-sm text-text placeholder:text-text-subtle focus:outline-2 focus:outline-focus"
          />
          <input type="hidden" name="post_type" value="product" />
          <IconSearch size={20} className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        </form>

        <nav aria-label="منوی موبایل" className="mt-3 flex-1 overflow-y-auto overscroll-contain px-2">
          <p className="px-3 pb-1 pt-3 text-xs text-text-subtle">محصولات</p>
          <ul>
            <li>
              <button type="button" className={row} onClick={onOpenCategories} aria-haspopup="dialog" data-autofocus>
                <IconDots4 size={20} className="text-text-muted" />
                <span className="flex-1 text-start">دسته بندی</span>
              </button>
            </li>
            {productLinks.map(linkRow)}
          </ul>
          {quickLinks.length ? (
            <>
              <p className="px-3 pb-1 pt-4 text-xs text-text-subtle">دسترسی سریع</p>
              <ul>{quickLinks.map(linkRow)}</ul>
            </>
          ) : null}
        </nav>

        <div className="px-4 pb-3">
          <MenuLink href="/cart/" onNavigate={onClose} className="flex items-center gap-3 rounded-md bg-surface-muted p-3 hover:bg-border">
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-on">
              <IconBag size={14} />
            </span>
            <span>
              <span className="block text-sm font-bold text-text">
                {cartCount ? (
                  <>
                    {new Intl.NumberFormat('fa-IR').format(cartCount)} محصول در سبد<span className="text-primary">!</span>
                  </>
                ) : (
                  'سبد خرید'
                )}
              </span>
              <span className="mt-0.5 block text-xs text-text-subtle">جهت مشاهده سبدخرید کلیک کنید</span>
            </span>
          </MenuLink>
        </div>
        <MenuLink
          href="/my-account/"
          onNavigate={onClose}
          className="flex items-center gap-3 border-t border-border px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))] hover:bg-surface-muted"
        >
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-muted text-text-muted">
            <IconUser size={20} />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold text-text">{userName || 'ورود یا ثبت‌نام'}</span>
            <span className="mt-0.5 block text-xs text-text-subtle">حساب کاربری من</span>
          </span>
          <IconChevronLeft size={18} className="text-text-muted" />
        </MenuLink>
      </div>
    </div>,
    document.body,
  );
}
