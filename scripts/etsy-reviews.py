#!/usr/bin/env python3
"""Pull new 5★ Etsy reviews into lib/reviews.json (+ buyer photos).

Existing entries are never modified — names, countries and German
translations added by hand stay put. New reviews arrive with
name/country unset (the site shows "Verified buyer") and text.de equal
to the original text until translated manually.

Auth: ETSY_KEYSTRING + ETSY_SHARED_SECRET env vars, or the same keys in
~/Documents/Coilo/.env. Shop id is fixed (Coilo, 64967232).

Usage: python3 scripts/etsy-reviews.py
"""

import json
import os
import re
import sys
import urllib.request

SHOP_ID = 64967232
ROOT = os.path.join(os.path.dirname(__file__), "..")
REVIEWS_JSON = os.path.join(ROOT, "lib", "reviews.json")
PHOTOS_DIR = os.path.join(ROOT, "public", "media", "reviews")

ACCENTS = ["#1BA6DF", "#F0457A", "#F2A900", "#F2A3BE", "#C0303A"]


def load_env_key():
    key = os.environ.get("ETSY_KEYSTRING")
    secret = os.environ.get("ETSY_SHARED_SECRET")
    if key and secret:
        return key, secret
    env = os.path.expanduser("~/Documents/Coilo/.env")
    if os.path.exists(env):
        kv = dict(re.findall(r"^([A-Z_]+)=(.*)$", open(env).read(), re.M))
        return kv.get("ETSY_KEYSTRING"), kv.get("ETSY_SHARED_SECRET")
    return None, None


def main():
    key, secret = load_env_key()
    if not key or not secret:
        sys.exit("ETSY_KEYSTRING / ETSY_SHARED_SECRET not configured")

    req = urllib.request.Request(
        f"https://api.etsy.com/v3/application/shops/{SHOP_ID}/reviews?limit=100",
        headers={"x-api-key": f"{key}:{secret}"},
    )
    reviews = json.load(urllib.request.urlopen(req))["results"]

    data = json.load(open(REVIEWS_JSON))
    known = {r["transactionId"] for r in data}
    added = 0

    for r in sorted(reviews, key=lambda r: -r["create_timestamp"]):
        txn = r["transaction_id"]
        if txn in known or r["rating"] != 5 or not (r.get("review") or "").strip():
            continue
        entry = {
            "transactionId": txn,
            "date": __import__("datetime").datetime.utcfromtimestamp(
                r["create_timestamp"]).strftime("%Y-%m"),
            "text": {"en": r["review"].strip(), "de": r["review"].strip()},
            "accent": ACCENTS[len(data) % len(ACCENTS)],
        }
        if r.get("image_url_fullxfull"):
            os.makedirs(PHOTOS_DIR, exist_ok=True)
            photo = f"review-{txn}.jpg"
            urllib.request.urlretrieve(
                r["image_url_fullxfull"], os.path.join(PHOTOS_DIR, photo))
            entry["img"] = f"/media/reviews/{photo}"
            entry["alt"] = "Customer photo: Coilo Spiral Bookshelf"
        # newest first, but keep photo reviews leading the carousel
        data.append(entry)
        added += 1

    if added:
        data.sort(key=lambda r: (not r.get("img"), r["date"]), reverse=False)
        data.sort(key=lambda r: not r.get("img"))
        json.dump(data, open(REVIEWS_JSON, "w"), ensure_ascii=False, indent=2)
        open(REVIEWS_JSON, "a").write("\n")
    print(f"etsy reviews: {len(reviews)} fetched, {added} new added")


if __name__ == "__main__":
    main()
