'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { CustomerNotification } from '@banovit/api-client';
import { cx } from '@banovit/ui';
import { me } from './client';
import { EmptyState } from './EmptyState';
import { relative } from './format';
import { IconBag, IconBell, IconHeadset } from './icons';

const HEADINGS = { orders: 'سفارشات', products: 'محصولات', support: 'پشتیبانی' } as const;

/** «اعلانات من» list (designs 26, 27). Opening the page marks what is shown as read. */
export function NotificationsView({ items, category }: { items: CustomerNotification[]; category: string | null }) {
  const router = useRouter();
  const [list, setList] = useState(items);
  useEffect(() => {
    const unread = items.filter((n) => !n.is_read).map((n) => n.id);
    if (unread.length) void me('POST', 'notifications/read', { ids: unread }).then(() => router.refresh()).catch(() => undefined);
  }, [items, router]);

  if (!list.length) return <EmptyState art="notifications" title="هیچ اعلانی برای نمایش نیست!" text="هیچ اعلاناتی در این صفحه برای نمایش به شما وجود ندارد" />;

  const groups = category ? [[category, list] as const] : (['orders', 'products', 'support'] as const).map((c) => [c, list.filter((n) => n.category === c)] as const).filter(([, l]) => l.length);
  return (
    <>
      {groups.map(([cat, rows]) => (
        <section key={cat} className="mt-4">
          {!category ? <h2 className="mb-1 text-sm font-bold text-text-muted">{HEADINGS[cat as keyof typeof HEADINGS]}</h2> : null}
          <ul>
            {rows.map((n) => (
              <li key={n.id} className="border-b border-border">
                <Row n={n} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <ClearButton category={category} onCleared={() => setList([])} />
    </>
  );
}

function Row({ n }: { n: CustomerNotification }) {
  const Icon = n.category === 'orders' ? IconBag : n.category === 'support' ? IconHeadset : IconBell;
  const body = (
    <div className="flex gap-3 py-4">
      <span className="relative size-12 shrink-0">
        {n.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={n.image_url} alt="" className="size-12 rounded-full border border-border object-cover" loading="lazy" />
        ) : (
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-surface-muted text-text-muted"><Icon size={22} /></span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cx('text-sm leading-7', n.is_read ? 'text-text-muted' : 'text-text')}>{n.title}{n.body ? ` ${n.body}` : ''}</p>
        <p className="mt-1 flex items-center gap-2 text-[11px] text-text-subtle">
          <span>{relative(n.created_at)}</span>
          <span aria-hidden="true">•</span>
          <span>{HEADINGS[n.category]}</span>
          {!n.is_read ? <span className="ms-auto font-bold text-primary">پیغام جدید</span> : null}
        </p>
      </div>
      {!n.is_read ? <span className="mt-5 size-2 shrink-0 rounded-full bg-primary" aria-label="خوانده‌نشده" /> : null}
    </div>
  );
  return n.url ? <Link href={n.url} className="block hover:bg-surface-muted">{body}</Link> : body;
}

function ClearButton({ category, onCleared }: { category: string | null; onCleared: () => void }) {
  return (
    <button
      type="button"
      id="clear-notifications"
      hidden
      onClick={async () => {
        if (!confirm('همه اعلان‌های این بخش حذف شوند؟')) return;
        await me('DELETE', `notifications${category ? `?category=${category}` : ''}`).catch(() => undefined);
        onCleared();
      }}
    />
  );
}
