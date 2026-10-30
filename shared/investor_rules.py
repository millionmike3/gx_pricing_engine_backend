# backend/shared/investor_rules.py

from typing import Dict

INVESTOR_OVERLAYS: Dict[str, float] = {
    "Bayview": 0.25,
    "AXA": 0.125,
    "Wealthfront": 0.375,
    "SubstantialFunding": -0.10,
}

def apply_investor_overlay(rate: float, investor: str | None) -> float:
    if investor is None:
        investor = "SubstantialFunding"
    return rate + INVESTOR_OVERLAYS.get(investor, 0.0)
