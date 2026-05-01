"""add barber photo url

Revision ID: 20260428_0002
Revises: 20260428_0001
Create Date: 2026-04-28 01:00:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "20260428_0002"
down_revision = "20260428_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("barbers", sa.Column("photo_url", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("barbers", "photo_url")
