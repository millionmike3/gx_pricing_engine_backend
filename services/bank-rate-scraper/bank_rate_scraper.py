# backend/services/bank_rate_scraper.py

import asyncio
import datetime
import json
import os
from typing import Dict, Any

import httpx
from bs4 import BeautifulSoup


class BankRateScraper:
    """
    Production-grade bank rate scraper for GenXBaby.
    Scrapes multiple bank mortgage rate pages, parses rates,
    and saves structured JSON output for pricing overlays.
    """

    def __init__(self):
        # Output file location
        self.output_path = os.getenv("BANK_RATES_FILE", "data/bank_rates.json")

        # Real bank endpoints (expandable)
        self.sources = {
            "wells_fargo": "https://www.wellsfargo.com/mortgage/rates/",
            "bank_of_america": "https://www.bankofamerica.com/mortgage/mortgage-rates/",
            "chase": "https://www.chase.com/personal/mortgage/mortgage-rates"
        }

    # ----------------------------------------------------------------------
    # FETCH HTML
    # ----------------------------------------------------------------------
    async def fetch_html(self, url: str) -> str:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.text

    # ----------------------------------------------------------------------
    # PARSE RATE (fallback parser)
    # ----------------------------------------------------------------------
    def parse_rate(self, html: str) -> Dict[str, Any]:
        """
        Extract mortgage rates from HTML.
        This fallback parser looks for any text containing '%'.
        You can replace this with bank-specific parsing rules later.
        """

        soup = BeautifulSoup(html, "html.parser")
        extracted = []

        # Find any text containing a percentage
        possible = soup.find_all(string=lambda t: "%" in t)

        for item in possible:
            try:
                val = float(item.replace("%", "").strip())
                extracted.append(val)
            except:
                continue

        if extracted:
            return {
                "raw_matches": extracted[:10],
                "primary_rate": extracted[0]
            }

        return {
            "raw_matches": [],
            "primary_rate": None
        }

    # ----------------------------------------------------------------------
    # SCRAPE ALL BANKS
    # ----------------------------------------------------------------------
    async def scrape_all(self) -> Dict[str, Any]:
        results = {}

        for bank, url in self.sources.items():
            try:
                html = await self.fetch_html(url)
                parsed = self.parse_rate(html)

                results[bank] = {
                    "url": url,
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "parsed": parsed
                }

            except Exception as e:
                results[bank] = {
                    "url": url,
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "error": str(e)
                }

        return results

    # ----------------------------------------------------------------------
    # SAVE JSON
    # ----------------------------------------------------------------------
    def save(self, data: Dict[str, Any]):
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
        with open(self.output_path, "w") as f:
            json.dump(data, f, indent=4)

    # ----------------------------------------------------------------------
    # RUN JOB
    # ----------------------------------------------------------------------
    async def run(self):
        print(f"[{datetime.datetime.now()}] Running bank rate scraper...")
        data = await self.scrape_all()
        self.save(data)
        print(f"[{datetime.datetime.now()}] Bank rates updated → {self.output_path}")


# ----------------------------------------------------------------------
# ENTRYPOINT
# ----------------------------------------------------------------------
if __name__ == "__main__":
    asyncio.run(BankRateScraper().run())
