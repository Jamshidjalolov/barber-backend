from __future__ import annotations

from pydantic import BaseModel


class ServiceOptionsResponse(BaseModel):
    items: list[str]


class TelegramMetaResponse(BaseModel):
    enabled: bool
    bot_username: str | None
    reminder_minutes_before: int
