# Tracking: attribution, lead code, analytics tags (new storefront)

Replaces the WordPress pieces `banovit-attribution` (bnv-capture.js, bnv-leadcode.js, web-identity
webhook), the theme header tags (GTM, Matomo, Clarity, Yektanet, Mediaad) and the Ads part of
`banovit-measurement` (direct gtag conversions). CMS branch `feature/storefront-tracking`,
web branch `feature/web-tracking`.

## Browser (apps/web)

`components/tracking/TrackingRoot.tsx`, first child of `<body>` in the root layout:

| What | Cookie / call | Same as old site |
|---|---|---|
| First / last touch (utm, gclid/gbraid/wbraid, external referrer, landing page) | `bnv_attr` 90 days `{first,last,hist}` | yes, same name + format: visitors keep their first touch after the move |
| Session lead code `BN-XXXX` (WhatsApp/SMS prefill, label next to phone links, `[data-bnv-lead-code]`) | `bnv_lc` 30 min sliding, `POST /api/web-identity/` | yes |
| Contact taps | dataLayer `contact_click`, `phone_click`, `whatsapp_click`; beacon to `/api/web-identity/` | yes |
| GTM / Matomo / Google Ads gtag at once, Clarity / Yektanet / Mediaad after interaction or 7 s | only when CMS `settings/tracking.enabled` | yes |
| Client navigations | Matomo `trackPageView` + dataLayer `virtual_page_view` (GA4 counts history changes itself) | new |

Opt out of the phone label on a link: put it inside `[data-bnv-lc-label="off"]`.

dataLayer amounts are **rial, currency IRR** (live rule). Google Ads secondary conversions
`view_item` / `add_to_cart` / `begin_checkout` are sent in TRY with `try_rate_irr`; lead forms
(`trackLead`) send `generate_lead`; card-to-card result page sends `order_pending`.
The browser never sends the Ads **purchase**: confirmed sales go from the CMS (GoogleAdsSender,
GA4/Matomo senders) so nothing is counted twice.

The BFF reads the cookies server side (`lib/tracking/server.ts`) and adds
`attribution = {first_touch, last_touch, ga_client_id, ga_session_id, ga_session_number, matomo_visitor_id, lead_code}` to:
`POST /orders` (checkout), `POST /callback-requests` (all consultation forms) and `POST /web-identity`.

## CMS (storefront v1)

- `GET settings/tracking` → `{enabled, gtm_id, ga4_measurement_id, matomo{url,site_id}, matomo_site_id, google_ads{id,labels,try_rate_irr}, clarity_id, yektanet_id, mediaad_id}`.
  Config `storefront.tracking`, **off unless `STOREFRONT_TRACKING_ENABLED=true`** (test deploys never send
  visits or conversions to the live accounts). Ids default to the live banovit.com tags.
- `POST web-identity` `{lead_code, kind: session|contact_click, contact_method?, page?, attribution?}` → `web_identity`
  (throttle `storefront-identity` 30/min per visitor). `lead_form` only through `callback-requests`
  (with `lead_code` + `attribution`, stores the mobile as customer_key).
- `POST orders` accepts `attribution`; the order gets the WordPress meta keys
  (`_bnv_attribution` JSON, `_bnv_ads_click_type/_id/_at`, `_bnv_lead_code`, `_bnv_matomo_vid`, `_bnv_ga_*`),
  so OrderAttributionService, Didar linking and the Ads/GA4/Matomo senders work unchanged.
- `created_via=storefront` orders are **online** (they were counted as offline before).

## At the move to banovit.com (our switches, CMS prod env)

1. `STOREFRONT_TRACKING_ENABLED=true` (loads GTM/Matomo/Ads/Clarity/... on the new site).
2. Server-side purchase sending on: `TRACKING_OUTBOX_ENABLED=true` (GA4 MP + Matomo), Google Ads sender `DRY_RUN=false`.
3. Turn off the WordPress tracking plugins together with the old site (no double sending).

## Account changes Ali makes (we change nothing in GA4 / Matomo / Google Ads)

1. Google Ads: the browser purchase conversion «Banovit - Purchase» stops; purchases come from
   «Banovit - Purchase (Offline import)» (7854038131). Make that one **Primary** and the old tag one Secondary.
2. GTM / GA4 / Matomo: anything that uses old-site page addresses must use the new ones —
   thank-you page `/checkout/order-received/…` → `/checkout/result/`; cart `/cart/`, checkout `/checkout/`
   (check goals, key events, audiences and GTM triggers built on URLs or WordPress/Elementor form events).
3. GA4 web stream: «Page changes based on browser history events» in Enhanced measurement must stay ON.
4. (only if testing tags on new.banovit.com before the move) a separate Matomo test site, or add new.banovit.com to the GA4 unwanted referrals; otherwise nothing.
