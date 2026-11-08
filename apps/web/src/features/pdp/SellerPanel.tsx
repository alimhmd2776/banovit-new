'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { SellerCard } from '@banovit/api-client';
import { BottomSheet, cx, faDigits, formatToman, IconCheck, IconChevronLeft, IconStore } from '@banovit/ui';
import { usePurchase } from './PurchaseContext';

/** «رضایت از محصولات»: the seller's average rating as a percentage, like the design. */
function satisfaction(s: SellerCard): string | null {
  const r = s.stats?.rating;
  if (!r || !r.count) return null;
  return `${faDigits((Math.round((r.average / 5) * 1000) / 10).toString())}٪`;
}

function SellerLogo({ seller, size = 40 }: { seller: SellerCard; size?: number }) {
  return seller.logo ? (
    <Image src={seller.logo.url} alt={seller.logo.alt ?? seller.name} width={size} height={size} className="shrink-0 rounded-full border border-border bg-surface object-contain" style={{ width: size, height: size }} />
  ) : (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary" style={{ width: size, height: size }}>
      <IconStore size={size / 2} />
    </span>
  );
}

function SellerMeta({ seller }: { seller: SellerCard }) {
  const sat = satisfaction(seller);
  return (
    <div className="min-w-0 flex-1">
      <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-text">
        <span className="truncate">{seller.name}</span>
        {seller.is_house ? <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-primary">فروشگاه رسمی</span> : null}
      </p>
      <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
        {sat ? (
          <span>
            رضایت از محصولات <span className="rounded-full bg-primary px-1.5 py-0.5 font-bold text-primary-on">{sat}</span>
          </span>
        ) : null}
        {seller.stats?.years_on_banovit ? <span>{faDigits(seller.stats.years_on_banovit)} سال همراه بانویت</span> : null}
      </p>
    </div>
  );
}

/**
 * «خرید مطمئن از …»: the selected seller of the current unit, and the sheet to
 * pick another one («انتخاب از N فروشنده دیگر»). Price, stock and the cart line
 * follow the selection (PurchaseContext).
 */
export function SellerPanel() {
  const { offer, unitOffers, sellerOf, selectSeller, product } = usePurchase();
  const [open, setOpen] = useState(false);
  const house = product.offers.sellers.find((s) => s.is_house);
  const seller = (offer && sellerOf(offer.seller)) ?? house;
  if (!seller) return null;
  const others = unitOffers.filter((o) => o.seller !== seller.slug).length;

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <h2 id="seller-title" className="text-[15px] font-bold text-text">
          خرید مطمئن از {seller.is_house ? 'بانویت' : seller.name}
        </h2>
        {others > 0 ? (
          <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-0.5 text-xs font-medium text-text-muted hover:text-primary" aria-haspopup="dialog">
            انتخاب از {faDigits(others)} فروشنده دیگر
            <IconChevronLeft size={14} />
          </button>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <SellerLogo seller={seller} />
        <SellerMeta seller={seller} />
        {seller.url && !seller.is_house ? (
          <Link href={seller.url} className="shrink-0 text-xs font-medium text-primary">
            صفحه فروشنده
          </Link>
        ) : null}
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="فروشندگان این کالا">
        <ul className="divide-y divide-border px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          {unitOffers.map((o) => {
            const s = sellerOf(o.seller);
            if (!s) return null;
            const on = offer?.seller === o.seller;
            return (
              <li key={o.seller} className="flex items-center gap-3 py-3">
                <SellerLogo seller={s} size={36} />
                <div className="min-w-0 flex-1">
                  <SellerMeta seller={s} />
                </div>
                <div className="shrink-0 text-end">
                  <p className={cx('text-sm font-extrabold', o.in_stock ? 'text-text' : 'text-text-subtle line-through')}>
                    {formatToman(o.price.amount)} <span className="text-[11px] font-normal text-text-muted">تومان</span>
                  </p>
                  {on ? (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-success">
                      <IconCheck size={14} /> انتخاب شده
                    </span>
                  ) : o.in_stock ? (
                    <button
                      type="button"
                      onClick={() => {
                        selectSeller(o.seller);
                        setOpen(false);
                      }}
                      className="mt-1 h-8 rounded-full border border-primary px-4 text-xs font-bold text-primary hover:bg-primary-subtle"
                    >
                      انتخاب
                    </button>
                  ) : (
                    <span className="mt-1 block text-xs text-text-subtle">ناموجود</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </>
  );
}
