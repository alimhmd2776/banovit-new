import type { Metadata } from 'next';
import { TagPage, tagMetadata, type SearchParams } from '@/features/plp/routes';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  return tagMetadata(slug, undefined, sp);
}

export default async function Page({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  return <TagPage slug={slug} sp={sp} />;
}
