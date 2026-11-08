'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Address } from '@banovit/api-client';
import { cx, faDigits } from '@banovit/ui';
import { me } from './client';
import { IconMore, IconPin } from './icons';
import { MapPreview } from './MapPreview';
import { EmptyState } from './EmptyState';

/** «آدرس ها» (designs 21, 22). The default address shows its map. Menu: edit, make default, delete. */
export function AddressList({ initial }: { initial: Address[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [menu, setMenu] = useState<string | null>(null);
  const [error, setError] = useState('');

  const act = async (fn: () => Promise<unknown>) => {
    setMenu(null);
    setError('');
    try {
      await fn();
      setItems(await me<Address[]>('GET', 'addresses'));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'انجام نشد.');
    }
  };

  if (!items.length) {
    return <EmptyState art="addresses" title="هنوز آدرسی ثبت نکرده‌اید!" text="می‌توانید با افزودن آدرس جدید، اطلاعات محل تحویل سفارش‌های خود را ذخیره کنید تا در خریدهای بعدی به‌راحتی از آن استفاده کنید." />;
  }

  return (
    <>
      {error ? <p role="alert" className="mt-3 text-sm text-danger">{error}</p> : null}
      <ul className="mt-4 grid gap-3 lg:grid-cols-2">
        {items.map((a) => (
          <li key={a.id} className={cx('relative rounded-md border p-3', a.is_default ? 'border-primary' : 'border-border')}>
            <div className="flex items-center gap-2">
              <IconPin size={18} className="text-primary" />
              <h2 className="flex-1 font-bold text-text">{a.title || a.city}</h2>
              {a.is_default ? <span className="rounded-full bg-primary-subtle px-2 text-[11px] leading-5 text-primary-on-subtle">پیش‌فرض</span> : null}
              <button type="button" aria-label={`گزینه‌های آدرس ${a.title ?? ''}`} aria-expanded={menu === a.id} onClick={() => setMenu(menu === a.id ? null : a.id)} className="inline-flex size-9 items-center justify-center rounded-sm hover:bg-surface-muted">
                <IconMore size={20} />
              </button>
            </div>
            <p className="mt-2 text-xs leading-6 text-text-muted">{faDigits(a.full_line)}</p>
            {a.recipient_name ? <p className="text-xs text-text-subtle">تحویل گیرنده: {a.recipient_name}</p> : null}
            {a.is_default && a.lat != null && a.lng != null ? <MapPreview lat={a.lat} lng={a.lng} className="mt-3 h-28 border border-border" /> : null}
            {menu === a.id ? (
              <div role="menu" className="absolute end-3 top-12 z-10 w-44 overflow-hidden rounded-sm border border-border bg-surface shadow-md">
                <Link role="menuitem" href={`/my-account/addresses/${a.id}/`} className="block px-3 py-2.5 text-sm hover:bg-surface-muted">ویرایش</Link>
                {!a.is_default ? <button role="menuitem" type="button" onClick={() => act(() => me('PATCH', `addresses/${a.id}`, { is_default: true }))} className="block w-full px-3 py-2.5 text-start text-sm hover:bg-surface-muted">انتخاب به‌عنوان پیش‌فرض</button> : null}
                <button role="menuitem" type="button" onClick={() => { if (confirm('این آدرس حذف شود؟')) void act(() => me('DELETE', `addresses/${a.id}`)); }} className="block w-full px-3 py-2.5 text-start text-sm text-danger hover:bg-danger-subtle">حذف</button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}
