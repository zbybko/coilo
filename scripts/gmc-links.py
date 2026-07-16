#!/usr/bin/env python3
"""Point every Google Merchant Center offer at the right coilo.de deep link.

Reads all products via the Merchant API, then (unless --audit) upserts a
supplemental "coilo.de link overrides" data source with
  https://coilo.de/colors?market=<mkt>&color=<slug>
per offer (EUR feeds get no market param — the site defaults to EUR).

Auth: service-account key at ../.gmc-key.json relative to the repo root
(or $GMC_KEY). The service account must be a user of the Merchant Center
account and the GCP project must be registered (developerRegistration).

Usage:
  python3 scripts/gmc-links.py --audit   # report links + feed prices only
  python3 scripts/gmc-links.py           # audit + fix everything
"""

import base64
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request

ACCOUNT = "5820995176"
KEY_PATH = os.environ.get(
    "GMC_KEY",
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", ".gmc-key.json"),
)
# fallback: key next to the main checkout
if not os.path.exists(KEY_PATH):
    KEY_PATH = os.path.expanduser("~/Documents/Coilo/.gmc-key.json")

DATA_SOURCE_NAME = "coilo.de link overrides"

VARIANT_TO_COLOR = {
    "62010088554826": "sakura",
    "61987185787210": "cyan",
    "62010088587594": "cherry",
    "62010091077962": "rose",
    "62010088620362": "sunflower",
}

# feed-label prefix (currency) -> site market code; EUR = default, no param
CURRENCY_TO_MARKET = {
    "CHF": "ch", "USD": "us", "PLN": "pl", "HUF": "hu",
    "SEK": "se", "DKK": "dk", "GBP": "gb", "RON": "ro", "CZK": "cz",
}


def b64(data: bytes) -> bytes:
    return base64.urlsafe_b64encode(data).rstrip(b"=")


def get_token() -> str:
    key = json.load(open(KEY_PATH))
    now = int(time.time())
    header = b64(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    claims = b64(json.dumps({
        "iss": key["client_email"],
        "scope": "https://www.googleapis.com/auth/content",
        "aud": "https://oauth2.googleapis.com/token",
        "iat": now, "exp": now + 3600,
    }).encode())
    signing_input = header + b"." + claims
    with tempfile.NamedTemporaryFile("w", suffix=".pem", delete=False) as f:
        f.write(key["private_key"])
        pem = f.name
    try:
        sig = subprocess.run(
            ["openssl", "dgst", "-sha256", "-sign", pem],
            input=signing_input, capture_output=True, check=True,
        ).stdout
    finally:
        os.unlink(pem)
    jwt = (signing_input + b"." + b64(sig)).decode()
    data = urllib.parse.urlencode({
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": jwt,
    }).encode()
    with urllib.request.urlopen(
        urllib.request.Request("https://oauth2.googleapis.com/token", data=data)
    ) as r:
        return json.load(r)["access_token"]


def api(token: str, method: str, url: str, body=None):
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode() if body is not None else None,
        method=method,
        headers={
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def target_link(offer_id: str, feed_label: str) -> str | None:
    variant = offer_id.rsplit("_", 1)[-1]
    color = VARIANT_TO_COLOR.get(variant)
    if not color:
        return None
    market = CURRENCY_TO_MARKET.get(feed_label.split("_")[0])
    qs = (f"market={market}&" if market else "") + f"color={color}"
    return f"https://coilo.de/colors?{qs}"


def list_products(token: str):
    products, page = [], None
    while True:
        url = (f"https://merchantapi.googleapis.com/products/v1/accounts/"
               f"{ACCOUNT}/products?pageSize=200")
        if page:
            url += "&pageToken=" + page
        d = api(token, "GET", url)
        products += d.get("products", [])
        page = d.get("nextPageToken")
        if not page:
            return products


def get_product(token: str, product_id: str):
    return api(token, "GET",
               "https://merchantapi.googleapis.com/products/v1/accounts/"
               f"{ACCOUNT}/products/" + urllib.parse.quote(product_id, safe="~"))


def ensure_data_source(token: str) -> str:
    d = api(token, "GET",
            f"https://merchantapi.googleapis.com/datasources/v1/accounts/{ACCOUNT}/dataSources")
    for ds in d.get("dataSources", []):
        if ds.get("displayName") == DATA_SOURCE_NAME:
            return ds["name"]
    created = api(token, "POST",
                  f"https://merchantapi.googleapis.com/datasources/v1/accounts/{ACCOUNT}/dataSources",
                  {"displayName": DATA_SOURCE_NAME,
                   "supplementalProductDataSource": {}})
    return created["name"]


def main():
    audit_only = "--audit" in sys.argv
    token = get_token()
    products = list_products(token)
    print(f"{len(products)} offers in Merchant Center")

    rows, currencies = [], {}
    for p in products:
        pid = p["name"].split("/products/")[1]
        full = get_product(token, pid)
        attrs = full.get("productAttributes", {})
        price = attrs.get("price", {})
        if price.get("currencyCode"):
            currencies[price["currencyCode"]] = int(price.get("amountMicros", 0)) / 1e6
        want = target_link(full["offerId"], full["feedLabel"])
        rows.append({
            "offerId": full["offerId"],
            "lang": full["contentLanguage"],
            "feed": full["feedLabel"],
            "have": attrs.get("link", ""),
            "want": want,
        })

    stale = [r for r in rows if r["want"] and r["have"] != r["want"]]
    print("feed prices:", json.dumps(currencies, sort_keys=True))
    print(f"links correct: {len(rows) - len(stale)} / stale: {len(stale)}")
    if audit_only or not stale:
        return

    ds = ensure_data_source(token)
    print("supplemental data source:", ds)
    fixed = 0
    for r in rows:  # upsert all -> idempotent, same values everywhere
        if not r["want"]:
            continue
        body = {
            "offerId": r["offerId"],
            "contentLanguage": r["lang"],
            "feedLabel": r["feed"],
            "productAttributes": {"link": r["want"]},
        }
        api(token, "POST",
            "https://merchantapi.googleapis.com/products/v1/accounts/"
            f"{ACCOUNT}/productInputs:insert?dataSource=" + ds, body)
        fixed += 1
    print(f"upserted {fixed} link overrides — Merchant Center applies them within ~30 min")


if __name__ == "__main__":
    main()
