import type { Metadata } from 'next';
import { ShopPage, shopMetadata, type SearchParams } from '@/features/plp/routes';

type Props = { params: Promise<{ n: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ n }, sp] = await Promise.all([params, searchParams]);
  return shopMetadata(n, sp);
}

export default async function Page({ params, searchParams }: Props) {
  const [{ n }, sp] = await Promise.all([params, searchParams]);
  return <ShopPage pageParam={n} sp={sp} />;
}
