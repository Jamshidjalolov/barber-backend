from __future__ import annotations

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import RoleEnum
from app.models.base import Base, IdMixin, TimestampMixin


class User(Base, IdMixin, TimestampMixin):
    __tablename__ = "users"

    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum, name="user_role_enum"), index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    username: Mapped[str | None] = mapped_column(String(80), unique=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(24), unique=True, nullable=True)
    telegram_chat_id: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    barber_profile = relationship("Barber", back_populates="user", uselist=False)
    customer_bookings = relationship("Booking", back_populates="customer_user")
