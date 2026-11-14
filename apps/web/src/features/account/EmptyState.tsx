'use client';

import Link from 'next/link';
import { cx } from '@banovit/ui';
import { useAccountSettings } from './settings';

type Art = 'orders' | 'wishlist' | 'sellers' | 'views' | 'reviews' | 'addresses' | 'notifications' | 'tickets' | 'search' | 'success';

/**
 * Empty states from the designs (illustration, title, text, optional CTA).
 * Title, text and image are editable in the panel («تنظیمات حساب کاربری سایت»
 * → صفحات خالی); the props are the page's own wording when the panel leaves
 * one empty. Media rule (docs/05-conventions.md): images are original files
 * only, never re-drawn, so with no image set the slot stays empty (same size,
 * so the layout does not jump).
 */
export function EmptyState({
  art,
  title,
  text,
  action,
  className,
  children,
}: {
  art: Art;
  title: string;
  text?: string;
  action?: { label: string; href: string };
  className?: string;
  children?: React.ReactNode;
}) {
  const cms = useAccountSettings()?.empty_states?.[art];
  const src = cms?.image_url ?? null;
  title = cms?.title || title;
  text = cms?.text || text;
  return (
    <div className={cx('flex flex-col items-center px-4 py-12 text-center', className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={150} height={130} className="h-[130px] w-[150px] object-contain" />
      ) : (
        <div className="h-[130px] w-[150px]" data-missing-art={art} aria-hidden="true" />
      )}
      <h2 className="mt-6 text-base font-extrabold text-text">{title}</h2>
      {text ? <p className="mt-2 max-w-sm text-xs leading-6 text-text-muted">{text}</p> : null}
      {action ? (
        <Link href={action.href} className="mt-5 inline-flex h-10 items-center rounded-sm bg-primary px-5 text-sm font-bold text-primary-on hover:bg-primary-hover">
          {action.label}
        </Link>
      ) : null}
      {children}
    </div>
  );
}
