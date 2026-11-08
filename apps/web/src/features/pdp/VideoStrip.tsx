'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { ProductDetail } from '@banovit/api-client';
import { BottomSheet, faDigits } from '@banovit/ui';

type Video = ProductDetail['videos'][number];

/** YouTube / Vimeo page URL -> embeddable player URL; null for a direct file. */
export function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return null;
}

/** Product videos (woodmart on live): poster tiles with a play mark; the player opens in a sheet. */
export function VideoStrip({ videos, name }: { videos: Video[]; name: string }) {
  const [open, setOpen] = useState<Video | null>(null);
  const embed = open ? embedUrl(open.video_url) : null;

  return (
    <>
      <ul className="mt-3 flex gap-2 overflow-x-auto scrollbar-none" aria-label={`ویدیوهای ${name}`}>
        {videos.map((v, i) => (
          <li key={v.video_url}>
            <button
              type="button"
              onClick={() => setOpen(v)}
              aria-label={`پخش ویدیو ${faDigits(i + 1)}`}
              className="relative block size-20 overflow-hidden rounded-sm border border-border bg-surface-muted hover:border-border-strong"
            >
              {v.poster ? <Image src={v.poster.url} alt="" fill sizes="80px" className="object-cover" /> : null}
              <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                <svg viewBox="0 0 24 24" width={28} height={28} aria-hidden="true" className="fill-white drop-shadow">
                  <path d="M8 5.5v13a.5.5 0 0 0 .77.42l10-6.5a.5.5 0 0 0 0-.84l-10-6.5A.5.5 0 0 0 8 5.5Z" />
                </svg>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <BottomSheet open={!!open} onClose={() => setOpen(null)} title="ویدیو محصول">
        {open ? (
          <div className="px-4 pb-4">
            <div className="relative aspect-video overflow-hidden rounded-md bg-black">
              {embed ? (
                <iframe src={embed} title={name} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="absolute inset-0 size-full" />
              ) : (
                <video src={open.video_url} poster={open.poster?.url} controls autoPlay playsInline className="absolute inset-0 size-full object-contain" />
              )}
            </div>
          </div>
        ) : null}
      </BottomSheet>
    </>
  );
}
