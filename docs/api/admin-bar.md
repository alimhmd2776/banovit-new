# نوار مدیریت (storefront admin bar)

Like the WordPress admin bar: people signed in to the panel see a dark bar on
top of every storefront page with «پیشخوان پنل» and an edit link for what the
page shows (product, category, brand, tag, seller, blog post/category/tag/author,
content page, contact page, shop/home settings).

## How the login is recognised

The panel (cms-new.banovit.com) stores its Bearer token in its own localStorage,
which the storefront (new.banovit.com) cannot read.

1. Panel `setToken` (and every panel load while signed in) writes the cookie
   `bnv_admin_bar=1` on the shared parent domain (`banovit.com`), 30 days. It is a
   hint only — no secret. `clearToken` (logout / 401) removes it.
2. Storefront `AdminBar` (client component in the root layout) does nothing
   unless that cookie exists. With it, it adds a hidden iframe
   `{panel}/storefront-bar/bridge`.
3. The bridge page (CMS `StorefrontBarBridgeController`) reads the token in its own
   origin and calls `GET /api/admin/storefront-bar?path=…`, then posts the answer
   to the storefront window. `frame-ancestors` and the postMessage target allow
   only `storefront.preview_url` / `storefront.site_url` origins.
4. The API resolves the path to the entity and returns links filtered by role
   (content links need marketing/pm/admin; sellers admin only). A 401 makes the
   storefront delete the hint cookie.

Nothing changes in the server-rendered HTML, so ISR/CDN caching and SEO are the
same for visitors. Panel origin: `CMS_PANEL_URL`, else derived from
`NEXT_PUBLIC_SITE_URL` (new.banovit.com → cms-new.banovit.com, banovit.com → cms.banovit.com).

Panel deep links added for it: `/panel/catalog?tag={id}` (tag page editor) and
`/panel/storefront-sellers?edit={id}`.
