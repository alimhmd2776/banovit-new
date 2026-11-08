import Image from 'next/image';
import Link from 'next/link';
import type { ProductCard as ProductCardData } from '@banovit/api-client';
import { IconBolt, IconTool } from './icons';
import { cx, faDigits } from './lib/format';
import { Price } from './Price';
import { Rating } from './Rating';

/**
 * Listing card: image with «تخفیف شگفت‌انگیز» ribbon and install-service badge,
 * color dots, name, variant size chips, rating, price/discount.
 * Server component; the whole card is one link (single tab stop).
 */
export function ProductCard({
  product,
  priority = false,
  sizes = '(min-width: 1280px) 240px, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw',
}: {
  product: ProductCardData;
  priority?: boolean;
  sizes?: string;
}) {
  const unavailable = !product.in_stock;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-md border border-border bg-surface transition-shadow duration-150 hover:shadow-md">
      <Link
        href={product.path}
        className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <div className="relative aspect-square bg-surface">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.alt ?? product.name}
              fill
              sizes={sizes}
              priority={priority}
              className={cx('object-contain p-2', unavailable && 'opacity-50 grayscale')}
            />
          ) : null}

          {product.badges.amazing_discount ? (
            <span className="absolute inset-x-0 top-0 flex items-center justify-center gap-1 bg-deal py-1 text-[11px] font-bold text-deal-on">
              <IconBolt size={12} />
              تخفیف شگفت‌انگیز
            </span>
          ) : null}

          {product.badges.install_service ? (
            <span className="absolute bottom-2 start-2 inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-primary-on-subtle">
              <IconTool size={12} />
              خدمات نصب
            </span>
          ) : null}

          {product.colors.length > 0 ? (
            <span className="absolute bottom-2 end-2 flex items-center gap-0.5" aria-label={`رنگ‌ها: ${product.colors.map((c) => c.name).join('، ')}`}>
              {product.colors.map((c) => (
                <span
                  key={c.slug}
                  title={c.name}
                  className="size-3 rounded-full border border-border-strong"
                  style={{ backgroundColor: c.hex ?? 'transparent' }}
                />
              ))}
              {product.colors_more > 0 ? <span className="text-[10px] text-text-muted">+{faDigits(product.colors_more)}</span> : null}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3">
          {product.brand ? <p className="text-[11px] text-text-subtle">{product.brand.name}</p> : null}
          <h3 className="line-clamp-2 min-h-10 text-[13px] font-medium leading-5 text-text">{product.name}</h3>

          {product.sizes ? (
            <ul className="flex flex-wrap gap-1" aria-label={product.sizes.label}>
              {product.sizes.values.map((v) => (
                <li key={v} className="rounded-xs border border-border px-1.5 text-[11px] leading-5 text-text-muted">
                  {v}
                </li>
              ))}
              {product.sizes.more > 0 ? (
                <li className="px-1 text-[11px] leading-5 text-text-subtle">+{faDigits(product.sizes.more)}</li>
              ) : null}
            </ul>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-2">
            <div>{product.rating ? <Rating average={product.rating.average} count={product.rating.count} /> : null}</div>
            {unavailable ? (
              <p className="text-sm font-medium text-text-subtle">ناموجود</p>
            ) : (
              <Price price={product.price} priceMax={product.price_max} regular={product.regular_price} discountPercent={product.discount_percent} />
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
