import Image from 'next/image';
import Link from 'next/link';
import type { ProductCard as ProductCardData } from '@banovit/api-client';
import { IconTool } from './icons';
import { cx, faDigits } from './lib/format';
import { Price } from './Price';
import { Rating } from './Rating';

/** Swatch for colors without a known hex (e.g. «سفید - طلایی»). */
const MULTI_COLOR = 'var(--swatch-unknown)';

/**
 * Listing card. One DOM for both layouts (same content for SEO):
 * - mobile: full-width row, image at the start, details beside it, rows
 *   separated by dividers (the list owns the dividers);
 * - lg+: classic grid card.
 * Server component; the whole card is one link (single tab stop).
 */
export function ProductCard({
  product,
  priority = false,
  sizes = '(min-width: 1280px) 240px, (min-width: 1024px) 22vw, 38vw',
}: {
  product: ProductCardData;
  priority?: boolean;
  sizes?: string;
}) {
  const unavailable = !product.in_stock;

  return (
    <article className="group relative h-full py-4 lg:overflow-hidden lg:rounded-md lg:border lg:border-border lg:bg-surface lg:py-0 lg:transition-shadow lg:duration-150 lg:hover:shadow-md">
      <Link href={product.path} className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
        {product.badges.amazing_discount ? (
          <p className="mb-3 text-[13px] font-extrabold text-deal lg:absolute lg:start-3 lg:top-2 lg:z-[1] lg:mb-0 lg:rounded-xs lg:bg-surface/90 lg:px-1.5">
            تخفیف شگفت‌انگیز
          </p>
        ) : null}

        <div className="flex gap-4 lg:h-full lg:flex-col lg:gap-0">
          {/* media column */}
          <div className="flex w-[30%] shrink-0 flex-col items-center gap-3 lg:w-full">
            <div className="relative aspect-square w-full overflow-hidden bg-surface">
              {product.image ? (
                <Image
                  src={product.image.url}
                  alt={product.image.alt ?? product.name}
                  fill
                  sizes={sizes}
                  priority={priority}
                  className={cx('object-contain lg:p-2', unavailable && 'opacity-50 grayscale')}
                />
              ) : null}
            </div>
            {product.colors.length > 0 ? (
              <span className="flex items-center gap-1 lg:hidden" aria-hidden="true">
                <ColorDots product={product} />
              </span>
            ) : null}
          </div>

          {/* details column */}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5 lg:p-3">
            <h3 className="line-clamp-2 text-sm font-bold leading-6 text-text lg:min-h-12 lg:text-[13px] lg:font-medium">{product.name}</h3>

            {product.colors.length > 0 ? (
              <span className="hidden items-center gap-1 lg:flex" aria-label={`رنگ‌ها: ${product.colors.map((c) => c.name).join('، ')}`}>
                <ColorDots product={product} />
              </span>
            ) : null}

            {product.sizes ? (
              <ul className="flex flex-wrap gap-1" aria-label={product.sizes.label}>
                {product.sizes.values.map((v) => (
                  <li key={v} className="rounded-xs bg-surface-muted px-2 text-[11px] leading-6 text-text-muted">
                    {v}
                  </li>
                ))}
                {product.sizes.more > 0 ? <li className="px-1 text-[11px] leading-6 text-text-subtle">+{faDigits(product.sizes.more)}</li> : null}
              </ul>
            ) : null}

            {product.badges.install_service || product.rating ? (
              <div className="flex items-center justify-between gap-2">
                {product.badges.install_service ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                    <IconTool size={14} />
                    امکان افزودن خدمات نصب
                  </span>
                ) : (
                  <span />
                )}
                {product.rating ? <Rating average={product.rating.average} count={product.rating.count} /> : null}
              </div>
            ) : null}

            <div className="mt-auto">
              {unavailable ? (
                <p className="text-end text-sm font-medium text-text-subtle">ناموجود</p>
              ) : (
                <Price price={product.price} priceMax={product.price_max} regular={product.regular_price} discountPercent={product.discount_percent} />
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function ColorDots({ product }: { product: ProductCardData }) {
  return (
    <>
      {product.colors.map((c) => (
        <span
          key={c.slug}
          title={c.name}
          className="size-2.5 rounded-full ring-1 ring-border"
          style={c.hex ? { backgroundColor: c.hex } : { backgroundImage: MULTI_COLOR }}
        />
      ))}
      {product.colors_more > 0 ? <span className="text-[10px] text-text-muted">+{faDigits(product.colors_more)}</span> : null}
    </>
  );
}
