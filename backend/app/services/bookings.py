from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.enums import BookingStatusEnum, RoleEnum
from app.models.barber import Barber
from app.models.booking import Booking
from app.models.discount import DiscountOffer
from app.models.user import User
from app.schemas.booking import BookingCreateRequest, BookingStatusUpdateRequest
from app.services.realtime import make_channel, realtime_broker
from app.services.telegram import telegram_notifier


BOOKING_RELATIONS = (
    selectinload(Booking.barber).selectinload(Barber.user),
    selectinload(Booking.customer_user),
)


async def get_booking_with_relations(session: AsyncSession, booking_id: str) -> Booking:
    booking = (
        await session.execute(
            select(Booking).options(*BOOKING_RELATIONS).where(Booking.id == booking_id),
        )
    ).scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bron topilmadi.")
    return booking


async def create_booking(
    session: AsyncSession,
    payload: BookingCreateRequest,
    customer: User,
) -> Booking:
    barber = (
        await session.execute(
            select(Barber).options(selectinload(Barber.user)).where(Barber.id == payload.barber_id),
        )
    ).scalar_one_or_none()
    if not barber:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Barber topilmadi.")

    scheduled_for = payload.scheduled_for
    if scheduled_for.tzinfo is None:
        scheduled_for = scheduled_for.replace(tzinfo=timezone.utc)
    if scheduled_for <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="O'tib ketgan vaqtga bron qilib bo'lmaydi.",
        )

    if customer.role == RoleEnum.customer:
        active_booking = (
            await session.execute(
                select(Booking).where(
                    Booking.customer_user_id == customer.id,
                    Booking.status.in_(
                        [
                            BookingStatusEnum.pending,
                            BookingStatusEnum.accepted,
                            BookingStatusEnum.in_service,
                        ]
                    ),
                ),
            )
        ).scalar_one_or_none()
        if active_booking:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Avvalgi navbatingiz hali tugamagan. Yangi bronni keyinroq yuboring.",
            )

    conflict = (
        await session.execute(
            select(Booking).where(
                Booking.barber_id == payload.barber_id,
                Booking.scheduled_for == payload.scheduled_for,
                Booking.status != BookingStatusEnum.rejected,
            ),
        )
    ).scalar_one_or_none()
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu vaqt allaqachon band qilingan.",
        )

    booking = Booking(
        customer_user_id=customer.id if customer.role == RoleEnum.customer else None,
        barber_id=payload.barber_id,
        customer_name=payload.customer_name.strip(),
        customer_phone=payload.customer_phone.strip(),
        service_name=payload.service_name.strip(),
        note=payload.note.strip() if payload.note else None,
        scheduled_for=payload.scheduled_for,
        status=BookingStatusEnum.pending,
        original_price=_get_service_price(barber, payload.service_name.strip()),
        final_price=_get_service_price(barber, payload.service_name.strip()),
    )

    active_discount = (
        await session.execute(
            select(DiscountOffer)
            .where(
                DiscountOffer.barber_id == barber.id,
                DiscountOffer.starts_at <= payload.scheduled_for,
                DiscountOffer.ends_at >= payload.scheduled_for,
            )
            .order_by(DiscountOffer.percent.desc(), DiscountOffer.created_at.desc())
        )
    ).scalars().first()

    if active_discount:
        booking.applied_discount_percent = active_discount.percent
        booking.final_price = max(
            0,
            round(booking.original_price * (100 - active_discount.percent) / 100),
        )

    session.add(booking)
    await session.commit()

    hydrated = await get_booking_with_relations(session, booking.id)

    await _publish_booking_event(
        hydrated,
        event="booking.created",
        extra={
            "message": f"{hydrated.customer_name} {hydrated.service_name} uchun bron yubordi.",
        },
    )
    await telegram_notifier.send_booking_created(hydrated)
    return hydrated


async def update_booking_status(
    session: AsyncSession,
    booking_id: str,
    payload: BookingStatusUpdateRequest,
    actor: User,
) -> Booking:
    booking = await get_booking_with_relations(session, booking_id)

    if actor.role == RoleEnum.barber and booking.barber.user_id != actor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Siz faqat o'zingizga tegishli bronlarni boshqara olasiz.",
        )

    now = datetime.now(timezone.utc)
    booking.status = payload.status
    booking.rejection_reason = None if payload.status != BookingStatusEnum.rejected else booking.rejection_reason

    if payload.status == BookingStatusEnum.accepted:
        booking.accepted_at = now
        booking.rejection_reason = None
    elif payload.status == BookingStatusEnum.in_service:
        booking.started_at = now
    elif payload.status == BookingStatusEnum.completed:
        booking.completed_at = now
    elif payload.status == BookingStatusEnum.rejected:
        if not payload.rejection_reason:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Rad etishda sabab yozish majburiy.",
            )
        booking.rejected_at = now
        booking.rejection_reason = payload.rejection_reason

    await session.commit()
    hydrated = await get_booking_with_relations(session, booking.id)

    await _publish_booking_event(
        hydrated,
        event="booking.updated",
        extra={
            "rejection_reason": hydrated.rejection_reason,
            "message": _build_status_message(hydrated),
        },
    )
    await telegram_notifier.send_booking_status_update(hydrated)
    return hydrated


async def delete_booking(
    session: AsyncSession,
    booking_id: str,
) -> None:
    booking = await get_booking_with_relations(session, booking_id)
    payload = {
        "event": "booking.deleted",
        "booking_id": booking.id,
        "barber_id": booking.barber_id,
        "customer_user_id": booking.customer_user_id,
    }

    await session.delete(booking)
    await session.commit()

    await realtime_broker.publish(make_channel("admin", "global"), payload)
    await realtime_broker.publish(make_channel("barber", booking.barber.user_id), payload)
    if booking.customer_user_id:
        await realtime_broker.publish(make_channel("customer", booking.customer_user_id), payload)


async def _publish_booking_event(
    booking: Booking,
    *,
    event: str,
    extra: dict[str, object] | None = None,
) -> None:
    payload: dict[str, object] = {
        "event": event,
        "booking_id": booking.id,
        "status": booking.status.value,
        "barber_id": booking.barber_id,
        "barber_user_id": booking.barber.user_id,
        "customer_user_id": booking.customer_user_id,
    }
    if extra:
        payload.update(extra)

    await realtime_broker.publish(make_channel("admin", "global"), payload)
    await realtime_broker.publish(make_channel("barber", booking.barber.user_id), payload)
    if booking.customer_user_id:
        await realtime_broker.publish(make_channel("customer", booking.customer_user_id), payload)


def _build_status_message(booking: Booking) -> str:
    if booking.status == BookingStatusEnum.accepted:
        return f"{booking.customer_name} navbati qabul qilindi."
    if booking.status == BookingStatusEnum.in_service:
        return f"{booking.customer_name} uchun xizmat boshlandi."
    if booking.status == BookingStatusEnum.completed:
        return f"{booking.customer_name} navbati tugatildi."
    if booking.status == BookingStatusEnum.rejected:
        return f"{booking.customer_name} navbati rad etildi."
    return f"{booking.customer_name} navbati yangilandi."


def _get_service_price(barber: Barber, service_name: str) -> int:
    mapping = {
        "Soch olish": barber.price_haircut,
        "Fade qirqim": barber.price_fade,
        "Soch + soqol": barber.price_hair_beard,
        "Premium paket": barber.price_premium,
        "Soqol dizayni": barber.price_beard,
    }
    return mapping.get(service_name, barber.price_haircut)
