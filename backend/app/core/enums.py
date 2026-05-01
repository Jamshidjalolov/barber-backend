from __future__ import annotations

from enum import Enum


class RoleEnum(str, Enum):
    customer = "customer"
    barber = "barber"
    admin = "admin"


class BookingStatusEnum(str, Enum):
    pending = "pending"
    accepted = "accepted"
    in_service = "in_service"
    completed = "completed"
    rejected = "rejected"
