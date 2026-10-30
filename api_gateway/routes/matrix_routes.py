# backend/api_gateway/routes/matrix_routes.py

import os
import json
from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter(tags=["Matrix"])

MATRIX_PATH = os.getenv("MATRIX_FILE", "data/pricing_matrix.json")


@router.get("/current")
def get_current_matrix():
    """
    Returns the currently active pricing matrix.
    """
    if not os.path.exists(MATRIX_PATH):
        raise HTTPException(status_code=404, detail="Matrix file not found")

    with open(MATRIX_PATH, "r") as f:
        return json.load(f)


@router.post("/upload")
async def upload_matrix(file: UploadFile = File(...)):
    """
    Uploads a new pricing matrix.
    Validates tightened investor-grade matrix format:
    - base_rates
    - adjustments
    - investor_overlays
    """

    if file.content_type not in ["application/json"]:
        raise HTTPException(status_code=400, detail="Matrix must be JSON")

    contents = await file.read()

    try:
        data = json.loads(contents)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    # ---------------------------------------------------------
    # REQUIRED SECTIONS (tightened matrix format)
    # ---------------------------------------------------------
    if "base_rates" not in data:
        raise HTTPException(status_code=400, detail="Missing base_rates section")

    if "adjustments" not in data:
        raise HTTPException(status_code=400, detail="Missing adjustments section")

    if "investor_overlays" not in data:
        raise HTTPException(status_code=400, detail="Missing investor_overlays section")

    # ---------------------------------------------------------
    # SAVE MATRIX
    # ---------------------------------------------------------
    os.makedirs(os.path.dirname(MATRIX_PATH), exist_ok=True)

    with open(MATRIX_PATH, "w") as f:
        json.dump(data, f, indent=4)

    return {"status": "ok", "message": "Matrix updated"}
