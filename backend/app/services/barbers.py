from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.constants import DEFAULT_SERVICE_PRICES
from app.core.enums import RoleEnum
from app.core.security import hash_password
from app.models.barber import Barber
from app.models.booking import Booking
from app.models.user import User
from app.schemas.barber import BarberCreateRequest, BarberRead, BarberUpdateRequest


def start_of_today_utc() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


async def list_barbers(session: AsyncSession) -> list[BarberRead]:
    barbers = list(
        (
            await session.execute(
                select(Barber).options(selectinload(Barber.user)).order_by(Barber.display_name.asc()),
            )
        )
        .scalars()
        .all()
    )
    bookings = list((await session.execute(select(Booking))).scalars().all())
    today_start = start_of_today_utc()
    tomorrow_start = today_start + timedelta(days=1)

    results: list[BarberRead] = []
    for barber in barbers:
        total_bookings = sum(1 for item in bookings if item.barber_id == barber.id)
        today_bookings = sum(
            1
            for item in bookings
            if item.barber_id == barber.id
            and today_start <= item.scheduled_for < tomorrow_start
            and item.status.value != "rejected"
        )
        results.append(
            BarberRead(
                id=barber.id,
                user_id=barber.user_id,
                full_name=barber.display_name,
                username=barber.user.username or "",
                specialty=barber.specialty,
                experience_years=barber.experience_years,
                rating=barber.rating,
                bio=barber.bio,
                photo_url=barber.photo_url,
                telegram_chat_id=barber.user.telegram_chat_id or barber.telegram_chat_id,
                work_start_time=barber.work_start_time,
                work_end_time=barber.work_end_time,
                address=barber.address,
                latitude=barber.latitude,
                longitude=barber.longitude,
                price_haircut=barber.price_haircut,
                price_fade=barber.price_fade,
                price_hair_beard=barber.price_hair_beard,
                price_premium=barber.price_premium,
                price_beard=barber.price_beard,
                total_bookings=total_bookings,
                today_bookings=today_bookings,
            )
        )
    return results


async def get_barber_by_user_id(session: AsyncSession, user_id: str) -> BarberRead:
    items = await list_barbers(session)
    for item in items:
        if item.user_id == user_id:
            return item
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Barber topilmadi.")


async def create_barber(session: AsyncSession, payload: BarberCreateRequest) -> BarberRead:
    username = payload.username.strip().lower()
    existing_user = (
        await session.execute(select(User).where(User.username == username))
    ).scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bu username band.")

    user = User(
        role=RoleEnum.barber,
        full_name=payload.full_name.strip(),
        username=username,
        telegram_chat_id=payload.telegram_chat_id.strip() if payload.telegram_chat_id else None,
        password_hash=hash_password(payload.password),
    )
    session.add(user)
    await session.flush()

    barber = Barber(
        user_id=user.id,
        display_name=payload.full_name.strip(),
        specialty=payload.specialty.strip(),
        experience_years=payload.experience_years,
        rating=payload.rating,
        bio=payload.bio.strip() if payload.bio else None,
        photo_url=payload.photo_url.strip() if payload.photo_url else None,
        telegram_chat_id=payload.telegram_chat_id.strip() if payload.telegram_chat_id else None,
        work_start_time=payload.work_start_time,
        work_end_time=payload.work_end_time,
        address=payload.address.strip() if payload.address else None,
        latitude=payload.latitude,
        longitude=payload.longitude,
        price_haircut=payload.price_haircut,
        price_fade=payload.price_fade,
        price_hair_beard=payload.price_hair_beard,
        price_premium=payload.price_premium,
        price_beard=payload.price_beard,
    )
    session.add(barber)
    await session.commit()
    return await get_barber_by_user_id(session, user.id)


async def update_barber(
    session: AsyncSession,
    barber_id: str,
    payload: BarberUpdateRequest,
) -> BarberRead:
    barber = (
        await session.execute(select(Barber).options(selectinload(Barber.user)).where(Barber.id == barber_id))
    ).scalar_one_or_none()
    if not barber:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Barber topilmadi.")

    if payload.username:
        username = payload.username.strip().lower()
        existing = (
            await session.execute(select(User).where(User.username == username, User.id != barber.user_id))
        ).scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bu username band.")
        barber.user.username = username

    if payload.password:
        barber.user.password_hash = hash_password(payload.password)
    if payload.full_name:
        barber.user.full_name = payload.full_name.strip()
        barber.display_name = payload.full_name.strip()
    if payload.specialty is not None:
        barber.specialty = payload.specialty.strip()
    if payload.experience_years is not None:
        barber.experience_years = payload.experience_years
    if payload.rating is not None:
        barber.rating = payload.rating
    if payload.bio is not None:
        barber.bio = payload.bio.strip() if payload.bio else None
    if payload.photo_url is not None:
        barber.photo_url = payload.photo_url.strip() if payload.photo_url else None
    if payload.telegram_chat_id is not None:
        chat_id = payload.telegram_chat_id.strip() if payload.telegram_chat_id else None
        barber.telegram_chat_id = chat_id
        barber.user.telegram_chat_id = chat_id
    if payload.work_start_time is not None:
        barber.work_start_time = payload.work_start_time
    if payload.work_end_time is not None:
        barber.work_end_time = payload.work_end_time
    if payload.address is not None:
        barber.address = payload.address.strip() if payload.address else None
    if payload.latitude is not None:
        barber.latitude = payload.latitude
    if payload.longitude is not None:
        barber.longitude = payload.longitude
    if payload.price_haircut is not None:
        barber.price_haircut = payload.price_haircut
    if payload.price_fade is not None:
        barber.price_fade = payload.price_fade
    if payload.price_hair_beard is not None:
        barber.price_hair_beard = payload.price_hair_beard
    if payload.price_premium is not None:
        barber.price_premium = payload.price_premium
    if payload.price_beard is not None:
        barber.price_beard = payload.price_beard

    await session.commit()
    return await get_barber_by_user_id(session, barber.user_id)


async def update_barber_by_user_id(
    session: AsyncSession,
    user_id: str,
    payload: BarberUpdateRequest,
) -> BarberRead:
    barber = (
        await session.execute(select(Barber).where(Barber.user_id == user_id))
    ).scalar_one_or_none()
    if not barber:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Barber topilmadi.")
    return await update_barber(session, barber.id, payload)


async def delete_barber(session: AsyncSession, barber_id: str) -> None:
    barber = (await session.execute(select(Barber).where(Barber.id == barber_id))).scalar_one_or_none()
    if not barber:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Barber topilmadi.")

    user = (await session.execute(select(User).where(User.id == barber.user_id))).scalar_one_or_none()
    await session.delete(barber)
    if user:
        await session.delete(user)
    await session.commit()
