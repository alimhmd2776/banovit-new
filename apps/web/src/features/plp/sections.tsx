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
export function BrandRow({ facet, title }: { facet: Facet | undefined; title: string }) {
  if (!facet || facet.options.length < 2) return null;
  const brands = [...facet.options].sort((a, b) => b.count - a.count).slice(0, 12);
  return (
    <section aria-labelledby="brands-title" className="space-y-3">
      <h2 id="brands-title" className="text-base font-bold text-text">
        برندهای محصولات {title}
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

/** Box-with-magnifier illustration for the empty state (inline, token colors). */
function EmptyIllustration() {
  return (
    <svg width="132" height="112" viewBox="0 0 132 112" aria-hidden="true" className="mb-4">
      <ellipse cx="62" cy="102" rx="46" ry="6" fill="var(--color-surface-muted)" />
      <path d="M22 38l40-18 40 18-40 18z" fill="var(--brand-100)" />
      <path d="M22 38v40l40 18V56z" fill="var(--brand-200)" />
      <path d="M102 38v40L62 96V56z" fill="var(--brand-300)" />
      <path d="M22 38l-10 14 40 18 10-14z" fill="var(--brand-50)" stroke="var(--brand-200)" />
      <circle cx="96" cy="44" r="16" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="5" />
      <path d="M107 56l12 12" stroke="var(--color-primary)" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({ filtered, children }: { filtered: boolean; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <EmptyIllustration />
      <h2 className="text-base font-bold text-text">{filtered ? 'محصولی با این مشخصات پیدا نکردیم' : 'فعلاً محصولی در این دسته نیست'}</h2>
      <p className="mt-2 max-w-sm text-xs leading-6 text-text-muted">
        {filtered ? 'پیشنهاد می‌کنیم تغییراتی در فیلتر نمایش انجام دهید.' : 'به‌زودی محصولات این دسته اضافه می‌شوند. بقیه محصولات را در فروشگاه ببینید.'}
      </p>
      {filtered ? (
        children
      ) : (
        <Link href="/shop/" className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-6 text-sm font-bold text-primary-on hover:bg-primary-hover">
          رفتن به فروشگاه
        </Link>
      )}
    </div>
  );
}
