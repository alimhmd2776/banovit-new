import type { Metadata } from 'next';
import { ShopPage, shopMetadata, type SearchParams } from '@/features/plp/routes';

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return shopMetadata(undefined, await searchParams);
}

export default async function Page({ searchParams }: Props) {
  return <ShopPage sp={await searchParams} />;
}
