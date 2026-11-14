import type { Metadata } from 'next';
import type { SearchParams } from '@/features/plp/routes';
import { SellerPage, sellerMetadata } from '@/features/sellers/routes';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  return sellerMetadata(slug, undefined, sp);
}

export default async function Page({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  return <SellerPage slug={slug} sp={sp} />;
}
