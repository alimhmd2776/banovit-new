import type { ProductListing, Seller, SellerReviewList } from '@banovit/api-client';
import { Breadcrumb, Pagination, ProductCard } from '@banovit/ui';
import { FilterSidebar, ListingToolbar } from '@/features/plp/ListingControls';
import { EmptyState } from '@/features/plp/sections';
import { clearFilters, hasActiveFilters, pagePath, toQueryString, type ListingState } from '@/features/plp/url-state';
import { jsonLdScript, sellerJsonLd, type Crumb } from '@/lib/seo';
import { ReviewCard, ReviewsEmpty } from './ReviewCard';
import { SellerDetails } from './SellerDetails';
import { SellerHeader } from './SellerHeader';
import { SellerTabs } from './SellerTabs';

export type SellerViewProps = {
  seller: Seller;
  crumbs: Crumb[];
  listing: ProductListing;
  reviews: SellerReviewList;
  state: ListingState;
  page: number;
};

/**
 * /seller/{slug}/ (designs/sellers). Mobile-first: app bar + centered hero,
 * then tabs محصولات / نظرات کاربران / جزئیات فروشگاه. Desktop: horizontal
 * profile card, same tabs, products in the PLP grid. Same content in both.
 */
export function SellerView({ seller, crumbs, listing, reviews, state, page }: SellerViewProps) {
  const basePath = seller.url;
  const query = toQueryString(state);

  const products = (
    <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-6">
      <FilterSidebar key={query} meta={listing.meta} state={state} basePath={basePath} />
      <div className="space-y-4">
        <div className="sticky top-header z-10 -mx-4 bg-bg/95 px-4 py-2 backdrop-blur lg:static lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <ListingToolbar key={query} meta={listing.meta} state={state} basePath={basePath} />
        </div>
        {listing.data.length ? (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4">
            {listing.data.map((p, i) => (
              <li key={p.id}>
                <ProductCard product={p} priority={i < 2} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState filtered={hasActiveFilters(state)} clearHref={`${basePath}${toQueryString(clearFilters(state))}`} />
        )}
        <Pagination current={page} last={listing.meta.last_page} hrefFor={(p) => `${pagePath(basePath, p)}${query}`} className="pt-2" />
      </div>
    </div>
  );

  const reviewsPanel = reviews.data.length ? (
    <ul className="grid gap-3 md:grid-cols-2">
      {reviews.data.map((r) => (
        <li key={r.id}>
          <ReviewCard review={r} />
        </li>
      ))}
    </ul>
  ) : (
    <ReviewsEmpty sellerName={seller.name} />
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(sellerJsonLd({ seller, crumbs, products: listing.data }))} />
      <div className="mx-auto max-w-container space-y-4 px-4 pt-3 lg:space-y-6 lg:pt-6">
        <div className="hidden lg:block">
          <Breadcrumb items={crumbs} />
        </div>
        <SellerHeader seller={seller} />
        <SellerTabs panels={{ products, reviews: reviewsPanel, details: <SellerDetails seller={seller} /> }} />
      </div>
    </>
  );
}
