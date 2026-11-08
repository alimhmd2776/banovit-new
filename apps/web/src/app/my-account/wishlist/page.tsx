import type { ProductCard as Card } from '@banovit/api-client';
import { ProductCard } from '@banovit/ui';
import { AppBar } from '@/features/account/AppBar';
import { WishlistView } from '@/features/account/WishlistView';
import { accountGet, qs } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'علاقه‌مندی ها', alternates: { canonical: '/my-account/wishlist/' } };

export default async function WishlistPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const sort = ['price_asc', 'price_desc', 'discount'].includes((await searchParams).sort ?? '') ? (await searchParams).sort! : 'newest';
  await requireCustomer('/my-account/wishlist/');
  const res = await accountGet<{ data: Card[]; meta: { notify: boolean } }>(`/wishlist${qs({ sort: sort === 'newest' ? undefined : sort })}`, '/my-account/wishlist/');
  return (
    <>
      <AppBar title="علاقه‌مندی ها" />
      <WishlistView sort={sort} notify={res.meta.notify} products={res.data} cards={res.data.map((p) => <ProductCard key={p.slug} product={p} />)} />
    </>
  );
}
