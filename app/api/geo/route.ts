// Country lookup for market-aware pricing. Cloudflare sets CF-IPCountry on
// every request; the client fetches this once per session (see useMarket).
export async function GET(request: Request) {
  const country = request.headers.get("cf-ipcountry") ?? "";
  return Response.json(
    { country },
    { headers: { "Cache-Control": "no-store" } },
  );
}
