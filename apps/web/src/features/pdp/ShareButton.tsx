'use client';

import { useState } from 'react';
import { IconShare } from '@banovit/ui';

export function ShareButton({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = `${window.location.origin}${path}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* dismissed */
    }
  }
  return (
    <button type="button" onClick={share} className="relative flex size-10 items-center justify-center rounded-full text-text hover:bg-surface-muted" aria-label="اشتراک‌گذاری">
      <IconShare size={20} />
      {copied ? (
        <span role="status" className="absolute top-full mt-1 whitespace-nowrap rounded-xs bg-text px-2 py-1 text-[11px] text-primary-on">
          لینک کپی شد
        </span>
      ) : null}
    </button>
  );
}
