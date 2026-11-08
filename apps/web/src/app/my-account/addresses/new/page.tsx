import { AddressEditor } from '@/features/account/AddressEditor';
import { AppBar } from '@/features/account/AppBar';
import { safeRedirect } from '@/lib/auth/redirect';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'افزودن آدرس' };

export default async function NewAddressPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const back = safeRedirect((await searchParams).redirect, '/my-account/addresses/');
  await requireCustomer('/my-account/addresses/new/');
  return (
    <>
      <AppBar title="افزودن آدرس" backHref={back} />
      <div className="pt-4">
        <AddressEditor back={back} />
      </div>
    </>
  );
}
