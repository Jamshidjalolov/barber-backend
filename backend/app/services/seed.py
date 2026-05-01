from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import RoleEnum
from app.core.security import hash_password
from app.models.user import User


async def seed_demo_data(session: AsyncSession) -> None:
    """Seed faqat admin qoldiradi - barber va customer o'zi qo'shadi"""
    existing_admin = (
        await session.execute(select(User).where(User.role == RoleEnum.admin))
    ).scalar_one_or_none()
    if existing_admin:
        return

    # Faqat admin - foydalanuvchilar o'zi ro'yxatdan o'tadi
    admin = User(
        role=RoleEnum.admin,
        full_name="Jamshid Jalolov",
        username="jamshidjalolov6767@gmail.com",
        password_hash=hash_password("jamshid4884"),
    )
    session.add(admin)
    await session.commit()
