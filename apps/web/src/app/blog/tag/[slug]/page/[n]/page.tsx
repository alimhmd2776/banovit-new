import type { Metadata } from 'next';
import { BlogTagPage, tagMetadata } from '@/features/blog/routes';

type Props = { params: Promise<{ slug: string; n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, n } = await params;
  return tagMetadata(slug, n);
}

export default async function Page({ params }: Props) {
  const { slug, n } = await params;
  return <BlogTagPage slug={slug} pageParam={n} />;
}
