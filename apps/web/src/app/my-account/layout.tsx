import type { Metadata } from 'next';
import type { AccountSummary } from '@banovit/api-client';
import { AccountShell } from '@/features/account/AccountShell';
import { AccountSettingsProvider } from '@/features/account/settings';
import { getAccountSettings } from '@/lib/api';
import { accountGet } from '@/lib/account/api';
import { getCustomer } from '@/lib/auth/session';

// Private area: never indexed, never cached (same as WooCommerce /my-account/).
export const metadata: Metadata = {
  title: { default: 'حساب کاربری', template: '%s - حساب کاربری بانویت' },
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const [customer, settings] = await Promise.all([getCustomer(), getAccountSettings().catch(() => null)]);
  // Not signed in: each page redirects to /login/ with its own path.
  if (!customer) return <AccountSettingsProvider value={settings}>{children}</AccountSettingsProvider>;
  const summary = await accountGet<{ data: AccountSummary }>('/summary', '/my-account/').then((r) => r.data).catch(() => null);
  return (
    <AccountSettingsProvider value={settings}>
      <AccountShell name={customer.name ?? ''} phone={customer.phone} unread={summary?.unread_notifications ?? 0}>
        {children}
      </AccountShell>
    </AccountSettingsProvider>
  );
}
