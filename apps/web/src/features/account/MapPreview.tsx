'use client';

import { cx } from '@banovit/ui';
import { tilesAround } from './map';
import { useMapConfig } from './settings';

/** Static one-tile map with a pin (address card / form header). Decorative; the address text is the content. */
export function MapPreview({ lat, lng, className, children }: { lat: number; lng: number; className?: string; children?: React.ReactNode }) {
  const { tile_url } = useMapConfig();
  return (
    <div className={cx('relative overflow-hidden rounded-md bg-surface-muted', className)} dir="ltr">
      {tilesAround(tile_url, lat, lng).map((t) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={t.url} src={t.url} alt="" aria-hidden="true" loading="lazy" className="absolute size-[256px] max-w-none" style={{ left: `calc(50% + ${t.dx}px)`, top: `calc(50% + ${t.dy}px)` }} />
      ))}
      <Pin />
      {children}
    </div>
  );
}

export function Pin({ className }: { className?: string }) {
  return (
    <svg width="40" height="52" viewBox="0 0 40 52" aria-hidden="true" className={cx('absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full drop-shadow-md', className)}>
      <path d="M20 1C9.5 1 1 9.3 1 19.6 1 33 20 51 20 51s19-18 19-31.4C39 9.3 30.5 1 20 1z" fill="var(--color-primary)" stroke="#fff" strokeWidth="2" />
      <circle cx="20" cy="19" r="7" fill="#fff" />
    </svg>
  );
}
