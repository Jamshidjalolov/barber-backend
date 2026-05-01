from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import DatabaseSession, require_roles
from app.core.enums import RoleEnum
from app.models.discount import DiscountOffer
from app.models.user import User
from app.schemas.discount import DiscountCreateRequest, DiscountRead
from app.services.discounts import create_discount, delete_discount, list_discounts

router = APIRouter(prefix="/discounts", tags=["discounts"])


def serialize_discount(discount: DiscountOffer) -> DiscountRead:
    return DiscountRead(
        id=discount.id,
        barber_id=discount.barber_id,
        barber_user_id=discount.barber.user_id,
        barber_name=discount.barber.display_name,
        title=discount.title,
        description=discount.description,
        percent=discount.percent,
        starts_at=discount.starts_at,
        ends_at=discount.ends_at,
        created_at=discount.created_at,
        updated_at=discount.updated_at,
    )


@router.get("", response_model=list[DiscountRead])
async def list_discounts_route(
    session: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles(RoleEnum.customer, RoleEnum.barber, RoleEnum.admin))],
    barber_id: str | None = None,
    include_expired: bool = Query(default=False),
) -> list[DiscountRead]:
    items = await list_discounts(
        session,
        current_user,
        barber_id=barber_id,
        include_expired=include_expired,
    )
    return [serialize_discount(item) for item in items]


@router.post("", response_model=DiscountRead, status_code=201)
async def create_discount_route(
    payload: DiscountCreateRequest,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles(RoleEnum.barber, RoleEnum.admin))],
) -> DiscountRead:
    return serialize_discount(await create_discount(session, payload, current_user))


@router.delete("/{discount_id}", status_code=204)
async def delete_discount_route(
    discount_id: str,
    session: DatabaseSession,
    current_user: Annotated[User, Depends(require_roles(RoleEnum.barber, RoleEnum.admin))],
) -> None:
    await delete_discount(session, discount_id, current_user)
