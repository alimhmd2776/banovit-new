import type { Metadata } from 'next';
import { BrandPage, brandMetadata, type SearchParams } from '@/features/plp/routes';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  return brandMetadata(slug, undefined, sp);
}

export default async function Page({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  return <BrandPage slug={slug} sp={sp} />;
}
