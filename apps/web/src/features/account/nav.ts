import type { ComponentType, SVGProps } from 'react';
import { IconBag, IconHeart, IconInfo, IconShield, IconStore, IconUser } from '@banovit/ui';
import { IconBell, IconComment, IconHeadset, IconHistory, IconPin } from './icons';

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: Icon;
  /** Pages under this prefix highlight the item. */
  match?: string;
}

/** «خرید و سفارش» */
export const shoppingNav: NavItem[] = [
  { key: 'orders', label: 'سفارش ها', href: '/my-account/orders/', icon: IconBag },
  { key: 'wishlist', label: 'علاقه‌مندی ها', href: '/my-account/wishlist/', icon: IconHeart },
  { key: 'views', label: 'بازدید های اخیر', href: '/my-account/recently-viewed/', icon: IconHistory },
  { key: 'reviews', label: 'دیدگاه های من', href: '/my-account/reviews/', icon: IconComment },
  { key: 'addresses', label: 'آدرس ها', href: '/my-account/addresses/', icon: IconPin },
  { key: 'profile', label: 'حساب کاربری', href: '/my-account/edit-account/', icon: IconUser },
];

/** «خدمات بانویت» */
export const servicesNav: NavItem[] = [
  { key: 'support', label: 'پشتیبانی', href: '/my-account/support/', icon: IconHeadset },
  { key: 'notifications', label: 'اعلانات', href: '/my-account/notifications/', icon: IconBell },
  { key: 'about', label: 'درباره بانویت', href: '/about-us/', icon: IconInfo },
  { key: 'terms', label: 'قوانین و شرایط', href: '/terms/', icon: IconShield },
  { key: 'seller', label: 'فروشنده بانویت شوید!', href: '/landing/b2b/', icon: IconStore },
];
