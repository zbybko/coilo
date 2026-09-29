// Keep checkout available in code while the site accepts enquiries only.
// Before enabling, configure and verify the payment provider and update policies.
export const CHECKOUT_ENABLED = false;

export const PRODUCT_COLORS = [
  { slug: "sakura", name: "Sakura", variantId: "62010088554826" },
  { slug: "cyan", name: "Cyan", variantId: "61987185787210" },
  { slug: "cherry", name: "Cherry", variantId: "62010088587594" },
  { slug: "rose", name: "Rosé", variantId: "62010091077962" },
  { slug: "sunflower", name: "Sunflower", variantId: "62010088620362" },
];

export function enquiryUrl(variantId: string): string {
  const color = PRODUCT_COLORS.find((item) => item.variantId === variantId);
  return `/enquiry${color ? `?color=${color.slug}` : ""}`;
}
