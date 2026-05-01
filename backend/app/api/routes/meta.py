from __future__ import annotations

from fastapi import APIRouter

from app.core.config import settings
from app.core.constants import SERVICE_OPTIONS
from app.schemas.meta import ServiceOptionsResponse, TelegramMetaResponse

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/services", response_model=ServiceOptionsResponse)
async def get_service_options() -> ServiceOptionsResponse:
    return ServiceOptionsResponse(items=SERVICE_OPTIONS)


@router.get("/telegram", response_model=TelegramMetaResponse)
async def get_telegram_meta() -> TelegramMetaResponse:
    return TelegramMetaResponse(
        enabled=bool(settings.telegram_bot_token and settings.telegram_bot_username),
        bot_username=settings.telegram_bot_username,
        reminder_minutes_before=settings.booking_reminder_minutes_before,
    )
