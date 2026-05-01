from __future__ import annotations

from app.core.enums import RoleEnum
from app.models.user import User
from app.schemas.auth import AuthUserRead


def serialize_auth_user(user: User) -> AuthUserRead:
    barber_profile = user.__dict__.get("barber_profile")
    return AuthUserRead(
        id=user.id,
        role=RoleEnum(user.role),
        full_name=user.full_name,
        username=user.username,
        phone=user.phone,
        telegram_chat_id=user.telegram_chat_id,
        telegram_connected=bool(user.telegram_chat_id),
        barber_profile_id=getattr(barber_profile, "id", None),
    )
