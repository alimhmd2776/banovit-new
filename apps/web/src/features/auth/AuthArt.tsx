import { cx } from '@banovit/ui';

/** Person in a dashed ring (designs/auth 02–06). Gray when idle, brand blue when active; spins while sending. */
export function AuthAvatar({ active, spinning, size = 64 }: { active?: boolean; spinning?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cx('transition-colors duration-slow', active ? 'text-primary' : 'text-text-subtle')}
    >
      <circle
        cx="32"
        cy="32"
        r="29"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeDasharray="15.2 7.6"
        className={cx('origin-center', spinning && 'motion-safe:animate-[spin_2.4s_linear_infinite]')}
      />
      <circle cx="32" cy="32" r="21" fill="currentColor" />
      <circle cx="32" cy="27" r="7.5" fill="var(--color-surface)" />
      <path d="M18.5 47.5a15 15 0 0 1 27 0A21 21 0 0 1 32 53a21 21 0 0 1-13.5-5.5z" fill="var(--color-surface)" />
    </svg>
  );
}

/**
 * «بانُ» app tile on the welcome step (designs/auth 07–08): the live WP site
 * icon (uploads/2026/08/cropped-Asset-1@3x-8.png), added by the menu thread
 * as public/brand/site-icon-192x192.png.
 */
export function BrandTile() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static brand file
    <img src="/brand/site-icon-192x192.png" alt="" width={64} height={64} className="size-16 rounded-lg shadow-md" />
  );
}
