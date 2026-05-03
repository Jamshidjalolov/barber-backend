from __future__ import annotations

from ipaddress import ip_address
from urllib.parse import urlsplit

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request
from starlette.responses import Response

from app.api.routes.auth import router as auth_router
from app.api.routes.barbers import router as barbers_router
from app.api.routes.bookings import router as bookings_router
from app.api.routes.discounts import router as discounts_router
from app.api.routes.meta import router as meta_router
from app.api.routes.realtime import router as realtime_router
from app.api.routes.uploads import UPLOADS_DIR, router as uploads_router
from app.core.config import settings

app = FastAPI(title=settings.app_name)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_cors_origins,
    allow_origin_regex=settings.cors_allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def is_allowed_browser_origin(origin: str) -> bool:
    if origin in settings.allowed_cors_origins:
        return True

    try:
        hostname = urlsplit(origin).hostname or ""
    except ValueError:
        return False

    if hostname == "vercel.app" or hostname.endswith(".vercel.app"):
        return True

    if hostname == "localhost":
        return True

    try:
        address = ip_address(hostname)
    except ValueError:
        return False

    return address.is_loopback or address.is_private


@app.middleware("http")
async def add_browser_cors_headers(request: Request, call_next):
    origin = request.headers.get("origin")
    allow_origin = origin if origin and is_allowed_browser_origin(origin) else None

    if request.method == "OPTIONS" and allow_origin:
        response = Response(status_code=204)
    else:
        response = await call_next(request)

    if allow_origin:
        response.headers["Access-Control-Allow-Origin"] = allow_origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,PATCH,DELETE,OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = (
            request.headers.get("access-control-request-headers") or "*"
        )
        response.headers["Vary"] = "Origin"

    return response


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router, prefix=settings.api_v1_prefix)
app.include_router(barbers_router, prefix=settings.api_v1_prefix)
app.include_router(bookings_router, prefix=settings.api_v1_prefix)
app.include_router(discounts_router, prefix=settings.api_v1_prefix)
app.include_router(meta_router, prefix=settings.api_v1_prefix)
app.include_router(realtime_router, prefix=settings.api_v1_prefix)
app.include_router(uploads_router, prefix=settings.api_v1_prefix)
