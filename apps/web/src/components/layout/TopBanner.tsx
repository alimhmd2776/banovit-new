import Image from 'next/image';
import Link from 'next/link';
import { getListingSettings } from '@/lib/api';

/** Promo bar above the header; text, link and optional image from the CMS («صفحه فروشگاه و فوتر»). */
export async function TopBanner() {
  const banner = (await getListingSettings())?.top_banner;
  if (!banner?.enabled || (!banner.text && !banner.image?.url)) return null;

  const body = banner.image?.url ? (
    <Image
      src={banner.image.url}
      alt={banner.image.alt ?? banner.text ?? ''}
      width={banner.image.width ?? 1440}
      height={banner.image.height ?? 48}
      priority
      sizes="100vw"
      className="h-12 w-full object-cover lg:h-10"
    />
  ) : (
    banner.text
  );
  const className = banner.image?.url
    ? 'block bg-primary'
    : 'flex h-12 items-center justify-center bg-primary px-4 text-center text-lg font-extrabold text-primary-on hover:bg-primary-hover lg:h-10 lg:text-sm';

  return banner.url ? (
    <Link href={banner.url} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
