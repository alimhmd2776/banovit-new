import type { TicketSummary } from '@banovit/api-client';
import { IconPhone } from '@banovit/ui';
import { AppBar, appBarButton } from '@/features/account/AppBar';
import { EmptyState } from '@/features/account/EmptyState';
import { SupportHelp } from '@/features/account/SupportHelp';
import { Tabs } from '@/features/account/Tabs';
import { TicketList } from '@/features/account/TicketList';
import { accountGet, qs } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';
import { phoneDisplay } from '@/features/account/format';
import { supportSettings } from '@/features/account/supportTopics';

export const metadata = { title: 'پشتیبانی بانویت', alternates: { canonical: '/my-account/support/' } };

type Tab = 'help' | 'in_review' | 'reviewed';

/** «پشتیبانی بانویت» (designs 28, 35–38): help topics + the customer's tickets in two tabs. */
export default async function SupportPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const t = (await searchParams).tab;
  const tab: Tab = t === 'in_review' || t === 'reviewed' ? t : 'help';
  const self = `/my-account/support/${qs({ tab: tab === 'help' ? undefined : tab })}`;
  await requireCustomer(self);
  const [support, res] = await Promise.all([
    supportSettings(),
    accountGet<{ data: TicketSummary[]; meta: { counts: Record<'in_review' | 'reviewed', number> } }>(
    `/tickets${qs({ tab: tab === 'help' ? 'in_review' : tab })}`,
      self,
    ),
  ]);

  return (
    <>
      <AppBar
        title="پشتیبانی بانویت"
        actions={
          support?.phone ? (
            <a href={`tel:${support.phone}`} aria-label={`تماس با پشتیبانی ${phoneDisplay(support.phone)}`} className={appBarButton}>
              <IconPhone size={20} />
            </a>
          ) : null
        }
      >
        <Tabs
          label="بخش پشتیبانی"
          active={tab}
          items={[
            { key: 'help', label: 'پشتیبانی', href: '/my-account/support/' },
            { key: 'in_review', label: 'درحال بررسی', href: '/my-account/support/?tab=in_review', count: res.meta.counts.in_review },
            { key: 'reviewed', label: 'بررسی شده', href: '/my-account/support/?tab=reviewed', count: res.meta.counts.reviewed },
          ]}
        />
      </AppBar>
      {tab === 'help' ? (
        <SupportHelp topics={support?.topics ?? []} heading={support?.heading ?? null} />
      ) : res.data.length ? (
        <TicketList items={res.data} />
      ) : (
        <EmptyState
          art="tickets"
          title={tab === 'in_review' ? 'تیکتی در حال بررسی نیست!' : 'هنوز تیکتی بررسی نشده است!'}
          text="برای ثبت درخواست جدید، از بخش پشتیبانی موضوع خود را انتخاب کنید."
          action={{ label: 'ثبت درخواست', href: '/my-account/support/' }}
        />
      )}
    </>
  );
}
