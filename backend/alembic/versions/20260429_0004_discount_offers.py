"""add discount offers

Revision ID: 20260429_0004
Revises: 20260428_0003
Create Date: 2026-04-29 00:10:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20260429_0004"
down_revision = "20260428_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "discount_offers",
        sa.Column("barber_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("percent", sa.Integer(), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.ForeignKeyConstraint(["barber_id"], ["barbers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_discount_offers_barber_id"), "discount_offers", ["barber_id"], unique=False)
    op.create_index(op.f("ix_discount_offers_starts_at"), "discount_offers", ["starts_at"], unique=False)
    op.create_index(op.f("ix_discount_offers_ends_at"), "discount_offers", ["ends_at"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_discount_offers_ends_at"), table_name="discount_offers")
    op.drop_index(op.f("ix_discount_offers_starts_at"), table_name="discount_offers")
    op.drop_index(op.f("ix_discount_offers_barber_id"), table_name="discount_offers")
    op.drop_table("discount_offers")
