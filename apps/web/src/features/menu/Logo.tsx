import Link from 'next/link';

/**
 * Site logo: the original file from the live WordPress header (Elementor
 * header #39890, uploads/2026/07/Frame-1077.svg, 185px wide on desktop),
 * copied to public/brand/logo.svg. Site icon (uploads/2026/08/cropped-Asset-1@3x-8.png
 * and its WP sizes) is in public/brand/site-icon*.png.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" aria-label="بانویت، صفحه اصلی" className="inline-flex shrink-0 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimization needed */}
      <img
        src="/brand/logo.svg"
        alt="بانویت"
        width={131}
        height={40}
        className={compact ? 'h-9 w-auto' : 'h-8 w-auto lg:h-auto lg:w-[185px]'}
        fetchPriority="high"
      />
    </Link>
  );
}
