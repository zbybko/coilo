// Ad click-ID passthrough for the headless landing -> Shopify checkout hop.
//
// Google Ads (PMax) lands visitors on coilo.de with ?gclid=... (auto-tagging).
// The purchase happens on shop.coilo.de, a separate first-party context, so if
// we drop the click ID here Google never attributes the conversion and the
// campaign optimizes blind. Fix: capture the IDs on landing, persist them for
// the session, and re-append them to the Shopify cart-permalink URL. Shopify
// records the landing query params of the session (customer journey) and the
// Google & YouTube app reports the conversion with that attribution.

const KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "gad_source",
  "utm_source",
  "utm_medium",
  "utm_campaign",
] as const;

const PREFIX = "coilo_clickid_";

/** Call once on page mount: stores any ad click IDs present in the URL. */
export function captureClickIds(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    for (const key of KEYS) {
      const value = params.get(key);
      if (value) sessionStorage.setItem(PREFIX + key, value);
    }
  } catch {
    /* storage unavailable (private mode etc.) — attribution degrades gracefully */
  }
}

/** Append stored click IDs to an outbound checkout URL. */
export function withClickIds(url: string): string {
  if (typeof window === "undefined") return url;
  try {
    const target = new URL(url);
    for (const key of KEYS) {
      const value = sessionStorage.getItem(PREFIX + key);
      if (value && !target.searchParams.has(key)) {
        target.searchParams.set(key, value);
      }
    }
    return target.toString();
  } catch {
    return url;
  }
}

/** Click handler for checkout links: navigates with click IDs attached. */
export function goToCheckout(e: { preventDefault(): void }, url: string): void {
  e.preventDefault();
  if (typeof window !== "undefined") window.location.href = withClickIds(url);
}
