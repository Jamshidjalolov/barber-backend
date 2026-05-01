"""initial schema

Revision ID: 20260428_0001
Revises:
Create Date: 2026-04-28 00:00:00
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "20260428_0001"
down_revision = None
branch_labels = None
depends_on = None

user_role_enum = sa.Enum("customer", "barber", "admin", name="user_role_enum")
booking_status_enum = sa.Enum(
    "pending",
    "accepted",
    "in_service",
    "completed",
    "rejected",
    name="booking_status_enum",
)


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("role", user_role_enum, nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("username", sa.String(length=80), nullable=True),
        sa.Column("phone", sa.String(length=24), nullable=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
        sa.UniqueConstraint("phone"),
    )
    op.create_index("ix_users_role", "users", ["role"], unique=False)

    op.create_table(
        "barbers",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("display_name", sa.String(length=120), nullable=False),
        sa.Column("specialty", sa.String(length=180), nullable=False),
        sa.Column("experience_years", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("rating", sa.Float(), nullable=False, server_default="0"),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("telegram_chat_id", sa.String(length=32), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "bookings",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("customer_user_id", sa.String(length=36), nullable=True),
        sa.Column("barber_id", sa.String(length=36), nullable=False),
        sa.Column("customer_name", sa.String(length=120), nullable=False),
        sa.Column("customer_phone", sa.String(length=24), nullable=False),
        sa.Column("service_name", sa.String(length=140), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("status", booking_status_enum, nullable=False, server_default="pending"),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("scheduled_for", sa.DateTime(timezone=True), nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejected_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["barber_id"], ["barbers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["customer_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_bookings_status", "bookings", ["status"], unique=False)
    op.create_index("ix_bookings_scheduled_for", "bookings", ["scheduled_for"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    op.drop_index("ix_bookings_scheduled_for", table_name="bookings")
    op.drop_index("ix_bookings_status", table_name="bookings")
    op.drop_table("bookings")
    op.drop_table("barbers")
    op.drop_index("ix_users_role", table_name="users")
    op.drop_table("users")
    booking_status_enum.drop(bind, checkfirst=True)
    user_role_enum.drop(bind, checkfirst=True)
