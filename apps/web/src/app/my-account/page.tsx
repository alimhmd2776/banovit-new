import Link from 'next/link';
import type { AccountSummary } from '@banovit/api-client';
import { faDigits } from '@banovit/ui';
import { IconBell, IconEditBox, IconCube, IconHeadset } from '@/features/account/icons';
import { LogoutButton } from '@/features/account/LogoutButton';
import { MenuList } from '@/features/account/MenuList';
import { servicesNav, shoppingNav } from '@/features/account/nav';
import { phoneDisplay } from '@/features/account/format';
import { accountGet } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'پروفایل', alternates: { canonical: '/my-account/' } };

/** «پروفایل» dashboard (designs/account/01-dashboard-home). */
export default async function AccountHome() {
  const customer = await requireCustomer('/my-account/');
  const { data: s } = await accountGet<{ data: AccountSummary }>('/summary', '/my-account/');

  const notes = {
    orders: s.orders.current > 0 ? <span className="text-xs font-bold text-primary">{s.orders.current === 1 ? 'یک سفارش جاری' : `${faDigits(s.orders.current)} سفارش جاری`}</span> : null,
  };

  return (
    <>
      <header className="flex items-start gap-3 py-5 lg:pt-0">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-extrabold text-text">{customer.name || 'کاربر بانویت'}</h1>
          <p className="mt-1 text-xs text-text-muted" dir="ltr" style={{ textAlign: 'right' }}>{phoneDisplay(customer.phone)}</p>
        </div>
        <Link href="/my-account/notifications/" aria-label={s.unread_notifications ? `اعلانات (${faDigits(s.unread_notifications)} خوانده‌نشده)` : 'اعلانات'} className="relative inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface hover:bg-surface-muted">
          <IconBell size={22} />
          {s.unread_notifications > 0 ? <span className="absolute end-2 top-2 size-2 rounded-full bg-danger" /> : null}
        </Link>
        <Link href="/my-account/edit-account/" aria-label="ویرایش اطلاعات کاربری" className="inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface hover:bg-surface-muted">
          <IconEditBox size={22} />
        </Link>
      </header>

      {!s.identity_complete ? (
        <Link href="/my-account/edit-account/" className="mb-4 block rounded-md bg-warning-subtle px-4 py-3 text-xs leading-6 text-warning-on-subtle">
          احراز هویت شما تکمیل نیست. برای امنیت بیشتر حساب، اطلاعات شناسایی خود را ثبت کنید.
        </Link>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Link href="/my-account/orders/" className="flex h-24 flex-col items-center justify-center gap-2 rounded-md bg-surface-muted text-sm font-bold text-text hover:bg-primary-subtle">
          <IconCube size={34} className="text-warning" />
          سفارشات من
        </Link>
        <Link href="/my-account/support/" className="flex h-24 flex-col items-center justify-center gap-2 rounded-md bg-surface-muted text-sm font-bold text-text hover:bg-primary-subtle">
          <IconHeadset size={34} />
          پشتیبانی
        </Link>
      </div>

      <MenuList title="خرید و سفارش" items={shoppingNav} notes={notes} />
      <MenuList title="خدمات بانویت" items={servicesNav} />
      <div className="mt-4 border-t border-border pt-2 lg:hidden">
        <LogoutButton className="flex h-12 w-full items-center gap-3 text-sm font-bold text-danger" />
      </div>
    </>
  );
}
