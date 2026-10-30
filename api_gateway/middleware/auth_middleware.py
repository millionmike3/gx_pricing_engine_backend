from starlette.middleware.base import BaseHTTPMiddleware

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        token = request.headers.get("X-Internal-Token")
        if token != "GENXBABY_INTERNAL":
            return JSONResponse({"error": "Unauthorized"}, status_code=401)
        return await call_next(request)
