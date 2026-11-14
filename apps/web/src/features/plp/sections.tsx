import Image from 'next/image';
import Link from 'next/link';
import type { Category, Facet, ListingMeta } from '@banovit/api-client';
import { getListingSettings } from '@/lib/api';
import { ChangeFilterButton } from './ListingControls';
import { ScrollRail } from './ScrollRail';
import type { ListingState } from './url-state';
import { faDigits } from '@banovit/ui';
import { stripForeignClasses } from '@/lib/html/foreign-classes';

/** Subcategory rail: always one horizontal scroll row (mobile and desktop, Ali 2026-11-14). */
export function SubcategoryCarousel({ items, showCount = false }: { items: Category['children']; showCount?: boolean }) {
  if (!items.length) return null;
  return (
    <nav aria-label="زیردسته‌ها" className="-mx-4 lg:mx-0">
      <ScrollRail label="زیردسته‌ها" className="px-4 pb-1 lg:px-0">
        {items.map((c) => (
          <li key={c.id} className="relative shrink-0 snap-start">
            <Link
              href={c.url}
              className="flex w-[88px] flex-col items-center gap-2 rounded-md p-1 text-center hover:bg-surface lg:w-[104px]"
            >
              <span className="relative flex size-[72px] items-center justify-center overflow-hidden rounded-full border border-border bg-surface lg:size-20">
                {c.image ? <Image src={c.image.url} alt={c.image.alt ?? ''} fill sizes="80px" className="object-cover" /> : null}
              </span>
              <span className="line-clamp-2 text-xs leading-5 text-text">{c.name}</span>
              {showCount ? (
                <span className="text-[11px] text-text-muted">{faDigits(c.product_count)} محصول</span>
              ) : (
                <span className="sr-only">{faDigits(c.product_count)} کالا</span>
              )}
            </Link>
          </li>
        ))}
      </ScrollRail>
    </nav>
  );
}

/** Brands present in this listing, linking to their /brand/{slug}/ pages (internal linking for SEO). */
export function BrandRow({ facet, title }: { facet: Facet | undefined; title: string }) {
  if (!facet || facet.options.length < 2) return null;
  const brands = [...facet.options].sort((a, b) => b.count - a.count).slice(0, 12);
  return (
    <BrandLogos
      title={title}
      items={brands.map((b) => ({ key: b.value, slug: b.value, label: b.label, url: `/brand/${encodeURIComponent(b.value).toLowerCase()}/`, image: b.image ?? null }))}
    />
  );
}

export type BrandLogoItem = { key: string | number; slug: string; label: string; url: string; image: { url: string } | null };

/** Row of brand logo tiles (facet brands on category pages, panel-chosen «برندهای مرتبط» on tag pages). */
export function BrandLogos({ items, title, id = 'brands-title' }: { items: BrandLogoItem[]; title: string; id?: string }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-base font-bold text-text">
        {title}
      </h2>
      <ul className="relative -mx-4 grid auto-cols-[84px] grid-flow-col gap-3 overflow-x-auto px-4 pb-1 scrollbar-none lg:mx-0 lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-8 lg:px-0">
        {items.map((b) => (
          <li key={b.key}>
            <Link href={b.url} className="group flex flex-col items-center gap-2 text-center">
              <span className="relative flex size-[72px] items-center justify-center overflow-hidden rounded-md border border-border bg-surface px-1 group-hover:border-primary">
                {b.image?.url ? (
                  <Image src={b.image.url} alt={b.label} fill sizes="72px" className="object-contain p-2" />
                ) : /^[a-z0-9-]+$/.test(b.slug) ? (
                  <span className="line-clamp-2 text-[11px] font-extrabold uppercase leading-4 text-primary" dir="ltr">
                    {b.slug.replace(/-/g, ' ')}
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

/** «دسته‌بندی‌های مرتبط با …» of a tag page: the same circle rail as subcategories, with a heading and item counts. */
export function RelatedCategories({ items, title }: { items: Category['children']; title: string }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="related-cats-title" className="space-y-3">
      <h2 id="related-cats-title" className="text-base font-bold text-text">
        {title}
      </h2>
      <SubcategoryCarousel items={items} showCount />
    </section>
  );
}

/**
 * Category SEO text. Full text is always in the HTML (indexable); it is
 * visually clamped with a CSS-only «بیشتر بخوانید» toggle.
 */
export function SeoDescription({ html, title, collapsedOnly = false }: { html: string | null | undefined; title: string; collapsedOnly?: boolean }) {
  if (!html) return null;
  const id = collapsedOnly ? 'intro-more' : 'seo-more';
  return (
    <section aria-labelledby={collapsedOnly ? undefined : 'seo-title'} aria-label={collapsedOnly ? `معرفی ${title}` : undefined}>
      {collapsedOnly ? null : (
        <h2 id="seo-title" className="mb-3 text-base font-bold text-text">
          {title}
        </h2>
      )}
      <input type="checkbox" id={id} className="peer sr-only" />
      <div
        className="relative max-h-32 overflow-hidden text-[13px] leading-7 text-text-muted after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-12 after:bg-gradient-to-t after:from-surface peer-checked:max-h-none peer-checked:after:hidden [&_a]:text-primary [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-text [&_h3]:mt-3 [&_h3]:font-bold [&_h3]:text-text [&_li]:ms-5 [&_li]:list-disc [&_p]:mb-3"
        dangerouslySetInnerHTML={{ __html: stripForeignClasses(html) }}
      />
      <label htmlFor={id} className="mt-1 inline-block cursor-pointer text-[13px] font-bold text-primary underline underline-offset-4 peer-checked:hidden">
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
