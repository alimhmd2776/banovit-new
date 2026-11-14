import type { ReactNode } from 'react';
import { ensureSeller } from '@/features/plp/guards';

/** Existence check before the loading skeleton streams, so a missing page is a real 404 (see features/plp/guards.ts). */
export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  await ensureSeller((await params).slug);
  return children;
}
