# backend/api_gateway/server.py

from fastapi import FastAPI

from api_gateway.routes.pricing_routes import router as pricing_router
from api_gateway.routes.matrix_routes import router as matrix_router
from api_gateway.routes.config_routes import router as config_router
from api_gateway.routes.admin_pricing_dashboard import router as admin_router

from api_gateway.middleware.logging_middleware import LoggingMiddleware
# from api_gateway.middleware.auth_middleware import AuthMiddleware


app = FastAPI(
    title="GenXBaby Pricing Engine Gateway",
    version="1.0.0"
)

# ROUTES
app.include_router(pricing_router, prefix="/pricing")
app.include_router(matrix_router, prefix="/matrix")
app.include_router(config_router, prefix="/config")
app.include_router(admin_router, prefix="/admin")

# MIDDLEWARE
app.add_middleware(LoggingMiddleware)
# app.add_middleware(AuthMiddleware)
