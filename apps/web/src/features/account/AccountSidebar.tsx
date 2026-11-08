'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx, faDigits } from '@banovit/ui';
import { LogoutButton } from './LogoutButton';
import { servicesNav, shoppingNav, type NavItem } from './nav';
import { phoneDisplay } from './format';

/** Desktop account menu (lg+). On phones the dashboard page itself is the menu. */
export function AccountSidebar({ name, phone, unread }: { name: string; phone: string | null; unread: number }) {
  const path = usePathname() ?? '';
  const item = (n: NavItem) => {
    const on = path.startsWith(n.href) && n.href.startsWith('/my-account/');
    return (
      <li key={n.key}>
        <Link href={n.href} aria-current={on ? 'page' : undefined} className={cx('flex h-11 items-center gap-3 rounded-sm px-3 text-sm', on ? 'bg-primary-subtle font-bold text-primary-on-subtle' : 'text-text hover:bg-surface-muted')}>
          <n.icon size={20} />
          <span className="flex-1">{n.label}</span>
          {n.key === 'notifications' && unread > 0 ? <span className="rounded-full bg-danger px-1.5 text-[11px] leading-5 text-primary-on">{faDigits(unread)}</span> : null}
        </Link>
      </li>
    );
  };
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[calc(var(--header-height)+3.5rem)] rounded-lg border border-border bg-surface p-3">
        <Link href="/my-account/" className={cx('mb-2 block rounded-sm px-3 py-3', path === '/my-account/' ? 'bg-surface-muted' : 'hover:bg-surface-muted')}>
          <span className="block font-extrabold text-text">{name || 'کاربر بانویت'}</span>
          <span className="mt-1 block text-xs text-text-muted" dir="ltr">{phoneDisplay(phone)}</span>
        </Link>
        <p className="px-3 pb-1 pt-2 text-xs text-text-subtle">خرید و سفارش</p>
        <ul>{shoppingNav.map(item)}</ul>
        <p className="px-3 pb-1 pt-4 text-xs text-text-subtle">خدمات بانویت</p>
        <ul>{servicesNav.slice(0, 2).map(item)}</ul>
        <div className="mt-2 border-t border-border pt-2">
          <LogoutButton className="flex h-11 w-full items-center gap-3 rounded-sm px-3 text-sm text-danger hover:bg-danger-subtle" />
        </div>
      </div>
    </aside>
  );
}
