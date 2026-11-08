import Image from 'next/image';
import type { Seller } from '@banovit/api-client';
import { faDigits, IconStar, IconStore, IconTrend } from '@banovit/ui';
import { BackButton, SellerActions } from './SellerActions';

/** «+۸۹ هزار» for 89 412, plain digits under a thousand. */
export function compactCount(n: number): string {
  if (n >= 1_000_000) return `+${faDigits(Math.floor(n / 1_000_000))} میلیون`;
  if (n >= 1_000) return `+${faDigits(Math.floor(n / 1_000))} هزار`;
  return faDigits(n);
}

function Logo({ seller, className }: { seller: Seller; className: string }) {
  if (seller.logo) {
    return (
      <span className={`relative block overflow-hidden rounded-lg bg-surface-muted ${className}`}>
        <Image src={seller.logo.url} alt={seller.logo.alt ?? seller.name} fill priority sizes="112px" className="object-cover" />
      </span>
    );
  }
  // No logo uploaded: Banovit's mark for the house seller, otherwise the first letter.
  return (
    <span aria-hidden="true" className={`flex items-center justify-center rounded-lg bg-primary font-extrabold text-primary-on ${className}`}>
      <span className="text-3xl">{seller.is_house ? 'بانُ' : seller.name.replace(/^فروشگاه\s+/, '').slice(0, 1)}</span>
    </span>
  );
}

function Stats({ seller }: { seller: Seller }) {
  const { rating, years_on_banovit: years, sales_count: sales } = seller.stats;
  const items = [
    rating ? { key: 'rating', icon: <IconStar size={18} className="text-rating" />, value: faDigits(rating.average), label: 'امتیاز' } : null,
    years != null ? { key: 'years', icon: <IconStore size={18} className="text-primary" />, value: `${faDigits(Math.max(years, 1))}+ سال`, label: 'در بانویت' } : null,
    sales > 0 ? { key: 'sales', icon: <IconTrend size={18} className="text-primary" />, value: compactCount(sales), label: 'فروش' } : null,
  ].filter((x) => x !== null);
  if (!items.length) return null;

  return (
    <dl className="flex items-center justify-around gap-2 rounded-md border border-border bg-surface px-3 py-3 lg:justify-start lg:gap-8 lg:border-0 lg:bg-transparent lg:p-0">
      {items.map((it) => (
        <div key={it.key} className="flex items-center gap-1.5 text-sm">
          {it.icon}
          <dt className="sr-only">{it.label}</dt>
          <dd className="flex items-center gap-1">
            <span className="font-bold text-text">{it.value}</span>
            <span className="text-text-muted">{it.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Mobile: app bar (back, name + «پروفایل فروشگاه», share, favorite) and a
 * centered hero. Desktop: one horizontal card (logo, name, tagline, stats, actions).
 */
export function SellerHeader({ seller }: { seller: Seller }) {
  return (
    <>
      <div className="flex items-center gap-3 lg:hidden">
        <BackButton />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-text">{seller.name}</p>
          <p className="text-xs text-text-muted">پروفایل فروشگاه</p>
        </div>
        <SellerActions slug={seller.slug} name={seller.name} url={seller.url} />
      </div>

      <header className="mt-5 flex flex-col items-center gap-3 text-center lg:mt-0 lg:flex-row lg:items-center lg:gap-6 lg:rounded-lg lg:border lg:border-border lg:bg-surface lg:p-6 lg:text-start">
        <Logo seller={seller} className="size-24 lg:size-28" />
        <div className="w-full min-w-0 space-y-2 lg:flex-1 lg:space-y-3">
          <h1 className="text-xl font-extrabold text-text lg:text-2xl">{seller.name}</h1>
          {seller.tagline ? <p className="text-sm text-text-muted">{seller.tagline}</p> : null}
          <div className="pt-2 lg:pt-0">
            <Stats seller={seller} />
          </div>
        </div>
        <div className="hidden self-start lg:block">
          <SellerActions slug={seller.slug} name={seller.name} url={seller.url} />
        </div>
      </header>
    </>
  );
}
