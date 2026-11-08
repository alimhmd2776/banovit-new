'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx, IconBook, IconCart, IconGrid, IconHome, IconUser } from '@banovit/ui';

const items = [
  { name: 'خانه', href: '/', icon: IconHome, match: (p: string) => p === '/' },
  { name: 'فروشگاه', href: '/shop/', icon: IconGrid, match: (p: string) => p.startsWith('/shop') || p.startsWith('/brand') },
  { name: 'سبد خرید', href: '/cart/', icon: IconCart, match: (p: string) => p.startsWith('/cart') },
  { name: 'مقالات', href: '/blog/', icon: IconBook, match: (p: string) => p.startsWith('/blog') },
  { name: 'حساب من', href: '/my-account/', icon: IconUser, match: (p: string) => p.startsWith('/my-account') },
];

/** Mobile bottom navigation (hidden from lg). Shop tab is active on every catalog page, like the live site. */
export function BottomNav() {
  const pathname = usePathname() ?? '/';
  return (
    <nav
      aria-label="منوی پایین"
      className="fixed inset-x-0 bottom-0 z-sticky border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid h-bottom-nav grid-cols-5">
        {items.map(({ name, href, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'flex h-full flex-col items-center justify-center gap-1 text-[11px]',
                  active ? 'font-bold text-primary' : 'text-text-muted',
                )}
              >
                <Icon size={22} />
                {name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
