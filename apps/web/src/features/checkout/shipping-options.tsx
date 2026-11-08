'use client';

import type { Cart } from '@banovit/api-client';
import { cx, formatToman, IconInfo, IconTool, IconTruck } from '@banovit/ui';

function feeText(fee: { amount: number }, label?: string | null): string {
  return fee.amount > 0 ? `${formatToman(fee.amount)} تومان` : (label ?? 'رایگان');
}

/**
 * «روش ارسال»: the methods the store settings and shipping rules offer for this
 * cart (radiogroup). Hidden when there is only one; its title is still shown
 * by the delivery section. Rule notices (e.g. پس‌کرایه for outer cities) below.
 */
export function ShippingMethods({ cart, busy, onSelect }: { cart: Cart; busy: boolean; onSelect: (key: string) => void }) {
  const methods = cart.delivery.methods ?? [];
  const notices = cart.delivery.notices ?? [];
  if (methods.length < 2 && notices.length === 0) return null;
  return (
    <section aria-labelledby="ship-method-title" className="py-5">
      <h2 id="ship-method-title" className="flex items-center gap-1.5 text-sm font-bold text-text">
        <IconTruck size={20} className="text-primary" />
        روش ارسال
      </h2>
      {methods.length > 1 ? (
        <div role="radiogroup" aria-labelledby="ship-method-title" className="mt-3 grid gap-2 lg:grid-cols-2">
          {methods.map((m) => (
            <button
              key={m.key}
              type="button"
              role="radio"
              aria-checked={m.selected}
              disabled={busy}
              onClick={() => !m.selected && onSelect(m.key)}
              className={cx(
                'flex items-start gap-3 rounded-md border p-3 text-start transition-colors',
                m.selected ? 'border-primary bg-primary-subtle/40' : 'border-border bg-surface hover:border-border-strong',
              )}
            >
              <span aria-hidden className={cx('mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border', m.selected ? 'border-primary' : 'border-border-strong')}>
                {m.selected ? <span className="size-2 rounded-full bg-primary" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-text">{m.title}</span>
                  <span className={cx('shrink-0 text-xs', m.fee.amount > 0 ? 'text-text' : 'text-success')}>{feeText(m.fee, m.fee_label)}</span>
                </span>
                {m.description ? <span className="mt-1 block text-xs leading-5 text-text-muted">{m.description}</span> : null}
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {notices.map((n) => (
        <p key={n} className="mt-3 flex items-start gap-2 rounded-md bg-warning-subtle px-3 py-2.5 text-xs leading-5 text-warning-on-subtle">
          <IconInfo size={16} className="mt-0.5 shrink-0" />
          {n}
        </p>
      ))}
    </section>
  );
}

/** «زمان مراجعه تیم نصب»: day cards, then that day's time windows. */
export function InstallationVisit({
  cart,
  busy,
  onSelect,
}: {
  cart: Cart;
  busy: boolean;
  onSelect: (date: string, slot: string | null) => void;
}) {
  const sch = cart.installation_schedule;
  if (!sch?.required) return null;
  const date = cart.options.installation_date ?? null;
  const slot = cart.options.installation_slot ?? null;
  const day = sch.slots.find((s) => s.date === date) ?? null;
  return (
    <section aria-labelledby="install-visit-title" className="py-5">
      <h2 id="install-visit-title" className="flex flex-wrap items-center gap-x-1.5 text-sm">
        <IconTool size={20} className="text-primary" />
        <span className="font-bold text-text">زمان مراجعه تیم نصب</span>
        <span className="text-primary">*</span>
        <span className="text-xs text-text-muted">از روز تحویل به بعد</span>
      </h2>
      <div role="radiogroup" aria-label="روز نصب" className="-mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-1 scrollbar-none lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
        {sch.slots.map((s) => {
          const on = s.date === date;
          return (
            <button
              key={s.date}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={busy}
              // Picking a day keeps the time if that day offers it, else its first window.
              onClick={() => onSelect(s.date, s.times.some((t) => t.key === slot) ? slot : (s.times[0]?.key ?? null))}
              className={cx(
                'flex w-[108px] shrink-0 snap-start flex-col items-stretch gap-1 rounded-md border p-2.5 text-center transition-colors lg:w-auto',
                on ? 'border-primary bg-primary-subtle/40' : 'border-border bg-surface hover:border-border-strong',
              )}
            >
              <span className="text-xs text-text-muted">{s.weekday}</span>
              <span className="text-base font-bold text-text">{s.day_label}</span>
            </button>
          );
        })}
      </div>
      {day && day.times.length > 1 ? (
        <div role="radiogroup" aria-label="ساعت مراجعه" className="mt-3 flex flex-wrap gap-2">
          {day.times.map((t) => {
            const on = t.key === slot;
            return (
              <button
                key={t.key}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={busy}
                onClick={() => onSelect(day.date, t.key)}
                className={cx(
                  'h-9 rounded-full border px-4 text-xs transition-colors',
                  on ? 'border-primary bg-primary text-primary-on' : 'border-border text-text hover:bg-surface-muted',
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      ) : day?.times[0] ? (
        <p className="mt-3 text-xs text-text-muted">{day.times[0].label}</p>
      ) : null}
    </section>
  );
}
