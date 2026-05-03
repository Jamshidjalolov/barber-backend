from __future__ import annotations

from pydantic import BaseModel, Field

from app.core.enums import RoleEnum


class CustomerLoginRequest(BaseModel):
    phone: str = Field(min_length=7, max_length=24)
    password: str = Field(min_length=4, max_length=64)


class CustomerRegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=7, max_length=24)
    password: str = Field(min_length=4, max_length=64)


class UsernameLoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    password: str = Field(min_length=4, max_length=64)


class AuthUserRead(BaseModel):
    id: str
    role: RoleEnum
    full_name: str
    username: str | None = None
    phone: str | None = None
    photo_url: str | None = None
    telegram_chat_id: str | None = None
    telegram_connected: bool = False
    barber_profile_id: str | None = None


class AuthUserUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    username: str | None = Field(default=None, min_length=3, max_length=80)
    phone: str | None = Field(default=None, min_length=7, max_length=24)
    password: str | None = Field(default=None, min_length=4, max_length=64)
    photo_url: str | None = Field(default=None, max_length=2048)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserRead
