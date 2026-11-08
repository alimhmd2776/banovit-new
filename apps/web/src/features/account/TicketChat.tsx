'use client';

import { useNavRouter as useRouter } from '@/lib/use-nav-router';
import { useEffect, useRef, useState } from 'react';
import type { TicketDetail, TicketMessage } from '@banovit/api-client';
import { cx, IconChevronLeft } from '@banovit/ui';
import { AccountError, me } from './client';
import { attachmentUrl, clock, jalaliLong } from './format';
import { AddImageButton, Thumbnails, useImageFiles } from './ImagePicker';

/** Ticket conversation (design 39): staff bubbles at the start, customer bubbles at the end, composer with photos. */
export function TicketChat({ ticket }: { ticket: TicketDetail }) {
  const router = useRouter();
  const [messages, setMessages] = useState<TicketMessage[]>(ticket.messages);
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { previews, add, remove, max: MAX_IMAGES } = useImageFiles(files, setFiles, setError);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Braces matter: scrollIntoView can return a Promise in newer Chromium, and an effect's return value is its cleanup.
    end.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() && !files.length) return;
    const fd = new FormData();
    if (body.trim()) fd.set('body', body.trim());
    files.forEach((f) => fd.append('images[]', f));
    setBusy(true);
    setError(null);
    try {
      const m = await me<TicketMessage>('POST', `tickets/${ticket.id}/messages`, fd);
      setMessages((l) => [...l, m]);
      setBody('');
      setFiles([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof AccountError ? err.message : 'ارسال نشد. دوباره تلاش کنید.');
    } finally {
      setBusy(false);
    }
  };

  let lastDay = '';
  return (
    <div className="flex min-h-[calc(100dvh-90px)] flex-col lg:min-h-[560px]">
      <ol className="flex-1 space-y-4 py-4">
        {messages.map((m) => {
          const day = jalaliLong(m.created_at);
          const sep = day && day !== lastDay ? day : null;
          lastDay = day || lastDay;
          const mine = m.author === 'customer';
          return (
            <li key={m.id}>
              {sep ? <p className="mb-3 text-center text-[11px] text-text-subtle">{sep}</p> : null}
              <div className={cx('flex flex-col', mine ? 'items-end' : 'items-start')}>
                {m.body ? (
                  <p
                    className={cx(
                      'max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-7 lg:max-w-[70%]',
                      mine ? 'rounded-ee-sm bg-primary text-primary-on' : 'rounded-es-sm bg-surface-muted text-text',
                    )}
                  >
                    {m.body}
                  </p>
                ) : null}
                {m.attachments.length ? (
                  <ul className="mt-1.5 flex max-w-[85%] flex-wrap gap-1.5">
                    {m.attachments.map((a, i) =>
                      a.url ? (
                        <li key={i}>
                          <a href={attachmentUrl(a.url)} target="_blank" rel="noreferrer" className="block size-20 overflow-hidden rounded-sm border border-border bg-surface">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={attachmentUrl(a.url)} alt={a.name ?? 'پیوست'} className="size-full object-cover" loading="lazy" />
                          </a>
                        </li>
                      ) : null,
                    )}
                  </ul>
                ) : null}
                <p className="mt-1 px-1 text-[11px] text-text-subtle">
                  {clock(m.created_at)}
                  {mine && m.is_read ? '، دیده شد' : ''}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <div ref={end} />

      {ticket.can_reply ? (
        <form onSubmit={send} className="sticky bottom-0 -mx-4 border-t border-border bg-surface px-4 py-3 lg:mx-0 lg:rounded-md lg:border">
          {previews.length ? (
            <ul className="mb-2 flex flex-wrap justify-end gap-1.5">
              <Thumbnails previews={previews} onRemove={remove} size="size-14" />
            </ul>
          ) : null}
          {error ? (
            <p className="mb-2 text-xs text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <AddImageButton onPick={add} disabled={files.length >= MAX_IMAGES} label="پیوست عکس" />
            <label className="flex-1">
              <span className="sr-only">متن پیام</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={1}
                maxLength={5000}
                placeholder="پیام خود را بنویسید…"
                className="max-h-32 min-h-11 w-full resize-none rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={busy || (!body.trim() && !files.length)}
              aria-label="ارسال پیام"
              aria-busy={busy}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-on hover:bg-primary-hover disabled:opacity-50"
            >
              {busy ? <span aria-hidden className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <IconChevronLeft size={22} />}
            </button>
          </div>
        </form>
      ) : (
        <p className="rounded-md bg-surface-muted p-3 text-center text-xs text-text-muted">این تیکت بسته شده است. برای موضوع جدید، از صفحه پشتیبانی گزارش تازه ثبت کنید.</p>
      )}
    </div>
  );
}
