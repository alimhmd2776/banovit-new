import Link from 'next/link';
import type { MenuItem } from '@banovit/api-client';
import {
  cx,
  IconArticle,
  IconBook,
  IconChartPie,
  IconDots4,
  IconFlame,
  IconGrid,
  IconOrderSearch,
  IconPercent,
  IconPhone,
  IconUserSquare,
} from '@banovit/ui';
import { isExternal } from './menu-model';

/** Built-in icon names a CMS menu item may use instead of an image URL. */
const NAMED_ICONS = {
  discount: IconPercent,
  bestseller: IconChartPie,
  newest: IconBook,
  newest_flame: IconFlame,
  track: IconOrderSearch,
  phone: IconPhone,
  article: IconArticle,
  user: IconUserSquare,
  categories: IconDots4,
  grid: IconGrid,
} as const;

export function MenuIcon({ name, size = 20, className }: { name: string | null | undefined; size?: number; className?: string }) {
  if (!name) return null;
  if (/^https?:\/\//.test(name) || name.startsWith('/')) {
    // eslint-disable-next-line @next/next/no-img-element -- tiny CMS SVG icons, no optimization needed
    return <img src={name} alt="" width={size} height={size} className={cx('object-contain', className)} loading="lazy" />;
  }
  const Icon = NAMED_ICONS[name as keyof typeof NAMED_ICONS];
  return Icon ? <Icon size={size} className={className} /> : null;
}

/** Round category thumbnail: CMS image, else the category's live SVG icon, else an empty circle (no made-up assets). */
export function CategoryThumb({ item, size = 48, className }: { item: MenuItem; size?: number; className?: string }) {
  return (
    <span
      className={cx('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-muted text-text-subtle', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {item.image?.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- 48px thumbs from the CMS media host
        <img src={item.image.url} alt="" width={size} height={size} className="size-full object-cover mix-blend-multiply" loading="lazy" />
      ) : item.icon ? (
        <MenuIcon name={item.icon} size={Math.round(size * 0.5)} />
      ) : null /* no live image/icon: slot stays empty */}
    </span>
  );
}

/** next/link for site paths, a plain anchor for external URLs. */
export function MenuLink({
  href,
  className,
  children,
  onNavigate,
  ...rest
}: { href: string; className?: string; children: React.ReactNode; onNavigate?: () => void } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  if (isExternal(href)) {
    return (
      <a href={href} className={className} onClick={onNavigate} rel="noopener" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onNavigate} {...rest}>
      {children}
    </Link>
  );
}
