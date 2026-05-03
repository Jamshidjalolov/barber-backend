from __future__ import annotations

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import DEFAULT_SERVICE_PRICES

from app.models.base import Base, IdMixin, TimestampMixin


class Barber(Base, IdMixin, TimestampMixin):
    __tablename__ = "barbers"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    display_name: Mapped[str] = mapped_column(String(120))
    specialty: Mapped[str] = mapped_column(String(180))
    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Float, default=0)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    media_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    telegram_chat_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    work_start_time: Mapped[str] = mapped_column(String(5), default="09:00")
    work_end_time: Mapped[str] = mapped_column(String(5), default="18:30")
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    price_haircut: Mapped[int] = mapped_column(Integer, default=DEFAULT_SERVICE_PRICES["Soch olish"])
    price_fade: Mapped[int] = mapped_column(Integer, default=DEFAULT_SERVICE_PRICES["Fade qirqim"])
    price_hair_beard: Mapped[int] = mapped_column(Integer, default=DEFAULT_SERVICE_PRICES["Soch + soqol"])
    price_premium: Mapped[int] = mapped_column(Integer, default=DEFAULT_SERVICE_PRICES["Premium paket"])
    price_beard: Mapped[int] = mapped_column(Integer, default=DEFAULT_SERVICE_PRICES["Soqol dizayni"])

    user = relationship("User", back_populates="barber_profile")
    bookings = relationship("Booking", back_populates="barber", cascade="all, delete-orphan")
    discounts = relationship("DiscountOffer", back_populates="barber", cascade="all, delete-orphan")
