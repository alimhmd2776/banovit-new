'use client';

import { useState } from 'react';
import { IconCheck, IconInstagram, IconLink, IconShare, IconTelegram, IconWhatsapp } from '@banovit/ui';

/** Header share button: native share sheet, falls back to copying the link. */
export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ url, title });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* dismissed */
    }
  };
  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? 'لینک کپی شد' : 'اشتراک‌گذاری'}
      className="inline-flex size-10 items-center justify-center rounded-md text-text hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-focus"
    >
      {copied ? <IconCheck size={20} className="text-success" /> : <IconShare size={20} />}
    </button>
  );
}

type ShareItem = { type: 'copy' | 'telegram' | 'whatsapp' | 'instagram' | 'aparat'; url: string | null };

function IconAparat({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 8.5v7l6-3.5z" fill="currentColor" />
    </svg>
  );
}

const SHARE_META = {
  copy: { icon: IconLink, label: 'کپی لینک مقاله' },
  telegram: { icon: IconTelegram, label: 'تلگرام' },
  whatsapp: { icon: IconWhatsapp, label: 'واتس‌اپ' },
  instagram: { icon: IconInstagram, label: 'اینستاگرام بانویت' },
  aparat: { icon: IconAparat, label: 'آپارات بانویت' },
} as const;

/** «اشتراک گذاری:» row under the author box; items and title from the panel (a set url = profile link, empty = share this post). */
export function ShareBar({ url, title, heading, items }: { url: string; title: string; heading: string; items: ShareItem[] }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const item = 'inline-flex size-9 items-center justify-center rounded-full text-text-muted hover:bg-surface-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-focus';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };
  const shareHref = (t: ShareItem['type']) =>
    t === 'telegram' ? `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}` : t === 'whatsapp' ? `https://wa.me/?text=${enc(`${title}\n${url}`)}` : null;
  if (items.length === 0) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2">
      <p className="text-sm font-bold text-text">{heading}</p>
      <ul className="flex items-center divide-x divide-x-reverse divide-border">
        {items.map((it, i) => {
          const meta = SHARE_META[it.type];
          if (!meta) return null;
          const Icon = meta.icon;
          if (it.type === 'copy' && !it.url) {
            return (
              <li key={i} className="px-1">
                <button type="button" onClick={copy} className={item} aria-label={copied ? 'لینک کپی شد' : meta.label}>
                  {copied ? <IconCheck size={20} className="text-success" /> : <Icon size={20} />}
                </button>
              </li>
            );
          }
          const href = it.url || shareHref(it.type);
          if (!href) return null;
          return (
            <li key={i} className="px-1">
              <a href={href} target="_blank" rel="noopener noreferrer" className={item} aria-label={it.url ? meta.label : `اشتراک در ${meta.label}`}>
                <Icon size={20} />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
