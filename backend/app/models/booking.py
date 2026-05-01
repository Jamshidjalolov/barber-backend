from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import BookingStatusEnum
from app.models.base import Base, IdMixin, TimestampMixin


class Booking(Base, IdMixin, TimestampMixin):
    __tablename__ = "bookings"

    customer_user_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    barber_id: Mapped[str] = mapped_column(ForeignKey("barbers.id", ondelete="CASCADE"))
    customer_name: Mapped[str] = mapped_column(String(120))
    customer_phone: Mapped[str] = mapped_column(String(24))
    service_name: Mapped[str] = mapped_column(String(140))
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[BookingStatusEnum] = mapped_column(
        Enum(BookingStatusEnum, name="booking_status_enum"),
        default=BookingStatusEnum.pending,
        index=True,
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    scheduled_for: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    rejected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    reminder_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    original_price: Mapped[int] = mapped_column(default=0)
    final_price: Mapped[int] = mapped_column(default=0)
    applied_discount_percent: Mapped[int | None] = mapped_column(nullable=True)

    customer_user = relationship("User", back_populates="customer_bookings")
    barber = relationship("Barber", back_populates="bookings")
