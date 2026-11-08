'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CartLine } from '@banovit/api-client';
import { cx, faDigits, formatToman, IconInfo, IconStore, QuantityStepper, Switch } from '@banovit/ui';
import { Money } from './Money';

export const HOUSE_SELLER_NAME = 'بانویت';

export function sellerName(line: CartLine): string {
  return line.seller?.name ?? HOUSE_SELLER_NAME;
}

/** «رنگ سفید»; just the value when it already repeats the attribute word («درجه کیفیت» + «درجه دو» → «درجه دو»). */
export function attributeLabel(name: string, value: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length || words.some((w) => value.includes(w))) return value;
  return `${name} ${value}`;
}

export function lineDetails(line: CartLine): string[] {
  const out = line.variation?.attributes.map((a) => attributeLabel(a.name, a.value)) ?? [];
  for (const a of line.addons ?? []) out.push(a.label);
  if (line.installation.selected && line.installation.available) out.push('با خدمات نصب');
  return out;
}

/** Details plus «فروشنده: …», for summaries without the seller chip (order items, proforma). */
export function lineDetailsWithSeller(line: CartLine): string[] {
  return [`فروشنده: ${sellerName(line)}`, ...lineDetails(line)];
}

/** One cart line: image, brand chip, name, attributes, stepper, price, installation toggle. */
export function CartLineCard({
  line,
  busy,
  onQuantity,
  onRemove,
  onInstallation,
}: {
  line: CartLine;
  busy: boolean;
  onQuantity: (q: number) => void;
  onRemove: () => void;
  onInstallation: (on: boolean) => void;
}) {
  const details = lineDetails(line);
  const discount = line.discount_percent > 0;
  return (
    <article className={cx('py-5', !line.purchasable && 'opacity-90')} aria-label={line.product.name}>
      <div className="flex gap-3">
        <Link href={line.product.path} className="relative size-[72px] shrink-0 overflow-hidden rounded-sm bg-surface-muted lg:size-24">
          {line.product.image ? (
            <Image src={line.product.image.url} alt={line.product.image.alt ?? line.product.name} fill sizes="96px" className="object-cover" />
          ) : null}
        </Link>
        <div className="min-w-0 flex-1">
          {/* Seller chip (design: store icon + seller name); Banovit itself when no marketplace seller. */}
          <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-text-muted" title="فروشنده">
            <IconStore size={13} />
            {sellerName(line)}
          </span>
          <h3 className="text-[15px] font-bold leading-6 text-text">
            <Link href={line.product.path} className="hover:text-primary">
              {line.product.name}
            </Link>
          </h3>
          {details.length ? (
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-text-muted">
              {details.map((d, i) => (
                <span key={d} className="inline-flex items-center gap-1.5">
                  {i > 0 ? <span aria-hidden="true" className="size-1 rounded-full bg-text-subtle" /> : null}
                  {d}
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>

      {line.issue ? (
        <p role="status" className="mt-3 flex items-start gap-2 rounded-sm bg-warning-subtle px-3 py-2 text-xs text-warning-on-subtle">
          <IconInfo size={16} className="mt-0.5 shrink-0" />
          {line.issue.message}
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-3">
        <QuantityStepper
          value={line.quantity}
          max={line.max_quantity}
          busy={busy}
          label={line.product.name}
          onChange={onQuantity}
          onRemove={onRemove}
        />
        {line.purchasable ? (
          <div className="flex flex-col items-end gap-1">
            {discount ? (
              <div className="flex items-center gap-1.5">
                <del className="text-xs text-text-subtle" aria-label="قیمت قبل از تخفیف">
                  {formatToman(line.line_regular_total.amount)}
                </del>
                <span className="rounded-full bg-danger px-1.5 text-[11px] font-bold leading-5 text-primary-on">٪{faDigits(line.discount_percent)}</span>
              </div>
            ) : null}
            <Money rial={line.line_total.amount} className="text-base font-bold text-text" />
          </div>
        ) : (
          <button type="button" onClick={onRemove} className="text-xs font-medium text-danger underline-offset-4 hover:underline">
            حذف از سبد
          </button>
        )}
      </div>

      {line.installation.available ? (
        <div className="mt-3 rounded-md bg-surface-muted px-3">
          <Switch
            checked={line.installation.selected}
            disabled={busy}
            onChange={onInstallation}
            label="نصب این محصول توسط تیم فنی"
            description={
              line.installation.available_in_zone
                ? `محصولات را به متخصص بسپار: +${formatToman(line.installation.unit_fee.amount)} تومان برای هر عدد`
                : 'خدمات نصب برای شهر انتخابی شما ارائه نمی‌شود.'
            }
          />
        </div>
      ) : null}
    </article>
  );
}
