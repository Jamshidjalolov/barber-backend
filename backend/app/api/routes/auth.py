from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import DatabaseSession, get_current_user
from app.core.enums import RoleEnum
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.auth import (
    AuthUserRead,
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
