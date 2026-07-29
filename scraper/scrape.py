"""
Main entrypoint for the hackathon scraper.

Usage:
    python scrape.py

Reads scraper/sources.py for the list of URLs, fetches + cleans each page,
runs the AI extraction pipeline on it, validates/normalizes the fields,
de-duplicates against previously scraped data, and writes the merged
result to data/hackathons.json (repo root) which the React frontend reads.
"""

import json
import os
import sys
import time
import traceback
from datetime import datetime, timezone

from dotenv import load_dotenv

from fetch_page import fetch_clean_text
from ai_extract import extract_hackathons
from sources import SOURCE_URLS

load_dotenv()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_OUTPUT_PATH = os.path.join(ROOT, "frontend", "public", "data", "hackathons.json")

VALID_MODES = {"online", "offline", "hybrid"}
VALID_REGIONS = {"kerala", "india", "global"}
VALID_TYPES = {"software", "hardware", "hybrid"}


def normalize(item: dict) -> dict:
    item["mode"] = str(item.get("mode", "")).strip().lower()
    if item["mode"] not in VALID_MODES:
        item["mode"] = "offline"

    item["region"] = str(item.get("region", "")).strip().lower()
    if item["region"] not in VALID_REGIONS:
        item["region"] = "india"

    item["hackathon_type"] = str(item.get("hackathon_type", "")).strip().lower()
    if item["hackathon_type"] not in VALID_TYPES:
        item["hackathon_type"] = "software"

    for field in [
        "title", "date", "venue", "registration_url", "prize_pool",
        "prize_details", "max_participants", "theme", "organizer", "source_url",
    ]:
        item.setdefault(field, "")
        item[field] = str(item[field]).strip()

    return item


def dedupe_key(item: dict) -> str:
    return (item.get("title", "").lower().strip() + "|" + item.get("date", "").lower().strip())


def load_existing() -> list[dict]:
    if os.path.exists(FRONTEND_OUTPUT_PATH):
        try:
            with open(FRONTEND_OUTPUT_PATH, "r", encoding="utf-8") as f:
                return json.load(f).get("hackathons", [])
        except Exception:
            return []
    return []


def main():
    print(f"Scraping {len(SOURCE_URLS)} source(s)...")
    existing = load_existing()
    by_key = {dedupe_key(h): h for h in existing}

    errors = []
    for i, url in enumerate(SOURCE_URLS, 1):
        print(f"[{i}/{len(SOURCE_URLS)}] {url}")
        try:
            text = fetch_clean_text(url)
            items = extract_hackathons(text, url)
            print(f"    -> extracted {len(items)} hackathon(s)")
            for item in items:
                item = normalize(item)
                by_key[dedupe_key(item)] = item  # newer scrape overwrites older
            time.sleep(300)  # be polite / respect free-tier rate limits
        except Exception as e:
            print(f"    !! error: {e}")
            errors.append({"url": url, "error": str(e)})
            traceback.print_exc()

    result = {
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "total": len(by_key),
        "hackathons": list(by_key.values()),
        "scrape_errors": errors,
    }

    os.makedirs(os.path.dirname(FRONTEND_OUTPUT_PATH), exist_ok=True)
    with open(FRONTEND_OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"\nDone. {len(by_key)} total hackathons written to {FRONTEND_OUTPUT_PATH}")
    if errors:
        print(f"{len(errors)} source(s) failed - see scrape_errors in the JSON.")


if __name__ == "__main__":
    sys.exit(main())
