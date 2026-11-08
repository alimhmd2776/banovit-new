import type { Metadata } from 'next';
import { BlogIndexPage, blogIndexMetadata, type SearchParams } from '@/features/blog/routes';

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return blogIndexMetadata(undefined, await searchParams);
}

export default async function Page({ searchParams }: Props) {
  return <BlogIndexPage sp={await searchParams} />;
}
