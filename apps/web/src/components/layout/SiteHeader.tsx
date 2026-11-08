import Link from 'next/link';
import { IconCart, IconSearch, IconUser } from '@banovit/ui';
import { siteConfig } from '@/lib/site-config';

/**
 * Shared header (owned by the PLP thread per docs/05-conventions.md):
 * promo banner, logo, search, account and cart; desktop adds the category nav.
 * Sticky; the banner scrolls away, the bar stays.
 */
export function SiteHeader() {
  return (
    <>
      <Link
        href={siteConfig.topBanner.href}
        className="block bg-primary px-4 py-2 text-center text-xs font-medium text-primary-on hover:bg-primary-hover"
      >
        {siteConfig.topBanner.text}
      </Link>
      <header className="sticky top-0 z-sticky border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-header max-w-container items-center gap-3 px-4">
          <Link href="/" className="shrink-0 text-xl font-extrabold text-primary" aria-label="بانویت، صفحه اصلی">
            بانویت
          </Link>
          <form action="/" role="search" className="relative flex-1 lg:max-w-xl">
            <label htmlFor="site-search" className="sr-only">
              جستجو در محصولات
            </label>
            <input
              id="site-search"
              name="s"
              type="search"
              placeholder="جستجو در بانویت…"
              className="h-10 w-full rounded-full border border-border bg-surface-muted ps-10 pe-4 text-sm text-text placeholder:text-text-subtle focus:border-primary focus:bg-surface focus:outline-none"
            />
            <input type="hidden" name="post_type" value="product" />
            <IconSearch size={18} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-text-subtle" />
          </form>
          <nav aria-label="حساب و سبد" className="flex items-center gap-1">
            <Link href="/my-account/" className="hidden size-10 items-center justify-center rounded-full text-text hover:bg-surface-muted lg:inline-flex" aria-label="حساب کاربری">
              <IconUser />
            </Link>
            <Link href="/cart/" className="inline-flex size-10 items-center justify-center rounded-full text-text hover:bg-surface-muted" aria-label="سبد خرید">
              <IconCart />
            </Link>
          </nav>
        </div>
        <nav aria-label="دسته‌بندی‌های اصلی" className="hidden border-t border-border lg:block">
          <ul className="mx-auto flex h-11 max-w-container items-center gap-6 px-4 text-sm text-text-muted">
            {siteConfig.mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="py-3 hover:text-primary">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}
