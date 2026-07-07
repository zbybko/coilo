// Supplemental feed for Google Merchant Center: overrides the ad `link`
// attribute per variant so PMax lands shoppers on the coilo.de color panels
// (with ?color= deep link) instead of the bare Shopify product page.
// Registered in Merchant Center as a scheduled-fetch data source.

const PRODUCT_ID = "15702948381002";

const VARIANTS: Array<[variantId: string, colorSlug: string]> = [
  ["62010088554826", "sakura"],
  ["61987185787210", "cyan"],
  ["62010088587594", "cherry"],
  ["62010088620362", "sunflower"],
  ["62010091077962", "rose"],
];

export async function GET() {
  const rows = VARIANTS.map(
    ([variantId, slug]) =>
      `shopify_ZZ_${PRODUCT_ID}_${variantId},https://coilo.de/colors?color=${slug}`,
  );
  const csv = ["id,link", ...rows].join("\n") + "\n";
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
