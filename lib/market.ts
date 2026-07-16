// Market-aware pricing. Prices must match the Google Merchant Center feeds
// (Shopify Markets is the source of truth — update both together).
//
// Resolution order (useMarket): ?market= URL param (used by Merchant Center
// deep links so the crawler always sees the right currency regardless of IP)
// → cached geo → /api/geo (CF-IPCountry) → EUR default.

export type MarketCode =
  | "eur" | "ch" | "us" | "pl" | "hu" | "se" | "dk" | "gb" | "ro" | "cz";

export type Market = {
  code: MarketCode;
  currency: string;
  amount: number;
  /** Human display, e.g. "CHF 56" / "261 zł" */
  display: string;
};

// NOTE: non-EUR prices come from Shopify Markets auto-conversion and drift
// with FX rates. Re-sync with `python3 scripts/gmc-links.py --audit` (reads
// the live Merchant Center feeds) or pin manual prices in Shopify Markets.
export const MARKETS: Record<MarketCode, Market> = {
  eur: { code: "eur", currency: "EUR", amount: 59, display: "€59" },
  ch: { code: "ch", currency: "CHF", amount: 56, display: "CHF 56" },
  us: { code: "us", currency: "USD", amount: 69, display: "$69" },
  pl: { code: "pl", currency: "PLN", amount: 261, display: "261 zł" },
  hu: { code: "hu", currency: "HUF", amount: 21700, display: "21 700 Ft" },
  se: { code: "se", currency: "SEK", amount: 664, display: "664 kr" },
  dk: { code: "dk", currency: "DKK", amount: 450, display: "450 kr" },
  gb: { code: "gb", currency: "GBP", amount: 52, display: "£52" },
  ro: { code: "ro", currency: "RON", amount: 316, display: "316 lei" },
  cz: { code: "cz", currency: "CZK", amount: 1456, display: "1 456 Kč" },
};

const COUNTRY_TO_MARKET: Record<string, MarketCode> = {
  CH: "ch", LI: "ch",
  US: "us",
  PL: "pl",
  HU: "hu",
  SE: "se",
  DK: "dk",
  GB: "gb",
  RO: "ro",
  CZ: "cz",
};

export function resolveMarket(param?: string | null, country?: string | null): Market {
  const p = param?.trim().toLowerCase();
  if (p && p in MARKETS) return MARKETS[p as MarketCode];
  const c = country?.trim().toUpperCase();
  if (c && COUNTRY_TO_MARKET[c]) return MARKETS[COUNTRY_TO_MARKET[c]];
  return MARKETS.eur;
}
