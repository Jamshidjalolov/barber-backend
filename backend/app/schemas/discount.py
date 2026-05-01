from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, model_validator


class DiscountCreateRequest(BaseModel):
    barber_id: str | None = None
    title: str = Field(min_length=2, max_length=120)
    description: str | None = None
    percent: int = Field(ge=1, le=90)
    starts_at: datetime
    ends_at: datetime

    @model_validator(mode="after")
    def validate_dates(self) -> "DiscountCreateRequest":
        if self.ends_at <= self.starts_at:
            raise ValueError("Tugash vaqti boshlanishdan keyin bo'lishi kerak.")
        return self


class DiscountRead(BaseModel):
    id: str
    barber_id: str
    barber_user_id: str
    barber_name: str
    title: str
    description: str | None
    percent: int
    starts_at: datetime
    ends_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
