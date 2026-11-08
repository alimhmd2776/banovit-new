import { notFound } from 'next/navigation';
import type { CustomerAddress } from '@banovit/api-client';
import { AddressEditor } from '@/features/account/AddressEditor';
import { AppBar } from '@/features/account/AppBar';
import { accountGet } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'ویرایش آدرس' };

export default async function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const self = `/my-account/addresses/${id}/`;
  await requireCustomer(self);
  const { data } = await accountGet<{ data: CustomerAddress[] }>('/addresses', self);
  const address = data.find((a) => a.id === id);
  if (!address) notFound();
  return (
    <>
      <AppBar title="ویرایش آدرس ها" backHref="/my-account/addresses/" />
      <div className="pt-4">
        <AddressEditor address={address} back="/my-account/addresses/" />
      </div>
    </>
  );
}
