'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { CustomerAddress, CustomerAddressInput } from '@banovit/api-client';
import { cx } from '@banovit/ui';
import { AccountError, me } from './client';
import { IconEditBox, IconPin } from './icons';
import { DEFAULT_CENTER, PROVINCES } from './iran';
import { reverseGeocode } from './map';
import { MapPreview } from './MapPreview';

const MapPicker = dynamic(() => import('./MapPicker').then((m) => m.MapPicker), { ssr: false });

type Values = Required<Pick<CustomerAddressInput, 'province' | 'city' | 'address_line'>> & {
  title: string;
  recipient_name: string;
  recipient_phone: string;
  plaque: string;
  unit: string;
  postal_code: string;
  lat: number | null;
  lng: number | null;
  is_default: boolean;
};

const empty: Values = { title: '', recipient_name: '', recipient_phone: '', province: 'تهران', city: 'تهران', address_line: '', plaque: '', unit: '', postal_code: '', lat: null, lng: null, is_default: false };

/**
 * «ویرایش آدرس ها» / new address (design 23). Shared component: checkout
 * (feature/web-cart) can render it with `onSaved` to pick the saved address.
 * Saves through the BFF /api/me/addresses/.
 */
export function AddressForm({ address, defaults, onSaved, submitLabel }: { address?: CustomerAddress; defaults?: Partial<Values>; onSaved: (a: CustomerAddress) => void; submitLabel?: string }) {
  const [v, setV] = useState<Values>(() =>
    address
      ? {
          title: address.title ?? '', recipient_name: address.recipient_name ?? '', recipient_phone: address.recipient_phone ?? '', province: address.province ?? '', city: address.city ?? '',
          address_line: address.address_line ?? '', plaque: address.plaque ?? '', unit: address.unit ?? '', postal_code: address.postal_code ?? '', lat: address.lat ?? null, lng: address.lng ?? null, is_default: address.is_default ?? false,
        }
      : { ...empty, ...(defaults as Values) },
  );
  const [picking, setPicking] = useState(!address && v.lat === null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Values>(k: K, val: Values[K]) => setV((s) => ({ ...s, [k]: val }));
  const cities = PROVINCES.find((p) => p.name === v.province)?.cities ?? [];

  const onPicked = async (p: { lat: number; lng: number }) => {
    setPicking(false);
    setV((s) => ({ ...s, ...p }));
    const r = await reverseGeocode(p.lat, p.lng);
    setV((s) => ({
      ...s,
      province: r.province && PROVINCES.some((x) => x.name === r.province) ? r.province : s.province,
      city: r.city ?? s.city,
      address_line: s.address_line || r.line || '',
    }));
  };

  const submit = async () => {
    setBusy(true);
    setErrors({});
    const body: CustomerAddressInput = {
      title: v.title || null, recipient_name: v.recipient_name || null, recipient_phone: v.recipient_phone || null,
      province: v.province, city: v.city.trim(), address_line: v.address_line.trim(), plaque: v.plaque || null, unit: v.unit || null,
      postal_code: v.postal_code || null, lat: v.lat, lng: v.lng, ...(address ? {} : { is_default: v.is_default }),
    };
    try {
      onSaved(address ? await me<CustomerAddress>('PATCH', `addresses/${address.id}`, body) : await me<CustomerAddress>('POST', 'addresses', body));
    } catch (e) {
      if (e instanceof AccountError && e.fields) setErrors(Object.fromEntries(Object.entries(e.fields).map(([k, m]) => [k, m[0] ?? ''])));
      else setErrors({ _: e instanceof Error ? e.message : 'ذخیره نشد.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="grid gap-4 pb-28 lg:pb-0" onSubmit={(e) => { e.preventDefault(); void submit(); }} noValidate>
      {v.lat !== null && v.lng !== null ? (
        <MapPreview lat={v.lat} lng={v.lng} className="h-32">
          <button type="button" onClick={() => setPicking(true)} aria-label="تغییر موقعیت روی نقشه" className="absolute bottom-2 end-2 inline-flex size-9 items-center justify-center rounded-sm bg-surface shadow-sm">
            <IconEditBox size={18} />
          </button>
        </MapPreview>
      ) : (
        <button type="button" onClick={() => setPicking(true)} className="flex h-32 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border-strong bg-surface-muted text-sm text-text-muted">
          <IconPin size={26} /> انتخاب موقعیت روی نقشه
        </button>
      )}
      {errors.lat || errors.lng ? <p className="text-xs text-danger">{errors.lat ?? errors.lng}</p> : null}

      <div className="grid grid-cols-2 gap-3">
        <Select label="استان" value={v.province} onChange={(x) => { set('province', x); set('city', PROVINCES.find((p) => p.name === x)?.cities[0] ?? ''); }} options={PROVINCES.map((p) => p.name)} error={errors.province} />
        <label className="grid gap-1.5 text-sm font-bold">
          شهر
          <input list="address-cities" value={v.city} onChange={(e) => set('city', e.target.value)} className={inputCls(errors.city)} aria-invalid={!!errors.city} />
          <datalist id="address-cities">{cities.map((c) => <option key={c} value={c} />)}</datalist>
          {errors.city ? <span className="text-xs font-normal text-danger">{errors.city}</span> : null}
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-bold">
        جزئیات آدرس
        <textarea rows={4} value={v.address_line} onChange={(e) => set('address_line', e.target.value)} placeholder="محله، خیابان، کوچه، ساختمان" className={cx(inputCls(errors.address_line), 'h-auto py-3')} aria-invalid={!!errors.address_line} />
        {errors.address_line ? <span className="text-xs font-normal text-danger">{errors.address_line}</span> : null}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <Input label="پلاک" value={v.plaque} onChange={(x) => set('plaque', x)} error={errors.plaque} inputMode="numeric" />
        <Input label="واحد" value={v.unit} onChange={(x) => set('unit', x)} error={errors.unit} inputMode="numeric" />
      </div>
      <Input label="عنوان آدرس" value={v.title} onChange={(x) => set('title', x)} placeholder="مثلا کارخانه …" error={errors.title} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="نام تحویل گیرنده" value={v.recipient_name} onChange={(x) => set('recipient_name', x)} placeholder="خودم" error={errors.recipient_name} autoComplete="name" />
        <Input label="موبایل تحویل گیرنده" value={v.recipient_phone} onChange={(x) => set('recipient_phone', x)} placeholder="۰۹۱۲…" error={errors.recipient_phone} inputMode="tel" dir="ltr" autoComplete="tel" />
      </div>
      <Input label="کد پستی (اختیاری)" value={v.postal_code} onChange={(x) => set('postal_code', x)} error={errors.postal_code} inputMode="numeric" maxLength={10} dir="ltr" />
      {!address ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.is_default} onChange={(e) => set('is_default', e.target.checked)} className="size-4 accent-[var(--color-primary)]" />
          آدرس پیش‌فرض باشد
        </label>
      ) : null}
      {errors._ ? <p role="alert" className="text-sm text-danger">{errors._}</p> : null}

      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+20px)] z-sticky px-4 lg:static lg:px-0">
        <button type="submit" disabled={busy} data-busy={busy || undefined} className="h-14 w-full rounded-md bg-primary text-base font-bold text-primary-on shadow-md hover:bg-primary-hover disabled:opacity-60 lg:h-12 lg:max-w-xs lg:shadow-none">
          {busy ? 'در حال ذخیره…' : submitLabel ?? (address ? 'ذخیره ویرایش' : 'ثبت آدرس')}
        </button>
      </div>

      {picking ? <MapPicker initial={v.lat !== null && v.lng !== null ? { lat: v.lat, lng: v.lng } : DEFAULT_CENTER} onConfirm={onPicked} onClose={() => setPicking(false)} /> : null}
    </form>
  );
}

const inputCls = (error?: string) => cx('h-12 w-full rounded-sm border bg-surface-muted px-3 text-sm font-normal text-text placeholder:text-text-subtle focus:bg-surface focus:outline-none', error ? 'border-danger' : 'border-transparent focus:border-primary');

function Input({ label, value, onChange, error, ...rest }: { label: string; value: string; onChange: (v: string) => void; error?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <label className="grid gap-1.5 text-sm font-bold">
      {label}
      <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls(error)} aria-invalid={!!error} />
      {error ? <span className="text-xs font-normal text-danger">{error}</span> : null}
    </label>
  );
}

function Select({ label, value, onChange, options, error }: { label: string; value: string; onChange: (v: string) => void; options: string[]; error?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-bold">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls(error)}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      {error ? <span className="text-xs font-normal text-danger">{error}</span> : null}
    </label>
  );
}
