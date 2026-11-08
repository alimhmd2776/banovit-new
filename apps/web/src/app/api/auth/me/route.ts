import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/auth/session';

/** For client components (header badge etc.): the signed-in customer or null. Never cached. */
export async function GET() {
  const customer = await getCustomer();
  return NextResponse.json({ data: customer }, { headers: { 'Cache-Control': 'private, no-store' } });
}
