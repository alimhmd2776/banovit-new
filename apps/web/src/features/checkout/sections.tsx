'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Address, Cart, CartLine } from '@banovit/api-client';
import { BottomSheet, cx, faDigits, formatToman, IconBox, IconChevronLeft, IconMapPin, IconTool, Switch } from '@banovit/ui';
import { lineDetails } from '@/features/cart/CartLineCard';

/** «آدرس تحویل» card; red empty state when no address yet. */
export function AddressCard({ address, onEdit }: { address: Address | null; onEdit: () => void }) {
  const full = address
    ? [address.province, address.city, address.address_line, address.plaque ? `پلاک ${address.plaque}` : null, address.unit ? `واحد ${address.unit}` : null]
        .filter(Boolean)
        .join('، ')
    : null;
  return (
    <button
      type="button"
      onClick={onEdit}
      className="flex w-full items-center gap-3 py-5 text-start focus-visible:outline-2 focus-visible:outline-focus"
      aria-label={address ? 'ویرایش آدرس تحویل' : 'ثبت آدرس تحویل'}
    >
      <IconMapPin size={20} className={cx('shrink-0 self-start', address ? 'text-primary' : 'text-danger')} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-1.5 text-sm">
          <span className={address ? 'text-primary' : 'text-danger'}>آدرس تحویل</span>
          <span className="font-bold text-text">{address ? address.title || address.recipient_name : 'ثبت نشده!'}</span>
        </span>
        <span className="mt-1 block text-xs leading-5 text-text-muted">
          {full ?? 'برای ثبت آدرس جدید، می‌توانید اقدام فرمایید.'}
          {address?.recipient_name ? <span className="block">تحویل‌گیرنده: {address.recipient_name} - {faDigits(address.recipient_phone ?? '')}</span> : null}
        </span>
      </span>
      <IconChevronLeft size={20} className="shrink-0 text-text" />
    </button>
  );
}

