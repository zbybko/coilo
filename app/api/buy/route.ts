import {
  createCheckoutUrl,
  findVariantForColor,
  getShopifyProduct,
  isShopifyConfigured,
} from "../../../lib/shopify";

export async function GET(request: Request) {
  if (!isShopifyConfigured()) {
    return Response.json(
      {
        error:
          "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN, and SHOPIFY_PRODUCT_HANDLE.",
      },
      { status: 503 },
    );
  }

  try {
    const url = new URL(request.url);
    const color = url.searchParams.get("color");
    const product = await getShopifyProduct();

    if (!product) {
      return Response.json(
        { error: "Shopify product was not found for SHOPIFY_PRODUCT_HANDLE." },
        { status: 404 },
      );
    }

    const variant = findVariantForColor(product, color);
    if (!variant) {
      return Response.json(
        { error: "No Shopify product variants are available for checkout." },
        { status: 404 },
      );
    }

    const checkoutUrl = await createCheckoutUrl(variant.id);
    return Response.redirect(checkoutUrl, 303);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Shopify checkout.",
      },
      { status: 500 },
    );
  }
}
