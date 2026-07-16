import ColorsClient from "./ColorsClient";
import { resolveMarket } from "../../lib/market";

// Product structured data so Google can match this landing page against the
// Merchant Center feeds. `?market=` (used by the non-EUR feed links) switches
// the offer currency so the crawler sees the price it expects regardless of
// the IP it crawls from.
function productJsonLd(marketParam?: string) {
  const market = resolveMarket(marketParam);
  const marketQs = market.code === "eur" ? "" : `market=${market.code}&`;
  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name: "Modern Spiral Bookshelf",
    description:
      "A sculptural 3D printed spiral bookshelf and magazine holder by Coilo. Available in 5 vivid colors.",
    url: "https://coilo.de/colors",
    brand: { "@type": "Brand", name: "Coilo" },
    productGroupID: "coilo-spiral-bookshelf",
    variesBy: "https://schema.org/color",
    hasVariant: [
      { slug: "sakura", name: "Sakura", color: "Pink", id: "62010088554826", img: "sakura/sakura-studio.webp" },
      { slug: "cyan", name: "Cyan", color: "Blue", id: "61987185787210", img: "cyan/cyan-studio.webp" },
      { slug: "cherry", name: "Cherry", color: "Red", id: "62010088587594", img: "cherry/cherry-studio.webp" },
      { slug: "rose", name: "Rosé", color: "Rose", id: "62010091077962", img: "rose/rose-studio.webp" },
      { slug: "sunflower", name: "Sunflower", color: "Yellow", id: "62010088620362", img: "sunflower/sunflower-studio.webp" },
    ].map((v) => ({
      "@type": "Product",
      name: `Modern Spiral Bookshelf — ${v.name}`,
      sku: v.id,
      color: v.color,
      image: `https://coilo.de/media/site-assets/colors/${v.img}`,
      url: `https://coilo.de/colors?${marketQs}color=${v.slug}`,
      offers: {
        "@type": "Offer",
        price: market.amount.toFixed(2),
        priceCurrency: market.currency,
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        url: `https://coilo.de/colors?${marketQs}color=${v.slug}`,
        seller: { "@type": "Organization", name: "Coilo" },
      },
    })),
  };
}

export default async function ColorsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const marketParam = Array.isArray(sp.market) ? sp.market[0] : sp.market;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd(marketParam)),
        }}
      />
      <ColorsClient />
    </>
  );
}
