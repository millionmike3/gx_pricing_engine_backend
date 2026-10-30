# backend/shared/pricing_engine.py

import json
import os
from typing import Dict, Any, Optional

class PricingEngine:
    """
    Core pricing engine for GenXBaby.
    Loads pricing matrices, applies adjustments, overlays investor rules,
    and produces final pricing output.
    """

    def __init__(self, matrix_path: Optional[str] = None):
        self.matrix_path = matrix_path or os.getenv("MATRIX_FILE", "data/pricing_matrix.json")
        self.matrix = self._load_matrix()

    # ----------------------------------------------------------------------
    # MATRIX LOADER
    # ----------------------------------------------------------------------
    def _load_matrix(self) -> Dict[str, Any]:
        """Load the pricing matrix from JSON."""
        if not os.path.exists(self.matrix_path):
            raise FileNotFoundError(f"Pricing matrix not found at {self.matrix_path}")

        with open(self.matrix_path, "r") as f:
            return json.load(f)

    # ----------------------------------------------------------------------
    # BASE RATE LOOKUP
    # ----------------------------------------------------------------------
    def get_base_rate(self, fico: int, ltv: float, loan_amount: float) -> float:
        """
        Pull base rate from matrix using FICO, LTV, and loan amount.
        Matrix structure example:
        {
            "fico": {
                "700-719": {
                    "ltv": {
                        "80-85": {
                            "base_rate": 7.25
                        }
                    }
                }
            }
        }
        """

        fico_bucket = self._bucket_fico(fico)
        ltv_bucket = self._bucket_ltv(ltv)

        try:
            return self.matrix["fico"][fico_bucket]["ltv"][ltv_bucket]["base_rate"]
        except KeyError:
            raise ValueError(f"No base rate found for FICO={fico}, LTV={ltv}")

    # ----------------------------------------------------------------------
    # BUCKET HELPERS
    # ----------------------------------------------------------------------
    def _bucket_fico(self, fico: int) -> str:
        if fico >= 760:
            return "760+"
        if fico >= 740:
            return "740-759"
        if fico >= 720:
            return "720-739"
        if fico >= 700:
            return "700-719"
        if fico >= 680:
            return "680-699"
        return "<=679"

    def _bucket_ltv(self, ltv: float) -> str:
        if ltv <= 60:
            return "0-60"
        if ltv <= 70:
            return "60-70"
        if ltv <= 75:
            return "70-75"
        if ltv <= 80:
            return "75-80"
        if ltv <= 85:
            return "80-85"
        if ltv <= 90:
            return "85-90"
        return "90+"

    # ----------------------------------------------------------------------
    # ADJUSTMENTS ENGINE
    # ----------------------------------------------------------------------
    def apply_adjustments(self, base_rate: float, params: Dict[str, Any]) -> float:
        """
        Apply borrower-level adjustments:
        - DSCR
        - Property type
        - Occupancy
        - Loan purpose
        - State overlays
        """

        rate = base_rate

        # DSCR adjustments
        dscr = params.get("dscr")
        if dscr is not None:
            if dscr < 1.0:
                rate += 1.00
            elif dscr < 1.2:
                rate += 0.50
            elif dscr < 1.4:
                rate += 0.25

        # Property type
        property_type = params.get("property_type")
        if property_type == "condo":
            rate += 0.25
        elif property_type == "2-4 unit":
            rate += 0.50
        elif property_type == "mixed-use":
            rate += 0.75

        # Occupancy
        occupancy = params.get("occupancy")
        if occupancy == "investment":
            rate += 0.50
        elif occupancy == "second_home":
            rate += 0.25

        # Loan purpose
        purpose = params.get("purpose")
        if purpose == "cashout":
            rate += 0.375
        elif purpose == "delayed_financing":
            rate += 0.25

        # State overlays
        state = params.get("state")
        if state in ["NY", "NJ", "CA"]:
            rate += 0.125

        return rate

    # ----------------------------------------------------------------------
    # INVESTOR OVERLAYS
    # ----------------------------------------------------------------------
    def apply_investor_overlays(self, rate: float, investor: str) -> float:
        """
        Apply investor-specific overlays.
        """

        overlays = {
            "Bayview": 0.25,
            "AXA": 0.125,
            "Wealthfront": 0.375,
            "SubstantialFunding": -0.10,  # Your own investor gets a discount
        }

        return rate + overlays.get(investor, 0.0)

    # ----------------------------------------------------------------------
    # FINAL PRICING OUTPUT
    # ----------------------------------------------------------------------
    def calculate_price(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main pricing function.
        """

        fico = params["fico"]
        ltv = params["ltv"]
        loan_amount = params["loan_amount"]
        investor = params.get("investor", "SubstantialFunding")

        base_rate = self.get_base_rate(fico, ltv, loan_amount)
        adjusted_rate = self.apply_adjustments(base_rate, params)
        final_rate = self.apply_investor_overlays(adjusted_rate, investor)

        return {
            "base_rate": round(base_rate, 3),
            "adjusted_rate": round(adjusted_rate, 3),
            "final_rate": round(final_rate, 3),
            "investor": investor,
            "inputs": params
        }
