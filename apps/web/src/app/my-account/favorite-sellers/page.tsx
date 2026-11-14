import type { SellerCard } from '@banovit/api-client';
import { AppBar } from '@/features/account/AppBar';
import { FavoriteSellersView } from '@/features/account/FavoriteSellersView';
import { accountGet } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'فروشگاه‌های محبوب', alternates: { canonical: '/my-account/favorite-sellers/' } };

/** «فروشگاه‌های محبوب» — sellers the customer liked with the heart on /seller/{slug}/. */
export default async function FavoriteSellersPage() {
  await requireCustomer('/my-account/favorite-sellers/');
  const res = await accountGet<{ data: (SellerCard & { liked_at: string | null })[] }>('/seller-likes', '/my-account/favorite-sellers/');
  return (
    <>
      <AppBar title="فروشگاه‌های محبوب" />
      <FavoriteSellersView sellers={res.data} />
    </>
  );
}
