from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.core.enums import BookingStatusEnum


class BookingCreateRequest(BaseModel):
    barber_id: str
    customer_name: str = Field(min_length=2, max_length=120)
    customer_phone: str = Field(min_length=7, max_length=24)
    service_name: str = Field(min_length=2, max_length=140)
    note: str | None = None
    scheduled_for: datetime


class BookingStatusUpdateRequest(BaseModel):
    status: BookingStatusEnum
    rejection_reason: str | None = None

    @field_validator("rejection_reason")
    @classmethod
    def normalize_reason(cls, value: str | None) -> str | None:
        return value.strip() if value else value


class BookingRead(BaseModel):
    id: str
    customer_user_id: str | None
    barber_id: str
    barber_name: str
    barber_user_id: str
    customer_name: str
    customer_phone: str
    service_name: str
    note: str | None
    status: BookingStatusEnum
    rejection_reason: str | None
    scheduled_for: datetime
    accepted_at: datetime | None
    started_at: datetime | None
    completed_at: datetime | None
    rejected_at: datetime | None
    reminder_sent_at: datetime | None
    original_price: int
    final_price: int
    applied_discount_percent: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BookingAvailabilityRead(BaseModel):
    id: str
    barber_id: str
    barber_name: str
    barber_user_id: str
    customer_user_id: str | None = None
    customer_name: str
    customer_phone: str
    service_name: str
    note: str | None = None
    status: BookingStatusEnum
    scheduled_for: datetime
    original_price: int
    final_price: int
    applied_discount_percent: int | None = None
    created_at: datetime
    updated_at: datetime
