# backend/shared/pricing_engine.py

import json
import os
from typing import Dict, Any, Optional

from shared.rate_adjustments import apply_borrower_adjustments
from shared.investor_rules import apply_investor_overlay


class PricingEngine:
    """
    Core pricing engine for GenXBaby.
    Loads the tightened investor-grade pricing matrix, applies borrower-level
    adjustments, investor overlays, and produces final pricing output.
    """

    def __init__(self, matrix_path: Optional[str] = None):
        self.matrix_path = matrix_path or os.getenv("MATRIX_FILE", "data/pricing_matrix.json")
        self.matrix = self._load_matrix()

    # ----------------------------------------------------------------------
    # MATRIX LOADER
    # ----------------------------------------------------------------------
    def _load_matrix(self) -> Dict[str, Any]:
        if not os.path.exists(self.matrix_path):
            raise FileNotFoundError(f"Pricing matrix not found at {self.matrix_path}")

        with open(self.matrix_path, "r") as f:
            return json.load(f)

    # ----------------------------------------------------------------------
    # BASE RATE LOOKUP (NEW FORMAT)
    # ----------------------------------------------------------------------
    def get_base_rate(self, fico: int, ltv: float, loan_amount: float) -> float:
        """
        Uses tightened matrix format:
        matrix["base_rates"]["30yr_fixed"]["fico"][bucket]["ltv"][bucket]
        """

        fico_bucket = self._bucket_fico(fico)
        ltv_bucket = self._bucket_ltv(ltv)

        try:
            return self.matrix["base_rates"]["30yr_fixed"]["fico"][fico_bucket]["ltv"][ltv_bucket]
        except KeyError:
            raise ValueError(
                f"No base rate found for FICO={fico_bucket}, LTV={ltv_bucket}"
            )

    # ----------------------------------------------------------------------
    # BUCKET HELPERS
    # ----------------------------------------------------------------------
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

    # ----------------------------------------------------------------------
    # FINAL PRICING OUTPUT
    # ----------------------------------------------------------------------
    def calculate_price(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Full pricing pipeline:
        1. Base rate lookup
        2. Borrower adjustments (DSCR, property type, occupancy, purpose, state)
        3. Investor overlays
        """

        fico = params["fico"]
        ltv = params["ltv"]
        loan_amount = params["loan_amount"]
        investor = params.get("investor", "SubstantialFunding")

        # 1. Base rate
        base_rate = self.get_base_rate(fico, ltv, loan_amount)

        # 2. Borrower adjustments (modular engine)
        adjusted_rate = apply_borrower_adjustments(base_rate, params)

        # 3. Investor overlays (modular engine)
        final_rate = apply_investor_overlay(adjusted_rate, investor)

        return {
            "base_rate": round(base_rate, 3),
            "adjusted_rate": round(adjusted_rate, 3),
            "final_rate": round(final_rate, 3),
            "investor": investor,
            "inputs": params
        }
