from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from ipaddress import ip_address
from urllib.parse import urlsplit

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.api.routes.auth import router as auth_router
from app.api.routes.barbers import router as barbers_router
from app.api.routes.bookings import router as bookings_router
from app.api.routes.discounts import router as discounts_router
from app.api.routes.meta import router as meta_router
from app.api.routes.realtime import router as realtime_router
from app.core.config import settings
from app.services.reminders import booking_reminder_worker
from app.services.startup import run_database_startup_jobs
from app.services.telegram import telegram_notifier

logger = logging.getLogger(__name__)
background_tasks: set[asyncio.Task[None]] = set()


def track_background_task(task: asyncio.Task[None]) -> None:
    background_tasks.add(task)

    def _done(completed_task: asyncio.Task[None]) -> None:
        background_tasks.discard(completed_task)
        if completed_task.cancelled():
            return
        exception = completed_task.exception()
        if exception is not None:
            logger.error(
                "Background task failed",
                exc_info=(type(exception), exception, exception.__traceback__),
            )

    task.add_done_callback(_done)


def start_background_jobs() -> None:
    track_background_task(asyncio.create_task(booking_reminder_worker.run()))
    track_background_task(asyncio.create_task(telegram_notifier.run_polling()))


@asynccontextmanager
async def lifespan(_: FastAPI):
    await run_database_startup_jobs(max_attempts=settings.database_startup_max_attempts)
    start_background_jobs()
    try:
        yield
    finally:
        tasks = list(background_tasks)
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)


app = FastAPI(title=settings.app_name, lifespan=lifespan)

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
