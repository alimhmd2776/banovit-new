'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cx, faDigits, IconInfo } from '@banovit/ui';
import { siteConfig } from '@/lib/site-config';
import { AccountError, firstFieldError, me } from './client';
import { EmptyState } from './EmptyState';
import { AddImageButton, MAX_IMAGES, Thumbnails, useImageFiles } from './ImagePicker';

/** «ثبت گزارش» (designs 32–34): description + up to five photos, then the success state. */
export function ReportForm({ topic, orderNumber, children }: { topic: string; orderNumber: string | null; children?: React.ReactNode }) {
  const [body, setBody] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const { previews, add, remove } = useImageFiles(files, setFiles, setError);

  if (done) {
    return (
      <EmptyState
        art="success"
        title="گزارش شما با موفقیت ثبت گردید"
        text={`همکاران ما در کوتاه‌ترین زمان ممکن با شماره تلفن (${siteConfig.supportPhoneDisplay}) تماس می‌گیرند. پیشاپیش از صبر و شکیبایی شما سپاسگزاریم.`}
        className="py-20"
      >
        <Link href="/my-account/support/?tab=in_review" className="mt-5 inline-flex h-10 items-center rounded-sm bg-surface-muted px-6 text-sm font-bold text-text hover:bg-border">
          بازگشت
        </Link>
      </EmptyState>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim().length < 5) {
      setError('لطفا به صورت کامل مشکل خود را بیان فرمایید.');
      return;
    }
    const fd = new FormData();
    fd.set('topic', topic);
    if (orderNumber) fd.set('order_number', orderNumber);
    fd.set('body', body.trim());
    files.forEach((f) => fd.append('images[]', f));
    setBusy(true);
    setError(null);
    try {
      await me('POST', 'tickets', fd);
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(firstFieldError(err, 'body') ?? (err instanceof AccountError ? err.message : 'خطایی رخ داد.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex min-h-[calc(100dvh-180px)] flex-col lg:min-h-0" noValidate>
      {children}
      <div className="mt-4 rounded-md bg-surface-muted p-3">
        <label htmlFor="report-body" className="text-xs text-text-muted">
          <span className="text-danger">* </span>توضیحات
        </label>
        <textarea
          id="report-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          maxLength={5000}
          required
          placeholder="مشکل خود را بنویسید…"
          className="mt-1 w-full resize-y bg-transparent text-sm leading-7 text-text placeholder:text-text-subtle focus:outline-none"
        />
      </div>
      <div className="mt-3 rounded-md bg-surface-muted p-3">
        <p className="text-xs text-text-muted">
          محتوای عکسی <span className="text-text-subtle">(اختیاری، حداکثر {faDigits(MAX_IMAGES)} عکس)</span>
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          <Thumbnails previews={previews} onRemove={remove} />
          {files.length < MAX_IMAGES ? (
            <li>
              <AddImageButton onPick={add} />
            </li>
          ) : null}
        </ul>
      </div>
      <p className={cx('mt-3 flex items-center gap-1.5 text-xs', error ? 'text-danger' : 'text-text-muted')} role={error ? 'alert' : undefined}>
        <IconInfo size={14} />
        {error ?? 'لطفا به صورت کامل مشکل خود را بیان فرمایید.'}
      </p>
      <div className="sticky bottom-0 mt-auto bg-surface py-4 lg:static lg:mt-6 lg:bg-transparent">
        <button type="submit" disabled={busy} className="h-12 w-full rounded-md bg-primary text-base font-bold text-primary-on hover:bg-primary-hover disabled:opacity-60 lg:w-60">
          {busy ? 'در حال ارسال…' : 'ثبت گزارش'}
        </button>
      </div>
    </form>
  );
}
