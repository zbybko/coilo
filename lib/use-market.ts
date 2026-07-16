"use client";

import { useEffect, useState } from "react";
import { Market, MARKETS, resolveMarket } from "./market";

const CACHE_KEY = "coilo_market";

/**
 * Market for price display. `?market=` param wins (Merchant Center deep
 * links), then the session cache, then a one-time /api/geo lookup.
 */
export function useMarket(): Market {
  const [market, setMarket] = useState<Market>(MARKETS.eur);

  useEffect(() => {
    try {
      const param = new URLSearchParams(window.location.search).get("market");
      if (param) {
        const m = resolveMarket(param);
        sessionStorage.setItem(CACHE_KEY, m.code);
        setMarket(m);
        return;
      }
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        setMarket(resolveMarket(cached));
        return;
      }
      fetch("/api/geo")
        .then((r) => r.json())
        .then(({ country }: { country: string }) => {
          const m = resolveMarket(null, country);
          sessionStorage.setItem(CACHE_KEY, m.code);
          setMarket(m);
        })
        .catch(() => {
          /* stay on EUR */
        });
    } catch {
      /* stay on EUR */
    }
  }, []);

  return market;
}
