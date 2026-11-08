import type { Metadata } from 'next';
import { BlogTagPage, tagMetadata } from '@/features/blog/routes';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return tagMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  return <BlogTagPage slug={(await params).slug} />;
}
