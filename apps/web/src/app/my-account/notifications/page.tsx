import type { CustomerNotification } from '@banovit/api-client';
import { AppBar } from '@/features/account/AppBar';
import { ClearNotificationsButton } from '@/features/account/ClearNotificationsButton';
import { NotificationsView } from '@/features/account/NotificationsView';
import { Tabs } from '@/features/account/Tabs';
import { accountGet, qs } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'اعلانات من', alternates: { canonical: '/my-account/notifications/' } };

const CATS = [
  { key: 'all', label: 'همه پیام' },
  { key: 'orders', label: 'سفارشات' },
  { key: 'products', label: 'محصولات' },
  { key: 'support', label: 'پشتیبانی' },
] as const;

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const c = (await searchParams).category;
  const category = c === 'orders' || c === 'products' || c === 'support' ? c : null;
  await requireCustomer('/my-account/notifications/');
  const res = await accountGet<{ data: CustomerNotification[]; meta: { unread: Record<string, number> } }>(`/notifications${qs({ category })}`, '/my-account/notifications/');
  return (
    <>
      <AppBar title="اعلانات من" actions={<ClearNotificationsButton disabled={!res.data.length} />}>
        <Tabs
          label="دسته اعلان"
          active={category ?? 'all'}
          items={CATS.map((t) => ({
            key: t.key,
            label: t.label,
            href: t.key === 'all' ? '/my-account/notifications/' : `/my-account/notifications/?category=${t.key}`,
            count: t.key === 'all' ? undefined : res.meta.unread[t.key] ?? 0,
          }))}
        />
      </AppBar>
      <NotificationsView items={res.data} category={category} />
    </>
  );
}
