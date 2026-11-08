import type { Metadata } from 'next';
import type { AccountSummary } from '@banovit/api-client';
import { AccountShell } from '@/features/account/AccountShell';
import { accountGet } from '@/lib/account/api';
import { getCustomer } from '@/lib/auth/session';

// Private area: never indexed, never cached (same as WooCommerce /my-account/).
export const metadata: Metadata = {
  title: { default: 'حساب کاربری', template: '%s - حساب کاربری بانویت' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCustomer();
  // Not signed in: each page redirects to /login/ with its own path.
  if (!customer) return <>{children}</>;
  const summary = await accountGet<{ data: AccountSummary }>('/summary', '/my-account/').then((r) => r.data).catch(() => null);
  return (
    <AccountShell name={customer.name ?? ''} phone={customer.phone} unread={summary?.unread_notifications ?? 0}>
      {children}
    </AccountShell>
  );
}
