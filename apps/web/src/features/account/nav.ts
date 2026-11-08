import type { ComponentType, SVGProps } from 'react';
import type { AccountSettings } from '@banovit/api-client';
import { IconBag, IconHeart, IconInfo, IconShield, IconStore, IconUser } from '@banovit/ui';
import { IconBell, IconComment, IconHeadset, IconHistory, IconPin } from './icons';

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: Icon;
}

const ICONS: Record<string, Icon> = {
  orders: IconBag,
  wishlist: IconHeart,
  views: IconHistory,
  reviews: IconComment,
  addresses: IconPin,
  profile: IconUser,
  support: IconHeadset,
  notifications: IconBell,
  about: IconInfo,
  terms: IconShield,
  seller: IconStore,
};

type Menu = AccountSettings['menu'];

/** Used only when the CMS settings can't be read; the panel («تنظیمات حساب کاربری سایت» → منو) is the source. */
const FALLBACK: Menu = [
  { key: 'orders', group: 'shopping', label: 'سفارش ها', href: '/my-account/orders/', enabled: true },
  { key: 'wishlist', group: 'shopping', label: 'علاقه‌مندی ها', href: '/my-account/wishlist/', enabled: true },
  { key: 'views', group: 'shopping', label: 'بازدید های اخیر', href: '/my-account/recently-viewed/', enabled: true },
  { key: 'reviews', group: 'shopping', label: 'دیدگاه های من', href: '/my-account/reviews/', enabled: true },
  { key: 'addresses', group: 'shopping', label: 'آدرس ها', href: '/my-account/addresses/', enabled: true },
  { key: 'profile', group: 'shopping', label: 'حساب کاربری', href: '/my-account/edit-account/', enabled: true },
  { key: 'support', group: 'services', label: 'پشتیبانی', href: '/my-account/support/', enabled: true },
  { key: 'notifications', group: 'services', label: 'اعلانات', href: '/my-account/notifications/', enabled: true },
];

/** «خرید و سفارش» and «خدمات بانویت» menus, in panel order, enabled items only. */
export function buildNav(menu: Menu | null | undefined): { shopping: NavItem[]; services: NavItem[] } {
  const rows = menu?.length ? menu : FALLBACK;
  const out = { shopping: [] as NavItem[], services: [] as NavItem[] };
  for (const m of rows) {
    if (!m.enabled || !m.href) continue;
    (m.group === 'services' ? out.services : out.shopping).push({ key: m.key, label: m.label, href: m.href, icon: ICONS[m.key] ?? IconInfo });
  }
  return out;
}
