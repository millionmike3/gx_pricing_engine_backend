# backend/api_gateway/routes/admin_pricing_dashboard.py

import os
import json
from fastapi import APIRouter, HTTPException
from shared.pricing_engine import PricingEngine
from shared.borrower_rules import validate_borrower

router = APIRouter(tags=["Admin Pricing Dashboard"])

engine = PricingEngine()

MATRIX_PATH = os.getenv("MATRIX_FILE", "data/pricing_matrix.json")

@router.get("/matrix")
def admin_get_matrix():
    if not os.path.exists(MATRIX_PATH):
        raise HTTPException(status_code=404, detail="Matrix file not found")
    with open(MATRIX_PATH, "r") as f:
        return json.load(f)

@router.post("/test-scenario")
def admin_test_scenario(payload: dict):
    validation = validate_borrower(payload)
    if not validation["valid"]:
        return {"valid": False, "issues": validation["issues"]}

    result = engine.calculate_price(payload)
    return {"valid": True, "pricing": result}

@router.get("/summary")
def admin_summary():
    return {
        "service": "GenXBaby Pricing Engine",
        "env": os.getenv("ENV", "local"),
        "matrix_file": MATRIX_PATH,
    }
