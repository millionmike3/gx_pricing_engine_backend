# backend/services/investor_pricing_sheet_parser.py

import csv
from typing import Dict, Any

def parse_investor_sheet(csv_path: str) -> Dict[str, Any]:
    overlays = {}

    with open(csv_path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            investor = row["investor"]
            overlay = float(row["overlay"])
            overlays[investor] = overlay

    return {
        "base_rates": {},
        "adjustments": {},
        "investor_overlays": overlays
    }
