'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ADMIN_BAR_COOKIE, type AdminBarData, hasAdminBarHint, sanitizeAdminBar, sharedCookieDomain } from '@/lib/admin-bar';

const HIDE_KEY = 'bnv_admin_bar_hidden';

/**
 * «نوار مدیریت» — like the WordPress admin bar, only for people signed in to
 * the panel. Renders nothing on the server and nothing for visitors without
 * the panel's hint cookie, so cached HTML, SEO and speed are unchanged for
 * everyone else. See lib/admin-bar for how the login is checked.
 */
export function AdminBar({ panelOrigin }: { panelOrigin: string | null }) {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AdminBarData | null>(null);
  const frame = useRef<HTMLIFrameElement | null>(null);
  const lastId = useRef(0);

  useEffect(() => {
    if (!panelOrigin || !hasAdminBarHint(document.cookie)) return;
    try {
      if (sessionStorage.getItem(HIDE_KEY) === '1') return;
    } catch {
      /* storage blocked: still show */
    }
    setEnabled(true);
  }, [panelOrigin]);

  useEffect(() => {
    if (!enabled || !panelOrigin) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== panelOrigin || e.source !== frame.current?.contentWindow) return;
      const msg = e.data as { bnvBar?: number; type?: string; id?: number; ok?: boolean; status?: number; data?: unknown };
      if (!msg || msg.bnvBar !== 1) return;
      if (msg.type === 'ready') setReady(true);
      if (msg.type !== 'result' || msg.id !== lastId.current) return;
      if (msg.ok) {
        setData(sanitizeAdminBar(msg.data, panelOrigin));
      } else {
        setData(null);
        if (msg.status === 401) {
          // Panel login is gone: drop the hint so the bridge is not loaded again.
          const domain = sharedCookieDomain(window.location.hostname);
          document.cookie = `${ADMIN_BAR_COOKIE}=; Path=/; Max-Age=0${domain ? `; Domain=${domain}` : ''}`;
          setEnabled(false);
        }
      }
    };
    window.addEventListener('message', onMessage);
    const iframe = document.createElement('iframe');
    iframe.src = `${panelOrigin}/storefront-bar/bridge`;
    iframe.title = 'admin-bar';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    iframe.style.display = 'none';
    frame.current = iframe;
    document.body.appendChild(iframe);
    return () => {
      window.removeEventListener('message', onMessage);
      iframe.remove();
      frame.current = null;
      setReady(false);
    };
  }, [enabled, panelOrigin]);

  const ask = useCallback(
    (path: string) => {
      if (!panelOrigin || !frame.current?.contentWindow) return;
      lastId.current += 1;
      frame.current.contentWindow.postMessage({ bnvBar: 1, type: 'resolve', id: lastId.current, path }, panelOrigin);
    },
    [panelOrigin],
  );

  useEffect(() => {
    if (ready) ask(pathname || '/');
  }, [ready, pathname, ask]);

  if (!enabled || !data) return null;

  const hide = () => {
    try {
      sessionStorage.setItem(HIDE_KEY, '1');
    } catch {
      /* ignore */
    }
    setEnabled(false);
  };

  return (
    <div
      dir="rtl"
      className="relative z-modal flex h-9 items-center gap-1 overflow-x-auto whitespace-nowrap bg-[#1d2327] px-2 text-[13px] text-white print:hidden"
      role="navigation"
      aria-label="نوار مدیریت"
    >
      <a href={data.panel_url} className="rounded-sm px-2 py-1 font-bold hover:bg-white/10">
        پیشخوان پنل
      </a>
      {data.links.map((l) => (
        <a
          key={l.url}
          href={l.url}
          className={`rounded-sm px-2 py-1 hover:bg-white/10 ${l.primary ? 'bg-white/10 font-bold text-[#72aee6]' : 'text-white/90'}`}
        >
          {l.primary ? '✎ ' : ''}
          {l.label}
        </a>
      ))}
      <span className="ms-auto px-2 text-white/70">{data.user.name}</span>
      <button type="button" onClick={hide} className="rounded-sm px-2 py-1 text-white/70 hover:bg-white/10" aria-label="بستن نوار مدیریت" title="بستن تا پایان این بازدید">
        ×
      </button>
    </div>
  );
}
