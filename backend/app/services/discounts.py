from __future__ import annotations

from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.enums import RoleEnum
from app.models.barber import Barber
from app.models.discount import DiscountOffer
from app.models.user import User
from app.schemas.discount import DiscountCreateRequest
from app.services.realtime import make_channel, realtime_broker
from app.services.telegram import telegram_notifier

try:
    UZBEK_TZ = ZoneInfo("Asia/Tashkent")
except ZoneInfoNotFoundError:
    UZBEK_TZ = timezone(timedelta(hours=5))


DISCOUNT_RELATIONS = (selectinload(DiscountOffer.barber).selectinload(Barber.user),)


def _to_local(value: datetime) -> datetime:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(UZBEK_TZ)


def _format_date_label(value: datetime) -> str:
    return _to_local(value).strftime("%d.%m.%Y")


def _format_time_label(value: datetime) -> str:
    return _to_local(value).strftime("%H:%M")


async def get_discount_with_relations(session: AsyncSession, discount_id: str) -> DiscountOffer:
    discount = (
        await session.execute(
            select(DiscountOffer).options(*DISCOUNT_RELATIONS).where(DiscountOffer.id == discount_id),
        )
    ).scalar_one_or_none()
    if not discount:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skidka topilmadi.")
    return discount


async def list_discounts(
    session: AsyncSession,
    current_user: User,
    *,
    barber_id: str | None = None,
    include_expired: bool = False,
) -> list[DiscountOffer]:
    query: Select[tuple[DiscountOffer]] = (
        select(DiscountOffer)
        .options(*DISCOUNT_RELATIONS)
        .order_by(DiscountOffer.starts_at.asc(), DiscountOffer.created_at.desc())
    )

    if not include_expired:
        query = query.where(DiscountOffer.ends_at >= datetime.now(timezone.utc))

    if current_user.role == RoleEnum.barber:
        barber = (
            await session.execute(select(Barber).where(Barber.user_id == current_user.id))
        ).scalar_one_or_none()
        if not barber:
            return []
        query = query.where(DiscountOffer.barber_id == barber.id)
    elif barber_id:
        query = query.where(DiscountOffer.barber_id == barber_id)

    result = await session.execute(query)
    return list(result.scalars().all())


async def create_discount(
    session: AsyncSession,
    payload: DiscountCreateRequest,
    actor: User,
) -> DiscountOffer:
    if actor.role == RoleEnum.barber:
        barber = (
            await session.execute(
                select(Barber).options(selectinload(Barber.user)).where(Barber.user_id == actor.id),
            )
        ).scalar_one_or_none()
        if not barber:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Barber profili topilmadi.")
    else:
        if not payload.barber_id:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Admin skidka qo'yishda barber tanlashi kerak.",
            )
        barber = (
            await session.execute(
                select(Barber).options(selectinload(Barber.user)).where(Barber.id == payload.barber_id),
            )
        ).scalar_one_or_none()
        if not barber:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Barber topilmadi.")

    discount = DiscountOffer(
        barber_id=barber.id,
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else None,
        percent=payload.percent,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
    )
    session.add(discount)
    await session.commit()

    hydrated = await get_discount_with_relations(session, discount.id)
    await _publish_discount_event(
        session,
        hydrated,
        event="discount.created",
        message=_build_created_message(hydrated),
    )
    await _send_discount_telegram_notifications(session, hydrated)
    return hydrated


async def delete_discount(
    session: AsyncSession,
    discount_id: str,
    actor: User,
) -> None:
    discount = await get_discount_with_relations(session, discount_id)

    if actor.role == RoleEnum.barber and discount.barber.user_id != actor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Siz faqat o'zingiz qo'ygan skidkani o'chira olasiz.",
        )

    payload = {
        "event": "discount.deleted",
        "discount_id": discount.id,
        "barber_id": discount.barber_id,
        "barber_user_id": discount.barber.user_id,
        "message": f"{discount.barber.display_name} skidkani olib tashladi.",
    }

    await session.delete(discount)
    await session.commit()
    await _publish_to_audience(session, payload, discount.barber.user_id)


async def _publish_discount_event(
    session: AsyncSession,
    discount: DiscountOffer,
    *,
    event: str,
    message: str,
) -> None:
    payload = {
        "event": event,
        "discount_id": discount.id,
        "barber_id": discount.barber_id,
        "barber_user_id": discount.barber.user_id,
        "message": message,
    }
    await _publish_to_audience(session, payload, discount.barber.user_id)


async def _publish_to_audience(
    session: AsyncSession,
    payload: dict[str, object],
    barber_user_id: str,
) -> None:
    await realtime_broker.publish(make_channel("admin", "global"), payload)
    await realtime_broker.publish(make_channel("barber", barber_user_id), payload)

    customer_ids = list(
        (
            await session.execute(
                select(User.id).where(User.role == RoleEnum.customer, User.is_active.is_(True)),
            )
        ).scalars()
    )
    for customer_id in customer_ids:
        await realtime_broker.publish(make_channel("customer", customer_id), payload)


async def _send_discount_telegram_notifications(
    session: AsyncSession,
    discount: DiscountOffer,
) -> None:
    customer_chat_ids = list(
        (
            await session.execute(
                select(User.telegram_chat_id).where(
                    User.role == RoleEnum.customer,
                    User.is_active.is_(True),
                    User.telegram_chat_id.is_not(None),
                ),
            )
        ).scalars()
    )
    await telegram_notifier.send_discount_created(discount, [chat_id for chat_id in customer_chat_ids if chat_id])


def _build_created_message(discount: DiscountOffer) -> str:
    return (
        f"{discount.barber.display_name} "
        f"{_format_date_label(discount.starts_at)} kuni "
        f"{_format_time_label(discount.starts_at)} - {_format_time_label(discount.ends_at)} oralig'iga "
        f"{discount.percent}% skidka qo'ydi."
    )
