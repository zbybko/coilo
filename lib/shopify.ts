type ShopifyConfig = {
  storeDomain: string;
  storefrontAccessToken: string;
  productHandle: string;
  apiVersion: string;
};

type ShopifyError = {
  message: string;
};

type ShopifyResponse<T> = {
  data?: T;
  errors?: ShopifyError[];
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
};

export type ShopifyProduct = {
  title: string;
  handle: string;
  onlineStoreUrl: string | null;
  price: string | null;
  currencyCode: string | null;
  variants: ShopifyVariant[];
};

const productQuery = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      title
      handle
      onlineStoreUrl
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

const cartCreateMutation = `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function readShopifyConfig(): ShopifyConfig | null {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const storefrontAccessToken =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  const productHandle = process.env.SHOPIFY_PRODUCT_HANDLE?.trim();

  if (!storeDomain || !storefrontAccessToken || !productHandle) {
    return null;
  }

  return {
    storeDomain: storeDomain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    storefrontAccessToken,
    productHandle,
    apiVersion: process.env.SHOPIFY_API_VERSION?.trim() || "2026-04",
  };
}

export function isShopifyConfigured() {
  return readShopifyConfig() !== null;
}

async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const config = readShopifyConfig();

  if (!config) {
    throw new Error(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN, and SHOPIFY_PRODUCT_HANDLE.",
    );
  }

  const response = await fetch(
    `https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token":
          config.storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    },
  );

  const payload = (await response.json()) as ShopifyResponse<T>;

  if (!response.ok || payload.errors?.length) {
    throw new Error(
      payload.errors?.map((error) => error.message).join("; ") ||
        `Shopify request failed with ${response.status}`,
    );
  }

  if (!payload.data) {
    throw new Error("Shopify response did not include data.");
  }

  return payload.data;
}

export async function getShopifyProduct(): Promise<ShopifyProduct | null> {
  if (!isShopifyConfigured()) {
    return null;
  }

  const config = readShopifyConfig();
  const data = await shopifyFetch<{
    product: {
      title: string;
      handle: string;
      onlineStoreUrl: string | null;
      priceRange: {
        minVariantPrice: {
          amount: string;
          currencyCode: string;
        };
      };
      variants: {
        nodes: ShopifyVariant[];
      };
    } | null;
  }>(productQuery, { handle: config?.productHandle });

  if (!data.product) {
    return null;
  }

  const minPrice = data.product.priceRange.minVariantPrice;

  return {
    title: data.product.title,
    handle: data.product.handle,
    onlineStoreUrl: data.product.onlineStoreUrl,
    price: minPrice.amount,
    currencyCode: minPrice.currencyCode,
    variants: data.product.variants.nodes,
  };
}

export function findVariantForColor(
  product: ShopifyProduct,
  colorName: string | null,
) {
  const requested = colorName?.trim().toLowerCase();
  const variants = product.variants.filter((variant) => variant.availableForSale);

  if (!requested) {
    return variants[0] ?? product.variants[0] ?? null;
  }

  return (
    variants.find((variant) =>
      variant.selectedOptions.some(
        (option) =>
          option.name.toLowerCase().includes("color") &&
          option.value.toLowerCase() === requested,
      ),
    ) ??
    variants.find((variant) =>
      variant.title.toLowerCase().includes(requested),
    ) ??
    variants[0] ??
    product.variants[0] ??
    null
  );
}

export async function createCheckoutUrl(variantId: string) {
  const data = await shopifyFetch<{
    cartCreate: {
      cart: {
        checkoutUrl: string;
      } | null;
      userErrors: Array<{
        field: string[] | null;
        message: string;
      }>;
    };
  }>(cartCreateMutation, {
    lines: [
      {
        merchandiseId: variantId,
        quantity: 1,
      },
    ],
  });

  const userError = data.cartCreate.userErrors[0];
  if (userError) {
    throw new Error(userError.message);
  }

  const checkoutUrl = data.cartCreate.cart?.checkoutUrl;
  if (!checkoutUrl) {
    throw new Error("Shopify did not return a checkout URL.");
  }

  return checkoutUrl;
}
