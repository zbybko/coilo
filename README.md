# Coilo Headless Shopify Site

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
