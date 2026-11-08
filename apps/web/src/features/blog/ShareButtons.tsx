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

/** «اشتراک گذاری:» row under the author box. */
export function ShareBar({ url, title, instagram }: { url: string; title: string; instagram?: string }) {
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
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2">
      <p className="text-sm font-bold text-text">اشتراک گذاری:</p>
      <ul className="flex items-center divide-x divide-x-reverse divide-border">
        <li className="px-1">
          <button type="button" onClick={copy} className={item} aria-label={copied ? 'لینک کپی شد' : 'کپی لینک مقاله'}>
            {copied ? <IconCheck size={20} className="text-success" /> : <IconLink size={20} />}
          </button>
        </li>
        {instagram ? (
          <li className="px-1">
            <a href={instagram} target="_blank" rel="noopener noreferrer" className={item} aria-label="اینستاگرام بانویت">
              <IconInstagram size={20} />
            </a>
          </li>
        ) : null}
        <li className="px-1">
          <a href={`https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`} target="_blank" rel="noopener noreferrer" className={item} aria-label="اشتراک در تلگرام">
            <IconTelegram size={20} />
          </a>
        </li>
        <li className="px-1">
          <a href={`https://wa.me/?text=${enc(`${title}\n${url}`)}`} target="_blank" rel="noopener noreferrer" className={item} aria-label="اشتراک در واتس‌اپ">
            <IconWhatsapp size={20} />
          </a>
        </li>
      </ul>
    </div>
  );
}
