// First-party attribution for the headless landing -> Shopify checkout hop.
//
// Ads and social clicks land on coilo.de with tracking params (utm_*, gclid,
// ttclid, ...). The purchase happens on shop.coilo.de, a separate first-party
// context, so if we drop those params here the platform never attributes the
// conversion. Fix: capture an allowlisted set on every page load, persist it
// (sessionStorage = last touch, localStorage = first touch, 90-day TTL), and
// re-append everything to the Shopify cart-permalink URL at click time.
// Shopify stores the full landing URL on the order (`landing_site`), so every
// param we forward is queryable per order later. No cookies, no PII in URLs.

// Allowlisted inbound params. Never forward anything outside this list.
// gbraid / wbraid / gad_source are Google Ads companions to gclid (PMax
// consent-mode fallbacks) — keep them or Google optimizes blind.
const ALLOWED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "gad_source",
  "fbclid",
  "ttclid",
  "msclkid",
  "epik",
  "twclid",
  "li_fat_id",
] as const;

const LAST_TOUCH_KEY = "coilo_attr_last"; // sessionStorage
const FIRST_TOUCH_KEY = "coilo_attr_first"; // localStorage
const FIRST_TOUCH_TTL_MS = 90 * 24 * 60 * 60 * 1000; // ~90 days

const SHOP_ORIGIN = "https://shop.coilo.de";

type Touch = {
  params: Partial<Record<(typeof ALLOWED_PARAMS)[number], string>>;
  referrer: string;
  ts: number;
};

function readAllowedParams(search: string): Touch["params"] {
  const params = new URLSearchParams(search);
  const captured: Touch["params"] = {};
  for (const key of ALLOWED_PARAMS) {
    const value = params.get(key)?.trim();
    if (value) captured[key] = value;
  }
  return captured;
}

function externalReferrer(): string {
  const ref = document.referrer;
  if (!ref) return "";
  try {
    return new URL(ref).origin === window.location.origin ? "" : ref;
  } catch {
    return "";
  }
}

function readTouch(storage: Storage, key: string): Touch | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Touch;
    return parsed && typeof parsed === "object" && parsed.params ? parsed : null;
  } catch {
    return null;
  }
}

/** "tiktok" from utm_source, else the referrer host, else "direct". */
function touchSource(touch: Touch | null): string {
  if (!touch) return "direct";
  if (touch.params.utm_source) return touch.params.utm_source;
  if (touch.referrer) {
    try {
      return new URL(touch.referrer).hostname.replace(/^www\./, "");
    } catch {
      /* fall through */
    }
  }
  return "direct";
}

/** Call once on page mount: persists inbound attribution for the session. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const touch: Touch = {
      params: readAllowedParams(window.location.search),
      referrer: externalReferrer(),
      ts: Date.now(),
    };

    // Last touch: overwrite whenever this load carries new signal.
    const hasSignal = Object.keys(touch.params).length > 0 || touch.referrer;
    if (hasSignal || !readTouch(sessionStorage, LAST_TOUCH_KEY)) {
      sessionStorage.setItem(LAST_TOUCH_KEY, JSON.stringify(touch));
    }

    // First touch: write once, refresh only after the TTL lapses.
    const first = readTouch(localStorage, FIRST_TOUCH_KEY);
    if (!first || Date.now() - first.ts > FIRST_TOUCH_TTL_MS) {
      localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(touch));
    }
  } catch {
    /* storage unavailable (private mode etc.) — attribution degrades gracefully */
  }
}

export type BuyCta = "hero" | "configurator" | "footer";

/** Plain cart permalink — used as the no-JS href on Buy links. */
export function cartUrl(variantId: string): string {
  return `${SHOP_ORIGIN}/cart/${variantId}:1`;
}

/**
 * Full checkout URL with attribution, built at click time.
 * Cart permalinks put the variant in the path, but we repeat it as
 * `variant=` so it lands in the order's `landing_site` and stays queryable.
 */
export function buyUrl(variantId: string, color: string, cta: BuyCta): string {
  const url = new URL(cartUrl(variantId));
  if (typeof window === "undefined") return url.toString();

  const set = (key: string, value: string | undefined) => {
    if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
  };

  try {
    const last = readTouch(sessionStorage, LAST_TOUCH_KEY);
    const first = readTouch(localStorage, FIRST_TOUCH_KEY);

    set("variant", variantId);
    for (const key of ALLOWED_PARAMS) set(key, last?.params[key]);

    // Direct visits still get a readable source on the Shopify order.
    if (!url.searchParams.has("utm_source")) {
      set("utm_source", "coilo_landing");
      set("utm_medium", "referral");
    }
    set("utm_content", color);

    set("c_color", color);
    set("c_cta", cta);
    set("c_page", window.location.pathname);
    const firstSource = touchSource(first);
    if (first && firstSource !== touchSource(last)) set("c_ft", firstSource);
  } catch {
    /* storage unavailable — fall back to the bare permalink + variant */
    url.searchParams.set("variant", variantId);
  }

  return url.toString();
}

/** Click handler for Buy links: navigates with attribution attached. */
export function goToCheckout(
  e: { preventDefault(): void },
  variantId: string,
  color: string,
  cta: BuyCta,
): void {
  e.preventDefault();
  if (typeof window !== "undefined") {
    window.location.href = buyUrl(variantId, color, cta);
  }
}
