import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginFlow } from '@/features/auth/LoginFlow';
import { safeRedirect } from '@/lib/auth/redirect';
import { getCustomer } from '@/lib/auth/session';
import { getAuthSettings } from '@/lib/api';

export async function generateMetadata(): Promise<Metadata> {
  const { texts } = await getAuthSettings();
  return {
    title: texts.page_title,
    // Same as WordPress /login/: never indexed.
    robots: { index: false, follow: false },
    alternates: { canonical: '/login/' },
  };
}

export const dynamic = 'force-dynamic';

/**
 * /login/?redirect=/cart/
 * Mobile: full-screen like the designs (covers the site header and bottom nav).
 * Desktop: a centered card under the normal site header.
 */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string | string[] }> }) {
  const sp = await searchParams;
  const redirectTo = safeRedirect(Array.isArray(sp.redirect) ? sp.redirect[0] : sp.redirect, '/my-account/');

  const [customer, settings] = await Promise.all([getCustomer(), getAuthSettings()]);
  if (customer && !customer.needs_profile) redirect(redirectTo);

  return (
    <div className="fixed inset-0 z-modal overflow-y-auto bg-surface px-4 pb-10 lg:static lg:z-auto lg:flex lg:min-h-[calc(100dvh-var(--header-height)-2.25rem)] lg:items-start lg:justify-center lg:overflow-visible lg:bg-bg lg:py-16">
      <div className="mx-auto w-full max-w-[420px] lg:rounded-lg lg:border lg:border-border lg:bg-surface lg:px-8 lg:pb-10 lg:pt-4 lg:shadow-sm">
        <LoginFlow redirectTo={redirectTo} initialStep={customer?.needs_profile ? 'profile' : 'phone'} settings={settings} />
      </div>
    </div>
  );
}
