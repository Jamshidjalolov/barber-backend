from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.barbers import router as barbers_router
from app.api.routes.bookings import router as bookings_router
from app.api.routes.discounts import router as discounts_router
from app.api.routes.meta import router as meta_router
from app.api.routes.realtime import router as realtime_router
from app.core.config import settings
from app.core.database import SessionLocal
from app.services.reminders import booking_reminder_worker
from app.services.seed import seed_demo_data
from app.services.telegram import telegram_notifier


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with SessionLocal() as session:
        await seed_demo_data(session)
    reminder_task = asyncio.create_task(booking_reminder_worker.run())
    telegram_task = asyncio.create_task(telegram_notifier.run_polling())
    try:
        yield
    finally:
        for task in (reminder_task, telegram_task):
            task.cancel()
        await asyncio.gather(reminder_task, telegram_task, return_exceptions=True)


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router, prefix=settings.api_v1_prefix)
app.include_router(barbers_router, prefix=settings.api_v1_prefix)
app.include_router(bookings_router, prefix=settings.api_v1_prefix)
app.include_router(discounts_router, prefix=settings.api_v1_prefix)
app.include_router(meta_router, prefix=settings.api_v1_prefix)
app.include_router(realtime_router, prefix=settings.api_v1_prefix)
