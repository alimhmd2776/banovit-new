import type { Seller } from '@banovit/api-client';
import { IconMapPin } from '@banovit/ui';
import { OpeningHours } from './OpeningHours';

function mapLinks(lat: number, lng: number) {
  const d = 0.006;
  return {
    embed: `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d * 1.6},${lat - d},${lng + d * 1.6},${lat + d}&layer=mapnik&marker=${lat},${lng}`,
    neshan: `https://neshan.org/maps/@${lat},${lng},16z,0p`,
  };
}

/** «جزئیات فروشگاه»: about text, address + map + «ورود به نشان», opening hours. */
export function SellerDetails({ seller }: { seller: Seller }) {
  const loc = seller.location;
  const geo = loc?.lat != null && loc?.lng != null ? mapLinks(loc.lat, loc.lng) : null;
  const hasAnything = seller.about_html || loc || seller.opening_hours?.days.length;

  if (!hasAnything) {
    return <p className="rounded-md bg-surface px-4 py-8 text-center text-sm text-text-muted">اطلاعات این فروشگاه هنوز تکمیل نشده است.</p>;
  }

  return (
    <div className="space-y-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8 lg:gap-y-5 lg:space-y-0">
      {seller.about_html ? (
        <div
          className="border-b border-border pb-5 text-sm leading-7 text-text-muted lg:col-start-1 lg:row-start-1 [&_a]:text-primary [&_p+p]:mt-3"
          dangerouslySetInnerHTML={{ __html: seller.about_html }}
        />
      ) : null}

      {loc ? (
        <div className="flex gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:flex-col">
          <div className="flex flex-1 flex-col justify-between gap-4">
            {loc.address ? (
              <address className="flex gap-2 text-sm not-italic leading-7 text-text-muted">
                <IconMapPin size={18} className="mt-1 shrink-0 text-text" />
                <span>{loc.address}</span>
              </address>
            ) : null}
            {geo ? (
              <a
                href={geo.neshan}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center self-start rounded-full border border-border-strong bg-surface px-5 text-sm font-bold text-text hover:bg-surface-muted"
              >
                ورود به نشان
              </a>
            ) : null}
          </div>
          {geo ? (
            <iframe
              title={`نقشه موقعیت ${seller.name}`}
              src={geo.embed}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="aspect-square w-36 shrink-0 rounded-lg border-0 bg-surface-muted sm:w-48 lg:aspect-[16/9] lg:w-full"
            />
          ) : null}
        </div>
      ) : null}

      {seller.opening_hours?.days.length ? (
        <div className="lg:col-start-1 lg:row-start-2">
          <OpeningHours days={seller.opening_hours.days} />
        </div>
      ) : null}
    </div>
  );
}
