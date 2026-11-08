import type { Metadata } from 'next';
import { BlogAuthorPage, authorMetadata } from '@/features/blog/routes';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return authorMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  return <BlogAuthorPage slug={(await params).slug} />;
}
