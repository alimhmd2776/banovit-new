import Image from 'next/image';
import Link from 'next/link';
import type { Category, Facet, ListingMeta } from '@banovit/api-client';
import { getListingSettings } from '@/lib/api';
import { ChangeFilterButton } from './ListingControls';
import type { ListingState } from './url-state';
import { faDigits } from '@banovit/ui';

/** Horizontal subcategory rail (scroll-snap on mobile, wraps into a row on desktop). */
export function SubcategoryCarousel({ items }: { items: Category['children'] }) {
  if (!items.length) return null;
  return (
    <nav aria-label="زیردسته‌ها" className="-mx-4 lg:mx-0">
      <ul className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scrollbar-none lg:flex-wrap lg:overflow-visible lg:px-0">
        {items.map((c) => (
          <li key={c.id} className="relative snap-start">
            <Link
              href={c.url}
              className="flex w-[88px] flex-col items-center gap-2 rounded-md p-1 text-center hover:bg-surface lg:w-[104px]"
            >
              <span className="relative flex size-[72px] items-center justify-center overflow-hidden rounded-full border border-border bg-surface lg:size-20">
                {c.image ? <Image src={c.image.url} alt={c.image.alt ?? ''} fill sizes="80px" className="object-cover" /> : null}
              </span>
              <span className="line-clamp-2 text-xs leading-5 text-text">{c.name}</span>
              <span className="sr-only">{faDigits(c.product_count)} کالا</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Brands present in this listing, linking to their /brand/{slug}/ pages (internal linking for SEO). */
export function BrandRow({ facet, title }: { facet: Facet | undefined; title: string }) {
  if (!facet || facet.options.length < 2) return null;
  const brands = [...facet.options].sort((a, b) => b.count - a.count).slice(0, 12);
  return (
    <section aria-labelledby="brands-title" className="space-y-3">
      <h2 id="brands-title" className="text-base font-bold text-text">
        {title}
      </h2>
      <ul className="relative -mx-4 grid auto-cols-[84px] grid-flow-col gap-3 overflow-x-auto px-4 pb-1 scrollbar-none lg:mx-0 lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-8 lg:px-0">
        {brands.map((b) => (
          <li key={b.value}>
            <Link href={`/brand/${encodeURIComponent(b.value).toLowerCase()}/`} className="group flex flex-col items-center gap-2 text-center">
              <span className="relative flex size-[72px] items-center justify-center overflow-hidden rounded-md border border-border bg-surface px-1 group-hover:border-primary">
                {b.image?.url ? (
                  <Image src={b.image.url} alt={b.label} fill sizes="72px" className="object-contain p-2" />
                ) : /^[a-z0-9-]+$/.test(b.value) ? (
                  <span className="line-clamp-2 text-[11px] font-extrabold uppercase leading-4 text-primary" dir="ltr">
                    {b.value.replace(/-/g, ' ')}
                  </span>
                ) : (
                  <span className="text-lg font-extrabold text-primary">{b.label.slice(0, 1)}</span>
                )}
              </span>
              <span className="line-clamp-1 text-xs font-bold text-text">{b.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Category SEO text. Full text is always in the HTML (indexable); it is
 * visually clamped with a CSS-only «بیشتر بخوانید» toggle.
 */
export function SeoDescription({ html, title }: { html: string | null | undefined; title: string }) {
  if (!html) return null;
  return (
    <section aria-labelledby="seo-title">
      <h2 id="seo-title" className="mb-3 text-base font-bold text-text">
        {title}
      </h2>
      <input type="checkbox" id="seo-more" className="peer sr-only" />
      <div
        className="relative max-h-32 overflow-hidden text-[13px] leading-7 text-text-muted after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-12 after:bg-gradient-to-t after:from-surface peer-checked:max-h-none peer-checked:after:hidden [&_a]:text-primary [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-text [&_h3]:mt-3 [&_h3]:font-bold [&_h3]:text-text [&_li]:ms-5 [&_li]:list-disc [&_p]:mb-3"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <label htmlFor="seo-more" className="mt-1 inline-block cursor-pointer text-[13px] font-bold text-primary underline underline-offset-4 peer-checked:hidden">
        بیشتر بخوانید
      </label>
    </section>
  );
}

export async function EmptyState({
  filtered,
  changeFilter,
}: {
  filtered: boolean;
  /** Listing data for the «تغییر فیلتر» button (opens the filter sheet / clears filters). */
  changeFilter?: { meta: ListingMeta; state: ListingState; basePath: string };
}) {
  // «صفحه فروشگاه و فوتر» › empty_state (filter result) / empty_category (no products at all)
  const settings = await getListingSettings();
  const texts = settings ? { filtered: settings.empty_state, category: settings.empty_category } : null;
  const t = filtered ? texts?.filtered : texts?.category;
  const image = filtered ? texts?.filtered.image : null;
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      {image?.url ? <Image src={image.url} alt={image.alt ?? ''} width={image.width ?? 160} height={image.height ?? 160} className="mb-4 h-auto max-w-40" /> : null}
      {t ? <h2 className="text-base font-bold text-text">{t.title}</h2> : null}
      {t?.text ? <p className="mt-2 max-w-sm text-xs leading-6 text-text-muted">{t.text}</p> : null}
      {filtered ? (
        changeFilter && texts ? <ChangeFilterButton {...changeFilter} label={texts.filtered.button} /> : null
      ) : texts ? (
        <Link href={texts.category.url} className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-6 text-sm font-bold text-primary-on hover:bg-primary-hover">
          {texts.category.button}
        </Link>
      ) : null}
    </div>
  );
}
