'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IconChevronLeft, IconSearch } from '@banovit/ui';
import { EmptyState } from './EmptyState';
import { SUPPORT_TOPICS } from './supportTopics';

/** Help home (designs 28, 29): greeting, client-side search across topics and their FAQ. */
export function SupportHelp() {
  const [q, setQ] = useState('');
  const t = q.trim();
  const topics = t ? SUPPORT_TOPICS.filter((s) => [s.title, s.subtitle, ...s.faq.flatMap((f) => [f.q, f.a])].some((x) => x.includes(t))) : SUPPORT_TOPICS;
  // Time of day only in the browser: the server clock (UTC) would mismatch hydration.
  const [greet, setGreet] = useState('وقت بخیر');
  useEffect(() => {
    const hour = new Date().getHours();
    setGreet(hour < 12 ? 'صبح بخیر' : hour < 17 ? 'وقت بخیر' : 'عصر بخیر');
  }, []);
  return (
    <div className="pt-5">
      <h2 className="text-xl font-extrabold leading-9 text-text">
        سلام {greet}،
        <br />
        چطور همراهیتان کنیم؟
      </h2>
      <label className="relative mt-4 block">
        <span className="sr-only">جستجو در راهنما</span>
        <IconSearch size={20} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو ..."
          className="h-12 w-full rounded-full bg-surface-muted pe-4 ps-11 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary-subtle"
        />
      </label>
      {topics.length ? (
        <ul className="mt-3 lg:grid lg:grid-cols-2 lg:gap-x-8">
          {topics.map((s) => (
            <li key={s.key} className="border-b border-border">
              <Link href={`/my-account/support/topics/${s.key}/`} className="flex items-center gap-3 py-4 hover:bg-surface-muted">
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-text">{s.title}</span>
                  <span className="mt-1 block text-xs text-text-muted">{s.subtitle}</span>
                </span>
                <IconChevronLeft size={18} className="text-text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState art="search" title="نتیجه‌ای یافت نشد!" text="عبارت دیگری را جستجو کنید یا موضوع «سایر» را برای ثبت درخواست انتخاب کنید.">
          <Link href="/my-account/support/topics/other/" className="mt-5 inline-flex h-10 items-center rounded-sm bg-surface-muted px-5 text-sm font-bold text-text">
            ثبت درخواست
          </Link>
        </EmptyState>
      )}
    </div>
  );
}
