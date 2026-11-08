import type { Metadata } from 'next';
import { ContentPageRoute, contentPageMetadata } from '@/features/pages/routes';

/**
 * Last-resort route: any URL not claimed by a more specific route is looked up
 * as a CMS content page (WordPress pages keep their exact URLs), else 404.
 */
type Props = { params: Promise<{ path: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  return contentPageMetadata(path);
}

export default async function Page({ params }: Props) {
  const { path } = await params;
  return <ContentPageRoute segments={path} />;
}
