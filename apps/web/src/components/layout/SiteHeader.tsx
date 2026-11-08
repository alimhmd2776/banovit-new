import Link from 'next/link';
import { cx, IconCart, IconHeart, IconSearch, IconUser } from '@banovit/ui';
import { getMenu } from '@/lib/api';
import { siteConfig } from '@/lib/site-config';
import { Logo } from '@/features/menu/Logo';
import { MegaMenu } from '@/features/menu/MegaMenu';
import { MobileMenu } from '@/features/menu/MobileMenu';
import { MenuIcon, MenuLink } from '@/features/menu/parts';

/**
 * Shared header (layout component, docs/05-conventions.md). Promo banner,
 * then on desktop (designs/menu/01): support/links top bar, logo + search +
 * cart/wishlist/account row, and the nav row with the mega menu. On mobile:
 * menu button (drawer + category sheet), logo, search, cart.
 * All menus are edited in the CMS («منوهای فروشگاه»).
 */
export async function SiteHeader() {
  const [categories, headerNav, headerTop, mobileQuick] = await Promise.all([
    getMenu('categories'),
    getMenu('header_nav'),
    getMenu('header_top'),
    getMenu('mobile_quick'),
  ]);
  const navLinks = headerNav.items;

  return (
    <>
      <Link
        href={siteConfig.topBanner.href}
        className="flex h-12 items-center justify-center bg-primary px-4 text-center text-lg font-extrabold text-primary-on hover:bg-primary-hover lg:h-10 lg:text-sm"
      >
        {siteConfig.topBanner.text}
      </Link>

      <div className="hidden bg-surface lg:block">
        <div className="mx-auto flex max-w-container items-center justify-between gap-4 border-b border-border px-4 py-3 text-xs text-text-muted">
          <p>
            پشتیبانی:{' '}
            {siteConfig.supportPhones.map((p, i) => (
              <span key={p.tel}>
                {i > 0 ? ' و ' : null}
                <a href={`tel:${p.tel}`} className="hover:text-primary">
                  {p.display}
                </a>
              </span>
            ))}{' '}
            ({siteConfig.supportHours})
          </p>
          {headerTop.items.length ? (
            <nav aria-label="لینک‌های سریع">
              <ul className="flex items-center">
                {headerTop.items.map((l, i) => (
                  <li key={l.id} className={cx('px-3 last:pe-0', i > 0 && 'border-s border-border')}>
                    <MenuLink href={l.url} className={cx('hover:text-primary', l.highlight && 'text-primary')}>
                      {l.title}
                    </MenuLink>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </div>

      <header className="sticky top-0 z-sticky border-b border-border bg-surface/95 backdrop-blur lg:bg-surface lg:backdrop-blur-none">
        <div className="mx-auto flex h-header max-w-container items-center gap-2 px-4 lg:h-[84px] lg:gap-6">
          <MobileMenu categories={categories.items} productLinks={navLinks.filter((l) => !l.highlight && !mobileQuick.items.some((q) => q.url === l.url))} quickLinks={mobileQuick.items} />
          <Logo />
          <form action="/" role="search" className="relative min-w-0 flex-1 lg:max-w-[370px]">
            <label htmlFor="site-search" className="sr-only">
              جستجو در محصولات
            </label>
            <input
              id="site-search"
              name="s"
              type="search"
              placeholder="جستجو در بانویت…"
              className="h-10 w-full rounded-full border border-border bg-surface-muted pe-10 ps-4 text-sm text-text placeholder:text-text-subtle focus:border-primary focus:bg-surface focus:outline-none lg:h-12 lg:rounded-md"
            />
            <input type="hidden" name="post_type" value="product" />
            <IconSearch size={20} className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-text-subtle" />
          </form>
          <nav aria-label="حساب و سبد" className="flex items-center gap-1 lg:ms-auto lg:gap-3">
            <Link
              href="/cart/"
              className="inline-flex size-10 items-center justify-center rounded-full text-text hover:bg-surface-muted lg:size-12 lg:rounded-md lg:border lg:border-border"
              aria-label="سبد خرید"
            >
              <IconCart />
            </Link>
            <Link
              href="/my-account/"
              className="hidden size-12 items-center justify-center rounded-md border border-border text-text hover:bg-surface-muted lg:inline-flex"
              aria-label="علاقه‌مندی‌ها"
            >
              <IconHeart />
            </Link>
            <Link href="/my-account/" className="ms-3 hidden items-center gap-3 rounded-md px-2 py-1 hover:bg-surface-muted lg:flex">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-muted text-text-muted">
                <IconUser size={20} />
              </span>
              <span className="leading-tight">
                <span className="block text-[11px] text-text-subtle">خوش‌آمدید!</span>
                <span className="block text-sm font-medium text-text">ورود / ثبت‌نام</span>
              </span>
            </Link>
          </nav>
        </div>

        <nav aria-label="منوی اصلی" className="hidden lg:block">
          <div className="mx-auto flex h-12 max-w-container items-center gap-6 px-4 text-sm text-text-muted">
            {categories.items.length ? (
              <MegaMenu items={categories.items} />
            ) : (
              siteConfig.mainNav.map((item) => (
                <Link key={item.href} href={item.href} className="py-3 hover:text-primary">
                  {item.name}
                </Link>
              ))
            )}
            {navLinks.length ? <span className="h-5 w-px bg-border" aria-hidden="true" /> : null}
            <ul className="flex items-center gap-6">
              {navLinks.map((l, i) => (
                <li key={l.id} className={cx('flex items-center', l.highlight && i > 0 && 'border-s border-border ps-6')}>
                  <MenuLink href={l.url} className={cx('flex items-center gap-1.5 py-3 hover:text-primary', l.highlight && 'font-medium text-primary')}>
                    <MenuIcon name={l.icon} size={18} />
                    {l.title}
                  </MenuLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
}
