import type { Metadata } from 'next';
import { BlogCategoryPage, categoryMetadata } from '@/features/blog/routes';

/** /blog/category/{parent}/{child}/ and their /page/N/ (WordPress keeps the parent chain in the URL). */
type Props = { params: Promise<{ path: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata((await params).path);
}

export default async function Page({ params }: Props) {
  return <BlogCategoryPage raw={(await params).path} />;
}
