import type { ReactNode } from 'react';
import { ensureCategory } from '@/features/plp/guards';

/** Existence check before the loading skeleton streams, so a missing page is a real 404 (see features/plp/guards.ts). */
export default async function Layout({ children, params }: { children: ReactNode; params: Promise<{ path: string[] }> }) {
  await ensureCategory((await params).path);
  return children;
}
