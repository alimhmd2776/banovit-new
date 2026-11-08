import Link from 'next/link';

export interface LogoAsset {
  image: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Header logo from «تنظیمات هدر» in the CMS. Fallback (CMS unreachable): the
 * live WordPress header file (uploads/2026/07/Frame-1077.svg) in public/brand.
 */
export const FALLBACK_LOGO: LogoAsset = { image: '/brand/logo.svg', alt: 'بانویت', width: 131, height: 40 };

export function Logo({ logo = FALLBACK_LOGO, compact = false }: { logo?: LogoAsset; compact?: boolean }) {
  return (
    <Link href="/" aria-label={`${logo.alt}، صفحه اصلی`} className="inline-flex shrink-0 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo from the media library */}
      <img
        src={logo.image}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className={compact ? 'h-9 w-auto' : 'h-8 w-auto lg:h-auto lg:w-[185px]'}
        fetchPriority="high"
      />
    </Link>
  );
}
