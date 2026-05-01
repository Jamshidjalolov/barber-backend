from __future__ import annotations

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import Select, select
from sqlalchemy.orm import selectinload

from app.api.deps import DatabaseSession, require_roles
from app.core.enums import BookingStatusEnum, RoleEnum
from app.models.barber import Barber
from app.models.booking import Booking
from app.models.user import User
from app.schemas.booking import (
    BookingAvailabilityRead,
    BookingCreateRequest,
    BookingRead,
    BookingStatusUpdateRequest,
)
from app.services.bookings import (
    BOOKING_RELATIONS,
    create_booking,
    delete_booking,
    get_booking_with_relations,
    update_booking_status,
)

router = APIRouter(prefix="/bookings", tags=["bookings"])


def serialize_booking(booking: Booking) -> BookingRead:
    return BookingRead(
        id=booking.id,
        customer_user_id=booking.customer_user_id,
        barber_id=booking.barber_id,
        barber_name=booking.barber.display_name,
        barber_user_id=booking.barber.user_id,
        customer_name=booking.customer_name,
        customer_phone=booking.customer_phone,
        service_name=booking.service_name,
        note=booking.note,
        status=booking.status,
        rejection_reason=booking.rejection_reason,
        scheduled_for=booking.scheduled_for,
        accepted_at=booking.accepted_at,
        started_at=booking.started_at,
        completed_at=booking.completed_at,
        rejected_at=booking.rejected_at,
        reminder_sent_at=booking.reminder_sent_at,
        original_price=booking.original_price,
        final_price=booking.final_price,
        applied_discount_percent=booking.applied_discount_percent,
        created_at=booking.created_at,
        updated_at=booking.updated_at,
    )


@router.get("", response_model=list[BookingRead])
async def list_bookings(
    session: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles(RoleEnum.customer, RoleEnum.barber, RoleEnum.admin))],
    status_filter: BookingStatusEnum | None = Query(default=None, alias="status"),
    barber_id: str | None = None,
    customer_user_id: str | None = None,
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
) -> list[BookingRead]:
    query: Select[tuple[Booking]] = (
        select(Booking)
        .options(*BOOKING_RELATIONS)
        .order_by(Booking.scheduled_for.asc())
    )

    if current_user.role == RoleEnum.customer:
        query = query.where(Booking.customer_user_id == current_user.id)
    elif current_user.role == RoleEnum.barber:
        barber = (
            await session.execute(select(Barber).where(Barber.user_id == current_user.id))
        ).scalar_one_or_none()
        if barber:
            query = query.where(Booking.barber_id == barber.id)
        else:
            return []

    if status_filter is not None:
        query = query.where(Booking.status == status_filter)
    if barber_id and current_user.role == RoleEnum.admin:
        query = query.where(Booking.barber_id == barber_id)
    if customer_user_id and current_user.role == RoleEnum.admin:
        query = query.where(Booking.customer_user_id == customer_user_id)
    if date_from is not None:
        query = query.where(Booking.scheduled_for >= date_from)
    if date_to is not None:
        query = query.where(Booking.scheduled_for <= date_to)

    result = await session.execute(query)
    return [serialize_booking(item) for item in list(result.scalars().all())]


@router.get("/availability", response_model=list[BookingAvailabilityRead])
async def list_booking_availability(
    session: DatabaseSession,
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
) -> list[BookingAvailabilityRead]:
    query: Select[tuple[Booking]] = select(Booking).order_by(Booking.scheduled_for.asc())

    if date_from is not None:
        query = query.where(Booking.scheduled_for >= date_from)
    if date_to is not None:
        query = query.where(Booking.scheduled_for <= date_to)

    result = await session.execute(query)
    return [
        BookingAvailabilityRead(
            id=item.id,
            barber_id=item.barber_id,
            status=item.status,
            scheduled_for=item.scheduled_for,
        )
        for item in result.scalars().all()
        if item.status != BookingStatusEnum.rejected
    ]


@router.post("", response_model=BookingRead, status_code=201)
async def create_booking_route(
    payload: BookingCreateRequest,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles(RoleEnum.customer, RoleEnum.admin))],
) -> BookingRead:
    return serialize_booking(await create_booking(session, payload, current_user))


@router.patch("/{booking_id}/status", response_model=BookingRead)
async def update_booking_status_route(
    booking_id: str,
    payload: BookingStatusUpdateRequest,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles(RoleEnum.barber, RoleEnum.admin))],
) -> BookingRead:
    return serialize_booking(await update_booking_status(session, booking_id, payload, current_user))


@router.delete("/{booking_id}", status_code=204)
async def delete_booking_route(
    booking_id: str,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles(RoleEnum.admin))],
) -> None:
    await delete_booking(session, booking_id)


@router.get("/{booking_id}/tracking", response_model=BookingRead)
async def get_booking_tracking(
    booking_id: str,
    session: DatabaseSession,
) -> BookingRead:
    return serialize_booking(await get_booking_with_relations(session, booking_id))
