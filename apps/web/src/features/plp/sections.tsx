import Image from 'next/image';
import Link from 'next/link';
import type { Category, Facet } from '@banovit/api-client';
import { faDigits, IconBox } from '@banovit/ui';

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
                {c.image ? (
                  <Image src={c.image.url} alt="" fill sizes="80px" className="object-contain p-2" />
                ) : (
                  <IconBox size={28} className="text-text-subtle" />
                )}
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
export function BrandRow({ facet }: { facet: Facet | undefined }) {
  if (!facet || facet.options.length < 2) return null;
  const brands = [...facet.options].sort((a, b) => b.count - a.count).slice(0, 12);
  return (
    <section aria-labelledby="brands-title" className="space-y-3">
      <h2 id="brands-title" className="text-base font-bold text-text">
        برندهای این دسته
      </h2>
      <ul className="relative -mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none lg:mx-0 lg:flex-wrap lg:px-0">
        {brands.map((b) => (
          <li key={b.value}>
            <Link
              href={`/brand/${encodeURIComponent(b.value).toLowerCase()}/`}
              className="flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-sm border border-border bg-surface px-4 text-sm text-text hover:border-primary hover:text-primary"
            >
              {b.label}
              <span className="text-xs text-text-subtle">{faDigits(b.count)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Category SEO text. Full text is always in the HTML (indexable); on mobile it
 * is visually clamped with a CSS-only «ادامه مطلب» toggle.
 */
export function SeoDescription({ html, title }: { html: string | null | undefined; title: string }) {
  if (!html) return null;
  return (
    <section aria-labelledby="seo-title" className="rounded-md border border-border bg-surface p-4 lg:p-6">
      <h2 id="seo-title" className="mb-3 text-base font-bold text-text">
        {title}
      </h2>
      <input type="checkbox" id="seo-more" className="peer sr-only" />
      <div
        className="relative max-h-48 overflow-hidden text-sm leading-8 text-text-muted peer-checked:max-h-none lg:max-h-none [&_a]:text-primary [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-text [&_h3]:mt-3 [&_h3]:font-bold [&_h3]:text-text [&_li]:ms-5 [&_li]:list-disc [&_p]:mb-3"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <label htmlFor="seo-more" className="mt-2 inline-block cursor-pointer text-sm font-medium text-primary peer-checked:hidden lg:hidden">
        ادامه مطلب
      </label>
    </section>
  );
}

export function EmptyState({ filtered, clearHref }: { filtered: boolean; clearHref: string }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-border-strong bg-surface px-6 py-12 text-center">
      <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-surface-muted text-text-subtle">
        <IconBox size={32} />
      </span>
      <h2 className="text-base font-bold text-text">{filtered ? 'کالایی با این فیلترها پیدا نشد' : 'فعلاً کالایی در این دسته نیست'}</h2>
      <p className="mt-2 max-w-sm text-sm leading-7 text-text-muted">
        {filtered ? 'چند فیلتر را بردارید یا محدوده قیمت را بازتر کنید.' : 'به‌زودی کالاهای این دسته اضافه می‌شوند. می‌توانید بقیه محصولات را ببینید.'}
      </p>
      <Link
        href={filtered ? clearHref : '/shop/'}
        className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-medium text-primary-on hover:bg-primary-hover"
      >
        {filtered ? 'حذف همه فیلترها' : 'رفتن به فروشگاه'}
      </Link>
    </div>
  );
}
