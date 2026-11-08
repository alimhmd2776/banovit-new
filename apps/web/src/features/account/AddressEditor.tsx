'use client';

import { useRouter } from 'next/navigation';
import type { CustomerAddress } from '@banovit/api-client';
import { AddressForm } from './AddressForm';

/** Page wrapper: save → back to the list (or ?redirect= target, e.g. checkout). */
export function AddressEditor({ address, back }: { address?: CustomerAddress; back: string }) {
  const router = useRouter();
  return (
    <AddressForm
      address={address}
      onSaved={() => {
        router.push(back);
        router.refresh();
      }}
    />
  );
}
