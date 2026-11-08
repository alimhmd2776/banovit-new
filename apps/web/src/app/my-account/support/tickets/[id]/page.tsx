import type { TicketDetail } from '@banovit/api-client';
import { faDigits } from '@banovit/ui';
import { AppBar } from '@/features/account/AppBar';
import { TicketChat } from '@/features/account/TicketChat';
import { accountGet } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'تیکت پشتیبانی' };

/** Ticket conversation (design 39). */
export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const self = `/my-account/support/tickets/${encodeURIComponent(id)}/`;
  await requireCustomer(self);
  const { data } = await accountGet<{ data: TicketDetail }>(`/tickets/${encodeURIComponent(id)}`, self);
  const backTab = data.status === 'in_review' ? 'in_review' : 'reviewed';
  return (
    <>
      <AppBar
        title={data.subject}
        subtitle={`شناسه تیکت: ${faDigits(data.number)}${data.order_number ? ` · سفارش ${faDigits(data.order_number)}` : ''} · ${data.status_label}`}
        backHref={`/my-account/support/?tab=${backTab}`}
      />
      <TicketChat ticket={data} />
    </>
  );
}
