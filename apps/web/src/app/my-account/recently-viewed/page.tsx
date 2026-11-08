import Link from 'next/link';
import type { ProductCard as Card } from '@banovit/api-client';
import { IconSearch, ProductCard } from '@banovit/ui';
import { AppBar, appBarButton } from '@/features/account/AppBar';
import { EmptyState } from '@/features/account/EmptyState';
import { SearchBar } from '@/features/account/SearchBar';
import { accountGet, qs } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'بازدید های اخیر', alternates: { canonical: '/my-account/recently-viewed/' } };

/** «بازدید های اخیر» (designs 12–14). Filled by the product page for signed-in customers. */
export default async function RecentlyViewedPage({ searchParams }: { searchParams: Promise<{ q?: string; search?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  await requireCustomer('/my-account/recently-viewed/');
  const { data } = await accountGet<{ data: Card[] }>(`/recently-viewed${qs({ q })}`, '/my-account/recently-viewed/');
  const searching = q !== '' || sp.search === '1';
  return (
    <>
      {searching ? (
        <SearchBar basePath="/my-account/recently-viewed/" initial={q} placeholder="جستجو در بازدیدها" label="جستجو در بازدید های اخیر" />
      ) : (
        <AppBar
          title="بازدید های اخیر"
          actions={data.length ? <Link href="/my-account/recently-viewed/?search=1" aria-label="جستجو" className={appBarButton}><IconSearch size={20} /></Link> : <span className={appBarButton} aria-hidden="true"><IconSearch size={20} className="text-text-subtle" /></span>}
        />
      )}
      {data.length ? (
        <ul className="divide-y divide-border lg:mt-2 lg:grid lg:grid-cols-3 lg:gap-4 lg:divide-y-0 xl:grid-cols-4">
          {data.map((p) => <li key={p.slug}><ProductCard product={p} /></li>)}
        </ul>
      ) : q ? (
        <EmptyState art="search" title={`نتیجه‌ای با عبارت «${q}» یافت نشد.`} />
      ) : (
        <EmptyState art="views" title="هنوز از محصولی بازدیدی نداشتی!" text="همین حالا وارد فروشگاه بانویت شوید و محصولات متنوع را مشاهده کنید." action={{ label: 'فروشگاه بانویت', href: '/shop/' }} />
      )}
    </>
  );
}
