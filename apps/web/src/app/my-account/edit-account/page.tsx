import type { Profile } from '@banovit/api-client';
import { AppBar } from '@/features/account/AppBar';
import { ProfileView } from '@/features/account/ProfileView';
import { accountGet } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'اطلاعات حساب', alternates: { canonical: '/my-account/edit-account/' } };

/** «حساب کاربری بانویت» — same URL as WooCommerce «جزئیات حساب». */
export default async function EditAccountPage() {
  const customer = await requireCustomer('/my-account/edit-account/');
  const { data } = await accountGet<{ data: Profile }>('/profile', '/my-account/edit-account/');
  return (
    <>
      <AppBar title={<>حساب کاربری <span className="text-primary">بانویت</span></>} />
      <ProfileView customer={customer} profile={data} />
    </>
  );
}
