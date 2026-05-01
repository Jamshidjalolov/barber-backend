"""telegram linking and booking reminders

Revision ID: 20260428_0003
Revises: 20260428_0002
Create Date: 2026-04-28 02:10:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "20260428_0003"
down_revision = "20260428_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("telegram_chat_id", sa.String(length=64), nullable=True))
    op.create_unique_constraint("uq_users_telegram_chat_id", "users", ["telegram_chat_id"])
    op.alter_column("barbers", "photo_url", existing_type=sa.String(length=255), type_=sa.String(length=2048))
    op.add_column("bookings", sa.Column("reminder_sent_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("bookings", "reminder_sent_at")
    op.alter_column("barbers", "photo_url", existing_type=sa.String(length=2048), type_=sa.String(length=255))
    op.drop_constraint("uq_users_telegram_chat_id", "users", type_="unique")
    op.drop_column("users", "telegram_chat_id")
