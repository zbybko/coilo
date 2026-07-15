import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colors — Sakura, Cyan, Cherry, Rosé & Sunflower",
  description:
    "Explore the Coilo Spiral Bookshelf in 5 vivid colors: Sakura pink, Cyan blue, Cherry red, Rosé and Sunflower yellow. €59 each, 3D printed and shipped from Germany.",
  // Param-less canonical: ?color=... variants are the same page, not duplicates.
  alternates: { canonical: "https://coilo.de/colors" },
  openGraph: {
    url: "https://coilo.de/colors",
    title: "Coilo Colors — pick your spiral",
    description:
      "Sakura, Cyan, Cherry, Rosé & Sunflower. €59, 3D printed in Germany.",
    images: [
      {
        url: "/media/site-assets/colors/cyan/cyan-1.webp",
        width: 2000,
        height: 1493,
        alt: "Coilo Spiral Bookshelf in Cyan on an oak sideboard",
      },
    ],
  },
};

// Product structured data so Google can match this landing page against the
// Merchant Center feed (price, currency, availability per colour variant).
// Keep prices/availability in sync with the Shopify product.
const PRODUCT_JSON_LD = {
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
    url: `https://coilo.de/colors?color=${v.slug}`,
    offers: {
      "@type": "Offer",
      price: "59.00",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      url: `https://coilo.de/colors?color=${v.slug}`,
      seller: { "@type": "Organization", name: "Coilo" },
    },
  })),
};

export default function ColorsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_JSON_LD) }}
      />
      {children}
    </>
  );
}
