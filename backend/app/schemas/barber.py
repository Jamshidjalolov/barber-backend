from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.constants import DEFAULT_SERVICE_PRICES


class BarberBasePayload(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    username: str = Field(min_length=3, max_length=80)
    specialty: str = Field(min_length=2, max_length=180)
    experience_years: int = Field(default=0, ge=0, le=60)
    rating: float = Field(default=4.8, ge=0, le=5)
    bio: str | None = None
    photo_url: str | None = Field(default=None, max_length=2048)
    work_start_time: str = Field(default="09:00", min_length=5, max_length=5)
    work_end_time: str = Field(default="18:30", min_length=5, max_length=5)
    address: str | None = Field(default=None, max_length=255)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    price_haircut: int = Field(default=DEFAULT_SERVICE_PRICES["Soch olish"], ge=0)
    price_fade: int = Field(default=DEFAULT_SERVICE_PRICES["Fade qirqim"], ge=0)
    price_hair_beard: int = Field(default=DEFAULT_SERVICE_PRICES["Soch + soqol"], ge=0)
    price_premium: int = Field(default=DEFAULT_SERVICE_PRICES["Premium paket"], ge=0)
    price_beard: int = Field(default=DEFAULT_SERVICE_PRICES["Soqol dizayni"], ge=0)


class BarberRegisterRequest(BarberBasePayload):
    password: str = Field(min_length=4, max_length=64)


class BarberCreateRequest(BarberRegisterRequest):
    telegram_chat_id: str | None = None


class BarberUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    username: str | None = Field(default=None, min_length=3, max_length=80)
    specialty: str | None = Field(default=None, min_length=2, max_length=180)
    experience_years: int | None = Field(default=None, ge=0, le=60)
    rating: float | None = Field(default=None, ge=0, le=5)
    bio: str | None = None
    photo_url: str | None = None
    password: str | None = Field(default=None, min_length=4, max_length=64)
    telegram_chat_id: str | None = None
    work_start_time: str | None = Field(default=None, min_length=5, max_length=5)
    work_end_time: str | None = Field(default=None, min_length=5, max_length=5)
    address: str | None = Field(default=None, max_length=255)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    price_haircut: int | None = Field(default=None, ge=0)
    price_fade: int | None = Field(default=None, ge=0)
    price_hair_beard: int | None = Field(default=None, ge=0)
    price_premium: int | None = Field(default=None, ge=0)
    price_beard: int | None = Field(default=None, ge=0)


class BarberRead(BaseModel):
    id: str
    user_id: str
    full_name: str
    username: str
    specialty: str
    experience_years: int
    rating: float
    bio: str | None
    photo_url: str | None
    telegram_chat_id: str | None
    work_start_time: str
    work_end_time: str
    address: str | None
    latitude: float | None
    longitude: float | None
    price_haircut: int
    price_fade: int
    price_hair_beard: int
    price_premium: int
    price_beard: int
    total_bookings: int
    today_bookings: int
