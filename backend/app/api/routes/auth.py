from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import DatabaseSession, get_current_user
from app.core.enums import RoleEnum
from app.core.security import create_access_token, hash_password
from app.models.user import User
from app.schemas.auth import (
    AuthUserRead,
    AuthUserUpdateRequest,
    CustomerLoginRequest,
    CustomerRegisterRequest,
    TokenResponse,
    UsernameLoginRequest,
)
from app.schemas.barber import BarberRegisterRequest
from app.services.auth import (
    authenticate_by_username,
    authenticate_customer,
    register_barber,
    register_customer,
)
from app.services.serializers import serialize_auth_user

router = APIRouter(prefix="/auth", tags=["auth"])


def build_token_response(user: User, *, barber_profile_id: str | None = None) -> TokenResponse:
    serialized = serialize_auth_user(user)
    if barber_profile_id:
        serialized = serialized.model_copy(update={"barber_profile_id": barber_profile_id})
    token = create_access_token(user.id, {"role": user.role.value})
    return TokenResponse(access_token=token, user=serialized)


@router.post("/customer/login", response_model=TokenResponse)
async def customer_login(
    payload: CustomerLoginRequest,
    session: DatabaseSession,
) -> TokenResponse:
    user = await authenticate_customer(session, payload.phone, payload.password)
    return build_token_response(user)


@router.post("/customer/register", response_model=TokenResponse, status_code=201)
async def customer_register(
    payload: CustomerRegisterRequest,
    session: DatabaseSession,
) -> TokenResponse:
    user = await register_customer(session, payload)
    return build_token_response(user)


@router.post("/barber/login", response_model=TokenResponse)
async def barber_login(
    payload: UsernameLoginRequest,
    session: DatabaseSession,
) -> TokenResponse:
    user = await authenticate_by_username(session, payload.username, payload.password, RoleEnum.barber)
    return build_token_response(user)


@router.post("/barber/register", response_model=TokenResponse, status_code=201)
async def barber_register(
    payload: BarberRegisterRequest,
    session: DatabaseSession,
) -> TokenResponse:
    user, barber = await register_barber(session, payload)
    return build_token_response(user, barber_profile_id=barber.id)


@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(
    payload: UsernameLoginRequest,
    session: DatabaseSession,
) -> TokenResponse:
    user = await authenticate_by_username(session, payload.username, payload.password, RoleEnum.admin)
    return build_token_response(user)


@router.get("/me", response_model=AuthUserRead)
async def auth_me(
    session: DatabaseSession,
    current_user: User = Depends(get_current_user),
) -> AuthUserRead:
    hydrated = (
        await session.execute(
            select(User).options(selectinload(User.barber_profile)).where(User.id == current_user.id),
        )
    ).scalar_one()
    return serialize_auth_user(hydrated)


@router.patch("/me", response_model=AuthUserRead)
async def update_auth_me(
    payload: AuthUserUpdateRequest,
    session: DatabaseSession,
    current_user: User = Depends(get_current_user),
) -> AuthUserRead:
    hydrated = (
        await session.execute(
            select(User).options(selectinload(User.barber_profile)).where(User.id == current_user.id),
        )
    ).scalar_one()

    if payload.phone is not None:
        phone = payload.phone.strip() or None
        if phone and phone != hydrated.phone:
            existing = (await session.execute(select(User).where(User.phone == phone))).scalar_one_or_none()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Bu telefon raqam allaqachon band.",
                )
        hydrated.phone = phone

    if payload.username is not None:
        username = payload.username.strip().lower() or None
        if username and username != hydrated.username:
            existing = (await session.execute(select(User).where(User.username == username))).scalar_one_or_none()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Bu username allaqachon band.",
                )
        hydrated.username = username

    if payload.full_name is not None:
        hydrated.full_name = payload.full_name.strip()

    photo_updated = payload.photo_url is not None
    if photo_updated:
        hydrated.photo_url = payload.photo_url.strip() or None

    if payload.password:
        hydrated.password_hash = hash_password(payload.password)

    if hydrated.role == RoleEnum.barber and hydrated.barber_profile:
        hydrated.barber_profile.display_name = hydrated.full_name
        if photo_updated:
            hydrated.barber_profile.photo_url = hydrated.photo_url

    await session.commit()
    await session.refresh(hydrated, attribute_names=["barber_profile"])
    return serialize_auth_user(hydrated)