/** «زمان ارسال مرسوله»: horizontally scrolling day cards (a radiogroup). */
export function DeliverySlots({ cart, selected, onSelect, busy }: { cart: Cart; selected: string | null; onSelect: (d: string) => void; busy: boolean }) {
  const d = cart.delivery;
  return (
    <section aria-labelledby="slots-title" className="py-5">
      <h2 id="slots-title" className="flex flex-wrap items-center gap-x-1.5 text-sm">
        <span className="font-bold text-text">زمان ارسال مرسوله</span>
        {d.requires_slot ? <span className="text-primary">*</span> : null}
        <span className="text-xs text-text-muted">{d.requires_slot ? d.window_label : `ارسال با ${d.zone.label}`}</span>
      </h2>
      {d.requires_slot ? (
        <div role="radiogroup" aria-labelledby="slots-title" className="-mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-1 scrollbar-none lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 xl:grid-cols-7">
          {d.slots.map((s) => {
            const on = s.date === selected;
            return (
              <button
                key={s.date}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={busy}
                onClick={() => onSelect(s.date)}
                className={cx(
                  'flex w-[108px] shrink-0 snap-start flex-col items-stretch gap-1 rounded-md border p-2.5 text-center transition-colors lg:w-auto',
                  on ? 'border-primary bg-primary-subtle/40' : 'border-border bg-surface hover:border-border-strong',
                )}
              >
                <span className="text-xs text-text-muted">{s.weekday}</span>
                <span className="text-base font-bold text-text">{s.day_label}</span>
                <span className={cx('mt-1 rounded-sm py-1 text-[11px]', on ? 'bg-primary-subtle text-primary-on-subtle' : 'bg-surface-muted text-text-muted')}>
                  {s.fee.amount > 0 ? `${formatToman(s.fee.amount)} تومان` : 'رایگان'}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 rounded-md bg-surface-muted px-3 py-2.5 text-xs leading-5 text-text-muted">
          سفارش‌های این شهر با باربری یا پست ارسال می‌شوند؛ هزینه ارسال {d.fee.amount > 0 ? `${formatToman(d.fee.amount)} تومان` : `«${d.fee_label ?? 'رایگان'}»`} است و زمان تحویل پس از ثبت سفارش هماهنگ می‌شود.
        </p>
      )}
    </section>
  );
}

/** Packaging + installation add-on rows. */
export function AddonsSection({ cart, busy, onPackaging, onOpenInstall }: { cart: Cart; busy: boolean; onPackaging: (on: boolean) => void; onOpenInstall: () => void }) {
  const pk = cart.addons.packaging;
  const inst = cart.addons.installation;
  const installHint = !inst.available_in_zone
    ? 'خدمات نصب برای شهر انتخابی ارائه نمی‌شود.'
    : inst.available_items === 0
      ? 'کالایی خدمات نصب ندارد.'
      : inst.selected_items > 0
        ? `${faDigits(inst.selected_items)} کالا با خدمات نصب`
        : `${faDigits(inst.available_items)} عدد از محصولات انتخاب نشده است!`;
  const installMuted = !inst.available_in_zone || inst.available_items === 0;
  return (
    <section aria-label="خدمات" className="space-y-5 py-5">
      {pk ? (
        <AddonRow
          icon={<IconBox size={20} className="text-primary" />}
          title={pk.label}
          hint={`${pk.description} : +${formatToman(pk.fee.amount)} تومان`}
          action={
            <button
              type="button"
              aria-pressed={cart.options.packaging}
              disabled={busy}
              onClick={() => onPackaging(!cart.options.packaging)}
              className={cx(
                'h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors',
                cart.options.packaging ? 'border-primary bg-primary text-primary-on' : 'border-border text-text hover:bg-surface-muted',
              )}
            >
              {cart.options.packaging ? 'افزوده شد ✓' : 'افزودن'}
            </button>
          }
        />
      ) : null}
      <AddonRow
        icon={<IconTool size={20} className="text-primary" />}
        title={inst.label}
        hint={installHint}
        hintTone={installMuted ? 'warning' : 'muted'}
        action={
          <button
            type="button"
            disabled={installMuted}
            onClick={onOpenInstall}
            className="h-10 shrink-0 rounded-full border border-border px-4 text-sm font-medium text-text hover:bg-surface-muted disabled:opacity-40"
          >
            {inst.selected_items > 0 ? 'ویرایش نصب' : 'درخواست نصب'}
          </button>
        }
      />
    </section>
  );
}

function AddonRow({ icon, title, hint, action, hintTone = 'muted' }: { icon: React.ReactNode; title: string; hint: string; action: React.ReactNode; hintTone?: 'muted' | 'warning' }) {
  return (
    <div className="flex items-center gap-3">
      <span className="self-start pt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text">{title}</p>
        <p className={cx('mt-1 text-xs', hintTone === 'warning' ? 'text-warning-on-subtle' : 'text-text-muted')}>{hint}</p>
      </div>
      {action}
    </div>
  );
}

/** Sheet listing installable lines with a switch each. */
export function InstallSheet({ open, onClose, cart, busy, onToggle }: { open: boolean; onClose: () => void; cart: Cart; busy: boolean; onToggle: (id: number, on: boolean) => void }) {
  const lines = cart.items.filter((l) => l.installation.available);
  return (
    <BottomSheet open={open} onClose={onClose} title="خدمات نصب تیم فنی بانویت">
      <div className="divide-y divide-border px-4">
        {lines.map((l) => (
          <div key={l.id} className="flex items-center gap-3 py-2">
            <Thumb line={l} />
            <div className="min-w-0 flex-1">
              <Switch
                checked={l.installation.selected}
                disabled={busy}
                onChange={(on) => onToggle(l.id, on)}
                label={l.product.name}
                description={`${faDigits(l.quantity)} عدد × ${formatToman(l.installation.unit_fee.amount)} تومان`}
              />
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}

function Thumb({ line, size = 56 }: { line: CartLine; size?: number }) {
  return (
    <span className="relative shrink-0 overflow-hidden rounded-sm bg-surface-muted" style={{ width: size, height: size }}>
      {line.product.image ? <Image src={line.product.image.url} alt="" fill sizes={`${size}px`} className="object-cover" /> : null}
    </span>
  );
}

/** «اقلام سفارش»: compact read-only list of what will be ordered. */
export function OrderItems({ cart }: { cart: Cart }) {
  return (
    <section aria-labelledby="order-items" className="py-5">
      <div className="flex items-center justify-between">
        <h2 id="order-items" className="text-sm">
          <span className="font-bold text-text">اقلام سفارش</span> <span className="text-xs text-text-muted">({faDigits(cart.item_count)} عدد کالا)</span>
        </h2>
        <Link href="/cart/" className="text-xs font-bold text-primary hover:underline">
          ویرایش سبد خرید
        </Link>
      </div>
      <ul className="mt-3 space-y-4">
        {cart.items
          .filter((l) => l.purchasable)
          .map((l) => (
            <li key={l.id} className="flex items-center gap-3">
              <Thumb line={l} size={52} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-text">{l.product.name}</p>
                <p className="mt-1 text-xs text-text-muted">{[...lineDetails(l), `${faDigits(l.quantity)} عدد`].join(' • ')}</p>
              </div>
            </li>
          ))}
      </ul>
    </section>
  );
}
