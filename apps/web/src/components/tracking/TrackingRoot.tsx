'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { TrackingSettings } from '@banovit/api-client';
import { configureAds, pushDataLayer } from '@/lib/analytics';
import { captureAttribution } from '@/lib/tracking/capture';
import { onNavigation, startLeadCode } from '@/lib/tracking/leadcode';

type W = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; _paq?: unknown[][]; clarity?: unknown };

function addScript(src: string, id?: string) {
  if (id && document.getElementById(id)) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  if (id) s.id = id;
  document.head.appendChild(s);
}

/**
 * Analytics on every page, the new-site version of the old theme header + tracking plugins:
 *  - always: first/last-touch cookie (bnv_attr) and the session lead_code (bnv_lc), so orders,
 *    forms and calls carry the visitor's channel to the CMS even when no tag is loaded;
 *  - only when the CMS says enabled (production): GTM (GA4 inside), Matomo, Google Ads gtag
 *    right away, and Clarity / Yektanet / Mediaad after the first interaction or 7 s, like the old site.
 * Client navigations: Matomo gets a page view (GA4 counts them itself through history changes).
 * Must render before the page content so its effect configures Ads before pages push events.
 */
export function TrackingRoot({ settings }: { settings: TrackingSettings | null }) {
  const pathname = usePathname();
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    const w = window as W;
    w.dataLayer = w.dataLayer ?? [];
    const on = !!settings?.enabled;

    if (on && settings?.google_ads) {
      // gtag stub before anything pushes conversions; the library reads the queue on load.
      w.gtag = w.gtag ?? function gtag() {
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer!.push(arguments);
      };
      configureAds({ id: settings.google_ads.id, labels: settings.google_ads.labels, tryRateIrr: settings.google_ads.try_rate_irr });
      w.gtag('js', new Date());
      w.gtag('config', settings.google_ads.id);
      addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(settings.google_ads.id)}`, 'bnv-gtag');
    }
    if (on && settings?.gtm_id) {
      w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      addScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(settings.gtm_id)}`, 'bnv-gtm');
    }
    if (on && settings?.matomo) {
      const u = settings.matomo.url.replace(/\/$/, '') + '/';
      const paq = (w._paq = w._paq ?? []);
      paq.push(['trackPageView']);
      paq.push(['enableLinkTracking']);
      paq.push(['setTrackerUrl', u + 'matomo.php']);
      paq.push(['setSiteId', settings.matomo.site_id]);
      addScript(u + 'matomo.js', 'bnv-matomo');
    }

    // Write the touch first, so the lead_code registration carries it.
    captureAttribution();
    startLeadCode();

    if (!on) return;
    // Heavier third-party scripts wait for the first interaction (or 7 s), like the old site.
    let loaded = false;
    const events = ['scroll', 'mousemove', 'touchstart', 'click', 'keydown'] as const;
    const heavy = () => {
      if (loaded) return;
      loaded = true;
      events.forEach((e) => window.removeEventListener(e, heavy));
      const now = new Date();
      if (settings?.yektanet_id) {
        addScript(`https://cdn.yektanet.com/${encodeURIComponent(settings.yektanet_id)}/rg.complete.js?v=${now.getFullYear()}0${now.getMonth()}0${now.getDate()}0${now.getHours()}`, 'bnv-yektanet');
      }
      if (settings?.mediaad_id) addScript(`https://s1.mediaad.org/serve/${encodeURIComponent(settings.mediaad_id)}/retargeting.js`, 'bnv-mediaad');
      if (settings?.clarity_id) {
        const c = w as W & { clarity?: ((...a: unknown[]) => void) & { q?: unknown[] } };
        c.clarity =
          c.clarity ??
          Object.assign(
            function clarity() {
              // eslint-disable-next-line prefer-rest-params
              ((c.clarity as { q?: unknown[] }).q = (c.clarity as { q?: unknown[] }).q ?? []).push(arguments);
            },
            { q: [] as unknown[] },
          );
        addScript(`https://www.clarity.ms/tag/${encodeURIComponent(settings.clarity_id)}`, 'bnv-clarity');
      }
    };
    events.forEach((e) => window.addEventListener(e, heavy, { passive: true, once: true }));
    const timer = window.setTimeout(heavy, 7000);
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, heavy));
    };
    // settings come from the server once per full page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side navigations (the first page view is sent by the tags themselves).
  useEffect(() => {
    const url = window.location.href;
    if (prevUrl.current === null) {
      prevUrl.current = url;
      return;
    }
    if (prevUrl.current === url) return;
    const referrer = prevUrl.current;
    prevUrl.current = url;
    onNavigation();
    // let the new page set document.title first
    const t = window.setTimeout(() => {
      pushDataLayer({ event: 'virtual_page_view', page_location: url, page_referrer: referrer, page_title: document.title });
      const w = window as W;
      if (settings?.enabled && settings.matomo && w._paq) {
        w._paq.push(['setReferrerUrl', referrer]);
        w._paq.push(['setCustomUrl', url]);
        w._paq.push(['setDocumentTitle', document.title]);
        w._paq.push(['trackPageView']);
        w._paq.push(['enableLinkTracking']);
      }
    }, 150);
    return () => window.clearTimeout(t);
  }, [pathname, settings]);

  return null;
}
