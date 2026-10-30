# backend/shared/matrix_loader.py

import json
import os
from typing import Dict, Any

def load_matrix(matrix_path: str | None = None) -> Dict[str, Any]:
    path = matrix_path or os.getenv("MATRIX_FILE", "data/pricing_matrix.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Matrix not found at {path}")
    with open(path, "r") as f:
        return json.load(f)
