"""user profile photo and barber media

Revision ID: 20260503_0006
Revises: 20260429_0005
Create Date: 2026-05-03 00:00:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260503_0006"
down_revision = "20260429_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("photo_url", sa.String(length=2048), nullable=True))
    op.add_column("barbers", sa.Column("media_url", sa.String(length=2048), nullable=True))


def downgrade() -> None:
    op.drop_column("barbers", "media_url")
    op.drop_column("users", "photo_url")
