import type { Metadata } from 'next';
import { BlogIndexPage, blogIndexMetadata } from '@/features/blog/routes';

type Props = { params: Promise<{ n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return blogIndexMetadata((await params).n, {});
}

export default async function Page({ params }: Props) {
  return <BlogIndexPage pageParam={(await params).n} sp={{}} />;
}
