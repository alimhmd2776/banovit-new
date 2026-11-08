'use client';

import { useState } from 'react';
import { IconLogout } from './icons';

/** «خروج از حساب»: BFF POST /api/auth/logout/ revokes the CMS token and clears the cookie. */
export function LogoutButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      data-busy={busy || undefined}
      className={className}
      onClick={async () => {
        setBusy(true);
        await fetch('/api/auth/logout/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', credentials: 'same-origin' }).catch(() => null);
        window.location.href = '/';
      }}
    >
      <IconLogout size={20} />
      {busy ? 'در حال خروج…' : 'خروج از حساب'}
    </button>
  );
}
