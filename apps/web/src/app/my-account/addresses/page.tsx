import Link from 'next/link';
import type { CustomerAddress } from '@banovit/api-client';
import { AddressList } from '@/features/account/AddressList';
import { AppBar } from '@/features/account/AppBar';
import { accountGet } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'آدرس ها', alternates: { canonical: '/my-account/addresses/' } };

export default async function AddressesPage() {
  await requireCustomer('/my-account/addresses/');
  const { data } = await accountGet<{ data: CustomerAddress[] }>('/addresses', '/my-account/addresses/');
  return (
    <>
      <AppBar title="آدرس ها" />
      <AddressList initial={data} />
      <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height)+20px)] z-sticky px-4 lg:static lg:mt-6 lg:px-0">
        <Link href="/my-account/addresses/new/" className="flex h-14 w-full items-center justify-center rounded-md bg-primary text-base font-bold text-primary-on shadow-md hover:bg-primary-hover lg:h-12 lg:max-w-xs lg:shadow-none">
          افزودن آدرس جدید
        </Link>
      </div>
      <div className="h-24 lg:hidden" />
    </>
  );
}
