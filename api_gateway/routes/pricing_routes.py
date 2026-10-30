# backend/api_gateway/routes/pricing_routes.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from shared.pricing_engine import PricingEngine
from shared.pricing_engine_v2 import PricingEngineV2

router = APIRouter(tags=["Pricing"])

engine_v1 = PricingEngine()
engine_v2 = PricingEngineV2()


class PricingRequest(BaseModel):
    fico: int
    ltv: float
    loan_amount: float
    investor: str | None = "SubstantialFunding"
    property_type: str | None = None
    occupancy: str | None = None
    purpose: str | None = None
    state: str | None = None
    dscr: float | None = None
    version: int | None = 1  # 1 or 2


@router.post("/quote")
def get_quote(req: PricingRequest):
    params = req.dict()

    if req.version == 1:
        result_v1 = engine_v1.calculate_price(params)
        return {"version": 1, "result": result_v1}

    if req.version == 2:
        result_v2 = engine_v2.calculate_price(params)
        return {"version": 2, "result": result_v2}

    raise HTTPException(status_code=400, detail="Invalid version; must be 1 or 2")


@router.post("/quote/compare")
def compare_quote(req: PricingRequest):
    params = req.dict()
    result_v1 = engine_v1.calculate_price(params)
    result_v2 = engine_v2.calculate_price(params)

    return {
        "v1": result_v1,
        "v2": result_v2,
        "delta": {
            "final_rate_diff": round(result_v2["final_rate"] - result_v1["final_rate"], 3)
        }
    }
