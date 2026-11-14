import type { ReactNode } from 'react';
import { ensureBrand } from '@/features/plp/guards';

/** Existence check before the loading skeleton streams, so a missing page is a real 404 (see features/plp/guards.ts). */
export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  await ensureBrand(slug, n);
  return children;
}
