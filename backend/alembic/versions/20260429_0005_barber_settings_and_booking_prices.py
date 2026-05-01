"""barber settings and booking prices

Revision ID: 20260429_0005
Revises: 20260429_0004
Create Date: 2026-04-29 00:40:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260429_0005"
down_revision = "20260429_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("barbers", sa.Column("work_start_time", sa.String(length=5), nullable=False, server_default="09:00"))
    op.add_column("barbers", sa.Column("work_end_time", sa.String(length=5), nullable=False, server_default="18:30"))
    op.add_column("barbers", sa.Column("address", sa.String(length=255), nullable=True))
    op.add_column("barbers", sa.Column("latitude", sa.Float(), nullable=True))
    op.add_column("barbers", sa.Column("longitude", sa.Float(), nullable=True))
    op.add_column("barbers", sa.Column("price_haircut", sa.Integer(), nullable=False, server_default="60000"))
    op.add_column("barbers", sa.Column("price_fade", sa.Integer(), nullable=False, server_default="80000"))
    op.add_column("barbers", sa.Column("price_hair_beard", sa.Integer(), nullable=False, server_default="100000"))
    op.add_column("barbers", sa.Column("price_premium", sa.Integer(), nullable=False, server_default="150000"))
    op.add_column("barbers", sa.Column("price_beard", sa.Integer(), nullable=False, server_default="50000"))

    op.add_column("bookings", sa.Column("original_price", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("bookings", sa.Column("final_price", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("bookings", sa.Column("applied_discount_percent", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("bookings", "applied_discount_percent")
    op.drop_column("bookings", "final_price")
    op.drop_column("bookings", "original_price")

    op.drop_column("barbers", "price_beard")
    op.drop_column("barbers", "price_premium")
    op.drop_column("barbers", "price_hair_beard")
    op.drop_column("barbers", "price_fade")
    op.drop_column("barbers", "price_haircut")
    op.drop_column("barbers", "longitude")
    op.drop_column("barbers", "latitude")
    op.drop_column("barbers", "address")
    op.drop_column("barbers", "work_end_time")
    op.drop_column("barbers", "work_start_time")
