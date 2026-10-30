# backend/api_gateway/routes/config_routes.py

import os
from fastapi import APIRouter

router = APIRouter(tags=["Config"])

@router.get("/env")
def get_env_config():
    return {
        "MATRIX_FILE": os.getenv("MATRIX_FILE", "data/pricing_matrix.json"),
        "ENV": os.getenv("ENV", "local"),
    }

@router.get("/health")
def health_check():
    return {"status": "ok", "service": "GenXBaby Pricing Engine Gateway"}
