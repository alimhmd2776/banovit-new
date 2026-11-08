import { redirect } from 'next/navigation';
import type { AccountOrderDetail } from '@banovit/api-client';
import { AppBar } from '@/features/account/AppBar';
import { OrderPickRow } from '@/features/account/OrderPickRow';
import { ReportForm } from '@/features/account/ReportForm';
import { supportTopic } from '@/features/account/supportTopics';
import { accountGet, qs } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'ثبت گزارش' };

/** Report form (designs 32–34). */
export default async function NewTicketPage({ searchParams }: { searchParams: Promise<{ topic?: string; order?: string }> }) {
  const sp = await searchParams;
  const topic = supportTopic(sp.topic);
  if (!topic) redirect('/my-account/support/');
  const orderNumber = sp.order?.trim() || null;
  const self = `/my-account/support/new/${qs({ topic: topic.key, order: orderNumber ?? undefined })}`;
  await requireCustomer(self);
  const order = orderNumber ? (await accountGet<{ data: AccountOrderDetail }>(`/orders/${encodeURIComponent(orderNumber)}`, self)).data : null;
  const back = topic.needsOrder ? `/my-account/support/select-order/?topic=${topic.key}` : `/my-account/support/topics/${topic.key}/`;
  return (
    <>
      <AppBar title={topic.title} backHref={back} />
      <ReportForm topic={topic.key} orderNumber={order?.number ?? null}>
        {order ? (
          <div className="border-b border-border">
            <OrderPickRow order={order} showTotal={false} />
          </div>
        ) : null}
      </ReportForm>
    </>
  );
}
