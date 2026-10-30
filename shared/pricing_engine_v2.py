# backend/shared/pricing_engine_v2.py

import json
import os
from typing import Dict, Any, Optional

from shared.rate_adjustments import apply_borrower_adjustments
from shared.investor_rules import apply_investor_overlay

class PricingEngineV2:
    """
    V2 pricing engine:
    - Tightened matrix format
    - 30yr fixed base rates
    - Modular borrower adjustments
    - Investor overlays
    """

    def __init__(self, matrix_path: Optional[str] = None):
        self.matrix_path = matrix_path or os.getenv("MATRIX_FILE", "data/pricing_matrix.json")
        self.matrix = self._load_matrix()

    def _load_matrix(self) -> Dict[str, Any]:
        if not os.path.exists(self.matrix_path):
            raise FileNotFoundError(f"Pricing matrix not found at {self.matrix_path}")
        with open(self.matrix_path, "r") as f:
            return json.load(f)

    def _bucket_fico(self, fico: int) -> str:
        if fico >= 760: return "760+"
        if fico >= 740: return "740-759"
        if fico >= 720: return "720-739"
        if fico >= 700: return "700-719"
        if fico >= 680: return "680-699"
        return "<=679"

    def _bucket_ltv(self, ltv: float) -> str:
        if ltv <= 60: return "0-60"
        if ltv <= 70: return "60-70"
        if ltv <= 75: return "70-75"
        if ltv <= 80: return "75-80"
        if ltv <= 85: return "80-85"
        if ltv <= 90: return "85-90"
        return "90+"

    def get_base_rate(self, fico: int, ltv: float) -> float:
        fico_bucket = self._bucket_fico(fico)
        ltv_bucket = self._bucket_ltv(ltv)

        return self.matrix["base_rates"]["30yr_fixed"]["fico"][fico_bucket]["ltv"][ltv_bucket]

    def calculate_price(self, params: Dict[str, Any]) -> Dict[str, Any]:
        fico = params["fico"]
        ltv = params["ltv"]
        investor = params.get("investor", "SubstantialFunding")

        base_rate = self.get_base_rate(fico, ltv)

        adjusted_rate = apply_borrower_adjustments(base_rate, params)
        final_rate = apply_investor_overlay(adjusted_rate, investor)

        return {
            "base_rate": round(base_rate, 3),
            "adjusted_rate": round(adjusted_rate, 3),
            "final_rate": round(final_rate, 3),
            "investor": investor,
            "inputs": params
        }
