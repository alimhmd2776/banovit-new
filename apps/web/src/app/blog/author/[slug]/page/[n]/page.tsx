import type { Metadata } from 'next';
import { BlogAuthorPage, authorMetadata } from '@/features/blog/routes';

type Props = { params: Promise<{ slug: string; n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, n } = await params;
  return authorMetadata(slug, n);
}

export default async function Page({ params }: Props) {
  const { slug, n } = await params;
  return <BlogAuthorPage slug={slug} pageParam={n} />;
}
