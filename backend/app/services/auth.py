from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.enums import RoleEnum
from app.core.security import hash_password, verify_password
from app.models.barber import Barber
from app.models.user import User
from app.schemas.auth import CustomerRegisterRequest
from app.schemas.barber import BarberRegisterRequest


async def authenticate_customer(
    session: AsyncSession,
    phone: str,
    password: str,
) -> User:
    query = (
        select(User)
        .options(selectinload(User.barber_profile))
        .where(User.role == RoleEnum.customer, User.phone == phone)
    )
    user = (await session.execute(query)).scalar_one_or_none()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Telefon yoki parol noto'g'ri.",
        )

    return user


async def authenticate_by_username(
    session: AsyncSession,
    username: str,
    password: str,
    role: RoleEnum,
) -> User:
    query = (
        select(User)
        .options(selectinload(User.barber_profile))
        .where(User.role == role, User.username == username)
    )
    user = (await session.execute(query)).scalar_one_or_none()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username yoki parol noto'g'ri.",
        )

    return user


async def register_customer(
    session: AsyncSession,
    payload: CustomerRegisterRequest,
) -> User:
    existing = (
        await session.execute(select(User).where(User.phone == payload.phone))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu telefon raqam allaqachon ro'yxatdan o'tgan.",
        )

    user = User(
        role=RoleEnum.customer,
        full_name=payload.full_name.strip(),
        phone=payload.phone.strip(),
        password_hash=hash_password(payload.password),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def register_barber(
    session: AsyncSession,
    payload: BarberRegisterRequest,
) -> tuple[User, Barber]:
    username = payload.username.strip().lower()
    existing = (
        await session.execute(select(User).where(User.username == username))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu username allaqachon band.",
        )

    user = User(
        role=RoleEnum.barber,
        full_name=payload.full_name.strip(),
        username=username,
        photo_url=payload.photo_url.strip() if payload.photo_url else None,
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
        media_url=payload.media_url.strip() if payload.media_url else None,
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
    await session.refresh(user, attribute_names=["barber_profile"])
    await session.refresh(barber)
    return user, barber
