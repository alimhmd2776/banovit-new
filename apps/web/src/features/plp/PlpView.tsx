import Image from 'next/image';
import type { Category, Faq, Image as ImageData, ProductListing } from '@banovit/api-client';
import { Accordion, Breadcrumb, Pagination, ProductCard, faDigits } from '@banovit/ui';
import { jsonLdScript, listingJsonLd, type Crumb } from '@/lib/seo';
import { getListingSettings } from '@/lib/api';
import { FilterSidebar, ListingToolbar } from './ListingControls';
import { BrandRow, EmptyState, SeoDescription, SubcategoryCarousel } from './sections';
import { SupportCallout } from './SupportCalloutBox';
import { hasActiveFilters, pagePath, toQueryString, type ListingState } from './url-state';

export type PlpViewProps = {
  title: string;
  crumbs: Crumb[];
  canonicalPath: string;
  basePath: string;
  banner?: ImageData | null;
  subcategories?: Category['children'];
  listing: ProductListing;
  state: ListingState;
  page: number;
  descriptionHtml?: string | null;
  faqs: Faq[];
  showBrandRow?: boolean;
};

/**
 * Product listing page body, shared by category, brand and shop routes.
 * Mobile-first: banner, title, breadcrumb, subcategories, sticky toolbar,
 * 2-col grid. From lg: sidebar filters + 3/4-col grid. Content is identical in
 * both layouts (SEO); only arrangement changes.
 */
export async function PlpView({
  title,
  crumbs,
  canonicalPath,
  basePath,
  banner,
  subcategories = [],
  listing,
  state,
  page,
  descriptionHtml,
  faqs,
  showBrandRow = true,
}: PlpViewProps) {
  const { meta } = listing;
  const filtered = hasActiveFilters(state);
  const query = toQueryString(state);
  const brandFacet = meta.facets.find((f) => f.key === 'brand');
  const settings = await getListingSettings();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          listingJsonLd({ name: title, url: canonicalPath, crumbs, products: listing.data, faqs }),
        )}
      />

      <div className="mx-auto max-w-container space-y-4 px-4 pt-3 lg:space-y-6 lg:pt-6">
        {banner ? (
          <div className="relative aspect-[3/1] overflow-hidden rounded-md bg-surface-muted lg:aspect-[6/1]">
            <Image src={banner.url} alt={banner.alt ?? title} fill priority sizes="(min-width: 1280px) 1248px, 100vw" className="object-cover" />
          </div>
        ) : null}

        <header className="space-y-3">
          <h1 className="text-lg font-bold text-text lg:text-2xl">
            {title}
            {page > 1 ? <span className="ms-2 text-sm font-normal text-text-muted">صفحه {faDigits(page)}</span> : null}
          </h1>
          <Breadcrumb items={crumbs} />
        </header>

        <SubcategoryCarousel items={subcategories} />

        <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-6">
          <FilterSidebar key={query} meta={meta} state={state} basePath={basePath} />

          <section aria-label="فهرست کالاها" className="space-y-4">
            <div className="sticky top-header z-10 -mx-4 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              <ListingToolbar key={query} meta={meta} state={state} basePath={basePath} />
            </div>

            {listing.data.length ? (
              <ul className="divide-y divide-border lg:grid lg:grid-cols-3 lg:gap-3 lg:divide-y-0 xl:grid-cols-4">
                {listing.data.map((p, i) => (
                  <li key={p.id}>
                    <ProductCard product={p} priority={!banner && i < 2} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState filtered={filtered} changeFilter={{ meta, state, basePath }} />
            )}

            <Pagination
              current={page}
              last={meta.last_page}
              hrefFor={(p) => `${pagePath(basePath, p)}${query}`}
              className="pt-2"
            />
          </section>
        </div>

        {showBrandRow && settings ? <BrandRow facet={brandFacet} title={settings.brands_row_title.replace('%%term_title%%', title)} /> : null}

        <SeoDescription html={descriptionHtml} title={title} />

        {faqs.length ? (
          <section aria-labelledby="faq-title" className="space-y-3">
            <h2 id="faq-title" className="text-base font-bold text-text">
              سوالات متداول
            </h2>
            <Accordion variant="cards" items={faqs.map((f) => ({ id: f.id, title: f.question, html: f.answer_html }))} />
          </section>
        ) : null}

        <SupportCallout pageTitle={title} />
      </div>
    </>
  );
}
