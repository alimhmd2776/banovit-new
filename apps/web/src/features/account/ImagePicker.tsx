'use client';

import { useEffect, useMemo } from 'react';
import { faDigits, IconClose, IconPlus } from '@banovit/ui';

export const MAX_IMAGES = 5;
const MAX_BYTES = 5 * 1024 * 1024;

/** Picks up to five images (≤ 5 MB each) and shows removable thumbnails (designs 33, 39). */
export function useImageFiles(files: File[], setFiles: (f: File[]) => void, onError: (m: string | null) => void) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  const add = (list: FileList | null) => {
    const picked = Array.from(list ?? []).filter((f) => f.type.startsWith('image/'));
    if (picked.some((f) => f.size > MAX_BYTES)) onError('حجم هر عکس حداکثر ۵ مگابایت است.');
    else onError(null);
    const next = [...files, ...picked.filter((f) => f.size <= MAX_BYTES)];
    if (next.length > MAX_IMAGES) onError(`حداکثر ${faDigits(MAX_IMAGES)} عکس می‌توانید بفرستید.`);
    setFiles(next.slice(0, MAX_IMAGES));
  };
  const remove = (i: number) => setFiles(files.filter((_, j) => j !== i));
  return { previews, add, remove };
}

export function Thumbnails({ previews, onRemove, size = 'size-16' }: { previews: string[]; onRemove: (i: number) => void; size?: string }) {
  return (
    <>
      {previews.map((src, i) => (
        <li key={src} className={`relative ${size} overflow-hidden rounded-sm border border-border bg-surface`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label={`حذف عکس ${faDigits(i + 1)}`}
            className="absolute inset-0 m-auto inline-flex size-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <IconClose size={16} />
          </button>
        </li>
      ))}
    </>
  );
}

export function AddImageButton({ onPick, disabled, label = 'افزودن عکس' }: { onPick: (l: FileList | null) => void; disabled?: boolean; label?: string }) {
  return (
    <label className={`inline-flex size-16 cursor-pointer items-center justify-center rounded-sm border border-dashed border-border-strong text-text-muted hover:bg-surface ${disabled ? 'pointer-events-none opacity-40' : ''}`}>
      <span className="sr-only">{label}</span>
      <IconPlus size={22} />
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          onPick(e.target.files);
          e.target.value = '';
        }}
      />
    </label>
  );
}
