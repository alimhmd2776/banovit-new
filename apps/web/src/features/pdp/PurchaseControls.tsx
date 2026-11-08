'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ProductAddon } from '@banovit/api-client';
import { BottomSheet, cx, faDigits, formatToman, IconCheck, IconChevronLeft, IconMinus, IconPhone, IconPlus, IconTool } from '@banovit/ui';
import { siteConfig } from '@/lib/site-config';
import { optionUnitAmount, usePurchase } from './PurchaseContext';
import { valueState } from './variants';

/* ---------------- variation pickers ---------------- */

/** «مدل / رنگ / سایز محصول» rows: pill radios, scrollable on mobile, wrapping on desktop. */
export function OptionPickers() {
  const { product, selection, select, missing } = usePurchase();
  if (!product.options.length) return null;

  return (
    <div className="space-y-5">
      {product.options.map((o) => {
        const chosen = o.values.find((v) => v.value === selection[o.key]);
        return (
          <fieldset key={o.key} id={`option-${o.key}`} className="min-w-0 scroll-mt-32">
            <legend className="mb-3 flex items-center gap-1.5 text-[15px] font-bold text-text">
              {o.label}:
              <span className={cx('font-medium', chosen ? 'text-text' : 'text-text-subtle')}>{chosen?.label ?? 'انتخاب کنید'}</span>
              {o.type === 'swatch' && chosen?.hex ? <span className="size-4 rounded-full border border-border-strong" style={{ backgroundColor: chosen.hex }} aria-hidden /> : null}
              <span className="text-danger" aria-hidden>
                *
              </span>
            </legend>
            <div
              role="radiogroup"
              aria-required="true"
              aria-invalid={missing === o.key || undefined}
              className={cx(
                '-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0',
                missing === o.key && 'rounded-md ring-2 ring-danger/40',
              )}
            >
              {o.values.map((v) => {
                const state = valueState(product.variants, selection, o.key, v.value);
                const active = selection[o.key] === v.value;
                return (
                  <button
                    key={v.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={state === 'unavailable'}
                    onClick={() => select(o.key, v.value)}
                    className={cx(
                      'inline-flex h-11 shrink-0 items-center gap-2 rounded-full border ps-2 pe-4 text-[13px] transition-colors duration-150',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                      active ? 'border-primary bg-primary-subtle/60 text-text' : 'border-border bg-surface text-text hover:border-border-strong',
                      state !== 'available' && !active && 'text-text-subtle',
                      state === 'unavailable' && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <span
                      className={cx(
                        'flex size-6 items-center justify-center rounded-full border',
                        active ? 'border-primary bg-primary text-primary-on' : 'border-border-strong bg-surface',
                      )}
                      style={o.type === 'swatch' && v.hex && !active ? { backgroundColor: v.hex } : undefined}
                      aria-hidden
                    >
                      {active ? <IconCheck size={14} strokeWidth={2.6} /> : null}
                    </span>
                    <span className={cx(state === 'out_of_stock' && !active && 'line-through decoration-text-subtle')}>{v.label}</span>
                    {state === 'out_of_stock' ? <span className="sr-only">(ناموجود)</span> : null}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

/* ---------------- installation add-on ---------------- */

/** «نصب محصول توسط تیم فنی» card; opens a sheet with the add-on options and their prices. */
const isInstall = (a: ProductAddon) => a.options.some((o) => o.kind === 'installation');

/** «خدمات نصب» (BDI rules): card + bottom sheet. Other add-ons are inline pickers (AddonPickers). */
export function InstallCard({ installBadge }: { installBadge: boolean }) {
  const { product, addonIds, toggleAddon, installTotal } = usePurchase();
  const [open, setOpen] = useState(false);
  const installAddons = product.addons.filter(isInstall);
  if (product.made_to_order || (!installAddons.length && !installBadge)) return null;

  const chosen = installAddons.flatMap((a) => a.options).filter((o) => addonIds.includes(o.id));
  const hasOptions = installAddons.length > 0;
  const addonTotal = installTotal;

  const card = (
    <span className="flex items-start gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-primary">
        <IconTool size={20} />
      </span>
      <span className="min-w-0 flex-1 text-start">
        <span className="block text-sm font-bold text-text">نصب محصول توسط تیم فنی</span>
        <span className="mt-1 block text-xs leading-5 text-text-muted">
          {chosen.length
            ? `${chosen.map((o) => o.label).join('، ')}${addonTotal ? ` (${formatToman(addonTotal)} تومان)` : ''}`
            : 'این محصول قابلیت نصب توسط تیم فنی بانویت را دارد'}
        </span>
      </span>
      {hasOptions ? <IconChevronLeft size={18} className="mt-2 shrink-0 text-text-subtle" /> : null}
    </span>
  );

  return (
    <>
      {hasOptions ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full rounded-md border border-primary/20 bg-primary-subtle p-3 hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-focus"
          aria-haspopup="dialog"
        >
          {card}
        </button>
      ) : (
        <div className="rounded-md border border-primary/20 bg-primary-subtle p-3">{card}</div>
      )}

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="خدمات نصب"
        footer={
          <button type="button" onClick={() => setOpen(false)} className="h-12 w-full rounded-sm bg-primary text-sm font-bold text-primary-on hover:bg-primary-hover">
            تأیید
          </button>
        }
      >
        <div className="space-y-5 px-4 pb-4">
          {installAddons.map((a) => (
            <fieldset key={a.id}>
              <legend className="mb-2 text-sm font-bold text-text">
                {a.title}
                {a.required ? <span className="ms-1 text-danger">*</span> : null}
              </legend>
              {a.description ? <p className="mb-3 text-xs leading-6 text-text-muted">{a.description}</p> : null}
              <ul className="space-y-2">
                {a.options.map((o) => {
                  const on = addonIds.includes(o.id);
                  return (
                    <li key={o.id}>
                      <label
                        className={cx(
                          'flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors',
                          on ? 'border-primary bg-primary-subtle/60' : 'border-border hover:border-border-strong',
                        )}
                      >
                        <input
                          type={a.type === 'radio' ? 'radio' : 'checkbox'}
                          name={`addon-${a.id}`}
                          checked={on}
                          onChange={() => toggleAddon(a.id, o.id)}
                          className="mt-1 size-4 accent-[var(--color-primary)]"
                        />
                        <span className="flex-1">
                          <span className="block text-sm text-text">{o.label}</span>
                          {o.description ? <span className="mt-1 block text-xs leading-5 text-text-muted">{o.description}</span> : null}
                        </span>
                        <span className="shrink-0 text-sm font-medium text-text">
                          {o.price.amount ? (
                            <>
                              {formatToman(o.price.amount)} <span className="text-[11px] text-text-muted">تومان</span>
                            </>
                          ) : (
                            'رایگان'
                          )}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ))}
          <p className="text-xs leading-6 text-text-muted">هزینه نصب برای هر عدد کالا محاسبه می‌شود و زمان نصب پس از ثبت سفارش هماهنگ می‌شود.</p>
        </div>
      </BottomSheet>
    </>
  );
}

/* ---------------- product add-ons (Rico) ---------------- */

/** Mirror anti-fog, light colour, model ... : pills (select/button/multiselect) or swatches (color). */
export function AddonPickers() {
  const { product, addonIds, toggleAddon, current } = usePurchase();
  const addons = product.addons.filter((a) => !isInstall(a));
  if (product.made_to_order || !addons.length) return null;
  const unit = current.price?.amount ?? 0;

  return (
    <div className="space-y-5">
      {addons.map((a) => {
        const picked = a.options.find((o) => addonIds.includes(o.id));
        return (
          <fieldset key={a.id}>
            <legend className="mb-3 flex items-center gap-2 text-sm text-text-muted">
              <span className="font-bold text-text">{a.title}</span>
              {a.required ? <span className="text-danger" aria-label="اجباری">*</span> : <span className="text-xs text-text-subtle">(اختیاری)</span>}
              {a.display === 'color' && picked ? <span className="text-text">: {picked.label}</span> : null}
            </legend>
            <ul className="flex flex-wrap gap-2">
              {a.options.map((o) => {
                const on = addonIds.includes(o.id);
                const amount = o.price_type === 'percentage' ? optionUnitAmount(o, unit) : o.price.amount;
                const priceText = amount ? `+${formatToman(amount)} تومان${o.price_type === 'flat_rate' ? ' (یک‌بار)' : ''}` : null;
                const input = (
                  <input
                    type={a.type === 'radio' ? 'radio' : 'checkbox'}
                    name={`addon-${a.id}`}
                    checked={on}
                    onChange={() => toggleAddon(a.id, o.id)}
                    className="peer sr-only"
                  />
                );
                if (a.display === 'color' && o.color) {
                  return (
                    <li key={o.id}>
                      <label title={priceText ? `${o.label} ${priceText}` : o.label} className="block cursor-pointer">
                        {input}
                        <span
                          className={cx('block size-9 rounded-full border-2 ring-offset-2 peer-focus-visible:ring-2 peer-focus-visible:ring-focus', on ? 'border-primary' : 'border-border')}
                          style={{ backgroundColor: o.color }}
                        />
                        <span className="sr-only">{o.label}</span>
                      </label>
                    </li>
                  );
                }
                return (
                  <li key={o.id}>
                    <label
                      className={cx(
                        'flex min-h-10 cursor-pointer flex-col justify-center rounded-full border px-4 py-1.5 text-sm transition-colors peer-focus-visible:ring-2',
                        on ? 'border-primary bg-primary-subtle font-bold text-primary' : 'border-border text-text hover:border-border-strong',
                      )}
                    >
                      {input}
                      <span>{o.label}</span>
                      {priceText ? <span className="text-[11px] font-normal text-text-muted">{priceText}</span> : null}
                    </label>
                  </li>
                );
              })}
            </ul>
            {picked?.description ? <p className="mt-2 text-xs leading-6 text-text-muted">{picked.description}</p> : null}
          </fieldset>
        );
      })}
    </div>
  );
}

/* ---------------- price + add to cart ---------------- */

function PriceLine({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const { current, product, extrasTotal } = usePurchase();
  if (!current.price)
    return <p className="text-sm font-medium text-text-muted">{product.made_to_order ? 'سفارشی تولید می‌شود' : 'برای استعلام قیمت تماس بگیرید'}</p>;
  return (
    <div className="flex flex-col items-start gap-0.5">
      {current.regular && current.discount > 0 ? (
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-danger px-1.5 text-[11px] font-bold leading-5 text-primary-on">{faDigits(current.discount)}٪</span>
          <del className="text-xs text-text-subtle" aria-label="قیمت قبل">
            {formatToman(current.regular.amount + extrasTotal)}
          </del>
        </div>
      ) : null}
      <p className={cx('font-extrabold text-text', size === 'lg' ? 'text-xl' : 'text-base')}>
        {current.fromPrice ? <span className="me-1 text-xs font-normal text-text-muted">از</span> : null}
        {formatToman(current.price.amount + extrasTotal)}
        <span className="ms-1 text-xs font-normal text-text-muted">تومان</span>
      </p>
    </div>
  );
}

function AddButton({ className }: { className?: string }) {
  const { add, status, current, product, variant } = usePurchase();
  const soldOut = product.type === 'variable' ? (variant ? !variant.in_stock : !product.in_stock) : !current.inStock;
  const noPrice = !current.price;

  if (product.made_to_order || noPrice) {
    const phone = product.consult_phone || siteConfig.supportPhone;
    return (
      <a href={`tel:${phone}`} className={cx('flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-6 text-sm font-bold text-primary-on hover:bg-primary-hover', className)}>
        <IconPhone size={18} />
        {product.made_to_order ? 'مشاوره رایگان' : 'تماس برای خرید'}
      </a>
    );
  }
  if (status.kind === 'added') {
    return (
      <Link href="/cart/" className={cx('flex h-12 items-center justify-center gap-2 rounded-full bg-success px-6 text-sm font-bold text-primary-on', className)}>
        <IconCheck size={18} /> مشاهده سبد خرید
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={add}
      disabled={soldOut || status.kind === 'adding'}
      className={cx(
        'h-12 whitespace-nowrap rounded-full px-6 text-[15px] font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        soldOut ? 'cursor-not-allowed bg-surface-muted text-text-subtle' : 'bg-primary text-primary-on hover:bg-primary-hover disabled:opacity-70',
        className,
      )}
    >
      {soldOut ? 'ناموجود' : status.kind === 'adding' ? 'در حال افزودن…' : 'افزودن به سبد'}
    </button>
  );
}

function StatusMessage() {
  const { status } = usePurchase();
  return (
    <p role="status" aria-live="polite" className={cx('text-xs', status.kind === 'error' ? 'text-danger' : 'text-success')}>
      {status.kind === 'error' ? status.message : status.kind === 'added' ? 'به سبد خرید اضافه شد.' : ''}
    </p>
  );
}

/** Mobile sticky buy bar (covers the bottom nav on product pages, like the design). */
export function MobileBuyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[1150] px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 lg:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full border border-border bg-surface py-2 pe-4 ps-2 shadow-lg">
        <AddButton className="min-w-[150px]" />
        <PriceLine />
      </div>
      <div className="mx-auto max-w-xl px-4 pt-1 text-center empty:hidden [&>p:empty]:hidden">
        <StatusMessage />
      </div>
    </div>
  );
}

/** Desktop buy box (sticky in the side column). */
export function BuyBox() {
  const { quantity, setQuantity, installTotal, extrasTotal, extrasFlat, current, product } = usePurchase();
  if (product.made_to_order) {
    return (
      <div className="space-y-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <PriceLine size="lg" />
        <AddButton className="w-full" />
      </div>
    );
  }
  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
      <PriceLine size="lg" />
      {current.price && (extrasTotal > 0 || extrasFlat > 0) ? (
        <p className="text-xs text-text-muted">
          شامل افزودنی‌ها {formatToman(extrasTotal)} تومان (برای هر عدد){extrasFlat > 0 ? ` + ${formatToman(extrasFlat)} تومان یک‌بار` : ''}
        </p>
      ) : null}
      {installTotal > 0 && current.price ? (
        <p className="text-xs text-text-muted">
          + هزینه نصب {formatToman(installTotal)} تومان (برای هر عدد)
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <div className="flex h-12 items-center rounded-full border border-border" role="group" aria-label="تعداد">
          <button type="button" onClick={() => setQuantity(Math.min(20, quantity + 1))} className="flex size-12 items-center justify-center text-primary" aria-label="افزایش تعداد">
            <IconPlus size={18} />
          </button>
          <output className="w-6 text-center text-sm font-bold" aria-live="polite">
            {faDigits(quantity)}
          </output>
          <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex size-12 items-center justify-center text-text-muted" aria-label="کاهش تعداد">
            <IconMinus size={18} />
          </button>
        </div>
        <AddButton className="flex-1" />
      </div>
      <StatusMessage />
    </div>
  );
}
