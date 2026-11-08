'use client';

import { useState } from 'react';
import type { Address } from '@banovit/api-client';
import { BottomSheet, cx } from '@banovit/ui';
import { PROVINCES, toLatinDigits } from './provinces';

/**
 * Delivery address form (guest checkout). Field names match the account
 * thread's customer_addresses; its AddressForm + MapPicker will replace this
 * sheet once merged (signed-in customers then pick a saved address).
 */
export function AddressSheet({
  open,
  onClose,
  initial,
  onSave,
  saving,
  serverErrors,
}: {
  open: boolean;
  onClose: () => void;
  initial: Address | null;
  onSave: (a: Address) => void;
  saving: boolean;
  serverErrors?: Record<string, string[]>;
}) {
  const [a, setA] = useState<Address>(initial ?? { province: 'تهران', city: 'تهران' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setA((p) => ({ ...p, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const phone = toLatinDigits(a.recipient_phone ?? '').replace(/\D/g, '');
    const next: Record<string, string> = {};
    if (!a.recipient_name?.trim()) next.recipient_name = 'نام تحویل‌گیرنده را وارد کنید.';
    if (!/^09\d{9}$/.test(phone)) next.recipient_phone = 'شماره موبایل را درست وارد کنید (مثل ۰۹۱۲۳۴۵۶۷۸۹).';
    if (!a.province) next.province = 'استان را انتخاب کنید.';
    if (!a.city?.trim()) next.city = 'شهر را وارد کنید.';
    if (!a.address_line?.trim() || a.address_line.trim().length < 10) next.address_line = 'نشانی را کامل بنویسید (خیابان، کوچه، ...).';
    const postal = toLatinDigits(a.postal_code ?? '').replace(/\D/g, '');
    if (postal && postal.length !== 10) next.postal_code = 'کد پستی ۱۰ رقم است.';
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave({ ...a, recipient_phone: phone, postal_code: postal || undefined });
  }

  const err = (k: string) => errors[k] ?? serverErrors?.[`address.${k}`]?.[0];

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="آدرس تحویل"
      footer={
        <button
          type="submit"
          form="address-form"
          disabled={saving}
          className="h-12 w-full rounded-full bg-primary text-sm font-bold text-primary-on hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? 'در حال ذخیره…' : 'ثبت آدرس'}
        </button>
      }
    >
      <form id="address-form" onSubmit={submit} noValidate className="grid grid-cols-2 gap-x-3 gap-y-4 p-4">
        <Field label="عنوان آدرس" hint="مثلاً خانه یا محل کار" className="col-span-2">
          <input value={a.title ?? ''} onChange={set('title')} maxLength={60} className={input()} />
        </Field>
        <Field label="نام و نام خانوادگی تحویل‌گیرنده" error={err('recipient_name')} className="col-span-2" required>
          <input value={a.recipient_name ?? ''} onChange={set('recipient_name')} autoComplete="name" className={input(!!err('recipient_name'))} />
        </Field>
        <Field label="موبایل تحویل‌گیرنده" error={err('recipient_phone')} className="col-span-2" required>
          <input
            value={a.recipient_phone ?? ''}
            onChange={set('recipient_phone')}
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="09123456789"
            className={cx(input(!!err('recipient_phone')), 'text-end')}
          />
        </Field>
        <Field label="استان" error={err('province')} required>
          <select value={a.province ?? ''} onChange={set('province')} className={input(!!err('province'))}>
            {PROVINCES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="شهر" error={err('city')} required>
          <input value={a.city ?? ''} onChange={set('city')} autoComplete="address-level2" className={input(!!err('city'))} />
        </Field>
        <Field label="نشانی" error={err('address_line')} className="col-span-2" required>
          <textarea value={a.address_line ?? ''} onChange={set('address_line')} rows={3} autoComplete="street-address" className={cx(input(!!err('address_line')), 'h-auto py-2')} />
        </Field>
        <Field label="پلاک">
          <input value={a.plaque ?? ''} onChange={set('plaque')} className={input()} />
        </Field>
        <Field label="واحد">
          <input value={a.unit ?? ''} onChange={set('unit')} className={input()} />
        </Field>
        <Field label="کد پستی" error={err('postal_code')} className="col-span-2">
          <input value={a.postal_code ?? ''} onChange={set('postal_code')} inputMode="numeric" dir="ltr" className={cx(input(!!err('postal_code')), 'text-end')} />
        </Field>
      </form>
    </BottomSheet>
  );
}

function input(invalid = false) {
  return cx(
    'h-11 w-full rounded-sm border bg-surface px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
    invalid ? 'border-danger' : 'border-border',
  );
}

function Field({ label, hint, error, required, className, children }: { label: string; hint?: string; error?: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <label className={cx('flex flex-col gap-1.5', className)}>
      <span className="text-xs font-medium text-text">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      {children}
      {error ? (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-text-subtle">{hint}</span>
      ) : null}
    </label>
  );
}
