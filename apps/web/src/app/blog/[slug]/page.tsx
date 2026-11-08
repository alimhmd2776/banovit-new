import type { Metadata } from 'next';
import { BlogPostPage, postMetadata } from '@/features/blog/routes';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return postMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  return <BlogPostPage slug={(await params).slug} />;
}
