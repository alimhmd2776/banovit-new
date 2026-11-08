'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx, IconCart, IconGrid, IconHome, IconUser } from '@banovit/ui';
import { CartBadge } from '@/features/cart/CartBadge';

const IconArticles = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);

const items = [
  { name: 'خانه', href: '/', icon: IconHome, match: (p: string) => p === '/' },
  { name: 'دسته‌کالا', href: '/shop/', icon: IconGrid, match: (p: string) => p.startsWith('/shop') || p.startsWith('/brand') },
  { name: 'سبد من', href: '/cart/', icon: IconCart, match: (p: string) => p.startsWith('/cart') },
  { name: 'مقالات', href: '/blog/', icon: IconArticles, match: (p: string) => p.startsWith('/blog') },
  { name: 'پروفایل', href: '/my-account/', icon: IconUser, match: (p: string) => p.startsWith('/my-account') },
];

/** Floating rounded mobile bottom navigation (hidden from lg). Catalog pages activate «دسته‌کالا», like the live site. */
export function BottomNav() {
  const pathname = usePathname() ?? '/';
  // Checkout steps have their own sticky action bar (focus on finishing the order).
  if (pathname.startsWith('/checkout')) return null;
  return (
    <nav aria-label="منوی پایین" className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-sticky lg:hidden">
      <ul className="grid h-bottom-nav grid-cols-5 rounded-lg border border-border bg-surface shadow-lg">
        {items.map(({ name, href, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cx('flex h-full flex-col items-center justify-center gap-1 text-[11px]', active ? 'font-bold text-primary' : 'text-text-muted')}
              >
                <span className="relative">
                  <Icon size={22} />
                  {href === '/cart/' ? <CartBadge className="-end-2" /> : null}
                </span>
                {name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
