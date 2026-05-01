from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import DatabaseSession, get_current_user, require_roles
from app.core.enums import RoleEnum
from app.models.user import User
from app.schemas.barber import BarberCreateRequest, BarberRead, BarberUpdateRequest
from app.services.barbers import (
    create_barber,
    delete_barber,
    get_barber_by_user_id,
    list_barbers,
    update_barber_by_user_id,
    update_barber,
)

router = APIRouter(prefix="/barbers", tags=["barbers"])


@router.get("", response_model=list[BarberRead])
async def list_barbers_route(session: DatabaseSession) -> list[BarberRead]:
    return await list_barbers(session)


@router.get("/me", response_model=BarberRead)
async def get_my_barber_profile(
    session: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles(RoleEnum.barber))],
) -> BarberRead:
    return await get_barber_by_user_id(session, current_user.id)


@router.patch("/me", response_model=BarberRead)
async def update_my_barber_profile(
    payload: BarberUpdateRequest,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles(RoleEnum.barber))],
) -> BarberRead:
    return await update_barber_by_user_id(session, current_user.id, payload)


@router.post("", response_model=BarberRead, status_code=201)
async def create_barber_route(
    payload: BarberCreateRequest,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles(RoleEnum.admin))],
) -> BarberRead:
    return await create_barber(session, payload)


@router.patch("/{barber_id}", response_model=BarberRead)
async def update_barber_route(
    barber_id: str,
    payload: BarberUpdateRequest,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles(RoleEnum.admin))],
) -> BarberRead:
    return await update_barber(session, barber_id, payload)


@router.delete("/{barber_id}", status_code=204)
async def delete_barber_route(
    barber_id: str,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles(RoleEnum.admin))],
) -> None:
    await delete_barber(session, barber_id)
