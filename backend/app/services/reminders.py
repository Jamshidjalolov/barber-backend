from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.enums import BookingStatusEnum
from app.models.barber import Barber
from app.models.booking import Booking
from app.services.bookings import _publish_booking_event
from app.services.telegram import telegram_notifier

logger = logging.getLogger(__name__)


class BookingReminderWorker:
    async def run(self) -> None:
        while True:
            try:
                await self._tick()
                await asyncio.sleep(settings.booking_reminder_check_interval_seconds)
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("Booking reminder worker error")
                await asyncio.sleep(settings.booking_reminder_check_interval_seconds)

    async def _tick(self) -> None:
        now = datetime.now(timezone.utc)
        reminder_at = now + timedelta(minutes=settings.booking_reminder_minutes_before)
        window_start = reminder_at - timedelta(seconds=settings.booking_reminder_check_interval_seconds)
        window_end = reminder_at + timedelta(seconds=settings.booking_reminder_check_interval_seconds)

        async with SessionLocal() as session:
            bookings = list(
                (
                    await session.execute(
                        select(Booking)
                        .options(
                            selectinload(Booking.barber).selectinload(Barber.user),
                            selectinload(Booking.customer_user),
                        )
                        .where(
                            Booking.reminder_sent_at.is_(None),
                            Booking.status == BookingStatusEnum.accepted,
                            Booking.scheduled_for >= window_start,
                            Booking.scheduled_for <= window_end,
                        )
                    )
                )
                .scalars()
                .all()
            )

            if not bookings:
                return

            for booking in bookings:
                booking.reminder_sent_at = now
                await _publish_booking_event(
                    booking,
                    event="booking.reminder",
                    extra={
                        "message": f"{booking.customer_name} uchun navbat {settings.booking_reminder_minutes_before} daqiqadan keyin boshlanadi.",
                    },
                )
                await telegram_notifier.send_booking_reminder(booking)

            await session.commit()


booking_reminder_worker = BookingReminderWorker()
