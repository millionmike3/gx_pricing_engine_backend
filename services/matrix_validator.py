# backend/services/matrix_validator.py

from typing import Dict, Any

class MatrixValidator:
    REQUIRED_SECTIONS = ["base_rates", "adjustments", "investor_overlays"]
    REQUIRED_ADJUSTMENTS = ["property_type", "occupancy", "purpose", "state", "dscr"]

    def validate(self, matrix: Dict[str, Any]) -> None:
        for section in self.REQUIRED_SECTIONS:
            if section not in matrix:
                raise ValueError(f"Missing section: {section}")

        base_rates = matrix["base_rates"]
        if "30yr_fixed" not in base_rates:
            raise ValueError("Missing base_rates.30yr_fixed")

        fico = base_rates["30yr_fixed"].get("fico")
        if not isinstance(fico, dict):
            raise ValueError("base_rates.30yr_fixed.fico must be a dict")

        for adj in self.REQUIRED_ADJUSTMENTS:
            if adj not in matrix["adjustments"]:
                raise ValueError(f"Missing adjustments.{adj}")

        if not isinstance(matrix["investor_overlays"], dict):
            raise ValueError("investor_overlays must be a dict")
