'use client';

import { useState } from 'react';
import type { Customer, Profile } from '@banovit/api-client';
import { cx, faDigits } from '@banovit/ui';
import { AccountError, me } from './client';
import { jalaliNumeric, phoneDisplay } from './format';
import { IconEdit } from './icons';

type Section = 'identity' | 'contact' | null;

/** «حساب کاربری بانویت» (designs 02, 03): view + inline edit of identity and contact info. */
export function ProfileView({ customer, profile: initial }: { customer: Customer; profile: Profile }) {
  const [profile, setProfile] = useState(initial);
  const [first, setFirst] = useState(customer.first_name ?? '');
  const [last, setLast] = useState(customer.last_name ?? '');
  const [editing, setEditing] = useState<Section>(null);
  const [form, setForm] = useState({ national_code: initial.national_code ?? '', birth_date: initial.birth_date ? toJalaliInput(initial.birth_date) : '', email: initial.email ?? '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const name = `${first} ${last}`.trim() || profile.name;

  const save = async (section: Exclude<Section, null>) => {
    setBusy(true);
    setErrors({});
    try {
      if (section === 'identity') {
        if (first.trim() !== (customer.first_name ?? '') || last.trim() !== (customer.last_name ?? '')) {
          const res = await fetch('/api/auth/profile/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ first_name: first.trim(), last_name: last.trim() }),
            credentials: 'same-origin',
          });
          if (!res.ok) {
            const j = (await res.json().catch(() => null)) as { error?: { message?: string; fields?: Record<string, string[]> } } | null;
            throw new AccountError(res.status, 'validation_failed', j?.error?.message ?? 'نام ذخیره نشد.', j?.error?.fields);
          }
        }
        setProfile(await me<Profile>('PATCH', 'profile', { national_code: form.national_code || null, birth_date: form.birth_date || null }));
      } else {
        setProfile(await me<Profile>('PATCH', 'profile', { email: form.email || null }));
      }
      setEditing(null);
    } catch (e) {
      if (e instanceof AccountError && e.fields) setErrors(Object.fromEntries(Object.entries(e.fields).map(([k, v]) => [k, v[0] ?? ''])));
      else setErrors({ _: e instanceof Error ? e.message : 'ذخیره نشد.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 pt-2 lg:grid-cols-2 lg:items-start">
      {!profile.identity_complete && editing !== 'identity' ? (
        <div className="rounded-lg bg-surface-muted p-5 text-center lg:col-span-2">
          <p className="text-base font-extrabold text-text">احراز هویت شما تکمیل نیست!</p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-text-muted">
            برای افزایش امنیت حساب کاربری و اطمینان از هویت صاحب حساب، لازم است مراحل احراز هویت خود را تکمیل کنید.
          </p>
          <button type="button" onClick={() => setEditing('identity')} className="mt-4 h-12 w-full max-w-sm rounded-md bg-primary text-sm font-bold text-primary-on hover:bg-primary-hover">
            ثبت اطلاعات شناسایی
          </button>
        </div>
      ) : null}

      <Card
        title="اطلاعات کاربری"
        badge={profile.identity_complete ? <span className="rounded-full bg-primary-subtle px-2 text-[11px] leading-5 text-primary-on-subtle">تایید شده</span> : <span className="rounded-full bg-danger-subtle px-2 text-[11px] leading-5 text-danger-on-subtle">تایید نشده</span>}
        editing={editing === 'identity'}
        onEdit={() => setEditing('identity')}
      >
        {editing === 'identity' ? (
          <form className="grid gap-3 p-4" onSubmit={(e) => { e.preventDefault(); void save('identity'); }}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="نام" value={first} onChange={setFirst} error={errors.first_name} autoComplete="given-name" />
              <Field label="نام خانوادگی" value={last} onChange={setLast} error={errors.last_name} autoComplete="family-name" />
            </div>
            <Field label="تاریخ تولد" value={form.birth_date} onChange={(v) => setForm({ ...form, birth_date: v })} error={errors.birth_date} placeholder="مثلا ۱۳۷۰/۰۵/۲۰" inputMode="numeric" />
            <Field label="کد ملی" value={form.national_code} onChange={(v) => setForm({ ...form, national_code: v })} error={errors.national_code} inputMode="numeric" maxLength={10} />
            <Actions busy={busy} onCancel={() => setEditing(null)} error={errors._} />
          </form>
        ) : (
          <dl>
            <Item label="نام و نام‌خانوادگی" value={name} />
            <Item label="تاریخ تولد" value={profile.birth_date ? jalaliNumeric(profile.birth_date) : null} />
            <Item label="کد ملی" value={profile.national_code ? faDigits(profile.national_code) : null} />
          </dl>
        )}
      </Card>

      <Card title="اطلاعات تماس" editing={editing === 'contact'} onEdit={() => setEditing('contact')}>
        {editing === 'contact' ? (
          <form className="grid gap-3 p-4" onSubmit={(e) => { e.preventDefault(); void save('contact'); }}>
            <Field label="آدرس ایمیل" type="email" dir="ltr" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={errors.email} autoComplete="email" />
            <p className="text-xs text-text-muted">شماره موبایل همان شماره ورود شماست و از این بخش تغییر نمی‌کند.</p>
            <Actions busy={busy} onCancel={() => setEditing(null)} error={errors._} />
          </form>
        ) : (
          <dl>
            <Item label="آدرس ایمیل" value={profile.email} empty="آدرسی ثبت نشده است!" ltr />
            <Item label="شماره موبایل" value={phoneDisplay(profile.phone)} ltr />
          </dl>
        )}
      </Card>
    </div>
  );
}

function toJalaliInput(iso: string): string {
  return jalaliNumeric(iso);
}

function Card({ title, badge, editing, onEdit, children }: { title: string; badge?: React.ReactNode; editing: boolean; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-base font-extrabold text-text">{title}</h2>
        {badge}
        {!editing ? (
          <button type="button" onClick={onEdit} className="ms-auto inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary">
            <IconEdit size={16} /> ویرایش
          </button>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-md border border-border bg-surface">{children}</div>
    </section>
  );
}

function Item({ label, value, empty = '—', ltr }: { label: string; value: string | null | undefined; empty?: string; ltr?: boolean }) {
  return (
    <div className="border-b border-border px-4 py-3 last:border-none">
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className={cx('mt-1 font-bold', value ? 'text-text' : 'text-text-muted')} dir={ltr && value ? 'ltr' : undefined} style={ltr && value ? { textAlign: 'right' } : undefined}>
        {value || empty}
      </dd>
    </div>
  );
}

function Field({ label, value, onChange, error, ...rest }: { label: string; value: string; onChange: (v: string) => void; error?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <label className="grid gap-1 text-xs text-text-muted">
      {label}
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={cx('h-11 rounded-sm border bg-surface-muted px-3 text-sm text-text focus:bg-surface focus:outline-none', error ? 'border-danger' : 'border-transparent focus:border-primary')}
      />
      {error ? <span className="text-danger">{error}</span> : null}
    </label>
  );
}

function Actions({ busy, onCancel, error }: { busy: boolean; onCancel: () => void; error?: string }) {
  return (
    <>
      {error ? <p role="alert" className="text-xs text-danger">{error}</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="h-11 flex-1 rounded-sm bg-primary text-sm font-bold text-primary-on hover:bg-primary-hover disabled:opacity-60">
          {busy ? 'در حال ذخیره…' : 'ذخیره'}
        </button>
        <button type="button" onClick={onCancel} className="h-11 rounded-sm border border-border px-5 text-sm text-text">انصراف</button>
      </div>
    </>
  );
}
