# backend/shared/rate_adjustments.py

from typing import Dict, Any

def apply_borrower_adjustments(base_rate: float, params: Dict[str, Any]) -> float:
    rate = base_rate

    dscr = params.get("dscr")
    if dscr is not None:
        if dscr < 1.0:
            rate += 1.00
        elif dscr < 1.2:
            rate += 0.50
        elif dscr < 1.4:
            rate += 0.25

    property_type = params.get("property_type")
    if property_type == "condo":
        rate += 0.25
    elif property_type == "2-4 unit":
        rate += 0.50
    elif property_type == "mixed-use":
        rate += 0.75

    occupancy = params.get("occupancy")
    if occupancy == "investment":
        rate += 0.50
    elif occupancy == "second_home":
        rate += 0.25

    purpose = params.get("purpose")
    if purpose == "cashout":
        rate += 0.375
    elif purpose == "delayed_financing":
        rate += 0.25

    state = params.get("state")
    if state in ["NY", "NJ", "CA"]:
        rate += 0.125

    return rate
