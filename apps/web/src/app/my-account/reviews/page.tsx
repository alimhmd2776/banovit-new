import Link from 'next/link';
import type { MyReview } from '@banovit/api-client';
import { faDigits, IconSearch } from '@banovit/ui';
import { AppBar, appBarButton } from '@/features/account/AppBar';
import { EmptyState } from '@/features/account/EmptyState';
import { ReviewCard } from '@/features/account/ReviewCard';
import { SearchBar } from '@/features/account/SearchBar';
import { accountGet, qs } from '@/lib/account/api';
import { requireCustomer } from '@/lib/auth/session';

export const metadata = { title: 'دیدگاه های من', alternates: { canonical: '/my-account/reviews/' } };

/** «دیدگاه های من» (designs 15–20). */
export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ q?: string; search?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const customer = await requireCustomer('/my-account/reviews/');
  const { data } = await accountGet<{ data: MyReview[] }>(`/reviews${qs({ q })}`, '/my-account/reviews/');
  const searching = q !== '' || sp.search === '1';
  return (
    <>
      {searching ? (
        <SearchBar basePath="/my-account/reviews/" initial={q} placeholder="جستجو در دیدگاه‌ها" label="جستجو در دیدگاه های من" />
      ) : (
        <AppBar
          title="دیدگاه های من"
          subtitle={data.length ? `${faDigits(data.length)} عدد دیدگاه` : undefined}
          actions={<Link href="/my-account/reviews/?search=1" aria-label="جستجو" className={appBarButton}><IconSearch size={20} /></Link>}
        />
      )}
      {data.length ? (
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {data.map((r) => <li key={r.id}><ReviewCard review={r} name={customer.name ?? ''} /></li>)}
        </ul>
      ) : q ? (
        <EmptyState art="search" title={`نتیجه‌ای با عبارت «${q}» یافت نشد.`} />
      ) : (
        <EmptyState art="reviews" title="هنوز دیدگاهی ثبت نکرده‌اید!" text="می‌توانید پس از خرید، تجربه و نظر خود را درباره محصولات با دیگران به اشتراک بگذارید." />
      )}
    </>
  );
}
