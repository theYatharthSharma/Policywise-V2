"""
Downloads brochure PDFs listed in data/brochures/manifest.json into that
same folder, for entries whose source_url is a direct PDF link.

Run from the backend/ folder:
    python scripts/download_brochures.py

For manifest entries whose source_url points at a licindia.in *listing*
page rather than a direct PDF (because the exact PDF path changes and
wasn't confirmed), this prints instructions instead of guessing a URL:
open the page, click "Sales Brochure" under the relevant plan, save it
as the filename shown, and drop it into data/brochures/.
"""
import json
from pathlib import Path

import requests

BACKEND_DIR = Path(__file__).resolve().parent.parent
BROCHURE_DIR = BACKEND_DIR / "data" / "brochures"
MANIFEST_PATH = BROCHURE_DIR / "manifest.json"


def main():
    manifest = json.loads(MANIFEST_PATH.read_text())
    for entry in manifest:
        url = entry["source_url"]
        dest = BROCHURE_DIR / entry["file"]

        if dest.exists():
            print(f"= '{entry['title']}' already downloaded, skipping.")
            continue

        print(f"> Trying '{entry['title']}' ...")
        try:
            resp = requests.get(url, timeout=60, headers={"User-Agent": "Mozilla/5.0"})
            resp.raise_for_status()
        except requests.RequestException as e:
            print(f"  ! request failed: {e}\n")
            continue

        content_type = resp.headers.get("Content-Type", "")
        looks_like_pdf = resp.content[:4] == b"%PDF" or "pdf" in content_type.lower()
        if not looks_like_pdf:
            print(f"  ! Response wasn't a PDF (Content-Type: {content_type}). "
                  f"This entry's source_url is probably a listing page, not a direct file.")
            print(f"    Open {url}, find the plan, click 'Sales Brochure',")
            print(f"    and save it manually as: {dest}\n")
            continue

        dest.write_bytes(resp.content)
        print(f"  saved to {dest} ({len(resp.content) // 1024} KB)")


if __name__ == "__main__":
    main()
