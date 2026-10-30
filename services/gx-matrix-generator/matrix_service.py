# backend/services/matrix_service.py

import json
import os
from typing import Dict, Any, Optional

class MatrixService:
    """
    Loads, validates, normalizes, and merges pricing matrices.
    This is the core matrix manager for GenXBaby OS.
    """

    def __init__(self, matrix_path: Optional[str] = None):
        self.matrix_path = matrix_path or os.getenv("MATRIX_FILE", "data/pricing_matrix.json")

    # ----------------------------------------------------------------------
    # LOAD MATRIX
    # ----------------------------------------------------------------------
    def load(self) -> Dict[str, Any]:
        if not os.path.exists(self.matrix_path):
            raise FileNotFoundError(f"Matrix file not found at {self.matrix_path}")

        with open(self.matrix_path, "r") as f:
            return json.load(f)

    # ----------------------------------------------------------------------
    # VALIDATE MATRIX FORMAT
    # ----------------------------------------------------------------------
    def validate(self, matrix: Dict[str, Any]) -> None:
        required_sections = ["base_rates", "adjustments", "investor_overlays"]

        for section in required_sections:
            if section not in matrix:
                raise ValueError(f"Matrix missing required section: {section}")

        # Validate base rate structure
        if "30yr_fixed" not in matrix["base_rates"]:
            raise ValueError("Matrix missing base_rates.30yr_fixed")

        # Validate adjustments
        for adj in ["property_type", "occupancy", "purpose", "state", "dscr"]:
            if adj not in matrix["adjustments"]:
                raise ValueError(f"Matrix missing adjustments.{adj}")

        # Validate investor overlays
        if not isinstance(matrix["investor_overlays"], dict):
            raise ValueError("investor_overlays must be a dictionary")

    # ----------------------------------------------------------------------
    # NORMALIZE MATRIX (optional future expansion)
    # ----------------------------------------------------------------------
    def normalize(self, matrix: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize matrix values (future expansion: rounding, sorting, etc.)
        """
        return matrix

    # ----------------------------------------------------------------------
    # MERGE INVESTOR SHEET (optional)
    # ----------------------------------------------------------------------
    def merge_investor_sheet(self, matrix: Dict[str, Any], investor_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Merge investor-specific overlays or base rate curves.
        """
        matrix["investor_overlays"].update(investor_data.get("investor_overlays", {}))
        return matrix

    # ----------------------------------------------------------------------
    # SAVE MATRIX
    # ----------------------------------------------------------------------
    def save(self, matrix: Dict[str, Any]):
        os.makedirs(os.path.dirname(self.matrix_path), exist_ok=True)
        with open(self.matrix_path, "w") as f:
            json.dump(matrix, f, indent=4)

    # ----------------------------------------------------------------------
    # PUBLIC API: LOAD + VALIDATE + NORMALIZE
    # ----------------------------------------------------------------------
    def get_matrix(self) -> Dict[str, Any]:
        matrix = self.load()
        self.validate(matrix)
        return self.normalize(matrix)
