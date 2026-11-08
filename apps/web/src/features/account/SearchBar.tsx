'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconClose, IconSearch } from '@banovit/ui';
import { appBarButton } from './AppBar';

/**
 * Search mode of a list page (designs 07, 14, 17): the app bar turns into an
 * input + close button. Submits ?q= to the same page.
 */
export function SearchBar({ basePath, initial, placeholder, label }: { basePath: string; initial: string; placeholder: string; label: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  return (
    <form
      role="search"
      className="flex items-center gap-2 py-3"
      onSubmit={(e) => {
        e.preventDefault();
        const t = q.trim();
        router.replace(t ? `${basePath}?q=${encodeURIComponent(t)}` : basePath);
      }}
    >
      <label className="relative flex-1">
        <span className="sr-only">{label}</span>
        <input
          autoFocus
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          enterKeyHint="search"
          className="h-11 w-full rounded-md border border-primary bg-surface pe-10 ps-3 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary-subtle"
        />
        <IconSearch size={20} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-primary" />
      </label>
      <button type="button" aria-label="بستن جستجو" className={appBarButton} onClick={() => router.replace(basePath)}>
        <IconClose size={20} />
      </button>
    </form>
  );
}
