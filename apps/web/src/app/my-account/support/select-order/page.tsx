import { redirect } from 'next/navigation';
import type { OrderSummary } from '@banovit/api-client';
import { AppBar } from '@/features/account/AppBar';
import { EmptyState } from '@/features/account/EmptyState';
import { OrderPickRow } from '@/features/account/OrderPickRow';
import { supportTopic } from '@/features/account/supportTopics';
import { accountGet, qs } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'انتخاب سفارش' };

type List = { data: OrderSummary[] };

/** «انتخاب سفارش» (design 31): recent orders from every tab, newest first. */
export default async function SelectOrderPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const topic = supportTopic((await searchParams).topic);
  if (!topic) redirect('/my-account/support/');
  const self = `/my-account/support/select-order/?topic=${topic.key}`;
  await requireCustomer(self);
  const lists = await Promise.all(
    (['current', 'delivered', 'cancelled'] as const).map((tab) => accountGet<List>(`/orders${qs({ tab, per_page: 20 })}`, self)),
  );
  const orders = lists
    .flatMap((l) => l.data)
    .sort((a, b) => (b.ordered_at ?? '').localeCompare(a.ordered_at ?? ''))
    .slice(0, 30);
  return (
    <>
      <AppBar title="انتخاب سفارش" backHref={`/my-account/support/topics/${topic.key}/`} />
      {orders.length ? (
        <ul>
          {orders.map((o) => (
            <li key={o.number} className="border-b border-border">
              <OrderPickRow order={o} href={`/my-account/support/new/?topic=${topic.key}&order=${encodeURIComponent(o.number)}`} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState art="orders" title="هنوز سفارشی ثبت نکرده‌اید!" text="بدون انتخاب سفارش هم می‌توانید درخواست خود را ثبت کنید.">
          <a href={`/my-account/support/new/?topic=${topic.key}`} className="mt-5 inline-flex h-10 items-center rounded-sm bg-primary px-5 text-sm font-bold text-primary-on hover:bg-primary-hover">
            ثبت درخواست
          </a>
        </EmptyState>
      )}
    </>
  );
}
