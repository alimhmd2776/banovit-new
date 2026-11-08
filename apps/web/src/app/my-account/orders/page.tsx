import Link from 'next/link';
import type { OrderSummary, OrderTabCounts } from '@banovit/api-client';
import { faDigits, IconSearch } from '@banovit/ui';
import { AppBar, appBarButton } from '@/features/account/AppBar';
import { EmptyState } from '@/features/account/EmptyState';
import { OrderCard } from '@/features/account/OrderCard';
import { SearchBar } from '@/features/account/SearchBar';
import { Tabs } from '@/features/account/Tabs';
import { accountGet, qs } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'سفارش ها', alternates: { canonical: '/my-account/orders/' } };

type Tab = 'current' | 'delivered' | 'cancelled';
const TABS: { key: Tab; label: string }[] = [
  { key: 'current', label: 'جاری ها' },
  { key: 'delivered', label: 'تحویلی ها' },
  { key: 'cancelled', label: 'لغو ها' },
];

type Sp = Promise<{ tab?: string; q?: string; page?: string; search?: string }>;

/** «سفارش ها» (designs 04–08): tabs, search, paginated cards. Same URL as WooCommerce. */
export default async function OrdersPage({ searchParams }: { searchParams: Sp }) {
  const sp = await searchParams;
  const tab: Tab = (['current', 'delivered', 'cancelled'] as const).find((t) => t === sp.tab) ?? 'current';
  const q = (sp.q ?? '').trim();
  const searching = q !== '' || sp.search === '1';
  const page = Math.max(1, Number(sp.page) || 1);
  const self = `/my-account/orders/${qs({ tab: tab === 'current' ? undefined : tab, q })}`;
  await requireCustomer(self);

  const res = await accountGet<{ data: OrderSummary[]; meta: { total: number; per_page: number; counts: OrderTabCounts } }>(
    `/orders${qs({ tab, q, page, per_page: 10 })}`,
    self,
  );
  const total = res.meta.counts.current + res.meta.counts.delivered + res.meta.counts.cancelled;
  const pages = Math.ceil(res.meta.total / res.meta.per_page);

  return (
    <>
      {searching ? (
        <div className="sticky top-0 z-sticky -mx-4 bg-surface px-4 lg:static lg:mx-0 lg:px-0">
          <SearchBar basePath="/my-account/orders/" initial={q} placeholder="شماره سفارش یا نام کالا" label="جستجو در سفارش ها" />
        </div>
      ) : (
        <AppBar
          title="سفارش ها"
          subtitle={total > 20 ? `بیش از ${faDigits(20)} سفارش` : total ? `${faDigits(total)} سفارش` : undefined}
          actions={
            <Link href="/my-account/orders/?search=1" aria-label="جستجو در سفارش ها" className={appBarButton}>
              <IconSearch size={20} />
            </Link>
          }
        >
          <Tabs
            label="وضعیت سفارش"
            active={tab}
            items={TABS.map((t) => ({ ...t, count: res.meta.counts[t.key], href: t.key === 'current' ? '/my-account/orders/' : `/my-account/orders/?tab=${t.key}` }))}
          />
        </AppBar>
      )}

      {res.data.length ? (
        <ul className="mt-4 grid gap-3 xl:grid-cols-2">
          {res.data.map((o) => (
            <li key={o.number}>
              <OrderCard order={o} />
            </li>
          ))}
        </ul>
      ) : searching && q ? (
        <EmptyState art="search" title={`نتیجه‌ای با عبارت «${q}» یافت نشد.`} />
      ) : (
        <EmptyState
          art="orders"
          title="هنوز سفارشی ثبت نکرده‌اید!"
          text="می‌توانید با مراجعه به فروشگاه بانویت، محصولات موردنظر خود را انتخاب و خریداری کنید. پس از ثبت سفارش، اطلاعات و وضعیت آن در این بخش نمایش داده می‌شود."
          action={{ label: 'فروشگاه بانویت', href: '/shop/' }}
        />
      )}

      {pages > 1 ? (
        <nav aria-label="صفحه‌بندی" className="mt-6 flex items-center justify-center gap-3 text-sm">
          {page > 1 ? <Link className="rounded-sm border border-border px-4 py-2" href={`/my-account/orders/${qs({ tab: tab === 'current' ? undefined : tab, q, page: page - 1 })}`}>قبلی</Link> : null}
          <span className="text-text-muted">صفحه {faDigits(page)} از {faDigits(pages)}</span>
          {page < pages ? <Link className="rounded-sm border border-border px-4 py-2" href={`/my-account/orders/${qs({ tab: tab === 'current' ? undefined : tab, q, page: page + 1 })}`}>بعدی</Link> : null}
        </nav>
      ) : null}
    </>
  );
}
