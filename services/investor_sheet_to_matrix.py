# backend/services/investor_sheet_to_matrix.py

import csv
from typing import Dict, Any

def investor_sheet_to_matrix(csv_path: str) -> Dict[str, Any]:
    """
    Convert a CSV investor sheet into a matrix overlay structure.
    Expected columns:
    investor, overlay
    """
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
