from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import RoleEnum
from app.core.security import hash_password
from app.models.user import User

DEFAULT_ADMIN_FULL_NAME = "Jamshid Jalolov"
DEFAULT_ADMIN_USERNAME = "jamshidjalolov6767@gmail.com"
DEFAULT_ADMIN_PASSWORD = "jamshid4884"


async def seed_demo_data(session: AsyncSession) -> None:
    """Ensure the production admin account exists with the expected credentials."""
    admin = (
        await session.execute(
            select(User).where(
                User.role == RoleEnum.admin,
                User.username == DEFAULT_ADMIN_USERNAME,
            )
        )
    ).scalar_one_or_none()

    if admin is None:
        admin = User(
            role=RoleEnum.admin,
            full_name=DEFAULT_ADMIN_FULL_NAME,
            username=DEFAULT_ADMIN_USERNAME,
            password_hash=hash_password(DEFAULT_ADMIN_PASSWORD),
        )
        session.add(admin)
    else:
        admin.full_name = DEFAULT_ADMIN_FULL_NAME
        admin.password_hash = hash_password(DEFAULT_ADMIN_PASSWORD)

    await session.commit()
