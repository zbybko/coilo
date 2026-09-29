# Coilo Headless Shopify Site

## Temporary enquiry mode

Checkout is currently disabled by `CHECKOUT_ENABLED` in `lib/sales.ts`.
Buy buttons lead to `/enquiry?color=<slug>`, including their no-JavaScript
links. The old `/api/buy` endpoint redirects to the enquiry page too.
Shopify integration code is retained for later use; enabling it requires
reviewing the payment provider, credentials, prices, shipping and policies first.

The EN/DE enquiry form POSTs to `/api/enquiry`. The Worker validates input,
checks the request origin, rejects a honeypot and oversized bodies, and applies
an IP-based rate limit (3 requests per minute per Cloudflare location). It awaits
Cloudflare email sending before returning success. Failed requests preserve
form values. This is an enquiry only, not a purchase or reservation.

Email bindings and the recipient are server-side settings in `vite.config.ts`:
`ENQUIRY_EMAIL` is restricted to the owner's verified destination, `ENQUIRY_TO`
sets that destination, and `ENQUIRY_RATE_LIMITER` limits submissions. The sender
is `support@coilo.de`; Reply-To is the validated visitor address. No API key or
third-party email service is required. Before deployment, ensure Email Routing
is active for coilo.de and the configured destination is verified in the same
Cloudflare account. Deploy the rebuilt Worker to apply bindings.

Local email sending is simulated by Cloudflare, so localhost submissions return
503 instead of claiming a real email was sent. Test a real delivery after deploy;
success means Cloudflare accepted the email, not a guarantee of inbox delivery.
The destination address is never included in the client bundle or API responses.
Server tests (without sending actual email):
`npx tsx --test lib/enquiry-server.test.ts`.

Payment badges and structured-data offers are hidden while checkout is disabled.
Existing legal-page links still depend on Shopify; migrate those pages before
closing the Shopify store.

Product landing page for Coilo's modern 3D printed spiral bookshelf. The site
runs on vinext/React and creates Shopify carts through the Storefront API before
redirecting buyers to Shopify checkout.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
npm run build
```

Set these local environment variables before testing Shopify checkout:

- `SHOPIFY_STORE_DOMAIN`: your `*.myshopify.com` store domain
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: Storefront API public access token
- `SHOPIFY_PRODUCT_HANDLE`: Shopify product handle for the spiral bookshelf
- `SHOPIFY_API_VERSION`: Storefront API version, default `2026-04`

The homepage still renders without Shopify credentials. `/api/buy` returns a
configuration error until the environment variables are set.

## Colour deep links & attribution

### Colour deep link on `/colors`

The colour carousel is deep-linkable via the **`color`** GET param (a `#<slug>`
hash also works and wins over the param). Accepted values:

`sakura` · `cyan` · `cherry` · `rose` · `sunflower`

Example: `https://coilo.de/colors?color=cherry` opens the Cherry panel.
Switching colours updates the address bar via `history.replaceState`, so the
visible colour is always shareable; back/forward restores it. The page carries
a param-less `<link rel="canonical" href="https://coilo.de/colors">`.

### Attribution capture (`lib/attribution.ts`)

On every page load these inbound params are captured (allowlist — nothing else
is ever forwarded):

`utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, gbraid,
wbraid, gad_source, fbclid, ttclid, msclkid, epik, twclid, li_fat_id`

plus `document.referrer`. Persistence is first-party only, no cookies:

- **last touch** → `sessionStorage` (`coilo_attr_last`)
- **first touch** → `localStorage` (`coilo_attr_first`), written once,
  timestamped, ~90-day TTL

### Buy-link decoration

Every Buy/Shop CTA points at `https://shop.coilo.de/cart/<variant_id>:1` and,
at click time, appends: `variant=<id>`, all captured last-touch params,
`utm_source=coilo_landing&utm_medium=referral` for direct visits,
`utm_content=<colour>` (unless already set), and compact context:
`c_color`, `c_cta` (`hero|configurator|footer`), `c_page`, `c_ft` (first-touch
source, only when it differs from last touch). Shopify stores the full landing
URL on the order (`landing_site`), so all of this is queryable per order.

Colour → Shopify variant ID (verified against the live store):

| Colour    | Variant ID       |
|-----------|------------------|
| Sakura    | `62010088554826` |
| Cyan      | `61987185787210` |
| Cherry    | `62010088587594` |
| Rosé      | `62010091077962` |
| Sunflower | `62010088620362` |

### Ready-to-paste tagged links (social bios / videos)

| Channel   | URL |
|-----------|-----|
| TikTok    | `https://coilo.de/colors?color=sakura&utm_source=tiktok&utm_medium=social&utm_campaign=organic&utm_content=sakura_clip1` |
| Instagram | `https://coilo.de/colors?color=rose&utm_source=instagram&utm_medium=social&utm_campaign=organic&utm_content=rose_reel1` |
| YouTube   | `https://coilo.de/colors?color=cyan&utm_source=youtube&utm_medium=social&utm_campaign=organic&utm_content=cyan_short1` |
| Pinterest | `https://coilo.de/colors?color=cherry&utm_source=pinterest&utm_medium=social&utm_campaign=organic&utm_content=cherry_pin1` |
| Etsy      | `https://coilo.de/colors?color=sunflower&utm_source=etsy&utm_medium=referral&utm_campaign=shop_profile&utm_content=sunflower_listing` |

Swap `color=` and `utm_content=` per clip; keep `utm_source`/`utm_medium`
stable per channel so orders stay groupable.

## Legal pages

The footer of every page links the six Shopify policy pages (Impressum,
Datenschutzerklärung, Widerrufsrecht, AGB, Versand, Kontakt) under
`https://shop.coilo.de/de/policies/...`. Shopify serves them with
`X-Frame-Options: DENY` and `frame-ancestors 'none'`, so they open in a new
tab — they cannot be embedded in an on-site modal. The pages are managed in
Shopify admin; nothing is copied locally, so there is nothing to keep in sync.

## Included Shape

- edit site code under `app/`
- Shopify checkout route lives at `app/api/buy/route.ts`
- Shopify Storefront API helpers live in `lib/shopify.ts`
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/schema.ts` starts intentionally empty
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from
`oai-authenticated-user-email`.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
