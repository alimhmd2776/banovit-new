'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { IconChevronLeft, IconChevronRight, IconClose, IconSearch } from '@banovit/ui';
import { geocode, type GeoResult } from './map';
import { useMapConfig } from './settings';
import { Pin } from './MapPreview';
import 'leaflet/dist/leaflet.css';

/**
 * «انتخاب موقعیت مکانی» (designs 24, 25): full-screen map with a fixed center
 * pin, place search in a bottom sheet, «تایید موقعیت مکانی». Shared with
 * checkout (feature/web-cart) through AddressForm.
 */
export function MapPicker({ initial, onConfirm, onClose }: { initial: { lat: number; lng: number }; onConfirm: (p: { lat: number; lng: number }) => void; onClose: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<GeoResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const cfg = useMapConfig();

  useEffect(() => {
    let cancelled = false;
    void import('leaflet').then((L) => {
      if (cancelled || !el.current || map.current) return;
      map.current = L.map(el.current, { zoomControl: false, attributionControl: true }).setView([initial.lat, initial.lng], cfg.default_zoom || 16);
      L.tileLayer(cfg.tile_url, { maxZoom: 19, attribution: cfg.attribution ?? '' }).addTo(map.current);
      L.control.zoom({ position: 'topleft' }).addTo(map.current);
    });
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      document.body.style.overflow = prev;
    };
  }, [initial.lat, initial.lng, cfg.tile_url, cfg.attribution, cfg.default_zoom]);

  useEffect(() => {
    const t = q.trim();
    if (t.length < 2) {
      setResults(null);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await geocode(cfg.geocoder_url, t, ctrl.signal));
      } catch {
        /* aborted */
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, cfg.geocoder_url]);

  const pick = (r: GeoResult) => {
    map.current?.setView([r.lat, r.lng], 17);
    setResults(null);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="انتخاب موقعیت مکانی" className="fixed inset-0 z-modal flex flex-col bg-surface lg:inset-[5vh_10vw] lg:overflow-hidden lg:rounded-lg lg:shadow-lg">
      <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-border px-4">
        <button type="button" onClick={onClose} aria-label="بازگشت" className="inline-flex size-11 items-center justify-center rounded-md border border-border">
          <IconChevronRight size={22} />
        </button>
        <h2 className="text-lg font-extrabold">انتخاب موقعیت مکانی</h2>
      </div>
      <div className="relative flex-1">
        <div ref={el} className="absolute inset-0 z-0" />
        <div className="pointer-events-none absolute inset-0 z-[500]">
          <Pin />
        </div>
      </div>
      <div className="relative z-[600] -mt-4 shrink-0 rounded-t-lg bg-surface px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 shadow-lg">
        <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-border" aria-hidden="true" />
        {results ? (
          <div className="mb-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center">
                <p className="font-bold">نتیجه جستجو «{q}»</p>
                <p className="text-xs text-text-muted">جستجوی موقعیت مکانی</p>
              </div>
              <button type="button" aria-label="بستن نتایج" onClick={() => { setResults(null); setQ(''); }} className="inline-flex size-10 items-center justify-center rounded-full border border-border">
                <IconClose size={18} />
              </button>
            </div>
          </div>
        ) : null}
        <label className="relative block">
          <span className="sr-only">جستجوی شهر یا محله</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجوی شهر یا استان …"
            className="h-12 w-full rounded-md bg-surface-muted pe-4 ps-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary-subtle"
          />
          <IconSearch size={20} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        </label>
        {results ? (
          <ul className="mt-2 max-h-[40vh] overflow-y-auto" aria-live="polite">
            {results.length === 0 && !searching ? <li className="py-4 text-center text-sm text-text-muted">موردی پیدا نشد.</li> : null}
            {results.map((r, i) => (
              <li key={i}>
                <button type="button" onClick={() => pick(r)} className="flex w-full items-center gap-3 border-b border-border py-3 text-start">
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{r.title}</span>
                    <span className="block truncate text-xs text-text-muted">{r.subtitle}</span>
                  </span>
                  <IconChevronLeft size={18} className="text-text-muted" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <button
          type="button"
          onClick={() => {
            const c = map.current?.getCenter();
            onConfirm(c ? { lat: Number(c.lat.toFixed(7)), lng: Number(c.lng.toFixed(7)) } : initial);
          }}
          className="mt-3 h-12 w-full rounded-md bg-primary text-sm font-bold text-primary-on hover:bg-primary-hover"
        >
          تایید موقعیت مکانی
        </button>
      </div>
    </div>
  );
}
