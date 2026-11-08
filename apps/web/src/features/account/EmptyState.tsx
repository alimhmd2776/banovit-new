import Link from 'next/link';
import { cx } from '@banovit/ui';

type Art = 'orders' | 'wishlist' | 'views' | 'reviews' | 'addresses' | 'notifications' | 'tickets' | 'search' | 'success';

/**
 * Empty states from the designs (illustration, title, text, optional CTA).
 * Media rule (docs/05-conventions.md): illustrations must be original files,
 * never re-drawn. The 3D illustrations of designs 08/10/12/19/22/26/34/36/38
 * are not in the live WP uploads yet, so the slot stays empty (same size, so
 * the layout does not jump) until the files exist; then map `art` to the
 * upload URL in ART_SRC.
 */
const ART_SRC: Partial<Record<Art, string>> = {};
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
  return (
    <div className={cx('flex flex-col items-center px-4 py-12 text-center', className)}>
      {ART_SRC[art] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ART_SRC[art]} alt="" width={150} height={130} className="h-[130px] w-[150px] object-contain" />
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
