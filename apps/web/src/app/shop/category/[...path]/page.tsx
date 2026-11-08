import type { Metadata } from 'next';
import { CategoryPage, categoryMetadata, type SearchParams } from '@/features/plp/routes';

type Props = { params: Promise<{ path: string[] }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ path }, sp] = await Promise.all([params, searchParams]);
  return categoryMetadata(path, sp);
}

export default async function Page({ params, searchParams }: Props) {
  const [{ path }, sp] = await Promise.all([params, searchParams]);
  return <CategoryPage segments={path} sp={sp} />;
}
